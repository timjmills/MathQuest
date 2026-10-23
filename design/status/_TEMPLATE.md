Lane: <lane-id, the same as the file name without .md>
Title: <short title>
Session: <session id, or —>
Branch: <branch, or —>
Owner of files: <the files this lane owns, short>
State: <planned | building | critic | fix | passed | merged | paused | done>
Updated: <YYYY-MM-DD>
Builder profile: <mq-opus-low | mq-opus-medium | —>
Critic rounds: <n>, <last verdict, or none>

## Now
<!-- At most 5 lines: what the lane is doing and what comes next. -->
- 

## Owner go
<!-- Only lines exactly "Owner go: <family>, <YYYY-MM-DD>" (family = a category / family id, lowercase),
     one per family the owner has said go for after seeing its picture sheet (IMPROVEMENT_PLAN §1.6.3 step 6).
     Blank lines and comments are allowed here; anything else fails ws-status-index. Leave it empty until the owner says go. -->

## Open questions
- none

## Times
<!-- One line per builder run and critic round, newest first, so audits read times directly (lead request 2026-10-23):
     "Times: <builder|critic|fix> <step or round>, start <YYYY-MM-DDTHH:MM>Z, end <YYYY-MM-DDTHH:MM>Z, profile <mq-opus-low|mq-opus-medium>"
     Times are UTC. A run still going has "end —". -->

## Log
<!-- Dated entries, newest first: "- YYYY-MM-DD: ..." -->
- 
