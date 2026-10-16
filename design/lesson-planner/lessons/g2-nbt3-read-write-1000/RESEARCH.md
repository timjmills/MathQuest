# g2-nbt3-read-write-1000 — Read and write numbers to 1,000 (numerals, words, expanded form)

## 1. Tags
- Grade 2 · Domain: Number & Operations in Base Ten.
- CCSS **2.NBT.A.3** (read and write numbers to 1000 using base-ten numerals, number names, expanded form). Leans on 2.NBT.A.1 (hundreds, tens, ones).
- EE **M.EE.2.NBT.3** (Identify numerals 1 to 30). EE note: the EE pupil does the numeral-reading strand only; for them run the P1 band A items with numbers 1–30 and the to_number direction with 1–30 words. No 3-digit work is required for EE.
- WRM: no exact step (CCSS build lesson). Near steps: Y2.B1.S6 "Write numbers to 100 in words", Y2.B1.S8 "Write numbers to 100 in expanded form", Y3.B1.S5 "Represent numbers to 1,000", Y3.B1.S6 "Partition numbers to 1,000".

## 3. Skills (written first — the maker needs this)

| Skill | Options | Role in pack | Verdict |
|---|---|---|---|
| `composing:number_word_form` | `wordform:['to_number']` (P3/P4 sec 1), `['to_words']` (P4 ★★★ only) | MAIN practice: words ↔ numeral | **Needs option**: no band. Deals `rng(10, min(state.range, 9999))`, so at default range 100 it deals 2-digit only; at range 1000 it deals 10–1000 (mostly 3-digit, ~10% 2-digit); at 10000 it deals 4-digit (audit defect). Proposal below. Meanwhile run with `range: 1000`. |
| `placevalue:expand` | `band:999, zero:true, frame:'boxes', form:'sum'` | MAIN practice: numeral → expanded (P4 sec 2) | **Fits**. Kit cell (`expand`), one box per place incl. zero part; provider in `sheet/providers/pv.js` has workedSteps + iCan. Never deals 1,000 (digitSpan to 999). |
| `placevalue:combine` | `band:999, zero:true, order:'largest'` → ★★★ `order:'scrambled'` | expanded → numeral (P4 sec 2b / exit) | **Fits**. Shows non-zero parts only (300 + 5 = ___ → 305): the zero-place edge case for free. Cell `frame`, string "Write the number." |
| `placevalue:unit_form` | `band:999, rename:'standard'` | P0 prereq + P1 band B | **Fits**. Deals "4 hundreds 0 tens 5 ones" zero-place every 3rd item. |
| `composing:base10_build_hundreds` | `band:999` | P0 prereq (read blocks) / P1 band A | **Fits** (visual-grid, reviewed). |
| `placevalue:pv_disks_build` | `band:999` | optional concrete panel only | Fits; not needed in pack (CRA is pictorial→abstract here). |
| `placevalue:number_word_names` | `band:999` | NOT used | Grade-4 multiple-choice; P-29 forbids MC for a production item. Use only as a Check Question source, not practice. |
| `placevalue:identify` / `value` | `band:999` | P0 prereq (digit's place / value) | Fits. |
| Word problem | none fits a "read/write a number" story | P5 | Use a hand-authored story with `combine` numbers (parts given in story → write the number, then words). Flag for maker. |

Generator evidence (derived from code):
- `number_word_form` to_number: text "Write the numeral: three hundred forty-seven" → ans 347 (number). to_words: "Write the number in word form: 305" → "three hundred five". Words engine: no "and", hyphenated tens (forty-seven), teens correct (two hundred thirteen), 1000 → "one thousand". Emits legacy visual (PV chart filled only when numeral is given), no `q.cell`; rotates two variants via `wordFormWay()` per itemIndex (no mixing on one page if one way ticked).
- `expand` boxes: "Write 406 in expanded form." → 400 + 0 + 6 (key also accepts 400 + 6 on line frame).
- `combine`: "300 + 5 = ____" → 305; scrambled: "7 + 200 + 40 = ____" → 247.
- `unit_form`: "4 hundreds 0 tens 5 ones = ___" → 405.

**Proposal** (BUILD_LIST style): option on `composing:number_word_form` — `band` enum [20, 100, 1000] default 100 ("Numbers to"), with lo = previous band + 1 (so band 1000 deals 101–1000), plus `zero` bool ("A zero in the tens or ones", deals every 3rd item with a 0 place) and include 1,000 once per page at band 1000. Grade 2, 2.NBT.A.3 / M.EE.2.NBT.3, template: migrate to kit `equation`/`frame` cell (word line + numeral slot B(4); to_words: a 120 mm ruled line). Also new instruction keys (C.1 has none): `write-numeral` "Write the number." (exists in combine printText; add key) and NEW `write-words` "Write the number in words." Meanwhile: `range:1000`, discard 2-digit deals in pool (LR-5).

## 4. V22 content

- **I Can:** "I Can read and write numbers to 1,000" (37 chars; short form "I Can write numbers 3 ways").
- **CRA:** Pictorial → Abstract (place-value chart + hundreds/tens/ones blocks drawn on P2; abstract on P3–P4).
- **Flow:** Chunked (4 steps tagged New ≥ 4 → T2 rule). Chunk 1: words → numeral. Chunk 2: numeral → expanded and back.
- **Routine steps (icons from STEP_ICONS):** 1 `look` "Read the hundreds word." 2 `write` "Write each digit in its place." 3 `check` "No word? Write 0." 4 `say` "Say the number." Chant (helps the zero): "Hundreds, tens, ones — every place gets a digit."
- **Vocabulary (3):** *digit* — "one of 0 to 9" (box with 7); *expanded form* — "the number split by place" (347 = 300 + 40 + 7 with arrows); *place* — "hundreds, tens or ones" (3-column chart H T O).
- **Remember:** "Every place needs a digit. No tens? Write 0 — NOT 35 for three hundred five." (C.4 contrast).
- **T2 atoms:**
  1. Fact · "Key name: digit names 0–9 and teen words" · Pre-requisite · read eleven–nineteen.
  2. Fact · "Key name: tens words" · Pre-requisite · twenty…ninety; forty has no u.
  3. Conceptual · "Key name: hundreds, tens, ones" · Pre-requisite · 3 digits = 3 places (2.NBT.A.1).
  4. Category · "Key name: number word parts" · New · the word before "hundred" is the hundreds digit; the rest is a 2-digit number.
  5. Conceptual · "Key name: zero holds a place" · New · **Critical Atom**: 305, 450, 1,000.
  6. Comparative · "Key name: teen vs ty" · New · thirteen 13 vs thirty 30 (213 vs 230).
  7. Conceptual · "Key name: expanded form" · New · each digit times its place; 400 + 0 + 6.
  8. Fact · "Key name: no 'and'" · New · US: "three hundred five", not "three hundred and five" (ELL/British-English pupils say "and" — accept orally, never write).
- **T2 routine table:** 1 Find the hundreds word, write its digit · Pre-req · chart H column filled. 2 Read the last two words as one 2-digit number · New · tens + ones columns. 3 Empty place → 0 · New · **Critical** · "Is every box filled?" 4 Read the number back · New · matches the words.
- **How to teach:** chart first, always 3 boxes; cover the word card with a hand to read part by part ("three hundred | forty-seven"); teach to_number before to_words (lower writing load).
- **Common mistakes:**
  1. Drops zero · step 3 · three hundred five → 35 · "3 boxes, 3 digits" chart · CQ option A.
  2. Writes each word as a number · step 2 · 300407 or 30047 for three hundred forty-seven (3007 for three hundred seven) · read the last two words as one number · CQ option B.
  3. Teen/ty swap · step 2 · two hundred thirteen → 230 · say "-teen" vs "-ty" stress, ones vs tens column · CQ option C.
  4. Expanded: digits not values · 347 = 3 + 4 + 7 · "What is the 3 worth?" chart.
- **T1 boxes:** Tip: keep the H T O chart on every guided cell. Tip: accept "and" spoken, never written. Watch: zeros (305, 450).
- **Materials:** hundreds/tens/ones blocks or drawn chart, MWB, number word cards (hundred, teens, tens).
- **P0 prerequisite check:** (a) Read 2-digit word → numeral, "forty-six" — `number_word_form` band 100 — route to Y2.B1.S6 / `2.NBT.A.3 Write numbers to 100 in words`. (b) Blocks → number, 2 flats 3 rods 5 cubes — `base10_build_hundreds` — route `2.NBT.A.1 Hundreds, tens and ones`. (c) Value of a digit, 7 in 472 — `placevalue:value` band 999 — route `2.NBT.A.1`. (d) Unit form "5 hundreds 2 tens 0 ones = __" — `unit_form` — route `2.NBT.A.1a/b`.
- **P1 number sense:** Band A (5): blocks → numeral (base10_build_hundreds). Band B (5): unit form → numeral with a zero place (unit_form).
- **Spaced retrieval (MWB):** 10 more than 46 → 56; 38 = __ tens __ ones → 3, 8; seventy-two as a numeral → 72.
- **Chaining bridge:** "You wrote two-digit numbers in words. Today we put a hundreds word in front."
- **I Do:** chart example 347 (3 different non-zero digits, hyphenated tens; shows all forms). Panel 2: 305 (zero tens). Panel 3: 213 (teen).
- **We Do:** 562, then 480 (zero ones); pupils fill boxes on MWB, choral read.
- **Check Question:** "three hundred five" → A 35 (dropped zero) · B 3005 (wrote 300 then 5) · C 350 (place swap) · **D 305 correct**. (Use 4 options or drop C if 3 required: A, B, D.)
- **You Do composition:** P4 sec 1 words → numeral 6 items (★ chart shown, ★★ chart empty boxes, ★★★ no chart); sec 2 expand 6 (`expand` boxes); ★★★ last row: 305, 450, 213, 1,000 (word → numeral) and one to_words (607). Avoid: repeated digits (333), all-zero tails other than 1,000, numbers < 100, 11/12 as the only teen. Pool rule (LR-5): pool = 101–1000 with ≥ 1 non-zero tens or a teen ending; ~900 usable; drop any dealt <100 from range-1000 generator.
- **P5 word problem (our own):** "A box has 4 bags of 100 beads and 6 loose beads. How many beads? Write the number in words." RCDWS: Read; Circle 4 bags of 100, 6; Draw H T O chart; Write 400 + 0 + 6; Solve 406, "four hundred six".
- **Exit slip:** (1) six hundred twenty-eight → __ (628); (2) nine hundred four → __ (904); (3) 700 + 10 + 5 = __ (715); (4) 563 = __ + __ + __ (500 + 60 + 3).
- **Delivery scripts (T-SCRIPT):**
  1 Retrieval — Do: MWB 3 Qs · Say: "Write the answer. Hold it up." · Note: check 72.
  2 Bridge — Say: "You wrote numbers to 100 in words. Today: hundreds." 
  3 Vocab — Do: point to chart · Say: "A digit goes in each ___." (place)
  4 I Do {chart.a} — Do: read the word card in two parts · Say: "{chart.a.hundreds} hundred. That is ___ in the hundreds." · Ask: "What are the last two words?" 
  5 I Do zero {chart.b} — Say: "No tens word. I write ___ in the tens." (0)
  6 We Do {we.a}, {we.b} — Ask: "Hundreds digit? Tens? Ones?" · Say: "Read it with me."
  7 Check Question — Ask: "Which is three hundred five?" · Note: route A → zero reteach.
  8 You Do — Do: P4 · Note: circulate to ★★★ zeros.
  9 Word problem — Do: RCDWS · Say: "The number is ___. In words, ___."
  10 Exit — Do: P6, 4 items; no help.
- **Feedback/watch boxes:** sec 4–5 watch "35 for 305"; sec 6 watch teen/ty; sec 8 watch 3 + 4 + 7.
- **T-LOOP:** after CQ: ≥ 80% D → You Do; A chosen → reteach Panel 2 with blocks (0 rods) then 2 more items; B → reteach "last two words are one number".
- **T6 routing:** P0a → Write numbers to 100 in words · P0b–d → 2.NBT.A.1 Hundreds, tens, ones. **Accepted answers:** expanded 400 + 6 and 400 + 0 + 6, any order; words with/without hyphen in tens accepted, "and" marked as a note not wrong, spelling slips (fourty) not marked as maths errors. **Wrong answers:** 35 for 305 → dropped zero → step 3 chart; 3005 → wrote each part → read the last two words as one number; 230 for 213 → teen/ty → Comparative atom card; 3 + 4 + 7 → digit not value → "worth" chart.

## 2. Research findings (CLAUDE.md Q1–11)
Sources: https://cpalms.org/PreviewStandard/Export/15280 (413 → 400+10+3; expanded → numeral formative items), https://boddlelearning.com/2nd-grade/reading-writing-numbers-up-to-1000 (no "and" in written numbers), https://magicorelearning.com/?p=1846 (standard/expanded/word-form unit), https://internal.varsitytutors.com/common_core_2nd_grade_math-help/read-and-write-numbers-to-1000-by-numerals-number-names-and-expanded-form-ccss-math-content-2-nbt-a-3?page=1 (word-form items, e.g. eight hundred four). MathWorksheets4Kids, IXL, K5 not fetched this round (public search did not surface them; to refine).
1 Types: word→numeral, numeral→word, numeral→expanded, expanded→numeral (incl. scrambled), match forms. 2 Visuals: H T O chart, base-10 blocks, word cards. 3 Answers: number slot; words on a ruled line; expanded boxes. 4 Progression: blocks → chart → numerals only; no zeros → zeros. 5 Edge cases: zeros in tens/ones (305, 450), 1,000, teens in last two digits (213), hyphenated tens, no "and". 6 One change per step: words→numeral first, then zero places, then expanded, then words (writing). 7 Structural: H T O boxes/expanded boxes stay; hint: filled chart, word split bar fade. 8 Response: a number; words only at ★★★ (spelling load). Never MC on paper or screen (sites use MC on screen; our P-29 overrides). 9 Say: "Three hundred forty-seven is 300 plus 40 plus 7." 10 Misconceptions: dropped zero, concatenation (3005 for 305; 300407 or 30047 for 347), teen/ty swap, digit-not-value. 11 Fit: ≤ 6 cells per page at L (sites print 20–30); override.

## 5. Owner questions
1. Spoken "and" (British-English/ELL pupils)? Recommend: accept orally, model the US form in print, do not mark wrong on to_words.
2. Include 1,000 in practice? Recommend: yes, once on ★★★ and on the anchor chart edge panel; not in expand (generator caps 999).
