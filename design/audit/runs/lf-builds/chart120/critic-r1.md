# chart_120 — independent critic, round 1

- **Code:** branch `claude/sweet-newton-c8wrv1-lf-builds` at `8be64d093` (not merged, not changed).
- **Scope:** signed card `design/cards/chartwindow/chartwindow.md` §7a. In scope: `composing:hundreds_chart_fill` with the new `band=120`, including `grid=window|rows|whole` where offered, and the preset `composing:chart_to_120`; the existing band values were checked for regressions.
  - Roles offered (13): independent, more-practice, test, lesson, scripted-model, guided, opener, error-analysis, review, pre-skill-check, mixed-practice, true-false, reason-it.
  - Hosts: practice card, online worksheet, quiz.
  - Print sizes M and L (S dropped). Screens 1366 / 1280 / 1024 / 820 (no 390).
- **Renders:** `tests/scripts/ws-grade-render.cjs` run through `mq-browser-run.sh`, one at a time:
  - every offered role at M and L, with keys, for `chart_to_120`;
  - `hundreds_chart_fill {band:120}` with `grid=whole` at M and L, `grid=rows` (default, and `gaps=row tiles=7`), and roles falling back on lesson, guided and test;
  - band 100 (independent, test, lesson, guided, reason-it, true-false, error-analysis, scripted-model, opener), band 10, band 100 whole, and `number_chart_fill`;
  - card at 1366 and 820, worksheet and quiz at 1280 / 1024 / 820.
  - Master `b9414a659` was rendered with the same tool (band 100, L: reason-it, true-false, error-analysis, lesson) for the regression check.
  - Evidence PNGs are in `critic-r1/`. The 100 seeded items are in `critic-r1/read40-items.txt`.

## Verdict: **FAIL**

The band-120 drawing itself is good, on paper and on screen:
- every window crosses 100, the three-digit squares are legible, and the whole chart is 12 rows on one page;
- the I Can follows the band, and the screen hosts are clean.

The skill fails on its **thinking and teaching pages**. Some of the failures come from the provider (`k2.js`), so they hit band 120 and band 100 alike:
- **True or False?** never deals a False statement.
- **Error analysis** can be answered by counting the empty squares.
- The **worked steps and Say line** cover only the first empty square, and the Say line is ungrammatical.
- The lesson's **Steps strip** walks through a different item.
- **grid=rows at band 120** gives the answers away from one item to the next.
- **Score /N** counts empty squares on some roles and windows on others.

## Seeded item read (40 band-120 items × 2 skills, plus 20 band-100 controls)

| Check | Result |
|---|---|
| Crosses 100 | **40/40** (preset) and **40/40** (`{band:120}`). Every window sits in rows 91-120. |
| Crossing squares 100 / 101 / 110 / 111 dealt | 15/40 (card asks for at least 1 in 3) — **OK** |
| Gaps | 1 / 2 / 3 empty squares in 10 / 20 / 10 items. Every gap has a printed neighbour. No two scattered gaps side by side — **OK** |
| Answer variety (L10) | 37 distinct answers out of 40. Window start dealt from 91 to 96 — **OK** |
| Given away (L3) | No answer appears in the visual or in an aria label; **OK on the window**. **FAIL on grid=rows (F4)** and band 10 (F9). |
| I Can | "I Can find missing numbers on a chart to 120" on every band-120 page. "Test A: finding missing numbers on a chart to 120" and "Review: finding …" read correctly — **OK** |
| Misconception text | `writes-ten-ten` appears only as text: Reason It ("The missing numbers are 1003, 111, 115." / "The missing number is 1016.") and screen `distractorTags`. It is never in a chart square — **OK**. The "as it is said" form is wrong for 100 and 111–120 (**F8**). |
| `wrongAnswer` | **null on 30 of 40 items** — every item with 2 or 3 empty squares (`num("107, 119")` is NaN). This is the root cause of **F1** and **F2**. |
| `workedSteps` | On every multi-gap item the steps end "Write <first gap>." The second and third gaps never get a step (**F3**). |

## Scores (C1 ease · C2 teaching · C3 spacing · C4 standard)

M and L scored the same unless noted. "OOS" marks the lead-routed items the brief lists; they are listed but not scored. The `chart_to_120` and `hundreds_chart_fill {band:120}` pages are the same drawing and the same deal.

