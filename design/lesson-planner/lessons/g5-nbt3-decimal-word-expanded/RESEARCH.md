# g5-nbt3-decimal-word-expanded — Read and write decimals to thousandths in word form and expanded form

Owner build #10 (W06, Grade 5, NBT). Research only (2026-10-17); no code written. Closest passed lesson:
`g2-nbt3-read-write-1000` (words ↔ numeral ↔ expanded; `words` cell, `number_word_form` options, `placevalue:expand` /
`combine`). This lesson reuses that grammar and those cells, extended past the decimal point.

## 1. Tags
- Grade 5 · Domain: Number & Operations in Base Ten.
- CCSS **5.NBT.A.3a** ("Read and write decimals to thousandths using base-ten numerals, number names, and expanded
  form, e.g., 347.392 = 3 × 100 + 4 × 10 + 7 × 1 + 3 × (1/10) + 9 × (1/100) + 2 × (1/1000)"). The owner sheet writes it
  "5.NBT.A.3.A" with the parent text ("Read, write, and compare…"); comparing is 5.NBT.A.3b (already F via
  `compare_thousandths`, not this lesson). Leans on 5.NBT.A.1 (lesson 9) and 4.NF.C.6.
- EE: repo `ee` = **M.EE.5.NBT.3** ("Compare whole numbers up to 100 using symbols", the EE every 5.NBT.A.3 WRM step
  and `compare_thousandths` carry). Owner sheet row 10: the same code → `eeOwnerList` = `['M.EE.5.NBT.3']`, no
  difference. EE note: the EE is a whole-number comparison, not word/expanded form; for EE pupils run P1 band A
  (2-digit numerals ↔ words and tens+ones, `number_word_form band:100`) and a <, >, = strand to 100
  (`placevalue:compare band:99`).
- siteLessonId: **`G5|-|readandwritedecimalstothousandthsinwordformandexpandedform`** (site-lessons.json: G5, wrmYear
  Y6, supplement, weeks W06; ee M.EE.5.NBT.3).
- WRM: no exact step. Near: **Y5.B7.S5 "Thousandths as fractions"**, **Y5.B7.S6 "Thousandths as decimals"**,
  **Y5.B7.S7 "Thousandths on a place value chart"** (all 5.NBT.A.3; open on `WRM_PROPOSALS` → `thousandths_pv`), Y4.B9.S3
  "Partition decimals", Y6.B8.S1/S2 (lesson 9).
- Audit: 5.NBT.A.3a = **G (gap)** — no skill deals it; closers `thousandths_pv` (option on the proposed
  `decimals:decimal_place_value`) and `decimal_pv`. This lesson's build closes `thousandths_pv`'s number-name +
  expanded clauses.

## 2. Research findings (CLAUDE.md Q1–11)
Sources: https://thecorestandards.org/Math/Content/5/NBT/A/3/ (standard + example),
https://www.teachstarter.com/us/common-core-standards-in-america/ccss-math-content-5-nbt-a-3-a/ (naming decimals:
standard, word, expanded to thousandths), https://superteacherworksheets.com/common-core/5.nbt.3a.html (read the name →
write standard form; write expanded form), https://fishtanklearning.org/curriculum/math/5th-grade/place-value-with-decimals/lesson-10
(converting among word, standard, expanded; terms like 9 × (1/1,000)), https://wow.boomlearning.com/deck/JEtsF2QWg5jid4ZQQ
(interactive standard/expanded/word cards), https://www.shmoop.com/common-core-standards/ccss-5-nbt-3a.html,
https://www.cazoommaths.com/us/math-worksheets/5.nbt.a.3.a-worksheets/. MathWorksheets4Kids / IXL (logged-in) not
fetched this round — to refine at build (IXL G5 "Convert decimals between standard and expanded form", "Word names for
decimals"; MW4K "Decimal expanded form" and "Decimal word form" with fraction and decimal expanded variants).

1 **Types**: word → numeral ("four and twenty-three thousandths" → 4.023); numeral → words; numeral → expanded (three
expanded forms, below); expanded → numeral (incl. scrambled order and missing zero terms); match three forms; unit
form ("4 ones 2 hundredths 3 thousandths"). 2 **Visuals**: place-value chart O . t h th with the point on a column line;
a "last place" arrow naming the word ending (thousandths); hundredths grid / thousandths cube (pictorial only). 3
**Answers**: number in place boxes (digit per box incl. the point); expanded boxes; words on one ruled line. 4
**Progression**: tenths → hundredths → thousandths; decimals < 1 → with whole part ("and"); no zeros → zeros inside
(4.023, 0.105, 2.300?); decimal expanded (4 + 0.02 + 0.003) → fraction expanded (4 × 1 + 2 × 1/100 + 3 × 1/1000). 5
**Edge cases**: zeros in places (★★★), "and" only at the point, trailing zeros (0.30 vs 0.3 — not a new name at this
lesson), whole part ≥ 10 (12.405 — longer name), hyphenated tens in the decimal part ("forty-five thousandths").
6 **One change per step**: S1 read a decimal < 1 (last place names the unit) → S2 whole part + "and" → S3 zero place
inside → S4 expanded (decimal values) → S5 expanded with fractions (the standard's form). 7 **Structural**: O . t h th
boxes and the expanded boxes stay; **hint**: the last-place unit word printed under the chart, "and" pre-written at
the point. 8 **Response**: numeral in boxes (low writing load) first; words only at ★★★ (spelling load); never MC.
9 **Say**: "Four and twenty-three thousandths. The last digit is in the thousandths, so I say thousandths." 10
**Misconceptions**: §5. 11 **Fit**: ≤ 6 cells (L), name cells 2-col wide (the `words` cell's `maxCols:2`).

**Which expanded forms 5.NBT.A.3a asks for:** the standard's own example is **expanded notation with unit fractions**:
digit × place value, places below the ones written as **(1/10), (1/100), (1/1000)** — `4 × 1 + 2 × (1/100) + 3 ×
(1/1000)`. Equivalent written forms (accepted, taught as rungs): `4 + 0.02 + 0.003` (decimal values, the WRM / Y4 B9
partition form) and `4 + 2/100 + 3/1000` (fraction values). **Teach decimal values first (S4), the standard's fraction
notation last (S5) and make S5 the exit's expanded item** — the domain test uses the standard's form. `4 × 0.01`
(decimal notation) is accepted, not taught.

## 3. Skills (the maker needs this)

| Skill | Options | Role | Verdict |
|---|---|---|---|
| `composing:number_word_form` | `band:100` / `1000` | P0a (whole-number names), P1 band A, EE strand | **Fits whole numbers only.** Verified: emits `words` cell (`{n, words, way, ans, slot?}`), "Write the numeral: seven hundred ninety-eight" → 798. Its `numberToWordForm` and the cell's `numberWords` truncate to integers (`Math.trunc`) — **no decimals**. |
| `placevalue:expand` | `band:999, zero:true, frame:'boxes', form:'notation'` | P0b (whole expanded notation, 3 × 100 + 4 × 10 + 7 × 1) | Fits, whole numbers only (verified "Write 2,303 in expanded form." → `2,000 + 300 + 0 + 3`). |
| `placevalue:combine` | `band:999, order:'scrambled'` | P0 / spaced retrieval | Fits (whole). |
| `placevalue:value` + lesson 9's `decimals` option | if built | P0c "value of the 3 in 4.023" | Depends on lesson 9's build. |
| `decimals:compare_thousandths` | `forms:[1]` | spaced retrieval (0.450 = 0.45) | Fits (verified: "Compare: 0.340 ___ 0.34" → "="), no kit cell (`q.cell` null) — legacy print. Not main practice. |
| `conversions:d_to_f` | — | NOT used | Simplifies (0.6 → 3/5) and mixes a drag bin; wrong for x/1000 naming. |
| **NEW** decimal word/expanded skill | see proposal | MAIN practice P3/P4, exit, CQ | **Missing — the build.** |

**Proposal — the smallest build that closes the lesson.** Build the `thousandths_pv` / `decimal_pv` entry's naming half
as a NEW skill appended at the END of `SKILLS.decimals` (never spliced; share codes append-only):
`decimals:decimal_word_form`, label **"Decimals in Words and Expanded Form"**, grade 5, generator branch in
`gen-fractions.js` (decimals route) or `gen-pv.js`. Options (`skill-options.js`, keys appended in
`skill-option-keys.js`):
- `way` enum `to_number` (words → numeral) / `to_words` / `to_expanded` / `from_expanded` — one per page (like
  `wordFormWay()`, dealt by itemIndex).
- `dp` set {1, 2, 3} default [3] ("Places after the point"); `whole` enum `none` (0.xxx) / `some` / `all` (1–99
  whole part).
- `zeroPlace` enum `none`/`some`/`always` (a 0 inside: 4.023, 0.105, 3.08) — reuse the `_pvZeroPlace` shape.
- `form` enum `decimal` (4 + 0.02 + 0.003) / `fraction` (4 + 2/100 + 3/1000) / `notation` (4 × 1 + 2 × (1/100) + 3 ×
  (1/1000), the standard's) — applies to to/from_expanded.
- `answerSlot` `line` / `boxes` (place boxes) as on number_word_form.
- Words engine: `decimalWords(x)` = whole part via `numberWords` + " and " + decimal digits as a whole number via
  `numberWords` + unit word of the LAST place (tenths/hundredths/thousandths; singular "one thousandth"); "zero and"
  never — 0.023 → "twenty-three thousandths". Accept on screen: hyphen optional, "and" required at the point only.
- Cells: **extend `words`** (pure, additive): payload `dp` (0 default = today exactly) — `htoDigits` switches to the
  whole digits + a **point glyph box (not graded)** + `dp` boxes, letters `O . t h th` (and `T O . t h th` for whole
  ≥ 10); `numberWords` gains a decimal branch (or the generator passes `words`, which the cell already honours —
  `p.words` wins). `nameHtml` underline: split at " and " instead of " hundred" (step 0 = whole part, step 1 = the
  decimal part). Yes — the `words` cell CAN write decimals into place boxes with this change; today it cannot (it
  truncates and pads to 3 digits). **Extend `pv` `expand`** kind for parts that are decimals or fraction strings:
  `parts` already format via `fmt(v)`; add `notation` parts as `{digit, unit:'1/100'}` drawn with a stacked fraction;
  `wide` rule: ≥ 4 parts → 2 cols.
- Provider: strings `write-decimal` "Write the decimal.", `decimal-words` "Write the decimal in words.",
  `decimal-expanded` "Write it in expanded form."; workedSteps (whole part → "and" → read decimal digits as a number →
  last place's name); wrongAnswer map (§5); iCan. `SKILL_PRINT_SIZE` entry (legacy path), `SKILL_STANDARDS`
  `{ccss:['5.NBT.A.3a'], ee:['M.EE.5.NBT.3']}`, `SKILL_WRM` Y5.B7.S5/S6/S7 (partial: no chart/fraction step), search
  terms (CONCEPT_RULES "word form", "expanded form", "decimal names", "thousandths"), flip 5.NBT.A.3a G → F in
  standards-audit, trim `thousandths_pv` from build-list.
- **Case tests (node, the maker needs these):** 4.023 → "four and twenty-three thousandths"; 0.105 → "one hundred five
  thousandths"; 0.5 → "five tenths"; 0.001 → "one thousandth"; 12.07 → "twelve and seven hundredths"; 3.400 never dealt
  (trailing zeros off); expanded notation of 0.105 → `1 × (1/10) + 5 × (1/1000)` (zero term omitted in notation, boxes
  form shows `0 × (1/100)`, both accepted); from_expanded scrambled `0.003 + 4 + 0.02` → 4.023; dp/whole/zero options
  each honoured over 30 seeds; content-audit name check ("Decimals" no op word → pass).
- **Fallback if the skill is not built:** hand-authored `items` in the detailed lesson (as lessons 1–5 do for gaps) +
  record the proposal; `number_word_form` / `expand` cover only P0/P1.

## 4. V22 content
- **I Can:** "I Can read and write decimals in words and expanded form" (short: "I Can write decimals 3 ways").
- **CRA:** Pictorial (O . t h th chart, thousandths grid named) → Abstract.
- **Flow: Chunked** (5 steps, 4 New → T2 rule). Chunk 1: words ↔ numeral (S1–S3). Chunk 2: expanded (S4–S5).
- **Routine steps:** 1 `look` "Read the whole number." 2 `say` "Say 'and' at the point." 3 `look` "Read the digits
  after the point as one number." 4 `write` "Say the last place's name." Chant: "Whole — and — part — last place."
- **Vocabulary (3):** *decimal point* — "between ones and tenths; say 'and'"; *thousandths* — "1 split into 1,000";
  *expanded form* — "the number split by place".
- **Remember:** "The LAST digit names the decimal: 0.023 ends in the thousandths → twenty-three thousandths."
- **T2 atoms:**
  1. Fact · "Key name: whole-number names to 999" · Pre-req (lesson g2-nbt3).
  2. Fact · "Key name: tenths, hundredths, thousandths places" · Pre-req (5.NBT.A.1 / lesson 9).
  3. Conceptual · "Key name: 0.023 = 23/1000" · Pre-req (4.NF.C.6, extended).
  4. Fact · "Key name: 'and' means the point" · New (only there; never in the whole part).
  5. Category · "Key name: last place names it" · New.
  6. Conceptual · "Key name: zero holds a place" · New · **Critical Atom** (4.023, 0.105).
  7. Comparative · "Key name: hundredths vs thousandths" · New · 0.23 vs 0.023.
  8. Conceptual · "Key name: expanded with fractions" · New · 2 × (1/100) = 0.02.
- **How to teach:** to_number before to_words; cover-and-read the name in two parts at "and"; chart under every
  guided item; expanded decimal form before fraction notation.
- **P0 prerequisite check:** (a) "six hundred four" → 604 — `number_word_form band:1000 zeroPlace:'some'` — route
  g2-nbt3-read-write-1000. (b) 347 = 3 × 100 + 4 × 10 + 7 × 1 — `expand form:'notation'` — route 4.NBT.A.2. (c)
  0.07 = 7/100 (hand item) — route 4.NF.C.6. (d) Name the place of the 3 in 0.253 → thousandths (hand item / lesson 9's
  option) — route lesson 9.
- **P1 number sense:** Band A (5): whole numbers words → numeral (`number_word_form band:1000`). Band B (5): x/10,
  x/100, x/1000 → decimal (new skill `way:'to_number'` with fraction prompt, or hand items).
- **Spaced retrieval (MWB):** 0.4 × 10 (4); the 6 in 0.6 is __ the 6 in 0.06 (10 times); 0.45 _ 0.405 (>).
- **Chaining bridge:** "You can name 347. Today we name what comes after the point."
- **I Do:** Panel 1: 0.47 (two dp, no whole). Panel 2: 3.256 (whole + "and" + thousandths). Panel 3: 4.023 (zero).
- **We Do:** 0.809 (zero inside), 15.6 (tenths, whole ≥ 10).
- **Check Question:** "four and twenty-three thousandths" → A 4.23 (hundredths/thousandths) · B 423.000 / 4,023
  (and ignored) · C 4.0023 (wrote 0 per "thousandths" → extra zero) · **D 4.023**.
- **You Do:** P3/P4 sec 1 words → numeral 6 (★ chart + last-place word, ★★ boxes only, ★★★ line); sec 2 numeral →
  expanded 6 (`form:'decimal'` then ★★★ `notation`); ★★★ last row: 0.105, 7.008, one to_words (2.36).
- **P5 word problem (our own):** "A seed weighs two and fifteen thousandths grams. Write the weight as a decimal and in
  expanded form." → 2.015 = 2 + 0.01 + 0.005.
- **Exit slip:** (1) nine and forty-one hundredths → 9.41. (2) sixty-two thousandths → 0.062. (3) 5.307 = 5 × 1 + 3 ×
  (1/10) + __ × (1/1000) (7). (4) 0.8 + 0.04 + 0.006 = __ (0.846).
- **T-LOOP / T6:** A → chart: which place does the name end in? B → "and" = point; C → read the decimal digits as one
  number, fill from the right. Accepted: hyphen optional; 4 + 2/100 + 3/1000, 4 + 0.02 + 0.003 and the notation form
  all right with any order; zero terms optional on a line, required in boxes.

## 5. Misconceptions (with the wrong answers)
1. **Wrong last place** — "four and twenty-three thousandths" → **4.23** (hundredths), or 4.023 read as "four and
   twenty-three hundredths". Fix: count the boxes after the point; last place names it.
2. **"and" misused** — reads 4.023 "four point zero two three" (OK orally, not word form) or writes "four hundred AND
   twenty-three thousandths" meaning 400.023 vs 0.423 confusion; "and" in the whole part (three hundred and five) turns
   305.2 into 300 + 5.2. Fix: "and" only at the point.
3. **Zeros dropped/added** — 4.023 → 4.23 (dropped), "twenty-three thousandths" → 0.23 or 0.0023 (added). Fix: digits
   filled from the right of the last place; 3 boxes for thousandths.
4. **Expanded: digits not values** — 4.023 = 4 + 2 + 3 or 4 + 0.2 + 0.3 (shifted), or 4 + 2/10 + 3/100; fraction form
   with whole digits 2/1000 for the hundredths. Fix: "What is the 2 worth?" chart.

## 6. Edge cases
Zeros inside (★★★: 4.023, 0.105, 7.008 — **the ★★★ edge case**); no whole part (no "zero and"); "one thousandth"
singular; whole part ≥ 10 (12.405); teen decimal parts ("thirteen thousandths" 0.013 vs "thirty thousandths" 0.030 —
avoid trailing-zero decimals in practice; mention in teacher talk); hyphenated tens ("forty-five hundredths"); avoid
x.000 and numbers > 999.999.

## 7. Number pool (LR-5)
Whole part 0–99, 1–3 dp, last digit non-zero: 100 × (9 + 90 + 900) ≈ 99,900 numbers; with the zero-place rule ~30%.
Needs: chart 3, Guided 6, Practice 2 × 6 = 12 (+6 expanded), P5 1, exit 4, CQ 1 ≈ 33 → ample. Rule: never repeat a
number; one decimal-part pattern (e.g. "23") once per page.

## 8. Owner questions
1. Which expanded form on the test? Recommend: the standard's `× (1/1000)` notation as the target (S5, exit), decimal
   values as the bridge, all three accepted.
2. Spoken "point" reading (4 point 0 2 3)? Recommend: accept orally, teach "and" for word form.
3. Trailing zeros (2.300)? Recommend: out of this lesson (5.NBT.A.3b's 0.450 = 0.45 item already exists).
