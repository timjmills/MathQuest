// ws-gate-agree — a gate's precritic row says what its tool's log says (lane lf-hosts 2026-11-13: ws-screen-support-eq logged
// "ws-screen-support-eq: OK" while the precritic row read FAIL "skill(s) in scope absent from the output" on the two-step
// skills - two judges of one run). It runs ONE gate of a tree's precritic plan on the given skills, exactly as that tree's
// precritic would (its own buildPlan, script and args, MQ_ROOT = that tree), then judges the output with that tree's own
// parser, and compares the row with the tool's last verdict line:
//   tool OK  <-> row PASS (or PASS (baseline));  tool N/A <-> row N/A;  tool FAIL <-> row FAIL.
// Any other pair is a disagreement and FAILs.
//
//   node tests/scripts/ws-gate-agree.mjs --gate screen-support-eq --skills algebra:two_step_letter_equation
//   node tests/scripts/ws-gate-agree.mjs --root /path/to/checkout --gate screen-support-eq --skills a:b
// Prints `ws-gate-agree: OK (...)` / `ws-gate-agree: FAIL (...)`; exit 1 on FAIL, 2 on usage.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const TOOL = 'ws-gate-agree';
const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(`--${k}`); return i > -1 && args[i + 1] !== undefined ? args[i + 1] : d; };
const root = resolve(arg('root', HERE));
const gateId = arg('gate', '');
const keys = String(arg('skills', '')).split(',').map((s) => s.trim()).filter(Boolean);
if (!gateId || !keys.length) { console.log(`${TOOL}: give --gate <id> --skills cat:skill,...`); console.log(`${TOOL}: FAIL (usage)`); process.exit(2); }
const pc = join(root, 'tests/scripts/ws-precritic.cjs');
if (!existsSync(pc)) { console.log(`${TOOL}: FAIL (no ws-precritic in ${root})`); process.exit(1); }
const P = createRequire(import.meta.url)(pc);
const g = P.buildPlan({ skills: keys.map((k) => ({ key: k, cat: k.split(':')[0], id: k.split(':')[1] })), logs: mkdtempSync(join(tmpdir(), 'gate-agree-')), live: [] }).find((r) => r.id === gateId);
if (!g) { console.log(`${TOOL}: FAIL (the plan of ${root} has no gate ${gateId} on ${keys.join(',')})`); process.exit(1); }
if (g.missing || !g.file) { console.log(`${TOOL}: FAIL (gate ${gateId}: ${g.missing || 'no script'})`); process.exit(1); }
const runner = existsSync('/tmp/mq-browser-run.sh') ? '/tmp/mq-browser-run.sh' : join(HERE, 'tests/scripts/mq-browser-run.sh');
const cmd = g.kind === 'browser' ? ['bash', [runner, process.execPath, g.file, ...g.args]] : [process.execPath, [g.file, ...g.args]];
const r = spawnSync(cmd[0], cmd[1], { cwd: root, encoding: 'utf8', env: { ...process.env, MQ_ROOT: root }, maxBuffer: 64 << 20, timeout: 1200000 });
const out = `${r.stdout || ''}${r.stderr || ''}`;
const run = { out, code: r.status, signal: r.signal, timedOut: false };
const row = P.judge(g, run, (g.parse || P.generic)(g, out, r.status));
const v = [...out.matchAll(new RegExp(`^${g.script.replace(/[-]/g, '\\-')}: (OK|N\\/A|FAIL|WOULD FAIL)\\b.*$`, 'gm'))].pop();
const toolSays = v ? v[1] : 'NO VERDICT';
const want = { OK: ['PASS', 'PASS (baseline)'], 'N/A': ['N/A'], FAIL: ['FAIL'], 'WOULD FAIL': ['FAIL'] }[toolSays] || [];
const agree = want.includes(row.result);
console.log(`  tool  ${v ? v[0].slice(0, 200) : '(no verdict line)'} (exit ${r.status})`);
console.log(`  row   ${row.result} - ${String(row.findings).slice(0, 200)}`);
console.log(agree ? `${TOOL}: OK (${gateId} on ${keys.join(',')}: the tool says ${toolSays}, the precritic row ${row.result})`
    : `${TOOL}: FAIL (${gateId} on ${keys.join(',')}: the tool says ${toolSays}, the precritic row says ${row.result})`);
process.exit(agree ? 0 : 1);
