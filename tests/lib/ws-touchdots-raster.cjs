// Shared rasteriser for the touch-dot fitting tool and gate.
//
// Every digit is drawn by the BROWSER, in the app's self-hosted Andika with
// `font-feature-settings: "cv04" 1` (TY-4), inside a span shaped exactly like the kit's digit
// span (display:flex, centred, height 1.15 em, line-height 1). It is then captured with
// page.screenshot at deviceScaleFactor 4 and decoded back into pixels in the page. Canvas
// `fillText` is never used to draw a glyph: it cannot apply cv04, so it would fit the dots to the
// wrong 4.
//
// Coordinates are returned in em, relative to the CENTRE of the digit's line box (which is the
// centre of the kit span, because the kit span centres a 1 em line box), y growing downwards.
const { startServer, chromePath } = require('./ws-harness.cjs');
const puppeteer = require('puppeteer');

const DSF = 4;

async function openRaster({ fontPx = 100 } = {}) {
  const { server, base } = await startServer();
  const browser = await puppeteer.launch({ headless: true, executablePath: chromePath(), args: ['--no-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: DSF });
  const problems = [];
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('requestfailed', (r) => { if (!/favicon/.test(r.url())) problems.push('requestfailed ' + r.url()); });
  await page.goto(`${base}/css/fonts/andika.css`);
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${base}/css/fonts/andika.css">
<style>
 html,body{margin:0;background:#fff;color:#000}
 body{font-family:"Andika";font-synthesis:none;font-feature-settings:"cv04" 1;font-variant-numeric:lining-nums tabular-nums}
 .h{display:flex;align-items:center;justify-content:center;height:1.15em;line-height:1;position:relative}
 .bm{display:inline-block;width:0;height:0}
</style></head><body><div id="stage" style="position:absolute;left:40px;top:40px"></div></body></html>`, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await Promise.all([document.fonts.load('400 40px Andika'), document.fonts.load('700 40px Andika')]);
    await document.fonts.ready;
  });
  const ok = await page.evaluate(() => document.fonts.check('400 28px Andika') && document.fonts.check('700 28px Andika'));
  if (!ok) throw new Error('Andika webfont did not load');
  const close = async () => { await browser.close(); await new Promise((r) => server.close(r)); };
  return { page, browser, base, problems, close, fontPx };
}

/**
 * Draw `html` (one host span per digit, laid out by the caller) in the stage, then return the
 * host geometry and an ink mask of the clip rectangle.
 */
async function setStage(page, html) {
  await page.evaluate((h) => { document.getElementById('stage').innerHTML = h; }, html);
  await page.evaluate(() => document.fonts.ready);
}

/** Screenshot a CSS-px rectangle and decode it to a luminance array (device px). */
async function grab(page, clip) {
  const b64 = await page.screenshot({ clip, encoding: 'base64' });
  return page.evaluate(async (src) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const lum = new Array(c.width * c.height);
    for (let i = 0; i < lum.length; i++) lum[i] = Math.round(0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]);
    return { w: c.width, h: c.height, lum };
  }, b64);
}

/**
 * One digit, alone, in a kit-shaped span at `fontPx`: returns the ink mask (device px), the host
 * centre and the baseline, and a mapper from device px to em (centre-relative).
 */
async function rasterDigit(page, ch, { weight = 400, fontPx = 100, trackEm = 0.72 } = {}) {
  await setStage(page, `<span class="h" id="host" style="font-size:${fontPx}px;font-weight:${weight};width:${trackEm}em"><span id="inner">${ch}<i class="bm" id="bm"></i></span></span>`);
  const geo = await page.evaluate(() => {
    const h = document.getElementById('host').getBoundingClientRect();
    const b = document.getElementById('bm').getBoundingClientRect();
    return { x: h.left, y: h.top, w: h.width, h: h.height, base: b.top };
  });
  const pad = fontPx * 0.25;
  // integer CSS px so the device pixels map exactly back to em
  const clip = { x: Math.floor(geo.x - pad), y: Math.floor(geo.y - pad), width: Math.ceil(geo.w + 2 * pad), height: Math.ceil(geo.h + 2 * pad) };
  const img = await grab(page, clip);
  const cxCss = geo.x + geo.w / 2, cyCss = geo.y + geo.h / 2;
  const toEm = (px, py) => ({ x: (clip.x + px / DSF - cxCss) / fontPx, y: (clip.y + py / DSF - cyCss) / fontPx });
  const toPx = (ex, ey) => ({ x: (cxCss + ex * fontPx - clip.x) * DSF, y: (cyCss + ey * fontPx - clip.y) * DSF });
  return { img, geo, clip, fontPx, baselineEm: (geo.base - cyCss) / fontPx, toEm, toPx, pxPerEm: fontPx * DSF };
}

/** Binary ink mask (1 = ink) from a luminance image. */
const inkMask = (img, t = 128) => Uint8Array.from(img.lum, (v) => (v < t ? 1 : 0));

/** Zhang-Suen thinning. */
function skeleton(mask, w, h) {
  const m = Uint8Array.from(mask);
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : m[y * w + x]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const pass of [0, 1]) {
      const del = [];
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        if (!m[y * w + x]) continue;
        const p = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)];
        const B = p.reduce((a, b) => a + b, 0);
        if (B < 2 || B > 6) continue;
        let A = 0;
        for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) A++;
        if (A !== 1) continue;
        if (pass === 0 && (p[0] * p[2] * p[4] || p[2] * p[4] * p[6])) continue;
        if (pass === 1 && (p[0] * p[2] * p[6] || p[0] * p[4] * p[6])) continue;
        del.push(y * w + x);
      }
      if (del.length) { changed = true; del.forEach((i) => { m[i] = 0; }); }
    }
  }
  return m;
}

/** Chamfer distance transform (distance to the nearest paper pixel), in px. */
function distance(mask, w, h) {
  const INF = 1e9, d = new Float64Array(w * h);
  for (let i = 0; i < d.length; i++) d[i] = mask[i] ? INF : 0;
  const a = 1, b = Math.SQRT2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (!d[i]) continue;
    if (x > 0) d[i] = Math.min(d[i], d[i - 1] + a);
    if (y > 0) { d[i] = Math.min(d[i], d[i - w] + a); if (x > 0) d[i] = Math.min(d[i], d[i - w - 1] + b); if (x < w - 1) d[i] = Math.min(d[i], d[i - w + 1] + b); }
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x; if (!d[i]) continue;
    if (x < w - 1) d[i] = Math.min(d[i], d[i + 1] + a);
    if (y < h - 1) { d[i] = Math.min(d[i], d[i + w] + a); if (x < w - 1) d[i] = Math.min(d[i], d[i + w + 1] + b); if (x > 0) d[i] = Math.min(d[i], d[i + w - 1] + b); }
  }
  return d;
}

/** Fraction of dark pixels in a disc of radius r (px) at (cx, cy). */
function darkFraction(img, cx, cy, r, t = 128) {
  let n = 0, k = 0;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
    if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) continue;
    n++;
    if (x >= 0 && y >= 0 && x < img.w && y < img.h && img.lum[y * img.w + x] < t) k++;
  }
  return n ? k / n : 0;
}

module.exports = { DSF, openRaster, setStage, grab, rasterDigit, inkMask, skeleton, distance, darkFraction };
