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

---

# Round 2 (commit 4725684, merge 0d308e9)

Critic: Opus 5.5, medium effort. Every gate below was re-run one at a time on the final commit, through `/tmp/mq-browser-run.sh`. Evidence is in `scratchpad/touch-critic/r2/`. The `wave1-a2-perbox` run rewrote the tracked `design/audit/runs/wave1-A2/*.png` files; I restored them with `git checkout`, so the worktree is unchanged apart from this file.

## Verdict: FAIL, on one host

The quiz fails: the teacher's touch option never reaches it. Paper (S and L, pupil and key, photocopy-safe), the practice card and the online worksheet pass at 8 or above. Round-1 defects 1 to 6, 8 and 9 are closed. Defect 7 (the S fit line) is still open.

## Gates (final commit)

| Gate | Result |
|---|---|
| `ws-touchdots.cjs --verbose` | **OK**, 2289 / 2289. Photocopy gap-white is now 59 to 100 % (round 1: 0 to 26 %). 0 merges. |
| `ws-touchdots-specimen.cjs` | OK, 90 pairs, 0 moved. Re-rendered to `r2/specimen.png`; the caption matches the new `specimen.html`. The committed `design/audit/runs/touchdots/specimen.png` was re-shot in 4725684. |
| `ws-support-ladder` (add_facts, subtract, mult_facts, div_facts; card, worksheet and quiz at 1280 and 390) | OK |
| `ws-print-lint --source kit`, add_facts + add_column_multi, `--supports touchall` L and `--supports touch` S | OK, 0 findings, at both sizes |
| `ws-screen-answer` add_facts + add_column_multi | OK (card, worksheet 3/3, quiz 3/3, live green) |
| `wave1-a2-perbox` | OK |
| `ws-boot-smoke` | OK |
| `ws-grade-render` L (touchall) and S (touch), 300 dpi; critic photocopy-safe probe (`pcsafe.cjs`: buildSheet with `photocopySafe: true`, L add_facts, S add_facts, L add_column_multi, S mult_facts, pupil + key) | renders, console clean. Simulated copy (Gaussian blur σ 0.12 mm, 60 % threshold): every double keeps a white gap and its centre dot (`pc-S-add_facts-p-1-copy-items.png`). |

## What I saw, zoomed in on 6 to 9

- **Paper, 24 and 28 pt at 300 dpi** (`r2/z24-69.png`, `L-e-56.png`). Every double is a black dot on a white keyline inside a 0.25 mm ring (1.95 mm across at 24 pt). Each reads as "dot in a ring" at arm's length, and each is clearly different from a 1.35 mm single. The 8's four rings sit on the outer bowls, and the 9's single sits clear of its top ring. In Bold the doubles still show their centre dot.
- **Screen.** At DPR 2 (`dpr2-crop.png`) every size is clean. At DPR 1 (`dpr1-x2.png`) the doubles stay countable at 40 px: 1.5 px ring, 2 px gap, 3.2 px dot.
- **Placement.** The 6's first mark now sits at the stroke's start (0.06, −0.265). That was the round-1 nit.

## Open calls

1. **10 + 1 on a count-all page: accepted as built.** On screen the message names the rung actually drawn ("Say 10. Touch the dots on 1 and count on."), and on paper the instruction is only "Add.", so nothing on the page contradicts the marks. The builder's recommendation (single-digit pairs only on count-all) is a valid refinement, but not needed for the pass.
2. **"The teacher option now applies in the quiz": not true in the build. See defect R2-1.**

## Score table (round 2)

| Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|
| Print, Independent L, add_facts / add_column_multi (pupil + key) | 9 | 9 | 9 | 9 | yes |
| Print, Independent S (touch cells at 28 pt), both skills (pupil + key) | 8 | 9 | 9 | 9 | yes |
| Print, photocopy-safe L and S (add_facts, add_column_multi, mult_facts) | 9 | 9 | 9 | 9 | yes |
| Practice card 390 / 820 / 1280 | 8 | 8 | 9 | 9 | yes |
| Online worksheet 1280 (and 390 ladder) | 8 | 8 | 8 | 9 | yes |
| Quiz 1280 / 390 | 8 | **7** | 9 | 8 | **no** |

## Defects (round 2)

**R2-1 · Major · quiz C2 −2, C4 −1. The teacher's touch option never reaches the quiz.**
- **Where:**
  - `js/modules/quiz-take.js:363` passes `options: q.opts || q.options` to `screenSupportsFor`. The quiz record has no `opts`, and `q.options` is the multiple-choice list.
  - `quizQuestionData` (`quiz-take.js:209-231`) does not copy `skillOptions` (it is missing from `QUIZ_CELL_FIELDS`).
  - `quiz-builder.js:885-889` stores only `{id, skillId, questionData, points}`.
  - `screenSupportsFor` therefore reads `{}` and returns null.
- **Observed:** with `--supports touchall`, `r2/L/addition__add_facts/quiz-1280.png` shows a plain "7 + 9", and the builder's own committed `design/audit/runs/touchdots/L/addition__add_facts/quiz-1280.png` shows the same. Yet `design/SUPPORTS.md` now says "The teacher's touch option applies in the quiz as in practice."
- **Fix:**
  - add `'skillOptions'` to `QUIZ_CELL_FIELDS`, so the generated question's option values travel with the item;
  - in `quiz-take.js:363`, read `qd.skillOptions` (keep `q.opts` as a fallback) and never `q.options`.
- **Proof:** `ws-grade-render --skills addition:add_facts --supports touchall` gives a `quiz-1280.png` with touch numerals on both operands. A quiz built in the Quiz Builder from a set with Touch dots ticked shows them. `ws-screen-answer --hosts quiz` stays OK.

**R2-2 · Minor · card, worksheet and quiz C2 −1. On ×, the ladder ignores the teacher's fact set.**
- **Where:** `support-ladder.js:606` builds the touch payload with no `table`, and `touchHow` hard-codes "the smaller factor carries the dots".
- **Effect:** on a ×3 set (`constant: [3]`) the item 3 × 9 is dotted on the 9 on paper and on the teacher-on card (`screen-cell.js:433-435` and `print-sheet.js:627` pass `table`). The ladder instead dots the 3 and says "Count by 9s". The pupil practising the 3s is told to count by 9s.
- **Fix:**
  - pass `table` into the ladder's touch payload from `q.skillOptions.constant`, the same rule as `screenSupportsFor`;
  - make `touchHow` use the same rule, so its message reads "Count by 3s. Touch a dot on 9 for each count."
