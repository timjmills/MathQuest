# Spec card: My Worksheets (save and organise every sheet a teacher makes)

**Status:** SIGNED (lead, under delegated owner approval, 2026-11-20). Build may start.
**Lane:** lf-partopts.
**Builder:** MEDIUM effort (a new screen).

The owner asked for it in these words: *"we will need somewhere to save these worksheets and organize them once made"*. This
ties to the earlier ask that any printed worksheet can be opened in interactive mode.

## 1. What a teacher can do

- **S-1 Save.** Every print screen has a **Save** button that keeps the sheet currently on screen. The print screens are:
  - Print worksheets (`teacher-print.js`), which covers every page type, including lessons, Mixed Review and Quick review;
  - simple print (`simple-print.js`);
  - the online worksheet / interactive player.

  Save asks for a name, which is pre-filled (§4), and a folder, which defaults to the sheet's unit.
- **S-2 Find.** One screen, **My Worksheets**, has:
  - folders down the left, including the default unit folders;
  - search over name, skill, tag and class;
  - filter chips for class and tag;
  - sorting by date (the default) or by unit.
- **S-3 Use.** Each saved sheet is a card showing:
  - a thumbnail of page 1;
  - its name, page type, skills, date and class;
  - the buttons **Print**, **Open interactive**, **Send code** and a **⋯** menu.
- **S-4 Change.** Through the ⋯ menu a teacher can:
  - rename it;
  - move it to another folder;
  - add or remove tags;
  - **Duplicate**, which makes the same sheet;
  - **New mix**, which keeps the same settings with a new seed, so it gives new numbers;
  - **Edit**, which opens the sheet in its print screen with everything loaded; saving it again updates it or saves a copy;
  - **Delete**, which has a 10-second Undo.
- **S-5 Move between devices.** **Export library** saves one `.mqsheets` file (JSON). **Import** reads it back and merges it, so
  nothing is lost, and the same record is never duplicated. Each sheet also has a **share code / link**, which opens it on any
  device ready to print or play.

## 2. What is saved: a record, not a PDF

A saved sheet is the request that drew it. It is never the drawing. The same record reprints byte-identical, and the same
record can be opened interactive.

```js
{
  id, v: 1,                        // id: time + random; v: record version (migrations are additive)
  name, folder, tags: [], cls,     // the class: free text, e.g. "5T"
  createdAt, updatedAt, printedAt,
  host: 'teacher-print' | 'simple-print' | 'player',
  req: {                           // exactly the buildSheet request (print-sheet.js), with its seed
    role, sections: [{ skills: [{ categoryId, skillId, opts }], count, pages, columns, partOpts, ... }],
    size, look, paper, header, seed, key
  },
  unit: { wrm, grade } | null,     // for the default folder and unit sort (from the skills' SKILL_WRM tags)
  thumb: 'data:image/webp;…'       // page 1 at 240 px wide, made once at save time (≤ 25 KB), regenerated if missing
}
```

- `req.size` stores only M or L; an old S falls back to M (owner rule 9).
- Options are stored packed (`packOptions`), as share codes are, so a skill's later option changes keep their meaning.
- A record whose skill was retired keeps loading through `skill-aliases.js`. If a skill is gone, the card says
  "1 skill is no longer in the app" and still prints the rest.

## 3. Where it is stored (additive, on this device)

- **IndexedDB**: a new store, `sheets`, in the existing `mathquest_quizzes` database. The `DB_VERSION` bump only adds the store,
  with indexes `updatedAt`, `folder`, `unit`. It sits beside `tests` / `results`, reusing `quiz-storage.js`'s `openDB`.
  Folders and tags are kept as a small `sheetFolders` record in the same store.
- **Nothing existing changes.** Quizzes, results and **My sets** (`localStorage mq_teacher_sets`, which are skill SETS for
  pupils) keep their storage and screens.
  - A saved sheet can be turned into a set ("Send as a set").
  - A set can make a worksheet (its Print button, as today).
  - My Worksheets does not replace My sets.
- **The UI says it plainly**, at the top of the screen: "Saved on this device. Use Export to keep a copy or move them to another
  computer." Syncing through a server is a later, separate decision; this card does not include it.
- **The browser can be asked to keep the data.** `navigator.storage.persist()` is requested on the first save, so the browser
  does not clear the library under storage pressure.

## 4. Names, folders and tags

- **Default name:** "‹page type› · ‹first skill's pupil name›" plus "+ N more" when there are several skills, then " · ‹date›".
  For example: "Independent · Basic Addition · 20 Nov".
