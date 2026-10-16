// Y5 (US Grade 4) link checker: brief rules 7, 18 and 19, ported from the Y4 lane's linkfit.mjs with the Grade-4 table.
// Every pre and related link must deal numbers, content and layouts a pupil of THIS step can do, judged against what the
// school has taught BY THAT WEEK (Grade 4 sheet of Awsaj-Domain-Sequence-K-5-2026-27.xlsx).
//   own ceiling(step) = the largest number its own direct/partial items deal (print path, their opts and Max Number) or
//                       its title names ("4-digit" = 9,999; "to 1,000,000")
//   RELATED limit     = max(1.5 × own ceiling, 100)
//   PRE limit         = max(1.5 × max(own ceiling, cited ceiling), 100); the cited step is the step id the `why` starts
//                       with: a Y5 step counts only if the school teaches it in or before this step's week; a lower-grade
//                       step counts with its title range (or its year's range: R 20, Y1/Y2 100, Y3 1,000, Y4 10,000)
//   CONTENT: the Grade-4 first-taught table below (critic r1), plus content from a later grade on any link.
//   WHY: a cited title ("4-digit", "Count in 10s", "to 100,000") and a named table / unit / fraction family must be true of
//        the generated items; a pre must cite a step its skill is tagged to and that the school teaches by this week.
// usage: node linkfit.mjs <Y5.json> [--all]           report every misfit (exit 1 when any)
//        node linkfit.mjs <Y5.json> --fit <out.json>   for each link, the first option set that fits (or null = drop)
// Generation: print path (generateQuestionFor, seeded, itemIndex set), 5 seed sets × 20 items = 100 items a link.
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../../', import.meta.url).pathname;
const _log = console.log; console.log = () => {};
const g = await import(R + 'js/modules/generate-question.js');
const so = await import(R + 'js/modules/skill-options.js');
console.log = _log;
const fs = await import('fs');
const DATA = process.env.WRM_TAG_DATA;
const prior = JSON.parse(fs.readFileSync(DATA + '/prior.json', 'utf8'));
const TAGS = JSON.parse(fs.readFileSync(DATA + '/keys.json', 'utf8')).tags;
const wrm = JSON.parse(fs.readFileSync(R + 'data/curriculum/wrm-steps.json', 'utf8'));
const FILE = process.argv[2];
const d = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const ALL = process.argv.includes('--all');
// site lessons (the "lessons" section) are checked exactly as steps: their week is in prior.json (build.py adds it)
const UNITS = { ...d.steps, ...(d.lessons || {}) };
const fi = process.argv.indexOf('--fit'), FIT = fi > 0 ? process.argv[fi + 1] : null;
const titles = {}, blockOf = {}, ccssOf = {}; for (const y of wrm.years) for (const b of y.blocks) for (const s of b.steps) { titles[s.id] = s.title; blockOf[s.id] = b.name; ccssOf[s.id] = s.ccss || []; }
const CCT = Object.fromEntries(JSON.parse(fs.readFileSync(R + 'data/standards/ccss-math.json', 'utf8')).standards.map(x => [x.code, x.text || '']));
const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ');
const NUM = /(\d{1,3}(?:,\d{3})+(?!\d)|\d+)(\.\d+)?/g;
const TIME = /^measurement:(time|elapsed|clock|order_clocks|mixed_time)/;   // clock payloads hold minutes
const N_ITEMS = 20;
const SEEDS = [[50511, 13], [8803, 41], [270719, 97], [6007, 23], [99991, 61]];
const lab = x => x == null ? '' : typeof x === 'object' ? (x.label ?? x.text ?? x.html ?? JSON.stringify(x)) : String(x);
const cache = new Map();
function probe(key, opts, range) {
  const id = key + JSON.stringify(opts) + range; if (cache.has(id)) return cache.get(id);
  const [c, k] = key.split(':'); let max = 0, ex = ''; const items = [];
  for (const [base, step] of SEEDS) for (let i = 0; i < N_ITEMS; i++) {
    let q; try { q = g.generateQuestionFor({ category: c, skill: k, opts, range, seed: base + i * step, itemIndex: i, itemCount: N_ITEMS }); } catch (e) { items.push({ err: e.message }); continue; }
    if (!q) continue;
    const text = strip(q.text), a = typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q.ans), pay = q.cell ? JSON.stringify(q.cell.payload) : '';
    const x = strip([...(q.options || []), ...(q.tiles || []), ...(q.bins || []), ...(q.items || [])].map(lab).join(' ; '));
    items.push({ text, a: strip(a), x, pay, vis: strip(q.visual), tpl: q.cell ? q.cell.template : '' });
    let t = text + ' ' + x;
    if (/"[xy]":/.test(a)) t += ' ' + [...a.matchAll(/"[xy]":(\d+)/g)].map(m => m[1]).join(' ');
    else t += ' ' + strip(a).split(/[,;]/).join(' ');
    if (!TIME.test(key) && !/coord/.test(k)) t += ' ' + strip(q.visual);
    if (pay && !/money|coin/.test(k)) t += ' ' + [...pay.matchAll(/:(-?\d+(?:\.\d+)?)[,}\]]/g)].map(m => m[1]).join(' ');
    for (const m of t.matchAll(NUM)) { const n = Number(m[1].replace(/,/g, '')); if (n > max) { max = n; ex = text.trim().slice(0, 60); } }
  }
  const distinct = new Set(items.map(i => i.text + '|' + i.a + '|' + i.pay)).size;
  const r = { max, ex, items, distinct }; cache.set(id, r); return r;
}
const titleCeil = t => { const m = (t.match(/\d{1,3}(?:,\d{3})+|\d+(?!-digit|-D|s\b|dp|st|nd|rd|th)/g) || []).map(x => +x.replace(/,/g, ''));
  for (const k of t.matchAll(/(\d)-digit/g)) m.push(10 ** +k[1] - 1); return m.length ? Math.max(...m) : 0; };
