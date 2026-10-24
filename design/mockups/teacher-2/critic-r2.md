# Teacher site 2.0 T1 mock-up (board C): independent critic, round 2

**A 6 · B 9 · C 8 · D 8 — FAIL** (A is below 8)

Graded on 2026-10-23, branch `claude/sweet-newton-c8wrv1-wip-teacher-t1` at HEAD `ed3c7467`. I graded against IMPROVEMENT_PLAN
§2.1–§2.11 and §4.3 (Q-M1, Q-T1–Q-T6, Q-W1–Q-W4), with the owner's 2026-10-23 change to board C (the Awsaj look) judged
under the §2.7 rules and §2.8 thresholds. Plan text that still says "board B" is not counted as a defect.

## How I checked it

- I served the mock-up two ways: with `python3 -m http.server` from `design/mockups/teacher-2/` and again from the repo
  root. Served from the folder, `../../../css/fonts/andika.css` returns 404, so the README's repo-root instruction is the
  right one. All of my screenshots below come from the repo-root server.
- I wrote my own Playwright probe (`scratchpad/r2/probe.cjs`). It covers 25 screens and sheets at 1366, 1280, 1024, 820
  and 390, in light, plus dark at 1366 and 390. For each one it records: page scrollWidth; any control cut off by an
  ancestor that clips (`hidden` or `clip`); any control hidden in a sideways strip (`auto` or `scroll`); every
  `.btn-primary` with its y position against the fold; and every control under 44 px.
- I wrote my own flow clicker (`scratchpad/r2/flows.cjs`). It counts clicks and typed searches. It also counts one action
  whenever the target is off screen or covered (it tests the target with `elementFromPoint` before every click), then
  scrolls to it. It ran every row of `flows.js` at 1366 × 768 and 390 × 844.
- I looked at my own PNGs, and at the builder's `shots/` for 820, 1024 and 1280.
- I counted every card where the tick box overlaps the thumbnail drawing (`scratchpad/r2/ov.cjs`), and measured the
  tray chips at 1366, 1024 and 820 with 1, 3 and 6 skills (`scratchpad/r2/tray.cjs`).
- Gates: `node tests/scripts/ws-teacher-tokens.cjs` printed **OK**, and `node design/mockups/teacher-2/thumbs-check.cjs`
  printed **OK** (715 skills, 257 drawings, 50 different Maths words cards).
- I checked the colours with my own script (`scratchpad/r2/col.py`). It does not reuse `colour.py` or `colour.js`. The
  pipeline is sRGB → linear → Machado 2009 at severity 1.0 → XYZ (D65) → Lab → CIEDE2000, plus the WCAG ratio.

## Independent colour numbers (board C, `tokens.css`)

| Check | Gate | Mine | Need |
|---|---|---|---|
| Bold vs bold, normal, every pair | 20.7 NBT–RPNS | 20.7 NBT–RPNS | ≥ 20 |
| Deuteranopia, pairs that share a grade | 12.8 DATA–G | 12.8 DATA–G | ≥ 12 |
| Protanopia, pairs that share a grade | 12.3 OA–NF | 12.3 OA–NF | ≥ 12 |
| Deuteranopia / protanopia, any pair | 8.9 / 9.2 MEAS–RPNS | 8.9 / 9.2 | ≥ 8 |
| Slate vs every area (normal / deuteranopia / protanopia) | 22.8 / 9.0 / 15.0 | 22.8 DATA / 9.0 NF / 15.0 NF | ≥ 8 |
| Bold vs error red and key orange, all views | 21.9 RPNS (deuteranopia) | 21.9 RPNS–key (deuteranopia) | ≥ 20 |
| Text on bold | — | lowest is G 4.57 and DATA 4.93; OA 11.56 | ≥ 4.5 |
| Deep on cream | — | lowest is G 7.01 | ≥ 7 |
| Dark-mode light version on its dark tint | — | lowest is OA 7.02 and NF 7.04 | ≥ 7 |
| OA bold #2E2B71 vs the ink primary #1A1614 | — | **1.45 : 1**; L\* 21.9 vs 7.6 (ΔE00 26.1, almost all of it hue) | — |
| Dark mode: OA tint #15131E / OA soft / OA bold on page #0F0E0C | — | **1.05 / 1.14 / 1.56 : 1** | — |

The gate's numbers are right and every threshold holds. The thin margins (OA–NF 12.3 under protanopia, G at 4.57) are
now named in `palette.html`.

## Round 1 defects: verified

