// js/modules/sheet/sheet-tags.js
// THE FOOTER HOOK of an item that knows its own standards (owner ruling Q-A, 2026-11-07; lane lf-vocab r3).
//
// A sheet's footer prints the SKILL's grade and CCSS (print-sheet.js skillMeta). A skill whose option chooses content
// from another grade - the picture vocabulary skills deal one lesson's word set (vocabSet) or one grade's words
// (vocabGrade) - would print the wrong grade (critic r1 #14, r2 #1: "Grade 3 · 3.OA.9" on a grade 1 page). Such an
// item carries `q.sheetTags = {grade, ccss: [codes]}`; this replaces the meta's grade and CCSS with them.
//
// ADDITIVE: an item without `sheetTags` leaves the meta exactly as it was, so no other skill's footer changes.
// Pure module (SCC-01).

/** The short form a footer prints: 3.OA.D.9 -> 3.OA.9. */
export const shortCcss = (c) => String(c).replace(/\.([A-Z])\.(\d+[a-z]?)$/, '.$2');

/**
 * The skill meta, with the item's own grade and CCSS when it carries them.
 * @param {Object} meta  {grade, grades?, ccss, ...} (changed in place and returned)
 * @param {Object} q     the skill's first dealt item (its options decide the tags, so every item agrees)
 */
export function applySheetTags(meta, q) {
    const t = q && q.sheetTags;
    if (!meta || !t || t.grade === undefined || t.grade === null || !Array.isArray(t.ccss) || !t.ccss.length) return meta;
    meta.grade = String(t.grade);
    delete meta.grades;
    meta.ccss = [...new Set(t.ccss.map(shortCcss))].join(', ');
    return meta;
}

export default { applySheetTags, shortCcss };
