#!/usr/bin/env bash
# Two-slot browser runner (owner rule: at most two browser-using processes in a container).
#   tests/scripts/mq-browser-run.sh node tests/scripts/ws-boot-smoke.cjs
# Waits for a free slot (flock on /tmp/mq-browser-slot.{1,2}.lock), exports MQ_BROWSER_SLOT=1|2 and runs the
# command while holding it; the slot frees when the command exits (even on a crash: flock dies with the fd).
# ws-precritic copies this file to /tmp/mq-browser-run.sh when that path is missing (fresh containers).
# MQ_BROWSER_SLOTS overrides the slot count (default 2); MQ_BROWSER_WAIT_LOG=1 prints the wait on stderr.
set -u
[ $# -ge 1 ] || { echo "usage: mq-browser-run.sh <command> [args...]" >&2; exit 2; }
SLOTS=${MQ_BROWSER_SLOTS:-2}
waited=0
while :; do
  for s in $(seq 1 "$SLOTS"); do
    lock=/tmp/mq-browser-slot.$s.lock
    exec {fd}>>"$lock"
    if flock -n "$fd"; then
      [ "${MQ_BROWSER_WAIT_LOG:-0}" = 1 ] && [ $waited -gt 0 ] && echo "mq-browser-run: slot $s after ${waited}s" >&2
      export MQ_BROWSER_SLOT=$s
      "$@"
      rc=$?
      exec {fd}>&-
      exit $rc
    fi
    exec {fd}>&-
  done
  sleep 1; waited=$((waited + 1))
done
