#!/usr/bin/env node
// ws-no-phone-width — no screen gate DEFAULT, critic brief or RUBRIC host holds the phone width 390 px (owner rule,
// 2026-11-13; CLAUDE.md "Fastest-implementation plan" item 7: the screens are print, computer / Chromebook 1280-1366 px and
// tablet 820-1024 px; there is no phone width; answer boxes keep 48 px touch targets for tablets).
//
// An explicit `--widths 390` / `--sizes 390x844` on a command line still runs (backtest rows that prove a phone fixture keep
// it), so only DEFAULTS are judged: what a gate renders when nobody passes a width. Read from the source, per file of scanList()
// (every script precritic / the deploy gates / the opt-in rules name, plus EXTRA; ALLOW lists exceptions with reasons):
//   NP-ARRAY    a numeric width list holding 390 (`[390, 820, 1280]`, `[[1280, 900], [390, 844]]`, `[390, 1280]`)
//   NP-ARGDEF   an argument default naming 390 (`arg('sizes', '390x844,390x664')`, `arg('widths', '390,...')`)
//   NP-VIEWPORT a fixed viewport at 390 (`width: 390`, `{ w: 390 ...}`)
//   NP-HOST     a host label at 390 in code (`'card-390'`, `card-390, worksheet-1280` in a gate's scope text)
//   NP-LIB      tests/lib/ws-screen-widths.cjs SCREEN_WIDTHS is exactly 1280, 1366, 820, 1024, its TABLET_WIDTHS 820, 1024
//               and its DIGIT_FLOOR 56 / 56 / 48 / 48 (the SP table: 1366 takes the 1280 floor, 1024 the 820 floor)
//   NP-DOC      the RUBRIC "Practice card" host row, its touch-target lines and the critic brief template name no 390 / phone
// Comment lines (// or *) are not code: a header saying "--widths 390 still runs on request" is not a default.
//
//   node tests/scripts/ws-no-phone-width.mjs                 # this tree: ws-no-phone-width: OK | FAIL (n)
//   node tests/scripts/ws-no-phone-width.mjs --root <dir>    # another checkout (the backtest: FAIL on 91182e61, OK after)
//   node tests/scripts/ws-no-phone-width.mjs --self-test     # the readers on planted lines, no files
// Exit 1 on FAIL, 2 on usage. Node only, about 0.1 s.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOL = 'ws-no-phone-width';
const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };

