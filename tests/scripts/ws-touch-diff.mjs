// ws-touch-diff — the one-command REAL-TAP master diff (lf-hosts hand-over speed-up: "tap3-style one-command master diff").
// Runs today's ws-phone-card (TOUCH-HIT by default) on HEAD and on a base ref checked out in a temporary git worktree
// (MQ_ROOT, so the check script is always this tree's), then prints ONLY the cells whose findings differ: a red the lane
// added, a red the lane removed. Cells red on both sides are counted, not listed (they are master's, not the lane's).
//
//   node tests/scripts/ws-touch-diff.mjs --skills subtraction:sub_100_no_regroup,placevalue:expand
//   node tests/scripts/ws-touch-diff.mjs --skills a:b --base origin/master --sizes 820x1180,1280x900 --items 1 --rules TOUCH-HIT,TOUCH-TARGET
//   node tests/scripts/ws-touch-diff.mjs --self-test     # the cell diff on fixed rows (no browser)
//   node tests/scripts/ws-touch-diff.mjs --help
//
// Each side runs through /tmp/mq-browser-run.sh, one after the other (never two at once from this tool). The worktree is
// removed afterwards (--keep keeps it). Prints `ws-touch-diff: OK (no cell differs ...)` or `ws-touch-diff: DIFF - n cell(s)`;
// exit 0 / 1, 2 on a usage error or when a side did not run.
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const TOOL = 'ws-touch-diff';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const has = (k) => argv.includes('--' + k);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const say = (...a) => console.log(...a);

/** cell key -> sorted finding strings, from a ws-phone-card --json report, kept to `rules`. */
export function cellsOf(rep, rules) {
    const out = new Map();
    const add = (key, fs) => out.set(key, fs.filter((f) => !rules.length || rules.includes(f.rule)).map((f) => `${f.rule} ${f.msg}`).sort());
    for (const r of rep.rows || []) add(`${r.skill} ${r.size} card item ${r.item}`, r.findings || []);
    for (const r of rep.hostRows || []) add(`${r.skill} ${r.size} ${r.host}`, r.findings || []);
    return out;
}
/** The cells that differ: [{key, head: [...], base: [...]}], plus the count red on both sides alike. */
export function diffCells(head, base) {
    const keys = [...new Set([...head.keys(), ...base.keys()])].sort();
    const diff = [];
    let same = 0;
    for (const k of keys) {
        const h = head.get(k), b = base.get(k);
        if (!h || !b) { diff.push({ key: k, head: h || ['(not measured)'], base: b || ['(not measured)'] }); continue; }
        if (JSON.stringify(h) !== JSON.stringify(b)) diff.push({ key: k, head: h, base: b });
        else if (h.length) same++;
    }
    return { diff, same };
}

function selfTest() {
    const f = (rule, msg) => ({ rule, msg });
    const base = { rows: [{ skill: 'a:b', size: '820x1180', item: 1, findings: [f('TOUCH-HIT', 'x bottom')] }, { skill: 'a:b', size: '1280x900', item: 1, findings: [] }], hostRows: [{ skill: 'a:b', size: '820x1180', host: 'quiz', findings: [f('FOCUS', 'y')] }] };
    const head = { rows: [{ skill: 'a:b', size: '820x1180', item: 1, findings: [f('TOUCH-HIT', 'x bottom')] }, { skill: 'a:b', size: '1280x900', item: 1, findings: [f('TOUCH-HIT', 'z top')] }], hostRows: [{ skill: 'a:b', size: '820x1180', host: 'quiz', findings: [] }] };
    const bad = [];
    const r1 = diffCells(cellsOf(head, ['TOUCH-HIT']), cellsOf(base, ['TOUCH-HIT']));
    if (r1.diff.length !== 1 || r1.diff[0].key !== 'a:b 1280x900 card item 1' || r1.same !== 1) bad.push(`TOUCH-HIT only: want 1 differing cell (1280 card) and 1 alike, got ${JSON.stringify(r1)}`);
    const r2 = diffCells(cellsOf(head, []), cellsOf(base, []));
    if (r2.diff.length !== 2) bad.push(`all rules: want 2 differing cells (1280 card, 820 quiz), got ${r2.diff.length}`);
    const r3 = diffCells(cellsOf(base, []), cellsOf(base, []));
    if (r3.diff.length) bad.push('a report against itself must not differ');
    for (const b of bad) say(`  FAIL ${b}`);
    say(bad.length ? `${TOOL}: FAIL - self-test (${bad.length})` : `${TOOL}: OK (self-test, 3 cases)`);
    process.exit(bad.length ? 1 : 0);
}

