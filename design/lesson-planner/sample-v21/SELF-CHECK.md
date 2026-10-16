# V21 self-check: sample-v21

Run by `selfcheck.mjs` (Appendix E reference implementation, Chromium print media) on `pack.html`, 2026-10-16. Checks are V21 Appendix E (E1–E28 with lettered sub-checks): **34 / 34 PASS**.

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
| E9 | Every page ≥ 50 % used and nothing runs past the body (lowest ink over body height ≤ 100 %) | min 73 % (T1 98, T2 96, T2b 95, T3 96, T4 94, T5 95, P0 89, P1 99, P2 98, P3 97, P4a 96, P4b 73, P5 99, P6 100, P0-key 89, P1-key 99, P2-key 98, P3-key 98, P4a-key 97, P4b-key 74, P5-key 99, P6-key 100, T6 98) | PASS |
| E10 | Every item cell ≥ 40 % free (pupil pages; a key is its page; reading cells - story box, routine panel - exempt) | 59 cells; min free 50 %; below 40 %: none | PASS |
| E11 | No empty band ≥ 30 % of a cell, measured exactly as the site sheetCheck: from the cell border box (padding counts as empty); every leaf, slot or bordered element is content (labels excepted), so a reserved answer row counts | worst top 24 %, left 29 %, right 29 %, bottom 24 %; failing: none | PASS |
| E12 | Equal cells within each section (±0.5 mm), and across all pages of a section (PG-11: Practice 1 and Practice 2, keys included) | all sections equal; Practice cells across pages: 42 cells, spread 0.0 × 0.0 mm | PASS |
| E28 | No Say:, Rule: or Remember: band on a Practice page (keys included); freed rows are one unruled trailing area (§8.12.4) | 4 Practice pages; extra bands: 0 | PASS |
| E13 | Slot widths = one B(n) per section, ≥ 14 mm; no underscore characters on pupil pages | P0/pre: 14 mm; P1/nsA: 17 mm; P1/nsB: 17 mm; P5/wp: 17 mm; P5/P5: 17 mm; P0-key/pre: 14 mm; P1-key/nsA: 17 mm; P1-key/nsB: 17 mm; P5-key/wp: 17 mm; P5-key/P5-key: 17 mm; underscores: 0 | PASS |
| E14 | No dashed line except the cut line (and the missing-digit box) | 0 dashed strokes outside a cut line | PASS |
| E15 | Instructions ≤ 12 words, every sentence starts with a print verb, string in Appendix C.1 (130 strings read from V21) | 44 instructions; max 8 words; failing: none | PASS |
| E16 | Every frame has ≤ 2 blanks | Say frames: 9; blanks per frame 0, 1 | PASS |
| E17 | Each key has the same slots as its page (facsimile) | P0 5/5, P1 12/12, P2 5/5, P3 8/8, P4a 12/12, P4b 9/9, P5 11/11, P6 12/12 | PASS |
| E18 | © line and strand tab on every page | © on 23/23; tab on 23/23 | PASS |
| E19 | One identical I Can title on every page | I Can add 1–3 (facts to 10) | PASS |
| E20 | No lone item (one-item pages only where the role ceiling is 1: word problem v1; the anchor chart is a poster) | none | PASS |
| E9b | Body no more than 8 % blank below its last band (site lint, frame counts) | max 0 %; over 8 %: none | PASS |
| E1b | Exit-slip halves 132.5 ± 0.5 mm wide (A4 landscape, live 271 × 186 mm, 6 mm cut gap) | P6: 132.5 / 132.5; P6-key: 132.5 / 132.5 | PASS |
| E16b | Routine panel: one action per check box, each row one line (≤ 9 mm) | 12 rows; tallest 7 mm | PASS |
| E21 | T2: ≥ 5 atoms, every type one of Category / Comparative / Fact / Conceptual; no ★ in the atom tables | 8 atoms: Fact, Fact, Comparative, Conceptual, Category, Conceptual, Fact, Comparative; ★ in tables: false | PASS |
| E22 | Every delivery page (T3–T5) shows at least one pupil-page thumbnail | T3: 1, T4: 2, T5: 1 | PASS |
| E23 | Every row of T6 "Answers at a glance" carries a fade label ★ / ★★ / ★★★ | 11 / 11 rows | PASS |
| E24 | Item pool, read from the pack (LR-5, §9.5): pool recomputed from its declared rule (data, no eval); every item in the pool and not forbidden; ZERO repeats of (fact, representation) anywhere; a fact never twice on one page; the same fact in another representation on another page only while usable < 12; places ≤ usable pool when usable ≥ 12; no turn-around pair on one page; FAILS when the pool JSON or the items are missing | 37 places (37 facts), usable pool 37 (pool 39 recomputed from its rule: matches); repeats 0; other-representation repeats on other pages 0; chart examples returning 0; same-page turn-arounds 0; outside the pool / forbidden 0; items without data-rep 0 | PASS |
| E24b | Practice last row holds only edge cases (★★★ is true); LR-6: no two answers alike on a page; − : no number taken away twice on a page and no near twins (both numbers within 2 of another item); + : no first addend twice in a row of the grid or three times running | 2 Practice pages: last rows all edge cases; LR-6 holds on every pupil page; no twin answers (per page, or per row when the pool has fewer answers than the page has items) | PASS |
| E17b | The anchor chart and its key carry no answer marks (no .ka / data-ka) | P2: 0, P2-key: 0 | PASS |
| E26 | Every anchor-chart step panel adds at least one grey (newest) mark | 3 / 3 panels | PASS |
| E21b | T1 flow word = the rule: Chunked when the T2 routine table has ≥ 4 rows tagged New, else Standard | T2 New routine steps 2 → Standard; T1 says "Standard" | PASS |
| E27 | Counters are drawn in rows of at most 5 (RP-21, §19.3) | P0:5 | PASS |
| E25 | One key per pupil page (anchor chart included) | 8 pupil pages, 8 keys | PASS |

