# Critic round 4: option-panel sample (lf-partopts panel), plus the lesson part-settings follow-up

Independent critic, 2026-11-13. This is a narrow re-check after the round-3 FAIL (`critic-panel-r3.md`, branch
`claude/sweet-newton-c8wrv1-lf-partopts-panel-critic-r3`).

**Trees graded**
- Panel: `claude/sweet-newton-c8wrv1-lf-partopts-panel` at 30a4674f5. It has master b9414a659 merged in.
- Follow-up: `claude/sweet-newton-c8wrv1-lf-partopts` at 52ae01e44.
- Gate comparison only: 6de83995e, the round-3 panel state.

**How I drove it**
- My own Playwright scripts (Chromium 153), not the builder's tools. They are in
  `design/partopts/panel-sample/critic-r4/logs/`.
- **Scrollbars as a teacher sees them.** Playwright's headless launch adds `--hide-scrollbars`, so no scrollbar
  appears in any default headless screenshot, the gate's included. For the scroll checks I removed that flag
  (`ignoreDefaultArgs: ['--hide-scrollbars']`) and rendered three ways:
  - classic scrollbars (Windows and Linux desktop Chromium);
  - a touch tablet (`isMobile` and `hasTouch`, which gives overlay scrollbars);
  - desktop Chromium with `--enable-features=OverlayScrollbar`, which is the ChromeOS default.
- **Widths.** 1280×1000, 1366×768, 1024×768 and 820×1180, with a 1280×720 spot check. 820 was also run as a touch
  tablet. No 390 width and no size S.
- **Print.** Sizes M and L only.

## Verdict: FAIL

The panel FAILs on one criterion at tablet widths. Everything else in this round passes.

- **N1 slicing is fixed.** No drawing is cut into viewBox slices any more (`svg[data-sko-vb]` = 0 on every part of
  all 18 skills, at every width). No label or shape is cut. "50", "−11", "minutes" and "Value" all read whole.
- **What replaced the slices.** A drawing too wide for the frame is drawn whole at the 9 px floor, and the frame
  scrolls.
- **The cue is missing on tablets.** On a desktop with classic scrollbars, the scrollbar is the cue. On a touch
  tablet, and with ChromeOS overlay scrollbars, nothing shows that the frame scrolls. By the lead's ruling this is a
  C1 finding (**N1-cue**). For hotspot_quads, the hidden part is shapes the question asks about.
- **P1 is fixed.** A real mouse click and a real touch tap change every tick box, All, None and select I tried. The
  "?" still opens its tip.
- **FU-1 is fixed.** The follow-up branch passes. The steppers, the section line, the preview tabs and the printed
  packet agree after M → L → M.
- **Gate.** `ws-options-shots` FAILs 6de83995e and passes 30a4674f5.
- **Point 4.** Skipping master's `tvFitSample` hook leaves two fits in competition. The only visible cost is a
  50–70 ms flash (N4, nit). Master's SAMPLE-VISIBLE check still holds at 1.3 s.

## Scores

### Option panel (30a4674f5)

| Width | C1 Ease of use | C2 Educational value | C3 Spacing and layout | C4 Standard fidelity |
|---|---|---|---|---|
| 1280×1000 (desktop, classic scrollbars) | 8 | 8 | 8 | 8 |
| 1366×768 (desktop, classic scrollbars) | 8 | 8 | 8 | 8 |
| 1024×768 (tablet landscape: overlay scrollbars) | **7** | 8 | 8 | 8 |
| 820×1180 (tablet, touch) | **7** | 8 | 8 | 8 |
| 1280×720 (spot) | 8 | 8 | 8 | 8 |

**C1, desktop = 8.**
- Labels are whole on every part.
- Option controls take a real pointer (P1 fixed).
- A scroll frame is reached by Tab and scrolls with the arrow keys (`logs/keyboard-scroll.log`). It also scrolls
  with Shift + wheel and with a touch drag.
