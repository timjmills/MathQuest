# Critic round 7: Fraction key, lane adbb61b8450078736 @ db3bc33b

I am the independent critic for this round (2026-10-17, Opus 5.5). I graded fresh renders, screens and runs of head
db3bc33b against RUBRIC.md, WORKSHEET_DESIGN_STANDARD.md, LESSONS_LEARNED.md, the owner rulings and the lead ruling:
- Every fraction sum uses whole + fraction boxes.
- Key answers are #C2410C on black structure.
- Stretch and thinking pages are out of scope.
- mixed_composing capacity and the mixed pools' third page (r6 N-3) belong to another lane.
- More Practice growth on other skills is accepted in itself. I still checked every changed page.

I changed no code. My probes are in `r7/probes/`, my logs in `r7/`, and every PNG I cite is in `r7/print/`,
`r7/screen/` or `r7/base-print/`. `base-print/` and the `base-919818bb-*` logs come from the r6 head (919818bb),
extracted with `git archive`, so they show what was there before this round.

## Verdict: FAIL

**What passes:**
- **R6-2 is closed.** A story line with one "n/d of" now stacks every fraction in it. The sweep finds no date, score,
  ratio, time or money string stacked.
- **Practice B now reads "Form B"** on the pupil page and on the key.
- **R6-1 is closed at size S**, on the exact cases r6 cited, and on fraction_of_set_hard M seed 756117108 (now 6 + 6).
- **The growth on other skills is clean.** I checked 13 skills × S/M/L × 3 seeds, with and without letters.
  - Every changed page is one side per letter, with nothing overflowing.
  - Every key has the same cell geometry as its pupil page.
  - No page grew a new strip.
- **Lane gates:** every gate on the lane's graded page types is green.
- **Screen:** all three hosts pass at every width.

**What fails:**
1. **R7-1 (major).** On the teacher's A,B request, a letter still sometimes prints 4 problems where the same letter
   printed alone holds 6.
   - Where: fraction_of_set_hard at M and L, and fraction_of_set at L.
   - How often: 7 of 90 seed × size combinations.
   - Result: the cells are about 45 % empty.
   - This is the r6 proof condition ("the AB counts should match the no-letters counts"), and it is not yet met.
   - Pre-existing in r6, but R6-1 was meant to close it.
2. **R7-2 (major).** sub_fractions_like at M, on Independent and on More Practice: any page that deals the "less
   than ½." list drops to 2 rows.
   - Result: 4 problems in about 45 %-empty cells, and the period wraps onto a line of its own.
   - Pre-existing (the base render is identical), but it is a lane skill on a core page type that r6 passed.
3. **R7-3 (critical on the Review version).** The Review page's "Mixed Review" band prints legacy items from sibling
   skills:
   - fraction_of_set: a garbled "2/3 = 8 = ☐" in Arial, which also fails the key-slot lint;
   - add_frac_unlike: a slashed "5/10" item with an "Answer:" line.
   - `ws-print-lint --roles review` FAILS on 6 of 10 documents. The result is byte-identical at 919818bb, so this is
     pre-existing and owned by the review composer and the sibling skills.

## Gates

I ran every browser job one at a time in one sequential chain: `r7/probes/chain1.sh`, then `chain2.sh`, `chain3.sh`
and `chain4.sh`. Exit codes are in `r7/gates-exit.log`.

| Gate | Result |
|---|---|
| `ws-boot-smoke` | **OK** |
| `ws-code-snapshot` | **OK**: 608 codes, 35 categories, +36 appended, nothing moved, 1870 option round trips |
| `ws-content-audit --skill <5 lane skills>,mixed_composing` | **OK**: 0 failing, 4 notes |
| `ws-print-lint --source kit --letters A,B`, 5 lane skills × independent, more-practice and test × `--seeds 3`, at S, M and L | **OK**: 45 + 45 + 45 documents, 0 findings. More Practice is now linted as 2 letters (`4+2` pages). |
| `ws-print-lint ... --letters A,B --key-style short`, at S and L, `--seeds 2` | **OK**: 30 + 30 documents, 0 findings |
| `ws-print-lint --source kit --roles review --size M --seeds 2` (5 lane skills) | **FAIL**: 6 of 10 documents, 50 findings (L-FONT TY-1/TY-2/TY-7, L-KEY AK-4, L-DENSITY H13). **Identical on 919818bb** (`r7/base-919818bb-ws-print-lint-review.log`), so this is not a regression. See R7-3. |
| `ws-screen-answer --skills` (5 lane skills) | **OK**: count-list ok (3 of 6) and (14 of 16); live green ok |
| `ws-chromebook-fit --skills` (5 lane skills; card, boss, race, worksheet, quiz; 1366x650 and 1280x600) | **OK** |

