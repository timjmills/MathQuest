# Critic: facts-roles, narrow round 4 (Scripted Model L, div_facts re-check)

- Critic: independent (built none of it), Opus medium, 2026-11-12. Frozen worktree `critfr5` at b606e68a; no source edits.
- Render: `ws-grade-render --skills division:div_facts,multiplication:mult_facts --roles scripted-model --size L --no-screen`
  via `/tmp/mq-browser-run.sh`. Output: `/tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/fr4-renders/`.
- Measured from PNG ink (A4 at 96 dpi, 3.78 px/mm, ink < 200), cells between the drawn grid lines (interior 305 px = 80.7 mm).
- Lead ruling PT-MOD-3 applied (reserved mark room ≤ 35 % in a state before the last, inked later, is not empty band).

## VERDICT: PASS

Lowest score 8. S5 (r3) is FIXED.

## S5 re-check: step text → problem band (H13 30 %)

| page | state 1 | state 2 | state 3 | state 4 |
|---|---|---|---|---|
| div p1 | 26.9 % | 26.9 % | 26.6 % | 25.9 % |
| div p2 | 26.6 % | 26.6 % | 26.6 % | 26.2 % |

- Was 30.3–30.9 % at r3; now 25.9–26.9 %, under the H13 line with margin, and in line with mult_facts (27.6 %).
- Problem underline → first grey mark: 26 px = 6.9 mm (8.5–8.9 %); was 1.3 mm. The problem no longer crowds its marks.
- Bottom bands: state 1 34.4 % (was 35.2 %, now inside the 35 % ruling), state 2 26.2 %, states 3–4 18.0 %. The 34.4 % and
  26.2 % bands are in states before the last and are inked by later states: excused under PT-MOD-3. State 4 (last) 18 %.
- Reading order intact in every cell: numbered step text → problem with its answer line → grey marks in build order
  (56 ÷ 7 → 7 × __ = 56 → 7 × 8 = 56 → traced 8; page 2: 6 ÷ 3 → 3 × __ = 6 → 3 × 2 = 6 → traced 2). Z order 1-2 / 3-4.
- Page used: p1 71 %, p2 72 % (Say band on the last page, "6 divided by 3 equals 2."). Continuation header and 2/2 footer present.

## Keys

- Key PNGs are byte-identical facsimiles of the pupil pages (`cmp` clean on p1 and p2); traced answers 8 and 2 are correct.

## mult_facts Model L (unchanged check)

- All four PNGs (pupil and key, p1 and p2) are md5-identical to the r3 renders (p1 af41ebbc…, p2 6a5fb796…). Its r3 8·8·8·8 stands.

## Scores (C1 ease · C2 teaching · C3 spacing · C4 standard)

| skill | p1 pupil + key | p2 pupil + key |
|---|---|---|
| division:div_facts | 8·8·8·8 | 8·8·8·8 |
| multiplication:mult_facts (unchanged, r3 grade carried) | 8·8·8·8 | 8·8·8·8 |

## Defects

None.

## Checks that would have caught S5 / speed notes

- The backtest `model-interior-band-facts` (added this round) now guards the step→problem band; it PASSED on this tree.
- A pixel band measure that grazes a ruling's limit (state 1 was 35.2 % at r3) should be printed by EB-BAND next to the DOM
  measure, so a critic does not have to reconcile two numbers.
