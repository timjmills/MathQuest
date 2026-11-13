// ws-no-size-s — NO SIZE S (owner rule 2026-11-13, CLAUDE.md "Fastest-implementation plan" item 9: "Two print sizes: M and
// L. Size S is dropped": no new S work, gates / critic briefs / pins drop S; an S setting or share code falls back to M).
//
// FAILS when
//   APP-PICKER   a size picker offers S: a line of js/modules (not the kit, js/modules/sheet/) or index.html that draws a
//                size control (seg('size' / segBtns('Size' / aria-label="Size" / data-sp="size" / a SIZES list) and holds
//                an option tuple that starts with 'S' (['S', ...]), or an <option value="S"> / data-size="S" in index.html;
//   APP-RESTORE  an app module restores a stored size with ['S', 'M', 'L'].includes(...) (that keeps a stored S as S; read it
//                through the kit's offeredSize(), which maps S to M);
//   APP-ALIAS    the kit (js/modules/sheet/tokens.js) has no offeredSize() that reads S as M and keeps M / L, or no
//                OFFERED_SIZES of exactly M and L (S must DECODE as an alias of M, never be deleted);
//   GATE-DEFAULT a gate's DEFAULT run includes S: in tests/scripts/*.{cjs,mjs,js,sh} and tests/lib/*: an arg('size(s)', '<list>')
//                or arg('sizes') || '<list>' default with S in it, a literal size list (['S', 'M', 'L'], ['L', 'S'], ...) that
//                is not a validator (.includes / .indexOf right after it), a '--size(s)', '<list with S>' argument pair, or a
//                shell line passing --size(s) with S.
// Comment lines are not read (usage text may still show an explicit `--sizes S`, which every gate still accepts: old backtest
// rows that name S stay runnable). Each line that keeps S on purpose is on ALLOW below, with its reason; an ALLOW entry that
// matches nothing FAILS too (a stale exemption).
//
//   node tests/scripts/ws-no-size-s.mjs                 # this tree
//   node tests/scripts/ws-no-size-s.mjs --root <dir>    # another checkout (ws-backtest commit-pair rows); MQ_ROOT works too
//   node tests/scripts/ws-no-size-s.mjs --self-test     # the line rules on planted text
//
// Last line `ws-no-size-s: OK (...)` / `ws-no-size-s: FAIL - n finding(s)`; exit 1 on FAIL, 2 when the tree cannot be read.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOL = 'ws-no-size-s';
const args = process.argv.slice(2);
const at = args.indexOf('--root');
const ROOT = resolve(at >= 0 && args[at + 1] ? args[at + 1] : process.env.MQ_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..', '..'));

/** Lines that keep S on purpose: {file (root-relative), has (a substring of the line), why}. */
export const ALLOW = [
    // the kit bridge: an EXPLICIT S request (old backtest rows, `--size S` on a gate) still renders the kit's S token, and the
    // "All 12 tables on one page" option forces it internally; every APP entry point maps a stored S to M before calling it
    { file: 'js/modules/print-sheet.js', has: "const size = ['S', 'M', 'L'].includes(req.size) ? req.size : 'L';", why: 'buildSheet, the kit bridge: explicit S (old backtest rows, --size S) still renders; the app never sends S (offeredSize at every entry point)' },
    // ws-print-lint: reads the size a printed page DECLARES (data-ws-size / ws-S class) - a reader, not a default
    { file: 'tests/scripts/ws-print-lint.cjs', has: "['S', 'M', 'L'].find(s => pg.classList.contains('ws-' + s))", why: 'reads the size class a rendered page carries (the one-page 12-tables option still prints at the kit S token)' },
    // kit unit tests: they test the kit's size TOKENS themselves (S is kept so old settings decode, and the one-page 12-tables
    // option still prints at it); they are not page renders of a skill at a size
    { file: 'tests/scripts/ws-layout-unit.mjs', has: "const SIZES = ['S', 'M', 'L'];", why: 'kit unit test of the S/M/L tokens (S kept as the decode alias and the one-page 12-tables size)' },
    { file: 'tests/scripts/ws-layout-unit.mjs', has: "for (const size of ['S', 'M', 'L'])", why: 'kit unit test of the S/M/L tokens' },
    { file: 'tests/scripts/ws-layout-unit.mjs', has: "for (const sz of ['S', 'M', 'L'])", why: 'kit unit test of the S/M/L tokens' },
    { file: 'tests/scripts/ws-panes-unit.mjs', has: "for (const size of ['S', 'M', 'L'])", why: 'kit unit test: panes at every size token' },
    { file: 'tests/scripts/ws-roles-unit.mjs', has: "for (const size of ['S', 'M', 'L'])", why: 'kit unit test: role composers at every size token' },
    { file: 'tests/scripts/ws-vocab-unit.mjs', has: "for (const size of ['S', 'M', 'L'])", why: 'kit unit test: vocabulary cells at every size token' },
    { file: 'tests/scripts/ws-envelope.mjs', has: "size: { values: ['S', 'M', 'L'], dflt: 'M' }", why: 'the envelope model of the kit request: S still DECODES (alias of M), so the envelope keeps it as a value' },
    { file: 'tests/scripts/ws-envelope.mjs', has: "const dims = { size: ['S', 'M', 'L']", why: 'envelope self-test dimensions over the decodable sizes' },
    { file: 'tests/scripts/ws-envelope.mjs', has: "const kd = { size: ['S', 'M', 'L']", why: 'envelope self-test dimensions over the decodable sizes' },
    { file: 'tests/scripts/ws-envelope.mjs', has: "size: ['S', 'M']", why: 'allPairs / critic-sampler self-tests: S and M are two abstract values of a dimension, no page is printed' },
    { file: 'tests/scripts/ws-lesson-unit.mjs', has: "warmRows, ['S', 'M']", why: "lesson DATA (addsub.js warmRows: the sizes a Warm-up row prints at) read back by the unit test, not a size run" },
    { file: 'tests/scripts/ws-vocab-unit.mjs', has: "for (const size of ['S', 'L'])", why: 'V20 is the S-vs-L rule itself (row vocab-v20-ea-s-height): it measures the kept kit S token against L' },
    // dated lane scripts on NO gate path (not planned by ws-precritic, not in ws-deploy-gates.sh, no backtest row): records of a
    // past lane's checks against the kit's S token, kept as written; a lane that revives one moves it to M / L first
    ...['ws-div-facts-forms.cjs', 'wave1-c2-dupes.cjs', 'wave1-c2-lines.cjs', 'wave1-c2-model.cjs', 'wave1-c2-sizes.cjs', 'key-options.cjs',
        'support-numberline.cjs', 'small-fixes-model-pages.cjs', 'ws-key-letters.cjs'].map((f) => ({ file: `tests/scripts/${f}`, has: '*', why: 'not a gate: on neither ws-precritic\'s nor ws-deploy-gates\' path and in no backtest row (a dated lane script)' })),
];

const SIZE_ARRAY = /\[\s*(['"])[SML]\1(?:\s*,\s*(['"])[SML]\2)*\s*\]/g;
const isComment = (line) => /^\s*(\/\/|\*|\/\*|#)/.test(line);

/** APP lines: [{rule, msg}] for one line of an app file (not js/modules/sheet/). Pure. */
export function appLineFindings(line, file) {
    const out = [];
    if (isComment(line)) return out;
    if (file.endsWith('index.html')) {
        if (/<option[^>]*value=["']S["']/.test(line) && /size/i.test(line)) out.push({ rule: 'APP-PICKER', msg: 'an <option value="S"> in a size select' });
        if (/data-size=["']S["']/.test(line)) out.push({ rule: 'APP-PICKER', msg: 'a data-size="S" control' });
        return out;
    }
    const picker = /seg(?:Btns)?\(\s*['"][Ss]ize['"]|aria-label="Size"|data-sp="size"|\bSIZES\s*=\s*\[/.test(line);
    if (picker && /\[\s*['"]S['"]\s*,/.test(line)) out.push({ rule: 'APP-PICKER', msg: 'a size picker offers S' });
    if (/\[\s*['"]S['"]\s*,\s*['"]M['"]\s*,\s*['"]L['"]\s*\]\.includes\(/.test(line)) out.push({ rule: 'APP-RESTORE', msg: "a stored size kept as S (['S','M','L'].includes): read it through offeredSize()" });
    return out;
}

/** GATE lines: [{rule, msg}] for one line of a gate script. Pure. */
export function gateLineFindings(line, file) {
    const out = [];
    if (isComment(line)) return out;
    const hasS = (list) => String(list).split(',').map((x) => x.trim()).includes('S');
    if (file.endsWith('.sh')) {
        const m = /--sizes?[ =]([A-Z,]+)/.exec(line);
        if (m && hasS(m[1])) out.push({ rule: 'GATE-DEFAULT', msg: `a deploy gate runs --size(s) ${m[1]}` });
        return out;
    }
    for (const m of line.matchAll(/arg\(\s*['"]sizes?['"]\s*(?:,\s*['"]([^'"]*)['"])?\s*\)\s*\)?\s*(?:\|\|\s*['"]([^'"]*)['"])?/g)) {
        const d = m[1] != null ? m[1] : m[2];
        if (d != null && hasS(d)) out.push({ rule: 'GATE-DEFAULT', msg: `the --size(s) default is ${d}` });
    }
    for (const m of line.matchAll(/['"]--sizes?['"]\s*,\s*['"]([^'"]*)['"]/g)) if (hasS(m[1])) out.push({ rule: 'GATE-DEFAULT', msg: `a planned run passes --size(s) ${m[1]}` });
    for (const m of line.matchAll(SIZE_ARRAY)) {
        if (!/['"]S['"]/.test(m[0])) continue;
        const after = line.slice(m.index + m[0].length);
        if (/^\s*\.(includes|indexOf)\(/.test(after)) continue;   // a validator: an explicit S is still accepted
        if (/\.includes\(\s*['"]S['"]\s*\)\s*\?/.test(line.slice(0, m.index))) continue;   // the explicit-S branch (`--sizes S,..` asked)
        out.push({ rule: 'GATE-DEFAULT', msg: `a size list with S: ${m[0]}` });
    }
    return out;
}

function walk(dir, keep, acc = []) {
    if (!existsSync(dir)) return acc;
    for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        const st = statSync(p);
        if (st.isDirectory()) continue;   // top level only (tests/scripts/wrm-tagging holds tagging tools, not gates)
        if (keep(n)) acc.push(p);
    }
    return acc;
}
function walkDeep(dir, keep, acc = []) {
    if (!existsSync(dir)) return acc;
    for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        if (statSync(p).isDirectory()) { if (!/^(sheet|node_modules)$/.test(n)) walkDeep(p, keep, acc); continue; }
        if (keep(n)) acc.push(p);
    }
    return acc;
}

async function aliasFindings() {
    const f = join(ROOT, 'js/modules/sheet/tokens.js');
    if (!existsSync(f)) return [{ file: 'js/modules/sheet/tokens.js', line: 0, rule: 'APP-ALIAS', msg: 'no kit tokens file' }];
    let m;
    try { m = await import(pathToFileURL(f).href + `?t=${Date.now()}`); } catch (e) { return [{ file: 'js/modules/sheet/tokens.js', line: 0, rule: 'APP-ALIAS', msg: `cannot import: ${String(e && e.message).slice(0, 120)}` }]; }
    const out = [];
    const bad = (msg) => out.push({ file: 'js/modules/sheet/tokens.js', line: 0, rule: 'APP-ALIAS', msg });
    if (typeof m.offeredSize !== 'function') bad('no offeredSize(): a stored S has no alias to M');
    else {
        const cases = [['S', 'M'], ['s', 'M'], ['M', 'M'], ['L', 'L']];
        for (const [v, want] of cases) if (m.offeredSize(v, 'L') !== want) bad(`offeredSize('${v}') is ${m.offeredSize(v, 'L')}, not ${want}`);
    }
    if (!Array.isArray(m.OFFERED_SIZES) || m.OFFERED_SIZES.join(',') !== 'M,L') bad(`OFFERED_SIZES is ${JSON.stringify(m.OFFERED_SIZES)}, not ["M","L"]`);
    if (!Array.isArray(m.SIZE_IDS) || !m.SIZE_IDS.includes('S')) bad('the kit S token is gone: an old S setting no longer decodes');
    return out;
}

function selfTest() {
    const cases = [
        ['app', "seg('size', pr.size, [['S', 'S', 'Small'], ['M', 'M', 'Medium'], ['L', 'L', 'Large']], 'Size')", 'js/modules/x.js', ['APP-PICKER']],
        ['app', "seg('size', pr.size, [['M', 'M', 'Medium'], ['L', 'L', 'Large']], 'Size')", 'js/modules/x.js', []],
        ['app', "const SIZES = [['L', 'Big'], ['M', 'Medium'], ['S', 'Small']];", 'js/modules/x.js', ['APP-PICKER']],
        ['app', "const SIZES = [['big', 'Big'], ['medium', 'Medium'], ['small', 'Small']];", 'js/modules/x.js', []],
        ['app', "size: ['S', 'M', 'L'].includes(d.size) ? d.size : 'L',", 'js/modules/x.js', ['APP-RESTORE']],
        ['app', "const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];", 'js/modules/x.js', []],
        ['app', '<select id="sz"><option value="S">Small size</option>', 'index.html', ['APP-PICKER']],
        ['gate', "const SIZES = list(arg('sizes', 'S,M,L'));", 'tests/scripts/x.cjs', ['GATE-DEFAULT']],
        ['gate', "const SIZES = list(arg('sizes', 'M,L'));", 'tests/scripts/x.cjs', []],
        ['gate', "const SIZES = (arg('sizes') || 'L,S').split(',');", 'tests/scripts/x.cjs', ['GATE-DEFAULT']],
        ['gate', "for (const size of ['S', 'M', 'L']) {", 'tests/scripts/x.cjs', ['GATE-DEFAULT']],
        ['gate', "for (const size of ['M', 'L']) {", 'tests/scripts/x.cjs', []],
        ['gate', "const SML = SIZES.includes('S') ? ['S', 'M', 'L'] : ['M', 'L'];", 'tests/scripts/x.cjs', []],
        ['gate', "if (sizes.some((z) => !['S', 'M', 'L'].includes(z))) {", 'tests/scripts/x.cjs', []],
        ['gate', "['--skills', k, '--size', 'S,M,L', '--gate']", 'tests/scripts/x.cjs', ['GATE-DEFAULT']],
        ['gate', "//   node x.cjs --sizes S,M", 'tests/scripts/x.cjs', []],
        ['gate', '  browser_gate 4 "x" ws-lesson-baseline.cjs --all-lessons --sizes L,S --seeds 1', 'tests/scripts/x.sh', ['GATE-DEFAULT']],
        ['gate', '  browser_gate 4 "x" ws-lesson-baseline.cjs --all-lessons --sizes L --seeds 1', 'tests/scripts/x.sh', []],
    ];
    const bad = [];
    for (const [kind, line, file, want] of cases) {
        const got = (kind === 'app' ? appLineFindings(line, file) : gateLineFindings(line, file)).map((x) => x.rule);
        const ok = JSON.stringify(got) === JSON.stringify(want);
        if (!ok) bad.push(line);
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${kind} ${JSON.stringify(line).slice(0, 90)} -> ${got.join(',') || 'clean'}`);
    }
    console.log(bad.length ? `${TOOL}: FAIL - self-test (${bad.length})` : `${TOOL}: OK (self-test, ${cases.length} lines)`);
    process.exit(bad.length ? 1 : 0);
}

async function main() {
    if (args.includes('--self-test')) return selfTest();
    if (!existsSync(join(ROOT, 'js/modules'))) { console.log(`${TOOL}: FAIL - cannot read the tree at ${ROOT}`); process.exit(2); }
    const findings = [];
    const used = new Set();
    const scan = (abs, fn) => {
        const file = relative(ROOT, abs).split('\\').join('/');
        const lines = readFileSync(abs, 'utf8').split('\n');
        lines.forEach((line, i) => {
            for (const f of fn(line, file)) {
                const a = ALLOW.findIndex((x) => x.file === file && (x.has === '*' || line.includes(x.has)));
                if (a >= 0) { used.add(a); continue; }
                findings.push({ file, line: i + 1, rule: f.rule, msg: f.msg });
            }
        });
    };
    const appFiles = walkDeep(join(ROOT, 'js/modules'), (n) => n.endsWith('.js') && !/-db\.js$/.test(n));
    for (const f of appFiles) scan(f, appLineFindings);
    if (existsSync(join(ROOT, 'index.html'))) scan(join(ROOT, 'index.html'), appLineFindings);
    const gateFiles = [...walk(join(ROOT, 'tests/scripts'), (n) => /\.(cjs|mjs|js|sh)$/.test(n) && n !== 'ws-no-size-s.mjs'), ...walk(join(ROOT, 'tests/lib'), (n) => /\.(cjs|mjs|js)$/.test(n))];
    for (const f of gateFiles) scan(f, gateLineFindings);
    findings.push(...await aliasFindings());
    // a stale exemption (its line is gone or no longer offends) fails too - only judged on a tree that has this tool's era
    // (the alias exists), so an old checkout reports its real findings, not ALLOW drift
    const era = findings.every((f) => f.rule !== 'APP-ALIAS');
    if (era) ALLOW.forEach((x, i) => { if (!used.has(i)) findings.push({ file: x.file, line: 0, rule: 'ALLOW-STALE', msg: `allow-list entry matches nothing: ${x.has.slice(0, 70)}` }); });
    const by = {};
    for (const f of findings) (by[f.rule] = by[f.rule] || []).push(f);
    for (const [rule, fs] of Object.entries(by)) {
        console.log(`  ${rule}: ${fs.length}`);
        for (const f of fs.slice(0, process.env.NOSS_ALL ? 1e9 : 25)) console.log(`    ${f.file}:${f.line} ${f.msg}`);
        if (fs.length > 25) console.log(`    ... ${fs.length - 25} more`);
    }
    console.log(findings.length
        ? `${TOOL}: FAIL - ${findings.length} finding(s): ${Object.entries(by).map(([r, f]) => `${r} ${f.length}`).join(', ')}`
        : `${TOOL}: OK (${appFiles.length + 1} app files, ${gateFiles.length} gate files: no picker offers S, no gate default runs S; ${used.size} reasoned exemption(s))`);
    process.exit(findings.length ? 1 : 0);
}
main();
