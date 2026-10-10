# Critic round 5: Wave 1 lane "Answer-key options" (MASTER_PLAN 4.4, INK-31), focused re-check

Lane tree `agent-a4ebafe2c94eb1dcd`, head `176757d9`. This is an independent critic run: the critic read and tested only, and changed no code.
The re-check covers R4-1 (the Print button label clipped at 1366x768) and confirms that the r4 passes still hold. It is graded against `design/audit/RUBRIC.md`, where a pass is 8 or more on all four criteria.
Critic probe and evidence are in `r5/critic/`. The builder's own screenshots are in `r5/`.

## Verdict: PASS

| Criterion | Score | Why |
|---|---|---|
| 1. Correct and complete content | **9** | Unchanged since r4. Every answer is on the key, and the sheet count in the caption equals the real document. |
| 2. Design contract (B&W + INK-31, owner rulings) | **9** | Unchanged since r4. The rendered key has orange answers and ring, with black boxes, lines and sign box. The blank backs carry only the small footer line. |
| 3. Fit to the owner's request / usability | **8** | R4-1 is closed. The label is never clipped at 1366x768, 1366x650, 1280x720 or 1024x768. The sheet count is a caption under the button and updates as the settings change. It is 8, not 9, because at 1366 the button is now always two lines (U-1). |
| 4. Engineering / regressions | **9** | The fix is small, and the CSS is additive and scoped to the Print button. `key-options` gains a no-clip check. All gates are green or at baseline on the lane and on a throwaway merge into current main. The merge needs a two-file conflict resolved (E-1). |

## R4-1: the Print button label. Fixed.

The probe is `r5/critic/critic-r5-ui-probe.cjs`, run on the real print screen with `add_facts`. It runs at 1366x768, 1366x650 (the visible height on a Chromebook), 1280x720 and 1024x768, and does the following:
- With the key at the end, it switches to After each page, turns new sheet on, switches to Short, back to At the end (the checkbox is hidden), then back to After each page.
- It turns the key off and on.
- With More Practice, it prints letters A to J (10 pupil pages), then A only.
- It adds a second section: `subtract within 20` on Independent with 5 pages, then all letters in section 1 (15 pupil pages). It then tries the short key and turns new sheet off.
- At each step it measures the button, its label and caption, every `button`, `p`, `span` and `label` in the setup panel, and the page itself.

Results:
- **No clipping anywhere.** 0 failures at 1366x768, 1366x650 and 1280x720. Button and label `scrollWidth <= clientWidth`, the label stays inside the button, and nothing in `#tvSetup` overflows. There are 0 console errors.
- **The label reads well.** At 1366 the button is 54 px tall and breaks only before "+ key", for example "Print 15 pupil pages / + key". At 1280 and 1024 it is one line, 48 px tall. With the key off it reads "Print 2 pupil pages" on one line at 48 px. The Print button and "Open in a new tab" have the same x position and width in every state. See `cmp-1366-lane-lane-main.png`, `ui-1366x650-ns.png` and `ui-1024x768-ns.png`.
- **The caption is correct and updates live.** It reads "On 4 sheets, double-sided." It changes to 20, 2, 12 and 30 sheets as letters and sections change, and in every state it equals 2 × the pupil pages. "Open in a new tab" on the 15-page printout gives 60 faces, `PBKB…`, which is 30 sheets. The caption is absent when new sheet is off, when the key is at the end, and when the key is off, and `aria-describedby` is then removed too, so no reference is left pointing at nothing.
- **Screen-reader text.** The accessible name is "Print 2 pupil pages + key" (the icon is `aria-hidden`), and the description is "On 4 sheets, double-sided." Both make sense.
- **Tappable.** The button is at least 48 px tall and as wide as the column. The caption sits 4 px under the button and above "Open in a new tab", so it reads as part of the Print button. At 1366x650 the Print button is in view without scrolling once the key options are chosen.
- The builder's `key-options` section 11 covers all three sizes, new sheet on and off, A/B and every letter, and a fake long count. It passes. It measures the same `scrollWidth` that showed R4-1.

## Regression check against current main (`claude/sweet-newton-c8wrv1`)

- With the same probe on main, the label was one line at 48 px. Main has no key options, so it has no caption. Nothing else in the setup panel moved, apart from the extra button height at 1366.
- **The page scrolls sideways at 1024x768 with two sections** (`scrollWidth` 1029). This happens on **main as well**, so it is pre-existing and not caused by this lane. 1024 is not an owner target size.

## r4 passes still hold

- `key-options` is OK on the lane and on the merge. Its checks cover given content black, key ink only on answers, no stroked text, the worked Model black, and the blank-back footer values.
- The More Practice `add_wp_10` key with After each page and new sheet on comes out in the order `PBKBPBKB`. On the key page the "+" sign is ringed in orange, the digits and unit words are orange, and the boxes, lines and word-bank box are black (`key-mp-addwp-copy.png`). The blank backs show only "This page is intentionally blank" in the footer band (`blank-backs.png`).

## Non-blocking

- **U-1 (cosmetic).** At 1366 the Print button always wraps to two lines ("Print 2 pupil pages / + key"), even with new sheet off. On main the same text fit on one line, only just. The wrap is clean and centred, but a one-line label would look tidier. A future option is a shorter label (for example "Print 2 pages + key") or a slightly smaller side padding.
- **E-1 (needed before merge, lead or builder).** Main has moved on since r4 (the touch-numerals lane and others), and a merge of the lane into current main **conflicts** in two files:
  - `js/modules/print-sheet.js`: main adds `touchFitLine()` just above `buildSheet`, and the lane renames `buildSheet` to `buildSheetCore` and adds a wrapper. Keep both: `touchFitLine` followed by `async function buildSheetCore`.
  - `design/STATUS.md`: two escalation lines. Keep both.

  With that resolution, every gate below passes on the throwaway merge, including `ws-touchdots`.
- N-5, N-6 and N-7 from r4 are recorded as open in `design/STATUS.md`. They are pre-existing, belong to other lanes, and do not block.

## Gates run (one at a time, through `/tmp/mq-browser-run.sh`)

| Gate | Lane `176757d9` | Throwaway merge into current main `b06b3eb3` (conflicts resolved as in E-1, not pushed) |
|---|---|---|
| `key-options.cjs` | OK | OK |
| `ws-teacher-preview` | OK | OK |
| `ws-teacher-shell` | OK. The first run aborted on the known font-load flake, and the exclusive rerun is OK. | OK |
| `ws-share-options` | OK | OK |
| `ws-boot-smoke` | OK | OK |
| `ws-print-lint --source kit` | 463 findings in 33 of 191 documents (= baseline) | 463 / 33 (= baseline) |
| `ws-code-snapshot.mjs` | OK (608 codes, nothing moved) | OK (608 codes, nothing moved) |
| `ws-touchdots` | — | OK (2289 checks) |
| UI probe (`critic-r5-ui-probe.cjs`) | 0 failures at 1366x768, 1366x650 and 1280x720. At 1024 the only failure is the sideways scroll, which main has too. 0 console errors. | — |
