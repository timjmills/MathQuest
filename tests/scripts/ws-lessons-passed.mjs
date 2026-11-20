#!/usr/bin/env node
// ws-lessons-passed — the gate of js/modules/lessons-passed.js, THE ONE PLACE a whole lesson is marked 8/10
// (design/cards/lessons-browser §1, R2 and the Checks section). Deploy gate (ws-deploy-gates.sh) and on precritic's path.
//
//   node tests/scripts/ws-lessons-passed.mjs      prints `ws-lessons-passed: OK` / `ws-lessons-passed: FAIL (n)`, exit 1 on FAIL
//   MQ_ROOT=<tree>                                check another tree (ws-backtest commit-pair rows)
//   --baseline-ref <commit>                       read lesson-baseline.json as it was at <commit> (git show), the render a
//                                                 critic graded: proves a stamp matches that render (backtest pass state)
//
// Rules:
//   LP-LIVE      every id of LESSONS_PASSED and PENDING_RECHECK is a live lesson: a detailed lesson
//                (data/curriculum/detailed-lessons.json), a library lesson (js/modules/lessons/status-db.js), or a
//                `skill:<category>:<skill>` lesson of a live skill; no id is in both lists.
//   LP-EVIDENCE  every evidence line names a lane, a critic round, a file that exists (every design/... path it names) and
//                a date (YYYY-MM-DD).
//   LP-STAMP     every LESSONS_PASSED entry carries a renderStamp equal to the CURRENT render: a detailed lesson's digests
//                (first 16 hex of sha1 over the sorted "key=hash" lines of design/audit/baselines/lesson-baseline.json
//                detailed/<id>/<seed>/*) or a library lesson's design/lessons/render-stamps.json entries. A render that
//                changed since the critic graded it is STALE: the gate fails until a critic grades the new render.
//   LP-STATUS    no library lesson whose ws-lesson-coverage status (status-db.js) is failed or stale.
// Node only (no browser).
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = process.env.MQ_ROOT ? resolve(process.env.MQ_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const imp = (p) => import(pathToFileURL(join(ROOT, p)).href);
const bad = [];
const fail = (rule, m) => bad.push(`${rule} ${m}`);
globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem() {}, removeItem() {} };

if (!existsSync(join(ROOT, 'js/modules/lessons-passed.js'))) {
    console.log('  FAIL LP-LIVE js/modules/lessons-passed.js does not exist (no registry of passed lessons)');
    console.log('ws-lessons-passed: FAIL (1)');
    process.exit(1);
}
const P = await imp('js/modules/lessons-passed.js');
const { SKILLS } = await imp('js/modules/data.js');
const { LESSON_STATUS } = await imp('js/modules/lessons/status-db.js');
const detailedIds = new Set((JSON.parse(readFileSync(join(ROOT, 'data/curriculum/detailed-lessons.json'), 'utf8')).lessons || []).map((r) => r.id));
const liveSkill = (c, s) => (SKILLS[c] || []).some((x) => x && x.v === s && !x.retired);
const kindOf = (id) => {
    if (detailedIds.has(id)) return 'detailed';
    const sk = /^skill:([a-z_]+):([a-z0-9_]+)$/.exec(id);
    if (sk) return liveSkill(sk[1], sk[2]) && LESSON_STATUS[id] ? 'library' : '';
    return LESSON_STATUS[id] ? 'library' : '';
};
const REF = (() => { const i = process.argv.indexOf('--baseline-ref'); return i > -1 ? String(process.argv[i + 1] || '') : ''; })();
const baseline = JSON.parse(REF
    ? execFileSync('git', ['-C', ROOT, 'show', `${REF}:design/audit/baselines/lesson-baseline.json`], { encoding: 'utf8', maxBuffer: 1 << 28 })
    : readFileSync(join(ROOT, 'design/audit/baselines/lesson-baseline.json'), 'utf8'));
