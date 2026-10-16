# V21 self-check: add 1–3 sample pack

Run by `selfcheck.mjs` (Chromium print media, A4) on `pack.html`, 2026-10-16. Checks are V21 Appendix E, E1–E20.

| # | Check | Measured | Result |
|---|---|---|---|
| E1 | Paper is A4 (595 × 842 pt; the 2-up exit slip is A4 landscape) | 20 portrait A4 + 2 landscape A4 of 22 | PASS |
| E2 | Andika loaded (400 and 700) and on every text node | fonts.check 700/28px true, 400/15px true; non-Andika text nodes: 0 | PASS |
| E3 | Only #000, #FFF, #949494; accent #5B2A86 only on step marks; key #C2410C only on answer marks | paints used: #000000, #5b2a86, #949494, #c2410c, #ffffff; out-of-place paints: 0 | PASS |
| E4 | No colour on pupil pages except the accent on step marks | pupil-page paints: #000000, #5b2a86, #949494, #ffffff | PASS |
| E5 | No emoji or pictographs (© and the teacher-page ★ fade label excepted) | 0 found | PASS |
| E6 | No pupil text below 11 pt (quiet letters 10 pt, strand tab 10 pt and footer 7 pt are the only exceptions) | smallest pupil text 11 pt; quiet letters 9.999975000000001 pt | PASS |
| E7 | Teacher text ≥ 10 pt (tables 10, body 11, spoken 13) | smallest teacher text 10 pt | PASS |
| E8 | Working digits are 28 pt on every pupil page (anchor chart may enlarge, never shrink) | digit sizes found: 28 pt | PASS |
| E9 | Every page ≥ 50 % used (lowest ink over body height) | min 59 % (T1 98, T2 92, T2b 59, T3 93, T4 94, T5 92, P0 96, P1 99, P2 98, P3 82, P4a 91, P4b 91, P5 99, P6 100, P0-key 96, P1-key 99, P3-key 88, P4a-key 97, P4b-key 97, P5-key 99, P6-key 100, T6 68) | PASS |
| E10 | Every item cell ≥ 40 % free (pupil pages; a key is its page; reading cells - story box, routine panel - exempt) | 54 cells; min free 58 %; below 40 %: none | PASS |
| E11 | No empty band ≥ 30 % of a cell (top and left always; right and bottom unless that side is the open answer / work zone) | worst top 19 %, left 29 %, right 62 %, non-work bottom 19 %, non-work right 29 %; failing: none | PASS |
| E12 | Equal cells within each section (±0.5 mm) | all sections equal | PASS |
| E13 | Slot widths = one B(n) per section, ≥ 14 mm; no underscore characters on pupil pages | P0/pre: 14 mm; P1/nsA: 17 mm; P1/nsB: 17 mm; P5/P5: 17 mm; P0-key/pre: 14 mm; P1-key/nsA: 17 mm; P1-key/nsB: 17 mm; P5-key/P5-key: 17 mm; underscores: 0 | PASS |
| E14 | No dashed line except the cut line (and the missing-digit box) | 0 dashed strokes outside a cut line | PASS |
| E15 | Instructions ≤ 12 words, every sentence starts with a print verb, string from the library | 44 instructions; max 8 words; failing: none | PASS |
| E16 | Every frame has ≤ 2 blanks | Say frames: 8; blanks per frame 0, 1 | PASS |
| E17 | Each key has the same slots as its page (facsimile) | P0 5/5, P1 12/12, P3 6/6, P4a 12/12, P4b 12/12, P5 10/10, P6 6/6 | PASS |
| E18 | © line and strand tab on every page | © on 22/22; tab on 22/22 | PASS |
| E19 | One identical I Can title on every page | I Can add 1–3 (facts to 10) | PASS |
| E20 | No lone item (one-item pages only where the role ceiling is 1: word problem v1, exit slip) | none | PASS |

**20 / 20 pass.**

## Per page

