#!/usr/bin/env node
// ws-merge-master — merge origin/master into the current lane branch the way the lanes have been doing it by hand
// (lead 2026-11-14: most of a day's lost deploy time was merge conflicts in the shared, append-only files).
//
//   node tests/scripts/ws-merge-master.mjs              fetch + merge origin/master (no commit), resolve the shared files,
//                                                       regenerate the generated reports, run ws-conflict-markers
//   node tests/scripts/ws-merge-master.mjs --commit     ... and commit the merge when nothing is left unresolved; REFUSED
//                                                       (exit 2) unless MQ_COMMIT_TRAILER="<the lane's attribution lines>"
//   node tests/scripts/ws-merge-master.mjs --ref <r>    merge another ref (default origin/master)
//   node tests/scripts/ws-merge-master.mjs --self-test [--target <copy of this script>]
//                                                       the pure merges on planted inputs, then small git fixtures (in a temp
//                                                       dir, removed after) that run the target: this file, or another copy
//                                                       (ws-backtest: {root}/tests/scripts/ws-merge-master.mjs)
//
// It works on the git work tree of the CURRENT directory, never the tree the script file lives in; outside a git work
// tree it FAILS (exit 2). Resolution, per conflicted file:
//   tests/fixtures/precritic/backtests.json   3-way merge BY ROW ID: master's rows in master's order (a row only this
//                                             branch changed takes this branch's version), then this branch's new rows.
//                                             A row both sides changed differently, or ADDED with the same id and
//                                             different content, is a CONFLICT: both versions are written between
//                                             conflict markers, the file stays unmerged (git will not commit it), exit 1.
//                                             No row of the base or of either side is ever dropped; a side that deleted
//                                             the file counts as empty. Written indent 1, UTF-8, so untouched rows stay
//                                             byte-identical. After the merge, a duplicate row id is a FAIL.
//   UNION files (append-only ledgers / notes)  a TRUE 3-way merge per hunk, from the merge base (git's :1: stage): lines
//                                             only added on either side are kept, master's first; a line one side
//                                             deleted stays deleted; a line both sides changed differently (a table row
//                                             with the same first cell and different text, or a prose line both sides
//                                             replaced) is a CONFLICT left in the file with markers, unmerged, exit 1.
//                                             design/lessons-first/CHECKS_FROM_CRITICS.md, design/decisions/LEAD_DECISIONS.md,
//                                             design/status/*.md (a lane's own note, speed-audit.md, metrics.md)
//   GENERATED reports                         master's copy, re-run the generator (node, no browser), then staged; only
//                                             when nothing else is left (a report is never built from conflicted sources)
//   anything else                             left as a conflict for the lane to resolve (listed; exit 1)
// It never edits design/STATUS.md, never pushes, and never force-anything.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const TOOL = 'ws-merge-master';
const SELF = fileURLToPath(import.meta.url);
export const BACKTESTS = 'tests/fixtures/precritic/backtests.json';
export const UNION = [/^design\/lessons-first\/CHECKS_FROM_CRITICS\.md$/, /^design\/decisions\/LEAD_DECISIONS\.md$/, /^design\/status\/[^/]+\.md$/];
export const NEVER = ['design/STATUS.md'];
// generated report -> the node command that rewrites it from the merged sources
export const GENERATED = {
    'design/lessons-first/QUEUE.md': ['tests/scripts/ws-lessons-first-queue.cjs'],
    'design/lessons-first/queue.json': ['tests/scripts/ws-lessons-first-queue.cjs'],
    'design/lessons-first/BUILD_QUEUE.md': ['tests/scripts/ws-lessons-first-queue.cjs', '--build-only'],
    'design/STANDARDS_COVERAGE.md': ['tests/scripts/ws-standards.cjs', '--report'],
    'design/BUILD_LIST.md': ['tests/scripts/ws-standards.cjs', '--report'],
    'design/WRM_COVERAGE.md': ['tests/scripts/ws-wrm.cjs', '--report-only'],
};
// built from parts so this file never holds a marker line itself
const LT = '<'.repeat(7), GT = '>'.repeat(7), EQ = '='.repeat(7), BAR = '|'.repeat(7);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** 3-way row merge of backtests.json documents (a missing side = null = no rows). Returns {doc, conflicts[], pairs{}, dropped[]}. Pure. */
export function mergeRows(base, ours, theirs) {
    const E = { rows: [] };
    base = base || E; const oursDoc = ours || E, theirsDoc = theirs || E;
    const B = new Map(base.rows.map((r) => [r.id, r])), O = new Map(oursDoc.rows.map((r) => [r.id, r]));
    const conflicts = [], pairs = {};
    const clash = (o, t) => { conflicts.push(t.id); pairs[t.id] = { ours: o, theirs: t }; return t; };
    const out = theirsDoc.rows.map((t) => {
        const b = B.get(t.id), o = O.get(t.id);
        if (!b) return o && !same(o, t) ? clash(o, t) : t;   // added on both sides with different content: the lane decides
        if (!o || same(o, b)) return t;                      // only master changed it (or nobody did, or this branch deleted it)
        if (same(t, b) || same(t, o)) return o;              // only this branch changed it
        return clash(o, t);                                  // both changed it differently: the lane decides
    });
    const have = new Set(out.map((r) => r.id));
    for (const o of oursDoc.rows) if (!have.has(o.id) && !B.has(o.id)) { out.push(o); have.add(o.id); }   // this branch's new rows
    // a base row one side deleted is NOT dropped silently
    const dropped = [...B.keys()].filter((id) => !have.has(id));
    for (const id of dropped) { out.push(O.get(id) || B.get(id)); have.add(id); }
    const meta = theirs || ours || base;
    const doc = { ...meta, rows: out };
    if (ours && theirs && !same(ours.about, theirs.about) && same(theirs.about, base.about)) doc.about = ours.about;
    return { doc, conflicts, pairs, dropped };
}
/** The file text: indent 1; a conflicted row is written as both versions between conflict markers. Pure. */
export function serialise(doc, pairs = {}, ref = 'master') {
    const ids = Object.keys(pairs);
    if (!ids.length) return JSON.stringify(doc, null, 1) + '\n';
    const rows = doc.rows.map((r) => (r.id in pairs ? `@@MQ-CONFLICT@@${ids.indexOf(r.id)}` : r));
    const text = JSON.stringify({ ...doc, rows }, null, 1) + '\n';
    return text.replace(/^( *)"@@MQ-CONFLICT@@(\d+)"(,?)$/gm, (m, ind, n, comma) => {
        const p = pairs[ids[n]], row = (r) => JSON.stringify(r, null, 1).split('\n').map((l) => ind + l).join('\n') + comma;
        return `${LT} HEAD (this branch)\n${row(p.ours)}\n${EQ}\n${row(p.theirs)}\n${GT} ${ref} (row ${ids[n]}: changed on both sides)`;
    });
}

