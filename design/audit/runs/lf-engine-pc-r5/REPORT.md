# lf-engine Prerequisite Check: critic r5 (2026-11-13)

Independent critic (mq-opus-medium). Tree `claude/sweet-newton-c8wrv1-lf-engine-pc` @ 82a3e0d8b (r4 was 6a9c268ce).
A) The committed check-on packet (seed 4242; L at the root, S printed at M in `S/`): every page, pupil and key.
B) The live pages (check off) that the branch changes. Rendered on the branch, on origin/master 7f718a827 (detached worktree,
since removed) and, for the page-count question, on 6a9c268ce, the branch just before its LIVE commits. All renders use
`buildSheet` role lesson, seed 4242, practicePages 1, mixed, prereqsForce false. ws-lesson-samples has no `--skill`
option, so the critic used a short harness script (same calls as the sample renderer). Node gate `ws-lesson-unit`:
OK (304). Grades: `grades.jsonl`.

**VERDICT: FAIL (min 6).** The check packet is nearly there: 35 of 36 page versions score 8; round S Mixed scores 7 (R1).
The live pages fail. The near-twin rules run only with the check on (R2). The ruling on place heads is applied to the
lesson's own skill when it comes back as a Mixed partner (R3). The new pv lift makes three subtraction lessons print a
two-page L Mixed with blank feet (R4, a regression from 6a9c268ce). Engine min 7.

## A) Packet grades (C1 / C2 / C3 / C4; all keys facsimiles)
| Packet | Size | Check | Routing | Chart | Sheet | Practice | Mixed |
|---|---|---|---|---|---|---|---|
| add | L | 8 | 8 | 8 | 8 | 8 | 8 |
| add | S@M | 8 | 8 | 8 | 8 | 8 | 8 |
| sub | L | 8 | 8 | 8 | 8 | 8 | 8 |
| sub | S@M | 8 | 8 | 8 | 8 | 8 | 8 |
| round | L | 8 | 8 | 8 | 8 (near-miss) | 8 | 8 (near-miss) |
| round | S@M | 8 | 8 | 8 | 8 (near-miss) | 8 | **7 (C2, R1)** |

## B) Live pages (after = branch, check off; before = origin/master)
| Page | Size | After | Before | Note |
|---|---|---|---|---|
| sub_100_regroup chart | L, S | 8 | 6-7 (C3) | N3 fixed live: panels 5 and 6 centred |
| nearest_10 Mixed | L | **7 (C2)** | heads give the answer away | heads gone; 34 / 35 / 39 (R2) |
| nearest_10 Mixed | S | **7 (C2)** | heads | 34/35, 63/65, 77/78, 96/99; three in the 30s; answer 40 three times; 78 twice (R2) |
| identify Mixed | L | **7 (C1)** | last cell cut at the frame | frame fixed; its own partner loses its heads under the "Read the letter above it" strip (R3) |
| identify Mixed | S | **7 (C1)** | heads | R3 |
| value Mixed | L | 8 | cells cut, 11 items over the frame | much better |
| value Mixed | S | 8 | - | |
| unit_form Mixed | L | 8 | - | |
| unit_form Mixed | S | 8 | the same with heads | heads off only |
| combine Mixed | L | **7 (C3)** | frame open, sections overlap | 5 items, about 22 % blank foot |
| expand Mixed | L | 8 | frame open | fixed |
| sub_2d_1d Mixed | L | **6 (C3), 7 (C2)** | ONE page, PV row cut | TWO pages, about 25 % / 15 % blank feet; "− 2" four times, 49 − 2 / 48 − 2 (R4) |
| sub_2d_1d Mixed | S | 8 | - | 29 − 7 / 99 − 7 (near-miss) |
| sub_50_no_regroup Mixed | L | **6 (C3), 7 (C2)** | one page, cut | two pages; 47 − 16 / 28 − 16, 44 − 23 / 46 − 24 (R4) |
| sub_50_no_regroup Mixed | S | 8 | - | 47 − 16 / 28 − 16 (near-miss) |
| sub_100_no_regroup Mixed | L | **6 (C3)** | one page, cut | two pages (R4) |
| sub_100_no_regroup Mixed | S | 8 | - | PV 61 / 63 (near-miss) |

Every after page is better than or equal to its before page on what it was asked to fix: nothing is clipped, the heads no
longer give the answer away, and the N3 panels are centred. The failures are defects the after pages still carry or
newly show.

