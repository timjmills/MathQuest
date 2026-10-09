# Small fixes lane: independent critic, round 2

Branch `claude/sweet-newton-c8wrv1-wip-small-fixes`. App code is at `68ab08b`; the later commits `347d2ec` and `44d97a8` only add
audit files. The diff graded is `72e05d7..HEAD`. Chromebook sizes come first (1366x650 and 1280x600, mouse and touch). The phone at 390 got
a basic check only (STATUS §00). I ran one browser at a time. Evidence is in `r2/`.

**Probes I re-ran, all OK:** `small-fixes-countrow-caret`, `hint-popup-e2e` with check [17] (66 word skills x 2 viewports, MQ_BASE
static server), `small-fixes-equiv-frac`, `small-fixes-quiz-wordrow`, `small-fixes-xp-burst` and `small-fixes-no-start-toast`.

**My own checks.** Each one is a script in the critic's scratchpad:
- Count-by caret, adversarial. A slow typist (750–800 ms between keys), a fast typist (120 ms between keys, with pauses of 0 or 400 ms
  between numbers), a number too long or too short, comma or Space after each number, and the by-25 Lines row. Hosts: quiz, card and
  worksheet.
- The hint panel on 6 word skills (2 of them not `.mq-wwstory`) at both Chromebook sizes, opened and closed with the Hint button.
- Quiz word problems with real clicks and typing in every box. I changed the sign once, tapped a unit word, then pressed Next and
  Previous. Skills: add, sub, mult, div and multi_step.
- Print: `buildSheet` for opener and scripted-model × {default, onePage, Lines, onePage+Lines, by 25, by 25+onePage, by 25,000,
  by 25,000+onePage, by 100,000, by 100,000+Lines} × S/M/L × A4/Letter, which is 120 sheets. Each sheet was checked for ink leaving its
  cell, Model ink over the Steps zone, the smallest digit size, and the largest empty band in each cell. The same sweep ran on a `72e05d7`
  (main) checkout for comparison.
- An HTML hash of independent, more-practice, guided and test sheets, HEAD against main, for {default, onePage, Lines, by 25 onePage,
  25,000 onePage} × S/L. All 40 are **byte-identical**.

Two files in `r2/` are not evidence: `caret-ws-lines-by25-1280-*.png` came from a run where my probe read the wrong item's answers. A
corrected run on the worksheet gives `75|100|125|200|225` OK.

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity)

| # | Fix | Host / version | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Count-row hand-on (pause rule) | Quiz 1366/1280 | **6** | **6** | 8 | 8 | FAIL (N1, N2) |
| 1 | | Practice card 1366/1280 | **7** | **7** | 8 | 8 | FAIL (N1) |
| 1 | | Online worksheet 1366/1280 | **7** | **7** | 8 | 8 | FAIL (N1) |
| 1 | | Phone 390 swipe row (basic; probe) | 8 | – | 8 | – | ok |
| 2 | Word hint in flow under the story | Card, `.mq-wwstory` skills (add/sub/mult/div word) 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 2 | | Card, `unit_conversion_word`, `frac_word_problems(_plain)` 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 3 | Unknown-id "Simplify a/b" num/den boxes | Card 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 3 | | Worksheet 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 3 | | Quiz 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 4 | Quiz word rows: restore all working, partial rule, dots | Quiz 1366/1280 | 8 | 8 | 8 | 8 | pass (O1 out of lane) |
| 5 | +XP burst beside the score | Card / boss / race 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 6 | No start toast (incl. mixed-play toast) | Card / boss / race / worksheet | 9 | 8 | 9 | 8 | pass |
| 7 | Count row wraps in Model cell | Opener default / Lines / by 25 / 25,000 / 100,000, S/M/L, A4/Letter | 8 | 8 | 8 | 8 | pass (N5 nit) |
| 7 | | Opener + "All rows on one page" (1–12, by 25, by 25,000), S/M/L | 8 | 8 | **6** | 8 | FAIL (N4) |
| 7 | | Scripted model, default / by 25 / 25,000 / 100,000 (+Lines) at S/M/L | 8 | 8 | **4** | 8 | FAIL (N3, regression) |
| 7 | | Scripted model onePage, Lines (1 page as before) | 8 | 8 | **7** | 8 | FAIL (N3: text cells ≥ 67 % empty) |
| 7 | | Independent / more-practice / guided / test | 8 | 8 | 8 | 8 | pass (byte-identical to main) |

