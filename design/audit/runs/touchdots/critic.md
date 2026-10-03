# Touch numerals, round 1: independent critic verdict

Critic: Opus 5.5, medium effort. Commit graded: `5ea98c4`, worktree `agent-a4f5e3d5dbe19dc18`. Date: 2026-10-03.

## Verdict: FAIL

The double marks on 6, 7, 8 and 9 cannot be counted reliably. The "solid dot inside a ring" has
no visible dot: the inner dot is 0.10 em across and sits on a stroke that is 0.08 to 0.095 em
wide (0.08 to 0.13 em in Bold), so it disappears into the stroke. What remains is a hairline ring
(0.18 mm on paper, 0.8 px on screen) round a piece of stroke. The S1 gate
`node tests/scripts/ws-touchdots.cjs` **FAILS 116 of 2289 checks**. The builder did not report
that gate. RUBRIC §1 says a version that fails an automated gate is already a fail. The singles
(1 to 5) are placed and sized well, and layout registration holds (0 moved; the layout check is
identical). The doubles are the defect the owner will see first, and after a photocopy they turn
into blobs that look the same as singles.

## What I ran (all browser runs one at a time, through `/tmp/mq-browser-run.sh`)

| Check | Result |
|---|---|
| `ws-touchdots-specimen.cjs` | OK, 90 pairs, 0 moved |
| `ws-touchdots.cjs --verbose` (the S1 gate, SUPPORTS.md §S1.10) | **FAIL 116 / 2289**: 60 `merge` (singles closer than 0.6 × dot), 56 `photocopy` (every double of 6 to 9, both weights, 24 and 28 pt: gap-white 0 to 26 %, the gate needs ≥ 50 %) |
| `ws-grade-render` add_facts + add_column_multi, `--supports touchall`, L, 300 dpi | renders; page fits (12 per page and 6 per page) |
| `ws-grade-render` same skills, `--supports touch`, S, 300 dpi | renders; S pages draw touch cells at 28 pt (measured: the plain 9 is 7.28 mm tall, which means 28 pt) |
| `ws-support-ladder --skills add_facts,subtract,mult_facts,div_facts --shots` | OK on every host at 1280 and 390 |
| `ws-print-lint --source kit --skills addition:add_column_multi` (S with touchall, and plain) | OK, 0 findings |
| Critic probe (`scratchpad/touch-critic/probe.cjs`): 0 to 9 at 24 / 28 pt at 300 dpi, Bold, trace, photocopy; 40 / 48 / 56 px at DPR 1 and DPR 2 | images viewed zoomed; findings below |

## Score table

| Version | C1 | C2 | C3 | C4 | Caps | Pass |
|---|---|---|---|---|---|---|
| Print · Independent L · add_facts (pupil + key) | 6 | 5 | 8 | 6 | gate fail | no |
| Print · Independent L · add_column_multi (pupil + key) | 6 | 5 | 8 | 6 | gate fail | no |
| Print · Independent S (touch cells raised to L) · both skills | 6 | 5 | 8 | 6 | gate fail | no |
| Screen · practice card 390 | 5 | 5 | 8 | 7 | — | no |
| Screen · practice card 820 | 5 | 5 | 8 | 7 | — | no |
| Screen · practice card 1280 | 5 | 5 | 8 | 7 | — | no |
| Screen · online worksheet 1280 (and 390 ladder) | 5 | 5 | 6 | 7 | — | no |
| Screen · quiz 1280 (instant ladder) | 5 | 5 | 8 | 7 | — | no |

## Defects

