# Atomisation Lesson Planner V21: independent critic, round 5

Critic: Opus, medium effort, 2026-10-16. I graded commit `8bf3a976` cold, by the same method as rounds 1–4.

## Verdict

- **Pages: PASS.** Every page of both packs, keys included, scores 8 or more on all four RUBRIC criteria. No hard cap
  applies.
- **V21 document: FAIL on one criterion.** D4 (checkability) scores 7. The reference self-check cannot pass a correct
  pack for a skill outside the two samples: "make 10" and "tell time" both fail it (R5-1).
- **The fix is small:** extend the pool's data declaration and the item key (§4).

## How I checked

**Self-check, re-run by me.** I extracted the self-check from V21's ```` ```js v21-selfcheck ```` fence and ran it
under Playwright with Chromium 1194. It ran on scratch copies of both packs, with the Andika fonts linked.

| Run | Add 1–3 | Subtract within 100 |
|---|---|---|
| Pack as published | **34 / 34 PASS** | **34 / 34 PASS** |
| Embedded `v21-pool` JSON deleted | 32 / 34: E24 and E24b FAIL | 32 / 34: E24 and E24b FAIL |

- The self-check rebuilds the pool from the data declaration with ordinary loops; nothing from the pack is executed
  as code. The only matches for "eval" in the script are Playwright's `page.evaluate`.

**Changed pages.** `git diff 1d03bae4 8bf3a976` changes only two PNGs: add `page-12` (Practice 2) and `page-20` (its
key). Every other page is byte-identical to round 4, so its round-4 grades stand.

**Measurements.** I measured with my copy of the site's empty-band check (`sheetCheck`) and looked at both changed
PNGs at full size.

## 1. Grades

C1 ease of use · C2 educational value · C3 spacing and layout · C4 standard fidelity.

### Pages

| Pack | Pages | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| Add 1–3 | T1–T6, P0–P6, 8 keys | 8–9 | 8–9 | 8–9 | 8–9 | **PASS** |
| — of which: P4b Practice 2 and its key (page-12 / 20) | | 9 | 8 | 8 | 9 | PASS |
| Subtract within 100 | T1–T6, P0–P6, 8 keys | 8–9 | 8–9 | 8–9 | 8–9 | **PASS** |

### V21 document

| Criterion | r4 | r5 | Pass |
|---|---|---|---|
| D1 Fidelity to the site profile | 8 | 8 | PASS |
| D2 Completeness and self-containment | 8 | 8 | PASS |
| D3 Decision-rule clarity | 7 | 8 | PASS |
| D4 Checkability | 8 | **7** | **FAIL** (R5-1) |

## 2. Round-4 defects: closure verified by measurement

| R4 | Status | Evidence |
|---|---|---|
| R4-1 Practice 2 bands and cell size | **Closed** | Both Practice pages have 61.5 × 53.7 mm cells. E12 reports a spread of 0.0 × 0.0 mm across 42 cells. The fourth row is one unruled blank area inside the frame (PG-15), with no `Remember:`, `Say:` or `Rule:` band. E28 checks this, and the rule is written in §8.12.4 and §9.5. The page is 75 % used: above 50 %, and not short enough for PG-23 rebalancing. |
| R4-2 Small pool | **Closed in the text** | §9.5 adds "Small pool (usable < 12)": print one Practice page; soft turn-arounds only on other pages; another representation counts only on another page; a make-10 worked example. |
| R4-3 Pool rule as code | **Closed** | `"decl":{"op":"+","small":[1,3],"maxSum":10,"noZero":true}` is data, and E24 rebuilds the pool from it ("matches"). |
| Time and make-10 gaps | **Closed** | `timeSlot()` is in Appendix D. The half-past cases (12:30, 6:30, 12:00) are in §9.3. C.3 adds the frame "__ and __ make 10." |

## 3. Self-containment: two skills neither pack covers

### Make 10 (K.OA.A.4)

What V21 now provides:
- `tenFrame` drawn with solid and hollow counters, and `numberBond`;
- the `missing` and `draw-count` instructions and the "make 10" oral frame;
- the case list in §9.3 and the small-pool rule with its worked example.

