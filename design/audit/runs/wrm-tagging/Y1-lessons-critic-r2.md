# Y1 (US Kindergarten) site lessons: independent critic, round 2

Critic: independent critic (Opus 5.5, medium effort), 2026-10-17. I only graded. I did not edit `Y1.json`, the site files or the tooling.

Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-lessons-y1` at 49ca3408, file `data/curriculum/links/Y1.json` (sha256 `66ba2bb5…`),
section `lessons`: 39 lessons (8 full, 27 partial, 4 gap), 166 links (116 judged by lessonfit), 28 proposals used by lessons (2 new, 26 reused).

## Verdict: FAIL

| Gate | Result |
|---|---|
| Every lesson ≥ 8 | **No.** Min **7**: lessons 5, 27 and 35 (F11-F13). The other 36 score 8 |
| Mean ≥ 8 | **No.** 309 / 39 = **7.92** |
| Steps frozen | **Yes.** `year`, `generatedBy`, `steps` (same order) and `tagFixes` equal origin's `Y1.json` (origin d8fe6136, still sha256 `da295cff…`). The 47 base proposals keep their order: 32 byte-equal, 15 only gain `lessons` / `lessonCloses`, 0 changed. 13 lesson-only proposals are appended. `R.json` is untouched (`b7fd3ef6…` = origin) |
| 0 real merge conflicts | **Yes.** 0 real conflicts, 0 lesson tagFixes (§6) |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds are byte-identical to the committed file (§5) |
| Coverage complete | **Yes.** 39 / 39 site lessons, same ids, order, titles and site fields; `ws-wrm-extract --check --site …` exit 0 |

Round 2 fixed every r1 data row (F1-F10) and the r1 gate rows hold on fresh seeds. What fails now are three defects, two of them
present since round 1 and missed by me then, and one introduced by the F2 fix:

- **Lesson 5 (F11).** It was made FULL, and its audit row says the content is "K.G.A.2 / K.G.A.3, which the two forms deal". Neither holds. Each solid is one fixed drawing, so K.G.A.2's "regardless of orientation or overall size" is not dealt; that is the very reason this file gives lesson 26 a partial. No item tells flat from solid, so K.G.A.3 is not dealt either.
- **Lesson 27 (F12).** The partial clause says "never 0 as a number to write", but the pupil writes 0 in 1 item in 10.
- **Lesson 35 (F13).** A pre's why says "finding every square and rectangle, whichever way it is drawn". The glyphs are fixed, and a turned square (🔷 "diamond") is dealt as a *non*-square distractor.

## Method

- **Fresh seeds.** None of these appear in the report or in r1:
  - `samp.mjs` read every link of every lesson through `generateQuestionFor` (print path, link opts, Max Number, `itemIndex` / `itemCount`). It took 50 items a link at seed 72421, stride 43 (`s2.txt`).
  - `chk.mjs`, `one.mjs`, `n3d.mjs` and `probe.mjs` read the payloads (`q.cell`, the visual). They used 40-100 items at seeds 5003 (stride 41 / 23), 991 / 37, 90901, 5511 / 29 and 7717 / 31.
  - `lessonfit --n 60` ran on `[[72421,43],[38003,61]]`, `[[15551,29],[66013,73]]` and `[[3007,89],[44441,19]]`: **0 findings each.**
- **Rubric.** The brief's rubric:
  - each FULL lesson against every clause of its title AND the K CCSS descriptor (`data/standards/ccss-math.json`);
  - each partial / gap clause, that it is true and complete;
  - the rule-5 "no existing option" claims, re-checked in `js/modules/skill-options.js` for 14 partial / gap lessons;
  - every pre / related why, against 50 items (all 107 pre / related links);
  - each pre earlier and no harder, with Support lessons judged at Reception against `phases.json`;
  - the proposals: `closes` / `lessonCloses` / envision, and the reused ids verbatim against R.json, WRM_PROPOSALS and VISUAL_BUILDS.
- **Scripts.** Everything is in `/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/y1lc2/`:
  - `mymut2.py` and `mymut2.log`;
  - `postmut2.sh` and `lessonmut.log`;
  - `merge2.mjs`, `Y1.selftest.json` and the build logs `archA.*.log` / `archB.*.log`.
  - The trees were removed after use: the disk filled once (ENOSPC), and every run affected by that was redone.

## 1. Round-1 rows: all landed

| Row | Holds on fresh items? |
|---|---|
| F1 | **Yes.** `add_facts {notation:[stacked], band:5}`: the fact cell with `notation: vertical` on 60 of 60. `sub_facts {…band:5}`: `facts-column-visual` on 60 of 60. The largest number is 5, there is no borrow row, and `k_vertical_5` is gone. Lesson 1 is FULL with an audit row |
| F2 | Forms 0 is linked: all five solids are named, Rectangular Prism 8 of 60. `cuboid_find` is gone. But the FULL verdict brings a false audit claim: **F11** |
| F3 / n2 | **Yes.** `add_wp_10` pictures both groups on 60 of 60 at bands 7 and 10, and both clauses now say so |
| F4 | **Yes.** `compare_groups {level:[1,2]}` sets `showCounts` on 30 of 60 at bands 5 and 10. The clause, `missing` and `compare_small` closes now name only numerals alone, with greater / less than |
| F5 | **Yes.** The lesson 24 clause names the prism as a distractor only |
| F6 | **Yes.** `share_into_groups` is dropped. `halve {band:10}` ("Split the bar into 2 equal parts", half of 2-10) and the partial `double {band:20}` ("Add another equal bar") are both true |
| F7, F8, F10 | **Yes.** The why is rewritten (one counter in each box), and the two pres are dropped, each with a "Pre-skills are few" note |
| F9 | **Yes.** `shape_attributes {forms:[0], band:4}` is a partial, and its clause says vertices, not corners, and triangles too. The `missing` is the square / rectangle comparison |
| n3, n4, n6, D1 | **Yes.** All are in the notes or the report. `build.py` names `dump.mjs` as step 0 |
| G1 | **Yes.** p1-p8 (re-made by me in clean `git archive` trees of 49ca3408) all exit 1: p6 by the frozen gate, the rest by lessoncheck / lessonspec / lessonfit. New hole: **G7** |
| G2 | **Partly.** The r1 cases are caught: the NOPIC wording "no pictures to count", the cuboid ASKED and "sharing". Near variants are missed: **G8** |
| G3 | **Yes.** Lesson 1 with both links at `notation:[across]` and the audit row edited to match: TITLEREP FULL "written vertically … 0 of 80". The stacked control is silent on columns |
| G4 | **Yes, as a presence check.** A FULL lesson with no row, or a row whose links differ, fails (lesson 33 made full; lessons 9, 13 and 16 re-optioned). The row's *text* is not checked, and lesson 5's false row passes (F11) |
| G5 | **Yes.** "wholes to 20" on band 5, "numbers to 9" on band 5 and "1 to 20" in a band-10 clause are caught. "numbers to 7" on band 5 passes, inside the documented 1.5× slack |
| G6 | **Yes.** A cylinder named first among solids is not read as a ruler, and 9 seed pairs (3 mine) give 0 findings |

The builder's `lessonmut.py`, run on 49ca3408: **59 mutations, 0 missed.**

## 2. Lesson grades: all 39

| # | Lesson | Verdict | Score | Reasons (fresh items) |
|---|---|---|---|---|
| 1 | Add and subtract within 5 written vertically | full | 8 | Every item is a column: the fact cell is vertical 60 / 60, and sub_facts uses the column visual 60 / 60. Numbers 0-5, no regroup row. K.OA.A.5 (both operations, within 5, fact practice) holds. The pres are W13 / W14, earlier than W15 |
| 2 | Sort into categories, count each group, find the total | partial | 8 | `classify_count` "Count only the …" 50 / 50; the clause is true. `sort_groups` + `classify_count_all` split the `missing`. The pres are W01 / W03 / W14 |
| 3 | Build and draw shapes | partial | 8 | `shape_attributes` asks only sides or vertices (answers 3 and 4). `shape_draw` (verbatim WRM_PROPOSALS) and `shape_build_kit` split the clause. The rule-5 claim holds: forms 1 is parallel sides and right angles, above K |
| 4 | Compose shapes from smaller shapes | full | 8 | `compose_shapes` (12 / 50 hexagons) and `compose_hexagon` hold for K.G.B.6 |
| 5 | 3D shapes (cube, cuboid, sphere, cone, cylinder) | full | **7** | **F11.** The title is dealt: forms 0 names all five, forms 1 asks four. But the note and the FULL_AUDIT row claim K.G.A.2 / K.G.A.3 "which the two forms deal". In 80 items forms 0 draws each solid ONE way (1 distinct drawing per solid), and forms 1 uses fixed emoji, so "regardless of orientation or overall size" is not dealt. That same fact makes lesson 26 partial (and its K.G.A.2 is a site tag, as this lesson's 1.G.A.1 is). No item asks flat vs solid (K.G.A.3). The site's 1.G.A.1 (non-defining attributes: orientation, size) is waved off as "not this lesson's content" |
| 6 | 6, 7 and 8: counting and subitising | partial | 8 | Both clauses are true (1-10). `number_focus` + `subitise`. The pres are R.B5 / R.B1 (Phase 6 starts at R.B9) |
| 7 | 9 and 10: count, represent, order | partial | 8 | Both clauses are true. The pres are R.B9 / R.B1 (Phase 7 starts at R.B11). Rule 5: `placevalue:order_*` starts at 99 |
| 8 | Adding more (First / Then / Now) | partial | 8 | F3 holds. n1: the clause says "add-more stories", but 21 of 60 `add_wp_10 {band:10}` items are put-together stories ("2 fish in a pond, 4 in a tank … in all"). The verdict does not depend on it |
| 9 | Bonds to 10 | full | 8 | `make_ten {band:10}`: frames 1-9, every pair dealt. K.OA.A.4 holds; 1.OA.C.6 is read as a site tag |
| 10 | Building numbers beyond 10 | partial | 8 | `teen_compose` / `ten_frame_build_teen` reach 19, never 20: true. `teen_structure` |
| 11 | Circles and triangles (properties) | partial | 8 | The clause is true (never a circle). The pre `compare_groups` (same / not the same) is accepted as comparison language at Phase 3, as in r1 |
| 12 | Combining 2 groups | partial | 8 | `add_wp_10 {band:7}`: pictured 60 / 60, totals to 7 (never 8), 19 / 60 combine. The clause is true. n2 on one pre why |
| 13 | Compare amounts (more, fewer, same) | full | 8 | `compare_groups {band:5, level:[1]}` holds at Reception. n5: the audit row should say why K.CC.C.6's "(include groups with up to ten objects)" is outside a Phase-2 lesson |
| 14, 15 | Compare capacity (1) / (2) | gap | 8 | Honest gaps; `capacity_early`. The pres are R.B1 / R.B2 |
| 16, 17 | Compare mass (1) / (2) | full | 8 | `heavier_lighter_visual`: K.MD.A.2 holds pictorially. The (1) / (2) difference is owner question 6 |
| 18 | Compare size, mass and capacity informally | partial | 8 | Both clauses are true. `compare_size` (verbatim R) + `capacity_early` |
| 19 | Comparing numbers to 10 | partial | 8 | F4 holds: level 2 writes the counts on 30 / 60. The `missing` is exactly K.CC.C.7 |
| 20 | Comparing numbers to 5 | partial | 8 | As 19 (band 5; 1.NBT.B.3 is a site tag) |
| 21 | Composition of 1, 2, 3 | partial | 8 | `number_bonds {band:5}`: wholes 2-5, no zero part. True. Rule 5: the smallest band is 5. `band_3` (verbatim R) |
| 22 | Composition of 4 and 5 | partial | 8 | The clause is true. `number_focus` (a window on number_bonds too) + `systematic_bonds` split it |
| 23 | Counting patterns beyond 10 | partial | 8 | Both clauses are true (many items below 10). Rule 5: `count_sequence` bands 10 / 20 / 100 |
| 24 | Deepening understanding (2D / 3D) | partial | 8 | F5 holds. Two builds |
| 25 | Doubling (up to 5 + 5) | partial | 8 | `doubles_near_doubles {forms:[0]}`: "Double it! 9 + 9", to 10 + 10, no picture. `double {band:20}`: "Add another equal bar", doubles 2-10. Both clauses are true. The related `halve` is a true inverse |
| 26 | Explore 2D shapes | partial | 8 | The clause is true: each shape is 1 distinct drawing in 80 items, at forms 0 and 1. `defining_attributes` |
| 27 | Introducing zero | partial | **7** | **F12.** `sub_5_pictures` answers 0 on 10 of 100 items ("Start with 4, take away 4", answer type number, `counters {n:4, m:4, ans:0}`): the pupil WRITES 0. The clause "never 0 as a number to write or find on a track" is false in its first half. The `missing` ("… and writing 0") overstates the gap by the same amount. n2: the pre whys "zero is the count when there are none" (count_objects) and "an empty frame shows 0" (ten_frame_build) describe content neither link ever deals (they start at 1) |
| 28 | Making pairs | partial | 8 | The `odd_even {forms:[2]}` clause is true. F7 holds |
| 29 | One more and less within 5 | partial | 8 | Both clauses are true. n3: the rule-5 sweep does not list `placevalue:more_less_10 {step:[1], band:20}` ("What is 1 more than 8?", the literal wording, to 20, no objects). It closes nothing (band 20, no pictures), so the verdict stands |
| 30 | Positional language | partial | 8 | `shape_positions`: Above / Below / Beside / Between only. True. F8 holds. n4: the clause says "never … under" while "Below" is dealt; say why below ≠ under |
| 31 | Positional language (on, under, in, next to) | partial | 8 | Forms 1 gives "Beside" on 50 of 50. Rule 5: the form values are Above-and-below, Beside and Between. n4 as 30 |
| 32 | Represent numbers to 5 | full | 8 | `ten_frame_build {band:5}`: 1-5, 10 each. Full at Reception, as R.B5.S3. n6: the audit row's K.CC.A.3 ("a numeral and a set of objects") overreads: the pupil builds from a numeral and never writes one |
| 33 | Shapes with 4 sides | partial | 8 | F9 holds; both clauses are true. Rule 5: `shape_corners_count {band:4}` has 2 distinct items, which I confirmed |
| 34 | Sort objects by one attribute | partial | 8 | `classify_count {band:6}`: one kind, 2-6. True; `sort_groups` |
| 35 | Spatial reasoning (1) | partial | **7** | **F13.** The pre `name_2d_shapes {forms:[1], shapes:[2]}` has the why "finding every square and rectangle, **whichever way it is drawn**". The items are fixed glyphs (🟦 square, ▭ rectangle, one drawing each), and 🔷 "diamond", a turned square, is dealt as a NOT-square distractor ("Click ALL the squares" → diamond is wrong). The claim is false, and in a rotate lesson it points the teacher at the opposite of what the items teach. In the file since r1 (I missed it then). The clause, the builds and the other pres are right |
| 36 | Spatial reasoning (2) | partial | 8 | F10 holds; the clause is true; `decompose_shapes` (verbatim R) |
| 37 | Spatial reasoning (3) | gap | 8 | Honest gap; `scenes`. The pres are R.B15 / R.B12 / R.B4 (Phase 10 starts at R.B16) |
| 38 | Spatial reasoning (4) | gap | 8 | Honest gap; `position_map`. One pre, with a note |
| 39 | Taking away | partial | 8 | `sub_5_pictures` from 2-5; `sub_wp_10` with `pic` absent on 60 of 60. Both clauses are true |

**Sum 309 / 39 = 7.92; min 7; 36 at 8, 3 at 7.**

**The eight FULL lessons.** Lessons 1 (K.OA.A.5), 4 (K.G.B.6), 9 (K.OA.A.4), 13 (K.CC.C.6, at Reception), 16 and 17 (K.MD.A.2) and 32 (K.CC.B.4) hold against their titles and descriptors. Lesson 5 holds against its title only (F11).

**Rule-5 spot-checks, in `skill-options.js`.** Lessons 3, 6, 7, 11, 21, 22, 23, 25, 27, 29, 30, 31, 33 and 39:

- **`shape_attributes`.** Forms 1 is parallel sides and right angles.
- **`count_objects`.** Band 5 / 10 / 20, and the objects option covers shapes, pictures, frame and dice.
- **`number_bonds`.** Band 5 / 10.
- **`count_sequence`.** Band 10 / 20 / 100.
- **`shape_positions`.** The forms are Above-and-below, Beside and Between.
- **`sub_wp_10` / `sub_5_pictures`.** Only a pictures switch.
- **`add_wp_10`.** Band 5 / 7 / 10.
- **`double`.** Band 20 / 50 / 1000.

Every "no existing option" claim holds. One candidate is missing from the sweep: n3 (lesson 29).

**Proposals.**

- Every proposal a lesson builds lists that lesson.
- Each `closes[<lesson>]` / `lessonCloses[<lesson>]` equals the envision. With one build it equals the `missing`; with two, they split it.
- The 9 R-copied ids differ from R.json only in `closes`, `lessons`, `source`, `steps` (and `reused`).
- `shape_draw` equals WRM_PROPOSALS, and `vis_story_strip` equals VISUAL_BUILDS, apart from the lesson fields.
- `number_focus` and `band_3` are multi-skill windows, so their use on number_bonds / count_sequence is within their spec.

## 3. Gates: my mutations

**`mymut2.py`, lessonfit on a mutated copy: 28 mutations.**

| Result | Mutations |
|---|---|
| **Caught: 17** | the r1-1 re-injection (lesson 12 "no pictures to count"); NOPIC "words only, never a picture"; the r1-10 re-injection (cuboid ASKED); "sharing equally between two" on share_into_groups; lesson 1 across (FULLAUDIT, and TITLEREP once the row is matched); a related across "in a column" (column and R_EQ); the stacked control (R_EQ only, column silent: correct); 3 bound claims (G5); lesson 33 made full; lesson 16 re-optioned; lesson 13 at band 10; lesson 9 at band 20 (RANGE + FULLAUDIT); a clause naming "below" on forms 1 (TITLEREP); lesson 7 citing its own source block (CITE H); lesson 2 citing a later step (WHY) |
| By design: 2 | "numbers to 7" on band 5 (inside the 1.5× slack); the G6 control (a cylinder named first among solids) |
| **Missed: 9** | **G8:** NOPIC "written without any drawing"; a POSITIVE picture claim on `sub_wp_10` ("every counter pictured to cross out", `pic` absent on 60 / 60); ASKED "clicks every … or pyramid" (the pyramid is only a forms-1 distractor; only the five title solids are gated); "a group split into 2 equal groups" on `share_into_groups` (grouping into 3s-6s; only the word share is gated). Hand-read by design: the r1-9 fill order. **In the file:** F12 (lesson 27), F13 (lesson 35) and a related why claiming turned shapes on compose_shapes, which are free-text claims. Rule 10 (same key in pre and related): lessonfit misses it, but `lessons.py` R10 and the lessoncheck snapshot catch it in the build (p14) |

**`postmut2.sh`, post-`finish()` edits in clean `git archive` trees of 49ca3408, full `build.py`.**

| # | Mutation after finish() | Result |
|---|---|---|
| p0 | none (control) | exit 0, sha `66ba2bb5…` |
| p1-p8 | r1's eight (re-option, verdict flip, `lessonCloses` edit, `lessons` emptied, `missing` edit, step verdict, full + build, why bound) | **all exit 1** |
| p9 | a related why edited | exit 1 (lessoncheck) |
| p10 | a lesson's `site.ccss` edited | exit 1 (lessoncheck) |
| p11 | `band_3.closes` given a non-lesson key | exit 1 (lessoncheck) |
| p12 | a tagFix naming a lesson | exit 1 (FROZEN) |
| p13 | a lesson deleted | exit 1 (lessonspec, lessoncheck, mergecheck) |
| p14 | a pre's key copied to related | exit 1 (lessonspec, lessoncheck) |
| **p15** | `classify_count_all.teaches` = "multiplying two-digit numbers" | **exit 0** (G7) |
| **p16** | `compare_shapes.kind` = option, `.skill` = name_2d_shapes (an id the report calls "verbatim from R.json") | **exit 0** (G7). Not even the merge check fires, because mergecheck does not compare shared proposal fields |

## 4. Frozen steps (detail)

- **Origin.** `claude/sweet-newton-c8wrv1` is at d8fe6136. Its `Y1.json` is sha256 `da295cff63f3…` and its `R.json` is `b7fd3ef66e2b…`. The worktree's `R.json` is byte-equal.
- **Diff.** Against the merge-base, the lane changes only `data/curriculum/links/Y1.json` among the data files; the rest is under `wrm-tagging`.
- **Compared field by field.** `steps` and `tagFixes` are equal (the steps in the same key order). The 47 base proposals sit first, in order: 32 equal, 15 with only `lessons` / `lessonCloses` added, 0 with any field changed.

## 5. Coverage and reproducibility

- **Coverage.** `site-lessons.json` has 39 `wrmYear: "Y1"` entries, and the lessons match them in ids, order and titles, with `site.flag` / `firstWeek` / `ccss` equal. `node tests/scripts/ws-wrm-extract.cjs --check --site …/scratchpad/site/index.html` reports "up to date" twice and exits 0.
- **Build A.** `git archive HEAD`, then R.json and Y1.json deleted, then `node tests/scripts/wrm-tagging/dump.mjs`, then `python3 tests/scripts/wrm-tagging/gen.py <root>`. That writes R `b7fd3ef6…` and Y1 `da295cff…` (= frozen). Then `WRM_TAG_DATA=<scratch> python3 tests/scripts/wrm-tagging/Y1/build.py` exits 0 with every gate 0.
- **Build B.** The same, with `TMPDIR` in scratch and `env -u WRM_TAG_DATA`. It exits 0, and its log is identical to A's apart from the sha line.
- **Result.** Both outputs are sha256 `66ba2bb55935344aca45d1929f22b97c6602a69cfdf01dc8cedbee603862c60f` = the committed file.

## 6. Merge (`merge2.mjs`, my own, with a self-test)

The lanes:

- R, Y1, Y4, Y5 from the worktree (Y4 and Y5 equal origin's).
- Y2 and Y3 from `/home/user/MathQuest/data/curriculum/links/` (byte-equal to the worktree's).
- Y6 from origin d8fe6136, with its 24 lessons.

All are merged against live `js/modules/wrm.js` (equal to origin's).

| Check | Result |
|---|---|
| tagFixes | R 76, Y1 80, Y2 75, Y3 78, Y4 166, Y5 175, Y6 148 |
| key\|step written by 2+ lanes | 1: `patterns:count_by_step_up\|Y2.B1.S15` (Y2 / Y4, the same partial; not Y1) |
| **Real conflicts** | **0** |
| Order independence | The file order, its reverse and 200 random lane orders give the same tag set |
| Own-step status after the merge | 0 mismatches in every lane |
| Foreign-step tagFixes | Y1 0 (Y4 1, the known Y2.B1.S15) |
| **tagFixes naming a site lesson** | **0** |
| Lessons = site entries | Y1 39, Y2 11, Y3 25, Y5 21, Y6 24: all exact and in order |
| Proposal ids shared by 2+ lanes | 124, 0 with a differing kind / skill. Y1's R-copied ids equal R.json. The field differences are other lanes' (`odd_even_pairs.representation` in Y3; Y5 / Y6) |
| `closes` string in one lane, dict in another | 81 shared ids, plus 15 Y1 proposals with `lessonCloses`: normalise at the merge (owner question 1) |

**Self-test.** I mutated Y1 with:

- a `remove` on R's `classify_count|R.B1.S4`;
- a tagFix naming `K|-|takingaway`;
- `compare_shapes.teaches` changed;
- lesson "Taking away" deleted.

The script reports 1 real conflict, the result order-dependent (96 of 200 orders differ), 1 R own-step mismatch, 1 lesson-naming tagFix, the `compare_shapes.teaches` difference, and Y1 at 38 / 39 DIFF. So the zeros above are real.

## 7. Fix table (FAIL)

| # | Lesson(s) | Fix |
|---|---|---|
| F11 | 5 (7) | The note and the FULL_AUDIT row claim K.G.A.2 / K.G.A.3 are dealt. They are not: one fixed drawing per solid (80 items, forms 0; fixed emoji in forms 1), and no flat-vs-solid item. Make it consistent with lesson 26, by either of two routes. **(a, preferred)** Verdict partial on the two forms, with `missing` = "naming the five solids whatever their orientation and size, and telling solids from flat shapes (K.G.A.2, K.G.A.3)", and a build (e.g. a 3-D option on `defining_attributes`, or a new turned / resized-solids option on `name_3d_shapes`). **(b)** Keep it full on the title alone: drop the K.G.A.2 / K.G.A.3 claim and say in the row why orientation and size are judged here but not in lesson 26 |
| F12 | 27 (7) | Rewrite the `sub_5_pictures` clause: the pupil writes 0 when every counter is crossed out (about 1 item in 10); never a set that is empty from the start, never 0 on a track or among other numbers. Re-scope `missing` / `zero` closes to that remainder: a set empty from the start (an empty plate) counted as 0, and 0 placed before 1. Fix the two pre whys (n2) to say what their items deal |
| F13 | 35 (7) | Rewrite the pre why: "finding every square and every rectangle among other shapes (each drawn one way up)". If the turned square matters to this rotate lesson, say that the link deals it as a "diamond" distractor, which `shape_fit_turn` / `defining_attributes` must undo |
| G7 | build.py / lessoncheck / mergecheck | Snapshot every field of the 13 lesson-only proposals (p15). Assert that the 9 R-copied ids equal R.json, `shape_draw` equals WRM_PROPOSALS and `vis_story_strip` equals VISUAL_BUILDS, except for their lesson fields (p16). Have mergecheck compare kind / skill / name / teaches of shared proposal ids |
| G8 | lessonfit CLAUSE / WHY | Widen NOPIC ("without any drawing / picture"). Gate POSITIVE picture claims ("pictured", "to cross out") against `payload.pic`. Make ASKED cover every solid or shape a clause says is clicked or found, not only the title five. Gate "split / share into 2 equal groups" like "share". Free-text claims such as F12 and F13 cannot be gated: read them by hand, as round 2 did for fill order |

**Non-blocking notes.**

- **n1.** Lesson 8: "add-more stories" also covers 21 / 60 put-together stories; say "add-more and put-together stories".
- **n2.** Some pre whys describe the step's idea, not the link's items:
  - lesson 27: "zero is the count when there are none", "an empty frame shows 0";
  - lesson 12: `count_sequence` "adding one object to a group", where the items are a number path.
- **n3.** Lesson 29: list `placevalue:more_less_10 {step:[1], band:20}` in the rule-5 sweep ("1 more than 8": the literal wording, to 20, no objects) and why it is not linked.
- **n4.** Lessons 30 and 31: "Below" is dealt while the clauses say "never under". Say why below is not under (or link forms 0 for 31).
- **n5.** Lesson 13's audit row: say why K.CC.C.6's "(include groups with up to ten objects)" is outside a Phase-2 lesson (ceiling 5).
- **n6.** Lesson 32's audit row: K.CC.A.3 is read loosely. The pupil builds from a numeral and never writes one.
- **n7.** Two skill defects for the skill catalogue, not this lane:
  - `name_2d_shapes` / `name_3d_shapes` forms 1 option labels carry the shape's name ("🟦 square"), so the answer can be read rather than recognised;
  - `name_3d_shapes` forms 0 draws in `--accent-purple` (the legacy colour drawing).
- **n8.** At the merge, fold the 15 `lessonCloses` into `closes`, and normalise the 81 string / dict `closes` mixes (owner question 1).

**Owner questions.** Questions 1-7 of the report have sound recommendations. Q7 (re-judge R.B7.S1 as partial on `sub_5_pictures`) should use the corrected F12 clause.
