# lf-engine Prerequisite Check: critic r3 (2026-11-13)

Independent critic (mq-opus-medium), tree claude/sweet-newton-c8wrv1-lf-engine-pc @ 31f6f7e24, committed PNGs (seed 4242,
check forced on; L at the packet root, S printed at M in S/) and the diff d34311d5..31f6f7e24. Grades: `grades.jsonl`. The
critic could not write this file; the lane lead saved it in substance. Node gate: ws-lesson-unit OK (270) — catches none.

**VERDICT: FAIL (min 6).** 13 of 36 page versions and the engine fail. Pass: every routing page and chart (L, S), the add
check (L, S), add L and round L sheets, add and sub Practice (L, S), add S Mixed. Near-miss 7: sub and round checks (L, S);
sub sheets (L, S), add S and round S sheets. Fail 6 (caps): every Mixed page but add S; round Practice L and S.

Fixed in r3 on the page: one-page check at L and S; no two-choice question alone; routing states the miss rule and `__/n`;
sub title keeps its topic; paired strips aligned; round S 2 × 2; natural-width grid; sub Independent T O heads; plain check
stacks; every key a facsimile.

## Blocking findings
| # | Sev | Where | Defect | Fix | Automatic check |
|---|---|---|---|---|---|
| F1 | major | sub L/S Q1-2; round L Q3-6; round S Q4-7 (placevalue:identify on the check) | T O heads give the answer; the choice words print "ones tens" (reverse of T O), so the word under the underlined digit is ALWAYS wrong | prepare(): payload.heads = false on routed pv cells; one word bank under the number in T-O order | routed check pv items have no place heads; for two-choice pv items the word nearest the underlined digit is not always the wrong one |
| F2 | major | sub S check Q6-8 (pupil-p1, key-p1) | CLIP: row 35.9 mm < ink 36.1 mm; no bottom rule; the "If missed → Y2.B2.S10" tag has no ink | routedLayout h0 ≥ drawn ink + pads; trade / donor passes never below it; measure after prepare() | PC-CLIP on ink: band grid bottom ≤ tag top; every .mq-lpretag has ink |
| F3 | major | sub L sheet Independent band (pupil-p3, key-p4) | band runs past the body, cut at y 1149 px, no bottom rule | reserve the Independent row (border incl.) before Vocabulary / Guided grow | frame closure on every lesson page |
| F4 | major | sub L and S | "50 − 36" on the sheet's Independent and on Practice Q6 (LR-5), only with the check forced on (the sheet re-deals) | buildLesson: re-dealt sheet items into avoidHard before Practice | LR-5 in --force-check mode |
| F5 | critical | add L Mixed, Addition row | 55 % empty band (row sized for the bond row below) | Mixed rows sized to their kind, or centre | H13 on Mixed pages, blocking |
| F6 | critical | sub / round Mixed, add_100_regroup partner | dead hundreds carry box (sums < 100) | carry boxes only over columns that can receive a carry for the band | live-part lint: every drawn carry box filled on the key for ≥ 1 item |
| F7 | critical | round L and S Practice | 49 % band in all 15 cells | centre the one-number rounding cells (roundOneNum) or size rows to content | H13 on Practice pages, blocking |

## Other findings
F8 add S / sub S sheet feet 9 % / 11 % (declared known open). F9 sub S Mixed "51 − 44" / "53 − 45" near twins (LR-6). F10
round Practice Q10-15 / round L Mixed Q10-12: the two-digit tab covers the T head. F11 round S sheet Independent turnarounds
74 / 47, 43 / 34; 100 and 90 twice. F12 round L check Q9 one item checks only "10 more" of "10 more or 10 less". F13 sub S
Q3-5 (77 / 27 / 71), round Q7-8 (75 / 45): itemNumberKey drops exact repeats only. F14 nits: "missing numbers" over one
blank; a 13-word instruction.

## r1 / r2 status
r2 N1 fixed but now clipped (F3); N2 resolved by ruling A (F12 a note); N3 fixed; N4 partly (F13); N5-N8 fixed. r1 D1-D3,
D5-D8, D12, D13, D15, D20 fixed; D4 / D9 fixed but a new clip (F2); D10 / D19 recur (F3); D11 fixed, feet open (F8).

## Engine
Correctness 6 (F2 from the trade with no re-measure; exact-only itemNumberKey; twoChoice text-regex fallback misfires on a
three-choice "same"). Design fit 7 (right moves, routed-only; five more tuning constants; prepare() mutates in place).
Maintainability 6 (pre-skill-check.js 586 lines; inline constants; poolItems recomputes earlier deals recursively; donor path
untested). Gates 6 (nothing catches F2, F3, F4, F5-F7, F9: H13 / H15 not run on Practice / Mixed; LR-5 / LR-6 not run in
--force-check mode).

## Automatic checks
1 routed pv items without heads + word order (F1). 2 PC-CLIP on ink + tag ink (F2). 3 frame closure on every lesson page
(F3). 4 LR-5 / LR-6 / LR-7 in --force-check mode (F4, F9, F11, F13). 5 H13 on Practice and Mixed, blocking (F5, F7).
6 live-part lint for carry / regroup boxes (F6). 7 tab-text overlap; instruction ≤ 12 words and plural = blank count (F10, F14).

## Speed-ups
1 "critic-ready" = every page of the packet gated, not only the changed ones (F5-F7 sat on "unchanged" pages). 2 a known
open that fails the lane's own gate costs a round: fix or gate it first. 3 print each page's DOM bottom vs the body bottom
(F2, F3 are one number each). 4 run the packet LR gates in --force-check mode. 5 read each pv item as a pupil would before
the round.
