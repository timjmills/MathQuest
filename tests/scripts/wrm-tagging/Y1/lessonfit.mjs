// Y1 (Kindergarten) SITE-LESSON GATES (owner rule 2026-10-16: every site lesson tagged). Every link of the `lessons` section of
// data/curriculum/links/Y1.json is judged from generated items (40 per link: two fresh seed sets x 20, the link's own opts and Max
// Number, Max Number 10,000 when the link names none, so a skill that reads it shows its worst case). Adapted from the Y6 lane's
// lessonfit.mjs (passed lessons critic r2) with the R/Y1 lane's Kindergarten / Reception content rules (gen.py content_why,
// week_why, CONTENT_WEEKS; maxdealt.mjs FLAGS and C19 classes). Every failure class the Y5 critics (r5-r8), the Y2-Y3 critics
// (r12-r15), the Y6 lessons critics (r1-r2) and the R/Y1 critics (r1-r12) found is a gate:
//   CITE      a pre's why starts with the step or site lesson it cites and that unit's own title; the unit teaches the key (its
//             direct / partial, the live SKILL_WRM, the R / Y1 tagFixes, another lesson's direct / partial); the pupil met it BEFORE
//             the lesson: a Kindergarten lesson (committee, school week Wnn) cites a Reception step (any) or a Y1 step / Y1 lesson
//             whose school week is EARLIER than its own (a Y1 step with no school week, e.g. block Y1.B3, cannot be cited);
//             a Support lesson ("Source: GPK", Reception, judged at its SOURCE year, critic Y5 r5 class H) cites only a Reception
//             step of a block BEFORE its source phase (phases.json), never a Kindergarten step or lesson
//   SIZE      a link deals no number above max(1.5 x c, c + 2), c = the larger of the lesson's ceiling (CEIL below: the title's
//             bound, else the numbers the pupil works with at that point) and, for a pre, its cited step's own ceiling
//             (the step's title number, else the R lane's block number / the Y1 step's direct maximum); numbers in the question,
//             answer, options and kit payload all count (R/Y1 critic r8 M2)
//   CONTENT   (links) no x / ÷, angles or parallel sides, vertices, shapes past 4 sides, columns or regrouping, standard units,
//             fractions, coordinates or typed words (R/Y1 critic r3 regexes, maxdealt.mjs FLAGS); no item set with fewer than 3
//             different items; a Kindergarten lesson's links carry no content the school first teaches after its week
//             (CONTENT_WEEKS, the R/Y1 lane's rule 19 table; a related may be 2 weeks ahead) and no number past the week's limit
//             (20 before W08, 50 before W10, then 100); a Support (Reception) lesson's links are pictured: no symbol-only equation
//             or number line (R_EQ), no clock or groups-of sentence (R_WRITTEN), no squares or rectangles before Reception block 6
//   RESPONSE  a FULL Support lesson's direct items are a Reception response (no R_EQ / R_WRITTEN skill, no FLAGS content);
//             a FULL Kindergarten lesson's direct items carry no FLAGS content its title does not name (rule 8)
//   WHY       every claim of the why (and of the cited unit's full title) is true of the items (the Y6 why rules and claims.mjs)
//   CLAUSE    a partial clause's positive gated claims are true of that partial's items, and an operation it says is never
//             dealt is not dealt; its digit-count and symbol claims hold
//   OWN / DUP a pre / related never deals the lesson's own items (class F); no two links of one role deal the same items
//   M         a clause that says "never X" where an option of a listed skill is labelled X must use that option (class M, M')
//   TITLEREP  the title's claims (titlerep.mjs, with the Y1 title claims) are dealt by a FULL lesson's direct items, or named in
//             a partial / gap lesson's clause
//   RANGE     a direct / partial item above the lesson's ceiling makes a FULL lesson not full, and a partial clause must say so
// usage: node lessonfit.mjs [<Y1.json>] [--all] [--n 40] [--seeds '[[s1,stride],[s2,stride]]']       (exit 1 on any finding)
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../../', import.meta.url).pathname;
const _log = console.log, _warn = console.warn; console.log = () => {}; console.warn = () => {};
const g = await import(R + 'js/modules/generate-question.js');
const so = await import(R + 'js/modules/skill-options.js');
console.log = _log; console.warn = _warn;
const fs = await import('fs');
const CL = await import('./claims.mjs');
const TR = await import('./titlerep.mjs');
const args = process.argv.slice(2);
const FILE = args.find(a => a.endsWith('.json')) || R + 'data/curriculum/links/Y1.json';
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
// a Support lesson (enrich-native, "Source: GPK.") is judged at Reception, from its source phase
const phaseOf = id => { const m = String(siteOf[id]?.note || '').match(/\(Phase (\d+)\)/); return m ? PH[m[1]] : null; };
const isSupport = id => siteOf[id]?.flag === 'enrich-native' && /^Source: GPK\./.test(siteOf[id]?.note || '');
const lessonWk = id => isSupport(id) ? null : (siteOf[id]?.firstWeek || 'W38');
const wkOf = id => siteOf[id] ? lessonWk(id) : (prior[id]?.wk || '');
const blockNo = id => +String(id).split('.')[1].slice(1);
// THE LESSON CEILINGS: the largest number each lesson works with. Its title's bound when it has one; else the numbers its pupils work
// with there (a Reception phase's own numbers: R lane R_BLOCK_CEIL; a Kindergarten week: the K block). 0 = a shape / measure / position
// lesson with no numbers of its own, held to what the pupil met before it (REACHED).
const CEIL = {
  addandsubtractwithin5writtenverticallycolumnform: 5, sortintocategoriescounteachgroupandfindthetotal: 10, buildanddrawshapes: 0, composeshapesfromsmallershapes: 0,
  '3dshapescubecuboidsphereconecylinder': 0, '67and8countingandsubitising': 8, '9and10countrepresentorder': 10, addingmorefirstthennowstories: 10,
  bondsto10explorecombinationsthatmake10: 10, buildingnumbersbeyond10: 20, circlesandtrianglesproperties: 0, combining2groups: 8, compareamountsmorefewersame: 5,
  comparecapacity1: 0, comparecapacity2: 0, comparemass1: 0, comparemass2: 0, comparesizemassandcapacityinformally: 0, comparingnumbersto10: 10,
  comparingnumbersto5: 5, compositionof123partsmakethewhole: 3, compositionof4and5bonds: 5, countingpatternsbeyond10teennumbers: 20,
  deepeningunderstandingconsolidate2d3dshapes: 0, doublingupto55: 10, explore2dshapescircletrianglerectanglesquare: 0, introducingzero: 5, makingpairs: 8,
  onemoreandlesswithin5: 5, positionallanguage: 0, positionallanguageonunderinnextto: 0, representnumbersto5: 5, shapeswith4sidessquaresandrectangles: 0,
  sortobjectsbyoneattributecoloursizeshape: 0, spatialreasoning1matchrotatemanipulate: 0, spatialreasoning2composeanddecompose: 0, spatialreasoning3visualizebuild: 0,
  spatialreasoning4mappingdirection: 0, takingaway: 10 };