// critic r4 class C: a partial or gap step is sized from its INTENDED range: the title, or the example in its own
// missing clause ("4-digit × 1-digit" = 9,999 × 9), never only from the deficient partial's items
const clauseCeil = t => { t = String(t || ''); let c = titleCeil(t.replace(/\b\d+\/\d+\b|\d+ \d+\/\d+/g, ''));
  for (const k of t.matchAll(/(\d)-digit\s*[×x]\s*(\d)-digit/g)) c = Math.max(c, (10 ** +k[1] - 1) * (10 ** +k[2] - 1));
  return c; };
const YEAR_RANGE = { R: 20, Y1: 100, Y2: 100, Y3: 1000, Y4: 10000 };
const own = {};
for (const [sid, s] of Object.entries(UNITS)) {
  let c = Math.max(titleCeil(s.title), s.verdict === 'full' ? 0 : clauseCeil(s.missing));
  for (const e of [...s.direct, ...s.partial]) c = Math.max(c, probe(e.key, e.opts || {}, e.maxNumber || 10000).max);
  own[sid] = c;
}
const wkOf = id => prior[id]?.wk || '';
// critic r5 class H: a Support (enrich-native) lesson is an earlier grade's lesson re-taught in Grade 4. Its content ceiling is
// its SOURCE grade (site note "Source: G2."), not W38: no Grade-4 first-taught content at all, no compare / order of unlike
// fractions (4.NF.A.2) below a Grade-4 source, numbers within the source year's range, no customary units on a metric lesson,
// and no pre that cites a WRM year above the source year
const YR = ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'];
const SRC = {};
for (const l of JSON.parse(fs.readFileSync(R + 'data/curriculum/site-lessons.json', 'utf8')).lessons) {
  const m = l.flag === 'enrich-native' && String(l.note || '').match(/^Source: G?(PK|K|\d)\./);
  if (m) SRC[l.id] = m[1] === 'PK' ? 0 : m[1] === 'K' ? 1 : +m[1] + 1;
}
const isSupport = sid => SRC[sid] != null && SRC[sid] < 5;
const FR = /(?<![\d/])(\d+)\/(\d+)(?![\d/])/g;
const unlikeCompare = r => r.items.some(i => { const t = `${i.text || ''} ${i.x || ''}`;
  if (!/compar|order|greater|less|largest|smallest|[<>]/i.test(t)) return false;
  const f = [...t.matchAll(FR)].map(m => [+m[1], +m[2]]);
  return f.some((a, j) => f.slice(j + 1).some(b => a[0] !== b[0] && a[1] !== b[1])); });
