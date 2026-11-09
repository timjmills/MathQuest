// THE LESSON CARD TOOL (E4, design/lessons/cards/README.md). Node only, no browser.
//
//   node tests/scripts/ws-lesson-card.mjs --draft --unit <unit-id> [--out <dir>] [--force]
//        writes one card per CCSS lesson of the unit from design/lessons-first/queue.json + data/curriculum/links +
//        the skill providers + data/curriculum/wrm-vocab.json + design/lessons/SHAPES.md: the unit's CCSS BUILD lessons
//        (owner scope 2026-11-07; --all for every CCSS lesson). Never overwrites a decided card; an undecided one only
//        with --force. The hand-written fields become TODO open questions.
//   node tests/scripts/ws-lesson-card.mjs --check [--unit <unit-id> | <card.md> ...]
//        every field resolves: the machine block parses, the shape is in SHAPES.md and shapes/index.js, every skill
//        is live (SKILLS), every option value is valid against skill-options.js, every range is reachable by the
//        skill's options, every prerequisite lesson is a real id (WRM step, site lesson, CCSS code) or a needs: entry,
//        every misconception is a provider id of a skill the card uses, the card compiles, the compiled library entry
//        passes lessons/schema.js and the compiled description passes detailed/index.js validateDescription, every
//        placeholder resolves to a reader name, and no script line says "no X" over a page that prints X.
//   node tests/scripts/ws-lesson-card.mjs --check-decided [--unit <unit-id> | <card.md> ...]   (alias --check-signed)
//        exit 1 while a card has an undecided line: no "Decided: lf-<lane>, <date>" line, an open question without its
//        `answer`, or a decision without the `rule` it rests on (owner 2026-11-07: the lane decides, nothing waits on the owner).
//   node tests/scripts/ws-lesson-card.mjs --compile --unit <unit-id> [--check]
//        writes js/modules/lessons/units/<unit-id>.js from the unit's cards (--check: exit 1 when it is stale).
//   node tests/scripts/ws-lesson-card.mjs --from-detailed <detailed-id> --unit <unit-id> [--shape <id>]
//        seeds a card from a hand-written long lesson (the proof set, and a migration of any passed lesson):
//        keeps what is the lesson's own, drops what the compiler derives.
//   node tests/scripts/ws-lesson-card.mjs --shapes [--check]
//        writes (or checks) design/lessons/SHAPES.md: every lesson of the queue with its archetype and shape.
//   node tests/scripts/ws-lesson-card.mjs --render [--decided lf-<lane>] <card.md> ...
//        rewrites a card's readable summary from its machine block (after an edit of the block), keeping its Decided line.
//   node tests/scripts/ws-lesson-card.mjs --lines [--unit <unit-id> | <card.md> ...]
//        the hand-written lines of each card (story + hook + teach + the misconceptions' prose) and its total.
// Prints `ws-lesson-card: OK` / `ws-lesson-card: FAIL` like the other gates.
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const rel = (p) => path.relative(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const mem = {};
globalThis.localStorage = globalThis.localStorage || { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
const log = console.log;
console.log = () => {};
const data = await imp('js/modules/data.js').finally(() => { console.log = log; });
const OPT = await imp('js/modules/skill-options.js');
await imp('js/modules/sheet/index.js');
const CONTRACT = await imp('js/modules/sheet/contract.js');
const SCHEMA = await imp('js/modules/lessons/schema.js');
const COMPILE = await imp('js/modules/lessons/compile.js');
const SHAPES = await imp('js/modules/lessons/shapes/index.js');
const READERS = await imp('js/modules/lessons/shapes/readers.js');
const ICONS = await imp('js/modules/sheet/lesson-icons.js');
const LR = await imp('js/modules/sheet/lesson-rules.js');
const DET = await imp('js/modules/lessons/detailed/index.js');

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const CARDS_DIR = path.join(ROOT, 'design/lessons/cards');
const SHAPES_MD = path.join(ROOT, 'design/lessons/SHAPES.md');
const UNITS_DIR = path.join(ROOT, 'js/modules/lessons/units');
const TODAY = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ the card file */
const BLOCK_RE = /```json lesson-card\n([\s\S]*?)\n```/;
// Owner 2026-11-07 (via the lead): no owner sign-off of lesson cards - the lane decides every line from WORKSHEET_DESIGN_STANDARD /
// PEDAGOGY_STANDARD / LESSON_RULES and closes the card with `Decided: lf-<lane>, <date>`.
const SIGNED_RE = /^Decided: (lf-[a-z0-9-]+), (\d{4}-\d{2}-\d{2})\s*$/m;

/** {card, md, signed, file} of a card file, or throws. */
export function readCard(file) {
    const md = fs.readFileSync(file, 'utf8');
    const m = md.match(BLOCK_RE);
    if (!m) throw new Error(`${rel(file)}: no \`\`\`json lesson-card block`);
    let card;
    try { card = JSON.parse(m[1]); } catch (e) { throw new Error(`${rel(file)}: the machine block is not JSON (${e.message})`); }
    const s = md.match(SIGNED_RE);
    return { card, md, signed: s ? `${s[1]}, ${s[2]}` : null, file };
}

/** JSON with short objects and arrays on one line (a card a person can read and edit). */
function pretty(v, ind = '') {
    const one = JSON.stringify(v);
    if (one === undefined) return 'null';
    if (one.length + ind.length <= 156 || v === null || typeof v !== 'object') return one;
    const next = ind + '  ';
    if (Array.isArray(v)) return `[\n${v.map((x) => next + pretty(x, next)).join(',\n')}\n${ind}]`;
    return `{\n${Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => `${next}${JSON.stringify(k)}: ${pretty(x, next)}`).join(',\n')}\n${ind}}`;
}

/** The hand-written lines of a card: the story, the hook, the teaching notes and the misconceptions' prose. */
export function handLines(card) {
    const prose = (card.misconceptions || []).map((m) => ({ name: m.name, fix: m.fix, next: m.next, exits: (m.exits || []).filter((e) => e.next).map((e) => e.next) }));
    let n = 0;
    for (const k of COMPILE.HAND_FIELDS) if (card[k] !== undefined) n += pretty(card[k]).split('\n').length;
    n += pretty(prose).split('\n').length;
    return n;
}

function cardMarkdown(card, { signed = null, drafted = false } = {}) {
    const p = card.parts || {};
    const L = [];
    L.push(`# Lesson card: ${card.title}`);
    L.push('');
    L.push(`**Lesson** \`${card.lesson}\` · **Unit** ${card.unit} · **Grade** ${card.grade} · **CCSS** ${(card.ccss || []).join(', ') || '-'} · **EE** ${(card.ee || []).join(', ') || 'none'} · **Shape** \`${card.shape}\``);
    L.push('');
    L.push(drafted ? 'Drafted by `node tests/scripts/ws-lesson-card.mjs --draft` from the queue, the links files and the skill providers.'
        : 'Seeded by `node tests/scripts/ws-lesson-card.mjs --from-detailed` from the passed hand-written lesson (the E4 proof set).');
    L.push('The machine block at the end is the source of truth (`design/lessons/cards/README.md`); this summary is for reading. The');
    L.push('lane decides every open question (its `answer` and the `rule` it rests on) and closes the card with `Decided: lf-<lane>, <date>`.');
    L.push('');
    L.push('## Parts (skill + options)');
    L.push('');
    L.push('| Part | Skill | Options and floors |');
    L.push('|---|---|---|');
    const show = (r) => {
        if (typeof r === 'string') return [r, ''];
        if (r && r['@']) return [`@${r['@']}`, JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k]) => k !== '@')))];
        if (!r || !r.categoryId) return ['-', ''];
        const rest = Object.fromEntries(Object.entries(r).filter(([k]) => !['categoryId', 'skillId'].includes(k)));
        return [`\`${r.categoryId}:${r.skillId}\``, JSON.stringify(rest)];
    };
    const row = (name, r) => { const [a, b] = show(r); L.push(`| ${name} | ${a} | ${String(b).replace(/\|/g, '/').slice(0, 160)} |`); };
    (p.prereqs || []).forEach((x, i) => row(`P0 question ${i + 1} → ${x.lesson ? `${x.lesson.id} ${x.lesson.title}` : '?'}`, x.ref));
    row('P2-P4 lesson skill', p.lesson);
    ((p.practice && p.practice.sheets) || []).forEach((s, i) => row(`P4 Practice ${i + 1}`, s.skill || p.lesson));
    ((p.mixed && p.mixed.skills) || []).forEach((r, i) => row(`Mixed ${i + 1}`, r));
    ['A', 'B'].forEach((b) => (((p.numberSense || {})[b] || {}).items || []).forEach((r, i) => row(`P1 band ${b} row ${i + 1}`, r)));
    if (p.wordProblem) row('P5 word problem', p.wordProblem.ref);
    ((p.exit && p.exit.items) || []).forEach((e, i) => row(`P6 exit ${i + 1}: ${e.case || ''}`, e.ref));
    (p.retrieval || []).forEach((r, i) => row(`Spaced retrieval ${i + 1}`, r.ref));
    if (p.checkQuestion) row(`Check Question (${p.checkQuestion.want || '?'}, right ${p.checkQuestion.correct || '?'})`, p.checkQuestion.ref || p.lesson);
    L.push('');
    L.push(`Hand-written lines (story, hook, teaching notes, mistakes' words): **${handLines(card)}**.`);
    L.push('');
    L.push('## Open questions');
    L.push('');
    if (!(card.open || []).length) L.push('None.');
    for (const [i, q] of (card.open || []).entries()) L.push(`${i + 1}. ${q.q} **Suggested:** ${q.suggested}${q.answer ? ` **Decided:** ${q.answer}${q.rule ? ` (${q.rule})` : ''}` : ''}`);
    L.push('');
    L.push('## Machine block');
    L.push('');
    L.push('```json lesson-card');
    L.push(pretty(card));
    L.push('```');
    L.push('');
    if (signed) L.push(`Decided: ${signed}`);
    return L.join('\n') + '\n';
}

