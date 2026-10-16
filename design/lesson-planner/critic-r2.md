# Atomisation Lesson Planner V21 — independent critic, round 2

Critic: Opus, medium effort, 2026-10-16. I graded the work cold at `74570e45`.

**Verdict: FAIL.** The document and most pages are now close. Eight page versions still score below 8, and so do two
of the document's four criteria.

**What I read and looked at**
- **The V21 document:** all 7,296 lines of `Atomisation_Lesson_Planner_V21.md`.
- **Both sample packs**, 23 PNGs each, all at full size:
  - `sample-v21/` (add 1–3)
  - `sample-v21-sub/` (subtract within 100 with regrouping)
- **The site's passed lessons**, for comparison: `design/lesson-samples/subtract-2-digit-regroup/` and the add-within-10
  render from round 1.

**What I measured, independently of the builder's self-check**
- **H13 empty bands.** I ran the site's own `sheetCheck` logic from `ws-lesson-samples.cjs` on both `pack.html` files
  (scratch script `meas.cjs`). It measures each cell's border box, and answer slots count as content.
- **The item pool.** I pulled every item out of the rendered `pack.html` and listed repeats and turn-arounds myself,
  because `pool.json` was deleted.
- **Andika.** I checked the two woff2 hashes against `css/fonts/`. Both match V21 §8.2.
- **Kit references.** I checked every file and function name that Appendix I points to.

---

## 1. Grades

Each page is scored on the four RUBRIC criteria:
- **C1**: ease of use
- **C2**: educational value
- **C3**: spacing and layout
- **C4**: standard fidelity

A version passes only when all four are 8 or more and no hard cap applies.

### 1.1 Pack A: add 1–3 (`sample-v21/`)

| PNG | Page | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| 01 | T1 | 9 | 8 | 9 | 9 | PASS |
| 02 | T2 | 8 | 8 | 8 | 8 | PASS |
| 03 | T2b | 8 | 8 | 9 | 8 | PASS |
| 04 | T3 | 8 | 9 | 9 | 8 | PASS |
| 05 | T4 | 8 | 8 | 8 | 8 | PASS |
| 06 | T5 | 8 | 8 | 9 | 8 | PASS |
| 07 | P0 | 9 | 8 | 8 | 9 | PASS |
| 08 | P1 | 9 | 8 | 9 | 8 | PASS |
| 09 | P2 anchor chart | 9 | **6** | 8 | **7** | FAIL |
| 10 | P3 | 9 | 9 | 8 | 9 | PASS |
| 11 | P4a | 9 | 9 | 9 | 9 | PASS |
| 12 | P4b | 9 | 9 | 9 | 9 | PASS |
| 13 | P5 | 9 | 8 | 8 | 9 | PASS |
| 14 | P6 | 9 | 8 | 8 | 8 | PASS |
| 15 | Key P0 | 9 | 8 | 8 | 9 | PASS |
| 16 | Key P1 | 9 | 8 | 9 | 8 | PASS |
| 17 | Key P2 | 9 | **7** | 8 | **7** | FAIL |
| 18 | Key P3 | 9 | 9 | 8 | 9 | PASS |
| 19–20 | Keys P4a / P4b | 9 | 9 | 9 | 9 | PASS |
| 21 | Key P5 | 9 | 8 | 8 | 9 | PASS |
| 22 | Key P6 | 9 | 8 | 8 | 8 | PASS |
| 23 | T6 | 9 | 8 | 9 | 8 | PASS |

### 1.2 Pack B: subtract within 100 with regrouping (`sample-v21-sub/`)

