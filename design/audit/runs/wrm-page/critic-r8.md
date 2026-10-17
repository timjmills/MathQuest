# WRM page lane: independent critic, round 8 (2026-10-17)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-page` at `848d7d3f`. That is builder round 9 on top of the latest main
(`42919723`, which includes `data/curriculum/detailed-lessons.json`). Round 9 answers critic r7:
- M11: no template ids on Skills to be made.
- m15–m17 and N34–N38.
- New: the five detailed lessons are joined to their school-site lessons. Each gets a card, a row tag, a pack link, a
  practice link and "Make it".

This was a read-only critique, and I changed no lane code.

I used 1366x768 and 1280x720 with a mouse, and 820x1180 and 390x844 with touch. Only one browser of mine ran at a time,
because another critic shared the machine. The rubric is `design/audit/RUBRIC.md` C1–C4, adapted to teacher screens as in
r1–r7:
- C1 ease;
- C2 value: the teacher still learns why each skill is there, and what they read is true;
- C3 layout;
- C4 fidelity: the teacher design system, the school's own words, and nothing said twice.

"Score down when in doubt."

**Not trusting the gates.** I re-checked by my own reading, not by the lane's gate code:
- **Truth check** (`truth.mjs` from r7). It ran over 4,938 curated Do-first and Go-with lines. I added `near.mjs`, which
  finds:
  - rows equal once the support clause is stripped (m15);
  - one row inside another;
  - grade leads measured against the lesson's own grade (m16);
  - support-block grade order and hidden grades (m17);
  - "and 1 more" weeks (N36).
  I ran both as shipped and in fallback (6,044 lines).
- **Node dump** (`dump.mjs`). It covers 1,070 lessons, 448 Skills to be made entries (3,925 fields) and the MAP notes. I
  read 42 lessons by eye (`sample.txt`, 6 per grade).
- **Skills to be made.**
  - I read every entry the r7 critic named, and 40 random others.
  - `looks.mjs` sets every "How it looks" line beside the entry's own `answer`, `representation` and `problemTypes`
    fields.
  - I ran the same script on the r8 tree (`8e42a595`) to see what round 9 changed.
- **Browser sweep** (`sweep7.cjs`). It opens all 1,070 lessons by bookmark, checks 63,316 rendered lines for exact and
  near repeats, and decodes 37 Tick links.
- **Probe** (`p8.cjs`). It ran at all four sizes and covers:
  - the 5 detailed-lesson cards, each pack link fetched;
  - each detailed practice link decoded;
  - Make it → Print → Back → Forward;
  - the m15/m16 lessons, lesson Print → Back → Forward, and the Skills to be made entries;
  - the owner rulings and dark mode.
- **Regression probe** from r5 (`probe.cjs`), at 1366 as shipped and in fallback. I diffed it against r7's output.
- **Detailed packs on main.**
  - `seeds.cjs` calls `buildSheet({role: 'detailed-lesson'})` for each lesson with 6 seeds. It ran on this tree and on a
    worktree of `origin/claude/sweet-newton-c8wrv1`.
  - `hang.cjs` replays Make it → Back → Forward on the Grade 1 lesson.

## Verdict: FAIL (round 8), on one major defect

Round 9 fixed what r7 asked for:
- **M11 is fixed.** 0 of 448 "How it looks" and Kind lines are template-id lists. None has "+ new:", "(tiles 41)",
  'response "', "The existing" or "The skill's own".
  - `patterns_notice` no longer reads "Mult-grid, count-row.".
  - `mult_4x1` reads 'Option: Size: 4-digit × 1-digit on the column method and the area model'.
  - `map_share_among` reads 'Option: Mode: share among M. How the pupil answers: drag'.
  - The five `vis_*` placeholders are named by their White Rose pictures, for example "New pictures: fraction shapes;
    two-way area grid for fraction × fraction; …".
- **m16 is fixed.** 0 lines name a grade at or above the lesson after "Taught before, in". Grade 3 E/39 now reads 'Also
  taught in Grade 4: "Compare and order negative numbers".'.
- **m17 is fixed.** The support blocks are in grade order with every grade named (0 out of order, 0 "and 1 more grade").
  Gap lines with no note share one lead-in.