## r6 defects re-proved

| Id | Status | Evidence |
|---|---|---|
| **R6-1**: More Practice under-filled on letters A,B | **Closed at S; open at M and L (R7-1)** | See the breakdown after this table. |
| **R6-2**: mixed stacked and slashed fractions in one line | **Closed** | See the breakdown after this table. |
| Practice B footer | **Closed** | `r7/formb.log` gives pupil `Form A · …`, `Form B · …` and key `Form A · …`, `Form B · …`. The key footer reads "Key · Form B · seed …" (`print/fraction_of_set-more-practice-S-s3084282476-AB-key-p2.png`). Over all 414 mp7 builds, no footer names the wrong letter. |

**R6-1 evidence** (`r7/mp-fos-seeds.log`, from `probes/mp7.cjs`: both lane fos skills × S, M, L × seeds 3–17 × AB
and none, pupil and key measured):
- **What is fixed:**
  - **No page has a strip over 20 %.** The worst is 17 % (fraction_of_set L s14 A, a 4-up page identical to r6).
  - **At S, every AB letter holds at least as many problems as the no-letters page.** The r6 cases are fixed:
    - s3084282476 (s6): 8 + 8 at 4 % / 2 % (was 6 + 6 at 23 % / 22 %) (`print/fraction_of_set-more-practice-S-s3084282476-AB-pupil-p1.png`);
    - s14: 8 + 8 (was 6 + 6 at 22 %);
    - s17: 8 + 10 (was 6 + 6 at 22 %);
    - fraction_of_set_hard M 756117108: 6 + 6 at 8.7 % / 6.7 % (`print/fraction_of_set_hard-more-practice-M-s756117108-AB-pupil-p2.png`).
  - 50 of 180 builds changed from r6, all upward, and every key matches its pupil page cell for cell.
- **What remains:** 7 of 90 AB builds still hold fewer than the same letter alone (R7-1).

**R6-2 evidence:**
- **The new rule only adds real fractions.** `probes/falsestack7.cjs` (`r7/falsestack7.log`) runs every non-mixed
  skill × 12 seeds through `stackProseFractions(t, {all:false})`.
  - 75 prompts change.
  - Only three skills gain a stacked fraction that is not an "n/d of" phrase: frac_word_problems,
    frac_word_problems_plain and frac_word_mixed_plain ("Mason ate 1/6.", "Emma ate 3/6."). All of them are real
    fractions.
  - No `n/d` is left slashed in any changed line.
- **On the card,** "Amari ate ³⁄₁₀ of a cake. Kai ate ²⁄₁₀." is now stacked in both places at 1280 and at 390
  (`screen/frac_word_problems-card-1280-s1954.png`, `screen/frac_word_problems-card-390-s1954.png`).
- **The guards still hold.** My hand checks: "On 3/4 she ate 1/2 of a pie" stacks only the 1/2, and "The score was
  12/15." stays slashed.
- **Prompts with no "n/d of" stay slashed as a whole line,** which is consistent: fraction_of_set_nv "2/3 are green"
  and "1/3 cup" (`r7/card-stack.log`). The ratio, unit-rate and percent cards are untouched (`r7/card-stack-2.log`).

### The accepted growth on other skills: verified