| r1 defect | Now |
|---|---|
| 1. Lessons breaks at 1024 and 820 | **Fixed.** Grade and area rows sit above the list, and the panel slides over at 820. No sideways scroll at any width. |
| 2. Lesson panel clips its buttons | **Fixed.** The probe found no clipped control at any width. |
| 3. Thumbnails show the wrong problem | **Fixed.** Find the Start now reads "Ana had some shells… How many at the start?", place-value skills draw disks or flats, and all 50 Maths words cards differ. The gate holds every skill to its name. Small slips remain (C2). |
| 4. No Save on the phone; no saved-quiz list | **Fixed.** The phone footer has Save · Share · Print, and Classes › Quizzes has "My quizzes" with Print, Share and Change. |
| 5. Phone Skills header ≈ 450 px | **Fixed.** Title and search share a row, then Browse by, then two dropdowns (Grade 2 ▾, Medium cards ▾). The first cards show at y ≈ 280. |
| 6. Generic chip options sheet | **Fixed.** It is built from the skill's own schema (for example "How the pupil answers" and "Pictures"), with the preset note and "How often it comes up". |
| 7. No visible area name on chips | **Fixed, but the fix caused A1.** |
| 8. Saturated OA violet | **Changed to #2E2B71.** It no longer shouts, but it is now nearly ink (A3). |
| 9. Tray chips capped at 200 px | **Worse** (A1). |
| 10. Sideways strips hide options | **Fixed.** The probe found no control hidden in a strip at any width or screen. |
| 11. Skills to be made on the area summary; lesson colour follows its CCSS | **Fixed.** "Skills to be made in Place value (8)" heads the list, and "Number line to 100" is Measurement · 2.MD.B.6. |
| 12. ✓ on the selected Lessons area; inline styles | **Fixed.** The gate now scans `app.js` and reports it clean. |
| 13. Small slips | **Mostly fixed.** Plurals are right, the grade chip clears during a search ("Searching all grades"), the quiz preview is titled "Quiz", and opening a set asks "Use this set instead / Add to the tray / Cancel". |

## Flows clicked (my count; every flow ends in the right state)

| Flow | 1366 | 390 | Plan |
|---|---|---|---|
| One skill + key | 4 | 4 | 4 |
| Mixed page of 3, one area list | 5 | 5 | 5–8 |
| Mixed page of 3, three areas by search | 8 | 8 | 5–8 |
| Code for one skill / set of 3 | 4 / 5 | 4 / 5 | 4 / 5–8 |
| Practice on the board | 3 | 3 | 3–4 |
| Quiz on paper / from 2.NBT.B.5 (one scroll) | 3 / 4 | 3 / 4 | 3–5 |
| Quiz online | 4 | 4 | 4–6 |
| Lesson practice, same grade / another grade and area | 4 / 6 | 4 / 6 | 4 / 6 |
| Pre-skills / detailed lesson | 4 / 4 | 4 / 4 | 4 / 4 |
| MAP task / saved set / saved quiz again | 4 / 4 / 4 | 4 / 4 / 4 | 4 / 3–4 / 3–4 |
| Change one skill's options | 1 | 2 (count bar, then chip) | 1 |

Each flow ended in the right state: the PDF toast, "Link copied", or the board. The kind chosen for you was right every
time: Mixed for 3 skills, Single for 1, and Sections with "the first time" examples from a lesson. One primary sits above
the fold at 1366 × 768 on every sheet: Print at y 530–562, Copy link at 529, Done at 679, Print lesson at 333, and Start
on the board at 423. No page scrolls sideways at 1366, 1280, 1024, 820 or 390. The one exception is the doc page
`thumbs.html` at 390, which is 419 px wide.

## Scores

### A. Hierarchy: 6

What works:
- One ink primary per screen, above the fold. Calm cream surfaces and a consistent type scale.
- A labelled four-item bottom bar, a "3 skills ▸" tray bar, and full-screen sheets with a sticky summary and Print. The
  preview is never first.
- The Lessons layout now holds at every width.

Points lost:

