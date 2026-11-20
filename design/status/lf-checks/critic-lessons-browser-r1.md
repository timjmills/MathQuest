# Critic: lessons browser, narrow round r1 (lane lf-checks), 2026-11-20

Independent narrow critic (Opus medium). It did not build this. Graded: branch `claude/sweet-newton-c8wrv1-lf-tools-lessons`
@ 8be97554a against the SIGNED card `design/cards/lessons-browser/lessons-browser.md`. Sections 0 and 0b govern. Screens:
1366, 1280, 1024 and 820. There is no 390 host.

**Verdict: FAIL** (C1 7, C2 8, C3 7, C4 7). Every criterion must be at least 8.

Task B (the stale seeded passes): **g4-nbt1-ten-times-value is re-stamped**, because its render change is class-only and its
pixels are identical. **g3-oa5-mult-properties and g3-oa9-mult-table-patterns move to PENDING_RECHECK**, because their pages
changed in ways a reader can see. `ws-lessons-passed: OK` (1 passed, 5 pending re-check).

## Gates run (on this tree, with the Task B registry change)

| Gate | Result |
|---|---|
| ws-boot-smoke | OK |
| ws-lessons-browse (default widths 1366,1024) | OK (LESSON-DOMAIN, AREA-LABELS, FILTER-PASSED, LESSON-BROWSE, SCREEN) |
| ws-lessons-passed | OK after Task B. Before Task B: FAIL (6), 6 stale stamps, as the brief said |
| ws-pacing | OK. The file is byte-equal to the `ws-pacing-seed.mjs` output, so no date is invented |
| ws-teacher-wrm | OK when run alone. The first run, made while 2 other browser jobs loaded the box, failed only on `requestfailed css/*.css net::ERR_ABORTED`: a load flake, not a finding |
| ws-teacher-library | OK |
| ws-teacher-tokens | OK (dark mode parked by the owner, 2026-10-23: DARK_PARKED) |
| ws-precritic-plan --checks-from-critics | OK (560 rows: 456 pass, 104 exempt, 0 fail) |
| ws-backtest, the 7 new rows | 7 PASS (lessons-browse-domain / -area-labels / -filter-passed / -browse, lessons-passed-registry, lessons-passed-stamp-stale, pacing-file) |
| ws-precritic --teacher --dry-run | Plans ws-lessons-browse, ws-lessons-passed and ws-pacing, so all three are on precritic's path |

**Mutation tests** were run in a scratch worktree. Each one turned its check red:
- A CCSS Build chip removed: LESSON-DOMAIN FAIL (135).
- `keepRow` also keeps pending rows: FILTER-PASSED FAIL (6).
- `restoreScroll` does not scroll: LESSON-BROWSE FAIL (2).
- One passed digest changed by one hex digit: LP-STAMP FAIL.
- A passed id that is not live: LP-LIVE FAIL.
- An evidence line with no date: LP-EVIDENCE FAIL.
- One id both passed and pending: LP-LIVE FAIL.
- A grade-3 overlap: ws-pacing FAIL.
- A unit dated outside the school year: ws-pacing FAIL.

**Own screenshots** (DSF 1, 768 tall) at 1366, 1280, 1024 and 820 for every view: list (top and summary), thumbnails, Only
8/10 (grade 4 with the pass, grade 3 empty), By unit / date, All grades, the opened passed lesson, the opened pending lesson,
and the Skills screen (area view, plus Only 8/10). They are in the critic's scratchpad, `tb/shots/`, which is not committed.
The measurements:
- No page scrolls sideways at any width.
- Tab gives a visible focus ring on every filter control.
- Escape closes an opened lesson at all 4 widths. It returns to the same hash and the same scrollY, with the lesson's row
  focused.
- The console is clean.

## Scores

### C1 Fidelity to the signed card and mock: 7

