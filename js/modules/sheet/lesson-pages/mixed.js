// js/modules/sheet/lesson-pages/mixed.js
// LESSON PAGE BUILDER "mixed" (design/LESSON_LIBRARY_PLAN.md §8c): the lesson MIXED page - the skill with EARLIER
// skills only, each its own shelf, the lesson skill at least half the placed items (LR-8), the
// chart's step strip on page 1.
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz
// paper; the skill supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved from roles/lesson.js
// (phase 0: the sample lessons render byte-identical). Pure module (SCC-01).

/**
 * The buildSheet request of a lesson Mixed page (moved from print-sheet.js buildLesson, phase 0).
 * The lesson's own look (I Can) unless the teacher chose Daily for the packet. Lessons r2: the
 * lesson's own skill fills at least half the page (its weight is the partners' together), the
 * earlier skills the rest. Lessons r3: never a problem the Practice page printed; the lesson skill
 * at least half the placed items (`leadHalf`, enforced after packing).
 */
export function mixedRequest({ common, lookAsked, lead, partners, leadHalf, seed, stripHtml, stripH }) {
    return Object.assign({}, common, {
        role: 'mixed-practice', look: lookAsked === 'daily' ? 'daily' : 'ican',
        sections: [{ skills: [Object.assign({}, lead, { weight: Math.max(1, partners.length) + 0.5 }), ...partners] }], latticeN: 6, leadHalf,
        seed,
        stepStrip: stripHtml ? { html: stripHtml, hMm: stripH } : undefined,
    });
}

export default { mixedRequest };
