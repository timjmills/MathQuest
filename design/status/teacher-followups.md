# Teacher follow-ups (work order item 13) — status

Lane: teacher follow-ups · 2026-10-30 · branch `claude/sweet-newton-c8wrv1-teacher-followups` · lead + 2 builders (Opus low)
Teacher screens are not graded 8/10: an independent checker looks for bugs and usability, then they can go live.

## 1. Whole-grade print speed — DONE

**Cause (CPU profile, Grade 1 + 2):** 93 % of the time was `getBoundingClientRect` inside `measureItems`
(`js/modules/print-sheet.js`). Every cell was written and read one at a time in the app page, and one forced layout of the
app page costs ~33 ms (5,700 nodes; its `:has()` rules are re-checked on every write). The same cell in a bare frame with
the same stylesheets costs ~0.4 ms. Generation (~1 s) and layout maths were never the problem.

**Fix (print-sheet.js only):**
- `measureItems` writes every cell of a pass (one column count × one state) first, then reads them all after one layout.
  Each cell is still parsed on its own and is still a direct child of the `.ws-sheet` root, so the CSS is the same.
- `measureDocument()`: cells (and the title line) are measured in a hidden same-origin frame that carries the app's
  stylesheets in order, at the app's viewport width, with the `<html>`/`<body>` attributes. Kept between builds and
  re-synced (stylesheet signature) before each `buildSheetCore` and `buildDetailedLesson`. Any failure → the app page, as before.
- Side-by-side anchors (`printMeasureDoc`) still measure in the app page: not on the whole-grade path.

**Proof of no change:** the whole paper (pupil pages + key) is byte-identical before and after (sha1 of the document, server
port normalised) for Grade K, 1, 3, 5 and a two-grade mix.

**Timings** (this container, `node tests/scripts/ws-grade-print-timing.cjs <grade>`; Library → grade → Add whole grade →
Print sheet; "preview" = sheet open until the page-1 preview is drawn; "paper" = every page + key, what Print builds):

| Tray | Pages | Preview before → after | Paper before → after | Same output |
|---|---|---|---|---|
| Grade 1 (whole grade) | 26 | 44.6 s → 2.6 s | 149.5 s → 9.1 s | yes (525c4e8682dc) |
| Grade 5 (whole grade) | 30 | 31.6 s → 5.3 s | 96.0 s → 8.2 s | yes (8345350acfbf) |
| Grades 1 + 2 | 32 | 61.6 s → 2.9 s | 310.9 s → 15.4 s | yes (a20446facbb7) |
| Grades K + 2 | 35 | 52.2 s → 3.9 s | 268.4 s → 15.3 s | yes (c8711d9c4272) |
| Grades 3 + 2 | 44 | 58.0 s → 5.9 s | 463.0 s → 24.1 s | yes (263bdb2fd0dd) |
| Grades 5 + 2 (184 skills) | 30 | never (stuck) → 5.3 s | 154.4 s → 8.0 s | yes (b32ecca8badb) |

(The owner's figures, Grade 1 ≈ 26 s sheet / ≈ 118 s document, were on a faster machine; the ratio is ~16×.)
What is left: the per-element checks in `measureItems` (~5 s self time on Grades 1 + 2) and cell rendering (~3.5 s).

**Bug found and fixed on the way (teacher-sheet.js `runPreview`):** with a big mix (two whole grades, 184 skills) the
page-1 preview spilled on all 3 tries, then the loop fell through: no preview and "Working out how many fit on a page…"
forever. The last page built is now shown. Screenshots: `teacher-followups/print-two-grades-preview-{before,after}.png`.
**Still open (for the lead):** that 184-skill mix then plans 30 pages of ONE problem each (the plan learns 1 per page from a
spilling first page). Single grades are fine (Grade 1: 3–4 cells a page).

**Overlap with the PDF-preview agent in teacher-sheet.js:** one hunk at the end of `runPreview` (`let last`, `last = {…}`,
and the fallback after the loop). Nothing else in teacher-sheet.js changed.

New tool: `tests/scripts/ws-grade-print-timing.cjs` (times, page count, document hash; `--profile out.cpuprofile`;
`DOC_OUT=` saves the document; `MQ_ROOT=` runs another checkout for a before/after).

## 2. Support ladder on the worksheet / quiz hosts, double edge

(see below — builder report)

## 3. Option panels and Teacher screens audit R2

Triage of all 85 open items: `design/status/teacher-followups-triage.md`. 69 already fixed by Teacher site 2.0, 2 dropped,
5 fixed now (Settings reset: no `confirm()`, toast with Undo; 44 px "?" and tray "×" targets; Send "Clear all" size;
Decimal places hidden where the skill has no decimals), 6 handed off to family lanes, 4 lead items.
