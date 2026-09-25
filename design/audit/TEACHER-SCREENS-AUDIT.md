# Teacher screens audit: independent design review

**Date:** 2026-09-25 · **Reviewer:** independent critic (did not write the code) · **Scope:** every screen, modal, dialog and panel a teacher can reach in teacher mode
**How:** served with `python3 -m http.server 8790`, driven by puppeteer through the real UI (`setUserRole('teacher')`, `tvGo(...)`, real clicks on the teacher controls). Screenshots at 1280 and 820 px, plus dark mode for the main screens. Every image was reviewed by eye.
**Evidence:** `/tmp/claude-0/-home-user/ae207b70-ec35-5dd2-916a-2c18c4cac7b8/scratchpad/teacher-audit/` (`NN-name-1280.png`, `-820.png`, `-dark-1280.png`)
**Bar:** the approved Home, Send a skill set and Print screens (`css/teacher.css`, `--tv-*` tokens). They should be calm, uncluttered and professional, with no game chrome, emoji, rainbow colours or crowded tile grids. The owner also wants previews wherever a skill or a type of practice is chosen.
**Scoring:** 1–10 on four dimensions. A screen passes only if all four scores are 8 or more. Where I was unsure, I scored down. "n/a" means no skill or practice type is picked on that screen; it is scored on whether the teacher can tell what they are opening.

- **D1 consistency:** matches the approved teacher style.
- **D2 clutter:** one clear job and an obvious primary action.
- **D3 ease of use:** labels, flow, targets of 44 px or more, keyboard.
- **D4 previews:** the teacher can see what a skill or practice type is before choosing it.

## Scoreboard (worst first)

| # | Screen / surface | How a teacher reaches it | Legacy? | D1 | D2 | D3 | D4 | Pass |
|---|---|---|---|---|---|---|---|---|
| 1 | **Quiz Monitor** | Quizzes → Monitor | legacy | 1 | 1 | 1 | 1 | **FAIL: broken** |
| 2 | Skills library (Skills Navigator) | sidebar → Skills library | **legacy** | 2 | 3 | 4 | 6 | FAIL |
| 3 | Classic print dialog | Print → "Classic print dialog"; Library → Print | **legacy** | 2 | 4 | 5 | 2 | FAIL |
| 4 | Quiz builder | Quizzes → Create quiz / Edit; Library → Quiz | **legacy** | 2 | 3 | 5 | 6 | FAIL |
| 5 | MAP selector + MAP setup | sidebar → MAP tests | **legacy** | 3 | 5 | 6 | 3 | FAIL |
| 6 | Online worksheet (launched by teacher) | Run practice → Online worksheet | legacy play view | 3 | 5 | 6 | n/a 6 | FAIL |
| 7 | Game view (Practice / Boss / Race on the board) | Run practice → Open on this screen | legacy play view | 3 | 5 | 6 | n/a 6 | FAIL |
| 8 | Quiz results | Quizzes → Results | **legacy** | 4 | 6 | 6 | n/a 7 | FAIL |
| 9 | Library skill-options (⚙ gear) panel | Library queue → Options | legacy | 4 | 6 | 4 | 4 | FAIL |
| 10 | Export to Google Forms modal | Classic print → Export to Google Forms; Quiz results → Google Forms | **legacy** | 5 | 7 | 4 | 5 | FAIL |
| 11 | Quiz settings modal | Quiz builder → Settings | **legacy** | 5 | 7 | 7 | n/a 7 | FAIL |
| 12 | Board-code overlay | Send → Create link → Show code on board | new | 7 | 7 | 5 | n/a 7 | FAIL |
| 13 | Skill options popover (new) | Send / Print → Options on a skill | new | 7 | 7 | 6 | 4 | FAIL |
| 14 | Progress | sidebar → Progress | new | 7 | 7 | 4 | n/a 7 | FAIL |
| 15 | Print worksheets | sidebar → Print worksheets | new (approved) | 9 | 7 | 7 | 5 | FAIL |
| 16 | Send a skill set | sidebar → Send a skill set | new (approved) | 8 | 7 | 7 | 3 | FAIL |
| 17 | Run practice | sidebar → Run practice | new | 9 | 8 | 7 | 4 | FAIL |
| 18 | Quizzes (list) | sidebar → Quizzes | new | 9 | 9 | 5 | n/a 8 | FAIL (Monitor crash) |
| 19 | Settings | sidebar → Settings | new | 9 | 9 | 7 | n/a 8 | FAIL |
| 20 | Home | sidebar → Home | new (approved) | 9 | 9 | 7 | 8 | FAIL (D3 only) |