## Blocking findings
| # | Sev | Where | Defect | Fix | Automatic check |
|---|---|---|---|---|---|
| R1 | minor-major (C2 7) | packet round S Mixed, Place Value partner Q13-18 | 78 85 32 51 17 57: the underlined places strictly alternate T O T O T O. This is the pattern r4 N2 ruled out, but `mixOrder` / PC-PV run only on the check, while the Mixed page is where the support has faded (4.1a). | deal a Mixed place partner's places with the same rule (never all one kind, never strictly alternating at 3 or more), and vary the order by seed | PC-PV pattern check (`pvQuestionCheck` answers part) on every lesson page's place items, the Mixed page included, forced and unforced |
| R2 | major (C2 7) | live nearest_10 Mixed L, S (and every live Practice / Mixed: sub_2d_1d L "− 2" ×4, sub_50 L 44 − 23 / 46 − 24, PV 61 / 63) | r4 N4 is fixed only with the check on: `pageRules` / `oneNumFits` are set only when `sheetHard.length` (print-sheet.js ~5033, ~5139: "a lesson without the check: as before"). The live packets, which ship with `prereqsLive` false, still print near twins, three items in one ten, one answer three times, and the same number twice on a page. | run the one near-twin module on live Practice and Mixed (pageRules without the check), then re-baseline | PG-LR6 / PG-LR67 unforced on `--all-lessons`, blocking, not only `FORCE && !l.spot` (ws-lesson-samples ~565) |
| R3 | major (C1 7) | live identify Mixed L, S | identify's `mixWith` includes `placevalue:identify` (band 99) itself. `noPlaceHeads` strips that partner's heads, so 6 of 9 place items have no letters while the page strip says "2 Read the letter above it". This breaks the lead ruling (identify's OWN Mixed keeps heads). The partner also prints "Circle the place. Write the value of the underlined digit." over cells with no value slot (pre-existing). | skip `noPlaceHeads` when the partner's skill is the lesson's own skill (or when the lesson's steps read the heads); give a writeValue:false partner its own instruction | PC-PVHEADS live: on a lesson whose strip names the heads, every place item prints them; PC-INSTR: "Write the value" needs a value slot in every cell |
| R4 | major, regression (C3 6) | live sub_2d_1d, sub_50_no_regroup, sub_100_no_regroup L Mixed | at 6a9c268ce and on master these were ONE page, with the PV row cut at the frame. With `pvLiftOf` they now run to TWO pages: page 1 holds 6 subtractions over about 25 % blank, page 2 holds the rest over about 15 % blank, and the lead deals 9 items with no LR-6. CRITIC-READY does not report the page count. | fit one page: take the 2.5 mm from the addition shelf's growth (its cells are about 35 % empty) or drop a lead row, never a new page; count the lift only for place items | ws-lesson-baseline `--parts`: a part's page count may not grow from its baseline (Mixed 1 -> 2 fails); L-DENSITY foot ≤ 15 % on lesson Mixed |
| R5 | minor (C3 7) | live combine L Mixed | 5 items, about 22 % blank foot (master was broken, so this is better) | let the spare go to the shelves, or add a row | the same L-DENSITY foot check |
| P1 | process | branch | the branch is 450 commits behind origin/master 7f718a827 (38 sheet files changed there). "Clean before critic" requires the branch merged with current main. | merge master, re-run the gates and the baseline | precritic: refuse when `git merge-base --is-ancestor origin/master HEAD` fails |

Near-misses (8, but close): sub check Q6-7 side bands about 25 %; round sheet Independent ones digit 9 in 3 of 6 (L) and
4 of 9 (S), with no 6 / 7 / 8 in the ones; round L Mixed PV 61 / 51 / 71 with the 1 underlined twice; the 70s at
74-78 across check, chart, sheet and Practice; add Independent answers 10 9 8 8 10 8; add Mixed additions all turnarounds
of Practice (forced); sub S Mixed 80 − 75 / 90 − 74; value / identify 347 / 647.

## r4 findings
| r4 | Status | Evidence |
|---|---|---|
| N1 "20 − 11" out of range | fixed | sub L Q6-7 / S Q8-9: 15 − 6, 11 − 3; `floorsHard` holds on every try |
| N2 nearest bank word = key | fixed (check) | bank stacked to the right of the whole number; answers T O O T. Open on Mixed: R1 |
| N3 chart panels 5 / 6 | fixed | packet and live L / S |
| N4 Practice / Mixed twins | fixed (check-on packet) / not fixed live | R2 |
| N5 round S sheet Independent | fixed | 74 99 43 95 89 49 39 25 64 (ones-9 near-miss) |
| N6 add S Vocabulary gap | fixed | spare spent in the line gap |
| N7 "10 more or 10 less" | fixed | round Q8-9 / S Q12-13 |
| N8 chart-grey.png | fixed | |
| N9 Mixed heads (ruling) | fixed for other lessons / regressed on identify's own | R3 |
| F14 plural / widow | fixed | add L Q2 singular; round L Q1 one line |
| engine notes (3 near-twin definitions, duplicate floors) | mostly fixed | `near-twins.js` and `refFloorsOk`. The gate's PC-LR6 still has its own `nearKeyPair` copy (ws-lesson-samples ~207) |

## Engine (correctness 7 / design fit 7 / maintainability 8 / gates 7)
- Correctness 7: hard route floors are right, and the bank is beside the number. But the near-twin rules are gated to
  check-on (R2), `noPlaceHeads` does not tell the lesson's own skill from another (R3), `pvLiftOf` spills pages (R4),
  and `mixOrder` is a fixed A B B A every seed, so every check reads T O O T: a pattern a teacher reusing sheets will see.
- Design fit 7: one module and one threshold set is the right root-cause move. `pvLiftOf` patches the measured height for
  a CSS drop the measuring cell does not carry; the cell should carry the drop. The PV pattern rule lives only in the check.
- Maintainability 8 (near-miss): `near-twins.js` is small, pure and documented, and `refFloorsOk` consolidates the floors.
  `generateRun`'s pass chain is now 8 tiers in one expression; print-sheet.js still grows; the gate keeps a copy of nearKeys.
- Gates 7: PC-PV, PG-LR6, CHART-H13, PC-GAPS and PC-INSTR caught the r4 classes on the packet. None ran unforced on live
  Mixed / Practice, and none watches page counts, so R2-R4 reached the critic.

## Speed-ups
1. For every LIVE change, diff page COUNTS per part against the baseline and look at each changed page, not only hashes
   (R4 was a 1 -> 2 page change hidden inside "176 hashes changed").
2. When a ruling removes a support from "partners", list each lesson's `mixWith` and flag partners that are the lesson's
   own skill (R3).
3. A rule written for one page (PC-PV patterns, PG-LR6) runs on every page that deals the same items, forced and unforced.
4. Merge origin/master before the critic (P1): a before/after against a stale base mixes master's changes into the diff.
5. Seed-vary any fixed ordering pattern (mixOrder) so a fix is not itself a constant pattern.
