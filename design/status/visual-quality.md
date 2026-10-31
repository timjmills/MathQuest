Lane: visual-quality
Title: Visual quality investigation, VQ bar + checks, graphic library, owner examples fixed
Session: session_013pHDnNX8LHcZZypxg14fSs
Branch: claude/sweet-newton-c8wrv1-visual-quality (draft PR #27)
Owner of files: design/audit/VISUAL_QUALITY.md, design/audit/runs/visual-quality/, design/GRAPHIC_LIBRARY.md, js/modules/sheet/graphics/, js/modules/sheet/cells/family-check.js, word-work sentence layout, tests/scripts/ws-visual-quality.mjs, tests/fixtures/precritic/vq-*
State: critic r2 pending
Updated: 2026-10-31
Builder profile: mq-opus-medium
Critic rounds: 2, FAIL (r2 min 4: option-on lesson overflow); fix r2 ready for critic r2

## Now
- Phase 1 done: `design/audit/VISUAL_QUALITY.md` (17 skills rendered, 9 root causes, census: 52 % of skills have no kit cell, 21 of 32 relation skills undrawn).
- Phase 2 built: VQ-1…VQ-10 guidance (WDS §18, RUBRIC H14–H17, PLAYBOOK, LESSONS L12–L15); `ws-visual-quality` on precritic's path, 10 backtests PASS; graphic library; `family-check` cell; word-work `sentence` layout for the 8 within-10/20 story skills.
- Critic r1 FAIL (`design/audit/runs/visual-quality/critic-r1.md`): H13 bands 31–40 %, Size S ignored on tests, 41 px phone target, story lesson overflow + keyword teaching, singular unit leak, duplicate triple, schema by position, bar ruling, L side-examples page.
- Fix round 2 done (bfb7032): every blocking finding fixed (F1-F6, F8, F9, F12, F13, F21) plus F7, F10, F11, F14, F15.
- Root cause of the precritic miss (critic r1 F1 / F3 / F4): (1) ws-print-lint's H13 exempts the band under a top-aligned
  cell as "writing room" and reads it inside the pads, so a cell answered in place (no writing room) at 28-37 % never
  failed; (2) ws-grade-render MEASURED the lesson overflow (content in the pad) and the 41 px card input, but nothing
  turned its measurement into a verdict and precritic --skill never ran it. Fixed: H13 counts the band of an in-place
  cell to its drawn edge; `ws-grade-render --gate` (overflow on any role page, card-390 / 820 targets < 44 px) runs on
  every --skill scope (lesson, test, independent at S / M / L). Backtests vq-r2-render-gate, vq-r2-inplace-h13: PASS.
- Items a page (independent / test) S / M / L: stories within 20: 11 / 8 / 8 and 10 / 8 / 8; fact_family_sort 12 / 9 / 6;
  add_wp_10 (K pictures) 7 / 6 / 4-5. Largest in-cell band on the pass-bar pages 25 % (critic's pixel scan).
- Precritic --strict (4 skills): all green but sibling-compare (no approved sibling for the new templates) and
  card-rulings / card-not-offered (no signed spec card: owner action).

## Owner go

## Owner design list
- 2026-10-31 (owner, via lead): "on these for extra help option have it show blank number family chart so students can fill it in to answer." → `familyChart: off | on` on family-check (default off): a blank 4-sentence family chart under the triangle, ungraded working boxes on paper and screen, key fills it for true families. Queued (rule 0); built after fix round 2, before critic r2. Also: draft the spec card (family-check + sentence + familyChart) for the owner to sign.
  BUILT 2026-10-31 (Opus medium, new drawing): option `familyChart` (bool, default off, support group, share key 4K, codec pin added) on `addition:fact_family_sort`; library entry `familyChart` (`js/modules/sheet/graphics/family-chart.js`, GRAPHIC_LIBRARY.md); `family-check` draws it UNDER the triangle at S (two across, 4 a page) and BESIDE it at M / L (one wide cell a row, 3 a page; under, M / L held 2 a page with a 24-36 % band). Boxes 0.75 pt, `data-ws-graded="0"`; screen `input.mq-wwork` without `data-mq-expect` (typeable, never graded or marked). Key fills the chart for a true family only. After shots: `after/fact_family_sort-familychart-{print-L,card-390,key-L}.png`.
  Spec card drafted (UNSIGNED, owner to sign): `design/cards/family-check/family-check.md` (card.json beside it): family-check + the word-work sentence layout + familyChart, the lead's interim rulings recorded, every option / role / host line decided (81 PROPOSED), `--check-coverage` OK; `--check-signed` lacks only the signature.

## Open questions
- Lead ruling 2026-10-31 (F13), for the owner's batch look: the part-whole bar is drawn on teaching pages (model, guided, lesson) and is an option (default off) on practice pages, the No Pictures skills included.
- Precritic exceptions taken for round 1 (lead): sibling-compare (no approved sibling for a new template — this round creates it) and card-rulings / card-not-offered (no signed spec card: owner action). Should a spec card be drafted for the owner to sign for `family-check` and the `sentence` layout?

## Times
- familyChart option + spec card (Opus medium): 17:58-18:40.
- Fix round 2 (Opus medium): 15:40-18:10 (renders 3 x 5 min a size, two precritic runs of ~30 min).
- Phase 1 (3 explorers in parallel): 10:36–11:05. VISUAL_QUALITY.md 11:08.
- Phase 2: checks + guidance 11:09–12:15; library + fixes 11:10–13:00 (6.7 h agent wall incl. browser waits); precritic clean-up fixer 13:05–15:00; critic r1 15:18–15:37.

## Spend
- $149.33 ≈ 5.3 % after critic r2; lead hard cap: $60 more from 18:57 (one fix round + one final critic).
- $134.33 ≈ 4.8 % after fix r2.
- $68.72 ≈ 2.5 % of the weekly limit at critic r1 start (cap $220 ≈ 8 %).
