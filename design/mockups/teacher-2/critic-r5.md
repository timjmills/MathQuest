# Teacher site 2.0 T1 mock-up (board C): independent critic, round 5

**A 6 · B 9 · C 6 · D 8 — FAIL** (A and C are below 8)

Graded on 2026-10-23, branch `claude/sweet-newton-c8wrv1-wip-teacher-t1` at HEAD `12e98bf3`. I graded against
IMPROVEMENT_PLAN §2.1–§2.11, §4.3 (Q-M1, Q-T, Q-W) and the owner's 2026-10-23 decisions 1–7. Where they differ, the
owner decisions win. I built none of this, and I did not reuse the builder's or earlier critics' scripts. My scripts
are in the session scratchpad under `r5/`.

## How I checked it

- **Server and browser.** I served the repo root with `python3 -m http.server` and drove Chromium 1194 with Playwright.
- **Flows (`flows.cjs`).** It clicks every row of `flows.js`, 25 flows, at 1366 × 768 and at 390 × 844 (the `narrow`
  list on a phone). It uses real clicks and real typing, and always the visible match. Before each click it hit-tests
  the target, and a target that is off screen or covered counts as one scroll. At the end it reads `S.last`, the sheet,
  the kind and each flow's own `check`.
- **Tray bar (`tray.cjs`).** Trays of 1, 3, 8, 10, 40, 100 and 160 skills, in List, Chips and Thumbnails, at 1366,
  1280, 1024, 820 and 390, light and dark: 210 renders, each with a PNG. It records height, sideways scroll, clipped
  text and controls under 44 px.
- **Other probes:**
  - `overlap2.cjs` hit-tests text against controls in every sheet at five widths.
  - `small.cjs` measures controls under 44 px wide or tall on 14 screens at 1366, 1024 and 390.
  - `pct.cjs` checks the % lock, the summary, the preview counts per page, Each page and the quiz count.
  - `search.cjs` runs 14 queries in the Skills box and 3 in the tray's box.
  - `load.cjs` measures a cold load with throttling.
- **Thumbnails.**
  - I looked by eye at 48 thumbnails sampled every 15th card across all categories, plus 18 chosen for SVG content
    (`thumbs.cjs` contact sheets).
  - I compared them with the **real app's** sheet for the same skill and seed (`app-real.cjs` calls
    `window.buildSheet` in `index.html`).
  - `samples.js` was scanned for SVG `<text>` whose size the sanitiser overrides.
- **Gates.**
  - `node tests/scripts/ws-teacher-tokens.cjs` → **OK**.
  - `node design/mockups/teacher-2/thumbs-check.cjs` → **OK** (715 skills, 2,145 items, 5,720 thumbnails, samples.js
    5.81 MB).
- **Colour (`col.py`).** It reads `tokens.css`, then runs sRGB → linear → Machado 2009 (severity 1) → XYZ D65 → Lab →
  CIEDE2000, plus the WCAG ratio.

## Independent colour numbers (`tokens.css`, light)

| Check | Gate | Mine | Need |
|---|---|---|---|
| Bold vs bold, normal vision | 20.7 NBT–RPNS | 20.7 NBT–RPNS (shared grade: 21.5 NBT–MEAS) | ≥ 20 |
| Deuteranopia, shared grade / any pair | 13.0 NF–G / 8.9 | 13.0 NF–G / 8.9 MEAS–RPNS | ≥ 12 / ≥ 8 |
| Protanopia, shared grade / any pair | 12.9 CC–DATA / 9.2 | 12.9 CC–DATA / 9.2 MEAS–RPNS | ≥ 12 / ≥ 8 |
| Slate vs every area (normal / deut / prot) | 25.6 / 13.0 / 15.1 | 25.6 G / 13.0 NF / 15.1 G | ≥ 8 |
| Bold vs error red / key orange, all views | 21.9 | 26.1 / 22.0 | ≥ 20 |
| Bold vs ink (WCAG) | 2.89 OA | 2.89 OA | ≥ 2 |
| Text on bold | — | lowest slate 4.74, DATA 5.22 | ≥ 4.5 |
| Deep on page / white / its tint | — | lowest 7.02 / 8.27 / 6.83 (slate) | ≥ 7 / 4.5 |

The gate's numbers are right.

## Round 4 defects: verified

