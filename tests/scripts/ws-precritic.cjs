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
//             ws-coverage-matrix --skills (every kind × options at S / M / L; SKIPPED-NOT-BUILT until it lands), and until it
//             lands ws-print-lint --source kit --skills --baseline (independent) at sizes L, S and M, each against its own pin,
//             ws-screen-slots --skills (--baseline when the script has the flag; else this tool compares its findings
//             with the same pinned file), ws-screen-answer --skills, ws-chromebook-fit --skills, ws-code-snapshot,
//             ws-boot-smoke
//   --template <id>   the --skill gates for every live skill whose kit cell template is <id> (the most dealt of 8
//             seeded items, as ws-grade-render --template picks them), + ws-panes-unit, the template's own unit test
//             (tests/scripts/ws-<id>-unit.mjs|cjs when it exists) and its precritic fixtures
//             (tests/fixtures/precritic/<id>*.mjs through ws-node-lint --fixture), + ws-grade-render --template
//             --contact-sheet
//   --role <role>     ws-grade-render --roles <role> --skills <the role sample> + ws-print-lint --source kit
//             --roles <role> --skills <the role sample> --baseline. The sample is tests/fixtures/precritic/role-sample.json
//   --teacher         ws-teacher-shell, -library, -preview, -quiz, -wrm (--grade / --lesson passed on), ws-teacher-flows,
//             ws-teacher-tokens (SKIPPED-NOT-BUILT until they land), ws-plain-words --check
//
// BASELINES (pinned; changed only with a STATUS note)
//   design/audit/baselines/print-lint.json    ws-print-lint --json of `--source kit` (independent, size L) per skill:
//                                             print-lint's own --baseline ratchet on (document, lint, rule)
//   design/audit/baselines/screen-slots.json  {skills: {"cat:skill": ["host:kind", ...]}} (ws-screen-slots --baseline)
//   design/audit/baselines/print-lint.S.json, print-lint.M.json   the same at sizes S and M (pinned for the role
//                                             sample + subtraction:sub_100_no_regroup; a skill missing from a size's
//                                             pin runs unpinned at that size, so any finding there is FAIL)
//   design/audit/baselines/options-verify.json {skills: {"cat:skill": ["option=<json value>" | "static:<msg>", ...]}}
//   design/audit/baselines/node-lint.json     ws-node-lint's own baseline (it reads it itself)
//   --print-lint-baseline <file> / --screen-slots-baseline <file> / --options-verify-baseline <file> point a run at
//   another pin (the S / M pins sit beside the print-lint one: <name>.S.json, <name>.M.json).
//
// OTHER OPTIONS
//   --json <file>        the rows, the commit and the timings as JSON
//   --logs <dir>         every gate's full output (default /tmp/mq-precritic/<timestamp>); named in the table
//   --browser-jobs N     own browser gates at once (default 2; the runner caps the container at two anyway)
//   --node-jobs N        node gates at once (default 3)
//   --timeout <min>      per gate (default 90)
//   --strict             a run whose only non-green rows are SKIPPED-NOT-BUILT ends `ws-precritic: FAIL (incomplete ...)`
//                        (exit 3). Without it such a run ends `ws-precritic: OK on N of M gates; K SKIPPED-NOT-BUILT ...`
//                        (exit 0): the skipped gates are named in the table AND in the verdict line, never counted as passed.
//                        (--allow-not-built, the old opt-in, is accepted and now the default.)
//   --report-only        print everything, exit 0
//
// PREREQUISITES (checked first when a browser gate is planned; the run stops with the fix when one is missing)
//   Chromium in /opt/pw-browsers (or PUPPETEER_EXECUTABLE_PATH), puppeteer, the proxy CA in /root/.pki/nssdb
//   (STATUS §8), PyMuPDF (`python3 -c "import fitz"`; ws-print-lint and the PDF renders need it).
//
// Last line `ws-precritic: OK` or `ws-precritic: FAIL ...`; exit 0 OK, 1 a gate failed, 2 prerequisites or usage,
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
const OV_BASE = path.resolve(ROOT, arg('options-verify-baseline', 'design/audit/baselines/options-verify.json'));
const SLOTS_BASE = path.resolve(ROOT, arg('screen-slots-baseline', 'design/audit/baselines/screen-slots.json'));
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
                const exe = path.join('/opt/pw-browsers', d, 'chrome-linux', 'chrome');
                if (fs.existsSync(exe)) { chrome = exe; break; }
            }
        } catch (e) { /* none */ }
    }
    if (!chrome || !fs.existsSync(chrome)) bad.push('Chromium: no /opt/pw-browsers/chromium-*/chrome-linux/chrome and no PUPPETEER_EXECUTABLE_PATH. Fix: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npx playwright install chromium (or set PUPPETEER_EXECUTABLE_PATH)');
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