function usage(code) {
    const src = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n');
    say('usage: ' + src.slice(0, src.findIndex((l) => !l.startsWith('//'))).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(code);
}

function main() {
    if (has('help') || argv.includes('-h')) usage(0);
    if (has('self-test')) return selfTest();
    const skills = arg('skills', '');
    if (!skills) { say(`${TOOL}: give --skills cat:skill,...`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
    const baseRef = arg('base', 'origin/master');
    const rules = String(arg('rules', 'TOUCH-HIT')).split(',').map((s) => s.trim()).filter(Boolean);
    const extra = ['--skills', skills, '--only', rules.join(','), '--no-siblings-check', '--report-only'];
    for (const k of ['sizes', 'items', 'hosts']) if (arg(k, null)) extra.push('--' + k, arg(k));
    const runner = existsSync('/tmp/mq-browser-run.sh') ? '/tmp/mq-browser-run.sh' : join(ROOT, 'tests/scripts/mq-browser-run.sh');
    const tmp = mkdtempSync(join(tmpdir(), 'ws-touch-diff-'));
    const wt = join(tmp, 'base');
    const add = spawnSync('git', ['worktree', 'add', '--detach', wt, baseRef], { cwd: ROOT, encoding: 'utf8' });
    if (add.status !== 0) { say(`${TOOL}: cannot check out ${baseRef}: ${add.stderr.trim()}`); say(`${TOOL}: FAIL - no base`); process.exit(2); }
    const baseSha = spawnSync('git', ['rev-parse', '--short=9', 'HEAD'], { cwd: wt, encoding: 'utf8' }).stdout.trim();
    const headSha = spawnSync('git', ['rev-parse', '--short=9', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
    const reps = {};
    try {
        for (const [side, root] of [['head', ROOT], ['base', wt]]) {
            const json = join(tmp, `${side}.json`);
            say(`${TOOL}: ${side} (${side === 'head' ? headSha : `${baseRef} ${baseSha}`}) ...`);
            const r = spawnSync('bash', [runner, process.execPath, join(ROOT, 'tests/scripts/ws-phone-card.cjs'), ...extra, '--json', json], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, MQ_ROOT: root }, maxBuffer: 64 << 20 });
            if (!existsSync(json)) { say(String(r.stdout).split('\n').slice(-15).join('\n')); say(`${TOOL}: FAIL - the ${side} side did not run`); process.exit(2); }
            reps[side] = JSON.parse(readFileSync(json, 'utf8'));
            say(`  ${String(r.stdout).trim().split('\n').pop()}`);
        }
    } finally {
        if (!has('keep')) { spawnSync('git', ['worktree', 'remove', '--force', wt], { cwd: ROOT }); rmSync(tmp, { recursive: true, force: true }); } else say(`${TOOL}: kept ${wt}`);
    }
    const { diff, same } = diffCells(cellsOf(reps.head, rules), cellsOf(reps.base, rules));
    for (const d of diff) {
        say(`${d.key}:`);
        for (const f of d.base.filter((x) => !d.head.includes(x))) say(`  - base only: ${f}`);
        for (const f of d.head.filter((x) => !d.base.includes(x))) say(`  + head only: ${f}`);
    }
    const tail = `${rules.join(', ')}; head ${headSha} vs ${baseRef} ${baseSha}; ${same} cell(s) red alike on both`;
    say(diff.length ? `${TOOL}: DIFF - ${diff.length} cell(s) differ (${tail})` : `${TOOL}: OK (no cell differs; ${tail})`);
    process.exit(diff.length ? 1 : 0);
}
main();
