// js/modules/lessons/schema.js
// THE LESSON LIBRARY'S SHAPES (design/LESSON_LIBRARY_PLAN.md §1-2): what a ROUTINE (the teaching,
// hand-authored) and a LESSON (a routine + a practice link + tags) hold, the id kinds, the
// archetypes and the families, and the validators the library and ws-lesson-coverage run.
//
// A ROUTINE is the teaching - it can serve several lessons (a shared routine across ranges). Its
// fields are the record the lesson engine reads (roles/lesson.js, print-sheet.js buildLesson: the
// shape the first sample lessons had in lessons/prereqs.js), plus the library's own fields, which
// lessonData() never hands to the engine (LIBRARY_ONLY):
//   {
//     archetype: 'fact' | 'column' | 'line' | ...     ARCHETYPES (the engine renders each from data)   [library]
//     steps:    [{icon, text}]                         2-5 words each, one distinct icon each (LR-3)
//     chant:    '...' | ''                             a short rule to say together, or none
//     format:   {kind, why}                            the memorable-step format and why
//     concepts: [{id, text}]                           the ideas the skill leans on
//     vocab:    [{word, meaning, picture}]             <= 3 words, each with a picture (P-LG-6). DATA:
//                                                      the vocabulary band draws it today; the planned
//                                                      vocabulary redesign reads the same records (D2)
//     example:  {match, test?, prefer?}                the worked example the chart draws
//     second / third / fourth: {test, label, ref?}     the chart's other examples (LR-1)
//     cases?:   ['bigFirst', ...]                      the cases the routine teaches (LR-1, LR-2;   [library]
//                                                      names from sheet/lesson-rules.js CASE_FAMILIES)
//     casesPending?: 'why'                             no `cases` declared yet, and why             [library]
//     caps?:    {case: n}                              at most n a page (LR-7)                      [library]
//     guided?:  ['roundUp', ...]                       Guided practice's cases, in order
//     floors:   minOperand, minTop, maxTop, maxSmall, distinctFirst, distinctAnswer (LR-2, LR-6)
//     words?, notes?, checkRow?, warmRows?             the provider's words in the lesson's terms,
//                                                      step notes, a Check line under each problem,
//                                                      the Warm-up's own row at these sizes
//   }
//
// A LESSON is thin (its title, grade, block, CCSS / EE come from its WRM step - seed-db.js):
//   {
//     routine:  'routine id'                           the teaching it uses
//     teach?:   {field: value}                         the routine's fields this lesson sets for itself
//                                                      (a shared routine across ranges: its own vocab
//                                                      pictures, steps, warmRows ...); merged over the
//                                                      routine, and validated as the merged routine
//     slug?:    'add-within-10'                        an older name (the sample folders, the
//                                                      critic grades): lessonById accepts it
//     practice: {skill: 'category:skill', opts?}       THE skill that practises it, with the option
//                                                      values the lesson deals (LINK-1)
//     defaultFor?: true                                the lesson a skill-keyed request prints
//     warmup:   [{key, opts?, why, ...floors}]         the Warm-up's prerequisite skills (the engine's
//                                                      `skills`; a lesson with `prereqs` replaces its
//                                                      Warm-up with the Prerequisite Check, LR-17)
//     prereqs?: [{lesson, title, key, opts?, why, items?, ...floors}]
//                                                      THE PREREQUISITE CHECK (LR-17, owner ruling
//                                                      2026-09-26, plan §8b): 3-4 questions, most basic
//                                                      first, each tied to ONE prerequisite lesson (a
//                                                      library lesson id, or a NEEDS entry while it is
//                                                      not written) and the skill + options its question
//                                                      is dealt from. Drawn by sheet/roles/pre-skill-check.js
//                                                      (the one Prerequisite Check, lead decision D1).
//     prereqsPending?: 'why'                           no Prerequisite Check yet (the lesson keeps its
//                                                      Warm-up), and why
//     mixWith:  [{key, opts?, title?, ...floors}]      Mixed practice partners (EARLIER skills, LR-9)
//     steps?:   ['Y1.B2.S9', ...]                      further WRM steps it teaches (aliases)
//     note?:    '...'                                  why this step / this skill (a reviewer's note)
//   }
//
// The DETAILED lessons (lessons/detailed/*.js, the V22 maker) carry the same concept in their own
// shape - `prerequisites: [{atom, items?, ref: {categoryId, skillId, opts?}, lesson: {id, title}}]` -
// and validatePrereqs() checks both shapes with one set of rules.
//
// A NEED (a lesson lane's request to the skill lanes, merged into build-list.js):
//   {lesson, kind: 'skill' | 'option' | 'steps' | 'lesson', skill?, option?, prereq?, name, why}
//
// Pure data and functions (no DOM, no state).

