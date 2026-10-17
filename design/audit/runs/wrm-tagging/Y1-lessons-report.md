# Wave 2 tagging: Year 1 (US Kindergarten) — site lessons (owner rule 2026-10-16)

Output: the top-level `lessons` section of `data/curriculum/links/Y1.json`, written by `tests/scripts/wrm-tagging/Y1/build.py`
(spec `spec_lessons.py`; shape and checks `lessons.py`; gates `lessonfit.mjs`, `lessonspec.py`, `mergecheck.mjs`; mutations
`lessonmut.py`). Y1's WRM steps passed the R/Y1 lane (critic r12) and are **frozen**: the build checks, before and after writing,
that the steps, the tagFixes and every step proposal are byte for byte the R/Y1 lane's file (sha256 `da295cff…`, the file at
base a208906d + origin/claude/sweet-newton-c8wrv1). Lessons emit **no tagFixes**.

**Build order (documented).** The R/Y1 lane's generator `tests/scripts/wrm-tagging/gen.py` (with `spec.py`) rewrites `R.json`
and `Y1.json` without a `lessons` section, so a rerun of it drops the lessons. The lessons build is therefore the **last step**:
`python3 tests/scripts/wrm-tagging/gen.py <root>` (only if the steps change, which needs a new critic) and then
`python3 tests/scripts/wrm-tagging/Y1/build.py`. The lessons build strips what an earlier run of itself added, verifies the frozen
sha, adds the lessons, writes, and runs every gate; running it twice gives the same bytes. Nothing of the R/Y1 lane's shared
top-level files was moved or changed.

## Counts

39 lessons (`wrmYear` "Y1" in `data/curriculum/site-lessons.json`): 4 committee (K, school weeks W15, W21, W29, W29) and
35 Support titles (enrich-native, all "Source: GPK": lessons of the older WRM Reception scheme, "From <phase> (Phase N)").

| Verdict | Lessons |
|---|---|
| full | 6: Compose shapes from smaller shapes (compose_shapes + compose_hexagon), Bonds to 10 (make_ten band 10), Compare amounts (compare_groups band 5), Compare mass (1) and (2) (heavier_lighter_visual), Represent numbers to 5 (ten_frame_build band 5) |
| partial | 28 |
| gap | 5: Compare capacity (1) and (2), Introducing zero, Spatial reasoning (3) visualise / build, Spatial reasoning (4) mapping / direction |