function citedCeil(sid, why) {
  const m = String(why).match(/^(R|Y\d)\.B\d+\.S\d+/); if (!m) return 0;
  const ref = m[0], yr = m[1];
  if (yr === 'Y5') return (wkOf(ref) && wkOf(sid) && wkOf(ref) <= wkOf(sid)) ? own[ref] || 0 : 0;
  return titleCeil(titles[ref] || '') || YEAR_RANGE[yr] || 0;
}
// a "Cup (240 mL)" in a metric container sort is a container, not the customary unit: cups count only after a number or as "cups"
const CUST = /\b(ounces?|oz|pounds?|lbs?|yards?|yd|inch(es)?|feet|foot|ft|miles?|gallons?|gal|quarts?|qt|pints?|pt|fahrenheit|tons?)\b|\d\s*cups?\b|\bcups\b|°\s*F\b/i;
const MONEY = /\$|¢|\bdollars?\b|\bmoney\b|\bprices?\b|\bcosts?\b|\bspend|\bchange\b/i;
// Grade 4: the week the school first teaches each content type (critic r1 table, from the Grade 4 sheet)
const FIRST = [
  ['prime / composite', 'W02', (e, s) => /\bprime\b|\bcomposite\b/i.test(s)],
  ['numbers past 10,000', 'W05', (e, s, r) => r.max > 10000 && !TIME.test(e.key)],
  ['numbers past 100,000', 'W06', (e, s, r) => r.max > 100000 && !TIME.test(e.key)],
  ['× / ÷ 1,000 or a decimal result of ÷ 10 / 100', 'W10', (e, s) => /[×x÷]\s*1,?000\b(?!,)|\b\d+\s*÷\s*10{1,2}\s*=\s*\d*\.\d/.test(s) || /^placevalue:place_value_10x/.test(e.key) && /÷/.test(s)],
  ['short division (the division bracket)', 'W11', (e, s, r) => r.items.some(i => /div-bracket|bus stop|long division|division bracket/i.test(`${i.vis || ''} ${i.tpl || ''}`) || (i.tpl === 'stack' && /"op":"[÷/]"/.test(i.pay)))],
  ['2-digit × 2-digit', 'W11', (e, s, r) => r.items.some(i => { const m = `${i.text || ''} ${i.x || ''}`.match(/\b(\d{2,})\s*[×x]\s*(\d{2,})\b/); return m && Math.min(+m[1], +m[2]) > 12 && ![10, 100, 1000].includes(+m[1]) && ![10, 100, 1000].includes(+m[2]); })],
  ['4-digit ÷ 1-digit', 'W12', (e, s) => /\b\d,?\d{3}\s*÷\s*\d\b/.test(s)],
  ['thousandths', 'W12', (e, s) => !/money|coin/.test(e.key) && (/\/1,?000\b|(?<![\d,])\d*\.\d{3}\b|thousandth/i.test(s))],
  ['decimal ± decimal', 'W13', (e, s) => !/money|coin/.test(e.key) && /\d\.\d+\s*[+\-−]\s*\d*\.\d/.test(s) && !MONEY.test(s)],
  ['unlike denominators ±', 'W17', (e, s) => [...s.matchAll(/\b(\d+)\/(\d+)\s*[+\-−]\s*(?:\d+ )?(\d+)\/(\d+)\b/g)].some(m => m[2] !== m[4])],
  ['fraction × whole number', 'W19', (e, s) => /\b\d+\/\d+\s*(?:[×x]|of)\s*\d+(?!\/)\b|\b\d+\s*[×x]\s*\d+\/\d+/.test(s)],
  ['percent', 'W22', (e, s, r) => /%|\bpercent/i.test(s + ' ' + r.items.map(i => i.vis).join(' '))],
  ['angles in degrees', 'W23', (e, s, r) => !/temperature/.test(e.key) && (/\d+\s*°(?!\s*[FC])/.test(s + r.items.map(i => i.vis).join(' ')) || /\bdegrees\b(?! (Celsius|C\b))/.test(s))],
  ['translation / reflection; coordinates past 10', 'W27', (e, s, r) => /\btranslat|\breflect/i.test(s) || (/coord/.test(e.key) && Math.max(0, ...r.items.flatMap(i => [...`${i.pay} ${i.a} ${i.text}`.matchAll(/"[xy]":(-?\d+)|\((-?\d+), ?(-?\d+)\)/g)].flatMap(m => m.slice(1).filter(Boolean).map(x => Math.abs(+x))))) > 10)],
  ['customary units', 'W33', (e, s, r) => CUST.test(s + ' ' + r.items.map(i => `${i.vis} ${i.pay}`).join(' '))],
  ['3-digit × 2-digit', 'W34', (e, s, r) => r.items.some(i => { const m = `${i.text || ''} ${i.x || ''}`.match(/\b(\d{3,})\s*[×x]\s*(\d{2})\b|\b(\d{2})\s*[×x]\s*(\d{3,})\b/); return m && ![10, 100, 1000].includes(+(m[2] || m[3])) && !/^[1-9]0+$/.test(m[1] || m[4]); })],
  ['rounding decimals', 'W35', (e, s) => /nearest tenth|nearest hundredth|nearest whole|to one decimal place|decimal places?\b.*round|round.*\d\.\d/i.test(s) || /round_(sort_)?(tenths|hundredths|thousandths|decimals)/.test(e.key)],
  ['volume; line graphs', 'W36', (e, s) => /\bvolume\b|cubic|cubes? (?:to )?(?:build|fill|make)|line graph/i.test(s)],
  ['square / cube numbers, powers', 'W37', (e, s) => /squared|cubed|[²³]|square numbers?|cube numbers?|\^\s*\d|\bexponent|\bpower of\b/i.test(s)],
  ['negative numbers', 'W38', (e, s, r) => /(?<![\d\w)])[−-]\d/.test(s) || r.items.some(i => /"[xy]":-\d/.test(i.pay))],
];
// A step that is itself the first lesson of a content type may link to it (Y5.B14.S4 Imperial units is W32, the
// school's CCSS customary lessons are W33)
const OWN = { 'Y5.B14.S4': ['customary units'],
  // Y5.B12.S11 Divide by 10, 100 and 1,000 (W10): its own title makes thousandths (439 ÷ 1,000 = 0.439)
  'Y5.B12.S11': ['thousandths'],
  // the site's three customary lessons (W30-W31) ARE the school's first customary-unit lessons
  'G4|-|customarycapacitycupspintsquartsandgallons': ['customary units'],
  'G4|-|customarylengthandweightinchesfeetyardsouncesandpounds': ['customary units'],
  'G4|-|measurementwordproblemsdistancetimemassmoneyandcapacity': ['customary units'] };