1. **The tray is unreadable at the Chromebook size (severe).** With 3 skills at 1366, the tray chips read **"Addi… ·
   OPERATIONS", "Sub… · OPERATIONS" and "Arra… · OPERATIONS"** (`png/skills-1366-light.png`, and the builder's
   `shots/skills-tray-1366-light.png`). With 6 skills the chips are 146 px wide. At 1024 and 820 the first chips show
   **no name at all**, and "OPERATIONS" spills past the chip's edge (`shots/skills-tray-1024-light.png` and
   `-820-light.png`).
   - Cause: `.chip-area { flex: none }` cannot shrink, so the name (`.name`, ellipsis, `min-width: 0`) collapses to zero.
     The chip does not clip its own content, and `.tray-chips .chip { flex: 1 1 120px }` packs the chips narrow.
   - Why it matters: the area word repeats the colour and icon on every chip, and it takes exactly the space that tells
     sibling skills apart. The same truncation is on Classes › Run on the board ("Addition Facts (wit…"), Progress on the
     phone ("Build a Num…"), My quizzes, and the lesson panel ("Mark a Number on a Nu…").
   - Fix:
     - Never let the area word win over the name. In the tray, show the area as the icon plus a short code, or drop the
       word below about 220 px (the icon and colour stay). Keep the full area name on the chip sheet header, the cards
       and the weights rows.
     - Let tray chips wrap to two lines, or let the tray grow a second row, before any name ellipsis.
     - Add `overflow: hidden` on `.chip`.
     - Add a shoot check that fails when any `.chip .name` has `clientWidth < 12ch`.
2. **Skills at 820 (tablet portrait, still the desktop layout) is broken (severe).** In the builder's own
   `shots/skills-tray-820-light.png`:
   - the search box shrinks to about 110 px and shows "Fin";
   - cards sit in 4 columns about 110 px wide, so titles break mid-word ("Subtractio / n Word", "Operations )");
   - the card's area label is cut by the card edge ("Operations & alge");
   - three rows of controls (Browse by on two lines, size, then grades on two lines) push the first card to y ≈ 510;
   - the tray chips are 62 px wide with no names.

   §2.9 lists 820 as a gate width, and `shoot.cjs` claims to check it, but its overflow tests miss text clipped inside
   elements. Fix: below about 1100 px, use 2–3 card columns with a `minmax(200px, 1fr)` track, and let the search box
   take a full row under the title. Or move the bottom-bar layout up to ≤ 900 px.
3. **The Operations colour now competes with the ink primary.** #2E2B71 is 1.45 : 1 against the ink #1A1614 (L\* 22 vs
   8). In the tray, OA is the first area on every grade 1–5 list, and it draws three solid near-black chips of the same
   height beside the solid black Print. The tray then reads as four dark buttons, and Print is set apart only by its
   position and icon (`png/skills-1366-light.png`). In dark mode the opposite happens: the OA tint is 1.05 : 1 on the
   page and the OA bold is 1.56 : 1, so the OA group panel, band rule and card edges vanish (`png/skills-1366-dark.png`).
   OA is the only area with no visible colour in dark mode. Fix: lift OA to a mid-value indigo (L\* ≈ 35–45, like NF
   plum at L\* 36 and 2.37 : 1 from ink), so it sits clearly between the cream and the ink, and give dark mode an OA tint
   at least 1.2 : 1 from the page. Re-run the gate, because OA–NF (12.3 under protanopia) and DATA–OA are near the line.
4. **The tick box sits on the drawing on about 19 % of cards.** At 1366, 52 of the 276 first-page cards across K–6 have
   the tick box overlapping the thumbnail's own answer box or digits (49 at 390). Examples: "Add within 10", "Next,
   Before, After Number (Visual)", "Number Families (All Four Operations)", and search results such as "4 × 3 = □"
   (`png/card-add10.png`, `png/card-bridge.png`). The tick reads as part of the problem. Fix: reserve a 32 px top-right
   gutter in `.thumb`, or put the tick outside the paper. Add the overlap test to `thumbs-check` or `shoot`.
5. **Smaller spatial slips:**
   - The weights rows in the Print sheet wrap unevenly: "Time to the Hour" has Less / Equal / More beside it, while the
     others have it below (`shots/print-parts-1366-light.png`).
   - Every segmented button (Browse by, Big / Medium, Less / Equal / More, S / M / L, Grades K–2 / 3–5) is 36 px tall,
     under the §2.8 "controls ≥ 44 px" rule. The 44 px container does not make the target 44.
   - During a search across grades the eyebrow still says "Grade 2 · 100 skills".

### B. Steps to each goal: 9

Every §2.6 flow is within its steps and actions at both widths (table above), including the two phone flows that were
over in round 1. Save is back on the phone. The defaults answer everything a default can.

Point lost: at 820 the search box is about 110 px wide (A2), so the search-led flows are impractical on a tablet in
portrait, though they are still countable. Before printing, a teacher at 1366 cannot check which skills are in the tray
without opening each chip (A1).

### C. Fidelity to §2 and the owner's decisions: 8