- The classic scrollbar shows that there is more (`03`, `07`).
- On a Chromebook the score is 7. ChromeOS uses overlay scrollbars, so the cue disappears there as on a tablet
  (`05`).

**C1, tablet = 7.**
- Seven skills hide part of the drawing behind a scroll that nothing points to: `04` and `06`, with no cue after
  3 s.
- The only hint is a shape or bar cut at the right edge (`06`: "isc…").

**C2 = 8.**
- Nothing is misstated now. The 50 tick reads 50, and −11 reads −11 (`01`, `02`).
- The double number line keeps its row labels (`08`). The histogram keeps its y-axis and labels (`03`).

**C3 = 8 (nits).**
- Every number-line skill shows a 15 px scrollbar for 4 px of overflow (`01`).
- On seven skills the horizontal bar adds a second, vertical scrollbar for 9 px (`03`, `10`).
- Round 3's near-empty parts remain:
  - probability_basic part 3 is one "Certain" card (`15`);
  - measure_angles part 2 at 1366 and 1024 is at 9 % fill.

**C4 = 8.**
- Inside the frame the sample is black and white and Andika throughout.
- The panel chrome is outside the frame.

### Follow-up: teacher Print, lesson part settings (52ae01e44, M and L)

| Width | C1 Clarity | C2 Correctness | C3 Layout | C4 Consistency |
|---|---|---|---|---|
| 1280 | 8 | 9 | 8 | 8 |
| 820 | 8 | 9 | 8 | 8 |

The follow-up PASSES. FU-1 is fixed. The details are under FU-1 below.

## Checks

### 1. N1: the sliced drawings (`logs/n1-scroll.log`)

I checked all 18 skills in round 3's `sliced-skills.txt`, which includes the 10 named in the brief. I walked every
part at the 5 sizes and on the 820 touch tablet: 108 runs.

| Skill(s) | Now | Hidden by the scroll |
|---|---|---|
| nl_add, number_line_add, nl_sub, number_line_sub, **nl_mult**, **nl_div**, **add_int**, **sub_int**, **add_negative**, sub_negative | The line is whole, with no label cut (`01`, `02`). The frame is flagged scroll for 400 / 396 px. | 0 labels. A 4 px scroll and a 15 px scrollbar on desktop: N5 |
| **fraction_of_set_hard** | Whole at 1280×1000 and 820. It scrolls vertically at 1280×720, 1366 and 1024 (`09` style, row 6 at the edge). | The 6th row at 720 |
| **double_num_line** | Both rows keep their labels, and "minutes" is whole (`08`). | The right end of both lines (2 labels) |
| **hotspot_quads** | Every shape box is whole within the scroll (`07`). | 1–2 of the 5 shapes, which are **part of the question** |
| **coordinates_read_all** | Part 2 scrolls both ways (469–474 px) (`09`). | 2–5 axis numbers. Point A is in view |
| line_plot | Scrolls 32 px. | 0 labels |
| box_plot_intro, box_plot_quartiles | Axis whole (`10`). | The "25" end label |
| **histogram_read** | Y-axis, "Frequency" and "Value" are whole (`03`). | The 60–70 bar and its label |

- My own cut tests found nothing cut in any run:
  - a text node partly inside the frame's visible box;
  - SVG text outside its own viewport;
  - a viewBox slice.
- The only partly visible texts were at the scroll edge, which is what scrolling means.

**The cue (lead ruling: a visible cue is the pass bar).**

| Rendering | Scrollbar | Other cue | Result |
|---|---|---|---|
| Desktop Chromium, classic scrollbars | 15 px, horizontal and vertical (`03`, `07`, `10`) | none | cue present |
| Touch tablet, 820 (`isMobile`, `hasTouch`) | 0 px overlay. A thin bar shows only during a scroll and is gone after 3 s (`04`, `06`). | none | **no cue** |
| Desktop with OverlayScrollbar (ChromeOS default), 1366 | 0 px (`05`) | none | **no cue** |

