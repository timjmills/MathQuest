// ws-precritic-plan — is every backtested check ON THE LANE'S PATH? (S1 critic r1 D2: checks 8 and 11 had green backtests
// because the rows called ws-print-lint on the pilot skill directly, while `ws-precritic --skill <that skill>` never linted
// its lesson page.) "A check that is not on the lane's path is not wired."
//
//   node tests/scripts/ws-precritic-plan.mjs              # every row of tests/fixtures/precritic/backtests.json
//   node tests/scripts/ws-precritic-plan.mjs --self-test  # the command reader + the ledger sweep on planted rows, no precritic run
//   node tests/scripts/ws-precritic-plan.mjs --checks-from-critics   # ONLY the ledger sweep (below); also run by default
//   node tests/scripts/ws-precritic-plan.mjs --no-sweep   # the path check without the ledger sweep
//
// THE LEDGER SWEEP (owner rule 2026-11-13: every finding becomes an automatic check before its fix lands). Each finding row
// of design/lessons-first/CHECKS_FROM_CRITICS.md names its backtest id(s) in the "Backtest row" column, or a reasoned
// exemption (`exempt: <why>`, `not machine-measurable: <why>`, or a process rule). The sweep FAILS a row with neither, a
// row whose id is not in backtests.json, and a row whose id is not on precritic's path - the SAME per-row verdict the
// path check below gives (rowPath); a fixture row with no skill is on the path when its tool is a ws-precritic or deploy
// gate. It lives here, not in ws-backtest, because "on the lane's path" is decided here and the default run has already
// computed it for every row. Failing rows are listed by owner lane (the ledger's Lane column).
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
    'ws-partopts-unit': { scope: ['--role', 'lesson'], flags: ['--bt-only', '--coverage-only', '--doc-only', '--lessons'] },
    'ws-partopts-shots': { scope: ['--role', 'lesson'], flags: [] },
    'ws-partopts-supports': { scope: ['--role', 'lesson'], flags: ['--unit', '--ui', '--lessons'] },
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

// the ws-empty-band flags that switch rules ON: a row run with one is on the path only where the plan runs it too
export const EB_FLAGS = ['--model-states', '--vocab-ink', '--page-fill'];
// the ws-grade-render modes that switch a check on (lf-checks queue 13: --raster-fit is LP-RASTER on role pages; a plain
// render of the same role is not that check)
export const GR_FLAGS = ['--raster-fit'];
/** The plan lines of a dry run that run `tool` on every skill of `skills` (and on role R when given: `--roles` names R in its
 *  comma list, or - `cardRoles` given - the line has no --roles and so renders every role the signed card offers, R among
 *  them), carrying every flag of `flags`. Pure. */
