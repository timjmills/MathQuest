// Touch-dot fitting tool (S1). Measures the DEFAULT Andika digits (cv04 only, TY-4) in the DOM
// and proposes / verifies the dot positions in js/modules/sheet/touchdots.js.
//
//   node tests/scripts/ws-touchdots-fit.cjs              report: glyph box, baseline, stroke,
//                                                        skeleton ends + joins, and each dot's
//                                                        distance to the stroke centre-line
//   node tests/scripts/ws-touchdots-fit.cjs --snap       also print a table with every dot snapped
//                                                        onto the skeleton (paste-ready)
//   node tests/scripts/ws-touchdots-fit.cjs --png DIR    write a debug PNG per weight: glyph, skeleton,
//                                                        0.05 em grid, ends (o), joins (x), dots
//
// The digit is drawn by the browser in a kit-shaped span and captured with page.screenshot at
// deviceScaleFactor 4 (never canvas fillText, which cannot apply cv04). Coordinates are em from
// the centre of the digit's line box, y down.
const path = require('path');
const fs = require('fs');
const { openRaster, rasterDigit, inkMask, skeleton, distance, darkFraction } = require('../lib/ws-touchdots-raster.cjs');

const args = process.argv.slice(2);
const SNAP = args.includes('--snap');
const PNG = args.includes('--png') ? args[args.indexOf('--png') + 1] : null;
const FONT_PX = 100;