| r4 defect | Now |
|---|---|
| C1. About 35 thumbnails contradict their names | **Root cause replaced.** Thumbnails are captured app items, so the decoy class is gone. But the capture has a new defect that garbles about 120 card thumbnails (C1 below). |
| A1. Phone big-tray popup shows one skill per screen | **Fixed.** 10 rows are visible at 390 × 844 with a whole grade open, and a header is one line with "⋯". New: the detailed whole-grade rows overlap on a phone (A3). |
| B1/C2. No grade-wide How often | **Fixed.** "Grade 2 (all areas)" has Less · Equal · More, %, and Remove. The flow's check holds every grade-2 skill at More and every other skill at Equal. |
| B2. Search | **Fixed.** "2.NBT.5" → 16 skills (Basic Addition first); "within 1000" → 11, all 1,000 skills; "time" → Time to the Hour first; "fractoins" → 123, fractions first; "multiplcation", "money", "clocks", "Y3 fractions" and the tray's "3.NF.1" all work through `skill-finder.js`. |
| C3. Quiz stepper 20 vs 112 in the summary | **Fixed.** `?tray=grade3#quiz` gives n = 20 and "3 pages · 20 questions · … a sample of 20 of 110 skills · 20 points". |
| B3. Print sheet forgets its settings | Fixed by the builder's account; I did not find a regression. |
| A2. "+N more" with nothing before it | **Fixed for small trays** at 1024 and 820 (the first name stays). It **recurs for big trays at 820** (A2 below). |
| A3. Tray-bar Thumbnails without names | **Fixed.** Each mini picture now carries its name. |
| A4. Close buttons narrower than 44 px | **Fixed.** No control is under 44 × 44 on 14 screens at 1366, 1024 or 390. |
| C4/C5. Grade code drops the weights; "Equal 40 %"; "type the code" | **Fixed.** There is a weights warning and the full link; a held area reads "40 % 🔒". |
| D1/D2. Watched pairs; legend in the tray bar | **Fixed.** `palette.html` records the margins to watch, and a mixed tray names each item's area (Ops, Frac …). |

## Flows clicked (my count; every flow ended in the right state with its `check` true, and there were no console errors)

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

On a phone the first tick of the three OA skills sits under the "Tray empty" bar, so it needs one scroll. Every flow
stays within its plan.

**% arithmetic (checked):**
- Grade 3 (110 skills, 14 pages = 112 problems) with Fractions held at 40 % gives Fractions 45 of 112 = **40.2 %**.
  - The other areas share 67 problems, so 29 skills drop out.
  - The popup and the sheet say so: "a sample of 81 of 110 skills, New numbers re-deals the sample".
  - The sheet's area line reads "Fractions 45, Measure 15, Data 5, Geometry 1".
- 4 skills on 1 page (8 problems) with one skill at 50 % gives **4 · 2 · 1 · 1** (largest remainder, correct). The
  skill-50 flow's check (one skill = total / 2, the rest within 1) passes.
- Holding NF 70 % and then OA 50 % is refused in place: "⚠ Not set: NF + OA come to 120 % …".
- **Summary = preview:** the preview's per-page cell counts equal `plan().perPage` on every page I tried. That covers
  3 skills on 1 page; 3 skills on 3 pages under New problems, Same problems and Same page again; 5 skills at 50 %; and
  Grade 3 at NF 40 %.

## Scores

### A. Hierarchy: 6

What works:
- There is one ink primary per screen, above the fold at 1366, and no sideways scroll on any screen I probed.
- The grade badge is a neutral ink circle in the first slot.
- The area band, tint and edge read as one area.
- The tray bar is 61–94 px (6–11 %) for 1–160 skills at every width and in all views.
- The big-tray popup at 1366 reads area → grade → skill, with Less · Equal · More in fixed columns.
- On a phone the popup now shows 10 skill rows.
- Dark mode holds.

Points lost:
1. **About one card in six shows an unreadable picture (severe).** About 120 skills' first thumbnails have SVG text
   blown up 2–4× over their own drawing:
   - **clocks** (every clock skill: Time to the Hour, Half Hour, Put Clocks in Order …) are a pile of digits;
   - **number lines** (Addition / Multiplication / Integer number lines) are a black smear "0123456789…";
   - **graphs** (Bar Graphs "umber of child", Pictographs, Line Plots) and coordinate grids are cropped axis labels;
   - Addition Fact Families shows "14 9 5" overlapping.

   They appear on the Skills cards (`png/g1meas.png`: every Grade 1 Measurement card), on the chip-options sheet,
   where a teacher checks the skill (`png/p1366chip.png`), in the page previews (`png/prev-sus.png`, `png/each-same.png`)
   and in the builder's own delivered shot `shots/skills-search-1366-light.png`. Root cause and fix are in C1.