What matches:
- R1: one `AREA_LABELS` table, read by both screens.
- R2: the registry plus `PENDING_RECHECK`, a dotted "Pending re-check" chip, never ✓.
- R3: grade by school placement. Grade 4's g4 row sits under grade 4.
- R4: no Extra lessons section. CCSS Build is mixed into the areas.
- R5: the summary is split and its figures equal the card's grade-3 figures exactly. WRM: 136 · 47 built · 68 covers part ·
  21 to build. CCSS Build: 22 · 9 · 11 · 2.
- 0b colour:
  - Grade colours appear only as outlined swatches and a 4 px underline. No grade colour sits under text.
  - Area tint plus deep band, ✓ green, amber To build, dotted Pending.
- By unit / date matches the card. "Unit 2 · Number & Operations: Fractions · 1 Nov – 26 Nov · 35 lessons · Now" is
  outlined, open and in view. The other units are collapsed.
- The pacing file equals the seed.

Against this: defects 1, 2 and 7. Thumbnails are not to the card, and nothing records an owner waiver. The Skills switch is
shown but does nothing outside the area view.

### C2 Correctness of data: 8

- The browse rows, the area chips and the summary counts equal the data, both in the gate and in an independent node recount
  of all 7 grades.
- ✓ comes from `lessons-passed.js` only. After Task B the one ✓ row is 4:D2:52, and the switch shows exactly that row.
- The `#wrm/<g>?a=&only=&view=` link round-trips on a fresh load. "← All lessons" restores grade, area, switch, view and
  scrollY.

Defect 3 (the wording of the pending text) keeps this at 8.

### C3 Usability at 1366 / 1280 / 1024 / 820: 7

- No overflow. Keyboard and Escape work. Focus returns to the lesson's row.

Below 8 because of:
- Defect 4: the Skills screen controls this lane changed are 44 px tall at 820 and 1024, and so are the in-list "Skills to be
  made" toggles. Tablets need 48 px.
- Defect 5: a By unit / date link opened by Back, Forward or a pasted hash does not bring the Now unit into view.
- Defect 2: a switch that is pressed but does nothing.
- Defect 6: a clipped thumbnail preview.

### C4 Checks quality: 7

- Each check catches what it claims (the mutations above).
- The 7 backtest rows FAIL on the bad state and PASS on the fix.
- All three gates are on precritic's path, and the CHECKS_FROM_CRITICS rows (586-591) are present.

Gaps:
- SCREEN runs only at 1366 and 1024 by default, so 1280 and 820 are never gated.
- Its 48 px selector misses the controls of defect 4.
- The "list" round-trip case is really a second thumbnails case.
- The Skills grade-pill assertion is vacuous.
- Nothing checks the Skills switch outside the area view.

See defects 8-10.

## Deviations the builder declared

1. **Thumbnails** show the first teaching skill's item through lazy `mountCropped`, or a plain "To build" card. There is no
   first-page render and no IndexedDB cache.
   **DEFECT (minor).** For the ~1,000 rows with no detailed lesson, this is what the card asked for. For the rows joined to a
   detailed lesson, card §7 asks for the first page, cached by `lessonId|renderHash`. Nothing records an owner waiver. Either
   build it, or get the waiver written into the card.
2. **The Skills screen's Only 8/10 applies to the Maths area view only.**
   **DEFECT.** The switch row (`#tsOnly`) stays visible, and can be pressed, in the White Rose step and Standard views and
   while searching. It filters nothing there (defect 2).
3. **Dark mode not re-measured.**
   **ACCEPTABLE.** The owner parked dark mode on 2026-10-23. ws-teacher-tokens reports DARK_PARKED.

## Defects

1. **Thumbnail previews for detailed lessons are not the first page, and there is no `lessonId|renderHash` cache** (card §7).
   - Where: `js/modules/teacher-wrm.js:572-585` (`cardHTML`) and `:590-610` (`drawLessonThumb`, `lessonThumbs`).
   - Automatic check: LESSON-BROWSE asserts that a card whose row has `detailed.length` mounts the detailed lesson's page 1
     (`data-w-thumb-kind="detailed"`), and that a second draw is served from the cache (no `buildSheet` call).
