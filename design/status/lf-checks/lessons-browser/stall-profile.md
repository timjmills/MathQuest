# Lessons browser stall: CPU profile (lf-checks, 2026-11-21)

Conditions: the THUMB-NO-FREEZE conditions, reproduced with CDP. Viewport 1024 x 768, `Emulation.setCPUThrottlingRate 4`,
`Storage.clearDataForOrigin` (IndexedDB), `Profiler.start` with a 0.5 ms sampling interval, grade 3 `#wrm/3?view=thumbs`,
scrolling in 500 px steps 700 ms apart, then 4 s idle. Head 2db6cd1b4.

## What happened

- The tasks were long, not one: 5,063, 4,981, 4,814, 4,751 ms and more, and the longest frame gap was 5,417 ms. The gate
  measured 6,429 ms and 6,783 ms on its run.
- Each long task is one IntersectionObserver callback: `lessonThumbs`' observer (js/modules/teacher-wrm.js:617) ->
  `drawLessonThumb` (teacher-wrm.js:556) -> `mountCropped` (js/modules/teacher-chip.js:111) for EVERY card that entered the
  viewport after a scroll, all in one task.
- One `mountCropped` measured 220 to 415 ms at CPU x4 (49 thumbnails, 11.8 s in all). About 80 % of that is forced style
  flushes, not JavaScript.
- Root cause of the flush cost: on the teacher screens, inserting ANY element and reading a style restyles the whole document,
  about 35 ms at CPU x4. Delete every `:has()` rule and that drops to 1 ms. A bisection found at least 8 independent triggers,
  each of them enough alone: rules with `:has()` outside the subject compound, in sheet-kit.css (the INK-31 key-ink rule
  `[data-ws-shape="check"]:has(*)`, `.ws-stack-legacy:not(:has(...))`, `.ws-cell:has(.ws-eq-left) .ws-with-pane > div`,
  `.ws-cell[data-ws-cell]:not(:has(...))`), screen-cell.css (`.k2-twin:has([data-mq-swiperow]) > *`) and ui-components.css
  (`#questionCard:has(#dndGenericHost) ...` x 3). These are shared print and play rules, so they were not changed here. A
  thumbnail does 6 to 10 flushes, which is where the time goes.

## Top 15 self time, the longest busy stretch (10.2 s), head 2db6cd1b4

| ms | Function | Where |
|---:|---|---|
| 2,797 | getBoundingClientRect (native: the forced flush) | teacher-chip.js measureStage, teacher-wrm.js fitWhole |
| 2,481 | visibleHost | js/modules/active-box.js:82 (refreshActiveBox, the first read after the DOM changed) |
| 2,459 | fit | js/modules/teacher-preview.js:193 (scrollWidth / offsetWidth after a style write) |
| 813 | mountBuilt | js/modules/teacher-preview.js:246 (innerHTML of the sample) |
| 811 | (anonymous) in inkTrees | js/modules/screen-cell.js:2798 (getComputedStyle of every element) |
| 251 | (program) | |
| 172 | cropFrame | js/modules/teacher-chip.js:77 |
| 151 | getPropertyValue (native) | screen-cell.js inkTrees, border reads |
| 64 | querySelectorAll (native) | |
| 58 | generateResolvedQuestion | js/modules/generate-question.js:527 |
| 25 | (garbage collector) | |
| 8 | measureStage | js/modules/teacher-chip.js:37 |
| 8 | esc | js/modules/sheet/cell.js:15 |
| 7 | inkTrees | js/modules/screen-cell.js:2782 |
| 6 | (anonymous) | js/modules/teacher-chip.js:57 |

Total time on the same stretch: `drawLessonThumb` 4,965 ms, `mountCropped` 4,964, `mountSample` 3,328, `mountBuilt` 3,212,
`cropFrame` 2,828, `measureStage` 2,655, `refreshActiveBox` 2,531, `monoCell` 987. Sample generation was only 84 ms.

## The fix and the measure after it

- `drawLessonThumb` queues the thumbnail. A pump runs ONE step of ONE thumbnail per task (setTimeout 0). The steps are:
  generate, write the cell, mono pass, the two halves of `fit`, then crop. The 900 ms settle pass runs as three tasks on this
  path.
- `mountBuilt` and `fit` are now built from these same steps (`mountSteps`, `fitSteps`) and run them back to back, so every
  other caller draws exactly as before.
- The frame is held at opacity 0 until its last step, so no half-drawn item shows.
- After the fix, under the same conditions: longest task 166 ms, longest frame gap 300 ms. THUMB-NO-FREEZE is OK at 1024 on
  three runs.
