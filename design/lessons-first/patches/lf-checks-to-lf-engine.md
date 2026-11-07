# lf-checks → lf-engine: the lesson checks that read phase-0-only fields

From lane lf-checks (2026-11-07), through the lead. The LP checks live in `tests/lib/ws-lesson-lp.cjs` (pure, plus the
in-page extractor `lpMeasure`) and run today on the LIVE detailed packs (`ws-detailed-lesson --lp / --sweep`, `ws-precritic
--lesson / --unit`). Three things need fields that only exist on lf-engine's branch (phase 0: the short lesson's
Prerequisite Check page, `lessonSeeds` refresh, the role's `sizing.mode`). Apply these on lf-engine's branch after merging
lf-checks; they are small and written against the library's public functions. Not run on phase 0 by lf-checks: lf-engine
runs them and adds the backtest rows named below.

## 1. `chartPage` reports its sizing mode (LP-FALLBACK reads it)

`js/modules/sheet/roles/lesson.js` already returns `sizing: { mode, … }` from `chartPage` and keeps it in the plan meta as
`chartSizing`. The detailed builder drops it. In `print-sheet.js` `buildDetailedLesson`, put the chart part's
`plan.meta.chartSizing` into the result's `debug.sizing` (one object, or a list per chart page):

```js
// buildDetailedLesson, where debug is assembled
debug: { glance, est, heights, sizing: chartParts.map((c) => c.plan && c.plan.meta && c.plan.meta.chartSizing).filter(Boolean)[0] || null },
```

`ws-detailed-lesson --lp` already copies `built.debug.sizing` into the packet (`lpPk.sizing`), and LP-FALLBACK fails a
`mode` that names a fallback. Better: have `chartPage` set `mode: 'one-fallback'` when it takes `solve(…, 0.7, 1) || 0.7`
(the branch at `lesson.js` "if (mode === 'one') z = …"), so the check does not need the DOM floors (final 0.85, grid3 0.8).

## 2. The short lesson's Prerequisite Check (LP-PREREQ, phase 0 r1 D1 / D3 / D8)

In `tests/scripts/ws-lesson-check.cjs` (phase 0), after a packet is rendered (`renderDoc`), read it with the same
extractor and run the check on the check page. The LP checks key the check page as `P0` / `P0-key`; map the short
lesson's `lesson-prereq` sheet to those ids before calling:

```js
const LP = require('../lib/ws-lesson-lp.cjs');
// inside the layout step, per rendered packet `page` (puppeteer) of lesson `l` at size `size`
const pk = await page.evaluate(LP.lpMeasure, { layout: true });
// the check page and its key, as LP-PREREQ expects them
const chk = pk.pages.find((p) => p.sheet === 'lesson-prereq' && p.kind !== 'key'); if (chk) chk.id = 'P0';
const chkKey = pk.pages.find((p) => p.sheet === 'lesson-prereq' && p.kind === 'key'); if (chkKey) chkKey.id = 'P0-key';
for (const r of LP.lpChecks(pk, ['LP-PREREQ', 'LP-MEASURE'])) if (!r.pass) fail(where, r.id, r.msg);
```

`lpMeasure` reads `data-dl-page` / `data-dl-kind`; the short packet marks its pages with `data-ws-sheet` (and keys with
`.ws-key`): add `P.sheet = pg.dataset.wsSheet` and `kind = pg.classList.contains('ws-key') ? 'key' : kind` in your copy, or
have the short packet write `data-dl-page` / `data-dl-kind` as the detailed pack does (preferred: one extractor).

The range half of D3 ("prerequisite items inside the step's range") needs the step's range, which only the lesson card
carries (`ws-lesson-card`, phase 0): add to `ws-lesson-check` a rule that every P0 item's numbers are within the card's
`range` for the step it routes to, with a backtest row on the phase 0 r1 head (`add Q2` counts 12–16 routed to a
within-10 step).

Backtest rows to add on lf-engine's branch (append-only, `tests/fixtures/precritic/backtests.json`):
- `lp-prereq-phase0`: commit-pair, fail = the commit phase 0 critic r1 graded (`2f8549bd`), pass = lf-engine's fix;
  command `node tests/scripts/ws-lesson-check.cjs --only add --seeds 1 --layout 1` (the LP-PREREQ finding in its output).
- `lp-measure-phase0`: same pair, the D4 / D9 / D11 blank foot and H13 bands (LP-MEASURE through `ws-lesson-samples` H13
  made blocking, as the phase 0 report asks).

## 3. LP-SWEEP over parts × refresh

`ws-detailed-lesson --sweep` probes whether the builder takes `refresh` (a build with `refresh: 1` that differs from
`refresh: 0`); the live detailed builder does not, so the sweep runs refresh 0 only and says so. When phase 0's
`lessonSeeds` / per-part refresh reaches the detailed builder, accept `refresh: n` (or `lessonSeeds: {part: seed}`) in the
`buildSheet({ role: 'detailed-lesson' })` request and the sweep runs refresh 0–2 with no change on our side. For the short
lesson, `ws-lesson-check` already refreshes each part (LR-18); add `LP.lpChecks(pk, ['LP-FAMILY-REPEAT', 'LP-GIVEAWAY',
'LP-MODELLED'])` on each refreshed packet there.