**34 / 34 pass.**

## Per page

| Page | Used % | Min text pt | Cells | Min free % | Paints |
|---|---|---|---|---|---|
| T1 | 98 | 10 | 0 | — | #000000 |
| T2 | 96 | 10 | 0 | — | #000000 |
| T2b | 95 | 10 | 0 | — | #000000 #5b2a86 |
| T3 | 96 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T4 | 94 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T5 | 95 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| P0 | 89 | 12 | 4 | 50 | #000000 #ffffff |
| P1 | 99 | 11 | 10 | 57 | #000000 #ffffff |
| P2 | 98 | 14.99 | 5 | 57 | #000000 #5b2a86 #949494 #ffffff |
| P3 | 97 | 12 | 9 | 74 | #000000 #5b2a86 #949494 #ffffff |
| P4a | 96 | 12 | 12 | 80 | #000000 #5b2a86 #ffffff |
| P4b | 73 | 12 | 9 | 80 | #000000 #5b2a86 #ffffff |
| P5 | 99 | 12 | 2 | 11 | #000000 #5b2a86 #ffffff |
| P6 | 100 | 12 | 8 | 84 | #000000 #ffffff |
| P0-key | 89 | 11 | 4 | 50 | #000000 #c2410c #ffffff |
| P1-key | 99 | 11 | 10 | 56 | #000000 #c2410c #ffffff |
| P2-key | 98 | 14.99 | 5 | 57 | #000000 #5b2a86 #949494 #ffffff |
| P3-key | 98 | 12 | 9 | 15 | #000000 #5b2a86 #949494 #c2410c #ffffff |
| P4a-key | 97 | 12 | 12 | 79 | #000000 #5b2a86 #c2410c #ffffff |
| P4b-key | 74 | 12 | 9 | 79 | #000000 #5b2a86 #c2410c #ffffff |
| P5-key | 99 | 12 | 2 | 11 | #000000 #5b2a86 #c2410c #ffffff |
| P6-key | 100 | 12 | 8 | 83 | #000000 #c2410c #ffffff |
| T6 | 98 | 10 | 0 | — | #000000 #c2410c |

## Page files (23 pages)

page-01 T1 · page-02 T2 · page-03 T2b · page-04 T3 · page-05 T4 · page-06 T5 · page-07 P0 · page-08 P1 ·
page-09 P2 anchor chart · page-10 P3 lesson sheet · page-11 P4 Practice 1 · page-12 P4 Practice 2 · page-13 P5 ·
page-14 P6 exit slip (A4 landscape, 2-up) · page-15 to page-22 keys of P0, P1, P2, P3, P4 ×2, P5, P6 · page-23 T6.

## Checks by eye (looked at every PNG, round 7)

| Check | Result |
|---|---|
| Chart: every case the practice deals is drawn; the other examples are finished in black (answers printed) | PASS |
| Chart: each step panel adds a grey mark (also E26); the chart and its key carry no answer marks (E17b) | PASS |
| Guided cell 1 has step 1 in grey; Guided cells varied | PASS |
| Key answers sit in the pupil's slots; no clipped content | PASS |

The item pool travels inside `pack.html` (`<script id="v21-pool">`); E24 / E24b read it and the `data-item`
marks, and fail when either is missing. Built from code extracted from V21 itself; iterated in a scratch folder.