## Round 1 defects

| ID | Status | Evidence |
|---|---|---|
| D1 | **Not fixed. It changed form (see N1).** The hand-on still counts the digits of *the box's own answer* (`data-mq-full` = `String(v).replace(/\D/g,'').length`, count-row.js). R1's first requirement was "the hand-on count must not come from the box's own answer". A number typed in one go now stays in its box, and Space moves on. A slow typist still gets the R1 cascade. | quiz `caret-quiz-lines-by25-1366-boundary-wrong-slow.png` |
| D2 | Fixed. For `unit_conversion_word` and `frac_word_problems` the hint now sits inside `#questionText`, directly under the story, at cell width (325–1041 against 323–1043). Nothing sits under the sticky bar. The Hint button toggles it closed. | `hint-unit_conversion_word-1366x650.png`, `hint-frac_word_problems-1280x600.png` |
| D3 | Fixed. The boxes are 65 × 48 px with 28.8 px digits, the same size as the given fraction, on card, worksheet and quiz (also at 390). | `c3-quiz-1280x600.png` |
| D4 | Fixed. With real typing and clicks on add, sub, mult, div and multi_step word problems, every copy box, the sign (changed once), the unit word and the answer row come back after Next and Previous. | `quiz-back-*-1280x600.png` |
| D5 | Fixed for overflow: 0 ink outside its cell and 0 Model ink over Steps across 60 opener sheets. Main had 34–44 of each on every opener. The page layout is still not right (N4). | `c7-opener-onepage-M.png` |
| D6 | Fixed. `showMixedPlayToast` removes itself once a play view is up (probe OK). | – |

## New defects

**N1 · High · Fix 1: a slow typist's number that is too long splits, and every box after it shifts by one. The pause rule also shows the
answer's length.**
Repro: quiz at 1366x650, `multiplication:count_by_tables`, opts `{rows:[{step:25,start:'step',dir:'up'},], spaces:'line'}`, seed 11. The
blanks are 125, 200, 250, 275 and 300. Click the first line and type `1250 200 250 275 300`, with 750 ms between keys and 900 ms between
numbers. Result: `125 | 020 | 025 | 027 | 5300`, and all four later boxes are wrong (`r2/caret-quiz-lines-by25-1366-boundary-wrong-slow.png`).
Step 3 (`{rows:[{step:3,...}]}`, blanks 9/21/24/27/36) behaves the same: typing `12` slowly for 9 and then `21` gives `1 | 22 | 1`. On the
card and the worksheet I measured the same splits. Hunt-and-peck at 600 ms or more per key is the normal speed for this pupil group, so
the "pause = new number" rule fires *inside* a number.
The rule also leaks the answer's length, which fails RUBRIC C2. Type `1`, wait, then type `0`. If the answer has one digit, the `0` jumps
to the next box ("you are done"). If it has two, `10` stays. The reverse happens too: a slow `2` where 21 is due, followed by the next
number `24`, joins as `224`.
*What a fix must do:* the hand-on must not depend on the box's own answer. It must also never fire from a pause inside a number. Use an
explicit separator only, so Space, comma, Enter and Tab each move to the next box (today comma does nothing in the quiz, see N2). Show
that rule to the pupil, for example in the card's instruction or a one-time cue. Or base the hand-on on something every box shares that
the pupil can see. Extend the probe with slow typing (≥ 700 ms per key) of numbers that are too long and too short.

**N2 · Medium · Fix 1 (quiz): the original quiz bug still happens for a fluent pupil, and the extra digits are lost silently.**
Repro: the same quiz with step 3. Type `9`, `21` and `24` with 120 ms between keys and a pause of 0 or 400 ms between numbers. Box 1 reads
`9212` (maxlength 4) and the `4` is dropped. Comma as a separator (`9,21,24`) gives the same `9212`. Only Space works. On the card and the
worksheet the green owner rule hides this for right answers, but in the quiz nothing moves on. *What a fix must do:* comma and Enter move
on as Space does. A box must never silently drop a typed digit: either move on, or keep every digit and let the pupil see it.

