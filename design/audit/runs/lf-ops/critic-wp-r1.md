# Critic round 1: plain x / ÷ stories (lane lf-ops)

- Skills: `multiplication:mult_word_problems_plain`, `division:div_word_problems_plain`
- Tree: frozen worktree `critwp`, commit d26d2c4. Critic: independent, Opus medium, 2026-11-07 13:21-13:50 UTC. I built none of it.
- Read: RUBRIC (with §6.1), the signed ops-tables card §7a, the lead rulings in `design/status/lf-ops.md`.
- Renders (in `renders/` next to this file in the worktree):
  - `renders/mult/`, `renders/div/`: `ws-grade-render`, all 15 roles at S/M/L, plus card 1280/820/390, worksheet 1280 and quiz 1280. Both runs ended rc=0 (121 and 111 pages).
  - `renders/forms-<skill>-<0|1|2>/`: Independent and More Practice A at S and L with `--opts '{"forms":[k]}'`.
  - `renders/sec-png/`: sections sheets (div_facts + the two stories) from `ws-print-lint --kind sections` at S and L, in four variants: defaults, ex-each (`--anchors side`), ex-group (`--anchors sections`) and `--pages 2`. The pages were rasterised from `--save-html`, and the lint logs are `renders/sec-*.log`.
- Lead rulings applied:
  - (a) sibling-compare is skipped, so everything is graded by eye.
  - (b) Two known faults are noted but not scored against the skills: the `--pages 2` page-flow fault, and the 40 × 44 px answer-digit target on card-390.

## VERDICT

| Skill | Verdict | Lowest score |
|---|---|---|
| mult_word_problems_plain | **FAIL** | **C2 4** (Independent, More Practice, Test, Mixed, every host) |
| div_word_problems_plain | **FAIL** | **C2 5** (Independent, More Practice, Test, Mixed, every host) |

What fails each skill:
- **Multiplication:** the "The story" option (`forms`) does nothing. Forms 1 (arrays) and 2 (comparison) print the same "N has # bags. Each bag has # Ys. How many Ys are there in all?" frame as form 0. Across 389 dealt items in every role, there was not one array story and not one times-as-many story.
- **Division:** the stories are worked in the long-division bracket, with subtraction and remainder rows, on Grade 3 facts. The "A remainder to interpret" form (forms 2) deals sharing stories.

## Scores (C1 / C2 / C3 / C4)

Scope note: the graded versions are Practice (single and mixed), Quiz/Test, Lesson and the three hosts. The stand-alone Guided, Model, Opener, Review, Error analysis, True/False, Reason It, Stretch and pre-skill pages were looked at only for defects that also show in the graded versions.

### multiplication:mult_word_problems_plain

| Version | S | M | L |
|---|---|---|---|
| Independent | 7/4/8/8 | 7/4/8/8 | 7/4/7/8 |
| More Practice A, forms default / [0] / [1] / [2] | 7/4/8/8 | 7/4/8/8 | 7/4/7/8 |
| Test | 7/4/8/8 | 7/4/8/8 | 7/4/7/8 |
| Mixed practice (single) | 7/4/8/8 | 7/4/8/8 | 7/4/8/8 |
| Sections defaults | 7/4/6*/8 | - | 7/4/8/8 |
| Sections ex-each | 7/4/8/8 | - | 7/4/6*/7 |
| Sections ex-group | 7/4/8/8 | - | 7/4/6*/8 |
| Sections `--pages 2` (ruling b: not scored) | n/s | - | n/s |
| Lesson (3 pp) | 8/6/7/8 | 8/6/7/8 | 8/6/7/8 |

| Host | Score |
|---|---|
| card-1280 | 8/4/8/7 |
| card-820 | 8/4/8/7 |
| card-390 (target excluded, ruling b) | 8/4/8/7 |
| worksheet-1280 | 8/4/7/7 |
| quiz-1280 | 8/4/8/7 |

### division:div_word_problems_plain

| Version | S | M | L |
|---|---|---|---|
| Independent (sharing + grouping) | 8/5/8/8 | 8/5/8/8 | 8/5/8/8 |
| More Practice A, forms [0] / [1] | 8/5/8/8 | 8/5/8/8 | 8/5/8/8 |
| More Practice A, forms [2] | 8/3/8/8 | - | 8/3/8/8 |
| Test | 8/5/8/8 | 8/5/8/8 | 8/5/8/8 |
| Sections (same sheet as above) | 8/5/6*/8 | - | 8/5/6*/8 |
| Lesson (3 pp) | 8/6/8/8 | 8/6/8/8 | 8/6/8/8 |

| Host | Score |
|---|---|
| card-1280 | 8/5/8/7 |
| card-820 | 8/5/8/7 |
| card-390 (target excluded) | 8/5/8/7 |
| worksheet-1280 | 8/5/7/7 |
| quiz-1280 | 8/5/8/7 |

