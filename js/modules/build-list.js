// build-list.js — THE single build list of new skills and new options, whichever audit found them:
// the White Rose small-step audit (WRM_PROPOSALS in js/modules/wrm.js) and the CCSS + Wisconsin
// Essential Elements full-coverage audit (STANDARD_PROPOSALS below, verdicts in
// js/modules/standards-audit.js). Owner, 2026-09-25: "do the same check for CCSS and EE standards
// to make sure they are fully covered by our current skills and if not design new skills to cover
// them all."
//
// A pure data module, NOT imported by the app. `node tests/scripts/ws-standards.cjs --report`
// renders it as design/BUILD_LIST.md (the lanes agent teams build from, to the 8/10 critic gate)
// and design/STANDARDS_COVERAGE.md.
//
// ONE LIST, NO DUPLICATES
//   * A clause of a standard that a WRM proposal already builds is sent to that proposal (the
//     standards audit names the WRM id); where the WRM proposal needs more to close the clause, the
//     extra scope is in WRM_EXTENSIONS here, and the proposal stays ONE entry.
//   * STANDARD_PROPOSALS holds only what no WRM proposal builds: CCSS/EE content White Rose does not
//     teach at that step (6.NS.A.1 fraction ÷ fraction, 6.SP statistics, …), options WRM does not
//     need (a numeral-writing skill, the equal-sign repair, …).
//   * kind 'new' is a new skill id; 'option' a new option value on an existing (or proposed)
//     skill — "a ladder step is a skill plus option values", so an option is preferred whenever it
//     is honest; 'repair' fixes a live skill that does not deal what its name promises.
//
// LANES (non-overlapping file ownership; see LANES below). A lane owns its generator file(s) and
// its templates: only that lane edits them. The shared registries (data.js SKILLS, skill-options.js,
// standards.js, wrm.js, generate-question.js skillCategoryOverride, sheet/providers/index.js,
// globals.js) are APPEND-ONLY for every lane — each lane appends its own entries in its own block
// and never edits another's; SKILLS positions are share codes, so nothing is ever spliced
// (CLAUDE.md) and the integrator fixes the final append order at merge.

import { WRM_PROPOSALS, WRM_STEPS } from './wrm.js';
import { WRM_SPECS } from './build-specs.js';

/* ================================================================ new templates */
// Kit templates the build list needs that do not exist yet. The owner lane builds it (first, in
// its lane order); other lanes consume it and ask the owner for changes.
export const NEW_TEMPLATES = {
    'bar-model': { lane: 'operations', what: 'part-whole and comparison bars (tape diagrams), fraction bars of an amount, with labelled parts and one blank' },
    'picture-row': { lane: 'k2', what: 'a row or small grid of line-drawn pictures with letter tags: match, odd one out, order events, repeating patterns' },
    'sort-rings': { lane: 'k2', what: 'two or three sorting rings, a Carroll two-box table or a two-set Venn, with tiles written in by letter' },
    'shape-grid': { lane: 'geometry', what: 'a square or dot grid with shapes, mirror lines, arrows: draw, complete, reflect, translate, area/perimeter on squares' },
    'coord-grid': { lane: 'geometry', what: 'a coordinate plane (quadrant I or four quadrants) with labelled axes: plot, read, join, translate, reflect' },
    'angle-kit': { lane: 'geometry', what: 'rays, lines, segments, angles, turns and a protractor overlay; parts of a circle' },
    'solid-kit': { lane: 'geometry', what: 'line drawings of 3-D shapes, isometric cube solids and layers, skeletons and nets' },
    'graph-axes': { lane: 'data', what: 'one frame for block diagrams, pictograms, bar/dual bar, line graphs, dot plots, histograms, box plots and pie sectors, read or drawn' },
    'data-table': { lane: 'data', what: 'two-column, two-way, tally, conversion, ratio and timetable tables with blank cells' },
    'measure-scale': { lane: 'measurement', what: 'a ruler, metre stick, dial, jug or thermometer scale with an object or pointer; labelled every n ticks' },
    balance: { lane: 'measurement', what: 'a pan balance, tipped or level, with objects or cubes in each pan' },
    calendar: { lane: 'timemoney', what: 'a calendar page or day strip (days, weeks, months, seasons)' },
    expression: { lane: 'algebra', what: 'an expression or formula with brackets, boxed parts and labels (term, factor, coefficient)' },
    'long-multiplication': { lane: 'operations', what: 'the long-multiplication grid with carry boxes and the placeholder row' },
    // added from the visual catalogue (design/wrm-visuals/INDEX.md); a "pane" is an answer-free support drawn round a problem
    beadstring: { lane: 'k2', what: 'pane: a bead string of 10, 20 or 100 beads in runs of five or ten (unit 1, 0.1 or 1 %)' },
    cover: { lane: 'k2', what: 'pane: an outline cover box with "?" laid over part of a picture, a bond part, digits or a chart' },
    'split-op': { lane: 'operations', what: 'a part-whole split with an operation arrow under each part and the recombined answer' },
    split: { lane: 'operations', what: 'pane: the second number split under a calculation to bridge a ten, hundred or whole' },
    'pv-exchange': { lane: 'placevalue', what: 'pane: a place-value chart of counters beside a written method, with exchanges for + − × ÷ and decimals' },
    gattegno: { lane: 'placevalue', what: 'the Gattegno chart: rows 1–9 × powers of ten, decimal rows, read / ring / shift' },
    'total-grid': { lane: 'algebra', what: 'a 3 × 3 grid of numbers or symbols with row and column totals' },
    pyramid: { lane: 'algebra', what: 'a number pyramid of 3–5 rows, each brick the sum of the two below' },
    'hundred-square': { lane: 'fractions', what: 'a 10 × 10 (or 1,000-cell) square as one whole: shade and read hundredths, decimals, percent; two-tone complement' },
    'double-scale': { lane: 'fractions', what: 'two or three aligned scales (units, fraction | decimal | percent, ratio) with blanks and operator arcs' },
    'operator-arcs': { lane: 'fractions', what: 'pane: operator arcs above and below a pair of numbers or fractions (× n, ÷ n, +, −)' },
    ladder: { lane: 'measurement', what: 'pane: the unit-conversion ladder (mm → cm → m → km, ÷ above, × below)' },
    'past-to': { lane: 'timemoney', what: 'pane: a clock face half-shaded past / to' },
    'hour-line': { lane: 'timemoney', what: 'pane: a 1–12 line with the hour hand as a pointer' },
    'factor-pairs': { lane: 'numtheory', what: 'a systematic factor-pair table, factor rainbow or bug, non-factors crossed out' },
    'factor-tree': { lane: 'numtheory', what: 'a factor tree or halving tree to prime factors' },
};

/* ================================================================ lanes */
// Lane of a skill = the lane that owns the generator file that deals it. Category defaults, then
// the skills whose generator lives elsewhere (skillCategoryOverride in generate-question.js).
export const LANES = {
    k2: { name: 'Counting and early number (K-1 pictures)', files: ['js/modules/gen-counting.js', 'js/modules/sheet/cells/{counters,tenframe,bond,seqstrip,compare,chartwindow,base10,wordpic,count-row,k2kit}.js', 'js/modules/sheet/providers/k2.js'], newTemplates: ['picture-row', 'sort-rings'] },
    operations: { name: 'Operations (+ − × ÷, facts, multi-digit, integers arithmetic)', files: ['js/modules/gen-operations.js', 'js/modules/gen-mult-patterns.js', 'js/modules/sheet/cells/{stack,fact,family,equation,cloze-bank,arrays,area-model,mult-grid,mult-chart,division,long-division,ops-counters,ops-common,hop-line,number-line}.js', 'js/modules/sheet/providers/{addition,subtraction,multiplication,division,countby}.js'], newTemplates: ['bar-model', 'long-multiplication'] },
    placevalue: { name: 'Place value, rounding and estimation (the pv kit)', files: ['js/modules/gen-pv.js', 'js/modules/sheet/cells/{pv,value-line,line-labels,gattegno}.js', 'js/modules/pv-support-cell.js', 'js/modules/sheet/providers/pv.js', 'js/modules/sheet/cells/panes/{place,extras,pv-exchange}.js'], newTemplates: ['gattegno', 'pv-exchange'] },
    algebra: { name: 'Patterns, algebra, order of operations, strategies (gen-algebraic)', files: ['js/modules/gen-algebraic.js', 'js/modules/gen-function-table.js', 'js/modules/sheet/cells/{function-table,total-grid,pyramid}.js', 'js/modules/sheet/providers/function-table.js'], newTemplates: ['expression', 'total-grid', 'pyramid'] },
    fractions: { name: 'Fractions, decimals, conversions, ratio', files: ['js/modules/gen-fractions.js', 'js/modules/sheet/cells/{frac-model,hundred-square,double-scale}.js', 'js/modules/sheet/cells/panes/operator-arcs.js', 'js/modules/svg-fractions.js'], newTemplates: ['hundred-square', 'double-scale', 'operator-arcs'] },
    geometry: { name: 'Geometry, area, volume, coordinates', files: ['js/modules/gen-geometry.js', 'js/modules/svg-geometry.js', 'js/modules/sheet/cells/shapes.js'], newTemplates: ['shape-grid', 'coord-grid', 'angle-kit', 'solid-kit'] },
    measurement: { name: 'Measurement (length, mass, capacity, conversions)', files: ['js/modules/gen-measurement.js', 'js/modules/sheet/cells/panes/ladder.js'], newTemplates: ['measure-scale', 'balance', 'ladder'] },
    timemoney: { name: 'Time and money', files: ['js/modules/gen-time-money.js', 'js/modules/svg-clock.js', 'js/modules/sheet/cells/{clock,timeline,coins,money-columns,tmkit}.js', 'js/modules/sheet/providers/time-money.js'], newTemplates: ['calendar', 'past-to', 'hour-line'] },
    data: { name: 'Data and statistics', files: ['js/modules/gen-data-stats.js'], newTemplates: ['graph-axes', 'data-table'] },
    numtheory: { name: 'Number theory', files: ['js/modules/gen-number-theory.js', 'js/modules/svg-factors.js', 'js/modules/sheet/cells/{factor-pairs,factor-tree}.js'], newTemplates: ['factor-pairs', 'factor-tree'] },
};
export const SHARED_APPEND_ONLY = ['js/modules/data.js (SKILLS, SKILL_PRINT_SIZE)', 'js/modules/skill-options.js', 'js/modules/standards.js (SKILL_STANDARDS)',
    'js/modules/wrm.js (SKILL_WRM; delete a built proposal)', 'js/modules/generate-question.js (skillCategoryOverride)', 'js/modules/sheet/providers/index.js', 'js/globals.js',
    'js/modules/sheet/cells/panes/index.js (PANES, PANE_GROUP: register a new pane)', 'js/modules/sheet/providers/util.js (FAMILY_SUPPORTS) and every provider\'s `supports` array (append a support id)'];

const CATEGORY_LANE = {
    counting: 'k2', comparing: 'k2', composing: 'k2', counting_mixed: 'k2',
    addition: 'operations', subtraction: 'operations', multiplication: 'operations', division: 'operations', number_ops_mixed: 'operations', integers: 'operations',
    placevalue: 'placevalue', number_sense: 'placevalue',
    patterns: 'algebra', algebra: 'algebra', order_of_operations: 'algebra',
    fractions: 'fractions', fraction_operations: 'fractions', decimals: 'fractions', conversions: 'fractions',
    shapes_early: 'geometry', shapes_classify: 'geometry', angles_lines: 'geometry', coordinates: 'geometry', area_perimeter: 'geometry',
    measurement: 'measurement',
    graphs: 'data', data_analysis: 'data', probability: 'data',
    number_theory: 'numtheory',
};
// Skills (live or proposed) whose generator is not the category default.
const SKILL_LANE = {
    'composing:fraction_number_line': 'fractions', 'composing:whole_as_fraction': 'fractions', 'composing:compose_whole': 'fractions',
    'composing:odd_even': 'algebra', 'composing:select_even_odd': 'algebra', 'composing:number_word_form': 'algebra',
    'addition:add_5_pictures': 'k2', 'subtraction:sub_5_pictures': 'k2', 'addition:add_wp_10': 'k2', 'division:share_into_groups': 'k2',
    'integers:abs_value': 'algebra', 'integers:opposite_numbers': 'algebra', 'integers:ordering_rationals': 'algebra', 'integers:order_negatives': 'algebra',
    'number_sense:make_a_ten': 'algebra', 'number_sense:doubles_near_doubles': 'algebra', 'number_sense:compensation': 'algebra', 'number_sense:why_it_works': 'algebra',
    'decimals:round_decimals': 'placevalue',
    'shapes_early:order_objects_length': 'measurement', 'shapes_early:measure_nonstandard': 'measurement', 'shapes_early:estimate_length': 'measurement', 'area_perimeter:perimeter_intro': 'measurement',
    'measurement:pictograph_intro': 'measurement', 'measurement:bar_graph_intro': 'measurement',
    'number_sense:number_line_scales': 'placevalue', 'number_sense:estimate_and_check': 'placevalue',
};
const TIME_MONEY = /^measurement:(time|elapsed|clock|order_clocks|money|coin|equiv_coin|enough_money|make_change|order_events|hours_minutes|calendar|twenty_four|read_timetables|roman_numerals_clock|estimate_with_money)/;
export function laneFor(skillKey) {
    if (SKILL_LANE[skillKey]) return SKILL_LANE[skillKey];
    if (TIME_MONEY.test(skillKey)) return 'timemoney';
    return CATEGORY_LANE[skillKey.split(':')[0]] || 'algebra';
}

