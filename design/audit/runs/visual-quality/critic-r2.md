# Visual-quality lane: independent critic, round 2

Critic: Opus 5.5, medium effort (critic profile). I did not build this work.
Branch `claude/sweet-newton-c8wrv1-visual-quality` at `7ca0609` (merged with the base). Date 2026-10-31.

**Verdict: FAIL.** The lowest score is **4**: C1 on the `fact_family_sort` lesson with `familyChart` on, at S and at L.
The step titles run off the right edge of the page, and the chart boxes cover the Steps panel. The render gate is red
there: 14 overflow findings at S and 18 at L. Three findings block:
1. N1: that lesson overflow.
2. N2: an H13 band of 30.4 % on the `add_wp_10` lesson p3 at L.
3. N3: the keyword options `wpCues` / `wpBank`. They are still offered, and on these skills they teach the keyword
   strategy with bank words the stories never say (H15).

All eleven blocking r1 findings are fixed on the default pages. The practice pages, tests and screen hosts score 8 or
better everywhere.

Outside the pass bar, one severe defect needs fixing before merge: N4. The sentence layout ignores the value the
True-or-False and Reason-It roles want shown, so their keys are wrong (H1).

## How I graded

- Renders (one browser run at a time; `R/` below means
  `/tmp/claude-0/-home-user-MathQuest/cea1479a-7e02-5121-b21e-92a04002c02f/scratchpad/critic2/`):
  - Base run: `ws-grade-render.cjs --skills addition:fact_family_sort,addition:add_wp_20_plain,subtraction:sub_wp_20,addition:add_wp_10`
    with `--roles independent,more-practice,guided,scripted-model,error-analysis,review,test,true-false,reason-it,stretch,lesson`
    and `--gate`, at `--size S`, `L` and `M`, into `R/S`, `R/L` and `R/M`. All three are `ws-grade-render: OK`.
  - Family chart: `--opts '{"familyChart":true}'` on `fact_family_sort` (independent, more-practice, test, lesson,
    guided) at S and L, into `R/chart-S` and `R/chart-L`. **FAIL** at both sizes.
  - Bar: `--opts '{"wpBar":true,"support":["bar"]}'` on `add_wp_20_plain` and `sub_wp_20` (independent, test, lesson)
    at S and L, into `R/bar-S` and `R/bar-L`. OK.
  - Side worked examples: `--anchors side --size L` (independent), into `R/anchorsL`. OK.
  - Keyword options: `--opts '{"wpCues":true,"wpBank":true}'` on `add_wp_20_plain` independent at S, into `R/cues-S`.
    OK on the gate, but see N3.
- Screen hosts: card-390, card-820, card-1280, worksheet-1280 and quiz-1280 from the same runs. `smallTargets` is 0 on
  every host, `hScroll` is 0, and there are no console errors.
- Measurements:
  - Empty bands come from a pixel scan of each grid cell (the r1 `tools/bands.py`): the largest band with no ink, as a
    share of the cell height.
  - Item counts come from `meta.json` `fits`. Duplicate triples are checked from `meta.json` items.
  - Keys were checked by hand on every key page I opened (listed below).
- Scope (RUBRIC scope note, 2026-09-26): the pass bar is independent, more-practice, test, the lesson (S and L, M spot),
  and the five screen hosts.
  - Guided, scripted model, review, true-false, reason-it and stretch are graded as advisory. Their findings are filed,
    but they do not set the verdict.
  - Error analysis is out of scope.
  - The options offered on the spec card are graded like any other page (card §7a): `familyChart`, `wpBar`/`support`,
    `wpCues` and `wpBank`.

Keys verified item by item:
- `sub_wp_20`: S independent (11 of 11), L independent (8), bar S (6).
- `add_wp_10`: S independent (7).
- `fact_family_sort`: S independent (12), chart S (4), lesson-key p2 (vocabulary and warm-up).
- `add_wp_20_plain`: S error-analysis (6).
- The true-false and reason-it keys (S and L) are wrong. See N4.

## r1 findings re-checked

