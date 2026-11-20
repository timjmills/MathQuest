# Design card: Lessons browser (lessons-passed registry, status chips, grade / area / 8/10 filters, Thumbnails | List)

Status: **SIGNED** (owner, 2026-11-20, via the lead) (owner approved the mock 2026-11-20 with two additions, section 0b). Sections 0 and 0b govern; they override anything below that disagrees. Designer: Opus medium, 2026-11-19, branch claude/sweet-newton-c8wrv1-lf-tools-lessons.
Requests: owner via the lead, 2026-11-14 to 11-19 (items 1-7 below). Mock: `design/status/lf-checks/lessons-browser/mock.html`
(the app's teacher CSS, real lesson rows from `wrm-links.js` + `data/curriculum/links/<Y>.json`), screenshots beside it at
1366 x 768 and 1024 x 768, DSF 2: `a-list` (colour), `b-thumbs` (colour), `c-only`, `d-skills`, `e-open`, `f-unit` (By unit / date,
current unit highlighted) (`-1366.png`, `-1024.png`).
No 390 px host (FASTEST_PLAN rule 7).

## 0. Owner rulings (2026-11-19, via the lead) — these govern

**R1 Areas, one label table.** Both screens keep the 9 areas of `teacher-areas.js`; each chip and heading is labelled from ONE
table, `AREA_LABELS`, a new export of **`js/modules/teacher-areas.js`** (beside `AREAS`, read by teacher-library.js AND
teacher-wrm.js; no other copy):

| Area | Label |
|---|---|
| CC | Counting & Cardinality |
| OA | Operations & Algebraic Thinking |
| NBT | Number & Operations in Base Ten |
| NF | Number & Operations—Fractions (decimals live here) |
| MEAS | Measurement (Measurement & Data) |
| DATA | Data (Measurement & Data) |
| G | Geometry |
| RPNS | Ratios & Proportional Relationships / The Number System (grade 6) |
| MIXED | Mixed (several domains) |
| WORDS | Words (maths vocabulary) |
| NOSTD | No CCSS domain (proposed; the ruling did not name it — 1 grade-3 lesson) |

**R2 Passed marks: "pending re-check".** The 6 lessons of §1 are NOT marked. `lessons-passed.js` ships with
`LESSONS_PASSED` EMPTY and a separate `PENDING_RECHECK` list (the 6 ids, each with its old evidence line). Pending shows as a
dotted "Pending re-check" chip on the row / card / header, never ✓ and never the corner. A lesson moves to `LESSONS_PASSED`
only when a NARROW critic passes it again, and its entry then carries `renderStamp` (the `ws-lesson-hash` stamp of the render the
critic graded); a later render change makes it stale (ws-lessons-passed fails until re-graded). "Only 8/10 ✓ (0)" shows an
empty state naming the pending lessons (mock `c-only`).

**R3 Grade: the school's placement wins.** A row's grade = the school grade it is listed in (`WRM_SEQUENCE` grade id).
UK Year − 1 (`grade-of.js usGradeOfYear`) applies ONLY to a lesson the school places nowhere (a `skill:` lesson: data.js
`SKILL_GRADES`; a library step lesson with no site row: its step year − 1). This replaces §5's step-year rule; the 13 moved rows
of §5 stay in their school grade. Q3 is closed.

**R4 Extra lessons are mixed in.** No "Extra lessons" section: every non-WRM row (lesson `type !== 'wr'`: the CCSS BUILD rows and
the school-site support / project / enrichment lessons) sits under its area with a "CCSS Build" chip. Assessments stay out of
the list (no skills). Q4 is closed.

**R5 Counts, split.** The summary shows WRM and CCSS Build separately:
"WRM: 136 lessons · 0 ✓ · 47 built · 68 covers part · 21 to build | CCSS Build: 22 lessons · 0 ✓ · 9 built · 11 covers part · 2 to build"
(REAL grade 3, school placement, assessments excluded; 3 of the 9 CCSS Build "built" are pending re-check). Chips: exactly one
coverage chip per row: `Full` / `Covers part` (its own chip) / `To build` (NO skill: `linksFor(l).direct` empty — the build-list
clause of §3 is dropped). Q5 is closed.

**R6 Build order (owner).** WRM lessons and their associated skills first, then the others (CCSS Build, site extras). Where the
order lives and what to change (NOT changed here; for the lead):
- `js/modules/build-list.js` `LANES` (line ~74) and the entry ordering that `design/BUILD_LIST.md` prints: sort entries within each
  non-frozen lane so an entry whose `wrmSteps` / `lessonsBlocked` names a WRM step lesson (type `wr`) comes before one that
  serves only CCSS BUILD or site lessons (a stable key `wrmFirst`), then the existing order.
- `FROZEN_LANES = ['k2', 'operations']` (line 812) keep their order by rule; their NEW entries are appended — appended WRM-serving
  entries still go after the frozen ones. Changing that needs the owner to unfreeze or to accept "WRM first among appended".
- The lesson-needs entries (`source: 'lesson'`, appended last, ~line 1157) get the same `wrmFirst` key.
- `design/lessons-first/QUEUE.md` / `queue.json` rounds: list WRM units' skills before CCSS BUILD skills in each round.
- Regenerate `design/BUILD_LIST.md` (`ws-standards.cjs --report`) after the change.

**Checks amended.** LESSON-DOMAIN: every row in exactly one area; grade x area counts equal the data; every carried grade has
a chip; **every row shows under the school grade it is listed in, and only a row with no school placement uses Year − 1**; no
"Extra lessons" section exists and every `type !== 'wr'` row carries the CCSS Build chip. ws-lessons-passed: `LESSONS_PASSED`
entries need a `renderStamp` equal to the current `render-stamps.json` value; `PENDING_RECHECK` ids are live and never marked.
FILTER-PASSED also covers the empty state. New **AREA-LABELS**: both screens render every area chip from `AREA_LABELS`
(no area label string elsewhere in teacher-*.js).

## 0b. Owner additions (2026-11-20): colour, By unit / date, and the re-check result

**Re-check result (design/status/lf-checks/critic-lessons-recheck.md, 2026-11-20).** The narrow re-check passed 3 lessons with
render stamps at d38308824: g3-oa5-mult-properties, g3-oa9-mult-table-patterns, g4-nbt1-ten-times-value. They are the seed of
`LESSONS_PASSED` (evidence line = that file + the stamp digests it lists). g2-nbt3, g3-oa9-input-output-rule and g1-oa1 failed
on gates and stay in `PENDING_RECHECK` ("Pending re-check" chip) until they pass after their fixes. The mock shows this state.

### Colour (existing colours only; text stays black on white or on a pale tint)

| Element | Colour source | Treatment |
|---|---|---|
| Area heading | `AREAS[a].css` -> `--<css>-deep` / `--<css>-tint` (css/teacher-tokens.css) | 6 px left band in deep, tint background, ink text |
| Area chip | same | deep dot; when chosen, tint fill + 2 px deep border |
| Lesson row / card | same | deep dot before the title; 4 px deep top band on a thumbnail card |
| Grade chip, grade badge | data.js `GRADE_COLORS[g].bg` | a swatch outlined 1 px ink; when chosen, a 4 px underline in the grade colour + 2 px ink border. Never a grade-colour fill under text |
| ✓ 8/10 chip | `#E3F4E8` fill, `#1D6B37` border and ✓ (the Lessons screen's existing `.is-full` pair) | ink text |
| To build chip | `#FFF1D6` fill, `#9A5B00` border (amber) | ink text |
| CCSS Build chip | white, 1.5 px ink outline, bold | ink text |
| Pending re-check | white, 1.5 px dotted ink outline | ink text |

**Contrast (WCAG 2.x, measured 2026-11-20).** Text: ink #111 on white 18.9:1; on every area tint 15.4-17.0:1; on the ✓ chip
16.5:1; on the To build chip 16.9:1: all AA (4.5) and AAA. Non-text (3:1, 1.4.11): area deep colours on white 8.3-8.8:1; ✓ border
6.5:1; amber border 5.4:1. Grade colours on white are 1.4-4.8:1 (yellow grade 3 1.4), so a grade colour never carries text or
stands alone: each swatch has an ink outline (18.9:1) and the grade is always written. Ink on a grade-colour fill would fail at
grade 6 (3.9:1), which is why no grade chip is filled. Dark mode: the teacher tokens' existing dark pairs; re-measure in the build.

### Third view: "By unit / date"

- View toggle: Thumbnails | List | By unit / date. Lessons are grouped by the school's units, each a header
  "Unit 2 · Number & Operations: Fractions · 1 Nov – 26 Nov · 35 lessons" with the unit's area band; rows as in List.
- Unit order and names: **`data/curriculum/wrm-sequence.json`** `grades[].units[]` (id, name, domain, `weeks` "W07–W11", lessons
  in the site's order); week dates come from `grades[].weeks[W].weekOf`. The site lists units D1..D5; the TEACHING order is by
  start week (grade 3: D1, D3, D2, D4, D5), and the view uses the teaching order.
- Current unit: the unit whose start ≤ today ≤ end; between units (a break), the last unit that has
  started (grade 3 on 20 Nov 2026: Unit 2, Fractions). It gets an ink border, tint fill and a "Now" tag, opens expanded, and is
  scrolled into view on open; the other units start collapsed to their header (a click opens one).
- Filters (grade, area, Only 8/10 ✓) apply inside units; a unit with no matching lesson is hidden.
- Dates live in ONE file per school year, **`data/curriculum/pacing/<YYYY-YY>.json`** (2026-27 first), chosen by today's date
  (Aug–Jul year). No file for the year: the units show in the site's order, no dates, no "Now".

Schema:
```json
{
  "schoolYear": "2026-27",
  "source": "Awsaj Domain Sequence workbook 2026-27 (weeks); edited by hand each year",
  "grades": {
    "3": [
      { "unit": "D1", "start": "2026-09-06", "end": "2026-10-22" },
      { "unit": "D3", "start": "2026-11-01", "end": "2026-11-26" },
      { "unit": "D2", "start": "2026-11-29", "end": "2027-01-28" },
      { "unit": "D4", "start": "2027-01-31", "end": "2027-03-25" },
      { "unit": "D5", "start": "2027-03-28", "end": "2027-04-15" }
    ]
  }
}
```
Dates are ISO, inclusive, local school days. The file lists each grade's units in teaching order. A one-off seed script
(`tests/scripts/ws-pacing-seed.mjs`) derives it from `weeks[].weekOf`. Where the workbook gives two units the same boundary week
(grade 3: W07 ends D1 and starts D3; W11 ends D3 and starts D2), the seed gives the week to the earlier unit and starts the next
unit the following week. The teacher can edit the file to split a week by day. The grade 3 rows above are that seed.

**PACING-FILE** (`tests/scripts/ws-pacing.mjs`; on precritic's path for this lane, and a deploy gate): every file in
data/curriculum/pacing/ parses. `schoolYear` matches the file name. Every grade is a WRM_SEQUENCE grade, and every unit id exists
in that grade. Each grade lists every unit of the grade exactly once. start ≤ end. No two units of a grade overlap by a day. The
order of units in the file equals their order by start week in wrm-sequence.json (the school's teaching order). Every date falls
inside the school year (Aug–Jul). LESSON-BROWSE adds: in By unit / date, the rows under a unit equal that unit's filtered
lessons, the "Now" unit is the one the dates choose for a pinned test date, and it is in the viewport after open.

Files added by 0b: `data/curriculum/pacing/2026-27.json`, `tests/scripts/ws-pacing.mjs`, `tests/scripts/ws-pacing-seed.mjs`; colour
rules additive in css/teacher-wrm.css and css/teacher-library.css (existing tokens only).

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

## Pacing seed (lead, 2026-11-20)
Seed data/curriculum/pacing/2026-27.json from the school site / wrm-sequence.json weeks where they carry dates; units without a date stay undated. The owner checks and updates the dates each year.

Signed: owner, 2026-11-20
