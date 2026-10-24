// baseline-night.cjs - the backtest "baseline-night-keeps-red" (critic r3 D1; ws-backtest commit-pair row, node only).
//
//   node tests/fixtures/precritic/baseline-night.cjs --root <a checkout>      # ws-backtest passes --root {root}
//
// It runs THAT checkout's tests/scripts/ws-coverage-matrix.cjs (copied into a sandbox beside a stub ws-print-lint.cjs
// and a stub ws-envelope.mjs, so no browser is launched; the app's skills and rows load from the checkout with
// MQ_ROOT) through the critic's two reproduce cases, on the real row subtraction:sub_50_no_regroup|single/layout-timed
// whose stub print gives 2 L-DENSITY PG-23 findings at L:
//   1. the row is pinned at zero in baseline.json and regresses before its slice's night; the night runs
//      `--slice <its slice>/28 --red-from <dir> --write-baseline`: the row must be RED in that run file and stay red
//      in the fold (pre-fix: it was re-pinned with the rise and reported OK);
//   2. the row is pinned at zero in baseline.added.json and RED in the 10-22 run; a later slice night re-selects it
//      (--red-from) with --write-baseline, then a re-run of the red row: it must stay red in the fold (pre-fix: the
//      later slice file pinned the rise, won the merge, and the re-run listed it OK).
// Prints `baseline-night-keeps-red: OK` when both keep the row red, else `baseline-night-keeps-red: FAIL - ...`.
// The matrix's print-lint batches go through /tmp/mq-browser-run.sh as always (the stub holds a slot for a moment).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const NAME = 'baseline-night-keeps-red';
const ROOT = path.resolve(arg('root', process.env.MQ_ROOT || path.join(__dirname, '..', '..', '..')));
const HERE = path.resolve(__dirname, '..', '..', '..');
const SKILL = 'subtraction:sub_50_no_regroup';
const R = `${SKILL}|single/layout-timed`;
const h32 = (s) => parseInt(crypto.createHash('sha256').update(s).digest('hex').slice(0, 8), 16);
const sliceOf = (id) => (h32('slice:' + id) % 28) + 1;   // ws-coverage-matrix inSlice, n = 28

const STUB_LINT = `'use strict';
// stub ws-print-lint for ${NAME}: --check-jobs says every job prints; --jobs writes one document per job whose
// findings come from MQ_STUB_FINDINGS {"<row id>": {"<size>": <count>}} (L-DENSITY PG-23 "dense page")
const fs = require('fs');
const a = process.argv.slice(2);
const arg = (k) => { const i = a.indexOf('--' + k); return i > -1 ? a[i + 1] : null; };
if (arg('check-jobs')) { const jobs = JSON.parse(fs.readFileSync(arg('check-jobs'), 'utf8')); process.stdout.write(JSON.stringify(jobs.map((j) => ({ id: j.id, ok: true })))); process.exit(0); }
const jobs = JSON.parse(fs.readFileSync(arg('jobs'), 'utf8'));
const want = JSON.parse(process.env.MQ_STUB_FINDINGS || '{}');
const documents = jobs.map((j) => { const [row, size] = j.id.split('@'); const n = ((want[row] || {})[size]) || 0; return { id: j.id, pages: 1, keyPages: 1, findings: Array.from({ length: n }, () => ({ lint: 'L-DENSITY', rule: 'PG-23', page: 1, msg: 'dense page' })) }; });
fs.writeFileSync(arg('json'), JSON.stringify({ documents, pending: [], na: [] }));
console.log('ws-print-lint (stub): ' + documents.length + ' document(s)');
`;
const STUB_ENVELOPE = `process.stdout.write(JSON.stringify({ pairs: {} }));\n`;

