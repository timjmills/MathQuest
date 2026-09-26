// L10 gate: do a page's answers follow a pattern, or never vary? (design/audit/LESSONS_LEARNED.md L10)
//
// Four critic rounds in a row (k2-r1, pv-r1, figures-r6, ea-r5) found generators dealing the
// question kind, the answer position, the key or the sign from the item's POSITION instead of the
// seeded rng: `itemIndex % n`, a permutation shuffled once and repeated, the LRU variant rotation.
// A pupil then answers the page by pattern (A B A B, every sign ">", keys 2 5 10 2 5 10), or the
// page is the same page whatever seed the teacher prints. This gate deals every live skill the way
// a sheet does and looks for exactly that.
//
//   node tests/scripts/ws-pattern-audit.cjs                       # every live skill
//   node tests/scripts/ws-pattern-audit.cjs --category addition   # one category
//   node tests/scripts/ws-pattern-audit.cjs --skill compare_size   # one skill
//   node tests/scripts/ws-pattern-audit.cjs --n 12                 # items per page (default 12)
//   node tests/scripts/ws-pattern-audit.cjs --default-only         # the default options only
//   node tests/scripts/ws-pattern-audit.cjs --report out.txt       # also write the report file
//   node tests/scripts/ws-pattern-audit.cjs --report-only          # print, always exit 0
//
// HOW A PAGE IS DEALT. Exactly as print-sheet.js generateRun() deals a one-skill run: item i under
// seed `pageSeed + i`, a duplicate retried under `pageSeed + i + 7919 k` (12 retries), `itemIndex`
// counting only KEPT items and `itemCount` = the page's count. Three page seeds per skill, derived
// from the skill id alone (fnv1a), so a --skill run reproduces the full run item for item. The
// variant rotation's history (variant-cycler.js) is cleared before each page, as in a freshly
// loaded app, so a page never depends on what the audit dealt before it.
//
// WHICH OPTIONS. The default, plus every value of each option that changes WHAT AN ITEM ASKS
// (KIND_OPTIONS below: task, forms, direction, unknown, response, ...). An enum is tried at each
// non-default value; a set at each single tick and at its first two ticked together, because two
// ticked forms is where a round-robin deal shows. Size, support and appearance options change how
// an item looks, never what it asks, so they are not multiplied in.
//
// THE CHECKS (per skill and option value; a verdict needs EVERY seed to agree, so a chance run on
// one page is never a failure):
//   constant-answer   every item of a page has the same answer, on every seed
//   answer-cycle      the answer repeats with a period of 2-6 down the page, on every seed
//   position-cycle    the correct choice's position / letter repeats with a period of 2-6
//   kind-cycle        an item attribute (the cell template, a payload field such as the kind, the
//                     sign, the key, the unknown; a top-level variant; the instruction key) repeats
//                     with a period of 2-6, on every seed
//   same-page         the first 5 answers are identical on all 3 seeds (the seed does nothing)
//   position-dominant one choice position holds the answer on more than 70% of all choice items
//
// FALSE POSITIVES. A period needs >= 2 distinct values inside it and at most 10% mismatches over
// the page, on all 3 seeds: a random 2-valued answer passes that by chance about once in a million
// skills. same-page on a 2-valued answer additionally needs all 12 answers equal (chance 2^-24).
// A skill whose answer is ONE value by design is listed in CONSTANT_OK with the reason; a field
// that is presentation, not a question kind (the notation the teacher ticked, a support fading in
// blocks) is in PRESENTATION_FIELDS with the reason. Nothing else is exempt: if a skill cycles for
// a reason, the reason goes in the table, visibly, or the skill gets fixed.
const fs = require('fs');
const path = require('path');
const { ROOT, open, hideOverlays } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes('--' + k);

const N = parseInt(arg('n', '12'), 10);
const SEEDS = 3;
const ONLY_SKILL = arg('skill', null);
const ONLY_CAT = arg('category', null);
const REPORT = arg('report', null);
const MAX_VARIANTS = 10;          // option values tried per skill, beyond the default

