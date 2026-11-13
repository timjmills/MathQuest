# lf-vocab: r8 builder brief (O-1, R7, O-2 / O-3, the minor fixes)

You are a builder on lane lf-vocab, profile mq-opus-medium. This is a rebuild after the narrow critic FAILED (min 7),
plus the owner's new rulings. Budget: about $26 of session cost.

USAGE MAY RUN OUT MID-ROUND. After EVERY step below:
- `git commit` with the trailer lines and `git push -u origin claude/sweet-newton-c8wrv1-lf-vocab`;
- add a line to the "Round 8" block at the top of design/status/lf-vocab.md.

A half-finished round must leave a pushed, working branch.

Repo: /home/user/MathQuest, branch claude/sweet-newton-c8wrv1-lf-vocab at d17f8d6a (master merged).

## Read
- The signed card, design/cards/vocabulary/vocabulary.md (2026-11-10): O-1, O-2, O-3, R-1, R-2. Do NOT edit card.json
  or the card.
- design/lanes/lf-vocab/critic-r6-narrow.md: the R7 defects.
- design/audit/LESSONS_LEARNED.md, section "lf-vocab round 7": the spec of V25+, V26, V27, V22+ and V24+.
- design/status/lf-vocab.md: the O-2 scope and conditions.

## Test setup and commit rules
Apply the manifest with `node tests/scripts/ws-integrate.mjs --apply --lanes lf-vocab`. NEVER commit what it writes:
- js/modules/data.js
- standards.js
- search-terms.js
- skill-codes-frozen.js
- skill-presets.js
- sheet/providers/index.js
- design/lanes/applied.json

Restore them before EVERY commit (`git checkout -- <files>; rm -f design/lanes/applied.json`) and re-apply after.
Run browser gates one at a time. Each check comes first: it FAILs on d17f8d6a. Each gets a backtest row in
tests/fixtures/precritic/backtests.json (fail d17f8d6a, pass your commit).

Commit trailer:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP

## Step A, O-1: the blue next box behind ONE switch (every skill's screens)
- The next answer box on the practice card, the online worksheet and the quiz is a thick blue outline that pulses
  gently, on a white fill. Lead sample: inset 0 0 0 4px #1565d8, plus a pulsing inset ring rgba(21,101,216,.30).
- ONE switch:
  - a custom property (for example --mq-next-color and --mq-next-ring on :root), or a body class, so that going back
    to yellow is a one-line change;
  - write the one line that restores yellow in a comment beside it.
- Yellow stays ONLY for R-1 right-answer feedback.
- A wrong box keeps its red (R4-3).
- prefers-reduced-motion: no pulse, a static outline.
- CSS additive: override with new rules or properties; do not delete old ones.
- Find the existing next-box / active-box pulse (the owner's 2026-10-04 rule) in css/ and screen-cell.js first.
- Check (new, browser; it may live in ws-vocab-unit --browser or a small new script on precritic's path):
  - the next box's computed outline colour is the switch's value on the card, the worksheet and the quiz;
  - flipping the switch to yellow changes it;
  - a wrong box stays red.
- Gates: the full `node tests/scripts/ws-phone-card.cjs` and `node tests/scripts/ws-screen-answer.cjs` sweeps (every
  skill, not only vocab), and `node tests/scripts/ws-sibling-compare.cjs` as precritic runs it for the vocab skills.
  Report the counts before and after. Only the outline colour may change.
- PNGs, committed and pushed AS SOON AS THEY EXIST, to design/status/lf-vocab/r8/:
  - o1-blue-next-box-card-390.png
  - o1-blue-next-box-worksheet-1280.png
  - o1-wrong-stays-red.png

## Step B, R7: the Match 3 feedback fix
- The Match 3 wrong line reads "<Word> is picture <L>! <Word> means ...". The letter is the response the pupil writes.
- Only the pictures of the wrongly matched words glow, each with its letter.
- Build V25+ (the line contains the right letter; the glow count equals the number of wrong words), V26 and V27, and the
  6 minor fixes:
  1. the "Here is how" ladder never repeats the explanation or gives a weaker hint after it (no first-letter rung;
     step 3 names the word);
  2. every wrong card shows the same feedback blocks;
  3. a pick3 wrong line carries box-wrong;
  4. the grey key halo never strokes glyphs (V22+);
  5. reword "figure(s)", "times as many" and "equal groups" (V24+: a hard-word list, at least 6 words);
  6. the render harness: full-page answered shots on every host, and a quiz answered state.

## Step C, O-2 / O-3: unambiguous pictures (library AND lesson Warm-up band)
- Before any edit, run `node tests/scripts/ws-lesson-baseline.mjs --all-lessons` (find its real name and flags under
  tests/scripts). Run it again after: ONLY the vocab cells you redraw may change.
- Redraw:
  - **step**: a short worked problem labelled Step 1 / Step 2, in the library (vocab-pictures.js) and in any lesson
    band that draws step;
  - **digit**: 472 with ONE digit circled and an arrow;
  - **place**: a hundreds-tens-ones chart with one column heading shaded.
- The owner saw the placevalue:identify lesson band (472 / H T O / four empty boxes for ones / digit / place). Its
  drawing is js/modules/sheet/lesson-pages/vocab.js; its data is the placevalue:* lesson records (find them: lessons
  families or prereqs) and the detailed lessons g2-nbt3 and g4-nbt1. You may edit those vocab entries and vocab.js.
- V-AMBIG (new, node):
  - every picture (the library's 47, and every lesson-band vocab picture in the lesson records and detailed lessons)
    declares `alsoShows`: the words it could also be read as;
  - an item or band whose other words include one of them FAILs;
  - "step" lists column (and row); a band of digit / place / ones must not let one picture show another word;
  - it must FAIL on d17f8d6a: the step staircase with column, and the band's H T O / boxes.
- Audit every picture this way and fix any clash it finds. Report the list.
- Run `node tests/scripts/ws-detailed-lesson.mjs --check` and `--repeats` (find the real script) on every lesson you
  touch.
- PNGs, as soon as they exist, to design/status/lf-vocab/r8/:
  - o2-step.png, o2-digit.png, o2-place.png: each picture alone at 40 mm;
  - o2-identify-band.png: the placevalue:identify lesson page with the new band.

## Gates before the final hand-back (manifest applied)
- ws-vocab-unit and --browser: OK
- ws-empty-band on the two skills, with and without --slot-ink off: OK
- `node tests/scripts/ws-precritic.cjs --skill vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words --strict`:
  only sibling-compare (structural) may fail
- ws-phone-card / ws-screen-answer full sweeps: no new findings
- ws-boot-smoke: OK
- ws-backtest on your rows: OK

## Renders for the narrow critic (scratchpad)
/tmp/claude-0/-home-user-MathQuest/f48f7b34-4da9-5560-ad2e-bb2137ed57c4/scratchpad/critic8/, with:
- hosts/: ws-grade-render --roles independent --size L on both skills, giving the 10 hosts and the keys;
- answered/<skill>/: answered right and wrong on card-390, worksheet-1280 and quiz-1280, full page;
- pictures/: the 47 library pictures at 40 mm;
- lesson/: the identify band page, and the pilot vocab page.

## Hand-back
Return:
- a table with one row per finding or ruling: check id | backtest row | on precritic's path | rounds it would have
  saved;
- the gate lines;
- the commits;
- the PNG paths.

If usage runs out, the last pushed step is the state. Do not run a critic. Do not touch redesign-passed.js.
