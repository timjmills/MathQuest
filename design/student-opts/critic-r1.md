# Student options screen: critic round 1 (lane lf-partopts)

Branch `claude/sweet-newton-c8wrv1-lf-studentopts` @ 03a92fa2e (master 65c28ccdf merged in). Independent critic, 2026-11-20.
I judged from my own taps and screenshots: Puppeteer through `tests/lib/ws-harness.cjs`, the app in pupil role, a mouse at
1280×1000 and 1366×768, touch at 1024×768 and 820×1180, plus a sweep of all 690 skills that have pupil options.
Evidence is in `design/student-opts/critic-r1/`.

## Verdict: FAIL

C1 is 6 at every width. Everything works: play, carry, counts, teacher lock and the regressions are all correct. Two pupil-facing
defects pull C1 down. (1) With "Change how it works" open, both Play buttons scroll out of sight on 43 to 100 skills, among
them the default Quick Start card Division Facts. (2) The pupil reads the teacher's option wording, for example "What the
items ask", "As dealt (follows the Max Number setting)" and "What the pupil reads".

| Width | C1 Ease of use | C2 Educational value | C3 Spacing / layout | C4 Standard fidelity |
|---|---|---|---|---|
| 1280 × 1000 (mouse) | **6** | 8 | 8 | 8 |
| 1366 × 768 (mouse) | **6** | 8 | **7** | 8 |
| 1024 × 768 (touch) | **6** | 8 | **7** | 8 |
| 820 × 1180 (touch) | **6** | 8 | 8 | 8 |

Gate: `node tests/scripts/ws-student-opts.cjs --widths 1280,820` on 03a92fa2e prints **`ws-student-opts: OK`**.
Unit: 742 live skills, 690 with pupil options, difficulty 1,241 and facts 5. 0 findings at either width.
The gate is green, but it does not cover F1 to F3 below.

## What passed (verified by real taps)

1. **Quick Start tap.** A tap selects the skill and opens the sheet folded: "▾ Change how it works" with "Standard" under it.
   A second tap on a selected card re-opens the sheet and the skill stays selected. The sheet is a popover at 1280, 1366 and
   1024 and a bottom sheet at 820. It stays inside the window at all four widths. Esc, the ✕ (48 × 48) and an outside tap
   all close it. Esc and ✕ return focus to the card (`data-so-key` focused). Shots: `sheet-folded-1280.png`,
   `sheet-folded-820.png`, `sheet-3sel-1024.png`.
2. **Options shown.** Only `pupilOptionsFor`. I checked addition (`add`, `add_facts`), × facts, ÷ facts, fractions
   `identify`, place value `more_less_10`, time `time_hour` / `time_quarter`, area `area`, decimals `add_decimal`, mixed
   angles, 2-D shapes and function tables. None shows a layout, print, support, level, play or hidden option. Every
   choice is ≥ 48 px tall and takes a real tap (`mult7-820.png`: "7" is a 65 × 48 label).
3. **Play.** Setup: add facts "Facts to 10", sub facts at standard, × facts "Times 7". The sheet's "Play all selected (3)"
   dealt all three skills, every × item ×7 and every + sum ≤ 10. Tapping ✕ on Subtraction and then a game style card at
   once dealt only + and ×, with no − item (no stale `isMixedMode`). Adding 8 to × facts and then the bottom ▶ Play dealt
   ×7 and ×8 items, so a changed option reaches the next game. "Play this skill" dealt only × (7 and 8). Boss, Race and
   Worksheet each dealt the selection with its options. "You will play N skills" (sheet, game style row and bottom row) and
   "Play all selected (N)" read 3, then 2 after ✕, then 1 after Clear and one add ("1 skill", "Play all" hidden).
   Same results at 1280 and 820 (touch).
4. **Teacher link.** I built a real Quick Start link with `generateQuickStartLink()` (`?qs=EW~C34-EA|A1`, ÷ facts Divide by
   3, 4) and opened it as a pupil. The sheet shows "Divide by 3, 4" disabled and greyed (opacity 0.75) with "Set by your
   teacher". Tapping the locked choices does nothing. "Back to standard" keeps `{constant:[3,4]}`. Play deals only ÷3 and
   ÷4 (`locked-1280.png`).
5. **Chips.** The ✕ is 48 × 48 with `aria-label="Remove <name>"` and removes the skill. A tap on the chip body opens the
   sheet (`kind: 'chip'`). The chip shows the chosen options ("Times: 7, 8") (`chips-1024.png`, `add10-1280.png`).
6. **Regressions.** In teacher mode, `addQuickSkill` still toggles (added, then removed) and no sheet opens. The Explorer
   multi-pick still adds three skills with `aria-pressed` and no sheet (`explorer-1280.png`). No page errors or console
   errors in any run.

## Findings