const slug = id => id.split('|-|')[1];
// the numbers a pupil has met before a lesson with no numbers of its own: Reception by phase (the R lane's block numbers), Kindergarten 10
const R_BLOCK_CEIL = { 1: 5, 3: 3, 5: 5, 7: 5, 9: 8, 11: 10, 13: 20, 14: 10, 16: 12, 18: 10 };
const reached = id => { if (!isSupport(id)) return 10; const ph = phaseOf(id); let c = 3;
  for (const [b, v] of Object.entries(R_BLOCK_CEIL)) if (+b < (ph ? ph.first : 1)) c = Math.max(c, v); return c; };
const ceilOf = id => { const c = CEIL[slug(id)]; if (c == null) throw new Error('no CEIL for ' + id); return c || reached(id); };
// who teaches a key: live SKILL_WRM, the R and Y1 tagFixes, the R / Y1 steps' direct / partial, every lesson's direct / partial
const taught = {}; const add = (k, s) => (taught[k] ??= new Set()).add(s);
const merged = new Map();
for (const [k, v] of Object.entries(K.tags)) for (const t of v) merged.set(k + '|' + (typeof t === 'string' ? t : t.step), [k, typeof t === 'string' ? t : t.step]);
const RJ = JSON.parse(fs.readFileSync(R + 'data/curriculum/links/R.json', 'utf8'));
for (const od of [RJ, d]) for (const t of od.tagFixes) { if (t.action === 'remove') merged.delete(t.key + '|' + t.step); else merged.set(t.key + '|' + t.step, [t.key, t.step]); }
for (const [, [k, s]] of merged) add(k, s);
for (const od of [RJ, d]) for (const [sid, s] of Object.entries(od.steps)) for (const e of [...s.direct, ...s.partial]) add(e.key, sid);
for (const [lid, s] of Object.entries(d.lessons || {})) for (const e of [...s.direct, ...s.partial]) add(e.key, lid);
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
// rule 19 (the R/Y1 lane's CONTENT_WEEKS, Kindergarten sheet): the first week each content type is taught
const CONTENT_WEEKS = { 'number lines': 5, 'tens as rods': 8, 'counting in 10s': 9, 'number sentences': 11, coins: 11, 'addition sentences': 11, 'subtraction sentences': 12,
  'equal groups': 19, arrays: 20, 'measuring with units': 24, 'counting in 2s and 5s': 33, 'notes (bills)': 35, 'differences (how many more)': 18, 'clock time': 36,
  'halves and quarters': 36, '< > symbols': 4 };
