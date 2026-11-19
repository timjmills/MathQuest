# Design card: Lessons browser (lessons-passed registry, status chips, grade / area / 8/10 filters, Thumbnails | List)

Status: DESIGN, unsigned (owner questions at the end). Designer: Opus medium, 2026-11-19, branch claude/sweet-newton-c8wrv1-lf-tools-lessons.
Requests: owner via the lead, 2026-11-14 to 11-19 (items 1-7 below). Mock: `design/status/lf-checks/lessons-browser/mock.html`
(the app's teacher CSS, real lesson rows from `wrm-links.js` + `data/curriculum/links/<Y>.json`), screenshots beside it at
1366 x 768 and 1024 x 768, DSF 2: `a-list`, `b-thumbs`, `c-only`, `d-skills`, `e-open` (`-1366.png`, `-1024.png`).
No 390 px host (FASTEST_PLAN rule 7).

## What exists today (read before building)

- Lessons screen = `js/modules/teacher-wrm.js` (`#wrm/...`). Rows come from `wrm-links.js` `gradeSections(grade)`; grades are
  the school sequence (`WRM_SEQUENCE`: PK, K, 1-5) and are hard-coded in `GRADE_BTN`. Each row has the coverage chip
  `coverage(l)` -> `COVER_TAG` Full / Covers part / No skill yet. Sections are the CCSS domains (`L.domainName`), not the
  Skills screen's areas.
- Skills screen = `js/modules/teacher-library.js` (the Grade pills `GRADES`, hard-coded K-6 + Mixed; Browse by area; the
  corner mark `.ts-pass` from `REDESIGN_PASSED`, css/teacher-library.css 537-541). Its area map is **`teacher-areas.js`
  `AREAS` / `areaOf(category, skill)` / `areaOfCode(ccss, grade)`**, not data.js `DOMAINS` (DOMAINS drives only the legacy
  navigator). The lead's "Skills screen's DOMAINS" is read here as the Skills screen's area map; see Q1.
- Lessons that a critic grades as WHOLE lessons: (a) the detailed lessons (`js/modules/lessons/detailed/index.js`, 7 ids,
  joined to a site lesson by `data/curriculum/detailed-lessons.json` `siteLessonId`); (b) the lesson library
  (`js/modules/lessons/library.js`, step ids such as `Y1.B2.S9` and skill lessons `skill:<cat>:<skill>`), whose status
  `ws-lesson-coverage.cjs` computes from `design/audit/runs/lessons-*/grades.jsonl` + render stamps.

## 1. The registry: `js/modules/lessons-passed.js`

Mirrors `redesign-passed.js`: header comment (THE ONE PLACE), evidence constants, id arrays, and
`export const LESSONS_PASSED = new Map([[id, evidence], ...])` plus `lessonPassed(id)`. No other file records a lesson pass;
every reader (rows, cards, the lesson header card) imports this file only.

Id forms: a detailed lesson id (`g3-oa5-mult-properties`), a library step lesson (`Y3.B1.S2`), or a skill lesson
`skill:<category>:<skill>`. A Lessons-screen row is passed when its own key, its step, or the detailed lesson joined to its
site id is in the map (one helper, `lessonPassFor(row)`, in `lessons-passed.js`).

### Seed: what qualifies (searched design/status/*.md, design/lesson-planner/lessons/*/critic-r*.md, lessons-r1..r4, lf-engine)

| Lesson | Last whole-lesson critic | Seed? |
|---|---|---|
| g2-nbt3-read-write-1000 (lesson 1) | r4 PASS 30/30 pages >= 8, 2026-10-16 | yes |
| g1-oa1-bar-model-wp-20 (lesson 2) | r4 PASS 21/21, 2026-10-17 (owner shipped later E24b fixes with 4 gate findings, 2026-11-07) | yes, see Q2 |
| g3-oa5-mult-properties (lesson 3a) | r3 PASS 2026-10-17 + narrow live critic r2 PASS min 8 on the owner-ruling pages, 2026-11-07 | yes |
| g3-oa9-mult-table-patterns (lesson 4) | r3 PASS 21/21, 2026-10-17 | yes |
| g3-oa9-input-output-rule (lesson 5) | r3 PASS, 2026-10-17 | yes |
| g4-nbt1-ten-times-value (lesson 6) | r3 PASS 8/8/8/8, 2026-10-30 (design/status/lessons-6-7.md) | yes |
| g3-oa8-two-step-wp (lesson 7) | r1 FAIL 8/7/7/7 | no |
| Y1.B2.S9, Y2.B2.S18, Y4.B1.S14 (library samples) | lessons-r4 passed, now STALE (render changed; lead reset b8ba85bd) | no |
| 39 `skill:*` library lessons | no critic round (draft) | no |
| lf-vocab "4 lesson vocab pages", pv lesson pages | page passes inside a skill's critic | no: a page is not a lesson |

**6 lessons qualify.** Evidence line per id: `lane, critic round, file, date`, e.g.
`'Detailed lessons wave 8 (lesson 4), critic r3 PASS 21/21 pages >= 8; design/lesson-planner/lessons/g3-oa9-mult-table-patterns/critic-r3.md, 2026-10-17'`.
Caveat (Q2): every one of the six files has commits after its pass (1-8 each) and the shared engine changed; detailed lessons
have no render stamp, so staleness cannot be shown or ruled out by machine today.

## 2. The corner mark

The Skills screen's `.ts-pass` folded corner, unchanged in size and colour, on: a lesson row (List), a lesson thumbnail card,
the opened lesson's header card (34 px, `e-open`). Read only from `lessons-passed.js`. Additive CSS: `.tvw-nrow .ts-pass`
position + 30 px right padding on a marked row so the corner never sits on a chip (mock `a-list`).

## 3. Status chip + summary

Beside the existing coverage chip, one of:
- `8/10 ✓` (solid ink chip) — `lessonPassFor(row)`;
- `To build` (grey hatched outline) — from the coverage data only: `linksFor(l).direct` empty, or `linksFor(l).build` non-empty
  while the verdict is not full (the WRM_PROPOSALS build list). Never a hand list;
- nothing — built, not passed.
Summary line under the filters for the current grade(s) and area(s): "142 lessons: 3 passed · 46 built · 93 to build"
(real grade 3 figures; the toggle adds "— showing the 3 passed"). Black and white; 12 px chips, 20 px tall; assessments get no chip.

## 4. "Only 8/10 ✓" toggle

A switch pill "Only 8/10 ✓ (n)", n = registry size (Lessons 6, Skills 32). On BOTH screens. Off by default; persisted per viewer
(localStorage, try/catch) and NOT reset by a grade or area change. It combines (AND) with grade and area.

## 5. Grade chips

One shared helper, `js/modules/grade-of.js`: `usGradeOfYear('Y1') = 'K'`, `'Y2'..'Y6' -> '1'..'5'`, `'R' -> 'PK'`; a
`skill:` lesson's grade = `data.js SKILL_GRADES`. A lesson's grade = the year of its own WRM step (the site row's year when it
has no step). Chips = `All` + the grades the lessons carry, sorted PK, K, 1-6 — generated, never listed. No Year 7: grade 6
appears only when a `skill:` lesson of a grade-6 skill exists (none today, so no chip). Skills screen: its `GRADES` list
becomes the grades its skills carry (same helper for order and words), keeping Mixed.
Real data: 13 of 1,054 site rows sit in a school grade that differs from their step year (e.g. 5 grade-3 rows are Y3 steps);
the rule moves them (Q3).

## 6. Area chips and headings

Chips = `All areas` + `AREAS` (teacher-areas.js) that the selected grade(s) carry, each with its count. Inside the grade the
list is grouped under area headings in AREAS order. A lesson's area: `areaOf()` of its first direct skill; if none, of the
first build-list skill it waits for (`WRM_PROPOSALS[id].skill`); if none, `areaOfCode(ccss[0], grade)`. All three are the
same file, no second map. Several grades selected: grade heading, then area headings. Extra lessons (support, projects,
assessments) stay in their own last section (Q4).

## 7. View: Thumbnails | List

- Thumbnails: the Skills card grid (`ts-grid`, `ts-card`): first-page preview, title, grade badge, chips, corner. Previews are
  lazy: an IntersectionObserver renders the first page of a lesson only when its card nears the viewport, through
  `teacher-chip.js mountCropped`, and caches it by `lessonId|renderHash` (memory + IndexedDB). A lesson without a detailed
  lesson shows its first skill's cropped item, or a plain "To build" card. Never every lesson's full HTML on load.
- List: today's compact rows plus the new chip and corner.
- Open (either): the current lesson view, with `← All lessons` at the top that returns to the list with the same grade(s),
  area(s), toggle, view and scroll position (kept in `v` + the hash `#wrm/<grade>?a=..&only=1&view=thumbs`; scrollTop restored).

## Checks (written before the build)

- **ws-lessons-passed** (`tests/scripts/ws-lessons-passed.mjs`, deploy gate in ws-deploy-gates.sh): every id is a live
  detailed lesson, library lesson or `skill:` lesson of a live skill; every id has an evidence line naming a lane, a critic
  round, a file that exists, and a date; no id whose `ws-lesson-coverage` status is `failed` or `stale`.
- **FILTER-PASSED**: with the toggle on, the rows shown (all grades, all areas) equal the registry ids that map to a row; for every
  grade x area the count equals the registry entries in it; the toggle survives grade and area changes.
- **LESSON-DOMAIN**: every lesson in exactly one area; the grade x area counts equal the counts from the data; every carried grade
  has a chip and no chip has zero lessons; every lesson whose step is Y-n shows under grade n-1 (R under PK).
- **LESSON-BROWSE**: thumbnails = list rows = the filtered set (ids and order); open then `← All lessons` restores grade, area,
  toggle, view and scrollTop (±2 px); load renders no preview outside the viewport (count of rendered previews <= visible + 1 row).
Each gets a backtest row (fails on today's tree, passes on the build).

## Files to change

New: `js/modules/lessons-passed.js`, `js/modules/grade-of.js`, `tests/scripts/ws-lessons-passed.mjs`,
`tests/scripts/ws-lessons-browse.mjs` (FILTER-PASSED, LESSON-DOMAIN, LESSON-BROWSE).
Changed: `js/modules/teacher-wrm.js` (grade chips generated, area chips + headings, status chip, summary, toggle, view toggle,
back link, header mark), `js/modules/wrm-links.js` (grade via grade-of.js; `lessonArea()`), `js/modules/teacher-library.js`
(generated grade pills, the toggle), `js/modules/teacher-chip.js` (lesson first-page crop), `css/teacher-wrm.css` and
`css/teacher-library.css` (additive only), `tests/scripts/ws-deploy-gates.sh`, `tests/scripts/ws-teacher-wrm*.mjs` (expected rows).

## Owner questions

- Q1. "The Skills screen's DOMAINS": the Skills screen groups by its 9 areas (Counting, Operations & algebra, Place value, ...),
  not data.js's 6 DOMAINS. Use the areas (designed here)?
- Q2. The six seeded lessons all changed after their pass (lesson 2 shipped with 4 gate findings). Mark them now, or only after a
  re-grade bound to a render stamp (then the registry ships EMPTY)?
- Q3. Grade by step year moves 13 rows out of the school grade they are taught in (e.g. a Y3 step in the grade-3 sequence shows
  under grade 2). Keep the rule, or use the school grade for site rows?
- Q4. Extra lessons (support, projects, assessments): own last section as today, or into areas?
- Q5. "To build" covers 93 of 142 grade-3 rows because partial rows still on the build list count. Count only "no skill"?
