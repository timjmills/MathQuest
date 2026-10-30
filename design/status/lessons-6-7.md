Lane: lessons-6-7
Title: Detailed lessons 6 (g4-nbt1-ten-times-value) and 7 (g3-oa8-two-step-wp), work order item 2
Session: session_013pHDnLgZ4iWmoXfjQ2jNTN
Branch: claude/sweet-newton-c8wrv1-lessons-6-7
Owner of files: js/modules/lessons/detailed/g4-nbt1-ten-times-value.js, g3-oa8-two-step-wp.js; cells/pv-times.js; word-work frames layout; design/lesson-planner/lessons/{g4-nbt1-ten-times-value,g3-oa8-two-step-wp}/
State: building
Updated: 2026-10-30
Builder profile: mq-opus-medium (lesson 6, failed r1 + r2), mq-opus-low (lesson 7)
Critic rounds: lesson 6: 2 (r2 FAIL, C2 7); lesson 7: 0

## Now
- Two builders in parallel worktrees: lesson 6 fix round 4 (r2 D2 still open, gate E9b/E11/E29), lesson 7 build-to-gate (E9/E9b/E20/E29, round-2 options unfinished).
- Next: merge both, merge with claude/sweet-newton-c8wrv1, clean-before-critic, ONE critic (mq-opus-medium) for both lessons.

- Lead 2026-10-30 18:47Z: when EACH lesson passes, save its page PNGs (+ the teacher screen that opens it) under
  design/status/lessons-6-7/, push, send_message the lead at once (PNG paths + head); each lesson goes live on its own.

## Owner go

## Open questions
- The owner's 2026-10-17 "Skill coverage rule" pointer (commit c922be81) is not in today's CLAUDE.md (kept today's version per the
  work order); the rule itself is in design/lesson-planner/DETAILED_MAKER.md "Skill coverage rule". Lead: re-add the pointer to CLAUDE.md?
- Lessons 1-5 (passed 2026-10-16/17) FAIL ws-detailed-lesson --check on today's main (E11 cell fill, mostly P0; lesson 1 also E9 P6).
  Main has drifted since they passed; the lesson-6 builder is looking for the shared cause.

## Times
Times: builder lesson-7 build-r2, start 2026-10-30T17:45Z, end 2026-10-30T18:50Z, profile mq-opus-low
Times: builder lesson-6 fix-r4, start 2026-10-30T17:45Z, end —, profile mq-opus-medium

## Log
- 2026-10-30: Lane started. Cherry-picked from wip-detailed-lessons-2: research 9051b4f8 1f5ec74a; lesson 6 c2a6d8b4, critic r1 712592e2,
  coverage audit 2905f912, fix r2 f0990693, critic r2 e825ec7b, fix r3 88f7d2d0 (c922be81 = CLAUDE.md only, kept today's). Brought the
  paused helper's patches (design/lesson-planner/wip-2026-10-17/), applied lesson7-round1-b533d103.patch (git am, 3 conflicts:
  DETAILED_MAKER notes and codec keys 4H/4I vs 4P/4Q, both kept) and lesson7-round2.uncommitted.patch (partial; _dbg7.cjs dropped).
  Visual redesign spec / graphic library not on claude/sweet-newton-c8wrv1 yet: built to today's standards.
  Gate state at start: lesson 6 E9b, E11, E29 FAIL; lesson 7 E9, E9b, E20, E29 FAIL; repeats OK for both; precritic --role lesson:
  placevalue:more_less_10 L-OVERLAP CL40-INK 0 -> 2, Size S row timed out at the 580 s wall.
