# Critic round 10: Wave 2 tagging of Y2 (Grade 1) and Y3 (Grade 2)

Critic run on 2026-10-16 against `data/curriculum/links/Y2.json` and `Y3.json` at commit c5ec6855 (HEAD 35c4f65, the
merge with the latest base), branch `claude/sweet-newton-c8wrv1-wip-wrm-tag-y2-y3`. I did not edit the tagging data or
the build tooling.

## Verdict: FAIL

| Year | Steps graded | Mean | Random 20 | Hard 5 | Round-9 sevens | Round 9 mean |
|---|---|---|---|---|---|---|
| Y2 | 31 | **7.94** | 7.95 | 7.80 | 8.00 (6) | 7.81 |
| Y3 | 32 | **7.97** | 8.00 | 7.80 | 8.00 (7) | 7.78 |

| Gate | Result |
|---|---|
| Every graded step ≥ 8 | **No.** Three sevens: Y2.B4.S1, Y2.B2.S20, Y3.B1.S4 |
| Both sample means ≥ 8 | **No** (7.94 / 7.97) |
| Five-year merge simulation (R + Y1 + Y2 + Y3 + Y4), 0 problems | **No: 2 problems**, one real conflict (§4) |
| Build reproducible | **Yes.** Two builds of each year are byte-identical to each other and to the committed JSON (§1) |

Score distribution:
- **Y2:** 8 ×29 · 7 ×2
- **Y3:** 8 ×31 · 7 ×1

All 13 round-9 sevens now score 8, and every row of the r9 fix table is in the output (§2). The round is close. What is
left:
- two new generator mechanisms:
  - **N8:** the new lower-rung chooser picks a sibling rung, and its "this step's skill as it was met then" why is asserted when the content differs;
  - **N9:** prior-year rungs lose their opts, so K rungs are dropped;
- one isolated missing building block (Y2.B2.S20);
- one cross-lane merge conflict with the passed Y4 file.

## 1. Build reproducibility and the lane's own gates

| Check | Result |
|---|---|
| `git archive HEAD` to scratch; `build.mjs Y2 --dropped` and `build.mjs Y3 --dropped`, run twice | Exit 0 every time. Run 1 = run 2 = committed `Y2.json` / `Y3.json`, byte for byte (`cmp`) |
| Build log | `mergecheck Y2: 0 problems`, `mergecheck Y3: 0 problems`. No `NOTECHECK`, `COREDROP` or `COUNTCHECK` line. Counts: Y2 124 steps (63 full / 36 partial / 25 gap), Y3 134 (49 / 55 / 30). They match both reports |
| `linkscan.mjs Y2 Y3` (week mode) | `OK`. The column check is now role-aware: pre at TOL 0, related at TOL 2 (l.45–46). This is r9 A6 |
| `mergecheck23.mjs Y2 Y3` | 0 + 0 problems (130 and 140 tags) |

## 2. The r9 fix table, row by row

Each row was checked on fresh seeds (§6), reading the generated items.

### A (generator)

| r9 row | Result |
|---|---|
| A1 / N6 lower rungs carry opts | **Landed within the lane's own years.** All 8 rows of the r9 N6 table now have the rung. Two new defects come with it: N8 (the chooser takes the *latest* rung, not the nearest building block) and N9 (Y1 rungs are still dropped) |
| A2 / N5a `seq_N` | **Landed.** `seq_10` survives only with "counting on in 10s from any number" whys (Y2.B1.S15 rel, Y2.B2.S13 pre, Y3.B4.S1 rel), and each is true: 2 of 40 items are on multiples. Every "Count in Ns" link is `count_by_tables {start:'zero'}`. `skip_count_line {step:[0], band:50}` (Y2.B1.S15 rel) lands on multiples in 40 of 40 items |
| A3 / N5b `share_into_groups` | **Landed.** All 46 links say "making equal groups (grouping)" or cite Y1.B9.S8 grouping. None cites a sharing title |
| A4 / N7 merge clauses | **Landed.** `mergecheck23` asserts clause, verdict and step coverage. My independent merge agrees for Y2/Y3 alone. Y3.B3.S5 is partial with no direct |
| A5 / N1 notes by key + opts | **Landed.** `notes.mjs` re-reads all 22 empty-related notes against the later-taught block steps by key + effective opts. None is false. Y2.B7.S1 cites "rule 19" for a related (rule 19 governs pre), which is wording only |
| A6 linkscan role-aware | **Landed** |

