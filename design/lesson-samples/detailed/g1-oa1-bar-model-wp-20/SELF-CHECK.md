# V22 self-check: g1-oa1-bar-model-wp-20

Run by `tests/scripts/ws-detailed-lesson.cjs --check` (V22 Appendix E, ported to the kit's markup; Chromium print media) on `pack.html`, seed 4242, 2026-10-17. **44 / 44 PASS**.

| # | Check | Measured | Result |
|---|---|---|---|
| E1 | Paper is A4 (595 × 842 pt; the 2-up exit slip A4 landscape) | 19 portrait + 2 landscape of 21; 21 pages in the DOM | PASS |
| E1b | Exit-slip halves 132.5 ± 0.5 mm wide | P6: 132.5 / 132.5; P6-key: 132.5 / 132.5 | PASS |
| E2 | Andika 400 + 700 loaded and on every text node | 700/28px true, 400/15px true; other faces 0 | PASS |
| E3 | Only #000, #FFF, #949494; accent #5B2A86 only on step marks; key #C2410C only on answer marks | paints #000000, #5b2a86, #949494, #c2410c, #ffffff; out of place 0 | PASS |
| E4 | No colour on pupil pages except the accent on step marks | pupil-page paints: #000000, #5b2a86, #949494, #ffffff | PASS |
| E5 | No emoji (© and the teacher-page ★ excepted) | 0 found | PASS |
| E6 | Pupil text ≥ 11 pt (quiet letters, tab, footer excepted) | smallest 11.99 pt (P3 "19", P3-key "19") | PASS |
| E7 | Teacher text ≥ 10 pt | smallest 10 pt (T1 "#", T2 "#") | PASS |
| E8 | Working digits 28 pt outside the anchor chart | the kit sets --ws-digit 28pt at size L on every pupil page (one size L pack); measured by ws-print-lint --source kit | PASS |
| E9 | Every page ≥ 50 % used, nothing past the body | min 88 %; overflow none; under 50 %: none | PASS |
| E9c | Teacher pages: one continued is ≥ 92 % used (V22 3131); every teacher page listed | T1 96, T2 96, T2b 93, T3 93, T4 88, T5 97, T6 90; continued under 92 %: none | PASS |
| E9b | Body ≤ 8 % blank below its last band (site lint) | max 3 %; over 8 %: none | PASS |
| E10 | Every item cell ≥ 40 % free (reading cells exempt) | 76 cells; min free 50 %; below 40 %: none | PASS |
| E11 | No empty band ≥ 30 % in a cell (the site sheetCheck H13, from the border box) | worst 22 %; failing: none | PASS |
| E12 | Equal cells within each grid (±0.5 mm) and across the Practice pages | all grids equal; Practice cells 6, spread 0.0 × 0.0 mm | PASS |
| E13 | No underscore characters on pupil pages (slot widths: ws-print-lint --source kit) | underscores 0 | PASS |
| E14 | No dashed line except the cut line and the missing-digit box | 0 outside a cut line | PASS |
| E15 | Instructions ≤ 12 words, print verb first, string in the controlled library (V22 Appendix C.1: 130 strings; the kit's PED 10.1 library: 169) | 19 instructions; failing: none; in the kit library but missing from V22 C.1: "Write how many of each place.", "Read the story. Fill in the bar. Solve." | PASS |
| E16c | No Say band states an answer of its page that is not a given number, nor names one item | none | PASS |
| E16 | Every Say frame ≤ 2 blanks | 9 frames; blanks 0, 1 | PASS |
| E16b | RCDWS panel: one action per box, each row one line (≤ 9 mm) | 12 rows; tallest 9 mm | PASS |
| E17b | The anchor chart and its key carry no answer marks | P2: 0, P2-key: 0 | PASS |
| E17 | Each key has the same slots as its page | P0 8/8, P1 12/12, P2 0/0, P3 9/9, P4-1 24/24, P5 11/11, P6 16/16 | PASS |
| E18 | © line and strand tab on every page | © 21/21; tab 21/21 | PASS |
| E19 | One identical I Can title on every page | I Can solve stories with a bar | PASS |
| E20 | No lone item (word problem v1 and the anchor chart excepted) | none | PASS |
| E21b | T1 Flow word: Chunked when T2 has ≥ 4 routine rows tagged New | T2 New rows 2 → Standard; T1 "Standard" | PASS |
| E21 | T2: ≥ 5 atoms of the four types; no ★ in the atom tables | 8 atoms: Fact, Conceptual, Fact, Category, Category, Conceptual, Category, Comparative; ★ false | PASS |
| E22 | Every delivery page (T3–T5) shows a pupil-page thumbnail | T3: 1, T4: 2, T5: 1 | PASS |
| E23 | Every row of T6 "Answers at a glance" carries ★ / ★★ / ★★★ | 4/4 | PASS |
| E24 | Item pool read from the pack (LR-5): pool recomputed from its rule; 0 repeats of (number, representation); a number never twice on a page; chart examples and their turn-arounds never return; no turn-around pair on a page | 32 places (32 numbers), usable pool 41 (pool 63 keys, 41 facts, recomputed from its plus rule: matches; forbidden 5+7, 3+8); repeats 0; chart examples or their turn-arounds returning 0; same-page turn-arounds 0; outside the pool / forbidden 0; items without a rep 0 | PASS |
| E24b | Practice last row only edge cases (★★★); LR-6 no twin answers and no near twins (one skill, numbers within 2) on a page; + / − items (stories too): no first addend twice in a grid row or three running, no number taken away twice, no near twins (both numbers within 2, place by place: V22 2983); × / ÷ (lead ruling): no first factor / divisor twice in a grid row; a declared edgeOnly case only on the last row | 1 Practice pages: last rows all edge cases (4 edge numbers dealt); no twin answers on any page; near twins checked for one-number and + / − items (15 + / −: no first addend twice in a grid row, no number taken away twice, both numbers within 2); 0 × / ÷ items: no first factor / divisor twice in a grid row | PASS |
| E31 | Every situation the lesson declares is modelled in I Do (chart or board example), assessed on the exit slip, and nothing unmodelled is practised | put-together, add-to: modelled on P2, practised on P3–P6, assessed on P6 | PASS |
| E32 | Stories: one sentence per line (AX-3), at most 4 lines (SF-50) | 34 stories, every sentence on one line, at most 3 lines | PASS |
| E33 | Mixed page: the lesson's own skills hold at least half the items (V22 §9.5) | no Mixed page | PASS |
| E34 | T2b scores the exit slip by its own item count | T2b /2, P6 2 items a half | PASS |
| E35 | T4 quotes only story questions the pack prints or writes on the board; a "Steps at the top" line names a page that prints them | 3 questions, all printed or on the board; Practice 1 Steps band not printed | PASS |
| E36 | Exit slip + items: no part equals the difference of the parts; each fresh (on no other page, nor turned round) | 8+6, 4+9: clean and fresh | PASS |
| E30 | No boardOnly number on a pupil page or key (item, answer, digits or name) | none declared: on no pupil page or key (14 pages) | PASS |
| E29 | Every item letter and answer a teacher page quotes is on the pupil page it names (T3 §1, T5 §10, T6 routing) | 13 quotes, all on their pages | PASS |
| E28 | No Say:, Rule: or Remember: band on a Practice page | 2 Practice / Mixed pages; extra bands 0 | PASS |
| E27 | Counters in rows of at most 5 | no counters | PASS |
| E26 | Every anchor-chart step panel adds a grey (newest) mark | P2 4 / 4 panels | PASS |
| E25 | One key per pupil page (anchor chart included) | 7 pupil pages, 7 keys | PASS |

**44 / 44 pass.**

## Per page

| Page | Kind | Used % | Bottom blank % | Min text pt | Cells | Min free % | Paints |
|---|---|---|---|---|---|---|---|
| T1 | teacher | 96 | 0 | 10 | 0 | — | #000000 #ffffff |
| T2 | teacher | 96 | 0 | 10 | 0 | — | #000000 #5b2a86 |
| T2b | teacher | 93 | 0 | 10 | 0 | — | #000000 #5b2a86 #ffffff |
| T3 | teacher | 93 | 0 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T4 | teacher | 88 | 0 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T5 | teacher | 97 | 0 | 11 | 0 | — | #000000 #5b2a86 #c2410c #ffffff |
| P0 | pupil | 93 | 2 | 12 | 8 | 50 | #000000 #ffffff |
| P1 | pupil | 95 | 3 | 12 | 10 | 50 | #000000 #ffffff |
| P2 | pupil | 98 | 0 | 15 | 4 | 64 | #000000 #5b2a86 #949494 #ffffff |
| P3 | pupil | 94 | 3 | 11.99 | 3 | 56 | #000000 #5b2a86 #949494 #ffffff |
| P4-1 | pupil | 94 | 0 | 12 | 6 | 62 | #000000 #ffffff |
| P5 | pupil | 100 | 0 | 12 | 3 | 64 | #000000 #5b2a86 #ffffff |
| P6 | pupil | 98 | 0 | 12 | 4 | 55 | #000000 #ffffff |
| P0-key | key | 94 | 2 | 12 | 8 | 50 | #000000 #c2410c #ffffff |
| P1-key | key | 95 | 3 | 12 | 10 | 50 | #000000 #c2410c #ffffff |
| P2-key | key | 98 | 0 | 15 | 4 | 64 | #000000 #5b2a86 #949494 #ffffff |
| P3-key | key | 94 | 3 | 11.99 | 3 | 53 | #000000 #5b2a86 #949494 #c2410c #ffffff |
| P4-1-key | key | 94 | 0 | 12 | 6 | 62 | #000000 #c2410c #ffffff |
| P5-key | key | 100 | 0 | 12 | 3 | 64 | #000000 #5b2a86 #c2410c #ffffff |
| P6-key | key | 97 | 0 | 12 | 4 | 55 | #000000 #c2410c #ffffff |
| T6 | teacher | 90 | 0 | 10 | 0 | — | #000000 #c2410c |

## Notes from the build

- Exit slip: a group of items does not fit two across a 132.5 mm half; printed one across.