| r1 | Status | Evidence (round 2) |
|---|---|---|
| F1 H13 bands 31-40 % | **Fixed** | Largest in-cell band on the practice pages: S 24.7 % (story test), 20.8 % (fact family), 18.5 % (`add_wp_10`); M 23.7 %; L 25.5 % (`add_wp_10` independent). Lesson p2/p3 practice cells are at most 26.7 %, except at L (N2) |
| F2 Size S ignored | **Fixed** | Items at S/M/L: stories within 20 (independent) 11/8/8, (test) 10/8/8; `fact_family_sort` 12/9/6; `add_wp_10` 7/6/4, test 7/6/5. S is above L everywhere |
| F3 41 px phone input | **Fixed** | `smallTargets` is 0 on card-390 and card-820 for all four skills and with the bar and the chart. `answer-area.js` twin face is `max(48px, …)` |
| F4 lesson overflow | **Fixed (default)** | Lesson `check.problems` is empty at S, M and L. It reopens with `familyChart` on (N1) |
| F5 singular unit leak | **Fixed** | `R/S/subtraction__sub_wp_20/independent-p1.png` item 1 prints "stamps" under the empty box. Residual nit: the key reads "1 stamps" (N7) |
| F6 keyword strategy, frames | **Fixed** | `R/S/subtraction__sub_wp_20/lesson-p1.png`: 1 Read, 2 "Find the parts and the whole" ("I know the whole, 16, and one part, 14. I subtract."), 3 the sentence, 4 solve. Each frame writes what its step says. Rule: "Whole − part = part." No "key word" anywhere; the ▶ is gone; the vocabulary matches whole / part / number sentence |
| F7 rings on letters | **Fixed** | The rings in lesson-p1 story lines clear the neighbouring letters |
| F8 fact family vocabulary | **Fixed** | `R/S/addition__fact_family_sort/lesson-key-p2.png`: "8, 4, 12" → fact family, "8 and 4" → parts, "12 at the top" → whole. The rule reads "Two parts make the whole." |
| F9 duplicate triple | **Fixed** | 0 duplicate sorted triples on independent, more-practice and test at S, M and L (`meta.json` items) |
| F10 crowding on the slant | **Fixed** | `quiz-1280.png` "10" sits about 8 px from the side; S cells are clear |
| F11 sign undersized | **Fixed** | Sign glyph at 1.2 × `digitPt`; the "−" and "+" now read at digit weight in `independent-key-p1.png` |
| F12 schema by position | **Fixed** | One schema a page: `add_wp_20_plain` independent all "gets more" and test all "in all"; `sub_wp_20` independent all "gives"; lesson p3 all "takes … out" |
| F13 no bar | **Fixed (per lead's interim ruling)** | The bar is drawn on the lesson chart, guided and scripted model. On practice pages it is the `wpBar` / `support: bar` option, which `_plain` now has. WDS §18.1 is edited to match |
| F14 scripted model frames / lone page | **Half fixed** | The frames now fill step by step. But `R/M/addition__add_wp_20_plain/scripted-model-p1.png` and `-p2.png` are two half pages (body used about 60 % and 58 %) where the four 225 px frames fit on one (N6, advisory) |
| F15 card verb | **Fixed** | card-390: "Do the small numbers make the big number? Tap yes or no." |
| F16 screen digit size | Not verified | The renderer still types no value; carried as a speed-up |
| F17 bar leak, tabular digits | **Fixed** | Subtraction parts are drawn equal (`R/bar-S/subtraction__sub_wp_20/independent-key-p1.png`); `NUM_FEATURES` is used |
| F18 stretch not a story | **Not fixed** (advisory) | `R/S/addition__add_wp_20_plain/stretch-key-p1.png`: "Two numbers add to 18. Find different pairs." |
| F19 frame drift in a row | Fixed / not seen | M is one column; the L rows I opened align (`R/L/subtraction__sub_wp_20/independent-key-p1.png`, frames at y 290 / 290) |
| F20 model Say omits the decision | **Not fixed** (advisory) | `R/M/addition__fact_family_sort/scripted-model-key-p1.png`: "Say: 10 and 1 make 11." |
| F21 anchors at L, 1 story | **Fixed** | `R/anchorsL/*/independent-p1.png`: the model plus 4 stories, body 74 % used. Residual: 59 mm blank at the foot, where a 56 mm row would just fit (N11, non-blocking) |

## Score tables (C1 use · C2 teaching · C3 spacing · C4 standard)

Any score below 8 is in **bold**. M is a spot check, and the lesson prints its p1 identically at every size.

### A. `addition:fact_family_sort`, template `family-check`

| Version | S | M (spot) | L | Notes |
|---|---|---|---|---|
| independent | 8·9·8·8 | 8·9·8·8 | 8·9·8·8 | 12 / 9 / 6 items; bands 20.8 / 18.6 / 17.9 %; keys right; 6 yes / 6 no at S |
| more-practice | 8·9·8·8 | 8·9·8·8 | 8·9·8·8 | as independent; no duplicates |
| test | 8·9·8·8 | 8·9·8·8 | 8·9·8·8 | 12 / 9 / 6; no duplicates |
| lesson (3 pp + key) | 8·8·8·8 | (= S) | 8·8·8·8 | F8 fixed. Nits: frames 1-2 of p1 draw the same triangle with nothing marked (N9); key-p2 warm-up 35 % below the written answer (writing room, CL-4b) |
| **familyChart on**: independent / more-practice / test | 8·8·8·8 | — | 8·8·8·8 | S 4 a page (2 × 2, chart under the triangle), L 3 (chart beside); bands 7.9 / 8.8 %; chart keyed only for a true family; Yes / No stays the one graded slot |
| **familyChart on**: lesson | **4**·**6**·**3**·**5** | — | **4**·**6**·**3**·**5** | **N1**: overflow, gate FAIL |
| **familyChart on**: guided (adv.) | 8·8·**6**·8 | — | | 51.9 % band (H13) |
| card-390 / 820 / 1280 | 8·8·8·8 | | | F15 fixed. With the chart: the phone order (triangle, Yes / No, chart) differs from S paper (triangle, chart, Yes / No), and the focus lands first on an ungraded chart box (N8, nit) |
| worksheet-1280 / quiz-1280 | 8·8·8·8 | | | |
| scripted model (adv.) | 8·**7**·8·8 | | | F20 not fixed |
| guided (adv.) | 8·8·**6**·8 | | | bands up to 62 % (cells sized for the Steps column) |

### B. Story skills, word-work `layout: 'sentence'`

| Version | `add_wp_20_plain` S / M / L | `sub_wp_20` S / M / L | `add_wp_10` S / M / L |
|---|---|---|---|
| independent | 8·8·8·8 ×3 | 8·8·8·8 ×3 | 8·8·8·8 ×3 |
| more-practice | 8·8·8·8 ×3 | 8·8·8·8 ×3 | 8·8·8·8 ×3 |
| test | 8·8·8·8 ×3 | 8·8·8·8 ×3 | 8·8·8·8 ×3 |
| lesson | 8·8·8·8 / (= S) / 8·8·8·8 | 8·8·8·8 / (= S) / 8·8·8·8 | 8·8·8·8 / 8·8·8·8 / 8·8·**6**·8 (**N2**) |
| bar option (`wpBar` / `support: bar`), independent / test / lesson | 8·8·8·8 (S 6, L 4; bands 16.5 / 10.4 %) | 8·8·8·8 (parts equal, keys 6/6) | not rendered (the K picture skill keeps its counting picture) |
| **`wpCues` + `wpBank` (offered)** | **7**·**6**·**6**·8 (**N3**) | same code path | same code path |
| anchors side, L | 8·8·8·8 (4 stories; N11) | 8·8·8·8 | — |
| card-390 / 820 / 1280, worksheet, quiz | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 |
| guided (adv.) | 8·8·**6**·8 (40-45 % bands, N5) | 8·8·**6**·8 | 8·8·**6**·8 |
| scripted model (adv.) | 8·8·**6**·8 at M (N6) | 8·8·**6**·8 | 8·8·**6**·8 |
| true-false (adv.) | 8·**3**·8·8 (**N4**, H1) | 8·**3**·8·8 | not opened |
| reason-it (adv.) | — | **5**·**3**·**6**·**6** (N4: A = B, the frame crosses the panel) | — |
| stretch (adv.) | 8·**5**·8·8 (F18) | — | — |

Notes on B:
- All four keys I verified are right.
- The circle is a real + / − decision on a one-operation page, so it is accepted (r1 Q2).
- Story text is 11 pt at S and 15 pt at L, as WDS 4 requires.
- The lesson warm-up on the `sub_wp_20` p2 deals 17 − 9 and 20 − 12 as vertical stacks for Grade 1 (N10, nit).

### C. Graphic-library entries

| Entry | C1 | C2 | C3 | C4 | Notes |
|---|---|---|---|---|---|
| `factTriangle` | 8 | 8 | 8 | 8 | Numbers placed from their width with at least 2 mm to the slant (F10 fixed) |
| `answerArea` | 8 | 8 | 8 | 8 | Twin face 48 px (H6 cleared); plural unit on the pupil page and on screen |
| `sentenceFrame` | 8 | **3** | 8 | 8 | Sign at 1.2 × digit. **N4**: it never draws a value the role passes in (`o.shown`), so True-or-False and Reason-It cannot show a wrong claim |
| `partWholeBar` | 8 | 8 | 8 | 8 | Equal parts when a part is unknown; proportional digits; per-slot ids for the chart frames |
| `familyChart` (new) | 8 | 8 | 8 | 8 | 0.75 pt working boxes, lighter than the answer slot (VQ-6); `data-ws-graded="0"`, no `data-mq-expect` on screen. On the practice pages it is fine; the lesson layout fails (N1) |

`sentenceFrame` C2 3 is the H1 cap on the advisory roles. The entry is right on every pass-bar page.

## New findings

Severity: **blocking** means a pass-bar version (or an offered option on one) is below 8.

**N1 · blocking · `familyChart` on: the lesson overflows the page (class OVERFLOW, rule_ids L-OVERFLOW, H2, PG-12)**
- Where:
  - `R/chart-S/addition__fact_family_sort/lesson-p1.png` and `lesson-key-p1.png`, at S and identically at L.
  - `R/chart-L/addition__fact_family_sort/lesson-p2.png`, cell 5.
- Evidence:
  - The gate prints `FAIL - 14 finding(s)` at S and `18` at L, including "page 1: content overflows the sheet".
  - On p1, the chart is added beside each triangle, and the step column shrinks to about 110 px. "Find the big
    number.", "Add the small numbers" and "The same? Circle yes. Not? Circle no." run past the page's right border
    (x > 746). The Say band is covered, so the "Say:" line is unreadable.
  - On L p2, the guided chart's third column of boxes lies over the Steps panel's icons and its rule text
    ("…parts make the whole").
  - The packet grows to 4 pages.
- Caps: H2 (clipped and overlapped text) gives C1 ≤ 4; overflow gives C3 ≤ 3.
- Fix:
  - With the chart on, the lesson model frames put the chart UNDER the triangle (the S practice placement) or leave it
    off the model (card §9 T-9.3 is still open: rule it).
  - The guided cell takes the full-width row it uses on L practice pages.
- Check: `ws-grade-render --gate` must run with every offered support option (`--opts` per option), not only the
  defaults. See the automatic checks.

**N2 · blocking · H13 band on the `add_wp_10` lesson practice page at L (class SPACE, rule_ids H13, H13-ROW)**
- Where: `R/L/addition__add_wp_10/lesson-p3.png`.
- Evidence:
  - 4 stories in 2 × 2 cells of 392 px (104 mm).
  - Cells 1, 2 and 4 leave a band of 30.4 % (119 px, 31 mm) under the answer: the row is sized for item 3's 7-apple
    picture.
  - The cells are answered in place, so the band is not writing room. M (26.7 %) and S pass.
- Caps: C3 ≤ 6.
- Fix: size each row to its own tallest item, or let item 3's picture keep its groups on one line (as on the
  independent page).