/* ================================================================ extensions of WRM proposals */
// Where a standards clause is built by a WRM proposal that does not yet reach all of it, the extra
// scope goes on that proposal (one entry on the build list, not two). `adds` is the scope; the codes
// are the standards it then closes.
export const WRM_EXTENSIONS = {
    zero: { adds: 'writing 0 as the numeral for an empty set on the same page as 1-5 counts', ccss: ['K.CC.A.3'], ee: [] },
    ten_count_out: { adds: 'count out 1-3 from a larger set (EE level) and count out to 30', ccss: ['K.CC.B.5'], ee: ['M.EE.K.CC.6', 'M.EE.2.NBT.2'] },
    add_sub_1_2: { adds: 'a picture level: n objects and one more / one less, "how many now?" (a quantity one larger)', ccss: ['K.CC.B.4c'], ee: ['M.EE.1.OA.5'] },
    systematic_bonds: { adds: 'bonds of 5 at EE level; the pupil records each decomposition as an equation', ccss: ['K.OA.A.3'], ee: ['M.EE.1.NBT.4', 'M.EE.1.NBT.6', 'M.EE.2.NBT.6'] },
    sort_groups: { adds: 'count each group, say which has most / fewest and order the groups by count; attributes big/small, heavy/light', ccss: ['K.MD.B.3'], ee: ['M.EE.K.MD.1', 'M.EE.K.MD.2', 'M.EE.K.MD.3', 'M.EE.1.MD.4'] },
    shapes_world: { adds: 'name the shape of an everyday object from a bank', ccss: ['K.G.A.1'], ee: [] },
    position_map: { adds: 'in front of / behind / next to at K, and on / off / in / out at EE level', ccss: ['K.G.A.1'], ee: ['M.EE.1.G.1'] },
    shape_sort: { adds: 'the rule "flat (2-D) or solid (3-D)"; sort circles, squares, rectangles, triangles of one size (EE)', ccss: ['K.G.A.3'], ee: ['M.EE.1.G.2'] },
    compare_shapes: { adds: 'compare two 3-D shapes (faces, edges, vertices) and "sides of equal length"', ccss: ['K.G.B.4'], ee: [] },
    shape_draw: { adds: 'build and draw shapes with given defining attributes; draw a quadrilateral that is not a rectangle, rhombus or square', ccss: ['K.G.B.5', '1.G.A.1', '2.G.A.1', '3.G.A.1'], ee: [] },
    make_3d: { adds: 'K level: build a shape from sticks and balls (count sticks and balls)', ccss: ['K.G.B.5'], ee: [] },
    compare_small: { adds: 'band 10 for K numerals; tens-and-ones model support to 99 for the EE', ccss: ['K.CC.C.7'], ee: ['M.EE.4.NBT.2', 'M.EE.5.NBT.1'] },
    half_quarter: { adds: 'the words halves / fourths / quarters, "the whole is two halves / four quarters", and "more shares, smaller shares"', ccss: ['1.G.A.3'], ee: [] },
    fraction_parts: { adds: 'thirds; "the whole is three thirds"; equal shares of identical wholes need not have the same shape; recognise equal areas (EE)', ccss: ['2.G.A.3'], ee: ['M.EE.3.G.2'] },
    day_order: { adds: 'EE level: before / next / after activities and morning / afternoon / day / night', ccss: [], ee: ['M.EE.1.MD.3'] },
    time_talk: { adds: 'EE level: today, yesterday, tomorrow; telling time is the same every day', ccss: [], ee: ['M.EE.1.MD.3'] },
    equal_groups_early: { adds: 'rectangular arrays to 5 × 5: the pupil writes the total as a sum of equal addends', ccss: ['2.OA.C.4'], ee: [] },
    metres: { adds: 'choose the tool: ruler, metre stick, yardstick or tape', ccss: ['2.MD.A.1'], ee: [] },
    mm_cm_m: { adds: 'measure one object in two units and say why the counts differ (bigger unit, smaller count)', ccss: ['2.MD.A.2'], ee: [] },
    money_2step: { adds: 'one-step money stories with $ and ¢ at Grade 2 before the two-step ones', ccss: ['2.MD.C.8'], ee: [] },
    length_ops: { adds: 'EE level: make a cube train longer or shorter by adding or taking units; Grade 4 lengths with fractions/decimals and a unit change', ccss: ['2.MD.B.5', '4.MD.A.2'], ee: ['M.EE.2.MD.5'] },
    mass_ops: { adds: 'Grade 4 word problems with simple fractions or decimals and a larger-to-smaller unit change', ccss: ['3.MD.A.2', '4.MD.A.2'], ee: [] },
    mass_scales: { adds: 'EE level: which tool measures it (scale, jug, ruler)?', ccss: ['3.MD.A.2'], ee: ['M.EE.3.MD.2'] },
    share_group: { adds: 'share an even number of objects equally between two groups (EE 2.OA.3), to 20', ccss: [], ee: ['M.EE.2.OA.3'] },
    mult_three: { adds: 'show that (3 × 5) × 2 = 3 × (5 × 2) as a strategy (associative property)', ccss: ['3.OA.B.5'], ee: [] },
    frac_count: { adds: 'locate 4/4 and 1 (and 6/3 and 2) at the same point', ccss: ['3.NF.A.3c'], ee: [] },
    frac_nl_equiv: { adds: 'Grade 3 level (halves, quarters, eighths) for 3.NF.A.3a, not only Year 6', ccss: ['3.NF.A.3a'], ee: [] },
    compare_numerator: { adds: 'Grade 3 same-numerator comparisons and unit fractions (1/3 vs 1/5) with models, for the EE', ccss: ['3.NF.A.3d'], ee: ['M.EE.6.NS.1'] },
    same_area: { adds: 'Grade 3 level: exhibit rectangles with the same perimeter and different areas, and the reverse', ccss: ['3.MD.D.8'], ee: [] },
    add_or_mult: { adds: 'Grade 4 stories that contrast "3 more than" with "3 times as many"', ccss: ['4.OA.A.2'], ee: [] },
    turns_angles: { adds: 'an angle as a fraction of a circle: 1/360 of a turn is 1°, a quarter turn 90°; compare two angles (EE)', ccss: ['4.MD.C.5a', '4.MD.C.5b'], ee: ['M.EE.4.MD.6'] },
    draw_angles: { adds: 'sketch an angle of a given measure (Grade 4)', ccss: ['4.MD.C.6'], ee: [] },
    thousandths_pv: { adds: 'number names and expanded form to thousandths (347.392 = 3 × 100 + … + 2 × 1/1000)', ccss: ['5.NBT.A.3a'], ee: [] },
    mult_mixed_int: { adds: 'real-world stories multiplying mixed numbers', ccss: ['5.NF.B.6'], ee: [] },
    volume_cubes: { adds: 'unit cube = one cubic unit; pack a prism and show layers × cubes = l × w × h = B × h; EE counting', ccss: ['5.MD.C.3a', '5.MD.C.3b', '5.MD.C.4', '5.MD.C.5a'], ee: ['M.EE.5.MD.4', 'M.EE.5.MD.5', 'M.EE.6.G.2'] },
    negative_count: { adds: 'opposite directions and values (elevation, money, temperature) and the meaning of 0; write −3 °C > −7 °C', ccss: ['6.NS.C.5', '6.NS.C.7b'], ee: ['M.EE.6.NS.5', 'M.EE.6.NS.6', 'M.EE.6.NS.7', 'M.EE.6.NS.8'] },
    four_quadrants: { adds: 'signs name the quadrant; points that differ only by signs are reflections across an axis; distance across an axis with absolute value; draw a polygon from vertices', ccss: ['6.NS.C.6b', '6.NS.C.8', '6.G.A.3'], ee: [] },
    square_cube: { adds: 'write a repeated product as a power and evaluate it (6.EE.A.1)', ccss: ['6.EE.A.1'], ee: [] },
    formulae: { adds: 'formulas with powers (V = s³, A = 6s²) and fraction values', ccss: ['6.EE.A.2c'], ee: [] },
    parallelogram: { adds: 'trapezoids and other polygons by composing rectangles or decomposing into triangles', ccss: ['6.G.A.1'], ee: [] },
    money_estimate: { adds: 'estimate sums and differences in stories within 30 and 100 (EE)', ccss: [], ee: ['M.EE.4.NBT.3', 'M.EE.5.NBT.4'] },
    compare_calcs: { adds: 'EE: numerical expressions equal by a property (3 + 4 = 4 + 3); Grade 5: "3 × (a + b) is three times as large as a + b"', ccss: ['5.OA.A.2'], ee: ['M.EE.6.EE.3'] },
};

/* ================================================================ the standards proposals */
const P = (o) => o;

