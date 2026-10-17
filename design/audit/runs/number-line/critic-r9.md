# Custom number line at the top of the page (MASTER_PLAN 5.2): critic, Round 9 (re-check of R8-D1, the scroll guard, the pool flicker)

Critic: independent. Tree `d6075045` (fix for R8-D1 on top of `d6bd2639`). Date 2026-10-16. My only changes are this file and the
`r9/crit9-*` files. The builder's `r9/lane-sum.txt`, `lane-off-sum.txt` and `pool-sum.txt` are untouched. I ran one browser at a time,
each on its own free port (the harness picks port 0).

- `crit9-lane-sum.txt`: r8's probe `r8/hdr8.cjs`, rerun unchanged on this tree. It covers 104 sessions: 1366x650, 1280x600, 1366x768 and
  1280x720, plus phone 390x844. Each session runs mouse and touch; queue (timer 3:00), T300 and T0; sub_100_regroup, nl_mult, add_facts
  and the mixed_addition pool (0..100); q1 to q3 through Check and the real auto-advance; with a frame-by-frame scroll trace.
- `crit9-lane-off-sum.txt` / `crit9-main-off-sum.txt`: the same probe with the line off, on this tree and on a `git archive` of main
  `e53677e0` (48 sessions each, 1366x650 and 1280x600).
- `crit9-adv.cjs` / `crit9-adv-sum.txt`: my adversarial probe of `_guardRefLine()`, with the line on and off. Every case starts at a fresh
  render, so it lands inside the guard's 1.5 s. The cases are: PageDown with the caret in the box, ArrowDown with nothing focused, a
  scroll with no wheel, pointer or key (a stand-in for a scrollbar drag or a screen reader), Tab through the card, typing the answer,
  Hint / Read / Solution opened, window listeners after 6 renders, and leaving the game inside the window and then scrolling Home.
- `crit9-who.cjs` / `crit9-who-line*.txt` / `crit9-who-off.txt`: a mixed-pool trace that wraps every programmatic scroll
  (scrollTo/By, scroll, scrollIntoView(IfNeeded), focus without preventScroll, select, setSelectionRange, scrollTop) and logs who called
  it, frame by frame.
- `crit9-phone.cjs` / `crit9-phone.txt`: why q1 on the phone does not take the typed answer (this tree and `d6bd2639`).
- `crit9-neg-control.txt`: the extended `timedHeaderCases` run against `d6bd2639`'s app and against this tree.
- `crit9-print.txt`: r8's `tp8.cjs` run through the teacher Print screen. `crit9-gates.txt` and `crit9-gate-support-numberline.txt`: the
  gates.

The rulings are the same as in rounds 5 to 8: the owner-accepted builds, a mixed-pool band that scrolls above when the problem itself is
too tall, and add_decimal's active-box fault. Stretch, the thinking pages, stand-alone Guided / Model pages and phone polish are not
graded.

## Verdict: PASS (R8-D1 fixed; one minor, non-blocking defect R9-D1, the mixed-pool flicker the line magnifies)

The late correction is gone. At every desktop size, with the line on, no non-pool session moves the page at all from the first frame to
q3 (`crit9-lane-sum.txt` has no `seg` trace on any desktop non-pool step). The 60 px drop at the start of a timed 1280x600 session is
gone, and so is the 15 px bounce on each sub_100_regroup question. The band settles at 70 (or 66 at scroll 4) below a bar ending at 59.
It is never under the bar while the box and Check fit, except after Check on the pool, which r8 accepted. The guard does not fight a
pupil in any way that hides a box or Check. It does not trap the page. It keeps one set of listeners, which does not grow. It does
nothing after the pupil leaves the game. With the line off, every page settles exactly where main's does.

What remains is the mixed pool at 1280x600 and 1366x650 (R9-D1). On some stacked items, the page flips between scroll 0 and 77–79 (27
at 1366x650) 3 to 10 times within about 1 s after the item appears, and again while the pupil types. The cause predates this lane:
`fitCellDigits` drops the cell's zoom for a moment, the page clamps to 0, and the active-box keeper scrolls back. With the line off,
the same flicker happens on the same kinds of item at 10 px. The band's height magnifies it about 8 times. It ends in view, so I grade
it as minor and not a 7 (reasoning below). It should still be fixed in this lane.

