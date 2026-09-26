// THE LESSON COVERAGE RECORD (design/LESSON_LIBRARY_PLAN.md §4): what the lesson library covers -
// every WRM small step, CCSS code and EE by lessons that PASSED an independent critic, what is still to
// make (lessons, and the skills / options they wait for), the critic ledger and the milestones.
//
//   node tests/scripts/ws-lesson-coverage.cjs                  # structure + coverage (exit 1 on a structural problem)
//   node tests/scripts/ws-lesson-coverage.cjs --report-only    # print, never exit 1
//   node tests/scripts/ws-lesson-coverage.cjs --report         # also write design/LESSON_COVERAGE.md
//   node tests/scripts/ws-lesson-coverage.cjs --write-db       # also write js/modules/lessons/status-db.js
//   node tests/scripts/ws-lesson-coverage.cjs --json           # the record as JSON
//   node tests/scripts/ws-lesson-coverage.cjs --family addsub  # one family's lessons only
//
// STATUS comes only from the critic grades files (design/audit/runs/lessons-*/grades.jsonl): a lesson
// is `passed` when every graded page of its latest round, at the certification seed, passed (C1-C4
// >= 8); `failed` when one did not; `draft` when no round graded it. A pass is bound to the render it
// graded: a grades row's `renderHash`, or (rounds before stamps) the lesson's entry in
// design/lessons/passed-stamps.json. When the current render (design/lessons/render-stamps.json,
// written by ws-lesson-hash.cjs) differs, the lesson is `stale` - re-grade due. Robustness rows (another
// seed) are listed, never counted in the pass.
//
// Node only (no browser).
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '../..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const FAMILY = arg('family', '');
const CERT_SEED = 4242;
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const readJson = (p, d) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')); } catch (e) { return d; } };

/** Every critic round's rows, by round (lessons-r1 ... in order), each row with its round. */
function gradeRounds() {
    const dir = path.join(ROOT, 'design/audit/runs');
    if (!fs.existsSync(dir)) return [];
    const runs = fs.readdirSync(dir).filter((d) => /^lessons-/.test(d) && fs.existsSync(path.join(dir, d, 'grades.jsonl')));
    const num = (d) => { const m = /-r(\d+)/.exec(d); return m ? Number(m[1]) : 0; };
    runs.sort((a, b) => num(a) - num(b) || a.localeCompare(b));
    return runs.map((run) => {
        const rows = fs.readFileSync(path.join(dir, run, 'grades.jsonl'), 'utf8').split('\n').filter((l) => l.trim()).map((l, i) => {
            try { return JSON.parse(l); } catch (e) { return { bad: `line ${i + 1}` }; }
        });
        return { run, rows };
    });
}

/** The seed a grades row graded: its `seed`, else read from its PNG path, else the certification seed. */
function seedOfRow(r) {
    if (Number.isFinite(Number(r.seed))) return Number(r.seed);
    const m = /seed(\d+)/.exec(String(r.png || ''));
    return m ? Number(m[1]) : CERT_SEED;
}