Proposals used by lessons: **29 — 4 new, 25 reused**. Reused first from the R/Y1 lane: 14 of Y1.json's own (sort_groups,
match_same, zero, compare_small, subitise, add_10_pictures, sub_10_pictures, shapes_world, shape_3d_tasks, teen_structure,
number_focus, capacity_early, scenes, position_map) and 9 of R.json's, copied verbatim with `"source": "R.json (passed lane; same
id, same spec)"` (compare_shapes, compare_size, band_3, doubles_pictured, defining_attributes, odd_even_pairs, more_less_pictures,
shape_fit_turn, decompose_shapes); then 2 from the live lists (shape_draw, WRM_PROPOSALS; vis_story_strip, VISUAL_BUILDS — the
First / Then / Now strip). New (only what nothing existing does): **k_vertical_5** (add and subtract within 5 in a column, + and −
on one page, no carrying row; option on add_10_no_regroup / sub_10_no_regroup), **classify_count_all** (sort, count each group,
find the total; option on classify_count), **shape_build_kit** (build a shape from sticks and clay balls; option on
shape_attributes), **cuboid_find** (name_3d_shapes {forms:[1]} also asks for the rectangular prism; in 40 items it never does).

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
| Add and subtract within 5 written vertically (column form) | committee | W15 | partial | `add_10_no_regroup`, `sub_10_no_regroup` | k_vertical_5 | 3 / 1 |
| Sort into categories, count each group and find the total | committee | W21 | partial | `classify_count` | sort_groups, classify_count_all | 3 / 1 |
| Build and draw shapes | committee | W29 | partial | `shape_attributes` | shape_draw, shape_build_kit | 3 / 0 |
| Compose shapes from smaller shapes | committee | W29 | full | `compose_shapes`, `compose_hexagon` | — | 2 / 0 |
| 3D shapes (cube, cuboid, sphere, cone, cylinder) | enrich-native | Support (Reception) | partial | `name_3d_shapes` | cuboid_find | 3 / 0 |
| 6, 7 and 8 - counting and subitising | enrich-native | Support (Reception) | partial | `count_objects`, `count_objects` | number_focus, subitise | 3 / 1 |
| 9 and 10 - count, represent, order | enrich-native | Support (Reception) | partial | `count_objects`, `ten_frame_build` | number_focus, compare_small | 3 / 1 |
| Adding more (First/Then/Now stories) | enrich-native | Support (Reception) | partial | `add_5_pictures`, `add_wp_10` | add_10_pictures, vis_story_strip | 3 / 1 |
| Bonds to 10 (explore combinations that make 10) | enrich-native | Support (Reception) | full | `make_ten` | — | 3 / 1 |
| Building numbers beyond 10 | enrich-native | Support (Reception) | partial | `teen_compose`, `ten_frame_build_teen` | teen_structure | 4 / 1 |
| Circles and triangles (properties) | enrich-native | Support (Reception) | partial | `shape_attributes` | compare_shapes | 2 / 1 |
| Combining 2 groups | enrich-native | Support (Reception) | partial | `add_5_pictures`, `add_wp_10` | add_10_pictures | 3 / 1 |
| Compare amounts (more, fewer, same) | enrich-native | Support (Reception) | full | `compare_groups` | — | 0 / 2 |
| Compare capacity (1) | enrich-native | Support (Reception) | gap | — | capacity_early | 3 / 0 |
| Compare capacity (2) | enrich-native | Support (Reception) | gap | — | capacity_early | 3 / 0 |
| Compare mass (1) | enrich-native | Support (Reception) | full | `heavier_lighter_visual` | — | 2 / 0 |
| Compare mass (2) | enrich-native | Support (Reception) | full | `heavier_lighter_visual` | — | 2 / 0 |
| Compare size, mass and capacity informally | enrich-native | Support (Reception) | partial | `heavier_lighter_visual`, `compare_objects` | compare_size, capacity_early | 0 / 1 |
| Comparing numbers to 10 | enrich-native | Support (Reception) | partial | `compare_groups` | compare_small | 3 / 1 |
| Comparing numbers to 5 | enrich-native | Support (Reception) | partial | `compare_groups` | compare_small | 3 / 1 |
| Composition of 1, 2, 3 (parts make the whole) | enrich-native | Support (Reception) | partial | `number_bonds` | band_3 | 2 / 1 |
| Composition of 4 and 5 (bonds) | enrich-native | Support (Reception) | partial | `number_bonds` | number_focus | 3 / 1 |
| Counting patterns beyond 10 (teen numbers) | enrich-native | Support (Reception) | partial | `count_sequence`, `number_seq_fill` | number_focus | 3 / 1 |
| Deepening understanding (consolidate 2D/3D shapes) | enrich-native | Support (Reception) | partial | `name_2d_shapes`, `name_3d_shapes` | shape_3d_tasks, shapes_world | 3 / 0 |
| Doubling (up to 5+5) | enrich-native | Support (Reception) | partial | `doubles_near_doubles` | doubles_pictured | 3 / 1 |
| Explore 2D shapes (circle, triangle, rectangle, square) | enrich-native | Support (Reception) | partial | `name_2d_shapes` | defining_attributes | 0 / 1 |
| Introducing zero | enrich-native | Support (Reception) | gap | — | zero | 3 / 1 |
| Making pairs | enrich-native | Support (Reception) | partial | `odd_even` | odd_even_pairs | 3 / 1 |
| One more and less within 5 | enrich-native | Support (Reception) | partial | `count_sequence`, `count_sequence` | more_less_pictures, band_3 | 3 / 1 |
| Positional language | enrich-native | Support (Reception) | partial | `shape_positions` | position_map | 1 / 0 |
| Positional language (on, under, in, next to) | enrich-native | Support (Reception) | partial | `shape_positions` | position_map | 0 / 0 |
| Represent numbers to 5 | enrich-native | Support (Reception) | full | `ten_frame_build` | — | 3 / 1 |
| Shapes with 4 sides (squares and rectangles) | enrich-native | Support (Reception) | partial | `name_2d_shapes` | compare_shapes | 2 / 1 |
| Sort objects by one attribute (colour, size, shape) | enrich-native | Support (Reception) | partial | `classify_count` | sort_groups | 0 / 1 |
| Spatial reasoning (1) - match, rotate, manipulate | enrich-native | Support (Reception) | partial | `compose_shapes` | match_same, shape_fit_turn | 3 / 0 |
| Spatial reasoning (2) - compose and decompose | enrich-native | Support (Reception) | partial | `compose_shapes` | decompose_shapes | 3 / 0 |
| Spatial reasoning (3) - visualize, build | enrich-native | Support (Reception) | gap | — | scenes | 3 / 0 |
| Spatial reasoning (4) - mapping, direction | enrich-native | Support (Reception) | gap | — | position_map | 1 / 0 |
| Taking away | enrich-native | Support (Reception) | partial | `sub_5_pictures`, `sub_wp_10` | sub_10_pictures | 3 / 1 |
Every verdict was judged from generated items with the listed opts (40 per link, `lessonfit.mjs`, seeds 61001 / 90907, then two
fresh seed sets, 13579 / 24680 and 777001 / 888002: 0 findings each). The items of every link, 30 each from seed 71003, are in
`design/audit/runs/wrm-tagging/Y1-lesson-items.md` (`node tests/scripts/wrm-tagging/Y1/lessonitems.mjs --md …`).

