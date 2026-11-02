Lane: chromebook-speed
Title: Student Chromebook speed: lazy-load the teacher half, stress-test the play-through
Session: session_013pHDnKbPEj3tNpvzK4cQMa (lead session_01HVwpAE3g6EZH8idgErP6LP)
Branch: claude/sweet-newton-c8wrv1-chromebook-speed
Owner of files: js/globals.js (loader), js/modules/deferred.js (new), js/modules/init.js (deferred imports), index.html (two third-party scripts, ten data-mq-href stylesheets), js/modules/screen-cell.js (inkTrees, wireSwipeRows level), js/modules/question-render.js (_clearRefLineOfHeader), print-global-skills.js / print-weighted.js (no reset at import), tests/scripts/ws-chromebook-perf.cjs, tests/scripts/ws-ink-parity.cjs, tests/lib/perf-server.cjs, tests/lib/ws-harness.cjs (waits for the lazy parts)
State: passed (checker r2)
Updated: 2026-11-02
Builder profile: lane session (first build of the loader)
Critic rounds: 2, PASS (r2: 8/8/8/8)

## Now
- Built and measured; independent checker (mq-opus-medium) verifying teacher features, pupil paths and the budgets.
- Follow-ups F1 (skip-count rows) and F2 (100-skill print preview) are listed below for the lead.

## Owner go

## Open questions
- none

## What changed
1. **The deferred half.** `js/modules/deferred.js` imports print-settings / -global-skills / -weighted / -generate / -sheet,
   google-classroom, quiz-storage / -builder / -take / -results / -monitor, teacher-quiz-ui, skills-organizer, map-engine /
   -mode-ui / -results, teacher-shell and teacher-sheet (and through them the standards, WRM, build-list, visual-catalogue,
   lesson and site-lesson data): 83 modules, ~1.1 MB gzip. `js/globals.js` stays the single entry; every one of the 272 names
   it used to attach is a thin async stub on window (`window.fn = (...a) => load().then(api => api.fn(...a))`) until the part
   loads, then the real function replaces it. Element ids that share a function's name (`soSearchInput`, `qbSearchInput`)
   are replaced as before.
2. **When it loads.** Before `init()` for a ?map= / ?quiz= / &set= link, the teacher board, a teacher hash route, or a device
   that opens in teacher view (so those users see exactly what they saw before). Otherwise on idle after boot
   (requestIdleCallback), and at once when the body becomes `teacher-mode`. A pupil link (?c= / ?code= / ?qs=) never
   prefetches it: the Chromebook spends its Wi-Fi and CPU on the game.
3. **Its stylesheets.** Ten sheets no pupil screen matches (teacher-library / -pdf / -sheet / -shell / -tray / -wrm / -quiz,
   skills-organizer, google-export, quiz-mode; runtime audit over home, landing and 15 game questions: 0 rules match) are
   `<link rel="stylesheet" data-mq-href=...>`: same place in the cascade, href given when the deferred half loads; the load
   waits for them. Google Identity (gsi/client, 101 KB) and html2canvas (46 KB) are added by deferred.js (only the Google
   export uses them).
4. **The worksheet part.** `worksheet.js` (online worksheet mode) is its own lazy part: idle prefetch on every visit, fetched
   at once by a link that opens in worksheet mode (|Gw or |G?).