Other properties of the scroll frame:
- `scrollbar-width` and `scrollbar-color` are `auto`, and no rule hides the bar.
- `touch-action` is `auto`. A CDP touch drag scrolls the histogram 122 px.
- Keyboard: Tab from Previous reaches the frame. Chromium 153 makes a scroller focusable, although the frame has no
  `tabindex`. ArrowRight × 2 scrolls 80 px.
- The frame is `role="img"`, which is an odd role for a focus stop (nit).

### 2. P1: real pointer on rows with a "?" (`logs/p1-real-pointer.log`)

Skills: mult_chart_easy, geo_translate, fraction_of_set. At 1280 I used `page.mouse.click`, and at 820 I used
`page.touchscreen.tap` in a touch context. I clicked at the centre of each control.

| Control | Result |
|---|---|
| tick box | Changes, e.g. `111111111111 → 011111111111` |
| All | Ticks all |
| None | Clears all |
| select | Takes focus and changes on ArrowDown + Enter |
| any of the above | `elementFromPoint` is the control itself in every case. No tip opened. |
| "?" | Still opens its tip (`aria-expanded=true`, line shown) |

- The "row gone" lines at the end of each block are not a defect. They come from rows inside the closed "Pupil play"
  `<details>`: their boxes still report coordinates, and my click landed on Done.

### 3. FU-1: teacher Print follow-up (`logs/followup.log`, scenarios `logs/fu.json`)

| Scenario | Stepper after M → L → M | Section line | Preview / tabs | Packet opened in a new tab |
|---|---|---|---|---|
| fact_family_sort, 1280 | Practice **45 · 5 pages of 9** | "Lesson · 5 practice pages" | chart, sheet, 5 × practice; 8 tabs (Page 1–7 + keys) (`12`) | 7 pupil + 7 key pages; 5 practice pages × 9 cells = 45 |
| fact_family_sort, 820 | 45 · 5 pages of 9 | same | same, 8 tabs | same |
| Y4.B1.S14, 1280 | Practice **75 · 5 pages of 15**, Mixed **42 · 2 pages of 21** | "5 practice pages + mixed" | 5 practice + 2 mixed; 10 tabs (`14`) | 5 × 15 practice + 2 × 21 mixed, keys matching page for page |
| Y4.B1.S14, 820 | same (`13`) | same | same | same |

- No KEY-MISMATCH, OVERFLOW or R1-LINT line.
- Two pv cells carry an EB-SIDE advisory at 32.8 %. That is the same as round 3, and it is a print-template note,
  not this lane.

### 4. The `tvFitSample` hook skipped in the merge (`logs/flash-after-paging.log`)