- Also on that page (C2 nit): the 7-apple group wraps 5 / 2 above the second group of 2, so the page shows three
  rows (5, 2, 2) separated only by a 13 px larger gap. A K pupil can count three groups.

**N3 · blocking while offered · `wpCues` / `wpBank` teach the keyword strategy with dead bank words (class PEDAGOGY / LIVE, rule_ids P-21, VQ-3, H15)**
- Where: `R/cues-S/addition__add_wp_20_plain/independent-p1.png`. The card lists both as **offered** "graded like any
  other option".
- Evidence:
  - Every story bolds and underlines "**more**". The bank beside it lists "+ in all, altogether, total" and
    "− left, fewer, how many more". The cued word is filed under the WRONG sign in the bank.
  - None of the + bank words occurs in any story on the page (the stories say "now").
- Caps: H15 gives C3 ≤ 6. A keyword rule against P-21 gives C2 6.
- Fix: hide both on the eight sentence-layout story skills (the card's own proposal, `notOffered`), or have the owner
  rule them out. Until then the option is graded and fails.

**N4 · non-blocking (advisory roles), must fix · the sentence layout ignores the value to show: wrong keys (class KEY, rule_ids H1, AK-1, PT-TOF-1)**
- Where:
  - `R/S/subtraction__sub_wp_20/true-false-key-p1.png`: items 1, 3 and 5 draw 16 − 9 = **7**, 6 − 1 = **5** and
    13 − 5 = **8**, all true, and the key ticks **False**. The same happens in `R/L/addition__add_wp_20_plain/true-false-key-p1.png`
    on items 1 and 3.
  - `R/S/subtraction__sub_wp_20/reason-it-key-p1.png`: A and B are identical (both correct), and the key circles one
    at random. The sentence frame also crosses the A panel's border, and "stamps" collides with "The answer is".
- Cause: `true-false.js` passes `shown` (the wrong claim) to `it.render`, but `word-work.js`'s sentence path draws
  `p.ans` (`shownSteps` / `answerBlock` ignore `o.shown`).
- Fix: when `o.shown` is set, the sentence frame writes it in the answer box (and the error the provider's
  `wrongAnswer` names).
- Check: a unit check that for every template a rendered `{shown: X}` contains X in the answer slot. The overflow gate
  should also measure inner panels (`.mq-judge-work` children).

**N5 · non-blocking (advisory) · guided cells H13 (class SPACE, rule_ids H13)**
- `R/S|M|L/*/guided-p1.png`: story cells 40-45 % empty and `add_wp_10` up to 49 %. Cells are sized to the Steps
  column, not the item.
- `R/chart-S/.../guided-p1.png`: 51.9 %.

**N6 · non-blocking (advisory) · scripted model on two half pages (F14 residual; class SPACE, rule_ids H5-adjacent, PAGEFILL)**
- `R/M/addition__add_wp_20_plain/scripted-model-p1.png` and `-p2.png`: 2 frames a page with about 40 % blank each,
  where 4 frames of 225 px fit on one page.

**N7 · nit · the key reads "1 stamps"**
- `R/S/subtraction__sub_wp_20/independent-key-p1.png` item 1. The printed plural is right for the pupil (F5), but the
  key and the screen's marked state read ungrammatically. Accept, or singularise the label on the key only.

**N8 · nit · screen**
- card-390 / worksheet: the focused two-digit box splits into two digit cells (the yellow focus box with a divider),
  while paper draws one box (`R/S/subtraction__sub_wp_20/card-390.png`, crop `R/crop_sub390.png`).
- With `familyChart` on, the chart's first box takes the initial focus, ahead of the graded Yes / No.

**N9 · nit (lesson C2) · `fact_family_sort` model frames 1 and 2 are the same picture**
- `R/S/addition__fact_family_sort/lesson-p1.png`: "Find the big number" marks nothing. Ring the 7 in frame 1, and show
  6 + 1 under the base in frame 2.

**N10 · nit · Grade 1 warm-up as vertical stacks needing an exchange**
- `R/S/subtraction__sub_wp_20/lesson-p2.png`: 20 − 12 and 17 − 9 are stacked and top-aligned. CL-4b says an exchange
  item is centred, and a within-20 Grade 1 warm-up is better as a horizontal fact.
- This is the prerequisite skill's drawing, so it is filed on that skill.

**N11 · nit · anchors at L leave 59 mm blank**
- `R/anchorsL/*/independent-p1.png`: the grid ends at y 810 of 1034. A 56 mm row of 2 stories would fit by about
  3 mm. Not H5 (74 % used).

## Visual-quality questions (RUBRIC 6.1)

| Q | `fact_family_sort` | story skills |
|---|---|---|
| 1 Representation | Fact triangle, the whole on top: yes | Number sentence and labelled answer; the bar on the teaching pages and as an option: yes |
| 2 Live parts | All live (chart: working space, ungraded) | Live by default. **Not** with `wpCues` / `wpBank` (N3) |
| 3 One answer place | Yes / No only, chart ungraded: yes | One 1.5 pt answer box with the plural unit: yes |
| 4 Type and stroke | 1.5 pt outline and rings, 0.75 pt chart boxes | Answer 1.5 pt, boxes and circle 1 pt, sign 1.2 × digit |
| 5 Paper = screen | Yes (chart order on the phone, N8 nit) | Yes (focus split, N8 nit) |
| 6 Title | A sentence | Sentences |
| 7 Own renders | Graded here | Graded here (`add_wp_10`, `add_wp_20_plain` and `sub_wp_20`; the other five card skills are TEMPLATE-ONLY) |

## Blocking findings (round 3 must clear these)

1. **N1**: `familyChart` on: the lesson p1 / p2 overflows the page at S and L (gate FAIL, 14 / 18 findings); C1 4.
2. **N2**: the `add_wp_10` lesson p3 at L has a 30.4 % H13 band in 3 of 4 cells; C3 6.
3. **N3**: `wpCues` / `wpBank` are offered on the story skills and fail: a keyword strategy against P-21, the cue filed
   under the wrong sign, and bank words the stories never say (H15). Hide them (owner / lead ruling) or fix them.

Must fix before merge, although outside the pass bar: **N4**, the wrong True-or-False and Reason-It keys on every
sentence-layout story skill (H1).

## Automatic checks

| Finding | Class | Existing check? | Proposed check and backtest |
|---|---|---|---|
| N1 chart lesson overflow | OVERFLOW | `ws-grade-render --gate` exists, but precritic runs it with default options only | Precritic `--skill` runs the gate once per offered support / bool option (`offeredOptionsFor`, group `support`) on lesson, test and independent. Backtest: `fact_family_sort` `{"familyChart":true}` at 7ca0609 must FAIL |
| N2 lesson L H13 | SPACE | `ws-print-lint` L-DENSITY H13 runs on independent / test; the lesson p3 at L is not on precritic's size path | Run L-DENSITY on lesson pages at S, M and L (precritic `--role lesson` at every size, not only M). Backtest: `add_wp_10` lesson L p3 at 7ca0609 (30.4 %) |
| N3 keyword options | LIVE / PEDAGOGY | `ws-visual-quality` VQ-LIVE checks bank words but evidently not with `wpBank` on | Run VQ-LIVE with each offered option on. A bank word must occur in its own story, and a cued word must sit under the sign of the item's operation. Backtest: `add_wp_20_plain` `{"wpCues":true,"wpBank":true}` |
| N4 sentence ignores `shown` | KEY | none | A template unit test: render each kit template with `{shown: X}` and assert that X is in the answer slot; plus a key consistency check on true-false (a "False" tick needs the drawn value ≠ the key value). Backtest: `sub_wp_20` true-false S seed 730690 |
| N4 reason-it panel overlap | OVERFLOW | the gate checks cells, not inner panels | Extend the overflow measure to `.mq-judge-work` / A-B panel children |
| N5 guided bands | SPACE | none on guided | Add guided to the L-DENSITY sweep (advisory output) |
| N6 scripted model pages | SPACE | PAGEFILL H5 | PAGEFILL on scripted-model at M and L: fail when two pages are each < 65 % used and their frames fit on one |
| N9 identical frames | PEDAGOGY | none | Lesson model check: consecutive frames must differ in drawn content (hash the frame SVG/HTML minus the caption) |

## Speed-ups

- **Gate the options, not just the defaults.** N1 was machine-visible: the same render command with one `--opts` flag
  prints FAIL. The lane added `familyChart` after the precritic run that cleared r1. A precritic loop over
  `offeredOptionsFor` would have kept round 2 from starting with a red row (rule 0b).
- **Hide-or-grade decisions before the critic.** N3 exists only because the card left `wpCues` / `wpBank` "offered
  until the owner rules". An offered option is graded, so the lane should ship them hidden (`notOffered`) and let the
  owner re-offer them. That turns a blocking finding into a ruling.
- **Advisory roles share the cell code.** N4 comes from the same `word-work.js` path the pass-bar pages use. A
  ten-second unit test (template × `shown`) catches it without a browser.
- **Render time** was about 5 minutes per size for 4 skills × 11 roles, plus 3 minutes for the option runs (about
  20 minutes in all). The bands scan should be in `meta.json` (r1 speed-up, still open). I ran it by hand again on
  about 60 pages.
