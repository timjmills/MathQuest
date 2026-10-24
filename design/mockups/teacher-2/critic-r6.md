# Teacher site 2.0 T1 mock-up (board C): independent critic, round 6

**A 7 · B 9 · C 7 · D 8 — FAIL** (A and C are below 8)

Graded on 2026-10-24, branch `claude/sweet-newton-c8wrv1-wip-teacher-t1` at HEAD `291b6ed0`, light mode only (owner
decision 8). I graded against IMPROVEMENT_PLAN §2.1–§2.11 and §4.3 (Q-M1, Q-T, Q-W), and against the owner's decisions
1–9 of 2026-10-23. Where they differ, the owner decisions win. I built none of this, and I did not reuse the builder's
or earlier critics' scripts. My scripts and PNGs are in the session scratchpad under `r6/`.

## How I checked it

- **Server and browser.** I served the repo root with `python3 -m http.server` and drove Chromium 1194 with Playwright.
- **Flows (`flows.cjs`).** It clicks all 24 rows of `flows.js` at 1366 × 768 and 390 × 844, using the `narrow` lists on
  a phone. It uses real clicks and real keyboard typing on the first visible match. Before each click it hit-tests the
  target; a target that is off screen or covered counts as one scroll. At the end it reads `MQ.S.last`, the sheet, the
  kind and each flow's own `check`.
- **Tray bar (`tray.cjs`).** Trays of 1, 3, 8, 10, 40, 100, 160 and 563 skills (K–6), in List, Chips and Thumbnails,
  at 1366, 1280, 1024, 820 and 390: 120 renders. For each it records height, sideways scroll, clipped text, controls
  under 44 px and the visible text.
- **Tray popup (`pop.cjs`).** 100 and 200 skills, in all three views, with Detailed weights on and off, at 1366, 1024,
  820 and 390. It records the rows on screen, text under a control and sideways scroll.
- **% and summary (`pct.cjs`, `lk.cjs`).** It reads `MQ.plan()` and `MQ.summaryText()` and counts the cells of every
  preview page against `plan().perPage`, for 11 settings.
- **Search (`search.cjs`).** Nine queries in the Skills box.
- **Thumbnails.**
  - `thumbs.cjs` shot 55 skills sampled every 14th card across all 35 categories, plus the critic-r5 named ones, from
    `thumbs.html` after the live drawing finished. I looked at all of them by eye (`png/contact-0…4.png`).
  - I also looked at Skills cards at Big and Medium.
  - `real.cjs` prints the same skills with the app's own `buildSheet` + `sheetDocument` at the card seed 4101, for
    comparison (`png/real-contact.png`).
