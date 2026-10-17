// Y4 (school Grade 3) SITE-LESSON GATES (owner rule 2026-10-16: every site lesson tagged). Every link of the `lessons` section of
// data/curriculum/links/Y4.json is judged from generated items (40 per link: two fresh seed sets x 20, the link's own opts and Max
// Number, Max Number 10,000 when the link names none, so a skill that reads it shows its worst case). Ported from the Y1 lessons
// lane's lessonfit.mjs (passed lessons critic r3: every rule class below) with the Grade 3 rules of the Y4 step lane (linkfit.mjs
// FIRST table) and the Support source-year rules of the Y6 lessons lane (passed lessons critic r2):
//   CITE      a pre's why starts with the step or site lesson it cites and that unit's own title; the unit teaches the key (its
//             direct / partial, the live SKILL_WRM, every passed lane's tagFixes, any lane's lesson direct / partial); the pupil met
//             it BEFORE the lesson: a Grade 3 lesson (committee, school week Wnn; the native lesson takes Y4.B10.S1's week) cites a
//             lower-year unit or a Y4 step / Y4 lesson whose school week is EARLIER than its own; a Support lesson ("Source: G<n>",
//             judged at its SOURCE year, critic Y5 r5 class H) cites only units of its source year or below, never a Grade 3 unit,
//             and a GPK lesson with a Reception phase only an R step of a block BEFORE the phase (phases.json)
//   SIZE      a link deals no number above max(1.5 x c, c + 2), c = the larger of the lesson's ceiling (CEIL: the title's bound,
//             else the numbers its pupils work with: Grade 3 to 1,000; a Support lesson its source year's) and, for a pre, its cited
//             unit's own ceiling; numbers in the question, answer, options and kit payload all count
//   CONTENT   no item set with fewer than 3 different items; a Grade 3 lesson's links carry no content the school first teaches
//             after its week (the Y4 step lane's FIRST table; a related may be 2 weeks ahead); a Support lesson's links carry no
//             content above its source year (SRC_ABOVE; an R / Y1 source also the R/Y1 lane's FLAGS: x / ÷, angles, vertices,
//             shapes past 4 sides, columns, standard units, fractions, coordinates, typed words; an R source no symbol-only equation
//             or number line, R_EQ, and no clock or groups-of sentence, R_WRITTEN); no pre that compares unlike fractions below a
//             Grade 4 source (4.NF.A.2)
//   RESPONSE  a FULL lesson's direct items are a response of its year: an R / Y1 source carries no FLAGS content its title does
//             not name, an R source no R_EQ / R_WRITTEN skill
//   WHY       every claim of the why (and of the cited unit's full title) is true of the items: claims.mjs, the Y6 why rules
//             (digits, units, fraction families, grids, multiples) and the Y1 rules (shapes, column, ASKED, NOPIC and positive
//             pictures, ORIENT, ZERO, WINDOW, OBJN, story kind, share vs group, bounds G5)
//   CLAUSE    a partial clause's positive gated claims are true of that partial's items, an operation it says is never dealt is
//             not dealt, its digit-count, symbol and bound claims hold, "never 0" is not answered 0 (NEVER0), "no pictures" holds
//   OWN / DUP a pre / related never deals the lesson's own items (class F); no two links of one role deal the same items
//   M         a clause that says "never X" where an option of a listed skill is labelled X must use that option (class M, M')
//   TITLEREP  the title's claims (titlerep.mjs, with the Y1 and Y4 title claims) are dealt by a FULL lesson's direct items, or
//             named in a partial / gap lesson's clause
//   RANGE     a direct / partial item above the lesson's ceiling makes a FULL lesson not full, and a partial clause must say so
//   FULLAUDIT a FULL lesson has a hand-audit row (full_audit.json) naming its direct links, reading its title and every site CCSS
//             code; a code the row reads as dealt is dealt by the items (STD_ITEM); a group / size range the row states holds
//   DENOMS, G the Y6 lane's denominator-family and decimal rules
//   ROUND 2 (lessons critic r1 G1-G3): SIZE holds every pre / related to the lesson's OWN dealt maximum (its direct / partial items;
//             CEIL only for a lesson that deals none) and a pre also to its cited unit's; a story cell's steps (a × b, a ÷ b) past 12 or
//             of tables untaught by the week fail (G1); a bound the items break fails: "areas 4 to 48" read both ways, "products to 90",
//             "never more than N", "dividing by 2 to 8", "within the tables" (G2); a listed group size must be dealt, a negated fraction
//             family holds on every skill, a $N bill named or denied holds against the payload's notes, "the other models in ..." holds
//             for every distractor (G3); a "how long" / duration claim needs duration items; a "wk Wnn" in a why is the cited step's week
// usage: node lessonfit.mjs [<Y4.json>] [--all] [--n 40] [--seeds '[[s1,stride],[s2,stride]]']       (exit 1 on any finding)
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../../', import.meta.url).pathname;
const _log = console.log, _warn = console.warn; console.log = () => {}; console.warn = () => {};
const g = await import(R + 'js/modules/generate-question.js');
const so = await import(R + 'js/modules/skill-options.js');
const U = await import(R + 'js/modules/utils.js');
console.log = _log; console.warn = _warn;
const fs = await import('fs');
const CL = await import('./claims.mjs');
const TR = await import('./titlerep.mjs');
const args = process.argv.slice(2);
const FILE = args.find(a => a.endsWith('.json')) || R + 'data/curriculum/links/Y4.json';
const d = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const ALL = args.includes('--all');
const NPER = args.includes('--n') ? +args[args.indexOf('--n') + 1] : 40;
const SEEDS = args.includes('--seeds') ? JSON.parse(args[args.indexOf('--seeds') + 1]) : [[61001, 37], [90907, 53]];
const wrm = JSON.parse(fs.readFileSync(R + 'data/curriculum/wrm-steps.json', 'utf8'));
const titles = {}, yearOf = {}; for (const y of wrm.years) for (const b of y.blocks) for (const s of b.steps) { titles[s.id] = s.title; yearOf[s.id] = y.id; }
const SITE = JSON.parse(fs.readFileSync(R + 'data/curriculum/site-lessons.json', 'utf8')).lessons;
const siteOf = Object.fromEntries(SITE.map(l => [l.id, l]));
for (const l of SITE) titles[l.id] = l.title;
const PH = JSON.parse(fs.readFileSync(new URL('phases.json', import.meta.url), 'utf8')).phases;
let DATA = process.env.WRM_TAG_DATA;
if (!DATA || !fs.existsSync(DATA + '/prior.json') || !fs.existsSync(DATA + '/keys.json')) {
  const os = await import('os'), path = await import('path'), cp = await import('child_process');
  DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'wrm-lessonfit-y1-'));
  cp.execFileSync('node', [new URL('prior.mjs', import.meta.url).pathname, DATA + '/prior.json']);
  cp.execFileSync('node', [new URL('keys.mjs', import.meta.url).pathname, DATA + '/keys.json']);
}
const prior = JSON.parse(fs.readFileSync(DATA + '/prior.json', 'utf8'));
const K = JSON.parse(fs.readFileSync(DATA + '/keys.json', 'utf8'));
const n = w => +String(w).slice(1);
// a Support lesson (enrich-native, "Source: G<n>.") is judged at its SOURCE year: GPK = R, GK = Y1, G1 = Y2, G2 = Y3 (Y6 lane SRC)
const YR = ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'];
const SRC = {};
for (const l of SITE) { const m = l.flag === 'enrich-native' && String(l.note || '').match(/^Source: G?(PK|K|\d)\./); if (m) SRC[l.id] = m[1] === 'PK' ? 0 : m[1] === 'K' ? 1 : +m[1] + 1; }
const isSupport = id => SRC[id] != null && SRC[id] < 4;
const srcYear = id => YR[SRC[id]];
const phaseOf = id => { const m = String(siteOf[id]?.note || '').match(/\(Phase (\d+)\)/); return m ? PH[m[1]] : null; };
const NATIVE_STEP = { 'G3|-|poundstensonesandpenceusdollarscents': 'Y4.B10.S1' };   // the retitled Y4 step (site note)
const lessonWk = id => isSupport(id) ? null : NATIVE_STEP[id] ? (prior[NATIVE_STEP[id]]?.wk || 'W38') : (siteOf[id]?.firstWeek || 'W38');
const wkOf = id => siteOf[id] ? lessonWk(id) : (prior[id]?.wk || '');
const blockNo = id => +String(id).split('.')[1].slice(1);
// THE LESSON CEILINGS: the largest number each lesson works with: the title's bound, else what its pupils work with there (a Grade 3
// lesson: 1,000, 3.NBT; a times-table lesson: 144; a Support lesson: its source year's numbers, a Reception phase's own numbers).
// 0 = a shape / measure lesson with no numbers of its own, held to its year's range (REACHED).
const CEIL = {
  findtheruleinaninputoutputtable: 144, patternsonthemultiplicationtable: 144, propertiesofmultiplicationcommutativeidentityanddistributive: 144,
  twostepwordproblemswiththefouroperations: 1000, partitionshapesintoequalareas: 0, solveadditionandsubtractionwordproblemswithin1000usingbarmodels: 1000,
  areaasmultiplication: 144, distributiveandadditivearea: 144, measureandestimatemassandliquidvolumegkgmll: 1000, measuretothehalfandquarterinch: 0,
  buildalineplotfrominchmeasurements: 0, compareamountsmorefewersame: 5, comparedurationsoftime: 0, comparingmultiplicationstatements: 100,
  countmoneynotesandcoins: 100, doublesandneardoubleswithin20: 20, finddurationsoftime: 0, introducecapacityandvolume: 0, introduceweightandmass: 0,
  orderfractions: 12, poundstensonesandpenceusdollarscents: 100, selectmoney: 100, sharingandgroupingfairshares: 12 };
