// Y2 / Y3 SITE LESSONS (round 12; owner rule 2026-10-16: every site lesson tagged). Every lesson of
// data/curriculum/site-lessons.json with wrmYear Y2 (school Grade 1, 11) or Y3 (school Grade 2, 25): lessons the school site
// schedules or lists that are NOT White Rose small steps. The contract is the Y5 lane's (Y5-report.md "Site lessons"):
// direct / partial with opts and clause, verdict, missing, build (a proposal with its closes and an envision row), >= 3 pre
// cited by the step the skill is tagged to and its school week (or grade), related, note. Lessons tag NOTHING into SKILL_WRM
// (no tagFixes); a proposal a lesson needs lists the lesson under `lessons` and `closes[<lesson id>]`.
// Every direct / partial verdict was judged from generated items with the opts listed (items.mjs --key, the r12 report);
// build.mjs checks every link exactly as a step's (markers at the lesson's first school week; a Support lesson is judged
// against its SOURCE grade: week 0 of this grade, and its pre cite only steps of the source year or below; an above-grade
// core title with no week is judged at W38) and sweep.mjs reads every why and clause against fresh-seed items.
//
// Shape: lesson(id, { direct: [[key, opts]], partial: [[key, opts, missing]], verdict, missing, build: [ids],
//   pre: [[key, opts, citedStepId, reason?]], related: [[key, opts, why]], note })
// A pre's why is written by the build: "<step id> <its title> (<taught earlier, Wn | the same school week, Wn | Grade K …>)"
// + ": <reason>". The cited step must own the key (direct or partial) or the reason must say what the link deals.
export const lessons = {};
const lesson = (id, spec) => { lessons[id] = spec; };
const BAR = { support: 'bar' };
const ZR = (...st) => ({ rows: st.map((step) => ({ step, start: 'zero', dir: 'up' })) });

// ── proposals only lessons need (new) ──
export const lessonProposals = {
  nl_tens_ones_jumps: {
    kind: 'option', skill: 'addition:number_line_add', also: ['subtraction:number_line_sub'],
    option: 'jumps "tens then ones" on a 0-100 line (34 + 23: jump +10, +10, then +3)',
    name: 'Number Line Jumps of Tens and Ones (option)',
    teaches: 'adding and subtracting within 100 on a number line by jumping the tens first and then the ones (34 + 23: 34, 44, 54, 57; 57 − 23: 57, 47, 37, 34), and writing the equation the jumps show',
    representation: 'one boxed cell: a 0-100 line with the tens marked, the start number boxed, jump arcs labelled +10 / +1 drawn by the pupil, one answer box',
    family: 'addition', ccss: ['2.MD.B.6', '2.NBT.B.5'],
    why: 'number_line_add and number_line_sub draw a 0-20 line with single jumps of ones (14 + 4, 16 − 7); their range option does not take them to 100 and no form jumps in tens' },
  estimate_inches_feet: {
    kind: 'option', skill: 'measurement:estimate_length',
    option: 'units "inches and feet" (customary): estimate an object\'s length in inches or feet from a benchmark (a paperclip is about 1 inch, a ruler is 1 foot)',
    name: 'Estimate in Inches and Feet (option)',
    teaches: 'estimating lengths in inches and feet with benchmarks, choosing the sensible unit (a pencil about 7 inches, a door about 7 feet), then checking by measuring',
    representation: 'the existing estimate cell: the object drawn beside a benchmark (paperclip = 1 inch, ruler = 1 foot), an answer box with the unit printed',
    family: 'measurement', ccss: ['2.MD.A.3'],
    why: 'estimate_length deals cm and m only ("About how long is a textbook? 28 cm"); reading_ruler reads whole inches but never feet and never estimates' },
};
// proposals reused from a passed lane's links file (the same id = the same spec, copied as written there)
export const laneProposals = { map_change_unknown_story: 'MAP', map_compare_smaller_unknown: 'MAP', map_compose_solids: 'MAP', doubles_pictured: 'R' };