The pupil pages can be built without guessing, apart from:
1. **The self-check cannot represent this pool (R5-1).** The declaration grammar only knows `+ {small, maxSum,
   noZero}` and `− {top, minDiff, regroup}`. "a + b = 10, zero allowed" cannot be written, so the pool rebuild fails
   and E24 FAILS on a correct pack.
2. **E24 and the small-pool rule disagree.** The rule allows the same fact in another representation on another
   page, but E24 keys items only by `data-item="a+b"`. So the exit slip's ten-frame copies of Guided items count as
   exact repeats and E24 FAILS.
3. **The worked example's count is off.** "11 ordered facts, 2 chart examples → usable 9" leaves out the chart
   examples' turn-arounds, which LR-5 also forbids. Usable is 7, unless a chart example is a double (5 + 5).

### Tell time to the half hour (1.MD.B.3)

What V21 now provides:
- `clock()` with the hand states ink / grey / key and `show` to draw one hand only;
- `timeSlot()` for the digital answer;
- the "half past is said, not written" rule;
- the edge cases, the `time-write` and `time-draw` instructions, and the minute-hand contrast line.

The pages can be built. The guesses are:
1. **No item key or pool declaration for time items.** E24 reads only `a+b` / `a−b`, so a correct clock lesson fails
   E24 ("no pool JSON or no items in the pack") (R5-1).
2. **A small value mismatch.** `timeSlot()` uses a 4 mm colon gap, but §8.10 and WDS §6 give 5 mm.

## 4. Defects in round 5

### R5-1 (major, D4): E24 cannot represent any skill outside + and −, nor the small-pool representation rule

- **Where:**
  - V21 §9.5, the pool JSON (lines 3006–3008);
  - Appendix E, the E24 row (line 6517);
  - the reference implementation (lines 6774–6790).
- **Observed:**
  - The pool declaration has two hard-coded forms. Items are keyed `a{op}b` with no representation.
  - Without a pool, E24 FAILS by design.
  - So a correct make-10 pack and a correct time pack both fail the self-check, unless the builder invents a new
    grammar.
  - This was the build test the coordinator asked for.
- **Cost:** D4 −1 (a check that fails valid output in the general case cannot be trusted). D2 nit.
- **Fix:**
  1. Extend `decl` with:
     - `{"op":"+","sum":10,"zero":true}` for exact-sum pools;
     - `{"kind":"time","h":[1,12],"m":[0,30]}`;
     - `{"kind":"list","items":[…]}` as the fallback for any other skill.
  2. Item marks become `data-item="<key>"` plus `data-rep="stack|tenframe|bond|clock|…"`.
  3. E24 then:
     - counts a repeat when `item + rep` repeats;
     - also counts it when `item` repeats on the same page;
     - treats a cross-page repeat in a different representation as soft only while usable < 12.
  4. Add a third, small worked case to Appendix F: a make-10 pool declaration with its E24 result.
- **Check:** a hand-made 10-item make-10 pack, and one time pack, both pass E24. The same packs with one exact
  same-representation repeat fail it.

### R5-2 (nit): two value slips

1. **Colon gap.** `timeSlot()` uses a 4 mm gap; §8.10 and WDS §6 say 5 mm. Fix: use `width: 5mm`.
2. **Make-10 worked example.** Correct the usable count to 7 (or name a double as the chart example). The check is to
   recount against LR-5.

## 5. What would raise each criterion to 10

- **Pages.** These are cosmetic only and need no fix to pass:
  - Practice 2's blank trailing row reads as 25 % unused. Taking a row off Practice 1 to make 3 × 3 + 3 × 4 → 3 × 4 +
    3 × 3 does not change this; it is what the site's rules produce.
  - The exit slip's `Say:` frame carries the item letter ("a.").
- **D1:** the 5 mm colon gap.
- **D2:** a third, small worked case in Appendix F (make 10).
- **D3:** the corrected make-10 arithmetic.
- **D4:** R5-1.
