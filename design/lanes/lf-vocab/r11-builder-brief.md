# lf-vocab r11 builder brief (rule 5 stop after narrow critic r10: FAIL, min 7)

Step: a FRESH builder (Opus medium) on the ROOT CAUSE. This is the last vocab round this week, cap $30: stop and report if
you reach it.

The look-alike class ("a picture fits another dealt word") failed rounds r6, r7, r9 and r10. Each time, one derived rule was
written after the critic found its case, and each word swap made a new case.

Read:
- design/lanes/lf-vocab/critic-r10-narrow.md, critic-r9-narrow.md and critic-r7-narrow.md;
- the signed card, design/cards/vocabulary/vocabulary.md (O-2, O-3);
- design/audit/LESSONS_LEARNED.md (the lf-vocab r9-10 rows, PRE-FLIGHT);
- js/modules/sheet/graphics/vocab-pictures.js (`vocabPictureDerived`, `derivedFromBody`, `vocabPictureTeaches`);
- js/modules/sheet/lesson-pages/vocab-words.js (`notWith`, `explain`, the sets);
- tests/scripts/ws-vocab-unit.mjs (V5, V7, V-AMBIG+, V-FIT, V-FIT6).

First: merge origin/master (eef75f5d or later). Then re-apply the manifest:
`node tests/scripts/ws-integrate.mjs --apply --lanes lf-vocab`.

## Items (one commit and push each, each with its check and a backtest row FAIL → PASS)
1. **V-FEAT replaces the derived rule list.**
   - Every picture DECLARES the features it draws. Use a closed vocabulary, e.g. rising-run, falling-run, step:<d>,
     loop-numbers, loop-shapes, arrow-into-box, arrow-out-of-box, numbers-at-ends, equals, boxed-number, question-mark,
     groups-of:<n>, array, row-ringed, column-ringed, lone-mark, bar-pair, bracket, ...
   - The features are CHECKED against the SVG: V-FEAT fails a picture whose SVG draws a feature it does not declare,
     wherever the feature can be read from the markup.
   - Every word DECLARES its defining features: a set of alternatives, each a set of features. "grow" = rising-run;
     "rule" = step:<d> or arrow-into-box; "input"/"output" = arrow-into-box + numbers-at-ends; "sequence"/"pattern" =
     any run or loop-numbers; and so on.
   - A clash is a co-dealt (same set, same item) picture P of word A whose features satisfy word B's definition, B ≠ A,
     unless the pair is in notWith and the dealer keeps them apart. Every clash FAILs.
   - BACKTEST: one row per historic case, each FAILing on its commit and PASSing on yours:
     - r6/r7 cases (rows/columns/odd/array, etc.) on d17f8d6a or 3d90097d;
     - r9 rule ≈ input/output and cycle ≈ sequence on 6ae462d1;
     - r10 term/first term ≈ grow and term ≈ rule on 03eddcc2.
   - Delete the old derived-rule code once V-FEAT covers it.
2. **The escape hatch (lead ruling).** If a word cannot get a picture that passes V-FEAT against its set, do NOT redraw it
   again. Drop it from that set's PICTURE items: it stays in the word bank and in the explanation. Record each drop in the
   set with a comment. One clean set beats another round. Prefer the critic's redraws where they pass (item 4); use the
   hatch otherwise.
3. **V-REF:** a referent lint. Every mark an explain line names ("the 12 in the box", "ones digits", "the one drawn round",
   "the ?") must be drawn in its own picture, and must not be drawn in a picture co-dealt with it unless the pair is
   notWith. FAIL on 03eddcc2 (cycle's "ones digits"; unknown's "the one in the box" vs factor's boxed numbers).
   **NB9 (ws-next-box):** after Check, the active element is not a vocab slot (Check blurs the vocab slots). FAIL on 03eddcc2.
4. **The critic's fixes, held by the checks above:**
   - term → 18, [14], 10;
   - first term → [30], 25, 20, with their explain lines updated;
   - cycle explain → "Cycle means it goes round and back to the start: circle, square, triangle, diamond, then circle
     again.";
   - unknown explain → "the number we must find, the ? in the box".
   Any word V-FEAT still flags in a set goes through the hatch (item 2).
5. **Renders:** extend the render harness, or add a script, so that every set changed since 6ae462d1 is rendered on both
   skills (independent, at L). The output goes to
   /tmp/claude-0/-home-user-MathQuest/f48f7b34-4da9-5560-ad2e-bb2137ed57c4/scratchpad/r11/sets/.

## Rules
- Gates, one at a time:
  - precritic --strict on both skills, clean except sibling-compare;
  - ws-vocab-unit, plus --browser;
  - ws-next-box;
  - both ws-empty-band modes;
  - boot-smoke;
  - ws-backtest for every new row.
- Re-pin V23 only for the pages your changes move, and list them with their cause.
- NEVER commit js/modules/data.js, standards.js, search-terms.js, skill-codes-frozen.js, skill-presets.js,
  sheet/providers/index.js or design/lanes/applied.json. Use git add with explicit paths only.
- Commit trailer, exactly:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
- Push after every commit.

Report:
- a per-item table: item | check id | backtest row fail → pass | on precritic's path | rounds saved;
- every hatch drop;
- the gate lines;
- the commits;
- anything for the lead.