\* **Sections C3 6, a question for the lead.** The engine page-flow fault the lead exempted for `--pages 2` also fires without `--pages`:
- defaults S: page 2 holds 2 items and is 73 % empty;
- ex-each L and ex-group L: page 2 holds 2 items while page 3 follows (DN-2), and page 3 holds 2 items (PG-23).

`ws-print-lint` reports these too (`renders/sec-def-S.log`, `sec-each-L.log`, `sec-group-L.log`). The cause is the same: `roles/practice.js` lets a sub-section run on into the page before's leftover space. If ruling (b) covers this cause, these cells drop out of the skill grade. They do not change either verdict.

## Defects

Columns: id, where, measured, rule, fix, the check that would have caught it.

### Both skills

**WP-1 (critical, C2 mult, cap). Mult `forms` 1 and 2 are dead options.**
- Where: `renders/forms-mult_word_problems_plain-1|2/*/independent-S-p1.png` and every mult page.
- Measured: 389 of 389 dealt items use the one `groups` frame. There are 0 array stories ("# rows of # chairs") and 0 times-as-many stories, under the default and under `forms:[1]` and `[2]`.
- Cause: `tellStory` (`js/modules/sheet/cells/word-work.js` ~l.395) retells every × step as `groups`. It knows `times` but is never given it for the plain skill, and has no `array` schema.
- Rule: card §7a "forms offered ... untouched deals them in turn"; RUBRIC C2 "items vary sensibly"; OPT-DEAD. With one sentence frame, the pupil can answer every item by pattern without reading, which defeats the skill's own point ("read whole stories").
- Fix: pass the generator's `q._variant` through to the word-work payload `schema` (`equal_groups` → `groups`, `arrays` → a new `rows` schema: "There are # rows of chairs. Each row has # chairs. How many chairs are there?", `comparison` → `times`). Deal them in turn when the option is untouched. In the Model, `plainGroupsStep` must name rows and columns for arrays and "# times as many" for comparison.
- Check: **FORMS-LIVE**. For each offered `forms` value, render 6 items and take a schema signature of the printed story (digits, names and nouns masked). Fail when two values print the same signature set, or when the untouched page shows fewer than min(3, #forms) signatures. Put it in `ws-options-verify` on precritic's path.

**WP-2 (major, C2 div, −3 on forms[2]). Div `forms` 2 ("A remainder to interpret") prints exact sharing stories.**
- Where: `renders/forms-div_word_problems_plain-2/*/independent-S-p1.png`.
- Measured: 20 of 20 items are sharing or equal-groups; no remainders.
- Rule: OPT-DEAD (an option whose label promises something the page does not do).
- Fix: either retell `remainder` as `rem-left`/`rem-up` (the cell already has these schemas), or hide forms 2 on the `_plain` skill (`remainder_interpret` is the preset that owns remainders). Record the choice in card §7a.
- Check: FORMS-LIVE (as WP-1).

**WP-3 (major, C4 both, −1 to −2). Paper ≠ screen.**
- On paper:
  - the label bank stands to the right of the grid;
  - the label line sits beside the answer row (mult) or above the bank (div);
  - mult's sign place is a square box at the left of the multiplier row.
- On every host (card 1280/820/390, worksheet, quiz):
  - the label line sits under the grid, at the left;
  - the bank is a row under that;
  - the sign place is an empty circle.
- Div worksheet item 1 (9 ÷ 3) draws a 1-column dividend grid; paper always draws 2.
- Where: `mult/card-1280.png` against `independent-S-p1.png`; `div/worksheet-1280.png` item 1.
- Rule: VQ-8 (the same drawing on paper and screen).
- Fix: in the word-work screen twin (`cells/word-work.js` screen branch, `css/screen-cell.css`), place the bank and label line as the print cell does, use one sign-slot shape (the print box), and use the print grid width for every item of a page.
- Check: lf-ops **critic check 10 (paper = screen frame)**, which is already a TODO in the status file. Compare the order and relative position of grid, bank, label line and sign slot between the print cell DOM and the card DOM.

**WP-4 (minor, C3 L, −1). At L a story that wraps to 4 lines pushes its grid down.**
- Measured: item 1 sign row y = 313 px and item 2 y = 289 px (`mult/independent-L-p1.png`); the same on Test L. The answer is not in the same place in every cell of the row (AX-4). The wrapped "in all?" sits alone on its line.
- Fix: top-align the work block at the row's tallest story (a shared story band per row), or let the L story column take the cell's full width.
- Check: per row, the answer-slot y spread is ≤ 2 mm (an AX-4 slot-y check in ws-cell-checks).

**WP-5 (major, C2 lesson, −2). The Lesson Vocabulary match gives itself away.**
- What prints: "4 in each" matches "in each". The same card is used for division ("3 groups of 4 / 4 in each / 15 ÷ 5 = 3"), so division gets no sharing / total / each-share terms.
- Where: `*/lesson-S-p2.png`, both skills.
- Rule: C2 "nothing gives the answer away"; the vocabulary must suit the skill.
- Fix:
  - mult: "2 bags of 5" → equal groups; "5 in each bag" → in each; "6 × 5 = 30" → times.
  - div: "share 12 equally" → share; "3 friends" → equal groups; "12 ÷ 3 = 4" → divide. No term may repeat words of its own prompt.
- Check: **VOCAB-ECHO**. Fail a lesson vocab pair whose term shares a content word with its own prompt.

**WP-6 (minor, C2 lesson, −1). Model panel 1 covers steps 1-2 ("Circle the sign") but shows no circle; only panel 2 shows it.**
- In the stand-alone Model (`scripted-model-S-p1/p2`), panels 2 and 3 show a blank cell for "Circle ×" and "Write 8 and 6", so the pictures do not follow the steps.
- Fix: draw each panel with the slots of every step up to that panel filled (cumulative).
- Check: **MODEL-PROGRESS**. Consecutive model panels must differ in their filled slots, and panel n holds every slot named by steps ≤ n.

### mult_word_problems_plain

**M-1 (major, C1, −1; H16). The sign has two places.**
- The key circles × in the sign row AND writes × in the box at the left of the multiplier row (`independent-S-key-p1.png`, every item; the Model and anchors too).
- The instruction says only "Circle the sign", so a pupil does not know the box is for the sign.
- Fix: one sign place. Either drop the column's sign box when the sign row is shown, or drop the sign row and ask "Write the sign in the box".
- Check: **SLOT-DOUBLE**. A key that fills two slots with the same value for one response fails (op0 circled + op box).

**M-2 (major, C2/C1, −1; H15). Dead boxes.**
- Measured: products ≤ 64 and factors 2-8 at the default, but the grid draws 3 top boxes, 4 multiplier boxes and 3 answer boxes.
- Across every key at S/M/L, the top tens and hundreds, the multiplier tens and hundreds, and the answer hundreds are never filled: 5 of 10 digit boxes are never live.
- Fix: size the column to the dealt band (width = digits of the largest product on the page, as `stack` does).
- Check: **DEAD-BOX**. Over 20 seeds, a digit box no key ever fills fails H15.

**M-3 (minor, C2, −0.5). Factor order is the reverse of 3.OA.1.**
- The Model writes "8 × 2 = 16" and the column has 8 on top × 2, while the Say frame says "2 groups of 8" (3.OA.1 reads 2 × 8 as 2 groups of 8).
- Fix: write the groups first in the Model sentence ("2 × 8 = 16"). Keep the column as is, or put groups × size; state the order once.
- Check: **SAY-SENTENCE**. The Say frame's first number equals the first factor of the Model's number sentence.

**M-4 (minor, C2). The Guided Model bank prints "days / books / boxes / boxes": a duplicate word.**
- Where: `guided-S-p1.png`. The container is "boxes" and the filler is "boxes".
- Fix: de-duplicate the bank, then refill the filler from a different noun.
- Check: **BANK-UNIQUE** on every word-work bank.

**M-5 (major, C3 lesson, −1; H13). Lesson Warm-up cells are 51 % empty.**
- Measured: cell 185 px, content to 90 px (`lesson-S-p2.png` and L-p2). Size S and L draw the same height.
- Fix: size the Warm-up row to its content (a fact row ~20 mm) and give the space to the Guided story.
- Check: `ws-precritic --role lesson` H13 on Warm-up cells. It did not fire here, so check that it measures this lesson's Warm-up.

**M-6 (minor, C1, ex-each L). The anchor Model prints at S type (story ~10.5 pt) above L items at ~15 pt.**
- Where: `sec-png/sec-each-L-p2.png`, and the same on div p3.
- Rule: text a pupil must read is ≥ 11 pt; the size applies to the anchor too.
- Fix: draw the anchor at the sheet's size.
- Check: anchor font size ≥ the page's item font size × 0.9.

### div_word_problems_plain

**D-1 (critical, C2, cap 5; H14/H15). The wrong representation for 3.OA.A.3.**
- Every ÷ story is worked in a long-division bracket with a "−" row and a remainder row.
- Measured: in every key, the subtraction row repeats the dividend and the remainder is 0 (`div/independent-S-key-p1.png`). The quotient tens box is never filled.
- That is the 4.NBT.6 / 6.NS.2 algorithm on a Grade-3 fact. The Model never explains the rows (step 3 says only "Write 15 and 5 in the boxes. 15 ÷ 5 = 3"), so they are parts that are not live.
- Rule: §18 representation map (a ÷ story to 100 draws a number sentence / equal-groups bar, not a long-division bracket); H15.
- Fix: for exact facts in 3.OA bands, print the number-sentence frame `□ ÷ □ = □` with the label line (the `wpFrames` layout), or the bar when `wpBar` is on. Keep the bracket only for `range` 1000 or for remainders.
- Check: **DEAD-BOX / LIVE-ROWS**. A remainder row whose key is 0 on every item of a page, and a subtraction row that only repeats the dividend, fail H15.

**D-2 = WP-2** (forms 2 dead).

**D-3 (minor, C2). Fixed filler words.** "days" and "boxes" are the label-bank fillers in 17 of 20 banks, so a pupil learns to rule them out.
- Fix: draw the filler from the page's other stories' nouns.
- Check: filler entropy on BANK-UNIQUE.

## §6.1 answers

1. **Representation.**
   - mult: equal-groups story → the map names an equal-groups bar or sentence. It draws a column grid instead. Acceptable as a structural workmat, but there is no array or comparison drawing because those forms are dead (WP-1).
   - div: the long-division bracket is the wrong drawing (D-1).
2. **Live parts.**
   - mult: sign row and sign box both live (doubled, M-1); 5 of 10 digit boxes are dead (M-2).
   - div: the subtraction and remainder rows are dead on exact facts (D-1).
   - The bank and label line are live. The Say frame is live and correct ("2 groups of 8 is 16 books", "15 divided by 5 is 3 crayons").
3. **One answer place.** mult: no, the sign is doubled. div: yes (quotient plus label line).
4. **Type and stroke.** Andika, proportional, black and white on the pupil pages. The key is red ink. The structure strokes read about 1.5 pt and the box strokes about 1 pt. Pass.
5. **Paper = screen.** No (WP-3).
6. **Title.** "I Can solve multiplication stories" / "I Can solve division stories". Pass.
7. **Own renders.** Yes, graded on their own renders at Grade 3, default band.

Also checked, and fine:
- No key-word teaching: no cue words, no keyword bank, and the rule is structural ("Equal groups? Multiply." / "Split it equally? Divide.").
- No answer given away on practice or test pages.
- The unit is written in the key on every item.
- One frame per section.
- Keys are correct on every item I checked (Independent, Test, Lesson S/L, both skills).
- Story numbers make sense: mult products ≤ 64, div dividends ≤ 64 and quotients ≤ 11 at the default.

Not covered (time):
- `range` 100 / 1000 and `wpBar` / `wpFrames` renders;
- More Practice letters other than A;
- M-size sections sheets;
- the div stand-alone Model, and the card-820 PNG of div opened at full scale.

## Rule 00

**Automatic checks that would have caught each finding:**
1. FORMS-LIVE (WP-1, WP-2): a per-offered-value schema signature in `ws-options-verify`, on precritic's path.
2. SLOT-DOUBLE (M-1): the key fills one response in two slots.
3. DEAD-BOX / LIVE-ROWS (M-2, D-1): a digit box or row never filled, or only ever filled with a copy or 0, across 20 seeds.
4. Paper = screen frame, lf-ops critic check 10 (WP-3): the relative order and position of grid, bank, label line and sign slot.
5. Slot-y spread per row ≤ 2 mm (WP-4).
6. VOCAB-ECHO (WP-5).
7. MODEL-PROGRESS (WP-6): cumulative filled slots per panel.
8. SAY-SENTENCE factor order (M-3).
9. BANK-UNIQUE plus filler variety (M-4, D-3).
10. Lesson Warm-up H13 measured on this lesson (M-5).
11. Anchor font ≥ 0.9 × the item font (M-6).
12. L-DENSITY sections, already present. Its reds on defaults S, ex-each L and ex-group L should be named in the hand-over, not only `--pages 2`.

**Speed-ups this round revealed:**
1. `ws-print-lint --save-html` writes absolute `http://127.0.0.1:<port>` stylesheet links that die with its server, so the saved sheets render unstyled. The critic wrote a re-shooter (`scratchpad/shoot-html.cjs`, rewriting the origin), at a cost of about 8 min. Fix: write relative links, or add `--png` to print-lint, or `--kind sections` to ws-grade-render.
2. `ws-grade-render --help` starts a full render; it has no usage exit. Add one.
3. The dead `forms` options could have been seen without a critic. The builder ran `ws-options-verify`, but it compares rendered text, and the numbers always differ. Mask digits and names before comparing.
4. The hand-over named the sections fault for `--pages 2` only, but the same lint fires on three other sheet variants. Hand-over notes should paste the lint's full red list, so lead rulings cover the actual cases.
