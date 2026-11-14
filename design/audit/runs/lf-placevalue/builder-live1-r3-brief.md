# lf-placevalue builder live1 r3: ROUND-CAP root cause for number_word_form's one-kind class (fresh builder, Opus medium)

This is CLAUDE.md plan item 4: the same defect class has now failed two rounds, so this round must stop, find the root cause, add a machine check, and then run one more round.

## Setup
- Tree: `/home/user/mq-live1`, branch `claude/lf-placevalue-live1`, head = the critic r2 commit.
- Commit after each step. Messages end with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_013pHDnMCXcY6kXV15KHf4Yp`
  Then push. Never force-push.
- Budget: about $30.
- Sizes are M and L only, no 390.
- Run browser gates one at a time, through `tests/scripts/mq-browser-run.sh`.
- Do not touch expand or unit_form; they PASSED.

## Read first
- `design/audit/runs/lf-placevalue/critic-live1-r2.md` (N3, N6, N7, and the minors)
- `critic-live1.md` (r1)
- CLAUDE.md "Researching Skills", edge case: teens are not all alike, and 11 and 12 have no ones word

## The class (root cause)
"The Steps on a page must fit EVERY item on that page."

Today this is enforced only on the Opener's Guided band (`opener.js` `oneKindFirst`). It fails in two places:
1. **`wordsKind` in the provider lumps 11 and 12 in with 13–19.** "Find the ones in the word" cannot apply to eleven or twelve.
2. **The lesson role (to_words and band 20) deals Guided items of another kind than its Model.**
   - On to_words, the Model 39 "3 tens, 9 ones" sits under 11.
   - At band 20, the Model "six" sits under sixteen and zero.
   - Its Rule / Remember bands name boxes and hundreds that no item on the page has.

## Fix the class once
- **`wordsKind`:**
  - 11 and 12 become their own kind, or the teen Steps are rewritten so they truly fit 11–19.
  - Pick whichever teaches better, and say why.
  - 0 and the one-word names (one to ten) are their own kind.
- **Every role that sets a Model / Steps over items** (lesson, guided, opener, scripted-model) deals the Model's kind for its worked and guided items. Use ONE shared helper, for example a provider member or a contract.js hook that roles call. Do not write per-role patches.
- **Lesson Rule / Remember bands** come from what the page deals: no "Every box gets a digit" without boxes, no "hundreds" on two-digit items.

## Checks first, each with a backtest
Each backtest row FAILs on the critic r2 head and PASSes on the fix. Each check goes on the lane's opt-in path and gets a ledger row.
- **GUIDED-ONE-KIND:** extend it to `--pages lesson,guided,opener,scripted-model` on every wordform × band × answerSlot. It fails when any item on the page has a `wordsKind` other than the Model's.
- **LESSON-RULE-FITS (new):** fails when a Rule / Remember / Steps band names a box, a place or a word kind that no item on the page has.
- **N7:** the Opener at L on to_words has the Model's answer line leaving its cell (OVERFLOW). The check exists: `ws-grade-render --gate --roles opener` on the to_words deal. Put that deal on the lane's precritic path, and fix the overflow. A to_words name line must wrap or size inside the cell, and the words never shrink below their size.

## Minors, only if cheap and safe
- "Write / 0." orphan at band 1000 L;
- the to_words Guided Model has no grey first step;
- the band-20 to_words hint "3: 3 ones.";
- an HTO row-2 cell 8 px high at L.

## Report
- your commits;
- the root cause in one paragraph;
- each of N3 / N6 / N7 FIXED or NOT FIXED;
- each check with its backtest row and PASS;
- the pages changed;
- the gates: `ws-pv-words-pages` on every page kind, `ws-words-checks`, `ws-providers-unit`, `ws-roles-unit`, `ws-boot-smoke`, `ws-detailed-lesson g2-nbt3 --check` / `--repeats`, `ws-precritic-plan` (0 pv ledger fails), `ws-capacity-pin`;
- your spend.