**No teacher-reachable surface passes.** The five new shell screens (Home, Quizzes, Settings, Run, Send) are close. Most of their failures come from the few shared defects listed under "Global defects" below. Everything linked from the **Library** section of the sidebar, plus the quiz sub-screens and the classic print dialog, is still the legacy pupil-app skin inside the teacher shell.

### Legacy views still shown to teachers

- Skills Navigator
- Quiz builder, Quiz settings and Quiz results (Quiz Monitor is broken)
- MAP selector and MAP setup
- Classic print dialog
- Export to Google Forms
- Library ⚙ options panel
- Game view and online worksheet, when launched from Run practice

### Legacy surfaces that exist but have no visible teacher entry point

These surfaces still exist:

- Mixed Mode Settings (`#mixedSettingsModal`)
- Add Skills (`#addSkillsModal`)
- Simple print dialog (`openSimplePrintDialog()` throws `Cannot read properties of undefined (reading 'map')`)
- Advanced Settings side panel (`#settingsPanel`)
- My Stats (`#myStatsModal`)
- My Progress (`#progressModal`)
- Learning Stats (`#learningStatsView`)

None has a visible teacher entry point. **However,** the Advanced Settings panel is still in the keyboard tab order while it is off-screen (see G1). Also, the scrims of My Progress, Mixed settings and Advanced Settings do not cover the teacher sidebar when opened, so the sidebar stays bright and clickable behind the modal.

### Console and runtime errors

- **Quizzes → Monitor:** `TypeError: Cannot read properties of null (reading 'classList')` at `showView` (`navigation.js:59`), called from `openQuizMonitor` (`quiz-monitor.js:48`). `#quizMonitorView` does not exist in the DOM, so the button does nothing.
- **`openSimplePrintDialog()`:** throws `reading 'map'`. This is a legacy entry with no teacher link.
- **`openGoogleExportModal()` with no arguments:** throws `reading 'filter'`. The real entry points pass problems and work.
- **Everything else:** no console errors in the teacher flows I clicked through.

---

## Global defects (they affect every teacher screen)

- **G1: the keyboard leaves the teacher app and goes into hidden legacy controls.**
  - *Where:* Home, measured. The same order applies to every screen.
  - *What:* After the last control on Home ("New skill set"), Tab moves into `BUTTON.settings-panel-close` at x=1624, then `SELECT.dropdown` ×3 and "Toggle All" at x≈1340. These are the off-screen legacy Advanced Settings panel, and dozens more invisible stops follow. A keyboard user loses the focus ring completely.
  - *Fix:* when `body.teacher-mode`, set `inert` (or `hidden` / `display:none`) on `#settingsPanel`, `#settingsPanelOverlay`, `#homeView` and every closed legacy modal. Better: do not render the settings panel off-screen; close it with `hidden`.

- **G2: small targets across the new shell.**
  - *What:*
    - `tv-btn` in header and ghost variants is 36 px tall ("Teacher help", "New set", "Quiz help", "Classic print dialog", Progress range tabs).
    - Level chips are 36×36.
    - Print practice-page letter chips are **22×32**.
    - Settings switches are 44×24.
    - Run "Change" links are 19 px tall.
    - Inputs and selects are 40 px.
  - *Fix:* set a 44 px minimum on `.tv-btn`, `.tv-chip`, `.tv-seg button`, `.tv-select` and `.tv-input` (use padding, or an invisible hit-area `::after` for the switch and letter chips).

- **G3: legacy scrims do not cover the sidebar.**
  - *What:* Legacy modals and panels (Mixed settings, Advanced Settings, My Progress) dim only the right-hand area. The teacher sidebar stays live, so a teacher can navigate away with the modal still open.
  - *Fix:* give legacy overlays `z-index` above `#teacherApp` and `inset:0`, or close all legacy overlays in `tvGo()`.