| PNG | Page | C1 | C2 | C3 | C4 | Caps | Pass |
|---|---|---|---|---|---|---|---|
| 01 | T1 | 8 | 8 | 8 | 8 | — | PASS |
| 02 | T2 | 8 | 8 | 8 | 8 | — | PASS |
| 03 | T2b | 8 | 8 | 8 | 8 | — | PASS |
| 04 | T3 | 8 | 9 | 9 | 8 | — | PASS |
| 05 | T4 | 8 | 8 | 8 | 8 | — | PASS |
| 06 | T5 | 8 | 8 | 8 | 8 | — | PASS |
| 07 | P0 | 9 | 8 | **6** | 8 | H13 | FAIL |
| 08 | P1 | 9 | 8 | 9 | 8 | — | PASS |
| 09 | P2 anchor chart | 9 | **7** | 8 | 8 | — | FAIL |
| 10 | P3 | 9 | 8 | 8 | 9 | — | PASS |
| 11 | P4a | 9 | 8 | 9 | 9 | — | PASS |
| 12 | P4b | 9 | **7** | 9 | 9 | — | FAIL |
| 13 | P5 | 8 | 8 | 8 | 9 | — | PASS |
| 14 | P6 | 9 | 8 | 8 | 8 | — | PASS |
| 15 | Key P0 | 9 | 8 | **6** | 8 | H13 | FAIL |
| 16 | Key P1 | 9 | 8 | 9 | 8 | — | PASS |
| 17 | Key P2 | 9 | **7** | 8 | 8 | — | FAIL |
| 18 | Key P3 | 9 | 8 | 8 | 9 | — | PASS |
| 19 | Key P4a | 9 | 8 | 9 | 9 | — | PASS |
| 20 | Key P4b | 9 | **7** | 9 | 9 | — | FAIL |
| 21 | Key P5 | 9 | 8 | 8 | 9 | — | PASS |
| 22 | Key P6 | 9 | 8 | 8 | 8 | — | PASS |
| 23 | T6 | 9 | 8 | 9 | 8 | — | PASS |

### 1.3 The V21 document

| Criterion | Round 1 | Round 2 | Pass |
|---|---|---|---|
| D1 Fidelity to the site profile | 7 | 8 | PASS |
| D2 Completeness and self-containment | 7 | 8 | PASS |
| D3 Decision-rule clarity | 7 | **7** | FAIL |
| D4 Checkability | 7 | **6** | FAIL |

**What passes.**
- The Practice pages of both packs equal the site's gold standard, and so do the pack B lesson sheet and its
  practice keys.
- The H13 measure, with answers counted as content, is fine everywhere except pack B P0 (R2-3).
- Both packs use only the five allowed colours.
- The stale V20 passages are gone: a grep for TRY THIS, SHOW WORK, FINAL ANS, "in red", "steps pre-filled" and
  "PRINTED on student" returns nothing.
- PG-5 is corrected to 271 × 186 mm.
- The Andika release and hashes are verified.
- Appendix H closes most of the round-1 guesses.

---

## 2. Status of the round-1 defects, measured rather than taken from the builder's table

