#!/usr/bin/env node
// ws-rowcap-fill - ROWCAP-FILL (lf-engine row cap, critic r1 F3; stage 2 = r1 F4: EVERY template): a section of any template
// that is not exempt (layout.js ROW_STRETCH_EXEMPT) is drawn at most drawn + room a row (rowCapMm), so the page must also COUNT
// its rows at that height: rows x cellH leaves at most one row's height of the grid free, unless the deal or the role caps the
// count. r1 F1 / F2: Match 3 with a 48 mm footprint (asks 58 mm) drawing 50 mm printed 3 rows of 52.5 mm and a 75 mm white foot
// at L, where 4 fit. Stage 2: every registered template (sheet/index.js listCells) and the lesson bands' 'lesson-vocab' is held
// to its cap - a stage-1 tree stretches an unlisted template's rows past it. Pure node; the Match 3 assertion is also in
// ws-layout-unit (ROWCAP-FILL).
//
//   node tests/scripts/ws-rowcap-fill.mjs                 # this tree
//   node tests/scripts/ws-rowcap-fill.mjs --root <tree>   # another checkout's layout.js (the backtest's {root})
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const at = argv.indexOf('--root');
const ROOT = at >= 0 ? resolve(argv[at + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const L = await import(pathToFileURL(resolve(ROOT, 'js', 'modules', 'sheet', 'layout.js')).href);
// THE RULE is this script's own tree's (as ws-empty-band EB-STRETCH): a commit-pair backtest judges an old tree's layout by
// today's cap table, so a stage-1 tree (every unlisted template uncapped) is caught stretching their rows
const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const R = await import(pathToFileURL(resolve(HERE, 'js', 'modules', 'sheet', 'layout.js')).href);
const fails = [];
if (typeof L.rowCapMm !== 'function') fails.push('layout.js has no rowCapMm (no row-stretch cap in this tree)');
else {
    const S = await import(pathToFileURL(resolve(ROOT, 'js', 'modules', 'sheet', 'index.js')).href);
    const exempt = R.ROW_STRETCH_EXEMPT || {};
    const tmpls = [...new Set([...(S.listCells ? S.listCells() : []), 'vocab-match3', 'lesson-vocab', 'count-row'])].filter((t) => !Object.prototype.hasOwnProperty.call(exempt, t));
    let judged = 0;
    for (const t of tmpls) {
        // (drawn 50 mm under a 46 / 48 mm footprint - the Match 3 shapes of r1 F3 - and a 30 mm row: one column, 6 dealt)
        for (const [size, hMm, drawn] of [['M', 46, 50], ['L', 46, 50], ['M', 48, 50], ['L', 48, 50], ['M', 28, 30], ['L', 28, 30]]) {
            const its = Array.from({ length: 6 }, () => ({ template: t, footprint: { wMm: 170, hMm, measure: false, factLike: false, maxCols: 1, points: 3, evenRows: true, wholeRows: true },
                measured: { 1: { hMm: drawn, fits: true } } }));
            const Lc = L.resolveSectionLayout({ role: 'independent', columns: 'auto' }, its, 'A4', 186, { size, look: 'ican', header: L.FULL_HEADER });
            const cap = R.rowCapMm(drawn + 1, its);
            const free = Lc.gridH - Lc.rows * Lc.cellH;
            // (the deal or the role caps the count: every dealt item is on the page, or the role's ceiling note)
            const capped = Lc.rows * Lc.cols >= its.length || /At most \d+ problems/.test(Lc.note || '');
            judged++;
            if (!(Lc.cellH <= cap + 0.01)) fails.push(`${t} ${size} footprint ${hMm} drawn ${drawn} mm: rows of ${Lc.cellH} mm pass the cap ${Number.isFinite(cap) ? cap.toFixed(1) : cap} mm (drawn + room) - the row is stretched`);
            else if (!(free < cap) && !capped) fails.push(`${t} ${size} footprint ${hMm} drawn ${drawn} mm: ${Lc.rows} rows of ${Lc.cellH} mm (cap ${cap} mm) leave ${free.toFixed(1)} mm of a ${Lc.gridH} mm grid free - more than one row`);
        }
    }
    // UNLISTED (stage 2 unit assertion): a template the tree has never heard of, missing from every table, is CAPPED by the
    // tree's own rowCapMm at drawn + its default room - never Infinity (stage 1 left every unlisted template uncapped)
    const un = L.rowCapMm(50, [{ template: 'zz-unlisted-template' }]);
    if (!(Number.isFinite(un) && un > 50 && un <= 60)) fails.push(`UNLISTED: rowCapMm(50, an unlisted template) = ${un} - a template missing from the exception list must be capped (drawn + default room)`);
    for (const t of Object.keys(exempt)) if (Number.isFinite(L.rowCapMm(50, [{ template: t }]))) fails.push(`EXEMPT: ${t} is in ROW_STRETCH_EXEMPT but the tree caps it`);
    console.log(`  ${tmpls.length} templates x 6 shapes judged (${judged}); exempt: ${Object.keys(exempt).join(', ') || '(none)'}`);
}
for (const f of fails) console.log(`  FAIL ROWCAP-FILL ${f}`);
console.log(`ws-rowcap-fill: ${fails.length ? `FAIL (${fails.length})` : 'OK'}`);
process.exit(fails.length ? 1 : 0);