/* ============================================================== gate definitions */
const scriptPath = (name) => ['.cjs', '.mjs', '.js', '.sh'].map((e) => path.join(SCRIPTS, name + e)).find((p) => fs.existsSync(p)) || null;
const srcHas = (file, flag) => { try { const s = fs.readFileSync(file, 'utf8'); return s.includes(`arg('${flag}'`) || s.includes(`'--${flag}'`) || s.includes(`"--${flag}"`) || new RegExp(`--${flag}\\b`).test(s.split('\n').slice(0, 80).join('\n')); } catch (e) { return false; } };

/** A gate: {id, name, scope, kind 'node'|'browser', script, args, needFlags, parse, missing} */
function gate(id, name, scope, kind, script, args, extra = {}) {
    const file = scriptPath(script);
    let missing = null;
    if (!file) missing = `${script} is not in this tree`;
    else for (const f of extra.needFlags || []) if (!srcHas(file, f)) { missing = `${script} has no --${f} flag`; break; }
    return { id, name, scope, kind, script, file, args, missing, parse: extra.parse || null, note: extra.note || '', jsonOut: extra.jsonOut || null, keys: extra.keys || null };
}

/* ============================================================== output parsers */
const lastVerdict = (out, name) => { const m = [...out.matchAll(new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: (OK|FAIL|WOULD FAIL)\\b.*$`, 'gm'))]; return m.length ? m[m.length - 1] : null; };
function generic(g, out, code) {
    const v = lastVerdict(out, g.script);
    const ok = code === 0 && (!v || v[1] === 'OK');
    const detail = ok ? [] : out.split('\n').filter((l) => /FAIL|NEW|Error|error|✗|^\s+- /.test(l)).slice(0, 10);
    return { result: ok ? 'PASS' : 'FAIL', findings: ok ? '-' : (v ? v[0].slice(0, 120) : `exit ${code}`), detail };
}
const PARSE = {
    nodeLint(g, out, code) {
        let j = null; try { j = JSON.parse(fs.readFileSync(g.jsonOut, 'utf8')); } catch (e) { /* no json */ }
        const r = generic(g, out, code);
        if (!j) return r;
        const n = (j.findings || []).length, nw = (j.newFindings || []).length;
        if (r.result === 'PASS' && n) r.result = 'PASS (baseline)';
        r.findings = `${n} found, ${n - nw} pinned, ${nw} new`;
        if (nw) r.detail = (j.newFindings || []).slice(0, 8).map((f) => `NEW ${f.rule || ''} ${f.skill || f.key || ''} ${String(f.msg || f.message || '').slice(0, 140)}`);
        return r;
    },
    providers(g, out, code) {
        const r = generic(g, out, code);
        const m = /--skill: (\d+) of (\d+) skill\(s\) checked(?:; not covered \(no item maker in this test\): (.*))?/.exec(out);
        if (m && r.result === 'PASS') {
            if (+m[1] === 0) { r.result = 'N/A'; r.findings = `no provider test for ${m[3]}`; }
            else r.findings = `${m[1]} of ${m[2]} skills checked${m[3] ? `; not covered: ${m[3]}` : ''}`;
        }
        return r;
    },
    contentAudit(g, out, code) {
        if (/no skill matched/.test(out)) return { result: 'N/A', findings: 'outside the audited families (+ - × ÷, K-2, place value, time and money, function tables)', detail: [] };
        return generic(g, out, code);
    },
    optionsVerify(g, out, code) {
        const r = generic(g, out, code);
        // Compare the failing (option, value) pairs of the skills in scope (the script matches ids in every category,
        // so others are dropped) with the pin design/audit/baselines/options-verify.json {skills: {key: ["opt=json", ...]}}.
        let j = null; try { j = JSON.parse(fs.readFileSync(g.jsonOut, 'utf8')); } catch (e) { /* crashed before writing */ }
        if (j && !/page errors during the run/.test(out)) {
            const inScope = (j.results || []).filter((x) => !g.keys || g.keys.includes(x.key));
            if (!inScope.length) { return { result: 'N/A', findings: 'no options offered', detail: [] }; }
            let pin = null; try { pin = JSON.parse(fs.readFileSync(OV_BASE, 'utf8')).skills || {}; } catch (e) { pin = null; }
            const found = [];
            for (const x of inScope) {
                for (const v of x.results || []) if ((v.fails || []).length) found.push({ key: x.key, id: `${v.option}=${JSON.stringify(v.value)}`, msg: v.fails[0] });
                for (const m of x.statics || []) found.push({ key: x.key, id: `static:${m}`, msg: m });
            }
            const fresh = found.filter((f) => !(pin && (pin[f.key] || []).includes(f.id)));
            const nVals = inScope.reduce((n, x) => n + (x.results || []).length, 0);
            r.result = fresh.length ? 'FAIL' : found.length ? 'PASS (baseline)' : 'PASS';
            r.findings = `${nVals} value(s) checked; ${found.length} failing, ${found.length - fresh.length} pinned, ${fresh.length} new${pin ? '' : ` (no pin: ${rel(OV_BASE)} missing)`}`;
            r.detail = fresh.slice(0, 10).map((f) => `NEW ${f.key} ${f.id}: ${String(f.msg).slice(0, 140)}`);
            return r;
        }
        const m = /skills: (\d+) with options \((\d+) with none\)[^\n]*skills passing (\d+)\/(\d+)/.exec(out);
        if (m && r.result === 'PASS' && +m[1] === 0) { r.result = 'N/A'; r.findings = 'no options offered'; }
        else if (m) r.findings = `${m[3]}/${m[4]} skills with options pass`;
        return r;
    },
    printLint(g, out, code) {
        const r = generic(g, out, code);
        const sum = /(\d+) document\(s\), source \w+; (\d+) finding\(s\) in (\d+) document\(s\)/.exec(out);
        const docs = sum ? +sum[1] : null, f = sum ? +sum[2] : null, fd = sum ? +sum[3] : null;
        const ratchetOk = /OK \(ratchet against [^:]+: nothing rose/.test(out);
        const rose = /ratchet: (\d+) count\(s\) rose/.exec(out);
        if (code === 0 && ratchetOk) {
            r.result = f ? 'PASS (baseline)' : 'PASS';
            r.findings = f ? `${f} found in ${fd} of ${docs} doc(s), all pinned, 0 new` : `0 found (${docs} doc(s))`;
        } else if (rose) {
            r.result = 'FAIL';
            r.findings = `${f != null ? `${f} found in ${fd} of ${docs} doc(s); ` : ''}${rose[1]} (document, lint, rule) count(s) above the pin`;
            r.detail = out.split('\n').filter((l) => /^\s+- /.test(l)).slice(0, 10);
        } else if (sum) {
            r.findings = `${f} found in ${fd} of ${docs} doc(s)${g.args.includes('--baseline') ? '' : ' (no pinned baseline)'}`;
        }
        if (g.note && r.result === 'FAIL') {
            r.findings += `; ${g.note}`;
            const sz = g.args.indexOf('--size'), ro = g.args.indexOf('--roles');
            r.detail = [`pin (STATUS note required): ws-print-lint --source kit ${sz >= 0 ? g.args.slice(sz, sz + 2).join(' ') + ' ' : ''}${ro >= 0 ? g.args.slice(ro, ro + 2).join(' ') + ' ' : ''}--skills <skills> --report-only --json <out>, then merge its documents into the pin`, ...r.detail];
        }
        return r;
    },
    screenSlots(g, out, code) {
        const r = generic(g, out, code);
        const nat = /baseline [^:]+: (\d+) pinned finding\(s\) seen, (\d+) NEW/.exec(out);
        if (nat) {
            const pinned = +nat[1], nw = +nat[2];
            r.findings = `${pinned + nw} found, ${pinned} pinned, ${nw} new`;
            if (r.result === 'PASS' && pinned) r.result = 'PASS (baseline)';
            if (nw) r.detail = out.split('\n').filter((l) => /^NEW /.test(l)).slice(0, 10);
            return r;
        }
        // the script has no --baseline: compare its doubled / paper-verb lines with the pin here
        const found = [];
        for (const l of out.split('\n')) {
            const m = /^(\S+:\S+)\s+(\S+)\s+(host field \+|paper verb on screen)/.exec(l);
            if (m) found.push({ key: m[1], id: `${m[2]}:${m[3].startsWith('host') ? 'doubled' : 'paper'}`, line: l.replace(/\s+/g, ' ') });
            const e = /^(\S+:\S+)\s+ERR (.*)$/.exec(l);
            if (e) found.push({ key: e[1], id: 'render:error', line: l });
        }
        const crashed = code !== 0 && !found.length;
        if (crashed) return r;
        let pin = null;
        try { pin = JSON.parse(fs.readFileSync(SLOTS_BASE, 'utf8')).skills || {}; } catch (e) { pin = null; }
        if (!pin) {
            r.findings = `${found.length} found; no pinned baseline (${rel(SLOTS_BASE)} missing)`;
            r.detail = found.slice(0, 10).map((f) => f.line);
            return r;
        }
        const fresh = found.filter((f) => !(pin[f.key] || []).includes(f.id));
        r.findings = `${found.length} found, ${found.length - fresh.length} pinned, ${fresh.length} new (compared here: the script has no --baseline)`;
        r.result = fresh.length ? 'FAIL' : found.length ? 'PASS (baseline)' : 'PASS';
        r.detail = fresh.slice(0, 10).map((f) => `NEW ${f.line}`);
        return r;
    },
};

/* ============================================================== plan */
function usage(msg) { if (msg) say(`${TOOL}: ${msg}`); say(`usage: node tests/scripts/${TOOL}.cjs --skill cat:skill [--skill ...] | --template <id> | --role <role> | --teacher  [--json out] [--dry-run]`); say(`${TOOL}: FAIL (usage)`); process.exit(2); }

function buildPlan(ctx) {
    const rows = [];
    const add = (g) => { if (!rows.some((r) => r.id === g.id)) rows.push(g); };
    const skills = ctx.skills; // [{key, cat, id, preset, hosts}]
    if (skills.length) {
        const keys = skills.map((s) => s.key);
        const ids = [...new Set(skills.map((s) => s.id))];
        const scope = keys.length <= 3 ? keys.join(', ') : `${keys.length} skills${ctx.template ? ` (template ${ctx.template})` : ''}`;
        const nodeLintJson = path.join(ctx.logs, 'node-lint.json');
        add(gate('node-lint', 'ws-node-lint', scope, 'node', 'ws-node-lint', ['--skill', keys.join(','), '--json', nodeLintJson], { parse: PARSE.nodeLint, jsonOut: nodeLintJson }));
        add(gate('providers', 'ws-providers-unit --skill', scope, 'node', 'ws-providers-unit', ['--skill', keys.join(',')], { parse: PARSE.providers, needFlags: ['skill'] }));
        add(gate('content-audit', 'ws-content-audit --skill', scope, 'browser', 'ws-content-audit', ['--skill', ids.join(',')], { parse: PARSE.contentAudit }));
        const ovJson = path.join(ctx.logs, 'options-verify.json');
        add(gate('options-verify', 'ws-options-verify --skill', scope, 'browser', 'ws-options-verify', ['--skill', ids.join(','), '--json', ovJson], { parse: PARSE.optionsVerify, jsonOut: ovJson, keys }));
        const presetTouch = skills.filter((s) => s.preset || s.hosts);
        if (presetTouch.length) add(gate('presets', 'ws-presets-unit', `${presetTouch.length} preset / host skill(s)`, 'browser', 'ws-presets-unit', []));
        add(gate('coverage-matrix', 'ws-coverage-matrix --skills', `${scope} × kinds × S/M/L`, 'browser', 'ws-coverage-matrix', ['--skills', keys.join(','), '--baseline', rel(PRINT_BASE)], { needFlags: ['skills'] }));
        const pl = ['--source', 'kit', '--skills', keys.join(',')];
        if (fs.existsSync(PRINT_BASE)) pl.push('--baseline', rel(PRINT_BASE));
        add(gate('print-lint-kit', 'ws-print-lint --source kit --size L (independent; until the coverage matrix)', scope, 'browser', 'ws-print-lint', pl, { parse: PARSE.printLint }));
        // S and M (LESSONS_LEARNED L1: "Size S ignored"): their own pins, print-lint.<S|M>.json. A skill missing from a
        // size's pin runs without --baseline, so any finding there is red (print-lint's rule: an unpinned document
        // must be clean) and the row says how to pin it.
        for (const sz of ['S', 'M']) {
            const file = sizeBase(sz);
            const pinned = pinnedIds(file);
            const all = keys.every((k) => pinned.has(k));
            const a = ['--source', 'kit', '--size', sz, '--skills', keys.join(',')];
            if (all) a.push('--baseline', rel(file));
            add(gate(`print-lint-kit-${sz}`, `ws-print-lint --source kit --size ${sz}`, scope, 'browser', 'ws-print-lint', a, { parse: PARSE.printLint, note: all ? '' : `not pinned at ${sz}: ${keys.filter((k) => !pinned.has(k)).join(', ')} (${rel(file)})` }));
        }
        const ssFile = scriptPath('ws-screen-slots');
        const ss = ['--skills', keys.join(',')];
        if (ssFile && srcHas(ssFile, 'baseline') && fs.existsSync(SLOTS_BASE)) ss.push('--baseline', rel(SLOTS_BASE));
        add(gate('screen-slots', 'ws-screen-slots --skills', scope, 'browser', 'ws-screen-slots', ss, { parse: PARSE.screenSlots, needFlags: ['skills'] }));
        add(gate('screen-answer', 'ws-screen-answer --skills', scope, 'browser', 'ws-screen-answer', ['--skills', keys.join(',')], { needFlags: ['skills'] }));
        add(gate('chromebook-fit', 'ws-chromebook-fit --skills', scope, 'browser', 'ws-chromebook-fit', ['--skills', keys.join(',')], { needFlags: ['skills'] }));
        add(gate('code-snapshot', 'ws-code-snapshot', 'all share codes', 'node', 'ws-code-snapshot', []));
        add(gate('boot-smoke', 'ws-boot-smoke', 'app boot', 'browser', 'ws-boot-smoke', []));
    }
    if (ctx.template) {
        const t = ctx.template;
        add(gate('panes-unit', 'ws-panes-unit', 'support panes', 'node', 'ws-panes-unit', []));
        const own = scriptPath(`ws-${t}-unit`);
        if (own) add(gate(`unit-${t}`, `ws-${t}-unit`, `template ${t}`, /\.cjs$/.test(own) ? 'browser' : 'node', `ws-${t}-unit`, []));
        const fx = fs.existsSync(path.join(ROOT, 'tests', 'fixtures', 'precritic')) ? fs.readdirSync(path.join(ROOT, 'tests', 'fixtures', 'precritic')).filter((f) => f.startsWith(t) && /\.mjs$/.test(f)) : [];
        for (const f of fx) add(gate(`fixture-${f}`, `ws-node-lint --fixture ${f}`, `template ${t}`, 'node', 'ws-node-lint', ['--fixture', `tests/fixtures/precritic/${f}`]));
        add(gate('grade-render-template', 'ws-grade-render --template --contact-sheet', `template ${t}`, 'browser', 'ws-grade-render', ['--template', t, '--contact-sheet', '--out', path.join(ctx.logs, 'grade-render-template')], { needFlags: ['template', 'contact-sheet'] }));
    }
    if (ctx.role) {
        const sample = ctx.roleSample;
        const sc = `role ${ctx.role} × ${sample.length} sample skills`;
        add(gate(`grade-render-role-${ctx.role}`, `ws-grade-render --roles ${ctx.role}`, sc, 'browser', 'ws-grade-render', ['--roles', ctx.role, '--skills', sample.join(','), '--out', path.join(ctx.logs, `grade-render-${ctx.role}`)], { needFlags: ['roles'] }));
        const pl = ['--source', 'kit', '--roles', ctx.role, '--skills', sample.join(',')];
        if (fs.existsSync(PRINT_BASE)) pl.push('--baseline', rel(PRINT_BASE));
        // print-lint names a role page "cat:skill#role" (independent: plain "cat:skill"); the pin lists those it holds.
        const pinnedR = pinnedIds(PRINT_BASE);
        const unpinned = sample.filter((k) => !pinnedR.has(ctx.role === 'independent' ? k : `${k}#${ctx.role}`));
        add(gate(`print-lint-role-${ctx.role}`, `ws-print-lint --source kit --roles ${ctx.role}`, sc, 'browser', 'ws-print-lint', pl, { parse: PARSE.printLint, note: unpinned.length ? `${unpinned.length} of ${sample.length} role pages not pinned in ${rel(PRINT_BASE)} (an unpinned page must be clean)` : '' }));
    }
    if (ctx.teacher) {
        for (const n of ['shell', 'library', 'preview', 'quiz']) add(gate(`teacher-${n}`, `ws-teacher-${n}`, 'teacher site', 'browser', `ws-teacher-${n}`, []));
        const w = [];
        if (ctx.grade) w.push('--grade', ctx.grade);
        if (ctx.lesson) w.push('--lesson', ctx.lesson);
        add(gate('teacher-wrm', `ws-teacher-wrm${w.length ? ' ' + w.join(' ') : ''}`, ctx.grade || ctx.lesson ? `White Rose ${[ctx.grade && `grade ${ctx.grade}`, ctx.lesson && `lesson ${ctx.lesson}`].filter(Boolean).join(', ')}` : 'White Rose, every lesson', 'browser', 'ws-teacher-wrm', w, { needFlags: w.length ? ['grade', 'lesson'] : [] }));
        add(gate('teacher-flows', 'ws-teacher-flows', 'teacher flows (§2.9)', 'browser', 'ws-teacher-flows', []));
        add(gate('teacher-tokens', 'ws-teacher-tokens', 'teacher tokens (§2.8)', 'node', 'ws-teacher-tokens', []));
        add(gate('plain-words', 'ws-plain-words --check', 'plain-word db', 'node', 'ws-plain-words', ['--check']));
    }
    return rows;
}

/* ============================================================== run */
function runOne(g, ctx) {
    return new Promise((resolve) => {
        const node = /\.sh$/.test(g.file) ? ['bash', g.file] : [process.execPath, g.file];
        const cmd = g.kind === 'browser' ? [RUNNER, ...node, ...g.args] : [...node, ...g.args];
        const t0 = Date.now();
        const env = { ...process.env, MQ_BROWSER_WAIT_LOG: '1' };
        const child = spawn(cmd[0], cmd.slice(1), { cwd: ROOT, env });
        let out = '';
        child.stdout.on('data', (d) => { out += d; });
        child.stderr.on('data', (d) => { out += d; });
        const killer = setTimeout(() => { out += `\n${TOOL}: timed out after ${ctx.timeoutMin} min\n`; try { child.kill('SIGTERM'); } catch (e) { /* gone */ } }, ctx.timeoutMin * 60000);
        child.on('close', (code) => {
            clearTimeout(killer);
            const ms = Date.now() - t0;
            const w = /mq-browser-run: slot \d+ after (\d+)s/.exec(out);
            const logFile = path.join(ctx.logs, `${g.id}.log`);
            try { fs.writeFileSync(logFile, `$ ${cmd.map((c) => (/\s/.test(c) ? JSON.stringify(c) : c)).join(' ')}\n\n${out}`); } catch (e) { /* logs dir */ }
            resolve({ code: code == null ? 1 : code, out, ms, wait: w ? +w[1] : 0, cmd: cmd.map((c) => path.isAbsolute(c) && c.startsWith(ROOT) ? rel(c) : c).join(' '), logFile });
        });
    });
}

async function pool(items, n, fn) {
    const queue = items.slice();
    const workers = Array.from({ length: Math.max(1, n) }, async () => { while (queue.length) { const it = queue.shift(); await fn(it); } });
    await Promise.all(workers);
}

(async () => {
    const T0 = Date.now();
    const started = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const stamp = started.replace(/[-:]/g, '').replace('T', '-').replace('Z', '');

    if (has('help') || has('h') || ARGV.includes('-h')) {
        say(fs.readFileSync(__filename, 'utf8').split('\n').slice(1).filter((l) => l.startsWith('//')).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
        return;
    }
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
    const role = arg('role', null);
    const teacher = has('teacher');
    if (!wantSkills.length && !template && !role && !teacher) usage('give a scope: --skill, --template, --role or --teacher');

    const logs = path.resolve(arg('logs', `/tmp/mq-precritic/${stamp}-${process.pid}`));
    fs.mkdirSync(logs, { recursive: true });
    const ctx = { logs, template, role, teacher, grade: arg('grade', null), lesson: arg('lesson', null), timeoutMin: +arg('timeout', '90'), skills: [], roleSample: [] };

    // ---- scope: skills (validated against the live list), the template's skills, the role sample
    if (wantSkills.length || template) {
        const info = appSkills(template ? 'templates' : 'live');
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
            const tsk = info.live.filter((s) => {
                const seen = info.templates[s.key] || {};
                const top = Math.max(0, ...Object.values(seen));
                return (seen[template] || 0) > 0 && seen[template] === top;
            });
            if (!tsk.length) usage(`--template ${template}: no live skill draws with it`);
            pick.push(...tsk);
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
    const dirty = !!git(['status', '--porcelain', '--untracked-files=no']);
    const scopeLine = [ctx.skills.length && !template ? `--skill ${ctx.skills.map((s) => s.key).join(',')}` : '', template ? `--template ${template} (${ctx.skills.length} skills)` : '', role ? `--role ${role}` : '', teacher ? `--teacher${ctx.grade ? ` --grade ${ctx.grade}` : ''}${ctx.lesson ? ` --lesson ${ctx.lesson}` : ''}` : ''].filter(Boolean).join(' ');

    if (has('dry-run')) {
        say(`${TOOL} plan: ${scopeLine} on ${commit}${dirty ? '+dirty' : ''}`);
        for (const g of rows) say(`  [${g.kind}] ${g.name} — ${g.missing ? `SKIPPED-NOT-BUILT (${g.missing})` : `${g.kind === 'browser' ? RUNNER + ' ' : ''}node ${rel(g.file || '')} ${g.args.join(' ')}`.slice(0, 300)}`);
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
    const runnable = rows.filter((g) => !g.missing);
    process.stderr.write(`${TOOL}: ${runnable.length} gate(s) (${runnable.filter((g) => g.kind === 'browser').length} browser), logs ${logs}\n`);
    const doRun = async (g) => {
        const r = await runOne(g, ctx);
        const p = (g.parse || generic)(g, r.out, r.code);
        results.set(g.id, Object.assign(r, p));
        process.stderr.write(`  ${p.result.padEnd(15)} ${g.name} (${Math.round(r.ms / 1000)} s${r.wait ? `, waited ${r.wait} s for a slot` : ''})\n`);
    };
    await Promise.all([
        pool(runnable.filter((g) => g.kind === 'node'), +arg('node-jobs', '3'), doRun),
        pool(runnable.filter((g) => g.kind === 'browser'), +arg('browser-jobs', '2'), doRun),
    ]);

    // ---- table
    const finished = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const wall = Math.round((Date.now() - T0) / 1000);
    const table = [];
    table.push(`### ws-precritic — ${scopeLine}`);
    table.push('');
    table.push(`commit \`${commit}\`${dirty ? ' + uncommitted changes' : ''}${branch ? ` (${branch})` : ''} · started ${started} · finished ${finished} · wall ${wall} s · logs \`${logs}\``);
    table.push('');
    table.push('| Gate | Scope | Result | Findings vs baseline | Seconds |');
    table.push('|---|---|---|---|---|');
    const outRows = [];
    for (const g of rows) {
        const r = results.get(g.id);
        const row = g.missing
            ? { id: g.id, gate: g.name, scope: g.scope, result: 'SKIPPED-NOT-BUILT', findings: g.missing, seconds: null, wait: 0, cmd: null, exit: null, detail: [], log: null }
            : { id: g.id, gate: g.name, scope: g.scope, result: r.result, findings: r.findings, seconds: Math.round(r.ms / 1000), wait: r.wait, cmd: r.cmd, exit: r.code, detail: r.detail || [], log: r.logFile };
        outRows.push(row);
        const secs = row.seconds == null ? '-' : `${row.seconds}${row.wait ? ` (${row.wait} waiting)` : ''}`;
        const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
        table.push(`| ${esc(row.gate)} | ${esc(row.scope)} | ${row.result} | ${esc(row.findings)} | ${secs} |`);
    }
    const failed = outRows.filter((r) => r.result === 'FAIL');
    const notBuilt = outRows.filter((r) => r.result === 'SKIPPED-NOT-BUILT');
    if (failed.length) {
        table.push('');
        table.push('Failing rows (first lines; the full output is in the log):');
        for (const r of failed) {
            table.push(`- **${r.gate}** (exit ${r.exit}, \`${r.log}\`); rerun alone: \`${r.cmd}\``);
            for (const d of r.detail.slice(0, 10)) table.push(`  - \`${String(d).trim().slice(0, 220).replace(/`/g, "'")}\``);
        }
    }
    const ids = (list) => list.map((r) => r.id).join(', ');
    const na = outRows.filter((r) => r.result === 'N/A');
    const naNote = na.length ? `; ${na.length} N/A (ran, nothing to check): ${ids(na)}` : '';
    let verdict, exit;
    if (failed.length) { verdict = `FAIL (${failed.length} gate(s): ${ids(failed)}${notBuilt.length ? `; SKIPPED-NOT-BUILT: ${ids(notBuilt)}` : ''})`; exit = 1; }
    else if (notBuilt.length && has('strict')) { verdict = `FAIL (incomplete, --strict: every built gate is green; ${notBuilt.length} SKIPPED-NOT-BUILT: ${ids(notBuilt)})`; exit = 3; }
    else if (notBuilt.length) { verdict = `OK on ${outRows.length - notBuilt.length} of ${outRows.length} gates; ${notBuilt.length} SKIPPED-NOT-BUILT (not run, not passed): ${ids(notBuilt)}${naNote}`; exit = 0; }
    else { verdict = `OK${naNote ? ` (${naNote.slice(2)})` : ''}`; exit = 0; }
    table.push('');
    table.push(`${TOOL}: ${verdict}`);
    say('\n' + table.join('\n'));

    if (has('json')) {
        fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({
            tool: TOOL, commit, branch, dirty, started, finished, wallSeconds: wall, args: ARGV, scope: scopeLine, logs,
            baselines: { printLint: fs.existsSync(PRINT_BASE) ? rel(PRINT_BASE) : null, screenSlots: fs.existsSync(SLOTS_BASE) ? rel(SLOTS_BASE) : null },
            skills: ctx.skills.map((s) => s.key), roleSample: ctx.roleSample, rows: outRows, verdict, markdown: table.join('\n'),
        }, null, 1) + '\n');
    }
    process.exit(has('report-only') ? 0 : exit);
})().catch((e) => { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL (error)`); process.exit(1); });