function writeCard(file, card, opts) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, cardMarkdown(card, opts));
}

const cardFile = (unit, id) => path.join(CARDS_DIR, unit, `${id}.md`);

function cardFiles() {
    const unit = val('--unit');
    const files = args.filter((a) => a.endsWith('.md')).map((a) => path.resolve(ROOT, a));
    if (files.length) return files;
    const dirs = unit ? [path.join(CARDS_DIR, unit)] : (fs.existsSync(CARDS_DIR) ? fs.readdirSync(CARDS_DIR).map((d) => path.join(CARDS_DIR, d)).filter((d) => fs.statSync(d).isDirectory()) : []);
    return dirs.flatMap((d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.md')).sort().map((f) => path.join(d, f)) : []));
}

/* ------------------------------------------------------------------ SHAPES.md */
const ARCH_OF_CODE = Object.fromEntries(Object.entries(SCHEMA.ARCHETYPES).map(([k, v]) => [v.code, k]));

/** The SHAPES.md table: [{lesson, unit, title, archetype, shape, templates}] (parsed from its markdown). */
export function readShapes() {
    if (!fs.existsSync(SHAPES_MD)) return [];
    const rows = [];
    for (const line of fs.readFileSync(SHAPES_MD, 'utf8').split('\n')) {
        const m = line.match(/^\| `([^`]+)` \| ([^|]+) \| (.*) \| (A\d+) \| ([^|]+) \| ([^|]*) \|$/);
        if (m) rows.push({ lesson: m[1].replace(/\\\|/g, '|'), unit: m[2].trim(), title: m[3].trim(), archetype: m[4], shape: m[5].trim().replace(/`/g, ''), templates: m[6].trim() });
    }
    return rows;
}

/** The proposed lesson shape of a queue lesson (a passed shape when it fits, else "new: <archetype>"). */
function proposeShape(l) {
    const t = String(l.title || '').toLowerCase();
    if (l.long) {
        const id = String(l.long).split(':')[0];
        const hit = Object.entries(SHAPES.SHAPES).find(([, s]) => s.exemplar === id);
        if (hit) return { shape: hit[0], archetype: l.shape };
        if (id === 'g4-nbt1-ten-times-value') return { shape: 'forms', archetype: 'A4' };
        if (id === 'g3-oa8-two-step-wp') return { shape: 'bar-story', archetype: 'A13' };
    }
    const a = l.shape;
    if (a === 'A13') return { shape: 'bar-story', archetype: a };
    if (a === 'A4' && /read|write|words|numerals?|expanded|represent|partition|forms?|numbers to/.test(t)) return { shape: 'forms', archetype: a };
    if (/input-output|function|\brule\b|machine/.test(t)) return { shape: 'rule-table', archetype: a };
    if (/commutativ|propert|turn|associativ|distributive|identity/.test(t)) return { shape: 'property', archetype: a };
    if (/pattern|multiplication (table|chart)|hundred square|times-table grid/.test(t) && ['A2', 'A5'].includes(a)) return { shape: 'table-pattern', archetype: a };
    return { shape: `new: ${ARCH_OF_CODE[a] || a}`, archetype: a };
}

