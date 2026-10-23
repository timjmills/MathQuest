# Teacher site 2.0 T1 mock-up (board C): independent critic, round 4

**A 7 · B 8 · C 6 · D 8 — FAIL** (A and C are below 8)

Graded on 2026-10-23, branch `claude/sweet-newton-c8wrv1-wip-teacher-t1` at HEAD `d1628d46`. I graded against
IMPROVEMENT_PLAN §2.1–§2.11, §4.3 (Q-M1, Q-T1–Q-T6, Q-W1–Q-W4) and the owner's 2026-10-23 decisions 1–6. Where the plan
still says "board B", I did not count it as a defect. I built none of this. I did not reuse the builder's scripts or
earlier critics' scripts. My scripts are in the session scratchpad under `r4/`.

## How I checked it

- I served the repo root with `python3 -m http.server` and drove Chromium with Playwright.
- **Flows.** `flows.cjs` clicks every row of `flows.js` with real clicks and real typing at 1366 × 768 and 390 × 844,
  23 flows × 2 widths. Before each click it uses `elementFromPoint` to see whether the target is visible. If not, it
  counts one scroll. After the last click it records the end state, the toast and the flow's own `check`.
- **Layout.** `probe.cjs` covers the builder's 54 screens at 1366, 1280, 1024, 820 and 390, light, plus dark at 1366
  and 390 (364 renders). It records sideways scroll, how many primaries are visible and where they sit, ellipsis or
  clipped text, and controls under 44 px.
- **Tray.** `tray.cjs` measures the tray bar for trays of 1, 3, 7, 10, 40, 110 and 200 skills, in List, Chips and
  Thumbnails, at all five widths, light and dark (210 renders). It saves a PNG of each.
- **Weights.** `pct.cjs`, `pct3.cjs`, `persist.cjs` and `qz.cjs` drive the % lock, the summary line, the preview, the
  quiz count, and what the print sheet keeps after it is reopened.
- **Thumbnails.** `th.cjs` and `thz.cjs` take PNGs of thumbs.html, about 70 cards looked at by eye. `thname.cjs` reads
  the text of all 715 thumbnails and compares it with each skill's name.
- **Gates.** `node tests/scripts/ws-teacher-tokens.cjs` prints **OK**. `node design/mockups/teacher-2/thumbs-check.cjs`
  prints **OK** (715 skills, 258 drawings, 325 added pictures, 0 bounds problems).
- **Colour.** My own `col.py` reads `tokens.css` and runs sRGB → linear → Machado 2009 (severity 1) → XYZ D65 → Lab →
  CIEDE2000, plus the WCAG ratio.

## Independent colour numbers (`tokens.css`)

| Check | Gate | Mine | Need |
|---|---|---|---|
| Bold vs bold, normal vision | 20.7 NBT–RPNS | 20.7 NBT–RPNS; 21.5 for areas that share a grade | ≥ 20 |
| Deuteranopia, areas that share a grade / any pair | 13.0 NF–G / 8.9 | 13.0 NF–G / 8.9 MEAS–RPNS | ≥ 12 / ≥ 8 |
| Protanopia, areas that share a grade / any pair | 12.9 CC–DATA / 9.2 | 12.9 CC–DATA / 9.2 MEAS–RPNS | ≥ 12 / ≥ 8 |
| Slate vs every area (normal / deuteranopia / protanopia) | 25.6 / 13.0 / 15.1 | 25.6 G / 13.0 NF / 15.1 G | ≥ 8 |
| Bold vs error red and key orange, all views | 21.9 | 21.9 RPNS–key (deuteranopia) | ≥ 20 |
| Bold vs ink (WCAG) | 2.89 OA | 2.89 OA | ≥ 2 |
| Text on bold | — | lowest slate 4.74, DATA 5.22 | ≥ 4.5 |
| Deep on page / white / its tint | — | 7.02 / 8.27 / 6.83 (slate) | ≥ 7 / 4.5 |
| Dark tint vs dark page; dark deep on dark tint | 1.25 OA | 1.25 OA; 7.01 OA | ≥ 1.2; ≥ 7 |
| Bold vs dark page | 3.10 OA | 3.10 OA | ≥ 3 |

