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
