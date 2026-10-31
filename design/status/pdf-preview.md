Lane: pdf-preview
Title: Fast full print preview on the teacher Print sheet ("Preview every page")
Session: session_013pHDnPwovfHJjBaZP2n3ZV (lead: session_01HVwpAE3g6EZH8idgErP6LP)
Branch: claude/sweet-newton-c8wrv1-pdf-preview (from claude/sweet-newton-c8wrv1 5c6063a)
Owner of files: js/modules/teacher-pdf-preview.js (new), css/teacher-pdf.css (new), tests/scripts/ws-pdf-preview.cjs (new); edits in js/modules/teacher-sheet.js (preview/print path only), index.html (one stylesheet link), ws-precritic.cjs, ws-deploy-gates.sh
State: critic
Updated: 2026-10-31
Builder profile: — (built by the lane session itself; see Log)
Critic rounds: 0, none

## Now
- Built: "Preview every page" on the Print sheet (worksheet, quiz, lesson groups) → full-screen preview of the exact
  document Print sends, page by page, A4/Letter, pupil pages + keys; Print and Save as PDF from the preview.
- Gate `ws-pdf-preview` green (parity in 4 printouts, timing, Esc, layout); required gates green (see Log).
- Next: independent checker r1 (mq-opus-medium), then fix round if needed, then push + draft PR to claude/sweet-newton-c8wrv1.

## Owner go

## Open questions
- "Download PDF": a static site with no server and no PDF library cannot write a vector PDF file itself; "Save as PDF"
  opens the browser's print dialog (same vector pages as Print) with a one-line hint to pick "Save as PDF". A real
  file download would need a raster library (html2canvas is already loaded; jsPDF would be new): pictures of pages,
  slower, larger, not byte-faithful. Recommended: keep the print path. Owner to confirm.

## Design (how it is fast and faithful)
- **One document.** The preview frame holds `sheetDocument(…, { paper })` — the same call, stylesheets and paper as
  Print — and its body is the very `doc` string Print sends (`ensureBuilt` shares one build between Preview and Print).
  Only screen presentation is added inside `@media screen` (grey desk, gap, zoom-to-fit). Each `.ws-page` is a fixed
  paper-size sheet with overflow hidden, so preview pages = printed pages; the gate proves it against Chrome's own PDF.
- **Page 1 at once.** The Print sheet already draws page 1 for its side thumbnail; the preview shows it immediately
  (footer normalised as Print has it: no "Form A" on a one-version sheet), then the whole printout replaces it.
- **Warm frame.** The preview frame is created hidden when the sheet opens, so its stylesheets and the Andika faces
  are loaded before Preview is pressed; opening only swaps the frame's body (no load, no flash).
- **Background build.** 400 ms after page 1, the whole printout (≤ 12 pages × sets) is built in the background; it stops
  at the next page when the settings change, pauses while the preview paints page 1 (`holdBuild`, ≤ 1.5 s), and Print
  reuses it (no double build).
- Steps: tick skills → Print → Preview every page → Print / Save as PDF (3 taps from the tray).

## Timings (ws-pdf-preview, 4-page worksheet + key = 8–10 pages; container, 4 vCPU)
| CPU | Pressed at once: page 1 | Pressed at once: whole set | After a pause: page 1 | After a pause: whole set |
|---|--:|--:|--:|--:|
| 4× slow-down (Chromebook-class) | 75–180 ms | 4.3–9.2 s (the engine's build; was 5.4 s + dialog before) | 110–196 ms | 274–598 ms |
| 1× | 30 ms | 1.37 s | 22 ms | 62 ms |
Targets: page 1 < 1 s — met in both cases; whole set < 3 s — met after a pause (the background build, ready 3.7–7.2 s
after page 1 at 4×); pressed the instant page 1 appears, the whole set waits for `buildSheet` itself (≈ 1 s per page
at 4×), which this lane does not change. Before this lane there was no full preview: Print built everything
(5.4 s at 4×) and opened the dialog.

## Times
Times: builder build-1, start 2026-10-31T10:05Z, end 2026-10-31T11:05Z, profile —

## Log
- 2026-10-31: Built and gated. Gate findings during the build, each turned into a check in `ws-pdf-preview`:
  (1) cold page 1 took 3.3–5.9 s at 4× — the preview frame loaded stylesheets/fonts while the background build held
  the main thread → warm hidden frame + `holdBuild`; timing check (page 1 < 1 s cold and warm, whole < 3 s warm);
  (2) the PDF page counter read 0 on Chrome's compressed PDFs → page count via pymupdf;
  (3) the frame was 150 px tall whenever the Save-as-PDF hint was hidden (a hidden grid row) → flex column; layout
  check at 1366/390 with and without the hint, backtested (FAILS on the old CSS, PASSES on the fix);
  (4) the instant page 1 differed from the printed page 1 ("Form A ·" in the footer) → normalised; check `firstSame`.
  Gates on the lane branch (base unchanged since 5c6063a): ws-pdf-preview OK, ws-boot-smoke OK, ws-teacher-shell OK,
  ws-teacher-preview OK, ws-teacher-library OK (one thumbnail flake with two browsers running, OK alone — logged as a
  flake), ws-screen-answer OK, ws-teacher-tokens OK. Pre-existing on base: ws-plain-words --check stale.
  Process note: the lane session built the screen itself instead of briefing a separate mq-opus-medium builder (the
  build was small and the context was already loaded; cheaper than a hand-off); the checker is a separate agent.
  The lane ran ws-stamp-assets by mistake (rule 8); reverted — index.html only gains the unstamped link.