/** Lesson id kinds (§1): a WRM small step, an Awsaj supplement, a CCSS code, an EE, a skill. */
export const LESSON_KINDS = Object.freeze(['wrm', 'sup', 'ccss', 'ee', 'skill']);

/** The kind of a lesson id, or null when it is none of them. */
export function kindOf(id) {
    const s = String(id || '');
    if (/^(R|Y[1-6])\.B\d+\.S\d+$/.test(s)) return 'wrm';
    if (/^sup:[A-Z0-9][\w.]*$/.test(s)) return 'sup';
    if (/^ccss:[\w.]+$/.test(s)) return 'ccss';
    if (/^ee:[\w.]+$/.test(s)) return 'ee';
    if (/^skill:[a-z0-9_]+:[a-z0-9_]+$/.test(s)) return 'skill';
    return null;
}

/** The 13 archetypes (§6): the engine renders each from data; A1-A3 are certified by the samples. */
export const ARCHETYPES = Object.freeze({
    column: { code: 'A1', name: 'column - written algorithm', templates: ['stack', 'long-division', 'long-multiplication'] },
    fact: { code: 'A2', name: 'fact - fact strategy, tables', templates: ['fact', 'family', 'equation'] },
    line: { code: 'A3', name: 'line - number line, rounding, negatives', templates: ['number-line', 'hop-line', 'value-line', 'pv'] },
    pv: { code: 'A4', name: 'pv - place-value chart, base 10, x / ÷ 10, decimals', templates: ['pv', 'base10', 'pv-exchange'] },
    partwhole: { code: 'A5', name: 'partwhole - bonds, bar model, missing number, algebra', templates: ['bond', 'equation', 'cloze', 'bar-model'] },
    count: { code: 'A6', name: 'count - picture counting, early number', templates: ['counters', 'tenframe', 'count-row', 'k2kit'] },
    groups: { code: 'A7', name: 'groups - equal groups, arrays, sharing, area model', templates: ['ops-counters', 'area-model', 'mult-grid'] },
    fraction: { code: 'A8', name: 'fraction - shapes, bars, lines, sets, %, ratio', templates: ['frac-model', 'hundred-square'] },
    measure: { code: 'A9', name: 'measure - scales, units, perimeter / area', templates: ['figures', 'measure-scale', 'shape-figure'] },
    timemoney: { code: 'A10', name: 'timemoney - clocks, time, coins', templates: ['clock', 'timeline', 'coins', 'tmkit'] },
    shape: { code: 'A11', name: 'shape - properties, angles, symmetry, 3-D, position', templates: ['shapes', 'coord-grid', 'solid-kit', 'angle-kit'] },
    data: { code: 'A12', name: 'data - pictogram, bar, tally, tables, line, pie', templates: ['figures', 'graph-axes', 'data-table'] },
    story: { code: 'A13', name: 'story - word problems', templates: ['word-work'] },
});
export const ARCHETYPE_IDS = Object.freeze(Object.keys(ARCHETYPES));

/** The lesson families (§2): one lesson lane each, one file each in lessons/families/. */
export const FAMILY_IDS = Object.freeze(['early', 'placevalue', 'addsub', 'multdiv', 'fractions', 'measure', 'timemoney', 'geometry', 'data', 'algebra']);

/** Need kinds (§3): what a lesson waits for. */
export const NEED_KINDS = Object.freeze(['skill', 'option', 'steps', 'lesson']);

/** A routine's fields the library keeps for itself: lessonData() never hands them to the engine. */
export const LIBRARY_ONLY = Object.freeze(['archetype', 'cases', 'casesPending', 'caps']);

/** A Prerequisite Check holds 3 or 4 questions (owner ruling 2026-09-26). */
export const PREREQ_MIN = 3;
export const PREREQ_MAX = 4;

const isSkillKey = (k) => /^[a-z0-9_]+:[a-z0-9_]+$/.test(String(k || ''));

/**
 * The problems of one routine, [] when it is well formed.
 * @param {string} id
 * @param {object} r
 * @param {{stepIcons?: string[], caseNames?: string[]}} [known]
 */
