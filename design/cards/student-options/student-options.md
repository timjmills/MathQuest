# Student skill options: design card

Lane `lf-tools-stuopts` · step: DESIGN ONLY (no feature code) · 2026-11-14 · Opus medium (first build of a new screen part).
Status: **signed** (owner answers 2026-11-14 recorded; lead signs under delegated approval).
Mock: `design/status/lf-checks/student-options/mock.html` (`#folded`, `#expanded`, `#off`, `#none`), screenshots
`folded|expanded|off-1024.png` and `-1366.png` beside it (768 px wide viewport height, full page, deviceScaleFactor 2).

## 0. Owner rulings

| Date | Ruling |
|---|---|
| 2026-11-14 | **Two Play buttons.** The panel offers "▶ Play this skill" and "▶ Play all selected (N skills)" with the count. Each selected skill carries its own chosen options. Deselecting must be easy: a visible ✓ / ✕ on each selected skill card, plus a list of the N selected skills, each with ✕. The game-style buttons (Practice / Boss / Race / Worksheet) also play ALL selected skills, each with its own options, and show "N skills". |
| 2026-11-14 | **Options start FOLDED** behind the summary line every time the panel opens. |

## 1. Owner request

- On the student page, tapping a skill opens a small panel: a **big Start button at the top**, then that skill's
  **options below, collapsed or compact**, using the same shared skill-options code teachers use.
- The choices **travel with the share code** (`skill-codes.js`).
- A new teacher setting, **"Let students change options"**, default **ON**. When OFF, the panel shows only Start.

## 2. What exists today (read before building)

| Piece | File | Today |
|---|---|---|
| Quick Start cards | `js/modules/quick-skills.js` `_renderQuickSkillsGridNow` | A tap calls `addQuickSkill()`, which toggles the skill in `UnifiedSkills` (multi-select). The pupil then presses one of four `.student-start-btn` (index.html ~761, `startMode(mode)` in `mode-selection.js`). |
| Explorer cards | `js/modules/student-explorer.js` `toggle(card)` | Same multi-select into `UnifiedSkills`; no options. |
| Options engine | `js/modules/skill-options.js` | Schema per skill (`addition:add_facts` L1065: `constant`, `notation`, `band`, `support` (+ `cover`, `mix`, `nlOn`)), `normalizeOptions`, `packOptions`, `describeOptions`. |
| Shared options UI | `js/modules/skill-options-ui.js` | `registerSkillOptionsHost(id, {entry, read, write, rerender})`, `skoToggle/skoEdit/skoReset`, `applyOptionEdit`, `OPTION_GROUPS`, `optionControlHTML`. The teacher popover (`.tv-sko`, `css/teacher.css` L723) is host `popover`. Quick Start already registers host `qs` (writes `card.opts`). |
| Share code | `js/modules/skill-option-codec.js`, `skill-codes.js` | A skill carries `~payload` of what differs from default (`EA~C78`). The `queue` host encodes each queue entry's `opts`. |
| Teacher settings | `js/modules/teacher-shell.js` `renderSettings`, card "Pupil practice" (`tvPupilH`) | `tv-setting` rows with `sw(id, on, labelId, descId)` switches; `onSettingsClick`. |

## 3. Anatomy (top to bottom)

The panel is a full-width row inserted **in the grid, directly after the row holding the tapped card**
(`grid-column: 1 / -1`), with a caret pointing at that card. One panel open at a time.

1. **Head**: the skill's pupil name (`qsPupilName`, 1.3rem / 900 Nunito), and a Close button (48 × 48, `×`).
2. **Two Play buttons** (the primary actions, always first; owner 2026-11-14), side by side at 1024 and 1366,
   each ≥ 72 px tall, orange (`--mq-orange`, 6 px `--mq-orange-d` press shadow, the `.student-start-btn` look):
   - **"▶ Play this skill"**: plays the tapped skill alone, with its options;
   - **"▶ Play all selected"** with a sub-line **"N skills"**: plays every selected skill, each with its own options.
     Shown only when N ≥ 2 (with N = 1 it is the same as the first button). Both play practice mode.
2b. **Selected list** (when N ≥ 2): "Selected (N)" then one chip per selected skill, its pupil name and a ✕ button
   (48 × 48, `aria-label="Remove <name>"`). ✕ deselects the skill (the queue entry and the card update together).
3. **"Change it" disclosure, FOLDED by default** (owner 2026-11-14) (only when options are allowed AND the skill offers pupil options): a 56 px bar
   with ⚙, "Change it", the one-line summary from `describeOptions` ("Add 7, 8 · Facts to 20 · Stacked"), and a
   chevron. `aria-expanded` / `aria-controls`.
4. **Option rows** (inside the disclosure): label (1.1rem / 900) over a row of **chips**. Number values are in
   **Andika**, black on white with a 2 px ink border; a chosen chip is filled ink `#2B2840` with white text and a
   ✓ (colour is never the only cue). Multi-choice (`set`) rows are toggle buttons (`aria-pressed`) with an "All"
   chip first; single-choice (`enum`) rows are `role=radiogroup` / `role=radio` (`aria-checked`).
   A notation chip shows a tiny worked example (stacked `8 / + 7` with rule, or `8 + 7 =`) beside its word.