| R1 | Status | Evidence |
|---|---|---|
| R1-1 P3 empty bands | **Closed** | Pack A P3 key: Independent cells' bottom band 13 %, Guided cells under 30 %. Score `/6`. |
| R1-2 Exit slip lone item | **Closed** | 2 × 2 per half. Cells 65.6 × 58.5 mm; key bands under 30 %. |
| R1-3 Exit item misses the critical atom | **Closed** | b = 3 + 6 (big number second, count 3); T5 names the mistake each item catches. |
| R1-4 T2 off-spec | **Closed** | Pack A has 8 atoms and pack B 7, all with V21 type names; no ★ in the tables. |
| R1-5 Thumbnails | **Closed** | T3 1, T4 2, T5 1 in both packs. The rule is now "≥ 1 per delivery page", which is realistic. |
| R1-6 Fade labels | **Closed** on T6 and the Note lines. In pack B the labels are wrong in two rows (R2-4). |
| R1-7 Stale V20 bodies | **Closed** | The grep returns 0 lines. |
| R1-8 H13 rule | **Rule text closed, check not.** | §8.9 now caps the open space at one Hw (10 mm). E11 still measures from the padding box, not the border box the site measures (R2-5). |
| R1-9 RCDWS panel | **Closed** | 6 rows, one action each, all on one line. |
| R1-10 T2b half empty | **Closed** | 95 % (pack A) and 93 % (pack B) used, footer reads "Print once per unit". |
| R1-11 Turn-around rule | **Rule closed, applied loosely.** | My own extraction: 0 exact repeats outside the exit slip and 0 turn-arounds on any one page in both packs. But the pack A exit slip repeats **4** Practice items (4 + 3, 3 + 6, 1 + 1, 3 + 7) while 2 + 7 and 8 + 2 are never used, so only 2 repeats were needed. The rule says repeats are allowed "only when the pool is exhausted", but `poolCheck` hard-codes `mayRepeat: true` for the exit slip. |
| R1-12 Guided cells varied | **Closed** | 6 + 2 (the chart's case, step 1 grey), 1 + 7, 2 + 2. |
| R1-13 Other examples in black | **Regressed (R2-1)** | The label is fixed, but the answers are now **missing** from the pupil chart. |
| R1-14 Chart key | **Closed**, but the key now shows the answers that are missing from the chart (R2-1). |
| R1-15 Mixed title | **Closed** | E19 and §9.5. |
| R1-16 Geometry | **Closed** | Halves 132.5 mm, landscape live area 271 × 186 mm. |
| R1-17 Teacher nits | **Closed** | Total aligned; loop label on one line; blank drawn as a rule; header gap normal. |
| R1-18 P1 wrap | **Closed** | |
| R1-19 Hard recipes | **Closed** | `columnStackSub` and pack B exist, and pack B is close to the site's passed sample. |
| G1–G10 | **Closed or acceptable** | H covers lesson ids, the horizontal fit test, new icons, the Score rule, the partition strings, many-answer keys and the extra slot shapes. §19.3 now holds every WDS 11.2 row plus `shape()`. Font hashes are verified. Paths come from argv. |

---

## 3. Defects, most severe first

Each defect gives where it is, what I observed against what is expected, what it costs, the fix and the check that
proves the fix.

### R2-1 (major): the pack A anchor chart hides the answers of its other examples

- **Where:**
  - `sample-v21/page-09.png`, the `Another example:` band.
  - V21 Appendix D `factStack`, lines 6232–6243.
  - The Appendix G call at line 6814 passes `state: 'ink'`.
- **Observed:**
  - 2 + 8 and 3 + 3 show a sum rule with nothing under it.
  - `factStack` has no `'ink'` state, so `wrap()` emits `<span class="ka">`, which `.pupil .ka { display:none }`
    hides.
  - The chart key (page-17) then paints 10 and 6 in #C2410C, as if the poster had slots.
- **Expected:**
  - V21 §9.3: "drawn **all in black** with every step done … No slots".
  - The site chart shows the other example completed.
- **Cost:** C2 −3 on P2 and −2 on its key (a model left unfinished on the board copy); C4 −2 / −2 (it contradicts the
  spec and the site).
- **Fix:** in `factStack`, use

  ```js
  const wrap = (x) => (!x.trim() ? '' : state === 'traced' ? `<span class="g">${x}</span>`
    : state === 'ink' ? `<span>${x}</span>` : `<span class="ka">${x}</span>`);
  ```

  Document the states as `'blank' | 'traced' | 'ink' | key`. Re-render pack A.
- **Check:**
  - The chart shows 10 and 6 in black.
  - New check E17b: "the anchor chart and its key have 0 `.ka` / `data-ka` elements".
  - The self-check's by-eye line "other examples all in black" must only be ticked after looking.

### R2-2 (major): the pack B anchor chart is missing two teaching marks the site chart has

- **Where:** `sample-v21-sub/page-09.png`, panels 1 and 5. Compare `design/lesson-samples/subtract-2-digit-regroup/pupil-p1.png`.
- **Observed:**
  - **Panel 1** ("Look at the ones.") is the bare problem with an empty strip. The step adds no mark.
  - The site's panel 1 rings the 2 and the 9 in grey (the newest mark).
  - **Panel 5** ("Check: add back.") shows 13 + 39 = 52 with no carry box. The site shows the grey carry "1" in a
    regroup box over the tens, and the answer in a digit strip.
- **Expected:** §9.3 and §8.12.5: each panel shows the item in the state its step produces, newest mark grey.
- **Cost:** C2 −2 on P2 and its key.
- **Fix:**
  - Give `columnStackSub` a `ring: ['ones']` option (a grey 1 pt ellipse round each ones digit) and use it in
    panel 1.
  - Draw panel 5 with `columnStack({top: 13, bottom: 39, carry: '1'})` in a grey state, with the answer in a digit
    strip.
  - Add to §9.3: "every panel adds at least one grey mark".
- **Check:**
  - New check E26: each step panel has at least one #949494 element that is not in the panel before it.
  - Compare by eye with the site PNG.

### R2-3 (critical, H13): pack B Prerequisite Check cells b and c leave 30–31 % empty bands

- **Where:** `sample-v21-sub/page-07.png` cells b and c, and `page-15.png` cell b. Pack B's `pack.html`
  `data-page="P0"` flex weights.
- **Observed:** with the site's measure (border box, slots counted as content), both cells are 184.9 × 31.4 mm:
  - cell b: top 30 %, bottom 30 %;
  - cell c: top 31 %, bottom 31 %;
  - the key's cell b: 30 % / 30 %.

  The builder's E11 reported "worst top 17 %" because it measures inside the 3 mm padding.
- **Expected:** no band of 30 % or more.
- **Cost:** C3 capped at 6 on P0 and its key.
- **Fix:** set cells b and c to about 26 mm (a 12 mm slot or 28 pt line plus 2 × 3 mm padding plus 4 mm), and give
  the freed 11 mm to cell d (two stacks with T O heads).
- **Check:** the site measure on cells b and c gives under 30 % on both the pupil page and the key.

### R2-4 (minor): pack B Practice breaks the ★★★ last-row rule, and P4b has twin answers

- **Where:**
  - `sample-v21-sub/page-11.png`, `page-12.png`, `page-19.png`, `page-20.png`.
  - T6 rows "Practice 1, e–f ★★★" and "Practice 2, e–f ★★★".
  - V21 §9.5: "The last row holds the edge cases (★★★)".
- **Observed:**
  - **Last rows:** Practice 1 has 85 − 29 and 70 − 44; Practice 2 has 80 − 52 and 57 − 29. Of these, only 70 − 44
    and 80 − 52 are edge cases (0 ones).
  - **Edge cases in other rows:** the one-digit items (72 − 8, 31 − 7) are in row 1, and the tens-0 items
    (41 − 35, 26 − 19) are in row 2.
  - **Twin answers:** P4b e and f both equal **28**, side by side in one row.
  - T6 labels these rows ★★★ anyway.
- **Cost:** C2 −1 on P4a; −2 on P4b and its key.
- **Fix:**
  - Reorder so each page's last row is `[one-digit or tens-0, 0 ones]` (for example Practice 1 e = 72 − 8,
    f = 70 − 44).
  - Replace 57 − 29 with an item whose answer differs from 28 (for example 57 − 38 = 19).
  - Add to §9.5: "no two items on a page share an answer".
