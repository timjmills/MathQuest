// THE LESSON PAGES GATE (owner via the lead, 2026-11-19): two defects the owner saw on the grade-3 WRM lessons the
// teacher White Rose screen prints (teacher-wrm.js printLesson: role 'lesson' from the lesson's first live `direct` skill of
// data/curriculum/links/<YEAR>.json, size M, seed 4242, practicePages 1, no Mixed). No critic round had caught them.
//
//   LESSON-EMPTY-FIRST  no lesson page - the first or any - prints only its title / header. A page FAILS when, after the
//                       header and frame are taken off (.ws-head, .ws-tab, .ws-ican / the title band, .ws-foot), it holds
//                       no content cell ([data-ws-cell]) AND no other ink: no text, no svg, no img, no answer slot.
//                       (the cheapest reliable signal is the rendered page: buildSheet's plan count cannot see a part whose
//                       page box is drawn with nothing in it.)
//   LESSON-OPENER-SAME  two CONSECUTIVE lessons of one WRM block whose first content cell is the SAME model item. The
//                       opener's signature is {template, skeleton, numbers}: template = the cell's data-ws-cell, skeleton =
//                       its visible text with every number written as '#', numbers = those numbers in order. Two openers
//                       are the same when template and skeleton are equal and the number lists are equal, or every
//                       position that differs swaps ONE number for ONE other (the varying factor masked: "11 × 6 is 11
//                       groups of 6" and "11 × 9 is 11 groups of 9" are the same opener; "3 × 4" and "6 × 7" are not).
//                       A one-number opener is the same only when the number is equal too.
//                       Reported as pairs, with each lesson's skill.
//   STEPS-PANEL-EMPTY   no lesson page prints a Steps panel with no step text (lf-ops, lead 2026-11-21: the
//                       multiplication:mult_2by1_column lesson at M, seed 506061, drew its "Steps:" band beside Guided Practice
//                       EMPTY - the skill (a preset of multiplication:multiply) had no provider workedSteps, so roles/lesson.js
//                       had no Steps zone, and we-do.js drew the band's frame anyway). Every element labelled exactly "Steps:"
//                       (a band's .ws-strip label, the practice pages' strip [data-mq-lesson-strip]) is judged: its band, with
//                       the label taken off, holds text. Pupil and key pages.
//   LESSON-ROLE-SET     a lesson whose page roles are pinned prints exactly those roles (lf-ops A28, lead 2026-11-21: the Steps
//                       fix gave multiply's column presets worked steps, and their lessons OPENED WITH AN ANCHOR CHART / Model
//                       page they had never printed and no critic had graded). The roles are the pages' data-ws-sheet values
//                       (lesson-chart, lesson-sheet, lesson-practice, lesson-mixed; key pages as key:<role>), as a set; the pins
//                       (skill/size -> set, measured on master) live in tests/fixtures/lesson-pages/role-sets.json of THIS
//                       script's tree (a backtest runs it on an older checkout). Only --skills / --all-skills runs; a lesson
//                       with no pin is not judged.
//
//   node tests/scripts/ws-lesson-pages.mjs --self-test                 # the rules on planted page summaries (node, no browser)
//   node tests/scripts/ws-lesson-pages.mjs --grade 3                   # build every built lesson of school grade 3 (browser)
//   node tests/scripts/ws-lesson-pages.mjs --grade 3 --dump out.json   # ... and write the page summaries it measured
//   node tests/scripts/ws-lesson-pages.mjs --fixture f.json            # the rules on a summaries file (backtest fixtures)
//   --req packet (default) the lesson PACKET the lessons browser builds and the owner saw: role 'lesson', EVERY live direct
//                skill of the step in one section, mixed: true, key on, size M, seed 4242, practicePages 1
//   --req print  teacher-wrm.js printLesson's request: the FIRST live direct skill only, mixed: false
//   (both: the lesson's own seed and lessonVariant, wrm-links.js wrmLessonSeed / wrmLessonVariant, as printLesson sends them
//    since lf-engine 2026-11-19; was seed 4242 for every lesson)
//   --grade all   every school grade's WRM lessons (K, 1 .. 6)
//   --skills cat:skill,...  the lessons the master prints for these skills (ws-lesson-baseline's request: role 'lesson', the
//                skill's default options, practicePages 1, mixed, key on) at --seed n (default 4242) x --sizes M,L (default M)
//   --all-skills  ... for every key of lessons/prereqs.js LESSONS (the lessons master prints; ws-lesson-baseline --all-lessons)
//   --rules LESSON-EMPTY-FIRST,LESSON-OPENER-SAME,STEPS-PANEL-EMPTY   (default: all three with --skills / --all-skills; the
//                first two on a --grade sweep - `--grade all --rules STEPS-PANEL-EMPTY` is the full Steps-panel sweep)   --blocks Y4.B4,...  (only those WRM blocks)
//   --pin-roles  (with --skills) print the measured page-role sets as role-sets.json pins (run on master to make the pins)
//   --report-only (never exit 1)
//   --warn  findings print `ws-lesson-pages: WARNING (n findings)` and exit 4 (the deploy gate's WARNING, ws-deploy-gates.sh
//           nfn kind) - the deploy list runs it so until lf-engine's fix lands; then the flag comes off and it blocks.
// Prints `ws-lesson-pages: OK (n lessons, n pages)` / `ws-lesson-pages: FAIL (n findings)`.
// The fix of both defects belongs to lf-engine (sheet/roles/lesson.js and the lesson parts); this is the check only.
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const arg = (k, d = null) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const ALL_RULES = ['LESSON-EMPTY-FIRST', 'LESSON-OPENER-SAME', 'STEPS-PANEL-EMPTY', 'LESSON-ROLE-SET'];
// (LESSON-ROLE-SET's pins: this script's own tree, never MQ_ROOT - a backtest checks an older checkout against today's pins)
const PIN_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fixtures/lesson-pages/role-sets.json');
const loadPins = () => { try { return JSON.parse(fs.readFileSync(PIN_FILE, 'utf8')).pins || {}; } catch (e) { return {}; } };
// (the WRM grade sweep keeps its two rules by default - STEPS-PANEL-EMPTY found 404 of the 843 WRM lessons at e0c90f8ad, every
// one a skill with no provider worked steps, logged for their lanes in design/status/lf-ops-steps.md; it is asked for with
// --rules there. A --skills / --all-skills run judges all three.)
const SKILL_MODE = !!(arg('skills') || has('all-skills'));
const RULES = (arg('rules', (SKILL_MODE ? ALL_RULES : ALL_RULES.filter((r) => r !== 'STEPS-PANEL-EMPTY' && r !== 'LESSON-ROLE-SET')).join(',')) || '').split(',').map((x) => x.trim()).filter(Boolean);
const TOOL = 'ws-lesson-pages';

