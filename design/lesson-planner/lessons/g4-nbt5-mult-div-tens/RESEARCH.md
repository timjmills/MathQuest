# g4-nbt5-mult-div-tens — Multiply and divide multiples of 10 using basic facts (Grade 4)

Lesson 8 of the owner's build order · Grade 4 · NBT. Research phase only: no code was changed. Generator facts were
read from the code on branch `claude/sweet-newton-c8wrv1-wip-detailed-lessons-2` (2026-10-17) and sampled read-only
with `generateQuestionFor` in node.

---

## 1. Tags

| Field | Value |
|---|---|
| Grade | 4 (Level 4) |
| CCSS | **4.NBT.B.5** (primary: multiply, here a multiple of ten by a multiple of ten or a one-digit number), **4.NBT.B.6** (divide with a basic fact), **4.NBT.A.1** (a digit is worth ten times the place to its right: why the zeros move) |
| EE (repo) | none: no repo skill tags an EE on these three codes for this content (`placevalue:place_value_10x` carries M.EE.5.NBT.2 for 5.NBT.A.2) |
| eeOwnerList | none, with the owner's notes: "4.NBT.1: use M.EE.5.NBT.1; 4.NBT.5: use M.EE.4.OA.1; 4.NBT.6: no EE". Record `ee: []`, `eeOwnerList: []`, `eeNote` = that sentence. M.EE.4.OA.1 = repeated addition ↔ multiplication; M.EE.5.NBT.1 = compare numbers to 99 with place-value models. |
| siteLessonId | `G4|-|multiplyanddividemultiplesof10usingbasicfactseg90x5030030` (wrmYear Y5, power standard, weeks W06–W07, "domain tests" supplement) |
| WRM | wrmYear **Y5**. wrmSteps: none exact. wrmNear: **Y4.B5.S7** Related facts × and ÷ (3 × 4 = 12 so 30 × 4 = 120, 120 ÷ 4 = 30), **Y3.B4.S2** Related calculations, **Y5.B3.S8 / S9** Multiply / Divide by 10, 100, 1,000, **Y5.B3.S10** Multiples of 10, 100, 1,000, **Y4.B5.S3–S6** × and ÷ by 10 and 100 |
| Links | `links/Y5.json`: verdict **partial**, `multiplication:mult_zeros {forms:[2]}` ("6 × 40 only: never 90 × 50, never a division"); build entry **`facts_times_tens`** already proposed; pre = `mult_zeros {forms:[0,1]}`, `division:div_facts`, `place_value_10x {op:'x', power:[10,100], band:1000}` |

---

## 2. Research findings

Sources (public, nothing copied):
- Vedantu Grade 4 "Multiply whole tens by whole tens" (vedantu.com/worksheets/class-4-maths-multiply-whole-tens-by-whole-tens): 40 × 60, 30 × 80 drill, fact first then the zeros.
- TeacherVision Grade 4 multiplication practice (teachervision.com/multiplication/multiplication-practice-sheets-grade-4): multiples of ten in word problems.
- Education.com Grade 4 multiplication resources (patterns of zeros as a mental strategy).
- WRM Y4.B5.S7 / Y5.B3 (from `wrm-steps.json` titles): place-value counters and the place-value chart; "3 × 4 = 12, so 3 × 40 = 120 (12 tens)".
- MathWorksheets4Kids / IXL (*Grade 4: Multiply numbers ending in zeros*; *Divide numbers ending in zeros*) — titles known, not logged in this pass; the builder should check them (CLAUDE.md).

