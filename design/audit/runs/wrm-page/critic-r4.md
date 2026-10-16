# WRM page lane: independent critic, round 4 (2026-10-16)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-page` at `f215191e`. That is fix round 4 (`e3371de`) merged with the latest base, which
now carries the real tagging files `data/curriculum/links/{R,Y1,Y4,Y6,MAP}.json`. This was a read-only critique, and I changed no
lane code. I did the teacher tasks on the White Rose page, Skills to be made and MAP (Practise by task, By representation, Start a
MAP test). I used 1366x768 and 1280x720 with a mouse, and 820x1180 and 390x844 with touch. One browser ran at a time.

**Data modes.**
- **As shipped.** The merged tree's `links/index.json` is `{"years": [], "map": false}`. The page therefore never loads the real
  files, and every screen runs on the computed fallback (see B8).
- **Real curated files.** I served the tree's own `R.json`, `Y1.json`, `Y4.json`, `Y6.json` and `MAP.json` by answering only
  `index.json` with `{"years":["R","Y1","Y4","Y6"],"map":true}`, through request interception. Nothing else was changed or
  synthesised. R maps to Pre-K, Y1 to K, Y4 to Grade 3 and Y6 to Grade 5.

The rubric is `design/audit/RUBRIC.md` C1–C4, adapted to teacher screens as in r1–r3: C1 ease, C2 value, C3 layout, C4 fidelity
(the teacher design system and the school's own words).

## Verdict: FAIL (round 4)

Round 4 fixed every layout defect r3 listed. Phone rows no longer collapse (B7). The toast always sits above the bar's real top,
on short and long pages and at every size (M2). Unit captions read "Weeks 1–9 (6 Sep – 12 Nov)" (m4). MAP reopens on
"Practise by task" after a reload (m5). A strand change resets the band (m6). N12, N13 and N15 are fixed too. On the data the
tree ships, every screen at every viewport now scores 8 or more.

The lane still fails, because the merge brought in the real tagging files and the lane does not handle them yet:

- **B8 (blocking).** The merged tree's `links/index.json` lists no years and no MAP file, so teachers never see the curated
  data. The lane's own gate `ws-wrm-page-unit` **FAILs** (3 failures) on the merged tree. `ws-teacher-wrm --curated` on the real
  files **aborts**, because it hard-codes the fallback MAP task `e1`.
- **M3 (real data, White Rose C4 7).** `plainWhy` misses three forms that the real files use, in about 35 lessons. The first
  form is the option name "band 5" (38 lines, mostly Pre-K and K). The second is a shorthand step chain: "R.B11.S5 / S6 1 more"
  becomes "/ S6 1 more / 1 less" (13 lines), and "which are S13" keeps its code. The third is "Y1.B6.S1 and Y1.B12.S1: …",
  which becomes "(and : counting to 50 …)".
- **M4 (real data, Skills to be made C4 7).** The N14 change turns "R.B1.S1: matching …" into ": matching …". That happens in
  the "Gap it fills" line of **61** entries. The step line is then listed a second time, so N16 is not fixed for this form.
  "How it looks" also shows the build team's spec on about 58 entries, for example
  "Print: one B&W boxed Andika cell (WORKSHEET_DESIGN_STANDARD.md) …" and "chartwindow gains … task: 'shade' | 'circle'".

## Scores

| Screen | Viewport | C1 Ease | C2 Value | C3 Layout | C4 Fidelity | Pass |
|---|---|---|---|---|---|---|
| White Rose lessons (as shipped) | 1366, 1280 | 9 | 8 | 8 | 8 | yes |
| White Rose lessons (as shipped) | 820 touch | 9 | 8 | 8 | 8 | yes (M2 fixed) |
| White Rose lessons (as shipped) | 390 touch | 8 | 8 | 8 | 8 | yes (B7 fixed) |
| White Rose lessons (real R/Y1/Y4/Y6) | 1366, 390 touch | 9 | 9 | 8 | **7** (M3) | no |
| Skills to be made (as shipped) | 1366, 1280, 820, 390 | 8 | 8 | 8 | 8 (m7 residue) | yes |
| Skills to be made (real files) | 1366, 390 touch | 8 | 8 | 8 | **7** (M4) | no |
| MAP · Practise by task (as shipped) | 1366, 1280, 820, 390 | 8 | 8 | 8 | 8 | yes |
| MAP · Practise by task (real MAP.json) | 1366, 390 touch | 8 | 8 | 8 | 8 | yes (m9) |
| MAP · By representation | all | 8 | 8 | 8 | 8 | yes |
| MAP · Start a MAP test (unchanged pupil path) | all | 8 | 8 | 8 | 8 | yes |
| Gates on the merged tree | — | | | | | **no** (B8) |

## The r3 defects, verified in the browser

| r3 | Status | Evidence |
|---|---|---|
| **B7** phone rows collapse | **Fixed** | At 390 touch on `#wrm/2/D1/1`, a Pre-K lesson and the MAP task, the narrowest `.tvw-row-name` is 202 px and the tallest row 130 px. No row or bar button is under 44x44, and every bar button lies inside the bar. Sideways scroll is 0 (`r4-04-phone-rows-390.png`). With the real files, rows that carry long why lines reach 152–166 px. That is the text's length, not a squeeze (nit N22). |
| **M1** jargon in why/missing lines | **Fixed for every form r2 and r3 found; open on the real files (M3)** | r2's line now returns "part-whole model (see Grade 4)". "Y1/Gr.K" becomes Kindergarten, and "Pre-K: / Pre-K" collapses. The real files bring new forms, listed in M3. |
| **M2** toast over the link and Copy | **Fixed** | The toast's bottom is 12 px above the bar's real top in every case I tried: the MAP task at 820 (toast 946–985, bar 997, `r4-05`), a 1-skill White Rose lesson, a long lesson scrolled to the end, and the Copy button, at 1366, 820 and 390. It never touches a bar control. |
| m4 raw week codes in the caption | **Fixed** | "Weeks 1–9 (6 Sep – 12 Nov) · Power standards …", "Weeks 33–38 (9 May – 24 Jun)". Both dates check against `weekInfo`. No `W\d\d` on the screen. |
| m5 MAP tab remembered | **Fixed on reload** | Start tab, then a fresh load, opens "Practise by task". Within one session, Home and then MAP reopens on the test tab (nit N17). |
| m6 band kept across strands | **Fixed** | After the last band, each of the 7 strand clicks leaves exactly one band chip pressed and a non-empty list. Multiplication & division falls back to "All". |
| m7 code on Skills to be made | **Partly fixed** | Names, the kind line's skill (shown as its label), "What pupils will do" and the fallback "Gap it fills" are plain. Still left: "How it looks" shows the spec (fallback: 31 entries, such as "chartwindow gains … task: 'shade' \| 'circle' \| 'sieve' … (algebra lane generator)", "pv.js gains …", "FAMILY_SUPPORTS (providers/util.js) … ws-supports-unit … answer-check.js" (`r4-07`)). The kind line reads "option: band 120". |
| N12 school year hard-coded | **Fixed** | `weekForDate` derives the school year from the date. |
| N13 no 6+ / Not set chip | **Fixed** | "6+" shows 34 entries under "Grade 6 and above", and "Not set" shows 53 under "Grade not set" (`r4-10`). The print header names them. |
| N14 "Grade 2: part-whole model" | **Regressed** | An id followed by its own words now loses its grade prefix, but an id followed by a colon loses everything except the colon: "R.B1.S1: matching …" becomes ": matching …". See M4. |
| N15 "same school week, W13" | **Fixed** | Reads "taught the same week 13". |
| N16 repeated step in Gap it fills | **Not fixed for object/colon closes** | Curated "Match the Same" lists ": matching an object …; : matching a picture …" and then both steps again as "Pre-K: Match objects — …" (`r4-06`). |

## Owner rulings (STATUS "White Rose page rulings", 2026-10-10)

| Ruling | Status |
|---|---|
| MAP page opens on "Practise by task" | **Yes.** A first visit and a fresh load both open `#map/tasks/npv/all`, in both data modes (see N17 for the in-session case). |
| Old start links open the test tab | **Yes.** `openMapTest('k2')` lands on "Start a MAP test", and its Start button is there. |
| "Skills to be made" has no sidebar entry; it is linked from White Rose, MAP and Home | **Yes.** The sidebar has Home, Send a skill set, Print worksheets, Run practice, Skills library, White Rose lessons, Quizzes, MAP tests, Progress and Settings. Each of the three screens has the link, and each link opens the list. With the real files, a lesson's "To be built" chip lists its proposal (Pre-K CC3 lesson 1, "Number Focus Window"). |
| "Other (drawing / repair)" behind a filter | **Yes.** The Kind chip "Other (drawing, fix)" shows 25 entries, of 275 (as shipped) or 377 (real files). |
| Grade 6+ and "Grade not set" last | **Yes.** Real files: Pre-K 33 · K 41 · Gr 1 36 · Gr 2 38 · Gr 3 81 · Gr 4 49 · Gr 5 42 · **Grade 6 and above 17 · Grade not set 40**. As shipped: … 15 · 53. Both now have filter chips (N13). |

## The real curated files: sweep and spot checks

- **Sweep.** I opened all **522** lessons whose step is in R, Y1, Y4 or Y6, or that sit in Pre-K, K, 3 or 5: 487 curated and 35
  on rules. I read each lesson's rendered text (head, verdict, "Not yet", every why line), 29,901 lines in all. Then I ran
  `plainWhy` over all 3,054 why, missing and partial lines in the four files.
  - Clean: no `{ } [ ]`, no `rule N`, no `Y4/Gr.`, no `wk W11`, no `Gr.`, no `R.B`/`Y\d.B` ids and no snake_case ids.
    Prior-learning weeks read "support block, week 11".
  - Not clean: the M3 forms. The counts are "band N" 38, "/ S\d" chain 13, bare "S\d" 27 (overlapping), and "and :" 2. They
    fall in about 35 lessons, mostly in Pre-K CC2/CC3, K D1/D3/E and Grade 3 D4/E.
- **Lesson → step.** Every swept lesson's title matches its step's title in the files (32 checked one by one, all of them
  exact). The verdict chip follows the file's `verdict`. For example, Pre-K CC3 lesson 1 shows "Covers part" with the file's
  `missing` line.
- **Tick links.** I spot-checked every 15th curated lesson (32 lessons): Everything, then Practice link, then decode. The skill
  count matches `linksFor` in all 32. Every option either matches or was left out because it equals the skill's default
  (`normalizeOptions` confirms `band 10` on compare_groups, `band 20` on count_objects, `power [10,100,1000]` on place_value_10x,
  and so on). No real option was lost. Curated `opts` reach the link: K D2/14 `nl_add {"range":10,"unknown":"answer"}`,
  Grade 3 E/14 `compare_decimal {"decimals":2,"forms":[0]}`.
- **Hidden rows (data note for the Y6 lane, N18).** Six Grade 5 lessons (D2/3, D2/4, D3/15, D4/16, D4/22, D4/23) list one row
  fewer than the file. The page's `liveKey` drops the `mixed_*` pool that Y6 tagged (`number_theory:mixed_number_theory`,
  `graphs:mixed_graphs`, `angles_lines:mixed_angles_lines` …). That is the right behaviour, but the tag should not be there.
