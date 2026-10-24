# Critic r2: lane S3 (stack engine debt + the SU-C pilot)

Critic: independent, mq-opus-medium, round 2, 2026-10-24, 19:34-21:31 UTC. I did not grade round 1 and built none of this. I edited no source file and made no commit. Everything I wrote is under `design/audit/runs/s3-stack/`: `render-r2-{S,M,L}/`, `contact-r2/`, `probes-r2/`, `panel-r2/`, `log-r2-*.txt`, this file and `grades-r2.jsonl`.

**Graded commit:** code at **3caaf5d**. HEAD moved to 605de211 during the run, but cf8abc99 and 605de211 touch only status docs (`git diff --stat 3caaf5d 605de211 -- js css` is empty), so every render is of 3caaf5d code.

**Scope used.** I graded every page type the brief lists. For the verdict I counted the versions the RUBRIC scope note counts (owner, 2026-09-26). Those are Practice (Independent, More practice, Mixed practice, and the fact layouts Fact rows and Fact probe), Test, the Lesson packet with its keys, the three screen hosts, the option panel and its values, and the anchor pages. The owner's note leaves out stand-alone Guided, Worked example, Review, Opener, Pre-skill check, Find the mistake (error analysis), True or False?, Reason It and Stretch. The brief asks me to grade those too. I scored them, but I list them under "Graded, outside the owner's bar" and they do not decide the verdict. A lead brief cannot widen an owner ruling.

## Verdict: FAIL (one 7)

All four r1 defects are fixed: A1, S1, N1b and N6b. Every change listed since r1 holds. One counted version scores 7:

- **F1.** sub_10k_no_regroup Fact rows at S: 4-digit facts in 8 columns. In all 8 cells the ink touches the cell frame on both sides (0 px). C3 7.

Also found:
- One counted nit: L2, the lesson re-deals the model problem.
- Three defects on page types outside the owner's bar: EA1, the error-analysis wrong answers shifted one place; W1, worked-example steps showing no digit; ST1, Stretch at L about 40 % empty.

## Score table (minimum per criterion)

| Skill | C1 | C2 | C3 | C4 | Where the minimum comes from |
|---|---|---|---|---|---|
| sub_50_no_regroup | 8 | 8 | 8 | 8 | lesson (C2 8, nit L2); mixed practice L (L-DENSITY H13 ×12, the class r1 and r2 ruled acceptable, the same as approved sub_100_regroup); anchors (C2 8) |
| sub_100_no_regroup | 8 | 8 | 8 | 8 | lesson; mixed L (as above) |
| sub_1k_no_regroup | 8 | 8 | 8 | 8 | lesson; fact rows S (3-digit, 8 columns, 7-8 px clear) |
| sub_10k_no_regroup | 8 | 8 | **7** | 8 | **fact rows S (F1)** |
| sub_100k_no_regroup | 8 | 8 | 8 | 8 | lesson; independent S (12 a page) |
| sub_1m_no_regroup | 8 | 8 | 8 | 8 | lesson; card-390 (fixed, 10-12 px clear); side anchors L (2 pairs, O1) |
| sub_2d_1d (preset) | 8 | 8 | 8 | 8 | page dealer (b = 1 fixed; answers 92 ×3 on one page, within the cap) |
| Anchor siblings: add_50_no_regroup, add_10k_regroup, add_100_regroup, sub_100_regroup, sub_1m_regroup (side, sections, S/M/L) | 8 | 8 | 8 | 8 | side L pupil cells (O1); sub_1m_regroup side has no examples (sibling data, as in r1) |
| Band-above: shade_fraction, money_count, place_value_10x (S, L) | 8 | 7* | 8 | 8 | A1 fixed. *C2 7 is partner model text (fractions / measurement providers), not counted |

Per version, for the seven pilot skills:

| Version | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Independent, More practice, Test (+ keys), S / L, M spot | 9 | 8 | 8 | 9 |
| Mixed practice, single skill, S / M / L (+ key) | 9 | 8 | 8 | 8 |
| Fact rows, S (10 × 7, 8 × 7, 5 × 6) / M (6 × 5) / L (5 × 5, 3 × 5) | 9 | 8 | 8 (**sub_10k S 7**, F1) | 8 |
| Fact probe, S / L (rows shared: 12/8, 9/6/5, 6/6/4/4) | 9 | 8 | 8 | 8 |
| Lesson packet p1-p3 (+ keys), S / L, M spot | 8 | 8 (L2 nit) | 8 | 8 |
| card-1280 / 820 / 390, worksheet-1280, quiz-1280 | 9 | 8 | 9 | 9 |
| Option panel (7 skills) | 9 | 9 | 8 | 8 |
| Options at S and L: zeros on, lengths shorter, level 3, level 0 | 9 | 8 | 8 | 9 |
| Side / sections anchors, pilot and siblings, S / M / L | 8 | 8 | 8 | 8 |
| Band-above anchors | 8 | 7* | 8 | 8 |

Quiz at 390 px: ws-grade-render renders `quiz-1280` only. At 390 I graded the practice card. The precritic's ws-phone-card (390 × 844 and 390 × 664) passed on 3caaf5d. I saw no quiz-390 render.

## Defects (counted)

**F1 · C3 major (−1, to 7) · CLIP_OVERLAP · sub_10k_no_regroup Fact rows at S: 4-digit facts in 8 columns touch the cell frame.**
- **Where:** `render-r2-S/subtraction__sub_10k_no_regroup/fact-rows-p1.png` and its key. Crop: `contact-r2/s10kS-fr-crop.png`.
- **Observed:**
  - A pixel scan of row 1 (`probes-r2`, method in this report) gives a gap of **0 px to the left and 0 px to the right in all 8 cells**: the minus sits on the left frame, the ones digit on the right frame, and the answer rule runs frame to frame. The rule then reads as a cell boundary, so each cell looks split in two.
  - For comparison:
    - sub_1k S, same 8 columns, 3 digits: 7-8 px.
    - sub_10k at M (6 × 6): 14-15 px; at L (5 columns): 17 px.
    - sub_100k S (5 columns): 12 px.
    - sub_1m S (5 columns): 10-11 px.
- **Cause:** `js/modules/sheet/roles/fact-rows.js` (PT-FRW-5 column cap, "Answers over 99: at most 8 columns … Digits 16 pt so 4-digit facts fit 8 columns"). The role's own measure in `meta.json` says the 4-digit item does **not** fit 8 columns (`'8': {fits: false, slackMm: -2.1}`, and 6 columns has only 1.7 mm). The cap still prints 8.
  - This is not new. r1 rendered the same 8 columns (8 × 8), but treated Fact rows as outside the bar. The owner's scope note does not exclude fact layouts.
- **Fix:** take the column count from the measured fit (the largest count whose `slackMm` is ≥ 1.5 mm, which is 5 at S for 4 digits), or shrink only through the size ladder. Never print a count the role measured as not fitting.
- **Check:** every fact-row cell keeps ≥ 1.5 mm between its inked content and its frame, at S / M / L, for 1- to 6-digit facts.
- **Machine check:** none exists. `ws-print-lint --source kit --roles fact-rows --size S` gives 0 findings on this page (`probes-r2/lint-S.txt`), because L-OVERFLOW does not see content that fills the cell exactly. Add a fact-rows rule that fails when `measured[cols].fits === false` for the printed column count. The data is already in `meta.json`.

**L2 · C2 minor (nit, no score change) · the lesson packet re-deals the model problem as a practice item.**
- **Where:** `render-r2-S/subtraction__sub_50_no_regroup/lesson-p1.png` models 35 − 21 = 14. `lesson-p3.png` item 5 is 35 − 21. The same happens at L.
- **Observed:** this is the "answer given away" class (LESSONS_LEARNED L3) on 1 item of 6. The other six skills' lessons have no such repeat (`meta.json` item lists).
- **Fix:** in `js/modules/sheet/roles/lesson.js`, exclude the model's (and the Guided items') minuend-subtrahend pairs from the practice deal.
- **Machine check:** a lesson-data rule saying no practice item equals the model item.

## Graded, outside the owner's bar (not counted)

