// ws-render-delta — GATE: the options-render findings of this tree are a SUBSET of main's (git merge-base), so a lane
// that touches a drawing adds no finding the main branch lacks (ansBox r3, 2026-10-31; critic r2 #6 and LESSONS L17:
// "the precritic reds are the same gates as on main, but not the same findings").
//
//   node tests/scripts/ws-render-delta.mjs --skill cat:skill[,...] [--sizes S,L] [--main <ref>]
//
// Runs `ws-options-verify --render --json` on a temporary worktree of `git merge-base HEAD <main>` and on this tree
// (MQ_ROOT aware), then compares the failing value pages finding by finding: a (skill, size, option=value, lint rule)
// rise, or a capacity loss, that main does not have is NEW. Prints each NEW finding and
// `ws-render-delta: OK (n findings, all on main too)` or `ws-render-delta: FAIL (k new)`.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const ROOT = process.env.MQ_ROOT ? resolve(process.env.MQ_ROOT) : REPO;
const args = process.argv.slice(2);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const skills = arg('--skill', '');
const sizes = arg('--sizes', 'S,L');
const MAIN = arg('--main', 'origin/claude/sweet-newton-c8wrv1');
if (!skills) { console.log('ws-render-delta: FAIL (usage: --skill cat:skill[,...])'); process.exit(2); }
const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8' }).trim();

function run(root, tag) {
    const json = join(tmpdir(), `mq-render-delta-${process.pid}-${tag}.json`);
    const r = spawnSync(process.execPath, [join(HERE, 'ws-options-verify.cjs'), '--render', '--skill', skills, '--sizes', sizes, '--root', root, '--json', json, '--report-only'],
        { encoding: 'utf8', maxBuffer: 256 << 20, env: { ...process.env, MQ_ROOT: root } });
    let doc = null;
    try { doc = JSON.parse(readFileSync(json, 'utf8')); } catch (e) { doc = null; }
    try { rmSync(json, { force: true }); } catch (e) { /* tmp */ }
    if (!doc) { console.log((r.stdout || '').split('\n').slice(-8).join('\n')); throw new Error(`no options-render JSON for ${tag}`); }
    // one key per rise: skill size option=value + the rise's rule (its count stripped); capacity as one key
    const keys = new Set();
    for (const row of doc.rows || []) for (const rise of row.rises || []) {
        const rule = /^capacity/.test(rise) ? 'capacity' : String(rise).split(':')[0];
        keys.add(`${row.skill} ${row.size} ${row.option}=${JSON.stringify(row.value)} ${rule}`);
    }
    return { keys, skipped: (doc.skills || []).map((s) => `${s.key}: ${(s.skipped || []).filter((x) => x.option === 'ansBox').map((x) => x.why).join('') || (s.values || []).filter((v) => v.option === 'ansBox').map((v) => JSON.stringify(v.value)).join(',') || 'no ansBox'}`) };
}

const base = git('merge-base', 'HEAD', MAIN);
const wt = mkdtempSync(join(tmpdir(), 'mq-render-delta-'));
let mainRes;
try {
    execFileSync('git', ['-C', ROOT, 'worktree', 'add', '--detach', wt, base], { stdio: 'ignore' });
    mainRes = run(wt, 'main');
} finally {
    try { execFileSync('git', ['-C', ROOT, 'worktree', 'remove', '--force', wt], { stdio: 'ignore' }); } catch (e) { /* below */ }
    if (existsSync(wt)) rmSync(wt, { recursive: true, force: true });
    try { execFileSync('git', ['-C', ROOT, 'worktree', 'prune'], { stdio: 'ignore' }); } catch (e) { /* */ }
}
const here = run(ROOT, 'here');
console.log(`ansBox on this tree: ${here.skipped.join('; ')}`);
const fresh = [...here.keys].filter((k) => !mainRes.keys.has(k));
const gone = [...mainRes.keys].filter((k) => !here.keys.has(k));
for (const k of fresh) console.log(`  NEW ${k}`);
for (const k of gone) console.log(`  gone ${k}`);
console.log(fresh.length
    ? `ws-render-delta: FAIL (${fresh.length} new finding(s) vs merge-base ${base.slice(0, 7)}; ${here.keys.size} on this tree, ${mainRes.keys.size} on main)`
    : `ws-render-delta: OK (${here.keys.size} finding(s), all on main ${base.slice(0, 7)} too; ${gone.length} gone)`);
process.exit(fresh.length ? 1 : 0);
