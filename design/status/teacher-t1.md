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
| 2026-10-23 | "I also want these to be in the general skills not just lessons (when they are built). Everything in a lesson should have a corresponding skill engine." | recorded in the plan as Q-L2 (lead); already reflected in the mock-up, no change needed |
| 2026-10-23 | (via lead; full text IMPROVEMENT_PLAN §2.4 on claude/sweet-newton-c8wrv1) Multi-lesson practice sets, highly customizable: tick skills per lesson → "Add to tray" as a group named after the lesson, "Next lesson" arrow, 5–6 lessons; Print = one worksheet per lesson (own pages and key) / one for all (Mixed or a section per lesson) / both; Print all = one PDF in lesson order; Save as set + Share one short code | queued for the next batch; show as a mock-up flow at the approval sitting |
| 2026-10-23 | "on a print a worksheet or share with pupils if it is above 5 skills do not use chip but instead show a list organized by grade and domain. use instead list. with popup preview." → in the Print (worksheet) and Share sheets, > 5 skills = a list grouped by grade and maths area (no chips), each row opening a popup preview of that skill; owner left the order to the lead: area → grade, matching the tray popup | queued for the next batch |
| 2026-10-23 | "chip should also give popup preview" → every skill chip (tray, sheets) opens a preview of that skill too; owner agreed the lead's recommendation: one tap opens the options sheet, which leads with the live preview and updates as options change; hover on desktop shows a quick preview | queued for the next batch |
| 2026-10-23 | "I don't like the dark mode so for now do not make a dark mode" | applied in fix round 5 (a scope cut): light only, dark tokens parked, dark gate checks skipped. Owner confirmed via lead: teacher site only; the pupil app keeps its dark mode (plan §2.7 note) |

