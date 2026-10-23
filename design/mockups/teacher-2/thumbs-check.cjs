// Teacher site 2.0 T1: every live skill's thumbnail must show that skill (critic r1 C1: "Find the Start" was drawn as an
// addition, place-value skills as facts, every Maths words card the same). A machine check, not a look:
//   node design/mockups/teacher-2/thumbs-check.cjs          prints the drawing used per category; exit 1 on any failure
// Rules: every live skill gets a named drawing (never a fallback); a skill's drawing agrees with its name (subtraction never
// draws an addition and back, word problems draw a story of the right operation, start-unknown draws a start-unknown story,
// place value draws place value, time draws a clock, fractions draw fractions, …); every Maths words card is different.
// thumbs.html shows every thumbnail for a look by eye.
'use strict';
const path = require('path');
global.window = global;
require(path.join(__dirname, 'data.js'));
require(path.join(__dirname, 'thumbs.js'));
const D = window.MQ_DATA, T = window.MQThumbs;

const ADD = new Set(['eq-add', 'stack-add', 'story-add', 'pics-add', 'nl-add', 'missing-addend', 'stack-add-missing', 'add-three', 'stack-add-multi']);
const SUB = new Set(['eq-sub', 'stack-sub', 'story-sub', 'pics-sub', 'nl-sub', 'stack-sub-missing', 'stack-sub-zeros', 'story-sub-start', 'missing-sub', 'sub-check']);
const fails = []; const byCat = {}; const svgs = {};
const fail = (s, k, why) => fails.push(`${s.c}:${s.v} (“${s.l}”) drew ${k}: ${why}`);
for (const s of D.skills) {
  const k = T.kindOf(s); const out = T.draw(s, 1); const v = s.v, L = s.l.toLowerCase();
  (byCat[s.c] = byCat[s.c] || {})[k] = ((byCat[s.c] || {})[k] || 0) + 1;
  if (k === 'unknown' || !out || !/^<svg/.test(out)) { fail(s, k, 'no drawing'); continue; }
  if (/NaN|undefined/.test(out)) fail(s, k, 'NaN or undefined in the drawing');
  const pool = k.startsWith('pool-');
  if (s.c === 'subtraction' && !pool && ADD.has(k)) fail(s, k, 'a subtraction skill drawn as an addition');
  if (s.c === 'addition' && !pool && SUB.has(k)) fail(s, k, 'an addition skill drawn as a subtraction');
  if (/word_problems|_wp_|_wp$|wp_\d|word$/.test(v) && !/^story-/.test(k)) fail(s, k, 'a word-problem skill without a story');
  if (/start/.test(v) && /wp/.test(v) && k !== 'story-sub-start') fail(s, k, 'a start-unknown story must show the start missing');
  if (/compare/.test(v) && /wp/.test(v) && k !== 'story-compare') fail(s, k, 'a compare story must compare two amounts');
  if (s.c === 'subtraction' && /story/.test(k) && !/sub|compare/.test(k)) fail(s, k, 'a subtraction story must take away, compare or find the start');
  if (s.c === 'multiplication' && /story/.test(k) && !/mult/.test(k)) fail(s, k, 'a multiplication story must multiply');
  if (s.c === 'division' && /story/.test(k) && !/div|remainder/.test(k)) fail(s, k, 'a division story must divide');
  if (s.c === 'placevalue' && !/^pv-|^pool-placevalue/.test(k)) fail(s, k, 'a place-value skill must draw place value');
  if (/place.?value|unit form|expanded/i.test(s.l) && !/^pv-|pool-|^rods|^flats/.test(k)) fail(s, k, 'its name says place value');
  if (/^time_|clock/.test(v) && !/clock|digital|am-pm/.test(k)) fail(s, k, 'a time skill must draw a clock or a time');
  if ((s.c === 'fractions' || s.c === 'fraction_operations') && !/^frac|^story-frac|^pool-fraction/.test(k)) fail(s, k, 'a fraction skill must draw fractions');
  if (s.c === 'vocabulary' && k !== 'words') fail(s, k, 'a Maths words skill must draw its words');
  if (/money|coin|notes/.test(v) && !/coins|notes|money/.test(k)) fail(s, k, 'a money skill must draw money');
  if (s.c === 'graphs' && !/tally|pictograph|line-plot|pie|bar-graph|pool-graphs/.test(k)) fail(s, k, 'a graph skill must draw its graph');
  if (/^count_by_|^seq_\d/.test(v) && k !== 'skip-count') fail(s, k, 'a count-by skill must draw the count');
  if (s.c === 'vocabulary') { if (svgs[out]) fail(s, k, `the same picture as ${svgs[out]}`); svgs[out] = v; }
}
// fix round 2 (critic r2 C2): variants show their variant. A "(Visual)" / "with Pictures" skill draws a picture; a
// "(No Pictures)" / "(No Visuals)" twin draws none where its pictured twin does, and the two never draw the same thing.
const byId = Object.fromEntries(D.skills.map(s => [s.c + ':' + s.v, s]));
for (const s of D.skills) {
  const out = T.draw(s, 1);
  if (/\(visual|with pictures|visual pizza/i.test(s.l) && !T.picCount(out)) fail(s, T.kindOf(s), 'a Visual skill with no picture');
  if (/no pictures|no visuals/i.test(s.l)) {
    const twin = byId[s.c + ':' + s.v.replace(/_plain$|_nv$/, '')] || byId[s.c + ':' + s.v.replace(/_nv$/, '_visual')];
    if (twin) { const t = T.draw(twin, 1); if (t === out) fail(s, T.kindOf(s), `draws the same as its pictured twin ${twin.v}`); if (T.picCount(t) <= T.picCount(out)) fail(s, T.kindOf(s), `has as much picture as its pictured twin ${twin.v}`); }
  }
  if (/^story-/.test(T.kindOf(s)) && !/no pictures/i.test(s.l) && T.draw(s, 1, { pictures: false }) === out) fail(s, T.kindOf(s), 'Pictures off draws the same as Pictures on');
}
// the same skill must draw the same kind with every seed, and a different item with a different seed
for (const s of D.skills.slice(0, 120)) if (T.draw(s, 1) === T.draw(s, 2) && T.draw(s, 2) === T.draw(s, 3) && !/words|shape|solid|compose|lines|symmetry|net|pie|box-plot|stat|spinner|attributes|classify|area-|positions|balance|jug|thermo|ruler|frac-|story-frac|story-convert|convert-|fdp|am-pm|digital|money-words|clock-parts|clock-fives|clock-order|length|nonstandard|oop-compare|div-sort|double-nl|inequality|transform|coord-polygon|volume|partition|pv-words|stat-question/.test(T.kindOf(s))) fails.push(`${s.c}:${s.v} draws the same item for every seed (New numbers would not change it)`);

// fix round 3 (critic r3 C1, stop rule §1.7: the decoy picture survived r2 #6 and r3 #2). A picture ADDED to a problem
// (draw() differs from the bare drawing, base()) must be drawn FROM that problem: every added picture is a
// <g data-pic="type" data-vals="…"> group; every value it declares and every number written inside it is a number of the
// problem's own text; the counters, crossed-out counters, parts and shaded parts it draws are the counts it declares; and
// the type's own sum holds (a + b counters for an addition story, a counters with b crossed out for a take-away, n of d
// parts shaded for n/d …). A picture without data, or with a number the problem does not have, is a decoy and fails.
const SEEDS = [1, 2, 3, 'a', 'b'];
const numsOf = (str) => (str.replace(/(\d),(?=\d{3})/g, '$1').match(/\d+(?:\.\d+)?/g) || []).map(String);
const countIn = (g, re) => (g.match(re) || []).length;
let picN = 0; const picTypes = {};
function checkPic(s, seed, out) {
  const groups = []; const re = /<g data-pic="([^"]+)"([^>]*)>/g; let m;
  while ((m = re.exec(out))) {
    // the group's own markup: from its open tag to its matching </g>
    let depth = 0, i = m.index, end = -1; const tag = /<g\b|<\/g>/g; tag.lastIndex = i;
    for (let t; (t = tag.exec(out));) { if (t[0] === '</g>') { depth--; if (!depth) { end = tag.lastIndex; break; } } else depth++; }
    groups.push({ type: m[1], attrs: m[2], body: out.slice(m.index, end), start: m.index, end });
  }
  const where = `${s.c}:${s.v} (“${s.l}”) seed ${seed}`;
  if (!groups.length) { fails.push(`${where}: an added picture without data-pic (a decoy: not drawn from the problem)`); return; }
  let text = out; for (const g of groups.slice().reverse()) text = text.slice(0, g.start) + text.slice(g.end);
  const problem = numsOf(text.replace(/<[^>]+>/g, ' '));
  for (const g of groups) {
    picN++; picTypes[g.type] = (picTypes[g.type] || 0) + 1;
    const at = (k) => { const x = g.attrs.match(new RegExp(` data-${k}="([^"]*)"`)); return x ? x[1] : null; };
    const vals = (at('vals') || '').split(',').filter(Boolean);
    const bad = (why) => fails.push(`${where}: picture ${g.type} ${why} (problem numbers: ${problem.join(' ') || 'none'})`);
    if (!vals.length) bad('declares no values');
    for (const v of vals) if (!problem.includes(v)) bad(`shows ${v}, which is not in the problem`);
    // a number line may also write the two tenths either side of the problem's number (the rule below checks they are)
    const ends = g.type === 'numline' ? [at('from'), at('to')] : [];
    for (const v of numsOf(g.body.replace(/<[^>]+>/g, ' '))) if (!problem.includes(v) && !ends.includes(v)) bad(`writes ${v}, which is not in the problem`);
    const V = vals.map(Number);
    const counters = countIn(g.body, /<circle\b[^>]*class="ctr"/g), crossed = countIn(g.body, /class="x"/g);
    const cells = countIn(g.body, /class="pp"/g), shaded = countIn(g.body, /class="pp"[^>]*fill="#949494"|fill="#949494"[^>]*class="pp"/g);
    const want = { count: at('count'), x: at('x'), cells: at('cells'), shaded: at('shaded') };
    if (want.count !== null && Number(want.count) !== counters) bad(`declares ${want.count} counters, draws ${counters}`);
    if (want.x !== null && Number(want.x) !== crossed) bad(`declares ${want.x} crossed out, draws ${crossed}`);
    if (want.cells !== null && Number(want.cells) !== cells) bad(`declares ${want.cells} parts, draws ${cells}`);
    if (want.shaded !== null && Number(want.shaded) !== shaded) bad(`declares ${want.shaded} shaded, draws ${shaded}`);
    const rule = {
      'counters-add': () => counters === V[0] + V[1],                 // a and b, in two groups
      'counters-take': () => counters === V[0] && crossed === V[1],     // a, with b crossed out
      'counters-compare': () => counters === V[0] + V[1],             // two rows to compare
      'groups': () => counters === V[0] * V[1],                       // a groups of b
      'array': () => cells === V[0] * V[1],                           // rows × columns
      'rows-of': () => counters === V[0],                             // N counters in rows of b
      'frac': () => cells === V[1] && shaded === V[0],                // n of d
      'frac-improper': () => cells === Math.ceil(V[0] / V[1]) * V[1] && shaded === V[0],
      'frac-mixed': () => cells === (V[0] + 1) * V[2] && shaded === V[0] * V[2] + V[1],
      'frac-copies': () => cells === V[0] * V[2] && shaded === V[0] * V[1],   // k copies of n/d
      'wholes': () => cells === V[0] * V[1] && shaded === 0,           // a wholes cut into b parts
      'frac-area': () => cells === V[1] * V[3] && shaded === V[0] * V[2],
      'frac-of-amount': () => cells === V[1] && shaded === V[0],      // n/d of a whole labelled with the amount
      'pairs': () => countIn(g.body, /class="rod"/g) * 10 + counters === V[0],
      'units': () => cells === V[0],                                  // a length of a units
      'boxes': () => cells === V[1],                                  // b boxes of a, then c away
      'bar': () => cells >= 2,                                        // a bar model, labelled from the problem
      'track': () => cells >= vals.length,
      'numline': () => { const at0 = Number(at('at')); return problem.includes(at('at')) && Math.floor(at0 * 10 + 1e-9) / 10 === Number(at('from')) && Number(at('to')) === Math.round((Number(at('from')) + 0.1) * 10) / 10; },
      'shape': () => true,
    }[g.type];
    if (!rule) bad('is not a known picture type');
    else if (!rule()) bad(`does not draw its own numbers (${g.attrs.trim()}; ${counters} counters, ${crossed} crossed, ${cells} parts, ${shaded} shaded)`);
  }
}
for (const s of D.skills) for (const seed of SEEDS) {
  const out = T.draw(s, seed); const bare = T.base ? T.base(s, seed) : out;
  if (out !== bare || /data-pic=/.test(out)) checkPic(s, seed, out);
}
// critic r3 C2: the MAP "Circle the Even or Odd Numbers" (select_even_odd) drew a number bond and base-ten blocks
for (const s of D.skills) if (/even_odd|odd_even/.test(s.v) && !/odd-even/.test(T.kindOf(s))) fail(s, T.kindOf(s), 'an odd / even skill must draw odd and even numbers');

