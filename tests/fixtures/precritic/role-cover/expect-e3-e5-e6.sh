#!/usr/bin/env bash
# Backtest helper (row role-cover-cbt-e3-e5-e6): runs the ws-role-cover command it is given, prints its output, and
# re-states the verdict: a FAIL counts as the cbt r2 state only when all three critic findings are in it -
# E3 scripted-model@L L-OVERLAP SECTION, E5 opener L-OVERLAP CL40-INK, E6 error-analysis L-TOPSTART CL-4b.
# Any other FAIL is printed as OK, so the row's fail state cannot pass on an unrelated red. An OK passes through.
out=$(mktemp)
"$@" > "$out" 2>&1
cat "$out"
last=$(grep '^ws-role-cover: ' "$out" | tail -1)
case "$last" in
  *FAIL*)
    if grep -q 'scripted-model@L: L-OVERLAP SECTION' "$out" && grep -q 'opener@[ML]: L-OVERLAP CL40-INK' "$out" && grep -q 'error-analysis@[ML]: L-TOPSTART CL-4b' "$out"; then
      echo 'ws-role-cover: FAIL (E3 / E5 / E6 visible)'
    else
      echo 'ws-role-cover: OK (a FAIL without all of E3, E5 and E6 is not the cbt r2 state)'
    fi ;;
  *) echo "${last:-ws-role-cover: FAIL (no verdict line)}" ;;
esac
rm -f "$out"