**N3 · High · Fix 7 (new in round 2): the scripted model now wraps its count row into a half-width state cell. Sheets that were one page
on main now spill onto a second page holding one state, and Lines with big numbers runs to 4 pages.**
Repro: `buildSheet({role:'scripted-model', sections:[{skills:[{categoryId:'multiplication', skillId:'count_by_tables', opts:{}}]}],
size:'M', paper:'A4', seed:4242})`. Main is 1 page (`r2/c7-scripted-default-M-MAIN.png`). HEAD is 2 pages, and page 2 holds only
state 4 and the Say line, so about 70 % of the page is empty (H5, C3 ≤ 5) (`r2/c7-scripted-default-M-p1.png`, `-p2.png`).
Page counts on A4, HEAD against main:

| Sheet | Size | HEAD | main |
|---|---|---|---|
| default | M | 2 | 1 |
| by 25 | M | 2 | 1 |
| 25,000 | S | 2 | 1 |
| 25,000 | M | 2 | 1 |
| 100,000 | S | 2 | 1 |
| 100,000 + Lines | S | 2 | 1 |
| 100,000 + Lines | M | **4** | 1 |
| 100,000 + Lines | L | **4** | 2 |

On Letter, the default sheet at S and the by-25 sheet at S also go from 1 page to 2.
The 100,000 + Lines model puts one number per line, 12 lines in each state, one state per page (`r2/c7-scripted-100k-lines-M-4pages.png`).
The step-text half of every state cell is now 67–92 % empty (H13, C3 ≤ 6), including on the one-page sheets.
Round 1 recorded that the scripted model's Model cell was full width and needed no fix. The brief also said "other roles byte-identical
to main". *What a fix must do:* take the scripted model out of `WRAP_TO_CELL`, or wrap only when the result fits the page the way main
did. Never let a Lines row wrap to one number per line. Add a page-count check (HEAD ≤ main) to the render check for every role that
opts in.

**N4 · Medium · Fix 7: the opener with "All rows on one page" no longer overflows, but its Guided and Independent cells are mostly empty,
and the page's bottom third is blank.**
- **By 25 + onePage** (any size): the Guided and Independent cells are 193 px high around a 45 px row, and each empty band is 39 % of the
  cell height (H13, C3 ≤ 6). Only 1 Independent row fits (`r2/c7-opener-by25-onepage-L.png`).
- **By 25,000 + onePage:** 0 Independent rows. The Guided cell has a 30 % band, and the lowest quarter of the page is blank
  (`r2/c7-opener-25000-onepage-L.png`).
- **1–12 + onePage:** content ends at 65 % of the frame, so the lowest third is empty (`r2/c7-opener-onepage-M.png`). S, M and L render
  byte-identically, which matches the one-page Independent sheet, so that part is pre-existing.

The cause is that the rows are sized at the measured compact height (42.5 mm at 1 column for by 25, against a drawn row of about 12 mm).
That measurement is the same on main, but this lane is what makes the version printable, so the version is graded here. *What a fix must
do:* size a one-page row's cell to its drawn height. Then let the opener add Independent rows, or grow the cells within the
`grow` limit, until the page is full.

**N5 · Low (does not fail) · Fix 7: in the half-width Model cell, a 25,000 or 100,000 row wraps to lines of 2 *and* shrinks to about
10 pt at Size L.** An example is the opener at L with step 25,000 (6 lines of 2, digits about 10 pt, beside 14 pt Steps text). It is
above the 9 pt floor and matches the full-line rows on the page (TY-10a), so it passes. Lines of 2 leave room for about 14 pt digits,
so wrap before shrinking.

**N6 · Low (does not fail) · Fix 2: the inline hint's Listen button is a 🔊 emoji inside the B&W question cell.** It shows grey on
screen. Use the app's monochrome speaker glyph there.

**O1 · Out of lane (pre-existing in `word-work-screen.js`, untouched by the diff):** in the QUIZ, a tapped sign or unit word that is
right turns green (`paint()`), and so does a working box holding its right digit. This tells the pupil the answer during a test. The
restore in fix 4 calls `.click()` again and reapplies the green. It should go to a separate lane: no live marks when `quizMode`.

## Verdict

**FAIL.** Fixes 2, 3, 4, 5 and 6 pass, and D2, D3, D4 and D6 are fixed. Fix 1 still fails (N1 High and N2: D1 is not really fixed for
slow or fluent typists). Fix 7 fixed D5's overflow but leaves the one-page opener under-filled (N4). Round 2 also brought in a
scripted-model regression (N3 High: 1-page sheets now 2–4 pages).
