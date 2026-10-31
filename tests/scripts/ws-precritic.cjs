#!/usr/bin/env node
// ws-precritic — one command for the machine checks of what a lane touched (IMPROVEMENT_PLAN §1.4 S1, §1.3 last row,
// §1.7 "a critic never sees a page whose machine checks are red"). It runs the gates of the plan's "What ws-precritic
// runs" table for the scope it is given, the node gates in parallel with the browser gates, every browser gate through
// /tmp/mq-browser-run.sh (two Chromium processes at a time across the container), and prints ONE PASS / FAIL table in
// markdown that a builder pastes verbatim into its report. Red gates are compared with their pinned baselines: a red
// gate whose findings are all pinned is `PASS (baseline)`, any NEW finding is FAIL.
//
//   node tests/scripts/ws-precritic.cjs --skill addition:add_20_regroup
//   node tests/scripts/ws-precritic.cjs --skill addition:add,subtraction:subtract --skill measurement:time_5min
//   node tests/scripts/ws-precritic.cjs --template function-table          # every live skill drawn by the template
//   node tests/scripts/ws-precritic.cjs --role guided                      # the pinned role sample on one page role
//   node tests/scripts/ws-precritic.cjs --teacher [--grade 3] [--lesson 3:D4:2]   # the teacher-site gates
//   node tests/scripts/ws-precritic.cjs --skill a:b --json out.json        # also write the table as JSON
//   node tests/scripts/ws-precritic.cjs --skill a:b --dry-run              # print the plan (gates, commands), run nothing
//   node tests/scripts/ws-precritic.cjs --write-role-sample                # re-derive tests/fixtures/precritic/role-sample.json
//   node tests/scripts/ws-precritic.cjs --list-live                        # every live skill as a JSON array (cat:skill)
//
// Flags may be combined (`--skill x --role guided --teacher`); a gate two scopes share runs once over the union.
//
// THE GATES (the plan's table; a gate whose tool or flag is not in this tree prints SKIPPED-NOT-BUILT, never PASS)
//   --skill   ws-node-lint --skill (its own baseline), ws-providers-unit --skill, ws-content-audit --skill,
//             ws-options-verify --skill (against its pin), ws-presets-unit (only when a skill is a preset or hosts one),
//             ws-coverage-matrix --skills --baseline design/audit/matrix/baseline.json --slots 2 (every kind × options at
//             S / M / L; a node gate, since it takes its own browser slots; SKIPPED-NOT-BUILT in a tree without it), and
//             ws-print-lint --source kit --skills --baseline (independent defaults) at sizes L, S and M, each against its
//             own pin (cheap; they duplicate the matrix's single/defaults row),
//             ws-screen-slots --skills (--baseline when the script has the flag; else this tool compares its findings
//             with the same pinned file), ws-screen-answer --skills, ws-chromebook-fit --skills, ws-code-snapshot,
//             ws-boot-smoke, and the five checks from the pilot-su-c critic r1 lessons (2026-10-23):
//             ws-sibling-compare --run <the matrix's run file> --run-siblings (process rule 0b: every printed matrix row
//               with findings - RED, OK and PENDING(no-baseline) alike, critic r6 D1 - against its PAIRED siblings (N1);
//               counts against the APPROVED siblings on the same template, tests/fixtures/precritic/siblings.json; it
//               runs after the matrix. A count above the siblings' max is FAIL "worse than siblings"; when every red
//               count is at or below them, the coverage-matrix row reads PASS (baseline) "engine red", non-blocking),
//             ws-slot-clip --run <the matrix's run file> (print-lint's SLOT lint L-ANSAREA and CLIP lint L-OVERFLOW on
//               EVERY matrix row at S / M / L, judged against the siblings, plus the box-width (TY-21) and place-head
//               overlap (H2) probe; after the sibling comparison, so the sibling run is cached),
//             ws-phone-card --skills (the practice card at 390 x 844 and 390 x 664: nothing cut off sideways, the
//               first answer box focused and in view),
//             ws-card-rulings --check rulings (the spec card's numeric rulings against 300 seeded items a skill) and
//             ws-card-rulings --check offered (the option panel offers nothing the card lists as not offered). A skill
//               whose card has no machine-readable rulings block makes these two rows SKIPPED (no rulings): not run,
//               and a scope where only SOME skills have rulings makes them INCOMPLETE (partial rulings; critic r6 D3),
//               not passed, and an incomplete run under --strict;
//             and the lane S1 checks (2026-10-24): ws-content-audit --skill also enforces every numeric ruling the spec
//               card makes on the skill (ws-card-rulings' predicates, class card-ruling), ws-dealer-uniform --skill
//               (120 seeded items: per-place digits and values within 2σ of uniform over the valid set, at most 2 of a
//               minuend / 3 of an answer per page, no seeded case on a fixed position; INCOMPLETE when the valid set is
//               unknown; pins in tests/fixtures/precritic/dealer-uniform.baseline.json), ws-node-lint --rules
//               LESSON-DATA,OPTION-HELP,WRONG-FITS (the lesson page has lesson data; the option help names only offered
//               values; the provider's wrongAnswer fits the item's answer boxes; pins in
//               tests/fixtures/precritic/node-lint-s1.baseline.json), and ws-presets-unit checks that every preset's
//               items obey its preset values
//   --template <id>   the --skill gates for every live skill whose kit cell template is <id> on ANY of its 8 seeded
//             items (a "template skill scan" row names the skills that draw it, and FAILS naming any skill whose
//             generation errored on every item, since whether it draws <id> is unknown), + ws-panes-unit, a
//             "template unit test" row (tests/scripts/ws-<id>-unit.*; SKIPPED-NOT-BUILT when there is none), a
//             "template fixtures" row per tests/fixtures/precritic/<id>*.mjs through ws-node-lint --fixture (a
//             *.fail.mjs fixture must FAIL, a *.pass.mjs one must pass; N/A "no fixtures" when there are none),
//             + ws-grade-render --template --contact-sheet
//   --role <role>     ws-grade-render --roles <role> --skills <the role sample> + ws-print-lint --source kit
//             --roles <role> --skills <the role sample> --baseline. The sample is tests/fixtures/precritic/role-sample.json
//   --teacher         ws-teacher-shell, -library, -preview, -quiz, -wrm (--grade / --lesson passed on), ws-teacher-flows, -plan-match,
//             ws-teacher-tokens (SKIPPED-NOT-BUILT until they land), ws-plain-words --check
//
// BASELINES (pinned; changed only with a STATUS note)
//   design/audit/baselines/print-lint.json    ws-print-lint --json of `--source kit` (independent, size L) per skill:
//                                             print-lint's own --baseline ratchet on (document, lint, rule)
//   design/audit/baselines/screen-slots.json  {skills: {"cat:skill": ["host:kind", ...]}} (ws-screen-slots --baseline)
//   design/audit/baselines/print-lint.S.json, print-lint.M.json   the same at sizes S and M (every live skill,
//                                             full sweep 2026-10-23; a skill missing from a size's
//                                             pin runs unpinned at that size, so any finding there is FAIL)
//   design/audit/baselines/options-verify.json {skills: {"cat:skill": ["option=<json value>" | "static:<msg>", ...]}}
//   design/audit/baselines/node-lint.json     ws-node-lint's own baseline (it reads it itself)
//   design/audit/matrix/baseline.json         ws-coverage-matrix's per-row pin (--matrix-baseline <file> for another);
//                                             the matrix runs as a node gate with --slots 2 (it takes its own slots)
//   --print-lint-baseline <file> / --screen-slots-baseline <file> / --options-verify-baseline <file> point a run at
//   another pin (the S / M pins sit beside the print-lint one: <name>.S.json, <name>.M.json).
//
// OTHER OPTIONS
//   --json <file>        the rows, the commit and the timings as JSON
//   --logs <dir>         every gate's full output (default /tmp/mq-precritic/<timestamp>); named in the table
//   --browser-jobs N     own browser gates at once (default 2; the runner caps the container at two anyway)
//   --node-jobs N        node gates at once (default 3)
//   --timeout <min>      per gate, slot wait included (default 90). A gate runs in its own process group; at the
//                        limit the group and every process it started (Chromium too) get SIGTERM, then SIGKILL after
//                        5 s, so the slot lock is freed, and the row is FAIL "timed out after <min> min".
//   --strict             a run whose only non-green rows are SKIPPED-NOT-BUILT / SKIPPED (no rulings) ends
//                        `ws-precritic: FAIL (incomplete ...)`
//                        (exit 3). Without it such a run ends `ws-precritic: OK: 11 PASS, 1 N/A, 1 SKIPPED-NOT-BUILT of 13 (...)`
//                        (exit 0): the skipped and N/A gates are named in the table AND in the verdict line, never counted
//                        as passed. (--allow-not-built, the old opt-in, is accepted and now the default.)
//   --report-only        print everything, exit 0
//
// PREREQUISITES (checked first when a browser gate is planned; the run stops with the fix when one is missing)
//   Chromium in /opt/pw-browsers (or PUPPETEER_EXECUTABLE_PATH), puppeteer, the proxy CA in /root/.pki/nssdb
//   (STATUS §8), PyMuPDF (`python3 -c "import fitz"`; ws-print-lint and the PDF renders need it).
//
// HONEST ROWS: a gate that exits non-zero for a reason its parsed findings do not account for is FAIL ("exit N ..."),
// whatever its last line says; a gate whose output has no verdict line or summary is FAIL ("unparsed output"); a gate
// that checked fewer documents / host renders / skills than its scope holds is FAIL (or N/A with the reason when the
// scope legitimately holds nothing for it). Unknown flags are a usage error; --role is checked against the roles
// buildSheet composes.
//
// Last line `ws-precritic: OK: ...` or `ws-precritic: FAIL...`; exit 0 OK, 1 a gate failed, 2 prerequisites or usage,
// 3 incomplete under --strict (only SKIPPED-NOT-BUILT rows are not green).
'use strict';
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const TOOL = 'ws-precritic';
const ARGV = process.argv.slice(2);
const has = (f) => ARGV.includes(`--${f}`);
const arg = (f, d) => { const i = ARGV.indexOf(`--${f}`); return i >= 0 && i + 1 < ARGV.length ? ARGV[i + 1] : d; };
const argAll = (f) => ARGV.flatMap((a, i) => (a === `--${f}` && i + 1 < ARGV.length ? String(ARGV[i + 1]).split(',') : [])).map((s) => s.trim()).filter(Boolean);

const RUNNER = '/tmp/mq-browser-run.sh';
const RUNNER_SRC = path.join(ROOT, 'tests', 'scripts', 'mq-browser-run.sh');
const ROLE_SAMPLE = path.join(ROOT, 'tests', 'fixtures', 'precritic', 'role-sample.json');
const PRINT_BASE = path.resolve(ROOT, arg('print-lint-baseline', 'design/audit/baselines/print-lint.json'));
const sizeBase = (sz) => PRINT_BASE.replace(/\.json$/, `.${sz}.json`);
const pinnedIds = (file) => { try { return new Set(JSON.parse(fs.readFileSync(file, 'utf8')).documents.map((d) => d.id)); } catch (e) { return new Set(); } };
// ws-options-verify's per-skill deadline (its default 60 s times out on add_facts, sub_facts and f_to_d in a cloud container,
// 210 s together; lead 2026-10-23): 10 min a skill, overridable with MQ_OV_DEADLINE (ms).
const OV_DEADLINE = String(process.env.MQ_OV_DEADLINE || 600000);
const OV_BASE = path.resolve(ROOT, arg('options-verify-baseline', 'design/audit/baselines/options-verify.json'));
const SLOTS_BASE = path.resolve(ROOT, arg('screen-slots-baseline', 'design/audit/baselines/screen-slots.json'));
const MATRIX_BASE = path.resolve(ROOT, arg('matrix-baseline', 'design/audit/matrix/baseline.json'));
const FIT_BASE = path.resolve(ROOT, arg('chromebook-fit-baseline', 'design/audit/baselines/chromebook-fit.json'));
const SCRIPTS = path.join(ROOT, 'tests', 'scripts');
const rel = (p) => path.relative(ROOT, p) || '.';
const say = (...a) => console.log(...a);