1. **Critical · C1 −2, C2 −3 · every host.** **The double's centre dot is invisible, so a double reads as a halo, not as a dot in a ring.**
   - **Where:** `js/modules/sheet/touchdots.js` `TOUCH_DOT_SIZES.M = {dot 0.18, ring 0.19, inner 0.10, rw 0.02}`; `touchDotGeometry`. Evidence: `scratchpad/touch-critic/p24-69.png` and `S-item-o.png` (8 + 8, 28 pt, 300 dpi).
   - **Measured:** the stroke half-widths at the double points are 39 to 47 / 1000 em in Regular (`touch-glyphs.js` `half`) and 47 to 64 in Bold. The inner dot's radius is 50. So the dot reaches only 3 to 11 / 1000 em past the stroke (0.03 to 0.09 mm at 24 pt), and in Bold none of it shows. The ring line is 0.18 mm at 24 pt and 0.8 px at 40 px. At DPR 1 (`dpr1-x2.png`, and the builder's own `ladder-…-card-wrong1-390.png`) the rings render as grey anti-alias haze, and the 6 in "7 + 6" looks like a plain 6.
   - **Fix:** go back to the owner-approved double geometry (`git show HEAD~1:js/modules/sheet/touchdots.js`, SUPPORTS §S1.1 rulings 9 and 10):
     - ring 0.23 em;
     - ring line 0.03 em, with floors of ≥ 0.25 mm on paper and ≥ 1.5 px on screen;
     - the white keyline `ck` round the centre dot, ≥ 0.26 mm and ≥ 1.5 px, so the dot is parted from the stroke and reads as a dot.
     Keep the new glyph-snapped positions. The 2026-10-03 coordinator note "the stroke stays whole" cannot override owner rulings 9 and 10. If the owner now wants no keyline, the centre dot must be made ≥ stroke width + 0.06 em (≈ 0.16 em) so it visibly bulges past the stroke, and the ring grows to keep the gap.
   - **Proof:** `ws-touchdots.cjs` prints `ws-touchdots: OK`. A re-shot specimen at 300 dpi (24 pt) and at DPR 1 (40 px) shows, in every double, a black dot standing clear of the stroke inside a ring that reads at arm's length.

2. **Critical · C2 −2, C4 −2 · print.** **After a copy, every double blobs into a mark that looks like a single, so an 8 is counted as 4.**
   - **Where:** the S1 gate `photocopy` block (`tests/scripts/ws-touchdots.cjs` lines 200 to 232). Evidence: `scratchpad/touch-critic/gate-verbose.log`, lines `copy 6..9`.
   - **Measured:** gap-white is 0 to 26 % on all 56 doubles (24 and 28 pt, Regular and Bold); ≥ 50 % is required. The ring gap is 0.23 mm at 24 pt, and the stroke runs through it, so the gap is black wherever the stroke crosses it.
   - **Fix:** the same as defect 1. The keyline and the 0.3 mm gap floor (`TOUCH_DOT_FLOOR_MM` before this commit: `gap 0.3, rw 0.25, ck 0.26`) are exactly what this check measures.
   - **Proof:** 0 `photocopy:` lines in `ws-touchdots.cjs --verbose`, plus the owner's M-COPY copier check (WDS INK-23) on one printed specimen.

3. **Major · C4 −1, C2 −1 · all hosts.** **Singles are closer than the gate allows (60 `merge` failures).**
   - **Measured:** 5 (Regular) marks 2 and 3 are 0.085 em apart against 0.108 required; 4 marks 3 and 4 are 0.093 em apart; 3 marks 1 and 2 are 0.102 em apart; 5 (Bold) marks 2 and 3 are 0.055 em apart.
   - **Cause:** the generator's snap (`tests/scripts/ws-touch-glyphs.py`, `score = dd − 0.6·dist`) pulled marks together. For example, the 5's foot-of-down-stroke moved from y = 0.030 to 0.015, and the dot grew from 0.17 to 0.18 em.
   - **Fix:**
     - set the single dot to 0.16 em, which needs a 0.096 em gap; all Regular pairs then pass (5: 0.105, 4: 0.113, 3: 0.122);
     - add a pairwise constraint in `ws-touch-glyphs.py` that rejects a snap leaving two mark edges under 0.6 × the smaller counted dot;
     - re-snap Bold 5 marks 2 and 3 apart (the foot to y ≥ 0.05).
   - **Proof:** 0 `merge:` lines in the gate.