const slug = id => id.split('|-|')[1];
const R_BLOCK_CEIL = { 1: 5, 3: 3, 5: 5, 7: 5, 9: 8, 11: 10, 13: 20, 14: 10, 16: 12, 18: 10 };
const YEAR_CEIL = { R: 10, Y1: 20, Y2: 100, Y3: 100, Y4: 1000 };   // a measure lesson with no numbers of its own: its year's working numbers
const reached = id => { if (!isSupport(id)) return YEAR_CEIL.Y4; const ph = phaseOf(id);
  if (srcYear(id) === 'R' && ph) { let c = 3; for (const [b, v] of Object.entries(R_BLOCK_CEIL)) if (+b < ph.first) c = Math.max(c, v); return c; }
  return YEAR_CEIL[srcYear(id)]; };
const ceilOf = id => { const c = CEIL[slug(id)]; if (c == null) throw new Error('no CEIL for ' + id); return c || reached(id); };
// who teaches a key: live SKILL_WRM, every passed lane's tagFixes and steps' direct / partial, every lane's lessons' direct / partial
const taught = {}; const add = (k, s) => (taught[k] ??= new Set()).add(s);
const merged = new Map();
for (const [k, v] of Object.entries(K.tags)) for (const t of v) merged.set(k + '|' + (typeof t === 'string' ? t : t.step), [k, typeof t === 'string' ? t : t.step]);
const LANES = YR.map(y => y === 'Y4' ? d : (fs.existsSync(R + `data/curriculum/links/${y}.json`) ? JSON.parse(fs.readFileSync(R + `data/curriculum/links/${y}.json`, 'utf8')) : null)).filter(Boolean);
for (const od of LANES) for (const t of od.tagFixes) { if (t.action === 'remove') merged.delete(t.key + '|' + t.step); else if (['add', 'full', 'partial'].includes(t.action)) merged.set(t.key + '|' + t.step, [t.key, t.step]); }
for (const [, [k, s]] of merged) add(k, s);
for (const od of LANES) { for (const [sid, s] of Object.entries(od.steps)) for (const e of [...s.direct, ...s.partial]) add(e.key, sid);
  for (const [lid, s] of Object.entries(od.lessons || {})) for (const e of [...s.direct, ...s.partial]) add(e.key, lid); }
const unitYear = id => yearOf[id] || (siteOf[id] ? siteOf[id].wrmYear : null);

const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&times;/g, '×').replace(/&divide;/g, '÷').replace(/&minus;/g, '−').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ');
const lab = x => x == null ? '' : typeof x === 'object' ? (x.label ?? x.text ?? x.html ?? JSON.stringify(x)) : String(x);
const SKIPK = new Set(['slotDigits', 'level', 'frames', 'places', 'wrap', 'correct', 'blanks', 'tiles', 'seed', 'w', 'h', 'x', 'y', 'width', 'height', 'size', 'r', 'cx', 'cy', 'id', 'idx', 'index']);
// maxdealt.mjs (R/Y1 lane): the content a PK / K link must not carry, and the rule-19 classes, read per item
const FLAGS = { times: /×|÷|multipl|divid/i, parallel: /parallel|perpendicular|right angle|acute|obtuse/i, poly: /octagon|hexagon|pentagon|quadrilateral|trapez|rhomb|parallelogram|kite|heptagon|nonagon|decagon/i,
  vert: /vert(ex|ices)/i, column: /column|carry|regroup|borrow|exchange/i, units: /\b(cm|mm|km|kg|g|ml|mL|inch|inches|feet|foot|yard|pound|ounce|liters?|litres?|grams?|meters?|metres?)\b/,
  frac: /\b(\d+)\s*\/\s*(\d+)\b|third|fifth|sixth|eighth/i, coord: /coordinate|\(\s*\d+\s*,\s*\d+\s*\)/i, word: /write the (word|name)|type the|spell/i };
const FLAGWHY = { times: 'it uses x or ÷', parallel: 'it asks about angles or parallel sides', vert: 'it asks about vertices', column: 'it uses a column layout or regrouping',
  coord: 'it uses coordinates', word: 'it asks for typed words', poly: 'it shows shapes past 4 sides', units: 'it uses standard units', frac: 'it shows fractions' };
const C19 = { skip25: /by 2s|by 5s|count-by-2s|count-by-5s|in 2s|in 5s/i, nline: /number.?line|numberLine|"nl/i, money: /¢|cent|penny|nickel|dime|dollar|\$/i, clock: /o'clock|half past|clock/i,
  frac: /\bhalf\b|\bhalves\b|quarter|\d\/\d/i, units: /\b(cm|inch|inches|centimet)/i, lt: /[<>]|\bis (greater|less) than\b/i, quad: /square|rectangle/i, minus: /−|-\s*\d|subtract|take away/i,
  array: /\barray|rows of/i, diff: /how many (more|fewer)\b[^?]*\bthan\b|how many less/i };
