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