### B (step rows)

| r9 row | Result |
|---|---|
| Y3.B3.S5 | **Landed.** `share_into_groups {band:12}` is partial with the grouping clause |
| Y3.B1.S3 | **Landed.** The lead pre is the number line to 100; related is `{span:100, band:1000}` |
| Y3.B1.S10 | **Landed.** Lead pre is `place_on_number_line {span:10, band:100}` (S3, the same week), then 100s from 0 |
| Y3.B1.S11 | **Landed.** The number-line pre is there, and `compare_groups` is dropped |
| Y2.B1.S11 | **Landed.** The number line leads, and `seq_10` is gone |
| Y2.B1.S16 | **Landed.** `count_by_tables {2,5,10 from 0}` cites S15 |
| Y2.B5.S15 | **Landed.** `mult_facts {10}` and `count_by_tables {10}` |
| seq_N swaps (43 links) | **Landed** (A2) |
| Y3.B4.S1 | **Landed.** `mult_facts {constant:[10]}` leads. The 50s rung's why is false (N8) |
| Y3.B3.S8 | **Landed.** `mult_facts {2,5,10}` leads, citing the W11 list |
| 36 share whys | **Landed** |
| Y3.B8.S4 | **Landed.** `div_facts {2,3,4,5}` leads, and `shade_fraction` is dropped |
| Y3.B7.S4 | **Landed.** `length_metric {forms:[1]}` and `unit_form {band:999}`; the 0–100 line is gone |
| Y2.B7.S8 / S4 | **Landed.** `mult_facts` and `div_facts {2,5,10}` |
| Y2.B7.S2 / S3 | **Landed.** Related `mass_volume_liquid {forms:[0]}`, citing S6 (W36) |
| Y2.B10.S7 | **Landed** (the note path r9 offered). The note names totals to 200; the 2s/5s/10s-from-0 pre is added |
| Y3.B4.S9 | **Landed.** `div_remainders {constant:[2,3,4,5,8]}` deals 16 each. 12 of 80 dividends are 1-digit (9 ÷ 2), which is minor. `div_facts {3,4,8}` is pre |
| Y3.B11.S6 | **Landed** (the "S3, the same week" option) |

## 3. New defects

### N8 (systematic): the rung chooser picks the latest rung, and calls it "this step's skill"

**Mechanism.** `build.mjs` l.238–244 takes, for each direct key, the *latest* earlier-taught step that deals the key with other opts. It then writes "X (taught earlier): this step's skill as it was met then". There are 52 such links (`asmet.mjs`):
- Most are true lower rungs: the band 99 → 999 rung, the bills before bills and coins, ×4 before ×8.
- Where the key is a container skill (`count_by_tables`, `mass_volume_liquid`), the latest rung is often a **sibling**, not a building block, and the why is false.

**Cases where the why is false:**
- **Y3.B1.S4 Hundreds (W1).**
  - The lead pre is `count_by_tables {step:5}` "Y2.B5.S15 The 5 times-table (Grade 1): this step's skill as it was met then".
  - Counting in 5s is not a building block of counting in 100s.
  - The true rung, counting in 10s from 0 (Y2.B1.S15 / Y2.B5.S13; ten 10s = 100), is absent because the W26 5s rung is "later" than the W4 10s rung.
- **Y3.B4.S1:** `count_by_tables {step:50}` (Y3.B1.S14) is called "this step's skill" for a 10s step.
- **Y3.B3.S8:** `count_by_tables {step:10}` is called "this step's skill" for the 3s.
- **Y2.B5.S13 The 10 times-table:** the lead count is `{3, 5}` "counting in equal steps from 0 … Y2.B1.S16 Count in 3s".
- **Y2.B7.S6 / B7.S7, Y3.B7.S7 / B7.S8:** a g/kg scale is called "this step's skill as it was met then" on a mL/L step.
- **Y3.B7.S1–S3:** the reverse, an mL scale on a mass step. The why says "a scale in mL", which is partly honest.

**Same skill, same opts.** Two pres are the step's own partial skill with the same effective opts:
- Y3.B2.S8 `sub_50_regroup {band:50}`;
- Y2.B1.S11 and Y3.B1.S3 `place_on_number_line {span:10, band:100}`. These are `{}` = defaults, so they are the same items.

