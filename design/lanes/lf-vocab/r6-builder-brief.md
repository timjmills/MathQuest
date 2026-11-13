# lf-vocab: r6 builder brief (fresh builder, after critic r4 FAIL min 6)

You are a FRESH builder on lane lf-vocab, profile mq-opus-medium (rebuild after a critic fail). Budget: about $18 of
session cost. Be lean: read only what each item needs.

Repo: /home/user/MathQuest, branch claude/sweet-newton-c8wrv1-lf-vocab. Do NOT merge master (lead, 2026-11-09).

## Read
- design/lanes/lf-vocab/critic-r4.md: the 5 defects and OQ-1
- design/audit/LESSONS_LEARNED.md "lf-vocab critic r4"
- design/status/lf-vocab.md (top blocks)
- The card, design/cards/vocabulary/vocabulary.md. It carries a new owner ruling T-5.9 / OQ-1 and is awaiting the
  owner's re-signature. Do NOT edit card.json or the card.

## Test setup and commit rules
Apply the manifest with `node tests/scripts/ws-integrate.mjs --apply --lanes lf-vocab`. NEVER commit what it writes:
- js/modules/data.js
- standards.js
- search-terms.js
- skill-codes-frozen.js
- skill-presets.js
- sheet/providers/index.js
- design/lanes/applied.json

Restore them before your last commit. Run browser gates one at a time.

## For each item: the check first (it FAILs on 90e2eee4), then the fix, then a backtest row
Backtest rows go in tests/fixtures/precritic/backtests.json: fail = 90e2eee4, pass = your commit.

1. **OQ-1, base-ten unit per item** (vocab-pictures.js).
   - When an item has no hundred, one and ten use a larger unit: aim for at least 5 mm. Every base-ten picture within
     one item shares one unit.
   - Change V16 to "one unit within an item" and add a floor: unit >= 5 mm when no hundred is in the item.
2. **pick3 error analysis at S is 30.1-30.2 % empty** (H13). Size the cell to what it draws: 6 a page at S, or the
   L layout with Correct / Fix it beside the picture.
3. **pick3 guided rows unequal at L** (377 vs 290 px; the 4th round).
   - Root cause: V18 passes because it does not measure the RENDERED ROW BOXES.
   - Fix V18 first: measure the printed page's row boxes in the browser at S, M and L, with no "when there is room"
     exemption. It must FAIL on 90e2eee4 at L.
   - Then make the rows equal.
4. **Match 3 error analysis at S drawn at L's height** (24-28 %). Take the S cell height from what S draws.
   - Check: the cell height at S is at most 0.9 x the height at L when the content shrinks (ws-vocab-unit, browser).
5. **"number name" in a bank with "hundred"**, while the picture prints "three hundred forty-seven".
   - Add the notWith pair in both directions.
   - Check: no bank word may appear in the picture's printed text (scan vocabPictureSVG text for each bank word;
     extend V17).
   - If a set can no longer split into two clash-free trios, change that set's words in place.
6. **The "left" picture** reads as take-away. Bracket the circles that are not crossed out (as "repeat" does).
   - Check: a `referent` field on each picture that needs one, and a test that the referent part carries the heavy
     mark (at least "left" and "repeat").
7. **Align ws-empty-band's empty-slot rule with the critic** (tests/scripts/ws-empty-band.cjs, owned by lf-checks).
   - Today an EMPTY answer slot counts as ink, so ws-empty-band passed pick3 error analysis at S at 30.1 % (the critic
     measures from the text).
   - Do NOT change the default for other lanes. Add an opt-in flag (e.g. `--slot-ink off`) that measures as the critic
     does, and run it on precritic's path for the two vocab skills only.
   - Report what the flag does to the pinned baseline: run it once on the pinned skills with --report-only and record
     the counts in your status block for lf-checks.
   - Backtest: the flag FAILs pick3 error analysis S on 90e2eee4 and PASSes your fix.

## Gates before you hand back (manifest applied)
- `node tests/scripts/ws-vocab-unit.mjs` and `node tests/scripts/ws-vocab-unit.mjs --browser`: OK
- `node tests/scripts/ws-empty-band.cjs --skill vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words`: OK,
  and OK with the new flag
- `node tests/scripts/ws-precritic.cjs --skill vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words --strict`:
  only sibling-compare (structural) and the spec-card check-signed row may fail. check-signed is red until the owner
  re-signs; say whether it is.
- `node tests/scripts/ws-backtest.mjs --row <your rows>`: OK
- `node --input-type=module --check < file` on every changed JS file.

## Hand-back
- Commit with the trailer lines and push to claude/sweet-newton-c8wrv1-lf-vocab:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
- Add a "Round 6" block at the top of design/status/lf-vocab.md with Times (UTC).
- Return a table with one row per item (1-7): finding | check id (new / extended) | backtest row id | on precritic's
  path? (y/n) | rounds it would have saved. Then the gate lines and your commits.
- Do not run a critic. Do not touch redesign-passed.js. If an item does not yield after two attempts, stop on it and
  report its root cause.