// Options whose value changes what an item ASKS (the kind of question, its direction, which part is
// unknown, how the pupil responds). Read from the skill's own schema in skill-options.js.
const KIND_OPTIONS = new Set([
    'task', 'ftTask', 'forms', 'dir', 'unknown', 'response', 'responseScope', 'wordform', 'kind', 'form',
    'stimulus', 'quarters', 'words', 'op', 'source', 'pattern', 'midpoint', 'noon', 'bins',
]);

// Skills (or one option value of a skill, "cat:skill [option=value]") whose answer is a single
// value BY DESIGN. Each line says why.
const CONSTANT_OK = new Map([
    // An interactive build: the "answer" is a sentinel the checker reads the pupil's drawing against.
    ['graphs:build_pictograph', 'answer is the build sentinel "graph-built"; the target data varies'],
    ['graphs:build_bar_graph', 'answer is the build sentinel; the target data varies'],
    // The skill IS the zero: "Write the Placeholder Zero" asks for the 0 that holds the ones place
    // in the second partial product; the numbers around it vary.
    ['multiplication:mult_placeholder_zero', 'the skill asks for the placeholder 0 itself; the factors vary'],
    // "Write every minute label" (task=all) fills the whole ring 5, 10 … 55: one answer by design;
    // the default task (missing labels) varies.
    ['measurement:time_fives_ring [task=all]', 'writing all twelve minute labels is one fixed answer by design'],
]);
// A single tick of a `set` option that decides the answer (only "equal groups", only the zero
// property) makes every answer the same because the teacher asked for exactly that. Such a row is
// reported as a NOTE for the owning lane to look at, never as a failure.
const isSingleTick = (label) => /^[A-Za-z]+=\[[^,\]]+\]$/.test(label);

// Item fields that are PRESENTATION, not a question kind, so a regular pattern in them gives no
// answer away. Each line says why.
const PRESENTATION_FIELDS = new Map([
    ['notation', 'the notations the teacher ticked (stacked / across) are shared out evenly by design (P12); the notation never tells the answer'],
    ['cell.notation', 'as notation'],
    ['supportLevel', 'a ticked support fades down the page in equal blocks (S2), most support first'],
    ['cell.supportLevel', 'as supportLevel'],
    ['printFormat', 'the legacy print handler, follows the notation'],
    ['cell.digits', 'digit-grid width, follows the numbers'],
    ['cell.shape', 'the slot shape the teacher chose'],
    ['answerType', 'screen widget, follows the template'],
    ['poolMember', 'judged separately as member-cycle'],
]);

// Top-level fields that are text, drawings or bookkeeping, never a kind.
const SKIP_TOP = new Set(['text', 'printText', 'hint', 'visual', 'skillLabel', 'skillId', 'categoryId', 'seed', 'ans',
    'printAnswer', 'screenInstr', 'solution', 'explanation', 'requestedSkillId', 'selfAnswering', 'title', 'question']);

// ---------------------------------------------------------------------------- lanes (report only)
// Which lane owns the generator a skill is dealt by, so the orchestrator can route offenders. The
// repo's own ownership table is build-list.js laneFor() (read in the page); the lanes WORKING right
// now (2026-09-26) are named here, and every other lane's files are unowned, so this lane may fix
// them. A `_plain` twin and a mixed category go with the generator that deals them.
const ACTIVE_LANES = {
    k2: 'k2 lane (gen-counting.js, K-2 pictures)',
    placevalue: 'placevalue lane (gen-pv.js, gen-algebraic.js place value / rounding)',
    data: 'figures lane (gen-data-stats.js)',
    measurement: 'figures lane (gen-measurement.js figures)',
    fractions: 'fractions lane (gen-fractions.js)',
    geometry: 'geometry lane (gen-geometry.js)',
};
const UNOWNED = {
    operations: 'UNOWNED: operations (gen-operations.js, gen-mult-patterns.js)',
    algebra: 'UNOWNED: algebra / patterns (gen-algebraic.js)',
    timemoney: 'UNOWNED: time and money (gen-time-money.js / gen-measurement.js)',
    numtheory: 'UNOWNED: number theory (gen-number-theory.js)',
    vocabulary: 'UNOWNED: vocabulary (gen-vocabulary.js)',
};
// Skills build-list.js does not place (a mixed pool of one lane's members).
const SKILL_LANE_EXTRA = { 'measurement:mixed_time': 'timemoney' };
const MIXED_CAT_LANE = { geo_mixed: 'geometry', frac_dec_mixed: 'fractions', data_mixed: 'data', algebra_mixed: 'algebra', number_ops_mixed: 'operations', vocabulary: 'vocabulary' };
function laneName(id) { return ACTIVE_LANES[id] || UNOWNED[id] || `UNOWNED: ${id}`; }

