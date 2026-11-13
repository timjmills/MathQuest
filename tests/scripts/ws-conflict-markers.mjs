// ws-conflict-markers — no merge conflict markers in tracked files (lf-hosts critic r1 F2: merge 3c7b548a committed
// "<<<<<<< HEAD" / ">>>>>>> ..." blocks into design/lessons-first/CHECKS_FROM_CRITICS.md and tests/fixtures/precritic/backtests.json,
// and no gate looked). A line that STARTS with seven "<" or seven ">" and a space is a marker; "=======" alone is not judged
// (Markdown uses it for setext headings).
//
//   node tests/scripts/ws-conflict-markers.mjs               # this tree's tracked files
//   node tests/scripts/ws-conflict-markers.mjs --root <dir>  # another checkout (ws-backtest commit-pair rows); MQ_ROOT works too
//   node tests/scripts/ws-conflict-markers.mjs --self-test   # the line rule on planted text (no git)
//
// Prints each marker as file:line and `ws-conflict-markers: OK` / `FAIL - n marker line(s) in m file(s)`; exit 1 on FAIL,
// 2 when git cannot list the tree (never a silent pass).

import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOL = 'ws-conflict-markers';
const args = process.argv.slice(2);
const at = args.indexOf('--root');
const ROOT = resolve(at >= 0 && args[at + 1] ? args[at + 1] : process.env.MQ_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..', '..'));
// built from parts so this file never holds a marker line itself
const LT = '<'.repeat(7), GT = '>'.repeat(7);
export const isMarker = (line) => line.startsWith(LT + ' ') || line.startsWith(GT + ' ') || line === LT || line === GT;

if (args.includes('--self-test')) {
    const cases = [[`${LT} HEAD`, true], [`${GT} origin/branch`, true], ['=======', false], [` ${LT} HEAD`, false], ['a <<< b', false], [`${LT}`, true]];
    const bad = cases.filter(([l, want]) => isMarker(l) !== want);
    for (const [l, want] of cases) console.log(`  ${isMarker(l) === want ? 'ok  ' : 'FAIL'} ${JSON.stringify(l)} -> ${isMarker(l) ? 'marker' : 'text'}`);
    console.log(bad.length ? `${TOOL}: FAIL - self-test (${bad.length})` : `${TOOL}: OK (self-test, ${cases.length} lines)`);
    process.exit(bad.length ? 1 : 0);
}

const r = spawnSync('git', ['grep', '-n', '-I', '-E', `^(${LT}|${GT})( |$)`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (r.status !== 0 && r.status !== 1) {
    console.log(`${TOOL}: git grep failed in ${ROOT}: ${(r.stderr || '').trim().slice(0, 300)}`);
    console.log(`${TOOL}: FAIL - cannot read the tree`);
    process.exit(2);
}
const hits = String(r.stdout || '').split('\n').filter(Boolean).filter((l) => { const m = /^([^:]+):(\d+):(.*)$/.exec(l); return m && isMarker(m[3]); });
const files = [...new Set(hits.map((l) => l.split(':')[0]))];
for (const l of hits.slice(0, 40)) console.log(`  ${l.slice(0, 160)}`);
if (hits.length > 40) console.log(`  ... ${hits.length - 40} more`);
console.log(hits.length ? `${TOOL}: FAIL - ${hits.length} conflict marker line(s) in ${files.length} file(s): ${files.slice(0, 6).join(', ')}` : `${TOOL}: OK (no conflict markers in the tracked files)`);
process.exit(hits.length ? 1 : 0);