The gate's numbers are right. OA–NF (20.6 in r3) and slate–NF (8.8) are now clear of the line. CC–DATA (12.9) and NF–G
(13.0) remain close to it.

## Round 3 defects: verified

| r3 defect | Now |
|---|---|
| 1. The tray grows without limit | **Fixed.** The tray bar is 61–81 px (6–11 %) at every width, for 1–200 skills, in all three views. Past 8 skills it becomes the area summary bar. |
| 2. Decoy pictures | **Partly.** The add / take-away / fraction-bar decoys are gone and those pictures now match. The defect class survives, in about 35 other skills (C1 below). |
| 3. Summary ≠ preview | **Fixed** on the click path: per-page counts in the preview equal `plan().perPage`. One new mismatch on the quiz deep link (C3). |
| 4. Clipped thumbnails, `select_even_odd` | **Fixed** (thumbs-check 0 problems; `select_even_odd` draws circled numbers). |
| 5. Grade badge repeated in single-grade lists | **Fixed on Lessons** (the badge sits in the panel eyebrow and the list header). It still repeats on every row of a single-grade tray (A5). |
| 6. Area word appears and disappears | **Fixed.** The print, quiz and board stacks all carry it, or all carry a legend. |
| 7. Slate cards not dashed; values on the line | **Fixed.** |
| 8. Small slips | Fixed: the I Can goal, the help text, "last week", the search ✕ and the dark lesson header. Not fixed: "time" still ranks Times as Many first (B2). |

## Flows clicked (my count; every flow ends in the right state, and every `check` is true)

| Flow | 1366 | 390 | Plan |
|---|---|---|---|
| One skill + key / code for one skill | 4 / 4 | 4 / 4 | 4 / 4 |
| Mixed page of 3 (one list / by search) | 5 / 8 | 6 (1 scroll) / 8 | 5–8 |
| Set of 3 to pupils | 5 | 6 (1 scroll) | 5–8 |
| Board | 3 | 4 (1 scroll) | 3–4 |
| Quiz on paper / from a standard / online | 3 / 4 / 4 | 4 / 4 / 5 | 3–5 / 3–5 / 4–6 |
| Lesson practice same / other grade; pre-skills; detailed lesson | 4 / 6 / 4 / 4 | 4 / 6 / 4 / 4 | 4 / 6 / 4 / 4 |
| MAP task / saved set / saved quiz | 4 / 4 / 4 | 4 / 4 / 4 | 4 / 3–4 / 3–4 |
| Chip options | 1 | 2 | 1 (2 on a phone) |
| Whole grade on paper / share a whole grade | 3 / 3 | 3 / 3 | ≤ 4 |
| Remove a grade / one grade more often | 2 / 3 | 3 / 3 | ≤ 3 |
| Fractions 40 % / one skill at 50 % | 4 / 4 | 4 / 4 | ≤ 4 |

**% arithmetic (checked by hand):**
- 5 skills (Addition Facts, Time to the Hour, Shade the Fraction, Subtraction Facts, Identify 2D Shapes), 5 pages
  = 40 problems, Addition locked at 50 %, split evenly: **20 · 5 · 5 · 5 · 5**.
- 4 skills on 1 page (8 problems) with one at 50 %: 4 · 2 · 1 · 1 (largest remainder, correct).
- Grade 3 with Fractions at 40 %: 45 of 112 = 40.2 %.
- 64 skills with one at 50 %: 32 of 64, and the rest get 0 or 1. The summary says "a sample of 33 of 64 skills".
- In each case the popup summary, the sheet summary and the preview's per-page counts agree.

## Scores

### A. Hierarchy: 7