5. **Play-through fixes** (found by the stress test):
   - the live mono pass (`screen-cell.js` inkTree) restyled the page once per element (restore, read, write, read ...), on
     every mutation the cell's observer saw: 21.6 s of CPU over 50 questions at 6x. `inkTrees()` makes the same decisions in
     batches (restore all, read all, decide and write in document order, then read and write borders after the colours
     they follow) and re-reads a settled cell only when a stylesheet arrived. ws-ink-parity: 116 skills, 0 differences.
   - `wireSwipeRows` level() measured each line after writing the previous tab, and ran again right before each return of
     `layout()` (mode()'s upd() levels straight after): measured first, written only on change, the redundant calls gone.
     ws-ink-parity --geometry on 12 skip-count / chart skills at 1366, 1024 and 400 px: 0 differences.
   - `_clearRefLineOfHeader` read the computed style of all ~2,600 elements after every scroll; it now prunes display:none
     subtrees and the card (both were discarded one by one).
   - `updateSkillsCountBadge` (called by core on every skill change) pulled the whole deferred half into a pupil game: core
     has its own copy.
6. **Bug found on the way:** print-global-skills.js and print-weighted.js reset `window.globalSkillsList` / `weightedItems` to
   `[]` at import; imported late, that would wipe a teacher's list. They keep an existing array; globals.js creates both.

## Measurements (cloud container, tests/lib/perf-server.cjs = HTTP/2 + TLS + gzip + max-age=600, CDP throttling)
| | 1375b857b (base) | this lane |
|---|--:|--:|
| Startup modules / gzip JS | 269 / 2.90 MB | 185 / 1.73 MB |
| Pupil first visit to Start Playing, 3 Mbps / 150 ms / CPU 4x (median of 3) | 10.85 s | 6.82 s (-37 %) |
| Pupil later visit (HTTP cache + service worker) | 2.00 s | 1.49 s (-25 %) |
| Play-through, 46-skill link, 50 questions at CPU 6x: median / max question | 376 ms / 3,041 ms | 316-430 ms / 1.1-2.1 s (skip-count only) |
| ... questions over 1 s / longest task | 6 / 4,838 ms | 5 pinned skip-count / ~950 ms |
| Stress, ~150 skills over 35 categories: max question / long tasks > 200 ms / longest | 1,853 ms / 55 / 5,642 ms | 802 ms / 32 / 487 ms |
| Heap growth over 50 questions (after GC) | +3.6 MB / +5.2 MB | +3.4 MB / +4.0 MB |
| Live intervals / window+document listeners | 3 -> 1 / 113 -> 115 | 3 -> 1 / 79 -> 90 |
| Teacher, after the idle prefetch, 100 skills, CPU 4x, settled = 2.5 s quiet: view / tray / print preview / quiz sheet | 7.6 / 2.1 / 74-88 / 25 s | 7.7 / 2.4 / 74-83 / 26 s (unchanged within noise) |
Live (the lead measured 1375b857b live at 17.1 s first / ~7 s later visit): to be re-measured live after the deploy.
No memory leak and no timer pile-up was found: heap growth is ~4 MB over 50 questions, intervals and listeners are flat.

## Follow-ups (for the lead)
- **F1 skip-count rows still 1.1-1.7 s a question at CPU 6x** (pinned in the gate with a 2.5 s ceiling; one run reached 2.08 s). Cause: the
  wireSwipeRows state machine forces ~16 layouts a question (level x6, fits x6, cellInner x4; ~25 ms each at 6x on this
  page, whose 157 `:has()` rules make every restyle broad) and the card's first programmatic focus re-runs `mode()`. Next
  step: let `mode()` skip when the row's inputs (cell inner width, row width, frame attributes) are unchanged since its last
  run, and measure `cellInner` from the ResizeObserver entry instead of a 0-width relayout.
- **F2 teacher print preview with 100 skills takes ~80 s at CPU 4x** (~20 s at full speed; base 88 s). Cause:
  print-sheet.js `measureItems` / `probeRun` reads the box of every element of every cell for every column count and state
  (~51 s of a 59 s profile at 87 skills). Next step: measure each item once per column count (cache across states when the state does not change
  the drawing), or measure only the column counts the role can choose for that skill.

## Times
Times: builder loader + gate + play-through fixes, start 2026-11-02T05:05Z, end 2026-11-02T07:45Z, profile lane session

## Log
- 2026-11-02: checker r2 PASS (correctness 8, speed 8, gate 8, code 8). D1-D8 verified (drop + retry, double drop -> reload
  toast, pupil exit loads nothing, MAP scaffold still released, D6 backtested). Open minor items for the lead: the loading
  toast can time out before a very slow download ends and a click during the wait can be lost; after a permanent failure an
  inline onclick on a stub logs an unhandled rejection (the reload toast is showing); the first-visit gain is -34.7 % to
  -37 % across runs (target -35 %); the later-visit budget (2.3 s) is a ceiling above the base median, not a guard of the
  gain; `--only load,play` (~4 min) is UNTIMED in session 3 (27.8 of 30 min) and shares the 2-slot runner.
- 2026-11-02: checker r1 FAIL (correctness 6, speed 8, gate 6, code 7). Fixed: D1 a failed import() is cached by the browser
  for the page's life, so "retry on the next call" never refetched -> a retry imports a fresh URL (?retry=n) and a second
  failure tells the teacher to reload; D2 exitGame/goHome called the MAP release stub and pulled the teacher half into a
  pupil's exit -> skipped while it is a stub, and the gate now leaves the game and checks again; D3 one-sample load and one
  tray open flaked -> load median of 3, the cold tray open judged, the deploy list runs `--only load,play` (~4 min; the
  sessions are at 27-28 of 30 min), the flake rule re-runs a FAIL alone; D4 a switch to teacher view while the half is
  still downloading says "Loading the teacher tools"; D5 ?quiz= / ?map= after a failed boot load log the cause (and ?map=
  retries) instead of an unhandled rejection / a false "invalid link"; D6 the gate checks DEFERRED_NAMES against
  deferred.js's API and that no lazy name is still a stub; D7 the teacher figures: settle() ended early in the Skills
  screen's thumbnail pauses -> 2.5 s quiet; like for like the teacher side equals the base (the earlier "7.4 -> 4.5 s" was
  that artefact); D8 dead inkTree removed, stray comment fixed, heap budget 20 MB and listeners +40.
- 2026-11-02: built (loader, deferred.js, worksheet part, deferred CSS, play-through fixes, ws-chromebook-perf, ws-ink-parity);
  measurements above; independent checker next.