| Version | M | L | Pass | Findings |
|---|---|---|---|---|
| independent (window) + key | 9·9·8·9 | 9·9·8·9 | yes | (n1) |
| more-practice + key | 9·9·8·9 | 9·9·8·9 | yes | |
| test + key | 9·8·8·9 | 9·8·8·9 | yes | |
| independent / more-practice, grid=whole (12 rows) | 9·9·8·9 | 9·9·8·9 | yes | |
| independent / more-practice, grid=rows | 8·**5**·8·9 | 8·**5**·8·9 | **no** | F4 |
| lesson (fallback, 3 pp) | 8·**7**·8 (OOS bands)·**6** | 8·**7**·8·**6** | **no** | F3, F5, F7 |
| scripted-model | 8·**7**·8·**6** | 8·**7**·8·**6** | **no** | F3 |
| guided | 8·**7**·8 (OOS try band)·8 | 8·**7**·8·8 | **no** | F3b, n2 |
| opener | **7**·8·8·8 | **7**·8·8·8 | **no** | F6 |
| error-analysis + key | 8·**6**·8·8 | 8·**6**·8·8 | **no** | F2 |
| review | **7**·9·8·9 | **7**·9·8·9 | **no** | F6 |
| pre-skill-check | **7**·8·OOS·8 | **7**·8·OOS·8 | **no** | F6 (page fill OOS) |
| mixed-practice | **7**·9·8·9 | **7**·9·8·9 | **no** | F6 |
| true-false + key | **6**·**4**·**7**·**7** | **6**·**4**·**7**·**7** | **no** | F1 |
| reason-it + key (text form) | 8·8·8·8 | 8·8·8·8 | yes | F8 (minor), n3 |
| practice card 1366 / 1280 / 1024 / 820 | 9·8·9·9 | — | yes | |
| online worksheet 1280 / 1024 / 820 | 8·8·8·9 | — | yes | n4 |
| quiz 1280 / 1024 / 820 | 9·8·9·9 | — | yes | |
| *Regression, band 100 / 10 / ncf* | no regression against master b9414a659 | | — | F9 and F10 are pre-existing, filed on the skill (RC2) |

What raises C3 on the passing print pages to 9 or 10 is n1: the window sits centred in a cell with about 15 % white above and below it.

## Findings

Each finding gives its severity, the rules it breaks, the evidence and a proposed machine check.

### F1 — True or False? never deals a False (critical)

- **Rules:** PT-TOF-1 (40–60 % false), L10, C2; C1 for the unstated claim.
- **Evidence:**
  - The M and L pages both show 4 of 4 True (`c120-true-false-key-M.png`, `c120-true-false-key-L.png`). Band 100 does the same (all True on master and on the branch).
  - Root cause: `k2.js` `wrongAnswer` calls `num(q.ans)`, which returns NaN for "91, 101", so it returns null for every multi-gap item (30 of 40 dealt). Only single-gap items can ever be False.
  - The cell states no claim. It is a chart with bold numbers, under "Check one box: True or False. Finish the sentence." A True item has nothing to finish.
  - The frames differ between cells of one section ("Answer: __, __." beside "The answer is __.").
  - About 22 % white sits both between the chart and the check row and between the check row and the frame.
- **Fix:** build the wrong answer per slot (L27): apply `wrong-row` or `one-less` to ONE gap of `q.keyParts` and keep the others. The provider and role then deal False on multi-gap items.
- **Check:** `ws-providers-unit` WRONG-MULTI. For every chartwindow item with 2 or more gaps, `wrongAnswer(q)` is non-null and differs from the right answer in exactly one part. The same check on a true-false page over seeds 1–20 requires 40–60 % False (the PT-TOF-1 ratio, measured on the built page).

### F2 — Error analysis can be answered by counting the squares (major)

- **Rules:** L10, C2.
- **Evidence:** `c120-error-analysis-key-M.png`. Items 1 and 3 (2 gaps) are "Correct"; items 2 and 4 (1 gap) are "Fix it". F1's root cause makes every multi-gap window correct by construction, so a pupil can answer by counting squares. Band 100 shows the same pattern.
- **Fix:** the same as F1.
- **Check:** EA-PATTERN. Over 20 seeds, the judgement (Correct or Fix it) must not be predictable from the number of gaps: both outcomes must appear for multi-gap items.

### F3 — Worked steps and Say cover only the first gap; the Say line does not parse (major; H17 on C4)

