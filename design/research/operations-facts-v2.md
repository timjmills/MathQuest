# Operations and facts: the content specification (P4)

Written 2026-09-20. Branch `sped-worksheet-standard`. This is the **content** specification for the
+ − × ÷ redo: what a correct fact-and-algorithm ladder actually contains for an ELL / special-education
pupil at a Common Core school, where six items fill a sheet.

It supersedes nothing. It **builds on** `design/research/operations-facts.md` (v1, 2026-09-19), which
stays the record of what the reference sites do. v1 answers *what the world teaches*. This document
answers *what we teach, in what order, with what supports, and what the pupil writes and says*. Where
the two disagree, the standards win and the difference is noted (see §1.4).

Nothing here changes code. No skill id is renamed or removed by this document.

## Related documents

| Document | What it governs | How this document uses it |
|---|---|---|
| `WORKSHEET_DESIGN_STANDARD.md` | The visual contract; §12 density and capacity | Every density check in §21 is a lookup in its §12.1 / §12.3 tables |
| `PEDAGOGY_STANDARD.md` | The teaching contract; P-1 … P-35, P-FL-*, P-SC-*, P-TH-*, P-LG-* | Every ladder step is written to P-1, P-7, P-13, P-17; ladders L-1 … L-8 are the parents of §5 … §18 |
| `design/PAGE_TYPES.md` | Page roles and their anatomy | Page-role caps quoted in §21 |
| `design/SKILL_CELL_CONTRACT.md` | What a skill supplies; §3.6 option schema | §2 writes the operations option schema against it |
| `design/catalogue/addition.md`, `subtraction.md`, `mult-div-integers.md` | Per-skill verdicts and the AD-/SU-/MU-/DV- ladder sketches | §22's gap table reconciles those sketches with this ladder set |
| `design/research/operations-facts.md` | v1 reference-site research | §1 extends it; §5 … §18 convert it |

---

## 0. The six rulings this specification is written to

Decided by the owner; not relitigated here.

1. **"Within N" bounds the answer, never the operands** — the sum for +, the minuend for −, the product
   for ×, the dividend for ÷ (`PEDAGOGY_STANDARD.md` P-35).
2. **`add_10_regroup` is impossible as named** and becomes **bridging ten**: both addends single-digit,
   sum 11 to 18 (§7).
3. **Plus and minus facts run to 30.** Times and divide facts run to 12, in the set order
   {0, 1, 2, 5, 10}, {3, 4, 6}, {7, 8, 9}, {11, 12} (P-FL-18, P-FL-19).
4. **Each fact skill takes a constant, 0 to 13**, plus mixed / cumulative (P-FL-20). See Q1 — the brief
   and P-31 disagree about which is the *default*.
5. **easy / medium / hard twins merge** into one skill with a practice level; every retired id survives
   in position as an alias (P-AT-9).
6. **Any equivalent answer is accepted** unless the instruction says simplest form (P-LG-15).

And two hard rules of the repo that shape what this specification is allowed to propose:

- **No skill is ever spliced out of `SKILLS[category]`.** Four positional share-code systems index by
  position. Retirement is a tombstone plus an alias in `js/modules/skill-aliases.js`.
- **New skill ids append.** `tests/scripts/ws-code-snapshot.mjs` is explicitly built to allow this; see
  §22.4 and Q4, which is the single most important coordination question in this document.

---

## 1. Method

### 1.1 What was read, and when

v1 (2026-09-19) read the reference sites' hub and topic pages and is not repeated here. This pass
(2026-09-20) went after the four things v1 left open or did not ask.

