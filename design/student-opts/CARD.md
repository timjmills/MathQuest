# Spec card — Student options (lane lf-partopts, owner request queued 2026-11-14)

Status: **UNSIGNED, waiting for the lead's signature.** The build starts at MEDIUM (a new screen) only after signing.

## 1. What the owner asked (rulings, verbatim in substance)

- O-1 When a student picks a skill (Quick Start grid, selected chips), tapping it opens the skill's options **folded**, with two
  buttons: **"Play this skill"** and **"Play all selected (N)"**.
- O-2 Start plays **every** selected skill, each with **its own** chosen options.
- O-3 Show **"You will play N skills"** before play.
- O-4 Deselecting is easy: an **✕ on each chip**.
- O-5 Choosing a game style plays all selected skills with their options.
- O-6 **Student-facing options only**: a curated subset of each skill's schema. No teacher-only or print options.
- O-7 Touch targets are **48 px**, as in the teacher parts panel.

## 2. What exists today (read from the code, 2026-11-19)

| Piece | Today | Change |
|---|---|---|
| Quick Start card tap | `addQuickSkill` toggles selection with a toast (quick-skills.js:69-102); it never plays and never opens options | Tap opens the **student options sheet** (§3) and selects the skill if it is not selected. A selected card's tap opens the sheet; it no longer silently deselects (the ✕ does that) |
| Selected chips | `#studentSkillsList` `.sel-chip` with a × button, `UnifiedSkills.removeByIndex` (quick-skills.js:194-228) | The × becomes a 48 × 48 px ✕ target with `aria-label="Remove <name>"`; tapping the chip body opens the sheet |
| Selection store | `UnifiedSkills.skills`, options in `state.skillOptionsBySkill` keyed `cat:skill` | Unchanged. The sheet writes through the store, so every host reads one source |
| Options reaching play | `playSelectedSkills` → `custom_mixed` → `lookupSetOptions` per picked skill (generate-question.js:1091-1100) | Unchanged path, now **checked** (STUDENT-OPTS-CARRY) |
| Stale mixed state | `state.isMixedMode` stays true after a first play, so a later `startGame` skips the rebuild (game-control.js:432-445) | Every student entry (sheet buttons, Start, game style cards, bottom Play) goes through `playSelectedSkills(mode)`, which rebuilds from the current selection |
| Explorer (`student-explorer.js`) | Multi-pick toggle, no options | **Out of scope** for this card (multi-pick stays fast). Its picks start at the skill's defaults and get the sheet from their chip |
| Options panel UI | `openSkillOptionsPanel` non-teacher branch (pupil simple print already uses it) | Reused as the sheet's body renderer, with the pupil filter (§4) |

## 3. The student options sheet

- Opens anchored to the tapped card or chip: a popover at 1024 px and wider, a bottom sheet at 820 px.
- Top line: the skill's pupil name (`qsPupilName`) and its grade circle.
- **Options folded**: one `<details>` row, "Change how it works", closed at open. Its summary line is the chosen options in
  plain words (`describeOptions`, pupil subset), or "Standard" when nothing is changed.
- Opened, it shows only the pupil options (§4), 48 px controls, plus "Back to standard".
- Two buttons, both 48 px tall, full width on a bottom sheet:
  - **Play this skill**: plays just this skill with its options (the selection is kept).
  - **Play all selected (N)**: plays every selected skill with its own options. Hidden when N = 1 (the first button says it all).
- Above the buttons: **"You will play N skills"** (N = 1: "You will play 1 skill").
- Esc, outside tap and a ✕ close the sheet; focus returns to the card.
- Game style row (the existing `.student-start-btn` cards) and the bottom Play button also show "You will play N skills" next to
  them, and each plays all selected through `playSelectedSkills(mode)`.

## 4. Which options a pupil sees (curated subset)

There is no audience flag in the schema today. Rule, applied by one function `pupilOptionsFor(categoryId, skillId)` in
`skill-options.js`:

- **In:** options in the `'difficulty'` group (numbers, operations, steps, task kind), and `range` when the skill offers it.
- **Out:** `'layout'`, `'appearance'`, `'more'`, `'nline'` (print layout), `'play'` (calculator and skip-after are the
  teacher's settings for the pupil), `'support'` and `level` (scaffolds the teacher sets), `hidden`, and any value gated by
  print size (`offeredAtSize`) or page role (`hiddenOnRoles`).
- **Override:** an option may declare `pupil: true` or `pupil: false` to move across the rule. Each override is listed in this
  card's decisions table when it is added.
- A skill with no pupil options shows the sheet without the folded row ("This skill has no settings to change").
- Options a teacher fixed through a link (a Quick Start card with `linkOpts`) are shown in the summary but **locked**
  ("Set by your teacher"), not editable.

## 5. Hosts and widths

Computer / Chromebook 1280 × 1000 and 1366 × 768; tablet 1024 × 768 and 820 × 1180. No 390 (owner plan). No print surface.

## 6. Checks (built first, each with a backtest row, a ledger row and a precritic home)

New gate `tests/scripts/ws-student-opts.cjs` (browser), on precritic under a new `--student` scope and in a deploy session:

- **STUDENT-OPTS-CARRY**: as a pupil, select 3 skills, set a non-default pupil option on 2 of them through the sheet, then start
  by every host: "Play this skill", "Play all selected", each game style card, the bottom Play button. Deal 12 questions per
  host. Every question's skill must be in the selection, and the options in force (`state.skillOptions` captured at each
  generate) must equal that skill's chosen options. A changed option after a first play must reach the next play (the
  stale `isMixedMode` case).
- **STUDENT-OPTS-COUNT**: the "You will play N skills" N, the "Play all selected (N)" N and the dealt skills all equal the
  selection, after adding, after ✕ on a chip and after Clear.
- **STUDENT-OPTS-PUPIL**: the sheet opens folded; it shows no option outside `pupilOptionsFor`; every control, the ✕ and both
  buttons are ≥ 48 × 48 px and take a real pointer tap at their centre (`elementFromPoint`); the sheet stays inside the window
  at all four widths; no page errors.
- **Unit**: `pupilOptionsFor` on every live skill: never returns a layout / play / support / level / hidden option, and is
  stable (a snapshot of counts per group).

## 7. Guardrails

- Teacher screens and print are unchanged (ws-teacher-* gates, ws-simple-print, boot smoke, code snapshot).
- Share codes and saved Quick Start cards keep decoding; the store keeps one option set per skill.
- CSS additive only.

## 8. Open questions for the signer

1. Tapping a **selected** Quick Start card now opens the sheet instead of deselecting (the ✕ deselects). Agree?
2. Teacher-fixed link options are **locked** for the pupil. Agree, or let pupils change them?
3. Pupil subset = difficulty group + range (no supports / level). Agree, or should pupils also turn pictures / supports on?
4. Explorer picks stay a fast multi-pick (options from the chip afterwards). Agree?

## 9. Plan and spend

Builder (MEDIUM, new screen): checks first, then the sheet, `pupilOptionsFor`, the chip ✕, the counts. Then a narrow critic
(MEDIUM) at the four widths. Lane stop: $150 above this week's start ($397.46).

### Answers (lead, under delegated owner approval, 2026-11-19)

1. Yes: tapping a selected Quick Start card opens the sheet; the ✕ deselects.
2. Yes: teacher-fixed link options are locked for the pupil (shown, greyed, with "Set by your teacher").
3. Yes: difficulty group + range only. Supports and level stay the teacher's choice.
4. Yes: Explorer stays a fast multi-pick.

Signed: owner, 2026-11-19

### Decisions table (§4 overrides and readings, added by the builder 2026-11-19 for the lead to confirm)

| # | Decision | Why |
|---|---|---|
| D1 | The `'facts'` group (the × / ÷ "Multiply by" / "Divide by" tick list) counts as difficulty for the pupil | It was the difficulty group's `constant` until lane lf-ops t15 moved it under its own heading for display order only (skill-options-ui.js OPTION_GROUPS) |
| D2 | `type: 'rows'` (the count-by rows editor) is never a pupil option | A teacher's multi-row editor (step / start / direction per row), not a single "how hard" choice |
| D3 | No `pupil: true / false` override is set on any option yet | — |
| D4 | The pupil subset is pinned: `tests/fixtures/student-opts/pupil-counts.json` (742 live skills, 690 with pupil options: difficulty 1,241, facts 5); a change moves the pin only after review (`ws-student-opts --unit --write-pin`) | §6 Unit "stable" |
