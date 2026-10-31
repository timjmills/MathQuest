# Lane: shared-roles (shared page-role defects)

Lead: session_01HVwpAE3g6EZH8idgErP6LP. Branch `claude/sweet-newton-c8wrv1-shared-roles` off `claude/sweet-newton-c8wrv1` @ 5c6063a.
Owner decision 2026-10-31: these defects get their own lane and do not gate the facts family. Cap $200 (≈ 7 % of the weekly limit).

Source: `design/status/shared-roles/source-critic-r1.md` (copy of laneD-restart critic r1), status item 5.

## Split (builders, Opus medium: first build of a fix in shared engine code)

| Builder | Defects | Files owned |
|---|---|---|
| A | R1-3 Scripted model, R1-5 lesson Steps vs items, R1-13 guided empty band, R1-14 Opener "Use the dots" | roles/scripted-model.js, lesson.js, detailed-lesson.js, guided.js, opener.js |
| B | R1-8 Pre-skill check (R1-7 moved to the mixed pages M2 lane, 2026-10-31) | roles/pre-skill-check.js |
| C | R1-9 Reason It CL40, R1-10 Review M H13, R1-11 div Review L strip, R1-12 across CL40 | roles/reason-it.js, review.js, css/sheet-kit.css (additive) |

## Progress

- 2026-10-31: lane started; builders A, B, C launched in worktrees.
- 2026-10-31 11:08: lead moved R1-7 to the new mixed pages M2 lane, which owns roles/mixed-practice.js, sheet/interleave.js, sheet/layout.js, sheet/paginate.js; all three builders told not to edit them.
- Builder C reported (branch shared-roles-C, commits 3945be3, 8f12d05):
  - **CL40-INK cleared:**
    - Reason It: S 12 → 0, M 24 → 0, L 16 → 0 (R1-9).
    - div_facts Review at L: 6 → 0 (R1-11).
    - notation=across on Independent, Test and Mixed: L 110 → 0, S 56 → 0 (R1-12, fixed at cell level in `cells/fact.js`).
  - **R1-11 variety:** the earlier-skill fallback now reads a preset as its host skill, so div_facts' Mixed Review counts by 2, 3, 4 and 5 instead of four count-by-12 strips.
  - **R1-10:** not reproduced on this branch.
  - **Redesign-passed:** the 7 skills are byte-identical across 105 renders, except the Reason It CSS inset, which is the fix.
  - **Backtests:** 4 of 4 OK.
  - **Precritic additions:** reason-it and review pages per skill, and notation=across, now on the path.
  - **Still red, outside this lane:**
    - add_facts Review AK-4 (legacy `add_sub_10s` key);
    - legacy fraction cells on reason-it and review;
    - across S capacity 16 against 20 (VA-71 clamp);
    - dealer-uniform, node-lint-s1, slot-clip and options-render on generators / options.
- Builder B round 1 (shared-roles-B, commits 01ec9c2, 7796348):
  - **R1-8 fixed:** the pre-skill check now draws from prerequisites (lesson prereqs, then the WRM `pre` lists, then earlier skills), never the page's own skill. 4 groups on 1 page, about 90 % filled.
  - **Precritic:** role-level and prerequisite-cell reds remain; sent back for round 2.