if (REF) console.log(`  (lesson-baseline.json as at ${REF})`);
let stamps = {};
try { stamps = JSON.parse(readFileSync(join(ROOT, 'design/lessons/render-stamps.json'), 'utf8')); } catch (e) { stamps = {}; }
/** The current digest of a detailed lesson at a seed (the critic-lessons-recheck formula). */
export function detailedDigest(id, seed) {
    const keys = Object.keys(baseline).filter((k) => k.startsWith(`detailed/${id}/${seed}/`)).sort();
    if (!keys.length) return '';
    return createHash('sha1').update(keys.map((k) => `${k}=${baseline[k]}`).join('\n')).digest('hex').slice(0, 16);
}
function evidenceOk(id, line) {
    const t = String(line || '');
    if (!/\b(lane|Lane|Detailed lessons)\b/.test(t)) fail('LP-EVIDENCE', `${id}: the evidence names no lane: "${t.slice(0, 80)}"`);
    if (!/\bcritic\b/i.test(t) || !/\b(r\d+|re-check|round)\b/i.test(t)) fail('LP-EVIDENCE', `${id}: the evidence names no critic round`);
    if (!/\b20\d\d-\d\d-\d\d\b/.test(t)) fail('LP-EVIDENCE', `${id}: the evidence has no date`);
    const files = t.match(/\bdesign\/[\w./-]+\.(?:md|json|jsonl)\b/g) || [];
    if (!files.length) fail('LP-EVIDENCE', `${id}: the evidence names no file`);
    for (const f of files) if (!existsSync(join(ROOT, f))) fail('LP-EVIDENCE', `${id}: the evidence file ${f} does not exist`);
}

for (const id of P.LESSONS_PASSED.keys()) if (P.PENDING_RECHECK.has(id)) fail('LP-LIVE', `${id} is both passed and pending re-check`);
for (const [id, e] of [...P.LESSONS_PASSED, ...P.PENDING_RECHECK]) {
    const k = kindOf(id);
    if (!k) { fail('LP-LIVE', `${id} is not a live detailed, library or skill lesson`); continue; }
    evidenceOk(id, e && e.evidence);
}
for (const [id, e] of P.LESSONS_PASSED) {
    const k = kindOf(id);
    const st = e && e.renderStamp;
    if (!st || typeof st !== 'object') { fail('LP-STAMP', `${id}: no renderStamp (a pass is bound to the render the critic graded)`); continue; }
    if (k === 'detailed') {
        if (st.source !== 'lesson-baseline' || !st.digests || !Object.keys(st.digests).length) { fail('LP-STAMP', `${id}: a detailed lesson's stamp is { source: 'lesson-baseline', digests }`); continue; }
        for (const [seed, dg] of Object.entries(st.digests)) {
            const now = detailedDigest(id, seed);
            if (!now) fail('LP-STAMP', `${id}: no pinned pages at seed ${seed} in lesson-baseline.json`);
            else if (now !== dg) fail('LP-STAMP', `${id}: STALE at seed ${seed}: graded ${dg} (${st.commit || '?'}), the render is now ${now}; re-grade due`);
        }
    } else if (k === 'library') {
        if (st.source !== 'render-stamps' || !st.entries || !Object.keys(st.entries).length) { fail('LP-STAMP', `${id}: a library lesson's stamp is { source: 'render-stamps', entries }`); continue; }
        for (const [key, val] of Object.entries(st.entries)) if (JSON.stringify(stamps[key]) !== JSON.stringify(val)) fail('LP-STAMP', `${id}: STALE: render-stamps.json ${key} changed since the critic graded it; re-grade due`);
        const s = LESSON_STATUS[id];
        if (s && (s.status === 'failed' || s.status === 'stale')) fail('LP-STATUS', `${id}: ws-lesson-coverage status is ${s.status}`);
    }
}
for (const b of bad) console.log(`  FAIL ${b}`);
console.log(`  ${P.LESSONS_PASSED.size} passed, ${P.PENDING_RECHECK.size} pending re-check`);
console.log(bad.length ? `ws-lessons-passed: FAIL (${bad.length})` : 'ws-lessons-passed: OK');
process.exit(bad.length ? 1 : 0);
