#!/usr/bin/env bash
# Self-test stub for ws-coverage-matrix (ws-deploy-gates.sh --self-test): `matrix-stub.sh <exit> <matrix args...>`.
# 0 = the affected rows ran within the budget and were OK, 1 = a red row, 3 = OVER-BUDGET (the contract of
# ws-coverage-matrix --max-docs).
rc=$1; shift
echo "matrix-stub: args $*"
case "$rc" in
  0) echo 'ws-coverage-matrix: OK (12 row(s), 12 run, 1 s)' ;;
  1) echo 'addition:add_100_regroup|single/defaults RED L-DENSITY +1'; echo 'ws-coverage-matrix: FAIL - 1 red row(s)' ;;
  3) echo 'ws-coverage-matrix: OVER-BUDGET 32766 documents (budget 500)' ;;
esac
exit "$rc"
