# Teacher screens audit, round 2: independent re-grade

**Date:** 2026-09-25 · **Reviewer:** independent critic (did not write the code) · **Round 1:** `design/audit/TEACHER-SCREENS-AUDIT.md`
**How:** served with `python3 -m http.server 8794`, driven by puppeteer through the real UI (`setUserRole('teacher')`, `tvGo(...)`, real mouse clicks, typing and Tab/Esc). Screens at 1280 and 820 px, dark mode for the main ones. Target sizes measured from `getBoundingClientRect`, tab order walked, console and page errors collected on every pass (none were raised).
**Evidence:** `/tmp/claude-0/-home-user/ae207b70-ec35-5dd2-916a-2c18c4cac7b8/scratchpad/teacher-audit-r2/` (`p1-*` every screen at both widths plus dark, `p2-*` Send, `p3-*` Print, `p4-*` Run + game + worksheet, `p5-*` Library + MAP, `p6/p7/p8-*` Quizzes, Progress, Settings, `p9/p10-*` extras). Scripts are in `../r2/`.
**Bar and scoring:** unchanged from round 1. D1 consistency with the approved teacher style, D2 clutter / one clear job, D3 ease of use (labels, flow, 44 px, keyboard), D4 previews where a skill or practice type is chosen. 1–10 each; **pass = all four at 8 or more**. When unsure I scored down.

## What changed since round 1

Real progress. The shell-wide defects are fixed:

- **G1 fixed.** Tab now cycles sidebar → screen → back to the brand link. No focus reaches the hidden legacy panel.
- **G2 mostly fixed.** Every tv control I measured is 44 px tall. The remaining small targets are listed per screen (5 left).
- **G5 fixed.** One shared preview now serves Send (list hover and Thumbnails), Print → Add a skill, Run → One skill and the five "How to play" cards, the Library detail pane, and the options popover.
- **Rebuilt as tv screens:** Skills library (with a standards coverage view), MAP tests, Quiz builder, Quiz settings, Quiz results and Quiz monitor. The Monitor no longer crashes.
- **Classic print dialog retired.** Its unique options now sit in a collapsed "Auto-layout worksheet and Google Forms" section on the Print screen.
- **Other fixes:**
  - The board code is short ("AY-BH-BJ").
  - The set name starts empty.
  - The Send step 3 has a sticky bar.
  - The Print preview is sticky beside the controls at 1280.
  - The page type is a card grid with thumbnails.
  - Progress rows are clean, with no emoji and stacked cards at 820.
  - The Settings theme segment now follows the real theme.
  - The online worksheet's dark mode is consistent.

## Scoreboard (worst first)

| # | Screen / surface | How a teacher reaches it | D1 | D2 | D3 | D4 | Pass |
|---|---|---|---|---|---|---|---|
| 1 | **Quizzes list: row "More" menu** | Quizzes → ⋯ on a quiz row | 9 | 9 | **2** | n/a 8 | **FAIL: broken** |
| 2 | MAP session (launched by teacher) | MAP tests → Start MAP session | 3 | 5 | 5 | n/a 6 | FAIL |
| 3 | Game view (Practice / Boss / Race / Board display) | Run practice → Open on this screen | 3 | 5 | 5 | n/a 6 | FAIL |
| 4 | Online worksheet (launched by teacher) | Run practice → Online worksheet → Open | 3 | 5 | 6 | n/a 6 | FAIL |
| 5 | Export to Google Forms modal | Quiz results → More → Google Forms; Print → Auto-layout → Export | 8 | 8 | 5 | n/a 7 | FAIL |
| 6 | Quiz monitor | Quizzes → Monitor | 6 | 9 | 8 | n/a 8 | FAIL |
| 7 | Print worksheets | sidebar → Print worksheets | 9 | 6 | 6 | 8 | FAIL |
| 8 | Skill options popover | Send / Print / Library → Options | 8 | 7 | 8 | 7 | FAIL |
| 9 | Quiz builder | Quizzes → Create quiz / Edit | 8 | 7 | 7 | 8 | FAIL |
| 10 | Skills library (list, thumbnails, detail) | sidebar → Skills library | 9 | 8 | 7 | 7 | FAIL |
| 11 | Standards coverage | Library → Standards coverage | 9 | 8 | 7 | n/a 8 | FAIL |
| 12 | MAP tests (setup) | sidebar → MAP tests | 9 | 8 | 7 | 8 | FAIL |
| 13 | Run practice | sidebar → Run practice | 9 | 7 | 8 | 9 | FAIL (D2) |
| 14 | Send a skill set | sidebar → Send a skill set | 9 | 8 | 8 | 9 | PASS |
| 15 | Board-code overlay | Send → Create link → Show code on board | 9 | 9 | 8 | n/a 8 | PASS |
| 16 | Auto-layout worksheet overlay | Print → Auto-layout → Build | 8 | 8 | 8 | n/a 8 | PASS |
| 17 | Quiz settings modal | Quiz builder → Settings | 9 | 8 | 8 | n/a 8 | PASS |
| 18 | Quiz results | Quizzes → Results | 9 | 9 | 8 | n/a 8 | PASS (empty state only) |
| 19 | Progress | sidebar → Progress | 9 | 9 | 8 | n/a 8 | PASS |
| 20 | Settings | sidebar → Settings | 9 | 9 | 8 | n/a 8 | PASS |
| 21 | Home | sidebar → Home | 9 | 9 | 9 | 8 | PASS |

