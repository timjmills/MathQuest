# Wave 2 tagging: Year 1 (US Kindergarten) — site lessons (owner rule 2026-10-16), round 3

Output: the top-level `lessons` section of `data/curriculum/links/Y1.json`, written by `tests/scripts/wrm-tagging/Y1/build.py`
(spec `spec_lessons.py`; shape and checks `lessons.py`; gates `lessonfit.mjs`, `lessonspec.py`, `mergecheck.mjs`; mutations
`lessonmut.py`). Y1's WRM steps passed the R/Y1 lane (critic r12) and are **frozen**: the build checks, before and after writing,
that the steps, the tagFixes and every step proposal are byte for byte the R/Y1 lane's file (sha256 `da295cff…`, the file at
base a208906d + origin/claude/sweet-newton-c8wrv1). Lessons emit **no tagFixes**.

**Build order (documented).** The R/Y1 lane's generator `tests/scripts/wrm-tagging/gen.py` (with `spec.py`) rewrites `R.json`
and `Y1.json` without a `lessons` section, so a rerun of it drops the lessons. The lessons build is therefore the **last step**:
`node tests/scripts/wrm-tagging/dump.mjs` (writes `dump.json` and `bl.json`, which `gen.py` reads: a clean `git archive` tree
cannot run `gen.py` without it, critic r1 D1), then `python3 tests/scripts/wrm-tagging/gen.py <root>` (only if the steps change,
which needs a new critic), then `python3 tests/scripts/wrm-tagging/Y1/build.py`. The lessons build strips what an earlier run of itself added, verifies the frozen
sha, adds the lessons, writes, and runs every gate; running it twice gives the same bytes. Nothing of the R/Y1 lane's shared
top-level files was moved or changed.

## Round 3 (critic r2 FAIL: mean 7.92, min 7) — every row

Builder escalated from Opus low to Opus medium (CLAUDE.md rule; recorded in `design/STATUS.md`): false whys / clauses and an
overclaimed FULL survived rounds 1 and 2. Every row below was read on fresh items (seeds 30011 / 7101 / 9001 / 61001, 40-400 items a
link) and is gated where a regex can see it.

