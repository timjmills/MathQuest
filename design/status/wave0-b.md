Lane: wave0-b
Title: Wave 0 — process (S3, S6, S7, S8, E5)
Session: session_012ezCBagXXDUEGLRrqYHnqz
Branch: claude/sweet-newton-c8wrv1-wip-wave0-process
Owner of files: design/status/, design/cards/, design/lanes/, tests/scripts/ws-status-index.mjs, ws-spec-card.mjs, ws-integrate.mjs; S7 rule text in CLAUDE.md, LESSONS_LEARNED.md, RUBRIC.md
State: fix
Updated: 2026-10-23
Builder profile: mq-opus-medium
Critic rounds: 1, FAIL

## Now
- Built and committed: S3 (`ws-spec-card`, rule index, unsigned stack card), S6 (lane files, `ws-status-index`), S7 (process rules), S8 (tally of 7,878 findings, `metrics.md`), E5 (`ws-integrate`, manifests, dry run of 150 skills).
- Critic r1 FAIL 7/7/8 (`design/audit/runs/wave0-b/critic-r1.md`): D1 grade-run rule_ids carry version caps; D5 `--check-signed` reads only the last line; D2–D4, D6–D9 minor.
- Fix round 1 running (two fixers, mq-opus-medium, rebuild after a failed round); then critic r2.
- Waits on a week of lanes: S6 (`--conflicts --since <date>`) and E5 (six lanes, no shared-file conflict).

## Owner go

## Open questions
- none

## Log
- 2026-10-23: critic r1 FAIL (7 / 7 / 8); fix round 1 at mq-opus-medium (tally fixer, tools fixer).
- 2026-10-23: S3, S7, S8 and E5 built and committed (S3/E5 by mq-opus-medium first builds; S7 and tally readers by mq-opus-low).
- 2026-10-23: S6 built by mq-opus-medium (first build of a new tool, Q-S7). Conflict baseline over the last 30 days recorded in the builder report.
- 2026-10-23: lane started (IMPROVEMENT_PLAN v20.4, §4.1 row 1).
