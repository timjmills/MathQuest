# Atomisation Lesson Planner V21 — independent critic, round 4

Critic: Opus, medium effort, 2026-10-16. I graded commit `96d119b6` cold, by the same method as rounds 1–3.

**Verdict: FAIL.** 44 of 46 page versions pass. The two that fail are add Practice 2 and its key, for one defect
(R4-1). The document fails on one criterion: D3, decision-rule clarity (R4-1 and R4-2). Both fixes are small.

## How I checked

- **Pages.** I looked at every PNG of both packs at full size.
- **Self-check, re-run myself.** I extracted the V21 self-check from its ```` ```js v21-selfcheck ```` fence and ran
  it under Playwright with Chromium 1194. I ran it on scratch copies of both packs, with the Andika fonts linked so
  that E2 resolves.

  | Pack | Result |
  |---|---|
  | Add | 33 / 33 PASS |
  | Subtract | 33 / 33 PASS |

  The coordinator's brief said "37/37", but both packs' `SELF-CHECK.md` files and my own run report 33 checks.
- **Missing-pool test.** I deleted the embedded `v21-pool` JSON from each copy. Both packs then show **31 / 33**:
  E24 FAIL and E24b FAIL. E24 now rebuilds the pool from the declared rule ("pool 39 recomputed from its rule:
  matches").
- **Items, extracted myself.** I pulled every item out of the pupil pages' `data-item` attributes and compared each
  with the digits printed in its cell.
  - All 37 add items and all 25 subtract items match their printed digits.
  - **0** exact repeats in either pack.
  - **0** turn-arounds on any one page.
  - The chart's turned-round examples (2 + 7, 8 + 2) are never dealt.
- **H13 bands.** I re-measured with my copy of the site's `sheetCheck`. On the key pages, where answers count as
  content, no cell has a band of 30 % or more. The pupil pages match the site's own Practice pages.

---

## 1. Grades

C1 ease of use · C2 educational value · C3 spacing and layout · C4 standard fidelity.

### 1.1 Add 1–3 (`sample-v21/`)

| PNG | Page | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| 01–06 | T1, T2, T2b, T3, T4, T5 | 8–9 | 8–9 | 8–9 | 8–9 | PASS (unchanged from r3) |
| 07 / 15 | P0 / key | 9 | 8 | 8 | 9 | PASS |
| 08 / 16 | P1 / key | 9 | 8 | 9 | 8 | PASS |
| 09 / 17 | P2 / key | 9 | 9 | 8 | 9 | PASS |
| 10 / 18 | P3 / key | 9 | 8 | 8 | 9 | PASS |
| 11 / 19 | P4a / key | 9 | 9 | 9 | 9 | PASS |
| 12 / 20 | P4b / key | 9 | 8 | 8 | **7** | **FAIL** (R4-1) |
| 13 / 21 | P5 / key | 9 | 8 | 8 | 9 | PASS |
| 14 / 22 | P6 / key | 9 | 8 | 8 | 8 | PASS |
| 23 | T6 | 9 | 8 | 9 | 8 | PASS |

### 1.2 Subtract within 100 with regrouping (`sample-v21-sub/`)

All 23 pages pass. Every page has C1 ≥ 8, C2 ≥ 8, C3 ≥ 8 and C4 ≥ 8.
- **P4b and its key:** C2 is now 8. The LR-6 breach is fixed: c is now 57 − 28.
- **P5 key:** C4 is now 9. The quick-draw is in the key colour.

### 1.3 The V21 document

| Criterion | r3 | r4 | Pass |
|---|---|---|---|
| D1 Fidelity to the site profile | 7 | 8 | PASS |
| D2 Completeness and self-containment | 8 | 8 | PASS |
| D3 Decision-rule clarity | 8 | **7** | FAIL (R4-1, R4-2) |
| D4 Checkability | 8 | 8 | PASS |

---

## 2. Round-3 defects: closure verified by measurement

| R3 | Status | Evidence |
|---|---|---|
| R3-1 Exit-slip repeats | **Closed** | The exit slip is 6 + 3, 2 + 6, 2 + 2, 1 + 9, none of which appears anywhere else. 37 places = usable pool 37. §9.5 sets the pool-sizing rule, and E24 allows 0 repeats. |
| R3-2 LR-6 | **Closed** | LR-6 is restated in §9.5 with its examples and the addition variant. The subtract P4b now subtracts 56, 38, 28, 19, 7 and 52, all different. Add P4a has no first addend three times in a row. E24b tests all of this. |
| R3-3 Counters in fives | **Closed** | Add P0 a is drawn 5 + 3. E27 checks it. |
| R3-4 Sum-rule overhang | **Closed** | Add P4a cell a: the rule runs 127–246 px and the "+" ink starts at 130 px, a 0.7 mm overhang (site: 0.5 mm). The right overhang is 1.4 mm (site: 1.4 mm). The operator track is now 1.35 em, as on the site. |
| R3-5 Key drawing colour | **Closed** | The P5 key's quick-draw is #C2410C. |
| R3-6 Guide dots | **Closed** | 2.5 mm, and Guided cells only. |
| R3-7 Clock | **Closed** | `clock({handsState: 'ink' / 'grey' / 'key', show})` exists, and Appendix H now says time answers go in the digital slot. |
| Section rule | **Closed** | `shape()` comment: "every shape in one section takes the same task (one outline weight)". |

---

## 3. Defects in round 4

### R4-1 (major): add Practice 2 fills its spare height with bands the site does not allow, and its cells differ from Practice 1

- **Where:**
  - `sample-v21/page-12.png` and `page-20.png`.
  - V21 Appendix F, P4 Practice 2 row (line 6824): "`Remember:` and the `Say:` / `Rule:` band take the fourth row's
    height".
  - This is stated only in the worked example. Part 9 has no such rule.
- **Observed:**
  - The 3 × 3 grid's cells are **61.5 × 60.0 mm**. Practice 1's are **61.5 × 53.7 mm**.
  - Under the grid sit a `Remember:` band, a `Say:` line ("a. 1 plus 1 equals __.") and a `Rule:` line. Practice 1
    has none of these.
- **Expected:** the site's rules, applied to the coordinator's question about where spare height may go.
  - **PT-ENG-5 / PG-14:** spare height "always goes to the answer or work zone, never to the problem".
  - **PT-ENG-3:** on banded pages, the remainder "stays blank at the foot of the body".
  - **PG-15:** trailing positions in a short grid are "one unruled blank area inside the closed outer frame".
  - **CL-3 / PG-11:** cell size is identical on every page of a section.
  - **V21 §8.8:** a `Say:` band closes only the anchor chart, the word problem and the exit slip.
  - **V21 §8.12.5:** a reminder band on a Practice page is a hint scaffold *added* after the fade, which runs the
    fade backwards. Practice 1 and Practice 2 now also follow different routines (AX-4).
  - **Verdict:** this is **not** a site-sanctioned use of spare height.
- **Cost:** C4 −2 on P4b and its key (the page anatomy and CL-3 / PG-11 break). C2 is held at 8 (hint added after
  the fade). D3 −1, because the decision was made in an example, not in a rule.
- **Fix:**
  - Draw Practice 2 at Practice 1's cell size (3 × 3 at 53.7 mm).
  - Draw the fourth-row position as one unruled blank area inside the frame (PG-15). That uses about 75 % of the
    page, which is still at least 50 %.
  - Add to §8.12.4: "a Practice page shortened by pool sizing keeps the section's cell size; the freed rows are one
    unruled trailing area (PG-15); never add bands to fill it."
- **Check:**
  - Extend E12 to compare cell size across all pages of a section (PG-11).
  - New check E28: no `Say:`, `Rule:` or `Remember:` band on a Practice page.

### R4-2 (minor, D3 / D2): no rule for skills whose pool is smaller than one Practice page

- **Where:** §9.5 "Pool sizing", Appendix H.
- **Observed:** this came up in the build test (section 4). The rule only takes rows off Practice pages. For "make 10"
  (6 unordered or 11 ordered facts), "doubles to 10" or "+0 / +1", that leaves no Practice page at all.
- **The site's own LR-5** treats a cross-page turn-around as *soft* when the pool is short. V21 never says:
  - whether the same fact in another representation (ten frame against equation against bond) counts as a repeat;
  - when the lesson should print a single Practice page.
- **Fix:** add a "small pool" rule:
  - When usable pool < 12, print one Practice page.
  - Turn-arounds of other pages' items are allowed (soft, as in LR-5).
  - The same fact in a different representation is a different item only on a different page.
  - State the order: first fewer Practice rows, then soft turn-arounds, never exact repeats in one representation.
- **Check:** the pool-sizing worked example in §9.5 gains a second case: make 10.

### R4-3 (nit): the pool rule is stored as a JavaScript function string

- **Where:** the pool JSON in §9.5 (`"rule":"(a, b) => …"`).
- **Observed:** E24 has to evaluate code taken from the pack. An outside AI writing the self-check in another
  language cannot use it.
- **Fix:** declare the rule as data instead, for example `{"op":"+","small":[1,3],"maxSum":10,"noZero":true}`, and
  keep the code form as an option.
- **Check:** E24 recomputes the pool without `eval`.

---

## 4. Self-containment: building lessons neither pack covers

**Tell time to the half hour (Level 1, 1.MD.B.3).** It can be built from V21 alone:
- `clock()` at 50 mm, or 52 mm for draw-the-hands;
- `handsState` gives grey model hands on the anchor chart and key-coloured hands on the key;
- `show: 'hour' / 'minute'` fades one hand at a time;
- the time slot: two 20 × 12 mm boxes with a colon;
- the strings `time-write` / `time-draw`, the oral frame "The time is __.", and Appendix H's rule (answer "3:30" in
  the slot, "half past 3" said aloud);
- the minute-hand contrast line;
- prerequisite ids per Appendix H.

Remaining guesses:
1. There is no ready-made time-slot recipe, so it has to be built from `.bx` with `--w: 20mm`. Add a `timeSlot()`
   function.
2. The edge cases for half past (12:30, with the hour hand between 12 and 1; 6:30) are not listed. Add one line to
   §9.3's "cases".

**Make 10 with a ten frame (K.OA.A.4).** It can mostly be built:
- `tenFrame({a, b, dotted})`, with solid and hollow counters;
- `numberBond`;
- the `missing` and `draw-count` strings.

Guesses:
1. The pool policy for a 6-fact skill (R4-2).
2. The oral frame "__ and __ make 10." is not in C.3. Add it under "Number bonds".

---

## 5. What would raise each criterion to 10

- **Pages:** R4-1. Practice 2 then matches Practice 1 and the site.
- **D1:** state PT-ENG-3 / PT-ENG-5 and PG-15 in §8.12.2 in full.
- **D2:**
  - a `timeSlot()` recipe;
  - the number-bond oral frame;
  - the half-past edge cases.
- **D3:** R4-1 written into §8.12.4, and the small-pool rule (R4-2).
- **D4:**
  - E12 across pages, for PG-11;
  - E28, no extra bands on Practice pages;
  - the pool declared as data (R4-3).
