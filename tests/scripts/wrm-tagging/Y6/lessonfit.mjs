// Y6 SITE-LESSON GATES (owner rule 2026-10-16: every site lesson tagged). Every link of the `lessons` section of a Y6 links file
// is judged from generated items (40 per link: two fresh seed sets x 20, print path, the link's own opts and Max Number), with every
// failure class the Y5 critics (r5-r8) and the Y2-Y3 critics (r12-r15) found turned into a gate:
//   CITE      a pre's why starts with the step or site lesson it cites; that unit teaches the key (its direct / partial, the live
//             SKILL_WRM, the passed lanes' tagFixes) and the pupil has met it by the lesson's school week (a Y6 step: its week <=
//             the lesson's; a lower year: any). A Support lesson (enrich-native, "Source: G<n>") is judged at its SOURCE grade:
//             its pre cite only that year or below, never a Y6 step (critic Y5 r5 class H)
//   SIZE      a link deals no number above max(1.5 x the larger of the lesson's own ceiling and its cited step's, 1,000); a Support
//             lesson's links stay within 1.5 x its source year's range ("pre harder than the entry")
//   CONTENT   no Grade 5 content the school first teaches after the lesson's week (rule 19, Y6 FIRST table; a related may be 2
//             weeks ahead; a Support lesson's links: none at all), no beyond-Grade-5 content, no customary unit on a metric lesson,
//             no pre that compares or orders unlike fractions below a Grade 4 source (4.NF.A.2; a related may point forward, as
//             the Y5 lane's passed lessons do, with a why that says so)
//   WHY       every claim of the why (and of the cited unit's full title) is true of the items: the Y6 linkfit why rules (sizes,
//             shapes, units, layouts, totals) plus every gated claim of claims.mjs (units, metric / customary, number kinds,
//             representations judged on the picture only, forms: sort / click / drag / convert), the "half" marker, unit words and
//             fraction families (critic Y5 r6 K / L, r7 N, N')
//   CLAUSE    a partial clause's positive gated claims are true of that partial's items, and an operation it says is never dealt
//             is not dealt (negatedHits)
//   OWN       a pre / related is never the lesson's own direct / partial: same key (build.py), or the same generated items (class F)
//   DUP       no two links of one role deal the same items
//   G         a FULL lesson whose title or CCSS names decimals deals a decimal operand in its direct items
//   M         a clause that says "never X" where an option of a listed skill is labelled X must use that option (class M, M')
//   TITLEREP  the title's representation / operation / verb / clock / table claims are dealt by the FULL lesson's direct items,
//             or named in the clause of a partial / gap lesson (Y2-Y3 r14-r15, titlerep.mjs)
//   RANGE     a direct / partial item above the lesson's title bound (or a Support lesson's source-year range) makes a FULL lesson
//             not full, and a partial clause must say so (Y2-Y3 r15 RANGECHECK)
//   DENOMS    a link with a `denoms` option is read on everything the item shows, the kit payload included: every off-family
//             family dealt is named, every denominator word named is dealt, a denied one is not dealt (Y2-Y3 r13-r14 N12)
// usage: node lessonfit.mjs <Y6.json> [--all] [--n 40] [--seeds '[[s1,stride],[s2,stride]]']       (exit 1 on any finding)
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../../', import.meta.url).pathname;
const _log = console.log, _warn = console.warn; console.log = () => {}; console.warn = () => {};
const g = await import(R + 'js/modules/generate-question.js');
const so = await import(R + 'js/modules/skill-options.js');
const U = await import(R + 'js/modules/utils.js');
console.log = _log; console.warn = _warn;
const fs = await import('fs');
const PHOST = await import('../presethost.mjs');
const CL = await import('./claims.mjs');
const TR = await import('./titlerep.mjs');
const args = process.argv.slice(2);
const FILE = args.find(a => a.endsWith('.json')) || R + 'data/curriculum/links/Y6.json';
const d = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const ALL = args.includes('--all');
const NPER = args.includes('--n') ? +args[args.indexOf('--n') + 1] : 40;
const SEEDS = args.includes('--seeds') ? JSON.parse(args[args.indexOf('--seeds') + 1]) : [[61001, 37], [90907, 53]];   // --seeds '[[a,stride],[b,stride]]': a fresh-seed self-check
const wrm = JSON.parse(fs.readFileSync(R + 'data/curriculum/wrm-steps.json', 'utf8'));
const titles = {}, yearOf = {}; for (const y of wrm.years) for (const b of y.blocks) for (const s of b.steps) { titles[s.id] = s.title; yearOf[s.id] = y.id; }
const SITE = JSON.parse(fs.readFileSync(R + 'data/curriculum/site-lessons.json', 'utf8')).lessons;
const siteOf = Object.fromEntries(SITE.map(l => [l.id, l]));
for (const l of SITE) titles[l.id] = l.title;
const CCT = Object.fromEntries(JSON.parse(fs.readFileSync(R + 'data/standards/ccss-math.json', 'utf8')).standards.map(x => [x.code, x.text || '']));
// school weeks: the Y6 steps from the xlsx (prior.mjs, the same file the step build uses), the lessons from the site
let DATA = process.env.WRM_TAG_DATA;
if (!DATA || !fs.existsSync(DATA + '/prior.json')) {
  const os = await import('os'), path = await import('path'), cp = await import('child_process');
  DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'wrm-lessonfit-'));
  cp.execFileSync('node', [new URL('prior.mjs', import.meta.url).pathname, DATA + '/prior.json']);
  cp.execFileSync('node', [new URL('keys.mjs', import.meta.url).pathname, DATA + '/keys.json']);
}
const prior = JSON.parse(fs.readFileSync(DATA + '/prior.json', 'utf8'));
const K = JSON.parse(fs.readFileSync(DATA + '/keys.json', 'utf8'));
const WK_OVERRIDE = { 'Y6.B12.S11': 'W32' };
const YR = ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'];
const YEAR_RANGE = { R: 20, Y1: 100, Y2: 100, Y3: 1000, Y4: 10000, Y5: 1000000, Y6: 10000000 };
// a Support lesson (enrich-native, site note "Source: G<n>.") is judged at its source grade: G3 = Y4
const SRC = {};
for (const l of SITE) { const m = l.flag === 'enrich-native' && String(l.note || '').match(/^Source: G?(PK|K|\d)\./); if (m) SRC[l.id] = m[1] === 'PK' ? 0 : m[1] === 'K' ? 1 : +m[1] + 1; }
const isSupport = id => SRC[id] != null && SRC[id] < 6;
const lessonWk = id => { const l = siteOf[id]; return isSupport(id) ? 'W00' : (l && l.firstWeek) || 'W38'; };
const wkOf = id => siteOf[id] ? lessonWk(id) : (WK_OVERRIDE[id] || prior[id]?.wk || '');
const n = w => +String(w).slice(1);
// who teaches a key: live SKILL_WRM, the passed lanes' tagFixes (R, Y1, Y4, Y5 in the repo), this file's steps; the Y6 lessons and
// the Y5 site lessons (passed critic r8) teach their own direct / partial keys too (a lesson may cite a lesson)
const taught = {};
const add = (k, s) => (taught[k] ??= new Set()).add(s);
const merged = new Map();
for (const [k, v] of Object.entries(K.tags)) for (const t of v) merged.set(k + '|' + (typeof t === 'string' ? t : t.step), [k, typeof t === 'string' ? t : t.step]);
for (const y of ['R', 'Y1', 'Y4', 'Y5']) { const f = R + `data/curriculum/links/${y}.json`; if (!fs.existsSync(f)) continue;
  const od = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const t of od.tagFixes) { if (t.action === 'remove') merged.delete(t.key + '|' + t.step); else if (['add', 'full', 'partial'].includes(t.action)) merged.set(t.key + '|' + t.step, [t.key, t.step]); }
  for (const [lid, l] of Object.entries(od.lessons || {})) for (const e of [...l.direct, ...l.partial]) add(e.key, lid); }