export const STANDARD_PROPOSALS = {
    // ------------------------------------------------------------------ counting (K-1)
    write_numerals: P({
        kind: 'new', skill: 'counting:write_numbers_0_20', name: 'Write the Numbers 0 to 20', grade: 'K', family: 'counting',
        standards: ['K.CC.A.3'], ee: ['M.EE.2.NBT.3'],
        teaches: 'writing the numerals 0-20 (formation: trace, then copy, then write) and writing the numeral for a counted picture, 0 for none',
        problemTypes: ['trace the numeral', 'copy the numeral beside the model', 'write the numeral for a picture count (0-20)', 'write the missing numeral in a track', 'match numeral to picture'],
        templates: ['counters', 'seqstrip'], newTemplates: [],
        answer: 'the written numeral in a large box (handwriting on paper; on screen the pupil types or taps the digit keypad)',
        ladder: 'O2 0-5 → 0-10 → 11-20 · O3 dotted trace with start dot and arrow → start dot only → empty box · O6 pictures / dots / ten frame',
        misconceptions: ['reverses 2, 3, 5, 7, 9', 'writes 31 for 13', 'leaves the box empty for zero'],
        wrmSteps: [], after: ['zero'],
    }),
    count_conserve: P({
        kind: 'option', skill: 'counting:count_objects', option: 'task: "same number?" after the objects are moved or counted in another order',
        name: 'Same Number After Moving (option)', grade: 'K', family: 'counting', standards: ['K.CC.B.4b'], ee: ['M.EE.K.CC.4'],
        teaches: 'the last number said tells how many, and the number of objects does not change when they are moved or counted in a different order',
        problemTypes: ['two pictures of the same set, one spread out: same number? tick', 'count in a new order: how many now?', 'which picture has the same number?'],
        templates: ['counters'], newTemplates: [], answer: 'tick same / not the same; write the number',
        ladder: 'O2 to 5 → to 10 · O3 touch dots numbered → none · O6 rows / scattered / line',
        misconceptions: ['spread-out objects are "more"', 'recounting from the other end gives a new number'], wrmSteps: [], after: [],
    }),
    count_objects_more: P({
        kind: 'option', skill: 'counting:count_objects', option: 'arrangement "circle" and band 30',
        name: 'Count in a Circle and to 30 (option)', grade: 'K', family: 'counting', standards: ['K.CC.B.5'], ee: ['M.EE.2.NBT.2'],
        teaches: 'counting up to 20 things arranged in a circle (mark the start) and up to 30 things for the EE',
        problemTypes: ['how many in the circle? (mark where you start)', 'how many in the array?', 'count to 30 in rows of ten'],
        templates: ['counters'], newTemplates: [], answer: 'write the number',
        ladder: 'O2 circle to 10 → to 20; band 30 · O3 start object marked → none · O6 circle / array / line',
        misconceptions: ['counts round the circle twice', 'loses the place after 20'], wrmSteps: [], after: [],
    }),
    pictures_to_sentence: P({
        kind: 'option', skill: 'addition:add_5_pictures', also: ['subtraction:sub_5_pictures'], option: 'response "write the number sentence" (the pupil writes 3 + 2 = 5 for the picture)',
        name: 'Write the Number Sentence for the Picture (option)', grade: 'K', family: 'operations', standards: ['K.OA.A.1'], ee: ['M.EE.K.OA.1'],
        teaches: 'representing addition and subtraction: the pupil writes the equation a picture shows, and draws a picture for an equation',
        problemTypes: ['write the + sentence for two groups', 'write the − sentence for a take-away picture', 'draw dots for 4 + 1', 'which sentence matches the picture?'],
        templates: ['counters', 'equation'], newTemplates: [], answer: 'write the three numbers in the sentence frame __ + __ = __',
        ladder: 'O2 within 5 → within 10 · O3 frame with signs printed → blank line · O6 pictures / dots / ten frame',
        misconceptions: ['writes the total first (5 + 3 = 2)', 'uses + for a take-away picture'], wrmSteps: ['Y1.B2.S1'], after: [],
    }),
    measurable_attributes: P({
        kind: 'new', skill: 'comparing:what_can_we_measure', name: 'What Can We Measure?', grade: 'K', family: 'measurement',
        standards: ['K.MD.A.1'], ee: ['M.EE.K.MD.1'],
        teaches: 'naming measurable attributes of one object (how long, how tall, how heavy, how much it holds) and telling measurable from not measurable (colour)',
        problemTypes: ['tick every word that you can measure for this object', 'which question can a ruler answer?', 'match the attribute to the tool', 'long or heavy? sort the questions'],
        templates: ['wordpic'], newTemplates: ['picture-row'], answer: 'tick words from a picture-word bank',
        ladder: 'O2 two attributes (long, heavy) → four (tall, holds) · O3 icons beside each word → words only · O6 objects',
        misconceptions: ['colour is something we measure', 'only length can be measured'], wrmSteps: ['R.B2.S1', 'R.B8.S3'], after: [],
    }),

    // ------------------------------------------------------------------ operations (1-2)
    add_three_forms: P({
        kind: 'option', skill: 'addition:add_three', option: 'form: word problem (three addends, sum ≤ 20) and "make a ten first" (ring the two that make 10)',
        name: 'Add Three Numbers: Stories and Make a Ten First (option)', grade: '1', family: 'operations', standards: ['1.OA.A.2', '1.OA.B.3'], ee: ['M.EE.1.OA.2'],
        teaches: 'solving three-addend word problems and adding three numbers by grouping two that make ten (associative and commutative properties as strategies)',
        problemTypes: ['story with three addends', 'ring the pair that makes 10, then add', 'change the order to make it easier', 'which way is easier?'],
        templates: ['word-work', 'equation'], newTemplates: [], answer: 'write the total; ring the pair',
        ladder: 'O2 sum ≤ 10 → ≤ 20; pair adjacent → split · O3 pair pre-ringed → first number ringed → none · O6 pictures / numbers',
        misconceptions: ['adds only two of the three', 'always adds left to right even when a ten is hidden'], wrmSteps: ['Y1.B5.S7'], after: [],
    }),
    make_ten_subtract: P({
        kind: 'option', skill: 'number_sense:make_a_ten', option: 'subtraction: back through ten (13 − 4 = 13 − 3 − 1)',
        name: 'Subtract Back Through Ten (option)', grade: '1', family: 'operations', standards: ['1.OA.C.6'], ee: [],
        teaches: 'subtracting within 20 by decomposing to a ten: 13 − 4 = 13 − 3 − 1 = 10 − 1',
        problemTypes: ['split the number you take away', 'jump to 10, then the rest', 'which split gets to 10?', 'fill the steps'],
        templates: ['hop-line', 'bond'], newTemplates: [], answer: 'write the split and the answer in the step boxes',
        ladder: 'O2 teens − 1-digit crossing 10 · O3 ten frame pair drawn → number line → none · O6 frames / line',
        misconceptions: ['takes the whole second number from 10', 'splits the wrong number'], wrmSteps: ['Y2.B2.S11'], after: [],
    }),
    equal_sign_repair: P({
        kind: 'repair', skill: 'addition:equal_sign', option: 'route the skill to its own generator (it deals plain column addition today) and add the forms 6 = 6, 7 = 8 − 1, 5 + 2 = 2 + 5, 4 + 1 = 5 + 2',
        name: 'True or False Equations (repair)', grade: '1', family: 'operations', standards: ['1.OA.D.7'], ee: ['M.EE.1.OA.7', 'M.EE.6.EE.1-2'],
        teaches: 'the equal sign means "the same as"; deciding whether equations with + and − on either side are true or false',
        problemTypes: ['true or false: a + b = c + d', 'true or false: 7 = 8 − 1 (answer on the left)', 'true or false: 6 = 6', 'turnaround: 5 + 2 = 2 + 5', 'make it true (one blank)'],
        templates: ['equation'], newTemplates: [], answer: 'tick True or False; write the number',
        ladder: 'O2 within 10 → 20; + only → + and − · O3 balance picture under each side → none · O6 balance / plain',
        misconceptions: ['= means "the answer comes next"', '7 = 8 − 1 is false because the answer is on the left'], wrmSteps: ['Y2.B2.S20'], after: [],
    }),
    tens_any: P({
        kind: 'option', skill: 'addition:add_sub_10s', option: 'task: any multiple of 10 from a multiple of 10 (70 − 30), and a 2-digit number ± a multiple of 10 (34 + 20); support: tens rods',
        name: 'Add and Subtract Multiples of Ten (option)', grade: '1', family: 'operations', standards: ['1.NBT.C.4', '1.NBT.C.6'], ee: ['M.EE.1.NBT.4'],
        teaches: 'adding and subtracting multiples of 10 (10-90) and adding a multiple of 10 to a 2-digit number, with rods, and relating it to the written sum',
        problemTypes: ['70 − 30 with rods', '34 + 20 with rods', 'which picture shows 50 − 20?', 'missing multiple of ten'],
        templates: ['base10', 'equation'], newTemplates: [], answer: 'write the answer',
        ladder: 'O2 ± 10 (today) → multiples of 10 → 2-digit ± multiple of 10 · O3 rods drawn and crossed out → none · O6 rods / number line',
        misconceptions: ['70 − 30 = 4', '34 + 20 = 36 (adds to the ones)'], wrmSteps: ['Y1.B12.S3'], after: [],
    }),
    stack_base10_support: P({
        kind: 'option', skill: 'addition:add_100_mixed', also: ['subtraction:sub_100_mixed', 'addition:add_1k_mixed', 'subtraction:sub_1k_mixed'], option: 'support "base-10 picture" beside the column (a structural drawing of tens and ones / hundreds that regroups with the written method)',
        name: 'Add and Subtract With a Base-10 Picture (option)', grade: '1-2', family: 'operations', standards: ['1.NBT.C.4', '2.NBT.B.7'], ee: ['M.EE.2.NBT.7'],
        teaches: 'adding and subtracting within 100 and 1,000 with a drawn model that mirrors the column method (compose or decompose a ten or hundred)',
        problemTypes: ['add with the picture then the column', 'subtract with an exchange drawn', 'match the picture to the column step', 'which exchange is shown?'],
        templates: ['stack', 'base10'], newTemplates: [], answer: 'write the answer in the column (the picture is support, not an answer)',
        ladder: 'O2 within 100 → 1,000; no regroup → regroup · O3 picture with exchange drawn → picture only → none · O6 rods / place-value disks',
        misconceptions: ['adds the tens as ones', 'exchanges but forgets to add the new ten'], wrmSteps: ['Y2.B2.S16', 'Y3.B2.S13'], after: [],
    }),
    odd_even_pairs: P({
        kind: 'option', skill: 'composing:odd_even', option: 'form: picture of up to 20 objects to pair up, and "write the even number as a double" (14 = 7 + 7)',
        name: 'Odd or Even by Pairing (option)', grade: '2', family: 'counting', standards: ['2.OA.C.3'], ee: ['M.EE.2.OA.3'],
        teaches: 'deciding odd or even by pairing objects or counting in 2s, and writing an even number as a sum of two equal addends',
        problemTypes: ['pair the objects: odd or even?', 'count in 2s to decide', 'write 14 = 7 + 7', 'which number is a double?'],
        templates: ['counters', 'equation'], newTemplates: [], answer: 'tick odd / even; write the double',
        ladder: 'O2 to 10 → 20 · O3 pairs ringed → first pair ringed → none · O6 objects / counters / cubes',
        misconceptions: ['a number is odd if it has an odd digit anywhere', 'writes 14 = 10 + 4'], wrmSteps: ['Y2.B5.S12'], after: [],
    }),
    regroup_hundreds: P({
        kind: 'option', skill: 'composing:base10_regroup', option: 'band 999: trade 1 hundred for 10 tens',
        name: 'A Hundred Is Ten Tens (option)', grade: '2', family: 'placevalue', standards: ['2.NBT.A.1a'], ee: ['M.EE.2.NBT.1'],
        teaches: '100 as a bundle of ten tens: build, trade a flat for ten rods, and back',
        problemTypes: ['trade 1 hundred for 10 tens', 'how many tens in 300?', 'bundle 10 tens into a hundred', 'same number, new picture'],
        templates: ['base10'], newTemplates: [], answer: 'build or write the number of tens',
        ladder: 'O2 hundreds only → with tens and ones · O3 flat drawn with its ten rods → none · O6 blocks / disks',
        misconceptions: ['100 = 10 ones', 'a trade changes the number'], wrmSteps: ['Y3.B1.S3'], after: [],
    }),
    hundreds_foundation: P({
        kind: 'option', skill: 'composing:tens_foundation_visual', option: 'unit "hundreds": 100, 200 … 900 as 1 … 9 hundreds (0 tens 0 ones)',
        name: 'How Many Hundreds? (option)', grade: '2', family: 'placevalue', standards: ['2.NBT.A.1b'], ee: ['M.EE.2.NBT.1'],
        teaches: 'the numbers 100-900 are 1-9 hundreds and 0 tens, 0 ones',
        problemTypes: ['how many hundreds?', 'write the number for the flats', 'fill hundreds, tens, ones for 600', 'match flats to the number'],
        templates: ['base10', 'pv'], newTemplates: [], answer: 'write the number of hundreds or the number',
        ladder: 'O2 to 500 → 900 · O3 each flat labelled 100 → none · O6 flats / disks',
        misconceptions: ['600 has 6 tens', 'writes 6 for 600'], wrmSteps: ['Y3.B1.S2'], after: [],
    }),
    comparison_statements: P({
        kind: 'option', skill: 'multiplication:mult_comparison', also: ['multiplication:mult_comparison_plain'], option: 'form "statement ↔ equation": 35 = 5 × 7 read as "35 is 5 times as many as 7" (and 7 times as many as 5), and the equation written for a comparison sentence',
        name: 'Times as Many: Statements and Equations (option)', grade: '4', family: 'operations', standards: ['4.OA.A.1'], ee: ['M.EE.4.OA.1'],
        teaches: 'interpreting a multiplication equation as a multiplicative comparison and writing the equation for a verbal comparison',
        problemTypes: ['35 = 5 × 7 means … (tick both statements)', 'write the equation for "24 is 3 times as many as 8"', 'which statement matches the equation?', 'fill the blank: __ is 4 times as many as 6'],
        templates: ['equation'], newTemplates: ['bar-model'], answer: 'write the equation; tick statements',
        ladder: 'O2 facts to 5 × 5 → 10 × 10 · O3 comparison bar model → none · O6 bars / plain',
        misconceptions: ['reads 5 × 7 as "5 more than 7"', 'only one of the two statements is true'], wrmSteps: [], after: [],
    }),
    mult_4x1: P({
        kind: 'option', skill: 'multiplication:multiply', also: ['multiplication:area_model_mult'], option: 'size "4-digit × 1-digit" (tiles 41) on the column method and the area model',
        name: 'Multiply a 4-Digit Number by a 1-Digit Number (option)', grade: '4', family: 'operations', standards: ['4.NBT.B.5'], ee: [],
        teaches: 'multiplying a whole number of up to four digits by a one-digit number, with the area model and the column method side by side',
        problemTypes: ['area model with four parts', 'column method with carries', 'match the model to the column', 'estimate first'],
        templates: ['stack', 'area-model'], newTemplates: [], answer: 'write the product in the grid',
        ladder: 'O2 no carry → carries → zero digits (3,045 × 6) · O3 carry boxes and partial products → none · O6 area model / column',
        misconceptions: ['forgets a carry into the thousands', 'multiplies a zero digit as 1'], wrmSteps: ['Y4.B5.S11'], after: [],
    }),
    explain_strategy: P({
        kind: 'new', skill: 'number_sense:why_it_works', name: 'Why Does It Work?', grade: '2', family: 'operations',
        standards: ['2.NBT.B.9'], ee: [],
        teaches: 'explaining why an addition or subtraction strategy works using place value and the properties of operations (reasons chosen from a bank)',
        problemTypes: ['pick the reason for a worked strategy (add tens to tens, ones to ones)', 'why is 38 + 25 = 40 + 23?', 'why does 52 − 17 = 55 − 20?', 'find the step that is wrong and say why'],
        templates: ['equation', 'stack'], newTemplates: [], answer: 'tick a reason from a bank of 3 (Say: frame on the model)',
        ladder: 'O2 within 100 → 1,000 · O3 base-10 picture of the step → none · O6 picture / numbers',
        misconceptions: ['compensation changes the answer', 'the order of subtraction does not matter'], wrmSteps: ['Y3.B2.S2', 'Y3.B2.S5'], after: ['add_sub_patterns'],
    }),
    // ------------------------------------------------------------------ measurement
    order_length_tasks: P({
        kind: 'option', skill: 'shapes_early:order_objects_length', option: 'task "compare using a third object" (A is longer than C, C is longer than B) and "order by counted units" (cube trains)',
        name: 'Compare Lengths Indirectly and by Units (option)', grade: '1', family: 'measurement', standards: ['1.MD.A.1'], ee: ['M.EE.2.MD.3', 'M.EE.2.MD.4'],
        teaches: 'comparing two lengths indirectly by a third object, and ordering objects by lengths measured in non-standard units',
        problemTypes: ['the string is longer than the pencil and shorter than the book: which is longest?', 'order three by cube counts', 'which is longer? use the string', 'longest / shortest'],
        templates: ['wordpic', 'counters'], newTemplates: ['picture-row'], answer: 'circle or number 1-3',
        ladder: 'O2 two clues → three objects → units · O3 objects drawn to scale → clue sentences only · O6 pictures / bars',
        misconceptions: ['the object mentioned first is longer', 'more units always means longer even with different units'], wrmSteps: ['Y1.B7.S2'], after: [],
    }),
    measure_two_units: P({
        kind: 'option', skill: 'shapes_early:measure_nonstandard', option: 'task "measure twice": the same object in two units (paper clips and crayons; inches and cm)',
        name: 'Measure With Two Units (option)', grade: '2', family: 'measurement', standards: ['2.MD.A.2'], ee: ['M.EE.2.MD.1'],
        teaches: 'measuring one length in two different units and relating the counts to the unit size (the bigger unit gives the smaller count)',
        problemTypes: ['how many clips? how many crayons?', 'which unit is longer?', 'why is the number smaller?', 'predict the second count'],
        templates: ['legacy'], newTemplates: ['measure-scale'], answer: 'write both counts; tick the longer unit',
        ladder: 'O2 non-standard → cm and inches · O3 units drawn end to end → start marks only · O6 units',
        misconceptions: ['more units means the object is longer', 'gaps and overlaps ignored'], wrmSteps: ['Y2.B6.S1'], after: [],
    }),
    ruler_difference: P({
        kind: 'option', skill: 'measurement:reading_ruler', option: 'task "how much longer?": two objects on one ruler; cm and inches',
        name: 'How Much Longer? (option)', grade: '2', family: 'measurement', standards: ['2.MD.A.4'], ee: ['M.EE.4.MD.2'],
        teaches: 'measuring two objects with a standard unit and finding how much longer one is',
        problemTypes: ['measure both, then the difference', 'which is longer and by how much?', 'difference on the ruler (count on)', 'story: the ribbon is longer by …'],
        templates: ['legacy'], newTemplates: ['measure-scale'], answer: 'write both lengths and the difference with the unit',
        ladder: 'O2 whole inches → whole cm · O3 both start at 0 → one not at 0 · O6 ruler above / below',
        misconceptions: ['adds the two lengths', 'reads the end number of an object not starting at 0'], wrmSteps: ['Y2.B6.S4', 'Y3.B5.S7'], after: [],
    }),
    elapsed_stories: P({
        kind: 'option', skill: 'measurement:elapsed_mixed', also: ['measurement:elapsed_find_duration', 'measurement:elapsed_find_start'], option: 'form "story": time-interval word problems with the time line as the drawing',
        name: 'Time Word Problems (option)', grade: '3', family: 'measurement', standards: ['3.MD.A.1'], ee: ['M.EE.3.MD.1'],
        teaches: 'word problems adding and subtracting time intervals in minutes, drawn on a number-line (time line) diagram',
        problemTypes: ['start and duration: when does it end?', 'start and end: how long?', 'end and duration: when did it start?', 'two intervals in a row'],
        templates: ['timeline', 'word-work'], newTemplates: [], answer: 'write the time or the minutes',
        ladder: 'O2 within the hour → across the hour → two intervals · O3 time line with jumps drawn → blank line → none · O6 analogue / digital times',
        misconceptions: ['treats 1:50 + 20 min as 1:70', 'subtracts times like decimals'], wrmSteps: ['Y3.B10.S9', 'Y4.B11.S6'], after: [],
    }),
    conversion_table: P({
        kind: 'option', skill: 'measurement:unit_conversions', option: 'form "conversion table": complete a two-column table (1 ft = 12 in, 2 ft, 3 ft …) and use it',
        name: 'Conversion Tables (option)', grade: '4', family: 'measurement', standards: ['4.MD.A.1'], ee: ['M.EE.4.MD.1'],
        teaches: 'knowing relative sizes of units in one system and recording equivalents in a two-column table (ft/in, m/cm, kg/g, lb/oz, l/ml, hr/min/sec)',
        problemTypes: ['complete the table', 'use the table to convert', '1 ft is __ times as long as 1 in', 'find the error in a table'],
        templates: ['legacy'], newTemplates: ['data-table'], answer: 'write the missing entries',
        ladder: 'O2 ×10, ×12 → ×60, ×100 → ×1,000 · O3 first two rows filled → none · O6 table vertical / horizontal',
        misconceptions: ['uses 100 for every conversion', 'divides when going to a smaller unit'], wrmSteps: ['Y4.B6.S1', 'Y5.B14.S5'], after: ['time_convert'],
    }),

    // ------------------------------------------------------------------ geometry
    defining_attributes: P({
        kind: 'new', skill: 'shapes_early:defining_attributes', name: 'Is It Still a Triangle?', grade: '1', family: 'geometry',
        standards: ['1.G.A.1'], ee: ['M.EE.1.G.1'],
        teaches: 'defining attributes (closed, number of straight sides, corners) versus non-defining attributes (colour-free: size, orientation, thickness of line)',
        problemTypes: ['is it still a triangle when turned / bigger / thinner?', 'which of these are triangles? (open shapes, curved sides)', 'what makes it a square? tick', 'sort: changes the shape / does not'],
        templates: ['wordpic'], newTemplates: ['picture-row'], answer: 'tick yes / no; tick attributes from a bank',
        ladder: 'O2 triangles/squares → rectangles/hexagons · O3 attribute icons → words · O6 outline weight / orientation',
        misconceptions: ['an upside-down triangle is not a triangle', 'a long thin rectangle is not a rectangle', 'an open shape counts'], wrmSteps: ['Y1.B3.S3', 'Y2.B3.S2'], after: [],
    }),
    rect_rows_columns: P({
        kind: 'option', skill: 'shapes_early:compose_rect_from_squares', option: 'sizes up to 5 × 5 and task "partition and count": draw the rows and columns, then write the total',
        name: 'Rows and Columns of Squares (option)', grade: '2', family: 'geometry', standards: ['2.G.A.2'], ee: [],
        teaches: 'partitioning a rectangle into rows and columns of same-size squares and counting them',
        problemTypes: ['draw the lines at the marks, count the squares', 'how many rows? columns? squares?', 'fill with squares (the current drag task, now any size)', 'which rectangle has 12 squares?'],
        templates: ['legacy'], newTemplates: ['shape-grid'], answer: 'draw lines; write rows, columns, total',
        ladder: 'O2 2 × 3 → 3 × 4 → 5 × 5 · O3 tick marks on all sides → two sides → none · O6 grid dots / ticks',
        misconceptions: ['unequal squares', 'counts lines instead of squares'], wrmSteps: ['Y3.B4.S6'], after: [],
    }),
    area_tile_multiply: P({
        kind: 'option', skill: 'area_perimeter:area_unit_squares', option: 'unit label (square units, cm², m², in², ft²) and form "tile, then multiply" (count the squares, then write rows × columns)',
        name: 'Area by Tiling and Multiplying (option)', grade: '3', family: 'geometry', standards: ['3.MD.C.5a', '3.MD.C.6', '3.MD.C.7a'], ee: ['M.EE.4.MD.3', 'M.EE.6.G.1'],
        teaches: 'area measured in square units of a named size, and that the tiled count equals side × side',
        problemTypes: ['count the squares; write the unit', 'count, then rows × columns', 'same area, check by multiplying', 'which unit square was used?'],
        templates: ['legacy'], newTemplates: ['shape-grid'], answer: 'write the area with its square unit; write the multiplication',
        ladder: 'O2 rectangles to 24 → to 60 · O3 squares numbered → rows numbered → none · O6 unit name shown / pupil writes it',
        misconceptions: ['writes cm for cm²', 'counts the perimeter squares only'], wrmSteps: ['Y3.B4.S3'], after: [],
    }),
    partition_draw: P({
        kind: 'option', skill: 'shapes_early:partition_shapes', option: 'task "draw the cuts": partition a shape into n equal-area parts and write the unit fraction of each part',
        name: 'Cut Into Equal Areas (option)', grade: '3', family: 'geometry', standards: ['3.G.A.2'], ee: ['M.EE.3.G.2'],
        teaches: 'partitioning shapes into parts with equal areas and naming each part as a unit fraction of the whole',
        problemTypes: ['draw lines to make 4 equal parts; each is __ of the shape', 'are these parts equal in area?', 'two different ways to cut into quarters', 'name one part'],
        templates: ['frac-model'], newTemplates: ['shape-grid'], answer: 'draw the cut lines; write the unit fraction',
        ladder: 'O2 halves/quarters → thirds/sixths → eighths · O3 grid under the shape → dots → none · O6 rectangles / circles / hexagons',
        misconceptions: ['equal parts must be the same shape', 'counts parts that are not equal'], wrmSteps: ['Y3.B6.S1'], after: [],
    }),
    points_lines_rays: P({
        kind: 'new', skill: 'angles_lines:points_lines_rays', name: 'Point, Line, Segment or Ray?', grade: '4', family: 'geometry',
        standards: ['4.G.A.1'], ee: ['M.EE.4.G.1'],
        teaches: 'identifying and drawing points, lines, line segments, rays, right/acute/obtuse angles and perpendicular and parallel lines, and finding them in 2-D figures',
        problemTypes: ['name it: point, line, segment, ray', 'draw a ray from A through B on a dot grid', 'draw a line parallel / perpendicular to this one', 'find the perpendicular sides in the shape', 'draw an obtuse angle'],
        templates: ['legacy'], newTemplates: ['angle-kit', 'shape-grid'], answer: 'write the word from a bank; draw on the grid (the key shows one drawing)',
        ladder: 'O2 name → draw → find in figures · O3 arrowheads and end dots explained in a key → none · O6 dot / square grid',
        misconceptions: ['a segment and a line are the same', 'lines must be horizontal to be parallel'], wrmSteps: ['Y3.B11.S6', 'Y3.B11.S7'], after: [],
    }),
    protractor_read: P({
        kind: 'option', skill: 'angles_lines:measure_angles', option: 'form "read the protractor": a protractor drawn over the angle; write the degrees (not multiple choice)',
        name: 'Measure With a Protractor (option)', grade: '4', family: 'geometry', standards: ['4.MD.C.6'], ee: [],
        teaches: 'measuring angles in whole degrees with a protractor: which scale, from 0',
        problemTypes: ['read the angle on the protractor', 'which scale starts at 0?', 'is it acute or obtuse? (check the reading)', 'measure two angles and compare'],
        templates: ['legacy'], newTemplates: ['angle-kit'], answer: 'write the angle in degrees',
        ladder: 'O2 multiples of 10° → 5° → 1° · O3 the 0 of the scale ringed → none · O6 arm to the right / to the left',
        misconceptions: ['reads the wrong scale (60° for 120°)', 'does not line up the base'], wrmSteps: ['Y5.B10.S2', 'Y5.B10.S4'], after: [],
    }),
    volume_composite_repair: P({
        kind: 'repair', skill: 'area_perimeter:volume_composite', option: 'deal what the name says: two non-overlapping rectangular prisms joined (L-shaped solids), not one prism',
        name: 'Composite 3-D Volume (repair)', grade: '5', family: 'geometry', standards: ['5.MD.C.5c'], ee: ['M.EE.5.MD.5'],
        teaches: 'volume is additive: the volume of two joined prisms is the sum of their volumes, in real-world problems',
        problemTypes: ['volume of an L-shaped solid', 'split it two ways', 'find a missing edge first', 'story: two boxes joined'],
        templates: ['legacy'], newTemplates: ['solid-kit'], answer: 'write the volume in cubic units',
        ladder: 'O2 small edges → larger · O3 split line drawn → none · O6 labelled / some labels',
        misconceptions: ['multiplies all the edges shown', 'counts the overlap twice'], wrmSteps: ['Y6.B10.S8'], after: ['volume_cubes'],
    }),
    coord_context: P({
        kind: 'option', skill: 'coordinates:coordinate_q1', option: 'form "in context": points are data (hours and pages, days and height); plot them and say what a point means',
        name: 'Graph Points in a Real Problem (option)', grade: '5', family: 'geometry', standards: ['5.G.A.2'], ee: [],
        teaches: 'representing real-world problems by graphing points in the first quadrant and interpreting the coordinates',
        problemTypes: ['plot the table as points', 'what does (3, 12) mean in the story?', 'which point shows …?', 'read the missing value'],
        templates: ['legacy'], newTemplates: ['coord-grid', 'data-table'], answer: 'plot; write the meaning from a bank',
        ladder: 'O2 axes by 1 → by 2 or 5 · O3 axis titles with units → none · O6 grid size',
        misconceptions: ['x and y swapped', 'reads the point on the wrong axis'], wrmSteps: ['Y6.B13.S2'], after: [],
    }),
    net_sa_triangles: P({
        kind: 'option', skill: 'coordinates:net_surface_area', option: 'solids with triangle faces: triangular prisms and square pyramids',
        name: 'Surface Area From Nets With Triangles (option)', grade: '6', family: 'geometry', standards: ['6.G.A.4'], ee: [],
        teaches: 'nets made of rectangles and triangles and the surface area from the net',
        problemTypes: ['which solid does the net make?', 'area of each face', 'total surface area', 'find the missing face'],
        templates: ['legacy'], newTemplates: ['solid-kit'], answer: 'write each area and the total',
        ladder: 'O2 prisms → pyramids · O3 faces labelled with dimensions → none · O6 net / solid',
        misconceptions: ['forgets to halve a triangle', 'counts a face twice'], wrmSteps: [], after: [],
    }),
    volume_fractional: P({
        kind: 'option', skill: 'area_perimeter:volume', option: 'fractional edge lengths (1/2 and 1/4 units) and packing with unit-fraction cubes',
        name: 'Volume With Fractional Edges (option)', grade: '6', family: 'geometry', standards: ['6.G.A.2'], ee: ['M.EE.6.G.2'],
        teaches: 'volume of a prism with fractional edges by packing 1/2-unit cubes and by V = l × w × h = B × h',
        problemTypes: ['how many 1/2-unit cubes fill it?', 'V = l × w × h with fractions', 'show the two answers match', 'story'],
        templates: ['legacy'], newTemplates: ['solid-kit'], answer: 'write the volume as a fraction or mixed number of cubic units',
        ladder: 'O2 halves → quarters → mixed numbers · O3 layers drawn → none · O6 cubes / plain',
        misconceptions: ['each small cube is 1 cubic unit', 'adds the edges'], wrmSteps: [], after: ['volume_cubes'],
    }),

    // ------------------------------------------------------------------ fractions / decimals / ratio
    whole_frac_reverse: P({
        kind: 'option', skill: 'composing:whole_as_fraction', option: 'direction "fraction → whole" (6/1 = 6, 8/4 = 2) and "same point" on a number line (4/4 and 1)',
        name: 'Fractions That Equal Whole Numbers (option)', grade: '3', family: 'fractions', standards: ['3.NF.A.3c'], ee: ['M.EE.3.NF.3'],
        teaches: 'recognising fractions equivalent to whole numbers and locating 4/4 and 1 at the same point',
        problemTypes: ['6/1 = ?', '8/4 = ? (with a model)', 'which fractions equal 1?', 'mark 4/4 and 1 on the line'],
        templates: ['frac-model', 'number-line'], newTemplates: [], answer: 'write the whole number; mark',
        ladder: 'O2 over 1 → equal to 1 → equal to 2, 3 · O3 model drawn → none · O6 bars / line',
        misconceptions: ['6/1 = 1/6', '4/4 = 4'], wrmSteps: ['Y3.B6.S8'], after: ['frac_count'],
    }),
    frac_same_whole: P({
        kind: 'option', skill: 'fractions:compare', option: 'items "same whole?": two fractions of different-size wholes (can we compare?) and justify a comparison with a model',
        name: 'Compare Fractions of the Same Whole (option)', grade: '3-4', family: 'fractions', standards: ['3.NF.A.3d', '4.NF.A.2'], ee: ['M.EE.4.NF.2'],
        teaches: 'comparisons of fractions are valid only when they refer to the same whole; justify with a visual model',
        problemTypes: ['half of a small pizza vs a third of a large one: can we compare?', 'draw both on the same whole', 'justify: tick the model that proves it', 'compare, then show'],
        templates: ['frac-model', 'compare'], newTemplates: [], answer: 'write <, > or =, or tick "cannot tell"',
        ladder: 'O2 same denominator → same numerator → different · O3 models drawn on equal bars → none · O6 bars / circles',
        misconceptions: ['a half is always bigger than a third', 'the bigger picture is the bigger fraction'], wrmSteps: [], after: ['compare_numerator'],
    }),
    dec_compare_model: P({
        kind: 'option', skill: 'decimals:compare_decimal', option: 'support "hundred squares" beside each decimal and items "same whole?"',
        name: 'Compare Decimals With Models (option)', grade: '4', family: 'decimals', standards: ['4.NF.C.7'], ee: [],
        teaches: 'comparing decimals to hundredths by reasoning about size, with a hundred-square model, and only when they refer to the same whole',
        problemTypes: ['shade both, then compare', '0.5 vs 0.45 with squares', 'same whole?', 'justify: which picture proves it?'],
        templates: ['frac-model', 'compare'], newTemplates: [], answer: 'write <, > or =',
        ladder: 'O2 tenths → hundredths → mixed · O3 squares shaded → outline → none · O6 squares / strips',
        misconceptions: ['0.45 > 0.5 because 45 > 5', 'more digits means bigger'], wrmSteps: ['Y4.B9.S5'], after: [],
    }),
    decimal_models: P({
        kind: 'option', skill: 'decimals:add_decimal', also: ['decimals:sub_decimal', 'decimals:mult_decimal'], option: 'support "decimal model": hundred squares or place-value counters beside the column, and an area model for decimal × whole',
        name: 'Decimal Operations With Models (option)', grade: '5', family: 'decimals', standards: ['5.NBT.B.7'], ee: ['M.EE.5.NBT.7'],
        teaches: 'adding, subtracting and multiplying decimals to hundredths with a drawn model that is related to the written method',
        problemTypes: ['add with hundred squares, then the column', 'subtract with an exchange of a tenth', 'multiply a decimal by a whole with an area model', 'which model matches the column?'],
        templates: ['stack', 'frac-model', 'pv'], newTemplates: [], answer: 'write the answer in the column (the model is support)',
        ladder: 'O2 tenths → hundredths → crossing 1 · O3 model with exchanges drawn → model only → none · O6 hundred squares / counters',
        misconceptions: ['lines up the right-hand digits, not the points', '0.3 + 0.45 = 0.48'], wrmSteps: ['Y5.B12.S3'], after: ['decimal_pv'],
    }),
    frac_wp_unlike: P({
        kind: 'option', skill: 'fraction_operations:frac_word_problems', also: ['fraction_operations:frac_word_problems_plain'], option: 'denominators "unlike" and task "is the answer reasonable?" (benchmark estimate)',
        name: 'Fraction Word Problems With Unlike Denominators (option)', grade: '5', family: 'fractions', standards: ['5.NF.A.2'], ee: ['M.EE.5.NF.1'],
        teaches: 'adding and subtracting fractions with unlike denominators in context, and checking with benchmarks (2/5 + 1/2 cannot be 3/7)',
        problemTypes: ['join two unlike fractions in a story', 'take away in a story', 'estimate first with 0, 1/2, 1', 'spot the unreasonable answer'],
        templates: ['word-work', 'frac-model'], newTemplates: [], answer: 'write the fraction; tick reasonable / not',
        ladder: 'O2 related denominators → unrelated → mixed numbers · O3 bar model → none · O6 pictures / plain',
        misconceptions: ['adds numerators and denominators', 'answer smaller than a part it added'], wrmSteps: ['Y6.B3.S9'], after: [],
    }),
    div_frac_frac: P({
        kind: 'new', skill: 'fraction_operations:div_frac_frac', name: 'Divide Fractions by Fractions', grade: '6', family: 'fractions',
        standards: ['6.NS.A.1'], ee: ['M.EE.6.NS.1'],
        teaches: 'interpreting and computing quotients of fractions (how many 3/4s in 2/3?), with visual models, the multiplication check and word problems',
        problemTypes: ['how many 1/4s in 3/4? (model)', 'a/b ÷ c/d with a common denominator model', 'check: 3/4 × 8/9 = 2/3', 'word problem (servings, strips of land)', 'whole ÷ fraction and fraction ÷ whole revisited'],
        templates: ['frac-model', 'word-work'], newTemplates: ['bar-model'], answer: 'write the quotient as a fraction or mixed number',
        ladder: 'O2 same denominator → related → any · O3 bar model with the divisor marked → none · O6 bars / number line',
        misconceptions: ['divides numerators and denominators straight across whatever the sizes', 'flips the wrong fraction', 'quotient must be smaller'], wrmSteps: [], after: [],
    }),
    mult_dec_dec: P({
        kind: 'option', skill: 'decimals:mult_decimal', option: 'factors "decimal × decimal" (3.45 × 2.6) with the standard algorithm',
        name: 'Multiply Decimals by Decimals (option)', grade: '6', family: 'decimals', standards: ['6.NS.B.3'], ee: [],
        teaches: 'multiplying multi-digit decimals by decimals with the standard algorithm and placing the point',
        problemTypes: ['1-dp × 1-dp', '2-dp × 1-dp', 'estimate then place the point', 'find the misplaced point'],
        templates: ['stack'], newTemplates: [], answer: 'write the product in the grid',
        ladder: 'O2 1 dp × 1 dp → 2 dp × 1 dp → 2 dp × 2 dp · O3 count-the-places box → none · O6 grid / plain',
        misconceptions: ['lines up the points as in addition', 'counts the places of one factor only'], wrmSteps: ['Y6.B8.S7'], after: [],
    }),
    unit_rate_fraction: P({
        kind: 'option', skill: 'conversions:unit_rate_intro', option: 'unit rates that are fractions (3 cups flour to 4 cups sugar = 3/4 cup per cup) and rate language',
        name: 'Fraction Unit Rates (option)', grade: '6', family: 'ratio', standards: ['6.RP.A.2'], ee: ['M.EE.6.RP.1'],
        teaches: 'the unit rate a/b of a ratio a : b, including fractional rates, said with "per" and "for each"',
        problemTypes: ['find the unit rate as a fraction', 'complete the rate sentence', 'which rate matches the ratio?', 'better buy'],
        templates: ['equation'], newTemplates: ['data-table'], answer: 'write the rate with its unit',
        ladder: 'O2 whole rates → fraction rates → decimals · O3 ratio table → none · O6 table / double line',
        misconceptions: ['divides the wrong way (4/3 cup per cup)', 'drops the unit'], wrmSteps: [], after: [],
    }),
    ratio_table_plot: P({
        kind: 'option', skill: 'conversions:ratio_tables', option: 'task "plot the pairs" on a coordinate grid and task "compare two ratio tables"',
        name: 'Ratio Tables: Plot and Compare (option)', grade: '6', family: 'ratio', standards: ['6.RP.A.3a'], ee: [],
        teaches: 'making tables of equivalent ratios, plotting the pairs and comparing ratios with tables',
        problemTypes: ['complete the table, then plot', 'which recipe is stronger? use tables', 'read a missing value from the graph', 'are these ratios equivalent?'],
        templates: ['legacy'], newTemplates: ['data-table', 'coord-grid'], answer: 'write the values; plot',
        ladder: 'O2 whole numbers small → larger · O3 first rows and axis scale given → none · O6 table / graph',
        misconceptions: ['adds the same amount to both rows', 'plots (y, x)'], wrmSteps: [], after: [],
    }),
    dnl_units: P({
        kind: 'option', skill: 'conversions:double_num_line', option: 'context "measurement units": convert units with a double number line or ratio table (12 in : 1 ft, 100 cm : 1 m)',
        name: 'Convert Units With Ratios (option)', grade: '6', family: 'ratio', standards: ['6.RP.A.3d'], ee: [],
        teaches: 'using ratio reasoning to convert measurement units, and transforming units when multiplying or dividing quantities',
        problemTypes: ['convert with a double number line', 'convert with a ratio table', 'rate × time with units', 'which conversion is right?'],
        templates: ['legacy'], newTemplates: ['data-table'], answer: 'write the converted amount with its unit',
        ladder: 'O2 whole-number rates → fractional amounts · O3 line with the unit pair marked → none · O6 line / table',
        misconceptions: ['multiplies when dividing is needed', 'mixes the units in the answer'], wrmSteps: ['Y6.B5.S4'], after: [],
    }),

    // ------------------------------------------------------------------ place value
    chart_120: P({
        kind: 'option', skill: 'composing:hundreds_chart_fill', option: 'band 120: chart windows from 100 to 120 (crossing 100)',
        name: 'Count to 120 on the Chart (option)', grade: '1', family: 'counting', standards: ['1.NBT.A.1'], ee: ['M.EE.1.NBT.1'],
        teaches: 'counting, reading and writing numerals to 120 starting anywhere, across 100',
        problemTypes: ['fill the window 95-115', 'what comes after 109?', 'count on from 98', 'fill the row 111-120'],
        templates: ['chartwindow'], newTemplates: [], answer: 'write the missing numerals',
        ladder: 'O2 90-110 → 100-120 · O3 row starts given → none · O6 window / whole chart',
        misconceptions: ['writes 1010 for 110', '109 → 200'], wrmSteps: ['Y2.B1.S5'], after: [],
    }),
    value_ten_times: P({
        kind: 'option', skill: 'placevalue:value', option: 'form "ten times / one tenth": compare the value of the same digit in two places (the 7 in 700 is 10 times the 7 in 70; 700 ÷ 70 = 10)',
        name: 'Ten Times the Place to the Right (option)', grade: '4-5', family: 'placevalue', standards: ['4.NBT.A.1', '5.NBT.A.1'], ee: [],
        teaches: 'a digit in one place is worth 10 times what it is worth in the place to its right and 1/10 of the place to its left',
        problemTypes: ['how many times greater is the 4 in 4,300 than the 4 in 430?', '700 ÷ 70 = ?', 'the 3 in 0.3 is 1/10 of the 3 in 3', 'which digit is worth ten times more?'],
        templates: ['pv', 'pv-support'], newTemplates: [], answer: 'write 10, 100 or 1/10',
        ladder: 'O2 adjacent places → two places apart → decimals (Grade 5) · O3 chart with the shift arrows → none · O6 chart / numbers',
        misconceptions: ['the value is the digit', 'answers "one more place" instead of ×10'], wrmSteps: ['Y4.B1.S2'], after: [],
    }),
    pv10_exponents: P({
        kind: 'option', skill: 'placevalue:place_value_10x', option: 'notation "powers written with exponents" (× 10³) and task "compare powers of ten by counting zeros"',
        name: 'Powers of Ten With Exponents (option)', grade: '5', family: 'placevalue', standards: ['5.NBT.A.2'], ee: ['M.EE.5.NBT.2'],
        teaches: 'the pattern of zeros and of the decimal point when multiplying or dividing by powers of 10, written with whole-number exponents',
        problemTypes: ['4.2 × 10² = ?', 'write 1,000 as 10³', 'how many zeros in 10⁵?', 'which is greater: 10³ or 1,000 ÷ 10?', 'explain the shift (bank)'],
        templates: ['pv-support'], newTemplates: [], answer: 'write the number or the exponent',
        ladder: 'O2 whole numbers → decimals → divide · O3 shift arrows → none · O6 chart / plain',
        misconceptions: ['10³ = 30', 'moves the point the wrong way when dividing'], wrmSteps: ['Y5.B1.S6'], after: [],
    }),
    sign_meanings: P({
        kind: 'option', skill: 'number_ops_mixed:which_sign', option: 'range 10 with + − = only and the words plus / add / combine, take away / subtract / separate, the same as / equal',
        name: 'What Do +, − and = Mean? (option)', grade: '2', family: 'operations', standards: [], ee: ['M.EE.2.NBT.5'],
        teaches: 'the meaning of the + sign, the − sign and the = sign in words and pictures, within 10',
        problemTypes: ['match the word to the sign', 'which sign makes it true (+ or −)?', 'the = sign means …', 'picture: combine or take away?'],
        templates: ['equation'], newTemplates: [], answer: 'write or circle the sign',
        ladder: 'O2 + and − → with = · O3 picture beside the words → words only · O6 pictures / plain',
        misconceptions: ['= means "write the answer"', 'take away written with +'], wrmSteps: [], after: [],
    }),

    // ------------------------------------------------------------------ algebra / patterns
    patterns_notice: P({
        kind: 'new', skill: 'patterns:notice_patterns', name: 'What Do You Notice?', grade: '3-4', family: 'algebra',
        standards: ['3.OA.D.9', '4.OA.C.5'], ee: ['M.EE.3.OA.8', 'M.EE.4.OA.5'],
        teaches: 'identifying arithmetic patterns in the addition and multiplication tables and in rule sequences, and explaining them with properties (4 × a number is always even; add 3 from 1 alternates odd, even)',
        problemTypes: ['shade the pattern in the table, tick what you notice', 'true or false: every product in the 5 row ends in 0 or 5', 'generate the terms, then say what alternates', 'why is 4 × n always even? (reason bank)', 'predict the 10th term'],
        templates: ['mult-grid', 'count-row'], newTemplates: [], answer: 'tick statements from a bank; write terms',
        ladder: 'O2 addition table → multiplication table → rule sequences · O3 pattern shaded → none · O6 table / track',
        misconceptions: ['a pattern seen in three terms always continues', 'odd × odd is even'], wrmSteps: ['Y3.B3.S13', 'Y4.B4.S15'], after: [],
    }),
    multi_step_four_ops: P({
        kind: 'option', skill: 'algebra:multi_step_word', also: ['algebra:multi_step_word_plain'], option: 'two steps with × and ÷ (3 packs of 6, 4 eaten), write the equation with a letter for the unknown, remainder steps, and a "reasonable?" estimate',
        name: 'Two-Step Problems With All Four Operations (option)', grade: '3-4', family: 'algebra', standards: ['3.OA.D.8', '4.OA.A.3'], ee: ['M.EE.3.OA.7', 'M.EE.4.OA.3'],
        teaches: 'two-step and multistep word problems with the four operations, represented by an equation with a letter, remainders interpreted, and checked by estimating',
        problemTypes: ['× then −', '÷ then +', 'write the equation with n', 'remainder decides the answer', 'is the answer reasonable? (round)'],
        templates: ['word-work'], newTemplates: ['bar-model'], answer: 'write each step answer; write the equation',
        ladder: 'O2 within 100 → 1,000; two steps → three · O3 bar model and step boxes → step boxes → none · O6 pictures / plain',
        misconceptions: ['answers the first step', 'uses the letter as a label, not a number', 'ignores the remainder'], wrmSteps: ['Y3.B4.S10', 'Y4.B5.S13'], after: [],
    }),
    write_numeric_expression: P({
        kind: 'option', skill: 'algebra:write_expression', option: 'numbers only, with brackets ("add 8 and 7, then multiply by 2" = 2 × (8 + 7)) and "interpret without calculating"',
        name: 'Write Number Expressions (option)', grade: '5', family: 'algebra', standards: ['5.OA.A.2'], ee: [],
        teaches: 'writing numerical expressions that record calculations, with brackets, and interpreting expressions without evaluating them',
        problemTypes: ['words → expression with brackets', 'expression → words (bank)', '3 × (a + b) is how many times a + b?', 'which expression matches?'],
        templates: ['equation'], newTemplates: ['expression'], answer: 'write the expression; circle from a bank',
        ladder: 'O2 one operation → two with brackets · O3 bracket boxes printed → none · O6 plain',
        misconceptions: ['writes 2 × 8 + 7 for "add then multiply"', 'evaluates when asked to interpret'], wrmSteps: [], after: [],
    }),
    pattern_pairs_graph: P({
        kind: 'option', skill: 'patterns:pattern_relationship', option: 'task "make the pairs and plot them" on a quadrant-I grid',
        name: 'Two Patterns as Ordered Pairs (option)', grade: '5', family: 'algebra', standards: ['5.OA.B.3'], ee: ['M.EE.5.OA.3'],
        teaches: 'generating two patterns from two rules, forming ordered pairs of corresponding terms and graphing them, and describing the relationship',
        problemTypes: ['generate both patterns', 'write the pairs', 'plot the pairs', 'tick the relationship (B is twice A)'],
        templates: ['count-row'], newTemplates: ['coord-grid'], answer: 'write the terms and pairs; plot',
        ladder: 'O2 add rules → multiply relationship · O3 first terms given → none · O6 grid size',
        misconceptions: ['pairs terms from different positions', 'plots (y, x)'], wrmSteps: [], after: [],
    }),
    abs_context: P({
        kind: 'option', skill: 'integers:abs_value', option: 'context: debt, depth, temperature; and "absolute value vs order" items (a balance less than −30 is a debt greater than 30)',
        name: 'Absolute Value in Context (option)', grade: '6', family: 'integers', standards: ['6.NS.C.7c', '6.NS.C.7d'], ee: ['M.EE.6.NS.7'],
        teaches: 'absolute value as distance from 0 and as size in a real situation, and telling absolute-value statements from order statements',
        problemTypes: ['|−30| = 30 describes the debt', 'which debt is greater?', 'which balance is less?', 'distance from 0 on a line'],
        templates: ['number-line'], newTemplates: [], answer: 'write the value; tick the statement',
        ladder: 'O2 integers → decimals · O3 number line → none · O6 line / story',
        misconceptions: ['−40 > −30 because 40 > 30', 'absolute value makes a number negative'], wrmSteps: [], after: ['negative_count'],
    }),
    gcf_distributive: P({
        kind: 'option', skill: 'number_theory:gcf_easy', option: 'task "write the sum as a product": 36 + 8 = 4 × (9 + 2)',
        name: 'Factor a Sum With the GCF (option)', grade: '6', family: 'number_theory', standards: ['6.NS.B.4'], ee: [],
        teaches: 'using the distributive property to write a sum of two whole numbers with a common factor as the factor times a sum with no common factor',
        problemTypes: ['36 + 8 = __ × (__ + __)', 'which is fully factored?', 'check by multiplying out', 'find the GCF first'],
        templates: ['equation'], newTemplates: ['expression'], answer: 'write the three numbers',
        ladder: 'O2 small sums → to 100 · O3 GCF given → none · O6 plain',
        misconceptions: ['uses a common factor that is not the greatest', '4 × (9 + 8)'], wrmSteps: [], after: [],
    }),
    parts_of_expression: P({
        kind: 'new', skill: 'algebra:parts_of_expression', name: 'Parts of an Expression', grade: '6', family: 'algebra',
        standards: ['6.EE.A.2b'], ee: [],
        teaches: 'naming parts of an expression (sum, term, product, factor, quotient, coefficient) and seeing a bracket as a single entity',
        problemTypes: ['circle the coefficient', 'how many terms?', '2 (8 + 7) is a product of which two factors?', 'match the word to the part', 'write an expression with three terms'],
        templates: ['equation'], newTemplates: ['expression'], answer: 'circle or write the word from a bank',
        ladder: 'O2 numbers → letters → brackets · O3 parts boxed → none · O6 plain',
        misconceptions: ['the coefficient is the letter', '2(8 + 7) has three terms'], wrmSteps: [], after: [],
    }),
    equiv_expressions: P({
        kind: 'option', skill: 'algebra:combine_like_terms', option: 'task "equivalent or not?": test two expressions with values (y + y + y and 3y)',
        name: 'Equivalent Expressions? (option)', grade: '6', family: 'algebra', standards: ['6.EE.A.4'], ee: ['M.EE.6.EE.3'],
        teaches: 'identifying when two expressions are equivalent: they name the same number for every value',
        problemTypes: ['substitute two values into both', 'equivalent or not? tick', 'find the pair that is not equivalent', 'write an equivalent expression'],
        templates: ['equation'], newTemplates: ['expression'], answer: 'tick; write the values',
        ladder: 'O2 like terms → distributive → both · O3 substitution table → none · O6 plain',
        misconceptions: ['one value that works proves equivalence', '3y = y + 3'], wrmSteps: [], after: [],
    }),
    inequality_write_graph: P({
        kind: 'option', skill: 'algebra:inequalities', option: 'task "write it from words" (x > c) and "show the solutions on a number line" (open/closed circle, arrow)',
        name: 'Write and Graph Inequalities (option)', grade: '6', family: 'algebra', standards: ['6.EE.B.8'], ee: [],
        teaches: 'writing x > c or x < c for a real condition and representing its infinitely many solutions on a number line',
        problemTypes: ['write the inequality for the rule', 'draw the solutions', 'which graph matches?', 'is 3.5 a solution?'],
        templates: ['number-line'], newTemplates: [], answer: 'write the inequality; draw circle and arrow',
        ladder: 'O2 > < → ≥ ≤ · O3 circle drawn, pupil adds the arrow → none · O6 horizontal / vertical line',
        misconceptions: ['only whole numbers are solutions', 'closed circle for >'], wrmSteps: [], after: [],
    }),
    two_variables: P({
        kind: 'new', skill: 'algebra:two_variable_relationships', name: 'Two Quantities That Change Together', grade: '6', family: 'algebra',
        standards: ['6.EE.C.9'], ee: [],
        teaches: 'dependent and independent variables in a real situation: a table, an equation (d = 65t) and a graph, and how they relate',
        problemTypes: ['complete the table from the story', 'write the equation', 'plot the pairs', 'which is the dependent variable?', 'read a value from the graph'],
        templates: ['function-table'], newTemplates: ['coord-grid', 'data-table'], answer: 'write values and the equation; plot',
        ladder: 'O2 one-step rules → two-step · O3 first rows and axis scale → none · O6 table / graph',
        misconceptions: ['swaps dependent and independent', 'adds the rate instead of multiplying'], wrmSteps: ['Y6.B7.S3', 'Y6.B7.S4'], after: ['function_machine'],
    }),

    // ------------------------------------------------------------------ data
    bar_graph_scale: P({
        kind: 'option', skill: 'graphs:build_bar_graph', option: 'scale 2, 5 or 10 per square (draw a scaled bar graph)',
        name: 'Draw a Scaled Bar Graph (option)', grade: '3', family: 'data', standards: ['3.MD.B.3'], ee: ['M.EE.3.MD.3'],
        teaches: 'drawing scaled bar graphs and answering one- and two-step "how many more / less" questions from them',
        problemTypes: ['draw the bars with scale 2', 'scale 5 with halfway bars', 'how many more? (two steps)', 'which scale fits the data?'],
        templates: ['legacy'], newTemplates: ['graph-axes'], answer: 'draw the bars; write the answer',
        ladder: 'O2 scale 2 → 5 → 10 · O3 axis numbered every square → every 2 → none · O6 vertical / horizontal',
        misconceptions: ['counts squares as 1 each', 'bars start above 0'], wrmSteps: ['Y3.B12.S3', 'Y3.B12.S4'], after: ['pictogram_scale'],
    }),
    make_line_plot: P({
        kind: 'new', skill: 'graphs:make_a_line_plot', name: 'Make a Line Plot', grade: '2-6', family: 'data',
        standards: ['2.MD.D.9', '3.MD.B.4', '4.MD.B.4', '5.MD.B.2'], ee: ['M.EE.2.MD.9', 'M.EE.3.MD.4', 'M.EE.4.MD.4', 'M.EE.5.MD.2'],
        teaches: 'measuring objects (ruler pictures) or reading a data list, then making a line plot (dot plot) on a scale of whole numbers, halves, quarters or eighths, and solving problems from it',
        problemTypes: ['measure the objects, then plot', 'plot a list of measurements', 'difference between longest and shortest', 'total or share equally (Grade 5 redistribute)', 'how many measured more than …?'],
        templates: ['legacy'], newTemplates: ['graph-axes', 'measure-scale'], answer: 'draw the × marks; write the answers',
        ladder: 'O2 whole units → halves/quarters → eighths; plot → compute · O3 scale drawn with every tick labelled → ends only · O6 × / dots',
        misconceptions: ['puts marks side by side instead of stacking', 'fraction ticks spaced unevenly', 'counts marks as the measurement'], wrmSteps: ['Y3.B12.S5'], after: [],
    }),
    describe_distribution: P({
        kind: 'new', skill: 'data_analysis:describe_distribution', name: 'Describe the Data', grade: '6', family: 'data',
        standards: ['6.SP.A.2', '6.SP.A.3', '6.SP.B.5b', '6.SP.B.5c', '6.SP.B.5d'], ee: ['M.EE.6.SP.2', 'M.EE.6.SP.5'],
        teaches: 'describing a distribution by centre, spread and shape; measures of centre vs variation; the attribute and its units; outliers, and choosing mean or median',
        problemTypes: ['what was measured and in what unit?', 'centre, spread or shape? sort the statements', 'is it symmetric or does it have a tail? any gap or outlier?', 'mean or median describes it better? why', 'is this a measure of centre or variation?'],
        templates: ['legacy'], newTemplates: ['graph-axes'], answer: 'tick statements from a bank; write one measure',
        ladder: 'O2 dot plots → histograms → box plots · O3 vocabulary key (centre, spread, shape) → none · O6 plot kind',
        misconceptions: ['the mode is always the centre', 'an outlier changes the median a lot', 'range is a measure of centre'], wrmSteps: [], after: ['make_line_plot'],
    }),
    make_histogram_box: P({
        kind: 'new', skill: 'data_analysis:make_histogram_box_plot', name: 'Make a Histogram or Box Plot', grade: '6', family: 'data',
        standards: ['6.SP.B.4'], ee: ['M.EE.6.SP.4'],
        teaches: 'displaying numerical data in histograms (equal intervals) and box plots (five-number summary)',
        problemTypes: ['tally into intervals, then draw the histogram', 'find the five-number summary', 'draw the box plot', 'which display matches the data?'],
        templates: ['legacy'], newTemplates: ['graph-axes', 'data-table'], answer: 'draw the display; write the summary',
        ladder: 'O2 10 values → 20 · O3 intervals given, summary started → none · O6 histogram / box plot',
        misconceptions: ['unequal intervals', 'the box shows the mean'], wrmSteps: [], after: ['make_line_plot'],
    }),

    // ------------------------------------------------------------------ time and money / EE
    routine_hour: P({
        kind: 'option', skill: 'measurement:time_sense', option: 'task "which hour?": choose the digital hour that matches a routine activity',
        name: 'The Hour for the Routine (option)', grade: '2', family: 'measurement', standards: ['2.MD.C.7'], ee: ['M.EE.2.MD.7'],
        teaches: 'matching a routine activity to its hour on a digital clock (lunch at 12:00, school at 8:00)',
        problemTypes: ['which clock shows lunch time?', 'what time do you wake up? (choose)', 'order the routine by clock', 'a.m. or p.m. (today\'s skill)'],
        templates: ['clock'], newTemplates: [], answer: 'circle the digital clock',
        ladder: 'O2 two choices → three · O3 activity picture → words only · O6 digital / analogue',
        misconceptions: ['picks the earliest time every time', 'confuses 12:00 noon and midnight'], wrmSteps: [], after: [],
    }),
};

