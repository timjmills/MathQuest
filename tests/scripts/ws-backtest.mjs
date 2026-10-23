// ws-backtest — proves each new check (IMPROVEMENT_PLAN §1.4 S2, "Backtests for the new checks"): it must FAIL on the
// state a critic failed and PASS on the fix. The table is data: tests/fixtures/precritic/backtests.json.
//
//   node tests/scripts/ws-backtest.mjs                     # every row
//   node tests/scripts/ws-backtest.mjs --row notation      # one row (repeatable or comma list)
//   node tests/scripts/ws-backtest.mjs --kind fixture      # only the fixture rows (or commit-pair)
//   node tests/scripts/ws-backtest.mjs --list              # the table, with pending rows marked
//   node tests/scripts/ws-backtest.mjs --table other.json  # another table (same shape)
//   node tests/scripts/ws-backtest.mjs --keep              # keep the commit-pair worktrees (debugging)
//
// Row kinds:
//   fixture      the command runs on the row's FAIL fixture, then on its PASS fixture ({fixture} in the command)
//   commit-pair  each commit is checked out in a temporary `git worktree` (under $MQ_BACKTEST_TMP, default the OS tmp
//                dir; removed afterwards); the command runs from the CURRENT tree with {root} = that checkout and
//                MQ_ROOT set to it, so the check under test is always today's script. A row with browser: true runs
//                through /tmp/mq-browser-run.sh (the two-slot browser runner).
// A row with pending: true has no command yet; it is reported PENDING (never OK) and makes the run FAIL.
// A state's result is the check's own last "name: OK" / "name: FAIL" line (else its exit code); a row PASSes when
// its fail state gives the expected FAIL and its pass state the expected OK.
//
// Prints one table (row, kind, fail-state result, pass-state result, verdict) and `ws-backtest: OK` or
// `ws-backtest: FAIL (n)`; exits non-zero on FAIL.

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const argAll = (f) => args.flatMap((a, i) => (a === f && i + 1 < args.length ? String(args[i + 1]).split(',') : [])).map((s) => s.trim()).filter(Boolean);
const BROWSER_RUN = '/tmp/mq-browser-run.sh';

const tableFile = resolve(ROOT, arg('--table', 'tests/fixtures/precritic/backtests.json'));
if (!existsSync(tableFile)) { console.log(`ws-backtest: no table ${tableFile}`); process.exit(2); }
const table = JSON.parse(readFileSync(tableFile, 'utf8'));
let rows = table.rows || [];
const onlyRows = argAll('--row');
const onlyKind = arg('--kind', null);
if (onlyRows.length) {
    const unknown = onlyRows.filter((id) => !rows.some((r) => r.id === id));
    if (unknown.length) { console.log(`ws-backtest: unknown row(s) ${unknown.join(', ')} (rows: ${rows.map((r) => r.id).join(', ')})`); process.exit(2); }
    rows = rows.filter((r) => onlyRows.includes(r.id));
}
if (onlyKind) rows = rows.filter((r) => r.kind === onlyKind);

const pad = (s, w) => { const t = String(s); return t.length >= w ? t.slice(0, w - 1) + ' ' : t.padEnd(w); };
const stateName = (s) => (s && (s.fixture || s.commit)) || '-';

if (has('--list')) {
    console.log(`${pad('row', 28)}${pad('kind', 13)}${pad('fail state', 46)}${pad('pass state', 46)}status`);
    for (const r of rows) {
        console.log(`${pad(r.id, 28)}${pad(r.kind, 13)}${pad(stateName(r.fail), 46)}${pad(stateName(r.pass), 46)}${r.pending ? 'PENDING (no command yet)' : r.browser ? 'ready (browser)' : 'ready'}`);
    }
    process.exit(0);
}