- **Default folders** are one per unit, following the lessons browser's unit view: "Year 4 · Block 3 · Multiplication and
  division". They are made on demand, when the first sheet of a unit is saved. A sheet with no WRM unit goes in
  "Other sheets". Teachers can also make their own folders, one level deep with no nesting, to keep it simple. A default unit
  folder can be renamed but never deleted while it holds sheets.
- **Tags** are free text, chosen as chips.
- **Class** is free text, remembered as a chip.

## 5. Opening a sheet interactive

**Open interactive** plays the same items in the online worksheet host (`worksheet.js` / `screen-cell.js`). It uses the same
seed and the same skills with their options, so the pupil sees on screen what is on paper (paper = screen). Where the lesson
player (lesson-player D12) exists for a role, that role opens in it. The record does not change.

## 6. Share code

**Send code** makes a link `?sheet=<code>`. The code is a base64url of the compact `{v, n, req}`, the same pattern as
`encodeSetParam`.
- Opened by a teacher, it offers "Save to My Worksheets" and "Print".
- Opened by a pupil, it plays the sheet interactive.
- Old share codes and `?set=` links are unchanged.
- The code is append-only: a new field is optional, and an unknown field is ignored.

## 7. Screens and widths

Computer / Chromebook (1280 × 1000, 1366 × 768) and tablet (1024 × 768, 820 × 1180), with 48 px touch targets. There is no
390 px width. At 820 px the folders collapse into a "Folder ▾" picker above the grid. Teacher tokens are those of the teacher
shell; the thumbnails are the black-and-white sheet itself.

## 8. Checks (built before the screen, each with a backtest row, a ledger row and a precritic place)

All checks live in the new gate `tests/scripts/ws-my-worksheets.cjs` (browser) and run under precritic `--teacher`.

| Check | What it proves |
|---|---|
| **SAVE-REPRODUCE** | For 12 sheets across hosts and page types (independent, lesson, Mixed Review, facts, simple print, M and L), save then reprint from the record. The pupil HTML and key HTML must be byte-identical to the print made before saving. New mix must differ in its items but match in its settings. |
| **LIBRARY-ROUNDTRIP** | Export, then clear, then import must give the same records (deep equal, thumbnails included). Importing twice must create no duplicates. A file from an older record version must load. |
| **SHEET-CODE** | Every saved sheet's `?sheet=` code must open to the same request, as a teacher (Print gives the same HTML) and as a pupil (the interactive items are the same items). |
| **INTERACTIVE-SAME** | Open interactive must deal the same questions, in the same order, as page 1. |
| **ORGANISE** | Rename, move, tag, duplicate, delete with undo, search, the two sorts and the default unit folders must each change the library as stated, and must survive a reload. |
| **NO-LOSS** | The `quizzes` / `results` stores and My sets must be untouched after the DB upgrade (a seeded old DB is opened and compared). |
| **TOUCH / WIDTH** | Every control must be ≥ 48 px and hit by a real tap at its centre, with no sideways scroll, at the four widths. |

The usual gates also run: boot smoke, code snapshot, ws-teacher-* and ws-simple-print.

## 9. Open questions for the signer

1. Should a sheet saved again from **Edit** overwrite the record by default, with a "Save as a copy" option, or always ask?
2. Should Save also be on the **pupil's** online worksheet, for a pupil's own copy? The card says no: it is teacher-only.
3. Is a cap of **500** sheets per device right? The thumbnails come to about 12 MB at most. Older sheets are never deleted
   silently: at the cap, Save asks the teacher to delete or export.
4. Should **default unit folders** be on, or should there be only the teacher's own folders?

## 10. Build plan and spend

Builder at MEDIUM:
1. Write the checks.
2. Build the store module `sheet-library.js`.
3. Add the Save button on the three hosts.
4. Build the My Worksheets screen.
5. Add the share code.
6. Add Open interactive.

Then a narrow critic at MEDIUM, at the four widths. The estimate is $60–80 for the build and $20–25 for each critic round.

Lead rulings on the open questions (A15, 2026-11-20):
1. Re-saving from Edit overwrites the original, with "Save as a copy" offered beside it; never a silent overwrite of a different sheet.
2. Save is teacher-only. Pupils never see it.
3. 500-sheet cap per device: warn from 450 ("You have N of 500 saved. Export library to keep a copy."); at 500 Save asks to delete or export.
4. Unit folders are on by default.

Signed: owner, 2026-11-20