function shapesMarkdown(queue, keep) {
    const byKey = new Map(keep.map((r) => [`${r.unit}|${r.lesson}`, r]));
    const rows = [];
    for (const u of queue.units) for (const l of u.lessons) {
        const old = byKey.get(`${u.id}|${l.id}`);
        const p = old ? { shape: old.shape, archetype: old.archetype } : proposeShape(l);
        const s = SHAPES.SHAPES[p.shape];
        // (a lesson of a compiler shape takes the shape's archetype: SHAPES.md decides, the queue's title heuristic proposed)
        if (!old && s) p.archetype = SCHEMA.ARCHETYPES[s.archetype].code;
        const arch = ARCH_OF_CODE[p.archetype];
        const templates = s ? s.templates.join(', ') : (arch && SCHEMA.ARCHETYPES[arch] ? SCHEMA.ARCHETYPES[arch].templates.join(', ') : '');
        rows.push({ lesson: l.id, unit: u.id, title: String(l.title).replace(/\|/g, '/'), archetype: p.archetype, shape: p.shape, templates });
    }
    const count = {};
    for (const r of rows) count[r.shape] = (count[r.shape] || 0) + 1;
    const L = [];
    L.push('# Lesson shapes (E4)');
    L.push('');
    L.push('Every lesson of `design/lessons-first/queue.json` with its archetype (`lessons/schema.js` ARCHETYPES, A1-A13) and its LESSON SHAPE: one of');
    L.push('the shapes the compiler knows (`js/modules/lessons/shapes/index.js`), or `new: <archetype>` (no compiled lesson of that kind');
    L.push('yet; its first two lessons certify a new shape, IMPROVEMENT_PLAN §1.6.5 Lessons item 6). The queue script reads the Archetype');
    L.push('column (`tests/scripts/ws-lessons-first-queue.cjs` shapeOf); a lesson card reads the Shape column (`ws-lesson-card --draft`).');
    L.push('');
    L.push('Kept by `node tests/scripts/ws-lesson-card.mjs --shapes`: a row already here is kept as it is (decide a lesson\'s shape by editing');
    L.push('its row), a new queue lesson is added with the proposal. `--shapes --check` fails when a queue lesson has no row.');
    L.push('');
    L.push('## The shapes');
    L.push('');
    L.push('| Shape | What it teaches | Archetype | Certified by | Templates it needs | Lessons |');
    L.push('|---|---|---|---|---|--:|');
    for (const [id, s] of Object.entries(SHAPES.SHAPES)) L.push(`| \`${id}\` | ${s.name} | ${SCHEMA.ARCHETYPES[s.archetype].code} ${s.archetype} | ${s.exemplar} | ${s.templates.join(', ')} | ${count[id] || 0} |`);
    for (const [id, n] of Object.entries(count).filter(([k]) => !SHAPES.SHAPES[k]).sort()) {
        const a = id.replace(/^new: /, '');
        L.push(`| ${id} | (new shape) | ${SCHEMA.ARCHETYPES[a] ? SCHEMA.ARCHETYPES[a].code : '?'} ${a} | - | ${SCHEMA.ARCHETYPES[a] ? SCHEMA.ARCHETYPES[a].templates.join(', ') : ''} | ${n} |`);
    }
    L.push('');
    L.push('Lessons 6 (g4-nbt1-ten-times-value) and 7 (g3-oa8-two-step-wp) are the compiler\'s hold-outs: they take the nearest passed shape');
    L.push('(`forms`, `bar-story`) and `design/lessons/proof/DIFF.md` records what compiled.');
    L.push('');
    // (lf-engine P1d, 2026-11-07: what the next lesson of a shape checks first - kept here so --shapes keeps it)
    L.push('## What the next lesson of a shape checks first (lf-engine P1d, 2026-11-07)');
    L.push('');
    L.push('- `bar-story` (from lesson 2, E24b): before the card is signed, count the distinct facts the story rule holds against every place');
    L.push('  that deals one - Prerequisite Check facts included - with LR-6 (no near twins on a page) per page: `ws-lesson-unit --only');
    L.push('  pool-capacity`, then the 25-seed `ws-detailed-lesson --sweep`. A pack that needs every fact of its pool fails at some seed.');
    L.push('  If a set exists but the greedy deal misses it, give the Practice sheet `solve` (its stories solved first, the generator pinned');
    L.push('  to them - print-sheet.js solveStoryFacts, page-deal.js setDealPin): `ws-lesson-unit --only solve-story` (lesson 2, attempt 2).');
    L.push('  A pack that needs nearly every fact of its pool (lesson 2: ~18 of 20) is not fixed by solving one page first - the shortage');
    L.push('  moves to the next page (lesson 2 solve-first, 2026-11-08): count the WHOLE pack in node per seed, then solve it jointly or widen the data.');
    L.push('  The whole-pack count models each place from its OWN source (lesson 2 attempt 4: green while seeds 2 and 5 failed): a P0 range');
    L.push('  must survive any greedy first choice (two items need values 3 apart: 17-20 does not), and a narrow chart case (equal parts) gets');
    L.push('  its own case pool with the pack\'s avoid keys - `ws-lesson-unit --only pack-feasible` (pack-solve.js placeSources).');
    L.push('  CHECK FIRST (owner ruling 2026-11-08): a Prerequisite Check never draws from the lesson\'s own story pool (lesson 2: its +');
    L.push('  facts are a teen and ones, 12 + 5); count every place that does - chart, Guided, Practice, word problem, slip, Check');
    L.push('  Question - per seed with lessons/pack-solve.js (`ws-lesson-unit --only pack-feasible`) BEFORE any render, and take Practice\'s');
    L.push('  set from that whole-pack solution.');
    L.push('  A P0 question whose answers can meet another\'s on the page (lesson 2: count 11-20, + facts 13-19) is legal only while the');
    L.push('  engine deals the page against ONE answer set (print-sheet.js pageLr6 on a perQuestion pre-skill-check) and the ranges hold');
    L.push('  every item: `ws-lesson-unit --only p0-overlap` (lf-engine 2026-11-09: the lane lacked master\'s set; twins at 5 of 6 seeds).');
    L.push('- `property` (from lesson 3a, LP-FAMILY-REPEAT): size the Practice cell from the families the pack needs (owner ruling: full-width');
    L.push('  cells, one item a row, arrays up to 6 x 6), never the families from the cell; every dealt ref keeps one spare fact family');
    L.push('  (the x 2 check: 2 x 6 to 2 x 10 for four items). Note: arrays past 5 a row fail gate E27 (rows of at most 5) until lf-checks reads the ruling.');
    L.push('');
    L.push('## Every lesson');
    L.push('');
    L.push('| Lesson | Unit | Title | Archetype | Shape | Templates |');
    L.push('|---|---|---|---|---|---|');
    for (const r of rows) L.push(`| \`${r.lesson.replace(/\|/g, '\\|')}\` | ${r.unit} | ${r.title} | ${r.archetype} | ${SHAPES.SHAPES[r.shape] ? `\`${r.shape}\`` : r.shape} | ${r.templates} |`);
    return L.join('\n') + '\n';
}

/* ------------------------------------------------------------------ checks */
const skillExists = (key) => { const [c, s] = String(key).split(':'); return !!(data.SKILLS[c] && data.SKILLS[c].some((x) => x && x.v === s)); };
const caseNames = Object.values(LR.CASE_FAMILIES).flatMap((f) => Object.keys(f));
const WRM_IDS = new Set();
for (const y of Object.values(readJson('data/curriculum/wrm-steps.json').years || {})) for (const b of y.blocks || []) for (const s of b.steps || []) WRM_IDS.add(s.id);
const SITE_IDS = new Set(readJson('data/curriculum/site-lessons.json').lessons.map((l) => l.id));
const CCSS_IDS = new Set();
for (const s of readJson('data/standards/ccss-math.json').standards) { CCSS_IDS.add(s.code); CCSS_IDS.add(s.short); for (const x of s.subs || []) CCSS_IDS.add(typeof x === 'string' ? x : x.code); }

/** Problems of one ref's options against its skill's schema (skill-options.js). */
function optionProblems(ref) {
    const bad = [];
    const defs = OPT.optionsFor(ref.categoryId, ref.skillId) || [];
    const byId = Object.fromEntries(defs.map((d) => [d.id || d.key, d]));
    const valuesOf = (d) => (d.values || d.choices || []).map((v) => (v && v.v !== undefined ? v.v : v && v.value !== undefined ? v.value : v));
    for (const [k, v] of Object.entries(ref.opts || {})) {
        const d = byId[k];
        if (!d) { bad.push(`option "${k}" is not in ${ref.categoryId}:${ref.skillId}'s schema`); continue; }
        const vals = valuesOf(d).map(String);
        const inVals = (x) => !vals.length || vals.includes(String(x));
        if (d.type === 'enum' && !inVals(v)) bad.push(`option ${k}=${JSON.stringify(v)} is not one of ${vals.join(', ')}`);
        if (d.type === 'set' && (!Array.isArray(v) || !v.every(inVals))) bad.push(`option ${k}=${JSON.stringify(v)} is not a subset of ${vals.join(', ')}`);
        if (d.type === 'bool' && typeof v !== 'boolean') bad.push(`option ${k}=${JSON.stringify(v)} is not true / false`);
        if (d.type === 'int' && (!Number.isFinite(Number(v)) || (d.min !== undefined && v < d.min) || (d.max !== undefined && v > d.max))) bad.push(`option ${k}=${v} is outside ${d.min}..${d.max}`);
        if (d.type === 'rows' && !Array.isArray(v)) bad.push(`option ${k} is not a list of rows`);
    }
    // a range the options can reach: the floor no higher than the ceiling, and no higher than the skill's band
    const band = Number((ref.opts || {}).band);
    if (ref.minNum !== undefined && ref.maxNum !== undefined && ref.minNum > ref.maxNum) bad.push(`range ${ref.minNum}..${ref.maxNum} is empty`);
    if (Number.isFinite(band) && band > 0 && ref.minNum !== undefined && ref.minNum > band) bad.push(`range floor ${ref.minNum} is above the band ${band}`);
    return bad;
}

/** A CCSS code written with spaces and a grade prefix ("K CC 5", "G1 OA 6") as its short code ("K.CC.5", "1.OA.6"). */
const shortCcss = (id) => String(id || '').replace(/^G?([K1-8]) ([A-Z]+) (\d+[a-z]?)$/, '$1.$2.$3');
const lessonIdReal = (id) => {
    const s = shortCcss(id);
    if (/^needs:/.test(s)) return true;
    const wrm = s.replace(/^(R|Y[1-6])[ .]B(\d+)[ .]S(\d+)$/, '$1.B$2.S$3');
    return WRM_IDS.has(wrm) || SITE_IDS.has(s) || CCSS_IDS.has(s);
};