4. **Major · C2 −1, C1 −1 · card, worksheet, quiz.** **The ladder message does not say how to use the dots, which is the cause of the owner's "missing on the 8" report.**
   - **Where:** `js/modules/support-ladder.js` `NAMES` (`touch` and `touchall` both read "the touch dots") and `messageFor`. Evidence: the `ladder-*-wrong1-*.png` files.
   - **Observed:** "7 + 6": 7 plain, 6 dotted, with "Use the touch dots". "11 − 3", "9 × 3" and "45 ÷ 9" get the same sentence. On the count-on rung the larger number is plain on purpose, and nothing tells the pupil (or the owner) to say it.
   - **Fix:** messages built from the item:
     - `touch` with +: "Say 7. Touch the dots on 6 and count on."
     - with −: "Say 11. Touch the dots on 3 and count back."
     - with ×: "Count by 9s. Touch a dot on 3 for each count."
     - with ÷: "Count by 9s. Touch one dot for each count."
     - `touchall`: "Touch and count all the dots."
     - Each message ≤ 12 words, and never the answer.
   - **Proof:** `ws-support-ladder --shots` shows these strings. A providers or ladder unit check asserts that the message names the larger addend (count on), the minuend (count back) or the table number (×), and never `q.ans`.

5. **Major · C3 −2 · online worksheet.** **The problem changes size twice as the ladder climbs.**
   - **Where:** `css/screen-cell.css:1622` `.mq-scell.mq-grid-cell:has(.ws-tn) { --mq-digit: 40px; }`.
   - **Measured:** the "7" cap height is 28 px on rung 1 (touch, `ladder-addition-add_facts-worksheet-wrong1-1280.png`) and 21 px on rung 2 (dot tiles, `…-wrong2-1280.png`). It was 29 px before the first wrong answer. The stack jumps 29 → 40 → 29 px.
   - **Fix:** raise the cell once and keep it raised. Mark the cell `data-mq-touch-floor` when the ladder first draws touch numerals, and key the 40 px rule on that attribute. Better still, key it on the item's skill declaring `touch` or `touchall`, so the cell starts at 40 px and never moves. Keep it additive CSS.
   - **Proof:** in the three worksheet ladder shots the operand cap height is equal (±1 px). The same check runs for `--cover fade`, where touch and plain cells share one grid, with every card's digit size equal.

6. **Major · C4 −1, C2 −1 · print, photocopy-safe sheets.** **The trace and photocopy variants are unused, and the photocopy form breaks the standard.**
   - **Where:** `touchdots.js` `touchDotsMarks`. Hosts always call `touchOpts(…, 'solid')`, and no caller passes `photocopy` (grep: no `photocopy` in `fact.js`, `stack.js` or `support-draw.js` for touch). A Photocopy-safe sheet therefore prints solid marks that fail defect 2.
   - **Observed** in the variant itself (`ppc-69.png`): single dots are filled white, so they cut the stroke (the 5's bar and the 7's bar end are broken). A double's centre dot becomes a tiny white star. The outline uses `stroke-dasharray` 0.24 / 0.2 mm on a 0.2 mm line. That is a dash (LS-2: dashed means only a cut line or a missing-digit box), and it is far below the WDS dotted style of 1 pt round dots at 1.2 mm pitch.
   - **Fix:**
     - pass `ctx.photocopySafe` through `touchOpts` into fact, stack and equation;
     - for photocopy-safe, draw marks solid black (they are not trace ink) with the defect-1 keyline geometry;
     - if a trace form is kept, use WDS dotted (round caps, 1 pt dots, 1.2 mm pitch) with `fill="none"`, never a white fill over the stroke;
     - otherwise delete the trace and photocopy branches and the specimen rows.
   - **Proof:** a Photocopy-safe independent page with touch dots passes the gate's photocopy check. The specimen's photocopy row shows no broken strokes.

7. **Minor · C1 −1 · print dialog / meta.** **The S page's fit line says "Digits 16 pt" while it prints touch cells at 28 pt.**
   - **Where:** `scratchpad/touch-critic/S/addition__add_facts/meta.json` `fits.note`, and the same for add_column_multi.
   - **Fix:** when `forceL` applies, `buildSheet`'s fit note reports the raised size ("Digits 28 pt (touch dots)").
   - **Proof:** the meta note at S with `--supports touch` reads 28 pt.