- **N34–N38 are fixed.** Print → Back → Forward now reopens Print at all four sizes.
- **m15 is fixed in the main.** 0 rows repeat once the support clause is stripped, and Grade 4 D2/3 shows "Same reason as
  above" (`r8-g4-d2-3-prereq`). The "one line inside another" case r7 named is still there (n39).
- **The detailed lessons work.**
  - All 5 cards show at all four sizes, each with its row tag.
  - Every pack link is a real PDF (`%PDF-`, 0.7–0.9 MB).
  - Every practice link decodes to `skills.used` with their options; the one difference is a default that `normalizeOptions` drops.
  - Make it lands on Print worksheets, "Lesson: detailed", with that lesson chosen.

Every gate passes, and layout passes at all four sizes. There is no sideways scroll, no control under 44 px on the lane's
screens, and no console problem from the lane.

The lane still fails on **one major defect, on Skills to be made**:
- **M12 (C2 7). "How it looks" is now a composed sentence, and often it is not true.** The response clause comes from
  keywords in the representation and problem-type text, not from the entry's own `answer` field. The drawing list comes
  from loose regexes:
  - "outline" gives "shapes";
  - "percent" gives "coins and notes";
  - "shade" gives "shaded fraction pictures".

  Some examples:
  - On `map_share_among`, the Kind line says "How the pupil answers: drag" and "How it looks" says "the pupil circles the
    answer" (`r8-todo-map_share_among`).
  - `mult_4x1` says "the pupil matches the pairs", but its answer is "write the product in the grid"
    (`r8-todo-mult_4x1`).
  - `patterns_notice` says it shows "shaded fraction pictures" (`r8-todo-patterns_notice`).

  In numbers:
  - 18 of the 45 composed lines whose entry has an `answer` field name the wrong response.
  - 11 lines draw "shapes" that are not there, and 3 draw coins that are not there.
  - In my 40-line sample, about one in three composed lines had a false clause.

  r7's M11 fix sent the 25 template-id entries through this composer. So three of the entries r7 named now say something
  untrue instead of something unreadable. Part of this is older (r7 called the composer "broad but true" and did not check
  the clause against the data), but a teacher screen may not state false things.

The detailed lessons add two minors (m19, m20). The failing packs are **not** scored against this lane. They are the
same on main: `g3-oa9-mult-table-patterns` fails on seeds 1, 31337 and 8675309 on both trees, and `g1-oa1-bar-model-wp-20`
runs for more than 180 s on both. `print-sheet.js` and `lessons/` are byte-identical to main. What I judge here is how the
lane's screen presents that failure.

## Scores

| Screen | Viewport | C1 Ease | C2 Value | C3 Layout | C4 Fidelity | Pass |
|---|---|---|---|---|---|---|
| White Rose lessons (as shipped, Pre-K to Grade 5) | 1366, 1280 | 8 | 8 | 8 | 8 (n39) | yes |
| White Rose lessons (as shipped) | 820 touch, 390 touch | 8 | 8 | 8 | 8 | yes |
| White Rose: school-site lessons and assessments | all four | 8 | 8 | 8 | 8 | yes |
| White Rose: detailed-lesson cards (5) | all four | 8 (m19) | 8 (m20) | 8 | 8 | yes |
| White Rose lessons (fallback) | 1366 | 8 | 8 | 8 | 8 | yes |
| Skills to be made (as shipped, 448; fallback, 275) | all four | 8 | **7** (M12) | 8 | 8 (m18) | **no** |
| MAP · Practise by task (real MAP.json) | all four | 8 | 8 | 8 | 8 | yes |
| MAP · By representation, Start a MAP test | all four | 8 | 8 | 8 | 8 | yes |
| Gates | — | | | | | yes, all OK |

## The r7 defects, verified