- **Proof:** a `ws-support-ladder` shot of `multiplication:mult_facts|{"constant":[3]}` with the item 3 × 9 shows the dots on the 9 and the message "Count by 3s".

**R2-3 · Minor · print S C1 −1. Round-1 defect 7 is still open: the S fit line still says "Digits 16 pt".**
- **Where:** the fix is in `buildRoleSheet` (`print-sheet.js:2066-2068`), but Independent and More practice return earlier through the `PRACTICE_ROLES` path (`print-sheet.js:1453`), so it never runs for them.
- **Observed:** `r2/S/addition__add_facts/meta.json` and `r2/S/addition__add_column_multi/meta.json` both have `fits.note` "Digits 16 pt.", while the page prints the touch cells at 28 pt (measured: the 9 is 7.28 mm tall).
- **Fix:**
  - apply the same `touchUp` rewrite to the practice-role return;
  - include fact cells (`class="ws-fact`), not only `ws-stack`, since S add_facts is raised too.
- **Proof:** both S `meta.json` notes read "touch-dot cells 28 pt".

**R2-4 · Minor · screen C1, held at 8. On a 1× display at 40 to 56 px, the single-dot keylines break up the 4 and the 5.**
- **Where:** `ws-4-z.png`, `card1280-facts.png` and `ladder-addition-add_facts-quiz-wrong1-390.png`.
- **Measured:**
  - 4 at 40 px, DPR 1: the stroke left between marks is about 2 × 2 px on the crossbar and 2 px on the right stem's top;
  - the 4 reads as a constellation of dots before it reads as a 4;
  - DPR 2 and paper are fine.
- **Fix (owner call, ruling 10 governs keylines):** keep the keyline on paper, where it is a photocopy measure, and on screen draw singles with `halo` = 0, or clamp the screen halo floor to 0.5 px.
- **Proof:** a DPR 1 shot at 40 px where each stroke segment between two marks is at least 3 px of solid black.

