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
//   column ± before W14 are flagged. Two seed sets, 20 items each.
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
const N_ITEMS = 20;
const SEEDS = [[9100, 17], [777, 53]];   // two seed sets, 40 items a link
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
  ['mixed numbers / fractions past 1', 'W07', (e, said) => /\b\d+ \d+\/\d+\b/.test(said)],
  ['angles', 'W27', (e, said) => /^angles_lines:(identify_angles|measure_angles|additive_angles)/.test(e.key) || /\b(acute|obtuse|right angle)/i.test(said)],
  ['hundredths', 'W31', (e, said) => !/money|coin/.test(e.key) && /\/100\b|\b0\.\d\d\b|hundredth/i.test(said)],
  ['decimals', 'W29', (e, said) => /(?<![\d,])\d+\.\d+/.test(said) && !/money|coin/.test(e.key)],
  ['column 3-digit × 1-digit', 'W36', (e, said, r) => r.items.some(i => i.tpl === 'stack' && /"op":"[×x*]"/.test(i.pay) && /"operands":\[\d{3,}/.test(i.pay))],
  ['coordinates / axes', 'W37', (e, said) => /^coordinates:/.test(e.key) || /coordinates|[xy]-axis/i.test(said)],
];
function firstTaught(sid, e, r, role) {
  const wk = wkOf(sid) || 'W99', said = r.items.map(i => `${i.text || ''} ${i.a || ''}`).join(' | ');
  const out = FIRST.filter(([n, w, f]) => (role === 'pre' || n === 'hundredths') && wk < w && f(e, said, r)).map(([n, w]) => `rule 19: ${n} first taught ${w}, step is ${wk}`);
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
  if (/\bratio\b|x value|y value/i.test(said)) out.push('ratio tables (6.RP)');
  if (/\bprime\b|composite number|prime or composite/i.test(said)) out.push('prime / composite (4.OA.B.4)');
  if (/[xy]-axis/i.test(said) && /reflect/i.test(said)) out.push('reflection in an axis');
  for (const i of r.items) {
    const m = (i.text || '').match(/\b(\d{2,})\s*[×x]\s*(\d{2,})\b/) || ((i.vis || '').match(/first row is done|second row/i) ? ['', '10', '10'] : null);
    const p10 = x => [10, 100, 1000].includes(+x);
    if (m && (+m[1] > 12 || +m[2] > 12) && !p10(m[1]) && !p10(m[2])) { out.push(`2-digit × 2-digit (${m[0] || 'long multiplication'})`); break; }
  }
  if (wk < 'W03' && /multiplication|division/.test(e.key.split(':')[0])) {
    const taught = tablesBy(wk);
    for (const i of r.items) {
      const facts = [...`${i.text || ''} ${i.a || ''}`.matchAll(/\b(\d{1,2})\s*×\s*(\d{1,2})\b/g)].map(m => [+m[1], +m[2]]).concat(
        [...`${i.text || ''}`.matchAll(/\b(\d{1,3})\s*÷\s*(\d{1,2})\b/g)].map(m => [+m[2], +m[2]]));
      const bad = facts.find(([x, y]) => x <= 12 && y <= 12 && !taught.has(x) && !taught.has(y));
      if (bad) { out.push(`table not taught by ${wk}: ${bad.join(' × ')}`); break; }
    }
  }
  if (r.items.some(i => i.tpl === 'stack' && /"op":"[÷/]"/.test(i.pay))) out.push('column ÷ layout');
  if (r.items.some(i => /long division|bus stop/i.test(i.vis || '') || /long division|bus stop/i.test(i.text || ''))) out.push('long-division layout');
  if (wk < 'W36' && r.items.some(i => i.tpl === 'stack' && /"op":"[×x*]"/.test(i.pay) && /"operands":\[\d{3,}/.test(i.pay))) out.push(`column 3-digit × in ${wk} (B5.S10 is W36)`);
  return out;
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
    for (const c of [...content(sid, e, r), ...firstTaught(sid, e, r, role)]) { fails.push(`${tag}: ${c}`); nContent++; }
  }
  bad += fails.length;
  if (fails.length || ALL) console.log(`${sid} [${wkOf(sid) || '—'}] own ceiling ${own[sid]}: ${fails.length ? fails.length + ' FAIL\n   ' + fails.join('\n   ') : 'ok'}`);
}
console.log(`linkfit: ${checked} links in ${Object.keys(d.steps).length} steps; ${bad} misfits (${bad - nContent} size, ${nContent} content/layout)`);
process.exitCode = bad ? 1 : 0;