- **Rules:** L6, VQ-9 / H17, PEDAGOGY Say band.
- **Evidence:**
  - Scripted model (`c120-scripted-model-M.png`): 4 steps lead to "Write 101." while 101 AND 104 are traced, and the Say line reads **"The missing number is 101, 104."**
  - Lesson anchor (`c120-lesson-p1-M.png`): the steps lead to "Write 110." while 110 and 120 are traced, and Say reads "The missing number is 110, 120."
  - The item read confirms it: on all 30 multi-gap items the last step is "Write <first gap>."
  - Band 100 shows the same ("The missing number is 52, 64, 76.").
- **Fix:**
  - `chartSteps` should either work every gap (one short pass per gap, ending with a single "Write …" for each) or pick a single-gap item as the model.
  - The Say line should take its number from the answer: "The missing numbers are 101 and 104." or "The missing number is 101.".
- **Check:** `ws-providers-unit` STEPS-ALL-SLOTS: every key part is named in a step. SAY-AGREE: the Say frame filled with `q.ans` uses "numbers are" when the answer has more than one part. The second check fails today on both bands.

### F3b — Guided Model's grey hints explain only the first traced answer (minor → C2 7)

- **Evidence:** `c120-guided-M.png`. The Model traces 100, 107 and 117; the hint lines explain only 100.
- **Fix and check:** as F3. Alternatively, the guided Model deals a single-gap item (`pickExample`, gaps = 1).

### F4 — grid=rows at band 120 gives the answers away from item to item (major)

- **Rules:** L3, C2 "items vary sensibly", "nothing gives the answer away".
- **Evidence:** `hcf120-rows-independent-M.png`.
  - Band 120 has exactly one rows window (91–120, all ten columns), so all 3 items show the same 30 numbers with different gaps.
  - Item 1 asks for 92 and 99; item 2 prints both. Item 2 asks for 94; items 1 and 3 print it.
  - With `gaps=row tiles=7` the three items are nearly identical (63 answers, copied row to row).
  - At band 100, rows windows vary over rows 0–9, so this is new with band 120.
- **Fix:** at band 120 with grid=rows, deal one item a page (one cell, sized like the whole chart), or deal gaps so no item's answer is printed in another item on the page.
- **Check:** CROSS-GIVEAWAY in `ws-cell-checks --card-opts`. On every page, no item's key value may be printed (not blank) in another item's cell. Run it for every band × grid value.

### F5 — Lesson Steps strip walks a different item (major)

- **Rules:** L6, C2.
- **Evidence:**
  - `c120-lesson-p2-M.png`: beside the Guided Practice window (gaps 104 and 106) the Steps read "The number before is 109 … Write 110." There is no 109 or 110 on that window.
  - `c120-lesson-p3-M.png` shows the same strip above windows 91–119.
  - With grid=whole falling back: "The number before is 92 … Write 93.", while the anchor item is not on that page.
  - Band 100 shows the same ("Write 25." beside windows with no 25 gap).
- **Fix:** on practice pages the strip uses the provider's generic `strings.steps` ("Look left: the number before. Add 1. …", as the guided page already does). Item steps belong only beside their own item.
- **Check:** STRIP-NUMBERS. Every number in a step strip or Steps panel must be printed in, or be a key value of, the cell it stands beside or above (an extension of the L6 providers-unit check to the lesson role).

### F6 — Score /N counts squares on some roles and windows on others (major on C1)

- **Rules:** AK-4, SCORE-SLOTS (n5), C1.
- **Evidence:**
  - Independent, more-practice and test count empty squares (/13). The guided page reads /6.
  - Opener reads **/2** with 4 squares to write (`c120-opener-M.png`).
  - Review reads **/6** for 9 squares plus 2 warm-ups (`c120-review-M.png`).
  - Mixed practice reads **/6** for 13 squares (`c120-mixed-M.png`).
  - The pre-skill-check section scores read `__/2` over windows of 2 and 3 squares.
  - Lesson p2 reads /4.
  - A teacher marking by answers gets a different total from the header.
- **Fix:** every role that sums the Score reads the footprint `points` / `slotPoints` (`paginate.js scorePoints`): opener, review, mixed-practice, pre-skill-check section scores, and the lesson practice pages.
- **Check:** SCORE-EQ-SLOTS in `ws-roles-unit`. For every role page of a `slotPoints` template, the Score /N equals the count of graded key answers on the page (pupil-writable slots).

