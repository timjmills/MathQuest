# Critic: options panel, round 5 (lf-partopts, narrow re-grade of C1)

Branch `claude/sweet-newton-c8wrv1-lf-partopts-panel` @ 33a488c94, base 30a4674f5. Graded against
`design/audit/RUBRIC.md` C1 and the round-4 finding N1-cue (`critic-panel-r4.md`). Lead's bar: a visible scroll cue.

## Verdict: PASS

C1 is 8 at every width. No new defect. C2, C3 and C4 carry from round 4 (8 everywhere): the diff gives no reason to
change them.

## 1. Hash proof

`git diff --stat 30a4674f5 33a488c94` shows 5 files:
- `css/teacher.css` +6. One additive block at the end of the file: `.tv-sko-scroll-cue`, plus
  `::-webkit-scrollbar` rules scoped to `.tv-sko-frame.is-scroll`. No existing rule is edited.
- `js/modules/skill-options-ui.js` +23. A new `_sampleScrollCue(frame, overX, overY)` and two call sites in
  `_tidySample`:
  - `_sampleScrollCue(frame, 0, 0)` at the start of every tidy. This removes any cue.
  - one call after the scroll-fit, with the real overflow.
- Tests and ledger only: `tests/scripts/ws-options-shots.cjs` (the new `[scroll-cue]` family),
  `tests/fixtures/precritic/backtests.json` and `design/lessons-first/CHECKS_FROM_CRITICS.md`.

Could the diff touch a sample that does not scroll? No:
- every tidy starts by removing the cue;
- the cue is only added past 8 px of overflow;
- the scrollbar CSS only matches `.is-scroll`.

The probe agrees. No cue appeared on any part that does not scroll (18 parts across 7 skills), and none on
`multiplication:mult_chart_easy` (4 parts) or `coordinates:geo_translate` (2 parts). Going back from a scrolling
part to part 1 removes the cue. No page errors were logged in any run.

## 2. Live probe

Setup:
- Probe script: `panel-sample/critic-r5/logs/r5-probe.cjs`. Raw results: `logs/r5-probe.json`.
- Served with `npx serve`. Opened the teacher's way: Sets, then the skill's options button (a tap on touch runs).
- Touch contexts (`hasTouch`, `isMobile:false`) at 1024×768 and 820×1180. Headless Chromium gives overlay scrollbars
  (0 px gutter), the same as a tablet or ChromeOS.
- A real touch drag through CDP `touchStart`/`touchMove`/`touchEnd` events.
- Keyboard: focus the frame, then six presses of ArrowRight or ArrowDown.

Every row below is the scrolling part. At both 1024 and 820 it is part 2 of 2, or part 2 of 3 for
`coordinates_read_all`.

| Skill | Overflow at 1024 (x / y px) | Cue text | Touch drag reaches | Keyboard reaches | Done in window (1024 / 820) |
|---|---|---|---|---|---|
| conversions:double_num_line | 122 / 0 | "↔ Scroll sideways to see the whole drawing" | end (122) | end | yes / yes |
| coordinates:coordinates_read_all | 76 / 128 (820: 73 / 51) | "↔ Scroll sideways and down to see the whole drawing" | end, both axes | end, both axes (ArrowRight and ArrowDown) | yes / yes |
| data_analysis:box_plot_intro | 71 / 0 | sideways | end | end | yes / yes |
| data_analysis:box_plot_quartiles | 71 / 0 | sideways | end | end | yes / yes |
| data_analysis:histogram_read | 122 / 0 | sideways | end | end | yes / yes |
| graphs:line_plot | 17 / 0 | sideways | end | end | yes / yes |
| shapes_classify:hotspot_quads | 213 / 0 | sideways | 170 to 172 px from one 150 px swipe (momentum); a second swipe reaches the end | end (213) | yes / yes |

Every scrolling part met the same checks:
- The cue was displayed 10 px under the frame, inside the window, at 12 px bold.
- The direction it names matches the overflow axis.
- No control lay outside the window.
- Done sat inside the window: bottom 739 of 768 at 1024, and at most 1151 of 1180 at 820.

Shots: `1024-hotspot_quads-2_of_2.png`, `1024-double_num_line-2_of_2.png`, `820-histogram_read-2_of_2.png`,
`820-line_plot-2_of_2.png`, `820-mult_chart_easy.png` (no cue).

Desktop re-confirmation:
- 1280×1000 `histogram_read`: cue present; wheel and keys reach the end.
- 1366×768 `hotspot_quads`: the same (`1366-hotspot_quads-2_of_2.png`).
- A run with the hide-scrollbars flag dropped (`1024-classic-…`) still showed a 0 px gutter in headless. So this
  probe cannot confirm the styled always-on scrollbar. The pass rests on the text cue, which shows on every host.

## 3. Scores, C1 Ease of use

| Width | Round 4 | Round 5 | Why |
|---|---|---|---|
| 1280×1000 | 8 | **8** | Cue added. Nothing else changed. |
| 1366×768 | 8 | **8** | Same. |
| 1024×768 (tablet, overlay scrollbars) | 7 | **8** | N1-cue is closed. A plain cue that names the direction sits under every scrolling frame. Touch and keyboard both reach the hidden part. The cue is gone where nothing scrolls. |
| 820×1180 (tablet, touch) | 7 | **8** | Same. |

C2, C3 and C4 stay at 8 at every width (carried from round 4). The cue is one 16 px line below the frame. On
820 / hotspot_quads it grows the popover by about 26 px, and Done stays in the window. It does not crowd the drawing.

## Findings (nits only, none blocking)

### R5-n1 · Nit (C1): the arrow glyph shows one axis when the frame scrolls on both
`coordinates_read_all` shows "↔ Scroll sideways and down". The words are right, but the glyph has only the
horizontal arrow.
*Check:* add a cue-glyph rule to ws-options-shots `[scroll-cue]`. When both overflows are over 8 px, the cue must
not start with only ↔ (expect ✥ or "↔ ↕").

### R5-n2 · Nit (C1): the cue does not change once the teacher has scrolled to the end
The cue is set at tidy time and keeps saying "Scroll sideways" at scrollLeft = max. That does no harm, because
scrolling back is natural.
*Check (optional):* in `[scroll-cue]`, after `frame.scrollLeft = max`, read the cue text, and expect either a
changed text or acceptance as a static cue. The lead should decide whether this is wanted.

### R5-n3 · Nit (accessibility): the cue is not tied to the frame
The frame (`role="img"`) has no `aria-describedby` pointing at the cue, so a screen reader does not hear it with
the sample.
*Check:* in `[scroll-cue]`, when a cue is present, expect `frame.getAttribute('aria-describedby')` to include the
cue's id.

### R5-n4 · Note (gate scope): the styled scrollbar is unverified
The always-on `::-webkit-scrollbar` rule could not be seen in headless Chromium (0 px gutter even with
hide-scrollbars dropped).
*Check:* a headed ChromeOS or Android run of the gate that expects `offsetHeight − clientHeight ≥ 8` on
`.tv-sko-frame.is-scroll`. Until then, the gate's text-cue check is the one that matters, and it holds.
