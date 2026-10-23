# Teacher site 2.0 T1 mock-up (board C): independent critic, round 3

**A 7 · B 9 · C 7 · D 8 — FAIL** (A and C are below 8)

Graded on 2026-10-23, branch `claude/sweet-newton-c8wrv1-wip-teacher-t1` at HEAD `2dda5db1`. I graded against IMPROVEMENT_PLAN
§2.1–§2.11 and §4.3 (Q-M1, Q-T1–Q-T6, Q-W1–Q-W4), plus the owner's 2026-10-23 decisions: board C (the Awsaj look) under the
§2.7 rules and §2.8 thresholds, a grade badge that is not a second colour code, and a warm stone page (#EFECE8) with white
cards. Plan text that still says "board B" is not counted as a defect. I built none of this and did not reuse the builder's
scripts or the round 2 critic's scripts. My own scripts are in the session scratchpad under `r3/`.

## How I checked it

- I served the repo root with `python3 -m http.server` and drove Chromium with Playwright.
- **Flows.** `flows.cjs` clicks every row of `flows.js` with real mouse clicks at 1366 × 768 and 390 × 844. Before each
  click it tests the target with `elementFromPoint`. If the target is off screen or covered, it adds one action and
  scrolls to it. It records the end state and the toast, and saves a PNG of each end screen.
- **Layout.** `probe.cjs` covers 24 screens and sheets (all four Browse-by views, search, every sheet, every Classes tab,
  the profile menu and the board) at 1366, 1280, 1024, 820 and 390. For each one it records:
  - page scrollWidth;
  - text clipped or ellipsized;
  - a control cut off by an ancestor that clips or scrolls;
  - a child spilling out of a chip, card or badge;
  - controls under 44 px;
  - where each primary button sits.
- **Tray.** `tray.cjs` measures tray height with 1, 3, 6 and 10 skills at 1366 × 768, 1280 × 800, 1024 × 768 and
  820 × 1180.
- **Thumbnails.** `thov2.cjs` and `wp.cjs` render all 715 thumbnails. They flag drawing outside the viewBox and text
  partly covered by a box, and they list skills whose picture is the generic add-on from `withPicture()`. `th.cjs`
  renders chosen thumbnails so I could look at them myself.
- **Preview.** `wt.cjs` checks whether the preview follows the Less / Equal / More weights.
- I looked at about 50 of my own PNGs: light and dark, 1366 / 1280 / 1024 / 820 / 390, and trays with 1, 3, 6 and 10
  skills.
- **Gates.** `node tests/scripts/ws-teacher-tokens.cjs` prints **OK**. `node design/mockups/teacher-2/thumbs-check.cjs`
  prints **OK** (715 skills, 257 drawings, 50 different Maths words cards).
- **Colour.** My own `col.py` reads `tokens.css` and runs sRGB → linear → Machado 2009 (severity 1.0) → XYZ D65 → Lab →
  CIEDE2000, plus the WCAG ratio.

## Independent colour numbers (board C, `tokens.css`)

| Check | Gate | Mine | Need |
|---|---|---|---|
| Bold vs bold, normal vision, every pair | 20.6 OA–NF | 20.6 OA–NF | ≥ 20 |
| Deuteranopia, areas that share a grade | 13.0 NF–G | 13.0 NF–G | ≥ 12 |
| Protanopia, areas that share a grade | 12.9 CC–DATA | 12.9 CC–DATA | ≥ 12 |
| Deuteranopia / protanopia, any pair | 8.9 / 9.2 MEAS–RPNS | 8.9 / 9.2 | ≥ 8 |
| Slate vs every area (normal / deuteranopia / protanopia) | 20.7 / 8.8 / 13.7 | 20.7 / 8.8 / 13.7 (all NF) | ≥ 8 |
| Bold vs error red and key orange, all views | 21.9 RPNS (deuteranopia) | 21.9 RPNS–key (deuteranopia) | ≥ 20 |
| Bold vs the ink primary (WCAG) | 2.97 NF | 2.97 NF; OA is now 3.6 (it was 1.45) | ≥ 2 |
| Text on bold | — | lowest slate 4.86, DATA 5.22, G 5.26 | ≥ 4.5 |
| Deep on the stone page / on white / on its tint | — | lowest 7.01 / 8.25 / 6.82 (all slate) | ≥ 7 / 4.5 |
| Dark tint on the dark page | 1.20 OA | 1.20 OA and NF | ≥ 1.2 |
| Dark light-version on its dark tint | — | lowest NF 7.01 | ≥ 7 |

The gate's numbers are right and every threshold holds. Three of them sit on the line: OA–NF 20.6, slate–NF 8.8 under
deuteranopia, and the OA and NF dark tints at 1.20.

## Round 2 defects: verified

| r2 defect | Now |
|---|---|
| 1. Tray chips cut names to nothing | **Fixed:** every name is whole at every width. The fix lets the tray grow without a limit, though, and that is the new top defect (A1). |
| 2. Skills at 820 broken | **Fixed.** The search box has its own full row, cards sit in two columns, and nothing is clipped at 820 or 1024. |
| 3. OA nearly ink; OA gone in dark mode | **Fixed.** OA is #555BAE (3.6 : 1 from ink). In dark mode the OA group panel and band show. |
| 4. Tick box on the drawing | **Fixed.** The tick sits in the title row, clear of the thumbnail. |
| 5. 36 px segmented controls; weights rows uneven | **Fixed.** My probe found no control under 44 px on any screen at any width, and the weights rows line up. |
| 6. Visual / Pictures variants without pictures | **"Fixed" in a way that fails the teacher** (C1). The picture variants now carry a generic picture that does not match the problem. |
| 7. Phone "Share"; help text cut off; search eyebrow | **Fixed.** The phone footer says "Share with pupils", the help text is whole, and the eyebrow says "All grades · 89 skills match". |

## Flows clicked (my count; every flow ends in the right state)

| Flow | 1366 | 390 | Plan |
|---|---|---|---|
| One skill + key | 4 | 4 | 4 |
| Mixed page of 3, one area list / three areas by search | 5 / 8 | 5 / 8 | 5–8 |
| Code for one skill / set of 3 | 4 / 5 | 4 / 5 | 4 / 5–8 |
| Practice on the board | 3 | 3 | 3–4 |
| Quiz on paper / from 2.NBT.B.5 (one scroll) | 3 / 4 | 3 / 4 | 3–5 |
| Quiz online | 4 | 4 | 4–6 |
| Lesson practice, same grade / another grade and area | 4 / 6 | 4 / 6 | 4 / 6 |
| Pre-skills / detailed lesson | 4 / 4 | 4 / 4 | 4 / 4 |
| MAP task / saved set / saved quiz again | 4 / 4 / 4 | 4 / 4 / 4 | 4 / 3–4 / 3–4 |
| Change one skill's options | 1 | 2 (tray bar, then chip) | 1 |

The kind chosen for you was right every time: Single for 1 skill, Mixed for 2 or more, and Sections plus "the first time"
examples from a lesson. The toast was right every time: the PDF, "Link copied", or the board.

At 1366 × 768 one primary sits above the fold on every sheet:

| Sheet | Primary | Bottom edge (y) |
|---|---|---|
| Print | Print | 578–594 |
| Share | Copy link | 577 |
| Quiz share | Copy link | 549 |
| Chip options | Done | 727 |
| Lesson panel | Print lesson | 409 |
| Classes › Run on the board | Start on the board | 471 |
| Classes › MAP tests | Start the MAP test | 417 |

No page scrolls sideways at any of the five widths, the doc pages included. No text is clipped, ellipsized or spilling
on any app screen.

## Scores

### A. Hierarchy: 7

What works:
- A calm warm-stone page and white cards, with one ink primary per screen.
- One type scale: heavy grotesque titles, an italic serif line, and mono eyebrows.
- 44 px controls throughout.
- Skills holds at 820 and 1024. The phone has a labelled bottom bar, a "3 skills ▸" tray bar, and full-screen sheets
  with a sticky summary and Print.
- The grade badge is the same ink circle in the same first slot on cards, chips and rows. It is never area-coloured and
  reads at 12 px or more.

Points lost:

1. **The tray grows without limit and eats the gallery at Chromebook size (severe).**

   | Skills in the tray | 1366 × 768 | 1280 × 800 | 1024 × 768 |
   |---|---|---|---|
   | 1 | 88 px | — | 142 px |
   | 3 | 138 px | — | 194 px |
   | 6 | 190 px | 242 px | 246 px (32 %) |
   | 10 | 346 px (45 %) | 398 px (50 %) | — |

   - With 10 skills at 1366 the gallery shows less than one row of cards. The teacher cannot see what she is adding
     while she adds it (`r3/png/t10-1366.png`, `t6-1024.png`).
   - The area legends land in the middle of chip rows ("MEASURE" after an Operations chip), so the grouping reads
     unevenly.
   - At 1024 even one skill gives a 142 px tray, because the chips and the buttons stack.
   - The owner has since asked for trays of 40–100 skills (status line in `design/status/teacher-t1.md`), which this
     layout cannot hold at all.
   - Fix:
     - Cap the desktop tray at one chip row (about 64 px, plus the buttons).
     - Past what fits, show a summary bar: count, per-area segments with name and icon, and "Show all ▸". It opens the
       tray sheet grouped by area, as on the phone.
     - Add a shoot check: tray height ≤ 120 px at 1366 × 768 and 1024 × 768 for 1–100 skills.
2. **The grade badge adds clutter where the grade is already known.**
   - On Lessons every row is "② [1] Represent numbers…", "② [2] Partition…": a round grade number right beside a square
     step number. In a list that is all one grade, two numbers side by side read as "2 1", "2 2"… and the step number is
     what the teacher scans for.
   - The lesson panel puts the badge alone on its own row above "GRADE 2 · WHITE ROSE YEAR 3 …", which says the grade
     again. The chip sheet header says the grade three times.
   - Fix: inside a list filtered to one grade, show the grade once in the list header. Keep the per-row badge for lists
     across grades (search, Mixed levels, a tray or set with two grades), where it does help scanning. In the panel,
     put the badge inline with the eyebrow and drop the word "Grade" there.
3. **The area word appears and disappears from chip to chip in the same stack.** Under the "the word drops before the
   name is cut" rule:
   - Classes › Run on the board: "Addition Facts (within 20)" has no area word and "Time to the Hour | MEASURE" has one.
   - The phone Print and Quiz sheets: "Subtraction Word Problems" has no area word, but the chips around it do.
   - The phone tray sheet: rows 2 and 6 have no area word.

   It looks random in a vertical stack where width is not the limit. Fix: decide the area word per container. All
   chips in one stack show it, or none do and the stack carries a legend.
4. **Smaller slips:**
   - During a search across all grades, "✓ Grade 2" stays pressed under an eyebrow that says "All grades".
   - The native Chromium search-cancel ✕ is blue: a non-area hue on a control, under 44 px. Style it as an ink 44 px
     button.
   - In dark mode the lesson panel's header is a light mint (bold) block beside the cream primary. It is the brightest
     thing on the screen and pulls the eye from Print lesson.

### B. Steps to each goal: 9

Every §2.6 flow is within its steps and actions at both widths (table above). The defaults answer everything a default
can, and the phone keeps Save · Share with pupils · Print.

Point lost: once a teacher has 6 or more skills, browsing for the next one is a scroll in a strip of about 300 px (A1).
Search ranking is also loose: "time" puts "Times as Many" before Time to the Hour. Neither raises a counted flow above
its limit, but both slow the real task.

### C. Fidelity to §2 and the owner decisions: 7

Correct:
- the four places and the profile menu;
- the tray is always visible: empty Print and Share say "Tick skills first", and Quiz opens Build from;
- the three kinds, each with only its own §2.5 options line for line (Single: four example choices, Fade
  problems / page / packet, Layout; Sections: five example choices, the three ways to make sections, Faded problems;
  Mixed: three example choices, Bring back earlier skills) and the right defaults;
- More options holds prerequisite skills, header, key placement and style, number line and columns;
- Quiz has Build from (skills, CCSS, EE, White Rose, lesson), points with a standards breakdown, How many versions 1–6,
  Save, Share with pupils, and My quizzes in Classes;
- Share shows code and link together, Copy link is primary, Show on the board is second, and the Quick Start link,
  lock, mode, timer and Google Forms are under More options;
- Lessons opens where the teacher was last, marks Next, has Print lesson as primary, Practise pre-skills, Skills to be
  made on the lesson and on the area, and colours each lesson by its own CCSS ("Number line to 100" is Measurement);
- Classes has its four tabs and the "on this device" note;
- grade labels are plain, and the skill names and per-skill options are real;
- `files.html` has the live-vs-branch table, and boards A and B appear only as `<img>` in `palette.html`;
- the Awsaj look and the warm stone page are clearly there.

Points lost:

1. **The "pictures" added in fix round 2 do not match the problems (severe; it passes `thumbs-check`).**
   - `withPicture()` puts the same generic picture beside 60 skills:
     - 43 skills get a row of counters. The count is the first number in the problem, capped at 10, and the counters
       alternate grey and white for no reason.
     - 17 skills get a fixed ¾ bar, whatever the fraction.
   - What a teacher sees:
     - "Count Sides & Vertices (Visual)": a square with **5** counters beside "corners □".
     - "Identify 2D Shapes (Visual)": a rectangle plus 5 counters.
     - "Round Decimals (Visual)": "2.23 → nearest tenth" beside a ¾ fraction bar.
     - "Mixed ↔ Improper (Visual Pizza)": 13/5 with a ¾ bar and no pizza.
     - "Fraction Word Problems": 2/8 + 3/8 with a ¾ bar.
     - "Subtraction Word Problems (within 100)": 94 − 65 with 10 counters.
     - "Odd or Even? 39": 10 counters.
     - "Tape Diagrams": counters added beside a tape that is already a picture.
     - Every addition and subtraction word problem, "Ana has 7 shells. She finds 8 more.", shows 7 half-grey counters
       and nothing for the 8.
   - This is the gallery's main signal for ELL/SPED teachers choosing a skill, and it is the same drawing as the
     B&W preview and the board. Grey with no meaning also breaks the single-grey rule of the worksheet standard.
   - Fix:
     - Draw the picture from the problem's own numbers: two groups for a + b, crossed-out counters for take-away, a
       bar split into the problem's denominator, a pizza for "Visual Pizza", none for shapes or rounding.
     - Where the mock-up cannot draw the real visual, show the plain drawing and label it "picture shown on the page"
       instead of a decoy.
     - Make `thumbs-check` compare the picture's count and parts with the numbers in the text.
2. **Thumbnails clipped or overlapping.** Each was seen in a PNG:
   - "Identify Fractions (No Visuals)": the fraction box covers the word "parts". This is the new `PLAIN_DRAW` frac-bar,
     where the box sits at x = 150 over 18 px text.
   - "Fraction of a Set (Visual)", "Identify Fractions (Visual)" and "Fractions on Number Line": the denominator box is
     cut off at the bottom.
   - "Lines of Symmetry": "symmetry?" runs into its answer box.
   - "Volume (Rectangular Prisms)": "4 cm" is cut off.
   - "Circle the Even or Odd Numbers (MAP)" (`select_even_odd`) shows a number bond and base-ten blocks, because
     `/odd_even/` misses its id.

   Fix: add a bounds check and a text-versus-box overlap check for every thumbnail to `thumbs-check`, and match
   `select_even_odd`.
3. **The summary line and the preview disagree, and the preview ignores the weights.**
   - With 3 skills at Equal, the summary says "Addition Facts 2, Time to the Hour 3, Shade the Fraction 3". The preview
     page has 3 additions, 3 clocks and 2 shading problems.
   - Set Addition to More: the summary says 4 / 2 / 2, and the preview stays 3 / 3 / 2. `previewHTML` deals an equal pool
     and never reads `plan().counts`.
   - The Quiz sheet has the same fault (summary 2 / 3 / 3, preview 3 / 3 / 2), and it repeats one item ("Ana has 18
     shells. She gives 9 away.") on one page.
   - §2.5 and the `-preview` gate require the summary to match the pages. Fix: deal the preview from `plan().counts`.
4. **Words:**
   - The Single-skill title is "I can addition facts (within 20)" and the lesson preview says "I can number line to 100".
     The I Can title should be the skill's goal ("I can add within 20").
   - The chip sheet's help text is developer wording: "One choice per page: a page never mixes it with solving, because
     the instruction and the answer key can only say one thing", 11 lines at 12 px.
   - "saved Last week" has a capital L.

### D. Colour-blind safety and contrast: 8

The gate passes and its numbers are right (table above). Colour is never the only signal: every chip and card has the
area icon, and the area name or a legend. Chips are outlined, dashed for Mixed, Words and No standard. Selected cards,
kinds, filters and Lessons areas use fill, ✓ and a 2 px ring. Status uses ✕ or ⚠. Dark mode is legible, and OA now shows.

Points lost:
1. Three checks pass only on the line (OA–NF 20.6, slate–NF 8.8 under deuteranopia, dark tints 1.20). A later colour
   tweak will fail them without warning. Widen OA–NF or record it as a watched pair in `palette.html`.
2. Slate **cards** have a solid slate edge. Only the group band, its icon and slate chips are dashed, so on a card the
   dashed signal that tells slate from a muted area is missing. The "Words" label is still there.
3. When the area word drops from a chip (A3), only the icon is left on chips whose bolds sit 12.9–13.0 apart under
   colour-blind simulation (CC–DATA, NF–G).

## Defects ranked by severity

1. **(A1, B)** The tray has no height limit: 25–32 % of the screen at 6 skills and 45–50 % at 10 on 1366 / 1280 / 1024.
   It cannot hold the owner's 40–100 skill tray. Cap it to one row plus a summary bar, open the grouped tray sheet, and
   add a height check.
2. **(C1)** The generic decoy pictures on 60 skills (counters and a fixed ¾ bar) contradict the problems. Draw them from
   the problem's numbers, or show none, and make `thumbs-check` compare the picture with the text.
3. **(C3)** The summary counts and the preview disagree, and the preview ignores Less / Equal / More. Deal the preview
   from `plan().counts`.
4. **(C2)** Clipped and overlapping thumbnails, and the wrong drawing for `select_even_odd`. Add bounds and overlap checks
   to `thumbs-check`.
5. **(A2)** The grade badge repeats inside single-grade lists and sits beside the step number. Show it per row only
   across grades.
6. **(A3, D3)** The area word appears and disappears inside one stack of chips. Decide it per container.
7. **(D1, D2)** Margins on the line; slate cards not dashed.
8. **(A4, C4)** Small slips: "✓ Grade 2" during an all-grades search, the blue native search ✕, the dark-mode lesson
   header, "I can addition facts", the developer help text, "Last week".

## To reach PASS

Fix 1 to bring A to 8, and fix 2 and 3 to bring C to 8. Then re-run `shoot.cjs` with three new checks:
- tray height for 1, 6, 10 and 40 skills;
- every thumbnail inside its viewBox, with no text partly under a box;
- the preview's per-skill counts equal to the summary's.

Look at the 1024 and 1366 tray PNGs and a page of "(Visual)" thumbnails before reporting. Fix 5 and 6 too, or they
will cost the next round.