**R2-5 · Nit · worksheet C3, held at 8.** The first wrong answer still enlarges the cell once (29 → 40 px). After that it holds (the 7's cap height is 28 px on rungs 1, 2 and 3), which meets the round-1 fix. For a 9 or 10, raise a cell whose skill has a touch rung on its ladder to 40 px from the start.

## What would raise each criterion to 10

- **C1.** Fix R2-3 and R2-4 (a correct fit line, and whole 4s and 5s on 1× screens).
- **C2.** Fix R2-1 (teacher-on touch in the quiz) and R2-2 (the ladder's × follows the fact set). Deal single-digit pairs only on count-all pages.
- **C3.** Fix R2-5, so a worksheet cell never changes size.
- **C4.** Fix R2-1 so SUPPORTS.md's quiz sentence becomes true, or else correct that sentence. Add an owner ruling on the screen keyline (R2-4).

---

# Round 3 (commit e9f6516: touch-tap.js, one touch-floor rule, R2 fixes)

Critic: Opus 5.5, medium effort, fresh start. Date: 2026-10-09. I ran every browser check one at a time through
`/tmp/mq-browser-run.sh`. Evidence is in the session scratchpad under `tn-r3/` (`logs/`, `probe/out/`, `print/S|M|L/`,
`ladder3/`). The worktree is unchanged apart from this file.

## Verdict: FAIL

Paper passes at S, M and L (every page type, pupil and key, photocopy-safe). R2-1 to R2-4 are closed. R2-5 is
**not** closed.

The new tapping layer (`touch-tap.js`) works in the synthetic gate, but it breaks or shifts things in the three
real hosts:
- keyboard counting is taken over by the active-box after about a second;
- a tap moves the caret out of the answer box, so at Chromebook height the next digit typed is lost;
- the count line pushes Check down, and on the worksheet it grows the whole row;
- after a ladder redraw the count is stale;
- the ladder's touch rung swaps the teacher's count-all for count-on.

## Gates (head e9f6516)

| Gate | Result |
|---|---|
| ws-boot-smoke | OK |
| ws-touch-tap | OK (but see R3-8: its host is synthetic, outside the three real hosts) |
| ws-touchdots | OK, 2289 / 2289 |
| ws-support-ladder | OK (add_facts, subtract, mult_facts, div_facts, …; card, worksheet, quiz instant / end) |
| ws-support-ladder `mult_facts\|{"constant":[3]}` --shots | OK. "Count by 3s. Touch a dot on 1 for each count.": R2-2 closed |
| ws-screen-answer | OK |
| ws-screen-slots | OK (609 skills, 2436 renders, 0 doubled) |
| ws-content-audit | OK |
| ws-print-lint --source kit | 463 findings in 33 documents = baseline (not raised) |
| ws-code-snapshot | OK (608 / 35) |
| node --check, every changed JS | OK |
| ws-grade-render touchall, S / M / L, 10 roles (independent, more-practice, guided, review, test, error-analysis, reason-it, stretch, lesson, true-false) for add_facts, add_column_multi, subtract, mult_facts, div_facts | renders, console clean. Lesson role OVERFLOW on add_column_multi and subtract (S/M/L) and div_facts (S/M): the anchor chart's model cell. It draws no touch marks, so it is not this lane (see Out of lane). |
| Merge into claude/sweet-newton-c8wrv1 (4970e4b), `git merge-tree` | **Not clean.** `css/screen-cell.css`: the touch block conflicts with main's Steps-box hint rule at the file's end. Keep both. `design/audit/runs/wave1-A2/card-function_table_easy-green-red-empty-1280.png`: binary; take main's copy or re-shoot. `worksheet.js` auto-merges. |

## Round-2 defects

| Id | Status | Proof |
|---|---|---|
| R2-1 quiz ignores the teacher option | **closed** | Quiz with touchall on add_facts: 2 touch numerals drawn and tappable (`probe/out/*-quiz0.png`) |
| R2-2 × ladder ignores the fact set | **closed** | `ladder3/ladder-multiplication-mult_facts-card-wrong1-1280.png` reads "Count by 3s", dot on the 1 |
| R2-3 S fit line | **closed** | S meta: "Digits 16 pt; touch-dot facts 24 pt or more." and "touch-dot cells 28 pt." (M likewise) |
| R2-4 keylines break the 4 and 5 at 1× | **closed** | `probe/out/grey-dpr1.png`: the 4 and 5 are whole at 40 and 56 px, DPR 1. Owner exception recorded in SUPPORTS §S1.9. |
| R2-5 worksheet cell grows mid-ladder | **open** (R3-3) | see below |

## Score table (round 3)

| Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|
| Print S / M / L, all 10 roles, pupil + key (touch cells raised to 24 / 28 pt) | 9 | 9 | 9 | 9 | yes |
| Print photocopy-safe (unchanged since r2, gate OK) | 9 | 9 | 9 | 9 | yes |
| Practice card 1366x768 (650 visible) and 1280x720, mouse + touch | 7 | 7 | 7 | 7 | **no** |
| Online worksheet 1366x650, mouse + touch | 7 | 7 | 6 | 7 | **no** |
| Quiz 1366x650, mouse + touch | 7 | 8 | 7 | 7 | **no** |
| Basic 390 (card, worksheet, quiz) | no h-scroll, targets ≥ 44, typing works in a focused box | | | | basic OK (phone polish deferred) |

## Defects (round 3)

**R3-1 · Major · C1 −1, C4 −2 · card, worksheet, quiz. Keyboard counting is taken over by the active-box.**
- **Measured** (`probe/card.cjs`, 1280x720 touch and 1366x650):
  - focus the 7 of "2 + 7" and press Enter / Space;
  - the count runs 3, 4, 5, 6; then, about 1 s in, `document.activeElement` becomes the answer box;
  - every later Enter goes to the box ("Touched 7" stops; ×: "Touched 9" stops after 4 presses; column stack after 2).
- **Cause:**
  - `active-box.js` `selectIfLoose` treats a focused `[role="button"]` *inside* a problem host as a blank part of the problem (`if (… [role="button"]) && !inProblem) return;` only spares ones outside);
  - once the last tap is over 800 ms old, it pulls focus to the pulsing box;
  - each count mutates the DOM (the count line text), which reschedules that check.
- **Fix:**
  - in `selectIfLoose`, return when the focused element is a touch numeral (`ae.matches('.ws-tn[data-mq-tn]')`), the same as a button or link the pupil chose;
  - keep the digit-key redirect, so a digit typed while on a numeral still lands in the box.
- **Proof:** in the real card, worksheet and quiz, 7 Enters on a 7 give "Touched 7", with focus on the 7 throughout.

**R3-2 · Major · C1 −1 · card and quiz at Chromebook height. A tap on a number takes the caret out of the answer box.**
- **Measured:**
  - the number is `tabindex="0"`, so a mouse or touch tap focuses it;
  - at 1366x650 and 1280x720 the card's box (top 688) and the quiz box (638–705) are not fully on screen, so the active-box digit redirect (`onScreen(box)`) does not fire;
  - typing "1" after a tap was lost on the card and in the quiz (`afterType.val = ""`);
  - with the box on screen (1366x900) and on the worksheet, the digit landed.
- **Fix:**
  - on `pointerdown` / `mousedown` over `.mq-tn-hit`, call `preventDefault()`, so a pointer tap counts without moving focus;
  - keep `tabindex` for keyboard users;
  - a pupil who taps the 7 and then types then always types into the box, as before this lane.
- **Proof:** on the card and the quiz at 1366x650, tap a number, type a digit, and the box holds it.
- (The box sitting partly below a 650 px fold is a pre-existing app layout matter; see Out of lane.)

**R3-3 · Major · C3 −2 · online worksheet. R2-5 is not fixed: the floor attribute lands on the wrong element and the wrong card.**
- **Where:** `worksheet.js` `_wsRenderCard`: `grid.closest('.mq-scell') || grid.querySelector('.mq-scell')`.
  - `grid` is the whole worksheet grid, so this is always **card 0's** outer `.mq-wspaper`, for every card.
  - The inner `.ws-card-visual.mq-scell.mq-grid-cell` sets its own `--mq-digit: 29px`, so even card 0 stays at 29 px.
- **Measured** (`probe/wsfloor.cjs`, add_facts, ladder only):
  - before: cards 0 to 3 at 29 px (card 0 has the attribute, cards 1 to 3 do not);
  - after one wrong answer on card 1: card 1 at 40 px, and its row grows from 270 to 359 px.
- **Fix:**
  - set the attribute on this card's own cell (`card.querySelector('.ws-card-visual')`, or on `card`, with the CSS keyed `[data-mq-touch-floor] .mq-grid-cell`);
  - better: raise every card whose skill has a touch rung (or a teacher touch option), so a grid never mixes 29 and 40 px.
- **Proof:** the same probe shows 40 px on every add_facts card before and after the wrong answer, and an unchanged row height.

**R3-4 · Major · C3 −1 (card, quiz), −2 (worksheet). The count line appears on the first tap and pushes the page.**
- S1.8 says "Nothing grows or moves".
- **Measured:**
  - card: Check moves from 787 to 837 px (+50) on the first tap, further below a 650 px fold;
  - quiz: Next moves from 744 to 794;
  - worksheet at 1366: the whole row of three cards grows from 295 to 345 px, and the neighbours' problems re-centre about 25 px lower (`probe/out/*-ws1.png`).
- **Fix:**
  - reserve the line's height from the start in any cell that has touch numerals (an empty line with `visibility:hidden`, filled on the first tap);
  - or place it where it takes no new height: beside the Hint / Read row on the card, or inside the card's existing bottom padding on the worksheet;
  - keep the Start again button ≥ 44 px.
- **Proof:** card Check, quiz Next and worksheet row heights are equal before and after the first tap.

**R3-5 · Minor · C2 −1 · card, worksheet, quiz. The count goes stale after a ladder redraw.**
- **Measured:**
  - after 7 taps then a wrong answer, the ladder redraws the cell;
  - the marks are all black again (0 greys), but "Touched 7 · Start again" still shows (`probe/out/*-3wrong.png`);
  - Start again then resets the detached old cell.
- **Fix:** when `enhance` adds numerals to a cell, or the cell is replaced, drop a count line whose cell is gone. For example, key the line to the cell with an id, and in `scan()` remove lines whose `previousElementSibling` has no counted marks.
- **Proof:** after a wrong answer the line is gone, or reads 0.

**R3-6 · Major · C2 −2 · card, worksheet, quiz (add / subtract with a teacher count-all option). The ladder's first rung takes support away.**
- **Measured:** teacher touchall on "2 + 7". After one wrong answer the 7 loses its dots, and the message is "Not yet. Say 7. Touch the dots on 2 and count on." (`probe/out/addition-add_facts-touchall-1280x720-touch-3wrong.png`; column stack: 6 buttons become 4).
- **Cause:** `support-ladder.js` `redrawKit`: `clashes(touch, touchall)` drops the teacher's touchall for the rung's touch.
- **Effect:** a pupil who struggles is moved from count-all to the harder count-on. That is the opposite of the owner's "when the pupil struggles".
- **Fix:** when the item already shows touchall (or touch), the touch rung is spent. Skip to the next rung (tile / start arrow), keeping the teacher's marks.
- **Proof:** a ws-support-ladder case with `{"support":["touchall"]}` on add_facts shows both numbers still dotted at wrong 1, plus the next support.

**R3-7 · Minor · C4 −1 · column stacks. Each digit is its own target, and the label is ungrammatical.**
- In "17 + 92 + 34" each digit is its own button: "1: 1 touch dots. Tap to count.", "7: …".
- Column work counts column by column, so per-digit targets are right in a stack. But S1.8 says one target per NUMBER, so the rule should name the stack case.
- **Fix:**
  - document "stacks: one target per digit (columns are counted separately)" in S1.8;
  - write "1 touch dot".

**R3-8 · Minor · C4 −1 · the gate.**
- `ws-touch-tap.cjs` builds `#tt-host` inside `#gameView` but outside `#questionCard`, `.problem-card` and `.qt-question-card`. The active-box never sees it, which is why R3-1, R3-2 and R3-5 pass the gate.
- **Fix:** add real-host cases:
  - card, worksheet and quiz at 1366x650;
  - tap then type a digit;
  - 7 Enters on a 7;
  - first-tap layout delta = 0;
  - wrong answer then the count line.

**Nit (not scored):** the ÷ tally for "90 ÷ 9" is 12 dots in rows of 5 / 5 / 2 (S1.7: "two lines of five", or 12 for a ×12 set). Twelve reads better as 6 / 6.

## Requested views

- **"Touched 5 · 30" (× running total): do not draw the "· 30".**
  - After the pupil has touched every dot on the factor, the running total *is* the product (6 × 5 = 30 on screen). That breaks S8 (a support never shows the answer), and it does the count-by for the pupil.
  - "Touched N" alone is right for ×: it tells the pupil how many counts they have made, not the answer.
  - Correct S1.8's example line.
- **Tappable ÷ tally dots: keep them not tappable (or tappable with grey only, no number).**
  - A tappable tally with a count line would read "Touched 10" for 90 ÷ 9, which is the quotient.
  - If the owner wants them tappable for the greying, give them the same 44 px targets (the dots are about 11 px at a 20 px pitch at 1366) and no count line.
- **The same leak exists today on count-all.** On a touchall "2 + 7", touching every dot shows "Touched 9", the sum. Owner question below.

## Owner questions

1. **Count-all shows the sum.** On a count-all item, "Touched N" ends at the answer. Should the count line:
   - (a) show no number, only the greys and Start again (recommended for ELL/SPED: the pupil says the count aloud);
   - (b) show the number only on count-on, × and ÷ rungs, where it is not the answer; or
   - (c) stay as built?
2. **Ladder over a teacher touch option (R3-6).** Should a wrong answer:
   - (a) keep the teacher's marks and add the next rung (recommended); or
   - (b) switch count-all to count-on?

## Out of lane (recorded, not scored)

- At 1366x650 and 1280x720 the practice card's answer box (top 688) and Check (787) sit below the fold even with no support on. The quiz box is at 638 to 705. This conflicts with the owner's Chromebook priority. It is pre-existing app layout, not this lane, and it makes R3-2 bite.
- Lesson role (anchor chart): model cell overflow on add_column_multi, subtract and div_facts, and coloured (purple) step icons on the anchor chart. No touch marks are involved.

## What would raise each screen host to 8+

Fix R3-1 to R3-6, extend the gate (R3-8), and resolve the CSS merge conflict. Paper needs nothing.

# Round 4 (commit 614178a: focus kept, line reserved, count-by line, ladder keeps teacher marks)

Critic: independent, fresh start (an earlier round-4 run was killed by a container restart; nothing of it was
reused). Date: 2026-10-09. Every browser run went through `/tmp/mq-browser-run.sh`, one at a time. Evidence is in
the session scratchpad under `tn-r4/` (`logs/`, `out/`, `stackout/`, `ladder/`, `print/S|M|L/`). Hosts were driven
for real: practice card, online worksheet and quiz at **1366 × 650 and 1280 × 600**, each with **touch taps, mouse
clicks and the keyboard** (Shift+Tab to a number, Space / Enter to count, a digit typed while on a number). The
owner rulings of 2026-10-09 are the spec. The worktree is unchanged apart from this section.

## Verdict: FAIL

Most of round 3 is fixed and works on all three hosts with mouse, touch and keyboard:
- focus is never taken: a tap or click leaves the caret in the box, and the next digit lands there;
- Enter / Space counting keeps focus on the number;
- a digit typed while on a number goes to the box, even with the card's box below a 650 px fold;
- the first tap moves nothing;
- the × count-by line reads exactly as ruling (a) asks;
- every worksheet card draws at 40 px from the start.

Paper still passes at S, M and L.

Four defects remain, two of them Major:
- **Ruling (b) holds only for add_facts.** On subtraction and on column stacks, a wrong answer under the
  teacher's touch option **drops the teacher's dots** and draws the start arrow instead (R4-1).
- **On column stacks, the count line sits under the answer row.** Start again cannot be tapped or clicked
  (R4-2). The column ladder's touch message is wrong for column work, and its "Touched N" adds every column
  together (R4-3).
- **The quiz never shows "Touched N" after a count-all item is answered** (ruling (c), R4-4).

## Gates (head 614178a)

| Gate | Result |
|---|---|
| node --input-type=module --check, the 4 changed JS | OK |
| ws-boot-smoke | OK |
| ws-touch-tap | OK (real card, worksheet and quiz now included; see R4-6 for what it misses) |
| ws-touchdots | OK, 2289 / 2289 |
| ws-support-ladder (default set) | OK |
| ws-support-ladder `add_facts`, `subtract`, `add_column_multi` with `{"support":["touchall"]}` --shots | OK, but the shots show R4-1 (subtract and column: dots gone at wrong 1) |
| ws-screen-answer | OK |
| ws-screen-slots | OK (609 skills, 2436 renders, 0 doubled) |
| wave1-a-probe, wave1-a2-perbox, wave1-a3-wrongdigits | OK, OK, OK |
| ws-print-lint --source kit | 463 findings in 33 documents = baseline (not raised) |
| ws-code-snapshot | OK (608 / 35) |
| ws-grade-render, touch + touchall, S / M / L | independent, more-practice, guided, review, test and lesson for add_facts, subtract, add_column_multi and mult_facts. Console clean. Pupil pages and keys unchanged since r3. The lesson anchor OVERFLOW is the known out-of-lane item. |

## Merge into claude/sweet-newton-c8wrv1 (f1dae55)

`git merge-tree` is not clean. Two files conflict.

**`css/screen-cell.css`** (the file's last hunk):
- The lane side is a 3-line comment: "Touch numerals floor … (one rule with the touch-dots floor at the end of this file)".
- Main's side is the SL-3 block: `.mq-cellbox > input.ib-cell` borderless, and the active-box highlight moved to the box.
- **Resolve by keeping both:** the lane's comment, then main's SL-3 rules, with no line of either changed.
  - The lane's touch rules (`.mq-tn-hit`, `.mq-tn-count`) sit further down and merge cleanly.

**`design/audit/runs/wave1-A2/worksheet-add_facts-green-1280.png`** (binary):
- Take main's copy (`git checkout --theirs`), or re-shoot it.

**`js/modules/active-box.js`** auto-merges with no conflict:
- The lane's one line is in `selectIfLoose`: `if (ae.matches('.ws-tn[data-mq-tn]')) return;`.
- Main's `advanceIfFull` and its `input` listener are separate code.
- Keep both as git merges them.

I resolved the merge this way in a scratch checkout (no commit) and ran the following there:

| Check | Result |
|---|---|
| ws-touch-tap | OK |
| ws-boot-smoke | OK |
| the place-value critic's `r3-caret-spread.cjs` at 1366 × 650 touch (add_2digit_regroup, add_3digit, sub_3digit, multiply_2by1, unit_form, place_value_disks, add_column_multi) | OK |
| digits and number taps interleaved on add_column_multi with count-all (card and quiz) | each digit fills a box and the caret moves on: ones, tens, hundreds. A tap between digits never stops the caret move. |

**The box-full caret move is unaffected.**

## Round-3 defects

| Id | Status | Proof (1366 × 650 and 1280 × 600, touch and mouse) |
|---|---|---|
| R3-1 keyboard counting taken over | **closed** | Enter / Space on a number: after 1.6 s, focus is still on the number, and the greys equal the presses (card, worksheet, quiz, every case). |
| R3-2 tap takes the caret | **closed** | After a tap or click on a number, focus stays on the box, and "1" typed lands there (card, worksheet, quiz). A digit typed while a number has keyboard focus also lands in the box. |
| R3-3 floor on the wrong card | **closed** | Worksheet `--mq-digit` is 40 px on all 6 cards from the start. A wrong answer grows only card 0 (345 → 409 px), which is the ladder message: 42 px plus its gap. The count line (44 px) was already reserved. |
| R3-4 first tap pushes the page | **closed** for the first tap | Layout diff is empty on every host and input after the first tap and after all taps. See R4-5 for the line arriving with a wrong answer on the card and quiz. |
| R3-5 stale count after a redraw | **closed** | After a redraw, the line matches the live cell (kept marks give "Touched 2" with 2 greys; dropped marks remove the line). Start again resets the live cell. |
| R3-6 ladder swaps count-all for count-on | **closed for add_facts only** | add_facts count-all, wrong 1: both numbers keep their dots, and the dot tiles are added. **Open on − and column stacks:** see R4-1. |
| R3-7 stack targets, "1 touch dot" | **closed** | S1.8 names the stack exception. The label reads "1: 1 touch dot. Tap to count." |
| R3-8 gate on a synthetic host | **closed** | The gate now drives the real card, worksheet and quiz at 1366 × 650 with touch. It misses R4-1, R4-2 and R4-4 (R4-6). |

## Owner rulings, as built

| Ruling | Card | Worksheet | Quiz |
|---|---|---|---|
| (a) × "How much is 9 tens?" then "10, 20, … 90 (counting by tens)" | yes | yes. Up to "12, 24, … 96 (counting by twelves)" wraps to 2 lines inside the reserved 44 px. No growth. | yes |
| (b) wrong answer keeps the teacher's marks and adds the next support | add_facts yes; **− and column stacks no (R4-1)** | same | same |
| (c) count-all: greys + Start again only until answered, then "Touched N"; count on / back: "Touched N" | yes | yes (only the answered card shows it) | **no: never shows "Touched N" after answering (R4-4)** |
| (d) ÷ tally taps a recorded follow-up | recorded in S1.8 | | |

ELL / SPED wording:
- "How much is 4 threes?", "(counting by threes)", "Touched 7", "Start again" and the count-on, count-back and
  × ladder lines are short and clear, and each says one action.
- The exceptions are R4-3 and the nits below.

## Score table (round 4)

| Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|
| Print S / M / L, all roles in scope, pupil + key | 9 | 9 | 9 | 9 | yes |
| Practice card, 1366 × 650 and 1280 × 600, mouse + touch + keyboard | 7 | 7 | 7 | 8 | **no** (R4-1, R4-2, R4-3, R4-5) |
| Online worksheet, same | 8 | 7 | 8 | 8 | **no** (R4-1, R4-3) |
| Quiz, same | 8 | 7 | 7 | 8 | **no** (R4-1, R4-4, R4-5) |
| Basic 390 (ladder gate shots, card, worksheet, quiz) | no h-scroll, typing works | | | | basic OK (phone polish deferred) |

## Defects (round 4)

**R4-1 · Major · C2 −2 · card, worksheet, quiz. On − and column stacks, a wrong answer removes the teacher's touch dots.**

Measured (all three hosts, both sizes, touch and mouse):
- `subtract` with the teacher's "count back" (dots on the 4 of 18 − 4) shows "Touched 4" before the answer.
  - After one wrong answer: "Not yet. Use the arrow, then try again." The 4 is plain, and the numerals count goes 1 → 0 (`out/1366x650-touch-card-subtract-touch-after-wrong.png`, quiz likewise).
- `add_column_multi` with touch: 4 numerals → 0.
- `add_column_multi` with touchall: 6 numerals → 0.
- `subtract` with touchall: the dots are gone at wrong 1 (`ladder/ladder-subtraction-subtract-{card,worksheet}-wrong1-1280.png`, `ladder-addition-add_column_multi-card-wrong1-1280.png`).
- add_facts is right: its next rung is the dot tiles, and the marks stay.

Cause:
- `rungsFor` now drops the touch rung, so the first rung is `startarrow`.
- `redrawKit` rebuilds the cell with `on = had ∪ ids`.
- On these cells the teacher's touch id is not in `had`: it is read from `ws-supported` / `data-ws-supports` on the kit root. So the redraw draws the arrow alone.
- `startarrow` and `touchdots` do not clash (SUPPORTS compat table: ✓), so nothing should drop them.

Fix:
- In `redrawKit`, take the teacher's own supports for this item from `screenSupportsFor` (as `teacherTouches` already does), and union them into `on` before the clash filter.
- The Say-line should read "Not yet. Now use the arrow too." (the "too" form), because the dots stay.

Proof: the ladder gate with `{"support":["touch"]}` and `{"support":["touchall"]}` on subtract and add_column_multi, at wrong 1 on card, worksheet and quiz:
- the numerals count is unchanged;
- the arrow is added.

**R4-2 · Major · C1 −1, C3 −1 · column stacks (card; any host whose stack overflows). Start again sits under the answer row.**

Measured: `add_column_multi` with touch at 1366 × 650 and 1280 × 600.
- The answer row overflows the bordered cell by 25 px (cell bottom 850, box bottom 875). This overflow is the same on main, so it is pre-existing.
- The count line goes right after the cell, so the answer boxes cover "Touched N" and the top half of Start again (`out/1366x650-touch-card-add_column_multi-touch-tapped.png`).
- A tap or a mouse click on Start again's centre lands on a box: greys stay at 10 after Start again, with touch and with mouse.

Fix (either is enough; the first is better):
- Make the cell hold its answer row (the 25 px overflow).
- Or place the line below the cell's real content bottom (`max(cell.bottom, last input bottom)`), not as its next sibling.
- Keep Start again ≥ 44 px and fully uncovered.

Proof: `elementFromPoint` at Start again's centre is the button, and Start again clears the stack on card, worksheet and quiz.

**R4-3 · Major · C2 −2, C4 −1 · add_column_multi touch rung (all hosts). The words do not fit column work.**

The rung's message is built from the first two operands of the whole sum:
- "Not yet. Say 99. Touch the dots on 17 and count on." for 17 + 73 + 18 + 99;
- "Say 87. Touch the dots on 43" for 43 + 50 + 87.

Problems:
- Neither is the problem, and the dots sit on single digits in each column.
- The count line then says "Touched 27" or "Touched 12", which adds every column together. Column work counts each column separately (S1.8's own stack rule).
- A pupil cannot act on either line.
- A "0: 0 touch dots. Tap to count." target is drawn on the 0 of 50. It counts nothing.

Fix:
- For stacks, use column words: "Not yet. Start with the ones. Touch the dots and count on."
- In a stack, the count line counts per column. Show the column being touched ("Touched 4") and reset per column, or show greys only.
- Give no target to a digit with 0 dots.

Answer to "× column stacks keep 'Touched N'?":
- On screen, no × item is detected as a stack: 2-digit × 1-digit (multiply_2by1, mult_2digit, mult_3digit, mult_zeros) draw the fact cell, so they get the count-by line. That is right.
- A two-digit dotted factor never gets the touch rung (12 × 11, 12 × 12 fall to the sign), so no count-by is ever short.
- A true × stack would fall to "Touched N" by `modeOf`. Today none is drawn.

**R4-4 · Minor · C2 −1 · quiz. Ruling (c) is not met: count-all never shows "Touched N" after answering.**

Measured:
- Quiz with touchall on add_facts: all marks touched, then a wrong answer (`submitQuizTextAnswer`).
- Feedback "Not yet. Use the dot tiles, then try again." is shown, but the line stays empty at 1366 and 1280.

Cause: `words()` looks for `ANSWERED`, `.mq-ladder-card` or `#feedbackArea.mq-ladder-feedback`. The quiz marks its answer in `.qt-feedback` and none of those.

Fix: count the quiz's own answered state, for example a non-empty `.qt-feedback` in the same `.qt-question-card`, or the ladder entry for that question.

Proof: the same run shows "Touched 10" on the quiz after the wrong answer.

**R4-5 · Minor · C3 −1 · card and quiz (ladder only, no teacher option). A wrong answer adds the count line as well as the message.**

Measured:
- Quiz add_facts: card 367 → 467 px at wrong 1, and Next 665 → 765. Of the 100 px, 44 px is the new count line; the rest is the message and the touch numeral.
- The practice card does the same.
- The worksheet reserves the line from the start (R3-3 fix), so only its message grows.

S1.8 says the line's space is reserved in every cell "whose ladder can draw them". That holds only on the worksheet.

Fix (do not reserve 44 px on every card at 650 px height; Check is already below the fold):
- Put the count line on the ladder message's own row (one row: message, then count, then Start again).
- Or put it on the card's Hint / Read row.

Either way only the ladder's message line grows.

**R4-6 · Minor · C4 −1 · the gate.** `ws-touch-tap` passes with R4-1, R4-2 and R4-4 present. Add these cases:
- `subtract` and `add_column_multi` with the teacher's touch: wrong 1 keeps the numerals;
- a stack: Start again is hit-testable at its centre and clears;
- a quiz with count-all: "Touched N" appears after an answer.

**Nits (not scored):**
- "How much is 1 sixes?" is singularised by stripping a final s, so 1 × 6 with dots on the 1 reads "How much is 1 sixe?". Use a singular list.
- Past twelve the plural is "70s" / "100s": "How much is 7 70s?" reads poorly. "How much is 7 groups of 70?" is clearer for ELL.
- A count-by line of 9 × 100 on a worksheet card ("100, 200, … 900 (counting by 100s)") may need 3 lines. That is more than the reserved 44 px, so the card would grow mid-count. Cap the line at 2 lines, or show the last three counts.
- "Start again" wraps to two lines inside its button when the × line is long on a 336 px card. Set `white-space: nowrap` on the button.

## What would raise each screen host to 8+

Fix R4-1 to R4-4, take R4-5's one-row placement, and add R4-6's cases to the gate. Then resolve the merge as above. Paper needs nothing.

# Round 5 (head aaa2b2dd, main merged at 26b59084: teacher dots kept on every skill, column words and per-column count, count line in the ladder row, quiz in-place feedback)

Critic: independent, fresh start (an earlier round-5 run was killed by a container restart and wrote nothing here;
its logs were only read for leads, every result below was re-measured). Date: 2026-10-10. Every browser run went
through `/tmp/mq-browser-run.sh`, one at a time, from one sequential queue. Evidence is in the session scratchpad
under `tn-r5/c/` (`logs/`, `out/`, `ladder/`, `print/S|M|L/`, the probe `probe.cjs`). Hosts were driven for real at
**1366 × 650 and 1280 × 600** with **touch taps, mouse clicks and the keyboard**. The owner rulings and the lead's two
decisions are the spec. The worktree is unchanged apart from this section.

## Verdict: FAIL, on the quiz host only

Every round-4 defect is closed on the card, the worksheet and the quiz, at both sizes, with all three inputs
(table below). Paper still passes at S, M and L. The practice card and the online worksheet now pass.

The quiz fails on one new Major defect, and it is in the builder's `quiz-take.js` change, which is **already live on
main** as the instant-feedback hotfix (`d77d5d24`):

- **Q5-1 · Major.** In a quiz with instant feedback, a pupil who types an answer and then **taps** Next on a
  touch screen does not move on. The feedback line is inserted between the tap and its click, Next jumps down
  52 to 74 px, and the click lands on the question card. A second tap is needed. Mouse clicks and the keyboard are
  fine. The same run against main (`c4188955`) fails the same way.

One Minor defect remains on the stacks (Q5-2): the count line can sit under the pinned Check / Next bar.

## Gates (head aaa2b2dd)

| Gate | Result |
|---|---|
| ws-boot-smoke | OK |
| ws-touch-tap | OK (it misses Q5-1 and Q5-2: its quiz cases call `submitQuizTextAnswer` directly, and its stack case scrolls Start again to the centre first) |
| ws-touchdots | OK, 2289 / 2289 |
| ws-support-ladder (default set) | OK |
| ws-support-ladder add_facts, subtract, add_column_multi with `{"support":["touch"]}` --shots | OK, and the shots keep the teacher's dots at wrong 1 to 3 |
| same with `{"support":["touchall"]}` --shots | OK, same |
| ws-screen-answer | OK |
| ws-screen-slots | OK (609 skills, 2436 renders, 0 doubled) |
| wave1-a-probe, wave1-a2-perbox, wave1-a3-wrongdigits | OK, OK, OK |
| ws-chromebook-fit | OK (it misses Q5-1: its Next check is a mouse click) |
| ws-print-lint --source kit | 463 findings in 33 documents = baseline (not raised) |
| ws-grade-render, touch + touchall, S / M / L | independent, more-practice, guided, review and test for add_facts, subtract, add_column_multi and mult_facts. Pupil pages and keys are unchanged since r4 (the lane changed no print code). |
| probe (`tn-r5/c/probe.cjs`): keep / stack / quizall / row / nits / quizflow / quizflow2 / swallow / cover | 42 / 42 keep cases OK at both sizes; findings below |

## Merge into claude/sweet-newton-c8wrv1 (c4188955)

A throwaway `git merge-tree` (nothing pushed):
- **`design/STATUS.md`** conflicts on one line. The lane's escalation line and main's search-lane escalation line
  both land on the same spot in the escalation list. Keep both lines.
- **`js/modules/quiz-take.js`** merges cleanly. Main already has the hotfix (`d77d5d24`), and the result equals the
  lane's file.
- Nothing else conflicts.

## Round-4 defects

| Id | Status | Proof (1366 × 650 and 1280 × 600) |
|---|---|---|
| R4-1 teacher dots dropped on − and stacks | **closed** | add_facts, subtract, add_column_multi with touch and touchall, and mult_facts with touch, on card, worksheet and quiz. The numerals are the same digits before, at wrong 1 and at wrong 2 (for example `463062 -> 463062 -> 463062`). The arrow, sign or tiles are added. The message is the "too" form: "Not yet. Now use the arrow too." then "Not yet. Now use the sign too." |
| R4-2 stack Start again under the answer row | **closed** as written | No answer box overlaps the line, on any host or input. A touch tap, a mouse click or Enter on Start again clears the stack. The line can still be under the pinned bar: see Q5-2. |
| R4-3 column words and the whole-sum count | **closed** | The rung reads "Not yet. Start with the ones. Say the biggest number. Touch the dots and count on." Two taps on the ones column read "Touched 2". The first tap on another column reads "Touched 1". Touch, mouse and keyboard all match. No 0 is a target. |
| R4-4 quiz count-all never says "Touched N" | **closed** | Quiz add_facts with touchall: "" before the answer, then "Touched 2" after a typed wrong or right answer (Enter). Touch, mouse and keyboard all match. |
| R4-5 a wrong answer adds the count line too | **closed** | Ladder-only numerals on the card and the quiz (add_facts, subtract, mult_facts, add_column_multi): the cell height does not change, and one bar sits inside the message row. Only the message row is added: Check goes 458 → 552 on the card and Next 450 → 524 on the quiz. Check and Next stay on screen at both sizes. At wrong 2, no Start again is left behind when the numerals go. |
| R4-6 gate holes | **closed** for R4-1 to R4-5 | The gate now has realKeep, realStack and realRow. It misses Q5-1 and Q5-2. |
| Nits | **closed** | "How much is 1 six?", "1 ten?", "1 twelve?" (40 items, no stripped s). Past twelve: "groups of 70". A long run shows "… 70, 80, 90 (counting by tens)". Start again has `nowrap`. |

## Owner rulings and lead decisions, as built

| Ruling | Card | Worksheet | Quiz |
|---|---|---|---|
| (a) × "How much is 4 threes?" then "3, 6, 9 (counting by threes)" | yes | yes | yes |
| (b) a wrong answer keeps the teacher's dots and adds the next support, on every skill | yes | yes | yes |
| (c) count-all: the count shows only after answering | yes | yes | yes |
| (d) ÷ tally taps are a follow-up | recorded in S1.8 | | |
| Lead: a column stack counts per column, and the line shows only the column touched | yes | yes | yes |
| Lead: after a wrong answer, the count shares the ladder message row | yes | not applicable (reserved line) | yes |

## Score table (round 5)

| Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|
| Print S / M / L, all roles in scope, pupil + key | 9 | 9 | 9 | 9 | yes |
| Practice card, 1366 × 650 and 1280 × 600, mouse + touch + keyboard | 8 | 9 | 8 | 8 | **yes** |
| Online worksheet, same | 8 | 9 | 8 | 8 | **yes** |
| Quiz, same | 8 | 9 | **7** | 8 | **no** (Q5-1) |
| Basic 390 (ladder gate shots, card, worksheet, quiz) | no h-scroll; the boxes and Start again can be tapped | | | | basic OK (phone polish deferred) |

## Defects (round 5)

**Q5-1 · Major · C3 −2 · quiz with instant feedback, touch. The first tap on Next after typing is swallowed. Live on main.**

Measured (add_facts, subtract, mult_facts, with a wrong or a right answer, at both sizes):
- Type the answer in the box, then tap Next.
- The question does not change, and the pupil has to tap again.
- Next moves from top 402 to 476 (wrong answer, ladder message) or to 454 ("Correct!").
- Main (`c4188955`) does the same: 402 → 452 / 454.
- Every "end" quiz, every mouse click, and Enter / Tab are fine.
- Multi-box items (the column stack, time_quarter, write_fraction, add_wp_20) are not hit: their change does not
  fire on the tap.

Cause. The event order for a touch tap is:
- pointerdown, then pointerup;
- then the compatibility **mousedown**, and that is where the box blurs and fires `change`;
- then mouseup and click.

`_qtPointerDown` is already false by the time `change` fires. So `refreshQuizFeedback` inserts the feedback (and draws the ladder)
at once, and the button moves before the click lands.

This is exactly the Chromebook-fit R2-1 failure ("the first Next after typing was swallowed"). It came back with the
in-place feedback.

Fix. Treat the whole gesture as "pointer down":
- set the flag on `mousedown` too, and clear it on `click` (or after a short timeout);
- or defer whenever the box's blur `relatedTarget` is a quiz nav button.

Either way, nothing may move under a press that has not ended.

Proof:
- a touch tap on Next right after typing moves on at 1366 × 650 and 1280 × 600, with instant feedback, wrong and right;
- Previous then shows the feedback and the ladder;
- add a touch case to `ws-touch-tap` or `ws-chromebook-fit`.

**Q5-2 · Minor · C3 −1 (quiz, card at 1280 × 600) · column stacks. The count line and Start again can start under the pinned bar.**

Measured with add_column_multi and the teacher's touch, at scroll 0:
- **Quiz, both sizes:** the line's top is at 580 (650 after a wrong answer), under the pinned Previous / Next bar.
- **Card at 1280 × 600:** the line is at 544–588, under the pinned Hint / Check bar.
- **Card at 1366 × 650, after a wrong answer:** the line is at 619–663, under the same bar.

So the pupil taps the dots, but "Touched N" is hidden until they scroll 110 to 290 px. A tap on what shows of Start
again lands on the bar.

After a ladder-only wrong answer on the quiz at 1280 × 600, the message row itself shows only its top half above the
bar (`out/row-add_column_multi-quiz-1280.png`).

The page does scroll, and everything is reachable. The worksheet is fine: there is no pinned bar over a card.

Fix. On the first count in a cell, if the line is under a pinned bar, scroll the page by the least amount that clears
it. The tap itself already moves nothing, so this is the one allowed move. Or keep the stack line beside the
stack (right of the answer row) when there is room.

Proof: at scroll 0, after one tap, `elementFromPoint` at Start again's centre is the button, on the quiz at both
sizes and on the card at 1280 × 600.

## The quiz-take.js change (refreshQuizFeedback), judged on its own

What works:
- **Instant feedback is back.** 11 skills were run with instant feedback: add_facts, subtract, mult_facts, div_facts,
  add_column_multi, time_quarter, write_fraction, nearest_100, value, add_wp_20 and number_bonds (compare_groups has no typed box and was skipped).
  - Enter on a wrong answer shows the ladder message in place and draws the rung in the cell.
  - Tab does the same, and keeps the focus on Next.
  - Previous redraws the feedback and the ladder.
  - Review & Submit, then Back, keeps them.
  - The console is clean.
- **"end" quizzes show nothing:** no feedback line and no ladder, on every skill, before or after Next / Previous.
- **The pointer deferral works for the mouse.** A mouse click on Next after typing moves on first time.
- ws-chromebook-fit still passes.

What fails:
- Touch: Q5-1.

## View: the column stack's earlier greys

**Keep them, as built.**
- The greys are the pupil's record of which columns are done. On paper, the pupil's marks stay too.
- Clearing them on a new column would make the pupil lose their place in a 3- or 4-addend sum.
- The count line already starts again for each column, so the number the pupil reads is never mixed up.
- Start again clears everything, which is the right way out.

## Out of lane (recorded, not scored)

- On the quiz, once the ladder is spent the answer is revealed ("Incorrect. The answer is: 900"). This is
  pre-existing ladder design, not a lane change.
- A count-all quiz item answered right also shows "Touched N" after the answer. That follows ruling (c).

## What would raise the quiz to 8+

Fix Q5-1 (the touch gesture flag), with a touch case in a gate. Q5-2 is a Minor fix and should ride along. Paper,
card and worksheet need nothing more.
