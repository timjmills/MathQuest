# lf-ops bugs (2026-11-19) — three queued bugs, check first

Branch claude/sweet-newton-c8wrv1-lf-ops-bugs, cut from master d38308824 (merges lf-tools-eblast 2225965ce; cherry-picks
lf-ops-props 95f64c8a3, the cbt r3 F1 one-page Pre-skill check fill).

| Bug | Cause | Check | Before (d38308824) | After | Backtest |
|---|---|---|---|---|---|
| integers:add_int −23..1 numerals touch (lf-engine roles r2 F6) | number-line.js labels every tick; the pitch falls to 176 mm / units (6.75 mm at 24 units) while "−23" is ~7.4 mm wide | ws-label-gap LABEL-GAP (new) | FAIL 102, pinned −0.68 mm, pages to −2.37 mm | OK, closest 1.68 mm | label-gap-add-int |
| division:divide bracket at Max Number 1000 on legacy markup (ldiv-room critic N3) | `_applyKitFactCell` serves `_KIT_FACT_SKILLS` (multiply, not divide) | ws-ldiv-hug --kit LDIV-KIT (new) | FAIL 37 (0 / 24 bracket items on the template) | OK | ldiv-kit-divide |
| addition:add_facts Prerequisite Check 4 items, 78 % empty | add_facts names no preSkills and is first in its category: the check tests itself once (one 4-item pool) | ws-empty-band EB-LASTPAGE (lf-checks) | FAIL 2 (78 % M, L) | OK (7 % M, 22 % L) | eb-lastpage-add-facts-pre-skill-check |

Thinning rule (number-line.js): when the asked numerals would come within 1.5 mm, keep the given point and 0, then both
ends, then every 2nd / 5th / 10th number, each only where it keeps the gap. An end adjacent to the given point loses its
numeral (−23 next to the start −22): the given point is information, the end is the margin tick. Font never shrinks.

Hash proofs: divide across / fraction / tiles / remainder pages 96 / 96 identical; nl_add, nl_sub, number_line_add,
number_line_sub, number_line_int identical, sub_int 2 of 16 pages changed (same defect); add_facts 60 of 64 role pages
identical, the 4 changed are pre-skill-check. The F1 cherry-pick also changes other skills' Pre-skill check pages (its
own cbt r4 hash proof on lf-ops-props, 40150d7c3).

For a critic: add_facts (PASSED) Pre-skill check M / L — new prerequisites (facts to 10, make 10, number bonds to 10);
its title reads "Pre-skill check: adding facts to 10" (the topic of its first source).

## 2026-11-20 finish (lead: backtests, precritic vs master)
- ws-backtest (outside the browser runner): ldiv-kit-divide, label-gap-add-int, eb-lastpage-add-facts-pre-skill-check all PASS (FAIL → OK).
- ws-precritic-plan after the master merge: OK (403 rows on the path).
- precritic --skill division:divide --strict: 11 FAIL. Same on master 65c28ccdf (re-run gate by gate with MQ_ROOT): empty-band (227 both),
  print-lint lesson L / M (CL-4b 0 -> 12, PAGEFILL 0 -> 1 both), screen-support-eq (N/A both), worksheet-reflow (same WS-REFLOW both),
  dealer-uniform (FAIL 1 both), node-lint-s1 (FAIL 1 both). options-render: the same 7 value pages fail on both, but BRANCH-CAUSED
  findings on notation="bracket": H13 0 -> 8 (M) / 0 -> 2 (L) and capacity 12 -> 6 a page, because the bracket items now draw the kit
  division template, whose 33 % side band master already shows on tiles=21 and regroup=mixed (a division-template H13 defect; open, for
  the ldiv owner). role-cover 1/2 and sibling-compare were not compared (long).
- precritic --skill addition:add_facts --role pre-skill-check --strict: stopped at the budget cap before its verdict (partial log only).
