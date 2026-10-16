// js/modules/lessons/detailed/index.js
// THE DETAILED LESSON REGISTRY (Wave 8, owner plan 2026-10-16): the lessons the DETAILED lesson
// maker prints (Atomisation Lesson Planner V22, design/lesson-planner/DETAILED_MAKER.md). One file
// per lesson in this folder, pure data; this file lists them and documents the format.
//
// ------------------------------------------------------------------------------ THE FORMAT
// A description holds everything the teacher pages need that the generators cannot supply. Every
// PROBLEM on every page is still dealt by generateQuestionFor (print-sheet.js buildDetailedLesson)
// from the skill refs below; every standard printed comes from js/modules/standards.js (the
// description's ccss / ee are CHECKED against it, never printed from here).
//
//   id            'g2-nbt3-read-write-1000'           the lesson id (file name)
//   title         'I Can ...'                          the one I Can title of every page (<= 60 chars)
//   grade, level  '2', 2                               footer grade; strand-tab "Level n"
//   strand        'Number'                             strand-tab line 2 (<= 12 characters)
//   ccss, ee      ['2.NBT.A.3'], ['M.EE.2.NBT.3']      must be tags of `skill` in SKILL_STANDARDS
//   cra           'Pictorial → Abstract'               T1 standards line
//   skill         {categoryId, skillId, opts, ...ref floors}   the practice skill (P2-P4). Ref floors
//                 are print-sheet.js refAccepts': minNum / maxNum (the item's number), range
//                 (state.range for a generator that reads it), edge, avoidNums (set by the bridge)
//   practicePages n                                    P4 pages (1-2); `mixed: {skills: [refs]}` adds Mixed
//   lessonData    the prereqs.js LESSONS shape          the anchor chart + lesson sheet data that
//                 roles/lesson.js draws (steps, vocab, chant, example / second / third case tests).
//                 It is passed to the standard lesson role as `lessonData`; prereqs.js is untouched.
//   pool, edgeTest {kind: 'range', lo, hi} | {kind: 'list', items}; a roles/lesson.js CASE_TESTS name
//                 (the ★★★ last row and the pool's `edge` list). Absent pool: the pack's own places.
//   boardOnly     [1000]                               numbers shown on the board only (a script may say
//                 them): a HARD bound on every ref of the pack (print-sheet.js refHardOk) - never a pupil
//                 item's number or answer, never on a key; the pool must not hold them; self-check E30
//   practiceSheets [{skill?, shape?: [count, cols], chunk?, edgeLast?: {per, cols, wants: [case]}}]
//                 each Practice page its own sheet ({} = the lesson skill); `chunk` puts that chunk's Steps
//                 on it; `edgeLast.wants` names the case of each ★★★ place (a wanted case is kept for it)
//   chunks        [{id: 'a', name}, {id: 'b', name, skill, lessonData}]   V22 Chunked Flow: chunk a is the
//                 lesson's own skill + lessonData; every further chunk prints its own anchor chart (P2b)
//                 and lesson sheet (P3b); sections '5a' '6a' '5b' '6b' script them ({b.chart.*}, {b.we.i.*})
//   caseNames     {caseTest: words}                    names the cases {p4.last} reads (T5 Watch)
//   board, routeNote, slotRows                         T2 Board line, T2b routing note, T2b extra slot shapes
//   vars(q, base) -> {...}                             the lesson's own placeholder names for one dealt item
//                 (base = the kit's readers: n, ans, a, b, op, say, words, text); eqParts / eqOp set
//                 the word problem's equation frame
//   checkQuestion {want, correct}                     the Check Question item (a case test) and its right letter;
//                 the options are the main skill provider's wrong answers, claimed by mistakes[].misconception
//   prerequisites [{atom, items?, ref, lesson: {id, title}}]   P0: ONE question per Pre-requisite atom, most basic first
//   numberSense   {A: ref, B: ref}                     P1 bands (5 items each)
//   wordProblem   {ref, want, lines: [...], unit, say} P5: story lines with {wp.*} placeholders
//   exit          [{case, ref, want, detects}] x 4     P6 items, one per case; `exitSay` its Say frame
//   retrieval     [{ref, ask}]                         T3 spaced retrieval (mini whiteboards)
//   t1Boxes       [{kind, title, text}] <= 3           T1 Lesson guidance (tip | language | why | watch ...)
//   materials     [text]                               T1 check-box list
//   vocabulary    [{word, gloss, diagram: {kind: 'digit'|'pv'|'text', ...}}] <= 3   T1 cards
//   atoms         [{type, skill: 'Key name: ...', notes, prereq?, critical?}] >= 5   T2 §1
//                 (types only Category / Comparative / Fact / Conceptual; Pre-requisite rows first)
//   routine       [{step, tag: 'Pre-requisite'|'New', check, critical?}]           T2 §2
//   howToTeach    [text]                               T2 How to teach
//   mistakes      [{name, step, looks, fix, option}]   T2 Common mistakes (option = Check Question letter)
//   sections      [{n, name, min, page, boxes?, rows: [{do, say, ask, note}], loop?}]  T3-T5, sections 1-10
//   accepted      [text]                               T6 Accepted answers
//   wrongAnswers  [{wrote, mistake, next}]             T6 Wrong answers to look for when marking
//
// PLACEHOLDERS. A script, story or frame never types a number: it names a dealt item. Every name
// below is an item's vars (base readers + the description's `vars` hook):
//   {chart.*} {chart2.*} {chart3.*}   the anchor chart's worked example and its other examples
//   {we.i.*}                      the Guided cells       {pre.i.*}  P0 question i's first item
//   {ns.A.i.*} {ns.B.i.*}         Number sense bands     {ret.i.*} {ret.i.ask}  spaced retrieval
//   {cq.n} {cq.A..D} {cq.right} {cq.why}   the Check Question (options from the provider's wrong answers)
//   {wp.*} {wp.eq}  the word problem   {exit.i.*}  the exit slip   {say.*}  the exit slip's fresh Say item
//   {pre.i.letters} {pre.i.list} {p0.list}   P0's item letters and answers, read from its plan
//   {p4.last}       every Practice page's last row, each number with its case (caseNames)
//   {<chunk>.chart.*} {<chunk>.we.i.*}   a chunk's own chart and Guided items; {x.Words} = capitalised name
// `fillPlaceholders` throws on an unknown name, so a typo never prints.
//
// ADDING A LESSON: write <id>.js in this folder, add it to DETAILED_LESSONS below, run
// `node tests/scripts/ws-detailed-lesson.cjs --lesson <id> --check`, look at every page PNG.
//
// Pure module (SCC-01): no DOM, no state, no Math.random.