## Hand audit of every FULL lesson (title clauses + CCSS descriptor, Kindergarten range)

| Lesson | Clause | Items (40, opts as listed) | Holds |
|---|---|---|---|
| Compose shapes from smaller shapes (W29, K.G.B.6) | "compose simple shapes" | compose_shapes {}: two drawn shapes joined, "What shape do you make when you put these two shapes together?" (triangle, square, rectangle, hexagon); compose_hexagon {}: fill a hexagon with triangles, trapezoids or rhombi | yes |
| | "to form larger shapes" (K.G.B.6: "join these two triangles … to make a rectangle") | every compose_shapes item makes one larger shape from two pieces; compose_hexagon from pattern blocks | yes |
| | Kindergarten response | a pick of one shape name or dragging blocks; no numbers, no × (compose_rect_from_squares, which prints "2 × 3", is left out on purpose) | yes |
| Bonds to 10 (Support, Reception, K.OA.A.4 / 1.OA.C.6) | "bonds to 10" | make_ten {band:10}: "The frame shows n. How many more make 10?", a drawn ten frame | yes |
| | "explore combinations that make 10" / K.OA.A.4 "for any number from 1 to 9" | n is 1 to 9, each 4-5 times in 40 items: every pair 1 + 9 … 9 + 1 | yes |
| | "record the answer with a drawing or equation" | one number box under the frame (the drawing is given) | yes for Reception; the equation form is K (Y1.B2.S7, the same skill full there) |
| Compare amounts: more, fewer, same (Support, K.CC.C.6) | "more" / "fewer" / "same" | compare_groups {band:5, level:[1]}: in 60 items 39 ask which group has more or fewer and 21 whether they are the same (9 are the same) | yes |
| | K.CC.C.6 "greater than, less than, equal to … by matching and counting" | two pictured groups to 5, counted or matched | yes |
| Compare mass (1) and (2) (Support, K.MD.A.2) | "compare mass" | heavier_lighter_visual: "Which is heavier?" / "Which is lighter?" of 2-3 pictured objects (feather, leaf, apple, book, dog, car, truck) | yes |
| | K.MD.A.2 "directly compare two objects … more of / less of … describe the difference" | the pupil picks the heavier or lighter object; the oral frame says "the … is heavier than the …" | yes for Reception (a balance is the build `balance`, R.B8.S2) |
| Represent numbers to 5 (Support) | "represent" | ten_frame_build {band:5}: "Build n on the ten frame" | yes |
| | "numbers to 5" | n is 1 to 5, each 8 times in 40 | yes |
| | site CCSS 2.NBT.A.1 | a mis-tag on the site (hundreds, tens, ones); the content is K.CC.B.4 | see owner question 3 |

Judged not full on audit (would pass the gates as full): **Explore 2D shapes** (name_2d_shapes draws each shape as one fixed
picture, so K.G.A.2 "regardless of their orientations or overall size" is not dealt; partial, build defining_attributes),
**3D shapes** (the cuboid is never asked; partial, build cuboid_find), **Shapes with 4 sides** (the title names the property,
4 sides, which no item counts; partial, build compare_shapes).

