// ws-precritic-plan — is every backtested check ON THE LANE'S PATH? (S1 critic r1 D2: checks 8 and 11 had green backtests
// because the rows called ws-print-lint on the pilot skill directly, while `ws-precritic --skill <that skill>` never linted
// its lesson page.) "A check that is not on the lane's path is not wired."
//
//   node tests/scripts/ws-precritic-plan.mjs              # every row of tests/fixtures/precritic/backtests.json
//   node tests/scripts/ws-precritic-plan.mjs --self-test  # the command reader, no precritic run
//
// For each backtest row whose command runs a tests/scripts/ws-* check on named skills (--skill / --skills), it runs
// `ws-precritic --skill <those skills> --dry-run` once per skill set and asserts that the plan holds a gate running that
// same tool on those skills, and with the row's `--roles R` when it has one (a lesson check must be planned on the
// skill's lesson page). The lesson page is on every --skill run; another role R is on the lane's path through
// `ws-precritic --skill X --role R` (a lane that touches role R runs it), so that plan is checked for it. A tool that runs
// only in the deploy gates (tests/scripts/ws-deploy-gates.sh names it) passes as "deploy path". Skills that are not live
// in this tree (a lane's new skill backtested on its own branch) are dropped from the plan, with a note; a row left with
// none is not applicable here. Rows with no skill (fixtures of a tool's own data, card files) are not applicable.
// OPT-IN lane rules (tests/fixtures/precritic/opt-in-rules.json): each lane's flags are on its --skill plan (with
// --rule-skills) and on no other skill's plan (one addition skill's plan is checked).
// A LESSON row (lane lf-checks, 2026-11-07): a command that runs tests/scripts/ws-detailed-lesson on `--lesson <id>` (a
// detailed lesson) is checked against `ws-precritic --lesson <id> --dry-run`: the plan must run ws-detailed-lesson on that
// lesson in the row's mode (--repeats, --check, --lp, --sweep; a row on a saved packet `--packet` or a PDF `--raster` is
// the --lp mode on fixtures, so --lp must be planned).
// Prints `ws-precritic-plan: OK` / `FAIL (n)`; exits 1 on FAIL, 2 on usage.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TOOL = 'ws-precritic-plan';
const args = process.argv.slice(2);
// tools that are drivers or wrappers, never the check under test
const WRAPPERS = new Set(['ws-backtest', 'ws-precritic', 'ws-precritic-plan']);