/* ================================================================ added from the visual catalogue */
// The White Rose VISUAL catalogue (design/wrm-visuals/INDEX.md, js/modules/visual-catalogue.js) names
// 210 representations; every PARTIAL and GAP one is closed by an entry of the list. Where a WRM or
// standards proposal above already draws it, the representation is sent to that entry (VISUALS in
// visual-catalogue.js names it) and nothing is added. What no entry builds is below: kit templates,
// support panes, options on a template, the supports wiring, the migration of legacy colour visuals to
// black-and-white kit cells, and the widening of place-value bands.
//
// FROZEN_LANES are already building from the list of 2026-09-25: their existing entries keep their
// order and names, their new entries are APPENDED after them (marked "added from visual catalogue"),
// and no dependency is injected into their existing entries.
export const FROZEN_LANES = ['k2', 'operations'];

const V = (o) => o;
/**
 * id -> { lane, kind: 'wiring'|'template'|'pane'|'option'|'skill'|'migration'|'band', name, build (what
 * to make), hosts (skills that offer it), templates (existing kit templates it extends), newTemplates,
 * files (what the owner lane edits), after, low (a low-priority page) }.
 */
export const VISUAL_BUILDS = {
    // ------------------------------------------------------------------ k2 (appended)
    vis_base10_read: V({ lane: 'k2', kind: 'option', name: 'Read a Base-10 Picture (template option)',
        build: 'template:base10 gains `task: \'read\'` (a to-scale picture to count, the pupil writes the number), the hundred flat and a thousand-cube symbol, `unit: \'flat\'` (flat = 1 for tenths and hundredths), ring marks round groups and crossed-out blocks for take-away',
        hosts: ['composing:base10_build', 'composing:base10_build_hundreds', 'composing:tens_foundation_visual'], templates: ['base10'], newTemplates: [],
        files: ['js/modules/sheet/cells/base10.js'], after: [] }),
    vis_object_kinds: V({ lane: 'k2', kind: 'option', name: 'New Picture Kinds: Cubes, Bundles, Number Shapes, Rods, Dominoes',
        build: 'pane:objects / k2kit gain line-drawn kinds: linking cubes (towers, `layout: \'staircase\'`), bundles and packs printed 10 / 100 / 1,000, number shapes (plates with holes in two columns), number rods, a domino (one tile, two halves), and algebra cubes (a lettered cube + unit squares); every kind in B&W with the single grey',
        hosts: ['counting:count_objects', 'comparing:compare_groups', 'composing:tens_foundation_visual', 'counting:number_seq_fill'], templates: ['counters'], newTemplates: [],
        files: ['js/modules/sheet/cells/k2kit.js', 'js/modules/sheet/cells/panes/k2.js'], after: [] }),
    vis_tenframe_options: V({ lane: 'k2', kind: 'option', name: 'Ten-Frame Options (units, frames, fills, five frame)',
        build: 'tenframe gains `unit: 1 | 10 | 100 | 1000 | 0.1` (place-value counters in the frame), `frames: 2 | 3`, `orientation: \'vertical\'`, `fill: \'five\' | \'pairs\' | \'rows\' | \'any\'`, `mode: \'double\'` (top row mirrored), `frame: \'five\'` (the 1 × 5 frame) and a third, hatched set; ten_frame_build_teen moves off the legacy path',
        hosts: ['composing:ten_frame_build', 'composing:ten_frame_build_teen', 'composing:make_ten', 'addition:add_5_pictures'], templates: ['tenframe'], newTemplates: [],
        files: ['js/modules/sheet/cells/tenframe.js', 'js/modules/sheet/cells/panes/k2.js'], after: [] }),
    vis_bond_options: V({ lane: 'k2', kind: 'option', name: 'Part-Whole Options (parts, values, pictures, open, chains)',
        build: 'template:bond gains `parts: 2..5`, `orientation: \'up\'`, `values: \'decimal\' | \'fraction\' | \'text\'`, `draw: \'objects\' | \'cubes\' | \'base10\' | \'disks\' | \'coins\' | \'regions\'` (the two-region mat), `task: \'open\' | \'bond-list\'` (all blank, many answers, the key shows one; a list of bonds in order) and `link` / `levels` (chained bonds, the F / D / P tree, the mixed-number partition flow). The fact-family look `facts: \'add4\' | \'eight\'` is asked of the operations lane (family.js)',
        hosts: ['composing:number_bonds', 'composing:part_whole_model', 'composing:bonds_in_order'], templates: ['bond'], newTemplates: [],
        files: ['js/modules/sheet/cells/bond.js'], after: [] }),
    vis_count_row_values: V({ lane: 'k2', kind: 'option', name: 'Number Tracks With Fractions, Decimals, Words and Pictures',
        build: 'count-row / seqstrip tiles take fractions, decimals, words (Roman numerals) and pictures (a washing line of cards, growing counter columns for pattern terms, a fraction shape shaded one more part each tile), and a track may start below zero',
        hosts: ['counting:number_seq_fill', 'patterns:count_by_fill'], templates: ['count-row', 'seqstrip'], newTemplates: [],
        files: ['js/modules/sheet/cells/count-row.js', 'js/modules/sheet/cells/seqstrip.js'], after: [] }),
    vis_chart_shade: V({ lane: 'k2', kind: 'option', name: 'Shade the Hundred Square (whole-chart tasks)',
        build: 'chartwindow gains the whole chart with `task: \'shade\' | \'circle\' | \'sieve\'` (multiples, a second set ringed, the sieve of primes) and the cross-shaped window; patterns:skip_count_grid (algebra lane generator) moves onto it from the legacy path',
        hosts: ['composing:hundreds_chart_fill', 'patterns:skip_count_grid'], templates: ['chartwindow'], newTemplates: [],
        files: ['js/modules/sheet/cells/chartwindow.js'], after: [] }),
    vis_k2_picture_tasks: V({ lane: 'k2', kind: 'option', name: 'Picture Task Kinds (one more, order, which, match, pairs)',
        build: 'counters / compare task kinds: `plusone` (a row + one empty place to draw), `order` (order pictured groups or dominoes), `which` (tick every picture that shows n), `match` (draw one-to-one lines between two rows or cards), `ask: \'difference\'` (how many more) to 20, `layout: \'pairs\'` (odd / even, one left over), and pictures either side of a compare circle',
        hosts: ['counting:count_objects', 'comparing:compare_groups', 'counting:count_out'], templates: ['counters', 'compare'], newTemplates: [],
        files: ['js/modules/sheet/cells/counters.js', 'js/modules/sheet/cells/compare.js'], after: [] }),
    vis_sort_diagrams: V({ lane: 'k2', kind: 'option', name: 'Sort Tables, Venn and Carroll Diagrams',
        build: 'sort-rings gains the sort table (2–5 labelled columns), the Venn diagram (2 sets; a universal rectangle; blank labels; nested) and the Carroll diagram (2 × 2), each taking number, shape or picture tiles written in by letter',
        hosts: ['comparing:sort_into_groups', 'number_theory:multiples'], templates: [], newTemplates: ['sort-rings'],
        files: ['js/modules/sheet/cells/sort-rings.js'], after: ['sort_groups'] }),
    vis_bead_panes: V({ lane: 'k2', kind: 'pane', name: 'Bead String and Hundred-Bead Rekenrek',
        build: 'a new pane:beadstring (10, 20 or 100 beads in runs of five or ten alternating solid / hollow; `unit` 1, 0.1 or 1 %) and `rows: 1..10` on pane:rekenrek (100 beads); both answer-free supports',
        hosts: ['composing:number_bonds', 'addition:add_facts', 'composing:bonds_to_20'], templates: [], newTemplates: ['beadstring'],
        files: ['js/modules/sheet/cells/panes/beadstring.js', 'js/modules/sheet/cells/panes/k2.js'], after: [] }),
    vis_cover_mark: V({ lane: 'k2', kind: 'pane', name: 'Hidden Part (cover mark)',
        build: 'a cover mark: an outline box with "?" laid over k items of a pane (counters, beads, a bond part, digits, part of a chart); the hidden amount is the answer; `hide: k` on the hosts',
        hosts: ['counting:count_objects', 'composing:number_bonds', 'composing:hundreds_chart_fill'], templates: ['counters', 'bond'], newTemplates: ['cover'],
        files: ['js/modules/sheet/cells/panes/cover.js'], after: [] }),
    vis_story_strip: V({ lane: 'k2', kind: 'option', name: 'First – Then – Now Story Strip',
        build: 'picture-row gains the three-panel story strip (outline panels captioned First / Then / Now, pictures or ten frames, a sentence frame under) with `unknown: \'start\' | \'change\' | \'result\'`',
        hosts: ['addition:add_wp_10', 'addition:add_5_pictures', 'subtraction:sub_5_pictures'], templates: ['wordpic'], newTemplates: ['picture-row'],
        files: ['js/modules/sheet/cells/picture-row.js'], after: ['sort_groups'] }),
    vis_k2_hands_on: V({ lane: 'k2', kind: 'template', name: 'Hands-On Card and Game Pages (low)', low: true,
        build: 'printable hands-on pages that are not cells: memory / snap card sheets, a spinner or dice track game, a bingo grid of numerals; no answer key beyond the card list',
        hosts: ['counting:count_objects'], templates: [], newTemplates: [],
        files: ['js/modules/sheet/roles (a hands-on page kind; agree the role file with the integrator)'], after: [] }),

    // ------------------------------------------------------------------ operations (appended)
    vis_bar_family: V({ lane: 'operations', kind: 'template', name: 'The Bar-Model Family (every WRM bar)',
        build: 'the bar-model template in full: part-whole (numbers, fractions, letters, degrees), comparison (difference arrow; sum-and-difference brace; two unknowns), equal parts with `fill: \'counters\' | \'disks\' | \'numbers\'` and `task: \'part\' | \'whole\'`, scaling (1 box vs n boxes) and ratio rows (a : b, a : b : c), nested / halving stacks with link arrows, unit-conversion bars (1 m cells over 100 cm), the percentage bar ("100 %" over 2–20 cells; two levels) and the journey line; offered as `model: \'bar\'` on the operations hosts, and used by the fractions, algebra and measurement entries that name bar-model',
        hosts: ['division:share_into_groups', 'division:div_equation_parts', 'multiplication:mult_comparison', 'algebra:tape_diagram'], templates: ['word-work'], newTemplates: ['bar-model'],
        files: ['js/modules/sheet/cells/bar-model.js', 'js/modules/sheet/cells/panes/models.js (pane:bar)'], after: [] }),
    vis_split_op: V({ lane: 'operations', kind: 'template', name: 'Split and Operate (template)',
        build: 'a new split-op template: a part-whole split with an operation arrow (× n or ÷ n) under each part and the recombined answer, for partitioning in multiplication and division',
        hosts: ['multiplication:partition_multiply', 'division:div_equation_parts'], templates: ['bond'], newTemplates: ['split-op'],
        files: ['js/modules/sheet/cells/split-op.js'], after: [] }),
    vis_area_model_rows: V({ lane: 'operations', kind: 'option', name: 'Area Model: 2 × 2 and 2 × 3 Grids',
        build: 'area-model gains `rows` (2 × 2, 2 × 3 grids), `fill: \'base10\' | \'disks\'` inside the cells and the +1 row / column adjust strip; area_model_mult_hard leaves the legacy path',
        hosts: ['multiplication:area_model_mult_hard', 'multiplication:area_model_mult'], templates: ['area-model'], newTemplates: [],
        files: ['js/modules/sheet/cells/area-model.js'], after: [] }),
    vis_hop_line_options: V({ lane: 'operations', kind: 'option', name: 'Hop Lines: Through Zero, Chunks, Fact Labels',
        build: 'hop-line gains a negative start and `bridge: 0`, unequal "chunk" arcs, and `labels: \'facts\'` ("n × 2" above each tick, values below)',
        hosts: ['multiplication:nl_mult', 'division:nl_div', 'integers:number_line_int'], templates: ['hop-line'], newTemplates: [],
        files: ['js/modules/sheet/cells/hop-line.js'], after: [] }),
    vis_open_line: V({ lane: 'operations', kind: 'option', name: 'Open Number Line (template option)',
        build: 'number-line gains `line: \'open\'` (no ticks, labelled hops) with `hops: \'bridge\' | \'compensate\' | \'count-on\'` and decimal, fraction and integer values, beyond 0–20',
        hosts: ['addition:nl_add', 'subtraction:nl_sub', 'measurement:money_change'], templates: ['number-line'], newTemplates: [],
        files: ['js/modules/sheet/cells/number-line.js'], after: [] }),
    vis_split_mark: V({ lane: 'operations', kind: 'pane', name: 'Bridging Split Mark (pane)',
        build: 'a new pane:split: the second number split under the calculation to make the next ten, hundred or whole (6 → 2 + 4; 0.67 → 0.55 + 0.12), a support value on the add / subtract hosts',
        hosts: ['addition:add_10k_mixed', 'decimals:add_decimal'], templates: [], newTemplates: ['split'],
        files: ['js/modules/sheet/cells/panes/split.js'], after: [] }),
    vis_stack_layouts: V({ lane: 'operations', kind: 'option', name: 'Column Layouts: Decimal Point Track and Expanded Column',
        build: 'stack gains the decimal-point track `dp: 1..3` (lifted from money-columns) so decimal add / subtract leave the legacy decimal-column-add print, and `form: \'expanded\'` (the partial-product column with annotations)',
        hosts: ['decimals:add_decimal', 'decimals:sub_decimal', 'multiplication:multiply'], templates: ['stack', 'money-columns'], newTemplates: [],
        files: ['js/modules/sheet/cells/stack.js'], after: [] }),
    vis_division_layouts: V({ lane: 'operations', kind: 'option', name: 'Division Layouts: Bus Stop, Notes, Missing Digits',
        build: 'the division template gains `layout: \'short\'` (bus stop with small exchange-digit slots, an r slot, a decimal point and trailing zeros), `support: \'multiples\'` (a multiples list beside), step notes, and `unknown` digits; box_division_* leave the legacy path',
        hosts: ['division:long_div_2digit', 'division:box_division_easy', 'division:box_division_hard'], templates: ['division', 'long-division'], newTemplates: [],
        files: ['js/modules/sheet/cells/division.js', 'js/modules/sheet/cells/long-division.js'], after: [] }),
    vis_array_options: V({ lane: 'operations', kind: 'option', name: 'Array Options (split, hidden, place-value counters, three factors)',
        build: 'arrays gain a split line, a hidden part, finish-the-array, `counter: \'one\' | \'ten\' | \'hundred\'`, `model: \'array-groups\'` (an array of arrays for three factors) and expression matching; mult-grid takes non-consecutive heads',
        hosts: ['multiplication:dot_array_mult', 'multiplication:mult_chart', 'multiplication:multiply_three_numbers'], templates: ['arrays', 'mult-grid'], newTemplates: [],
        files: ['js/modules/sheet/cells/arrays.js', 'js/modules/sheet/cells/mult-grid.js'], after: [] }),
    vis_cloze_boxes: V({ lane: 'operations', kind: 'option', name: 'Cloze Banks: Word Banks and Digit-Card Boxes',
        build: 'cloze-bank gains word banks (`response: \'word\'`: fewer / more / same, less than / greater than) and digit-card box templates (□□□ × □□, □.□□, □ < □) where the pupil places given cards',
        hosts: ['addition:cloze_addition', 'comparing:compare_groups'], templates: ['cloze-bank'], newTemplates: [],
        files: ['js/modules/sheet/cells/cloze-bank.js'], after: [] }),
    vis_word_pictures: V({ lane: 'operations', kind: 'option', name: 'Pictures on Word Problems',
        build: '`pictures` option on word-work: grouped-object pictures (bags, packs, jars, egg boxes) and price-tagged items drawn beside the problem, answer-free',
        hosts: ['addition:add_wp_100', 'multiplication:mult_word_problems'], templates: ['word-work'], newTemplates: [],
        files: ['js/modules/sheet/cells/word-work.js (unowned today; this entry takes it)'], after: [] }),

    // ------------------------------------------------------------------ place value
    vis_pv_bands_millions: V({ lane: 'placevalue', kind: 'band', name: 'Widen Place Value to 7 Digits (millions)',
        build: 'bands 99,999 / 999,999 / 9,999,999 on place_value_disks, pv_disks_build, compare, expand, value and number_word_names; period heads (Millions | Thousands | Ones, H T O under each, commas in threes); million bands on rounding_visual / round_nl_*; the odometer digit display. pv_digit_drag\'s band is `big_numbers`',
        hosts: ['placevalue:place_value_disks', 'placevalue:pv_disks_build', 'placevalue:compare', 'placevalue:expand', 'placevalue:number_word_names', 'number_sense:rounding_visual'], templates: ['pv'], newTemplates: [],
        files: ['js/modules/gen-pv.js', 'js/modules/sheet/cells/pv.js'], after: ['big_numbers'] }),
    vis_pv_exchange: V({ lane: 'placevalue', kind: 'pane', name: 'Place-Value Chart Beside the Method (exchanges)',
        build: 'a new pane:pv-exchange drawn beside a written method: counters in a chart with the exchange ring and arrow for +, crossing out for −, n repeated rows for ×, sharing rows or grouping rings for ÷, with decimal places; a support value on the column skills',
        hosts: ['addition:add_10k_mixed', 'multiplication:multiply', 'division:long_div_2digit', 'decimals:add_decimal'], templates: [], newTemplates: ['pv-exchange'],
        files: ['js/modules/sheet/cells/panes/pv-exchange.js'], after: [] }),
    vis_gattegno: V({ lane: 'placevalue', kind: 'template', name: 'Gattegno Chart',
        build: 'a new gattegno template: rows 1–9 × powers of ten (including decimal rows), `task: \'read\' | \'ring\' | \'shift\'` (× 10 = one row up), offered as a support on place_value_10x and more_less_*',
        hosts: ['placevalue:place_value_10x', 'placevalue:more_less_100'], templates: [], newTemplates: ['gattegno'],
        files: ['js/modules/sheet/cells/gattegno.js'], after: [] }),
    vis_round_line_decimals: V({ lane: 'placevalue', kind: 'option', name: 'Rounding Lines for Decimals',
        build: 'round-line / round-chart / round-pv take decimals (to 1 and 2 dp) and `hops: \'bounds\'` (hops to each bound, bounds circled) and `task: \'ends\'`',
        hosts: ['number_sense:rounding_visual', 'number_sense:round_nl_thousands', 'decimals:round_decimals'], templates: ['pv'], newTemplates: [],
        files: ['js/modules/sheet/cells/panes/extras.js', 'js/modules/sheet/cells/pv.js'], after: [] }),
    vis_more_less_table: V({ lane: 'placevalue', kind: 'option', name: '"−n | Number | +n" Table',
        build: '`layout: \'table\' | \'strip\'` on more_less_10 / 100: a row of three boxes (n less, the number, n more)',
        hosts: ['placevalue:more_less_10', 'placevalue:more_less_100'], templates: ['pv'], newTemplates: [],
        files: ['js/modules/gen-pv.js'], after: [] }),
    vis_value_line_vertical: V({ lane: 'placevalue', kind: 'option', name: 'Vertical Number Line Through Zero',
        build: 'value-line gains `orientation: \'vertical\'` (a lift panel, a sea-level scale) and a thermometer look (`line: \'thermometer\'`) through zero',
        hosts: ['integers:number_line_int', 'integers:integer_nl_drag'], templates: ['value-line'], newTemplates: [],
        files: ['js/modules/sheet/cells/value-line.js'], after: [] }),

    // ------------------------------------------------------------------ algebra
    vis_symbol_puzzle: V({ lane: 'algebra', kind: 'skill', name: 'Symbol Puzzles (new skill algebra:symbol_puzzle)',
        build: 'a new skill: shapes as unknowns (○ + △ = 4; ★ + ★ = ▲ chains; ● + ▲ = 38 with ● = ▲ + 6), solved one symbol at a time; tag it in SKILL_STANDARDS and SKILL_WRM',
        hosts: [], templates: ['equation'], newTemplates: [],
        files: ['js/modules/gen-algebraic.js'], after: [] }),
    vis_puzzle_grids: V({ lane: 'algebra', kind: 'template', name: 'Total Grids and Number Pyramids',
        build: 'two templates: total-grid (3 × 3 numbers or symbols with row and column totals; the sum-to-1 grid) and pyramid (3–5 rows, each brick the sum of the two below, blanks anywhere, whole numbers or decimals)',
        hosts: ['algebra:solve_unknown'], templates: [], newTemplates: ['total-grid', 'pyramid'],
        files: ['js/modules/sheet/cells/total-grid.js', 'js/modules/sheet/cells/pyramid.js'], after: [] }),
    vis_strategy_pictures: V({ lane: 'algebra', kind: 'option', name: 'Strategy Pictures: Doubles and Constant Difference',
        build: '`support: \'pictures\'` on doubles and halves (before → after picture pairs, dice / fingers pairs, double or not a double) and `model: \'shift\'` on compensation (two short lines with matching hops; the constant difference)',
        hosts: ['patterns:double', 'patterns:halve', 'number_sense:doubles_near_doubles', 'number_sense:compensation'], templates: ['number-line'], newTemplates: [],
        files: ['js/modules/gen-algebraic.js'], after: [] }),
    vis_reasoning_frames: V({ lane: 'algebra', kind: 'template', name: 'Reasoning Frames (low)', low: true,
        build: 'page frames over existing panes, for lesson, reasoning and error-analysis pages: one number four ways, the representation triangle, two worked methods side by side (which is correct / more efficient), the priority-pyramid anchor chart, and a maze of operations',
        hosts: ['number_sense:why_it_works'], templates: [], newTemplates: [],
        files: ['js/modules/sheet/roles (frames; agree the role file with the integrator)'], after: [] }),

    // ------------------------------------------------------------------ fractions
    vis_frac_bar_modes: V({ lane: 'fractions', kind: 'option', name: 'Fraction Bar Modes (stack, wholes, split, cross, braces)',
        build: 'frac-model `bar` gains `stack` (equal-length stacked bars, the wall), `wholes` (mixed numbers, bars past one), `split` (a dashed re-split), `cross: k` (hatched or X over parts), `brackets` / braces, `copies`, `labels: \'unit\' | \'decimal\'` (tenths labelled) and `whole: \'100%\'`',
        hosts: ['fractions:compare', 'fractions:equiv_frac_visual', 'fractions:mixed_improper_visual'], templates: ['frac-model'], newTemplates: [],
        files: ['js/modules/sheet/cells/frac-model.js'], after: [] }),
    vis_frac_line_modes: V({ lane: 'fractions', kind: 'option', name: 'Fraction Line Modes (past 1, hops, blocks, two lines)',
        build: 'frac-model `line` gains `max` past 1 (0–3, 0–4), `hops`, `blocks` (fraction blocks sitting on the line), `segments`, `stack: 2` with links, circles above the ticks, and `labels: {above, below}` by form (fraction, decimal, percent)',
        hosts: ['fractions:fraction_nl_drag', 'fractions:mixed_nl_drag', 'fractions:equiv_frac_nv'], templates: ['frac-model'], newTemplates: [],
        files: ['js/modules/sheet/cells/frac-model.js'], after: [] }),
    vis_frac_area_modes: V({ lane: 'fractions', kind: 'option', name: 'Fraction Area Modes (two-way split, several wholes, regions)',
        build: 'frac-model `area` / `circle` gain `split: [a, b]` (two-way), several wholes, `task: \'cut\' | \'complete-half\' | \'whole-from-part\'`, `ring: k` grouping, named regions, and `model: \'area2\'` (fraction × fraction: split one way then the other, overlap shaded)',
        hosts: ['fractions:identify', 'fractions:shade_fraction', 'fraction_operations:mult_frac_frac'], templates: ['frac-model'], newTemplates: [],
        files: ['js/modules/sheet/cells/frac-model.js'], after: [] }),
    vis_migrate_fraction_ops: V({ lane: 'fractions', kind: 'migration', name: 'Migrate Legacy Fraction Visuals to B&W Kit Cells',
        build: 'every fraction skill still drawing a legacy colour strip or circle moves onto frac-model / arrays: fraction_of_set (ringed groups on template:arrays), mixed_improper_visual, improper_mixed (fraction counters ringed into wholes), fraction_bar_ops, mult_frac_frac, equiv_frac_nv, composing:fraction_number_line, frac_10_100, percent_visual and double_num_line; then delete their legacy branches',
        hosts: ['fractions:fraction_of_set', 'fractions:mixed_improper_visual', 'fractions:improper_mixed', 'fractions:fraction_bar_ops', 'fraction_operations:mult_frac_frac', 'fractions:equiv_frac_nv', 'composing:fraction_number_line', 'fraction_operations:frac_10_100'],
        templates: ['frac-model', 'arrays'], newTemplates: [],
        files: ['js/modules/gen-fractions.js', 'js/modules/svg-fractions.js'], after: ['vis_frac_bar_modes', 'vis_frac_line_modes', 'vis_frac_area_modes'] }),
    vis_hundred_square: V({ lane: 'fractions', kind: 'template', name: 'Hundred Square as One Whole (and the thousand square)',
        build: 'a new hundred-square template: a 10 × 10 square as one whole (columns = tenths, cells = hundredths), shade or read, `labels: \'decimal\' | \'fraction\' | \'percent\'`, two squares for more than 1, `grid: 1000`, and the two-tone complement mode the operations entry bonds_100 uses',
        hosts: ['conversions:percent_visual', 'fraction_operations:frac_10_100', 'decimals:decimal_place_value'], templates: [], newTemplates: ['hundred-square'],
        files: ['js/modules/sheet/cells/hundred-square.js'], after: [] }),
    vis_operator_arcs: V({ lane: 'fractions', kind: 'pane', name: 'Operator Arcs (pane)',
        build: 'a new pane:operator-arcs: an arc with an operator box above and below a pair (× n / ÷ n on numerator and denominator, + / − between numbers, the 2 × 2 proportion arrow box), a support value on the equivalence, percent and double-line skills',
        hosts: ['fractions:equivalent', 'fractions:simplify', 'conversions:f_to_p'], templates: [], newTemplates: ['operator-arcs'],
        files: ['js/modules/sheet/cells/panes/operator-arcs.js'], after: [] }),
    vis_double_scale: V({ lane: 'fractions', kind: 'template', name: 'Double and Triple Number Lines',
        build: 'a new double-scale template: two or three aligned scales (kg | g, m | cm, h | min; fraction | decimal | percent; a ratio) with blanks on either row and operator arcs above / below; conversions:double_num_line leaves the legacy path',
        hosts: ['conversions:double_num_line', 'measurement:unit_conversions', 'conversions:f_to_p'], templates: [], newTemplates: ['double-scale'],
        files: ['js/modules/sheet/cells/double-scale.js'], after: ['vis_operator_arcs'] }),

    // ------------------------------------------------------------------ geometry
    vis_migrate_shapes: V({ lane: 'geometry', kind: 'migration', name: 'Migrate Legacy Shape and Angle Visuals to B&W Kit Cells',
        build: 'the shape, line and angle skills still on legacy colour SVG move onto shape-grid / angle-kit / solid-kit: identify_angles, measure_angles, identify_lines (with parallel arrows, equal-side ticks, right-angle squares), symmetry, place_symmetry_lines, name_2d_shapes, shape_name_match_2d / 3d, count_sides_vertices_2d, shape_corners_count, shape_attributes (hatch marks), name_3d_shapes, count_edges_faces_vertices, net_identify (folds, opposite face, open box), classify_triangles, classify_quads, hotspot_quads, compose_shapes, compose_hexagon, compose_rect_from_squares (outline to fill; split a shape), partition_shapes, shape_positions',
        hosts: ['angles_lines:identify_angles', 'angles_lines:measure_angles', 'angles_lines:identify_lines', 'angles_lines:symmetry', 'shapes_early:name_2d_shapes', 'shapes_early:name_3d_shapes', 'shapes_classify:net_identify', 'shapes_early:compose_shapes', 'shapes_early:shape_positions'],
        templates: [], newTemplates: ['shape-grid', 'angle-kit', 'solid-kit'],
        files: ['js/modules/gen-geometry.js', 'js/modules/svg-geometry.js', 'js/modules/sheet/cells/shapes.js'], after: [] }),
    vis_migrate_area_volume: V({ lane: 'geometry', kind: 'migration', name: 'Migrate Legacy Area and Volume Visuals to B&W Kit Cells',
        build: 'area_unit_squares, area, area_perimeter, composite_shapes, area_polygon_decompose (split two ways; complete and subtract), area_triangle, volume and volume_composite move onto shape-grid (unit squares, half squares) and solid-kit (isometric cube builds with hidden cubes, cuboids in layers, isometric dot paper)',
        hosts: ['area_perimeter:area_unit_squares', 'area_perimeter:area', 'area_perimeter:composite_shapes', 'area_perimeter:area_polygon_decompose', 'area_perimeter:area_triangle', 'area_perimeter:volume', 'area_perimeter:volume_composite'],
        templates: [], newTemplates: ['shape-grid', 'solid-kit'],
        files: ['js/modules/gen-geometry.js', 'js/modules/svg-geometry.js'], after: [] }),
    vis_migrate_coordinates: V({ lane: 'geometry', kind: 'migration', name: 'Migrate Legacy Coordinate Visuals to the B&W Coordinate Grid',
        build: 'coordinate_q1, coordinate_graph, coord_polygon, coordinate_all (and the quadrant diagram), geo_translate and geo_reflect move onto coord-grid (read / plot / join; translate and reflect with the image drawn and the move described; `grid: \'none\'` sketch axes), replacing multiple choice with a written response where the pages write one',
        hosts: ['coordinates:coordinate_q1', 'coordinates:coordinate_graph', 'coordinates:coord_polygon', 'coordinates:coordinate_all', 'coordinates:geo_translate', 'coordinates:geo_reflect'],
        templates: [], newTemplates: ['coord-grid'],
        files: ['js/modules/gen-geometry.js'], after: [] }),

    // ------------------------------------------------------------------ measurement
    vis_migrate_measures: V({ lane: 'measurement', kind: 'migration', name: 'Migrate Legacy Measure Visuals to B&W Kit Cells',
        build: 'reading_ruler (cm with mm, offset start, decimal labels; inches kept as an option), heavier_lighter_visual (a pan balance, not emoji), mass_volume_liquid (dial and jug scales), temperature (createThermometerSVG → measure-scale with `orientation`, `min` / `max` / `every`, colour to a reading, below zero), measure_nonstandard, order_objects_length and compare_objects (one baseline) move onto measure-scale / balance',
        hosts: ['measurement:reading_ruler', 'measurement:heavier_lighter_visual', 'measurement:mass_volume_liquid', 'measurement:temperature', 'shapes_early:measure_nonstandard', 'shapes_early:order_objects_length'],
        templates: [], newTemplates: ['measure-scale', 'balance'],
        files: ['js/modules/gen-measurement.js'], after: [] }),
    vis_conversion_models: V({ lane: 'measurement', kind: 'pane', name: 'Conversion Ladder and Conversion Bars',
        build: 'a new pane:ladder (unit boxes mm → cm → m → km with ÷ arcs above and × arcs below), a structural support on the conversion skills, and `model: \'bars\'` (unit-conversion bars; 60-second cells) on length_metric, unit_conversions and the time conversions',
        hosts: ['measurement:length_metric', 'measurement:unit_conversions'], templates: [], newTemplates: ['ladder', 'bar-model'],
        files: ['js/modules/sheet/cells/panes/ladder.js', 'js/modules/gen-measurement.js'], after: ['vis_bar_family', 'vis_operator_arcs'] }),

    // ------------------------------------------------------------------ time and money
    vis_clock_options: V({ lane: 'timemoney', kind: 'option', name: 'Clock and Time-Line Options',
        build: 'clock gains `numerals: \'roman\'`, `hands: \'hour\'` (hour hand only), the past / to half-shaded hint pane, the 1–12 hour-line hint pane, an answer in words, stopwatch readouts `format: \'mm:ss\' | \'h:mm:ss\'`, the 24-hour readout, a.m. / p.m.; timeline gains `span: \'day\'` (midnight – noon – midnight)',
        hosts: ['measurement:time_hour', 'measurement:time_half_hour', 'measurement:time_analog_digital', 'measurement:elapsed_find_duration'], templates: ['clock', 'timeline'], newTemplates: ['past-to', 'hour-line'],
        files: ['js/modules/sheet/cells/clock.js', 'js/modules/sheet/cells/timeline.js', 'js/modules/sheet/cells/tmkit.js'], after: [] }),
    vis_coin_options: V({ lane: 'timemoney', kind: 'option', name: 'Coin Options: Dot Counters, Count-On Track, Chart, Price Tags',
        build: 'coins gain `face: \'dots\'` (1 / 2 / 5 / 10 dots in a circle, pre-money), `track: \'task\'` (a number track above equal coins to count on in 2s, 5s, 10s), a place-value chart of coins (£1 / 10p / 1p), and price tags on pictured items for the money word problems',
        hosts: ['measurement:coin_value', 'measurement:money_count', 'measurement:money_change'], templates: ['coins', 'money-columns'], newTemplates: [],
        files: ['js/modules/sheet/cells/coins.js', 'js/modules/sheet/cells/tmkit.js'], after: [] }),

    // ------------------------------------------------------------------ data
    vis_migrate_graphs: V({ lane: 'data', kind: 'migration', name: 'Migrate Legacy Graphs to B&W Kit Cells',
        build: 'bar_graph, build_bar_graph, pictograph, build_pictograph, tally_chart and pie_chart (plus the measurement lane\'s pictograph_intro / bar_graph_intro, asked of that lane) move onto graph-axes: B&W bars and fill keys, outline symbols with part symbols, tally sticks, outline pie sectors with letter codes; then delete their legacy colour branches',
        hosts: ['graphs:bar_graph', 'graphs:build_bar_graph', 'graphs:pictograph', 'graphs:build_pictograph', 'graphs:tally_chart', 'graphs:pie_chart'],
        templates: [], newTemplates: ['graph-axes'],
        files: ['js/modules/gen-data-stats.js'], after: [] }),
    vis_mean_levelling: V({ lane: 'data', kind: 'option', name: 'The Mean as Levelling',
        build: '`support: \'level\'` on the mean: objects per person → pooled → equal rows; towers levelled',
        hosts: ['data_analysis:mean'], templates: [], newTemplates: ['graph-axes'],
        files: ['js/modules/gen-data-stats.js'], after: ['vis_migrate_graphs'] }),

    // ------------------------------------------------------------------ number theory
    vis_factor_diagrams: V({ lane: 'numtheory', kind: 'template', name: 'Factor Diagrams: Pair Table, Rainbow, Factor Tree',
        build: 'factor_tchart_* and factor_links_* leave the legacy drag visuals for a B&W factor-pairs template (a systematic two-row table with crossed-out non-factors; the factor rainbow / bug), and a new factor-tree template (prime factors; the halving tree) used by prime_composite and the operations entry div_factors',
        hosts: ['number_theory:factor_tchart_easy', 'number_theory:factor_tchart_hard', 'number_theory:factor_links_easy', 'number_theory:factor_links_hard', 'number_theory:prime_composite'],
        templates: [], newTemplates: ['factor-pairs', 'factor-tree'],
        files: ['js/modules/gen-number-theory.js', 'js/modules/svg-factors.js', 'js/modules/sheet/cells/factor-tree.js'], after: [] }),
};