| # | Sev | Criterion / widths | Finding | Evidence | The automatic check that catches it |
|---|---|---|---|---|---|
| F1 | major | C1 + C3, all four widths | **The Play buttons scroll out of view when the fold is open.** The whole sheet scrolls and there is no sticky action row and no scroll cue. With the fold open, "Play this skill" is outside the window or the sheet for **44** skills at 1280×1000, **100** at 1366×768, **100** at 1024×768 and **43** at 820×1180 (of 690). These include the default Quick Start card **Division Facts** (1280, 820), every `mixed_*`, `mult_chart` and function tables. A pupil who opens the options no longer sees how to start. | `heavy-function_table_easy-1366.png`, `heavy-function_table_easy-820.png` | STUDENT-OPTS-PUPIL, per width: for **every** skill in `pupilOptionsFor`, open the sheet and the fold. Both `[data-so-play]` rects must be inside the viewport and inside the sheet's visible box with **no scroll**, and must hit at the centre (`elementFromPoint`). Backtest row: FAIL on 03a92fa2e (44/100/100/43), PASS on the fix (a sticky play row). |
| F2 | major | C1, all widths | **The pupil reads teacher and print wording.** The sheet reuses the teacher panel's labels unchanged. Over the 690 skills: labels "What the items ask" (195 skills), "Words on the page" (47), "What the pupil reads" / "The pupil reads" (7), "Order items ask" (2). Choices "Use the Max Number setting" (68), "As dealt (follows the Max Number setting)" (61), "Every item" / "Some items" (54), "At least one on every page" (18), "As dealt (to about 100)" (17), "None: only this step's times", "Some (1 in 6 from the steps before)", "Make your own (the rule is given, the pupil chooses the In numbers)", "First row fits two rules", "Complete the table (the rule is given, write each Out)". In total 254 label and 339 choice instances. For an ELL / SPED pupil these words do not say what changes in their game. | `opts-time_quarter.png`, `opts-area.png`, `heavy-function_table_easy-820.png` | New STUDENT-OPTS-WORDS (node, in `--unit`): no label or choice text returned for a pupil matches `/pupil\|\bitems?\b\|dealt\|setting\|\bpage\b\|step's\|steps before\|1 in \d\|teacher/i`, unless it comes from a `pupilLabel` / `pupilChoices` override. Pin the count at 0. Backtest: FAIL on 03a92fa2e (593 hits). |
| F3 | minor | C1, all widths | **The folded summary is low contrast.** The chosen options line under "Change how it works" (`.so-more-vals`, the only folded statement of what is set) and the All / None buttons are rgb(139,135,159) on white, **3.5 : 1** (AA needs 4.5 : 1), at 14.4 px and 15.2 px. All / None look disabled. The locked note "Set by your teacher" is small light grey text (about 11 px in `locked-1280.png`). | `sheet-open-1366.png`, `locked-1280.png` | PUPIL: computed contrast ≥ 4.5 : 1 and font ≥ 14 px for `.so-more-vals`, the sheet's All / None buttons and the lock note. |
| F4 | minor | C2, all widths | **The rule is applied unevenly to "How it is written".** On ÷ facts (`divForm`, difficulty group) the pupil can change "How it is written" (long division / fraction / vertical / "Mix (one third each: …"). On + and × the option with the same label (`notation`, layout group) is withheld as a layout option. This is a format choice with long technical choice text, offered on 3 skills. | `locked-1280.png` | UNIT: a pupil option whose label is also the label of a non-pupil (layout) option elsewhere fails, unless the decisions table lists a `pupil:` override. Either set `divForm` `pupil:false` (D5) or justify it in the table. |
| F5 | minor | C3, 1366 / 1024 (and 1280 for a right-hand card) | **The popover covers its own card.** When the open fold does not fit below the card, the popover is pinned to the window edge on top of the card it belongs to, and of the chip row. The header repeats the name and the grade circle, so this is not confusing, but the anchor is lost. | `sheet-open-1366.png`, `locked-1280.png` | PUPIL: with the fold open, the sheet rect does not intersect the anchor card's rect when there is room on the other side (left / right placement). Otherwise record it as an allowed fallback. |
| F6 | minor | C3, all widths | **Toasts stack.** Each pupil tap still fires "✓ Added …!". Taps in quick succession stack two or three toasts on top of each other, so they cannot be read. They sit under the sheet and do not cover its buttons. The sheet already says what happened. | `chips-1024.png` | PUPIL: after 3 quick card taps, no two visible `.mq-notify` rects overlap. Better still, no "Added" toast while the sheet opens for that skill. |
| F7 | minor | C1, all widths | **The name changes between card and sheet.** The card says "Mult Facts", but the sheet and chip say "Multiplication Facts (1-12)". | `sheet-3sel-1024.png` | PUPIL: the sheet's `.so-name` equals the tapped card's visible name (`qsPupilName` of the card). |

## Decisions D1 / D2

- **D1 (`facts` counts as difficulty): agree.** "Times" and "Divide by" are the main how-hard choices a pupil makes on fact
  skills. The play results above show they carry correctly.
- **D2 (`type: 'rows'` never pupil): agree.** It is a multi-row teacher editor, not a single choice.
- D3 / D4: no objection. **F4 needs a new decision row**, `divForm` in or out, written into the table either way.

## What the builder should do next (round 2)

1. Make the play row (count line and both buttons) sticky at the bottom of the sheet, so only the fold scrolls. Add the
   F1 sweep to the gate first and backtest it.
2. Give pupil-facing wording to the 593 hits: a `pupilLabel` / `pupilChoices` layer, or a pupil phrase map in
   `student-options.js`. Add the F2 lint first.
3. F3 to F7 are small. Fix them in the same change and add each check.

## Speed reflection (owner rule)

- Both major findings sit **outside what the gate measured**. The gate opens the sheet only for its 3 fixed skills and
  never reads the words. A sweep over every pupil skill (about 30 s per width) and a wording lint would have caught both
  before the critic. Precritic rule: when a screen renders data-driven content, its gate sweeps **all** the data, not a
  sample.
- The wording defect comes from reusing the teacher panel's renderer, which was a good engineering choice, without asking
  who reads the words. Add a line to card templates for pupil screens: "Who reads every string?"
