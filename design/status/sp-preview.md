# sp-preview lane: Larger preview pane and hover zoom (simple print)

Owner request 2026-11-05. Branch `claude/sweet-newton-c8wrv1-sp-preview`.

## Round 1 (9c6806317): independent check FAIL 6/7/7/7

| Defect | Fix | Check that now catches it (FAILs on 9c6806317, passes on the fix) |
|---|---|---|
| D1 zoom covers the pointer at 820x1180 | `zoomBox()`: the zoom goes on the wider free side of the pointer, its width capped to that space (24 px gap, 16 px edge), height follows the A4 ratio; no zoom under 320 px wide | ws-simple-print `ZOOMCOVER` (1366x768 and 820x1180, thumbnail and pane, 3 pointer positions each; also on screen) |
| D2 zoom in the pane smaller than the page under it | the zoom shows only when it is >= 1.3x as wide as the element under the pointer; in the pane (sheet 748-820 px) that means no zoom | `ZOOMGAIN` |
| D3 sets > 1: set 2 pupil pages captioned as the key | key read from each page (`.ws-key`, the "Answer Key" name line), set from its own "Set n of N" footer; a "Set n" divider at each set and "Set n answer key" at each key; captions "Set 2 · page 1 of 2", "Set 2 · answer key page 1 of 2" | `SETS2` (the exact order of dividers and captions for 2 sets x 2 pages + key) |
| D4 zoom keeps old pages after a rebuild | `hideZoom()` in `schedule()` and `run()` | `ZOOMSTALE` |
| D5 page list focus ring 1 px auto | `.sp-lg-scroll:focus-visible` gets the dialog's 3 px `--sp-ring` | `FOCUSRING` (open the pane from the keyboard, read the computed outline) |
| D6 gate gaps | the five checks above | - |
| D7 no Print in the pane; header "12 pages" | Print button (44 px, primary) in the pane header; header "2 sets · 4 pupil pages + 4 answer key pages" (390: the count wraps to its own line) | `PANEPRINT` |

Speed note: D1-D3 were all "checked at one viewport / one setting only". Rule for the next pointer or overlay feature: the
gate hovers at 1366x768 AND 820x1180 portrait, asserts the overlay never contains the pointer and is larger than its source,
and every multi-part print feature is checked with Sets = 2.

Screens: `design/status/sp-preview/` (normal-1366, larger-1366/820/390, larger-sets2-1366, pane-hover-1366 (no zoom),
hoverzoom-1366/820).
