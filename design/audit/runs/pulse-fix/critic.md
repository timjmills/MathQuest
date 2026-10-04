# Critic: next-answer-box pulse (commit 572a96b)

Critic: independent, Opus medium, 2026-10-04. Graded what renders in headless Chromium (puppeteer via
`/tmp/mq-browser-run.sh`), not what the code intends. Probes are in the session scratchpad under `pulse-critic/`:
`flow.cjs` (type, tab, tap, blur per host and width), `cases.cjs` (blur before typing, a right box refocused,
tapping a red box, non-answer views), `perf.cjs` (idle churn), `zoom.cjs` (3x crops and reduced motion), and
`sweep.cjs` (the builder's all-skill probe plus a whole-document count and an entry-order check).

## Verdict: FAIL

| Host | C1 Ease | C2 Teach | C3 Layout | C4 Fidelity | Pass |
|---|---|---|---|---|---|
| Practice card, 1280 and 390 | 8 | 7 | 7 | 8 | no |
| Online worksheet, 1280 and 390 | 7 | 6 | 7 | 8 | no |
| Quiz, 1280 and 390 | 8 | 7 | 7 | 8 | no |

There is also a blocking defect outside the rubric: a continuous requestAnimationFrame loop (D1).

## What passed (measured)

- **Exactly one active box.** The whole-document `.mq-active-box` count is 1 for every skill that has answer boxes:
  card 390 428/428, quiz 390 587/587, worksheet 1280 455/455. The glow moves (box-shadow sampled 450 ms apart).
  Errors 0.
- **Moves as the pupil types, tabs and taps.** This holds for stacks (digits run ones to tens), fact families
  (box 0 to 1 on Tab), count rows (`gf-cell` / `mq-cellslot` 0 to 1) and word-work, on all three hosts at 390 and 1280.
- **Right boxes never pulse.** If a right ones box is refocused, it stays green (`rgb(227,244,234)`, no
  animation) and the pulse sits on the next empty box. A red box tapped clear becomes the pulsing box (case 3b).
- **Non-answer inputs.** Home search and Skills Organizer search have no active box and nothing animates. The
  only other users of `#questionCard` are the MAP test, which is a pupil screen.
- **Reduced motion.** Six samples over 1.2 s are identical: `animation: none`, fill `#fff3a0`, ring 5 px.
- **Placeholders.** No visible placeholder on any host in any sweep.
- **Console.** 0 errors in every run.

## Defects

### D1 · critical (blocks the pass): the MutationObserver re-triggers itself every frame
- **Where:** `js/modules/active-box.js:52` `keep.forEach(el => el.classList.add('mq-active-box'))`, together with
  the observer at line 67 (`attributeFilter: ['class', …]`).
- **Measured** (`perf.cjs`, card idle, unfocused, after it has settled):
  - 270 requestAnimationFrame calls in 3 s.
  - 180 `attributes:class` mutation records whose old value equals the new value
    (`fact-family-input mq-active-box`).
  - 0.118 s of script in 3 s.
  - On home, where no box is active, the same counts are 0 and 0 s.

  `classList.add` of a token that is already present still writes the attribute. That queues a mutation, which
  calls `schedule()`, which runs `refreshActiveBox()` on the next frame, which adds the class again. The loop
  never settles while a box is active. Each frame it runs `querySelectorAll`, `getBoundingClientRect` and
  `getComputedStyle` over every input in the host. That drains battery on the classroom iPads and Chromebooks.
  The cost grows with the box count (a word problem has 28 boxes).
- **Fix:** only write when the state changes:
  `keep.forEach(el => { if (!el.classList.contains('mq-active-box')) el.classList.add('mq-active-box'); });`
  Removal is already guarded. As a belt-and-braces step, observe with `attributeOldValue: true` and ignore
  records where `r.oldValue === r.target.getAttribute(r.attributeName)`.
- **Proof:** in `perf.cjs`, "CARD active, unfocused" must report `raf3s` ≤ 2 and `recs` `{}`. Add the same
  idle assertion to `tests/scripts/wave1-a-probe.cjs`.

### D2 · major (worksheet C2 −2, C1 −1; card C2 −1): stack digits pulse the TENS box first, against SP-20 ones-first entry
- **Where:** `js/modules/active-box.js:39` `pickActive()` picks the first empty box in DOM (left-to-right) order.
- **Measured:**
  - Worksheet 1280, at start: 25 skills point the pupil at the leftmost digit. These are add/sub 10 to 1k
    (regroup, no_regroup and mixed), `add_column_multi`, `mixed_add_sub` and `equal_sign`.
    `worksheet-1280-add_100_regroup-0.png` shows the tens box yellow and the ones box white.
  - Card: the same happens as soon as focus leaves before the pupil types, for example after tapping Hint or Read
    (case 1: tens x=613 pulses, ones x=667 does not).

  `wireStackEntry()` (screen-cell.js:452) teaches right-to-left entry, and the pulse contradicts it. A pupil who
  taps the pulsing box starts in the tens column.
- **Fix:** in `pickActive()`, put the boxes in teaching order before the `find`. For each `.ws-stack`, list its
  `input.mq-digit` boxes in reverse (ones first) at the position of the stack's first digit. Leave every other
  box in DOM order. For example, build `ordered` by walking `boxes`. When `el.matches('input.mq-digit')` and
  `el.closest('.ws-stack')` has not been seen yet, push that stack's digits `.reverse()`. Run the `next` search
  over `ordered`.
- **Proof:** `sweep.cjs worksheet 1280` prints `ORDER defects 0` for `STACK-NOT-ONES-FIRST`. `cases.cjs` case 1
  shows `mq-active-box` on the x=667 (ones) box.

### D3 · major (C2 −1 on all hosts; worksheet C1 −1): word-work optional regroup boxes pulse as "next"
- **Where:** `js/modules/active-box.js:12,39`. `OPTIONAL` is tested only against `className`. Word-work regroup
  boxes are `input.mq-wwork.mq-wwsmall data-mq-kind="regroup"` (sheet/cells/word-work.js:579), so they are not
  excluded.
- **Measured:**
  - Quiz 390 at start: 37 skills. Worksheet 1280 at start: 38 skills. These are every `add_wp_*`, every
    `sub_wp_*`, `add/sub_word_problems(_plain)` and `algebra:multi_step_word(_plain)`.
  - On the card, the regroup box pulses after any blur (card-390 add_wp_10 "blur" step).

  `card-390-add_wp_10-1.png` shows the small regroup box pulsing for 2 + 4, which never regroups. That tells the
  pupil to write a regroup digit.
- **Fix:** `const isOptional = (el) => OPTIONAL.test(el.className + ' ' + (el.getAttribute('data-mq-kind') || ''));`
  Use it in place of `OPTIONAL.test(el.className)` at line 39.
- **Proof:** `sweep.cjs quiz 390` and `sweep.cjs worksheet 1280` print 0 for `OPTIONAL-REGROUP`.

### D4 · major (C3 −1 on all hosts): the glow ring is overpainted by the neighbour box or clipped by its row
- **Where:** `css/screen-cell.css`, the new `.mq-active-box.mq-active-box.mq-active-box` rule. Its outer
  `box-shadow` ring (3 px solid plus up to 9 px halo) paints outside the box.
- **Measured** (3x crops):
  - `zoom-ws-stack-390.png`: the ones box paints over the tens box's ring on the right, so the ring shows on
    3 sides only.
  - `zoom-wp-regroup-390.png`: the regroup box's ring is cut flat at the top by its row. Only side bars and a band
    under the box show, so it reads as a smear rather than a ring.
  - The same overlap is visible at 1280 in `worksheet-1280-add_100_regroup-0.png`.
- **Fix:** draw the ring inside the box so neither neighbours nor `overflow` can cut it:
  `box-shadow: inset 0 0 0 3px #f2c200, inset 0 0 0 var(--mq-next-ring) rgba(242,194,0,.45) !important;`
  Change the keyframes to `--mq-next-ring: 3px → 7px`, and the reduced-motion ring to 5px. Keep the pulsing fill.
  Keep it ADDITIVE by appending an override rule at the end of the file.
- **Proof:** re-run `zoom.cjs`. Both crops must show a closed, even ring on all four sides.

### D5 · minor (no score cost; note for the owner): the worksheet has two pulsing things
The current `.problem-card.mq-active-problem` keeps its own `mq-active-card-pulse` (screen-cell.css:1335,
Wave 1 1.2) beside the pulsing box. It is the approved earlier design, so it costs no points. If the owner wants
"one pulse" literally, make the card highlight steady:
`animation: none` on `.mq-active-problem`, keeping the `#fffbe0` fill and the 4 px ring.

## What raises each score to 10
- **C1:** D2 and D3 fixed, so the first pulse is always where the pupil should start.
- **C2:** D2 and D3 fixed. Also, a focused red box with a wrong digit currently shows yellow fill over the red
  (`mq-live-wrong` loses its `#FDE7E4` while focused) and keeps only the dashed outline. Keep the red fill while a
  wrong digit is still in the box: add `:not(.mq-live-wrong)` to the fill declaration, or exclude
  `.mq-live-wrong` with a value from `active` in `pickActive()`.
- **C3:** D4 fixed.
- **C4:** D4 fixed. The yellow stays in the screen-only feedback band SP-30 allows. Print is unaffected
  (`@media print` rule at screen-cell.css:1362).

---

# Round 2 (commit c4d5d68)

Critic: independent, Opus medium, 2026-10-04. I re-ran my own probes one at a time through
`/tmp/mq-browser-run.sh`. Logs are in the scratchpad under `pulse-critic/r2/`. One new probe,
`pulse-critic/expect.cjs`, asks of every word-problem skill whether the pulsing box expects a value.

## Verdict: FAIL (one defect left, D6)

| Host | C1 Ease | C2 Teach | C3 Layout | C4 Fidelity | Pass |
|---|---|---|---|---|---|
| Practice card, 1280 and 390 | 8 | 7 | 9 | 8 | no |
| Online worksheet, 1280 and 390 | 7 | 7 | 9 | 8 | no |
| Quiz, 1280 and 390 | 7 | 7 | 9 | 8 | no |

## Round 1 defects: all closed (measured)

- **D1 closed.** `perf.cjs`, idle card with a box active: `raf3s 0`, `recs {}`, ScriptDuration 0.000 s.
  - In `flow.cjs` the idle readings are 0/0 on card and quiz at both widths.
  - On the worksheet they are 1–2 rAF and ≤ 34 mutations per 2 s. Those come from the worksheet's own widgets,
    not a loop.
- **D2 closed.** Card blurred before typing: the ones box pulses (x=667 at 1280, x=219 at 390), the tens box
  does not.
  - Worksheet stacks start on the ones box (`zoom-ws-stack-390.png`).
  - Order defects from `sweep.cjs`: card 1280 0, card 390 0, worksheet 390 0. The coordinator reports worksheet
    1280 and quiz 390 as 0.
- **D3 closed.** No regroup or carry box pulses in any sweep.
- **D4 closed.** In `zoom-ws-stack-390.png` and `zoom-wp-regroup-390.png` the ring is inside the box and closed
  on all four sides. No neighbour overpaints it and no row clips it.
- **Extra closed.** A focused `.mq-live-wrong` box keeps its red fill.
- **Still true:**
  - Exactly one box is active. Card 1280 428/428, card 390 428/428, worksheet 390 455/455, all moving, 0 errors,
    0 visible placeholders.
  - A right box never pulses (case 2), and a red box tapped clear becomes next (case 3b).
  - Home and Skills Navigator inputs never pulse.
  - Reduced motion is steady: `animation: none`, `#fff3a0`, inset ring 5 px.
  - 0 console errors in every run.

## D6 · major (C2 −1 on all hosts; C1 −1 on worksheet and quiz): the pulse lands on a word-work box that must stay EMPTY

- **Where:** `js/modules/active-box.js`, `pickActive()`, the `next` search. Word-work operand boxes are
  `input.mq-wwork` with `data-mq-expect` (sheet/cells/word-work.js:579). A box the item does not use carries
  `data-mq-expect=""`.
- **Measured:**
  - `expect.cjs quiz`, 1280, at question start: in **24 of 46** word-problem skills the pulsing box expects
    nothing. Those are every `add_wp_*` / `add_wp_*_plain`, `add/sub_word_problems(_plain)`,
    `mult_word_problems(_plain)`, `word_problems_mixed_plain` and `multi_step_word_plain`.
  - Example, `add_wp_10` (2 + 4): the pulse sits on the TENS box of the top row (worksheet x=232, quiz x=609 at
    1280, crop `zoom-wp-regroup-390.png`). The "2" belongs in the ones box beside it. A pupil who follows the
    pulse writes 2 in the tens place, which reads as 20.
  - The card shows the same thing after any blur (flow-card-1280 / 390 `add_wp_10` "blur" step). The worksheet
    and quiz show it at the start, because they do not autofocus.
  - In round 1 the regroup box sat in this spot. D3 moved the pulse one box down, onto another box that must
    stay blank.
- **Fix:** in `pickActive()`, skip word-work boxes the item does not use. For example, add
  `&& !(el.matches('input.mq-wwork') && el.getAttribute('data-mq-expect') === '')` to the `next` predicate,
  next to `!isOptional(el)`.
  - Restrict it to `input.mq-wwork`. Do not apply it to the answer row (`.mq-wwans` / host digit boxes).
    Skipping blank answer digits would tell the pupil how many digits the answer has.
  - The operand rows hold numbers given in the story, so skipping them leaks nothing.
- **Proof:** `expect.cjs quiz` and `expect.cjs card` (the card variant blurs first) print
  `pulsing a word-work box that expects NOTHING: 0`. The `sweep.cjs` order checks stay at 0.

## What raises each score to 10
- **C1 and C2:** D6 fixed, so on every host and every skill the first pulse is a box the pupil must fill.
- **C3:** at 9 now. The inset halo grows to 9 px inside the box. On the small regroup-size boxes that tints the
  glyph area while the pupil types. To reach 10, cap the inner halo at 6 px: keyframes 50%
  `--mq-next-ring: 6px`.
- **C4:** at 8. The highlight is screen-only and allowed by SP-30. To reach 10, the owner needs to rule on D5:
  the worksheet card pulses beside the box, so the worksheet shows two pulsing things.