- **Gates.**
  - `node tests/scripts/ws-teacher-tokens.cjs` → **OK**.
  - `node design/mockups/teacher-2/thumbs-check.cjs` → **OK** (261 skills in 35 categories, 392 thumbnails compared
    with the app's sheet). A cold load of `app.html#skills` reported 4.20 MB, page in 1.8 s, and the first screen of
    thumbnails in **7.4 s**. That time is noted, not scored.
- **Colour (`col.py`).** It reads `tokens.css`, then runs sRGB → linear → Machado 2009 (severity 1) → XYZ D65 → Lab →
  CIEDE2000, plus the WCAG ratio.

There were no console errors on any app screen or doc page I opened, and no sideways scroll at any width.

## Independent colour numbers (`tokens.css`, light)

| Check | Gate | Mine | Need |
|---|---|---|---|
| Bold vs bold, normal vision | 20.7 NBT–RPNS | 20.7 NBT–RPNS (shared grade: 21.5 NBT–MEAS) | ≥ 20 |
| Deuteranopia, shared grade / any pair | 13.0 NF–G / 8.9 MEAS–RPNS | 13.0 NF–G / 8.9 MEAS–RPNS | ≥ 12 / ≥ 8 |
| Protanopia, shared grade / any pair | 12.9 CC–DATA / 9.2 MEAS–RPNS | 12.9 CC–DATA / 9.2 MEAS–RPNS | ≥ 12 / ≥ 8 |
| Slate vs every area (normal / deut / prot) | 25.6 / 13.0 / 15.1 | 25.6 / 13.0 / 15.1 | ≥ 8 |
| Bold vs error red / key orange, all views | 21.9 | 21.9 (key, deuteranopia) | ≥ 20 |
| Bold vs ink (WCAG) | 2.89 OA | 2.89 OA | ≥ 2 |
| Text on bold | — | lowest slate 4.74, DATA 5.22 | ≥ 4.5 |
| Deep on page / white / its tint | — | lowest 7.02 / 8.27 / 6.83 (slate) | ≥ 7 / 4.5 |

The gate's numbers are right. The watched pairs (NF–G 13.0, CC–DATA 12.9, CC–G 13.1) are listed by the gate.

## Round 5 defects: verified

| r5 defect | Now |
|---|---|
| A1/C1. SVG text blown up 2–4× in about 120 thumbnails | **Fixed.** Thumbnails are drawn live by the app. Clocks, number lines, bar graphs and coordinate grids keep their own text sizes (`png/contact-4.png`), and `thumbs-check` compares font sizes with the app. **New defect in their place:** the crop now hides the drawing on about one card in five (A1 / C1 below). |
| C2. Centred crop cut line starts | **Fixed.** Vocabulary, Cube Numbers and Count by 7s keep their first letters. The left / top anchor is now the cause of A1. |
| A2. 820 big-tray bar shows "+6 areas" only | **Fixed.** One named segment ("Ops 59") shows at 820 for every big tray. The "+N areas" beside it no longer shows (A4 below). |
| A3. Phone Detailed weights: whole-grade rows overlap | **Fixed.** No text sits under a control in 48 popup states. |
| A4. Detailed weights rows about 110 px at 1366 | **Fixed in List.** One 55 px line, 6 skill rows under the headers at 1366. **Still 102 px in Chips and 322 px in Thumbnails** (A3 below). |
| A5. Repeated grade badge in one-grade Chips / Thumbnails; repeated area name on cards | **Fixed.** |
| B1. "Same problems, new numbers" repeated pages | **Fixed in the mock-up.** Each page is dealt from its own seed, and the page plan repeats as specified. A residual repeat (7 + 4 and the ⅓ bar on pages 1 and 3) comes from the **app**: `buildSheet` at seeds 47275 and 603074 deals the same first item for `add_facts` and `shade_fraction`. That is an app note, not marked down. |
| D2. Selected segmented options had only a border | **Fixed.** Every selected option shows fill + ✓ + ring. On a phone the ✓ collides with the label (A5). |

## Flows clicked (my count; every flow ended in the right state with its `check` true and no console errors)

| Flow | 1366 | 390 | Plan |
|---|---|---|---|
| One skill + key / code for one skill | 4 / 4 | 4 / 4 | 4 / 4 |
| Mixed page of 3 (one list / by search) | 5 / 8 | 5 + 1 scroll / 8 | 5–8 |
| Set of 3 to pupils | 5 | 5 + 1 scroll | 5–8 |
| Board | 3 | 3 + 1 scroll | 3–4 |
| Quiz on paper / from a standard / online | 3 / 3 + 1 scroll / 4 | 3 + 1 / 3 + 1 / 4 + 1 | 3–5 / 3–5 / 4–6 |
| Lesson practice same / other grade; pre-skills; detailed lesson | 4 / 6 / 4 / 4 | 4 / 6 / 4 / 4 | 4 / 6 / 4 / 4 |
| MAP task / saved set / saved quiz | 4 / 4 / 4 | 4 / 4 / 4 | 4 / 3–4 / 3–4 |
| Chip options | 1 | 2 | 1 (2 on a phone) |
| Whole grade on paper / share a whole grade | 3 / 3 | 3 / 3 | ≤ 4 |
| Remove a grade / one grade more often | 2 / 2 | 3 / 2 | ≤ 3 |
| Fractions 40 % / one skill at 50 % | 4 / 4 | 4 / 4 | ≤ 4 |
| Three copies of the same mixed page | 4 | 4 | ≤ 4 |

## % arithmetic and summary = preview (checked)

| Case | Result | Verdict |
|---|---|---|
| 5 skills, one at 50 %, 5 pages (40 problems), Mixed | **20 · 5 · 5 · 5 · 5** | correct |
| 5 skills, one at 50 %, 1 page (8 problems), Mixed | **4 · 1 · 1 · 1 · 1** | correct; the 5th skill is **not** dropped |
| 4 skills, one at 50 %, 1 page | **4 · 2 · 1 · 1** | correct by largest remainder. The builder's "4·2·1·1" is the 4-skill case, not the 5-skill one. |
| Grade 3, Fractions held at 40 %, 14 pages | Fractions 45 of 112 = 40.2 % | correct. The sheet reads "Operations 26, Place value 20, Fractions 45, Measure 15, Data 5, Geometry 1" (sum 112). |
| 5 skills, one at 50 %, **Single skill**, 5 pages | 16 · 8 · 8 · 8 · **0** | **wrong**: 40 %, not 50 %, and one skill silently gets 0 (C2) |
| 5 skills at 50 %, **press More** on the held skill in the Print sheet | lock removed, **20 → 11 problems** | **wrong** (C1) |

- **Summary = preview.** Preview cell counts equal `plan().perPage` on every page in all 11 settings. Those include New
  problems, Same problems and Same page again, demo10, demo40 and the grade-3 quiz. The summary line matches the sheet's
  own text.
- **Each page.** "3 pages · the same 8 problems on each, new numbers · 24 in all" repeats page 1's layout with new
  items. "3 copies of the same page … one key: 'Key for all 3 copies'" is right.
- **Search** goes through the app's finder:
  - "2.NBT.5" → 16 skills, Basic Addition first;
  - "time" → Time to the Hour first;
  - "within 1000" → 11, all "1,000";
  - "fractoins" → 123, fractions first;
  - "clocks", "money", "arrays" and "3.NF.1" are right;
  - "zzzzqq" → "0 skills match".

## Scores

### A. Hierarchy: 7

What works:
- One ink primary per sheet, above the fold at 1366.
- Colour means maths area only, with the ink side menu (decision 4) and the stone page with white cards (decision 3).
- The neutral numbered grade badge sits in a fixed first slot (decision 2), shown once on a one-grade header.
- The tray bar is 61–94 px (6–11 %) for 1–563 skills at every width, and no control is under 44 px.
- The big-tray popup in List reads area → grade → skill, with Detailed weights as one line per skill at ≥ 820.
- The phone popup shows about 10 skill rows when Detailed weights are off.

Points lost:
1. **About one thumbnail in five no longer shows its drawing (severe for "readable thumbnails").** The crop is anchored
   at the left / top of the cell and never scales. Any item whose drawing sits centred or below a sentence shows blank
   paper, a title, or a sliver. From my 55-card sample (`png/contact-*.png`):
   - Line Plots: a blank box with "Plant", even on a Big card (`png/big-lineplot.png`);
   - Line Plots (Grade 2): the question only;
   - Double Number Lines: blank but a "0";
   - Fractions on Number Line (Visual): the sentence and a sliver, no lines (`png/search-fractoins.png`);
   - Count by Powers of 10: empty boxes;
   - Match Names to 3D Shapes: text only;
   - Classify Quadrilaterals: half a square;
   - Make an Amount with the Fewest Coins: the coin cut;
   - Write Expressions and Build the Expression: words only;
   - every elapsed-time card ("30 Minutes Later", "Hours Later", "15, 30, 45 Minutes") shows "End 9:15" and a bare line.
     The "30 minutes later" that tells them apart is cut on the right, so three cards look alike (`png/big-elapsed.png`).

   The app's own cells contain the drawings (`png/real-contact.png`), so this is the mock-up's crop. `thumbs-check`
   passes because it checks text size and position against the app, not whether the drawing falls inside the window.
   Fix:
   - Crop to the bounding box of the drawn content (SVG, table, boxes), not the cell's top-left.
   - If the content box is wider than the window, scale the whole item down to the place's minimum text size first,
     then crop.
   - Add a check: each thumbnail's visible window must contain ≥ 60 % of the item's drawn (non-text) area, and its
     non-white pixel share must be at least half the app cell's. Commit the check failing first (§1.7).
2. **Phone popup with Detailed weights:** the area and grade headers open all their controls inline (Less · Equal ·
   More, %, lock, Reset, Remove), although each also has a "⋯". The first 390 × 844 screen shows **one** skill row
   (`png/pop-390-list-det1.png`), and each skill row is 104 px. Fix: with Detailed weights on, keep the headers to one
   line with "⋯", as when it is off.
3. **Detailed weights in Chips and Thumbnails** are still 102 px and 322 px per skill at 1366 (6 and 5 skills per
   screen; 2 at 1024). Fix: Detailed weights switches the popup to the one-line List rows, or uses the same one-line
   control strip under each chip.
4. **The 820 big-tray bar shows one area and no "+N".** "Grades 2–3 · 160 skills · 6 areas ▸ [Ops 59]" has empty room
   beside it, and the "+5 areas" README promises is hidden (`png/tray-820-demo160-list.png`). Fix: show "+5" beside the
   segment, or use the abbreviations, which fit.
5. **The selected ✓ collides with its label.** On a phone the "✓" of the selected Browse pill draws over the "A" of
   "Area" (`png/clip-phone-pills.png`). At 1366 and 820 "✓Maths area", "✓Medium" and "✓Big" have no gap. Fix: a gap
   token between the icon and the label.

### B. Steps to each goal: 9

Every flow is within its plan at both widths (table above). There are no dead ends, and Print with a 110-skill tray
opens in about 0.5 s. Point lost: none in the flows. The one point keeps room for C1: a teacher who sets a % and then
taps More in the Print sheet loses the % without being told, so reaching "this skill half the page" can take a second
attempt.

### C. Fidelity to §2 and the owner decisions: 7

These are verified:
- Four places, the profile menu and a phone bottom bar.
- A tray that is always visible, with Build from when it is empty.
- Three kinds, each showing only its own options.
- More options and Quiz options with 1–6 versions.
- Share: Copy primary and Board secondary, with the whole-grade proposal flagged.
- Lessons open where the teacher was last, with Next.
- Classes with its tabs.
- Decisions 1–4 and 6.
- Decision 5:
  - area → grade popup;
  - Less · Equal · More and a grade-wide How often;
  - % lock with split evenly / keep proportions;
  - over-100 % refused;
  - bulk add of grade, area, unit and standard.
- Decision 7, with "Key for all N copies".
- Decision 9: previews print Name, Date, Score and the I Can title; no strand tab in any preview or thumbnail I opened.

Points lost:
1. **The Print sheet's How often contradicts a held %.** A skill held at 50 % in a small tray shows "✓ Equal" beside
   four other "Equal" skills, though it gets 20 problems to their 5 (`png/pct-5_skills_add_facts_50_5_pages.png`).
   Pressing **More** silently removes the lock and drops it from 20 to 11 (`lk.cjs`). This is r4 C5 ("Equal 40 %")
   again, in the skill rows of the sheet. Fix:
   - A held skill shows "50 % 🔒" in place of Less · Equal · More, as held areas already do.
   - Its buttons ask "Release the 50 %?" before changing it.
2. **Single skill with a lock drops a skill and misses the %.** With 5 skills, one at 50 %, on 5 pages, the result is
   16 · 8 · 8 · 8 · 0. That is 40 %, and Subtraction Word Problems is left out with only "≈ 0" in the summary
   (`png/pct-5_skills_50_1_page_single.png`). §2.5 says pages are "shared out by weight; the count starts at the number
   of skills". Fix:
   - Raise the page count so every skill keeps ≥ 1 page and the held % is met (here 8 pages: 4 · 1 · 1 · 1 · 1).
   - Or say "Subtraction Word Problems gets no page: add pages" as a ⚠ line.
3. **Thumbnails do not show the real item for about 20 % of skills** (A1). The brief says "the mock-up's job is to
   show the real item readably", so this also costs fidelity.
4. **Smaller:** a whole-grade quiz says "6 areas" while Geometry gets 0 of 20 questions ("… Data 1, Geometry 0"). Say
   "5 of 6 areas", or give every area at least one question when there is room.

### D. Colour-blind safety and contrast: 8

The gate passes and its numbers are right (table above). Other cues hold:
- Chips are outlined in the area's deep and carry grade badge, icon and area word.
- Slate is dashed.
- Status uses ✕ / ⚠.
- Selected = fill + ✓ + ring everywhere.
- Colour never names a grade.

Points lost:
1. **Tray Chips view with 4+ areas carries no area word and no legend.** The legend is dropped above 3 areas, and Chips
   never show the abbreviation, so "Time to the Hour" and "Expanded Form" are told apart by colour and a 20 px icon only
   (`png/clip-lighttray.png`). §2.8 says every chip carries the area name. Fix: show the abbreviation in Chips as List
   and Thumbnails do, or keep the legend.
2. **The phone ✓ overlaps its label** (A5): the selected cue is present but illegible on the Browse pill.

## Page weight (not scored)

A cold `app.html#skills` loads 4.2 MB in 331 files uncompressed. The first screen of live thumbnails takes 7.4 s on
localhost (`thumbs-check`), and Print sheet previews show "Drawing…" for 2–5 s. T2+ should cache drawn cells per
skill and seed, or pre-render the card item.

## Defects ranked by severity

1. **(A1, C3)** About one thumbnail in five crops away its drawing: line plots, double number lines, number-line
   fractions, elapsed time, coins, 3D shapes, expressions. Crop to the drawn content's box, scaling to the minimum text
   size first. Add a drawn-area-in-window check, committed failing first.
2. **(C1)** A held % shows "Equal" in the Print sheet, and More silently removes the lock (20 → 11). Show "50 % 🔒" and
   confirm the release.
3. **(C2)** Single skill with a lock leaves a skill at 0 pages and misses the %. Add pages or warn.
4. **(A2, A3)** Detailed weights: phone headers take the whole first screen; Chips and Thumbnails rows are 102 and 322 px.
5. **(D1)** Tray Chips with 4+ areas: no area word or legend.
6. **(A4, A5, C4)** 820 big-tray bar hides "+N"; ✓ with no gap or overlapping on a phone; a whole-grade quiz claims 6
   areas with Geometry 0.

App notes, not marked down:
- `buildSheet` deals the same first item for `add_facts` and `shade_fraction` at different seeds (47275 / 603074).
- `data_analysis:statistical_question` prints its question with no choices.
- `coordinates:mixed_coordinates` prints a large blank band above its grid.

## To reach PASS

- **A → 8 and C → 8:** fix 1–3.
- **Then:** fix 4 and 5, or they will cost A and D next round.

Look at these yourself:
- Line Plots and the elapsed-time cards at Big;
- `?tray=…5 skills…&lockp=k:addition:add_facts:50#print`, then tap More;
- the same with `kind=single`;
- `?tray=demo100&detailed=1&open=all#tray` at 390.