// ───────────────────────── Y2 (school Grade 1) ─────────────────────────
const G1 = 'G1|-|';
lesson(G1 + 'solveonestepwordproblemswithin20usingbarmodels', {
  partial: [['addition:add_wp_20', BAR, 'adding-to and putting-together stories with the total unknown, each on a bar (4 cards and 3 more cards); never the change or the start unknown'],
            ['subtraction:sub_wp_20', BAR, 'taking-from stories with the result unknown on a bar (7 cards, 4 taken out); never a compare story (how many more?)']],
  verdict: 'partial', missing: 'stories with the change or the start unknown (had 8, got some, now 13) and compare stories with the smaller amount unknown, each drawn on a bar model',
  build: ['map_change_unknown_story', 'map_compare_smaller_unknown'],
  pre: [['addition:add_wp_10', { band: 10 }, 'Y1.B2.S10', 'join stories within 10, the total unknown'],
        ['subtraction:sub_wp_10', {}, 'Y1.B2.S15', 'take-away stories within 10'],
        ['composing:number_bonds', { band: 10 }, 'R.B11.S7', 'the parts of a number to 10, a part or the whole unknown (used for the bar of a part-whole story)'],
        ['composing:teen_compose', {}, 'Y2.B1.S1', 'the numbers 11 to 20 (used in the stories)']],
  related: [['algebra:tape_diagram', { band: 20 }, 'bar models of joining, taking away and "how many more does she need?" within 20, with the bar drawn for the pupil'],
            ['addition:comparison_word', { range: 10 }, 'how many more / fewer stories within 10: the compare stories this lesson adds']],
  note: 'Domain-test build lesson (site: "New CCSS BUILD lesson so the domain test only asks what has been taught"), W03 and W04, OA unit. The school teaches it before the Grade 1 addition block (W5): its stories stay within 20 with the numbers met in Y2.B1.S1 (W1).',
});
lesson(G1 + 'countonto120', {
  partial: [['composing:hundreds_chart_fill', { band: 100 }, 'fills gaps in a 1-100 chart; numbers past 100 (101 to 120) never appear'],
            ['counting:number_seq_fill', { step: 1, range: 100 }, 'counts on and back in a number track to 100 only']],
  verdict: 'partial', missing: 'counting on past 100 to 120 from any number, and reading and writing the numerals 101 to 120',
  build: ['chart_120'],
  pre: [['counting:number_seq_fill', { step: 1, range: 50 }, 'Y1.B6.S1', 'counting on in a track to 50, the same count lower'],
        ['composing:base10_build', { band: 99 }, 'Y2.B1.S2', 'tens and ones to 100: the count past each ten'],
        ['placevalue:compare', { band: 99 }, 'Y2.B1.S13', 'reading two numerals to 100 and saying which is more'],
        ['multiplication:count_by_tables', ZR(10), 'Y2.B1.S15', 'counting in 10s from 0, to 110: the tens the count to 120 passes']],
  related: [['composing:number_chart_fill', { band: 200 }, 'filling gaps in a chart from 101 on (to 200): the same counting on, past 120']],
  note: 'Awsaj supplement lesson in Y2.B1 (Place value within 100), W08 and W09; closes 1.NBT.A.1, which White Rose Year 2 does not teach past 100.',
});
lesson(G1 + 'composeandrecomposeshapes', {
  partial: [['shapes_early:compose_shapes', {}, 'two flat shapes put together make one new shape (two triangles make a square); never 3-D shapes'],
            ['shapes_early:compose_hexagon', {}, 'fills a hexagon with pattern blocks three ways (triangles, rhombi, trapezoids): recomposing one 2-D shape']],
  verdict: 'partial', missing: 'composing 3-D shapes (cubes, cuboids, cylinders, cones) into a composite solid and naming the solids a model is made of',
  build: ['map_compose_solids'],
  pre: [['shapes_early:name_2d_shapes', { shapes: [0, 1, 2, 4] }, 'Y1.B3.S3', 'naming the circles, triangles, squares and rectangles put together'],
        ['shapes_early:count_sides_vertices_2d', { forms: [0] }, 'Y2.B3.S2', 'counting the sides of the shapes joined'],
        ['shapes_early:count_edges_faces_vertices', { forms: [0] }, 'Y2.B3.S8', 'the faces of cubes and cuboids, the 3-D shapes joined in the second half']],
  related: [['shapes_early:name_3d_shapes', {}, 'naming cubes, cuboids, cylinders and cones: the solids the 3-D half puts together (Y2.B3.S1, the same week)']],
  note: 'Awsaj supplement lesson in Y2.B3 (Shape), W15 and W16; closes 1.G.A.2, which White Rose Year 2 does not teach.',
});
// Support lessons (site flag enrich-native, source GPK = Reception: judged against the Reception steps)
lesson(G1 + 'bondsto10explorecombinationsthatmake10', {
  direct: [['composing:make_ten', { band: 10 }]],
  verdict: 'full',
  pre: [['composing:number_bonds', { band: 10 }, 'R.B11.S7', 'the parts of every number to 10'],
        ['composing:ten_frame_build', { band: 10 }, 'R.B11.S3', 'building 9 and 10 on a ten frame, the frame make_ten fills'],
        ['counting:count_objects', { band: 10, objects: 'frame' }, 'R.B11.S1', 'counting 9 and 10 in a frame']],
  related: [['addition:add_three', { band: 10, notation: ['across'] }, 'three numbers that make 10 (R.B11.S10, the next Reception step)']],
  note: 'Support lesson (site flag enrich-native, source Reception, "From earlier work, prerequisite ladder"); nearest WRM step R.B11.S8 Bonds to 10 (2 parts). make_ten {band:10} deals every bond to 10 on a ten frame (The frame shows 6. How many more make 10? 4), which is the lesson at its source grade.',
});
lesson(G1 + 'comparemass1', {
  direct: [['measurement:heavier_lighter_visual', {}]],
  verdict: 'full',
  pre: [['comparing:compare_objects', {}, 'R.B2.S1', 'comparing two pictured objects with the words taller, longer, thicker'],
        ['comparing:compare_groups', { band: 5, level: [1] }, 'R.B1.S7', 'the compare words more, fewer, the same on groups to 5']],
  related: [['comparing:compare_objects', { task: 'length' }, 'comparing two lengths: the same compare words for another measure (R.B10.S2)']],
  note: 'Support lesson (enrich-native, source Reception); nearest WRM step R.B2.S2 Compare mass (Reception Autumn), the first measure lesson. heavier_lighter_visual asks which of two pictured objects is heavier or lighter, which is the Reception lesson. Pre-skills are few: only comparing size and comparing amounts come before it in Reception.',
});
lesson(G1 + 'comparemass2', {
  direct: [['measurement:heavier_lighter_visual', {}]],
  verdict: 'full',
  pre: [['comparing:compare_objects', {}, 'R.B2.S1', 'comparing two pictured objects with the words taller, longer, thicker'],
        ['comparing:compare_groups', { band: 5, level: [1] }, 'R.B1.S7', 'the compare words more, fewer, the same on groups to 5']],
  related: [['comparing:compare_objects', { task: 'height' }, 'comparing heights: the same compare words for another measure (R.B10.S4)']],
  note: 'Support lesson (enrich-native, source Reception); nearest WRM step R.B8.S1 Compare mass (Reception Spring, the second time mass is compared; R.B2.S2 is the first). The site gives no other detail, so it is tagged as that step. Pre-skills are few for the reason given on Compare mass (1).',
});
lesson(G1 + 'doublingupto55', {
  partial: [['number_sense:doubles_near_doubles', { forms: [0] }, 'abstract doubles to 10 + 10 (Double it! 7 + 7); never a picture of two equal groups, and past 5 + 5']],
  verdict: 'partial', missing: 'finding and making a double from a picture of two equal groups, totals to 10 (5 + 5)',
  build: ['doubles_pictured'],
  pre: [['addition:add_5_pictures', {}, 'R.B9.S9', 'putting two pictured groups together and counting them all'],
        ['composing:number_bonds', { band: 10 }, 'R.B11.S7', 'the parts of numbers to 10, 5 and 5 among them (used for doubles)'],
        ['composing:odd_even', { forms: [2], range: 10 }, 'R.B11.S13', 'naming odd and even numbers to 10 (the Reception step makes pairs): an even number splits into a double']],
  related: [['patterns:double', { band: 20 }, 'Double 7 = 14: the double written as a number fact (R.B11.S12 Doubles to 10, make a double)']],
  note: 'Support lesson (enrich-native, source Reception); nearest WRM steps R.B11.S11 / S12 Doubles to 10 (find, make a double), both partial for the same reason. doubles_pictured is the Reception lane\'s option for them.',
});
lesson(G1 + 'lengthandheightcompareorder', {
  direct: [['comparing:compare_objects', { task: 'length' }], ['comparing:compare_objects', { task: 'height' }], ['shapes_early:order_objects_length', { tiles: 3 }]],
  verdict: 'full',
  pre: [['comparing:compare_groups', { band: 5, level: [1] }, 'R.B1.S7', 'the compare words more, fewer, the same'],
        ['measurement:heavier_lighter_visual', {}, 'R.B2.S2', 'comparing two objects by mass: the same compare idea for another measure']],
  related: [['shapes_early:measure_nonstandard', {}, 'measuring a length with cubes or paper clips (Y1.B7.S2, the next idea in Kindergarten)']],
  note: 'Support lesson (enrich-native, source Reception "Growing 6, 7, 8"); nearest WRM steps R.B10.S1-S4 Explore and compare length and height. compare_objects {task:length} and {task:height} ask which of two is longer, shorter, taller or shorter; order_objects_length {tiles:3} orders three objects shortest to longest: the compare and the order the title names. Pre-skills are few: Reception\'s length and height steps are this lesson itself, and compare_objects {} (R.B2.S1 Compare size) deals length and height too, so it is not a pre; only comparing amounts and comparing mass come before it.',
});
// above-grade core titles in the Grade 1 money block (site flag above, no week: judged at W38, after the money block W32-W34)
lesson(G1 + 'countmoneynotesandcoinsusdollarscents', {
  direct: [['measurement:money_count', { currency: 'usd', kind: 'both' }]],
  verdict: 'full',
  pre: [['measurement:money_count', { currency: 'usd', kind: 'like' }, 'Y2.B4.S1', 'counting coins of one kind'],
        ['measurement:money_count', { currency: 'usd', kind: 'note' }, 'Y2.B4.S2', 'counting bills'],
        ['measurement:coin_value', { currency: 'usd' }, 'Y1.B13.S2', 'the value of each coin'],
        ['multiplication:count_by_tables', ZR(2, 5, 10), 'Y2.B1.S15', 'counting in 2s, 5s and 10s from 0 (the count used for 5-cent and 10-cent coins)']],
  related: [['measurement:equiv_coin_sets', { currency: 'usd' }, 'do these coins make the amount? The same total checked another way (Y2.B4.S5)']],
  note: 'Above-grade core title (site flag above, 2.MD.C.8); the pacing reviews it as Y2.B4.S2 (the same block and step, retitled). money_count {kind:both} counts the bills and then the coins and writes both numbers ($50 and 36 cents), which is the lesson.',
});
lesson(G1 + 'findthetotalusdollarscents', {
  direct: [['measurement:money', { currency: 'usd', step: 5, band: 500 }]],
  verdict: 'full',
  pre: [['measurement:money_count', { currency: 'usd', kind: 'both' }, 'Y2.B4.S3', 'counting bills and coins: an amount in dollars and cents'],
        ['addition:add_100_no_regroup', {}, 'Y2.B2.S15', 'adding two 2-digit numbers, not across a 10 (used for the cents column)'],
        ['addition:add_100_regroup', {}, 'Y2.B2.S16', 'adding across a 10']],
  related: [['measurement:money_change', { currency: 'usd', step: 100, paid: 'note', band: 2000 }, 'finding the change from a bill: the next money calculation (Y2.B4.S9)']],
  note: 'Above-grade core title (site flag above; the site says "auto-matched by keyword scan; verify"). Read as adding two prices to find the total cost: money {step:5, band:500} adds two prices in dollars and cents to $5 ($3.60 + $1.00 = $4.60) in a money column, which is 2.MD.C.8 within 1.NBT.C.4\'s sizes.',
});
lesson(G1 + 'selectmoneyusdollarscents', {
  partial: [['measurement:make_change_least_coins', { currency: 'usd' }, 'chooses the fewest coins for an amount to 50 cents and writes how many of each; never chooses bills, and never any set that makes the amount']],
  verdict: 'partial', missing: 'choosing bills and coins to make an amount in dollars and cents, any way that works ($35 = $20 + $10 + $5)',
  build: ['make_amount_notes'],
  pre: [['measurement:money_count', { currency: 'usd', kind: 'both' }, 'Y2.B4.S3', 'counting bills and coins'],
        ['measurement:coin_value', { currency: 'usd' }, 'Y1.B13.S2', 'the value of each coin'],
        ['measurement:equiv_coin_sets', { currency: 'usd' }, 'Y2.B4.S5', 'checking that a set of coins makes the amount']],
  related: [['measurement:money_compare', {}, 'which set has more money: the same amounts compared (Y2.B4.S6)']],
  note: 'Above-grade core title (site flag above, 2.MD.C.8); nearest WRM step Y2.B4.S4 Choose notes and coins, partial for the same reason.',
});

