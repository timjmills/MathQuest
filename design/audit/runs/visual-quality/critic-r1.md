# Visual-quality lane: independent critic, round 1

Critic: Opus 5.5, medium effort (critic profile). I did not build this work.
Branch `claude/sweet-newton-c8wrv1-visual-quality` at `1928be3` (merged with the base). Date 2026-10-31.

**Verdict: FAIL.** The lowest score is **5**: C1 on `card-390` for all three story skills (H6, an answer input 41 x 44 px).
There are eleven blocking findings (list at the end). Both drawings are right: the fact triangle and the number sentence
frame are the representation the map names, drawn from the library, with correct keys and one answer place each. The
failures are page geometry (H13 empty bands at S and M, Size S ignored on tests), one screen touch target, the lesson
packet of the story skills (a cell overflows, a keyword strategy is taught, the step frames do not match the step), one
answer given away by the unit word (`sub_wp_20`) and a lesson vocabulary item that misteaches (`fact_family_sort`).

## How I graded

- Renders: `node tests/scripts/ws-grade-render.cjs --skills addition:fact_family_sort,addition:add_wp_20_plain,subtraction:sub_wp_20,addition:add_wp_10 --roles independent,more-practice,guided,scripted-model,error-analysis,review,test,true-false,reason-it,stretch,lesson --size S|M|L`
  into `/tmp/claude-0/-home-user-MathQuest/cea1479a-7e02-5121-b21e-92a04002c02f/scratchpad/critic1/<S|M|L>/<category>__<skill>/`
  (below, `R/` stands for that scratchpad `critic1/` folder). Screen hosts come from the same run (card-390/820/1280,
  worksheet-1280, quiz-1280). The bar option: `--opts '{"support":"bar"}'` (the option id is `support`, value `bar`;
  `skill-options.js` `_opsBar`) into `R/bar/`. The lead's known L defect: `--anchors side --size L` into `R/anchorsL/`.
- I looked at every pupil page and key PNG of the in-scope roles at S and L, spot-checked M, and opened the other roles at
  least once per skill. Measurements are pixel scans of the PNGs at 96 dpi (1 mm = 3.78 px): for every grid cell, the
  largest horizontal band with no ink, as a share of the cell height (script
  `/tmp/claude-0/-home-user-MathQuest/cea1479a-7e02-5121-b21e-92a04002c02f/scratchpad/tools/bands.py`; it skips the
  14 px item-tab strip). Stroke widths and sizes come from the drawing code (`js/modules/sheet/graphics/*.js`).
  Overflow and touch-target figures come from each skill's `meta.json` (the renderer's DOM measures).
- **Scope (RUBRIC scope notes 2026-09-26).** The pass bar covers Practice (independent, more-practice), Test, the Lesson
  and the five screen hosts. Guided, scripted model, review, true-false, reason-it and stretch are graded below as
  advisory, and error analysis is out of the bar. Their findings do not block, but they are filed on the skill (RC2).