/* ============================================================== the app's skill list, in node (no browser) */
// A child node process loads data.js (and, for --template, the generators and the kit resolver) with the same
// do-nothing DOM ws-node-lint uses, and prints JSON on its last line.
const HELPER = `
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
const ROOT = process.env.PC_ROOT, MODE = process.env.PC_MODE;
const M = (p) => pathToFileURL(join(ROOT, 'js', 'modules', p)).href;
const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === Symbol.iterator ? undefined : stub()), apply: () => stub(), construct: () => stub(), set: () => true });
const store = {};
globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
globalThis.sessionStorage = globalThis.localStorage; globalThis.window = globalThis; globalThis.document = stub();
const out = process.stdout.write.bind(process.stdout);
console.log = console.warn = console.error = console.info = console.debug = () => {};
let gq = null, pg = null;
if (MODE === 'templates') { gq = await import(M('generate-question.js')); }
const data = await import(M('data.js'));
if (MODE === 'templates') { pg = await import(M('print-generate.js')); }
let presets = null; try { presets = await import(M('skill-presets.js')); } catch (e) { presets = null; }
const live = [];
for (const [cat, list] of Object.entries(data.SKILLS)) for (const s of list || []) {
  if (!s || !s.v || s.retired || s.tombstone || s.hidden) continue;
  live.push({ key: cat + ':' + s.v, cat, id: s.v, label: s.l || '', preset: !!(presets && presets.isPreset(cat, s.v)), hosts: presets ? presets.presetsOfHost(cat, s.v).length : 0 });
}
const res = { live };
if (MODE === 'templates') {
  res.templates = {};
  for (const s of live) {
    const seen = {};
    for (let i = 0; i < 8; i++) {
      let t = 'error';
      try { const q = gq.generateQuestionFor({ category: s.cat, skill: s.id, seed: 1000 + i, itemIndex: i }); const r = q && pg.kitCellSpec(Object.assign({ skillId: s.id, categoryId: s.cat }, q)); t = r ? r.template : 'legacy'; } catch (e) { /* counted */ }
      seen[t] = (seen[t] || 0) + 1;
    }
    res.templates[s.key] = seen;
  }
}
out('\\n' + JSON.stringify(res) + '\\n');
process.exit(0);
`;
function appSkills(mode) {
    const r = spawnSync(process.execPath, ['--input-type=module', '-e', HELPER], { cwd: ROOT, env: { ...process.env, PC_ROOT: ROOT, PC_MODE: mode }, encoding: 'utf8', maxBuffer: 256 << 20 });
    const last = String(r.stdout || '').trim().split('\n').pop();
    try { return JSON.parse(last); } catch (e) { throw new Error(`cannot list the app's skills in node: ${(r.stderr || r.stdout || '').slice(0, 600)}`); }
}

/* ============================================================== the role sample (--write-role-sample) */
// The first live skill of each of the 20 largest families (catalogue categories) in design/SKILL_CATALOGUE.md order:
// the "By category" table gives each family's size (ties keep catalogue order), the "Every skill" section's first
// row of the family that is a live skill is its sample.
function deriveRoleSample(liveKeys) {
    const md = fs.readFileSync(path.join(ROOT, 'design', 'SKILL_CATALOGUE.md'), 'utf8');
    const byCat = md.split('## By category')[1].split('## Every skill')[0];
    const fams = [];
    for (const line of byCat.split('\n')) {
        const m = /^\| ([a-z_]+) \| (\d+) \|/.exec(line);
        if (m) fams.push({ cat: m[1], n: +m[2], order: fams.length });
    }
    const top = fams.slice().sort((a, b) => b.n - a.n || a.order - b.order).slice(0, 20).sort((a, b) => a.order - b.order);
    const every = md.split('## Every skill')[1];
    const rows = [];
    for (const f of top) {
        const sec = every.split(`\n### ${f.cat}\n`)[1];
        if (!sec) throw new Error(`catalogue: no "### ${f.cat}" section`);
        const body = sec.split('\n### ')[0];
        const ids = [...body.matchAll(/^\| `([^`]+)` /gm)].map((m) => m[1]);
        const id = ids.find((x) => liveKeys.has(`${f.cat}:${x}`));
        if (!id) throw new Error(`catalogue: no live skill in ${f.cat}`);
        rows.push({ skill: `${f.cat}:${id}`, family: f.cat, familySize: f.n });
    }
    return rows;
}

/* ============================================================== git, prerequisites */
function git(args) { try { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { return ''; } }
function prerequisites() {
    const bad = [];
    // Chromium
    let chrome = process.env.PUPPETEER_EXECUTABLE_PATH || '';
    if (!chrome) {
        try {
            for (const d of fs.readdirSync('/opt/pw-browsers').filter((n) => /^chromium-\d+$/.test(n)).sort().reverse()) {
                // the same two layouts as tests/lib/ws-harness.cjs (Playwright 1.5x writes chrome-linux64)
                const exe = ['chrome-linux64', 'chrome-linux'].map((sub) => path.join('/opt/pw-browsers', d, sub, 'chrome')).find((p) => fs.existsSync(p));
                if (exe) { chrome = exe; break; }
            }
        } catch (e) { /* none */ }
    }
    if (!chrome || !fs.existsSync(chrome)) bad.push('Chromium: no /opt/pw-browsers/chromium-*/chrome-linux{64,}/chrome and no PUPPETEER_EXECUTABLE_PATH. Fix: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npx playwright install chromium (or set PUPPETEER_EXECUTABLE_PATH)');
    try { require.resolve('puppeteer', { paths: [ROOT] }); } catch (e) { bad.push('puppeteer: not resolvable from the repo. Fix: npm install (in the repo root)'); }
    // the proxy CA in Chromium's NSS store (STATUS §8)
    if (fs.existsSync('/root/.ccr/ca-bundle.crt')) {
        const fix = 'Fix (STATUS §8): apt-get install -y libnss3-tools; mkdir -p /tmp/cabits && cd /tmp/cabits && awk \'/BEGIN CERT/{n++} {print > ("c" n ".pem")}\' /root/.ccr/ca-bundle.crt; for f in c*.pem; do s=$(openssl x509 -in $f -noout -subject); case "$s" in *Anthropic*) certutil -d sql:/root/.pki/nssdb -A -t "C,," -n "$(echo "$s" | sed \'s/.*CN = //; s/,.*//\')" -i $f;; esac; done';
        const r = spawnSync('certutil', ['-d', 'sql:/root/.pki/nssdb', '-L'], { encoding: 'utf8' });
        if (r.error) bad.push(`proxy CA: certutil is not installed, so Chromium's store /root/.pki/nssdb cannot be checked (and is likely empty: every CDN fails with ERR_CERT_AUTHORITY_INVALID). ${fix}`);
        else if (!/\sC[A-Za-z]*,[^\n]*$/m.test(String(r.stdout).split('\n').slice(3).join('\n'))) bad.push(`proxy CA: /root/.pki/nssdb trusts no CA (certutil -L lists none with "C,,"), so Chromium rejects the proxy. ${fix}`);
    }
    // PyMuPDF (ws-print-lint's PDF checks, the grade renders)
    const py = spawnSync('python3', ['-c', 'import fitz'], { encoding: 'utf8' });
    if (py.error || py.status !== 0) bad.push('PyMuPDF: python3 -c "import fitz" fails (ws-print-lint and the PDF renders need it; an audit lost 17 rows to this). Fix: pip install pymupdf');
    return { bad, chrome };
}

/* ============================================================== the page roles buildSheet accepts */
// js/modules/print-sheet.js: `SHEET_ROLES = ['independent', 'more-practice', ...Object.keys(ROLE_MODULES)]`, and
// normaliseRequest maps ROLE_ALIASES first (an unknown role silently becomes 'independent', which is why --role is
// checked here). ROLE_MODULES / ROLE_ALIASES are read from js/modules/sheet/roles/index.js (pure ES, SCC-01), not copied.
function sheetRoles() {
    const code = `const m = await import(${JSON.stringify(require('url').pathToFileURL(path.join(ROOT, 'js', 'modules', 'sheet', 'roles', 'index.js')).href)});
process.stdout.write('\\n' + JSON.stringify({ roles: ['independent', 'more-practice', ...Object.keys(m.ROLE_MODULES)], aliases: m.ROLE_ALIASES }) + '\\n');`;
    const r = spawnSync(process.execPath, ['--no-warnings', '--input-type=module', '-e', code], { cwd: ROOT, encoding: 'utf8' });
    try { return JSON.parse(String(r.stdout || '').trim().split('\n').pop()); } catch (e) { throw new Error(`cannot read the page roles from js/modules/sheet/roles/index.js: ${(r.stderr || '').slice(0, 400)}`); }
}

/* ============================================================== gate definitions */
const scriptPath = (name) => ['.cjs', '.mjs', '.js', '.sh'].map((e) => path.join(SCRIPTS, name + e)).find((p) => fs.existsSync(p)) || null;
const srcHas = (file, flag) => { try { const s = fs.readFileSync(file, 'utf8'); return s.includes(`arg('${flag}'`) || s.includes(`'--${flag}'`) || s.includes(`"--${flag}"`) || new RegExp(`--${flag}\\b`).test(s.split('\n').slice(0, 80).join('\n')); } catch (e) { return false; } };