**EA1 · Find the mistake, 4- to 6-digit pilot skills: the wrong answer is drawn shifted one place left, with a comma in a digit box.** Scores C1 7, C2 6.
- **Where:** `contact-r2/eaL-1m.png` (sub_1m L): 596,229 − 312,116, and "Sam wrote: 8 4 , | 1 2 3". `contact-r2/eaL-100k.png` (sub_100k): "4 , | 1 6 4". sub_10k shows ", 4 7 3" (`render-r2-L/subtraction__sub_10k_no_regroup/error-analysis-p1.png`). The same happens at S (`contact-r2/ea-S.png`).
- **Present in r1:** `contact-r2/eaL-1m-r1.png`.
- **Cause:**
  - `error-analysis.js` writes the shown value "the same way as the right answer", with commas (`commas` / `likeAnswer`, around line 111): for example "284,123" or "1,473".
  - `cells/stack.js` `render()` passes `shown` straight into `stack({ans})`. That call fills the answer tracks with the last T characters of the string, comma included. "284,123" in 6 tracks prints "84,123", so every digit sits under the wrong place head and the leading digit is lost.
- **Fix:** in `stack.js`, strip separators from `shown` before filling the tracks (`String(shown).replace(/[,\s]/g, '')`), as the right answer already is.
- **Machine check:** `ws-node-lint` WRONG-FITS passed on these skills (precritic 3). Make it compare the drawn digit in each answer track with the wrong value's digit at that place.

**W1 · Worked example (scripted-model), all pilot skills: steps 1-3 show empty answer boxes on the pupil page and on the key.** C2 7.
- **Where:** `contact-r2/wp.png` (sub_50 key, top-left). Only step 4 shows the answer. The lesson p1 model gets this right.
- **Status:** r1 noted it and it is unchanged.
- **Fix:** in `roles/scripted-model.js`, give the stack the per-step state that `lesson.js` uses (answer digits up to that step).

**ST1 · Stretch at L (sub_2d_1d; sub_50, sub_100, sub_1k):** one task a page, with the bottom of the cell about 40 % empty under the table (H13, C3 6). See `render-r2-L/subtraction__sub_2d_1d/stretch-p1.png`.

**Also seen (C1 / C2 nits, outside the bar):**
- Review: the "Mixed Review" cells carry earlier regrouping items in the approved sub_100_regroup drawing (regroup boxes above, open answer line). That is the sibling's design, not a defect.
- True or False?: the sentence line prints "798358 − 453232 =" without the commas the stack prints.
- Reason It at L, 5-6 digits: still OVERFLOW (PG-12, as in r1).
- Pre-skill check p2 of sub_2d_1d carries a partner section (`nl_sub number_line_sub`) on a near-empty page (partner).

## r1-defect and change verification

| Item | Status | Evidence |
|---|---|---|
| A1 Model tab over the band's first line | **Fixed** | `contact-r2/band-crops.png`: on shade_fraction, money_count and place_value_10x at S and L, the band content starts under the tab; anchors.check E15 OK |
| S1 sub_1m 6-digit stack touching the frame at 390 | **Fixed** | `render-r2-S/subtraction__sub_1m_no_regroup/card-390.png`: about 10 px left of the rule, 12 px right of the focused box; ws-phone-card PASS |
| N1b sub_2d_1d "− 1" share and near-identical rows | **Fixed** | `probes-r2/n1b.json`: b = 1 on 10 / 120 = 8.3 %, ≤ 2 per page on all 10 seeds, 0 near-twin consecutive items. On the key page: 1 "− 1" in 20, answers within the cap |
| N6b "place" vocabulary picture wraps at L | **Fixed** | `render-r2-L/subtraction__sub_1m_no_regroup/lesson-p2.png`: "HTh TTh Th H T O" on one line over its dot |
| N9 preset screen chip | **Fixed** | sub_2d_1d card-390 chip reads its own name (wraps to two lines, fine) |
| M1 near-identical anchor models | **Fixed** (to nit level) | side sub_50: 23 − 11 / 32 − 11 / 34 − 22 / 40 − 10, no one-digit-apart pairs |
| Fact rows S 10 × 7 / M 6 × 5, key answers inside their cells | **Met** for 2- and 3-digit | sub_50 S 10 × 7 and M 6 × 5 keys: answers sit inside the cells, no OVERFLOW. But 4-digit S is F1 |
| Lesson Guided stacks top-aligned (CL-4b) | **Met** | lesson p2 at S / M / L on all 7; lint `--roles lesson` S / L 0 findings |
| No number-line options on the no-regroup ids | **Met** | `panel-r2/panel-text.txt`: no "Number line" control on any of the 7 (r1 had one on sub_50 / sub_100 / sub_1k / sub_2d_1d) |
| Fact-probe rows shared across pages | **Met** | the rows split evenly: 9/6/5 (sub_1k and sub_10k L), 6/6/4/4 (sub_100k / sub_1m L), 12/8 at S |
| Sections ex-group column choice (no H13 at L) | **Met** | anchors.check E16 OK; pilot sections pages at L have 3-4 columns; ws-print-lint kit L 0 findings on the pilot's own cells |
| CL-4b per section; add_100_mixed M items 3, 6, 11, 12 | **Met** | `render-r2-M/mixed100/addition__add_100_mixed/independent-p1.png`: every stack draws a regroup row and is centred, and the first inked row is level across each grid row (items 3 and 11 match their rows); anchors.check E17 OK |