## Gates (all 0)

| Gate | Result |
|---|---|
| frozen: Y1 steps / tagFixes / step proposals byte for byte the base (sha256 da295cff…), input and output | OK |
| lessons.py checks (shape, verdicts, rule 15 pre ≥ 3 or a note, related never cites earlier learning, class F keys, closes ⊆ build, every Y1 site lesson once) | 0 errors |
| lessonspec.py (the written links are the spec's, key + opts + Max Number, in order) | 165 links, 0 differences |
| lessonfit.mjs (CITE, SIZE, CONTENT, RESPONSE, WHY, CLAUSE, OWN, DUP, M, TITLEREP, RANGE) | 39 lessons, 119 links, 0 findings (3 seed sets) |
| mergecheck Y1 alone; Y1 + R, + Y2, + Y3, + Y4, + Y5, + Y6 one by one | OK each |
| mergecheck Y1 + R + Y2 … Y6 at once | 0 problems of this lane; the one base overlap is Y2 / Y4 (patterns:count_by_step_up\|Y2.B1.S15), not Y1 |
| lesson tagFixes | 0 |
| ws-wrm-extract --check --site … | exit 0 |
| ws-boot-smoke | OK |
| two clean `git archive` builds of the commit | byte-identical to each other and to the committed file (Y1.json sha256 45d6331da0b17965…) |

**Mutations (`lessonmut.py`, 41, 0 missed).** A (lessonfit): SIZE; CONTENT flags (×), R_EQ (number line), squares before R.B6,
rule 19 (counting in 2s at W21), week limit (numbers to 100 at W15), degenerate items; CITE: Support cites a Y1 step, Support
cites a step of its own phase, a W21 lesson cites a W23 step, key not tagged to the cited step, why without the cited title; WHY:
a shape the items never show, a K word ("heavier") the items never do, a number bound the items pass; CLAUSE: a bound, a negated
operation, a false claim (money); OWN (class F), DUP, M (an option the clause denies), TITLEREP FULL (3-D made full), TITLEREP
CLAUSE (vertical never named), RANGE full, RANGE partial clause, RESPONSE (Support full on a number line; K full with ×).
B (lessons.py through `build.py --spec … --dry`): full with a build, rule 15, related cites a step, class F key, unknown key,
closes outside the build, a lesson left out. C: lessonspec re-option; frozen gate on a step verdict, a tagFix why, a proposal's
teaches, a lesson id put in a proposal's steps (and the built file passes unmutated); mergecheck on a tagFix naming a lesson and
on a lesson missing from the section.

## Owner questions (with recommendations)

1. **The R/Y1 lane writes a proposal's `closes` as one string**, so a lesson's clause cannot go in `closes[<lesson id>]` without
   changing a frozen proposal. This build puts it in **`lessonCloses`** (a dict by lesson id) on those 14 Y1.json proposals; the
   lane-copied and new proposals carry the Y5 contract's `closes` dict. *Recommend the lead fold `lessonCloses` into `closes` when
   the R/Y1 `closes` strings are normalised to dicts at the merge.*
2. **35 Support titles are older-scheme Reception lessons that match R steps under other titles** (e.g. "Introducing zero" =
   R.B7.S1, "Bonds to 10" = R.B11.S8, "Compare mass (1)/(2)" = R.B8.S1, "Taking away" = R.B14.S3; each lesson's note names the
   step). *Recommend the site use the WRM titles so they resolve to the steps; until then they are tagged here as lessons.*
3. **Site CCSS tags that do not fit the content**: "Represent numbers to 5" is tagged 2.NBT.A.1 and "Comparing numbers to 5"
   1.NBT.B.3; "3D shapes" 1.G.A.1. *Recommend K.CC.B.4 / K.CC.C.7 / K.G.A.2 on the site; the verdicts here judge the content.*
4. **Kindergarten column form at W15** (K.OA.A.5 written vertically): the live stacked skills show a "Use top row for carrying"
   line. *Recommend the k_vertical_5 option drop that line for the within-5 band, as proposed.*
5. **Phase 1-2 Support lessons have no pre** (nothing is taught before them in Reception). *Recommend keeping the "Pre-skills are
   few" note rather than citing play-based steps without a skill.*

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