**Research questions 1–11**
1. **Types.** Fact → extended fact strip (6 × 4, 6 × 40, 60 × 40); fill the missing factor (__ × 30 = 1,200); divide: 2,400 ÷ 6, 300 ÷ 30, 4,800 ÷ 80; true/false with a wrong zero count; which fact helps?
2. **Visuals.** Place-value chart with counters (4 tens × 3 = 12 tens); unit language "6 × 4 tens = 24 tens"; the area/array of tens only as a picture of "tens × tens = hundreds".
3. **Answer.** Write the product / quotient in a digit row; fixed-width answer boxes (no digit-count leak, as `mult_zeros` stacked already does with `ansDigits`).
4. **Progression.** one-digit × tens (Grade 3, known) → tens × tens → hundreds × one-digit → ÷ one-digit with a zero-ended dividend → ÷ a multiple of ten.
5. **Edge cases.** Fact product already ends in 0 (5 × 4 = 20 → 50 × 40 = 2,000: three zeros, not two). Divisor zero cancels (300 ÷ 30 = 10, not 1 or 100). Quotient with zero (2,000 ÷ 50 = 40).
6. **ONE new thing.** Pupils know 6 × 40 (Grade 3, `mult_zeros` forms 2). The new thing per chunk: (a) **both** factors are tens → tens × tens = hundreds; (b) **dividing**: use the fact, then the tens left over.
7. **Scaffolds.** Structural: the answer row with fixed-width digit boxes, the "fact line" box above each item. Hint (fades): the printed fact "6 × 4 = 24" in grey, then the fact line empty, then gone.
8. **Response.** A number. No multiple choice.
9. **Say.** "6 times 4 is 24. Tens times tens are hundreds. 24 hundreds is 2,400." / "24 hundreds ÷ 6 is 4 hundreds."
10. **Misconceptions.** M1 counts zeros wrongly when the fact ends in 0 (50 × 40 → 200). M2 keeps only one zero (60 × 40 → 240). M3 in division adds zeros instead of removing them (300 ÷ 30 → 100 or 1,000). M4 drops a zero of the dividend that belongs to the fact (2,000 ÷ 50 → 4 or 400).
11. **Fit.** Across fact cells: 10–12 per page at Size L in 2 columns (WDS §12.1 fact capacity); sites put 30+.

**Where we override sites:** the "just add the zeros" trick is not taught as the rule (it breaks on M1 and on decimals later); we teach unit language (tens, hundreds), and the zero count is the check.

---

## 3. Skills

### Generator evidence
- `multiplication:mult_zeros` (gen-operations.js:1584). n ∈ 2–9; `forms` 0 = ×10, 1 = ×100, 2 = n × d0 (either order). Samples forms 2: 8 × 80 = 640, 40 × 3 = 120, 60 × 5 = 300, 5 × 70 = 350. **No tens × tens, no hundreds, no ÷.** Across items carry no `q.cell` (legacy `mult-facts-horizontal`); stacked emits `stack` with `ansDigits: 3`. Tagged 3.NBT.A.3 / M.EE.3.NBT.3 only.
- `placevalue:place_value_10x {op:'/', power:[10,100]}`: 490 ÷ 10, 400 ÷ 100 (cell `pv-support`). Prerequisite only.
- `division:div_facts`: fact cell, `equation`. Prerequisite.
- The kit `fact` cell is fed by `supportFactSpec` (print-sheet.js:1078) only for operands ≤ 2 digits; 300 × 4 or 2,400 ÷ 6 need the generator to emit its own `q.cell` with a wider `digits`.

### Skill table
| Role | Skill id | Options | Verdict |
|---|---|---|---|
| P0 a: × fact | `multiplication:mult_facts` | factors 2–9 | fits |
| P0 b: ÷ fact | `division:div_facts` | divisors 2–9 | fits |
| P0 c: n × tens | `multiplication:mult_zeros` | `forms:[2]` | fits |
| P0 d: ×/÷ by 10 | `placevalue:place_value_10x` | `op:'/', power:[10], band:1000` | fits |
| Main chunk a (tens × tens, hundreds × n) | `multiplication:mult_zeros` | **needs option values** forms 3 = tens × tens (90 × 50), 4 = hundreds × one-digit (300 × 4) | **missing** |
| Main chunk b (÷) | **new skill** `division:div_zeros` "Divide Multiples of Ten Using a Fact" | forms 0 = d0/d00 ÷ one-digit (240 ÷ 6, 2,400 ÷ 6), 1 = ÷ a multiple of ten (300 ÷ 30, 2,400 ÷ 60) | **missing** |
| P1 number sense | `mult_facts`, `div_facts`, `placevalue:unit_form` band 999 | — | fits |
| P5 story | `multiplication:mult_word_problems_plain` / `div_word_problems_plain` | need tens operands — no option deals them; use a fixed story in the lesson file (as lesson 4 did) | partial |