| Row | Lesson(s) | Change |
|---|---|---|
| F11 | 5 | **partial**, not full. `name_3d_shapes {forms:[0]}` and `{forms:[1]}` become partials: each solid is ONE fixed drawing (forms 0: 1 distinct drawing per solid in 100 items; forms 1: one emoji per solid, its name printed beside it), so a solid is never turned or resized, the reason lesson 26 is partial. Missing: "naming the five solids whatever way they are turned and whatever their size". Build: **`solids_turned`** (new: an option on `name_3d_shapes`; no existing proposal turns or resizes solids, `defining_attributes` is 2-D only). Its `full_audit.json` row is deleted (a partial lesson has none). No K.G.A.2 / K.G.A.3 claim remains in the lesson: the note says the site's 1.G.A.1 non-defining attributes (orientation, size) are what is missing, and no item tells flat from solid |
| F12 | 27 | `sub_5_pictures` clause: "about 1 item in 10 takes every counter away, and the pupil writes 0 for the empty group that is left; never a group that is empty from the start" (100 / 1,000 items answer 0). The rule-5 sweep found a second live source: `count_sequence {band:10, dir:back}` asks the number before 1 in about 1 item in 7 (13-16 in 100 at four seeds), so 0 is written before 1 on a track: added as a partial (its clause says the track runs to 10). Missing and `zero.lessonCloses` now name only the remainder: "zero as the count of a group that is empty from the start (an empty plate, an empty ten frame): seeing that there are none and writing 0 for it". The three pre whys now say what their items deal (groups and frames of 1 to 5, never empty). Owner question 7 uses the corrected clause |
| F13 | 35 | Pre `name_2d_shapes {forms:[1], shapes:[2]}` why: "finding every square and every rectangle among other shapes, each drawn one way up (a turned square appears only as the "diamond" distractor, not clicked as a square: the turning this lesson builds, shape_fit_turn, has to undo that)" |
| G7 | build.py, lessoncheck.py, mergecheck.mjs | The snapshot now holds EVERY field of every proposal a lesson uses (`proposalsFull`); lessoncheck compares each written proposal with it field by field (p15, p16). Independently of the snapshot, lessoncheck holds a copied proposal to its source: an R.json copy equals R.json in every field but `closes` / `lessons` / `lessonCloses` / `source` / `steps` / `reused`; a live copy (WRM_PROPOSALS, VISUAL_BUILDS, keys.json `props`) equals it but for the lesson fields and `reused` / `source`; a new one has every contract field. mergecheck compares kind / skill / name / teaches of every proposal id the first file shares with another lane (0 differences with R, Y2-Y6) |
| G8 | lessonfit.mjs | NOPIC takes "without any drawing", "never a picture", "words only", "not pictured"; a GENERAL "no pictures" claim is held to every picture (svg, emoji, counters), a narrow one ("never a pictured group") to the story cell's `payload.pic`. A POSITIVE picture claim ("pictured", "to cross out") needs pictured items, and a story cell (word-work) is pictured only by `payload.pic`. ASKED covers every solid and flat shape (pyramid, prism, hemisphere, circle, triangle, square, rectangle, hexagon, pentagon, diamond / rhombus, oval), not only the five title solids. "split into N equal groups / parts" is a sharing claim. Plus the critic's other misses: R10 (pre key = related key) and the fill-order / "in twos" claim |
| n1 | 8 | `add_wp_10 {band:10}` clause: "add-more stories … and put-together stories (6 apples in a bag, 4 on a plate: how many in all?)"; gated (a clause that says add-more only, when a fifth of the items ask "in all?", fails) |
| n2 | 12 (and the sweep) | `count_sequence` whys: "one more: the number after a number on a track" (lessons 8, 12); lesson 39 "one less: the number before a number on a track" |
| n3 | 29 | Note: `placevalue:more_less_10 {step:[1], band:20}` read ("1 more than 9 is ____.", "What is 1 less than 4?": the title's words, numbers to 20, a sentence frame, no objects; smallest band 20): closes neither missing part, not linked |
| n4 | 30, 31 | Lesson 30 clause: below is not under (below: lower on the page, apart; under: beneath and touching or covered, the cat under the table, never asked). Lesson 31 note: forms 0 (above / below) is not linked for the same reason |
| n5 | 13 | Audit row: K.CC.C.6's "(groups with up to ten objects)" is the Kindergarten end; this Support lesson is judged at Reception Phase 2 (numbers to 5); groups to 10 are lesson 19 (partial). The row's "groups of 2 to 5" was false (groups of 1 are dealt, 18 in 100): now "1 to 5", gated |
| n6 | 32 | Audit row: K.CC.A.3 is no longer claimed (the pupil never writes a numeral); the content is K.CC.B.4 and K.CC.B.5's "given a number, count out that many objects"; gated |
| n7 | skills | Not this lane (skill defects): `name_2d_shapes` / `name_3d_shapes` forms 1 print the name beside the glyph; `name_3d_shapes` forms 0 draws in the legacy colours. Recorded here and in lesson 5's clause; a skill-catalogue fix is owed |
| n8 | merge | Owner question 1 stands (15 `lessonCloses` to fold, 81 string / dict `closes` mixes) |

### Root-cause sweep (all 39 lessons, every why / clause / missing / closes / audit row, fresh items)

`sweep.mjs` (scratch) printed every link of every lesson with its why or clause beside 40 fresh items (seed 30011 / stride 47: the
question, answer, options, cell template and payload, and the picture text); `dist.mjs` / `d2.mjs` / `d3.mjs` / `d4.mjs` counted the
distributions a claim depends on (100-1,000 items). FULL lessons were read against their K CCSS descriptors (`ccss-math.json`).

| # | Lesson | Finding (what the items do) | Fix | Class / gate |
|---|---|---|---|---|
| S1 | 1 | pre `number_bonds {band:5}` "every number to 5": wholes are 2-5 (never 0 or 1) | "the numbers 2 to 5" | A (range words) |
| S2 | 2 | pre `compare_groups` "the groups are ordered by count": two groups are compared, never ordered | "the start of ordering groups by their counts" | hand |
| S3 | 4 | pre whys "naming the square and the rectangle two triangles make" / "naming the triangles that are joined": compose_shapes makes a SQUARE from two triangles and a RECTANGLE from two squares (gen-geometry.js compositions); the links click squares / rectangles / triangles / circles | "finding every square and every rectangle … two of the shapes the pieces make"; "finding every triangle and every circle …" | ASKED (a named shape must be asked) |
| S4 | 4 | note and audit row: "two triangles make a square, a rectangle or a larger triangle" and "compose_shapes asks exactly that join (two triangles make a rectangle)": false for the rectangle (two squares) and silent on the hexagon (two trapezoids, 31 in 100) | note and K.G.B.6 entry list the four joins; the square is the rectangle with equal sides | hand (audit row) |
| S5 | 5 | F11 (above); forms 1 labels carry the names | partial, solids_turned | STD_ITEM: an audit row that reads K.G.A.2 / K.G.A.3 as dealt needs turned items / flat-solid items |
| S6 | 6 | pre `ten_frame_build {band:5}` "building 4 and 5": builds 1-5; related `count_sequence` "the number after 5, 6 and 7": after 3-9 | "(4 and 5 among them)"; "the number after a number on a track to 10" | **WINDOW** (a why naming "4 and 5" must say "among them" or half the items must be those numbers) |
| S7 | 8 | related `sub_5_pictures` "start with 5": starts 2-5 (5 in 56 of 100); n1 | "start with a pictured group to 5" | hand |
| S8 | 10 | pre `ten_frame_build {band:10}` "building 9 and 10": builds 1-10; related `number_seq_fill @20` "the teen numbers in order": tracks also 0-4, 4-8 | "(9 and 10 among them)"; "the numbers to 20 … some tracks running past 10 into the teens" | WINDOW; hand |
| S9 | 12 | n2; pre `ten_frame_build {band:5}` "building 4 and 5" | "building a number to 5 on a frame" | WINDOW |
| S10 | 13 | audit row "groups of 2 to 5", "(33 more / fewer, 17 same? in 50)" | "groups of 1 to 5 counters", shares restated; n5 | **GROUPRANGE** (an audit row's "groups of A to B" holds for every item) |
| S11 | 19, 20 | pre `count_objects` "counting a group of 6, 7 or 8" (1-10 dealt), "a group of 4 or 5" (1-5) | "(… among them)" | WINDOW |
| S12 | 21 | pre `classify_count` "sorting a group into two kinds": the pupil counts one kind, never sorts; related `ten_frame_build` "(Represent 1, 2 and 3)": builds 1-5 | "counting the objects of one kind in a group of two kinds"; "(1, 2 and 3 among them)" | hand; WINDOW |
| S13 | 22 | pre whys "building 4 and 5", "finding groups of 4 and 5", "4 and 5 as dot patterns (2 and 2, 3 and 2)": 1-5 dealt; a die shows 5 as 2, 1 and 2 | "(4 and 5 among them)"; "dice dot patterns to 5 (4 as 2 and 2)" | WINDOW |
| S14 | 23 | pre `ten_frame_build` "building 9 and 10" | "(9 and 10 among them)" | WINDOW |
| S15 | 27 | F12; the pre whys "zero is the count when there are none", "an empty frame shows 0", "none is the fewest of all": no item deals 0 or an empty group; rule 5: `count_sequence {dir:back}` writes 0 before 1 | partial + clause + whys (above) | **ZERO** (a positive zero / none / empty claim needs an item that deals 0); **NEVER0** (a clause that says 0 is never written fails when an item answers 0) |
| S16 | 29 | n3 | note | hand |
| S17 | 30, 31 | n4 | clause, note | hand |
| S18 | 32 | n6 | audit row | STD_ITEM (K.CC.A.3 read as dealt needs a written answer) |
| S19 | 35 | F13 | why | **ORIENT** (a "whichever way / turned / resized" claim needs items that turn or resize) |
| S20 | 36, 37 | pre whys "naming squares and rectangles" / "naming triangles" / "naming the solids a model is built from": the items CLICK every shape of a kind ("Click ALL the …") | "finding every …" | hand (form word) |
| S21 | 39 | clause `sub_5_pictures` "takes away from 5": starts 2-5; pre whys "one less: taking one away" (a track), "counting the counters that are left" (a frame count) | "a pictured group of 2 to 5"; "the number before a number on a track"; "counting the counters in a ten frame to 10" | hand |
| — | 34 | I first read the clause's "(apples, fish, balls)" as false (no fish in the first lines printed); 200 items show fish in 514 bag places, so it was TRUE. Kept true and complete: "(apples, balls, fish, flowers)" | — | **OBJN** (an object named as an example must appear in the items); it proved the clause true |

No finding in lessons 3, 7, 9, 11, 14-18, 24-26, 28, 33, 38 (every why and clause held on the 40 items). The eight FULL lessons were
read against their K descriptors: 1 (K.OA.A.5), 4 (K.G.B.6), 9 (K.OA.A.4), 13 (K.CC.C.6 at Reception), 16 / 17 (K.MD.A.2, pictorial
direct comparison, as R.B8.S1) and 32 (K.CC.B.4 / K.CC.B.5) hold; 5 does not (F11).

**Classes made gates (lessonfit.mjs, all in the build):** WINDOW, ZERO, NEVER0, ORIENT, OBJN, add-more vs put-together stories,
GROUPRANGE and STD_ITEM (audit rows), plus G8's NOPIC / positive picture / ASKED (every shape) / split = share / fill order / R10.
Free-text classes S2, S4, S7, S8b, S12a, S16, S17, S20, S21 stay hand-read (no stable regex: they describe what the pupil does).

## Round 2 (critic r1 FAIL: mean 7.69, min 6) — every row

| Row | Lesson(s) | Change (items read at fresh seeds 40417 / 1212 / 4111 / 6161 / 7070 / 8181, 40-100 items a link) |
|---|---|---|
| F1 | 1 | **full** on `addition:add_facts {notation:[stacked], band:5}` + `subtraction:sub_facts {notation:[stacked], band:5}`: every item is a column (add_facts the fact cell, notation vertical; sub_facts the column facts visual), sums and numbers taken from 0 to 5 (0 + 4, 5 − 5), no carrying or borrowing row; K.OA.A.5 (both clauses) read in `full_audit.json`. `k_vertical_5` deleted. The within-10 stacked partials (and n1's "sums to 10") are gone |
| F2 | 5 | **full** on `name_3d_shapes {forms:[0]}` (one drawn solid, pick its name: all five, Rectangular Prism 14 of 60) + `{forms:[1]}` (click every sphere, cylinder, cube or cone). `cuboid_find` deleted: forms 0 names the cuboid. Site tag 1.G.A.1 read as a site tag (owner question 3) |
| F3 / n2 | 12, 8 | `add_wp_10` clauses now say the story cell pictures both groups under the story (`payload.pic` on every item) and the pupil must read it. Lesson 12 missing / `add_10_pictures` closes: a picture-only cell with no story to read, totals 6-8 (band 7 never reaches 8). Lesson 8: `add_10_pictures` closes the picture-only add-more cell; `vis_story_strip` the three panels |
| F4 | 19, 20 | `compare_groups {band:10|5, level:[1,2]}`: level 2 writes how many under each group (`showCounts`, 20 of 40). Missing / `compare_small` closes: two numerals compared WITHOUT their groups, with greater than / less than (K.CC.C.7). Note: the only numeral compare, `placevalue:compare`, starts at band 99 with < > = |
| F5 | 24 | Clause: "clicks every sphere, cylinder, cube or cone (the rectangular prism is only drawn as a distractor)" |
| F6 | 25 | `share_into_groups` dropped (it groups, never shares). Related `patterns:halve {band:10}` (half of 2-10, a bar split into 2 equal parts: the inverse of doubling). Rule 5 found `patterns:double {band:20}` (double 2-10 with another equal bar): added as a second partial, its clause says past 5 + 5 and bars, never two pictured groups |
| F7 | 28 | Pre `ten_frame_build {band:5}` why: "one counter in each box, matched one to one" (no fill-order claim) |
| F8 | 30 | Pre `compare_objects` dropped; "Pre-skills are few" note (R.B1-R.B2, none about position) |
| F9 | 33 | Partial `shape_attributes {forms:[0], band:4}` added (sides / vertices of a square and a rectangle: 4). Missing / `compare_shapes` closes: comparing the square with the rectangle (4 sides and 4 corners each, a square's sides equal). Note corrected; `shape_corners_count {band:4}` read and not linked: 2 distinct items only (one triangle, one square) |
| F10 | 36 | Pre `number_bonds` dropped; "Pre-skills are few" note (the composing steps use the lesson's own key) |
| n3 | 10 | `make_ten {band:20}` read (11-19 on two frames: how many more make 20): not linked, its key is already the lesson's pre (`make_ten {band:10}`, one key one role); said in the note |
| n4 | 22 | Build `number_focus` (wholes 4 and 5 only) + `systematic_bonds` (every bond in order), clause split |
| n5 | merge | Owner question 1 (normalise `closes` to dicts; union the 9 R-copied ids) |
| n6 | 16, 17 | Note: the site gives (2) no other content; if it is the balance session it is partial with build balance (owner question 6) |
| rule 5 | 27 | Found in the sweep below: `sub_5_pictures` deals 0 left (take every counter away) in 10 of 100 items, so **Introducing zero is partial** on it (clause says 1 in 10, never an empty set counted on its own). R.B7.S1 (gap in R.json, frozen) is noted for the R lane |
| G1 | build.py | `lessoncheck.py`: the snapshot of every lesson field and every proposal's `lessons` / `closes[<lesson>]` / `lessonCloses` is taken from finish()'s result before anything is assigned into the output; after the write the lesson rules (full ⇒ no build / partial / missing / envision and an audit row; not full ⇒ build, missing, envision = build; every build lists the lesson, closes = the envision's; a proposal lists only lessons that use it; no tagFix names a lesson) are re-run on the written file and every field is compared with the snapshot. The critic's eight post-finish edits (`postmut.sh` p1-p8, in clean `git archive` trees of the round-2 commit) all exit 1 (Gates) |
| G2 | lessonfit | NOPIC: a clause or why that says "no pictures" fails when a third of the items carry `payload.pic`. ASKED: a solid the text says is clicked / found / named must be asked by an item (its question or its answer), a solid only drawn as a distractor is not asked; a parenthesis calling a shape a distractor is not a claim. "share / sharing" needs items that share or halve, not grouping. Fill order (F7) cannot be gated: read by hand |
| G3 | titlerep / lessonfit | `isColumnItem`: the stack cell, the fact cell with `notation: vertical`, the legacy `facts-column-visual`. The "written vertically" title claim and the "column" why use it |
| G4 | full_audit.json | A FULL lesson needs a hand-audit row reading its title and EVERY site CCSS code, with its direct links (FULLAUDIT in lessonfit, and lessoncheck) |
| G5 | lessonfit | `boundTooBig`: a bound in a why or clause ("wholes to 20", "numbers to 100") past max(1.5 × the largest number dealt, + 2) fails |
| G6 | claims.mjs, titlerep | A cylinder named among solids is a solid (no ruler / scale claim). The five-solid title claim "asks for the X" judged on the pooled items of two forms needs 1 item in 20 (not 1 in 10, which sat at the edge of the cuboid's share and flapped); a solid never asked still fails |
| D1 | build.py, this report | `node tests/scripts/wrm-tagging/dump.mjs` named as step 0, before `gen.py` |

**Rule 5 sweep (missed existing option), per partial / gap lesson.** For each, `js/modules/data.js` labels and
`js/modules/skill-options.js` were searched for the missing clause's words, and every candidate was generated (40-100 items):

| Lesson | Missing clause | Searched / generated | Result |
|---|---|---|---|
| 2 Sort, count each, total | sort all, count each, total | `classify_count` (tiles, objects), `sort`* labels | none: still classify_count_all + sort_groups |
| 3 Build and draw shapes | build from sticks / balls, draw | `shape_attributes`, `shape_corners_count {band:4}` (2 distinct items), `*draw*` (symmetry lines only) | none |
| 6 6, 7, 8 subitising | 6-8 only, subitise | `count_objects` band 5/10/20, objects dice / frame, orientation | none below band 10 |
| 7 9 and 10 | 9-10 only, order | `count_objects`, `placevalue:order_*` (band 99 up) | none |
| 8 Adding more | three-panel strip, no-reading cell | `add_wp_10 {pictures}`, `add_5_pictures {objects}` | pictured groups exist (clause fixed, n2); the strip does not |
| 10 Beyond 10 | 20 as two tens | `teen_compose` (15/19), `ten_frame_build_teen`, `make_ten {band:20}` | make_ten 20 asks the missing part; key already a pre (n3) |
| 11 Circles and triangles | compare curved / straight | `shape_attributes`, `name_2d_shapes` | none |
| 12 Combining 2 groups | picture-only, totals 6-8 | `add_wp_10` band 5/7/10, `add_5_pictures` | pictured stories exist (clause fixed) |
| 14, 15, 18 capacity / size | capacity, overall size | `measurement:capacity` (units), `compare_objects` tasks | none at Reception |
| 19, 20 Comparing numbers | numerals alone | `compare_groups` level 2 (linked), `placevalue:compare` (band 99, < >) | level 2 linked (F4) |
| 21 Composition of 1-3 | wholes to 3 | `number_bonds`, `ten_frame_build`, `count_objects` (smallest band 5) | none |
| 22 Composition of 4, 5 | 4 and 5 only, in order | `number_bonds` options (band, unknown, orientation) | none |
| 23 Teen patterns | 11-20 only | `count_sequence`, `number_seq_fill` (no start), `count_by_tables` (start 10: multiplication, 12 numbers past 20) | none for Reception |
| 24 2D / 3D | faces of solids, world | `count_edges_faces_vertices` (vertices), `net_identify` | none at Reception |
| 25 Doubling | to 5 + 5, pictured | `patterns:double` (smallest band 20), `patterns:halve`, `doubles_near_doubles` forms | double linked as partial, halve as related |
| 26 Explore 2D | turned / resized | `name_2d_shapes` options, `geo_rotate` (Grade 8) | none |
| 27 Introducing zero | empty set, write 0 | count skills (start at 1), `sub_5_pictures` | **sub_5_pictures 0 left, 10%: partial** |
| 28 Making pairs | pair objects | `odd_even` forms, `select_even_odd` | none |
| 29 One more / less | pictured, within 5 | `count_sequence` bands (10 up), `add_5_pictures` | none |
| 30, 31, 38 Position / map | words, directions | `shape_positions` forms | none |
| 33 Shapes with 4 sides | compare square / rectangle | `shape_attributes` (linked), `shape_corners_count` | linked (F9) |
| 34 Sort by one attribute | sort by colour / size | `classify_count` | none |
| 35, 36, 37 Spatial | match, turn, decompose, viewpoint | `compose_shapes`, `compose_hexagon`, `geo_rotate`, `cross_section_3d` | none at Reception |
| 39 Taking away | 6-10 pictured | `sub_wp_10` (no pic), `sub_5_pictures` | none |

## Counts

39 lessons (`wrmYear` "Y1" in `data/curriculum/site-lessons.json`): 4 committee (K, school weeks W15, W21, W29, W29) and
35 Support titles (enrich-native, all "Source: GPK": lessons of the older WRM Reception scheme, "From <phase> (Phase N)").

| Verdict | Lessons |
|---|---|
| full | 7: Add and subtract within 5 written vertically (column form), Compose shapes from smaller shapes, Bonds to 10 (explore combinations that make 10), Compare amounts (more, fewer, same), Compare mass (1), Compare mass (2), Represent numbers to 5 |
| partial | 28 (round 3: 3D shapes (cube, cuboid, sphere, cone, cylinder) moved here, F11) |
| gap | 4: Compare capacity (1), Compare capacity (2), Spatial reasoning (3) - visualize, build, Spatial reasoning (4) - mapping, direction |

Proposals used by lessons: **29 — 3 new, 26 reused** (round 3 adds `solids_turned`, new). Reused first from the R/Y1 lane: 15 of
Y1.json's own (sort_groups, match_same, zero, compare_small, subitise, add_10_pictures, sub_10_pictures, shapes_world,
shape_3d_tasks, teen_structure, number_focus, systematic_bonds, capacity_early, scenes, position_map) and 9 of R.json's, copied
verbatim with `"source": "R.json (passed lane; same id, same spec)"` (compare_shapes, compare_size, band_3, doubles_pictured,
defining_attributes, odd_even_pairs, more_less_pictures, shape_fit_turn, decompose_shapes); then 2 from the live lists
(shape_draw, WRM_PROPOSALS; vis_story_strip, VISUAL_BUILDS — the First / Then / Now strip). New (only what nothing existing
does): **classify_count_all** (sort, count each group, find the total; option on classify_count), **shape_build_kit** (build a
shape from sticks and clay balls; option on shape_attributes). Round 2 dropped `k_vertical_5` and `cuboid_find`: live skills
already deal them (F1, F2).

How a Support lesson is judged: at its **source year, Reception**. Its links are Reception-sized (the lesson's ceiling: its title
number, else the R lane's block numbers met before its phase) and pictured (no symbol equation or number line, no clock or
groups-of sentence, no squares or rectangles before Reception block 6 unless the title names them), and its pre cite only a
Reception step of a block **before its source phase** (`phases.json`: Phase 1-2 = from R.B1, 3 = R.B3, 4 = R.B5, 5 = R.B7,
6 = R.B9, 7 = R.B11, 8 = R.B13, 9 = R.B14, 10 = R.B16, 11 = R.B17). Phase 1-2 lessons (6) have nothing taught before them and
say so ("Pre-skills are few"). A committee lesson cites a Reception step, or a Y1 step / lesson of an earlier school week
(Kindergarten sheet); block Y1.B3 has no school week in the xlsx, so the shape lessons cite Reception shape steps.

## Every lesson

| Lesson | Flag | Week / judged at | Verdict | Direct / partial skills | Build | pre / related |
|---|---|---|---|---|---|---|
| Add and subtract within 5 written vertically (column form) | committee | W15 | full | `add_facts {"notation":["stacked"],"band":5}`, `sub_facts {"notation":["stacked"],"band":5}` | — | 3 / 1 |
| Sort into categories, count each group and find the total | committee | W21 | partial | `classify_count {"band":10,"objects":"pictures"}` | sort_groups, classify_count_all | 3 / 1 |
| Build and draw shapes | committee | W29 | partial | `shape_attributes {"forms":[0],"band":4}` | shape_draw, shape_build_kit | 3 / 0 |
| Compose shapes from smaller shapes | committee | W29 | full | `compose_shapes`, `compose_hexagon` | — | 2 / 0 |
| 3D shapes (cube, cuboid, sphere, cone, cylinder) | enrich-native | Support (Reception) | partial | `name_3d_shapes {"forms":[0]}`, `name_3d_shapes {"forms":[1]}` | solids_turned | 3 / 0 |
| 6, 7 and 8 - counting and subitising | enrich-native | Support (Reception) | partial | `count_objects {"band":10,"objects":"frame"}`, `count_objects {"band":10,"objects":"dice"}` | number_focus, subitise | 3 / 1 |
| 9 and 10 - count, represent, order | enrich-native | Support (Reception) | partial | `count_objects {"band":10,"objects":"frame"}`, `ten_frame_build {"band":10}` | number_focus, compare_small | 3 / 1 |
| Adding more (First/Then/Now stories) | enrich-native | Support (Reception) | partial | `add_5_pictures`, `add_wp_10 {"band":10}` | add_10_pictures, vis_story_strip | 3 / 1 |
| Bonds to 10 (explore combinations that make 10) | enrich-native | Support (Reception) | full | `make_ten {"band":10}` | — | 3 / 1 |
| Building numbers beyond 10 | enrich-native | Support (Reception) | partial | `teen_compose {"band":19}`, `ten_frame_build_teen {"band":19}` | teen_structure | 4 / 1 |
| Circles and triangles (properties) | enrich-native | Support (Reception) | partial | `shape_attributes {"forms":[0],"band":4}` | compare_shapes | 2 / 1 |
| Combining 2 groups | enrich-native | Support (Reception) | partial | `add_5_pictures`, `add_wp_10 {"band":7}` | add_10_pictures | 3 / 1 |
| Compare amounts (more, fewer, same) | enrich-native | Support (Reception) | full | `compare_groups {"band":5,"level":[1]}` | — | 0 / 2 |
| Compare capacity (1) | enrich-native | Support (Reception) | gap | — | capacity_early | 3 / 0 |
| Compare capacity (2) | enrich-native | Support (Reception) | gap | — | capacity_early | 3 / 0 |
| Compare mass (1) | enrich-native | Support (Reception) | full | `heavier_lighter_visual` | — | 2 / 0 |
| Compare mass (2) | enrich-native | Support (Reception) | full | `heavier_lighter_visual` | — | 2 / 0 |
| Compare size, mass and capacity informally | enrich-native | Support (Reception) | partial | `heavier_lighter_visual`, `compare_objects` | compare_size, capacity_early | 0 / 1 |
| Comparing numbers to 10 | enrich-native | Support (Reception) | partial | `compare_groups {"band":10,"level":[1,2]}` | compare_small | 3 / 1 |
| Comparing numbers to 5 | enrich-native | Support (Reception) | partial | `compare_groups {"band":5,"level":[1,2]}` | compare_small | 3 / 1 |
| Composition of 1, 2, 3 (parts make the whole) | enrich-native | Support (Reception) | partial | `number_bonds {"band":5}` | band_3 | 2 / 1 |
| Composition of 4 and 5 (bonds) | enrich-native | Support (Reception) | partial | `number_bonds {"band":5}` | number_focus, systematic_bonds | 3 / 1 |
| Counting patterns beyond 10 (teen numbers) | enrich-native | Support (Reception) | partial | `count_sequence {"band":20,"dir":"forward"}`, `number_seq_fill {"step":1,"dir":"forward"}` | number_focus | 3 / 1 |
| Deepening understanding (consolidate 2D/3D shapes) | enrich-native | Support (Reception) | partial | `name_2d_shapes {"forms":[1],"shapes":[0,1,2]}`, `name_3d_shapes {"forms":[1]}` | shape_3d_tasks, shapes_world | 3 / 0 |
| Doubling (up to 5+5) | enrich-native | Support (Reception) | partial | `doubles_near_doubles {"forms":[0]}`, `double {"band":20}` | doubles_pictured | 3 / 1 |
| Explore 2D shapes (circle, triangle, rectangle, square) | enrich-native | Support (Reception) | partial | `name_2d_shapes {"forms":[1],"shapes":[0,1,2]}` | defining_attributes | 0 / 1 |
| Introducing zero | enrich-native | Support (Reception) | partial | `sub_5_pictures`, `count_sequence {"band":10,"dir":"back"}` | zero | 3 / 0 |
| Making pairs | enrich-native | Support (Reception) | partial | `odd_even {"forms":[2],"range":10}` | odd_even_pairs | 3 / 1 |
| One more and less within 5 | enrich-native | Support (Reception) | partial | `count_sequence {"band":10,"dir":"forward"}`, `count_sequence {"band":10,"dir":"back"}` | more_less_pictures, band_3 | 3 / 1 |
| Positional language | enrich-native | Support (Reception) | partial | `shape_positions` | position_map | 0 / 0 |
| Positional language (on, under, in, next to) | enrich-native | Support (Reception) | partial | `shape_positions {"forms":[1]}` | position_map | 0 / 0 |
| Represent numbers to 5 | enrich-native | Support (Reception) | full | `ten_frame_build {"band":5}` | — | 3 / 1 |
| Shapes with 4 sides (squares and rectangles) | enrich-native | Support (Reception) | partial | `name_2d_shapes {"forms":[1],"shapes":[2]}`, `shape_attributes {"forms":[0],"band":4}` | compare_shapes | 2 / 1 |
| Sort objects by one attribute (colour, size, shape) | enrich-native | Support (Reception) | partial | `classify_count {"band":6,"objects":"pictures"}` | sort_groups | 0 / 1 |
| Spatial reasoning (1) - match, rotate, manipulate | enrich-native | Support (Reception) | partial | `compose_shapes` | match_same, shape_fit_turn | 3 / 0 |
| Spatial reasoning (2) - compose and decompose | enrich-native | Support (Reception) | partial | `compose_shapes` | decompose_shapes | 2 / 0 |
| Spatial reasoning (3) - visualize, build | enrich-native | Support (Reception) | gap | — | scenes | 3 / 0 |
| Spatial reasoning (4) - mapping, direction | enrich-native | Support (Reception) | gap | — | position_map | 1 / 0 |
| Taking away | enrich-native | Support (Reception) | partial | `sub_5_pictures`, `sub_wp_10` | sub_10_pictures | 3 / 1 |
Every verdict was judged from generated items with the listed opts (40 per link, `lessonfit.mjs`, seeds 61001 / 90907; round 2
also ran `--n 60` on the critic's two seed pairs, two more and three fresh sets: 0 findings each, see Round 2). The items of every link, 30 each from seed 71003, are in
`design/audit/runs/wrm-tagging/Y1-lesson-items.md` (`node tests/scripts/wrm-tagging/Y1/lessonitems.mjs --md …`).

## Hand audit of every FULL lesson (title clauses + every site CCSS code)

Round 2 (critic r1 G4): the audit is data, `tests/scripts/wrm-tagging/Y1/full_audit.json`, one row per FULL lesson naming its direct
links, how the title is dealt and one entry for EVERY CCSS code the site tags it with. `lessonfit.mjs` (FULLAUDIT) and
`lessoncheck.py` fail a FULL lesson with no row, a row whose links are not the direct links, a site code the row does not read, or
a row for a lesson that is not full (lesson 26 made full is now caught). A code the content does not teach is read as "site tag"
with its reason (owner question 3).

| Lesson | Title read from items | Site CCSS, each read |
|---|---|---|
| Add and subtract within 5 written vertically (column form) | Add and subtract within 5: add_facts deals + facts with sums 0 to 5 (0 + 4, 3 + 2) and sub_facts deals − facts from 5 or less (5 − 5, 3 − 2), every fact in reach; written vertically (column form): every item is in a column (add_facts: the fact cell with notation vertical; sub_facts: the column facts visual, facts-column-visual), the top number above the sign and the second number, a rule, one answer box; no carrying or borrowing row | **K.OA.A.5**: Fluently add and subtract within 5: both operations, every sum and every number taken from at most 5, as fact practice (one fact a cell, answer recalled); standards-audit.js already rules K.OA.A.5 FULL on these two skills at band 5 |
| Compose shapes from smaller shapes | Compose shapes from smaller shapes: compose_shapes joins two drawn pieces and asks which shape they make (two triangles a square, two squares a rectangle, two small triangles a larger triangle, two trapezoids a hexagon); compose_hexagon fills a hexagon outline with pattern blocks (triangles, rhombi or trapezoids) | **K.G.B.6**: Compose simple shapes to form larger shapes (the standard's example: two triangles with full sides touching make a rectangle): compose_shapes joins two whole pieces side to side, two triangles making a square (a rectangle with equal sides) and two squares a rectangle, and asks for the larger shape; compose_hexagon fills a larger shape with smaller ones |
| Bonds to 10 (explore combinations that make 10) | Bonds to 10, explore combinations that make 10: make_ten shows a ten frame with 1 to 9 counters and asks how many more make 10, every pair 1 + 9 to 9 + 1 dealt 5 to 7 times in 50 items | **K.OA.A.4**: For any number from 1 to 9, find the number that makes 10, with a drawing: each item draws the frame with the given number and the pupil records the missing part<br>**1.OA.C.6**: site tag: of the Grade 1 standard only its making-ten strategy is this lesson's content; adding and subtracting within 20 is not (the title bounds the lesson at 10, the Reception step R.B11.S8 'Bonds to 10 (2 parts)') |
| Compare amounts (more, fewer, same) | Compare amounts (more, fewer, same): two pictured groups of 1 to 5 counters, the pupil says which has more, which has fewer, or whether they are the same (about two items in three ask more or fewer, one in three "Do the groups have the same number of counters?") | **K.CC.C.6**: Identify whether one group is greater than, less than or equal to another by matching and counting: level 1 draws the two groups with no numbers, so the pupil matches or counts. The standard's "groups with up to ten objects" is the Kindergarten end; this Support lesson is judged at Reception Phase 2 (numbers to 5), and groups to 10 are lesson 19 (partial) |
| Compare mass (1) | Compare mass (1): two or three pictured objects, which is heavier, which is lighter | **K.MD.A.2**: Directly compare two objects with a measurable attribute (mass) and describe which has more of it: the pupil picks the heavier or the lighter object and says heavier / lighter (the Say: frame) |
| Compare mass (2) | Compare mass (2): the same content as Compare mass (1); the site gives the second session no other content (if it is the balance session R.B8.S2, it is partial with build balance: owner question) | **K.MD.A.2**: Directly compare two objects with a measurable attribute (mass) and describe which has more of it: the pupil picks the heavier or the lighter object and says heavier / lighter |
| Represent numbers to 5 | Represent numbers to 5: the pupil builds each number 1 to 5 (10 of each in 50) with counters on a ten frame | **2.NBT.A.1**: site tag (owner question 3). The content is K.CC.B.4 (connect a number to its quantity) and K.CC.B.5's "given a number, count out that many objects": the pupil reads the numeral and builds that many counters. The pupil never writes a numeral, so K.CC.A.3 is not claimed (critic r2 n6) |

Judged not full on audit: **3D shapes** (round 3, F11: each solid is one fixed drawing, never turned or resized, the same reason as lesson 26; no item tells flat from solid; partial, build solids_turned), **Explore 2D shapes** (name_2d_shapes draws each shape as one fixed picture, so K.G.A.2 "regardless
of their orientations or overall size" is not dealt; partial, build defining_attributes), **Shapes with 4 sides** (shape_attributes
counts the sides and vertices of a square and a rectangle, but nothing compares the two; partial, build compare_shapes).

## Gates (all 0), round 3

| Gate | Result |
|---|---|
| frozen: Y1 steps / tagFixes / step proposals byte for byte the base (sha256 da295cff…), input and output | OK |
| lessons.py checks (shape, verdicts, rule 15, related never cites earlier learning, class F keys, closes ⊆ build, every Y1 site lesson once) | 0 errors |
| lessonspec.py (the written links are the spec's, key + opts + Max Number, in order) | 167 links, 0 differences |
| lessoncheck.py (G1 / G4; round 3 G7: every field of every lesson proposal = the snapshot, R.json / live copies = their source) | 39 lessons, 29 proposals, 0 differences |
| lessonfit.mjs (CITE, SIZE, CONTENT, RESPONSE, WHY, CLAUSE, OWN, DUP, M, TITLEREP, RANGE, NOPIC, ASKED, share, column, bound, FULLAUDIT; round 3: NOPIC wordings, positive pictures, ASKED every shape, split, fill order, R10, WINDOW, ZERO, NEVER0, ORIENT, OBJN, story kind, GROUPRANGE, STD_ITEM) | 39 lessons, 116 links, 0 findings at the build seeds, and `--n 60` on the critic's [[72421,43],[38003,61]] and six fresh sets: [[24611,37],[81013,59]], [[55003,47],[16661,71]], [[3307,83],[99991,29]], [[41017,43],[73009,61]], [[28657,37],[46368,59]], [[61613,47],[19937,71]] |
| mergecheck Y1 alone; Y1 + R, + Y2, + Y3, + Y4, + Y5, + Y6 one by one (round 3: shared proposal ids compared, kind / skill / name / teaches) | OK each |
| mergecheck Y1 + R + Y2 … Y6 at once | 0 problems of this lane; the one base overlap is Y2 / Y4 (patterns:count_by_step_up\|Y2.B1.S15), not Y1 |
| critic's `merge2.mjs` (R, Y1, Y4, Y5 worktree; Y2, Y3 main; Y6 origin with lessons) | 0 real conflicts, order independent (200 orders), 0 own-step mismatches, 0 lesson-naming tagFixes, lessons = site in every lane, 124 shared ids with 0 differing kind / skill |
| lesson tagFixes | 0 |
| ws-wrm-extract --check --site … | exit 0 |
| ws-boot-smoke | OK |
| two clean `git archive` builds of fb5ed907 (dump.mjs → gen.py → Y1/build.py; B with TMPDIR in scratch and no WRM_TAG_DATA) | gen.py writes R b7fd3ef6… and Y1 da295cff… (= frozen); both builds exit 0 and write Y1.json sha256 e6f63aeb5b919801849c2077ebefb780bfe11b3ac17e91be2e1e4eb2698589c0 = the committed file |

**Mutations.** `lessonmut.py` (the builder's own): **82, 0 missed**. Round 3 adds: F12, F13 and the orientation claim re-injected;
G8's NOPIC ("without any drawing"), a positive picture claim on `sub_wp_10`, ASKED (pyramid), split into 2 equal groups, the fill
order, R10; the sweep classes WINDOW, ZERO, OBJN and the story kind; three audit-row mutations through a mutated `full_audit.json`
(`WRM_FULL_AUDIT`): F11 (lesson 5 full with its round-2 row claiming K.G.A.2 / K.G.A.3), n6 (K.CC.A.3) and "groups of 2 to 5";
D: p15, p16, a live copy's teaches, the new proposal's representation, two source-gate cases (an R.json and a VISUAL_BUILDS copy
edited in the file AND the snapshot alike: still caught), and mergecheck on a proposal shared with R.json.
The critic's `mymut2.py` on the round-3 file: **24 caught**; of the 4 not caught, 2 are its by-design controls ("numbers to 7"
inside the 1.5× slack; a cylinder among solids) and 2 are its "in the file" no-ops (F12, F13), which are fixed in the file and
re-injected by `lessonmut.py`, caught. The critic's 9 misses are all caught now (NOPIC "without any drawing", the positive picture
claim, ASKED pyramid, split into 2 equal groups, the fill order, F12, F13, the turned compose why, R10).
`postmut3.sh` (scratch; the critic's postmut2 p1-p16 rebuilt from its report, plus p17 `solids_turned.teaches` and p18
`shape_draw.name`), each in a clean `git archive` tree of fb5ed907 with the full build: **p0 exit 0, p1-p18 all exit 1** (p6, p12
by the frozen gate; p15 / p16 / p17 by the G7 snapshot, p16 also by the R.json source gate and mergecheck Y1+R; p18 by the live
source gate and mergecheck Y1+Y2; the rest by lessoncheck / lessonspec / lessonfit).

## Owner questions (with recommendations)

1. **The R/Y1 lane writes a proposal's `closes` as one string**, so a lesson's clause cannot go in `closes[<lesson id>]` without
   changing a frozen proposal. This build puts it in **`lessonCloses`** (a dict by lesson id) on those 14 Y1.json proposals; the
   lane-copied and new proposals carry the Y5 contract's `closes` dict. *Recommend the lead fold `lessonCloses` into `closes` when
   the R/Y1 `closes` strings are normalised to dicts at the merge, and union the 9 R-copied ids (string `closes` and R steps in
   R.json; dict `closes` and `steps: []` here; critic r1 n5).*
2. **35 Support titles are older-scheme Reception lessons that match R steps under other titles** (e.g. "Introducing zero" =
   R.B7.S1, "Bonds to 10" = R.B11.S8, "Compare mass (1)/(2)" = R.B8.S1, "Taking away" = R.B14.S3; each lesson's note names the
   step). *Recommend the site use the WRM titles so they resolve to the steps; until then they are tagged here as lessons.*
3. **Site CCSS tags that do not fit the content**: "Represent numbers to 5" is tagged 2.NBT.A.1 and "Comparing numbers to 5"
   1.NBT.B.3; "3D shapes" 1.G.A.1 (round 3: its non-defining attributes, orientation and size, are that lesson's missing part; the lesson is partial); "Bonds to 10" also 1.OA.C.6 (full_audit.json reads each code of the FULL lessons). *Recommend K.CC.B.4 / K.CC.C.7 / K.G.A.2 on the site; the verdicts here judge the content.*
4. **Kindergarten column form at W15**: answered in round 2 (F1). `add_facts` / `sub_facts {notation:[stacked], band:5}` write
   the within-5 facts in columns with no carrying row, so the lesson is full and `k_vertical_5` is withdrawn. A page with + and −
   mixed in one cell set is two sections of one sheet today; *build a mixed option only if the owner wants it.*
5. **Phase 1-2 Support lessons have no pre** (nothing is taught before them in Reception). *Recommend keeping the "Pre-skills are
   few" note rather than citing play-based steps without a skill.*
6. **Compare mass (1) and (2)** carry the same title and no other site content, so both are judged as R.B8.S1 (full). *If the
   school teaches (2) as the balance session (R.B8.S2 "Find a balance"), say so: it is then partial with build balance.*
7. **Introducing zero is partial here, R.B7.S1 is a gap in R.json** (frozen): `sub_5_pictures` takes every counter away in about 1
   item in 10 and the pupil writes 0 for the empty group left; `count_sequence {band:10, dir:back}` asks the number before 1 (0) in
   about 1 in 7. Neither shows a group that is empty from the start. *Recommend the R lane's next round re-judge R.B7.S1 the same way
   (partial on those two, build zero for the empty-from-the-start set).*

## The `lessons` JSON shape (the Y5 lane's contract)
```
"lessons": {
  "<site lesson id>": {                 // "K|-|<title slug>", data/curriculum/site-lessons.json
    "title": "...",
    "site": { "flag", "supplement", "firstWeek", "ccss", "ee", "domain", "unit", "block", "power" },
    "direct":  [{"key", "opts", "maxNumber"?}],
    "partial": [{"key", "opts"?, "maxNumber"?, "missing"}],
    "verdict": "full" | "partial" | "gap", "missing": "...",
    "build": ["proposalId"], "pre": [{"key", "opts"?, "maxNumber"?, "why"}], "preBuild": [], "related": [{"key", "opts"?, "why"}],
    "note": "...", "envision": [{"proposal", "name", "kind", "teaches", "closes", "representation"}]   // partial / gap only
  } }
```
Order: the site's. A pre's why starts "<step id> <its title> (<where it sits for this lesson>): <reason>". A proposal used by a
lesson carries `"lessons": [ids]` and its clause in `closes[<lesson id>]` (`lessonCloses[<lesson id>]` on the frozen R/Y1
proposals, question 1).
