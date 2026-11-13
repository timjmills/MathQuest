<!-- spec-card
{"card":"two-step","kind":"family","template":"word-work","families":["algebra"],"match":{"templates":["word-work"]},"config":"design/cards/two-step/card.json","indexSha":"73effe13ebc76352471034e3c42b57ce0bfc8389","bodySha":"3230b5563ad993b5","format":2,"configSha":"de8121d70fce"}
{"cited":"AX-3 C1 C2 H1 H5 H13 L1 L3 L6 L11 L-LEAK LR-5 LR-6 RP-70 RP-72 SF-50 SL-4 SP-2","rules":"AK-1 a0cc12 2 d4709f H13 36f579 VQ-1 dea36a 2 f15b47 3 db17cc 4 b89965 5 1fa595 6 cc6e7e 7 2253df 8 6d0278 9 0b5532 10 2ed85c P-WP-1 5dae44 3 61ae2b 4 88f1f4 11 e45960 12 b4e26e 17 5f3c57 18 50d9ea 19 468b08 SF-51 76f24d 54 e3b098 PT-WPR-6 ad3a55 8 5862e3 RP-70 0b60b5 71 55103e 72 b10450 LS-3 62bf3d P-21 ce35dc P-TH-1 9c751a 13 bd13de CL-6 102a92 40 2a6dbb PG-21 1ea272 SL-6 7a1453 11 183e7a SP-1 87c2cc SCC-01 8aa70b P-1 5a3076 7 aa3040 10 256ad3 H1@RUBRIC bf4b29 H2@RUBRIC f5bba0 H3@RUBRIC d7f21f H5@RUBRIC b3892d H6 0722fd 8 44c23b 9 fd82d1 10 fbd802 L1 799b66 3 901e56 4 6538d6 6 6e19d8 10 d2ca35 11 9ebe19 AX-4 2eb6c1 P-3 833e8c C1 66f8a9 2 a51365 SF-50 a0e361 SL-4 911174 SP-2 1f2df0 AX-3 e3ffb9 CL-8 c4e70b DN-10 93c9b7 P-WP-20 868eef 21 f3aa89 22 2b6ca8 23 5c17e3 24 c0df8e PG-12 8e75fd RP-20 8888b0 TY-13 3d0f88 VA-61 841427","entries":"R%3AR-ADDSUB-MAX 4703cf R%3AR-BAND-30 6382a0 R%3AR-BAND-50 9eef8a R%3AR-MULTDIV d69ecb R%3AR-ADDMULT 5f21af R%3AR-ADDDIV 80cf9f D%3Aforms%3D0 972948 D%3Aforms%3D1 972948 D%3Aforms%3D2 972948 D%3Aforms%3D3 972948 D%3AmsOps%3Daddsub bcefeb D%3AmsOps%3Dmult bcefeb D%3AmsOps%3Ddiv bcefeb D%3AmsOps%3Dmultdiv bcefeb D%3AmsOps%3Daddmult bcefeb D%3AmsOps%3Dadddiv bcefeb D%3Aband%3Dnull 972948 D%3Aband%3D30 972948 D%3Aband%3D50 972948 D%3AwpCues%3Dtrue d55128 D%3AwpCues%3Dfalse d55128 D%3AwpBank%3Dtrue d55128 D%3AwpBank%3Dfalse d55128 D%3AwpBar%3Dtrue 972948 D%3AwpBar%3Dfalse 972948 D%3AwpFrames%3Dtrue bcefeb D%3AwpFrames%3Dfalse bcefeb D%3AmsLetter%3Dtrue bcefeb D%3AmsLetter%3Dfalse bcefeb D%3AmsCheck%3Dtrue bcefeb D%3AmsCheck%3Dfalse bcefeb D%3AmsChoose%3Dtrue 972948 D%3AmsChoose%3Dfalse 972948 D%3Acalculator%3Dtrue 04b8b3 D%3Acalculator%3Dfalse 04b8b3 D%3AskipAfter%3D* 04b8b3 D%3Arole%3Aindependent bcefeb D%3Arole%3Amore-practice bcefeb D%3Arole%3Atest bcefeb D%3Arole%3Aopener bcefeb D%3Arole%3Ascripted-model bcefeb D%3Arole%3Aguided bcefeb D%3Arole%3Aerror-analysis bcefeb D%3Arole%3Areview bcefeb D%3Arole%3Apre-skill-check bcefeb D%3Arole%3Amixed-practice bcefeb D%3Arole%3Atrue-false bcefeb D%3Arole%3Areason-it bcefeb D%3Arole%3Astretch bcefeb D%3Arole%3Alesson 972948 D%3Arole%3Aword-problems 11baa8 D%3Arole%3Afact-rows 04b8b3 D%3Arole%3Afact-probe 04b8b3 D%3Ahost%3Apractice-card bcefeb D%3Ahost%3Aonline-worksheet bcefeb D%3Ahost%3Aquiz bcefeb D%3Ahost%3Aboss 11baa8 D%3Ahost%3Arace 11baa8 D%3Ahost%3Amap 11baa8 D%3Ahost%3Amode-dark 11baa8 D%3Ahost%3Amode-bigboard 11baa8"}
-->
<!-- rulings
{"v": 1, "card": "two-step",
"skills": ["algebra:multi_step_word","algebra:multi_step_word_plain","algebra:two_step_add_then_div","algebra:two_step_add_then_mult","algebra:two_step_estimate_check","algebra:two_step_letter_equation","algebra:two_step_mult_div_first"],
"rulings": [
 {"id":"R-ADDSUB-MAX","source":"§9.2 (no band: the Max Number 100 caps the answer)","skills":["algebra:multi_step_word_plain","algebra:multi_step_word","algebra:two_step_estimate_check"],"assert":"range","of":"ans","min":1,"max":100},
 {"id":"R-BAND-30","source":"§9.2 (band 30 caps the answer)","skills":["algebra:multi_step_word_plain"],"opts":{"band":30},"assert":"range","of":"ans","min":1,"max":30},
 {"id":"R-BAND-50","source":"§9.2 (band 50 caps the answer)","skills":["algebra:multi_step_word_plain"],"opts":{"band":50},"assert":"range","of":"ans","min":1,"max":50},
 {"id":"R-MULTDIV","source":"§3 notes (x / ÷ first: answer 1-100)","skills":["algebra:two_step_mult_div_first","algebra:two_step_letter_equation"],"assert":"range","of":"ans","min":1,"max":100},
 {"id":"R-ADDMULT","source":"§3 notes (+ / − first then x: answer <= 60)","skills":["algebra:two_step_add_then_mult"],"assert":"range","of":"ans","min":4,"max":60},
 {"id":"R-ADDDIV","source":"§3 notes (+ / − first then ÷: the quotient a fact, <= 9)","skills":["algebra:two_step_add_then_div"],"assert":"range","of":"ans","min":2,"max":9}
],
"notOffered": [
 {"id":"N-D-wpCues","source":"§7a (decision, PROPOSED: lead ruling 2026-10-31 (P-21); lesson 7 research)","option":"wpCues"},
 {"id":"N-D-wpBank","source":"§7a (decision, PROPOSED: lead ruling 2026-10-31 (P-21); lesson 7 research)","option":"wpBank"}
],
"todo": [
 {"id":"T-5.1","source":"§5.1","text":"Every whole-number word problem is ONE cell type (word-work): story, sign row, column b..."},
 {"id":"T-5.2","source":"§5.2","text":"A distinct option is ALSO a findable skill. Decided for this family in lesson 7 round 2..."},
 {"id":"T-5.3","source":"§5.3","text":"Keyword supports (wpCues, wpBank) are hidden on the sentence-layout story skills: a key..."},
 {"id":"T-5.4","source":"§5.4","text":"The part-whole bar is DRAWN on the teaching pages (scripted model, guided, the lesson c..."},
 {"id":"T-5.5","source":"§5.5","text":"EE for 3.OA.D.8 is M.EE.3.OA.7 (the owner sheet's M.EE.3.OA.8 quotes its text); the she..."},
 {"id":"T-5.6","source":"§5.6","text":"No owner sign-off of skill cards in the lessons-first program: lanes decide from the st..."},
 {"id":"T-5.7","source":"§5.7","text":"'Within N' bounds the answer, never the operands; a skill's NAME is its declaration."},
 {"id":"T-5.8","source":"§5.8","text":"Card signed by the lead under the owner's delegation: decisions 1-12 as recommended, de..."},
 {"id":"T-9.1","source":"§9.1","text":"Accept every option value, role and host decision marked PROPOSED in section 7a?"},
 {"id":"T-9.3","source":"§9.3","text":"Any new preset skill under the 2026-10-17 rule (msOps mult / div alone, msChoose, wpFra..."},
 {"id":"T-9.4","source":"§9.4","text":"Build the two-step bar model (a new graphic: Step 1 bar - equal groups or part-whole - ..."},
 {"id":"T-9.5","source":"§9.5","text":"multi_step_word '(Visual)' and multi_step_word_plain deal identical items. What makes t..."},
 {"id":"T-9.6","source":"§9.6","text":"Print the hidden middle question (P-WP-11 v1: 'How many apples in the bags?' under Step..."},
 {"id":"T-9.7","source":"§9.7","text":"two_step_letter_equation: grade the equation, or only n?"},
 {"id":"T-9.8","source":"§9.8","text":"two_step_estimate_check: what is graded?"},
 {"id":"T-9.9","source":"§9.9","text":"Capacity per page (section 3 notes) before measurement?"},
 {"id":"T-9.10","source":"§9.10","text":"Two new instruction strings 'story-letter' and 'story-estimate'?"},
 {"id":"T-9.11","source":"§9.11","text":"Lesson data for the seven skills (prereqs.js 0/7: the lesson role falls back today). Th..."},
 {"id":"T-9.12","source":"§9.12","text":"WRM tags: the presets have none (no WRM step teaches 3.OA.D.8; lessons-6-7 open question)."}
]
}
-->
# Spec card: Two-step word problems: the `word-work` two-step layouts (columns, frames, letter equation, estimate) and the new two-step bar model

