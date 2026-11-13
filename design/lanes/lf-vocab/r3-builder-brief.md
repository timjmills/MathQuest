# lf-vocab round 3: fresh builder brief (rule 5 rebrief, 2026-11-07)

You are a FRESH builder (Opus medium, profile mq-opus-medium). Step: the rebuild after critic r2 FAIL min 7, where five
defects survived two rounds (rule 5: find the root cause, make it a machine check, then fix). You did not build rounds 1-2.

Repo: /home/user/MathQuest, branch claude/sweet-newton-c8wrv1-lf-vocab (draft PR #36 into claude/sweet-newton-c8wrv1).

## Read first
- CLAUDE.md (whole); design/lessons-first/briefs/README.md (lane rules); design/audit/LESSONS_LEARNED.md (PRE-FLIGHT).
- design/status/lf-vocab.md (state, the rule-5 root-cause table, the other r2 defects).
- design/lanes/lf-vocab/critic-r2.md (the last critic's report; r1 in critic-r1.md).
- design/cards/vocabulary/vocabulary.md (the SIGNED card; never edit card.json or the card: it would unsign it).
- The lane's code: js/modules/sheet/graphics/vocab-pictures.js, js/modules/sheet/cells/vocab-match3.js,
  js/modules/sheet/cells/vocab-pick3.js, js/modules/sheet/lesson-pages/vocab-words.js, vocab-pages.js,
  js/modules/sheet/providers/vocabulary.js, js/modules/gen-vocabulary.js (the `_genPictureTask` branch),
  tests/scripts/ws-vocab-unit.mjs.

## Owner rulings (2026-11-07, via the lead; record each in the status file)
- Q-B: on US Letter at size L, grades 2-3 print 4 picture items a page (A4 stays 6). PIN it (a capacity pin in
  tests/fixtures/precritic/options-render.pins.json if a gate measures Letter; otherwise record it).
- Q-C: score per WORD: a Match 3 page of 4 cells scores /12 (one point a word). The picture task stays one point an item.
- Q-A: you may add an ADDITIVE footer hook, so a vocabulary page's footer carries the dealt word set's standards
  (VOCAB_SETS[i].ccss and its grade), not the skill's grade-3 tags.

## Order of work
1. `git fetch origin master && git merge origin/master` (new commits: facts print, thumbnails). Resolve any conflict
   keeping both sides; run `node --input-type=module --check` on touched modules.
2. Apply the lane manifest IN THE WORKING TREE for testing only:
   `node tests/scripts/ws-integrate.mjs --apply --lanes lf-vocab`. NEVER commit js/modules/data.js, standards.js,
   search-terms.js, skill-codes-frozen.js, skill-presets.js, sheet/providers/index.js or design/lanes/applied.json.
   Stage only named paths (`git add <file>`), never `git add -A`.
3. For EACH survivor: write the machine check first, show it FAILS on the current tree, fix, show it passes. Prefer
   ws-vocab-unit (node) rules; add a fixture backtest row in tests/fixtures/precritic/backtests.json when the check
   reads data (see the existing row `vocab-sets-split` and `node tests/scripts/ws-backtest.mjs --row <id>`).
   - S1 footer: the footer of a page dealt from one vocabulary set shows that set's grade and CCSS. Find where the footer
     line is built (`footerLeft`, `lessonTagLine`, frameOf in sheet/roles/compose.js, print-sheet.js) and add the
     smallest additive hook (e.g. items carrying `q.standards` / `q.vocabGrade`, read only when every dealt item agrees).
     No other skill's footer may change: prove it with `node tests/scripts/ws-print-lint.cjs --source kit --skills
     addition:add_facts` (or a page hash) before / after.
   - S2 grade-2 picture size: check V8 in ws-vocab-unit: every picture's drawn extent covers >= 50 % of the 60 x 40
     canvas in BOTH directions (parse the SVG body: rect / line / circle / path / text boxes), and every text is
     >= 7 canvas units (16 pt at 40 mm). Redraw what fails (ten, one, number name, expanded form, quotient ...).
   - S3 guided rows: the picture task's guided page had unequal rows (405 / 340 px at S) because one cell carried the
     grey hint line. Write a lint or unit check (rows of one section within 2 mm), then fix at the cell (reserve the
     hint's room in every cell) rather than in the shared guided role, if you can.
   - S4 grade-1 lesson Match strips at 11 pt: check V9: picture text, at the width a cell draws it for its grade class,
     is >= 16 pt for K-1 (and >= 14 pt for 2-5). Fix by redrawing the K-1 number-track pictures with fewer, larger
     cells, or by a K-1 Match picture width, keeping Match 3 at 4 a page.
   - S5 score: the Match 3 page reads /12 (Q-C). Find how the page Score is counted (the item's points / its graded
     slots) and make vocab-match3 count 3; check it in a unit test.
4. Then, as budget allows, the other r2 defects (status file "Other r2 defects" 1-7), each with a check where cheap.
5. Gates: `node tests/scripts/ws-precritic.cjs --skill vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words
   --strict` (about 20 minutes; run it once at the end, in the foreground or background, never two browser jobs at
   once), plus ws-vocab-unit, ws-standards, ws-search-terms, ws-code-snapshot, ws-presets-unit, ws-redesign-passed,
   ws-boot-smoke, ws-lesson-unit, ws-lesson-coverage, `node tests/scripts/ws-spec-card.mjs --check-signed
   design/cards/vocabulary/vocabulary.md`. Known: ws-sibling-compare fails structurally (no approved sibling).
6. Commit your own files with messages ending in exactly these two lines:
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
   and `git push`. Restore the applied shared files before your last commit
   (`git checkout js/modules/data.js js/modules/search-terms.js js/modules/sheet/providers/index.js
   js/modules/skill-codes-frozen.js js/modules/skill-presets.js js/modules/standards.js; rm -f design/lanes/applied.json`)
   ONLY if you are told to; otherwise leave them applied so the critic can render.

## Budget and stop
About $35 of session cost for you. Stop at a clean point if you reach it. Do not spawn sub-agents. Do not run a critic.

## Report (your final message, under 400 words)
The precritic table lines (PASS / FAIL per gate), each survivor's check (name, FAIL before, PASS after), the commits
pushed, what you left undone, and anything the critic should know (render settings, seeds).
