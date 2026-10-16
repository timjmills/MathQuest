# V21 self-check: sample-v21-sub

Run by `selfcheck.mjs` (Appendix E reference implementation, Chromium print media) on `pack.html`, 2026-10-16. Checks are V21 Appendix E, E1–E25.

| # | Check | Measured | Result |
|---|---|---|---|
| E1 | Paper is A4 (595 × 842 pt; the 2-up exit slip is A4 landscape) | 21 portrait A4 + 2 landscape A4 of 23 | PASS |
| E2 | Andika loaded (400 and 700) and on every text node | fonts.check 700/28px true, 400/15px true; non-Andika text nodes: 0 | PASS |
| E3 | Only #000, #FFF, #949494; accent #5B2A86 only on step marks; key #C2410C only on answer marks | paints used: #000000, #5b2a86, #949494, #c2410c, #ffffff; out-of-place paints: 0 | PASS |
| E4 | No colour on pupil pages except the accent on step marks | pupil-page paints: #000000, #5b2a86, #949494, #ffffff | PASS |
| E5 | No emoji or pictographs (© and the teacher-page ★ fade label excepted) | 0 found | PASS |
| E6 | No pupil text below 11 pt (quiet letters 10 pt, strand tab 10 pt and footer 7 pt are the only exceptions) | smallest pupil text 11 pt; quiet letters 9.999975000000001 pt | PASS |
| E7 | Teacher text ≥ 10 pt (tables 10, body 11, spoken 13) | smallest teacher text 10 pt | PASS |
| E8 | Working digits are 28 pt on every pupil page (anchor chart may enlarge, never shrink) | digit sizes found: 28 pt | PASS |
| E9 | Every page ≥ 50 % used and nothing runs past the body (lowest ink over body height ≤ 100 %) | min 92 % (T1 95, T2 98, T2b 93, T3 95, T4 95, T5 100, P0 94, P1 99, P2 98, P3 92, P4a 97, P4b 97, P5 99, P6 100, P0-key 95, P1-key 99, P2-key 98, P3-key 93, P4a-key 97, P4b-key 97, P5-key 99, P6-key 100, T6 96) | PASS |
| E10 | Every item cell ≥ 40 % free (pupil pages; a key is its page; reading cells - story box, routine panel - exempt) | 52 cells; min free 48 %; below 40 %: none | PASS |
| E11 | No empty band ≥ 30 % of a cell, measured exactly as the site sheetCheck: from the cell border box (padding counts as empty); every leaf, slot or bordered element is content (labels excepted), so a reserved answer row counts | worst top 26 %, left 29 %, right 29 %, bottom 26 %; failing: none | PASS |
| E12 | Equal cells within each section (±0.5 mm) | all sections equal | PASS |
| E13 | Slot widths = one B(n) per section, ≥ 14 mm; no underscore characters on pupil pages | P0/pre: 17 mm; P1/nsA: 17 mm; P1/nsB: 17 mm; P4a/practice: 17 mm; P4b/practice: 17 mm; P5/wp: 17 mm; P5/P5: 17 mm; P0-key/pre: 17 mm; P1-key/nsA: 17 mm; P1-key/nsB: 17 mm; P4a-key/practice: 17 mm; P4b-key/practice: 17 mm; P5-key/wp: 17 mm; P5-key/P5-key: 17 mm; underscores: 0 | PASS |
| E14 | No dashed line except the cut line (and the missing-digit box) | 0 dashed strokes outside a cut line | PASS |
| E15 | Instructions ≤ 12 words, every sentence starts with a print verb, string in Appendix C.1 (130 strings read from V21) | 44 instructions; max 8 words; failing: none | PASS |
| E16 | Every frame has ≤ 2 blanks | Say frames: 9; blanks per frame 0, 1 | PASS |
| E17 | Each key has the same slots as its page (facsimile) | P0 13/13, P1 14/14, P2 25/25, P3 30/30, P4a 42/42, P4b 42/42, P5 11/11, P6 44/44 | PASS |
| E18 | © line and strand tab on every page | © on 23/23; tab on 23/23 | PASS |
| E19 | One identical I Can title on every page | I Can subtract within 100 (with regrouping) | PASS |
| E20 | No lone item (one-item pages only where the role ceiling is 1: word problem v1; the anchor chart is a poster) | none | PASS |
| E9b | Body no more than 8 % blank below its last band (site lint, frame counts) | max 0 %; over 8 %: none | PASS |
| E1b | Exit-slip halves 132.5 ± 0.5 mm wide (A4 landscape, live 271 × 186 mm, 6 mm cut gap) | P6: 132.5 / 132.5; P6-key: 132.5 / 132.5 | PASS |
| E16b | Routine panel: one action per check box, each row one line (≤ 9 mm) | 12 rows; tallest 7 mm | PASS |
| E21 | T2: ≥ 5 atoms, every type one of Category / Comparative / Fact / Conceptual; no ★ in the atom tables | 7 atoms: Fact, Conceptual, Fact, Category, Comparative, Conceptual, Fact; ★ in tables: false | PASS |
| E22 | Every delivery page (T3–T5) shows at least one pupil-page thumbnail | T3: 1, T4: 2, T5: 1 | PASS |
| E23 | Every row of T6 "Answers at a glance" carries a fade label ★ / ★★ / ★★★ | 11 / 11 rows | PASS |
| E24 | Item pool, read from the pack (LR-5): pool recomputed from its declared rule; places ≤ usable pool; every item in the pool and not forbidden; ZERO exact repeats anywhere (exit slip included); no turn-around pair on one page; FAILS when the pool JSON or the items are missing | 25 places, usable pool 2025 (pool 2025 recomputed from its rule: matches); exact repeats 0; same-page turn-arounds 0; outside the pool / forbidden 0 | PASS |
| E24b | Practice last row holds only edge cases (★★★ is true); LR-6: no two answers alike on a page; − : no number taken away twice on a page and no near twins (both numbers within 2 of another item); + : no first addend twice in a row of the grid or three times running | 2 Practice pages: last rows all edge cases; LR-6 holds on every pupil page; no twin answers (per page, or per row when the pool has fewer answers than the page has items) | PASS |
| E17b | The anchor chart and its key carry no answer marks (no .ka / data-ka) | P2: 0, P2-key: 0 | PASS |
| E26 | Every anchor-chart step panel adds at least one grey (newest) mark | 5 / 5 panels | PASS |
| E21b | T1 flow word = the rule: Chunked when the T2 routine table has ≥ 4 rows tagged New, else Standard | T2 New routine steps 3 → Standard; T1 says "Standard" | PASS |
| E27 | Counters are drawn in rows of at most 5 (RP-21, §19.3) | no counters | PASS |
| E25 | One key per pupil page (anchor chart included) | 8 pupil pages, 8 keys | PASS |

