# Lane lf-algebra — the pilot unit's algebra skills to 8/10 (G3-Y4.B4), then round 1's patterns

**Model and effort: Opus 5.5, MEDIUM** (`mq-opus-medium`, `model: "opus"`). Step: first redesign of these skills on pairs
without a certificate (rule 0a), so medium.

**Read first:** `design/lessons-first/briefs/README.md`; `design/LESSONS_FIRST_PLAN.md` §1.3, §2.2 P5, §3 stage 1;
`design/lessons-first/QUEUE.md` units **G3-Y4.B4** (BUILD lessons "Find the rule in an input-output table" = long lesson 5,
"Two-step word problems with the four operations" = long lesson 7) and the round-1 units that use patterns
(GK-Y1.B1, G1-Y2.B1, G2-Y3.B1, G4-Y5.B3); `design/status/lessons-6-7.md:23` (multi_step_word has never had its own
redesign: 6 red precritic rows); the lesson descriptions `js/modules/lessons/detailed/g3-oa9-input-output-rule.js` and
`g3-oa8-two-step-wp.js` (which skills and options their pages deal); `design/catalogue/algebra-patterns-number-theory.md`;
`design/audit/VISUAL_QUALITY.md` (word-work sentence layout, VQ-1…10) and `design/cards/family-check/family-check.md` (the
signed word-work example).

**Branch:** `claude/sweet-newton-c8wrv1-lf-algebra` from `origin/claude/sweet-newton-c8wrv1`.

**Files owned (algebra lane, `build-list.js` LANES.algebra):** `js/modules/gen-algebraic.js`, `js/modules/gen-function-table.js`,
`js/modules/sheet/cells/{function-table,total-grid,pyramid}.js`, the algebra providers in `js/modules/sheet/providers/`,
`design/cards/function-table/`, `design/cards/two-step/` (new). Not yours: the word-work cell (visual-quality lane's, live) —
ask the lead before changing it; operations generators (lf-ops). Shared registries append-only; registry additions through
`design/lanes/lf-algebra/manifest.json`; links files as README rule 8 says.

## Scope, in this order (first the pilot's main skills)
| Skill / entry | Needed by | Note |
|---|---|---|
| `algebra:function_table_easy` | G3 "Find the rule" (lesson 5) | its options must deal every table lesson 5 prints |
| `algebra:two_step_mult_div_first`, `two_step_add_then_mult`, `two_step_add_then_div`, `two_step_letter_equation`, `two_step_estimate_check` | G3 lesson 7 | `two_step_estimate_check`: ~0.8 % answer = a story number (lesson 7 minor) |
| `algebra:multi_step_word`, `multi_step_word_plain` | G3 lesson 7 (main), G2 BUILD two-step lesson (round 2) | the `msChoose` option exists (4T); the shared "which is right" response is the compiler's (owner Q9) |
| build entry `multi_step_four_ops` (option on `multi_step_word`) | G3 lesson 7, G4-Y5.B3, G5-Y6.B2 | append to the build list if needed |
| build entry `patterns_notice` (new `patterns:notice_patterns`) | G3 lesson 4, G4 BUILD "emergent features" | a distinct task kind: also a preset skill |
| `patterns:seq_2`, `seq_5`, `seq_10`, `patterns:number_patterns_rule`, `composing:number_word_form` | GK-Y1.B1, G1-Y2.B1, G4-Y5.B3, G2 lesson 1 | only if the cap allows after the pilot skills pass |
| build entries `count_3s`, `count_50s`, `words_0_10`, `growing_shape_patterns` | round-1 units | after the above; `growing_shape_patterns` is a links-file proposal only |

`integers:order_negatives` (G5-Y6.B1) sits in the algebra lane by `laneFor`; leave it for the round-1 placevalue wave unless
the lead moves it here.

## Steps (checks first)
1. **Cards** for function-table and two-step word problems (`ws-spec-card.mjs`), every undecided line with a suggested
   answer, to the lead on day 1 for the owner's one sitting. No build on an unsigned card; meanwhile step 2.
2. **Checks first:** `ws-precritic --skill <scope> --strict` and list every red row with its cause (multi_step_word's six known
   rows: no lesson data, phone-card first-box focus, no approved sibling, wpBank page 54 mm empty strip …); a check for each
   class without one, failing on today's head, with a backtest row.
3. **Build / fix** to the signed cards; real providers (`workedSteps`, `wrongAnswer`, `misconceptions`, `strings`) — the
   compiler reads them; every option lessons 5 and 7 deal must be a skill option (DETAILED_MAKER "Skill coverage rule");
   Highest number obeyed.
4. **Clean before critic** on the branch merged with the integration tip; one independent family critic (every page type,
   M / L (size S dropped, owner 2026-11-13), keys, the three screen hosts, the option panel). PASS → `redesign-passed.js` in the same commit.

## Gates
`ws-spec-card --check-signed`, `ws-precritic --skill <scope> --strict`, `ws-content-audit --skill` each, `ws-visual-quality
--skill` each, `ws-story-lint` (word skills), `ws-screen-answer`, `ws-presets-unit`, `ws-standards`, `ws-search-terms`,
`ws-code-snapshot`, `ws-wrm --report-only`, `ws-wrm-page-unit`, `ws-lessonfit`, `ws-redesign-passed`, `ws-backtest`,
`ws-boot-smoke`, `ws-detailed-lesson --lesson g3-oa9-input-output-rule --check --repeats` (a passed lesson that deals these
skills must stay green), `ws-lessons-first-queue --check`, `node --input-type=module --check` on every touched module.

## Hand-over
`design/status/lf-algebra.md` (per skill verdict, precritic table, costs, speed-reflection lists, owner questions).
**Cap: $200** (≈ 10 %). Stop rules: README rule 11.