| Date | Step | Who (profile) | Result |
|---|---|---|---|
| 2026-10-23 | Fix round 4: thumbnails captured from the real app (715/715, 0 fallbacks, samples.js 5.81 MiB), readable crops (Big 12 / Medium 11 / Small 9 px), real skill-finder search, phone popup ≥ 6 rows, whole-grade How often, "Each page", kept print settings; all gates OK, 24 flows in plan | mq-opus-medium | done |
| 2026-10-23 | App defect seen in capture (not this lane's to fix): Add/Subtract Fractions (Unlike Denom) (No Visuals) prints "1/3 + ? 10 = 5/6" (no fraction bar under "?") | — | reported to lead |
| 2026-10-23 | Critic round 5 (fresh critic) | mq-opus-medium | running |
| 2026-10-23 | Critic r5: A 6 · B 9 · C 6 · D 8 — FAIL (`critic-r5.md`): ~120 captured thumbnails garbled (capture CSS reset broke SVG font sizes), crop cuts line starts, 820 tray bar "+6 areas" only, detailed-weight rows dense | mq-opus-medium | FAIL |
| 2026-10-23 | Stop rule (thumbnail fidelity, 4th round): root cause = copying the app's drawing into a mock-up format. Fix = render thumbnails LIVE with the app's own modules (read-only import), lazily; check compares each thumbnail to the app's buildSheet cell for the same seed | lead | — |
| 2026-10-23 | Fix round 5 (fresh builder) | mq-opus-medium | running |
### Teacher site 2.0 T1 (mock-up), rounds r1–r5 (lane lead session_016hL18AgyxsUYPBST63Xeki, 2026-10-23)

**(1) Automatic checks — critic findings a machine could have measured**

| Round | Finding | Check that measures it | Existing check should have caught it? |
|---|---|---|---|
| r1 | Lessons squeezed / sideways scroll at 1024 and 820; panel buttons clipped 16 px | page sideways scroll + child-past-parent overflow at 1366/1280/1024/820/390 (now in `shoot.cjs`) | yes in spirit: §2.9 already named those widths, but the first shoot script only ran 1366 and 390 |
| r1 | Thumbnails contradict skill names | thumbnail ↔ skill content check (now `thumbs-check.cjs`) | no check existed |
| r1 | Strips hiding options sideways at 390 | element scrollWidth > clientWidth on any strip | no |
| r1 | Raw sizes in `app.js` inline styles | token gate scans JS inline `style=` (now check 9) | no: the gate only read CSS |
| r1/r2 | Chip and tray names truncated ("Addi…"), area word spilling past chip | text clipped in own box / ellipsis / name narrower than ~8 ch (now in `shoot.cjs`) | no: overflow checks were page-level only |
| r2 | Skills at 820: 110 px search, 113 px cards, mid-word title breaks | min search width, min card width, mid-word break detector | no |
| r2 | Operations #2E2B71 reads as ink; dark tint 1.05 : 1 | bold vs ink ΔE ≥ 20 and ≥ 2 : 1; dark tint ≥ 1.2 : 1 vs page (now checks 10–11) | no: the gate compared areas with each other, never with ink or the page |
| r2 | Controls 36 px | every control ≥ 44 × 44 (height AND width) | partly: §2.8 rule existed, no check |
| r2 | Tick box covering the drawing | overlap of tick box and thumbnail content box | no |
| r3 | Tray grows to 45 % of screen at 10 skills | tray height ≤ 96 px / ≤ 15 % viewport at 1–200 skills (now in `shoot.cjs`) | no |
| r3 | Decoy pictures (generic counters, fixed ¾ bar) | picture data-* values vs the problem's numbers | no: the r2 fix added a check that pictures *exist*, not that they *match* |
| r3/r4 | Preview counts ≠ summary line | per-skill counts in preview == `plan().counts` for several weightings | no |
| r4 | ~35 base drawings contradict names (unlike denominators, rounding place, Mode) | content checks per name class; ROOT: draw from the real generator | no: check only covered the added pictures, not the base drawing |
| r4 | Search placeholder "2.NBT.5" finds 0 | placeholder examples must each return ≥ 1 hit via the real finder | the CLAUDE.md rule (use `skill-finder.js`) should have been in the brief; no check |
| r4 | "+N more" alone at 1024/820; close buttons 22–39 px wide | ≥ 1 named item before "+N"; 44 px width rule | partly (height-only 44 px check) |
| r5 | ~120 captured thumbnails garbled (SVG font-size overridden by capture reset) | compare each thumbnail's text sizes/boxes (or pixels) with the app's own `buildSheet` cell | no: `thumbs-check` checked min size and bounds, not fidelity to the app |
| r5 | Crop cuts line starts | no text line starts left of its crop window | no |
| r5 | 820 big-tray bar "+6 areas" only | same rule as r4 "+N" generalised to area segments | the r4 check was too narrow (chips only) |

**(2) Speed-ups — what cost time, and the smallest change that saves it**

| Round | Cost | Smallest change |
|---|---|---|
| r1 | Builder checked only 1366/390; critic found 1024/820 breaks → a full round | Mock-up briefs name all five §2.9 widths and require page + in-panel overflow checks from the first build |
| r1–r5 | Thumbnails cost four rounds (hand drawings → pictures → captured DOM → live) | For a mock-up, use real app rendering from the start or neutral placeholders; never hand-drawn stand-ins of real content (lead time-box now in place) |
| r2 | Same chip truncation fixed twice because the check didn't exist | Stop rule applied at the first repeat, not the second: when a critic finding is measurable, the fix commit must include its check |
| r2–r4 | Owner design changes arriving mid-round (palette, grade badge, stone, tray scale, popup, weights, views, Each page) re-opened screens the critic had graded | Batch rule (now owner rule): queue ideas, one approval sitting, one build + one critic round |
| r3 | Tray had no height budget, so the 40–100 skill requirement came late and forced a redesign | Every fixed bar/panel gets a size budget (px and % of viewport) in the brief, tested at extreme content counts (1, 10, 100) |
| r4 | Search built label-only despite the CLAUDE.md rule | Lane briefs quote the CLAUDE.md rules that touch the screen (search → `skill-finder.js`; generation → `generateQuestionFor`) |
| r5 | 6 MB captured samples slow every critic page load and shoot run | Live lazy rendering (in progress) or placeholders; budget page weight in the brief |
| all | Builders ran 1-2 h per round; critics re-wrote their own probes each time | Keep the critic's probe scripts in the lane folder (`design/mockups/teacher-2/critic-tools/`) so each builder runs them before reporting |

| 2026-10-23 | Owner pre-approved the teacher-site build ("I approve the teacher site when its ready to build. I have seen enough"; STATUS 619a0521). No approval sitting. Exit = independent critic ≥ 8 on all four, then the build brief below in this file, then report to the lead | lead | — |
