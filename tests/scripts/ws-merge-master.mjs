#!/usr/bin/env node
// ws-merge-master — merge origin/master into the current lane branch the way the lanes have been doing it by hand
// (lead 2026-11-14: most of a day's lost deploy time was merge conflicts in the shared, append-only files).
//
//   node tests/scripts/ws-merge-master.mjs              fetch + merge origin/master (no commit), resolve the shared files,
//                                                       regenerate the generated reports, run ws-conflict-markers
//   node tests/scripts/ws-merge-master.mjs --commit     ... and commit the merge when nothing is left unresolved
//                                                       (MQ_COMMIT_TRAILER="<attribution lines>" appends the lane's footer)
//   node tests/scripts/ws-merge-master.mjs --ref <r>    merge another ref (default origin/master)
//   node tests/scripts/ws-merge-master.mjs --self-test  the row merge and the hunk union on planted inputs (no git)
//
// Resolution, per conflicted file:
//   tests/fixtures/precritic/backtests.json   3-way merge BY ROW ID: master's rows in master's order (a row only this
//                                             branch changed takes this branch's version), then this branch's new rows.
//                                             A row BOTH sides changed differently is left for the lane (FAIL). No row
//                                             of the base or of either side is ever dropped. Written in the file's own
//                                             format (indent 1, UTF-8), so an untouched row stays byte-identical.
//   UNION files (append-only ledgers / notes)  each conflict hunk keeps master's lines, then this branch's lines:
//                                             design/lessons-first/CHECKS_FROM_CRITICS.md, design/decisions/LEAD_DECISIONS.md,
//                                             design/status/*.md (a lane's own note), design/status/speed-audit.md,
//                                             design/status/metrics.md
//   GENERATED reports                         take master's copy, then re-run the generator (node, no browser) so the
//                                             report matches the merged sources
//   anything else                             left as a conflict for the lane to resolve (listed; exit 1)
// It never edits design/STATUS.md, never pushes, and never force-anything.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOL = 'ws-merge-master';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const val = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

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
};

/** 3-way row merge of backtests.json documents. Returns {doc, conflicts[], dropped[]}. Pure. */
export function mergeRows(base, ours, theirs) {
    const B = new Map(base.rows.map((r) => [r.id, r])), O = new Map(ours.rows.map((r) => [r.id, r]));
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const conflicts = [];
    const out = theirs.rows.map((t) => {
        const b = B.get(t.id), o = O.get(t.id);
        if (!b || !o || same(o, b)) return t;              // only master changed it (or nobody did)
        if (same(t, b) || same(t, o)) return o;            // only this branch changed it
        conflicts.push(t.id); return t;                    // both changed it differently: the lane decides
    });
    const have = new Set(out.map((r) => r.id));
    for (const o of ours.rows) if (!have.has(o.id) && !B.has(o.id)) { out.push(o); have.add(o.id); }   // this branch's new rows
    // a base row this branch kept but master deleted (or vice versa) is NOT dropped silently
    const dropped = [...B.keys()].filter((id) => !have.has(id));
    for (const id of dropped) { const keep = O.get(id) || B.get(id); out.push(keep); have.add(id); }
    const doc = { ...theirs, rows: out };
    if (!same(ours.about, theirs.about) && same(theirs.about, base.about)) doc.about = ours.about;
    return { doc, conflicts, dropped };
}
export const serialise = (doc) => JSON.stringify(doc, null, 1) + '\n';

/** Union every conflict hunk: master's side, then this branch's side. Returns {text, hunks}. Pure. */
export function unionHunks(text) {
    let hunks = 0;
    const out = text.replace(/^<<<<<<< [^\n]*\n([\s\S]*?)^(?:\|\|\|\|\|\|\| [^\n]*\n[\s\S]*?)?^=======\n([\s\S]*?)^>>>>>>> [^\n]*\n/gm, (m, ours, theirs) => {
        hunks++;
        const seen = new Set(theirs.split('\n'));
        return theirs + ours.split('\n').filter((l) => !l || !seen.has(l)).join('\n');   // a line already on master's side is not repeated
    });
    return { text: out, hunks };
}

function selfTest() {
    const bad = [];
    const eq = (n, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${n}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
    const r = (id, v) => ({ id, v });
    const base = { about: 'a', rows: [r('x', 1), r('y', 1), r('z', 1)] };
    const ours = { about: 'a', rows: [r('x', 2), r('y', 1), r('z', 1), r('o', 1)] };          // changed x, added o
    const theirs = { about: 'a', rows: [r('x', 1), r('y', 3), r('z', 1), r('t', 1)] };        // changed y, added t
    const m = mergeRows(base, ours, theirs);
    eq('row merge: each side keeps its own change and new row', m.doc.rows.map((x) => `${x.id}${x.v}`), ['x2', 'y3', 'z1', 't1', 'o1']);
    eq('row merge: no conflict', m.conflicts, []);
    const both = mergeRows(base, { ...ours, rows: [r('x', 2), r('y', 1), r('z', 1)] }, { ...theirs, rows: [r('x', 5), r('y', 1), r('z', 1)] });
    eq('row merge: a row both sides changed is a conflict', both.conflicts, ['x']);
    const del = mergeRows(base, ours, { ...theirs, rows: [r('x', 1), r('y', 3)] });             // master lost z
    eq('row merge: a base row is never dropped', [del.dropped, del.doc.rows.some((x) => x.id === 'z')], [['z'], true]);
    const t = '| a |\n<<<<<<< HEAD\n| ours 1 |\n| same |\n=======\n| theirs 1 |\n| same |\n>>>>>>> origin/master\n| b |\n';
    const u = unionHunks(t);
    eq('union: master first, then this branch, no duplicate line', [u.hunks, u.text], [1, '| a |\n| theirs 1 |\n| same |\n| ours 1 |\n| b |\n']);
    eq('union: no markers left', /^(<<<<<<<|=======|>>>>>>>)/m.test(u.text), false);
    eq('union scope', [UNION.some((re) => re.test('design/status/lf-ops.md')), UNION.some((re) => re.test('js/modules/data.js')), NEVER.includes('design/STATUS.md')], [true, false, true]);
    console.log(bad.length ? bad.map((b) => `  FAIL ${b}`).join('\n') : '');
    console.log(`${TOOL} --self-test: ${bad.length ? `FAIL (${bad.length})` : 'OK (7 cases: row merge, union, scope)'}`);
    return bad.length ? 1 : 0;
}

const git = (a, opts = {}) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, ...opts });
const show = (rev, p) => JSON.parse(git(['show', `${rev}:${p}`]));

