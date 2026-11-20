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
// Round 2 (critic r1 FAIL, 2026-11-20; every check FAILS on fafc417d1, design/lessons-first/CHECKS_FROM_CRITICS.md):
//   WORKED-GAP   the worked-gap exemption reads only steps the pupil SEES (never the hidden fullWorked steps): F1, F2
//   HINT-LEAK    q.hint states the answer (a value the question gives is no leak): F3
//   SAY-LEAK     the Say line states the answer: F3
//   STEPS-LEAK   a shown step states an element of a list answer, a long word answer, a sort (bin label: its tiles), or
//                prints "Answer:" / "[object": F4, F13, F14
//   UNIT-CUT     withoutAnswer cuts "= 18 square units." / "cubic units" / "square cm" / "cm²" at the answer: F7
//   HELP-EMPTY-HIDDEN also: the status line never says "Here is how" when no box is shown: F8
//   SAY-FILL     every number filled into the Say line is a WHOLE token the question gives (never "1" of "1/4"): F10
//   SAY-GAP-GIVEN the Say line's gap is never a value the question gives ("___ is here." for "Tap 55"): F11
//   BARE-STEP    a shown step is never a bare expression ("10 + 5.") or a repeat of an earlier step: F9
//   HELP-THIN    a provider skill whose shown steps lose at least half its steps ends on a step that says what to do: F5
//   LISTEN       a shown "Here is how" box always has Listen (speech on): F6
//   S8-EXCEPTION the ONE skill whose help states the answer (S8_EXCEPTIONS); a second entry, or q.fullWorked on any other
//                skill, FAILs
// Each has a shrink-only pin of pre-existing skills owned by another lane (PINS below; --lists prints the current sets).
//
// Round 3 (critic r2 FAIL, 2026-11-20; each FAILS on master 9ae9ccd5d, design/lessons-first/CHECKS_FROM_CRITICS.md):
//   STEPS-LEAK / HINT-LEAK (R2-1) an element of a LIST answer that equals a given value is still the pupil's to write: it is
//                stated when a step writes it as an operand ("1 × 80 = 80" fills the box beside 1); "a × b = 80" is not
//   STEPS-LEAK / HINT-LEAK (R2-3) an expression answer is read term by term ("4 × 100", "12x"): a step writing one term
//                writes one box of the answer
//   DANGLING-HEAD (R2-2) a shown step ending in ":" with no continuation row after it ("Factor pairs:")
//   ORPHAN       (R2-6) a shown step names a number that is in neither the question (text, picture, options) nor an earlier
//                shown step, and is not worked from them in the same step ("How many times does 12 go into 36?"); the
//                first step opens with a pronoun ("Is it before ..."); a step "x − x = 0"
//   HELP-GENERIC (R2-7) every item of the skill shows the same help, word for word ("Read each carefully and find what fits.")
//   BARE-STEP    (R2-8) also with a leading So / Then / Now ("So 10 − 7.")
//   --strict-pins a run with --skill is never satisfied by a pin: a pinned finding FAILs (the critic's graded-skill list)
// The HINT path reads support-ladder.js hintFor(q) (the screen hint: a provider screenHelp.hint, else q.hint) when the tree
// has it, else q.hint.
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
const SHOW_LISTS = has('lists');
const STRICT_PINS = has('strict-pins');   // R2-4 / brief (C): a --skill run may not be satisfied by a pin
const ONLY = arg('only', '');   // --only <CHECK>[,<CHECK>]: judge only these checks (BLANK, WORKED-GAP, HINT-LEAK, ..., HELP-EMPTY-HIDDEN)   // print the HELP-EMPTY and SAYLESS skill lists as JSON (to re-pin when they shrink)

// The blank detector, shared with the page (serialised as source).
const BLANK_SRC = String.raw`(_{2,})|(\{[A-Za-z][\w.]*\})|([□☐▢])|((?:^|[\s(=+\-−×÷*/:,])\?(?=\s*(?:$|[=+\-−×÷*/),.;]|\s(?:[=+\-−×÷]|and|or)\b)))`;

// (r2 2026-11-20: 28 -> 25. Eight left (the multi-word unit cut, F7, and the clean hints); five joined that showed the answer
// before - an "Answer: ..." fallback line (F13 class) - and now hide the box: mixed_fraction_ops, order_fractions, mult_missing_digit
// and its pool mixed_multiplication, compose_rect_from_squares)
// (r3 2026-11-20, lead ruling: the help is chosen whole - the skill's steps minus only a final answer sentence, its screenHelp, the
// clean hint - or hidden. 25 -> 132: a skill whose steps state the answer in more than their last sentence and whose hint states it
// too now shows no box; owner lanes in design/status/lf-placevalue.md)
// R2_KEEP (A12 guard witnesses, no screenHelp, r2 steps kept): addition:add_facts, subtraction:sub_facts - judged in the page (R2-KEEP)
const EMPTY_PIN = [ // A12 (lead 2026-11-20): back to the r2 set; skills without screenHelp keep master r2 help
    "algebra:build_expr_multdiv",
    "angles_lines:identify_angles",
    "angles_lines:mixed_angles_lines",
    "conversions:find_whole_from_pct",
    "conversions:mixed_conversions",
    "coordinates:net_surface_area",
    "fraction_operations:div_unit_frac_nv",
    "fraction_operations:estimate_frac_ops",
    "fraction_operations:frac_mult_word",
    "fraction_operations:frac_mult_word_plain",
    "fraction_operations:frac_word_mixed_plain",
    "fraction_operations:mixed_fraction_ops",
    "fraction_operations:mult_frac_whole_nv",
    "fraction_operations:unit_frac_div_whole",
    "fraction_operations:whole_div_unit_frac",
    "fractions:equiv_frac_nv",
    "fractions:order_fractions",
    "measurement:capacity",
    "multiplication:mixed_multiplication",
    "multiplication:mult_missing_digit",
    "shapes_classify:classify_triangles",
    "shapes_classify:cross_section_3d",
    "shapes_classify:mixed_shapes",
    "shapes_classify:net_identify",
    "shapes_early:compose_rect_from_squares"];

