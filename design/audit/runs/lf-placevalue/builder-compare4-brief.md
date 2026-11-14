# lf-placevalue builder compare r4: fix round after critic r2 (Opus medium)

## Setup
- Branch `claude/lf-placevalue-w2`. Work in this tree.
- Commit after EACH step. Messages end with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_013pHDnMCXcY6kXV15KHf4Yp`
  Then run `git push -q origin claude/lf-placevalue-w2`. Never force-push.
- Run the full precritic once, at the end.

## Rules
- Never edit design/STATUS.md.
- Never run ws-stamp-assets or ws-chromebook-perf.
- CSS changes are additive only. Shared registries are append-only.
- Run browser gates one at a time, through `tests/scripts/mq-browser-run.sh`.
- Run `node --input-type=module --check` on every JS file you change.

## Read first
- `design/audit/runs/lf-placevalue/critic-compare2.md`: N1–N8, with pages, numbers and crops in the scratchpad.

## Rule for every fix (owner rule)
Every fix comes with:
1. a check that FAILS on ae799fbf (the r2 head) and PASSES on the fix;
2. a backtests.json row proven by `ws-backtest --row`;
3. the check placed on precritic's path (lf-placevalue opt-in), so that `ws-precritic-plan` reports it OK;
4. a row in `design/lessons-first/CHECKS_FROM_CRITICS.md`.

## Fixes
1. **N1: True or False? has too few false statements (12–33 %; PT-TOF-1 asks for 40–60 %).**
   - The compare `wrongAnswer` returns null when M6 would give the right sign. `true-false.js` then keeps that slot as True, where `error-analysis.js:461` skips it.
   - Fix it on the pv side first: deal enough items that M6 gets wrong, or give the provider a selection hook.
   - If a role change is unavoidable, keep it in the smallest possible opt-in in true-false.js and say so; that file belongs to lf-roles.
   - Check TOF-SHARE: `meta.falseShare` is 0.4–0.6 for each skill × size × offered option.
2. **N2: the deciding-digit box cuts the neighbouring digits** (lesson p1 anchor and scripted model at S/M/L; crops `crop-lesson-S.png`, `crop-sm-L.png`).
   - Widen the box, or space the digits, so every mark clears the ink of the characters it does not mark.
   - Check MARK-CLEAR: every mark stays ≥ 0.5 mm from the ink of characters it does not mark.
3. **N3: on mixed lengths the sign strictly alternates > < > <.**
   - In `gen-pv.js`, `comparePair` always returns the longer number first, and `genCompare` swaps it on `slot(2) === 1`.
   - Make the order random but seeded, and independent of item parity.
   - Check SIGN-PARITY: at odd items and at even items, the share of ">" is 0.25–0.75 each, with no strict alternation of 4 or more.
4. **N4: the Guided Model must be an item that M6 gets wrong.**
   - At band 999,999 the Model is decided at the ones place, so a pupil making the M6 error still gets it right.
   - Check MODEL-M6.
5. **N6: lesson p2's "Remember: More digits is the bigger number." decides none of that page's items.**
   - Use the full chant, or a line that fits what the page deals.
   - Extend the chant-fit check to the Remember line.
6. **N7: "=" comes too often or too early in short sets.**
   - Allow at most ceil(n/6) "=" items per section, and never "=" at item 1 of a Test or quiz.
   - A Guided "=" item's cue takes step 2, not "Both have three digits."
   - Check EQ-SHARE.
7. **Wrapped expressions:** "7 > 5" and "9 > 5" break across lines on the scripted model at L and Guided at M. Keep them on one line with a no-break; extend an existing wrap lint (L-WRAP?).
8. **F9 (minor): at L the digits sit 4.5–4.8 mm from the cell rules.**
   - Reach a ≥ 5 mm side pad without shrinking the digits.
   - Check: a side-pad case in an existing lint.
9. **N8 (tool): `ws-grade-render`'s quiz host deals directly instead of through quiz-builder.**
   - Make the quiz host go through the builder path, as `ws-pv-identify-heads` PV-HEADS-QUIZ does, or add an opt-in flag that does.
   - Check: the quiz render of identify --role test has no heads.
10. **identify: lead ruling 14:24.**
    - On identify Review / Test / pre-skill-check, the DEFAULT is no heads and no chart place names.
    - An EXPLICIT teacher support choice (chart / labels) on that page is KEPT; only the default changes.
    - Make `roleOpts` / `roleOptions()` replace only the default, never an explicit option.
    - The check `ws-pv-identify-heads` covers both cases:
      - the default page has no heads or names;
      - an explicit choice is kept.
    - Backtests:
      - the "explicit kept" case FAILs on 0d61403a (which overrode the teacher) and PASSes on the fix;
      - the "default" case stays PASS.

## Before you report
- Run `node tests/scripts/ws-precritic.cjs --skill placevalue:compare --strict` once, and save it as `precritic-compare-r5.md` with every red row marked pv / D3 / ruled.
- Run `ws-precritic --skill placevalue:identify --strict` (or its fast gates) for the identify change.
- These must be OK: `ws-boot-smoke`, `ws-providers-unit`, `ws-code-snapshot`, `ws-capacity-pin --check`, `ws-precritic-plan` (the off-path count must not rise), and ws-detailed-lesson lesson 1 `--check` / `--repeats`.
- Report:
  - your commits;
  - each item FIXED / NOT FIXED (why);
  - each check with its backtest row, PASS, and ledger row;
  - the pages changed, for the narrow critic;
  - your spend.