| r7 | Status | Evidence |
|---|---|---|
| **M11** template ids as "How it looks"; placeholder pictures; option keys in Kind | **Fixed as asked**, but the replacement sentence is often untrue (**M12**) | The dump finds 0 lines matching the template-list shape, `+ new:`, `(tiles N)` or `response "` in the 448 entries. `make_ten_subtract` reads "Shows jumps on a number line and a part-whole bond in black and white." and `two_variables` reads "Shows a table, a grid and a graph or chart …; the pupil writes the answer." Both are fine. `mult_4x1`, `patterns_notice` and `map_share_among` read as in M12. In fallback, `vis_more_less_table` is still named "A new picture in Number & Operations in Base Ten" (n41). |
| **m15** "Taught before" said twice | **Fixed**, with one residue | In `near.mjs`, 0 of 4,938 lines repeat after stripping the support clause; the sweep finds 0 DUPWHY or NEARWHY. Grade 4 D2/3 row 2 is "Same reason as above". One line still sits inside another in 5 lessons (n39). |
| **m16** grade leads | **Fixed** | 0 failures. On Grade 3 E/39 the lead is "Also taught in Grade 4". Grade 4 D5/23 reads 'In the White Rose Grade 4 lessons: "Multiply by 10, 100 and 1,000".' (the step is not in Grade 4's school plan). |
| **m17** repeated "no skill teaches all of it yet"; support grades out of order | **Fixed** | `ruler_cm` reads 'No skill teaches these lessons in full yet. Grade 2: "Measure in metres and centimetres", … ; and 11 more lessons.' (`r8-todo-ruler_cm`). There are 0 support lines out of grade order and 0 that say "more grade". A related repetition remains (m18). |
| N34 Print → Back → Forward | **Fixed** | Grade 4 D2/27 and every detailed lesson that builds: Print → Back gives `#wrm/…`, then Forward gives Print, then Back gives `#wrm/…`, at all four sizes. |
| N35 rules-path lines | **Fixed** | 'Taught before, in Grade 2: "The 2, 4 and 8 times-tables". Revisited in this grade's support block, week 4.' (Grade 3 D1/16, rules). |
| N36 "and 1 more" weeks | **Fixed** | 0 weeks lists end "and 1 more". Long lists end "and more weeks". |
| N37 "live", "incl.", "Adds …" | **Fixed** | 0 hits in MAP notes, lessons and Skills to be made. |
| N38 one-word notes | **Fixed** | No one-word note is shown. |
| N18 mixed pools (tagging lanes) | Open, unchanged | The sweep shows 16 ROWCOUNT, the same 16 lessons. Grade 5 D4/22 lacks `mixed_angles_lines` in its link. |
| N33 `count_by_tables {constant:[n]}` (tagging lane) | Open, unchanged | Grade 3 D1/7: the link carries `rows:[{step:9}]` for the file's `constant:[9]`. |

## Detailed lessons (new)

| Lesson (screen row) | Card | Pack link | Practice link | Make it (print seed of the run) |
|---|---|---|---|---|
| Grade 2 "Read and write numbers to 1,000 …" | yes, tag on row | 200, `%PDF-`, 933 KB | 6 of 6 skills; `number_word_form {band:1000, answerSlot:'hto'}` kept | ready, about 20 s |
| Grade 1 "Solve one-step word problems within 20 using bar models" | yes | 200, PDF, 701 KB | 4 of 4; `add_wp_20 {support:'bar', pictures:false}` kept | "This page could not be built" after **189 s**; on main, the same build runs past 180 s |
| Grade 3 "Properties of multiplication …" | yes | 200, PDF, 832 KB | 4 of 4; `mult_properties {forms:[0]}` kept | ready, 36–62 s |
| Grade 3 D1/16 "Patterns on the multiplication table" | yes | 200, PDF, 761 KB | 3 of 3 (the `chart:'window'` default is dropped, as it is the default) | error on the gate's seed and on 3 of 6 seeds, the same seeds on main |
| Grade 3 "Find the rule in an input-output table" | yes | 200, PDF, 891 KB | 4 of 4; `function_table_easy {ftTask:'rule', ftFactors:'2-3-5-10'}` kept | ready, 47–77 s |

More detail:
- **Words.** Every card line passes the plain-word check. "Still to make" items read "New option: story type" and
  "Follow-on lesson: × 1 (× 0 as contrast)". Items without plain words are hidden: "redo mult_properties forms 1-3
  (legacy)" and the `patterns:notice_patterns` proposal.
- **Layout.** The card sits between the lesson head and the skill groups. The primary button is "Open the detailed
  lesson". It has no sideways scroll at 390, and dark mode is legible (`r8-dark-dl-*`).
- **Practice link.** It fills the bar's link box: "Practice link · detailed lesson · 6 skills mixed · copied".

## Owner rulings

| Ruling | Status |
|---|---|
| MAP opens on "Practise by task" | **Yes** at all four sizes: on a first visit, on a return, and after the Start tab. |
| Old start links open the test tab | **Yes.** `openMapTest('k2')` from Home and `openMapTest('35')` from Skills to be made land on "Start a MAP test". Called while MAP is already open, it stays on the current tab (no old entry point does that). The old `#map/tasks/npv/all/e1` link says "That task is no longer listed." |
| "Skills to be made" not in the sidebar; linked from White Rose, MAP and Home | **Yes.** The sidebar is Home, Send a skill set, Print worksheets, Run practice, Skills library, White Rose lessons, Quizzes, MAP tests, Progress and Settings. Home, White Rose and MAP each have one link to it. |
| "Other" behind a filter | **Yes.** "Other (drawing, fix)" shows 25 of 448. |
| Grade 6+ / Grade not set last | **Yes.** Pre-K 33 · Kindergarten 46 · Grade 1 49 · Grade 2 55 · Grade 3 82 · Grade 4 82 · Grade 5 47 · Grade 6 and above 17 · Grade not set 37. |
| Ruling 6 (composed sentences, plain words) | **Holds for words, but not for truth (M12).** The ruling says lines are "composed from structured fields". "How it looks" is composed from free-text keywords instead of the structured `answer` field. |

## Lesson → step and Tick links (browser, as shipped)

- **Sweep.** All 1,070 lessons opened by bookmark: 1,014 curated, 22 rules and 34 assessments, with no timeout.
  - 63,316 lines were checked.
  - There is 0 exact or near-repeat why line, and 0 "still to be built" said twice.
  - The only pattern hits are "()" and " , ", which my pattern leaves when it strips CCSS codes; they are not on screen.
  - There are 16 ROWCOUNT, all N18.
- **Tick links.** I checked 37 lessons from Pre-K to Grade 5, including 9 site lessons and 2 rules lessons:
  - Pre-K CC5/1, CC8/1, G2/4 and G6/10;
  - K D1/26, D2/23, D5/1 and E/17;
  - Grade 1 D1/25, D3/12, D4/13 and E/26;
  - Grade 2 D1/9, D2/2, D2/3, D2/11, D3/17, D3/20, D3/49 and E/14;
  - Grade 3 D1/7, D2/14, D3/25, D5/2 and E/23;
  - Grade 4 D1/13, D2/24, D3/14, D4/7 and D5/20;
  - Grade 5 D1/6, D2/6, D3/17, D4/22 and E/16;
  - K "6, 7 and 8 counting and subitising";
  - Grade 5 "Divide a 2-digit number by 100".

  In each I chose Everything, made the Practice link and decoded it. In 36 of the 37, the decoded skills equal the links.
  Grade 5 D4/22 lacks `mixed_angles_lines` (N18).
- **Option differences.** Of the 32, 30 are defaults after `normalizeOptions`. The other 2 are N33 on Grade 3 D1/7.
- **Reading by eye** (42 lessons, `sample.txt`). Every order word and week checks against the school weeks.
  - Grade 1 E/20 "Count money": 'Taught earlier this year: "Count in 2s, 5s and 10s" (weeks 4 and 5).'
  - Grade 4 D3/4: 'Taught the same week: "Add two or more fractions" (week 16). Revisited in this grade's support block,
    week 16.' This is true, though the week is said twice.
  - Grade 5 E/11 "Recipes": 'Taught before, in Grade 2: "Scaling"; in Grade 4: "Solve problems with multiplication and
    division". Revisited in this grade's support block, week 35.'

## Teacher tasks (all four viewports unless noted)

- **Lesson rows.** Single tick, the quick groups, Everything and Clear work, and so does "more". "Same reason as above"
  is a tag, not a control.
- **Print.** Lesson → Print → Back → Forward → Back works (N34 fixed). The detailed lessons do the same when they build.
- **Detailed cards.** Open the detailed lesson (a new tab, `noopener`), Practice link and Make it all work, as in the
  table above.
- **Skills to be made.**
  - Home → Skills to be made works, and so do the chips, the Other filter and search ("Showing 74 of 448").
  - Print of the list works.
  - The entries open, and the r7 Back and reload behaviour holds (r5 probe, no difference).
- **MAP.** All the r5/r7 probe steps give the same output as r7.
- **Fallback (1366).** All flows pass, and the probe output equals r7's apart from data counts.
- **Console.** No errors from the lane. The Print screen's preview frame aborts its Andika font requests (`requestfailed`)
  while a detailed pack builds. The builder recorded this, and it is the print lane's issue.

## Gates (critic's own runs, one at a time, on `848d7d3f`)

| Gate | Result |
|---|---|
| ws-boot-smoke | OK |
| ws-teacher-wrm (as shipped) | OK. Skills to be made 448 entries, 12,392 lines; MAP 261 tasks, 88,965 lines; 1,070 lessons, 274,131 lines; 0 not plain. NOTE at 1366 and 390: `g3-oa9-mult-table-patterns` could not be built on the Print screen with its seed. |
| ws-teacher-wrm --curated data/curriculum/links | OK (the same NOTE) |
| ws-teacher-wrm --fallback | OK (1,070 lessons, 289,664 lines) |
| ws-wrm-page-unit | OK (1,070 lessons, 897 mapped) |
| ws-wrm-page-unit --curated data/curriculum/links | OK |
| ws-plain-words --check | OK (3,060 words) |
| ws-site-lessons --check | OK (143 lessons, 34 assessments, 424 steps with site fields) |
| ws-wrm-sequence.py --check | OK |
| ws-teacher-shell | OK |
| ws-chromebook-fit | OK |
| ws-code-snapshot | OK (608 codes, 35 categories, no move or delete) |

The M11 gate checks the shape of a "How it looks" line. It does not check that the line agrees with the entry's own
`answer` field or with its Kind line. That is the gap M12 comes through.

## Major defect

**M12 · "How it looks" states a drawing or a response the entry does not have (Skills to be made, C2 7).**
- **Where:** `todoLooks` in `js/modules/todo-text.js:130–144`, with the `DRAWS` table (`:80–92`) and the `ANSWERS` table
  (`:93–97`). `rep` is the representation plus `problemTypes`. The first `ANSWERS` regex that hits picks the verb, and
  the entry's `spec.answer` is never read.
- **What, with examples:**
  - **Contradiction inside one entry.** `map_share_among` has the Kind line "How the pupil answers: drag" and the
    representation "pupil draws the counters in, writes …". It says "Shows counters, groups of objects and shapes …; the
    pupil circles the answer." The word "circles" comes from "empty circles". "Shapes" comes from "outline counters".
  - **Wrong response, against `answer`.** I found 18 of 45 that contradict:
    - `mult_4x1` (answer "write the product in the grid") says "matches the pairs";
    - `write_numerals` (answer "the written numeral in a large box") says "matches the pairs";
    - `hundreds_foundation` says "matches the pairs";
    - `count_objects_more` (answer "write the number") says "circles the answer", from "how many in the circle?";
    - `hv_lines` (answer "write H or V") says "draws the answer";
    - `sign_meanings` (answer "write or circle the sign") says "matches the pairs";
    - `volume_fractional`, `stack_base10_support`, `routine_hour`, `explain_strategy`, `pattern_pairs_graph`,
      `part_whole`, `tens_any`, `money_uk`, `add_three_forms`, `pictures_to_sentence`, `words_0_10` and `consolidate`.
  - **Wrong response, no `answer` field** (my 40-line sample):
    - `map_ratio_picture` ("pupil writes stars : circles") says "circles the answer";
    - `ratio_language` (a word-bank sentence frame) says "circles the answer", from "filled and open circles".
  - **Drawings that are not there:**
    - "shapes", from "outline", on 11 entries: `tenths_only`, `frac_total_band`, `equiv_from_unit`, `fd_place_band`,
      `more_less_all`, `money_compare_written`, `map_money_build`, `map_share_among`, `add_sub_place_units`,
      `l_ml_convert` and `map_ratio_picture`;
    - "coins and notes" on 3 percent entries (`cents?\b` matches "per**cent**"): `f_to_p_denoms`, `percent_multi` and
      `map_percent_of_grid_bar`;
    - "shaded fraction pictures" on `patterns_notice`, which has no fractions (from "shade the pattern in the table").
- **Why major:** this is the screen where the teacher decides what to ask the build team for. A line that names the
  wrong picture or the wrong response is worse than r7's unreadable ids. The reader cannot tell it is wrong, and it
  contradicts the Kind line two rows above. Ruling 6 asks for sentences composed from structured fields; this one guesses
  from free text while the structured field (`answer`) sits unused.
- **Fix (cheap, one function):**
  1. Take the response from `spec.answer` when it exists: write, type or box → "writes the answer"; tick or True/False →
     "ticks a box"; circle or ring → "circles the answer"; draw, mark or plot → "draws …"; match → "matches …"; drag →
     "drags …". With two responses ("write the total; ring the pair"), name both or the first. Read `option` too, as with
     "How the pupil answers: drag".
  2. With no `answer` field, leave the response clause out. Do not guess it from problem types.
  3. Tighten `DRAWS`:
     - `\bcents?\b`, not `cents?\b`;
     - drop "outlines?" from the shapes regex;
     - "shaded fraction pictures" only when the text names a fraction or a fraction model (`fraction|tenths|halves|…`),
       not on a bare "shade";
     - `\bcircles?\b` as a shape or arrangement is not a response.
  4. Gate (`ws-wrm-page-unit`): for every entry with `spec.answer`, the looks verb must agree with the answer. "Shapes"
     needs a shape word in the source, "coins" needs a money word, and "shaded fraction pictures" needs a fraction word.
     The looks line and the Kind line may not name different responses.
- **Check:**
  - `looks.mjs` finds 0 contradictions against `answer` and 0 false drawings.
  - `map_share_among` either has no response clause or reads "drags …".
  - `mult_4x1` reads "Shows a column method and an area model in black and white; the pupil writes the product." Also
    map `stack` to "a column method" in `KIT_WORDS`: "a column sum" is wrong for × and ÷ entries.

## Minor defects

- **m18 · The same lesson label several times in one gap list (Skills to be made, C4).**
  - 14 entries have 26 extra lines:
    - `more_less_pictures`: 'Pre-K, "1 more": …' five times, and 'Pre-K, "1 less": …' five times;
    - `band_3`: three times each;
    - `capacity_early`: 'Pre-K, "Compare capacity"' twice;
    - `compare_size`, `shape_build_kit` and `shape_draw`: 'Kindergarten, "Build and draw shapes"' or similar, twice.
  - These are different steps or site lessons with the same title, so the teacher reads the same lesson several times,
    each with a slightly different note.
  - Fix: group notes under one label ('Pre-K, "1 more" (three lessons): …'), or add the unit or week to tell them apart.
- **m19 · "Make it" can land a teacher on a dead end (detailed-lesson card, C1).**
  - The failure itself is the lesson maker's, and it is the same on main.
  - The lane's screen presents it badly:
    - "Make it" (`printDetailedLesson`) uses a fresh random seed, so the same button works or fails at random. It
      failed on 3 of 6 seeds for "Patterns on the multiplication table", and on the gate's seed.
    - On the Grade 1 lesson the tab is busy for about three minutes (189 s here) before it fails.
    - The teacher then reads "This page could not be built. Try another page type, or the auto-layout worksheet under
      Page setup." (`r8-dl-g3-oa9-mult-table-patterns-make-*`, `r8-dl-g1-oa1-bar-model-wp-20-make-1366`). For a
      detailed lesson that is the wrong advice, and the ready PDF is one Back away but not mentioned.
  - Fix, in the lane:
    - Make it uses the seed the lesson file was built with (or a seed known to build). On failure it tries the next
      seed once.
    - Then it says, on the Print screen, "This lesson could not be made with these choices. Press Back and use 'Open the
      detailed lesson' for the ready-made file." Two lines in `printDetailedLesson` and the error branch.
  - Record the >3-minute Grade 1 build for the lesson-maker lane.
- **m20 · The card names the lesson's skills, and the list under it says there are none (C2).**
  - On Grade 3 D1/16, "Properties of multiplication" and "Find the rule …", the card says "Its skills: Multiplication
    Chart (Visual), …". Directly below it, "Skills that teach this lesson 0" says "Skills not tagged yet: no skill is
    linked to this lesson so far." (`r8-dark-dl-1366`, `r8-dl-g3-oa9-mult-table-patterns-390`).
  - Fix: when a lesson has no tagged teaching skills and has a detailed lesson, list the detailed lesson's main skill
    (its `role` "main") as the teaching row. Otherwise word the empty line "Not tagged here yet; the detailed lesson
    above names its skills."

## Nits

- **n39** (m15 residue): one Do-first line sits inside the next in 5 lessons. Grade 1 D2/6 and D2/9: 'Taught earlier this
  year: "Bonds to 10" (week 9).' and then the same line followed by 'Taught before, in Kindergarten: "Part-whole
  model".' (`r8-g1-d2-9-prereq`). The others are Grade 5 D4/4, D4/16 and E/1. Treat a line that starts with an earlier
  row's whole line as the same reason, plus its extra clause.
- **n40:** the `vis_*` entries say their name three times: as the name, in "What pupils will do" ('New pictures on
  worksheets and on screen: "Gattegno Chart". The pupil answers from the picture.') and in "How it looks" ('A new
  black-and-white line drawing: "Gattegno Chart", …'). The build list's priority marker shows in two names: "Reasoning
  Frames (low)" and "Hands-On Card and Game Pages (low)". Drop "(low)", and say the name once.
- **n41** (fallback only): `vis_more_less_table` is still named "A new picture in Number & Operations in Base Ten".
- **n42:** the detailed card says "Detailed lesson: I Can solve word problems with a bar". The Print screen's lesson list
  says "I Can solve stories with a bar". The data file and the lesson maker disagree, so use one source.
- **n43:** on "Patterns on the multiplication table" the card shows no "Still to make", although its proposal
  (`patterns:notice_patterns`) is the Skills to be made entry "What Do You Notice?". Name the entry instead of hiding the
  item.
- **n44:** gap leads use two forms: "3.OA.D.8: not yet fully taught." and "Not yet fully taught: 1.OA.B.3.". One line
  has no full stop: 'MAP asks which equation matches "35 is 5 times as many as 7"'.
- N18, N27 and N33: unchanged (tagging lanes, owner ruling).

## Fix list (to pass round 9)

1. **M12.** Compose "How it looks" from `spec.answer` (and the option's "How the pupil answers"). Drop the response
   clause when there is none. Tighten `DRAWS` (cents, outline, shade, circles), and add the agreement gate.
2. m19 and m20 are cheap and live on the lane's own detailed card. Fix them too.
3. m18 and n39–n44 are optional.

## Screenshots (this folder; 1366 and 390 of each unless noted)

- `r8-todo-map_share_among-*.png`: **M12**. Kind "How the pupil answers: drag" against "the pupil circles the answer".
- `r8-todo-mult_4x1-*.png`: **M12**. "the pupil matches the pairs" for a write-the-product option. M11 is fixed (no "Stack,
  area-model.").
- `r8-todo-patterns_notice-*.png`: **M12**. "shaded fraction pictures" on a multiplication-table entry.
- `r8-todo-ruler_cm-*.png`: m17 fixed. One lead-in for the lessons with no note.
- `r8-todo-vis_frac_area_modes-*.png`: M11 fixed. The picture is named by its White Rose representations (n40: said three
  times).
- `r8-g4-d2-3-prereq-*.png`: m15 fixed. The second "Round to the nearest 10" row is "Same reason as above".
- `r8-g1-d2-9-prereq-*.png`: n39. One line inside the next.
- `r8-dl-g1-oa1-bar-model-wp-20-*.png`: the detailed-lesson card. `-make-1366`: the Print error after 189 s (m19).
- `r8-dl-g3-oa9-mult-table-patterns-*.png`: the card, with "Skills not tagged yet" below it (m20). `-make-*`: "This page
  could not be built" (m19).
- `r8-g3-d1-dl-tags-*.png`: the "Detailed lesson" row tags in Grade 3 D1.
- `r8-dark-dl-*.png`: dark mode, detailed card.

The critic scratch folder is outside the repo (`scratchpad/c8/`). It holds:
- `truth.mjs`, `near.mjs`: the truth and near-repeat checks;
- `dump.mjs`, `looks.mjs`, `looks-r8.mjs`: the dumps and the looks-against-data check;
- `sample.txt`: the 42 lessons read by eye;
- `sweep7.cjs`: the 1,070-lesson sweep and 37 Tick links;
- `norm.mjs`: the option-default check;
- `p8.cjs`: the four-size probe;
- `probe.cjs`: the r5 regression probe;
- `seeds.cjs`, `hang.cjs`: the detailed-pack builds compared with main.