**Smallest build.**
1. **Option values on `mult_zeros` `forms`**: append `{v:3, l:'tens × tens (90 × 50)'}`, `{v:4, l:'hundreds × one digit (300 × 4)'}` (append-only; old codes unchanged). Generator: a, b ∈ 2–9 → a0 × b0, or a00 × b. Emit `q.cell = {template:'fact', payload:{a, b, op:'*', notation:'horiz', digits: 4}}` with a fixed answer width per skill (4 digits, max 8,100) so no digit-count leak. Hint "9 × 5 = 45, so 90 × 50 = 45 hundreds = 4,500". Tags: add `4.NBT.B.5`, `4.NBT.A.1` to its SKILL_STANDARDS row (3.NBT.A.3 stays first). Label stays "Multiply by 10, 100 and Multiples of Ten" (still true). Option-codec key exists (`forms`).
2. **New skill `division:div_zeros`** (append to `SKILLS.division`, never splice): the build-list entry `facts_times_tens` proposes a ÷ form on `mult_zeros`, but a division form on a skill named "Multiply …" fails `ws-content-audit` (a name is its declaration) — so ÷ needs its own skill. Grade 4; CCSS 4.NBT.B.6, 4.NBT.A.1; EE none; `SKILL_WRM` Y4.B5.S7 partial; search terms ("divide multiples of ten", "300 ÷ 30", "divide by tens", "basic fact division zeros"); `SKILL_PRINT_SIZE: compact`; `fact` cell, op '/', `digits: 4`. Quotient always whole and ≥ 2. Update `facts_times_tens` in build-list/links to point at the two pieces, then delete it when built.
3. Case tests: zero-ending facts present in the pool (5 × 4, 5 × 6, 5 × 8, 4 × 5 …); answer = a·b·100; ÷ items exact; content-audit OK for both skills; share codes rise only (`ws-code-snapshot`).

---

## 4. The V22 content

### A. Header
- **I Can:** "I can use facts with tens" (25 chars).
- **CRA:** place-value counters on a chart (concrete) → unit language → numbers.
- **Flow: Chunked** — (a) multiply: tens × tens and hundreds × one digit; (b) divide with a fact. Two operations are two new things (P-1).
- **Instruction strings:** `multiply`, `divide` (existing). Fact-line hint printed only in Guided.

### B. Routine steps
| Step | Icon | Text | Tag |
|---|---|---|---|
| 1 | `look` | Find the fact. (90 × 50 → 9 × 5) | New |
| 2 | `write` | Solve the fact. | Pre-requisite |
| 3 | `decide` | Tens × tens = hundreds. | New · **Critical Atom** (b: "24 hundreds ÷ 6 = 4 hundreds") |
| 4 | `check` | Count the zeros. Does it make sense? | New |

Chant: "Fact first. Then the place."

### C. Vocabulary: **multiple of ten** (ends in 0: 10, 20 … 90), **fact** (a × or ÷ you know: 9 × 5 = 45), **hundreds** (100 each; 45 hundreds = 4,500).
Remember: "Remember: 50 × 40 is 20 hundreds, NOT 200."

### D. Atoms
| # | Skill or Concept | Type | Notes |
|---|---|---|---|
| 1 | × facts to 9 × 9 | Fact · Pre-requisite | P0 a |
| 2 | ÷ facts | Fact · Pre-requisite | P0 b (chunk b) |
| 3 | n × tens = tens (6 × 40 = 24 tens) | Conceptual · Pre-requisite | P0 c |
| 4 | ×10 shifts one place | Conceptual · Pre-requisite (4.NBT.A.1) | P0 d |
| 5 | Find the hidden fact | Category · New | 90 × 50 → 9 × 5 |
| 6 | **CRITICAL** tens × tens = hundreds | Conceptual · New | 9 tens × 5 tens = 45 hundreds |
| 7 | Fact ends in 0 → more zeros | Comparative · New | 50 × 40 vs 60 × 40 |
| 8 | Divide: same unit in, same unit out (2,400 ÷ 6 = 400); tens ÷ tens = ones (300 ÷ 30 = 10) | Conceptual · New (chunk b) | |

### E. Misconceptions
| Mistake | Wrong answer | Fix |
|---|---|---|
| M1 zero inside the fact lost | 50 × 40 → 200 | say it in units: 20 hundreds |
| M2 only one zero | 60 × 40 → 240 | tens × tens = hundreds |
| M3 ÷ adds zeros | 300 ÷ 30 → 100 / 1,000 | check by × : 30 × 100 = 3,000 |
| M4 ÷ drops a fact zero | 2,000 ÷ 50 → 4 / 400 | 200 tens ÷ 5 tens = 40 |
Check Question: "50 × 60 = ?" A 300 (M1) · B 30,000 (zeros added twice) · C 3,000 ✔.

