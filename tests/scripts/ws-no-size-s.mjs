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
//   APP-TOKEN /  (round-cap r3, after two rounds of missed phrasings) a TOKEN rule, not a phrase list: any string of size letters
//   GATE-TOKEN   holding S ('SML', 'S,M,L', 'L/S'), any quoted 'S' on a line that talks about size unless it is compared
//                (=== 'S' maps it away), a quoted 'Small' on such a line. Letters that are not sizes are allow-listed one by one.
//   DOC          (with --docs: ws-precritic and deploy session 1 pass it) EVERY *.md that is not a record (DOC_RECORDS: status
//                logs, critic and run reports, signed cards, research, dated decisions) - CLAUDE.md and the design standards
//                included - fails a line with a size-S token: a bare S beside M / L, after "size" / "at" / "--sizes", or Small
//                beside Medium / Large. It passes only when it says S was dropped / is an alias / the compact token / history,
//                or carries a `<!-- nos: why -->` marker (one line, one block, or `nos-section` for a dated findings log).
//   SELF-TEST    every run of THIS tree plants the MUTATION corpus (the critics' r1 / r2 mutations and the builder's own) one at
//                a time and FAILS when a static row is not caught or an anchor is gone; `--self-test --browser` plants the
//                browser rows (a CSS display override, raw restores, an S with no quoted 'S') in a copy and runs --browser.
// --browser (critic nos r1 F1, r2 N1): the behavioural gate judges what is VISIBLE (computed style up the tree, a box, and
//   elementFromPoint at the centre), never the hidden attribute: in every size surface and mode - Settings, the worksheet
//   sheet, the Print screen, the simple print (fact rows, quick print, cells, and the compact "All rows on one page") - no
//   visible or clickable S option, no visible size picker where the layout is fixed, and every visible size option CLICKED
//   changes the size the preview page is built at; plus S seeded in every restore path reads M.
// Comment lines are not read (usage text may still show an explicit `--sizes S`, which every gate still accepts: old backtest
// rows that name S stay runnable). Each line that keeps S on purpose is on ALLOW below, with its reason; an ALLOW entry that
// matches nothing FAILS too (a stale exemption).
//
//   node tests/scripts/ws-no-size-s.mjs                 # this tree
//   node tests/scripts/ws-no-size-s.mjs --docs          # ... and the live instruction docs (DOC); precritic / deploy run this
//   node tests/scripts/ws-no-size-s.mjs --root <dir>    # another checkout (ws-backtest commit-pair rows); MQ_ROOT works too
//   node tests/scripts/ws-no-size-s.mjs --self-test     # the line rules on planted text + the static mutation corpus
//   /tmp/mq-browser-run.sh node tests/scripts/ws-no-size-s.mjs --self-test --browser   # ... and the browser mutation rows
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
    // round-cap r3 TOKEN rule: lines that hold a letter S that is NOT a print size (reviewed one by one, 2026-11-13)
    { file: 'js/modules/skill-option-keys.js', has: '*', why: 'share-code option letters (S = scattered / second / standard / set / subtract ...): a frozen code alphabet, not a print size' },
    { file: 'js/modules/skill-codes-frozen.js', has: '*', why: 'frozen two-letter skill codes ("SK", "LS"): never renamed (four share-code systems index them)' },
    { file: 'js/modules/dashboard.js', has: "const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];", why: 'weekday initials on the streak calendar' },
    { file: 'js/modules/data-vocabulary.js', has: "word: 'Small'", why: 'a vocabulary word (the K comparing word "small"), not a print size' },
    { file: 'js/modules/student-explorer.js', has: "const order = ['L', 'W', 'B', 'M', 'S'];", why: 'the explorer card plate sizes (screen layout of a pupil card), not a print size' },
    { file: 'js/modules/teacher-library.js', has: "const SIZES = [['big', 'Big'], ['medium', 'Medium'], ['small', 'Small']];", why: 'the Library thumbnail zoom (Big 3 / Medium 4 / Small 5 across), not a print size' },
    { file: 'js/modules/print-sheet.js', has: "sec.dense = { S: pageCapOf(sec, 'S')", why: 'the dense page caps per kit token (the compact S token still exists for the one-page layout)' },
    // GATE-TOKEN (round-cap r3): test code that names the kit S token on purpose - unit tests and self-test fixtures of the
    // token itself, never a default size a gate renders a skill at
    ...['ws-layout-unit.mjs', 'ws-panes-unit.mjs', 'ws-roles-unit.mjs'].map((f) => ({ file: `tests/scripts/${f}`, has: '*', rule: 'GATE-TOKEN', why: 'kit unit test of the S token (the decode alias and the compact one-page layout): token arithmetic, no skill page run' })),
    { file: 'tests/scripts/wave1-c2-onepage.cjs', has: '*', rule: 'GATE-TOKEN', why: 'measures the compact one-page count-by layout, the ruled exception that still prints at the kit S token' },
    { file: 'tests/scripts/ws-cell-checks.cjs', has: 'sizeSFindings([{', rule: 'GATE-TOKEN', why: 'self-test fixture of the size rule (planted rows), no page is printed' },
    { file: 'tests/scripts/ws-empty-band.cjs', has: "const cases = [['guided', 'S', 10, false]", rule: 'GATE-TOKEN', why: 'self-test fixture rows of the band limits per token' },
    { file: 'tests/scripts/ws-envelope.mjs', has: 'const capped = capCritic(', rule: 'GATE-TOKEN', why: 'self-test fixture of the critic sampler cap, no page is printed' },
    { file: 'tests/scripts/ws-print-lint.cjs', has: 'narrow Lines write-on line at size S (SL-3a exception)', rule: 'GATE-TOKEN', why: 'self-test probe of the SL-3a rule on a page tagged S (the compact token)' },
    { file: 'tests/scripts/ws-node-lint.mjs', has: "pupilHtml(q, 'S')", rule: 'GATE-TOKEN', why: 'L1 legacy rule: compares the kit S token with L in node (S still renders for an explicit request)' },
    { file: 'tests/scripts/ws-node-lint.mjs', has: "S: fpAt(q, 'S')", rule: 'GATE-TOKEN', why: 'L1 footprint rule: the kit S token against L, in node' },
    { file: 'tests/scripts/ws-node-lint.mjs', has: "const S = lay('S'), L = lay('L');", rule: 'GATE-TOKEN', why: 'L1 layout rule: the kit S token against L, in node' },
    { file: 'tests/scripts/ws-student-explorer.cjs', has: "for (const size of ['L', 'W', 'B', 'M', 'S'])", rule: 'GATE-TOKEN', why: 'the explorer card plate sizes (a screen layout), not a print size' },
    // DOC (round-cap r3): CLAUDE.md is the owner's file - lanes do not edit it. Its two S lines are reported to the lead for the
    // owner; when the owner rewrites them these entries go stale and FAIL (ALLOW-STALE), so they cannot outlive the fix
    { file: 'CLAUDE.md', has: '(Size S ignored, wasted space,', rule: 'DOC', why: 'owner file, reported to the lead 2026-11-13: names failure class L1 by its old title' },
    { file: 'CLAUDE.md', has: 'Tokens (sizes S/M/L, looks, ink,', rule: 'DOC', why: 'owner file, reported to the lead 2026-11-13: lists the kit tokens (S is the decode alias / compact token)' },
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
    // round-cap r3 TOKEN rule (the phrasing lists above kept missing new spellings): ANY string of size letters that holds S
    // ('SML', 'S,M,L', 'L/S'), any quoted 'S' on a line that talks about size (size / a quoted 'M' or 'L' / a size word)
    // unless it is compared (=== 'S': a reader that maps it away), and a quoted 'Small' on such a line
    if (!out.length) { const t = sizeTokenFinding(line); if (t) out.push({ rule: 'APP-TOKEN', msg: t }); }
    return out;
}