- **MAP.json.** The task list, a task's three groups, Everything → Practice link (8 skills), thumbnails, Print → Back and
  By representation all work, with no console problem. The task ids change from the fallback's `e1…` to `m1…` (m9).

## Teacher tasks (all four viewports, both data modes at 1366 and 390)

- **Grade and unit chips.** I clicked every one: Pre-K CC1/OA1/MD1/G1, then K, 1, 2, 3, 4 and 5, each D1–D5/E. Each lists its
  lessons. No `[object`, `undefined` or `NaN`, and no jargon in any grade's screen text.
- **Lesson rows, ticks and quick groups.** Ticks, quick groups, Select all, Clear and the per-skill Practice/Print all work.
  Everything gives 13 skills as shipped and 12 with the real files, and both decode exactly. A single-skill Practice gives 1
  skill. A thumbnail tick counts. After Clear or the last untick, the link is gone (N7 still holds).
- **Copy link.** It copies, and the note says "· copied". Open lesson / Teaching guide / Video open with `target=_blank` (a
  copied-in lesson says "Open lesson (Grade 2 files)").
- **Print.** It opens Print worksheets. Back returns to the lesson, and Forward reopens it. The bookmark `#wrm/2/D1/3` opens
  "Hundreds".
- **Search.** "week 5" and "w05" (own grade first, Enter opens it), "3.NF.A.1", "partition", "number bonds", "pictogram".
  "zzzz" gives the helpful empty message. "This week: Week 7" opens the right lesson.
