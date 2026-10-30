# g4-nbt1-ten-times-value — Place value: 10 times and one tenth of a digit's value

## 1. Tags
- Grade 4 · Domain: Number & Operations in Base Ten.
- CCSS **4.NBT.A.1** (a digit in one place represents ten times what it represents in the place to its right; e.g. 700 ÷ 70 = 10). The owner sheet also lists **5.NBT.A.1** (the same with decimals, and "1/10 of what it represents in the place to its left"): this lesson stays with WHOLE numbers and teaches the one-tenth direction in words ("70 is one tenth of 700"). Lesson 9 (5.NBT.A.1) adds decimals with the same template and case tests.
- EE **M.EE.5.NBT.1** (Compare numbers up to 99 using place value models). Wisconsin files 4.NBT.1 as "not applicable, see M.EE.5.NBT.1"; the owner sheet says the same. The EE is now tagged on `placevalue:value` in `SKILL_STANDARDS`. EE pupils: run Practice 1 with `band: 99` (tens and ones only, numbers to 99) and blocks.
- Site lesson: `G4|-|placevalue10timesandonetenthofadigitsvalue` (site-lessons.json; wrmYear Y5, weeks W05–W06). WRM near step: Y4.B1.S2 (build list `value_ten_times`); no exact step.

## 3. Skills (written first)

| Skill | Options | Role in pack | Verdict |
|---|---|---|---|
| `placevalue:value` form **times** (NEW option value) | `tenDir` both/times/tenth, `tenValues` on/off, `tenPlain`, `band` 9999 / 99999 | MAIN: P2, P3, P4 (both pages), P5, P6, Check Question | **Built** (build list `value_ten_times`). No skill dealt "the 7 in 700 is ___ the 7 in 70"; `place_value_10x` multiplies a number, `value` names one digit's worth. |
| `placevalue:identify` | `band: 999`, circle | P0 atom 1 | Fits. |
| `placevalue:value` form value | `band: 9999` | P0 atom 2 | Fits. |
| `placevalue:place_value_10x` | `op: x` / `/`, `power: [10]` | P0 atoms 3 and 4 | Fits (whole numbers, the shift chart). |
| `placevalue:more_less_100`, `compare` | bands to 999 | P1 bands A and B | Fits. |

Built for it (generic, lesson 9 reuses all of it with decimals):
- `gen-pv.js genTimesValue`: two numbers sharing one digit d, one place apart (each holds d once, at least 2 digits); `q.pv = {kind: 'times', n, m, place, placeM, digit, dir, values, plain, v0, v1, rel}`.
- Kit template `pv-times` (`sheet/cells/pv-times.js`): a two-row place chart under one heads row (columns from the highest to the lowest place of either row, a point column when a row has decimals), the digit underlined in each row, a "worth" box per row (`values`), and the sentence "The d in A is (10 times) (one tenth of) the d in B." to ring. `stepState` for the chart; `guidedStepOne` opts Guided cell 1 into the traced first step.
- Provider branch (`providers/pv.js`): steps, Say "The __ is __ the __.", wrong answers M-T1 (ring the other way), M-V2 (the digit written as its value / "the same as"), M-V14 (the place next to it / "100 times").
- Case tests (`roles/lesson.js`): tenAny, tenTimes, tenTenth, tenPlain, tenMixed, tenLengths, tenThou, tenOnes, tenEdge, tenChart, tenThouTimes, tenThouTenth, tenOnesTimes, tenTimesMid, tenTenthMid.
- Bridge hook `q.dealAnswer` (print-sheet.js `dlAns`): a ring item names what tells it apart ("10 times (600 and 60)"), so two ring items of a page are not "the same answer".
- Content audit case `times` (recomputes the relation from the places); codec keys 4E-4G (placevalue build lane sub-range), `form` token T.

