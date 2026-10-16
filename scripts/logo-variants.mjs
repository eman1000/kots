// Make transparent + white-knockout variants of the wordmark from the flat PNG.
// usage: node scripts/logo-variants.mjs public/images/logo.png public/images
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const [inp, outDir] = process.argv.slice(2);
const data = 'data:image/png;base64,' + fs.readFileSync(inp).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
const out = await page.evaluate(async (src) => {
  const img = new Image(); img.src = src; await img.decode();
  const w = img.width, h = img.height;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, w, h); const d = id.data;
  // 1) knock out white: alpha from "how far from white" so anti-aliased edges stay soft
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const min = Math.min(r, g, b), max = Math.max(r, g, b);
    const sat = max - min;
    if (sat < 40) { // greyish: white bg or anti-aliased edge of navy
      const dark = 255 - max; // 0 for white, up to 255 for black
      const a = Math.max(0, Math.min(255, Math.round((dark - 12) * 2.2)));
      d[i + 3] = a;
      if (a > 0 && a < 255) { d[i] = 27; d[i + 1] = 42; d[i + 2] = 99; } // edge pixels take navy, alpha carries the blend
    }
  }
  const transparent = new ImageData(new Uint8ClampedArray(d), w, h);
  // 2) white knockout: navy -> white, keep red and the lighter blue
  const d2 = new Uint8ClampedArray(d);
  for (let i = 0; i < d2.length; i += 4) {
    if (d2[i + 3] === 0) continue;
    const r = d2[i], g = d2[i + 1], b = d2[i + 2];
    const isNavy = b > r && b > g && (r + g + b) / 3 < 120; // dark blue
    if (isNavy) { d2[i] = 255; d2[i + 1] = 255; d2[i + 2] = 255; }
  }
  const white = new ImageData(d2, w, h);
  const enc = (im) => { const k = document.createElement('canvas'); k.width = w; k.height = h; k.getContext('2d').putImageData(im, 0, 0); return k.toDataURL('image/png'); };
  return { transparent: enc(transparent), white: enc(white), w, h };
}, data);
fs.writeFileSync(path.join(outDir, 'logo.png'), Buffer.from(out.transparent.split(',')[1], 'base64'));
fs.writeFileSync(path.join(outDir, 'logo-white.png'), Buffer.from(out.white.split(',')[1], 'base64'));
await browser.close();
console.log('wrote logo.png + logo-white.png', out.w + 'x' + out.h);
