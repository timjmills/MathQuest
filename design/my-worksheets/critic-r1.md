# My Worksheets: critic round 1

- **Branch:** `claude/sweet-newton-c8wrv1-lf-myworksheets` @ 35bc9ebb5 (base 903f2780e, merged with master).
- **Critic:** independent, round 1, 2026-11-20.
- **Bar:** `design/audit/RUBRIC.md`: PASS needs ≥ 8 on C1–C4 at every width. The card is `CARD.md` with rulings A15, plus A19 (the current teacher look, with the Print-screen purple primary kept).
- **Method:** my own Puppeteer runs (`tests/lib/ws-harness.cjs`):
  - real mouse clicks at 1280×1000 and 1366×768;
  - real `touchscreen.tap` and swipe at 1024×768 and 820×1180;
  - the app in teacher mode, with the screen opened from **Me › My Worksheets**;
  - fresh browser contexts for the `?sheet=` links and for the import.
- **Screenshots:** in `critic-r1/`.

## Verdict: FAIL (round 1)

Most of the screen does its job. These things worked in my own runs:
- Reprint is byte-identical to the original print.
- Play deals the page-1 items in print order.
- The `?sheet=` link works as a teacher and as a pupil.
- Import twice creates no duplicates.
- The DB upgrade loses nothing.
- There are no console errors and no sideways scroll.

It fails because of four defects:
- **F1:** keyboard handling over the simple print.
- **F2:** the ⋯ menu cannot be reached on the lower cards on a 768-px-tall tablet.
- **F4:** Save on a freshly played online worksheet keeps a different sheet from the one on screen.
- **F3:** the ⋯ button sticks out of the card at 1366.

## Scores

| Width | Input | C1 Ease of use | C2 Does the job | C3 Spacing / layout | C4 Card + A19 fidelity | Result |
|---|---|---|---|---|---|---|
| 1280 × 1000 | mouse | 7 (F1, F7) | 7 (F4) | 8 | 8 | FAIL |
| 1366 × 768 | mouse | 7 (F1, F2) | 7 (F4) | 7 (F3) | 8 | FAIL |
| 1024 × 768 | touch | 6 (F2) | 7 (F4) | 8 | 8 | FAIL |
| 820 × 1180 | touch | 7 (F2, F10) | 7 (F4) | 8 | 8 | FAIL |

## Gate

```
node tests/scripts/ws-my-worksheets.cjs --widths 1280,820     (on 35bc9ebb5)
(12 sheets saved; widths 1280,820; 136 s)
ws-my-worksheets: OK          exit 0
```

The gate is green, but it did not catch F1, F2, F3, F4 or F10. Each finding below names the check that would have caught it.

## Findings

### F1 · major · C1 · every width with a keyboard: over the simple print, the Save dialog does not keep the keyboard

- **What happens:** I opened simple print (× facts + + facts), pressed **Save**, and the dialog opened with the name field focused.
  - **Shift+Tab ×4:** all four presses leave the dialog. Focus goes to simple print's **Print** and **Preview every page**, behind the scrim.
  - **Tab ×12:** focus stays in the dialog.
  - **Esc:** it closes the *simple print underneath* and leaves the Save dialog open on top of the Print worksheets screen, with nothing behind it (`critic-r1/sp-after-esc-1280.png`).
- **Over Print worksheets** the same dialog behaves correctly: Tab and Shift+Tab stay inside, and Esc closes it and gives focus back to the Save button.
- **Cause:**
  - `simple-print.js` `onKey` is a document **capture** listener, so it runs before the overlay's own listener.
  - On Esc it calls `closeSimplePrint()` and `stopPropagation()`.
  - On Shift+Tab, `indexOf(activeElement)` is −1, so it focuses its own last control.
  - It never asks whether a `.mws-overlay` is open.
- **Automatic check:** add a **KEYS** row to `ws-my-worksheets`. For each host (Print worksheets, simple print, online worksheet), open Save, press Tab ×12 and Shift+Tab ×12, and assert that `document.activeElement.closest('.mws-dialog')` holds after every key press. Then press Esc and assert that `#mwsSave` is gone, that the host is still open, and that focus is back on the host's Save button.

### F2 · major · C1 · 1024×768 touch (and 1366×768 mouse): the ⋯ menu runs off the bottom, and on touch it cannot be reached