(async () => {
  const td = await import(path.resolve(__dirname, '../../js/modules/sheet/touchdots.js')).catch(() => null);
  const R = await openRaster({ fontPx: FONT_PX });
  const page = R.page;
  const report = { font: 'Andika 6.200, cv04', fontPx: FONT_PX, weights: {} };
  try {
    for (const weight of [400, 700]) {
      const W = (report.weights[weight] = { digits: {} });
      const debug = [];
      for (let d = 0; d <= 9; d++) {
        const r = await rasterDigit(page, String(d), { weight, fontPx: FONT_PX });
        const { w, h } = r.img;
        const mask = inkMask(r.img);
        const sk = skeleton(mask, w, h);
        const dt = distance(mask, w, h);
        let x0 = w, y0 = h, x1 = 0, y1 = 0;
        const skPts = [], widths = [];
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (mask[i]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
          if (sk[i]) { skPts.push([x, y]); widths.push(2 * dt[i]); }
        }
        widths.sort((a, b) => a - b);
        const strokeEm = widths[Math.floor(widths.length / 2)] / r.pxPerEm;
        // crossing number: 0->1 transitions round the 8-ring (1 = end, >= 3 = join)
        const RING = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
        const cn = (x, y) => { let n = 0; for (let k = 0; k < 8; k++) { const a = sk[(y + RING[k][1]) * w + x + RING[k][0]], b = sk[(y + RING[(k + 1) % 8][1]) * w + x + RING[(k + 1) % 8][0]]; if (!a && b) n++; } return n; };
        const ends = [], joins = [];
        for (const [x, y] of skPts) { const n = cn(x, y); if (n === 1) ends.push([x, y]); else if (n >= 3) joins.push([x, y]); }
        // cluster joins that are within 0.04 em of each other
        const cl = [];
        for (const p of joins) {
          const c = cl.find((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.04 * r.pxPerEm);
          if (c) { c[0] = (c[0] * c[2] + p[0]) / (c[2] + 1); c[1] = (c[1] * c[2] + p[1]) / (c[2] + 1); c[2]++; } else cl.push([p[0], p[1], 1]);
        }
        const em = (p) => { const e = r.toEm(p[0], p[1]); return [+e.x.toFixed(3), +e.y.toFixed(3)]; };
        const box = { left: em([x0, y0])[0], top: em([x0, y0])[1], right: em([x1, y1])[0], bottom: em([x1, y1])[1] };
        const entry = { box, baseline: +r.baselineEm.toFixed(4), stroke: +strokeEm.toFixed(3), ends: ends.map(em), joins: cl.map(em) };
        // verify / snap the module's dots
        const dots = td ? td.touchDots(d, weight) : [];
        entry.dots = dots.map((p) => {
          const P = r.toPx(p.x, p.y);
          let best = null, bd = Infinity;
          for (const q of skPts) { const dd = Math.hypot(q[0] - P.x, q[1] - P.y); if (dd < bd) { bd = dd; best = q; } }
          const s = best ? em(best) : [p.x, p.y];
          return { x: p.x, y: p.y, double: !!p.double, offCentreEm: +(bd / r.pxPerEm).toFixed(3),
            ink: +darkFraction(r.img, P.x, P.y, 0.03 * r.pxPerEm).toFixed(2), snap: s };
        });
        W.digits[d] = entry;
        debug.push({ d, r, sk, ends, cl, dots: entry.dots });
      }
      if (PNG) await writeDebug(page, debug, weight, PNG);
    }
  } finally {
    await R.close();
  }
  for (const [wt, W] of Object.entries(report.weights)) {
    console.log(`\n=== weight ${wt} ===`);
    for (const [d, e] of Object.entries(W.digits)) {
      console.log(`${d}: box x ${e.box.left}..${e.box.right} y ${e.box.top}..${e.box.bottom}  baseline ${e.baseline}  stroke ${e.stroke} em`);
      console.log(`   ends  ${JSON.stringify(e.ends)}`);
      console.log(`   joins ${JSON.stringify(e.joins)}`);
      e.dots.forEach((p, i) => console.log(`   dot${i + 1}${p.double ? 'D' : ' '} (${p.x}, ${p.y})  off-centre ${p.offCentreEm} em  ink ${p.ink}  snap ${JSON.stringify(p.snap)}`));
    }
    if (SNAP) {
      console.log(`\n// snapped table, weight ${wt}`);
      for (const [d, e] of Object.entries(W.digits)) {
        console.log(`    ${d}: [${e.dots.map((p) => `P(${p.snap[0].toFixed(3)}, ${p.snap[1].toFixed(3)}${p.double ? ', 1' : ''})`).join(', ')}],`);
      }
    }
  }
  if (R.problems.length) { console.error('page errors:', R.problems); process.exit(1); }
})().catch((e) => { console.error(e); process.exit(1); });

/** One PNG per weight: every digit with its skeleton, a 0.05 em grid, ends, joins and the dots. */
async function writeDebug(page, debug, weight, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const payload = debug.map(({ d, r, sk, ends, cl, dots }) => ({
    d, w: r.img.w, h: r.img.h, lum: r.img.lum, sk: Array.from(sk), ends, joins: cl.map((c) => [c[0], c[1]]),
    dots: dots.map((p) => ({ ...r.toPx(p.x, p.y), double: p.double })),
    origin: r.toPx(0, 0), pxPerEm: r.pxPerEm,
  }));
  const url = await page.evaluate((items) => {
    const cw = items[0].w, ch = items[0].h;
    const c = document.createElement('canvas');
    c.width = cw * 5; c.height = ch * 2;
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    items.forEach((it, k) => {
      const ox = (k % 5) * cw, oy = Math.floor(k / 5) * ch;
      const im = g.createImageData(it.w, it.h);
      for (let i = 0; i < it.lum.length; i++) {
        const v = it.sk[i] ? 0 : it.lum[i] < 128 ? 200 : 255;
        im.data[i * 4] = it.sk[i] ? 255 : v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255;
      }
      g.putImageData(im, ox, oy);
      g.lineWidth = 1;
      for (let e = -0.6; e <= 0.6001; e += 0.05) {
        const major = Math.abs(Math.round(e * 10) - e * 10) < 1e-6;
        g.strokeStyle = Math.abs(e) < 1e-6 ? 'rgba(0,0,255,.8)' : major ? 'rgba(0,120,255,.35)' : 'rgba(0,120,255,.12)';
        const X = ox + it.origin.x + e * it.pxPerEm, Y = oy + it.origin.y + e * it.pxPerEm;
        g.beginPath(); g.moveTo(X, oy); g.lineTo(X, oy + it.h); g.stroke();
        g.beginPath(); g.moveTo(ox, Y); g.lineTo(ox + it.w, Y); g.stroke();
      }
      g.strokeStyle = 'green'; g.lineWidth = 3;
      it.ends.forEach(([x, y]) => { g.beginPath(); g.arc(ox + x, oy + y, 10, 0, 7); g.stroke(); });
      g.strokeStyle = 'purple';
      it.joins.forEach(([x, y]) => { g.beginPath(); g.moveTo(ox + x - 10, oy + y - 10); g.lineTo(ox + x + 10, oy + y + 10); g.moveTo(ox + x + 10, oy + y - 10); g.lineTo(ox + x - 10, oy + y + 10); g.stroke(); });
      it.dots.forEach((p, i) => {
        g.fillStyle = p.double ? 'rgba(255,140,0,.85)' : 'rgba(0,160,255,.85)';
        g.beginPath(); g.arc(ox + p.x, oy + p.y, 12, 0, 7); g.fill();
        g.fillStyle = '#000'; g.font = 'bold 22px sans-serif'; g.fillText(String(i + 1), ox + p.x + 14, oy + p.y - 8);
      });
      g.fillStyle = '#000'; g.font = 'bold 28px sans-serif'; g.fillText(String(it.d), ox + 8, oy + 30);
    });
    return c.toDataURL('image/png');
  }, payload);
  const file = path.join(dir, `touchdots-fit-${weight}.png`);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote', file);
}
