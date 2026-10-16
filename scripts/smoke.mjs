import { chromium } from '@playwright/test';
const out = process.argv[2];
const pages = ['/', '/air-conditioning/', '/refrigeration/', '/plumbing/', '/contact/'];
const browser = await chromium.launch();
for (const [label, vp] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const p of pages) {
    await page.goto((process.env.BASE || 'http://localhost:4321') + p, { waitUntil: 'load' });
    // scroll through so IntersectionObserver reveals fire, then settle
    await page.evaluate(async () => { const h = document.body.scrollHeight; for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await page.addStyleTag({ content: '[data-reveal], .hero-word { transition: none !important; animation: none !important; opacity: 1 !important; transform: none !important; }' });
    await page.waitForTimeout(600);
    const wide = await page.evaluate(() => { const vw = document.documentElement.clientWidth; return [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > vw + 1 && getComputedStyle(e).position !== 'fixed').slice(0, 3).map(e => e.tagName + '.' + String(e.className).slice(0, 40)); });
    if (wide.length) console.log('  overflowing:', wide.join(' ; '));
    const name = p === '/' ? 'home' : p.replaceAll('/', '');
    await page.screenshot({ path: `${out}/${label}-${name}.png`, fullPage: true });
    const hs = await page.evaluate(() => document.body.scrollWidth > document.documentElement.clientWidth);
    console.log(label, p, 'title=' + JSON.stringify(await page.title()), hs ? 'HORIZONTAL-SCROLL' : 'ok');
  }
  // form fallback: submit with no email configured -> should open WhatsApp
  await page.goto('http://localhost:4321/contact/', { waitUntil: 'load' });
  await page.fill('input[name=name]', 'Test Person');
  await page.fill('input[name=phone]', '+263770000000');
  await page.fill('textarea[name=message]', 'Two split units for a cluster home');
  const popup = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null);
  await page.click('button[type=submit]');
  const pop = await popup;
  console.log(label, 'form fallback popup:', pop ? pop.url().slice(0, 90) : 'NONE');
  console.log(label, 'status text:', await page.locator('#enquiry-status').textContent());
  if (label === 'mobile') {
    await page.goto('http://localhost:4321/', { waitUntil: 'load' });
    await page.click('#nav-toggle');
    await page.screenshot({ path: `${out}/mobile-menu.png` });
    console.log('mobile menu visible:', await page.locator('#nav-mobile').isVisible());
  }
  console.log(label, 'js errors:', errors.length ? errors : 'none');
  await ctx.close();
}
await browser.close();
