// Rules 7, 18, 19 for Y6 (US Grade 5), checked PER STEP from generated items (print path, the link's own opts and Max Number):
//   SIZE     a link deals no number larger than max(1.5 × the larger of the step's own ceiling and its cited step's, 100);
//            own ceiling = the largest number the step's direct/partial items deal, or its title names
//   CONTENT  content the school first teaches LATER in Grade 5 (sheet "Grade 5" of the xlsx) is never in a PRE; in a RELATED
//            it may be at most 2 school weeks ahead (the next step). Beyond-grade content (negative-number arithmetic,
//            negative fractions/decimals, absolute value) is never linked. Customary units never sit on a metric step.
//   WHY      a why that names a size ("6-digit", "to 1,000,000"), a shape, a unit, a layout or "÷ 10, 100, 1,000" must be
//            true of the items.
// usage: node linkfit.mjs [--all] [--steps Y6.B1.S2,Y6.B7.S8] [Y6.json]
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../', import.meta.url).pathname;
const g = await import(R + 'js/modules/generate-question.js');
const fs = await import('fs');
// prior.json (each step's school week) comes from WRM_TAG_DATA (build.py passes its scratch dir), else it is made in a temp dir
let DATA = process.env.WRM_TAG_DATA;
if (!DATA || !fs.existsSync(DATA + '/prior.json')) {
  const os = await import('os'), path = await import('path'), cp = await import('child_process');
  DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'wrm-linkfit-'));
  cp.execFileSync('node', [new URL('prior.mjs', import.meta.url).pathname, DATA + '/prior.json']);
}
const prior = JSON.parse(fs.readFileSync(DATA + '/prior.json', 'utf8'));
const args = process.argv.slice(2);
const file = args.find(a => a.endsWith('.json')) || R + 'data/curriculum/links/Y6.json';
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const ALL = args.includes('--all');
const only = args.includes('--steps') ? new Set(args[args.indexOf('--steps') + 1].split(',')) : null;
const wrm = JSON.parse(fs.readFileSync(R + 'data/curriculum/wrm-steps.json', 'utf8'));
const titles = {}; for (const y of wrm.years) for (const b of y.blocks) for (const s of b.steps) titles[s.id] = s.title;
const WK_OVERRIDE = { 'Y6.B12.S11': 'W32' };
const wkOf = id => WK_OVERRIDE[id] || prior[id]?.wk || '';
const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&minus;/g, '−').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ');
const lab = x => x == null ? '' : typeof x === 'object' ? (x.label ?? x.text ?? x.html ?? JSON.stringify(x)) : String(x);
const NUM = /(\d{1,3}(?:,\d{3})+(?!\d)|\d+)(\.\d+)?/g;
const SEEDS = [[9100, 17], [777, 53], [4403017, 191]];
const N_ITEMS = 20;
const TIME = /^measurement:(time|elapsed|clock|order_clocks)|clock/;
const cache = new Map();
const FLOOR = 1000;
// generator bugs recorded in the step notes and Y6-report.md; the link is kept (the bug is 1 item in 60 or less)
const KNOWN = { 'fractions:simplify': /negative fractions or decimals/ };
// generator bugs an option avoids (critic r4 #18): a link to the key must carry opts that pass `ok`, or it deals the bug
const AVOIDABLE_BUGS = [
  { key: 'measurement:mass_volume_liquid', ok: o => Array.isArray(o.forms) && !o.forms.includes(1), bug: 'the kg dial reads "mass in kg? → 0"; use forms [0, 2]' },
];
function probe(key, opts, range) {
  const id = key + JSON.stringify(opts) + range; if (cache.has(id)) return cache.get(id);
  const [c, k] = key.split(':'); let max = 0, ex = ''; const items = [];
  for (const [base, step] of SEEDS) for (let i = 0; i < N_ITEMS; i++) {
    let q; try { q = g.generateQuestionFor({ category: c, skill: k, opts, range, seed: base + i * step, itemIndex: i, itemCount: N_ITEMS }); } catch (e) { items.push({ err: e.message }); continue; }
    if (!q) continue;
    const text = strip(q.text), a = strip(typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans), pay = q.cell ? JSON.stringify(q.cell.payload) : '';
    const x = strip([...(q.options || []), ...(q.tiles || []), ...(q.bins || []), ...(q.items || [])].map(lab).join(' ; '));
    const raw = String(q.visual ?? '');
    items.push({ text, a, x, pay, vis: strip(q.visual), tpl: q.cell ? q.cell.template : '', draw: `${(raw.match(/<line\b/g) || []).length >= 8 || (raw.match(/<rect\b/g) || []).length >= 12 ? 'grid ' : ''}${/<circle\b|kind":"circle|d="[^"]*\bA\s*[\d.]/.test(raw + pay) ? 'circle ' : ''}${/area-model|bx-wrap/.test(raw + (q.cell ? q.cell.template : '')) ? 'grid ' : ''}` });
    const t = `${text} ${x} ${a.split(/[,;]/).join(' ')}`.replace(/\d+(\.\d+)?\s*°/g, ' ');   // angle measures are not number size
    for (const m of t.matchAll(NUM)) { const n = Number(m[1].replace(/,/g, '')); if (n > max) { max = n; ex = text.trim().slice(0, 70); } }
  }
  const r = { max, ex, items }; cache.set(id, r); return r;
}
const titleCeil = t => { const m = (t.match(/\d{1,3}(?:,\d{3})+|\d+(?!-digit)/g) || []).map(x => +x.replace(/,/g, ''));
  for (const k of t.matchAll(/(\d)-digit/g)) m.push(10 ** +k[1] - 1); return m.length ? Math.max(...m) : 0; };
