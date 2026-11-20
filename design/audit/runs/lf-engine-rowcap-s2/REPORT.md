# lf-engine row-cap stage 2, wide critic: FAIL

- **Head graded:** 661965d43, merged with master 65c28ccdf.
- **Critic:** independent, medium.
- **What was graded:** the 24 proof pages, plus 13 pages the critic rendered itself.
- **Saved by:** lf-engine, because the critic's Write was refused.

The cap works on most templates: cells are now their drawing plus a few mm, and the in-cell bands are gone. Four regressions block it, and every gate is green on all four.

## Scores (C1/C2/C3/C4, pupil page after)

**Proof pages:** all score ≥ 8, except:

| Page | Score | Finding |
|---|---|---|
| scripted-model count_by_tables L | 6/7/5/6 | F1 |
| test add_facts L | 9/8/7/9 | F5 |
| pre-skill-check identify L | 8/8/7/9 | pre-existing (N1), not counted |

**The critic's own renders:**

| Page | Score | Finding |
|---|---|---|
| lesson sub_100 M p1–p3, mixed L, opener sub_100 L, error-analysis sub_100 L, scripted-model count_by_tables M | 9/8/8/9 each | — |
| review add_facts M and L | 9/8/6/9 | F4 |
| guided add_wp_10_plain L | 7/8/6/7 | F2 |
| error-analysis fact_family_sort M | 7/8/7/7 | F3 |

**Keys:** every key matches its pupil page, defects included.

## Blocking findings

### F1: Scripted Model count_by_tables L is clipped

- The row dropped from 50 to 47 mm.
- In states 1–3 the second line of answer boxes has no floor. In state 4 the boxes sit on the Say band's rule.
- On 3b0fdbcbb the page was whole.
- **Check:**
  - EB-CLIP: each cell's ink must end at least 0.5 mm above its row's rule.
  - RR-BOX in `--raster-fit`: every slot and frame edge is inked on all four sides. Today RR-CLIP checks text only.

### F2: Guided add_wp_10_plain L page 2 is clipped (the −44.8 mm row)

- The frame has no bottom edge, and the labels sit on the cut.
- Cause: the Guided cap subtracts a tab keep-out that this page draws, and it overrides the `word` exemption.
- **Check:** EB-CLIP / RR-BOX, plus a roles-unit assertion: every Guided row is at least its measured ink + 1 mm.

### F3: Error Analysis fact_family_sort M — the number tab covers "Sam / Ana / Leo chose:"

- Happens on both the pupil page and the key.
- On 3b0fdbcbb it was clear.
- **Check:** TAB-CLEAR (tab ≥ 2 mm from ink) on every grid role and key, in ws-empty-band.

### F4: Review does not refill at the cap

- add_facts Review M prints 10 of 12 items, with 100 mm of white at the foot (was 67 mm). L has 94 mm (was 60 mm).
- This is a PAGEFILL major.
- **Check:**
  - ws-print-lint PAGEFILL `--fill-roles review,test,error-analysis,opener` at M and L.
  - capacity-pin FAILs when the white exceeds one row while the count is below the ceiling.

### F5: Test add_facts L

- The count is capped by the role (12 = the 12.1 ceiling at L).
- The white at the foot grew from 49.6 mm to 94.7 mm, which is 39 % of the body. C3 = 7.
- **Fix in the Test role:** a 3 × 4 grid leaves about 49 mm. Or the lead raises Test L facts to 16. Fix before merge.

## Rulings

- **(a) fact-rows exemption:** the lead ruled it exempt.
- **(b) The four EB-STRETCH changes:**
  - drawn = `max(natural, measure + 1 mm)`: sound only alongside EB-CLIP. EB-STRETCH is one-sided, and F1/F2 show the measure can run low.
  - 3 mm tolerance for unmeasured rows: acceptable.
  - A Scripted Model's states judged as one height: sound.
  - Legacy cells noted, not judged: NOT acceptable. 7 legacy pages changed, by up to 12.3 mm. They must at least get EB-CLIP / RR-BOX.
- **(c) mult_facts Scripted Model and Guided L Model row:** routed by the lead, not blocking.

## Pre-existing (not this change)

- **N1:** Pre-skill check identify L. Page 1 holds 4 items and is 55 % white, while items 5–6 print on page 2. Route to lf-roles.
- **N2:** Opener compare L. The Guided row is still about 10 mm over its ink, but improved.
- **N3:** Error Analysis, Opener and Scripted Model pages leave 77–120 mm at the foot, because the role caps the count. The lead may review the ceilings.

## Process

All four blockers showed on a first look at one page each. Before the next engine change:
- put EB-CLIP / RR-BOX and TAB-CLEAR on all roles into precritic;
- backtest them on F1–F3.