(async () => {
    const lib = await imp('js/modules/lessons/library.js');
    const seedDb = await imp('js/modules/lessons/seed-db.js');
    const prereqs = await imp('js/modules/lessons/prereqs.js');
    const rules = await imp('js/modules/sheet/lesson-rules.js');
    const audit = await imp('js/modules/standards-audit.js');
    // (data.js reads localStorage and logs its code count at load.)
    const mem = {};
    globalThis.localStorage = globalThis.localStorage || { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
    const log = console.log;
    console.log = () => {};
    const data = await imp('js/modules/data.js').finally(() => { console.log = log; });
    const skillExists = (key) => {
        const [c, s] = String(key).split(':');
        return !!(data.SKILLS && data.SKILLS[c] && data.SKILLS[c].some((x) => x && x.v === s));
    };
    const caseNames = Object.values(rules.CASE_FAMILIES || {}).flatMap((fam) => Object.keys(fam));

    // ---- structure
    const problems = lib.validateLibrary({ stepIcons: prereqs.STEP_ICONS, caseNames, skillExists });
    const needs0 = lib.allNeeds();
    const posOf = new Map(seedDb.SEEDS.map((x, i) => [x.id, i]));
    const waiting = {};
    for (const [id, l] of Object.entries(lib.LESSONS)) {
        if (/^(R|Y\d)\./.test(id) && !seedDb.seedOf(id)) problems.push(`lesson ${id}: not a WRM small step`);
        for (const s of l.steps || []) if (!seedDb.seedOf(s)) problems.push(`lesson ${id}: step ${s} is not a WRM small step`);
        // LR-17: every prerequisite a lesson of the library, or recorded as a NEEDS entry; WRM ids
        // real small steps; most basic first (curriculum order).
        const pre = l.prereqs || [];
        for (const p of pre) {
            if (/^(R|Y\d)\./.test(p.lesson) && !seedDb.seedOf(p.lesson)) problems.push(`lesson ${id}: LR-17 prerequisite ${p.lesson} is not a WRM small step`);
            if (!lib.LESSONS[p.lesson]) {
                if (!needs0.some((nd) => nd.kind === 'lesson' && nd.lesson === id && nd.prereq === p.lesson)) problems.push(`lesson ${id}: LR-17 prerequisite ${p.lesson} is neither a lesson nor a NEEDS entry`);
                (waiting[id] = waiting[id] || []).push(p.lesson);
            }
        }
        const ps = pre.map((p) => posOf.get(p.lesson)).filter((x) => x !== undefined);
        if (ps.some((x, i) => i && x < ps[i - 1])) problems.push(`lesson ${id}: LR-17 the Prerequisite Check is not most basic first`);
        // LR-18: every lesson has every part.
        const r = lib.routineOf(l) || {};
        const missing = [['prereq', pre.length >= 3], ['chart', (r.steps || []).length && r.example], ['sheet', (r.steps || []).length], ['practice', l.practice && l.practice.skill], ['mixed', (l.mixWith || []).length]].filter(([, ok]) => !ok).map(([k]) => k);
        if (missing.length) problems.push(`lesson ${id}: LR-18 missing part(s): ${missing.join(', ')}`);
    }
    // LR-17: the prerequisite graph has no cycle (a lesson never requires itself through a chain).
    const edges = Object.fromEntries(Object.entries(lib.LESSONS).map(([id, l]) => [id, (l.prereqs || []).map((p) => p.lesson).filter((x) => lib.LESSONS[x])]));
    const state = {};
    const visit = (id, path) => {
        if (state[id] === 2) return;
        if (state[id] === 1) { problems.push(`LR-17: a prerequisite cycle: ${path.concat(id).join(' -> ')}`); return; }
        state[id] = 1;
        for (const nx of edges[id] || []) visit(nx, path.concat(id));
        state[id] = 2;
    };
    for (const id of Object.keys(edges)) visit(id, []);
    for (const nd of needs0) if (nd.kind === 'lesson' && lib.LESSONS[nd.prereq]) problems.push(`need of ${nd.lesson}: prerequisite lesson ${nd.prereq} is built (drop the NEEDS entry)`);

    // ---- status from the critic grades
    const rounds = gradeRounds();
    const passedStamps = readJson('design/lessons/passed-stamps.json', {});
    const stamps = readJson('design/lessons/render-stamps.json', {});
    const stampOf = (lessonId) => {
        const l = lib.lessonById(lessonId);
        const keys = [l.slug, lessonId].filter(Boolean);
        for (const k of keys) { const s = stamps[`${k}|${CERT_SEED}|L`]; if (s) return `${s.pupil}.${s.key}`; }
        return '';
    };
    const status = {};
    const ledger = [];
    for (const { run, rows } of rounds) {
        const per = {};
        for (const r of rows) {
            if (r.bad || !r.lesson || r.lesson === 'all' || typeof r.pass !== 'boolean') continue;
            const id = lib.lessonIdOf(r.lesson) || r.lesson;
            (per[id] = per[id] || []).push(r);
        }
        const summary = { run, lessons: 0, pages: 0, passed: 0, robustness: [] };
        for (const [id, list] of Object.entries(per)) {
            const cert = list.filter((r) => seedOfRow(r) === CERT_SEED);
            const other = list.filter((r) => seedOfRow(r) !== CERT_SEED);
            summary.lessons++;
            summary.pages += cert.length;
            summary.passed += cert.filter((r) => r.pass).length;
            for (const r of other) summary.robustness.push(`${r.lesson} ${r.page} seed ${seedOfRow(r)}: ${r.pass ? 'pass' : 'FAIL'}`);
            if (!cert.length) continue;
            const hash = cert.map((r) => r.renderHash).find(Boolean) || '';
            status[id] = { round: run, pass: cert.every((r) => r.pass), pages: cert.length, failing: cert.filter((r) => !r.pass).map((r) => `${r.page} ${r.size}`), hash, robustness: other.filter((r) => !r.pass).map((r) => `${r.page} seed ${seedOfRow(r)}`) };
        }
        ledger.push(summary);
    }
    const lessonIds = Object.keys(lib.LESSONS).filter((id) => !FAMILY || lib.FAMILY_OF.lessons[id] === FAMILY);
    const lessonStatus = (id) => {
        const s = status[id];
        if (!s) return { status: 'draft', why: 'no critic round yet' };
        if (!s.pass) return { status: 'failed', why: `${s.round}: ${s.failing.join(', ')}` };
        const bound = s.hash || (passedStamps[id] && passedStamps[id].stamp) || '';
        const now = stampOf(id);
        if (bound && now && bound !== now) return { status: 'stale', why: `${s.round} passed; the render has changed since (re-grade due)` };
        return { status: 'passed', why: `${s.round}${bound ? '' : ' (unstamped)'}${s.robustness.length ? `; robustness: ${s.robustness.join(', ')}` : ''}` };
    };
    const rec = {};
    for (const id of lessonIds) {
        const l = lib.lessonById(id);
        const seed = seedDb.seedOf(id) || {};
        const r = lib.routineOf(l) || {};
        const st = lessonStatus(id);
        const steps = [id, ...(l.steps || [])].filter((s) => seedDb.seedOf(s));
        const ccss = [...new Set(steps.flatMap((s) => seedDb.seedOf(s).ccss))];
        const ee = [...new Set(steps.flatMap((s) => seedDb.seedOf(s).ee))];
        rec[id] = { id, slug: l.slug || '', title: seed.title || l.title || id, grade: seed.grade || '', family: lib.FAMILY_OF.lessons[id], routine: l.routine, archetype: r.archetype || '', practice: l.practice ? l.practice.skill : '', steps, ccss, ee, ...st };
    }
    const passed = (id) => rec[id] && rec[id].status === 'passed';

    // ---- coverage: WRM steps, CCSS, EE, skills
    const stepCover = new Map();
    for (const l of Object.values(rec)) for (const s of l.steps) {
        const cur = stepCover.get(s);
        if (!cur || (l.status === 'passed' && cur.status !== 'passed')) stepCover.set(s, l);
    }
    const seeds = seedDb.SEEDS.filter((s) => !FAMILY || s.family === FAMILY);
    const byYear = {};
    for (const s of seeds) {
        const y = s.id.split('.')[0];
        const t = byYear[y] || (byYear[y] = { steps: 0, lessons: 0, passed: 0 });
        t.steps++;
        const c = stepCover.get(s.id);
        if (c) { t.lessons++; if (c.status === 'passed') t.passed++; }
    }
    // A lesson tagged with a parent code (2.NBT.B.5) touches its lettered parts (K.CC.B.4a) too; the
    // plan resolves parents to parts per lesson (§1) - until then a part is touched, not FULL-proof.
    const lessonsOfCode = (code, field) => Object.values(rec).filter((l) => l[field].some((c) => c === code || (code.startsWith(c) && /^[a-z]$/.test(code.slice(c.length)))));
    const verdicts = (table, field) => Object.entries(table).map(([code, v]) => {
        const ls = lessonsOfCode(code, field);
        const practisedBy = new Set(ls.filter((l) => l.status === 'passed').map((l) => l.practice));
        const full = v.status === 'full' && v.by.length > 0 && v.by.every((k) => practisedBy.has(k));
        return { code, skills: v.status, lessons: ls.length, passed: ls.filter((l) => l.status === 'passed').length, lessonVerdict: full ? 'FULL' : ls.some((l) => l.status === 'passed') ? 'partial' : 'gap' };
    });
    const ccssRows = verdicts(audit.CCSS_AUDIT, 'ccss');
    const eeRows = verdicts(audit.EE_AUDIT, 'ee');
    const toMake = seeds.filter((s) => !stepCover.has(s.id));
    const needs = lib.allNeeds().filter((n) => !FAMILY || n.family === FAMILY);
    const archetypes = {};
    for (const l of Object.values(rec)) {
        const a = archetypes[l.archetype] || (archetypes[l.archetype] = { lessons: 0, passed: 0, certifiedBy: [] });
        a.lessons++;
        if (l.status === 'passed') { a.passed++; a.certifiedBy.push(l.slug || l.id); }
    }

    // ---- milestones (append-only): the date a year / CCSS domain first became FULL by lessons
    const milestonesFile = path.join(ROOT, 'design/lessons/milestones.jsonl');
    const known = fs.existsSync(milestonesFile) ? fs.readFileSync(milestonesFile, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
    const reached = [];
    for (const [y, t] of Object.entries(byYear)) if (t.steps && t.passed === t.steps) reached.push({ kind: 'wrm-year', id: y });
    const domains = {};
    for (const r of ccssRows) { const d = r.code.split('.').slice(0, 2).join('.'); (domains[d] = domains[d] || []).push(r); }
    for (const [d, rs] of Object.entries(domains)) if (rs.every((r) => r.lessonVerdict === 'FULL')) reached.push({ kind: 'ccss-domain', id: d });
    const fresh = reached.filter((m) => !known.some((k) => k.kind === m.kind && k.id === m.id));

    // (In curriculum order: the WRM step order, then the other kinds by id.)
    const pos = new Map(seedDb.SEEDS.map((x, i) => [x.id, i]));
    const byCurriculum = (a, b) => (pos.has(a.id) ? pos.get(a.id) : 1e6) - (pos.has(b.id) ? pos.get(b.id) : 1e6) || a.id.localeCompare(b.id);
    const out = {
        lessons: Object.values(rec).sort(byCurriculum), byYear, ledger, ccss: ccssRows, ee: eeRows, toMake: toMake.length, needs, archetypes, problems,
        waiting,
        milestones: known.concat(fresh.map((m) => Object.assign({ date: new Date().toISOString().slice(0, 10) }, m))),
    };
    if (has('json')) { console.log(JSON.stringify(out, null, 1)); return; }

    // ---- print
    for (const l of out.lessons) console.log(`  ${l.id.padEnd(10)} ${l.status.padEnd(7)} ${(l.slug || '').padEnd(26)} ${l.archetype.padEnd(8)} ${l.practice}  ${l.why}`);
    const tot = seeds.length, withL = seeds.length - toMake.length, pass = [...stepCover.values()].filter((l) => l.status === 'passed').length;
    console.log(`  WRM steps: ${tot}, with a lesson ${withL}, passed ${pass}; CCSS lesson-FULL ${ccssRows.filter((r) => r.lessonVerdict === 'FULL').length} of ${ccssRows.length}; EE ${eeRows.filter((r) => r.lessonVerdict === 'FULL').length} of ${eeRows.length}; needs ${needs.length}`);

    if (has('report')) {
        const L = [];
        const p = (s = '') => L.push(s);
        p('# Lesson coverage record');
        p();
        p('GENERATED by `node tests/scripts/ws-lesson-coverage.cjs --report` from the lesson library (`js/modules/lessons/`),');
        p('the WRM seed (`js/modules/lessons/seed-db.js`), the critic grades (`design/audit/runs/lessons-*/grades.jsonl`) and the');
        p('standards audit (`js/modules/standards-audit.js`). Do not edit by hand. The plan: `design/LESSON_LIBRARY_PLAN.md` §4.');
        p();
        p('A lesson is **passed** only when an independent critic graded every page ≥ 8 at the certification seed; **stale** when its');
        p('render changed after that pass (re-grade due); **failed** when a page failed; **draft** when no round graded it.');
        p();
        p('## Summary by year');
        p();
        p('| Year | Grade | WRM steps | With a lesson | Passed |');
        p('|---|---|---|---|---|');
        const grades = { R: 'PK', Y1: 'K', Y2: '1', Y3: '2', Y4: '3', Y5: '4', Y6: '5' };
        for (const [y, t] of Object.entries(byYear)) p(`| ${y} | ${grades[y] || ''} | ${t.steps} | ${t.lessons} | ${t.passed} |`);
        p(`| **All** | | **${tot}** | **${withL}** | **${pass}** |`);
        p();
        p('## Lessons');
        p();
        p('| Lesson | Title | Grade | Family | Archetype | Practice skill | Status | Why |');
        p('|---|---|---|---|---|---|---|---|');
        for (const l of out.lessons) p(`| ${l.id}${l.slug ? ` (${l.slug})` : ''} | ${l.title} | ${l.grade} | ${l.family} | ${l.archetype} | \`${l.practice}\` | **${l.status}** | ${l.why} |`);
        p();
        p('## Archetypes');
        p();
        p('| Archetype | Lessons | Passed | Certified by |');
        p('|---|---|---|---|');
        for (const [a, t] of Object.entries(archetypes)) p(`| ${a} | ${t.lessons} | ${t.passed} | ${t.certifiedBy.join(', ') || '-'} |`);
        p();
        p('## CCSS by lessons');
        p();
        p('Lesson-FULL: the skills verdict is full and every evidence skill is practised by a passed lesson tagged to the code.');
        p('Only codes a lesson touches are listed; every other code is a gap by lessons.');
        p();
        p('| Code | Skills verdict | Lessons tagged | Passed | By lessons |');
        p('|---|---|---|---|---|');
        for (const r of ccssRows.filter((x) => x.lessons)) p(`| ${r.code} | ${r.skills} | ${r.lessons} | ${r.passed} | ${r.lessonVerdict} |`);
        p(`\n${ccssRows.filter((r) => r.lessonVerdict === 'FULL').length} of ${ccssRows.length} CCSS codes and parts are FULL by lessons.`);
        p();
        p('## Essential Elements by lessons');
        p();
        p('| EE | Skills verdict | Lessons tagged | Passed | By lessons |');
        p('|---|---|---|---|---|');
        for (const r of eeRows.filter((x) => x.lessons)) p(`| ${r.code} | ${r.skills} | ${r.lessons} | ${r.passed} | ${r.lessonVerdict} |`);
        p(`\n${eeRows.filter((r) => r.lessonVerdict === 'FULL').length} of ${eeRows.length} Essential Elements are FULL by lessons.`);
        p();
        p('## Waiting for prerequisite lessons (LR-17)');
        p();
        p('Every lesson opens with a Prerequisite Check whose questions route to earlier lessons. These lessons point at');
        p('prerequisite lessons not written yet (recorded as NEEDS; the Phase 1 pilot list puts them first):');
        p();
        if (!Object.keys(waiting).length) p('None.');
        else {
            p('| Lesson | Prerequisite lessons still to make |');
            p('|---|---|');
            for (const [id, list] of Object.entries(waiting)) p(`| ${id} | ${list.map((x) => `${x} ${(seedDb.seedOf(x) || {}).title || ''}`.trim()).join('; ')} |`);
        }
        p();
        p('## Needs (skills, options and lessons that lessons wait for)');
        p();
        if (!needs.length) p('None recorded.');
        else {
            p('| Lesson | Kind | Skill / lesson | Option | Name | Why |');
            p('|---|---|---|---|---|---|');
            for (const n of needs) p(`| ${n.lesson} | ${n.kind} | ${n.skill || n.prereq || ''} | ${n.option || ''} | ${n.name} | ${n.why || ''} |`);
        }
        p();
        p('## Lessons to make, by family');
        p();
        const fam = {};
        for (const s of toMake) (fam[s.family] = fam[s.family] || []).push(s);
        p('| Family | Steps without a lesson | Of which a live skill is tagged |');
        p('|---|---|---|');
        for (const [f, list] of Object.entries(fam).sort()) p(`| ${f} | ${list.length} | ${list.filter((s) => s.skills.length).length} |`);
        p();
        p('The full list is `seed-db.js` (every step with its family, archetype guess and tagged skills).');
        p();
        p('## Critic ledger');
        p();
        p('| Round | Lessons | Pages graded (cert. seed) | Pages passed | Robustness rows (other seeds) |');
        p('|---|---|---|---|---|');
        for (const r of ledger) p(`| ${r.run} | ${r.lessons} | ${r.pages} | ${r.passed} | ${r.robustness.join('; ') || '-'} |`);
        p();
        p('## Milestones');
        p();
        if (!out.milestones.length) p('None yet: no WRM year and no CCSS domain is FULL by lessons.');
        else for (const m of out.milestones) p(`- ${m.date}: ${m.kind} ${m.id} FULL by lessons`);
        if (problems.length) { p(); p('## Structural problems'); p(); for (const x of problems) p(`- ${x}`); }
        fs.writeFileSync(path.join(ROOT, 'design/LESSON_COVERAGE.md'), L.join('\n') + '\n');
        if (fresh.length) fs.appendFileSync(milestonesFile, fresh.map((m) => JSON.stringify(Object.assign({ date: new Date().toISOString().slice(0, 10) }, m))).join('\n') + '\n');
        console.log('  wrote design/LESSON_COVERAGE.md');
    }
    if (has('write-db')) {
        const rows = out.lessons.map((l) => `    ${JSON.stringify(l.id)}: ${JSON.stringify({ status: l.status, round: (status[l.id] || {}).round || '' })},`);
        fs.writeFileSync(path.join(ROOT, 'js/modules/lessons/status-db.js'), `// status-db.js - GENERATED by \`node tests/scripts/ws-lesson-coverage.cjs --write-db\` from the critic grades.
// Do not edit by hand. A lesson's status: passed | stale | failed | draft (design/LESSON_COVERAGE.md).

export const LESSON_STATUS = Object.freeze({
${rows.join('\n')}
});

export default { LESSON_STATUS };
`);
        console.log('  wrote js/modules/lessons/status-db.js');
    }
    for (const x of problems) console.log(`  FAIL ${x}`);
    if (problems.length && !has('report-only')) { console.log(`ws-lesson-coverage: FAIL (${problems.length} structural problem(s))`); process.exit(1); }
    console.log(`ws-lesson-coverage: ${problems.length ? 'FAIL (report only)' : 'OK'} (${out.lessons.length} lesson(s): ${['passed', 'stale', 'failed', 'draft'].map((s) => `${out.lessons.filter((l) => l.status === s).length} ${s}`).join(', ')})`);
})().catch((e) => { console.error(e); process.exit(1); });
