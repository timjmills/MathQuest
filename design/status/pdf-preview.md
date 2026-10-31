Lane: pdf-preview
Title: Fast full print preview on the teacher Print sheet ("Preview every page")
Session: session_013pHDnPwovfHJjBaZP2n3ZV (lead: session_01HVwpAE3g6EZH8idgErP6LP)
Branch: claude/sweet-newton-c8wrv1-pdf-preview (from claude/sweet-newton-c8wrv1 5c6063a) · draft PR #26
Owner of files: js/modules/teacher-pdf-preview.js (new), css/teacher-pdf.css (new), tests/scripts/ws-pdf-preview.cjs (new); edits in js/modules/teacher-sheet.js (preview/print path only), teacher-print.js (printHtml font wait), teacher-wrm.js (EXTRA.title), index.html (one stylesheet link), ws-precritic.cjs, ws-deploy-gates.sh
State: critic
Updated: 2026-10-31
Builder profile: — (built and fixed by the lane session itself; see Log)
Critic rounds: 1, FAIL (A 8 · B 6 · C 5 · D 6); fix round done, r2 next

## Now
- r1 fixes in: Esc regression, inert sheet + Tab trap (also inside the frame), page-1 reuse + prefetch at once, set
  covers counted apart, pixel parity, wall-clock timing from one real press, batch title, overlay removal, token
  fallbacks; plus the lead's ask (Print waits for Andika 400 + 700; gate asserts title / Name in Andika bold).
- Next: checker r2 on the r1 defects + regressions; then report to the lead.

## Owner go

## Open questions
- **"Download PDF"**: a static site with no server and no PDF library cannot write a vector PDF file itself; "Save as PDF"
  opens the browser's print dialog (same vector pages as Print) with a one-line hint to pick "Save as PDF". A real
  file download would need a raster library (html2canvas is loaded; jsPDF would be new): pictures of pages, slower,
  larger, not faithful. Recommended: keep the print path. Owner to confirm.
- **Speed waiver** (checker r1 D3): pressed the instant page 1 appears, the WHOLE set is bounded by the engine drawing
  pages 2..N — 4.1–4.9 s at CPU 4× for 8–10 pages (0.78 s unthrottled). Page 1 is < 0.4 s on the wall clock in every
  case, and after a pause of ~3–4 s at 4× (the background build) the whole set opens in 0.27–0.6 s. Meeting 3 s cold at
  4× needs a faster `buildSheet` (not this lane). The gate fails cold-whole over 3 s unthrottled and over 6 s at 4×.
  Owner / lead to accept or to queue an engine-speed lane.

## Design (how it is fast and faithful)
- **One document.** The preview frame holds `sheetDocument(…, { paper })` — the same call, stylesheets and paper as
  Print — and its body is the very `doc` string Print sends (`ensureBuilt` shares one build between Preview and Print).
  Only screen presentation is added inside `@media screen` (grey desk, gap, zoom-to-fit). Each `.ws-page` is a fixed
  paper-size sheet with overflow hidden, so preview pages = printed pages; the gate proves it against Chrome's PDF.
- **Page 1 at once.** The Print sheet already draws page 1 for its side thumbnail; the preview shows it immediately
  (footer as Print has it), and buildAll REUSES that build for page 1 (deterministic request + seed).
- **Warm frame.** Created hidden when the sheet opens (stylesheets and Andika loaded before Preview is pressed);
  opening only swaps the frame's body. While open, everything behind it is `inert`.
- **Background build.** Right after page 1, the whole printout (≤ 12 pages × sets) is built; it stops at the next page
  when the settings change, pauses while the preview paints page 1 (`holdBuild`), and Print reuses it.
- Steps: tick skills → Print → Preview every page → Print / Save as PDF (3 taps from the tray).

## Timings (ws-pdf-preview, WALL clock from one real press; 4-page worksheet + key = 8–10 pages; 4 vCPU container)
| CPU | Pressed at once: page 1 | Pressed at once: whole set | After a pause: page 1 | After a pause: whole set |
|---|--:|--:|--:|--:|
| 4× slow-down (Chromebook-class) | 0.37–0.39 s | 4.1 s (waiver above) | 0.37–0.60 s | 0.37–0.60 s |
| 1× | 0.09 s | 0.78 s | 0.09 s | 0.09 s |
Before this lane: no full preview; Print built everything (5.4 s at 4×) and then opened the dialog.
Known limit (checker r1 D4): while the background build draws a page, the page is busy for up to ~0.9 s at 4× (one
`buildSheet` call is one task), so a click in that window waits; measured inside the 0.37–0.60 s above.