| Page | Used % | Min text pt | Cells | Min free % | Paints |
|---|---|---|---|---|---|
| T1 | 98 | 10 | 0 | — | #000000 |
| T2 | 92 | 10 | 0 | — | #000000 |
| T2b | 59 | 10 | 0 | — | #000000 #5b2a86 #c2410c |
| T3 | 93 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T4 | 94 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| T5 | 92 | 11 | 0 | — | #000000 #5b2a86 #c2410c |
| P0 | 96 | 12 | 4 | 59 | #000000 #ffffff |
| P1 | 99 | 11 | 10 | 58 | #000000 #ffffff |
| P2 | 98 | 14.99 | 5 | 62 | #000000 #5b2a86 #949494 #ffffff |
| P3 | 82 | 12 | 7 | 84 | #000000 #5b2a86 #949494 #ffffff |
| P4a | 91 | 12 | 12 | 90 | #000000 #5b2a86 #ffffff |
| P4b | 91 | 12 | 12 | 90 | #000000 #5b2a86 #ffffff |
| P5 | 99 | 12 | 2 | 10 | #000000 #5b2a86 #ffffff |
| P6 | 100 | 12 | 2 | 98 | #000000 #ffffff |
| P0-key | 96 | 11 | 4 | 59 | #000000 #c2410c #ffffff |
| P1-key | 99 | 11 | 10 | 57 | #000000 #c2410c #ffffff |
| P3-key | 88 | 12 | 7 | 19 | #000000 #5b2a86 #949494 #c2410c #ffffff |
| P4a-key | 97 | 12 | 12 | 84 | #000000 #5b2a86 #c2410c #ffffff |
| P4b-key | 97 | 12 | 12 | 84 | #000000 #5b2a86 #c2410c #ffffff |
| P5-key | 99 | 12 | 2 | 10 | #000000 #5b2a86 #c2410c #ffffff |
| P6-key | 100 | 12 | 2 | 97 | #000000 #c2410c #ffffff |
| T6 | 68 | 10 | 0 | — | #000000 #c2410c |

## Page files

| PNG | Page | PNG | Page |
|---|---|---|---|
| page-01 | T1 Lesson at a glance | page-12 | P4 Practice 2 |
| page-02 | T2 Atomisation | page-13 | P5 Word problem |
| page-03 | T2b Reference | page-14 | P6 Exit slip (A4 landscape, 2-up) |
| page-04 | T3 Delivery (Sections 1–4) | page-15 | Key: P0 |
| page-05 | T4 Delivery (Sections 5–6) | page-16 | Key: P1 |
| page-06 | T5 Delivery (Sections 7–10) | page-17 | Key: P3 |
| page-07 | P0 Prerequisite Check | page-18 | Key: P4 Practice 1 |
| page-08 | P1 Number sense | page-19 | Key: P4 Practice 2 |
| page-09 | P2 Anchor chart | page-20 | Key: P5 |
| page-10 | P3 Lesson sheet | page-21 | Key: P6 |
| page-11 | P4 Practice 1 | page-22 | T6 routing page |

## Checks by eye (Appendix E, last paragraph)

| Check | Result |
|---|---|
| The anchor chart draws every case the practice deals (big first 7 + 2; big second with a sum of 10, 2 + 8; same numbers 3 + 3) | PASS |
| Newest mark of each step is grey (step 2 tile and hops; step 3 answer) | PASS |
| Guided cell 1 has step 1 in grey (ring round 3) | PASS |
| No item repeats in the packet, chart examples included; no turn-around pair on one page | PASS (checked against the Appendix F lists) |
| Key answers sit in the pupil's slots | PASS (pages 15–21) |

Build: `pack.html` was generated by the Appendix G builder **extracted from the V21 file itself** (CSS from
Appendix A, recipes from Appendix D), so the pack depends on nothing but V21 and the Andika font files
(referenced at `../../../css/fonts/`). PDF: Chromium print at 100 %, A4 (`preferCSSPageSize`). PNGs:
`pdftoppm -r 110`.
