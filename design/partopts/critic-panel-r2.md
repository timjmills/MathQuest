# Critic round 2: option-panel sample (lf-algebra F8/G11)

Independent critic, 2026-11-13. Tree: `claude/sweet-newton-c8wrv1-lf-partopts-panel` at 91e2ac1c. Graded host: the teacher
option panel (teacher mode → Sets → a skill's Options → `#skillOptionsPopover`) at 1280×1000, 1280×720 and 390×844,
against `design/audit/RUBRIC.md`. I drove the app with Playwright (Chromium 1243): 17 skills at 1280×1000, 15 at 390×844
and 6 at 1280×720. For each I opened Options, walked every part by keyboard (Tab to Next, then Enter and Space) and back by
mouse, changed the first option by a real click, and read the panel at +50 ms and +1.5 s. Evidence is in
`design/partopts/critic-panel-r2/`: the numbered screenshots, plus `logs/drive-*.jsonl`, `logs/whole.jsonl` and `logs/other.jsonl` (the
probe readings).

## Verdict: FAIL (round 2)

Round 1's findings are closed:
- F1, illegible: every word problem and transformation question now reads at 9 px or more.
- F2, footer: Done and Reset are in the window on every skill, at all three sizes and after a resize.
- F3, border: closed.
- F4, gate gaps: the option change, page errors and the stage clip are now checked.

Paging works by mouse and keyboard. Focus is handled sensibly and the labels are good. Paging is the right call: the
steer's "one whole cell" cannot reach the 9 px floor here (see the next section).

Two defects remain, and a teacher would notice both:
- **F1:** the default 12 × 12 multiplication chart is cut. Columns 7–12 appear on no part, at any width.
- **F2:** on the transformation MC skills, the four answer figures are split across parts with no letters, so the
  "pick one of four" shape of the item is lost.

The gate passes both. Its stage-box `[inside]` test cannot see clipping inside the stage, and nothing checks that the
parts together show the whole item.

| Host | C1 Ease of use | C2 Educational value | C3 Spacing and layout | C4 Standard fidelity |
|---|---|---|---|---|
| Option panel, 1280 (×1000 and ×720) | **7** | 8 | 8 | 8 |
| Option panel, 390×844 | **7** | 8 | **7** | 8 |

- **C1 = 7 (both).**
  - *What works.* The question line is legible on every probed skill: 9.0–17.3 px at 1280, 9.0–13.4 px at 390.
    - The arrows take both mouse and keyboard. Tab reaches "Next part of the sample". Enter and Space step through
      the parts.
    - On the last part Next is disabled and focus moves to "Previous part of the sample" (`drive-*.jsonl`, `focus`).
    - The "n of N" count is `aria-live`, and the 44 px icon buttons meet the touch-target rule.
    - Done and Reset stay in the window on all 38 skill × size readings: the footer bottom is 987 / 1000, 707 / 720
      and 843 / 844, and long_div_2digit's lower panel ends at 943.
    - There is no sideways scroll at any size.
  - *What fails.* mult_chart_easy at its default 12 × 12 shows only columns × 1–6 on both parts, cut mid-cell
    (F1; `01`–`04`).
    - The geo_* grids' "original" tag is drawn at 5.8 px, over the grid lines (`06b`).
    - One real defect a teacher would notice gives a 7, as in round 1.
- **C2 = 8 (both).** The sample is the real item at the chosen options, and it redraws cleanly after a change. On all
  17 skills there was no blank or stale frame at +50 ms or +1.5 s, the part count resets to 1, and there were no page
  errors.
  - For the word problems the parts follow the teaching: the story, then Step 1, then Step 2 with its unit bank
    (`12`, `13`). That is a better teacher view than a whole cell at 3.9 px.
  - The transformation MC split (F2) weakens the sample but does not misteach. The question, the original and the
    candidate figures are all there, and the question says "Which figure…".
- **C3 = 8 at 1280, 7 at 390.**
  - At 1280×1000 the 300 px frame leaves room for the option list (geo_translate shows all four slide options and Pupil
    play; `06`).
  - At 1280×720 the frame is 259 px and the list keeps about 227 px (three option rows; `10`).
  - At 390 the frame takes 300 of the 717 px sheet. Only about 190 px is left for options (three rows of the first
    group; `09`, `14`). Round 1 found 282 px "usable", and this has shrunk by a third.
  - The frame is sized to the tallest part, so short parts float in a mostly empty box:
    - fraction_of_set part 1 is a 3-line question in a 300 px frame (`16`);
    - geo_translate part 3 is one 210 px grid (`08`).
  - multi_step_word part 1 prints the story twice, once as the question line and once as the story block (`12`, `14`,
    `15`). Probably pre-existing in the item's preview, but at 390 it is the whole first part.
- **C4 = 8 (both).** Inside the frame everything is black and white, in Andika, with the panel chrome (the arrows and
  "1 of N") outside it. This is unchanged.

## Is part-by-part paging as good as the steer?

The steer: when the whole stage cannot be legible inside the capped frame, show one whole cell, centred, with "1 of N".
The stage is always one `.tvp-cell` (`teacher-preview.js mountBuilt`), so "one whole cell" means the whole item. I
measured what that would give in the same 300 px frame (`whole.jsonl`, `11`, `15`):

| Skill | Whole item (px) | Scale | Smallest HTML text |
|---|---|---|---|
| geo_translate | 380 × 1085 | 0.264 | 4.2 px |
| multi_step_word / algebra_all | 400 × 957 | 0.299 | 3.9 px |
| fraction_of_set | 298 × 600 | 0.477 | 7.2 px |
| mult_chart_easy | 400 × 764 (clipped) | 0.374 | 6.7 px |

None reaches the 9 px floor the steer itself sets, so the steer cannot be followed as written for these skills. The
builder's rule (one whole part at a time, each at 9 px or more) is the only way to keep the floor.

For blocks that are units of teaching, it serves the teacher at least as well: a story, a step, a place-value column, a
graph, a set of groups.

It serves the teacher worse where the DOM blocks are not units of meaning:
- **MC answer figures** are packed greedily: choice A sits with the original, B and C share a part, and D is alone.
  The packing also differs by window height: at 720, part 1 is the question and original, and the choices are two and
  two. The figures carry no letters, so the "one of four" shape of the item is not visible on any part (F2).
- **Tables** are split by rows while their columns are clipped (F1).

The whole-item view still gives the overall shape well even at 3.9 px (`15`). A small whole-item overview, or a "the
whole item has: question · original · 4 choices" line, would recover what paging hides.

Verdict on the departure: **accept the rule, fix the two packings.**

## The gate

Final lines (this tree, my runs):
- `ws-options-shots --shard 1/2 --workers 1`: `ws-options-shots: OK (363 skills × 2 widths; shard 1/2 of 725)`
  (963 readings, 1351 s)
- `ws-options-shots --shard 2/2 --workers 1`: `ws-options-shots: OK (362 skills × 2 widths; shard 2/2 of 725)`
  (916 readings, 1341 s; all_mixed:custom_mixed unavailable, as designed)
- `ws-backtest --row options-panel-*` (8 rows): `ws-backtest: OK` (8 PASS, 0 FAIL, 0 PENDING; 1997.3 s; every FAIL side FAILs and every PASS side OKs)
- `ws-boot-smoke`: `ws-boot-smoke: OK`
- `ws-code-snapshot`: `ws-code-snapshot: OK (732 codes, 35 categories, +160 appended since the pinned baseline of 572, no frozen code or position moved, no frozen skill deleted, insertion + retirement stable, 3203 option round trips)`

**Do the new checks catch the round-1 failure classes?**

| r1 class | New check | Verdict |
|---|---|---|
| Illegible sample (F1) | `[text]`: HTML font-size × effective scale ≥ 9 px, every part read | **Yes for HTML text.** SVG text is only reported (`ws-options-shots.cjs:136-141`), so geo_*'s 5.8 px "original" tag and fraction_of_set's 6–8 px row numbers pass. Grid labels were part of the r1 F1 complaint. |
| Footer off the window (F2) | `[controls]`: foot, Done and panel inside the window, after both tidies, on resize, after a change | **Yes.** It matches what I saw at all three sizes. |
| Frame shorter than CSS, k < 0.30 (F3) | `[scale]` | **Yes.** |
| Stage clipped (F4) | `[inside]`: the stage box inside the frame (the 90 % escape is removed) | **Only at the stage level.** The stage box is inside, but content clipped by an `overflow` box inside the stage (the 12 × 12 chart) passes: `ws-options-shots.cjs:176` compares boxes, not content. The `options-panel-clip` fixture models only a stage-level `scale(1)`. |
| Broken after an option change (F4) | `+50 ms` / `+1.5 s` re-read | **Yes, but only on the 26-skill spot set** in a full run, not on all 725. |
| Page errors (F4) | `[pageerror]` | **Yes.** |
| *(new with paging)* A part that hides part of the item | none | **Not caught.** Nothing checks that the parts together show every drawn block, or that the overflow inside a part is not clipped (F1, F2). |

**Could a backtest pass vacuously?**
- *The commit-pair rows* are pinned to historical commits, and the FAIL side must print FAIL, so a row cannot pass on
  "OK (0 skills)".
- *The fixture rows* (clip, pageerror) run on HEAD with `--skip-no-panel`. If geo_translate lost its panel, both sides
  would print "OK (0 skills…)" and the FAIL expectation would catch it. Not vacuous.
- *Two soft spots:*
  - The part walk stops at 12 parts (`ws-options-shots.cjs:263`), so a 13th part is never read.
  - A part that holds legible text needs only 0.03 % ink (`:180`), so a part that is almost blank apart from one word
    passes.

## Findings

**F1: The 12 × 12 chart is cut. Columns 7–12 appear on no part (C1, C2). Major.**

On multiplication:mult_chart_easy at its default 12 × 12 (`01`–`04`), the whole item is clipped at column 6 (`05`).
- Part 1 shows rows 1–8 × columns 1–6.
- Part 2 shows rows 9–12 at scale 1, cut at the frame's right edge. At 390 the 7th column is cut mid-cell.
- Measured: stage [905,155,210,286] at 1280, inside the frame, so the gate passes it.

Cause: the table is wider than the stage. `.tvp-stage` and `.tvp-visual` have `max-width: 400px` (`css/teacher.css:553`,
`:557`), and the overflow is clipped inside the cell, where `_sampleSize` (`js/modules/skill-options-ui.js:569`) cannot see
it, because it widens the stage only when the stage itself scrolls. The table split (`:608`) then pages rows of an
already clipped table.

The 5 × 5 chart is fine (`18`). The mult_chart presets at 12 × 12 are likely the same.

*Check:* in ws-options-shots, after each reading, fail `[inside]` when any element inside the stage has
`scrollWidth > clientWidth + 1` or `scrollHeight > clientHeight + 1` with `overflow` ≠ visible, or when any drawn
descendant's box extends past the stage's box. Add a fixture row that clips a table inside the stage.

**F2: The transformation MC answer figures are split arbitrarily, with no letters (C2, C3). Major for the 12 geo_*
skills.**

At 1280×1000 (`06`–`08`):
- Part 1 is the question, the original and the first candidate figure. Nothing marks that figure as an answer choice
  rather than part of the question.
- Part 2 is two figures; part 3 is one.

At 1280×720 the split is different: question and original, then 2 + 2 (`10`). The packing (`_samplePages`,
`skill-options-ui.js:639`) fills each part greedily, so the answer choices are never shown as one unit.

*Check:* in ws-options-shots, read each part's leaves. Fail when the item's answer-choice block (`.tvp-options` or the
MC figure group) is spread over more than one part while part of it shares a part with the question. Alternatively, a
unit assertion on `_samplePages`: answer choices are their own part(s) and are never packed with the stem.

**F3: SVG labels are not held to the floor (C1). Minor.**
- geo_*: the "original" tag is 5.8 px at 1280 and 5.9 px at 390, written over the grid (`06b`).
- fraction_of_set: group numbers are about 6–8.6 px (`17`).

The panel computes its need from HTML text only (`skill-options-ui.js:583`, `el.closest('svg')` skipped), and the gate
only reports SVG text.

*Check:* make SVG text a failing family. Allow at most a 7 px floor for SVG tick labels, or fail it under 9 px with an
allow-list for decorative tags. Count the SVG text in `_sampleNeed`.

**F4: At 390 the sample takes 300 of the 717 px sheet, and short parts float in an empty frame (C3). Minor.**
- At 390 about 190 px is left for the options themselves (`09`, `14`).
- The frame height is set by the tallest part (`skill-options-ui.js:553`). fraction_of_set part 1 is three text lines
  in 300 px (`16`), and geo part 3 fills 70 % (`08`).

Consider a lower cap on phones (for example 30 % or 260 px), or size each part's frame to that part.

*Check:* in ws-options-shots at 390, report and fail when the option body's visible height is under 220 px (or under
40 % of the sheet), and report each part's ink-box fill of the frame.