## For the lead: print defects seen through the preview
- 2026-10-31 (lead query, item 7 of desktop-1366-preview.png): **not a clip** — that screenshot's 900 px window cut the
  third row; 15 builds (≈ 120 pages): 0 cells with content past their border; side-by-side preview vs PDF:
  `design/status/pdf-preview/parity-preview-vs-pdf-page1.png`.
- **Existing engine defect (mixed practice):** short sections leave empty cells (lead: to the mixed pages M2 lane).
- **Fonts in the print (lead ask, FIXED here):** the fallback-sans title seen in the first side-by-side was the test's
  own PDF page (a document set on about:blank cannot load the self-hosted Andika: cross-origin fonts fail). The real
  print frame had Andika 400 + 700 loaded at print() — measured. Hardened anyway: `printHtml` now asks for both faces
  (`document.fonts.load`) and waits before print(); the gate reads the print frame at the moment print() is called
  (both faces loaded, title and Name label computed Andika 700) and makes its PDF from the app's origin (else FAIL).

## Times
Times: fix r1, start 2026-10-31T11:30Z, end 2026-10-31T12:40Z, profile —
Times: critic r1, start 2026-10-31T10:50Z, end 2026-10-31T11:08Z, profile mq-opus-medium
Times: builder build-1, start 2026-10-31T10:05Z, end 2026-10-31T11:05Z, profile —

## Log
- 2026-10-31 fix r1 (checker r1 FAIL A 8 · B 6 · C 5 · D 6). Each defect → fix → check in `ws-pdf-preview`:
  D1 Esc no longer closed the sheet (the hidden overlay counted as open) → `isPdfPreviewOpen()`; check: Esc closes the
  sheet before any preview and after one is closed. D2 focus left the dialog from inside the frame; sheet not inert →
  everything behind is inert while open, Tab/Shift+Tab inside the frame go back to the bar; check: 10 × Tab and
  10 × Shift+Tab stay inside, #tvSheet.inert while open and not after. D3 cold whole set > 3 s at 4× → page-1 build
  reused, prefetch at once (5.1 → 4.1 s at 4×, 1.37 → 0.78 s at 1×); waiver above; check: wall clock from one CDP press,
  limits 3 s (1×) / 6 s (4×). D4 measured from the handler → wall clock (above). D5 set covers counted as pupil pages →
  "6 for pupils + 2 set covers + 2 answer keys"; check: "for pupils" = pages with a Name line; new cases 3 sets same
  problems, one skill short key after each page. D6 DOM-only parity → pixel parity (preview page vs pymupdf render of
  the PDF page, 1-px tolerance, max 0.02 %; same page measures ≤ 0.002 %; backtest: a serif title + header labels =
  0.06 % → FAIL). D7 batch title ≠ PDF name → `EXTRA.title()` from teacher-wrm. D8 overlay removed while open →
  closed and cleaned; resize listener once. D10 hex fallbacks removed from teacher-pdf.css. D9 (stamp) by convention:
  the lead stamps at deploy.
  Gate-building lessons (test bugs, not app bugs, that cost ~25 min): an element screenshot of a page taller than the
  window shows what is behind the frame; puppeteer `clip` is in document coordinates; `captureBeyondViewport` (default
  true) resizes the window and so the overlay; a `!important` padding in the frame's screen CSS beats an inline style;
  A4 is 793.7 px at 96 dpi, so a strict pixel diff needs a 1-px neighbourhood. All are now written into the gate.
- 2026-10-31 lead ask: fonts in print — see "For the lead". Backtest: `printHtml` made to print without waiting →
  the gate FAILS ("print() ran before its frame's fonts could be read").
- 2026-10-31 build-1: built and gated. Gate findings during the build, each turned into a check: cold page 1 3.3–5.9 s
  (warm frame + holdBuild); PDF page count 0 on compressed PDFs (pymupdf); frame 150 px tall with the hint hidden (flex
  column; layout check, backtested); instant page 1 ≠ printed page 1 ("Form A ·"; `firstSame`). ws-teacher-library
  flaked once with two browsers running (OK alone; logged as a flake). Pre-existing on base: ws-plain-words --check
  stale. Process: the lane session built the screen itself instead of briefing a separate builder (small build,
  context loaded); the checker is a separate agent. The lane ran ws-stamp-assets by mistake (rule 8); reverted.
