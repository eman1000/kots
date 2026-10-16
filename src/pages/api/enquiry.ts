import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { site } from '../../site';

export const prerender = false;

const MAX = { name: 120, phone: 40, service: 60, area: 120, message: 2000 } as const;
type Field = keyof typeof MAX;

// Strip control characters and cap length; the body is untrusted input.
const clean = (v: unknown, field: Field) =>
  String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, MAX[field]);

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request' }, 400);
  }

  // Honeypot filled => bot. Pretend success so it learns nothing.
  if (typeof raw.website === 'string' && raw.website.trim()) return json({ ok: true });

  const name = clean(raw.name, 'name');
  const phone = clean(raw.phone, 'phone');
  const service = clean(raw.service, 'service');
  const area = clean(raw.area, 'area');
  const message = clean(raw.message, 'message');
  if (!name || !phone || !message) return json({ ok: false, error: 'Name, phone and message are required' }, 400);

  const apiKey = getSecret('RESEND_API_KEY');
  const to = getSecret('ENQUIRY_TO') || site.email;
  const from = getSecret('ENQUIRY_FROM') || `KOTS Website <onboarding@resend.dev>`;
  if (!apiKey) return json({ ok: false, error: 'Email not configured' }, 503);

  const subject = `Website enquiry: ${service || 'General'} — ${name}`;
  const text = `New enquiry from ${site.domain}\n\nName: ${name}\nPhone: ${phone}\nService: ${service}\nArea: ${area || '-'}\n\n${message}\n`;
  const html = `<p><strong>New enquiry from ${esc(site.domain)}</strong></p>
<table cellpadding="4">
<tr><td><b>Name</b></td><td>${esc(name)}</td></tr>
<tr><td><b>Phone</b></td><td><a href="tel:${esc(phone)}">${esc(phone)}</a></td></tr>
<tr><td><b>Service</b></td><td>${esc(service)}</td></tr>
<tr><td><b>Area</b></td><td>${esc(area || '-')}</td></tr>
</table>
<p style="white-space:pre-wrap">${esc(message)}</p>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
  });
  if (!r.ok) {
    console.error('resend failed', r.status, await r.text().catch(() => ''));
    return json({ ok: false, error: 'Could not send' }, 502);
  }
  return json({ ok: true });
};
