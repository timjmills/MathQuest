# Y1 (US Kindergarten) site lessons: independent critic, round 3

Critic: independent critic (Opus 5.5, medium effort), 2026-10-17. I only graded. I did not edit `Y1.json`, the site files or the tooling.

Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-lessons-y1` at 1e5b9c7e. The file is `data/curriculum/links/Y1.json` (sha256 `e6f63aeb…`), section `lessons`:

- 39 lessons: 7 full, 28 partial, 4 gap;
- 167 links (116 pre / related judged by lessonfit);
- 29 proposals used by lessons: 3 new (`classify_count_all`, `shape_build_kit`, `solids_turned`) and 26 reused.

## Verdict: PASS

| Gate | Result |
|---|---|
| Every lesson ≥ 8 | **Yes.** Min **8**. Lessons 5, 27 and 35 (7 in r2) are fixed and now score 8 |
| Mean ≥ 8 | **Yes.** 312 / 39 = **8.00** |
| Steps frozen | **Yes.** See §3. `year`, `generatedBy`, `steps` (same order, same key order) and `tagFixes` equal the Y1.json on origin `claude/sweet-newton-c8wrv1`. Origin is now at ad3e534c, and its Y1.json is still sha256 `da295cff…`. Of the 47 base proposals, in order, 32 are byte-equal and 15 only gain `lessons` / `lessonCloses`; 0 are changed. 14 lesson-only proposals are appended. `R.json` is `b7fd3ef6…`, equal to origin |
| 0 real merge conflicts | **Yes.** 0 real conflicts and 0 lesson tagFixes (§6) |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds are byte-identical to the committed file (§5) |
| Coverage complete | **Yes.** 39 / 39 site lessons, with the same ids, order, titles, flag, firstWeek and ccss. `ws-wrm-extract --check --site …` exits 0 |

Round 3 fixed every r2 row, and the root-cause sweep (S1-S21) holds on my items. I found no new false clause, why, verdict or audit row. What I did find is non-blocking:

- **G9.** The new gates are real but narrow. 10 of my wordings slip past them (§3). None of those wordings is in the file, because I read every why and clause by hand.
- **n9 to n12.** Smaller notes (§7).

## Method

- **Fresh seeds.** None of these is in the report, r1 or r2. Scripts are in `/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/y1lc3/`.
  - `samp.mjs` read every link of every lesson through `generateQuestionFor` (print path, the link's opts, Max Number, `itemIndex` / `itemCount`). It took 45 items a link at seed 52813, stride 67 (`s3.txt`).
  - `chk3.mjs` and `swp.mjs` read the payloads (`q.cell`, the visual) at seed 84017, stride 53. They used 60-200 items a skill: start numbers, zero shares, `payload.pic`, group sizes, which shapes are asked, the diamond distractor, and the number of distinct drawings.
  - `lessonfit --n 60` ran on `[[52813,67],[84017,53]]` and `[[11939,41],[70001,89]]`: **0 findings each.**
- **Rubric (the brief's).**
  - Each FULL lesson was graded against every clause of its title AND its K CCSS descriptor (`ccss-math.json`).
  - Each partial / gap clause was checked as true and complete.
  - The rule-5 claims were spot-checked in `skill-options.js` for 14 lessons.
  - Every pre / related why was read against at least 45 items.
  - Each pre was checked as earlier and not harder. Support lessons were judged at Reception against `phases.json`, whose phase-to-block map I checked against the older WRM Reception scheme.
  - The proposals were checked (§2).

## 1. Round-2 rows: all landed, all hold on fresh items

| Row | Holds? |
|---|---|
| F11 (lesson 5) | **Yes.** Partial on both forms of `name_3d_shapes`. Forms 0 draws each solid **1 distinct drawing** in 100 items (cube, cone, cylinder, prism, sphere). Forms 1 asks cones 50, cubes 42, cylinders 53 and spheres 55 in 200, and the pyramid never, so the clause "the prism and the pyramid are only drawn as distractors" is true. The missing clause and `solids_turned` ("any way up", an option on name_3d_shapes) are consistent with lesson 26. No K.G.A.2 / K.G.A.3 claim remains, and the audit row is gone. `solids_turned` is truly new: WRM_PROPOSALS, build-list and Y1 / R proposals have nothing that turns or resizes solids. `shape_sort` (flat or solid, K.G.A.3) exists, and the lesson rightly does not claim that clause |
| F12 (lesson 27) | **Yes.** `sub_5_pictures` starts from 2-5 (2:17, 3:25, 4:55, 5:103 in 200). The answer is 0 in 20 / 200, with payload `{kind:takeaway, n:4, m:4, ans:0}`: "about 1 in 10" is true. `count_sequence {band:10, dir:back}` asks "before 1" in 27 / 200 (about 1 in 7), and the other items ask before 2-7: true. The missing / `zero.lessonCloses` remainder (empty from the start) is exact. The three pre whys now say "never empty". `compare_groups {band:5, level:[1]}` groups are 1-5 in 200 items, never 0: true |
| F13 (lesson 35) | **Yes.** In `name_2d_shapes {forms:[1], shapes:[2]}`, 95 of 200 items ask for squares, 42 of them show 🔷 diamond, and the diamond is correct in 0. The new why says exactly that |
| G7 | **Yes.** The builder's p15-p18 and my new p19-p28 (§3) all exit 1. I re-checked the copies myself: the 9 R-copied ids equal R.json in every field but `closes` / `lessons` / `lessonCloses` / `source` / `steps` / `reused`; `shape_draw` equals WRM_PROPOSALS; `vis_story_strip` equals VISUAL_BUILDS, except for an empty `steps: []` |
| G8 | **Yes, for every r2 miss.** NOPIC "without any drawing", the positive picture claim, ASKED pyramid, "split into 2 equal groups", the fill order and R10 are all caught (§3). Near variants remain: G9 |
| n1 | **Yes.** Lesson 8 clause: add-more and put-together. `add_wp_10 {band:10}` has "in all?" in 32 / 100, "now?" in 68 / 100, and `pic` on 100 / 100 |
| n2 | **Yes.** The `count_sequence` whys say "the number after / before a number on a track" (lessons 8, 12, 39) |
| n3 | **Yes.** Lesson 29's note explains `more_less_10 {step:[1], band:20}` |
| n4 | **Yes.** Lesson 30's clause and lesson 31's note separate below from under |
| n5 | **Yes.** Lesson 13's row reads K.CC.C.6's "up to ten" against Phase 2. Its "groups of 1 to 5" holds in 200 items (sizes 1:15, 2:38, 3:41, 4:65, 5:41) |
| n6 | **Yes.** Lesson 32's row no longer claims K.CC.A.3 |
| n7, n8 | Recorded as skill / merge items. They are not this lane's to fix |

## 2. Lesson grades: all 39

| # | Lesson | Verdict | Score | Reasons (fresh items) |
|---|---|---|---|---|
| 1 | Add and subtract within 5 written vertically | full | 8 | Both skills give a column on every item. Numbers 0-5 (0 + 5, 5 − 5), no regroup row. K.OA.A.5 holds. The pres are W13 / W14. n10 on one pre why |
| 2 | Sort, count each group, total | partial | 8 | `classify_count {band:10}`: "Count only the …", answers 2-10. True. sort_groups + classify_count_all split the `missing` |
| 3 | Build and draw shapes | partial | 8 | shape_attributes forms 0 band 4: sides / vertices of a triangle, square or rectangle (answers 3 and 4). The clause is true. Rule 5 holds. n11: `shape_build_kit` overlaps the WRM_EXTENSIONS `shape_draw` entry "build and draw shapes with given defining attributes" (K.G.B.5) |
| 4 | Compose shapes from smaller shapes | full | 8 | compose_shapes gives Hexagon 46, Rectangle 54, Square 50, Triangle 50 in 200. compose_hexagon uses trapezoids, rhombi and triangles. K.G.B.6 holds. The S3 / S4 corrections are true |
| 5 | 3D shapes | partial | 8 | F11 fixed (§1). Both clauses, the `missing`, the note and the build are true and consistent with lesson 26 |
| 6 | 6, 7 and 8 | partial | 8 | count_objects frame / dice deal 1-10. Both clauses are true. The WINDOW-corrected whys hold ("(4 and 5 among them)") |
| 7 | 9 and 10 | partial | 8 | Both clauses are true. The pres are R.B9 / R.B1, before Phase 7 (R.B11) |
| 8 | Adding more | partial | 8 | n1 fixed. The related `sub_5_pictures` "start with a pictured group to 5" is true |
| 9 | Bonds to 10 | full | 8 | make_ten band 10: parts 1-9, 10-12 each in 100. K.OA.A.4 holds |
| 10 | Building numbers beyond 10 | partial | 8 | teen_compose / ten_frame_build_teen deal 11-19, never 20. The related number_seq_fill tracks run 0-20 and past 10: true |
| 11 | Circles and triangles | partial | 8 | The clause is true: never a circle, answers 3 / 4 only. n10 on the classify_count why ("sorting objects to a type") |
| 12 | Combining 2 groups | partial | 8 | `add_wp_10 {band:7}`: max 7, 8 never, `pic` 100 / 100, "in all" 34 / 100. Clause true. n2 fixed |
| 13 | Compare amounts | full | 8 | Groups 1-5, level 1, no counts. K.CC.C.6 holds at Reception (n5) |
| 14, 15 | Compare capacity (1) / (2) | gap | 8 | Honest gaps; capacity_early. The pres are R.B1 / R.B2, before Phase 5 |
| 16, 17 | Compare mass (1) / (2) | full | 8 | heavier / lighter, 2 or 3 objects. K.MD.A.2 holds pictorially (owner question 6) |
| 18 | Compare size, mass and capacity | partial | 8 | Both clauses are true. compare_size + capacity_early |
| 19 | Comparing numbers to 10 | partial | 8 | Level 2 `showCounts` on 50 / 100. Groups 2-10. The `missing` is exactly K.CC.C.7 |
| 20 | Comparing numbers to 5 | partial | 8 | As 19, with groups 1-5 |
| 21 | Composition of 1, 2, 3 | partial | 8 | number_bonds band 5: wholes 2:9, 3:67, 4:40, 5:84 in 200, never 0. The clause is true. Rule 5 holds (bands 5 / 10) |
| 22 | Composition of 4 and 5 | partial | 8 | The clause is true. The dice why "(4 as 2 and 2)" is true |
| 23 | Counting patterns beyond 10 | partial | 8 | `count_sequence {band:20}`: about a quarter of the items are below 10 ("many"). Rule 5 holds (bands 10 / 20 / 100) |
| 24 | Deepening understanding | partial | 8 | Both clauses are true. Two builds |
| 25 | Doubling | partial | 8 | doubles_near_doubles forms 0 gives 2-20. double band 20 gives 4-20 with "Add another equal bar". halve band 10 gives half of 2-10. All true |
| 26 | Explore 2D shapes | partial | 8 | Fixed glyphs. The clause is true; defining_attributes |
| 27 | Introducing zero | partial | 8 | F12 fixed (§1). The two partials, the `missing`, the pres and the note are true |
| 28 | Making pairs | partial | 8 | odd_even forms 2: three written numbers to 10, pick odd or even. The clause is true |
| 29 | One more and less within 5 | partial | 8 | Both clauses are true. n3 fixed |
| 30 | Positional language | partial | 8 | Beside 15, Between 15, Above 10, Below 5. The clause is true, with below ≠ under stated |
| 31 | Positional language (on, under, in, next to) | partial | 8 | forms 1 gives Beside 60 / 60. True. Rule 5 holds |
| 32 | Represent numbers to 5 | full | 8 | ten_frame_build band 5: 1-5, 20 each in 100. K.CC.B.4 / B.5 hold; n6 fixed |
| 33 | Shapes with 4 sides | partial | 8 | Both clauses are true. The `missing` is the square / rectangle comparison |
| 34 | Sort by one attribute | partial | 8 | classify_count band 6: apples 25, balls 25, fish 23, flowers 27; answers 2-6. The OBJN-checked clause is true |
| 35 | Spatial reasoning (1) | partial | 8 | F13 fixed (§1). The clause, the builds and the other pres are true |
| 36 | Spatial reasoning (2) | partial | 8 | The clause is true; decompose_shapes is verbatim R |
| 37 | Spatial reasoning (3) | gap | 8 | Honest gap. The pres are R.B15 / R.B12 / R.B4, before Phase 10 (R.B16) |
| 38 | Spatial reasoning (4) | gap | 8 | Honest gap. One pre, with a note |
| 39 | Taking away | partial | 8 | sub_5_pictures starts at 2-5. `sub_wp_10`: `pic` is null on 100 / 100, and its only svg is a 0×0 defs block. "No pictures to cross out" is true. n12 |

**Sum 312 / 39 = 8.00; min 8.**

**The seven FULL lessons.** Lessons 1, 4, 9, 13, 16, 17 and 32 hold against every title clause and every K descriptor:

- K.OA.A.5: within 5, both operations, fact recall in a column;
- K.G.B.6: two pieces join into a larger shape; the hexagon is filled with blocks;
- K.OA.A.4: 1-9 to 10 with a frame drawing and the number recorded;
- K.CC.C.6: matching and counting two groups, at Reception;
- K.MD.A.2: direct comparison of mass with the heavier / lighter words;
- K.CC.B.4 / K.CC.B.5: given a numeral, build that many.

Each audit row's text matches the items.

**Rule-5 spot-checks in `skill-options.js`.** Lessons 5, 6, 10, 12, 19, 20, 21, 23, 25, 29, 30, 31, 34 and 39:

| Skill | Options it has |
|---|---|
| `name_3d_shapes` | forms (name / click) and a shapes kinds filter only, so nothing turns |
| `count_objects` | band 5 / 10 / 20, objects, orientation |
| `teen_compose` / `ten_frame_build_teen` | band 15 / 19, never 20 |
| `add_wp_10` / `sub_5_pictures` / `add_5_pictures` | a pictures switch only |
| `sub_wp_10` | no schema |
| `compare_groups` | dir, band 5 / 10, level |
| `number_bonds` | band 5 / 10, unknown |
| `count_sequence` | band 10 / 20 / 100, dir, level |
| `doubles_near_doubles` | forms |
| `patterns:double` | band 20 / 50 / 1000 |
| `shape_positions` | forms: Above-and-below, Beside, Between |
| `classify_count` | band 3 / 6 / 10, tiles |

Every "no existing option" claim holds.

**Pre earlier and not harder.**

- Every Support pre cites an R step of a block before its phase's first block. My map of phase to block is: 3→R.B3, 4→R.B5, 5→R.B7, 6→R.B9, 7→R.B11, 8→R.B13, 9→R.B14, 10→R.B16, 11→R.B17.
- Committee pres cite W01-W14 for W15 / W21, or Reception steps for the W29 shape lessons, because block Y1.B3 has no school week.
- Pre links fit the lesson's ceiling. The one stretch is lesson 12's `count_sequence {band:10}` (to 10 for a Phase-6 lesson), and band 10 is that skill's smallest band.

**Proposals.**

- Every build lists its lesson.
- `closes[lesson]` / `lessonCloses[lesson]` equals the envision.
- With one build, `closes` equals the `missing`; with two, the builds split it.
- `solids_turned` is new and well formed: kind option, skill `name_3d_shapes`, its option, a B&W representation, and ccss K.G.A.2 / 1.G.A.1.
- The copies equal their sources (§1, G7).

## 3. Gates: my mutations

**`mymut3.py` / `mymut3b.py`, lessonfit on a mutated copy (`WRM_FULL_AUDIT` for the audit-row cases).** These are my r2 suite, the r2 defects re-injected, and new mutations aimed at the edges of the new rules.

| Result | Mutations |
|---|---|
| **Caught: 41** | <ul><li>All 24 real r2 mutations, including the 9 r2 misses: NOPIC "without any drawing", the positive picture claim, ASKED pyramid, "split into 2 equal groups", the fill order, the turned compose why and R10.</li><li>F13 re-injected.</li><li>F12 "never 0 as a number to write" (NEVER0).</li><li>n2 "zero is the count when there are none" on count_objects (ZERO).</li><li>A "none / empty" claim on compare_groups (ZERO).</li><li>WINDOW "building 9 and 10".</li><li>ORIENT "drawn upside down and on their corners".</li><li>ORIENT "turned and resized" on lesson 5.</li><li>OBJN "cookies".</li><li>STORY "add-more stories" with no put-together.</li><li>NOPIC "never pictured" on the bag.</li><li>A bound "to 100".</li><li>Lesson 5 flipped back to FULL.</li><li>STD_ITEM K.G.A.2, K.G.A.3, the r2-style "K.G.A.2 / K.G.A.3, which the two forms deal", and K.CC.A.3.</li><li>GROUPRANGE "groups of 2 to 5".</li></ul> |
| Passed, by design: 4 | <ul><li>"numbers to 7" inside the 1.5× slack.</li><li>The G6 cylinder control.</li><li>A lesson 5 FULL row that says orientation is *not* dealt (my r2 route b, an honest row).</li><li>A single-number window, "counting a group of 5" (WINDOW reads two or three numbers).</li></ul>Discarded: 3 first-run audit-row mutations. My wording put "site tag" in the code's own sentence, so I re-ran them as `mymut3b.py` (counted above) |
| **Missed: 10 (G9)** | <ul><li>**ZERO:** "an empty frame shows 0" / "zero is the count when there are none" on `count_sequence` / `number_seq_fill`. Any 0 shown on a number track counts as "dealing 0", though no group is empty.</li><li>**NEVER0:** "the answer is never zero", because the negated part must also say write / answer / find.</li><li>**WINDOW:** "representing 9 and 10" and "groups of 4 and 5 pictures". Only six verbs are read.</li><li>**ORIENT:** "big and small, tilted and upright".</li><li>**OBJN:** "ducks". The object list is closed at 15 words.</li><li>**STORY:** "stories where some more come and join, only that kind". Only the literal "add-more stor…" is read.</li><li>**GROUPRANGE:** "2 to 5 counters in each group". Only "groups of A to B" is read.</li></ul>And **STD_ITEM** (the 10th) skips a whole sentence that contains "not", "no", "never" or "site tag". "The content is K.G.A.2: named regardless of orientation and size, not only upright" passes |

None of the G9 wordings is in the file: I read every why and clause against the items (§2). G9 is a gate-strength row, not a lesson defect.

**`postmut.sh`, post-`finish()` edits in clean `git archive HEAD` trees with the full `build.py` (trees deleted after each run).**

| # | Mutation after finish() | Result |
|---|---|---|
| p0 | none (control) | exit 0 |
| p1-p18 | r2's p1-p16 plus the builder's p17-p18 (re-option, verdict flip, lessonCloses, lessons emptied, missing, step verdict, full + build, why bound, related why, site.ccss, band_3 key, tagFix naming a lesson, lesson deleted, pre key in related, `classify_count_all.teaches`, compare_shapes kind / skill, `solids_turned.teaches`, `shape_draw.name`) | **all exit 1**: p6 / p12 by FROZEN, p13 / p14 by lessonspec, the rest by lessoncheck |
| p19 | `solids_turned.ccss` edited | exit 1 (lessoncheck) |
| p20 | lesson 5 envision `closes` edited | exit 1 |
| p21 | `compare_size.representation` (an R copy) edited | exit 1 |
| p22 | an orphan proposal naming a lesson that does not build it | exit 1 |
| p23 | lesson 5 note re-claims K.G.A.2 | exit 1 |
| p24 | a lesson's `site.flag` edited | exit 1 |
| p25 | `shape_build_kit.kind` edited | exit 1 |
| p26 | `vis_story_strip.hosts` (a live copy) edited | exit 1 |
| p27 | lesson 27 partial `count_sequence` re-optioned | exit 1 |
| p28 | `zero.teaches` (a frozen base proposal) edited | exit 1 (FROZEN) |

## 4. Frozen steps (detail)

- **Origin.** `claude/sweet-newton-c8wrv1` is at ad3e534c (it moved since r2). Its Y1.json is `da295cff…` and its R.json `b7fd3ef6…`, both unchanged.
- **Diff.** Against the merge-base, the lane changes only `data/curriculum/links/Y1.json` among `data/` and `js/`.
- **Compared field by field.** `steps` (and every step's key order) and `tagFixes` are equal. The 47 base proposals sit first, in order: 32 equal, 15 with only `lessons` / `lessonCloses` added, 0 changed.

## 5. Coverage and reproducibility

- **Coverage.** `site-lessons.json` has 39 `wrmYear: "Y1"` entries. The lessons have the same ids, order and titles, and `flag` / `firstWeek` / `ccss` are equal. `node tests/scripts/ws-wrm-extract.cjs --check --site …/scratchpad/site/index.html` reports "up to date" for both files and exits 0.
- **Build A.** `git archive HEAD`, then R.json and Y1.json deleted, then `node tests/scripts/wrm-tagging/dump.mjs`, then `python3 tests/scripts/wrm-tagging/gen.py <root>`. That writes R `b7fd3ef6…` and Y1 `da295cff…` (= frozen). Then `WRM_TAG_DATA=<scratch> python3 tests/scripts/wrm-tagging/Y1/build.py` exits 0, with every gate 0.
- **Build B.** The same, with `TMPDIR` in scratch and no `WRM_TAG_DATA`. It exits 0, and its log equals A's apart from the hashes.
- **Result.** Both outputs are sha256 `e6f63aeb5b919801849c2077ebefb780bfe11b3ac17e91be2e1e4eb2698589c0` and `cmp`-identical to the committed file.

## 6. Merge (`merge3.mjs`, my own, with a self-test)

The lanes, all merged against live `js/modules/wrm.js` (equal on the worktree, main and origin):

- R, Y1, Y4, Y5 from the worktree;
- Y2, Y3 from `/home/user/MathQuest` (equal to the worktree's and origin's);
- Y6 from origin ad3e534c (`4da8c4f9…`, with its 24 lessons).

| Check | Result |
|---|---|
| tagFixes | R 76, Y1 80, Y2 75, Y3 78, Y4 166, Y5 175, Y6 148 |
| key\|step written by 2+ lanes | 1: `patterns:count_by_step_up\|Y2.B1.S15` (Y2 / Y4, the same partial; not Y1) |
| **Real conflicts** | **0** |
| Order independence | The file order, its reverse and 200 random orders give the same tag set |
| Own-step status after the merge | 0 mismatches in every lane |
| Foreign-step tagFixes | Y1 0 (Y4 1, the known one) |
| **tagFixes naming a site lesson** | **0** |
| Lessons = site entries | Y1 39, Y2 11, Y3 25, Y5 21, Y6 24: all exact and in order |
| Proposal ids shared by 2+ lanes | 124, with 0 differing kind / skill. 6 field differences, none of them Y1's: `odd_even_pairs.representation` is Y3's (Y1 = R); the rest are Y3 / Y5 / Y6 |
| `closes` string / dict mix | 81 shared ids, plus 15 Y1 `lessonCloses` to fold at the merge (owner question 1) |

**Self-test.** I mutated the current Y1 with:

- a `remove` on R's `classify_count|R.B1.S4`;
- a tagFix naming `K|-|bondsto10…`;
- `compare_shapes.kind` changed to option;
- "Taking away" deleted.

The script reports 1 real conflict, the result order-dependent (96 of 200 orders differ), 1 R own-step mismatch, 1 lesson-naming tagFix, 1 kind difference, and Y1 at 38 / 39 DIFF. So the zeros above are real.

## 7. Non-blocking rows (PASS: no fix table is required)

| # | Where | Note |
|---|---|---|
| G9 | lessonfit.mjs | Widen the new rules (§3):<ul><li>**ZERO:** a "zero / none / empty" claim needs an item that answers 0 or shows an empty group, not a 0 printed on a track.</li><li>**NEVER0:** any negated part naming 0 / zero.</li><li>**WINDOW:** read any "N and M" after a verb or noun ("representing", "groups of", "pictures of").</li><li>**ORIENT:** add tilted / upside down / big and small / every orientation.</li><li>**OBJN:** check every plural noun in an example parenthesis, not a closed list.</li><li>**STORY:** key on what the items are (the share of "in all?"), not on the literal "add-more".</li><li>**GROUPRANGE:** "A to B counters in each group" too.</li><li>**STD_ITEM:** negation per clause, not per sentence; "site tag" should exempt only its own clause.</li></ul> |
| n9 | lessons 8, 12, 39 | The `word-work` cell of `add_wp_10` / `sub_wp_10` also asks the pupil to choose the operation from + − × ÷ and a unit from a bank (e.g. "sticker, boxes, days"). For a lesson judged at Reception that is a heavy response mode. The clauses already make these links partial, but they should say it (rule 8) |
| n10 | lessons 1, 11 | Two whys the sweep's own classes would rewrite. Lesson 1's pre `sub_5_pictures` says "taking away from 5" while the items start from 2-5 (5 in about half); S7 / S21 fixed the same wording elsewhere. Lesson 11's pre `classify_count` says "sorting objects to a type" while the pupil counts one kind; S12 fixed this for lesson 21 |
| n11 | lesson 3 | `build-list.js` WRM_EXTENSIONS `shape_draw` already "adds build and draw shapes with given defining attributes" (ccss K.G.B.5). Either fold `shape_build_kit` into `shape_draw`, or say in the note why sticks-and-balls modelling is not that extension (rule 3: reuse first) |
| n12 | report | The report says "28 partial" and "29 proposals (3 new, 26 reused)". 6 lesson proposals carry `reused: false`: the 3 new ones, plus Y1's own `add_10_pictures`, `sub_10_pictures` and `number_focus`. Say "3 new to the lessons" to avoid a miscount at the merge |
| n7, n8 | skills, merge | As in r2: `name_2d_shapes` / `name_3d_shapes` forms 1 labels print the name; `name_3d_shapes` forms 0 uses legacy colour. Fold `lessonCloses` and normalise the `closes` mix at the merge |

**Owner questions.** Questions 1-7 of the report stand, with sound recommendations. Q7 now uses the corrected F12 clauses.
