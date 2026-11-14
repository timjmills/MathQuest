#!/usr/bin/env node
// ws-rowcap-fill - ROWCAP-FILL (lf-engine row cap, critic r1 F3): a section of a CAPPED template (layout.js ROW_ROOM_MM) is
// drawn at most drawn + room a row (rowCapMm), so the page must also COUNT its rows at that height: rows x cellH leaves at most
// one row's height of the grid free. r1 F1 / F2: Match 3 with a 48 mm footprint (asks 58 mm) drawing 50 mm printed 3 rows of
// 52.5 mm and a 75 mm white foot at L, where 4 fit. Pure node; the same assertion is in ws-layout-unit (ROWCAP-FILL).
//
//   node tests/scripts/ws-rowcap-fill.mjs                 # this tree
//   node tests/scripts/ws-rowcap-fill.mjs --root <tree>   # another checkout's layout.js (the backtest's {root})
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const at = argv.indexOf('--root');
const ROOT = at >= 0 ? resolve(argv[at + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const L = await import(pathToFileURL(resolve(ROOT, 'js', 'modules', 'sheet', 'layout.js')).href);
const fails = [];
if (typeof L.rowCapMm !== 'function') fails.push('layout.js has no rowCapMm (no row-stretch cap in this tree)');
else {
    for (const [size, hMm] of [['M', 46], ['L', 46], ['M', 48], ['L', 48]]) {
        const its = Array.from({ length: 6 }, () => ({ template: 'vocab-match3', footprint: { wMm: 186, hMm, measure: false, factLike: false, maxCols: 1, points: 3, evenRows: true, wholeRows: true },
            measured: { 1: { hMm: 50, fits: true } } }));
        const Lc = L.resolveSectionLayout({ role: 'independent', columns: 'auto' }, its, 'A4', 186, { size, look: 'ican', header: L.FULL_HEADER });
        const cap = L.rowCapMm(51, its);
        const free = Lc.gridH - Lc.rows * Lc.cellH;
        if (!(Lc.cellH <= cap + 0.01 && free < cap)) fails.push(`${size} footprint ${hMm} mm: ${Lc.rows} rows of ${Lc.cellH} mm (cap ${cap} mm) leave ${free.toFixed(1)} mm of a ${Lc.gridH} mm grid free - more than one row`);
    }
}
for (const f of fails) console.log(`  FAIL ROWCAP-FILL ${f}`);
console.log(`ws-rowcap-fill: ${fails.length ? `FAIL (${fails.length})` : 'OK'}`);
process.exit(fails.length ? 1 : 0);