**What the hook does on master.** It was added in 3b324bcc8 ("lf-roles r8: teacher-preview F8 - one fit for the
options popover's sample").
- teacher-preview exports `fit()`, and teacher-shell exposes it as `window.tvFitSample`.
- Master's `_tidySample` then calls `tvFitSample(frame)` and returns. There is ONE fit, so a second transform can no
  longer re-centre a cropped stage off the frame.
- Master's failing case was a blank sample for growing_shape_patterns and pattern_features (lf-algebra).
- The guard is ws-teacher-shell SAMPLE-VISIBLE: the stage is at least 50 % inside its frame at 1.3 s.

**What the panel does instead.**
- It keeps its own `_tidySample`, which owns the paging and the scroll placement.
- teacher-preview `fit()` now skips the crop inside `.tv-sko-sample`, and `_tidySample` removes `is-cropped`. So the
  blank-sample cause is closed another way.
- `window.tvFitSample` is still exposed (teacher-shell.js:384), but nothing calls it.
- The two lf-algebra skills are not in this tree's or master's `data.js`, so they cannot be opened here.

**What is lost: the "one fit" property.**
- teacher-preview still runs its own `fit()` on the panel's stage at about 900 ms (`teacher-preview.js:277-279`).
- `_tidySample` undoes it at 950 ms (`skill-options-ui.js:1199`).
- If a teacher pages to a scroll part within the first 0.9 s, the stage drops to **25–28 %** inside the frame for
  3–4 frames (about 50–70 ms):
  - histogram_read: 952–985 ms;
  - coordinates_read_all: 943–993 ms.
- On a part shown whole there is no drop.
- Master's SAMPLE-VISIBLE samples once at 1.3 s, so it passes and cannot see this.
- The lf-roles lane is checking this hunk separately.

### 5. Spot check: 12 more skills (`logs/spot-summary.txt`, `logs/spot.log`)

| Family | Skill |
|---|---|
| counting | count_objects |
| comparing | compare_groups |
| subtraction | subtract |
| fraction_operations | add_fractions_like |
| decimals | add_decimal |
| area_perimeter | area_unit_squares |
| angles_lines | measure_angles |
| measurement | time_half_hour |
| probability | probability_basic |
| order_of_operations | oop_medium |
| number_sense | rounding_visual |
| number_theory | factors_identify |

I ran each at 1280, 1366, 1024 and 820, and changed one option per skill with a real mouse click at the control's
centre.
- **Option change.** 12 of 12 hit the control.
- **Tick boxes and selects.** Every tick box changed the summary and the sample.
- **count_objects, compare_groups and subtract.** My ArrowDown did not change these selects, because their default
  is the last option. ArrowUp changes all three (`logs/select-recheck.log`).
- **No defects found:** no page error, no sideways page scroll, no clip box, no text crossing the frame and no
  repeated sentence. Done and Reset are inside the window at every size.
- **Smallest text:** 9.0 px HTML, 9.0 px SVG.
- **Low fill:**
  - subtract and add_decimal are 10–11 % (one equation line, which is fine);
  - measure_angles part 2 is 9 % (four answer chips);
  - probability_basic part 3 is 4 % at 1366 and 1024 (`15`).
- **time_half_hour** (`16`). The clock is drawn small with spare frame height (round 3's N3), and an orphan short
  rule sits under the answer boxes. Both are nits.

### 6. The gate

I ran the 30a4674f5 gate as
`node tests/scripts/ws-options-shots.cjs --skill multiplication:nl_mult,integers:add_int --widths 1280 --workers 1`.
The flag is `--skill`; there is no `--only`. 6de83995e was served with `MQ_ROOT`.

| Product tree | Final line | Families |
|---|---|---|
| 6de83995e | `ws-options-shots: FAIL (16)`, exit 1 | `[slice]` (`<line>`, "−7"), `[inside]` ("50", "60", "−11"…), `[hit]` (all controls → `button.sko-tip`; the tree predates the P1 hotfix) |
| 30a4674f5 | `ws-options-shots: OK (2 skills × 1 widths)`, exit 0 | none |

Logs: `logs/gate-on-6de83995e.log`, `logs/gate-on-30a4674f5.log`.

The gate cannot see N1-cue. It runs headless with `--hide-scrollbars` and has no notion of a scroll frame.

## Findings

### N1-cue · Major (C1, tablets and Chromebooks) · new with the N1 fix: a scroll frame gives no sign that it scrolls

Seven skills page a drawing by scrolling the frame:
- double_num_line, hotspot_quads, coordinates_read_all and line_plot;
- box_plot_intro, box_plot_quartiles and histogram_read.

fraction_of_set_hard also scrolls, at 1280×720, 1366 and 1024.

With overlay scrollbars, nothing in the panel says there is more: 0 px gutter, no fade, no arrow, no text
(`04`, `05`, `06`). Overlay scrollbars are what touch tablets and ChromeOS use. On hotspot_quads the hidden shapes
are part of the question.

*Fix direction:*
- A visible in-frame cue on `.tv-sko-frame.is-scroll`, for example a right-edge fade with a "Scroll →" chip, kept
  while `scrollLeft < scrollWidth − clientWidth`.
- Or the existing Next / "n of N" control reused as "drag to see more".
- Or an always-visible styled scrollbar on this frame. `::-webkit-scrollbar` sizing makes it classic on ChromeOS and
  Android, though not on iPad Safari.

*Check:* ws-options-shots `[scroll-cue]`. For each `.tv-sko-frame.is-scroll` whose
`scrollWidth > clientWidth + 8` or `scrollHeight > clientHeight + 8`:
- open the panel in an `isMobile: true, hasTouch: true` context, which gives overlay scrollbars;
- fail unless a visible cue element (`[data-sko-scroll-cue]`, or an agreed class) is inside the frame box and
  displayed;
- in the default run, also fail when `offsetHeight − clientHeight == 0` while there is no cue element;
- add a backtest row: FAIL on 30a4674f5 (histogram_read, hotspot_quads), PASS on the fix.

### N4 · Nit (C1) · point 4: two fits on every open; a 50–70 ms off-frame flash when paging early

See check 4. *Fix direction:*
- teacher-preview's settle-time `fit()` skips frames inside `.tv-sko-sample`, the way its crop branch already does.
- Or `_tidySample` registers itself as the frame's fitter, so the 900 ms pass calls it.

*Check:* extend ws-teacher-shell SAMPLE-VISIBLE.
- Click Next to a scroll part at 200 ms.
- Record the stage-in-frame share on every animation frame from 0 to 2.5 s (the rAF poll in `logs/flick.cjs`).
- Fail on any frame under 50 %.

### N5 · Nit (C3) · scroll chrome without need

- The ten number-line skills flag `is-scroll` for 4 px of overflow (400 / 396). On a desktop this draws a 15 px
  scrollbar with a nearly full thumb (`01`).
- On seven skills, the horizontal bar's 15 px makes a 9 px vertical overflow and a second scrollbar (`03`, `10`).

*Fix direction:*
- Fit drawings that are within about 2 % of the frame instead of scrolling them.
- Size the frame for the gutter (`scrollbar-gutter: stable` or the height plus the bar).

*Check:* in ws-options-shots, fail `[scroll-min]` when an `is-scroll` frame overflows by less than 12 px on either
axis, or overflows vertically only by the scrollbar thickness.

### Carried nits (unchanged from round 3, not scored down further)

- N2 near-empty parts: probability_basic part 3 (`15`) and measure_angles part 2.
- N3 small whole samples with spare height: time_half_hour (`16`).
- The scroll frame is `role="img"` but is a Tab stop. Give it `role="group"` with the label, or keep `img` and add
  `tabindex="0"` with an `aria-describedby` that says it scrolls.

### Fixed this round

| Round-3 finding | Now | Evidence |
|---|---|---|
| N1 slices cut labels and shapes | Fixed: no slices, no cut labels at any width | `01`, `02`, `03`, `08`, `logs/n1-scroll.log` |
| P1 the "?" hit area swallows its row | Fixed: real mouse and touch change the controls; the "?" still opens | `logs/p1-real-pointer.log` |
| FU-1 stepper and packet disagree after M → L → M | Fixed at 1280 and 820, for both scenarios | `11`–`14`, `logs/followup.log` |

## Evidence index (`design/partopts/panel-sample/critic-r4/`)

| # | File |
|---|---|
| 01 | nl_mult-1280-part2 |
| 02 | add_int-820touch-part2 |
| 03 | histogram-1280-scrollbars |
| 04 | histogram-820touch-no-cue |
| 05 | histogram-1366-overlay-no-cue |
| 06 | hotspot_quads-820touch-no-cue |
| 07 | hotspot_quads-1280-scrollbars |
| 08 | double_num_line-1280 |
| 09 | coordinates_read_all-1280x720 |
| 10 | box_plot_intro-1280-two-scrollbars |
| 11 | fu-ffs-MLM-1280-parts |
| 12 | fu-ffs-MLM-1280-tabs |
| 13 | fu-r14-MLM-820-parts |
| 14 | fu-r14-MLM-1280-tabs |
| 15 | probability_basic-1024-part3 |
| 16 | time_half_hour-1280-after-change |

The logs and scripts are in `logs/`.