What works:
- The tray is fixed. The summary bar with outlined per-area segments ("Ops 38 · PV 29 · Frac 14 …") is calm and clear,
  and the gallery keeps its full height.
- One ink primary per screen, above the fold at 1366 on every sheet (Print 466–610, Copy link 531–577, Done 727).
- No sideways scroll on any screen at any width.
- The grade badge is a neutral ink circle in the first slot.
- The big-tray popup on a laptop reads well: area → grade → skill, a header row per level, and Less · Equal · More plus
  % on each.
- Dark mode holds.

Points lost:
1. **The big-tray popup on a phone cannot be scanned (severe for decision 5).** At 390 × 844 with a whole grade
   open (`png/pop390.png`):
   - In List view each skill's ✕ wraps onto its own line, so one skill takes about 105 px.
   - The area header (Less / Equal / More, then "Remove area" on its own row) and the grade header each take about
     160 px.
   - The first screen shows **one** skill under the headers, so 110 skills is about 100 screens of scrolling.
   - In Chips view the ✕ sits under the first chip and beside the second, so the rows are inconsistent.
   - Fix:
     - Put the ✕ in the row (or behind a row menu) and keep each row ≤ 56 px.
     - Put Less / Equal / More and Remove on one line, or behind the row's ▸.
     - Add a phone check: at least 6 skill rows visible with one area open.
2. **The tray bar says "+N more" with nothing before it.**
   - At 1024: "TRAY · 3 SKILLS · +3 more" and "7 skills · +7 more".
   - At 820: "1 SKILL · +1 more" for a single skill.
   - Fix: when no item fits, show "3 skills ▸" (the phone form) or the first name.
3. **Thumbnails view of the tray bar is unreadable.** It shows 60 × 30 px drawings at about 6 px type with no skill
   names (`png/traystack.png`). Fix: show the name with a small drawing, or use the chip form in the bar and keep
   thumbnails for the popup.
4. **Close buttons are squeezed under 44 px.** The probe measured the sheet's ✕:
   - preset chip sheet: 27 × 44 at 1366, 22 × 44 at 390;
   - set confirm: 39 × 44;
   - tray popup on a phone: 33–36 × 44.

   The long title shrinks the button. `shoot.cjs` reports no control under 44 px, so its check does not see this.
   Fix: `flex: none; min-width: var(--control)` on `.close`, and measure width as well as height.
5. **Smaller:**
   - In the popup the area rows' Less / Equal / More shift 7 px when the % has one digit (Data, Geometry).
   - A single-grade tray repeats the grade badge on every row under a "Grade 3" header, 110 times.
   - With Detailed weights on, about 5 rows fit at 1366 × 768: the header block is about 320 px.

### B. Steps to each goal: 8

Every counted flow is within its limit at both widths (table above). Points lost:
1. **"Make one grade come up more often" only changes one area's grade.**
   - The flow sets Operations › Grade 2 to More. Its check only tests OA grade-2 skills.
   - The GRADES row in the popup offers only Remove. There is no grade-wide How often and no grade select box.
   - So making all of Grade 2 come up more often is Expand all + six More clicks, about 8 actions.
   - Fix: add Less · Equal · More (and %) to each chip in the GRADES row, and make the flow and its check cover every
     area.
2. **Search fails its own example.**
   - The placeholder says "2.NBT.5". Typing it gives "0 skills match"; only "2.NBT.B.5" works.
   - "within 1000" finds nothing, because the names say "1,000". The tray search has the same fault.
   - "time" ranks "Times as Many" first, "money" ranks "Remainder Contexts" first, and "fractoins" finds nothing.
   - CLAUDE.md requires every search box to go through the skill finder, not label matching.
   - Fix: route both boxes through a stand-in for `skill-finder.js` (codes without the cluster letter, number
     formats, misspellings, label-first ranking).
