# ops-family G1 — critic r1 (independent, mq-opus-medium) — FAIL

Graded on 7490407b, 2026-10-30, benchmark subtraction:sub_100_no_regroup (approved). No inheritance (no certificate on `equation`).
Skills: addition:add_sub_10s, addition:add_sub_100s, subtraction:missing_add_sub, division:missing_mult_div
(division:div_zero_in_quotient held out by lead ruling). Renders: L/ S/ M/ opt-* set-* sections-* bench/ in this folder;
content reads read40.txt; lint lint-{S,M,L}.{log,json}. (The critic's harness blocked its own report write; the lead
transcribed this file from its hand-back.)

**Min 4 (C3)** — Sections (mixed) page, add_sub_10s / add_sub_100s, S and L. Next: 5 (C2) missing_mult_div Bracket;
5 (C3) grouped mixed Independent S. Every skill has at least one cell < 8.

## Scores (C1 C2 C3 C4)
| Skill | ≥ 8 everywhere on | Below 8 |
|---|---|---|
| add_sub_10s | Independent S/M/L, More practice, card 1280/820/390, worksheet, quiz | Test L 8 9 8 7, Test S 8 9 7 7 (title), Lesson 8 8 6 8, Mixed L 8 8 7 8, Grouped Indep S 8 8 5 8, **Sections 6 8 4 6** |
| add_sub_100s | Independent S/M/L, More practice, card 1280/820, worksheet, quiz | as add_sub_10s; Lesson 8 8 6 8; Sections C3 4 (+ CL-40 ×6); card 390 8 9 7 8 |
| missing_add_sub | Independent S/L, More practice, Test L, screen hosts 9 9 9 9 | Indep M 9 9 7 9; Test S 8 9 7 7; Lesson 8 7 6 7; Mixed 8 7 7 8; unknown both 7 8 8 8 |
| missing_mult_div | Quiz 9 8 9 9 | Indep/More/Test L 9 7 8 9; Indep M 9 7 7 9; Test S 8 7 7 7; Lesson 8 7 6 8; **Bracket 8 5 8 6**; all-three 8 6 8 6; Fraction 8 7 8 8; card/worksheet 9 7 8-9 9 |

## Findings (severity · rule/cap · would-have-caught check)
| Id | Sev | Finding | Cap | Check |
|---|---|---|---|---|
| F1 | crit | Sections: across-sentence answer lines 8.2 mm (L) / 3.7 mm (S) outside cells; composer rows sized for answer-beside | PG-12 CL-1 CL-40; C3 4 | EXISTS, was red (ws-slot-clip CLIP / print-lint L-OVERFLOW --kind sections) |
| F2 | maj | Lesson anchor chart page 38–45 % empty (all four) | C3 6 | NEW: print-lint PAGEFILL on lesson p1 > 20 % strip |
| F3 | maj | Vocab key: "7 + 5 = 12"↔whole, "6 × 7"↔factor | C2 7 | NEW: node-lint LESSON-DATA VOCAB-TYPE |
| F4 | maj | Role titles "adding and subtract 10/100" | C4 7 | NEW: node-lint ROLE-TITLE over every skill × role |
| F5 | crit | Bracket drawn "▢⟌63 = 7" (quotient after =); all-three mixes bracket with × | VA-61 VA-65; C2 5 C4 6 | NEW: L-NOTATION (no "=" after a bracket) |
| F6 | maj | missing_mult_div at Max 100 deals 16/200 over 100 (to 144) | OC4; C2 7 | ws-card-rulings (SKIPPED: card unsigned); NEW options-verify max(a,b,result) ≤ N |
| F7 | maj | missing_add_sub "Up to 100" deals within 20 (dead value) | OC1/OC4 | NEW: each range value reaches past the next-lower bound |
| F8 | maj | Support `level` dead on print (byte-identical) | OC1/OC3 | NEW: options-verify tests `level` (or levelSubset declared) |
| F9 | maj | Test S: 20 items on 3×7 leaves a ruled empty cell 21 | PT-ENG-7; C3/C4 7 | NEW: L-DENSITY EMPTYCELL |
| F10 | maj | M holds 16 = L (missing_*) | L1 DN-1a; C3 7 | L1 --sizes exists but not on precritic's path |
| F11 | maj | Lesson S Independent: 3 items per box (missing_add_sub) | C4 7 | NEW: L-CELL-ONE |
| F12 | maj | Box and line slots on one page (unknown both) | C1 7 | NEW: L-ANSAREA SHAPE per section |
| F13 | maj | Mixed heading = category ("Subtraction" over additions) | C2 7 | NEW: heading names an operation present |
| F14 | crit | H5 empty pages: grouped Indep S p2 75 %, mixed L strip 35 %, Test S 21 % | C3 5 / 7 | PAGEFILL exists, single-skill independent only → run on mixed + Test |
| F15 | maj | Card 390 add_sub_100s content 6 px from border | C3 7 | ws-phone-card clips only → ≥ 3 mm inner gap |
| F16 | maj | Generic hint (missing_mult_div) | C2 7 | NEW: providers-unit HINT names the item's numbers |
| F17 | crit | missing_add_sub lesson warm-up band 34 % | H13; C3 ≤ 6 | EXISTS, was red (print-lint lesson) |
| F18 | min | Grade-4 2d×2d warm-up in a grade-3 lesson | — | NEW: warm-up grade ≤ skill grade |
| F19 | min | Notation help shows the dropped form; add_sub_10s tags 1.NBT.C.4 first (card 1.NBT.C.5); missing_* no EE | — | NEW: OPTION-HELP example dealable |

Advisory (outside graded scope): missing_mult_div Review AK-4 (key p2 12 slots vs pupil 8); missing_add_sub Review H13 34 %;
Pre-skill check ~75 % empty; Fact rows / probe refused with a false reason; Guided and Scripted model at L 45–70 % empty;
quiz builder's own print (printQuizTest) is the legacy Nunito/purple renderer for every skill.

Process: started on a red precritic (lead ruling; rule 0b breached). Only F1 and F17 were already caught by a gate.
Wall ≈ 1 h 50 min (≈ 50 min renders, one browser slot); tokens ≈ 350k.