export function planHas(planText, { tool, skills, roles, flags = [], cardRoles = null }) {
    const esc = (x) => String(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return planText.split('\n').filter((l) => l.includes(`tests/scripts/${tool}.`))
        .filter((l) => skills.every((k) => l.includes(k) || l.includes(k.split(':')[1])))
        .filter((l) => {
            if (!roles) return true;
            const cmd = l.slice(l.indexOf(`tests/scripts/${tool}.`));
            if (new RegExp(`--roles?[ =](?:[^\\s,]+,)*${esc(roles)}(?:,|\\s|$)`).test(cmd)) return true;
            return !!cardRoles && cardRoles.includes(roles) && !/--roles?[ =]/.test(cmd);
        })
        .filter((l) => flags.every((f) => l.slice(l.indexOf(`tests/scripts/${tool}.`)).includes(f)));
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
    const eb = '  [browser] eb — node tests/scripts/ws-empty-band.cjs --skill addition:add_facts --vocab-ink --page-fill\n  [browser] ebr — node tests/scripts/ws-empty-band.cjs --skill addition:add_facts --roles scripted-model --hosts none --model-states';
    eq('role in a comma list', planHas('x node tests/scripts/ws-empty-band.cjs --skill a:b --roles guided,scripted-model', { tool: 'ws-empty-band', skills: ['a:b'], roles: 'scripted-model' }).length, 1);
    eq('role not a prefix match', planHas('x node tests/scripts/ws-empty-band.cjs --skill a:b --roles guided-x', { tool: 'ws-empty-band', skills: ['a:b'], roles: 'guided' }).length, 0);
    eq('card roles cover a line with no --roles', planHas(eb, { tool: 'ws-empty-band', skills: ['addition:add_facts'], roles: 'guided', cardRoles: ['guided'] }).length, 1);
    eq('a role the card does not offer', planHas(eb, { tool: 'ws-empty-band', skills: ['addition:add_facts'], roles: 'stretch', cardRoles: ['guided'] }).length, 0);
    eq('flag carried', planHas(eb, { tool: 'ws-empty-band', skills: ['addition:add_facts'], roles: 'scripted-model', flags: ['--model-states'], cardRoles: ['scripted-model'] }).length, 1);
    eq('flag missing', planHas(eb.split('\n')[0], { tool: 'ws-empty-band', skills: ['addition:add_facts'], roles: 'scripted-model', flags: ['--model-states'], cardRoles: ['scripted-model'] }).length, 0);
    eq('grade-render raster flag carried', planHas('x node tests/scripts/ws-grade-render.cjs --skills a:b --roles scripted-model,guided --raster-fit', { tool: 'ws-grade-render', skills: ['a:b'], roles: 'scripted-model', flags: GR_FLAGS }).length, 1);
    eq('grade-render raster flag missing', planHas('x node tests/scripts/ws-grade-render.cjs --skills a:b --roles scripted-model --gate', { tool: 'ws-grade-render', skills: ['a:b'], roles: 'scripted-model', flags: GR_FLAGS }).length, 0);
    eq('not planned for another skill', planHas(plan, { tool: 'ws-dealer-uniform', skills: ['addition:add'], roles: null }).length, 0);
    // lane rows (lf-partopts): no skill, no detailed lesson - the tool and its scope flag
    eq('lane bt row', readLaneCommand('/tmp/mq-browser-run.sh node tests/scripts/ws-partopts-unit.cjs --bt-only --only FILL-BT'), { tool: 'ws-partopts-unit', scope: ['--role', 'lesson'], flag: '--bt-only' });
    eq('lane lessons row', readLaneCommand('MQ_ROOT={root} node tests/scripts/ws-partopts-unit.cjs --lessons number_sense:nearest_10 --sizes M --only PO-2d'), { tool: 'ws-partopts-unit', scope: ['--role', 'lesson'], flag: '--lessons' });
    eq('lane shots row', readLaneCommand('node tests/scripts/ws-partopts-shots.cjs --no-shots --only R1'), { tool: 'ws-partopts-shots', scope: ['--role', 'lesson'], flag: null });
    eq('lane doc row', readLaneCommand('MQ_ROOT={root} node tests/scripts/ws-partopts-unit.cjs --doc-only --only PO-DOC'), { tool: 'ws-partopts-unit', scope: ['--role', 'lesson'], flag: '--doc-only' });
    eq('lane doc not planned by a bt line', planHasLane('  [browser] bt — node tests/scripts/ws-partopts-unit.cjs --bt-only', { tool: 'ws-partopts-unit', flag: '--doc-only' }).length, 0);
    eq('not a lane row', readLaneCommand('node tests/scripts/ws-node-lint.mjs --skill addition:add'), null);
    const lanePlan = '  [browser] parts — tests/scripts/mq-browser-run.sh node tests/scripts/ws-partopts-unit.cjs --lessons number_sense:nearest_10 --sizes M,L --walk-depth 1\n  [browser] bt — node tests/scripts/ws-partopts-unit.cjs --bt-only\n  [browser] shots — node tests/scripts/ws-partopts-shots.cjs --no-packets --no-shots';
    eq('lane bt planned', planHasLane(lanePlan, { tool: 'ws-partopts-unit', flag: '--bt-only' }).length, 1);
    eq('lane coverage not planned', planHasLane(lanePlan, { tool: 'ws-partopts-unit', flag: '--coverage-only' }).length, 0);
    eq('lane shots planned', planHasLane(lanePlan, { tool: 'ws-partopts-shots', flag: null }).length, 1);
    // the CHECKS_FROM_CRITICS sweep on planted ledger rows: missing id, unknown id, off-path id, exempt, good (+ legacy forms)
    const sw = sweepSelfTest(); n += sw.n; bad.push(...sw.bad.map((b) => `checks-from-critics: ${b}`));
    eq('tool of a fixture command', commandTool('node tests/scripts/ws-backtest.mjs x; node tests/scripts/ws-empty-band.cjs --html {fixture}'), 'ws-empty-band');
    console.log(bad.length ? `${TOOL}: FAIL (self-test, ${bad.length} of ${n})\n  ${bad.join('\n  ')}` : `${TOOL}: OK (self-test, ${n} cases)`);
    process.exit(bad.length ? 1 : 0);
}

/* ============================================================== the CHECKS_FROM_CRITICS sweep (owner rule 2026-11-13) */
// Every finding (critic, owner, lead ruling) becomes an automatic check BEFORE its fix lands, and its ledger row in
// design/lessons-first/CHECKS_FROM_CRITICS.md names that check's backtest id(s). The sweep FAILS a row whose "Backtest row"
// cell names no id and carries no reasoned exemption, a row whose id is not in backtests.json, and a row whose id is not on
// precritic's path (the same verdict this tool gives that backtest row; a row with no skill in its command - a fixture of a
// tool - is on the path when its tool is a ws-precritic gate or a ws-deploy-gates.sh gate).
export const LEDGER = 'design/lessons-first/CHECKS_FROM_CRITICS.md';
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;

/** The ledger's finding rows: [{n (1-based line), date, lane, finding, cell}] from every `| <date> | ...` table line; the
 *  backtest cell is the column whose header names "Backtest". Pure. */
export function parseLedger(text) {
    const lines = String(text).split('\n');
    const cells = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    let col = -1; const rows = [];
    lines.forEach((l, i) => {
        if (!/^\s*\|/.test(l)) return;
        const c = cells(l);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(c[0] || '')) { if (c.some((x) => /^backtest/i.test(x))) col = c.findIndex((x) => /^backtest/i.test(x)); return; }
        rows.push({ n: i + 1, date: c[0], lane: c[1] || '', finding: c[2] || '', cell: col >= 0 ? (c[col] || '') : '', raw: l });
    });
    return rows;
}
/** What a "Backtest row" cell declares: {ids[], exempt (reason) | null}. Grammar (backwards compatible with the rows
 *  written before the sweep): `exempt: <reason>` / `not machine-measurable: <reason>` (a reason of >= 10 characters), or a
 *  process rule (`— (process rule)`, `process rule: ...`: a rule for people, not a property of a page); `same row` = the
 *  previous row's ids; else the ids in `backticks`, or, with no backticks, every hyphenated lower-case token outside
 *  parentheses (so free text such as "lf-checks backtests" reads as an UNKNOWN id, never as a pass). Pure. */