for (const [, [k, s]] of merged) add(k, s);
for (const [sid, s] of Object.entries(d.steps)) for (const e of [...s.direct, ...s.partial]) add(e.key, sid);
for (const [lid, s] of Object.entries(d.lessons || {})) for (const e of [...s.direct, ...s.partial]) add(e.key, lid);
const unitYear = id => yearOf[id] || (siteOf[id] ? siteOf[id].wrmYear : null);

const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&times;/g, '×').replace(/&divide;/g, '÷').replace(/&minus;/g, '−').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ');
const lab = x => x == null ? '' : typeof x === 'object' ? (x.label ?? x.text ?? x.html ?? JSON.stringify(x)) : String(x);
const NUM = /(\d{1,3}(?:,\d{3})+(?!\d)|\d+)(\.\d+)?/g;
const TIME = /^measurement:(time|elapsed|clock|order_clocks|mixed_time)/;
const cache = new Map();
function probe(key, opts, range) {
  const id = key + JSON.stringify(opts || {}) + range; if (cache.has(id)) return cache.get(id);
  const [c, k] = key.split(':'); let max = 0, ex = ''; const items = [], qs = [];
  for (const [base, step] of SEEDS) for (let i = 0; i < NPER / SEEDS.length; i++) {
    let q; console.log = () => {}; try { q = g.generateQuestionFor({ category: c, skill: k, opts: opts || {}, range, seed: base + i * step, itemIndex: i % 20, itemCount: 20 }); } catch (e) { items.push({ err: e.message }); continue; } finally { console.log = _log; }
    if (!q) continue;
    const text = strip(q.text), a = strip(typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans), pay = q.cell ? JSON.stringify(q.cell.payload) : '';
    const x = strip([...(q.options || []), ...(q.tiles || []), ...(q.bins || []), ...(q.items || [])].map(lab).join(' ; '));
    const raw = String(q.visual ?? '');
    items.push({ at: q.answerType || '', text, a, x, pay, vis: strip(q.visual), raw: raw.toLowerCase().slice(0, 6000), tpl: q.cell ? q.cell.template : '',
      draw: `${(raw.match(/<line\b/g) || []).length >= 8 || (raw.match(/<rect\b/g) || []).length >= 12 ? 'grid ' : ''}${/<circle\b|kind":"circle|d="[^"]*\bA\s*[\d.]/.test(raw + pay) ? 'circle ' : ''}` });
    qs.push(q);
    const t = `${text} ${x} ${a.split(/[,;]/).join(' ')}`.replace(/\d+(\.\d+)?\s*°/g, ' ');
    for (const m of t.matchAll(NUM)) { const v = Number(m[1].replace(/,/g, '')); if (v > max) { max = v; ex = text.trim().slice(0, 70); } }
  }
  const r = { max, ex, items, qs, distinct: new Set(items.map(i => i.text + '|' + i.a + '|' + i.pay)).size }; cache.set(id, r); return r;
}
const itemsOf = (key, opts) => probe(key, opts || {}, 10000).items;
const titleCeil = t => { const m = (String(t).match(/\d{1,3}(?:,\d{3})+|\d+(?!-digit|\^|\d*\s*(?:st|nd|rd|th)\b)/g) || []).map(x => +x.replace(/,/g, ''));
  for (const k of String(t).matchAll(/(\d)-digit/g)) m.push(10 ** +k[1] - 1); return m.length ? Math.max(...m) : 0; };

