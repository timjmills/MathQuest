# lf-vocab r10 builder brief (after narrow critic r9: FAIL, min 7)

Step: rebuild after a failed critic round. This is a FRESH builder (Opus medium), under rule 5. The class "a picture or a
word that fits another bank word" has survived r6, r7 and r9. Its root cause: O-3 was checked against hand-listed and then
rule-derived look-alikes. Nothing checked that a swapped word still TEACHES its set's standard, and the derived rules
missed arrows-with-numbers and loops-of-numbers.

Read:
- design/lanes/lf-vocab/critic-r9-narrow.md;
- the signed card, design/cards/vocabulary/vocabulary.md;
- design/audit/LESSONS_LEARNED.md (PRE-FLIGHT);
- js/modules/sheet/graphics/vocab-pictures.js (`vocabPictureDerived`) and js/modules/sheet/lesson-pages/vocab-words.js.

## Fixes (one commit and push each, with its check and a backtest row FAIL → PASS)
1. **Defect 2, rule.** Its picture 2 → [+3] → 5 reads as input/output.
   - Redraw rule so it shows only the rule: the box with "+3" and arrows, no numbers at the ends.
   - ALSO add a derived rule to `vocabPictureDerived`: an arrow into and out of a box, with numbers at both ends, adds
     input and output.
   - Check: V-AMBIG+ gets the new derived rule. The old drawing must FAIL it.
2. **Defect 3, cycle.** Redraw cycle as a loop of shapes, with no run of numbers. Add a derived rule: a loop of three or
   more numbers adds sequence and pattern.
3. **Defect 4, times as many.** The set's words become `['times as many','factor','product','compare','multiple','unknown']`.
   Edit them in place; the set keeps its position (V7). Both trios must be clash-free.
4. **Defect 5.**
   - follow a rule (set 8): replace output with a word that teaches extending a pattern by a rule. "grow" is the
     critic's suggestion; it must be clash-free.
   - growing patterns (set 7): replace total with a word whose picture matches the lesson. Take one from the set's
     standard, or draw a picture of a growing stack's total.
5. **Root-cause check, V-FIT (new, ws-vocab-unit).** Every core word (the first three) of every set must have a picture
   whose declared standard or operation matches the set's standard. Give each picture a `ccss` / `op` field; the set
   already has its lesson's code. V-FIT must FAIL on 6ae462d1's times-as-many set (total = the 5 + 3 bar) and PASS after.
6. **Defect 1 (minor).**
   - The wrong-box style beats focus on vocab slots: the red fill and outline stay when the box is focused.
   - The quiz right slots carry the card's green tick.
   - Add the check to ws-next-box (NB8). It is additive CSS.
7. **Defect 6 (the evidence gap).** The identify lesson is lessons/families/placevalue.js 'pv-identify'. Find how its
   vocab band renders (the r8 PNG design/status/lf-vocab/r8/o2-identify-band.png was made somehow; check
   ws-detailed-lesson and the r8 commits). Add a render mode or script that writes the band's pupil and key PNGs for a
   NAMED lesson. It must FAIL when the page title is not that lesson's title or the body is nearly empty. Produce
   RENDERS out/lesson/identify-L-pupil-1.png and -key-1.png with it.

## Rules
- Run the gates one at a time; never two browser gates at once.
- precritic --strict on both skills must be clean except sibling-compare, on the branch merged with current master
  (73e96fc1 or later: merge it FIRST, before fix 1).
- ws-vocab-unit, plus --browser; ws-next-box; both ws-empty-band modes; boot-smoke.
- Re-pin V23 hashes only for the pages your changes move, and list them.
- NEVER commit js/modules/data.js, standards.js, search-terms.js, skill-codes-frozen.js, skill-presets.js,
  sheet/providers/index.js or design/lanes/applied.json. After a merge, re-apply with
  `node tests/scripts/ws-integrate.mjs --apply --lanes lf-vocab`. Use git add with explicit paths only.
- Commit trailer, exactly:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
- Push after every commit.
- Budget: about $15. Stop and report if you reach it.

Report: a per-item table (item | check id | backtest row fail → pass | on precritic's path | rounds saved), the gate
lines, the commits, and anything that needs a lead decision.
