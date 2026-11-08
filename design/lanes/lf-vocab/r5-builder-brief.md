# lf-vocab: r5 builder brief (fresh builder, rule 5)

You are a FRESH builder on lane lf-vocab (MathQuest lessons-first wave 1, the owner's vocabulary redesign). Profile
mq-opus-medium. This is a rebuild after a critic FAIL (critic r3, min 6), and two defects have survived 3 rounds, so
rule 5 / IMPROVEMENT_PLAN §1.7 applies: find each root cause, make it a machine check FIRST, then fix.

Repo: /home/user/MathQuest, branch claude/sweet-newton-c8wrv1-lf-vocab (lf-checks b180064f is merged: ws-empty-band
exists).

## Read first
- CLAUDE.md
- design/audit/LESSONS_LEARNED.md: the PRE-FLIGHT, L25, and the sections "lf-vocab ..." and "lf-vocab critic r3"
- design/lanes/lf-vocab/critic-r3.md: the defects you fix
- design/cards/vocabulary/vocabulary.md: SIGNED. Do not edit it or card.json. Its owner rulings bind:
  - Q1: role:lesson is out of scope;
  - Q2: Match 3 prints 4 a page at every size; pick3 prints 4 / 6 / 8 by grade band;
  - Q-A: the footer names the dealt set's standards;
  - Q-B: on Letter at L, grades 2-3 print 4;
  - Q-C: score per word.
- design/status/lf-vocab.md

Code (the lane owns these files):
- js/modules/sheet/cells/vocab-match3.js
- js/modules/sheet/cells/vocab-pick3.js
- js/modules/sheet/graphics/vocab-pictures.js
- js/modules/sheet/lesson-pages/vocab-words.js and vocab-pages.js
- js/modules/sheet/providers/vocabulary.js
- the picture branch of js/modules/gen-vocabulary.js
- tests/scripts/ws-vocab-unit.mjs

Screen tiles: js/modules/screen-cell.js. Keep any edit there additive and scoped to the two templates.

## Test setup (the manifest is NOT committed)
Apply the manifest with `node tests/scripts/ws-integrate.mjs --apply --lanes lf-vocab`. NEVER commit what it writes:
- js/modules/data.js
- standards.js
- search-terms.js
- skill-codes-frozen.js
- skill-presets.js
- sheet/providers/index.js
- design/lanes/applied.json

Before your final commit, restore these with `git checkout -- <files>; rm -f design/lanes/applied.json`.
Run browser gates ONE AT A TIME.

## Step 1: the checks, first
`node tests/scripts/ws-empty-band.cjs --skill vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words` must FAIL
now: it FAILs at least Match 3 guided S/L. Record the FAIL lines.

Add to ws-vocab-unit, each FAILing on today's code before you fix it:
- **V11 on every role:** the per-word Score (Match 3: /3 per cell) on guided, more-practice, test and error-analysis,
  not only on independent.
- **Hint uniqueness:** a guided cue hint picks out exactly ONE bank word. "starts with c" with column and commutative
  in the bank FAILs.
- **Write-line length:** the pick3 answer line is >= 1.2 x the widest bank word at the answer font, at every grade.
- **One base-ten unit:** the unit square of one, ten and hundred is the same.
- **Look-alike list:** an append-only list of critic-found pairs (incl. grow/sequence) must all be in `notWith`.
- **Worksheet tile structure:** every worksheet-1280 tile of one template has the same word-row structure and the same
  slot x. This is a browser check; put it in ws-vocab-unit --browser, or add it to ws-empty-band's host pass through a
  small hook. It is your choice; it must be on precritic's path.
- **pick3 guided row equality at S, M and L** (it was checked at one size).

## Step 2: the fixes (critic r3 #1-#10)
1. **Footprints = drawn height, on every role** (the root cause of #1, #3 and #6). Each template's
   `footprint().hMm` is the height the cell DRAWS in that role and size. Use `ctx.role` / the guided hint row: Match 3
   draws no hint row. Not a cap. ws-empty-band EB-FOOT and EB-BAND are the judge.
   - Match 3 independent stays 4 a page on A4 at S/M/L.
   - No overflow anywhere (ws-grade-render --gate, and precritic's vocab-roles-render).
2. **Match 3 guided H13** (34-37 % at S/L): size it to what it draws, or let it hold more rows.
3. **Error analysis density** (2 a page, 35-40 %): 3 a page, or the Fix-it row beside the picture.
4. **worksheet-1280 tile layout, both skills**:
   - Match 3: one word a row, a fixed word column, and the box at the same x in every tile.
   - pick3: the same picture size and line on every tile; pills never wrap 2 + 1; no 45 % empty tile.
5. **pick3 hint:** use a first-letter cue only when it is unique in the bank; otherwise give the word's meaning
   (VOCAB_WORDS.meaning).
6. **pick3 guided rows equal at L** (379 vs 291 px).
7. **Guided Score per word:** /15 or /12 under Q-C.
8. **Grade 4 write lines:** at least 55 mm, and at least the widest bank word x 1.2.
9. **Base-ten pictures:** one, ten and hundred share one unit square (vocab-pictures.js). Also fix "distributive"
   (the split line almost touches the dots at 34-40 mm) and "pattern" (a real ellipsis, not "..").
10. **grow / sequence:** add the pair to `notWith`. If a set then cannot split into two clash-free trios, change that
    set's word list (VOCAB_SETS is append-only by POSITION: edit the words in place and keep the order of the sets).
    ws-vocab-unit V5/V7 must pass.

## Step 3: clean before the critic
On the branch merged with current master (`git fetch origin master && git merge origin/master`), all of these green:
- `node tests/scripts/ws-empty-band.cjs --skill vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words`
  (zero FAILs; no new pins)
- `node tests/scripts/ws-vocab-unit.mjs`
- `node tests/scripts/ws-precritic.cjs --skill vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words --strict`

Only sibling-compare may fail (structural: first family, no approved sibling).

Then:
- Set `pass.commit` on row eb-vocab-match3-guided in tests/fixtures/precritic/backtests-empty-band.json, drop
  "pending", and append the row to tests/fixtures/precritic/backtests.json.
- Add a backtest row for each new ws-vocab-unit check (fail = 8c9034bb, pass = your commit).
- Run `node tests/scripts/ws-backtest.mjs` on those rows.
- Run `node --input-type=module --check < file` on every JS file you changed.

## Hand-back
- Commit (do not commit the manifest's files), with the trailer lines:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
- Push: `git push -u origin claude/sweet-newton-c8wrv1-lf-vocab`.
- Add a "Round 5" block at the top of design/status/lf-vocab.md: the checks (FAIL before, PASS after), the gate lines,
  and Times (start and end, UTC).
- Return: the gate lines, the commits, and anything you could not fix with its reason.

Do NOT run a critic, and do NOT touch redesign-passed.js. Budget: aim to finish within about $30 of session cost. If a
defect will not yield after two attempts, stop on it and report its root cause.
