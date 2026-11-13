# Critic round 3: option-panel sample (lf-partopts panel), plus the lesson part-settings follow-up

Independent critic, 2026-11-13.

**Trees graded**
- Panel: `claude/sweet-newton-c8wrv1-lf-partopts-panel` at 6de83995e.
- Follow-up: `claude/sweet-newton-c8wrv1-lf-partopts` at 219e8d907.
- For comparison only: master fdfddfdd2 and the round-2 tree b1a462051.

**What I drove**

I used my own Playwright scripts (Chromium 1243), not the builder's tools. The scripts are in
`design/partopts/panel-sample/critic-r3/logs/`.

- **Teacher route.** Teacher mode → Sets → the skill's Options button → `#skillOptionsPopover`.
- **Paging.** I walked every part by keyboard: focus Next, then Enter and Space alternately. I read every part.
- **Option change.** I changed the first option (a select by `selectOption`, a tick by a click) and read the panel at
  +50 ms and +1.5 s. I then walked the redrawn parts by mouse.
- **Readings per part.** For each part I measured:
  - the smallest HTML and SVG text as drawn;
  - overflow boxes inside the stage;
  - text that crosses the frame;
  - labels cut by a viewBox slice;
  - sideways scroll;
  - Done inside the window;
  - the part's ink fill;
  - repeated sentences.

**Coverage**
- 27 skills at 1280×1000, 1366×768, 1024×768, 820×1180 and the 1280×720 spot check (`logs/sample-A-B-C.txt`).
- 16 more skills at the four widths (`logs/sample-D-E.txt`).
- A sweep of all 725 option skills at 1280×1000: open and walk every part (`logs/sweep-725-at-1280.txt`).

**Scope**
- Widths are 1280, 1366, 1024 and 820. Phone width 390 is out of scope, so round-2 F4 is dropped.
- Print is M and L only.

## Verdict: FAIL

Round 2's findings F1, F2, F3, F5 and F6 are fixed. I took my own screenshots of each.

Round 3 brings in a new defect class, **N1**. The new "overlapping viewBox slices" paging cuts labels and shapes at
the slice edge:
- multiplication:nl_mult shows **"5"** at the 50 tick;
- integers:add_int shows **"11"** where the line reads −11;
- "minutes" becomes "inutes";
- histogram bars and quadrilateral boxes are cut in half.

18 skills are paged by slices, and 10 of them show a cut label or shape at every width. The gate passes all of them.

I also found **P1**, a master defect that is live today. In this panel, every option row that has a "?" help button
cannot be changed by mouse or touch. A click or tap on a tick box, an All / None button or a select opens the "?" tip
instead.
- **Cause:** the 44 px hit area `.tv-sko .sko-tip::after { position:absolute; inset:-9px }` (`css/teacher.css:963-966`)
  hangs off a button that `.sko-has-tip > .sko-tip { position: static !important }` (`css/ui-components.css:8448`)
  made static. Its containing block is therefore the whole `.tv-sko-row`.
- **Not caused by this lane.** It is the same on master and on b1a462051 (`logs/P1-*.txt`).
- **Why no gate saw it.** ws-options-shots changes options with a DOM `el.click()`, which never hit-tests.

The follow-up branch also FAILs.
- **Fixed:** P6 (every tab shown, wrapping) and F1 (the doc count).
- **New from the F2 fix (FU-1):** after a size round trip M → L → M, the stepper shows the teacher's 45 again,
  "5 pages of 9", and the section says "5 practice pages". The packet the screen previews and prints holds 1 practice
  page of 9.

## Round-2 findings

| r2 | Finding | Now | Evidence |
|---|---|---|---|
| F1 | 12 × 12 chart clipped inside the stage | **Fixed.** The chart pages in four 6 × 6 tiles (1 of 4 … 4 of 4). The heading row and row labels are kept on every tile, and digits are 17 px. No overflow box clips anything in the stage at any of the five sizes (`clips` empty for all 725 skills at 1280). The 5 × 5 chart is still whole. | `01`, `02`, `03` |
| F2 | MC figures split across parts, unlettered | **Fixed.** The question and the original come first, then A–D lettered, two to a row, on one part. At 1280×1000 and 820 that is 2 parts. At 1280×720 it is 3 parts, and all four choices are still on one part. geo_reflect and rotate_quarter_turn behave the same. | `04`, `05`, `06` |
| F3 | SVG labels under 9 px | **Fixed.** The geo "original" tag is 9.8 px at 1280 and 820, and 9.0 px at 1366 and 1024. fraction_of_set group numbers are 9.2–10 px. No SVG text under 9 px was found in the 43-skill sample, at any width. | `07`, `logs/sample-*.txt` |
| F5 | Clamped summary reachable by hover only | **Fixed.** algebra_all with a long "Which skills" list clamps to 2 lines (36 px). "Show all" (56 × 44) appears and is reached by Tab. Enter opens it. A touch tap on it toggles at 820 and 1024. Done stays in the window. | `08`, `09`, `logs/f5.cjs` |
| F6 | Story printed twice | **Fixed.** multi_step_word part 1 is the story once. Part 2 is Step 1, part 3 is Step 2. No repeated sentence of 20 or more characters appears in any part of any of the 725 skills. | `10`, `logs/sweep-725-at-1280.txt` |
| F4 | Room at 390 | Dropped by the owner (390 is out of scope). | – |