const keyOf = (l) => { const m = /^\|\s*([^|]*?)\s*\|/.exec(l); return m && m[1] && !/^:?-+:?$/.test(m[1]) ? m[1] : null; };
const counts = (a) => a.reduce((m, l) => m.set(l, (m.get(l) || 0) + 1), new Map());
/** One diff3 hunk (ours, base, theirs as line arrays) -> {lines} or {conflict: why}. Pure. */
export function mergeHunk(O, B, T) {
    const cB = counts(B), cO = counts(O), cT = counts(T);
    const added = (S) => { const rem = new Map(cB); return S.filter((l) => { if (rem.get(l) > 0) { rem.set(l, rem.get(l) - 1); return false; } return true; }); };
    const aO = added(O).filter((l) => l.trim()), aT = added(T).filter((l) => l.trim());
    // a line both sides deleted AND replaced differently is a conflict: a prose line, or a table row whose first cell
    // (its key) both sides re-added with different text; rows only ADDED share keys freely (a ledger's date column)
    const bothDel = [...cB.keys()].filter((l) => l.trim() && (cO.get(l) || 0) < cB.get(l) && (cT.get(l) || 0) < cB.get(l));
    const setT = new Set(aT), differ = aO.some((l) => !setT.has(l)) && aT.length;
    if (differ) for (const l of bothDel) {
        const k = keyOf(l);
        if (!k) return { conflict: `line "${l.slice(0, 60)}" replaced differently on both sides` };
        const kO = aO.filter((x) => keyOf(x) === k), kT = aT.filter((x) => keyOf(x) === k);
        if (kO.length && kT.length && !same(kO, kT)) return { conflict: `row "${k}" changed differently on both sides` };
    }
    // master's side, less the base lines this branch deleted; then this branch's added lines master does not already have
    const drop = new Map([...cB].map(([l, n]) => [l, l.trim() ? Math.max(0, n - (cO.get(l) || 0)) : 0]));
    const lines = T.filter((l) => { if (drop.get(l) > 0) { drop.set(l, drop.get(l) - 1); return false; } return true; });
    const rem = new Map(cB), inT = new Set(T);
    for (const l of O) { if (rem.get(l) > 0) { rem.set(l, rem.get(l) - 1); continue; } if (!l.trim() || !inT.has(l)) lines.push(l); }
    return { lines };
}
/** Resolve every hunk of `git merge-file --diff3 --marker-size=<size>` output. Returns {text, hunks, conflicts[]}. Pure. */
export function union3(text, size = 19, ref = 'master') {
    const mk = (c) => c.repeat(size);
    const src = text.split('\n'), out = [], conflicts = [];
    let hunks = 0;
    for (let i = 0; i < src.length; i++) {
        if (!src[i].startsWith(mk('<'))) { out.push(src[i]); continue; }
        const sec = { o: [], b: null, t: [] }; let cur = sec.o; i++;
        for (; i < src.length && !src[i].startsWith(mk('>')); i++) {
            if (src[i].startsWith(mk('|'))) { sec.b = []; cur = sec.b; } else if (src[i] === mk('=')) cur = sec.t; else cur.push(src[i]);
        }
        hunks++;
        const r = sec.b ? mergeHunk(sec.o, sec.b, sec.t) : { conflict: 'no merge base for this hunk' };
        if (r.lines) { out.push(...r.lines); continue; }
        conflicts.push(r.conflict);
        out.push(`${LT} HEAD (this branch)`, ...sec.o, `${BAR} merge base`, ...(sec.b || []), EQ, ...sec.t, `${GT} ${ref} (${r.conflict})`);
    }
    return { text: out.join('\n'), hunks, conflicts };
}

