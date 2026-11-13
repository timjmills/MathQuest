#!/usr/bin/env node
// ws-no-phone-width — no screen gate DEFAULT, critic brief or RUBRIC host holds the phone width 390 px (owner rule,
// 2026-11-13; CLAUDE.md "Fastest-implementation plan" item 7: the screens are print, computer / Chromebook 1280-1366 px and
// tablet 820-1024 px; there is no phone width; answer boxes keep 48 px touch targets for tablets).
//
// An explicit `--widths 390` / `--sizes 390x844` on a command line still runs (backtest rows that prove a phone fixture keep
// it), so only DEFAULTS are judged: what a gate renders when nobody passes a width. Read from the source, per file in FILES:
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

// the screen gates (every gate that renders a pupil screen host), the precritic planner and the deploy gates
export const FILES = [
    'tests/scripts/ws-empty-band.cjs', 'tests/scripts/ws-screen-ink-size.cjs', 'tests/scripts/ws-screen-slots.cjs',
    'tests/scripts/ws-screen-answer.cjs', 'tests/scripts/ws-phone-card.cjs', 'tests/scripts/ws-chromebook-fit.cjs',
    'tests/scripts/ws-grade-render.cjs', 'tests/scripts/ws-next-box.cjs', 'tests/scripts/ws-screen-support-eq.cjs',
    'tests/scripts/ws-vocab-unit.mjs', 'tests/scripts/ws-ldiv-hug.cjs', 'tests/scripts/ws-touchdots.cjs',
    'tests/scripts/ws-div-facts-forms.cjs', 'tests/scripts/ws-precritic.cjs', 'tests/scripts/ws-deploy-gates.sh',
];
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
    const total = cases.length + docs.length + libs.length;
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
    for (const f of FILES) {
        const p = join(root, f);
        if (!existsSync(p)) continue;
        read++;
        for (const x of readSource(readFileSync(p, 'utf8'))) findings.push({ file: f, ...x });
    }
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
    console.log(findings.length ? `${TOOL}: FAIL (${findings.length}: a phone width 390 in a gate default, brief or host; owner rule 2026-11-13)` : `${TOOL}: OK (${read} files: no 390 default; the shared widths 1280 / 1366 / 820 / 1024)`);
    process.exit(findings.length ? 1 : 0);
}
main();
