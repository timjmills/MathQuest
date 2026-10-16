# Y4 (Grade 3) tagging: independent critic, round 13

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-tag-y4` at 6471c269. Data: `data/curriculum/links/Y4.json` (747 pre/related links, 589 unique key + opts + why; 166 tagFixes; 43 full / 65 partial / 21 gap).

Scope:
- every r12 fix on the print path;
- an independent re-implementation of the merge;
- `mergecheck.mjs`, tested against `build.py` with the r12 bug put back;
- reproducibility under several `PYTHONHASHSEED` values;
- a fresh full scan of all 747 links, with every unique `why` read against its items;
- grades for the 39 touched steps plus a random 15.

Scratch: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-critic-y4-r13/`. All seeds are new:

| Seeds | Scripts | What they do |
|---|---|---|
| `9917003 + 223i`, 150 items a link | `samp.mjs` → `s/*.txt` | The 15 changed links on the print path: options, payload, visual and hint |
| `6620039 + 241i`, 150 items, all 747 links | `own13.mjs` → `own13.out`, `own13.json`; `slim13.txt` | Every own10–own12 check, and the 589 unique whys with 3 item shapes each |
| `3300017 + 251i`, 150 items per direct/partial | `stepdump.mjs` → `dump_touched.txt`, `dump_rand.txt` | The graded steps' own direct and partial skills |
| — | `msim.mjs`; `bld/` (scratch `build.py`, `build_revA.py`, `build_revB.py`); `data/` (fresh `keys.json`, `prior.json`) | The merge simulation, the bug-restored builds and the hash-seed builds |

Seeds used before (none reused): tagger `9100+17i`, `777+53i`, `31337+101i`, `4242+29i`, `61+7i`, `424243+59i`; r8 `50021+97i`, `31337+71i`; r9 `271828+163i`, `160001+37i`; r10 `600011+211i`; r11 `7300013+173i`, `913337+131i`; r12 `8810071+197i`, `1203611+149i`, `5550017+211i`.

## Verdict: PASS

- Every graded step scores 9 (39 touched, mean 9.00; random 15, mean 9.00).
- There is no systematic class.
- There are 0 isolated misfits.

All three r12 classes (N, B, R) and the four isolated cites are closed on fresh seeds. My own merge simulation reproduces every Y4 verdict and clause. The build is byte-identical under 8 hash seeds. The items in §6 are minor and do not count.

## 1. The r12 fixes on the print path (seeds 9917003 + 223i, 150 items a link)