/** Extra dependencies of existing entries (never in a frozen lane): the option waits for the drawing it rides on. */
export const VISUAL_AFTER = {
    round_whole: ['vis_round_line_decimals'],
    frac_beyond_1: ['vis_frac_bar_modes'], frac_compare_gt1: ['vis_frac_bar_modes'], mult_mixed_int: ['vis_frac_bar_modes'], sub_break_whole: ['vis_frac_bar_modes'],
    frac_nl_equiv: ['vis_frac_line_modes'], frac_count: ['vis_frac_line_modes'],
    dnl_units: ['vis_double_scale'],
    four_quadrants: ['vis_migrate_coordinates'], coord_context: ['vis_migrate_coordinates'],
    protractor_read: ['vis_migrate_shapes'], angles_point: ['vis_migrate_shapes'], shape_faces: ['vis_migrate_shapes'],
    partition_draw: ['vis_migrate_shapes'], rect_rows_columns: ['vis_migrate_shapes'],
    area_tile_multiply: ['vis_migrate_area_volume'], area_triangle_grid: ['vis_migrate_area_volume'], volume_fractional: ['vis_migrate_area_volume'],
    volume_composite_repair: ['vis_migrate_area_volume'],
    ruler_cm: ['vis_migrate_measures'], metres: ['vis_migrate_measures'], ruler_difference: ['vis_migrate_measures'], mass_scales: ['vis_migrate_measures'],
    measure_two_units: ['vis_migrate_measures'], order_length_tasks: ['vis_migrate_measures'],
    bar_graph_scale: ['vis_migrate_graphs'], pictogram_scale: ['vis_migrate_graphs'],
    common_mf: ['vis_sort_diagrams'],
};