// fnv1a: the page seeds depend on the skill id alone, so --skill reproduces the full run.
function seedFor(key) {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) % 900000 + 100000;
}

// ---------------------------------------------------------------------------- the detectors
/**
 * The smallest period p in 2..6 the sequence repeats with, or 0. `null` entries (no value on that
 * item) never match. A period needs >= 2 distinct values in one period and at most 10% of the
 * comparisons may mismatch (one stray item on a 12-item page).
 */
function periodOf(seq) {
    const n = seq.length;
    for (let p = 2; p <= 6; p++) {
        if (n < 2 * p) break;
        if (new Set(seq.slice(0, p)).size < 2) continue;
        let cmp = 0, miss = 0;
        for (let i = 0; i + p < n; i++) { cmp++; if (seq[i] === null || seq[i] !== seq[i + p]) miss++; }
        if (miss <= Math.floor(cmp * 0.1)) return p;
    }
    return 0;
}
/** One period shared by every page (0 when any page is not periodic, or they disagree). */
function sharedPeriod(pages) {
    const ps = pages.map(periodOf);
    return ps.every(p => p && p === ps[0]) ? ps[0] : 0;
}
const show = (seq, k = 8) => seq.slice(0, k).map(v => (v === null ? '·' : String(v).slice(0, 14))).join(' ');

function judge(pages, key, variant) {
    const fails = [];
    const notes = [];
    const F = (cls, msg) => fails.push({ cls, msg });
    const answers = pages.map(pg => pg.map(it => it.ans));
    const allAns = answers.flat();
    if (!allAns.length) return { fails, notes: ['no items'] };
    const constOk = CONSTANT_OK.has(key) || CONSTANT_OK.has(`${key} [${variant}]`);
    // 1. constant answer
    const pageConst = answers.filter(a => a.length > 1 && new Set(a).size === 1);
    if (pageConst.length === pages.length && !constOk) {
        const across = new Set(allAns).size === 1;
        const msg = `every item answers ${JSON.stringify(allAns[0]).slice(0, 30)}${across ? ' on every seed' : ` on each page (per seed: ${answers.map(a => String(a[0]).slice(0, 12)).join(' / ')})`}`;
        if (isSingleTick(variant)) notes.push(`constant under a single tick: ${msg}`);
        else F('constant-answer', msg);
    }
    // 2. answer cycle
    if (!constOk && !pageConst.length) {
        const p = sharedPeriod(answers);
        if (p) F('answer-cycle', `the answer repeats every ${p} items on all ${pages.length} seeds: ${show(answers[0])} …`);
    }
    // 3. correct position
    const pos = pages.map(pg => pg.map(it => it.pos));
    const withPos = pos.flat().filter(v => v !== null);
    if (withPos.length >= Math.ceil(allAns.length * 0.5)) {
        const p = sharedPeriod(pos);
        if (p) F('position-cycle', `the right choice sits in a cycle of ${p} on all seeds: ${show(pos[0])} …`);
        const choiceN = pages.flat().filter(it => it.pos !== null && it.nChoices >= 2);
        if (choiceN.length >= 6) {
            const t = {};
            for (const it of choiceN) t[it.pos] = (t[it.pos] || 0) + 1;
            const [top, cnt] = Object.entries(t).sort((a, b) => b[1] - a[1])[0];
            if (cnt / choiceN.length > 0.7) F('position-dominant', `the right choice is "${top}" on ${cnt} of ${choiceN.length} choice items`);
        }
    }
    // 4. kind / attribute cycles
    const fields = new Set(pages.flat().flatMap(it => Object.keys(it.attrs)));
    for (const f of [...fields].sort()) {
        if (PRESENTATION_FIELDS.has(f)) continue;
        const seqs = pages.map(pg => pg.map(it => (f in it.attrs ? it.attrs[f] : null)));
        const p = sharedPeriod(seqs);
        if (p) F('kind-cycle', `${f} repeats every ${p} items on all seeds: ${show(seqs[0])} …`);
        // The same ORDER of kinds on every seed (a fixed walk through the tables, say), even when
        // it is longer than the period window: the seed does not reach the deal.
        else if (seqs.length >= 2 && seqs[0].length >= 6) {
            const head = seqs.map(q => JSON.stringify(q.slice(0, 6)));
            if (head.every(h => h === head[0]) && new Set(seqs[0].slice(0, 6)).size >= 3) F('same-page', `${f} runs in the same order on all ${seqs.length} seeds: ${show(seqs[0], 6)} …`);
        }
    }
    // 4b. a mixed pool dealing its members in a fixed rotation
    {
        const seqs = pages.map(pg => pg.map(it => it.member));
        if (seqs.flat().some(v => v !== null)) {
            const p = sharedPeriod(seqs);
            if (p) F('member-cycle', `the pool deals its members in a fixed rotation of ${p}: ${show(seqs[0], 6)} …`);
        }
    }
    // 5. same page for every seed
    if (!pageConst.length && pages.length >= 2) {
        const first = answers.map(a => JSON.stringify(a.slice(0, 5)));
        if (first.every(s => s === first[0]) && answers[0].length >= 5) {
            const distinct = new Set(answers[0]).size;
            const whole = answers.map(a => JSON.stringify(a));
            if (distinct >= 3 || whole.every(s => s === whole[0])) F('same-page', `the first 5 answers are the same on all ${pages.length} seeds: ${show(answers[0], 5)}`);
        }
    }
    return { fails, notes };
}

