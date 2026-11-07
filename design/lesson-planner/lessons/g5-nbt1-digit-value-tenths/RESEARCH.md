# g5-nbt1-digit-value-tenths — Compare digit values: 10 times the place to its right, 1/10 of the place to its left

Owner build #9 (W06, Grade 5, NBT). Research only (2026-10-17); no code written. Lesson 6
(`g4-nbt1-ten-times-value`, 4.NBT.A.1, whole numbers, ×10 one way) is being built in parallel: this lesson must be
DISTINCT — Grade 5 adds **both directions** (×10 AND 1/10) and **places below the ones** (tenths, hundredths,
thousandths). It shares lesson 6's template / option where they exist; it copies none of its pages.

## 1. Tags
- Grade 5 · Domain: Number & Operations in Base Ten.
- CCSS **5.NBT.A.1** ("a digit in one place represents 10 times as much as it represents in the place to its right
  and 1/10 of what it represents in the place to its left"). Leans on 4.NBT.A.1 (whole numbers, ×10) and 4.NF.C.6
  (tenths/hundredths as decimals); feeds 5.NBT.A.2 (×/÷ by powers of 10) and 5.NBT.A.3a (lesson 10).
- EE: repo `ee` = **M.EE.5.NBT.1** ("Compare numbers up to 99 using place value models", ee-math.json; it is the EE
  `placevalue:place_value_10x` carries). Owner sheet row 9 lists the same code (wording "…using base ten models"), so
  `eeOwnerList` = `['M.EE.5.NBT.1']` — no difference to record. EE note: the EE pupil compares two 2-digit numbers
  with tens rods and ones cubes ("4 tens is more than 4 ones": the same digit is worth more one place left) — the
  whole-number end of this lesson's idea; run the P1 band A blocks items with numbers ≤ 99 for them.
- siteLessonId: **`G5|-|comparedigitvaluesadigitisworth10timestheplacetoitsrightand110oftheplacetoitsleft`**
  (site-lessons.json: grade G5, wrmYear Y6, supplement, power, weeks W06; ccss 5.NBT.A.1, ee M.EE.5.NBT.1).
- WRM: no exact step (CCSS build lesson). Year Y6 per the site record. Near steps: **Y6.B8.S1 "Place value within 1"**
  and **Y6.B8.S2 "Place value – integers and decimals"** (both 5.NBT.A.1/5.NBT.A.3, open on `WRM_PROPOSALS` →
  `dec_pv_within1`), Y5.B7.S7 "Thousandths on a place value chart", Y4.B1.S2 (lesson 6's step; `value_ten_times`
  names it), Y5.B1.S6 / Y6 ×÷10,100,1000 (place_value_10x).
- Audit: `standards-audit.js` 5.NBT.A.1 = **P** (partial), missing clause "a digit is 10 times the place to its right
  and 1/10 of the place to its left, compared directly", closers `value_ten_times` + `dec_pv_within1`. Building this
  lesson's skill option closes both → flip to F and delete those two entries (CLAUDE.md rule).

## 2. Research findings (CLAUDE.md Q1–11)
Sources: https://thecorestandards.org/Math/Content/5/NBT/A/1/ (standard text),
https://achievethecore.org/content/upload/5.NBT.A.1_NWEA.pdf and https://achievethecore.org/file/5115 (sample item:
"a tenth is ___ times as large as a hundredth", choose from 1/1000, 1/100, 10, 100; probe "which is bigger, a tenth or
a hundredth?"), https://achievethecore.org/content/upload/Gr%205.P.5%20Decimal%20Place%20Value_Final.pdf (decimal
place-value progression), https://tasks.illustrativemathematics.org/5.NBT.html (tasks "Tenths and Hundredths",
"Millions and Billions of People"), https://www.cazoommaths.com/us/math-worksheets/5.nbt.a.1-worksheets (decomposition
"3 tenths, 9 hundredths"), https://ilclassroom.com/resources/72778 (value of digits). MathWorksheets4Kids / IXL
(logged-in) not fetched this round — to refine at build (IXL G5 "Value of a digit: decimals" and "Relationship between
decimal places" are the expected matches).

1 **Types**: (a) value of the underlined digit in a decimal (0.07); (b) "The 4 in 0.4 is ___ times the 4 in 0.04"
(10); (c) "The 3 in 5.03 is ___ of the 3 in 5.3" (1/10); (d) same digit two places apart (100, 1/100) in whole
numbers and decimals; (e) unit renaming "1 tenth = ___ hundredths" (10); (f) ×10 / ÷10 moves a digit one place
(0.6 × 10 = 6; 6 ÷ 10 = 0.6). 2 **Visuals**: place-value chart with a decimal point column line (O . t h th), arrows
"×10 ←" / "→ ÷10" between columns, base-10 flat/rod/cube as 1 / 0.1 / 0.01, hundredths grid. 3 **Answers**: a number
(10, 100) or a fraction from a bank (1/10, 1/100); the value of a digit (0.007). 4 **Progression**: whole numbers
both directions (bridge from lesson 6) → ones/tenths → tenths/hundredths → hundredths/thousandths → two places apart.
5 **Edge cases**: the ones↔tenths boundary (the point is not a place), zeros between (4.04), same digit twice in one
number (0.44: the left 4 is 10 times the right 4 — the cleanest item), leading 0 in 0.4 has no value, 10 vs 1/10
direction.
6 **One change per step**: S1 ×10 to the left (known, whole numbers) → S2 1/10 to the right (new direction, whole
numbers) → S3 across the point (ones/tenths) → S4 inside the decimals (tenths/hundredths/thousandths) → S5 (★★★) two
places apart (100 / 1/100). 7 **Structural**: the chart with the point column and the two arrow labels stays on
every guided cell; **hint** (fades): digits pre-written in the chart, the arrow already labelled "×10". 8 **Response**:
write 10 or 1/10 (pupil copies from the bank `10 · 1/10 · 100 · 1/100`), or a value; never MC on screen for a value
item (P-29); the bank is a structural support for the fraction spelling, the decision is still the pupil's. 9
**Say**: "The 4 in 0.4 is 10 times the 4 in 0.04. One place left is 10 times." / "One place right is one tenth." 10
**Misconceptions**: below. 11 **Fit**: ≤ 6 cells per page (L); sites print 20+.

## 3. Skills (the maker needs this)

| Skill | Options | Role in pack | Verdict |
|---|---|---|---|
| `placevalue:value` + lesson 6's ten-times option (`value_ten_times`, form "ten times / one tenth") | whole numbers, both directions | P0 bridge / P1 band B / I Do panel 1 | **Depends on lesson 6.** Lesson 6 is building the option now (4.NBT.A.1, ×10). If it lands as specified (`problemTypes` include "the 3 in 0.3 is 1/10 of the 3 in 3") with a **direction** control, reuse it for S1–S2 here. Read lesson 6's final option ids before making. |
| **NEW option** on the same skill: `decimals` (bool, "Decimal places (grade 5)") or a band value `'dec3'` | tenths/hundredths/thousandths, both directions | MAIN practice P3/P4 (S3–S5), exit, CQ | **Missing — smallest build that closes the lesson.** See proposal. |
| `placevalue:place_value_10x` | `decimals:true, power:[10], op:'both'` | P4 sec 2 "show it moved" (0.6 × 10, 6 ÷ 10) | **Fits partly.** Verified (node, generateQuestionFor): deals `43.9 × 1,000`, `341 ÷ 10 = 34.1`, `424 ÷ 1,000 = 0.424`, `87.2 × 100`. Problems: (1) the shift chart is dropped for every non-whole item (`support` forced to 'none' when n or ans is not an integer, gen-pv.js genTimesTen) — so no chart on decimal items; (2) × with decimals is always 1 dp ≥ 1.1 (no 0.6 × 10); (3) ÷ always starts whole. Use `power:[10]` only (this lesson is 10 / 1/10, not 100/1000 — that is 5.NBT.A.2). OK as P1 band / spaced retrieval; not as the main item. |
| `placevalue:value` | `band:9999, form:'value'` | P0c (value of a digit, whole) | Fits (verified: "Write what the underlined digit is worth." → 500). No decimal band. |
| `conversions:d_to_f` | default | P0 (0.7 = 7/10) | Fits for tenths only; mixes a drag-to-bin variant and simplifies (0.6 → 3/5) — **do not use in practice**; P0 hand item only. |
| `decimals:compare_thousandths` | `forms` | NOT this lesson (5.NBT.A.3b). Spaced retrieval later. | — |

**Proposal (closes `value_ten_times` decimal half + `dec_pv_within1`; BUILD_LIST style)** — option on the lesson-6
skill (`placevalue:value`, ten-times form), appended keys in `skill-option-keys.js`:
- `decimals` bool (default false): places run Th…ones.tenths hundredths thousandths; numbers ≤ 3 dp, integer part
  0–99.
- `direction` enum `times` (10 times) / `tenth` (1/10 of) / `both` (alternating by `slot(2)`), default `both` at
  decimals on (lesson 6 owns the whole-number default).
- `gap` enum `1` (adjacent) / `2` (two places: 100, 1/100) — ★★★ only.
- Item frame (one per page): "The **4** in 0.**4**4 is ____ the **4** in 0.4**4**." pupil writes `10 times` or
  `1/10 of` — simplest written response: the frame prints "____ times" / "____ of", the slot takes `10` or `1/10`
  (screen: typed; accept "1/10", "0.1", "one tenth").
- Second item kind (`kind:'pair'`): two numbers, same digit: "the 7 in 0.7 and the 7 in 0.07" with both values
  written under them (0.7, 0.07) at ★, values blank at ★★.
- Cell: `pv-support` with `picture:'chart'` extended to decimal places (that is **`vis_pv_decimal_places`**, the
  placevalue-lane template entry: Tth / Hth / Thth heads, point on the ones|tenths column line). Smallest version for
  this lesson: `placeChartHTML` + `shiftChartHTML` accept a `dp` (0–3) and draw the point line; two digits ringed and
  an arrow between them labelled "×10" / "÷10" (hint, fades).
- Provider: strings `ten-times-left` "Write 10 times or 1/10 of.", workedSteps (find both digits → count the places
  between → left = ×10, right = 1/10), wrongAnswer map (below), footprint at L 2 cols.
- Tags: SKILL_STANDARDS stays (already 5.NBT.A.1 on place_value_10x; add 5.NBT.A.1 + M.EE.5.NBT.1 to `placevalue:value`),
  SKILL_WRM add `{step:'Y6.B8.S1', partial}`; search terms "ten times", "one tenth of", "place to the left".
- Content-audit: no op name → name check passes; add case tests (node): 0.44 (left 4 = 10 × right 4), 3.03, 0.505,
  direction rotation, gap 2 gives 100 / 1/100 only.
- **Fallback if not built**: hand items (detailed lesson `items` hook like lessons 1–5) for P3/P4, `place_value_10x
  {decimals:true, power:[10]}` for the ×/÷ section — record as a BUILD_LIST proposal.

## 4. V22 content
- **I Can:** "I Can compare a digit's value one place left or right" (short: "I Can see 10 times and 1/10").
- **CRA:** Concrete (flat = 1, rod = 0.1, cube = 0.01 — named, not used on paper) → Pictorial (decimal chart with
  arrows) → Abstract.
- **Flow: Chunked** (5 steps, 4 New). Chunk 1: whole numbers both ways (×10 left / 1/10 right). Chunk 2: across and
  inside the decimals.
- **Routine steps:** 1 `look` "Find the two digits." 2 `point` "Count the places between." 3 `write` "Left: 10 times.
  Right: 1/10." 4 `say` "Say it." Chant: "Move left — ten times. Move right — one tenth."
- **Vocabulary (3):** *tenth* — "1 split into 10 equal parts" (0.1 bar of 10); *ten times* — "10 groups of it"; *one
  tenth of* — "split into 10, take 1" (0.4 → 0.04 arrow).
- **Remember:** "The point does not move a value — the PLACE does. 0.4 is 10 times 0.04."
- **T2 atoms:**
  1. Fact · "Key name: place names to thousandths" · Pre-requisite · tenths, hundredths, thousandths (not "tens").
  2. Conceptual · "Key name: ×10 = one place left" · Pre-requisite · lesson 6 / 4.NBT.A.1 (70 = 10 × 7).
  3. Fact · "Key name: tenths and hundredths as decimals" · Pre-requisite · 0.3 = 3/10, 0.03 = 3/100 (4.NF.C.6).
  4. Conceptual · "Key name: one tenth of = one place right" · New · 7 is 1/10 of 70.
  5. Category · "Key name: decimal places continue the pattern" · New · **Critical Atom**: ones → tenths is the same
     ÷10 step as tens → ones; the point marks ones, it is not a place.
  6. Comparative · "Key name: 10 times vs 1/10 of" · New · same two digits, two sentences (0.4 vs 0.04 both ways).
  7. Conceptual · "Key name: two places = 100" · New (★★★) · 0.4 is 100 times 0.004.
- **T2 routine table:** 1 Ring both digits · Pre-req. 2 Count places, not digits; skip the point · New · **Critical**.
  3 Left of the other → ×10; right → 1/10 · New. 4 Check with values (0.4 ÷ 0.04 = 10) · New.
- **How to teach:** start with 44 then 4.4 then 0.44 (same digit twice, one number) so the comparison is inside one
  chart; say the place names, never "point four four" on I Do; arrows drawn on the chart.
- **Common mistakes:** see §5.
- **T1 boxes:** Tip: keep the point column line bold. Tip: answer bank 10 · 1/10 on every page. Watch: "tenths" heard
  as "tens".
- **Materials:** decimal place-value chart (to thousandths), base-10 flat/rod/cube (flat = 1), MWB.
- **P0 prerequisite check:** (a) value of a digit, whole: 7 in 4,732 → 700 — `placevalue:value band:9999` — route
  4.NBT.A.2. (b) ×10: 36 × 10 → 360 — `place_value_10x power:[10] op:'x'` — route lesson 6 / 4.NBT.A.1. (c) 0.3 as a
  fraction → 3/10 (hand item; `d_to_f` simplifies) — route 4.NF.C.6. (d) Name the place of the 5 in 2.05 →
  hundredths (hand item; no decimal `identify` band) — route 4.NF.C.6.
- **P1 number sense:** Band A (5): ×10 and ÷10 with whole numbers (`place_value_10x power:[10] op:'both'`, band
  1000). Band B (5): ÷10 into the decimals (`decimals:true, power:[10], op:'/'`: 34 ÷ 10 = 3.4).
- **Spaced retrieval (MWB):** 400 = __ × 100 (4); 6 tenths as a decimal (0.6); round 347 to the nearest 10 (350).
- **Chaining bridge:** "Last time a digit one place left was worth 10 times. Today we go right too — and past the
  point."
- **I Do:** Panel 1: 44 (whole, both ways). Panel 2: 4.4 (across the point). Panel 3: 0.44 (inside decimals).
- **We Do:** 3.33 (tenths vs hundredths), 70.07 (★: zeros between — two places? no: 7 tens vs 7 hundredths is 3
  places → keep for teacher talk only; We Do item b is 5.55 ones vs tenths).
- **Check Question:** "The 6 in 0.6 is ___ the 6 in 0.06." A "1/10 of" (direction swap) · B "6 times" (digit, not
  place) · C "100 times" (counted digits incl. 0) · **D "10 times" correct**.
- **You Do composition:** P3/P4 sec 1 adjacent places, `direction:'both'` 6 items (★ chart + arrows shown, ★★ chart
  blank, ★★★ numbers only); sec 2 `place_value_10x decimals power:[10]` 6 items; ★★★ last row: two places apart (100,
  1/100), a zero between (5.05: 5 ones vs 5 hundredths → 100 times).
- **P5 word problem (our own):** "A ribbon is 0.5 m. A bead is 0.05 m. How many times longer is the ribbon than the
  bead?" RCDWS → chart → 10 times. (Measure context, one comparison.)
- **Exit slip:** (1) The 3 in 0.3 is __ times the 3 in 0.03 (10). (2) The 8 in 2.08 is __ of the 8 in 2.8 (1/10).
  (3) 0.7 × 10 = __ (7). (4) 9 ÷ 10 = __ (0.9).
- **T-LOOP / T6 routing:** A → reteach arrows on the chart ("which is further left?"); B → value first (0.6 and 0.06)
  then compare; C → count places not digits. P0a/b → lesson 6 (4.NBT.A.1); P0c/d → 4.NF.C.6. **Accepted:** 1/10,
  one tenth, 0.1; "ten times"/"10 times"/"×10".

## 5. Misconceptions (with the wrong answers they make)
1. **Direction swap** — "The 4 in 0.4 is 1/10 of the 4 in 0.04" (writes 1/10 where 10 is right). Fix: the left digit
   is the bigger one; arrows.
2. **Digit, not place** — "The 4s are the same, so 1 time / equal" or "4 times". Fix: write both values (0.4, 0.04).
3. **Longer is larger** — thinks 0.04 > 0.4 ("4 hundredths is more than 4 tenths, hundred > ten"), answers 1/10 for
   the hundredths digit's turn the wrong way. Fix: hundredths are smaller pieces (grid).
4. **Point as a place / counts digits** — for 5.05 counts the 0 and the point → "1,000 times"; or across the point
   says ones→tenths is "not 10 times". Fix: the point is a line, not a column.

## 6. Edge cases
Same digit twice in one number (0.44, 3.33) — the clean item; zeros between (5.05 → 100 times, ★★★); integer part 0
(0.4: the leading 0 is a place holder, not compared); ones ↔ tenths across the point; thousandths (0.004) at ★★★ only;
avoid digit 0 or 1 as the compared digit (0 has no value to compare; 1 reads as the answer). **★★★ edge case:** a
zero place between the two digits (5.05, 0.303) — the pupil must count places, not digits.

## 7. Number pool (LR-5, no repeats)
Compared digit 2–9; positions adjacent pairs among {tens, ones, tenths, hundredths, thousandths} → 4 pairs × 2
directions × 8 digits = 64 sentence items before integer-part variety; with integer part 0–99 and filler digits the
pool is > 2,000 numbers. Needs: chart 3, Guided 6, Practice 2 pages × 6 = 12, P5 1, exit 4, CQ 1 → 27 ≤ pool.
Rule: one item per digit value per page; never repeat a number across the pack.

## 8. Distinct from lesson 6
Lesson 6: whole numbers, ×10 to the left (4.NBT.A.1). Lesson 9: both directions, decimals across and below the point,
1/10 written as an answer, ★★★ two places apart. Shared: the ten-times option and its chart cell, the routine's first
two steps; no page reused.

## 9. Owner questions
1. Accept "0.1 times" for "1/10 of"? Recommend: accept 1/10, one tenth, 0.1 on screen; model "1/10 of" in print.
2. Include 100 / 1/100 (two places apart)? Recommend: ★★★ only (it is 5.NBT.A.2's door), not in exit.
