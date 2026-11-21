#!/usr/bin/env node
// ws-pace.cjs — builds data/pace/pace.json, the data behind pace.html (the owner's weekly pace board, 2026-11-21).
//
//   node tests/scripts/ws-pace.cjs --write     # rebuild data/pace/pace.json from git history + the repo's records
//   node tests/scripts/ws-pace.cjs --check     # GATE: the file parses, has every finished week, and its numbers for the
//                                              # finished weeks match what git says (a stale or hand-edited board fails)
//   node tests/scripts/ws-pace.cjs --self-test # the week maths and the log classifier on planted inputs (no git)
//
// A week runs from the usage reset, Thursday 22:00 UTC, to the next one. Each finished week is measured at the last
// master commit before its end; the current week at HEAD. Sources, all in the repo:
//   live skills        js/modules/data.js (every { v: ... } skill entry, tombstones included: share codes never shrink)
//   redesign passed    js/modules/redesign-passed.js (the ONE place, CLAUDE.md)
//   automatic checks   tests/scripts/ws-* gate files; tests/fixtures/precritic/backtests.json rows (each check proved to
//                      FAIL on the bad state and PASS on the fix); design/lessons-first/CHECKS_FROM_CRITICS.md ledger rows
//   lessons            design/audit/baselines/lesson-baseline.json (every lesson the app prints, pinned)
//   White Rose steps   design/WRM_COVERAGE.md (covered / partial / gap, per year)
//   weekly log         design/STATUS.md dated "## YYYY-MM-DD — ..." sections, else master's STATUS / Merge commits
//   usage              data/pace/usage.json (typed in weekly by the lead: % of the weekly limit, and whether estimated)
// Prints `ws-pace: OK` / `ws-pace: FAIL` (the gate-output convention).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'data', 'pace', 'pace.json');
const USAGE = path.join(ROOT, 'data', 'pace', 'usage.json');
const FIRST_WEEK = Date.UTC(2026, 9, 15, 22, 0); // Thu 2026-10-15 22:00 UTC: the first reset in the program's records
const WEEK = 7 * 24 * 3600 * 1000;
const FROZEN = ['wrm', 'grades', 'lessonsPassed', 'lessonsPending', 'lessonsPassedSource', 'todoChecks'];
const arg = (k) => process.argv.includes(k);

function weekStarts(nowMs) {
    const out = [];
    for (let t = FIRST_WEEK; t <= nowMs; t += WEEK) out.push(t);
    return out;
}
function iso(ms) { return new Date(ms).toISOString().slice(0, 10); }
function weekOf(dateStr) { // a YYYY-MM-DD (taken at noon UTC) -> the start of its week
    const t = Date.parse(dateStr + 'T12:00:00Z');
    if (t < FIRST_WEEK) return null;
    return FIRST_WEEK + Math.floor((t - FIRST_WEEK) / WEEK) * WEEK;
}
const KINDS = [
    ['fix', /\bbug ?fix|^fix\b|^fix:|\bhotfix|regression|crash/i],
    ['lesson', /\blesson|Y\d\.B\d+\.S\d+|\bWRM\b|I do|player/i],
    ['skill', /\bskill|redesign|preset|famil(y|ies)|facts?\b|patterns?|vocab|place ?value|\bpv\b|fraction|multipl|divis|subtract|addition|two-step|rounding/i],
    ['feature', /worksheets?|browser|print|screen|student|teacher|quiz|skip|explorer|options|mixed review|my worksheets/i],
    ['check', /\bcheck|gate|tool|ledger|\bws-|backtest|precritic|baseline|critic/i],
];
function kindOf(title) { for (const [k, re] of KINDS) if (re.test(title)) return k; return 'other'; }

function sh(cmd) { return execSync(cmd, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] }); }
function show(rev, p) {
    if (rev === 'WORKTREE') { try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch { return null; } }
    try { return sh(`git show ${rev}:${p}`); } catch { return null; }
}