8. **Minor · C4 −1 · documentation.** **SUPPORTS.md contradicts the code.**
   - §S1.9 lists `TOUCH_NUMERAL_SIZES` as "paper S / M / L (16 / 22 / 28 pt), screen grid 29 px", but the code holds 24 pt, 28 pt and 40 / 48 / 56 px.
   - §S1.1 ruling 10 ("Keep the white keyline on single dots") and §S1.11 still describe keylines that the code removed.
   - SF-34 in WDS states the new geometry as if it were approved.
   - **Fix:** make the docs match the code after defect 1 is resolved, and record any owner ruling that changes 9 and 10.
   - **Proof:** a diff of §S1.9 and SF-34 against `TOUCH_DOT_SIZES` and `TOUCH_NUMERAL_SIZES`.

9. **Minor · C1 −1 · card 390 (÷).** **The tally dots are about 7 px across at 14 px pitch** (`ladder-division-div_facts-card-wrong1-390.png`). A finger covers three dots. Touching is physical on a phone, even though the tally is not tappable.
   - **Fix:** at screen sizes, size the tally from the 40 px digit with pitch ≥ 0.5 em (20 px) and dot ≥ 0.25 em.
   - **Proof:** measure the pitch in the 390 shot.

## Pedagogy calls (against PEDAGOGY_STANDARD and SUPPORTS §S1.1 and §S1.7)

These match the rulings and are not scored as defects:
- **Operands only.** The answer, the signs and the two-digit numbers carry no marks; the stacks mark column by column.
- **17 − 9.** It counts back from a plain 17 with the 9 dotted, which is ruling 2.
- **×.** The non-table factor is dotted (9 × 3 dots the 3; the pupil counts by 9).
- **÷.** It gets a tally of 10 only, in two rows of 5. The length is the same on every item, so it does not leak the quotient.

Two open points:
- **Count-all items with a two-digit operand.** "10 + 1" on a `touchall` page dots only the 1, so that item is silently a count-on item. Name it in the message (defect 4), or deal no two-digit operand on a count-all page.
- **The quiz host never shows teacher-on touch numerals.** `quiz-1280.png` with `--supports touchall` shows a plain 7 + 9. Touch numerals appear there only through the ladder. If that is intended (quiz = assessment), state it in SUPPORTS §S2.4.

## Placement (every digit, viewed at 96 px and at 300 dpi)

| Digit | Marks |
|---|---|
| 1 | top of the stroke |
| 2 | start of the curve and the right end of the base |
| 3 | both terminals and the middle cusp |
| 4 (open) | top and corner of the left stroke, the top of the right stem (−0.11 em; Andika's right stem starts at −0.16, so this is near its top), and the crossing |
| 5 | bar end, corner, foot of the down-stroke, belly, tail |
| 7 | the corner, the mid diagonal and the foot as doubles, and the bar's left end as the single |
| 8 | four doubles on the outer sides of both bowls |
| 9 | four doubles round the loop and tail, and the single on the loop's left |

All of these sit on the conventional touch positions (stroke ends, corners and joins).

One nit: the 6's first double sits on the arc's apex (−0.06, −0.24), 0.26 em left of the stroke's start (≈ 0.20, −0.27). The convention marks the start. Move it 0.1 to 0.15 em right along the arc (−1 on C2 at most; already inside the scores above).

## What would raise each criterion to 10

- **C1.** Every double shows a black centre dot clear of the stroke inside a ring ≥ 0.25 mm and ≥ 1.5 px, so a pupil can count 6 to 9 at 24 pt and at 40 px DPR 1 without zoom. The ladder message says the action and names the numbers. The ÷ tally dots are big enough to touch one at a time on a phone.
- **C2.** The gate is OK on all 2289 checks, so no double blobs after a copy. The rung message teaches the strategy (say the larger number, count on). Count-all pages carry no two-digit operands.
- **C3.** The worksheet cell keeps one digit size through the whole ladder and across a faded grid. Paper is already at 8; 10 needs no further change beyond keeping the forced-L pages full (they are: 20 per page and 6 per page).
- **C4.** The geometry matches the owner-approved rulings 9 to 11 (or a new recorded owner ruling). Photocopy-safe output follows WDS LS-1 and LS-2. SUPPORTS §S1.9 and §S1.11 and WDS SF-34 match the code.

## Not graded / out of scope

`wave1-a2-perbox` count_by_tables (stale test, as the brief says).