/* ------------------------------------------------------------------ the rules (pure) */
/** A lesson summary: {id, step, block, title, skill, pages: [{cells, ink, steps?, stepsEmpty?, key?}], opener: {template, text} | null}. */
export function emptyPages(lesson) {
    return (lesson.pages || []).filter((p) => !p.key).map((p, i) => ({ i, p })).filter(({ p }) => !(p.cells > 0) && !(p.ink > 0)).map(({ i }) => i + 1);
}
export function openerSig(op) {
    if (!op) return null;
    const text = String(op.text || '').replace(/\s+/g, ' ').trim();
    // (integers only: a cell's text runs its parts together - "11 × 6.11 × 6" - so a decimal reading would glue two numbers)
    const t = text.replace(/(\d),(?=\d{3}\b)/g, '$1');
    return { template: String(op.template || ''), skeleton: t.replace(/\d+/g, '#'), numbers: t.match(/\d+/g) || [] };
}
export function sameOpener(a, b) {
    const x = openerSig(a), y = openerSig(b);
    if (!x || !y || x.template !== y.template || x.skeleton !== y.skeleton || x.numbers.length !== y.numbers.length) return false;
    // the varying factor masked: every position that differs swaps the SAME number for the same other number (6 -> 9 in
    // "11 × 6 is 11 groups of 6" vs "11 × 9 is 11 groups of 9"); a second, different change makes it another item
    const swaps = new Set(x.numbers.map((n, k) => (n !== y.numbers[k] ? `${n}>${y.numbers[k]}` : null)).filter(Boolean));
    return swaps.size === 0 || (swaps.size === 1 && x.numbers.length >= 2);
}
/** The pages (1-based, 'key p' for a key page) printing a Steps panel with no step text. */
export function emptyStepsPages(lesson) {
    return (lesson.pages || []).map((p, i) => ({ i, p })).filter(({ p }) => p.stepsEmpty > 0).map(({ p, i }) => `${p.key ? 'key ' : ''}p${p.n || i + 1}`);
}
/** The page roles a lesson printed, as a sorted set: pupil pages' data-ws-sheet, key pages' as key:<role>. */
export function roleSet(lesson) {
    return [...new Set((lesson.pages || []).map((p) => (p.key ? 'key:' : '') + (p.sheet || '?')))].sort();
}
const stepNo = (s) => { const m = /\.S(\d+)$/.exec(String(s || '')); return m ? Number(m[1]) : 0; };
/** → [{rule, msg, ids}]  (`pins`: LESSON-ROLE-SET's {'cat:skill/size': [roles]}) */
export function judge(lessons, rules = ALL_RULES, pins = {}) {
    const out = [];
    if (rules.includes('LESSON-ROLE-SET')) {
        for (const l of lessons) {
            const want = pins[`${l.skill}/${l.size || ''}`];
            if (!Array.isArray(want)) continue;
            const got = roleSet(l), w = [...want].sort();
            if (got.join(',') !== w.join(',')) {
                const extra = got.filter((x) => !w.includes(x)), lost = w.filter((x) => !got.includes(x));
                out.push({ rule: 'LESSON-ROLE-SET', ids: [l.id], msg: `${l.id}: prints page roles [${got.join(', ')}], master printed [${w.join(', ')}]${extra.length ? ` - NEW ${extra.join(', ')}` : ''}${lost.length ? ` - LOST ${lost.join(', ')}` : ''}` });
            }
        }
    }
    if (rules.includes('LESSON-EMPTY-FIRST')) {
        for (const l of lessons) {
            const e = emptyPages(l);
            if (e.length) out.push({ rule: 'LESSON-EMPTY-FIRST', ids: [l.id], msg: `${l.id} (${l.skill}): page${e.length > 1 ? 's' : ''} ${e.join(', ')} of ${l.pages.filter((p) => !p.key).length} print${e.length > 1 ? '' : 's'} only the title / header, no content cell or ink below it` });
        }
    }
    if (rules.includes('STEPS-PANEL-EMPTY')) {
        for (const l of lessons) {
            const e = emptyStepsPages(l);
            if (e.length) out.push({ rule: 'STEPS-PANEL-EMPTY', ids: [l.id], msg: `${l.id} (${l.skill}): ${e.join(', ')} print${e.length > 1 ? '' : 's'} a "Steps:" panel with no step text` });
        }
    }
    if (rules.includes('LESSON-OPENER-SAME')) {
        const byBlock = new Map();
        for (const l of lessons) { if (!l.block) continue; if (!byBlock.has(l.block)) byBlock.set(l.block, []); byBlock.get(l.block).push(l); }
        for (const [, ls] of byBlock) {
            const s = ls.filter((l) => l.opener).sort((a, b) => stepNo(a.step) - stepNo(b.step));
            for (let k = 1; k < s.length; k++) {
                const a = s[k - 1], b = s[k];
                if (a.id === b.id) continue;   // (one step listed twice: its sequence row and a site lesson)
                if (sameOpener(a.opener, b.opener)) out.push({ rule: 'LESSON-OPENER-SAME', ids: [a.id, b.id], msg: `${a.id} (${a.skill}) and ${b.id} (${b.skill}) open on the same model item: [${a.opener.template}] "${openerSig(a.opener).skeleton}" (${openerSig(a.opener).numbers.join(',')} vs ${openerSig(b.opener).numbers.join(',')})` });
            }
        }
    }
    return out;
}

