# Custom number line at the top of the page (MASTER_PLAN 5.2): critic, Round 7 (focused re-check)

Critic: independent. Tree `2b41b2fc` (round-7 fix for R6-D1). Date 2026-10-10. This file is my only change.
Probes, output and screenshots are in the session scratchpad (`nl-r7c/`):

- `probe.cjs`: practice card, queue (count select 10 / 20 / Unlimited) and a real `?c=` link (fresh storage, `|Gp-N10 / N20 / N0 / N50-T0`,
  `startFromLanding`), add_facts, nl_mult, mixed_addition with ends 0..100, add_facts and mult_facts with the line off; 1366x650 and
  1280x600, mouse and touch. Per question (q1, after Check, q2, q3): band vs dots overlap, tick labels hidden (elementFromPoint), dots
  covered, dots in the card's top line and clear of "Q1 + skill", active box and Check in view, tap focus and page jump. The same probe on
  a `git archive` of current `claude/sweet-newton-c8wrv1` (`probe-main-*.txt`).
- `screen.cjs` (the r6 probe): card and online worksheet, queue and link, add_facts, nl_mult, sub_100_regroup, pool + skill, line off.
- `neg.cjs`: the new `tests/lib/refline-dots.cjs` check run on this tree and on a copy with the round-6 `refline-screen.js` (negative control).
- `hdr.cjs`, `why.cjs`: what moves the band in a timed session (below).