- **G4: the pupil game chrome leaks into teacher surfaces.**
  - *What:* emoji, `--mq-*` rainbow palette, Nunito and 3-D "pressed" buttons. This is the root cause of D1 scores of 2–4 on every legacy screen.
  - *Fix:* re-skin with `--tv-*` tokens as listed per screen below.

- **G5: no previews in the new shell.** Library and Quiz builder have a hover preview. None of the new pickers do:
  - Send → Choose skills
  - Print → Add a skill
  - Run → One skill
  - Run → How to play
  - Print → Page type

  *Fix:* add a single shared `tvSkillPreview(categoryId, skillId, opts)` popover. It would call `generateQuestionFor({seed})` and render one sample cell in the worksheet look. Open it from a visible "eye" button on each row (click / tap, so it works on touch), and also on hover or focus after 400 ms on desktop. Page types and play modes get a static thumbnail each.

---

## Per-screen defects (worst first)

### 1. Quiz Monitor: broken
- **What:** Quizzes → a quiz row → "Monitor" throws a TypeError, because `quizMonitorView` is missing, and nothing opens. Evidence: `50-quiz-monitor-1280.png` shows the list unchanged.
- **Fix:** add a `#quizMonitorView` section in `index.html` (or have `openQuizMonitor` create it), and re-skin it with `--tv-*`. Until then, hide the Monitor button.

### 2. Skills library (legacy Skills Navigator): `23-library-*`, `24-library-preview`, `40–44`, `62-lib-gear`
- **D1:**
  - The 9-tile action grid uses emoji and a different colour on every tile: green Practice, red Boss 👹, orange Race 🏎️, purple Worksheet, blue Print, teal Share, indigo Code, pink Quiz, grey Clear.
  - The title is purple.
  - The domain chips have emoji (🔢 🥧 📐 📊 🔤 📖).
  - Each domain header has a teal or green underline.
  - Every skill pill has a coloured grade dot.
  - Queue rows have emoji (🧩 ➕ 🔢) and green "⚙ Options" pills.
  - The view has its own "← Back" button inside the shell.
- **D2:** a wall of about 600 pill buttons in 4 columns. Two rows of filters. Nine competing actions. No single primary action.
- **D3:**
  - "Share" shows the toast "Link generated! Check the share settings panel". That panel lives on the hidden pupil home, so this is a **dead end** for a teacher.
  - "Code" only copies to the clipboard and shows the code in a toast.
  - "Print" routes the teacher to the *Send a skill set* screen with the classic print dialog on top (`43-lib-print`). The context jumps.
  - The Grade filter shows **7** in a K–6 app.
  - The "All" domain chip is **invisible in light mode**: white on white. Compare `23-library-1280.png` with `23-library-dark-1280.png`.
  - Queue labels are truncated ("Add within…", "Number Se…").
  - The ⚙ options panel opens inside the narrow queue and is clipped under the action tiles, so "Done" is half hidden (`62-lib-gear`).
- **D4:** a hover preview exists (after 1.5 s), which is good. But it is desktop only; at 820 or on touch there is none. It floats over and hides the grid. Its green "Answer: 7", purple frame and "Regenerate" button are off-style.
- **Fixes:**
  1. Rebuild Library as a tv-screen: the Send screen's tree browser and search, plus a right-hand preview pane using the shared preview (G5).
  2. Replace the 9 tiles with three tv actions ("Send as link", "Print", "Run on board") plus "Make a quiz", routed through the new screens.
  3. Delete "Share" and "Code", which the Send screen already covers.
  4. Remove grade 7.
  5. Fix the contrast of the "All" chip.

### 3. Classic print dialog (legacy): `14-classic-print-dialog-*`, `43-lib-print`
- **D1:** teal header bar, purple "Auto-Group" pill, teal "#" badge, a lavender section box with a teal border, a large teal "Generate & Print" button and a Google-blue export button. The **Style** field defaults to **"Color"**, which contradicts the black-and-white worksheet contract.
- **D2:** it duplicates the new Print screen with different vocabulary ("Sets" and "Pg" against "Versions" and "Pages").
- **D3:**
  - Labels are cryptic: "Pg", "#", "GROUP".
  - Drag-to-reorder is the only reorder method.
  - The Options pills are 26 px tall.
  - There is no preview until you generate.