3. **The print sheet forgets settings when it is reopened.** Set 3 pages and Examples at the top, close the sheet to
   tick one more skill, then press Print again: pages are back to 1 and Examples to None. Size is kept. The same happens
   on the way from Fine-tune in the tray back to Print. `openSheet()` resets `S.opts`. Fix: keep the chosen options and
   recompute only the defaults the teacher never touched.

### C. Fidelity to §2 and the owner decisions: 6

These are correct and verified:
- The four places, the profile menu and the bottom bar under 820.
- The tray is always visible, with Quiz → Build from when it is empty.
- The three kinds, each with only its own §2.5 options and the right defaults (Single for 1 skill, Mixed for 2+, Sections
  from a lesson).
- More options, the Quiz options (Build from, 1–6 versions, Save, Share with pupils), and the Share layout.
- Lessons opens where the teacher was last, with Next, Print lesson as primary, pre-skills and Skills to be made.
- Classes has its four tabs.
- Real skills, with per-skill options and presets.
- Decision 5:
  - the area → grade popup;
  - Less · Equal · More plus detailed weights;
  - a % lock with "split evenly" and "keep proportions";
  - locks over 100 % refused;
  - Add whole grade, whole area, unit and standard.
- Decision 6: List · Chips · Thumbnails.
- `files.html` has the live-vs-branch table, and boards A and B appear only as `<img>` in `palette.html`.

Points lost:
1. **About 35 thumbnails still contradict their skill names (severe; third round of this defect class, after r2 #6 and
   r3 C1).** `thumbs-check` passes because it only checks the *added* pictures. The base recipes are fixed drawings
   that ignore the skill. Found by `thname.cjs` and seen by eye:
   - **All 8 "Unlike Denom" skills draw like denominators** (Add Fractions (Unlike Denom): 1/5 + 2/5; Subtract:
     3/6 − 1/6; Add / Subtract Mixed Numbers (Unlike Denom): 1 1/4 + 2 2/4, which is the same as the like-denominator
     card). The `frac-add-bars` recipe always uses one denominator.
   - **All 7 "Rounding Sort: Nearest 100 … 1,000,000 / Tenth / Hundredth" draw nearest-ten sorts of 2-digit numbers**
     ("rounds to 30 · 33"). `round-sort` is one recipe.
   - **All 11 `round-nl` skills draw "→ nearest 10"**, including Round to Nearest 1,000,000 ("29 → nearest 10") and
     the Thousands / Ten Thousands / Hundred Thousands number lines.
   - **Estimate Products "79 + 80 ≈", Estimate Quotients "62 + 46 ≈", Estimate Differences "50 + 45 ≈", Is the
     Quotient Reasonable? "29 + 74 ≈"**: the `estimate` recipe is always `+`.
   - **Mode**: "2, 5, 6, 9, 11 · mode = □" is a list with no mode.
   - **Angles Around a Point (360°)** and **Missing Angle in a Right Angle (90°)** both draw the straight-line picture
     of Two Angles Sum. There is no full turn and no right angle, and the "x =" box sits across a ray.
   - **Area Model (2×2 and 2×3)** draws 8 × (30 + 5), a 1-by-2 model. The generator deals 2-digit × 2- or 3-digit.
   - **Equal Groups or Not?** draws three equal groups and "3 groups of 4 = □". The real item asks "multiply or add?"
     and deals unequal groups too.
   - **Multiplication Number Line**: "3 jumps of 2" with one jump drawn.

   Fix:
   - Make every recipe read the skill's own parameters: denominators, place, operation, angle type, grid size.
   - Extend `thumbs-check` to the base drawing:
     - a place word in the name ("nearest 100", "tenth") must match the drawing's place;
     - "unlike" needs different denominators;
     - "product / quotient / difference" needs ×, ÷ or −;
     - "mode" needs a repeat;
     - "360°" or "90°" needs that figure.
   - Under §1.7 this is the stop-rule case: make the check first and commit it failing.