/* ------------------------------------------------------------------ the self-test */
function selfTest() {
    const P = (cells, ink) => ({ cells, ink });
    const L = (id, pages, opener, skill = 'multiplication:mult_facts') => ({ id, step: id, block: id.replace(/\.S\d+$/, ''), title: id, skill, pages, opener });
    const cases = [
        ['an empty first page fails', [L('Y9.B1.S1', [P(0, 0), P(4, 30)], null)], 'LESSON-EMPTY-FIRST', 1],
        ['an empty later page fails', [L('Y9.B1.S1', [P(3, 20), P(0, 0)], null)], 'LESSON-EMPTY-FIRST', 1],
        ['a normal packet passes', [L('Y9.B1.S1', [P(1, 12), P(6, 40)], null)], 'LESSON-EMPTY-FIRST', 0],
        ['a page with ink but no cell (a chart) passes', [L('Y9.B1.S1', [P(0, 25)], null)], 'LESSON-EMPTY-FIRST', 0],
        ['two identical openers fail', [L('Y9.B1.S2', [P(1, 1)], { template: 'equation', text: '11 × 3 = ' }), L('Y9.B1.S3', [P(1, 1)], { template: 'equation', text: '11 × 4 = ' })], 'LESSON-OPENER-SAME', 1],
        ['byte-identical openers fail', [L('Y9.B1.S2', [P(1, 1)], { template: 'equation', text: '11 × 3 = ' }), L('Y9.B1.S3', [P(1, 1)], { template: 'equation', text: '11 × 3 = ' })], 'LESSON-OPENER-SAME', 1],
        ['the varying factor masked wherever it appears (11 × n)', [L('Y9.B1.S2', [P(1, 1)], { template: 'fact', text: '11 × 6 is 11 groups of 6' }), L('Y9.B1.S3', [P(1, 1)], { template: 'fact', text: '11 × 9 is 11 groups of 9' })], 'LESSON-OPENER-SAME', 1],
        ['two different openers pass (both factors change)', [L('Y9.B1.S2', [P(1, 1)], { template: 'equation', text: '3 × 4 = ' }), L('Y9.B1.S3', [P(1, 1)], { template: 'equation', text: '6 × 7 = ' })], 'LESSON-OPENER-SAME', 0],
        ['a different template passes', [L('Y9.B1.S2', [P(1, 1)], { template: 'equation', text: '11 × 3 = ' }), L('Y9.B1.S3', [P(1, 1)], { template: 'array', text: '11 × 4 = ' })], 'LESSON-OPENER-SAME', 0],
        ['a different skeleton passes', [L('Y9.B1.S2', [P(1, 1)], { template: 'equation', text: '11 × 3 = ' }), L('Y9.B1.S3', [P(1, 1)], { template: 'equation', text: '44 ÷ 4 = ' })], 'LESSON-OPENER-SAME', 0],
        ['non-consecutive steps are not compared', [L('Y9.B1.S2', [P(1, 1)], { template: 'equation', text: '11 × 3 = ' }), L('Y9.B1.S4', [P(1, 1)], { template: 'equation', text: '2 + 2' }), L('Y9.B1.S5', [P(1, 1)], { template: 'equation', text: '11 × 4 = ' })], 'LESSON-OPENER-SAME', 0],
        ['other blocks are not compared', [L('Y9.B1.S2', [P(1, 1)], { template: 'equation', text: '11 × 3 = ' }), L('Y9.B2.S3', [P(1, 1)], { template: 'equation', text: '11 × 4 = ' })], 'LESSON-OPENER-SAME', 0],
        ['an empty Steps panel fails', [L('Y9.B1.S1', [P(4, 30), Object.assign(P(4, 30), { steps: 1, stepsEmpty: 1, key: true, n: 1 })], null)], 'STEPS-PANEL-EMPTY', 1],
        ['a Steps panel with its steps passes', [L('Y9.B1.S1', [Object.assign(P(4, 30), { steps: 1, stepsEmpty: 0 })], null)], 'STEPS-PANEL-EMPTY', 0],
        ['a page with no Steps panel passes', [L('Y9.B1.S1', [P(4, 30)], null)], 'STEPS-PANEL-EMPTY', 0],
        ['a pinned lesson printing a new role fails', [Object.assign(L('m/M', [Object.assign(P(1, 9), { sheet: 'lesson-chart' }), Object.assign(P(4, 30), { sheet: 'lesson-sheet' })], null, 'x:y'), { size: 'M' })], 'LESSON-ROLE-SET', 1],
        ['a pinned lesson printing its roles passes', [Object.assign(L('m/M', [Object.assign(P(4, 30), { sheet: 'lesson-sheet' }), Object.assign(P(4, 30), { sheet: 'lesson-sheet', key: true })], null, 'x:y'), { size: 'M' })], 'LESSON-ROLE-SET', 0],
        ['a pinned lesson losing a role fails', [Object.assign(L('m/M', [], null, 'x:y'), { size: 'M' })], 'LESSON-ROLE-SET', 1],
        ['an unpinned lesson is not judged', [Object.assign(L('m/L', [Object.assign(P(1, 9), { sheet: 'lesson-chart' })], null, 'x:y'), { size: 'L' })], 'LESSON-ROLE-SET', 0],
        ['one-number openers differ when the number differs', [L('Y9.B1.S2', [P(1, 1)], { template: 'count', text: 'Count 5' }), L('Y9.B1.S3', [P(1, 1)], { template: 'count', text: 'Count 7' })], 'LESSON-OPENER-SAME', 0],
    ];
    const bad = [];
    const PINS = { 'x:y/M': ['key:lesson-sheet', 'lesson-sheet'] };
    for (const [name, ls, rule, want] of cases) { const got = judge(ls, [rule], PINS).length; if (got !== want) bad.push(`${name}: ${got} finding(s), want ${want}`); }
    for (const b of bad) console.log(`  FAIL ${b}`);
    console.log(bad.length ? `${TOOL} --self-test: FAIL (${bad.length} of ${cases.length})` : `${TOOL} --self-test: OK (${cases.length} cases)`);
    return bad.length ? 1 : 0;
}

