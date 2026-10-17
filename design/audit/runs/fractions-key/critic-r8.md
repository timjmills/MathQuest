# Critic round 8: Fraction key, lane adbb61b8450078736 @ d5fa165f

I am the independent critic for this round (2026-10-17, Opus 5.5). I graded fresh renders, screens and runs of head
d5fa165f against RUBRIC.md, WORKSHEET_DESIGN_STANDARD.md, LESSONS_LEARNED.md, the owner rulings and the lead rulings:
- More Practice growth that fills other skills' pages better is accepted.
- Every fraction sum uses whole + fraction boxes.
- Key answers are #C2410C on black structure.
- Stretch and thinking pages are out of scope.
- mixed_composing capacity and the mixed pools' third page (r6 N-3) belong to another lane.

I changed no code. Probes are in `r8/probes/` (new: `rv8.cjs` for Review pages, `bonly.cjs` for a letter requested
alone, `chain8.sh` / `chain8b.sh` the sequential runs). The r7 probes (`r7/probes/mp7.cjs`, `render6.cjs`, `scr7.cjs`,
`fos-tap6.cjs`, `card-stack.cjs`, `falsestack7.cjs`, `formb.cjs`) were re-run unchanged. Logs are in `r8/`, exit codes
in `r8/gates-exit.log`. The base for every comparison is 63fcb6ac (the r7 head), extracted with `git archive`; its logs
are named `*-63fcb6ac.log`. Every browser job ran one at a time.

## Verdict: FAIL

**What passes:**
- **R7-2 is closed.** sub_fractions_like M prints 6 on every seed, Independent and More Practice, with and without letters
  (`r8/mp-ops.log`: 5 seeds × S/M/L × AB/none, every letter equals the no-letters count). "½." stays one run
  (`print/sub_fractions_like-independent-M-s5-pupil-p1.png`).
- **R7-3 is closed on the lane.** No lane Review prints a legacy sibling, and `ws-print-lint --roles review` is OK at S,
  M and L (0 findings, 3 seeds). fraction_of_set's band is now equiv_frac_visual models, add_frac_unlike's is
  mult_frac_whole, and both look intentional (`review/lane-fraction_of_set-review-S-s0-pupil-p1.png`,
  `review/lane-add_frac_unlike-review-M-s1-*.png`).
- **R7-1 is closed for letter A.** Over 90 seed × size cases, A in an A,B request never holds fewer than A alone
  (`r8/mp-fos-seeds.log`). Every r7 case grew: fos_hard M s7 / s16 → 6 + 6 and fos L s8 / s9 A → 6.
- **The Review change is a net gain on other skills.** Of 16 skills outside the lane, 13 improved or stayed the same:
  legacy bands are gone and there are no more lone full-width cells (detail below).
- **Every gate is green**, and the screen is unchanged from r7 and passes.

**What fails:**
1. **R8-1 (major). R7-1 is still open for letter B.** On fraction_of_set L s8 and s9, Practice B of an A,B request
   prints 4 problems in cells with 30–31 % empty bands (H13). The same B requested alone prints 6.