| Criterion | Score | Why |
|---|---|---|
| C1 Ease of use | 8 | R8-D1 is fixed. 0 desktop non-pool steps have the band under the bar while the box and Check fit, and 0 visible moves across 4 sizes x 3 sets x 3 starts x 2 inputs x q1–q3 (the r8 tree had a 60 px drop and a 15 px bounce). There are 0 box-out steps and 0 page errors, and every desktop tap gives dy 0. The guard never hid a box or Check (adversarial table). Held below 9 by R9-D1, by the guard holding a pupil's own scroll for up to 1.5 s (N2), and by r8's toast nit (N1, now also seen to swallow the first tap on the phone). |
| C2 Educational value | 8 | Unchanged. The right line on every host: sub_100_regroup 0..100 / 5, nl_mult 0..100 / 10, add_facts 0..20 / 1, the pool 0..100 / 5. Print: nl_mult 0..100 / 10, sub_100_regroup 0..100 / 5, add_facts 0..20 / 1 on the pupil page and its facsimile key. Tests have no line by default and get it with Hints on tests. |
| C3 Spacing and layout | 8 | Unchanged (no layout file changed since r8): no overlap of band and dots (support-numberline R6-D1 ok), and the dots sit in the card's top line. On paper, each page keeps its band, after-page keys interleave P K P K, and short keys stay lists. |
| C4 Standard fidelity | 8 | Black and white band, Andika, live width. The key is a facsimile with the same band, and the key ink is on answers only. Lint 461 / 33, equal to r8's baseline. |

## R8-D1: re-check (fixed)

| Check | Result |
|---|---|
| Start of a timed session at 1280x600 (queue / T300, sub_100_regroup and nl_mult) | **no move**: scroll 0, band 70, bar 59 from the first frame (r8: `119/-49 > 67/3 x15 > 7/63`, a 60 px drop) |
| Each new sub_100_regroup question at 1280x600, timed and T0 | **no move** (r8: `7/63 > 22/48 x19 > 7/63`, a 15 px bounce) |
| `BAND-UNDER-HDR(fits)`, desktop, non-pool | **0** steps. Pool: 15 steps, **all `q*-checked`** (after Check the page scrolls to the feedback, as on main; the accepted ruling) |
| Box / Check in view (desktop) | 0 box-out. `chkOut` 24: all are phone steps (Check below the fold, as without the line; not graded) |
| Taps on the active box | dy 0 on every tap (desktop and phone; `tapJump` 0) |
| Gate `timedHeaderCases` (now q1–q3, frame trace, bounce check, untimed T0 link added) | **real**: on `d6bd2639`'s app it fails 7 of 12 cases (18 findings), e.g. `held scroll 67 > 7 > 22 > 7 > 22 > 7`. On this tree it passes 12 of 12 (`held scroll 0 > 4`, `0 > 5`, `0`). |
| Line off vs main `e53677e0` | **identical**. All 36 non-pool sessions hold the same scroll positions at every step (the traces differ only by a single leftover frame from the previous page load and by frame counts). The 12 pool sessions differ only by their random items. 0 fits-under, 0 bounces, 0 errors on either tree. The new code runs only when `#mqRefLine` exists: the guard and the preventScroll focus are both gated on it, and `_syncRefLine()` with the line off is the old call, made once more before the item renders. |

## The guard `_guardRefLine()`: adversarial results (`crit9-adv-sum.txt`, line on vs off, 1280x600 and 1366x650)

