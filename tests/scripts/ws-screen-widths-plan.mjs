// ws-screen-widths-plan — do precritic's SCREEN gates render at the owner's screen widths? (lf-hosts critic r2 F2: precritic
// ran ws-phone-card only at 390 x 844 and 390 x 664, so TOUCH-UNIQUE, FOCUS-RING, TOUCH-HIT and the card CELL-READ never ran
// at a tablet width on the lane's path; ws-screen-slots --screen-digit and ws-screen-ink-size judged 390 / 820 / 1280, never
// 1024 or 1366, and the worksheet-reflow gate's label said "390 / 820 / 1280".)
//
//   node tests/scripts/ws-screen-widths-plan.mjs                 # judge this tree's precritic plan
//   node tests/scripts/ws-screen-widths-plan.mjs --root <tree>   # judge another checkout's plan (ws-backtest commit-pair rows)
//   node tests/scripts/ws-screen-widths-plan.mjs --self-test     # the judging rules on fixed plans (no precritic run)
//
// THE OWNER SET is read from ONE table, this tree's tests/lib/ws-screen-widths.cjs SCREEN_WIDTHS (820, 1024, 1280, 1366).
// It runs `<tree>/tests/scripts/ws-precritic.cjs --skill <SKILL> --dry-run` (SKILL: subtraction:sub_word_problems, a word-work
// skill on every host) and, for each screen gate - ws-phone-card, ws-screen-slots (with --screen-digit), ws-screen-ink-size and
// ws-worksheet-reflow - asks that tree's tool for the widths it would render with the PLANNED arguments (`--print-widths`;
// MQ_ROOT=<tree>). A tool too old to answer is read from its planned `--sizes` / `--widths` or its source default
// (ws-phone-card's `arg('sizes', '...')`). Findings:
//   SW-MISSING  a screen gate is not on the plan (or ws-screen-slots runs without --screen-digit)
//   SW-SET      a gate's widths (each host's, for ws-screen-ink-size) are not exactly the owner set
//   SW-UNREAD   a gate's widths cannot be read (no --print-widths answer and no default in its source)
//   SW-LABEL    a screen gate's plan label names a width outside the owner set (e.g. "390")
// Prints one line per gate and `ws-screen-widths-plan: OK` / `FAIL (n)`; exit 1 on FAIL, 2 on usage.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TOOL = 'ws-screen-widths-plan';
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf('--' + k); return i > -1 && args[i + 1] !== undefined ? args[i + 1] : d; };
const require = createRequire(import.meta.url);
const OWNER = [...require(join(HERE, 'tests/lib/ws-screen-widths.cjs')).SCREEN_WIDTHS].sort((a, b) => a - b);
const SKILL = 'subtraction:sub_word_problems';
const GATES = ['ws-phone-card', 'ws-screen-slots', 'ws-screen-ink-size', 'ws-worksheet-reflow'];
const KNOWN_WIDTHS = new Set([320, 360, 375, 390, 414, 768, 820, 1024, 1280, 1366, 1440, 1536, 1920]);

/** The planned gates of a dry-run text: {tool: {label, args[]}}. Pure. */
export function readPlan(text) {
    const out = {};
    for (const line of String(text).split('\n')) {
        const m = /^\s*\[browser\]\s+(.*?)\s+—\s+.*?node\s+(?:\S*\/)?tests\/scripts\/(ws-[\w-]+)\.c?js\s*(.*)$/.exec(line);
        if (!m || !GATES.includes(m[2]) || out[m[2]]) continue;
        out[m[2]] = { label: m[1], args: m[3].trim() ? m[3].trim().split(/\s+/) : [] };
    }
    return out;
}
/** The widths a tool's answer names: {host|'*': [w...]}. Pure. */
export function readWidths(text) {
    const out = {};
    for (const m of String(text).matchAll(/^widths(?:\[(\w+)\])?:\s*([\d,]+)\s*$/gm)) out[m[1] || '*'] = m[2].split(',').map(Number).filter(Boolean);
    return out;
}
/** Findings on one gate. Pure. */
export function judgeGate(tool, gate, widths) {
    const f = [];
    if (!gate) return [`SW-MISSING ${tool}: not on precritic's --skill plan`];
    if (tool === 'ws-screen-slots' && !gate.args.includes('--screen-digit')) f.push(`SW-MISSING ${tool}: planned without --screen-digit (the screen digit pass never runs)`);
    const named = [...String(gate.label).matchAll(/\b(\d{3,4})\b/g)].map((m) => +m[1]).filter((w) => KNOWN_WIDTHS.has(w) && !OWNER.includes(w));
    if (named.length) f.push(`SW-LABEL ${tool}: the plan label names ${[...new Set(named)].join(', ')} px, outside the owner set ${OWNER.join(' / ')} ("${gate.label}")`);
    if (!widths || !Object.keys(widths).length) { f.push(`SW-UNREAD ${tool}: its widths cannot be read (no --print-widths answer, no default in its source)`); return f; }
    for (const [host, ws] of Object.entries(widths)) {
        const got = [...new Set(ws)].sort((a, b) => a - b);
        if (got.join(',') !== OWNER.join(',')) f.push(`SW-SET ${tool}${host === '*' ? '' : ` ${host}`}: renders ${got.join(' / ')} px, want exactly the owner set ${OWNER.join(' / ')} (tests/lib/ws-screen-widths.cjs)`);
    }
    return f;
}
/** A tool too old for --print-widths: its planned --sizes / --widths, else its source default. */
function staticWidths(root, tool, gargs) {
    const i = gargs.findIndex((a) => a === '--sizes' || a === '--widths');
    if (i > -1 && gargs[i + 1]) return { '*': gargs[i + 1].split(',').map((s) => parseInt(s, 10)).filter(Boolean) };
    const file = join(root, 'tests/scripts', `${tool}.cjs`);
    if (!existsSync(file)) return null;
    const m = /arg\('sizes',\s*'([^']+)'\)/.exec(readFileSync(file, 'utf8'));
    return m ? { '*': m[1].split(',').map((s) => parseInt(s, 10)).filter(Boolean) } : null;
}

