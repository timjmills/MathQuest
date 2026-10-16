# V22 self-check: g2-nbt3-read-write-1000

Run by `tests/scripts/ws-detailed-lesson.cjs --check` (V22 Appendix E, ported to the kit's markup; Chromium print media) on `pack.html`, seed 4242, 2026-10-16. **35 / 35 PASS**.

| # | Check | Measured | Result |
|---|---|---|---|
| E1 | Paper is A4 (595 × 842 pt; the 2-up exit slip A4 landscape) | 29 portrait + 2 landscape of 31; 31 pages in the DOM | PASS |
| E1b | Exit-slip halves 132.5 ± 0.5 mm wide | P6: 132.5 / 132.5; P6-key: 132.5 / 132.5 | PASS |
| E2 | Andika 400 + 700 loaded and on every text node | 700/28px true, 400/15px true; other faces 0 | PASS |
| E3 | Only #000, #FFF, #949494; accent #5B2A86 only on step marks; key #C2410C only on answer marks | paints #000000, #5b2a86, #949494, #c2410c, #ffffff; out of place 0 | PASS |
| E4 | No colour on pupil pages except the accent on step marks | pupil-page paints: #000000, #5b2a86, #949494, #ffffff | PASS |
| E5 | No emoji (© and the teacher-page ★ excepted) | 0 found | PASS |
| E6 | Pupil text ≥ 11 pt (quiet letters, tab, footer excepted) | smallest 11.76 pt (P0 "H", P4m-1 "H") | PASS |
| E7 | Teacher text ≥ 10 pt | smallest 10 pt (T1 "#", T2 "#") | PASS |
| E8 | Working digits 28 pt outside the anchor chart | the kit sets --ws-digit 28pt at size L on every pupil page (one size L pack); measured by ws-print-lint --source kit | PASS |
| E9 | Every page ≥ 50 % used, nothing past the body | min 33 %; overflow none; under 50 %: T2-2 33 | PASS |
| E9b | Body ≤ 8 % blank below its last band (site lint) | max 5 %; over 8 %: none | PASS |
| E10 | Every item cell ≥ 40 % free (reading cells exempt) | 164 cells; min free 46 %; below 40 %: none | PASS |
| E11 | No empty band ≥ 30 % in a cell (the site sheetCheck H13, from the border box) | worst 27 %; failing: none | PASS |
| E12 | Equal cells within each grid (±0.5 mm) and across the Practice pages | all grids equal; Practice cells 17, spread 0.0 × 0.0 mm | PASS |
| E13 | No underscore characters on pupil pages (slot widths: ws-print-lint --source kit) | underscores 0 | PASS |
| E14 | No dashed line except the cut line and the missing-digit box | 0 outside a cut line | PASS |
| E15 | Instructions ≤ 12 words, print verb first, string in the controlled library (V22 Appendix C.1: 130 strings; the kit's PED 10.1 library: 161) | 30 instructions; failing: none; in the kit library but missing from V22 C.1: "Write the number.", "Write how many of each place." | PASS |
| E16 | Every Say frame ≤ 2 blanks | 12 frames; blanks 0, 1 | PASS |
| E16b | RCDWS panel: one action per box, each row one line (≤ 9 mm) | 12 rows; tallest 9 mm | PASS |
| E17b | The anchor chart and its key carry no answer marks | P2: 0, P2b: 0, P2-key: 0, P2b-key: 0 | PASS |
| E17 | Each key has the same slots as its page | P0 15/15, P1 12/12, P2 0/0, P2b 0/0, P3 19/19, P3b 24/24, P4-1 27/27, P4-2 25/25, P4m-1 19/19, P5 11/11, P6 20/20 | PASS |
| E18 | © line and strand tab on every page | © 31/31; tab 31/31 | PASS |
| E19 | One identical I Can title on every page | I Can read and write numbers to 1,000 | PASS |
| E20 | No lone item (word problem v1 and the anchor chart excepted) | none | PASS |
| E21b | T1 Flow word: Chunked when T2 has ≥ 4 routine rows tagged New | T2 New rows 5 → Chunked; T1 "Chunked" | PASS |
| E21 | T2: ≥ 5 atoms of the four types; no ★ in the atom tables | 8 atoms: Fact, Conceptual, Conceptual, Category, Conceptual, Comparative, Conceptual, Fact; ★ false | PASS |
| E22 | Every delivery page (T3–T5) shows a pupil-page thumbnail | T3: 1, T4: 2, T5: 1 | PASS |
| E23 | Every row of T6 "Answers at a glance" carries ★ / ★★ / ★★★ | 4/4 | PASS |
| E24 | Item pool read from the pack (LR-5): pool recomputed from its rule; 0 repeats of (number, representation); a number never twice on a page; chart examples never return | 70 places (70 numbers), usable pool 980 (pool 980 recomputed from its list rule: matches); repeats 0; chart examples returning 0; outside the pool 0; items without a rep 0 | PASS |
| E24b | Practice last row only edge cases (★★★); LR-6 no twin answers on a page | 2 Practice pages: last rows all edge cases (a 0 place, a teen ending, 1000); no twin answers on any page | PASS |
| E29 | Every item letter and answer a teacher page quotes is on the pupil page it names (T3 §1, T5 §10, T6 routing) | 14 quotes, all on their pages | PASS |
| E28 | No Say:, Rule: or Remember: band on a Practice page | 6 Practice / Mixed pages; extra bands 0 | PASS |
| E27 | Counters in rows of at most 5 | no counters | PASS |
| E26 | Every anchor-chart step panel adds a grey (newest) mark | P2 3 / 3 panels; P2b 2 / 2 panels | PASS |
| E25 | One key per pupil page (anchor chart included) | 11 pupil pages, 11 keys | PASS |

**35 / 35 pass.**

## Per page

| Page | Kind | Used % | Bottom blank % | Min text pt | Cells | Min free % | Paints |
|---|---|---|---|---|---|---|---|
| T1 | teacher | 97 | 0 | 10 | 0 | — | #000000 |
| T2 | teacher | 97 | 0 | 10 | 0 | — | #000000 #5b2a86 |
| T2-2 | teacher | 33 | 0 | 10 | 0 | — | #000000 |
| T2b | teacher | 97 | 0 | 10 | 0 | — | #000000 #5b2a86 #ffffff |
| T3 | teacher | 95 | 0 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T4 | teacher | 80 | 0 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T4-2 | teacher | 81 | 0 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T5 | teacher | 99 | 0 | 11 | 0 | — | #000000 #5b2a86 #c2410c #ffffff |
| P0 | pupil | 87 | 0 | 11.76 | 9 | 63 | #000000 #ffffff |
| P1 | pupil | 95 | 3 | 12 | 10 | 50 | #000000 #ffffff |
| P2 | pupil | 98 | 0 | 15 | 6 | 56 | #000000 #5b2a86 #949494 #ffffff |
| P2b | pupil | 98 | 0 | 12 | 5 | 59 | #000000 #5b2a86 #949494 #ffffff |
| P3 | pupil | 94 | 4 | 12 | 7 | 55 | #000000 #5b2a86 #949494 #ffffff |
| P3b | pupil | 92 | 5 | 12 | 8 | 67 | #000000 #5b2a86 #949494 #ffffff |
| P4-1 | pupil | 97 | 0 | 12 | 9 | 64 | #000000 #5b2a86 #ffffff |
| P4-2 | pupil | 95 | 0 | 12 | 8 | 72 | #000000 #5b2a86 #ffffff |
| P4m-1 | pupil | 91 | 0 | 11.76 | 9 | 51 | #000000 #ffffff |
| P5 | pupil | 100 | 0 | 12 | 3 | 64 | #000000 #5b2a86 #ffffff |
| P6 | pupil | 93 | 0 | 12 | 8 | 46 | #000000 #ffffff |
| P0-key | key | 87 | 0 | 11.76 | 9 | 63 | #000000 #c2410c #ffffff |
| P1-key | key | 95 | 3 | 12 | 10 | 50 | #000000 #c2410c #ffffff |
| P2-key | key | 98 | 0 | 15 | 6 | 56 | #000000 #5b2a86 #949494 #ffffff |
| P2b-key | key | 98 | 0 | 12 | 5 | 59 | #000000 #5b2a86 #949494 #ffffff |
| P3-key | key | 94 | 4 | 12 | 7 | 51 | #000000 #5b2a86 #c2410c #ffffff |
| P3b-key | key | 92 | 5 | 12 | 8 | 67 | #000000 #5b2a86 #c2410c #ffffff |
| P4-1-key | key | 97 | 0 | 12 | 9 | 64 | #000000 #5b2a86 #c2410c #ffffff |
| P4-2-key | key | 95 | 0 | 12 | 8 | 72 | #000000 #5b2a86 #c2410c #ffffff |
| P4m-1-key | key | 91 | 0 | 11.76 | 9 | 51 | #000000 #c2410c #ffffff |
| P5-key | key | 100 | 0 | 12 | 3 | 64 | #000000 #5b2a86 #c2410c #ffffff |
| P6-key | key | 92 | 0 | 12 | 8 | 46 | #000000 #c2410c #ffffff |
| T6 | teacher | 94 | 0 | 10 | 0 | — | #000000 #c2410c |

## Notes from the build

- Dense: 1 x 9, cells sized to the problems.
- Dense: 2 x 4, cells sized to the problems.