/** The placeholders of a compiled description that no reader can fill: ["section 5: {chart.foo}"]. */
function placeholderProblems(d) {
    const keys = new Set(d.compiled.placeholderKeys);
    const ENGINE = new Set(['p0', 'p4', 'cq', 'indepList', 'panel', 'b', 'a']);
    const bad = [];
    const scan = (text, where) => {
        for (const m of String(text || '').matchAll(/\{([a-zA-Z0-9_.]+)\}/g)) {
            const parts = m[1].split('.');
            const chunk = (d.chunks || []).some((c) => c.id === parts[0]) && parts[0] !== 'a' ? parts.shift() : null;
            const head = parts[0];
            if (['chart', 'chart2', 'chart3', 'wp', 'say', 'cq'].includes(head)) {
                const k = parts[1];
                if (head === 'cq' && (/^[A-D]$/.test(k) || ['n', 'right', 'why', 'wrong'].includes(k))) continue;
                if (k && !keys.has(k) && k !== 'eq' && k !== 'wrong' && k !== 'both' && k !== 'ask') bad.push(`${where}: {${m[1]}} (no reader names "${k}")`);
            } else if (['we', 'pre', 'exit', 'ret', 'ns'].includes(head)) {
                const k = head === 'ns' ? parts[3] : parts[2];
                if (k && !keys.has(k) && !['letters', 'list', 'ask', 'wrong'].includes(k)) bad.push(`${where}: {${m[1]}} (no reader names "${k}")`);
            } else if (!ENGINE.has(head) && !chunk) bad.push(`${where}: {${m[1]}} (unknown placeholder kind)`);
        }
    };
    for (const s of d.sections) { for (const r of s.rows) for (const k of ['do', 'say', 'ask', 'note']) scan(r[k], `section ${s.n}`); for (const b of s.boxes || []) scan(b.text, `section ${s.n} box`); }
    for (const m of d.mistakes) scan(m.looks, `mistake "${m.name}"`);
    for (const w of d.wrongAnswers) scan(w.wrote, 'T6 wrong answer');
    for (const a of d.accepted) scan(a, 'T6 accepted');
    for (const a of d.atoms) scan(a.notes, 'T2 atom');
    if (d.board) scan(d.board, 'T2 board');
    if (d.wordProblem) for (const l of d.wordProblem.lines || []) scan(l, 'P5 story');
    return bad;
}

/** "no X" in a script line over a page that prints X (lesson 7 D3): the labels each page prints, from the card. */
function scriptPageProblems(card, d) {
    const parts = card.parts || {};
    const labels = { P5: [], P4: [], P3: [] };
    const wp = parts.wordProblem || {};
    if (wp.eqSteps || (wp.ref && /multi_step|two_step/.test(String(wp.ref.skillId || wp.ref['@'] || '')))) labels.P5.push('step boxes', 'step box', 'steps', 'step');
    if (wp.panelRows) labels.P5.push('steps');
    const bad = [];
    for (const s of d.sections) for (const r of s.rows) for (const k of ['say', 'do', 'ask']) {
        const m = String(r[k] || '').match(/\bno ([a-z]+(?: [a-z]+)?)/i);
        if (!m || !labels[s.page]) continue;
        const said = m[1].toLowerCase();
        if (labels[s.page].some((x) => said === x || said.startsWith(`${x} `))) bad.push(`section ${s.n}: "${r[k]}" - but ${s.page} prints ${said}`);
    }
    return bad;
}

/** Every problem of one card ([] when it resolves). */
export function checkCard(card, { file = '' } = {}) {
    const bad = [];
    // a card's `needs` (what it waits for from another lane: a schema entry, a provider id) turns the matching
    // problem into a NEEDS line, printed but not failed (lessons/schema.js NEED_KINDS; the lead merges them)
    const needs = (card.needs || []).map((n) => String(n.match || ''));
    const e = (m) => { const hit = needs.find((x) => x && m.includes(x)); bad.push(hit ? `NEEDS ${m}` : `${file || card.id}: ${m}`); };
    if (card.format !== COMPILE.CARD_FORMAT) e(`format is not ${COMPILE.CARD_FORMAT}`);
    for (const k of ['id', 'lesson', 'unit', 'title', 'grade', 'shape', 'parts']) if (card[k] === undefined || card[k] === '') e(`no ${k}`);
    const shapeRows = readShapes();
    const shapeIds = new Set(shapeRows.map((r) => r.shape));
    if (!SHAPES.SHAPES[card.shape]) e(`shape "${card.shape}" is not a compiler shape (shapes/index.js)`);
    else if (shapeRows.length && !shapeIds.has(card.shape)) e(`shape "${card.shape}" is not in SHAPES.md`);
    const row = shapeRows.find((r) => r.lesson === card.lesson && r.unit === card.unit);
    if (shapeRows.length && !row) e(`lesson ${card.lesson} of ${card.unit} has no SHAPES.md row`);
    else if (row && row.shape !== card.shape) e(`SHAPES.md gives ${card.lesson} the shape "${row.shape}", the card "${card.shape}"`);
    let resolved;
    try { resolved = COMPILE.resolveRefs(card.parts || {}, card.refs || {}); } catch (x) { e(x.message); return bad; }
    const refs = COMPILE.refsOf({ parts: resolved });
    const usedSkills = new Set();
    for (const { at, ref } of refs) {
        const key = `${ref.categoryId}:${ref.skillId}`;
        usedSkills.add(key);
        if (!skillExists(key)) { e(`${at}: ${key} is not a live skill`); continue; }
        for (const p of optionProblems(ref)) e(`${at}: ${key}: ${p}`);
    }
    for (const [i, p] of (resolved.prereqs || []).entries()) if (!p.lesson || !lessonIdReal(p.lesson.id)) e(`P0 question ${i + 1}: prerequisite lesson "${p.lesson && p.lesson.id}" is not a WRM step, site lesson or CCSS code (or needs: entry)`);
    const provIds = new Set();
    for (const k of usedSkills) { const [c, s] = k.split(':'); let p = null; try { p = CONTRACT.getProvider(c, s); } catch (x) { p = null; } for (const id of (p && p.misconceptions) || []) provIds.add(id); }
    for (const m of card.misconceptions || []) if (m.id && !provIds.has(m.id)) e(`misconception "${m.id}" is not a provider id of the skills the card uses`);
    for (const q of card.open || []) if (!q.q || !q.suggested) e('an open question needs its question and a suggested answer');
    if (bad.some((b) => !b.startsWith('NEEDS '))) return bad;
    let out;
    try { out = COMPILE.compileLesson(card); } catch (x) { e(`does not compile: ${x.message}`); return bad; }
    const known = { stepIcons: ICONS.ICON_IDS, caseNames, skillExists };
    for (const [id, r] of Object.entries(out.library.routines)) for (const p of SCHEMA.validateRoutine(id, r, known)) e(`library: ${p}`);
    for (const [id, l] of Object.entries(out.library.lessons)) for (const p of SCHEMA.validateLesson(id, l, Object.assign({ routines: out.library.routines }, known))) e(`library: ${p}`);
    for (const p of DET.validateDescription(out.detailed)) e(`detailed: ${p}`);
    for (const p of placeholderProblems(out.detailed)) e(`detailed: placeholder ${p}`);
    for (const p of scriptPageProblems(card, out.detailed)) e(`detailed: script vs page ${p}`);
    return bad;
}

/* ------------------------------------------------------------------ --from-detailed (seed a card from a passed lesson) */
const SEED_FNS = {
    'g3-oa5-mult-properties': { cqShow: 'turnedFact' },
    'g3-oa9-input-output-rule': { cqShow: 'ruleAsWritten', chartSay: 'ruleInOut', answerShow: 'ruleAsWritten' },
    'g3-oa9-mult-table-patterns': { lastName: 'chartTraps' },
    'g4-nbt1-ten-times-value': { cqShow: 'dropParen', lastName: 'pvPair', answerShow: 'commas' },
};
const WEDO_KEYS = /^(guided|guidedWants|guidedRows|guidedStack|independent|practiceShape|growAll|tailLast|tailRead)$/;
const KNOWN_TOP = new Set(['id', 'title', 'packTitle', 'grade', 'level', 'strand', 'ccss', 'ee', 'eeAccess', 'eeNote', 'eeOwnerList', 'cra', 'flowNote', 'followOn',
    'situations', 'fade', 'chunks', 'skill', 'pool', 'boardOnly', 'edgeTest', 'edgeOnlyLast', 'practicePages', 'practiceSheets', 'mixed', 'vars', 'lastName', 'answerShow',
    'lessonData', 'prerequisites', 'numberSense', 'wordProblem', 'exit', 'exitCols', 'fadeMeans', 'exitInstruction', 'exitSayItem', 'exitSay', 'exitSayAns', 'retrieval',
    't1Boxes', 'caseNames', 'slotRows', 'routeNote', 'materials', 'vocabulary', 'atoms', 'routine', 'howToTeach', 'board', 'mistakes', 'checkQuestion', 'sections',
    'transitionsMin', 'p3Score', 'accepted', 'wrongAnswers']);