5. **Foot**: "↺ Back to my teacher's choice" (48 px), which restores the card's teacher options.

House style: student page chrome stays Nunito with the brand purple border (`--mq-purple`, `--mq-purple-d` shadow);
the question-content parts (digits, worked example) use Andika black and white, per `WORKSHEET_DESIGN_STANDARD.md`.
New CSS lives in a new `css/student-options.css` scoped to `.stu-sko` (additive only).

**Selected cards** (owner 2026-11-14): each selected Quick Start / explorer card shows a ✓ badge and a ✕ button
(48 × 48, top right, `aria-label="Remove <name>"`). ✕ deselects without opening the panel. Tapping the card body
opens the panel. The four mode buttons below the grid read "Start practice · 3 skills" and play every selected
skill with its own options.

## 4. Which options a pupil sees

Not every teacher control belongs on a pupil panel. Show the **difficulty** group and the **layout** group
(`OPTION_GROUPS`), and **support** choices that add help; hide teacher-page controls (how a support is spread
over a page: `cover`, `mix`, `nlOn`, page/print-only options, locked options).

- Rule: an option is pupil-visible when its def has `pupil: true`, else when its group is `difficulty` or `layout`
  or its id is `support`, and it is not in `PUPIL_HIDE = ['cover','mix','nlOn', ...print-only]`.
- New helper `pupilOptionsFor(cat, skill)` in `skill-options-ui.js` = `nameFitOptions(offeredOptionsFor(...))`
  filtered by that rule. `skillHasPupilOptions()` drives state 4.
- Pupil labels: a def may carry `pupilLabel` / value `pl` (short words: "Help" for Support, "How it looks" for
  notation, "Touch dots" for the long teacher line). Fallback is the teacher label.
- A skill name is its declaration: a pupil cannot pick a value that breaks the skill's name (`nameFitOptions`
  already enforces this).

## 5. States

| State | When | Shows |
|---|---|---|
| **Folded** (`folded-*.png`), the default each time the panel opens | tap on a card | head, both Play buttons, selected list with ✕, disclosure bar with summary |
| **Expanded** (`expanded-*.png`) | pupil pressed "Change it" | as folded, plus the option rows and reset |
| **Setting off** (`off-*.png`) | teacher turned "Let students change options" OFF | head, Play buttons and selected list only. The teacher's own card options still apply. |
| **No options** (`#none` in the mock) | `skillHasPupilOptions()` is false | as setting off |
| Link-locked | the card came from a link with `linkOpts` and Quick Start is locked | as setting off |

The disclosure always opens folded (owner 2026-11-14); it is not remembered.

## 6. Data flow: choices to the game and to the share code

1. A new options host **`stu`** registered in `quick-skills.js` (and one in `student-explorer.js` for explorer cards):
   - `entry(i)` → the card's `{categoryId, skillId}`;
   - `read(i)` → `card.pupilOpts ?? card.opts ?? {}` (the pupil's own choice, else the teacher's);
   - `write(i, packed)` → `card.pupilOpts = packed` (empty → delete), `saveQuickSkills()`. The teacher's
     `card.opts` is never overwritten by a pupil. Reset deletes `pupilOpts`.
   - Edits go through the shared `applyOptionEdit` so the teacher and pupil panels cannot drift.
2. **Selecting** a card adds it to `UnifiedSkills` with `opts: read(i)`; every later edit in the panel writes the
   card's `pupilOpts` AND updates that queue entry's `opts`, so each selected skill keeps its own options.
   **Play this skill**: run the game on a one-entry list `[{..., opts: read(i)}]` without clearing the selection.
   **Play all selected** and the four mode buttons: `startMode(mode)` on the whole queue; each entry already carries
   its own `opts`. The mode buttons' labels gain "· N skills" (`updateStudentStartCount()` on every queue change).
3. **Share code**: no codec change. The queue entry carries `opts`; `skill-codes.js` already writes them as the
   `~payload` suffix (only what differs from default), so "Send" from the selection row and any code built from
   the queue carry the pupil's choice. Old codes decode unchanged.
4. **Setting OFF**: `read(i)` ignores `pupilOpts` and returns `card.opts`, so a choice made before the teacher
   switched it off cannot leak into play or a code.

## 7. The teacher setting

- Where: Teacher view → Settings → card **"Pupil practice"** (`teacher-shell.js` `renderSettings`), a new
  `tv-setting tv-divided` row after "Sound effects":
  **"Let students change options"** — caption "Students can change a skill's numbers and help before they start.
  Your choices stay the default." — switch `sw('tvPupilOpts', on, 'tvPoL', 'tvPoD')`.