function main() {
    if (args.includes('--self-test')) return selfTest();
    const ref = val('--ref', 'origin/master');
    if (git(['status', '--porcelain', '--untracked-files=no']).trim()) { console.log(`${TOOL}: FAIL (the working tree has uncommitted changes: commit or stash them first)`); return 2; }
    if (ref.startsWith('origin/')) { const r = spawnSync('git', ['fetch', '-q', 'origin', ref.slice(7)], { cwd: ROOT, encoding: 'utf8' }); if (r.status) { console.log(`${TOOL}: FAIL (git fetch: ${r.stderr.trim()})`); return 2; } }
    const head = git(['rev-parse', '--short=9', 'HEAD']).trim(), tip = git(['rev-parse', '--short=9', ref]).trim();
    const base = git(['merge-base', 'HEAD', ref]).trim();
    if (git(['rev-parse', ref]).trim() === base) { console.log(`${TOOL}: OK (already contains ${ref} ${tip}; nothing to merge)`); return 0; }
    const mg = spawnSync('git', ['merge', '--no-commit', '--no-ff', ref], { cwd: ROOT, encoding: 'utf8' });
    const conflicted = git(['diff', '--name-only', '--diff-filter=U']).split('\n').filter(Boolean);
    console.log(`${TOOL}: merging ${ref} ${tip} into ${head} (base ${base.slice(0, 9)}): ${conflicted.length} conflicted file(s)`);
    const left = [], regen = new Map();
    for (const f of conflicted) {
        if (NEVER.includes(f)) { left.push(`${f} (never edited by a lane)`); continue; }
        if (f === BACKTESTS) {
            const m = mergeRows(show(base, f), show('HEAD', f), show(ref, f));
            writeFileSync(resolve(ROOT, f), serialise(m.doc));
            console.log(`  rows   ${f}: ${m.doc.rows.length} rows${m.dropped.length ? `; kept ${m.dropped.length} row(s) one side deleted: ${m.dropped.join(', ')}` : ''}`);
            if (m.conflicts.length) { left.push(`${f} rows changed on both sides: ${m.conflicts.join(', ')} (master's version kept: re-apply yours by hand)`); }
            git(['add', f]); continue;
        }
        if (UNION.some((re) => re.test(f))) {
            const u = unionHunks(readFileSync(resolve(ROOT, f), 'utf8'));
            writeFileSync(resolve(ROOT, f), u.text); git(['add', f]);
            console.log(`  union  ${f}: ${u.hunks} hunk(s)`); continue;
        }
        if (GENERATED[f]) { git(['checkout', '--theirs', '--', f]); git(['add', f]); regen.set(GENERATED[f].join(' '), GENERATED[f]); console.log(`  regen  ${f}: master's copy, regenerated below`); continue; }
        left.push(f);
    }
    for (const [label, cmd] of regen) {
        const r = spawnSync(process.execPath, cmd, { cwd: ROOT, encoding: 'utf8', timeout: 300000 });
        console.log(`  regen  node ${label}: ${r.status === 0 ? 'OK' : `exit ${r.status}`}`);
        if (r.status !== 0) left.push(`regenerate: node ${label} failed`);
        for (const g of Object.keys(GENERATED)) if (GENERATED[g].join(' ') === label && existsSync(resolve(ROOT, g))) git(['add', g]);
    }
    const cm = spawnSync(process.execPath, ['tests/scripts/ws-conflict-markers.mjs'], { cwd: ROOT, encoding: 'utf8' });
    const cmLine = String(cm.stdout || '').trim().split('\n').pop();
    console.log(`  ${cmLine}`);
    if (cm.status !== 0) left.push('conflict markers remain (ws-conflict-markers)');
    if (mg.status !== 0 && !conflicted.length) left.push(`git merge: ${(mg.stderr || mg.stdout).trim().split('\n').pop()}`);
    if (left.length) { for (const l of left) console.log(`  LEFT   ${l}`); console.log(`${TOOL}: FAIL (${left.length} item(s) left for the lane; the merge is NOT committed)`); return 1; }
    if (args.includes('--commit')) {
        git(['commit', '-q', '-m', `Merge ${ref} ${tip} (ws-merge-master: backtests by row id, ledgers and status union, generated reports regenerated)${process.env.MQ_COMMIT_TRAILER ? `\n\n${process.env.MQ_COMMIT_TRAILER}` : ''}`]);   // MQ_COMMIT_TRAILER: the lane's attribution lines
        console.log(`${TOOL}: OK (merged and committed ${git(['rev-parse', '--short=9', 'HEAD']).trim()}; push it yourself)`);
    } else console.log(`${TOOL}: OK (merged, resolved, NOT committed: review, then git commit)`);
    return 0;
}
process.exitCode = main();
