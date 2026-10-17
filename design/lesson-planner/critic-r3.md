# Atomisation Lesson Planner V21 — independent critic, round 3

Critic: Opus, medium effort, 2026-10-16. I graded commit `acc21b53` cold, by the same method as rounds 1 and 2.

**Verdict: FAIL.** 6 of the 46 page versions and one of the four document criteria are below 8. Every remaining defect
is narrow and has a one-step fix; section 5 lists them.

## How I checked

**What I looked at**
- All 46 PNGs: 23 in `sample-v21/` (add 1–3) and 23 in `sample-v21-sub/` (subtract within 100 with regrouping).
- `recipe-sketch-shape.png`.
- The changed parts of V21: §8.9, §8.12, §9.5, Appendix D (`factStack`, `shape`, the stack CSS), Appendix E, H and I.
- LR-5 and LR-6 in `design/LESSON_RULES.md` on `origin/claude/sweet-newton-c8wrv1-wip-lessons`.

**What I re-ran myself**
- **The V21 self-check.** I extracted it from the ```` ```js v21-selfcheck ```` fence of V21 and ran it under
  Playwright with Chromium 1194 on copies of both packs.
  - Both packs: 31 / 32. The one failure is E2 (Andika), and only because the copies sit outside the repo, so the
    relative font path `../../../css/fonts` does not resolve. That is the correct result.
- **The missing-pool test.** I then deleted the embedded `<script type="application/json" id="v21-pool">` from each
  copy.
  - E24 → **FAIL** ("no pool JSON or no items in the pack") and E24b → **FAIL** ("no pool"), giving 29 / 32. E24 now
    fails closed.
- **My own H13 measure.** I re-measured both packs with my independent copy of the site's `sheetCheck` H13 measure
  (border box; leaves, slots and bordered elements count as content).

---

## 1. Grades

C1 ease of use · C2 educational value · C3 spacing and layout · C4 standard fidelity. A version passes only when all
four scores are 8 or more.

### 1.1 Add 1–3 (`sample-v21/`)

| PNG | Page | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| 01 | T1 | 9 | 8 | 9 | 9 | PASS |
| 02 | T2 | 8 | 8 | 8 | 8 | PASS |
| 03 | T2b | 8 | 8 | 9 | 8 | PASS |
| 04 | T3 | 8 | 9 | 9 | 8 | PASS |
| 05 | T4 | 8 | 9 | 8 | 8 | PASS |
| 06 | T5 | 8 | 8 | 9 | 8 | PASS |
| 07 | P0 | 9 | **7** | 8 | 8 | FAIL |
| 08 | P1 | 9 | 8 | 9 | 8 | PASS |
| 09 | P2 anchor chart | 9 | 9 | 8 | 9 | PASS |
| 10 | P3 | 9 | 9 | 8 | 8 | PASS |
| 11 | P4a | 9 | 8 | 9 | 8 | PASS |
| 12 | P4b | 9 | 9 | 9 | 8 | PASS |
| 13 | P5 | 9 | 8 | 8 | 9 | PASS |
| 14 | P6 exit slip | 9 | **7** | 8 | 8 | FAIL |
| 15 | Key P0 | 9 | **7** | 8 | 8 | FAIL |
| 16 | Key P1 | 9 | 8 | 9 | 8 | PASS |
| 17 | Key P2 | 9 | 9 | 8 | 9 | PASS |
| 18 | Key P3 | 9 | 9 | 8 | 8 | PASS |
| 19 | Key P4a | 9 | 8 | 9 | 8 | PASS |
| 20 | Key P4b | 9 | 9 | 9 | 8 | PASS |
| 21 | Key P5 | 9 | 8 | 8 | 9 | PASS |
| 22 | Key P6 | 9 | **7** | 8 | 8 | FAIL |
| 23 | T6 | 9 | 8 | 9 | 8 | PASS |

### 1.2 Subtract within 100 with regrouping (`sample-v21-sub/`)

| PNG | Page | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| 01 | T1 | 8 | 8 | 9 | 8 | PASS |
| 02 | T2 | 8 | 8 | 8 | 8 | PASS |
| 03 | T2b | 8 | 8 | 8 | 8 | PASS |
| 04 | T3 | 8 | 9 | 9 | 8 | PASS |
| 05 | T4 | 8 | 8 | 8 | 8 | PASS |
| 06 | T5 | 8 | 8 | 8 | 8 | PASS |
| 07 | P0 | 9 | 8 | 8 | 8 | PASS |
| 08 | P1 | 9 | 8 | 9 | 8 | PASS |
| 09 | P2 anchor chart | 9 | 9 | 8 | 9 | PASS |
| 10 | P3 | 9 | 8 | 8 | 9 | PASS |
| 11 | P4a | 9 | 8 | 9 | 9 | PASS |
| 12 | P4b | 9 | **7** | 9 | 9 | FAIL |
| 13 | P5 | 9 | 8 | 8 | 9 | PASS |
| 14 | P6 | 9 | 8 | 8 | 8 | PASS |
| 15 | Key P0 | 9 | 8 | 8 | 8 | PASS |
| 16 | Key P1 | 9 | 8 | 9 | 8 | PASS |
| 17 | Key P2 | 9 | 9 | 8 | 9 | PASS |
| 18 | Key P3 | 9 | 8 | 8 | 9 | PASS |
| 19 | Key P4a | 9 | 8 | 9 | 9 | PASS |
| 20 | Key P4b | 9 | **7** | 9 | 9 | FAIL |
| 21 | Key P5 | 9 | 8 | 8 | 8 | PASS |
| 22 | Key P6 | 9 | 8 | 8 | 8 | PASS |
| 23 | T6 | 9 | 8 | 9 | 8 | PASS |

### 1.3 The V21 document

| Criterion | r1 | r2 | r3 | Pass |
|---|---|---|---|---|
| D1 Fidelity to the site profile | 7 | 8 | **7** | FAIL (R3-1, R3-4) |
| D2 Completeness and self-containment | 7 | 8 | 8 | PASS |
| D3 Decision-rule clarity | 7 | 7 | 8 | PASS |
| D4 Checkability | 7 | 6 | 8 | PASS |

---

## 2. Round-2 defects: closure verified by measurement

| R2 | Status | Evidence |
|---|---|---|
| R2-1 Chart answers hidden | **Closed** | `factStack` now has an `'ink'` state. The add chart shows 10 and 6 in black. E17b gives 0 `.ka` on the chart and its key. |
| R2-2 Subtract chart marks | **Closed** | Panel 1 rings the 2 and the 9 in grey. Panel 5 has the grey carry "1" and a digit strip. E26 passes 5 / 5. |
| R2-3 Subtract P0 bands | **Closed** | My measure finds no subtract-pack cell at 30 % or more. P0 is now a/b, c/d (one fact per cell), e/f/g. |
| R2-4 Last row / twin answers | **Closed as written; new LR-6 breach** | The last rows are edge cases, and no answer repeats on a page. But P4b deals 64 − 38 and 57 − 38 (see R3-2). |
| R2-5 Self-checks | **Closed** | E11 now measures from the border box (§8.9 at line 2503 and E11 agree with the site's `sheetCheck`). E24 reads `data-item` and the embedded pool, and fails when the pool is removed (verified above). |
| R2-6 Chunked trigger | **Closed** | One rule: "≥ 4 routine rows tagged New". E21b checks it. Subtract T1 now says Standard (3 New steps). |
| R2-7 `shape()` | **Closed, with nits** | The recipe takes `lines` (any position), `shade` (a polygon) and `guides`, and Appendix H says guides go on Guided cells only. In the sketch, the guide dots are r = 0.6 mm grey, barely visible (R3-6). |
| R2-8 Appendix I gate | **Closed** | It now says `ws-lesson-check.cjs` is on `…-wip-lessons` and must be merged first. |
| R2-9 Nits | **Mostly closed** | The story now fits on its lines. The T1 materials list no longer wraps. The P5 key draws 42 → 3 tens 12 ones with 1 ten and 7 ones crossed out, but in **black** (R3-5). |

**The two builder claims the coordinator asked me to verify**

1. **"E11 now changes add pages (sum-rule overhang 2.5 mm)."** True, and it costs fidelity (R3-4). Measured on
   `sample-v21/page-11.png`, cell a at 110 dpi:

   | | Rule | Left of "+" ink | Right of the ones digit |
   |---|---|---|---|
   | V21 | 28.6 mm (125–249 px) | 5.1 mm | 3.9 mm |
   | Site (add-within-10 render) | 25.9 mm (131–243 px) | 0.5 mm | 1.4 mm |

   - WDS line 612 draws the rule from the operator track to the ones track, with no overhang.
   - The overhang exists only to pull the left/right gap under 30 %. The site's own stacks sit at about 29 %.

2. **"§8.9 drops the one-Hw allowance."** Correct, and it now matches the site. `sheetCheck` has no allowance: a
   reserved answer row or slot counts as content, and open space under it counts as empty. §8.9 (lines 2503–2512) says
   exactly that.

**The builder's pushback on 2 + 7 / 8 + 2.** **The builder is right.** LR-5 says "a chart example never comes back,
not even turned round". 2 + 7 and 8 + 2 are the chart's 7 + 2 and 2 + 8 turned round, so my round-2 suggestion was
wrong. The same rule also bans what the pack does instead: LR-5 says "No item twice in the packet … Gate: fails on
any exact repeat"; only a turn-around of another page's item is "soft". See R3-1.

---

## 3. Defects in round 3, most severe first

### R3-1 (major): the add exit slip repeats 4 Practice items exactly, which LR-5 forbids

- **Where:**
  - `sample-v21/page-14.png` and `page-22.png`.
  - V21 §9.5, lines 2965–2973 (the "Pool test"), and E24.
- **Observed:** the exit slip is 4 + 3 (P4a f), 3 + 6 (P4b j), 1 + 1 (P4a j) and 3 + 7 (P4a k), all exact repeats.
  V21 allows them: repeats = places dealt − usable pool = 41 − 37 = 4.
- **Expected:** site LR-5 treats any exact repeat as a hard fail. Its stated remedy for a small pool is the soft
  cross-page turn-around, never an exact repeat.
- **Why the soft remedy is not enough here:** add 1–3 within 10 has 39 ordered facts and 2 are forbidden, so 37 places
  is the most the pack can deal. V21 deals 41.
- **Exit-slip cost:** an exit slip made of items the pupil just finished does not show learning.
- **Cost:** C2 −1 on P6 and its key (from 8 to 7); D1 −1 (the rule contradicts LR-5).
- **Fix:**
  - Change the pool test to: "places may never exceed the usable pool. When they would, take whole rows off the last
    Practice page (one-symbol facts: 2 × 4 = 8 is an allowed grid) before any other page."
  - For add 1–3, that makes Practice 2 eight facts (2 × 4) and leaves 4 fresh facts for the exit slip.
  - Delete "exit slip may repeat" and set E24 to "repeats = 0, always".
- **Check:** E24 reports 0 exact repeats on both packs, and every exit item is absent from every other pupil page.

### R3-2 (major): subtract P4b takes 38 away twice

- **Where:**
  - `sample-v21-sub/page-12.png`, items b (64 − 38) and c (57 − 38), and its key.
  - V21 §9.5 says "no near twins" but does not restate LR-6.
- **Observed:** the same number is taken away twice on one page. LR-6: "no number taken away twice on a page, no two
  answers alike", with near twins defined as 51 − 44 / 53 − 45 and 27 − 19 / 77 − 19.
- **On self-containment:** an outside AI reading V21 alone does not know what a "near twin" is.
- **Cost:** C2 −2 on P4b and its key (a pattern the pupil can lean on, and the second item is easier).
- **Fix:**
  - Replace c with an item with a fresh subtrahend, e.g. 57 − 28 = 29.
  - Copy LR-6 into §9.5 word for word, with its two examples and the add version (no first addend three times in a
    row).
  - Add the test to E24b: per page, distinct subtrahends; no near twins (both numbers within 2 of another item's).
- **Check:** E24b fails the current P4b and passes the fixed one.

### R3-3 (major): add P0 item a is now 8 triangles in one row

- **Where:** `sample-v21/page-07.png` cell a, and the P0 key.
- **Observed:** 8 triangles in a single line with no 5-group. V21 §19.3 says counters go in "rows of ≤ 5". The site's
  warm-up draws 5 + 4. This looks like a change made to shrink cell a for the band measure.
- **Cost:** C2 −1 on P0 and its key ("counts countable": 8 in a row invites miscounting), C4 −1.
- **Fix:**
  - Use `counters({n: 8, perRow: 5})` (5 + 3).
  - Give cell a the height it needs (the flex weight for the count picture) and take the height from cell d, the
    bond, which now has 22 % top and bottom bands.
- **Check:**
  - New check E27: every `counters` drawing has rows of ≤ 5.
  - The P0 bands stay under 30 % on my measure.

### R3-4 (minor): the sum rule overhangs to beat the band measure

- **Where:** Appendix A `.stk .rule { margin: 1mm -2.5mm 0 }` (line 5648), on every add stack page.
- **Observed:** measurements as in section 2. The rule sticks out 5.1 mm beyond the "+".
- **Expected:** WDS draws the rule from the operator track to the ones track. The site rule starts at the "+".
- **Cost:** C4 −1 on add P3, P4a, P4b and their keys (still 8); D1 nit.
- **Fix:** remove the overhang and use the site's stack geometry instead: rule width about 26 mm, "+" at the rule's
  left end. At 61.5 mm cells that gives side bands of about 29 %, which is what the site passes with. If E11 then
  flags centred stacks, record the site precedent in §8.9 ("a centred stack in a cell ≤ 62 mm wide is measured as the
  site's").
- **Check:** the rule's left edge sits within 1 mm of the "+" ink, and E11 passes.

### R3-5 (minor): the subtract P5 key draws the pupil's picture in black

- **Where:** `sample-v21-sub/page-21.png`, `Workspace:` quick-draw.
- **Observed:** the sticks, dots and cross-outs are black. Only the stack is in #C2410C.
- **Expected:** §8.12.7: "drawings: the marks the pupil would add, in key colour".
- **Cost:** C4 −1 (8).
- **Fix:** give `quickDraw` a `key` flag (stroke `var(--key)`, `data-ka`).
- **Check:** E3 shows the quick-draw's paints are #C2410C on the key.

### R3-6 (minor): `shape()` guide dots are too small

- **Where:** Appendix D `shape()` (line 6341), `r="0.6"`. The recipe sketch, bottom-left panel.
- **Observed:** a grey dot 1.2 mm across. At print scale it is barely visible, so as a hint it does not help.
- **Fix:** `r = 1.25` (2.5 mm, the same as the vocabulary match dots), still grey and on Guided cells only.
- **Check:** look at a printed sketch.

### R3-7 (minor, D2): no key or model hands on the clock

- **Where:** Appendix D `clock({h, m, D, hands})`.
- **Observed:** this came up in the build test (section 4). There is no way to draw the hands in the key colour (a
  draw-the-hands key) or in grey (the anchor chart's newest mark).
- **Fix:** add `handsState: 'ink' | 'grey' | 'key'` and `show: 'both' | 'hour' | 'minute'`.
- **Check:** the build test in section 4 needs no guess.

---

## 4. Self-containment: building lessons neither pack covers

**Partition a shape into halves (K–2)**
- **Now buildable:**
  - pictures: `shape()` with lines, `shade` and `guides`; the minimum size (42 mm, 3 columns, §19.3);
  - the shapes allowed at K–2 (Appendix H);
  - strings: `partition` and `equal-parts`, with the labels "Equal parts / Not equal parts";
  - keys: the one-line key in the key colour, with "also accept" on T6;
  - layout: a draw cell is exempt from the band rule.
- **Remaining guesses:**
  - how big the guide dots should be (R3-6);
  - whether the shapes in a judge section all take the 1.5 pt `task: 'judge'` outline. In the sketch, the halves are
    drawn at 0.75 pt and the unequal pair at 1.5 pt, which hints at the answer. Add a rule: "every shape in a section
    takes the same `task`".

**Tell time to the half hour (Level 1, 1.MD.B.3)**
- **Buildable:**
  - the clock recipe at 50 mm, max 3 columns;
  - the time slot (two 20 × 12 mm boxes with a colon);
  - the `time-write` / `time-draw` strings;
  - the oral frame "The time is __.";
  - the contrast line "the long hand shows minutes …";
  - prerequisite ids via Appendix H.
- **Guesses:**
  - draw-the-hands keys and grey model hands on the chart (R3-7);
  - whether "half past" wording or "3:30" is the answer form. Add one line to Appendix H: "time answers are written in
    the digital slot; 'half past' is said in the oral frame only".

---

## 5. What would raise each criterion to 10

- **Pages:**
  - R3-1: no exact repeats; Practice 2 at 2 × 4.
  - R3-2: distinct subtrahends.
  - R3-3: counters in rows of 5.
  - R3-4: the site's stack geometry.
  - R3-5: the key drawing in the key colour.
  - The add P4a row "4 + 1, 4 + 2, 4 + 3" reads as a drill sequence; spread the first addends (LR-6 `distinctFirst`).
- **D1:** R3-1 and R3-4. Restate LR-5 and LR-6 in full.
- **D2:** R3-7 and the time-answer rule.
- **D3:** "places never exceed the usable pool" (R3-1); "one `task` per section" (section 4).
- **D4:**
  - E24b covers LR-6 (subtrahends, near twins, first addends);
  - E27: counter rows of ≤ 5;
  - the pool should be computed from the declared pool rule, not only listed. Today E24 checks the items against a
    pool the builder writes. It cannot tell if that pool is wrong. The sub pool of 2025 pairs, 1017 of them
    "edge", is accepted as given.