// ---------------------------------------------------------------------------- in the page
async function dealInPage({ categoryId, skillId, opts, seeds, n, retries, presentation, skipTop }) {
    const gp = await import('/js/modules/sheet/index.js');
    const canon = (v) => {
        if (v === undefined || v === null) return '';
        if (typeof v === 'object') return JSON.stringify(v);
        return String(v).replace(/\s+/g, ' ').trim();
    };
    const optVal = (o) => (o && typeof o === 'object' ? (o.value !== undefined ? o.value : o.v !== undefined ? o.v : o.label !== undefined ? o.label : o.text) : o);
    const low = (s) => String(s).toLowerCase().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const signature = (q) => {
        const payload = q.cell && q.cell.payload ? JSON.stringify(q.cell.payload) : '';
        const ans = typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q.ans);
        return `${String(q.text || '').replace(/\s+/g, ' ').trim()}|${ans}|${payload}`;
    };
    // A scalar that names a kind, not a number: digits become '#', so "Add 7" and "Add 9" are one
    // kind while "more" and "fewer" stay two.
    const kindVal = (v) => {
        if (typeof v === 'boolean') return v ? 'yes' : 'no';
        if (typeof v === 'number') return String(v);
        if (typeof v !== 'string') return null;
        const s = v.replace(/<[^>]*>/g, '').trim();
        if (!s || s.length > 40) return null;
        return s;
    };
    const features = (q) => {
        const opts = Array.isArray(q.options) ? q.options : null;
        const pl0 = q.cell && q.cell.payload && typeof q.cell.payload === 'object' ? q.cell.payload : null;
        // An answer written in element IDS (a drag-and-drop mapping, an order of tiles, a
        // multi-select) is judged by the POSITIONS those elements are shown at: the ids are
        // assigned before the shuffle (t0 is always the first right tile), so the raw ids would
        // read as one answer for ever while the pupil sees a new layout every time.
        const idPos = new Map();
        for (const host of [opts, q.tiles, q.bins, q.items, pl0 && pl0.tiles, pl0 && pl0.options, pl0 && pl0.choices]) {
            if (Array.isArray(host)) host.forEach((o, i) => { if (o && typeof o === 'object' && o.id !== undefined && !idPos.has(String(o.id))) idPos.set(String(o.id), i); });
        }
        const mapId = (v) => (idPos.has(String(v)) ? `#${idPos.get(String(v))}` : v);
        let ans = canon(q.ans);
        if (idPos.size && q.ans && typeof q.ans === 'object') {
            ans = Array.isArray(q.ans) ? JSON.stringify(q.ans.map(mapId))
                : JSON.stringify(Object.entries(q.ans).map(([k, v]) => [mapId(k), mapId(v)]).sort());
        }
        let pos = null, nChoices = 0;
        if (opts && opts.length >= 2) {
            nChoices = opts.length;
            const idx = opts.findIndex(o => low(optVal(o)) === low(ans));
            if (idx >= 0) pos = String(idx);
        }
        // A multi-select answers with option IDS. The id is internal (the needed numbers are often
        // opt0 and opt1 before the shuffle); the pupil sees the POSITIONS, so read those.
        if (pos === null && Array.isArray(q.ans) && q.ans.length) {
            const ids = q.ans.map(String);
            if (opts && opts.some(o => o && typeof o === 'object' && o.id !== undefined)) {
                const at = opts.map((o, i) => (o && ids.includes(String(o.id)) ? i : -1)).filter(i => i >= 0);
                if (at.length) { pos = at.join(','); nChoices = opts.length; }
            } else if (ids.every(a => /^opt\d+$/.test(a))) { pos = ids.slice().sort().join(','); nChoices = nChoices || 2; }
        }
        const pl = q.cell && q.cell.payload && typeof q.cell.payload === 'object' ? q.cell.payload : null;
        if (pos === null && pl) {
            for (const k of ['correct', 'correctIndex', 'answerIndex', 'correctPos', 'right']) {
                const v = pl[k];
                if (typeof v === 'number' || (typeof v === 'string' && v.length <= 12)) { pos = String(v); break; }
            }
            if (pos === null) for (const k of ['choices', 'options', 'tiles', 'items']) {
                const arr = pl[k];
                if (Array.isArray(arr) && arr.length >= 2 && arr.length <= 8) {
                    const idx = arr.findIndex(o => low(optVal(o)) === low(ans));
                    if (idx >= 0) { pos = String(idx); nChoices = arr.length; break; }
                }
            }
        }
        if (pos === null && /^[A-H]$/.test(ans)) { pos = ans; nChoices = nChoices || 2; }
        const attrs = {};
        if (q.cell && q.cell.template) attrs.template = q.cell.template;
        for (const [k, v] of Object.entries(q)) {
            if (skipTop.includes(k) || k === 'cell' || k === 'poolMember') continue;
            const kv = kindVal(v);
            if (kv !== null && !/^\d+(\.\d+)?$/.test(kv)) attrs[k] = kv;   // top level: named kinds only, not operands
        }
        if (pl) for (const [k, v] of Object.entries(pl)) {
            const kv = kindVal(v);
            if (kv !== null) attrs['cell.' + k] = kv;
        }
        try {
            const p = gp.getProvider(q.categoryId || categoryId, q.skillId || skillId);
            if (p && Array.isArray(p.real) && p.real.includes('strings')) {
                const raw = typeof p.strings === 'function' ? p.strings({ categoryId: q.categoryId, skillId: q.skillId, label: q.skillLabel, q }) : p.strings;
                if (raw && raw.instructionKey) attrs.instructionKey = String(raw.instructionKey);
            }
        } catch (e) { /* no provider strings */ }
        for (const f of presentation) delete attrs[f];
        return { ans, pos, nChoices, attrs, member: q.poolMember ? String(q.poolMember) : null };
    };
    const pages = [];
    const errors = [];
    for (const base of seeds) {
        // A freshly loaded app: no variant rotation history, so the page is a function of its seed.
        window.__variantHistory = {};
        const seen = new Set();
        const page = [];
        let kept = 0;
        for (let i = 0; i < n; i++) {
            let q = null;
            for (let k = 0; k <= retries; k++) {
                const seed = (base + i + 7919 * k) >>> 0;
                let cand = null;
                try { cand = window.generateQuestionFor({ category: categoryId, skill: skillId, opts, seed, itemIndex: kept, itemCount: n }); } catch (e) { if (errors.length < 3) errors.push(String(e && e.message || e)); cand = null; }
                if (!cand) continue;
                q = cand;
                if (!seen.has(signature(cand))) break;
            }
            if (!q) continue;
            seen.add(signature(q));
            kept++;
            page.push(features(q));
        }
        pages.push(page);
    }
    return { pages, errors };
}