The citations are true (met in Grade 1), and the partial clause names the gap, so these are acceptable. They add no rung.

### N9 (systematic): prior-year rungs lose their opts, so K rungs are dropped

**Mechanism.**
- `stepOptsFor()` reads an earlier step's opts from `overrides.mjs` or from the live `SKILL_WRM` tags.
- For Y1 steps neither carries opts, because the passed R/Y1 lane's `Y1.json` is not read.
- A K rung whose key equals a Y2 direct therefore arrives as `{}`, and `isDirectPre` drops it as "the step itself".

**Scale.** `n9.mjs` lists 34 xlsx-listed K rungs dropped this way on 19 Y2 steps. The one that breaks a graded step:

**Y2.B4.S1 Count money – pence (W32).**
- The xlsx W32 list names K "Recognise coins", "Recognise notes" and "Count in coins".
- In the passed `Y1.json` these are `coin_value {usd}`, `money_count {usd, kind:'note', band:100}` + `coin_value {task:'order'}`, and `money_count {usd, kind:'like', band:50, values:[1,5,10]}`.
- None reaches the pre. Its 3 pre are a 2s/5s/10s count, `count_objects` and `add_three`.
- The main building block (rules 12 and 14), counting coins of one kind within 50, is missing.

Other affected steps, ungraded and likely 7s:
- Y2.B8.S4 Find a half: no K `halve {band:10}`;
- Y2.B2.S21 Missing number problems: no K `cloze_addition {range:20}`.

### Isolated

**Y2.B2.S20 Compare number sentences (W11, gap).**
- The pre holds 8 add/sub fact skills and no comparison with <, > or =.
- Y2.B1.S13 Compare numbers (`placevalue:compare {band:99}`, W4) is the step's main building block: the pupil writes the same signs between two sentences.
- The cap of 8 pushed it out (rule 14).

### Cross-lane merge conflict (§4)

The passed Y4 file carries a tagFix on a Y2 step that `Y2.json` does not list.

## 4. Independent merge simulation (R + Y1 + Y2 + Y3 + Y4)

**Method** (`mergeall.mjs`):
- Every lane's tagFixes are applied in sequence to one copy of the live `SKILL_WRM`, using one rule that reads all three lane vocabularies:
  - remove: drop the entry;
  - partial: the clause is `t.partial ?? t.why`;
  - add: partial if it has a `partial` field or a "partial: " why, else full;
  - full: set full;
  - opts: no-op.
- After all five merges, every year's steps must equal its file: each direct FULL, each partial PARTIAL with the file's clause, nothing extra, and step coverage = verdict.
- The check also covers fixes on another year's steps, the same tag fixed by two lanes, non-live keys, `build` ids missing from `proposals`, and proposal id clashes across lanes.

**Result: 660 tags checked, 2 problems.** The result is the same with the order reversed.

```
Y4: fix on another year's step patterns:count_by_step_up|Y2.B1.S15
Y2: EXTRA patterns:count_by_step_up|Y2.B1.S15
```

**The conflict.**
- The Y4 lane (critic r12/r13) adds `count_by_step_up {step:[0]}` to Y2.B1.S15 as a **partial**, with the clause "counts on in 2s, 5s and 10s from any number (381, 386 …), not the multiples from 0; answers pass 100 even at Max Number 100 (to 190)".
- I re-generated it (150 items each, at Max Number 100 and with no Max Number). Steps 2 / 5 / 10 come out 49 / 50 / 51, items start anywhere (84, 114, 134 …), and the maximum is 190. **The clause is true.**
- `Y2.json` does not list this partial, so after the merge `SKILL_WRM` carries a Y2.B1.S15 tag that the links file does not have.
- The step stays full (the direct is `count_by_tables`), so coverage is not wrong, but the merged tags and the file disagree.

**Vocabulary hazard.** If a lead runs another lane's checker verbatim on Y2/Y3, it reports false problems:
- R/Y1's `mergecheck.mjs`: **24 problems** (Y2 11, Y3 13). That checker reads `add` as full, so the 11 `add` + "partial: X" fixes become full, and 3 `add`s on partial tags lack "drop the partial flag".
- Y4's `mergecheck.mjs`: **102 problems** (42 + 60). It reads the clause from a `partial` field, which Y2/Y3 never set.