## Partner-page list (lead ruling 19:35; not counted)

From precritic 3 (`coverage-matrix` / `sibling-compare` on 3caaf5d), the "ABOVE the siblings" counts:

| Row | Sizes | Finding |
|---|---|---|
| sub_50, sub_100, sub_2d_1d `sections/ex-each` | S / M | PG-23 |
| sub_50, sub_100, sub_2d_1d `sections/ex-group` | S | PAGEFILL |
| sub_50, sub_100, sub_2d_1d `sections/ex-group` | M | PG-23 |
| sub_10k `sections/ex-group` | L | PG-23 |
| sub_100k `sections/ex-each` | M | PAGEFILL |
| sub_1k / sub_10k `mixed/defaults` | S | H13 ×2–4, on perimeter_intro's cells |

All of these are page-level findings on the partner sections:
- tape_diagram (PG-12 "Answer:" overflow)
- perimeter_intro (WRAP-OP, H13, and the 2-problem last section)
- add_facts

I rendered one such set myself, sub_50 + add_facts + tape_diagram + perimeter_intro with sections examples (`render-r2-S/exgroup`, `render-r2-M/exgroup`, `contact-r2/exgS.png`):
- **The pilot's own section is sound:** the model band, then 4 problems in one row at S, top of box, nothing clipped.
- **The short last page is not a paginate defect.** The perimeter section (a model band plus 2 problems, about 54 % of a page) is kept whole. Page 2 has about 38 % left after the tape section, so the section starts a new page. I see no pagination bug in how the engine packs sections.

## Pages graded in full, and pages batch-read

**Graded in full** (every cell at full scale):
- **S:**
  - sub_50: independent, independent key, fact-rows key, lesson p1-p3, mixed practice, test key, card-390, quiz-1280.
  - sub_1k: fact rows.
  - sub_10k: fact rows (+ crop).
  - sub_1m: card-390, fact rows, lesson p2.
  - sub_2d_1d: independent key, card-390.
  - sub_50 side anchors.
  - add_100_mixed M.
  - Option panels for sub_1m and sub_2d_1d.
  - Level 3 sub_100k.
- **L:**
  - sub_1m lesson p2.
  - sub_10k review, error analysis.
  - sub_2d_1d stretch.

**Batch-read** (contact sheets in `contact-r2/`, each page at half scale, keys checked by arithmetic):
- S: every page of sub_50, sub_100 (lesson), sub_1k, sub_10k, sub_100k, sub_1m.
- L: sub_50, sub_1m, sub_10k (the rest), and lesson p2 of all 7.
- M: sub_50, sub_1m, sub_2d_1d independent / lesson / fact rows / test / mixed.
- Anchors side and sections for all 8 skills at S / M / L, and band-above at S / L.
- Options (zeros, shorter, level 0 / 3) at S and L.
- Error analysis at S / L for all 7.
- True / False, Reason It, guided, worked example, review and opener for sub_1m / sub_100k at S / L.

**Machine reads:**
- ws-print-lint kit:
  - S: 0 findings.
  - M: 0 findings.
  - L: 36 findings, all of them the ruled mixed-practice H13 class on sub_50 / sub_100 / sub_2d_1d.
- anchors.check: OK. The 351 known WARNs are E3 / E5 report-only, and the pilot ones are the same as in r1.
- The n1b probe, the pixel gap scans, and `meta.json` fits.

## Times

Start 2026-10-24T19:34:51Z, end 2026-10-24T21:31Z.
