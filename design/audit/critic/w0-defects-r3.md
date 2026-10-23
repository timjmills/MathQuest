# Critic r3: W0-defects lane, Board display at 1280×720 and quiz dots (mq-opus-medium)

**Branch:** `claude/sweet-newton-c8wrv1-wip-w0-defects`. I started at f79d7c1. The coordinator then moved the tree to 6b424c2 (6d79970: light quiz dots).

**What I reviewed:** `git diff 60b426c..f79d7c1 -- css js`, plus `git diff f79d7c1..6b424c2 -- css` (light dots).

**Time:** start 2026-10-23T16:22:56Z, end 2026-10-23T16:52:38Z (30 min).

**How:** I edited no app code and committed nothing. Every browser run went through `/tmp/mq-browser-run.sh` (chromium-1243), one at a time.

## Verdict: PASS

All lane items score at least 8 on every criterion. The r2 required fixes R1, R2 and R3 are closed. Nothing is required. Section 6 lists recommended follow-ups.

| Item | Verdict |
|---|---|
| R1: board at 1280×720, nested clip | **CLOSED.** 0 card/frame scroll and 0 ink clipped, on 39 skills × 3 sizes, answer hidden and shown |
| R2: fact family at 1280×720 | **CLOSED.** It sits on the rail at zoom 1, whole, instruction line included |
| R3: dark answered dot | **CLOSED.** 3.10 → 6.08:1. Current + answered is now ringed in both modes |
| Light quiz dots (6d79970, owner ruling) | **PASS.** All 8 states are 6.72–11.42:1, and they differ by fill, dashed vs solid border, or ring. Dark mode is unchanged |

## 1. The board, 39 skills × 1280×720, 1366×768 and 1920×1080, answer hidden and shown

### Fit
- I ran the builder's probe myself (`cr3/fit.txt`).
- Every one of the 234 measurements has card scroll 0, frame scroll 0 and horizontal overflow 0. The zoom is never below 1.
- No page errors.
- Example zooms at 1280×720 (hidden / shown):

| Skill | Layout | Zoom |
|---|---|---|
| add_word_problems | rail | 1.17 / 1.18 |
| long_div_2digit | stacked | 1.16 / 1.00 |
| temperature | stacked | 1.12 / 1.01 |
| function_table_easy | rail | 1.34 |
| time_hour | stacked | 1.31 / 1.13 |
| compare_groups | stacked | 1.29 / 1.11 |
| add_sub_fact_family | rail | 1.0 |

### Is the 12 px tolerance hiding a real clip?

**No.** I wrote my own ink probe (`cr3/probe-ink.cjs`, output `cr3/ink.txt`).
- For every box inside `#questionPaper` whose overflow is not visible, it measures how far each piece of ink sticks out past the clip edge. Ink here means text, SVG shapes, inputs and buttons.
- The builder's `visual-aid y3–y11` remainders (add_three, time_hour, elapsed_30min, function_table_easy, identify, cloze, area_model, fact family) clip **no ink**. They are padding remainders.
- The one hit is count_by_tables, at 5 px. That is the line box of "After each number, press Space.", not its glyphs. The screenshot (`cr3/shots/1280x720-count_by_tables.png`) shows the text whole.
- Residual risk: the tolerance is a box measure, not an ink measure. A skill outside the sample could hide up to 12 px of real ink. Follow-up F4.

### Is the pan-strip exclusion hiding a real clip?

**Not one this lane caused**, but see F2. Probe: `cr3/probe-nlp.cjs`, output `cr3/nlp.txt`, 8 seeds each, board vs pupil card at 1280×720.

- **integer_nl_drag:** the 228 px overflow is the same on the card at zoom 1 and on the board at 1.6. The strip is that wide by design, so the board adds nothing.
  - It opens on 0 with −5..5 in view.
  - Older defect: targets such as −9, −7 or 9 (seed 8) are off-screen at open, and there is no pan button. Follow-up F3.
- **nl_add:** this one is board-caused.
  - The card shows 1..20 (overflow 22 px).
  - The board at 1.6 shows only 0..15 (overflow 242 px). Answers 16, 19 and 20 (seeds 2, 4, 6) are off-screen at open.
  - The strip's own ◀ ▶ pan buttons are present, so nothing is unreachable.
  - This is the r2 follow-up, still open. Follow-up F2.

### Screenshots I looked at

All in `cr3/shots/`, hidden and shown:
- **The six formerly clipped skills, at 1280×720.**
  - add_word_problems: work grid and unit bank whole.
  - long_div_2digit: both remainder rows whole.
  - temperature, function_table_easy, time_hour, compare_groups: all whole.