The data is right under the universal rule, but three lanes now use three tagFix shapes.

## 5. Structure (re-run)

| Check | Result |
|---|---|
| Pre ≥ 3; caps of 8 | Pass, Y2 and Y3 |
| Every partial/gap step has a `build`; no own `build` in `preBuild` | Pass |
| Same key + effective opts in pre and related | 0 |
| Duplicate link within a role | 0 |
| Empty related list without a note | 0. All 22 notes are true by key + opts |
| `seq_N` cited as a count from 0 | 0 |
| School weeks | The xlsx re-dump gives Grade 1 197 rows and Grade 2 219 rows, as in r9. Every Y2/Y3 step maps to a week |

## 6. Method

**Seeds.** All are fresh; none is used in r1–r9 or in `markers.mjs`.

| Use | Seeds |
|---|---|
| Items, print path via `generateQuestionFor` | `53117+199i` ×30, `71249+181i` ×30, `88001+227i` ×20. D/P links use 40 items; pre/related use 16 (80 for the targeted counts) |
| Grading sample | `random.Random(101981)` (Y2) and `random.Random(101982)` (Y3), over all steps minus the r9 sevens and my hard 5 |

**Scripts** are in `/tmp/claude-0/-home-user-MathQuest/d4e794bd-d4af-593d-954b-51cf10298bc4/scratchpad/r10/`:
- `lib.mjs`: weeks, effective opts, generator;
- `scan.mjs`: `seq_N`, share whys, self-duplicates, same-key rungs, structure;
- `notes.mjs`;
- `asmet.mjs`: N8;
- `n9.mjs`;
- `mergeall.mjs`;
- `dump.mjs` / `show.mjs`;
- `tree/`: the HEAD archive used for the two rebuilds, plus the R/Y1 and Y4 mergecheck copies.

## 7. The sample

### Y2 (Grade 1): mean 7.94

Random 20 from `random.Random(101981)`: B10.S2 B2.S6 B4.S3 B5.S13 B1.S6 B5.S3 B5.S9 B9.S3 B2.S4 B9.S2 B9.S6 B3.S11 B8.S15 B8.S1 B8.S13 B3.S6 B1.S8 B5.S6 B2.S20 B1.S12.

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Hard 5** | | | |
| B1.S15 Count in 2s, 5s, 10s (W4) | full | 8 | Related links are true (multiples 40/40; `seq_10` "from any number"). The Y4 cross-lane partial is missing from the file (§4: merge fix, not content) |
| B8.S8 Find a third (W31) | partial | 8 | 3 pre. `compare_groups` "equal or not equal" is true (26/80 "same" items) |
| B7.S6 Measure in mL (W36) | full | 8 | Minor N8: the g/kg scale is called "this step's skill" |
| B8.S10 Unit fractions (W18) | partial | 8 | Honest clauses (families) |
| B4.S1 Count money – pence (W32) | full | **7** | N9: none of the three K money lessons on the W32 list is a pre. Counting coins of one kind (`money_count {like, band:50, values:[1,5,10]}`) is missing |
| **Round-9 sevens** | | | |
| B1.S16 Count in 3s | full | **8** | The 2s/5s/10s-from-0 rung leads |
| B5.S15 The 5 times-table | full | **8** | ×10 and 10s from 0 |
| B7.S2 Measure in grams | partial | **8** | The mL related link is added |
| B7.S8 Four operations, capacity | gap | **8** | ×/÷ by 2, 5, 10 pre |
| B1.S11 Estimate on a number line | partial | **8** | The number line leads. It equals the partial (N8, acceptable) |
| B10.S7 Pictograms 2, 5, 10 | full | **8** | The note names totals to 200; the count pre is added |
| **Random 20** | | | |
| B10.S2 Tables | gap | 8 | |
| B2.S6 Add by making 10 | full | 8 | |
| B4.S3 Count dollars and cents | full | 8 | The bill rung is added |
| B5.S13 The 10 times-table | full | 8 | Minor N8: the lead count is {3, 5} |
| B1.S6 Numbers to 100 in words | full | 8 | |
| B5.S3 Add equal groups | full | 8 | |
| B5.S9 The 2 times-table | full | 8 | |
| B9.S3 Time past the hour | partial | 8 | |
| B2.S4 Bonds to 100 (tens) | partial | 8 | |
| B9.S2 Quarter past and to | full | 8 | |
| B9.S6 Minutes in an hour | gap | 8 | |
| B3.S11 Sort 3-D shapes | gap | 8 | |
| B8.S15 Count in fractions | gap | 8 | |
| B8.S1 Parts and whole | gap | 8 | |
| B8.S13 Recognise three-quarters | partial | 8 | |
| B3.S6 Complete symmetric shapes | gap | 8 | |
| B1.S8 Expanded form | full | 8 | Minor: related `compare_groups` is not the same idea |
| B5.S6 Use arrays | full | 8 | |
| B2.S20 Compare number sentences (W11) | gap | **7** | The pre has no <, >, = comparison. `placevalue:compare` (Y2.B1.S13, W4) is the main building block (rule 14) |
| B1.S12 Compare objects | partial | 8 | |