`r7/mp-other.log` covers 13 skills × S, M, L × seeds 0–2 × AB and none, measured on both pupil and key pages:
- add_column_multi, add_facts, number_families_add, dot_array_mult, mixed_addition, mixed_composing,
  number_families_mixed, sub_100_regroup, mult_facts, sub_wp_20, add_fractions_like, sub_fractions_like and
  add_frac_unlike.

I compared it with r6 `mp-head.log`. 118 builds are identical and 26 changed. Every change is a grown letter:
- dot_array_mult B 6 → 9;
- mixed_addition 3 → 6, and 2 → 4 / 6;
- mixed_composing 4 → 6, and 2 → 4.

On every changed page:

| Check | Result |
|---|---|
| One side per letter | **Yes.** The only letters on a second side are the r6 N-3 pages (mixed_addition s2, mixed_composing s1), unchanged from r6. |
| Even rows | **Yes.** Grown pages are 285/285/285, 214×4, or within 45 px (mixed_addition S s1 B 240/285/240). |
| Nothing overflowing | **Yes.** 0 element outside its cell and 0 cell past the footer, on every pupil and key page. |
| Keys match | **Yes.** Key page count = pupil page count, and key cell geometry is identical cell for cell (0 KEYN / KEYGEO flags). |
| No new strip | **Yes.** Every strip over 20 % in the sample is in r6 too: add_column_multi M 22 %, mixed_composing S s0 B and s2 A 27 %. |

Looked at:
- `print/dot_array_mult-more-practice-S-s2072912181-AB-pupil-p2.png` + `-key-p2.png`: 9 cells, 3 × 3, the key is a
  facsimile. The clipped legacy caption "ws × 2 colur" is also on the ungrown Practice A (`-pupil-p1.png`), so it is
  pre-existing.
- `print/mixed_addition-more-practice-M-s2563403390-AB-pupil-p1.png`
- `print/mixed_composing-more-practice-L-s1681324180-AB-key-p2.png`

## Defects (R7-n)

**R7-1 · major (C3 6, under-filled page / H13-class wasted cells) · fraction_of_set_hard M and L, fraction_of_set L ·
More Practice with letters A,B (the teacher path) · a letter keeps 4 problems where the same letter alone holds 6**

- **What I saw** (`r7/mp-fos-seeds.log`; seed = hash + offset, as in `mp-regress.cjs`):

  | Skill | Size | Seed offset | AB (A / B) | No letters (A) |
  |---|---|---|---|---|
  | fraction_of_set_hard | M | 7 (756117103) | 4 / 4, rows 428/428 | **6**, rows 285/285/285 |
  | fraction_of_set_hard | M | 16 | 4 / 4 | 6 |
  | fraction_of_set_hard | L | 14 | 4 / 4 | 6 |
  | fraction_of_set | L | 8 | 4 (strip 14 %) / 4 | 6 |
  | fraction_of_set | L | 9 | 4 (strip 11 %) / 4 | 6 |
  | fraction_of_set | S | 9 | 6 / 6 | 6 (rows differ) |
  | fraction_of_set_hard | S | 14 | 6 / 6 | 6 (rows differ) |

  - **The first five rows are the defect.** On fraction_of_set_hard M offset 7, letters A,B print 4 problems over 2
    rows (`print/fraction_of_set_hard-more-practice-M-s756117103-AB-pupil-p1.png`, `-p2.png`).
    - Cell a holds about 150 px of content in a 355 px cell, and cell b about 140 px.
    - The same Practice A with no letters prints those same four problems **plus two more** on 3 rows
      (`print/fraction_of_set_hard-more-practice-M-s756117103-pupil-p1.png`).
    - fraction_of_set L offset 9: A holds 4 with about 35 % empty cells and an 11 % strip
      (`print/fraction_of_set-more-practice-L-s3084282479-AB-pupil-p1.png`).
  - **Pre-existing:** r6 gave the same counts (`r6/mp-fos-seeds.log`), and so does `r7/base-919818bb-mp7.log`. But
    R6-1's proof asked for AB counts equal to the no-letters counts. That holds at S and fails here.
  - **Trigger:** in every one of the 4/4 cases, one letter's deal includes a choose-all list
    ("Circle 8/8 of the stars", 4 × 4 shapes) taller than a 3-row floor.
    - The letters start at the pooled cap (4).
    - The per-letter growth then fails to lift the **other** letter. Here that letter is A, which with no letters
      grows to 6.
