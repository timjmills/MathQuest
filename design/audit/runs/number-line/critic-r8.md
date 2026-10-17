# Custom number line at the top of the page (MASTER_PLAN 5.2): critic, Round 8 (focused re-check of R7-D1 and the main merge)

Critic: independent. Tree `789f23f7` (fix for R7-D1 on top of `e189119f`, the merge of main `e53677e0`). Date 2026-10-16. My only
changes are this file and `r8/`. My probes, summaries and the screenshots that matter are in `r8/`:

- `hdr8.cjs` is my own probe. It does not use the lane's selector list: the header is every sticky or fixed element pinned at the top
  (toasts and pop-ups excluded), and band cover is `elementFromPoint` over a 19 x 4 grid of the band plus every tick label. It runs a
  real session through the queue (whose default has a timer, 3:00), a `?c=` link with `T300`, and a link with `T0`. It covers
  sub_100_regroup, nl_mult, add_facts, and the mixed_addition pool with ends 0..100, at 1366x650, 1280x600, 1366x768 and 1280x720, mouse
  and touch: 96 sessions. Per session it measures q1, a tap on the active box (page jump dy), typing the right answer, Check, the real
  auto-advance, then q2 and q3. A rAF trace records scrollY and the band's top on every frame, so any visible move shows up. Phone
  390x844 touch: 8 sessions. Summaries: `lane-sum.txt` (this tree) and `pre-sum.txt` (the same tree with the pre-fix
  question-render.js; 1280x600 and 1366x650, 48 sessions).
- `lane-off-sum.txt` / `main-off-sum.txt`: the same probe with the line off, on this tree and on a `git archive` of main `e53677e0` (48
  sessions each).
- `neg.cjs` / `neg-control.txt` hold the new gate case, run on the pre-fix tree and on this tree.
- `tp8.cjs` builds sheets through the teacher Print screen (tvOpenPrintWith, Page types, key placement and style buttons, the Hints on
  tests switch, Print). It reads the document the Print button writes into `#tvPrintFrame`.

The rulings applied are the same as in rounds 5 to 7: the owner-accepted builds, the mixed pools' band scrolling above when the problem
itself is too tall, and add_decimal's active-box fault. Stretch, the thinking pages, stand-alone Guided / Model pages and phone polish
are not graded.

## Verdict: PASS (R7-D1 fixed; one minor, non-blocking defect R8-D1)

At 1280x600 and 1366x650, in timed and untimed sessions, through the queue and links, with mouse and touch, the band now settles below
the sticky play bar on every question whenever the box and Check fit. The box and Check are always in view, and every tap lands with
dy 0. Before the fix, the same probe found 100 measurements with the band under the bar although the page fit. This tree has none,
apart from the accepted mixed-pool cases. Line-off sessions are byte-for-byte main's. Print is unharmed by the merge. Key placement and
style, and Hints on tests, work from the teacher screen with the line on.

The correction does land about 300 ms late, though, and a pupil can see it (R8-D1). I grade this a C1 nit-level defect, not a 7: no
information stays hidden, the box and Check never leave view, and the page settles in about 0.3 s. It should still be fixed the next
time the lane is touched.

