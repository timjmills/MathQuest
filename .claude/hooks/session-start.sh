#!/bin/bash
# Session start (cloud sessions): make sure the print checks' PDF reader is installed.
# ws-print-lint / ws-precritic need pymupdf; fresh containers do not have it.
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || [ -n "${CLAUDE_CODE_REMOTE_SESSION_ID:-}" ] || [ ! -t 0 ]; then
  python3 -c 'import pymupdf' 2>/dev/null || pip install -q pymupdf >/dev/null 2>&1 || pip3 install -q --break-system-packages pymupdf >/dev/null 2>&1 || true
fi
exit 0
