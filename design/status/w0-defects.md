# Wave 0 — real defects found by the W0 checks (lane status)

Lane: branch `claude/sweet-newton-c8wrv1-wip-w0-defects` · reports to session_01HVwpAE3g6EZH8idgErP6LP · started 2026-10-23 13:15 UTC
Base: `claude/sweet-newton-c8wrv1-wip-wave0-gates` @ bfdbd90.

| # | Defect | Check / baseline | Builder | State |
|---|---|---|---|---|
| 1 | `add_word_problems` (1366×768, 1280×720) and `long_div_2digit` (1280×600) question under the sticky header | `ws-viewport-check` / `viewport-check.json` | mq-opus-low | merged 88134f2 — the R7-D1 clear-of-header step ran only with a number-line band, only on scroll events, and gave up when its 4 px gap pushed Check off. Now (`question-render.js` `_clearRefLineOfHeader`) it runs for every skill at render + next frame, takes the question top and the header the way the check does, and clears exactly when the gap does not fit. Full default run 64 sessions: 0 findings; 8 pins removed. R7-D1 timed-header cases still pass. critic r1 PASS |
| 2 | Dark mode (pupil): practice-card skill title 2.55:1, online-worksheet problem number 1.59:1, 39/39 skills | `ws-screen-slots --dark` / `screen-slots.json` | mq-opus-low | merged 6ff87c2 — skill pill: `--mq-purple` text on the dark `--mq-purple-soft` tint → `html.dark .mq-skill-pill` light accent #B5A5F4 (5.43:1, css/ui-components.css end); worksheet number: dark `--mq-ink-2` on the active card's fixed cream → light ink #4F4B6B (7.89:1, css/screen-cell.css end). Dark sweep both roles 39 skills / 234 renders: 0 below 3:1, 78 pins removed; light run 0 NEW. critic r1 PASS |
| 3 | Big board: 1.6× zoom on `#questionPaper` scrolls (17/39 at 1366×768, 3/39 at 1920×1080) | `ws-chromebook-fit --bigboard` | mq-opus-low | merged eb353e4 — a fixed zoom cannot fit variable heights; `fitBoard()` in `js/modules/launch-chrome.js` measures each question and sets the largest zoom ≤ today's CSS cap that does not scroll (never below 1), via one additive rule `#questionPaper.tvb-fitted { zoom: var(--tvb-fit) }` in `css/play-teacher.css`. 1366×768: 17 → 2 scroll; 1920×1080: 3 → 0. Still pinned (too tall even at 1×, the card's scroll is the fallback): `add_word_problems` (+33 px), `add_sub_fact_family` (+81 px) at 1366×768. Pins live in `tests/fixtures/precritic/sweep-sample.json` (`chromebookFit`); 18 removed. Ownership: the lead gave this lane `css/play-teacher.css` / `css/teacher.css` for an ADDITIVE change to the big-board fit rule only (13:18; the teacher lane touches no app CSS today). The later teacher-site build must keep this fit rule. Critic r1 (`design/audit/critic/w0-defects-r1.md`): the change PASSES, but the 2 pinned skills score C3 7 → rebuild on mq-opus-medium (tighter board frame at heights ≤ 800 px), with the older dark quiz dot `.qt-q-dot.current` 2.18:1 the critic found. Rebuilt (7da737d, see below): both fit, all 78 board renders ok. Critic r2 (`design/audit/critic/w0-defects-r2.md`): 1366×768 and 1920×1080 PASS; FAIL at 1280×720 — the old `.visual-aid { max-height: 46vh; overflow: auto }` (ui-components.css:4634, max-height 760px) is not lifted on the board and fitBoard only measures the card, so 6 skills clip inside their cell (C1/C3 6) and the fact family scrolls 34 px; dark answered quiz dot 3.10:1 (C1 7). Builder E (0bb50b2): board lifts the 46vh/38vh caps (play-teacher.css, additive), fitBoard also fails on any nested box inside #questionPaper clipped > 12 px (number-line pan strips excluded), rail padding tightened at ≤ 720 px, layout chosen with the revealed answer's space reserved (no flip). 39 skills × 1280×720 / 1366×768 / 1920×1080: 0 scroll, 0 nested clip, zoom ≥ 1. Quiz: dark answered dot #34D399 (6.08:1); current+answered gets a purple ring in both modes. Critic r3 (`design/audit/critic/w0-defects-r3.md`): PASS, every screen ≥ 8. |
| 4 | Page error `numberFamilyData` of null: `add_sub_fact_family` card then worksheet / quiz | `ws-chromebook-fit --hosts card,worksheet,quiz` | mq-opus-low (with #1) | merged 4b58de9 — the card's family-input change/blur listeners read `state.currentQ` after the view left (null). They now judge only the question they were attached for. Pin removed from `tests/fixtures/precritic/sweep-sample.json` (`chromebookFit.problems`). critic r1 PASS |

## Times

| Run | Profile | Start (UTC) | End (UTC) | Minutes |
|---|---|---|---|---|
| Builder A: defects 1 + 4 | mq-opus-low | 13:18 | 14:32 | 74 |
| Builder B: defect 2 | mq-opus-low | 13:19 | 13:26 | 8 |
| Builder C: defect 3 | mq-opus-low | 13:19 | 14:05 | 46 |
| Critic r1 (all four fixes) | mq-opus-medium | 14:33 | 15:06 | 32 |
| Builder D: defect 3 rebuild (critic C3 = 7 on the 2 pinned skills) + quiz dark dot | mq-opus-medium (escalated: failed a critic round) | 15:07 | 15:28 | 21 |
| Critic r2 (defect 3 rebuild + quiz dot) | mq-opus-medium | 15:28 | 15:52 | 24 |
| Builder E: board 1280×720 nested clip + dark answered dot (critic r2) | mq-opus-medium | 15:54 | 16:22 | 28 |
| Critic r3 (board + dark and light quiz dots) | mq-opus-medium | 16:23 | 16:53 | 30 |
| Builder F: light quiz dots (owner ruling) | mq-opus-low | 16:41 | 16:45 | 4 |

## Defect 3 rebuild (after the critic, mq-opus-medium)
- Critic: the Board display still scrolled at 1366x768 for `add_sub_fact_family` (+81 px measured, really +162: the centred card also cut the instruction line above its top) and `add_word_problems` (+33, really +65). C3 = 7.
- Fix (space from the frame, never the question; zoom stays >= 1): `css/play-teacher.css` (additive) `justify-content/align-items: safe center` on the board card; at `max-height: 800px` the frame padding 12/16, gaps 8, card padding 12/16; `#gameView.tvb-rail` puts the chips at the top and the controls (and the revealed answer) at the foot of a 216 px right rail. `fitBoard()` (`js/modules/launch-chrome.js`) adds the rail only when zoom 1 does not fit with the bar above and the controls below, then fits the zoom again; the fit has no 1 px tolerance. 1366x768: word problem fits stacked at 1.02 (rail at 1.16 when the answer is shown), fact family fits on the rail at 1.0. Both pins removed: `--bigboard` 78/78 ok, 0 NEW.
- Quiz dark dot: `html.dark .qt-q-dot.current:not(.answered) { color: #1F1B33 }` (css/quiz-mode.css end): 2.18:1 -> 7.64:1; light unchanged (4.64:1).

## Environment note
- `ws-harness.cjs` looks for `chrome-linux/chrome`; this container has `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`. Set `PUPPETEER_EXECUTABLE_PATH` to it (tests file not changed by this lane).
- Critic r1: identical on base bfdbd90 (pre-existing, not this lane). `support-numberline --quick` exits FAIL on 18 "X does not fit but offers nlOn…" lines (count_by_*, add/sub_negative, compare_to_half, …) from the option schema, outside this lane's change.
- Critic r1 follow-ups for the tests owner (W0-A): (a) the dark sweep's legibility scan covers only `.qt-question-card`, so it missed the quiz dot; widen it to the whole host view; (b) `ws-chromebook-fit --bigboard` can read the board controls mid `fadeSlide` entrance (translateY 24 px → "bottom 772 of 768", 1 run in 6): wait for `#gameView.getAnimations()` or emulate reduced motion; (c) `ws-harness.cjs` looks for `chrome-linux/` but the container has `chrome-linux64/`.
- Light-mode quiz dots: owner ruling "use darker dots" (via the lead, 16:40). 6d79970 appends `html:not(.dark) .qt-q-dot…` rules to css/quiz-mode.css: every state ≥ 6.72:1 (was 1.65–4.64), told apart by fill / solid vs dashed border / purple fill or ring, not colour alone; dark unchanged.
- `ws-stamp-assets --check` reports index.html stale; stamping is the deploy step's job, not this lane's.
- Gate gap (tests owner): `ws-chromebook-fit --bigboard` does not cover 1280×720 nor count clipping inside nested scroll boxes; the critic's probe (scratchpad r3/probe-fit.cjs) did.

## Outcome (16:53 UTC)
All four defects are fixed and passed by the critic: r1 passed defects 1, 2 and 4; r3 passed defect 3 and the quiz dots (light and dark). Every pin they had is removed. The baselines now pin nothing for these defects.

## Follow-ups from critic r3 (not blocking, no owner yet)
- F1 board: choose stacked or rail by the larger zoom (base10_build, arrays_groups, function_table_easy draw smaller at 1366×768 stacked than at 1280×720 on the rail).
- F2 board: `nl_add` at zoom 1.6 shows 0..15 where the card shows 1..20; answers 16–20 need the pan button.
- F4 board: make the 12 px nested-clip tolerance a test of drawn content, not box overflow.
- F5 board: debounce fitBoard on resize and collect clip-capable elements once per fit (4× throttle: up to ~500 ms on count_by_tables).
- F3 (older) `integer_nl_drag` opens on 0 with no pan buttons; targets ±7..±10 are off-screen on card and board.
- F6 (older) `count_by_tables`: row-2 arrow below its row, ~100 px empty band above the caption, "press Space" shown on the class board.
- F7 (older) a caret shows in the fact family's first box after Show answer on the board.
- F8 (older) dark mode: flagged and plain quiz dots differ by colour only; plain border faint.
- F9 (older) light-mode quiz "Flag" button text is very low contrast.