| Fix | Link | Generated | Fit |
|---|---|---|---|
| R B2.S9 | partial `estimate_sums_diffs {place:1000, task:'reasonable'}` | 150 of 150 are two 4-digit numbers. **55 of 150** true sums pass 9,999 (max 18,959), and shown answers reach 160,610 | The clause is exact. The r12 figures (56; 174,380) came from r12's seeds |
| R B2.S9 | partial `estimate_sums_diffs {place:100}` | Rounding to the nearest 100, numbers ≤ 999, rounded sums to 2,000 | Exact. Verdict `partial`, the missing clause is the step's, and `estimate_within_10k` is not yet an option (schema: `place`, `task` only) |
| B B8.S2, B8.S8 | partial `f_to_d {denoms:[5]}` | 90 conversions (denominators 5: 29, 10: 31, 100: 30) and **60** drag-bin sorts with tiles such as 50%, 25%, 0.75, 3/12, 2/8 and 5/10. On stepdump's seeds the sorts are **49** | The clause is exact in substance. The count is per seed set (§6) |
| B B9.S8 | partial `f_to_d {denoms:[2]}` | 96 bin sorts (stepdump: 90), 54 conversions (halves 17, quarters 37) | Exact, and "85–101 of 150" covers both seed sets |
| B proposal | `f_to_d_one_item` | `f_to_d`'s schema has only `_p12Denoms`. `_dragOrNot` exists on `d_to_f`, `f_to_p` and `p_to_f` only | Not yet built. It closes the bin-sort clause on all three steps |
| Isolated 1 | Y2.B1.S15 hand tagFix `count_by_step_up {step:[0]}` | At Max Number 100: steps 2/5/10 = 41/46/63. Answers reach 200, and 99 of 150 keep every answer on a multiple | It is now `add` + `partial`, and the clause is true ("to 190" was r12's maximum). B1.S3's label says it is a partial tag |
| Isolated 2 | B1.S8 pre `value {band:999}` → "Y3.B1.S8 Hundreds, tens and ones" | 3-digit place values, max 976 | Exact. Tagged (note band 999). No later Y4 step is named |
| Isolated 3 | B5.S2 pre `mult_facts {constant:[10], band:100}` → "Y2.B5.S13 The 10 times-table" | 10 × 0 … 10 × 10 | Exact. Tagged (note constant 10) |
| Isolated 4 | B6.S1 pre `place_value_10x {op:'x', power:[100], band:10000}` → "Y4.B5.S4 Multiply by 100 (wk W17)" | 150 of 150 are × 100; max 9,900 | Exact. Tagged (note × 100) |
| Minor | B1.S3, B8.S7 `hundreds_chart_fill` "1–100 chart (Y1.B6.S1 and Y1.B12.S1 …)" | Windows: 67 entirely ≤ 50, 47 entirely > 50, max 100 | Exact. Both steps are tagged |
| Minor | `seq_10` @100 / @1000 → "Y1.B9.S2 Count in 10s (…; counting on in 10s from any number)" | Every item steps by exactly 10 (+10 arrows; tiles 10 apart); few start on a multiple | Exact |
| Minor | `seq_5` @100 → "Y1.B9.S3 Count in 5s (…; from any number)" | The same, in 5s | Exact |
| Minor | B1.S7, B9.S4 `unit_form {band:999, rename:'more'}` → "Y3.B1.S6 Partition numbers to 1,000" (sorted tie-break) | "5 hundreds 16 tens = ___", "187 = ___ tens 7 ones" | Exact. Tagged (note band 999) |
| Minor | B3.S2, B14.S4 related `perimeter_grid {forms:[0,1]}` | 102 rectangles and 48 L-shapes, every item "Count the outside edges"; 0 written sides | "counting edges" / "counted square by square" are now true |
| Minor | B6.S3 pre `perimeter_grid {}` dropped | 3 pre remain: `perimeter_intro`, `area_unit_squares`, `count_objects` | Rule 15 is met |

## 2. Independent merge simulation (`msim.mjs`)

I wrote this from the wrm.js header, not from `build.py` or `mergecheck.mjs`.

**How it reads `SKILL_WRM`.**
- A string or `{step, note}` is full.
- `{step, partial}` is partial.
- It also flags duplicate entries.

**How it applies the 166 tagFixes, in order:**
- `add` appends, as partial when it carries a clause;
- `full` makes the tag full;
- `partial` replaces the clause;
- `remove` drops the tag;
- `opts` keeps the status.

**What it checks.**
- Every tagFix key is a live skill and every step exists.
- No pair is listed twice.
- Each action is legal against the before-state: no `add` on an existing tag, no `remove`, `opts` or `partial` on an untagged one, no no-op `full`, no no-op `partial`.
- Each `why` agrees with the before-state: "tagged partial", "tagged full", "not tagged yet" and "re-tag as FULL".
- After the merge, every Y4 direct is full and every Y4 partial is partial. Where one key has two partial entries (B2.S9), its clause is the two Y4.json clauses joined with "; ".
- Nothing else is still tagged to a Y4 step.
- Each step's verdict agrees with its direct, partial and build lists.

**Result: 175 Y4 direct/partial tags, 166 tagFixes, 0 problems.**

Transitions: 68 full→full, 19 new→full, 26 new→partial, 43 full→partial, 1 partial→full, and 18 partial→partial with a new clause. The out-of-year fix is Y2.B1.S15 `count_by_step_up`: untagged before, partial after.

Every one of the 29 `partial` actions reads true against its items (§1, §5). They are:
- the 10 covers r12 found left full;
- the 18 clause replacements, including B6.S7 `perimeter_grid`, which now carries "every side length is given …; no side has to be found first";
- B2.S9.

**`mergecheck.mjs` on the committed file:** OK, 0 problems, the same 175 / 166.

**Would it have caught r12's bug?** I ran a scratch copy of `build.py` (fresh `keys.json` / `prior.json`, output redirected) with the fix reverted.

| Build | `build.py` internal merge check | `mergecheck.mjs` | `msim.mjs` |
|---|---|---|---|
| Committed | OK | OK (0) | OK (0) |
| revB: r12 code (old `cur` line, no partial→partial branch) | FAIL (29 lines) | **FAIL (79)**: all **11** "full after the merge, Y4.json says partial" (r12's 10 plus B2.S9), **18** stale clauses including B6.S7, 33 `full` on full tags, 17 false "tagged partial" whys | FAIL (79) |
| revA: only the old `cur` line reverted | **OK (blind)** | FAIL (50): 33 `full` on full tags, 17 false whys | FAIL (57) |

**Ruling.**
- `mergecheck.mjs` would have caught the r12 bug: every status error and the B6.S7 clause.
- The merge check inside `build.py` is not independent. It derives the before-state from the same `cur` dictionary, so a misreading of `{step, note}` passes it (revA).
- `mergecheck.mjs` is the real guard (minor, §6).

## 3. Reproducibility

I built `build.py` with fresh inputs under `PYTHONHASHSEED` 0, 1, 2, 3, 5, 11, 42 and 1234. All 8 are byte-identical to the committed Y4.json (md5 `ed8096d50a95…`). Each build prints: OK; merge check OK; 30 re-cites; 166 tagFixes.

The regenerated `keys.json` and `prior.json` are byte-identical to the tagger's.

## 4. Fresh full scan (own13, seeds 6620039 + 241i, 747 links × 150)

`own13.mjs` is own12 with new seeds, so it keeps every own10–own12 check. Its hits are only the false positives ruled in earlier rounds:

| Hit | Ruled |
|---|---|
| 100 ÷10 on B5.S6, and 1 ÷100 on B6.S2 | r11 §3 |
| The old own11 count regex on the five `seq_10` / `seq_5` links | r12 §3. own12's widened read at 90% finds **0** |
| 3 related links that name the next Y4 step (B7.S1, B7.S12, B8.S2) | Rule 5 allows them |

**B1.S8's later-step hit is gone.** Everything else is clear, as in r12.

**Every unique why read against its items** (`slim13.txt`, 589 entries; 11 are new since r12):
- All 11 new whys are exact (§1).
- None of the other 578 cites a title its items do not deal, or names content the pupil has not met by the step's school week.
- The B8.S1–S3 "prior learning wk W30" labels are the r7 ruling: the steps first appear in W29 and repeat in W30.

## 5. Scores (rules 18–19 and step honesty; the r5–r12 scale)

| Score | When |
|---|---|
| 9 | Clean |
| 8 | One related link misfits, a `why` overclaims or cites a title the link never deals, one false or incomplete partial clause, or one wrong tagFix for the step |
| 7 | A pre link misfits in content, the step's own verdict or missing clause is wrong, or two or more misfits |

**Touched (39): mean 9.00, every step 9.**

The touched set is the 19 steps whose links, verdict or clauses changed, plus the steps whose tagFix status or clause changed:

| | Steps |
|---|---|
| Block 1 | B1.S3, B1.S4, B1.S7, B1.S8, B1.S9 |
| Block 2 | B2.S1, B2.S8, B2.S9 |
| Block 3 | B3.S2, B3.S3 |
| Block 4 | B4.S6, B4.S12 |
| Block 5 | B5.S2, B5.S3, B5.S4, B5.S7, B5.S8, B5.S15 |
| Block 6 | B6.S1, B6.S2, B6.S3, B6.S5, B6.S7 |
| Block 7 | B7.S9, B7.S11 |
| Block 8 | B8.S1, B8.S2, B8.S5, B8.S6, B8.S7, B8.S8, B8.S10 |
| Block 9 | B9.S4, B9.S8 |
| Blocks 11–14 | B11.S2, B12.S3, B13.S1, B14.S3, B14.S4 |

The 33 `full → opts` relabels change no status (msim), so they are not graded separately.

On fresh items every direct deals its step. Each partial clause names what its items leave out:
- B1.S8's three partials;
- B2.S9's two;
- B6.S5 L-shapes only;
- B6.S7 every side given;
- B8.S5, S6 and S10: 3-digit dividends;
- B8.S2, S8 and B9.S8: the bin-sort branch.

Every step has at least 3 pre and at least 1 related, and no key appears in both.

**Random 15 (Python `random.seed(20261313)`, from the 90 untouched steps): mean 9.00, every step 9.**

B1.S2, B1.S6, B1.S15, B1.S17, B2.S3, B2.S4, B2.S6, B4.S3, B4.S10, B5.S9, B7.S2, B8.S9, B10.S5, B11.S4, B13.S2.

Spot reads:
- B1.S17 `rounding_table` 9,754 → 9,750 / 9,800 / 10,000;
- B10.S5 `money` USD with cents to $19.90;
- B4.S3 and B4.S10 hold to one table;
- B2.S3, S4 and S6 stay partial because the exchange count is mixed (their `exchange_count_*` builds).

## 6. Minor (not counted)

- **The `build.py` merge check shares the derivation's model of `SKILL_WRM`** (§2, revA). Optional: have `build.py` run `mergecheck.mjs`, or compute the before-state with its own reader of the raw entries, so that one misreading cannot pass both.
- **Seed-specific counts in clauses.**
  - B8.S2 and B8.S8 say "49 of 150"; fresh seeds give 49 or 60.
  - B2.S9 says "56 of 150"; fresh seeds give 55.
  - The substance is true. Optional wording: "about a third (49–60 of 150)" and "about a third of the items".
- **B8.S5 tagFix why** ("generated 3-digit ÷ 10; …"). It does not say the tag was full with note "÷ 10", unlike its siblings S6 and S10. This is cosmetic.
- **A related link that reuses a direct key with other options.** This happens on B4.S1, B4.S6, B5.S2, B5.S12, B9.S6 and B13.S1. Each is a different ladder step by option, so `build.py` allows it (it compares key + opts). It is unchanged from earlier rounds.

## Fix list

None required. The minor items above are optional.