// (filled from the first run of the option-3 fix, 2026-11-20; owner lanes in design/status/lf-placevalue.md. r2 2026-11-20: 131 -> 126;
// fractions:shade_fraction joined - its Say line filled the 3 of "2/3", which SAY-FILL forbids)
// (smaller head, lead ruling 2026-11-20, critic r2 R2-5) the in-order fallback fills only when the answer is ONE number:
// these 7 lost a Say line that guessed the gap order (fractions:compare printed "1/4 is 1/2 ___."); their providers need
// sayValues (round 3 / family lanes)
const SAYLESS_SMALLER_HEAD = ['fraction_operations:div_unit_fraction', 'fraction_operations:mult_frac_whole', 'fractions:compare', 'fractions:compare_to_half'];
// (r3: 133 -> 115; the lf-placevalue skills given a screen Say line left; multiplication:mult_break_apart joined - master 9ae9ccd5d
// already shows it no Say line, lf-ops)
const SAYLESS_PIN = [...SAYLESS_SMALLER_HEAD,
    'addition:add_sub_fact_family', 'addition:cloze_addition', 'addition:fact_family_sort', 'addition:nl_add',
    'algebra:function_table_easy', 'algebra:function_table_find_inputs', 'algebra:function_table_find_rule',
    'algebra:function_table_hard', 'algebra:two_step_estimate_check', 'algebra:two_step_letter_equation',
    'comparing:compare_groups', 'composing:base10_build', 'composing:base10_build_hundreds', 'composing:chart_to_120',
    'composing:compose_whole', 'composing:fraction_number_line', 'composing:hundreds_chart_fill', 'composing:odd_even',
    'composing:ten_frame_build_teen', 'composing:whole_as_fraction', 'decimals:decimal_nl_drag', 'division:div_remainders',
    'fraction_operations:add_frac_unlike', 'fraction_operations:add_fractions_like', 'fraction_operations:add_mixed_like',
    'fraction_operations:add_mixed_unlike', 'fraction_operations:sub_frac_unlike',
    'fraction_operations:sub_fractions_like', 'fraction_operations:sub_mixed_like', 'fraction_operations:sub_mixed_unlike',
    'fractions:compare_fractions_nl', 'fractions:equiv_frac_visual', 'fractions:fraction_nl_drag', 'fractions:identify',
    'fractions:identify_fraction_nl', 'fractions:mixed_nl_drag', 'fractions:shade_fraction', 'fractions:write_fraction',
    'fractions:write_fraction_nl', 'integers:integer_nl_drag', 'measurement:clock_parts', 'measurement:coin_value',
    'measurement:count_notes_and_coins', 'measurement:elapsed_15min', 'measurement:elapsed_30min',
    'measurement:elapsed_find_duration', 'measurement:elapsed_find_start', 'measurement:elapsed_hour',
    'measurement:elapsed_mixed', 'measurement:elapsed_visual_easy', 'measurement:elapsed_visual_hard',
    'measurement:elapsed_visual_medium', 'measurement:enough_money', 'measurement:minutes_by_fives_all',
    'measurement:money', 'measurement:money_change', 'measurement:money_compare', 'measurement:time_fives_ring',
    'measurement:time_sense', 'multiplication:arrays_groups', 'multiplication:count_by_10s', 'multiplication:count_by_11s',
    'multiplication:count_by_12s', 'multiplication:count_by_2s', 'multiplication:count_by_3s',
    'multiplication:count_by_4s', 'multiplication:count_by_5s', 'multiplication:count_by_6s', 'multiplication:count_by_7s',
    'multiplication:count_by_8s', 'multiplication:count_by_9s', 'multiplication:count_by_tables',
    'multiplication:dot_array_mult', 'multiplication:mult_arrays', 'multiplication:mult_break_apart',
    'multiplication:mult_chart', 'multiplication:mult_chart_easy', 'multiplication:mult_chart_headers',
    'multiplication:mult_chart_pattern', 'multiplication:mult_chart_shade', 'multiplication:mult_comparison',
    'multiplication:mult_comparison_plain', 'multiplication:mult_equal_groups', 'multiplication:mult_properties',
    'number_ops_mixed:word_problems_mixed', 'number_ops_mixed:word_problems_mixed_plain', 'number_sense:between_tens',
    'number_sense:estimate_products', 'number_sense:estimate_quotient', 'number_sense:reasonable_quotients',
    'number_sense:round_sort_10', 'number_sense:round_sort_100', 'number_sense:round_sort_1000',
    'number_sense:round_sort_10000', 'number_sense:round_sort_100000', 'number_sense:round_sort_hundredths',
    'number_sense:round_sort_million', 'number_sense:round_sort_tenths', 'number_sense:rounding_table',
    'number_sense:rounding_visual', 'patterns:follow_given_rule', 'patterns:notice_patterns',
    'patterns:number_patterns_rule', 'patterns:skip_count_grid', 'patterns:skip_count_line', 'placevalue:one_tenth_value',
    'placevalue:place_value_disks', 'placevalue:pv_digit_drag', 'placevalue:ten_times_value', 'subtraction:sub_5_pictures',
    'vocabulary:vocab_grade_pictures'];