/** {tool, skills[], roles} of a backtest command, or null when it names no skill. Pure. */
export function readCommand(cmd) {
    const tools = [...String(cmd).matchAll(/tests\/scripts\/(ws-[\w-]+)\.(?:c?js|mjs)/g)].map((m) => m[1]).filter((t) => !WRAPPERS.has(t));
    if (!tools.length) return null;
    const tool = tools[tools.length - 1];
    const tail = String(cmd).slice(String(cmd).lastIndexOf(`${tool}.`));
    const sk = [...tail.matchAll(/--skills?[ =]([^\s'"]+)/g)].flatMap((m) => m[1].split(',')).map((s) => s.trim()).filter(Boolean);
    const cat = (/--category[ =]([^\s'"]+)/.exec(tail) || [])[1];
    const skills = [...new Set(sk.map((s) => (s.includes(':') || !cat ? s : `${cat}:${s}`)))].filter((s) => s.includes(':'));
    if (!skills.length) return null;
    const roles = (/--roles?[ =]([^\s'"]+)/.exec(tail) || [])[1] || null;
    return { tool, skills, roles };
}

/** {tool, lesson, mode} of a backtest command on a detailed lesson, or null. Pure. */
export function readLessonCommand(cmd) {
    const c = String(cmd);
    if (!/tests\/scripts\/ws-detailed-lesson\.cjs/.test(c)) return null;
    const tail = c.slice(c.lastIndexOf('ws-detailed-lesson.'));
    const lesson = (/--lesson[ =]([\w-]+)/.exec(tail) || [])[1];
    if (!lesson) return null;
    const mode = /--sweep(?:-packets)?\b/.test(tail) ? 'sweep' : /--(lp|packet|raster)\b/.test(tail) ? 'lp' : /--repeats\b/.test(tail) ? 'repeats' : 'check';
    return { tool: 'ws-detailed-lesson', lesson, mode };
}
/** Lane tools whose backtests name no skill and no detailed lesson: the precritic scope each one is wired to.
 *  (lane lf-partopts, 2026-11-13: the lesson parts are on the --role lesson path - which --lesson and --unit bring - and on
 *  --teacher; a row's scope flag, --bt-only / --coverage-only / --lessons, must be on a planned line of that tool too, so a
 *  row cannot be proved by a differently scoped run of the same tool.) */
export const LANE_TOOLS = {
    'ws-partopts-unit': { scope: ['--role', 'lesson'], flags: ['--bt-only', '--coverage-only', '--lessons'] },
    'ws-partopts-shots': { scope: ['--role', 'lesson'], flags: [] },
};
/** {tool, scope, flag} of a backtest command on a lane tool, or null. Pure. */
export function readLaneCommand(cmd) {
    const c = String(cmd);
    const tool = Object.keys(LANE_TOOLS).find((t) => new RegExp(`tests/scripts/${t}\\.(?:c?js|mjs)`).test(c));
    if (!tool) return null;
    const tail = c.slice(c.lastIndexOf(`${tool}.`));
    const spec = LANE_TOOLS[tool];
    return { tool, scope: spec.scope, flag: spec.flags.find((f) => new RegExp(`${f}\\b`).test(tail)) || null };
}
/** The plan lines that run a lane tool (with the row's scope flag, when it has one). Pure. */
export function planHasLane(planText, { tool, flag }) {
    return planText.split('\n').filter((l) => l.includes(`tests/scripts/${tool}.`)).filter((l) => !flag || new RegExp(`${flag}\\b`).test(l));
}

/** The plan lines that run ws-detailed-lesson on `lesson` in `mode`. Pure. */
export function planHasLesson(planText, { lesson, mode }) {
    return planText.split('\n').filter((l) => l.includes('tests/scripts/ws-detailed-lesson.') && new RegExp(`--lesson ${lesson}(\\s|$)`).test(l) && new RegExp(`--${mode}\\b`).test(l));
}

/** The plan lines of a dry run that run `tool` on every skill of `skills` (and with --roles R when given). Pure. */
export function planHas(planText, { tool, skills, roles }) {
    return planText.split('\n').filter((l) => l.includes(`tests/scripts/${tool}.`))
        .filter((l) => skills.every((k) => l.includes(k) || l.includes(k.split(':')[1])))
        .filter((l) => !roles || new RegExp(`--roles? ${roles}\\b`).test(l));
}

function selfTest() {
    let n = 0; const bad = [];
    const eq = (name, got, want) => { n++; if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
    eq('print-lint lesson', readCommand("node tests/fixtures/x.cjs -- /tmp/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills subtraction:sub_50_no_regroup --size S"), { tool: 'ws-print-lint', skills: ['subtraction:sub_50_no_regroup'], roles: 'lesson' });
    eq('category + bare skill', readCommand('node tests/scripts/ws-content-audit.cjs --skill sub_50_no_regroup --category subtraction'), { tool: 'ws-content-audit', skills: ['subtraction:sub_50_no_regroup'], roles: null });
    eq('no skill', readCommand('node tests/scripts/ws-spec-card.mjs --fixture {fixture}'), null);
    eq('bare skill, no category', readCommand('node tests/scripts/ws-x.cjs --skill foo'), null);
    const plan = '  [browser] lint — node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills subtraction:sub_50_no_regroup\n  [node] x — node tests/scripts/ws-dealer-uniform.mjs --skill subtraction:sub_50_no_regroup';
    eq('planned lesson', planHas(plan, { tool: 'ws-print-lint', skills: ['subtraction:sub_50_no_regroup'], roles: 'lesson' }).length, 1);
    eq('not planned at another role', planHas(plan, { tool: 'ws-print-lint', skills: ['subtraction:sub_50_no_regroup'], roles: 'test' }).length, 0);
    eq('lesson lp row', readLessonCommand('node tests/scripts/ws-detailed-lesson.cjs --lesson g3-oa8-two-step-wp --packet {fixture} --only LP-TEXT'), { tool: 'ws-detailed-lesson', lesson: 'g3-oa8-two-step-wp', mode: 'lp' });
    eq('lesson repeats row', readLessonCommand('node tests/scripts/ws-detailed-lesson.cjs --lesson g4-nbt1-ten-times-value --repeats'), { tool: 'ws-detailed-lesson', lesson: 'g4-nbt1-ten-times-value', mode: 'repeats' });
    const lplan = '  [browser] x — tests/scripts/mq-browser-run.sh node tests/scripts/ws-detailed-lesson.cjs --lesson g3-oa8-two-step-wp --lp --out /tmp/x\n  [browser] y — node tests/scripts/ws-detailed-lesson.cjs --lesson g3-oa8-two-step-wp --check --repeats --out /tmp/y';
    eq('lesson lp planned', planHasLesson(lplan, { lesson: 'g3-oa8-two-step-wp', mode: 'lp' }).length, 1);
    eq('lesson sweep not planned', planHasLesson(lplan, { lesson: 'g3-oa8-two-step-wp', mode: 'sweep' }).length, 0);
    eq('not planned for another skill', planHas(plan, { tool: 'ws-dealer-uniform', skills: ['addition:add'], roles: null }).length, 0);
    // lane rows (lf-partopts): no skill, no detailed lesson - the tool and its scope flag
    eq('lane bt row', readLaneCommand('/tmp/mq-browser-run.sh node tests/scripts/ws-partopts-unit.cjs --bt-only --only FILL-BT'), { tool: 'ws-partopts-unit', scope: ['--role', 'lesson'], flag: '--bt-only' });
    eq('lane lessons row', readLaneCommand('MQ_ROOT={root} node tests/scripts/ws-partopts-unit.cjs --lessons number_sense:nearest_10 --sizes M --only PO-2d'), { tool: 'ws-partopts-unit', scope: ['--role', 'lesson'], flag: '--lessons' });
    eq('lane shots row', readLaneCommand('node tests/scripts/ws-partopts-shots.cjs --no-shots --only R1'), { tool: 'ws-partopts-shots', scope: ['--role', 'lesson'], flag: null });
    eq('not a lane row', readLaneCommand('node tests/scripts/ws-node-lint.mjs --skill addition:add'), null);
    const lanePlan = '  [browser] parts — tests/scripts/mq-browser-run.sh node tests/scripts/ws-partopts-unit.cjs --lessons number_sense:nearest_10 --sizes M,L --walk-depth 1\n  [browser] bt — node tests/scripts/ws-partopts-unit.cjs --bt-only\n  [browser] shots — node tests/scripts/ws-partopts-shots.cjs --no-packets --no-shots';
    eq('lane bt planned', planHasLane(lanePlan, { tool: 'ws-partopts-unit', flag: '--bt-only' }).length, 1);
    eq('lane coverage not planned', planHasLane(lanePlan, { tool: 'ws-partopts-unit', flag: '--coverage-only' }).length, 0);
    eq('lane shots planned', planHasLane(lanePlan, { tool: 'ws-partopts-shots', flag: null }).length, 1);
    console.log(bad.length ? `${TOOL}: FAIL (self-test, ${bad.length} of ${n})\n  ${bad.join('\n  ')}` : `${TOOL}: OK (self-test, ${n} cases)`);
    process.exit(bad.length ? 1 : 0);
}

if (args.includes('--self-test')) selfTest();
else {
    const table = JSON.parse(readFileSync(join(ROOT, 'tests/fixtures/precritic/backtests.json'), 'utf8'));
    const ll = spawnSync(process.execPath, [join(ROOT, 'tests/scripts/ws-precritic.cjs'), '--list-live'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 << 20 });
    let live;
    try { live = new Set(JSON.parse(ll.stdout)); } catch (e) { console.log(`${TOOL}: FAIL (ws-precritic --list-live gave no JSON list)`); process.exit(1); }
    const deploy = readFileSync(join(ROOT, 'tests/scripts/ws-deploy-gates.sh'), 'utf8');
    const plans = new Map();
    const plan = (skills, role) => {
        const key = `${skills.join(',')}|${role || ''}`;
        if (!plans.has(key)) {
            const r = spawnSync(process.execPath, [join(ROOT, 'tests/scripts/ws-precritic.cjs'), ...skills.flatMap((k) => ['--skill', k]), ...(role ? ['--role', role] : []), '--dry-run'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 << 20 });
            plans.set(key, { ok: r.status === 0, text: `${r.stdout || ''}${r.stderr || ''}` });
        }
        return plans.get(key);
    };
    const fails = []; const na = []; let checked = 0;
    const lplans = new Map();
    const scopePlans = new Map();
    const scopePlan = (argv) => {
        const key = argv.join(' ');
        if (!scopePlans.has(key)) {
            const r = spawnSync(process.execPath, [join(ROOT, 'tests/scripts/ws-precritic.cjs'), ...argv, '--dry-run'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 << 20 });
            scopePlans.set(key, { ok: r.status === 0, text: `${r.stdout || ''}${r.stderr || ''}` });
        }
        return scopePlans.get(key);
    };
    for (const row of table.rows || []) {
        const lane = readLaneCommand(row.command || '');
        if (lane) {
            const p = scopePlan(lane.scope);
            checked++;
            const via = `ws-precritic ${lane.scope.join(' ')}`;
            if (!p.ok) { fails.push(`${row.id}: ${via} --dry-run failed: ${p.text.trim().split('\n').slice(-1)[0]}`); continue; }
            const hit = planHasLane(p.text, lane);
            console.log(`  ${hit.length ? 'OK  ' : 'FAIL'} ${row.id.padEnd(30)} ${lane.tool}${lane.flag ? ` ${lane.flag}` : ''} (via ${via})`);
            if (!hit.length) fails.push(`${row.id}: ${via} plans no ${lane.tool}${lane.flag ? ` ${lane.flag}` : ''} gate (the check is backtested but not on the lane's path)`);
            continue;
        }
        const lc = readLessonCommand(row.command || '');
        if (lc) {
            if (!lplans.has(lc.lesson)) { const r = spawnSync(process.execPath, [join(ROOT, 'tests/scripts/ws-precritic.cjs'), '--lesson', lc.lesson, '--dry-run'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 << 20 }); lplans.set(lc.lesson, { ok: r.status === 0, text: `${r.stdout || ''}${r.stderr || ''}` }); }
            const p = lplans.get(lc.lesson);
            checked++;
            const via = `ws-precritic --lesson ${lc.lesson}`;
            if (!p.ok) { fails.push(`${row.id}: ${via} --dry-run failed: ${p.text.trim().split('\n').slice(-1)[0]}`); continue; }
            const hit = planHasLesson(p.text, lc);
            console.log(`  ${hit.length ? 'OK  ' : 'FAIL'} ${row.id.padEnd(30)} ws-detailed-lesson --${lc.mode} on lesson ${lc.lesson} (via ${via})`);
            if (!hit.length) fails.push(`${row.id}: ${via} plans no ws-detailed-lesson --${lc.mode} on it (the check is backtested but not on the lane's path)`);
            continue;
        }
        const c0 = readCommand(row.command || '');
        if (!c0) { na.push(row.id); continue; }
        const gone = c0.skills.filter((k) => !live.has(k));
        const c = { ...c0, skills: c0.skills.filter((k) => live.has(k)) };
        if (!c.skills.length) { na.push(`${row.id} (not live here: ${gone.join(',')})`); continue; }
        checked++;
        const role = c.roles && c.roles !== 'lesson' && c.roles !== 'independent' ? c.roles : null;
        const p = plan(c.skills, role);
        const via = `ws-precritic --skill ${c.skills.join(',')}${role ? ` --role ${role}` : ''}`;
        if (!p.ok) { fails.push(`${row.id}: ${via} --dry-run failed: ${p.text.trim().split('\n').slice(-1)[0]}`); continue; }
        let hit = planHas(p.text, c);
        // deploy path only for a tool precritic never plans (e.g. ws-viewport-check), and never for a role check: a tool that
        // precritic DOES plan must be planned on this skill (and role), or the check is off the lane's path
        const onDeploy = !hit.length && !c.roles && !p.text.includes(`tests/scripts/${c.tool}.`) && deploy.includes(`${c.tool}.`);
        if (onDeploy) hit = ['deploy'];
        console.log(`  ${hit.length ? 'OK  ' : 'FAIL'} ${row.id.padEnd(30)} ${c.tool}${c.roles ? ` --roles ${c.roles}` : ''} on ${c.skills.join(',')}${onDeploy ? ' (deploy path: ws-deploy-gates.sh)' : role ? ` (via --role ${role})` : ''}${gone.length ? ` (not live here, dropped: ${gone.join(',')})` : ''}`);
        if (!hit.length) fails.push(`${row.id}: ${via} plans no ${c.tool}${c.roles ? ` --roles ${c.roles}` : ''} gate on it (the check is backtested but not on the lane's path)`);
    }
    console.log(`  not applicable (no skill in the command): ${na.join(', ')}`);
    // OPT-IN lane rules (lead ruling D1 2026-11-07; tests/fixtures/precritic/opt-in-rules.json): each opted-in lane's flags
    // are on ITS --skill plan (with --rule-skills naming its skills), and on no other skill's plan. Their backtests are
    // fixture rows (no skill in the command), so this is how they are shown to be wired.
    let optIn = null;
    try { optIn = JSON.parse(readFileSync(join(ROOT, 'tests/fixtures/precritic/opt-in-rules.json'), 'utf8')); } catch (e) { optIn = null; }
    for (const lane of (optIn && optIn.lanes) || []) {
        const ks = (lane.skills || []).filter((k) => live.has(k));
        if (!ks.length) { console.log(`  n/a  opt-in ${lane.lane}: no live skill here`); continue; }
        const p = plan(ks, null);
        for (const [id, g] of Object.entries(lane.gates || {})) {
            checked++;
            const want = [...(g.addRules || []), ...(g.args || [])];
            const line = p.text.split('\n').find((l) => l.includes('--rule-skills') && want.every((w) => l.includes(w)) && ks.every((k) => l.includes(k)));
            console.log(`  ${line ? 'OK  ' : 'FAIL'} opt-in ${lane.lane} ${id.padEnd(18)} ${want.join(' ')}`);
            if (!line) fails.push(`opt-in ${lane.lane} ${id}: ws-precritic --skill ${ks.join(',')} --dry-run plans no gate with ${want.join(' ')} --rule-skills`);
        }
        const other = [...live].find((k) => !(lane.skills || []).includes(k) && k.startsWith('addition:'));
        if (other) {
            checked++;
            const q = plan([other], null);
            const leak = q.text.split('\n').some((l) => l.includes('--rule-skills'));
            console.log(`  ${leak ? 'FAIL' : 'OK  '} opt-in ${lane.lane}: not on another skill's plan (${other})`);
            if (leak) fails.push(`opt-in ${lane.lane}: ws-precritic --skill ${other} --dry-run carries --rule-skills (the lane's rules leak onto another skill)`);
        }
    }
    if (!checked) { console.log(`${TOOL}: FAIL (no row names a skill: nothing checked)`); process.exit(1); }
    if (fails.length) { console.log(`${fails.map((f) => `  ${f}`).join('\n')}\n${TOOL}: FAIL (${fails.length} of ${checked} rows not on the lane's path)`); process.exit(1); }
    console.log(`${TOOL}: OK (${checked} rows on the lane's path, ${na.length} not applicable)`);
}