- **D4:** no thumbnails of layouts or skills.
- **Fix:**
  1. Fold what it still offers (worked-solution keys, "Fill blank spaces", group by strand, Google Forms) into the new Print screen's Page setup.
  2. Then remove the "Classic print dialog" link, and route Library → Print to `tvGo('print')` with the queue pre-loaded.
  3. Until then, restyle the header and buttons with `--tv-*`, and default Style to "Black & white".

### 4. Quiz builder (legacy): `21-quiz-builder-*`, `45-lib-quiz-*`, `46-qb-hover-preview`, `22-quiz-builder-settings`
- **D1:**
  - Footer buttons are all different colours: lilac Settings, purple Share Link, teal Print, orange Export JSON, pink Results.
  - Save is orange.
  - The search box has a pink border.
  - Domain chips have emoji.
  - Question cards are teal-tinted, with teal Regen, green Dup and red ✕ buttons.
  - The screen visual shows a "Column Addition" heading in a monospace font.
- **D2:** three panels plus two filter rows plus five footer actions. Save at top-right competes with the footer.
- **D3:**
  - The Grade filter shows 7.
  - The "All" domain chip is invisible in light mode.
  - Skill pills are truncated ("Number Sequence: Fill Missing (Gr").
  - The **Preview column disappears at 820**: `21-quiz-builder-820.png` has no preview.
  - Regen / Dup / ✕ buttons are about 26 px tall.
- **D4:** the hover preview exists on desktop only. A question card shows a pupil visual rather than the worksheet look.
- **Fix:**
  1. Re-skin to tv: one primary "Save quiz" button, secondary tv-btns for Settings, Share and Print, with Export and Results under a "More" menu.
  2. Put the builder inside the Quizzes screen layout.
  3. Use the shared preview with a click-to-open eye button, so it works at 820 and on touch.
  4. Remove grade 7.

### 5. MAP selector / MAP setup (legacy): `25-map-selector-*`, `51-map-k2-*`
- **D1:**
  - Gradient cards: teal for K-2 and orange for 3-5, with pressed 3-D bases.
  - Purple RIT pills with inner count badges.
  - Emoji in the mode cards (🎯 📚 📝 ♾️).
  - A large orange **START MAP SESSION** button.
  - "🖨 Print this selection" and "📋 Share Link" buttons.
  - In dark mode, the cards are white-to-black gradients (`25-map-selector-dark`).
- **D2:** the first screen is two big cards with no explanation. The setup screen is a long stack of pill rows.
- **D3:**
  - The "← Home" button duplicates the sidebar and is mislabelled (it goes to the teacher home, not the MAP home).
  - RIT jargon is not explained.
  - The "Items per session" slider has no numeric entry.
- **D4:** no sample item for a band or domain. The teacher cannot see what "RIT 171-180" looks like.
- **Fix:** rebuild as a tv-screen:
  1. A tv-seg for K-2 / 3-5.
  2. Checkbox chips for bands and domains in tv style, with a band → sample item preview.
  3. A tv-radio-card set for mode.
  4. A tv-select for item count.
  5. One indigo primary button, "Start MAP session".

### 6. Online worksheet, launched from Run practice: `18-worksheet-view-*`
- **D1:**
  - Emoji buttons: 🏠 Back, 🔄 New, 🔊.
  - Orange "✓ CHECK ALL".
  - Each cell has an orange "? Hint" and a blue "⏭ Skip".
  - A purple "Mixed practice" pill.
  - In **dark mode the page stays white while every cell header turns dark navy**, so the look is mixed.
- **D2:** three buttons repeated on every one of 20 cells. The page is noisy.
- **D3:** "Build 66. Trade 1 ten for 10 ones." shows only a blank line, so the teacher cannot tell what answer is expected. The toast overlaps the cells.
- **Fix:**
  1. Restyle the worksheet header as a tv toolbar (Back, title, "Check answers" primary).
  2. Show per-cell hint and skip only on the focused cell, or behind a single icon button.
  3. Fix dark mode: dark page with white paper cells, or paper throughout.

