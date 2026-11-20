// HINT-NO-BLANK (lf-placevalue, 2026-11-20): the help a pupil sees on screen never shows an unfilled blank.
//
// First found on ONE skill (owner bug 2026-11-15, placevalue:digit_value_unit_form: "Here is how" printed
// "worth ___ ___"; ws-unit-form-bank check 5). This gate holds the rule for EVERY live skill.
//
// "Help" is what the practice card shows a pupil:
//   STEPS  the "Here is how" worked steps        support-ladder.js workedStepsFor(q)
//   SAY    the Say line under them                support-ladder.js sayFor(q)
//   HINT   the hint popup                         q.hint (hints-speech.js showHint)
//   SOL    the "Show Solution" popup steps        solution-display.js generateSolutionSteps(q)
// A blank is "__" or longer, a {placeholder}, a box glyph (□ ☐ ▢), or a "?" standing as a gap where a value
// belongs ("4 + ? = 9", "= ?"); a question mark ending a question ("What is 3 + 4?") is not a gap.
//
// Kept out on purpose (each with its reason; no whole class of input is exempt):
//   - a Say frame MEANT to have gaps for the pupil to fill: the opener's unfilled frame on paper (ws-providers-unit /
//     ws-guided-echo SAY-AGREE) is printed by the page roles, never by these screen paths; on screen the Say line may
//     keep ONE gap, the answer (S8: the ladder never shows the answer), and every given value filled;
//   - SOL's first "Problem:" line, which restates the question as asked (its gap is the question's);
//   - a WORKED gap: a step writes the fact with a gap ("Think addition: 9 + ? = 13.") and a later line of the same
//     help writes that same fact filled ("9 + 4 = 13."); on STEPS the later line may be the answer sentence S8 leaves out,
//     so it is read from the provider's steps as written (workedStepsFor with fullWorked).
// The worked steps never state the answer either (S8, ws-support-ladder); a step leaves the answer sentence OUT.
//
// Sweep: every live skill in SKILLS (tombstones skipped), default options, SEEDS seeds each, dealt through
// generateQuestionFor with a seed derived from "cat:skill" + the item index (the ws-content-audit rule), so
// two runs of one tree print the same lines.
//
//   node tests/scripts/ws-hint-no-blank.cjs [--skill cat:skill[,cat:skill]] [--category cat] [--seeds 4]
//                                           [--report-only] [--verbose]
// Prints `ws-hint-no-blank: OK` or `ws-hint-no-blank: FAIL` (exit 1 on FAIL unless --report-only).
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const SKILL = arg('skill', '');
const CATEGORY = arg('category', '');
const N_SEEDS = Math.max(1, parseInt(arg('seeds', '4'), 10) || 4);
const REPORT_ONLY = has('report-only');
const VERBOSE = has('verbose');
const SHOW_LISTS = has('lists');   // print the HELP-EMPTY and SAYLESS skill lists as JSON (to re-pin when they shrink)

// The blank detector, shared with the page (serialised as source).
const BLANK_SRC = String.raw`(_{2,})|(\{[A-Za-z][\w.]*\})|([□☐▢])|((?:^|[\s(=+\-−×÷*/:,])\?(?=\s*(?:$|[=+\-−×÷*/),.;]|\s(?:[=+\-−×÷]|and|or)\b)))`;

const EMPTY_PIN = ['algebra:build_expr_multdiv', 'angles_lines:identify_angles', 'angles_lines:mixed_angles_lines',
    'area_perimeter:area_distributive_visual', 'area_perimeter:area_polygon_decompose', 'area_perimeter:area_triangle',
    'area_perimeter:area_unit_squares', 'area_perimeter:mixed_area_perimeter', 'conversions:find_whole_from_pct',
    'conversions:mixed_conversions', 'coordinates:net_surface_area', 'fraction_operations:div_unit_frac_nv',
    'fraction_operations:estimate_frac_ops', 'fraction_operations:frac_10_100_nv',
    'fraction_operations:frac_mult_word', 'fraction_operations:frac_mult_word_plain',
    'fraction_operations:frac_word_mixed_plain', 'fraction_operations:mult_frac_whole_nv',
    'fraction_operations:unit_frac_div_whole', 'fraction_operations:whole_div_unit_frac',
    'fractions:compose_target_frac', 'fractions:equiv_frac_nv', 'geo_mixed:geo_meas_all', 'measurement:capacity',
    'shapes_classify:classify_triangles', 'shapes_classify:cross_section_3d', 'shapes_classify:mixed_shapes',
    'shapes_classify:net_identify'];

