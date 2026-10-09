# Critic: Search terms for every skill (lane a21ec3ef403026c80, head bff19e2)

Independent critic, 2026-10-09. I read and tested only; I did not edit any code.

**Verdict: FAIL.** Precision scores 6, and Coverage and Ranking score 7. A pass needs 8 or more on all four.

The engine is sound and the owner's case works everywhere. "skip counting" puts Count by 1–12 first in all six search
boxes. The thesaurus is large: 592 skills, with 16 to 194 terms each. The gate passes, there are no console errors and
the merge into main is clean. The fail comes from the mapping table and the tie-breaking. A few broad regexes give
skills concepts they do not teach. Equal scores fall back to catalogue order, so Addition wins every tie. Some UK and US
names for column multiplication are missing.

## What I ran

| Check | Result |
|---|---|
| `node tests/scripts/ws-search-terms.cjs` | OK: 592 skills, 232/232 queries, 89 primary-skill queries rank 1 |
| `ws-boot-smoke` | OK |
| `ws-teacher-library` | OK |
| `ws-teacher-shell` | first run hit the known Andika font-abort flake; rerun alone (see the lead's log) |
| `node --input-type=module --check` on all 16 changed modules | clean |
| `git merge-tree --write-tree claude/sweet-newton-c8wrv1 HEAD` (main c91cc8b) | clean, no conflicts |
| My probe: about 150 queries through `findSkills` (`skill-finder.js`) | see below |
| Real UI in Chromium: student search, Skills Navigator, Quiz builder, Teacher library, Teacher sets picker | rankings match `findSkills`; no console errors |
| Speed in the app | 5–30 ms per query in the student box; cold search (before the standards and WRM terms load) works on labels and concepts |

## Scores (the brief's four criteria; the rubric's visual criteria do not apply to search)

| Criterion | Score | Why |
|---|---|---|
| Coverage | **7** | Every skill has terms. Grades, years, CCSS, EE and WRM terms are all wired, and UK/US pairs are mostly there. Missing: column or written multiplication (C1), `*`, subitizing, and one skill with no concept (C2–C4). |
| Precision | **6** | Broad regexes give skills concepts they do not teach. A "column" phrase ties Addition into subtraction queries (P1–P3). |
| Ranking (40 realistic queries) | **7** | 31 of 40 put the right skill first. Ties and fuzzy matches rank by catalogue order, so unlisted typos land on unrelated skills (R1–R2). |
| No regression (speed, UI, console) | **8** | Fast, no errors, merges cleanly. Unused imports, and the teacher screens never refresh when the standards and WRM terms finish loading (N1–N2). |

## Defects

### Precision

- **P1: `multiples` in the rule table pulls in "Multiply by 10, 100 and Multiples of Ten"** (`multiplication:mult_zeros`).
  The rules `/seq_\d|count_by|skip_count|time_fives_ring|multiples/ → skip_count` and
  `/^number_theory:|number_theory_all|multiples/ → number_theory` match the word "Multiples" in that skill's *label*.
  The skill then gets "skip counting" and every factor, prime, HCF and LCM term. Results:
  - "factors and multiples": mult_zeros is #1.
  - "prime": mult_zeros is #2.
  - "skip counting": mult_zeros is #2 in the Skills Navigator, the Quiz builder and the Teacher sets picker, ahead of
    the Skip Counting Number Line and Grid.

  Fix: anchor both rules to the skill id (`:multiples\b`), not the label.
- **P2: "column subtraction" leads with Addition.** The `column` concept carries the phrases "column addition" and
  "column subtraction" to both families. "Add Three or Four Numbers in Columns" is #1. In the Navigator and the Quiz
  builder the whole Addition group leads: the top 3 cards are add_column_multi, add_20_regroup and add_10_no_regroup.
  Split the concept into `column_add` and `column_sub`, and keep the operation word out of the other family.
- **P3: other wrong #1 results.**

  | Query | Got #1 | Expected | Cause |
  |---|---|---|---|
  | "divide by 2" | Divide by 2-Digit Numbers | div_facts / halving | the `2 digit divisor` term |
  | "round to the nearest hundred" | round_sort_hundredths | nearest_100 | the prefix match of `hundred` hits `hundredths` |
  | "number bonds to 20" | Add Three Numbers (≤20) | number_bonds / make_ten | number_bonds has no "20" term; the label number wins |
  | "less" | add_sub_10s | comparing / one less | the `subtraction` concept owns `less`; ties go to catalogue order |
  | "square numbers" | hundreds_chart_fill ("number square") | exponents / squared | |
  | "counting to 10" | count_by_powers_of_10 | count_objects / count_sequence | |
  | "multiplication 2 digit by 1 digit" and "multiply by 1 digit" | place_value_10x | the multiplication skills | |

### Coverage

- **C1: column multiplication has no search words.** "short multiplication" (the UK name for the formal written method)
  and "standard algorithm multiplication" (the CCSS 5.NBT.5 wording) return **0 results**. "column multiplication"
  ranks dot arrays and properties first. "formal written method" returns 48 Addition and Subtraction skills and no
  multiplication. Give `mult_placeholder_zero` and `mult_missing_digit` (and the 2×1 / 2×2 skills) a `column_mult`
  concept with these phrases: column multiplication, short multiplication, long multiplication, standard algorithm,
  formal written method, written method.
- **C2:** "subitizing" (US) returns 0, and "subitising" (UK) works only through a WRM title. Add both spellings to the
  counting or dot-pattern skills.
- **C3:** `*` returns 0. `normalize()` maps × and ÷ but not `*`, which is what keyboard users type. Map `*` to "times".
- **C4:** `area_perimeter:composite_shapes` matches no `CONCEPT_RULES` entry, so it has no area or perimeter concept
  terms. "compound shapes" (UK) finds it only by fuzzy match.
- **C5 (minor):** "making change" puts equiv_coin_sets ahead of `measurement:money_change`. "decimals" and
  "percentages" lead with an operation skill (add_decimal, f_to_p), not an introductory one; consider `PRIMARY_SKILLS`
  entries (place-value decimals and percent_visual).

### Ranking

- **R1: misspellings that are not in `MISSPELLINGS` match but rank by catalogue order.** Fuzzy hits score a flat 1, and
  the primary-skill and phrase bonuses use the uncorrected word.

  | Typo | Got #1 | Notes |
  |---|---|---|
  | "subtracton" | Number Bonds | 130 hits |
  | "rouding" | Division Facts | "rouding" → "grouping" |
  | "perimter" | Perimeter Intro | Area Unit Squares is #2 |

  Fix: rewrite the fuzzy-matched word to its nearest vocabulary word before the phrase and primary bonuses, and rank
  by edit distance. Also, "telling tme" returns 0 because words under 4 letters are never fuzzed.
- **R2: ties fall back to catalogue order**, so Addition wins every tie ("less", "column subtraction", "subtracton").
  A tie-break by the number of matched concept words, or by grade closeness, would remove most of P3.
- 40-query sample: these 31 put the right skill first:
  - skip counting, count by 3s, times tables 7, x tables, long division
  - dividing with remainders, double digit addition, subtraction with regrouping, expanded form, compare numbers
  - ordering numbers, equivalent fractions, adding fractions, mixed numbers, percent of a number
  - ratio, negative numbers, telling the time, half past, quarter to
  - money, coins, perimeter, volume, symmetry
  - coordinates, tally chart, pictogram, bar chart, bodmas
  - fact families

  These 9 failed: divide by 2, round to the nearest hundred, number bonds to 20, column subtraction,
  factors and multiples, short multiplication, counting to 10, subtracton, `*`.

### No regression (minor)

- **N1:** `teacher-library.js`, `teacher-print.js`, `teacher-shell.js` and `teacher-sets.js` import `skillSearchScores`
  and `onSkillSearchReady` but never use them. `quiz-builder.js` and `skills-organizer.js` import
  `onSkillSearchReady` and `rankByQuery` but never use them.
- **N2:** Only the student box registers `onSkillSearchReady`. A teacher who types a standard code (for example
  "3.OA.7") in the first 2.5 s gets label-only results that do not refresh. The Navigator and Quiz builder also cache
  `searchHits` from before the standards and WRM terms load, until the next keystroke. The first query after loading
  rebuilds the index (about 380 ms in Node; it did not show in the browser timings). Build the index inside
  `warmSkillSearch` instead.
- **N3:** `MISSPELLINGS` contains entries that map a word to itself (`rounding`, `pictogram`, `oclock`) and a junk key,
  `kindergarden2`.
- **N4:** The gate's check (d) comment says the Navigator and Quiz builder "reorder their groups the same way", but
  only `groupByRank` is tested. The DOM reordering in `soOrderByRank` and `qbOrderByRank` has no test, and it is where
  P1 and P2 show up. Add a browser check of the first visible card for the primary-skill queries.

## To pass

1. Fix P1, P2, C1 and R1.
2. Add every query in P3, C1–C3 and R1 to the gate's `QUERIES` table with its expected top-1 or top-5 skill, so they
   cannot regress.
3. Clean up N1 and N3.

Then send the lane back for re-grading.
