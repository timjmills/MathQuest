Lane: wave0-b
Title: Wave 0 — process (S3, S6, S7, S8, E5)
Session: session_012ezCBagXXDUEGLRrqYHnqz
Branch: claude/sweet-newton-c8wrv1-wip-wave0-process
Owner of files: design/status/, design/cards/, design/lanes/, tests/scripts/ws-status-index.mjs, ws-spec-card.mjs, ws-integrate.mjs; S7 rule text in CLAUDE.md, LESSONS_LEARNED.md, RUBRIC.md
State: passed
Updated: 2026-10-23
Builder profile: mq-opus-medium
Critic rounds: 2, PASS

## Now
- Critic r2 PASS 8 / 8 / 8 (`design/audit/runs/wave0-b/critic-r2.md`); S3, S6, S7, S8, E5 built; ready for the lead to merge.
- Open minor (r2): D1 card ids without excerpts, D2 TY-10a/SL-3a under "also applies", D3 ~20 tagging rows still UNTRUE_TEXT, D4 grade-run class differs by host; D5 fixed (README EE id).
- Waits on a week of lanes: S6 (`ws-status-index --conflicts --since 2026-10-23`) and E5 (six lanes, no shared-file conflict).

## Owner go

## Open questions
- none

## Times
<!-- start = end minus the agent's measured run time; end = the agent's hand-back (≈ the lane's commit of its work). UTC. -->
Times: critic r2, start 2026-10-23T10:55Z, end 2026-10-23T11:03Z, profile mq-opus-medium
Times: fix r1 tools (D5-D8), start 2026-10-23T10:43Z, end 2026-10-23T10:54Z, profile mq-opus-medium
Times: fix r1 tally (D1-D4), start 2026-10-23T10:43Z, end 2026-10-23T10:54Z, profile mq-opus-medium
Times: critic r1, start 2026-10-23T10:33Z, end 2026-10-23T10:42Z, profile mq-opus-medium
Times: builder S8 metrics.md, start 2026-10-23T10:27Z, end 2026-10-23T10:33Z, profile mq-opus-low
Times: builder E5 integrator, start 2026-10-23T10:08Z, end 2026-10-23T10:28Z, profile mq-opus-medium
Times: builder S3 spec cards, start 2026-10-23T10:08Z, end 2026-10-23T10:22Z, profile mq-opus-medium
Times: builder S6 status index, start 2026-10-23T10:08Z, end 2026-10-23T10:14Z, profile mq-opus-medium
Times: builder S8 tally readers G1-G7 (7 agents), start 2026-10-23T10:07Z, end 2026-10-23T10:23Z, profile mq-opus-low
Times: builder S7 process rules, start 2026-10-23T10:09Z, end 2026-10-23T10:10Z, profile mq-opus-low

## Log
- 2026-10-23: critic r2 PASS 8/8/8; lead requests done (Times lines, median + mean rounds to PASS); r2 D5 fixed.
- 2026-10-23: critic r1 FAIL (7 / 7 / 8); fix round 1 at mq-opus-medium (tally fixer, tools fixer).
- 2026-10-23: S3, S7, S8 and E5 built and committed (S3/E5 by mq-opus-medium first builds; S7 and tally readers by mq-opus-low).
- 2026-10-23: S6 built by mq-opus-medium (first build of a new tool, Q-S7). Conflict baseline over the last 30 days recorded in the builder report.
- 2026-10-23: lane started (IMPROVEMENT_PLAN v20.4, §4.1 row 1).
