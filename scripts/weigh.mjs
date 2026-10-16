// Sums bytes transferred per resource type on first load. usage: BASE=... node scripts/weigh.mjs
import { chromium } from '@playwright/test';
const base = process.env.BASE || 'http://localhost:4321';
const browser = await chromium.launch();
for (const [label, vp] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: label === 'mobile' ? 3 : 2 });
  const page = await ctx.newPage();
  const tally = {}; const imgs = [];
  page.on('response', async (r) => {
    try { const b = await r.body(); const t = (r.headers()['content-type'] || '').split(';')[0]; tally[t] = (tally[t] || 0) + b.length; if (t.startsWith('image/')) imgs.push(`${(b.length/1024).toFixed(0)}KB ${t.slice(6)} ${new URL(r.url()).pathname.split('/').pop().slice(0, 40)}`); } catch {}
  });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { const h = document.body.scrollHeight; for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
  await page.waitForTimeout(1500);
  const total = Object.values(tally).reduce((a, b) => a + b, 0);
  console.log(`${label}: total ${(total/1024).toFixed(0)}KB`, Object.fromEntries(Object.entries(tally).map(([k, v]) => [k, (v/1024).toFixed(0) + 'KB'])));
  console.log('  images:', imgs.join(' | '));
  await ctx.close();
}
await browser.close();
