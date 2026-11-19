#!/bin/bash
# chart blanks r2 gates (fix builder): one browser gate at a time, each log committed as it finishes; a step whose log ends with
# its verdict line is skipped on a re-run (the container restarts).
cd /home/user/MathQuest
D=design/audit/runs/lf-builds/chart120/logs/blanks
S="composing:chart_to_120,composing:hundreds_chart_fill"
M=/tmp/claude-0/-home-user-MathQuest/a28793f0-3a8c-5932-9bc9-4eb414e6d9a8/scratchpad/master-wt
done_ok() { [ -f "$1" ] && tail -3 "$1" | grep -qE '(: OK|: FAIL|OK \(|FAIL -|PASS|ws-backtest: )'; }
commit_log() { git add "$@" >/dev/null 2>&1; git commit -q -m "chart blanks r2 gate log: $(basename "$1")

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013pHDnMSgfoUzyk67mk3yjW" >/dev/null 2>&1; for i in 1 2 3 4; do git push -q origin claude/sweet-newton-c8wrv1-lf-builds >/dev/null 2>&1 && break; sleep 5; done; }
step() { local log="$D/$1"; shift; if done_ok "$log"; then echo "skip $log"; return; fi; "$@" > "$log" 2>&1; echo "$(basename "$log"): $(tail -1 "$log")"; commit_log "$log"; }
step r2-boot-smoke.log node tests/scripts/ws-boot-smoke.cjs
step r2-code-snapshot.log node tests/scripts/ws-code-snapshot.mjs
step r2-content-120.log node tests/scripts/ws-content-audit.cjs --skill chart_to_120
step r2-content-hcf.log node tests/scripts/ws-content-audit.cjs --skill hundreds_chart_fill
step r2-providers-120.log node tests/scripts/ws-providers-unit.mjs --skill chart_to_120
step r2-providers-hcf.log node tests/scripts/ws-providers-unit.mjs --skill hundreds_chart_fill
step r2-optverify-120.log node tests/scripts/ws-options-verify.cjs --skill chart_to_120
step r2-optverify-hcf.log node tests/scripts/ws-options-verify.cjs --skill hundreds_chart_fill
step r2-guided-echo.log node tests/scripts/ws-guided-echo.cjs --skills $S --seeds 4 --variants
step r2-guided-echo-lesson6.log node tests/scripts/ws-guided-echo.cjs --skills $S --seed-list 1,2,3,4,4242,777 --score-roles lesson --only CROSS-GIVEAWAY,LESSON-EMPTY-PAGE,BLANK-COUNT,SCORE-SLOTS
ROWS=$(node -e "const d=require('./tests/fixtures/precritic/backtests.json');console.log(d.rows.filter(r=>/^c120/.test(r.id)).map(r=>r.id).join(','))")
step r2-backtest-c120.log node tests/scripts/ws-backtest.mjs --row "$ROWS" --browser-timeout 1500 --no-plan
step r2-precritic-plan.log node tests/scripts/ws-precritic-plan.mjs
step r2-pc-c120.log node tests/scripts/ws-precritic.cjs --skill composing:chart_to_120 --strict
step r2-pc-hcf.log node tests/scripts/ws-precritic.cjs --skill composing:hundreds_chart_fill --strict
if ! done_ok "$D/r2-lesson-baseline-write.log"; then
  git fetch -q origin master; [ -d "$M" ] || git worktree add -f --detach "$M" origin/master -q
  git -C "$M" checkout -q --detach origin/master
  git rev-parse --short=9 origin/master > "$D/r2-lesson-baseline-master.txt"
  MQ_ROOT=$M node tests/scripts/ws-lesson-baseline.cjs --all-lessons --write "$D/r2-master-lesson-baseline.json" > "$D/r2-lesson-baseline-write.log" 2>&1
  echo "write: $(tail -1 $D/r2-lesson-baseline-write.log)"; commit_log "$D/r2-lesson-baseline-write.log" "$D/r2-master-lesson-baseline.json" "$D/r2-lesson-baseline-master.txt"
fi
step r2-lesson-baseline-check.log node tests/scripts/ws-lesson-baseline.cjs --all-lessons --check "$D/r2-master-lesson-baseline.json"
echo ALLDONE