/** A gate: {id, name, scope, kind 'node'|'browser', script, args, needFlags, parse, missing, expect, synthetic} */
function gate(id, name, scope, kind, script, args, extra = {}) {
    const file = scriptPath(script);
    let missing = null;
    if (!file) missing = extra.missingMsg || `${script} is not in this tree`;
    else for (const f of extra.needFlags || []) if (!srcHas(file, f)) { missing = `${script} has no --${f} flag`; break; }
    return { id, name, scope, kind, script, file, args, missing, parse: extra.parse || null, note: extra.note || '', jsonOut: extra.jsonOut || null, keys: extra.keys || null, expect: extra.expect || null, expectFail: !!extra.expectFail, expectUnits: extra.expectUnits || 0, synthetic: null };
}
/** A row this tool works out itself (nothing is spawned): {result, findings, detail}. */
function synthetic(id, name, scope, res) {
    return { id, name, scope, kind: 'self', script: TOOL, file: null, args: [], missing: null, parse: null, note: '', jsonOut: null, keys: null, expect: null, synthetic: Object.assign({ detail: [] }, res) };
}
/** The command that reruns a gate alone: `node`, repo-relative paths, the repo copy of the runner. */
function shownCmd(g) {
    const relArg = (a) => (path.isAbsolute(a) && a.startsWith(ROOT + path.sep) ? rel(a) : a);
    const parts = [...(g.kind === 'browser' ? ['tests/scripts/mq-browser-run.sh'] : []), /\.sh$/.test(g.file || '') ? 'bash' : 'node', rel(g.file || ''), ...g.args.map(relArg)];
    return parts.map((c) => (/[\s"'$`|;&<>()*?]/.test(c) ? `'${c.replace(/'/g, "'\\''")}'` : c)).join(' ');
}

/* ============================================================== output parsers */
// Every parser returns {result, findings, detail, explainsExit}. explainsExit says the findings it parsed account for
// a non-zero exit (the tool exits 1 because of exactly those findings). judge() turns any other non-zero exit, and any
// time-out, into FAIL whatever the parser read: a gate that crashed or was killed never shows PASS (critic r1, D1/D8).
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const lastVerdict = (out, name) => { const m = [...out.matchAll(new RegExp(`^${reEsc(name)}: (OK|FAIL|WOULD FAIL)\\b.*$`, 'gm'))]; return m.length ? m[m.length - 1] : null; };
const NOISE = /MODULE_TYPELESS_PACKAGE_JSON|Reparsing as ES module|eliminate this warning|--trace-warnings|^\$ /;
const tailLines = (out, n = 6) => String(out).split('\n').map((l) => l.trimEnd()).filter((l) => l.trim() && !NOISE.test(l)).slice(-n);
const unparsed = (what, out) => ({ result: 'FAIL', findings: `unparsed output (${what})`, detail: tailLines(out), explainsExit: false });
const listShort = (a, n = 6) => `${a.slice(0, n).join(', ')}${a.length > n ? `, … ${a.length - n} more` : ''}`;
const fmtMin = (m) => String(+(+m).toFixed(3));

function generic(g, out, code) {
    const v = lastVerdict(out, g.script);
    if (!v) return unparsed(`no "${g.script}: OK" or "${g.script}: FAIL" line`, out);
    if (v[1] !== 'OK') return { result: 'FAIL', findings: v[0].slice(0, 160), detail: out.split('\n').filter((l) => /FAIL|NEW|Error|error|✗|^\s+- /.test(l) && !NOISE.test(l)).slice(0, 10), explainsExit: true };
    // a per-skill gate must name every skill in scope somewhere in its output, or it checked something else
    const mention = (g.expect && g.expect.mention) || [];
    const miss = mention.filter((k) => !new RegExp(`(^|\\s)${reEsc(k)}(\\s|$)`, 'm').test(out));
    if (miss.length) return { result: 'FAIL', findings: `${miss.length} of ${mention.length} skill(s) in scope absent from the output (checked nothing for them): ${listShort(miss)}`, detail: tailLines(out), explainsExit: false };
    return { result: 'PASS', findings: '-', detail: [], explainsExit: false };
}

function judge(g, run, p) {
    if (run.timedOut) {
        return { result: 'FAIL', findings: `timed out after ${fmtMin(run.timeoutMin)} min (process group killed)`, detail: tailLines(run.out), explainsExit: true };
    }
    const bad = run.signal || run.code !== 0;
    if (!bad || p.explainsExit) return p;
    const v = lastVerdict(run.out, g.script);
    const ex = `exit ${run.code == null ? run.signal : run.code}`;
    let findings;
    if (run.signal) findings = `${ex} (timed out?/killed)`;
    else if (v && v[1] === 'OK') findings = `${ex} after an OK verdict (crashed after reporting?)`;
    else if (v) findings = `${ex} (${v[0].slice(0, 120)}; not accounted for by the parsed findings)`;
    else findings = `${ex} (no verdict line)`;
    if (p.result === 'FAIL' && p.findings && p.findings !== '-' && !/: OK\b/.test(p.findings)) findings = /^unparsed output/.test(p.findings) ? `${p.findings}; ${findings}` : `${findings}; ${p.findings}`;
    return { result: 'FAIL', findings, detail: p.detail && p.detail.length ? p.detail : tailLines(run.out), explainsExit: false };
}

const PARSE = {
    nodeLint(g, out, code) {
        const v = lastVerdict(out, g.script);
        let j = null; try { j = JSON.parse(fs.readFileSync(g.jsonOut, 'utf8')); } catch (e) { /* no json */ }
        if (!v) return unparsed(`no "${g.script}: OK|FAIL" line`, out);
        if (!j) return unparsed('no --json file written', out);
        const want = (g.expect && g.expect.skills) || 0;
        const subj = (j.subjects || []).length;
        if (subj < want) return { result: 'FAIL', findings: `only ${subj} of ${want} skill(s) linted`, detail: tailLines(out), explainsExit: false };
        const all = j.findings || [];
        const nf = j.newFindings || [];
        const nNew = nf.reduce((a, x) => a + Math.max(0, (+x.count || 0) - (+x.base || 0)), 0);
        const n = all.length;
        const msgOf = (x) => {
            const f = all.find((y) => y.skill === x.skill && y.rule === x.rule);
            if (!f) return '';
            const m = [f.msg || f.message || f.kind, f.detail != null ? (typeof f.detail === 'string' ? f.detail : JSON.stringify(f.detail)) : ''].filter(Boolean).join(' ');
            return m ? `: ${m.slice(0, 140)}` : '';
        };
        if (/\(no baseline/.test(out)) {
            return n ? { result: 'FAIL', findings: `${n} found (no baseline: every finding counts)`, detail: all.slice(0, 8).map((f) => `${f.skill} ${f.rule}${msgOf(f)}`), explainsExit: code === 1 }
                : { result: v[1] === 'OK' ? 'PASS' : 'FAIL', findings: '0 found (no baseline)', detail: [], explainsExit: false };
        }
        const findings = `${n} found, ${Math.max(0, n - nNew)} pinned, ${nNew} new${nf.length ? ` (in ${nf.length} skill/rule pair(s))` : ''}`;
        if (nNew) return { result: 'FAIL', findings, detail: nf.slice(0, 8).map((x) => `NEW ${x.skill} ${x.rule} ${x.base}->${x.count}${msgOf(x)}`), explainsExit: code === 1 };
        if (v[1] !== 'OK') return { result: 'FAIL', findings: `${findings}; ${v[0]}`, detail: tailLines(out), explainsExit: false };
        return { result: n ? 'PASS (baseline)' : 'PASS', findings, detail: [], explainsExit: false };
    },
    providers(g, out, code) {
        const r = generic(g, out, code);
        if (r.result !== 'PASS') return r;
        const m = /--skill: (\d+) of (\d+) skill\(s\) checked(?:; not covered \(no item maker in this test\): (.*))?/.exec(out);
        if (!m) return unparsed('no "--skill: N of M skill(s) checked" line', out);
        const want = (g.expect && g.expect.skills) || 0;
        if (+m[2] !== want) return { result: 'FAIL', findings: `the test was asked about ${m[2]} skill(s), not the ${want} in scope`, detail: tailLines(out), explainsExit: false };
        if (+m[1] === 0) return { result: 'N/A', findings: `no provider test for ${m[3] || 'the skills in scope'}`, detail: [], explainsExit: false };
        return { result: 'PASS', findings: `${m[1]} of ${m[2]} skills checked${m[3] ? `; not covered: ${m[3]}` : ''}`, detail: [], explainsExit: false };
    },
    contentAudit(g, out, code) {
        const note = g.note ? `; ${g.note}` : '';
        if (/^ws-content-audit: FAIL - no skill matched/m.test(out) && code === 1) return { result: 'N/A', findings: `outside the audited families (+ - × ÷, K-2, place value, time and money, function tables)${note}`, detail: [], explainsExit: true };
        const r = generic(g, out, code);
        if (r.result !== 'PASS') { if (note && r.result === 'FAIL') r.findings += note; return r; }
        const m = /^ws-content-audit: OK \((\d+) /m.exec(out);
        if (!m) return unparsed('no "ws-content-audit: OK (N ... skills" summary', out);
        const want = (g.expect && g.expect.skills) || 0;
        r.findings = `${m[1]} skill(s) audited${+m[1] < want ? ` (${want - +m[1]} of the ${want} in scope are outside the audited families)` : ''}${note}`;
        return r;
    },
    optionsVerify(g, out, code) {
        const v = lastVerdict(out, g.script);
        const sum = /skills: (\d+) with options \((\d+) with none\)[^\n]*skills passing (\d+)\/(\d+)/.exec(out);
        let j = null; try { j = JSON.parse(fs.readFileSync(g.jsonOut, 'utf8')); } catch (e) { /* crashed before writing */ }
        if (!v) return unparsed(`no "${g.script}: OK|FAIL" line`, out);
        if (!sum) return unparsed('no "skills: N with options ... skills passing" summary', out);
        if (!j) return unparsed('no --json file written', out);
        const pe = /^page errors during the run: (\d+)(?: \(first: (.*)\))?$/m.exec(out);
        const keyOf = (x) => (x && x.categoryId && x.skillId ? `${x.categoryId}:${x.skillId}` : x && x.key);
        const results = j.results || [];
        const badKey = results.find((x) => !/^[a-z0-9_]+:[a-z0-9_]+$/i.test(String(keyOf(x) || '')));
        if (badKey) return unparsed(`result key ${JSON.stringify(keyOf(badKey))} is not category:skill`, out);
        const scope = g.keys || [];
        const inScope = results.filter((x) => scope.includes(keyOf(x)));
        const others = results.filter((x) => !scope.includes(keyOf(x)));
        const noOpt = new Set(j.noOptions || []);
        const absent = scope.filter((k) => !inScope.some((x) => keyOf(x) === k) && !noOpt.has(k));
        if (absent.length) return { result: 'FAIL', findings: `${absent.length} of ${scope.length} skill(s) in scope absent from the output: ${listShort(absent)}`, detail: tailLines(out), explainsExit: false };
        const fails = (list) => {
            const f = [];
            for (const x of list) {
                for (const val of x.results || []) if ((val.fails || []).length) f.push({ key: keyOf(x), id: `${val.option}=${JSON.stringify(val.value)}`, msg: val.fails[0] });
                for (const m of x.statics || []) f.push({ key: keyOf(x), id: `static:${m}`, msg: m });
            }
            return f;
        };
        const found = fails(inScope);
        const otherFails = fails(others).length;
        // the tool exits 1 when any value (or static check) fails, in scope or not
        // only exit 1 with the tool's own FAIL verdict is explained by failing values; a crash (2, 127, a signal ...) is not
        const ov = lastVerdict(out, 'ws-options-verify');
        const explainsExit = code === 0 || (code === 1 && !!ov && ov[1] === 'FAIL' && found.length + otherFails > 0);
        const errNote = pe ? `page errors during the run: ${pe[1]}` : '';
        if (!inScope.length) {
            if (pe) return { result: 'FAIL', findings: `no options offered; ${errNote}`, detail: [pe[0]], explainsExit };
            return { result: 'N/A', findings: 'no options offered', detail: [], explainsExit };
        }
        let pin = null; try { pin = JSON.parse(fs.readFileSync(OV_BASE, 'utf8')).skills || {}; } catch (e) { pin = null; }
        const pinnedSkill = (k) => !!(pin && Object.prototype.hasOwnProperty.call(pin, k));
        const unpinnedVals = found.filter((f) => !pinnedSkill(f.key));
        const freshPinned = found.filter((f) => pinnedSkill(f.key) && !pin[f.key].includes(f.id));
        const nPinned = found.length - unpinnedVals.length - freshPinned.length;
        const nVals = inScope.reduce((n, x) => n + (x.results || []).length, 0);
        const parts = [`${nVals} value(s) checked; ${found.length} failing, ${nPinned} pinned, ${freshPinned.length} new`];
        if (unpinnedVals.length) {
            const sk = [...new Set(unpinnedVals.map((f) => f.key))];
            const cats = [...new Set(sk.map((k) => k.split(':')[0]))];
            parts.push(`${unpinnedVals.length} failing value(s) on skill(s) not in the pin (pre-existing or new; pin with a STATUS note: node tests/scripts/ws-options-verify.cjs --skill ${[...new Set(sk.map((k) => k.split(':')[1]))].join(',')}${cats.length === 1 ? ` --category ${cats[0]}` : ''} --json <out>, then merge its failing values into ${rel(OV_BASE)}): ${listShort(sk)}`);
        }
        if (!pin) parts.push(`no pin: ${rel(OV_BASE)} missing`);
        if (errNote) parts.push(errNote);
        if (otherFails) parts.push(`${otherFails} failing value(s) on other categories' skills with the same id (not in scope, not judged)`);
        const red = freshPinned.length || unpinnedVals.length || pe;
        const detail = [...freshPinned, ...unpinnedVals].slice(0, 10).map((f) => `${pinnedSkill(f.key) ? 'NEW' : 'UNPINNED'} ${f.key} ${f.id}: ${String(f.msg).slice(0, 140)}`);
        if (pe) detail.unshift(pe[0].slice(0, 200));
        return { result: red ? 'FAIL' : found.length ? 'PASS (baseline)' : 'PASS', findings: parts.join('; '), detail, explainsExit };
    },
    printLint(g, out, code) {
        const v = lastVerdict(out, g.script);
        const sum = /(\d+) document\(s\), source \w+; (\d+) finding\(s\) in (\d+) document\(s\)/.exec(out);
        // a ratchet failure prints its rises and no summary: the documents are then counted from the progress lines
        const rose = /ratchet: (\d+) count\(s\) rose/.exec(out);
        if (!v) return unparsed(`no "${g.script}: OK|FAIL" line`, out);
        if (!sum && !rose) return unparsed('no "N document(s), source kit; F finding(s) in D document(s)" summary', out);
        const progress = [...out.matchAll(/^ {2}(\S+): \S+ pages, (\d+) finding\(s\)$/gm)];
        const linted = new Set(progress.map((m) => m[1]));
        const docs = sum ? +sum[1] : linted.size;
        const f = sum ? +sum[2] : progress.reduce((n, m) => n + +m[2], 0), fd = sum ? +sum[3] : progress.filter((m) => +m[2] > 0).length;
        const want = (g.expect && g.expect.ids) || [];
        const na = [...out.matchAll(/^ {2}(\S+): n\/a \((.*)\)$/gm)].map((m) => ({ id: m[1], why: m[2] }));
        const naIds = new Set(na.map((x) => x.id));
        const missing = want.filter((id) => !linted.has(id) && !naIds.has(id));
        const naNote = na.length ? `; ${na.length} page(s) n/a (the role does not take the skill): ${listShort(na.map((x) => x.id), 4)}` : '';
        if (want.length && na.length >= want.length && docs === 0) return { result: 'N/A', findings: `every page in scope is n/a: ${na[0].why}`, detail: na.slice(0, 6).map((x) => `${x.id}: n/a (${x.why})`), explainsExit: code === 0 };
        if (docs === 0) return { result: 'FAIL', findings: `checked nothing: 0 documents linted of ${want.length} in scope`, detail: tailLines(out), explainsExit: false };
        if (docs < want.length - na.length || missing.length) return { result: 'FAIL', findings: `only ${docs} of ${want.length - na.length} document(s) in scope linted${missing.length ? `; missing: ${listShort(missing)}` : ''}${naNote}`, detail: tailLines(out), explainsExit: false };
        const pinned = g.args.includes('--baseline');
        const ratchetOk = /OK \(ratchet against [^:]+: nothing rose/.test(out);
        let r;
        if (rose) r = { result: 'FAIL', findings: `${f} found in ${fd} of ${docs} doc(s); ${rose[1]} (document, lint, rule) count(s) above the pin`, detail: out.split('\n').filter((l) => /^\s+- /.test(l)).slice(0, 10), explainsExit: code === 1 };
        else if (pinned && ratchetOk && v[1] === 'OK') r = { result: f ? 'PASS (baseline)' : 'PASS', findings: f ? `${f} found in ${fd} of ${docs} doc(s), all pinned, 0 new` : `0 found (${docs} doc(s))`, detail: [], explainsExit: false };
        else if (!pinned && fd === 0 && v[1] === 'OK') r = { result: 'PASS', findings: `0 found (${docs} doc(s), unpinned)`, detail: [], explainsExit: false };
        else if (!pinned && fd > 0) r = { result: 'FAIL', findings: `${f} found in ${fd} of ${docs} doc(s) (no pinned baseline: an unpinned document must be clean)`, detail: out.split('\n').filter((l) => /^ {2}\S+: \S+ pages, [1-9]\d* finding/.test(l)).slice(0, 10), explainsExit: code === 1 };
        else r = { result: 'FAIL', findings: `${v[0].slice(0, 140)} (not a ratchet result this tool can read)`, detail: tailLines(out), explainsExit: false };
        r.findings += naNote;
        if (g.note && r.result === 'FAIL') {
            r.findings += `; ${g.note}`;
            const sz = g.args.indexOf('--size'), ro = g.args.indexOf('--roles');
            r.detail = [`pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit ${sz >= 0 ? g.args.slice(sz, sz + 2).join(' ') + ' ' : ''}${ro >= 0 ? g.args.slice(ro, ro + 2).join(' ') + ' ' : ''}--skills <skills> --report-only --json <out>, then merge its documents into the pin`, ...r.detail];
        }
        return r;
    },
    screenSlots(g, out, code) {
        const v = lastVerdict(out, g.script);
        // "[<mode> sweep (...), ][shard i/n, ]N skills, R host renders, D doubled answer area(s), P paper verb(s) on screen[, C low-contrast host(s)]"
        const sm = /(\d+) skills, (\d+) host renders, (\d+) doubled answer area\(s\), (\d+) paper verb\(s\) on screen(?:, (\d+) low-contrast host\(s\))?$/m.exec(out);
        if (!v) return unparsed(`no "${g.script}: OK|FAIL" line`, out);
        if (!sm) return unparsed('no "N skills, R host renders, ..." summary', out);
        const nSk = +sm[1], renders = +sm[2], dbl = +sm[3], pv = +sm[4], lc = +(sm[5] || 0);
        const want = (g.expect && g.expect.skills) || 0, hosts = (g.expect && g.expect.hosts) || 4;
        const errs = out.split('\n').filter((l) => /^\S+:\S+\s+ERR /.test(l));
        if (nSk < want) return { result: 'FAIL', findings: `only ${nSk} of ${want} skill(s) in scope found by the script`, detail: tailLines(out), explainsExit: false };
        if (renders < want * hosts) return { result: 'FAIL', findings: `only ${renders} of ${want * hosts} host render(s) (${want} skill(s) × ${hosts} hosts)${errs.length ? `; ${errs.length} render error(s)` : ''}`, detail: errs.length ? errs.slice(0, 10) : tailLines(out), explainsExit: false };
        const nat = /baseline [^:]+: (\d+) pinned finding\(s\) seen, (\d+) NEW/.exec(out);
        if (nat) {
            const pinned = +nat[1], nw = +nat[2];
            if (pinned + nw !== dbl + pv + lc) return unparsed(`baseline line counts ${pinned + nw} finding(s) for a summary of ${dbl + pv + lc}`, out);
            const newLines = out.split('\n').filter((l) => /^NEW /.test(l));
            if (newLines.length !== nw) return unparsed(`${newLines.length} "NEW" line(s) for ${nw} NEW`, out);
            const fixed = /pinned but not seen \(fixed or intermittent: ([^)]*)\)/.exec(out);
            // with --baseline the script exits 1 only on a NEW finding (or a sweep render error)
            return { result: nw ? 'FAIL' : v[1] !== 'OK' ? 'FAIL' : pinned ? 'PASS (baseline)' : 'PASS', findings: `${pinned + nw} found, ${pinned} pinned, ${nw} new (${renders} host renders, --baseline ${rel(SLOTS_BASE)})${fixed ? `; pinned but not seen (tighten the pin): ${fixed[1].slice(0, 160)}` : ''}`, detail: newLines.slice(0, 10), explainsExit: nw > 0 };
        }
        // the script has no --baseline: compare its doubled / paper-verb lines with the pin here
        const found = [];
        for (const l of out.split('\n')) {
            // the pin's entries are "host:kind" (kinds doubled, paper, contrast), as ws-screen-slots --baseline reads them
            const m = /^(\S+:\S+)\s+(\S+)\s+(host field \+|paper verb on screen|\d+ low-contrast text)/.exec(l);
            if (m) found.push({ key: m[1], id: `${m[2]}:${m[3].startsWith('host') ? 'doubled' : m[3].startsWith('paper') ? 'paper' : 'contrast'}`, line: l.replace(/\s+/g, ' ') });
        }
        if (found.length !== dbl + pv + lc) return unparsed(`${found.length} finding line(s) for a summary of ${dbl + pv + lc}`, out);
        const explainsExit = code === 0 || found.length > 0; // the script exits 1 on any doubled area or paper verb
        let pin = null;
        try { pin = JSON.parse(fs.readFileSync(SLOTS_BASE, 'utf8')).skills || {}; } catch (e) { pin = null; }
        if (!pin) return { result: found.length ? 'FAIL' : 'PASS', findings: `${found.length} found; no pinned baseline (${rel(SLOTS_BASE)} missing)`, detail: found.slice(0, 10).map((x) => x.line), explainsExit };
        const fresh = found.filter((x) => !(pin[x.key] || []).includes(x.id));
        return { result: fresh.length ? 'FAIL' : found.length ? 'PASS (baseline)' : 'PASS', findings: `${found.length} found, ${found.length - fresh.length} pinned, ${fresh.length} new (${renders} host renders; compared here: the script has no --baseline)`, detail: fresh.slice(0, 10).map((x) => `NEW ${x.line}`), explainsExit };
    },
    /** ws-coverage-matrix --out: every row of the skills in scope, red = a count above design/audit/matrix/baseline.json. */
    coverageMatrix(g, out, code) {
        const v = lastVerdict(out, g.script);
        let j = null; try { j = JSON.parse(fs.readFileSync(g.jsonOut, 'utf8')); } catch (e) { /* crashed before writing */ }
        if (!v) return unparsed(`no "${g.script}: OK|FAIL" line`, out);
        if (!j || !Array.isArray(j.rows)) return unparsed('no --out file written', out);
        const keys = g.keys || [];
        const rows = j.rows.filter((r) => (r.skills || []).some((k) => keys.includes(k)) || keys.some((k) => String(r.id).startsWith(`${k}|`)));
        const st = (s) => rows.filter((r) => r.status === s);
        const ran = rows.filter((r) => ['OK', 'RED', 'ERROR', 'CACHED'].includes(r.status));
        const none = keys.filter((k) => !ran.some((r) => String(r.id).startsWith(`${k}|`)));
        if (none.length) return { result: 'FAIL', findings: `checked nothing for ${none.length} of ${keys.length} skill(s): ${listShort(none)} (${rows.length} row(s) listed, ${ran.length} run)`, detail: tailLines(out), explainsExit: false };
        let base = null; try { base = JSON.parse(fs.readFileSync(MATRIX_BASE, 'utf8')).rows || {}; } catch (e) { base = null; }
        const inPin = (r) => !!(base && Object.prototype.hasOwnProperty.call(base, r.id));
        const red = st('RED'), err = st('ERROR');
        const redUnpinned = red.filter((r) => !inPin(r));
        const okOnPin = st('OK').filter((r) => inPin(r) && Object.values(base[r.id] || {}).some((c) => Object.values(c || {}).some((n) => n > 0)));
        const parts = [`${ran.length} of ${rows.length} row(s) run × S/M/L: OK ${st('OK').length}${st('CACHED').length ? `, CACHED ${st('CACHED').length}` : ''}, RED ${red.length}${redUnpinned.length ? ` (${redUnpinned.length} not in the pin)` : ''}, ERROR ${err.length}; PENDING ${st('PENDING').length}, N/A ${st('N/A').length}`];
        if (!base) parts.push(`no pin: ${rel(MATRIX_BASE)} missing, so any finding is red`);
        if (redUnpinned.length) parts.push(`rows not in the pin hold pre-existing or new findings; pin with a STATUS note: node tests/scripts/ws-coverage-matrix.cjs --skills ${keys.join(',')} --baseline ${rel(MATRIX_BASE)} --write-baseline`);
        const detail = [];
        for (const r of [...err, ...red].slice(0, 6)) {
            detail.push(`${r.status} ${r.id}${r.status === 'RED' && !inPin(r) ? ' (not in the pin)' : ''}`);
            for (const x of (r.rises || []).slice(0, 2)) detail.push(`  + ${x}`);
        }
        // meta: the sibling comparison (rule 0b) may turn a red-only FAIL into engine red (finishRows)
        if (red.length || err.length) return { result: 'FAIL', findings: parts.join('; '), detail, explainsExit: code === 1, meta: { red: red.length, err: err.length } };
        if (v[1] !== 'OK') return { result: 'FAIL', findings: `${parts[0]}; ${v[0]}`, detail: tailLines(out), explainsExit: false };
        return { result: okOnPin.length ? 'PASS (baseline)' : 'PASS', findings: parts.join('; '), detail: [], explainsExit: false };
    },
    /** ws-node-lint --fixture: a *.fail.mjs fixture must FAIL (the check sees the defect), a *.pass.mjs one must pass. */
    fixture(g, out, code) {
        const v = lastVerdict(out, g.script);
        if (!v) return unparsed(`no "${g.script}: OK|FAIL" line`, out);
        if (!g.expectFail) return generic(g, out, code);
        if (code === 1 && v[1] === 'FAIL') return { result: 'PASS', findings: `fails as it must (${v[0]})`, detail: [], explainsExit: true };
        if (code === 0 && v[1] === 'OK') return { result: 'FAIL', findings: 'the fail fixture PASSED: the check cannot see the defect it was built for', detail: tailLines(out), explainsExit: true };
        return { result: 'FAIL', findings: v[0], detail: tailLines(out), explainsExit: false };
    },
    /** ws-sibling-compare --run <matrix run> --json: rule 0b. */
    siblingCompare(g, out, code) {
        const v = lastVerdict(out, g.script);
        let j = null; try { j = JSON.parse(fs.readFileSync(g.jsonOut, 'utf8')); } catch (e) { /* crashed */ }
        if (!v) return unparsed(`no "${g.script}: OK|FAIL" line`, out);
        if (!j) return unparsed('no --json file written', out);
        const missing = (g.keys || []).filter((k) => !(j.skills || []).includes(k));
        if (missing.length) return { result: 'FAIL', findings: `${missing.length} skill(s) in scope absent from the comparison: ${listShort(missing)}`, detail: tailLines(out), explainsExit: false };
        const sib = Object.entries(j.siblings || {}).map(([k, s]) => `${k.split(':')[1]}: ${s.length}`).join(', ');
        const byS = Object.entries(j.byStatus || {}).map(([k, n]) => `${k} ${n}`).join(', ') || 'none';
        const meta = { red: j.red, above: j.above.length, noSibling: j.noSibling.length, errors: j.errors.length, engine: j.engine.length };
        if (v[1] !== 'OK') {
            const detail = out.split('\n').filter((l) => /^(ABOVE|NO-SIBLING|ERROR) /.test(l)).slice(0, 10);
            return { result: 'FAIL', findings: `worse than siblings: ${j.above.length} count(s) above the approved siblings in ${new Set(j.above.map((x) => x.id)).size} row(s), ${j.noSibling.length} with no sibling measured, ${j.errors.length} ERROR row(s); ${j.engine.length} at or below (engine) in ${j.rowsCompared} printed row(s) with findings (${byS}; siblings per skill: ${sib})`, detail, explainsExit: code === 1, meta };
        }
        if (!j.rowsCompared) return { result: 'PASS', findings: `no printed matrix row with findings to compare (siblings per skill: ${sib})`, detail: [], explainsExit: false, meta };
        return { result: 'PASS (baseline)', findings: `${j.rowsCompared} printed row(s) with findings (${byS}): all ${j.engine.length} count(s) at or below the paired approved siblings (engine debt, non-blocking; siblings per skill: ${sib})`, detail: [], explainsExit: false, meta };
    },
    /** ws-slot-clip --json: per matrix row and size. */
    slotClip(g, out, code) {
        const v = lastVerdict(out, g.script);
        let j = null; try { j = JSON.parse(fs.readFileSync(g.jsonOut, 'utf8')); } catch (e) { /* crashed */ }
        if (!v) return unparsed(`no "${g.script}: OK|FAIL" line`, out);
        if (!j) return unparsed('no --json file written', out);
        const rows = j.rows || [];
        const checked = rows.filter((r) => !['PENDING', 'N/A'].includes(r.status));
        const none = (g.keys || []).filter((k) => !checked.some((r) => String(r.id).startsWith(`${k}|`)));
        if (none.length) return { result: 'FAIL', findings: `checked nothing for ${none.length} of ${(g.keys || []).length} skill(s): ${listShort(none)}`, detail: tailLines(out), explainsExit: false };
        const bad = checked.filter((r) => r.status !== 'ok');
        const ids = new Set(checked.map((r) => r.id));
        const nEx = new Set(checked.filter((r) => /\|extra\//.test(r.id)).map((r) => r.id)).size;
        const naW = checked.filter((r) => r.slotW === 'N/A').length, naH = checked.filter((r) => r.headsProbe === 'N/A').length;
        const base = `${ids.size - nEx} matrix row(s) × ${(j.sizes || []).join('/')} + ${nEx} extra document(s) (test, more-practice, supports on): ${checked.length} document(s), SLOT ${checked.reduce((a, r) => a + (r.slot || 0), 0)} / CLIP ${checked.reduce((a, r) => a + (r.clip || 0), 0)} finding(s), ${checked.reduce((a, r) => a + (r.segs || 0), 0)} box segment(s) and ${checked.reduce((a, r) => a + (r.heads || 0), 0)} head(s) probed (SLOT-W N/A on ${naW}, HEADS N/A on ${naH} document(s): no digit strip / no heads)`;
        if (v[1] !== 'OK') return { result: 'FAIL', findings: `${bad.length} row×size(s) failing; ${base}`, detail: bad.slice(0, 8).map((r) => `${r.id} ${r.size}: ${(r.findings || [r.status]).join('; ').slice(0, 180)}`), explainsExit: code === 1 };
        return { result: checked.some((r) => (r.slot || 0) + (r.clip || 0) > 0) ? 'PASS (baseline)' : 'PASS', findings: `${base}; every SLOT / CLIP count at or below the approved siblings`, detail: [], explainsExit: false };
    },
    /** ws-dealer-uniform (lane S1): INCOMPLETE (exit 3: a skill's valid set unknown) is never PASS; pinned findings are PASS (baseline). */
    dealerUniform(g, out, code) {
        const inc = /^ws-dealer-uniform: INCOMPLETE - not fully checked: (.*?) \((.*)\)\s*$/m.exec(out);
        if (inc && code === 3) return { result: 'INCOMPLETE (valid set unknown)', findings: `not fully checked: ${listShort(inc[1].split(', '), 4)}; ${inc[2]}`, detail: out.split('\n').filter((l) => /^ {6}note /.test(l)).slice(0, 6).map((l) => l.trim()), explainsExit: true };
        // S1 critic r1 D1: skills that deal no operands (fractions, clocks, shapes) have nothing to deal evenly: N/A, exit 4
        const na = /^ws-dealer-uniform: N\/A - no operand-dealt items: (.*?) \((.*)\)\s*$/m.exec(out);
        if (na && code === 4) return { result: 'N/A', findings: `no operand-dealt items (nothing to deal evenly): ${listShort(na[1].split(', '), 4)}`, detail: [], explainsExit: true };
        const r = generic(g, out, code);
        const m = /^ws-dealer-uniform: (?:OK|FAIL - [^(]*)\((.*)\)\s*$/m.exec(out);
        const missing = (g.keys || []).filter((k) => !new RegExp(`^ {2}\\S+ +${reEsc(k)} `, 'm').test(out));
        if (r.result === 'PASS' && missing.length) return { result: 'FAIL', findings: `${missing.length} skill(s) in scope not in the output: ${listShort(missing)}`, detail: tailLines(out), explainsExit: false };
        const pinned = (out.match(/^ {6}pinned /gm) || []).length;
        if (r.result === 'PASS') { r.findings = `${m ? m[1] : '-'}${pinned ? `; ${pinned} pinned finding(s)` : ''}`; if (pinned) r.result = 'PASS (baseline)'; }
        else if (r.result === 'FAIL') r.detail = out.split('\n').filter((l) => /^ {6}FAIL /.test(l)).slice(0, 10).map((l) => l.trim());
        return r;
    },
    /** ws-grade-render without --golden prints no OK / FAIL line, only `ws-grade-render: done, N units, P pages`: it is the
     *  render the critic grades (print-lint judges the pages). PASS when it rendered every unit with no ERROR line. */
    gradeRender(g, out, code) {
        if (/^ws-grade-render: (OK|FAIL)\b/m.test(out)) return generic(g, out, code);
        const m = /^ws-grade-render: done, (\d+) units, (\d+) pages/m.exec(out);
        if (!m) return unparsed('no "ws-grade-render: done|OK|FAIL" line', out);
        const errs = out.split('\n').filter((l) => /^ {2}ERROR /.test(l)).map((l) => l.trim());
        const want = g.expectUnits || 0;
        if (code !== 0 || errs.length) return { result: 'FAIL', findings: `${errs.length} render error(s)${code ? `, exit ${code}` : ''}`, detail: errs.slice(0, 10), explainsExit: code !== 0 };
        if (want && +m[1] < want) return { result: 'FAIL', findings: `rendered ${m[1]} of ${want} unit(s)`, detail: tailLines(out), explainsExit: false };
        return { result: 'PASS', findings: `rendered ${m[1]} unit(s), ${m[2]} page(s) for the critic (print-lint judges them)`, detail: [], explainsExit: false };
    },
    /** ws-card-rulings: NO-RULINGS (exit 4) is SKIPPED, never PASS. */
    cardRulings(g, out, code) {
        if (/^ws-card-rulings: NO-RULINGS\b/m.test(out) && code === 4) {
            const m = /^ws-card-rulings: no card under (\S+) has a rulings block for (.*)$/m.exec(out);
            return { result: 'SKIPPED (no rulings)', findings: `no machine-readable rulings block (<!-- rulings {json} -->, tests/scripts/ws-card-rulings.mjs) in the spec card${m ? ` for ${listShort(m[2].split(', '), 4)}` : ''}: not checked`, detail: [], explainsExit: true };
        }
        // critic r6 D3: a scope where only some skills have rulings is INCOMPLETE (exit 2), never PASS
        const inc = /^ws-card-rulings: INCOMPLETE - not checked: (.*?) \((.*)\)\s*$/m.exec(out);
        if (inc && code === 2) return { result: 'INCOMPLETE (partial rulings)', findings: `not checked (no rulings block entry): ${listShort(inc[1].split(', '), 4)}; ${inc[2]}`, detail: [], explainsExit: true };
        const r = generic(g, out, code);
        const m = /^ws-card-rulings: (?:OK|FAIL - [^(]*)\((.*)\)\s*$/m.exec(out);
        if (r.result === 'PASS') r.findings = m ? m[1] : r.findings;
        else if (r.result === 'FAIL') r.detail = out.split('\n').filter((l) => /^ {2}FAIL /.test(l)).slice(0, 10).map((l) => l.trim());
        return r;
    },
};

/* ============================================================== plan */
function usage(msg) { if (msg) say(`${TOOL}: ${msg}`); say(`usage: node tests/scripts/${TOOL}.cjs --skill cat:skill [--skill ...] | --template <id> | --role <role> | --teacher [--grade G] [--lesson L]  [--json out] [--logs dir] [--timeout min] [--node-jobs N] [--browser-jobs N] [--strict] [--report-only] [--dry-run]  (--help for all)`); say(`${TOOL}: FAIL (usage)`); process.exit(2); }

function buildPlan(ctx) {
    const rows = [];
    const add = (g) => { if (!rows.some((r) => r.id === g.id)) rows.push(g); };
    const skills = ctx.skills; // [{key, cat, id, preset, hosts}]
    if (ctx.template && ctx.templateScan) add(ctx.templateScan);
    if (skills.length) {
        const keys = skills.map((s) => s.key);
        const ids = [...new Set(skills.map((s) => s.id))];
        const cats = [...new Set(skills.map((s) => s.cat))];
        const scope = keys.length <= 3 ? keys.join(', ') : `${keys.length} skills${ctx.template ? ` (template ${ctx.template})` : ''}`;
        // ws-content-audit and ws-options-verify take bare ids (+ one --category): exact when the scope is one category,
        // otherwise they also check every other live skill that shares an id, which the row names.
        const catArg = cats.length === 1 ? ['--category', cats[0]] : [];
        const extras = cats.length === 1 ? [] : (ctx.live || []).filter((s) => ids.includes(s.id) && !keys.includes(s.key)).map((s) => s.key);
        const extraNote = extras.length ? `also audits ${extras.length} skill(s) of other categories that share an id (bare ids; --category takes one): ${listShort(extras, 4)}` : '';
        const nodeLintJson = path.join(ctx.logs, 'node-lint.json');
        add(gate('node-lint', 'ws-node-lint', scope, 'node', 'ws-node-lint', ['--skill', keys.join(','), '--json', nodeLintJson], { parse: PARSE.nodeLint, jsonOut: nodeLintJson, expect: { skills: keys.length } }));
        add(gate('providers', 'ws-providers-unit --skill', scope, 'node', 'ws-providers-unit', ['--skill', keys.join(',')], { parse: PARSE.providers, needFlags: ['skill'], expect: { skills: keys.length } }));
        add(gate('content-audit', 'ws-content-audit --skill', scope, 'browser', 'ws-content-audit', ['--skill', ids.join(','), ...catArg], { parse: PARSE.contentAudit, note: extraNote, expect: { skills: keys.length } }));
        const ovJson = path.join(ctx.logs, 'options-verify.json');
        add(gate('options-verify', 'ws-options-verify --skill', scope, 'browser', 'ws-options-verify', ['--skill', ids.join(','), ...catArg, '--deadline', OV_DEADLINE, '--json', ovJson], { parse: PARSE.optionsVerify, jsonOut: ovJson, keys }));
        const presetTouch = skills.filter((s) => s.preset || s.hosts);
        if (presetTouch.length) add(gate('presets', 'ws-presets-unit', `${presetTouch.length} preset / host skill(s)`, 'browser', 'ws-presets-unit', []));
        // critic 2026-10-30 (WRM Y4 lessons F1, GATE-DRIFT): a skill, option or preset change can turn a site-lesson claim false;
        // every year's lessonfit runs on any skill scope (node, about a minute)
        add(gate('lessonfit', 'ws-lessonfit (WRM site lessons, every year)', 'site lessons Y1, Y4, Y6', 'node', 'ws-lessonfit', []));
        // The matrix takes its own browser slots (--slots: each print-lint process through /tmp/mq-browser-run.sh), so it
        // runs as a NODE gate, as ws-deploy-gates.sh runs it: wrapping it in the runner would hold a slot while its own
        // children wait for one. Its pin is the per-row design/audit/matrix/baseline.json.
        const cmJson = path.join(ctx.logs, 'coverage-matrix.json');
        const cm = ['--skills', keys.join(','), '--slots', '2', '--out', cmJson];
        if (fs.existsSync(MATRIX_BASE)) cm.splice(2, 0, '--baseline', rel(MATRIX_BASE));
        const matrix = gate('coverage-matrix', 'ws-coverage-matrix --skills', `${scope} × kinds × S/M/L`, 'node', 'ws-coverage-matrix', cm, { needFlags: ['skills', 'slots'], parse: PARSE.coverageMatrix, jsonOut: cmJson, keys });
        add(matrix);
        const dup = matrix.missing ? 'independent; until the coverage matrix' : "independent defaults; duplicates the matrix's single/defaults row";
        const pl = ['--source', 'kit', '--skills', keys.join(',')];
        if (fs.existsSync(PRINT_BASE)) pl.push('--baseline', rel(PRINT_BASE));
        add(gate('print-lint-kit', `ws-print-lint --source kit --size L (${dup})`, scope, 'browser', 'ws-print-lint', pl, { parse: PARSE.printLint, expect: { ids: keys } }));
        // S and M (LESSONS_LEARNED L1: "Size S ignored"): their own pins, print-lint.<S|M>.json. A skill missing from a
        // size's pin runs without --baseline, so any finding there is red (print-lint's rule: an unpinned document
        // must be clean) and the row says how to pin it.
        for (const sz of ['S', 'M']) {
            const file = sizeBase(sz);
            const pinned = pinnedIds(file);
            const all = keys.every((k) => pinned.has(k));
            const a = ['--source', 'kit', '--size', sz, '--skills', keys.join(',')];
            if (all) a.push('--baseline', rel(file));
            const unp = keys.filter((k) => !pinned.has(k));
            add(gate(`print-lint-kit-${sz}`, `ws-print-lint --source kit --size ${sz} (${dup})`, scope, 'browser', 'ws-print-lint', a, { parse: PARSE.printLint, expect: { ids: keys }, note: all ? '' : `not pinned at ${sz}: ${listShort(unp)} (${rel(file)})` }));
        }
        // The lane skill's OWN lesson page at L and S (S1 critic r1 D2: H13 on the Warm-up and WRAP-OP sat on the pilot's own
        // lesson pages, N2 / N6 / N7, and the role sample never held them). Against the lesson pins (ids cat:skill#lesson); a
        // lesson page the pin does not hold must be clean. With --role lesson the keys join that role's sample instead.
        if (ctx.role !== 'lesson') {
            for (const sz of ['L', 'S']) {
                const file = sz === 'L' ? PRINT_BASE : sizeBase('S');
                const ids = keys.map((k) => `${k}#lesson`);
                const pinnedL = pinnedIds(file);
                const a = ['--source', 'kit', '--roles', 'lesson', ...(sz === 'S' ? ['--size', 'S'] : []), '--skills', keys.join(',')];
                if (fs.existsSync(file)) a.push('--baseline', rel(file));
                const unp = keys.filter((k) => !pinnedL.has(`${k}#lesson`));
                add(gate(`print-lint-lesson-${sz}`, `ws-print-lint --source kit --roles lesson --size ${sz} (the lane skills' own lesson pages: H13, WRAP-OP, ...)`, scope, 'browser', 'ws-print-lint', a, { parse: PARSE.printLint, expect: { ids }, note: unp.length ? `lesson page not pinned at ${sz}: ${listShort(unp)} (must be clean)` : '' }));
            }
        }
        const ssFile = scriptPath('ws-screen-slots');
        const ss = ['--skills', keys.join(',')];
        if (ssFile && srcHas(ssFile, 'baseline') && fs.existsSync(SLOTS_BASE)) ss.push('--baseline', rel(SLOTS_BASE));
        if (ssFile && srcHas(ssFile, 'json')) ss.push('--json', path.join(ctx.logs, 'screen-slots.json'));
        add(gate('screen-slots', 'ws-screen-slots --skills', scope, 'browser', 'ws-screen-slots', ss, { parse: PARSE.screenSlots, needFlags: ['skills'], expect: { skills: keys.length, hosts: 4 } }));
        add(gate('screen-answer', 'ws-screen-answer --skills', scope, 'browser', 'ws-screen-answer', ['--skills', keys.join(',')], { needFlags: ['skills'], expect: { mention: keys } }));
        // --baseline only when a pin exists (none yet: then it runs plain, and any failure is red)
        const cbFile = scriptPath('ws-chromebook-fit');
        const cb = ['--skills', keys.join(',')];
        if (cbFile && srcHas(cbFile, 'baseline') && fs.existsSync(FIT_BASE)) cb.push('--baseline', rel(FIT_BASE));
        add(gate('chromebook-fit', `ws-chromebook-fit --skills${cb.includes('--baseline') ? ' --baseline' : ''}`, scope, 'browser', 'ws-chromebook-fit', cb, { needFlags: ['skills'], expect: { mention: keys } }));
        add(gate('code-snapshot', 'ws-code-snapshot', 'all share codes', 'node', 'ws-code-snapshot', []));
        add(gate('boot-smoke', 'ws-boot-smoke', 'app boot', 'browser', 'ws-boot-smoke', []));
        // ---- the pilot-su-c critic r1 lessons (2026-10-23). The sibling comparison and the slot / clip rows read the
        // matrix's run file, so they run after it (a node gate each: both take their own browser slots); the slot / clip
        // row runs after the comparison, so the siblings' matrix run is measured once and read from its cache.
        const scJson = path.join(ctx.logs, 'sibling-compare.json');
        const sc = gate('sibling-compare', 'ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)', `${scope}: matrix rows with findings`, 'node', 'ws-sibling-compare', ['--run', cmJson, '--skills', keys.join(','), '--run-siblings', '--json', scJson], { parse: PARSE.siblingCompare, jsonOut: scJson, keys, missingMsg: 'ws-sibling-compare is not in this tree' });
        sc.after = 'coverage-matrix';
        if (matrix.missing && !sc.missing) sc.missing = `needs the coverage matrix's run file (${matrix.missing})`;
        add(sc);
        const clJson = path.join(ctx.logs, 'slot-clip.json');
        const cl = gate('slot-clip', 'ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap)', `${scope} × matrix rows × S/M/L + extras at S`, 'node', 'ws-slot-clip', ['--run', cmJson, '--skills', keys.join(','), '--run-siblings', '--slots', '2', '--json', clJson], { parse: PARSE.slotClip, jsonOut: clJson, keys });
        cl.after = 'sibling-compare';
        if (matrix.missing && !cl.missing) cl.missing = `needs the coverage matrix's run file (${matrix.missing})`;
        add(cl);
        add(gate('phone-card', 'ws-phone-card (practice card at 390 px: clip, first-box focus)', `${scope} × 390x844, 390x664`, 'browser', 'ws-phone-card', ['--skills', keys.join(',')], { expect: { mention: keys } }));
        const sk = keys.flatMap((k) => ['--skill', k]);
        add(gate('card-rulings', 'ws-card-rulings --check rulings (spec card numeric rulings, 300 items)', scope, 'node', 'ws-card-rulings', [...sk, '--check', 'rulings'], { parse: PARSE.cardRulings }));
        add(gate('card-not-offered', 'ws-card-rulings --check offered (panel offers nothing the card bans)', scope, 'node', 'ws-card-rulings', [...sk, '--check', 'offered'], { parse: PARSE.cardRulings }));
        // ---- lane S1 (2026-10-24): dealer uniformity, and the lesson-data / option-help / wrong-answer-fit node rules
        add(gate('dealer-uniform', 'ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position)', scope, 'node', 'ws-dealer-uniform', ['--skill', keys.join(',')], { parse: PARSE.dealerUniform, keys }));
        const s1Json = path.join(ctx.logs, 'node-lint-s1.json');
        add(gate('node-lint-s1', 'ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot)', scope, 'node', 'ws-node-lint', ['--skill', keys.join(','), '--rules', 'LESSON-DATA,OPTION-HELP,WRONG-FITS', '--baseline', 'tests/fixtures/precritic/node-lint-s1.baseline.json', '--json', s1Json], { parse: PARSE.nodeLint, jsonOut: s1Json, expect: { skills: keys.length }, needFlags: ['rules'], missingMsg: 'ws-node-lint is not in this tree' }));
        // W0-B2 (lane S1): the spec card that covers these skills is signed, its rulings / notOffered / decisions are as
        // signed, and it decides every option value, role and screen host the repo offers today (ws-spec-card
        // --check-signed --skill). No card covers them (exit 4): N/A. An UNSIGNED card (exit 5, "needs owner signature";
        // a draft's other problems are listed) is INCOMPLETE, never PASS: the lane may run and the critic may grade, a
        // --strict run fails. A SIGNED card that fails (an undecided line, a weakened ruling, a hand edit, a stale rule): FAIL.
        add(gate('spec-card-signed', 'ws-spec-card --check-signed --skill (card signed; every host, role and option value decided)', scope, 'node', 'ws-spec-card', ['--check-signed', '--skill', keys.join(',')], { parse: (g, out, code) => {
            const m = /^ws-spec-card: (OK|FAIL|NO-CARD) — (.*)$/m.exec(out);
            if (!m) return unparsed('no "ws-spec-card: OK|FAIL|NO-CARD" line', out);
            const det = out.split('\n').filter((l) => /^(FAIL|UNSIGNED) /.test(l)).slice(0, 10);
            // S1 critic r1 N4: design/cards/README.md says "a build starts only after the owner has signed its card" - a
            // rule for NEW builds; families approved before cards existed have none, so NO-CARD stays N/A (--strict
            // accepts it) and the row says so in words, so a lane building a new family sees it has no card.
            if (m[1] === 'NO-CARD' && code === 4) return { result: 'N/A', findings: `no spec card covers ${listShort(keys, 4)} (${m[2].slice(0, 120)}); a NEW family's build needs a signed card first (design/cards/README.md), an approved pre-card family has none`, detail: [], explainsExit: true };
            if (m[1] === 'FAIL' && code === 5) return { result: 'INCOMPLETE (unsigned card)', findings: m[2], detail: det, explainsExit: true };
            if (m[1] === 'OK' && code === 0) return { result: 'PASS', findings: m[2].slice(0, 200), detail: [], explainsExit: false };
            return { result: 'FAIL', findings: m[2].slice(0, 200), detail: det, explainsExit: code === 1 };
        } }));
        // B7: every offered APPEARANCE value of the touched skills printed at S and L through ws-print-lint, against the
        // skill's default page (pilot-su-c critic r2 N4: "Across" kept its promise and broke the page). A browser gate:
        // print-lint runs inside the slot this row holds.
        add(gate('options-render', 'ws-options-verify --render (each offered appearance value at S / L vs the default page)', `${scope} × S/L`, 'browser', 'ws-options-verify', ['--render', '--skill', keys.join(',')], { needFlags: ['render'], parse: (g, out, code) => {
            const m = /^ws-options-verify --render: (OK|FAIL) \((.*)\)\s*$/m.exec(out);
            if (!m) return unparsed('no "ws-options-verify --render: OK|FAIL" line', out);
            if (m[1] === 'OK') return { result: /^nothing to render/.test(m[2]) ? 'N/A' : 'PASS', findings: m[2].slice(0, 220), detail: [], explainsExit: false };
            return { result: 'FAIL', findings: m[2].slice(0, 220), detail: out.split('\n').filter((l) => /^ {2}FAIL /.test(l)).slice(0, 10).map((l) => l.trim()), explainsExit: code === 1 };
        } }));
    }
    if (ctx.template) {
        const t = ctx.template;
        add(gate('panes-unit', 'ws-panes-unit', 'support panes', 'node', 'ws-panes-unit', []));
        const own = scriptPath(`ws-${t}-unit`);
        add(gate(`unit-${t}`, `template unit test ws-${t}-unit`, `template ${t}`, own && /\.cjs$/.test(own) ? 'browser' : 'node', `ws-${t}-unit`, [], { missingMsg: `no tests/scripts/ws-${t}-unit.*` }));
        const fxDir = path.join(ROOT, 'tests', 'fixtures', 'precritic');
        const fx = fs.existsSync(fxDir) ? fs.readdirSync(fxDir).filter((f) => f.startsWith(t) && /\.mjs$/.test(f)).sort() : [];
        if (!fx.length) add(synthetic('fixtures', 'template fixtures', `template ${t}`, { result: 'N/A', findings: `no fixtures (tests/fixtures/precritic/${t}*.mjs)` }));
        // a *.fail.mjs fixture holds the defect its check was built for: it must FAIL (ws-backtest's reading), a
        // *.pass.mjs fixture must pass; ws-node-lint --fixture never uses the baseline, so any finding fails it.
        for (const f of fx) add(gate(`fixture-${f}`, `template fixture ${f} (ws-node-lint --fixture, must ${/\.fail\.mjs$/.test(f) ? 'FAIL' : 'pass'})`, `template ${t}`, 'node', 'ws-node-lint', ['--fixture', `tests/fixtures/precritic/${f}`], { parse: PARSE.fixture, expectFail: /\.fail\.mjs$/.test(f) }));
        add(gate('grade-render-template', 'ws-grade-render --template --contact-sheet', `template ${t}`, 'browser', 'ws-grade-render', ['--template', t, '--contact-sheet', '--out', path.join(ctx.logs, 'grade-render-template')], { needFlags: ['template', 'contact-sheet'], parse: PARSE.gradeRender }));
    }
    if (ctx.role) {
        // --role R --skill X: the lane skills join the role's pinned sample (S1 critic r1 D2), so X's own R page is linted
        const sample = [...new Set([...ctx.roleSample, ...ctx.skills.map((s) => s.key)])];
        const sc = `role ${ctx.role} × ${sample.length} sample skills`;
        add(gate(`grade-render-role-${ctx.role}`, `ws-grade-render --roles ${ctx.role}`, sc, 'browser', 'ws-grade-render', ['--roles', ctx.role, '--skills', sample.join(','), '--out', path.join(ctx.logs, `grade-render-${ctx.role}`)], { needFlags: ['roles'], parse: PARSE.gradeRender, expectUnits: sample.length }));
        const pl = ['--source', 'kit', '--roles', ctx.role, '--skills', sample.join(',')];
        if (fs.existsSync(PRINT_BASE)) pl.push('--baseline', rel(PRINT_BASE));
        // print-lint names a role page "cat:skill#role" (independent: plain "cat:skill"); the pin lists those it holds.
        const docId = (k) => (ctx.role === 'independent' ? k : `${k}#${ctx.role}`);
        const pinnedR = pinnedIds(PRINT_BASE);
        const unpinned = sample.filter((k) => !pinnedR.has(docId(k)));
        add(gate(`print-lint-role-${ctx.role}`, `ws-print-lint --source kit --roles ${ctx.role}`, sc, 'browser', 'ws-print-lint', pl, { parse: PARSE.printLint, expect: { ids: sample.map(docId) }, note: unpinned.length ? `${unpinned.length} of ${sample.length} role pages not pinned in ${rel(PRINT_BASE)} (an unpinned page must be clean)` : '' }));
        // L1 "Size S ignored" (pilot-su-c critic r2 N2: the lesson Warm-up H13 was at S and L): the role at S too, against
        // the S pin (print-lint.S.json); a role page that pin does not hold must be clean
        const plS = ['--source', 'kit', '--roles', ctx.role, '--size', 'S', '--skills', sample.join(',')];
        const baseS = sizeBase('S');
        if (fs.existsSync(baseS)) plS.push('--baseline', rel(baseS));
        const unpS = sample.filter((k) => !pinnedIds(baseS).has(docId(k)));
        add(gate(`print-lint-role-${ctx.role}-S`, `ws-print-lint --source kit --roles ${ctx.role} --size S`, sc, 'browser', 'ws-print-lint', plS, { parse: PARSE.printLint, expect: { ids: sample.map(docId) }, note: unpS.length ? `${unpS.length} of ${sample.length} role pages not pinned in ${rel(baseS)} (an unpinned page must be clean)` : '' }));
        // Mixed practice (IMPROVEMENT_PLAN 3.4): the kit's own page checks - M1's one-size-class page (repeats, digits,
        // ladder, fill, tabs, PG-15) and M2's mixed sizes (arranged, runs, exact counts, two of each, split, H13, fill,
        // S > M > L on Mixed and Sections, key, alignment). They live beside the role in js/modules/sheet/.
        if (ctx.role === 'mixed-practice') {
            for (const [id, file, args, what] of [
                ['mixed-m2', 'js/modules/sheet/mixed-m2.check.cjs', ['--quick'], 'mixed sizes, exact counts, ladder'],
                ['mixed-page', 'js/modules/sheet/mixed-page.check.cjs', ['--seeds', '2'], 'one size class: repeats, digits, ladder, fill'],
                // (§1.7 stop of M2: what the pupil SEES, hard FAILs - runs in problems, row fill, even spread, cross-template
                // rule alignment, digit size, spare height - on the critics' sets at S / M / L, both looks, 2 seeds)
                ['mixed-m3', 'js/modules/sheet/mixed-m3.check.cjs', [], 'runs / rows / spread / align / digits / spare, as printed'],
            ]) {
                const g = gate(id, `${path.basename(file)} ${args.join(' ')}`.trim(), `Mixed practice: ${what}`, 'browser', id, args);
                g.file = path.join(ROOT, file);
                g.missing = fs.existsSync(g.file) ? null : `${file} is not in this tree`;
                g.script = `${id} check`;   // (its verdict line: "mixed-m2 check: OK")
                add(g);
            }
        }
    }
    if (ctx.teacher) {
        for (const n of ['shell', 'library', 'preview', 'quiz']) add(gate(`teacher-${n}`, `ws-teacher-${n}`, 'teacher site', 'browser', `ws-teacher-${n}`, []));
        const w = [];
        if (ctx.grade) w.push('--grade', ctx.grade);
        if (ctx.lesson) w.push('--lesson', ctx.lesson);
        add(gate('teacher-wrm', `ws-teacher-wrm${w.length ? ' ' + w.join(' ') : ''}`, ctx.grade || ctx.lesson ? `White Rose ${[ctx.grade && `grade ${ctx.grade}`, ctx.lesson && `lesson ${ctx.lesson}`].filter(Boolean).join(', ')}` : 'White Rose, every lesson', 'browser', 'ws-teacher-wrm', w, { needFlags: [ctx.grade && 'grade', ctx.lesson && 'lesson'].filter(Boolean) }));
        add(gate('teacher-flows', 'ws-teacher-flows', 'teacher flows (§2.9)', 'browser', 'ws-teacher-flows', []));
        // (§1.7 stop of M2, dialog half: the Print sheet's plan === the built pages, titles, per-skill counts, summary line)
        add(gate('teacher-plan-match', 'ws-teacher-plan-match', 'Print sheet plan = what prints (In sections, Mixed up, big cells)', 'browser', 'ws-teacher-plan-match', []));
        add(gate('teacher-tokens', 'ws-teacher-tokens', 'teacher tokens (§2.8)', 'node', 'ws-teacher-tokens', []));
        add(gate('plain-words', 'ws-plain-words --check', 'plain-word db', 'node', 'ws-plain-words', ['--check']));
    }
    return rows;
}

/* ============================================================== run: process groups, time-outs */
// Every gate runs in its own process group (detached), so a time-out reaches the runner, node, and Chromium. The tree
// is also tracked through /proc (every 2 s and at each kill), because puppeteer starts Chromium in a group of its own:
// each tracked process and group gets SIGTERM, then SIGKILL after a grace period, so nothing keeps the slot lock or
// the output pipe. The row resolves on 'close', or shortly after 'exit' when an orphan still holds the pipe.
const OWN_PGID = (() => { try { const st = fs.readFileSync('/proc/self/stat', 'utf8'); return +st.slice(st.lastIndexOf(')') + 2).split(' ')[2]; } catch (e) { return -1; } })();
function descendants(rootPid) {
    const kids = new Map();
    let names = [];
    try { names = fs.readdirSync('/proc').filter((d) => /^\d+$/.test(d)); } catch (e) { return new Map(); }
    for (const d of names) {
        try {
            const st = fs.readFileSync(`/proc/${d}/stat`, 'utf8');
            const f = st.slice(st.lastIndexOf(')') + 2).split(' '); // state ppid pgrp ...
            const ppid = +f[1];
            if (!kids.has(ppid)) kids.set(ppid, []);
            kids.get(ppid).push({ pid: +d, pgid: +f[2] });
        } catch (e) { /* gone */ }
    }
    const out = new Map();
    const stack = [rootPid];
    while (stack.length) {
        const p = stack.pop();
        for (const c of kids.get(p) || []) if (!out.has(c.pid)) { out.set(c.pid, c.pgid); stack.push(c.pid); }
    }
    return out;
}
/** Processes (other than this one) that carry the gate's MQ_PRECRITIC_GATE token in their environment: every process
 *  the gate started inherits it (puppeteer passes the environment on to Chromium), so an orphan the gate left behind is
 *  found even after its parent died and it was reparented. */
function tokenHolders(token) {
    const out = new Map();
    if (!token) return out;
    const needle = Buffer.from(`MQ_PRECRITIC_GATE=${token}\0`);
    let names = [];
    try { names = fs.readdirSync('/proc').filter((d) => /^\d+$/.test(d) && +d !== process.pid); } catch (e) { return out; }
    for (const d of names) {
        try {
            if (!fs.readFileSync(`/proc/${d}/environ`).includes(needle)) continue;
            const st = fs.readFileSync(`/proc/${d}/stat`, 'utf8');
            out.set(+d, +st.slice(st.lastIndexOf(')') + 2).split(' ')[2]);
        } catch (e) { /* gone, or not ours to read */ }
    }
    return out;
}
function killTree(rootPid, tree, sig, token) {
    for (const [p, pg] of descendants(rootPid)) tree.set(p, pg);
    for (const [p, pg] of tokenHolders(token)) tree.set(p, pg);
    try { process.kill(-rootPid, sig); } catch (e) { /* group gone */ }
    for (const pg of new Set(tree.values())) if (pg > 1 && pg !== OWN_PGID && pg !== process.pid) { try { process.kill(-pg, sig); } catch (e) { /* gone */ } }
    for (const p of tree.keys()) if (p !== process.pid) { try { process.kill(p, sig); } catch (e) { /* gone */ } }
}
const LIVE = new Map(); // pid -> {tree, token}, for an interrupted precritic

function runOne(g, ctx) {
    return new Promise((resolve) => {
        const base = /\.sh$/.test(g.file) ? ['bash', g.file] : [process.execPath, g.file];
        const cmd = g.kind === 'browser' ? [ctx.runner || RUNNER, ...base, ...g.args] : [...base, ...g.args];
        if (g.jsonOut) { try { fs.unlinkSync(g.jsonOut); } catch (e) { /* none yet */ } } // never read a stale file
        const t0 = Date.now();
        const token = `${process.pid}-${g.id}-${t0}`;
        const env = { ...process.env, MQ_BROWSER_WAIT_LOG: '1', MQ_PRECRITIC_GATE: token };
        const grace = ctx.killGraceMs == null ? 5000 : ctx.killGraceMs;
        let out = '', done = false, timedOut = false, exitInfo = null, leftovers = false, closed = false;
        let child;
        try { child = spawn(cmd[0], cmd.slice(1), { cwd: ROOT, env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { child = null; out = `spawn failed: ${e.message}\n`; }
        const tree = new Map();
        const timers = [];
        const finish = () => {
            if (done) return;
            done = true;
            timers.forEach((t) => clearTimeout(t));
            clearInterval(tracker);
            if (child) { LIVE.delete(child.pid); try { child.stdout.destroy(); child.stderr.destroy(); } catch (e) { /* closed */ } }
            const ms = Date.now() - t0;
            const w = /mq-browser-run: slot \d+ after (\d+)s/.exec(out);
            const logFile = path.join(ctx.logs, `${g.id}.log`);
            const shown = shownCmd(g);
            try { fs.writeFileSync(logFile, `$ ${shown}\n\n${out}`); } catch (e) { /* logs dir */ }
            const code = exitInfo ? exitInfo.code : null, signal = exitInfo ? exitInfo.signal : (timedOut ? 'SIGKILL' : null);
            resolve({ code: code == null && !signal ? 1 : code, signal, out, ms, wait: w ? +w[1] : 0, timedOut, timeoutMin: ctx.timeoutMin, leftovers, cmd: shown, logFile });
        };
        const tracker = setInterval(() => { if (child && child.pid) for (const [p, pg] of descendants(child.pid)) tree.set(p, pg); }, 2000);
        if (!child || !child.pid) { exitInfo = { code: 127, signal: null }; finish(); return; }
        LIVE.set(child.pid, { tree, token });
        const kill = (sig) => killTree(child.pid, tree, sig, token);
        child.stdout.on('data', (d) => { out += d; });
        child.stderr.on('data', (d) => { out += d; });
        child.on('error', (e) => { out += `\n${TOOL}: spawn error: ${e.message}\n`; if (!exitInfo) exitInfo = { code: 127, signal: null }; finish(); });
        timers.push(setTimeout(() => {
            timedOut = true;
            out += `\n${TOOL}: timed out after ${fmtMin(ctx.timeoutMin)} min: SIGTERM to its process group, SIGKILL after ${grace / 1000} s\n`;
            kill('SIGTERM');
            timers.push(setTimeout(() => { kill('SIGKILL'); timers.push(setTimeout(finish, 300)); }, grace));
        }, ctx.timeoutMin * 60000));
        child.on('exit', (code, signal) => {
            exitInfo = { code, signal };
            if (timedOut) return; // the SIGKILL sweep finishes the row
            if (closed) { finish(); return; }
            // an orphan (a Chromium the tool left behind) still holds the pipe: give it 2 s, then end the tree
            timers.push(setTimeout(() => {
                if (done) return;
                leftovers = true;
                out += `\n${TOOL}: the gate exited but left processes holding its output; they were killed\n`;
                kill('SIGTERM');
                timers.push(setTimeout(() => { kill('SIGKILL'); finish(); }, 1000));
            }, 2000));
        });
        child.on('close', () => { closed = true; if (exitInfo && !timedOut) finish(); });
    });
}

async function pool(items, n, fn) {
    const queue = items.slice();
    const workers = Array.from({ length: Math.max(1, n) }, async () => { while (queue.length) { const it = queue.shift(); await fn(it); } });
    await Promise.all(workers);
}

/* ============================================================== flags */
const VALUE_FLAGS = new Set(['skill', 'template', 'role', 'grade', 'lesson', 'json', 'logs', 'browser-jobs', 'node-jobs', 'timeout', 'print-lint-baseline', 'screen-slots-baseline', 'options-verify-baseline', 'matrix-baseline', 'chromebook-fit-baseline', 'out']);
const REPEATABLE = new Set(['skill']);
const BOOL_FLAGS = new Set(['teacher', 'dry-run', 'write-role-sample', 'list-live', 'strict', 'allow-not-built', 'report-only', 'help', 'h']);
/** Every problem with the command line, as messages (empty when it is good). */
function checkArgs(argv) {
    const errs = [];
    const seen = new Set();
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '-h') continue;
        const m = /^--([a-z0-9-]+)$/.exec(a);
        if (!m) { errs.push(/^--?[^-]/.test(a) || a.startsWith('--') ? `unknown flag ${a}` : `unexpected argument "${a}"`); continue; }
        const f = m[1];
        if (VALUE_FLAGS.has(f)) {
            const val = argv[i + 1];
            if (val === undefined || /^--/.test(val)) errs.push(`--${f} needs a value`);
            else i++;
            if (seen.has(f) && !REPEATABLE.has(f)) errs.push(`--${f} given twice`);
        } else if (!BOOL_FLAGS.has(f)) errs.push(`unknown flag --${f}`);
        seen.add(f);
    }
    const num = (f, test, what) => { if (seen.has(f)) { const v = arg(f, ''); if (!test(+v) || !/^\d+(\.\d+)?$/.test(v)) errs.push(`--${f} ${v}: ${what}`); } };
    num('timeout', (x) => x > 0, 'give minutes > 0');
    num('node-jobs', (x) => Number.isInteger(x) && x >= 1, 'give a whole number >= 1');
    num('browser-jobs', (x) => Number.isInteger(x) && x >= 1, 'give a whole number >= 1');
    if ((seen.has('grade') || seen.has('lesson')) && !seen.has('teacher')) errs.push('--grade / --lesson go with --teacher');
    // an explicit pin that does not exist would silently run unpinned: refuse it
    for (const f of [...seen].filter((x) => x.endsWith('-baseline'))) { const v = arg(f, ''); if (v && !fs.existsSync(path.resolve(ROOT, v))) errs.push(`--${f} ${v}: no such file`); }
    return errs;
}

/* ============================================================== main */
async function main() {
    const T0 = Date.now();
    const started = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const stamp = started.replace(/[-:]/g, '').replace('T', '-').replace('Z', '');

    if (has('help') || has('h') || ARGV.includes('-h')) {
        say(fs.readFileSync(__filename, 'utf8').split('\n').slice(1).filter((l) => l.startsWith('//')).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
        return;
    }
    const argErrs = checkArgs(ARGV);
    if (argErrs.length) usage(argErrs.join('; '));
    if (has('list-live')) { say(JSON.stringify(appSkills('live').live.map((s) => s.key))); return; }
    if (has('write-role-sample')) {
        const live = new Set(appSkills('live').live.map((s) => s.key));
        const rows = deriveRoleSample(live);
        const cat = git(['log', '-1', '--format=%h %cs', '--', 'design/SKILL_CATALOGUE.md']);
        const json = {
            note: 'Pinned role sample for ws-precritic --role (IMPROVEMENT_PLAN §1.4 S1). Changed only with a STATUS note.',
            how: 'node tests/scripts/ws-precritic.cjs --write-role-sample: the 20 largest families (categories) by the skill counts of the "By category" table of design/SKILL_CATALOGUE.md (ties keep catalogue order), listed in catalogue order; for each, the first row of its "Every skill" section that is a live skill (not retired) in js/modules/data.js.',
            catalogue: cat || null,
            pinned: started.slice(0, 10),
            skills: rows.map((r) => r.skill),
            families: rows,
        };
        const outFile = arg('out', ROLE_SAMPLE);
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, JSON.stringify(json, null, 1) + '\n');
        say(`wrote ${rel(path.resolve(outFile))}: ${rows.map((r) => r.skill).join(', ')}`);
        say(`${TOOL}: OK (role sample)`);
        return;
    }

    const wantSkills = argAll('skill');
    const template = arg('template', null);
    let role = arg('role', null);
    const teacher = has('teacher');
    if (!wantSkills.length && !template && !role && !teacher) usage('give a scope: --skill, --template, --role or --teacher');
    if (role) {
        const R = sheetRoles();
        const ok = new Set([...R.roles, ...Object.keys(R.aliases)]);
        if (!ok.has(role)) usage(`--role ${role}: not a role buildSheet composes (js/modules/sheet/roles/index.js): ${R.roles.join(', ')}; aliases ${Object.entries(R.aliases).map(([a, b]) => `${a}=${b}`).join(', ')}`);
        if (R.aliases[role]) { process.stderr.write(`${TOOL}: --role ${role} is an alias of ${R.aliases[role]}; running ${R.aliases[role]}\n`); role = R.aliases[role]; }
    }

    const dry = has('dry-run');
    const logs = path.resolve(arg('logs', `/tmp/mq-precritic/${stamp}-${process.pid}`));
    if (!dry) fs.mkdirSync(logs, { recursive: true });
    const ctx = { logs, template, role, teacher, grade: arg('grade', null), lesson: arg('lesson', null), timeoutMin: +arg('timeout', '90'), skills: [], roleSample: [], live: [], templateScan: null };

    // ---- scope: skills (validated against the live list), the template's skills, the role sample
    let scanNote = '';
    if (wantSkills.length || template) {
        const info = appSkills(template ? 'templates' : 'live');
        ctx.live = info.live;
        const byKey = new Map(info.live.map((s) => [s.key, s]));
        const pick = [];
        for (const w of wantSkills) {
            const hit = byKey.get(w) || (!w.includes(':') ? info.live.filter((s) => s.id === w) : []);
            const list = Array.isArray(hit) ? hit : hit ? [hit] : [];
            if (!list.length) usage(`"${w}" is not a live skill (give category:skill)`);
            if (list.length > 1) usage(`"${w}" names ${list.length} skills (${list.map((s) => s.key).join(', ')}): give category:skill`);
            pick.push(list[0]);
        }
        if (template) {
            // every live skill that draws the template on ANY of its 8 seeded items (not only where it is the most drawn)
            const tpl = (s) => info.templates[s.key] || {};
            const tsk = info.live.filter((s) => (tpl(s)[template] || 0) > 0);
            const allErr = info.live.filter((s) => (tpl(s).error || 0) >= 8).map((s) => s.key);
            const someErr = info.live.filter((s) => (tpl(s).error || 0) > 0 && (tpl(s).error || 0) < 8).map((s) => `${s.key} (${tpl(s).error}/8)`);
            const notTop = tsk.filter((s) => tpl(s)[template] !== Math.max(...Object.values(tpl(s)))).map((s) => `${s.key} (${tpl(s)[template]}/8)`);
            if (!tsk.length && !allErr.length) usage(`--template ${template}: no live skill draws with it`);
            pick.push(...tsk);
            const f = [`${tsk.length} skill(s) draw ${template} on at least one of 8 seeded items${notTop.length ? `; ${notTop.length} not as the most drawn: ${listShort(notTop, 4)}` : ''}`];
            if (allErr.length) f.push(`${allErr.length} live skill(s) errored on all 8 items, so whether they draw ${template} is unknown (not checked): ${listShort(allErr)}`);
            if (someErr.length) f.push(`${someErr.length} skill(s) errored on some items: ${listShort(someErr, 4)}`);
            ctx.templateScan = synthetic('template-scan', `template ${template} skill scan`, `${info.live.length} live skills × 8 seeded items`, { result: allErr.length ? 'FAIL' : 'PASS', findings: f.join('; '), detail: allErr.slice(0, 10).map((k) => `generation errored on every seeded item: ${k}`) });
            if (allErr.length) scanNote = `; errored on every item, not checked: ${listShort(allErr, 4)}`;
        }
        const seen = new Set();
        ctx.skills = pick.filter((s) => (seen.has(s.key) ? false : seen.add(s.key)));
    }
    if (role) {
        if (!fs.existsSync(ROLE_SAMPLE)) usage(`--role needs ${rel(ROLE_SAMPLE)} (node tests/scripts/${TOOL}.cjs --write-role-sample)`);
        ctx.roleSample = JSON.parse(fs.readFileSync(ROLE_SAMPLE, 'utf8')).skills;
    }

    const rows = buildPlan(ctx);
    const commit = git(['rev-parse', '--short=10', 'HEAD']) || 'unknown';
    const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
    // tracked changes anywhere, plus untracked files under the trees a lane works in
    const dirtyFiles = git(['status', '--porcelain', '--untracked-files=all']).split('\n').filter(Boolean)
        .filter((l) => !l.startsWith('??') || /^\?\? "?(js|css|tests|design)\//.test(l));
    const dirty = dirtyFiles.length > 0;
    const scopeLine = [ctx.skills.length && !template ? `--skill ${ctx.skills.map((s) => s.key).join(',')}` : '', template ? `--template ${template} (${ctx.skills.length} skills${scanNote})` : '', template && wantSkills.length ? `--skill ${wantSkills.join(',')}` : '', role ? `--role ${role}` : '', teacher ? `--teacher${ctx.grade ? ` --grade ${ctx.grade}` : ''}${ctx.lesson ? ` --lesson ${ctx.lesson}` : ''}` : ''].filter(Boolean).join(' ');

    if (dry) {
        say(`${TOOL} plan: ${scopeLine} on ${commit}${dirty ? `+dirty (${dirtyFiles.length} file(s))` : ''}; logs would go to ${logs} (not created)`);
        for (const g of rows) {
            if (g.synthetic) { say(`  [self] ${g.name} — ${g.synthetic.result}: ${g.synthetic.findings}`); continue; }
            say(`  [${g.kind}] ${g.name} — ${g.missing ? `SKIPPED-NOT-BUILT (${g.missing})` : shownCmd(g)}`);
        }
        say(`${TOOL}: OK (dry run, nothing ran)`);
        return;
    }

    // ---- prerequisites (only when a browser gate will run), the runner
    const browserPlanned = rows.some((g) => g.kind === 'browser' && !g.missing);
    let pre = { bad: [] };
    if (browserPlanned) {
        if (!fs.existsSync(RUNNER)) {
            fs.copyFileSync(RUNNER_SRC, RUNNER); fs.chmodSync(RUNNER, 0o755);
            say(`${TOOL}: installed ${RUNNER} from ${rel(RUNNER_SRC)}`);
        }
        pre = prerequisites();
        if (pre.bad.length) {
            say(`${TOOL}: prerequisites missing, nothing ran:`);
            for (const b of pre.bad) say(`  - ${b}`);
            if (has('json')) fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({ tool: TOOL, commit, dirty, started, prerequisites: pre.bad, verdict: 'FAIL (prerequisites)' }, null, 1) + '\n');
            say(`${TOOL}: FAIL (prerequisites)`);
            process.exit(2);
        }
    }

    // ---- run: node gates and browser gates side by side
    const results = new Map();
    const runnable = rows.filter((g) => !g.missing && !g.synthetic);
    process.stderr.write(`${TOOL}: ${runnable.length} gate(s) (${runnable.filter((g) => g.kind === 'browser').length} browser), logs ${logs}\n`);
    const done = new Map(); // gate id -> promise of its finishing
    const finishOf = new Map();
    for (const g of runnable) done.set(g.id, new Promise((res) => finishOf.set(g.id, res)));
    const doRun = async (g) => {
        const r = await runOne(g, ctx);
        const p = judge(g, r, (g.parse || generic)(g, r.out, r.code));
        results.set(g.id, Object.assign(r, p));
        process.stderr.write(`  ${p.result.padEnd(15)} ${g.name} (${Math.round(r.ms / 1000)} s${r.wait ? `, waited ${r.wait} s for a slot` : ''})\n`);
        finishOf.get(g.id)();
    };
    // a gate with `after` reads another gate's output: it starts when that gate has finished, outside the pools (so it
    // never holds a pool worker while it waits), in a chain of its own
    const deferred = runnable.filter((g) => g.after);
    const chain = (async () => {
        for (const g of deferred) {
            if (done.has(g.after)) await done.get(g.after);
            await doRun(g);
        }
    })();
    await Promise.all([
        pool(runnable.filter((g) => g.kind === 'node' && !g.after), +arg('node-jobs', '3'), doRun),
        pool(runnable.filter((g) => g.kind === 'browser' && !g.after), +arg('browser-jobs', '2'), doRun),
        chain,
    ]);
    // rule 0b: a coverage-matrix row that failed ONLY on RED rows (no ERROR row, nothing else wrong) is engine red when the
    // sibling comparison found every red count at or below the approved siblings: PASS (baseline), non-blocking
    const cmR = results.get('coverage-matrix'), scR = results.get('sibling-compare');
    if (cmR && scR && cmR.result === 'FAIL' && cmR.meta && cmR.meta.red > 0 && cmR.meta.err === 0 && !cmR.timedOut && scR.result.startsWith('PASS') && scR.meta && scR.meta.red >= cmR.meta.red) {
        cmR.result = 'PASS (baseline)';
        cmR.findings += `; ENGINE RED: every count of the ${cmR.meta.red} red row(s) is at or below the approved siblings (ws-sibling-compare, rule 0b), so non-blocking`;
    } else if (cmR && scR && cmR.result === 'FAIL' && cmR.meta && cmR.meta.red > 0 && scR.result === 'FAIL') {
        cmR.findings += '; the sibling comparison found counts above the approved siblings: NOT engine red (rule 0b)';
    }

    // ---- table
    const finished = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const wall = Math.round((Date.now() - T0) / 1000);
    const table = [];
    table.push(`### ws-precritic — ${scopeLine}`);
    table.push('');
    table.push(`commit \`${commit}\`${dirty ? ` + uncommitted changes (${dirtyFiles.length} file(s))` : ''}${branch ? ` (${branch})` : ''} · started ${started} · finished ${finished} · wall ${wall} s · logs \`${logs}\``);
    table.push('');
    table.push('| Gate | Scope | Result | Findings vs baseline | Seconds |');
    table.push('|---|---|---|---|---|');
    const outRows = [];
    for (const g of rows) {
        const r = results.get(g.id);
        let row;
        if (g.missing) row = { id: g.id, gate: g.name, scope: g.scope, result: 'SKIPPED-NOT-BUILT', findings: g.missing, seconds: null, wait: 0, cmd: null, exit: null, detail: [], log: null };
        else if (g.synthetic) row = { id: g.id, gate: g.name, scope: g.scope, result: g.synthetic.result, findings: g.synthetic.findings, seconds: null, wait: 0, cmd: null, exit: null, detail: g.synthetic.detail || [], log: null };
        else row = { id: g.id, gate: g.name, scope: g.scope, result: r.result, findings: r.findings, seconds: Math.round(r.ms / 1000), wait: r.wait, cmd: r.cmd, exit: r.timedOut ? 'timed out' : r.signal ? r.signal : r.code, detail: r.detail || [], log: r.logFile };
        outRows.push(row);
        const secs = row.seconds == null ? '-' : `${row.seconds}${row.wait ? ` (${row.wait} waiting)` : ''}`;
        const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
        table.push(`| ${esc(row.gate)} | ${esc(row.scope)} | ${row.result} | ${esc(row.findings)} | ${secs} |`);
    }
    const failed = outRows.filter((r) => r.result === 'FAIL');
    const notBuilt = outRows.filter((r) => r.result === 'SKIPPED-NOT-BUILT');
    const noData = outRows.filter((r) => r.result === 'SKIPPED (no rulings)' || r.result.startsWith('INCOMPLETE'));
    const na = outRows.filter((r) => r.result === 'N/A');
    const passed = outRows.filter((r) => r.result.startsWith('PASS'));
    const onBase = outRows.filter((r) => r.result === 'PASS (baseline)');
    if (failed.length) {
        table.push('');
        table.push('Failing rows (first lines; the full output is in the log):');
        for (const r of failed) {
            table.push(r.cmd ? `- **${r.gate}** (exit ${r.exit}, \`${r.log}\`); rerun alone: \`${r.cmd}\`` : `- **${r.gate}** (worked out by ${TOOL})`);
            for (const d of r.detail.slice(0, 10)) table.push(`  - \`${String(d).trim().slice(0, 220).replace(/`/g, "'")}\``);
        }
    }
    const ids = (list) => list.map((r) => r.id).join(', ');
    const counts = `${failed.length ? `${failed.length} FAIL, ` : ''}${passed.length} PASS${onBase.length ? ` (${onBase.length} on the baseline)` : ''}, ${na.length} N/A, ${notBuilt.length} SKIPPED-NOT-BUILT${noData.length ? `, ${noData.length} SKIPPED / INCOMPLETE (no or partial rulings)` : ''} of ${outRows.length}`;
    const named = [failed.length && `FAIL: ${ids(failed)}`, na.length && `N/A (ran, nothing to check): ${ids(na)}`, notBuilt.length && `SKIPPED-NOT-BUILT (not run, not passed): ${ids(notBuilt)}`, noData.length && `SKIPPED / INCOMPLETE (no or partial rulings: not all checked, not passed): ${ids(noData)}`].filter(Boolean).join('; ');
    let verdict, exit;
    if (failed.length) { verdict = `FAIL: ${counts} (${named})`; exit = 1; }
    else if ((notBuilt.length || noData.length) && has('strict')) { verdict = `FAIL (incomplete, --strict): ${counts} (${named})`; exit = 3; }
    else { verdict = `OK: ${counts}${named ? ` (${named})` : ''}`; exit = 0; }
    table.push('');
    table.push(`${TOOL}: ${verdict}`);
    say('\n' + table.join('\n'));

    if (has('json')) {
        fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({
            tool: TOOL, commit, branch, dirty, dirtyFiles, started, finished, wallSeconds: wall, args: ARGV, scope: scopeLine, logs,
            baselines: { printLint: fs.existsSync(PRINT_BASE) ? rel(PRINT_BASE) : null, screenSlots: fs.existsSync(SLOTS_BASE) ? rel(SLOTS_BASE) : null, optionsVerify: fs.existsSync(OV_BASE) ? rel(OV_BASE) : null },
            skills: ctx.skills.map((s) => s.key), roleSample: ctx.roleSample, rows: outRows, verdict, markdown: table.join('\n'),
        }, null, 1) + '\n');
    }
    process.exit(has('report-only') ? 0 : exit);
}

if (require.main === module) {
    // an interrupted precritic takes its gates' process groups with it
    for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
        process.on(sig, () => {
            for (const [pid, l] of LIVE) killTree(pid, l.tree, 'SIGTERM', l.token);
            setTimeout(() => { for (const [pid, l] of LIVE) killTree(pid, l.tree, 'SIGKILL', l.token); say(`${TOOL}: FAIL (interrupted by ${sig})`); process.exit(130); }, 1500);
        });
    }
    main().catch((e) => { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL (error)`); process.exit(1); });
}
module.exports = { PARSE, generic, judge, lastVerdict, runOne, killTree, descendants, checkArgs, buildPlan, shownCmd, gate, sheetRoles, ROOT };
