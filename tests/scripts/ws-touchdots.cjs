// GATE (S1): touch dots sit on the strokes, never merge, clear their neighbours, count right and
// never move anything.
//   node tests/scripts/ws-touchdots.cjs            prints ws-touchdots: OK / FAIL
//   node tests/scripts/ws-touchdots.cjs --verbose  also prints every measurement
//   node tests/scripts/ws-touchdots.cjs --size L   checks another mark size (default: TOUCH_DOT_DEFAULT)
//
// Every digit is drawn by the browser in the app's self-hosted Andika with cv04 (TY-4) and
// captured at deviceScaleFactor 4 (tests/lib/ws-touchdots-raster.cjs); never canvas fillText.
//
// Checks, for digits 0-9, Regular and Bold, at 24 / 28 / 36 pt (paper) and 40 / 48 / 56 px (screen):
//   ON INK     every dot centre is on the stroke: >= 60 % dark in a disc of radius 0.03 em
//   NO MERGE   black-edge to black-edge gap between any two marks (ring outer edge for a double;
//              a single's white keyline counts as gap)
//              >= 0.6 x the counted-dot diameter (the solid dot a pupil touches; for a pair, the
//              smaller one), AND at raster the overlay alone splits into exactly d separate ink
//              blobs (a single is 1 blob, a double is 2: ring + centre dot), so no gap has closed
//   COUNT      touchDotCount(d) = d, the touch order has d steps, doubles come first
//   NEIGHBOURS in a fact's 0.72 em tracks, no mark of a digit touches the next digit's ink
//              (pixel test at the smallest sizes, every pair) and marks of two dotted neighbours
//              keep the no-merge gap (geometry, every size)
//   LAYOUT     a kit fact and stack render with identical boxes with and without the overlay
const path = require('path');
const { openRaster, setStage, grab, rasterDigit, inkMask, darkFraction, DSF } = require('../lib/ws-touchdots-raster.cjs');

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');
const PT = [24, 28, 36];
const PX = [40, 48, 56];
const TRACK = 0.72; // TY-22: fact digit tracks (the narrowest the kit uses)

/** Count 8-connected dark components in a luminance image. */
function components(img, t = 128) {
  const { w, h, lum } = img;
  const seen = new Uint8Array(w * h);
  let n = 0;
  const stack = [];
  for (let i = 0; i < w * h; i++) {
    if (seen[i] || lum[i] >= t) continue;
    let size = 0;
    n++; seen[i] = 1; stack.push(i);
    while (stack.length) {
      const k = stack.pop(); size++;
      const x = k % w, y = (k - x) / w;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const X = x + dx, Y = y + dy;
        if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
        const j = Y * w + X;
        if (!seen[j] && lum[j] < t) { seen[j] = 1; stack.push(j); }
      }
    }
    if (size < 3) n--; // ignore anti-alias specks
  }
  return n;
}

