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
    // --- batch 2 (2026-10-17, owner: every "ask owner" row of design/PRESET_SKILLS.md is a preset) ---
    'multiplication:mult_break_apart': { skill: 'mult_properties', opts: { forms: [1] } },
    'multiplication:area_model_2by1': { skill: 'area_model_mult', opts: { tiles: 21 } },
    'multiplication:area_model_3by1': { skill: 'area_model_mult', opts: { tiles: 31 } },
    'multiplication:mult_arrays': { skill: 'arrays_groups', opts: { forms: [0] } },
    'multiplication:mult_equal_groups': { skill: 'arrays_groups', opts: { forms: [1] } },
    'multiplication:mult_by_ten': { skill: 'mult_zeros', opts: { forms: [0] } },
    'multiplication:mult_by_hundred': { skill: 'mult_zeros', opts: { forms: [1] } },
    'multiplication:count_by_2s': { skill: 'count_by_tables', opts: { rows: [{ step: 2, start: 'step', dir: 'up' }] } },
    'multiplication:count_by_3s': { skill: 'count_by_tables', opts: { rows: [{ step: 3, start: 'step', dir: 'up' }] } },
    'multiplication:count_by_4s': { skill: 'count_by_tables', opts: { rows: [{ step: 4, start: 'step', dir: 'up' }] } },
    'multiplication:count_by_5s': { skill: 'count_by_tables', opts: { rows: [{ step: 5, start: 'step', dir: 'up' }] } },
    'multiplication:count_by_6s': { skill: 'count_by_tables', opts: { rows: [{ step: 6, start: 'step', dir: 'up' }] } },
    'multiplication:count_by_7s': { skill: 'count_by_tables', opts: { rows: [{ step: 7, start: 'step', dir: 'up' }] } },
    'multiplication:count_by_8s': { skill: 'count_by_tables', opts: { rows: [{ step: 8, start: 'step', dir: 'up' }] } },
    'multiplication:count_by_9s': { skill: 'count_by_tables', opts: { rows: [{ step: 9, start: 'step', dir: 'up' }] } },
    'multiplication:count_by_10s': { skill: 'count_by_tables', opts: { rows: [{ step: 10, start: 'step', dir: 'up' }] } },
    'multiplication:count_by_11s': { skill: 'count_by_tables', opts: { rows: [{ step: 11, start: 'step', dir: 'up' }] } },
    'multiplication:count_by_12s': { skill: 'count_by_tables', opts: { rows: [{ step: 12, start: 'step', dir: 'up' }] } },
    'division:div_sharing_word_problems': { skill: 'div_word_problems', opts: { forms: [0] } },
    'division:div_grouping_word_problems': { skill: 'div_word_problems', opts: { forms: [1] } },
    'subtraction:sub_wp_compare': { skill: 'sub_word_problems', opts: { forms: [1] } },
    'subtraction:sub_wp_start_unknown': { skill: 'sub_word_problems', opts: { forms: [2] } },
    // 2026-10-23 (SU-C pilot, catalogue C3): 2-digit − 1-digit without regrouping = within 100, shorter bottom number.
    'subtraction:sub_2d_1d': { skill: 'sub_100_no_regroup', opts: { lengths: 'shorter' } },
    'integers:add_negative': { skill: 'add_int', opts: { forms: [1] } },
    'integers:sub_negative': { skill: 'sub_int', opts: { forms: [1] } },
    'fractions:identify_fraction_nl': { skill: 'identify', opts: { model: ['line'], forms: [0] } },
    'fractions:write_fraction_nl': { skill: 'write_fraction', opts: { model: ['line'] } },
    'fractions:compare_fractions_nl': { skill: 'compare', opts: { model: ['line'], forms: [0] } },
    'fractions:equivalent_or_not': { skill: 'equivalent', opts: { forms: [1] } },
    'fractions:simplify_with_gcf': { skill: 'simplify', opts: { forms: [2] } },
    'fraction_operations:unit_frac_div_whole': { skill: 'div_unit_frac_nv', opts: { forms: [2, 3] } },
    'fraction_operations:whole_div_unit_frac': { skill: 'div_unit_frac_nv', opts: { forms: [0, 1] } },
    'decimals:div_decimal_by_whole': { skill: 'div_decimal', opts: { forms: [0] } },
    'decimals:div_by_decimal': { skill: 'div_decimal', opts: { forms: [1, 2] } },
    'decimals:round_to_tenth': { skill: 'round_thousandths', opts: { forms: [0] } },
    'decimals:round_to_hundredth': { skill: 'round_thousandths', opts: { forms: [1] } },
    'conversions:ratio_part_to_part': { skill: 'ratio_intro', opts: { forms: [0] } },
    'conversions:ratio_simplest_form': { skill: 'equiv_ratios', opts: { forms: [2] } },
    'conversions:ratio_equivalent_or_not': { skill: 'equiv_ratios', opts: { forms: [1] } },
    'area_perimeter:area_missing_side': { skill: 'area', opts: { forms: [1] } },
    'area_perimeter:perimeter_missing_side': { skill: 'perimeter', opts: { forms: [1] } },
    'area_perimeter:volume_missing_edge': { skill: 'volume', opts: { forms: [1] } },
    'area_perimeter:composite_area_perimeter': { skill: 'composite_shapes', opts: { forms: [1] } },
    'angles_lines:angles_in_right_angle': { skill: 'additive_angles', opts: { forms: [0] } },
    'angles_lines:angles_on_straight_line': { skill: 'additive_angles', opts: { forms: [1] } },
    'angles_lines:angles_around_point': { skill: 'additive_angles', opts: { forms: [2] } },
    'coordinates:coordinates_read_q1': { skill: 'coordinate_q1', opts: { forms: [0] } },
    'coordinates:coordinates_plot_q1': { skill: 'coordinate_q1', opts: { forms: [1] } },
    'coordinates:coordinates_read_all': { skill: 'coordinate_all', opts: { forms: [0] } },
    'coordinates:coordinates_plot_all': { skill: 'coordinate_all', opts: { forms: [1] } },
    'coordinates:reflect_x_axis': { skill: 'geo_reflect', opts: { forms: [0] } },
    'coordinates:reflect_y_axis': { skill: 'geo_reflect', opts: { forms: [1] } },
    'coordinates:rotate_half_turn': { skill: 'geo_rotate', opts: { forms: [0] } },
    'coordinates:rotate_quarter_turn': { skill: 'geo_rotate', opts: { forms: [1] } },
    'coordinates:rotate_three_quarter_turn': { skill: 'geo_rotate', opts: { forms: [2] } },
    'coordinates:translate_right_up': { skill: 'geo_translate', opts: { forms: [0] } },
    'coordinates:translate_left_up': { skill: 'geo_translate', opts: { forms: [1] } },
    'coordinates:translate_right_down': { skill: 'geo_translate', opts: { forms: [2] } },
    'coordinates:translate_left_down': { skill: 'geo_translate', opts: { forms: [3] } },
    'graphs:pictograph_how_many_more': { skill: 'pictograph', opts: { forms: [3] } },
    'graphs:bar_graph_how_many_more': { skill: 'bar_graph', opts: { forms: [2] } },
    'graphs:tally_how_many_more': { skill: 'tally_chart', opts: { forms: [3] } },
    'data_analysis:box_plot_quartiles': { skill: 'box_plot_intro', opts: { forms: [3] } },
    'algebra:solve_x_plus_a': { skill: 'solve_eq_addsub', opts: { forms: [1] } },
    'algebra:solve_x_minus_a': { skill: 'solve_eq_addsub', opts: { forms: [2] } },
    'algebra:solve_ax_eq_b': { skill: 'solve_eq_multdiv', opts: { forms: [1, 2] } },
    'algebra:solve_x_div_a': { skill: 'solve_eq_multdiv', opts: { forms: [3] } },
    'algebra:solve_ax_plus_b': { skill: 'solve_eq_twostep', opts: { forms: [0] } },
    'algebra:solve_ax_minus_b': { skill: 'solve_eq_twostep', opts: { forms: [2] } },
    'algebra:solve_x_div_a_plus_b': { skill: 'solve_eq_twostep', opts: { forms: [3] } },
    'algebra:solve_bracket_div': { skill: 'solve_eq_twostep', opts: { forms: [1] } },
    'algebra:write_equation_story': { skill: 'write_equation', opts: { forms: [2, 3] } },
    'algebra:factor_out_gcf': { skill: 'distributive_expr', opts: { forms: [2] } },
    'algebra:function_table_find_rule': { skill: 'function_table_easy', opts: { ftTask: 'rule' } },
    'algebra:function_table_find_inputs': { skill: 'function_table_easy', opts: { ftTask: 'inputs' } },
    // --- two-step stories (detailed lesson 7, 3.OA.D.8; host multi_step_word_plain): each a lesson of its own -------
    'algebra:two_step_mult_div_first': { skill: 'multi_step_word_plain', opts: { msOps: 'multdiv' } },
    'algebra:two_step_add_then_mult': { skill: 'multi_step_word_plain', opts: { msOps: 'addmult' } },
    'algebra:two_step_add_then_div': { skill: 'multi_step_word_plain', opts: { msOps: 'adddiv' } },
    'algebra:two_step_letter_equation': { skill: 'multi_step_word_plain', opts: { msOps: 'multdiv', msLetter: true } },
    'algebra:two_step_estimate_check': { skill: 'multi_step_word_plain', opts: { msCheck: true } },
    'order_of_operations:square_numbers': { skill: 'exponents_simple', opts: { forms: [0], step: [0] } },
    'order_of_operations:cube_numbers': { skill: 'exponents_simple', opts: { forms: [1], step: [0] } },
    'number_sense:reasonable_quotients': { skill: 'estimate_quotient', opts: { task: 'reasonable' } },
    'placevalue:digit_value_unit_form': { skill: 'value', opts: { form: 'unit' } },
    'placevalue:digit_value_notation': { skill: 'value', opts: { form: 'notation' } },
    'placevalue:count_pv_disks': { skill: 'place_value_disks', opts: { task: 'count' } },
    // (2026-10-30, detailed lesson 6 r4: build-list value_ten_times is `preset: true` - the form, its other direction and its story)
    'placevalue:ten_times_value': { skill: 'value', opts: { form: 'times', band: 9999 } },
    'placevalue:one_tenth_value': { skill: 'value', opts: { form: 'times', band: 9999, tenDir: 'tenth' } },
    'placevalue:ten_times_story': { skill: 'value', opts: { form: 'times', band: 9999, tenTask: 'story' } },
    'composing:write_numbers_in_words': { skill: 'number_word_form', opts: { wordform: ['to_words'] } },
    'measurement:count_notes': { skill: 'money_count', opts: { kind: 'note' } },
    'measurement:count_notes_and_coins': { skill: 'money_count', opts: { kind: 'both' } },
    'measurement:convert_feet_to_inches': { skill: 'length_customary', opts: { forms: [0] } },
    'measurement:convert_yards_to_feet': { skill: 'length_customary', opts: { forms: [1] } },
    'measurement:convert_yards_to_inches': { skill: 'length_customary', opts: { forms: [2] } },
    'measurement:convert_miles_to_feet': { skill: 'length_customary', opts: { forms: [3] } },
    'measurement:convert_cm_to_mm': { skill: 'length_metric', opts: { forms: [0] } },
    'measurement:convert_m_to_cm': { skill: 'length_metric', opts: { forms: [1] } },
    'measurement:convert_m_to_mm': { skill: 'length_metric', opts: { forms: [2] } },
    'measurement:convert_km_to_m': { skill: 'length_metric', opts: { forms: [3] } },
    'measurement:clock_hands': { skill: 'clock_parts', opts: { task: 'hands' } },
    'measurement:minutes_by_fives_all': { skill: 'time_fives_ring', opts: { task: 'all' } },
    'measurement:order_notes': { skill: 'coin_value', opts: { task: 'order' } },
    'measurement:money_amount_in_words': { skill: 'money_notation', opts: { task: 'words' } },
    'number_theory:sort_prime_composite': { skill: 'prime_composite', opts: { forms: [3] } },
    'number_theory:list_multiples': { skill: 'multiples', opts: { forms: [0] } },
    'number_theory:missing_multiples': { skill: 'multiples', opts: { forms: [3] } },
    'number_theory:common_factors': { skill: 'gcf_easy', opts: { forms: [1] } },
    'number_theory:common_multiples': { skill: 'lcm', opts: { forms: [1] } },
    // 2026-10-31 (owner, facts card Q4): the long-division bracket on division facts is its own lesson; the
    // fraction form stays an option.
    'division:div_facts_long': { skill: 'div_facts', opts: { divForm: 'long' } },
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
