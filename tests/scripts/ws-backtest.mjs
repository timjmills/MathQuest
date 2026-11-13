// ws-backtest — proves each new check (IMPROVEMENT_PLAN §1.4 S2, "Backtests for the new checks"): it must FAIL on the
// state a critic failed and PASS on the fix. The table is data: tests/fixtures/precritic/backtests.json.
//
//   node tests/scripts/ws-backtest.mjs                     # every row, then ws-precritic-plan (each check on the lane's path)
//   node tests/scripts/ws-backtest.mjs --row notation      # one row (repeatable or comma list)
//   node tests/scripts/ws-backtest.mjs --kind fixture      # only the fixture rows (or commit-pair)
//   node tests/scripts/ws-backtest.mjs --list              # the table, with pending rows marked
//   node tests/scripts/ws-backtest.mjs --table other.json  # another table (same shape)
//   node tests/scripts/ws-backtest.mjs --keep              # keep the commit-pair worktrees (debugging)
//   node tests/scripts/ws-backtest.mjs --timeout 600       # seconds per row (default 600; browser rows get --browser-timeout,
//                                                          # default 1800); a row over it is killed (its whole process tree)
//                                                          # and reported TIMEOUT; any non-PASS row streams the last 20 lines
//                                                          # of the state that went wrong
//   node tests/scripts/ws-backtest.mjs --lock-warn 120     # a browser row with no browser slot after N s (default 120) prints
//                                                          # who holds the slots / the harness lock (pid, age, command)
//   node tests/scripts/ws-backtest.mjs --quiet             # no per-row streaming lines (the final table only)
//   node tests/scripts/ws-backtest.mjs --self-test         # the TIMEOUT path on a sleeping fixture row (no browser, ~5 s)
//   node tests/scripts/ws-backtest.mjs --runner-orphan R   # OK when a child outliving runner R's command holds no slot lock
//
// Each row's result line is printed AS SOON AS THE ROW FINISHES ("ws-backtest row <id>: PASS|FAIL|TIMEOUT|ERROR|PENDING ..."),
// and the table follows at the end (lf-engine 2026-11-12: a full run hung 7,000 s with no output at all).
//
// Row kinds:
//   fixture      the command runs on the row's FAIL fixture, then on its PASS fixture ({fixture} in the command)
//   commit-pair  each commit is checked out in a temporary `git worktree` (under $MQ_BACKTEST_TMP, default the OS tmp
//                dir; removed afterwards); the command runs from the CURRENT tree with {root} = that checkout and
//                MQ_ROOT set to it, so the check under test is always today's script. A row with browser: true runs
//                through /tmp/mq-browser-run.sh (the two-slot browser runner).
// A state may carry `args`: the text that replaces {args} in the command for that state. It is how a check is pinned when
// the two states are not two commits of the app - a tuned threshold judged as moved, a ratchet asked for a lower floor, or a
// REPORT-ONLY check proved to DETECT its case (fail state: the flag that makes it gate; pass state: the default, which only
// reports). Such a row names the same commit on both sides and says so in its `state` text.
// A row with `reportOnly: true` pins a check that does not gate the lane: it must still PASS here (the check must detect its
// case and stay quiet by default), and the table marks it so a reader does not take it for a gate.
//                A state of a commit-pair row may instead name a `fixture` (and its own `command`, default the row's):
//                it runs on the current tree with {fixture} filled, for a real fail commit whose fix has not landed
//                (the row's state text says why; ws-screen-ink-size D6).
// A row's `timeoutS` (seconds, both states together) replaces --timeout / --browser-timeout for that row (a whole-library
// proof such as lesson-baseline-deploy-gate, ≈ 2 x 13 min).
// A row with pending: true has no command yet; it is reported PENDING (never OK) and makes the run FAIL.
// A state's result is the check's own last "name: OK" / "name: FAIL" line (else its exit code); a row PASSes when
// its fail state gives the expected FAIL and its pass state the expected OK.
//
// Prints one table (row, kind, fail-state result, pass-state result, verdict) and `ws-backtest: OK` or
// `ws-backtest: FAIL (n)`; exits non-zero on FAIL.

