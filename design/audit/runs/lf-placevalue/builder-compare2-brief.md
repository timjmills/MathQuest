# lf-placevalue builder compare r2: the rebuild after critic r1 FAIL (Opus medium, CLAUDE.md "Agents")

## Setup
- Branch `claude/lf-placevalue-w2` (head fb20febe). Work in this tree.
- Commit after EACH step. Messages end with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_013pHDnMCXcY6kXV15KHf4Yp`
  Then run `git push -q origin claude/lf-placevalue-w2`. Never force-push.
- No $ cap: the lead lifted it, 2026-11-13. Still, work efficiently and report your spend.

## Rules
- Never edit design/STATUS.md.
- Never run ws-stamp-assets or ws-chromebook-perf.
- CSS changes are additive only. Shared registries are append-only.
- Run browser gates one at a time, through `tests/scripts/mq-browser-run.sh`.
- Run `node --input-type=module --check < file.js` on every JS file you change.

## Read first
- `design/audit/runs/lf-placevalue/critic-compare1.md`: findings F1–F11, with pages and numbers.
- `design/audit/LESSONS_LEARNED.md` PRE-FLIGHT.
- `design/cards/pv/pv.md`: PV-04, step 5, M6 "89 > 312 because 8 > 3".
- `js/modules/gen-pv.js` (`genCompare`, `blockOrder`, ~line 851 lengths=mixed); `js/modules/sheet/providers/pv.js` (`registerSkill('placevalue:compare'`); `js/modules/lessons/families/placevalue.js` (routine `pv-compare`, lesson `skill:placevalue:compare`).

## Rule for every fix
Each fix gets a check that FAILS on 16748cd8 (the r1 head) and PASSES on your fix. For each one:
- add a `commit-pair` row to `tests/fixtures/precritic/backtests.json`: append it and keep the 1-space indent;
- run `node tests/scripts/ws-backtest.mjs --row <id>`;
- put the check on the lf-placevalue opt-in path in `tests/fixtures/precritic/opt-in-rules.json`.

## Fix list

### 1. F1 (lead ruling)
lf-roles owns the Reason It A/B box geometry. They will stack A over B when the work is wider than half the box. Do NOT narrow the band; content never shrinks.

YOUR part:
- compare's footprint/cell must state its TRUE drawn width, so the role can read it. Say exactly where and what the role reads, and send that in your report so I can forward it to lf-roles.
- Close the precritic gap: `ws-cell-checks --card --card-opts` must render every thinking role (true-false, reason-it, error-analysis, opener, scripted-model, guided) under EVERY offered band value. For example: an opt-in flag, or make `--card-opts` cross thinking roles with band values.
- Its backtest row FAILs on 16748cd8 (reason-it band=999999 OVERFLOW). The pass state may stay red until lf-roles lands the stack; if so, record it as PENDING with the reason, not as a pass.

### 2. F2: the lesson must teach the decision the pages deal
- Rewrite the chant / rule and the worked steps so they name and MARK the deciding place: compare the first place that differs; the more-digits rule applies only when the lengths differ.
- A step that names digits marks them in the drawing. No step only restates the item. Guided's fading cue gives a real cue.
- Checks:
  - LESSON-CHANT-FIT: the chant decides at least half the items the lesson deals.
  - WORKED-STEP-DOES: no step equals the item text; a step naming digits has a mark.

### 3. F3: M6 must be the error the thinking pages show
- error-analysis, true-false and reason-it show M6 in at least half their errors, at every size.
- When lengths=mixed is on, at least one item shows the first-digit form ("89 > 312").
- Fix the lengths=mixed deal (gen-pv.js ~851) so the shorter number's leading digit can be larger.
- Check: M6-SHOWN.

### 4. F4: no pinned "="
- Live play (no item seed) must not pin "=" to item 1. Seed the block order per run.
- "=" must never be a worked model (guided / scripted-model / opener / lesson anchor).
- Check: extend `ws-dealer-uniform` to symbol answers, or add a small check: the "=" position and rate are spread across runs, and there is no "=" model.

### 5. F5: deeper close comparisons
- closeness=close spreads the deciding place over place 2 … the last place.
- Check: CLOSE-DEPTH.

### 6. F6: fewer trivial mixed items
- lengths=mixed limits 1-digit numbers, so most items differ by one digit in length.
- Check: MIXED-1DIGIT.

### 7. Pixel empty-band reds (lead: no pin; fix before the critic)
lf-checks' pixel ws-empty-band reads EB-BAND 205 / EB-SIDE 16 on pv skills.
- Measure from the worktree `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/wt-lfc` (lf-checks' branch) against THIS tree:
  `cd <wt-lfc> && MQ_ROOT=/home/user/MathQuest /home/user/MathQuest/tests/scripts/mq-browser-run.sh node tests/scripts/ws-empty-band.cjs --skill placevalue:<skill> --vocab-ink --page-fill --margin 2 --no-baseline [--roles r --sizes S --hosts none] [--json f]`
- My measurement on fb20febe is in `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/eb-<skill>.txt`/`.json` for combine, unit_form, expand, compare, identify and value; it may still be finishing.
- Fix the pv-owned cells: practice / test / review / lesson / the screen hosts' pv cells.
- Record the D3 engine roles: guided / opener / scripted-model / error-analysis / reason-it / true-false / mixed-practice layouts. lf-roles owns those.

### 8. Minor
- F9: 3-across digits 4 mm from the cell rules at L.
- F7: Test S/L 51–55 % white (a combine precedent); judge it against EB-GRIDFOOT.

## Before you report
- Run `node tests/scripts/ws-precritic.cjs --skill placevalue:compare --strict` and save it as `design/audit/runs/lf-placevalue/precritic-compare-r3.md`. List every red row as pv-owned or D3.
- These must be OK: `ws-boot-smoke`, `ws-providers-unit`, `ws-code-snapshot`, `ws-content-audit --skill placevalue:compare`, `ws-lesson-unit`, `ws-capacity-pin --check` (any drop needs a reason), and `ws-detailed-lesson` lesson 1 `--check` and `--repeats`.
- Reply with:
  - your commits;
  - each finding FIXED / NOT FIXED (why);
  - each check id with its backtest row and PASS / PENDING;
  - the pixel EB numbers per skill, before → after;
  - the footprint width note for lf-roles;
  - your spend.