- **Where:** `js/modules/print-sheet.js`, the per-letter block added in db3bc33b (about lines 1840–1895):
  `byLetter = byLetter.map((items, k) => { … })`.
  - One of its exits returns the letter as dealt, either:
    - `if (m.cap < cur.length) return items;`
    - or the `finalRun(…, m.cap, …)` re-deal that brings in a second list or a taller item, followed by a `break`
      and a top-up rejected by `fitsRows` against `m.f`.
  - Log `k, cur.length, m.cap` and the exit taken for fraction_of_set_hard M seed 756117103 to see which.
- **Fix:** size each named letter exactly as the page-sized single-letter path sizes it.
  - A named letter's start count and floor should come from **its own** probe (`probeOf(L)`), not from
    `perLetter` derived from every letter's probes pooled.
  - Rule: a letter of an A,B request must never hold fewer problems than the same letter requested alone
    (`letters` omitted, same seed).
  - If a re-deal at `m.cap` brings a taller item, fall back to topping up from that letter's own run (as the top-up
    pass does) rather than keeping the 4-item deal.
- **Proof:**
  - `node r7/probes/mp7.cjs /home/user/fk fractions:fraction_of_set,fractions:fraction_of_set_hard S,M,L 3,…,17 AB,none`.
    For every seed and size, A in AB ≥ A in none, and no strip is over 20 %.
  - Then re-run the `mp-other` sample and compare with `r7/mp-other.log`: no letter on a second side, no new strip.

**R7-2 · major (C3 6; C4 7 for the orphaned period) · fraction_operations:sub_fractions_like · Independent and More
Practice (with and without letters) and Review, at size M · the "less than ½." list wraps its period onto its own
line, and the page drops from 3 rows to 2**

- **What I saw:**
  - **Independent M s5:** 4 problems on 2 rows (`print/sub_fractions_like-independent-M-s5-pupil-p1.png`).
    - Item b reads "Circle all differences that are less than ½", then a lone "." on the next line.
    - Cells a, c and d use about 200 px of a 355 px cell, so 44 % is empty.
    - The same seed at S prints 6 problems on 3 rows with "½." kept together
      (`print/sub_fractions_like-independent-S-s5-pupil-p1.png`).
  - **More Practice M with A,B:** 4 + 4 on seed offsets 0, 2 and 16. Offset 1 and seed 7 print 6 + 6 because they
    deal no list (`r7/mp-other.log`, `r7/base-919818bb-mp7.log`; `print/sub_fractions_like-more-practice-M-s4024291633-AB-pupil-p1.png`,
    `print/sub_fractions_like-more-practice-M-s7-AB-pupil-p1.png`). With no letters the same seeds print 6.
  - **Review M:** the same orphaned "." (`print/sub_fractions_like-review-M-s11-pupil-p1.png`, item b).
  - The screen keeps "½." together (`screen/sub_fractions_like-390x844-quiz-any1.png`), so the fault is print only.
  - **Pre-existing:** `base-print/sub_fractions_like-independent-M-s5-pupil-p1.png` is identical. The r6 grade of
    "8 everywhere" for sub_fractions_like missed it.
  - add_fractions_like's list ("Circle all sums that equal 1.") has no fraction at the end of the line and holds 3
    rows at M (`print/add_fractions_like-more-practice-M-s7-AB-pupil-p2.png`).
- **Where:** `js/modules/print-generate.js` around line 5697, in the `promptText` regex
  `.replace(/(^|[^<\w])(\d+)\/(\d+)\b/g, …mq-frac…)`.
  - It stacks the fraction but does not carry trailing punctuation with it.
  - So R4-5's rule (the fraction and its "." are one unbreakable run, `utils.js` `stackSlashFractions`) does not
    hold in the kit's list cell.
  - The extra prompt line makes the list cell measure taller than the 3-row floor, so the page sizes for 2 rows.