// (filled from the first run of the option-3 fix, 2026-11-20; owner lanes in design/status/lf-placevalue.md)
const SAYLESS_PIN = ['addition:add_sub_fact_family', 'addition:cloze_addition', 'addition:fact_family_sort',
    'addition:nl_add', 'algebra:function_table_easy', 'algebra:function_table_find_inputs',
    'algebra:function_table_find_rule', 'algebra:function_table_hard', 'algebra:two_step_estimate_check',
    'algebra:two_step_letter_equation', 'comparing:compare_groups', 'composing:base10_build',
    'composing:base10_build_hundreds', 'composing:chart_to_120', 'composing:compose_whole',
    'composing:fraction_number_line', 'composing:hundreds_chart_fill', 'composing:odd_even',
    'composing:ten_frame_build_teen', 'composing:whole_as_fraction', 'decimals:decimal_nl_drag',
    'division:div_remainders', 'fraction_operations:add_frac_unlike', 'fraction_operations:add_fractions_like',
    'fraction_operations:add_mixed_like', 'fraction_operations:add_mixed_unlike',
    'fraction_operations:div_unit_fraction', 'fraction_operations:mult_frac_frac',
    'fraction_operations:mult_frac_whole', 'fraction_operations:sub_frac_unlike',
    'fraction_operations:sub_fractions_like', 'fraction_operations:sub_mixed_like',
    'fraction_operations:sub_mixed_unlike', 'fractions:compare', 'fractions:compare_fractions_nl',
    'fractions:compare_to_half', 'fractions:equiv_frac_visual', 'fractions:fraction_nl_drag', 'fractions:identify',
    'fractions:identify_fraction_nl', 'fractions:mixed_nl_drag', 'fractions:write_fraction',
    'fractions:write_fraction_nl', 'integers:integer_nl_drag', 'measurement:clock_parts', 'measurement:coin_value',
    'measurement:count_notes_and_coins', 'measurement:elapsed_15min', 'measurement:elapsed_30min',
    'measurement:elapsed_find_duration', 'measurement:elapsed_find_start', 'measurement:elapsed_hour',
    'measurement:elapsed_mixed', 'measurement:elapsed_visual_easy', 'measurement:elapsed_visual_hard',
    'measurement:elapsed_visual_medium', 'measurement:enough_money', 'measurement:minutes_by_fives_all',
    'measurement:money', 'measurement:money_change', 'measurement:money_compare', 'measurement:time_fives_ring',
    'measurement:time_sense', 'multiplication:arrays_groups', 'multiplication:count_by_10s',
    'multiplication:count_by_11s', 'multiplication:count_by_12s', 'multiplication:count_by_2s',
    'multiplication:count_by_3s', 'multiplication:count_by_4s', 'multiplication:count_by_5s',
    'multiplication:count_by_6s', 'multiplication:count_by_7s', 'multiplication:count_by_8s',
    'multiplication:count_by_9s', 'multiplication:count_by_tables', 'multiplication:dot_array_mult',
    'multiplication:mult_arrays', 'multiplication:mult_chart', 'multiplication:mult_chart_easy',
    'multiplication:mult_chart_headers', 'multiplication:mult_chart_pattern', 'multiplication:mult_chart_shade',
    'multiplication:mult_comparison', 'multiplication:mult_comparison_plain', 'multiplication:mult_equal_groups',
    'multiplication:mult_properties', 'number_ops_mixed:word_problems_mixed',
    'number_ops_mixed:word_problems_mixed_plain', 'number_sense:between_tens', 'number_sense:estimate_diff',
    'number_sense:estimate_products', 'number_sense:estimate_quotient', 'number_sense:estimate_sum',
    'number_sense:estimate_sums_diffs', 'number_sense:nearest_10', 'number_sense:nearest_100',
    'number_sense:nearest_1000', 'number_sense:nearest_10000', 'number_sense:nearest_100000',
    'number_sense:nearest_million', 'number_sense:reasonable_quotients', 'number_sense:round_nl_hundred_thousands',
    'number_sense:round_nl_ten_thousands', 'number_sense:round_nl_thousands', 'number_sense:round_sort_10',
    'number_sense:round_sort_100', 'number_sense:round_sort_1000', 'number_sense:round_sort_10000',
    'number_sense:round_sort_100000', 'number_sense:round_sort_hundredths', 'number_sense:round_sort_million',
    'number_sense:round_sort_tenths', 'number_sense:rounding_table', 'number_sense:rounding_visual',
    'patterns:follow_given_rule', 'patterns:notice_patterns', 'patterns:number_patterns_rule',
    'patterns:skip_count_grid', 'patterns:skip_count_line', 'placevalue:combine', 'placevalue:expanded_notation',
    'placevalue:identify', 'placevalue:one_tenth_value', 'placevalue:place_value_10x', 'placevalue:place_value_disks',
    'placevalue:pv_digit_drag', 'placevalue:ten_times_story', 'placevalue:ten_times_value',
    'subtraction:sub_5_pictures', 'vocabulary:vocab_grade_pictures'];