**F5: The two-line summary's full text can be reached only by hover (C1). Nit.**

The clamp works. At 390 algebra_all's summary stays at 1–2 lines after a change, and Done stays in view (`22`). The
full text is only the `title` attribute (`skill-options-ui.js:956`), which touch and keyboard users cannot reach.

*Check:* a DOM assertion in ws-teacher-shell that a clamped `.tv-sko-sum` has its full text reachable without hover
(an expand control, or the text in an accessible description).

**F6: multi_step_word prints the story twice in the sample (C3). Nit, probably pre-existing.**

The question line and the story block both appear (`12`, `14`), which costs the first part at 390. `hideRepeatedPrompt`
does not match the sentence-per-line story.

*Check:* ws-options-shots reports a sample whose visible text repeats a sentence of 20 or more characters.

## What was confirmed good

- **Paging by keyboard and mouse:**
  - Tab reaches Next; Enter and Space step through the parts.
  - Next is disabled on the last part and focus moves to Previous; Prev disabled on part 1.
  - The labels are "Previous part of the sample" and "Next part of the sample"; the count is `aria-live`.
  - Mouse Prev returns to part 1.
  - After an option change the sample starts again at "1 of N" (all 17 skills).
- **The controls stay in the window.** Footer and Done were in view on all 38 readings: 1280×1000, 1280×720 and 390×844,
  with and without a change. There was no sideways scroll on the page or the panel. There were no page errors.
