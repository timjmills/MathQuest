// ws-text-vs-gen — TEXT ≠ GENERATOR (IMPROVEMENT_PLAN §1.4 S2, the class seen in the most critic reports: UNTRUE_TEXT).
// A teacher-facing line that states what a skill deals or draws is a CLAIM; this gate holds every claim to the thing it is
// about, with no browser (node only, seconds):
//
//   --wrm    the White Rose links files (data/curriculum/links/<year>.json). A step or lesson marked FULL claims that its
//            direct skills, with their recorded opts, deal what its TITLE names. ~300 seeded items are generated per
//            claim (generateQuestionFor, the app's own generator) and each claim is read from what the items really carry
//            (text, drawing HTML, the kit cell's payload, the answer):
//              REP     a representation the title names (bar model, number line, part-whole, array, ten frame, clock,
//                      coins, pictogram, bar chart, tally, table, column method, base-ten, place-value chart, hundred
//                      square, fraction wall …) must be drawn in at least half the items (critic r13 N13: Y3.B6.S10
//                      "Equivalent fractions as bar models" marked full on 80 / 80 circle items)
//              RANGE   a title range ("to 1,000", "within 20", "up to 10") must be reached: some item deals a number of at
//                      least 30 % of it (a "to 1,000" step that never leaves the tens is not full)
//   --looks  "Skills to be made" (js/modules/build-queue.js + todo-text.js): every "How it looks" line against its entry's
//            own structured fields (critic r8 M12: "the pupil matches the pairs" on an entry whose answer is "write the
//            product in the grid"; "shapes" from "outline"; "coins and notes" from "percent")
//              RESPONSE  a response the line names (circles, matches, draws, writes, ticks, drags, shades …, or "answers
//                        by …ing") must be one the entry declares (its spec.answer, or its option's `response`); a line
//                        may not name a response when the entry declares none
//              DRAWING   every drawing a "Shows … in black and white" line names must have a source in the entry: one of
//                        its content words in the representation note (not negated), a kit template id the note lists,
//                        or a White Rose picture the entry closes
//
//   node tests/scripts/ws-text-vs-gen.mjs                          # both, this tree
//   node tests/scripts/ws-text-vs-gen.mjs --wrm --years Y3 --n 300  # one mode, some years, items per claim
//   node tests/scripts/ws-text-vs-gen.mjs --root <checkout>        # another checkout's app and data (MQ_ROOT works too)
//   node tests/scripts/ws-text-vs-gen.mjs --baseline design/audit/baselines/text-vs-gen.json   # fail only NEW findings
//   node tests/scripts/ws-text-vs-gen.mjs --json out.json --report-only --verbose
//
// The check code is always this file's; --root only chooses whose app, data and links are read (backtests run today's
// check on an old commit). A module or file the root lacks is reported and its mode skipped, never faked.
// Prints the findings, then `ws-text-vs-gen: OK` or `ws-text-vs-gen: FAIL (n)`; exit 1 on FAIL.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const has = (f) => argv.includes(`--${f}`);
const arg = (f, d) => { const i = argv.indexOf(`--${f}`); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const TOOL = 'ws-text-vs-gen';
const ROOT = resolve(arg('root', process.env.MQ_ROOT || HERE));
const MODES = { wrm: has('wrm') || !has('looks'), looks: has('looks') || !has('wrm') };
const N = Math.max(20, parseInt(arg('n', '300'), 10) || 300);
const YEARS = arg('years', 'R,Y1,Y2,Y3,Y4,Y5,Y6').split(',').map((s) => s.trim()).filter(Boolean);
const t0 = Date.now();

// the app's modules read localStorage / window at import; under node they get a quiet stand-in
const _m = new Map();
globalThis.localStorage = globalThis.localStorage || { getItem: (k) => (_m.has(k) ? _m.get(k) : null), setItem: (k, v) => _m.set(k, String(v)), removeItem: (k) => _m.delete(k) };
globalThis.window = globalThis.window || globalThis;
const quiet = async (fn) => { const l = console.log, w = console.warn, e = console.error; console.log = () => {}; console.warn = () => {}; console.error = () => {}; try { return await fn(); } finally { console.log = l; console.warn = w; console.error = e; } };
const mod = async (rel) => { const p = join(ROOT, rel); if (!existsSync(p)) return null; try { return await quiet(() => import(pathToFileURL(p).href)); } catch (e) { return { __error: e.message }; } };

const findings = [];
const skipped = [];
const add = (mode, rule, id, msg) => findings.push({ mode, rule, id, msg });
const strip = (s) => String(s == null ? '' : s).replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

/* ------------------------------------------------------------------------------------------------ --wrm */
// A representation a title names, and how an item shows it. `t` reads the TITLE; `i` reads the item fingerprint
// (lower case: question text, drawing HTML with its attributes, the kit cell's template and payload, the answer).
export const TITLE_REPS = [
    { n: 'bar model', t: /\bbar models?\b|\bbar diagrams?\b|\btape diagrams?\b/i, i: /bar[- ]?model|"kind":"bar"|"model":"bar"|"model":\["bar"|bar-model|tape|fraction (?:strip|bar)|frac-?bar|"bars?":/ },
    { n: 'number line', t: /\bnumber lines?\b/i, i: /number[- ]?line|"template":"(?:number-line|nl-place|hop-line|value-line)"|data-mq-template="(?:number-line|nl-place|hop-line|value-line)"|mqrefline|numberline|"nl[a-z]*":/ },
    { n: 'part-whole model', t: /\bpart[- ]whole\b/i, i: /part[- ]?whole|"template":"bond"|data-mq-template="bond"|cherry|"whole":/ },
    { n: 'array', t: /\barrays?\b/i, i: /\barrays?|"template":"arrays|data-mq-template="arrays|"rows":\d+,"cols"|"cols":\d+/ },
    { n: 'ten frame', t: /\bten[- ]frames?\b|\btens? frames?\b/i, i: /ten[- ]?frame|tenframe/ },
    { n: 'hundred square', t: /\bhundred (?:square|chart)s?\b|\b100 (?:square|chart)\b/i, i: /hundred (?:square|chart)|chartwindow|hundred-?chart|"template":"chartwindow"/ },
    { n: 'base-ten blocks', t: /\bbase[- ](?:10|ten)\b|\bdienes\b/i, i: /base[- ]?(?:10|ten)|dienes|"template":"base10"|data-mq-template="base10"|"tens":\d|"rods"/ },
    { n: 'place-value chart', t: /\bplace[- ]value (?:charts?|counters|grids?|tables?)\b/i, i: /place[- ]?value|"template":"pv|data-mq-template="pv|pv-(?:chart|grid|col)|"cols":\["/ },
    { n: 'column method', t: /\bcolumn (?:method|addition|subtraction)\b|\bcolumnar\b/i, i: /"template":"stack"|data-mq-template="stack"|column|stack/ },
    { n: 'clock', t: /\bclocks?\b|\bo'clock\b|\bhalf past\b|\bquarter (?:past|to)\b|\bminutes? (?:past|to)\b/i, i: /clock|"hour":|"minute":|\b\d{1,2}:\d\d\b|o'clock|past|quarter to/ },
    { n: 'coins or notes', t: /\bcoins?\b|\bnotes\b|\bmoney\b|\bpence\b|\bpounds\b|£/i, i: /coin|£|\bp\b|pence|\bnotes?\b|"template":"coins"|money|\$|¢|cents?\b|dollars?/ },
    { n: 'pictogram', t: /\bpictograms?\b|\bpictographs?\b|\bpicture graphs?\b/i, i: /pictogra|picture graph|"template":"pictograph"|data-mq-template="pictograph"|stands for/ },
    { n: 'bar chart', t: /\bbar (?:charts?|graphs?)\b/i, i: /bar[- ]?(?:chart|graph)|"template":"bar-graph"|data-mq-template="bar-graph"|"kind":"bar"|"type":"bar"/ },
    { n: 'tally chart', t: /\btally\b|\btallies\b/i, i: /tally|tallies|"template":"tally-chart"/ },
    { n: 'table', t: /\btables?\b(?!s)(?<!times[- ]tables?)/i, i: /<table|"template":"(?:data-table|function-table)"|data-mq-template="(?:data-table|function-table)"|\btable\b|"rows":\[/ },
    { n: 'fraction wall', t: /\bfraction walls?\b/i, i: /fraction wall|"wall"|frac-?wall|"kind":"bar"/ },
    { n: 'protractor', t: /\bprotractors?\b/i, i: /protractor/ },
    { n: 'ruler', t: /\brulers?\b/i, i: /ruler/ },
    { n: 'thermometer', t: /\bthermometers?\b|\btemperature\b/i, i: /thermometer|°|temperature/ },
    { n: 'line graph', t: /\bline graphs?\b/i, i: /line[- ]?graph|"template":"graph-axes"|"kind":"line"|"type":"line"|polyline/ },
    { n: 'coordinates', t: /\bcoordinates?\b|\bgrid\b(?! method)/i, i: /coordinate|coord-grid|\(\s*-?\d+\s*,\s*-?\d+\s*\)|"x":-?\d+,"y"|grid/ },
];
const SHARE = 0.5;
const fingerprint = (q) => [q.text, q.visual, q.cell ? JSON.stringify(q.cell) : '', q.ans == null ? '' : JSON.stringify(q.ans), Array.isArray(q.options) ? q.options.join(' ') : '', q.answerType || '', q.printFormat || ''].join(' \u0001 ').toLowerCase();
// numbers an item deals: from the text the pupil reads and the answer (attributes and sizes are not numbers dealt)
const numbersOf = (q) => (`${strip(q.text)} ${strip(q.visual)} ${q.ans == null ? '' : JSON.stringify(q.ans)}`.replace(/(\d),(?=\d{3}\b)/g, '$1').match(/\d+(?:\.\d+)?/g) || []).map(Number);
const rangeOf = (title) => {
    const m = String(title).match(/\b(?:to|within|up to)\s+(\d{1,3}(?:,\d{3})+|\d+)(?!\s*(?:s\b|times|minutes?|o'clock|cm|mm|m\b|kg|g\b|ml|l\b|p\b|°))/i);
    const v = m ? Number(m[1].replace(/,/g, '')) : 0;
    return v >= 10 ? v : 0;
};

/** One FULL step or lesson: its title's claims against the items of its direct links. Returns the claims read (0 = none). */
function checkFull(id, s, itemsOf, sink) {
    if (!s || s.verdict !== 'full' || !(s.direct || []).length) return 0;
    const title = String(s.title || '');
    const reps = TITLE_REPS.filter((r) => r.t.test(title));
    const range = rangeOf(title);
    if (!reps.length && !range) return 0;
    const per = Math.max(10, Math.ceil(N / s.direct.length));
    const items = s.direct.flatMap((d) => itemsOf(d.key, d.opts, per));
    const ok = items.filter((x) => !x.err);
    const links = s.direct.map((d) => `${d.key} ${JSON.stringify(d.opts || {})}`).join(' + ');
    if (!ok.length) { sink('wrm', 'GEN', id, `"${title}" is full but its direct skills deal no item (${(items.find((x) => x.err) || {}).err || 'nothing generated'})`); return 1; }
    for (const r of reps) {
        const hit = ok.filter((x) => r.i.test(x.fp)).length;
        if (hit < SHARE * ok.length) sink('wrm', 'REP', id, `"${title}" is full, but the title's ${r.n} is drawn in ${hit} of ${ok.length} items (${links}): at least half must show it, or the verdict is partial`);
    }
    if (range) {
        const max = Math.max(0, ...ok.flatMap((x) => x.nums));
        if (max < 0.3 * range) sink('wrm', 'RANGE', id, `"${title}" is full, but the largest number dealt in ${ok.length} items is ${max}, under 30 % of ${range.toLocaleString('en-GB')} (${links})`);
    }
    return reps.length + (range ? 1 : 0);
}

/** The items of one link (key + opts), n seeded items, each as its fingerprint and the numbers it deals; cached. */
function makeItemsOf(GQ) {
    const cache = new Map();
    const itemsOf = (key, opts, n) => {
        const ck = `${key}|${JSON.stringify(opts || {})}|${n}`;
        if (cache.has(ck)) return cache.get(ck);
        const [category, skill] = String(key).split(':');
        const o = { ...(opts || {}) }; delete o.note;
        const out = [];
        const l = console.log, w = console.warn, e = console.error; console.log = () => {}; console.warn = () => {}; console.error = () => {};
        try {
            for (let i = 0; i < n; i++) {
                try { const q = GQ.generateQuestionFor({ category, skill, opts: o, seed: 7001 + i * 31, itemIndex: i }); if (q) out.push({ fp: fingerprint(q), nums: numbersOf(q) }); } catch (err) { out.push({ err: err.message }); }
            }
        } finally { console.log = l; console.warn = w; console.error = e; }
        cache.set(ck, out);
        return out;
    };
    return itemsOf;
}

async function loadGenerator() {
    const GQ = await mod('js/modules/generate-question.js');
    return GQ && !GQ.__error && typeof GQ.generateQuestionFor === 'function' ? GQ : { missing: GQ && GQ.__error ? GQ.__error : 'module missing' };
}

async function runWrm() {
    const GQ = await loadGenerator();
    if (GQ.missing) { skipped.push(`--wrm: ${ROOT} has no generateQuestionFor (${GQ.missing})`); return; }
    const itemsOf = makeItemsOf(GQ);
    let entries = 0, claims = 0, years = 0;
    for (const Y of YEARS) {
        const f = join(ROOT, `data/curriculum/links/${Y}.json`);
        if (!existsSync(f)) continue;
        years += 1;
        const L = JSON.parse(readFileSync(f, 'utf8'));
        const all = [...Object.entries(L.steps || {}).map(([id, s]) => [id, s]), ...Object.entries(L.lessons || {}).map(([id, s]) => [`${Y} lesson ${id}`, s])];
        for (const [id, s] of all) {
            const c = checkFull(id, s, itemsOf, add);
            if (c) { entries += 1; claims += c; }
        }
    }
    if (!years) skipped.push(`--wrm: ${ROOT} has no data/curriculum/links/{${YEARS.join(',')}}.json`);
    console.log(`  wrm: ${years} year file(s), ${entries} full entries with a title claim, ${claims} claim(s), ${N} items per entry`);
}

/* ---------------------------------------------------------------------------------------------- --looks */
// response verbs, each to its group; a line's verb and the entry's declared verbs are read with THIS table, not the app's
const VERBS = [
    ['write', /\b(?:writes?|writing|written|types?|typing|fills? in|filling in|completes?|completing|copies|copying|numbers? them|numbering|orders?|ordering)\b/],
    ['circle', /\b(?:circles?|circling|rings?|ringing|loops?|looping)\b/],
    ['tick', /\b(?:ticks?|ticking|true or false|true\/false)\b/],
    ['choose', /\b(?:chooses?|choosing|picks?|picking|taps?|tapping|selects?|selecting)\b/],
    ['draw', /\b(?:draws?|drawing|drawn|plots?|plotting|marks?|marking|tally marks|sketch(?:es)?)\b/],
    ['shade', /\b(?:shades?|shading|colou?rs?|colou?ring)\b/],
    ['match', /\b(?:match(?:es)?|matching|joins?|joining)\b/],
    ['drag', /\b(?:drags?|dragging|builds?|building|moves?|moving|sorts?|sorting)\b/],
    ['say', /\b(?:says?|saying)\b/],
    ['count', /\b(?:counts?|counting)\b/],
];
// groups that answer one another (a tap on screen is the circle or tick on paper)
const SAME = { choose: ['circle', 'tick'], circle: ['choose'], tick: ['choose'] };
const groupsIn = (text) => VERBS.filter(([, re]) => re.test(String(text || '').toLowerCase())).map(([g]) => g);
// the response clause of a composed "How it looks" line ("…; the pupil circles the answer." / "…; the pupil answers by …")
const responseOf = (line) => { const m = /\bthe pupil ([^.;]+)/i.exec(String(line)); return m ? m[1] : ''; };
const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'with', 'in', 'on', 'its', 'their', 'to', 'black', 'white', 'shows', 'some', 'two', 'one', 'three', 'four', 'part', 'parts', 'new', 'picture', 'pictures', 'line', 'drawing', 'drawings']);
const words = (s) => (String(s).toLowerCase().match(/[a-z][a-z-]+/g) || []).filter((w) => !STOP.has(w) && w.length >= 3);
const stem = (w) => w.replace(/(?:ies)$/, 'y').replace(/(?:es|s)$/, '').slice(0, Math.max(4, Math.min(6, w.length)));
// a drawing named by its family word is sourced by any member the note names ("shapes" by "a rectangle")
const SYN = [
    [/^shapes$/, /\b(?:triangles?|rectangles?|squares?|polygons?|quadrilaterals?|pentagons?|hexagons?|octagons?|solids?|cubes?|cuboids?|shapes?|kites?|rhomb)/],
    [/graph or chart|^a graph$|^a chart$/, /graph|chart|plot|pictogra/],
    [/timeline/, /time ?line/],
    [/^a grid$/, /grid|squared paper|dot paper/],
    [/base-ten/, /base[- ](?:ten|10)|\brods?\b|dienes|\bcubes?\b/],
];
const unNegated = (t) => String(t || '').replace(/\b(?:no|not|without|never)\s+(?:a\s+|an\s+|the\s+)?[\w-]+(?:\s+[\w-]+)?/gi, ' ');

/**
 * One "How it looks" line against its entry (RESPONSE, DRAWING). Returns false when the line is the entry's own note
 * shown whole (nothing composed to check). ctx: { kitWords: {id: words}, visualNames(e): [White Rose picture names] }.
 */
export function checkLooks(e, looks, ctx, sink) {
    const kitWords = (ctx && ctx.kitWords) || {};
    const visualNames = (ctx && ctx.visualNames) || (() => []);
    const rep = String(e.representation || '');
    if (looks.trim() === rep.trim() || (rep && looks.toLowerCase().includes(rep.toLowerCase().slice(0, 40)))) return false;   // the entry's own note, shown whole
    // RESPONSE
    const said = groupsIn(responseOf(looks));
    const answer = e.spec && typeof e.spec === 'object' ? String(e.spec.answer || '') : '';
    const optResp = (/\bresponse\s*(?::\s*|")([^"—(;]+)/i.exec(String(e.option || '')) || [])[1] || '';
    const decl = groupsIn(`${answer} ; ${optResp}`);
    for (const g of said) {
        if (!decl.length) { sink('looks', 'RESPONSE', e.id, `"How it looks" says the pupil ${responseOf(looks).trim()}, but the entry declares no response (no spec.answer, no option response): "${looks}"`); break; }
        if (!decl.includes(g) && !(SAME[g] || []).some((x) => decl.includes(x))) sink('looks', 'RESPONSE', e.id, `"How it looks" says the pupil ${g}s (${responseOf(looks).trim()}), but the entry declares "${[answer, optResp].filter(Boolean).join('; ')}": "${looks}"`);
    }
    // DRAWING
    const shows = /^Shows (.+?) in black and white/.exec(looks);
    if (!shows || /^the White Rose pictures? /.test(shows[1])) {
        if (shows) for (const [, n] of shows[1].matchAll(/"([^"]+)"/g)) if (!visualNames(e).some((v) => v.replace(/\s*\([^()]*\)/g, '').replace(/\s*\/\s*/g, ' or ').startsWith(n.toLowerCase().slice(0, 12)))) sink('looks', 'DRAWING', e.id, `White Rose picture "${n}" is not one the entry closes`);
        return true;
    }
    const src = unNegated(rep).toLowerCase().replace(/\b10\b/g, 'ten');
    const ids = unNegated(rep).toLowerCase().split(/[\s,.+:;()]+/);
    // a kit template id the note lists is drawn by name ("stack" → "a column method"): those phrases are sourced
    let left = shows[1].toLowerCase();
    for (const [k, v] of Object.entries(kitWords).sort((x, y) => String(y[1]).length - String(x[1]).length)) if (ids.includes(k)) left = left.split(String(v).toLowerCase()).join(' , ');
    for (const d of left.split(/,|\band\b(?! [a-z]+ers\b)/)) {
        const p = d.trim();
        const ws = words(p);
        if (!ws.length) continue;
        const syn = SYN.find(([re]) => re.test(p));
        if (syn && syn[1].test(src)) continue;
        if (!ws.some((w) => src.includes(stem(w)))) sink('looks', 'DRAWING', e.id, `"How it looks" names "${p}", which the entry's representation does not: "${rep.slice(0, 100)}"`);
    }
    return true;
}

async function runLooks() {
    const BQ = await mod('js/modules/build-queue.js');
    const TT = await mod('js/modules/todo-text.js');
    if (!BQ || BQ.__error || !TT || TT.__error || typeof BQ.buildQueue !== 'function' || typeof (TT.todoLooks || TT.todoTexts) !== 'function') {
        skipped.push(`--looks: ${ROOT} has no build-queue.js buildQueue / todo-text.js todoLooks (${(BQ && BQ.__error) || (TT && TT.__error) || 'module missing'})`);
        return;
    }
    const DATA = await mod('js/modules/data.js');
    const WL = await mod('js/modules/wrm-links.js');
    const TL = await mod('js/modules/teacher-label.js');
    const VC = await mod('js/modules/visual-catalogue.js');
    if (WL && typeof WL.setSkillLabeler === 'function' && DATA && DATA.SKILLS) {
        const clean = (l) => String(l || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').replace(/^[\s½]+(?=\S)/, '').replace(/\s+/g, ' ').trim();
        WL.setSkillLabeler((id) => {
            const [a, b] = String(id).includes(':') ? String(id).split(':') : [DATA.getCategoryForSkill ? DATA.getCategoryForSkill(id) : '', id];
            const sk = (DATA.SKILLS[a] || []).find((x) => x.v === b);
            return sk ? (TL && TL.teacherLabel ? TL.teacherLabel(clean(sk.l)) : clean(sk.l)) : null;
        });
    }
    // the queue as the teacher screen builds it: the build list plus every links file and MAP.json on disk
    const years = [];
    for (const y of ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6']) { const f = join(ROOT, `data/curriculum/links/${y}.json`); if (existsSync(f)) years.push(JSON.parse(readFileSync(f, 'utf8'))); }
    const mf = join(ROOT, 'data/curriculum/links/MAP.json');
    const map = existsSync(mf) ? JSON.parse(readFileSync(mf, 'utf8')) : null;
    if (WL && WL.clearCurated && WL.addCuratedYear) { WL.clearCurated(); for (const d of years) WL.addCuratedYear(d); }
    const Q = await quiet(() => BQ.buildQueue({ curated: years, map }));
    if (TT.setTodoNames) TT.setTodoNames(Q.items);
    const kitWords = TT.KIT_WORDS || {};
    const visualNames = (e) => (VC && VC.VISUALS ? Object.values(VC.VISUALS).filter((v) => (v[2] || []).includes(e.id)).map((v) => String(v[1]).toLowerCase()) : []);
    let lines = 0, composed = 0;
    for (const e of Q.items) {
        const looks = String(TT.todoLooks ? TT.todoLooks(e) : (TT.todoTexts(e) || {}).looks || '');
        if (!looks) continue;
        lines += 1;
        if (checkLooks(e, looks, { kitWords, visualNames }, add)) composed += 1;
    }
    console.log(`  looks: ${Q.items.length} entries, ${lines} "How it looks" lines, ${composed} composed (the others are the entry's own note)`);
}

/* ------------------------------------------------------------------------------------------- --self-test */
// Every rule proven by a planted claim that must fire and a true one that must not (this tree's generator).
if (has('self-test')) {
    const GQ = await loadGenerator();
    if (GQ.missing) { console.log(`${TOOL}: FAIL (self-test: no generateQuestionFor: ${GQ.missing})`); process.exit(1); }
    const itemsOf = makeItemsOf(GQ);
    const run = (fn) => { const got = []; fn((m, r, id, msg) => got.push({ r, msg })); return got; };
    const full = (title, key, opts) => ({ title, verdict: 'full', direct: [{ key, opts }] });
    const T = [
        ['REP fires: "as bar models" full on circles (critic r13 N13)', 'REP', (s) => checkFull('st', full('Equivalent fractions as bar models', 'fractions:equiv_frac_visual', {}), itemsOf, s)],
        ['REP quiet: the same step with model bar', null, (s) => checkFull('st', full('Equivalent fractions as bar models', 'fractions:equiv_frac_visual', { model: ['bar'] }), itemsOf, s)],
        ['RANGE fires: "to 1,000" full on facts to 20', 'RANGE', (s) => checkFull('st', full('Numbers to 1,000', 'addition:add_facts', {}), itemsOf, s)],
        ['RANGE quiet: a partial verdict claims nothing', null, (s) => checkFull('st', { ...full('Numbers to 1,000', 'addition:add_facts', {}), verdict: 'partial' }, itemsOf, s)],
        ['RESPONSE fires: "matches the pairs" on a write answer (critic r8 M12)', 'RESPONSE', (s) => checkLooks({ id: 'st', representation: 'one boxed cell: the product grid', spec: { answer: 'write the product in the grid' } }, 'Shows a grid in black and white; the pupil matches the pairs.', {}, s)],
        ['RESPONSE fires: a response with none declared', 'RESPONSE', (s) => checkLooks({ id: 'st', representation: 'empty circles to fill with counters' }, 'Shows counters in black and white; the pupil circles the answer.', {}, s)],
        ['RESPONSE quiet: "answers by writing" on a write answer', null, (s) => checkLooks({ id: 'st', representation: 'one boxed cell: the product grid', spec: { answer: 'write the product in the grid' } }, 'Shows a grid in black and white; the pupil answers by writing.', {}, s)],
        ['DRAWING fires: "shapes" from "outline counters"', 'DRAWING', (s) => checkLooks({ id: 'st', representation: 'outline counters in two rows' }, 'Shows counters and shapes in black and white.', {}, s)],
        ['DRAWING fires: "coins and notes" from "percent"', 'DRAWING', (s) => checkLooks({ id: 'st', representation: '7/25 = [ ]/100 = [ ] percent' }, 'Shows coins and notes in black and white.', {}, s)],
        ['DRAWING quiet: "shapes and a grid" from a rectangle on a grid', null, (s) => checkLooks({ id: 'st', representation: 'a rectangle on a unit grid' }, 'Shows shapes and a grid in black and white.', {}, s)],
        ['DRAWING quiet: a kit id drawn by name', null, (s) => checkLooks({ id: 'st', representation: 'stack, bond' }, 'Shows a column method and a part-whole bond in black and white.', { kitWords: { stack: 'a column method', bond: 'a part-whole bond' } }, s)],
    ];
    let bad = 0;
    for (const [name, want, fn] of T) {
        const got = run(fn);
        const ok = want ? got.some((g) => g.r === want) : !got.length;
        if (!ok) bad += 1;
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : ` (got ${got.map((g) => g.r).join(', ') || 'nothing'})`}`);
    }
    console.log(bad ? `${TOOL}: FAIL (self-test, ${bad} of ${T.length})` : `${TOOL}: OK (self-test, ${T.length} planted claims)`);
    process.exit(bad ? 1 : 0);
}

/* ------------------------------------------------------------------------------------------------ main */
console.log(`${TOOL}: root ${ROOT === HERE ? 'this tree' : ROOT}; ${Object.entries(MODES).filter(([, v]) => v).map(([k]) => `--${k}`).join(' ')}`);
if (MODES.looks) await runLooks();
if (MODES.wrm) await runWrm();
const keyOf = (f) => `${f.mode}|${f.rule}|${f.id}`;
let known = new Set();
if (arg('baseline', null)) {
    const p = resolve(arg('baseline'));
    if (existsSync(p)) known = new Set((JSON.parse(readFileSync(p, 'utf8')).findings || []).map(keyOf));
    else console.log(`${TOOL}: baseline ${arg('baseline')} not found; every finding counts`);
}
if (arg('json', null)) writeFileSync(resolve(arg('json')), JSON.stringify({ tool: TOOL, n: N, years: YEARS, findings: findings.map((f) => ({ mode: f.mode, rule: f.rule, id: f.id, msg: f.msg })) }, null, 1) + '\n');
const fresh = findings.filter((f) => !known.has(keyOf(f)));
const by = {};
for (const f of findings) by[`${f.mode} ${f.rule}`] = (by[`${f.mode} ${f.rule}`] || 0) + 1;
console.log('');
console.log(`${'mode'.padEnd(7)}${'rule'.padEnd(10)}findings`);
for (const [k, v] of Object.entries(by)) { const [m, r] = k.split(' '); console.log(`${m.padEnd(7)}${r.padEnd(10)}${v}`); }
const show = has('verbose') ? findings : findings.slice(0, 40);
if (show.length) console.log('');
for (const f of show) console.log(`  [${f.mode} ${f.rule}] ${f.id}: ${f.msg}${known.has(keyOf(f)) ? ' (baseline)' : ''}`);
if (show.length < findings.length) console.log(`  … ${findings.length - show.length} more (--verbose)`);
for (const s of skipped) console.log(`  skipped ${s}`);
console.log(`\n${findings.length} finding(s), ${fresh.length} new; ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (skipped.length && !findings.length && Object.values(MODES).filter(Boolean).length === skipped.length) { console.log(`${TOOL}: FAIL (nothing could be checked in ${ROOT})`); process.exit(1); }
if (fresh.length) { console.log(has('report-only') ? `${TOOL}: WOULD FAIL (${fresh.length}) [report-only, exit 0]` : `${TOOL}: FAIL (${fresh.length})`); process.exit(has('report-only') ? 0 : 1); }
console.log(`${TOOL}: OK`);
