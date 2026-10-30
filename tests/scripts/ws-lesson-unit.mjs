// THE LESSON LIBRARY UNIT GATE (design/LESSON_LIBRARY_PLAN.md phase 0, design/LESSON_RULES.md): the
// lesson rules (sheet/lesson-rules.js), the library (lessons/library.js, schema.js), the back-compat
// view (lessons/prereqs.js), the prerequisite fallback (prereq-db.js) and the build-list NEEDS merge.
// Node only, no browser; prints `ws-lesson-unit: OK (n checks)` / `FAIL`.
//
//   node tests/scripts/ws-lesson-unit.mjs
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const mem = {};
globalThis.localStorage = globalThis.localStorage || { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
const log = console.log;
console.log = () => {};
const data = await imp('js/modules/data.js').finally(() => { console.log = log; });
const LR = await imp('js/modules/sheet/lesson-rules.js');
const LIB = await imp('js/modules/lessons/library.js');
const SCHEMA = await imp('js/modules/lessons/schema.js');
const PRE = await imp('js/modules/lessons/prereqs.js');
const BL = await imp('js/modules/build-list.js');
const DET = await imp('js/modules/lessons/detailed/index.js');

let pass = 0;
const fails = [];
const eq = (got, want, what) => { if (JSON.stringify(got) === JSON.stringify(want)) pass++; else fails.push(`${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
const ok = (cond, what) => { if (cond) pass++; else fails.push(what); };
const skillExists = (key) => { const [c, s] = String(key).split(':'); return !!(data.SKILLS[c] && data.SKILLS[c].some((x) => x && x.v === s)); };

// ---- THE LESSON RULES (sheet/lesson-rules.js)
eq(LR.itemKey('9 + 1 = ?', '10'), LR.itemKey('1 + 9 = ?', '10'), 'LR-5: a turnaround is the same item');
ok(LR.itemKey('Which place?', 'tens', 78) !== LR.itemKey('Which place?', 'tens', 42), 'LR-5: a place-value item is keyed by its number');
ok(LR.nearTwins([51, 44], [53, 45]) && LR.nearTwins([27, 19], [77, 19]) && !LR.nearTwins([52, 39], [70, 23]), 'LR-6: near twins');
eq(LR.casesOf({ text: '36 − 29 = ?', ops: [36, 29] }).join(','), 'twoPlace,underTen', 'LR-1: 36 - 29 is a two-place take-away with an answer under 10');
eq(LR.casesOf({ text: '60 − 3 = ?', ops: [60, 3] }).join(','), 'onePlace,zeroOnes', 'LR-1: 60 - 3 is one-place, 0 in the ones');
eq(LR.casesOf({ kind: 'round', n: 98, place: 10, text: 'Round 98' }).join(','), 'roundUp,toHundred', 'LR-1: 98 rounds up to 100');
const pk = (part, text, ops, ans) => ({ part, skill: 'subtraction:sub_100_regroup', text, ops, ans });
const V = LR.packetViolations({
    lesson: { skill: 'subtraction:sub_100_regroup', cases: ['twoPlace', 'onePlace', 'zeroOnes', 'underTen'], caps: { onePlace: 1, underTen: 2 } },
    placed: [pk('chart', '52 − 39 = ?', [52, 39], '13'), pk('practice', '52 − 39 = ?', [52, 39], '13'), pk('practice', '62 − 59 = ?', [62, 59], '3'),
        pk('practice', '64 − 59 = ?', [64, 59], '5'), pk('practice', '31 − 25 = ?', [31, 25], '6'), pk('practice', '100 − 47 = ?', [100, 47], '53')],
    chartCases: ['twoPlace'],
}).map((v) => v.rule);
ok(['LR-1', 'LR-2', 'LR-5', 'LR-6', 'LR-7'].every((r) => V.includes(r)), `LR: a packet breaking five rules is caught (${[...new Set(V)].join(', ')})`);
eq(LR.packetViolations({ lesson: { cases: [] }, placed: [], sizePrinted: 'M', packetSize: 'L' }).map((v) => v.rule).join(','), 'LR-10', 'LR-10: a packet printed off its one size fails');
eq(LR.packetViolations({ lesson: { cases: [] }, placed: [], sizePrinted: 'L', packetSize: 'L' }).length, 0, 'LR-10: a packet at its size passes');

// ---- THE LESSON LIBRARY
const caseNames = Object.values(LR.CASE_FAMILIES).flatMap((f) => Object.keys(f));
eq(LIB.validateLibrary({ stepIcons: PRE.STEP_ICONS, caseNames, skillExists }).join('; '), '', 'library: no structural problem');
eq(LIB.lessonById('add-within-10') && LIB.lessonById('add-within-10').id, 'Y1.B2.S9', 'library: an older slug finds its lesson');
eq(LIB.lessonIdOf('round-nearest-10'), 'Y4.B1.S14', 'library: lessonIdOf reads a slug');
eq(LIB.lessonIdOf('nope'), null, 'library: an unknown id is null');
eq(LIB.practiceRef('Y1.B2.S9'), { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10, constant: [1, 2, 3] } }, 'library: the practice options live in the lesson record');
eq((LIB.defaultLessonForSkill('subtraction', 'sub_100_regroup') || {}).id, 'Y2.B2.S18', 'library: a skill finds its default lesson');
eq(LIB.defaultLessonForSkill('multiplication', 'mult_facts'), null, 'library: a skill with no lesson has none');
eq([SCHEMA.kindOf('Y2.B2.S18'), SCHEMA.kindOf('ccss:6.NS.A.1'), SCHEMA.kindOf('ee:M.EE.6.SP.1'), SCHEMA.kindOf('skill:addition:add_facts'), SCHEMA.kindOf('Y9.B1')].join(','), 'wrm,ccss,ee,skill,', 'library: lesson id kinds');

// lessonData = lessonFor (the engine record, unchanged) + prereqs
for (const id of Object.keys(LIB.LESSONS)) {
    const ref = LIB.practiceRef(id);
    const d = LIB.lessonData(id);
    const f = PRE.lessonFor(ref.categoryId, ref.skillId);
    const { prereqs, ...rest } = d;
    eq(rest, JSON.parse(JSON.stringify(f)), `library: lessonData(${id}) is lessonFor(${ref.categoryId}, ${ref.skillId}) plus prereqs`);
    ok(!('archetype' in d) && !('cases' in d) && !('caps' in d) && !('casesPending' in d), `library: lessonData(${id}) hands no library-only field to the engine`);
    ok(!('prereqs' in f), `prereqs.js: lessonFor(${ref.categoryId}, ${ref.skillId}) carries no prereqs (byte-identical packets)`);
}
const yp = LIB.lessonData('Y2.B2.S18').prereqs;
eq(yp.map((p) => Object.keys(p).sort().join(',')), ['lesson,ref,title,why', 'lesson,ref,title,why', 'lesson,ref,title,why', 'lesson,ref,title,why'], 'LR-17: each question {lesson, title, why, ref}');
eq(yp[0], { lesson: 'Y2.B1.S4', title: 'Use a place value chart', why: 'Regrouping reads the tens digit and the ones digit.', ref: { categoryId: 'placevalue', skillId: 'identify', opts: { band: 99, places: [1, 10] } } }, 'LR-17: question 1 of Y2.B2.S18');
eq(yp[2].ref, { categoryId: 'subtraction', skillId: 'sub_10_regroup', check: true }, 'LR-17: a question ref carries its floors (check)');
yp[0].ref.opts.band = 1;
eq(LIB.lessonData('Y2.B2.S18').prereqs[0].ref.opts.band, 99, 'library: lessonData hands out fresh objects');
eq(LIB.lessonData('Y2.B2.S17').prereqs, undefined, 'LR-17: a lesson whose check is pending has no prereqs (keeps its Warm-up)');
eq(LIB.lessonRules('Y4.B1.S14').cases, ['roundUp', 'roundDown', 'endsFive', 'toHundred'], 'library: lessonRules gives the gates the cases');
eq(LIB.lessonRules('Y2.B2.S18').caps, { onePlace: 1, underTen: 2 }, 'library: lessonRules gives the gates the caps');
eq(LIB.lessonRules('Y3.B2.S12').cases, null, 'library: a routine with casesPending declares none');
eq(PRE.lessonDataById('subtract-2-digit-regroup').prereqs.length, 4, 'prereqs.js: lessonDataById reads a slug');
eq(PRE.lessonFor('subtraction', 'sub_1m_no_regroup').warmRows, ['S', 'M'], 'prereqs.js: a lesson\'s teach fields reach the engine record');
eq(PRE.lessonFor('subtraction', 'sub_10k_no_regroup').steps[2].text, 'Each place to the left.', 'prereqs.js: a shared routine with the lesson\'s own steps');
eq(PRE.lessonFor('addition', 'add_10_regroup'), null, 'prereqs.js: a skill with no lesson is null');

// The prerequisite skills (plan §8e): a lesson's own check, else its Warm-up, else the seed's fallback.
eq(LIB.prerequisiteSkillsFor('subtraction', 'sub_100_regroup').map((p) => p.skillId).join(','), 'identify,expand,sub_10_regroup,sub_100_no_regroup', 'library: a skill with a lesson lists its Prerequisite Check skills');
eq(LIB.prerequisiteSkillsFor('subtraction', 'sub_100_regroup')[0].lesson, 'Y2.B1.S4', 'library: each with the lesson it routes to');
eq(LIB.prerequisiteSkillsFor('subtraction', 'sub_1k_no_regroup').map((p) => p.skillId).join(','), 'sub_100_no_regroup,subtract', 'library: a lesson with no check lists its Warm-up');
const mf = LIB.prerequisiteSkillsFor('multiplication', 'mult_facts');
ok(mf.length > 0 && mf.every((p) => p.categoryId && p.skillId && p.why && skillExists(`${p.categoryId}:${p.skillId}`) && `${p.categoryId}:${p.skillId}` !== 'multiplication:mult_facts'), 'library: a skill with no lesson takes the seed fallback, live, each with its reason, never itself');

// LR-17: the Prerequisite Check - 3 or 4 questions, routed earliest-missed first; both shapes.
const lsn = LIB.lessonById('Y2.B2.S18');
const two = Object.assign({}, lsn, { prereqs: lsn.prereqs.slice(0, 2) });
ok(SCHEMA.validateLesson('Y2.B2.S18', two).some((m) => /LR-17/.test(m)) && !SCHEMA.validateLesson('Y2.B2.S18', lsn, { skillExists }).length, 'LR-17: a check of 2 questions fails, the sample passes');
ok(SCHEMA.validateLesson('Y2.B2.S18', Object.assign({}, lsn, { prereqs: lsn.prereqs.concat([{ lesson: 'Y2.B2.S18', title: 'x', key: 'addition:add_facts', why: 'x' }]) })).some((m) => /own prerequisite/.test(m)), 'LR-17: 5 questions or a self-prerequisite fails');
ok(SCHEMA.validateLesson('Y2.B2.S18', Object.assign({}, lsn, { prereqs: lsn.prereqs.map((p, i) => (i ? p : Object.assign({}, p, { key: 'placevalue:zz_gone' }))) }), { skillExists }).some((m) => /not live/.test(m)), 'LR-17: a dead skill fails');
ok(SCHEMA.validateLesson('Y2.B2.S18', Object.assign({}, lsn, { prereqs: undefined, prereqsPending: '' })).some((m) => /no Prerequisite Check/.test(m)), 'LR-17: a lesson with neither a check nor a reason fails');
for (const d of Object.values(DET.DETAILED_LESSONS)) eq(SCHEMA.validatePrereqs(d.id, d.prerequisites, { skillExists }), [], `LR-17: detailed lesson ${d.id} keeps the rules`);
const det = Object.values(DET.DETAILED_LESSONS)[0];
ok(SCHEMA.validatePrereqs(det.id, det.prerequisites.slice(0, 2), { skillExists }).some((m) => /2 question/.test(m)), 'LR-17: a detailed check of 2 questions fails');
eq(SCHEMA.prereqOf(det.prerequisites[0]).key, `${det.prerequisites[0].ref.categoryId}:${det.prerequisites[0].ref.skillId}`, 'LR-17: prereqOf reads the detailed shape');
eq(LIB.prereqRoute('Y2.B2.S18', [4, 2]).map((r) => r.lesson).join(','), 'Y2.B1.S5,Y2.B2.S17,Y2.B2.S18', 'LR-17: two misses go earliest first, then back to the lesson');
eq(LIB.prereqRoute('Y2.B2.S18', ['Y2.B2.S17']).map((r) => [r.lesson, !!r.built, !!r.back]), [['Y2.B2.S17', true, false], ['Y2.B2.S18', false, true]], 'LR-17: a route names whether its lesson is built');
eq(LIB.prereqRoute('Y2.B2.S18', []).length, 0, 'LR-17: nothing missed - straight to the anchor chart');

// ---- Lesson NEEDS reach the build list (plan §2): a match blocks the entry, a new need is an entry.
const blOpt = BL.buildList(null, []).find((e) => e.kind === 'option');
const blMerged = BL.buildList(null, [{ lesson: 'Y2.B2.S18', kind: 'option', skill: blOpt.skill, option: blOpt.option, name: 'x' },
    { lesson: 'Y3.B2.S1', kind: 'skill', skill: 'addition:zz_unit', name: 'n' }, { lesson: 'Y1.B2.S9', kind: 'lesson', prereq: 'Y1.B1.S2', name: 'p' }]);
ok(blMerged.find((e) => e.id === blOpt.id).lessonsBlocked.includes('Y2.B2.S18') && blMerged.some((e) => e.source === 'lesson' && e.skill === 'addition:zz_unit')
    && !blMerged.some((e) => e.lessonsBlocked.includes('Y1.B2.S9')), 'build list: a lesson need blocks its entry or adds one; a missing lesson stays off the skill list');
eq(BL.buildList().map((e) => e.id), BL.buildList(null, []).map((e) => e.id), 'build list: today\'s NEEDS (prerequisite lessons only) leave the list unchanged');

for (const f of fails) console.log(`  FAIL ${f}`);
console.log(fails.length ? `ws-lesson-unit: FAIL (${fails.length} of ${pass + fails.length})` : `ws-lesson-unit: OK (${pass} checks)`);
process.exit(fails.length ? 1 : 0);
