// js/modules/sheet/papers.js
// THE THREE PAPERS (owner ruling 2026-09-26, design/LESSON_LIBRARY_PLAN.md §8e): Practice, Quiz
// and Lesson replace the 17 page-type cards. A paper is what the teacher chooses; a ROLE is what
// the engine composes. This file is the one place that maps between them, both ways:
//
//   routePaper(req)   a paper request -> the role request(s) that build it today
//   paperOfRole(role) an old role id (a saved printout, an old share) -> its paper + options
//
// ONE TABLE (PAPER_ROUTES). When the engine lane rebuilds Practice and Quiz on the lesson page
// builders (§8c), only the `role` column of this table changes.
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`.

export const PAPER_IDS = Object.freeze(['practice', 'quiz', 'lesson']);
export const PAPER_NAMES = Object.freeze({ practice: 'Practice', quiz: 'Quiz', lesson: 'Lesson' });

/** The parts of a lesson, in print order (§8e). */
export const LESSON_PARTS = Object.freeze(['prereq', 'chart', 'sheet', 'practice', 'mixed']);
export const LESSON_PART_NAMES = Object.freeze({
    prereq: 'Prerequisite Check', chart: 'Anchor chart', sheet: 'Lesson sheet (We Do)', practice: 'Practice', mixed: 'Mixed practice',
});

/**
 * Paused for later (§8d, §8e): hidden from the Print screen, code kept. A saved printout that used
 * one still builds (buildSheet takes the role id directly).
 */
export const PAUSED_ROLES = Object.freeze(['true-false', 'reason-it', 'stretch', 'error-analysis']);

const FACT_COLS = [5, 6, 7, 8, 9, 10];
const LETTERS = 'ABCDEFGHIJ';
const clampInt = (v, lo, hi, d) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };

/** A word-problem skill (its story layout comes with the skill, not a paper type). */
export const isWordSkill = (k) => /word_problems|_wp$|_story|comparison_word|unknown_start_wp/.test(String((k && k.skillId) || ''));

/**
 * The paper options, normalised. Unknown values fall back to the paper's defaults.
 * @returns {{paper, versions: string[], factColumns: 'off'|'auto'|number, timed: number,
 *            parts: string[], practicePages: number}}
 */
export function paperOptions(req = {}) {
    const paper = PAPER_IDS.includes(req.kind) ? req.kind : 'practice';
    const letters = (Array.isArray(req.versions) ? req.versions : [])
        .map((l) => String(l).toUpperCase()).filter((l, i, a) => LETTERS.includes(l) && a.indexOf(l) === i).sort();
    // A quiz prints Form A and / or Form B (test.js: B is A's problems in a new order).
    const versions = paper === 'quiz' ? (letters.filter((l) => l === 'A' || l === 'B').length ? letters.filter((l) => l === 'A' || l === 'B') : ['A'])
        : letters.length ? letters : ['A'];
    const fc = req.factColumns;
    const factColumns = fc === 'auto' ? 'auto' : FACT_COLS.includes(Number(fc)) ? Number(fc) : 'off';
    const timed = paper === 'practice' ? clampInt(req.timed, 0, 10, 0) : 0;
    const parts = Array.isArray(req.parts) ? LESSON_PARTS.filter((p) => req.parts.includes(p)) : LESSON_PARTS.slice();
    return { paper, versions, factColumns, timed, parts: parts.length ? parts : LESSON_PARTS.slice(), practicePages: clampInt(req.practicePages, 0, 10, 1) };
}

/**
 * THE ROUTING TABLE: the first row whose `when` holds decides the role. `o` = paperOptions(req),
 * `skills` = every skill of the request.
 */
export const PAPER_ROUTES = Object.freeze([
    { paper: 'practice', role: 'fact-probe', when: (o) => o.timed > 0, why: 'timed check: the fact probe (minutes + score line)' },
    { paper: 'practice', role: 'fact-rows', when: (o) => o.factColumns !== 'off', why: 'fact columns: fact rows, 5 to 10 across' },
    { paper: 'practice', role: 'more-practice', when: (o) => o.versions.length > 1, why: 'versions A, B, C...: one page each, new numbers' },
    { paper: 'practice', role: 'word-problems', when: (o, skills) => skills.length > 0 && skills.every(isWordSkill), why: 'word-problem skills: the story-with-work layout' },
    { paper: 'practice', role: 'independent', when: () => true, why: 'one or more skills, dealt by weight' },
    { paper: 'quiz', role: 'test', when: () => true, why: 'the scored test, Form A / Form B' },
    { paper: 'lesson', role: 'lesson', when: () => true, why: 'the lesson packet' },
]);

/**
 * A paper request -> the role request(s) that build it (a Quiz of Forms A and B is two). Each is
 * a buildSheet request of today's roles; everything the paper does not own passes through.
 */
export function routePaper(req = {}) {
    const o = paperOptions(req);
    const sections = Array.isArray(req.sections) ? req.sections : [];
    const skills = sections.flatMap((s) => (s && Array.isArray(s.skills) ? s.skills : []));
    const row = PAPER_ROUTES.find((r) => r.paper === o.paper && r.when(o, skills));
    const base = Object.assign({}, req);
    delete base.kind; delete base.versions; delete base.factColumns; delete base.timed; delete base.parts;
    base.role = row.role;
    base.paperKind = o.paper;
    if (row.role === 'test') {
        return o.versions.map((form) => Object.assign({}, base, { form, role: 'test' }));
    }
    if (row.role === 'more-practice') return [Object.assign(base, { letters: o.versions })];
    if (row.role === 'fact-rows') {
        base.sections = sections.map((s) => Object.assign({}, s, { columns: o.factColumns === 'auto' ? 'auto' : o.factColumns }));
        return [base];
    }
    if (row.role === 'fact-probe') {
        const h = Object.assign({}, req.header || {});
        if (h.titleNote === undefined) h.titleNote = `(${o.timed} minute${o.timed === 1 ? '' : 's'})`;
        base.header = h;
        return [base];
    }
    if (row.role === 'lesson') {
        base.lessonParts = o.parts;
        base.practicePages = o.parts.includes('practice') ? Math.max(1, o.practicePages) : 0;
        base.mixed = o.parts.includes('mixed');
        return [base];
    }
    // A Practice paper of several skills deals its items by weight (exact shares, weightedMix).
    if (row.role === 'independent' && new Set(skills.map((k) => `${k.categoryId}:${k.skillId}`)).size > 1) base.weightedMix = true;
    return [base];
}

/**
 * An old role id -> its paper and options (§8e: saved sets and share codes are never broken).
 * Paused roles keep their role (`paused`), so an old printout still prints what it printed.
 */
export function paperOfRole(role, extra = {}) {
    switch (role) {
        case 'independent': case 'mixed-practice': case 'review': case 'word-problems':
            return { paper: 'practice', versions: ['A'], factColumns: 'off', timed: 0, from: role };
        case 'more-practice':
            return { paper: 'practice', versions: Array.isArray(extra.letters) && extra.letters.length ? extra.letters.slice() : ['A', 'B'], factColumns: 'off', timed: 0, from: role };
        case 'fact-rows':
            return { paper: 'practice', versions: ['A'], factColumns: extra.columns && extra.columns !== 'auto' ? Number(extra.columns) : 'auto', timed: 0, from: role };
        case 'fact-probe':
            return { paper: 'practice', versions: ['A'], factColumns: 'off', timed: 1, from: role };
        case 'test': return { paper: 'quiz', versions: [String(extra.form || 'A').toUpperCase() === 'B' ? 'B' : 'A'], from: role };
        case 'test-b': return { paper: 'quiz', versions: ['B'], from: role };
        case 'lesson': return { paper: 'lesson', parts: LESSON_PARTS.slice(), from: role };
        case 'opener': case 'pre-skill-check': return { paper: 'lesson', parts: ['prereq', 'sheet'], from: role };
        case 'scripted-model': return { paper: 'lesson', parts: ['chart'], from: role };
        case 'guided': return { paper: 'lesson', parts: ['sheet'], from: role };
        default:
            if (PAUSED_ROLES.includes(role)) return { paper: 'practice', versions: ['A'], factColumns: 'off', timed: 0, paused: role, from: role };
            return { paper: 'practice', versions: ['A'], factColumns: 'off', timed: 0, from: role || 'independent' };
    }
}

/**
 * Items per skill by weight: `count` x weight / total weight, largest remainder, every weighted
 * skill at least one item when the count allows (owner, 2026-09-26: 3 : 1 : 1 deals 60 / 20 / 20).
 * @param {number[]} weights
 * @param {number} count
 * @returns {number[]}
 */
export function weightedCounts(weights, count) {
    const w = weights.map((x) => (Number(x) > 0 ? Number(x) : 0));
    const live = w.map((x, i) => (x > 0 ? i : -1)).filter((i) => i >= 0);
    const total = w.reduce((a, b) => a + b, 0);
    if (!count || !live.length || !total) return w.map(() => 0);
    const shares = w.map((x) => (x / total) * count);
    const out = shares.map(Math.floor);
    let left = count - out.reduce((a, b) => a + b, 0);
    const order = shares.map((s, i) => [s - Math.floor(s), i]).filter(([, i]) => w[i] > 0).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (const [, i] of order) { if (left <= 0) break; out[i]++; left--; }
    // Every weighted skill at least once: take from the largest.
    if (count >= live.length) {
        for (const i of live) {
            if (out[i] > 0) continue;
            const donor = live.filter((j) => out[j] > 1).sort((a, b) => out[b] - out[a] || a - b)[0];
            if (donor === undefined) break;
            out[donor]--; out[i]++;
        }
    }
    return out;
}

export default { PAPER_IDS, PAPER_NAMES, LESSON_PARTS, LESSON_PART_NAMES, PAUSED_ROLES, PAPER_ROUTES, paperOptions, routePaper, paperOfRole, weightedCounts, isWordSkill };
