# lf-vocab: r7 builder brief (owner additions R-1 and R-2)

You are a builder on lane lf-vocab, profile mq-opus-medium (the first build of a new screen feedback state). Budget:
about $14 of session cost. Be lean.

Repo: /home/user/MathQuest, branch claude/sweet-newton-c8wrv1-lf-vocab. Do NOT merge master. Both skills PASSED critic
r5 (min 8). Do not regress them: the print pupil pages must not change at all.

## Read
- The card, design/cards/vocabulary/vocabulary.md: the owner rulings R-1 and R-2 dated 2026-11-09 (card commit 70cdbaf9,
  awaiting signature). Do NOT edit card.json or the card.
- CLAUDE.md "Key Patterns" and "CSS changes must be additive".
- The code you will touch:
  - js/modules/sheet/graphics/vocab-pictures.js
  - js/modules/sheet/lesson-pages/vocab-words.js
  - js/modules/sheet/cells/vocab-match3.js and vocab-pick3.js
  - js/modules/screen-cell.js: how a twin cell is checked and marked after an answer. Find the existing
    answered / wrong feedback hooks before adding anything.
  - js/modules/hints-speech.js (speak, and the sound toggle)
  - the feedback path in answer-check.js / worksheet.js / quiz-take.js, but only as far as the hook needs.

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

## Build (checks first; each check FAILs on 70cdbaf9, then the build, then a backtest row: fail 70cdbaf9, pass yours)

### R-1, the screen feedback highlight
- Every library picture declares its FOCAL part, the mark that shows the word: the boxed ?, the Out column, the bar's
  whole, the remainder, and so on. Reuse `referent` where it exists. Draw it so it can be targeted: a class or
  data-attribute on its SVG elements.
- After the pupil answers on a screen host (the practice card, the online worksheet and the quiz review, wherever a
  twin vocab cell gets its answered or checked state):
  - the focal part gets a thick highlight;
  - the correct word (the bank word on pick3; the word whose box is right on Match 3) glows yellow.
- Before the answer, the cell is unchanged (black and white).
- The printed PUPIL page is byte-identical to today's.
- The printed KEY shows the same focal highlight in the single grey (the kit's GREY token, never a new colour).
- Use CSS classes: new rules only, additive, scoped to the vocab cells.
- Checks (extend ws-vocab-unit):
  - V22: every one of the 47 pictures has a focal part, and it is drawn (at least one targeted SVG element per id).
  - V23 (browser): on card-390 and worksheet-1280, after an answer the focal part and the correct word carry the
    highlight; before the answer they do not; the pupil print HTML is unchanged from 70cdbaf9 (hash per seed); the
    key's highlight uses only GREY.

### R-2, the wrong-answer explanation
- In vocab-words.js add `explain` to every word: one kid-friendly reason tied to its picture, in our own words, of the
  form "<Word> means ...". It must never contradict the picture. Keep it at 14 words or fewer.
- On a WRONG screen answer, show "The answer is <word>! <explain>" under the cell, and speak it once through
  hints-speech.js speak. The existing sound toggle mutes it: never call speech when TTS is off. Use the same path the
  hints use.
- Checks:
  - V24: every word that can appear in a bank (every VOCAB_WORDS key) has an `explain`; each `explain` contains its
    own word (case-insensitive); none contains another bank word from its notWith list; each is 14 words or fewer.
  - V25 (browser): a wrong answer shows the explanation for the RIGHT word and calls speak once; with sound off it
    shows the text and does not speak (stub speak in the page); a right answer shows no explanation.

## Gates before hand-back (manifest applied)
- `node tests/scripts/ws-vocab-unit.mjs` and `node tests/scripts/ws-vocab-unit.mjs --browser`: OK
- `node tests/scripts/ws-screen-answer.cjs --skills vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words`,
  ws-phone-card and ws-chromebook-fit on the two skills: OK
- `node tests/scripts/ws-boot-smoke.cjs`: OK
- `node tests/scripts/ws-backtest.mjs --row <your rows>`: OK
- `node --input-type=module --check < file` on every changed JS file.
- Do NOT run the full precritic. The print pages are unchanged; V23's hash shows it.

## Renders for the narrow critic (write them to the scratchpad path below)
`node tests/scripts/ws-grade-render.cjs --skills vocabulary:vocab_grade_pictures,vocabulary:vocab_pick3_words --roles independent --size L --out /tmp/claude-0/-home-user-MathQuest/f48f7b34-4da9-5560-ad2e-bb2137ed57c4/scratchpad/critic7/hosts`
That gives the 10 screen hosts and the key pages. Then add, per skill, two screenshots each of card-390 and
worksheet-1280:
- after a RIGHT answer: <skill>/answered-right-390.png, answered-right-1280.png;
- after a WRONG answer, with the explanation showing: answered-wrong-390.png, answered-wrong-1280.png.

Put them under critic7/answered/.

## Hand-back
- Commit with the trailer lines and push:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
- Add a "Round 7" block at the top of design/status/lf-vocab.md with Times (UTC).
- Return a table: finding / ruling | check id | backtest row | on precritic's path? | then the gate lines, the commits
  and the render paths.
- Do not run a critic. Do not touch redesign-passed.js.
