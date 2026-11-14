cd /home/user/MathQuest
node tests/scripts/ws-guided-echo.cjs --skills composing:chart_to_120,composing:hundreds_chart_fill --seeds 4 --variants > design/audit/runs/lf-builds/chart120/logs/blanks/guided-echo2.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/guided-echo2.log
node tests/scripts/ws-backtest.mjs --row c120r3-overlap-giveaway,c120-blank-count,c120r3-screen-giveaway,c120r3-model-state-marks,c120r3-say-frame --browser-timeout 1500 > design/audit/runs/lf-builds/chart120/logs/blanks/backtest2.log 2>&1; grep -E "^ws-backtest" design/audit/runs/lf-builds/chart120/logs/blanks/backtest2.log
node tests/scripts/ws-lesson-baseline.cjs --all-lessons --check design/audit/runs/lf-builds/chart120/logs/blanks/master-lesson-baseline.json > design/audit/runs/lf-builds/chart120/logs/blanks/lesson-baseline-check2.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/lesson-baseline-check2.log
echo ALLDONE
