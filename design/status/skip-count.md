Lane: skip-count
Title: Skip counting (count-row family): skip_count_grid, skip_count_line, count_by_tables
Session: https://claude.ai/code/session_01HVwpAE3g6EZH8idgErP6LP
Branch: skipcount-fix (worktree agent-a4cb82796fedaf1b4, from claude/sweet-newton-c8wrv1)
Owner of files: js/modules/sheet/cells/count-row.js, js/modules/sheet/providers/countby.js, the count-row part of js/modules/screen-cell.js and css/screen-cell.css, the skip-count LESSONS in js/modules/lessons/prereqs.js
State: fix
Updated: 2026-10-30
Builder profile: mq-opus-medium
Critic rounds: 5, FAIL (r5, 2026-10-30: lowest 3, the Lesson pages; 390 card 6)

## Now
- Fix round after critic r5 (design/audit/critic/2026-10-30/skip-count.md): SC1-SC6 fixed, plus the small-fixes r11 G1-G6 audit on today's count row.
- Next: precritic --strict on the branch merged with the main branch, then critic r6 (Lesson and the 390 card in full).

## Owner go

## Open questions
- The spec card for the count-row family is still not written (critic r5 process note); it needs the owner's signature.

## Times
Times: fix r5, start 2026-10-30T17:40Z, end —, profile mq-opus-medium

## Critic r5 - per-round findings (owner rule)

**Automatic checks**

| Finding | Class | Check that catches it now | Existed? |
|---|---|---|---|
| SC1 lesson count row overflows its cell, givens black on black, key 18 vs 17 slots | CLIP_OVERLAP / KEY | `ws-print-lint --source kit --roles lesson` at S, M and L (L-OVERFLOW, L-INK, L-KEY): 0 findings now (52 before) | yes, on precritic's path (print-lint-lesson-L / -S); the lane never ran it |
| SC1 four full-width panels ran the chart 40 mm past its page | SPACE | the same lint, and ws-layout-unit "chartStates caps the chart" | lint yes; unit new |
| SC2 390 card opens with no box in view, focus held back | SCREEN | `ws-phone-card` FOCUS / INVIEW (0 now, 18 before); `wave1-c2-phone` load assertions rewritten to the owner ruling (opens at the first box) | yes; phone-card now also on ws-deploy-gates.sh |
| SC2 two stacked lines read as one row in a 3-column window | SCREEN | `ws-phone-card` ROW-LINES: a swiping row stands on one line | new |
| SC2 root cause: a two-line row "fitted" a 251 px window (body width capped by its window) | SCREEN | ROW-LINES / INVIEW (the row now swipes, so they see it) | new |
| SC3 no lesson data | LESSON | `ws-node-lint --rules LESSON-DATA` (precritic node-lint-s1) | yes |
| SC3 warm-up deals "Drag the numbers" on paper (deal-dependent: print-lint L-VERBS saw it only on some seeds) | LESSON / VERB | `ws-node-lint` LESSON-DATA `screen-task`: 24 seeded deals of every Warm-up and Mixed ref, with its opts | new (backtested: FAILs with patterns:seq_10 as the warm-up, passes with the fix) |
| SC3 lesson practice cells 50 % empty | SPACE | `ws-print-lint --roles lesson` H13 / PAGEFILL at S and L | yes |
| SC4 246 CLIP-X findings from the swipe window's own content | GATE | ws-phone-card self-test fixtures `swipe`, `swipe-wide`, `swipe-hidden` | new |
| SC5 option help names unoffered steps | UNTRUE_TEXT | `ws-node-lint` OPTION-HELP | yes |
| SC6 "I Can count by 1 to 12" | TEXT | none (wording) | - |
| G2 arrow ink clearance | SIZE | ws-phone-card ROW-ARROW (tests/lib/ws-arrow-clear.cjs, ink by Range) | new |
| G3 next box below the fold | SCREEN | ws-phone-card NEXT-INVIEW at 390x844, 390x664, 360x780, 844x390 | new |
| G4 turned phone keeps the old layout | SCREEN | ws-phone-card ROTATE | new |

**Speed-ups**
1. The round was lost on a role (Lesson) the lane had never rendered: run `ws-print-lint --roles lesson` at S and L in every fix loop (it takes about 2 minutes for three skills).
2. `wave1-c2-phone` (the family's own phone test) is not on precritic's path; ws-phone-card now carries its essentials (one line, open at the first box, wide-number cases, 360 / landscape, turn), so precritic sees them.
3. Debugging the phone layout cost the most time: a small probe that dumps a swipe row's lines, column starts and scroll writes (scratchpad phonedbg / wsdbg) found three root causes in minutes; worth a `--debug` flag on ws-phone-card.

## Small-fixes critic r11 G1-G6 on today's count row (lead, 2026-10-30)
The sleepy-pasteur small-fixes work is not re-landed (today's wireSwipeRows replaced it); each item was re-checked on today's row:
- G1 (1,000,000 row one a line at 360): today the row SWIPES on one line (one row high) at 360 and 390. Check: ws-phone-card ROW-LINES with the wide-number cases at 360x780 / 390x844.
- G2 (arrow ink < 1.0 mm): screen was 0.98 mm on the phone worksheet; fixed (arrows 1.5 px in from each gap end): >= 1.25 mm on card and worksheet at 1280-360; paper >= 1.0 mm (S 2.3, L 1.0). Checks: tests/lib/ws-arrow-clear.cjs in ws-phone-card ROW-ARROW and ws-print-lint L-OVERLAP ARROW (self-tested).
- G3 (next box below the fold at 360 / landscape): passes; check ws-phone-card NEXT-INVIEW at 360x780 and 844x390.
- G4 (layout fixed at first render): passes (wireSwipeRows re-lays out on resize); check ws-phone-card ROTATE (390x844 <-> 844x390 vs a fresh load).
- G5 (gates): wave1-c2-phone's wide-row box floor back to SP-10's 48 px tall (measured 53). Left bands: the row rests on column starts, nothing cut at the left edge (wave1-c2-phone TABCHK). Phone mixed sheet: still not gated (open).
- G6 (docs): the wrap amendment never landed here; TY-10b now records the owner ruling (3) and the one-line swipe.

## Log
- 2026-10-30: fix round after critic r5 (SC1-SC6), and the small-fixes r11 G1-G6 audit on today's count row.