/* ------------------------------------------------------------------ the measurement (browser) */
/** In the page: a built sheet's page summaries (pupil pages, then key pages flagged `key`) and its opener. */
const SUMMARISE = `(res) => {
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:-99999px;top:0;width:210mm';
    document.body.appendChild(host);
    const FRAME = '.ws-head, .ws-header, .ws-tab, .ws-strand, .ws-ican, .ws-title, .ws-foot, .ws-footer, header, footer';
    // STEPS-PANEL-EMPTY: every element labelled exactly "Steps:" - a band's strip label (.ws-strip > b: the band is the
    // strip's parent, the strip comes off) or a strip of its own ([data-mq-lesson-strip] > b: the label comes off)
    const stepsOf = (pg) => {
        let n = 0, empty = 0;
        for (const lab of pg.querySelectorAll('b, strong, .ws-strip > *')) {
            if (lab.children.length || lab.textContent.trim() !== 'Steps:') continue;
            const strip = lab.parentElement;
            const inBand = strip && strip.classList.contains('ws-strip') && strip.parentElement;
            const panel = (inBand ? strip.parentElement : strip).cloneNode(true);
            if (inBand) [...panel.children].filter((c) => c.classList.contains('ws-strip')).forEach((c) => c.remove());
            else [...panel.children].filter((c) => c.textContent.trim() === 'Steps:').forEach((c) => c.remove());
            n++;
            if (!panel.textContent.replace(/\\s+/g, '').length) empty++;
        }
        return { steps: n, stepsEmpty: empty };
    };
    const pagesOf = (html, key) => {
        host.innerHTML = String(html || '');
        return [...host.querySelectorAll('.ws-page')].map((pg, i) => {
            const cells = pg.querySelectorAll('[data-ws-cell]').length;
            const x = pg.cloneNode(true);
            x.querySelectorAll(FRAME + ', style, script').forEach((e) => e.remove());
            const ink = x.textContent.replace(/\\s+/g, '').length + x.querySelectorAll('svg, img, canvas, [data-ws-slot], [data-ws-aslot]').length;
            return Object.assign({ cells, ink, n: i + 1, sheet: pg.getAttribute('data-ws-sheet') || '' }, stepsOf(pg), key ? { key: true } : {});
        });
    };
    const keyPages = pagesOf(res.keyHtml, true);
    const pages = pagesOf(res.pupilHtml, false);
    const c0 = host.querySelector('.ws-page [data-ws-cell]');
    let opener = null;
    if (c0) {
        const y = c0.cloneNode(true);
        y.querySelectorAll('[data-ws-slot], [data-ws-aslot]').forEach((e) => { e.textContent = ''; });
        y.querySelectorAll('.ws-modeltab, [data-ws-label], .ws-letter').forEach((e) => e.remove());
        opener = { template: c0.getAttribute('data-ws-cell') || '', text: y.textContent.replace(/\\s+/g, ' ').trim().slice(0, 240) };
    }
    host.remove();
    // (LESSON-EMPTY-FIRST judges the pupil pages; STEPS-PANEL-EMPTY both; LESSON-ROLE-SET both, by role: one key page
    // of each role is kept)
    const keyRoles = new Set();
    const keyKept = keyPages.filter((p) => { const first = !keyRoles.has(p.sheet); keyRoles.add(p.sheet); return p.steps > 0 || first; });
    return { pages: pages.concat(keyKept), opener };
}`;

