# WRM page lane: independent critic, round 1 (2026-10-10)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-page` at `b96e5247`. Read-only critique. The critic used the real teacher
tasks at 1366x768 and 1280x720 (touch + mouse + keyboard) in both modes: **fallback** (`links/index.json` empty) and
**curated** (the taggers' WIP year files R…Y6 from `-wip-wrm-tag-r-y1`, `-y2-y3`, `-y4`, `-y5`, `-y6` and `MAP.json`
from `-wip-map-audit`, served through the gate's `--curated` interception). Rubric: `design/audit/RUBRIC.md` C1–C4,
applied to teacher screens (C4 = the teacher design system plus the B&W rule for thumbnails, and the school's own
words from the handbooks / pacing guides).

## Verdict: FAIL (round 1)

Every screen has at least one criterion below 8. Five blocking defects: two data-mapping bugs (17 lessons point at the
wrong White Rose step), curated options dropped from "Skills to do first" / "Skills that go with it", a stale render
on the MAP "By representation" view, `[object Object]` on the Skills to be made screen and its printout, and no skill
visible on a Chromebook when a lesson opens (at 1280x720 the sticky bar covers the Tick buttons).

## Scores

| Screen | C1 Ease | C2 Value | C3 Layout | C4 Fidelity | Pass |
|---|---|---|---|---|---|
| White Rose lessons (fallback) | 7 | 6 | 6 | 8 | no |
| White Rose lessons (curated) | 7 | 5 | 6 | 7 | no |
| Skills to be made | 8 | 6 | 8 | 7 | no |
| MAP · Practise by task | 8 | 7 | 7 | 7 | no |
| MAP · By representation | 6 | 4 | 7 | 8 | no |
| MAP · Start a MAP test (unchanged pupil path) | 8 | 8 | 8 | 8 | yes |

## Gates (critic's own runs)

| Gate | Result |
|---|---|
| ws-teacher-wrm (fallback) | OK |
| ws-teacher-wrm --curated (WIP R…Y6 + MAP.json) | OK |
| ws-wrm-page-unit | OK (945 lessons, 893 mapped) |
| ws-wrm-sequence.py --check --preview … | OK (without `--preview` it reports STALE: the build needs the scratch preview file; nit N6) |
| ws-code-snapshot.mjs | OK (608 codes, 35 categories, nothing moved) |
| ws-codec-registry.mjs | OK |
| ws-boot-smoke, ws-teacher-shell, ws-teacher-library, ws-teacher-preview, ws-share-options, ws-chromebook-fit, ws-search-terms | all OK (run one at a time) |
| Throwaway merge into `claude/sweet-newton-c8wrv1` (e58f15fa) | clean (auto-merged index.html; not pushed, worktree removed) |
| Console (critic probe, both modes, every screen) | clean |

The gates pass but miss B1–B5: none checks the step a lesson maps to against an exact title, the options on a pre /
related link, the MAP representation groups after a strand change, the spec text, or what is in the first viewport.

## Blocking defects

**B1 · 17 lessons mapped to the wrong White Rose step (C2 −2, all WRM screens).**
`tests/scripts/ws-wrm-sequence.py` `load_steps()` puts `norm(title)` and `loose(title)` (parentheses stripped) into ONE
`by_title` dict, so an exact title collides with a sibling's loose title, and `pick()` then chooses "nearest":
- Grade 4 D2 "Multiply a 2-digit number by a 2-digit number" → `Y5.B5.S2` (the *area model* step). Exact step is `Y5.B5.S3`.
- Grade 4 D3 "Equivalent fractions and decimals" → `Y5.B7.S3` (*hundredths*). Exact step is `Y5.B7.S4`.
- Grade 1 D2 "Find the difference (US: dollars & cents)" → `Y5.B13.S5` (Year 5 **negative numbers**), through the
  ±6-year fallback after the loose match. The Open lesson button gives a Grade 1 teacher a negative-numbers deck. It is a
  money lesson; no current Y2 step has that title (the old WRM Y2 Money block did), so it must be reported as unmapped
  or mapped to `Y2.B4.S7 Calculate with money` with a note.
- Pre-K: the PK branch filters candidates by `blockName == preview unit name`, which never matches (preview "Numbers 1, 2
  & 3" vs WRM "It's me 1, 2, 3"), so it falls back to the first candidate: "1 more" / "1 less" in CC2…CC6 all → `R.B3.S4`
  / `R.B3.S5` (10 lessons, 8 wrong), "Compare mass"/"Compare capacity" in G1 → `R.B2.S2/S3` (should be `R.B8.S1/S4`),
  "Shapes in the environment" G3 → `R.B4.S3` (should be `R.B6.S3`), "Find 2-D shapes within 3-D shapes" G5 → `R.B12.S2`
  (should be `R.B15.S8`). The report lists exactly these steps (`R.B5.S4`, `R.B7.S5`, `R.B8.S1` …) as "left out",
  which is the symptom.
- None of these is in the report's "Same-title … check" list as a problem except the two Grade 4 ones, which are
  presented as genuine same-title ties; the cross-year `wr` fallbacks (11 lessons, e.g. Grade 3 "Draw bar charts" →
  Y3) are not reported at all ("never guess silently").
Fix: keep `exact` and `loose` maps separate and try exact first in `candidates()`; never use the cross-year fallback for
`type == 'wr'` without reporting it; for PK match by block *number order* (preview unit n ↔ the R block that contains
the unit's first exact title) or by the full preview unit's step list. Add to `ws-wrm-page-unit`: within a grade no two
`wr` lessons share a step unless their titles are equal, and every exact title maps to its exact step.
Check: re-run; `Y5.B5.S3`, `Y5.B7.S4`, `R.B5.S4` … disappear from "left out"; the Grade 1 money lesson is reported.

**B2 · Curated options are dropped from "Skills to do first" and "Skills that go with it" (C2 −2, curated).**
`js/modules/wrm-links.js` `curatedLinks()` maps `pre` and `related` to `{ key, why }` and loses `opts`; only `direct`
keeps them. 1,965 of 5,443 curated pre/related links carry options (e.g. Y3.B1.S2 pre: `placevalue:combine {band:99}`,
`number_sense:place_on_number_line {span:10, band:100}`). Probe: Grade 2 · D1 · "Partition numbers to 100", Tick
Do-first skills → Practice link `?c=AP-UR-UT-PH-PD-PE-AK|Gp-A1` decodes to 7 skills with `opts {}`; the Print screen
shows "Default options" on every one. A pupil gets numbers to 1,000 or 10,000 instead of the curated "within 100".
Fix: `({ key: x.key, why: x.why || '', opts: x.opts || null })` for pre and related, and keep `opts` through
`applyOverride` (it rebuilds items). Check: unit test asserts curated pre opts survive `linksFor`; the gate decodes the
link's `opts` (not only ids) for a group with options.

**B3 · MAP "By representation" draws the previous strand's skills (C2 → 4, C1 → 6).**
`teacher-map-tasks.js` `repsHTML()` calls `pick.groupHTML(p.id, …)` inside the loop and `pick.setGroups(groups)` only
after it, so every group renders from the groups of the *previous* draw. Seen: Measurement → "Picture ↔ equation"
lists *Decompose to Unit Fractions* and *Add Fractions (Like Denom)* (Fractions skills) under the caption "1 skill
practises this change" with a count chip of 2 (builder's own `32-map-reps-1366.png`); Fractions & decimals →
every group shows count 0 and "No skill practises this change yet" under "2 skills practise this change"
(`cur-1366-11-map-reps.png` in the critic scratch). Fix: build `groups` first, `pick.setGroups(groups)`, then render.
Check: gate switches strand twice and asserts each group's row keys equal `REP_PAIRS[*].strands[strand].skills` (live).

**B4 · "Gap it fills: [object Object]" on Skills to be made and its printout (C2 −1, C4 −1).**
Curated proposals carry `closes` as an object keyed by step (`Y3.flex_partition.closes = {"Y3.B1.S1": "…", …}`,
`Y2.tens_ones_group`). `build-queue.js` does `e.closes.unshift(p.closes)`. Seen on "Count in Fractions" (spec and the
Print list). Fix: accept string | array | `{step: text}` → push `"<step title>: text"` strings. Check: unit test that no
`closes` item is a non-string; grep the print HTML for `[object`.

**B5 · On a Chromebook the lesson opens with no skill on screen; at 1280x720 the sticky bar covers the Tick buttons
(C3 → 6, C1 → 7).** Measured (curated, 1366x768): lesson card 316–562 px, Tick row 578–680, first group heading at 696,
action bar 698–768 — zero skills in the first viewport, and the List/Thumbnails toggle sits under the bar
(`14-curated-to-be-built-1366.png`). At 1280x720 the unit chips wrap (Enrichment on a 2nd row), the Tick row is at
628–730 and the bar at 650–720: tapping "Do-first skills" hits the bar (critic probe timed out on exactly that click;
`fb-1280-01-partition-list.png`). The finder (search + grade + unit, ~300 px) stays above the lesson for ever.
Fix (any one that puts the first skill row above 560 px at 1366x768 and keeps every Tick button clear of the bar at
1280x720): collapse the finder to one line when a lesson is open (search + "Grade 2 · D1 ▾" breadcrumb), move the
Tick row into the action bar or the lesson card, and on lesson open scroll the detail so the lesson title is at the top
(it already calls `scrollIntoView` but the head + tick row are 360 px). Check: gate asserts at 1366x768 and 1280x720
that `[data-w-group="direct"] .tvw-row` top < innerHeight − bar height, and that no `[data-w-quick]` intersects `#tvwBar`.

## Major / minor defects (not blocking alone)

- M1 (C2, curated): 3,754 of 5,363 pre/related "why" lines show raw ids and lane jargon to teachers: "Y3.B1.S1 Represent
  numbers to 100 (step before in the block)", "(prior learning wk W01)". The handbook says "support block" and "W01";
  write "Grade 2 lesson 1: Represent numbers to 100 (the lesson before)" / "Support block, Grade 1: …". Same for the
  partial verdict text ("are not dealt"), and MAP notes ("(part C)"). Fix in `teacher-skillpick.js` `why()` (translate
  `(R|Y\d)\.B\d+\.S\d+` through `wrmStep` + `gradeOfYear`) or in the tagging lanes.
- M2 (C3): the toast "Practice link copied" sits on top of the link field it refers to (`03-ticked-link-1366.png`).
  Move the toast above the bar while a picker bar is on screen.
- M3 (C2): the link note says "· copied" even when `copyText` failed. Set it after the copy result.
- M4 (C1): MAP Practise-by-task state (strand, band, task) is not in the URL; Back leaves the MAP page. Bookmark/Back was
  only required for White Rose, but the owner asked for "a MAP page like White Rose".
- M5 (speed): opening any of the three screens fetches all seven year files + MAP.json: 2.1 MB of JSON (≈ 350–450 KB
  gzipped on Pages) before the first lesson shows. Measured with 4x CPU throttle: hash bookmark → lesson 749 ms
  (curated) / 418 ms (fallback), lesson open 278–497 ms, thumbnails 630 ms (fallback). Acceptable today; load the
  open grade's year first and the rest idle.
- M6 (C4): lesson rows read "W01 · S P I" — the letters are the workbook's column heads; the pacing guide says
  Standard / Priority / Intervention. Show "All strands" / "Standard + Priority" / "Standard only", and the week dates
  the guide uses ("W01 · 6–10 Sep", the data has `weekOf`). The domain exam week (red row) and MAP week are not shown.

## Nits

- N1 `css/teacher-wrm.css` link in `index.html` has no `?v=` stamp (the lead's stamp step covers it).
- N2 Copied-in lesson's Open lesson button opens the mapped step's deck — correct, but say "(Grade 3 files)" on the button.
- N3 Search hit shows only the first CCSS code ("3.NF.A.1" finds "Unit fractions · 1.G.A.3"); show the code that matched.
- N4 Thumbnails grid leaves the right half empty with 2 cards (cards fixed ~200 px); fine, but 3–4 per row would show more.
- N5 Gap lesson empty state: "No skill teaches this lesson yet. The skills below still help." — good; the "To be built"
  link works and lands on the open entry with focus.
- N6 `ws-wrm-sequence.py --check` without `--preview` reports STALE because Pre-K comes from a scratch file that is not in
  the repo; commit the decoded PK slice (data, not the site HTML) or make `--check` read PK from the existing JSON.

## What works (one line each, for the 8s)

Order: every grade's units and lessons match the xlsx week order exactly (826 workbook lessons + 119 Pre-K = 945; 0
order differences). Search finds by CCSS code, lesson title and unit; Enter jumps; Escape clears. Hash bookmark, Back
from Print and from another screen all return to the lesson. Practice link opens the unchanged pupil landing ("Ready to
Practice 7 Skills?"). Print opens the Print worksheets screen with the ticked skills as one mixed section. Everything =
9/9 skills. No horizontal scroll, no clipping, no target under 44 px on any of the three screens at 1366 or 1280. The
old "Start a MAP test" view is intact and an old `openMapTest()` entry lands on it. Totals, five filters, search, spec
expand, Print list (15 entries for "3.NF.A.1") and CSV all work. Thumbnails are the B&W paper cells.

## The sequence data (945 / 893 / 52)

- 52 unmapped = 44 CCSS BUILD lessons (correct: no White Rose lesson exists) + 8. Of the 8: the four Grade 5 enrichment
  titles (Consolidation of arithmetic, Problem solving across strands, End-of-year investigation projects, Reasoning
  tasks) are correctly unmapped. The four US-money titles (Grade 1 "Find the total", "Count money - notes and coins",
  "Select money"; Grade 3 "Pounds, tens, ones and pence") are old-WRM titles; near matches exist (`Y2.B4.S7 Calculate with
  money`, `Y2.B4.S2/S3`, `Y2.B4.S4 Choose notes and coins`, `Y4.B10.S1 Write money using decimals`) — owner question Q5.
- But "893 mapped" includes the 17 wrong mappings of B1, and a 9th money lesson ("Find the difference (US …)") that
  should have been unmapped.
- Workbook/preview disagreements (11): all are lessons the workbook copies into a second grade; fine as reported.

## Owner decision points

The builder's five owner questions were not in this critic's brief or in the lane's commits, so they are not quoted
here. The critic's view on the decisions this page raises:

1. Curated year files win over the computed rules: agree; keep the rules as the fallback, and fix B2 first.
2. "Unit" chips labelled "D1 Number & Operations in Base Ten": agree — the pacing guides use exactly "D1 · …".
3. Pre-K from the site preview, one chip per domain: agree, after B1's Pre-K mapping fix.
4. Skills to be made reached from Home, White Rose and MAP (not the sidebar): agree.
5. The four unmapped US-money lessons: suggest mapping each to the nearest current money step with an "ADAPT: US money"
   tag (the pacing guide's own word) rather than leaving Grade 1 lessons with no skills.

Critic scratch (probe script, logs, PNGs): `scratchpad/wrm-page-critic-r1/` — `probe.cjs`, `probe-cur-1366.out`, `probe-fb-1280.out`, `cur-1366-*.png`, `fb-1280-*.png`.