export function validateRoutine(id, r, known = {}) {
    const bad = [];
    const e = (m) => bad.push(`routine ${id}: ${m}`);
    if (!r || typeof r !== 'object') return [`routine ${id}: not an object`];
    if (!ARCHETYPE_IDS.includes(r.archetype)) e(`archetype "${r.archetype}" is not one of ${ARCHETYPE_IDS.join(', ')}`);
    if (!Array.isArray(r.steps) || r.steps.length < 2 || r.steps.length > 10) e('steps: 2-10 steps');
    else {
        const icons = r.steps.map((s) => s && s.icon);
        if (new Set(icons).size !== icons.length) e('LR-3: two steps share an icon');
        if (known.stepIcons) for (const i of icons) if (!known.stepIcons.includes(i)) e(`LR-3: "${i}" is not a drawn icon`);
        for (const s of r.steps) if (!s || !String(s.text || '').trim()) e('a step without words');
    }
    if (typeof r.chant !== 'string') e('chant: a string ("" for none)');
    if (!r.format || !r.format.kind || !r.format.why) e('format: {kind, why}');
    if (!Array.isArray(r.vocab) || r.vocab.length > 3) e('vocab: at most 3 words');
    else for (const v of r.vocab) if (!v || !v.word || !v.picture) e(`vocab "${v && v.word}": a word and a picture`);
    if (!Array.isArray(r.concepts)) e('concepts: a list');
    if (!r.example || !r.example.match) e('example: {match}');
    if (Array.isArray(r.cases) && r.cases.length) {
        if (known.caseNames) for (const c of r.cases) if (!known.caseNames.includes(c)) e(`LR-1: unknown case "${c}"`);
    } else if (!String(r.casesPending || '').trim()) e('LR-1: declare the cases (or casesPending: why not yet)');
    for (const k of ['second', 'third', 'fourth']) if (r[k] && (!r[k].test || !r[k].label)) e(`${k}: {test, label}`);
    return bad;
}

/**
 * The problems of a Prerequisite Check (LR-17), in either shape, [] when it is sound:
 *   - the library's `prereqs`: [{lesson, title, key, opts?, why}]
 *   - a detailed lesson's `prerequisites`: [{atom, items?, ref: {categoryId, skillId, opts?}, lesson: {id, title}}]
 * Rules: 3-4 questions; each names its lesson (id and title) and a skill; a live skill; never the
 * lesson itself; no lesson twice. "Most basic first", "a real lesson or a NEEDS entry" and "no cycle"
 * need the whole library and the curriculum order: ws-lesson-coverage checks them.
 * @param {string} ownerId          the lesson the check opens
 * @param {Array} list
 * @param {{skillExists?: (key: string) => boolean, strictIds?: boolean}} [known]
 *        strictIds: every prerequisite lesson id must be a library id kind (kindOf) - true for the
 *        library; a detailed lesson names a site lesson or a CCSS code (V22 Appendix H) instead
 */
export function validatePrereqs(ownerId, list, known = {}) {
    const bad = [];
    const e = (m) => bad.push(`lesson ${ownerId}: LR-17: ${m}`);
    const pre = Array.isArray(list) ? list : [];
    if (pre.length < PREREQ_MIN || pre.length > PREREQ_MAX) e(`a Prerequisite Check of ${pre.length} question(s) (${PREREQ_MIN}-${PREREQ_MAX})`);
    const seen = new Set();
    for (const [i, p] of pre.entries()) {
        const n = prereqOf(p);
        const at = `question ${i + 1}`;
        if (!n) { e(`${at}: not a prerequisite record`); continue; }
        if (!n.lesson) e(`${at}: names no lesson`);
        else if (known.strictIds && !kindOf(n.lesson)) e(`${at}: "${n.lesson}" is not a lesson id`);
        if (!String(n.title || '').trim()) e(`${at}: the lesson ${n.lesson || '?'} has no title`);
        if (n.lesson && n.lesson === ownerId) e(`${at}: the lesson is its own prerequisite`);
        if (n.lesson && seen.has(n.lesson) && known.strictIds) e(`${at}: ${n.lesson} is asked twice`);
        if (n.lesson) seen.add(n.lesson);
        if (!isSkillKey(n.key)) e(`${at}: "${n.key}" is not a skill key`);
        else if (known.skillExists && !known.skillExists(n.key)) e(`${at}: ${n.key} is not live`);
        if (p && p.ref === undefined && !String(p.why || '').trim()) e(`${at}: no why`);
    }
    return bad;
}