const SENT = /^(addition:(nl_add|number_line_add|add_three|add_10_no_regroup|add_10_mixed|cloze_addition|number_families_add|add_sub_fact_family|add_20|equal_sign|add_facts|add_sub_mixed)|subtraction:(nl_sub|number_line_sub|missing_add_sub|sub_10|sub_20|mixed_add_sub|sub_10_no_regroup|sub_10_mixed))/;
const R_EQ = /^(addition:(nl_add|number_line_add|add_three|add_10_no_regroup|add_10_mixed|cloze_addition|number_families_add|add_sub_fact_family|add_20|equal_sign|add_facts|add_sub_mixed)|subtraction:(nl_sub|number_line_sub|missing_add_sub|sub_10|sub_20|mixed_add_sub|sub_10_no_regroup|sub_10_mixed)|number_sense:place_on_number_line)/;
const R_WRITTEN = /^(measurement:(time_|clock_)|multiplication:)/;
const TIME = /^measurement:(time|elapsed|clock|order_clocks|mixed_time)/;
const MONEYK = /^measurement:(money|coin_value|equiv_coin|enough_money|make_change)/;
const cache = new Map();
function probe(key, opts, range) {
  const id = key + JSON.stringify(opts || {}) + range; if (cache.has(id)) return cache.get(id);
  const [c, k] = key.split(':'); let max = 0, ex = ''; const items = [], qs = [], flags = {}, c19 = {};
  for (const [base, step] of SEEDS) for (let i = 0; i < NPER / SEEDS.length; i++) {
    let q; console.log = () => {}; try { q = g.generateQuestionFor({ category: c, skill: k, opts: opts || {}, range, seed: base + i * step, itemIndex: i % 20, itemCount: 20 }); } catch (e) { items.push({ err: e.message }); continue; } finally { console.log = _log; }
    if (!q) continue;
    const text = strip(q.text), a = strip(typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans), pay = q.cell ? JSON.stringify(q.cell.payload) : '';
    const x = strip([...(q.options || []), ...(q.tiles || []), ...(q.bins || []), ...(q.items || [])].map(lab).join(' ; '));
    const raw = String(q.visual ?? '');
    const it = { at: q.answerType || '', text, a, x, pay, vis: strip(q.visual), raw: raw.toLowerCase().slice(0, 6000), tpl: q.cell ? q.cell.template : '',
      draw: `${(raw.match(/<line\b/g) || []).length >= 8 || (raw.match(/<rect\b/g) || []).length >= 12 ? 'grid ' : ''}${/<circle\b|kind":"circle|d="[^"]*\bA\s*[\d.]/.test(raw + pay) ? 'circle ' : ''}` };
    items.push(it); qs.push(q);
    let m0 = 0; const t = `${text} ${x} ${a.split(/[,;]/).join(' ')}`.replace(/\d+(\.\d+)?\s*°/g, ' ');
    for (const m of t.matchAll(/\d+/g)) m0 = Math.max(m0, +m[0]);
    const walk = (v, kk) => { if (v == null || SKIPK.has(kk)) return; if (typeof v === 'number' && Number.isFinite(v)) m0 = Math.max(m0, v); else if (Array.isArray(v)) v.forEach(z => walk(z, kk)); else if (typeof v === 'object') for (const [aa, bb] of Object.entries(v)) walk(bb, aa); };
    if (q.cell && !TIME.test(key) && !MONEYK.test(key)) walk(q.cell.payload, '');   // a money payload holds cents (805 for $8.05)
    if (q.cell && Array.isArray(q.cell.payload?.rows)) for (const rw of q.cell.payload.rows) for (const v of [rw?.x, rw?.y]) if (typeof v === 'number') m0 = Math.max(m0, v);   // a function table's In / Out numbers
    if (k === 'tens_foundation_visual' && q.cell?.payload?.n) m0 = Math.max(m0, q.cell.payload.n * 10);
    it.max = m0; if (m0 > max) { max = m0; ex = text.trim().slice(0, 70); }
    const full = `${text} ${JSON.stringify(q.ans ?? '')} ${pay} ${strip(q.visual || '').slice(0, 400)}`;   // maxdealt.mjs: the options are not read (a pick's distractor names)
    for (const [nm, re] of Object.entries(FLAGS)) if (re.test(full)) flags[nm] = (flags[nm] || 0) + 1;
    const t19 = `${text} ${JSON.stringify(q.ans ?? '')} ${q.cell ? JSON.stringify(q.cell) : ''} ${strip(q.visual || '').slice(0, 600)}`;
    for (const [nm, re] of Object.entries(C19)) if (re.test(t19)) c19[nm] = (c19[nm] || 0) + 1;
  }
  const r = { max, ex, items, qs, flags, c19, distinct: new Set(items.map(i => i.text + '|' + i.a + '|' + i.pay + '|' + i.raw)).size }; cache.set(id, r); return r;
}
const rangeOf = e => e.maxNumber || 10000;
const P = e => probe(e.key, e.opts || {}, rangeOf(e));
const itemsOf = (key, opts) => probe(key, opts || {}, 10000).items;
const titleNums = t => (String(t).match(/(?<![23]-|\d)\b\d+\b(?!-?D\b)/gi) || []).map(Number);
// ---- Grade 3 rule 19 (the Y4 step lane's linkfit.mjs FIRST table, xlsx Grade 3 sheet): the week the school first teaches each
// content type; earlier grades' content is met. A pre may carry none after the lesson's week, a related none more than 2 weeks after
const FIRST = [
  ['fractions (a/b)', 'W07', (e, said) => /\b\d+\/\d+\b/.test(said) && !/money|coin|time|elapsed|clock/.test(e.key)],
  ['mixed numbers / fractions past 1', 'W07', (e, said) => /\b\d+ \d+\/\d+\b/.test(said)],
  ['angles', 'W27', (e, said) => /^angles_lines:(identify_angles|measure_angles|additive_angles)/.test(e.key) || /\b(acute|obtuse|right angle)/i.test(said)],
  ['hundredths', 'W31', (e, said) => !/money|coin/.test(e.key) && /\/100\b|\b0\.\d\d\b|hundredth/i.test(said)],
  ['area', 'W18', (e, said) => /\barea\b/i.test(said)],
  ['decimals', 'W29', (e, said) => /(?<![\d,$])\d+\.\d+/.test(said) && !/money|coin/.test(e.key)],
  ['column 3-digit × 1-digit', 'W36', (e, said, r) => r.items.some(i => i.tpl === 'stack' && /"op":"[×x*]"/.test(i.pay) && /"operands":\[\d{3,}/.test(i.pay))],
  ['3-digit ÷ 1-digit', 'W36', (e, said) => [...said.matchAll(/\b(\d{3})\s*÷\s*(\d)\b/g)].some(x => +x[1] > 120)],
  ['coordinates / axes', 'W37', (e, said) => /^coordinates:/.test(e.key) || /coordinates|[xy]-axis/i.test(said)],
];
// tables the school has taught by a week: Grade 2 (Y3) 0, 1, 2, 3, 4, 5, 8, 10; Grade 3 adds 6 (W01), 7 and 9 (W02), 11 and 12 (W03)
const tablesBy = wk => { const t = new Set([0, 1, 2, 3, 4, 5, 8, 10]); if (wk >= 'W01') t.add(6); if (wk >= 'W02') { t.add(7); t.add(9); } if (wk >= 'W03') { t.add(11); t.add(12); } return t; };
// content above a Support lesson's SOURCE year, read on every word an item shows (question, answer, options, the picture's text):
// [what, the highest source index it is above (R 0 ... Y3 3), regex]
const SRC_ABOVE = [
  ['decimals (4.NF.C.6, Y5)', 3, /(?<![\d.$£¢])\d*\.\d+(?!\d)|\btenths\b|\bhundredths\b/i],
  ['× or ÷ past the 2, 5 and 10 tables (Y3)', 2, /\b(?:[346789]|1[12])\s*[×x÷]\s*\d|\d\s*[×x÷]\s*(?:[346789]|1[12])\b/],
  ['fractions other than halves and quarters (Y3)', 2, /\b\d+\/(?:[35-9]|1\d)\b|\bthirds?\b|\bfifths?\b|\bsixths?\b|\beighths?\b/i],
  ['grams, kilograms, litres or millilitres (Y2: non-standard and standard units start at Grade 1)', 1, /\b\d+\s*(?:g|kg|ml|mL|l|L)\b|\bgrams?\b|\bkilograms?\b|\blit(?:re|er)s?\b|\bmillilit/],
  ['a clock time (Y1 / Y2)', 0, /o'clock|half past|\b\d{1,2}:\d\d\b/i],
];
function content(id, e, r, role) {
  const out = [], link = role === 'pre' || role === 'related';
  if (r.items.some(i => i.err)) out.push('generation error');
  if (!r.items.length) out.push('no items');
  if (r.items.length >= 20 && r.distinct < 3) out.push(`degenerate: ${r.distinct} distinct items in ${r.items.length}`);
  const said = r.items.map(i => `${i.text || ''} → ${i.a || ''} ; ${i.x || ''}`).join(' | ');
  const all = said + ' | ' + r.items.map(i => `${i.pay || ''} ${i.vis || ''}`).join(' | ');
  if (/(?<![\d\w)])[−-]\d/.test(r.items.map(i => `${i.text || ''} ${i.a || ''}`).join(' | ')) && !/integers:/.test(e.key)) out.push('negative numbers');
  if (isSupport(id)) {
    const sy = SRC[id], shown = said + ' | ' + r.items.map(i => i.vis || '').join(' | ');
    for (const [nm, maxSrc, re] of SRC_ABOVE) if (sy <= maxSrc && !(MONEYK.test(e.key) && /^decimals/.test(nm))) { const m = shown.match(re); if (m) out.push(`SUPPORT: ${nm} ("${m[0]}"), above this Support lesson's source year ${srcYear(id)}`); }
    if (link && sy <= 1) for (const [nm, c] of Object.entries(r.flags)) if (c) out.push(`${FLAGWHY[nm]} (${c} of ${r.items.length} items), above a ${srcYear(id)} source`);
    if (link && sy === 0) { if (R_EQ.test(e.key)) out.push('a symbol equation or number line: not a Reception response (R_EQ)');
      if (R_WRITTEN.test(e.key)) out.push('a written Kindergarten answer (clock times, groups-of sentences): not a Reception response'); }
    if (link && sy <= 3) { const uc = r.items.some(i => { const t = `${i.text || ''} ${i.x || ''} ${i.a || ''} ${i.pay || ''}`;
      if (!/compar|order|greater|greatest|less|least|largest|smallest|biggest|[<>]/i.test(t)) return false;
      const f = [...t.matchAll(/(?<![\d/])(\d+)\/(\d+)(?![\d/])/g)].map(m => [+m[1], +m[2]]); return f.some((a, j) => f.slice(j + 1).some(b => a[0] !== b[0] && a[1] !== b[1])); });
      if (uc) out.push(`H: compares or orders unlike fractions (4.NF.A.2), above this Support lesson's source year ${srcYear(id)}`); }
  } else if (link) {
    const wk = lessonWk(id), lim = role === 'related' ? 'W' + String(n(wk) + 2).padStart(2, '0') : wk;
    for (const [nm, w, f] of FIRST) if (w > lim && f(e, said, r)) out.push(`rule 19: ${nm} first taught ${w}, the lesson is ${wk}${role === 'related' ? ' (related: more than 2 weeks ahead)' : ''}`);
    const tb = tablesBy(lim);
    for (const i of r.items) { const m = `${i.text || ''}`.match(/\b(\d{1,2})\s*[×x]\s*(\d{1,2})\b/); if (m && +m[1] <= 12 && +m[2] <= 12 && !tb.has(+m[1]) && !tb.has(+m[2])) { out.push(`rule 19: the ${m[1]} and ${m[2]} tables (${m[0]}) are not taught by ${lim}`); break; } }
    for (const f of storyTableChecks(r.items, tb, lim)) out.push(f);
    const dens = [...all.matchAll(/(?:\b\d+|\?|_+)\/(\d+)\b/g)].map(m => +m[1]).filter(x => x > 12 && x !== 100);
    if (dens.length) out.push(`denominator ${Math.max(...dens)} (Grade 3 stops at twelfths)`);
    if ((/\d+\s*°(?!\s*[FC])/.test(all) || /\bdegrees\b(?! (Celsius|C\b))/.test(said)) && !/temperature/.test(e.key)) out.push('angle measured in degrees (4.MD.C)');
  }
  return out;
}
// lessons critic r1 F4 (Y6): digit-count and symbol claims of a clause or a why, read against the items
const WHOLES = t => [...String(t || '').replace(/(\d),(?=\d{3}\b)/g, '$1').matchAll(/(?<![\d.\/])\d+(?![\d.\/]|\.\d)/g)].map(m => m[0]);
export function digitSymbolChecks(text, items) {
  const out = [], t = String(text || ''), N = items.length || 1;
  const negs = [...t.matchAll(/\b(?:never|no|not|without|nor)\b([^;.]*)/gi)].map(m => m[1].replace(/\([^)]*\)/g, ' '));
  for (const p of negs) for (const m of p.matchAll(/\b(\d)-digit\b/g)) { const D = +m[1];
    if (/\bonly\b|now and then|sometimes|rarely/i.test(p.slice(0, m.index))) continue;
    const hit = items.filter(i => WHOLES(i.text).some(w => w.length === D)).length;
    if (hit) out.push(`CLAUSE: says never a ${D}-digit number, but ${hit} of ${N} items show one`); }
  for (const m of t.matchAll(/\bonly (\d)-digit\b|\b(\d)-digit (?:numbers? )?only\b/gi)) { const D = +(m[1] || m[2]);
    const off = items.filter(i => { const w = WHOLES(i.text)[0]; return w && w.length !== D; });
    if (off.length) out.push(`CLAUSE: says ${D}-digit only, but ${off.length} of ${N} items start with another size`); }
  // a number bound the text states as the items' own ("to 10", "within 5", "1 to 8"): no item may pass it (Y1)
  for (const m of t.matchAll(/\b(?:numbers? (?:to|within|up to)|within|totals? (?:to|within)|wholes? (?:to|within)|(?:0|1) to)\s+(\d+)\b/gi)) {
    const pre = t.slice(Math.max(0, m.index - 30), m.index);
    if (/\b(?:never|no|not|only past|past|beyond|above|over)\b[^;]*$/i.test(pre)) continue;
    const L = +m[1], over = items.filter(i => (i.max || 0) > L);
    if (over.length) out.push(`says "${m[0]}" but ${over.length} of ${N} items pass ${L} (${over[0].text.trim().slice(0, 60)})`); }
  return out;
}
const ASKED = [['cube', /\bcubes?\b/i, /\bcubes?\b/i], ['cuboid', /\bcuboids?\b|rectangular prisms?/i, /\bcuboids?\b|rectangular prisms?/i], ['sphere', /\bspheres?\b/i, /\bspheres?\b/i],
  ['cone', /\bcones?\b/i, /\bcones?\b/i], ['cylinder', /\bcylinders?\b/i, /\bcylinders?\b/i],
  // lessons critic r2 G8: ANY solid or flat shape the text says is clicked / found / named, not only the five title solids
  ['pyramid', /\bpyramids?\b/i, /\bpyramids?\b/i], ['prism', /(?<!rectangular )\bprisms?\b/i, /(?<!rectangular )\bprisms?\b/i], ['hemisphere', /\bhemispheres?\b/i, /\bhemispheres?\b/i],
  ['circle', /\bcircles?\b/i, /\bcircles?\b/i], ['triangle', /\btriangles?\b/i, /\btriangles?\b/i], ['square', /\bsquares?\b/i, /\bsquares?\b/i],
  ['rectangle', /\brectangles?\b/i, /\brectangles?\b/i], ['hexagon', /\bhexagons?\b/i, /\bhexagons?\b/i], ['pentagon', /\bpentagons?\b/i, /\bpentagons?\b/i],
  ['diamond', /\bdiamonds?\b|\brhomb\w*/i, /\bdiamonds?\b|\brhomb\w*/i], ['oval', /\bovals?\b/i, /\bovals?\b/i]];