- **What happens:**
  - The menu has 9 items of 48 px each, about 450 px, and always opens downward.
  - On the lower cards, at 1024×768 and 1366×768, only **Send code** and **New mix** are on screen. Edit, Rename, Move, Tags, Duplicate, Send as a set and Delete are below the fold (`critic-r1/menu-last-1024.png`).
  - With a mouse, the wheel scrolls and the menu stays open.
  - On touch, the swipe needed to reach the items **closes the menu**: the `pointerdown` capture handler treats the swipe as an outside tap. The teacher has to scroll the card to the top and open the menu again.
- **Fix direction:** open the menu upward when there is no room below, or `scrollIntoView({block:'nearest'})` the menu when it opens.
- **Automatic check:** add a **MENU-REACH** row to TOUCH-WIDTH. At each width, scroll to the bottom and open ⋯ on the last card with a real tap and no programmatic centring. Then assert that every `[role=menuitem]` rect is inside `innerHeight`.

### F3 · minor · C3 · 1366: the ⋯ button sticks out of its card

- **What happens:** at 1366 the grid makes about 250-px cards, three to a row. `.mws-acts` (`1fr 1fr 48px`) cannot fit Print and Play at their content width, so the ⋯ button overflows each card's right edge by about 5 px (`critic-r1/library-1366.png`, right edge of each card).
- **Fix direction:** use `minmax(0,1fr)`, or raise the grid's minimum to about 270 px.
- **Automatic check:** extend TOUCH-WIDTH. At every width, assert that every descendant rect of `.mws-card` lies inside the card's rect, with 1 px of tolerance.

### F4 · major · C2 · all widths: Save on a freshly played online worksheet keeps a different sheet (builder known limit 1: a **defect**, not acceptable)