- **Fix:**
  - Capture `([.,;:!?)]+)?` after the denominator and emit
    `<span class="msc-frac-run" style="white-space:nowrap">…frac…${p}</span>`, or call `stackSlashFractions` on the
    escaped prompt.
  - Then re-check the M capacity. If the list cell still measures taller than a 285 px row at M, give the list's
    option grid 3 columns at M, as at S.
- **Proof:**
  - Re-render `sub_fractions_like` independent M seed 5: 6 problems, no line that holds only ".".
  - `mp7.cjs … fraction_operations:sub_fractions_like M 0,1,2,16 AB,none`: every letter holds 6.

**R7-3 · critical on the Review version (C1 4, C4 5) · fraction_of_set and add_frac_unlike Review (sub_fractions_like
Review via R7-2) · M · the "Mixed Review" band prints broken legacy items from sibling skills**

- **What I saw:**
  - **fraction_of_set Review M s11, item g** (`print/fraction_of_set-review-M-s11-pupil-p1.png`):
    - It reads "Find the missing number: 2/3 = 8 = ☐", which is not a true statement and cannot be solved as printed.
    - The key shows "Answer: 12" under the box, not in it (`-key-p1.png`), so the source is "2/3 = 8/?".
    - It is set in Arial (L-FONT TY-1, H4).
    - The lint reports L-KEY AK-4: "key page 2 has 8 answer slots, pupil page 1 has 6".
  - **add_frac_unlike Review M s11, item c** (`print/add_frac_unlike-review-M-s11-pupil-p1.png`):
    - "Write 5/10 as a fraction with denominator 100." is slashed (TY-7) and set at font-weight 600 (TY-2).
    - It has a "?" in the equation **and** a full-width "Answer:" line, a doubled slot (H8).
    - Item b's list cell is half empty.
  - **The Review page holds only 3 problems** (Score /3) in large, half-empty cells, for add_frac_unlike,
    sub_fractions_like and add_fractions_like (`print/add_fractions_like-review-M-s11-pupil-p1.png` holds 5).
  - fraction_of_set_hard Review is clean (`print/fraction_of_set_hard-review-M-s11-pupil-p1.png`).
  - **Pre-existing:** `r7/base-919818bb-ws-print-lint-review.log` is identical (50 findings in the same 6 documents).
    r6 did not render Review. This brief asks for it.
- **Where:**
  - The review role's Mixed Review band pulls sibling skills whose print is still the legacy path:
    - equiv_frac_nv / equivalent: `gen-fractions.js:4215–4219` and `:4409` emit "Find the missing number: a/b = c/?";
    - frac_10_100: "Write n/10 as a fraction with denominator 100".
  - Both render through `print-generate.js` `formatProblemForPrint`.
