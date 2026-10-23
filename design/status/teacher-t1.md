# Teacher site 2.0 — T1 clickable mock-up (lane status)

Lane lead: session_016hL18AgyxsUYPBST63Xeki · branch `claude/sweet-newton-c8wrv1-wip-teacher-t1` · reports to lead
session_01HVwpAE3g6EZH8idgErP6LP.

Owns: `design/mockups/teacher-2/`, `tests/scripts/ws-teacher-tokens.cjs`, this file.

| Date | Step | Who (profile) | Result |
|---|---|---|---|
| 2026-10-23 | Lane opened; brief from IMPROVEMENT_PLAN §2, §4.3 | lead | — |
| 2026-10-23 | First build (new screen design → medium, Q-S7) | mq-opus-medium | running |
| 2026-10-23 | Owner: "I like these colors style more" (Awsaj site) → restyle to board C, same §2.7 rules; lead told | lead | — |
| 2026-10-23 | First build + board C restyle: 31 screens, 124 shots, 14 flows ≤ §2.6 counts, `ws-teacher-tokens: OK` | mq-opus-medium | done (b1047708, 69c2fd4e, 39faf99e) |
| 2026-10-23 | Critic round 1 | mq-opus-medium (independent) | running |
| 2026-10-23 | Critic r1: A 7 · B 8 · C 7 · D 8 — FAIL (`design/mockups/teacher-2/critic-r1.md`, 13 defects) | mq-opus-medium | FAIL |
| 2026-10-23 | Fix round 1 (failed a critic round → medium, Q-S7) | mq-opus-medium | running |
| 2026-10-23 | Fix round 1: all 13 r1 defects fixed (3d3c350f, 879f42e8, d4a9b668); checks at 1366/1280/1024/820/390; OA → #2E2B71 | mq-opus-medium | done |
| 2026-10-23 | Critic round 2 (fresh critic) | mq-opus-medium | running |
| 2026-10-23 | Critic r2: A 6 · B 9 · C 8 · D 8 — FAIL (`critic-r2.md`). Chip-name truncation (r1 #9) and the Operations colour (r1 #8) survived two medium rounds → §1.7 stop rule: root causes made machine checks first (text clipped inside elements / chip name min width; bold vs ink and dark-tint vs page separation), then a fresh builder | lead | FAIL |
| 2026-10-23 | Fix round 2: fresh builder, checks first | mq-opus-medium | running |
| 2026-10-23 | Owner via lead: grade badge (neutral numbered circle, fixed slot) + grade grouping. Owner: warm stone page #EFECE8, current tints | lead | — |
| 2026-10-23 | Fix round 2: checks first (cea2d872 failing), then fixes b66395f5, fdbe3486, 5a74f98a, b9473ab7; OA → #555BAE, Data → #4B8FCC; all gates OK | mq-opus-medium | done |
| 2026-10-23 | Critic round 3 (fresh critic) | mq-opus-medium | running |
| 2026-10-23 | Owner: tray must handle 40–100 skills (a whole grade). Plan: chips ≤ ~8, then a summary bar (count + per-area segments) → tray sheet grouped by area; Add whole area / grade / unit; weights per area; summary and preview, Share code size, Quiz from grade. Lead told (§2.4 + code-length question). Owner also shown side-menu options (stone / white / taupe), answer pending | lead | next fix round |
| 2026-10-23 | Critic r3: A 7 · B 9 · C 7 · D 8 — FAIL (`critic-r3.md`): tray has no height cap; decoy thumbnail pictures (r2 #6 again → stop rule: picture-vs-text check first); preview ≠ summary counts | mq-opus-medium | FAIL |
| 2026-10-23 | Owner: side menu in deep purple #592B88 shown (ΔE 15.6 from OA, 18.9 from NF); choice pending | lead | pending |
| 2026-10-23 | Fix round 3: r3 defects + 40–100 skill tray, checks first | mq-opus-medium (fresh) | running |
| 2026-10-23 | Owner: purple rail tried then kept as ink ("keep it as it is for now"); big-tray popup area → grade; select + weight there; detailed weights with % lock (one skill 50 %, rest even); tray views List (default) · Chips · Thumbnails | lead | — |
| 2026-10-23 | Fix round 3: checks first (a5c99e4b failing), tray capped (≤ 81 px) with summary bar + popup, bulk add, detailed weights, pictures from the problem, preview = summary; all gates OK | mq-opus-medium | done |
| 2026-10-23 | Critic round 4 (fresh critic) | mq-opus-medium | running |
| 2026-10-23 | Critic r4: A 7 · B 8 · C 6 · D 8 — FAIL (`critic-r4.md`). Thumbnails contradict names for a 3rd round → stop rule: root cause is hand-drawn stand-ins; fix = draw every thumbnail from the real seeded generator (`generateQuestionFor`) captured into data.js. Search must use `skill-finder.js` (CLAUDE.md) | lead | FAIL |
| 2026-10-23 | Fix round 4 (fresh builder) | mq-opus-medium | running |

## Owner design list (batch rule, owner via lead 2026-10-23)

New owner design ideas are recorded here and NOT folded into a running fix round. After the current round's critic PASS the owner sees the whole overview once, then gives one batch (this list + new changes) → one build round → one critic round. Exception: anything blocking approval (broken flow, unreadable).

| Date | Owner's words | Status |
|---|---|---|
| 2026-10-23 | "we might want multiple pages of the same set of problems as well" | already in fix round 4 (sent before the batch rule): "Each page: New problems · Same problems, new numbers · Same page again" |
| 2026-10-23 | side menu "deep purple like in this screenshot" → "actually let's keep it as it is for now … if it's a problem I will change later" | parked; purple #592B88 shown as a reference on palette.html |

| Date | Step | Who (profile) | Result |
|---|---|---|---|
| 2026-10-23 | Fix round 4: thumbnails captured from the real app (715/715, 0 fallbacks, samples.js 5.81 MiB), readable crops (Big 12 / Medium 11 / Small 9 px), real skill-finder search, phone popup ≥ 6 rows, whole-grade How often, "Each page", kept print settings; all gates OK, 24 flows in plan | mq-opus-medium | done |
| 2026-10-23 | App defect seen in capture (not this lane's to fix): Add/Subtract Fractions (Unlike Denom) (No Visuals) prints "1/3 + ? 10 = 5/6" (no fraction bar under "?") | — | reported to lead |
| 2026-10-23 | Critic round 5 (fresh critic) | mq-opus-medium | running |
| 2026-10-23 | Critic r5: A 6 · B 9 · C 6 · D 8 — FAIL (`critic-r5.md`): ~120 captured thumbnails garbled (capture CSS reset broke SVG font sizes), crop cuts line starts, 820 tray bar "+6 areas" only, detailed-weight rows dense | mq-opus-medium | FAIL |
| 2026-10-23 | Stop rule (thumbnail fidelity, 4th round): root cause = copying the app's drawing into a mock-up format. Fix = render thumbnails LIVE with the app's own modules (read-only import), lazily; check compares each thumbnail to the app's buildSheet cell for the same seed | lead | — |
| 2026-10-23 | Fix round 5 (fresh builder) | mq-opus-medium | running |