- **Check:**
  - New check E24b, run on the extracted items: the last-row items are all edge cases, and no answer repeats on a page.

### R2-5 (major, D4): three self-checks do not measure what they claim

**(a) E11 is not "the site's way".**
- Appendix E (line 6409) says "the 3 mm cell padding is structure, not an empty band", so E11 measures inside the
  padding.
- The site's `sheetCheck` measures from the border box.
- Result: E11 passed pack B P0 at 17 % where the site's measure gives 30–31 % (R2-3).
- **Fix:** measure from `getBoundingClientRect()` of the cell, as `ws-lesson-samples.cjs` does.

**(b) E24 trusts the builder.**
- It reads the builder's own `pool.json`.
- If the file is missing, `{repeats: [], turns: []}` is used and E24 passes with nothing checked (line 6461). That is
  the current state, since `pool.json` was deleted.
- `poolCheck` hard-codes `mayRepeat: true` for the exit slip, so "pool exhausted" is never computed.
- I re-derived E24 from `pack.html`:
  - both packs: 0 repeats outside the exit slip and 0 turn-arounds on any one page;
  - pack A: 2 of the 4 exit repeats were avoidable.
- So deleting `pool.json` does weaken checkability: the published self-check cannot be reproduced and fails open.
- **Fix:**
  - Extract the items from the rendered pupil pages (every `.stk`, `.eq` and `[data-item]` carries
    `data-item="a+b"`).
  - Compute the pool size from the lesson's pool rule.
  - Allow exit repeats only for `max(0, places − poolSize)` items.
  - Fail when no items are found.