function measure(rev, live) {
    const data = show(rev, 'js/modules/data.js') || '';
    const skills = (data.match(/\{\s*v:\s*["']/g) || []).length;
    const rp = show(rev, 'js/modules/redesign-passed.js') || '';
    const passed = new Set(rp.match(/'[a-z_0-9]+:[a-z_0-9]+'/g) || []).size;
    let gates = 0;
    try { gates = sh(`git ls-tree --name-only ${rev} tests/scripts/`).split('\n').filter((f) => /\/ws-[^/]+\.(c|m)?js$/.test(f)).length; } catch {}
    let backtests = 0;
    try { const j = JSON.parse(show(rev, 'tests/fixtures/precritic/backtests.json') || 'null'); backtests = j ? (Array.isArray(j) ? j.length : (j.rows || []).length || Object.keys(j).length) : 0; } catch {}
    const led = show(rev, 'design/lessons-first/CHECKS_FROM_CRITICS.md') || '';
    const ledger = (led.match(/^\| 20\d\d-\d\d-\d\d/gm) || []).length;
    let lessons = null;
    try {
        const k = JSON.parse(show(rev, 'design/audit/baselines/lesson-baseline.json') || 'null');
        if (k) { const h = k.hashes || k; const ids = new Set(); for (const x of Object.keys(h)) { const p = x.split('/'); ids.add(p[0] === 'detailed' ? p[0] + '/' + p[1] : p[0]); } lessons = ids.size; }
    } catch {}
    const lp = lessonsPassed(rev);
    const cov = show(live ? 'WORKTREE' : rev, 'design/WRM_COVERAGE.md') || '';
    const m = cov.match(/Covered (\d+) \((\d+)%\), partial only (\d+) \(\d+%\), gap (\d+)/);
    const wrm = m ? { covered: +m[1], partial: +m[3], gap: +m[4], total: +m[1] + +m[3] + +m[4] } : null;
    const gr = grades(cov);
    return { rev: rev.slice(0, 9), skills, passed, gates, backtests, ledger, lessons, lessonsPassed: lp.passed, lessonsPending: lp.pending, lessonsPassedSource: lp.source, wrm, grades: gr };
}
// Whole lessons at 8/10 live in js/modules/lessons-passed.js (the ONE place, owner 2026-11-19). Until that file reaches
// master it is read from the lessons-browser branch and marked so; a week before either exists counts null.
const LP_BRANCH = 'origin/claude/sweet-newton-c8wrv1-lf-tools-lessons';
function lessonsPassed(rev) {
    let src = show(rev, 'js/modules/lessons-passed.js'), source = 'master';
    if (!src && rev === sh('git rev-parse HEAD').trim()) { src = show(LP_BRANCH, 'js/modules/lessons-passed.js'); source = src ? 'lessons-browser branch (not live yet)' : null; }
    if (!src) return { passed: null, pending: null, source: null };
    const block = (name) => { const i = src.indexOf(name); if (i < 0) return ''; const j = src.indexOf(']);', i); return src.slice(i, j); };
    const ids = (b) => (b.match(/^\s*\['[a-zA-Z0-9:._-]+',/gm) || []).length;
    return { passed: ids(block('LESSONS_PASSED = new Map(')), pending: ids(block('PENDING_RECHECK = new Map(')), source };
}
function grades(cov) {
    const rows = [];
    for (const l of (cov || '').split('\n')) {
        const m = l.match(/^\| (Reception|Year \d) \| (\w+) \| \d+ \| (\d+) \| (\d+) \(\d+%\) \| (\d+) \| (\d+) \|$/);
        if (m) rows.push({ year: m[1], grade: m[2] === 'PK' ? 'PK' : m[2] === 'K' ? 'K' : 'Grade ' + m[2], steps: +m[3], covered: +m[4], partial: +m[5], gap: +m[6] });
    }
    return rows;
}
function todoChecks(md) { // the LAST "Checks proposed but not yet on master" table in design/status/speed-audit.md
    const parts = (md || '').split(/^#+ Checks proposed but not yet on master[^\n]*$/m);
    if (parts.length < 2) return [];
    const rows = [];
    for (const l of parts[parts.length - 1].split('\n')) {
        if (/^#/.test(l)) break;
        const c = l.split('|').map((x) => x.trim());
        if (c.length < 5 || /^-+$/.test(c[1]) || c[1] === 'check') continue;
        rows.push({ check: c[1].replace(/`/g, ''), owner: c[2], where: c[3].replace(/`/g, '') });
    }
    return rows;
}
function logFor(starts, headRev) {
    const log = {};
    for (const s of starts) log[iso(s)] = [];
    const status = show(headRev, 'design/STATUS.md') || '';
    const secs = status.split(/^## /m).slice(1);
    for (const sec of secs) {
        const m = sec.match(/^(20\d\d-\d\d-\d\d) — ([^\n]+)\n?([\s\S]*)/);
        if (!m) continue;
        const w = weekOf(m[1]); if (w == null || !log[iso(w)]) continue;
        const first = (m[3].split('\n').find((l) => /^- /.test(l)) || '').replace(/^- /, '').trim();
        if (log[iso(w)].some((x) => x.date === m[1] && x.title === m[2].trim())) continue;
        log[iso(w)].push({ date: m[1], title: m[2].trim(), detail: first.slice(0, 400), kind: kindOf(m[2]), from: 'STATUS.md' });
    }
    for (const s of starts) {
        const key = iso(s);
        if (log[key].length) continue;
        let lines = [];
        try { lines = sh(`git log ${headRev} --since=@${s / 1000} --until=@${(s + WEEK) / 1000} --format=%ad%x09%s --date=short`).split('\n').filter(Boolean); } catch {}
        const seen = new Set();
        for (const l of lines) {
            const [date, subj] = l.split('\t');
            if (!/^(STATUS|Deploy)/i.test(subj)) continue;
            const t = subj.replace(/^STATUS:\s*/i, '').slice(0, 160);
            if (seen.has(t)) continue; seen.add(t);
            log[key].push({ date, title: t, detail: '', kind: kindOf(t), from: 'git' });
        }
    }
    for (const k of Object.keys(log)) log[k].sort((a, b) => (a.date < b.date ? 1 : -1));
    return log;
}
function checksByWeek(starts, headRev) {
    const led = show('WORKTREE', 'design/lessons-first/CHECKS_FROM_CRITICS.md') || '';
    const by = {};
    for (const s of starts) by[iso(s)] = 0;
    for (const m of led.matchAll(/^\| (20\d\d-\d\d-\d\d)/gm)) { const w = weekOf(m[1]); if (w != null && by[iso(w)] != null) by[iso(w)]++; }
    return by;
}

function build(nowMs) {
    const head = sh('git rev-parse HEAD').trim();
    const starts = weekStarts(nowMs);
    let prevFile = {};
    try { prevFile = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
    let usage = {};
    try { usage = JSON.parse(fs.readFileSync(USAGE, 'utf8')); } catch {}
    const weeks = starts.map((s) => {
        const end = s + WEEK;
        const done = end <= nowMs;
        let rev = head;
        if (done) { try { rev = sh(`git rev-list -1 --before=@${end / 1000} ${head}`).trim() || head; } catch {} }
        const u = usage[iso(s)] || null;
        const w = { start: iso(s), end: iso(end), done, usagePct: u ? u.pct : null, usageEstimated: u ? !!u.estimated : null, ...measure(rev, !done) };
        if (!done) w.todoChecks = todoChecks(show('WORKTREE', 'design/status/speed-audit.md')).length;
        const old = (prevFile.weeks || []).find((x) => x.start === w.start);
        // A finished week keeps what was measured live while it ran (White Rose coverage is regenerated live each run, the
        // committed report can lag): FROZEN fields are copied from the board as it stood, never recomputed from git.
        if (done && old) for (const k of FROZEN) if (old[k] !== undefined && old[k] !== null) w[k] = old[k];
        return w;
    });
    const ledgerByWeek = checksByWeek(starts, head);
    weeks.forEach((w, i) => {
        const prev = weeks[i - 1];
        w.ledgerAdded = ledgerByWeek[w.start] || 0;
        w.added = prev ? { skills: w.skills - prev.skills, passed: w.passed - prev.passed, gates: w.gates - prev.gates, backtests: w.backtests - prev.backtests, lessons: (w.lessons != null && prev.lessons != null) ? w.lessons - prev.lessons : null, lessonsPassed: (w.lessonsPassed != null && prev.lessonsPassed != null) ? w.lessonsPassed - prev.lessonsPassed : null, wrmCovered: (w.wrm && prev.wrm) ? w.wrm.covered - prev.wrm.covered : 0 } : null;
    });
    return {
        generated: new Date(nowMs).toISOString(),
        head: head.slice(0, 9),
        weeks,
        grades: grades(show('WORKTREE', 'design/WRM_COVERAGE.md')),
        todoChecks: todoChecks(show('WORKTREE', 'design/status/speed-audit.md')),
        log: logFor(starts, head),
    };
}

function selfTest() {
    let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('  FAIL ' + m); } };
    ok(iso(weekOf('2026-11-20')) === '2026-11-19', 'Fri 11-20 is in the week of Thu 11-19');
    ok(iso(weekOf('2026-11-19')) === '2026-11-12', 'Thu 11-19 noon is before the 22:00 reset: week of 11-12');
    ok(weekOf('2026-10-01') == null, 'before the first week: none');
    ok(weekStarts(Date.UTC(2026, 10, 21)).length === 6, 'six weeks by 11-21');
    ok(kindOf('Bug fix: ws-content-audit loads the whole tree') === 'fix', 'bug fix -> fix');
    ok(kindOf('Deploy lesson player slice 1') === 'lesson', 'player -> lesson');
    ok(kindOf('Deploy patterns r4 PASS') === 'skill', 'patterns -> skill');
    ok(kindOf('Deploy My Worksheets') === 'feature', 'My Worksheets -> feature');
    ok(kindOf('Deploy ws-merge-master (lf-checks)') === 'check', 'ws- tool -> check');
    console.log(bad ? `ws-pace self-test: FAIL (${bad})` : 'ws-pace self-test: OK (9 cases)');
    process.exit(bad ? 1 : 0);
}

if (arg('--self-test')) selfTest();
const now = Date.now();
if (arg('--write')) {
    const d = build(now);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(d, null, 1) + '\n');
    const cur = d.weeks[d.weeks.length - 1];
    console.log(`ws-pace: OK (wrote ${path.relative(ROOT, OUT)}: ${d.weeks.length} weeks, ${Object.values(d.log).reduce((a, l) => a + l.length, 0)} log items; now ${cur.skills} skills, ${cur.passed} redesign-passed, ${cur.gates} gates, ${cur.backtests} backtests)`);
} else if (arg('--check')) {
    const fails = [];
    let have = null;
    try { have = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) { fails.push('data/pace/pace.json missing or not JSON: run --write'); }
    if (have) {
        const want = build(now);
        const finished = want.weeks.filter((w) => w.done);
        for (const w of finished) {
            const h = (have.weeks || []).find((x) => x.start === w.start);
            if (!h) { fails.push(`week of ${w.start} is finished but not on the board: run --write`); continue; }
            if (!h.done) { fails.push(`week of ${w.start} is still marked in progress: run --write`); continue; }
            for (const k of ['skills', 'passed', 'gates', 'backtests', 'ledger', 'lessons']) if (h[k] !== w[k]) fails.push(`week of ${w.start}: ${k} ${h[k]} on the board, ${w[k]} in git`);
        }
        for (const w of (have.weeks || [])) if (w.usagePct == null && w.done) console.log(`  note: week of ${w.start} has no usage figure (data/pace/usage.json)`);
    }
    for (const f of fails) console.log('  FAIL ' + f);
    console.log(fails.length ? `ws-pace: FAIL (${fails.length})` : `ws-pace: OK (${have.weeks.length} weeks; every finished week on the board and matching git)`);
    process.exit(fails.length ? 1 : 0);
} else {
    console.log('usage: node tests/scripts/ws-pace.cjs --write | --check | --self-test');
}