### 7. Game view on the board (Practice / Boss / Race): `17-game-practice-*`, `19-boss-1280`
- **D1:**
  - Emoji: 🏠 🎲 🆕 💡 🔊 ⏭ 👹 🦖 🦸.
  - Orange CHECK button, and an orange "Got it, let me try!".
  - A cyan sky banner in Boss mode.
- **D2:**
  - The header says **"🎲 Mixed Mode (All Categories)"** when 3 specific skills are running.
  - Two redundant skill badges: "M Add ≤10 NR" and "L3 · Add ≤10 NR".
  - The **"L3" level badge contradicts the skill's Level K**.
  - "NR" is jargon.
- **D3:** the "Show me how" modal opens over Q1 immediately. It tells a pupil to "Line up by place value" for 4 + 5.
- **Note:** this is the pupil-facing view and may be exempt from the teacher bar. It is still what the teacher projects, so the mislabelled header and badges should be fixed at least.
- **Fix:**
  1. Label the header with the set name.
  2. Show one badge with the plain skill label.
  3. Make "Show me how" optional on the board (or a teacher setting).

### 8. Quiz results (legacy): `49-quiz-results-*`
- **D1:** orange "Export CSV", Google-blue "Google Forms", 3-D white buttons and a lavender gradient header.
- **D2:** four equal-weight buttons. "Back" sits at the far right, after the export buttons.
- **D3:** the empty state is plain grey text with no action. Share the link from here.
- **Fix:**
  1. Use a tv-header with a "Back to quizzes" ghost button on the left.
  2. Put CSV, Import and Google under a "More" menu.
  3. Give the empty state a "Copy quiz link" primary button.

### 9. Library ⚙ skill-options panel (legacy host of the shared options UI): `62-lib-gear`
- **What:** green border, green checkbox, green "Done". It is clipped under the action tiles. Its 11–12 px grey helper text is dense.
- **Fix:** use the new popover (item 13) everywhere and retire the inline panel.

### 10. Export to Google Forms modal (legacy): `63-google-export`
- **What:**
  - The close "×" is a ~14 px native-looking button.
  - The modal is stacked on top of the classic print dialog, so there are two layers of scrim.
  - Its step tracker uses teal, which is off-palette.
  - "Sign in with Google" is a ghost button, so the primary action is not obvious.
- **Fix:**
  1. Use a tv dialog: 44 px close button, one primary "Sign in with Google" button.
  2. Open it from the new Print screen instead of from inside the classic dialog.

### 11. Quiz settings modal (legacy): `22-quiz-builder-settings`
- **What:**
  - Orange "Done".
  - Teal-filled selects and input.
  - "Print Versions" is disabled with no reason given.
  - "Randomize Order" and "Shuffle for Print" are two checkboxes that sound the same.
- **Fix:**
  1. Use tv-select and tv switches, with a primary "Done".
  2. Explain the disabled state ("Turn on Shuffle for print to make versions").
  3. Merge the two shuffle rows under one heading.

### 12. Board-code overlay: `07-board-code-overlay-*`
- **D1:** built with inline styles, not tv classes. It has no dark mode, no set name and no Maths Quest identity.
- **D3:**
  - It shows the **full enhanced code "AQ-BE-BF|T0-N20-Gp-D0-A1"**: 24 characters including a pipe `|`. A K–2 pupil on a tablet keyboard cannot reasonably type this. At 820 it wraps mid-code ("D0-" / "A1").
  - The Close button is small (~80×44 at the edge of the target minimum), with no visible focus management.
- **Fix:**
  1. Show a short classroom code: the skill part only, or a server-less short alias, with settings defaulted.
  2. Show the set name and "Go to math.cultivatingthedigital.org → Enter code".
  3. Add a QR code of the link.
  4. Use a tv-btn Close, trap focus inside the overlay, and support Esc (already supported).