function laterGrade(e, s, r) {
  const out = [];
  if (/\d+\.\d+\s*[×x÷]\s*\d+\.\d+/.test(s)) out.push('decimal × / ÷ decimal (5.NBT.B.7)');
  if ([...s.matchAll(/(\d+\.\d+)\s*[×x÷]\s*(\d{1,3}(?:,\d{3})+|\d+)\b|\b(\d{1,3}(?:,\d{3})+|\d+)\s*[×x]\s*(\d+\.\d+)/g)].some(m => ![10, 100, 1000].includes(+String(m[2] || m[3]).replace(/,/g, '')))) out.push('decimal × / ÷ a whole number other than 10, 100, 1,000 (5.NBT.B.7)');
  if (/\b\d+\/\d+\s*[×x]\s*\d+\/\d+|÷\s*\d+\/\d+|\b\d+\/\d+\s*÷/.test(s)) out.push('fraction × fraction or ÷ a fraction (5.NF)');
  // critic r4 class A: a/b ± c/d where neither denominator divides the other is 5.NF.A.1 (Grade 4 adds related ones only)
  { const m = [...s.matchAll(/(?:\d+ )?\d+\/(\d+)\s*[+\-−]\s*(?:\d+ )?\d+\/(\d+)\b/g)].find(m => { const a = +m[1], b = +m[2]; return a !== b && a % b && b % a; });
    if (m) out.push(`unrelated denominators ± (5.NF.A.1): ${m[0]}`); }
  if (/triangle/i.test(s) && /\barea\b/i.test(s)) out.push('triangle area (6.G.A.1)');
  if (/probabilit|\blikely\b|\bunlikely\b/i.test(s)) out.push('probability (7.SP)');
  if (/\bratio\b/i.test(s)) out.push('ratio (6.RP)');
  if (/[xy]-axis/i.test(s) && /reflect/i.test(s)) out.push('reflection in an axis');
  if (/cross-section|surface area/i.test(s)) out.push('cross-sections / surface area (6.G, 7.G)');
  if (/\bmean\b|\baverage\b/i.test(s)) out.push('mean (6.SP)');
  for (const i of r.items) { const t = `${i.text || ''} ${i.x || ''} ${i.pay || ''}`;
    const dv = [...t.matchAll(/÷\s*(\d+)\b/g)].map(m => +m[1]).find(n => n >= 13 && ![100, 1000].includes(n));
    if (dv) { out.push(`divisor ${dv} (Grade 4 divides by one digit, 10, 100, 1,000)`); break; }
    // critic r4: the divisor of a division STORY ("puts 16 shells in each basket", "each car holds 15") counts too
    if (/left over|how many .{0,30}(?:need|fill|get)|equally/i.test(t)) {
      const sd = [...t.matchAll(/(\d+) [a-z]+ (?:in|into) each|holds (\d+)|equally (?:among|between) (\d+)/gi)].map(m => +(m[1] || m[2] || m[3])).find(n => n >= 13 && ![100, 1000].includes(n));
      if (sd) { out.push(`divisor ${sd} in a division story (Grade 4 divides by one digit)`); break; } } }
  return out;
}
function content(sid, e, r, role) {
  const link = role === 'pre' || role === 'related', out = [], wk = isSupport(sid) && link ? 'W00' : (wkOf(sid) || 'W99');
  const said = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''}`).join(' | ');
  const all = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''} ${i.vis || ''}`).join(' | ');
  if (r.items.some(i => i.err)) out.push('generation error');
  if (!r.items.length) out.push('no items generated');
  if (r.items.length >= 20 && r.distinct < 3) out.push(`degenerate: ${r.distinct} distinct items in ${r.items.length}`);
  for (const [n, w, f] of FIRST) if (wk < w && !(OWN[sid] || []).includes(n) && f(e, n === 'customary units' || n === 'percent' ? all : said, r)) out.push(`rule 19: ${n} first taught ${w}, step is ${wk}`);
  out.push(...laterGrade(e, said, r));
  if (isSupport(sid) && link) {
    const src = YR[SRC[sid]];
    if (role === 'pre' && unlikeCompare(r)) out.push(`H: compares or orders unlike fractions (4.NF.A.2), above this Support lesson's source year ${src}`);
    if (/centimet|metre|gram|litre|millilit|kilo/i.test(UNITS[sid].title) && !CUST.test(UNITS[sid].title) && CUST.test(all))
      out.push(`H: customary units on a metric Support lesson`);
    const ref = role === 'pre' && (String(e.why).match(/^(R|Y\d)\.B\d+\.S\d+/) || [])[1];
    if (ref && YR.indexOf(ref) > SRC[sid]) out.push(`H: cites a ${ref} step, above this Support lesson's source year ${src}`);
  }
  const dens = [...all.matchAll(/(?:\b\d+|\?|_+)\/(\d+)\b/g)].map(m => +m[1]).filter(x => x > 24 && x !== 100 && x !== 1000 && !(x === 50));
  if (dens.length && (role === 'pre' || role === 'related')) out.push(`denominator ${Math.max(...dens)} (Grade 4: 2, 3, 4, 5, 6, 8, 10, 12, 100 and their doubles)`);
  if (role === 'pre') { const ref = (String(e.why).match(/^Y5\.B\d+\.S\d+/) || [])[0];
    if (ref && wkOf(ref) && wkOf(ref) > wk) out.push(`rule 19: cites ${ref}, taught ${wkOf(ref)}, after this step (${wk})`); }
  return out;
}
const FAM = { halves: [2], quarters: [4], fourths: [4], eighths: [8], thirds: [3], sixths: [6], ninths: [9], twelfths: [12], fifths: [5], tenths: [10], hundredths: [100], thousandths: [1000] };
function whyCheck(e, r) {
  const w0 = String(e.why || '');
  const w = (w0.match(/^(?:R|Y\d)\.B\d+\.S\d+\s+(.*?)(?:\(|$)/) || [])[1] ?? w0;
  const cited = w !== w0, out = [], N = r.items.length || 1;
  const texts = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''} ${i.vis || ''}`);
  if (cited && !/nearest live practice|has no live skill|this step's build/i.test(w0)) {
    const cm = w.match(/Count in ((?:\d+s(?:,\s*|\s+and\s+)?)+)/i);
    if (cm) { const want = new Set([...cm[1].matchAll(/\d+/g)].map(x => +x[0]));
      const hit = r.items.filter(i => { const k = [...`${i.text || ''} ${i.pay || ''}`.matchAll(/count (?:up |down )?by (\d+)|"step":(\d+)/gi)].map(x => +(x[1] || x[2]));
        const seq = ((i.text || '').match(/(?:\d[\d,]*\s*,\s*(?:_+\s*,\s*)?){2,}\d[\d,]*|(?:\d[\d,]*\s*,\s*){1,}_+/) || [''])[0].split(',').map(x => x.trim()).map(x => /^\d/.test(x) ? +x.replace(/,/g, '') : null);
        for (let j = 1; j < seq.length; j++) if (seq[j] != null && seq[j - 1] != null) k.push(Math.abs(seq[j] - seq[j - 1]));
        return k.some(x => want.has(x)); }).length;
      if (hit < N / 3) out.push(`cited "${cm[0]}" but only ${hit} of ${N} items count in those steps`); }
    // critic r5 class H: a cited "unit fractions" step must be true of the items (fractions:order_fractions {} is not)
    if (/(?<!non-)\bunit fractions\b/i.test(w)) { const hit = r.items.filter(i => { const f = [...`${i.text || ''} ${i.x || ''}`.matchAll(FR)].map(m => +m[1]); return f.length && f.every(n => n === 1); }).length;
      if (hit < N / 3) out.push(`cited "unit fractions" but only ${hit} of ${N} items are unit fractions`); }
    const tm = w.match(/\bto ([\d,]{5,})\b/);
    if (tm && !/Roman/i.test(w)) { const L = +tm[1].replace(/,/g, ''); if (r.max < L / 20) out.push(`cited "to ${tm[1]}" but the items reach ${r.max}`); }
  }
  // an "N-digit" claim anywhere in the why (cited title or own words) must be dealt (critic r4 class D)
  { const dm = w0.split('(nearest')[0].match(/(\d)-digit(?! (?:number )?(?:÷|divis))/);
    if (dm) { const D = +dm[1]; const hit = texts.filter((t, k) => [...(t + ' ' + (r.items[k].pay || '')).matchAll(/\b\d{1,3}(?:,\d{3})+\b|\b\d+\b/g)].some(x => x[0].replace(/,/g, '').length === D)).length;
      if (hit < N / 3) out.push(`why names "${D}-digit" but only ${hit} of ${N} items have ${D}-digit numbers`); } }
  const tm = w.match(/(?<!(?:\d,|\d| and| or) ?)\b(\d+)s? times-tables?|multiply and divide by (\d+)(?! (?:and|or|\/) \d)|\bdivide by (\d+)\b(?!,| (?:and|or|\/) \d)|\bmultiples of (\d+)\b(?!,| (?:and|or|\/) \d)/i);
  if (tm && !/,|and/.test(tm[0])) { const n = tm.slice(1).find(Boolean);
    const hit = texts.filter((t, k) => new RegExp(`(^|[^\\d])${n}\\s*[×x÷]|[×x÷]\\s*${n}(?!\\d)|by ${n}\\b|in ${n}s|of ${n}\\b`).test(t) || new RegExp(`"step":${n}\\b`).test(r.items[k].pay || '')).length;
    if (hit < N / 2) out.push(`why names ${n} but only ${hit} of ${N} items use it`); }
  const tl = w.match(/\b(\d+), (\d+) and (\d+)(?: times-tables?|s\b)/) || w.match(/(?:multiples of|divide by|times-tables? of) ((?:\d+, )*\d+(?: (?:and|or) \d+)?)\b/i) || w.match(/\b((?:\d+, )*\d+ (?:and|or) \d+)(?: times-tables?)/i);
  if (tl) { const ns = (tl.length > 3 && tl[3] ? tl.slice(1, 4) : [...tl[1].matchAll(/\d+/g)].map(x => x[0])); if (ns.length > 1) { const hit = texts.filter(t => ns.some(n => new RegExp(`(^|[^\\d])${n}\\s*[×x÷]|[×x÷]\\s*${n}(?!\\d)|by ${n}\\b|in ${n}s|of ${n}\\b`).test(t))).length;
    if (hit < N / 2) out.push(`why names ${ns.join(', ')} but only ${hit} of ${N} items use them`); } }
  // critic r4 class D: a size the why claims ("to 100,000", "4-digit", "1,000 more") must be dealt: claim ≥ 10 × items' max is stale
  { const ww = w0.split('(nearest')[0]; const c = [];
    for (const m of ww.matchAll(/(?:to|within|past)\s+(\d{1,3}(?:,\d{3})+|\d{3,})\b/gi)) c.push(+m[1].replace(/,/g, ''));
    for (const m of ww.matchAll(/(\d)-digit/g)) c.push(10 ** (+m[1] - 1));
    for (const m of ww.matchAll(/\b(\d{1,3}(?:,\d{3})+)\s+(?:more|less)/g)) c.push(+m[1].replace(/,/g, ''));
    const cl = c.length ? Math.max(...c) : 0;
    if (cl >= 1000 && r.max < cl / 10) out.push(`why claims ${cl} but the items reach ${r.max}`); }
  const fams = Object.keys(FAM).filter(f => new RegExp(`\\b${f}\\b`, 'i').test(w));
  if (fams.length && !/\bto\s+(eighths|twelfths|tenths|hundredths|thousandths)/i.test(w)) {
    const ok = new Set(fams.flatMap(f => FAM[f]).concat([1]));
    const per = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''} ${i.vis || ''}`).map(t => new Set([...t.matchAll(/(?:\b\d+|\?|_+)\/(\d+)\b/g)].map(m => +m[1]).concat([...t.matchAll(/(?<![\d,])\d*\.(\d+)\b/g)].map(m => 10 ** m[1].length))));
    const hitF = per.filter(dd => [...dd].some(x => ok.has(x) && x !== 1)).length;
    if (hitF < N / 3) out.push(`${cited ? 'cited step' : 'why'} names ${fams.join('/')} but only ${hitF} of ${N} items deal it`);
  }
  const UNIT = { metres: 'm|metres?|meters?', kilometres: 'km|kilometres?', centimetres: 'cm|centimetres?', millimetres: 'mm|millimetres?', grams: 'g|grams?', kilograms: 'kg|kilograms?', litres: 'l|litres?|liters?', millilitres: 'ml|millilitres?', hours: 'h|hr|hours?', minutes: 'min|minutes?', seconds: 's|sec|seconds?' };
  // critic r5: every unit the why names must be in at least a fifth of the items ("kilograms and grams" on fl oz / lb items)
  for (const um of w.matchAll(/\b(metres|kilometres|centimetres|millimetres|grams|kilograms|litres|millilitres|hours|minutes|seconds)\b/gi)) {
    const hit = texts.filter(t => new RegExp(`\\b(${UNIT[um[1].toLowerCase()]})\\b`, 'i').test(t)).length;
    if (hit < N / 5) { out.push(`why names ${um[1]} but only ${hit} of ${N} items have that unit`); break; } }
  return out;
}
const taughtAt = {};
for (const [k, v] of Object.entries(TAGS)) for (const t of v) (taughtAt[k] ??= new Set()).add(typeof t === 'string' ? t : t.step);
for (const [sid, s] of Object.entries(d.steps)) for (const e of [...s.direct, ...s.partial]) (taughtAt[e.key] ??= new Set()).add(sid);
for (const t of d.tagFixes || []) if (!d.steps[t.step] && ['add', 'full', 'partial'].includes(t.action)) (taughtAt[t.key] ??= new Set()).add(t.step);
function citeCheck(e, role) {
  if (role !== 'pre') return [];
  const m = String(e.why).match(/^((?:R|Y\d)\.B\d+\.S\d+)/); if (!m) return [];
  if (/has no live skill|this step's build|nearest live practice/i.test(e.why)) return [];
  return (taughtAt[e.key] && taughtAt[e.key].has(m[1])) ? [] : [`cites ${m[1]}, which ${e.key} is not tagged to`];
}
export function check(sid, role, e) {
  const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
  const base = role === 'pre' ? Math.max(own[sid], citedCeil(sid, e.why)) : own[sid];
  let limit = Math.max(1.5 * base, 100);
  if (isSupport(sid)) limit = Math.min(limit, Math.max(1.5 * (YEAR_RANGE[YR[SRC[sid]]] || 10000), 100));
  const out = [];
  if (!TIME.test(e.key) && r.max > limit) out.push(`size ${r.max} > ${limit} — ${r.ex}`);
  out.push(...content(sid, e, r, role), ...whyCheck(e, r), ...citeCheck(e, role));
  return out;
}
// Candidate option sets for a link that does not fit, nearest to the link's own first: each band / range value (largest
// first), then one value of forms / units / task / denoms at a time (with each band), then Max Number 1,000 and 100.
function candidates(e) {
  const [c, k] = e.key.split(':'); const defs = so.optionsFor(c, k) || []; const o = e.opts || {};
  const out = [{ opts: o, maxNumber: e.maxNumber }];
  const sz = defs.find(x => x.id === 'band') || defs.find(x => x.id === 'range' && x.values);
  const bands = sz ? sz.values.map(x => x.v).filter(v => v != null && typeof v === 'number').sort((a, b) => b - a) : [];
  const withBand = (oo, mn) => { for (const b of bands) out.push({ opts: { ...oo, [sz.id]: b }, maxNumber: mn }); };
  // a why that names tables ("3, 6 and 9 times-tables", "Divide by 10") is made true with the skill's constant option, and
  // that is tried BEFORE any band (critic r4 class C: re-option to the named table before a band or a drop)
  const cdef = defs.find(x => x.id === 'constant');
  const named = [...String(e.why || '').matchAll(/\b(\d{1,2})(?=(?:, \d{1,2})*(?: and \d{1,2})?(?:s? times-tables?|s\b))|(?:by|of) (\d{1,2})\b/g)].map(m => +(m[1] || m[2]));
  if (cdef && named.length) { const nn = [...new Set(named)].filter(n => cdef.values.some(x => x.v === n));
    if (nn.length) { out.push({ opts: { ...o, constant: nn }, maxNumber: e.maxNumber }); withBand({ ...o, constant: nn }, e.maxNumber); } }
  withBand(o, e.maxNumber);
  for (const id of ['forms', 'units', 'task', 'denoms', 'kind', 'decimals', 'shapes']) {
    const def = defs.find(x => x.id === id); if (!def || !def.values) continue;
    for (const v of def.values.map(x => x.v)) {
      const oo = { ...o, [id]: def.type === 'set' ? [v] : v };
      out.push({ opts: oo, maxNumber: e.maxNumber }); withBand(oo, e.maxNumber);
    }
  }
  if (!sz) for (const mn of [1000, 100]) if (!e.maxNumber || mn < e.maxNumber) out.push({ opts: o, maxNumber: mn });
  const seen = new Set();
  return out.filter(x => { const s = JSON.stringify(x); if (seen.has(s)) return false; seen.add(s); return true; }).slice(0, 48);
}
if (FIT) {
  const res = {};
  for (const [sid, s] of Object.entries(UNITS)) for (const role of ['pre', 'related']) for (const e of s[role]) {
    let pick = null, why0 = null;
    for (const cnd of candidates(e)) {
      const ee = { ...e, opts: cnd.opts }; if (cnd.maxNumber) ee.maxNumber = cnd.maxNumber; else delete ee.maxNumber;
      const f = check(sid, role, ee); if (why0 === null) why0 = f;
      if (!f.length) { pick = cnd; break; }
    }
    res[`${sid}|${role}|${e.key}|${JSON.stringify(e.opts || {})}`] = pick ? { opts: pick.opts, maxNumber: pick.maxNumber || null } : { drop: why0 };
  }
  fs.writeFileSync(FIT, JSON.stringify(res, null, 1));
  const n = Object.values(res), drop = n.filter(x => x.drop).length;
  console.log(`linkfit --fit: ${n.length} links; ${drop} with no fitting option set (dropped)`);
} else {
  let bad = 0, checked = 0;
  for (const [sid, s] of Object.entries(UNITS)) {
    const fails = [];
    for (const role of ['pre', 'related']) for (const e of s[role]) { checked++;
      for (const f of check(sid, role, e)) fails.push(`${role} ${e.key}${e.opts ? JSON.stringify(e.opts) : ''}${e.maxNumber ? '@' + e.maxNumber : ''}: ${f}`); }
    // critic r4 class A(2): the content and week checks run on the step's OWN direct and partial items too. A direct may
    // not deal later-grade or not-yet-taught content; a partial may, only when its clause names it.
    for (const role of ['direct', 'partial']) for (const e of s[role]) {
      const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
      const said = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''}`).join(' | ');
      for (const f of [...content(sid, e, r, role), ...laterGrade(e, said, r)].filter((x, i, a) => a.indexOf(x) === i)) {
        const word = (f.replace(/^rule 19: /, '').match(/[A-Za-z]{4,}/) || [''])[0].toLowerCase();
        if (role === 'partial' && word && String(e.missing).toLowerCase().includes(word)) continue;
        fails.push(`${role} ${e.key}${JSON.stringify(e.opts || {})}: ${f}${role === 'partial' ? ' (the clause does not name it)' : ''}`);
      } }
    // critic r5 class G: a FULL unit that names decimals must deal a decimal OPERAND (in the question, not only the answer:
    // 689 ÷ 10 = 68.9 is a whole-number dividend) in its direct items. "Names decimals" = its title, or its WRM block (a
    // percentage step of "Decimals and percentages" excepted), or EVERY one of its CCSS codes (a step tagged with a whole-number standard beside a
    // decimal one, Y5.B3.S9 4.NBT.A.1 + 5.NBT.A.2, may be the whole-number half; its decimal half is a separate step)
    if (s.verdict === 'full') {
      const site = d.lessons && d.lessons[sid] ? d.lessons[sid].site || {} : null;
      const cc = site ? site.ccss || [] : ccssOf[sid] || [];
      const names = /decimal/i.test(s.title) || (/decimal/i.test(blockOf[sid] || '') && !/percent/i.test(s.title)) || (cc.length && cc.every(c => /decimal/i.test(CCT[c] || CCT[c.replace(/[a-d]$/, '')] || '')));
      if (names) { const dec = [...s.direct].reduce((n, e) => n + probe(e.key, e.opts || {}, e.maxNumber || 10000).items.filter(i => /(?<![\d,])\d*\.\d/.test(i.text || '')).length, 0);
        if (!dec) fails.push(`full, and its ${/decimal/i.test(s.title) ? 'title' : /decimal/i.test(blockOf[sid] || '') ? 'block' : 'CCSS'} names decimals, but no direct item has a decimal in its question (critic r5 class G)`); } }
    // critic r4 class E: no duplicate links (same key + opts, or the same generated items)
    // critic r5 class F: a pre or related link may not be the unit's own direct or partial (same key and opts, or the same items
    // drawn the same way; a _plain twin with the same text but no picture is the scaffold fade, not a repeat)
    { const ownSig = new Map();
      for (const e of [...s.direct, ...s.partial]) { const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
        ownSig.set(r.items.map(i => i.text + '|' + i.a + '|' + i.vis + '|' + i.tpl).join('\n'), e.key + JSON.stringify(e.opts || {})); ownSig.set('K' + e.key + JSON.stringify(e.opts || {}) + (e.maxNumber || ''), e.key + JSON.stringify(e.opts || {})); }
      for (const role of ['pre', 'related']) for (const e of s[role]) { const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
        const hit = ownSig.get('K' + e.key + JSON.stringify(e.opts || {}) + (e.maxNumber || '')) || ownSig.get(r.items.map(i => i.text + '|' + i.a + '|' + i.vis + '|' + i.tpl).join('\n'));
        if (hit) fails.push(`${role} ${e.key}${JSON.stringify(e.opts || {})}: repeats the unit's own direct/partial ${hit} (critic r5 class F)`); } }
    for (const role of ['pre', 'related']) { const seen = new Map();
      for (const e of s[role]) { const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
        const sig = r.items.map(i => i.text + '|' + i.a).join('\n');
        if (seen.has(sig)) fails.push(`${role} ${e.key}${JSON.stringify(e.opts || {})}: duplicate of ${seen.get(sig)} (same items)`);
        else seen.set(sig, e.key + JSON.stringify(e.opts || {})); } }
    bad += fails.length;
    if (fails.length || ALL) console.log(`${sid} [${wkOf(sid) || '—'}] own ceiling ${own[sid]}: ${fails.length ? fails.length + ' FAIL\n   ' + fails.join('\n   ') : 'ok'}`);
  }
  console.log(`linkfit: ${checked} links in ${Object.keys(d.steps).length} steps and ${Object.keys(d.lessons || {}).length} site lessons; ${bad} misfits`);
  process.exitCode = bad ? 1 : 0;
}