2. **The Skills screen's "Only 8/10 ✓" is visible and pressable where it filters nothing.** That means the White Rose step and
   Standard views and search.
   - Where: `js/modules/teacher-library.js:815` (the row is never hidden) and `:846`. Compare `:847`, which hides only
     `#tsAreaRow`. The filter exists only at `:1008`.
   - Fix: hide `#tsOnly` when `G.browse !== 'area' || searching`, or apply `REDESIGN_PASSED` in every view.
   - Automatic check: FILTER-PASSED, for each `#tsBrowse` view and for a search: either `#tsOnly` has no client rects, or
     every `.ts-card[data-skill]` shown is in REDESIGN_PASSED.
3. **The pending wording is hard-coded and now wrong for 2 of the 5 pending lessons.**
   - The summary says "pending re-check after their fixes" (`teacher-wrm.js:474`).
   - The empty state says "Pending re-check after their fixes" (`:502`).
   - The opened lesson says "a new check found something to fix" (`:767`).
   - g3-oa5 and g3-oa9 are pending because their render changed, not because of a fix. The registry already holds the reason
     in `why`.
   - The empty state also lists every pending lesson in the registry, not only those of the grade on screen (`:500`).
   - Fix: say "Pending re-check" plus plain words generated from the entry's reason, and filter the list by the rows of
     `gradeRows()`.
   - Automatic check: FILTER-PASSED asserts that no pending text claims "fix" unless the entry's `why` says so, and that the
     empty state names only pending lessons whose rows are in the current grade or grades.
4. **Controls under 48 px at tablet widths (820, 1024).**
   - The Skills grade pills `#tsGrades .ts-pill` and the Skills view segment are 44 px tall. The pills were rebuilt by this
     lane (`teacher-library.js:848`; size from `css/teacher-library.css:317` `min-height: var(--control)`).
   - The Lessons list's "Skills to be made for this area (n) — show" toggles (`tmuWrapHTML`, `teacher-wrm.js:692`) are 44 px.
     They show even when n = 0, which is also clutter the mock does not have.
   - Opened lesson (not new in this lane, noted): "Next lesson", the tick boxes and the info buttons are 44.
   - Automatic check: SCREEN measures every `button` / `[role=button]` in the active screen at 820 and 1024 (not a hand list
     of selectors), and requires a height of at least 48.
5. **By unit / date reached by a hash change (Back, Forward, a pasted `#wrm/3?view=unit`) leaves the Now unit off screen.**
   - Where: `wrmOnHashChange` (`teacher-wrm.js:389-400`) calls `drawList()` with no `scrollToNow()`. Seen at 1366 and 1024:
     the screen stays at the top of the filters.
   - Automatic check: LESSON-BROWSE sets `location.hash = '#wrm/3?view=unit'` from the List view and asserts that the Now unit
     header is in the viewport.
6. **Thumbnail preview clipped.** The fixed `height: 150px; overflow: hidden` (`css/teacher-wrm.css:590`) cuts the
   "Multiples of 3" count-by item. The first box overlaps "3", and the bottom row "18" is cut off. My clip probe found 1-2
   clipped `.tvp-frame` at 1280 and 1024.
   - Automatic check: LESSON-BROWSE probes every drawn `.tvw-lthumb .tvp-frame`. The content's scrollHeight and scrollWidth
     must be no larger than the frame (or `mountCropped` must scale to fit).
7. **The opened lesson's header card repeats facts.**
   - The new chip row ("CCSS Build", "Full") sits directly above the old tag row ("CCSS · BUILD", "Fully taught").
   - The thumbnail card adds the Skills card's 6 px left band to the card's 4 px top band (0b says the top band only).
   - Cosmetic. Where: `teacher-wrm.js:765-767` and `css/teacher-wrm.css:589`.
   - Automatic check: a header-card probe that no coverage or CCSS word appears twice in `.tvw-head`.
8. **Check gap: widths.** ws-lessons-browse defaults to `--widths 1366,1024` (`tests/scripts/ws-lessons-browse.mjs:37`). The
   deploy gate and precritic run the default, so 1280 and 820 are never gated.
   - Fix: default to `1366,1280,1024,820`, or at least run SCREEN at all four.
