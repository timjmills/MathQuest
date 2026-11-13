// js/modules/sheet/lesson-pages/mixed.js
// LESSON PAGE BUILDER "mixed" (design/LESSON_LIBRARY_PLAN.md §8c): the lesson MIXED page - the lesson skill with EARLIER
// skills only, each its own section, the lesson skill at least half the placed items, the chart's step strip on it
// (was: Review / Mixed practice). The page itself is drawn by roles/mixed-practice.js; this builder writes its request.
// Moved from print-sheet.js buildLesson (lessons-phase0 0.5: the sample lessons and the detailed lessons render
// byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random.

/**
 * The buildSheet request of a lesson Mixed page. The lesson's own look (I Can) unless the teacher chose Daily for the
 * packet. Lessons r2: the lesson's own skill fills at least half the page (its weight is the partners' together), the
 * earlier skills the rest. Lessons r3: never a problem the Practice page printed (`avoidTexts`); the lesson skill at
 * least half the placed items (`leadHalf`, enforced after packing).
 *
 * @param {{common: object, lookAsked?: string, lead: object, partners: object[], practiceTexts: string[],
 *          packNums?: string[]|null, mixedLattice?: number, mixedLeadDrop?: boolean, seed: number,
 *          stripHtml?: string, stripH?: number, mixedStrip?: boolean, packTab?: string[], lessonFit?: boolean}} o
 */
/** The skills a Mixed request deals more than once (the lead's own skill as a partner): their keys. Pure. */
const twinSkillsOf = (lead, partners) => (partners || []).filter((w) => w && lead && w.categoryId === lead.categoryId && w.skillId === lead.skillId).map((w) => `${w.categoryId}:${w.skillId}`);

export function mixedRequest({ common, lookAsked, lead, partners, practiceTexts, packNums = null, mixedLattice, mixedLeadDrop, seed, stripHtml, stripH, mixedStrip, packTab, lessonFit = false }) {
    const withSkills = partners;
    const practiceSk = lead;
    return Object.assign({}, common, {
        // The lesson's own look (I Can) unless the teacher chose Daily for the packet.
        // Lessons r2: the lesson's own skill fills at least half the page (its weight is the
        // partners' together), the earlier skills the rest.
        role: 'mixed-practice', look: lookAsked === 'daily' ? 'daily' : 'ican',
        // (practice printed from a lesson stays in sections - Q-M1: the lesson's skills are new)
        arrangement: 'sections',
        // Lessons r3: never a problem the Practice page printed; the lesson skill at least
        // half the placed items (`leadHalf`, enforced after packing).
        sections: [{ skills: [Object.assign({}, practiceSk, { weight: Math.max(1, withSkills.length) + 0.5, avoidTexts: practiceTexts }, packNums ? { avoidKeys: packNums.slice(), edgeLast: undefined } : {}), ...withSkills] }], latticeN: mixedLattice || 6, leadHalf: true, leadDrop: !!(packNums && mixedLeadDrop), growLast: !!packNums,
        seed,
        // (`lessonFit`, a library lesson - live-pm r2: no 30 % band from the fill, no lone shelf on a continuation page;
        // absent on a detailed lesson's Mixed page, byte-identical)
        ...(lessonFit ? { lessonFit: true } : {}),
        // (r6, critic r5 R3: a partner that is the lesson's own skill - identify's Mixed - is dealt twice; its band reads its own items'
        // instruction, roles/mixed-practice.js bandKey. Absent on every other lesson.)
        ...(twinSkillsOf(practiceSk, withSkills).length ? { twinSkills: twinSkillsOf(practiceSk, withSkills) } : {}),
        // (`mixedStrip: false`, the detailed lesson maker - critic D18: one routine's Steps do not head a mixed page)
        stepStrip: stripHtml && mixedStrip !== false ? { html: stripHtml, hMm: stripH } : undefined,
        ...(Array.isArray(packTab) ? { header: Object.assign({}, common.header, { tab: [...packTab, 'Mixed 1'] }) } : {}),
    });
}

export default { mixedRequest };