- **What happens:** `playerSaveDraft()` builds an Independent request with its own seed, `100000 + worksheetSeed % 900000`. The saved record therefore prints and replays *other* items than the ones on screen.
  - The teacher presses "Save" while looking at a sheet, so it must keep that sheet. This is paper = screen, and the card's §2 promise that "a saved sheet is the request that drew it".
  - Nothing in the dialog warns about it.
  - (A worksheet opened from a saved record does save correctly: the dialog shows the record's name and folder.)
- **Fix direction:** deal the fresh online worksheet *from* the request, i.e. from `pageOneItems` of a new seeded Independent request, as Play already does. Then the items on screen are page 1 of what Save keeps. At the very least, title the dialog "Save these skills as a new sheet" and say so.
- **Automatic check:** add a `player-fresh` case to SAVE-REPRODUCE. Play a set with no record, read `state.worksheetQs` (the answer and the text of each item), press Save, and assert `pageOneItems(saved)` equals the on-screen items in order.

### F5 · minor · C2: detailed lessons' Play deals a fresh worksheet of the skill (builder known limit 2: **acceptable for now**, with a label)

- **Why it is acceptable:** card §5 sends lessons to the lesson player (D12) "where it exists", and it does not exist yet.
- **What is missing:** the teacher is not told. **Play** on a lesson card should toast, or label itself, for example "Plays practice of this skill; the lesson pages are print-only".
- **Automatic check:** in INTERACTIVE-SAME, for every role, either the items equal page 1, or the stated-limit toast is shown. Silence is the failure.

### F6 · minor: "Send as a set" has no automatic check (builder known limit 3: a **defect** under the owner rule)

- **What I saw:** it works. I clicked it, and `mq_teacher_sets` gained "Friday facts: add_facts", ahead of the old set.
- **What is missing:** nothing guards it.
- **Automatic check:** add a row to ORGANISE. Send as a set must prepend one set to `mq_teacher_sets` whose skills and opts equal the record's de-duplicated skills, leave the other sets byte-identical, and show the set on the Skills › My sets screen.

### F7 · minor · C1: the bare "Save" label sits next to another "Save"

- **Simple print:** the footer **Save** sits under "★ Save as quick print" (`critic-r1/save-sp-820.png`).
- **Online worksheet:** the header **Save** gives no hint of where the sheet goes.
- The aria-label says "Save to My Worksheets", but the busy teacher reads only the visible text.
- **Fix direction:** label it "Save to My Worksheets", or "Save sheet" at narrow widths. Print worksheets already says "Save to My Worksheets".
- **Automatic check:** a label lint in the gate. The visible text of every `[aria-label="Save to My Worksheets"]` control contains "Worksheets" or "sheet".

### F8 · minor · C4: Send code is not on the card face

- Card S-3 lists **Print, Open interactive, Send code and ⋯** as the card's buttons. Send code is inside the ⋯ menu only.
- **Fix direction:** either add the button or amend the card. The card is the contract.
- **Automatic check:** a CARD-CONFORMANCE row that every action S-3 names is a visible button on `.mws-card`.

### F9 · minor · C3: card meta

- **Date twice:** the default name already ends in "· 20 Nov", and the meta line repeats "20 Nov".
- **Page count lost:** a **New mix** or **Edit**-made copy loses its page count ("Independent · M · Y3 · B2", no "1 page"), because `saveCopy` deletes `pages` and only the thumbnail is made again.
- **Automatic check:** every record that has a thumbnail also has `pages`. A card's meta never repeats a token that is in its name.

### F10 · minor · C1 · 820 / 1024: the online worksheet's Save button is 70 × 44 px

- Card §7 asks for 48 px. The button matches the existing 44-px header chrome, but it is new on this branch.
- **Automatic check:** TOUCH-WIDTH must include `#wsSaveSheet`, and the simple-print Save button, at 820 and 1024.

## What passed, from my own clicks

- **Save, Print worksheets:**
  - Independent: the default name is "Independent · Addition Facts (within 20) · 20 Nov" and the folder is "Year 3 · Block 2 · Addition and subtraction".
  - Lesson packet: "Lesson · Round to Nearest 10 · 20 Nov", in "Year 4 · Block 1 · Place value".
  - Simple print: "Simple print · Multiplication Facts (1-12) + 1 more · 20 Nov", in "Year 2 · Block 5".
  - Focus lands on the selected name. Class and tags are saved and become chips. The toast names the folder.
- **Library:**
  - The note "Saved on this device. Use Export library to keep a copy or to move your worksheets to another computer." is plain and prominent.
  - The unit folders, My folders, "New folder" and the counts all show.
  - Search ("mult" → 1, "5T" → 1), the class chip, "By unit" and "Newest first" all filter or sort as stated.
  - At 820 the sidebar becomes "Folder: All (n)" and filters.
  - No sideways scroll at any width. Every control of the screen is ≥ 48 px.
  - The thumbnails (240 px images shown at 120 px) are recognisable as the sheet.
  - The look follows A19: teacher tokens, with the purple primary only on Print and New worksheet.
- **Print:** the library's Print gives the same document as the original Print-screen print. The `tvPrintFrame` HTML is identical apart from `<title>`.
- **Play:** page-1 items 4+6, 4+9, 9+6, 2+3 … appear in the same order on the online worksheet (`critic-r1/play-1280.png`).
- **Send code:** a link `?sheet=SH1.…` (688 characters).
  - In a fresh context with the teacher role, it offers Close / Play / Print / Save to My Worksheets (`critic-r1/link-teacher-1280.png`).
  - In a fresh pupil context, it opens the online worksheet.
  - No console errors.
- **⋯ menu:**
  - New mix keeps the settings with only the seed changed (4242 → 335955), and the items differ.
  - Rename (Enter submits), Move (the folder list) and Duplicate work.
  - Delete shows "“Friday facts” deleted. Undo" in view, and Undo brings the sheet back.
  - Edit opens the Print screen with "Save changes to My Worksheets". The dialog offers Cancel / **Save as a copy** / Save changes, and Save changes overwrites: the count stayed 5 → 5 and `updatedAt` moved (`critic-r1/edit-save-1280.png`).
  - The Rename and Move dialogs keep Tab and Shift+Tab inside, and Esc closes them.
- **Move between devices:** I exported, then imported into a fresh context: 5 added and the same names. Importing again gave 0 added and 5 kept. The unit folders came back with the import.
- **No loss:**
  - I seeded a version-1 `mathquest_quizzes` database (one quiz and one result) and a `mq_teacher_sets` set before loading the branch.
  - After the upgrade, the database is at version 2 with stores results, sheets and tests. The quiz and the result are intact and the quiz shows on the Quizzes screen. My sets is byte-identical.
  - Teacher Print and simple print are otherwise unchanged; each only gained its Save button.

## Re-check for round 2

1. F1, F2, F3 and F4 are fixed.
2. The KEYS, MENU-REACH, card-bounds and `player-fresh` rows are added to `ws-my-worksheets`, and each one FAILS on 35bc9ebb5 (backtest).
3. F5–F10 are fixed or ruled on.
