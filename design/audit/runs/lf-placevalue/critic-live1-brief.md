# lf-placevalue critic live1: narrow re-grade of live-defect fixes on passed skills (independent critic, Opus medium)

You are an INDEPENDENT critic. Grade only; do not fix code.

## Where to work
- Tree: `/home/user/mq-live1`, branch `claude/lf-placevalue-live1` at 7bf2bc3f. Do not pull.
- Limit: 25 minutes.
- BEFORE pages come from `/home/user/mq-base`, a detached ffcba24b worktree. It is read-only; use it as the before tree.
- Write output under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-live1/`.
- Run every browser command, `--help` included, one at a time through `tests/scripts/mq-browser-run.sh`. Use `node tests/scripts/ws-grade-render.cjs`; it has no `--help` handler, so read its header comment instead.
- Sizes: M and L only. Hosts: card 1280 / 820, worksheet, and quiz with `--quiz-builder`. No 390.

## Read first
- `design/audit/RUBRIC.md`
- `PAGE_TYPES` §2.3 (Guided: the hint holds none of its answer; one kind of problem per page)
- lf-roles critic r8b, D2–D4: `git show origin/claude/sweet-newton-c8wrv1-lf-roles:design/status/lf-roles/critic-r8b.md`

## What changed (passed skills: each page must stay at least 8 and change only as a fix)
1. **composing:number_word_form Guided at M / L**, on every deal: the default; band 20 / 100 / 1000; answerSlot hto; to_words.
   - D3: the hint is now a gapped frame (`"twenty-six": ___ tens, ___ ones.`).
   - D4: one kind per page, with Steps per kind (teen / decade / two-word / one-word).
   - D2: rows sized to their content. The Model writes its first step in grey.
   - n3: a count is kept on one line with its place word.
   - n6: row-1 tries sit under the Model tab's keep-out.
2. **number_word_form Opener and Scripted Model at band 20, M / L.** The Steps now fit teens and one-word names.
3. **placevalue:expand screen hosts.** On the worksheet, card and quiz, the number sentence is now at digit size (worksheet 29 px; card 56 px at 1280), each operator held to its box. Print must be unchanged.
4. **Checks only, nothing to grade visually:** SCREEN-DIGIT skips cells with no numeral, and the worksheet ratchet.

## Rulings in force (no point lost)
- Lead D3 engine items.
- r8b D1, the Guided fit at measured height (ruled to lf-roles' code): the white under the Guided grid. Grade it, but do not hold it.
- The worksheet floor is 29 px.

## Grade
- For each changed page, BEFORE vs AFTER: is D2 / D3 / D4 FIXED?
- Check the teaching: does the gapped hint still help? Do the Steps fit every item on the page? Are the keys right?
- Look for any new defect. Check particularly the screen hosts at 820 (the expand card line with its boxes: does it wrap well?).

## Write
`design/audit/runs/lf-placevalue/critic-live1.md` in that tree, containing:
- the grade table;
- D2 / D3 / D4 and the expand items, each FIXED / NOT FIXED;
- new findings, with numbers and the check that would catch each;
- `VERDICT: PASS` / `FAIL` for number_word_form and for expand;
- the PNG paths you graded.

Edit no other file. Do not commit.
