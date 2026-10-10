# Critic round 9: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2)

Critic run on 2026-10-10 against `data/curriculum/links/Y2.json` and `Y3.json` at commit 971cfb4f, branch
`claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I did not edit the tagging data.

## Verdict: FAIL

| Year | Steps graded | Mean | Random 20 | Hard 5 | Round-8 sevens | Round 8 mean |
|---|---|---|---|---|---|---|
| Y2 | 31 | **7.81** | 7.85 | 7.40 | 8.00 (6) | 7.79 |
| Y3 | 32 | **7.78** | 7.85 | 7.20 | 8.00 (7) | 7.81 |

Score distribution:
- **Y2:** 8 ×25 · 7 ×6
- **Y3:** 8 ×25 · 7 ×7

No step is below 7. All 13 round-8 sevens now score 8, and every r8 step fix is in the output. The round still fails:
- Both means are below 8.
- There are three new systematic classes and one remainder:
  - **N5:** a cited lesson title the link does not deal ("Count in 5s" on `seq_5`, "sharing" on `share_into_groups`).
  - **N6:** the same-key lower rung is never a pre.
  - **N7:** the tagFix merge leaves 22 stale partial clauses and one step-level verdict mismatch.
  - **N1 remainder:** some empty-related notes still say something untrue.

## 1. The tagger's round-9 claims

| Claim | Check | Result |
|---|---|---|
| The r8 fix table is applied; both files rebuild byte-identical | `git archive HEAD` to scratch; ran `build.mjs Y2 --dropped` and `build.mjs Y3 --dropped` | **True.** Both exit 0, both are byte-identical to the committed files, and there is no `NOTECHECK`, `COREDROP` or error line. Every row of the r8 table is in the output (§2) |
| `notecheck`, `nextscan2`, `labwhy2` at 0 | Re-run | **True** (0, 0, 0 / 0). `nextscan`, `labwhy`, `prewk` and `optcheck` are also 0. But r8's `notecheck` only matches the retired `LATER` sentence. My `notecheck2.mjs` reads every empty-related note and finds the N1 remainder (§3) |
| `dirlink`: 28 deliberate lines | Re-run: **25** lines, not 28. Sample of 10 drawn with `random.Random(90993)` (indices 3 7 8 9 11 12 16 17 19 23), each link generated | **True for all 10 sampled.** The opts deal different content from the direct: vertices vs edges, rows vs groups, ×5 vs ×10, mixed ÷, halves/quarters vs thirds, and the ×4 rung of 2-4-8. The count is off by 3 (minor) |
| `steprange` NEW = exactly the requested links | Re-run, r8 against r9 | **True.** NEW is `mult_facts {5,10}` on Y2.B5.S4/S5 and `count_by_tables {2,5,10}` + `mult_facts {2,5,10}` on Y3.B3.S1/S2. All r8 NEW lines on Y2.B2.S2/S12 and Y3.B1.S3 are GONE |
| whyscan B 125 = correct next-step links | Read all 125 | **True:** 125 related, 0 pre, and each cites a later-taught step |
| whyscan C 94 = all false positives | My run gives 98. Sample of 20 drawn with `random.Random(90991)` (indices 0 6 10 11 12 19 25 26 30 37 49 51 61 64 66 70 73 74 81 91), every line read against 80 items | **False for 4 of the 20** (0, 10, 11, 66). Each is a `seq_N` link whose why names a count from 0 ("the multiples of 10 are the 10s count", "counting 5-cent coins", "the tens on the line"). The skill deals counts from any start: `seq_10 {}` "65, 75, 85" (7 of 80 on multiples), `seq_5 {band:50}` "33, 38, 43" (7 of 80). All 10 `seq_N` lines in C are real. This is class N5 |
| linkscan's column check by school week (TOL 2) | Ran HEAD, r8's file, and a TOL-0 variant on the r9 data | **Consistent with rule 19 in its basis, weaker for pre in its tolerance.** See below |

### The linkscan change: is it consistent with rule 19?

**The switch from WRM order to school week is right.** Rule 19 makes school week the order, and the old check judged by WRM position.

**The 2-week tolerance is a weakening.** It applies to pre links too. Rule 19 says a pre is content the pupil has met by the step's week, and never one earlier, so a pre at W4 or W5 may now carry a column layout that is first taught at W6 (Y2.B2.S15), or a 3-digit column layout that is first taught at W6 (Y3.B2.S11).

**Today the weakening changes one result, and that result is correct:**
- The old check and the TOL-0 variant each flag exactly one link: Y2.B2.S4 (W5) related `add_100_no_regroup`.
- That link is the next step (W6), and r8 asked for it.
- No pre is affected.

**Fix:** make the check role-aware. A pre should be flagged when its step's week is earlier than the first column week (TOL 0), and a related link should keep TOL 2.

## 2. The round-8 fixes on fresh seeds

Every fix was re-checked with 80 items per link (fresh seeds, §5), reading options, payload, visual, `screenInstr` and hint.

| r8 item | Result |
|---|---|
| A1 / N1: per-step notes | **Mostly fixed.** The `LATER` string is gone, and computed notes name their reasons. A remainder of false notes is left (§3, N1) |
| A2 / N2a: rebuild the why after a key swap | Fixed. The half-past whys read "half past: the minute hand makes a half turn" (Y2.B8.S10/S12, B11.S3/S4). The B8.S5/S6 clock links are dropped. Y2.B4.S8 reads "subtracting a price from the bill paid" |
| A3 / N2b: one owner per citation | Fixed: Y3.B6.S2/S5 cite Y3.B6.S9 (W37), and Y3.B3.S13 cites the 8s by its own week. A minor remainder: Y3.B11.S6's lead `identify_angles {forms:[0]}` says "Y3.B11.S3 right angles (W28)". S3 is Compare angles (W29), and Right angles is S2 (W28) |
| A4 / N2c: label whys | Fixed (`compare_groups` "equal or not equal", `hundreds_chart_fill` "the counting order to 100 on a hundred square") |
| A6 / N4a: superset pres | Fixed: Y2.B8.S3/S5/S7/S13 carry halves and quarters only |
| B rows, Y2 | All applied: B5.S2–S5, B2.S4, B5.S14, B5.S16, B2.S2, B2.S12, B4.S8, B8.S1–S13 |
| B rows, Y3 | All applied: B11.S2, B3.S6, B3.S7, B3.S10, B11.S6, B3.S1, B3.S2, B6.S2/S5, B1.S3, B1.S13, B3.S13 |

### Structure (re-run)

| Check | Result |
|---|---|
| Pre ≥ 3 | Pass, Y2 and Y3 |
| Every partial or gap step has a `build`; no own `build` in `preBuild` | Pass |
| Every empty related list has a note | Pass. Whether each note is true is a separate question (N1) |
| Rule 13 short spec (`name`, `kind`, `teaches`, `representation`, `closes` ≠ `teaches`) | Pass |
| Same key in pre and related | 8 pairs: Y2.B5.S1/S4/S5, Y3.B3.S2/S3/S6, Y3.B5.S3. All have disjoint opts, as the tagger states. Acceptable |
| School weeks | I re-dumped the xlsx with openpyxl: Grade 1 has 197 rows and Grade 2 has 219. Both files are byte-identical to r8's dump, and every step week is unchanged |
| Range | `range.mjs` shows only the `order_*` digit-join artifact. It skips graph skills. My `graphrange.mjs` finds one: Y2.B10.S7 (isolated, §3) |
| Response mode | Nothing new beyond what r7 and r8 allowed |
| `vscan` | Only the 3 named `reading_ruler` partials |

## 3. New defects

### N5 (systematic): the cited lesson title is not what the link deals

**a. `seq_2` / `seq_5` / `seq_10` cited as "Count in 2s / 5s / 10s" or "Tens to 100": 43 links on 38 steps** (`seqscan.mjs`).
- These skills count on from any start: `seq_10 {band:50}` "16, 26, 36" (6 of 80 on multiples of 10), `seq_5 {band:50}` (7 of 80), `seq_2` (28 of 80).
- Y1.B9.S1–S3 and Y2.B1.S15 count from 0 on the multiples, which is rule 9.
- The tagger's own overrides say so: `overrides.mjs` l.32 and l.187 record "items start anywhere (23, 33, 43): not multiples of 10", and use this to downgrade the count steps' directs.
- Yet the same keys are kept as the "Count in Ns" pre on every ×/÷ step of Y2.B5, on Y2.B1.S1–S8, S11 and S16, and on Y2.B2.S4, Y2.B4.S1/S8, Y3.B1.S3/S14 and Y3.B4.S1.
- Several whys are plainly false. Y3.B4.S1 Multiples of 10 says "the multiples of 10 are the 10s count". Y2.B1.S11 says "the tens on the line". Y2.B4.S1 says "counting 5-cent coins".
- The true skill is already used elsewhere: `count_by_tables {rows:[{step:N, start:'zero', dir:'up'}]}`.

**b. `share_into_groups` cited as "Make equal groups – sharing": 36 links** (19 citing Y1.B9.S9 on Y2 steps; 16 citing Y2.B5.S8 and 1 citing Y3.B3.S5 on Y3 steps).
- The skill deals grouping only: 80 of 80 items read "There are N counters. Make groups of M. How many groups?", with and without `{band:12}`.
- The tagger tags it **partial** on Y2.B5.S8 Sharing ("sharing into a given number of groups (how many in each)" is missing). The why contradicts that tag.

### N6 (systematic): the same-key lower rung is never a pre

**Mechanism** (`build.mjs`):
- Every automatic candidate (the step before, xlsx prior learning, earlier block steps) calls `cand(k, why, tier)` with no opts.
- So `isDirect` sees `'{}'` and drops any candidate that has the same key as a direct, whatever opts the cited step uses.
- Only hand `pre` / `core` entries carry opts.

**Scale.** `samekey.mjs` lists 85 step/key pairs where an earlier-taught step deals the direct's key with other opts and no pre carries the key. Most have a stand-in. The ones where the main building block (rule 14) is then missing:

| Step (week) | Missing rung | What the pre has instead |
|---|---|---|
| Y2.B1.S11 Estimate on a number line (W3) | Y1.B12.S4 number line to 100 (`place_on_number_line {}`) | No number line at all. `seq_10` is cited as "the tens on the line" (N5) |
| Y3.B1.S3 Number line to 100 (W13) | Y2.B1.S9/S10 `place_on_number_line {span:10, band:100}` | No number line |
| Y3.B1.S10 Number line to 1,000 (W13) | Y3.B1.S3 `place_on_number_line {}` (the same week, earlier in order) and Y2.B1.S10 | 3 pre: count in 50s, order, compare. No number line |
| Y3.B1.S11 Estimate on a number line to 1,000 (W13) | Y3.B1.S10 / S3, and Y2.B1.S11 (the Grade 1 estimate rung) | No number line. `compare_groups` (K "more/fewer groups") pads the list. The note says "the skills that share the idea are taught earlier (pre)", which is false |
| Y2.B1.S16 Count in 3s (W5) | Y2.B1.S15 `count_by_tables {2,5,10}` (W4, the step before) | `seq_2/5/10` from any start (N5) |
| Y2.B5.S15 The 5 times-table (W26) | Y2.B5.S13 `mult_facts {constant:[10]}` (the same week) and the 5s count from 0 | `seq_5` / `seq_10` from any start (N5) |
| Y3.B3.S8 The 3 times-table (W11) | `mult_facts {constant:[2]}` / `{5,10}` (Y2.B5, Grade 1; "The 2 times-table" is on the week's xlsx list) | Doubling, halving and arrays only |
| Y2.B4.S3 Count money – dollars and cents (W32) | Y2.B4.S2 `money_count {kind:'note'}` (counting bills, the same week) | `coin_value` only (minor) |

### N7 (systematic): the tagFix merge leaves stale clauses and one wrong step verdict

**Method.** `mergesim.mjs` applies every Y2/Y3 tagFix to a copy of `SKILL_WRM` and asserts that each skill/step entry equals the links files. The merge rules it uses:
- `remove`: drop the entry;
- `partial`: set the clause;
- `add` with "partial: X": set the partial clause X;
- other `add`: set full.

The fix actions are 19 add, 65 partial and 25 remove; 3 of the adds turn a partial into full.

**Findings:**
- **Y4's class N (a `{step, note}` misread as partial) does not occur here.** `build.mjs` l.73 reads `partial: e.partial || null`, so a note entry stays full, and no partial is turned into full by mistake. Every skill/step verdict matches, with no missing or extra entries.
- **One step-level mismatch.** Y3.B3.S5 Sharing and grouping is `partial` in Y3.json, but its `direct` holds `share_into_groups {}`. After the merge that is a full tag, so the coverage gate counts the step as covered. The skill deals grouping only (N5b), and its Y2.B5.S8 tag is partial for exactly this reason. It must be a partial here too.
- **22 partial clauses are never updated.** A partial → partial clause change emits no tagFix, so the old `SKILL_WRM` clause survives. Most are paraphrases. These are false or misleading after the merge:
  - **Y3.B1.S10 `place_on_number_line`**: "a 0-1,000 line (the skill's lines are to 100)". This is false: with `{span:100, band:1000}` it deals "Tap 650".
  - **Y3.B5.S2 and Y3.B11.S4 `reading_ruler`**: "a ruler in millimetres" and "drawing a line …; measuring in mm". Neither says the ruler is in inches.
  - **Y3.B3.S3 and Y3.B3.S4 `multiples`**: neither says that ×6, ×7 and ×9 appear.
  - **Y2.B3.S7 `compose_from_attributes`**: "sorting into labelled groups". It does not say that right angles and parallel sides appear.

### N1 remainder: empty-related notes that are still untrue

Run the build's `NOTECHECK` logic on these notes as well. The causes are:

**Hand `relNote`s bypass `NOTECHECK`:**
- Y3.B4.S9 names only `mult_comparison`.
- Y3.B6.S7 cites "equivalence (W37)" and does not deal with S1/S3 (W26).

**The "already linked here" test is by key, not key + opts:**
- **Y3.B1.S3** says "every later-taught step of the block uses skills already linked here". Y3.B1.S10/S11 (the same week) use `place_on_number_line {span:100, band:1000}`, which is not linked.
- **Y2.B7.S2 / B7.S3** list only S4 and S8 as the later steps. They leave out the later millilitre/litre reading on Y2.B7.S6/S7 (W35–36), the same scale-reading idea, because its key is already linked with `forms:[1]`.

**An unchecked tail sentence:** "the skills that share the idea are taught earlier (pre)" is asserted without checking. It is false on Y3.B1.S11, whose pre has no number line.

### Isolated

- **Y2.B10.S7** Interpret pictograms (W38): direct `pictograph {range:50, scale:[0,1,2]}` deals "in all" totals up to 200 (5 of 80 above 120; rule 7). There is also no count-in-2s/5s/10s pre, although the xlsx lists it first.
- **Y3.B4.S9**: direct `div_remainders {}` rings groups of 6 in 13 of 80 items, with nothing in the verdict, the missing clause or a note to say so. With `{constant:[2,3,4,5,8]}` it deals only 2, 3, 4, 5 and 8 (16 each).
- **Y3.B11.S6**: the citation names the wrong owner and week (§2).
- **Y3.B7.S4** Equivalent masses: there is no `length_metric {forms:[1]}` (m ↔ cm, Y3.B5.S5, W14) as pre or related, although it is the same exchange in another unit.

## 4. Lead-merge risk (tagFix → `SKILL_WRM`), result

| Assertion | Result |
|---|---|
| Every skill/step verdict after the merge equals Y2.json / Y3.json | **Pass** at entry level (0 VERDICT, 0 MISSING, 0 EXTRA, 0 duplicate fixes) |
| Every step's coverage after the merge equals its links verdict | **1 fail:** Y3.B3.S5 (partial in links, full after the merge) |
| Partial clauses after the merge equal the links' clauses | **22 differ.** At least 6 are false or misleading (N7) |

The Y4 mechanism (a `{step, note}` read as partial) is not present in this lane's `build.mjs`.

## 5. Method

**Seeds.** All are fresh: none appears in `markers.mjs` or in r1–r8. r8 used `40127+233i`, `26693+157i`, `83311+263i` and `random.Random(80881/80882/80883)`.

| Use | Seeds |
|---|---|
| Items, 80 per link, print path via `generateQuestionFor` | `47123+211i` ×30, `61403+173i` ×30, `92821+241i` ×20 (`whyscan` and `steprange` use the first 40) |
| Grading sample | `random.Random(90981)` (Y2) and `random.Random(90982)` (Y3), over all steps minus my hard 5 and r8's sevens |
| whyscan C sample | `random.Random(90991)` |
| dirlink sample | `random.Random(90993)` |

**Scripts** are in `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y2y3-r9/`:
- the r8 scripts, re-seeded;
- new in r9:
  - `notecheck2.mjs`: every empty-related note against the later block steps, by key + opts;
  - `samekey.mjs`: missing same-key rungs;
  - `seqscan.mjs`: the share of `seq_N` items on multiples, against each why;
  - `graphrange.mjs`;
  - `mergesim.mjs`;
  - `kinds.mjs`, `grp.mjs`, `divs.mjs`, `ansdist.mjs`: item-kind counts;
  - `links9.mjs`, `ctx9.mjs`;
- `tree/`: the HEAD archive used for the rebuild, plus the `linkscan-old` and `linkscan-strict` variants.

## 6. The sample

### Y2 (Grade 1): mean 7.81

Random 20 from `random.Random(90981)`: B2.S13 B4.S3 B7.S9 B3.S3 B1.S14 B3.S1 B7.S5 B8.S9 B2.S17 B3.S7 B7.S8 B1.S11 B4.S5 B10.S7 B3.S2 B3.S12 B8.S3 B5.S9 B9.S1 B9.S3.

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Hard 5** | | | |
| B1.S16 Count in 3s (W5) | full | **7** | N5 + N6: its 2s/5s/10s pres count from any start. The true 2s/5s/10s count (Y2.B1.S15, the step before) is excluded |
| B5.S15 The 5 times-table (W26) | full | **7** | N5 + N6: no ×10 (the same week) and no 5s count from 0. `seq_5` deals "33, 38, 43" |
| B7.S2 Measure in grams (W34) | partial | **7** | N1: the note lists S4 and S8 only. The mL/L scale reading (S6/S7) is left out by the key-level test |
| B8.S14 Find three-quarters (W38) | partial | 8 | 3 pre, true. The related quarter-to why is true |
| B5.S16 Divide by 5 (W31) | full | 8 | ×5 leads (r8 fix). Minor N5 (`seq_5`/`seq_10`) |
| **Round-8 sevens** | | | |
| B5.S4 × symbol | full | **8** | ×5/×10 pre; 2 times-table related |
| B8.S12 Half = two quarters | partial | **8** | Half-turn why |
| B2.S4 Bonds to 100, tens | partial | **8** | Next steps related |
| B4.S8 Make a dollar | partial | **8** | Lead why true. Minor N5 (`seq_10`) |
| B5.S5 Multiplication sentences | full | **8** | |
| B8.S7 Recognise a third | full | **8** | Halves and quarters only. Minor N5b sharing why |
| **Random 20** | | | |
| B2.S13 10 more, 10 less | full | 8 | `seq_10` "counting on and back in 10s" is true here |
| B4.S3 Count dollars and cents | full | 8 | Minor N6 (bill counting S2 missing) |
| B7.S9 Temperature | full | 8 | |
| B3.S3 Count vertices 2-D | full | 8 | |
| B1.S14 Order objects and numbers | partial | 8 | |
| B3.S1 Recognise 2-D and 3-D | full | 8 | Computed note true |
| B7.S5 Compare capacity | gap | 8 | Minor: the jug-scale number line pre and the halves/quarters related are weak for full/empty language |
| B8.S9 Find the whole | gap | 8 | |
| B2.S17 Subtract 2-digit, no exchange | full | 8 | |
| B3.S7 Sort 2-D shapes | partial | 8 | Honest clause. The merged `SKILL_WRM` clause is stale (N7) |
| B7.S8 Four operations, capacity (W36) | gap | **7** | 3 pre, + and − only. No ×/÷ by 2, 5, 10 (W26–31) for "multiplying and dividing capacities" |
| B1.S11 Estimate on a number line (W3) | partial | **7** | N6: no number-line pre. N5: `seq_10` "the tens on the line" |
| B4.S5 Make the same amount | full | 8 | |
| B10.S7 Pictograms 2, 5, 10 (W38) | full | **7** | Totals to 200 (rule 7). No count-in-steps pre, although the xlsx lists it |
| B3.S2 Count sides | full | 8 | |
| B3.S12 Shape patterns | partial | 8 | |
| B8.S3 Recognise a half | full | 8 | |
| B5.S9 The 2 times-table | full | 8 | Minor N5 (`seq_2`) |
| B9.S1 O'clock and half past | full | 8 | |
| B9.S3 Time past the hour | partial | 8 | |

### Y3 (Grade 2): mean 7.78

Random 20 from `random.Random(90982)`: B5.S7 B1.S1 B4.S2 B11.S8 B10.S8 B8.S4 B8.S3 B2.S13 B2.S20 B4.S6 B7.S6 B5.S9 B7.S7 B10.S12 B2.S8 B7.S4 B12.S3 B3.S8 B10.S9 B4.S5.

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Hard 5** | | | |
| B1.S11 Estimate to 1,000 (W13) | partial | **7** | N6: no number-line pre. `compare_groups` padding. The note's "(pre)" claim is false |
| B4.S9 Divide with remainders (W32) | full | 8 | Minor: the direct rings groups of 6 (13 of 80) unnamed; the pre facts are ÷2 only; N5b why; the hand note is incomplete |
| B3.S5 Sharing and grouping (W30) | partial | **7** | A direct (full) `share_into_groups` that deals grouping only. After the merge the step is counted as covered (N7) |
| B1.S10 Number line to 1,000 (W13) | partial | **7** | N6: no number-line pre. N1: the note is false by key + opts |
| B4.S1 Multiples of 10 (W9) | full | **7** | 3 pre. The lead `seq_10` why "the multiples of 10 are the 10s count" is false (7 of 80). There is no ×10 table (Y2.B5.S13) |
| **Round-8 sevens** | | | |
| B11.S2 Right angles | partial | **8** | `identify_lines` related |
| B3.S6 Multiply by 3 | full | **8** | Counting in 3s leads |
| B11.S6 Parallel and perpendicular | full | **8** | Right angle first. Minor citation (S3 for S2) |
| B6.S2 Compare unit fractions | partial | **8** | Cites S9, W37 |
| B3.S2 Use arrays | full | **8** | Padding gone |
| B1.S13 Order to 1,000 | full | **8** | Number line related; the note is gone |
| B3.S7 Divide by 3 | full | **8** | ×3 and counting in 3s lead |
| **Random 20** | | | |
| B5.S7 Compare lengths | gap | 8 | |
| B1.S1 Represent to 100 | full | 8 | |
| B4.S2 Related calculations | partial | 8 | |
| B11.S8 Draw polygons | gap | 8 | |
| B10.S8 Start and end times | full | 8 | |
| B8.S4 Unit fractions of a set (W38) | partial | **7** | No ÷ facts (1/3 of 12 = 12 ÷ 3). The share why is false (N5b). The lead pre is the eighths-dealing `shade_fraction {denoms:[2]}` |
| B8.S3 Partition the whole | gap | 8 | |
| B2.S13 Add across a 10 | partial | 8 | |
| B2.S20 Estimate answers | partial | 8 | |
| B4.S6 Link × and ÷ | partial | 8 | Computed note true |
| B7.S6 Add and subtract mass | gap | 8 | |
| B5.S9 Subtract lengths | gap | 8 | |
| B7.S7 Capacity in mL | full | 8 | Minor N6 (Use scales, W34, is excluded) |
| B10.S12 Problems with time | full | 8 | |
| B2.S8 Subtract 1s across 10 | partial | 8 | Minor N6 (Y2.B2.S12) |
| B7.S4 Equivalent masses (W35) | gap | **7** | 3 weak pre (heavier/lighter pictures, a 0–100 line). No m ↔ cm exchange (Y3.B5.S5) and no 1,000 = 10 hundreds |
| B12.S3 Interpret bar charts | full | 8 | |
| B3.S8 The 3 times-table (W11) | full | **7** | N6: no 2, 5 or 10 table, although "The 2 times-table" is on the week's xlsx list. Only doubling and arrays |
| B10.S9 Use durations | full | 8 | |
| B4.S5 2-digit × 1-digit, exchange | partial | 8 | |

## 7. Fix list (skill, opts, step)

### A. Generator (`tests/scripts/wrm-tagging/build.mjs`, `overrides.mjs`, `linkscan.mjs`)

1. **N6: carry the cited step's opts on automatic candidates.**
   - For the step before, xlsx prior and earlier block steps, call `cand(k, why, tier, stepOptsFor(x.id, k))`. `isDirectPre` then compares real opts, and a lower rung survives.
   - Then re-check the steps in the N6 table.
2. **N5a: `seq_N` is never a "Count in Ns" pre.**
   - Where the why or cited title is Y1.B9.S1–S3, Y1.B12.S2 or Y2.B1.S15, link `multiplication:count_by_tables {rows:[{step:N, start:'zero', dir:'up'}]}`.
   - Keep `seq_N` only with a "counting on in Ns from any number" why (Y2.B1.S15 related, Y2.B2.S13).
   - Add the check to the build: a link citing "Count in Ns" or "Tens to 100" must deal ≥ 90% of its items on multiples of N from 0.
3. **N5b: `share_into_groups` whys.**
   - Cite the grouping step (Y1.B9.S8 / Y2.B5.S7, "making equal groups: ring the counters in groups of M"), never a sharing title.
   - Add a `whyText` for the key so the label cannot come back.
4. **N7: emit a clause fix.**
   - When a skill is partial in both `SKILL_WRM` and the links but the clauses differ, emit `{action:'partial', why:<links clause>}`.
   - Add `mergesim.mjs`'s assertion (merged entries, clauses and step coverage = links) as a build check.
5. **N1: run `NOTECHECK` on hand `relNote`s too.**
   - Make "already linked here" a key + opts test.
   - Drop the unchecked tail "(the skills that share the idea are taught earlier (pre))", or check it.
6. **linkscan:** make the column check role-aware. Pre at TOL 0 (step week ≥ first column week); related at TOL 2.

### B. Step fixes

| Step | Fix |
|---|---|
| Y3.B3.S5 | Move `division:share_into_groups {band:12}` from direct to partial, with the clause "grouping only (make groups of M, how many groups); sharing into a given number of groups is not dealt". The verdict stays partial; the merged coverage then matches |
| Y3.B1.S3 | Lead pre `number_sense:place_on_number_line {span:10, band:100}` "Y2.B1.S10 tens and ones on the number line to 100". Related `place_on_number_line {span:100, band:1000}` "Y3.B1.S10 number line to 1,000 (the same week, W13)". Rewrite the note |
| Y3.B1.S10 | Lead pre `place_on_number_line {}` "Y3.B1.S3 number line to 100 (the same week, W13)", then `{span:10, band:100}` (Y2.B1.S10), and `count_by_tables {rows:[{step:100,start:'zero',dir:'up'}]}` "Y3.B1.S4 counting in 100s" |
| Y3.B1.S11 | Lead pre `place_on_number_line {}` (Y3.B1.S3) and `{span:10, band:100}` "Y2.B1.S11 estimating on a line to 100". Drop `comparing:compare_groups`. Rewrite the note |
| Y2.B1.S11 | Lead pre `place_on_number_line {}` "Y1.B12.S4 The number line to 100". Swap `seq_10 {band:50}` for `count_by_tables {rows:[{step:10,start:'zero',dir:'up'}]}` "Y1.B12.S2 counting in 10s: the tens on the line" |
| Y2.B1.S16 | Replace `seq_2/5/10 {band:50}` with `count_by_tables {rows:[{step:2,…},{step:5,…},{step:10,…}]}` "Y2.B1.S15 counting in 2s, 5s and 10s from 0 (W4, the step before)" |
| Y2.B5.S15 | Pre `mult_facts {constant:[10]}` "Y2.B5.S13 the 10 times-table (the same week, W26): 5 × 4 is half of 10 × 4". Swap `seq_5` / `seq_10` for `count_by_tables {rows:[{step:5,…}]}` / `{step:10}` |
| Y2.B5.S2–S17, Y2.B1.S1–S8, Y2.B2.S4, Y2.B4.S1, Y2.B4.S8, Y3.B1.S3, Y3.B1.S14 | The same `seq_N` → `count_by_tables {step:N, from 0}` swap wherever the why cites "Count in Ns" or "Tens to 100" (43 links, `seqscan.mjs`) |
| Y3.B4.S1 | Replace `seq_10 {}` with `multiplication:mult_facts {constant:[10]}` "Y2.B5.S13 the 10 times-table (Grade 1): 7 × 10 = 70" |
| Y3.B3.S8 | Pre `multiplication:mult_facts {constant:[2]}` "Y2.B5.S9 the 2 times-table (Grade 1, on the W11 list)" and `{constant:[5,10]}` "Y2.B5.S13/S15", ahead of doubling |
| 36 `share_into_groups` pre links (Y2 and Y3) | Why: "Y1.B9.S8 / Y2.B5.S7 making equal groups (grouping): ring the counters in groups" |
| Y3.B8.S4 | Pre `division:div_facts {constant:[2,3,4,5]}` "Y2.B5.S10–S16 / Y3.B3.S7–S10 dividing by the table: 1/3 of 12 is 12 ÷ 3" as lead. Drop `shade_fraction {denoms:[2]}` or move it last |
| Y3.B7.S4 | Pre `measurement:length_metric {forms:[1]}` "Y3.B5.S5 m ↔ cm (W14): the same exchange in another unit", and `placevalue:unit_form {band:999}` "Y3.B1.S8 1,000 = 10 hundreds". Drop the 0–100 number line |
| Y2.B7.S8 (and its mass twin Y2.B7.S4) | Pre `multiplication:mult_facts {constant:[2,5,10]}` "Y2.B5 the 2, 5 and 10 tables (W26–29)" and `division:div_facts {constant:[2,5,10]}` "Y2.B5.S10–S16 dividing by 2, 5 and 10 (W30–31)" |
| Y2.B7.S2, Y2.B7.S3 | Related `measurement:mass_volume_liquid {forms:[0]}` "Y2.B7.S6/S7 reading a millilitre or litre scale (a later step, W35–36): the same scale reading" |
| Y2.B10.S7 | Add the clause or a note on totals to 200 (`pictograph` has no total cap: an option proposal), or make it partial. Add pre `count_by_tables {rows:[{step:2,…},{step:5,…},{step:10,…}]}` "Y1.B9.S1–S3 counting in 2s, 5s and 10s: reading a key" |
| Y3.B4.S9 | Direct `division:div_remainders {constant:[2,3,4,5,8]}` (deals 2, 3, 4, 5, 8 only, 16 each). Add pre `division:div_facts {constant:[3,4,8]}` "Y3.B3.S7/S10/S13 (W31)" |
| Y3.B11.S6 | Lead why "Y3.B11.S2 right angles (W28)" with `identify_angles {}` (S2's own opts), or keep `{forms:[0]}` citing "Y3.B11.S3 (the same week, W29)" |
| Merge clauses (N7) | Emit `partial` fixes for the 22 listed clauses, at least Y3.B1.S10, Y3.B5.S2, Y3.B11.S4, Y3.B3.S3, Y3.B3.S4, Y2.B3.S7 |

### Expected scores

| Fix | Lifts | Steps |
|---|---|---|
| A1 + A2 + the N6/N5 rows | 9 sevens | Y2.B1.S16, B5.S15, B1.S11; Y3.B1.S10, B1.S11, B4.S1, B3.S8, B8.S4 (with A3), B10.S7 (Y2) |
| A4 + the Y3.B3.S5 row | 1 seven | Y3.B3.S5 |
| A5 + the B7.S2 row | 1 seven | Y2.B7.S2 |
| The step rows | 2 sevens | Y2.B7.S8; Y3.B7.S4 |

With A and B done, both samples reach 8.0 with no step below 8. N5, N6 and N7 are generator mechanisms: fix them at the source, then re-run `seqscan`, `samekey` and `mergesim` to 0.
