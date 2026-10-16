# WRM page lane: independent critic, round 3 (2026-10-16)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-page` at `3fe16bb` (round-3 fixes `48ede94`, merged with the latest base). This was a
read-only critique, and I made no change to the lane's code. I did the teacher tasks, with every action on the White Rose page,
Skills to be made and MAP (Practise by task, By representation, Start a MAP test), at 1366x768, 1280x720 (mouse), 820x1180
and 390x844 (touch). One browser ran at a time.

**Data modes.**
- **fallback**: the tree's `links/index.json` is empty.
- **curated**: the tagging lanes' R…Y6 / MAP.json files are not on this machine (the container was rebuilt), and r2's
  `scratchpad/wrm-page-critic-r1/curated` is gone too. So I tested the curated path with a synthetic `Y3.json` that
  carries, word for word, the jargon forms r2 listed in its M1 table, served through request interception as r2 did.
  MAP.json mode was not testable.

The rubric is `design/audit/RUBRIC.md` C1–C4, adapted to teacher screens as in r1/r2: C1 ease, C2 value, C3 layout, C4 fidelity
(the teacher design system and the school's own words).

## Verdict: FAIL (round 3)

Most of r2's list is fixed in the browser: B6, m2, m3 and N7–N11. Every Chromebook-size screen on fallback data scores 8 or
more. Three things keep the lane below the bar:

- **M1 is still open.** The exact example r2 quoted, `[rule 18: opts {"notation":["across"]} for this pupil]`, now shows
  teachers `… (see Grade 4)} for this pupil]`. The rule-bracket regex stops at the first `]`, inside the JSON. The new jargon gate
  passes anyway, because its regex does not look for `}` or `]`.
- **B7 (new, phone).** At 390 px each skill row's name column is 30 px wide. Names and why-lines wrap one word per line, so
  rows are about 250 px tall. The per-skill Practice and Print buttons shrink to 38x44. The bar's Print button runs 8 px past the bar.
- **M2 (m1 residue, tablet).** The toast sits a fixed bar-height above the bottom of the window. On a short page the sticky
  bar is not at the bottom, so the toast covers the new link box and its Copy button. I saw this on a MAP task at 820x1180.

## Scores

| Screen | Viewport | C1 Ease | C2 Value | C3 Layout | C4 Fidelity | Pass |
|---|---|---|---|---|---|---|
| White Rose lessons (fallback) | 1366, 1280 | 9 | 8 | 8 | 8 | yes |
| White Rose lessons (curated, r2 forms) | 1366 | 9 | 9 | 8 | **7** (M1: `} for this pupil]`) | no |
| White Rose lessons | 820 touch | 9 | 8 | 8 | 8 | yes |
| White Rose lessons | 390 touch | 7 | 8 | **6** (B7) | 8 | no |
| Skills to be made | 1366, 1280, 820 | 8 | 8 | 8 | 8 (m7) | yes |
| Skills to be made | 390 touch | 8 | 8 | 8 (m2 fixed) | 8 | yes |
| MAP · Practise by task | 1366, 1280 | 8 | 8 | 8 | 8 | yes |
| MAP · Practise by task | 820 touch | 8 | 8 | **7** (M2: toast on link + Copy) | 8 | no |
| MAP · Practise by task | 390 touch | 7 | 8 | **6** (same rows as B7) | 8 | no |
| MAP · By representation | all | 8 | 8 | 8 (390: 6, B7) | 8 | yes at 820 and up |
| MAP · Start a MAP test (unchanged pupil path) | all | 8 | 8 | 8 | 8 | yes |

## The r2 defects, verified in the browser

| r2 | Status | Evidence |
|---|---|---|
| **B6** phone sideways scroll | **Fixed** | `scrollWidth - innerWidth = 0` on every screen and state at 390 touch: lesson, link, thumbnails, Print, the 5 bookmark lessons, Skills to be made (opened), the MAP task, thumbnails, reps and Start. The breadcrumb wraps onto 2 lines (`r3-03-phone-lesson-no-sideways-390.png`). `ws-teacher-wrm` now asserts this at 390. **But see B7.** |
| **M1** jargon in why/missing lines | **Partly fixed** | Year/grade codes, week codes, `{…}` and skill ids now read plainly (skill ids become labels in the browser: "Add Within 5 with Pictures (Visual) stops at 5"). Still left: (1) `[rule 18: opts {"notation":["across"]} for this pupil]` becomes "Not yet: part-whole model (see Grade 4)} for this pupil]" in the lesson head, a pre-skill why line and the Skills to be made "Gap it fills" (`r3-02-curated-why-residue-1366.png`); (2) "Pre-K: / R.B10 compare by size" becomes "Pre-K: / Pre-K compare by size"; (3) "Y1/Gr.K" becomes "Kindergarten/Gr.K". The gate `ws-wrm-page-unit --curated <synthetic>` reports **OK** on a file that holds (1). |
| m1 toast covers the link (phone) | **Fixed at 390, 1280, 1366; open at 820** | At 390 the toast is at 614–672 and the bar top at 696 (`r3-05`). At 820x1180 on `#map/tasks/npv/all/e1`, after Everything and Practice link, the bar sits at 997–1081 (the page is shorter than the window). The toast at 1033–1072 covers the link input (1026–1070) and Copy (`r3-06-map-toast-on-link-820.png`). See M2. |
| m2 todo badges at phone | **Fixed** | The badges wrap under the name. Sideways scroll 0 (`r3-08-todo-phone-390.png`). |
| m3 find by week | **Fixed** | "week 5" and "w05" list the Grade 2 lessons first, and Enter opens `#wrm/2/D1/14` "Add and subtract 100s" (`r3-11`). "This week: Week 7" on 16 Oct (a Friday, so it shows the next school week, 18–22 Oct) opens the Week 7 lesson of the grade on screen (checked against `weekInfo`). |
| N7 stale link | **Fixed** | After Clear, and after unticking the last skill, the bar returns to "Tick the skills you want", with no link box. |
| N8 code rank | **Fixed** | "3.NF.A.1" lists Grade 3 D2 lessons first. |
| N9 dash before a bracket | **Fixed** | 0 occurrences of "— (" in the build queue (275 entries) or on screen. |
| N10 MAP / build labels | **Fixed** | "Ready — being checked by the team" is in `STATUS`. Entries read "(new option on an existing skill)". |
| N11 thumbnails in view | **Fixed** | The toggle scrolls the cards in: 5 visible at 1366, 4 at 1280 (2 per row, `r3-10`), 8 at 820. |

## Owner answers of 2026-10-10 (STATUS line 25, "White Rose page rulings")

| Ruling | Status |
|---|---|
| MAP page opens on "Practise by task" | **Yes on a first visit** (`#map/tasks/npv/all`, `r3-07`). **But** the tab is remembered: after one visit to "Start a MAP test", MAP reopens on the test tab, even after a fresh page load (m5). |
| Old start links open the test tab | **Yes.** `openMapTest('k2')` lands on "Start a MAP test", and its Start button is there. |
| "Skills to be made" has no sidebar entry; linked from White Rose, MAP and Home | **Yes.** The sidebar has Home, Send a skill set, Print, Run, Skills library, White Rose, Quizzes, MAP, Progress and Settings. The header button is on all three screens, and each opens the list. A lesson's "To be built" chip opens the list at its entry (curated). |
| "Other (drawing / repair)" stays on the list behind a filter | **Yes.** The 25 entries stay in the list. The Kind chip "Other (drawing, fix)" shows only them ("Showing 25 of 275"). |
| Grade 6+ and "Grade not set" show at the end | **Yes.** Groups run Pre-K 18 · K 30 · Gr 1 28 · Gr 2 32 · Gr 3 38 · Gr 4 38 · Gr 5 23 · **Grade 6 and above 15 · Grade not set 53**. The Grade filter has no chip for these two groups (N13). |

## Teacher tasks (all four viewports, fallback; curated at 1366)

- **Every grade chip and every unit chip** clicked (Pre-K CC1/OA1/MD1/G1; K, 1, 2, 3, 4, 5, each D1–D5/E). Each lists its lessons, with no
  `[object`, `undefined` or `NaN`. The unit caption still shows raw week codes, "W01–W09 · Power standards …" (m4).
- **Lesson rows, ticks, quick groups, Select all, Clear, the per-skill Practice/Print:** each made the right link. Everything →
  13 skills that decode exactly. A single-skill Practice gives a 1-skill link. A thumbnail tick counts. In curated mode, the
  pre-skill `{band:99}` survives into the link.
- **Copy link:** copied, and the note says "· copied". **Open lesson / Teaching guide / Video:** `target=_blank` to the step's
  Drive ids and Vimeo.
- **Print** opens Print worksheets with the ticked skills, and the hash clears. **Back** returns to the lesson, and **Forward** reopens it.
  A **bookmark** of `#wrm/2/D1/3` opens "Hundreds".
- **Search:** "partition", "number bonds", "pictogram", "3.NF.A.1", "week 5", "w05". "zzzz" says "No lesson matches. Try a shorter
  word or a standard such as 2.NBT.A.1."
- **Dark mode:** title #f4f0fb on #1a1828. The tags keep their contrast (`r3-09-dark-1280.png`).
- **Skills to be made:** totals, Source/Grade/Domain/Kind filters, Shows, search ("number line" → 32), expand, Print list (32 items,
  no `[object`), CSV, and White Rose step → lesson.
- **MAP:** all 7 strands, band chips, task → three groups, Everything → link (7 skills), thumbnails, Print → Back to
  `#map/tasks/npv/all/e1`, By representation in every strand (`#map/reps/<strand>`), and the Start tab.
- **Console:** `problems: []` in every probe run.

## Gates (critic's own runs, one at a time)

| Gate | Result |
|---|---|
| ws-boot-smoke | OK |
| ws-teacher-wrm (fallback) | OK |
| ws-teacher-wrm --curated (synthetic r2-form Y3.json) | OK. It misses the M1 residue: its why check regex also has no `}` or `]`. |
| ws-wrm-page-unit | OK (945 lessons, 897 mapped) |
| ws-wrm-page-unit --curated (synthetic) | OK. **It should fail** (M1). |
| ws-wrm-sequence.py --check | OK |
| ws-teacher-shell | OK. The first run failed on 2 aborted Andika font requests while the machine was busy; the rerun passed. |
| ws-chromebook-fit | OK |

## Blocking defect

**B7 · Phone (390x844): the skill rows collapse (White Rose and MAP), C3 → 6.**
- Where: `css/teacher-wrm.css:94` (`.tvw-row`, a flex row that does not wrap), `:96` (`.tvw-row-main`), `:129–131` (≤ 600 px hides the
  quick-button labels), `:120` (bar buttons).
- What: at 390 the row is 236 px wide (113–349). The checkbox, the info icon and two quick buttons leave the name column 30 px
  (172–202). "Build a Number with Base-10 Blocks" takes 7 lines, and a why-line takes 10. One "Skills to do first" row is
  about 250 px tall, so a lesson's 13 skills run to about 3,000 px. The per-skill Practice and Print buttons are 38x44, under the 44 px target.
  The bar's Print button (279–374) runs 8 px past the bar card (96–366) (`r3-04-phone-rows-squeezed-390.png`).
- Fix:
  ```css
  @media (max-width: 600px) {
    .tvw-row { flex-wrap: wrap; align-items: flex-start; }
    .tvw-row-main { flex: 1 1 calc(100% - 56px); }
    .tvw-row .tvw-q { flex: 1 1 100%; display: flex; justify-content: flex-end; gap: 8px; }
    .tvw-q .tv-btn { min-width: 44px; }
    .tvw-q .tv-btn span { display: inline; }   /* room for the words on their own line */
    .tvw-bar-btns { display: flex; width: 100%; } .tvw-bar-btns .tv-btn { flex: 1 1 0; min-width: 0; }
  }
  ```
- Check: extend the 390 pass of `ws-teacher-wrm` on `#wrm/2/D1/1` and the MAP task:
  - `.tvw-row-name` is at least 200 px wide.
  - No `.tvw-row` is taller than 140 px.
  - Every button is at least 44x44.
  - Every `#tvwBar` / `.tvw-bar` button lies inside the bar's rect.

## Major defects

**M1 (still open; curated C4 7) · `plainWhy` leaves `} for this pupil]`, and the gate cannot see it.**
- Where: `js/modules/wrm-links.js:249`, where `/\s*\[rule[^\]]*\]/` stops at the first `]` (inside `["across"]`). Line 250's
  `{…}` strip then finds no `{`. Also `:272–273` (`Gr.K` is not handled) and `:252–257` ("Pre-K: / R.B10" → "Pre-K: / Pre-K"). Gate:
  `tests/scripts/ws-wrm-page-unit.mjs:150` (JARGON has no `[{}\[\]]`), `:151` (r2's sample is not in `samples`), and
  `tests/scripts/ws-teacher-wrm.cjs` (the why regex in the curated-opts block).
- What: the teacher reads "Not yet: part-whole model (see Grade 4)} for this pupil]" in the lesson head, in a "Skills to do
  first" why line, and twice in "Gap it fills". r2 counted 43 `[rule 18: …]` lines in the real files.
- Fix:
  1. Strip JSON first, then balanced rule brackets:
     `t = t.replace(/\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, '')` (before line 249), and
     `t = t.replace(/\s*\[rule\b(?:[^\[\]]|\[[^\]]*\])*\]/gi, '')`.
     Then drop any stray `[\]{}` left over.
  2. Map `Y1/Gr.K` and `Gr.K` to "Kindergarten".
  3. Collapse a repeated grade word ("Pre-K: / Pre-K" → "Pre-K").
  4. In the gate, add `[{}\[\]]|Gr\.` to JARGON, and add r2's exact line plus `Y1/Gr.K Count to 10` to `samples`.
- Check: `plainWhy('part-whole model (see Y5.B13) [rule 18: opts {"notation":["across"]} for this pupil]')` returns
  "part-whole model (see Grade 4)". The current code must fail the gate, and the fixed code must pass it with
  `--curated` on the tagging lanes' newest files.

**M2 (m1 residue; MAP 820 C3 7) · The toast covers the link and Copy when the sticky bar is not at the window's bottom.**
- Where: `css/teacher-wrm.css:223` (`bottom: calc(var(--tv-bar-h) + 24px)`) and `js/modules/teacher-skillpick.js:137` (sets
  `--tv-bar-h` from `offsetHeight`).
- What: on a short page, such as a MAP task with 7 skills at 820x1180, the bar ends 99 px above the window bottom. The toast
  "Practice link copied · 7 skills" (1033–1072) sits on the link input (1026–1070) and the Copy button (`r3-06`).
- Fix: place the toast from the bar's real position at the moment it is shown. Set
  `--tv-bar-h: ${innerHeight - bar.getBoundingClientRect().top}px` right before the link toast, rather than the bar's height.
  Or anchor the toast with `top: barTop - toastHeight - 12px`.
- Check: a `ws-teacher-wrm` case at 820x1180 on `#map/tasks/npv/all/e1` → Everything → Practice link asserts that the toast's
  bottom is at most the bar's top minus 8, and the same on a short White Rose lesson.

## Minor defects

- **m4 · Raw week codes in the unit caption.**
  - Where: `js/modules/teacher-wrm.js:255` (`u.weeks`).
  - What: every unit shows "W01–W09 · Power standards …", and the Enrichment units show "W33–W38". The rows already say
    "Week 1 (6–10 Sep)".
  - Fix: "Weeks 1–9 (6 Sep – 5 Nov)", from `weekInfo`.
  - Check: no `\bW\d\d\b` in the White Rose screen's text.
- **m5 · The MAP tab is remembered, against the owner ruling.**
  - Where: `js/modules/teacher-map.js:67` (restores `s.tab`) and `:332` (persists it).
  - What: after one visit to "Start a MAP test", MAP always reopens on the test tab, even after a fresh load.
  - Fix: do not restore `tab` from storage. Open on `tasks` unless a `#map/...` hash or an old `openMapTest` entry names the view.
  - Check: Start tab → reload → MAP opens on "Practise by task".
- **m6 · A strand change keeps a band the new strand does not have.**
  - Where: `js/modules/teacher-map-tasks.js:280`.
  - What: band 231+ in Operations & algebra, then a click on Multiplication & division, shows "No MAP task in this band for
    this strand" with no band chip pressed (`#map/tasks/md/231%2B`).
  - Fix: when the new strand's band list lacks `k.band`, set `k.band = ''`.
  - Check: after every strand click, one band chip is pressed, and the list is not empty unless "All" is empty.
- **m7 · Skills to be made still shows code to teachers.**
  - Where: `js/modules/teacher-todo.js:144–160` (kind line), `js/modules/build-queue.js:66–73` (closes) and the `teaches` field.
  - What: the screen shows code in several places:
    - The kind line reads "New skill · `counting:match_same`" in code font.
    - Entry names read "Symbol Puzzles (new skill algebra:symbol_puzzle)", and teaches lines read "a task option on coordinate_all".
    - "Migrate Legacy … to B&W Kit Cells" entries list about 20 raw skill ids.
    - Thirty fallback entries carry ids or code in their closes or teaches text, for example "(count_objects stops at 20)" and
      "chartwindow gains … `task: 'shade' | 'circle'`".
  - Fix:
    - Show the skill's label, not its id.
    - Run `plainWhy` over `teaches` as well as `closes`.
    - Give the `vis_*` and migrate entries a plain one-line "What pupils will do".
  - Check: the jargon regex over the Skills to be made screen's text and print HTML finds 0 hits.

## Nits

- N12: `weekForDate` hard-codes 2026/2027 (`js/modules/wrm-links.js:320`), so "This week" disappears after July 2027. Derive the school
  year from today.
- N13: the Skills to be made Grade filter has no "6+" or "Not set" chip (`js/modules/teacher-todo.js:113` filters out `'6'`). The groups
  exist but cannot be filtered to.
- N14: an id followed by text that is not its title becomes "Grade 2: part-whole model". It reads as a step name. Drop the
  "Grade N:" prefix when the id is not followed by its title (`wrm-links.js:258–259`).
- N15: "taught the same school week, W13" → "taught the same week 13". Prefer "taught the same week (week 13)".
- N16: in curated mode "Gap it fills" repeats the step: the `closes` line and the `missing` line both appear
  (`build-queue.js:147` / `:155`). De-duplicate by step.

## Fix list (to pass round 4)

1. B7: phone skill rows wrap (CSS above), quick buttons at least 44 px, bar buttons inside the bar; extend the 390 gate.
2. M1: the balanced `[rule …]` / JSON strip and `Gr.K`; the gate regex gets `[{}\[\]]|Gr\.` and r2's exact sample. Rerun with the
   tagging lanes' real files.
3. M2: toast placed from the bar's real top; add an 820x1180 short-page check.
4. m4–m7 this round if cheap (each is one or two lines); nits optional.

## Screenshots (this folder)

- `r3-01-lesson-1366.png`: fallback lesson, first row above the bar.
- `r3-02-curated-why-residue-1366.png`: M1, "(see Grade 4)} for this pupil]".
- `r3-03-phone-lesson-no-sideways-390.png`: B6 fixed.
- `r3-04-phone-rows-squeezed-390.png`: B7.
- `r3-05-phone-toast-above-bar-390.png`: m1 fixed at 390.
- `r3-06-map-toast-on-link-820.png`: M2.
- `r3-07-map-opens-on-tasks-1366.png`.
- `r3-08-todo-phone-390.png`: m2 fixed.
- `r3-09-dark-1280.png`.
- `r3-10-thumbs-1280.png`: N11.
- `r3-11-week-search-1366.png`: m3.

The critic scratch folder is outside the repo (`scratchpad/r3/`). It holds:
- `probe.cjs`: the full teacher-task probe, run as `probe.cjs <W> <H> <fallback|curated> [touch]`.
- `m390.cjs`: the phone row measurements.
- `maptoast.cjs`: the toast against the bar.
- `mapstr.cjs`: the strand/band sweep.
- `cur/Y3.json`: the synthetic curated file with r2's jargon forms.