(async () => {
  const td = await import(path.resolve(__dirname, '../../js/modules/sheet/touchdots.js'));
  const SIZE = args.includes('--size') ? args[args.indexOf('--size') + 1] : td.TOUCH_DOT_DEFAULT;
  const fails = [];
  const log = (s) => { if (VERBOSE) console.log(s); };
  const fail = (s) => fails.push(s);

  // ---------------------------------------------------------------- COUNT (pure)
  for (let d = 0; d <= 9; d++) {
    if (td.touchDotCount(d) !== d) fail(`count: ${d} makes ${td.touchDotCount(d)}`);
    const order = td.touchDotOrder(d);
    if (order.length !== d || order.some((t, i) => t.say !== i + 1)) fail(`order: ${d} has ${order.length} steps`);
    for (const wt of [400, 700]) {
      const dots = td.touchDots(d, wt);
      const firstSingle = dots.findIndex((p) => !p.double);
      if (firstSingle >= 0 && dots.slice(firstSingle).some((p) => p.double)) fail(`order: ${d} (${wt}) has a double after a single`);
      if (d <= 5 && dots.some((p) => p.double)) fail(`${d} (${wt}) has a double dot (1-5 are singles only)`);
      if (d >= 6 && !dots.some((p) => p.double)) fail(`${d} (${wt}) has no double dot`);
    }
  }
  if (td.touchDotsFits(23.9, 'pt') || !td.touchDotsFits(24, 'pt') || td.touchDotsFits(39, 'px') || !td.touchDotsFits(40, 'px')) fail('touchDotsFits: minimum sizes are not 24 pt / 40 px');

  const sizes = [...PT.map((v) => ({ v, unit: 'pt', px: (v * 96) / 72 })), ...PX.map((v) => ({ v, unit: 'px', px: v }))];
  // the black edge of a mark: a keyline is white, so it belongs to the gap, not the mark
  const outer = (p, g) => (p.double ? g.ringR : g.dotR);
  const counted = (p, g) => (p.double ? 2 * g.innerR : 2 * g.dotR);

  const R = await openRaster();
  const page = R.page;
  let checks = 0;
  try {
    const base = R.base;
    await page.addStyleTag({ url: `${base}/css/sheet-kit.css` });
    await page.evaluate(async (b) => { window.__td = await import(`${b}/js/modules/sheet/touchdots.js`); window.__kit = await import(`${b}/js/modules/sheet/index.js`); }, base);

    for (const wt of [400, 700]) {
      const boxes = {};
      for (const S of sizes) {
        const geo = td.touchDotGeometry({ em: S.v, unit: S.unit, size: SIZE });
        for (let d = 0; d <= 9; d++) {
          const dots = td.touchDots(d, wt);
          const r = await rasterDigit(page, String(d), { weight: wt, fontPx: S.px });
          // ON INK
          for (const [i, p] of dots.entries()) {
            const P = r.toPx(p.x, p.y);
            const f = darkFraction(r.img, P.x, P.y, 0.03 * r.pxPerEm);
            checks++;
            log(`ink ${d} w${wt} ${S.v}${S.unit} dot${i + 1}: ${(f * 100).toFixed(0)}%`);
            if (f < 0.6) fail(`on-ink: ${d} (${wt}) at ${S.v} ${S.unit}, dot ${i + 1} is ${(f * 100).toFixed(0)}% dark`);
          }
          // NO MERGE (geometry)
          for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
            const a = dots[i], b = dots[j];
            const gap = Math.hypot(a.x - b.x, a.y - b.y) - outer(a, geo) - outer(b, geo);
            const need = 0.6 * Math.min(counted(a, geo), counted(b, geo));
            checks++;
            log(`gap ${d} w${wt} ${S.v}${S.unit} ${i + 1}-${j + 1}: ${gap.toFixed(3)} em (need ${need.toFixed(3)})`);
            if (gap < need) fail(`merge: ${d} (${wt}) at ${S.v} ${S.unit}, marks ${i + 1} and ${j + 1}: gap ${gap.toFixed(3)} em < ${need.toFixed(3)} em`);
          }
          // NO MERGE (raster): the overlay alone, glyph hidden
          if (dots.length) {
            await setStage(page, `<span class="h ws-td" id="host" style="font-size:${S.px}px;font-weight:${wt};width:${TRACK}em;color:transparent">${d}${td.touchDotsSVG(d, { em: S.v, unit: S.unit, weight: wt, size: SIZE })}</span>`);
            const rect = await page.evaluate(() => { const b = document.getElementById('host').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
            const pad = S.px * 0.3;
            const img = await grab(page, { x: rect.x - pad, y: rect.y - pad, width: rect.w + 2 * pad, height: rect.h + 2 * pad });
            const n = components(img);
            checks++;
            log(`blobs ${d} w${wt} ${S.v}${S.unit}: ${n}`);
            if (n !== d) fail(`raster: ${d} (${wt}) at ${S.v} ${S.unit} draws ${n} separate marks, expected ${d} (a gap closed or a mark split)`);
          }
          if (S.v === 24 && S.unit === 'pt') {
            const m = inkMask(r.img);
            let x0 = Infinity, x1 = -Infinity;
            for (let y = 0; y < r.img.h; y++) for (let x = 0; x < r.img.w; x++) if (m[y * r.img.w + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
            boxes[d] = { left: r.toEm(x0, 0).x, right: r.toEm(x1, 0).x };
          }
        }
        // NEIGHBOURS (geometry, every size): marks vs the neighbour's glyph box and marks
        for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++) {
          const A = td.touchDots(a, wt), B = td.touchDots(b, wt);
          const maxA = Math.max(-Infinity, ...A.map((p) => p.x + outer(p, geo)));
          const minB = Math.min(Infinity, ...B.map((p) => p.x - outer(p, geo)));
          checks++;
          if (A.length && boxes[b] && maxA > TRACK + boxes[b].left - 0.02) fail(`neighbour: marks of ${a} reach the ${b} beside it (${wt}, ${S.v} ${S.unit})`);
          if (B.length && boxes[a] && minB < -TRACK + boxes[a].right + 0.02) fail(`neighbour: marks of ${b} reach the ${a} before it (${wt}, ${S.v} ${S.unit})`);
          for (const p of A) for (const q of B) {
            const gap = Math.hypot(TRACK + q.x - p.x, q.y - p.y) - outer(p, geo) - outer(q, geo);
            if (gap < 0.6 * Math.min(counted(p, geo), counted(q, geo))) fail(`neighbour: ${a}${b} marks merge across the track (${wt}, ${S.v} ${S.unit})`);
          }
        }
      }
      // NEIGHBOURS (pixels, smallest paper and screen size, every pair): the left digit's marks
      // over the right digit's ink, and the right digit's marks over the left digit's ink.
      for (const S of [sizes[0], sizes[3]]) {
        const pairs = [];
        for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++) pairs.push([a, b]);
        const html = (mode) => pairs.map(([a, b]) => {
          const o = { em: S.v, unit: S.unit, weight: wt, size: SIZE };
          const L = mode === 'marksL' ? `<span class="h ws-td" style="width:${TRACK}em;color:transparent">${a}${td.touchDotsSVG(a, o)}</span>` : mode === 'inkL' ? `<span class="h">${a}</span>` : `<span class="h" style="color:transparent">${a}</span>`;
          const Rr = mode === 'marksR' ? `<span class="h ws-td" style="width:${TRACK}em;color:transparent">${b}${td.touchDotsSVG(b, o)}</span>` : mode === 'inkR' ? `<span class="h">${b}</span>` : `<span class="h" style="color:transparent">${b}</span>`;
          return `<div style="display:grid;grid-template-columns:repeat(2,${TRACK}em);margin:0 0.6em 0.5em 0">${L}${Rr}</div>`;
        }).join('');
        const shot = async (mode) => {
          await setStage(page, `<div id="pairs" style="display:flex;flex-wrap:wrap;width:${Math.round(S.px * 20)}px;font-size:${S.px}px;font-weight:${wt}">${html(mode)}</div>`);
          const b = await page.evaluate(() => { const r = document.getElementById('pairs').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
          await page.setViewport({ width: Math.ceil(b.x + b.width + 40), height: Math.ceil(b.y + b.height + 40), deviceScaleFactor: 2 });
          return grab(page, b);
        };
        const overlap = (m1, m2) => { let n = 0; for (let i = 0; i < m1.lum.length; i++) if (m1.lum[i] < 128 && m2.lum[i] < 128) n++; return n; };
        const [mL, iR, mR, iL] = [await shot('marksL'), await shot('inkR'), await shot('marksR'), await shot('inkL')];
        await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: DSF });
        const o1 = overlap(mL, iR), o2 = overlap(mR, iL);
        checks += 2;
        log(`neighbour pixels w${wt} ${S.v}${S.unit}: ${o1} / ${o2}`);
        if (o1 || o2) fail(`neighbour: at ${S.v} ${S.unit} (${wt}) marks touch the next digit's ink (${o1 + o2} px)`);
      }
    }

    // ---------------------------------------------------------------- LAYOUT
    const shift = await page.evaluate(() => {
      const { fact, stack } = window.__kit;
      const { touchDotsSVG } = window.__td;
      const stage = document.getElementById('stage');
      const rects = (root) => [...root.querySelectorAll('*')].filter((e) => !e.closest('svg')).map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 100) / 100).join(','); });
      const build = (dots) => {
        const f = fact(78, 96, '+', { pt: 28 });
        stage.innerHTML = `<div class="ws-sheet ws-L ws-ican" style="width:186mm"><div class="ws-grid" style="flex:none;grid-template-columns:repeat(2,1fr)">`
          + `<div class="ws-cell ${f.cls}" style="${f.style}">${f.html}</div><div class="ws-cell">${stack(47, 38, '+', { answer: 'open' })}</div></div></div>`;
        if (dots) stage.querySelectorAll('.ws-fact > span, .ws-stack > span').forEach((s) => {
          const ch = s.textContent.trim();
          if (/^[0-9]$/.test(ch)) { s.classList.add('ws-td'); s.insertAdjacentHTML('beforeend', touchDotsSVG(ch, { em: 28 })); }
        });
        return rects(stage);
      };
      const a = build(false), b = build(true);
      return { same: a.length === b.length && a.every((v, i) => v === b[i]), n: a.length };
    });
    checks++;
    if (!shift.same) fail('layout: the overlay moved something in a kit fact or stack');
    log(`layout: ${shift.n} boxes compared, identical: ${shift.same}`);

    // ---------------------------------------------------------------- SCREEN (the specimen card)
    for (const w of [390, 1280]) {
      await page.setViewport({ width: w, height: 800, deviceScaleFactor: 1 });
      await page.goto(`${base}/design/specimens/touch-dots-card.html?w=${w}&fact=3%2B5&on=ab`, { waitUntil: 'networkidle0' });
      await page.waitForFunction(() => window.__ready === true, { timeout: 15000 });
      const hits = await page.evaluate(() => window.__td.hits());
      checks++;
      if (!hits.length || hits.some((h) => h.w < 44 || h.h < 44)) fail(`screen ${w}: a touch target is under 44 x 44 px (${JSON.stringify(hits)})`);
      const btn = await page.$$('.td-hit');
      for (let i = 0; i < 3; i++) await btn[0].click();
      const t3 = await page.evaluate(() => window.__td.total());
      for (let i = 0; i < 5; i++) await btn[0].click(); // 3 has only three touches: extra taps do nothing
      const t3b = await page.evaluate(() => window.__td.total());
      await page.click('#again');
      const t0 = await page.evaluate(() => window.__td.total());
      const scroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      checks++;
      log(`screen ${w}: hits ${JSON.stringify(hits)}, taps -> ${t3}, ${t3b}, again -> ${t0}, h-scroll ${scroll}`);
      if (t3 !== 3 || t3b !== 3 || t0 !== 0) fail(`screen ${w}: taps counted ${t3}/${t3b}, Start again left ${t0}`);
      if (scroll) fail(`screen ${w}: horizontal page scroll`);
    }
  } finally {
    await R.close();
  }
  if (R.problems.length) fail(`page errors: ${R.problems.join(' | ')}`);
  if (fails.length) {
    console.error(`ws-touchdots: FAIL (size ${SIZE}, ${fails.length} of ${checks} checks)`);
    fails.slice(0, 60).forEach((f) => console.error('  - ' + f));
    if (fails.length > 60) console.error(`  … and ${fails.length - 60} more`);
    process.exit(1);
  }
  console.log(`ws-touchdots: OK (size ${SIZE}, ${checks} checks: 10 digits x 2 weights x 6 sizes, 100 neighbour pairs, layout)`);
})().catch((e) => { console.error('ws-touchdots: FAIL'); console.error(e); process.exit(1); });