### Y3 (Grade 2): mean 7.97

Random 20 from `random.Random(101982)`: B5.S7 B2.S17 B3.S3 B2.S19 B3.S4 B10.S1 B2.S16 B3.S13 B2.S3 B4.S9 B5.S10 B2.S1 B6.S9 B10.S8 B11.S9 B3.S11 B6.S3 B2.S18 B8.S5 B3.S14.

| Step (week) | Verdict | Score | Finding |
|---|---|---|---|
| **Hard 5** | | | |
| B1.S4 Hundreds (W1) | partial | **7** | N8: the lead pre is `count_by_tables {step:5}`, "this step's skill as it was met then". It is a sibling, not a building block. There is no count in 10s from 0 (ten 10s = 100) |
| B2.S8 Subtract 1s across a 10 | partial | 8 | The pre equals the partial (N8, acceptable). The rest are true |
| B1.S3 Number line to 100 | partial | 8 | r9 fix landed |
| B6.S5 Compare non-unit fractions | partial | 8 | The S2 compare rung would deal the same "any two fractions" items, so its absence is acceptable. Minor: related `add_fractions_like` is not the same idea |
| B11.S3 Compare angles | partial | 8 | S2's `identify_angles {}` is a superset of the step's own skill. Turns pre (`shape_positions`) |
| **Round-9 sevens** | | | |
| B1.S11 Estimate to 1,000 | partial | **8** | Number-line pre; padding gone; note true |
| B3.S5 Sharing and grouping | partial | **8** | `share_into_groups` partial; merge coverage partial |
| B1.S10 Number line to 1,000 | partial | **8** | Number line and 100s from 0 pre; note true |
| B4.S1 Multiples of 10 | full | **8** | ×10 leads. Minor N8: the 50s why |
| B8.S4 Unit fractions of a set | partial | **8** | ÷ facts lead |
| B7.S4 Equivalent masses | gap | **8** | m ↔ cm and 1,000 = 10 hundreds |
| B3.S8 The 3 times-table | full | **8** | ×2, 5, 10 lead |
| **Random 20** | | | |
| B5.S7 Compare lengths | gap | 8 | |
| B2.S17 Add 2- and 3-digit | partial | 8 | |
| B3.S3 Multiples of 2 | partial | 8 | |
| B2.S19 Complements to 100 | gap | 8 | |
| B3.S4 Multiples of 5 and 10 | partial | 8 | |
| B10.S1 Roman numerals to 12 | gap | 8 | |
| B2.S16 Subtract across a 100 | partial | 8 | |
| B3.S13 Divide by 8 | full | 8 | |
| B2.S3 Add and subtract 10s | partial | 8 | |
| B4.S9 Divide with remainders | full | 8 | Minor: 12 of 80 dividends are 1-digit |
| B5.S10 What is perimeter | full | 8 | |
| B2.S1 Apply bonds within 10 | partial | 8 | Note true (W9 is the block's last week) |
| B6.S9 Equivalent fractions on a line | partial | 8 | |
| B10.S8 Start and end times | full | 8 | |
| B11.S9 3-D shapes | full | 8 | |
| B3.S11 The 4 times-table | full | 8 | |
| B6.S3 Numerators | full | 8 | |
| B2.S18 Subtract 2-digit from 3-digit | partial | 8 | |
| B8.S5 Non-unit fractions of a set | partial | 8 | |
| B3.S14 The 8 times-table | full | 8 | |

## 8. Fix list

### A. Generator (`tests/scripts/wrm-tagging/build.mjs`, `mergecheck23.mjs`)

1. **N8, the rung chooser** (l.238–244).
   - For `count_by_tables` (and `mult_facts` / `div_facts`), choose the rung whose step or table divides the direct's: 10 for 100, 4 for 8, 2 for 4. Failing that, use the 2/5/10-from-0 rung (Y2.B1.S15). Never use a sibling table (5 for 100, {3, 5} for 10).
   - Write "this step's skill as it was met then" only when the rung deals the same content in a smaller band, fewer forms or the same unit. Otherwise write what the rung deals: "counting in 50s from 0 (W3): every multiple of 50 is a multiple of 10", or "reading a g/kg scale (W35): the same scale reading in another measure".
   - Re-run `asmet.mjs` and read every line.
2. **N9, prior-year rung opts.**
   - In `stepOptsFor()`, read Y1.* opts from the passed R/Y1 lane's `data/curriculum/links/Y1.json` (branch of the R/Y1 lane; a copy is at `/home/user/ref/r-y1/data/curriculum/links/Y1.json`), so a K rung with a direct's key is no longer `{}`.
   - Re-check the 34 rows of `n9.mjs`. These are at least Y2.B4.S1, B8.S4, B2.S21, B2.S13, B5.S11 and B1.S1.
3. **Merge.**
   - (a) Y2.B1.S15: add `patterns:count_by_step_up {step:[0]}` to `partial`, with Y4's clause verbatim: "counts on in 2s, 5s and 10s from any number (381, 386 ...), not the multiples from 0; answers pass 100 even at Max Number 100 (to 190)". Emit the identical tagFix (`action:'add'`, `partial:` that clause), so whichever lane merges first the tag is the same.
   - (b) Make `mergecheck23` load the other lanes' tagFixes that touch Y2/Y3 steps, so this class is caught by the build.
   - (c) Give every partial-setting tagFix a `partial` field (Y4 shape), keeping `why`. Write a new partial tag as `action:'partial'`, not `add` + "partial: ". The R/Y1 and Y4 checkers then agree with yours: 0 under all three models, against 24 and 102 today.

### B. Step fixes

| Step | Fix |
|---|---|
| Y2.B4.S1 | Lead pre `measurement:money_count {currency:'usd', kind:'like', band:50, values:[1,5,10]}` "Y1.B13.S4 Count in coins (K, on the W32 list): counting coins of one kind". Then `money_count {currency:'usd', kind:'note', band:100}` "Y1.B13.S3 Recognise notes (K)" (A2 does this automatically) |
| Y2.B2.S20 | Lead pre `placevalue:compare {band:99}` "Y2.B1.S13 comparing with <, > and = (W4): the same signs, now between two sentences" |
| Y3.B1.S4 | Replace the lead `count_by_tables {rows:[{step:5,…}]}` with `count_by_tables {rows:[{step:10, start:'zero', dir:'up'}]}` "Y2.B1.S15 / Y2.B5.S13 counting in 10s from 0 (Grade 1): ten 10s make 100". Add `composing:base10_build {band:99}` "Y2.B1.S2 Count objects to 100 by making 10s (W01 list)" |
| Y3.B4.S1, Y3.B3.S8, Y2.B5.S13, Y2.B7.S6/S7, Y3.B7.S1–S3/S7/S8 | Rewrite the N8 whys (A1). For Y2.B5.S13, replace the {3, 5} count with `count_by_tables {2,5,10 from 0}` "Y2.B1.S15" |
| Y2.B8.S4, Y2.B2.S21 (ungraded, N9) | Pre `patterns:halve {band:10, range:10}` "Y1.B10.S4 Find a half of a quantity (K)"; pre `addition:cloze_addition {range:20}` "Y1.B5.S10 Missing number problems (K)" |
| Y2.B1.S15 | Partial `patterns:count_by_step_up {step:[0]}` as in A3a |

### Expected scores

| Fix | Lifts | Steps |
|---|---|---|
| A2 + the Y2.B4.S1 row | 1 seven | Y2.B4.S1 |
| The Y2.B2.S20 row | 1 seven | Y2.B2.S20 |
| A1 + the Y3.B1.S4 row | 1 seven | Y3.B1.S4 |
| A3 | Merge | 0 problems in the five-year merge |

With A and B done, both samples reach 8.0, no graded step is below 8, and the five-year merge reaches 0 problems. The build is already reproducible.