Rulings applied as in rounds 5 and 6 (owner-accepted builds, the mixed pools' band scrolling above when the problem itself is too tall,
add_decimal's active-box fault). Stretch, thinking pages, stand-alone Guided / Model pages and phone polish are not graded.

## Verdict: FAIL (one blocking defect, R7-D1; R6-D1 is fixed)

R6-D1 is fixed and the fix is right. But the r7 probe also measured the band against the sticky game header, which r6 did not, and found
that in a **timed** session at **1280x600** (the queue's default has a timer; a link with `T300`) the page scrolls 60–67 px on the first
question, so the band sits entirely under the sticky header (header 5–59, band 3–56 for sub_100_regroup, 10–63 for nl_mult). The pupil
gets no visible line. This is not the accepted "problem too tall" case: at scroll 0 the band, the problem, the box and Check all fit
(the untimed link at the same size: band 69–122, box 444–511, Check 549–595). It already happened at r6 (the r6 numbers, band 9–62 /
16–69, were counted as on screen because the header was not subtracted), so it is not caused by this round's change, but it is a C1 7.

| Criterion | Score | Why |
|---|---|---|
| C1 Ease of use | 7 | Dots: fixed everywhere (below). Tap lands on the active box with dy 0 in all 140 touch and mouse runs; box and Check in view; no horizontal scroll; 0 page errors. But R7-D1: at 1280x600 in a timed session the band of sub_100_regroup and nl_mult is hidden under the sticky header on every question although the page fits without scrolling. |
| C2 Educational value | 8 | The right line on every item, queue and link: add_facts 0..20 / 1, nl_mult 0..100 / 10, sub_100_regroup 0..100 / 5, mixed_addition with ends 0..100 / 5; a pool beside a skill draws the pool's line on its items only; off draws none. Worksheet line as in r6. |
| C3 Spacing and layout | 8 | The dots ride in the card's top line again (151–183 inside the card from 145, right of the "Q1 + skill" pill, never on it); no overlap, no tick label hidden by the dots, no dot covered, at N10, N20, Unlimited (1 to 3 dots) and N50 (own row, above the card) on both sizes. Paper unchanged by this round (no print file touched; lint at baseline). |
| C4 Standard fidelity | 8 | Black and white band, Andika, live width; key a facsimile; lint 463 / 33 (baseline). Clean merge into current main. |

## R6-D1: re-check (fixed)

| Check | Result (`nl-r7c/probe-lane-*.txt`) |
|---|---|
| Overlap, hidden labels, covered dots, dots out of the card's top line, dots on the pill | none, add_facts / nl_mult / pool, queue + link, N10 / N20 / N0 / N50, 1366x650 + 1280x600, mouse + touch, q1 to q3 including after Check |
| DOM order with the line | `#mqRefLine`, `#qDotsRow`, `#questionCard`; re-renders keep it (the `prev.id === 'mqRefLine'` step) |
| Sessions without the line | **identical to main**: every line-off row (add_facts, mult_facts; queue + link; N10 / N20 / N0 / N50; both sizes; mouse and touch) is byte-identical between the lane and the main snapshot (`diff` empty) |
| Online worksheet | band 70–123 at both sizes, box in view, every set as in r6; the dots row is empty in worksheet mode, so the change does not reach it |
| Quiz | draws no line (no refline code in quiz-*.js; untouched) |
| New check `refline-dots.cjs` | real: on the round-6 code it fails 6 times at 1366x650 N20 (overlap, labels 14–17 hidden, dots not in the card); on this tree 0 (`neg-r6tree.txt`, `neg-lane.txt`) |

**The relaxed support-numberline assertion is legitimate.** It now skips exactly one `#qDotsRow` between the band and the card and still
requires `#questionCard` next; a band mounted after the card, inside it, or anywhere else still fails. The one wrong place it would now
accept (band between the dots and the card, the R6-D1 position) is caught by `dotsBandCases` in the same gate, as the negative control shows.

## Defects

**R7-D1 (blocking, C1)** — timed session at 1280x600: the band is under the sticky header.
Evidence: `hdr.txt` (task output) / `shots/hdr-queue-1280.png`: nl_mult + line, queue (timer 3:00) or link `T300`: `sy=60`, band 10–63, the
header strip 5–59; same skill, link `T0`: `sy=1`, band 69–122, box 446–515. sub_100_regroup (`screen-mouse.txt`, queue @1280): band 3–56.
1366x650 is fine (nl_mult band 60–113, sub_100_regroup 53–106, labels visible). add_facts is fine at both sizes.
Cause (`why.cjs`): `_renderQuestionImpl` (js/modules/question-render.js, the `answerInput.focus()` near line 5547) focuses without
`preventScroll`; in a timed session that focus scrolls the document to its end (doc 660–667 px tall at a 600 px viewport, only because the
band adds ~63 px). The later `preventScroll` focus in `_applyScreenCell` / `wireStackEntry` does not scroll back. Without the line the
document fits and nothing moves, so line-off sessions are not affected.
Fix direction (builder's choice): keep the first-render scroll at 0 when the box and Check already fit (e.g. `preventScroll` on that focus
and let active-box decide), or after mounting the band scroll so the band's top clears the sticky header whenever the box and Check still
fit. Add the timed path (queue default timer and a link `T300`) at 1280x600 for a tall-ish stacked skill (sub_100_regroup) and nl_mult
to `refline-dots` or support-numberline, measuring the band against the sticky header's bottom, not against 0.

**Nits (not blocking)**
- N1: the "Loaded 1 skill(s)!" toast covers the band's top-right ticks (18–20) for its ~3 s on a link start (fixed overlay; pre-existing).
- N2: in a 50-question session the dots keep their own row; on the mixed pool at 1280x600 that row scrolls under the sticky header. Main
  does the same without the line (`probe-main-mouse.txt`, poolends N50 DOTS-COVERED), so it is not this lane's.
- The mixed pool's band scrolling above at 1280x600 (band −7..46) is the accepted "problem too tall" ruling: box and Check stay in view.

## Gates (through /tmp/mq-browser-run.sh, one gate at a time)

| Check | Result |
|---|---|
| `support-numberline` | OK (its R6-D1 lines all ok) |
| `ws-chromebook-fit` | OK |
| `ws-screen-answer` | OK |
| `ws-boot-smoke` | OK |
| `wave1-a-probe` | OK |
| `ws-content-audit` | OK |
| `ws-print-lint --source kit` | 463 findings in 33 of 191 documents: at the baseline (exit 1 as at baseline) |
| Merge into current `claude/sweet-newton-c8wrv1` (6fe387f4) | `git merge-tree --write-tree`: clean, exit 0 (not pushed) |

Gate-rewritten screenshots were restored with `git checkout`.
