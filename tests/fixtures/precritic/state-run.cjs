#!/usr/bin/env node
// state-run.cjs - run a check against a STATE of the app that is a commit plus optional patch files, never a commit
// of its own (ws-backtest "fixture" rows whose fail / pass states are such states; the pilot-su-c rows use it).
//
//   node tests/fixtures/precritic/state-run.cjs --state tests/fixtures/precritic/pilot-su-c/bad.state.json -- \
//        node tests/scripts/ws-card-rulings.mjs --root {root} --card ...
//
// A state file is JSON: {"commit": "<sha>", "patches": ["<repo-relative .patch>", ...], "about": "..."}.
// The commit's tree is exported with `git archive` (from THIS repository) into a cache directory
// ($MQ_STATE_TMP, default <os tmp>/mq-state/<commit>-<hash of the patches>), each patch is applied there with
// `git apply` (the directory is not a repository, so git acts as `patch`), and the command after `--` runs from the
// CURRENT tree (so the check under test is always today's script) with {root} replaced by that directory and
// MQ_ROOT set to it. The command's output passes through unchanged and its exit code is this script's exit code,
// so the check's own last "name: OK|FAIL" line is what ws-backtest reads. A tree is extracted once and reused
// while its commit and patches are unchanged (a `.state-ok` stamp marks a complete extraction).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const HERE = path.resolve(__dirname, '..', '..', '..');
const argv = process.argv.slice(2);
const dd = argv.indexOf('--');
const own = dd >= 0 ? argv.slice(0, dd) : argv;
const cmd = dd >= 0 ? argv.slice(dd + 1) : [];
const arg = (k) => { const i = own.indexOf('--' + k); return i > -1 ? own[i + 1] : null; };
const NAME = 'state-run';
const die = (m) => { console.log(`${NAME}: ${m}`); console.log(`${NAME}: FAIL (setup)`); process.exit(2); };

const stateFile = arg('state');
if (!stateFile || !cmd.length) die('usage: state-run.cjs --state <state.json> -- <command with {root}>');
const state = JSON.parse(fs.readFileSync(path.resolve(HERE, stateFile), 'utf8'));
if (!state.commit) die(`${stateFile}: no "commit"`);
const patches = (state.patches || []).map((p) => path.resolve(HERE, p));
for (const p of patches) if (!fs.existsSync(p)) die(`patch ${p} is missing`);
const h = crypto.createHash('sha256');
for (const p of patches) h.update(fs.readFileSync(p));
const tag = `${state.commit}-${patches.length ? h.digest('hex').slice(0, 10) : 'plain'}`;
const base = path.resolve(process.env.MQ_STATE_TMP || path.join(os.tmpdir(), 'mq-state'));
const dir = path.join(base, tag);
const stamp = path.join(dir, '.state-ok');

if (!fs.existsSync(stamp)) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const arch = spawnSync('bash', ['-c', `git -C "${HERE}" archive --format=tar "${state.commit}" | tar -x -C "${dir}"`], { encoding: 'utf8' });
    if (arch.status !== 0) die(`git archive ${state.commit}: ${(arch.stderr || '').trim()}`);
    for (const p of patches) {
        const r = spawnSync('git', ['apply', '--whitespace=nowarn', p], { cwd: dir, encoding: 'utf8', env: Object.assign({}, process.env, { GIT_DIR: '/nonexistent', GIT_CEILING_DIRECTORIES: path.dirname(dir) }) });
        if (r.status !== 0) die(`git apply ${path.relative(HERE, p)} on ${state.commit}: ${(r.stderr || r.stdout || '').trim()}`);
    }
    fs.writeFileSync(stamp, JSON.stringify({ commit: state.commit, patches: (state.patches || []), made: new Date().toISOString() }) + '\n');
}
process.stderr.write(`${NAME}: ${stateFile} -> ${dir}\n`);
const real = cmd.map((c) => c.split('{root}').join(dir));
const r = spawnSync(real[0], real.slice(1), { cwd: HERE, stdio: 'inherit', env: Object.assign({}, process.env, { MQ_ROOT: dir }) });
process.exit(r.status == null ? 1 : r.status);