**33 / 33 pass.**

## Per page

| Page | Used % | Min text pt | Cells | Min free % | Paints |
|---|---|---|---|---|---|
| T1 | 95 | 10 | 0 | — | #000000 |
| T2 | 98 | 10 | 0 | — | #000000 |
| T2b | 93 | 10 | 0 | — | #000000 #5b2a86 |
| T3 | 95 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T4 | 95 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T5 | 100 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| P0 | 94 | 12 | 7 | 51 | #000000 #ffffff |
| P1 | 99 | 11 | 10 | 48 | #000000 #ffffff |
| P2 | 98 | 12 | 6 | 59 | #000000 #5b2a86 #949494 #ffffff |
| P3 | 92 | 12 | 7 | 56 | #000000 #5b2a86 #949494 #ffffff |
| P4a | 97 | 12 | 6 | 76 | #000000 #5b2a86 #ffffff |
| P4b | 97 | 12 | 6 | 76 | #000000 #5b2a86 #ffffff |
| P5 | 99 | 12 | 2 | 11 | #000000 #5b2a86 #ffffff |
| P6 | 100 | 12 | 8 | 76 | #000000 #ffffff |
| P0-key | 95 | 11 | 7 | 50 | #000000 #c2410c #ffffff |
| P1-key | 99 | 11 | 10 | 47 | #000000 #c2410c #ffffff |
| P2-key | 98 | 12 | 6 | 59 | #000000 #5b2a86 #949494 #ffffff |
| P3-key | 93 | 12 | 7 | 11 | #000000 #5b2a86 #949494 #c2410c #ffffff |
| P4a-key | 97 | 12 | 6 | 74 | #000000 #5b2a86 #c2410c #ffffff |
| P4b-key | 97 | 12 | 6 | 74 | #000000 #5b2a86 #c2410c #ffffff |
| P5-key | 99 | 12 | 2 | 11 | #000000 #5b2a86 #c2410c #ffffff |
| P6-key | 100 | 12 | 8 | 73 | #000000 #c2410c #ffffff |
| T6 | 96 | 10 | 0 | — | #000000 #c2410c |

## Page files (23 pages)

page-01 T1 · page-02 T2 · page-03 T2b · page-04 T3 · page-05 T4 · page-06 T5 · page-07 P0 · page-08 P1 ·
page-09 P2 anchor chart · page-10 P3 lesson sheet · page-11 P4 Practice 1 · page-12 P4 Practice 2 · page-13 P5 ·
page-14 P6 exit slip (A4 landscape, 2-up) · page-15 to page-22 keys of P0, P1, P2, P3, P4 ×2, P5, P6 · page-23 T6.

## Checks by eye (looked at every PNG, round 4)

| Check | Result |
|---|---|
| Chart: every case the practice deals is drawn; the other examples are finished in black (answers printed) | PASS |
| Chart: each step panel adds a grey mark (also E26); the chart and its key carry no answer marks (E17b) | PASS |
| Guided cell 1 has step 1 in grey; Guided cells varied | PASS |
| Key answers sit in the pupil's slots; no clipped content | PASS |

The item pool travels inside `pack.html` (`<script id="v21-pool">`); E24 / E24b read it and the `data-item`
marks, and fail when either is missing. Built from code extracted from V21 itself; iterated in a scratch folder.