### 13. Skill options popover (new): `05-skill-options-panel-*`, `60-sets-options-real-*`, `13-print-skill-options`
- **D1:** the "Done" button and checkboxes are **purple `#6d28d9`**, not the tv indigo accent. The selected row is tinted lilac.
- **D2:**
  - The header says **"Default options"** even while options are being edited.
  - The empty case says "its generator reads none of the settings an option could change". That is developer jargon.
  - The helper paragraph is a 5-line grey block.
- **D3:**
  - **At 820 the popover is clipped off the right edge.** "Done" is not visible (`05-skill-options-panel-820.png`).
  - In Print, the popover opens over the sidebar, away from its anchor (`13-print-skill-options-1280`).
- **D4:** no live sample showing what "Stacked" or "Across" does to an item.
- **Fix:**
  1. Clamp the popover to the viewport, or use a bottom sheet under 900 px.
  2. Use `--tv-accent`.
  3. Make the header the skill name, with a summary line.
  4. Replace the jargon with "This skill has no options."
  5. Add a one-cell sample that re-renders on change.
  6. Hide the Options button for skills with no options (the Send screen shows it on "Regroup with Base-10 Blocks", which has none).

### 14. Progress: `26-progress-*`
- **D3:**
  - At **1280**, the **Skill column collapses to a single "(" character**.
  - At **820**, the "Skill" and "Mode" headers **overlap** and the **Score and Result columns are cut off** (`26-progress-820.png`).
  - The whole row is italic.
- **D1:** the Mode cell has an emoji (🐉 Boss Battle) and the Result has an orange ⏸ emoji ("Exited").
- **D2:** at 1280 the table uses about 55 % of the width, and the side card holds explanatory text that the column headers should carry.
- **Fix:**
  1. Use a fixed column plan (Date / Skill / Mode / Score / Result) with `table-layout:fixed`, the Skill column taking the flexible width with ellipsis, and Day merged into Date.
  2. Below 900 px, switch to stacked row cards.
  3. Remove the emoji and italics; show result as a neutral tag ("Finished" / "Stopped").

### 15. Print worksheets (approved design): `10-print-*`, `11-print-with-skill-*`, `12-print-skill-picker-*`
- **D2:** the **sheet preview sits below both columns**. At 1280 the teacher cannot see the preview while editing sections or page setup; it starts at y≈640 only after scrolling (`11-print-with-skill-1280.png`). The approved composition should keep the preview visible, as a sticky right column or a sticky preview beside the section editor.
- **D3:**
  - The practice-page letter chips are **22×32 px**.
  - The Page type select lists **14 disabled "(coming soon)" options** among 2 working ones.
  - The "Classic print dialog" escape hatch sits in the header as if it were an equal alternative.
- **D4:** page type is chosen from a native `<select>`, with no thumbnail of what a Model, Guided or Independent page looks like. The skill search results show a name and level only, with no sample.
- **Also check:** the preview header shows **"Score ___ /1"** on a 4-skill mixed sheet. Verify that the score denominator counts items.
- **Fixes:**
  1. Replace the page-type select with a tv-radio-card grid of page thumbnails, showing only the working types, plus a "More page types coming" note.
  2. Make the letter chips 44 px.
  3. Make the preview sticky.
  4. Move "Classic print dialog" under a "More" menu.

### 16. Send a skill set (approved design): `02/03/04/06/08/61-sets-*`
- **D2:**
  - Step 3 "Send to pupils" and its primary "Create link" are **below the fold at 1280**.
  - The "Your set" column stays mostly empty white space next to a long tree.
  - After "Create link", the result is also off-screen.
- **D3:**
  - The level chips and ×1 steppers are 36 px.
  - "Clear all" is 12 px link text right beside the count.
  - The set name auto-fills as "Regroup with Base-10 Blocks + 2 more", which is not a good default name.
- **D4:** **no preview anywhere.** A teacher choosing between "Add within 20 (No Regrouping)" and "Add within 20 (With Regrouping)" cannot see a sample. This is the owner's explicit ask.
- **Fixes:**
  1. Shared preview (G5) on every tree row and set row.
  2. Make step 3 a sticky footer or a right column at 1280.
  3. Use 44 px chips.
  4. Default the set name to the date or leave it empty.