const plain = (v) => JSON.parse(JSON.stringify(v, (k, x) => (typeof x === 'function' ? undefined : x)));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Name the skill refs a card repeats (used 2+ times) as R1, R2 ... so each is written once. */
function nameRefs(parts) {
    const count = new Map();
    const walk = (v) => {
        if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === 'object') {
            if (typeof v.categoryId === 'string' && typeof v.skillId === 'string') { const j = JSON.stringify(v); count.set(j, (count.get(j) || 0) + 1); }
            for (const [k, x] of Object.entries(v)) if (k !== 'opts') walk(x);
        }
    };
    walk(parts);
    const names = new Map();
    const refs = {};
    for (const [j, n] of count) if (n >= 2 && j.length > 60) { const name = `R${names.size + 1}`; names.set(j, name); refs[name] = JSON.parse(j); }
    const swap = (v) => {
        if (Array.isArray(v)) return v.map(swap);
        if (v && typeof v === 'object') {
            if (typeof v.categoryId === 'string' && names.has(JSON.stringify(v))) return `@${names.get(JSON.stringify(v))}`;
            return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'opts' ? x : swap(x)]));
        }
        return v;
    };
    return { refs, parts: swap(parts) };
}

function seedFromDetailed(id, unit, shapeArg) {
    const d = DET.detailedLessonFor(id);
    if (!d) throw new Error(`no detailed lesson ${id}`);
    const dj = plain(d);
    const meta = (readJson('data/curriculum/detailed-lessons.json').lessons || []).find((l) => l.id === id) || {};
    const lessonId = meta.siteLessonId || id;
    const row = readShapes().find((r) => r.lesson === lessonId && r.unit === unit);
    const shape = shapeArg || (row && row.shape) || '';
    if (!SHAPES.SHAPES[shape]) throw new Error(`${id}: SHAPES.md gives no compiler shape (${shape || 'none'}); pass --shape`);
    const open = [];
    const sec = Object.fromEntries((dj.sections || []).map((s) => [String(s.n), s]));
    // P0: one question per atom
    const atoms = dj.atoms || [];
    const preAtomIdx = new Set();
    const prereqs = (dj.prerequisites || []).map((p, i) => {
        const a = atoms[p.atom - 1] || {};
        preAtomIdx.add(p.atom - 1);
        const atom = { n: p.atom, type: a.type, skill: a.skill };
        if (a.notes !== `Prerequisite Check {pre.${i}.letters}.`) atom.notes = a.notes;
        return Object.assign({ ref: p.ref }, p.items !== undefined ? { items: p.items } : {}, { lesson: p.lesson, atom });
    });
    const teachAtoms = atoms.map((a, i) => (preAtomIdx.has(i) ? null : Object.assign({ n: i + 1 }, a))).filter(Boolean);
    // chart and We Do
    const ld = Object.assign({}, dj.lessonData || {});
    delete ld.skills;
    if (!(ld.mixWith || []).length) delete ld.mixWith;
    const chart = {}, weDo = {};
    for (const [k, v] of Object.entries(ld)) (WEDO_KEYS.test(k) ? weDo : chart)[k] = v;
    // LR-3 for the short lesson: two steps with one icon
    const icons = (chart.steps || []).map((s) => s.icon);
    if (new Set(icons).size !== icons.length) {
        const free = ICONS.ICON_IDS.filter((x) => !icons.includes(x) && !['regroup', 'subtract', 'subOnes', 'subTens', 'ends'].includes(x));
        const seen = new Set();
        const fixed = icons.map((x) => { if (!seen.has(x)) { seen.add(x); return x; } const f = free.shift() || x; seen.add(f); return f; });
        chart.shortIcons = fixed;
        open.push({ id: 'lr3-icons', q: `LR-3 (short lesson): the chart's Steps share an icon (${icons.join(', ')}). The long pack keeps them; the short lesson needs one icon a step. Which icons?`,
            suggested: `${fixed.join(', ')} (a repeated icon swapped for an unused drawn one; parts.chart.shortIcons)`,
            answer: `${fixed.join(', ')} on the short lesson; the long pack keeps its own chart.`, rule: 'LESSON_RULES LR-3: one distinct drawn icon per step (sheet/lesson-icons.js ICON_IDS)' });
    }
    // practice, ranges, edge cases
    const practice = { pages: dj.practicePages };
    for (const [k, to] of [['practiceSheets', 'sheets'], ['edgeTest', 'edgeTest'], ['edgeOnlyLast', 'edgeOnlyLast'], ['fade', 'fade'], ['fadeMeans', 'fadeMeans']]) if (dj[k] !== undefined) practice[to] = dj[k];
    const ranges = {};
    if (dj.pool) ranges.pool = dj.pool;
    if (dj.boardOnly) ranges.boardOnly = dj.boardOnly;
    const ls = dj.skill || {};
    ranges.lesson = Object.fromEntries(['minNum', 'maxNum', 'range'].filter((k) => ls[k] !== undefined).map((k) => [k, ls[k]]).concat(ls.opts && ls.opts.band !== undefined ? [['band', ls.opts.band]] : []));
    const rulings = [];
    if (dj.boardOnly) rulings.push({ id: 'board-only', text: `${dj.boardOnly.join(', ')} on the board only: never a pupil item, never on a key.`, field: 'ranges.boardOnly' });
    // retrieval with its expected answer (section 3)
    const retrieval = (dj.retrieval || []).map((r, i) => {
        const row3 = ((sec['3'] || {}).rows || []).find((x) => x.ask === `{ret.${i}.ask}`);
        const m = row3 && String(row3.note || '').match(/^Expected: \[\[(.+)\]\]\.$/);
        return m && m[1] !== `{ret.${i}.ans}` ? Object.assign({}, r, { expect: m[1] }) : r;
    });
    // exit, word problem, check question
    const exit = { items: dj.exit || [] };
    const ten = ((sec['10'] || {}).rows || [])[1];
    // what the plenary note shows of each item: "1. [[{exit.0.ans}]] · 2. ..." (a name, or a whole template)
    const shown = ten ? String(ten.note || '').replace(/\.$/, '').split(' · ').map((x) => x.replace(/^\d+\. /, '')) : [];
    shown.forEach((t, k) => {
        if (!exit.items[k] || t === `[[{exit.${k}.ans}]]`) return;
        const one = t.match(new RegExp(`^\\[\\[\\{exit\\.${k}\\.([a-zA-Z0-9]+)\\}\\]\\]$`));
        exit.items[k] = Object.assign({}, exit.items[k], { show: one ? one[1] : t });
    });
    for (const [k, to] of [['exitInstruction', 'instruction'], ['exitSay', 'say'], ['exitSayItem', 'sayItem'], ['exitSayAns', 'sayAns'], ['exitCols', 'cols']]) if (dj[k] !== undefined) exit[to] = dj[k];
    const wp = dj.wordProblem ? Object.assign({}, dj.wordProblem) : null;
    const story = {};
    if (wp) for (const k of ['instruction', 'lines', 'answerLine', 'say', 'sayAns']) if (wp[k] !== undefined) { story[k] = wp[k]; delete wp[k]; }
    const cq = Object.assign({}, dj.checkQuestion || {});
    const s7 = (sec['7'] || {}).rows || [];
    if (s7[0] && s7[0].do && !/^Write (two|three|four) answers/.test(s7[0].do)) cq.board = s7[0].do.replace(/ A: \{cq\.A\}.*$/, '');
    // misconceptions (+ T6 rows they generate)
    const mis = (dj.mistakes || []).map((m) => {
        const o = { id: m.misconception || null, name: m.name, step: m.step };
        if (m.option) o.option = m.option;
        if (m.looks !== (m.option ? `{cq.${m.option}}` : '')) o.looks = m.looks;
        o.fix = m.fix;
        if (m.caught) o.caught = m.caught;
        return o;
    });
    const wrongExtra = [];
    for (const w of dj.wrongAnswers || []) {
        const m = String(w.wrote).match(/^\{exit\.(\d+)\.wrong\.([A-Za-z0-9]+)\} \(([^)]+)\)$/);
        const hit = m && mis.find((x) => x.id && x.id.replace(/[^A-Za-z0-9]/g, '') === m[2] && x.name === w.mistake);
        if (hit) { (hit.exits = hit.exits || []).push(Object.assign({ k: Number(m[1]), label: m[3] }, w.next !== hit.fix ? { next: w.next } : {})); } else wrongExtra.push(w);
    }
    // the teaching notes: the sections' own rows (I Do / We Do whole; the shared sections only what is the lesson's own)
    const sections = {};
    for (const s of dj.sections || []) {
        const n = String(s.n);
        const o = {};
        if (/^[56]/.test(n)) {
            o.rows = s.rows.slice();
            const chant = (n === '6b' ? ((dj.chunks || [])[1] || {}).lessonData || {} : chart).chant;
            if (n.startsWith('6') && chant) {
                const last = o.rows[o.rows.length - 1];
                if (same(last, { say: chant, note: 'The chant. Say it twice together.' })) o.rows.pop(); else o.chant = false;
            } if (s.boxes) o.boxes = s.boxes; if (s.name !== ({ 5: 'I Do: the anchor chart', 6: 'We Do: Guided Practice', '6a': 'We Do 1: Guided Practice', '6b': 'We Do 2: Guided Practice' })[n]) o.name = s.name; }
        else {
            // a shared section: its first rows are the compiler's (one slot each, compile.js sharedRows); the lesson's
            // own rows past them are kept, in order (`add`)
            const slots = { 1: 3, 2: 3, 3: 1 + (dj.retrieval || []).length, 7: 3, 8: 1, 9: 1, 10: 2 }[n] || 0;
            const extra = s.rows.slice(n === '7' ? Math.max(slots, s.rows.length >= 3 ? 3 : s.rows.length) : slots);
            if (extra.length) o.add = extra;
            if (n === '10') { const r0 = s.rows[0]; if (r0 && r0.say) o.say = r0.say; }
            const dflt = { 1: [{ kind: 'tip', title: 'Route before teaching', text: 'Mark it while pupils do the Number sense page.' }], 8: [{ kind: 'watch', title: 'The last rows', text: 'Walk to the last rows first: {p4.last}.' }] }[n];
            if (!same(s.boxes, dflt)) o.boxes = s.boxes || [];
        }
        if (Object.keys(o).length) sections[n] = o;
    }
    const routine = (dj.routine || []).map((r, i) => {
        const allSteps = (chart.steps || []).concat(((dj.chunks || [])[1] && dj.chunks[1].lessonData && dj.chunks[1].lessonData.steps) || []);
        const o = {};
        if (!allSteps[i] || allSteps[i].text !== r.step) o.step = r.step;
        o.tag = r.tag; o.check = r.check;
        if (r.critical) o.critical = true;
        return o;
    });
    const teach = {};
    for (const k of ['situations', 't1Boxes', 'howToTeach', 'board', 'slotRows', 'p3Score']) if (dj[k] !== undefined) teach[k] = dj[k];
    if (dj.materials) teach.materials = dj.materials.filter((m) => !COMPILE.SHARED_MATERIALS.includes(m));
    if (dj.routeNote !== undefined && dj.routeNote !== COMPILE.CCSS_ROUTE_NOTE) teach.routeNote = dj.routeNote;
    teach.atoms = teachAtoms;
    teach.routine = routine;
    teach.sections = sections;
    if ((sec['7'] || {}).loop) { teach.loop = Object.assign({}, sec['7'].loop); if (teach.loop.most === COMPILE.LOOP_MOST) delete teach.loop.most; }
    teach.accepted = dj.accepted || [];
    if (wrongExtra.length) teach.wrongAnswers = wrongExtra;
    const timing = Object.fromEntries((dj.sections || []).map((s) => [String(s.n), s.min]).concat([['transitions', dj.transitionsMin || 0]]));
    const flags = {};
    for (const [k, v] of Object.entries(dj)) if (!KNOWN_TOP.has(k)) flags[k] = v;
    const partsRaw = { lesson: dj.skill, prereqs, chart, weDo, practice, mixed: dj.mixed || null, numberSense: dj.numberSense, wordProblem: wp, exit, retrieval, checkQuestion: cq };
    if (dj.chunks) partsRaw.chunks = dj.chunks;
    if (Object.keys(flags).length) partsRaw.flags = flags;
    const { refs, parts } = nameRefs(partsRaw);
    const card = {
        format: COMPILE.CARD_FORMAT, id, lesson: lessonId, unit, title: dj.title, grade: dj.grade, level: dj.level, strand: dj.strand,
        ccss: dj.ccss, ee: dj.ee,
    };
    for (const k of ['packTitle', 'eeAccess', 'eeNote', 'eeOwnerList']) if (dj[k] !== undefined) card[k] = dj[k];
    if (dj.followOn) card.followOn = dj.followOn;
    Object.assign(card, { cra: dj.cra, flowNote: dj.flowNote, shape, fns: SEED_FNS[id] || {}, refs, parts, timing, ranges,
        edgeCases: { edgeTest: dj.edgeTest || null, caseNames: dj.caseNames || {} }, rulings, misconceptions: mis, vocabulary: dj.vocabulary || [],
        story, hook: ((sec['4'] || {}).rows || []).map((r) => (Object.keys(r).length === 1 && r.say ? r.say : r)), teach, open });
    return card;
}