// ───────────────────────── Y3 (school Grade 2) ─────────────────────────
const G2 = 'G2|-|';
lesson(G2 + 'readandwritenumbersto1000inwordsnumeralsandexpandedform', {
  direct: [['composing:number_word_form', { wordform: ['to_words', 'to_number'], range: 1000 }], ['placevalue:expand', { band: 999 }]],
  verdict: 'full',
  pre: [['composing:number_word_form', { wordform: ['to_words', 'to_number'], range: 100 }, 'Y2.B1.S6', 'numbers to 100 in words and numerals, the same task lower'],
        ['placevalue:expand', { band: 99 }, 'Y3.B1.S2', 'expanded form to 100 (45 = 40 + 5)'],
        ['composing:base10_build_hundreds', {}, 'Y3.B1.S5', 'hundreds, tens and ones in blocks to 1,000'],
        ['placevalue:unit_form', { band: 999 }, 'Y3.B1.S6', 'hundreds, tens and ones written in unit form']],
  related: [['placevalue:number_word_names', { band: 999 }, 'choosing the word name of a number to 1,000: the same reading as a choice']],
  note: 'Domain-test build lesson (W02, NBT unit). number_word_form both ways to 1,000 (491 = four hundred ninety-one; fifty-four = 54) and expand {band:999} (578 = 500 + 70 + 8) deal all three forms 2.NBT.A.3 names.',
});
lesson(G2 + 'adduptofourtwodigitnumbers', {
  direct: [['addition:add_column_multi', {}]],
  verdict: 'full',
  pre: [['addition:add_three', {}, 'Y2.B2.S7', 'adding three 1-digit numbers'],
        ['addition:add_1k_regroup', {}, 'Y3.B2.S13', 'column addition of two numbers across a 10'],
        ['addition:add_1k_no_regroup', {}, 'Y3.B2.S11', 'column addition of two numbers, no exchange'],
        ['composing:make_ten', {}, 'Y2.B2.S1', 'bonds to 10: two ones that make a ten are added first']],
  related: [['addition:add_100_regroup', {}, 'two 2-digit numbers across a 10 (Grade 1): the same column with two addends']],
  note: 'Awsaj supplement lesson in Y3.B2 (Addition and subtraction), W09; closes 2.NBT.B.6. add_column_multi adds three or four numbers, mostly 2-digit (61 + 48 + 59 + 91), in columns with exchanges.',
});
lesson(G2 + 'solveonestepwordproblemsusingbarmodels', {
  partial: [['addition:add_wp_100', BAR, 'adding-to and putting-together stories within 100 with the total unknown, each on a bar; never the change or the start unknown'],
            ['subtraction:sub_wp_100', BAR, 'taking-from stories within 100 with the result unknown on a bar; never a compare story']],
  verdict: 'partial', missing: 'stories within 100 with the change or the start unknown and compare stories with the smaller amount unknown, each drawn on a bar model',
  build: ['map_change_unknown_story', 'map_compare_smaller_unknown'],
  pre: [['addition:add_wp_100', {}, 'Y2.B2.S19', 'the same stories with no bar'],
        ['subtraction:sub_wp_100', {}, 'Y2.B2.S19', 'take-away stories within 100 with no bar'],
        ['addition:add_100_no_regroup', {}, 'Y2.B2.S15', 'adding two 2-digit numbers (the addition used in the stories)'],
        ['subtraction:sub_100_no_regroup', {}, 'Y2.B2.S17', 'subtracting two 2-digit numbers (the subtraction used in the stories)']],
  related: [['algebra:tape_diagram', { band: 50 }, 'bar models of joining, taking away and "how many more does she need?" within 50, the bar drawn for the pupil'],
            ['addition:comparison_word', { range: 100 }, 'how many more / fewer stories within 100: the compare stories this lesson adds']],
  note: 'Awsaj supplement lesson in Y3.B2, W09 and W10; closes 2.OA.A.1 (one-step). The word-work cell with support "bar" draws the bar under the story.',
});
lesson(G2 + 'solvetwostepwordproblemsidentifyingbothoperations', {
  direct: [['algebra:multi_step_word', { forms: [0, 1], band: 50 }]],
  verdict: 'full',
  pre: [['addition:add_wp_100', {}, 'Y2.B2.S19', 'one-step stories within 100, adding'],
        ['subtraction:sub_wp_100', {}, 'Y2.B2.S19', 'one-step stories within 100, taking away'],
        ['addition:add_100_no_regroup', {}, 'Y2.B2.S15', 'adding two 2-digit numbers (the addition used in each step)'],
        ['subtraction:sub_100_no_regroup', {}, 'Y2.B2.S17', 'subtracting two 2-digit numbers (the subtraction used in each step)']],
  related: [['algebra:tape_diagram', { band: 50 }, 'a bar model for one step of the story']],
  note: 'Awsaj supplement lesson in Y3.B2, W09 and W10; closes 2.OA.A.1 (two-step). multi_step_word {forms:[0,1]} deals stories that add then subtract or subtract then add (33 − 8 = 25, 25 + 20 = 45), and the cell asks the pupil to circle + or − for Step 1 and Step 2: both operations identified. band 50 keeps the numbers inside Grade 2.',
});
lesson(G2 + 'oddandevennumbers', {
  partial: [['composing:odd_even', {}, 'says or circles whether a number is odd or even; never writes an even number as the sum of two equal addends (8 = 4 + 4)'],
            ['composing:select_even_odd', {}, 'clicks every odd or every even number in a set; never pairs objects']],
  verdict: 'partial', missing: 'deciding odd or even by pairing objects or counting in 2s, and writing an even number as the sum of two equal addends (2.OA.C.3)',
  build: ['odd_even_pairs'],
  pre: [['multiplication:count_by_tables', ZR(2), 'Y2.B5.S9', 'counting in 2s from 0: the even numbers'],
        ['multiplication:mult_facts', { constant: [2] }, 'Y2.B5.S9', 'the 2 times-table'],
        ['patterns:double', { band: 20 }, 'Y2.B5.S11', 'doubles to 20: an even number is a double'],
        ['multiplication:arrays_groups', { forms: [1] }, 'Y2.B5.S3', 'adding equal groups: an even number as two equal groups']],
  related: [['multiplication:arrays_groups', { forms: [0] }, 'two equal rows of an array (Y3.B3.S2): an even number as two equal rows']],
  note: 'Awsaj supplement lesson in Y3.B3 (Multiplication and division), W12 and W13; closes 2.OA.C.3. Y2.B5.S12 Odd and even numbers (Grade 1) is full with the same two skills; the equal-addends half of 2.OA.C.3 is the gap.',
});
lesson(G2 + 'addandsubtractwithin100onanumberlinejumpsoftensandones', {
  partial: [['addition:number_line_add', {}, 'adds on a 0-20 line with one jump of ones (14 + 4); never within 100, never jumps of ten'],
            ['subtraction:number_line_sub', {}, 'subtracts on a 0-20 line with one jump of ones (16 − 7); never within 100, never jumps of ten']],
  verdict: 'partial', missing: 'adding and subtracting within 100 on a number line by jumping the tens and then the ones (34 + 23: 44, 54, 57)',
  build: ['nl_tens_ones_jumps'],
  pre: [['number_sense:place_on_number_line', { span: 10, band: 100 }, 'Y2.B1.S10', 'tens and ones on the number line to 100'],
        ['addition:add_sub_10s', {}, 'Y3.B2.S3', 'adding and subtracting 10s: each ten jump'],
        ['placevalue:more_less_10', { step: 10 }, 'Y2.B2.S13', '10 more and 10 less on a 2-digit number: one jump of ten'],
        ['addition:add_100_no_regroup', {}, 'Y2.B2.S15', 'the same additions within 100 in columns']],
  related: [['number_sense:place_on_number_line', { span: 100, band: 1000 }, 'the number line to 1,000 in hundreds: the same line, further (Y3.B1.S10)']],
  note: 'Domain-test build lesson (W13, MD unit; 2.MD.B.6 with 2.NBT.B.5).',
});
lesson(G2 + 'compareunitsinchesfeetyardsandcentimetres', {
  customaryOk: 'the school teaches inches and feet in these W17-W19 Awsaj measurement lessons (2.MD.A.2, A.3, B.5, D.9); the xlsx Grade 2 sheet has no customary step, so the inch ruler is this unit\'s own content',
  verdict: 'gap', missing: 'measuring one length in two units (inches and centimetres, feet and yards) and saying the bigger unit gives the smaller number',
  build: ['measure_two_units'],
  pre: [['measurement:reading_ruler', {}, 'Y3.B5.S2', 'reading a length in whole inches on a ruler'],
        ['shapes_early:measure_nonstandard', {}, 'Y1.B7.S2', 'measuring a length with cubes and paper clips: two units give two counts'],
        ['measurement:length_metric', { forms: [1] }, 'Y3.B5.S5', 'metres and centimetres: 1 m is 100 cm, a big unit and a small one']],
  related: [['measurement:estimate_length', { forms: [0] }, 'estimating a length in cm or m from a benchmark: the metric units of the comparison']],
  note: 'Domain-test build lesson (W17, MD unit; 2.MD.A.2 with 2.MD.A.3). No skill measures one object in two units.',
});
lesson(G2 + 'measureandestimateininchesandfeet', {
  customaryOk: 'the school teaches inches and feet in these W17-W19 Awsaj measurement lessons (2.MD.A.2, A.3, B.5, D.9); the xlsx Grade 2 sheet has no customary step, so the inch ruler is this unit\'s own content',
  partial: [['measurement:reading_ruler', {}, 'reads a length in whole inches on an inch ruler; never feet, and never an estimate']],
  verdict: 'partial', missing: 'estimating lengths in inches and feet and measuring in feet',
  build: ['estimate_inches_feet'],
  pre: [['shapes_early:measure_nonstandard', {}, 'Y1.B7.S2', 'measuring with cubes and paper clips, units laid end to end'],
        ['number_sense:place_on_number_line', { span: 10, band: 100 }, 'Y2.B1.S9', 'a number line marked in equal steps (used for reading a ruler)'],
        ['shapes_early:order_objects_length', {}, 'Y1.B7.S1', 'ordering objects by length: which is longer before how long']],
  related: [['measurement:reading_ruler_hard', {}, 'reading an inch ruler to the half and quarter inch: the next ruler (Grade 3)']],
  note: 'Awsaj supplement lesson in Y3.B5 (Length and height), W17; closes 2.MD.A.3 for customary units.',
});
lesson(G2 + 'measurelengthsofasetofobjectstothenearestwholeunit', {
  customaryOk: 'the school teaches inches and feet in these W17-W19 Awsaj measurement lessons (2.MD.A.2, A.3, B.5, D.9); the xlsx Grade 2 sheet has no customary step, so the inch ruler is this unit\'s own content',
  partial: [['measurement:reading_ruler', {}, 'reads one object\'s length in whole inches on a ruler; never measures a set of objects to make a list of measurements']],
  verdict: 'partial', missing: 'measuring several objects to the nearest whole unit and listing the measurements as data',
  build: ['make_line_plot'],
  pre: [['shapes_early:measure_nonstandard', {}, 'Y1.B7.S2', 'measuring a length with units end to end'],
        ['shapes_early:order_objects_length', {}, 'Y1.B7.S1', 'ordering objects by length'],
        ['number_sense:place_on_number_line', { span: 10, band: 100 }, 'Y2.B1.S9', 'a number line marked in equal steps (used for reading a ruler)']],
  related: [['graphs:line_plot_g2', {}, 'reading a line plot of whole-number data: where the measurements go next']],
  note: 'Awsaj supplement lesson in Y3.B5, W17 and W18; the first of the three 2.MD.D.9 lessons (measure, record in a table, show on a line plot). make_line_plot measures pictured objects with a ruler before plotting them.',
});
lesson(G2 + 'recordthemeasurementdatainatable', {
  customaryOk: 'the school teaches inches and feet in these W17-W19 Awsaj measurement lessons (2.MD.A.2, A.3, B.5, D.9); the xlsx Grade 2 sheet has no customary step, so the inch ruler is this unit\'s own content',
  verdict: 'gap', missing: 'recording measurements in a table and reading it (object, length in inches)',
  build: ['table_data'],
  pre: [['graphs:tally_chart', { most: 10 }, 'Y2.B10.S1', 'a tally chart: data in rows'],
        ['measurement:reading_ruler', {}, 'Y3.B5.S2', 'one length read in whole inches'],
        ['graphs:pictograph', { range: 50, scale: [0, 1, 2] }, 'Y2.B10.S7', 'reading a picture graph with a key of 2, 5 or 10']],
  related: [['graphs:line_plot_g2', {}, 'the same data shown on a line plot (the next lesson)']],
  note: 'Awsaj supplement lesson in Y3.B5, W17 and W18 (2.MD.D.9). No skill makes or reads a table of measurements; Y2.B10.S2 Tables (Grade 1) is a gap for the same reason.',
});
lesson(G2 + 'showmeasurementdataonalineplot', {
  customaryOk: 'the school teaches inches and feet in these W17-W19 Awsaj measurement lessons (2.MD.A.2, A.3, B.5, D.9); the xlsx Grade 2 sheet has no customary step, so the inch ruler is this unit\'s own content',
  partial: [['graphs:line_plot_g2', {}, 'reads a line plot of whole-number data (how many wear size 3?); never makes the plot from a list of measurements']],
  verdict: 'partial', missing: 'making a line plot from measured lengths (marking an X above each length on a scale of whole units)',
  build: ['make_line_plot'],
  pre: [['graphs:tally_chart', { most: 10 }, 'Y2.B10.S1', 'counting data into a tally chart'],
        ['number_sense:place_on_number_line', { span: 10, band: 100 }, 'Y2.B1.S9', 'a number line in equal steps (used for the scale of a line plot)'],
        ['graphs:pictograph', { range: 50, scale: [0, 1, 2] }, 'Y2.B10.S7', 'reading a picture graph with a key of 2, 5 or 10']],
  related: [['measurement:bar_graph_intro', {}, 'the same counts shown as a bar chart (Y3.B12.S3)']],
  note: 'Awsaj supplement lesson in Y3.B5, W18 (2.MD.D.9).',
});
lesson(G2 + 'solvelongerbyproblemsusingbarmodels', {
  customaryOk: 'the school teaches inches and feet in these W17-W19 Awsaj measurement lessons (2.MD.A.2, A.3, B.5, D.9); the xlsx Grade 2 sheet has no customary step, so the inch ruler is this unit\'s own content',
  verdict: 'gap', missing: 'stories that compare two lengths in the same unit (how much longer?) solved with a bar model, within 100',
  build: ['add_sub_lengths'],
  pre: [['addition:comparison_word', { range: 10 }, 'Y1.B5.S8', 'how many more / fewer stories within 10: finding the difference'],
        ['subtraction:sub_wp_100', {}, 'Y2.B2.S19', 'take-away stories within 100'],
        ['subtraction:sub_1k_no_regroup', {}, 'Y3.B2.S12', 'the subtraction that finds the difference'],
        ['measurement:reading_ruler', {}, 'Y3.B5.S2', 'reading one length in whole inches']],
  related: [['subtraction:sub_wp_100', BAR, 'take-away stories on a bar within 100: the same bar for a subtraction']],
  note: 'Awsaj supplement lesson in Y3.B5, W18 and W19; closes 2.MD.B.5 (comparing lengths). Y3.B5.S7 Compare lengths and S9 Subtract lengths are gaps for the same reason.',
});
lesson(G2 + 'solveshorterbyproblemsusingbarmodels', {
  customaryOk: 'the school teaches inches and feet in these W17-W19 Awsaj measurement lessons (2.MD.A.2, A.3, B.5, D.9); the xlsx Grade 2 sheet has no customary step, so the inch ruler is this unit\'s own content',
  verdict: 'gap', missing: 'stories that compare two lengths in the same unit (how much shorter?) solved with a bar model, within 100',
  build: ['add_sub_lengths'],
  pre: [['addition:comparison_word', { range: 10 }, 'Y1.B5.S8', 'how many more / fewer stories within 10: finding the difference'],
        ['subtraction:sub_wp_100', {}, 'Y2.B2.S19', 'take-away stories within 100'],
        ['subtraction:sub_1k_no_regroup', {}, 'Y3.B2.S12', 'the subtraction that finds the difference'],
        ['measurement:reading_ruler', {}, 'Y3.B5.S2', 'reading one length in whole inches']],
  related: [['subtraction:sub_wp_100', BAR, 'take-away stories on a bar within 100: the same bar for a subtraction']],
  note: 'Awsaj supplement lesson in Y3.B5, W18 and W19; closes 2.MD.B.5 (shorter by). The pair to "longer by": the same bar, the smaller length unknown.',
});
lesson(G2 + 'partitionarectangleintorowsandcolumnsofsquares', {
  partial: [['shapes_early:compose_rect_from_squares', {}, 'drags six unit squares into one 2 × 3 rectangle; never other sizes, and never draws the rows and columns or counts them'],
            ['area_perimeter:area_unit_squares', { forms: [0] }, 'counts the unit squares inside a drawn rectangle or an L-shape; the squares are drawn for the pupil']],
  verdict: 'partial', missing: 'partitioning a rectangle into rows and columns of same-size squares and counting them (3 rows of 4 = 12 squares)',
  build: ['rect_rows_columns'],
  pre: [['multiplication:arrays_groups', { forms: [0] }, 'Y3.B3.S2', 'rows and columns of an array'],
        ['multiplication:repeated_add_to_mult', { band: 36 }, 'Y3.B3.S1', 'equal groups added (4 + 4 + 4): the rows counted'],
        ['shapes_early:partition_shapes', { parts: [0, 2] }, 'Y2.B8.S5', 'a shape cut into equal parts']],
  related: [['area_perimeter:perimeter_grid', {}, 'the squares around the edge of a rectangle on a grid (Y3.B5.S11)']],
  note: 'Domain-test build lesson (W26, G unit; 2.G.A.2).',
});
// Support lessons in Grade 2: judged against their source grade
lesson(G2 + 'comparecapacity1', {
  verdict: 'gap', missing: 'comparing how much two containers hold, with the words full, empty, holds more and holds less',
  build: ['capacity_early'],
  pre: [['comparing:compare_objects', {}, 'R.B2.S1', 'comparing two pictured objects by size'],
        ['comparing:compare_groups', { band: 5, level: [1] }, 'R.B1.S7', 'the compare words more, fewer, the same'],
        ['measurement:heavier_lighter_visual', {}, 'R.B2.S2', 'comparing two objects by mass: the same compare idea']],
  related: [['measurement:mass_volume_liquid', { forms: [0] }, 'reading the millilitres in a cylinder: where comparing capacity leads (Y2.B7.S6)']],
  note: 'Support lesson (enrich-native, source Reception); nearest WRM steps R.B2.S3 / R.B8.S4 Compare capacity, both gaps.',
});
lesson(G2 + 'comparemass1', {
  direct: [['measurement:heavier_lighter_visual', {}]],
  verdict: 'full',
  pre: [['comparing:compare_objects', {}, 'R.B2.S1', 'comparing two pictured objects with the words taller, longer, thicker'],
        ['comparing:compare_groups', { band: 5, level: [1] }, 'R.B1.S7', 'the compare words more, fewer, the same on groups to 5']],
  related: [['comparing:compare_objects', { task: 'length' }, 'comparing two lengths: the same compare words for another measure (R.B10.S2)']],
  note: 'Support lesson (enrich-native, source Reception); nearest WRM step R.B2.S2 Compare mass (Reception Autumn). The same lesson as Grade 1\'s Compare mass (1). Pre-skills are few: only comparing size and comparing amounts come before it in Reception.',
});
lesson(G2 + 'comparemass2', {
  direct: [['measurement:heavier_lighter_visual', {}]],
  verdict: 'full',
  pre: [['comparing:compare_objects', {}, 'R.B2.S1', 'comparing two pictured objects with the words taller, longer, thicker'],
        ['comparing:compare_groups', { band: 5, level: [1] }, 'R.B1.S7', 'the compare words more, fewer, the same on groups to 5']],
  related: [['comparing:compare_objects', { task: 'height' }, 'comparing heights: the same compare words for another measure (R.B10.S4)']],
  note: 'Support lesson (enrich-native, source Reception); nearest WRM step R.B8.S1 Compare mass (Reception Spring). The same lesson as Grade 1\'s Compare mass (2); pre-skills are few for the same reason.',
});
lesson(G2 + 'comparesizemassandcapacityinformally', {
  partial: [['comparing:compare_objects', {}, 'compares two pictured objects by length, height and thickness; never overall size (big, small) and never capacity'],
            ['measurement:heavier_lighter_visual', {}, 'compares mass (which is heavier?) with pictures only']],
  verdict: 'partial', missing: 'comparing overall size (big, small) and comparing capacity (full, empty, holds more)',
  build: ['compare_size', 'capacity_early'],
  pre: [['comparing:compare_groups', { band: 5, level: [1] }, 'R.B1.S7', 'the compare words more, fewer, the same'],
        ['comparing:classify_count', { band: 3, objects: 'pictures' }, 'R.B1.S5', 'looking at pictured objects and grouping the same kind (the same Reception block)']],
  related: [['comparing:compare_objects', { task: 'length' }, 'comparing two lengths (R.B10.S2): the length part of size, by itself']],
  note: 'Support lesson (enrich-native, source Reception); nearest WRM steps R.B2.S1 Compare size (partial), R.B2.S2 Compare mass (full), R.B2.S3 Compare capacity (gap). Pre-skills are few: it is the first Reception measure block.',
});
lesson(G2 + 'countmoneynotesandcoins', {
  direct: [['measurement:money_count', { currency: 'usd', kind: 'both' }]],
  verdict: 'full',
  pre: [['measurement:money_count', { currency: 'usd', kind: 'like' }, 'Y2.B4.S1', 'counting coins of one kind'],
        ['measurement:money_count', { currency: 'usd', kind: 'note' }, 'Y2.B4.S2', 'counting bills'],
        ['measurement:coin_value', { currency: 'usd' }, 'Y1.B13.S2', 'the value of each coin']],
  related: [['measurement:money_notation', { currency: 'usd' }, 'writing the amount with $ and a point: the next step at Grade 2 (Y3.B9.S1)']],
  note: 'Support lesson (enrich-native, source Grade 1 "Money"); nearest WRM step Y2.B4.S3 Count money - pounds and pence (taught in dollars and cents). money_count {kind:both} counts the bills and then the coins and writes both numbers.',
});
lesson(G2 + 'evenandoddfairnotfairshares', {
  partial: [['composing:odd_even', { forms: [2], range: 10 }, 'names the even number among three by its last digit, to 10; never shares an amount between two to see a fair (even) or not fair (odd) share']],
  verdict: 'partial', missing: 'sharing an amount between two and seeing that an even amount shares fairly and an odd amount does not',
  build: ['share_group'],
  pre: [['composing:number_bonds', { band: 10 }, 'R.B11.S7', 'the two parts of a number to 10'],
        ['division:share_into_groups', { band: 12 }, 'R.B16.S4', 'making equal groups of counters'],
        ['number_sense:doubles_near_doubles', { forms: [0] }, 'R.B11.S11', 'doubles (Double it! 5 + 5): an even number is a double (used for a fair share between two)']],
  related: [['composing:select_even_odd', { range: 10 }, 'circling the even or the odd numbers to 10: the same idea on numbers']],
  note: 'Support lesson (enrich-native, source Reception "Find My Pattern"); nearest WRM step R.B16.S5 Even and odd sharing, partial for the same reason.',
});
lesson(G2 + 'findthetotal', {
  direct: [['measurement:money', { currency: 'usd', step: 5, band: 500 }]],
  verdict: 'full',
  pre: [['measurement:money_count', { currency: 'usd', kind: 'both' }, 'Y2.B4.S3', 'counting bills and coins: an amount in dollars and cents'],
        ['addition:add_100_no_regroup', {}, 'Y2.B2.S15', 'adding two 2-digit numbers, not across a 10'],
        ['addition:add_100_regroup', {}, 'Y2.B2.S16', 'adding across a 10']],
  related: [['measurement:money_change', { currency: 'usd', step: 5 }, 'finding the change: the next money calculation at Grade 2 (Y3.B9.S4)']],
  note: 'Support lesson (enrich-native, source Grade 1 "Money"; the site says "auto-matched by keyword scan; verify"). Read as adding two prices to find the total cost, as Grade 1\'s Find the total: money {step:5, band:500} adds two prices in dollars and cents to $5.',
});
lesson(G2 + 'groupequally', {
  direct: [['division:share_into_groups', {}]],
  verdict: 'full',
  pre: [['multiplication:equal_or_unequal_groups', {}, 'Y2.B5.S1', 'telling equal groups from unequal ones'],
        ['multiplication:arrays_groups', { forms: [1] }, 'Y2.B5.S3', 'adding equal groups'],
        ['multiplication:count_by_tables', ZR(2, 5, 10), 'Y2.B1.S15', 'counting in 2s, 5s and 10s from 0: the group sizes counted']],
  related: [['division:div_facts', { constant: [2, 5, 10], band: 100 }, 'dividing by 2, 5 and 10: grouping written as a division (Y2.B5.S10)']],
  note: 'Support lesson (enrich-native, source Grade 1 "Multiplication and Division"); nearest WRM step Y2.B5.S7 Make equal groups - grouping, full with the same skill (There are 24 counters. Make groups of 3.).',
});
lesson(G2 + 'recordresultsusingtallymarksorasimplepicturegraph', {
  partial: [['graphs:tally_chart', { most: 10, forms: [0] }, 'reads one count from a tally chart to 10; never records results as tally marks'],
            ['measurement:pictograph_intro', { forms: [0] }, 'reads one count from a picture graph with a key of 1, to 5; never draws the graph']],
  verdict: 'partial', missing: 'recording results as tally marks and as a simple picture graph (one picture for each)',
  build: ['collect_data'],
  pre: [['comparing:classify_count', { band: 6 }, 'Y1.B1.S1', 'sorting objects and counting each group'],
        ['counting:count_objects', { band: 10 }, 'Y1.B1.S2', 'counting objects to 10'],
        ['patterns:skip_count_line', { step: [0], band: 50 }, 'Y1.B9.S3', 'skip counts of 2, 5 and 10 to 50 (the count used for a full tally of 5)']],
  related: [['graphs:build_pictograph', {}, 'drawing a picture graph one picture for each (Y2.B10.S4, Grade 1): the recording this lesson starts']],
  note: 'Support lesson (enrich-native, source Kindergarten "Classify & Count Objects by Attribute", committee-authored; 2.MD.D.10). Judged at Kindergarten: tallies to 10 and pictures to 5.',
});
lesson(G2 + 'selectmoney', {
  partial: [['measurement:make_change_least_coins', { currency: 'usd' }, 'chooses the fewest coins for an amount to 50 cents and writes how many of each; never chooses bills, and never any set that makes the amount']],
  verdict: 'partial', missing: 'choosing bills and coins to make an amount in dollars and cents, any way that works ($35 = $20 + $10 + $5)',
  build: ['make_amount_notes'],
  pre: [['measurement:money_count', { currency: 'usd', kind: 'both' }, 'Y2.B4.S3', 'counting bills and coins'],
        ['measurement:coin_value', { currency: 'usd' }, 'Y1.B13.S2', 'the value of each coin'],
        ['measurement:equiv_coin_sets', { currency: 'usd' }, 'Y2.B4.S5', 'checking that a set of coins makes the amount']],
  related: [['measurement:money_compare', {}, 'which set has more money: the same amounts compared (Y2.B4.S6)']],
  note: 'Support lesson (enrich-native, source Grade 1 "Money"); nearest WRM step Y2.B4.S4 Choose notes and coins, partial for the same reason.',
});
lesson(G2 + 'shareequally', {
  partial: [['division:share_into_groups', {}, 'makes groups of a given size (24 counters in groups of 3: how many groups?); never shares into a given number of groups (24 shared between 3: how many each?)']],
  verdict: 'partial', missing: 'sharing an amount equally into a given number of groups (12 shared between 3 is 4 each)',
  build: ['share_group'],
  pre: [['multiplication:equal_or_unequal_groups', {}, 'Y2.B5.S1', 'telling equal groups from unequal ones'],
        ['multiplication:arrays_groups', { forms: [1] }, 'Y2.B5.S3', 'adding equal groups'],
        ['patterns:halve', { band: 20 }, 'Y2.B5.S11', 'halving: sharing between two']],
  related: [['division:div_facts', { constant: [2, 5, 10], band: 100 }, 'dividing by 2, 5 and 10: sharing written as a division (Y2.B5.S10)']],
  note: 'Support lesson (enrich-native, source Grade 1 "Multiplication and Division"); nearest WRM step Y2.B5.S8 Make equal groups - sharing, partial for the same reason.',
});