2. **820 big-tray bar shows "+6 areas" and nothing else.** At 820 a tray of 10 or more skills (any view, light and
   dark) shows "TRAY · GRADE 3 · 110 SKILLS · 6 AREAS ▸ [+6 areas]" with no area segment, which is r4 A2 again in its
   big-tray form (`png/tray-light-820-list-demo100.png`). Fix: when no segment fits, show the abbreviations ("Ops 38 · PV
   29 …") on a second line, or drop the "+N areas" button and let the label button open the popup. Add 820 to the
   shoot check "at least one segment visible".
3. **The phone popup with Detailed weights overlaps itself.** With Detailed weights on, the WHOLE GRADES rows lay
   Less · Equal · More over "Grade 2 (all areas) · 90 skills" (`png/pop390-det.png`; hit-test: the text sits under the
   buttons). Fix: on a phone put the grade name on its own line, or move the grade's How often behind its "⋯" as the
   area rows do.
4. **Detailed weights at 1366 still show about 4 skill rows per screen.** Each skill row is about 110 px because the
   stepper and % wrap under the name (`png/pop1366-det.png`). Weighting 100 skills here means about 25 screens (this was
   r4 A5). Fix: put the name, stepper, % and lock on one 56 px line at ≥ 1100 px.
5. **Smaller:**
   - In a one-grade tray, Chips and Thumbnails views repeat the grade badge on every item, while List correctly drops
     it (`png/pop1366-thumbs.png`, `png/pop1366-chips.png`).
   - Every card in an area band repeats the area name ("Operations & algebra") under its picture, right under that
     area's band header. That is noise on 25 cards.

### B. Steps to each goal: 9

Every flow is within its limit at both widths (table above), and the r4 B1–B3 defects are fixed. Point lost:
1. **"Same problems, new numbers" shows two identical pages.** With 3 skills on 3 pages, pages 2 and 3 show the same
   items (8 + 9, the same clocks, the same fraction), because only 3 items per skill are captured
   (`png/each-same.png`). The summary says "New numbers re-deals every page". A teacher checking the preview before a
   pre/post check sees repeats. Fix: when the captured items run out, say "(more new numbers in the PDF)" on the page
   instead of repeating, as Mixed already does with "another … problem".

### C. Fidelity to §2 and the owner decisions: 6

These are correct and verified:
- The four places, the profile menu and the bottom bar on a phone.
- The tray is always visible, with Quiz → Build from when it is empty.
- The three kinds with their own options and defaults.
- More options, Quiz options, the Share layout, and Lessons opening where the teacher was last with Next.
- Classes with its four tabs.
- Real skills with per-skill options and presets.
- Decision 2: a neutral grade badge in a fixed slot.
- Decision 3: a stone #EFECE8 page with white cards.
- Decision 4: an ink side menu, with purple only as a swatch.
- Decision 5:
  - area → grade popup and a grade-wide How often;
  - Less · Equal · More, detailed weights and the % lock with split evenly / keep proportions;
  - a refusal over 100 %;
  - whole grade / area / unit / standard bulk add.
- Decision 6: List · Chips · Thumbnails.
- Decision 7: Each page with its three choices, and "Key for all N copies".
- Search goes through the app's finder.
- `files.html` has the live-vs-branch table, and boards A and B appear only as `<img>` in `palette.html`.

Points lost:
1. **The "real items" are not the app's items for about 120 skills (severe; the r2–r4 thumbnail class, fourth round).**
   - **Cause: the sanitiser's reset.** `capture-samples.cjs` puts the reset `.smp *{font:inherit; …}` into `samples.js`
     (`MQ_SAMPLES.css`).
   - **What the reset does.** CSS beats SVG presentation attributes. So every `<text font-size="5.25">` inside a
     captured SVG is drawn at the inherited 17.3 px, unless its atom class carries its own `font-size`. The clock
     numerals' class `_ba` holds only `line-height; white-space`.
   - **The app itself is fine.** `buildSheet` for `measurement:time_1min`, `multiplication:nl_mult`, `graphs:bar_graph`
     and `coordinates:coordinates_read_all` draws clean clocks, number lines, graphs and grids (`png/realgrid.png`).
   - **Scale.** My scan of `samples.js` finds 171 skills with such text in their 3 items. For **119 skills the card's
     own item is off by more than 1.5×**: measurement 38, coordinates 16, multiplication 14, graphs 7, integers 6, and
     others.
   - **Missing drawings.** Several drawings are missing altogether at card size: Angles on a Straight Line and Around
     a Point (a dot), Solve Two-Step Equations and Factor Links – Hard (blank boxes), Line Plots (empty).
   - **Why the gates miss it.** `thumbs-check` passes because it checks that text is *at least* the minimum size and
     inside the box. Enlarged, overlapping text satisfies both.
   - **Fix:**
     - Drop `font` from the reset, or exclude `svg *` from it.
     - Have the capture write each SVG text's computed `font-size` as an inline style.
     - Re-capture.
     - Add the check that was missing: for each captured `<text>`, the rendered glyph height in the mock-up ÷ its
       height in the app sheet must be 1 ± 0.1. Also flag any thumbnail whose text boxes overlap each other.
   - Under §1.7, commit the check failing first.
2. **The crop window cuts the start of lines.** `fitOne()` centres the window horizontally
   (`x = k0 + (k2 − w)/2`), so a wide item loses its left edge:
   - every Maths Vocabulary card reads ":losed shape…" / ":wo sides…";
   - Cube Numbers loses its base ("³ = ____");
   - Count by 9s and Mixed Fraction Word Problems ("termelon. Ethan ate…") are cut mid-word.

   Fix: anchor the window at the left edge of the key part (x = k0), and fade on the right only.
3. **Smaller:** the "Same problems, new numbers" preview repeats pages (B1).

### D. Colour-blind safety and contrast: 8

The gate passes and its numbers are right (table above). Colour is never the only signal:
- area icon plus name or abbreviation on chips, tray items and segments; a legend per stack;
- slate cards dashed;
- status marked with ✕ / ⚠;
- the selected kind shown by ✓ and ring;
- dark mode legible, including the popup and the bold primary on a dark page.

Points lost:
1. **Two pairs are still close to the line.** CC–DATA 12.9 (protanopia) and NF–G 13.0 (deuteranopia) share grades 3–5
   and are within 1 of the floor. They are recorded as watched, but any further change will cross it.
2. **Some selected states use only a thicker ink border.** Each page, Less · Equal · More, the page-count quick
   buttons, List / Chips / Thumbnails and the view pills mark "selected" with only a thicker ink border: no fill and no
   ✓. The grade pills and the three kinds, by contrast, carry a ✓. This is not colour alone, but it is one weak cue and
   inconsistent with the kind cards. Fix: add the ✓, or an ink fill, to every selected segmented option.

## Page weight

`samples.js` is 6.09 MB (5.81 MB counted by `thumbs-check`) and about 0.35 MB gzipped. A cold `app.html#skills`
transfers 8.5–9.3 MB from `http.server`, which does not compress:

| Connection | Cards on screen |
|---|---|
| local | 1.1 s |
| 10 Mbps / 40 ms | 7.4 s |
| 1.6 Mbps / 150 ms | 43 s |

GitHub Pages gzips, so the real cost is far lower. Even so, T2+ should load samples per area or grade on demand rather
than all 2,145 items up front. This note is not scored.

## Defects ranked by severity

1. **(A1, C1)** About 120 card thumbnails, and the chip sheet and previews, garble the real item: clocks, number lines,
   graphs, grids. The cause is the sanitiser's `.smp *{font:inherit}`, which overrides SVG `font-size`. Fix the
   capture, re-capture, and add an app-vs-mock-up glyph-height check (stop rule: commit it failing first).
2. **(C2)** The crop window is centred, so it cuts the first letters of vocabulary, cube-number, count-by and word
   problem items. Anchor it left.
3. **(A2)** At 820, a tray bar of 10+ skills shows "+6 areas" with nothing before it.
4. **(A3)** On a phone with Detailed weights, the whole-grade rows overlap their buttons.
5. **(A4)** Detailed weights at 1366 show about 4 skill rows per screen. Make each one a single row.
6. **(B1)** The "Same problems, new numbers" preview repeats identical pages.
7. **(A5, D1, D2)** The grade badge repeats in one-grade Chips and Thumbnails; the area name repeats on every card; the
   colour margins are close to the floor; selected segmented options have only a border.

## To reach PASS

- **A → 8 and C → 8:** fix 1 and 2 (re-capture plus the new check), then 3 and 4.
- **Also:** fix 5 and 6, or they will cost A and B next round.

Before reporting, look at these yourself:
- `#skills` at Grade 1, the Measurement band;
- the chip sheet for Time to the Hour;
- Multiplication Number Line and Bar Graphs in `thumbs.html`;
- the 820 tray bar with `?tray=grade3`;
- the 390 popup with `?tray=grades2-3&detailed=1`.