export function run(argv, cwd) {
    const args = argv, has = (k) => args.includes(k);
    const val = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
    if (has('--self-test')) return selfTest(resolve(val('--target', SELF)));
    if (has('--commit') && !String(process.env.MQ_COMMIT_TRAILER || '').trim()) { console.log(`${TOOL}: FAIL (--commit refused: set MQ_COMMIT_TRAILER to your lane's attribution lines)`); return 2; }
    let ROOT;
    try { ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { ROOT = ''; }
    if (!ROOT) { console.log(`${TOOL}: FAIL (${cwd} is not inside a git work tree: run it from the lane's checkout; nothing was merged)`); return 2; }
    const git = (a, opts = {}) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    const tryGit = (a) => { try { return git(a); } catch { return null; } };
    const ref = val('--ref', 'origin/master');
    if (git(['status', '--porcelain', '--untracked-files=no']).trim()) { console.log(`${TOOL}: FAIL (the working tree has uncommitted changes: commit or stash them first)`); return 2; }
    if (ref.startsWith('origin/')) { const r = spawnSync('git', ['fetch', '-q', 'origin', ref.slice(7)], { cwd: ROOT, encoding: 'utf8' }); if (r.status) { console.log(`${TOOL}: FAIL (git fetch: ${r.stderr.trim()})`); return 2; } }
    const head = git(['rev-parse', '--short=9', 'HEAD']).trim(), tip = git(['rev-parse', '--short=9', ref]).trim();
    const base = git(['merge-base', 'HEAD', ref]).trim();
    if (git(['rev-parse', ref]).trim() === base) { console.log(`${TOOL}: OK (already contains ${ref} ${tip}; nothing to merge)`); return 0; }
    const mg = spawnSync('git', ['merge', '--no-commit', '--no-ff', ref], { cwd: ROOT, encoding: 'utf8' });
    const conflicted = git(['diff', '--name-only', '--diff-filter=U']).split('\n').filter(Boolean);
    console.log(`${TOOL}: merging ${ref} ${tip} into ${head} (base ${base.slice(0, 9)}): ${conflicted.length} conflicted file(s)`);
    const left = [], regen = new Map(), done = new Set();
    for (const f of conflicted) {
        try {
            if (NEVER.includes(f)) { left.push(`${f} (never edited by a lane)`); continue; }
            if (f === BACKTESTS) {
                const side = (st) => { const t = tryGit(['show', `:${st}:${f}`]); return t == null ? null : JSON.parse(t); };
                const [b, o, t] = [side(1), side(2), side(3)];
                const m = mergeRows(b, o, t);
                writeFileSync(resolve(ROOT, f), serialise(m.doc, m.pairs, ref));
                console.log(`  rows   ${f}: ${m.doc.rows.length} rows${!o || !t ? `; ${!o ? 'this branch' : 'master'} deleted the file (counted as empty)` : ''}${m.dropped.length ? `; kept ${m.dropped.length} row(s) one side deleted: ${m.dropped.join(', ')}` : ''}`);
                if (m.conflicts.length) { left.push(`${f} rows changed or added differently on both sides: ${m.conflicts.join(', ')} (both versions are in the file between markers; pick one, then git add)`); continue; }
                git(['add', f]); done.add('backtests by row id'); continue;
            }
            if (UNION.some((re) => re.test(f))) {
                const st = (n) => tryGit(['show', `:${n}:${f}`]);
                const [b, o, t] = [st(1) ?? '', st(2), st(3)];
                if (o == null || t == null) { left.push(`${f} (deleted on one side, edited on the other)`); continue; }
                const dir = mkdtempSync(join(tmpdir(), 'mm-union-'));
                try {
                    for (const [n, s] of [['o', o], ['b', b], ['t', t]]) writeFileSync(join(dir, n), s);
                    const r = spawnSync('git', ['merge-file', '-p', '--diff3', '--marker-size=19', '-L', 'ours', '-L', 'base', '-L', 'theirs', join(dir, 'o'), join(dir, 'b'), join(dir, 't')], { encoding: 'utf8', maxBuffer: 1 << 28 });
                    if (r.status < 0 || r.status == null || r.error) throw new Error(`git merge-file: ${r.stderr || r.error}`);
                    const u = union3(r.stdout, 19, ref);
                    writeFileSync(resolve(ROOT, f), u.text);
                    console.log(`  union  ${f}: ${u.hunks} hunk(s)${u.conflicts.length ? `, ${u.conflicts.length} left with markers` : ''}`);
                    if (u.conflicts.length) { left.push(`${f}: ${u.conflicts.join('; ')} (markers in the file; resolve, then git add)`); continue; }
                    git(['add', f]); done.add('ledgers and status 3-way'); continue;
                } finally { rmSync(dir, { recursive: true, force: true }); }
            }
            if (GENERATED[f]) { git(['checkout', '--theirs', '--', f]); regen.set(GENERATED[f].join(' '), GENERATED[f]); console.log(`  regen  ${f}: master's copy, regenerated below`); continue; }
            left.push(f);
        } catch (e) { left.push(`${f} (could not be resolved: ${String(e.message || e).split('\n')[0]})`); }
    }
    if (regen.size && left.length) {
        for (const [label] of regen) left.push(`generated reports NOT regenerated (sources still conflicted): resolve the items above, then run node ${label} and git add its reports`);
    } else for (const [label, cmd] of regen) {
        const r = spawnSync(process.execPath, cmd, { cwd: ROOT, encoding: 'utf8', timeout: 300000 });   // the merged tree's own generator
        console.log(`  regen  node ${label}: ${r.status === 0 ? 'OK' : `exit ${r.status}`}`);
        if (r.status !== 0) { left.push(`regenerate: node ${label} failed`); continue; }
        for (const g of Object.keys(GENERATED)) if (GENERATED[g].join(' ') === label && existsSync(resolve(ROOT, g))) git(['add', g]);
        done.add('reports regenerated');
    }
    // the merged backtests must hold each row id once, however the file merged (a clean textual merge can duplicate one)
    if (!left.some((l) => l.startsWith(BACKTESTS)) && existsSync(resolve(ROOT, BACKTESTS))) {
        try {
            const ids = JSON.parse(readFileSync(resolve(ROOT, BACKTESTS), 'utf8')).rows.map((r) => r.id);
            const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
            if (dup.length) left.push(`${BACKTESTS}: duplicate row id(s) after the merge: ${dup.join(', ')}`);
        } catch (e) { left.push(`${BACKTESTS}: not valid JSON after the merge (${e.message})`); }
    }
    // conflict markers: the merged tree's own ws-conflict-markers, else this script's sibling pointed at the merged tree
    const own = resolve(ROOT, 'tests/scripts/ws-conflict-markers.mjs'), sib = resolve(dirname(SELF), 'ws-conflict-markers.mjs');
    const cmArgs = existsSync(own) ? [own] : existsSync(sib) ? [sib, '--root', ROOT] : null;
    if (cmArgs) {
        const cm = spawnSync(process.execPath, cmArgs, { cwd: ROOT, encoding: 'utf8', env: { ...process.env, MQ_ROOT: ROOT } });
        console.log(`  ${String(cm.stdout || '').trim().split('\n').pop()}`);
        if (cm.status !== 0) left.push('conflict markers remain (ws-conflict-markers)');
    } else {
        const g = spawnSync('git', ['grep', '-n', '-E', `^(${LT}|${GT})( |$)`], { cwd: ROOT, encoding: 'utf8' });
        const n = String(g.stdout || '').split('\n').filter(Boolean).length;
        console.log(`  conflict markers (git grep): ${n ? `FAIL - ${n} marker line(s)` : 'OK'}`);
        if (n) left.push('conflict markers remain');
    }
    if (mg.status !== 0 && !conflicted.length) left.push(`git merge: ${(mg.stderr || mg.stdout).trim().split('\n').pop()}`);
    if (left.length) { for (const l of left) console.log(`  LEFT   ${l}`); console.log(`${TOOL}: FAIL (${left.length} item(s) left for the lane; the merge is NOT committed)`); return 1; }
    if (has('--commit')) {
        git(['commit', '-q', '-m', `Merge ${ref} ${tip} (ws-merge-master: ${done.size ? [...done].join(', ') : 'clean merge'})\n\n${process.env.MQ_COMMIT_TRAILER.trim()}`]);
        console.log(`${TOOL}: OK (merged and committed ${git(['rev-parse', '--short=9', 'HEAD']).trim()}; push it yourself)`);
    } else console.log(`${TOOL}: OK (merged, resolved, NOT committed: review, then git commit)`);
    return 0;
}

// ---------------------------------------------------------------- self-test
function selfTest(target) {
    const bad = []; let n = 0;
    const eq = (name, got, want) => { n++; if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); else console.log(`  ok   ${name}`); };
    const r = (id, v) => ({ id, v });
    // pure: the original 7
    const base = { about: 'a', rows: [r('x', 1), r('y', 1), r('z', 1)] };
    const ours = { about: 'a', rows: [r('x', 2), r('y', 1), r('z', 1), r('o', 1)] };
    const theirs = { about: 'a', rows: [r('x', 1), r('y', 3), r('z', 1), r('t', 1)] };
    const m = mergeRows(base, ours, theirs);
    eq('row merge: each side keeps its own change and new row', m.doc.rows.map((x) => `${x.id}${x.v}`), ['x2', 'y3', 'z1', 't1', 'o1']);
    eq('row merge: no conflict', m.conflicts, []);
    eq('row merge: a row both sides changed is a conflict', mergeRows(base, { ...ours, rows: [r('x', 2), r('y', 1), r('z', 1)] }, { ...theirs, rows: [r('x', 5), r('y', 1), r('z', 1)] }).conflicts, ['x']);
    const del = mergeRows(base, ours, { ...theirs, rows: [r('x', 1), r('y', 3)] });
    eq('row merge: a base row is never dropped', [del.dropped, del.doc.rows.some((x) => x.id === 'z')], [['z'], true]);
    const H = (o, b, t) => [`${'<'.repeat(19)} ours`, ...o, `${'|'.repeat(19)} base`, ...b, '='.repeat(19), ...t, `${'>'.repeat(19)} theirs`].join('\n');
    const u = union3(`| a |\n${H(['| ours 1 |', '| same |'], [], ['| theirs 1 |', '| same |'])}\n| b |\n`);
    eq('union: master first, then this branch, no duplicate line', [u.hunks, u.text], [1, '| a |\n| theirs 1 |\n| same |\n| ours 1 |\n| b |\n']);
    eq('union: no markers left', /^(<{7}|={7}|>{7})/m.test(u.text), false);
    eq('union scope', [UNION.some((re) => re.test('design/status/lf-ops.md')), UNION.some((re) => re.test('js/modules/data.js')), NEVER.includes('design/STATUS.md')], [true, false, true]);
    // pure: r1 findings
    eq('F1 pure: same id added on both sides, different content -> conflict', mergeRows({ rows: [] }, { rows: [r('n', 7)] }, { rows: [r('n', 9)] }).conflicts, ['n']);
    eq('F2 pure: same table key edited differently -> conflict', !!mergeHunk(['| A1 | lane text |'], ['| A1 | old text |'], ['| A1 | master text |']).conflict, true);
    eq('F2 pure: rows only added may share a key (a ledger date)', mergeHunk(['| d1 | lane |'], [], ['| d1 | master |']).lines, ['| d1 | master |', '| d1 | lane |']);
    eq('F2 pure: a line one side deleted stays deleted', mergeHunk(['| A2 | y |', '| A3 | w |'], ['| A2 | y |'], ['| A9 | z |']).lines, ['| A9 | z |', '| A3 | w |']);
    eq('F4 pure: a conflicted row is written with markers', /^<{7} HEAD/m.test(serialise({ rows: [r('n', 9)] }, { n: { ours: r('n', 7), theirs: r('n', 9) } })), true);
    // git fixtures, run against the target script
    const top = existsSync('/tmp/claude-0') ? '/tmp/claude-0' : tmpdir();
    const tmp = mkdtempSync(join(top, 'mm-selftest-'));
    try { gitCases(target, tmp, eq); } catch (e) { bad.push(`git fixtures crashed: ${e.message}`); } finally { rmSync(tmp, { recursive: true, force: true }); }
    console.log(bad.length ? bad.map((b) => `  FAIL ${b}`).join('\n') : '');
    console.log(`${TOOL} --self-test: ${bad.length ? `FAIL (${bad.length} of ${n})` : `OK (${n} cases: row merge, 3-way union, scope, git fixtures)`}${target !== SELF ? ` [target ${target}]` : ''}`);
    return bad.length ? 1 : 0;
}