const YEAR_RANGE = { R: 20, Y1: 100, Y2: 100, Y3: 1000, Y4: 10000, Y5: 1000000 };
// a step whose direct items do not show its WRM size (a gap, or a partial that stops short) gets the size its lesson works at
const CEIL = { 'Y6.B1.S2': 9999999, 'Y6.B1.S3': 9999999, 'Y6.B1.S5': 9999999, 'Y6.B1.S6': 9999999, 'Y6.B2.S1': 9999999,
  'Y6.B2.S10': 10000, 'Y6.B2.S17': 10000, 'Y6.B5.S4': 100000, 'Y6.B6.S5': 10000, 'Y6.B10.S7': 2000 };
const own = {};
for (const [sid, s] of Object.entries(d.steps)) {
  let c = titleCeil(s.title);
  for (const e of [...s.direct, ...s.partial]) c = Math.max(c, probe(e.key, e.opts || {}, e.maxNumber || 10000).max);
  own[sid] = Math.max(c, CEIL[sid] || 0);
}
function citedCeil(sid, why) {
  const m = String(why).match(/^(R|Y\d)\.B\d+\.S\d+/); if (!m) return 0;
  if (m[1] === 'Y6') return (wkOf(m[0]) && wkOf(m[0]) <= wkOf(sid)) ? own[m[0]] || 0 : 0;
  return Math.max(titleCeil(titles[m[0]] || ''), YEAR_RANGE[m[1]] || 0);
}
const CUST = /\d[\d,.\/ ]*\s*(ounces?|oz|pounds?|lbs?|yards?|yd|inch(es)?|feet|foot|ft|miles?|gallons?|gal|quarts?|qt|pints?|pt|cups?|fl oz|tons?)\b|°\s*F\b|\b(fahrenheit|ounces|pounds|yards|inches|feet|miles|gallons|quarts|pints)\b/i;
const METRIC_STEP = /metric|Y6\.B5\.S[123]\b|Y6\.B8\.S[56]\b/;
// Grade 5 first-taught weeks (xlsx "Grade 5"); detectors read the item text, answer and printed options
const FIRST = [
  ['4-digit × 2-digit', 'W03', s => /\b\d{3,}\s*[×x]\s*\d{2}\b(?!\.)/.test(s)],
  ['long division (÷ 2-digit divisor)', 'W04', s => /\b\d{3,}\s*÷\s*(1[3-9]|[2-9]\d)\b(?!\.)/.test(s) || /long division/i.test(s)],
  ['decimal × integer', 'W07', s => /\d\.\d+\s*[×x]\s*\d|\d\s*[×x]\s*\d*\.\d/.test(s)],
  ['decimal ÷', 'W08', s => /\d\.\d+\s*÷\s*\d/.test(s)],
  ['unlike-denominator ±', 'W15', s => [...s.matchAll(/\b(\d+)\/(\d+)\s*[+\-−]\s*(\d+)\/(\d+)\b/g)].some(m => m[2] !== m[4])],
  ['fraction × fraction', 'W17', s => /\b\d+\/\d+\s*[×x]\s*\d+\/\d+/.test(s)],
  ['fraction ÷ integer', 'W17', s => /\b\d+\/\d+\s*÷\s*\d+(?!\s*\/|\d*\/)/.test(s)],
  ['whole ÷ unit fraction', 'W19', s => /(?<![\/\d])\d+\s*÷\s*1\/\d+/.test(s)],
  ['fraction as division', 'W20', s => /\b\d+\s*÷\s*\d+\s*=\s*\d+\/\d+|as a division|fractions? that means? \d+ ÷|(share|split|divide) \d+ \w+ equally among \d+/i.test(s)],
  ['triangle / parallelogram area', 'W23', s => /(triangle|parallelogram)[^|]{0,80}\barea\b|\barea\b[^|]{0,80}(triangle|parallelogram)/i.test(s)],
  ['volume', 'W25', s => /\bvolume\b|cubic (units|cm|centimet|inch|feet|metre|meter)|cm³|in³/i.test(s)],
  ['pie chart', 'W26', s => /pie chart/i.test(s)],
  ['mean', 'W26', s => /\bthe mean\b|\bmean of\b|\baverage\b/i.test(s)],
  ['angle sums', 'W27', s => /angles? (in|of) a (triangle|quadrilateral)|sum of the (interior )?angles|straight line|around a point|vertically opposite/i.test(s)],
  ['four quadrants', 'W31', (s, all) => /\((−|-)\d+,\s*-?\d+\)|\(\d+,\s*(−|-)\d+\)|quadrant (II|III|IV|2|3|4)/i.test(s) || /"[xy]":-\d/.test(all)],
  ['ratio', 'W33', s => /\bratio\b|unit rate|\b\d+\s*:\s*\d+\b(?!\s*(am|pm|a\.m|p\.m))(?![^|]{0,8}(o'clock|clock))/i.test(s) && !/\d{1,2}:\d{2}/.test(s)],
  ['percent of an amount', 'W36', s => /\d+\s*%\s*of\s*(\$|£)?\d|\d+\s*%\s*of\s*_+|percent of \d/i.test(s)],
];
const BEYOND = [
  // an operation on a negative number, or a sum/difference/product of whole numbers whose answer is negative
  ['negative-number arithmetic (7.NS)', s => /(?<![\w)])[−-]\d+\s*[+×÷*]\s*\(?\s*[−-]?\d|\d\s*[+×÷*−-]\s*\(\s*[−-]\d|\d\s*[+×÷*]\s*[−-]\d|\d\s*[+−×÷*-]\s*\d[^|→]*(=|→)\s*[−-]\d/.test(s)],
  ['negative fractions or decimals (6.NS.C)', s => /(?<![\d)])[−-]\d*\.\d|(?<![\d)])[−-]\d+\/\d+/.test(s)],
  ['absolute value (6.NS.C.7)', s => /absolute value|\|\s*[−-]?\d+\s*\|/i.test(s)],
];
function content(sid, e, r, role) {
  const out = [], wk = wkOf(sid) || 'W99';
  const said = r.items.map(i => `${i.text || ''} → ${i.a || ''} ; ${i.x || ''}`).join(' | ');
  const all = said + ' ' + r.items.map(i => `${i.pay || ''} ${i.vis || ''}`).join(' | ');
  if (r.items.some(i => i.err)) out.push('generation error');
  if (!r.items.length) out.push('no items');
  for (const [n, f] of BEYOND) if (f(said)) out.push(`beyond Grade 5: ${n}`);
  if (METRIC_STEP.test(sid + ' ' + d.steps[sid].title) && !/imperial|miles/i.test(d.steps[sid].title)) { const cu = said.match(CUST); if (cu) out.push(`customary unit "${cu[0]}" on a metric step`); }
  const ahead = (w) => { const n = x => +x.slice(1); return role === 'pre' ? n(w) > n(wk) : n(w) > n(wk) + 2; };
  for (const [n, w, f] of FIRST) if (ahead(w) && f(said, all)) out.push(`rule 19: ${n} first taught ${w}, step is ${wk}${role === 'related' ? ' (related: more than 2 weeks ahead)' : ''}`);
  return out;
}
function whyCheck(sid, e, r) {
  const w0 = String(e.why || ''), out = [];
  const cited = (w0.match(/^((?:R|Y\d)\.B\d+\.S\d+)/) || [])[1];
  // the step id's title is the school's; the text after it is our claim
  let w = cited ? w0.slice(cited.length) : w0;
  for (const id of w0.match(/(?:R|Y\d)\.B\d+\.S\d+/g) || []) w = w.split(titles[id] || '\0').join(' ');   // every cited step's own title is the school's
  const texts = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''}`);
  const N = texts.length || 1;
  const dm = w.match(/(\d)-digit/);
  if (dm && !/divisor|by a 1-digit|× 1-digit|1-digit (number|factor)|2-digit (number|divisor|factor)\b/.test(w)) {
    const D = +dm[1]; const hit = texts.filter(t => [...t.matchAll(/\b\d{1,3}(?:,\d{3})+\b|\b\d+\b/g)].some(x => x[0].replace(/,/g, '').length === D)).length;
    if (hit < N / 3) out.push(`why says "${D}-digit" but only ${hit} of ${N} items have a ${D}-digit number`);
  }
  const tm = w.match(/\b(?:numbers |partition numbers |count |values )?(?:to|within|up to) (1,000,000|10,000,000|100,000|10,000|1,000)\b/i);
  if (tm && !/round to|nearest|10, 100,? (and|or) 1,000|by 10, 100/i.test(w.slice(Math.max(0, tm.index - 12), tm.index + tm[0].length + 2))) { const L = +tm[1].replace(/,/g, ''); if (r.max < L / 10) out.push(`why says "${tm[0]}" but the items reach ${r.max}`); }
  for (const shp of ['parallelogram', 'cube', 'cuboid', 'triangle', 'pie chart', 'line graph', 'bar model', 'number line', 'protractor']) {
    if (new RegExp(`\\b${shp}s?\\b`, 'i').test(w) && !texts.some((t, k) => new RegExp(`\\b${shp}`, 'i').test(t + ' ' + (r.items[k].vis || '') + ' ' + (r.items[k].tpl || '') + ' ' + (r.items[k].pay || '').slice(0, 400)))) {
      if (shp === 'number line' && r.items.some(i => /line|nl/.test(i.tpl || ''))) continue;
      if (shp === 'bar model' && r.items.some(i => /tape diagram|bar model|fraction bar/i.test(`${i.vis || ''} ${i.text || ''}`))) continue;
      if (shp === 'cube' && /cube numbers?|cubed/i.test(w)) continue;
      if (new RegExp(`no ${shp}s? (in|among) the items|items (show|draw) no ${shp}`, 'i').test(w)) continue;   // the why says outright the items do not show it
      out.push(`why names "${shp}" but no item shows one`);
    }
  }
  if (/÷\s*10,\s*100(,| and| or)\s*(and |or )?1,000|divid\w* by 10, 100/i.test(w) && !texts.some(t => /÷\s*(10|100|1,?000)\b/.test(t))) out.push('why says ÷ 10, 100, 1,000 but no item divides by them');
  if (/×\s*10,\s*100|multipl\w* by 10, 100/i.test(w) && !texts.some(t => /[×x]\s*(10|100|1,?000)\b|(10|100|1,?000)\s*[×x]/.test(t))) out.push('why says × 10, 100, 1,000 but no item multiplies by them');
  if (/\bcolumn\b/i.test(w) && !r.items.some(i => i.tpl === 'stack' || /column/i.test(i.text || '') || /stack|column/i.test(i.vis || ''))) out.push('why says column but no item is in columns');
  const mm = w.match(/\bmultiples of (\d+)\b/i);
  if (mm && texts.filter(t => new RegExp(`\\b${mm[1]}\\b`).test(t)).length < N / 3) out.push(`why says multiples of ${mm[1]} but few items use ${mm[1]}`);
  const um = w.match(/\b(kg|grams?|km|metres?|cm|mm|litres?|ml)\b/i);
  if (um && !texts.some(t => new RegExp(`\\b${um[1].replace(/s\?$/, '')}`, 'i').test(t))) out.push(`why names the unit ${um[1]} but no item has it`);
  // r2 (critic r4 #18): representations, percents, wholes, totals and sizes a why names must be in the items
  const said = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''}`);
  const seen = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''} ${i.vis || ''} ${i.tpl || ''} ${i.draw || ''} ${(i.pay || '').slice(0, 600)}`);
  const some = (arr, re) => arr.some(t => re.test(t)), share = (arr, re) => arr.filter(t => re.test(t)).length / (arr.length || 1);
  const denied = x => new RegExp(`\\bno ${x}`, 'i').test(w);
  if (/percent|%/i.test(w) && !denied('percent') && !some(said, /%|percent/i)) out.push('why names a percent but no item has one');
  if (/squared paper|\bgrid\b/i.test(w) && !denied('grid') && !some(seen, /grid|squared|unit squares|"cells"|coord/i)) out.push('why names a grid but no item draws one');
  if (/\bcircles?\b/i.test(w) && !denied('circle') && !some(seen, /circle/i)) out.push('why names a circle but no item shows one');
  if (/find(ing)? the whole|the whole from/i.test(w) && !denied('find-the-whole') && !some(said, /of what number|of a number is|what is the (whole|number)\?/i)) out.push('why says "find the whole" but no item does');
  if (/\bto 0\b/i.test(w) && /count/i.test(w) && share(said, /(^|[^\d.])0([^\d.]|$)/) < 0.2) out.push('why says counting to/past 0 but few items reach 0');
  // an angle total the why says the items work with: "the missing part of 90, 180 or 360", "180 − (a + b)", "180 = a + b + ?", "is 90°"
  for (const m of w.matchAll(/(?:\b(?:of|is|total|totals|make|sum to)\s+|=\s*)(90|180|360)\b|\b(90|180|360)\s*(?:=|[−-]\s*\()/g)) { const n = m[1] || m[2];
    if (!/1 in \d|about 1|no angle|no triangle/i.test(w) && !some(said, new RegExp(`\\b${n}\\b`))) out.push(`why names the total ${n} but no item has it`); }
  if (/\bn\s*[x×]\s*n\b/i.test(w) && !/among them/i.test(w) && share(said, /\b(\d+)\s*[×x]\s*\1\b/) < 0.5) out.push('why says n × n but most items are not squares');
  if (/single-digit/i.test(w) && share(said, /\b\d{2,}\s*[×x]|[×x]\s*\d{2,}\b/) > 0.2) out.push('why says single-digit but items have 2-digit factors');
  if (/integer part|integer and decimal parts/i.test(w) && !/never (a number with )?an? integer part/i.test(w) && !some(said, /\b[1-9]\d*\.\d/)) out.push('why names an integer part but every decimal is below 1');
  if (/(two|2)-step/i.test(w) && /backwards|undo/i.test(w) && !some(said, /input|backwards|what (number|was) (went|put) in/i) && /machine/i.test(w)) out.push('why says a machine is worked backwards but no item does');
  return out;
}
let bad = 0, checked = 0;
for (const [sid, s] of Object.entries(d.steps)) {
  if (only && !only.has(sid)) continue;
  const fails = [];
  for (const [role, list] of [['pre', s.pre], ['related', s.related]]) for (const e of list) {
    checked++;
    const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
    const base = role === 'pre' ? Math.max(own[sid], citedCeil(sid, e.why)) : own[sid];
    const limit = Math.max(1.5 * base, FLOOR);   // Grade 5 pupils have met 4-digit numbers (Grade 3-4)
    const tag = `${role} ${e.key}${e.opts ? JSON.stringify(e.opts) : ''}${e.maxNumber ? '@' + e.maxNumber : ''}`;
    if (!TIME.test(e.key) && r.max > limit) fails.push(`${tag}: size ${r.max} > ${limit} — ${r.ex}`);
    for (const b of AVOIDABLE_BUGS) if (b.key === e.key && (!b.roles || b.roles.includes(role)) && !b.ok(e.opts || {})) fails.push(`${tag}: known generator bug: ${b.bug}`);
    for (const c of [...content(sid, e, r, role), ...whyCheck(sid, e, r)]) if (!(KNOWN[e.key] && KNOWN[e.key].test(c))) fails.push(`${tag}: ${c}`);
  }
  for (const e of [...s.direct, ...s.partial]) {   // direct/partial: beyond-grade content and generation errors only (their clause says the rest)
    const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
    const said = r.items.map(i => `${i.text || ''} → ${i.a || ''} ; ${i.x || ''}`).join(' | ');
    for (const b of AVOIDABLE_BUGS) if (b.key === e.key && !b.roles && !b.ok(e.opts || {})) fails.push(`direct ${e.key}: known generator bug: ${b.bug}`);
    // a partial clause says what is missing, but its positive claims must hold too (critic r4 #11: "integer and decimal parts")
    if (e.missing && /integer part|integer and decimal parts/i.test(e.missing) && !/never (a number with )?an? integer part|no integer part/i.test(e.missing)
      && !r.items.some(i => /\b[1-9]\d*\.\d/.test(`${i.text} ${i.a} ${i.x}`))) fails.push(`partial ${e.key} clause: names an integer part but every decimal is below 1`);
    for (const [n, f] of BEYOND) if (f(said) && !(KNOWN[e.key] && KNOWN[e.key].test(n)) && !(e.missing || '').match(/negative|beyond/i) && !/integers:|negative/.test(e.key) && !/B1\.S8|B13\.S[2-5]/.test(sid)) fails.push(`direct ${e.key}: beyond Grade 5: ${n}`);
    if (r.items.some(i => i.err) || !r.items.length) fails.push(`direct ${e.key}: generation error / no items`);
  }
  bad += fails.length;
  if (fails.length || ALL) console.log(`${sid} [${wkOf(sid) || '—'}] own ceiling ${own[sid]}: ${fails.length ? fails.length + ' FAIL\n   ' + fails.join('\n   ') : 'ok'}`);
}
console.log(`linkfit: ${checked} links checked; ${bad} misfits`);
process.exitCode = bad ? 1 : 0;