- **Unsupported roles:** `fact_family_sort` stretch is `unsupported` ("No Stretch for this skill yet: it has no open
  problem of its own"). Every other role rendered for every skill at S, M and L.
- `ws-visual-quality --skill <id>` is OK for all four skills (0 findings). Console errors: none on any host.

## Score tables (C1 use · C2 teaching · C3 spacing · C4 standard)

Any score below 8 is in **bold**. "cap" names the hard cap the score is held to.

### A. `addition:fact_family_sort` (Is It a Fact Family?, Grade 1), template `family-check`

| Version | S | M (spot) | L | Caps / findings |
|---|---|---|---|---|
| independent | 8 · 8 · **6** · 8 | 8 · 8 · **6** · 8 | 8 · 8 · 8 · 8 | H13 at S (37.8 %) and M (30.6 %): F1 |
| more-practice | 8 · 8 · **6** · 8 | 8 · 8 · **6** · 8 | 8 · 8 · 8 · 8 | as independent: F1 |
| test | 8 · **7** · 8 · 8 | 8 · 8 · **6** · 8 | 8 · 8 · 8 · 8 | S: duplicate item F9 (12 items, band 20.8 %); M: H13 30.6 % F1; L: 6 items, band 20.5 % |
| lesson (3 pp + key) | 8 · **6** · **6** · 8 | (= S, the lesson prints at M) | 8 · **6** · **6** · 8 | F8 vocabulary misteaches; H13 on the p2 guided cells (33.1 %) F1 |
| guided (advisory) | 8 · 8 · 7 · 8 | 8 · 8 · 7 · 8 | — | model cell 35 % band |
| scripted model (adv.) | 8 · 7 · 8 · 8 | | | F20: the Say line omits the decision |
| true-false / reason-it (adv.) | 8 · 8 · 8 · 8 | | | keys checked, all correct |
| card-390 / 820 / 1280 | 8 · 8 · 8 · 8 | | | F15: the card prompt has no screen verb (minor) |
| worksheet-1280 | 8 · 8 · 8 · 8 | | | F10 two-digit parts within about 1 mm of the side (minor) |
| quiz-1280 | 8 · 8 · 8 · **7** | | | F10: "10" nearly touches the right side |

### B. `addition:add_wp_20_plain` (Addition Word Problems within 20, No Pictures, Grade 1), word-work `layout: 'sentence'`

| Version | S | M (spot) | L | Caps / findings |
|---|---|---|---|---|
| independent | 8 · **7** · **6** · 8 | 8 · **7** · **6** · 8 | 8 · **7** · **6** · 8 | H13 37.1 / 36.7 / 30.7 % (F1); F12 schema alternation / two schemas |
| more-practice | 8 · **7** · **6** · 8 | 8 · **7** · **6** · 8 | 8 · **7** · **6** · 8 | as independent |
| test | 8 · **7** · **6** · 8 | 8 · **7** · 8 · 8 | 8 · **7** · 8 · 8 | S: H13 37.3 %, and S holds 8, the same as L (F2) |
| lesson (3 pp + key) | **6** · **6** · **5** · **7** | (= S) | **6** · **6** · **5** · **7** | F4 overflow (gate red); F6 keyword strategy and step frames; F7 rings over letters; F13 no bar; H13 p3 last row 39.8 % |
| scripted model (adv.) | 8 · **6** · **5** (M, L) · 8 | | | F14: frames 3-4 show empty boxes; M/L p2 is a lone part-page (H5) |
| guided (adv.) | 8 · 7 · 7 · 8 | | | keyword step in the hint; row-1 band 31 % |
| stretch (adv.) | 8 · **5** · 8 · 8 | | | F18: not a story ("Two numbers add to 18") |
| card-390 | **5** · 8 · 8 · 8 | | | **H6**: the answer input is 41 x 44 px (F3) |
| card-820 / card-1280 | 8 · 8 · 8 · 8 | | | F16: digit size unverified (see the finding) |
| worksheet-1280, quiz-1280 | 8 · 8 · 8 · 8 | | | |

### B (sample). `subtraction:sub_wp_20` and `addition:add_wp_10`, same layout

| Version | `sub_wp_20` S / M / L | `add_wp_10` S / M / L | Findings |
|---|---|---|---|
| independent | 8·**7**·**6**·8 / 8·**7**·**6**·8 / 8·**7**·**6**·8 | 8·8·8·8 / 8·8·8·8 / 8·8·**6**·8 | sub: F5 unit word gives the answer, F1 H13; add_wp_10 L: H13 34.8 % |
| more-practice | as independent | 8·8·8·8 / 8·8·8·8 / 8·8·**6**·8 | |
| test | 8·**7**·**6**·8 / 8·**7**·8·8 / 8·**7**·8·8 (L item 7 prints "sticker", answer 1) | 8·8·**5**·8 / 8·8·8·8 / 8·8·**6**·8 | add_wp_10 S: 4 items vs 6 at M (F2), H13 33.5 %; L: H13 |
| lesson | **6**·**6**·**5**·**7** | **6**·**6**·**5**·**7** | F4, F6, F7, F13 (add_wp_10's anchor chart also drops the K picture) |
| scripted model (adv.) | | 8·7·**5**·8 (L: p3 holds one frame, H5) | F14 |
| card-390 | **5**·8·8·8 | **5**·8·8·8 | H6, F3 |
| other hosts | 8·8·8·8 | 8·8·8·8 | |

### C. The graphic-library entries

| Entry | C1 | C2 | C3 | C4 | Notes |
|---|---|---|---|---|---|
| `factTriangle` | 8 | 8 | 8 | **7** | 1.5 pt outline, Andika bold proportional digits, side 34 / 42 / 50 mm from the preset; the same SVG on paper and screen. The largest number is always on top (checked in code, `gen-operations.js:1530`, and on every rendered item), and a non-example is drawn identically, so the drawing does not give the yes/no away. F10: the base numbers sit at the fixed points 0.29 / 0.71 of the side, so a two-digit part comes within about 0.8 mm of the slant at S and on the quiz host. |
| `answerArea` | **5** | 8 | 8 | 8 | A 1.5 pt box, the heaviest writing place in the cell; the unit word is printed and the width comes from `digits`. **H6**: on screen the host input inside the twin box measures 41 x 44 px on a 390 px card (F3), although the entry promises ≥ 44 px. F5: the unit word follows this item's answer (singular at 1), so it leaks. |
| `sentenceFrame` | 8 | 8 | 8 | **7** | Boxes 1 pt and a 1 pt circle (diameter 9 / 11 / 13 mm), `=`, then the answer area; the same structure on screen. F11: a written sign (key ink, grey trace) renders at about 40 % of the digit height and smaller than the printed `=` (crop: 8 px against 21 px digits at S). |
| `partWholeBar` | 8 | **7** | 8 | **7** | Bars 1 pt, boxes 0.75 pt. It uses `KEY_FEATURES` (tabular digits), against the library's own VQ-5 rule (proportional). Its 60 / 40 stock length follows `pa > pb`, so on a subtraction story the longer bar tells the pupil whether the unknown part is the larger (RP-72 forbids a length that draws the answer). |

## Findings

Severity: **blocking** means it puts a pass-bar version below 8. Every finding names its class and rule ids.

**F1 · blocking · H13 empty band in every practice cell at S and M (class SPACE, rule_ids H13, L2, DN-1a)**
- Where: independent, more-practice and test pupil pages and keys.
  - `R/S/addition__add_wp_20_plain/independent-p1.png`: 8 cells, each 212 px tall, content 133 px; empty band 37.1 %.
  - The same skill's `more-practice-p1.png` (37.3 %) and `test-p1.png` (37.3 %); M `independent-p1.png` (36.7 %); L `independent-p1.png` (30.7 %).
  - `R/S/subtraction__sub_wp_20/independent-p1.png` (37.3 %); M (37.3 %).
  - `R/S/addition__fact_family_sort/independent-p1.png` (37.8 %, 9 cells of 270 px); M (30.6 %).
  - `R/S/addition__add_wp_10/test-p1.png` (33.5 %); `R/L/addition__add_wp_10/independent-p1.png` (34.8 %).
  - `R/S/addition__fact_family_sort/lesson-p2.png`, guided cells (33.1 %); `R/S/addition__add_wp_20_plain/lesson-p3.png`, last row (39.8 %).
- Evidence: `meta.json` → `roles.independent.fits.sections[0]` shows `cellH 57, hMin 41.1` at S. The engine stretches 8
  rows of 41 mm content into 57 mm cells. The S guided page of the same skill (`guided-p1.png`) holds the same item in a
  155 px (41 mm) cell, so 10 stories fit at S (5 rows of 45.6 mm = 228 mm). The fact-family S test holds 12 cells of
  218 px with a 20.8 % band, so the independent page could hold 12, not 9.
- Fix: pack the practice roles to the measured `hMin` plus a fixed writing pad. At S that is 10 stories (2 x 5) and 12
  triangles (3 x 4); at M, 8 stories and 9 to 12 triangles with the cell sized to its content. Where the count is held
  by the role, top-align the content and shrink the row. Check: `ws-print-lint` L-DENSITY H13 at S, M and L on these
  four skills, every cell under 30 %.

**F2 · blocking · Size S ignored on the test (class SIZE-S, rule_ids L1, DN-1a, 12.1)**
- Where:
  - `add_wp_20_plain` test holds 8 items at S, 8 at M and 8 at L (`R/S|M|L/.../test-p1.png`).
  - `add_wp_10` test holds **4 at S** against 6 at M: S is worse than M. At S the role picked one full-width column
    (story beside the sentence, `meta fits` "1 column x 4 rows").
  - `fact_family_sort` independent is 9 at S and 9 at M (allowed, since S holds more than L's 6, but S is not denser
    than M).
- Fix: S must hold more items than L (test S ceiling 20). Do not let the full-width "story beside" layout win at S
  when two columns fit; `sentenceFits` decides per page and chose 1 column at S. Check: `ws-columns --sizes` (S holds
  more items or more columns than L) on every role.

**F3 · blocking · H6, a phone touch target under 44 px (class SCREEN-TARGET, rule_ids H6, SP-10)**
- Where: `R/S/addition__add_wp_20_plain/card-390.png`, `R/S/subtraction__sub_wp_20/card-390.png`,
  `R/S/addition__add_wp_10/card-390.png`.
- Evidence: in `meta.json` → `screen.card-390.measure.smallTargets`, `{tag: input, cls: mq-cellslot, w: 41, h: 44}`.
  The answer box face is `max(44px, …)` (`answer-area.js` `tw`), but its 1.5 pt (2 px) border sits inside the 44 px
  box, so the host's input is 41 px wide.
- Fix: size the twin answer face at `max(48px, …)` content-box, or put `min-width:44px` on `.mq-cellslot` inside
  `.mq-gl-answer`. Check: `ws-grade-render` `smallTargetCount` = 0 on card-390 and card-820.

**F4 · blocking · the lesson anchor chart overflows its cell (class OVERFLOW, rule_ids L-OVERFLOW, PG-12)**
- Where: `lesson-p1.png` of `add_wp_10`, `add_wp_20_plain` and `sub_wp_20`, at S, M and L. The S and M renders are
  identical, because the lesson prints at Medium.
- Evidence: `meta.json` `roles.lesson.check.problems` reads `['page 1 cell 1: content overflows its cell']` on the
  pupil page and the key at every size. The machine gate is red, so the page should not have reached a critic (rule 0b).
  Visibly, the left panel holds steps 1 and 2 stacked, the story and the frame, two caption lines, and "apples" ends
  15 px from the divider.
- Fix: give steps 1 and 2 their own frames (5 frames in a 2 x 3 grid with the Say band), or drop the duplicate caption
  "Read the story two times." (it repeats the step title). Check: lesson `check.problems` is empty at S, M and L.

**F5 · blocking (C2) · the unit word gives the answer away (class LEAK, rule_ids L3, AK, RUBRIC C2 "nothing gives the answer away")**
- Where: `R/S/subtraction__sub_wp_20/independent-p1.png`, item 1 ("Tom has 9 stamps. Tom gives 8 stamps to Sam."):
  the printed unit under the empty answer box reads **"stamp"**, every other item reads plural, and the key answer is 1.
  The same word prints under the screen box.
- Evidence: crop at (45, 163)–(400, 381) of that PNG.
- Fix: print the plural unit (or the band's form) on the pupil page and on screen whatever the answer; singularise only
  on the key and in the Say line. Or deal no answer of 1 on the pupil page. Check: a new lint (below) that fails when a
  printed unit word differs between items of the same noun, or is singular while the slot is empty.

**F6 · blocking (lesson C2) · the lesson teaches the keyword strategy, and its frames do not show the step (class PEDAGOGY, rule_ids P-21, P-14, L6)**
- Where: `lesson-p1.png`, `lesson-p2.png` and `lesson-p3.png` of `add_wp_20_plain`, `sub_wp_20` and `add_wp_10`
  (all sizes), plus the guided and scripted-model hints.
- Evidence:
  - Step 2 is "Find the key words." with "Look at the key words: in all."
  - The rule is "More or in all? Put them together: add!" (sub: "Left or gives away? Take them away: subtract!").
  - The vocabulary matches keyword cards ("in all", "more", "left", "gives").
  - PEDAGOGY P-21: "the operation is chosen by a first-person structure rule, not by a keyword alone". The strategy
    table makes the schema and structure rule the default and the keyword checklist a teacher OPTION.
  - The step-2 frame rings the **numbers** (13, 3), not the key words, so the drawing does not show its step.
  - Vocabulary item "5, then 2 come" does not parse (VQ-9 spirit).
  - The vocabulary bar (7 over 3 | 4) is matched to "in all" (sub: "left"), which teaches that a part-whole bar means a
    keyword.
  - A stray solid black ▶ sits before that bar (it has no job).
- Fix:
  - Step 2 becomes the structure decision: "I know both parts. I add." / "I know the whole and one part. I subtract."
    (P-WP-10 library). The rule box carries that sentence.
  - Vocabulary matches whole / part / number sentence to the bar's parts.
  - The step-2 frame underlines the story's numbers and the question; step 3 draws the numbers in the boxes; step 4 the
    sign.
  - Delete the ▶.
  - Check: providers-unit "instruction follows the item" plus a lint that the lesson's printed strings contain no
    "key word" unless the `wpCues` option is on.

**F7 · non-blocking (lesson C4 -1) · the number rings collide with text (class INK-LEGIBILITY, rule_ids H2-adjacent, LS)**
- Where: `R/S/subtraction__sub_wp_20/lesson-p1.png` and `R/S/addition__add_wp_10/lesson-p1.png`, every frame.
- Evidence: the ellipse around "16", "14", "5" and "2" touches the neighbouring letters ("has(16)stickers"), and the
  ring around a line-initial "2" overlaps the "T" of the line above.
- Fix: pad the ring 1 mm and add a word space on each side, or underline the numbers instead.

**F8 · blocking (lesson C2) · `fact_family_sort` vocabulary misteaches what a fact family is (class CONTENT, rule_ids C2, L4)**
- Where: `R/S/addition__fact_family_sort/lesson-p2.png` and `lesson-key-p2.png`.
- Evidence: the key joins "8 + 4 = 12" to **"fact family"**, "8 and 4" to "parts" and "12 at the top" to "whole". One
  number sentence is a fact, not a family; a family is the three numbers, or their four facts.
- Fix: the card should read "8, 4, 12" (or a mini triangle) for "fact family", or the label should change to "fact".
- Also on this page: the "Rule: Parts make the whole? Yes!" box is a question-and-answer, not a rule. Write it as "Two
  parts make the whole."

**F9 · blocking (test S C2 7) · duplicate item on a test (class REPEAT, rule_ids L4, repeats check)**
- Where: `R/S/addition__fact_family_sort/test-p1.png`, items 10 and 11, both (12, 2, 10) with the parts swapped, side
  by side. Items 1 and 2 also share the top number 14.
- Fix: dedupe on the unordered triple per page (`generateQuestionFor` duplicate key = sorted triple). Check: the
  repeats check from Wave 0 (§1.4 S2) applied to `family-check` payloads.

**F10 · non-blocking (C4 -1 on quiz) · two-digit parts crowd the triangle's sides (class GEOMETRY, rule_ids VQ-5, CL)**
- Where: `R/S/addition__fact_family_sort/independent-p1.png` item 2 ("13" about 0.8 mm from the right side, crop
  330-480 x 170-300) and `quiz-1280.png` ("10" about 2 px from the side). M and L are clear (2.3 mm at L).
- Fix: in `fact-triangle.js`, place each base number from its measured width so that it keeps at least 2 mm to the
  slant, and lower the base row to 0.82 h when either part has two digits. Or raise `TRIANGLE_SIDE.S` to 38 mm.

**F11 · non-blocking (C4) · the written sign is undersized (class TYPE, rule_ids AK-2, VQ-5)**
- Where: every key of the sentence layout, e.g. `R/S/addition__add_wp_20_plain/independent-key-p1.png` and
  `R/S/subtraction__sub_wp_20/independent-key-p1.png` (crop `/tmp/claude-0/-home-user-MathQuest/cea1479a-7e02-5121-b21e-92a04002c02f/scratchpad/crop6.png`).
- Evidence: the "−" is a short dash about 40 % of the digit height, and "+" is 8 px against 21 px digits, smaller than
  the printed "=". It is the same in the grey trace on models.
- Fix: set the circle glyph at the digit size (`digitPt`, not × 0.85). Check that the key CSS (`data-ws-key-ans`) does
  not shrink it.

**F12 · major (C2 -1 on every story page) · two schemas on one page, dealt by position (class PATTERN, rule_ids P-21 "a set uses one schema", L10)**
- Where: `add_wp_20_plain` independent (8 of 8 items alternate "gets more" / "in all"), test (8 of 8), guided (8 of 8)
  and lesson p3 (6 of 6); `sub_wp_20` alternates "gives" / "takes out".
- Evidence: `js/modules/word-work.js:97` sets `k = (itemIndex + pageConstant) * 5`, which drives the retelling, so the
  schema follows the item's parity.
- Fix: one schema per set (join for one page, put-together for another, as an option), or deal the schema per item from
  `dealIndex` under its own key. Check: the L10 answer-cycle check extended to the story schema.

**F13 · major (lesson C2) · the part-whole bar is never drawn by default (class REPRESENTATION, rule_ids VQ-1, H14-adjacent, 18.1)**
- §18.1 names "Part-whole bar + number sentence `[ ] ◯ [ ] = [ ]`, answer box with the unit printed" for a story with
  answers ≤ 20, "at least through the pictorial rung".
- The lane (VISUAL_QUALITY §4.4) kept the bar as an opt-in (`support: bar`). The anchor chart, guided and scripted model
  of the `_plain` and picture skills therefore never draw it; only the lesson vocabulary shows a tiny bar.
- I do not apply H14 (a number sentence is drawn), but the pictorial rung of the lesson has no part-whole picture.
- Fix: draw the bar by default on the model, guided and anchor frames (the hint rung), and fade it on the independent
  page. Alternatively, the owner rules that the bar stays an option, and §18.1 is edited to say so.

**F14 · non-blocking (advisory role) · scripted model frames do not show their step, and a page is wasted (class PEDAGOGY / SPACE, rule_ids L6, H5)**
- Where: `R/S/addition__add_wp_20_plain/scripted-model-p1.png`. Frame 3 says "Write 4 and 13 in the boxes" and shows
  empty boxes; frame 4 says "Write + in the circle" and shows an empty circle. Only frame 5 is filled.
- Wasted pages: `R/M/addition__add_wp_20_plain/scripted-model-p2.png` uses 40 % of the page;
  `R/L/addition__add_wp_10/scripted-model-p3.png` holds one frame on a page (H5).
- Fix: fill each frame cumulatively (as the anchor chart does), and fit the 5 frames on one page at M and L (the story
  once at the top, the sentence repeated).

**F15 · non-blocking (C1 nit) · card prompt (class SCREEN-VERB, rule_ids BD-11)**
- `card-390` and `card-820` of `fact_family_sort` print "Look at 6, 4 and 10. Do the small numbers make the big
  number?" with no "Tap yes or no." The worksheet and the quiz include it. Use `q.screenInstr` on the card.

**F16 · to verify · screen digit size in the sentence boxes (class SCREEN-SIZE, rule_ids RUBRIC C3 screen 40 / 48 / 56 px)**
- The twin boxes measure 44 / 55 / 63 px tall at 390 / 820 / 1280. A typed digit at `P(ctx, digitPt)` comes to about
  32 / 39 / 46 px, under the card floor of 40 / 48 / 56.
- No typed digit appears in the renders, so I have not scored it down. The renderer should type one value per host and
  record its font size.

**F17 · non-blocking (C2 -1, C4 -1) · the bar option (class REPRESENTATION, rule_ids RP-72, VQ-5, VQ-8)**
- `add_wp_20_plain` has **no** bar option: `skill-options.js:1214` gives the `_plain` twins the band control only ("a bar
  model could not reach them"), so `--opts '{"support":"bar"}'` renders unchanged (`R/bar/addition__add_wp_20_plain/independent-p1.png`).
  The `_plain` skill therefore cannot draw the part-whole bar at all (see F13).
- I rendered the bar on `addition:add_wp_20` and `subtraction:sub_wp_20` instead (`R/bar2-S/`, `R/bar2-L/`). The drawing
  is right: a 1 pt whole bar over two part bars, 0.75 pt writing boxes, 6 stories at S filling the cell (no H13), and the
  key writes 9 / 8 / 1 etc. correctly (`R/bar2-S/subtraction__sub_wp_20/independent-key-p1.png`, all 6 checked).
- At L the bar page holds 4 stories with a 25.2 % band (`R/bar2-L/*/independent-p1.png`); at S it holds 6 with an 18 % band. Both pass H13.
- Leak (RP-72): the 60 / 40 stock follows the larger part. On `sub_wp_20` item 2 (19 − 2) the unknown part's bar is the
  long one; on item 1 (9 − 8) it is the short one. The bar tells the pupil which part is bigger before solving.
  Fix: in a subtraction story draw the KNOWN part on the left at the stock length chosen from the item's position in
  the deal, not from `pa > pb`, or draw equal parts unless the parts are equal.
- Paper ≠ screen (VQ-8 nit): the 390 px card draws the two part bars equal (`R/bar2-S/addition__add_wp_20/card-390.png`,
  4 and 9), while paper draws 40 / 60.
- The bar digits use `KEY_FEATURES` (tabular), against the library's VQ-5 rule.
- The bar host keeps F3: `card-390` `smallTargets` `mq-cellslot` 41 x 44.

**F18 · non-blocking (advisory) · `add_wp_20_plain` stretch is not a story (class CONTENT, rule_ids H3)**
- `R/S/addition__add_wp_20_plain/stretch-p1.png`: "Two numbers add to 18. Find different pairs." There is no story,
  for a skill named "Word Problems". Give the stretch a story frame ("Mia has 18 stickers in two boxes …").

**F19 · non-blocking · answer place moves by a text line inside a row (class GEOMETRY, rule_ids VQ-7, CL-8)**
- Where: `R/M/addition__add_wp_20_plain/independent-p1.png` row 1 (frame at y 275 against 295 px) and
  `R/L/addition__add_wp_10/independent-p1.png` row 1 (415 against 392 px).
- Cause: a story whose question wraps to 4 lines pushes its sentence down; a 3-line neighbour does not.
- Fix: reserve the band's longest story height per row, so the frames align.

**F20 · non-blocking (advisory) · the fact-family model's Say line omits the decision**
- `R/M/addition__fact_family_sort/scripted-model-p1.png`: "Say: 10 and 1 make 11." The model's point is "…, not 13. No."
- Use `say: '__ and __ make __, not __.'` for a non-example.

## The lead's known defect (sentence stories at L with side worked examples)

Confirmed. `node tests/scripts/ws-grade-render.cjs --skills addition:add_wp_20_plain,subtraction:sub_wp_20 --roles independent --size L --anchors side`:
`R/anchorsL/addition__add_wp_20_plain/independent-p1.png` and `R/anchorsL/subtraction__sub_wp_20/independent-p1.png`
print the worked model and **one** story (Score /1). The grid ends at 594 of 1034 px: 47 % of the page body is blank.

**F21 · blocking · H5 page wasted with side worked examples at L (class SPACE, rule_ids H5, PAGEFILL)**
- C3 ≤ 5 on independent L with anchors. The sub model also prints "stamp" twice (F5).
- Fix: with anchors on, the story cell takes the two-column grid (story over sentence), not the full-width "story beside"
  row, so at least 4 stories fit under the model; or the anchor shares a row.
- Check: PAGEFILL on `--anchors side` at S, M and L.

I did not see a red mark on the base (anchors off) pages at L; every base page I opened is black, white and grey, with
the key in the INK-31 orange.

## Paper = screen (VQ-8)

The fact triangle is the same SVG on the card, the worksheet and the quiz, and the Yes / No pills match the paper's
ringed words. The sentence frame keeps its outlined boxes and the circle on every host. Only the response mechanics
differ. VQ-8 holds, apart from F3 (target size) and F15 (prompt).

## Visual-quality questions (RUBRIC 6.1), answered for each skill

| Q | `fact_family_sort` | story skills (`add_wp_20_plain`, `sub_wp_20`, `add_wp_10`) |
|---|---|---|
| 1 Representation | The fact triangle from the library, the whole at the top: yes | The number sentence and labelled answer area: yes. The part-whole bar is opt-in only (F13) |
| 2 Live parts | Triangle, three numbers, Yes / No: all live | Two number boxes, sign circle, `=`, answer box and unit: live. The circle on an add-only page is a real decision. No dead × ÷, grid or bank |
| 3 One answer place | One choice slot (the pair), in the same place in every cell: yes | One 1.5 pt answer box with the unit printed: yes. Its place moves one line within some rows (F19) |
| 4 Type and stroke | Andika 700 proportional; outline 1.5 pt; rings 1.5 pt | Answer 1.5 pt, boxes and circle 1 pt; the sign glyph is undersized (F11) |
| 5 Paper = screen | Yes | Yes |
| 6 Title | "I Can tell if three numbers make a fact family": a sentence | "I Can solve addition stories (sums to 20)", "… subtraction stories (numbers to 20)": sentences |
| 7 Own renders | Graded here, on its own renders, Grade 1, band 20 | Graded here on their own renders |

## Automatic checks (what a machine could have caught in this round)

| Finding | Class | Existing check? | Proposed check and backtest |
|---|---|---|---|
| F1 H13 bands | SPACE | `ws-print-lint` L-DENSITY H13 exists but did not run, or is not red, on the kit word-work / family-check renders at S and M | Run L-DENSITY on precritic's `--skill` path at S, M and L. Backtest: these four skills at 1928be3 must fail, with 37 % cells |
| F2 Size S | SIZE-S | `ws-columns --sizes` (L1) | Add the test and the K picture story to it: S count ≥ L count and > L for non-fact roles. Backtest: `add_wp_10` test S = 4 against L = 4 and M = 6 must fail |
| F3 target 41 px | SCREEN-TARGET | The renderer measures `smallTargets`, but precritic does not fail on it | Make `smallTargetCount > 0` on card-390 or card-820 a precritic FAIL. Backtest: `add_wp_20_plain` at 1928be3 |
| F4 lesson overflow | OVERFLOW | `ws-grade-render` reports `content overflows`; precritic `--role lesson` should be red | Make the lesson `check.problems` non-empty a precritic FAIL for every skill with a lesson. Backtest: the three story skills |
| F5 singular unit | LEAK | none | A new L-LEAK rule: on a pupil page, every printed unit word of one noun has one form, and a singular unit beside an empty slot fails. Backtest: `sub_wp_20` seed 139402 item 1 |
| F6 keyword strategy | PEDAGOGY | none | A providers-unit check: lesson, guided and model strings for word skills contain no "key word" unless `wpCues` is on. Backtest: the three story lessons |
| F8 vocabulary | CONTENT | none (a manual reading) | A vocabulary-card check: the "fact family" card shows three numbers, never one equation |
| F9 duplicate | REPEAT | the Wave 0 repeats check | Key `family-check` on the sorted triple. Backtest: `fact_family_sort` test S seed 430599 |
| F10 crowding | GEOMETRY | none | A drawing unit test: each base number's bounding box is ≥ 2 mm from the slant at S, M and L, for the widest number of the band (20) |
| F11 sign size | TYPE | none | L-FONT: a filled `data-ws-shape="circle"` slot's glyph ≥ 0.9 × the digit size |
| F12 schema alternation | PATTERN | L10 checks answers, not the schema | Extend the L10 cycle check to `payload.schema` / the first story verb |
| F14 lone frame page | SPACE | PAGEFILL H5 | Run PAGEFILL on the scripted-model role at M and L |
| F21 anchors page | SPACE | PAGEFILL H5 | Run PAGEFILL with `--anchors side` at S, M and L on precritic's path. Backtest: `add_wp_20_plain` L at 1928be3 (1 story) |
| F17 bar length leak | LEAK | none | A unit test on `partWholeBar`: for a subtraction payload, bar widths are independent of which part is unknown |
| F19 frame drift | GEOMETRY | none | Measure each row's `.mq-gl-sentence` top: it must be equal within a row (VQ-7) |

## Speed-ups

- **Precritic was not clean.** F1, F3 and F4 are machine-measured (the renderer already prints `OVERFLOW` and
  `smallTargets`). Under rule 0b this round should not have started. One precritic run with those three made red would
  have saved this round.
- **The render is slow.** 4 skills x 11 roles x 3 sizes took about 4-5 minutes per size, and about 20 minutes with the
  bar and anchor runs. The lesson and scripted-model roles take most of it. A `--roles` preset for the pass-bar scope
  (independent, more-practice, test, lesson) plus a separate advisory pass would halve the critic's wait.
- **A bands tool.** Add the pixel band scan I used (`tools/bands.py`, about 60 lines) to `ws-grade-render` as a
  per-page `emptyBand` in `meta.json`, so a critic reads it instead of measuring.
- **Card gap.** The spec decision "the bar stays an option" (VISUAL_QUALITY §4.4) conflicts with §18.1. Settle it with
  the owner before round 2 (F13), so the builder does not guess.
- **Lesson content is not in the lane's file list,** but the lesson is a pass-bar page. The lane brief should name the
  lesson packet (anchor chart, vocabulary, steps) as in scope, or the lead should split it to the lesson lane.

## Blocking findings (round 2 must clear these)

1. F1: H13 37 % bands on independent, more-practice and test at S and M (all four skills), at L on `add_wp_10` and `add_wp_20_plain`, and on the lesson p2 / p3 practice cells.
2. F2: Size S ignored on the test (`add_wp_20_plain` 8 / 8 / 8; `add_wp_10` S 4 < M 6).
3. F3: H6, the card-390 answer input is 41 x 44 px (three story skills).
4. F4: the lesson anchor chart overflows its cell (three story skills, every size; the gate is red).
5. F5: `sub_wp_20` prints "stamp" under the empty box when the answer is 1.
6. F6: the story lessons teach the keyword strategy (P-21), and the step frames do not show the step; "5, then 2 come"; a stray ▶.
7. F8: the `fact_family_sort` lesson vocabulary matches one equation to "fact family".
8. F9: a duplicate triple on the `fact_family_sort` S test.
9. F12: two schemas alternating by item position on every story page (C2 7).
10. F13: no part-whole bar on any default rung (lesson C2), pending an owner ruling; `_plain` cannot take the bar at all.
11. F21: with side worked examples at L, the independent page prints the model and one story (H5, 47 % blank).