| Question this pass asked | Source read | Result |
|---|---|---|
| Does any reference site isolate a **notate-only** step (make the regrouping marks, do not solve)? | `https://www.commoncoresheets.com/subtraction-worksheets` | Yes. "Introduction to Regrouping" (coded 2.NBT.5) is described as rewriting a number by trading a ten for 10 ones *during* subtraction — a notate-only sheet in the wild. Corroborates L-5 step 4 / §11 SC-8. |
| Does any site isolate a **set-up / rewrite-only** step? | `https://www.mathworksheets4kids.com/two-digit-subtraction.php`, v1 §7 (`three-digit-subtraction.php` "line-up") | Partly. MW4K's "line-up" sheets rewrite horizontally-written problems into columns **and then solve**. No site read separates rewrite from solve. Our `rewrite-only` step (instruction `rewrite-only`, "Do _not_ solve.") is MathQuest's own, justified by P-9. |
| How is **bridging ten** laid out where it is taught explicitly? | `https://www.mathworksheets4kids.com/making-10.php` | Three sets: make-ten on ten frames (K, sketch the missing shapes and complete the equation); making ten to add with three addends (G1, find the pair that makes ten, group as the example shows); and addition within 20 by the making-10 strategy (G1) — "break up the second number into two parts, combine the first number with the part that bridges to 10, find the sum". That last one is the content model for §7. The *layout* is ours (§7's split frame), not theirs. |
| What are the **real** misconceptions, ranked, so error-analysis pages are not invented? | Nelson & Powell (2018), *Computation Error Analysis: Students With Mathematics Difficulty Compared To Typically Achieving Students*, `https://files.eric.ed.gov/fulltext/EJ1179493.pdf`; Brown & Burton's buggy-algorithm line via `https://www.tc.columbia.edu/faculty/jec34/faculty-profile/files/iagnosisofsubtractionbugsusingBayesiannetworks.PDF`; Ashlock front matter, `https://www.pearsonhighered.com/assets/samplechapter/0/1/3/5/0135009103.pdf` | 478 third-graders, 2,427 coded errors, 71% identifiable. This is the evidence base for §20. |
| Are the fact-family types and the fact-set blocks as v1 recorded them? | `https://www.mathworksheets4kids.com/add-sub-fact-family.php`, `https://www.ixl.com/math/grade-1`, `https://www.ixl.com/math/grade-3` | Confirmed. IXL grade 3 is organised exactly as v1 said: **N** understand multiplication (14), **O** skill builders to 10 (11, one multiplier each), **P** fluency to 10 (15), **Q** skill builders to 12 (12), **R** fluency to 12 (5), **S** properties, **U** two-digit. IXL grade 1 keeps strategies (P, S) apart from the single-addend sets (Q, T) and from fact families (M). One set at a time, then cumulative, is not our invention. |

### 1.2 What could not be read

- **IXL practice items were not opened.** Answer formats below are inferred from skill names, as in v1.
  This does not matter for this document, because P-29 forbids us from copying an on-screen format
  anyway: our screen item is our printed cell with inputs in the blanks.
- **MW4K PDFs were not opened** (membership). Item counts are as the pages state them.
- `mathworksheets4kids.com/adding-zero.php` and `/making-ten.php` returned **HTTP 404**; the live page is
  `/making-10.php`.
- No credentials were used. The file the project points at
  (`~/.claude/projects/*/memory/credentials.md`) exists at
  `C--Claude-Claude-Code-MathQuest/memory/credentials.md`, but every page needed for this pass was
  readable without logging in, so nothing was logged into and nothing was downloaded into the repo.

### 1.3 The audit numbers, as they really are today

The brief quotes an older run. Run on 2026-09-20, `node tests/scripts/ws-content-audit.cjs` reports:

```
146 operations skills audited, 77 fail, 69 pass (200 items each, Max Number 100).

    38  repeats itself: only N distinct items in N
    20  N outside the band of N
     9  promises regrouping but N of N items do not regroup
     7  N items are multiple choice on screen
     4  never generates a zero operand; a fact set must cover its zero facts
     4  mixes operations in one skill: + xN, - xN   (+ 7 more mixed-operation variants below it)
     2  the band makes regrouping impossible: a sum within N never regroups
     1  promises no regrouping but N of N items regroup
    22  silently mixes N print formats  (summed across its variant rows)
```

Two differences from the brief worth recording:

- The **120 "never generates a zero operand"** lines are now mostly emitted as `note`, not `FAIL`; only
  **4** count as failures. The gate agent's suspicion of over-reporting was right and has been acted on.
- **"repeats itself" (38) is now the largest single failure class** and is not in the brief's list at
  all.

> **SUPERSEDED — independent review, 2026-09-20.** Two corrections to the block above, both verified by
> re-running the gate and by generating items directly:
>
> 1. **The "nine skills produce 1 distinct item in 200" claim was an artefact of the audit's own
>    fingerprint, not a generator defect.** At the commit this section was written against, the audit
>    keyed distinctness on `` `${a}${op}${b}` `` and fell back to `q.text`. For
>    `number_families_add/_med/_hard`, `number_families_mult/_med/_hard` and
>    `mult_chart_easy/_medium/_hard`, `q.text` is a **constant string** ("Number Family: Complete all
>    equations", "Fill in the missing products…") and the whole item lives in `q.visual`, which the
>    fingerprint never read — so every item hashed identically. The audit now fingerprints the visual as
>    well and reports those ids as `ok` or as ordinary variety notes (91, 79, 108, 16 distinct in 240).
>    Twenty items dumped straight from `generateQuestionFor` confirm it: `mult_chart_hard` gives 20
>    entirely different 22-cell charts, and `number_families_add` gives `2,7,9` / `10,7,17` / `8,5,13` /
>    `9,1,10` … with every fact correct. `git diff js/modules/gen-operations.js` contains **no** change to
>    `number_families` or `mult_chart`; the generators were never the problem. Any verdict of **REDO**
>    on those nine ids is withdrawn — see §22.3 and `design/catalogue/addition.md`.
> 2. **The whole failure count is stale.** With the rebuilt gate and generators in the working tree,
>    `node tests/scripts/ws-content-audit.cjs` now reports `146 operations skills, 240 items each, Max
>    Number 100, **0 failing**, 6 mixed pools held to their pool union, 174 notes` (116 `zero-facts`,
>    40 `variety`, 6 each of `mixed-pool` / `cell-shape` / `notation-mix`). The band overrun, the
>    operation-mixing and the on-screen multiple-choice classes quoted below and in §2.1 / §2.3 have all
>    been closed by the parallel operations wave. Read every "the audit shows…" sentence in this
>    document as evidence for *why a rule exists*, not as a live defect list. The live list is the gate's
>    own output.
>
> Two defects quoted here **do** still reproduce and are unfixed in `js/modules/gen-operations.js`:
> `long_div_2digit` ("Divide by 2-Digit Numbers") draws its divisor from **{11, 12} only** — 15 distinct
> items in 240, every dividend an exact multiple, every quotient a single digit — and
> `number_families_mult` is capped at factors 2–5 (16 distinct in 240).

### 1.4 Where the research and the standards disagree

Recorded, not followed.

| The sites do this | We do not, because |
|---|---|
| 20–100 facts on a sheet; 12–30 column problems | P-LC item caps: 6 computation cells, 20 on a fact probe, 40 on a fact-family probe. A reference sheet is 5–15× our density |
| Bundle "introduce the fact set" and "raise the band" into one level | P-1. §5 splits them (AF-11 is a band step with no new constant) |
| Teach 2-digit + 2-digit before 2-digit + 1-digit, or leave ragged lengths to the random draw | P-35 and v1 item 7: ragged lengths are deliberate and come **first** (AC-3 before AC-4) |
| Put "subtract across zeros" before general regrouping (IXL 2-V.4) | Ruled: after (L-5Z). IXL itself moves it after at grade 3 (3-H.7) |
| Offer timed drills as the default | P-30: untimed by default; timing marks are options |
| Teach the word-problem operation from keywords | P-21: structure rule first; the keyword panel is a teacher option |
| Say borrow / carry / exchange | P-32: **regroup**, everywhere, including in `workedSteps` |
| Turn a written production item into multiple choice on screen | P-29. This is why §18 XD-7 is the *only* legal home for a missing-operator item, and its response is a written sign, not four buttons |

---

## 2. The generator contracts the rulings imply

These are the rules a generator must satisfy before any ladder step below is buildable. They are stated
once here so §5 … §18 can assume them.

### 2.1 The band bounds the answer (P-35)

| Operation | The band caps | Operands are drawn so that |
|---|---|---|
| + | the sum | the sum ≤ band |
| − | the minuend | the minuend ≤ band (and the difference ≥ 0) |
| × | the product | the product ≤ band |
| ÷ | the dividend | the dividend ≤ band (and the division is exact unless the step asks for a remainder) |

**Consequence the audit already proves:** 20 skills exceed their own label today, one of them by a factor
of two (`add_wp_10k_plain` reached 19,897 against a band of 10,000). A band label is a promise about the
answer; if the generator cannot keep it, the dialog refuses and prints nothing (VA-R-07) rather than
relaxing the band.

### 2.2 The fact constant and the band are independent, and the band is derived from the constant

A fact set is **"Add c"** / **"Subtract c"**, with c from 0 to 13. Inside a set:

| Operation | What is generated | Partner range |
|---|---|---|
| Add c | `n + c` (and `c + n` only when turn-around facts are ticked — see Q11) | `n` from 0 to min(9, band − c) |
| Subtract c | `m − c` | `m` from c to min(band, c + 9) |
| Multiply by f | `n × f` | `n` from 0 to min(12, ⌊band ÷ f⌋) under the fact-range limit |
| Divide by d | `(n × d) ÷ d` | `n` from 0 to min(12, ⌊band ÷ d⌋); `d = 0` is never generated |

**The band of 30 exists for exactly one reason:** the constants 11, 12 and 13 need band ≥ 22 to get the
same full 0–9 partner range that constants 0–9 get at band 20 (13 + 9 = 22; 22 − 13 = 9), and 30 is the
smallest band **P-31 offers** at or above 22 (the offered set is 10, 12, 18, 20, 30). The arithmetic
threshold is 22; 30 is the rounded option that clears it. That is what ruling 3 buys.

**The band therefore follows the constant.** "Add 9" cannot be taught at band 10 (it would yield two
facts), so the step that introduces the 9 set takes band 20 as a *derived* constraint, not as a second
delta. See Q3 — this needs the owner's word, because the alternative (a band rise is always its own step)
produces dead lessons: raising the band on a constant already taught adds no new facts at all.

A constant the band cannot host ("Subtract 13" at band 10) is **refused in the dialog**, never silently
relaxed (P-FL-20).

### 2.3 One operation per skill, one problem type per section

P-28. Today `add`, `subtract`, `multiply`, `divide`, `add_sub_10s`, `add_sub_100s`, `missing_add_sub`,
`missing_mult_div`, `unknown_start_wp`, `mixed_add_sub` and the five `mixed_*` pools all break this; the
audit names each one. The contract:

- A skill declares **one** operation, or declares `opMix` explicitly and is titled as a mixed skill.
- A section contains **one** `variant` and one `notation` unless the teacher chose Mixed, and a mixed
  section's instruction says so (`mixed-sign`, `mixed-ops`).
- A **missing-operator** item (`? ` between two numbers) is not an addition item, a subtraction item, a
  multiplication item or a division item. It belongs to §18 XD-7 and nowhere else.

### 2.4 Zero facts are content, not an accident

Every fact set must be able to emit its zero facts: `n + 0`, `n − 0`, `n − n`, `n × 0`, `0 ÷ n`, `n ÷ 1`,
`n ÷ n`. Today none of the four fact skills can (audit: `add_facts`, `sub_facts`, `mult_facts`,
`div_facts` all FAIL on this). The zero sets are taught **late** for + and − and **first** for × (P-FL-18);
`n ÷ 0` is never generated.

### 2.5 The skill's option schema (against `SKILL_CELL_CONTRACT` §3.6)

An operations skill declares these, with allowed values and one default. They travel with the skill into
every page role, on paper and on screen, and are saved and shared with it (P-AT-10).

| Option | Values | Applies to | Default |
|---|---|---|---|
| `facts` | `[c]`, `{from, to}`, `'all'` | + − fact skills (c 0–13); × ÷ fact skills (f 0–12) | see Q1 |
| `band` | 10, 12, 18, 20, 30 for + −; a product / dividend cap for × ÷ | all | derived from `facts` (§2.2) |
| `factRange` | 10, 12 | × ÷ fact skills | 12 (P-FL-19) |
| `turnaround` | on / off | + × fact skills | off (Q11) |
| `cuePart` | 1, 2, 3, 4 | fact skills | 1 on a new set, then in order (P-FL-14) |
| `cueStyle` | dot tile / dots on the numeral / none (+ −); count-by strip / array tile / none (× ÷) | fact skills | dot tile; count-by strip (P-31) |
| `thinkBox` | on / off | ÷ fact skills | off (P-SC-6) |
| `notation` | vertical / horizontal; for ÷ also bracket | all computation skills | one per section, never mixed (P-16) |
| `lengths` | equal / ragged | multi-digit + − × | ragged first (§2.6) |
| `regroup` | none / some / all / `across_zero` | multi-digit + − | per step |
| `regroupPlaces` | `[ones]`, `[tens]`, `[ones, tens]`, … | multi-digit + − | per step |
| `zeros` | count 0–3, position ones / tens / middle | subtraction across zeros | per step |
| `addends` | 2, 3, 4, 5 | column addition | 2 |
| `unknown` | result / second / first / minuend / subtrahend / dividend / divisor / quotient / mixed | unknown steps | result |
| `responseScope` | `decision` / `notation` / `setup` / `judge` / `answer-only` / `full` | all | `full` |
| `practiceLevel` | 1 / 2 / 3 | merged twins (P-AT-9) | the step's level; 1 on a stand-alone print |
| `remainder` | none / some / all | ÷ | none |

### 2.6 Ragged lengths are generated, not drawn

2-digit + 1-digit before 2-digit + 2-digit. 3-digit − 2-digit before 3-digit − 3-digit. `lengths: 'ragged'`
is a value the step sets, and the misconception it exists to expose (M-A5, lining ragged addends up on the
left) is one of the four the error-analysis pages for AC-3 / SC-3 are built from.

---

## 3. How to read a ladder step

Every row of §5 … §18 carries the six things the brief asks for. Two of them are per-ladder rather than
per-step, because they do not change inside a ladder, and repeating them would hide the ones that do:

| Field | Where it lives | Why |
|---|---|---|
| **The one change** | the `One change` column | P-1. Exactly one of range / representation / format / unknown / opMix / scaffold / responseScope |
| **Structural scaffolds** | the ladder's header block | They persist at every level and are removed only by a `fade` step, which appears in the table as a row |
| **Hint scaffolds** | the `Cell` column names the ones the step adds or drops | They fade in the fixed H1–H5 order of P-4.2 |
| **The written response** | the `Response` column | P-13's order of preference. Never multiple choice unless the paper item is |
| **The oral frame** | the `Say:` column | P-17 / P-LC-15 |
| **Misconceptions** | §20, the bank, by id, with the step they first bite at | Because they recur across steps and because the error-analysis, True or False? and Reason It generators need one bank, not 150 scattered lists |
| **Density** | §21, one row per cell shape | Because density is a property of the cell, not of the step |

### 3.1 The four sub-skill response scopes, specified once

P-9 and P-AT-6. The unused parts of the cell are **absent, not greyed**, so the pupil is not tempted to
solve. The cell is otherwise the full procedure's cell, unchanged (P-6).

| Scope | What is in the cell | What is **absent** | Instruction key | Response | Page-role cap (S / M / L) |
|---|---|---|---|---|---|
| `decision` | the problem, the two check boxes, the rule in a rounded box at the top (P-TH-11) | the answer slot entirely | `decide-regroup`, `rule-yes-no`, `circle-bigger`, `underline-first` | one checked box, or one circle / underline | 12 / 8 / 6–8 |
| `notation` | the digit grid, the regroup boxes, the working marks | the answer row | `notate-regroup` | digits in the regroup boxes only | 6 / 6 / 6 |
| `setup` | the horizontal problem, an empty digit grid below it | the answer row | `rewrite-only` | the operands' digits, one per box | 6 / 6 / 6 |
| `judge` | a finished problem printed in **black** (P-TH-4), half of them wrong from §20 | — | `check-fix` / `check-by` (pupil then writes the answer) or `judge-correct` / `judge-not-correct` (pupil writes nothing) | one checked box, plus a number on the line for `check-fix` | 6 / 4 / 2–4 |

`rewrite-solve` is not a scope; it is the *next* step after `setup`: the same cell, plus the answer row.

### 3.2 How the cue fade relates to steps

P-7 says hints fade one per step. P-FL-14 says the fact cue's four parts are printed in order across the
**repeats of one set**. These meet, and the more specific rule governs: **the cue part is not a ladder
step.** Introducing the 4 set is one step; that step's Independent and More Practice pages run cue part 1,
then 2, then 3, and its cumulative review is part 4. The teacher chooses the part in the dialog; it never
prints in the pupil area. The ladder tables below therefore never show a "remove the dot tile" row.

The one exception is a cue that becomes **structural**: L-6 step 7d's empty count-by strip that the pupil
fills in is not part 2 of a fade, it is a different scaffold, so it is a real step (§14 MF-11).

---

## 4. The order of the whole redo, and why

Fourteen ladders. The order is a prerequisite order first and a triage order second: the ladders whose
skills fail the audit hardest, and which the most other ladders depend on, come first.

| # | Ladder | Levels | Why here |
|---|---|---|---|
| 1 | **AF** addition facts (§5) | K–2 | Every other + ladder and every word problem sits on it. `add_facts` fails today only on zero facts, so it is the cheapest big win |
| 2 | **SF** subtraction facts (§6) | K–2 | Same, and SF's count-back cue mirrors AF's count-on cue, so the two share a cell |
| 3 | **BT** bridging ten (§7) | 1 | Ruling 2 redefines a live id. The sooner `add_10_regroup` stops printing an impossible label, the fewer wrong sheets go out |
| 4 | **TN** teens ± a digit (§8) | 1–2 | The bridge between facts and the column algorithm; two named gaps in v1 (items 21, 22) |
| 5 | **FF** fact families (§9) | 1–4 | Nine skills produce **one distinct item in 200**. It is the worst generator defect in the family |
| 6 | **AC** column addition (§10) | 1–5 | The decide / notate / setup rungs invented here are reused by SC, CM and MB |
| 7 | **SC** column subtraction (§11) | 2–5 | Carries the single most common multi-digit error in the literature (M-S1) |
| 8 | **SZ** across zeros (§12) | 2–5 | Ruled to sit after SC. No skill exists for any of its rungs today |
| 9 | **CM** three- and four-addend columns (§13) | 1–4 | Needs AC's regroup box to hold a 2-digit carry |
| 10 | **MF** multiplication facts (§14) | 2–4 | The {0,1,2,5,10} order is ruled and `mult_facts` cannot emit 0 |
| 11 | **DF** division facts (§15) | 3–4 | Built on MF; the tally box and the think box are its own structure |
| 12 | **MB** multi-digit multiplication (§16) | 3–5 | Needs MF and AC |
| 13 | **DL** long division (§17) | 4–6 | Needs DF, SC and MB. The longest procedure, the lowest page density |
| 14 | **XD** discrimination (§18) | 1–5 | Cross-cutting. Each rung is placed where its two procedures first collide, so XD is written last but *taught* interleaved |

The reference sites do not order it this way, and they are not wrong for their pupil: IXL runs concepts,
strategies and fluency in three parallel tracks across a grade. Our pupil cannot hold three tracks. One
ladder at a time, one new thing per step.

---

## 5. AF — addition facts, constants 0 to 13

**Strategy** (P-2): count on from the bigger number, with a dot cue. Doubles / near doubles and make-ten
are separate optional ladders; bridging ten (§7) is make-ten's first rung.

**Pre-skill check** (P-25), four boxed sections: count on aloud from any number to 20; read numerals 0–20;
say which of two numbers is bigger; join two groups of counters and count them all.

**Structural, at every level:** the vertical fact stack (or the horizontal equation frame), and the answer
box. Removed by no step in this ladder.
**Hints, fading H1 → H5:** H1 the counters beside the symbols; H2 the caption "in all" under the answer
box; H3 the dot tile beside the smaller numeral; H4 the bigger numeral circled; H5 the first digit traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| AF-1 | concept | Join two groups and count | start | Two rings of counters above the frame `__ + __ = __` with both addends printed. H1, H2 | one number in the answer box | "__ and __ make __." |
| AF-2 | bridging | Add with a picture and numbers | representation | The counters and the vertical fact in the **same row** (P-8's one bridging step) | one number | "__ plus __ equals __." |
| AF-3 | decide | Circle the bigger number | responseScope `decision` | The fact stack with **no answer slot at all**. First cell circled in trace | one circle. "Do _not_ add." | "__ is bigger than __." |
| AF-4 | procedure | Add 1 | responseScope `full` | Stack + answer box. H3 (one-dot tile beside the 1), H4 | one number | "__ plus 1 equals __." |
| AF-5 | format | Add 1 written across | format | The same facts, horizontal. Both orientations in separate sections from here (P-16) | one number | same |
| AF-6 … AF-9 | range | Add 2, Add 3, Add 4, Add 5 (one per step) | the fact set | As AF-4; the tile carries c dots. Band 10 | one number | "__ plus __ equals __." |
| AF-10 | range | Add 5 (sums to 20) | the band | Unchanged. The constant does not move; only the sums grow | one number | same |
| AF-11 … AF-15 | range | Add 6, 7, 8, 9, 10 (one per step) | the fact set | Band 20 derived (§2.2) | one number | same |
| AF-16 | case | Add 0 and turn-around facts | the fact set | A part-whole box with the pair 3 + 6 and 6 + 3 side by side; a rule box: adding 0 does not change the number | two numbers | "__ plus 0 is still __." |
| AF-17 … AF-19 | range | Add 11, Add 12, Add 13 (one per step) | the fact set | Band 30 derived. Dropped when the band is capped below 30 | one number | same |
| AF-20 | range | Add facts, mixed (sums to 20) | the constants mix | Cue part 4: no cue, cumulative | one number | same |
| AF-21 | range | Add facts, mixed (sums to 30) | the band | Unchanged | one number | same |
| AF-22 | concept | Tell if two sides are equal | representation | A ten frame each side of `=`; True and False boxes; a 2-blank frame that makes the pupil compute both sides. Includes `7 = 3 + 4` | one checked box + two numbers | "This side makes __. That side makes __." |
| AF-23 | unknown | Find the missing number (second addend) | unknown | `5 + __ = 8` with a tally space inside the cell (structural at this step) and the caption "count up" | one number | "__ plus what equals __? __." |
| AF-24 | unknown | Find the first number | unknown | `__ + 3 = 8` | one number | same |
| AF-25 | fade | Find the missing number without the tally space | scaffold | The tally space removed (P-SC-4: its own step, its own Model) | one number | same |
| AF-26 | apply | Solve addition stories | representation | Change (join) and part-whole, result unknown. v1 then v2 (P-WP) | one number + the pre-printed unit word | "__ plus __ equals __ {unit}." |
| AF-27 | test | Test A / B: addition facts | — | 20 items, both orientations, level 0 | | |

Reviews: after AF-5, then after every second set, then cumulative after AF-15, AF-19, AF-21 (P-RV-1).

**Misconceptions:** M-A6 (AF-4), M-A7 (AF-5 on), M-A8 (AF-16), M-A3 (AF-11 on), M-U1 (AF-22).

---

## 6. SF — subtraction facts, constants 0 to 13

**Strategy:** count back, with a dot tile on the number being subtracted.
**Pre-skill check:** count back aloud from any number to 20; AF-1 … AF-5; say which of two numbers is
bigger; take counters away from a group and count what is left.

**Structural:** the vertical fact stack (or horizontal frame) and the answer box.
**Hints H1 → H5:** counters with crosses; the caption "what is left"; the dot tile beside the subtrahend
and the vertical number strip; the minuend circled; the first digit traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| SF-1 | concept | Take away and count what is left | start | Counters, cross out; frame `__ − __ = __` with the first two numbers printed | one number | "__ take away __ leaves __." |
| SF-2 | bridging | Subtract with a picture and numbers | representation | Picture and vertical fact in one row | one number | "__ minus __ equals __." |
| SF-3 | procedure | Subtract 1 | responseScope `full` | Stack + answer box; dot tile beside the 1; number strip available. Warm-up band: count back aloud | one number | "__ minus 1 equals __." |
| SF-4 | format | Subtract 1 written across | format | Horizontal. Separate sections from here | one number | same |
| SF-5 … SF-8 | range | Subtract 2, 3, 4, 5 | the fact set | Band 10 | one number | "__ minus __ equals __." |
| SF-9 | range | Subtract 5 (from 20 or less) | the band | Constant unchanged | one number | same |
| SF-10 … SF-14 | range | Subtract 6, 7, 8, 9, 10 | the fact set | Band 20 derived | one number | same |
| SF-15 | case | Subtract 0 and subtract all | the fact set | `n − 0` and `n − n` in one part-whole box; a rule box for each. This is where M-S7 is met head on | two numbers | "__ take away 0 is still __. __ take away __ leaves 0." |
| SF-16 … SF-18 | range | Subtract 11, 12, 13 | the fact set | Band 30 derived | one number | same |
| SF-19 | range | Subtract facts, mixed (from 20 or less) | the constants mix | Cue part 4 | one number | same |
| SF-20 | range | Subtract facts, mixed (from 30 or less) | the band | | one number | same |
| SF-21 | unknown | Find the missing part | unknown | Part-whole box with one part missing, then `9 − __ = 4` | one number | "__ take away what leaves __? __." |
| SF-22 | unknown | Find the whole | unknown | `__ − 4 = 5` | one number | same |
| SF-23 | fade | Find the missing part without the box | scaffold | Part-whole box removed | one number | same |
| SF-24 | discriminate | Add or subtract: look at the sign | opMix | Mixed + and − facts; circle the sign **first**, then solve (`circle-sign`). The first mixed exposure in the + / − ladders (P-11, P-28) | one circle + one number | "The sign says __." |
| SF-25 | apply | Solve subtraction stories | representation | Separate (result unknown) and part-whole (part unknown), v1 then v2 | one number + unit | "__ minus __ equals __ {unit}." |
| SF-26 | test | Test A / B: subtraction facts | — | 20 items | | |

**Misconceptions:** M-S6 (SF-3), M-S5 (SF-4 on), M-S7 and M-S4 (SF-15), M-S1 (SF-19, and it is the reason
the mixed page must include `13 − 8` and not only `18 − 3`), M-U2 (SF-21).

---

## 7. BT — bridging ten (ruling 2: the new meaning of `add_10_regroup`)

**Strategy:** make ten. This is a **second, optional ladder** (P-2), entered after AF-15, not a rung of AF.
Both addends single-digit; the sum 11 to 18. `8 + 5 = 8 + 2 + 3`.

**Pre-skill check:** pairs that make ten; `10 + n`; split a single digit into two parts.

**Structural:** the split frame — two part boxes under the second addend, joined to it by two short rules
— plus the answer box. Removed by BT-5.
**Hints H1 → H5:** two ten frames above the frame; the caption "makes ten" under the first part box; the
first part printed in grey in cell a; the addend that is nearer ten circled.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| BT-1 | concept | Make ten with counters | start | Two ten frames, the first partly full. Move counters into the first frame | two numbers: how many moved, how many are left | "__ needs __ more to make ten." |
| BT-2 | notate | Split a number into two parts | responseScope `notation` | One numeral with the split frame below it; the target part printed. **No sum anywhere in the cell** | two numbers. "Do _not_ add." | "__ is __ and __." |
| BT-3 | bridging | Fill the ten, then add the rest | representation | The ten frames and the split frame in the **same row** | three numbers: both parts and the sum | "__ plus __ makes ten. Ten plus __ equals __." |
| BT-4 | procedure | Bridge through ten | responseScope `full` | Split frame only, no frames of counters | three numbers | same |
| BT-5 | fade | Bridge through ten without the split frame | scaffold | Split frame removed (P-SC-4) | one number | "__ plus __ equals __." |
| BT-6 | format | Bridge through ten written down the page | format | Vertical | one number | same |
| BT-7 | discriminate | Do I need to make ten? | opMix | Sums of 10 or less mixed with sums 11–18. Check "Make ten" or "Just add". Rule box at the top | one checked box. "Do _not_ solve." | "This one goes past ten." |
| BT-8 | apply | Solve stories that go past ten | representation | Change (join), result unknown, sums 11–18 | one number + unit | "__ plus __ equals __ {unit}." |
| BT-9 | test | Test A / B: bridging ten | — | 12 items | | |

**Density warning.** BT-3 and BT-4 are the tallest fact cells in the whole family: two ten frames plus a
three-blank split frame. See §21 — **4 per page at L**, 6 at S and M. This is the one place in the
operations family where the standard 2 × 3 grid does not hold at L.

**Misconceptions:** M-B1, M-B2, M-B3, plus M-A6 carried forward.

---

## 8. TN — teen numbers plus or minus a single digit

Fills v1 items 21 and 22. This is the bridge between the fact ladders and the column algorithm, and it is
where "ten and some ones" first becomes a *tool* rather than a *reading*.

**Structural:** the `10 + __` frame at TN-1 … TN-3; from TN-4 the ordinary fact stack.
**Hints:** a full ten frame plus a part frame (H1); the caption "ten and" (H2); the number strip (H3).

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| TN-1 | bridging | Read a teen number as ten and some ones | start | Full ten frame + part frame beside `10 + __ = 1_` | one number | "__ is ten and __." |
| TN-2 | procedure | Add ten and a digit | responseScope `full` | `10 + 6` with the frames | one number | "Ten plus __ equals __." |
| TN-3 | unknown | Find the ones in a teen number | unknown | `16 = 10 + __` | one number | "__ is ten and __." |
| TN-4 | procedure | Add a digit to a teen number | range | `13 + 4`, ones total ≤ 9, so nothing passes ten | one number | "__ plus __ equals __." |
| TN-5 | procedure | Subtract a digit from a teen number | opMix | `17 − 4`, ones digit big enough | one number | "__ minus __ equals __." |
| TN-6 | procedure | Subtract a digit from a teen number using ten | range | `15 − 8` as `15 − 5 − 3`; the split frame of §7 returns, on the **subtrahend** | three numbers | "__ take away __ leaves ten. Ten take away __ leaves __." |
| TN-7 | discriminate | Are there enough ones? | opMix | `17 − 4` and `15 − 8` mixed. Check "Enough ones" or "Use the ten" | one checked box. "Do _not_ solve." | "There are __ ones. I need __." |
| TN-8 | test | Test A / B: teen facts | — | 16 items | | |

**Misconceptions:** M-A3 (TN-4: "13 + 4 = 8" from adding all digits), M-S1 (TN-5 → TN-6 boundary:
"15 − 8 = 13" from 8 − 5), M-T1.

---

## 9. FF — fact families and the number-family triangle

Two passes over the same ladder: **+ / −** after §6, **× / ÷** after §15. The rungs are identical; only
the operations and the degenerate cases change.

**Structural:** the triangle outline with its three number boxes, and the four equation frames with their
slots. The triangle is never removed.
**Hints:** the top number ringed as "the whole" / "the product" (H4); the first fact traced (H5); the
caption "whole" / "part" beside the boxes (H2).

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| FF-1 | concept | Read a number family | start | Triangle with all three numbers and all four facts printed **and answered in black** — the intro page of P-FL-10 | **nothing written**; read aloud | "__ and __ make __. __ take away __ leaves __." |
| FF-2 | notate | Write the two addition facts | responseScope `notation` | Triangle, three numbers given; two frames, four slots. The subtraction frames are **absent** | four numbers | "__ plus __ equals __." |
| FF-3 | notate | Write the two subtraction facts | responseScope `notation` | The addition frames absent | four numbers | "__ minus __ equals __." |
| FF-4 | procedure | Write all four facts | responseScope `full` | All four frames | eight numbers across four frames | both frames above |
| FF-5 | unknown | Find the missing member | unknown | Two of the three numbers given; the third box empty | one number | "The missing number is __." |
| FF-6 | discriminate | Is it a fact family? | opMix | Three numbers, Yes and No boxes, the rule in a rounded box. Non-examples at 1:1 (P-10) | one checked box | "__ and __ make __, so it is / is not a family." → printed frame: "__ and __ make __." |
| FF-7 | case | Families with a double | range | 6, 6, 12. Only **two** different facts exist, so the cell prints two frames, not four | four numbers | "__ and __ make __." |
| FF-8 | case | Families with zero | range | 0, 7, 7 | eight numbers | "__ plus 0 is still __." |
| FF-9 | format | The same family in a part-whole box | format | Part-whole box instead of the triangle; same four facts | eight numbers | unchanged |
| FF-10 | apply | Use addition to subtract | representation | `13 − 8 = __` with the family triangle beside it; the pupil rings the addition fact that helps | one ring + one number | "__ plus __ equals __, so __ minus __ leaves __." |
| FF-11 | test | Fact-family probe | — | 40 items (P-FL-4) | | |
| FF-12 … FF-22 | — | The × / ÷ pass | — | FF-2/FF-3 become "write the two multiplication facts" / "the two division facts"; FF-7's degenerate case is a **square** (4, 4, 16); FF-8's is **1** (1, 7, 7); FF-9's alternative format is the **array** | as above | "__ groups of __ make __. __ shared into __ groups is __." |

**Misconceptions:** M-F1, M-F2, M-F3, M-F4. FF-6's non-examples are generated from M-F1 (a triple where
one part exceeds the whole) and from near-misses (8, 5, 12).

---

## 10. AC — column addition

**Strategy:** the standard algorithm, ones first, with a regroup box above the next column.
**Pre-skill check:** facts with sums 10–18; `10 + n`; tens and ones; which column is the ones.

**Structural, at every level until a `fade` step removes it:** the digit grid; the place letters
**T O**, then **H T O**, then **Th H T O**; the regroup box above each column; the answer row under the
rule. `regroupPlaces` never changes the structure, only which box is used.
**Hints H1 → H5:** the base-10 picture beside the grid; the captions "ones total" / "tens total"; the
arrow over the ones column ("start here"); the first regroup mark in grey.

No dot tile and no count-by strip appear anywhere in AC: those are fact cues (P-FL-17).

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| AC-1 | bridging | Add tens and ones with blocks | start | Base-10 picture beside a labelled **T O** grid; arrow over the ones | one digit per box | "__ tens and __ ones." |
| AC-2 | setup | Write an addition problem from blocks | responseScope `setup` | Two base-10 pictures; the grid empty; **no answer row** | the operands' digits. "Do _not_ solve." | "__ tens, __ ones goes here." |
| AC-3 | procedure | Add a one-digit number to a two-digit number | responseScope `full` | `34 + 5`. **Ragged first** (§2.6). No picture | one digit per box | "Line the ones up under the ones." |
| AC-4 | range | Add two two-digit numbers (no regrouping) | range (equal lengths) | Labelled grid | digits | "__ ones and __ ones make __ ones." |
| AC-5 | setup | Rewrite a problem in the grid | format | Horizontal problem above an empty grid, the first one traced; then a section that solves (`rewrite-solve`) | digits. First section: "Do _not_ solve." | "Ones under ones. Tens under tens." |
| AC-6 | concept | Trade 10 ones for 1 ten | representation | Base-10 picture; ring ten ones; frame `__ tens __ ones` | two numbers | "Ten ones make one ten." |
| AC-7 | decide | Tell when I need to regroup | responseScope `decision` | Add the ones only. Boxes: **Regroup** / **No regrouping**. Rule box at the top. No answer slot | one checked box. "Do _not_ solve." | "The ones make __. That is more than nine." |
| AC-8 | notate | Write a ones total as tens and ones | responseScope `notation` | The ones column only: the ten into the regroup box, the ones into the answer box. The tens column is **absent** | two digits | "__ ones is __ ten and __ ones." |
| AC-9 | procedure | Add two-digit numbers with regrouping | responseScope `full` | Regroup box above the tens; **P-10 seeds no-regroup items into the set** | digits | "__ ones and __ ones make __. Write __, regroup one ten." |
| AC-10 | case | Add when the answer needs a new place | range | `68 + 57`; `95 + 8` | digits | "The tens make ten. That is one hundred." |
| AC-11 | range | Add three-digit numbers, regroup the ones | range | **H T O**, one regroup box used | digits | as AC-9 |
| AC-12 | range | Add three-digit numbers, regroup the tens | range | The box above the hundreds | digits | "__ tens and __ tens make __ tens." |
| AC-13 | range | Add three-digit numbers, regroup twice | range | Two boxes | digits | as above |
| AC-14 | case | Add numbers of different lengths | range | `346 + 27`, `346 + 8` | digits | "Line the ones up under the ones." |
| AC-15 | range | Add four-digit numbers | range | **Th H T O**; a comma in the answer | digits | as AC-9 |
| AC-16 | range | Add five- and six-digit numbers | range | See §21: **4 items per page at L** | digits | as AC-9 |
| AC-17 | fade | Add without the place letters | scaffold | The letters go; the grid stays | digits | unchanged |
| AC-18 | fade | Add without the regroup boxes | scaffold | The boxes go; the pupil writes the small digit | digits | unchanged |
| AC-19 | unknown | Find the missing digit | unknown | One digit inside the column replaced by a **short-dash** box (design standard LS-8 — dashed means unknown, and is the one exception to "dashed means cut") | one digit | "The missing digit is __." |
| AC-20 | apply | Solve addition stories | representation | Work grid beside the story, with a regroup row | number + unit | "__ plus __ equals __ {unit}." |
| AC-21 | test | Review; Test A / B | — | 16 items. Reviews interleave subtraction without regrouping, 25–35% (P-RV-5) | | |

**Misconceptions:** M-A1 (AC-9 — the biggest one, 30% of multi-digit addition errors), M-A2 (AC-8),
M-A4 (AC-7's non-examples), M-A5 (AC-3, AC-14), M-A3 (AC-4), M-A11 (AC-15, the comma).

---

## 11. SC — column subtraction

**Strategy:** the standard algorithm; regroup from the next place.
**Pre-skill check** (six sections, from L-5): subtract without regrouping; which number is greater;
teen minus one digit; `10 + digit`; one less than a tens number (30 − 1); tens and ones.

**Structural:** as AC, plus the **Tens / Ones regroup boxes above the minuend** (design standard §10.3).
**Hints:** the base-10 picture; the captions; the arrow over the ones; the first crossing-out in grey.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| SC-1 | bridging | Subtract tens and ones with blocks | start | Base-10 picture beside a **T O** grid; cross out | digits | "__ tens and __ ones." |
| SC-2 | setup | Write a subtraction problem from blocks | responseScope `setup` | No answer row | digits. "Do _not_ solve." | "The big number goes on top." |
| SC-3 | procedure | Subtract a one-digit number from a two-digit number | responseScope `full` | `68 − 6`. **Ragged first** | digits | "Line the ones up under the ones." |
| SC-4 | range | Subtract two two-digit numbers (no regrouping) | range | Labelled grid | digits | "__ ones take away __ ones leaves __ ones." |
| SC-5 | setup | Rewrite a problem in the grid | format | Horizontal above an empty grid, then a solving section | digits | "Ones under ones." |
| SC-6 | concept | Trade 1 ten for 10 ones | representation | Base-10 picture: cross out one rod, draw ten ones; frame `__ tens __ ones` | two numbers | "One ten is ten ones." |
| SC-7 | decide | Tell when I need to regroup | responseScope `decision` | Look at the ones. Boxes **Regroup** / **No regrouping**. Rule box: "Is the top digit smaller?" Seeds a zero in the ones and 2-digit − 1-digit | one checked box. "Do _not_ solve." | "The top is __. The bottom is __." |
| SC-8 | notate | Show the regrouping | responseScope `notation` | A bare two-digit number with the regroup boxes: cross out the tens, write one less, write the new ones. **No subtraction anywhere in the cell** | two digits | "__ tens becomes __ tens. The ones get ten more." |
| SC-9 | procedure | Subtract two-digit numbers with regrouping | responseScope `full` | Regroup boxes, **T O** letters | digits | "I cannot take __ from __. Regroup." |
| SC-10 | case | Subtract with and without regrouping | range | The two mixed in one section — the decision of SC-7 now has to be made while solving | digits | as SC-9 |
| SC-11 | fade | Subtract without the regroup boxes | scaffold | The boxes go | digits | unchanged |
| SC-12 | range | Three digits: regroup the ones | range | **H T O** | digits | as SC-9 |
| SC-13 | range | Three digits: regroup the tens | range | | digits | "__ hundreds becomes __ hundreds." |
| SC-14 | range | Three digits: regroup twice | range | | digits | as above |
| SC-15 | case | Subtract numbers of different lengths | range | `346 − 27`, `346 − 8` | digits | "Line the ones up under the ones." |
| SC-16 | range | Four digits (no zeros in the top number) | range | Comma in the answer | digits | as SC-9 |
| SC-17 | range | Five and six digits | range | **4 items per page at L** (§21) | digits | as SC-9 |
| SC-18 | fade | Subtract without the place letters | scaffold | | digits | unchanged |
| SC-19 | unknown | Find the missing digit | unknown | Short-dash digit box | one digit | "The missing digit is __." |
| SC-20 | judge | Check by adding | responseScope `judge` | Finished problems in black, half wrong from §20. A small work space for the check (P-TH-8). Boxes **Correct** / **Fix it** | one checked box + a number when Fix it | "__ plus __ equals __, so it is correct." → frame: "__ plus __ equals __." |
| SC-21 | apply | Solve subtraction stories | representation | Work grid with a regroup row | number + unit | "__ minus __ equals __ {unit}." |
| SC-22 | test | Review; Test A / B | — | 16 items | | |

**Misconceptions:** **M-S1** at SC-9 and SC-10 — the smaller-from-larger bug is 31.2% of all multi-digit
subtraction errors in the cited study and is the reason SC-7 exists at all. Then M-S2 (SC-8),
M-S5 (SC-10), M-S9 (SC-15), M-A5 (SC-3, SC-15).

---

## 12. SZ — subtracting across zeros

Its own sub-ladder, taught **after** SC is secure (ruled). From one rung to the next the only thing that
changes is **how many zeros the top number holds, or where they sit**. Number size, supports and wording
do not move.

**Structural:** SC's grid and boxes, plus the **wide regroup box** spanning the run of zeros and the digit
to its left (design standard VA-22).
**Hints:** the caption under the wide box that says the trade in words ("40 tens is 39 tens"); the first
crossing-out in grey.

**Each rung is two pages, not two steps** (L-5Z's "notation page first, full page second"): page 1 is the
`notation` scope, page 2 the `full` scope, same cell, same numbers profile. The `One change` column
compares each rung with the previous **rung**, so P-1 holds.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| SZ-1 | range | Subtract from a whole ten | start | `50 − 8`, then `50 − 27`. One zero, in the ones. The ordinary Tens / Ones boxes | digits | "There are no ones. Take one ten." |
| SZ-2 | case | Subtract from a whole hundred | range (zeros: 2) | `400 − 157`. A wide box over the hundreds **and** tens: "40 tens" becomes "39 tens", the ones get ten more | digits | "__ tens becomes __ tens. The ones get ten." |
| SZ-3 | case | Subtract from a whole thousand | range (zeros: 3) | `4,000 − 1,257`. A wide box over the first three digits: "400 tens" becomes "399 tens" | digits | as SZ-2 |
| SZ-4 | case | Subtract across one zero | range (zeros: 1, position tens) | `304 − 126`. "30 tens" becomes "29 tens". The **ones digit is not zero** — this is what makes it a different rung from SZ-1 | digits | as SZ-2 |
| SZ-5 | case | Subtract across two zeros | range (zeros: 2, inside) | `3,004 − 1,257`. The run of zeros sits inside the number; the ones digit is not zero | digits | as SZ-2 |
| SZ-6 | case | Subtract with zeros in the middle | position | `4,052 − 1,381` (the zero is crossed) and `5,032 − 1,418` (the zero **receives** ten and nothing crosses it). Non-example seeded: `4,052 − 1,021`, where nothing regroups at all (P-10) | digits | "Nothing crosses this zero." → frame: "This zero gets __ more." |
| SZ-7 | test | Review; Test A / B | — | Interleaves SC items with no zeros, 25–35% | | |

**Misconceptions:** **M-S3a** and **M-S3b** are the whole reason this sub-ladder exists; then M-S1
(`400 − 157 = 357`, which is what smaller-from-larger *and* "0 − n = n" both produce, so the error-analysis
cell must distinguish them by the regroup marks, not by the answer) and M-S4 (`400 − 157 = 300`).

---

## 13. CM — three- and four-addend columns

**Structural:** AC's grid and letters, plus a regroup box **wide enough for two digits** (a column of four
2-digit addends can total 39).
**Hints:** the pair that makes ten ringed (H4); the running partial total in a side caption (H2).

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| CM-1 | procedure | Add three one-digit numbers | start | Horizontal `4 + 6 + 3`; the pair that makes ten ringed. Band 20, then 30 | one number | "__ and __ make ten. Ten plus __ equals __." |
| CM-2 | fade | Add three one-digit numbers without the ring | scaffold | The ring goes | one number | unchanged |
| CM-3 | range | Add three two-digit numbers (no regrouping) | range | Three-row grid | digits | "__ and __ and __ make __." |
| CM-4 | notate | Write a ones total above 19 | responseScope `notation` | The ones column only; the regroup box takes **two digits**. The tens column is absent | two digits | "__ ones is __ tens and __ ones." |
| CM-5 | procedure | Add three two-digit numbers with regrouping | responseScope `full` | Wide regroup box | digits | as CM-4 |
| CM-6 | range | Add four two-digit numbers | range | CCSS 2.NBT.B.6 caps Level 2 here (see Q10) | digits | as CM-4 |
| CM-7 | range | Add three three-digit numbers | range | Level 3 and up | digits | as CM-4 |
| CM-8 | case | Add numbers of different lengths in a column | range | `346 + 27 + 8` | digits | "Line the ones up under the ones." |
| CM-9 | apply | Solve stories with three amounts | representation | v1 then v2 | number + unit | "__ and __ and __ make __ {unit}." |
| CM-10 | test | Review; Test A / B | — | 12 items | | |

**Misconceptions:** **M-A9** — the published example of the "procedural / incomplete" error class (254
errors, 9 items) is literally a three-addend column where the pupil added the first two and stopped. Then
M-A10 (a two-digit carry written as one digit) and M-A1.

---

## 14. MF — multiplication facts, set order {0,1,2,5,10} {3,4,6} {7,8,9} {11,12}

**Strategy:** skip count on a count-by strip.
**Pre-skill check:** skip count aloud by 2, 5, 10; repeated addition; count equal groups.

**Structural:** the fact stack or horizontal frame and the answer box; the count-by strip's frame (the
strip is a cue whose *contents* fade, but its frame is structure once MF-11 makes the pupil fill it).
**Hints H1 → H5:** the equal-groups picture or array; the caption "how many counts"; the filled count-by
strip, then grey, then none (P-FL-17 parts 1–3); the count-by number circled.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| MF-1 | concept | Count equal groups | start | Ovals with counters; frame `__ groups of __`. Includes **one group, groups of one, and an empty oval** (P-10) | two numbers | "__ groups of __." |
| MF-2 | concept | Read an array | representation | `__ rows, __ in each row`; small count numerals on the first rows, then none | two numbers | "__ rows of __." |
| MF-3 | bridging | Write adding as multiplying | representation | `4 + 4 + 4 = __` and `3 × 4 = __` in the **same row** | two numbers | "Three fours. __ times __ equals __." |
| MF-4 | discriminate | Tell if I can multiply | opMix | Equal groups against unequal groups. Boxes: **I can multiply** / **I must add**. Rule box | one checked box. "Do _not_ solve." | "The groups are / are not the same." → frame: "Each group has __." |
| MF-5 | case | Multiply by 0 and by 1 | range (the first sets of P-FL-18) | Rule box with examples **and non-examples**; the empty oval from MF-1 returns | one number | "__ groups of 0 is 0. One group of __ is __." |
| MF-6 | concept | Switch the factors | representation | One array, turned through a quarter; two facts in digit boxes | two numbers | "__ times __ is the same as __ times __." |
| MF-7 | setup | Set up the 2 times table | responseScope `setup` | Circle the count-by number, underline how many counts. **No answer slot** | one circle + one underline. "Do _not_ solve." | "Count by __, __ times." |
| MF-8 | procedure | Multiply by 2 | responseScope `full` | Printed count-by strip above the section | one number | "__ times __ equals __." |
| MF-9 | range | Multiply by 5 | the fact set | | one number | same |
| MF-10 | range | Multiply by 10 | the fact set | | one number | same |
| MF-11 | fade | Write my own count-by strip | scaffold | The printed strip becomes an **empty** strip the pupil fills in first. Not a cue part — a different scaffold (§3.2) | the strip's numbers, then the product | "Count by __: __, __, __ …" |
| MF-12 | format | Multiply written down the page | format | Vertical section; both orientations kept apart from here | one number | same |
| MF-13 … MF-15 | range | Multiply by 3, 4, 6 (one per step) | the fact set | | one number | same |
| MF-16 … MF-18 | range | Multiply by 7, 8, 9 (one per step) | the fact set | | one number | same |
| MF-19, MF-20 | range | Multiply by 11, 12 | the fact set | Dropped when `factRange` is 10 (P-FL-19) | one number | same |
| MF-21 | range | Facts mixed to 10 | the constants mix | Cue part 4 | one number | same |
| MF-22 | range | Facts mixed to 12 | the fact range | | one number | same |
| MF-23 | unknown | Find the missing factor | unknown | `4 × __ = 28` | one number | "__ times what equals __? __." |
| MF-24 | unknown | Find the first factor | unknown | `__ × 7 = 28` | one number | same |
| MF-25 | representation | Use a multiplication chart | representation | Read one product off a chart: row, column, cell | one number | "Row __, column __. The answer is __." |
| MF-26 | test | Test A / B: multiplication facts | — | 20 items, both orientations | | |

**Misconceptions:** **M-M1** (added the factors — the intro of the cited study names `3 × 4 = 7`
explicitly), **M-M2** (a close fact from the same table: 77 errors over 4 items and the top identifiable
multiplication error), M-M3 (concatenation, `2 × 3 = 23`), M-M4 (`n × 0 = n`, met head on at MF-5).

---

## 15. DF — division facts

**Strategy:** skip count the divisor, one tally per count, into a tally box.
**Pre-skill check:** MF for the same table; multiples of the divisor; share counters equally.

**Structural:** the tally box (one per fact, kept as structure at every level, P-FL-9); the answer line;
the bracket or the `÷` frame. The **think box** above the fact is an optional grey helper, off by
default; when it is on the page drops one row and the Score denominator falls with it (P-SC-6).

**The set order for ÷.** P-FL-18's first block is {0, 1, 2, 5, 10}. For division it is read as
{1, 2, 5, 10} with `0 ÷ n` as an edge item at DF-10, because `n ÷ 0` is undefined and never generated
(see Q8). `÷ 5` is taught before `÷ 2` because it is the tally exemplar (L-7 step 7).

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| DF-1 | concept | Ring equal groups | start | A total of counters; ring groups of d; frame `__ groups` | one number | "__ shared into groups of __ makes __ groups." |
| DF-2 | concept | Read a division equation | representation | `12 ÷ 3` with a frame: "__ in all, __ in each group" | two numbers | "__ in all, __ in each group." |
| DF-3 | notate | Write a division equation | responseScope `notation` | Labelled blanks: total ÷ in each group = number of groups. **No answer computed** | three numbers, all read from the picture | as DF-2 |
| DF-4 | format | Read division in a bracket | format | The same fact in both notations; match, then copy. Sections never mix notations (P-28) | one match + one copy | "__ goes into __." |
| DF-5 | bridging | Divide on a number line | representation | 0–20 line; hop by d to the total; count the hops | one number | "__ hops of __ reach __." |
| DF-6 | decide | Circle the multiples of 5 | responseScope `decision` | Near misses seeded (24, 51). No answer slot | circles. "Do _not_ divide." | "__ is / is not a multiple of five." → frame: "Five goes into __." |
| DF-7 | procedure | Divide by 5 | responseScope `full` | Tally box; count by 5 to the total, one tally per count | one number | "__ divided by __ equals __." |
| DF-8 | range | Divide by 2 | the fact set | | one number | same |
| DF-9 | range | Divide by 10 | the fact set | | one number | same |
| DF-10 | case | Divide 0, divide by 1, divide a number by itself | range (the edge set) | `0 ÷ 5`, `7 ÷ 1`, `5 ÷ 5`, each with its own rule box. `÷ 0` never generated | one number | "Nothing shared is nothing. __ in groups of one is __." |
| DF-11 … DF-13 | range | Divide by 3, 4, 6 | the fact set | | one number | same |
| DF-14 … DF-16 | range | Divide by 7, 8, 9 | the fact set | | one number | same |
| DF-17, DF-18 | range | Divide by 11, 12 | the fact set | Dropped when `factRange` is 10 | one number | same |
| DF-19, DF-20 | range | Facts mixed to 10, then to 12 | the constants mix, then the fact range | Cue part 4 | one number | same |
| DF-21 | representation | Build a × ÷ fact family | representation | Three numbers, four facts. The think box belongs from here on | eight numbers | "__ groups of __ make __." |
| DF-22 | unknown | Find the missing quotient | unknown | | one number | "__ divided by __ equals what? __." |
| DF-23 | unknown | Find the missing divisor | unknown | `12 ÷ __ = 4` | one number | same |
| DF-24 | unknown | Find the missing dividend | unknown | `__ ÷ 3 = 4` | one number | same |
| DF-25 | concept | Divide with some left over | representation | Ring groups; count the left-overs; frame `__ groups, __ left` | two numbers | "__ groups and __ left over." |
| DF-26 | procedure | Find a remainder with a multiples strip | representation | The pupil writes the strip, finds the last multiple that fits, subtracts | three numbers | "__ is the last one that fits. __ left." |
| DF-27 | judge | Fix a remainder that is too big | responseScope `judge` | Given answers, some with remainder ≥ divisor. Boxes **Correct** / **Fix it** | one checked box + the corrected answer | "__ is bigger than __, so it is not finished." → frame: "__ is bigger than __." |
| DF-28 | apply | Solve sharing and grouping stories | representation | Equal-groups schema: groups unknown, then size unknown | number + unit | "__ shared into __ is __ {unit}." |
| DF-29 | test | Test A / B: division facts | — | 12 items; probe 20, or 18 with the think box on | | |

**Misconceptions:** M-D1 (wrong operation — the cited study found 31.9% of errors on division items were
*addition*), M-D4 (dividend and divisor reversed, which DF-4's bracket step is designed to prevent),
M-D5 (`n ÷ n = 0`, `0 ÷ n = n`, `n ÷ 1 = 1` — DF-10), M-D3 (remainder ≥ divisor — DF-27).

---

## 16. MB — multi-digit multiplication

**Strategy:** the standard algorithm on a digit grid. The area / box model is the **optional second
ladder** MB′ (P-2), never interleaved with MB.

**Structural:** the digit grid; the regroup box above each column of the top factor; the partial-product
rows with their rule; the **placeholder-zero box** in the second partial-product row.
**Hints:** the area model drawn beside the grid (H1); the caption "ones first" (H2); the arrow over the
ones digit of the multiplier (H4); the first partial product traced (H5).

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| MB-1 | procedure | Multiply by 10 and by 100 | start | A pattern column: `3 × 1`, `3 × 10`, `3 × 100` | one number each | "__ times ten is __ tens." |
| MB-2 | range | Multiply a multiple of ten | range | `4 × 30` | one number | same |
| MB-3 | setup | Rewrite across as down | responseScope `setup` | Horizontal problem above an empty grid. **No answer row** | the operands' digits. "Do _not_ solve." | "The one-digit number goes underneath." |
| MB-4 | procedure | Multiply a two-digit number by one digit (no regrouping) | responseScope `full` | Digit grid, one partial product | digits | "__ times __ ones is __. __ times __ tens is __." |
| MB-5 | notate | Write the regrouped ten above the tens | responseScope `notation` | The ones column only; the tens column absent | two digits | "__ is __ tens and __ ones." |
| MB-6 | procedure | Multiply with a regroup | responseScope `full` | Regroup box in use | digits | "Multiply first. **Then** add the regrouped ten." |
| MB-7 | range | Multiply a three-digit number by one digit | range | | digits | as MB-6 |
| MB-8 | range | Multiply a four-digit number by one digit | range | | digits | as MB-6 |
| MB-9 | notate | Write the placeholder zero | responseScope `notation` | The second partial-product row, its **zero box only**. Nothing is multiplied | one digit (a 0). "Do _not_ multiply." | "The second row starts in the tens." |
| MB-10 | procedure | Multiply two two-digit numbers | responseScope `full` | Two partial-product rows, two regroup rows, the placeholder zero box | digits | "__ times the ones. __ times the tens. Add the rows." |
| MB-11 | range | Multiply three digits by two digits | range | | digits | as MB-10 |
| MB-12 | unknown | Find the missing digit | unknown | Short-dash digit box inside a worked product | one digit | "The missing digit is __." |
| MB-13 | fade | Multiply without the regroup boxes | scaffold | The boxes go | digits | unchanged |
| MB-14 | apply | Solve equal-groups and area stories | representation | Work grid beside the story | number + unit | "__ times __ equals __ {unit}." |
| MB-15 | test | Review; Test A / B | — | **4 items at L** (long procedure) | | |
| MB′-a | setup | Split the number into tens and ones | responseScope `setup` | Area model with its two column heads to fill | two numbers. "Do _not_ multiply." | "__ is __ tens and __ ones." |
| MB′-b | representation | Multiply with an area model, one-digit multiplier | representation | | numbers in the boxes + the total | "__ times __ plus __ times __." |
| MB′-c | range | Area model, two-digit multiplier | range | Four boxes | as above | as above |
| MB′-d | representation | Split an array to multiply | representation | The distributive property drawn | as above | as above |

**Misconceptions:** **M-M6** (the placeholder zero omitted — the single biggest 2 × 2 error, and the only
reason MB-9 exists as a step of its own), **M-M5** (added the regrouped ten *before* multiplying instead
of after — the reason MB-6's `Say:` band has the word **Then** in it), M-M7 (multiplied by the ones digit
of the multiplier only and stopped), M-M2 (a close fact inside the algorithm).

---

## 17. DL — long division

**Strategy:** divide, multiply, subtract, bring down — on a digit grid, under the US bracket.
**Pre-skill check:** DF facts and remainders; multi-digit subtraction; multiplying a one-digit number;
which multiple of the divisor is nearest below a number.

**Structural:** the US bracket; the work grid under it, one column per place; the quotient row above the
bracket; the `R` slot; the estimate box (from DL-10). None is removed by any step in this ladder — P-31's
"Keep structural supports on tests" is on by default and stays on here.
**Hints:** the four step words printed beside the first cell (H2); the first cycle traced (H5); the
underline under the part being divided (H4).

Every rung from DL-3 opens with a **scripted Model page** (P-LC-9): one problem redrawn once per step,
newest marks grey, earlier marks black.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| DL-1 | decide | Underline the part I divide first | start / responseScope `decision` | Bracket problems. Underline the first digit, or the first two when the first is smaller than the divisor. No answer slot | one underline. "Do _not_ solve." | "__ does not go into __. Take two digits." |
| DL-2 | setup | Rewrite a division under the bracket | responseScope `setup` | `84 ÷ 4` above an empty bracket | the digits. "Do _not_ solve." | "The number being shared goes inside." |
| DL-3 | procedure | Divide a two-digit number, no remainder | responseScope `full` | Digit grid, 4 per page | digits | "Divide. Multiply. Subtract. Bring down." |
| DL-4 | case | Divide with a remainder | range | An `R` slot after the quotient | digits + the remainder | "__ groups and __ left over." |
| DL-5 | range | Divide a three-digit number | range | | digits | as DL-3 |
| DL-6 | case | Write a zero in the quotient | range | `312 ÷ 3`. The place where the divisor does not go still gets a digit | digits | "__ does not go into __. Write zero." |
| DL-7 | range | Divide a four-digit number | range | | digits | as DL-3 |
| DL-8 | judge | Check by multiplying | responseScope `judge` | Finished divisions in black, half wrong. A work space for `quotient × divisor + remainder` (P-TH-8). Boxes **Correct** / **Fix it** | one checked box + the answer when Fix it | "__ times __ plus __ equals __." |
| DL-9 | decide | Round the divisor to the nearest ten | responseScope `decision` | The two-digit-divisor pre-skill, taught as a lesson | one number circled on a number line | "__ is nearer to __." |
| DL-10 | notate | Write my estimate in the estimate box | responseScope `notation` | Estimate box beside the grid. **No dividing** | one number. "Do _not_ divide." | "About __ groups." |
| DL-11 | procedure | Divide by a two-digit number, 10 to 25 | responseScope `full` | The small-divisor band first (K5's step) | digits | as DL-3 |
| DL-12 | range | Divide by any two-digit number | range | | digits | as DL-3 |
| DL-13 | case | Fix an estimate that is too big | range | The product exceeds what is there | digits | "__ is too big. Try __." |
| DL-14 | case | Fix an estimate that is too small | range | The remainder is bigger than the divisor | digits | "__ is left. That is too many. Try __." |
| DL-15 | apply | Solve division stories and use the remainder | representation | **Two unit-labelled questions** in one cell: "How many full boxes?" and "How many are left?" | two numbers + units | "__ full __, and __ left." |
| DL-16 | test | Review; Test A / B | — | 12 items; **4 per page** | | |

**Misconceptions:** **M-D2** (a place skipped in the quotient — `312 ÷ 3 = 14`, and DL-6 exists only for
it), M-D6 (the subtraction or the multiplication *inside* the division is wrong — Miller & Milam found
42% of mistakes on a division item were subtraction or multiplication errors, not division errors, which
is why DL-8's check is a rung and not a footnote), M-D3 (remainder ≥ divisor, DL-14), M-D7 (brought the
next digit down but wrote no quotient digit for it).

---

## 18. XD — discrimination: where two procedures collide

P-11. Each rung is a `discriminate` step, placed at the point in the ladders above where its two
procedures first meet. They are gathered here because they share one cell design: **a rule in a rounded
box at the top, one decision per item, no solving by default** (P-TH-9), and a second form that asks the
pupil to act on the decision (P-TH-10).

| # | Where it sits | The collision | The response | Say: |
|---|---|---|---|---|
| XD-1 | after SF-23 | Add or subtract | Circle the sign, then solve (`circle-sign`) | "The sign says __." |
| XD-2 | after AC-9 and SC-9 | Regroup or no regrouping, over both operations | Check one box | "The top is __. The bottom is __." |
| XD-3 | at MF-4 | Can I multiply, or must I add? | Check one box | "Each group has __." |
| XD-4 | after MF-24 | Missing addend or missing factor | Check one box, then solve only the ones you checked (`can-solve`) | "__ plus __, or __ times __." |
| XD-5 | after DF-20 | Multiply or divide | Circle the sign, then solve | "The sign says __." |
| XD-6 | after MB-14 | "3 more" or "3 times as many" in a comparison story | Check one box: **Add** / **Multiply**; a bar diagram to fill | "__ more, or __ times as many." → frame: "__ is __ more than __." |
| XD-7 | after XD-5 | **Which sign makes it true?** | Write one sign in the circle: `+ − × ÷`. **This is the only legal home for a missing-operator item in the whole family** (§2.3), and its response is a written sign, never four buttons (P-29) | "__ and __ make __, so the sign is __." → frame: "The sign is __." |
| XD-8 | after BT-5 | Make ten or just add | Check one box | "This one goes past ten." |
| XD-9 | after SZ-6 | Does anything cross this zero? | Check one box | "This zero gets __ more." |

XD-7 is worth stating twice. The audit finds a `missing-operator` print format leaking into `add`,
`subtract`, `multiply`, `divide`, `mixed_add_sub`, `mixed_subtraction`, `mixed_mult_div` and
`mixed_division` — and in `multiply` it produces `12 ? 7 = 84` answered as a four-way multiple choice.
Every one of those is the XD-7 item in the wrong skill and in the wrong response mode.

---

## 19. What each page role does with these steps

P-27: every step above must render on every page role. The three that are easy to get wrong:

| Page role | What it takes from a step | What it must not do |
|---|---|---|
| **Error analysis** | the step's cell, one finished item per cell in **black**, wrong answers drawn from §20 by the step's misconception ids, about half wrong (P-TH-3) | never a random wrong number (P-TH-2); never a wrong answer equal to the right one |
| **True or False?** | the step's own item; a true statement uses the answer, a false one uses `wrongAnswer(q)` from §20 | never more than 2 blanks in the evidence frame |
| **Reason It** | Spot the mistake uses the step's misconception; Always/Sometimes/Never uses the step's rule box | never a named character — A and B only (P-TH-14) |

A step with a `decision`, `notation` or `setup` scope supplies `decision(q)` for the discrimination page
directly. A `full` step supplies it by deriving the decision from its own constraints (does this item
regroup? does this one go past ten?).

---

## 20. The misconception bank

This is the part the error-analysis, True or False? and Reason It generators are built from, so each entry
names a **mechanism** and a **wrong-answer rule** a generator can actually compute. Entries marked
**[evidenced]** are named in the sources of §1.1 with a frequency; entries marked **[house]** are ours,
asserted from the design of the step, and should be treated as lower-confidence until seen in a pupil's
work.

### 20.1 Addition

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| M-A1 | Regrouped the ones but did not add the regrouped ten into the next column | answer = correct − 10 × (number of regroups) | AC-9 | **[evidenced]** 172 errors / 7 items; 30% of all multi-digit addition errors; Cox's `48 + 3 = 41` |
| M-A2 | Wrote the whole ones total in the ones place and did not regroup at all | concatenate the column totals: `27 + 18` → `315` | AC-8 | **[evidenced]** Ashlock's classic; the mirror of M-A1 |
| M-A3 | Added every digit as a separate number | answer = sum of all digits: `21 + 13` → `7` | AC-4, TN-4 | **[evidenced]** 227 errors / 6 items |
| M-A4 | Regrouped when no regroup was needed (wrote a phantom 1) | answer = correct + 10 | AC-7 non-examples | **[house]** |
| M-A5 | Lined ragged addends up on the **left** | `34 + 5` → `84` (5 read as 5 tens) | AC-3, AC-14 | **[house]**, but MW4K and K5 both sell 2d+1d as a separate sheet, which is indirect evidence |
| M-A6 | Counted on **including** the starting number | answer = correct − 1 | AF-4 | **[evidenced]** within "miscalculation (+, −), close or counting error", 202 errors / 14 items |
| M-A7 | Subtracted instead of adding | answer = \|a − b\| | AF-5 on | **[evidenced]** 212 errors / 7 items |
| M-A8 | `n + 0 = 0` (zero treated as it is in multiplication) | answer = 0 | AF-16 | **[house]** |
| M-A9 | Added the first two addends and stopped | answer = a + b, ignoring c | CM-5 | **[evidenced]** the published example of "procedural error", 254 errors / 9 items, is a three-addend column |
| M-A10 | With three or four addends the carry can be 2 or 3, but the regroup box is read as the familiar "1", so the extra tens are dropped | for the column whose carry `c ≥ 2`: answer = correct − 10 × p × (c − 1), where `p` is that column's place value. `7 + 8 + 9 = 24`, carry 2 read as 1 → the tens column is 10 short | CM-4 | **[house]**, and the reason CM's box is specified wide. *(Corrected 2026-09-20: the previous rule assumed a two-digit carry, which 3–4 single-digit addends cannot produce — the carry is at most 3 — and was not computable as written.)* |
| M-A11 | Put the comma in by digit count rather than by place | `12,345` written `1,2345` | AC-15 | **[house]** |

### 20.2 Subtraction

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| **M-S1** | **Subtracted the smaller digit from the larger in each column, regardless of which is on top** | per column: \|top − bottom\|. `721 − 358` → `437` | SC-9 | **[evidenced]** 189 errors / 2 items; **31.2% of all multi-digit subtraction errors**; Brown & Burton's smaller-from-larger bug |
| M-S2 | Took the ten but did not reduce the digit it was taken from | ones column correct, next column un-decremented: answer = correct + 10 × (place value of the column) | SC-8 | **[evidenced]** Brown & Burton's no-decrement bug |
| M-S3a | At a run of zeros, took ten for the ones but left the zeros as 0 and decremented only the leftmost digit | `400 − 157` → `253` (ones 10 − 7 = 3; tens 0 − 5 read smaller-from-larger as 5; hundreds 3 − 1 = 2) | SZ-2 | **[evidenced]** "borrow across zero failure" |
| M-S3b | Wrote 9 in every zero column **and** also decremented the digit to its left twice | `400 − 157` → `143` | SZ-3 | **[house]**, the over-correction that appears once M-S3a is taught against |
| M-S4 | `0 − n = 0` | the column answers 0 wherever the top digit is 0: `400 − 157` → `300` | SZ-2, SF-15 | **[house]** |
| M-S5 | Added instead of subtracting | answer = a + b. `7 − 3` → `10` | SF-4 on | **[evidenced]** 246 errors / 11 items — **the most common identifiable error across the whole study** |
| M-S6 | Counted back **including** the starting number | answer = correct + 1 | SF-3 | **[evidenced]** within the counting-error class |
| M-S7 | `n − n = n`, or `n − 0 = 0` | as stated | SF-15 | **[house]** |
| M-S8 | Reversed a ragged problem so the shorter number went on top | `346 − 8` treated as `8 − 346`, or the columns swapped | SC-15 | **[house]** |
| M-S9 | Regrouped from the wrong place (took from the hundreds to help the ones) | `346 − 8` → `248` (hundreds 3 → 2, ones 6 → 16, 16 − 8 = 8, tens untouched) | SC-15 | **[house]** |

### 20.3 Multiplication

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| M-M1 | Added the factors | answer = a + b. `3 × 4` → `7` | MF-8 | **[evidenced]** named in the literature review of the cited study (Siegler 1988; Zhang et al. 2014) |
| M-M2 | Reported a neighbouring fact from the same table | answer = a × (b ± 1). `3 × 5` → `12` | MF-13 on | **[evidenced]** 77 errors / 4 items; the top identifiable multiplication error at 20.0% |
| M-M3 | Wrote the two factors side by side | concatenate. `2 × 3` → `23`; `5 × 2` → `52` | MF-8 | **[evidenced]** 18 errors, "did not understand prompt" |
| M-M4 | `n × 0 = n` (zero treated as it is in addition) | answer = n | MF-5 | **[house]**, and the reason MF-5 is an early rung |
| M-M5 | Added the regrouped ten **before** multiplying instead of after | `27 × 3`: ones 21 → write 1 carry 2; then `(2 + 2) × 3 = 12` → `121` | MB-6 | **[evidenced]** Ashlock's classic multiplication pattern |
| M-M6 | Omitted the placeholder zero in the second partial product | second partial product shifted one place right; `24 × 13` → `72 + 24 = 96` (correct is `72 + 240 = 312`) | MB-10 | **[evidenced]** universally named; MB-9 exists for it |
| M-M7 | Multiplied by the ones digit of the multiplier only | answer = a × (ones digit of b) | MB-10 | **[evidenced]** the "incomplete procedure" class, 7.4% of multiplication errors |

### 20.4 Division

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| M-D1 | Added, or subtracted, instead of dividing | answer = a + b, or a − b | DF-7 | **[evidenced]** 31.9% of errors on division items were addition; 22.3% subtraction |
| **M-D2** | Skipped the place where the divisor does not go, so the quotient lost a digit | `312 ÷ 3` → `14` | DL-6 | **[evidenced]** CommonCoreSheets sells a sheet for exactly this; DL-6 exists for it |
| M-D3 | Left a remainder greater than or equal to the divisor | `17 ÷ 3` → `4 R 5` | DF-27, DL-14 | **[house]**, though the "adjust quotients" skill at IXL grade 5 is indirect evidence |
| M-D4 | Read the bracket backwards: divided the divisor by the dividend | `12 ÷ 3` from `3⟌12` answered as the quotient of `3 ÷ 12` | DF-4 | **[house]**, and the reason DF-4 is a `format` rung with a matching task |
| M-D5 | `n ÷ n = 0`, `0 ÷ n = n`, or `n ÷ 1 = 1` | as stated | DF-10 | **[house]** |
| M-D6 | The subtraction or the multiplication **inside** the division is wrong, not the division | the quotient digit is right, the working is not | DL-3 on | **[evidenced]** Miller & Milam: 42% of mistakes on a division item were subtraction or multiplication errors |
| M-D7 | Brought the next digit down but wrote no quotient digit for it | quotient is one digit short | DL-5 | **[house]**, sibling of M-D2 |

### 20.5 Bridging ten, fact families, equality

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| M-B1 | Split the second addend correctly but then added the **whole** addend to ten | `8 + 5` → `8 + 2 = 10`, then `10 + 5` → `15` | BT-4 | **[house]** |
| M-B2 | Split so that the wrong part completes the ten | `8 + 5` → `8 + 3 = 11` | BT-3 | **[house]** |
| M-B3 | Answered with the sum of the two split parts | `8 + 5` → `2 + 3 = 5` | BT-2 → BT-3 boundary | **[house]** |
| M-F1 | Put the whole into a part slot | `8, 5, 13` → `13 + 5 = 8` | FF-4 | **[house]** |
| M-F2 | Wrote four facts of which two are duplicates | `8 + 5` and `5 + 8` written twice | FF-4 | **[house]** |
| M-F3 | For a double, wrote four "different" facts | `6, 6, 12` → four frames filled with two facts repeated | FF-7 | **[house]**, and the reason FF-7 prints two frames |
| M-F4 | For × ÷, wrote both `12 ÷ 4 = 3` and `4 ÷ 12 = 3` | divisor and dividend swapped in the second fact | FF-15 | **[house]** |
| M-U1 | Read `=` as "the answer comes next", so `7 = 3 + 4` looks false | any equation with the result on the left is marked False | AF-22 | **[evidenced]** the reason IXL has a whole 1.OA.D.7 block; universally named |
| M-U2 | Solved `5 + __ = 8` by adding the two numbers shown | answer = a + c | AF-23, SF-21 | **[house]** |
| M-T1 | Read a teen number's digits as separate numbers | `13 + 4` → `1 + 3 + 4 = 8` | TN-4 | **[evidenced]** a special case of M-A3 |
| M-X1 | Copied part of the problem as the answer | answer = one of the operands | anywhere | **[evidenced]** 97 errors across **20 of the 21 items** — it is the sign that the pupil has no procedure at all, and it is the one "error" that should trigger a step *back*, not an error-analysis page |

**M-X1 is a teaching signal, not a distractor.** It must never be used as a wrong answer on a True or
False? or error-analysis page, because "the answer is one of the numbers in the question" is not a
misconception a pupil can spot and fix.

---

## 21. Density check: does the item fit our page?

Read against `WORKSHEET_DESIGN_STANDARD.md` §12.1 (ceilings by page role) and §12.3 (capacity tables), and
`PEDAGOGY_STANDARD.md` §2.2 (item caps per page). **Where the two differ, the teaching cap binds** — the
layout engine may place fewer than a ceiling, never more.

| Cell shape | Steps | Layout ceiling (S / M / L) | Teaching cap | Verdict |
|---|---|---|---|---|
| Vertical fact, 1-digit operands | AF-4…, SF-3…, MF-8…, DF-7… | fact rows at 5–10 columns: 30 / 36 / 49 / 64 / 81 / 90 per page, Day bands ≤ 30 | probe 20 (15 vertical + 5 horizontal); lesson page 6 | **Fits.** The Day band, not the page, is the unit |
| Horizontal fact | AF-5, SF-4, MF-12 | 4 columns: 60 / 56 / 44 | as above | **Fits** |
| Decision cell (no answer slot) | AF-3, AC-7, SC-7, BT-7, MF-4, DF-6, TN-7, all of XD | 12 / 8 / 6–8 | 8–16 one-mark items | **Fits** |
| Bridging-ten cell (two ten frames + three-blank split frame) | BT-3, BT-4 | ten frame double: 16 / 9 / 9; but the split frame adds a second band | **4 at L**, 6 at S and M | **Tight.** The one place the 2 × 3 grid fails at L. The step must declare 4 |
| Fact-family triangle + four frames | FF-4, FF-9 | number bonds 12 / 9 / 9 | 6 on a lesson page; **40 on a fact-family probe** | **Fits**, but the probe layout and the lesson layout are different cells |
| 2-digit column, regroup boxes on | AC-9, SC-9 | stacked T = 3 with regroup scaffolds → use the Daily columns: 6 / 5 / 4; "regroup scaffolds on at 3 columns: 15 / 12 / 9" | **6** | **Fits with room** |
| 3-digit column, regroup boxes on | AC-11…13, SC-12…14 | T = 4 → 6 / 4 / 3 columns | 6 | **Fits** at S and M; at L, 3 columns × 2 rows = 6 |
| 4-digit column | AC-15, SC-16, SZ-3, SZ-5 | T = 5 → I Can 6 / 4 / 3; **with regroup scaffolds use Daily 5 / 3 / 3 (TY-21)** | 6 | **Fits** — at L, 3 columns × 2 rows = 6 |
| 5- and 6-digit column | AC-16, SC-17 | T = 6 → 5 / 4 / 3; T = 7 → 5 / 3 / 2 | 6, but 4 for long procedures | **At L, declare 4.** See Q7 |
| 3- or 4-addend column | CM-5, CM-6, CM-7 | T = 5 (3 × 2-digit) → 5 / 3 / 3 Daily columns; the extra rows raise cell height | 6 at S and M, **4 at L** | **Fits with the L cap** |
| 1 × 2 and 1 × 3 multiplication | MB-4, MB-6, MB-7 | multiply by 2-digit at 3 columns: 12 / 9 / 9 | 6 | **Fits** |
| 2 × 2 multiplication (two partial products + two regroup rows) | MB-10, MB-11 | as above, taller cell | **4** (long procedure) | **Declare 4 at every size** |
| Long division 2 ÷ 1 | DL-3, DL-4 | 20 / 12 / 9 max; Auto 16 / 9 / 9 | 4 | **Fits; the cap binds hard** |
| Long division 3 ÷ 1 and 4 ÷ 1 | DL-5, DL-7 | 12 / 9 / 6 and 12 / 6 / 4 | 4 | **Fits** |
| Long division 4 ÷ 2 | DL-12 | 9 / 6 / 4 | 4 | **Fits exactly at L** |
| Judge cell (finished work + boxes + work space) | SC-20, DF-27, DL-8 | error analysis: 6 / 4 / 2–4 | 6, **4 for long algorithms** | **Fits;** DL-8 must declare 4 |
| Word problem v1 / v2 | AF-26, SF-25, AC-20, SC-21, CM-9, MB-14, DL-15 | v1: 1 per page. v2: 2 per page | 1 and 2 | **Fits.** DL-15's two unit-labelled questions are one cell, not two |
| Base-10 bridging cell | AC-1, AC-6, SC-1, SC-6 | base-10 to 99: 16 / 12 / 9; 100–299: 6 / 4 / 4 | 6 | **Fits to 99; at 3 digits, 4 at M and L** |

Two places where the content does **not** fit and the step must say so, rather than the layout shrinking
(P-LC-10, DN-2): **BT-3 / BT-4 at size L** and **every long procedure at size L**. Both are declared in
the tables above, not discovered at print time.

---

## 22. The gap table

The working list for the next wave. Read against `js/modules/data.js` (58 + 51 + 21 + 16 = **146** skills
in `addition`, `subtraction`, `multiplication`, `division`) and `design/SKILL_CATALOGUE.md`.

Verdicts: **OPT** the step is this skill with option values, no code change to the id; **FIX** the skill
exists and is right in principle but its generator fails the audit; **REDO** the generator does not
produce what the name says at all; **SPLIT** one id must serve two steps via an option, or is two
operations in one; **MERGE** a twin that becomes a `practiceLevel` value; **NEW** no skill exists.

### 22.1 Step → skill today

| Step | Skill today | Verdict | Note |
|---|---|---|---|
| AF-1 | `add_5_pictures` | REDO | Prints full-colour emoji; item 6 of the baseline prints no picture at all |
| AF-2 | `add_5_pictures` | OPT | `frame = picture+symbols` |
| AF-3 | `add_facts` | OPT | `responseScope = decision` |
| AF-4 … AF-21 | `add_facts` | FIX | Needs `facts`, `band`, `cuePart`, `turnaround`. Audit: cannot emit a zero operand; mixes vertical and horizontal in one section |
| AF-10, AF-21 | `add_20_mixed`, `add_50_mixed` | FIX | Band wrong by up to 2× (audit: "Add within 20" reached 40) |
| AF-16 | — | NEW `add_zero_turnaround`, **or** `add_facts` `facts:[0]` + `turnaround:on` | Prefer the option (Q11) |
| AF-22 | `equal_sign` | REDO | Never produces a true/false equation; falls through to plain sums |
| AF-23, AF-24, AF-25 | `cloze_addition` | REDO | Dropdown on screen, unanswerable blank on paper |
| AF-26 | `add_wp_10` … `add_wp_1m` (8 ids) + 8 `_plain` twins | FIX + MERGE | Bands wrong on all of them; `_plain` are already aliases, so the merge is bookkeeping |
| AF-27 | `add_facts` | OPT | Test role |
| — (doubles / near doubles ladder) | — | NEW `add_doubles`, `add_near_doubles` | Optional second ladder, not on the critical path |
| SF-1, SF-2 | `sub_5_pictures` | REDO | Audit: 10 distinct items in 200 |
| SF-3 … SF-20 | `sub_facts` | FIX | Audit: 79 distinct items in 200; no zero operand |
| SF-9, SF-19 | `sub_20_mixed` | FIX | |
| SF-15 | — | NEW `sub_zero_all` **or** `sub_facts` `facts:[0]` | `n − 0` and `n − n` ride together |
| SF-21 … SF-23 | `missing_add_sub` | SPLIT | Audit: mixes + and −. The − half becomes `unknown = subtrahend / minuend` |
| SF-24 | `mixed_add_sub` | REDO | Audit: mixes −, −, + with **10** print formats in one skill |
| SF-25 | `sub_wp_10` … `sub_wp_1m` + `_plain` | FIX + MERGE | |
| BT-1, BT-2 | — | NEW `make_ten_frames`, `split_a_number` | |
| BT-3 … BT-6 | **`add_10_regroup`** | REDO | Ruling 2. This id stops meaning "add within 10 with regrouping" (an empty set — audit confirms) and starts meaning bridging ten. Id kept, label changed |
| BT-7 | `add_10_mixed` | OPT | `responseScope = decision` |
| BT-8 | `add_wp_20` | OPT | Band 18 |
| TN-1 … TN-3 | — | NEW `teen_ten_and_ones` | v1 item 22 |
| TN-4 | `add_20_no_regroup` | FIX | Audit: 54% outside the band of 20, reaching 39 |
| TN-5 | `sub_20_no_regroup` | FIX | |
| TN-6 | `sub_20_regroup` | FIX | |
| TN-7 | `sub_20_mixed` | OPT | `responseScope = decision` |
| — | **`sub_10_regroup`** | RENAME | See §22.3: this is **"Subtract From 10"**, a real and useful step with exactly nine items, not an empty set |
| FF-1 … FF-5, FF-9, FF-10 | `add_sub_fact_family` | FIX | Audit: flips 60/40 between "fill all four" and "fill one" with no option |
| FF-2 … FF-4 | `number_families_add`, `_med`, `_hard` | REDO + MERGE | **1 distinct item in 200.** Then merge the three into a `practiceLevel` |
| FF-6 | — | NEW `fact_family_sort` | The non-example sort; both MW4K pages have it |
| FF-7, FF-8 | `add_sub_fact_family` | OPT | `edgeCases` |
| FF-12 … FF-22 | `mult_div_fact_family` | FIX | |
| FF-12 … FF-22 | `number_families_mult`, `_med`, `_hard` | REDO + MERGE | **1 distinct item in 200** |
| AC-1, AC-2, AC-6 | — | NEW `add_2d_blocks` | Base-10 bridging and set-up |
| AC-3, AC-14 | `add_100_no_regroup` | OPT | `lengths = ragged`. Today `minVal = max(2, maxVal/10)` forbids a short addend beside a long one |
| AC-4 | `add_50_no_regroup`, `add_100_no_regroup` | FIX | |
| AC-5 | any `add_*` | OPT | `responseScope = setup` — **no skill supports this scope today** |
| AC-7 | `add_100_mixed` | OPT | `responseScope = decision` |
| AC-8 | `add_50_regroup` | OPT | `responseScope = notation` |
| AC-9, AC-10 | `add_50_regroup`, `add_100_regroup` | FIX | Audit: `add_100_regroup` is **100% outside its band** |
| AC-11 … AC-13 | `add_1k_regroup` | FIX + OPT | `regroupPlaces`. Audit: 63 of 200 items do not regroup at all |
| AC-15 | `add_10k_*` | FIX | Audit: 80% outside band, reaching 19,467 |
| AC-16 | `add_100k_*`, `add_1m_*` | FIX | Audit: `add_1m_no_regroup` **regroups** on 5 of 200; `add_1m_regroup` fails to regroup on 94 of 200 |
| AC-17, AC-18 | any `add_*` | OPT | `scaffold` fade — no skill supports it today |
| AC-19 | — | NEW `add_missing_digit` | v1 item 15; dashed digit box |
| AC-20 | `add_wp_100`, `add_wp_1k` | FIX | |
| — | `add_sub_10s`, `add_sub_100s` | SPLIT | Audit: each tosses a coin between + and −, and yields **20 distinct items in 200** |
| SC-1, SC-2, SC-6 | — | NEW `sub_2d_blocks` | |
| SC-3, SC-15 | `sub_1k_no_regroup` | OPT | `lengths = ragged` |
| SC-4 | `sub_50_no_regroup`, `sub_100_no_regroup` | FIX | |
| SC-5 | any `sub_*` | OPT | `responseScope = setup` |
| SC-7 | `sub_100_mixed` | OPT | `responseScope = decision` |
| SC-8 | `sub_50_regroup` | OPT | `responseScope = notation` |
| SC-9 … SC-11 | `sub_50_regroup`, `sub_100_regroup` | FIX | Audit: 12 of 200 `sub_100_regroup` items do not regroup |
| SC-12 … SC-14 | `sub_1k_regroup` | FIX + OPT | `regroupPlaces`; 21 of 200 do not regroup |
| SC-16, SC-17 | `sub_10k_*`, `sub_100k_*`, `sub_1m_*` | FIX | 53, 86 and 85 of 200 items respectively fail to regroup |
| SC-19 | — | NEW `sub_missing_digit` | |
| SC-20 | — | NEW `sub_check_by_adding` | v1 item 20 |
| SC-21 | `sub_wp_100`, `sub_wp_1k` | FIX | |
| SZ-1 … SZ-6 | — | **NEW ×6**: `sub_from_whole_ten`, `sub_from_whole_hundred`, `sub_from_whole_thousand`, `sub_across_one_zero`, `sub_across_two_zeros`, `sub_zeros_middle` | **No skill covers any rung of SZ today.** The 15% random zero injection inside `sub_*_regroup` must be removed first, or SC and SZ will overlap |
| CM-1, CM-2 | `add_three` | FIX | Audit: 93 distinct items in 200; each addend gets its own categorical colour fill |
| CM-3 … CM-8 | — | NEW `add_column_multi` | v1 item 8 |
| MF-1, MF-2 | `arrays_groups` | FIX | Audit: **30 distinct items in 200** |
| MF-2 (extra practice) | `dot_array_mult` | FIX | 75 distinct in 200; its prompt states `r × c` |
| MF-3 | — | NEW `repeated_add_to_mult` | |
| MF-4 | — | NEW `equal_or_unequal_groups` | |
| MF-5 | — | NEW `mult_by_0_1` **or** `mult_facts` `facts:[0]`,`[1]` | Audit: `mult_facts` never emits 0 |
| MF-6 | `mult_properties` | SPLIT | Commutative here; distributive to MB′-d |
| MF-7 … MF-22 | `mult_facts` | FIX | Needs `facts`, `cueStyle`, `factRange`, `notation` |
| MF-11 | `mult_facts` | OPT | The empty strip is a scaffold value, not a cue part |
| MF-23, MF-24 | `missing_mult_div` | SPLIT | Audit: mixes × (85) and ÷ (115) in one skill |
| MF-25 | `mult_chart` | FIX | |
| — | `mult_chart_easy`, `_medium`, `_hard` | REDO + MERGE | **1 distinct item in 200** each |
| DF-1 | — | NEW `share_into_groups` | |
| DF-2, DF-3 | — | NEW `read_div_equation`, `write_div_equation` | |
| DF-4 | `div_facts` | OPT | `notation = bracket`; today the three notations rotate at random |
| DF-5 | `nl_div` | FIX | Audit: 82 distinct in 200 |
| DF-6 | `div_facts` | OPT | `responseScope = decision` |
| DF-7 … DF-20 | `div_facts` | FIX | Audit: never emits a zero operand |
| DF-10 | `div_facts` | OPT | `edgeCases`; `÷ 0` never generated |
| DF-21 | `mult_div_fact_family` | OPT | |
| DF-22 … DF-24 | `missing_mult_div` | SPLIT | `unknown = dividend / divisor / quotient`, one per step |
| DF-25, DF-26 | `div_remainders` | FIX | |
| DF-27 | — | NEW `remainder_too_big` | |
| DF-28 | `div_word_problems` | FIX | Audit: 83 distinct in 200 |
| MB-1, MB-2 | — | NEW `mult_zeros` | v1 item 10; the sites all put this **before** the algorithm |
| MB-3 | `multiply` | OPT | `responseScope = setup` |
| MB-4 … MB-8, MB-10, MB-11 | `multiply` | REDO | Audit: emits ×182, −4, ÷7, +7 and **24 multiple-choice items**. The generator is not a multiplication generator |
| MB-5 | `multiply` | OPT | `responseScope = notation` |
| MB-9 | — | NEW `mult_placeholder_zero` | The single biggest 2 × 2 error (M-M6) |
| MB-12 | — | NEW `mult_missing_digit` | |
| MB-13 | `multiply` | OPT | `scaffold` fade |
| MB-14 | `mult_word_problems` | FIX | Audit: 81 distinct in 200, three print formats |
| MB′-a … MB′-c | `area_model_mult`, `area_model_mult_hard` | OPT + MERGE | Both pass the audit today — the healthiest pair in the family |
| MB′-d | `mult_properties` | SPLIT | |
| DL-1, DL-2 | `divide` | OPT | `responseScope = decision` / `setup` |
| DL-3 … DL-7 | `divide` | REDO | Audit: emits ÷185, −7, +5, ×3 and **20 multiple-choice items** |
| DL-6 | — | NEW `div_zero_in_quotient` | `312 ÷ 3` (M-D2) |
| DL-8 | — | NEW `div_check_by_multiplying` | v1 item 20 |
| DL-9 … DL-12 | `long_div_2digit` | REDO | Audit: **15 distinct items in 200** |
| DL-13, DL-14 | — | NEW `div_fix_estimate` | |
| DL-15 | `remainder_interpret`, `remainder_contexts` | OPT + MERGE | `remainder_contexts` is a context bank, not a skill |
| XD-1 | `mixed_add_sub` | REDO | |
| XD-2 | `add_100_mixed` / `sub_100_mixed` | OPT | |
| XD-3 | `arrays_groups` | OPT | |
| XD-4 | — | NEW `missing_factor_or_addend` | |
| XD-5 | `mixed_mult_div` | REDO | Audit: ÷139 vs ×19, **13** print formats, 3 multiple-choice items |
| XD-6 | `mult_comparison`, `mult_comparison_plain`, `comparison_word` | OPT + MERGE | `mult_comparison` passes the audit today |
| XD-7 | — | NEW `which_sign` | And the `missing-operator` branch is **removed** from `add`, `subtract`, `multiply`, `divide`, `mixed_add_sub`, `mixed_subtraction`, `mixed_mult_div`, `mixed_division` |
| XD-8 | `add_10_mixed` | OPT | |
| XD-9 | `sub_zeros_middle` | OPT | |

### 22.2 Skills with no step of their own

Not a defect in most cases — P-27 still requires them to render on every page role.

| Skill(s) | Why it has no step | What to do |
|---|---|---|
| `mixed_addition`, `mixed_subtraction`, `mixed_multiplication`, `mixed_division`, `mixed`, `operations_all` | Review pools by design; they belong to no ladder | Keep, but make them honest: each currently mixes 10–15 print formats in one skill (P-28). A pool declares `opMix` and titles itself as mixed |
| `add`, `subtract`, `multiply`, `divide` ("Basic …") | They are the generic engine behind many steps, not a step | REDO to one operation each; they are the four skills the audit catches emitting all four operations |
| 16 `add_wp_*_plain`, `sub_wp_*_plain`, `mult_word_problems_plain`, `mult_comparison_plain`, `div_word_problems_plain`, `word_problems_mixed_plain`, `add_word_problems_plain`, `sub_word_problems_plain` | The `_plain` twins are already implemented as aliases | MERGE into `pictures: off` on the parent (P-AT-9) |
| `nl_add` / `number_line_add`, `nl_sub` / `number_line_sub` | Duplicate pairs: one colour, one B&W | MERGE; the B&W one is the survivor under the design contract |
| `dot_array_mult` | Extra practice beside MF-2, not a rung | Keep as a practice pool |
| `box_division_easy`, `box_division_hard`, `area_model_div_2by1`, `area_model_div_3by1` | The optional second division ladder DL′ | Keep; `area_model_div_*` fail on repetition (69 and 70 distinct in 200) |
| `number_families_mixed`, `_med`, `_hard` | They mix all four operations in one cell (P-28) | Keep as a mixed-review pool, titled as one |
| `unknown_start_wp` | Audit: 100 + and 100 − items in one skill | SPLIT: the `get` variant is an **addition** start-unknown story and belongs to AF-26 |
| `remainder_contexts` | A context bank on `remainder_interpret` | MERGE |

### 22.3 Skills whose name does not match what its step teaches

The list the next wave should read first, because each one is a sheet that goes out wrong.

| Skill | Label today | What it actually does | Correct name / step |
|---|---|---|---|
| `add_10_regroup` | ~~"Add within 10 (With Regrouping)"~~ → **already renamed** to "Add — Bridging Ten (sums 11–18)" | **Settled in code, 2026-09-20, as §7 asks.** 36 members, both addends single-digit, every sum 11–18 and every item genuinely bridging (`7+5`, `9+9`, `8+3` …); all correct on a 20-item dump | **Bridging Ten** (§7) — **done.** The `variety` note the gate still prints on it is a false positive: 36 *is* the complete ordered set for sums 11–18 |
| `sub_10_regroup` | ~~"Subtract within 10 (With Regrouping)"~~ → **already renamed** to "Subtract — Bridging Ten (minuends 11–18)" | **Settled in code, 2026-09-20, differently from the recommendation below.** The shipped skill is the exact mirror of `add_10_regroup`: minuends 11–18, single-digit subtrahend, 36 members, all bridging ten (`12 − 7`, `18 − 9`, `11 − 8` …), every answer correct on a 20-item dump | The original recommendation — **Subtract From 10** (`10 − n`, nine members) — is **not** what shipped, and a nine-item set cannot fill a 6-item page across a term. Treat "Subtract From 10" as an *earlier, separate* rung if the owner wants it, not as a rename of this id. §12 / SU-F F14 should be read against the shipped label |
| `equal_sign` | "True/False Equations (Visual)" | Has no branch in the operations generator and no `skillCategoryOverride` entry, so it falls through to plain sums | **Tell If Two Sides Are Equal** (AF-22) |
| `cloze_addition` | "Pick the Missing Addends (Dropdown)" | Prints `___ + ___ = 18` with no list, no rule and no bank. Unanswerable on paper | **Find the Missing Number** (AF-23 … AF-25) |
| `add`, `subtract`, `multiply`, `divide` | "Basic Addition / Subtraction / Multiplication / Division" | ~~Each emits all four operations plus a four-way multiple-choice missing-operator item~~ — **fixed upstream 2026-09-20.** All four now emit one operation and no multiple choice; 20-item dumps are clean (`multiply`: `6×8=48`, `7×7=49`, `12×12=144`; `divide`: `48÷6=8`, `144÷12=12`). **Residual:** at Max Number 100 both still emit answers above the band (`12 × 12 = 144`, `132 ÷ 11`), because they behave as 1–12 table drills while their names carry no table | One operation each — **done**. Still outstanding: make the band bind (P-35), or rename them as table drills. The missing-operator item moves to XD-7 |
| `add_sub_10s`, `add_sub_100s` | "Add & Subtract by 10s / 100s" | Honest labels, but they violate P-28 and yield 20 distinct items in 200 | SPLIT into an add branch and a subtract branch, or declare `opMix` |
| `missing_add_sub` | "Missing Numbers (+/−)" | Honest, but it must become two requestable variants (minuend-unknown, subtrahend-unknown) | SPLIT per §22.1 |
| `missing_mult_div` | "Missing Factors (×/÷)" | Says *factors*; also emits missing dividend, divisor and quotient, and mixes × and ÷ | SPLIT into MF-23/24 and DF-22/23/24 |
| `mult_facts`, `div_facts` | "Multiplication / Division Facts (1-12)" | "1-12" is honest about the range but excludes the **{0}** set that P-FL-18 puts first | "(0–12)", and make the zero facts generable |
| `number_families_add/_med/_hard`, `number_families_mult/_med/_hard`, `mult_chart_easy/_medium/_hard` | "… Easy / Medium / Hard" | ~~Each produces **1 distinct item in 200**~~ — **withdrawn 2026-09-20**: that reading came from the old audit hashing `q.text`, which is a constant for these ids while the item lives in `q.visual`. The content is varied and arithmetically correct (`mult_chart_hard`: 20 different 22-cell charts; `number_families_add`: `2,7,9`, `10,7,17`, `8,5,13`, `9,1,10` …). What is true is that the difficulty words describe nothing a teacher can predict, and `number_families_mult` is capped at factors 2–5 (16 distinct in 240) | **MERGE** the three into one `practiceLevel` (P-AT-9) — no REDO. Widen `number_families_mult`'s factor range as part of the merge |
| every `add_*`/`sub_*` "within N" id | "within 10 / 20 / 50 / 100 / 1,000 / 10,000 …" | 20 of them exceed the band, by up to 2× | The label becomes true when P-35 is implemented |
| `long_div_2digit` | "Divide by 2-Digit Numbers (Visual)" | **Still broken, re-confirmed 2026-09-20: 15 distinct items in 240.** The divisor is drawn from **{11, 12} only**, every dividend is an exact multiple and every quotient is a single digit (`77÷11`, `72÷12`, `24÷12`, `96÷12` …). A pupil "dividing by 2-digit numbers" never meets 13, 15, 24 or 25 | **REDO** — the one confirmed live generator defect in this table; then DL-9 … DL-12 |

### 22.4 The counting problem this specification creates

This specification calls for **about 33 new skill ids**. That collides with the brief's instruction that
`ws-code-snapshot.mjs` "must keep reporting 572 codes".

What the script actually does, read on 2026-09-20:

- It compares the **live** tables against a pinned baseline (`tests/baselines/skill-codes.snapshot.json`)
  and fails if any pinned code or pinned positional index changes.
- It then **deliberately tests that appending a new skill is safe**: it patches a probe skill into
  `data.js`, retires a middle one, and asserts that no existing code moves and that the probe is appended
  after the frozen ids.
- Its final line prints `Object.keys(SKILL_CODES).length` — a **live count**, not a pinned invariant.

So appending new ids is the designed path, the check still passes, and **the printed number rises above
572 by exactly the number of ids appended.** A number that *falls*, or any "frozen code changed" /
"positional index changed" line, is the real critical failure. See **Q4** — this needs the owner's word
before the next wave writes a single new id, because the two readings lead to completely different work.

---

## 23. Questions for the owner

Six that block the next wave, then five that shape it. Each has a recommendation.

### The six that block

**Q1 — Is the fact constant's default "one constant" or "Mixed"?**
`PEDAGOGY_STANDARD.md` P-31 and P-FL-20 say the default is **one constant, named in the title** ("Add 6").
The P4 brief says **Mixed (all ticked) is the default**. Both cannot be printed.
*Recommendation:* take the precedent already set for `practiceLevel` — **a ladder step names the constant;
a stand-alone print from the dialog defaults to Mixed.** A teacher printing a quick fact page wants mixed;
a teacher teaching step AF-11 wants "Add 6". One sentence in P-31 settles it.

**Q2 — Where does the 0 set sit?**
P-FL-18 says "the sets 1 to 10 in order, then 11, 12, 13 … and the 0 set comes **last**". L-1 step 13 puts
"Add 0 and Use Turn-Around Facts" *before* the 10–13 sets. These disagree.
*Recommendation:* **after the 1–10 sets, before 11–13.** Sets 11–13 are a band extension that may be a
year later; a pupil should not wait a year to meet `n + 0`. §5 is written this way (AF-16 before AF-17).

**Q3 — Does the band follow the constant automatically?**
"Add 9" at band 10 yields two facts, so the 9 set needs band 20. Is that band rise a **derived**
consequence of the step (one delta), or must every band rise be its own step (two deltas, and a dead
lesson whenever the band rises on a constant already taught)?
*Recommendation:* **derived**, with one explicit band step where the band genuinely is the new thing
(§5 AF-10, §6 SF-9 — same constant, bigger sums). This is how §5 and §6 are written.

**Q4 — The 572-code gate versus ~33 new skill ids.**
§22.4 sets out what `ws-code-snapshot.mjs` really enforces: appending is designed for and safe; the
printed count is a live number that will rise. Do we (a) treat a count rise that accompanies appended ids
as expected and keep the pinned baseline as the real gate, or (b) forbid new ids entirely and deliver all
of §22.1's NEW rows as options on existing skills?
*Recommendation:* **(a).** Option (b) is possible for perhaps half the NEW rows, but not for the six SZ
across-zero rungs or for `mult_placeholder_zero`, because a step that is a different *procedure* cannot be
an option on a skill that does not contain that procedure. This is the one question that changes the shape
of the next wave's work.

**Q5 — `sub_10_regroup`: keep it as "Subtract From 10", or retire it?**
Unlike `add_10_regroup`, it is not an empty set: `10 − n` regroups and its minuend is within 10. It has
exactly nine members, which is why the audit reports 9 distinct items in 200.
*Recommendation:* **keep the id, rename the label to "Subtract From 10", leave the band at 10.** It is a
genuinely useful rung (K5 and MW4K both sell "subtract from a whole ten" as a named type) and it is the
entry to SZ-1. Also worth telling the gate agent: the audit's message is mis-stated for subtraction and
should be two messages, not one.

**Q6 — The bridging-ten writing load.**
At BT-4 the pupil writes **three** numbers per item: both split parts and the sum. That is three digits of
handwriting per item for a pupil with effortful handwriting, and the cell only fits 4 per page at size L.
*Recommendation:* **keep three at BT-3 and BT-4 — the split is the thing being taught, so it must be
written — and drop to one at BT-5.** The alternative (pre-print one part) makes BT-4 identical to BT-3 and
loses a rung. But this is a judgement about *your* pupils' handwriting, not about mathematics.

### The five that shape

**Q7 — Five- and six-digit columns at size L.**
The capacity table gives 2–3 columns for a six-digit stack at L, and the long-procedure cap is 4 items.
*Recommendation:* **declare 4 items for AC-16 and SC-17 at L**, in the step, rather than letting the
layout discover it. Alternative: do not offer size L for those steps at all.

**Q8 — The division fact-set order.**
P-FL-18's first block is {0, 1, 2, 5, 10}, but `n ÷ 0` does not exist. And L-7 teaches `÷ 5` before `÷ 2`
because 5 is the tally exemplar.
*Recommendation:* for division, read the first block as **{1, 2, 5, 10} with `0 ÷ n` as an edge item at
DF-10**, and confirm **÷ 5 before ÷ 2**. §15 is written this way.

**Q9 — Missing-operator items.**
Confine them entirely to XD-7 with a **written** sign in a circle, and strip the branch out of the eight
skills the audit catches carrying it?
*Recommendation:* **yes.** A missing-operator item is a discrimination item, not an addition item, and a
four-way multiple choice on screen breaks P-29 against a paper item that is a written sign.

**Q10 — The three- and four-addend CCSS ceiling.**
2.NBT.B.6 caps at four two-digit addends. CM-6 sits exactly on it; CM-7 exceeds it.
*Recommendation:* **CM-6 is the Level 2 ceiling; CM-7 and CM-8 are Level 3 and up**, and the step carries
the Level so a Level 2 page can never print a three-addend three-digit column.

**Q11 — Do turn-around facts ride with Mixed, or are they their own tick?**
P-FL-20 says the constant is the second operand "unless turn-around facts are asked for". Is
`turnaround` a separate check box, or is it implied by Mixed?
*Recommendation:* **a separate check box, default off**, so that "Add 6" means `n + 6` every time and the
pupil sees one shape per page. Mixed already varies the constant; varying the position as well would be
two new things at once.

---

## 24. What the next wave should build first

In order, because each unblocks the next:

1. **P-35 in the generators.** 20 band failures and 2 impossible-band failures disappear, and every
   "within N" label becomes true. Nothing else in this document is safe to build on a generator that
   cannot keep its own band.
2. **`facts` / `band` / `cuePart` on the four fact skills**, plus the zero facts (§2.4). This unblocks
   AF, SF, MF and DF — four of the fourteen ladders, and the four skills every other ladder leans on.
3. **The four response scopes** (§3.1) as a cross-cutting mechanism, once, rather than per skill. They
   appear in 24 steps across 11 ladders.
4. **The nine generators that produce 1 distinct item in 200** (§22.3). They are broken, not weak, and
   they are cheap to find.
5. **`add_10_regroup` → bridging ten** (§7), because that id prints an impossible label today.
6. **The six SZ across-zero skills**, once Q4 is answered.
