# Y1 (US Kindergarten) site lessons: independent critic, round 1

Critic: independent critic (Opus 5.5, medium effort), 2026-10-17. I only graded. I did not edit `Y1.json`, the site files or the tooling.

Graded: branch `claude/sweet-newton-c8wrv1-wip-wrm-lessons-y1` at fe7198d6, file `data/curriculum/links/Y1.json`, section `lessons`:
39 lessons (6 full, 28 partial, 5 gap), 165 lesson links (119 judged by lessonfit), 29 proposals used by lessons (4 new, 25 reused).

## Verdict: FAIL

| Gate | Result |
|---|---|
| Every lesson ≥ 8 | **No.** Min **6** (lesson 1). Ten lessons score 7: 5, 12, 19, 20, 24, 25, 28, 30, 33, 36 |
| Mean ≥ 8 | **No.** 300 / 39 = **7.69** |
| Steps frozen | **Yes.** `year`, `generatedBy`, `steps` (116, same order) and `tagFixes` (80) equal origin's `Y1.json`, which is still sha256 `da295cff…`, the pinned frozen sha (origin is now d8fe6136). The 47 base proposals are present in the same order. 33 are byte-equal. 14 only gain `lessons` and `lessonCloses`; no existing field changed. The 15 lesson-only proposals are appended after them. `R.json` is untouched (sha `b7fd3ef6…`, equal to origin) |
| 0 real merge conflicts | **Yes.** 0 real conflicts and 0 lesson tagFixes (my own simulation, §6) |
| Reproducible | **Yes.** Two clean `git archive HEAD` builds (`dump.mjs` → `gen.py` → `Y1/build.py`) are byte-identical to the committed file (sha256 `45d6331d…02fd6`). One doc gap: D1 |
| Coverage complete | **Yes.** `lessons` = the 39 `wrmYear: "Y1"` entries of `site-lessons.json`, with the same order and titles. `ws-wrm-extract --check --site …/scratchpad/site/index.html` exits 0 |

The structure, the frozen gate and the reproducibility are sound. The data fails on content, in four kinds of defect:

- **Missed live skills or options.** Lesson 1 misses `add_facts` / `sub_facts`, which can be set to columns within 5. Lesson 5 misses `name_3d_shapes` forms 0. Lessons 19 and 20 miss `compare_groups` level 2. Lesson 33 misses `shape_attributes`. In each case the lesson says a clause is missing when an existing skill or option already deals it, and in lessons 1 and 5 it proposes a build that already exists.
- **False clauses.** Lessons 12 and 24.
- **False whys.** Lessons 25, 28 and 30.
- **A cross-domain pre.** Lesson 36.

The gates miss all of them. My own mutations also find holes in the post-finish spec gate: five lesson-level edits made after `finish()` reach the file with exit 0 (§2).

## Method

- **Fresh seeds.** None of these appear in the report:
  - My sampler `samp.mjs` read every link of every lesson through `generateQuestionFor`, using the print path, the link's opts and Max Number, and `itemIndex` / `itemCount`. It took 50 items a link at seed 83117, stride 37: 165 links, 8,250 items, all read.
  - `probe.mjs` / `vis.mjs` read the payloads (`q.cell`, the visual) of the skills in question. They used 40–200 items at seeds 9191, 31337, 5150, 6060, 2468, 3141, 1717, 2020 and 515.
  - `lessonfit --n 60` ran on [[83117,37],[52021,47]] and [[11213,31],[98765,67]].
- **Rubric.** The brief's rubric:
  - the verdict, with every clause read against the title AND its K CCSS descriptor (`data/standards/ccss-math.json`);
  - the opts: real values, and no live option missed;
  - every pre / related why, against at least 30 items;
  - each pre taught earlier and no harder. Support lessons were judged at Reception against `phases.json` and the R blocks; committee lessons against the Kindergarten sheet weeks (`prior.json`);
  - every "Pre-skills are few" note, and the K ranges;
  - each proposal: `closes` / `lessonCloses` against the lesson's `missing`, the envision, and reused ids verbatim.