- **Fix:**
  - Either the review composer (`js/modules/sheet/roles/`, the review role's mixed band) takes only siblings whose
    provider emits a kit `q.cell` and skips `legacy`, or migrate equiv_frac_nv and frac_10_100 to kit cells
    (stacked `a/b = c/☐`, one slot).
  - Size the review grid by the same capacity rule as Independent, so a review page is not 3 problems.
- **Proof:** `node tests/scripts/ws-print-lint.cjs --source kit --skills <5 lane skills> --roles review --size M --seeds 2`
  gives OK, and the re-rendered pages hold at least 6 problems.

## Notes (not graded down)

- **N-1.** Whole fractions (n/n) are dealt 15 % of the time by design (`gen-fractions.js` around line 3918). But they
  cluster:
  - Practice A of `print/fraction_of_set-more-practice-S-s3084282476-AB-pupil-p1.png` has three of eight (a 4/4,
    c 3/3, f 4/4);
  - B of s3084282487 has three of ten (c, e, h);
  - fraction_of_set_hard Review has 3/3 and 4/4.
  - Suggestion: deal at most one n/n per page from the page deck.
- **N-2.** A and B of one request can now differ in length, because each letter is sized from its own problems:
  - S s3084282487 prints A /8 and B /10;
  - M s13 prints A /8 and B /6.
  - This is correct per letter, but parallel forms with different scores may surprise a teacher.
- **N-3.** Rows on grown fos pages are sized to content: 195/250/205/195 at S s8, up to 28 % between the tallest and
  shortest row. Nothing overflows, and the pattern matches Independent. This is pre-existing.
- **N-4.** These are out of lane and pre-existing:
  - dot_array_mult legacy captions are clipped ("ws × 2 colur") on both letters;
  - frac_word_problems' legacy picture labels "Amari: 3/10" are slashed inside the picture.
- **N-5.** The `fos-tap6` quiz row prints empty in both r6 and r7. This is a probe artefact; the card rows match r6
  (`r7/tap.log`).

## Scores

Print at S, M and L, over the hashed lint seeds, seeds 5, 7 and 11, the r6 seeds and offsets 3–17. Screen at
1366x650, 1280x600 and 390x844 (`r7/screens.log`, plus the PNGs listed).

| Skill | Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| add_fractions_like | independent, more-practice A+B, test, copy + short keys, S / M / L | 9 | 8 | 8 | 9 | yes |
| add_fractions_like | review M (`print/add_fractions_like-review-M-s11-*.png`) | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | card, worksheet, quiz, all widths | 8 | 8 | 8 | 9 | yes |
| add_frac_unlike | independent, more-practice A+B, test, copy + short keys, S / M / L (`print/add_frac_unlike-more-practice-S-s7-AB-key-p2.png`: all 6 keys right) | 9 | 8 | 8 | 9 | yes |
| add_frac_unlike | review M | 7 | 7 | 6 | **5** (H4/TY-7, H8) | **no** (R7-3) |
| add_frac_unlike | card, worksheet, quiz, all widths | 8 | 8 | 8 | 9 | yes |
| sub_fractions_like | independent / more-practice / test / keys at S and L | 8 | 8 | 8 | 8 | yes |
| sub_fractions_like | independent and more-practice (A+B and none) at M | 8 | 8 | **6** (R7-2) | 7 (R7-2) | **no** |
| sub_fractions_like | review M | 8 | 8 | 6 | 7 | **no** (R7-2/R7-3) |
| sub_fractions_like | card, worksheet, quiz, all widths | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | independent S / M / L + copy key | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | more-practice A+B S + copy and short keys (`print/fraction_of_set-more-practice-S-s3084282487-AB-*-p2.png`: 10 of 10 keys right) | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | more-practice A+B M | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | more-practice A+B L | 8 | 8 | **7** (R7-1, s8 / s9) | 8 | **no** |
| fraction_of_set | test S / L + copy key | 9 | 8 | 8 | 9 | yes |
| fraction_of_set | review M | **4** (H2, item g) | 5 | 8 | **5** (H4) | **no** (R7-3) |
| fraction_of_set | card, worksheet, quiz, all widths | 8 | 8 | 8 | 8 | yes |
| fraction_of_set_hard | independent S / M / L + copy key (`print/fraction_of_set_hard-independent-L-s5-key-p1.png`) | 8 | 8 | 8 | 8 | yes |
| fraction_of_set_hard | more-practice A+B S + keys | 8 | 8 | 8 | 8 | yes |
| fraction_of_set_hard | more-practice A+B M / L + keys | 8 | 8 | **6** (R7-1) | 8 | **no** |
| fraction_of_set_hard | test S / L, short key, review M | 8–9 | 8 | 8 | 8–9 | yes |
| fraction_of_set_hard | card, worksheet, quiz, all widths (`screen/fraction_of_set_hard-1280x600-card-word.png`) | 8 | 8 | 8 | 8 | yes |

**What closes the lane:**
- **R7-1:** named letters sized as each letter alone.
- **R7-2:** keep "½." together in the print list prompt, then 6 at M.
- **R7-3:** either a review composer that skips legacy siblings, or the lead rules Review's Mixed Review band out of
  this lane.
  - R7-3 is pre-existing and lives outside the lane's files.
  - If the lead rules it out of scope, R7-1 and R7-2 remain.