function gitCases(target, tmp, eq) {
    let k = 0;
    const G = (dir, a) => execFileSync('git', ['-c', 'user.name=mm', '-c', 'user.email=mm@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...a], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const put = (dir, files) => { for (const [p, c] of Object.entries(files)) { const f = join(dir, p); if (c == null) rmSync(f, { force: true }); else { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, c); } } G(dir, ['add', '-A']); G(dir, ['commit', '-q', '--allow-empty', '-m', 'x']); };
    const repo = (baseF, lane, master) => {
        const dir = join(tmp, `r${++k}`); mkdirSync(dir);
        G(dir, ['init', '-q', '-b', 'master']); put(dir, baseF);
        G(dir, ['checkout', '-q', '-b', 'lane']); put(dir, lane);
        G(dir, ['checkout', '-q', 'master']); put(dir, master); G(dir, ['checkout', '-q', 'lane']);
        return dir;
    };
    const go = (dir, extra = [], env = {}, script = target) => { const e = { ...process.env, ...env }; delete e.MQ_ROOT; if (!('MQ_COMMIT_TRAILER' in env)) delete e.MQ_COMMIT_TRAILER; const p = spawnSync(process.execPath, [script, '--ref', 'master', ...extra], { cwd: dir, encoding: 'utf8', env: e, timeout: 60000 }); return { code: p.status, out: (p.stdout || '') + (p.stderr || '') }; };
    const unmerged = (dir, f) => G(dir, ['ls-files', '-u', '--', f]).trim() !== '';
    const read = (dir, f) => readFileSync(join(dir, f), 'utf8');
    const bt = (rows) => JSON.stringify({ about: 'a', rows }, null, 1) + '\n';
    const R = (id, v) => ({ id, v });
    const LED = 'design/lessons-first/CHECKS_FROM_CRITICS.md';

    let d = repo({ [BACKTESTS]: bt([R('a', 1)]) }, { [BACKTESTS]: bt([R('a', 1), R('n', 7)]) }, { [BACKTESTS]: bt([R('a', 1), R('n', 9)]) });
    let x = go(d);
    eq('F1 git: same id added both sides -> exit 1, unmerged, both versions kept', [x.code, unmerged(d, BACKTESTS), /"v": 7/.test(read(d, BACKTESTS)) && /"v": 9/.test(read(d, BACKTESTS))], [1, true, true]);

    d = repo({ [BACKTESTS]: bt([R('a', 1)]) }, { [BACKTESTS]: bt([R('a', 2)]) }, { [BACKTESTS]: bt([R('a', 3)]) });
    x = go(d);
    eq('F4 git: row both sides changed -> exit 1, NOT staged, both versions kept', [x.code, unmerged(d, BACKTESTS), /"v": 2/.test(read(d, BACKTESTS)) && /"v": 3/.test(read(d, BACKTESTS))], [1, true, true]);

    d = repo({ [LED]: '# L\n| A1 | old text |\n' }, { [LED]: '# L\n| A1 | lane text |\n' }, { [LED]: '# L\n| A1 | master text |\n' });
    x = go(d);
    eq('F2 git: same row edited differently -> exit 1, unmerged (never two A1 rows staged)', [x.code, unmerged(d, LED)], [1, true]);

    d = repo({ [LED]: '# L\n| A1 | old |\n' }, { [LED]: '# L\n| A1 | old |\n| A2 | new |\n' }, { [LED]: '# L\n| A1 | fixed |\n' });
    x = go(d);
    eq('F2 git: master fixes a line next to the lane\'s append -> fixed line + append, old line gone', [x.code, read(d, LED)], [0, '# L\n| A1 | fixed |\n| A2 | new |\n']);

    d = repo({ [LED]: '# L\n| A1 | x |\n| A2 | y |\n' }, { [LED]: '# L\n| A1 | x |\n| A2 | y |\n| A3 | w |\n' }, { [LED]: '# L\n| A1 | x |\n| A9 | z |\n' });
    x = go(d);
    eq('F2 git: a line master deleted is not restored', [x.code, read(d, LED)], [0, '# L\n| A1 | x |\n| A9 | z |\n| A3 | w |\n']);

    // F3: run from a directory outside git, with a copy of the target inside a repo
    d = repo({ 'f.txt': 'a\n' }, { 'g.txt': 'lane\n' }, { 'h.txt': 'master\n' });
    mkdirSync(join(d, 'tests/scripts'), { recursive: true }); copyFileSync(target, join(d, 'tests/scripts/ws-merge-master.mjs'));
    const outside = join(tmp, 'outside'); mkdirSync(outside);
    x = go(outside, [], {}, join(d, 'tests/scripts/ws-merge-master.mjs'));
    eq('F3 git: outside a git work tree -> exit 2, the script\'s own tree untouched', [x.code, existsSync(join(d, '.git/MERGE_HEAD')), /not inside a git work tree/.test(x.out)], [2, false, true]);

    d = repo({ 'f.txt': 'a\n' }, { 'g.txt': 'lane\n' }, { 'h.txt': 'master\n' });
    const before = G(d, ['rev-parse', 'HEAD']).trim();
    x = go(d, ['--commit']);
    eq('F5 git: --commit with no MQ_COMMIT_TRAILER -> exit 2, nothing merged or committed', [x.code, G(d, ['rev-parse', 'HEAD']).trim() === before, existsSync(join(d, '.git/MERGE_HEAD')), /MQ_COMMIT_TRAILER/.test(x.out)], [2, true, false, true]);

    d = repo({ [BACKTESTS]: bt([R('a', 1), R('b', 1)]) }, { [BACKTESTS]: bt([R('a', 2), R('b', 1)]) }, { [BACKTESTS]: null });
    x = go(d);
    let rows = null; try { rows = JSON.parse(read(d, BACKTESTS)).rows.map((q) => `${q.id}${q.v}`); } catch { rows = null; }
    eq('F6 git: master deleted backtests, lane edited it -> no crash, lane rows kept', [/\n\s+at /.test(x.out), /ws-merge-master: (OK|FAIL)/.test(x.out), rows], [false, true, ['a2', 'b1']]);

    d = repo({ 'design/lessons-first/QUEUE.md': 'q0\n', 'js/x.js': 'x0\n', 'tests/scripts/ws-lessons-first-queue.cjs': "require('fs').writeFileSync('ran.txt','1')\n" },
        { 'design/lessons-first/QUEUE.md': 'q-lane\n', 'js/x.js': 'x-lane\n' }, { 'design/lessons-first/QUEUE.md': 'q-master\n', 'js/x.js': 'x-master\n' });
    x = go(d);
    eq('F7 git: no regeneration while other sources are still conflicted', [x.code, existsSync(join(d, 'ran.txt'))], [1, false]);

    const many = [R('a', 1), R('b', 1), R('c', 1), R('d', 1), R('e', 1)];
    d = repo({ [BACKTESTS]: bt(many) }, { [BACKTESTS]: bt([R('q', 1), ...many]) }, { [BACKTESTS]: bt([...many, R('q', 2)]) });
    x = go(d);
    eq('F7 git: a clean merge that duplicates a row id -> FAIL', [x.code, /duplicate row id/.test(x.out)], [1, true]);
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) process.exitCode = run(process.argv.slice(2), process.cwd());