**8 of 21 surfaces pass (0 of 20 in round 1).** Of the 13 failures:

- **3 are the pupil play views** a teacher launches: the game, the online worksheet and the MAP session. They still wear the full legacy skin.
- **1 is a functional break:** the quiz row menu.
- **The other 9 are close.** Each fails on one or two specific, fixable points.

### Console and runtime errors
None in any pass: every screen at both widths, dark mode, every modal opened here, and the game, worksheet and MAP session launches.

---

## Per-screen defects (worst first)

### 1. Quizzes list: the row ⋯ menu never opens (`p8-quiz-rowmenu-1280.png`, `p6-quizzes-menu-1280.png`)
- **What:**
  - Mouse click and keyboard Enter both leave `aria-expanded="false"`, and no menu renders.
  - Copy share link, Print, Export JSON and **Delete** are therefore unreachable from the list.
  - The quiz builder's own More menu only has Results / Monitor / Export, so **a teacher cannot delete a quiz anywhere**.
- **Cause** (`js/modules/teacher-shell.js:631-633` against `:709`):
  1. The screen's click handler sets `quiz.menu = id` and re-renders the list, which detaches the clicked button.
  2. The document-level "click outside" listener then runs, and `e.target.closest('.tv-menu-wrap')` is `null` on the detached node.
  3. So it closes the menu in the same click.
- **Fix:** in the document listener, ignore clicks whose target is no longer connected (`if (!e.target.isConnected) return;`), or test `e.composedPath()`. Alternatively, stop propagation in `onQuizClick` for `menu`. Also add Esc to close, and return focus to the ⋯ button.

### 2. MAP session launched by a teacher (`p5-map-session-1280.png`, `p9-map-session-820.png`)
- **D1:**
  - Legacy pupil chrome: 🏁 End Session (red), 🔊 Audio (blue pill), an orange CHECK, and a green Submit plus an orange Clr on the keypad.
  - 💡 Hint, 🔊 Read, ⏭ Skip, Nunito.
- **D3:**
  - The mode badge ("PRACTICE", x=1121–1204) sits **under the Audio button** (x≈1166–1264) and is clipped to "PRAC" at 1280. At 820 it is fully hidden.
  - The header reads **"Now: NO"**, which means nothing to a teacher or a pupil.
- **Fix:** move Audio into the toolbar row, not `position:fixed` over the header. Replace "Now: NO" with the band / domain in words. At least restyle End Session / Audio as tv ghost buttons.