- Storage: `state.pupilOptionsAllowed` (default `true`), saved with the other settings cookie
  (`storage.js`, key `mathquest_pupil_opts`, `'0'` / `'1'`); read on boot in `init.js`.
- A class code can force it: the existing settings-code tail may gain a flag later (out of scope; open question 3).

## 8. Touch, keyboard, focus

- **Targets**: every control in the panel is **≥ 48 × 48 px** at 820, 1024 and 1366 (Close 48, chips 48,
  disclosure 56, reset 48, Play buttons ≥ 72, ✕ buttons 48). Gap between chips 8 px. No phone width (FASTEST plan rule 7).
- No horizontal scroll at 820 / 1024 / 1366; chip rows wrap.
- **Keyboard**: cards become `role=button tabindex=0` with `aria-expanded` + `aria-controls="stuSko"`;
  Enter / Space opens. On open, focus moves to **Play this skill**. Tab order: **Play this skill → Play all selected → selected-list ✕ buttons →
  Change it → chips row by row → Back to my teacher's choice → Close**. Close is last in tab order though first visually on the right, so a
  pupil's first Tab never leaves the panel; Escape closes from anywhere in the panel and returns focus to the card.
- Radio rows: arrow keys move within the row (roving tabindex); toggle rows: each chip is a tab stop.
- `:focus-visible` 4 px blue ring, 3 px offset. The summary line is `aria-live="polite"` so a change is read out.
- Read-aloud: if TTS is on, "Play this skill" has the pupil name in its accessible name ("Play Addition Facts").

## 9. Files to change (build step)

| File | Change |
|---|---|
| `js/modules/skill-options-ui.js` | `pupilOptionsFor`, `skillHasPupilOptions`, `pupilPanelHTML(hostId, idx, cat, skill)` (chips view of the same defs, same `skoEdit` handlers) |
| `js/modules/skill-options.js` | optional `pupil`, `pupilLabel`, value `pl` on defs (add_facts first) |
| `js/modules/quick-skills.js` | host `stu`; student-mode card tap opens the panel (teacher mode unchanged); panel insertion after the card's row; handlers for the two Play buttons, the selected list and the card ✓ / ✕; "N skills" on the mode buttons |
| `js/modules/student-explorer.js` | same panel for explorer cards (phase 2 if the round is tight) |
| `js/modules/teacher-shell.js` | the settings row and its click handler |
| `js/modules/state.js`, `storage.js`, `init.js` | `pupilOptionsAllowed` default true, persisted |
| `js/globals.js` | window exports for new handlers (`stuSkoOpen`, `stuSkoPlayOne`, `stuSkoPlayAll`, `stuSkoDeselect`, `stuSkoClose`) |
| `css/student-options.css` (new) + `index.html` `<link>` | `.stu-sko*` rules from the mock; then `ws-stamp-assets` |

## 10. Checks to write first (they fail before the build)

1. `tests/scripts/ws-stu-options.mjs` (Playwright, one browser at a time), at 820×1180, 1024×768, 1366×768:
   - student mode, tap Addition Facts → `.stu-sko` visible, focus on "Play this skill"; disclosure `aria-expanded=false`;
   - select 3 skills → "Play all selected" reads "3 skills", the selected list has 3 ✕ buttons, each selected card
     shows ✓ and ✕, the mode buttons read "3 skills"; ✕ on a list chip and ✕ on a card each drop N to 2;
   - give skill A `{constant:[7,8]}` and skill B different options → Play all → items from A all add 7 or 8 and B's
     items honour B's options;
   - every visible control in `.stu-sko` ≥ 48 × 48; no horizontal scroll;
   - "Change it" expands; chips for `constant` 0–13 present; teacher-only ids (`cover`, `mix`) absent;
   - pick 7 and 8 → Play this skill → `state` queue entry opts `{constant:[7,8]}` and the first 10 questions all add 7 or 8;
   - Send link from the selection row contains `~C78`; decoding it restores `{constant:[7,8]}`;
   - setting OFF (`state.pupilOptionsAllowed=false`) → no `.stu-sko-more`, Play this skill plays with `card.opts` even if `pupilOpts` is set;
   - Escape closes and returns focus to the card; Tab cycles inside the panel order of §8;
   - teacher-mode card tap still toggles selection only (no regression); zero console errors.
2. Unit (node): `pupilOptionsFor('addition','add_facts')` ids = `constant, band, notation, support`; the host
   `write` never touches `card.opts`.
3. Existing gates stay green: `ws-boot-smoke`, `ws-code-snapshot` (no code moved), `ws-content-audit --category addition`,
   `ws-stamp-assets --check`, `ws-precritic --strict` on the touched files.

## 11. Open questions for the owner

1. **Mode.** Recommended: both Play buttons = practice; boss / race / worksheet stay on the four mode buttons below (which play all selected).
2. **Per-class lock in the link.** Recommended: later; the device setting is enough for round 1.
3. **Support choices for pupils.** Recommended: show them ("Help"), since a pupil asking for touch dots is the point.

Signed: owner, 2026-11-14