Checks that hold everywhere I looked (43 skills × 4–5 sizes, and 725 skills at 1280):
- no page error;
- no sideways scroll;
- Done and Reset inside the window, including at 1280×720 and 1024×768;
- the part count resets to 1 after a change;
- on the last part, Next is disabled and focus moves to Previous;
- no blank or stale frame at +50 ms or +1.5 s.

## Scores

### Option panel

The frame is 400 px wide at every graded width, so the defects below appear identically at each width.

| Width | C1 Ease of use | C2 Educational value | C3 Spacing and layout | C4 Standard fidelity |
|---|---|---|---|---|
| 1280×1000 | **7** | **7** | 8 | 8 |
| 1366×768 | **7** | **7** | 8 | 8 |
| 1024×768 | **7** | **7** | 8 | 8 |
| 820×1180 | **7** | **7** | 8 | 8 |
| 1280×720 (spot) | **7** | **7** | 8 | 8 |

The table grades the sample, which is the lane's work. If the panel is graded as the teacher meets it, P1 caps C1 at
**3** at every width: no option with a "?" can be changed by mouse or finger. P1 is not this lane's regression, but it
lives in the host this lane owns.

- **C1 = 7.** Most of the sample is very good to use. The question line is 9.0–18 px everywhere, paging works by
  mouse, Enter and Space, and the arrows are 44 px.
  - *Why 7:* on the 18 slice-paged skills, labels are cut at the slice edge or the frame edge. On nl_mult the 50 tick
    reads "5" (`31`), on add_int −11 reads "11" (`32`), and "minutes" reads "inutes" (`13`). A teacher would notice.
- **C2 = 7.** For tables, MC items, word problems and graphs, the sample is the real item at the chosen options. It
  pages along units of meaning (tiles keep their headings, the choices stay together).
  - *Why 7:* the sliced drawings misstate the item. A "5" where the line says 50, or "11" for −11, are wrong numbers.
  - The halves of a double number line (`13`, `14`) and of a histogram (`29`, `30`) appear without their row labels
    or axis on the second slice, so the representation stops teaching.
- **C3 = 8.** Every frame is in place, and Done and Reset are always in view.
  - Short parts float in the 300 px frame. Pie chart part 1 is three text lines, and part 4 is four chips
    (`15`, 1024×768: four parts where 1280×1000 has three). build_bar_graph part 2 is one line of text at 4 % fill
    (`16`).
  - mult_chart and ratio_tables are shown whole and small (about 9 px text), with room to spare in the frame
    height (`17`).
  - These are nits.
- **C4 = 8.** Inside the frame the sample is black and white and Andika. The panel chrome (arrows, "n of N", Show all)
  is outside the frame. Item-content issues are listed under master-only observations and are not scored.

### Follow-up (teacher Print, lesson part settings, M and L)

| Width | C1 Clarity | C2 Correctness | C3 Layout | C4 Consistency |
|---|---|---|---|---|
| 1280 | 8 | **5** | 8 | 8 |
| 820 | 8 | **5** | 8 | 8 |

- **P6 fixed.** Y4.B1.S14 L at Practice 75 and Mixed 30 shows 11 tabs: Page 1–10 and Answer keys. They wrap to three
  rows at 1280 and two rows at 820. Each tab is 44 px tall, and there is no sideways scroll at 820 (`21`, `22`).
  M at 60 + 42 shows 9 tabs.
