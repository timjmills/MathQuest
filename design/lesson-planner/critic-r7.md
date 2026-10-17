# Atomisation Lesson Planner V21: independent critic, round 7

Critic: Opus, medium effort, 2026-10-16. Commit `0badf07a`, graded cold.

## Verdict: PASS

Every page of both sample packs, keys included, scores 8 or more on all four RUBRIC criteria. The V21 document scores
8 or more on all four of its own criteria. That meets the owner bar (≥ 8 on every criterion, every page).

## 1. Nothing was lost in the re-render

The brief warned that the add pack now ends at page-21 and the sub pack at page-19. That is not what the commit
holds:

| Pack | `pack.pdf` pages | PNGs | `pack.html` vs round 6 (`7449ef3a`) |
|---|---|---|---|
| `sample-v21` | 23 (pdfinfo) | page-01 … page-23 | byte-identical (`git diff --quiet`) |
| `sample-v21-sub` | 23 (pdfinfo) | page-01 … page-23 | byte-identical (`git diff --quiet`) |

- In both packs, every role (T1–T6, P0–P6) and every key, the chart key included, is still present.
- No PNG changed between round 6 and round 7. The PDFs differ only in their metadata bytes; the file sizes are the
  same.
- So the round-5 and round-6 page grades stand: **every page PASS.**

## 2. Checks I ran myself

**Self-check on both packs.** I extracted it from the V21 `v21-selfcheck` fence and ran it with Chromium 1194 on
copies of the packs:
- `sample-v21`: **34 / 34**
- `sample-v21-sub`: **34 / 34**
- "chart examples returning": 0 in both.

**The builder's fixtures:**

| Fixture | Result | Expected |
|---|---|---|
| `make10` | PASS | PASS |
| `make10-repeat` | FAIL | FAIL |
| `make10-chart` (new) | FAIL: "chart examples returning 7+3 (tenframe) P6" | FAIL |
| `time` | PASS | PASS |
| `time-repeat` | FAIL | FAIL |

**My fixtures.** A–F are from round 6; G is new this round.

| Fixture | Expected | E24 |
|---|---|---|
| A. List pool, valid deal | PASS | PASS |
| B. Same fact, two representations, same page | FAIL | FAIL |
| C. Declared rule ≠ listed pool | FAIL | FAIL |
| D. Big pool, a cross-representation repeat on another page | FAIL | FAIL |
| **E.** A chart example comes back in another representation (round-6 R6-1) | FAIL | **FAIL** ("chart examples returning circle (word) P6"): **fixed** |
| F. An item with no `data-rep` | FAIL | FAIL |
| **G** (new). A chart example's **turn-around** comes back in another representation (3 + 7 as a ten frame on the exit slip) | FAIL | **FAIL** (chart return + forbidden) |

## 3. The V21 document

| Criterion | r6 | r7 | Pass |
|---|---|---|---|
| D1 Fidelity to the site profile | 7 | **8** | PASS |
| D2 Completeness and self-containment | 8 | 8 | PASS |
| D3 Decision-rule clarity | 8 | 8 | PASS |
| D4 Checkability | 8 | **9** | PASS |

**D1 is now 8.** R6-1 is closed:
- §9.5 point (3), lines 3004–3005, now reads: "except a chart example: it never returns, in any representation, on
  any page, and neither does its turn-around (LR-5)".
- The make-10 example's exit slip is now 9 + 1, 8 + 2, 10 + 0 and 5 + 5 as ten frames.
- `poolCheck()` enforces this. Fixtures E and G prove it.

**D4 is now 9.** E24 fails closed:
- with no pool;
- on a declaration mismatch;
- on a same-page repeat;
- on a repeat in the same representation;
- on a cross-representation repeat in a big pool;
- on a returning chart example, or its turn-around.

All of these were exercised by the builder's fixtures and by fixtures I wrote that it did not anticipate.

## 4. Nits (no score effect)

1. **§9.5, line 3006: "The exit slip takes items not on Practice".** The worked example in the next lines uses
   Practice facts (9 + 1, 8 + 2, 10 + 0) as ten frames. Reword to "items not on Practice **in the same
   representation**".
2. **D2 → 10:** give `data-rep` a closed list: `stack`, `equation`, `bond`, `tenframe`, `picture`, `word`, `clock`,
   `digital`.
3. **D3 → 10:** say in words that a small-pool lesson's places may exceed the usable pool *only* through
   cross-representation repeats on other pages. The code already does this (`small || places ≤ usable`); the text
   does not say it.