| Criterion | Score | Why |
|---|---|---|
| C1 Ease of use | 8 | R7-D1 is gone. sub_100_regroup / nl_mult at 1280x600 timed now show band 63–116 under a bar ending at 59 (pre-fix 3–56 / 10–63). 1366x650 sub_100_regroup timed: 63 (pre-fix 53, partly under the bar). At 1366x768 and 1280x720 nothing is under the bar. In all 104 lane sessions the box and Check stayed in view at every desktop step, every tap gave dy 0, and there were 0 page errors. Held below 9 by R8-D1 (a visible late nudge: 60 px once at the start of a timed 1280x600 session, 15 px on each new stacked question at 1280x600) and the r7 nits (toast over the band's right ticks on q1). |
| C2 Educational value | 8 | The right line throughout: sub_100_regroup 0..100 / 5, nl_mult 0..100 / 10, add_facts 0..20 / 1, the pool 0..100 / 5. Print: nl_mult 0..100 / 10, add_facts 0..20 / 1 on the pupil page and its facsimile key. A test page draws no line by default (P-SC-5) and draws it when the teacher turns on Hints on tests. |
| C3 Spacing and layout | 8 | Unchanged from r7 (no layout file changed by 789f23f7): no overlap of band and dots, dots in the card's top line. On paper, every page keeps its band; after-page keys interleave P K P K; short keys stay lists. |
| C4 Standard fidelity | 8 | Black and white band, Andika, live width; key a facsimile with the same band and the key ink only on answers. Lint 461 / 33 (r7 baseline 463 / 33: same document count, two fewer findings, from main's merged changes). |

## R7-D1: re-check (fixed)

| Check | Result |
|---|---|
| Band vs sticky bar, box + Check fit (`BAND-UNDER-HDR(fits)`) | **pre-fix: 100 steps** (every 1280x600 timed session of sub_100_regroup, nl_mult and add_facts, also 1366x650 sub_100_regroup, and from q2 on in **T0** sessions of sub_100_regroup at 1280x600: scroll 22, band 48). **This tree: 0** outside the mixed pool. |
| Mixed pool (ends 0..100) | 12 steps flagged, all **after Check** (`q*-checked`): the page scrolls to the feedback, the band scrolls away with the rest, and it is back at q+1. Pre-fix and main (line off) make the same post-Check scrolls (0 / 198 / 248 / 317). This is the accepted "pool problem too tall" behaviour; the box and Check were in view before Check. |
| Box and Check in view | 0 out of view at every desktop step (4 sizes x 4 sets x 3 starts x 2 inputs, q1–q3). The fix's fit test reads `#answerInput` and `#qcCheckBtn` only. For stacked skills the input is hidden and the digit cells are the box, but Check sits under them, so testing Check covers them. |
| Tap on the active box | dy 0 in all 288 desktop taps (mouse and touch) |
| 1366x768, 1280x720 | the band is never under the bar; nothing moves after q1 |
| Line off | **identical to main**: all 36 non-pool sessions give the same scroll positions and the same frame traces on this tree and on `e53677e0`. The 12 pool sessions differ only by the random items, and they take the same set of positions. The code runs only when `#mqRefLine` exists (guard in `renderQuestion`). |
| Phone 390x844 touch | band drawn and in view, active box in view, tap dy 0. The Check button sits below the fold on every stack and pool step, as it does without the line (header not sticky, hdr 0). Not graded. |
| Gate case `timedHeaderCases` | **real**: on the pre-fix question-render.js it fails 6 of 8 (sub_100_regroup / nl_mult 1280x600 queue + link, sub_100_regroup 1366x650 queue + link). On this tree it passes 8 of 8 (`r8/neg-control.txt`). It measures q1 only, and the box only through `#answerInput` (see nits). |

## Defects

**R8-D1 (minor, C1, non-blocking): the band is cleared about 300 ms late, so the page visibly nudges.**
Evidence: `lane-sum.txt` frame traces (scrollY / band top x frames) and `shots/sub_100_regroup-queue-1280x600-t150ms.png`.
- Start of a timed session at 1280x600 (queue or T300, sub_100_regroup and nl_mult): `119/-49 x1 > 67/3 x15 > 7/63`. For about 250 ms
  the band is under the bar, as in r7 (150 ms screenshot: the bar sits directly on the card). Then the whole page drops 60 px. At
  1366x650 the same happens with 10 px (`17/53 x14 > 7/63`).
- Every new question of sub_100_regroup at 1280x600, **timed and T0**: `7/63 > 22/48 x19 > 7/63`. The page scrolls 15 px up, holds for
  about 300 ms with the band's top 11 px under the bar, then comes back 15 px. The q2 / q3 path is new to this round's evidence. Pre-fix,
  it scrolled to 22 and stayed there. Now it bounces.
- The 0 ms call never acts: the scroll it should undo happens after `renderQuestion` returns (by the focus and active-box scroll). Only
  the 300 ms call corrects it, hence the visible move.

Would a pupil notice? Yes: a one-time drop when the session opens, and a small wobble just after each new stacked question appears.
Nothing stays hidden, the box keeps focus, and the jump does not fight the active-box scroll (no oscillation, a single correction).
Fix direction: correct in the same frame as the scroll. Either stop the scroll at its source (`preventScroll` on the
`_renderQuestionImpl` focus, and let the active-box scroller allow for the sticky bar plus the band), or run the clear in a
`requestAnimationFrame` after the focus / active-box scroll instead of at 0 / 300 ms. Extend `timedHeaderCases` to q2 / q3 through the
real auto-advance, and record a frame trace so that a bounce fails the gate.

**Nits (not blocking)**
- N1 (from r7, still there): the "Starting Practice with 1 skill!" / "Loaded" toast (`.mq-notify`, fixed) covers the band's right-hand
  ticks (80–100, 16–20) for about 3 s on q1 in 96 of 104 sessions.
- N2: `timedHeaderCases` and `_clearRefLineOfHeader` find the box by `#answerInput` only. For stacked skills that input is hidden, so
  the gate prints `box -` and checks Check alone. Use the active box (`.mq-active-box` / `document.activeElement`) as well.
- N3 (pre-existing, not this lane's): on the mixed pool at 1366x650 and 1280x600, some q2 / q3 renders flicker between scroll 0 and
  27–80 for single frames, 3–5 times in about 1 s. Pre-fix shows the same pattern (`pre-sum.txt`: 1280x600 pool T0 q2 / q3, 1366x650
  T300 q1), so 789f23f7 does not cause it. It is the active-box scroll against the pool's tall item.

## Merge of main (e53677e0) — print

| Check | Result (`tp8.cjs`, teacher Print screen, Print button output) |
|---|---|
| print-sheet.js resolution | `buildSheet` = main's wrapper (`normKeyOptions` → `buildSheetCore` → `arrangeKey`). The lane's band reservation, `drawNumberLine`, `trimToPages` and `testHints` sit inside `buildSheetCore` / `buildRoleSheet`, and `normaliseRequest` passes `testHints`. No conflict markers. Every modified module passes `node --input-type=module --check`. |
| teacher-print.js resolution | main's key placement / style / new-sheet options and the lane's Hints on tests switch (`data-act="test-hints"`) are both present. `requestFor` sends both `key: {on, placement, style, newSheet}` and `testHints`. |
| nl_mult Independent, 2 pages, key at end, copy | P P K K. The band 0..100 / 10 is on all 4 pages; the key ink appears only on key pages. |
| nl_mult, key after each page, copy | P K P K. Each key is a facsimile of its own page, with the band and the same 4 cells (`shots/print-nl_mult-after-page-copy.png`). |
| nl_mult / sub_100_regroup, after each page, short | P k P k. The short keys are lists (no band, no cells), and the pupil pages keep the band. |
| add_facts Test, Hints on tests OFF (default) | no band on the pupil or key page (`shots/print-add_facts-test-hints-off.png`) |
| add_facts Test, Hints on tests ON | band 0..20 on the pupil and the facsimile key (`shots/print-add_facts-test-hints-on.png`). With after-page + short: P k, band on P. |
| add_facts, line off, after-page short | no band anywhere, P k P k |

Gap: no gate exercises `testHints: true`. support-numberline checks only the default (no line on test and pre-skill-check). It is worth
one fixture.

## r7's passed items: no regression

The dots row stays clear of the band (support-numberline R6-D1 lines all ok). The online worksheet band is unaffected: worksheet.js never
calls `renderQuestion`, so the fix cannot reach it, and ws-screen-answer reports worksheet ok. The quiz draws no line: no refline code
in quiz-*.js, and no quiz file differs from main. Print lint is at baseline, and the key is a facsimile (above).

## Gates (one browser gate at a time, own free port via the harness)

| Check | Result |
|---|---|
| `ws-boot-smoke` | OK |
| `support-numberline` (includes `dotsBandCases` + the new `timedHeaderCases`) | OK, all 8 R7-D1 lines ok |
| `ws-screen-answer` | OK |
| `ws-chromebook-fit` (full run, 50 min limit) | **OK**: completed in this run. Its "NOT in view on load" lines (base10_build card / quiz at 1280x600) are informational, not failures. |
| `ws-print-lint --source kit` | 461 findings in 33 of 191 documents. Exit 1, as at baseline; r7 baseline 463 / 33. |
| `ws-code-snapshot.mjs` | OK (608 codes / 35 categories, nothing moved, 2525 option round trips) |
| `ws-codec-registry.mjs` | OK (601 skills, 9731 codes) |
| `ws-providers-unit.mjs` | OK (105162 checks) |
| My probe (`hdr8.cjs`) | 104 lane sessions + 48 pre-fix + 48 + 48 line-off (lane / main), 0 page errors |