- **Unpaged samples are legible and whole.** add_5_pictures, classify_count (after its select changes too),
  number_bonds, long_div_2digit, mult_facts and bar_graph: 9.0–12.4 px, shown whole, with no "1 of N" (`19`–`21`).
- **Previews outside the panel are unchanged.**
  - Sets › Thumbnails: 48 frames, none paged (no `data-sko-hide`), looking as before (`23`).
  - The print screen's files are not touched by the diff. Only `skill-options-ui.js`, `teacher-preview.js` (one regex)
    and additive `.tv-sko-*` CSS changed.
  - The widened "✓ Check Answers" regex runs only in `tidySample`, which is called only from `mountBuilt`
    (`teacher-preview.js:262`): the preview path. Live practice of number_families_add draws the migrated screen cell
    and is unaffected (`24`). In thumbnails the widget's Check button is now hidden too (number_families_add thumbnail:
    0 visible), which is intended.
- **pattern_features and growing_shape_patterns** are not live on this branch (`not live` in `drive-1280x1000.jsonl`),
  so they could not be driven.

## Speed reflection (for the lane)

- **The lost round came from a missing coverage check.** Paging introduced a new failure class: a part that hides some of
  the item. The lane added checks for every r1 class, but none for a class the fix itself created. Rule: when a fix
  changes how content is shown (cropping, paging, scaling), the same change adds a gate that the union of what is shown
  equals the whole.
- **Box checks miss inner clipping.** `[inside]` compares bounding boxes, and the chart clip is inside the stage. Every
  "inside" check should also test `scrollWidth`/`scrollHeight` against the client size of each `overflow`-clipping
  descendant. That is cheap, and it would have caught F1 in the builder's own sweep.
- **Run the option-change pass on more than the spot set** when a full deploy session has the budget. Today 699 skills
  are never re-read after a change.