- **Thumbnails.** 5 in view at 1366, 4 at 1280, 8 at 820 and 3 at 390.
- **Dark mode.** The title is #f4f0fb on #1a1828 (`r4-09-dark-1280.png`).
- **Skills to be made.** Totals, all four filter rows including 6+ / Not set, search ("number line" gives 59 with the real
  files), every entry opened, Print list (59 items, no `[object`), CSV.
- **MAP.** All 7 strands, the band chips, a task, Everything → link (7 as shipped, 8 with the real files), thumbnails,
  Print → Back, By representation in every strand, and Start.
- **Console.** `problems: []` in every run.

**The toast across screen changes.** The toast no longer covers any control of the bar it belongs to. But it stays up for its
full 2.2 s after a screen change, at the default `bottom: 24px` of the next screen. It sits over the Grade chips on Skills to be
made at 390 (`r4-08-toast-lingers-on-todo-390.png`), over the sheet-title field on Print worksheets at 390, and over the "Print
worksheets" and "Run practice" cards on Home. It has `pointer-events: none`, so taps go through, and it is gone within 2.2 s.
That makes it a minor defect (m8), but it does cover controls on the next screen.

## Gates (critic's own runs, one at a time, on `f215191e`)

| Gate | Result |
|---|---|
| ws-boot-smoke | OK |
| ws-teacher-wrm (as shipped) | OK |
| ws-teacher-wrm --curated data/curriculum/links | **FAIL**: `Timeout waiting for 820 MAP task`. The M2 toast case opens `#map/tasks/npv/all/e1`, which does not exist in the real MAP.json. The throw aborts the rest of the run (the 390 pass never runs). |
| ws-wrm-page-unit | **FAIL (3)**: `index.json years [] = files on disk ["R","Y1","Y4","Y6"]`, `index.json map false = MAP.json on disk true`, and `jargon gate: 1 of 3260` (a false positive, see B8) |
| ws-wrm-page-unit --curated data/curriculum/links | **FAIL (3)**: the same failures |
| ws-wrm-sequence.py --check | OK |
| ws-teacher-shell | OK |
| ws-code-snapshot | OK (608 codes, 35 categories, no move or delete) |