async function openApp() {
    const require = createRequire(import.meta.url);
    const H = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
    return H.open({ seed: 1 });
}

/** --skills / --all-skills: the lesson master prints for each skill (ws-lesson-baseline's request) x sizes at one seed. */
async function measureSkills(skills, sizes, seed) {
    const app = await openApp();
    try {
        if (skills === 'all') skills = await app.page.evaluate(async () => Object.keys((await import(new URL('js/modules/lessons/prereqs.js', location.href).href)).LESSONS));
        const out = [];
        for (const key of skills) for (const size of sizes) {
            const [categoryId, skillId] = key.split(':');
            const r = await app.page.evaluate(async ({ categoryId, skillId, size, seed, SUM }) => {
                let res;
                try { res = await window.buildSheet({ role: 'lesson', sections: [{ skills: [{ categoryId, skillId }] }], size, paper: 'A4', seed, key: true, practicePages: 1, mixed: true }); } catch (e) { return { error: String(e && e.message || e) }; }
                return (0, eval)(SUM)(res);
            }, { categoryId, skillId, size, seed, SUM: SUMMARISE });
            const id = `${key}/${size}/${seed}`;
            out.push(Object.assign({ id, step: '', block: '', title: key, skill: key, size }, r.error ? { pages: [], error: r.error } : r));
        }
        return out;
    } finally { await app.close(); }
}

