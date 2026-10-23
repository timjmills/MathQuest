# Wave 0 — real defects found by the W0 checks (lane status)

Lane: branch `claude/sweet-newton-c8wrv1-wip-w0-defects` · reports to session_01HVwpAE3g6EZH8idgErP6LP · started 2026-10-23 13:15 UTC
Base: `claude/sweet-newton-c8wrv1-wip-wave0-gates` @ bfdbd90.

| # | Defect | Check / baseline | Builder | State |
|---|---|---|---|---|
| 1 | `add_word_problems` (1366×768, 1280×720) and `long_div_2digit` (1280×600) question under the sticky header | `ws-viewport-check` / `viewport-check.json` | mq-opus-low | building |
| 2 | Dark mode (pupil): practice-card skill title 2.55:1, online-worksheet problem number 1.59:1, 39/39 skills | `ws-screen-slots --dark` / `screen-slots.json` | mq-opus-low | building |
| 3 | Big board: 1.6× zoom on `#questionPaper` scrolls (17/39 at 1366×768, 3/39 at 1920×1080) | `ws-chromebook-fit --bigboard` | mq-opus-low | building — the lead gave this lane `css/play-teacher.css` / `css/teacher.css` for an ADDITIVE change to the big-board fit rule only (13:18; the teacher lane touches no app CSS today). The later teacher-site build must keep this fit rule. |
| 4 | Page error `numberFamilyData` of null: `add_sub_fact_family` card then worksheet / quiz | `ws-screen-slots` | mq-opus-low (with #1) | building |

## Times

| Run | Profile | Start (UTC) | End (UTC) | Minutes |
|---|---|---|---|---|
| Builder A: defects 1 + 4 | mq-opus-low | 13:19 | — | — |
| Builder B: defect 2 | mq-opus-low | 13:19 | — | — |
| Builder C: defect 3 | mq-opus-low | 13:21 | — | — |