function sandbox() {
    const s = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-bnight-'));
    fs.mkdirSync(path.join(s, 'tests', 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(s, 'tests', 'lib'), { recursive: true });
    fs.copyFileSync(path.join(ROOT, 'tests', 'scripts', 'ws-coverage-matrix.cjs'), path.join(s, 'tests', 'scripts', 'ws-coverage-matrix.cjs'));
    fs.writeFileSync(path.join(s, 'tests', 'scripts', 'ws-print-lint.cjs'), STUB_LINT);
    fs.writeFileSync(path.join(s, 'tests', 'scripts', 'ws-envelope.mjs'), STUB_ENVELOPE);
    fs.writeFileSync(path.join(s, 'tests', 'lib', 'ws-harness.cjs'), '// stub\n');
    fs.copyFileSync(path.join(HERE, 'tests', 'scripts', 'mq-browser-run.sh'), path.join(s, 'tests', 'scripts', 'mq-browser-run.sh'));
    return s;
}
function matrix(s, args) {
    const r = spawnSync('node', [path.join(s, 'tests', 'scripts', 'ws-coverage-matrix.cjs'), ...args], { cwd: s, encoding: 'utf8', env: { ...process.env, MQ_ROOT: ROOT, MQ_STUB_FINDINGS: JSON.stringify({ [R]: { L: 2 } }) }, maxBuffer: 1 << 26 });
    const out = `${r.stdout || ''}${r.stderr || ''}`;
    for (const l of out.trim().split('\n').filter((x) => /red now|status of this run|wrote the per-row|--red-from|^ws-coverage-matrix: |re-selected|L L-DENSITY/.test(x))) console.log(`    | ${l.replace(/^ws-coverage-matrix: /, 'matrix> ')}`);
    return { code: r.status, out };
}
const readJ = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
const statusIn = (f) => { const j = readJ(f); const row = j && (j.rows || []).find((x) => x.id === R); return row ? row.status : 'absent'; };

const t0 = Date.now();
const s = sandbox();
const fails = [];
try {
    const fold = (d) => require(path.join(s, 'tests', 'scripts', 'ws-coverage-matrix.cjs')).foldRuns(d).red.includes(R);
    const zero = { S: {}, M: {}, L: {} };
    // 1. a pinned row regresses before its slice's night
    const d1 = path.join(s, 'm1'); fs.mkdirSync(d1);
    fs.writeFileSync(path.join(d1, 'baseline.json'), JSON.stringify({ rows: { [R]: zero } }));
    const i = sliceOf(R);
    console.log(`case 1: ${R} pinned at zero in baseline.json, 2 findings at L; the slice ${i}/28 night with --write-baseline`);
    matrix(s, ['--skills', SKILL, '--kind', 'single', '--rows', R, '--slice', `${i}/28`, '--red-from', d1, '--write-baseline', '--baseline', path.join(d1, 'baseline.json'), '--slots', '1', '--out', path.join(d1, '2026-10-23.json'), '--report-only']);
    const st1 = statusIn(path.join(d1, '2026-10-23.json'));
    const red1 = fold(d1);
    console.log(`  run file: ${st1}; red in the fold: ${red1}`);
    if (st1 !== 'RED' || !red1) fails.push(`case 1: the regressed pinned row is ${st1} in the slice night's run file and ${red1 ? '' : 'NOT '}red in the fold`);
    // 2. a red row re-selected by a later baseline night, then re-run
    const d2 = path.join(s, 'm2'); fs.mkdirSync(d2);
    fs.writeFileSync(path.join(d2, 'baseline.added.json'), JSON.stringify({ rows: { [R]: zero } }));
    fs.writeFileSync(path.join(d2, '2026-10-22.json'), JSON.stringify({ tool: 'ws-coverage-matrix', commit: 'c', finished: '2026-10-22T02:00:00Z', rows: [{ id: R, skill: SKILL, kind: 'single', args: ['--roles', 'fact-probe'], status: 'RED', rises: ['L L-DENSITY PG-23: 0 -> 2'] }], red: [R] }));
    const j = (i % 28) + 1;
    console.log(`case 2: ${R} pinned at zero in baseline.added.json, RED in the 10-22 run; the slice ${j}/28 night (--red-from re-selects it) with --write-baseline, then a re-run of the red row`);
    matrix(s, ['--skills', SKILL, '--kind', 'single', '--rows', R, '--slice', `${j}/28`, '--red-from', d2, '--write-baseline', '--baseline', path.join(d2, 'baseline.json'), '--slots', '1', '--out', path.join(d2, '2026-10-23.json'), '--report-only']);
    const st2a = statusIn(path.join(d2, '2026-10-23.json'));
    matrix(s, ['--skills', SKILL, '--kind', 'single', '--rows', R, '--red-from', d2, '--baseline', path.join(d2, 'baseline.json'), '--slots', '1', '--out', path.join(d2, '2026-10-24.json'), '--report-only']);
    const st2b = statusIn(path.join(d2, '2026-10-24.json'));
    const red2 = fold(d2);
    console.log(`  baseline night: ${st2a}; the re-run: ${st2b}; red in the fold: ${red2}`);
    if (!red2) fails.push(`case 2: the red row re-selected by a baseline night is no longer red in the fold (night ${st2a}, re-run ${st2b})`);
} finally {
    fs.rmSync(s, { recursive: true, force: true });
}
console.log(`  ${((Date.now() - t0) / 1000).toFixed(1)} s, root ${ROOT}`);
console.log(fails.length ? `${NAME}: FAIL - ${fails.join('; ')}` : `${NAME}: OK (both cases keep the regressed row RED through a baseline night)`);
process.exit(fails.length ? 1 : 0);
