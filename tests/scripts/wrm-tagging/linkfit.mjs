// Rule 18 (extended): every pre and related link must deal numbers, content and layouts a pupil of THIS step can do,
// judged against what the school has taught BY THAT WEEK (xlsx order).
//   own ceiling(step) = the largest number its own direct/partial items deal (print path, their opts and Max Number;
//                       deliberate decoys excluded) or its title names ("3-digit" = 999)
//   RELATED limit     = max(1.5 × own ceiling, 100)
//   PRE limit         = max(1.5 × max(own ceiling, cited ceiling), 100), where the cited step is the step id the `why`
//                       label starts with: a Y4 step counts only if the school teaches it in or before this step's week;
//                       a lower-grade step counts with its title range (or its year's range: R 20, Y1/Y2 100, Y3 1,000)
//   CONTENT (any link): negative numbers; coordinates past 10; customary units (Y4 is metric and US money only);
//                       decimals before the first decimal step (W29) except money; a fraction compare with neither a
//                       common numerator nor a common denominator (Grade 3 compares only those); degrees; a column (stack)
//                       3-digit × before its step (W36), any column ÷, or a long-division layout; later-grade concepts
//                       (triangle area, percent, GCF/simplify, ratio, prime/composite, reflection in an axis, 2-digit ×
//                       2-digit) and times-tables the school has not taught by the step's week. Numbers are read from the
//                       text, every part of the answer, the visual and the payload; 20 print-path items per link.
//   G7-G9 (r8): option / tile / bin labels are read; denominators also as ?/16, _/16 and "den" fields; unlike-denominator
//   ±, decimal ± past a whole or with unlike places, fifths as decimals, quarters as decimals before W33 and 4-digit
//   column ± before W14 are flagged.
//   G10-G12 (r9): five seed sets, 150 items a link; nets, cross-sections, volume and probability; fractions in a pre
//   before W07; and each free-text `why` is checked against the items (a named table, denominator family, unit, "one line").
// usage: node linkfit.mjs [--all]
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../', import.meta.url).pathname;
const g = await import(R + 'js/modules/generate-question.js');
const fs = await import('fs');
const DATA = process.env.WRM_TAG_DATA || '/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-tag-Y4';
const prior = JSON.parse(fs.readFileSync(DATA + '/prior.json', 'utf8'));
const wrm = JSON.parse(fs.readFileSync(R + 'data/curriculum/wrm-steps.json', 'utf8'));
const d = JSON.parse(fs.readFileSync(R + 'data/curriculum/links/Y4.json', 'utf8'));
const ALL = process.argv.includes('--all');
const titles = {}; for (const y of wrm.years) for (const b of y.blocks) for (const s of b.steps) titles[s.id] = s.title;
const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&#?\w+;/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const NUM = /(\d{1,3}(?:,\d{3})+(?!\d)|\d+)(\.\d+)?/g;
const TIME = /^measurement:(time|elapsed|clock|order_clocks)/;   // clock payloads hold minutes (19:00 = 1140)
const DECOY = new Set(['number_sense:estimate_sums_diffs{"place":1000,"task":"reasonable"}']);
const WK_FIRST_DECIMAL = 'W29';
const N_ITEMS = 30;
const SEEDS = [[9100, 17], [777, 53], [31337, 101], [4242, 29], [61, 7], [424243, 59]];   // G10: six seed sets, 180 items a link
const lab = x => x == null ? '' : typeof x === 'object' ? (x.label ?? x.text ?? x.html ?? JSON.stringify(x)) : String(x);   // G6: margins show up late (estimate_sums_diffs reaches 16,000 only after item 8)
const cache = new Map();
function probe(key, opts, range) {
  const id = key + JSON.stringify(opts) + range; if (cache.has(id)) return cache.get(id);
  const [c, k] = key.split(':'); let max = 0, ex = ''; const items = [];
  for (const [base, step] of SEEDS) for (let i = 0; i < N_ITEMS; i++) {
    let q; try { q = g.generateQuestionFor({ category: c, skill: k, opts, range, seed: base + i * step, itemIndex: i, itemCount: N_ITEMS }); } catch (e) { items.push({ err: e.message }); continue; }
    if (!q) continue;
    const text = strip(q.text), a = typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q.ans), pay = q.cell ? JSON.stringify(q.cell.payload) : '';
    // G7: printed option, tile and bin labels
    const x = strip([...(q.options || []), ...(q.tiles || []), ...(q.bins || []), ...(q.items || [])].map(lab).join(' ; '));
    items.push({ text, a: strip(a), x, pay, vis: strip(q.visual), tpl: q.cell ? q.cell.template : '' });
    let t = text + ' ' + x;
    if (/"[xy]":/.test(a)) t += ' ' + [...a.matchAll(/"[xy]":(\d+)/g)].map(m => m[1]).join(' ');
    else t += ' ' + strip(a).split(/[,;]/).join(' ');   // G1: dual answers ("P=136, A=1156") and lists: every comma separates
    if (!TIME.test(key) && !/coord/.test(k)) t += ' ' + strip(q.visual);           // G1: numbers drawn only in the visual
    if (pay && !/money|coin/.test(k)) t += ' ' + [...pay.matchAll(/:(-?\d+(?:\.\d+)?)[,}\]]/g)].map(m => m[1]).join(' ');   // money payloads are in cents
    for (const m of t.matchAll(NUM)) { const n = Number(m[1].replace(/,/g, '')); if (n > max) { max = n; ex = text.trim().slice(0, 60); } }
  }
  const r = { max, ex, items }; cache.set(id, r); return r;
}
const titleCeil = t => { const m = (t.match(/\d{1,3}(?:,\d{3})+|\d+(?!-digit)/g) || []).map(x => +x.replace(/,/g, ''));
  for (const k of t.matchAll(/(\d)-digit/g)) m.push(10 ** +k[1] - 1); return m.length ? Math.max(...m) : 0; };