// G2 / lessons critic r2 G8: "no pictures" in any wording ("words only", "without any drawing", "not pictured", "never a picture")
const NOPIC = /\b(?:no|never|without)\b[^;.]{0,40}\bpictur|\b(?:no|never|without)\s+(?:any\s+|a\s+)?(?:drawings?|images?)\b|\bwithout any (?:drawing|picture)|\bnot (?:pictured|drawn)\b|\bwords only\b|\bin words alone\b|\bunpictured\b/i;
const hasPic = i => /"pic":\s*[\[{"]/.test(i.pay || '');
// a GENERAL "no pictures" claim (no / without any pictures, words only, not pictured) is held to every kind of picture; a narrower
// negation ("never a pictured group with one more added") only to the story cell's pictured groups (payload.pic)
const NOPIC_ALL = /\b(?:no|without)\s+(?:any\s+)?(?:pictures?|drawings?|images?)\b|\bnever a (?:picture|drawing)\b|\bwithout any (?:drawing|picture)|\bnot (?:pictured|drawn)\b|\bwords only\b|\bin words alone\b|\bunpictured\b/i;
const noPicHits = (t, items) => items.filter(i => hasPic(i) || (NOPIC_ALL.test(t) && pictured(i))).length;
// an item that shows the pupil a picture: a story cell (word-work) only through payload.pic (its markup has svg answer boxes, not
// pictures); any other item through its picture payload (counters, a bag, a shape), an image, an svg drawing or emoji
export const pictured = i => i.tpl === 'word-work' ? hasPic(i)
  : /"kind":"(?:join|takeaway|count|sort|teen)"|"bag":|"shape":|<img|<svg/i.test(`${i.pay || ''} ${i.raw || ''}`) || /[\u{1F300}-\u{1FAFF}\u{2B1B}-\u{2B55}\u{25A0}-\u{25FF}]/u.test(`${i.x || ''} ${i.vis || ''}`);
// lessons critic r2 F13 / G8 (orientation): a claim that shapes are seen turned or resized needs items that turn or resize them
const ORIENT = /\bwhichever way\b|\bany way up\b|\bwhatever (?:way|its? (?:size|orientation)|their (?:size|orientation))|\bin any orientation\b|\bhowever (?:it is|they are) turned\b|\bturned (?:or|and) (?:resized|flipped|made (?:bigger|smaller))\b|\b(?:each|every) (?:shape|solid|piece) (?:is )?(?:turned|rotated)\b|\beach turned\b|\bturned a different way\b|\bturned shapes\b|\bat different sizes\b|\bof different sizes\b|\bwhatever way\b/i;
const turnedItem = i => /rotate\(|transform="[^"]*rotate|"rot(?:ation)?":|"turn(?:ed)?":|\bturn(?:ed|s)?\b|\brotat|\bflip/i.test(`${i.text || ''} ${i.raw || ''} ${i.pay || ''}`);
// lessons critic r2 F12 (zero): a positive zero claim needs an item that deals 0; a clause that says 0 is never written / found needs none
const ZEROC = /\bzero\b|\bnone\b|\bempty (?:frame|set|group|plate|box)\b|\bshows 0\b|\bwrites? 0\b/i;
const zeroItem = i => String(i.a).trim() === '0' || /(?<![\d.])0(?![\d.])/.test(`${i.text || ''} ${i.vis || ''}`);
// builder r3 sweep class A: a why that says the items build / count / find "4 and 5" (the cited step's window) when they deal a wider
// range must say "among them"; at least half the items must be those numbers otherwise
const WINDOW = /\b(?:build\w*|count\w*|find\w*|see\w*|after|before)\s+(?:a group of |groups of |the numbers? )?(\d+)(?:\s*,\s*(\d+))?\s+(?:and|or)\s+(\d+)\b/gi;
// builder r3 sweep class C: an object named as an example ("apples, fish, balls") must be an object the items show
const OBJN = ['apple', 'fish', 'ball', 'flower', 'star', 'heart', 'cookie', 'button', 'crayon', 'bead', 'stamp', 'shell', 'balloon', 'truck', 'feather'];
// builder r3 sweep class D (audit rows): a code the row reads as dealt must be dealt by the direct items
export const STD_ITEM = {
  'K.G.A.2': { why: 'shapes named whatever their orientation or size', ok: items => items.some(turnedItem) },
  'K.G.A.3': { why: 'flat (2-D) told from solid (3-D)', ok: items => items.some(i => /\bflat\b|\bsolid\b|two-dimensional|three-dimensional|\b2-?D or 3-?D\b/i.test(i.text || '')) },
  'K.CC.A.3': { why: 'a numeral written', ok: items => items.filter(i => /^(number|text)$/.test(i.at || '')).length >= items.length / 2 },
  // Y4 (Grade 3) codes a row may read as dealt only when the items deal them
  '3.OA.D.8': { why: 'two-step stories', ok: items => items.some(i => (String(i.pay || '').match(/"op":/g) || []).length >= 2) },
  '3.MD.A.1': { why: 'times to the nearest minute or intervals in minutes', ok: items => items.some(i => /"m":(?:[1-9]|[1-5][0-9])\b/.test(i.pay || '') && !/"m":(?:0|5|10|15|20|25|30|35|40|45|50|55)\b/.test(i.pay || '')) },
  '3.OA.D.9': { why: 'a pattern explained with a property', ok: items => items.some(i => /\bexplain|\bwhy\b/i.test(i.text || '')) },
  '2.OA.B.2': { why: 'subtraction within 20', ok: items => items.some(i => /\d\s*[−-]\s*\d/.test(i.text || '')) } };
// G5 (lessons critic r1): a bound the text states ("wholes to 20", "numbers to 100") must be reached: a bound past 1.5 x the largest
// number dealt (and past it + 2) is a false claim; a negated bound ("never past 10") is not a claim
export function boundTooBig(text, items) {
  const t = String(text || ''), out = [], M = Math.max(0, ...items.map(i => i.max || 0));
  if (!items.length) return out;
  for (const m of t.matchAll(/\b(?:numbers? (?:to|within|up to)|within|totals? (?:to|within)|wholes? (?:to|within)|sums? (?:to|within)|bonds? (?:to|within)|facts? (?:to|within)|count(?:ing)? (?:to|within)|(?:0|1) to)\s+(\d+)\b/gi)) {
    const pre = t.slice(Math.max(0, m.index - 30), m.index);
    if (/\b(?:never|no|not|only past|past|beyond|above|over)\b[^;]*$/i.test(pre)) continue;
    const L = +m[1];
    if (L > Math.max(1.5 * M, M + 2)) out.push(`says "${m[0]}" but the largest number dealt is ${M}`);
  }
  return out;
}
// Y4 builder sweep S1 (NEVERUNIT): a unit the text says is never shown ("never grams") must not be shown by any item (the r1 sweep
// found "reads a kilogram scale; never grams" on items that read grams); S5 (BETWEEN): "between 0 and 1" (or any "between A and B")
// stated of the items holds for every number they show or answer (fractions and mixed numbers read as values)
const UNITW = { grams: /\b\d[\d,]*\s*g\b|\bgrams?\b/, kilograms: /\b\d[\d,]*\s*kg\b|\bkilograms?\b/, litres: /\b\d[\d,.]*\s*L\b|\blit(?:re|er)s?\b/,
  millilitres: /\bm[lL]\b|\bmillilit/, inches: /\binch(?:es)?\b|\b\d+\s*in\b/, feet: /\bfeet\b|\bfoot\b|\bft\b/, centimetres: /\bcm\b|\bcentimet/, metres: /\b\d+\s*m\b|\bmet(?:re|er)s?\b/,
  minutes: /\bmin(?:ute)?s?\b/, hours: /\bh\b|\bhours?\b/ };
const UNITN = { grams: /\bgrams?\b/i, kilograms: /\bkilograms?\b/i, litres: /\blit(?:re|er)s?\b/i, millilitres: /\bmillilit/i, inches: /\binch(?:es)?\b/i, feet: /\bfeet\b/i,
  centimetres: /\bcentimet/i, metres: /(?<!centi|milli|kilo)\bmet(?:re|er)s?\b/i, minutes: /\bminutes?\b/i, hours: /\bhours?\b/i };
export function unitNegChecks(text, items) {
  const out = [], N = items.length || 1;
  const negs = [...String(text || '').matchAll(/\b(?:never|no|without|nor)\b([^;.]*)/gi)].map(m => m[1].split(/\b(?:and|or)\s+(?:never|no)\b|,\s*(?:never|no)\b/)[0]);
  for (const p of negs) for (const [u, re] of Object.entries(UNITN)) if (re.test(p)) {
    const hit = items.filter(i => UNITW[u].test(`${i.text || ''} ¦ ${i.a || ''} ¦ ${i.vis || ''}`)).length;
    if (hit) out.push(`NEVERUNIT: says never ${u}, but ${hit} of ${N} items show ${u}`); }
  return out;
}
const fracVal = t => { const m = String(t).match(/^(\d+)\s+(\d+)\/(\d+)$|^(\d+)\/(\d+)$|^(\d+(?:\.\d+)?)$/); if (!m) return null;
  return m[1] ? +m[1] + m[2] / m[3] : m[4] ? m[4] / m[5] : +m[6]; };
export function betweenChecks(text, items) {
  const out = [];
  for (const m of String(text || '').matchAll(/\bbetween (\d+) and (\d+)\b/gi)) { const lo = +m[1], hi = +m[2];
    const pre = String(text).slice(Math.max(0, m.index - 30), m.index); if (/\b(?:never|no|not)\b[^;]*$/i.test(pre)) continue;
    const off = items.filter(i => String(i.a || '').split(/,\s*/).map(fracVal).some(v => v != null && (v < lo || v > hi)));
    if (off.length) out.push(`BETWEEN: says "${m[0]}", but ${off.length} of ${items.length} items answer outside it (${off[0].a})`); }
  return out;
}
// ---- round 2 (lessons critic r1 G1-G3): the classes the r1 gates let through
// G1 a story cell's own steps: a factor or divisor past 12, or of a table the school has not taught by the week, is a finding
const payOf = i => { try { return JSON.parse(i.pay || '{}') || {}; } catch (er) { return {}; } };
const stepsOf = i => { const p = payOf(i); return Array.isArray(p.steps) ? p.steps : []; };
export function storyTableChecks(items, tb, lim) {
  const out = [];
  for (const i of items) for (const s of stepsOf(i)) {
    const op = String(s.op || ''), mul = /^[*×x]$/.test(op), div = /^[\/÷]$/.test(op);
    if (!mul && !div) continue;
    const f = mul ? [+s.a, +s.b] : [+s.b, +(s.ans ?? s.q)];
    if (f.some(x => x > 12)) { out.push(`G1 rule 19: a story step ${s.a} ${mul ? '×' : '÷'} ${s.b} goes past the 12 times-table (${String(i.text).trim().slice(0, 60)})`); return out; }
    if (tb && f.every(x => !tb.has(x))) { out.push(`G1 rule 19: a story step ${s.a} ${mul ? '×' : '÷'} ${s.b} uses tables not taught by ${lim}`); return out; }
  }
  return out;
}
// G2 / G3 helpers: the values an item gives for a noun
const NUMS = t => [...String(t ?? '').replace(/(\d),(?=\d{3}\b)/g, '$1').matchAll(/\d+(?:\.\d+)?/g)].map(m => +m[0]);
const ansVals = i => NUMS(i.a);
const NOUNVAL = { area: i => { const m = String(i.a).match(/A\s*=\s*(\d+)/); return m ? [+m[1]] : ansVals(i); },
  product: ansVals, sum: ansVals, total: ansVals, quotient: ansVals, difference: ansVals, answer: ansVals, perimeter: i => { const m = String(i.a).match(/P\s*=\s*(\d+)/); return m ? [+m[1]] : ansVals(i); } };
const NOUNRE = '(areas?|products?|sums?|totals?|quotients?|differences?|answers?|perimeters?)';
const nounOf = w => w.toLowerCase().replace(/s$/, '');
const divisorsOf = i => { const v = []; for (const s of stepsOf(i)) { if (/^[\/÷]$/.test(String(s.op))) v.push(+s.b); if (/^[*×x]$/.test(String(s.op))) v.push(+s.a, +s.b); }
  for (const m of String(i.text || '').matchAll(/(\d+)\s*÷\s*(\d+)/g)) v.push(+m[2]); return v; };
const negBefore = (t, idx) => /\b(?:never|no|not|without|nor)\b[^;]*$/i.test(t.slice(Math.max(0, idx - 40), idx));
export function boundBreaks(text, items) {
  const t = String(text || ''), out = [], N = items.length; if (!N) return out;
  for (const m of t.matchAll(new RegExp(`\\b${NOUNRE}\\s+(?:of\\s+)?(\\d+) to (\\d+)\\b`, 'gi'))) { if (negBefore(t, m.index)) continue;
    const f = NOUNVAL[nounOf(m[1])], lo = +m[2], hi = +m[3], v = items.flatMap(f);
    const below = v.filter(x => x < lo), above = v.filter(x => x > hi);
    if (below.length) out.push(`G2: says "${m[0]}", but items go below ${lo} (${Math.min(...below)})`);
    if (above.length) out.push(`G2: says "${m[0]}", but items pass ${hi} (${Math.max(...above)})`); }
  for (const m of t.matchAll(new RegExp(`\\b${NOUNRE}\\s+(?:up )?to (?:about )?(\\d+)\\b`, 'gi'))) { if (negBefore(t, m.index)) continue;
    const f = NOUNVAL[nounOf(m[1])], hi = +m[2], v = items.flatMap(f), above = v.filter(x => x > hi * (/about/.test(m[0]) ? 1.25 : 1));
    if (above.length) out.push(`G2: says "${m[0]}", but items pass ${hi} (${Math.max(...above)})`); }
  for (const m of t.matchAll(/\b(?:never|no|not)\b[^;.]{0,40}?\b(by )?(?:more than|past|above|over|beyond) (\d+)\b/gi)) { const L = +m[2];
    if (/\b(?:a second|two|steps?)\b/i.test(m[0])) continue;
    if (m[1]) { const v = items.flatMap(divisorsOf).filter(x => x > L); if (v.length) out.push(`G2: says "${m[0]}", but an item divides or multiplies by ${Math.max(...v)}`); }
    else { const over = items.filter(i => (i.max || 0) > L); if (over.length) out.push(`G2: says "${m[0]}", but ${over.length} of ${N} items pass ${L}`); } }
  // a story claimed "within the tables" (or "never past the tables") has no × or ÷ step past 12 x 12
  if (/\bwithin the (?:times[- ])?tables\b|\bnever past the (?:times[- ])?tables\b/i.test(t)) for (const f of storyTableChecks(items, null, '')) out.push(`G2: says "within the tables", but ${f.replace(/^G1 rule 19: /, '')}`);
  for (const m of t.matchAll(/\b(?:dividing|divided|multiplying|multiplied|sharing|shared) by (\d+) to (\d+)\b/gi)) { if (negBefore(t, m.index)) continue;
    const lo = +m[1], hi = +m[2], v = items.flatMap(divisorsOf);
    if (!v.length) { out.push(`G2: says "${m[0]}", but no item has a × or ÷ step`); continue; }
    const off = v.filter(x => x < lo || x > hi); if (off.length) out.push(`G2: says "${m[0]}", but an item uses ${off[0]}`); }
  return out;
}
// G3 (a) a listed group size must be dealt; (b) a negated fraction family on ANY skill; (c) money bills; (d) "the other models in …"
const FAMW = [[2, 'halves|half'], [3, 'thirds?'], [4, 'quarters?|fourths?'], [5, 'fifths?'], [6, 'sixths?'], [8, 'eighths?'], [10, 'tenths?'], [12, 'twelfths?']];
const famSet = s => new Set(FAMW.filter(([, re]) => new RegExp(`\\b(?:${re})\\b`, 'i').test(s)).map(([d]) => d));
export function claimLists(text, items, qs, e) {
  const t = String(text || ''), out = [], N = items.length; if (!N) return out;
  for (const m of t.matchAll(/\bgroups? of ((?:\d+,\s*)*\d+,?\s+(?:or|and)\s+\d+)\b/gi)) { if (negBefore(t, m.index)) continue;
    for (const s of m[1].match(/\d+/g).map(Number)) if (!items.some(i => new RegExp(`\\bgroups? of ${s}\\b|\\b${s} in each\\b`, 'i').test(i.text || '') || payOf(i).size === s))
      out.push(`G3: says "groups of ${m[1]}", but no item has groups of ${s}`); }
  if (!(e && e.opts && e.opts.denoms)) {
    const NEGF = /\b(?:no|never|not(?!\s+(?:only|just|always|all)\b)|without|nor)\b[^;,.:()]*/gi;
    const dealt = new Set(); qs.forEach((q, j) => { for (const x of itemDens(q)) dealt.add(x); for (const mm of `${items[j]?.text || ''} ${items[j]?.a || ''} ${items[j]?.x || ''}`.matchAll(/(?<![\d.])\d+\/(\d+)\b/g)) dealt.add(+mm[1]); });
    for (const nm of t.matchAll(NEGF)) for (const d of famSet(nm[0])) if (dealt.has(d)) out.push(`G3: says "${nm[0].trim()}", but items show /${d}`); }
  for (const m of t.matchAll(/((?:\$\d+\s*(?:,|and|or|\/)?\s*(?:an?\s+)?)+)bills?\b/gi)) {
    const vals = m[1].match(/\d+/g).map(Number), neg = negBefore(t, m.index);
    const shown = v => items.some(i => (payOf(i).notes || []).includes(v) || new RegExp(`\\$${v} bill`).test(i.text || ''));
    for (const v of vals) { if (neg && shown(v)) out.push(`G3: says "${t.slice(Math.max(0, m.index - 12), m.index + m[0].length).trim()}", but items show a $${v} bill`);
      if (!neg && !shown(v)) out.push(`G3: names a $${v} bill, but no item shows one`); } }
  for (const m of t.matchAll(/\b(\w+\s+of\s+)?the other (?:models|pictures|shapes|choices|options)(?:\s+are)?\s+(?:all\s+)?in\s+([a-z ,]+)/gi)) {
    if (m[1] && /some|most|many|a few/i.test(m[1])) continue;
    const fam = famSet(m[2]); if (!fam.size) continue;
    const bad = items.filter(i => { const p = payOf(i); if (!Array.isArray(p.terms)) return false; const ans = p.answer?.letter;
      return p.terms.some(x => x.letter !== ans && !fam.has(x.d)); }).length;
    if (bad) out.push(`G3: says "${m[0].trim()}", but ${bad} of ${N} items show another model outside ${[...fam].map(x => '/' + x).join(' ')}`); }
  return out;
}
// a why that says the items ask how long something takes (a duration) needs items that ask for one
export function durationClaim(pos, items) {
  if (!/\bhow long\b|\bdurations?\b|\bin minutes\b/i.test(pos)) return [];
  const hit = items.filter(i => /how long|\bmin\b|minutes|"answer":"dur|duration/i.test(`${i.text || ''} ${i.a || ''} ${i.pay || ''}`)).length;
  return hit < items.length / 2 ? [`says "${(pos.match(/\bhow long\b|\bdurations?\b|\bin minutes\b/i) || [''])[0]}", but only ${hit} of ${items.length} items ask for a duration`] : [];
}
const SHAPES = ['triangle', 'circle', 'square', 'rectangle', 'cube', 'cuboid', 'sphere', 'cone', 'cylinder', 'number line', 'ten frame', 'number track', 'dice', 'balance'];
function whyCheck(e, r) {
  const w0 = String(e.why || ''), out = [];
  let w = w0;
  for (const id of w0.match(/(?:R|Y\d)\.B\d+\.S\d+|(?:G\d|K|PK)\|-\|[a-z0-9]+/g) || []) w = w.split(id).join(' ').split(titles[id] || '\0').join(' ');
  const texts = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''}`), N = texts.length || 1;
  const pos = CL.positive(w);
  for (const shp of SHAPES) {
    if (!new RegExp(`\\b${shp}s?\\b`, 'i').test(pos)) continue;
    const re = new RegExp(shp === 'ten frame' ? 'ten[- ]?frame|tenframe|"frames?"|"objects":"frame"' : shp === 'number track' ? 'track|seqstrip' : shp === 'dice' ? 'dice|"objects":"dice"' : shp === 'cuboid' ? 'cuboid|rectangular prism' : shp === 'balance' ? 'balance|scale' : `\\b${shp}`, 'i');
    if (!r.items.some(i => re.test(`${i.text} ${i.a} ${i.x} ${i.vis} ${i.tpl} ${(i.pay || '').slice(0, 400)}`))) out.push(`why names "${shp}" but no item shows one`);
  }
  if (/\bcolumn\b/i.test(pos) && !r.items.some(i => TR.isColumnItem(i) || /column/i.test(`${i.text} ${i.vis}`))) out.push('why says column but no item is in columns');   // G3
  // lessons critic r1 G2: a shape the text says the pupil is ASKED for (click / find / name / pick / ask) must be asked by an item (its
  // question names it, or it is the answer), not only drawn as a distractor; a parenthesis that calls a shape a distractor is not a claim
  const posA = pos.replace(/\([^)]*distractor[^)]*\)/gi, ' ');
  if (/\b(?:click|find|name|pick|ask)\w*\b/i.test(posA)) for (const [shp, sre, ire] of ASKED) {
    if (!sre.test(posA)) continue;
    if (!r.items.some(i => ire.test(i.text || '') || (ire.test(String(i.a || '')) && !/^\s*\[/.test(String(i.a || ''))))) out.push(`says the pupil is asked for the ${shp}, but no item asks for one (only drawn)`);
  }
  // G2: "no pictures" / "told in words, no pictures" is false when the story cell pictures the groups (payload.pic)
  if (NOPIC.test(w0) && noPicHits(w0, r.items) > N / 3) out.push(`says no pictures, but ${noPicHits(w0, r.items)} of ${N} items show a picture`);
  // G5: a bound the text names ("wholes to 20", "to 100") that the items never come near
  for (const f of boundTooBig(w, r.items)) out.push(f);
  // G8: a POSITIVE picture claim ("pictured", "pictures", "to cross out") needs pictured items; a story cell is pictured only by payload.pic
  if (/\bpictures?\b|\bpictured\b|\bcross(?:es|ed|ing)? out\b/i.test(pos) && r.items.filter(pictured).length < N / 2) out.push(`why says pictured (or crossed out) but only ${r.items.filter(pictured).length} of ${N} items show a picture`);
  if (ORIENT.test(pos) && !r.items.some(turnedItem)) out.push(`says the shapes are seen ${(pos.match(ORIENT) || [''])[0]}, but no item turns or resizes a shape (each is one fixed drawing)`);
  if (ZEROC.test(pos) && !r.items.some(zeroItem)) out.push(`says "${(pos.match(ZEROC) || [''])[0]}", but no item deals 0 (no answer 0, no 0 shown)`);
  for (const m of pos.matchAll(WINDOW)) { const S = new Set([m[1], m[2], m[3]].filter(Boolean)), rest = pos.slice(m.index, m.index + 80);
    if (/\bamong\b/i.test(rest)) continue;
    const hit = r.items.filter(i => S.has(String(i.a).trim())).length;
    if (hit < N / 2) out.push(`says "${m[0]}", but only ${hit} of ${N} items are those numbers (say "among them" or the real range)`); }
  for (const o of OBJN) if (new RegExp(`\\b${o}(?:e?s)?\\b`, 'i').test(pos) && !r.items.some(i => new RegExp(`\\b${o}(?:e?s)?\\b`, 'i').test(`${i.text} ${i.a} ${i.x} ${i.vis} ${i.pay}`))) out.push(`names "${o}" as an example, but no item shows one`);
  if (/\badd-more stor(?:y|ies)\b/i.test(pos) && !/put-together|\bcombin/i.test(pos) && r.items.filter(i => /\bin all\?/i.test(i.text || '')).length >= N / 5) out.push(`says add-more stories, but ${r.items.filter(i => /\bin all\?/i.test(i.text || '')).length} of ${N} items are put-together stories (how many in all?)`);
  for (const tc of TR.tableClaims(pos)) { const hit = r.items.filter(i => tc.re.test(`${CL.itemWords(i)} ¦ ${i.pay || ''}`)).length;
    if (hit < tc.s * N) out.push(`why claims "${tc.word}" (${tc.n}) but only ${hit} of ${N} items deal it`); }
  for (const h of CL.claimHits(CL.claimText(w0, titles), r.items, { gateOnly: true })) if (!h.ok) out.push(`why claims "${h.word}" (${h.claim}) but only ${h.hit} of ${h.n} items show it`);
  // the K / R words a why uses for what the items do (Y1): more / fewer, heavier / lighter, longer / taller, odd / even, double, story
  const KW = [[/\bheavier|\blighter\b/i, /heav|light/i], [/\blonger\b|\bshorter\b/i, /long|short/i], [/\btaller\b/i, /tall|short/i], [/\bodd\b|\beven\b/i, /\bodd\b|\beven\b/i],
    [/\bdoubles?\b/i, /doubl|\b(\d+) \+ \1\b/i], [/\bstor(?:y|ies)\b/i, /[a-z]\.\s+[A-Z][^?]*\?/], [/\bone more\b|\b1 more\b/i, /\bmore\b|\bafter\b|\bnext\b/i], [/\bone less\b|\b1 less\b/i, /\bless\b|\bbefore\b/i],
    [/\bsort(?:s|ing)?\b/i, /sort|count only|ring|group/i], [/\bsides\b/i, /\bsides?\b/i], [/\bcorners\b/i, /corner|vert/i],
    [/\bshar(?:e|es|ed|ing)\b|\bsplit\b[^;.]{0,30}\binto (?:\d+|two|three|four) equal (?:groups|parts|shares)\b|\binto (?:\d+|two|three|four) equal groups\b/i, /\bshare|\bshared|\bsharing|each (?:child|friend|plate|person|bag) gets?|\bhalf\b|\bhalve/i],   // G2 / G8: sharing (or splitting into N equal groups) is not grouping
    [/\bin twos\b|\btwo by two\b|\bone above the other\b|\bfill(?:s|ing)? the frame\b/i, /\bpairs?\b|\btwos\b|\bodd\b|\beven\b|\bdoubl/i]];   // r1-9: a fill order or pairing claim
  for (const [c, i] of KW) if (c.test(pos) && r.items.filter(it => i.test(`${it.text} ${it.a} ${it.x} ${it.vis}`)).length < N / 5) out.push(`why says "${(pos.match(c) || [''])[0]}" but fewer than a fifth of the items do it`);
  return out;
}

// ---- the Y6 lane's why rules (digits, units, fraction families, multiples, grids, percent), ported
function y6Why(e, r) {
  const w0 = String(e.why || ''), out = [];
  let w = w0;
  for (const id of w0.match(/(?:R|Y\d)\.B\d+\.S\d+|(?:G\d|K|PK)\|-\|[a-z0-9]+/g) || []) w = w.split(id).join(' ').split(titles[id] || '\0').join(' ');
  const texts = r.items.map(i => `${i.text || ''} ${i.a || ''} ${i.x || ''}`);
  const N = texts.length || 1;
  const dm = w.match(/(\d)-digit/);
  if (dm && !/divisor|by a 1-digit|× 1-digit|1-digit (number|factor)|2-digit (number|divisor|factor)\b/.test(w)) {
    const D = +dm[1]; const hit = texts.filter(t => [...t.matchAll(/\b\d{1,3}(?:,\d{3})+\b|\b\d+\b/g)].some(x => x[0].replace(/,/g, '').length === D)).length;
    if (hit < N / 3) out.push(`why says "${D}-digit" but only ${hit} of ${N} items have a ${D}-digit number`);
  }
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
const stripCited = w0 => { let w = String(w0 || ''); for (const id of w.match(/(?:R|Y\d)\.B\d+\.S\d+|(?:G\d|K|PK)\|-\|[a-z0-9]+/g) || []) w = w.split(id).join(' ').split(titles[id] || '\0').join(' '); return w; };
const CITE = /^((?:R|Y\d)\.B\d+\.S\d+|(?:G\d|K|PK)\|-\|[a-z0-9]+)\b/;
function citeCheck(id, e) {
  const m = String(e.why || '').match(CITE);
  if (!m) return ['the why does not start with the step or site lesson it cites'];
  const ref = m[1], out = [];
  if (!titles[ref]) return [`cites ${ref}, which is not a WRM step or a site lesson`];
  if (!String(e.why).startsWith(`${ref} ${titles[ref]}`)) out.push(`the why does not give the cited unit's own title after ${ref}`);
  if (!(taught[e.key] && taught[e.key].has(ref))) out.push(`cites ${ref}, which ${e.key} is not tagged to (and is not that unit's direct / partial)`);
  if (ref === id) out.push('cites the lesson itself');
  for (const m of String(e.why).matchAll(/\b(?:wk|week)\s+(W\d\d)\b/gi)) if (wkOf(ref) && m[1] !== wkOf(ref)) out.push(`the why says ${m[0]}, but ${ref} is taught ${wkOf(ref)}`);
  const ry = unitYear(ref), ri = YR.indexOf(ry);
  if (isSupport(id)) {
    const ph = phaseOf(id);
    if (ri > SRC[id]) out.push(`H: cites ${ref} (${ry}${siteOf[ref] ? ' site lesson' : ''}), above this Support lesson's source year ${srcYear(id)}`);
    else if (siteOf[ref]) out.push(`H: cites the site lesson ${ref}; a Support lesson judged at its source year cites a WRM step of that year or below`);
    else if (ph && ry === 'R' && blockNo(ref) >= ph.first) out.push(`H: cites ${ref} (block R.B${blockNo(ref)}), not before this Support lesson's source phase ${ph.name} (from R.B${ph.first})`);
  } else if (ry === 'Y4') {
    const rw = wkOf(ref);
    if (!rw) out.push(`cites ${ref}, which has no school week`);
    else if (n(rw) >= n(lessonWk(id))) out.push(`rule 19: cites ${ref}, taught ${rw}, not before this lesson (${lessonWk(id)})`);
  } else if (ri > 4) out.push(`cites ${ref}, a ${ry} unit, above Grade 3`);
  return out;
}
// the cited unit's own ceiling: its title's number and its direct / partial maximum (a step of any passed lane), else its year's range
const titleCeilN = t => { const m = (String(t).match(/\d{1,3}(?:,\d{3})+|\d+(?!-digit|-D\b)/g) || []).map(x => +x.replace(/,/g, ''));
  for (const k of String(t).matchAll(/(\d)-digit/g)) m.push(10 ** +k[1] - 1); return m.length ? Math.max(...m) : 0; };
const STEP_OF = {}; for (const od of LANES) Object.assign(STEP_OF, od.steps);
const citedCeil = ref => {
  if (!ref) return 0;
  if (siteOf[ref]) return CEIL[slug(ref)] || YEAR_CEIL[siteOf[ref].wrmYear] || 0;
  let c = titleCeilN(titles[ref] || ''); const s = STEP_OF[ref];
  if (s) for (const e of [...s.direct, ...s.partial]) c = Math.max(c, probe(e.key, e.opts || {}, e.maxNumber || (e.opts || {}).range || 10000).max);
  if (unitYear(ref) === 'R') c = Math.max(c, R_BLOCK_CEIL[blockNo(ref)] || 0);
  return c || YEAR_CEIL[unitYear(ref)] || 0;
};
// class M (Y5 critic r6 M / r7 M', ported through the Y6 lane)
const STOP = new Set('the and one page only form forms kind each item items dealt both mixed with from into for its all any are not off on a an of to in or by as at is it this that what which who how many write find click drag sort pick choose'.split(' '));
const STOP_NOUNS = new Set([...STOP].filter(w => !['click', 'drag', 'sort', 'pick', 'choose', 'write', 'find'].includes(w)));
const stem = w => w.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(?:ing|es|ed|s)$/, '');
const KEYS = Object.keys(K.keys);
function missedOptions(s) {
  const out = [], mine = [...s.direct, ...s.partial], cats = new Set(mine.map(e => e.key.split(':')[0]));
  const pool = new Set([...mine, ...s.pre, ...s.related].map(e => e.key).concat(KEYS.filter(k => cats.has(k.split(':')[0]))));
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
    for (const def of so.optionsFor(c, sk) || []) { if (!def.values || def.group === 'support' || ['band', 'range', 'support', 'cover', 'mix'].includes(def.id)) continue;
      for (const v of def.values) { const L = String(v.l ?? '');
        if (/^(no|off|none)\b/i.test(L)) continue;
        const texts = /^(yes|on)\b/i.test(L) ? [def.label || '', L.replace(/^(yes|on)\b[:,]?/i, '')] : [L];
        const head = !/^(yes|on)\b/i.test(L) && /\(/.test(L) ? L.replace(/\([^)]*\)/g, ' ').trim() : null;
        const wordsOf = (t, stop) => [...new Set(t.replace(/[()]/g, ' ').split(/[\s-]+/).map(stem).filter(w => w.length > 2 && !stop.has(w) && !/^\d+$/.test(w)))];
        const hits = texts.some(t => { let words = wordsOf(t, STOP); if (words.length < 2) words = wordsOf(t, STOP_NOUNS);
          return words.length >= 2 && parts.some(p => words.every(w => p.includes(w)) && (words.length > 2 || near(p, words))); });
        const headWords = head ? wordsOf(head, STOP) : [];
        const headHit = headWords.length >= 1 && shortParts.some(p => { const cw = [...new Set(p.filter(w => w.length > 2 && !STOP.has(w)))]; return cw.length === headWords.length && headWords.every(w => cw.includes(w)); });
        if (!hits && !headHit) continue;
        const used = mine.some(e => e.key === k && [].concat((e.opts || {})[def.id] ?? []).includes(v.v));
        if (!used) out.push(`a clause says "never / no …" what ${k} option ${def.id}=${JSON.stringify(v.v)} "${v.l}" deals; use the option (key + value) or name the skill and say why not`); } } }
  return [...new Set(out)];
}
// lessons critic r1 G4: a FULL lesson is held to its title AND to every CCSS code the site tags it with, through the hand-audit row
// of full_audit.json (read from items, one entry per code); the row must name exactly the lesson's direct links, and a lesson that is
// not FULL has no row
const AUDIT = JSON.parse(fs.readFileSync(process.env.WRM_FULL_AUDIT || new URL('full_audit.json', import.meta.url), 'utf8'));   // lessonmut.py may point it at a mutated copy
const sigL = l => JSON.stringify(l.map(e => ({ key: e.key, opts: e.opts || {} })));
export function fullAuditCheck(id, s) {
  const row = AUDIT[id], out = [];
  if (s.verdict !== 'full') { if (row) out.push('an audit row for a lesson that is not full'); return out; }
  if (!row) return ['full, but no hand-audit row in full_audit.json (title and every site CCSS code)'];
  if (sigL(row.links || []) !== sigL(s.direct)) out.push(`the audit row's links ${sigL(row.links || [])} are not the direct links ${sigL(s.direct)}`);
  if (String(row.title || '').length < 40) out.push('the audit row does not read the title');
  for (const c of s.site.ccss || []) if (String((row.ccss || {})[c] || '').length < 40) out.push(`the audit row does not read the site's ${c}`);
  for (const c of Object.keys(row.ccss || {})) if (!(s.site.ccss || []).includes(c)) out.push(`the audit row reads ${c}, which the site does not tag`);
  // builder r3 (critic r2 F11 / n6): a code the row reads as DEALT (a sentence naming it with no not / never / no) must be dealt by
  // the direct items; a group-size range the row states ("groups of 2 to 5") must hold for every item
  const items = s.direct.flatMap(e => P(e).items);
  const texts = [row.title || '', ...Object.values(row.ccss || {})].join(' . ');
  for (const sent of texts.split(/[.;](?:\s|$)/)) for (const [code, t] of Object.entries(STD_ITEM)) {
    if (!sent.includes(code) || /\bnot\b|\bnever\b|\bno\b|\bsite tag\b/i.test(sent)) continue;
    if (!t.ok(items)) out.push(`the row reads ${code} as dealt (${t.why}), but the direct items never do it: "${sent.trim().slice(0, 120)}"`); }
  // Y4: a code's own entry with no "site tag" reads the whole code as dealt
  for (const [code, val] of Object.entries(row.ccss || {})) { const t = STD_ITEM[code];
    if (t && !/\bsite tag\b/i.test(String(val)) && !t.ok(items)) out.push(`the row reads ${code} as dealt (${t.why}), with no site tag, but the direct items never do it`); }
  for (const m of texts.matchAll(/\bgroups? of (\d+) to (\d+)\b/gi)) { const lo = +m[1], hi = +m[2];
    const off = items.filter(i => { const p = (() => { try { return JSON.parse(i.pay || '{}'); } catch (er) { return {}; } })(); return ['a', 'b', 'n'].some(k => typeof p[k] === 'number' && (p[k] < lo || p[k] > hi)); });
    if (off.length) out.push(`the row says "${m[0]}", but ${off.length} of ${items.length} items have a group outside it`); }
  return out;
}
for (const id of Object.keys(AUDIT)) if (!id.startsWith('_') && !(d.lessons || {})[id]) { console.log(`FULLAUDIT: a row for ${id}, not a lesson`); process.exitCode = 1; }
let bad = 0, checked = 0;
for (const [id, s] of Object.entries(d.lessons || {})) {
  const fails = [];
  let own; try { own = ceilOf(id); } catch (er) { fails.push(er.message); own = 10; }
  const ownItems = [...s.direct, ...s.partial].filter(e => !TIME.test(e.key)).flatMap(e => P(e).items);
  const ownMax = ownItems.length ? Math.max(0, ...ownItems.map(i => i.max || 0)) : own;
  for (const role of ['pre', 'related']) for (const e of s[role]) {
    checked++;
    const r = P(e), tag = `${role} ${e.key}${e.opts ? JSON.stringify(e.opts) : ''}${e.maxNumber ? '@' + e.maxNumber : ''}`;
    const cm = role === 'pre' && String(e.why).match(CITE);
    // G1 (lessons critic r1): each link is held to the lesson's OWN dealt maximum (its direct / partial items; the CEIL bound only when
    // it deals none, a gap lesson), and a pre also to its cited unit's own maximum; never to the year-wide ceiling
    const c = Math.max(ownMax, cm ? citedCeil(cm[1]) : 0), limit = Math.max(1.5 * c, c + 2);
    if (!TIME.test(e.key) && r.max > limit) fails.push(`${tag}: size ${r.max} > ${limit} (the lesson deals to ${ownMax}${cm ? ', its cited unit to ' + citedCeil(cm[1]) : ''}) — ${r.ex}`);
    const wS = stripCited(e.why);
    for (const f of [...boundBreaks(wS, r.items), ...claimLists(wS, r.items, r.qs, e), ...durationClaim(CL.positive(wS), r.items)]) fails.push(`${tag}: ${f}`);
    for (const f of [...content(id, e, r, role), ...whyCheck(e, r), ...y6Why(e, r), ...digitSymbolChecks(e.why, r.items), ...unitNegChecks(e.why, r.items), ...betweenChecks(e.why, r.items), ...(role === 'pre' ? citeCheck(id, e) : []), ...denomsCheck(e, role, CL.claimText(e.why, titles))]) fails.push(`${tag}: ${f}`);
  }
  for (const role of ['direct', 'partial']) for (const e of s[role]) {
    const r = P(e);
    for (const f of content(id, e, r, role)) {
      const word = (f.replace(/^(?:rule 19|SUPPORT): /, '').match(/[A-Za-z×÷]{4,}|[×÷]/) || [''])[0].toLowerCase();
      if (role === 'partial' && word && String(e.missing).toLowerCase().includes(word)) continue;
      fails.push(`${role} ${e.key}${JSON.stringify(e.opts || {})}: ${f}`);
    }
    // (a shape past 4 sides as a pick's distractor is not content the pupil works on: `poly` is a link gate only)
    if (role === 'direct' && isSupport(id) && SRC[id] <= 1) {   // RESPONSE (rule 8): a FULL lesson's own items fit the pupil of its source year
      if (SRC[id] === 0 && R_EQ.test(e.key)) fails.push(`RESPONSE: direct ${e.key} is a symbol equation or number line, not a Reception response`);
      if (SRC[id] === 0 && R_WRITTEN.test(e.key)) fails.push(`RESPONSE: direct ${e.key} asks for a written Kindergarten answer`);
      for (const [nm, cnt] of Object.entries(r.flags)) if (cnt && nm !== 'poly' && !(nm === 'vert' && /\bvert|corner|properties/i.test(s.title)))
        fails.push(`RESPONSE: direct ${e.key}: ${FLAGWHY[nm]} (${cnt} of ${r.items.length} items), which the title "${s.title}" does not ask`);
    }
    if (role === 'partial') {
      for (const h of CL.claimHits(e.missing, r.items, { gateOnly: true })) if (!h.ok) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause claims "${h.word}" (${h.claim}) but only ${h.hit} of ${h.n} items show it`);
      for (const h of CL.negatedHits(e.missing, r.items)) if (!h.ok) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause says "${h.part}" is not dealt, but ${h.hit} of ${h.n} items do it (${h.claim})`);
      for (const f of digitSymbolChecks(e.missing, r.items)) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})}: ${f}`);
      for (const f of denomsCheck(e, 'partial', e.missing)) fails.push(`partial ${e.key}: ${f}`);
      for (const f of [...unitNegChecks(e.missing, r.items), ...betweenChecks(e.missing, r.items)]) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause: ${f}`);
      for (const f of y6Why({ why: e.missing.replace(/\b(?:never|no|not|without)\b[^;.]*/gi, ' ') }, r)) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause: ${f}`);
      if (NOPIC.test(e.missing) && noPicHits(e.missing, r.items) > r.items.length / 3) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause says no pictures, but ${noPicHits(e.missing, r.items)} of ${r.items.length} items show a picture`);
      // lessons critic r2 F12: "never 0 as a number to write / find / answer" is false when an item answers 0
      for (const p of CL.negatedParts(e.missing)) if (/(?<![\d.])0(?![\d.])|\bzero\b/i.test(p) && /\bwrit|\banswer|\bfind|\bas a number\b/i.test(p)) {
        const z = r.items.filter(i => String(i.a).trim() === '0').length;
        if (z) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause says "never ${p}", but ${z} of ${r.items.length} items have the answer 0`); }
      for (const f of boundTooBig(e.missing, r.items)) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause: ${f}`);
      for (const f of [...boundBreaks(e.missing, r.items), ...claimLists(e.missing, r.items, r.qs, e)]) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause: ${f}`);
      for (const f of whyCheck({ why: e.missing.replace(/\b(?:never|no|not|without)\b[^;.]*/gi, ' ') }, r)) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause: ${f}`);
    }
  }
  const sigOf = r => r.items.map(i => i.text + '|' + i.a + '|' + i.vis + '|' + i.tpl + '|' + i.pay).join('\n');
  const ownSig = new Map(); for (const e of [...s.direct, ...s.partial]) ownSig.set(sigOf(P(e)), e.key);
  for (const role of ['pre', 'related']) { const seen = new Map();
    for (const e of s[role]) { const sg = sigOf(P(e));
      if (ownSig.has(sg)) fails.push(`${role} ${e.key}${JSON.stringify(e.opts || {})}: deals the same items as the lesson's own ${ownSig.get(sg)} (class F)`);
      if (seen.has(sg)) fails.push(`${role} ${e.key}: duplicate of ${seen.get(sg)} (same items)`); else seen.set(sg, e.key); } }
  if (s.verdict === 'full' && /decimal/i.test(s.title) && !s.direct.some(e => P(e).items.some(i => /(?<![\d,])\d*\.\d/.test(i.text || '') || /(?<![\d,])\d*\.\d/.test(i.a || ''))))
    fails.push('G: full, and its title names decimals, but no direct item has a decimal');
  for (const f of missedOptions(s)) fails.push(`M: ${f}`);
  // rule 10 (lessons critic r2: lessonfit missed it, lessons.py R10 caught it): one key is never both a pre and a related
  for (const k of new Set(s.pre.map(e => e.key))) if (s.related.some(e => e.key === k)) fails.push(`R10: ${k} is both a pre and a related`);
  for (const f of fullAuditCheck(id, s)) fails.push(`FULLAUDIT: ${f}`);
  const one = { steps: {}, lessons: { [id]: s } };
  for (const x of TR.titleRepFinds(one, (k, o) => { const e = [...s.direct, ...s.partial].find(z => z.key === k && JSON.stringify(z.opts || {}) === JSON.stringify(o || {})); return probe(k, o || {}, e ? rangeOf(e) : 10000).items; }).finds) fails.push(`TITLEREP ${x.kind}: ${x.msg}`);
  { const clause = [s.missing, ...s.partial.map(p => p.missing)].join(' ; ');
    for (const [role, list] of [['direct', s.direct], ['partial', s.partial]]) for (const e of list) {
      const over = P(e).items.filter(i => !TIME.test(e.key) && (i.max || 0) > own);
      if (!over.length || own === 0) continue;
      if (s.verdict === 'full') fails.push(`RANGE: full, but ${over.length} items of ${e.key} pass the lesson's ceiling ${own} (${over[0].text.trim().slice(0, 50)})`);
      else if (!/\b(?:above|beyond|over|past|larger than|bigger than|more than|to|up to)\s+\d+|\b\d+\s*\+\s*\d+\b/i.test(clause)) fails.push(`RANGE: ${over.length} items of ${role} ${e.key} pass the ceiling ${own} and the clause never says so`);
    } }
  bad += fails.length;
  if (fails.length || ALL) console.log(`${id} [${isSupport(id) ? 'Support, source ' + srcYear(id) + (phaseOf(id) ? ', ' + phaseOf(id).name : '') : lessonWk(id)}] ceiling ${own}: ${fails.length ? fails.length + ' FAIL\n   ' + fails.join('\n   ') : 'ok'}`);
}
console.log(`lessonfit: ${Object.keys(d.lessons || {}).length} lessons, ${checked} links, ${NPER} items a link; ${bad} findings`);
process.exitCode = bad || process.exitCode ? 1 : 0;