/* ================================================================ the unified list */
const stepById = new Map(WRM_STEPS.map((s) => [s.id, s]));
function gradeOfSteps(steps) {
    const gs = steps.map((id) => id.split('.')[0]).map((y) => (y === 'R' ? -1 : Number(y.slice(1)) - 1));
    if (!gs.length) return '';
    const lo = Math.min(...gs), hi = Math.max(...gs);
    const g = (n) => (n < 0 ? 'PK' : n === 0 ? 'K' : String(n));
    return lo === hi ? g(lo) : `${g(lo)}-${g(hi)}`;
}

/**
 * Every proposal on ONE list: [{ id, source: 'wrm'|'standards', kind, skill, also, option, name, grade,
 * family, lane, standards, ee, wrmSteps, wrmImproves, teaches, representation, problemTypes,
 * templates, newTemplates, answer, ladder, misconceptions, extension, after }]. WRM proposals
 * carry their WRM_EXTENSIONS scope and derive grade and codes from their small steps.
 */
export function buildList(visualIndex = null) {
    const out = [];
    for (const [id, p] of Object.entries(WRM_PROPOSALS)) {
        const spec = WRM_SPECS[id] || null;
        const ext = WRM_EXTENSIONS[id] || null;
        const allSteps = [...p.steps, ...(p.improves || [])];
        const ccss = new Set(), ee = new Set();
        for (const s of allSteps) { const r = stepById.get(s); if (r) { r.ccss.forEach((c) => ccss.add(c)); r.ee.forEach((c) => ee.add(c)); } }
        if (ext) { ext.ccss.forEach((c) => ccss.add(c)); ext.ee.forEach((c) => ee.add(c)); }
        const after = [];
        if (p.kind === 'option') {
            const host = Object.entries(WRM_PROPOSALS).find(([, q]) => q.kind === 'new' && q.skill === p.skill);
            if (host) after.push(host[0]);
        }
        out.push({
            id, source: 'wrm', kind: p.kind, skill: p.skill, also: [], option: p.option || '', name: p.name,
            grade: gradeOfSteps(allSteps), family: p.family, lane: laneFor(p.skill),
            standards: [...ccss], ee: [...ee], wrmSteps: [...p.steps], wrmImproves: [...(p.improves || [])],
            teaches: p.teaches, representation: p.representation,
            extension: ext ? ext.adds : '', after,
            ...(spec || { problemTypes: [], templates: [], newTemplates: [], answer: '', ladder: '', misconceptions: [] }),
            specMissing: !spec,
        });
    }
    for (const [id, p] of Object.entries(STANDARD_PROPOSALS)) {
        out.push({
            id, source: 'standards', kind: p.kind, skill: p.skill, also: p.also || [], option: p.option || '', name: p.name,
            grade: p.grade, family: p.family, lane: laneFor(p.skill),
            standards: [...p.standards], ee: [...p.ee], wrmSteps: [], wrmImproves: [...(p.wrmSteps || [])],
            teaches: p.teaches, representation: `${p.templates.join(', ') || '-'}${p.newTemplates.length ? ` + new: ${p.newTemplates.join(', ')}` : ''}`,
            extension: '', after: [...(p.after || [])],
            problemTypes: p.problemTypes, templates: p.templates, newTemplates: p.newTemplates, answer: p.answer, ladder: p.ladder,
            misconceptions: p.misconceptions, specMissing: false,
        });
    }
    // The visual catalogue: the representations each entry draws (`visuals`, `visualSteps` = the WRM
    // steps whose pages use them, the entry's REACH), dependencies on the drawing an option rides on,
    // and the entries only the catalogue adds (source 'visual').
    const vis = visualIndex || new Map();
    const reach = (id) => vis.get(id) || { visuals: [], steps: [] };
    for (const e of out) {
        e.visuals = [...reach(e.id).visuals];
        e.visualSteps = [...reach(e.id).steps];
        if (VISUAL_AFTER[e.id] && !FROZEN_LANES.includes(e.lane)) e.after.push(...VISUAL_AFTER[e.id]);
    }
    for (const [id, b] of Object.entries(VISUAL_BUILDS)) {
        const r = reach(id);
        out.push({
            id, source: 'visual', kind: b.kind, skill: b.hosts[0] || '', also: b.hosts.slice(1), option: '', name: b.name,
            grade: gradeOfSteps(r.steps), family: b.lane, lane: b.lane, standards: [], ee: [], wrmSteps: [], wrmImproves: [],
            teaches: b.build, representation: b.build, extension: '', after: [...b.after],
            problemTypes: [], templates: [...b.templates], newTemplates: [...b.newTemplates], answer: '', ladder: '', misconceptions: [],
            specMissing: false, files: [...b.files], low: !!b.low, visuals: [...r.visuals], visualSteps: [...r.steps],
        });
    }
    return out;
}

/**
 * Build order inside each lane: dependencies first (`after`, and an option after the proposal that
 * creates its host skill), then the highest impact first (standards closed × 2 + WRM steps closed,
 * with the audit's `closes` count added by the caller when it has one).
 */
export function orderLane(entries, impact = (e) => e.standards.length * 2 + e.wrmSteps.length) {
    const byId = new Map(entries.map((e) => [e.id, e]));
    const done = new Set();
    const out = [];
    const ready = () => entries.filter((e) => !done.has(e.id) && e.after.every((d) => done.has(d) || !byId.has(d)));
    while (out.length < entries.length) {
        let r = ready();
        if (!r.length) r = entries.filter((e) => !done.has(e.id));   // a cycle: fall back to impact
        r.sort((a, b) => impact(b) - impact(a) || a.id.localeCompare(b.id));
        out.push(r[0]);
        done.add(r[0].id);
    }
    return out;
}