async function measure(grade, blocks, reqKind) {
    const app = await openApp();
    try {
        const list = await app.page.evaluate(async ({ grade }) => {
            const W = await import(new URL('js/modules/wrm-links.js', location.href).href);
            const LD = await import(new URL('js/modules/links-data.js', location.href).href);
            const d = await LD.loadLinksData();
            for (const y of Object.values(d.years)) W.addCuratedYear(y);
            const data = await import(new URL('js/modules/data.js', location.href).href);
            const live = (k) => { const [c, s] = String(k).split(':'); return !!(data.SKILLS[c] || []).some((x) => x && x.v === s && !x.retired && !x.tombstone); };
            return W.allLessons().filter((l) => l.type !== 'assessment' && (String(grade) === 'all' || String(l.gradeLabel || '').replace(/^Grade\s*/i, '') === String(grade))).map((l) => {
                const ds = (W.linksFor(l).direct || []).filter((x) => live(x.key)).map((x) => ({ key: x.key, opts: x.opts || {} }));
                // (the lesson's own seed and variant, as teacher-wrm.js printLesson sends them - lf-engine 2026-11-19; a tree
                // without them builds with 4242 and no variant, as the screen did)
                const own = typeof W.wrmLessonSeed === 'function' ? { seed: W.wrmLessonSeed(l), variant: W.wrmLessonVariant(l) } : { seed: 4242, variant: null };
                return ds.length ? Object.assign({ id: l.step || l.key, step: l.step || '', block: l.step ? l.step.replace(/\.S\d+$/, '') : '', title: l.title, skill: ds[0].key, skills: ds }, own) : null;
            }).filter(Boolean);
        }, { grade });
        const todo = list.filter((l) => !blocks || blocks.includes(l.block));
        const out = [];
        for (const l of todo) {
            const r = await app.page.evaluate(async ({ l, reqKind, SUM }) => {
                const sk = (reqKind === 'print' ? l.skills.slice(0, 1) : l.skills).map((d) => { const [c, s] = d.key.split(':'); return { categoryId: c, skillId: s, opts: d.opts }; });
                const req = reqKind === 'print'
                    ? { role: 'lesson', sections: [{ skills: sk }], practicePages: 1, mixed: false, size: 'M', look: 'auto', paper: 'A4',
                        header: { name: true, date: true, score: true, title: true }, key: { on: true, placement: 'end', style: 'copy' }, seed: l.seed }
                    : { role: 'lesson', sections: [{ skills: sk }], size: 'M', paper: 'A4', seed: l.seed, key: true, practicePages: 1, mixed: true };
                if (l.variant !== null && l.variant !== undefined) req.lessonVariant = l.variant;
                let res;
                try { res = await window.buildSheet(req); } catch (e) { return { error: String(e && e.message || e) }; }
                return (0, eval)(SUM)(res);
            }, { l, reqKind, SUM: SUMMARISE });
            const skill = reqKind === 'print' ? l.skill : l.skills.map((x) => x.key).join('+');
            out.push(Object.assign({ id: l.id, step: l.step, block: l.block, title: l.title, skill }, r.error ? { pages: [], error: r.error } : r));
        }
        return out;
    } finally { await app.close(); }
}

