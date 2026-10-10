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
//                       3-digit × before its step (W36), any column ÷, or a long-division layout.
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
const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const NUM = /(\d{1,3}(?:,\d{3})+(?!\d)|\d+)(\.\d+)?/g;
const TIME = /^measurement:(time|elapsed|clock|order_clocks)/;   // clock payloads hold minutes (19:00 = 1140)
const DECOY = new Set(['number_sense:estimate_sums_diffs{"place":1000,"task":"reasonable"}']);
const WK_FIRST_DECIMAL = 'W29';
const cache = new Map();
function probe(key, opts, range) {
  const id = key + JSON.stringify(opts) + range; if (cache.has(id)) return cache.get(id);
  const [c, k] = key.split(':'); let max = 0, ex = ''; const items = [];
  for (let i = 0; i < 8; i++) {
    let q; try { q = g.generateQuestionFor({ category: c, skill: k, opts, range, seed: 9100 + i * 17, itemIndex: i, itemCount: 8 }); } catch (e) { items.push({ err: e.message }); continue; }
    if (!q) continue;
    const text = strip(q.text), a = typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q.ans), pay = q.cell ? JSON.stringify(q.cell.payload) : '';
    items.push({ text, a, pay, vis: strip(q.visual), tpl: q.cell ? q.cell.template : '' });
    let t = text;
    if (/"[xy]":/.test(a)) t += ' ' + [...a.matchAll(/"[xy]":(\d+)/g)].map(m => m[1]).join(' ');
    else if (!/,/.test(a)) t += ' ' + strip(a);
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
const CUST = /\b(ounces?|oz|pounds?|lbs?|yards?|inch(es)?|feet|foot|ft|miles?|gallons?|quarts?|pints?|cups?|°F|fahrenheit)\b/i;
const FRAC = /\b(\d+)\/(\d+)\b/g;
function content(sid, e, r) {
  const out = [], wk = wkOf(sid) || 'W99', all = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.pay || ''} ${i.vis || ''}`).join(' '), texts = r.items.map(i => i.text || '').join(' ');
  if (r.items.some(i => i.err)) out.push('generation error');
  if (/(?<![\d\w)])[−-]\d/.test(texts) || /"[xy]":-\d/.test(all)) out.push('negative numbers');
  if (/coord/.test(e.key)) { const n = [...all.matchAll(/"[xy]":(-?\d+)/g), ...texts.matchAll(/\((-?\d+), (-?\d+)\)/g)].flatMap(m => m.slice(1).filter(Boolean).map(Number)); if (n.length && Math.max(...n.map(Math.abs)) > 10) out.push(`coordinates past 10 (${Math.max(...n.map(Math.abs))})`); }
  const cu = all.match(CUST); if (cu) out.push(`customary unit "${cu[0]}"`);
  if (wk < WK_FIRST_DECIMAL && /(?<![\d,])\d+\.\d+/.test(texts) && !/money|\$|¢|cent|dollar/i.test(all)) out.push(`decimals in ${wk} (before ${WK_FIRST_DECIMAL})`);
  if (/\d+\s*°(?!F)/.test(texts)) out.push('degrees');
  for (const i of r.items) {
    const fr = [...(i.text || '').matchAll(FRAC)];
    if (fr.length >= 2 && /compar|order|greater|smallest|largest|<|>/i.test(i.text)) {
      const nums = new Set(fr.map(m => m[1])), dens = new Set(fr.map(m => m[2]));
      if (nums.size > 1 && dens.size > 1) { out.push(`unlike-fraction compare: ${i.text.slice(0, 50)}`); break; }
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
    for (const c of content(sid, e, r)) { fails.push(`${tag}: ${c}`); nContent++; }
  }
  bad += fails.length;
  if (fails.length || ALL) console.log(`${sid} [${wkOf(sid) || '—'}] own ceiling ${own[sid]}: ${fails.length ? fails.length + ' FAIL\n   ' + fails.join('\n   ') : 'ok'}`);
}
console.log(`linkfit: ${checked} links in ${Object.keys(d.steps).length} steps; ${bad} misfits (${bad - nContent} size, ${nContent} content/layout)`);
process.exitCode = bad ? 1 : 0;