for (const [c, kinds] of Object.entries(byCat)) console.log(`${c.padEnd(20)} ${Object.entries(kinds).map(([k, n]) => `${k}${n > 1 ? ' ×' + n : ''}`).join(', ')}`);
const kinds = new Set(D.skills.map(s => T.kindOf(s)));
console.log(`\n${D.skills.length} live skills · ${kinds.size} different drawings · ${Object.keys(svgs).length} Maths words cards, all different`);
console.log(`${picN} added pictures checked against their problems (${SEEDS.length} seeds): ${Object.entries(picTypes).map(([k, n]) => `${k} ${n}`).join(', ') || 'none'}`);

// fix round 3 (critic r3 C2): in a browser, every thumbnail of every live skill (5 seeds) keeps all of its drawing inside
// its own picture (nothing past the edge of the paper), and no text sits partly under an answer box or a part
// (text wholly inside its box is fine: T / F pills, labels in a bar). Measured on the rendered SVG, transforms included.
(async () => {
  let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
  const fs = require('fs');
  const { startServer } = require('../../../tests/lib/ws-harness.cjs');
  const { server, base } = await startServer();
  const browser = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  let geo = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    await page.goto(`${base}/design/mockups/teacher-2/thumbs.html?q=zzzz`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    geo = await page.evaluate((SEEDS) => {
      const out = []; const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:0;top:0'; document.body.appendChild(host);
      for (const s of MQ_DATA.skills) for (const seed of SEEDS) {
        host.innerHTML = MQThumbs.draw(s, seed); const svg = host.querySelector('svg'); if (!svg) continue;
        const R = svg.getBoundingClientRect(); const probs = [];
        const leaves = [...svg.querySelectorAll('text, rect, circle, ellipse, line, path, polygon, polyline')];
        for (const el of leaves) {
          const b = el.getBoundingClientRect(); if (!b.width && !b.height) continue;
          const sw = el.tagName === 'text' ? 0 : 1.5;   // half a stroke may touch the edge
          if (b.left < R.left - sw - 1 || b.top < R.top - sw - 1 || b.right > R.right + sw + 1 || b.bottom > R.bottom + sw + 1) { probs.push(`${el.tagName}${el.tagName === 'text' ? ' “' + el.textContent.slice(0, 12) + '”' : ''} past the edge by ${Math.round(Math.max(R.left - b.left, R.top - b.top, b.right - R.right, b.bottom - R.bottom))}px`); break; }
        }
        // text partly under a box: answer boxes and parts are rects (or rounded pills) smaller than 90 × 70
        const texts = [...svg.querySelectorAll('text')].map(t => ({ t: t.textContent, b: t.getBoundingClientRect() }));
        const boxes = [...svg.querySelectorAll('rect')].map(r => r.getBoundingClientRect()).filter(b => b.width < 90 && b.height < 70 && b.width > 6 && b.height > 6);
        outer: for (const { t, b } of texts) {
          // the glyph box of SVG text includes the line's ascent/descent; use the inner 70 % height (the ink)
          const tb = { left: b.left + 1, right: b.right - 1, top: b.top + b.height * 0.18, bottom: b.bottom - b.height * 0.12 };
          for (const r of boxes) {
            const ox = Math.min(tb.right, r.right) - Math.max(tb.left, r.left), oy = Math.min(tb.bottom, r.bottom) - Math.max(tb.top, r.top);
            const inside = tb.left >= r.left - 1 && tb.right <= r.right + 1 && tb.top >= r.top - 2 && tb.bottom <= r.bottom + 2;
            if (ox > 2 && oy > 2 && !inside) { probs.push(`text “${t.slice(0, 14)}” partly under a box (${Math.round(ox)}×${Math.round(oy)}px)`); break outer; }
          }
        }
        if (probs.length) { out.push(`${s.c}:${s.v} (“${s.l}”) seed ${seed}: ${probs.join('; ')}`); }
      }
      host.remove(); return out;
    }, SEEDS);
  } finally { await browser.close(); server.close(); }
  const geoSkills = new Set(geo.map(x => x.split(' ')[0]));
  console.log(`bounds and overlap: ${D.skills.length} skills × ${SEEDS.length} seeds drawn in a browser, ${geoSkills.size} skills with a problem`);
  geo.forEach(x => fails.push(x));
  // one line per skill and defect (the seeds it showed in are counted, not repeated)
  const once = new Map(); for (const f of fails) { const k = f.replace(/ seed \S+:/, ':'); once.set(k, (once.get(k) || 0) + 1); }
  const lines = [...once].map(([k, n]) => k + (n > 1 ? `  [${n} seeds]` : ''));
  if (lines.length) { console.log(`\nthumbs-check: FAIL (${new Set(lines.map(l => l.split(' ')[0])).size} skills)`); lines.slice(0, 150).forEach(f => console.log('  ' + f)); if (lines.length > 150) console.log(`  … ${lines.length - 150} more`); process.exit(1); }
  console.log('thumbs-check: OK');
})();
