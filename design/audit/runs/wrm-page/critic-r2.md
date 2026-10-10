# WRM page lane: independent critic, round 2 (2026-10-10)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-page` at `d2455a5c`. This was a read-only critique, and I made no change to the lane's code.
I did the real teacher tasks at 1366x768 and 1280x720 (touch and mouse) and then at phone size (390x844), in both modes:
- **fallback**: `links/index.json` empty.
- **curated**: the newer tagger files R…Y6 and `MAP.json` from `scratchpad/wrm-page-critic-r1/curated`, served through request interception.

The rubric is `design/audit/RUBRIC.md` C1–C4, adapted to teacher screens: C1 ease, C2 value, C3 layout, C4 fidelity. C4 covers the teacher design system and the school's own words.

## Verdict: FAIL (round 2), narrowly

All five r1 blocking defects are fixed in the browser. Every Chromebook-size screen now scores 8 or more on C1 to C3.
Two things keep the lane below the bar:

- **B6 (new, blocking, a regression from the B5 fix).** At phone width the new "Grade 2 · D1 · … Change grade or
  unit" button does not wrap. The White Rose lesson page becomes 622 px wide on a 390 px screen, so it scrolls
  sideways by 232 px.
- **M1 (still open).** About 400 of 5,443 curated "why" and "missing" lines (7 %) still show tagging-lane jargon to teachers,
  including raw JSON: `[rule 18: opts {"notation":["across"]} for this pupil]`, `Y5/Gr.4 …`, `wk W11`, `add_5_pictures`.
  This holds curated C4 at 7.

Both fixes are small (see the fix list). Everything else passes.

## Scores

Unless a row says phone, scores are at 1366x768 and 1280x720.

| Screen | C1 Ease | C2 Value | C3 Layout | C4 Fidelity | Pass |
|---|---|---|---|---|---|
| White Rose lessons (fallback) | 9 | 8 | 8 | 8 | yes |
| White Rose lessons (curated) | 9 | 9 | 8 | **7** (M1 residue) | no |
| White Rose lessons, phone 390 | 7 | 8 | **5** (B6 sideways scroll; toast on the link box) | 8 | no |
| Skills to be made | 8 | 8 | 8 (phone: 24 px sideways, m2) | 8 | yes at Chromebook |
| MAP · Practise by task | 8 | 8 | 8 | 8 | yes |
| MAP · By representation | 8 | 8 | 8 | 8 | yes |
| MAP · Start a MAP test (unchanged pupil path) | 8 | 8 | 8 | 8 | yes |

## The r1 defects, verified in the browser

