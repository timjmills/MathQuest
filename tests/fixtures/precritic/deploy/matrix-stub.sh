#!/usr/bin/env bash
# Self-test stub for ws-coverage-matrix (ws-deploy-gates.sh --self-test): `matrix-stub.sh <exit> <matrix args...>`.
# 0 = the affected rows ran within the budget and were OK, 1 = a red row, 2 = nothing checkable, 3 = OVER-BUDGET (the
# contract of ws-coverage-matrix --max-docs).
# With `--out <file>` it writes a run file there, as the real matrix does: exit 1 lists
# addition:add_100_regroup|single/defaults RED; exit 0 lists the ids in MQ_STUB_OK_ROWS (comma-separated) OK.
# With `--rows <ids>` (the gate's flake re-run of the red rows only, N7) it exits MQ_STUB_RETRY_RC when that is set.
rc=$1; shift
echo "matrix-stub: args $*"
out=""; rows=""
while [ $# -gt 0 ]; do
  case "$1" in --out) out=$2; shift ;; --rows) rows=$2; shift ;; esac
  shift
done
[ -n "$rows" ] && [ -n "${MQ_STUB_RETRY_RC:-}" ] && rc=$MQ_STUB_RETRY_RC
case "$rc" in
  0) echo 'ws-coverage-matrix: OK (12 row(s), 12 run, 1 s)' ;;
  1) echo 'addition:add_100_regroup|single/defaults RED L-DENSITY +1'; echo 'ws-coverage-matrix: FAIL - 1 red row(s)' ;;
  2) echo 'ws-coverage-matrix: INCOMPLETE - rows selected, none checkable (all PENDING / N/A)' ;;
  3) echo 'ws-coverage-matrix: OVER-BUDGET 32766 documents (budget 500)' ;;
esac
if [ -n "$out" ] && [ "$rc" != 3 ]; then
  node -e '
    const [out, rc, ok] = process.argv.slice(1);
    const red = rc === "1" ? ["addition:add_100_regroup|single/defaults"] : [];
    const rows = red.map((id) => ({ id, status: "RED", rises: ["S L-DENSITY DN-1: 0 -> 1"] }))
      .concat((rc === "0" ? (ok || "").split(",").filter(Boolean) : []).map((id) => ({ id, status: "OK" })));
    require("fs").writeFileSync(out, JSON.stringify({ tool: "matrix-stub", commit: "HEAD", dirty: false, finished: new Date().toISOString(), rows, red }));
  ' "$out" "$rc" "${MQ_STUB_OK_ROWS:-}"
fi
exit "$rc"
