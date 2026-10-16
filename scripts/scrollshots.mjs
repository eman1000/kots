// Screenshots the home page at several scroll positions so pinned/scrubbed
// GSAP sections can be checked. usage: node scripts/scrollshots.mjs outDir
import { chromium } from '@playwright/test';
const out = process.argv[2];
const browser = await chromium.launch();
for (const [label, vp] of [['d', { width: 1280, height: 800 }], ['m', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto((process.env.BASE || 'http://localhost:4321') + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const y = Math.round((total * i) / steps);
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${out}/${label}-${String(i).padStart(2, '0')}.png` });
  }
  console.log(label, 'scrollable px:', total, 'errors:', errors.length ? errors : 'none');
  await page.close();
}
await browser.close();