**(c) E17 counted 5 "slots" on the anchor chart**, a poster V21 says has none. It passed the bug in R2-1.
- **Fix:** E17b (see R2-1).

- **Check for all three:** re-running the corrected self-check on the current packs flags R2-1, R2-3 and the 2
  avoidable repeats, and passes once they are fixed.

### R2-6 (minor, D3): the Chunked-flow trigger is ambiguous, and pack B applies it against its own wording

- **Where:**
  - V21 line 2222, heading: "4+ New **Atoms**".
  - Line 2229 and the trigger rule at line 2250: "count the new **steps** in the Routine Atomisation table".
  - Pack B: T1 "Flow: Chunked"; T2 "4 new atoms"; T4 split into "two parts (6 + 6)".
- **Observed:**
  - Pack B's routine table has 3 New steps (1, 2, 5); steps 3–4 are tagged Pre-requisite. By the trigger rule that
    means Standard flow.
  - Counting the Section 1 New atoms (3) plus the routine (3) gives no consistent "4" either.
- **Cost:** D3 −1; C4 nit on pack B T1 / T2 / T4 (folded into their 8s).
- **Fix:** one rule in one place: "Chunked when the Routine table has ≥ 4 rows tagged New". State the count on T1
  ("Flow: Chunked (4 new routine steps)"). Then either tag pack B's steps to match or set it to Standard.
- **Check:** new check E21b: the T1 flow word equals what the rule gives from the T2 routine-table tags.

### R2-7 (minor, D2): `shape()` cannot draw the items Appendix H prescribes for partitioning

- **Where:**
  - Appendix D `shape()` (lines 6297–6306).
  - Appendix H, the "partition" bullet.
- **Observed:**
  - `line` is always the vertical midline. There is no off-centre or diagonal line, so the
    `equal-parts` judge items ("Equal parts / Not equal parts") cannot show an *unequal* partition.
  - There is no shading, so "Shade half" on a square or triangle is not possible.
  - Appendix H tells the builder to use `guides: true`. That puts dots at the ends of the correct halving line on
    every item, independent ones included, so it gives the answer away and does not fade.
- **Cost:** D2 −1 (an outside AI building "partition into halves" must invent this); D3 nit.
- **Fix:**
  - Add `line: {x1, y1, x2, y2, state}` (fractions of the box), `parts` and `shade: [part indexes]` to `shape()`.
  - Change H to: "`guides` is a hint scaffold: Guided cells only (grey), none on Independent, Practice or the exit
    slip (§8.12.5)".
- **Check:** a sketch page holds 2 halves, 1 unequal pair and 1 shaded half, rendered from the recipe alone.

### R2-8 (minor, D1): Appendix I points to a gate that is not on this branch

- **Where:** Appendix I, "Gates" row: `ws-lesson-check.cjs` (LR-1…18).
- **Observed:** `tests/scripts/ws-lesson-check.cjs` is not in this tree. It exists only in history on another
  branch (`cf428e41`, `ebcf82e7`).
- Every other file and function Appendix I cites resolves: `resolveSectionLayout`, `blankWidth`, `copyrightLine`,
  `sayBand`, `BAND_LABELS`, `tagKeyAnswers`, `pickExample`, `otherExamples`, `answer-key.js`, `key-short.js`,
  `pre-skill-check.js`, `practice.js`, `mixed-practice.js`, `lessons/prereqs.js`, `compose.js`, `teacher-print.js`.
