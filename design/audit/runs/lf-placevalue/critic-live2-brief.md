# lf-placevalue critic live2: FINAL round under round cap 2 for number_word_form's one-kind class (independent critic, Opus medium)

The lead has ruled: if this round fails, composing:number_word_form loses its redesign-passed mark. So grade strictly, and grade fairly.

## Setup
- You are an INDEPENDENT critic. Grade only; do not fix.
- Tree: `/home/user/mq-live1`, branch `claude/lf-placevalue-live2` at 3532a7cf. It has master 1531d0728 merged in, and master includes live1. Do not pull.
- BEFORE tree: make a read-only worktree, `git worktree add <scratch>/wt-l2b 7dea0448`. That is the live1 critic r2 head. Remove it when done.
- Output goes under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-live2/`.
- Limit: 25 minutes.
- Run every browser command one at a time, through `tests/scripts/mq-browser-run.sh`.
- `ws-grade-render.cjs` has no `--help`. Read its header comment instead.
- Sizes: M and L only. No 390.

## Read first
- `design/audit/RUBRIC.md`
- `design/audit/runs/lf-placevalue/critic-live1-r2.md`: N3, N6, N7 and the minors.
- PAGE_TYPES §2.3: one kind per page; the Steps fit every item.

## What changed
- One shared kind helper: `roles/compose.js` `stepsKindOf` / `oneKindFirst`, used by the opener, guided and the lesson's We Do and anchor.
- 11 and 12 are their own kind (teen-irregular), with Steps that name them.
- 0–10 are one kind.
- The lesson's Rule and Remember lines come from the page's own kind and slot.
- A to_words line never exceeds its cell.
- A role-page sweep of all 30 passed skills found NO page changed against master (`design/audit/runs/lf-placevalue/sweep/`).

## Grade: composing:number_word_form at M and L, BEFORE vs AFTER, each with its key
1. **N3:** the Opener at band 20, and every Guided page at band 20. No item may sit under Steps that don't fit it. Check especially that eleven and twelve get their own Steps and those Steps teach them honestly.
2. **N6:** the lesson role (chart + sheet) at band 20, to_words, and numbers to 100. Check:
   - the Guided items are of the Model's kind;
   - the Rule names only what the page has (no boxes when it has none, no hundreds on two-digit items);
   - the Remember line fits the page.
3. **N7:** the Opener at L, to_words, at band 100 and band 1000. No overflow, and the name line wraps at its own size.
4. **Also changed:** the Scripted Model on mixed-kind deals, and the "Write 0." and one-word first-step minors.
5. **Unchanged spot-check:** the default and band-1000 hto lesson pages should be byte-identical to before.

## Rulings in force (no point lost)
- r8b D1: the white space under the Guided grid.
- Lead D3 engine items.
- The I Can title on to_words still reads "write a number from its name". Fixing it changes every skill's titles. Record it, but do not hold it.

## Write
`design/audit/runs/lf-placevalue/critic-live2.md`, containing:
- the grade table;
- N3 / N6 / N7, each FIXED or NOT FIXED;
- new findings, with their numbers and the check that would catch each;
- `VERDICT: PASS` / `FAIL` for number_word_form on these pages (r1 / r2's passing grades stand for every other page);
- the PNG paths.

Edit no other file. Do not commit.