// ---- the Y6 linkfit rules (rule 19 FIRST table, beyond Grade 5), as the steps are judged
const CUST = /\d[\d,.\/ ]*\s*(ounces?|oz|pounds?|lbs?|yards?|yd|inch(es)?|feet|foot|ft|miles?|gallons?|gal|quarts?|qt|pints?|pt|cups?|fl oz|tons?)\b|°\s*F\b|\b(fahrenheit|ounces|pounds|yards|inches|feet|miles|gallons|quarts|pints)\b/i;
const FIRST = [
  ['4-digit × 2-digit', 'W03', s => /\b\d{3,}\s*[×x]\s*\d{2}\b(?!\.)/.test(s)],
  ['long division (÷ 2-digit divisor)', 'W04', s => /\b\d{3,}\s*÷\s*(1[3-9]|[2-9]\d)\b(?!\.)/.test(s) || /long division/i.test(s)],
  ['decimal × integer', 'W07', s => /\d\.\d+\s*[×x]\s*\d|\d\s*[×x]\s*\d*\.\d/.test(s)],
  ['decimal ÷', 'W08', s => /\d\.\d+\s*÷\s*\d|\d\s*÷\s*\d*\.\d/.test(s)],
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
  ['square and cube numbers', 'W33', s => /\d\s*[²³]|squared|cubed|square numbers?|cube numbers?/i.test(s)],
  ['percent of an amount', 'W36', s => /\d+\s*%\s*of\s*(\$|£)?\d|\d+\s*%\s*of\s*_+|percent of \d/i.test(s)],
];
const BEYOND = [
  ['negative-number arithmetic (7.NS)', s => /(?<![\w)])[−-]\d+\s*[+×÷*]\s*\(?\s*[−-]?\d|\d\s*[+×÷*−-]\s*\(\s*[−-]\d|\d\s*[+×÷*]\s*[−-]\d|\d\s*[+−×÷*-]\s*\d[^|→]*(=|→)\s*[−-]\d/.test(s)],
  ['negative fractions or decimals (6.NS.C)', s => /(?<![\d)])[−-]\d*\.\d|(?<![\d)])[−-]\d+\/\d+/.test(s)],
  ['absolute value (6.NS.C.7)', s => /absolute value|\|\s*[−-]?\d+\s*\|/i.test(s)],
];
const FR = /(?<![\d/])(\d+)\/(\d+)(?![\d/])/g;
const unlikeCompare = r => r.items.some(i => { const t = `${i.text || ''} ${i.x || ''} ${i.a || ''} ${i.pay || ''}`;
  if (!/compar|order|greater|greatest|less|least|largest|smallest|biggest|[<>]/i.test(t)) return false;
  const f = [...t.matchAll(FR)].map(m => [+m[1], +m[2]]);
  return f.some((a, j) => f.slice(j + 1).some(b => a[0] !== b[0] && a[1] !== b[1])); });