2. **R8-2 (major, out-of-lane pages, caused by this lane's review.js).** Three Review pages got thinner than at r7:
   - frac_word_problems M s1 holds 2 problems with a 23 % bottom strip (it was 3).
   - seq_5 L s1 has a 21 % strip (it was 18 %).
   - add_decimal L dropped from 6 own problems to 3: 40 % of the page is now a fraction band from another category.

## Gates

| Gate | Result |
|---|---|
| `ws-boot-smoke` | **OK** |
| `ws-print-lint --source kit --letters A,B`, 5 lane skills × independent, more-practice, test and review × `--seeds 3`, at S, M and L | **OK**: 60 + 60 + 60 documents, 0 findings |
| the same with `--key-style short`, `--seeds 2`, at S, M and L | **OK**: 40 + 40 + 40 documents, 0 findings |
| `ws-screen-answer --skills` (5 lane skills) | **OK**: count-list (3 of 6), (14 of 16); by-value ok; live green ok |
| `ws-chromebook-fit --skills` (5 lane skills) | **OK** |
| `ws-code-snapshot` | **OK**: 608 codes, 35 categories, +36 appended, nothing moved, 1870 option round trips |
| `ws-content-audit --skill <5 lane skills>,mixed_composing` | **OK** on the r7 form. See N-1: this gate does not actually audit the fraction categories. |

## r7 defects re-proved

| Id | Status | Evidence |
|---|---|---|
| **R7-1**: a letter of A,B holds fewer than the letter alone | **Closed for A; open for B (R8-1)** | `r8/mp-fos-seeds.log` (A, 90 cases), `r8/bonly.log` (B) |
| **R7-2**: sub_fractions_like M orphaned "." and 2-row page | **Closed** | `r8/mp-ops.log`; `print/sub_fractions_like-independent-M-s5-*.png`, `-s13-pupil-p1.png`, `print/sub_fractions_like-more-practice-M-s4024291633-AB-pupil-p1.png` (6 + 6) |
| **R7-3**: Review's Mixed Review prints legacy siblings | **Closed on the lane**; side effects in R8-2 | Review lint OK at S/M/L; `r8/review-lane-head.log` vs `r8/review-lane-base-63fcb6ac.log` |
| Practice B footer "Form B" | **Holds** | `r8/formb.log` |
| r7 probes card-stack, falsestack, fos-tap6, screens | **Identical to r7** | `r8/card-stack.log` matches r7 `card-stack.log` + `card-stack-2.log`; `r8/falsestack.log` = r7 `falsestack7.log`; `r8/tap.log` = r7; `r8/screens.log` = r7 except seeds |

**More Practice on other skills** (`r8/mp-other.log` vs `r7/mp-other.log`, 13 skills × S/M/L × 3 seeds × AB/none):
- 5 of 234 builds changed, and every change is upward: mixed_addition S s2 A 4→6, sub_wp_20 M s0 A 4→6,
  add_fractions_like S s0 A 6→9, and sub_fractions_like M s0/s2 4→6 on both letters.
- There is no new strip, overflow, KEYN or KEYGEO flag.
- The only multi-side letter is mixed_addition S s2 B, which is r6 N-3 (not this lane).
- In `bonly.log`, sub_wp_20 M s0 B and mixed_addition S s2 B hold 4 both in the A,B request and alone. That count is
  their own page's capacity, so it is not R8-1.

### The Review change on other skills (asked by the brief)

`r8/probes/rv8.cjs` builds each Review and measures the printed problems, the Mixed Review band, the rows, the bottom
strip, overflow and the key's cell geometry. It ran on 16 skills outside the lane × S/M/L × 2 seed offsets, on head
(`r8/review-other-head.log`) and on 63fcb6ac (`r8/review-other-base-63fcb6ac.log`). The skills: add_facts,
number_families_add, sub_20_regroup, mult_facts, dot_array_mult, div_facts, equiv_frac_visual, compare (fractions),
mult_frac_whole, frac_word_problems, add_decimal, time_quarter, value, make_ten, seq_5, area_unit_squares.

**Where it is better:**
- **Legacy bands are gone.** add_facts, sub_20_regroup, mult_facts, add_decimal, seq_5 and frac_word_problems all
  printed a legacy band at r7. Their bands are now kit items, or the page is the skill's own problems.
- **Lone full-width cells are gone.** The r7 bands of 1–3 problems in full-width cells are now two to a row:
  - value M: r7 `review/base63-value-review-M-s0-pupil-p1.png` vs head `review/head-value-review-M-s0-pupil-p1.png`;
  - number_families_add 3 → 4;
  - dot_array_mult M s1 5 → 8.
- **mult_facts M is now 12 of its own** (`review/head-mult_facts-review-M-s0-pupil-p1.png`). At r7 it was 9, including
  a 452 px legacy "check by adding" row.

**Looked at:** compare S s0 (12 problems; the fraction_of_set_hard story band reads as a deliberate second section) and
sub_20_regroup M. Both bands look intentional.

**dot_array_mult s1 M findings 19 → 27: verified, its own.** The head page prints 6 of the skill's own legacy dot-array
cells where r7 printed 3. Each one has the clipped Arial caption "ws × 2 colur"
(`review/head-dot_array_mult-review-M-s1-pupil-p1.png` vs `review/base63-…`). The band itself (arrays_groups) is kit
and clean. This is pre-existing legacy (r7 N-4), not a regression.

**Pre-existing, unchanged:**
- area_unit_squares s0 at S/M/L prints 1 problem with a 29–32 % strip.
- seq_5 and frac_word_problems S overflow inside their own legacy cells.

**Where it is worse:** see R8-2.

## Defects (R8-n)

**R8-1 · major (C3 6: H13) · fraction_of_set · More Practice with letters A,B (the teacher path) at L · Practice B
holds 4 where B requested alone holds 6**

- **What I saw** (`r8/bonly.log`, from `probes/bonly.cjs`; seed = hash + offset, as in mp7):

  | Skill | Size | Offset | A,B request (A / B) | B alone | A alone |
  |---|---|---|---|---|---|
  | fraction_of_set | L | 8 | 6 / **4** | **6** | 6 |
  | fraction_of_set | L | 9 | 6 / **4** | **6** | 6 |
  | fraction_of_set_hard | L | 14 | 6 / 4 | 4 | 6 (B's own capacity: not a defect) |

  - `letters/fraction_of_set-mp-L-s8-AB-p2.png`: Practice B /4, 2 rows of about 425 px.
    - The top and bottom bands, measured from the pixels, are 23/28 %, 26/**31** %, 25/**30** % and 18/25 % of each
      cell.
    - Each cell holds only one equation and a short counter picture.
  - `letters/fraction_of_set-mp-L-s8-B-p1.png`: the same B alone prints these same four problems plus two more, on
    3 rows of about 285 px.
  - Same pattern at s9 (`letters/fraction_of_set-mp-L-s9-*.png`, and
    `print/fraction_of_set-more-practice-L-s3084282479-AB-pupil-p2.png`, which also has a 9 % strip).
  - Neither page deals a choose-all list or any tall item. The growth simply does not happen for the second letter.
- **Where:** `js/modules/print-sheet.js`, the per-letter block (`byLetter = byLetter.map(…)`, about lines 1850–1897).
  - The r8 fix only reaches a letter that is already over the pooled `cap` (`perLetter[k] > cap && ownHolds.has(L)`).
  - Here B starts at the pooled 4. Its growth loop then fails:
    - either `finalRun(…, m.cap, …)` re-deals a run whose `fitOf(next).cap < next.length` (break);
    - or the top-up's `fitsRows` rejects every next problem against B's 2-row floor `m.f`.
  - So B returns `items` unchanged ("not grown") at 4, on a 2-row floor sized for 4.
- **Fix:** size each named letter from its own single-letter result, not from the pooled start.
  - For each `L` of the request, the count and floor must be at least what `buildSheet({…, letters: [L]})` gives with
    the same seed. That path starts at the page-sized count (6 here) from `probeOf(L)`.
  - Simplest: run the single-letter sizing for each letter first and use its count and floor as that letter's start.
    Grow from there; never start at `perLetter`.
  - Also, the top-up's `fitsRows` should test against the floor of the count it is growing *to* (3 rows), not the
    current 2-row floor.
- **Proof:**
  - `node r8/probes/bonly.cjs /home/user/fk fractions:fraction_of_set:L:8,fractions:fraction_of_set:L:9,…` prints `ok`.
  - Extend it over `fractions:fraction_of_set,fractions:fraction_of_set_hard` × S/M/L × offsets 3–17. For every letter,
    the A,B count must be ≥ that letter alone.
  - Then re-run `mp7.cjs` on `$MPO` (the 13 skills of `r7/mp-other.log`): nothing shrinks, and no new strip.

**R8-2 · major (C3 6 on those pages: H5/PAGEFILL strip > 20 %) · Review on skills outside the lane, caused by
`js/modules/sheet/roles/review.js` (r8 / r8b) · three Review pages are thinner than at r7**

| Skill | Size / offset | r7 (63fcb6ac) | head d5fa165f | PNG |
|---|---|---|---|---|
| fraction_operations:frac_word_problems | M s1 | 3 problems (2 own + 1 legacy), strip 2 % | **2 problems, strip 23 %** | `review/head-frac_word_problems-review-M-s1-pupil-p1.png` |
| patterns:seq_5 | L s1 | 10, strip 18 % | 10, **strip 21 %**; the mixed row is 89 px, and a second mixed row of 89 px fits in the 210 px left | `review/head-seq_5-review-L-s1-pupil-p1.png` |
| decimals:add_decimal | L s0/s1 | 8 (6 own + 2) | **5 (3 own + 2)**: the band is fraction mixed-number subtraction (sub_mixed_unlike) in two 542 px cells, 40 % of a decimals Review | `review/head-add_decimal-review-L-s0-pupil-p1.png` |

- **The fallback does not fill.** frac_word_problems M s1 drops its band (the sibling is legacy), but the fallback
  ("the page is the skill's own problems") keeps the 2 own problems sized for a 2-band page. It does not take the third
  row that fits: r7 had 3 rows of 283/283/257 px on this page.
- **A shorter kit band leaves a strip.** On seq_5 L s1, `wideEmpty` / the H13 row limit made the mixed row short, and
  nothing re-filled the space it freed.
- **The kit-only search reaches across categories.** For add_decimal, earlierSkills with `kitOnly` (fallback mode)
  lands on a fraction skill. The band's tall cells then take two own rows: own problems go from 6 to 3.
- **Also noted, under the threshold:** value M went 12 → 10 problems with a 14 % strip. The band itself is better.
- **Where:**
  - `review.js` `geometry()`: after the band is chosen or dropped, the main band is not re-grown into the freed
    height. The search scores `n` but never compares against "own problems only".
  - `print-sheet.js` `earlierSkills(…, {fallback: true, kitOnly: true})`: the fallback leaves the skill's category.
- **Fix:**
  - In `geometry()`, also score the "own problems only" layout (no band). Keep a band layout only when it prints at
    least as many problems and leaves no strip > 20 %.
  - When the band is dropped or shortened, re-run the main allocation on the full body height.
  - Limit the `kitOnly` fallback to the skill's own category (or its domain). With no kit sibling there, print the
    skill's own page.
- **Proof:**
  - `node r8/probes/rv8.cjs /home/user/fk <the 16 skills in chain8.sh $OTHER> S,M,L 0,1` against
    `r8/review-other-base-63fcb6ac.log`. No page holds fewer problems than at 63fcb6ac unless that page's legacy band
    was removed and replaced by own problems.
  - No strip over 20 % that was not already there.
  - frac_word_problems M s1 holds ≥ 3 problems, and add_decimal L holds ≥ 6 of its own.

## Notes (not graded down)

- **N-1. `ws-content-audit` does not audit the lane.** It filters out the fraction categories (`FT_CATS` at about line
  2408). `--skill <5 lane skills>` alone exits 1 with "no skill matched" (first run in `r8/gates-exit.log`). With
  mixed_composing appended it is OK, but it counts 1 skill. The r7 and r8-build "OK" lines therefore checked only
  mixed_composing. I read the lane's items myself: every key I checked on the cited pages is right.
- **N-2. Review at M and L for the three operation skills prints 4 problems** (2 own + 2 band). At r7 it was 3–5 and
  partly legacy.
  - 6 does not fit: two own rows of about 285 px plus the band strip plus a band row is more than the body height.
  - The rows stretch to 375–449 px. The largest measured empty band is 29 % (add_frac_unlike M s1 list cell), so
    H13 does not apply. I graded it 8.
  - A Review that holds only 4 at M is still worth an owner look.
- **N-3. Keys print the simplest form** (3/4 − 1/4 keyed 1/2; 3/6 × 5 keyed 2 1/2). This is r4 N-d, still an open
  owner question.
- **N-4. Whole fractions (n/n) still cluster** (r7 N-1). For example, fraction_of_set_hard Review L s0 item a is
  "8/8 of them".
- **N-5. The add_facts Review band is the "add" skill in the same look** ("Add.", 13 + 7). It reads as more of the
  same, not as review of an earlier step. This is acceptable, but the band label promises a mix.
- **N-6.** The KEYLET and UNEVEN flags in the mp7 logs are the probe artefact and r7 N-3, as in r7.

## Scores

Print at S, M and L over the lint's 3 hashed seeds, seeds 5, 7, 11 and 13, offsets 3–17 (fos) and 0–16 (operations).
Screen at 1366x650, 1280x600 and 390x844 (`r8/screens.log`, identical to r7).

| Skill | Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| add_fractions_like | independent, more-practice A+B, test, copy + short keys, S / M / L | 9 | 8 | 8 | 9 | yes |
| add_fractions_like | review S / M / L (`review/lane-add_fractions_like-review-M-s0-*.png`) | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | card, worksheet, quiz, all widths | 8 | 8 | 8 | 9 | yes |
| add_frac_unlike | independent, more-practice A+B, test, copy + short keys (`print/add_frac_unlike-more-practice-M-s7-AB-key-p2.png`: 6 of 6 keys right) | 9 | 8 | 8 | 9 | yes |
| add_frac_unlike | review S / M / L (`review/lane-add_frac_unlike-review-M-s1-*.png`) | 8 | 8 | 8 | 8 | yes |
| add_frac_unlike | card, worksheet, quiz, all widths | 8 | 8 | 8 | 9 | yes |
| sub_fractions_like | independent / more-practice / test / keys, S / M / L (R7-2 closed) | 8 | 8 | 8 | 8 | yes |
| sub_fractions_like | review S / M / L | 8 | 8 | 8 | 8 | yes |
| sub_fractions_like | card, worksheet, quiz, all widths | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | independent S / M / L + copy key | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | more-practice A+B S / M + copy and short keys | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | more-practice A+B L (`letters/fraction_of_set-mp-L-s8-AB-p2.png`) | 8 | 8 | **6** (R8-1, H13) | 8 | **no** |
| fraction_of_set | test S / M / L + keys | 9 | 8 | 8 | 9 | yes |
| fraction_of_set | review S / M / L (`review/lane-fraction_of_set-review-S-s0-*.png`) | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | card, worksheet, quiz, all widths | 8 | 8 | 8 | 8 | yes |
| fraction_of_set_hard | independent, more-practice A+B (S / M / L), test, keys (`print/fraction_of_set_hard-more-practice-M-s756117103-AB-pupil-p1.png`: 6 + 6) | 8 | 8 | 8 | 8 | yes |
| fraction_of_set_hard | review S / M / L (`review/lane-fraction_of_set_hard-review-L-s0-*.png`) | 8 | 8 | 8 | 8 | yes |
| fraction_of_set_hard | card, worksheet, quiz, all widths | 8 | 8 | 8 | 8 | yes |
| (other skills) | Review pages changed by this lane's review.js: frac_word_problems M, seq_5 L, add_decimal L | — | — | **6** (R8-2) | — | **no** (regression) |

**What closes the lane:**
- **R8-1:** every named letter sized at least as that letter alone.
- **R8-2:** the Review search compares against "own problems only", re-fills freed height, and keeps the kit fallback
  in the skill's category.
- Everything else graded is at 8 or above.