// WHICH FILES (critic lf-tools r1 A2: a hand-kept list let a new screen gate with a 390 default pass): EVERY script that
// ws-precritic, ws-deploy-gates.sh or precritic's opt-in rules name (derived: each `ws-<name>` token in those three files
// that is a tests/scripts/<name>.cjs|.mjs|.sh), plus the screen gates in EXTRA (the per-skill gates that backtests and lanes
// call by hand). A file in ALLOW is read but its findings are reported as allowed, each with its reason.
export const PLAN_SOURCES = ['tests/scripts/ws-precritic.cjs', 'tests/scripts/ws-deploy-gates.sh', 'tests/fixtures/precritic/opt-in-rules.json'];
export const EXTRA = [
    'tests/scripts/ws-empty-band.cjs', 'tests/scripts/ws-screen-ink-size.cjs', 'tests/scripts/ws-screen-slots.cjs',
    'tests/scripts/ws-screen-answer.cjs', 'tests/scripts/ws-phone-card.cjs', 'tests/scripts/ws-chromebook-fit.cjs',
    'tests/scripts/ws-grade-render.cjs', 'tests/scripts/ws-next-box.cjs', 'tests/scripts/ws-screen-support-eq.cjs',
    'tests/scripts/ws-vocab-unit.mjs', 'tests/scripts/ws-ldiv-hug.cjs', 'tests/scripts/ws-touchdots.cjs',
    'tests/scripts/ws-div-facts-forms.cjs', 'tests/scripts/ws-precritic.cjs', 'tests/scripts/ws-deploy-gates.sh',
];
const TEACHER_PHONE = 'a TEACHER screen test: its 390 px steps check the teacher\'s own phone layout on purpose (touch, slide-over, no sideways scroll); no pupil screen host is rendered at 390. The owner rule 2026-11-13 names pupil screens; dropping a teacher phone check is an owner / lead call (lf-tools no-phone-width status, "Not changed")';
export const ALLOW = {
    'tests/scripts/ws-no-phone-width.mjs': 'this check: its self-test plants 390 lines on purpose',
    'tests/scripts/ws-teacher-wrm.cjs': TEACHER_PHONE,
    'tests/scripts/ws-teacher-shell.cjs': TEACHER_PHONE,
    'tests/scripts/ws-teacher-library.cjs': TEACHER_PHONE,
    'tests/scripts/ws-teacher-preview.cjs': TEACHER_PHONE,
    'tests/scripts/ws-pdf-preview.cjs': TEACHER_PHONE + ' (the teacher PDF preview)',
    'tests/scripts/ws-simple-print.cjs': TEACHER_PHONE + ' (the teacher print dialog)',
    'tests/scripts/ws-partopts-shots.cjs': TEACHER_PHONE + ' (the teacher lesson-parts panel #tvPartsWide; lead 2026-11-13 at the lf-tools deploy)',
    // critic lf-tools r2 D2: its pupil steps (the Quick Start grid shot, the Direct Play landing and twelve practice-card
    // answers) ran at 390 under this allow; they now run at 1024 x 768. Only the teacher steps keep 390.
    'tests/scripts/ws-share-options.cjs': 'its 390 px lines are TEACHER steps only (the teacher Sets screen and the Mixed Settings dialog, SHOTS screenshots of the teacher\'s own phone layout); its pupil steps run at 1280 and 1024 x 768 (critic lf-tools r2 D2 moved them off 390). Dropping a teacher phone check is an owner / lead call',
};
/** The files to scan, from the plan sources' texts ({file: text}) and the files that exist (exists(path) -> bool). Pure. */
export function scanList(sources, exists) {
    const out = [];
    const add = (f) => { if (!out.includes(f)) out.push(f); };
    for (const text of Object.values(sources)) for (const m of String(text).matchAll(/\bws-[a-z0-9]+(?:-[a-z0-9]+)*/g)) {
        for (const ext of ['.cjs', '.mjs', '.sh']) { const f = `tests/scripts/${m[0]}${ext}`; if (exists(f)) add(f); }
    }
    for (const f of EXTRA) if (exists(f)) add(f);
    return out;
}
export const DOCS = ['design/audit/RUBRIC.md', 'design/lessons-first/briefs/README.md'];

