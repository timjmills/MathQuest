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
    // an option run (`--opts '{"notation":["across"]}'`, shared-roles R1-12) is only on the path when the plan prints
    // the same options
    const opts = (/--opts[ =]'([^']+)'/.exec(tail) || /--opts[ =]"((?:[^"\\]|\\.)+)"/.exec(tail) || [])[1] || null;
    return opts ? { tool, skills, roles, opts } : { tool, skills, roles };
}

/** The plan lines of a dry run that run `tool` on every skill of `skills` (and with --roles R when given). Pure. */
export function planHas(planText, { tool, skills, roles, opts }) {
    // a plan line's --roles is a comma list: it covers the row when it holds every role the row names
    const rolesOf = (l) => ((/--roles? ([^\s'"]+)/.exec(l) || [])[1] || '').split(',').filter(Boolean);
    return planText.split('\n').filter((l) => l.includes(`tests/scripts/${tool}.`))
        .filter((l) => skills.every((k) => l.includes(k) || l.includes(k.split(':')[1])))
        .filter((l) => !roles || String(roles).split(',').every((r) => rolesOf(l).includes(r)))
        .filter((l) => !opts || l.includes(opts));
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
    eq('not planned for another skill', planHas(plan, { tool: 'ws-dealer-uniform', skills: ['addition:add'], roles: null }).length, 0);
    // shared-roles R1-9 / R1-12: role lists and option runs
    const plan2 = `  [browser] think — node tests/scripts/ws-print-lint.cjs --source kit --roles reason-it,review --size S --skills addition:add_facts\n  [browser] across — node tests/scripts/ws-print-lint.cjs --source kit --roles independent,test,mixed-practice --opts '{"notation":["across"]}' --size S --skills addition:add_facts`;
    eq('opts read', readCommand(`node tests/scripts/ws-print-lint.cjs --source kit --roles mixed-practice --opts '{"notation":["across"]}' --skills addition:add_facts --size S`), { tool: 'ws-print-lint', skills: ['addition:add_facts'], roles: 'mixed-practice', opts: '{"notation":["across"]}' });
    eq('role in a role list', planHas(plan2, { tool: 'ws-print-lint', skills: ['addition:add_facts'], roles: 'review' }).length, 1);
    eq('role not in any list', planHas(plan2, { tool: 'ws-print-lint', skills: ['addition:add_facts'], roles: 'guided' }).length, 0);
    eq('option run planned', planHas(plan2, { tool: 'ws-print-lint', skills: ['addition:add_facts'], roles: 'mixed-practice', opts: '{"notation":["across"]}' }).length, 1);
    eq('option run, other value', planHas(plan2, { tool: 'ws-print-lint', skills: ['addition:add_facts'], roles: 'mixed-practice', opts: '{"notation":["stacked"]}' }).length, 0);
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
    const fails = []; const na = []; const warns = []; let checked = 0;
    for (const row of table.rows || []) {
        const c0 = readCommand(row.command || '');
        if (!c0) { na.push(row.id); continue; }
        const gone = c0.skills.filter((k) => !live.has(k));
        const c = { ...c0, skills: c0.skills.filter((k) => live.has(k)) };
        if (!c.skills.length) { na.push(`${row.id} (not live here: ${gone.join(',')})`); continue; }
        checked++;
        let role = c.roles && c.roles !== 'lesson' && c.roles !== 'independent' ? c.roles : null;
        // shared-roles R1-9..R1-12: a role check that `ws-precritic --skill X` itself plans (Reason It, Review, the
        // option pages) is on every lane's path, not only a lane that passes --role; the --skill plan is read first
        if (role) {
            const p0 = plan(c.skills, null);
            if (p0.ok && planHas(p0.text, c).length) role = null;
        }
        const p = plan(c.skills, role && !role.includes(',') ? role : role ? role.split(',')[0] : null);
        const via = `ws-precritic --skill ${c.skills.join(',')}${role ? ` --role ${role}` : ''}`;
        if (!p.ok) { fails.push(`${row.id}: ${via} --dry-run failed: ${p.text.trim().split('\n').slice(-1)[0]}`); continue; }
        let hit = planHas(p.text, c);
        // An option row whose tool the plan runs on this skill (and role) but WITHOUT the row's --opts: kept on the path
        // as before (rows written before options were read), with a warning naming the gap
        let optsGap = false;
        if (!hit.length && c.opts) { const { opts: _o, ...bare } = c; hit = planHas(p.text, bare); optsGap = hit.length > 0; if (optsGap) warns.push(row.id); }
        // deploy path only for a tool precritic never plans (e.g. ws-viewport-check), and never for a role check: a tool that
        // precritic DOES plan must be planned on this skill (and role), or the check is off the lane's path
        const onDeploy = !hit.length && !c.roles && !p.text.includes(`tests/scripts/${c.tool}.`) && deploy.includes(`${c.tool}.`);
        if (onDeploy) hit = ['deploy'];
        console.log(`  ${hit.length ? 'OK  ' : 'FAIL'} ${row.id.padEnd(30)} ${c.tool}${c.roles ? ` --roles ${c.roles}` : ''}${c.opts ? ` --opts ${c.opts}` : ''} on ${c.skills.join(',')}${onDeploy ? ' (deploy path: ws-deploy-gates.sh)' : role ? ` (via --role ${role})` : c.roles && c.roles !== 'lesson' && c.roles !== 'independent' ? ' (on the --skill path)' : ''}${gone.length ? ` (not live here, dropped: ${gone.join(',')})` : ''}${optsGap ? ' (WARN: planned without these --opts)' : ''}`);
        if (!hit.length) fails.push(`${row.id}: ${via} plans no ${c.tool}${c.roles ? ` --roles ${c.roles}` : ''} gate on it (the check is backtested but not on the lane's path)`);
    }
    console.log(`  not applicable (no skill in the command): ${na.join(', ')}`);
    if (warns.length) console.log(`  WARN option rows planned without their --opts (the option value itself is not on the lane's path): ${warns.join(', ')}`);
    if (!checked) { console.log(`${TOOL}: FAIL (no row names a skill: nothing checked)`); process.exit(1); }
    if (fails.length) { console.log(`${fails.map((f) => `  ${f}`).join('\n')}\n${TOOL}: FAIL (${fails.length} of ${checked} rows not on the lane's path)`); process.exit(1); }
    console.log(`${TOOL}: OK (${checked} rows on the lane's path, ${na.length} not applicable)`);
}
