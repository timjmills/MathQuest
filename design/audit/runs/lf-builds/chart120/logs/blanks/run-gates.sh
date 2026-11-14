cd /home/user/MathQuest
S="composing:chart_to_120,composing:hundreds_chart_fill"
node tests/scripts/ws-boot-smoke.cjs > design/audit/runs/lf-builds/chart120/logs/blanks/boot-smoke.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/boot-smoke.log
node tests/scripts/ws-content-audit.cjs --skill composing:chart_to_120 > design/audit/runs/lf-builds/chart120/logs/blanks/content-120.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/content-120.log
node tests/scripts/ws-content-audit.cjs --skill composing:hundreds_chart_fill > design/audit/runs/lf-builds/chart120/logs/blanks/content-hcf.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/content-hcf.log
node tests/scripts/ws-providers-unit.mjs --skill composing:chart_to_120 > design/audit/runs/lf-builds/chart120/logs/blanks/providers-120.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/providers-120.log
node tests/scripts/ws-providers-unit.mjs --skill composing:hundreds_chart_fill > design/audit/runs/lf-builds/chart120/logs/blanks/providers-hcf.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/providers-hcf.log
node tests/scripts/ws-options-verify.cjs --skill composing:chart_to_120 > design/audit/runs/lf-builds/chart120/logs/blanks/optverify-120.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/optverify-120.log
node tests/scripts/ws-options-verify.cjs --skill composing:hundreds_chart_fill > design/audit/runs/lf-builds/chart120/logs/blanks/optverify-hcf.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/optverify-hcf.log
node tests/scripts/ws-guided-echo.cjs --skills $S --seeds 4 --variants > design/audit/runs/lf-builds/chart120/logs/blanks/guided-echo.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/guided-echo.log
MQ_ROOT=/tmp/claude-0/-home-user-MathQuest/a28793f0-3a8c-5932-9bc9-4eb414e6d9a8/scratchpad/m448 node tests/scripts/ws-lesson-baseline.cjs --all-lessons --write design/audit/runs/lf-builds/chart120/logs/blanks/master-lesson-baseline.json > design/audit/runs/lf-builds/chart120/logs/blanks/lesson-baseline-write.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/lesson-baseline-write.log
node tests/scripts/ws-lesson-baseline.cjs --all-lessons --check design/audit/runs/lf-builds/chart120/logs/blanks/master-lesson-baseline.json > design/audit/runs/lf-builds/chart120/logs/blanks/lesson-baseline-check.log 2>&1; tail -1 design/audit/runs/lf-builds/chart120/logs/blanks/lesson-baseline-check.log
echo ALLDONE