| r1 | Status | Evidence |
|---|---|---|
| **B1** wrong steps | **Fixed** | I spot-checked 27 lessons in the browser (`#wrm/<g>/<u>/<n>`, title plus the Drive id of the *Open lesson* href against the step's `drive.lesson`): **27/27 correct**. They were Pre-K CC2/CC4/CC6 "1 more / 1 less" → R.B3.S4 / R.B7.S5 / R.B11.S6; MD1 "Compare mass" → R.B8.S1; G1 → R.B2.S2; G3 "Shapes in the environment" → R.B6.S3; G5 → R.B15.S8; Grade 4 "Multiply a 2-digit number by a 2-digit number" → **Y5.B5.S3**; "Equivalent fractions and decimals" → **Y5.B7.S4**; the Grade 1 money lessons (D1 29, D2 12, D2 13, E 26, E 27) and Grade 3 D4 20 → nearest money step with an **ADAPT: US money** tag; plus 13 others across K–5. In the data, a full sweep of all 945 lessons finds that every lesson whose title differs from its step title differs only by "2D/2-D", the "(US: dollars & cents)" suffix or "am/a.m.", or is one of the 5 ADAPT lessons. MAPPING_REPORT lists the 13 cross-year and 5 ADAPT mappings (18) and the 2 nearest-block Kindergarten titles, as the owner ruled. `ws-wrm-sequence.py --check` passes **without `--preview`** (N6 fixed). |
| **B2** curated opts dropped | **Fixed** | Grade 2 · D1 · "Partition numbers to 100", curated, Tick Do-first → link decodes 7 skills; every non-default option survives (`unit_form/combine/identify/value {band:99}`). The three that decode `{}` (`base10_build {band:99}`, `place_on_number_line {span:10,band:100}`, `tens_foundation_visual {band:90}`) carry their schema defaults, which the codec leaves out. That is equivalent, not a loss. The Print screen shows "Numbers to: 99" on those skills (`r2-03-print-opts-1366.png`). Direct, related and Everything (9) links keep their opts too. |
| **B3** MAP reps stale | **Fixed** | For all 7 strands, in turn and in both modes, every group's ticks equal `REP_PAIRS[*].strands[strand].skills` (live), and the count chip and caption agree (`r2-10-map-reps-1366.png`). |
| **B4** `[object Object]` | **Fixed** | No `[object`, `undefined` or `NaN` on any screen. The Skills to be made HTML (curated: 410 entries) and its print popup (410 entries) contain 0. "Count in Fractions" now reads "Grade 2: Fractions on a number line — (prerequisite of this step)" (`r2-08-todo-spec-1366.png`). |
| **B5** skills under the fold | **Fixed** at Chromebook sizes | Bookmark open at 1366x768: first skill row 462–516, bar 698. After a row click at 1280x720: first row 482–550, bar 650. No Tick button touches the bar, and real clicks on all four Tick buttons land at both sizes. The finder folds to one line. **But see B6 at phone width.** |
| M1 plain words | **Partly fixed** | Most lines now read "Grade 2: Represent numbers to 100 — the step before". About 400 of 5,443 curated lines (7 %) still show jargon; 5 of them appeared in 8 lessons I opened. See M1 below. |
| M2 toast on link | **Fixed** at 1366/1280 (toast 617–656, link 713–757) | At phone width the toast still covers the link note, because the bar is 148 px tall there and the toast is placed at a fixed `bottom:112px` (`r2-12-phone-toast-on-link-390.png`). |
| M3 "copied" | **Fixed** | The note says "· copied" only after the copy works. The code path is checked. |
| M4 MAP URL state | **Fixed** | `#map/tasks/fd/191-200/e49` reopens the same task from a bookmark. Back from task 2 goes to task 1, and Back again goes to the band list `#map/tasks/fd/191-200`. Reps view: `#map/reps/<strand>`. |
| M5 load size | **Fixed** | Bookmark `#wrm/2/D1/2` fetches only `index` and `Y3` (668 ms to the lesson with 4x CPU throttling, including app boot). |
| M6 week words | **Fixed** | "Week 1 (6–10 Sep) · All strands", "Standard + Priority". |
| N1 CSS stamp | **Fixed** | `teacher-wrm.css?v=…`. The import map is stale against the tree (`ws-stamp-assets --check` FAIL), as on every lane branch. The lead stamps it before deploy. |
| N2 copied-in button | **Fixed** | "Open lesson (Grade N files)". |
| N3 matched code | **Fixed** | The hit shows the code that matched. |
| N6 | **Fixed** | See B1. |

## Teacher tasks (all at 1366 and 1280, both modes)

- **Find by grade or domain:** the "Change grade or unit" button reopens the chips. Grade 4 lists D1–D5 plus Enrichment. Back
  returns to `#wrm/2/D1/3` and then to `#wrm/2/D1`.
- **Find by search:** "partition numbers", "number bonds", "pictogram" and "Count money" all find the lesson, and Enter jumps
  to the first hit.
- **Find by week:** there is no way to jump to a week. Each row shows "Week 1 (6–10 Sep)", but typing "week 5" finds nothing (m3).
- **List and Thumbnails:** the toggle works and keeps the ticks. At 1280 the thumbnails are 2 per row. A thumbnail ticks its skill.
- **Do-first only / direct only / related only / Everything / single skill:** each makes the right link. In fallback the counts
  are 8 / 2 / 6 / 16 and in curated 7 / 1 / 1 / 9. The single-skill "Practice" and "Print" buttons give one-skill links and a
  one-skill Print section. Print opens "Print worksheets" with the ticked skills as one More Practice section, and Back
  returns to the lesson.
- **Pupil:** a fresh browser context opens the link and lands on the unchanged pupil landing. "Start practice" starts
  play. There are no console errors.
- **Console:** clean in every run (`problems: []`).
- **Fit:** no sideways scroll and no target under 44 px on any of the three screens at 1366 or 1280.

## Gates (critic's own runs, one at a time)

| Gate | Result |
|---|---|
| ws-teacher-wrm (fallback) | OK |
| ws-teacher-wrm --curated (newer R…Y6 + MAP.json) | OK |
| ws-wrm-page-unit | OK (945 lessons, 897 mapped) |
| ws-wrm-sequence.py --check (no `--preview`) | OK |
| ws-boot-smoke, ws-teacher-shell, ws-teacher-library, ws-teacher-preview, ws-share-options, ws-chromebook-fit | all OK |
| ws-search-terms | OK (592 skills, 232/232 queries) |
| ws-code-snapshot.mjs | OK (608 codes, 35 categories, nothing moved, 1870 option round trips) |
| ws-codec-registry.mjs | OK |
| Throwaway merge into `origin/claude/sweet-newton-c8wrv1` (25d7e059) | **clean** (auto-merged `design/STATUS.md`, `index.html`). In the merged tree, ws-wrm-page-unit and ws-wrm-sequence --check pass. The merge was not pushed, and its worktree is removed. |

## Blocking defect

**B6 · At phone width the White Rose lesson page scrolls sideways by 232 px (C3 → 5). This is a regression from the B5 fix.**
The compact finder's `button.tvw-crumb` ("Grade 2 · D1 · Number & Operations in Base Ten  Change grade or unit") keeps
the `.tv-btn` no-wrap layout, so it is 622 px wide at 390x844. `document.scrollWidth` is 622, and the action bar's Print
button is cut at the right edge (`r2-11-phone-sideways-scroll-390.png`). The unit view (`#wrm/2/D1`) is fine, because the
crumb only appears once a lesson is open.

Fix: in `css/teacher-wrm.css`:

```css
.tvw-crumb { white-space: normal; flex-wrap: wrap; max-width: 100%; min-width: 0; text-align: left; height: auto; }
.tvw-crumb-t, .tvw-crumb-c { min-width: 0; overflow-wrap: anywhere; }
```

Also check that `.tvw-find.is-compact` lets the crumb take a full line below about 600 px wide.

Check: add a 390x844 pass to `ws-teacher-wrm` that opens `#wrm/2/D1/2`, `#map/tasks/fd/191-200/<task>` and the Skills to be
made screen, and asserts `scrollWidth <= innerWidth`.

## Major / minor defects

**M1 (still open; C4 7 on curated).** `plainWhy()` covers the tagging shorthand it was written for, but the newer curated
files use other forms. Over all of R…Y6, 403 lines still show jargon after `plainWhy` (lines with "week W.." counted
separately):

| Jargon | Lines |
|---|---|
| "Y5/Gr.4 Round within 100,000 — support block" (year/grade pair) | 111 |
| "(taught earlier this year, wk W03)" / "(step before in the block, wk W11)" | 110 |
| "(taught the same school week, W13)" | 56 |
| raw skill ids ("add_5_pictures stops at 5; add_wp_10 is a word-work cell", "mult_three") | 34 |
| `[rule 18: opts {"notation":["across"]} for this pupil]` / `[rule 18: shade_fraction deals content above …]` | 43 |
| raw JSON elsewhere | 32 |
| "(Y5.B13)" block ids, "Pre-K: / R.B10 compare by size" | 6+ |

There are also 204 lines like "(school prior learning, week W23)". These are readable but should say "week 23".

Fix, in `wrm-links.js` `plainWhy()`:
1. Drop any `[rule N: …]` bracket. It is a note for the tagger, not for the teacher.
2. Turn `Y\d/Gr\.\d` and `(R|Y\d)\.B\d+(\.S\d+)?` into "Grade N".
3. Turn `wk W0?(\d+)`, `week W0?(\d+)` and `school week, W0?(\d+)` into "week N".
4. Replace a snake_case id through `findSkill` with the skill's label, or drop the parenthesis.
5. Remove `{…}` JSON.

Then add a gate check in `ws-wrm-page-unit`: run `plainWhy` over every `pre/related.why`, `partial.missing`, `missing` and `closes`
line in the curated files (`--curated <dir>`) and fail on
`/\b(R|Y\d)\.B\d|\bY[1-6]\b|\bW\d\d\b|\{|\[rule|[a-z]+_[a-z0-9_]+/`.

Check: 0 lines match.

**m1 (phone).** The toast covers the practice-link note when the action bar wraps to two rows (148 px tall at 390 wide). Place the
toast from the bar's measured height (for example, set a `--tv-bar-h` custom property in `redrawBar()`) rather than a fixed `bottom:112px`.

**m2 (phone).** On the Skills to be made screen, the row badges (`.tvt-badges`) overflow by 24 px at 390 px wide. Let the
badges wrap under the name below about 480 px.

**m3 (C1).** There is no way to find "this week's lesson". Teachers plan by week (the pacing guide). Fix: make the search match
"week 5" / "w05" against `l.weeks`, and in the unit header add a "This week" chip that jumps to the lesson whose `weekOf` contains
today.

## Nits

- N7: when nothing is ticked, the bar still shows the last link (for example, after Clear). Clear `p.link` when the tick set changes.
- N8: a "3.NF.A.1" search lists the Grade 1 workbook copies first. Rank hits from the code's own grade (3 → Grade 3) first.
- N9: Skills to be made shows "Grade 2: Fractions on a number line — (prerequisite of this step)". Drop the dash before a
  parenthesis in `closesText`.
- N10: MAP task labels are "Ready (being checked)" and "… (option)". To a teacher, write "Ready — being checked by the team"
  and "(new option on an existing skill)".
- N11: switching to Thumbnails at 1280x720 leaves no thumbnail in the first viewport, because the cards start at about 625 px.
  This is fine, but scrolling the first group into view on the toggle would show the change.

## Fix list (to pass round 3)

1. B6: let the crumb wrap (CSS above), and add the 390 px no-sideways-scroll check to `ws-teacher-wrm`.
2. M1: extend `plainWhy` with the five patterns above, and add the jargon regex gate over the curated files.
3. m1, m2: toast offset from the bar height; let the todo badges wrap at narrow widths.
4. Optional this round: m3 (find by week) and N7–N11.

## Screenshots (this folder)

`r2-01-lesson-open-1366.png` (bookmark, first skill row above the bar) · `r2-02-prereq-link-1366.png` ·
`r2-03-print-opts-1366.png` (curated options on the Print screen) · `r2-04-grade1-money-1366.png` (ADAPT: US money) ·
`r2-05-prek-1366.png` · `r2-06-lesson-after-click-1280.png` · `r2-07-thumbs-toggle-1280.png` ·
`r2-08-todo-spec-1366.png` (B4 fixed) · `r2-09-map-task-1366.png` · `r2-10-map-reps-1366.png` (B3 fixed) ·
`r2-11-phone-sideways-scroll-390.png` (B6) · `r2-12-phone-toast-on-link-390.png` (m1).

The critic scratch folder is `scratchpad/wrm-page-critic-r2/`. It holds `probe2.cjs` (the full teacher-task probe), `b1keys.json`, `b1.py` (the full
title-to-step sweep), `m1.mjs` (the jargon sweep), the logs `out/p-cur-1366.out`, `out/p-fb-1280.out`, and the phone probes.