9. **Check gap: the "list" round trip is a thumbnails round trip.**
   - At `ws-lessons-browse.mjs:224`, `['#wrm/3?a=OA', 'list']` does not reset the view. A link with no `view=` keeps the
     view, and the logged state shows `view: "thumbs"`.
   - Fix: use `#wrm/3?a=OA&view=list`, and assert `before.view === tag`.
10. **Check gap: vacuous Skills grade-pill assertion.**
    - `const lv = [...new Set(...map(() => 0))]` (`ws-lessons-browse.mjs:377`) is always truthy, so only "first ALL, last M"
      is tested.
    - Fix: assert the pills equal `['ALL', ...sortGrades(levels of skillCatalogue()), 'M']`.

Not a defect, but noted: ws-pacing cannot tell a hand-edited date from an invented one. That is by design, because the owner
edits the file. A `--seed-diff` report against `ws-pacing-seed.mjs` would show the edits for review.

## Task B: the 3 seeded passes (stale since master e7c418bd4)

**Method.**
- Among the baseline commits since d38308824, only e7c418bd4 changed these lessons' keys (118 keys). Each parent→commit
  baseline diff was checked.
- A detached worktree at d38308824 and this tree (HEAD) each rendered the 3 detailed lessons through
  `buildSheet({ role: 'detailed-lesson', seed, paper: 'A4', year: 2026 })` at seeds 4242 and 1. That is 162 `.ws-page`
  pages. Every page's sha1 equals its pin: the old tree against d38308824's lesson-baseline.json, HEAD against the current one
  (162 / 162).
- Each page was screenshotted in its own tree at DSF 1 and compared.

**g4-nbt1-ten-times-value: class-only. Re-stamped.**
- The 54 pages differ only by:
  - the class `mq-pagecap` added to 12 `ws-grid` elements. No CSS rule names it; `sheet/roles/practice.js:1295` adds it as a
    lint marker.
  - new engine `<style>` rules for classes these pages do not carry (`mq-tagout`, `mq-cheadgrid`, ...).
- All 54 page PNGs are byte-identical between the two trees.
- New stamp: `{ source: 'lesson-baseline', commit: 'e7c418bd4', digests: { 4242: 'bf2a28db905c2d3d', 1: '0105df71052471f4' } }`,
  with the evidence line naming this round.

**g3-oa5-mult-properties: visible change. Moved to PENDING_RECHECK.** 48 of 58 pages differ in pixels. Examples:
- The instruction "Count by the number in the box." became "Count by the number in the arrow."
- In the teacher's expected answers on p04, "6. 25" became "6. 10".
- Grid heights changed (46.9 → 54.87 mm, 99.29 → 81.76 mm).
- A dot array changed from a square array to "2 rows of 5 dots".

**g3-oa9-mult-table-patterns: visible change. Moved to PENDING_RECHECK.** 8 of 50 pages differ in pixels (p04, p05, p11 and p18
at both seeds). Examples:
- The same instruction change.
- The "3 rows of 2 dots" and "2 rows of 3 dots" arrays are swapped.

These are not class-only changes. A narrow critic must grade the new render, and they can only be re-stamped after that.
`js/modules/lessons-passed.js` keeps their earlier re-check evidence, and the `why` field names this file.

Result: `ws-lessons-passed: OK` (1 passed, 5 pending re-check). ws-lessons-browse is OK with this registry.

## Proposed checks (summary for the ledger)

D2 → FILTER-PASSED-SKILLS-VIEWS · D3 → PENDING-WORDS · D4/D8 → SCREEN-ALL-CONTROLS-ALL-WIDTHS · D5 → UNIT-NOW-ON-HASH ·
D6 → THUMB-NO-CLIP · D9 → ROUNDTRIP-VIEW-ASSERT · D10 → SKILLS-GRADE-PILLS-EXACT · D1 → THUMB-DETAILED-FIRST-PAGE.