| Pupil action inside the 1.5 s | Line on | Line off | Ruling |
|---|---|---|---|
| PageDown with the caret in a box (the guard ignores keys aimed at an INPUT) | sub_100_regroup: `0>3>9>7>11>7`, held at 7 (page max 67). The pupil's scroll is cut back to the band's place, with a 1-frame wobble of about 4 px. nl_mult / add_facts: no move (Chrome does not page from a text input there). | no move (page is exactly the window, nothing to scroll) | N2 (nit). Nothing the pupil needs is below: at 1280x600 the extra 60–67 px the band adds is the card's bottom margin. Box and Check stay in view. After 1.5 s the pupil can scroll freely. |
| ArrowDown x3, nothing focused | nl_mult scrolls to 40 and **stays** (the keydown stops the guard). sub_100_regroup / add_facts: the active-box keeper takes the focus back first, so the arrows go to the box. | same | ok, no fight |
| A scroll with no wheel, touch, pointer or key (a scrollbar drag, a screen reader) | pulled back to 7–10 (band just below the bar) | no scroll possible | N2. Headless Chrome hides scrollbars, so I could not test a real drag. If a press on the scrollbar fires `pointerdown`, that stops the guard; this row is the worst case either way. |
| Tab through the card | hintBtn, ttsBtn, Check, then the bar buttons, then back to the box. Every control was reachable. The page settled 0–7 (pool: 152 > 267 to show the word cells). | same order | ok |
| Typing the answer right after a render | non-pool: no move (`0x57`). **Pool 1280x600: `79>0>77>0>79>0>77…` about 10 flips** (1366x650: 27/29 ↔ 0, about 18 flips) | `0x62`, `0x71` (no move) | **R9-D1** |
| Hint, Read (Listen) and Solution opened, then a 120 px scroll | the pop-up opens; the scroll is held at 7–10 on non-pool (page max ~67). Pool: Read 45 > 99, Solution 27 ↔ 0 flicker > 122 (R9-D1). | pop-ups open; scroll free | ok (the pop-up never moves off-screen) |
| Window listeners after 6 more renders | scroll 2, wheel / touchstart / pointerdown / keydown 1 each, **unchanged** (wired once) | scroll 1 | no leak |
| Leave the game inside the window, then scroll Home to 300 | stays at 300 (band hidden, `!scrollY` and the hidden-box checks keep it inert) | 300 | ok |

The guard can neither trap the page nor hide a box. The worst it does is hold the pupil's own scroll for up to 1.5 s on a page whose
only hidden part is the bottom margin.

## Defects

