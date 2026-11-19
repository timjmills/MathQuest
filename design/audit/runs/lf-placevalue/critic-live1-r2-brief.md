# lf-placevalue critic live1 r2: narrow re-grade after the live1 r1 FAIL (independent critic, Opus medium)

This is round 2 for these finding classes. Under round cap 2, grade strictly.

## Setup
- You are an INDEPENDENT critic. Grade only; do not fix.
- Tree: `/home/user/mq-live1`, branch `claude/lf-placevalue-live1` at a12751d8. It includes master 88cc98b00, which has the compare deploy. Do not pull.
- Limit: 25 minutes.
- Output under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-live1-r2/`.
- BEFORE tree: make a read-only worktree with `git worktree add <scratch>/wt-l1r1 d7a64e5c`. That is the r1 head the critic failed. Remove it when you finish.
- Run every browser command one at a time through `tests/scripts/mq-browser-run.sh`.
- `ws-grade-render.cjs` has no `--help` handler. Read its header comment instead, never call `--help`.
- Sizes: M and L only.
- Hosts: card at 1280 and 820, worksheet at 1280 / 1024 / 820, and the quiz with `--quiz-builder` at 1280 and 820. No 390.

## Read first
- `design/audit/RUBRIC.md`
- `design/audit/runs/lf-placevalue/critic-live1.md` (the r1 FAIL: N1–N5)
- PAGE_TYPES §2.3

r1's passing grades STAND for every page not listed below.

## Grade these
### 1. composing:number_word_form, at M and L, BEFORE vs AFTER
- **N1:** Guided at band 1000, plus answerSlot hto at bands 100 and 1000. Check that no hint names any answer digit outside a gap. Expected: `"two hundred": ___ in the hundreds.`
- **N2:** Guided on numeral-to-words (to_words). The Steps fit every item, no literal number appears, and the hint is a real first step.
- **N3:** Opener at band 20. The Model, the Steps and the Guided band are all of one kind.
- **Pages also changed:** the to_words Scripted Model, and the band-20 / to_words lesson role.
- **Check:** the hints still help, and the keys are right.

### 2. placevalue:expand screens
- **N4:** the worksheet at 1280 / 1024 / 820. The sentence sits on one line, the boxes are at least 103×76, and there are 2 columns at 1280.
- **N5:** the quiz at 820 / 1024. The inputs are at least 48 px tall.
- Also check the card at 1280 / 820.
- Print is unchanged; you need not re-grade it.

### 3. placevalue:unit_form worksheet at 820 / 1024
- N5: the boxes are now 50 px tall, with inputs at least 48 px.

### 4. Global touch rule
`.mq-scell .mq-cellbox:has(> input.mq-cellslot)` now has `min-height: 50px`. The builder's sweep of all 30 passed skills found NO non-pv screen changed. Spot-check that claim on three screens. Each should be identical before and after:
- addition:add_wp_10, worksheet at 820;
- vocabulary:vocab_grade_pictures, worksheet at 820;
- subtraction:sub_100_no_regroup, quiz at 1280.

## Rulings in force (they cost no points)
- r8b D1 (lf-roles): the white space under the Guided grid.
- Lead D3 engine items.
- number_word_form Opener / Scripted Model EB debt that existed before this round. These pages are graded but not held, unless a page changed this round got worse.
- The minor nits are recorded: the band-1000 "Write / 0." orphan, the band-20 Scripted Model modelling "five", and the HTO Model having no grey first step. Grade them as minors.

## Write
`design/audit/runs/lf-placevalue/critic-live1-r2.md` in that tree, containing:
- the grade table;
- N1–N5 each marked FIXED or NOT FIXED;
- any new findings, with numbers and the check that would catch each;
- `VERDICT: PASS` / `FAIL` for number_word_form, expand and unit_form;
- the PNG paths.

Edit no other file. Do not commit.