## Blocking defect

**B8 · The merged tree hides the real tagging files, and the lane's own gates fail on it.**
- **Where:**
  - `data/curriculum/links/index.json`, which is `{"years": [], "map": false}`. The base has no index.json, so the lane's
    empty one survived the merge.
  - `tests/scripts/ws-teacher-wrm.cjs:636`, where `toastCase('#map/tasks/npv/all/e1', …)` hard-codes a fallback task id.
  - `tests/scripts/ws-wrm-page-unit.mjs:150`, where the JARGON regex's `\1` refers to `(R|Y\d)`, not to the grade group.
- **What:**
  - Teachers see none of the R/Y1/Y4/Y6/MAP tagging: Pre-K lesson CC3/1 shows "Fully taught" where the file says "Covers part",
    and Skills to be made lists 275, not 377.
  - The lane's own unit gate fails on the merged tree. The curated browser gate cannot finish on the real files.
  - The JARGON regex flags "Grade 2/Grade 3 reading a scale", because `\1` refers to the unmatched group 1 and matches empty.
- **Fix:**
  1. Write `{"years":["R","Y1","Y4","Y6"],"map":true}` to `index.json`. Better still, have the gate regenerate it from the files
     on disk (`--write-index`) so a merge cannot leave it stale. This turns on M3 and M4, so fix them in the same change.
  2. In `ws-teacher-wrm.cjs`, pick the toast case's task from the page, not a fixed id. Take the first
     `[data-mk-task]:not(.is-gap)` on `#map/tasks/npv/all`. Catch per-case errors so one case cannot abort the run.
  3. Name the group in the gate regex: `\b(?<g>Pre-K|Kindergarten|Grade \d)\s*:?\s*\/\s*\k<g>\b`.