export function readBacktestCell(cell, prevIds = []) {
    const s = String(cell).trim();
    const ex = /^(?:exempt|not machine[- ]measurable)\s*:\s*(.*)$/i.exec(s);
    if (ex) return ex[1].trim().length >= 10 ? { ids: [], exempt: s } : { ids: [], exempt: null, bad: 'an exemption with no reason (>= 10 characters)' };
    if (/^(?:[—–-]\s*)?\(?\s*process rule\b/i.test(s)) return { ids: [], exempt: 'process rule' };
    if (/^same row\b/i.test(s)) return { ids: [...prevIds], exempt: null };
    const ticks = [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
    if (ticks.length) return { ids: [...new Set(ticks.flatMap((t) => t.split(/[\s,]+/)).filter((t) => ID_RE.test(t)))], exempt: null };
    const bare = s.replace(/\([^)]*\)/g, ' ');
    return { ids: [...new Set([...bare.matchAll(/(?:^|[\s,;])([a-z][a-z0-9]*(?:-[a-z0-9]+)+)(?=$|[\s,;.])/g)].map((m) => m[1]))], exempt: null };
}
/** Judge every ledger row: [{row, ids, status 'PASS'|'EXEMPT'|'FAIL', why}]. `known(id)` says the id is a backtests.json row;
 *  `onPath(id)` gives {ok, why}. Pure (given the two callbacks). */
export function sweepLedger(rows, { known, onPath }) {
    let prev = [];
    return rows.map((row) => {
        const d = readBacktestCell(row.cell, prev);
        if (d.ids.length) prev = d.ids;
        if (d.exempt) return { row, ids: [], status: 'EXEMPT', why: d.exempt };
        if (d.bad) return { row, ids: [], status: 'FAIL', why: d.bad };
        if (!d.ids.length) return { row, ids: [], status: 'FAIL', why: `no backtest id and no exemption ("${row.cell.slice(0, 60)}")` };
        const unknown = d.ids.filter((id) => !known(id));
        if (unknown.length) return { row, ids: d.ids, status: 'FAIL', why: `not in backtests.json: ${unknown.join(', ')}` };
        const off = d.ids.map((id) => ({ id, p: onPath(id) })).filter((x) => !x.p.ok);
        if (off.length) return { row, ids: d.ids, status: 'FAIL', why: `not on precritic's path: ${off.map((x) => `${x.id} (${x.p.why})`).join('; ')}` };
        return { row, ids: d.ids, status: 'PASS', why: d.ids.join(', ') };
    });
}
/** The owner lane of a ledger row: the Lane cell's first word ("lf-engine live-pm2" -> lf-engine). Pure. */
export const ownerLane = (row) => (String(row.lane).trim().split(/\s+/)[0] || '?');

function sweepSelfTest() {
    const md = ['| Date | Lane | Finding | Check id | Backtest row (FAIL failed state → PASS fix) | On path | Saved |', '|---|---|---|---|---|---|---|',
        '| 2026-11-13 | lane-a | missing id | X | — | precritic | 1 |',
        '| 2026-11-13 | lane-b | unknown id | X | `no-such-row` | precritic | 1 |',
        '| 2026-11-13 | lane-c | off-path id | X | `row-off` | precritic | 1 |',
        '| 2026-11-13 | lane-d | exempt | X | not machine-measurable: message wording only, read by the critic | - | 0 |',
        '| 2026-11-13 | lane-e | good | X | `row-good` (FAIL abc → OK def) | precritic | 1 |',
        'free text between tables',
        '| 2026-11-13 | lane-f live-x | legacy bare ids | X | row-good, row-good-2 (3 → 0) | precritic | 1 |',
        '| 2026-11-13 | lane-g | same row | X | same row | lane gate | 1 |',
        '| 2026-11-13 | lane-h | process rule | Rule: ... | — (process rule) | hand-over | 1 |',
        '| 2026-11-13 | lane-i | free text | X | lf-checks backtests | precritic | 1 |',
        '| 2026-11-13 | lane-j | empty exemption | X | exempt: n/a | - | 0 |',
        '| 2026-11-13 | lane-k | a later cell says backtest | X | `row-good` | backtest only | 1 |',
        '| 2026-11-13 | lane-l | column kept | X | `row-good-2` | precritic | 1 |'].join('\n');
    const known = (id) => ['row-off', 'row-good', 'row-good-2'].includes(id);
    const onPath = (id) => (id === 'row-off' ? { ok: false, why: 'precritic plans no gate on it' } : { ok: true, why: '' });
    const res = sweepLedger(parseLedger(md), { known, onPath });
    const got = res.map((r) => `${r.row.lane.split(' ')[0]}:${r.status}`);
    const want = ['lane-a:FAIL', 'lane-b:FAIL', 'lane-c:FAIL', 'lane-d:EXEMPT', 'lane-e:PASS', 'lane-f:PASS', 'lane-g:PASS', 'lane-h:EXEMPT', 'lane-i:FAIL', 'lane-j:FAIL', 'lane-k:PASS', 'lane-l:PASS'];
    const bad = [];
    if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`verdicts ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
    const why = (lane) => (res.find((r) => r.row.lane.startsWith(lane)) || {}).why || '';
    if (!/no backtest id/.test(why('lane-a'))) bad.push(`missing id reason: ${why('lane-a')}`);
    if (!/not in backtests\.json: no-such-row/.test(why('lane-b'))) bad.push(`unknown id reason: ${why('lane-b')}`);
    if (!/not on precritic's path: row-off/.test(why('lane-c'))) bad.push(`off-path reason: ${why('lane-c')}`);
    if (why('lane-f') !== 'row-good, row-good-2') bad.push(`legacy bare ids read as ${why('lane-f')}`);
    if (why('lane-g') !== 'row-good, row-good-2') bad.push(`"same row" read as ${why('lane-g')}`);
    if (!/lf-checks/.test(why('lane-i'))) bad.push(`free text not read as an unknown id: ${why('lane-i')}`);
    if (ownerLane(res[5].row) !== 'lane-f') bad.push('owner lane of "lane-f live-x"');
    // the hybrid scope (lead 2026-11-13): a row names a skill by its full key or bare id, never by a longer id; the header date
    const sk = [['full key', rowNamesSkill({ finding: 'band on division:div_facts guided' }, ['division:div_facts']), true],
        ['bare id', rowNamesSkill({ finding: 'div_facts guided band' }, ['division:div_facts']), true],
        ['longer id is not it', rowNamesSkill({ finding: 'div_facts_long band' }, ['division:div_facts']), false],
        ['another column (raw)', rowNamesSkill({ finding: 'x', raw: '| 2026-11-13 | lf-ops | x | div_facts |' }, ['division:div_facts']), true],
        ['flip date read', +globalFlip('**Blocks globally from: 2026-11-14 13:00 UTC**'), Date.UTC(2026, 10, 14, 13, 0)],
        ['no flip date', globalFlip('no header'), null]];
    for (const [nm, got, w] of sk) if (got !== w) bad.push(`hybrid scope: ${nm}: ${got}, want ${w}`);
    const dr = [['a row dropped', droppedIds(['a', 'b', 'c'], ['a', 'c']).join(','), 'b'], ['rows only added', droppedIds(['a'], ['a', 'z']).length, 0], ['renamed counts as dropped', droppedIds(['old-id'], ['new-id']).join(','), 'old-id']];
    for (const [nm, got, w] of dr) if (got !== w) bad.push(`no-dropped-row: ${nm}: ${got}, want ${w}`);
    return { n: want.length + 7 + sk.length + 3, bad };
}

/* ============================================================== the path verdict of one backtest row (shared) */
let CTX = null;
function ctx() {
    if (CTX) return CTX;
    const table = JSON.parse(readFileSync(join(ROOT, 'tests/fixtures/precritic/backtests.json'), 'utf8'));
    const ll = spawnSync(process.execPath, [join(ROOT, 'tests/scripts/ws-precritic.cjs'), '--list-live'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 << 20 });
    let live;
    try { live = new Set(JSON.parse(ll.stdout)); } catch (e) { console.log(`${TOOL}: FAIL (ws-precritic --list-live gave no JSON list)`); process.exit(1); }
    const deploy = readFileSync(join(ROOT, 'tests/scripts/ws-deploy-gates.sh'), 'utf8');
    const precriticSrc = readFileSync(join(ROOT, 'tests/scripts/ws-precritic.cjs'), 'utf8');
    const plans = new Map();
    const plan = (skills, role) => {
        const key = `${skills.join(',')}|${role || ''}`;
        if (!plans.has(key)) {
            const r = spawnSync(process.execPath, [join(ROOT, 'tests/scripts/ws-precritic.cjs'), ...skills.flatMap((k) => ['--skill', k]), ...(role ? ['--role', role] : []), '--dry-run'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 << 20 });
            plans.set(key, { ok: r.status === 0, text: `${r.stdout || ''}${r.stderr || ''}` });
        }
        return plans.get(key);
    };
    // the page roles a skill's signed card offers (tests/lib/ws-card-plan.mjs; ws-empty-band renders them all when given no --roles)
    const cardCache = new Map();
    const cardRolesOf = (skills) => {
        const sets = skills.map((k) => {
            if (!cardCache.has(k)) {
                const r = spawnSync(process.execPath, [join(ROOT, 'tests/lib/ws-card-plan.mjs'), '--skill', k, '--root', ROOT], { cwd: ROOT, encoding: 'utf8', maxBuffer: 8 << 20 });
                let roles = [];
                try { const pl = JSON.parse(r.stdout)[0]; if (pl && pl.cards && pl.cards.length) roles = pl.roles || []; } catch (e) { roles = []; }
                cardCache.set(k, roles);
            }
            return cardCache.get(k);
        });
        return sets.length ? sets[0].filter((r) => sets.every((s) => s.includes(r))) : [];
    };
    // lane rows (lf-partopts): the precritic plan of a lane tool's scope (e.g. --role lesson), one dry run per scope
    const scopePlans = new Map();
    const scopePlan = (argv) => {
        const key = argv.join(' ');
        if (!scopePlans.has(key)) {
            const r = spawnSync(process.execPath, [join(ROOT, 'tests/scripts/ws-precritic.cjs'), ...argv, '--dry-run'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 << 20 });
            scopePlans.set(key, { ok: r.status === 0, text: `${r.stdout || ''}${r.stderr || ''}` });
        }
        return scopePlans.get(key);
    };
    CTX = { table, live, deploy, precriticSrc, plan, cardRolesOf, scopePlan, lplans: new Map(), memo: new Map() };
    return CTX;
}

/** One backtest row's path verdict: {status 'OK'|'FAIL'|'NA', print (the line shown) | null, fail (reason) | null, na | null}.
 *  The one place "on the lane's path" is decided: the default run and the ledger sweep both read it. */
function rowPath(row) {
    const C = ctx();
    if (C.memo.has(row.id)) return C.memo.get(row.id);
    const v = rowPathRaw(row, C);
    C.memo.set(row.id, v);
    return v;
}
function rowPathRaw(row, C) {
    const { live, deploy, plan, cardRolesOf, lplans, scopePlan } = C;
    // a lane-tool row (lf-partopts: no skill, no detailed lesson) is on the path when the tool's precritic scope plans it,
    // with the row's scope flag (--bt-only / --coverage-only / --lessons) on that planned line
    const lane = readLaneCommand(row.command || '');
    if (lane) {
        const p = scopePlan(lane.scope);
        const via = `ws-precritic ${lane.scope.join(' ')}`;
        if (!p.ok) return { status: 'FAIL', print: null, fail: `${row.id}: ${via} --dry-run failed: ${p.text.trim().split('\n').slice(-1)[0]}` };
        const hit = planHasLane(p.text, lane);
        const print = `  ${hit.length ? 'OK  ' : 'FAIL'} ${row.id.padEnd(30)} ${lane.tool}${lane.flag ? ` ${lane.flag}` : ''} (via ${via})`;
        return hit.length ? { status: 'OK', print } : { status: 'FAIL', print, fail: `${row.id}: ${via} plans no ${lane.tool}${lane.flag ? ` ${lane.flag}` : ''} gate (the check is backtested but not on the lane's path)` };
    }
    const lc = readLessonCommand(row.command || '');
    if (lc) {
        if (!lplans.has(lc.lesson)) { const r = spawnSync(process.execPath, [join(ROOT, 'tests/scripts/ws-precritic.cjs'), '--lesson', lc.lesson, '--dry-run'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 << 20 }); lplans.set(lc.lesson, { ok: r.status === 0, text: `${r.stdout || ''}${r.stderr || ''}` }); }
        const p = lplans.get(lc.lesson);
        const via = `ws-precritic --lesson ${lc.lesson}`;
        if (!p.ok) return { status: 'FAIL', print: null, fail: `${row.id}: ${via} --dry-run failed: ${p.text.trim().split('\n').slice(-1)[0]}` };
        const hit = planHasLesson(p.text, lc);
        const print = `  ${hit.length ? 'OK  ' : 'FAIL'} ${row.id.padEnd(30)} ws-detailed-lesson --${lc.mode} on lesson ${lc.lesson} (via ${via})`;
        return hit.length ? { status: 'OK', print } : { status: 'FAIL', print, fail: `${row.id}: ${via} plans no ws-detailed-lesson --${lc.mode} on it (the check is backtested but not on the lane's path)` };
    }
    const c0 = readCommand(row.command || '');
    if (!c0) return { status: 'NA', na: row.id };
    const gone = c0.skills.filter((k) => !live.has(k));
    // `--roles none` (ws-empty-band: the screen hosts only) is the --skill plan's host run, not a page role
    const c = { ...c0, skills: c0.skills.filter((k) => live.has(k)), roles: c0.roles === 'none' ? null : c0.roles };
    if (!c.skills.length) return { status: 'NA', na: `${row.id} (not live here: ${gone.join(',')})` };
    // a row on several roles (`--roles a,b`, critic eb-r3 D4) is on the path when EACH role is: lesson / independent through
    // the --skill plan, any other role R through `ws-precritic --skill X --role R` (a lane that touches R runs it). A
    // ws-empty-band line with no --roles renders every role the signed card offers; the row's rule flags must be carried.
    const flags = c.tool === 'ws-empty-band' ? EB_FLAGS.filter((f) => new RegExp(`${f}(\\s|$)`).test(row.command))
        : c.tool === 'ws-grade-render' ? GR_FLAGS.filter((f) => new RegExp(`${f}(\\s|$)`).test(row.command)) : [];
    const cr = c.tool === 'ws-empty-band' ? cardRolesOf(c.skills) : null;
    const per = (c.roles ? c.roles.split(',') : [null]).map((r) => {
        const role = r && r !== 'lesson' && r !== 'independent' ? r : null;
        const p = plan(c.skills, role);
        const via = `ws-precritic --skill ${c.skills.join(',')}${role ? ` --role ${role}` : ''}`;
        return { r, role, p, via, hit: p.ok ? planHas(p.text, { ...c, roles: r, flags, cardRoles: cr }) : [] };
    });
    const broken = per.find((x) => !x.p.ok);
    if (broken) return { status: 'FAIL', print: null, fail: `${row.id}: ${broken.via} --dry-run failed: ${broken.p.text.trim().split('\n').slice(-1)[0]}` };
    const missing = per.filter((x) => !x.hit.length);
    if (per.length > 1 || flags.length) {
        const print = `  ${missing.length ? 'FAIL' : 'OK  '} ${row.id.padEnd(30)} ${c.tool}${c.roles ? ` --roles ${c.roles}` : ''}${flags.length ? ` ${flags.join(' ')}` : ''} on ${c.skills.join(',')} (per role: ${per.map((x) => `${x.r || '-'}${x.role ? ' via --role' : ''}`).join(', ')})`;
        return missing.length ? { status: 'FAIL', print, fail: `${row.id}: ${missing.map((x) => `${x.via} plans no ${c.tool} on role ${x.r}${flags.length ? ` with ${flags.join(' ')}` : ''}`).join('; ')} (the check is backtested but not on the lane's path)` } : { status: 'OK', print };
    }
    const { role, p, via } = per[0];
    let hit = per[0].hit;
    // deploy path only for a tool precritic never plans (e.g. ws-viewport-check), and never for a role check: a tool that
    // precritic DOES plan must be planned on this skill (and role), or the check is off the lane's path
    const onDeploy = !hit.length && !c.roles && !p.text.includes(`tests/scripts/${c.tool}.`) && deploy.includes(`${c.tool}.`);
    if (onDeploy) hit = ['deploy'];
    const print = `  ${hit.length ? 'OK  ' : 'FAIL'} ${row.id.padEnd(30)} ${c.tool}${c.roles ? ` --roles ${c.roles}` : ''} on ${c.skills.join(',')}${onDeploy ? ' (deploy path: ws-deploy-gates.sh)' : role ? ` (via --role ${role})` : ''}${gone.length ? ` (not live here, dropped: ${gone.join(',')})` : ''}`;
    return hit.length ? { status: 'OK', print } : { status: 'FAIL', print, fail: `${row.id}: ${via} plans no ${c.tool}${c.roles ? ` --roles ${c.roles}` : ''} gate on it (the check is backtested but not on the lane's path)` };
}
/** The tool a row's command runs (the last tests/scripts/ws-* that is not a wrapper), or null. Pure. */
export function commandTool(cmd) {
    const t = [...String(cmd).matchAll(/tests\/scripts\/(ws-[\w-]+)\.(?:c?js|mjs|sh)/g)].map((m) => m[1]).filter((x) => !WRAPPERS.has(x));
    return t.length ? t[t.length - 1] : null;
}
/** Is a backtest row ON PRECRITIC'S PATH, for the ledger sweep: the row's own path verdict; a row that names no live skill
 *  (a fixture of a tool) is on the path when its tool is a ws-precritic gate or a ws-deploy-gates.sh gate. */
function idOnPath(id) {
    const C = ctx();
    const row = (C.table.rows || []).find((r) => r.id === id);
    if (!row) return { ok: false, why: 'no such row' };
    if (!row.command) return { ok: false, why: 'the row has no command yet' };
    const v = rowPath(row);
    if (v.status === 'OK') return { ok: true, why: '' };
    if (v.status === 'FAIL') return { ok: false, why: v.fail.replace(`${id}: `, '') };
    const tool = commandTool(row.command);
    if (!tool) return { ok: false, why: 'its command runs no tests/scripts/ws-* check' };
    const inPre = C.precriticSrc.includes(`'${tool}'`) || C.precriticSrc.includes(`tests/scripts/${tool}.`);
    const inDeploy = C.deploy.includes(`${tool}.`);
    return inPre || inDeploy ? { ok: true, why: '' } : { ok: false, why: `${tool} is neither a ws-precritic gate nor a deploy gate` };
}
/** Run the sweep on the ledger: prints one line per failing row (grouped by owner lane) and a summary; returns the count. */
// The ledger's scope rule (lead 2026-11-13, hybrid): `--skills a:b,c:d` (precritic --skill / --role passes the run's skills)
// judges ONLY the rows that name one of those skills, and BLOCKS on them (a lane cannot send a critic with its own gaps open).
// With no --skills (deploy session 1, the default plan run) every row is judged, but until the ledger header's
// "Blocks globally from: <ISO>" time it only WARNS (prints the list, exit 0); from that time on it blocks.
const SWEEP_SKILLS = (() => { const i = args.indexOf('--skills'); return i >= 0 && args[i + 1] ? args[i + 1].split(',').map((x) => x.trim()).filter(Boolean) : null; })();
export function rowNamesSkill(row, keys) {
    const text = `${row.finding || ''} ${row.lane || ''} ${row.raw || ''}`;
    return keys.some((k) => { const id = k.includes(':') ? k.split(':')[1] : k; return [k, id].some((t) => new RegExp(`(^|[^A-Za-z0-9_])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^A-Za-z0-9_])`).test(text)); });
}
export function globalFlip(text) { const m = /Blocks globally from:\s*(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})\s*UTC/.exec(text); return m ? new Date(`${m[1]}T${m[2]}:00Z`) : null; }
let SWEEP_WARN_ONLY = false;
// NO DROPPED ROW (lead 2026-11-13, lf-ops: 7 div_facts rows were lost when a deploy cherry-pick kept master's tests/ files): a
// tree must hold every backtest row id the baseline held. The baseline is `--rows-before <file>` (a backtests.json), else
// origin/master's table. This BLOCKS always, in every scope, whatever the ledger header's warning date says.
export function droppedIds(before, after) { const a = new Set(after); return [...new Set(before)].filter((id) => !a.has(id)); }
function baselineIds() {
    const i = args.indexOf('--rows-before');
    let text = null, from = '';
    if (i >= 0 && args[i + 1]) { try { text = readFileSync(resolve(process.cwd(), args[i + 1]), 'utf8'); from = args[i + 1]; } catch (e) { return { ids: null, from: `${args[i + 1]} (unreadable)` }; } }
    else {
        // the baseline is the FORK POINT with origin/master, not master's tip (lf-checks 2026-11-13: a lane branch behind master read
        // master's NEWER rows as "dropped"). A deploy tree has master merged in, so its merge base is master's tip: same check there.
        const mb = spawnSync('git', ['merge-base', 'HEAD', 'origin/master'], { cwd: ROOT, encoding: 'utf8' });
        const ref = mb.status === 0 && mb.stdout.trim() ? mb.stdout.trim() : 'origin/master';
        const r = spawnSync('git', ['show', `${ref}:tests/fixtures/precritic/backtests.json`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
        if (r.status !== 0) return { ids: null, from: `${ref.slice(0, 9)} (not readable here)` };
        text = r.stdout; from = ref === 'origin/master' ? 'origin/master' : `the fork point with origin/master (${ref.slice(0, 9)})`;
    }
    try { const o = JSON.parse(text); return { ids: (Array.isArray(o) ? o : o.rows || []).map((x) => x.id), from }; } catch (e) { return { ids: null, from: `${from} (not JSON)` }; }
}
function dropSweep() {
    const C = ctx();
    const now = (C.table.rows || []).map((r) => r.id);
    const b = baselineIds();
    if (!b.ids) { console.log(`  no-dropped-row: baseline ${b.from}: skipped`); return 0; }
    const gone = droppedIds(b.ids, now);
    console.log(`  no-dropped-row: ${b.ids.length} row id(s) in ${b.from}, ${now.length} here: ${gone.length ? `${gone.length} DROPPED: ${gone.join(', ')}` : 'none dropped'}`);
    return gone.length;
}
function runSweep() {
    const C = ctx();
    const ids = new Set((C.table.rows || []).map((r) => r.id));
    const ledgerText = readFileSync(join(ROOT, LEDGER), 'utf8');
    let rows = parseLedger(ledgerText);
    if (SWEEP_SKILLS) {
        const all = rows.length; rows = rows.filter((r) => rowNamesSkill(r, SWEEP_SKILLS));
        console.log(`  checks-from-critics: scoped to ${SWEEP_SKILLS.join(', ')}: ${rows.length} of ${all} ledger rows name them (blocking)`);
        if (!rows.length) return 0;
    } else {
        const flip = globalFlip(ledgerText), now = new Date(process.env.MQ_NOW || Date.now());
        SWEEP_WARN_ONLY = !!flip && now < flip;
        console.log(`  checks-from-critics: every ledger row; ${flip ? (SWEEP_WARN_ONLY ? `WARNING only until ${flip.toISOString()} (ledger header), blocking after` : `blocking (since ${flip.toISOString()})`) : 'blocking (no "Blocks globally from" in the ledger header)'}`);
    }
    if (!rows.length) { console.log(`  checks-from-critics: no finding rows read from ${LEDGER}`); return 1; }
    const res = sweepLedger(rows, { known: (id) => ids.has(id), onPath: idOnPath });
    const failed = res.filter((r) => r.status === 'FAIL');
    const byLane = new Map();
    for (const r of failed) { const l = ownerLane(r.row); if (!byLane.has(l)) byLane.set(l, []); byLane.get(l).push(r); }
    console.log(`\n  checks-from-critics (${LEDGER}): ${res.length} finding rows`);
    for (const [lane, rs] of byLane) {
        console.log(`  owner lane ${lane}: ${rs.length} row(s) missing a backtest id or off the path`);
        for (const r of rs) console.log(`    FAIL line ${r.row.n} (${r.row.date}, ${r.row.lane}): ${r.row.finding.slice(0, 90)}${r.row.finding.length > 90 ? '…' : ''}\n         ${r.why}`);
    }
    const n = (s) => res.filter((r) => r.status === s).length;
    console.log(`  checks-from-critics: ${n('PASS')} pass, ${n('EXEMPT')} exempt, ${n('FAIL')} fail`);
    return failed.length;
}

if (args.includes('--self-test')) selfTest();
else if (args.includes('--checks-from-critics')) {
    const dropped = dropSweep();
    if (dropped) { runSweep(); console.log(`${TOOL}: FAIL (no-dropped-row: ${dropped} backtest row id(s) the baseline held are missing from this tree)`); process.exit(1); }
    const bad = runSweep();
    if (bad && SWEEP_WARN_ONLY) { console.log(`${TOOL}: OK (checks-from-critics WARNING: ${bad} ledger row(s) with no backtest id on precritic's path; blocking from the ledger header's date)`); process.exit(0); }
    console.log(bad ? `${TOOL}: FAIL (checks-from-critics: ${bad} ledger row(s) with no backtest id on precritic's path)` : `${TOOL}: OK (checks-from-critics)`);
    process.exit(bad ? 1 : 0);
} else {
    const C = ctx();
    const { table, live, plan } = C;
    const fails = []; const na = []; let checked = 0;
    for (const row of table.rows || []) {
        const v = rowPath(row);
        if (v.status === 'NA') { na.push(v.na); continue; }
        checked++;
        if (v.print) console.log(v.print);
        if (v.fail) fails.push(v.fail);
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
        // the probe skill is in NO lane's opt-in (lf-checks 2026-11-13: add_facts is lf-ops' own opt-in skill, so its
        // --rule-skills addition:add_facts was read as lf-placevalue's leak); a leak is a --rule-skills line naming THIS lane's skills
        const anyLane = new Set(((optIn && optIn.lanes) || []).flatMap((l) => l.skills || []));
        const other = [...live].find((k) => !anyLane.has(k) && k.startsWith('addition:'));
        if (other) {
            checked++;
            const q = plan([other], null);
            const leak = q.text.split('\n').some((l) => l.includes('--rule-skills') && ((lane.skills || []).some((k) => l.includes(k)) || l.includes(`--rule-skills ${other}`)));
            console.log(`  ${leak ? 'FAIL' : 'OK  '} opt-in ${lane.lane}: not on another skill's plan (${other})`);
            if (leak) fails.push(`opt-in ${lane.lane}: ws-precritic --skill ${other} --dry-run carries --rule-skills (the lane's rules leak onto another skill)`);
        }
    }
    if (!checked) { console.log(`${TOOL}: FAIL (no row names a skill: nothing checked)`); process.exit(1); }
    // the ledger sweep rides along on the default run (its rows' path verdicts are the ones just computed); --no-sweep skips it
    const sweepBad = args.includes('--no-sweep') ? 0 : ((n) => (SWEEP_WARN_ONLY ? (n && console.log(`  checks-from-critics: ${n} row(s) - WARNING only (ledger header date)`), 0) : n))(runSweep());
    if (fails.length || sweepBad) {
        console.log(`${fails.map((f) => `  ${f}\n`).join('')}${TOOL}: FAIL (${fails.length} of ${checked} rows not on the lane's path${sweepBad ? `; checks-from-critics: ${sweepBad} ledger row(s) with no backtest id on precritic's path` : ''})`);
        process.exit(1);
    }
    console.log(`${TOOL}: OK (${checked} rows on the lane's path, ${na.length} not applicable${args.includes('--no-sweep') ? '' : '; checks-from-critics OK'})`);
}