These are correct:
- the four places and the profile menu;
- the tray is always visible, and empty Print and Share say "Tick skills first" while Quiz opens Build from;
- the three kinds each show only their own §2.5 options, line for line, with the right defaults (one page per skill on
  Single; Mixed for 2 or more; Sections plus "the first time" from a lesson; Equal; Size M);
- the three ways to make sections, with "+ Add a section";
- the summary line, the small black-and-white Andika preview drawn from the ticked skills, and New numbers;
- Quiz offers Build from (skills, CCSS, EE, White Rose, lesson), points with the standards breakdown, How many versions
  1–6, Save, Share with pupils, and My quizzes in Classes;
- Share shows code and link together, with Copy link as primary, Show on the board, and Quick Start, lock, mode, timer
  and Google Forms under More options;
- Lessons opens where the teacher was last, marks Next, has Print lesson as primary, Practise pre-skills, Skills to be
  made on the lesson and the area summary, and colour from the lesson's own CCSS;
- Classes has its four tabs and the "on this device" note;
- grade labels are plain, teacher words only, and the skill names and per-skill options are real;
- `files.html` has the live-vs-branch table, and boards A and B appear only as `<img>`;
- the Awsaj look is clearly achieved.

Points lost:

1. **Real skill names are not readable where the tray and lists show them** (A1). The names are in the data, but at
   1366 the teacher sees "Addi…" and "Sub…".
2. **Thumbnail slips that remain:**
   - "(Visual)" skills draw no visual: "Next, Before, After Number (Visual)" shows "7, 8, □".
   - "Addition Word Problems" and "(No Pictures)" share one picture, so the picture variant shows no picture.
   - The chip sheet for Addition Word Problems shows "Pictures: On" over a text-only sample.
3. **Trivial items:**
   - The phone Quiz footer says "Share" where the desktop says "Share with pupils".
   - The chip sheet's option help text is cut off with "…" ("asks the pupil to find which numbers the question depends on
     and mark them,…").

### D. Colour-blind safety and contrast: 8

The gate passes and its numbers are right (independent table above). Chips are outlined in deep (light mode) and
#E8DFD2 (dark mode), and now carry a visible area word. Lists across grades add the grade ("OPERATIONS · G1"). Selected
cards, filters, kinds and Lessons areas use fill, ✓ and a 2 px ring. Slate is dashed and labelled. Status uses ✕ or ⚠.
In dark mode every text pair is ≥ 7.02 on its tint.

Points lost:

1. **In dark mode OA loses its colour entirely:** the tint is 1.05 : 1 and the bold 1.56 : 1 on the page (A3). The area
   name and icon still carry it, so this is not a rule break, but the "organise by colour" group is invisible for the
   most common area.
2. **At 1024 and 820 the tray chips show neither a readable name nor a clean area word**, because the word overflows
   the chip (A1). Only the icon is left to separate DATA, OA and G, which are 12.8 apart under deuteranopia.
3. **The thin margins are flagged but not widened:** OA–NF is 12.3 under protanopia (needs 12), and ink on G bold is
   4.57.

## Defects ranked by severity

1. **(A1, C1, D2) Tray and list chips truncate the skill name to nothing.** At 1366 the tray shows "Addi…" and "Sub…";
   at 1024 and 820 there is no name and the area word overflows. Shrink or drop the area word before the name, wrap the
   chips, clip `.chip`, and add a name-width check to `shoot.cjs`.
2. **(A2, B) Skills at 820 is broken:** the search box is 110 px, titles break mid-word, labels are clipped and chips have
   no names. Use 2–3 card columns and a full-width search row below about 1100 px, or move the bottom-bar breakpoint up.
   Extend the shoot checks to text clipped inside elements.
3. **(A3, D1) OA #2E2B71 is nearly ink.** It makes dark blocks beside Print in light mode and disappears in dark mode.
   Lift it to a mid-value indigo and re-run the gate.
4. **(A4) The tick box overlaps the drawing on about 19 % of cards.** Reserve a gutter and add a test.
5. **(A5) Segmented controls are 36 px, under 44.** Weights rows wrap unevenly.
6. **(C2) Thumbnail variants:** Visual and Pictures variants are drawn without visuals.
7. **(C3, A5) Trivial wording and labels:** the phone "Share" label, the cut-off help text, and the eyebrow during a
   search.

## To reach PASS

Fix 1–3 to bring A to 8. Then re-run `shoot.cjs` at 1366, 1280, 1024, 820 and 390 with a check that fails on any chip
name narrower than about 12 characters and on any text clipped inside a card, and look at the 820 and 1024 PNGs before
reporting. Fix 4–5 too, or they will cost the next round.