/* ------------------------------------------------------------------ main */
async function main() {
    if (has('self-test')) return selfTest();
    const blocks = arg('blocks') ? arg('blocks').split(',').map((x) => x.trim()) : null;
    let lessons;
    if (arg('fixture')) lessons = JSON.parse(fs.readFileSync(path.resolve(arg('fixture')), 'utf8')).lessons || [];
    else if (arg('skills') || has('all-skills')) lessons = await measureSkills(has('all-skills') ? 'all' : arg('skills').split(',').map((x) => x.trim()).filter(Boolean),
        (arg('sizes', 'M') || 'M').split(',').map((x) => x.trim()).filter(Boolean), Number(arg('seed', '4242')));
    else lessons = await measure(arg('grade', '3'), blocks, arg('req', 'packet'));
    if (blocks) lessons = lessons.filter((l) => blocks.includes(l.block));
    if (arg('dump')) fs.writeFileSync(path.resolve(arg('dump')), JSON.stringify({ about: `${TOOL} page summaries (grade ${arg('grade', '3')}, size M, seed 4242, request ${arg('req', 'packet')})`, lessons }, null, 1) + '\n');
    if (has('pin-roles')) console.log(JSON.stringify(Object.fromEntries(lessons.filter((l) => !l.error).map((l) => [`${l.skill}/${l.size}`, roleSet(l)])), null, 1));
    const errs = lessons.filter((l) => l.error);
    const found = judge(lessons.filter((l) => !l.error), RULES, loadPins());
    for (const e of errs) console.log(`  ERROR ${e.id} (${e.skill}): buildSheet threw: ${e.error}`);
    for (const r of RULES) {
        const f = found.filter((x) => x.rule === r);
        console.log(`  ${f.length ? 'FAIL' : 'OK  '} ${r}: ${f.length} finding(s)${f.length ? ` - ${[...new Set(f.flatMap((x) => x.ids))].join(' ')}` : ''}`);
        for (const x of f) console.log(`       ${x.msg}`);
    }
    const n = found.length + errs.length;
    const pages = lessons.reduce((s, l) => s + (l.pages || []).length, 0);
    if (n && has('warn')) { console.log(`${TOOL}: WARNING (${n} findings; blocking once lf-engine's fix lands)`); return 4; }
    console.log(n ? `${TOOL}: FAIL (${n} findings)` : `${TOOL}: OK (${lessons.length} lessons, ${pages} pages)`);
    return n && !has('report-only') ? 1 : 0;
}
main().then((c) => process.exit(c), (e) => { console.log(`${TOOL}: FAIL (${e && e.stack || e})`); process.exit(1); });