2. **No How often for a whole grade** (decision 5: popup by area → grade, where skills are weighted). The weight
   exists per area and per area × grade, but not per grade, which is the teacher's main unit in a whole-grade or
   two-grade tray. See B1.
3. **The delivered quiz screenshot contradicts itself.** `shots/quiz-grade-1366-light.png` (and the screen at
   `?tray=grade3#quiz`) shows How many questions **20** beside "14 pages · **112** questions · 112 points". `S.quiz.n`
   is set only on the click path. The owner sees this PNG in `index.html`. Fix: set `quiz.n` in the hash entry too, and
   add a shoot check that the stepper equals the summary.
4. **The whole-grade share code drops the weights.** Lock Fractions at 40 %, press Share, and the code is still
   "G3-ALL · the whole set in one short code", so pupils get Equal. Fix: show the weights in the token ("G3-ALL·NF40")
   or warn that the code carries no weights and offer the link.
5. **Smaller:**
   - The sheet's area table says "Fractions … **Equal** 40 %" while Fractions is locked at 40 %. Say "Held at 40 %"
     with the lock icon.
   - The share text says "Pupils … type the code" under a 159-character code it has just called too long to type.
   - The tray search matches labels only.

### D. Colour-blind safety and contrast: 8

The gate passes and its numbers are right (table above). Colour is never the only signal:
- area icons everywhere, area names or a legend per stack, and outlined area segments in the summary bar;
- the slate dashes, and status marked with ✕ or ⚠;
- selected cards and kinds shown by fill, ✓ and ring;
- dark mode is legible, with the lesson header fixed.

Points lost:
1. **Close to the line.** CC–DATA at 12.9 (protanopia) and NF–G at 13.0 (deuteranopia) are within 1 of the floor, and
   these pairs share grades 3–5. Record them as watched pairs in `palette.html`.
2. **Area shown by icon and colour alone.** In the tray bar's List view, items of different areas show only an icon
   and an area-coloured underline. Area names appear only when the tray holds a single area, and there is no grade
   badge. The rule is name, or a legend, per stack. Add the area legend for mixed trays as the sheets do.

## Defects ranked by severity

1. **(C1)** About 35 thumbnails contradict their names: unlike denominators, rounding place, estimate operation, mode,
   angle type, area-model size, equal groups. The base recipes ignore the skill. Make `thumbs-check` hold the base
   drawing to the name first, commit it failing, then fix it (stop rule, §1.7).
2. **(A1)** The phone big-tray popup shows one skill per screen (the ✕ wraps, headers about 160 px each). Rows ≤ 56 px;
   add a phone check of at least 6 rows visible.
3. **(B1, C2)** No grade-wide How often or % in the popup. The "one grade more often" flow changes only one area's
   grade.
4. **(B2)** Search: the placeholder's own example "2.NBT.5" finds 0; "within 1000" finds 0; ranking is loose; tray
   search is label-only.
5. **(C3)** The delivered `quiz-grade` shot shows 20 in the stepper beside 112 in the summary.
6. **(B3)** The print sheet loses pages and examples every time it is reopened.
7. **(A2–A4)** "+N more" with nothing shown at 1024 and 820. Tray-bar Thumbnails without names. Close buttons 22–39 px
   wide, which `shoot.cjs` misses.
8. **(C4, C5, A5, D1, D2)** The grade code drops weights; "Equal 40 %"; "type the code"; popup column misalignment; the
   grade badge repeated on a single-grade tray; watched colour pairs; the tray-bar List has no area legend.

## To reach PASS

- **C → 8:** fix 1 (all ~35 thumbnails plus the extended check), 3 and 5.
- **A → 8:** fix 2 and 7.
- Also fix 3, 4 and 6, or they will cost B and C again.

Before reporting, look at these yourself:
- the 390 tray popup with a whole grade open;
- the 1024 tray bar with 3 skills;
- thumbs.html, the rounding, estimate and fraction_operations rows.