// S8 allow-list (lead, 2026-11-20): the ONE skill whose screen help states the answer. No other skill may join it.
const S8_EXCEPTIONS = [{ skill: 'placevalue:digit_value_unit_form', source: 'owner request 2026-11-15, fixed by lead' }];

// Round-2 pins (shrink-only): pre-existing skills of other lanes, filled from the r2 sweep (2026-11-20). Owner lanes in
// design/status/lf-placevalue.md "HINT-NO-BLANK r2 hand-off".
const PINS = require('../fixtures/hint-no-blank-pins.json');

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
        const failed = new Set();
        const res = await app.page.evaluate(async ({ SKILL, CATEGORY, N_SEEDS, BLANK_SRC, S8_SKILLS }) => {
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
            // ---- round 2: the gate's OWN reading of the answer (never the code under test's answerTokens)
            const wholeNums = (t) => (String(t == null ? '' : t).match(/\d[\d,]*(?:\.\d+)?(?:\/\d+)?/g) || []).map((x) => x.replace(/,/g, ''));
            // (a number the question's text or its operands show is given: no leak. Never the picture's numbers: a clock face
            // shows every hour)
            const givenOf = (q) => new Set([...wholeNums(plain(q.text || q.question)), ...(Array.isArray(q.operands) ? q.operands.map((v) => String(v).replace(/,/g, '')) : [])]);
            const NOISE = /^(yes|no|true|false|t|f)$/i;
            // R2-1: the given-equal elements of a list answer, stated only as an operand ("1 × 80 = 80")
            function opTokens(q) {
                const a = q.ans; const g = givenOf(q);
                if (typeof a !== 'string' || !/^\s*-?[\d.\/]+(\s*,\s*-?[\d.\/]+)+\s*$/.test(a)) return [];
                return a.split(',').map((x) => x.trim()).filter((x) => x && x !== '0' && g.has(x.replace(/,/g, '')));
            }
            // (r3, same class as R2-1: a ONE-value answer that equals a given number - the 3 of "a length of 3 inches" - is still
            // stated when a step writes it as a result: "= 3 inches", "that's 2")
            function resTokens(q) {
                const a = q.ans; const g = givenOf(q);
                if ((typeof a !== 'number' && typeof a !== 'string') || !/^-?\d[\d,]*(?:\.\d+)?(?:\/\d+)?$/.test(String(a).trim())) return [];
                const x = String(a).trim().replace(/,/g, '');
                return x !== '0' && g.has(x) ? [x] : [];
            }
            function statesRes(text, e) {
                const t = String(text).replace(/(\d),(?=\d{3})/g, '$1');
                const k = esc(String(e));
                return new RegExp(`[=≈]\\s*${k}(?![\\d/]|\\.\\d)|\\bthat(?:'s| is)\\s+${k}(?![\\d/]|\\.\\d)`, 'i').test(t);
            }
            function statesOp(text, e) {
                const t = String(text).replace(/(\d),(?=\d{3})/g, '$1');
                const k = esc(String(e));
                return new RegExp(`(^|[^\\d.,/])${k}\\s*[×÷+−*-]\\s*\\d|[×÷+−*-]\\s*${k}(?![\\d/]|\\.\\d)\\s*=`).test(t);
            }
            // R2-3: the top-level terms of an expression answer ("4 × 100 + 0 × 10 + 9 × 1", "12x + 8")
            function termsOf(a) {
                if (typeof a !== 'string' || /=|;|,/.test(a) || /\(/.test(a)) return [];
                const parts = a.split(/\s+[+−-]\s+/).map((x) => x.trim()).filter(Boolean);
                return parts.length >= 2 ? parts : [];
            }
            function gateTokens(q) {
                const out = []; const g = givenOf(q);
                const add = (v) => {
                    const x = String(v == null ? '' : v).trim();
                    if (!x || x === '0' || NOISE.test(x) || !/[A-Za-z\d]/.test(x)) return;
                    if (!/[A-Za-z]/.test(x) && g.has(x.replace(/,/g, ''))) return;
                    if (/[A-Za-z]/.test(x) && !/\d/.test(x) && x.length < 3) return;   // an option letter: too short to read
                    out.push(x);
                };
                const a = q.ans;
                if (typeof a === 'number') add(a);
                else if (typeof a === 'string') {
                    if (/;/.test(a)) a.split(';').forEach(add);
                    else if (/^\s*-?[\d.\/]+(\s*,\s*-?[\d.\/]+)+\s*$/.test(a)) a.split(',').forEach(add);
                    else add(a);
                    termsOf(a).forEach(add);
                }
                return out;
            }
            function statesG(text, tok) {
                const t = String(text).replace(/(\d),(?=\d{3})/g, '$1');
                const k = String(tok).replace(/(\d),(?=\d{3})/g, '$1');
                if (/[A-Za-z]/.test(k)) return new RegExp(`(^|[^A-Za-z])${esc(k)}(?![A-Za-z])`, 'i').test(t);
                return new RegExp(`(^|[^\\d.,:/])${esc(k)}(?![\\d/]|\\.\\d)`).test(t);
            }
            // a sort (bin map): a bin's label followed by a tile that goes in it ("Rounds to 60: 64, 61")
            function statesSort(text, q) {
                if (!q.ans || typeof q.ans !== 'object' || Array.isArray(q.ans) || !Array.isArray(q.bins) || !Array.isArray(q.tiles)) return '';
                for (const b of q.bins) {
                    if (!b || b.label == null) continue;
                    const ls = q.tiles.filter((x) => x && q.ans[x.id] === b.id).map((x) => String(x.label));
                    for (const l of ls) if (new RegExp(`${esc(String(b.label))}\\s*:[^.]*(^|[^\\d])${esc(l)}(?![\\d])`).test(text)) return `${b.label}: ${l}`;
                }
                return '';
            }
            // (R2-8: a leading So / Then / Now does not make an expression a step: "So 10 − 7.")
            const BARE = /^(?:(?:so|then|now)[,:]?\s+)?[\d\s().,/]*\d[\d\s().,/]*[+−×÷-][\d\s+−×÷().,/-]*\d\s*\.?$/i;
            // R2-6 ORPHAN: the numbers a pupil can see (question text, picture, options, operands, place-value record)
            const POW10 = (v) => /^1(0)*$/.test(v);
            function seenNums(q) {
                const s = new Set([...givenOf(q), ...wholeNums(plain(q.visual)), ...wholeNums(plain(q.question))]);
                (Array.isArray(q.options) ? q.options : []).forEach((o) => wholeNums(plain(typeof o === 'object' && o ? (o.label || o.text || o.value) : o)).forEach((v) => s.add(v)));
                // (the item's own record: its place-value fields and number lists - a line's ends, the tiles - and its plain number fields)
                const prim = (v) => typeof v === 'number' || (typeof v === 'string' && v.length < 40);
                if (q.pv && typeof q.pv === 'object') Object.values(q.pv).forEach((v) => (Array.isArray(v) ? v : [v]).forEach((x) => { if (prim(x)) wholeNums(String(x)).forEach((y) => s.add(y)); }));
                Object.entries(q).forEach(([k, v]) => { if (k !== 'ans' && typeof v === 'number') s.add(String(v)); });
                // (a digit of a number the pupil sees is seen: "The 5 is in the hundreds place." of 560)
                [...s].forEach((v) => (v.match(/\d/g) || []).forEach((d) => s.add(d)));
                return s;
            }
            function orphanOf(steps, q) {
                const known = seenNums(q);
                const ok = (v) => known.has(v) || v === '0' || v === '1' || v === '2' || POW10(v);
                for (let k = 0; k < steps.length; k++) {
                    const t = steps[k];
                    if (k === 0 && /^(it|its|is it|they|this|that|these|those|he|she)\b/i.test(t.trim())) return `step 1 opens with a pronoun: "${t}"`;
                    const xx = /(\d[\d,.]*)\s*[−-]\s*(\d[\d,.]*)\s*=\s*0(?![\d.])/.exec(t);
                    if (xx && xx[1].replace(/,/g, '') === xx[2].replace(/,/g, '')) return `step ${k + 1} works "x − x = 0": "${t}"`;
                    // a number worked in the step from two it already knows ("7 + 3 = 10": 3 from 7 and 10) is explained
                    const tt = t.replace(/(\d),(?=\d{3})/g, '$1');
                    const eqRe = /(\d+(?:\.\d+)?(?:\/\d+)?)\s*[+−×÷*x-]\s*(\d+(?:\.\d+)?(?:\/\d+)?)\s*=\s*(\d+(?:\.\d+)?(?:\/\d+)?)/g;
                    const worked = new Set(); let m;
                    while ((m = eqRe.exec(tt))) { const v = [m[1], m[2], m[3]]; if (v.filter(ok).length >= 2) v.forEach((x) => worked.add(x)); }
                    // ... and a sentence's LAST number, given by "is" / "=" from numbers it knows ("Halfway between 70 and 80 is 75.")
                    t.split(/(?<=[.!?])\s+/).forEach((sn) => {
                        const snc = sn.replace(/(\d),(?=\d{3})/g, '$1');
                        const ns = wholeNums(snc); const un = ns.filter((v) => !ok(v) && !worked.has(v));
                        if (un.length === 1 && ns[ns.length - 1] === un[0] && /\b(is|are|makes?)\b|=/.test(snc.slice(0, snc.lastIndexOf(un[0])))) worked.add(un[0]);
                    });
                    const bad = wholeNums(t).find((v) => !ok(v) && !worked.has(v));
                    if (bad) return `step ${k + 1} names ${bad}, which is in neither the question nor an earlier step: "${t}"`;
                    wholeNums(t).forEach((v) => known.add(v));
                }
                return '';
            }
            const VERB = /^(find|count|add|subtract|take|multiply|divide|work|look|read|point|write|think|start|make|use|say|split|circle|match|put|move|check|draw|mark|join|share|compare|ask|now|then|so|next|tap|choose|halve|double|partition|round|fill|shade|trace|touch|jump|regroup|exchange|cross|colou?r|line|place|name|show|turn|go|skip|group|sort|plot|measure|label|build|break|change|try|remember|cut|fold|order|list|times|hop|drag|keep|line up)\b/i;
            const findings = [];
            const F = (check, key, seed, text) => findings.push({ check, key, seed, text: String(text).slice(0, 220) });
            // UNIT-CUT (F7): a unit test of the cutter on the units the area / volume / measure steps use
            const UNIT_CASES = [
                ['Area of a triangle = (base × height) ÷ 2 = (9 × 4) ÷ 2 = 36 ÷ 2 = 18 square units.', ['18'], 'Area of a triangle = (base × height) ÷ 2 = (9 × 4) ÷ 2 = 36 ÷ 2.'],
                ['Volume = 2 × 3 × 4 = 24 cubic units.', ['24'], 'Volume = 2 × 3 × 4.'],
                ['Area = 5 × 6 = 30 square cm.', ['30'], 'Area = 5 × 6.'],
                ['Area = 4 × 4 = 16 cm².', ['16'], 'Area = 4 × 4.'],
                ['Area = 7 × 3 = 21 square feet.', ['21'], 'Area = 7 × 3.'],
                ['Add the ones: 4 + 5 = 9.', ['9'], 'Add the ones: 4 + 5.'],
            ];
            for (const [inp, toks, want] of UNIT_CASES) {
                const got = sl.withoutAnswer(inp, toks);
                if (got !== want) F('UNIT-CUT', 'support-ladder:withoutAnswer', 0, `"${inp}" under ${toks} gave "${got}", want "${want}"`);
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
            const generic = {};
            const offenders = []; const errors = []; const empty = new Set(); const sayless = new Set(); const hiddenFail = []; let items = 0;
            const firstEmpty = new Map(); const firstSayless = new Map();
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
                    // R2-KEEP (lead ruling A12, 2026-11-20): a skill with no screenHelp keeps master's r2 box - the fact skills'
                    // own steps (critic r2 scored add_facts 9) are not swapped for a one-line hint
                    if (['addition:add_facts', 'subtraction:sub_facts'].includes(key) && paths.filter((x) => x[0] === 'STEPS').length < 2) F('R2-KEEP', key, i, `the box shows ${paths.filter((x) => x[0] === 'STEPS').length} step(s), want its own r2 steps (>= 2)`);
                    // ENDS-WITH-ACTION (critic r3 R3-2, compensation): a skill that HAS screenHelp never shows a box whose last step
                    // does not say what to do (a cut box loses to the screenHelp)
                    try {
                        const shOwn = kit.getProvider(cat, skill);
                        let hasSH = false; try { const shv = shOwn && typeof shOwn.screenHelp === 'function' ? shOwn.screenHelp(q) : null; hasSH = !!(shv && Array.isArray(shv.steps) && shv.steps.length); } catch (e) { hasSH = false; }
                        const st = paths.filter((x) => x[0] === 'STEPS').map((x) => x[2]);
                        const ACT = /\b(add|subtract|take|count|find|write|type|read|look|put|start|make|use|say|tap|choose|round|keep|work|think|point|circle|compare|move|check|split|multiply|divide|halve|double|fill|mark|jump|go|now|then|drag|sort|tick|pick)\b/i;
                        if (hasSH && st.length && !ACT.test(st[st.length - 1].split(/(?<=[.!?])\s+/).pop())) F('ENDS-WITH-ACTION', key, i, `last step "${st[st.length - 1]}" says nothing to do`);
                        // PREFER-SH (R3-2): when the skill's own steps had to be cut, the box is its screenHelp, never the cut steps
                        if (hasSH && st.length && rawSteps && st.join(' | ') !== rawSteps) {
                            const shs = shOwn.screenHelp(q).steps.map(String);
                            if (st.join(' | ') !== shs.join(' | ') && !q.fullWorked) F('PREFER-SH', key, i, `cut own steps shown ("${st.join(' / ').slice(0, 120)}") instead of screenHelp`);
                        }
                    } catch (e) { /* no provider */ }
                    // SAYLESS: the skill's provider has a Say frame, but the screen shows no Say line for this item
                    try {
                        const pv = kit.getProvider(cat, skill);
                        const frame = pv && typeof pv.strings === 'function' ? String(pv.strings({ q }).say || '') : '';
                        if (frame && !q.sayText && !sl.sayFor(q, ctx)) sayless.add(key);
                    } catch (e) { /* no provider */ }
                    // SAY-ORDER (critic r2 R2-5, fractions:compare "1/4 is 1/2 ___."): a Say line whose gap is its LAST word, right
                    // after a number, stands for a number; when the answer is a word or a sign the given values were put in the
                    // answer's place
                    try {
                        const s0 = sl.sayFor(q, ctx);
                        const ansNum = q.ans != null && typeof q.ans !== 'object' && /^-?\d[\d,]*(?:\.\d+)?(?:\/\d+)?$/.test(String(q.ans).trim());
                        if (s0 && !ansNum && /\d\s+_{2,}\s*[.!?]?\s*$/.test(s0)) F('SAY-ORDER', key, i, s0);
                    } catch (e) { /* judged below */ }
                    try { const s = sl.sayFor(q, ctx); if (s) paths.push(['SAY', 'say', s]); } catch (e) { errors.push(`${key} seed ${i}: sayFor threw ${e && e.message}`); }
                    if (!firstSayless.has(key) && paths.some((x) => x[0] === 'STEPS') && !paths.some((x) => x[0] === 'SAY')) firstSayless.set(key, q);
                    // (r3: the screen hint - a provider screenHelp.hint, else q.hint - when the tree has hintFor)
                    let hintShown = q.hint;
                    try { if (typeof sl.hintFor === 'function') hintShown = sl.hintFor(q, ctx); } catch (e) { errors.push(`${key} seed ${i}: hintFor threw ${e && e.message}`); }
                    if (hintShown) paths.push(['HINT', 'hint', plain(hintShown)]);
                    try {
                        const sol = typeof window.generateSolutionSteps === 'function' ? window.generateSolutionSteps(q) : [];
                        (Array.isArray(sol) ? sol : []).forEach((t, k) => paths.push(['SOL', `sol ${k + 1}`, plain(t)]));
                    } catch (e) { errors.push(`${key} seed ${i}: generateSolutionSteps threw ${e && e.message}`); }
                    const exempt = S8_SKILLS.includes(key);
                    if (q.fullWorked && !exempt) F('S8-EXCEPTION', key, i, 'q.fullWorked (help with the answer) on a skill that is not in S8_EXCEPTIONS');
                    if (!exempt) {
                        const toks = gateTokens(q);
                        const steps = paths.filter((x) => x[0] === 'STEPS').map((x) => x[2]);
                        const sayT = (paths.find((x) => x[0] === 'SAY') || [])[2] || '';
                        const hintT = (paths.find((x) => x[0] === 'HINT') || [])[2] || '';
                        const opt = opTokens(q); const rt = resTokens(q);
                        // HINT-LEAK / SAY-LEAK (F3): the hint and the Say line are help: S8 holds on them too
                        const hl = toks.find((tk) => statesG(hintT, tk)) || opt.find((e) => statesOp(hintT, e)) || rt.find((e) => statesRes(hintT, e));
                        if (hintT && hl) F('HINT-LEAK', key, i, `hint states "${hl}": "${hintT}"`);
                        const sl8 = toks.find((tk) => statesG(sayT, tk));
                        if (sayT && sl8) F('SAY-LEAK', key, i, `Say states "${sl8}": "${sayT}"`);
                        // STEPS-LEAK (F4, F13, F14)
                        steps.forEach((t, k) => {
                            const tl = toks.find((tk) => statesG(t, tk)) || opt.find((e) => statesOp(t, e)) || rt.find((e) => statesRes(t, e));
                            const so = statesSort(t, q);
                            if (tl) F('STEPS-LEAK', key, i, `step ${k + 1} states "${tl}": "${t}"`);
                            else if (so) F('STEPS-LEAK', key, i, `step ${k + 1} states the sort "${so}": "${t}"`);
                            else if (/(^|\s)Answer\s*:|\[object /.test(t)) F('STEPS-LEAK', key, i, `step ${k + 1} prints the answer line: "${t}"`);
                        });
                        // DANGLING-HEAD (R2-2): a heading with nothing under it
                        steps.forEach((t, k) => {
                            if (!/:\s*$/.test(t)) return;
                            const nx = steps[k + 1];
                            if (!nx || !/^[\d(]/.test(nx.trim())) F('DANGLING-HEAD', key, i, `step ${k + 1} ends in ":" with nothing under it: "${t}"${nx ? ` then "${nx}"` : ''}`);
                        });
                        // ORPHAN (R2-6)
                        const orph = steps.length ? orphanOf(steps, q) : '';
                        if (orph) F('ORPHAN', key, i, orph);
                        // HELP-GENERIC (R2-7): collected per skill, judged after its items
                        if (steps.length) { (generic[key] = generic[key] || []).push({ item: plain(q.text || q.question) + '|' + JSON.stringify(q.ans), help: steps.join(' | ') }); }
                        // BARE-STEP (F9)
                        steps.forEach((t, k) => {
                            const nrm = (x) => x.replace(/\s+/g, '').replace(/\.$/, '').toLowerCase();
                            if (BARE.test(t)) F('BARE-STEP', key, i, `step ${k + 1} is a bare expression: "${t}"`);
                            else if (steps.slice(0, k).some((y) => nrm(y) === nrm(t))) F('BARE-STEP', key, i, `step ${k + 1} repeats an earlier step: "${t}"`);
                        });
                        // SAY-FILL (F10) and SAY-GAP-GIVEN (F11)
                        if (sayT && !q.sayText) {
                            const allowed = new Set([...givenOf(q), ...wholeNums(plain(q.visual)), ...(q.pv && typeof q.pv === 'object' ? Object.values(q.pv).filter((v) => typeof v === 'number' || typeof v === 'string').map((v) => String(v).replace(/,/g, '')) : [])]);
                            const bad = wholeNums(sayT).filter((v) => !allowed.has(v));
                            if (bad.length) F('SAY-FILL', key, i, `Say fills ${bad.join(', ')}, not a whole value of the question: "${sayT}"`);
                            const a = q.ans != null && typeof q.ans !== 'object' ? String(q.ans).replace(/,/g, '') : '';
                            const tv = wholeNums(plain(q.text || q.question));
                            // (the question ASKS for a value it shows - "Tap 55 on the number line." - when its only number is the answer)
                            if (/_{2,}/.test(sayT) && /\d/.test(a) && tv.length && tv.every((v) => v === a)) F('SAY-GAP-GIVEN', key, i, `the Say gap is ${a}, which the question gives: "${sayT}"`);
                        }
                        // HELP-THIN (F5): a provider skill that loses at least half its steps ends on a step saying what to do
                        try {
                            const pv = kit.getProvider(cat, skill);
                            const rawP = pv && Array.isArray(pv.real) && pv.real.includes('workedSteps') ? (pv.workedSteps(q) || []).filter((x) => x && x.text) : [];
                            if (rawP.length >= 3 && steps.length && (rawP.length - steps.length) * 2 >= rawP.length) {
                                const last = steps[steps.length - 1];
                                if (!last.split(/[.,;:!?]\s+/).some((c) => VERB.test(c.trim())) && !/\?/.test(last)) F('HELP-THIN', key, i, `${steps.length} of ${rawP.length} steps shown, and the last says nothing to do: "${last}"`);
                            }
                        } catch (e) { /* no provider steps */ }
                    }
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
                        // (r2 WORKED-GAP, F1 F2: only a fill the pupil SEES counts - never the hidden fullWorked steps S8 leaves out)
                        if (workedGap(t, m, later)) continue;
                        offenders.push({ key, seed: i, kind, where, text: t.slice(0, 220), blank: m[0].trim() });
                    }
                }
            }
            // HELP-GENERIC (R2-7): two or more different items, every one shown the same help word for word
            for (const [key, rows] of Object.entries(generic)) {
                if (rows.length < 2 || new Set(rows.map((r) => r.item)).size < 2) continue;
                if (new Set(rows.map((r) => r.help)).size === 1) F('HELP-GENERIC', key, 0, `every item shows the same help: "${rows[0].help.slice(0, 160)}"`);
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
                    // r2 F8: with no box, the status line does not point at one
                    const fb = (document.getElementById('feedbackArea') || {}).textContent || '';
                    if (!box && /Here is how/i.test(fb)) hiddenFail.push(`${key}: no "Here is how" box, yet the status line says "${fb.trim().slice(0, 80)}"`);
                } catch (e) { errors.push(`${key}: card render threw ${e && e.message}`); }
            }
            // LISTEN (F6): a box shown with no Say line still has Listen (speech on)
            let listenN = 0;
            for (const [key, q] of firstSayless) {
                const [cat, skill] = key.split(':');
                try {
                    const st = window.state;
                    const tts = st.ttsEnabled; st.ttsEnabled = true;
                    st.category = cat; st.skill = skill; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                    if (window.showView) window.showView('gameView');
                    const q2 = Object.assign({}, q);
                    st.currentQ = q2;
                    window.renderQuestion();
                    for (let k = 1; k <= 3; k++) sl.practiceLadderWrong(q2, `zz${k}`);
                    const box = document.querySelector('#questionCard .mq-ladder-worked, #visualAid .mq-ladder-worked');
                    if (box) { listenN++; if (!box.querySelector('.mq-lw-speak')) F('LISTEN', key, 0, `a "Here is how" box with no Listen: "${(box.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100)}"`); }
                    st.ttsEnabled = tts;
                } catch (e) { errors.push(`${key}: listen card render threw ${e && e.message}`); }
            }
            const emptyWhat = {};
            for (const [key, q] of firstEmpty) emptyWhat[key] = `"${plain(q.text).slice(0, 80)}" ans ${JSON.stringify(q.ans)}; hint "${plain(q.hint).slice(0, 100)}"`;
            return { emptyWhat, skills: list.length, items, offenders, errors, empty: [...empty].sort(), sayless: [...sayless].sort(), hiddenFail, hiddenN: firstEmpty.size, findings, listenN };
        }, { SKILL, CATEGORY, N_SEEDS, BLANK_SRC, S8_SKILLS: S8_EXCEPTIONS.map((x) => x.skill) });

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
        const pinOk = (pin, k) => pin.includes(k) && !STRICT_PINS;
        const newEmpty = res.empty.filter((k) => !pinOk(EMPTY_PIN, k));
        res.empty.filter((k) => pinOk(EMPTY_PIN, k)).forEach((k) => console.log(`  pinned HELP-EMPTY ${k}: every worked step states the answer (no provider steps; owner lane to write them)`));
        newEmpty.forEach((k) => console.log(`  FAIL HELP-EMPTY ${k}: "Here is how" has no step left once the answer is left out (${res.emptyWhat[k] || ''})`));
        if (newEmpty.length) failed.add('HELP-EMPTY');
        // SAYLESS pin (lead ruling 2026-11-20): skills whose provider frame takes values the screen cannot fill (no sayValues,
        // and the question's own numbers do not fit it). Shrink-only: a skill not on it that loses its Say line FAILs.
        const newSayless = res.sayless.filter((k) => !pinOk(SAYLESS_PIN, k));
        newSayless.forEach((k) => console.log(`  FAIL SAYLESS ${k}: the provider has a Say frame but the screen shows no Say line`));
        if (newSayless.length) failed.add('SAYLESS');
        // S8 allow-list: exactly ONE named entry (lead 2026-11-20); a second entry FAILs
        if (S8_EXCEPTIONS.length !== 1 || S8_EXCEPTIONS[0].skill !== 'placevalue:digit_value_unit_form' || !S8_EXCEPTIONS[0].source) {
            console.log(`  FAIL S8-EXCEPTION the allow-list must hold only placevalue:digit_value_unit_form (has ${S8_EXCEPTIONS.map((x) => x.skill).join(', ')})`);
            failed.add('S8-EXCEPTION');
        }
        // round-2 checks, each with its shrink-only pin
        const FULL = !SKILL && !CATEGORY;
        const byCheck = {};
        for (const f of res.findings) (byCheck[f.check] = byCheck[f.check] || new Map()).set(f.key, f);
        const CHECKS = ['UNIT-CUT', 'S8-EXCEPTION', 'HINT-LEAK', 'SAY-LEAK', 'STEPS-LEAK', 'BARE-STEP', 'SAY-FILL', 'SAY-GAP-GIVEN', 'SAY-ORDER', 'R2-KEEP', 'ENDS-WITH-ACTION', 'PREFER-SH', 'HELP-THIN', 'LISTEN',
            'DANGLING-HEAD', 'ORPHAN', 'HELP-GENERIC'];
        const lists = {};
        for (const c of CHECKS) {
            const m = byCheck[c] || new Map();
            const pin = PINS[c] || [];
            lists[c] = [...m.keys()].sort();
            let nNew = 0;
            for (const [k, f] of [...m.entries()].sort()) {
                if (pinOk(pin, k)) { if (VERBOSE) console.log(`  pinned ${c} ${k} seed ${f.seed}: ${f.text}`); continue; }
                console.log(`  FAIL ${c} ${k} seed ${f.seed}: ${f.text}${pin.includes(k) ? ' (pinned; --strict-pins)' : ''}`); nNew++;
            }
            const stale = FULL ? pin.filter((k) => !m.has(k)) : [];
            stale.forEach((k) => console.log(`  FAIL ${c} pin ${k} no longer fails: take it off the pin (pins only shrink)`));
            if (nNew || stale.length) failed.add(c);
            console.log(`ws-hint-no-blank: ${c} ${m.size} skills (pin ${pin.length})`);
        }
        if (FULL) {
            const staleE = EMPTY_PIN.filter((k) => !res.empty.includes(k));
            const staleS = SAYLESS_PIN.filter((k) => !res.sayless.includes(k));
            staleE.forEach((k) => console.log(`  FAIL HELP-EMPTY pin ${k} no longer empty: take it off EMPTY_PIN`));
            staleS.forEach((k) => console.log(`  FAIL SAYLESS pin ${k} has a Say line now: take it off SAYLESS_PIN`));
            if (staleE.length || staleS.length) failed.add('PIN-STALE');
        }
        console.log(`ws-hint-no-blank: LISTEN ${res.listenN} boxes with no Say line checked`);
        if (SHOW_LISTS) console.log('PINS ' + JSON.stringify(lists));
        res.hiddenFail.forEach((f) => console.log(`  FAIL HELP-EMPTY-HIDDEN ${f}`));
        if (res.hiddenFail.length) failed.add('HELP-EMPTY-HIDDEN');
        console.log(`ws-hint-no-blank: HELP-EMPTY ${res.empty.length} skills (pin ${EMPTY_PIN.length}), SAYLESS ${res.sayless.length} (pin ${SAYLESS_PIN.length}), HELP-EMPTY-HIDDEN ${res.hiddenN} cards checked, ${res.hiddenFail.length} showing a box`);
        if (SHOW_LISTS) { console.log('EMPTY ' + JSON.stringify(res.empty)); console.log('SAYLESS ' + JSON.stringify(res.sayless)); }
        const kindCount = {};
        res.offenders.forEach((o) => { kindCount[o.kind] = (kindCount[o.kind] || 0) + 1; });
        console.log(`ws-hint-no-blank: ${res.skills} skills, ${res.items} items, ${keys.length} skills with a blank in their help`
            + (Object.keys(kindCount).length ? ` (${Object.entries(kindCount).sort().map(([k, n]) => `${k} ${n}`).join(', ')} lines)` : ''));
        if (!res.skills) { console.log('  FAIL no skill matched the filter'); code = 1; }
        if (keys.length) failed.add('BLANK'); if (res.errors.length) failed.add('ERROR');
        // --only <CHECK>: the verdict counts that one check (a backtest row proves one check; WORKED-GAP is the BLANK detector's
        // worked-gap exemption, so it is judged by BLANK)
        // (a comma list judges a group: --only HINT-LEAK,SAY-LEAK)
        const onlyIds = ONLY ? ONLY.split(',').map((x) => (x.trim() === 'WORKED-GAP' ? 'BLANK' : x.trim())).filter(Boolean) : [];
        if (onlyIds.length ? onlyIds.some((x) => failed.has(x)) || failed.has('ERROR') : failed.size) code = 1;
        if (failed.size) console.log(`ws-hint-no-blank: failing checks ${[...failed].sort().join(', ')}${onlyIds.length ? ` (judged: ${onlyIds.join(', ')})` : ''}`);
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
