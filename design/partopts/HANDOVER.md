# lf-partopts → lf-engine handover (2026-11-13)

The lf-partopts lane closes here (owner fastest-implementation plan, 2026-11-13). The lesson part settings code and the
options-panel sample are now owned by **lf-engine**. This page is the resume point.

## What is live and what is waiting

| Work | Branch / commit | State |
|---|---|---|
| Step A: How many and on/off for every lesson part (`sheet/part-opts.js`, `teacher-print.js` Parts table) | master 1fe1e6ef | LIVE (critic A r4 PASS) |
| Follow-up: F1 doc count (PO-DOC), F2 count kept across a size round trip, P6 every page tab (wraps past 8), FU-1 rebuild after a re-snap | `claude/sweet-newton-c8wrv1-lf-partopts` @ cb761d6fa | critic panel r4: follow-up PASS (8/9/8/8 at 1280 and 820); the lead ships it on the next train |
| Options-panel sample (paged sample, "1 of N", lettered choices, 9 px floor, unclip, whole drawings, scroll cue) | `claude/sweet-newton-c8wrv1-lf-partopts-panel` | **critic r5 PASS** @ 33a488c94 (every criterion ≥ 8 at 1280/1366/1024/820; C1 7→8 at the tablet widths by the scroll cue, check [scroll-cue], backtest row `options-panel-scroll-cue`). Ships on the next train with the follow-up |
| P1 hotfix (the "?" hit area swallowed clicks on its row) | master b9414a659 | LIVE; its [hit] check and backtest row ship with the panel branch |
| Part B: supports checkboxes per part | lane branch (611ec04c9, c282bdafb; merged at 219e8d907) | PAUSED (FOCUS rule). Resume notes below |

Critic reports: `design/partopts/critic-A-r2.md` … `r4`, `critic-panel-r1.md`, `r2` (panel branch), `r3`
(branch `…-panel-critic-r3` @ 3938812c1), `r4` (branch `…-panel-critic-r4` @ 8986e103d), `r5` PASS (branch `…-panel-critic-r5` @ f2d6c8e0b).

## Open items (each with its pending check in `design/lessons-first/CHECKS_FROM_CRITICS.md`)

1. **N4 (nit).** teacher-preview's ~900 ms fit and the panel's own tidy (~950 ms) both fit the sample. Paging in the first
   0.9 s leaves it 25–28 % inside the frame for 50–70 ms. Check to build: SAMPLE-VISIBLE in ws-teacher-shell reads every
   animation frame for 0–2.5 s after paging at 200 ms and fails any frame under 50 %. Fix direction: teacher-preview's fit
   skips `.tv-sko-sample`, or calls the panel's tidy.
2. **N5 (nit).** Ten number-line samples scroll 4 px and show a scrollbar, and a horizontal bar can add a second vertical
   one. No cue shows for them (the cue needs more than 8 px). Check to build: `[scroll-min]` in ws-options-shots (fail a
   frame scrolling less than 12 px, or vertically only by the bar's thickness). Fix direction: shave the 9 px floor scale by
   the overflow when it is under 12 px.
3. **Flake.** Backtest row `options-panel-clip` failed once in a 19-row batch and passes alone (its fail fixture fails 3/3
   alone). Make the fixture wait for the stage's settled fit.
4. **lf-roles' tvFitSample.** The panel keeps its own `_tidySample` over master's `window.tvFitSample(frame); return;`.
   lf-roles agreed, on condition that row `options-panel-sample` stays green (it is). If growing_shape_patterns or
   pattern_features (lf-algebra, not yet on master) fail the sweep, restore that one line at the top of `_tidySample`'s fit
   step: `if (typeof window.tvFitSample === 'function') { window.tvFitSample(frame); return; }`.
4b. **Critic r5 nits (scroll cue).** R5-n1: a cue for a two-way scroll starts with ↔ alone (words right); R5-n2: the cue
   does not change once scrolled to the end (lead to decide if a fixed cue is fine); R5-n3: the frame (`role="img"`) has no
   `aria-describedby` to the cue; R5-n4: the always-drawn scrollbar is unconfirmed on a headed ChromeOS / Android host. Each
   has its pending check in the ledger.
5. **Carried nits (critic panel r3/r4):** near-empty parts (pie_chart parts 1 and 4, build_bar_graph part 2,
   probability_basic part 3); small whole samples while the frame has spare height (ratio tables, function tables,
   vocabulary matches); the scrolling frame is `role="img"` yet a Tab stop.
6. **Existing item content to route (not panel defects):** pie_chart draws three of four slices in one grey;
   build_bar_graph's count axis reads 1.8, 3.7 …; geo_translate choice C runs off its own grid; algebra_all shows a 🔤 emoji
   as a box; factor_tchart_hard says "turn green"; line plot answer chips use "1/2"; the "?" tip repeats the help line.
7. **Lesson pages (step A residue):** placevalue:identify L, We Do off, rows 0 — the foot holds a row at a 12.4 mm gap,
   over the 12 mm margin (`DESIGN.md` §8d); EB-ROWFIT+ is report-only (a row-packer issue, R3). Master-only defects seen
   on the way: mult_facts M foot 32 %, fact_family_sort L Mixed 72 %, div_facts anchor chart 49 %, identify M 16 % foot,
   the We Do coverage follow-up (`partopts-wedo-layout`).
8. **PO-DOC count.** The doc's EB-ROWFIT+ count (105/94) predates part B. If part B moves it, PO-DOC fails on the next full
   run: re-record with `ws-partopts-unit.cjs --write-rowfit-plus`.

## Part B resume notes

- Code: the lane branch carries the per-part supports model, the screen checkboxes and the per-size offer gate.
- The gate's first case was `mult_properties` band=36, offered at size **S only**. The owner dropped size S (2026-11-13):
  that value has no size left that offers it. Drop it, or re-measure it at M. The one-size-only mechanism still works for
  values limited to M or L.
- Guardrails still hold: defaults byte-identical, turning a support off warns and never blocks, the key follows the pupil
  page, paper = screen, settings travel with codes (append-only), supports come from skill options.
- Builders for lesson design run at HIGH (`mq-opus-high`), critics at medium.

## Gates to run on any change here

`node tests/scripts/ws-partopts-unit.cjs --unit` and `--bt-only`; `ws-partopts-shots.cjs`; `ws-options-shots.cjs` (4 shards,
deploy sessions 5/6); `ws-backtest.mjs --row options-panel-*,partopts-*`; `ws-precritic.cjs --role lesson --strict`;
boot smoke and code snapshot.
