// ws-no-size-s — NO SIZE S (owner rule 2026-11-13, CLAUDE.md "Fastest-implementation plan" item 9: "Two print sizes: M and
// L. Size S is dropped": no new S work, gates / critic briefs / pins drop S; an S setting or share code falls back to M).
//
// FAILS when
//   APP-PICKER   a size picker offers S: a line of js/modules (not the kit, js/modules/sheet/) or index.html that draws a
//                size control (seg('size' / segBtns('Size' / aria-label="Size" / data-sp="size" / a SIZES list) and holds
//                an option tuple that starts with 'S' (['S', ...]), or an <option value="S"> / data-size="S" in index.html;
//   APP-PICKER   (broadened, critic nos r1 F2) ANY option tuple of size words that starts with 'S' in an app module, wherever
//                the list sits (['S', 'Small'], ['S', 'S', 'Small'], ['S', 'M', 'L'] - a picker list moved to its own const);
//   APP-RESTORE  an app module restores a stored size with ['S', 'M', 'L'].includes(...) or a regex that admits S
//                (/^[SML]$/.test(...), /^(S|M|L)$/) - that keeps a stored S as S; read it through the kit's offeredSize();
//   APP-FORCE    an app module assigns the literal 'S' to a size (size: x ? 'S' : y) - only the ruled exception may;
//   APP-ALIAS    the kit (js/modules/sheet/tokens.js) has no offeredSize() that reads S as M and keeps M / L, or no
//                OFFERED_SIZES of exactly M and L (S must DECODE as an alias of M, never be deleted);
//   GATE-DEFAULT a gate's DEFAULT run includes S: in tests/scripts/*.{cjs,mjs,js,sh} and tests/lib/*: an arg('size(s)', '<list>')
//                or arg('sizes') || '<list>' default with S in it, a literal size list (['S', 'M', 'L'], ['L', 'S'], ...) that
//                is not a validator (.includes / .indexOf right after it), a '--size(s)', '<list with S>' argument pair, or a
//                shell line passing --size(s) with S.
//   DOC          (with --docs: ws-precritic and deploy session 1 pass it) a LIVE instruction names S as a size to render or grade at: RUBRIC.md, the PRE-FLIGHT checklist of
//                LESSONS_LEARNED.md, PAGE_TYPES.md's dialog rows (PT-DLG) and .claude/agents/*.md say "S and L", "S / M / L",
//                "S, M and L" with no note that S was dropped (critic nos r1 F4; dated history rows elsewhere are records).
// --browser (critic nos r1 F1): the behavioural gate - S seeded in every restore path reads M; every Size control offers
//   M / L only with M checked; no preview page prints at S (see browserMain below).
// Comment lines are not read (usage text may still show an explicit `--sizes S`, which every gate still accepts: old backtest
// rows that name S stay runnable). Each line that keeps S on purpose is on ALLOW below, with its reason; an ALLOW entry that
// matches nothing FAILS too (a stale exemption).
//
//   node tests/scripts/ws-no-size-s.mjs                 # this tree
//   node tests/scripts/ws-no-size-s.mjs --docs          # ... and the live instruction docs (DOC); precritic / deploy run this
//   node tests/scripts/ws-no-size-s.mjs --root <dir>    # another checkout (ws-backtest commit-pair rows); MQ_ROOT works too
//   node tests/scripts/ws-no-size-s.mjs --self-test     # the line rules on planted text
//   /tmp/mq-browser-run.sh node tests/scripts/ws-no-size-s.mjs --browser [--root <dir>]   # the behavioural gate
//   node tests/scripts/ws-no-size-s.mjs --lines <file.json>   # the line rules on planted lines [{kind: app|gate|doc, file, line}]
//                                                            (backtest fixtures: the critic's r1 mutations)
//
// Last line `ws-no-size-s: OK (...)` / `ws-no-size-s: FAIL - n finding(s)`; exit 1 on FAIL, 2 when the tree cannot be read.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const TOOL = 'ws-no-size-s';
const args = process.argv.slice(2);
const at = args.indexOf('--root');
const ROOT = resolve(at >= 0 && args[at + 1] ? args[at + 1] : process.env.MQ_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..', '..'));

/** Lines that keep S on purpose: {file (root-relative), has (a substring of the line), why}. */
export const ALLOW = [
    // the kit bridge: an EXPLICIT S request (old backtest rows, `--size S` on a gate) still renders the kit's S token, and the
    // "All 12 tables on one page" option forces it internally; every APP entry point maps a stored S to M before calling it
    // the ONE layout that still prints at the kit's compact S token: count_by_tables "All rows on one page" (measured 2026-11-13:
    // at M, A4 holds 12 rows but Letter 11, so 12 rows need it); every screen names it COMPACT_LABEL, never "S" or "Small"
    { file: 'js/modules/print-sheet.js', has: "role, size: onePage ? 'S' : size,", why: 'ruled exception (lead, owner informed): "Compact (12 tables on one page)"' },
    { file: 'js/modules/print-sheet.js', has: "const size = ['S', 'M', 'L'].includes(req.size) ? req.size : 'L';", why: 'buildSheet, the kit bridge: explicit S (old backtest rows, --size S) still renders; the app never sends S (offeredSize at every entry point)' },
    // lesson DATA, not a picker: the sizes a Warm-up row prints at (S stays listed so an explicit S request, an old backtest
    // row, renders as before; the app never sends S)
    { file: 'js/modules/lessons/families/addsub.js', has: "warmRows: ['S', 'M']", why: 'lesson data (warm-up.js reads it with .includes(ctx.size)); no size is offered from it' },
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
const S_TUPLE = /\[\s*(['"])S\1\s*,\s*(['"])([^'"]*)\2\s*(?:,\s*(['"])([^'"]*)\4\s*)?\]/g;
const SIZE_WORDS = new Set(['S', 'M', 'L', 'Small', 'small', 'Medium', 'medium', 'Large', 'large', 'Big', 'big', 'Sm']);
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
    let pick = picker && /\[\s*['"]S['"]\s*,/.test(line);
    // F2 (broadened): any tuple of size words that starts with 'S', wherever the list sits
    for (const m of line.matchAll(S_TUPLE)) {
        const rest = [m[3], m[5]].filter((x) => x != null);
        if (!rest.every((w) => SIZE_WORDS.has(w))) continue;
        const after = line.slice(m.index + m[0].length);
        if (/^\s*\.(includes|indexOf)\(/.test(after)) out.push({ rule: 'APP-RESTORE', msg: `a stored size kept as S (${m[0]}.includes): read it through offeredSize()` });
        else pick = true;
    }
    if (pick) out.push({ rule: 'APP-PICKER', msg: 'a size option list offers S' });
    if (/\/\^?\[(?=[A-Z]*S)(?=[A-Z]*[ML])[A-Z]{2,3}\]\$?\/[a-z]*\.test\(|\/\^?\((?:[SML]\|){1,2}[SML]\)\$?\/[a-z]*\.test\(/.test(line)) out.push({ rule: 'APP-RESTORE', msg: 'a regex that admits S as a stored size: read it through offeredSize()' });
    if (/\bsize\s*[:=](?!=)/i.test(line)) {
        for (const m of line.matchAll(/['"]S['"]/g)) {
            const before = line.slice(0, m.index);
            if (/[=!]==?\s*$/.test(before) || /\[\s*$/.test(before) || /,\s*$/.test(before)) continue;   // a comparison, or a list (judged above)
            out.push({ rule: 'APP-FORCE', msg: "a size assigned the literal 'S'" });
            break;
        }
    }
    return out;
}

/** DOC lines: [{rule, msg}] for one line of a live instruction document. Pure. */
export function docLineFindings(line) {
    if (/dropped|2026-11-13|\bno S\b/i.test(line)) return [];
    if (/\bS and L\b|\bS ?\/ ?M ?\/ ?L\b|\bS, M,? and L\b|\bS, M, L\b|\bat S\b(?! token)/.test(line)) return [{ rule: 'DOC', msg: 'a live instruction names size S (sizes are M and L since 2026-11-13)' }];
    return [];
}
/** The live instruction text: [{file, lines: [[lineNo, text]]}]. LESSONS_LEARNED is read only in its PRE-FLIGHT section. */
function docTexts() {
    const out = [];
    const add = (rel, pick) => { const f = join(ROOT, rel); if (!existsSync(f)) return; const ls = readFileSync(f, 'utf8').split('\n').map((t, i) => [i + 1, t]); out.push({ file: rel, lines: pick ? pick(ls) : ls }); };
    add('design/audit/RUBRIC.md');
    add('design/audit/LESSONS_LEARNED.md', (ls) => { const a = ls.findIndex(([, t]) => /^## PRE-FLIGHT/.test(t)); if (a < 0) return []; const b = ls.findIndex(([, t], i) => i > a && /^## /.test(t)); return ls.slice(a, b < 0 ? undefined : b); });
    add('design/PAGE_TYPES.md', (ls) => ls.filter(([, t]) => /PT-DLG-/.test(t)));
    const ag = join(ROOT, '.claude/agents');
    if (existsSync(ag)) for (const n of readdirSync(ag)) if (n.endsWith('.md')) add(`.claude/agents/${n}`);
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
        // critic nos r1 F2: the two mutations the r1 guard missed
        ['app', "const SIZE_LIST = [['M', 'Medium'], ['L', 'Large'], ['S', 'Small']]; const SIZES = SIZE_LIST;", 'js/modules/x.js', ['APP-PICKER']],
        ['app', "size: /^[SML]$/.test(d.size) ? d.size : 'L',", 'js/modules/x.js', ['APP-RESTORE']],
        ['app', "size: /^(S|M|L)$/.test(d.size) ? d.size : 'L',", 'js/modules/x.js', ['APP-RESTORE']],
        ['app', "if (/^[ML]$/.test(v)) size = v;", 'js/modules/x.js', []],
        ['app', "const list = [['S', 'S', 'Small']];", 'js/modules/x.js', ['APP-PICKER']],
        ['app', "role, size: onePage ? 'S' : size, look,", 'js/modules/x.js', ['APP-FORCE']],
        ['app', "const size = n.size === 'S' ? 'M' : n.size;", 'js/modules/x.js', []],
        ['app', "const SIZES = { L: { w: 480, h: 400 }, M: { w: 400, h: 260 }, S: { w: 340, h: 210 } };", 'js/modules/x.js', []],
        ['app', "['S', 'Sunday'], ['M', 'Monday']", 'js/modules/x.js', []],
        ['doc', '1. Rendered at **S and L** (and M if the grid differs): independent, guided', 'x.md', ['DOC']],
        ['doc', '1. Rendered at **M and L** (owner 2026-11-13: size S is dropped)', 'x.md', []],
        ['doc', '| PT-DLG-5 | Size | S, M, L | L | section |', 'x.md', ['DOC']],
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
        const got = (kind === 'app' ? appLineFindings(line, file) : kind === 'doc' ? docLineFindings(line) : gateLineFindings(line, file)).map((x) => x.rule);
        const ok = JSON.stringify(got) === JSON.stringify(want);
        if (!ok) bad.push(line);
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${kind} ${JSON.stringify(line).slice(0, 90)} -> ${got.join(',') || 'clean'}`);
    }
    console.log(bad.length ? `${TOOL}: FAIL - self-test (${bad.length})` : `${TOOL}: OK (self-test, ${cases.length} lines)`);
    process.exit(bad.length ? 1 : 0);
}

async function main() {
    if (args.includes('--self-test')) return selfTest();
    if (args.includes('--browser')) return browserMain();
    const li = args.indexOf('--lines');
    if (li >= 0) {
        const rows = JSON.parse(readFileSync(resolve(args[li + 1]), 'utf8'));
        const found = rows.flatMap((r) => (r.kind === 'app' ? appLineFindings(r.line, r.file) : r.kind === 'doc' ? docLineFindings(r.line) : gateLineFindings(r.line, r.file)).map((f) => `${r.file}: ${f.rule} ${f.msg}`));
        for (const f of found) console.log(`  ${f}`);
        console.log(found.length ? `${TOOL}: FAIL - ${found.length} finding(s) in ${rows.length} planted line(s)` : `${TOOL}: OK (${rows.length} planted line(s), no finding)`);
        process.exit(found.length ? 1 : 0);
    }
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
    if (args.includes('--docs')) for (const d of docTexts()) for (const [n, t] of d.lines) for (const f of docLineFindings(t)) {
        const a = ALLOW.findIndex((x) => x.file === d.file && (x.has === '*' || t.includes(x.has)));
        if (a >= 0) { used.add(a); continue; }
        findings.push({ file: d.file, line: n, rule: f.rule, msg: f.msg });
    }
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
/* ======================================================================== --browser (critic nos r1 F1 / F2)
 * The behavioural gate: S is SEEDED into every place a size is restored from, the page is reloaded, and every size picker
 * and every restored value must read M (an S never survives). Restore paths:
 *   STORE-DEFAULTS  localStorage mq_teacher_print_defaults {size:'S'}      -> printDefaults().size, Settings > Printing defaults
 *   STORE-SHEET     localStorage mq_teacher_sheet {opts:{size:'S'}}        -> the worksheet sheet's size + its Size control
 *   STORE-SIMPLE    localStorage mq_simple_print {size:'S'}                -> the simple print's Size control and its preview pages
 *   SAVED-SET       mq_teacher_sets: a set whose print.opts.size is 'S'    -> its Library label, and opening it (applyPrintSettings)
 *   SET-LINK        ?set=<a set encoded with size S>                       -> the set it adds to My sets, then opened
 *   APPLY           window.tvSheetPrint.set({opts:{size:'S'}})             -> the tray snapshot / Library open path
 *   QUICK-PRINT     mq_quick_prints: a quick print whose print.size is 'S' -> openQuickPrint
 *   PRINT-SCREEN    the teacher Print screen's Setup Size control (from the stored defaults)
 *   PICKERS         every rendered [aria-label="Size"] control: no S / Small option, the checked one is M
 *   PAGES           no built preview page carries the ws-S class (a page printed at S) except the one-page compact sheet
 * No URL parameter, cookie or saved quiz carries a print size (checked by grep 2026-11-13: init.js reads no size param, the
 * cookies hold none, quiz-storage stores none), so those have no row; a new one is caught by PICKERS / PAGES when drawn. */
async function browserMain() {
    if (at >= 0) process.env.MQ_ROOT = ROOT;   // serve the checkout under test (ws-backtest commit-pair rows)
    const require = createRequire(import.meta.url);
    const { open, waitFor } = require('../lib/ws-harness.cjs');
    const fails = [];
    const ok = [];
    const check = (name, cond, detail) => { (cond ? ok : fails).push(`${name}${cond ? '' : ': ' + detail}`); };
    const app = await open({ seed: 1 });
    const { page, base } = app;
    try {
        // seed S everywhere, with a set link that also holds S, then reload as a returning teacher
        const link = await page.evaluate(async () => {
            const ui = await import('/js/modules/teacher-ui.js');
            const skills = [{ categoryId: 'addition', skillId: 'add_facts' }, { categoryId: 'multiplication', skillId: 'mult_facts' }];
            const print = { opts: { size: 'S', mode: 'pages', pages: 1 }, quiz: {} };
            localStorage.setItem('mq_teacher_print_defaults', JSON.stringify({ size: 'S' }));
            localStorage.setItem('mq_teacher_sheet', JSON.stringify({ opts: { size: 'S' } }));
            localStorage.setItem('mq_simple_print', JSON.stringify({ size: 'S' }));
            localStorage.setItem('mq_teacher_sets', JSON.stringify([{ id: 'set_nos_saved', name: 'NOS saved set', createdAt: 1, lastUsed: 1, skills, print }]));
            localStorage.setItem('mq_quick_prints', JSON.stringify([{ id: 'qp_nos', name: 'NOS quick', skills, print: { how: 'pages', n: 1, size: 'S', key: false } }]));
            localStorage.setItem('mq_teacher_skills_ui', JSON.stringify({ browse: 'sets' }));
            return ui.encodeSetParam({ name: 'NOS link set', skills: [{ categoryId: 'subtraction', skillId: 'sub_facts' }], print });
        });
        await page.goto(`${base}/index.html?set=${link}`, { waitUntil: 'networkidle2', timeout: 60000 });
        await waitFor(page, () => typeof window.generateQuestion === 'function' && !!window.SKILLS, 30000, 'app boot');
        await page.evaluate(() => Promise.all([window.__mqLoadDeferred, window.__mqLoadWorksheet].filter(Boolean).map((f) => f().then(() => true, () => false))));
        await page.evaluate(() => { if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole(); });
        await waitFor(page, () => typeof window.tvGo === 'function' && !!window.tvSheetPrint, 20000, 'teacher view');

        // the value restores
        const v = await page.evaluate(async () => {
            const ui = await import('/js/modules/teacher-ui.js');
            const out = { defaults: ui.printDefaults().size, sheet: window.tvSheetPrint.get().opts.size };
            const sets = ui.savedSets();
            const fromLink = sets.find((s) => s.name === 'NOS link set');
            out.linkSet = fromLink ? (fromLink.print && fromLink.print.opts ? fromLink.print.opts.size : '(no print)') : '(not imported)';
            const saved = sets.find((s) => s.id === 'set_nos_saved');
            window.tvSheetPrint.set(saved.print);
            out.applySaved = window.tvSheetPrint.get().opts.size;
            if (fromLink && fromLink.print) { window.tvSheetPrint.set(fromLink.print); out.applyLink = window.tvSheetPrint.get().opts.size; }
            window.tvSheetPrint.set({ opts: { size: 'S' } });
            out.apply = window.tvSheetPrint.get().opts.size;
            const back = ui.decodeSetParam(ui.encodeSetParam({ name: 'x', skills: [{ categoryId: 'addition', skillId: 'add_facts' }], print: { opts: { size: 'S' } } }));
            out.decode = back && back.print && back.print.opts ? back.print.opts.size : '(none)';
            return out;
        });
        check('STORE-DEFAULTS printDefaults().size', v.defaults === 'M', `is ${v.defaults}`);
        check('STORE-SHEET the sheet size', v.sheet === 'M', `is ${v.sheet}`);
        check('SET-LINK the imported set keeps M', v.linkSet === 'M', `is ${v.linkSet}`);
        check('SET-LINK decodeSetParam', v.decode === 'M', `is ${v.decode}`);
        check('SAVED-SET opened (applyPrintSettings)', v.applySaved === 'M', `is ${v.applySaved}`);
        check('SET-LINK opened (applyPrintSettings)', v.applyLink === 'M', `is ${v.applyLink}`);
        check('APPLY tvSheetPrint.set({size:S})', v.apply === 'M', `is ${v.apply}`);

        // every rendered Size control: no S option, the checked one is M
        const pickers = (where) => page.evaluate((where) => {
            const vis = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
            const groups = [...document.querySelectorAll('[aria-label="Size"]')].filter(vis);
            return groups.map((g) => {
                const btns = [...g.querySelectorAll('button, [role="radio"], option')];
                const val = (b) => b.dataset.v || b.dataset.setSize || b.value || b.textContent.trim();
                const words = btns.map((b) => `${val(b)}|${(b.getAttribute('aria-label') || '')}|${b.textContent.trim()}`);
                const on = btns.filter((b) => b.getAttribute('aria-checked') === 'true' || b.getAttribute('aria-pressed') === 'true' || b.selected);
                return { where, words, on: on.map(val), sOpt: words.filter((w) => /^S\||\|S\||\bSmall\b/.test(w)) };
            });
        }, where);
        const judge = (name, gs, need = 1) => {
            check(`PICKERS ${name}: a Size control is drawn`, gs.length >= need, `${gs.length} drawn`);
            for (const g of gs) {
                check(`PICKERS ${name}: no S option`, !g.sOpt.length, `offers ${g.sOpt.join(', ')}`);
                check(`PICKERS ${name}: M is checked`, g.on.length === 1 && /^(M|Medium)$/.test(g.on[0]), `checked: ${JSON.stringify(g.on)}`);
            }
        };
        const pagesAtS = (sel) => page.evaluate((sel) => { const r = document.querySelector(sel); return r ? [...r.querySelectorAll('.ws-S, [data-ws-size="S"]')].filter((el) => !el.closest('[data-ws-compact]')).length : -1; }, sel);

        // Settings > Printing defaults
        await page.evaluate(() => window.tvGo('settings'));
        await waitFor(page, () => !!document.getElementById('tvPrintDefH'), 10000, 'Settings');
        judge('Settings > Printing defaults', await pickers('settings'));

        // Library > My sets: the saved set's words
        let libOk = false;
        for (const scr of ['skills', 'library']) {
            await page.evaluate((scr) => window.tvGo(scr), scr);
            await page.evaluate(async () => { for (let i = 0; i < 50 && !document.querySelector('[data-act="browse"][data-arg="sets"]'); i++) await new Promise((r) => setTimeout(r, 100)); });
            await page.evaluate(() => { const b = [...document.querySelectorAll('[data-act="browse"][data-arg="sets"]')].find((x) => x.getClientRects().length); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); });
            libOk = await page.evaluate(async () => { for (let i = 0; i < 50; i++) { if (document.querySelector('.ts-set-saved')) return true; await new Promise((r) => setTimeout(r, 100)); } return false; });
            if (libOk) break;
        }
        check('SAVED-SET Library My sets is drawn', libOk, 'no saved set drawn on Skills or Library > My sets');
        const lib = await page.evaluate(() => [...document.querySelectorAll('.ts-set-saved')].map((e) => e.textContent.replace(/\s+/g, ' ')).join(' / '));
        check('SAVED-SET Library label', !/\bSize S\b|\bSmall\b/.test(lib) && /\bSize M\b/.test(lib), `reads: ${lib.slice(0, 160)}`);

        // the worksheet sheet (Print from the tray)
        await page.evaluate(() => {
            window.UnifiedSkills.clear();
            window.UnifiedSkills.add({ domainId: 'number_operations', categoryId: 'addition', skillId: 'add_facts', skillLabel: 'Addition Facts', categoryIcon: '+', categoryName: 'Addition', domainColor: '#8b5cf6' });
            window.UnifiedSkills._syncAllImmediate();
            window.tvSheetPrint.set({ opts: { size: 'S' } });
            window.tvOpenSheet('print');
        });
        await waitFor(page, () => [...document.querySelectorAll('[aria-label="Size"]')].some((g) => g.getClientRects().length), 15000, 'worksheet sheet Size');
        judge('worksheet sheet', await pickers('sheet'));
        await page.evaluate(() => window.tvCloseSheet && window.tvCloseSheet());

        // the teacher Print screen (Setup)
        await page.evaluate(() => window.tvOpenPrintWith([{ categoryId: 'addition', skillId: 'add_facts' }]));
        await waitFor(page, () => !!document.getElementById('tvSetupH'), 15000, 'Print screen Setup');
        judge('Print screen Setup', await pickers('print'));

        // F3 (critic nos r1): "All rows on one page" prints compact. Every screen names it with ONE label and draws no
        // M / L control with nothing checked; no caption says "Small" or "Size S"; every visible radiogroup has one checked
        const COMPACT = 'Compact (12 tables on one page)';
        const compactView = (where) => page.evaluate((where, COMPACT) => {
            const vis = (el) => !!el && el.getClientRects().length > 0;
            const fixed = [...document.querySelectorAll('[data-size-fixed="compact"]')].filter(vis).map((e) => e.textContent.replace(/\s+/g, ' ').trim());
            const sizeCtl = [...document.querySelectorAll('[aria-label="Size"]')].filter(vis).length;
            const orphanGroups = [...document.querySelectorAll('[role="radiogroup"]')].filter(vis)
                .filter((g) => g.querySelectorAll('[role="radio"]').length && g.querySelectorAll('[role="radio"][aria-checked="true"]').length !== 1)
                .map((g) => g.getAttribute('aria-label') || g.id || '(unnamed)');
            const small = [...document.querySelectorAll('.tv-cap, .tvs-muted, .tvs-row-sub, .sp-hint, p')].filter(vis).map((e) => e.textContent).filter((t) => /\bSmall\b|\bSize S\b|smaller digits/.test(t)).map((t) => t.trim().slice(0, 80));
            return { where, fixed, sizeCtl, orphanGroups, small, hasLabel: fixed.length > 0 && fixed.every((t) => t.includes(COMPACT)) };
        }, where, COMPACT);
        const judgeCompact = (c) => {
            check(`COMPACT ${c.where}: one label "${COMPACT}"`, c.hasLabel, `labels: ${JSON.stringify(c.fixed)}`);
            check(`COMPACT ${c.where}: no M / L Size control drawn`, c.sizeCtl === 0, `${c.sizeCtl} Size control(s)`);
            check(`COMPACT ${c.where}: every radiogroup has one checked`, !c.orphanGroups.length, `nothing (or several) checked in ${c.orphanGroups.join(', ')}`);
            check(`COMPACT ${c.where}: no caption names Small / Size S`, !c.small.length, c.small.join(' | '));
        };
        const ONE = { categoryId: 'multiplication', skillId: 'count_by_tables', opts: { onePage: true } };
        await page.evaluate((ONE) => window.tvOpenPrintWith([ONE]), ONE);
        await waitFor(page, () => !!document.getElementById('tvSetupH'), 15000, 'Print screen Setup (one page)');
        await page.evaluate(async () => { for (let i = 0; i < 50 && !document.querySelector('[data-size-fixed]'); i++) await new Promise((r) => setTimeout(r, 100)); });
        judgeCompact(await compactView('Print screen Setup'));
        await page.evaluate((ONE) => {
            window.UnifiedSkills.clear();
            window.UnifiedSkills.add({ domainId: 'number_operations', categoryId: ONE.categoryId, skillId: ONE.skillId, skillLabel: 'Count by', categoryIcon: 'x', categoryName: 'Multiplication', domainColor: '#8b5cf6', opts: ONE.opts });
            window.UnifiedSkills._syncAllImmediate();
            window.tvOpenSheet('print');
        }, ONE);
        await page.evaluate(async () => { for (let i = 0; i < 80 && !document.querySelector('[data-size-fixed]'); i++) await new Promise((r) => setTimeout(r, 100)); });
        judgeCompact(await compactView('worksheet sheet'));
        await page.evaluate(() => window.tvCloseSheet && window.tvCloseSheet());

        // the simple print: stored S, then a quick print saved at S
        for (const [name, how] of [['simple print (stored S)', 'tray'], ['simple print (quick print saved at S)', 'quick']]) {
            await page.evaluate(async (how) => {
                const sp = await import('/js/modules/simple-print.js');
                sp.closeSimplePrint();
                if (how === 'quick') sp.openQuickPrint('qp_nos'); else sp.openSimplePrint([{ categoryId: 'addition', skillId: 'add_facts' }], { from: 'tray' });
            }, how);
            await waitFor(page, () => !!document.querySelector('.sp-size'), 15000, name);
            judge(name, await pickers(name));
            const st = await page.evaluate(async () => (await import('/js/modules/simple-print.js')).simplePrintState());
            check(`STORE-SIMPLE ${name}: its size`, st && st.prefs && st.prefs.size === 'M', `is ${st && st.prefs && st.prefs.size}`);
            await page.evaluate(async () => { for (let i = 0; i < 150; i++) { const s = (await import('/js/modules/simple-print.js')).simplePrintState(); if (s && !s.busy && s.built) return; await new Promise((r) => setTimeout(r, 100)); } });
            const nS = await pagesAtS('body');
            check(`PAGES ${name}: no preview page at S`, nS === 0, `${nS} page(s) at S`);
        }
        await page.evaluate(async () => (await import('/js/modules/simple-print.js')).closeSimplePrint());
        const errs = app.problems.filter((p) => p.type !== 'requestfailed');
        check('no page errors', !errs.length, errs.slice(0, 3).map((p) => p.text).join(' | '));
    } catch (e) {
        fails.push(`could not run: ${String(e && e.message || e).slice(0, 200)}`);
    } finally { await app.close(); }
    for (const o of ok) console.log(`  ok   ${o}`);
    for (const f of fails) console.log(`  FAIL ${f}`);
    console.log(fails.length ? `${TOOL} --browser: FAIL - ${fails.length} finding(s)` : `${TOOL} --browser: OK (${ok.length} checks: S seeded in every restore path reads M; every Size control offers M / L with M checked)`);
    process.exit(fails.length ? 1 : 0);
}

main();
