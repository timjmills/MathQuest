# Wave 0 — real defects found by the W0 checks (lane status)

Lane: branch `claude/sweet-newton-c8wrv1-wip-w0-defects` · reports to session_01HVwpAE3g6EZH8idgErP6LP · started 2026-10-23 13:15 UTC
Base: `claude/sweet-newton-c8wrv1-wip-wave0-gates` @ bfdbd90.

| # | Defect | Check / baseline | Builder | State |
|---|---|---|---|---|
| 1 | `add_word_problems` (1366×768, 1280×720) and `long_div_2digit` (1280×600) question under the sticky header | `ws-viewport-check` / `viewport-check.json` | mq-opus-low | building |
| 2 | Dark mode (pupil): practice-card skill title 2.55:1, online-worksheet problem number 1.59:1, 39/39 skills | `ws-screen-slots --dark` / `screen-slots.json` | mq-opus-low | merged 6ff87c2 — skill pill: `--mq-purple` text on the dark `--mq-purple-soft` tint → `html.dark .mq-skill-pill` light accent #B5A5F4 (5.43:1, css/ui-components.css end); worksheet number: dark `--mq-ink-2` on the active card's fixed cream → light ink #4F4B6B (7.89:1, css/screen-cell.css end). Dark sweep both roles 39 skills / 234 renders: 0 below 3:1, 78 pins removed; light run 0 NEW. Critic pending |
| 3 | Big board: 1.6× zoom on `#questionPaper` scrolls (17/39 at 1366×768, 3/39 at 1920×1080) | `ws-chromebook-fit --bigboard` | mq-opus-low | building — the lead gave this lane `css/play-teacher.css` / `css/teacher.css` for an ADDITIVE change to the big-board fit rule only (13:18; the teacher lane touches no app CSS today). The later teacher-site build must keep this fit rule. |
| 4 | Page error `numberFamilyData` of null: `add_sub_fact_family` card then worksheet / quiz | `ws-screen-slots` | mq-opus-low (with #1) | building |

## Times

| Run | Profile | Start (UTC) | End (UTC) | Minutes |
|---|---|---|---|---|
| Builder A: defects 1 + 4 | mq-opus-low | 13:19 | — | — |
| Builder B: defect 2 | mq-opus-low | 13:19 | 13:26 | 8 |
| Builder C: defect 3 | mq-opus-low | 13:21 | — | — |

## Environment note
- `ws-harness.cjs` looks for `chrome-linux/chrome`; this container has `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`. Set `PUPPETEER_EXECUTABLE_PATH` to it (tests file not changed by this lane).
