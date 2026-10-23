# Wave 0 part A — checks and deploy gates (lane status)

Lane lead: session_016Gxj2ZzYbcQ9N3c7cKK3cq · branch `claude/sweet-newton-c8wrv1-wip-wave0-gates` · started 2026-10-23
Scope: `design/IMPROVEMENT_PLAN.md` §1.4 S1, S2, S4, S5, S9 and the E1 tools buildable before M4 (§1.6.7).

## Environment (fresh container)
- `tests/scripts/mq-browser-run.sh` is the two-slot browser runner; `ws-precritic` copies it to `/tmp/mq-browser-run.sh`
  when that path is missing. Slots are `flock` locks `/tmp/mq-browser-slot.{1,2}.lock`.
- Chromium trusts the proxy CA (STATUS §8); the legacy print path needs `pip install pymupdf`.

## Progress
