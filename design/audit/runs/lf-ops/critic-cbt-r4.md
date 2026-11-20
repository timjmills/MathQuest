# Narrow critic r4 — multiplication:count_by_tables (lf-ops), plus the changed pages of passed skills

Independent critic (Opus medium). Candidate 40150d7c3, merged with master d38308824; compared with origin/master. Evidence is in the session scratchpad crit-cbt4/ (session-local).

**Verdict: PASS.** Every page in scope scores 8·8·8·8 at M and L.

**Part A, the r3 findings** (r3 had graded every other offered page and host ≥ 8, design/audit/runs/lf-ops/critic-cbt-r3.md):
- **F1:** the Pre-skill check at L now prints 14 items, with a foot of 10–12 % (it was 35 %). M is still 16. The Score matches the bands and the key is correct.
- **m1:** the opener reads "I Can count by 2s to 5s" at M and "2s to 4s" at L, matching the steps dealt. The keys match.
- **m2:** the True or False? instruction reads "Check one box: True or False. If False, write the right numbers." It fits on one line and the key is correct.
- **m3:** the Scripted Model at L has 4 states, as at M. Nothing is clipped and the Say band is intact.

**Part B, passed skills changed by shared code** (graded against master; all ≥ 8 and better than before):
- placevalue:combine, Pre-skill Check: M 12 → 14 and L 10 → 11 items.
- placevalue:unit_form, Pre-skill Check: M 12 → 15 and L 10 → 11 items.
- vocabulary:vocab_grade_pictures, Pre-skill Check: 3 → 4 items. On master the M page was 40 % empty; it is now 17 % at M and 13 % at L.
- composing:chart_to_120 and placevalue:unit_form, True or False?: the new instruction suits their frames.
Every key answer is correct and every Score matches its bands.

**Gates:**
- `ws-empty-band --roles pre-skill-check --page-fill`: only the known add_facts EB-LASTPAGE (an open queue item, upstream: its pool deals only 4 items). CAP-PARITY and EB-LASTPAGE pass on all four in-scope skills.
- `ws-cell-checks --card`: OK, 26 pages.

**Notes, not scored:**
- N1: the Pre-skill check title names the target skill ("2s to 12s"), not the steps printed. r3 accepted this.
- N2: add_facts is the open queue item.
- N3: the True or False? key lists all five numbers on a False item.