## 4. V22 content
- **I Can:** "I Can find 10 times and one tenth" (fits the exit half on one line).
- **CRA:** Pictorial → Abstract (rods and a flat on the board; the place chart on every cell).
- **Flow:** Standard, one chunk (3 routine steps, 2 tagged New): 10 times first, then the same pair read the other way.
- **Steps (pupil):** 1 write "Write what each digit is worth." 2 decide "Bigger value: 10 times. Smaller: one tenth." Chant: "Left is ten times. Right is one tenth."
- **Critical Atom:** one place left is 10 times (10 ones make 1 ten, 10 tens make 1 hundred); the comparison is of VALUES, not digits.
- **Chart:** 613 / 868 (hundreds vs tens, 10 times), another example 63 / 8,608 (one tenth, different lengths).
- **Practice 1:** 4 items to 9,999, both ways mixed; ★★★ one tenth, thousands and hundreds. **Practice 2:** the same, numbers to 99,999 (the one new thing); ★★★ ones and tens.
- **Exit slip (3 items, ring only):** a 10 times (H/T), b one tenth (the Critical Atom: the other way), c one tenth with thousands. Four of these cells do not fit a 132.5 mm half; never shrunk.
- **Word problem:** Mia 6,000 / Leo 600 stickers; 6,000 ÷ 600 = 10 (the standard's own division frame).

## 2. Research findings (CLAUDE.md Q1–11)
Sources: the CCSS text quoted in the New Jersey Grade 4 Unit 1 CAR template (nj.gov/education/standards/math/car, "700 ÷ 70 = 10"); a Teachshare special-education listing for 4.NBT.1 (worksheet tasks: "ten times a given number", "one-tenth of what number?", "compare two similar digits in one number"); shmoop 4.NBT.1 standard page. MathWorksheets4Kids and IXL were not opened this round (no login in this container); to refine.
1. Types: the value of the same digit in two places; "how many times greater is the 4 in 4,300 than the 4 in 430?"; "___ is one tenth of ___"; compare two equal digits in ONE number (4,440); 700 ÷ 70 = ?.
2. Visuals: place-value chart with both numbers aligned by place; base-ten blocks (10 rods = 1 flat); arrows between columns.
3. Answers: a value (number), a relation ("10 times" / "one tenth") — ours: write the values, ring the relation.
4. Progression: digit and zeros (700 / 70) → other digits round it → different lengths → bigger places (to 99,999) → decimals (Grade 5).
5. Edge cases: numbers of different lengths (the digits do not line up from the left); the ones place (7 vs 70); the thousands; a 0 in the number.
6. One change per step: values first (written), then the relation; Practice 2 changes only the size of the numbers.
7. Structural: the chart and its heads, the worth boxes (stay); hint: Guided cell 1's traced values (fades).
8. Response: numbers in boxes and a ring from two printed labels; never multiple choice for the values.
9. Say: "The 6 in 613 is 10 times the 6 in 868."
10. Misconceptions: same digit, same value; "10 times" whichever way round; counts two places (100 times); writes the digit in the worth box.
11. Fit: one item a row (chart + three-line sentence), 4 a Practice page; the exit slip 3 a half.

## 5. Owner questions
1. One tenth written as the words "one tenth of" (ring) rather than the fraction 1/10? Recommend: words in Grade 4; 1/10 and 0.1 in lesson 9.
2. Two digits in ONE number (4,440: which 4 is worth 10 times the other?) — a later option `tenOne`? Recommend: yes, as a stretch page after lesson 9; not today (one new thing).

## 6. Skill coverage (owner rule, round 2)
skills.used (all `placevalue:*`, value = `placevalue:value` form `times`):
- P0: `identify` {band 999, circle} · `value` {band 9999, form value} · `place_value_10x` {op x, power [10], band 1000} · `place_value_10x` {op /, power [10], band 1000}
- P1: `more_less_100` {step 10 more / 100 less / 100 more / 10 less} · `compare` {band 999, far | close}
- P2 chart, P3 Guided + Independent, P4-1: value {form times, band 9999, tenDir both, tenValues on}; P4-2: the same, band 99999
- P5: value {form times, tenTask story, tenDir times, band 9999} · P6: value {form times, tenWrite top, tenDir times | tenth, band 9999}
- Check Question: value {form times, tenValues off, tenChoice four, band 9999} (r4, critic r2 D2: the board's four words online)
- P0 (r4): two items per prerequisite (the page prints two; `items: 4` was cut to two by the role)
- Presets (r4, owner rule "a distinct option is also a findable skill"): `placevalue:ten_times_value` (Y7), `placevalue:one_tenth_value` (Y8), `placevalue:ten_times_story` (Y9)

skills.coverage:
| Clause / atom | Skill + opts | Verdict |
|---|---|---|
| 4.NBT.A.1 "a digit in one place represents ten times what it represents in the place to its right" | value {form times, tenDir times} | full |
| 4.NBT.A.1 "multi-digit whole number" | value {form times, band 9999 / 99999 / 999999} | full |
| 4.NBT.A.1 "recognize that 700 ÷ 70 = 10 by applying place value and division" | value {form times, tenTask story} | full |
| one tenth, whole numbers (the site lesson's title; 5.NBT.A.1 clause in words) | value {form times, tenDir tenth} | full |
| 5.NBT.A.1 with decimals; 1/10 written as a fraction or 0.1 | — | elsewhere: lesson 9 (5.NBT.A.1), the same template with decimal rows |
| Atoms 1-4 (places, value, × 10, ÷ 10) | identify · value {form value} · place_value_10x {x | /} | full |
| Atoms 5-8 (one place left, left or right, any place, one tenth) | value {form times, tenDir both, bands to 99999} | full |
| Routine step 3 on the exit slip (one worth box, then the ring) | value {form times, tenWrite top} | full |
| Check Question (board A-D: one tenth of · the same as · 100 times · 10 times) | value {form times, tenValues off, tenChoice four} | full (r4; recorded in data/curriculum/detailed-lessons.json) |