const isComment = (l) => /^\s*(\/\/|\*|\/\*|#(?!!))/.test(l);
/** Findings [{rule, line, text}] on one source text. Pure. */
export function readSource(text) {
    const out = [];
    String(text).split('\n').forEach((l, i) => {
        if (isComment(l)) return;
        const code = l.replace(/\s\/\/\s.*$/, '');          // a trailing comment is not code either
        const hit = (rule) => out.push({ rule, line: i + 1, text: l.trim().slice(0, 140) });
        // a list of numbers (or of [w, h] pairs) holding 390
        for (const m of code.matchAll(/\[(\s*(?:\[\s*\d+\s*,\s*\d+(?:\s*,\s*\w+)?\s*\]|\d+)(?:\s*,\s*(?:\[\s*\d+\s*,\s*\d+(?:\s*,\s*\w+)?\s*\]|\d+))*\s*)\]/g)) {
            if (/(^|[\[\s,])390\b/.test(m[1])) { hit('NP-ARRAY'); break; }
        }
        if (/\barg\(\s*['"](?:sizes|widths|viewport|hosts)['"]\s*,\s*['"][^'"]*(?<!\d)390(?!\d)/.test(code)) hit('NP-ARGDEF');
        if (/\b(?:width|w)\s*:\s*390\b/.test(code)) hit('NP-VIEWPORT');
        if (/['"`][^'"`]*\bcard-390\b[^'"`]*['"`]/.test(code) && !/\$\{/.test(code.match(/['"`][^'"`]*\bcard-390\b[^'"`]*['"`]/)[0])) hit('NP-HOST');
    });
    return out;
}
/**
 * NP-PUPIL (critic lf-tools r2 D2): ALLOW is per file, so a pupil step at 390 inside a teacher-allowed file passed unseen
 * (ws-share-options played twelve pupil practice-card questions at 390 under "no pupil screen host"). In an allowed file, a
 * 390 finding whose line or the 6 lines above it name a pupil is NOT allowed. -> the findings that stay. Pure.
 */
export function pupilInAllowed(text, xs) {
    const lines = String(text).split('\n');
    return xs.filter((x) => /\b(pupil|student)s?\b/i.test(lines.slice(Math.max(0, x.line - 7), x.line).join('\n'))).map((x) => ({ ...x, rule: 'NP-PUPIL', text: `a pupil step at 390 in a teacher-allowed file: ${x.text}` }));
}
/** Findings on a doc: the RUBRIC host row / touch lines and the brief template. Pure. */
export function readDoc(name, text) {
    const out = [];
    String(text).split('\n').forEach((l, i) => {
        const hit = (why) => out.push({ rule: 'NP-DOC', line: i + 1, text: `${why}: ${l.trim().slice(0, 120)}` });
        if (/^\|\s*Practice card/.test(l) && /\b390\b|phone/i.test(l)) hit('the RUBRIC practice-card host row names a phone width');
        if (/touch target/i.test(l) && /\bphone\b/i.test(l)) hit('a touch-target rule names the phone');
        if (/\b390\b/.test(l) && !/no phone width|do not render, grade or cite 390/i.test(l) && /RUBRIC|README/.test(name)) hit('390 named outside the no-phone rule');
    });
    return out;
}
/** NP-LIB on the loaded widths module. Pure. */
export function readLib(lib) {
    const out = [];
    const same = (a, b) => JSON.stringify([...(a || [])]) === JSON.stringify(b);
    if (!lib) return [{ rule: 'NP-LIB', line: 0, text: 'tests/lib/ws-screen-widths.cjs is missing (the shared default widths)' }];
    if (!same(lib.SCREEN_WIDTHS, [1280, 1366, 820, 1024])) out.push({ rule: 'NP-LIB', line: 0, text: `SCREEN_WIDTHS ${JSON.stringify(lib.SCREEN_WIDTHS)}, want [1280,1366,820,1024]` });
    if (!same(lib.TABLET_WIDTHS, [820, 1024])) out.push({ rule: 'NP-LIB', line: 0, text: `TABLET_WIDTHS ${JSON.stringify(lib.TABLET_WIDTHS)}, want [820,1024]` });
    const f = lib.DIGIT_FLOOR || {};
    if (f[1280] !== 56 || f[1366] !== 56 || f[820] !== 48 || f[1024] !== 48) out.push({ rule: 'NP-LIB', line: 0, text: `DIGIT_FLOOR ${JSON.stringify(f)}, want 1280/1366: 56, 820/1024: 48` });
    return out;
}

function selfTest() {
    const cases = [
        ['empty-band card list (91182e61)', "            const widths = { card: [390, 820, 1280], worksheet: [1280], quiz: [1280] };", ['NP-ARRAY']],
        ['grade-render host pairs (91182e61)', '    const HOSTS = [[1280, 900], [820, 1180], [390, 844], ...(CHROMEBOOK ? [[1366, 768, true]] : [])];', ['NP-ARRAY']],
        ['phone-card sizes default (91182e61)', "    const sizes = String(arg('sizes', '390x844,390x664')).split(',')", ['NP-ARGDEF']],
        ['screen-slots digit viewports (91182e61)', 'const DIGIT_VIEWPORTS = [{ w: 1280, h: 900, px: 56 }, { w: 820, h: 1180, px: 48 }, { w: 390, h: 844, px: 40 }];', ['NP-VIEWPORT']],
        ['next-box host (91182e61)', "        ['card-390', '#questionCard', 390, async (c, k) => page.evaluate((c, k) => {", ['NP-HOST']],
        ['a [390, 1280] loop', '            for (const w of [390, 1280]) {', ['NP-ARRAY']],
        ['viewport at 390', '    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });', ['NP-VIEWPORT']],
        ['the new defaults', "            const widths = { card: SW.widthsArg(process.argv), worksheet: [1280], quiz: [1280] };", []],
        ['a header comment', '// the practice card at 1280, 1366, 820, 1024 (--widths 390 still runs on request; was card-390)', []],
        ['a trailing comment', '            for (const w of [820, 1280]) { // owner 2026-11-13: no phone width (was [390, 1280])', []],
        ['the floor table (390 known, not a default)', 'const DIGIT_FLOORS = { 1280: { h: 900, px: 56 }, 390: { h: 844, px: 40 } };', []],
        ['1390 is not 390', '    const xs = [1390, 820];', []],
        ['a self-test fixture call', '        if ((await touchAt(390, 45)).length) fails.push(x);', []],
    ];
    const bad = [];
    for (const [name, line, want] of cases) {
        const got = readSource(line).map((f) => f.rule);
        if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${name}: ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
    }
    const docs = [
        ['RUBRIC host row with 390 phone (91182e61)', '| Practice card (the single-question game card) | 1280 desktop, 820 tablet, 390 phone |', 1],
        ['RUBRIC touch line with phone (91182e61)', '- Touch targets ≥ 44 × 44 px on tablet and phone; digit inputs ≥ 48 px tall.', 1],
        ['RUBRIC host row now', '| Practice card (the single-question game card) | 1280 computer, 1366 × 768 Chromebook, 820 tablet, 1024 tablet |', 0],
        ['the brief rule itself', '> worksheet at 1280 and the quiz at 1280. There is no phone width: do not render, grade or cite 390 px.', 0],
    ];
    for (const [name, line, n] of docs) { const got = readDoc('design/audit/RUBRIC.md', line).length; if ((got > 0) !== (n > 0)) bad.push(`${name}: ${got} finding(s), want ${n ? '>= 1' : 0}`); }
    const libs = [['the lib as built', { SCREEN_WIDTHS: [1280, 1366, 820, 1024], TABLET_WIDTHS: [820, 1024], DIGIT_FLOOR: { 1280: 56, 1366: 56, 820: 48, 1024: 48 } }, 0],
        ['a lib with 390 back', { SCREEN_WIDTHS: [1280, 820, 390], TABLET_WIDTHS: [820, 1024], DIGIT_FLOOR: { 1280: 56, 1366: 56, 820: 48, 1024: 48 } }, 1],
        ['a lib missing', null, 1]];
    for (const [name, lib, n] of libs) { const got = readLib(lib).length; if (got !== n) bad.push(`${name}: ${got} finding(s), want ${n}`); }
    // A2 (critic lf-tools r1): the list is DERIVED - a gate precritic names is scanned without editing this file
    const fake = new Set(['tests/scripts/ws-new-gate.cjs', 'tests/scripts/ws-deploy-only.mjs', 'tests/scripts/ws-teacher-wrm.cjs', 'tests/scripts/ws-grade-render.cjs']);
    const lst = scanList({ p: "add(gate('new', 'ws-new-gate --skills', scope, 'browser', 'ws-new-gate', []))", d: 'browser_gate 1 ws-deploy-only ws-deploy-only.mjs\nbrowser_gate 1 ws-teacher-wrm ws-teacher-wrm.cjs', o: '{"tool": "ws-not-a-file"}' }, (f) => fake.has(f));
    const scan = [
        ['a precritic gate is scanned (hand list at f3ae7acca missed it)', lst.includes('tests/scripts/ws-new-gate.cjs'), true],
        ['a deploy gate is scanned', lst.includes('tests/scripts/ws-deploy-only.mjs'), true],
        ['a name with no file is not', lst.some((f) => /not-a-file/.test(f)), false],
        ['EXTRA screen gates stay scanned', lst.includes('tests/scripts/ws-grade-render.cjs'), true],
        ['a teacher phone test is allow-listed with a reason', typeof ALLOW['tests/scripts/ws-teacher-wrm.cjs'] === 'string' && ALLOW['tests/scripts/ws-teacher-wrm.cjs'].length > 40, true],
        ['the pupil explorer is NOT allow-listed (it is a pupil screen)', 'tests/scripts/ws-student-explorer.cjs' in ALLOW, false],
    ];
    // r2 D2: a pupil step at 390 inside a teacher-allowed file is a finding (fac8e03a0's ws-share-options pupil 3)
    const shareOld = "    // ---- pupil 3: the Direct Play link through the landing modal ----\n    const dPath = '/x';\n    const p3 = await open({ pagePath: dPath, viewport: { width: 390, height: 844, deviceScaleFactor: 1 } });";
    const teacherOnly = "    // ---- teacher builds the set ----\n    if (SHOTS) {\n        await tp.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });";
    scan.push(['D2 a pupil 390 step in an allowed file is NP-PUPIL', pupilInAllowed(shareOld, readSource(shareOld)).map((x) => x.rule).join(), 'NP-PUPIL']);
    scan.push(['D2 a teacher 390 step stays allowed', pupilInAllowed(teacherOnly, readSource(teacherOnly)).length, 0]);
    for (const [name, got, want] of scan) if (got !== want) bad.push(`${name}: ${got}, want ${want}`);
    const total = cases.length + docs.length + libs.length + scan.length;
    for (const b of bad) console.log(`  FAIL ${b}`);
    console.log(bad.length ? `${TOOL}: FAIL (self-test, ${bad.length} of ${total})` : `${TOOL}: OK (self-test, ${total} cases)`);
    process.exit(bad.length ? 1 : 0);
}

function main() {
    if (argv.includes('--self-test')) return selfTest();
    const root = resolve(arg('root', HERE));
    if (!existsSync(join(root, 'tests', 'scripts'))) { console.log(`${TOOL}: --root ${root} is not a MathQuest checkout`); console.log(`${TOOL}: FAIL (usage)`); process.exit(2); }
    const findings = [];
    let read = 0;
    const sources = {};
    for (const f of PLAN_SOURCES) if (existsSync(join(root, f))) sources[f] = readFileSync(join(root, f), 'utf8');
    const files = scanList(sources, (f) => existsSync(join(root, f)));
    const allowed = [];
    for (const f of files) {
        read++;
        const text = readFileSync(join(root, f), 'utf8');
        const xs = readSource(text);
        if (ALLOW[f]) {
            const pup = f === 'tests/scripts/ws-no-phone-width.mjs' ? [] : pupilInAllowed(text, xs);
            for (const x of pup) findings.push({ file: f, ...x });
            if (xs.length > pup.length) allowed.push(`${f} (${xs.length - pup.length} line(s)): ${ALLOW[f]}`);
            continue;
        }
        for (const x of xs) findings.push({ file: f, ...x });
    }
    for (const a of allowed) console.log(`  allowed  ${a}`);
    for (const f of DOCS) {
        const p = join(root, f);
        if (!existsSync(p)) continue;
        read++;
        for (const x of readDoc(f, readFileSync(p, 'utf8'))) findings.push({ file: f, ...x });
    }
    let lib = null;
    const lp = join(root, 'tests', 'lib', 'ws-screen-widths.cjs');
    if (existsSync(lp)) { try { lib = createRequire(import.meta.url)(lp); } catch (e) { lib = null; } }
    for (const x of readLib(lib)) findings.push({ file: 'tests/lib/ws-screen-widths.cjs', ...x });
    for (const x of findings) console.log(`  ${x.rule.padEnd(11)} ${x.file}${x.line ? `:${x.line}` : ''}  ${x.text}`);
    if (!read) { console.log(`${TOOL}: FAIL (no gate file read under ${root})`); process.exit(1); }
    console.log(findings.length ? `${TOOL}: FAIL (${findings.length}: a phone width 390 in a gate default, brief or host; owner rule 2026-11-13)` : `${TOOL}: OK (${read} files, ${files.length} scripts derived from ${Object.keys(sources).length} plan sources: no 390 default${allowed.length ? `; ${allowed.length} allow-listed with a reason` : ''}; the shared widths 1280 / 1366 / 820 / 1024)`);
    process.exit(findings.length ? 1 : 0);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
