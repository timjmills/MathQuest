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
