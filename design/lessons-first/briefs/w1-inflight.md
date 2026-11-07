# In-flight items — finish under a cap, then stop (in-session worktree agents of the lead)

**Model and effort: Opus 5.5, MEDIUM** (`mq-opus-medium`, `model: "opus"`), as they run today. These two are the only
in-session worktree agents of wave 1 (this container has 5.2 GB free and two browser slots: at most two worktree agents,
browser gates one at a time each, `/tmp/mq-browser-run.sh`). Each reports its token use at hand-over so the lead can book its
cost (plan §5.5 rule 3: in-session work has no counter of its own).

## A. Facts print fix — round 6 (branch `claude/sweet-newton-c8wrv1-facts-print-fix`)
- **State:** measured-sweep round 6 in progress; critic rounds 1–6 failed on the planner (r5 critic: the owner's page passed
  9/8/8/8, planner defects D-R5-1…; `design/status/facts-print-fix.md` on the branch).
- **Cap: $40 more** (≈ 2 %). Finish round 6 and its critic. If it fails on a defect that survived two rounds at medium, stop
  (LESSONS_LEARNED rule 7): write the root cause as a machine check with a backtest row, hand over, and do not start round 7
  without the lead.
- **Files:** as today (`js/modules/simple-print.js`, `sheet/roles/fact-rows.js`, `print-sheet.js` fact paths,
  `tests/scripts/ws-simple-print.cjs`, `tests/lib/ws-fact-geom.cjs`, `tests/lib/ws-pdfium-rules.py`). It must not touch
  `print-sheet.js` `buildLesson` / `buildDetailedLesson` (lf-engine) or the operations generators (lf-ops). Tell lf-ops (through
  the lead) of any fact-skill behaviour change, because `mult_facts` and `div_facts` are main skills of the pilot unit.
- **Gates:** `ws-simple-print` (full, incl. `--facts-print`, `--r4`, `--r5`), `ws-precritic --skill addition:add_facts,
  subtraction:sub_facts,multiplication:mult_facts,division:div_facts,division:div_facts_long --strict`, `ws-backtest`,
  `ws-boot-smoke`, `ws-code-snapshot`.
- **Hand-over:** the branch's status file; PR into `claude/sweet-newton-c8wrv1`; on PASS the lead merges it on the next
  train. Its checks L19–L21 (`ws-pdfium-rules.py` rasterised rules, the sweep harness) are inputs to lf-checks' LP-RASTER and
  LP-SWEEP: the hand-over names their entry points.

## B. Explorer hover thumbnails (branch `claude/sweet-newton-c8wrv1-explorer-thumbs`)
- **State:** being built in the lead session's worktree (not on origin on 2026-11-07). The student explorer is live (checker r5
  PASS, STATUS:711).
- **Cap: $30** (≈ 1.5 %). One build round and one independent check; then stop whatever the verdict, with a hand-over. The
  E1–E4 explorer nits are parked (plan §2.3): do not fold them in.
- **Gates:** `ws-student-explorer`, `ws-chromebook-fit --skills` on the explorer sample, `ws-boot-smoke`, `ws-stamp-assets
  --check` is the lead's.
- **Hand-over:** `design/status/student-explorer.md` (append), push the branch, PR into `claude/sweet-newton-c8wrv1`.
