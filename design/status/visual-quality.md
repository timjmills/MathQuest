Lane: visual-quality
Title: Visual quality investigation, VQ bar + checks, graphic library, owner examples fixed
Session: session_013pHDnNX8LHcZZypxg14fSs
Branch: claude/sweet-newton-c8wrv1-visual-quality (draft PR #27)
Owner of files: design/audit/VISUAL_QUALITY.md, design/audit/runs/visual-quality/, design/GRAPHIC_LIBRARY.md, js/modules/sheet/graphics/, js/modules/sheet/cells/family-check.js, word-work sentence layout, tests/scripts/ws-visual-quality.mjs, tests/fixtures/precritic/vq-*
State: fix
Updated: 2026-10-31
Builder profile: mq-opus-medium
Critic rounds: 1, FAIL (min 5)

## Now
- Phase 1 done: `design/audit/VISUAL_QUALITY.md` (17 skills rendered, 9 root causes, census: 52 % of skills have no kit cell, 21 of 32 relation skills undrawn).
- Phase 2 built: VQ-1…VQ-10 guidance (WDS §18, RUBRIC H14–H17, PLAYBOOK, LESSONS L12–L15); `ws-visual-quality` on precritic's path, 10 backtests PASS; graphic library; `family-check` cell; word-work `sentence` layout for the 8 within-10/20 story skills.
- Critic r1 FAIL (`design/audit/runs/visual-quality/critic-r1.md`): H13 bands 31–40 %, Size S ignored on tests, 41 px phone target, story lesson overflow + keyword teaching, singular unit leak, duplicate triple, schema by position, bar ruling, L side-examples page.
- Fix round 2 (Opus medium) running, incl. the root cause of why precritic stayed green on F1/F3/F4.

## Owner go

## Open questions
- Lead ruling 2026-10-31 (F13), for the owner's batch look: the part-whole bar is drawn on teaching pages (model, guided, lesson) and is an option (default off) on practice pages, the No Pictures skills included.
- Precritic exceptions taken for round 1 (lead): sibling-compare (no approved sibling for a new template — this round creates it) and card-rulings / card-not-offered (no signed spec card: owner action). Should a spec card be drafted for the owner to sign for `family-check` and the `sentence` layout?

## Times
- Phase 1 (3 explorers in parallel): 10:36–11:05. VISUAL_QUALITY.md 11:08.
- Phase 2: checks + guidance 11:09–12:15; library + fixes 11:10–13:00 (6.7 h agent wall incl. browser waits); precritic clean-up fixer 13:05–15:00; critic r1 15:18–15:37.

## Spend
- $68.72 ≈ 2.5 % of the weekly limit at critic r1 start (cap $220 ≈ 8 %).
