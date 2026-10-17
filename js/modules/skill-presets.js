// PRESET SKILLS — a distinct option is ALSO a findable skill (owner rule, 2026-10-17; CLAUDE.md).
//
// When an option value makes a skill teach something different enough to be its own lesson or
// page ("2-digit × 2-digit, standard algorithm" on multiplication:multiply), that value set is
// ALSO a named skill: its own label, grade, standards, search terms and an appended share code.
// It is a PRESET, not a copy: choosing it opens the HOST skill with these option values already
// set, and the options stay editable. There is no generator for a preset.
//
// How it works (design/PRESET_SKILLS.md):
//   - The preset's id is APPENDED to SKILLS[category] in data.js (label + grade live there, like
//     any skill) and pinned in skill-codes-frozen.js, so every share-code system gives it a slot.
//   - This table says which host it opens and with which values. Key 'category:presetId'.
//   - skill-options.js: optionsFor / offeredOptionsFor / defaultOptions of a preset are the HOST's
//     controls with the preset values as their defaults. So normalizeOptions(cat, preset, opts)
//     is "preset values UNDER the explicit opts" (explicit wins), and a share code packs only
//     what the teacher changed from the preset.
//   - generate-question.js: generateQuestion() swaps a preset to its host for the one call
//     (state restored in finally), so live play, worksheets, quizzes, print (buildSheet via
//     generateQuestionFor), share codes and mixed play all deal the host's items.
//   - sheet/contract.js getProvider(): a preset with no provider of its own reads its host's.
//
// Pure table: imports nothing, so the sheet kit, node gates and data.js may all read it.

export const SKILL_PRESETS = Object.freeze({
    // --- multiplication: the written method by size (host: multiply, `tiles`) ----------------
    'multiplication:mult_2by1_column': { skill: 'multiply', opts: { tiles: 21 } },
    'multiplication:mult_3by1_column': { skill: 'multiply', opts: { tiles: 31 } },
    'multiplication:mult_2by2_standard': { skill: 'multiply', opts: { tiles: 22 } },
    // --- multiplication: the chart's other tasks (host: mult_chart, `task`) -------------------
    'multiplication:mult_chart_shade': { skill: 'mult_chart', opts: { task: 'shade' } },
    'multiplication:mult_chart_pattern': { skill: 'mult_chart', opts: { task: 'pattern' } },
    'multiplication:mult_chart_headers': { skill: 'mult_chart', opts: { task: 'headers' } },
    // --- multiplication: one form of a family -------------------------------------------------
    'multiplication:mult_multiples_of_ten': { skill: 'mult_zeros', opts: { forms: [2] } },
    // --- division: long division by size (host: divide, `tiles`) ------------------------------
    'division:div_2by1_long': { skill: 'divide', opts: { tiles: 21 } },
    'division:div_3by1_long': { skill: 'divide', opts: { tiles: 31 } },
    'division:div_4by1_long': { skill: 'divide', opts: { tiles: 41 } },
    'division:div_3by2_long': { skill: 'divide', opts: { tiles: 32 } },
    // --- other families ----------------------------------------------------------------------
    'fractions:compare_to_half': { skill: 'compare', opts: { forms: [2] } },
    'number_sense:near_doubles': { skill: 'doubles_near_doubles', opts: { forms: [1, 2] } },
    'placevalue:expanded_notation': { skill: 'expand', opts: { form: 'notation' } },
});

/** The host a preset opens, or null when the pair is not a preset. */
export function presetOf(categoryId, skillId) {
    const p = SKILL_PRESETS[`${categoryId}:${skillId}`];
    if (!p) return null;
    return { categoryId, skillId: p.skill, opts: JSON.parse(JSON.stringify(p.opts || {})) };
}

export const isPreset = (categoryId, skillId) => !!SKILL_PRESETS[`${categoryId}:${skillId}`];

/** The presets that open one host skill, as preset ids. */
export function presetsOfHost(categoryId, hostId) {
    const out = [];
    for (const [key, p] of Object.entries(SKILL_PRESETS)) {
        const [c, id] = key.split(':');
        if (c === categoryId && p.skill === hostId) out.push(id);
    }
    return out;
}
