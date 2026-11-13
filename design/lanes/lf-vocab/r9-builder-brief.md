# lf-vocab: r9 builder brief (merge-induced precritic FAILs, then the critic r7 majors)

You are a builder on lane lf-vocab, profile mq-opus-medium (a rebuild after a critic fail). Budget: about $13 of
session cost; stop when it is spent.

USAGE MAY RUN OUT. After EVERY numbered item:
- commit with the trailer lines and push to claude/sweet-newton-c8wrv1-lf-vocab;
- add a line to a "Round 9" block at the top of design/status/lf-vocab.md.

Repo: /home/user/MathQuest, branch claude/sweet-newton-c8wrv1-lf-vocab at 1ce2233a. Do NOT merge master. Do NOT edit
the card.

## Test setup and commit rules
Apply the manifest with `node tests/scripts/ws-integrate.mjs --apply --lanes lf-vocab`. Never commit what it writes:
- js/modules/data.js
- standards.js
- search-terms.js
- skill-codes-frozen.js
- skill-presets.js
- sheet/providers/index.js
- design/lanes/applied.json

Restore them before each commit and re-apply after. Run browser gates one at a time.

Commit trailer:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP

## Part 1: lead-approved, do FIRST
Each fix: a check first, then a backtest row in tests/fixtures/precritic/backtests.json (fail 3d90097d, pass your
commit).

1. **The pre-skill-check role overflows at S, M and L on both vocab skills** (precritic render-gate and cell-checks).
   - Master's plan-from-card now offers this role for the vocab skills.
   - Reproduce with: `node tests/scripts/ws-grade-render.cjs --skills vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words --roles pre-skill-check --size S,M,L --gate --no-screen --out <scratch>`
   - Fix in the vocab templates' footprint and draw for that role, or its own prerequisite items, whichever overflows.
2. **guided at S with vocabSet 8 overflows** (cell-checks). Reproduce, then fix in the footprint.
3. **print-lint --kind sections L-DENSITY DN-2 / LONE at S and L.** Reproduce with precritic's own print-lint row (see
   tests/scripts/ws-precritic.cjs), then fix.

Then run `node tests/scripts/ws-precritic.cjs --skill vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words --strict`.
Only sibling-compare (structural) may fail. Commit and push.

## Part 2: only if budget remains (the critic r7 majors, design/lanes/lf-vocab/critic-r7-narrow.md)
4. **The quiz:** every wrong Match 3 slot gets the red wrong outline, and red wins over the blue next ring.
   - Check: ws-next-box NB6 (quiz answered-wrong: every wrong slot red, none ringed).
5. **O-3, derived ambiguity:**
   - Replace the hand-written `alsoShows` with lists DERIVED from what each picture draws:
     - "=" adds equation;
     - a number run adds pattern, sequence and multiple;
     - a column drawn round adds column;
     - a crossed or lone mark adds left;
     - a loop of arrows adds pattern.
     Keep the manual list only as an extra.
   - V-AMBIG+ FAILs every same-grade pair that compatible() allows.
   - Resolve each pair: add it to notWith, or redraw the picture. Every set's 6 words must still split into two
     clash-free trios (V5/V7); change a set's words in place if needed.
   - The critic's table: row and column (multiple, pattern, sequence), input and output (column), array (row, column),
     odd (left), cycle (pattern), factor, product, quotient and unknown (equation), term and first term (pattern).
6. **The minors:**
   - the key dot halos become one underlay per group;
   - "Tap even." in place of "Type even";
   - "4 dots in each" and "one bar is 3 times as long as the other".

## Hand-back
Return:
- a table with one row per item: check id | backtest row | on precritic's path | rounds saved;
- the gate lines;
- the commits;
- what is not done.

Do not run a critic.