const metricLesson = id => CL.metricWords.test(d.lessons[id].title) && !CL.custWords.test(d.lessons[id].title);
function content(id, e, r, role) {
  const out = [], link = role === 'pre' || role === 'related', wk = link ? lessonWk(id) : (siteOf[id]?.firstWeek || 'W38');
  const said = r.items.map(i => `${i.text || ''} → ${i.a || ''} ; ${i.x || ''}`).join(' | ');
  const all = said + ' ' + r.items.map(i => `${i.pay || ''} ${i.vis || ''}`).join(' | ');
  if (r.items.some(i => i.err)) out.push('generation error');
  if (!r.items.length) out.push('no items');
  if (r.items.length >= 20 && r.distinct < 3) out.push(`degenerate: ${r.distinct} distinct items in ${r.items.length}`);
  for (const [nm, f] of BEYOND) if (f(said) && !/integers:|negative/.test(e.key)) out.push(`beyond Grade 5: ${nm}`);
  if (link && metricLesson(id)) { const cu = said.match(CUST); if (cu) out.push(`customary unit "${cu[0]}" on a metric lesson`); }
  const ahead = w => role === 'related' && !isSupport(id) ? n(w) > n(wk) + 2 : n(w) > n(wk);
  if (link) for (const [nm, w, f] of FIRST) if (ahead(w) && f(said, all)) out.push(`rule 19: ${nm} first taught ${w}, the lesson is ${isSupport(id) ? `a Support lesson judged at its source grade (${YR[SRC[id]]})` : wk}${role === 'related' && !isSupport(id) ? ' (related: more than 2 weeks ahead)' : ''}`);
  if (isSupport(id) && role === 'pre' && SRC[id] <= 4 && unlikeCompare(r)) out.push(`H: compares or orders unlike fractions (4.NF.A.2), above this Support lesson's source year ${YR[SRC[id]]}`);
  // lessons critic r1 F3: content above a Support lesson's SOURCE year that Grade 5 teaches before its first FIRST row (so the FIRST
  // table cannot see it), read on every word an item shows: question, answer, options and distractors, the picture's text
  if (isSupport(id)) { const shown = said + ' | ' + r.items.map(i => i.vis || '').join(' | ');
    for (const [nm, maxSrc, re] of SRC_ABOVE) if (SRC[id] <= maxSrc) { const m = shown.match(re); if (m) out.push(`SUPPORT: ${nm} ("${m[0]}"), above this Support lesson's source year ${YR[SRC[id]]} (distractors count)`); } }
  return out;
}
// [what, the highest source year index it is above (Y4 = 4), regex on the item's shown words]
const SRC_ABOVE = [
  ['thousandths (3 decimal places or /1000, 5.NBT.A.3, Y5)', 4, /(?<![\d.])\d*\.\d{3}(?!\d)|\d\s*\/\s*1000(?!\d)|thousandths/i],
  ['decimals (4.NF.C.6, Y4)', 3, /(?<![\d.$£¢])\d*\.\d+(?!\d)|\btenths\b|\bhundredths\b/i],
];
// lessons critic r1 F4: the digit-count and symbol claims of a clause or a why, read against the items. "never a 2-digit number",
// "no 3-digit numbers", "never square brackets", "never braces", "never an exponent": not one item may show it; "only 3-digit
// numbers" / "3-digit numbers only": every item's first number has 3 digits; "parentheses only": no [ ] or { }
const WHOLES = t => [...String(t || '').replace(/(\d),(?=\d{3}\b)/g, '$1').matchAll(/(?<![\d.\/])\d+(?![\d.\/]|\.\d)/g)].map(m => m[0]);
const SYMS = [['square brackets', /\b(?:square )?brackets?\b|\[ ?\]/i, i => /\[/.test(i.text || '')], ['braces', /\bbraces\b|\{ ?\}/i, i => /\{/.test(i.text || '')],
  ['parentheses', /\bparenthes[ie]s\b|\( ?\)/i, i => /\(/.test(i.text || '')], ['an exponent', /\bexponents?\b|\bpowers? notation\b/i, i => /\^\s*\d|10\s*[¹²³]/.test(i.text || '') || /<sup/.test(i.raw || '')]];
export function digitSymbolChecks(text, items) {
  const out = [], t = String(text || ''), N = items.length || 1;
  const negs = [...t.matchAll(/\b(?:never|no|not|without|nor)\b([^;.]*)/gi)].map(m => m[1].replace(/\([^)]*\)/g, ' '));
  for (const p of negs) {
    for (const m of p.matchAll(/\b(\d)-digit\b/g)) { const D = +m[1];
      if (/\bonly\b|now and then|sometimes|rarely/i.test(p.slice(0, m.index))) continue;
      if (/\bby an?\s*$/i.test(p.slice(0, m.index)) || /^-digit (?:number )?divisor/i.test(p.slice(m.index + 1))) continue;   // a divisor ("long division by a 2-digit number")
      const hit = items.filter(i => WHOLES(i.text).some(w => w.length === D)).length;
      if (hit) out.push(`CLAUSE: says never a ${D}-digit number, but ${hit} of ${N} items show one (${items.find(i => WHOLES(i.text).some(w => w.length === D)).text.trim().slice(0, 60)})`); }
    for (const [nm, re, f] of SYMS) if (re.test(p)) { const hit = items.filter(f).length; if (hit) out.push(`CLAUSE: says never ${nm}, but ${hit} of ${N} items show them`); }
  }
  for (const m of t.matchAll(/\bonly (\d)-digit\b|\b(\d)-digit (?:numbers? |dividends? )?only\b/gi)) { const D = +(m[1] || m[2]);
    const off = items.filter(i => { const w = WHOLES(i.text)[0]; return w && w.length !== D; });
    if (off.length) out.push(`CLAUSE: says ${D}-digit only, but ${off.length} of ${N} items start with another size (${off[0].text.trim().slice(0, 60)})`); }
  for (const [nm, re, f] of SYMS.slice(2, 3)) if (new RegExp(`(?:${re.source})\\s+only|only\\s+(?:${re.source})`, 'i').test(t)) { const hit = items.filter(i => /[\[{]/.test(i.text || '')).length; if (hit) out.push(`CLAUSE: says ${nm} only, but ${hit} of ${N} items show [ ] or { }`); }
  return out;
}
const SHAPES = ['parallelogram', 'cube', 'cuboid', 'triangle', 'pie chart', 'line graph', 'bar model', 'number line', 'protractor'];
function whyCheck(e, r) {
  const w0 = String(e.why || ''), out = [];
  let w = w0;
  for (const id of w0.match(/(?:R|Y\d)\.B\d+\.S\d+|G\d\|-\|[a-z0-9]+/g) || []) w = w.split(id).join(' ').split(titles[id] || '\0').join(' ');
  const texts = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''}`);
  const N = texts.length || 1;
  const dm = w.match(/(\d)-digit/);
  if (dm && !/divisor|by a 1-digit|× 1-digit|1-digit (number|factor)|2-digit (number|divisor|factor)\b/.test(w)) {
    const D = +dm[1]; const hit = texts.filter(t => [...t.matchAll(/\b\d{1,3}(?:,\d{3})+\b|\b\d+\b/g)].some(x => x[0].replace(/,/g, '').length === D)).length;
    if (hit < N / 3) out.push(`why says "${D}-digit" but only ${hit} of ${N} items have a ${D}-digit number`);
  }
  for (const shp of SHAPES) {
    if (new RegExp(`\\b${shp}s?\\b`, 'i').test(CL.positive(w)) && !texts.some((t, k) => new RegExp(`\\b${shp}`, 'i').test(t + ' ' + (r.items[k].vis || '') + ' ' + (r.items[k].tpl || '') + ' ' + (r.items[k].pay || '').slice(0, 400)))) {
      if (shp === 'number line' && r.items.some(i => /line|nl/.test(i.tpl || ''))) continue;
      if (shp === 'cube' && /cube numbers?|cubed|unit cubes?/i.test(w)) continue;
      out.push(`why names "${shp}" but no item shows one`);
    }
  }
  if (/\bcolumn\b/i.test(CL.positive(w)) && !r.items.some(i => i.tpl === 'stack' || /column/i.test(i.text || '') || /stack|column/i.test(i.vis || ''))) out.push('why says column but no item is in columns');
  // lessons critic r1 mutation 5: a times-table claim of the why ("the 7 times-table", "multiply by 6") is a claim on the items
  for (const tc of TR.tableClaims(CL.positive(w))) { const hit = r.items.filter(i => tc.re.test(`${CL.itemWords(i)} ¦ ${i.pay || ''}`)).length;
    if (hit < tc.s * N) out.push(`why claims "${tc.word}" (${tc.n}) but only ${hit} of ${N} items deal it`); }
  const mm = w.match(/\bmultiples of (\d+)\b/i);
  if (mm && texts.filter(t => new RegExp(`\\b${mm[1]}\\b`).test(t)).length < N / 3) out.push(`why says multiples of ${mm[1]} but few items use ${mm[1]}`);
  const said = texts, seen = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''} ${i.vis || ''} ${i.tpl || ''} ${i.draw || ''} ${(i.pay || '').slice(0, 600)}`);
  const some = (arr, re) => arr.some(t => re.test(t));
  if (/percent|%/i.test(CL.positive(w)) && !some(said, /%|percent/i)) out.push('why names a percent but no item has one');
  if (/squared paper|\bgrid\b/i.test(CL.positive(w)) && !some(seen, /grid|squared|unit squares|"cells"|coord/i)) out.push('why names a grid but no item draws one');
  if (/integer part/i.test(CL.positive(w)) && !some(said, /\b[1-9]\d*\.\d/)) out.push('why names an integer part but every decimal is below 1');
  // a size the why claims ("to 100,000", "4-digit") must be dealt: a claim 10 x the items' largest number is stale
  { const c = []; for (const m of w.matchAll(/(?:to|within|past)\s+(\d{1,3}(?:,\d{3})+|\d{4,})\b/gi)) c.push(+m[1].replace(/,/g, ''));
    const cl = c.length ? Math.max(...c) : 0; if (cl >= 1000 && r.max < cl / 10) out.push(`why claims ${cl} but the items reach ${r.max}`); }
  // every gated claim of claims.mjs (units, metric / customary, number kinds, representations on the picture only, forms), the
  // cited unit's FULL title included; the "half" marker; unit words in a fifth of the items
  for (const h of CL.claimHits(CL.claimText(w0, titles), r.items, { gateOnly: true })) if (!h.ok) out.push(`why claims "${h.word}" (${h.claim}) but only ${h.hit} of ${h.n} items show it`);
  for (const h of CL.halfHits(w0, r.items)) if (!h.ok) out.push(`why is marked "${h.claim}" but ${h.hit} of ${h.n} items deal the other half`);
  const UNIT = { metres: 'm|metres?|meters?', kilometres: 'km|kilometres?', centimetres: 'cm|centimetres?', millimetres: 'mm|millimetres?', grams: 'g|grams?', kilograms: 'kg|kilograms?', litres: 'l|litres?|liters?', millilitres: 'ml|millilitres?', inches: 'in|inch|inches', feet: 'ft|feet|foot', yards: 'yd|yards?', miles: 'mi|miles?' };
  for (const um of CL.positive(w).matchAll(/\b(metres|kilometres|centimetres|millimetres|grams|kilograms|litres|millilitres|inches|feet|yards|miles)\b/gi)) {
    const hit = texts.filter(t => new RegExp(`\\b(${UNIT[um[1].toLowerCase()]})\\b`, 'i').test(t)).length;
    if (hit < N / 5) { out.push(`why names ${um[1]} but only ${hit} of ${N} items have that unit`); break; } }
  const FAM = { halves: [2], quarters: [4], fourths: [4], eighths: [8], thirds: [3], sixths: [6], ninths: [9], twelfths: [12], fifths: [5], tenths: [10], hundredths: [100], thousandths: [1000] };
  const fams = Object.keys(FAM).filter(f => new RegExp(`\\b${f}\\b`, 'i').test(CL.positive(w)));
  if (fams.length) {
    const ok = new Set(fams.flatMap(f => FAM[f]));
    const per = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''} ${i.vis || ''} ${i.pay || ''}`).map(t => new Set([...t.matchAll(/(?:\b\d+|\?|_+)\/(\d+)\b|"d":(\d+)/g)].map(m => +(m[1] || m[2])).concat([...t.matchAll(/(?<![\d,])\d*\.(\d+)\b/g)].map(m => 10 ** m[1].length))));
    const hitF = per.filter(dd => [...dd].some(x => ok.has(x))).length;
    if (hitF < N / 3) out.push(`why names ${fams.join('/')} but only ${hitF} of ${N} items deal it`);
  }
  return out;
}
// ---- the cited unit
const CITE = /^((?:R|Y\d)\.B\d+\.S\d+|G\d\|-\|[a-z0-9]+)\b/;
function citeCheck(id, e) {
  const m = String(e.why || '').match(CITE);
  if (!m) return ['the why does not start with the step or site lesson it cites'];
  const ref = m[1], out = [];
  if (!titles[ref]) return [`cites ${ref}, which is not a WRM step or a site lesson`];
  if (!String(e.why).startsWith(`${ref} ${titles[ref]}`)) out.push(`the why does not give the cited unit's own title after ${ref}`);
  if (!(taught[e.key] && taught[e.key].has(ref))) out.push(`cites ${ref}, which ${e.key} is not tagged to (and is not that unit's direct / partial)`);
  const ry = unitYear(ref);
  if (isSupport(id)) {
    if (YR.indexOf(ry) > SRC[id]) out.push(`H: cites a ${ry} unit, above this Support lesson's source year ${YR[SRC[id]]}`);
  } else if (ry === 'Y6') {
    const rw = wkOf(ref);
    if (!rw) out.push(`cites ${ref}, which has no school week`);
    else if (n(rw) > n(lessonWk(id))) out.push(`rule 19: cites ${ref}, taught ${rw}, after this lesson (${lessonWk(id)})`);
  } else if (YR.indexOf(ry) > 6) out.push(`cites ${ref}, a year above Y6`);
  return out;
}
// ---- class M: an existing option missed (ported from the Y5 lane's linkfit, critic r6 M / r7 M')
const STOP = new Set('the and one page only form forms kind each item items dealt both mixed with from into for its all any are not off on a an of to in or by as at is it this that what which who how many write find click drag sort pick choose'.split(' '));
const STOP_NOUNS = new Set([...STOP].filter(w => !['click', 'drag', 'sort', 'pick', 'choose', 'write', 'find'].includes(w)));
const stem = w => w.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(?:ing|es|ed|s)$/, '');
const KEYS = Object.keys(K.keys);
function missedOptions(s) {
  const out = [], mine = [...s.direct, ...s.partial], cats = new Set(mine.map(e => e.key.split(':')[0]));
  const pool = new Set([...mine, ...s.pre, ...s.related].map(e => e.key).concat(KEYS.filter(k => cats.has(k.split(':')[0]))));
  // the negated parts (claims.mjs), and the same parts run on through a bracketed example and a list ("never a story (a box, a tank)",
  // the Y5 critic r8 M' hole: the part used to stop at the bracket)
  const longNeg = t => [...String(t || '').matchAll(/\b(?:never|no|without)\b([^;.]*)/gi)].map(m => m[1]);
  const toStems = p => p.replace(/[(),]/g, ' ').split(/[\s-]+/).map(stem).filter(Boolean);
  const shortParts = [s.missing, ...s.partial.map(e => e.missing)].flatMap(t => CL.negatedParts(t)).map(toStems);
  const parts = [s.missing, ...s.partial.map(e => e.missing)].flatMap(t => [...CL.negatedParts(t), ...longNeg(t)]).map(toStems);
  if (!parts.length) return out;
  const named = `${s.note || ''} ${s.missing || ''} ${s.partial.map(e => e.missing).join(' ')}`;
  const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const isNamed = (c, sk) => named.includes(`${c}:${sk}`) || named.includes('`' + sk + '`') || (sk.includes('_') && new RegExp(`(?<![A-Za-z0-9_:])${esc(sk)}(?![A-Za-z0-9_])`).test(named));
  const near = (p, ws) => { for (let j = 0; j + 1 < p.length; j++) for (let q = j + 1; q <= j + 3 && q < p.length; q++) if (p[j] === ws[0] && p[q] === ws[1]) return true; return false; };
  for (const k of pool) { const [c, sk] = k.split(':');
    if (isNamed(c, sk)) continue;
    if (PHOST.presetCovered(k, isNamed, mine, pool)) continue;   // a preset is read through its host (critic 2026-10-30 Y4 F1)
    for (const def of so.optionsFor(c, sk) || []) { if (!def.values || def.group === 'support' || ['band', 'range', 'support', 'cover', 'mix'].includes(def.id)) continue;
      for (const v of def.values) { const L = String(v.l ?? '');
        if (/^(no|off|none)\b/i.test(L)) continue;
        const texts = /^(yes|on)\b/i.test(L) ? [def.label || '', L.replace(/^(yes|on)\b[:,]?/i, '')] : [L];
        // a label with a bracketed example is also read without it ("A story (a box, a tank)" is "a story"); a one-word head counts
        const head = !/^(yes|on)\b/i.test(L) && /\(/.test(L) ? L.replace(/\([^)]*\)/g, ' ').trim() : null;
        const wordsOf = (t, stop) => [...new Set(t.replace(/[()]/g, ' ').split(/[\s-]+/).map(stem).filter(w => w.length > 2 && !stop.has(w) && !/^\d+$/.test(w)))];
        const hits = texts.some(t => { let words = wordsOf(t, STOP); if (words.length < 2) words = wordsOf(t, STOP_NOUNS);
          return words.length >= 2 && parts.some(p => words.every(w => p.includes(w)) && (words.length > 2 || near(p, words))); });
        const headWords = head ? wordsOf(head, STOP) : [];
        // the head alone counts only when a short negated part says exactly it ("never a story" against "A story (a box, a tank)")
        const headHit = headWords.length >= 1 && shortParts.some(p => { const cw = [...new Set(p.filter(w => w.length > 2 && !STOP.has(w)))]; return cw.length === headWords.length && headWords.every(w => cw.includes(w)); });
        if (!hits && !headHit) continue;
        const used = mine.some(e => e.key === k && [].concat((e.opts || {})[def.id] ?? []).includes(v.v));
        if (!used) out.push(`a clause says "never / no …" what ${k} option ${def.id}=${JSON.stringify(v.v)} "${v.l}" deals; use the option (key + value) or name the skill and say why not`); } } }
  return [...new Set(out)];
}
// ---- DENOMS (the Y2-Y3 lane's denoms.mjs, critic r12-r14): read every denominator an item shows, its kit payload included
function payloadDens(p) { const out = [];
  const walk = (o, k) => { if (o == null) return; if (Array.isArray(o)) { for (const x of o) walk(x, k); return; }
    if (typeof o === 'object') { for (const [a, b] of Object.entries(o)) walk(b, a); return; }
    if (typeof o === 'number' && /^(d|den|denom|denominator)$/.test(k || '')) out.push(o);
    if (typeof o === 'string') for (const m of o.matchAll(/(?:^|[^\d.])\d+\s*\/\s*(\d+)(?!\d|\.\d)/g)) out.push(+m[1]); };
  walk(p, ''); return out.filter(x => Number.isFinite(x) && x > 1); }
const itemDens = q => [...(g.itemDenominators ? g.itemDenominators(q) : []), ...(q.cell ? payloadDens(q.cell.payload) : [])].filter(x => x > 1);
const famsOf = dd => { let m = Math.round(dd); while (m % 2 === 0) m /= 2; const f = new Set(); for (let p = 3; m > 1 && p * p <= m; p += 2) while (m % p === 0) { f.add(p === 3 ? 3 : p === 5 ? 5 : 7); m /= p; } if (m > 1) f.add(m === 3 ? 3 : m === 5 ? 5 : 7); return [...f]; };
const WORDS = [[2, 'half|halves'], [3, 'thirds?'], [4, 'quarters?|fourths?'], [5, 'fifths?'], [6, 'sixths?'], [7, 'sevenths?'], [8, 'eighths?'], [9, 'ninths?'], [10, 'tenths?'], [12, 'twelfths?'], [100, 'hundredths?']];
const NEG = /\b(?:no|never|not(?!\s+(?:only|just|always|all)\b)|without|nor|other than|instead of|rather than)\b[^;,.:()]*/gi;
function denomsCheck(e, role, text) {
  if (!e.opts || !e.opts.denoms) return [];
  const r = probe(e.key, e.opts, 10000), out = [], ticked = e.opts.denoms;
  const dealt = new Set(), offF = new Set();
  for (const q of r.qs) for (const dd of itemDens(q)) { dealt.add(dd); if (!U.denomAllowed(dd, ticked)) for (const f of famsOf(dd)) offF.add(f); }
  const t = String(text || ''), pt = t.replace(NEG, ' '), nt = [...t.matchAll(NEG)].map(m => m[0]).join(' ; ');
  const named = new Set(); for (const [dd, re] of WORDS) if (new RegExp(`\\b(?:${re})\\b`, 'i').test(pt)) named.add(dd);
  for (const m of pt.matchAll(/(?:^|[^\d.])\d+\s*\/\s*(\d+)(?!\d|\.\d)/g)) named.add(+m[1]);
  if (!named.size) return out;
  for (const f of offF) if (![...named].some(x => famsOf(x).includes(f))) out.push(`DENOMS: the items deal the ${({ 3: 'thirds', 5: 'fifths', 7: 'sevenths' })[f]} family (outside denoms ${JSON.stringify(ticked)}) but the ${role === 'partial' ? 'clause' : 'why'} never names it`);
  for (const [dd, re] of WORDS) if (new RegExp(`\\b(?:${re})\\b`, 'i').test(pt) && ![...dealt].some(x => x === dd)) out.push(`DENOMS: names ${re.split('|')[0]} but no item deals /${dd}`);
  for (const [dd, re] of WORDS) if (new RegExp(`\\b(?:${re})\\b`, 'i').test(nt) && dealt.has(dd)) out.push(`DENOMS: denies ${re.split('|')[0]} but items deal /${dd}`);
  return out;
}
// ---- RANGE: a title bound, or a Support lesson's source-year range
function ceilingOf(id) {
  const tb = TR && String(d.lessons[id].title).match(/\b(?:to|within|up to)\s+(\d{1,3}(?:,\d{3})*|\d+)\b/i);
  if (tb) return { c: +tb[1].replace(/,/g, ''), why: `the title's own bound (${tb[1]})` };
  if (isSupport(id)) return { c: YEAR_RANGE[YR[SRC[id]]], why: `the source year ${YR[SRC[id]]} range (${YEAR_RANGE[YR[SRC[id]]].toLocaleString()})` };
  return { c: Infinity, why: 'no bound' };
}
const itemNumbers = i => { const out = []; const txt = String(i.text || '').replace(/\b\d{1,2}:\d\d\b/g, ' ').replace(/\b(\d{1,3})((?:,\d{3})+)(?![\d,])/g, (_, a, b) => a + b.replace(/,/g, ''));
  for (const m of txt.matchAll(/(?<![\d.])\d+(?:\.\d+)?(?![\d])/g)) out.push(+m[0]);
  for (const part of String(i.a ?? '').replace(/,(?=\d{3}\b)/g, '').split(/[,;]/)) for (const m of part.matchAll(/(?<![\d.])\d+(?:\.\d+)?(?![\d])/g)) out.push(+m[0]);
  return out; };

// a cited Y6 step's (or Y6 lesson's) own ceiling: its title and its direct / partial items
const stepCeil = id => { const u = d.steps[id] || (d.lessons || {})[id]; if (!u) return titleCeil(titles[id] || '');
  let c = titleCeil(u.title); for (const e of [...u.direct, ...u.partial]) c = Math.max(c, probe(e.key, e.opts || {}, e.maxNumber || 10000).max); return c; };
let bad = 0, checked = 0;
const rows = [];
for (const [id, s] of Object.entries(d.lessons || {})) {
  const fails = [];
  const ownItems = [...s.direct, ...s.partial].flatMap(e => probe(e.key, e.opts || {}, e.maxNumber || 10000).items);
  let own = titleCeil(s.title); for (const e of [...s.direct, ...s.partial]) own = Math.max(own, probe(e.key, e.opts || {}, e.maxNumber || 10000).max);
  for (const role of ['pre', 'related']) for (const e of s[role]) {
    checked++;
    const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
    const tag = `${role} ${e.key}${e.opts ? JSON.stringify(e.opts) : ''}${e.maxNumber ? '@' + e.maxNumber : ''}`;
    const cm = role === 'pre' && String(e.why).match(CITE);
    const cited = cm ? (unitYear(cm[1]) === 'Y6' ? stepCeil(cm[1]) : Math.max(titleCeil(titles[cm[1]] || ''), YEAR_RANGE[unitYear(cm[1])] || 0)) : 0;
    let limit = Math.max(1.5 * Math.max(own, cited), 1000);
    if (isSupport(id)) limit = Math.min(limit, Math.max(1.5 * YEAR_RANGE[YR[SRC[id]]], 100));
    if (!TIME.test(e.key) && r.max > limit) fails.push(`${tag}: size ${r.max} > ${limit} — ${r.ex}`);
    const fs_ = [...content(id, e, r, role), ...whyCheck(e, r), ...digitSymbolChecks(e.why, r.items), ...(role === 'pre' ? citeCheck(id, e) : []), ...denomsCheck(e, role, CL.claimText(e.why, titles))];
    for (const f of fs_) fails.push(`${tag}: ${f}`);
  }
  // direct / partial: content (a partial may deal later content only when its clause names it), claims of the clause
  for (const role of ['direct', 'partial']) for (const e of s[role]) {
    const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
    for (const f of content(id, e, r, role)) {
      const word = (f.replace(/^rule 19: /, '').match(/[A-Za-z]{4,}/) || [''])[0].toLowerCase();
      if (role === 'partial' && word && String(e.missing).toLowerCase().includes(word)) continue;
      fails.push(`${role} ${e.key}${JSON.stringify(e.opts || {})}: ${f}`);
    }
    if (role === 'partial') {
      for (const h of CL.claimHits(e.missing, r.items, { gateOnly: true })) if (!h.ok) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause claims "${h.word}" (${h.claim}) but only ${h.hit} of ${h.n} items show it`);
      for (const h of CL.negatedHits(e.missing, r.items)) if (!h.ok) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause says "${h.part}" is not dealt, but ${h.hit} of ${h.n} items do it (${h.claim})`);
      for (const f of denomsCheck(e, 'partial', e.missing)) fails.push(`partial ${e.key}: ${f}`);
      for (const f of digitSymbolChecks(e.missing, r.items)) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})}: ${f}`);
    }
  }
  // F: a link that deals the lesson's own items; DUP: two links of one role with the same items
  const sigOf = r => r.items.map(i => i.text + '|' + i.a + '|' + i.vis + '|' + i.tpl).join('\n');
  const ownSig = new Map(); for (const e of [...s.direct, ...s.partial]) ownSig.set(sigOf(probe(e.key, e.opts || {}, e.maxNumber || 10000)), e.key);
  for (const role of ['pre', 'related']) { const seen = new Map();
    for (const e of s[role]) { const sg = sigOf(probe(e.key, e.opts || {}, e.maxNumber || 10000));
      if (ownSig.has(sg)) fails.push(`${role} ${e.key}${JSON.stringify(e.opts || {})}: deals the same items as the lesson's own ${ownSig.get(sg)} (class F)`);
      if (seen.has(sg)) fails.push(`${role} ${e.key}: duplicate of ${seen.get(sg)} (same items)`); else seen.set(sg, e.key); } }
  // G: a FULL lesson that names decimals deals a decimal operand
  if (s.verdict === 'full') {
    const cc = (s.site && s.site.ccss) || [];
    const names = /decimal/i.test(s.title) || (cc.length && cc.every(c => /decimal/i.test(CCT[c] || CCT[c.replace(/[a-d]$/, '')] || '')));
    if (names && !s.direct.some(e => probe(e.key, e.opts || {}, e.maxNumber || 10000).items.some(i => /(?<![\d,])\d*\.\d/.test(i.text || '')))) fails.push('G: full, and its title / CCSS names decimals, but no direct item has a decimal in its question');
  }
  for (const f of missedOptions(s)) fails.push(`M: ${f}`);
  // TITLEREP and RANGE on this lesson alone
  const one = { steps: {}, lessons: { [id]: s } };
  for (const x of TR.titleRepFinds(one, itemsOf).finds) fails.push(`TITLEREP ${x.kind}: ${x.msg}`);
  { const { c, why } = ceilingOf(id); const clause = [s.missing, ...s.partial.map(p => p.missing)].join(' ; ');
    if (c !== Infinity) for (const [role, list] of [['direct', s.direct], ['partial', s.partial]]) for (const e of list) {
      const over = probe(e.key, e.opts || {}, e.maxNumber || 10000).items.filter(i => Math.max(0, ...itemNumbers(i)) > c);
      if (!over.length) continue;
      if (s.verdict === 'full') fails.push(`RANGE: full, but ${over.length} items of ${e.key} pass the ceiling ${c} (${why})`);
      else if (!/\b(?:above|beyond|over|past|larger than|bigger than|more than) \d|\b\d{1,3}(?:,\d{3})+\b/.test(clause)) fails.push(`RANGE: ${over.length} items of ${role} ${e.key} pass the ceiling ${c} (${why}) and the clause never says so`);
    } }
  bad += fails.length;
  rows.push({ id, verdict: s.verdict, n: s.pre.length + s.related.length, fails: fails.length });
  if (fails.length || ALL) console.log(`${id} [${lessonWk(id)}${isSupport(id) ? ', Support, source ' + YR[SRC[id]] : ''}] own ceiling ${own}: ${fails.length ? fails.length + ' FAIL\n   ' + fails.join('\n   ') : 'ok'}`);
}
console.log(`lessonfit: ${Object.keys(d.lessons || {}).length} lessons, ${checked} links, ${NPER} items a link; ${bad} findings`);
process.exitCode = bad ? 1 : 0;