### F. Edge cases, ★★★
Zero-ending facts: 5 × 2, 5 × 4, 5 × 6, 5 × 8 (and turn-arounds) → 50 × 40 = 2,000, 60 × 50 = 3,000, 80 × 50 = 4,000; ÷: 2,000 ÷ 50 = 40, 3,000 ÷ 60 = 50. **★★★ edge case:** the fact product already ends in 0 (50 × 40 = 2,000; 2,000 ÷ 50 = 40). Avoid in ★/★★: ×1, ×10 as a "fact" (10 × 30), squares repeated, 100 × 100.

### G. P0 (most basic first)
a 7 × 6 = __ (`mult_facts`) → route 3.OA.C.7 · b 42 ÷ 6 = __ (`div_facts`) → route 3.OA.C.7 · c 7 × 40 = __ (`mult_zeros {forms:[2]}`) → route 3.NBT.A.3 / Y3.B4.S2 · d 340 × 10 / 340 ÷ 10 (`place_value_10x`) → route Y4.B5.S3/S5.

### H. Number pool (LR-5)
Chunk a: tens × tens a, b ∈ 2–9: 64 ordered, 36 unordered, about 28 after removing turn-arounds kept as one fact and 2 × 2; hundreds × one digit: 64 more (fact keyed with tens × tens sharing the fact counts as another representation — allowed on other pages only while usable < 12, so key freshness on (fact, form)). Zero-ending edge list: 8 ordered (5 × even). Chunk b: ÷ one-digit 64, ÷ multiple of ten 64. Needs per chunk: chart 1 + 2 examples + Guided 2 + P3 8 + P4-1 10 + P4-2 10 + exit 2 + CQ 1 = **36** → use both forms per chunk (64 + 64) so no fact repeats in one form. The ★★★ last rows need 2 rows × 2 = 4 edge items per Practice page, 8 per chunk: the edge list (8 ordered per form, 2 forms) holds 16 — enough, tight; turn-arounds must not share a page.

### I. PRACTICE SKILL PLAN
| Page | Skill + options |
|---|---|
| P0 | as §G |
| P1 number sense | A `mult_facts` (2–9), B `placevalue:unit_form` band 999 (24 tens = 240) |
| Chunk a chart / Guided / P3 / P4-1 / P4-2 / exit | `mult_zeros {forms:[3]}` (★, ★★), `{forms:[3,4]}` P4, ★★★ zero-ending facts last row — **needs build** (forms 3, 4) |
| Chunk b same pages | `division:div_zeros {forms:[0]}` then `{forms:[0,1]}` — **needs build** (new skill) |
| P5 | fixed story in the lesson file: "A crate holds 40 apples. A shop gets 60 crates. How many apples?" (2,400) |
| Mixed partner | `mult_zeros {forms:[2]}`, `div_facts` |
Meanwhile (if no build): chunk a only, with `mult_zeros {forms:[2]}` — that is Grade 3 content and does not meet the lesson; not recommended.
Maker needs: the `fact` cell at `digits: 4` across with a 4-digit operand (verify fact.js draws it at Size L in 2 columns); an LR-6 rule for × facts (no two items on a page with the same fact or turn-around; no twin answers — 2,400 comes from 60 × 40, 80 × 30, 600 × 4: distinct facts, same answer, so the twin-answer check matters here).

### J. Follow-ons
× and ÷ by multiples of 100 and 1,000 (5.NBT.A.2 / Y5.B3) · estimate products by rounding to tens · 2-digit × 2-digit area model.

## 5. Owner questions
- Q1 ÷ as a new skill (`division:div_zeros`) rather than a `mult_zeros` form, because of the name rule. **Recommend the new skill.**
- Q2 Chunked (× then ÷) in one lesson. **Recommend Chunked**; it is a power standard and both are on the W8 test.
- Q3 EE: none — print the owner's note line ("use M.EE.5.NBT.1 / M.EE.4.OA.1") in T1, or leave EE blank? **Recommend the note line, `ee: []`.**