- **Scripts.** All are in `…/scratchpad/y1lc1/`:
  - the samplers `samp.mjs`, `probe.mjs`, `vis.mjs` and their output `s1.txt`;
  - `mymut.py` and `mymut.log`, the lessonfit mutations;
  - `postmut.sh` and the `pm_p1` … `pm_p8` trees with their logs, the post-finish build mutations;
  - `merge.mjs`, the merge simulation and its self-test;
  - the clean trees `archA` and `archB`, with `genA.log`, `buildA.log` and `buildB.log`.

## 1. Lesson grades: all 39

| # | Lesson | Verdict | Score | Reasons (fresh items) |
|---|---|---|---|---|
| 1 | Add and subtract within 5 written vertically | partial | **6** | **F1.** `addition:add_facts {notation:['stacked'], band:5}` and `subtraction:sub_facts {notation:['stacked'], band:5}` deal exactly the title. In 60 items each: every item is a column (fact cell `notation: vertical`), the largest number is 5 (0 + 4, 5 − 5), and there is no carrying or borrowing line. `standards-audit.js` already rules K.OA.A.5 FULL on these two at band 5. The lesson instead lists the within-10 stacked skills as partial and proposes a new option, `k_vertical_5`, for what exists. The verdict should be full (two direct skills, as lesson 4 has two); `k_vertical_5` is redundant (brief rule 5). n1: the partial clause says "sums to 10", but the largest is 9 in 200 items. The pres (W13/W14 steps) are true |
| 2 | Sort into categories, count each group, find the total | partial | 8 | `classify_count {band:10, pictures}`: "Count only the …", 50 of 50, so the clause is true. `sort_groups` + `classify_count_all` together close the whole `missing`. The 3 pres are before W21 (W01, W03, W14). The related pictograph is "how many in each row", as its why says |
| 3 | Build and draw shapes | partial | 8 | `shape_attributes {forms:[0], band:4}`: sides or vertices of a triangle, square or rectangle (answers 3 and 4 only). Nothing builds or draws. `shape_draw` (verbatim WRM_PROPOSALS) and `shape_build_kit` split the clause. The pres are Reception shape steps, since Y1.B3 has no week |
| 4 | Compose shapes from smaller shapes | full | 8 | `compose_shapes {}`: two pieces → triangle, square, rectangle or hexagon (16 of 50 are hexagons). `compose_hexagon`: drag pattern blocks to fill a hexagon. K.G.B.6 "compose simple shapes to form larger shapes" holds. Two pres, with a note that holds (the composing steps use the lesson's own keys) |
| 5 | 3D shapes (cube, cuboid, sphere, cone, cylinder) | partial | **7** | **F2.** The `forms:[1]` clause is true: in 120 items it asks only for spheres (36), cylinders (31), cubes (28) and cones (25). But `name_3d_shapes {forms:[0]}` ("What 3D shape is this?", a drawn solid → pick its name) names all five solids, "Rectangular Prism" in 7 of 40. That is the same response kind as `compose_shapes` (pick a shape name), which this file uses at Reception in lessons 24, 26, 33, 35, 36 and 37. The lesson neither links forms 0 nor says why it rejects it, and `cuboid_find` proposes what forms 0 already deals |
| 6 | 6, 7 and 8: counting and subitising | partial | 8 | Both count_objects clauses are true (1–10). Two dice show 7–10, and the clause does not deny that. `number_focus` + `subitise` close the two halves. Pres R.B5, R.B1 (Phase 6 starts at R.B9) |
| 7 | 9 and 10: count, represent, order | partial | 8 | The clauses are true (1–10). There is no live ordering skill below band 99, so `compare_small` holds. Pres R.B9, R.B1 (Phase 7 starts at R.B11) |
| 8 | Adding more (First / Then / Now) | partial | 8 | `add_5_pictures` clause true. n2: `add_wp_10` draws the two groups on every item (`payload.pic`, 50 of 50). The clause ("no first / then / now pictures") is literally true, but it hides that the add-more stories to 10 are pictured. That makes `add_10_pictures`' closes partly dealt already; `vis_story_strip` (verbatim VISUAL_BUILDS, hosts `add_wp_10`) is the real gap |
| 9 | Bonds to 10 | full | 8 | `make_ten {band:10}`: frames 1–9, each 5–7 times in 50. K.OA.A.4 holds for Reception (the answer is one number, under a drawn frame). The pres are R.B9 |
| 10 | Building numbers beyond 10 | partial | 8 | `teen_compose` / `ten_frame_build_teen` band 19: 11–19, never 20. True. n3: `make_ten {band:20}` ("The frame shows 14. How many more make 20?") completes 20 as two full frames, a candidate related |
| 11 | Circles and triangles (properties) | partial | 8 | The `shape_attributes` clause is true (never a circle). The pre `compare_groups` is comparison language, which is the content of K.G.B.4's "similarities, differences", so it is accepted. The "Pre-skills are few" note holds (Phase 3: only R.B1–R.B2 come before) |
| 12 | Combining 2 groups | partial | **7** | **F3.** The `add_wp_10 {band:7}` clause says "told in words, no pictures to count". 50 of 50 items carry `payload.pic` (two pictured groups, e.g. 2 and 5 stars). The clause is false, and `add_10_pictures`' closes ("pictured groups with totals 6, 7 and 8") is partly dealt by this very link (totals 6 and 7 pictured) |
| 13 | Compare amounts (more, fewer, same) | full | 8 | `compare_groups {band:5, level:[1]}`: groups 2–5. In 50 items, 33 ask more or fewer and 17 ask "same?" (5 are the same). K.CC.C.6 holds. Phase 2 has no pre, and the note says so |
| 14 | Compare capacity (1) | gap | 8 | No capacity skill. The pres compare size, mass and amounts (R.B1–R.B2, before Phase 5), and the comparison language is a building block. `capacity_early` |
| 15 | Compare capacity (2) | gap | 8 | As 14 |
| 16 | Compare mass (1) | full | 8 | `heavier_lighter_visual`: "Which is heavier / lighter?", 2–3 pictured objects. This matches R.B8.S1, which the R lane passed as full |
| 17 | Compare mass (2) | full | 8 | As 16. n6: the file should say how (1) and (2) differ. If (2) is the balance session (R.B8.S2 "Find a balance"), it is partial with build `balance` |
| 18 | Compare size, mass and capacity informally | partial | 8 | Both clauses are true: `compare_objects` is length, height and thickness, never "big / small" or capacity. `compare_size` (verbatim R) + `capacity_early`. Phase 2, no pre |
| 19 | Comparing numbers to 10 | partial | **7** | **F4.** The clause "the numbers are never written, so no numerals are compared" is true only of the chosen `level:[1]`. `compare_groups {level:[2]}` ("Level 2 writes how many under each group (compare the numbers)") prints the counts beside the groups. The payload has `showCounts: true`, and the cell reads "A [group] 2 B [group] 3". That is exactly the lesson's `missing`, "written numbers (numerals) to 10, beside their groups". It is a missed option, and the missing / closes overstate the gap. What really remains is K.CC.C.7, numerals alone |
| 20 | Comparing numbers to 5 | partial | **7** | **F4**, as 19 (band 5) |
| 21 | Composition of 1, 2, 3 | partial | 8 | `number_bonds {band:5}`: wholes 2–5, no zero part. True. `band_3` (verbatim R). The 2 pres have a note that holds |
| 22 | Composition of 4 and 5 | partial | 8 | Clause true. n4: the closes "every pair in order" is not what `number_focus` does; `systematic_bonds` (a Y1.json base proposal) does |
| 23 | Counting patterns beyond 10 | partial | 8 | `count_sequence {band:20}`: 19 of 50 below 10 ("many"), so the clause is true. `number_focus` covers `teen_compose` too (10–13 / 14–20), which gives the "10 and 1" pattern. Pres R.B11 |
| 24 | Deepening understanding (2D / 3D) | partial | **7** | **F5.** The `name_3d_shapes {forms:[1]}` clause says "clicks every sphere, cylinder, cube, cone or rectangular prism". The rectangular prism is asked 0 times in 120 items (lesson 5's own clause says the same). The clause is false |
| 25 | Doubling (up to 5 + 5) | partial | **7** | **F6.** The related `share_into_groups {band:12}` has the why "sharing a group equally: the inverse of doubling". 100 of 100 items are grouping ("There are 12 counters. Make groups of 3. How many groups?", groups of 3, 4, 5, 6). None shares, and none halves into 2 equal groups. 12 counters also pass the lesson's 10. The partial clause and the pres are true |
| 26 | Explore 2D shapes | partial | 8 | `name_2d_shapes {forms:[1]}` draws each shape as one fixed glyph, so "never turned or resized" is true. `defining_attributes` (verbatim R). Phase 2, no pre |
| 27 | Introducing zero | gap | 8 | There is no zero item in any count skill, which is honest. The pres are R.B5 and R.B1 (Phase 5 starts at R.B7). The whys state the idea, not an item claim |
| 28 | Making pairs | partial | **7** | **F7.** The pre `ten_frame_build {band:5}` has the why "counters fill the frame in twos, one above the other". The tenframe cell fills "top row first, left to right" (`sheet/cells/tenframe.js` header, RP-11; `frameHTML` fills index `r * 5 + k`). The why, which is the link's whole reason, is false |
| 29 | One more and less within 5 | partial | 8 | `count_sequence` forward / back to 10: true. `more_less_pictures` + `band_3` split the clause. The pres are R.B3 and R.B1 (Phase 4 starts at R.B5) |
| 30 | Positional language | partial | **7** | **F8.** The only pre, `compare_objects`, has the why "the words of where things are start here". 50 of 50 items are "longer / shorter / taller / thicker"; none uses a position word. The why is false, and it pulls K.MD.A.2 into a K.G.A.1 lesson (rule 3). The "Pre-skills are few" note would stand without it |
| 31 | Positional language (on, under, in, next to) | partial | 8 | `shape_positions {forms:[1]}`: "Beside", 50 of 50, so "next to" only is true. Phase 1: no pre, no related, with notes |
| 32 | Represent numbers to 5 | full | 8 | `ten_frame_build {band:5}`: 1–5, 10 each in 50. Represent a numeral with counters holds for Reception (Phase 4 comes before zero). The 2.NBT.A.1 site tag is noted (owner question 3) |
| 33 | Shapes with 4 sides | partial | **7** | **F9.** The note says the 4 sides "no live Reception item counts". But `shape_attributes {forms:[0], band:4}`, which this file uses as a Reception partial in lesson 11, asks "How many sides does a square have? → 4" and "How many vertices does a rectangle have? → 4". `shape_corners_count` (max 4) asks "How many corners …". It is a missed skill, and the `missing` ("counting them") is overstated: only comparing the two shapes, plus the word "corners", remains |
| 34 | Sort objects by one attribute | partial | 8 | `classify_count {band:6, pictures}`: one kind, 2–6. True. `sort_groups` |
| 35 | Spatial reasoning (1) | partial | 8 | The `compose_shapes` clause is true. `match_same` + `shape_fit_turn` split the clause. The pres are R.B4, R.B6 and R.B12 (Phase 8 starts at R.B13) |
| 36 | Spatial reasoning (2) | partial | **7** | **F10.** The pre `number_bonds {band:10}` has the why "parts make a whole: the same idea with numbers". It is a number pre for a shape lesson, an analogy rather than a building block (brief rule 3). The two shape pres are right |
| 37 | Spatial reasoning (3) | gap | 8 | Honest gap, `scenes`. The pres are R.B15, R.B12 and R.B4 (Phase 10 starts at R.B16) |
| 38 | Spatial reasoning (4) | gap | 8 | Honest gap, `position_map`. One pre, with a note that holds |
| 39 | Taking away | partial | 8 | `sub_5_pictures` takes away from 3–5 (never 6–10): true. `sub_wp_10` has `pic: null` in 50 of 50, so "no pictures to cross out" is true. The pres are R.B11 |

**Sum 300 / 39 = 7.69; min 6; 28 at 8, 10 at 7, 1 at 6.**

**The six FULL lessons.** I re-read each against its title and its K descriptor. Lessons 4 (K.G.B.6), 9 (K.OA.A.4), 13 (K.CC.C.6), 16 and 17 (K.MD.A.2) and 32 (K.CC.A.3 / K.CC.B.4) hold at Reception or Kindergarten. Lesson 1 should be a seventh FULL (F1). The report's three "judged not full on audit" calls (lessons 26, 5 and 33) are right that they are not full. Lesson 5 may become full once forms 0 is linked (F2).

**Proposals.**
- Every proposal a lesson builds lists that lesson.
- Its `closes[<lesson>]` (or `lessonCloses[<lesson>]`) equals the lesson's `missing`. Where a lesson has two builds, the two split the missing clause between them.
- The envision copies the proposal.
- The 9 proposals reused from R.json carry name, kind, skill, teaches and representation verbatim; only `closes` (now a dict) and `steps` (now []) are lesson-specific.
- `shape_draw` (WRM_PROPOSALS) and `vis_story_strip` (VISUAL_BUILDS) are verbatim apart from the lesson fields.
- Two new proposals are redundant or overreach: `k_vertical_5` (F1) and `cuboid_find` (F2).

**The `lessonCloses` deviation.** It is accepted. The 14 frozen R/Y1 proposals carry `closes` as one string, so a dict entry keyed by lesson would change a frozen field. Adding `lessonCloses` beside it is additive, and the frozen gate strips it. At the merge, `closes` must be normalised: these 14, and the 9 R-copied ids whose R.json twins keep a string `closes` (n5).

## 2. Gates: my mutations, old and new

The builder's `lessonmut.py`, run in clean tree A: **41 mutations, 0 missed.**

**My lessonfit mutations (`mymut.py`): 17.** Eleven are caught. Six are missed, and three of the six are defects already in the file.

| # | Mutation | Result |
|---|---|---|
| 1 | (in the file) lesson 12 clause "no pictures to count" against `payload.pic` on 50 of 50 items | **missed** (G2) |
| 2 | Lesson 13 FULL on `compare_groups {band:10}` (Phase 2, ceiling 5) | caught (RANGE) |
| 3 | Lesson 26 made FULL on `name_2d_shapes {forms:[1]}` (K.G.A.2 orientation / size never dealt) | **missed** (G4) |
| 4 | Lesson 20 FULL on `compare_groups` level 1 | caught (TITLEREP FULL) |
| 5 | Lesson 39 FULL on `sub_5_pictures` + `sub_wp_10` | caught (RESPONSE: the word-work cell shows × ÷) |
| 6 | Lesson 9 pre `number_bonds {band:10}` why "(wholes to 20)" | **missed** (G5) |
| 7 | Lesson 32 related why "how many more make 10" (the items make 5) | caught |
| 8 | Lesson 25 related `share_into_groups {band:24}` | caught (SIZE) |
| 9 | (in the file) lesson 28 why "fill the frame in twos" | **missed** (G2) |
| 10 | (in the file) lesson 24 clause "… or rectangular prism" (asked 0 / 120) | **missed** (G2) |
| 11 | Lesson 5 clause "clicks every cube, cuboid, sphere …" | **missed** (G2: shown is read as asked) |
| 12–14 | Phase 3 related to 10; Phase 1 related to 10; W15 related stacked to 20 | caught (SIZE) |
| 15 | Lesson 4 related `compose_hexagon` why "two triangles make a square" | caught |
| 16 | Lesson 6 dice clause "1 to 6" | caught (CLAUSE) |
| 17 | Lesson 27 pre cites R.B7.S2 (its own source block) | caught (CITE H) |

Mutation 14 shows a further hole (G3): lessonfit reports "why says column but no item is in columns" for `add_facts {notation:['stacked']}`, whose items are all columns. The gate's column detector does not read the fact template's `notation: vertical`, which is the likely reason F1 was missed.

**Post-`finish()` build mutations (`postmut.sh`).** Each was inserted right after `out['lessons'] = lessons` in a fresh `git archive` tree, and the full `build.py` was run:

| # | Mutation after finish() | Result |
|---|---|---|
| p1 | Re-option of lesson 39's pre `count_sequence` to band 20 | **exit 1** (lessonspec, 1 difference; lessonfit) |
| p2 | Lesson 26 verdict flipped to `full` | **exit 1** (lessonfit, 4 findings) |
| p3 | `zero.lessonCloses['K\|-\|introducingzero']` = "counting to 100" | **exit 0** (G1) |
| p4 | `cuboid_find.lessons` emptied (the lesson still builds it) | **exit 0** (G1). The summary line silently says 28 proposals, 3 new |
| p5 | Lesson 39 `missing` = "taking away from 20 with a number line" | **exit 0** (G1) |
| p6 | A step's verdict changed | **exit 1** (FROZEN output) |
| p7 | FULL lesson 9 given `build: ['zero']` | **exit 0** (G1). `lessons.py` catches "full but build" only before finish() |
| p8 | Lesson 39 pre why "wholes to 100" (band 10) | **exit 0** (G1, G5) |

**Frozen gate.** It is strong. The builder's 4 frozen mutations, my p6 and an untouched file all behave correctly, and the gate runs on input and on output. One limit: `strip()` drops every `lessons` / `lessonCloses` key of a base proposal before hashing, so anything put there escapes the frozen sha. The lesson gates do not check those keys after finish (p3, p4).

**Seed robustness.** `lessonfit --n 60` gives 0 findings on [[83117,37],[52021,47]]. On [[11213,31],[98765,67]] it gives 4 findings on lessons 5 and 24: "clause claims 'cylinder' (ruler / scale) but only 11 of 60 items show it". `claims.mjs` reads a solid cylinder as a measuring cylinder; `titlerep.mjs` line 92 has the exemption, `claims.mjs` does not. This is the gate flapping, not a data defect (G6).

## 3. Frozen steps (detail)

- Merge-base 2bc3bffe. Origin `claude/sweet-newton-c8wrv1` has since moved to d8fe6136 (the Y6 lessons merge). Its `Y1.json` is still `da295cff…` and its `R.json` is still `b7fd3ef6…`.
- The lane changes only `data/curriculum/links/Y1.json` among the data files, and adds its own tooling and reports.
- The 15 "deleted" lines in the diff are the closing `"reused": …` lines of the 14 proposals, which gained a trailing comma, plus the last line of the proposals block. No value changed.

## 4. Coverage and reproducibility

- **Coverage.** All 39 site lessons are present (my `merge.mjs`: "Y1 39/39 exact+order"). `ws-wrm-extract --check` reports "wrm-steps.json up to date" and "site-lessons.json up to date", exit 0.
- **Reproducibility.**
  - Build A: `git archive HEAD`, then `node tests/scripts/wrm-tagging/dump.mjs`, then `python3 gen.py <root>`. That writes R.json `b7fd3ef6…` (unchanged) and Y1.json `da295cff…` (= frozen). Then `WRM_TAG_DATA=… python3 Y1/build.py`, exit 0.
  - Build B: R.json and Y1.json deleted first, scratch `TMPDIR`, `env -u WRM_TAG_DATA`. It exits 0, with logs identical to A.
  - Both outputs are sha256 `45d6331da0b1796500daa40ea7a3673ec6460d2a2c0318289b5783cbd9902fd6` = the committed file.
  - **D1:** in a clean archive `gen.py` fails with FileNotFoundError (`dump.json`, `bl.json`) unless `dump.mjs` runs first. Neither build.py's docstring nor the report names that step.

## 5. Merge (`merge.mjs`, with a self-test)

The lanes:

- R, Y1, Y4, Y5 from the worktree.
- Y2 and Y3 from `/home/user/MathQuest/data/curriculum/links/`, byte-equal to the worktree's.
- Y6 from origin, d8fe6136, the version with lessons.

All are merged against live `js/modules/wrm.js` (equal in the worktree and origin). The in-repo Y6, without lessons, gives the same numbers.

| Check | Result |
|---|---|
| tagFixes | R 76, Y1 80, Y2 75, Y3 78, Y4 166, Y5 175, Y6 148 |
| key\|step written by 2+ lanes | 1: `patterns:count_by_step_up\|Y2.B1.S15` (Y2 and Y4, the same partial). Not a real conflict |
| **Real conflicts** | **0** |
| Result independent of lane order | Yes |
| Own-step status after the merge (direct = full tag, partial = partial tag) | 0 mismatches in every lane |
| Foreign-step tagFixes | Y1 0 (Y4's known Y2.B1.S15) |
| **tagFixes naming a site lesson** | **0** |
| Lessons sections = site entries | Y1 39, Y2 11, Y3 25, Y5 21, Y6 24: all exact and in order |
| Proposal ids shared by 2+ lanes | 124, 0 with a differing skill or kind |

**Self-test.** I mutated Y1 with: a `remove` on R's `classify_count|R.B1.S4`; a tagFix naming `K|-|bondsto10…`; `zero`'s skill changed; and lesson "Taking away" deleted. The script reports:

- 1 real conflict, with the result now order-dependent and 1 R own-step mismatch;
- 1 lesson-naming tagFix;
- 1 differing proposal;
- Y1 at 38/39 lessons.

So the zeros above are real.

## 6. Fix table (FAIL)

| # | Lesson(s) | Fix |
|---|---|---|
| F1 | 1 (6) | Make `addition:add_facts {notation:['stacked'], band:5}` and `subtraction:sub_facts {notation:['stacked'], band:5}` direct and the verdict **full**. Every item is a column within 5 with no carry or borrow line; K.OA.A.5 is already FULL on them in standards-audit. Drop `k_vertical_5`, or re-scope it to "+ and − mixed in one cell set" only if the owner wants that. If the stacked within-10 skills stay at all, correct "sums to 10" (the largest is 9). Fix the column detector (G3) |
| F2 | 5 (7) | Link `name_3d_shapes {forms:[0]}` (or `[0,1]`); it names the rectangular prism (7 / 40) as well as the other four solids. Re-judge the verdict (likely full) and drop `cuboid_find`. Otherwise keep forms [1] and say in the note why forms 0 is rejected (the legacy colour drawing, or reading the names), consistently with the `compose_shapes` name picks used at Reception elsewhere in the file |
| F3 | 12 (7); n2 lesson 8 | Rewrite the `add_wp_10` clauses: the story cell pictures both groups on every item (`payload.pic`). Re-scope `add_10_pictures`' lesson closes to what the picture row does not deal (no reading needed; totals to 8 in a picture-only cell) |
| F4 | 19, 20 (7) | Link `compare_groups {band:10|5, level:[1,2]}`. Level 2 prints how many under each group. Rewrite the clause (level 1 has no numerals; level 2 has numerals beside the groups) and `missing` / `closes`: two numerals compared without their groups (K.CC.C.7), with the words greater than / less than |
| F5 | 24 (7) | The forms[1] clause: "clicks every sphere, cylinder, cube or cone (the rectangular prism is only a distractor)" |
| F6 | 25 (7) | Drop the related `share_into_groups` (grouping into 3s–6s, 12 counters), or replace it with a link whose items really halve or share in two within 10, with a true why |
| F7 | 28 (7) | Rewrite or drop the pre `ten_frame_build` why. The frame fills a row of five first; pairs are not shown |
| F8 | 30 (7) | Drop the pre `compare_objects` (no position word in any item). The "Pre-skills are few" note covers Phase 3 |
| F9 | 33 (7) | Add `shapes_early:shape_attributes {forms:[0], band:4}` as a partial; its clause says it uses "vertices", not "corners", and also shows triangles. Consider `shape_corners_count`. Rewrite `missing` / closes to comparing the square and the rectangle, and correct the note "which no live Reception item counts" |
| F10 | 36 (7) | Drop the pre `number_bonds` (a number analogy, rule 3). Keep the two shape pres, with a "Pre-skills are few" note |
| G1 | build.py, after finish() | Re-run the lesson checks of `lessons.py` (full ⇒ no build, `closes == missing`, every build lists the lesson) on the WRITTEN file, or snapshot every lesson field and each used proposal's `lessons` / `closes` / `lessonCloses`, and compare after the write (p3, p4, p5, p7, p8) |
| G2 | lessonfit CLAUSE / WHY | Read `payload.pic` for picture claims (F3). Separate the solid ASKED ("Click ALL the cones") from those only SHOWN (F5, mutation 11). Gate "share / sharing" against grouping items (F6). Fill-order claims (F7) cannot be gated, so read them by hand |
| G3 | lessonfit column detector | Treat the fact template's `notation: vertical` (and the legacy `facts-column-visual`) as columns. The same blind spot hides F1 |
| G4 | TITLEREP FULL | A FULL lesson is held only to its title. Lesson 26 made full passes, although K.G.A.2 "regardless of orientation or size" is not dealt. Hold FULL to the site CCSS clauses too, or require a hand-audit row that a gate reads (the Y6 r2 G4 hole, again). Latent: 0 such FULL lessons |
| G5 | lessonfit bound claims | A why or clause bound that the items never reach ("wholes to 20" or "to 100" on band 10) passes. Fail a bound larger than 1.5 × the largest number dealt |
| G6 | `claims.mjs` | Exempt a solid cylinder in a 3-D clause (as `titlerep.mjs` line 92 does). It flaps on seed pair [[11213,31],[98765,67]] |
| D1 | build.py docstring, report | Name `node tests/scripts/wrm-tagging/dump.mjs` before `gen.py`; a clean archive cannot run gen.py without it |

**Non-blocking notes.**

- **n1.** Lesson 1 "sums to 10" (the largest is 9).
- **n3.** Lesson 10: `make_ten {band:20}` as a related for 20 as two tens.
- **n4.** Lesson 22: "every pair in order" belongs to `systematic_bonds`, not `number_focus`.
- **n5.** Merge: normalise `closes` to dicts for the 14 `lessonCloses` proposals, and union the 9 R-copied ids (string `closes` and R steps in R.json; dict `closes` and `steps: []` in Y1.json).
- **n6.** Lessons 16 and 17 (the two mass lessons) are identical. Say how they differ, or make (2) the balance lesson.

**Owner questions.** Questions 1–5 of the report have sound recommendations. Q4 (drop the carry row for the within-5 columns) is already answered by `add_facts` / `sub_facts` band 5 (F1).