const YEAR_RANGE = { R: 20, Y1: 100, Y2: 100, Y3: 1000 };
const own = {};
for (const [sid, s] of Object.entries(d.steps)) {
  let c = titleCeil(s.title);
  for (const e of [...s.direct, ...s.partial]) { if (DECOY.has(e.key + JSON.stringify(e.opts || {}))) continue; c = Math.max(c, probe(e.key, e.opts || {}, e.maxNumber || 10000).max); }
  own[sid] = c;
}
const wkOf = id => prior[id]?.wk || '';
function citedCeil(sid, why) {
  const m = String(why).match(/^(R|Y\d)\.B\d+\.S\d+/); if (!m) return 0;
  const ref = m[0], yr = m[1];
  if (yr === 'Y4') return (wkOf(ref) && wkOf(sid) && wkOf(ref) <= wkOf(sid)) ? own[ref] || 0 : 0;   // only if taught by now
  return titleCeil(titles[ref] || '') || YEAR_RANGE[yr] || 0;
}
const CUST = /\b(ounces?|oz|pounds?|lbs?|yards?|yd|inch(es)?|feet|foot|ft|miles?|gallons?|gal|quarts?|qt|pints?|pt|cups?|fahrenheit|tons?)\b|°\s*F\b/i;   // G2: °F
const FRAC = /\b(\d+)\/(\d+)\b/g;
const MONEY = /\$|¢|\bdollars?\b|\bmoney\b|\bprices?\b|\bcosts?\b|\bspend|\bchange\b/i;   // G3: not "centimetre" or "percent"
// tables the school has taught by a week: Y3 0, 1, 2, 3, 4, 5, 8, 10; Y4 adds 6 (W01), 7 and 9 (W02), 11 and 12 (W03)
const tablesBy = wk => { const t = new Set([0, 1, 2, 3, 4, 5, 8, 10]); if (wk >= 'W01') t.add(6); if (wk >= 'W02') { t.add(7); t.add(9); } if (wk >= 'W03') { t.add(11); t.add(12); } return t; };
// Rule 19: the week the school first teaches each content type in Grade 3 (xlsx; earlier grades' content is met)
const FIRST = [
  ['fractions (a/b)', 'W07', (e, said) => /\b\d+\/\d+\b/.test(said)],
  ['mixed numbers / fractions past 1', 'W07', (e, said) => /\b\d+ \d+\/\d+\b/.test(said)],
  ['angles', 'W27', (e, said) => /^angles_lines:(identify_angles|measure_angles|additive_angles)/.test(e.key) || /\b(acute|obtuse|right angle)/i.test(said)],
  ['hundredths', 'W31', (e, said) => !/money|coin/.test(e.key) && /\/100\b|\b0\.\d\d\b|hundredth/i.test(said)],
  ['area', 'W18', (e, said) => /\barea\b/i.test(said)],
  ['decimals', 'W29', (e, said) => /(?<![\d,])\d+\.\d+/.test(said) && !/money|coin/.test(e.key)],
  ['column 3-digit × 1-digit', 'W36', (e, said, r) => r.items.some(i => i.tpl === 'stack' && /"op":"[×x*]"/.test(i.pay) && /"operands":\[\d{3,}/.test(i.pay))],
  ['coordinates / axes', 'W37', (e, said) => /^coordinates:/.test(e.key) || /coordinates|[xy]-axis/i.test(said)],
];
function firstTaught(sid, e, r, role) {
  const wk = wkOf(sid) || 'W99', said = r.items.map(i => `${i.text || ''} ${i.a || ''}`).join(' | ');
  const out = FIRST.filter(([n, w, f]) => (role === 'pre' || n === 'hundredths' || n === 'area') && wk < w && f(e, said, r)).map(([n, w]) => `rule 19: ${n} first taught ${w}, step is ${wk}`);
  const ref = role === 'pre' ? (String(e.why).match(/^Y4\.B\d+\.S\d+/) || [])[0] : null;
  if (ref && wkOf(ref) && wkOf(ref) > wk) out.push(`rule 19: cites ${ref}, taught ${wkOf(ref)}, after this step (${wk})`);
  return out;
}
function content(sid, e, r) {
  const out = [], wk = wkOf(sid) || 'W99';
  const all = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''} ${i.pay || ''} ${i.vis || ''}`).join(' | ');
  const said = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''}`).join(' | ');   // G7: options, tiles and bins are printed                 // G3: text AND answer
  if (r.items.some(i => i.err)) out.push('generation error');
  if (/(?<![\d\w)])[−-]\d/.test(said) || /"[xy]":-\d/.test(all)) out.push('negative numbers');
  if (/coord/.test(e.key)) { const n = [...all.matchAll(/"[xy]":(-?\d+)/g), ...all.matchAll(/\((-?\d+), ?(-?\d+)\)/g)].flatMap(m => m.slice(1).filter(Boolean).map(Number)); if (n.length && Math.max(...n.map(Math.abs)) > 10) out.push(`coordinates past 10 (${Math.max(...n.map(Math.abs))})`); }
  const cu = all.match(CUST); if (cu) out.push(`customary unit "${cu[0]}"`);
  if (wk < WK_FIRST_DECIMAL && /(?<![\d,])\d+\.\d+/.test(said) && !MONEY.test(all) && !/money|coin/.test(e.key)) out.push(`decimals in ${wk} (before ${WK_FIRST_DECIMAL})`);
  if ((/\d+\s*°(?!\s*[FC])/.test(all) || /\bdegrees\b(?! (Celsius|C\b))/.test(said)) && !/temperature/.test(e.key)) out.push('angle measured in degrees (4.MD.C)');
  for (const i of r.items) {                                                                    // G4: fractions in the visual / payload too
    const src = `${i.text || ''} ${i.x || ''} ${i.vis || ''} ${i.pay || ''}`;
    const fr = [...src.matchAll(FRAC), ...(i.pay || '').matchAll(/"n(?:um)?":(\d+),"d(?:en)?":(\d+)/g)];
    if (fr.length >= 2 && /compar|order|greater|smaller|smallest|largest|biggest|<|>/i.test(i.text || '')) {
      const nums = new Set(fr.map(m => m[1])), dens = new Set(fr.map(m => m[2]));
      if (nums.size > 1 && dens.size > 1) { out.push(`unlike-fraction compare: ${(i.text || '').slice(0, 50)}`); break; }
    }
  }
  // Grade 3 denominators: 2, 3, 4, 5, 6, 8, 10, 12 (and 100 from the decimal blocks, W29)
  const dens = [...all.matchAll(/(?:\b\d+|\?|_+)\/(\d+)\b/g), ...all.matchAll(/"den(?:om)?(?:inator)?"\s*:\s*"?(\d+)/g)].map(m => +m[1]).filter(x => x > 12 && !(x === 100 && wk >= WK_FIRST_DECIMAL));
  if (dens.length) out.push(`denominator ${Math.max(...dens)} (Grade 3 stops at twelfths)`);
  // G16: 3-digit ÷ 1-digit before W36 (text, options and judge cells; dividends to 120 are table facts, 10 × 12);
  // area-model labels for 2-digit × 2-digit
  if (wk < 'W36') { const m = [...all.matchAll(/\b(\d{3})\s*÷\s*(\d)\b/g)].find(x => +x[1] > 120); if (m) out.push(`3-digit ÷ 1-digit in ${wk} (${m[0]}; B5.S13 is W36)`); }
  for (const i of r.items) { const m = (i.vis || '').match(/(\d+)\s*[×x]\s*\((\d+)\s*\+\s*(\d+)\)/);
    if (m && +m[1] >= 10 && +m[2] + +m[3] >= 13 && ![10, 100].includes(+m[1])) { out.push(`2-digit × 2-digit area model (${m[0]})`); break; } }
  // whole numbers ÷ 10 and ÷ 100 are first taught W35 (B5.S5, B5.S6)
  if (wk < 'W35') { const m = [...said.matchAll(/\b(\d{1,3}(?:,\d{3})*)\s*÷\s*(10|100)\b(?!\.)/g)].find(x => +x[1].replace(/,/g, '') > 120); if (m) out.push(`whole number ÷ ${m[2]} in ${wk} (${m[0]}; W35)`); }
  // G17: decimals in the visual / SVG labels before W29
  if (wk < WK_FIRST_DECIMAL && !/money|coin/.test(e.key) && !MONEY.test(all) && r.items.some(i => /(?<![\d,.])\d+\.\d+(?![\d.])/.test(`${i.vis || ''}`))) out.push(`decimals drawn in the visual in ${wk} (before ${WK_FIRST_DECIMAL})`);
  // G18: angle classes before W27, in any role
  if (wk < 'W27' && /\b(acute|obtuse)\b/i.test(said)) out.push(`angle classes (acute, obtuse) in ${wk} (W27)`);
  // G9: arithmetic and conversions from a later grade
  for (const i of r.items) {
    const t = `${i.text || ''} ${i.x || ''}`;
    const fs_ = [...t.matchAll(/\b(\d+)\/(\d+)\s*[+\-−]\s*(\d+)\/(\d+)\b/g)];
    if (fs_.some(m => m[2] !== m[4])) { out.push(`unlike-denominator ± (${fs_.find(m => m[2] !== m[4])[0]})`); break; }
  }
  if (!/money|coin/.test(e.key)) {
    const dm = said.match(/(\d+\.\d+)\s*[+\-−]\s*(\d+\.\d+)/);
    if (dm && (Math.floor(+dm[1]) > 0 || Math.floor(+dm[2]) > 0 || (dm[1].split('.')[1].length !== dm[2].split('.')[1].length))) out.push(`decimal ± past a whole or with unlike places (${dm[0]}) (5.NBT.B.7)`);
    if (/\b\d\/5\b[^|]{0,40}\b0?\.\d|\b0?\.\d[^|]{0,40}\b\d\/5\b/.test(said)) out.push('fifths as decimals (0.4 = 2/5)');
    if (wk < 'W33' && /(?<![\d$])0?\.(25|75)\b/.test(said)) out.push(`quarters as decimals in ${wk} (W33)`);
  }
  if (wk < 'W14' && r.items.some(i => i.tpl === 'stack' && /"op":"[+\-−]"/.test(i.pay) && Math.max(...[...(i.pay.match(/"operands":\[([\d,]+)\]/) || ['', '0'])[1].split(',')].map(Number)) >= 1000)) out.push(`column 4-digit ± in ${wk} (W14)`);
  // G5: concepts from a later grade
  if (/triangle/i.test(said) && /\barea\b/i.test(said)) out.push('triangle area (6.G.A.1)');
  if (/%|\bpercent/i.test(all)) out.push('percent (6.RP)');
  if (/\bGCF\b|greatest common|simplif/i.test(said)) out.push('GCF / simplifying');
  if (/cross-section|\bnets?\b|folds? into/i.test(said)) out.push('nets / cross-sections (6.G.A.4, 7.G.A.3)');      // G11
  if (/\bvolume\b|cubic units/i.test(said)) out.push('volume of solids (5.MD.C)');
  if (/probabilit|\blikely\b|\bunlikely\b|\bimpossible\b/i.test(said)) out.push('probability (7.SP)');
  if (/nearest tenth|to one decimal place/i.test(said) || /round_sort_tenths|round_decimals/.test(e.key)) out.push('rounding to tenths (5.NBT.A.4)');   // G15
  if (/\bratio\b|x value|y value/i.test(said)) out.push('ratio tables (6.RP)');
  if (/\bprime\b|composite number|prime or composite/i.test(said)) out.push('prime / composite (4.OA.B.4)');
  if (/[xy]-axis/i.test(said) && /reflect/i.test(said)) out.push('reflection in an axis');
  for (const i of r.items) {
    const m = (i.text || '').match(/\b(\d{2,})\s*[×x]\s*(\d{2,})\b/) || ((i.vis || '').match(/first row is done|second row/i) ? ['', '10', '10'] : null);
    const p10 = x => [10, 100, 1000].includes(+x);
    if (m && (+m[1] > 12 || +m[2] > 12) && !p10(m[1]) && !p10(m[2])) { out.push(`2-digit × 2-digit (${m[0] || 'long multiplication'})`); break; }
  }
  if (wk < 'W03') {                                                                           // G13: every form of a table
    const taught = tablesBy(wk), TBL = [6, 7, 9, 11, 12];
    for (const i of r.items) {
      const t = `${i.text || ''} ${i.a || ''} ${i.x || ''}`;
      const pairs = [...t.matchAll(/\b(\d{1,2})\s*[×x]\s*(\d{1,2})\b/g)].map(m => [+m[1], +m[2]])
        .concat([...t.matchAll(/\b(\d{1,3})\s*÷\s*(\d{1,2})\b/g)].map(m => [+m[2], +m[2]]))
        .concat([...t.matchAll(/Fact Family:\s*(\d+),\s*(\d+)/gi)].map(m => [+m[1], +m[2]]))
        .concat([...`${t} ${i.vis || ''}`.matchAll(/(\d+) rows? (?:of|×|x|and) (\d+)(?: columns?)?/gi)].map(m => [+m[1], +m[2]]))      // G16
        .concat([...(i.pay || '').matchAll(/"a":(\d+),"b":(\d+)/g)].map(m => [+m[1], +m[2]]));
      const singles = [...t.matchAll(/multiples of (\d+)|count(?:ing)? (?:up |down )?by (\d+)s?\b|skip count by (\d+)s?\b|hops? of (\d+)|jumps? of (\d+)/gi)].map(m => +m.slice(1).find(Boolean))
        .concat([...(i.pay || '').matchAll(/"step":(\d+)/g)].map(m => +m[1]));
      let grid = null; if (i.tpl === 'mult-grid') { try { const p = JSON.parse(i.pay); for (const [a, b] of p.blanks || []) if (!taught.has(p.rows[a]) && !taught.has(p.cols[b])) grid = [p.rows[a], p.cols[b]]; } catch (x) {} }
      const bad = pairs.find(([x, y]) => x <= 12 && y <= 12 && !taught.has(x) && !taught.has(y)) || (singles.find(n => TBL.includes(n) && !taught.has(n)) !== undefined ? [singles.find(n => TBL.includes(n) && !taught.has(n))] : null) || grid;
      if (bad) { out.push(`table not taught by ${wk}: ${bad.join(' × ')}`); break; }
    }
  }
  for (const i of r.items) {                                                                  // G14: divisors of 13+, factors of 13-19 before W17
    const t = `${i.text || ''} ${i.x || ''} ${i.pay || ''}`;
    const story = /div|word|remainder|share|group|mult/.test(e.key);
    const div = [...t.matchAll(story ? /÷\s*(\d+)|(\d+) (?:\w+ )?in each|holds (\d+)|among (\d+)|groups of (\d+)|(\d+) in a (?:bag|box|row|team|group|pack)/gi : /÷\s*(\d+)/g)].map(m => +m.slice(1).find(Boolean)).find(n => n >= 13 && n <= 99);
    if (div) { out.push(`divisor ${div} (Grade 3 divides by 12 or less)`); break; }
    if (wk < 'W17') { const f = [...t.matchAll(/\b(\d{1,2})\s*[×x]\s*(\d{1,2})\b|(\d+) \w+,? (?:with )?(\d+) \w+ (?:each|in each)/g)].map(m => m.slice(1).filter(Boolean).map(Number)).find(a => a.some(n => n >= 13 && n <= 19));
      if (f) { out.push(`factor ${f.find(n => n >= 13)} in ${wk} (2-digit × 1-digit is W17)`); break; } }
  }
  if (r.items.some(i => i.tpl === 'stack' && /"op":"[÷/]"/.test(i.pay))) out.push('column ÷ layout');
  if (r.items.some(i => /long division|bus stop/i.test(i.vis || '') || /long division|bus stop/i.test(i.text || ''))) out.push('long-division layout');
  if (wk < 'W36' && r.items.some(i => i.tpl === 'stack' && /"op":"[×x*]"/.test(i.pay) && /"operands":\[\d{3,}/.test(i.pay))) out.push(`column 3-digit × in ${wk} (B5.S10 is W36)`);
  return out;
}
// G12: a `why` that names a table, a denominator family, a unit or "one line" must match what the items deal
const FAM = { halves: [2], half: [2], quarters: [4], fourths: [4], eighths: [8], thirds: [3], sixths: [6], ninths: [9], twelfths: [12], fifths: [5], tenths: [10], hundredths: [100] };
function whyCheck(e, r) {
  const w0 = String(e.why || '');
  // G15: a cited step's title is a claim too (the text after the id, before the bracket)
  const w = (w0.match(/^(?:R|Y\d)\.B\d+\.S\d+\s+(.*?)(?:\(|$)/) || [])[1] ?? w0;
  const out = [], texts = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''} ${i.vis || ''}` + (/^\s*\d{1,2}\s*$/.test(i.a || '') && /equal parts/i.test(i.text || '') ? ` 1/${(i.a || '').trim()}` : ''));   // a count-parts answer of n is nths (4 = fourths)
  if (/common multiples/i.test(w) && !texts.some(t => /common multiple|in both/i.test(t))) out.push('why claims common multiples; no item asks for one');
  const tm = w.match(/\b(\d+)s? times-tables?|multiply and divide by (\d+)|\bdivide by (\d+)\b|\bthe (\d+) row|\bwith (\d+) in a group|\bdividing by (\d+)|counting in (\d+)s\b|\b(?:jumps|hops) of (\d+)|\bmultiples of (\d+)/i);
  if (tm) { const n = tm.slice(1).find(Boolean);
    const grid = r.items.filter(i => i.tpl === 'mult-grid');
    const hitGrid = grid.filter(i => { try { const p = JSON.parse(i.pay); return (p.blanks || []).length && p.blanks.every(([a, b]) => p.rows[a] == n || p.cols[b] == n); } catch (x) { return false; } }).length;
    const hit = hitGrid + texts.filter((t, k) => r.items[k].tpl !== 'mult-grid' && (new RegExp(`(^|[^\\d])${n}\\s*[×x÷]|[×x÷]\\s*${n}(?!\\d)|by ${n}\\b|in ${n}s|of ${n}\\b`).test(t) || new RegExp(`"step":${n}\\b`).test(r.items[k].pay || ''))).length;
    if (hit < texts.length / 2) out.push(`why names ${n} but only ${hit} of ${texts.length} items use it`); }
  const fams = Object.keys(FAM).filter(f => new RegExp(`\\b${f}\\b`, 'i').test(w));
  const cited = w !== w0;
  if (fams.length && !/to\s+(eighths|twelfths|tenths)|halves to/i.test(w)) {
    const ok = new Set(fams.flatMap(f => FAM[f]).concat([1]));
    const per = texts.map(t => new Set([...t.matchAll(/(?:\b\d+|\?|_+)\/(\d+)\b/g)].map(m => +m[1])));
    const withDen = per.filter(d => d.size).length, hitF = per.filter(d => [...d].some(x => ok.has(x) && x !== 1)).length;
    if (withDen && hitF < texts.length / 3) out.push(`${cited ? 'cited step' : 'why'} names ${fams.join('/')} but only ${hitF} of ${texts.length} items deal it`);
    const off = [...new Set(per.flatMap(d => [...d]))].filter(d => !ok.has(d));
    if (!cited && off.length) out.push(`why names ${fams.join('/')} but items deal /${off.join(', /')}`);   // a free-text why must cover every denominator
  }
  const UNIT = { metres: 'm|metres?|meters?', meters: 'm|metres?|meters?', kilometres: 'km|kilometres?', km: 'km|kilometres?', centimetres: 'cm|centimetres?', cm: 'cm|centimetres?', millimetres: 'mm|millimetres?', mm: 'mm|millimetres?', grams: 'g|grams?', kg: 'kg|kilograms?', litres: 'l|litres?', ml: 'ml|millilitres?', hours: 'h|hr|hours?', minutes: 'min|minutes?', seconds: 's|sec|seconds?' };
  const um = w.match(/\bin (metres|meters|kilometres|km|centimetres|cm|millimetres|mm|grams|kg|litres|ml|hours|minutes|seconds)\b/i);
  if (um && !texts.some(t => new RegExp(`\\b(${UNIT[um[1].toLowerCase()]})\\b`, 'i').test(t))) out.push(`why says "in ${um[1]}" but no item has that unit`);
  if (/0-10,000|0 to 10,000|0–10,000/.test(w)) { const sp = r.items.map(i => ((i.pay || '').match(/"lo":(\d+),"hi":(\d+)/) || []).slice(1).map(Number)).filter(x => x.length);
    if (sp.length && sp.filter(([lo, hi]) => lo === 0 && hi === 10000).length < sp.length / 3) out.push('why says a 0-10,000 line; the items draw 1,000-wide pieces'); }
  if (/one line|share a point|same point|land on one point/i.test(w) && !/one denominator a line/i.test(w)) out.push('why claims fractions share a point on one line (unchecked: each item is one line)');
  return out;
}
// G18: the step a pre cites must be one the skill teaches (SKILL_WRM, or a direct / partial skill in this file)
const TAGS = JSON.parse(fs.readFileSync(DATA + '/keys.json', 'utf8')).tags;
const taughtAt = {};
for (const [k, v] of Object.entries(TAGS)) for (const t of v) (taughtAt[k] ??= new Set()).add(typeof t === 'string' ? t : t.step);
for (const [sid, s] of Object.entries(d.steps)) for (const e of [...s.direct, ...s.partial]) (taughtAt[e.key] ??= new Set()).add(sid);
function citeCheck(e, role) {
  if (role !== 'pre') return [];
  const m = String(e.why).match(/^((?:R|Y\d)\.B\d+\.S\d+)/); if (!m) return [];
  if (/has no live skill|this step's build|nearest live practice/i.test(e.why)) return [];
  return (taughtAt[e.key] && taughtAt[e.key].has(m[1])) ? [] : [`cites ${m[1]}, which ${e.key} is not tagged to (name the gap or cite its own step)`];
}
let bad = 0, nContent = 0, checked = 0;
for (const [sid, s] of Object.entries(d.steps)) {
  const fails = [];
  for (const [role, list] of [['pre', s.pre], ['related', s.related]]) for (const e of list) {
    checked++;
    if (DECOY.has(e.key + JSON.stringify(e.opts || {}))) continue;
    const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
    const base = role === 'pre' ? Math.max(own[sid], citedCeil(sid, e.why)) : own[sid];
    const limit = Math.max(1.5 * base, 100);
    const tag = `${role} ${e.key}${e.opts ? JSON.stringify(e.opts) : ''}${e.maxNumber ? '@' + e.maxNumber : ''}`;
    if (!TIME.test(e.key) && r.max > limit) fails.push(`${tag}: size ${r.max} > ${limit} — ${r.ex}`);
    for (const c of [...content(sid, e, r), ...firstTaught(sid, e, r, role), ...whyCheck(e, r), ...citeCheck(e, role)]) { fails.push(`${tag}: ${c}`); nContent++; }
  }
  bad += fails.length;
  if (fails.length || ALL) console.log(`${sid} [${wkOf(sid) || '—'}] own ceiling ${own[sid]}: ${fails.length ? fails.length + ' FAIL\n   ' + fails.join('\n   ') : 'ok'}`);
}
console.log(`linkfit: ${checked} links in ${Object.keys(d.steps).length} steps; ${bad} misfits (${bad - nContent} size, ${nContent} content/layout)`);
process.exitCode = bad ? 1 : 0;