function exitAfterFlush(code) {
    // never process.exit straight after a long piped write (LESSONS_LEARNED 0c): the verdict line could be lost
    if (process.stdout.write('')) process.exit(code);
    else process.stdout.once('drain', () => process.exit(code));
}

(async () => {
    let app = null;
    let code = 0;
    try {
        app = await open({ seed: 1, lock: 'ws-hint-no-blank' });
        const res = await app.page.evaluate(async ({ SKILL, CATEGORY, N_SEEDS, BLANK_SRC }) => {
            const sl = await import('/js/modules/support-ladder.js');
            const kit = await import('/js/modules/sheet/index.js');
            const gq = await import('/js/modules/generate-question.js');
            const BLANK = new RegExp(BLANK_SRC);
            const plain = (h) => String(h == null ? '' : h).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
            const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
            // the equation a gap sits in, and is it written filled later? ("6 × __ = 18" ... "6 × 3 = 18")
            const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const TERM = String.raw`[\d.,/()]+`;
            const OP = String.raw`\s*[+\-−×÷=]\s*`;
            function workedGap(t, m, later) {
                const gapAt = m.index + m[0].length - m[0].trimStart().length;
                const gap = m[0].trim();
                const left = (t.slice(0, gapAt).match(new RegExp(`(?:${TERM}${OP})+$`)) || [''])[0];
                const right = (t.slice(gapAt + gap.length).match(new RegExp(`^(?:${OP}${TERM})+`)) || [''])[0].replace(/[.,]+$/, '');
                if (!/=/.test(left + right) || !/\d/.test(left + right)) return false;
                const sp = (x) => esc(x.trim()).replace(/\s+/g, '\\s*');
                const re = new RegExp(`${sp(left)}\\s*\\d[\\d.,/]*\\s*${sp(right)}`);
                return re.test(later);
            }
            const want = SKILL ? new Set(SKILL.split(',').map((s) => s.trim()).filter(Boolean)) : null;
            const list = [];
            for (const [cat, skills] of Object.entries(window.SKILLS)) {
                if (!Array.isArray(skills)) continue;
                if (CATEGORY && cat !== CATEGORY) continue;
                for (const s of skills) {
                    if (!s || !s.v || s.retired) continue;
                    if (want && !want.has(`${cat}:${s.v}`)) continue;
                    list.push({ cat, skill: s.v });
                }
            }
            const offenders = []; const errors = []; const empty = new Set(); const sayless = new Set(); const hiddenFail = []; let items = 0;
            const firstEmpty = new Map();
            for (const { cat, skill } of list) {
                const key = `${cat}:${skill}`;
                for (let i = 0; i < N_SEEDS; i++) {
                    let q;
                    try { q = gq.generateQuestionFor({ category: cat, skill, seed: (hash(key) + i * 7919) >>> 0, itemIndex: i, itemCount: N_SEEDS }); }
                    catch (e) { errors.push(`${key} seed ${i}: generate threw ${e && e.message}`); continue; }
                    if (!q) { errors.push(`${key} seed ${i}: no question`); continue; }
                    items++;
                    const ctx = { cat, skill };
                    const paths = [];
                    try { sl.workedStepsFor(q, ctx).forEach((t, k) => paths.push(['STEPS', `step ${k + 1}`, t])); } catch (e) { errors.push(`${key} seed ${i}: workedStepsFor threw ${e && e.message}`); }
                    // the provider's steps as written, before the answer sentence is left out (S8): where a worked gap is filled
                    let rawSteps = '';
                    try { rawSteps = sl.workedStepsFor(Object.assign({}, q, { fullWorked: true }), ctx).join(' | '); } catch (e) { rawSteps = ''; }
                    // HELP-EMPTY: leaving the answer out must not leave "Here is how" with nothing in it
                    if (rawSteps && !paths.some((x) => x[0] === 'STEPS')) { empty.add(key); if (!firstEmpty.has(key)) firstEmpty.set(key, q); }
                    // SAYLESS: the skill's provider has a Say frame, but the screen shows no Say line for this item
                    try {
                        const pv = kit.getProvider(cat, skill);
                        const frame = pv && typeof pv.strings === 'function' ? String(pv.strings({ q }).say || '') : '';
                        if (frame && !q.sayText && !sl.sayFor(q, ctx)) sayless.add(key);
                    } catch (e) { /* no provider */ }
                    try { const s = sl.sayFor(q, ctx); if (s) paths.push(['SAY', 'say', s]); } catch (e) { errors.push(`${key} seed ${i}: sayFor threw ${e && e.message}`); }
                    if (q.hint) paths.push(['HINT', 'hint', plain(q.hint)]);
                    try {
                        const sol = typeof window.generateSolutionSteps === 'function' ? window.generateSolutionSteps(q) : [];
                        (Array.isArray(sol) ? sol : []).forEach((t, k) => paths.push(['SOL', `sol ${k + 1}`, plain(t)]));
                    } catch (e) { errors.push(`${key} seed ${i}: generateSolutionSteps threw ${e && e.message}`); }
                    for (let p = 0; p < paths.length; p++) {
                        const [kind, where, text] = paths[p];
                        const t = String(text || '');
                        const m = t.match(BLANK);
                        if (!m) continue;
                        // (1) SOL's "Problem:" line (solution-display.js, always its first line) restates the question AS ASKED:
                        //     its gap is the pupil's task, not the help's. Only that first line, and only on the SOL path.
                        if (kind === 'SOL' && where === 'sol 1' && /^Problem:/.test(t)) continue;
                        // (2) the Say line's ONE gap is the answer, the pupil's to say aloud (sayFor's frame, as the opener's
                        //     frame keeps its gaps): allowed once. A second gap is a GIVEN value the line failed to carry.
                        if (kind === 'SAY' && (t.match(new RegExp(BLANK.source, 'g')) || []).length === 1 && /_{2,}/.test(m[0])) continue;
                        // (3) a WORKED gap: the strategy writes the fact with a gap ("Think addition: 9 + ? = 13.") and a LATER
                        //     line of the same help writes that fact filled ("9 + 4 = 13."). Only the equation the gap sits in
                        //     counts, and only a later line of the same path.
                        const later = paths.slice(p + 1).filter((x) => x[0] === kind).map((x) => x[2]).join(' | ') + ' | ' + t.slice(m.index + m[0].length);
                        // (on STEPS the filled fact may be the answer sentence S8 leaves out: it is read from the steps as written)
                        if (workedGap(t, m, kind === 'STEPS' ? `${later} | ${rawSteps.slice(rawSteps.indexOf(t) + 1)}` : later)) continue;
                        offenders.push({ key, seed: i, kind, where, text: t.slice(0, 220), blank: m[0].trim() });
                    }
                }
            }
            // HELP-EMPTY-HIDDEN (lead ruling 2026-11-20): on the practice card, after three wrong answers, an item with no worked
            // step shows NO "Here is how" box (never one holding only a Say line, never an empty one)
            for (const [key, q] of firstEmpty) {
                const [cat, skill] = key.split(':');
                try {
                    const st = window.state;
                    st.category = cat; st.skill = skill; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                    if (window.showView) window.showView('gameView');
                    st.currentQ = q;
                    window.renderQuestion();
                    for (let k = 1; k <= 3; k++) sl.practiceLadderWrong(q, `zz${k}`);
                    const box = document.querySelector('#questionCard .mq-ladder-worked, #visualAid .mq-ladder-worked');
                    if (box) hiddenFail.push(`${key}: no worked step, yet a "Here is how" box is shown ("${(box.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100)}")`);
                } catch (e) { errors.push(`${key}: card render threw ${e && e.message}`); }
            }
            return { skills: list.length, items, offenders, errors, empty: [...empty].sort(), sayless: [...sayless].sort(), hiddenFail, hiddenN: firstEmpty.size };
        }, { SKILL, CATEGORY, N_SEEDS, BLANK_SRC });

        const byKey = new Map();
        for (const o of res.offenders) {
            if (!byKey.has(o.key)) byKey.set(o.key, []);
            byKey.get(o.key).push(o);
        }
        const keys = [...byKey.keys()].sort();
        for (const k of keys) {
            const rows = byKey.get(k);
            const kinds = [...new Set(rows.map((r) => r.kind))].sort().join('+');
            console.log(`  FAIL ${k} [${kinds}] ${rows.length} blank line${rows.length === 1 ? '' : 's'}`);
            const shown = VERBOSE ? rows : rows.filter((r, i, a) => a.findIndex((x) => x.kind === r.kind) === i);
            for (const r of shown) console.log(`       ${r.kind} seed ${r.seed} ${r.where}: "${r.text}" (blank "${r.blank}")`);
        }
        for (const e of res.errors) console.log(`  ERROR ${e}`);
        // HELP-EMPTY pin (2026-11-20): legacy skills with no provider steps whose every step states the answer. The list
        // only shrinks; a skill not on it whose "Here is how" goes empty FAILs.
        const newEmpty = res.empty.filter((k) => !EMPTY_PIN.includes(k));
        res.empty.filter((k) => EMPTY_PIN.includes(k)).forEach((k) => console.log(`  pinned HELP-EMPTY ${k}: every worked step states the answer (no provider steps; owner lane to write them)`));
        newEmpty.forEach((k) => console.log(`  FAIL HELP-EMPTY ${k}: "Here is how" has no step left once the answer is left out`));
        if (newEmpty.length) code = 1;
        // SAYLESS pin (lead ruling 2026-11-20): skills whose provider frame takes values the screen cannot fill (no sayValues,
        // and the question's own numbers do not fit it). Shrink-only: a skill not on it that loses its Say line FAILs.
        const newSayless = res.sayless.filter((k) => !SAYLESS_PIN.includes(k));
        newSayless.forEach((k) => console.log(`  FAIL SAYLESS ${k}: the provider has a Say frame but the screen shows no Say line`));
        if (newSayless.length) code = 1;
        res.hiddenFail.forEach((f) => console.log(`  FAIL HELP-EMPTY-HIDDEN ${f}`));
        if (res.hiddenFail.length) code = 1;
        console.log(`ws-hint-no-blank: HELP-EMPTY ${res.empty.length} skills (pin ${EMPTY_PIN.length}), SAYLESS ${res.sayless.length} (pin ${SAYLESS_PIN.length}), HELP-EMPTY-HIDDEN ${res.hiddenN} cards checked, ${res.hiddenFail.length} showing a box`);
        if (SHOW_LISTS) { console.log('EMPTY ' + JSON.stringify(res.empty)); console.log('SAYLESS ' + JSON.stringify(res.sayless)); }
        const kindCount = {};
        res.offenders.forEach((o) => { kindCount[o.kind] = (kindCount[o.kind] || 0) + 1; });
        console.log(`ws-hint-no-blank: ${res.skills} skills, ${res.items} items, ${keys.length} skills with a blank in their help`
            + (Object.keys(kindCount).length ? ` (${Object.entries(kindCount).sort().map(([k, n]) => `${k} ${n}`).join(', ')} lines)` : ''));
        if (!res.skills) { console.log('  FAIL no skill matched the filter'); code = 1; }
        if (keys.length || res.errors.length) code = 1;
        if (app.problems.length) {
            app.problems.slice(0, 5).forEach((p) => console.log(`  (page ${p.type}: ${String(p.text).slice(0, 160)})`));
        }
    } catch (e) {
        console.log('  ERROR ' + (e && e.stack || e));
        code = 1;
    }
    if (app) await app.close();
    console.log(code ? 'ws-hint-no-blank: FAIL' : 'ws-hint-no-blank: OK');
    exitAfterFlush(code && !REPORT_ONLY ? 1 : 0);
})();
