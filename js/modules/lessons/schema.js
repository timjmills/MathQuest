// js/modules/lessons/schema.js
// THE LESSON LIBRARY'S SHAPES (design/LESSON_LIBRARY_PLAN.md §1-2): what a ROUTINE (the teaching,
// hand-authored) and a LESSON (a routine + a practice link + tags) hold, the id kinds, the
// archetypes and the families, and the validators the library and ws-lesson-coverage run.
//
// A ROUTINE is the teaching - it can serve several lessons (a shared routine across ranges):
//   {
//     archetype: 'fact' | 'column' | 'line' | ...     ARCHETYPES (the engine renders each from data)
//     steps:    [{icon, text}]                         2-5 words each, one distinct icon each (LR-3)
//     chant:    '...' | ''                             a short rule to say together, or none
//     format:   {kind, why}                            the memorable-step format and why
//     concepts: [{id, text}]                           the ideas the skill leans on
//     vocab:    [{word, meaning, picture}]             <= 3 words, each with a picture (P-LG-6)
//     example:  {match, test?, prefer?}                the worked example the chart draws
//     second / third / fourth: {test, label, ref?}     the chart's other examples (LR-1)
//     cases:    ['bigFirst', ...]                      the cases the routine teaches (LR-1, LR-2)
//     guided?:  ['roundUp', ...]                       Guided practice's cases, in order
//     caps?:    {case: n}                              at most n a page (LR-7)
//     floors:   minOperand, minTop, maxTop, distinctFirst, distinctAnswer, noNearTwin (LR-2, LR-6)
//     words?, notes?, checkRow?                        the provider's words in the lesson's terms,
//                                                      step notes, a Check line under each problem
//   }
//
// A LESSON is thin (its title, grade, block, CCSS / EE come from its WRM step - seed-db.js):
//   {
//     routine:  'routine id'                           the teaching it uses
//     slug?:    'add-within-10'                        an older name (the sample folders, the
//                                                      critic grades): lessonById accepts it
//     practice: {skill: 'category:skill', opts?}       THE skill that practises it, with the option
//                                                      values the lesson deals (LINK-1)
//     warmup:   [{key, opts?, why}]                    the prerequisite skills the Warm-up reviews
//     mixWith:  [{key, opts?, title?, ...floors}]      Mixed practice partners (EARLIER skills, LR-9)
//     steps?:   ['Y1.B2.S9', ...]                      further WRM steps it teaches (aliases)
//     note?:    '...'                                  why this step / this skill (a reviewer's note)
//   }
//
// A NEED (a lesson lane's request to the skill lanes, merged into build-list.js):
//   {lesson, kind: 'skill' | 'option' | 'steps' | 'lesson', skill?, option?, name, why}
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
    if (!Array.isArray(r.cases) || !r.cases.length) e('LR-1: declare the cases');
    else if (known.caseNames) for (const c of r.cases) if (!known.caseNames.includes(c)) e(`LR-1: unknown case "${c}"`);
    for (const k of ['second', 'third', 'fourth']) if (r[k] && (!r[k].test || !r[k].label)) e(`${k}: {test, label}`);
    return bad;
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
    if (!l.practice || !isSkillKey(l.practice.skill)) e('practice: {skill: "category:skill", opts?}');
    else if (known.skillExists && !known.skillExists(l.practice.skill)) e(`practice skill ${l.practice.skill} is not live`);
    for (const w of l.warmup || []) if (!isSkillKey(w.key)) e(`warm-up "${w.key}" is not a skill key`);
    for (const m of l.mixWith || []) if (!isSkillKey(m.key)) e(`mixWith "${m.key}" is not a skill key`);
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
    if (!n.name) bad.push(`need of ${n.lesson}: no name`);
    return bad;
}

export default { LESSON_KINDS, kindOf, ARCHETYPES, ARCHETYPE_IDS, FAMILY_IDS, NEED_KINDS, validateRoutine, validateLesson, validateNeed };
