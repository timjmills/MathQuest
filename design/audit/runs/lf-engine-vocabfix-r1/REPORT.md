# lf-engine rowcap + vocabfix: round-cap critic r1, PASS

- **Head:** 4ecba079c, merged with master 9ae9ccd5d through c56946ec5.
- **Critic:** independent, medium.
- **Rendered:** 7 role sheets at M and L, through `ws-grade-render --raster-fit`. Every one printed OK: pages as planned, no ink at the edge, no clipped text.
- **Saved by:** lf-engine, because the critic's Write was refused.

## Scores

C1 = ease of use, C2 = educational value, C3 = spacing and layout, C4 = standard fidelity.

| Page | C1 | C2 | C3 | C4 | Item |
|---|---|---|---|---|---|
| Scripted Model count_by_tables L | 9 | 8 | 8 | 9 | F1 and the Say-band clip: cleared |
| Guided add_wp_10_plain L p2 | 8 | 9 | 8 | 8 | F2: cleared |
| Error Analysis fact_family_sort M | 8 | 8 | 8 | 8 | F3: cleared, pupil and key |
| Review add_facts M | 9 | 8 | 8 | 9 | F4: 12 of 12; the white is role-capped |
| Test add_facts L | 9 | 8 | 8 | 9 | F5: 3 × 4 grid, about 22 % white |
| Lesson add_facts L p4 (Mixed) | 9 | 8 | 9 | 9 | vocab 1: all 3 shelves, 12 items |
| Lesson follow_given_rule M p3 | 9 | 8 | 8 | 9 | vocab 2: 6 items on 1 page |
| Scripted Model vocab_grade_pictures M | 8 | 8 | 8 | 8 | vocab 3: fits on 1 page |

Every key read matched its pupil page. The master merge undid no fix.

## Findings (none blocking)

**m1. Guided tries have no item number but keep a tab-width indent.**
- Check: a roles-unit GUIDED-TAB assertion. Either every try carries `mq-num`, or the indent is 0.

**m2. vocab_grade_pictures Model content** (already on master; for the vocab lane).
- State 1 starts with a lowercase letter.
- States 1 and 2 are identical and trace nothing; state 3 traces all three answers at once.
- "Say:" sits about 1 mm high.
- Check: a STATE-PROGRESS assertion (each state adds at least one traced slot), plus a sentence-case lint on step text.

**m3. The Error Analysis "Sam chose:" name tag is near 8 pt.**
- Check: a MIN-PT lint, at least 10 pt at M.

## Rulings on the loosened checks

- **TAB-CLEAR 1 mm for boxes and one-line facts: ACCEPTED.** Text keeps 2 mm.
- **PAGEFILL 20–30 % at a role's ceiling as a note: ACCEPTED.** Over 30 % stays major unless a named role-capped ruling covers it, and the note must stay printed.
- **WHITE-ROW known list: ACCEPTED PROVISIONALLY.**
  - Each entry names the lane it is routed to and comes off the list when that lane lands.
  - The list does not grow without a lead ruling.
- **Already ruled, not scored:** ROLE-CAPPED Review / Test / Error Analysis, ruling A, ruling B and NO-LONE-STATE. Those pages are still at least 50 % used, so H5 does not fire.

## Lesson hashes

What was seen fits "rows held to their cap; no item lost". The only count drops are the Mixed counts accepted under ruling A.

## PT-PRE-3

It comes from master, not this lane. On master it already fails with "expected 4, got 8".
- Cause: master's 903f2d778 fills the pre-skill check to its L ceiling of 8.
- Route to lf-roles to update the assertion.
