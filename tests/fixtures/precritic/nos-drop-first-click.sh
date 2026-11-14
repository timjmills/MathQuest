#!/usr/bin/env bash
# Backtest fixture (lead 2026-11-13, lf-builds chart_to_120: the worksheet "M" click built at L once, then passed on the same
# tree): plant a worksheet sheet whose FIRST size click is lost (as a click on a control still being redrawn is), in a copy of
# the served tree of <root>, and run <root>'s ws-no-size-s --browser on it. A tool that fails on one lost click FAILs; the
# de-flaked tool waits for the build to settle, re-clicks once and passes (a control that never works still fails).
set -u
root="$1"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
for n in "$root"/*; do b=$(basename "$n"); case "$b" in .git|node_modules|design|tests) ;; *) cp -r "$n" "$tmp/$b" ;; esac; done
f="$tmp/js/modules/teacher-sheet.js"
grep -q "case 'size': S.opts.size = v; changed(); return;" "$f" || { echo "nos-drop-first-click: FAIL (anchor not found)"; exit 1; }
sed -i "s|case 'size': S.opts.size = v; changed(); return;|case 'size': if (!window.__nosDrop) { window.__nosDrop = 1; return; } S.opts.size = v; changed(); return;|" "$f"
node "$root/tests/scripts/ws-no-size-s.mjs" --browser --root "$tmp" 2>&1 | grep -E '^ws-no-size-s --browser: (OK|FAIL)' | tail -1