### 17. Run practice: `15-run-*`, `16-run-one-skill-*`
- **D3:**
  - The "Change" links are 19 px tall.
  - The selects are 40 px.
  - "Pupil start screen" (the Quick Start cards) is a second, unrelated job on this screen. It belongs in Settings or Send.
- **D4:** the five "How to play" cards have an icon and a one-line description, but **no picture** of what the pupils will see. "Board display" versus "Practice" is not distinguishable without trying both. The One-skill search results show no sample.
- **Fix:**
  1. Add a small screenshot thumbnail per mode, grey and in the worksheet look.
  2. Add the shared skill preview.
  3. Move the Quick Start card management to Settings.

### 18. Quizzes list: `20-quizzes-*`, `47-quiz-list-*`, `48-quiz-menu`
- Monitor is broken (see item 1).
- "Quiz help" and "Import JSON" are 36–44 px.
- "Monitor" and "Results" are ghost buttons with no border, next to a bordered "Edit" button. The hierarchy is inconsistent.
- Otherwise on-style.
- **Fix:** repair Monitor, and make all targets 44 px.

### 19. Settings: `27-settings-*`
- The switch hit area is 44×24.
- When the theme changes by any route other than this segment control, the segment stays on "Light" while the app is dark (`27-settings-dark-1280.png`). It reads state only at render time.
- "Reset adaptive difficulty" performs a destructive reset. Check that it confirms.
- **Fix:** 44 px switch hit area; re-render the Appearance segment on theme change.

### 20. Home (approved design): `01-home-*`, `52-home-with-sets-*`
- It fails D3 only, because of G1 (keyboard focus falls into the hidden legacy panel after "New skill set") and the 36 px "Teacher help" and "New set" buttons.
- The code column shows the long enhanced code, including the pipe `|`.
- Otherwise this is the reference screen.

---

## Top 10 fixes (by impact)

1. **Fix Quiz Monitor.** It crashes on click: `#quizMonitorView` is missing.
2. **Make hidden legacy UI `inert` in teacher mode.** This covers the settings panel, `#homeView` and closed modals, so keyboard focus stays in the teacher app (G1). It also closes all legacy overlays on `tvGo()` and makes scrims cover the sidebar (G3).
3. **Build one shared skill-preview popover** (click, tap or focus; sample cell from `generateQuestionFor` with a seed). Wire it into Send → Choose skills, Print → Add a skill, Run → One skill, the Library and the Quiz builder (G5 / D4).
4. **Rebuild the Skills library as a tv-screen.** Use the tree, search and preview pane, and three tv actions. Delete the 9-tile rainbow grid and the dead-end Share and Code actions.
5. **Re-skin the Quiz builder, Quiz settings and Quiz results with `--tv-*`.** One primary action each, no emoji, no grade 7, a visible "All" chip, and a preview that also works at 820.
6. **Retire the Classic print dialog.** Move its unique options (worked-solution key, fill blank spaces, group by strand, Google Forms export) into the new Print screen. Send Library → Print to `tvGo('print')`. Default to black and white.
7. **Rebuild the MAP selector and setup as a tv-screen.** Use tv-seg, chips, radio cards and one indigo primary button, with a sample item per RIT band.
8. **Print screen layout.** Make the preview sticky beside the controls. Replace the page-type `<select>` with thumbnail radio-cards of the working types only. Make the letter chips 44 px.
9. **Fix the Progress table.** Skill collapses to "(" at 1280; headers overlap and columns are cut off at 820. Remove the emoji and italics, and use row cards below 900 px.
10. **Make every tv control at least 44 px and fix the popovers.** This covers `.tv-btn`, chips, segments, switches, selects and inputs. Clamp the skill-options popover to the viewport (Done is cut off at 820), use `--tv-accent` instead of purple, and drop the jargon. Shorten the board code (no `|` or settings suffix; add the set name and a QR code).

**Also worth fixing:**
- The game header says "Mixed Mode (All Categories)", and the level badge "L3" contradicts Level K.
- In dark mode the worksheet view has a white page with dark cells.
- On the Send and Print screens, skills that have no options still show an "Options" button (for example Regroup with Base-10 Blocks).