### F7 — Lesson anchor (cell content only; the anchor page layout is OOS, lf-engine)

The anchor's text has the same defects as F3, which is the C4 cap on lesson. Nothing else is scored.

### F8 — The `writes-ten-ten` form is "as it is said" only for 101–110 (minor)

- **Rules:** P-TH-13 (a misconception page shows the real error), C2.
- **Evidence:**
  - `tenTen(t) = 10 + (t-100 as 2 digits)` gives 100 → 1000, 113 → 1013 and 116 → 1016.
  - Spoken "one hundred sixteen" written as said is 10016, not 1016, and "one hundred" is not written 1000 by this error.
  - On the page: Reason It M shows "The missing number is 1016." (`c120-reason-it-key-M.png`).
  - The provider's explanation text reads "Wrote 116 as it is said, 1016".
  - The card signed the 110 → 1010 example, so the owner should confirm the rule.
- **Proposed rule:** the text form is 100 followed by the spoken part: 101–109 → 1001–1009, and 111–119 → 10011–10019 or not dealt.
- **Check:** MISC-AS-SAID. A fixture table of the said forms against `tenTen` for 100–120.

### F9 — Band 10 deals duplicate rows and gives answers away (pre-existing, not a regression; major)

- **Evidence:** `hcf10-independent-L.png`. Items 1 and 3 are identical (gaps 3 and 7). Every item is the same row 1–10, so item 2 prints item 1's 3.
- **Fix and check:** CROSS-GIVEAWAY and the dupKey from F4 cover this.

### F10 — Band 100 Reason It at L squeezes the chart (pre-existing; identical on master b9414a659)

- **Evidence:** `hcf100-reason-it-L.png`. The A and B windows have 10.4 mm squares at L with 22.4 pt digits, about 1 mm clear: "1617181920" runs together. The scores are C1 7 and C3 6, filed on band 100.
- **Fix:** the chart window states its width when the cell is narrower than `cols × cellW` (the same `wide` rule this lane added for band 120, extended to band 100 in the drawn A|B form).
- **Check:** `ws-cell-checks` DIGIT-CLEAR. Measured on raster: digit ink at least 1.5 mm from its square's border on every role page.

### Notes (nits, no score below 8 on their own)

- **n1.** The print window is centred in its cell with about 15 % white above and below. The card says 18 mm squares at L; the code clamps them to 17 mm (measured 16.9 mm, with 3.5 mm digit clearance). Update the card §3 text.
- **n2.** The guided Steps panel at M breaks "Add 1." as "Add / 1." and "Add 10." as "Add / 10.". Keep the number with its verb (a non-breaking space).
- **n3.** Reason It text form leaves the window's empty squares bordered as writing places, but they are not graded. A pupil may write in them.
- **n4.** At 1280 the online worksheet draws a 300 px window in a 1070 px bordered cell, about 36 % white each side. It is legible: digits about 30 px, squares about 60 × 55 px, at least 48 px.
- **Screens:**
  - digit clearance measured 7–19 px at every width;
  - no horizontal scroll;
  - answer boxes ≥ 48 px at 820 and 1024;
  - the card and quiz are the same drawing as print.
  - The card naming 1010 when typed was not driven by hand; ws-text-misconception REACH-SCREEN covers it.

## Out of scope (lead ruling; listed, not scored)

- EB-BAND lesson p1 anchor panels 1, 2 and 4 (30–35 %), and the lesson L p2 centred window — lf-engine.
- Guided try beside the Model at 32–33 %, pre-skill-check p1 42–55 % empty, and EB-GDPCAP guided L with 7 answers over a ceiling of 6 — lf-roles. Pre-skill-check pages 1 and 2 were seen half empty, as listed.
- sibling-compare (NO-SIBLING).

## What would make it pass

1. Per-slot `wrongAnswer` for multi-gap windows (fixes F1 and F2).
2. Steps that work every gap, plus a Say line that agrees in number (F3, F3b, F7).
3. Generic steps on the lesson practice strip (F5).
4. One Score rule for every role (F6).
5. No cross-item giveaway for grid=rows at band 120 (F4).

Then a re-grade of true-false, error-analysis, scripted-model, guided, lesson, opener, review, mixed-practice, pre-skill-check and grid=rows at M and L. F9 and F10 are pre-existing debts on band 10 and band 100 of the same skill, so they are filed here too.