- **F1 fixed.** DESIGN §8d quotes the gate's own line: "105 state(s), 94 on changed sheets", and lists the cases.
- **F2 → FU-1, C2 = 5.**
  - fact_family_sort M: Practice + to 45 shows "5 pages of 9". Size L, then Size M. The stepper is back at
    **45, "5 pages of 9"**, and the section header says **"Lesson · 5 practice pages"**.
  - The preview tabs show **Page 1–3** and Answer keys (`23`, `24`; 820: `26`, `27`), so the packet has 1 practice
    page.
  - The packet opened in a new tab has 3 pupil pages, with **9 practice cells**
    (`logs/followup-crit.log`, `h-ffs-MLM-1280`).
  - Without the round trip, the same 45 builds 5 practice pages, 7 tabs (`25`).
  - Y4.B1.S14: 75 / 42 at M → L → M shows "Mixed 42 · 2 pages of 21", but builds 1 mixed page.
  - So the screen states one packet and prints another. That is worse than r4's nit, where the caption was true for
    the value it snapped.
  - *Cause:* `teacher-print.js:1318-1333` re-snaps `s.partOpts` from `s.partAsk` after a build has finished and
    re-renders the table, but does not call `scheduleBuild()`. The packet stays at the count built at the
    intermediate size.

## Findings

**N1 · Major · C1, C2 · panel, new in round 3: viewBox slices cut labels and shapes.**

The slice paging (`skill-options-ui.js:786-821`, 71a055f40) narrows the viewBox to overlapping windows. It does not
avoid cutting a `<text>` or a shape at the window edge, and the frame-edge test sees only HTML boxes. The same happens
at all widths.

18 skills page by slices (`logs/sliced-skills.txt`). The 10 with a defect:

| Skill | What is cut |
|---|---|
| multiplication:nl_mult | "50" shows as "5" at the frame edge (`31`) |
| division:nl_div | "40" cut |
| integers:add_int | "−11" shows as "11"; "−7" cut (`32`, `29`) |
| integers:sub_int | "14", "11" and "4" cut |
| integers:add_negative | "7" cut |
| conversions:double_num_line | "minutes" shows as "inutes"; part 3 has no row labels (`13`, `14`) |
| data_analysis:histogram_read | "Value" shows as "Valu"; the third bar is cut; part 3 has no y-axis (`29`, `30`) |
| shapes_classify:hotspot_quads | the third shape's box is cut at the right (`29`) |
| fractions:fraction_of_set_hard | the top row of circles is cut in half (`30`) |
| coordinates:coordinates_read_all | part 5 shows a grid corner with "x" cut and neither axis whole (`30`) |

The gate prints `OK` for double_num_line at every width (`logs/gate-current-on-6de83995e.log`).

*Check:*
- In ws-options-shots, for every `svg[data-sko-vb]` in a part, fail `[slice]` when a `<text>` getBBox, or a
  `rect`, `polygon`, `circle` or `path`, is partly inside and partly outside the current viewBox.
- Fail `[inside]` when any drawn leaf, SVG text included, crosses the frame box.
- Add backtest rows on nl_mult and add_int part 2 (FAIL on 6de83995e).
- *Fix direction:* cut slices only at gaps between labels and ticks, repeat the row labels and axis on every slice,
  or fall back to tiles of whole sub-drawings.

**P1 · Blocker for the panel host, master code, live today: the "?" hit area swallows every control in its row.**

On HEAD and on master, at 1280 a mouse click and at 820 a touch tap on the "1" tick of mult_chart_easy's "Tables
with blanks" leaves it ticked and opens "What is Tables with blanks?" (`11`; `logs/P1-real-click-*.txt`).
On geo_translate the "Right and up" click opens the Slide tip (`12`). The panel shows the same tip text twice, the
tip in black and the help line in grey.

`elementFromPoint` at the centre of every visible control in the panel body returns `.sko-tip`. That is 7 of 7 on
geo_translate, 16–22 of 16–22 on mult_chart_easy, and 7–8 of 7–8 on fraction_of_set, at 1280 and 820, on HEAD, on
b1a462051 and on master (`logs/P1-hit-test-*.txt`).

Teachers can still change options by keyboard. The F5 check above used keyboard toggles for that reason.

*Fix (one line, additive):* `.sko-has-tip > .sko-tip { position: relative !important; }`, so the `::after` hangs off
its own 28 px button.

*Check:*
- In ws-options-shots and ws-teacher-shell, for every visible control in `.tv-sko-body`, fail `[hit]` unless
  `document.elementFromPoint` at its centre is the control, inside it, or its own `<label>`.
- Make the option-change pass use `page.mouse.click` at the control's coordinates, not `el.click()`.
- Add a backtest row: master fdfddfdd2 FAIL, then the fix OK.
- Route to the lead now. It is live.

**FU-1 · Major · C2 · follow-up, new with the r4 F2 fix: the stepper and the packet disagree after a size round
trip.**

See the scores section above (`23`–`27`; `logs/followup-crit.log`, `g-*` and `h-*` blocks).