**R9-D1 (minor, C1, non-blocking; the lane's to fix): on the mixed pool at short screens, the line magnifies a pre-existing scroll flicker to 77 px.**
Evidence: `crit9-who-line2.txt` (run0 q2–q3), `crit9-who-line.txt` (run0 q1–q2, run3 q3–q4), `crit9-who-off.txt` (run7 q2–q3, run3
q4), `crit9-adv-sum.txt` (typing rows), `crit9-lane-sum.txt` (1366x650 pool `0/70 > 27/43` x6–7), and the builder's `pool-sum.txt`.
- What a pupil sees: with the line on at 1280x600, on about 1 in 5 pool items (column stacks, `column-add`, and on one occasion a fact
  item), the whole page flips between scroll 0 and 77–79 3 to 10 times in about 0.5–1 s after the item appears. It flips again with
  each digit typed in the first 4 s. At 1366x650 the flips are 27 px. The page ends in view (0 or 77, box and Check visible).
- Cause, from the call traces: each flip back to 0 has **no programmatic caller**. It is a clamp. The keeper's
  `revealSettled → scrollIntoView` (active-box.js:142) scrolls to 77. The class change on the box re-runs `monoCell`'s `afterInk`
  → `_fitCardDigits` → `fitCellDigits`, which does `root.style.removeProperty('zoom')` and measures before it sets the zoom again. For
  that forced layout the unzoomed cell is shorter, so the document no longer reaches 600 + 77, and Chrome clamps the scroll to 0. The
  keeper sees the box below the fold and scrolls back, and the loop repeats until its 4 s window ends. **`_guardRefLine` is not
  involved** (no `scrollBy` in any flicker trace).
- Whose it is: the mechanism is on main. With the line off, the same loop runs on the same kinds of item at **10 px**
  (`0>10>0>10…`, 3 of 32 items). The probe's 2-frame rule misses it, so r8 and the line-off summaries show 0. The band's ~70 px pushes
  the box further below the fold, so the clamp and the jump back grow about 8 times, from barely visible to plainly visible. It
  happens only with the line on, and visibly only because of it, so the lane owns the fix. It is not a regression of d6075045:
  `d6bd2639` shows it too (builder's note, and r8 N3 on the pre-fix tree).
- Why minor and not a 7: it is limited to the mixed pool at the two short screen sizes, and the pool already sits under the "problem
  too tall" ruling. It lasts at most the keeper's first seconds, it never leaves the box or Check out of view, and the typed digits
  land where they should. It is still the most visible motion left in the lane, and for this pupil group a flickering page is a real
  distraction. It must not be carried past the next lane change.
- Fix direction (any one): (a) in `fitCellDigits`, keep the page still across the measure: note `scrollY` before
  `removeProperty('zoom')` and, if it changed after the zoom is set again, `scrollTo` it in the same task (nothing paints in between). Or
  measure the numerals at the current zoom and divide, without dropping it. (b) Make `afterInk` re-fit only when the cell's content
  changed, not on class-only mutations (`mq-active-box`, `mq-live-correct`). (c) In `revealSettled`, do not answer a scroll that a
  layout clamp caused (for example, skip when `scrollY` became 0 while `scrollHeight` did not change). Add a gate case: the pool at
  1280x600 with the line on, a seeded stack item, a frame trace, and failure on more than 2 direction changes of more than 3 px within
  any 1 s (single frames counted, unlike the current held-2-frames rule, which is why `timedHeaderCases` and my probe's summary miss
  it).

**Nits (not blocking)**
- N1 (from r7/r8, extended): the "Starting Practice with 1 skill!" toast (`.mq-notify`, fixed, 756–824 on a 390x844 phone) covers the
  band's right ticks on desktop q1. On the phone it can also sit on the active box at q1. The first tap then lands on the toast, focus
  drops to the body, and the digits typed go nowhere (`crit9-phone.txt`). This is not this lane's change: `d6bd2639` shows it too, and
  with the line off (nl_mult OFF on `d6bd2639`). Whether it happens depends on where the item puts the box. The phone is not graded.
  Worth one line in the toast code: do not cover the focused box, or let taps pass through.
- N2: the guard treats every scroll in the first 1.5 s as programmatic unless a wheel, touch, pointer or non-INPUT page key came first.
  PageDown from inside a box (an INPUT target) is therefore cut back to the band's place, with a 1-frame wobble of about 4 px
  (`0>3>9>7>11>7`). The active-box keeper counts arrow and page keys as the pupil's own even inside an input. Making the guard do the
  same (drop the `INPUT` exclusion for PageUp / PageDown / Home / End) aligns the two.
- N3: `timedHeaderCases` covers sub_100_regroup and nl_mult with the mouse only. It does not cover add_facts, the pool, or touch, and its
  bounce rule ignores single-frame flips (see R9-D1).

## r8's passing items: quick re-check (no regression)

Only `js/modules/question-render.js` (app) and `tests/lib/refline-dots.cjs` (gate) changed since r8. No print, worksheet or quiz file
changed.

| Item | Result |
|---|---|
| Dots row vs band | support-numberline R6-D1 lines all ok |
| Online worksheet band | ws-screen-answer worksheet ok (worksheet.js never calls `renderQuestion`, so the guard cannot reach it) |
| Quiz draws no line | no quiz file changed; no refline code in quiz-*.js |
| Print via the teacher Print screen, line on (`crit9-print.txt`) | nl_mult key at end: P P K K, band 0..100 / 10 on all four pages, key ink on K only. Key after each page, copy: P K P K, each key a facsimile with band and 4 cells. Short keys: P k P k, keys are lists, pupil pages keep the band (nl_mult; sub_100_regroup 0..100 / 5). add_facts Test with Hints on tests OFF: no band on P or K. Hints ON: band 0..20 / 1 on P and the facsimile K; after-page short: P (band) k. Line off: no band anywhere. 0 errors. Same as r8. |

## Gates (one browser gate at a time, own free port via the harness)

| Check | Result |
|---|---|
| `ws-boot-smoke` | OK |
| `support-numberline` (with the extended `timedHeaderCases`: 12 cases q1–q3, frame trace) | OK |
| `ws-screen-answer` | OK |
| `ws-code-snapshot.mjs` | OK (608 codes / 35 categories, nothing moved, 2525 option round trips) |
| `ws-print-lint --source kit` | 461 findings in 33 of 191 documents. Exit 1, as at baseline (r8: 461 / 33) |
| `node --input-type=module --check` question-render.js | ok |
| My probes | 104 lane + 48 + 48 line-off sessions, 16 adversarial sessions, 44 traced pool items, 0 page errors |
