// usage: node scripts/crop.mjs in.png out.png x y w h
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const [inp, out, x, y, w, h] = process.argv.slice(2);
const data = 'data:image/png;base64,' + fs.readFileSync(inp).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
const png = await page.evaluate(async ([src, x, y, w, h]) => {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
  return c.toDataURL('image/png');
}, [data, +x, +y, +w, +h]);
fs.writeFileSync(out, Buffer.from(png.split(',')[1], 'base64'));
await browser.close();
console.log('wrote', out);