function selfTest() {
    const plan = readPlan([
        '  [browser] ws-phone-card (practice card at 390 px: clip, first-box focus) — tests/scripts/mq-browser-run.sh node tests/scripts/ws-phone-card.cjs --skills a:b',
        '  [browser] ws-screen-slots --skills --screen-digit — tests/scripts/mq-browser-run.sh node tests/scripts/ws-screen-slots.cjs --skills a:b --screen-digit',
        '  [browser] ws-screen-ink-size (SIZE-INK) — tests/scripts/mq-browser-run.sh node tests/scripts/ws-screen-ink-size.cjs --skill a:b',
    ].join('\n'));
    const cases = [
        ['d53fa104e phone-card at 390 x 844 / 390 x 664', judgeGate('ws-phone-card', plan['ws-phone-card'], { '*': [390, 390] }), [/SW-LABEL .*390/, /SW-SET ws-phone-card: renders 390/]],
        ['screen-slots digits at 390 / 820 / 1280', judgeGate('ws-screen-slots', plan['ws-screen-slots'], { '*': [1280, 820, 390] }), [/SW-SET ws-screen-slots: renders 390 \/ 820 \/ 1280/]],
        ['ink-size worksheet at 1280 only', judgeGate('ws-screen-ink-size', plan['ws-screen-ink-size'], { card: OWNER, worksheet: [1280], quiz: OWNER }), [/SW-SET ws-screen-ink-size worksheet: renders 1280/]],
        ['ink-size every host at the owner set', judgeGate('ws-screen-ink-size', plan['ws-screen-ink-size'], { card: OWNER, worksheet: OWNER, quiz: OWNER }), []],
        ['worksheet-reflow not planned', judgeGate('ws-worksheet-reflow', plan['ws-worksheet-reflow'], null), [/SW-MISSING/]],
        ['screen-slots without --screen-digit', judgeGate('ws-screen-slots', { label: 'ws-screen-slots --skills', args: ['--skills', 'a:b'] }, { '*': [1280] }), [/SW-MISSING .*--screen-digit/, /SW-SET/]],
        ['unreadable widths', judgeGate('ws-screen-ink-size', { label: 'x', args: [] }, null), [/SW-UNREAD/]],
    ];
    let bad = 0;
    for (const [name, got, want] of cases) {
        const ok = got.length === want.length && want.every((re, i) => re.test(got[i]));
        if (!ok) bad++;
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}: ${got.join(' | ') || 'holds'}`);
    }
    const w = readWidths('widths[card]: 1280,1366\nwidths[quiz]: 820\n');
    if (JSON.stringify(w) !== JSON.stringify({ card: [1280, 1366], quiz: [820] })) { bad++; console.log(`  FAIL readWidths: ${JSON.stringify(w)}`); }
    console.log(bad ? `${TOOL}: FAIL - self-test (${bad})` : `${TOOL}: OK (self-test, ${cases.length + 1} cases)`);
    process.exit(bad ? 1 : 0);
}

function main() {
    if (args.includes('--self-test')) return selfTest();
    const root = resolve(arg('root', HERE));
    const pre = join(root, 'tests/scripts/ws-precritic.cjs');
    if (!existsSync(pre)) { console.log(`${TOOL}: no ws-precritic in ${root}`); console.log(`${TOOL}: FAIL (usage)`); process.exit(2); }
    const env = { ...process.env, MQ_ROOT: root };
    const dry = spawnSync(process.execPath, [pre, '--skill', SKILL, '--dry-run'], { cwd: root, env, encoding: 'utf8', maxBuffer: 32 << 20 });
    if (dry.status !== 0) { console.log(`${TOOL}: ws-precritic --dry-run failed in ${root}: ${String(dry.stdout || dry.stderr).trim().split('\n').slice(-1)[0]}`); console.log(`${TOOL}: FAIL (1)`); process.exit(1); }
    const plan = readPlan(dry.stdout);
    const fails = [];
    for (const tool of GATES) {
        const g = plan[tool];
        let widths = null;
        if (g) {
            const r = spawnSync(process.execPath, [join(root, 'tests/scripts', `${tool}.cjs`), ...g.args, '--print-widths'], { cwd: root, env, encoding: 'utf8', timeout: 60000, maxBuffer: 8 << 20 });
            widths = readWidths(`${r.stdout || ''}`);
            if (!Object.keys(widths).length) widths = staticWidths(root, tool, g.args);
        }
        const f = judgeGate(tool, g, widths);
        fails.push(...f);
        console.log(`${tool.padEnd(22)} ${g ? Object.entries(widths || {}).map(([h, ws]) => `${h === '*' ? '' : h + ' '}${ws.join('/')}`).join('; ') || 'widths unread' : 'not planned'}${f.length ? '\n    ' + f.join('\n    ') : ''}`);
    }
    console.log(fails.length ? `${TOOL}: FAIL (${fails.length}) - screen gates off the owner set ${OWNER.join(' / ')}` : `${TOOL}: OK (${GATES.length} screen gates at exactly ${OWNER.join(' / ')} px, read from tests/lib/ws-screen-widths.cjs)`);
    process.exit(fails.length ? 1 : 0);
}
main();