*Check:* ws-partopts-shots A4-F2 must also compare the built packet with what the screen says. After M → L → M,
assert that:
- the preview's `lesson-practice` page count equals the stepper's "N pages";
- the `lesson-mixed` count equals the Mixed stepper's pages;
- the tab count equals pupil pages + 1.

PO-4 should assert that a re-snap which changes `partOpts` schedules a build.

**N2 · Nit · C3 · panel: near-empty parts.**

The frame takes the height of the tallest part, so a part that is one text line floats in it:
- pie_chart part 1 (three lines) and part 4 (chips), `15`;
- build_bar_graph part 2 (one line, 4 % fill), `16`;
- line_plot_fractions part 1, `19`;
- fraction_of_set part 3 and elapsed_find_duration part 1, `18`.

*Check:* report, without failing, any part whose ink box fills under 15 % of the frame while the part before or after
it has room for it. Pack a lone question line with the next block.

**N3 · Nit · C1 · panel: whole-item samples drawn at the 9 px floor while the frame has spare height.**

ratio_tables, function_table_*, simplify, order_decimals and the vocab_grade_* matches read at 8.9–9.0 px by my
measure (`17`, `18`, `logs/sweep-725-at-1280.txt`). They are legible but small, and the frame is 145–220 px tall
against a 300 px cap. Taller frames, up to the cap, would raise them to about 11–13 px.

*Check:* in ws-options-shots, report a whole (unpaged) sample whose smallest text is under 10 px while the frame is
below its cap.

## The gate: does ws-options-shots fail bad states?

I ran the HEAD gate (6de83995e `tests/scripts/ws-options-shots.cjs`) on two trees with
`--skill multiplication:mult_chart_easy,coordinates:geo_translate,algebra:multi_step_word --workers 1`. The skill run
adds the spot passes: 1280×720, a resize to 720, and an option change at every width.

| Product tree | Final line | Families failed |
|---|---|---|
| b1a462051 (round-2 state), via `MQ_ROOT` | `ws-options-shots: FAIL (54)` | `[clip]` 11 (the chart's `div 765>400`), `[cover]` 5 ("73 of 162 blocks … on no part"), `[choices]` 28 (unlettered, spread over 2–3 parts, split differently by width), `[svgtext]` 8 ("original" 5.8 / 8.4 px), `[repeat]` 14 (the story said twice) |
| 6de83995e (+ conversions:double_num_line) | `ws-options-shots: OK (4 skills × 4 widths)` | none, so it also passes N1's "inutes" |

Logs: `logs/gate-current-on-b1a462051.log`, `logs/gate-current-on-6de83995e.log`.

The new families really fail the round-2 states and are not vacuous. Two blind spots remain:
- **SVG text clipped by a slice or the frame (N1).** `[svgtext]` checks size only, and `[inside]` and `[cover]` work
  on block boxes.
- **Pointer hit-testing (P1).** The option-change pass uses a DOM `click()`.

## Master-only observations (not scored against the lane; for routing)

- pie_chart: three of the four slices and legend keys are the same grey, so Jan, Feb and Mar cannot be told apart
  except by their % labels (`15`).
- build_bar_graph: the y-axis of a count graph is 0, 1.8, 3.7, 5.5, 7.3, 9.2, 11 (`16`).
- geo_translate choice C draws the image running off its own grid. The panel does not slice it: the viewBox is the
  item's own, `logs/dbg4.cjs` (`05`, `06`).
- The algebra_all sample ("Solve for Unknown") carries a 🔤 emoji drawn as a box (`09`).
- factor_tchart_hard says "both cells turn green".
- line_plot_fractions answer chips are slashed: "1/2" (`19`).
- The "?" tip repeats the help line word for word (`11`, `12`).

## Automatic checks per finding (owner rule)

| Finding | Check that would have caught it |
|---|---|
| N1 slice-cut labels and shapes | ws-options-shots `[slice]`: text or shape partly outside a sliced viewBox; `[inside]` on drawn leaves (SVG text included) crossing the frame; backtest rows nl_mult and add_int (6de83995e FAIL) |
| P1 "?" hit area covers the row | `[hit]`: elementFromPoint at each visible control's centre is that control or its label; option change by `page.mouse.click`; backtest master FAIL, then fix OK |
| FU-1 stepper ≠ packet after M → L → M | ws-partopts-shots A4-F2: the preview's practice and mixed page counts and the tab count equal the steppers' "N pages" after the round trip; PO-4: a re-snap that changes partOpts schedules a build |
| N2 near-empty parts | report-only: part ink fill < 15 % of the frame next to a part with room |
| N3 small whole samples with spare height | report-only: an unpaged sample under 10 px while the frame is under its cap |