### 3. Game view on the board (`p4-game-practice-1280.png`, `-2-`, `p4-board-display-1280.png`)
- **Fixed since round 1:** the header now lists the set's skill names instead of "Mixed Mode (All Categories)".
- **Still wrong:**
  - The **"Show me how" modal still opens over Q1 automatically.** For 6 + 2 it still says "Line up by place value" and "Add each column from right to left", which is a column-addition script for a single-digit fact. It is lilac and orange ("GOT IT, LET ME TRY!").
  - The badge is **"M · Add ≤20 NR"**. "NR" is jargon, and "M" (mixed level) sits on a Level 1 skill.
  - **"Board display" looks the same as Practice.** It has the same card, Exit, Hint / Read / Skip / CHECK buttons, and the green toast over the answer row. The Run screen promises "One large question at a time for the whole class", and its own preview (`p4-run-mode-hover-5`) shows a dark board frame that the real mode does not have.
  - "🆕 New Skill" progress label, emoji throughout, an orange 3-D CHECK.
- **Fix:**
  1. Do not auto-open "Show me how" in board / teacher launches. Make it an opt-in button, and pick the worked script by problem shape (no "line up by place value" for 1-digit + 1-digit).
  2. Use the plain skill label in the badge.
  3. Make Board display match its own preview: a large single question, no pupil tool row, and a teacher reveal / next control.

### 4. Online worksheet (`p4-worksheet-1280.png`, `-dark-1280`, `-820`)
- **Fixed since round 1:** dark mode is now consistent (dark page, white paper cells).
- **Still wrong:**
  - Every cell carries 🔊, an orange "? Hint" and a blue "⏭ Skip". That is 60 coloured buttons on a 20-item page.
  - The header has an orange "✓ CHECK ALL", 🏠 Back, 🔄 New and a purple skill pill.
  - This is the noisiest surface a teacher can open, and it directly contradicts the black-and-white worksheet contract.
- **Fix:**
  1. A tv toolbar (Back · title · primary "Check answers").
  2. Show per-cell Read / Hint / Skip only on the focused cell, or as one neutral icon button per cell.
  3. No emoji.

### 5. Export to Google Forms modal (`p7-google-export-1280.png`, `-dark-1280`, `-820`, `p9-print-gforms-1280.png`)
- **Fixed since round 1:** it is now a clean tv dialog, with a 44 px close, an indigo primary "Sign in with Google" and a neutral stepper.
- **D3:**
  - **No focus trap.** Tab goes select → Cancel → Sign in → *body* → then to "Quizzes", "Copy pupil link" and "More" on the page behind.
  - **Esc does not close it** (`display:flex` after Esc).
  - The form title defaults to **"Quiz"**, not the quiz's name ("Q2").
  - The counter reads "1 of 1 problems will be exported" (plural).
  - The stepper word "Render" is jargon.