- **Check:**
  - `node tests/scripts/ws-wrm-page-unit.mjs` reports OK on the merged tree.
  - `node tests/scripts/ws-teacher-wrm.cjs --curated data/curriculum/links` runs to the end and reports OK.
  - Pre-K CC3/1 shows "Covers part" in the browser without interception.

## Major defects

**M3 · On the real files, `plainWhy` leaves option names and shorthand step codes (White Rose C4 7).**
- **Where:** `js/modules/wrm-links.js:254–263` (the id-chain regex and its resolution) and `:274–280`. The gate is
  `tests/scripts/ws-wrm-page-unit.mjs:150–154` (JARGON and `samples`).
- **What** (each is a real line → what the teacher reads):
  - `R.B11.S5 / S6 1 more / 1 less` → "/ S6 1 more / 1 less". There are 13 such lines, for example K E/14, 15, 17 and 19
    ("Combine Shapes … / S6 two shapes make one shape", `r4-03`) and K D1/13.
  - `… which are S13, and never …` → unchanged (K D2/6).
  - `(Y1.B6.S1 and Y1.B12.S1: counting to 50, and from 50 to 100)` → "(and : counting to 50 …)" (Grade 3 D4/1, E/7).
  - `groups of 1-3 only (band 5 deals 4 and 5)` → unchanged. That is 38 lines in Pre-K CC2/CC3, K D1/D3/D5 and Grade 5 E/3,
    where "band 5", "band 90" and "until band 3 exists" are option ids. The teacher's word for this option is "Numbers to"
    (`bandOption`, `skill-options.js:53`). The head of Pre-K CC3/1 reads "Not yet: finding groups of exactly 4 and 5 (band 5
    deals 1-5, mostly 1-3)" (`r4-02`).
