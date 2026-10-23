# Wave 0 — real defects found by the W0 checks (lane status)

Lane: branch `claude/sweet-newton-c8wrv1-wip-w0-defects` · reports to session_01HVwpAE3g6EZH8idgErP6LP · started 2026-10-23 13:15 UTC
Base: `claude/sweet-newton-c8wrv1-wip-wave0-gates` @ bfdbd90.

| # | Defect | Check / baseline | Builder | State |
|---|---|---|---|---|
| 1 | `add_word_problems` (1366×768, 1280×720) and `long_div_2digit` (1280×600) question under the sticky header | `ws-viewport-check` / `viewport-check.json` | mq-opus-low | merged 88134f2 — the R7-D1 clear-of-header step ran only with a number-line band, only on scroll events, and gave up when its 4 px gap pushed Check off. Now (`question-render.js` `_clearRefLineOfHeader`) it runs for every skill at render + next frame, takes the question top and the header the way the check does, and clears exactly when the gap does not fit. Full default run 64 sessions: 0 findings; 8 pins removed. R7-D1 timed-header cases still pass. critic r1 PASS |
| 2 | Dark mode (pupil): practice-card skill title 2.55:1, online-worksheet problem number 1.59:1, 39/39 skills | `ws-screen-slots --dark` / `screen-slots.json` | mq-opus-low | merged 6ff87c2 — skill pill: `--mq-purple` text on the dark `--mq-purple-soft` tint → `html.dark .mq-skill-pill` light accent #B5A5F4 (5.43:1, css/ui-components.css end); worksheet number: dark `--mq-ink-2` on the active card's fixed cream → light ink #4F4B6B (7.89:1, css/screen-cell.css end). Dark sweep both roles 39 skills / 234 renders: 0 below 3:1, 78 pins removed; light run 0 NEW. critic r1 PASS |
| 3 | Big board: 1.6× zoom on `#questionPaper` scrolls (17/39 at 1366×768, 3/39 at 1920×1080) | `ws-chromebook-fit --bigboard` | mq-opus-low | merged eb353e4 — a fixed zoom cannot fit variable heights; `fitBoard()` in `js/modules/launch-chrome.js` measures each question and sets the largest zoom ≤ today's CSS cap that does not scroll (never below 1), via one additive rule `#questionPaper.tvb-fitted { zoom: var(--tvb-fit) }` in `css/play-teacher.css`. 1366×768: 17 → 2 scroll; 1920×1080: 3 → 0. Still pinned (too tall even at 1×, the card's scroll is the fallback): `add_word_problems` (+33 px), `add_sub_fact_family` (+81 px) at 1366×768. Pins live in `tests/fixtures/precritic/sweep-sample.json` (`chromebookFit`); 18 removed. Critic pending. Ownership: the lead gave this lane `css/play-teacher.css` / `css/teacher.css` for an ADDITIVE change to the big-board fit rule only (13:18; the teacher lane touches no app CSS today). The later teacher-site build must keep this fit rule. Critic r1 (`design/audit/critic/w0-defects-r1.md`): the change PASSES, but the 2 pinned skills score C3 7 → rebuild on mq-opus-medium (tighter board frame at heights ≤ 800 px), with the older dark quiz dot `.qt-q-dot.current` 2.18:1 the critic found. |
| 4 | Page error `numberFamilyData` of null: `add_sub_fact_family` card then worksheet / quiz | `ws-chromebook-fit --hosts card,worksheet,quiz` | mq-opus-low (with #1) | merged 4b58de9 — the card's family-input change/blur listeners read `state.currentQ` after the view left (null). They now judge only the question they were attached for. Pin removed from `tests/fixtures/precritic/sweep-sample.json` (`chromebookFit.problems`). critic r1 PASS |

## Times

| Run | Profile | Start (UTC) | End (UTC) | Minutes |
|---|---|---|---|---|
| Builder A: defects 1 + 4 | mq-opus-low | 13:18 | 14:32 | 74 |
| Builder B: defect 2 | mq-opus-low | 13:19 | 13:26 | 8 |
| Builder C: defect 3 | mq-opus-low | 13:19 | 14:05 | 46 |
| Critic r1 (all four fixes) | mq-opus-medium | 14:33 | 15:06 | 32 |
| Builder D: defect 3 rebuild (critic fail, escalated) + dark quiz dot | mq-opus-medium | 15:08 | — | — |

## Environment note
- `ws-harness.cjs` looks for `chrome-linux/chrome`; this container has `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`. Set `PUPPETEER_EXECUTABLE_PATH` to it (tests file not changed by this lane).
- Critic r1: identical on base bfdbd90 (pre-existing, not this lane). `support-numberline --quick` exits FAIL on 18 "X does not fit but offers nlOn…" lines (count_by_*, add/sub_negative, compare_to_half, …) from the option schema, outside this lane's change.
- Critic r1 follow-ups for the tests owner (W0-A): (a) the dark sweep's legibility scan covers only `.qt-question-card`, so it missed the quiz dot; widen it to the whole host view; (b) `ws-chromebook-fit --bigboard` can read the board controls mid `fadeSlide` entrance (translateY 24 px → "bottom 772 of 768", 1 run in 6): wait for `#gameView.getAnimations()` or emulate reduced motion; (c) `ws-harness.cjs` looks for `chrome-linux/` but the container has `chrome-linux64/`.