import { spawnSync, spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, rmSync, readdirSync, readlinkSync, statSync, copyFileSync, chmodSync, renameSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const argAll = (f) => args.flatMap((a, i) => (a === f && i + 1 < args.length ? String(args[i + 1]).split(',') : [])).map((s) => s.trim()).filter(Boolean);
const BROWSER_RUN = '/tmp/mq-browser-run.sh';

/** How many browser-slot lock fds a child that OUTLIVES `runner`'s command holds (must be 0), or null when both slots stayed
 *  busy for 30 s. (An orphaned, detached Chrome held both slots and every later browser row waited without end: lf-engine
 *  2026-11-12.) */
function runnerOrphan(runner) {
    const o = spawnSync('bash', ['-c', `timeout 30 bash ${runner} bash -c 'setsid bash -c "exec -a ws-backtest-selftest-orphan sleep 20" </dev/null >/dev/null 2>&1 &' && sleep 0.5 && p=$(pgrep -f '^ws-backtest-selftest-orphan' | head -1) && { ls -l /proc/$p/fd | grep -c mq-browser-slot; kill $p; }`], { cwd: ROOT, encoding: 'utf8' });
    return o.status === 124 ? null : Number(String(o.stdout).trim().split('\n').pop());
}
if (arg('--runner-orphan', null)) {
    // a check of its own (backtest row runner-orphan-slot): node tests/scripts/ws-backtest.mjs --runner-orphan <runner.sh>
    const n = runnerOrphan(arg('--runner-orphan'));
    console.log(n === null ? 'ws-backtest-runner: FAIL (both slots busy 30 s; not measured)' : n ? `ws-backtest-runner: FAIL (a child that outlives the command holds ${n} slot lock fd(s))` : 'ws-backtest-runner: OK');
    process.exit(n === 0 ? 0 : 1);
}
if (has('--self-test')) {
    // The TIMEOUT path: a fixture row whose check sleeps 60 s, run with --timeout 2, must report TIMEOUT within ~10 s, show
    // its output tail, and leave no sleeping child behind.
    const t0 = Date.now();
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--table', 'tests/fixtures/precritic/backtest-selftest.json', '--timeout', '2'], { cwd: ROOT, encoding: 'utf8' });
    const out = `${r.stdout}${r.stderr}`;
    const left = spawnSync('pgrep', ['-f', '^ws-backtest-selftest-sleeper'], { encoding: 'utf8' }).stdout.trim();
    const okLine = /ws-backtest row sleeper: TIMEOUT/.test(out), okTail = /selftest tail line 3/.test(out), okTot = /1 TIMEOUT/.test(out), okOk = /ws-backtest row instant: PASS/.test(out);
    const orphanHolds = runnerOrphan('tests/scripts/mq-browser-run.sh');
    const secs = (Date.now() - t0) / 1000;
    const fails = [!okLine && 'no streamed TIMEOUT line', !okTail && 'no output tail', !okTot && 'totals do not count the TIMEOUT', !okOk && 'the instant row did not PASS',
        left && `sleeper still running (pids ${left})`, orphanHolds !== null && orphanHolds !== 0 && `an orphan of mq-browser-run.sh holds ${orphanHolds} slot lock fd(s)`, secs > 30 && `took ${secs.toFixed(0)} s`, r.status === 0 && 'exit 0 on a TIMEOUT'].filter(Boolean);
    if (fails.length) console.log(out);
    if (orphanHolds === null) console.log('ws-backtest --self-test: the runner orphan case was skipped (both browser slots busy for 30 s)');
    console.log(fails.length ? `ws-backtest --self-test: FAIL (${fails.join('; ')})` : `ws-backtest --self-test: OK (${secs.toFixed(1)} s)`);
    process.exit(fails.length ? 1 : 0);
}

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
/** A commit-pair row whose side is a fixture, not a commit (critic sis-r2 D4): re-point it when the fixing commit lands. */
const fixtureSide = (r) => (r.kind === 'commit-pair' ? ['fail', 'pass'].filter((k) => r[k] && !r[k].commit && r[k].fixture) : []);

if (has('--list')) {
    console.log(`${pad('row', 28)}${pad('kind', 13)}${pad('fail state', 46)}${pad('pass state', 46)}status`);
    for (const r of rows) {
        console.log(`${pad(r.id, 28)}${pad(r.kind, 13)}${pad(stateName(r.fail), 46)}${pad(stateName(r.pass), 46)}${r.pending ? 'PENDING (no command yet)' : r.browser ? 'ready (browser)' : 'ready'}${r.reportOnly ? ' [report-only check]' : ''}${fixtureSide(r).length ? `; ${fixtureSide(r).join(' + ')} side is a fixture: re-point when a fix lands` : ''}`);
    }
    process.exit(0);
}

const ROW_TIMEOUT = Number(arg('--timeout', 600)) * 1000;
const BROWSER_TIMEOUT = Number(arg('--browser-timeout', arg('--timeout', null) ? Number(arg('--timeout')) * 3 : 1800)) * 1000;
const LOCK_WARN = Number(arg('--lock-warn', 120)) * 1000;
const QUIET = has('--quiet');
const say = (s) => { if (!QUIET) console.log(s); };

/** pid -> ppid for every live process (Linux /proc). */
function procTable() {
    const m = new Map();
    for (const d of readdirSync('/proc')) {
        if (!/^\d+$/.test(d)) continue;
        try { const st = readFileSync(`/proc/${d}/stat`, 'utf8'); m.set(Number(d), Number(st.slice(st.lastIndexOf(')') + 2).split(' ')[1])); } catch (e) { /* gone */ }
    }
    return m;
}
/** `pid` and all its descendants (also the ones that left its process group, e.g. a detached Chrome). */
function treeOf(pid) {
    const pp = procTable(); const out = new Set([pid]); let grew = true;
    while (grew) { grew = false; for (const [p, q] of pp) if (out.has(q) && !out.has(p)) { out.add(p); grew = true; } }
    return [...out];
}
const cmdOf = (pid) => { try { return readFileSync(`/proc/${pid}/cmdline`, 'utf8').replace(/\0/g, ' ').trim().slice(0, 140); } catch (e) { return '?'; } };
/** Who holds the two-slot runner's lock files and the harness lock: [{what, pid, cmd, age}] (processes with the file open). */
function browserHolders() {
    const files = ['/tmp/mq-browser-slot.1.lock', '/tmp/mq-browser-slot.2.lock', '/tmp/mq-browser-queue.lock'];
    const out = [];
    for (const d of readdirSync('/proc')) {
        if (!/^\d+$/.test(d)) continue;
        let fds; try { fds = readdirSync(`/proc/${d}/fd`); } catch (e) { continue; }
        for (const fd of fds) {
            let t; try { t = readlinkSync(`/proc/${d}/fd/${fd}`); } catch (e) { continue; }
            if (files.includes(t)) {
                let age = '?'; try { age = `${Math.round((Date.now() - statSync(`/proc/${d}`).mtimeMs) / 1000)} s`; } catch (e) { /* gone */ }
                out.push({ what: t.replace('/tmp/mq-browser-', '').replace('.lock', ''), pid: Number(d), cmd: cmdOf(d), age });
            }
        }
    }
    try {
        const h = createRequire(import.meta.url)(join(ROOT, 'tests/lib/browser-lock.cjs')).holder();
        if (h) out.push({ what: 'harness lock', pid: h.pid, cmd: `${h.name} (${h.cwd})`, age: `${Math.round((Date.now() - h.at) / 1000)} s` });
    } catch (e) { /* no lock module */ }
    return out;
}

/** Run one command (async); the check's verdict is its last "<name>: OK|FAIL" line, else its exit code. Kills the whole
 *  process tree and returns TIMEOUT after `timeoutMs`. */
function runCheck(cmd, { env = {}, browser = false, timeoutMs = ROW_TIMEOUT, label = '' } = {}) {
    const full = browser ? `${BROWSER_RUN} ${cmd}` : cmd;
    const t0 = Date.now();
    return new Promise((res) => {
        const child = spawn('bash', ['-c', full], { cwd: ROOT, env: Object.assign({}, process.env, browser ? { MQ_BROWSER_WAIT_LOG: '1' } : {}, env), detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
        let out = ''; let timedOut = false; let lockTold = false;
        live.add(child.pid);
        const add = (b) => { out += b; if (out.length > 64 * 1024 * 1024) out = out.slice(-32 * 1024 * 1024); };
        child.stdout.on('data', add); child.stderr.on('data', add);
        const kill = () => {
            const pids = treeOf(child.pid);
            try { process.kill(-child.pid, 'SIGKILL'); } catch (e) { /* gone */ }
            for (const p of pids) { try { process.kill(p, 'SIGKILL'); } catch (e) { /* gone */ } }
        };
        const timer = setTimeout(() => { timedOut = true; kill(); }, timeoutMs);
        // a browser row still without a slot after LOCK_WARN: say who holds the slots (a stale holder is the usual hang)
        const watch = browser ? setInterval(() => {
            if (lockTold || Date.now() - t0 < LOCK_WARN) return;
            const mine = new Set(treeOf(child.pid));
            const hs = browserHolders();
            const haveSlot = hs.some((h) => /^slot/.test(h.what) && mine.has(h.pid));
            if (haveSlot) { lockTold = true; return; }
            lockTold = true;
            const others = hs.filter((h) => !mine.has(h.pid));
            console.log(`ws-backtest: ${label} has waited ${Math.round((Date.now() - t0) / 1000)} s for a browser slot; holders:` +
                (others.length ? others.map((h) => `\n    ${h.what}: pid ${h.pid} (up ${h.age}) ${h.cmd}`).join('') : ' none found'));
        }, 5000) : null;
        child.on('close', (status, signal) => {
            clearTimeout(timer); if (watch) clearInterval(watch); live.delete(child.pid);
            if (!timedOut) kill();   // (a detached grandchild, e.g. an orphaned Chrome holding a browser slot, goes too)
            const lines = out.trim().split('\n').filter((l) => /^[\w./-]+(?: --?[\w-]+)?: (OK|FAIL)\b/.test(l));
            const last = lines.length ? lines[lines.length - 1] : '';
            let result;
            if (timedOut) result = 'TIMEOUT';
            else if (/: OK\b/.test(last)) result = 'OK';
            else if (/: FAIL\b/.test(last)) result = 'FAIL';
            else result = status === 0 ? 'OK' : `ERROR(${status === null ? signal : status})`;
            const tail = out.trimEnd().split('\n').slice(-20);
            res({ result, ms: Date.now() - t0, line: timedOut ? `killed after ${(timeoutMs / 1000).toFixed(0)} s` : (last || tail.slice(-1)[0] || ''), status, tail });
        });
    });
}

/** A temporary detached worktree of `commit`, or throws. */
function addWorktree(commit, base, label) {
    const dir = join(base, `${label}-${commit}`);
    if (existsSync(dir)) git(['worktree', 'remove', '--force', dir], true);
    const r = git(['worktree', 'add', '--detach', dir, commit]);
    if (r.status !== 0) {
        // a commit missing from a shallow clone (the cloud default) is a setup problem, not a check result: say how to fix it
        const shallow = spawnSync('git', ['rev-parse', '--is-shallow-repository'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim() === 'true';
        const hint = /invalid reference|unknown revision|not a valid/i.test(r.stderr || '') && shallow ? ' (this clone is shallow: run `git fetch --unshallow origin` and `git fetch origin "+refs/heads/*:refs/remotes/origin/*"`, then re-run)' : '';
        throw new Error(`git worktree add ${commit}: ${(r.stderr || '').trim()}${hint}`);
    }
    return dir;
}
function git(argv, quiet = false) {
    const r = spawnSync('git', argv, { cwd: ROOT, encoding: 'utf8' });
    if (!quiet && r.status !== 0) process.stderr.write(r.stderr || '');
    return r;
}

// The two-slot runner: installed / refreshed from the repo's copy like ws-precritic does (a stale runner let an orphaned
// Chrome keep a slot's lock: lf-engine 2026-11-12)
if (rows.some((r) => r.browser && !r.pending)) {
    const src = join(ROOT, 'tests/scripts/mq-browser-run.sh');
    try {
        if (!existsSync(BROWSER_RUN) || readFileSync(BROWSER_RUN, 'utf8') !== readFileSync(src, 'utf8')) {
            const tmp = `${BROWSER_RUN}.${process.pid}`;
            copyFileSync(src, tmp); chmodSync(tmp, 0o755); renameSync(tmp, BROWSER_RUN);
            console.log(`ws-backtest: refreshed ${BROWSER_RUN} from tests/scripts/mq-browser-run.sh`);
        }
    } catch (e) { console.log(`ws-backtest: could not refresh ${BROWSER_RUN}: ${e.message}`); }
}

const results = [];
const tmpBase = resolve(process.env.MQ_BACKTEST_TMP || join(tmpdir(), `mq-backtest-${process.pid}`));
const made = [];
const T0 = Date.now();
// killed from outside (Ctrl-C, a lane's own timeout): take the running checks' trees and the checkouts with it
const live = new Set();
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => {
    for (const pid of live) { for (const p of treeOf(pid)) { try { process.kill(p, 'SIGKILL'); } catch (e) { /* gone */ } } }
    if (!has('--keep')) for (const d of made) git(['worktree', 'remove', '--force', d], true);
    console.log(`ws-backtest: killed by ${sig}`); process.exit(130);
});
try {
    for (const r of rows) {
        const expect = Object.assign({ fail: 'FAIL', pass: 'OK' }, r.expect || {});
        // a commit that is a placeholder (e.g. "TBD-lf-ops-fix4", filled when a fix lands) cannot be checked out: the row is
        // PENDING, not an ERROR after a long fail-state run (lf-engine 2026-11-12: 8 cc-* / pl-* rows)
        const placeholder = r.kind === 'commit-pair' && [r.fail, r.pass].map((x) => x && x.commit).find((c) => c && !/^[0-9a-f]{7,40}$/i.test(c));
        if (placeholder && !r.pending) { results.push({ r, fail: 'PENDING', pass: 'PENDING', verdict: 'PENDING' }); say(`ws-backtest row ${r.id}: PENDING (placeholder commit ${placeholder})`); continue; }
        if (r.pending || !r.command) { results.push({ r, fail: 'PENDING', pass: 'PENDING', verdict: 'PENDING' }); say(`ws-backtest row ${r.id}: PENDING${r.reason ? ` (${r.reason})` : ''}`); continue; }
        let fail, pass;
        // a state's own `args` replaces {args} (a threshold judged as moved, a lower floor asked of a ratchet, the flag that
        // makes a report-only check gate); a command with no {args} is unchanged
        const withArgs = (cmd, st) => cmd.replaceAll('{args}', (st && st.args) || '');
        const rowT0 = Date.now();
        const budget = () => Math.max(1000, (Number(r.timeoutS) > 0 ? Number(r.timeoutS) * 1000 : r.browser ? BROWSER_TIMEOUT : ROW_TIMEOUT) - (Date.now() - rowT0));   // (a row's own `timeoutS` wins: a whole-library proof)
        const timedOut = { result: 'TIMEOUT', ms: 0, line: 'not run: the row timed out on its fail state', tail: [] };
        if (r.kind === 'fixture') {
            const file = (s) => (isAbsolute(s.fixture) ? s.fixture : resolve(ROOT, s.fixture));
            fail = await runCheck(withArgs(r.command.replaceAll('{fixture}', file(r.fail)), r.fail), { browser: !!r.browser, timeoutMs: budget(), label: `${r.id} (fail state)` });
            pass = fail.result === 'TIMEOUT' ? timedOut : await runCheck(withArgs(r.command.replaceAll('{fixture}', file(r.pass)), r.pass), { browser: !!r.browser, timeoutMs: budget(), label: `${r.id} (pass state)` });
        } else if (r.kind === 'commit-pair') {
            mkdirSync(tmpBase, { recursive: true });
            const state = async (s, label) => {
                if (!s.commit && s.fixture) return Object.assign(await runCheck(withArgs((s.command || r.command).replaceAll('{fixture}', isAbsolute(s.fixture) ? s.fixture : resolve(ROOT, s.fixture)).replaceAll('{root}', ROOT), s), { browser: !!r.browser, timeoutMs: budget(), label: `${r.id} (${label})` }), { fixture: true });
                let dir;
                try { dir = addWorktree(s.commit, tmpBase, `${r.id}-${label}`); } catch (e) { return { result: 'ERROR(checkout)', ms: 0, line: e.message }; }
                made.push(dir);
                const res = await runCheck(withArgs(r.command.replaceAll('{root}', dir), s), { env: { MQ_ROOT: dir }, browser: !!r.browser, timeoutMs: budget(), label: `${r.id} (${label} state)` });
                // (lf-engine landing r2: each checkout is ~600 MB; ~80 commit-pair rows kept to the end filled the disk and
                // turned every later row into ERROR(checkout) - a checkout goes as soon as its state has run)
                if (!has('--keep')) { git(['worktree', 'remove', '--force', dir], true); made.splice(made.indexOf(dir), 1); }
                return res;
            };
            fail = await state(r.fail, 'fail');
            pass = fail.result === 'TIMEOUT' ? timedOut : await state(r.pass, 'pass');
        } else {
            results.push({ r, fail: 'ERROR(kind)', pass: 'ERROR(kind)', verdict: 'ERROR' });
            say(`ws-backtest row ${r.id}: ERROR (unknown kind ${r.kind})`);
            continue;
        }
        const ok = fail.result === expect.fail && pass.result === expect.pass;
        const verdict = ok ? 'PASS' : [fail, pass].some((x) => x.result === 'TIMEOUT') ? 'TIMEOUT' : [fail, pass].some((x) => /^ERROR/.test(x.result)) ? 'ERROR' : 'FAIL';
        results.push({ r, fail: fail.result, pass: pass.result, verdict, failRun: fail, passRun: pass });
        say(`ws-backtest row ${r.id}: ${verdict}  fail state ${fail.result} ${(fail.ms / 1000).toFixed(1)}s, pass state ${pass.result} ${(pass.ms / 1000).toFixed(1)}s` +
            (verdict === 'PASS' ? '' : `\n    expected ${JSON.stringify(expect)}; fail: ${fail.line}; pass: ${pass.line}`));
        if (verdict !== 'PASS') {
            // the state that went wrong (a TIMEOUT first, else the one off its expectation): its last 20 lines
            const t = fail.result === 'TIMEOUT' ? fail : pass.result === 'TIMEOUT' ? pass : fail.result !== expect.fail ? fail : pass;
            say(`    last ${t.tail.length} line(s) of the ${t === fail ? 'fail' : 'pass'} state:\n${t.tail.map((l) => `      | ${l}`).join('\n')}`);
        }
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
console.log(`${pad('row', 28)}${pad('kind', 13)}${pad('fail state', 20)}${pad('pass state', 20)}verdict`);
for (const x of results) {
    const t = (run) => (run ? `${run.fixture ? ' (fixture)' : ''} ${(run.ms / 1000).toFixed(1)}s` : '');
    console.log(`${pad(x.r.id, 28)}${pad(x.r.kind, 13)}${pad(x.fail + t(x.failRun), 20)}${pad(x.pass + t(x.passRun), 20)}${x.verdict}${x.r.reportOnly ? ' (report-only check: it detects its case, it does not gate)' : ''}`);
}
for (const x of results.filter((y) => fixtureSide(y.r).length)) console.log(`  ${x.r.id}: ${fixtureSide(x.r).join(' + ')} side is a fixture: re-point when a fix lands`);
const bad = results.filter((x) => x.verdict !== 'PASS');
for (const x of bad.filter((b) => b.verdict !== 'PENDING')) {
    console.log(`\n${x.r.id}: expected ${JSON.stringify(Object.assign({ fail: 'FAIL', pass: 'OK' }, x.r.expect || {}))}`);
    if (x.failRun) console.log(`  fail state (${stateName(x.r.fail)}): ${x.failRun.line}`);
    if (x.passRun) console.log(`  pass state (${stateName(x.r.pass)}): ${x.passRun.line}`);
}
const pending = results.filter((x) => x.verdict === 'PENDING').length;
const nOf = (v) => results.filter((x) => x.verdict === v).length;
console.log(`\n${nOf('PASS')} PASS, ${nOf('FAIL')} FAIL, ${pending} PENDING, ${nOf('TIMEOUT')} TIMEOUT, ${nOf('ERROR')} ERROR; ${((Date.now() - T0) / 1000).toFixed(1)} s`);
// A backtested check must also be ON THE LANE'S PATH (S1 critic r1 D2): with the default table and no --row / --kind,
// ws-precritic-plan asserts that ws-precritic --skill <the row's skills> plans each row's tool (and role). --no-plan skips.
let planBad = 0;
if (!has('--no-plan') && !arg('--table', null) && !argAll('--row').length && !arg('--kind', null)) {
    const pr = spawnSync(process.execPath, [join(ROOT, 'tests/scripts/ws-precritic-plan.mjs')], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 << 20 });
    const last = String(pr.stdout || '').trim().split('\n').filter((l) => /^ {2}(FAIL|\S+: )|^ws-precritic-plan:/.test(l));
    console.log(`\n${last.join('\n')}`);
    if (pr.status !== 0) planBad = 1;
}
console.log(bad.length || planBad ? `ws-backtest: FAIL (${bad.length}${pending ? `, ${pending} pending` : ''}${planBad ? ', plan: a check not on the lane\'s path' : ''})` : 'ws-backtest: OK');
process.exit(bad.length || planBad ? 1 : 0);