- **The fact family.** All four rows and the instruction line are whole at 1280×720. On reveal, the answer box sits in the rail at 40 px.
- **Short skills.** add_facts and count_sequence are at 1.6.
- **Number lines.** nl_add and integer_nl_drag.

### Moving to the rail (arrays_groups, base10_build at 1280×720): right

On the rail the drawing gets the full height:
- arrays_groups: zoom 1.36, whole.
- base10_build: zoom 1.44, whole.

The chips sit at the top of the rail and the controls at the foot. Show answer no longer changes the layout:
- add_word_problems at 1366×768 is on the rail from the start (1.15 → 1.16).
- r2's stacked-to-rail flip is gone.

### Is anything smaller than it needs to be?

Yes, at 1366×768, but this is not a regression: the values are identical to r2.

- `fitBoard` keeps the stacked layout whenever it fits at all. It tries the rail only when stacked fails, or when the answer would not fit.
- So the bigger screen draws some medium-height skills smaller than the smaller screen does:

| Skill | 1366×768, stacked (hidden / shown) | 1280×720, rail |
|---|---|---|
| base10_build | 1.20 / 1.04 | 1.44 |
| arrays_groups | 1.15 / 1.04 | 1.36 |
| function_table_easy | 1.17 / **1.00** | 1.34 |

- temperature (1.22 / 1.07) and long_div_2digit (1.27 / 1.14) are similar.
- Everything is whole and at zoom ≥ 1, so C3 stays at 8. Follow-up F1.

## 2. Gates

All were run on the lane tree. Only `css/quiz-mode.css` changed between f79d7c1 and 6b424c2.

| Gate | Result |
|---|---|
| `ws-chromebook-fit --bigboard --baseline tests/fixtures/precritic/sweep-sample.json` | **OK** (0 pinned, 0 NEW) |
| `ws-screen-slots --bigboard --baseline design/audit/baselines/screen-slots.json` | **OK** (39 renders, 0 NEW) |
| `ws-screen-slots --dark --shard 2/4 --baseline …` | **OK** (10 skills, 60 renders, 0 low-contrast, 0 NEW) |
| `ws-boot-smoke` | **OK** |
| `ws-code-snapshot` | **OK** (722 codes, 35 categories, nothing moved) |
| `ws-viewport-check --baseline design/audit/baselines/viewport-check.json --sizes 1280x720` | **OK** (16 sessions, 0 findings). Fix 1 still holds |
| `node --input-type=module --check js/modules/launch-chrome.js` | OK |

Outputs: `cr3/g-*.txt`.

## 3. Quiz dots

Probe: `cr3/probe-dot.cjs`, 12 px / 700, composited background. Output: `cr3/dot.txt`.

| State | Light (6b424c2) | Dark |
|---|---|---|
| plain | #2e2a45 on #dceeee **11.42**, grey solid border | 7.16 |
| current | #fff on #5b3fd6 **6.72**, purple fill | 7.64 |
| answered | #064e3b on #c9f2e6 **8.02**, mint fill, green solid border | **6.08** (#34d399) |
| flagged | #7c2d12 **7.81**, orange dashed border | 6.22 |
| current + flagged | 6.72, purple fill with pale-orange dashed border | 7.64 |
| current + answered | 8.02 **+ 3 px purple ring** | 6.08 **+ 3 px #b5a5f4 ring** |
| answered + flagged | #7c2d12 on #ffe4cc **7.68**, dashed | 5.03 |
| current + answered + flagged | 7.68 + ring | 5.03 + ring |

- Every state reaches at least 4.5:1 in both modes.
- **Light:** in `dot-light.png` all 8 dots are distinct without relying on hue (fill, dashed vs solid border, ring). This meets the owner rule.
- **Dark:** current + answered (dot 6) is now clearly distinct from answered (dot 3). The dark values match r2 apart from the two intended changes.
- The full quiz screens are `quiz-light.png` and `quiz-dark.png`. The dot row reads cleanly under the question card in both.

## 4. fitBoard performance

I timed it with a synchronous resize dispatch, median of 5, in `cr3/ink.txt`.

| CPU | Typical | Tallest / most elements |
|---|---|---|
| Desktop (1×) | 5–15 ms | count_by_tables (117 elements): 40–46 ms. add_word_problems: 29–37 ms. arrays_groups: 36 ms |
| 4× throttle (Chromebook proxy) | 40–100 ms | count_by_tables at 1366: 386 ms median, 526 ms max. add_word_problems: 200 / 297 ms. function_table_easy: 180 / 349 ms |