/** The TOKEN rule shared by app and gate code: a message when the line carries an S size token, else null. Pure. */
export function sizeTokenFinding(line) {
    if (isComment(line)) return null;
    if (/(['"`])(?=[SML ,/|]*S)(?=[SML ,/|]*[ML])[SML][SML ,/|]{1,8}\1/.test(line)) return 'a string of size letters that holds S';
    const ctx = /size|Size|SIZE/.test(line) || /(['"`])[ML]\1/.test(line) || /(['"`])(Small|Medium|Large|Big)\1/.test(line);
    if (!ctx) return null;
    for (const m of line.matchAll(/(['"`])S\1/g)) {
        const before = line.slice(0, m.index);
        const after = line.slice(m.index + m[0].length);
        if (/[=!]==?\s*$/.test(before) || /^\s*[=!]==?/.test(after)) continue;   // compared: a reader that maps S away
        if (/^\s*\]\s*\.(includes|indexOf)\(/.test(after) && /\[[^\]]*$/.test(before)) return "a list that admits a stored 'S' (.includes): read it through offeredSize()";
        return "a quoted 'S' on a size line";
    }
    if (/(['"`])Small\1/.test(line)) return "a quoted 'Small' on a size line";
    return null;
}

/** DOC lines (round-cap r3: a TOKEN rule, not a list of phrasings): a line FAILS when it carries a size-S token - a bare
 *  capital S beside an M or L token ("S / M / L", "S, M", "S and L", "S·M·L", "L / M / S"), after a size word or "at"
 *  ("size S", "sizes S", "Size: S", "at S", "--sizes L,S"), or the word Small beside Medium / Large / Big. A line passes
 *  only when it says S was dropped, is an alias / the compact token, or is history (DOC_EXEMPT), or sits in a block (up to
 *  the next blank line) under a `<!-- nos: <reason> -->` marker. A single backticked letter (`S`) is a share-code letter. Pure. */
export const DOC_EXEMPT = /\bdropped\b|\balias\b|\bS token\b|\btoken S\b|compact (?:token|layout)|\bdecod|\bhistory\b|\(record\)|\bretired\b|\bno S\b|not (?:offered|graded)|never offered|prints? (?:at|as) M\b/i;
const NB = '(?<![A-Za-z0-9_\\-.`])';
const NA = '(?![A-Za-z0-9_\\-\'\u2019`])';
const S_TOK = new RegExp(`${NB}S${NA}`, 'g');
const ML_TOK = new RegExp(`${NB}[ML]${NA}`);
export function docLineFindings(line) {
    if (DOC_EXEMPT.test(line)) return [];
    const bad = (why) => [{ rule: 'DOC', msg: `a live doc offers size S (${why}); sizes are M and L since 2026-11-13` }];
    for (const m of line.matchAll(S_TOK)) {
        const a = line.slice(Math.max(0, m.index - 24), m.index);
        const b = line.slice(m.index + 1, m.index + 25);
        if (ML_TOK.test(a) || ML_TOK.test(b)) return bad('S beside M / L');
        if (/\bsizes?\W{0,4}$|\bat\W{0,3}$|--sizes?[ =][A-Z,]*$/i.test(a)) return bad('size S / at S');
    }
    if (/\bSmall\b(?:\W+\w+){0,3}?\W+(?:Medium|Large)\b|\b(?:Medium|Large)\b(?:\W+\w+){0,3}?\W+Small\b/.test(line)) return bad('Small beside Medium / Large');
    return [];
}
/** Markdown that is a RECORD, not a live instruction (history: status logs, critic and run reports, signed cards, research
 *  notes, dated decisions and audits). Every other *.md in the tree, CLAUDE.md included, is scanned. */
export const DOC_RECORDS = [
    ['design/status/', 'lane status logs (dated records)'], ['design/STATUS.md', 'the project status log (dated records)'],
    ['design/audit/runs/', 'critic and audit run reports'], ['design/audit/critic/', 'critic reports'], ['design/audit/matrix/', 'nightly matrix results'],
    ['design/lanes/', 'lane run records'], ['design/lesson-planner/lessons/', 'lesson build and critic records'],
    ['design/cards/', 'signed spec cards (critic nos r1: historical records)'], ['design/lessons/cards/', 'signed lesson cards'],
    ['design/research/', 'dated research notes'], ['design/decisions/', 'the dated decision log'],
    ['design/lessons-first/CHECKS_FROM_CRITICS.md', 'the ledger of past critic findings'],
    ['design/audit/SKILL_UPGRADE_LIST.md', 'a dated audit (2026-10-23)'], ['design/IMPROVEMENT_PLAN.md', 'dated plan and benchmark record (2026-10)'],
    ['design/lessons/LANDING_PLAN_PHASE0.md', 'a dated phase-0 plan record'], ['design/mockups/', 'mock-up review records'],
    ['tests/fixtures/', 'test fixtures'], ['node_modules/', 'dependencies'],
];
function docFiles() {
    const out = [];
    const walkMd = (dir) => { for (const n of readdirSync(join(ROOT, dir))) { if (n === '.git' || n === 'node_modules') continue; const rel = dir ? `${dir}/${n}` : n; const st = statSync(join(ROOT, rel)); if (st.isDirectory()) walkMd(rel); else if (n.endsWith('.md')) out.push(rel); } };
    walkMd('');
    return out.filter((f) => !DOC_RECORDS.some(([p]) => f === p || f.startsWith(p)));
}
/** The lines of one doc the DOC rule reads: [[lineNo, text]]. Three explicit, greppable exemptions, each with its reason
 *  in the marker text: `text <!-- nos: why -->` exempts that one line (a token value or a history row); a line that is only
 *  `<!-- nos: why -->` exempts the block under it, up to the next blank line (one token table); `<!-- nos-section: why -->`
 *  exempts the rest of the section it sits in, up to the next heading of the same or a higher level (a dated findings log). */
export function docReadLines(text) {
    const keep = [];
    let block = false;
    let sectionLevel = 0;   // > 0 while a nos-section marker is open: the level of the heading above it
    let lastLevel = 7;
    text.split('\n').forEach((t, i) => {
        const h = /^(#{1,6})\s/.exec(t);
        if (h) { lastLevel = h[1].length; if (sectionLevel && lastLevel <= sectionLevel) sectionLevel = 0; }
        if (/^\s*<!--\s*nos-section:.*-->\s*$/.test(t)) { sectionLevel = lastLevel; return; }
        if (/^\s*<!--\s*nos:.*-->\s*$/.test(t)) { block = true; return; }
        if (!t.trim()) block = false;
        if (block || sectionLevel || /<!--\s*nos:/.test(t)) return;
        keep.push([i + 1, t]);
    });
    return keep;
}
function docTexts() {
    return docFiles().map((rel) => ({ file: rel, lines: docReadLines(readFileSync(join(ROOT, rel), 'utf8')) }));
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
    // round-cap r3 TOKEN rule for gates: an S default spelled any way ('S', 'S,M', 'L/S', `|| 'S'`) on a size line
    if (!out.length) {
        const t = sizeTokenFinding(line);
        const validator = /\.(includes|indexOf)\(|\.includes\(\s*['"]S['"]\s*\)\s*\?/.test(line);
        if (t && !validator) out.push({ rule: 'GATE-TOKEN', msg: t });
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

/* ======================================================================== the MUTATION corpus (round-cap r3)
 * Every way the critics re-introduced S (r1 F2, r2 A-F and E, r2 N2's six doc lines) plus the builder's own (a CSS display
 * override, a new picker array, an S built without a quoted 'S', a renamed size label, an S default in a gate). Each row is
 * planted into the CURRENT tree and must be caught by every mode it names:
 *   static   - `--self-test` plants it in memory (one row at a time) and the line rules + allow-list must add a finding;
 *   browser  - `--self-test --browser` plants every browser row together in a copy of the served tree and runs --browser on it;
 *              each row's `expect` (a check-name prefix) must FAIL there.
 * A row's `find` must exist in the tree (a corpus that no longer applies FAILS: it would test nothing). Doc rows append to a
 * LIVE doc (add: true). */
export const MUTATIONS = [
    // critic nos r1 F2 (code)
    { id: 'r1-shell-picker', src: 'critic r1 F2', file: 'js/modules/teacher-shell.js', find: "segBtns('Size', pd.size, [['M', 'M'], ['L', 'L']])", to: "segBtns('Size', pd.size, [['S', 'S'], ['M', 'M'], ['L', 'L']])", modes: ['static'] },
    { id: 'r1-deploy-sizes', src: 'critic r1 F2', file: 'tests/scripts/ws-deploy-gates.sh', find: 'ws-lesson-baseline.cjs --all-lessons --sizes M,L --seeds 4242,1 --per-lesson --unpinned --check "$LESSON_BASE"', to: 'ws-lesson-baseline.cjs --all-lessons --sizes S,L --seeds 4242,1 --per-lesson --unpinned --check "$LESSON_BASE"', modes: ['static'] },
    { id: 'r1-own-const-list', src: 'critic r1 F2', file: 'js/modules/simple-print.js', find: "const SIZES = [['L', 'Big'], ['M', 'Medium']];", to: "const SIZE_LIST = [['L', 'Big'], ['M', 'Medium'], ['S', 'Small']]; const SIZES = SIZE_LIST;", modes: ['static', 'browser'], expect: 'VISIBLE simple print (cells): no visible or clickable S option' },
    { id: 'r1-regex-restore', src: 'critic r1 F2', file: 'js/modules/teacher-ui.js', find: "size: offeredSize(d.size, 'L'),", to: "size: /^[SML]$/.test(d.size) ? d.size : 'L',", modes: ['static'] },
    { id: 'r1-apply-raw', src: 'critic r1 F1/F2', file: 'js/modules/teacher-sheet.js', find: "    S.opts.size = offeredSize(S.opts.size, 'M');   // owner 2026-11-13: a saved set", to: "    // S.opts.size kept raw   // owner 2026-11-13: a saved set", modes: ['browser'], expect: 'APPLY tvSheetPrint.set({size:S})' },
    // critic nos r2 A-F (code)
    { id: 'r2-A-decode', src: 'critic r2 A', file: 'js/modules/teacher-ui.js', find: "rec.print.opts.size = offeredSize(rec.print.opts.size, 'M');", to: 'rec.print.opts.size = String(rec.print.opts.size);', modes: ['browser'], expect: 'SET-LINK decodeSetParam' },
    { id: 'r2-B-simple-restore', src: 'critic r2 B', file: 'js/modules/simple-print.js', find: 'if (s.size != null) d.size = offeredSize(s.size, d.size);', to: 'if (s.size != null) d.size = s.size;', modes: ['browser'], expect: 'STORE-SIMPLE simple print (stored S, fact rows)' },
    { id: 'r2-C-settings-split', src: 'critic r2 C', file: 'js/modules/teacher-shell.js', find: "segBtns('Size', pd.size, [['M', 'M'], ['L', 'L']])", to: "segBtns('Size', pd.size, 'SML'.split('').map((z) => [z, z]))", modes: ['static', 'browser'], expect: 'VISIBLE Settings > Printing defaults: no visible or clickable S option' },
    { id: 'r2-D-print-split', src: 'critic r2 D', file: 'js/modules/teacher-print.js', find: "seg('size', pr.size, [['M', 'M', 'Medium'], ['L', 'L', 'Large']], 'Size')", to: "seg('size', pr.size, 'SML'.split('').map((z) => [z, z]), 'Print size')", modes: ['static', 'browser'], expect: 'VISIBLE Print screen Setup: no visible or clickable S option' },
    { id: 'r2-F-defaults-raw', src: 'critic r2 F', file: 'js/modules/teacher-ui.js', find: "size: offeredSize(d.size, 'L'),", to: "size: d.size || 'L',", modes: ['browser'], expect: 'STORE-DEFAULTS printDefaults().size' },
    // the builder's own (round-cap r3)
    { id: 'own-css-override', src: 'own: CSS display override (critic r2 N1 itself)', file: 'css/simple-print.css', find: '.sp-root .sp-sizes[hidden] { display: none; }', to: '/* removed */', modes: ['browser'], expect: 'FIXED simple print (compact)' },
    { id: 'own-no-quoted-s', src: 'own: an S option built with no quoted S', file: 'js/modules/teacher-sheet.js', all: true, find: "seg('size', S.opts.size, [['M', 'M'], ['L', 'L']], 'Size')", to: "seg('size', S.opts.size, [['M', 'M'], ['L', 'L'], [String.fromCharCode(83), String.fromCharCode(83)]], 'Size')", modes: ['browser'], expect: 'VISIBLE worksheet sheet: no visible or clickable S option' },
    // lead NOS-DOCS-ADVISORY (critic nos r3: its runtime S button): an S option added by JS at RUNTIME, no S in any source
    // line the static rules read; only the browser gate sees it (row nos-runtime-s-button, `--plant`)
    { id: 'r3-runtime-s-button', src: 'critic nos r3 (runtime MutationObserver)', file: 'js/modules/simple-print.js', add: "if (typeof document !== 'undefined') new MutationObserver(() => { for (const g of document.querySelectorAll('.sp-sizes:not([data-nos-s])')) { g.setAttribute('data-nos-s', '1'); const r = g.querySelector('[role=radio]'); const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); if (r) b.className = r.className; b.textContent = String.fromCharCode(83); g.prepend(b); } }).observe(document.documentElement, { childList: true, subtree: true });", modes: ['browser'], expect: 'VISIBLE simple print' },
    { id: 'own-renamed-label', src: 'own: a renamed size label with an S option', file: 'js/modules/teacher-sheet.js', find: "row('Size', 'Bigger digits, fewer problems', seg('size', S.opts.size, [['M', 'M'], ['L', 'L']], 'Size'))", to: "row('Digits', 'Bigger digits, fewer problems', seg('digits', S.opts.size, [['S', 'S'], ['M', 'M'], ['L', 'L']], 'Digits'))", modes: ['static'] },
    { id: 'own-new-picker-array', src: 'own: a new picker array', file: 'js/modules/teacher-library.js', find: "import { offeredSize } from './sheet/tokens.js';", to: "import { offeredSize } from './sheet/tokens.js'; export const PRINT_SIZES = ['S', 'M', 'L'];", modes: ['static'] },
    { id: 'own-gate-default-list', src: 'own: an S default in a gate', file: 'tests/scripts/ws-lesson-check.cjs', find: "const SIZES = (arg('sizes', 'L,M') || 'L,M')", to: "const SIZES = (arg('sizes', 'L,M') || 'L,M,S')", modes: ['static'] },
    { id: 'own-gate-env-default', src: 'own: an S default in a gate (env)', file: 'tests/scripts/ws-lesson-check.cjs', find: "const SIZES = (arg('sizes', 'L,M') || 'L,M')", to: "const SIZE = process.env.MQ_SIZE || 'S'; const SIZES = (arg('sizes', 'L,M') || 'L,M')", modes: ['static'] },
    { id: 'own-gate-mixed-key', src: 'own: a renamed key in a gate', file: 'tests/scripts/ws-lesson-check.cjs', find: "const SIZES = (arg('sizes', 'L,M') || 'L,M')", to: "const SIZES = (arg('sz', 'S/L') || 'L,M')", modes: ['static'] },
    // docs: critic r1 F4, r2 E and r2 N2's six phrasings, plus the builder's own, each appended to a LIVE doc
    { id: 'r1-doc-preflight', src: 'critic r1 F4', file: 'design/audit/RUBRIC.md', add: '1. Rendered at **S and L** (and M if the grid differs): independent, guided', modes: ['static'] },
    { id: 'r2-E-rubric', src: 'critic r2 E', file: 'design/audit/RUBRIC.md', add: 'Render every page at size S and at L.', modes: ['static'] },
    { id: 'r2-N2-s-and-l', src: 'critic r2 N2', file: 'WORKSHEET_DESIGN_STANDARD.md', add: 'Grade each skill at S and L.', modes: ['static'] },
    { id: 'r2-N2-s-m-l', src: 'critic r2 N2', file: 'design/PAGE_TYPES.md', add: '| PT-DLG-9 | Size | S, M, L | L | section |', modes: ['static'] },
    { id: 'r2-N2-at-s-too', src: 'critic r2 N2', file: 'design/audit/RUBRIC.md', add: 'Check the page at S too.', modes: ['static'] },
    { id: 'r2-N2-at-size-s', src: 'critic r2 N2', file: 'CLAUDE.md', add: 'Print the sample at size S and at L.', modes: ['static'] },
    { id: 'r2-N2-small-large', src: 'critic r2 N2', file: 'design/EXTENSION_PLAYBOOK.md', add: 'Draw the exemplar at Small and Large.', modes: ['static'] },
    { id: 'r2-N2-sizes-flag', src: 'critic r2 N2', file: 'design/LESSON_RULES.md', add: 'Run `ws-lesson-check --sizes S,M,L` before the critic.', modes: ['static'] },
    { id: 'own-doc-choose', src: 'own', file: 'PEDAGOGY_STANDARD.md', add: 'The teacher chooses S, M or L in the print dialog.', modes: ['static'] },
    { id: 'own-doc-slash-table', src: 'own', file: 'design/SKILL_CELL_CONTRACT.md', add: '| size | S / M / L | M |', modes: ['static'] },
    { id: 'own-doc-claude-list', src: 'own', file: 'CLAUDE.md', add: 'Sizes are S, M and L; S fits the most.', modes: ['static'] },
    { id: 'own-doc-agent', src: 'own', file: '.claude/agents/mq-opus-medium.md', add: 'Grade every page type at Size: S as well.', modes: ['static'] },
];

/** The static findings of one file's text (app / gate / doc rules, the allow-list applied): a count. Pure but for ALLOW. */
function textFindings(rel, text) {
    const allow = (f, line) => ALLOW.some((x) => x.file === rel && (!x.rule || x.rule === f.rule) && (x.has === '*' || line.includes(x.has)));
    let n = 0;
    if (rel.endsWith('.md')) {
        if (DOC_RECORDS.some(([p]) => rel === p || rel.startsWith(p))) return 0;
        for (const [, t] of docReadLines(text)) for (const f of docLineFindings(t)) if (!allow(f, t)) n++;
        return n;
    }
    const fn = /^tests\/(scripts|lib)\//.test(rel) ? gateLineFindings : /^js\/modules\/(?!sheet\/)/.test(rel) || rel === 'index.html' ? appLineFindings : null;
    if (!fn) return 0;
    for (const line of text.split('\n')) for (const f of fn(line, rel)) if (!allow(f, line)) n++;
    return n;
}
function plant(m, text) {
    if (m.add != null) return `${text.replace(/\n*$/, '\n')}\n${m.add}\n`;
    return m.all ? text.split(m.find).join(m.to) : text.replace(m.find, m.to);
}
/** --self-test, static half: each static row planted alone must add a finding; every row's anchor must exist. */
function mutationSelfTest() {
    const bad = [];
    for (const m of MUTATIONS) {
        const abs = join(ROOT, m.file);
        if (!existsSync(abs)) { bad.push(m.id); console.log(`  FAIL mut ${m.id}: ${m.file} is gone`); continue; }
        const text = readFileSync(abs, 'utf8');
        if (m.add == null && !text.includes(m.find)) { bad.push(m.id); console.log(`  FAIL mut ${m.id}: its anchor is gone from ${m.file} (the corpus would test nothing)`); continue; }
        if (!m.modes.includes('static')) { console.log(`  ok   mut ${m.id} (${m.src}): browser-only, anchor present -> ${m.expect}`); continue; }
        const before = textFindings(m.file, text);
        const after = textFindings(m.file, plant(m, text));
        const ok = after > before;
        if (!ok) bad.push(m.id);
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} mut ${m.id} (${m.src}) static: ${before} -> ${after} finding(s)`);
    }
    return bad;
}
/** --self-test --browser: every browser row planted together in a copy of the served tree; each row's check must FAIL. */
async function mutationBrowserSelfTest(only) {
    const { mkdtempSync, cpSync, writeFileSync: wf, rmSync } = await import('node:fs');
    const { tmpdir } = await import('node:os');
    const { spawnSync } = await import('node:child_process');
    const rows = MUTATIONS.filter((m) => m.modes.includes('browser') && (!only || m.id === only));
    if (only && only !== 'none' && !rows.length) { console.log(`  FAIL no browser mutation row ${only}`); return [only]; }
    const dir = mkdtempSync(join(tmpdir(), 'nos-mut-'));
    try {
        for (const n of readdirSync(ROOT)) if (!['.git', 'node_modules', 'design', 'tests'].includes(n)) cpSync(join(ROOT, n), join(dir, n), { recursive: true });
        for (const m of rows) {
            const f = join(dir, m.file);
            const t = readFileSync(f, 'utf8');
            if (!t.includes(m.find)) { console.log(`  FAIL mut ${m.id}: anchor not found in the copy`); return [m.id]; }
            wf(f, plant(m, t));
        }
        const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--browser', '--root', dir], { encoding: 'utf8', timeout: 600000 });
        const out = `${r.stdout || ''}${r.stderr || ''}`;
        const failed = out.split('\n').filter((l) => /^\s*FAIL /.test(l)).map((l) => l.replace(/^\s*FAIL /, ''));
        const bad = [];
        for (const m of rows) {
            const hit = failed.find((l) => l.startsWith(m.expect));
            if (!hit) bad.push(m.id);
            console.log(`  ${hit ? 'ok  ' : 'FAIL'} mut ${m.id} (${m.src}) browser: ${hit ? hit.slice(0, 110) : `"${m.expect}" did not FAIL`}`);
        }
        if (only === 'none' && failed.length) { console.log(`  FAIL the unplanted copy fails: ${failed[0].slice(0, 110)}`); bad.push('none'); }
        if (!failed.length) console.log(out.split('\n').slice(-8).join('\n'));
        return bad;
    } finally { rmSync(dir, { recursive: true, force: true }); }
}

async function selfTest() {
    const cases = [
        ['app', "seg('size', pr.size, [['S', 'S', 'Small'], ['M', 'M', 'Medium'], ['L', 'L', 'Large']], 'Size')", 'js/modules/x.js', ['APP-PICKER']],
        ['app', "seg('size', pr.size, [['M', 'M', 'Medium'], ['L', 'L', 'Large']], 'Size')", 'js/modules/x.js', []],
        ['app', "const SIZES = [['L', 'Big'], ['M', 'Medium'], ['S', 'Small']];", 'js/modules/x.js', ['APP-PICKER']],
        ['app', "const SIZES = [['big', 'Big'], ['medium', 'Medium'], ['small', 'Small']];", 'js/modules/x.js', ['APP-TOKEN']],   // r3 token rule: a 'Small' on a size line (the real thumbnail list is allow-listed)
        ['app', "size: ['S', 'M', 'L'].includes(d.size) ? d.size : 'L',", 'js/modules/x.js', ['APP-RESTORE']],
        ['app', "const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];", 'js/modules/x.js', ['APP-TOKEN']],   // r3: flagged; the real one is allow-listed with its reason
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
        ['app', "['S', 'Sunday'], ['M', 'Monday']", 'js/modules/x.js', ['APP-TOKEN']],
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
    bad.push(...mutationSelfTest());
    if (args.includes('--browser')) bad.push(...await mutationBrowserSelfTest());
    const nm = MUTATIONS.length;
    console.log(bad.length ? `${TOOL}: FAIL - self-test (${bad.length}): ${bad.slice(0, 8).join(', ')}` : `${TOOL}: OK (self-test, ${cases.length} lines, ${nm} planted mutations${args.includes('--browser') ? ', browser rows included' : '; browser rows: --self-test --browser'})`);
    process.exit(bad.length ? 1 : 0);
}

async function main() {
    if (args.includes('--self-test')) return selfTest();
    // --plant <row id|none>: ONE browser mutation row planted in a copy of the served tree; FAIL when the gate does not catch it
    // (or, with none, when the unplanted copy fails); it prints the gate's verdict on that copy. The backtest row nos-runtime-s-button runs it on its two fixtures.
    if (args.includes('--plant')) {
        const id = args[args.indexOf('--plant') + 1];
        // prints the GATE's verdict on the planted copy: a caught plant is the gate FAILING that tree; none must be OK
        const bad = await mutationBrowserSelfTest(id);
        const gateFails = id === 'none' ? bad.length > 0 : bad.length === 0;
        console.log(`${TOOL} --plant: ${gateFails ? 'FAIL' : 'OK'} (${id}: ${id === 'none' ? (gateFails ? 'the unplanted copy fails' : 'the unplanted copy passes') : (gateFails ? 'the browser gate fails the planted tree' : 'NOT caught: the planted tree passes')})`);
        process.exit(gateFails ? 1 : 0);
    }
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
                const a = ALLOW.findIndex((x) => x.file === file && (!x.rule || x.rule === f.rule) && (x.has === '*' || line.includes(x.has)));
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
    // NOS-DOCS-ADVISORY (lead 2026-11-13; critic nos r3 D1-D4): --docs-advisory scans the docs like --docs but its DOC
    // findings (and stale DOC allow entries) REPORT only; the browser gate and the app / gate code guard stay blocking.
    // Known hole (critic nos r3 D2): the code guard reads lines, so a gate default built another way (Object.keys({S:1,..}))
    // passes it; the --browser gate covers the BEHAVIOUR (every Size control offers M / L only). Parked: one shared SIZES
    // constant every gate reads, per-span DOC exemptions, per-line row expects (design/status/lf-checks.md).
    const docsAdvisory = args.includes('--docs-advisory');
    if (docsAdvisory && !args.includes('--docs')) args.push('--docs');
    if (args.includes('--docs')) for (const d of docTexts()) for (const [n, t] of d.lines) for (const f of docLineFindings(t)) {
        const a = ALLOW.findIndex((x) => x.file === d.file && (!x.rule || x.rule === f.rule) && (x.has === '*' || t.includes(x.has)));
        if (a >= 0) { used.add(a); continue; }
        findings.push({ file: d.file, line: n, rule: f.rule, msg: f.msg });
    }
    findings.push(...await aliasFindings());
    // round-cap r3: the static half of the mutation self-test runs on EVERY run of this tree (so it is on precritic's path and
    // in deploy session 1): a planted re-introduction the line rules no longer catch, or a corpus anchor that is gone, FAILS.
    // Not on another checkout (--root: a backtest of an older tree, whose anchors are not this tree's)
    if (at < 0) {
        const log = console.log;
        let bad;
        try { console.log = () => {}; bad = mutationSelfTest(); } finally { console.log = log; }
        for (const id of bad) findings.push({ file: 'tests/scripts/ws-no-size-s.mjs', line: 0, rule: 'SELF-TEST', msg: `planted mutation ${id} is not caught (or its anchor is gone): run --self-test` });
    }
    // a stale exemption (its line is gone or no longer offends) fails too - only judged on a tree that has this tool's era
    // (the alias exists), so an old checkout reports its real findings, not ALLOW drift
    const era = findings.every((f) => f.rule !== 'APP-ALIAS');
    if (era) ALLOW.forEach((x, i) => { if (!used.has(i) && (x.rule !== 'DOC' || args.includes('--docs'))) findings.push({ file: x.file, line: 0, rule: 'ALLOW-STALE', msg: `allow-list entry matches nothing: ${x.has.slice(0, 70)}` }); });
    const advisory = docsAdvisory ? findings.filter((f) => f.rule === 'DOC' || (f.rule === 'ALLOW-STALE' && ALLOW.some((x) => x.rule === 'DOC' && x.file === f.file && f.msg.includes(x.has.slice(0, 70))))) : [];
    if (advisory.length) {
        console.log(`  ADVISORY (NOS-DOCS-ADVISORY, not blocking): ${advisory.length} doc finding(s)`);
        for (const f of advisory.slice(0, 25)) console.log(`    ${f.file}:${f.line} ${f.rule} ${f.msg}`);
        for (const f of advisory) findings.splice(findings.indexOf(f), 1);
    }
    const by = {};
    for (const f of findings) (by[f.rule] = by[f.rule] || []).push(f);
    for (const [rule, fs] of Object.entries(by)) {
        console.log(`  ${rule}: ${fs.length}`);
        for (const f of fs.slice(0, process.env.NOSS_ALL ? 1e9 : 25)) console.log(`    ${f.file}:${f.line} ${f.msg}`);
        if (fs.length > 25) console.log(`    ... ${fs.length - 25} more`);
    }
    console.log(findings.length
        ? `${TOOL}: FAIL - ${findings.length} finding(s): ${Object.entries(by).map(([r, f]) => `${r} ${f.length}`).join(', ')}`
        : `${TOOL}: OK (${appFiles.length + 1} app files, ${gateFiles.length} gate files${args.includes('--docs') ? `, ${docFiles().length} live docs` : ''}: no picker offers S, no gate default runs S${at < 0 ? `, ${MUTATIONS.filter((m) => m.modes.includes('static')).length} planted mutations caught` : ''}; ${used.size} reasoned exemption(s))`);
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

        // ---- VISIBILITY (round-cap r3, critic nos r2 N1): a size control is judged by what a teacher SEES and can CLICK, never by
        // the `hidden` attribute or an aria-label. An element is shown when it and every ancestor have a computed display, a
        // visibility and an opacity, and a box; it is clickable when elementFromPoint at its centre (scrolled into view) lands
        // on it. A size option is found by what it does (data-act / data-sp / data-k "size", data-set-size) or by what it says
        // (S M L Small Medium Large Big) inside a group named for size - so a renamed label or a new picker array is still found.
        const scan = (rootSel) => page.evaluate((rootSel) => {
            const WORD = { S: 'S', M: 'M', L: 'L', Small: 'S', Smaller: 'S', Medium: 'M', Large: 'L', Big: 'L', Bigger: 'L' };
            const shown = (el) => {
                const r = el.getBoundingClientRect();
                if (r.width < 2 || r.height < 2) return false;
                for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
                    const cs = getComputedStyle(e);
                    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse' || Number(cs.opacity) < 0.05 || cs.contentVisibility === 'hidden') return false;
                }
                return true;
            };
            const sizeCtx = (el) => {
                for (let e = el, k = 0; e && k < 5; e = e.parentElement, k++) {
                    const t = [e.getAttribute('aria-label'), e.id, typeof e.className === 'string' ? e.className : '', e.getAttribute('data-act'), e.getAttribute('data-sp'), e.getAttribute('data-k')].join(' ');
                    if (/size/i.test(t)) return true;
                    const lab = e.previousElementSibling;
                    if (lab && /^\s*(print\s+)?size\b/i.test(lab.textContent || '')) return true;
                }
                return false;
            };
            const roots = [...document.querySelectorAll(rootSel)];
            const out = [];
            let i = 0;
            for (const root of roots) for (const el of root.querySelectorAll('button, [role="radio"], option, input[type="radio"]')) {
                const own = el.getAttribute('data-act') === 'size' || el.getAttribute('data-sp') === 'size' || el.getAttribute('data-k') === 'size' || el.hasAttribute('data-set-size');
                const nameEl = el.querySelector('.sp-size-name');
                const txt = ((nameEl && nameEl.textContent) || el.textContent || el.value || '').trim();
                const raw = el.getAttribute('data-v') || el.getAttribute('data-set-size') || (el.tagName === 'OPTION' || el.tagName === 'INPUT' ? el.value : '') || '';
                const v = WORD[raw] || WORD[txt] || null;
                if (!v || !(own || sizeCtx(el))) continue;
                const host = el.tagName === 'OPTION' ? el.closest('select') : el;
                const vis = !!host && shown(host);
                let click = false;
                if (vis && !el.disabled && el.getAttribute('aria-disabled') !== 'true') {
                    host.scrollIntoView({ block: 'center', inline: 'center' });
                    const r = host.getBoundingClientRect();
                    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
                    click = !!hit && (hit === host || host.contains(hit));
                }
                el.setAttribute('data-nos-i', String(i));
                const on = el.getAttribute('aria-checked') === 'true' || el.getAttribute('aria-pressed') === 'true' || el.selected === true || el.checked === true;
                out.push({ i: i++, v, word: (txt || raw).replace(/\s+/g, ' ').slice(0, 24), vis, click, on, tag: el.tagName.toLowerCase() });
            }
            return { roots: roots.length, opts: out };
        }, rootSel);
        // the size the surface really builds with: the preview page's data-ws-size (a built page), or the stored default
        const builtSize = (how) => page.evaluate(async (how) => {
            if (how.startsWith('frame:')) {
                const f = document.querySelector(how.slice(6));
                try { const pg = f && f.contentDocument && f.contentDocument.querySelector('.ws-page[data-ws-size]'); return pg ? pg.getAttribute('data-ws-size') : null; } catch (e) { return null; }
            }
            if (how === 'defaults') return (await import('/js/modules/teacher-ui.js')).printDefaults().size;
            if (how === 'sheet') return window.tvSheetPrint.get().opts.size;
            return null;
        }, how);
        const waitSize = async (how, want, ms = 20000) => { let got = null; for (let t = 0; t < ms; t += 200) { got = await builtSize(how); if (got === want) return got; await new Promise((r) => setTimeout(r, 200)); } return got; };
        const clickOpt = async (i) => {
            const pt = await page.evaluate((i) => { const el = document.querySelector(`[data-nos-i="${i}"]`); if (!el) return null; const host = el.tagName === 'OPTION' ? el.closest('select') : el; host.scrollIntoView({ block: 'center', inline: 'center' }); const r = host.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, sel: el.tagName === 'OPTION', v: el.value }; }, i);
            if (!pt) return false;
            if (pt.sel) await page.evaluate((i) => { const el = document.querySelector(`[data-nos-i="${i}"]`); const s = el.closest('select'); s.value = el.value; s.dispatchEvent(new Event('change', { bubbles: true })); }, i);
            else await page.mouse.click(pt.x, pt.y);
            return true;
        };
        /** One surface in one mode. fixed: the layout is fixed (compact), so NO size option may be visible. how: where the
         *  built size is read (frame:<sel> | defaults | sheet). Every visible option is CLICKED and must change that size. */
        const judgeSurface = async (name, rootSel, { fixed = false, how = null, settle = null } = {}) => {
            const { roots, opts } = await scan(rootSel);
            check(`SURFACE ${name}: drawn`, roots > 0, `no ${rootSel} on the page`);
            const sOpts = opts.filter((o) => o.v === 'S' && (o.vis || o.click));
            check(`VISIBLE ${name}: no visible or clickable S option`, !sOpts.length, `shows ${sOpts.map((o) => `"${o.word}"`).join(', ')}`);
            const live = opts.filter((o) => o.vis);
            if (fixed) check(`FIXED ${name}: no visible size picker where the layout is fixed`, !live.length, `${live.length} visible size option(s): ${live.map((o) => `"${o.word}"${o.click ? ' (clickable)' : ''}`).join(', ')}`);
            else {
                check(`VISIBLE ${name}: a size picker is visible and clickable`, live.some((o) => o.click), `${live.length} visible, ${live.filter((o) => o.click).length} clickable`);
                const on = live.filter((o) => o.on);
                check(`VISIBLE ${name}: exactly one option checked, and it is M`, on.length === 1 && on[0].v === 'M', `checked: ${JSON.stringify(on.map((o) => o.word))}`);
            }
            if (!how) return;
            if (settle) await settle();
            // WORKS: every visible option, clicked where a teacher clicks, changes what is built (a dead control fails);
            // re-scanned after the settle (a rebuild redraws the controls), the checked one last
            const fresh = (await scan(rootSel)).opts.filter((o) => o.vis && o.v !== 'S').sort((a, b) => a.on - b.on);
            for (const o of fresh) {
                const before = await builtSize(how);
                const want = o.v;
                if (!(await clickOpt(o.i))) { check(`WORKS ${name}: "${o.word}" can be clicked`, false, 'gone before the click'); continue; }
                const after = await waitSize(how, want);
                check(`WORKS ${name}: clicking "${o.word}" builds at ${want}`, after === want, `built at ${after} (was ${before})`);
                await scan(rootSel);   // re-tag after the re-render
            }
            const back = (await scan(rootSel)).opts.find((o) => o.vis && o.v === 'M');
            if (back) { await clickOpt(back.i); await waitSize(how, 'M', 8000); }
        };
        const pagesAtS = (sel) => page.evaluate((sel) => { const r = document.querySelector(sel); return r ? [...r.querySelectorAll('.ws-S, [data-ws-size="S"]')].length : -1; }, sel);
        const simpleBuilt = () => page.evaluate(async () => { for (let i = 0; i < 200; i++) { const s = (await import('/js/modules/simple-print.js')).simplePrintState(); if (s && !s.busy && s.built) return true; await new Promise((r) => setTimeout(r, 100)); } return false; });

        // Settings > Printing defaults
        await page.evaluate(() => window.tvGo('settings'));
        await waitFor(page, () => !!document.getElementById('tvPrintDefH'), 10000, 'Settings');
        await judgeSurface('Settings > Printing defaults', 'section[aria-labelledby="tvPrintDefH"]', { how: 'defaults' });

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

        // the worksheet sheet (Print from the tray), a normal list
        await page.evaluate(() => {
            window.UnifiedSkills.clear();
            window.UnifiedSkills.add({ domainId: 'number_operations', categoryId: 'addition', skillId: 'add_facts', skillLabel: 'Addition Facts', categoryIcon: '+', categoryName: 'Addition', domainColor: '#8b5cf6' });
            window.UnifiedSkills._syncAllImmediate();
            window.tvSheetPrint.set({ opts: { size: 'S' } });
            window.tvOpenSheet('print');
        });
        await waitFor(page, () => !!document.querySelector('.tvs-overlay [data-act="size"]'), 15000, 'worksheet sheet Size');
        await judgeSurface('worksheet sheet', '.tvs-overlay', { how: 'sheet' });
        await page.evaluate(() => window.tvCloseSheet && window.tvCloseSheet());

        // the teacher Print screen (Setup), a normal list
        await page.evaluate(() => window.tvOpenPrintWith([{ categoryId: 'addition', skillId: 'add_facts' }]));
        await waitFor(page, () => !!document.getElementById('tvSetupH'), 15000, 'Print screen Setup');
        await judgeSurface('Print screen Setup', '#tvSetup', { how: 'frame:#tvPreviewFrame', settle: () => waitSize('frame:#tvPreviewFrame', 'M', 30000) });

        // F3 (critic nos r1) + N1 (r2): "All rows on one page" prints compact. Every screen names it with ONE label and shows
        // NO size option a teacher can see or click; no caption says "Small" or "Size S"; every visible radiogroup has one checked
        const COMPACT = 'Compact (12 tables on one page)';
        const compactView = (where, rootSel) => page.evaluate((where, rootSel, COMPACT) => {
            const shown = (el) => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false; } return true; };
            const root = document.querySelector(rootSel) || document.body;
            const fixed = [...root.querySelectorAll('[data-size-fixed="compact"]')].filter(shown).map((e) => e.textContent.replace(/\s+/g, ' ').trim());
            const orphanGroups = [...root.querySelectorAll('[role="radiogroup"]')].filter(shown)
                .filter((g) => g.querySelectorAll('[role="radio"]').length && g.querySelectorAll('[role="radio"][aria-checked="true"]').length !== 1)
                .map((g) => g.getAttribute('aria-label') || g.id || '(unnamed)');
            const small = [...root.querySelectorAll('.tv-cap, .tvs-muted, .tvs-row-sub, .sp-hint, p')].filter(shown).map((e) => e.textContent).filter((t) => /\bSmall\b|\bSize S\b|smaller digits/.test(t)).map((t) => t.trim().slice(0, 80));
            return { where, fixed, orphanGroups, small, hasLabel: fixed.length > 0 && fixed.every((t) => t.includes(COMPACT)) };
        }, where, rootSel, COMPACT);
        const judgeCompact = async (where, rootSel, how) => {
            const c = await compactView(where, rootSel);
            check(`COMPACT ${c.where}: one visible label "${COMPACT}"`, c.hasLabel, `labels: ${JSON.stringify(c.fixed)}`);
            check(`COMPACT ${c.where}: every visible radiogroup has one checked`, !c.orphanGroups.length, `nothing (or several) checked in ${c.orphanGroups.join(', ')}`);
            check(`COMPACT ${c.where}: no caption names Small / Size S`, !c.small.length, c.small.join(' | '));
            await judgeSurface(`${where} (compact)`, rootSel, { fixed: true, how });
        };
        const ONE = { categoryId: 'multiplication', skillId: 'count_by_tables', opts: { onePage: true } };
        await page.evaluate((ONE) => window.tvOpenPrintWith([ONE]), ONE);
        await waitFor(page, () => !!document.getElementById('tvSetupH'), 15000, 'Print screen Setup (one page)');
        await page.evaluate(async () => { for (let i = 0; i < 50 && !document.querySelector('[data-size-fixed]'); i++) await new Promise((r) => setTimeout(r, 100)); });
        await judgeCompact('Print screen Setup', '#tvSetup', 'frame:#tvPreviewFrame');
        await page.evaluate((ONE) => {
            window.UnifiedSkills.clear();
            window.UnifiedSkills.add({ domainId: 'number_operations', categoryId: ONE.categoryId, skillId: ONE.skillId, skillLabel: 'Count by', categoryIcon: 'x', categoryName: 'Multiplication', domainColor: '#8b5cf6', opts: ONE.opts });
            window.UnifiedSkills._syncAllImmediate();
            window.tvOpenSheet('print');
        }, ONE);
        await page.evaluate(async () => { for (let i = 0; i < 80 && !document.querySelector('[data-size-fixed]'); i++) await new Promise((r) => setTimeout(r, 100)); });
        await judgeCompact('worksheet sheet', '.tvs-overlay', 'sheet');
        await page.evaluate(() => window.tvCloseSheet && window.tvCloseSheet());

        // the simple print, every mode: stored S (fact rows), a quick print saved at S, a cell skill, and the compact one page
        const SIMPLE = [
            ['simple print (stored S, fact rows)', 'tray', [{ categoryId: 'addition', skillId: 'add_facts' }]],
            ['simple print (quick print saved at S)', 'quick', null],
            ['simple print (cells)', 'tray', [{ categoryId: 'addition', skillId: 'add_100_regroup' }]],
            ['simple print', 'compact', [ONE]],
        ];
        for (const [name, how, list] of SIMPLE) {
            await page.evaluate(async (how, list) => {
                const sp = await import('/js/modules/simple-print.js');
                sp.closeSimplePrint();
                if (how === 'quick') sp.openQuickPrint('qp_nos'); else sp.openSimplePrint(list, { from: 'tray' });
            }, how, list);
            await waitFor(page, () => !!document.querySelector('.sp-root .sp-step'), 15000, name);
            await simpleBuilt();
            await waitSize('frame:#spFrame', how === 'compact' ? 'S' : 'M', 20000);
            if (how === 'compact') { await judgeCompact(name, '.sp-root', 'frame:#spFrame'); continue; }
            const st = await page.evaluate(async () => (await import('/js/modules/simple-print.js')).simplePrintState());
            check(`STORE-SIMPLE ${name}: its size`, st && st.prefs && st.prefs.size === 'M', `is ${st && st.prefs && st.prefs.size}`);
            const nS = await pagesAtS('body');
            check(`PAGES ${name}: no page on the screen at S`, nS === 0, `${nS} page(s) at S`);
            check(`PAGES ${name}: the preview page is built at M`, (await builtSize('frame:#spFrame')) === 'M', `built at ${await builtSize('frame:#spFrame')}`);
            await judgeSurface(name, '.sp-root', { how: 'frame:#spFrame' });
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
