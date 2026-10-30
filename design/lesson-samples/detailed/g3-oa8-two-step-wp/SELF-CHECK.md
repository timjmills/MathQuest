# V22 self-check: g3-oa8-two-step-wp

Run by `tests/scripts/ws-detailed-lesson.cjs --check` (V22 Appendix E, ported to the kit's markup; Chromium print media) on `pack.html`, seed 4242, 2026-10-30. **48 / 48 PASS**.

| # | Check | Measured | Result |
|---|---|---|---|
| E1 | Paper is A4 (595 × 842 pt; the 2-up exit slip A4 landscape) | 26 portrait + 2 landscape of 28; 28 pages in the DOM | PASS |
| E1b | Exit-slip halves 132.5 ± 0.5 mm wide | P6: 132.5 / 132.5; P6-key: 132.5 / 132.5 | PASS |
| E2 | Andika 400 + 700 loaded and on every text node | 700/28px true, 400/15px true; other faces 0 | PASS |
| E3 | Only #000, #FFF, #949494; accent #5B2A86 only on step marks; key #C2410C only on answer marks | paints #000000, #5b2a86, #949494, #c2410c, #ffffff; out of place 0 | PASS |
| E4 | No colour on pupil pages except the accent on step marks | pupil-page paints: #000000, #5b2a86, #949494, #ffffff | PASS |
| E5 | No emoji (© and the teacher-page ★ excepted) | 0 found | PASS |
| E6 | Pupil text ≥ 11 pt (quiet letters, tab, footer excepted) | smallest 12 pt (P0 "Name", P1 "Name") | PASS |
| E7 | Teacher text ≥ 10 pt | smallest 10 pt (T1 "#", T2 "#") | PASS |
| E8 | Working digits 28 pt outside the anchor chart | the kit sets --ws-digit 28pt at size L on every pupil page (one size L pack); measured by ws-print-lint --source kit | PASS |
| E9 | Every page ≥ 50 % used, nothing past the body | min 60 %; overflow none; under 50 %: none | PASS |
| E9c | Teacher pages: one continued is ≥ 92 % used (V22 3131); every teacher page listed | T1 97, T2 93, T2b 91, T3 91, T4 99, T4-2 60, T5 92, T6 79; continued under 92 %: none | PASS |
| E9b | Body ≤ 8 % blank below its last band (site lint) | max 4 %; over 8 %: none | PASS |
| E10 | Every item cell ≥ 40 % free (reading cells exempt) | 74 cells; min free 47 %; below 40 %: none | PASS |
| E11 | No empty band ≥ 30 % in a cell (the site sheetCheck H13, from the border box) | worst 23 %; failing: none | PASS |
| E12 | Equal cells within each grid (±0.5 mm) and across the Practice pages | all grids equal; Practice cells 4, spread 0.0 × 0.1 mm | PASS |
| E13 | No underscore characters on pupil pages (slot widths: ws-print-lint --source kit) | underscores 0 | PASS |
| E14 | No dashed line except the cut line and the missing-digit box | 0 outside a cut line | PASS |
| E15 | Instructions ≤ 12 words, print verb first, string in the controlled library (V22 Appendix C.1: 130 strings; the kit's PED 10.1 library: 177) | 20 instructions; failing: none; in the kit library but missing from V22 C.1: "Read the story. Write each step. Solve.", "Write how many of each place." | PASS |
| E16c | No Say band states an answer of its page that is not a given number, nor names one item | none | PASS |
| E16 | Every Say frame ≤ 2 blanks | 12 frames; blanks 0, 1 | PASS |
| E16b | RCDWS panel: one action per box, each row one line (≤ 9 mm) | 12 rows; tallest 9 mm | PASS |
| E17b | The anchor chart and its key carry no answer marks | P2: 0, P2b: 0, P2-key: 0, P2b-key: 0 | PASS |
| E17 | Each key has the same slots as its page | P0 20/20, P1 12/12, P2 0/0, P2b 0/0, P3 53/53, P3b 40/40, P4-1 49/49, P4-2 38/38, P5 15/15, P6 32/32 | PASS |
| E18 | © line on every page and no strand tab (owner ruling 2026-10-23) | © 28/28; tab 0/28 | PASS |
| E19 | One identical I Can title on every page | I Can solve two-step stories | PASS |
| E20 | No lone item (word problem v1 and the anchor chart excepted) | none | PASS |
| E21b | T1 Flow word: Chunked when T2 has ≥ 4 routine rows tagged New | T2 New rows 2 → Standard; T1 "Standard" | PASS |
| E21 | T2: ≥ 5 atoms of the four types; no ★ in the atom tables | 8 atoms: Fact, Category, Category, Conceptual, Category, Conceptual, Comparative, Category; ★ false | PASS |
| E22 | Every delivery page (T3–T5) shows a pupil-page thumbnail | T3: 1, T4: 2, T5: 1 | PASS |
| E23 | Every row of T6 "Answers at a glance" carries ★ / ★★ / ★★★ | 4/4 | PASS |
| E24 | Item pool read from the pack (LR-5): pool recomputed from its rule; 0 repeats of (number, representation); a number never twice on a page; chart examples and their turn-arounds never return; no turn-around pair on a page | 29 places (29 numbers), usable pool 29 (pool 29 keys, 29 facts, recomputed from its list rule: matches; forbidden 0); repeats 0; chart examples or their turn-arounds returning 0; same-page turn-arounds 0; outside the pool / forbidden 0; items without a rep 0 | PASS |
| E24b | Practice last row only edge cases (★★★); LR-6 no twin answers and no near twins (one skill, numbers within 2) on a page; + / − items (stories too): no first addend twice in a grid row or three running, no number taken away twice, no near twins (both numbers within 2, place by place: V22 2983); × / ÷ (lead ruling): no first factor / divisor twice in a grid row; a declared edgeOnly case only on the last row | 2 Practice pages: last rows all edge cases (8 edge numbers dealt); no twin answers on any page; near twins checked for one-number and + / − items (0 + / −: no first addend twice in a grid row, no number taken away twice, both numbers within 2); 6 × / ÷ items: no first factor / divisor twice in a grid row | PASS |
| E31 | Every situation the lesson declares is modelled in I Do (chart or board example), assessed on the exit slip, and nothing unmodelled is practised | groups-then-change, share-then-change: modelled on P2, practised on P3–P6, assessed on P6 | PASS |
| E32 | Stories: one sentence per line (AX-3), at most 4 lines (SF-50) | 38 stories, every sentence on one line, at most 4 lines | PASS |
| E33 | Mixed page: the lesson's own skills hold at least half the items (V22 §9.5) | no Mixed page | PASS |
| E34 | T2b scores the exit slip by its own item count | T2b /2, P6 2 items a half | PASS |
| E35 | T4 quotes only story questions the pack prints or writes on the board; a "Steps at the top" line names a page that prints them | 3 questions, all printed or on the board; Practice 1 Steps band not printed | PASS |
| E36 | Exit slip + items: no part equals the difference of the parts; each fresh (on no other page, nor turned round) | no + exit items | PASS |
| E37 | Function tables: no (In, Out) pair on two pages, no rule on more than two tables (table identity = rule + pairs) | no tables | PASS |
| E38 | No unfilled {placeholder} on any page | none | PASS |
| E40 | No item text or slot drawn outside its cell (clipped or overlapping) | none | PASS |
| E39 | No band has more columns than items (an empty bordered track reads as a missing item) | 36 grids, none | PASS |
| E30 | No boardOnly number on a pupil page or key (item, answer, digits or name) | none declared: on no pupil page or key (20 pages) | PASS |
| E29 | Every item letter and answer a teacher page quotes is on the pupil page it names (T3 §1, T5 §10, T6 routing, T6 P5 glance) | 13 quotes, all on their pages | PASS |
| E28 | No Say:, Rule: or Remember: band on a Practice page | 4 Practice / Mixed pages; extra bands 0 | PASS |
| E27 | Counters in rows of at most 5 | no counters | PASS |
| E26 | Every anchor-chart step panel adds a grey (newest) mark | P2 3 / 3 panels; P2b 3 / 3 panels | PASS |
| E25 | One key per pupil page (anchor chart included) | 10 pupil pages, 10 keys | PASS |

**48 / 48 pass.**

## Per page

| Page | Kind | Used % | Bottom blank % | Min text pt | Cells | Min free % | Paints |
|---|---|---|---|---|---|---|---|
| T1 | teacher | 97 | 0 | 10 | 0 | — | #000000 |
| T2 | teacher | 93 | 0 | 10 | 0 | — | #000000 #5b2a86 |
| T2b | teacher | 91 | 0 | 10 | 0 | — | #000000 #5b2a86 #ffffff |
| T3 | teacher | 91 | 0 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T4 | teacher | 99 | 0 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T4-2 | teacher | 60 | 0 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T5 | teacher | 92 | 0 | 11 | 0 | — | #000000 #5b2a86 #c2410c #ffffff |
| P0 | pupil | 91 | 4 | 12 | 4 | 44 | #000000 #ffffff |
| P1 | pupil | 94 | 4 | 12 | 10 | 52 | #000000 #ffffff |
| P2 | pupil | 98 | 0 | 12 | 4 | 34 | #000000 #5b2a86 #949494 #ffffff |
| P2b | pupil | 98 | 0 | 12 | 4 | 33 | #000000 #5b2a86 #949494 #ffffff |
| P3 | pupil | 96 | 1 | 12 | 2 | 48 | #000000 #5b2a86 #949494 #ffffff |
| P3b | pupil | 93 | 1 | 12 | 2 | 51 | #000000 #5b2a86 #949494 #ffffff |
| P4-1 | pupil | 94 | 0 | 12 | 2 | 55 | #000000 #ffffff |
| P4-2 | pupil | 94 | 0 | 12 | 2 | 58 | #000000 #ffffff |
| P5 | pupil | 100 | 0 | 12 | 3 | 55 | #000000 #5b2a86 #ffffff |
| P6 | pupil | 98 | 0 | 12 | 4 | 29 | #000000 #ffffff |
| P0-key | key | 91 | 4 | 12 | 4 | 44 | #000000 #c2410c #ffffff |
| P1-key | key | 94 | 4 | 12 | 10 | 52 | #000000 #c2410c #ffffff |
| P2-key | key | 98 | 0 | 12 | 4 | 34 | #000000 #5b2a86 #949494 #ffffff |
| P2b-key | key | 98 | 0 | 12 | 4 | 33 | #000000 #5b2a86 #949494 #ffffff |
| P3-key | key | 96 | 1 | 12 | 2 | 47 | #000000 #5b2a86 #c2410c #ffffff |
| P3b-key | key | 93 | 1 | 12 | 2 | 51 | #000000 #5b2a86 #c2410c #ffffff |
| P4-1-key | key | 94 | 0 | 12 | 2 | 54 | #000000 #c2410c #ffffff |
| P4-2-key | key | 94 | 0 | 12 | 2 | 58 | #000000 #c2410c #ffffff |
| P5-key | key | 100 | 0 | 12 | 3 | 55 | #000000 #5b2a86 #c2410c #ffffff |
| P6-key | key | 97 | 0 | 12 | 4 | 29 | #000000 #c2410c #ffffff |
| T6 | teacher | 79 | 0 | 10 | 0 | — | #000000 #c2410c |

## Notes from the build

- Exit slip: a group of items does not fit two across a 132.5 mm half; printed one across.
- Tall problems: 2 rows per page. Very tall problems: fewer than 3 rows fit.