Generated by `node tests/scripts/ws-spec-card.mjs --family two-step` from `design/cards/two-step/card.json` and the repo. Do not edit by hand: edit card.json and regenerate. Builders read this card; critics keep reading the full standards and RUBRIC.

Seven skills on one drawing: algebra:multi_step_word_plain (the host) and its twin multi_step_word, plus the five presets of detailed lesson 7 (two_step_mult_div_first {msOps: multdiv}, two_step_add_then_mult {addmult}, two_step_add_then_div {adddiv}, two_step_letter_equation {multdiv, msLetter}, two_step_estimate_check {msCheck}). A story of at most 5 lines (P-WP-17), then the work: two titled step columns (Step 1 | Step 2, a sign row each, column boxes; the Step 1 answer carried into Step 2) or, faded, one number sentence a step (frames); the letter preset writes ONE equation with n and then n; the estimate preset adds the rounded estimate and a Yes / No 'is my answer close?'. The two-step bar model (new) is drawn on the teaching pages and is the wpBar option on practice pages. Paper, key and the three screen hosts are one drawing.

## 1. What it teaches

3.OA.D.8 (two-step word problems with the four operations; represent them with an equation with a letter for the unknown; assess the answer by mental computation and estimation, rounding), 2.OA.A.1 (+ and − within 100, one- and two-step), 4.OA.A.3 (multistep with whole numbers; the remainder part is the division family's remainder_interpret, not this card). EE M.EE.3.OA.7 (the repo tag; lesson 7 Q1: the owner sheet's M.EE.3.OA.8 quotes M.EE.3.OA.7's text), M.EE.4.OA.3. BUILD lessons served (data/curriculum/ccss-build-lessons.json): #7 G3 W06 'Two-step word problems with the four operations' (3.OA.D.8; detailed lesson g3-oa8-two-step-wp, chunks x-first and ÷-first; follow-on lessons = the presets add-first, letter, estimate); #17 G2 W09 'Solve two-step word problems identifying both operations' (2.OA.A.1; G2-Y3.B2 BUILD: multi_step_word, + / − within 100, a sign row per step); related #39 G3 W17 'add and subtraction word problems within 1,000 using bar models' (3.NBT.A.2 + 3.OA.D.8: the two-step bar model is reused; its main skills are the add / sub story families) and #24 G4 W11 (4.OA.A.3 remainders: division family).

**Skills on this family** (7; listed in card.json + 7 listed):

- **algebra** (7): `multi_step_word`, `multi_step_word_plain`, `two_step_{add_then_div,add_then_mult,estimate_check,letter_equation,mult_div_first}`

**CCSS** (SKILL_STANDARDS of those skills): 2.OA.A.1, 3.OA.D.8, 4.OA.A.3

**Essential Elements:** M.EE.3.OA.7, M.EE.4.OA.3

**WRM small steps** (SKILL_WRM): Y2.B4 S10 (part); Y5.B2 S6; Y5.B5 S6; Y6.B2 S8, S14

## 2. Problem types and progression

*Reached: IXL public skill list (ixl.com/math/word-problems, grade 3 names only: 'Two-step addition and subtraction word problems', 'Two-step multiplication and division word problems', 'Two-step word problems: represent and solve using strip models', 'Two-step mixed operation word problems', 'Two-step word problems: identify reasonable answers', 'Write equations with unknown numbers to represent word problems'); MathWorksheets4Kids public pages (word-problems.php, equation-word-problems.php: two-step EQUATION word problems are grade 6+, write the equation then solve, plus an MCQ 'match the equation' set; the grade 3-4 two-step pages were not found publicly: /two-step.php and /multi-step-word-problems.php are 404; no login this round - a WebFetch cannot hold a session); K5 Learning grade-3 word problems (mixed word problems - mental math / column math / simpler form; mixed + / −; mixed x / ÷; no titled two-step set); Math-Drills 403 (unreachable). Repo research reused: design/lesson-planner/lessons/g3-oa8-two-step-wp/RESEARCH.md (Achieve the Core 3.OA.D.8 mini-assessment, Super Teacher Worksheets 3.OA.8, TES two-step solvers, CazoomMaths with / without clues, Have Fun Teaching match-the-equation). Sequence taken (not pacing): + / − two-step -> x or ÷ first then + / − -> + / − first then x / ÷ (brackets) -> equation with a letter -> reasonable answers by rounding; strip (bar) models as the representation. Where our standards override the sites: no clue text or keyword bolding (P-21), black and white, one story a cell, at most 4 a page, a sign row per step instead of one 'which operation' choice, the A-D choice only as the teacher's msChoose response mode.*

**Problem types**

- addsub (host default, G2 2.OA.A.1): + / − then + / − in the four orders (forms: add then take away, take away then add, add twice, take away twice); column boxes, a sign row per step; numbers to the band
- mult / div / multdiv (= preset two_step_mult_div_first, lesson 7 chunks a / b): a x or ÷ fact within 10 x 10 whose answer feeds a + or − step ('5 bags of 9, 13 more'; '12 shared by 3, each gets 6 more')
- addmult (= preset two_step_add_then_mult): a + or − step first, then x ('each bag has 6 red and 3 blue; 2 bags'): brackets (6 + 3) x 2
- adddiv (= preset two_step_add_then_div): + or − first, then ÷ ('17, keeps 5, shares the rest among 6'): (17 − 5) ÷ 6
- msLetter (= preset two_step_letter_equation): the whole story as ONE equation with n ('5 x 9 + 13 = n', brackets when + / − comes first), then 'n = [ ]'
- msCheck (= preset two_step_estimate_check): work the two steps, round each story number to the nearest ten, write the estimate, ring Yes / No 'is my answer close to the estimate?'
- msChoose (response mode, no preset; lesson 7 r3): x / ÷ first then take away; check one of four answers A-D (the answer and the three two-step errors)
- wpFrames (fade): one number sentence a step 'Step 1: [ ] ( ) [ ] = [ ]' instead of the column boxes - the exit slip / Prerequisite Check form
- wpBar (NEW drawing, PROPOSED Q4): the two-step bar model under the story - Step 1 bar (equal groups or part-whole), Step 2 bar whose whole or part is the Step 1 answer; labels blank

**Progression** (one new thing per step, P-1)

1. 1 G2: add then take away, answers to 30 (band 30), two step columns with sign rows, bar model on the teaching pages -> 2 all four + / − orders mixed (forms) -> 3 answers to 50 -> 4 answers to 100 (one change a step: the order kind OR the number size)
2. 5 G3: x first then + / − (msOps mult) -> 6 ÷ first (div) -> 7 x or ÷ first mixed (multdiv = two_step_mult_div_first) -> 8 + / − first then x (addmult) -> 9 + / − first then ÷ (adddiv) -> 10 one equation with a letter, x / ÷ first (two_step_letter_equation) -> 11 the letter with brackets (msLetter + addmult / adddiv) -> 12 estimate to check (two_step_estimate_check, + / − stories to 100)
3. Fade within each step (P-1: the scaffold changes alone, never with the content): bar model drawn (teaching pages) -> bar off, column boxes (independent) -> frames (wpFrames: the pupil still produces every number and sign); the printed middle question (P-WP-11 v1, PROPOSED Q6) and the grey Step 1 sign trace are hints that go first; the two titled step columns, the sign rows, the answer row with its unit bank are structural and stay
4. G4 4.OA.A.3 continues on the division family (remainder_interpret) and on the build entry multi_step_four_ops (G4-Y5.B3, G5-Y6.B2 parts not on this card)

**Build-list entries on this template** (standards, ladder and full spec of each in `design/BUILD_LIST.md`)

- `add_or_mult` (new) Add or Multiply? — host `algebra:add_or_multiply`
- `add_sub_lengths` (new) Add and Subtract Lengths — host `measurement:add_subtract_lengths`
- `add_three_forms` (option) Add Three Numbers: Stories and Make a Ten First — host `addition:add_three`
- `compare_calcs` (new) Compare Calculations — host `algebra:compare_calculations`
- `compare_sentences` (new) Compare Number Sentences — host `algebra:compare_number_sentences`
- `dec_context` (option) Multiply and Divide Decimals in Context — host `decimals:mult_decimal`
- `div_frac_frac` (new) Divide Fractions by Fractions — host `fraction_operations:div_frac_frac`
- `elapsed_stories` (option) Time Word Problems — host `measurement:elapsed_mixed`
- `equiv_expressions` (option) Equivalent Expressions? — host `algebra:combine_like_terms`
- `formulae` (new) Formulae — host `algebra:use_formulae`
- `frac_amount_wp` (new) Fraction of an Amount Problems — host `fractions:fraction_of_amount_problems`
- `frac_find_whole` (option) Fraction of an Amount: Find the Whole — host `fractions:fraction_of_set_hard_nv`
- `frac_multistep` (new) Multi-Step Fraction Problems — host `fraction_operations:fraction_multi_step_problems`
- `frac_wp_unlike` (option) Fraction Word Problems With Unlike Denominators — host `fraction_operations:frac_word_problems`
- `function_machine` (new) Function Machines — host `algebra:function_machines`
- `inequality_write_graph` (option) Write and Graph Inequalities — host `algebra:inequalities`
- `length_ops` (new) Length Word Problems — host `measurement:length_word_problems`
- `mass_ops` (new) Mass and Capacity Word Problems — host `measurement:mass_capacity_word_problems`
- `metric_calc` (new) Calculate with Metric Measures — host `measurement:metric_measure_problems`
- `money_2step` (new) Two-Step Money Problems — host `measurement:money_two_step`
- `money_estimate` (new) Estimate with Money — host `measurement:estimate_with_money`
- `mult_mixed_int` (option) Multiply a Mixed Number by an Integer — host `fraction_operations:mult_frac_whole`
- `multi_step_four_ops` (option) Two-Step Problems With All Four Operations — host `algebra:multi_step_word`
- `pairs_values` (new) Pairs of Values and Two Unknowns — host `algebra:pairs_of_values`
- `parts_of_expression` (new) Parts of an Expression — host `algebra:parts_of_expression`
- `percent_multi` (option) Percentages: Multi-Step and Missing Values — host `conversions:percent_of_number`
- `ratio_problems` (new) Ratio and Proportion Problems — host `conversions:ratio_problems_bar`
- `two_variables` (new) Two Quantities That Change Together — host `algebra:two_variable_relationships`
- `vis_bar_family` (template) The Bar-Model Family (every WRM bar) — host `division:share_into_groups`
- `vis_puzzle_grids` (template) Total Grids and Number Pyramids — host `algebra:solve_unknown`
- `vis_word_pictures` (option) Pictures on Word Problems — host `addition:add_wp_100`
- `write_numeric_expression` (option) Write Number Expressions — host `algebra:write_expression`

## 3. The drawing

Template `word-work` — `js/modules/sheet/cells/word-work.js`; also A COPY on the live `word-work` drawing (owner ruling 2026-09-25: one cell type for every whole-number story; owned by the visual-quality lane, ask the lead before changing it): its two-step `columns` blocks (Step 1 | Step 2, each with its own sign row; tellTwoStep retells the story) and its `frames` layout (wpFrames; msLetter = one equation with n; msCheck = the estimate rows). ONE NEW PART: the two-step bar model (a new graphic-library entry beside graphics/part-whole-bar.js; today wpBar draws nothing on a two-step story, `bar: !!o.bar && steps.length === 1`), so the first build of that part runs at medium. Generator: gen-algebraic.js `multi_step_word` (msOps / msChoose blocks and the four + / − archetypes); post-step js/modules/word-work.js (TWO_STEP); provider js/modules/sheet/providers/word-work.js (moves, ms-* wrong answers, iCan); detailed lesson js/modules/lessons/detailed/g3-oa8-two-step-wp.js. screen-cell.js / wordWorkTwin draw the same cell on the practice card, online worksheet and quiz.

**Sizes S / M / L:** Story at the cell-text size + 2 (13 / 15 / 17 pt S / M / L; WDS row 'Cell text the pupil must read' 11 / 13 / 15 + 2, P-WP-17 one sentence a line, at most 5 lines); work digits at the working digit size (ctx.metrics digitPt; 16 / 22 / 28 pt); work and answer boxes the answer-area boxes 14 x 11 / 14.3 x 13 / 17 x 15 mm (2 digits; wider by blankWidth for 3), the answer box 1.5 pt, working boxes 1 pt, sign circles 9 / 11 / 13 mm 1 pt; the two step columns split by a 1.5 pt vertical rule (WDS 11.9 Two-step), each headed 'Step 1' / 'Step 2' at text size bold. Two-step bar model (new): bars 10 / 12 / 14 mm tall, 1.5 pt outline (RP-70), schematic and fixed (RP-72: equal groups = n equal segments, at most 6 drawn; part-whole = 60 / 40), label boxes 0.75 pt writing places, exactly one '?' unknown per bar (LS-3), never dashed.

- Answer slots (VQ-2 one answer place per answer): columns - ONE graded slot, the Step 2 bottom row (the quotient row of ÷) in heavier boxes, the unit line beside it with a three-word bank (P-TH-1); the Step 1 result, both sign rows and every work box are working places (data-ws-graded=0 on paper, input.mq-wwork with data-mq-expect on screen, marked as typed, never scored). frames - the last step's result box graded, the unit word PRINTED. letter (PROPOSED Q7) - TWO graded answers: the equation (both sign circles and the three number boxes, one 'equation' answer) and n. estimate (PROPOSED Q8) - two graded answers: the answer and the estimate; the Yes / No ring is ungraded reflection (the key rings it). msChoose - one graded choice A-D (ring on paper, buttons on screen).
- Key (AK-1): the same cell finished - both signs ringed, every number, the Step 1 result, the answer and its unit; letter: the equation and n; estimate: the rounded numbers, the estimate, Yes ringed; bar model: every label written.
- Two-step bar model payload (new, PROPOSED Q4): {bar2: {s1: {kind: 'groups'|'whole', parts, whole}, s2: {kind: 'whole'|'compare', a, b, whole}, carry: 'whole'|'part'}}; the Step 1 bar's total box and the Step 2 bar's carried box are joined by a 0.75 pt arrow labelled 'Step 1 answer' at zone-label size; never proportional, so the length never shows which number is bigger.
- Screen twin (wordWorkTwin): the same drawing in --mq-k2 px, the step columns stacked on a phone card (Step 1 above Step 2, no vertical rule), sign rows as 44 px buttons, work boxes typed with live marks, the answer the host's own digit boxes (data-mq-cell). No paper production turns into a choice on screen (msChoose is a choice on both).
- Capacity (PROPOSED Q9, measured at build by ws-options-verify --render; content never shrinks): columns one across, S 3 / M 2 / L 2 a page; frames S 4 / M 4 / L 2; letter and estimate frames S 4 / M 3 / L 2; with the bar model (adds a drawing; the bar above the column work) S 2 / M 1 / L 1 (lead ruling R1 2026-11-13 (a): measured S 2 / M 1 / L 1; a bar beside the column work cannot reach M 2 (probe, widest of 200 stories at M: bar across 132.3 x 29.8 mm, stacked 62.5 x 61.6 mm, the two step columns 107 mm wide and 53.7 mm tall, the story 27.5 mm - side by side needs 181-247 mm of a 174 mm row and a 102 mm cell, over 93 mm); M holds 1 as a ruled pin and the one-story practice page must not stretch its row (a role change, lf-roles); check ws-two-step --print CAP-BAND); msChoose S 4 / M 4 / L 2. WDS 12.1: 'Word problem v2 (faded)' 2 a page, plain rows 4 / 3 / 3 - research fits 6-10, we do not.
- 'Within N' bounds the ANSWER and every computed number (PROPOSED Q2): band N caps the Step 1 result and the answer (the sum, the number taken from, the product, the dividend); story numbers are below it. With no band the Max Number is that cap. x / ÷ first: a fixed facts domain (factors 2-6 by 2-9, dividend <= 54), Step 2 number 2-20, answer 1-100, the Max Number does not apply. + / − first then x / ÷: the bracket sum 4-10 (x) or a multiple of the divisor <= 54 (÷), answer <= 60 / <= 9.
- Item guards (all msOps): the Step 2 number is no Step 1 number; the answer is no story number and not the Step 1 answer (today ~0.7 % of addsub items break this: build fixes); Step 2 never cancels Step 1; no remainders; a take-away never leaves 0.
- Lesson routine (BUILD #7, lesson 7 data): Read it. What do I find first? / Step 1: groups or share. x or ÷. / Step 2: use my Step 1 answer. / Write the answer and the unit. Chants 'First the groups. Then the change.' (chunk a) and 'First the share. Then the change.' (chunk b). Follow-on lessons (presets): add first - 'Step 1: add or take away. Step 2: share or make groups.' (re-signed 2026-11-13: the add-first presets deal a take-away first too, and one step list must fit every item so the page's Steps band is the preset's own - ws-node-lint STEPS-FOLLOW-PRESET, critic r1 F6 / L28); letter - 'Write one equation. n is the answer.'; estimate - 'Round. Estimate. Is my answer close?'. BUILD #17 (G2, PROPOSED Q11): Read it. What happens first? / Step 1: circle the sign. Solve. / Step 2: use my Step 1 answer. / Write the answer and the unit. Chant 'First this. Then that.'
- Say frames (the model's Say: band, oral, never written in a cell - VQ-ONEANSWER): 'First I find ___. Then I ___.' / 'The answer is __ __.' (columns, frames); 'My equation is __. n is __.' (letter); 'About __. My answer __ is close.' (estimate); G2: 'First I add. Then I take away. I have __ __ now.'
- Instruction strings (contract.js library): story-work 'Circle the sign. Write the numbers in the boxes. Solve.' (columns), story-work-ring (frames), story-rcdws (P5 lesson page); NEW strings PROPOSED Q10: 'story-letter' 'Write one equation with n. Then find n.' and 'story-estimate' 'Solve. Then estimate. Is your answer close?' (at most 8 words each).

## 4. Rules that apply

From the rule-id index (`design/cards/rule-index.json`, sha `73effe13ebc7`). An id written `ID@SRC` is defined in more than one standard.

### 4a. Core rules — apply every one (3 rules; ✱ = quoted in full, the rest cut at a sentence)

**Key and the one answer place (quoted)**

- **AK-1** (WDS) Every generated page has an answer key, and the key is a **facsimile**: the same page, same paper, same cells, same labels, same geometry, with answers overlaid in the pupil's answer slots. A teacher marks by position.
- **AK-2** (WDS) Answers are Andika **700**, black, at the slot's working size, placed exactly where a pupil would write. Working is shown where the page teaches it: regroup digits in carry boxes (on EVERY key - practice, mixed, independent - over VA-13's scratch rule, owner ruling 2026-09-25), partial products, division work rows, quotient and remainder, hands drawn on clocks, shaded parts shaded, plotted points …
- **H13** (RUBRIC) Wasted space inside cells (owner ruling 2026-09-25): a cell whose content leaves an empty band of ≥ 30 % of the cell's height (or width), or a row/section of a mixed sheet sized for a taller item than it holds. Measure it; do not eyeball it past. — C3 ≤ 6

### 4b. Also applies — ids only (72 rules)

Each id's full text is in `design/cards/rule-index.json` (look it up by id) and in the standard it names; open it when the rule is in play. Grouped by the heading that defines them:

- WDS · 2.3 Grid sizing — `PG-12`
- WDS · 2.4 Pagination — `PG-21`
- WDS · 3.2 Size table — `TY-13`
- WDS · 5. Line-style and corner semantics — `LS-3`
- WDS · 6.1 Blank width function — `SL-4` `SL-6` `SL-11`
- WDS · 7.1 Cell construction — `CL-6` `CL-8`
- WDS · 7.4 Keep-out and label options — `CL-40`
- WDS · 10.7 US long-division bracket and … — `VA-61`
- WDS · 11.4 Counters and counting pictures — `RP-20`
- WDS · 11.9 Schema diagrams — `RP-70` `RP-71` `RP-72`
- WDS · 12.2 The column x size rule — `DN-10`
- WDS · 13.5 Word-problem scaffolds — `SF-50` `SF-51` `SF-54`
- WDS · 15.1 What must match — `SP-1` `SP-2`
- WDS · 16. Accessibility — `AX-3` `AX-4`
- WDS · 18. Visual quality bar — `VQ-1` `VQ-2` `VQ-3` `VQ-4` `VQ-5` `VQ-6` `VQ-7` `VQ-8` `VQ-9` `VQ-10`
- PED · 8.3 Unknown positions and language — `P-WP-1` `P-WP-3` `P-WP-4`
- PED · 8.4 Versions — `P-WP-11` `P-WP-12`
- PED · 8.6 Generating original, neutral … — `P-WP-17` `P-WP-18` `P-WP-19` `P-WP-20` `P-WP-21` `P-WP-22` `P-WP-23` `P-WP-24`
- PED · 9. Thinking pages — `P-TH-1`
- PED · 9.3 True or False? — `P-TH-13`
- PED · Application, review, assessment — `P-21`
- PED · Sequencing — `P-1` `P-3` `P-7` `P-10`
- PAGE · 3.7 Word problems — `PT-WPR-6` `PT-WPR-8`
- SCC · 0.4 Module map and layers — `SCC-01`
- RUBRIC · 2. The four criteria — `C1` `C2`
- RUBRIC · 4. Hard caps — `H1@RUBRIC` `H2@RUBRIC` `H3@RUBRIC` `H5@RUBRIC` `H6` `H8` `H9` `H10`
- LL · The recurring failure classes — `L1` `L3` `L4` `L6` `L10` `L11`

## 5. Owner rulings

- **2026-09-25** — Every whole-number word problem is ONE cell type (word-work): story, sign row, column boxes, the answer written once. (`owner ruling (js/modules/word-work.js header)`)
- **2026-10-17** — A distinct option is ALSO a findable skill. Decided for this family in lesson 7 round 2: msOps multdiv / addmult / adddiv, msLetter and msCheck are the five presets two_step_*; msChoose is a response mode (lesson 7 r3) and stays a plain option. (`CLAUDE.md; js/modules/skill-presets.js; g3-oa8-two-step-wp.js followOn`)
- **2026-10-31** — Keyword supports (wpCues, wpBank) are hidden on the sentence-layout story skills: a keyword list teaches 'in all means +' instead of the story's structure (P-21). (`lead ruling 2026-10-31, critic visual-quality r2 N3 (skill-options.js)`)
- **2026-10-31** — The part-whole bar is DRAWN on the teaching pages (scripted model, guided, the lesson chart and model) and is the bar option on practice pages, default off; bars are schematic (RP-72). (`lead ruling 2026-10-31, critic r1 F13 (WDS 18.1)`)
- **2026-10-30** — EE for 3.OA.D.8 is M.EE.3.OA.7 (the owner sheet's M.EE.3.OA.8 quotes its text); the sheet code stays in eeOwnerList. (`lesson 7 Q1 (g3-oa8-two-step-wp.js)`)
- **2026-11-07** — No owner sign-off of skill cards in the lessons-first program: lanes decide from the standards, the lead signs on the recommended answers under the owner's delegation, the owner reviews finished work. (`lead brief 2026-11-07; design/STATUS.md 2026-11-07 owner decisions`)
- **2026-10-02** — 'Within N' bounds the answer, never the operands; a skill's NAME is its declaration. (`CLAUDE.md governing rules`)
- **2026-11-13** — Card signed by the lead under the owner's delegation: decisions 1-12 as recommended, decision 3 amended (wpBar findable as multi_step_word '(Visual)'; msChoose read in the code: a response mode on the same task, so a plain option, no preset). (`design/decisions/LEAD_DECISIONS.md (2026-11-13, two-step card)`)

## 6. Misconceptions

For answer keys, `wrongAnswer`, error analysis, True or False? and Reason It (P-TH-13).

- **M-TS1** stops after Step 1 (ms-stop-step1) — e.g. 5 bags of 9, gets 13 more: writes 45
- **M-TS2** one operation with all the story numbers (ms-one-op) — e.g. 4 bags of 6, 5 eaten: 4 + 6 − 5 = 5
- **M-TS3** Step 2 with a story number, not the Step 1 answer (ms-story-number) — e.g. 4 bags of 6, 5 eaten: 6 − 5 = 1
- **M-TS4** the wrong operation for a step: adds the groups and the size — e.g. 4 bags of 6: 4 + 6 = 10, then 10 − 5 = 5
- **M-TS5** brackets left out: does the x before the + the story does first — e.g. (6 + 3) x 2 written 6 + 3 x 2 = 12
- **M-TS6** 'gave away' read as add (the change's direction) — e.g. 37, gave away 26, found 36: 37 + 26 + 36 = 99
- **M-TS7** estimate made from the answer, not the story numbers (or judged 'close' without working) — e.g. answer 47: estimate 50, Yes - without rounding 37, 26, 36
- From the build list (entries hosted on algebra): 3 times as many = 3 more; uses the first pair only; calculates both; bigger number means bigger result; calculates every side; bigger first number means bigger; one value that works proves equivalence; 3y = y + 3; adds instead of multiplying where letters touch (2l = 2 + l); ignores the brackets; applies the rule forwards when working backwards; reads a two-step machine in the wrong order; only whole numbers are solutions; closed circle for >; answers the first step; uses the letter as a label, not a number; ignores the remainder; stops before listing every pair; lists a pair twice (3,5 and 5,3 when order does not matter); the coefficient is the letter; 2(8 + 7) has three terms; swaps dependent and independent; adds the rate instead of multiplying; writes 2 × 8 + 7 for "add then multiply"; evaluates when asked to interpret

## 7. Options and presets

- Every option is read by gen-algebraic.js (multi_step_word block) and word-work.js: forms (the four + / − orders, key = variants), msOps (key 4P), band, wpCues / wpBank / wpBar (8A-8C), wpFrames, msLetter, msCheck, msChoose. Keys append to skill-option-keys.js ONLY when built: none: band value 100 was appended at build and dropped again (lead ruling R2 2026-11-13; band is a scalar, B<digits>, no code index depends on it; a B100 code decodes to no band through OPTION_FOLDS, check ws-two-step BAND-ALIAS); wpBar on two-step reuses 8C.
- Preset skills (skill-presets.js, live): two_step_mult_div_first {msOps: multdiv}, two_step_add_then_mult {addmult}, two_step_add_then_div {adddiv}, two_step_letter_equation {multdiv, msLetter}, two_step_estimate_check {msCheck}. Checked against the 2026-10-17 rule: msOps mult and div alone (lesson 7 chunks) stay options of two_step_mult_div_first (one lesson, chunked); msChoose a response mode (the pupil still solves the story and checks one of four answers; not a choice of operations); wpBar a new representation, findable as multi_step_word '(Visual)' (decision 5); wpFrames a scaffold; forms the order of the + / − steps (one G2 lesson) - none a preset (Q3, amended 2026-11-13). The G2 lesson's skill is the host's default (multi_step_word), so no G2 preset.
- addsDrawingValues (PROPOSED): wpBar=true and msCheck=true add a drawing (a page may hold fewer stories).
- Search terms (search-terms.js, in the build change; ws-search-terms gate): add to SKILL_TERMS of the host and twin 'two step word problems', 'multi-step', 'two operations', 'add then subtract story', 'bar model two steps'; presets: 'multiply then add', 'divide then subtract', 'brackets story', 'equation with a letter', 'unknown n', 'reasonable answer', 'estimate to check', 'rounding check'; CONCEPT_RULES hits on 'two-step' / 'multi-step' -> the seven (PROPOSED Q12).

What the repo offers today (every option value, role and screen host, each with its decision) and the options and preset skills declared in the repo are listed after the Signed line (§7b, informational, not signed).

### 7a. Hosts, roles and options — the decisions (signed)

What the critic grades and the panel may show. Each live line in §7b needs one of: **offered** (shown and graded on every page type and host it reaches), **hidden** (must not be offered on these skills: becomes a notOffered entry of the rulings block, checked by ws-card-rulings --check offered), **out of scope** (offered by the app but not graded on this card; say where it is graded). PROPOSED = pre-filled for the lead from existing rulings and status; signing the card accepts it.

**Option values (offeredOptionsFor)**

- `forms=0 | 1 | 2 | 3` — **offered** (PROPOSED) — the four + / − orders; applies when msOps is addsub (build: appliesTo msOps addsub, so the panel hides it on the x / ÷ presets) (skill-options.js _p12Variants; BUILD #17 (G2))
- `msOps=addsub | mult | div | multdiv | addmult | adddiv` — **offered** — the first step's kind; multdiv / addmult / adddiv are also preset skills (lesson 7 (g3-oa8-two-step-wp); presets)
- `band=null | 30 | 50` — **offered** (PROPOSED) — caps every computed number, the Step 1 result and the answer (Q2); 100 appended at build and dropped (lead ruling R2 2026-11-13: equal to no band at Max Number 100; B100 codes alias to no band) (skill-options.js _o2RangeBand; §9.2)
- `wpCues=true | false` — **hidden** (PROPOSED) — keyword cues teach key words, not the two-step structure (lead ruling 2026-10-31 (P-21); lesson 7 research)
- `wpBank=true | false` — **hidden** (PROPOSED) — a keyword bank teaches 'in all means +' (lead ruling 2026-10-31 (P-21); lesson 7 research)
- `wpBar=true | false` — **offered** (PROPOSED) — the bar-model scaffold; default on for multi_step_word (Q5); a no-op today until the build (§9.4 (the two-step bar model, new); WDS 11.9)
- `wpFrames=true | false` — **offered** — the compact fade: one number sentence a step (lesson 7 (exit slip, P0))
- `msLetter=true | false` — **offered** — 3.OA.D.8 'equation with a letter' (lesson 7 r2; preset two_step_letter_equation)
- `msCheck=true | false` — **offered** — 3.OA.D.8 'estimation strategies including rounding'; adds a drawing (rows) (lesson 7 r2; preset two_step_estimate_check)
- `msChoose=true | false` — **offered** (PROPOSED) — a choice A-D on paper AND screen (never a production turned into choice); x / ÷-first stories only (appliesTo) (lesson 7 r3 (board Check Question))
- `calculator=true | false` — **out of scope** — a play control on every skill; graded by ws-options-verify BEHAVIOUR, not by this card (skill-options.js play controls)
- `skipAfter=*` — **out of scope** — a play control on every skill; graded by ws-options-verify BEHAVIOUR (skill-options.js play controls)

**Page roles (buildSheet)**

- `role:independent` — **offered** — the pass bar (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:more-practice` — **offered** — the pass bar (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:test` — **offered** — the pass bar; hints off (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:opener` — **offered** — any skill on any page type (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:scripted-model` — **offered** — provider workedSteps real 7/7 (the four moves; bar model drawn) (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:guided` — **offered** — provider workedSteps real; the bar model and the middle question drawn (hints) (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:error-analysis` — **offered** — provider wrongAnswer real: ms-stop-step1 / ms-story-number / ms-one-op (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:review` — **offered** — any skill on any page type (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:pre-skill-check` — **offered** — earlier skills: one-step x / ÷ stories, + / − two-step (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:mixed-practice` — **offered** — any skill on any page type (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:true-false` — **offered** — provider wrongAnswer real (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:reason-it` — **offered** — provider workedSteps and wrongAnswer real (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:stretch` — **offered** — any skill on any page type: the M-TS3 trap item (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:lesson` — **offered** (PROPOSED) — the pass bar; lesson data is 0/7 today (FALLBACK): the build writes prereqs.js lesson data from lesson 7 and the routines in §3 (Q11) (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:word-problems` — **out of scope** (PROPOSED) — the skill's own pages are story pages; the word-problems role is the story layer for skills without stories (provider stories 0/7) (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:fact-rows` — **out of scope** — not a fact skill: the role reports unsupported (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:fact-probe` — **out of scope** — not a fact skill: the role reports unsupported (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)

**Screen hosts**

- `host:practice-card` — **offered** — one drawing with print; the pass bar (RUBRIC (every screen host))
- `host:online-worksheet` — **offered** — one drawing with print; the pass bar (RUBRIC (every screen host))
- `host:quiz` — **offered** — one drawing with print; the pass bar (RUBRIC (every screen host))
- `host:boss` — **out of scope** (PROPOSED) — game / display hosts draw the same card; graded by ws-chromebook-fit, not by this card's critic (ws-chromebook-fit)
- `host:race` — **out of scope** (PROPOSED) — game / display hosts draw the same card; graded by ws-chromebook-fit, not by this card's critic (ws-chromebook-fit)
- `host:map` — **out of scope** (PROPOSED) — game / display hosts draw the same card; graded by ws-screen-slots, not by this card's critic (ws-screen-slots)
- `host:mode-dark` — **out of scope** (PROPOSED) — game / display hosts draw the same card; graded by ws-chromebook-fit, ws-screen-slots, not by this card's critic (ws-chromebook-fit, ws-screen-slots)
- `host:mode-bigboard` — **out of scope** (PROPOSED) — game / display hosts draw the same card; graded by ws-chromebook-fit, ws-screen-slots, not by this card's critic (ws-chromebook-fit, ws-screen-slots)

## 8. Gates

Each runs as `node tests/scripts/<script> …`.

- `ws-precritic.cjs --skill algebra:multi_step_word_plain,algebra:multi_step_word --strict` — and each of the five two_step_* presets
- `ws-card-rulings.mjs --card design/cards/two-step/two-step.md` — the answer bounds (R-*) and the hidden keyword supports (N-D-*)
- `ws-content-audit.cjs --skill algebra:multi_step_word_plain` — and each preset: the answer inside the band, never a story number
- `ws-visual-quality.mjs --skill algebra:multi_step_word_plain` — VQ-REP / VQ-ONEANSWER / VQ-LIVE / VQ-NOLEGACY
- `ws-story-lint.mjs` — P-WP-17..19 on the two-step stories (5 lines, sentence length, no pronoun chains)
- `ws-options-verify.cjs --render --skill algebra:multi_step_word_plain` — no value costs the page items without a drawing; wpBar is no longer a no-op
- `ws-presets-unit.mjs` — each two_step_* opens multi_step_word_plain with its values
- `ws-spec-card.mjs --check-signed design/cards/two-step/two-step.md` — build-start gate

## 9. Open questions (recommended answers)

1. **Accept every option value, role and host decision marked PROPOSED in section 7a?** Recommended: Yes, all as proposed (Q2-Q12 below are the ones that change behaviour).
2. **'Within N' on a two-step story: does the band cap only the answer, or every computed number (the Step 1 result too)? Today the default deals answers to 127 (Step 1 to 145) against Max Number 100, and band 50 gives a Step 1 result of 73.** Recommended: Every computed number (the Step 1 result and the answer) is at most N; band values 30 / 50, no band = the Max Number (100 was appended for the G2 lesson and dropped, lead ruling R2 2026-11-13: at Max Number 100 it dealt the same as no band, which the G2 lesson now takes; old B100 codes decode to no band). Rulings R-ADDSUB-*, R-BAND-* check it.
3. **Any new preset skill under the 2026-10-17 rule (msOps mult / div alone, msChoose, wpFrames, wpBar, a G2 'two-step + and − within 100')?** Recommended: No new preset (amended by the lead, 2026-11-13, under the owner's delegation, against the 2026-10-17 rule that a distinct option - a new representation or task kind - is ALSO a findable preset skill): the five presets stay; wpBar (a new representation) IS findable, as multi_step_word '(Visual)', which defaults to it (decision 5); msChoose stays a plain option: read in gen-algebraic.js (msChoose block), word-work.js and cells/word-work.js chooseLayout, the pupil still SOLVES the same x / ÷-first two-step story and only answers by checking one of four numbers (the answer and the three two-step errors) - a response mode on the same task, not choosing the operations (no new task kind); msOps mult / div alone are the two chunks of two_step_mult_div_first's one lesson; wpFrames is a scaffold fade; forms are the orders of one G2 lesson, whose skill is the host's default (multi_step_word, no band).
4. **Build the two-step bar model (a new graphic: Step 1 bar - equal groups or part-whole - and Step 2 bar carrying the Step 1 answer), drawn on the teaching pages and as wpBar on practice pages? Today wpBar is offered but draws nothing on a two-step story.** Recommended: Yes: it is IXL's 'strip models' and WDS 11.9's two-step schema; add the row 'Two-step story -> two step columns, each with its schema' to WDS 18.1 and the library entry before the build (VQ-1 says so); first build at medium.
5. **multi_step_word '(Visual)' and multi_step_word_plain deal identical items. What makes the Visual twin visual?** Recommended: The twin draws the two-step bar model by default (wpBar default on); _plain keeps it off. No new skill, no label change.
6. **Print the hidden middle question (P-WP-11 v1: 'How many apples in the bags?' under Step 1) on the teaching pages?** Recommended: Yes on Model and Guided only (a hint that fades); never on practice, test or screen practice.
7. **two_step_letter_equation: grade the equation, or only n?** Recommended: Both: the equation (signs and three numbers, one answer) and n are two graded answers; the skill's name is the equation.
8. **two_step_estimate_check: what is graded?** Recommended: The answer and the estimate; Yes / No is ungraded reflection that the key rings. Stay on + / − stories with 2-digit numbers (rounding to tens is meaningful); x / ÷ estimates are not added.
9. **Capacity per page (section 3 notes) before measurement?** Recommended: Columns S 3 / M 2 / L 2, frames S 4 / M 4 / L 2, letter and estimate S 4 / M 3 / L 2, with the bar model S 2 / M 1 / L 1 (lead ruling R1 2026-11-13 (a): measured S 2 / M 1 / L 1; a bar beside the column work cannot reach M 2 (probe, widest of 200 stories at M: bar across 132.3 x 29.8 mm, stacked 62.5 x 61.6 mm, the two step columns 107 mm wide and 53.7 mm tall, the story 27.5 mm - side by side needs 181-247 mm of a 174 mm row and a 102 mm cell, over 93 mm); M holds 1 as a ruled pin and the one-story practice page must not stretch its row (a role change, lf-roles); check ws-two-step --print CAP-BAND); the build measures and the card is resigned only if a number falls (resigned 2026-11-13 for M 2 -> 1).
10. **Two new instruction strings 'story-letter' and 'story-estimate'?** Recommended: Yes, as worded in section 3 (at most 8 words, the library's grammar).
11. **Lesson data for the seven skills (prereqs.js 0/7: the lesson role falls back today). The G2 BUILD lesson #17 routine as in section 3?** Recommended: Yes: lesson 7's routine for the x / ÷-first skills, the follow-on routines for the presets, the G2 routine for multi_step_word(_plain); the build writes them in prereqs.js.
12. **WRM tags: the presets have none (no WRM step teaches 3.OA.D.8; lessons-6-7 open question).** Recommended: Keep the presets untagged (site lesson linked direct, as now); tag multi_step_word(_plain) Y2.B4.S10 partial (two-step + / − without money) beside its current Y5 / Y6 tags; search terms as listed in section 7.

Signed: owner (delegated to lead), 2026-11-13

<!-- informational: not signed. Not hashed, not compared, never read by any check. -->
## 7b. What the repo offers today (informational, not signed)

Listed from the repo at generation. The decisions are signed in §7a; `--check-signed` re-derives this listing from the repo and FAILS on any line without a decision (`[UNDECIDED]`). Not part of the signed card.

**Option values (offeredOptionsFor)** (26 lines; 0 undecided)

- `forms=0` The two steps [difficulty], default (all 7) [offered, PROPOSED]
- `forms=1` The two steps [difficulty], default (all 7) [offered, PROPOSED]
- `forms=2` The two steps [difficulty], default (all 7) [offered, PROPOSED]
- `forms=3` The two steps [difficulty], default (all 7) [offered, PROPOSED]
- `msOps=addsub` Two steps: the first step [difficulty], default on multi_step_word, multi_step_word_plain, two_step_estimate_check (all 7) [offered]
- `msOps=mult` Two steps: the first step [difficulty] (all 7) [offered]
- `msOps=div` Two steps: the first step [difficulty] (all 7) [offered]
- `msOps=multdiv` Two steps: the first step [difficulty], default on two_step_letter_equation, two_step_mult_div_first (all 7) [offered]
- `msOps=addmult` Two steps: the first step [difficulty], default on two_step_add_then_mult (all 7) [offered]
- `msOps=adddiv` Two steps: the first step [difficulty], default on two_step_add_then_div (all 7) [offered]
- `band=null` Numbers to [difficulty], default (all 7) [offered, PROPOSED]
- `band=30` Numbers to [difficulty] (all 7) [offered, PROPOSED]
- `band=50` Numbers to [difficulty] (all 7) [offered, PROPOSED]
- `wpBar=true` Bar model [support], default on multi_step_word (all 7) [offered, PROPOSED]
- `wpBar=false` Bar model [support], default on multi_step_word_plain, two_step_add_then_div, two_step_add_then_mult, two_step_estimate_check, two_step_letter_equation, two_step_mult_div_first (all 7) [offered, PROPOSED]
- `wpFrames=true` Number sentences, no column boxes [layout] (all 7) [offered]
- `wpFrames=false` Number sentences, no column boxes [layout], default (all 7) [offered]
- `msLetter=true` Write one equation with a letter [layout], default on two_step_letter_equation (all 7) [offered]
- `msLetter=false` Write one equation with a letter [layout], default on multi_step_word, multi_step_word_plain, two_step_add_then_div, two_step_add_then_mult, two_step_estimate_check, two_step_mult_div_first (all 7) [offered]
- `msCheck=true` Estimate to check [layout], default on two_step_estimate_check (all 7) [offered]
- `msCheck=false` Estimate to check [layout], default on multi_step_word, multi_step_word_plain, two_step_add_then_div, two_step_add_then_mult, two_step_letter_equation, two_step_mult_div_first (all 7) [offered]
- `msChoose=true` Choose the answer (A to D) [layout] (all 7) [offered, PROPOSED]
- `msChoose=false` Choose the answer (A to D) [layout], default (all 7) [offered, PROPOSED]
- `calculator=true` Calculator [play] (all 7) [out of scope]
- `calculator=false` Calculator [play], default (all 7) [out of scope]
- `skipAfter=*` Skip appears after [play] (all 7) [out of scope]

**Page roles (buildSheet)** (17 lines; 0 undecided)

- `role:independent` — the skill's own items (all 7) [offered]
- `role:more-practice` — the skill's own items (all 7) [offered]
- `role:opener` (also lesson-opener) — the skill's own items (all 7) [offered]
- `role:scripted-model` (also model) — provider workedSteps: real 7/7 (all 7) [offered]
- `role:guided` — provider workedSteps: real 7/7 (all 7) [offered]
- `role:error-analysis` (also check-it) — provider wrongAnswer: real 7/7; provider misconceptions: real 7/7 (all 7) [offered]
- `role:review` — earlier skills: data.js order (print-sheet.js earlierSkills) (all 7) [offered]
- `role:test` (also test-a, test-b) — the skill's own items (all 7) [offered]
- `role:pre-skill-check` (also pre-skill) — earlier skills: data.js order (print-sheet.js earlierSkills) (all 7) [offered]
- `role:word-problems` — provider stories: real 0/7 (default on multi_step_word, multi_step_word_plain, two_step_add_then_div, two_step_add_then_mult, two_step_estimate_check, two_step_letter_equation, two_step_mult_div_first) (all 7) [out of scope, PROPOSED]
- `role:fact-rows` — provider stories: real 0/7 (default on multi_step_word, multi_step_word_plain, two_step_add_then_div, two_step_add_then_mult, two_step_estimate_check, two_step_letter_equation, two_step_mult_div_first) (all 7) [out of scope]
- `role:fact-probe` — the skill's own items (all 7) [out of scope]
- `role:mixed-practice` (also mixed) — provider stories: real 0/7 (default on multi_step_word, multi_step_word_plain, two_step_add_then_div, two_step_add_then_mult, two_step_estimate_check, two_step_letter_equation, two_step_mult_div_first) (all 7) [offered]
- `role:true-false` — provider wrongAnswer: real 7/7 (all 7) [offered]
- `role:reason-it` (also reason) — provider workedSteps: real 7/7; provider wrongAnswer: real 7/7 (all 7) [offered]
- `role:stretch` — the skill's own items (all 7) [offered]
- `role:lesson` — lesson data: prereqs.js 7/7 (all 7) [offered, PROPOSED]

**Screen hosts** (8 lines; 0 undecided)

- `host:boss` — driven by ws-chromebook-fit (all 7) [out of scope, PROPOSED]
- `host:map` — driven by ws-screen-slots (all 7) [out of scope, PROPOSED]
- `host:mode-bigboard` — driven by ws-chromebook-fit, ws-screen-slots (all 7) [out of scope, PROPOSED]
- `host:mode-dark` — driven by ws-chromebook-fit, ws-screen-slots (all 7) [out of scope, PROPOSED]
- `host:online-worksheet` — driven by ws-chromebook-fit, ws-envelope, ws-screen-answer, ws-screen-slots, ws-support-ladder (all 7) [offered]
- `host:practice-card` — driven by ws-chromebook-fit, ws-envelope, ws-screen-answer, ws-screen-slots, ws-support-ladder (all 7) [offered]
- `host:quiz` — driven by ws-chromebook-fit, ws-envelope, ws-screen-answer, ws-screen-slots, ws-support-ladder (all 7) [offered]
- `host:race` — driven by ws-chromebook-fit (all 7) [out of scope, PROPOSED]

**Options declared today** (`js/modules/skill-options.js`; id, label, values, skills that declare it):

- `band` Numbers to: (As dealt (follows the Max Number setting)) / 30 / 50 (2)
- `forms` The two steps: 0 / 1 / 2 / 3 (2)
- `msCheck` Estimate to check: free (2)
- `msChoose` Choose the answer (A to D): free (2)
- `msLetter` Write one equation with a letter: free (2)
- `msOps` Two steps: the first step: addsub / mult / div / multdiv / addmult / adddiv (2)
- `wpBank` Keyword bank: free (2)
- `wpBar` Bar model: free (2)
- `wpCues` Key words: free (2)
- `wpFrames` Number sentences, no column boxes: free (2)

**Preset skills on these hosts** (`js/modules/skill-presets.js`): `algebra:two_step_add_then_div` → `algebra:multi_step_word_plain` {"msOps":"adddiv"}; `algebra:two_step_add_then_mult` → `algebra:multi_step_word_plain` {"msOps":"addmult"}; `algebra:two_step_estimate_check` → `algebra:multi_step_word_plain` {"msCheck":true}; `algebra:two_step_letter_equation` → `algebra:multi_step_word_plain` {"msOps":"multdiv","msLetter":true}; `algebra:two_step_mult_div_first` → `algebra:multi_step_word_plain` {"msOps":"multdiv"}
<!-- /informational -->