const SENT = /^(addition:(nl_add|number_line_add|add_three|add_10_no_regroup|add_10_mixed|cloze_addition|number_families_add|add_sub_fact_family|add_20|equal_sign|add_facts|add_sub_mixed)|subtraction:(nl_sub|number_line_sub|missing_add_sub|sub_10|sub_20|mixed_add_sub|sub_10_no_regroup|sub_10_mixed))/;
const R_EQ = /^(addition:(nl_add|number_line_add|add_three|add_10_no_regroup|add_10_mixed|cloze_addition|number_families_add|add_sub_fact_family|add_20|equal_sign|add_facts|add_sub_mixed)|subtraction:(nl_sub|number_line_sub|missing_add_sub|sub_10|sub_20|mixed_add_sub|sub_10_no_regroup|sub_10_mixed)|number_sense:place_on_number_line)/;
const R_WRITTEN = /^(measurement:(time_|clock_)|multiplication:)/;
const TIME = /^measurement:(time|elapsed|clock|order_clocks|mixed_time)/;
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
    if (q.cell && !TIME.test(key)) walk(q.cell.payload, '');
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
// rule 19 content types of a skill + its items (the R/Y1 lane's ctypes(), item classes counted on >= 3 of the items)
function ctypes(k, o, r) {
  const t = new Set(), hit = nm => (r.c19[nm] || 0) >= 3;
  if (hit('nline') || /number_line|:nl_|place_on_number_line/.test(k)) t.add('number lines');
  if (/tens_foundation|base10|unit_form/.test(k)) t.add('tens as rods');
  if (/^patterns:seq_10/.test(k)) t.add('counting in 10s');
  if (hit('skip25') || /^patterns:(seq_2|seq_5|skip_count_line)/.test(k)) t.add('counting in 2s and 5s');
  if (SENT.test(k)) { t.add('number sentences'); t.add(k.startsWith('subtraction:') ? 'subtraction sentences' : 'addition sentences'); }
  if (hit('minus') && (SENT.test(k) || k.startsWith('addition:'))) t.add('subtraction sentences');
  if (hit('money') || /^measurement:(coin|money|equiv_coin)/.test(k)) t.add('coins');
  if (k === 'multiplication:equal_or_unequal_groups') t.add('equal groups');
  if (hit('array') || k === 'multiplication:arrays_groups') t.add('arrays');
  if (hit('units') || /measure_nonstandard|reading_ruler/.test(k)) t.add('measuring with units');
  if (hit('clock') || TIME.test(k)) t.add('clock time');
  if (hit('frac') || /^(fractions:|patterns:halve|shapes_early:partition)/.test(k)) t.add('halves and quarters');
  if (hit('lt') || k.startsWith('placevalue:compare')) t.add('< > symbols');
  if (hit('diff')) t.add('differences (how many more)');
  return [...t];
}
const weekLimit = w => w < 8 ? 20 : w < 10 ? 50 : 100;
function content(id, e, r, role) {
  const out = [], link = role === 'pre' || role === 'related';
  if (r.items.some(i => i.err)) out.push('generation error');
  if (!r.items.length) out.push('no items');
  if (r.items.length >= 20 && r.distinct < 3) out.push(`degenerate: ${r.distinct} distinct items in ${r.items.length}`);
  if (!link) return out;
  for (const [nm, c] of Object.entries(r.flags)) if (c) out.push(`${FLAGWHY[nm]} (${c} of ${r.items.length} items)`);
  if (/name_match/.test(e.key)) out.push('it drags written names');
  if (isSupport(id)) {
    if (R_EQ.test(e.key)) out.push('a symbol equation or number line: not a Reception response (R_EQ)');
    if (R_WRITTEN.test(e.key)) out.push('a written Kindergarten answer (clock times, groups-of sentences): not a Reception response');
    const ph = phaseOf(id);
    if (ph && ph.first < 6 && (r.c19.quad || 0) >= 3 && !/square|rectangle|4 sides/i.test(d.lessons[id].title)) out.push(`shows squares and rectangles (${r.c19.quad} items), which Reception meets in block 6, after this lesson's phase (${ph.name})`);
  } else {
    const w = n(lessonWk(id)), lim = role === 'related' ? w + 2 : w;
    for (const t of ctypes(e.key, e.opts || {}, r)) if (CONTENT_WEEKS[t] > lim) out.push(`rule 19: ${t} first taught W${String(CONTENT_WEEKS[t]).padStart(2, '0')}, the lesson is W${String(w).padStart(2, '0')}${role === 'related' ? ' (related: more than 2 weeks ahead)' : ''}`);
    if (!TIME.test(e.key) && r.max > weekLimit(w)) out.push(`rule 19: numbers to ${r.max}, past ${weekLimit(w)} at week W${String(w).padStart(2, '0')}`);
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
  'K.CC.A.3': { why: 'a numeral written', ok: items => items.filter(i => /^(number|text)$/.test(i.at || '')).length >= items.length / 2 } };
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
const CITE = /^((?:R|Y\d)\.B\d+\.S\d+|(?:G\d|K|PK)\|-\|[a-z0-9]+)\b/;
function citeCheck(id, e) {
  const m = String(e.why || '').match(CITE);
  if (!m) return ['the why does not start with the step or site lesson it cites'];
  const ref = m[1], out = [];
  if (!titles[ref]) return [`cites ${ref}, which is not a WRM step or a site lesson`];
  if (!String(e.why).startsWith(`${ref} ${titles[ref]}`)) out.push(`the why does not give the cited unit's own title after ${ref}`);
  if (!(taught[e.key] && taught[e.key].has(ref))) out.push(`cites ${ref}, which ${e.key} is not tagged to (and is not that unit's direct / partial)`);
  if (ref === id) out.push('cites the lesson itself');
  const ry = unitYear(ref);
  if (isSupport(id)) {
    const ph = phaseOf(id);
    if (ry !== 'R' || siteOf[ref]) out.push(`H: cites ${ref} (${ry}${siteOf[ref] ? ' site lesson' : ''}); a Support lesson judged at Reception cites only an earlier Reception step`);
    else if (ph && blockNo(ref) >= ph.first) out.push(`H: cites ${ref} (block R.B${blockNo(ref)}), not before this Support lesson's source phase ${ph.name} (from R.B${ph.first})`);
  } else if (ry === 'Y1') {
    const rw = wkOf(ref);
    if (!rw) out.push(`cites ${ref}, which has no school week`);
    else if (n(rw) >= n(lessonWk(id))) out.push(`rule 19: cites ${ref}, taught ${rw}, not before this lesson (${lessonWk(id)})`);
  } else if (ry !== 'R') out.push(`cites ${ref}, a ${ry} unit, above Kindergarten`);
  return out;
}
// the cited unit's own ceiling: a Reception step's title number, else its block's number; a Y1 step's title number and direct maximum
const RJsteps = RJ.steps;
const citedCeil = ref => {
  if (!ref || siteOf[ref]) return ref && siteOf[ref] ? ceilOf(ref) : 0;
  const t = Math.max(0, ...titleNums(titles[ref] || ''));
  if (unitYear(ref) === 'R') return t || R_BLOCK_CEIL[blockNo(ref)] || 0;
  const s = d.steps[ref]; let c = t; if (s) for (const e of s.direct) c = Math.max(c, probe(e.key, e.opts || {}, (e.opts || {}).range || 10).max);
  return c;
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
  for (const role of ['pre', 'related']) for (const e of s[role]) {
    checked++;
    const r = P(e), tag = `${role} ${e.key}${e.opts ? JSON.stringify(e.opts) : ''}${e.maxNumber ? '@' + e.maxNumber : ''}`;
    const cm = role === 'pre' && String(e.why).match(CITE);
    const c = Math.max(own, cm ? citedCeil(cm[1]) : 0), limit = Math.max(1.5 * c, c + 2);
    if (!TIME.test(e.key) && r.max > limit) fails.push(`${tag}: size ${r.max} > ${limit} — ${r.ex}`);
    for (const f of [...content(id, e, r, role), ...whyCheck(e, r), ...digitSymbolChecks(e.why, r.items), ...(role === 'pre' ? citeCheck(id, e) : [])]) fails.push(`${tag}: ${f}`);
  }
  for (const role of ['direct', 'partial']) for (const e of s[role]) {
    const r = P(e);
    for (const f of content(id, e, r, role)) fails.push(`${role} ${e.key}${JSON.stringify(e.opts || {})}: ${f}`);
    // (a shape past 4 sides as a pick's distractor is not content the pupil works on: `poly` is a link gate only)
    if (role === 'direct') {   // RESPONSE (rule 8): a FULL lesson's own items fit the pupil
      if (isSupport(id) && R_EQ.test(e.key)) fails.push(`RESPONSE: direct ${e.key} is a symbol equation or number line, not a Reception response`);
      if (isSupport(id) && R_WRITTEN.test(e.key)) fails.push(`RESPONSE: direct ${e.key} asks for a written Kindergarten answer`);
      for (const [nm, cnt] of Object.entries(r.flags)) if (cnt && !(nm === 'column' && /vertical|column/i.test(s.title)) && nm !== 'poly' && !(nm === 'vert' && /\bvert|corner|properties/i.test(s.title)))
        fails.push(`RESPONSE: direct ${e.key}: ${FLAGWHY[nm]} (${cnt} of ${r.items.length} items), which the title "${s.title}" does not ask`);
    }
    if (role === 'partial') {
      for (const h of CL.claimHits(e.missing, r.items, { gateOnly: true })) if (!h.ok) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause claims "${h.word}" (${h.claim}) but only ${h.hit} of ${h.n} items show it`);
      for (const h of CL.negatedHits(e.missing, r.items)) if (!h.ok) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause says "${h.part}" is not dealt, but ${h.hit} of ${h.n} items do it (${h.claim})`);
      for (const f of digitSymbolChecks(e.missing, r.items)) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})}: ${f}`);
      if (NOPIC.test(e.missing) && noPicHits(e.missing, r.items) > r.items.length / 3) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause says no pictures, but ${noPicHits(e.missing, r.items)} of ${r.items.length} items show a picture`);
      // lessons critic r2 F12: "never 0 as a number to write / find / answer" is false when an item answers 0
      for (const p of CL.negatedParts(e.missing)) if (/(?<![\d.])0(?![\d.])|\bzero\b/i.test(p) && /\bwrit|\banswer|\bfind|\bas a number\b/i.test(p)) {
        const z = r.items.filter(i => String(i.a).trim() === '0').length;
        if (z) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause says "never ${p}", but ${z} of ${r.items.length} items have the answer 0`); }
      for (const f of boundTooBig(e.missing, r.items)) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause: ${f}`);
      for (const f of whyCheck({ why: e.missing.replace(/\b(?:never|no|not|without)\b[^;.]*/gi, ' ') }, r)) fails.push(`partial ${e.key}${JSON.stringify(e.opts || {})} clause: ${f}`);
    }
  }
  const sigOf = r => r.items.map(i => i.text + '|' + i.a + '|' + i.vis + '|' + i.tpl + '|' + i.pay).join('\n');
  const ownSig = new Map(); for (const e of [...s.direct, ...s.partial]) ownSig.set(sigOf(P(e)), e.key);
  for (const role of ['pre', 'related']) { const seen = new Map();
    for (const e of s[role]) { const sg = sigOf(P(e));
      if (ownSig.has(sg)) fails.push(`${role} ${e.key}${JSON.stringify(e.opts || {})}: deals the same items as the lesson's own ${ownSig.get(sg)} (class F)`);
      if (seen.has(sg)) fails.push(`${role} ${e.key}: duplicate of ${seen.get(sg)} (same items)`); else seen.set(sg, e.key); } }
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
  if (fails.length || ALL) console.log(`${id} [${isSupport(id) ? 'Support, Reception, ' + (phaseOf(id)?.name || '?') : lessonWk(id)}] ceiling ${own}: ${fails.length ? fails.length + ' FAIL\n   ' + fails.join('\n   ') : 'ok'}`);
}
console.log(`lessonfit: ${Object.keys(d.lessons || {}).length} lessons, ${checked} links, ${NPER} items a link; ${bad} findings`);
process.exitCode = bad || process.exitCode ? 1 : 0;
