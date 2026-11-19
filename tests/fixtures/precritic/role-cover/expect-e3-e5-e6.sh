#!/usr/bin/env bash
# Backtest helper (row role-cover-cbt-e3-e5-e6): runs the ws-role-cover command it is given, prints its output, and
# re-states the verdict.
#   --expect-e3e5e6 (the FAIL side only): a FAIL counts as the cbt r2 state only when all three critic findings are in
#     it - E3 scripted-model@L L-OVERLAP SECTION, E5 opener L-OVERLAP CL40-INK, E6 error-analysis L-TOPSTART CL-4b - so
#     the fail state cannot pass on an unrelated red.
#   without it (the PASS side; critic roles r1 D2): OK only when the run itself is OK AND none of E3 / E5 / E6 is in it;
#     any FAIL, or a finding of the three, is FAIL - so the pass state can fail.
expect=0; args=()
for a in "$@"; do if [ "$a" = "--expect-e3e5e6" ]; then expect=1; else args+=("$a"); fi; done
out=$(mktemp)
"${args[@]}" > "$out" 2>&1
cat "$out"
last=$(grep '^ws-role-cover: ' "$out" | tail -1)
e3=$(grep -c 'scripted-model@L: L-OVERLAP SECTION' "$out"); e5=$(grep -c 'opener@[ML]: L-OVERLAP CL40-INK' "$out"); e6=$(grep -c 'error-analysis@[ML]: L-TOPSTART CL-4b' "$out")
if [ "$expect" = 1 ]; then
  case "$last" in
    *FAIL*)
      if [ "$e3" -gt 0 ] && [ "$e5" -gt 0 ] && [ "$e6" -gt 0 ]; then echo 'ws-role-cover: FAIL (E3 / E5 / E6 visible)'
      else echo 'ws-role-cover: OK (a FAIL without all of E3, E5 and E6 is not the cbt r2 state)'; fi ;;
    *) echo "${last:-ws-role-cover: FAIL (no verdict line)}" ;;
  esac
else
  case "$last" in
    *': OK'*) if [ $((e3 + e5 + e6)) -gt 0 ]; then echo "ws-role-cover: FAIL (OK verdict but E3/E5/E6 in the output: $e3/$e5/$e6)"; else echo "$last"; fi ;;
    *) echo "${last:-ws-role-cover: FAIL (no verdict line)}" ;;
  esac
fi
rm -f "$out"
