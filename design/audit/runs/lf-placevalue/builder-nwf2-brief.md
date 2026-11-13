# lf-placevalue builder nwf r2 — composing:number_word_form fix round (Opus medium: rebuild after a critic FAIL, CLAUDE.md)

Branch `claude/lf-placevalue-w2` (HEAD b13543b4). Work in this tree; commit after EACH step with a message ending in
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP`,
then `git push -q origin claude/lf-placevalue-w2`. Spend cap for you: about $18. Never edit design/STATUS.md; never run
ws-stamp-assets or ws-chromebook-perf; CSS additive only; shared registries append-only; browser gates one at a time through
`tests/scripts/mq-browser-run.sh`; `node --input-type=module --check < file.js` on every JS file you change.

**Read first:** `design/audit/runs/lf-placevalue/critic-nwf1.md` (the findings N1-N9 with pages and numbers), `CLAUDE.md` (the design
contract section), `design/cards/pv/pv.md` (signed card), `js/modules/sheet/cells/words.js`, `js/modules/sheet/providers/pv.js`
(`registerSkill('composing:number_word_form'`), `js/modules/gen-algebraic.js` (number_word_form branch, ~line 2469),
`js/modules/lessons/families/placevalue.js` (routine `pv-number-words`, lesson `skill:composing:number_word_form`),
`js/modules/screen-cell.js`. Already fixed: N1, N3 (ws-words-checks wired), N4, N8.

## Fix (each with its check; a check FAILS on 2ccd5b21 and PASSES on your fix — add a `commit-pair` row to
`tests/fixtures/precritic/backtests.json` (append; keep the file's 1-space JSON indent) and run `node tests/scripts/ws-backtest.mjs --row <id>`)
1. **N9 (lead ruling: screen parity is a contract rule).** The practice card must draw the SAME kit `words` cell as print, through
   screen-cell.js, with ONE answer place. Drop gen-algebraic's legacy `q.visual` (place chart with empty boxes) for this skill.
   Check: **SCREEN-PARITY** — a kit-template skill's card / worksheet / quiz host draws the kit cell (`[data-ws-cell="words"]`), never a
   legacy cell; make it an opt-in flag of `tests/scripts/ws-empty-band.cjs` (e.g. `--screen-parity`, rule EB-PARITY, judged with
   `--rule-skills`) or a small new script.
2. **N2** True or False? with `answerSlot: 'hto'`: the claimed value never prints (boxes empty) while the key marks it. The claim must
   print in the pupil cell. Check: **CLAIM-INK** (the claimed value appears in every True or False? pupil cell, every option set).
3. **N5** the model never shows its answer (scripted-model last row, guided Model cell, opener Model cells): the provider's last
   worked step must carry the answer mark so the final model state writes it. Check: **MODEL-ANSWER** (the last model state has ink
   in the answer slot).
4. **N6** the chant "Three boxes, three digits." over 2-digit items / "one thousand"; and the lesson role must deal the lesson's own
   practice options. Fix the lesson data so the chant matches what the practice deals (or deal 3-digit items only), and make the
   lesson role honour `practice.opts`, or say precisely why it cannot (that is lesson.js / lf-engine: then record it, do not edit
   lesson.js beyond an opt-in). Check: **chant-box** (a lesson-unit assertion: the chant's box count equals every practice item's
   slot count).
5. **N7** "one hundredthirteen" in the guided model (a space dropped at a highlight split). Find the source (grep the guided /
   stepState / nameHtml paths). Check: **WORDS-TEXT** (the words cell's text, whitespace collapsed and no-break spaces normalised,
   equals `p.words`).
6. **WORDS-BREAK** (N8 is fixed): line 1 of a two-line name ends with "hundred" — add the check and its backtest.
7. **ROW-SLOT-Y** (N4 is fixed): answer slots of one grid row sit within 1 mm in y — add the check and its backtest.
8. **band=20 at S**: 20 items four across leave 45 % under the line (only ten names exist, five rows stretched). Make the page fill
   (e.g. fewer columns when the band is 20, or fewer items) so `ws-empty-band --skill composing:number_word_form --opts '{"band":20}'
   --roles independent` passes at S / M / L.

Put every new check on precritic's path through `tests/fixtures/precritic/opt-in-rules.json` (lane `lf-placevalue`; flags the tool
must contain, `--rule-skills`, or a `newRow`), as the existing rows there show.

## Before you report
- `node tests/scripts/ws-precritic.cjs --skill composing:number_word_form --strict` and list every red row with whether it is pv-owned
  or a D3 engine row (test.js / review.js / guided / scripted-model / opener / error-analysis / reason-it / mixed-practice layouts,
  lesson.js fill, screen numerals).
- `ws-detailed-lesson --check` and `--repeats` (lesson 1) OK; `ws-boot-smoke` OK; `ws-providers-unit` OK; `ws-words-checks` OK.
- Reply with: commits, each finding FIXED / NOT FIXED (why), each check id + backtest row + PASS, the precritic summary, spend.