- **Fix:** say "from `origin/claude/sweet-newton-c8wrv1-wip-lessons`; merge before use", or cite only the gates that
  exist here.
- **Check:** `ls` finds every path Appendix I names.

### R2-9 (minor): small page defects (no score drops below 8 because of these)

1. **Pack B P5 story wrap** (`page-13`): the question wraps, leaving "now?" alone on the next line. The story box is
   about 87 mm wide at 15 pt. Fix: shorten to "How many stickers does Ana have?" (≤ 31 characters), or widen the story
   to 64 %.
2. **Pack B P5 key drawing** (`page-21`): the drawing shows only the answer as a quick-draw (2 sticks, 5 dots). T6
   accepts "any picture of 42 with 17 taken away". Fix: draw 4 sticks and 2 dots, with 1 stick and 7 dots crossed
   out.
3. **Pack B T1 Materials** (`page-01`): "Base-ten rods and cubes (5 rods, 20 cubes a pair)" wraps under the check
   box. Fix: hanging indent `.chk + span { display:block; margin-left: 9.5mm }`, or shorten the text.
4. **Pack B P0 cell c** (`page-07`) holds two items under one letter (CL-7 says one idea per cell). V21 §9.1 now
   allows it. Accepted, but letter them `c.` and `d.`.

---

## 4. Self-containment test: a lesson neither pack covers

**"Compare two 2-digit numbers"** can now be built without guessing:
- the `compare` string and its circle slot;
- the H fit test with 2 × 8 rows at an 18 mm pitch;
- `base10` / `pvChart` for the pictures;
- the compare oral frames and the `<` / `>` contrast line (C.4);
- the new-icon rule for "compare the tens";
- prerequisite ids via H;
- facsimile keys with the sign in the circle.

The one judgement call left: a cell holding both base-ten pictures is about 101 mm wide, which is more than a 93 mm
column. The builder must decide that this makes the item a wide visual (3 full-width rows). Add one line to
§8.12.3: "two pictures side by side wider than a column → full-width rows".

**"Partition a shape into halves"** still needs guesses:
- an unequal-parts drawing, shading, and the fade of the guide dots (R2-7);
- which shapes count as level-appropriate halves: say "rectangle, square and circle; triangle only with a line of
  symmetry";
- a vocabulary mini-diagram for "half" and "equal parts": point to `shape()` with shading.

---

## 5. What would raise each criterion to 10

**Pages**
- R2-1 to R2-4 and the nits in R2-9.
- The pack A exit slip uses 2 + 7 and 8 + 2 before repeating.
- Pack B's chart matches the site's panel 1 rings and panel 5 carry.
- Pack B P0 cells are sized to their content.

**The V21 document**
- **D1:** fix the Appendix I gate path (R2-8). Have E11 measure the border box, as the site does.
- **D2:** the `shape()` options (R2-7); the wide-visual rule (§4); a `factStack` `'ink'` state (R2-1).
- **D3:** one Chunked trigger (R2-6); an exit-repeat rule computed from the pool size; guides fading on partition
  items; "no twin answers on a page".
- **D4:**
  - E11 on the border box;
  - E24 reading items from the rendered pages and failing when none are found;
  - new checks E17b (no `.ka` on the chart), E24b (last row holds the edge cases; no twin answers), E21b (flow
    word) and E26 (every panel adds a grey mark).
  - Keep `pool.json`, or better, drop the dependency, so that anyone can reproduce the check.

## 6. Owner's revised OR-b

The new wording ("as many problems as make sense … according to our design specifications") is written into §8.11
word for word, with the old wording kept for the record. §8.12.1 turns it into the site's per-role ceilings and a
capacity loop.

Both packs are consistent with it:
- pack A: Practice 12 per page (3 × 4 one-symbol facts) and Independent 6;
- pack B: Practice 6 per page (2 × 3 two-digit regrouping, the site's own count), exit 4 per half.

The loop's "too EMPTY → add a row" branch is what fixed R1-1 and R1-2. Accepted.