// ---------------------------------------------------------------------------- main
(async () => {
    const t0 = Date.now();
    const app = await open({ seed: 4242 });
    await hideOverlays(app.page);
    // Generators log freely; keep the run's own output readable.
    await app.page.evaluate(() => { console.log = () => {}; });
    let skills = await app.page.evaluate(() => {
        const out = [];
        for (const [categoryId, list] of Object.entries(window.SKILLS)) {
            if (!Array.isArray(list)) continue;
            for (const s of list) if (!s.retired) out.push({ categoryId, skillId: s.v, label: s.l });
        }
        return out;
    });
    if (ONLY_CAT) skills = skills.filter(s => s.categoryId === ONLY_CAT);
    if (ONLY_SKILL) skills = skills.filter(s => s.skillId === ONLY_SKILL);
    if (!skills.length) { console.error(`ws-pattern-audit: FAIL - no skill matched ${[ONLY_CAT, ONLY_SKILL].filter(Boolean).join(' ')}`); await app.close(); process.exit(1); }

    // The lane of every skill, from build-list.js laneFor (the repo's ownership table).
    const lanes = await app.page.evaluate(async ({ list, mixedCat }) => {
        const m = await import('/js/modules/build-list.js');
        const out = {};
        for (const s of list) {
            const base = s.skillId.replace(/_plain$/, '');
            const key = `${s.categoryId}:${s.skillId}`;
            const baseKey = `${s.categoryId}:${base}`;
            out[key] = mixedCat[s.categoryId] || (base !== s.skillId ? m.laneFor(baseKey) : m.laneFor(key));
        }
        return out;
    }, { list: skills, mixedCat: MIXED_CAT_LANE });
    for (const [k, v] of Object.entries(SKILL_LANE_EXTRA)) if (k in lanes) lanes[k] = v;

    // The option values to deal, per skill, read from the skill's own schema.
    const variantsOf = await app.page.evaluate(async ({ list, kinds, max, defaultOnly }) => {
        const m = await import('/js/modules/skill-options.js');
        const out = {};
        for (const s of list) {
            const vs = [{ label: 'default', opts: null }];
            if (!defaultOnly) {
                let defs = [];
                try { defs = m.optionsFor(s.categoryId, s.skillId) || []; } catch (e) { defs = []; }
                const dflt = {};
                for (const o of defs) dflt[o.id] = o.default;
                for (const o of defs) {
                    if (o.hidden || !kinds.includes(o.id) || !Array.isArray(o.values) || o.values.length < 2) continue;
                    try { if (typeof o.appliesTo === 'function' && !o.appliesTo(dflt)) continue; } catch (e) { continue; }
                    const vals = o.values.map(x => x.v);
                    if (o.type === 'enum') {
                        for (const v of vals) if (v !== o.default && v !== null) vs.push({ label: `${o.id}=${v}`, opts: { [o.id]: v } });
                    } else if (o.type === 'set') {
                        for (const v of vals) vs.push({ label: `${o.id}=[${v}]`, opts: { [o.id]: [v] } });
                        if (vals.length >= 3) vs.push({ label: `${o.id}=[${vals[0]},${vals[1]}]`, opts: { [o.id]: [vals[0], vals[1]] } });
                    }
                }
            }
            out[`${s.categoryId}:${s.skillId}`] = vs.slice(0, 1 + max);
        }
        return out;
    }, { list: skills, kinds: [...KIND_OPTIONS], max: MAX_VARIANTS, defaultOnly: has('default-only') });

    const results = [];
    let dealt = 0;
    for (const s of skills) {
        const key = `${s.categoryId}:${s.skillId}`;
        const base = seedFor(key);
        const seeds = Array.from({ length: SEEDS }, (_, k) => (base + k * 1000003) >>> 0);
        for (const v of variantsOf[key]) {
            let res;
            try {
                res = await app.page.evaluate(dealInPage, {
                    categoryId: s.categoryId, skillId: s.skillId, opts: v.opts, seeds, n: N, retries: 12,
                    presentation: [], skipTop: [...SKIP_TOP],
                });
            } catch (e) { results.push({ ...s, key, variant: v.label, fails: [], notes: [`deal failed: ${String(e.message || e).slice(0, 120)}`] }); continue; }
            dealt += res.pages.reduce((a, p) => a + p.length, 0);
            const empty = res.pages.every(p => p.length === 0);
            if (empty) { results.push({ ...s, key, variant: v.label, fails: [], notes: [`no items${res.errors.length ? ': ' + res.errors[0].slice(0, 80) : ''}`] }); continue; }
            const { fails, notes } = judge(res.pages, key, v.label);
            results.push({ ...s, key, variant: v.label, fails, notes, lane: laneName(lanes[key]) });
        }
    }
    await app.close();

    // ------------------------------------------------------------------------ report
    const lines = [];
    const L = (x = '') => lines.push(x);
    const bad = results.filter(r => r.fails.length);
    const badSkills = new Map();
    for (const r of bad) {
        if (!badSkills.has(r.key)) badSkills.set(r.key, { lane: r.lane, label: r.label, rows: [] });
        badSkills.get(r.key).rows.push(r);
    }
    L(`ws-pattern-audit — L10 answer patterns (${new Date().toISOString().slice(0, 10)})`);
    L(`${skills.length} live skills, ${results.length} skill/option pages sets, ${SEEDS} seeds x ${N} items, ${dealt} items dealt.`);
    L('');
    const classes = {};
    for (const r of bad) for (const f of r.fails) classes[f.cls] = (classes[f.cls] || 0) + 1;
    L('Failures by class (skill/option rows):');
    for (const [k, v] of Object.entries(classes).sort((a, b) => b[1] - a[1])) L(`  ${String(v).padStart(4)}  ${k}`);
    if (!bad.length) L('     0  (none)');
    L('');
    const byLane = new Map();
    for (const [key, b] of badSkills) {
        if (!byLane.has(b.lane)) byLane.set(b.lane, []);
        byLane.get(b.lane).push([key, b]);
    }
    L('Offending skills by lane:');
    for (const [lane, list] of [...byLane].sort((a, b) => a[0].localeCompare(b[0]))) L(`  ${String(list.length).padStart(4)}  ${lane}`);
    L('');
    for (const [lane, list] of [...byLane].sort((a, b) => a[0].localeCompare(b[0]))) {
        L(`== ${lane}: ${list.length} skills`);
        for (const [key, b] of list.sort((a, c) => a[0].localeCompare(c[0]))) {
            L(`  ${key}  "${b.label}"`);
            for (const r of b.rows) for (const f of r.fails) L(`      [${r.variant}] ${f.cls}: ${f.msg}`);
        }
        L('');
    }
    const noted = results.filter(r => r.notes.length);
    if (noted.length) {
        L(`Notes, not failures (${noted.length} skill/option rows):`);
        for (const r of noted) L(`  ${r.key} [${r.variant}] ${r.notes.join('; ')}`);
        L('');
    }
    L('Allowlisted constant answers:');
    for (const [k, why] of CONSTANT_OK) L(`  ${k}: ${why}`);
    L('Presentation fields not judged as kinds:');
    for (const [k, why] of PRESENTATION_FIELDS) L(`  ${k}: ${why}`);
    const out = lines.join('\n');
    console.log(out);
    if (REPORT) { fs.mkdirSync(path.dirname(path.resolve(ROOT, REPORT)), { recursive: true }); fs.writeFileSync(path.resolve(ROOT, REPORT), out + '\n'); }

    const secs = Math.round((Date.now() - t0) / 1000);
    const summary = `${badSkills.size} of ${skills.length} skills (${bad.length} skill/option rows) deal a pattern; ${secs}s`;
    if (badSkills.size && !has('report-only')) { console.error(`\nws-pattern-audit: FAIL - ${summary}`); process.exit(1); }
    console.log(badSkills.size ? `\nws-pattern-audit: WOULD FAIL - ${summary} [report-only, exit 0]` : `\nws-pattern-audit: OK (${skills.length} skills, ${results.length} option rows, 0 patterns)${has('report-only') ? ' [report-only]' : ''}`);
})().catch(e => { console.error('ws-pattern-audit: FAIL -', e && e.stack || e); process.exit(1); });
