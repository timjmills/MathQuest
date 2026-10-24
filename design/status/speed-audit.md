# Speed audit

## Per-round findings

### Teacher site 2.0 T1 (mock-up), rounds r1–r5 (lane lead session_016hL18AgyxsUYPBST63Xeki, 2026-10-23)

**(1) Automatic checks — critic findings a machine could have measured**

| Round | Finding | Check that measures it | Existing check should have caught it? |
|---|---|---|---|
| r1 | Lessons squeezed / sideways scroll at 1024 and 820; panel buttons clipped 16 px | page sideways scroll + child-past-parent overflow at 1366/1280/1024/820/390 (now in `shoot.cjs`) | yes in spirit: §2.9 already named those widths, but the first shoot script only ran 1366 and 390 |
| r1 | Thumbnails contradict skill names | thumbnail ↔ skill content check (now `thumbs-check.cjs`) | no check existed |
| r1 | Strips hiding options sideways at 390 | element scrollWidth > clientWidth on any strip | no |
| r1 | Raw sizes in `app.js` inline styles | token gate scans JS inline `style=` (now check 9) | no: the gate only read CSS |
| r1/r2 | Chip and tray names truncated ("Addi…"), area word spilling past chip | text clipped in own box / ellipsis / name narrower than ~8 ch (now in `shoot.cjs`) | no: overflow checks were page-level only |
| r2 | Skills at 820: 110 px search, 113 px cards, mid-word title breaks | min search width, min card width, mid-word break detector | no |
| r2 | Operations #2E2B71 reads as ink; dark tint 1.05 : 1 | bold vs ink ΔE ≥ 20 and ≥ 2 : 1; dark tint ≥ 1.2 : 1 vs page (now checks 10–11) | no: the gate compared areas with each other, never with ink or the page |
| r2 | Controls 36 px | every control ≥ 44 × 44 (height AND width) | partly: §2.8 rule existed, no check |
| r2 | Tick box covering the drawing | overlap of tick box and thumbnail content box | no |
| r3 | Tray grows to 45 % of screen at 10 skills | tray height ≤ 96 px / ≤ 15 % viewport at 1–200 skills (now in `shoot.cjs`) | no |
| r3 | Decoy pictures (generic counters, fixed ¾ bar) | picture data-* values vs the problem's numbers | no: the r2 fix added a check that pictures *exist*, not that they *match* |
| r3/r4 | Preview counts ≠ summary line | per-skill counts in preview == `plan().counts` for several weightings | no |
| r4 | ~35 base drawings contradict names (unlike denominators, rounding place, Mode) | content checks per name class; ROOT: draw from the real generator | no: check only covered the added pictures, not the base drawing |
| r4 | Search placeholder "2.NBT.5" finds 0 | placeholder examples must each return ≥ 1 hit via the real finder | the CLAUDE.md rule (use `skill-finder.js`) should have been in the brief; no check |
| r4 | "+N more" alone at 1024/820; close buttons 22–39 px wide | ≥ 1 named item before "+N"; 44 px width rule | partly (height-only 44 px check) |
| r5 | ~120 captured thumbnails garbled (SVG font-size overridden by capture reset) | compare each thumbnail's text sizes/boxes (or pixels) with the app's own `buildSheet` cell | no: `thumbs-check` checked min size and bounds, not fidelity to the app |
| r5 | Crop cuts line starts | no text line starts left of its crop window | no |
| r5 | 820 big-tray bar "+6 areas" only | same rule as r4 "+N" generalised to area segments | the r4 check was too narrow (chips only) |

**(2) Speed-ups — what cost time, and the smallest change that saves it**

| Round | Cost | Smallest change |
|---|---|---|
| r1 | Builder checked only 1366/390; critic found 1024/820 breaks → a full round | Mock-up briefs name all five §2.9 widths and require page + in-panel overflow checks from the first build |
| r1–r5 | Thumbnails cost four rounds (hand drawings → pictures → captured DOM → live) | For a mock-up, use real app rendering from the start or neutral placeholders; never hand-drawn stand-ins of real content (lead time-box now in place) |
| r2 | Same chip truncation fixed twice because the check didn't exist | Stop rule applied at the first repeat, not the second: when a critic finding is measurable, the fix commit must include its check |
| r2–r4 | Owner design changes arriving mid-round (palette, grade badge, stone, tray scale, popup, weights, views, Each page) re-opened screens the critic had graded | Batch rule (now owner rule): queue ideas, one approval sitting, one build + one critic round |
| r3 | Tray had no height budget, so the 40–100 skill requirement came late and forced a redesign | Every fixed bar/panel gets a size budget (px and % of viewport) in the brief, tested at extreme content counts (1, 10, 100) |
| r4 | Search built label-only despite the CLAUDE.md rule | Lane briefs quote the CLAUDE.md rules that touch the screen (search → `skill-finder.js`; generation → `generateQuestionFor`) |
| r5 | 6 MB captured samples slow every critic page load and shoot run | Live lazy rendering (in progress) or placeholders; budget page weight in the brief |
| all | Builders ran 1-2 h per round; critics re-wrote their own probes each time | Keep the critic's probe scripts in the lane folder (`design/mockups/teacher-2/critic-tools/`) so each builder runs them before reporting |

### Teacher site 2.0 T1, round r6 (2026-10-24)

**(1) Automatic checks**

| Finding | Check that measures it | Existing check should have caught it? |
|---|---|---|
| ~1 in 5 live thumbnails crop away the drawing (Line Plots blank, elapsed-time cards alike) | the crop window must contain ≥ X % of the cell's drawn-content box (SVG/IMG/canvas union), and distinct skills' crops must differ | no: `thumbs-check` compared text size and position, not drawing visibility |
| Held % shows "✓ Equal" in the Print sheet; More silently releases the lock | every weight display of a locked item shows its % and lock; any change to a locked item needs a confirm | no |
| Single skill + lock gives 16·8·8·8·0 (40 %, one skill dropped) | every non-zero-weight skill gets ≥ 1 problem, or a visible ⚠; the locked share is honoured within rounding | partly: the % check covered Mixed only |
| Phone detailed headers inline → 1 row visible; Chips/Thumbnails rows 102/322 px | rows-in-first-viewport check in EVERY view, not only List | partly: the r5 check covered List only |
| Tray Chips with ≥ 4 areas: no area word and no legend | the area name is visible for every chip (own label or a stack legend) | the r4 rule existed per stack; not run on this state |
| Pill ✓ overlaps text on phone; 820 bar hides "+N" | text-overlap probe on selected pills; "+N" present when areas are hidden | partly |
| Quiz "6 areas" while one area gets 0 | the summary's area count = areas with ≥ 1 item | no |

**(2) Speed-ups**

| Cost | Smallest change |
|---|---|
| Each fixed check was scoped to the state that failed (List only, Mixed only, chips only), so the same class reappeared in a sibling state | Write each check over ALL views × kinds × widths from the start (a state matrix in shoot.cjs) |
| The live-thumbnail fix judged success by text metrics, so a crop hiding the picture still passed | Fidelity checks compare what is VISIBLE in the final crop, not only the source |
| Six critic rounds for one mock-up | For T2+, the critic's probe scripts run inside the builder's verify step (kept in the lane folder), and every brief carries the full state matrix |