The cost is high because:
- `nestedClip` walks every element with `getComputedStyle` on every `fits()` call.
- That happens after each 0.05 zoom step.
- And it repeats across up to 3 or 4 `fitZoom` passes (stacked, answer probe, rail, back).

This runs once per question render or reveal, so it is acceptable. However, the `resize` listener is not debounced, so dragging a window on a slow Chromebook will stutter. Follow-up F5.

No loops: the MutationObserver watches the paper's childList and characterData only, and the fit only toggles attributes.

## 5. Grades

| Screen | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Board, short skills (add_facts, count_sequence, div_facts …), all sizes | 9 | 9 | 9 | 8 |
| Board, medium skills (arrays_groups, base10_build, long_div_2digit, temperature, time_hour, compare_groups), all sizes | 9 | 9 | 8 | 8 |
| Board, tall skills (add_word_problems, function_table_easy, add_sub_fact_family), rail at 1280×720 and 1366×768, stacked at 1920×1080 | 8 | 9 | 8 | 8 |
| Board, number lines (nl_add, integer_nl_drag) | 8 | 9 | 8 | 8 |
| Quiz screen, dark (dots) | 9 | 9 | 8 | 8 |
| Quiz screen, light (dots) | 9 | 9 | 8 | 8 |

Notes on the grades:
- **Tall skills C1:** the tight 4 px frame pad is fine.
- **Number lines C1:** 8 because nl_add hides 16–20 at open, though the pan buttons reach them.

## 6. Follow-ups (not blocking)

### For this lane or a later board pass

- **F1. Choose the layout by the larger zoom.** Compare stacked and rail, hidden and shown, rather than "stacked unless it fails". The aim is that 1366×768 never draws smaller than 1280×720.
  - base10_build would go from 1.20 to about 1.4.
  - function_table_easy would show the answer at about 1.3 instead of 1.0.
- **F2. nl_add on the board.** Fail the fit when a pan strip overflows more than it does at zoom 1, or cap the zoom so that the line the card shows stays visible. At 1.6 the board hides 16–20 where the card shows 1–20 (r2 follow-up, still open).
- **F4. Make the 12 px tolerance an ink test.** Measure whether drawn content passes the clip edge, as `cr3/probe-ink.cjs` does, not box overflow. Then the tolerance cannot hide a real 12 px cut in a skill outside the sample.
- **F5. fitBoard cost.** Coalesce `resize` with requestAnimationFrame or a debounce. Collect the clip-capable elements once per fit (those whose overflow is not visible) instead of calling `getComputedStyle` on every element at every zoom step.

### Older defects, outside the lane

- **F3. integer_nl_drag.** It opens on 0 with −5..5 visible, with no pan buttons. Targets at ±7..±10 (e.g. "−9, −7, 9") are off-screen on the card and on the board alike. Scroll to the targets, or add the nl pan buttons.
- **F6. count_by_tables board/card cell.**
  - The row-2 lead-in arrow sits below the row (`cr3/shots/1280x720-count_by_tables.png`).
  - An empty band of about 100 px sits above the caption.
  - "After each number, press Space." is a keyboard verb shown on the whole-class board.
- **F7. Fact family on reveal.** A text caret is visible in the first answer box after Show answer (`1280x720-add_sub_fact_family-rev.png`), although `syncBoard` blurs the input.
- **F8. Dark-mode dots.** flagged vs plain differs only by hue (orange vs lavender). The plain dot's border, #3a3650 on #1a1828, is barely visible. For parity with the light rule, consider a dashed border for flagged in dark as well.
- **F9. Quiz screen, light.** The "Flag" button text is very low contrast (`quiz-light.png`).
- **From earlier rounds, still open:** the tests-owner gate gaps.
  - `--bigboard` does not run 1280×720 and does not count nested ink clipping.
  - The harness looks for chromium in `chrome-linux/`.

## Files

Everything is under `/tmp/claude-0/-home-user-MathQuest/4e2682a4-988c-5e1a-82ad-51f8a66da3e0/scratchpad/cr3/`:
- **Probes:** `probe-ink.cjs`, `probe-nlp.cjs`, `probe-dot.cjs`, `probe-quiz.cjs`
- **Outputs:** `fit.txt`, `ink.txt`, `nlp.txt`, `dot.txt`, `g-fit.txt`, `g-slots-bb.txt`, `g-slots-dark.txt`, `g-boot.txt`, `g-vp.txt`
- **Images:** `shots/`, `dot-light.png`, `dot-dark.png`, `quiz-light.png`, `quiz-dark.png`