- **Fix:**
  1. Trap focus, make the page behind `inert` (add `googleExportOverlay` to the shell's `syncInert` path: it is in `LEGACY_OVERLAYS` but the teacher app did not go inert here), and close on Esc.
  2. Prefill the title with the quiz / sheet name.
  3. Pluralise the counter.
  4. Rename the step to "Prepare".

### 6. Quiz monitor (`p6-quiz-monitor-1280.png`, `p10-monitor-switches-zoom.png`)
- **Fixed since round 1:** it opens and is laid out in tv style, with one primary "Finish and see results" and a helpful empty state.
- **D1:** the **ON state of the switches is broken.** "Show names" and "Show answers" render as a solid black 52×44 block with a white lozenge inside, not a pill track with a knob. The OFF switch next to them looks right. `.tv-switch` inside `.tvq-switch-btn` picks up the track colour across its whole 44 px hit box.
- **Fix:** paint the track on a pseudo-element (or an inner span) sized 44×24, and keep the 44 px hit area transparent, as the Settings switches do.

### 7. Print worksheets (`p1-print-1280-full.png`, `p3-print-*`)
- **Fixed since round 1:**
  - The preview is sticky (it stays at top ≈ 88 px while scrolling).
  - The page type is a thumbnail card grid.
  - The letter chips are 44 px.
  - The classic dialog is gone.
  - The skill search has hover previews.
- **D2:**
  - The **16 page-type cards sit inside Section A, above everything else.** The section's own skills, "Add a skill" and "Practice pages" start about 1,000 px down at 1280 (`p1-print-1280-full`). The one thing a first-time teacher must do (add a skill) is below the fold.
  - At **820 the preview starts at y = 1440** of a 3,522 px page, so the teacher cannot see the sheet while choosing a type.
  - **The "Fits:" caption under the preview is a paragraph of engine output.** For example: "2 columns x 1 rows, 2 per page, 1 page … Tall problems: 1 row per page. Tall problems: 1 row per page. … 2 columns do not fit these problems at size L: max 1 column. Showing 1 … Very tall problems: fewer than 3 rows fit". It repeats itself, says "1 page" beside tabs for Page 1 and Page 2, and uses developer terms (`p3-print-anchors-side-1280`).
- **D3, the new Anchor problems control:**
  - The **caption promises "a worked example beside each problem"**, but the preview for Side by side shows **one** Model cell beside item a only, with items b–e bare below it (`p3-print-anchors-side-1280`).
  - Side by side and Sections render almost the same page (`p3-print-anchors-sections-1280`).
  - When a skill has no steps, the only feedback is a sentence buried at the end of the Fits caption: "No worked example for Add within 20 (No Regrouping): it has no step-by-step steps yet". The segment itself gives no sign.
  - The control is shown even for page types it does not affect. The caption lists where it works, but the control is not disabled elsewhere.
- **D3, other:**
  - The header shows "Score ___ /8" on page 1, which holds 6 items (a–f). The denominator appears to count both pages. Check it.
  - With More Practice and 3 skills, the sheet is titled "Mixed practice".
  - Operator spacing is inconsistent within one row ("+ 5" against "+7" against "+11"; `p3-print-anchors-side-1280`).
- **Fixes:**
  1. Collapse the page-type grid to the chosen card plus "Change page type" (open the grid on demand). Put "Skills in this section" first.
  2. At < 900 px, put a compact preview (or a "Preview" jump button) at the top.
  3. Replace the Fits caption with one plain line ("2 pages · 4 problems per page · 1 column because the problems are wide"), with the details behind a "Why?" disclosure.
  4. Make Anchor problems honest: either render one example per problem for Side by side, or change the copy to "a worked example beside the first problem of each skill". Disable the segment, with its reason, when no skill in the section has worked steps, or on page types it does not affect.

### 8. Skill options popover (`p2-sets-options-1280/820`, `p3-sko-bottom-1280`, `p3-print-skill-options-1280`, `p5-lib-options-1280`)
- **Fixed since round 1:**
  - The header is the skill name.
  - It uses tv indigo.
  - It fits at 820, and Done is visible.
  - Esc returns focus to the Options button.
  - It now includes a live **Sample question**.
- **D2 / D4:** the **sample sits at the very bottom** of an 876 px-tall scrolling panel. While the teacher ticks fact sets or picture support at the top, the sample is off-screen, so the preview does not do its job. The panel is dense: 14 tick tiles, three uppercase section heads ("HARDER / EASIER", "SUPPORT", "LAYOUT") and a 2-line grey helper under every field.
- **D1:** the selects are **native** (`p2-sets-options-1280`: OS chevrons), not `.tv-select`.
- **Also:** Library → "Subtract within 100 (No Regrouping)" → Options offers "Regrouping (borrowing): Never / …". Choosing "Always" would contradict the skill's own name (the naming rule in CLAUDE.md).
- **Fix:**
  1. Pin the sample at the top of the panel (sticky, about 160 px), under the title.
  2. Use `.tv-select`.
  3. Use sentence-case section heads.
  4. Hide options that would contradict the skill id.

### 9. Quiz builder (`p6-qb-*`)
- **Fixed since round 1:** a tv header with one primary "Save quiz", a More menu, a click-to-preview that works at 820, no emoji and no grade 7.
- **D2:**
  - **Three filter mechanisms at once:** a category `<select>`, a Level chip row and a domain chip row.
  - A fourth picker vocabulary: Send uses a tree, Library uses a list with selects, Print uses search. A teacher meets four different skill pickers across the product.
  - The section header carries jargon: "3 Qs  2-col".
- **D3:**
  - **At 820 the Questions column drops below** the skills and preview, so after "Add to quiz" the teacher sees only a toast.
  - "Save quiz" then shows a second toast on top of the first: the green legacy toast "Added 1 question…" and the dark tv toast "Quiz saved" overlap (`p8-quiz-rowmenu-1280`).
- **Fix:**
  1. Reuse the Library filter row (search + Level select + Domain select).
  2. At < 900 px, show a sticky "Questions (n) ↓" bar or tabs (Skills / Questions).
  3. Route every toast through the one tv toast.
  4. Write "3 questions · 2 per row".

### 10. Skills library (`p1-library-*`, `p5-lib-*`, `p8-lib-detail-820`)
- **What works:** calm, one job, a detail pane with standards tags, a sample, "Practise now" as the primary action, and ⋯ for Options / Copy link / Make a quiz (this menu does open).
- **D3:**
  - The **List / Thumbnails segment is 116×36** (it measures below 44 on both Library and Send).
  - **Coverage state is sticky:** after opening Standards coverage, the sidebar "Skills library" link re-opens coverage, not the list (`p5-lib-detail-820.png` shows coverage after `tvGo('library')`).
- **D4:** some thumbnails are illegible at thumbnail scale:
  - "Circle the Even or Odd Numbers (MAP)" renders its list as **"3546221971"**, with the digits run together. It also has blue / orange coloured words ("even", "odd") in a black-and-white product.
  - The base-10 place-value tables are unreadable grey hairlines (`p5-lib-thumbs-level2-1280`).
- **Fix:**
  1. Make the view segment 44 px.
  2. Have a sidebar click reset the Library to the list.
  3. Give that skill's number list real separators.
  4. Let thumbnails of table-type skills show a larger crop, or the first item only.

### 11. Standards coverage (`p5-lib-coverage-1280*`, `p8`)
- **D3:**
  - Two different counts sit side by side: **"238 standards"** against "Levels K to 6: 165 of 177 standards covered (93 %), not counting lettered parts".
  - Related skills are run together inline with ". " separators and wrap raggedly.
  - The "Range" links (40×44) are under target width.
  - K.CC.3 ("Write numbers 0 to 20") shows **Not covered**. Worth confirming that the mapping is right rather than the skill being missing.
- **Fix:**
  1. One count ("177 standards · 165 covered"), with lettered parts nested.
  2. One skill per line, as a list.
  3. 44 px links.

### 12. MAP tests setup (`p1-map-*`, `p5-map-*`)
- **What works:** a large improvement. Level / Mode segments, domain checkboxes, a band picker, a per-band **sample question** and one indigo "Start MAP session".
- **D3:**
  - Adaptive "Change" is **52×24**.
  - It **navigates to Settings**, so the teacher leaves MAP to flip one switch and has to come back.
  - The sample for RIT 181–190 was "3 × 3", which reads as too easy for that band and undermines trust in the preview. Check the band → skill mapping.
- **Fix:** make Adaptive an inline switch in the summary card, and bring the link to 44 px.

### 13. Run practice (`p1-run-*`, `p4-run-*`)
- **What works:**
  - **The previews now land:** each "How to play" card shows what pupils see, with a sample from the current set (`p4-run-mode-hover-2/5`).
  - The One-skill search has hover previews.
  - The selects are 44 px.
- **D2 (fails):** "Pupil start screen" (Quick Start cards: Use current set / Lock / Reset to default) is still a second, unrelated job on this screen. Round 1 flagged it.
- **Also:** Board display's preview does not match the real mode (see #3). The mode hover preview covers the primary "Open on this screen" button while it is open.
- **Fix:** move Pupil start screen to Settings (or to Send → Quick Start link), and place mode previews to the left or below.

### 14. Send a skill set: PASS (`p2-*`)
- Hover preview on every row, Thumbnails view, an empty default name, a sticky bottom bar with "Create link", and a clean result.
- **Nits:**
  - The "Also use this set: Print" link is **28×44** (under target width).
  - Clear all is still small link text.
  - Several helper lines are 12 px grey ("Options belong to the skill and travel with it. ×2 comes up twice as often as ×1.").

### 15. Board-code overlay: PASS (`p2-board-code-*`, `p10-board-code-*`)
- A short code, the set name, a two-step instruction, 44 px Close with focus on open, and correct dark mode at 1280 and 820.
- **Nit:** a QR code would still help tablets.

### 16. Auto-layout worksheet overlay: PASS (`p9-print-autolayout-1280.png`)
- tv header (Back to Print worksheets · Download PDF · primary Print), with a black-and-white sheet.
- **Check:** the header says **"Score /21"** for 20 requested problems.

### 17. Quiz settings modal: PASS (`p6-qb-settings-1280.png`)
- tv selects and switches, one Done, the disabled "Printed versions" explains why, the shuffle rows are distinct, and Esc closes.

### 18. Quiz results: PASS, empty state only (`p6-quiz-results-*`)
- A back link on the left, More for the exports, and an empty state with a primary "Copy pupil link".
- Not re-graded with real submissions. Re-check the populated view before sign-off.

### 19. Progress: PASS (`p7-progress-data-*`)
- A fixed column plan, the Skill column ellipsised, no emoji or italics, neutral tags and row cards at 820.
- **Nit:** a stray space before the full stop in "open Quizzes ." (`teacher-shell.js:914`).

### 20. Settings: PASS (`p1-settings-*`, `p7-settings-*`)
- The theme segment syncs, and the switches have a 52×44 hit area.
- **Nit:** "Reset adaptive difficulty" uses a native `confirm()` with shouty legacy copy ("…for ALL skills back to Level 3?… Adaptive Mode"). Use a tv confirm, or a toast with Undo.

### 21. Home: PASS (`p1-home-*`, `p8-home-with-sets-*`)
- Reference screen.
- The code column shows the short code, the keyboard order is correct and there are no small targets.
- **Nit:** the toast sits over the sticky bar on Send.

---

## Top 10 fixes (by impact)

1. **Repair the quiz row ⋯ menu** (`teacher-shell.js:631-633`): ignore detached targets in the outside-click listener. Today Share, Print, Export JSON and **Delete** are unreachable, and a quiz cannot be deleted anywhere.
2. **Game view on the board:**
   - Stop auto-opening "Show me how" in teacher launches, and fix its script: no "line up by place value" for 6 + 2.
   - Make **Board display** actually a large, whole-class single question, matching its own Run-screen preview.
   - Use the plain skill label instead of "M · Add ≤20 NR".
3. **Online worksheet chrome:** a tv toolbar with one "Check answers" primary; drop the 60 per-cell coloured Hint / Skip / Read buttons (focus-only or one neutral icon); no emoji.
4. **MAP session header:** move the fixed Audio button so it stops covering the mode badge ("PRAC" at 1280, hidden at 820), replace "Now: NO" with words, and restyle End Session / Audio.
5. **Print screen order and honesty:**
   - Collapse the 16-card page-type grid to "chosen type + Change", so the skills come first.
   - Show a preview near the top at < 900 px.
   - Rewrite the "Fits:" engine dump as one plain line.
6. **Anchor problems:** make "Side by side" do what its caption says (one example per problem) or reword it. Disable the control, with its reason, when no skill in the section has worked steps or on page types it does not affect. Check the page-1 score denominator ("/8" with 6 items).
7. **Google Forms modal:** trap focus and make the page behind `inert`, close on Esc, prefill the form title with the quiz or sheet name, fix "1 of 1 problems", and rename "Render".
8. **Options popover:** pin the Sample question at the top, so it is visible while options change; use `.tv-select` instead of native selects; hide options that contradict the skill name (e.g. regrouping on "No Regrouping").
9. **Fix the Quiz monitor's ON switches** (black 52×44 block): paint the track on a 44×24 inner element, as in Settings.
10. **Small targets and single job:**
    - Make List / Thumbnails 44 px (Library and Send).
    - Bring MAP "Change" (52×24), coverage "Range" (40×44) and Send's "Print" link (28×44) to 44 px.
    - Move "Pupil start screen" off Run practice.
    - Make the sidebar "Skills library" reset coverage to the list.
    - Give the Quiz builder a sticky Questions bar at 820, and route all toasts through one toast (the green legacy toast and the tv toast overlap).

**Also worth fixing:**
- Illegible Library thumbnails ("3546221971", hairline base-10 tables).
- Standards coverage shows two counts (238 against 177).
- MAP RIT 181–190 sample "3 × 3".
- Auto-layout "Score /21" for 20 problems.
- Uneven operator spacing within a printed row ("+ 5" against "+7").