/** Run one command; the check's verdict is its last "<name>: OK|FAIL" line, else its exit code. */
function runCheck(cmd, { env = {}, browser = false } = {}) {
    const full = browser ? `${BROWSER_RUN} ${cmd}` : cmd;
    const t0 = Date.now();
    const r = spawnSync('bash', ['-c', full], { cwd: ROOT, env: Object.assign({}, process.env, env), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const out = `${r.stdout || ''}${r.stderr || ''}`;
    const lines = out.trim().split('\n').filter((l) => /^[\w./-]+(?: --?[\w-]+)?: (OK|FAIL)\b/.test(l));
    const last = lines.length ? lines[lines.length - 1] : '';
    let result;
    if (/: OK\b/.test(last)) result = 'OK';
    else if (/: FAIL\b/.test(last)) result = 'FAIL';
    else result = r.status === 0 ? 'OK' : `ERROR(${r.status === null ? r.signal : r.status})`;
    return { result, ms: Date.now() - t0, line: last || out.trim().split('\n').slice(-1)[0] || '', status: r.status };
}

/** A temporary detached worktree of `commit`, or throws. */
function addWorktree(commit, base, label) {
    const dir = join(base, `${label}-${commit}`);
    if (existsSync(dir)) git(['worktree', 'remove', '--force', dir], true);
    const r = git(['worktree', 'add', '--detach', dir, commit]);
    if (r.status !== 0) throw new Error(`git worktree add ${commit}: ${(r.stderr || '').trim()}`);
    return dir;
}
function git(argv, quiet = false) {
    const r = spawnSync('git', argv, { cwd: ROOT, encoding: 'utf8' });
    if (!quiet && r.status !== 0) process.stderr.write(r.stderr || '');
    return r;
}

const results = [];
const tmpBase = resolve(process.env.MQ_BACKTEST_TMP || join(tmpdir(), `mq-backtest-${process.pid}`));
const made = [];
const T0 = Date.now();
try {
    for (const r of rows) {
        const expect = Object.assign({ fail: 'FAIL', pass: 'OK' }, r.expect || {});
        if (r.pending || !r.command) { results.push({ r, fail: 'PENDING', pass: 'PENDING', verdict: 'PENDING' }); continue; }
        let fail, pass;
        if (r.kind === 'fixture') {
            const file = (s) => (isAbsolute(s.fixture) ? s.fixture : resolve(ROOT, s.fixture));
            fail = runCheck(r.command.replaceAll('{fixture}', file(r.fail)), { browser: !!r.browser });
            pass = runCheck(r.command.replaceAll('{fixture}', file(r.pass)), { browser: !!r.browser });
        } else if (r.kind === 'commit-pair') {
            mkdirSync(tmpBase, { recursive: true });
            const state = (s, label) => {
                let dir;
                try { dir = addWorktree(s.commit, tmpBase, `${r.id}-${label}`); } catch (e) { return { result: 'ERROR(checkout)', ms: 0, line: e.message }; }
                made.push(dir);
                return runCheck(r.command.replaceAll('{root}', dir), { env: { MQ_ROOT: dir }, browser: !!r.browser });
            };
            fail = state(r.fail, 'fail');
            pass = state(r.pass, 'pass');
        } else {
            results.push({ r, fail: 'ERROR(kind)', pass: 'ERROR(kind)', verdict: 'FAIL' });
            continue;
        }
        const verdict = fail.result === expect.fail && pass.result === expect.pass ? 'PASS' : 'FAIL';
        results.push({ r, fail: fail.result, pass: pass.result, verdict, failRun: fail, passRun: pass });
    }
} finally {
    if (!has('--keep')) {
        for (const d of made) git(['worktree', 'remove', '--force', d], true);
        if (made.length) git(['worktree', 'prune'], true);
        try { if (made.length) rmSync(tmpBase, { recursive: true, force: true }); } catch (e) { /* the tmp dir may hold another run's files */ }
    }
}

console.log(`ws-backtest: ${rows.length} row(s) from ${tableFile.replace(ROOT + '/', '')}`);
console.log('');
console.log(`${pad('row', 28)}${pad('kind', 13)}${pad('fail state', 16)}${pad('pass state', 16)}verdict`);
for (const x of results) {
    const t = (run) => (run ? ` ${(run.ms / 1000).toFixed(1)}s` : '');
    console.log(`${pad(x.r.id, 28)}${pad(x.r.kind, 13)}${pad(x.fail + t(x.failRun), 16)}${pad(x.pass + t(x.passRun), 16)}${x.verdict}`);
}
const bad = results.filter((x) => x.verdict !== 'PASS');
for (const x of bad.filter((b) => b.verdict === 'FAIL')) {
    console.log(`\n${x.r.id}: expected ${JSON.stringify(Object.assign({ fail: 'FAIL', pass: 'OK' }, x.r.expect || {}))}`);
    if (x.failRun) console.log(`  fail state (${stateName(x.r.fail)}): ${x.failRun.line}`);
    if (x.passRun) console.log(`  pass state (${stateName(x.r.pass)}): ${x.passRun.line}`);
}
const pending = results.filter((x) => x.verdict === 'PENDING').length;
console.log(`\n${results.length - bad.length} PASS, ${bad.length - pending} FAIL, ${pending} PENDING; ${((Date.now() - T0) / 1000).toFixed(1)} s`);
console.log(bad.length ? `ws-backtest: FAIL (${bad.length}${pending ? `, ${pending} pending` : ''})` : 'ws-backtest: OK');
process.exit(bad.length ? 1 : 0);