- **Fix:**
  1. Let the chain take shorthand steps and "and" / "," joiners:
     `/\b(?:R|Y[1-6])\.B\d+(?:\.S\d+)?\b(?:\s*(?:\/|,|and)\s*(?:(?:R|Y[1-6])\.B\d+(?:\.S\d+)?|S\d+)\b)*/g`.
     Resolve a bare `S6` against the block of the id before it (`R.B11` + `S6` gives `R.B11.S6`, "Pre-K: 1 more and 1 less").
     When the chain is followed by `:`, emit "Grade: Title — " so the colon does not dangle.
  2. A bare `\bS(\d{1,2})\b` that is still left (not in a chain) becomes "a later lesson" / "an earlier lesson", or is reported
     back to the tagging lane to reword.
  3. Turn option ids into the option's teacher label:
     `t.replace(/\bband (\d[\d,]*)/gi, (m, n) => \`"Numbers to ${n}"\`)` (so "band 5 deals 4 and 5" reads '"Numbers to 5" deals
     4 and 5', and "band 3 exists" reads '"Numbers to 3" exists'). Do the same for any other `optionId value` the files use
     (`parts 0`, `span 10`).
  4. Gate: add `\bS\d{1,2}\b|\bband \d|(^|[(;])\s*(?:and|or)?\s*:` to JARGON. Add these to `samples`: "R.B11.S5 / S6 1 more",
     "Y1.B6.S1 and Y1.B12.S1: counting to 50", "groups of 1-3 only (band 5 deals 4 and 5)".
- **Check:**
  - `ws-wrm-page-unit` reports 0 jargon in the 3,260 real lines.
  - A browser sweep of the 522 lessons above finds none of these forms (the critic's `sweep.cjs` regex).

**M4 · On the real files, Skills to be made shows ": …" gap lines, repeats steps and prints the build spec (C4 7).**
- **Where:**
  - `js/modules/wrm-links.js:263`, the N14 strip `t.replace(/\u0002[^\u0001]*\u0001[^\u0001]+\u0001\s*/g, '')`. It runs when
    the id is followed by `:`, because the title lookahead at `:261` does not accept `:`.
  - `js/modules/build-queue.js:155`, which de-duplicates with `startsWith(stepName(sid) + ' —')`.
  - `js/modules/teacher-todo.js:68`, where `todoLooks` passes `representation` through `plainLine` only.
- **What:**
  - **61** curated entries open with "Gap it fills: : matching an object to an identical object …; : matching a picture …", and
    then list the same steps again as "Pre-K: Match objects — …" (`r4-06`). The proposal files write `closes` as
    `"R.B1.S1: text; R.B1.S2: text"`.
  - "How it looks" on about 27 curated proposals reads "Print: one B&W boxed Andika cell (WORKSHEET_DESIGN_STANDARD.md), big
    digits, single grey for structure only; …".
  - "How it looks" on about 31 vis_* entries (both modes) shows the template spec (m7).
- **Fix:**
  1. In `plainWhy`, let the title lookahead accept `:` and turn `id:` into `Grade: Title —`.
  2. In `buildQueue`, split each proposal's `closes` into `{sid, text}` pairs with
     `/((?:R|Y[1-6])\.B\d+\.S\d+)\s*:\s*([^;]+)/g`. Key the lines by `sid`, and add the step's `missing` only when that `sid`
     has no line yet.
  3. In `todoLooks`, drop a leading `Print: one … cell (….md)[^;]*;` design boilerplate. For vis_* entries, show a plain
     sentence built from the pair label ("A new picture: …"), as `todoTeaches` already does, and keep the spec for the CSV only.
- **Check:**
  - Every "Gap it fills" item starts with a grade word or a CCSS/EE code, never `:`.
  - No step appears twice in one entry.
  - Over the open list and the print, in both modes, the m7 gate regex, extended with `\.md\b|\.js\b|'[a-z-]+' \||[A-Z]{3,}_[A-Z]`,
    finds 0 hits.

## Minor defects

- **m7 (still open, fallback) · "How it looks" and the kind line show the build spec.**
  - Where: `teacher-todo.js:68` (`todoLooks`) and `:180` (`option: ${plainLine(e.option)}`).
  - What: there are 31 entries. Examples are "chartwindow gains the whole chart with task: 'shade' | 'circle' | 'sieve' …
    (algebra lane generator)", "tenframe gains unit: 1 | 10 | 100 …", "pv.js gains …", "FAMILY_SUPPORTS (providers/util.js) … run
    ws-supports-unit. It does NOT edit answer-check.js …", and "option: band 120" (`r4-07`).
  - Fix: as in M4 step 3. For options, show the option's label from `skill-options.js` ("Numbers to 120").
  - Check: the extended m7 regex finds 0 hits as shipped.
- **m8 · The toast stays up across a screen change and sits on the next screen's controls.**
  - Where: `js/modules/teacher-ui.js:93` (`toast`, 2.2 s) and the screen switch (`tvGo` / hash change).
  - What: after Practice link, a move to Skills to be made, Print, Home or another lesson within 2.2 s leaves "Practice link
    copied · 13 skills" at the bottom of the new screen. At 390 it covers the Grade chips (`r4-08`), the sheet-title field and
    the Home cards. Taps go through, because it has `pointer-events: none`.
  - Fix: export `hideToast()`, which removes `is-on` and clears the timer, and call it on every screen change. Or keep the toast
    only when the new screen has the same picker.
  - Check: Practice link, then `tvGo('todo')` at 100 ms: `#tvToast` lacks `is-on`.
- **m9 · Old MAP task links drop their task once MAP.json is on.**
  - Where: `teacher-map-tasks.js` hash reading. The fallback ids are `e1…` and the MAP.json ids are `m1…`.
  - What: `#map/tasks/npv/all/e1`, a link a teacher bookmarked while the page ran on the fallback, silently becomes
    `#map/tasks/npv/all` "Choose a MAP task".
  - Fix: map each fallback id to the MAP.json row with the same strand, band and task text, or show "That task is no longer
    listed — pick one below" for an unknown id.
  - Check: with MAP.json on, `#map/tasks/npv/all/e1` opens the matching task or shows the note.

## Nits

- N17: within one session, MAP reopens on the test tab after a visit to it (Home, then MAP). A reload opens "Practise by task",
  as ruled. Consider resetting to `tasks` on every `tvGo('map')` without a hash.
- N18 (for the Y6 tagging lane): Y6.json tags `mixed_*` pools on 6 Grade 5 lessons. The page drops them, so the row counts
  differ from the file.
- N19: the kind line of a skill not yet made shows id words in lower case ("New skill · match same", "New skill · part whole
  model"). Drop the part after "New skill", because the entry name already says it.
- N20: the head of a copied-in lesson says "Copied in from G2". Write "Grade 2".
- N21: the grade text "M" on multi-grade Skills to be made entries ("… WRM M") is not explained. Write "Several grades".
- N22: at 390 with the real files, rows with long why lines reach 152–166 px. That is acceptable, but a two-line clamp with
  "more" would keep the list scannable.
- N23: one real line keeps its quotes and a run-on parenthesis: "(prior learning week 27, "Grade 2/Grade 3 reading a scale")".
  The prior-learning rewrite does not fire when the parenthesis holds more than the week.

## Fix list (to pass round 5)

1. B8: correct `index.json` (generated from the files on disk). Make the toast case pick a real task, and catch per-case errors.
   Fix the gate's backreference.
2. M3: shorthand and "and" chains, colon after a chain, `band N` → "Numbers to N"; extend the JARGON gate and its samples.
3. M4: `id:` in `plainWhy`, de-duplicate closes by step id, and plain "How it looks" text (which also closes m7).
4. m8 and m9 if cheap. The nits are optional.
5. Re-run `ws-wrm-page-unit` and `ws-teacher-wrm --curated data/curriculum/links` on the merged tree, and check them in the
   browser without interception.

## Screenshots (this folder)

- `r4-01-lesson-1366.png`: as-shipped lesson.
- `r4-02-curated-band-jargon-1366.png`: M3, "band 5 deals 1-5" in the Pre-K CC3/1 head (real R.json).
- `r4-03-curated-step-code-residue-1366.png`: M3, "/ S6 two shapes make one shape" (K E/14, real Y1.json).
- `r4-04-phone-rows-390.png`: B7 fixed.
- `r4-05-map-toast-above-bar-820.png`: M2 fixed, the toast above the bar on the short MAP page.
- `r4-06-curated-todo-gap-colon-1366.png`: M4, ": matching …" and the repeated steps.
- `r4-07-todo-how-it-looks-code-1366.png`: m7, "chartwindow gains … task: 'shade' | 'circle' | 'sieve'".
- `r4-08-toast-lingers-on-todo-390.png`: m8.
- `r4-09-dark-1280.png`.
- `r4-10-todo-not-set-1366.png`: N13 fixed.
- `r4-11-curated-y6-lesson-1366.png`: a real Y6 lesson (Grade 5 D1/14, long division).
- `r4-12-curated-map-task-1366.png`: a real MAP.json task (`m9`).

The critic scratch folder is outside the repo (`scratchpad/r4/`). It holds:
- `probe.cjs`: the r3 probe, with real-file mode, run as `probe.cjs <W> <H> <fallback|curated> [touch]`.
- `sweep.cjs`: the 522-lesson jargon sweep and link spot check.
- `forms.mjs`: the residue counts over the files.
- `rows.cjs`: B7.
- `toast.cjs`: M2 and m8.
- `todo.cjs`: Skills to be made text.
- `live.cjs`: the hidden-row check.
- `evidence.cjs` and `ev2.cjs`.