/* ------------------------------------------------------------------ --draft (a new lesson from data) */
const ICON_BY_VERB = [[/^(look|read|find|point)/i, 'look'], [/^(write|fill)/i, 'write'], [/^(check|test)/i, 'check'], [/^(count|skip)/i, 'count'], [/^(say)/i, 'say'],
    [/^(start|begin)/i, 'start'], [/^(turn)/i, 'turn'], [/^(circle|decide|choose|bigger|is )/i, 'decide']];

function draftCard(unit, l, queue) {
    const year = unit.year;
    const links = readJson(`data/curriculum/links/${year}.json`);
    const rec = (links.steps && links.steps[l.id]) || (links.lessons && links.lessons[l.id]) || {};
    const shapeRow = readShapes().find((r) => r.lesson === l.id && r.unit === unit.id);
    // (a lesson of a new shape keeps it: the card does not compile until the shape is built and certified - its first
    // two lessons get a full critic, IMPROVEMENT_PLAN §1.6.5 Lessons item 6)
    const shape = shapeRow ? shapeRow.shape : 'new: ?';
    const open = [];
    if (!SHAPES.SHAPES[shape]) open.push({ q: `SHAPES.md gives "${shape}": no compiler shape yet (shapes/index.js).`, suggested: 'build the shape module (its readers and minutes) from this unit\'s first lesson of the kind, then certify it on two lessons' });
    const main = (rec.direct || [])[0] || (rec.partial || [])[0] || (() => { const k = String(l.skills[0] || '').replace(/ \[8\/10\]$/, ''); const s = unit.skills.find((x) => x.key === k); return s ? { key: k, opts: s.opts } : { key: k }; })();
    if (!main.key) open.push({ q: `No live skill teaches ${l.id} (${(l.build || []).join(', ') || 'no build entry'}).`, suggested: 'wait for the build entry; the card is drafted from it when its skill lands' });
    const [c, s] = String(main.key || ':').split(':');
    const ref = Object.assign({ categoryId: c, skillId: s }, main.opts ? { opts: main.opts } : {});
    let prov = null;
    try { prov = CONTRACT.getProvider(c, s); } catch (x) { prov = null; }
    const str = prov && prov.strings ? prov.strings({ categoryId: c, skillId: s, opts: main.opts || {} }) : {};
    const used = new Set();
    const steps = (str.steps || ['Read it.', 'Do it.', 'Check it.']).slice(0, 5).map((text) => {
        let icon = (ICON_BY_VERB.find(([re]) => re.test(text)) || [])[1] || 'decide';
        if (used.has(icon)) icon = ICONS.ICON_IDS.find((x) => !used.has(x) && !['regroup', 'subtract', 'subOnes', 'subTens', 'ends'].includes(x)) || icon;
        used.add(icon);
        return { icon, text };
    });
    // the Prerequisite Check from the links `pre` list, most basic first, one question per prerequisite lesson
    const seen = new Set();
    const prereqs = [];
    for (const p of rec.pre || []) {
        const m = String(p.why || '').match(/^((?:R|Y[1-6])\.B\d+\.S\d+) ([^(]+?)\s*\(/);
        const lid = m ? m[1] : null;
        if (!lid || seen.has(lid) || prereqs.length >= 4) continue;
        seen.add(lid);
        const [pc, ps] = String(p.key).split(':');
        prereqs.push({ ref: Object.assign({ categoryId: pc, skillId: ps }, p.opts ? { opts: p.opts } : {}), items: 2, lesson: { id: lid, title: m[2].trim() }, atom: { n: prereqs.length + 1, type: 'Fact', skill: m[2].trim() } });
    }
    prereqs.reverse().forEach((p, i) => { p.atom.n = i + 1; });
    if (prereqs.length < 3) open.push({ q: `The links list ${prereqs.length} prerequisite lesson(s) for ${l.id}; the Prerequisite Check needs 3-4.`, suggested: 'add the nearest earlier step of the same strand to the links `pre` list (data/curriculum/links), then redraft' });
    // vocabulary from wrm-vocab (Guide D's pre-teach words)
    let vocab = [];
    try { const V = readJson('data/curriculum/wrm-vocab.json'); const st = (V.steps || {})[l.id] || {}; vocab = (st.words || []).slice(0, 3).map((w) => ({ word: w, gloss: (st.glossary || {})[w] || 'TODO', diagram: { kind: 'text', text: w } })); } catch (x) { vocab = []; }
    if (!vocab.length) open.push({ q: 'No White Rose vocabulary for this lesson (wrm-vocab.json). Which 1-3 words?', suggested: 'the words of the provider\'s Steps the pupils say' });
    const mis = ((prov && prov.misconceptions) || []).slice(0, 3).map((id, i) => ({ id, name: id.replace(/-/g, ' ').replace(/^./, (x) => x.toUpperCase()), step: Math.min(i + 2, steps.length), option: ['A', 'B', 'C'][i], fix: 'TODO' }));
    const retrieval = (rec.pre || []).slice(0, 3).map((p) => { const [pc, ps] = String(p.key).split(':'); return { ref: Object.assign({ categoryId: pc, skillId: ps }, p.opts ? { opts: p.opts } : {}), ask: '' }; }).map((r, i) => Object.assign(r, { ask: `{ret.${i}.text}` }));
    const ns = (lo, hi) => [['more_less_10', { step: 10, dir: 'more', band: 100 }], ['more_less_10', { step: 10, dir: 'less', band: 100 }], ['compare', { band: 99, closeness: 'far' }], ['unit_form', { band: 99 }], ['more_less_10', { step: 1, dir: 'more', band: 100 }]]
        .map(([sk, o]) => ({ categoryId: 'placevalue', skillId: sk, opts: o, minNum: lo, maxNum: hi }));
    const id = `g${String(unit.grade).toLowerCase()}-${String((l.ccss || [])[0] || 'x').split('.').slice(1).join('').toLowerCase().replace(/[^a-z0-9]/g, '')}-${String(l.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 5).join('-')}`;
    const todo = (what, suggested) => { open.push({ q: `${what} (hand-written)`, suggested }); };
    todo('The hook: the Chaining bridge, 2 lines (what they did last time, what is new today).', `"Last time: ${prereqs.length ? prereqs[prereqs.length - 1].lesson.title.toLowerCase() : 'the step before'}." / "Today: ${String(l.title).toLowerCase()}."`);
    todo('The story: the P5 word problem in our own words, its numbers from a dealt item ({wp.*}).', 'a one-line situation with the lesson skill\'s numbers, the question last');
    todo('The teaching notes: the I Do and We Do rows (section 5 / 6), the three T1 boxes, the materials, the fix of each mistake.', 'one row per chart Step, then the Say frame; T1: tip, language, watch');
    todo('The worked example and the ★★★ edge cases: which case tests (roles/lesson.js CASE_TESTS) the chart, the Guided cells and the last rows use.', 'the chart a plain case, Guided plain then the Critical Atom case, the last row the edge cases of the skill\'s options');
    return {
        format: COMPILE.CARD_FORMAT, id, lesson: l.id, unit: unit.id, title: str.iCan || `I Can ${String(l.title).toLowerCase()}`, grade: String(unit.grade), level: Number(unit.grade) || 0,
        strand: 'TODO', ccss: l.ccss || [], ee: (rec.site && rec.site.ee) || [], cra: 'Pictorial → Abstract', flowNote: 'One chunk.', shape, fns: {}, refs: {},
        parts: {
            lesson: ref, prereqs,
            chart: { concepts: [], vocab: [], steps, chant: '', format: { kind: 'numbered steps with icons', why: 'TODO' }, example: { test: 'TODO' } },
            weDo: { guidedRows: 2 }, practice: { pages: 1 }, mixed: null,
            numberSense: { A: { items: ns(10, 60) }, B: { items: ns(60, 99) } },
            wordProblem: { ref, want: 'TODO' },
            exit: { items: [0, 1, 2].map((i) => ({ case: `case ${i + 1}`, ref, want: 'TODO', detects: 'TODO' })), instruction: str.instruction || '', say: str.say || '' },
            retrieval, checkQuestion: { want: 'TODO', correct: 'D' },
        },
        ranges: { lesson: Object.fromEntries(main.opts && main.opts.band !== undefined ? [['band', main.opts.band]] : []) },
        edgeCases: { edgeTest: null, caseNames: {} }, rulings: [], misconceptions: mis, vocabulary: vocab,
        story: { lines: ['TODO'], answerLine: '', say: str.say || '' }, hook: ['TODO'], teach: { t1Boxes: [], materials: [], atoms: [], routine: [], sections: {}, accepted: [] }, open,
    };
}

/* ------------------------------------------------------------------ units/<unit>.js */
function unitModule(unit, cards) {
    const L = [];
    L.push(`// js/modules/lessons/units/${unit}.js`);
    L.push(`// GENERATED by \`node tests/scripts/ws-lesson-card.mjs --compile --unit ${unit}\` from design/lessons/cards/${unit}/*.md.`);
    L.push('// Never hand-edit: change the card, then recompile (`--compile --unit <id> --check` fails when this file is stale).');
    L.push('// It holds the unit\'s cards (their machine blocks) and compiles them when imported (lessons/compile.js, pure):');
    L.push('//   CARDS     {lesson id: card}');
    L.push('//   ROUTINES  {routine id: routine}   LESSONS {library id: lesson}   the short lessons, in the families/*.js schema');
    L.push('//   DETAILED  {lesson id: description}                          the long lessons, the shape of lessons/detailed/<id>.js');
    L.push('// lessons/detailed/index.js still registers the hand-written descriptions; DETAILED is ready to swap in after the');
    L.push('// render proof (design/lessons/proof/DIFF.md). Pure module (SCC-01).');
    L.push('');
    L.push("import { compileUnit } from '../compile.js';");
    L.push('');
    L.push(`export const UNIT = ${JSON.stringify(unit)};`);
    L.push(`export const CARDS = Object.freeze(${pretty(Object.fromEntries(cards.map((c) => [c.id, c])))});`);
    L.push('');
    L.push('const compiled = compileUnit(Object.values(CARDS));');
    L.push('export const ROUTINES = Object.freeze(compiled.routines);');
    L.push('export const LESSONS = Object.freeze(compiled.lessons);');
    L.push('export const DETAILED = Object.freeze(compiled.detailed);');
    L.push('export const NOTES = Object.freeze(compiled.notes);');
    L.push('');
    L.push('export default { UNIT, CARDS, ROUTINES, LESSONS, DETAILED, NOTES };');
    return L.join('\n') + '\n';
}

/* ------------------------------------------------------------------ main */
let failed = false;
const say = (m) => log(m);
try {
    if (flag('--shapes')) {
        const queue = readJson('design/lessons-first/queue.json');
        const keep = readShapes();
        const md = shapesMarkdown(queue, keep);
        if (flag('--check')) {
            const have = fs.existsSync(SHAPES_MD) ? fs.readFileSync(SHAPES_MD, 'utf8') : '';
            if (have !== md) { say('ws-lesson-card: SHAPES.md is stale (a queue lesson has no row, or a row changed): run --shapes'); failed = true; }
        } else { fs.mkdirSync(path.dirname(SHAPES_MD), { recursive: true }); fs.writeFileSync(SHAPES_MD, md); say(`wrote ${rel(SHAPES_MD)} (${readShapes().length} lessons)`); }
    } else if (val('--from-detailed')) {
        const unit = val('--unit');
        if (!unit) throw new Error('--from-detailed needs --unit');
        const id = val('--from-detailed');
        const file = cardFile(unit, id);
        if (fs.existsSync(file) && readCard(file).signed) throw new Error(`${rel(file)} is decided: never overwritten`);
        if (fs.existsSync(file) && !flag('--force')) throw new Error(`${rel(file)} exists (undecided): pass --force to reseed it`);
        const card = seedFromDetailed(id, unit, val('--shape'));
        // A passed lesson's values are decisions already made: an option the schema lacks or a misconception id the
        // provider does not declare becomes a NEED for the lane that owns that file, never a silent change of the pack.
        const needs = [];
        for (const p of checkCard(card, { file: 'x' })) {
            const o = p.match(/: ([a-z0-9_]+:[a-z0-9_]+): option "([A-Za-z0-9_]+)" is not in/);
            const m = p.match(/misconception "([^"]+)" is not a provider id/);
            if (o && !needs.some((n) => n.match === `option "${o[2]}" is not in ${o[1]}'s schema`)) needs.push({ kind: 'option', skill: o[1], option: o[2], match: `option "${o[2]}" is not in ${o[1]}'s schema`, why: 'the passed pack sets it; skill-options.js has no schema entry (add it, or rule it inert and drop it)' });
            if (m) needs.push({ kind: 'misconception', id: m[1], match: `misconception "${m[1]}"`, why: 'the provider\'s wrongAnswers return it, its `misconceptions` list does not declare it' });
        }
        if (needs.length) card.needs = needs;
        const decided = (card.open || []).every((q) => q.answer && q.rule);
        writeCard(file, card, { signed: decided ? `lf-engine, ${TODAY}` : null });
        say(`wrote ${rel(file)} (hand-written lines ${handLines(card)})`);
    } else if (flag('--draft')) {
        const unitId = val('--unit');
        const queue = readJson('design/lessons-first/queue.json');
        const unit = queue.units.find((u) => u.id === unitId);
        if (!unit) throw new Error(`no unit ${unitId} in queue.json`);
        const outDir = val('--out') ? path.resolve(ROOT, val('--out')) : path.join(CARDS_DIR, unitId);
        const existing = fs.existsSync(path.join(CARDS_DIR, unitId)) ? fs.readdirSync(path.join(CARDS_DIR, unitId)).filter((f) => f.endsWith('.md')).map((f) => readCard(path.join(CARDS_DIR, unitId, f))) : [];
        let wrote = 0, kept = 0;
        // (owner 2026-11-07: the scope for now is the CCSS BUILD lessons; --all drafts every CCSS lesson of the unit)
        for (const l of unit.lessons.filter((x) => x.ccssLesson && (flag('--all') || x.kind === 'build'))) {
            const have = existing.find((e) => e.card.lesson === l.id);
            if (have && (have.signed || !flag('--force'))) { kept++; say(`kept ${rel(have.file)}${have.signed ? ' (decided)' : ''}`); continue; }
            const card = draftCard(unit, l, queue);
            const file = path.join(outDir, `${card.id}.md`);
            if (fs.existsSync(file) && readCard(file).signed) { kept++; continue; }
            writeCard(file, card, { drafted: true });
            wrote++;
            say(`drafted ${rel(file)} (${card.open.length} open questions)`);
        }
        say(`ws-lesson-card: drafted ${wrote}, kept ${kept} (unit ${unitId})`);
    } else if (flag('--check-decided') || flag('--check-signed')) {
        const files = cardFiles();
        if (!files.length) { say('ws-lesson-card: no cards'); failed = true; }
        for (const f of files) {
            const { card, signed } = readCard(f);
            const unanswered = (card.open || []).filter((q) => !String(q.answer || '').trim());
            const noRule = (card.open || []).filter((q) => String(q.answer || '').trim() && !String(q.rule || '').trim());
            if (!signed) { say(`  ${rel(f)}: no "Decided: lf-<lane>, <date>" line`); failed = true; }
            if (unanswered.length) { say(`  ${rel(f)}: ${unanswered.length} undecided line(s)`); failed = true; }
            if (noRule.length) { say(`  ${rel(f)}: ${noRule.length} decision(s) without the rule they rest on`); failed = true; }
            if (!signed && !unanswered.length && !noRule.length) continue;
        }
    } else if (flag('--compile')) {
        const unit = val('--unit');
        if (!unit) throw new Error('--compile needs --unit');
        const cards = cardFiles().map((f) => readCard(f).card).filter((c) => c.unit === unit);
        for (const c of cards) COMPILE.compileLesson(c);
        const file = path.join(UNITS_DIR, `${unit}.js`);
        const src = unitModule(unit, cards);
        if (flag('--check')) {
            if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== src) { say(`ws-lesson-card: ${rel(file)} is stale: run --compile --unit ${unit}`); failed = true; }
        } else { fs.mkdirSync(UNITS_DIR, { recursive: true }); fs.writeFileSync(file, src); say(`wrote ${rel(file)} (${cards.length} lessons)`); }
    } else if (flag('--render')) {
        // rewrite each card's summary from its machine block (after a hand edit of the block); the Decided line is kept
        // (--decided lf-<lane>: close the card with the Decided line, refused while a line is undecided)
        const lane = val('--decided');
        for (const f of cardFiles()) {
            const { card, signed } = readCard(f);
            const undecided = (card.open || []).filter((q) => !String(q.answer || '').trim() || !String(q.rule || '').trim());
            if (lane && undecided.length) { say(`  ${rel(f)}: ${undecided.length} undecided line(s): not closed`); failed = true; }
            const close = lane && !undecided.length ? `${lane}, ${TODAY}` : signed;
            writeCard(f, card, { signed: close, drafted: !DET.detailedLessonFor(card.id) });
            say(`rendered ${rel(f)}${close ? ` (Decided: ${close})` : ''}`);
        }
    } else if (flag('--lines')) {
        for (const f of cardFiles()) { const { card, md } = readCard(f); const block = (md.match(BLOCK_RE) || ['', ''])[1].split('\n').length; say(`${rel(f)}: hand-written ${handLines(card)} lines, machine block ${block} lines`); }
    } else if (flag('--check')) {
        const files = cardFiles();
        if (!files.length) { say('ws-lesson-card: no cards'); failed = true; }
        for (const f of files) {
            let r;
            try { r = readCard(f); } catch (x) { say(`  ${x.message}`); failed = true; continue; }
            const bad = checkCard(r.card, { file: rel(f) });
            for (const b of bad) say(`  ${b.startsWith('NEEDS ') ? `${rel(f)}: ${b}` : b}`);
            if (bad.some((b) => !b.startsWith('NEEDS '))) failed = true; else say(`  ${rel(f)}: resolves${bad.length ? ` (${bad.length} needs)` : ''}`);
        }
    } else {
        say('usage: ws-lesson-card.mjs --draft --unit <id> | --check [--unit <id> | files] | --check-decided [...] (alias --check-signed) | --compile --unit <id> [--check] | --from-detailed <id> --unit <id> | --shapes [--check] | --lines');
        failed = true;
    }
} catch (x) {
    say(`ws-lesson-card: ${x.message}`);
    failed = true;
}
say(failed ? 'ws-lesson-card: FAIL' : 'ws-lesson-card: OK');
process.exit(failed ? 1 : 0);