import lesson1 from './g2-nbt3-read-write-1000.js';
import lesson2 from './g1-oa1-bar-model-wp-20.js';

export const DETAILED_LESSONS = Object.freeze({
    [lesson1.id]: lesson1,
    [lesson2.id]: lesson2,
});

/** The description of a detailed lesson, or null. */
export const detailedLessonFor = (id) => DETAILED_LESSONS[String(id || '')] || null;

/** The registry as a list for the print screen: [{id, title, grade, ccss}]. */
export const detailedLessonList = () => Object.values(DETAILED_LESSONS).map((d) => ({ id: d.id, title: d.title, grade: d.grade, ccss: d.ccss.slice() }));

/** US number names to 1,000 (no "and", hyphenated tens): the form the number_word_form generator writes. */
export function numberName(n) {
    const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
        'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const two = (v) => (v < 20 ? ones[v] : tens[Math.floor(v / 10)] + (v % 10 ? `-${ones[v % 10]}` : ''));
    n = Math.trunc(Number(n));
    if (n === 1000) return 'one thousand';
    if (n < 100) return two(n);
    const h = Math.floor(n / 100), r = n % 100;
    return `${ones[h]} hundred${r ? ` ${two(r)}` : ''}`;
}

/** Fill {a.b.c} names from `vars`; an unknown name throws (a script never prints a typo). */
export function fillPlaceholders(text, vars) {
    return String(text).replace(/\{([a-zA-Z0-9_.]+)\}/g, (m, path) => {
        const v = path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), vars);
        if (v === undefined || v === null) throw new Error(`detailed lesson: unknown placeholder {${path}}`);
        return String(v);
    });
}

/** A description's own consistency (the bridge also checks its tags against standards.js). */
export function validateDescription(d) {
    const errs = [];
    if (!d || !d.id) return ['no id'];
    if (!/^I Can /.test(d.title || '') || d.title.length > 60) errs.push('title must start "I Can " and be <= 60 characters');
    if (String(d.strand || '').length > 12) errs.push('strand over 12 characters');
    const TYPES = ['Category', 'Comparative', 'Fact', 'Conceptual'];
    if (!(d.atoms || []).length || d.atoms.length < 5) errs.push('T2 needs at least 5 atoms');
    if ((d.atoms || []).some((a) => !TYPES.includes(a.type))) errs.push('atom types are Category / Comparative / Fact / Conceptual only');
    const firstNew = (d.atoms || []).findIndex((a) => !a.prereq);
    if ((d.atoms || []).some((a, i) => a.prereq && firstNew >= 0 && i > firstNew)) errs.push('Pre-requisite atoms come first');
    if ((d.prerequisites || []).length < 3 || d.prerequisites.length > 4) errs.push('P0 needs 3-4 questions');
    if ((d.exit || []).length !== 4) errs.push('the exit slip has 4 items');
    if ((d.vocabulary || []).length > 3 || (d.t1Boxes || []).length > 3) errs.push('at most 3 vocabulary cards and 3 T1 boxes');
    if (d.boardOnly !== undefined) {
        if (!Array.isArray(d.boardOnly) || d.boardOnly.some((v) => !Number.isFinite(Number(v)))) errs.push('boardOnly is a list of numbers');
        else if (d.pool && d.pool.kind === 'range' && d.boardOnly.some((v) => v >= d.pool.lo && v <= d.pool.hi)) errs.push('a boardOnly number is inside the pool range');
        else if (d.pool && d.pool.kind === 'list' && d.boardOnly.some((v) => d.pool.items.map(Number).includes(Number(v)))) errs.push('a boardOnly number is in the pool list');
    }
    const total = (d.sections || []).reduce((a, s) => a + (s.min || 0), 0) + (d.transitionsMin || 0);
    if (total !== 60) errs.push(`the sections add up to ${total} minutes, not 60`);
    for (const s of d.sections || []) for (const r of s.rows || []) for (const k of ['say', 'ask']) {
        if (r[k] && String(r[k]).replace(/\{[^}]+\}/g, 'x').split(/\s+/).length > 12) errs.push(`section ${s.n}: a ${k} line over 12 words`);
    }
    return errs;
}

export default { DETAILED_LESSONS, detailedLessonFor, detailedLessonList, numberName, fillPlaceholders, validateDescription };