/**
 * One prerequisite record in the common form {lesson, title, key, opts?, why}, from either shape
 * (the library's or a detailed lesson's), or null.
 */
export function prereqOf(p) {
    if (!p || typeof p !== 'object') return null;
    if (p.ref && typeof p.ref === 'object') {
        const l = p.lesson && typeof p.lesson === 'object' ? p.lesson : { id: p.lesson };
        return { lesson: String(l.id || ''), title: String(l.title || ''), key: `${p.ref.categoryId}:${p.ref.skillId}`, opts: p.ref.opts, why: String(p.why || '') };
    }
    return { lesson: String(p.lesson || ''), title: String(p.title || ''), key: String(p.key || ''), opts: p.opts, why: String(p.why || '') };
}

/**
 * The problems of one lesson, [] when it is well formed.
 * @param {string} id
 * @param {object} l
 * @param {{routines?: object, skillExists?: (key: string) => boolean}} [known]
 */
export function validateLesson(id, l, known = {}) {
    const bad = [];
    const e = (m) => bad.push(`lesson ${id}: ${m}`);
    if (!kindOf(id)) e('the id is not a WRM step, sup:, ccss:, ee: or skill: id');
    if (!l || typeof l !== 'object') return bad.concat([`lesson ${id}: not an object`]);
    if (!l.routine) e('no routine');
    else if (known.routines && !known.routines[l.routine]) e(`unknown routine "${l.routine}"`);
    if (l.teach !== undefined && (!l.teach || typeof l.teach !== 'object' || Array.isArray(l.teach))) e('teach: an object of routine fields');
    if (!l.practice || !isSkillKey(l.practice.skill)) e('practice: {skill: "category:skill", opts?}');
    else if (known.skillExists && !known.skillExists(l.practice.skill)) e(`practice skill ${l.practice.skill} is not live`);
    if (!Array.isArray(l.warmup)) e('warmup: a list (the Warm-up skills; [] when the Prerequisite Check replaces it)');
    for (const w of l.warmup || []) {
        if (!isSkillKey(w.key)) e(`warm-up "${w.key}" is not a skill key`);
        else if (known.skillExists && !known.skillExists(w.key)) e(`warm-up skill ${w.key} is not live`);
    }
    // LR-17: the Prerequisite Check (or why it is not written yet).
    if (l.prereqs !== undefined) bad.push(...validatePrereqs(id, l.prereqs, Object.assign({ strictIds: true }, known)));
    else if (!String(l.prereqsPending || '').trim()) e('LR-17: no Prerequisite Check (`prereqs`, or `prereqsPending`: why not yet)');
    if (!(l.mixWith || []).length) e('LR-18: no Mixed partners (the mixed part)');
    for (const m of l.mixWith || []) {
        if (!isSkillKey(m.key)) e(`mixWith "${m.key}" is not a skill key`);
        else if (known.skillExists && !known.skillExists(m.key)) e(`Mixed partner ${m.key} is not live`);
    }
    if (l.steps) for (const s of l.steps) if (kindOf(s) !== 'wrm') e(`steps: "${s}" is not a WRM step id`);
    return bad;
}

/** The problems of one need, [] when it is well formed. */
export function validateNeed(n) {
    const bad = [];
    if (!n || !n.lesson) return ['a need without a lesson'];
    if (!NEED_KINDS.includes(n.kind)) bad.push(`need of ${n.lesson}: kind "${n.kind}"`);
    if ((n.kind === 'skill' || n.kind === 'option') && !n.skill) bad.push(`need of ${n.lesson}: a ${n.kind} need names its skill`);
    if (n.kind === 'option' && !n.option) bad.push(`need of ${n.lesson}: an option need names its option`);
    if (n.kind === 'lesson' && !kindOf(n.prereq)) bad.push(`need of ${n.lesson}: a lesson need names the lesson id it waits for (prereq)`);
    if (!n.name) bad.push(`need of ${n.lesson}: no name`);
    return bad;
}

export default {
    LESSON_KINDS, kindOf, ARCHETYPES, ARCHETYPE_IDS, FAMILY_IDS, NEED_KINDS, LIBRARY_ONLY, PREREQ_MIN, PREREQ_MAX,
    validateRoutine, validatePrereqs, prereqOf, validateLesson, validateNeed,
};
