# Place value and rounding: the content specification (P9)

Written 2026-09-24. Branch `sped-worksheet-standard`. This is the **content** specification for wave P9,
the place value + rounding family, which the owner ruled on 2026-09-24 is the next family after the redone
families pass: what a correct place-value, rounding and estimation ladder actually contains for an ELL /
special-education pupil at a Common Core school, where six items fill a sheet.

It is written in the shape of `design/research/k2-number-sense.md` (P6) and
`design/research/operations-facts-v2.md` (P4), and it plays the same two roles: research says *what to teach
and in what order*; the design and pedagogy standards say *how it looks and how it is scaffolded*, and they
win every conflict (§1.4). It adds three things those two did not carry, because the 2026-09-24 critic
baseline showed they are where this family fails: **cell geometry in millimetres sized to the hardest item**
(§13), **the answer-key facsimile per cell** (§13), and **the content-audit rules** the gate needs before a
single generator is touched (§17).

It builds on `design/catalogue/k2-number-sense-place-value.md` (the per-skill audit of the `placevalue` and
`number_sense` ids) and answers the five research questions that file left open for this half of the family
(its questions 4, 5, 6, 7 and 9; §1.5), plus the owner questions it left unruled (catalogue owner questions
5, 6, 7 and 9; §20).

Nothing here changes code. No skill id is renamed, moved or removed by this document.

## Related documents

| Document | What it governs | How this document uses it |
|---|---|---|
| `WORKSHEET_DESIGN_STANDARD.md` | The visual contract | §11.2 minimum sizes, §11.5 base-10 (RP-30 … RP-32), §11.6 place-value chart (RP-40, RP-41), §11.7 number line (RP-50 … RP-54), §6 slots and B(n), §12 capacity. Every mm figure in §13 is derived from it |
| `PEDAGOGY_STANDARD.md` | The teaching contract | P-1, P-2 (rounding = number line, then a cut line), P-8, P-9, P-10, P-13, P-17, P-29, P-35; L-11 (numbers to 20 / 120 / three-digit); §7.4 Today's Number; §10 language |
| `design/PAGE_TYPES.md` | Page roles | 2.6 sub-skill, 2.7 error analysis, 3.2 equation drill, 3.4 visual grid, 3.6 chart and table, 5.3 Today's Number, 8.6 layered strips |
| `design/PROBLEM_TYPES.md` | Problem catalogue | PV-01 … PV-19, RD-01 … RD-09, RL-05 / 06 / 07 / 12 / 13, and the GAP-4-01 … GAP-4-11 rows this document places on ladders (§19.3) |
| `design/SKILL_CELL_CONTRACT.md` | What a skill supplies | §3.6 option declarations; §10.2 family note (templates `pv-chart`, `base10`, `number-line`; H T O letters by default); §11 share-code safety |
| `design/catalogue/k2-number-sense-place-value.md` | Per-skill verdicts | §2's inventory reconciles every verdict with a re-measure made for this document |
| `design/audit/RUBRIC.md`, `BASELINE-2026-09-24.md` | Every page type and screen host must score 8+ | H2, H4, H9, H10, H12 are the caps this family trips today (§1.3) |
| `design/research/k2-number-sense.md` | P6 | Owns `base10_*`, `tens_foundation_visual`, `number_word_form` (BT and NW ladders) and specifies CP / OR, whose generators live **here** (§3.2) |
| `design/research/operations-facts-v2.md` | P4 | Owns `make_a_ten`, `doubles_near_doubles`, `compensation` as strategy ladders (§3.2); misconception ids M-A*, M-S*, M-X1 are shared |

---

## 0. The rulings this specification is written to

Decided by the owner and in force since P3-P6; not relitigated here.

1. **A skill NAME is its declaration.** "Round to Nearest 100" may not deal a number-line placement item, and
   "Estimate Quotients" may not deal decimal rounding. Where a skill does something its name does not cover,
   the name is fixed; no exemption is added (§17, §19.2).
2. **Options are tick boxes, dealt round-robin off `state.itemIndex`, never rolled.** Every ticked value
   appears on the page. A `Math.random() < 0.3` branch is silent mixing (P-28). **Eighteen of the forty
   ids in scope carry one today** (§1.3).
3. **Options live on the skill, not the page**, travel into every page role, and are saved and shared with it
   (P-AT-10, SCC-P16). An option's `default` is always the **stand-alone** value; a ladder step supplies its
   own values through `stepOptions()` (ruling R2, `js/modules/skill-options.js` :380-440).
4. **One instruction per section, at most 12 words, from the library, above the cells** (P-14, BD-10). When
   the cell draws the item, `q.text` does not restate it; `q.printText` carries the paper wording.
5. **Structural scaffolds persist; hint scaffolds fade** H1 → H5 (P-7). In this family the structural ones are
   the **place letters H T O** (P-SC-7, VA-30), the **chart rulings**, the **disk / block zones**, the
   **expanded-form frame**, and the **number line's axis and end labels**. The hints are the full place words,
   the midpoint label, the pre-plotted dot, the bold target letter, captions and traced digits.
6. **Any equivalent answer is accepted** unless the instruction says otherwise (P-LG-15). In this family that
   governs expanded form order (`5 + 300` is `300 + 5`), word form (P6 Q6) and estimation (§2.1).
7. **No skill is spliced out of `SKILLS[category]` or moved between categories.** Retirement is a tombstone
   plus an alias in `js/modules/skill-aliases.js` (SCC-X1 … X8).
8. **New skill ids append.** `node tests/scripts/ws-code-snapshot.mjs` reports today
   `OK (591 codes, 35 categories, +19 appended since the pinned baseline of 572 …)`; the number is a live count
   and rises by exactly the ids appended (§18).
9. **Every page type and every screen host must score 8+ on each rubric criterion** (`RUBRIC.md`, owner rule
   2026-09-24), and **H12: the task must make sense on paper.** For a build item that means the drawing zone
   is sized to the **hardest** item the section can deal, not the average one (§13.0).

---

## 1. Method

### 1.1 What was read, and when

All pages read 2026-09-24, without logging in. Membership PDFs were not opened; item descriptions are as the
public topic pages state them. Nothing was downloaded into the repo.

| Question | Source read | Result |
|---|---|---|
| What is the rounding repertoire and its order? | `mathworksheets4kids.com/rounding.php` | Fourteen topics, grades 3-4 unless noted: hundreds chart for rounding; round to the nearest ten; **round up or round down** (place on a number line, then say which way); round up / down chart; nearest hundred; **match to the nearest ten and hundred**; nearest thousand (grade 4); **round to the underlined place value**; **tabular column: ten, hundred, thousand** (grade 4, one number to three places); **round using number line** (2-digit, 3-digit, mixed, as three separate sheets); **multiple response** (select all that round to…); MCQ; large numbers (ten thousands to millions, grade 4); round up / round down by the ones-digit rule. The number line comes **first** and **is split by digit count**; the rule sheet comes last. That is P-2's route (number line, then a cut line) in the world's own order. |
| What is the place-value repertoire? | `mathworksheets4kids.com/place-value.php` (hub page) | The hub's public list is the K-2 end only: base-ten blocks counting to 20, comparing groups, abacus, number words, composing and decomposing tens and ones, ordering, a **base-10 block cut-and-glue** (match blocks to place-value boxes), comparing on ten frames. The grade 2-5 topics (expanded form, value of a digit) sit behind deeper pages; see the K5 row. |
| What does a grade 3 place value and rounding unit contain, in order? | `k5learning.com/free-math-worksheets/third-grade-3/place-value-and-rounding` | Place value: **build a 3-digit number from the parts** (200 + 70 + 1); **find the missing place value** (a missing addend in a decomposition); the same at 4 and 5 digits; expanded form; **expanded notation** (4 × 100 + …); expanded notation to standard; **find a digit's place value**. Then comparing, ordering, skip-count by 100. Rounding: nearest hundred within 0-1,000; nearest hundred within 0-10,000; nearest thousand within 0-10,000; **mixed (10s, 100s)**; mixed (10s, 100s, 1,000s). Rounding is sold **by place and by band**, and "mixed" is always last. |
| What forms and ranges do drill sheets use? | `math-drills.com/numbersense.php` | Rounding to tens … millions; comparing to 9, 25, 50, 100, 1,000 with **"tight" variants (numbers close together)**; standard → expanded form **3 to 9 digits**; expanded factors form (`3 × 100`); expanded exponential form; converting between standard, expanded and written forms. "Tight" is the named version of our same-leading-digit hard case (P6 CP-10). |
| How is rounding taught at K5 / Common Core Sheets? | search results for K5 and `commoncoresheets.com/rounding-worksheets` | Grade 3 rounds numbers **up to 9,999** to the nearest 10 or 100 — i.e. **the band and the place are independent**: a 4-digit number rounded to the nearest 10 is a normal grade 3 item. That is the answer to catalogue owner question 7 (§2.1). |
| What does the Common Core actually require, and where? | CCSS text (known; the codes appear only in teacher footers, P-20) | **1.NBT.B.2** a two-digit number is tens and ones; 10 is a ten; 11-19 are a ten and ones; the decades are tens and 0 ones. **1.NBT.C.5** mentally find 10 more / 10 less (no counting). **2.NBT.A.1** three-digit numbers as hundreds, tens, ones; 100 is ten tens; 0 tens and 0 ones in 100…900. **2.NBT.A.3** read and write to 1,000 in base-ten numerals, number names **and expanded form**. **2.NBT.A.4** compare three-digit numbers with >, =, <. **2.NBT.B.8** mentally add / subtract 10 or 100 to / from a number 100-900. **3.NBT.A.1** round whole numbers to the nearest 10 or 100. **4.NBT.A.1** a digit in one place is ten times what it is in the place to its right. **4.NBT.A.2** read / write / compare multi-digit numbers in all three forms. **4.NBT.A.3** round multi-digit whole numbers to any place. **5.NBT.A.1** the same ten-times relation with decimals (and 1/10 of the place to its left). **5.NBT.A.2** patterns in zeros and decimal-point placement when × or ÷ by powers of 10. **5.NBT.A.3** read, write, compare decimals to thousandths. **5.NBT.A.4** round decimals to any place. Estimation is not a standard of its own; it lives in 3.OA.D.8 ("assess the reasonableness of answers using … estimation including rounding") and 4.OA.A.3. |

### 1.2 What could not be read, and what that costs

- **IXL items were not opened** and no IXL page was fetched in this pass. It does not matter: P-29 forbids
  copying an on-screen response format; our screen item is our printed cell with inputs in its blanks.
- **MW4K and K5 PDFs were not opened** (membership). The *order* and the *named types* are what this
  document uses; neither needs the sheets.
- The research budget for this wave was cut to medium effort mid-pass (coordinator, 2026-09-24). The
  misconception evidence in §14 therefore leans on the standards' own starter list (`PEDAGOGY_STANDARD.md`
  §12), the catalogue's defect notes and the P4 / P6 banks; entries not traceable to a source are tagged
  **[house]**, exactly as P4 and P6 did.

### 1.3 The family as it really is today

Measured for this document, 2026-09-24, through the gate's own mechanism:
`generateQuestionFor({ category, skill, range, decimals: 0, seed, itemIndex })` inside the Puppeteer harness
(`tests/lib/ws-harness.cjs`), **60 items at Max Number 100 plus 60 at 1,000 per skill (seeds 7000-7059)**, and
a second targeted sweep of 120 items at Max Number 100 (seeds 9000-9119). Zero console errors. The script
lives in the session scratchpad only.

| Id | Gr | distinct / 120 | answer types | print formats | items with `options` | largest number seen | hint contains the answer |
|---|---|---|---|---|---|---|---|
| `placevalue:more_less_10` | 1 | 57 | number 92, multi-select-check 28 | 2 | 28 | 109 | 88 |
| `placevalue:more_less_100` | 2 | 78 | number 92, multi-select-check 28 | 2 | 28 | 1,091 | 76 |
| `placevalue:place_value_disks` | 2 | 113 | number | 1 | 0 | 99,994 | 0 |
| `placevalue:pv_disks_build` | 2 | 95 | pv-build | 1 | 0 | 9,951 | 60 |
| `placevalue:pv_digit_drag` | 4 | 60 | pv-digit-drag | 1 | 0 | — | 0 (the number is in the prompt) |
| `placevalue:number_word_names` | 4 | 61 | choice | 1 | 120 | — | 120 |
| `placevalue:place_value_10x` | 5 | 86 | number 92, multi-select-check 28 | 2 | 28 | 973,000 | 20 |
| `placevalue:identify` | 2 | 90 | text | 1 | **120** | 9,951 | 120 |
| `placevalue:value` | 2 | 90 | number | 1 | 0 | 9,951 | — (the method is printed) |
| `placevalue:compare` | 2 | 91 | symbol | 1 | 120 (the three signs) | 1,303 **at Max Number 100** | 0 |
| `placevalue:expand` | 2 | 119 | interactive | 1 | 0 | 99,034 | 0 |
| `placevalue:combine` | 2 | 119 | number | 1 | 0 | 90,000 | 1 |
| `placevalue:order_least_to_greatest` | M | 120 | interactive | 1 | 0 | — | 0 |
| `placevalue:order_greatest_to_least` | M | 120 | interactive | 1 | 0 | — | 0 |
| `placevalue:mixed_placevalue` | M | 106 | **8** | **7** | 34 | 95,866 | 26 |
| `number_sense:rounding_visual` | 3 | 107 | number 82, number-line-extended **38** | 2 | 0 | 9,375 | 99 |
| `number_sense:nearest_10` | 3 | 72 | number 62, number-line 22, multi-select 36 | **3** | 36 | 990 | 84 |
| `number_sense:nearest_100` | 3 | 75 | as above | 3 | 36 | 1,000 | 80 |
| `number_sense:nearest_1000` | 3 | 58 | as above | 3 | 36 | 10,000 | — |
| `number_sense:nearest_10000` / `_100000` / `_million` | 4 / 5 / 5 | 58 each | as above | 3 | 36 | 10⁵ / 10⁶ / 10⁷ | — |
| `number_sense:round_sort_*` (8 ids) | 3-5 | **1** each | dnd-generic | 1 | 0 | — | the midpoint and the rule |
| `number_sense:estimate_sum` / `estimate_diff` | 3 | 98 / 98 | number 92, multi-select 28 | 2 | 28 | 999 | 78 / 92 |
| `number_sense:estimate_sums_diffs` | 3 | 99 | **4** (text, number, multiple-choice, multi-select) | 2 | 55 | 2,061 | 31 |
| `number_sense:estimate_products` | 4 | 99 | 4 | 2 | 63 | 5,276 | 25 |
| `number_sense:estimate_quotient` | 4 | 120 | number | 1 | 0 | — | 0 — **every item is "Round 63.11 to the nearest tenth"** |
| `number_sense:rounding_table` | 3 | 120 | number | 1 | 0 | 2,000 | 0 (the row's neighbours give it) |
| `number_sense:make_a_ten` / `doubles_near_doubles` / `compensation` | 1 / 1 / 2 | 42 / 40 / 61 | 3 / 2 / 2 | 2 | 78 / 34 / 34 | 10 / 20 / 100 | 42 / 62 / 80 |
| `number_sense:mixed_number_sense` | M | 57 | **5** | **11** | 20 | **7,000,000** | 27 |

What those numbers mean, in the order the next wave should care:

1. **Four ids give the answer away on the item** (Q-8, RP-1):
   `identify` prints the place-name strip under the numeral with the target place picked out; `value` prints
   *"The highlighted digit 5 is in the tens place 5 × 10 = ?"* on all 120 items, leaving a one-digit product;
   `nearest_*` print *"Shorter bar = Closer = Round to that number!"* with both distances labelled, or
   *"If ones digit is 0-4: round down"* beside the number; `rounding_visual` prints the lower end, the
   **midpoint** and the upper end and plots the number at its exact position, so "which end is it closer
   to?" is read off (99 of 120 hints also carry the answer). And `more_less_10` / `_100` draw a cross that
   prints **three of the four neighbours** (`60 69 70 ? 80`), so "1 more than 70" can be copied off the
   figure from the "10 more" arm's neighbour.
2. **The band does not bind, in either direction** (P-35, catalogue owner question 7). At Max Number 100:
   `identify`, `value` and `compare` **never** deal a two-digit number (smallest seen 104; `compare` reaches
   1,303), so the ladder's first steps are unreachable; `nearest_100` deals 121-994 and `nearest_1000`
   1,205-9,942; `more_less_100` collapses to *"What is 100 less than 100?"* three times in six items.
   At Max Number 1,000 `place_value_disks` reaches 99,994 in a grade 2 skill and `place_value_10x` 973,000.
3. **Eighteen ids silently mix response types** — every `nearest_*`, `more_less_*`, `place_value_10x`,
   `estimate_sum` / `_diff` / `_sums_diffs` / `_products`, `make_a_ten`, `doubles_near_doubles`, `compensation`
   and both mixed pools carry a 23-30% *"Click ALL …"*
   multi-select branch (a mouse verb in capitals on paper), and `rounding_visual` and every `nearest_*` carry
   a second ~20-30% *"Drag the marker to 444 on the number line"* branch, which is **placing**, not
   rounding. Only **57 of 120** `nearest_10` items are a rounding item at all. The page that results
   (baseline) is three sections under three headings for one skill.
4. **Two whole groups do not produce their skill.** The eight `round_sort_*` ids yield **1 distinct item in
   120**: the text is constant, the tiles live in an object the print path cannot draw, and the printed cell is
   six identical lines with nothing to sort (catalogue, confirmed). `estimate_quotient` is still missing from
   `skillCategoryOverride` (`generate-question.js` :365-372 routes the other six estimation ids) and so falls
   through `generateRoundingQuestion` to decimal rounding on 120 of 120 items.
5. **The disks fail the rubric on paper** (owner printout 2026-09-24, `ws-p4` … `ws-p7`). The hundreds disks
   print as **solid black circles whose "100" label is invisible** (H2); the tens disks print **blue** (H4);
   the "How many ones disks are in 920?" item draws the hundreds and tens *as numerals in circles* and the
   ones as a black disk — it is digit reading dressed as a disk item; and the build item (`pv_disks_build`,
   "Build the number 169 by drawing place value disks in each zone") gives three **dashed, coloured zones of
   about 40 × 22 mm** each carrying a rule and a "____ disks" blank, so **1 + 6 + 9 disks cannot be drawn**
   (H12, H9) and the dashed outline means *cut* (LS-3). `place_value_disks` can draw nine disks per place in
   up to seven places — 63 objects in one cell.
6. **Zero places are dropped from the accepted answer.** `expand` keys `990` as `900,90` (two boxes) and 38
   of 120 items at Max Number 1,000 contain a zero place; the screen gives one box per non-zero part, which
   tells the pupil how many parts there are, and paper gives one blank line (parity). `combine` never shows
   `300 + 0 + 5`, so 305 is never *built* from parts.
7. **Midpoints and the round-up-across-a-place case are rare accidents, not seeded content** (P-10). In 57
   true rounding items: `nearest_10` dealt 7 midpoints and 3 items that round up into the next place (95 →
   100); `nearest_100` dealt 2 and 3; `nearest_1000` 1 and 3.
8. **Colour and emoji.** `place_value_disks` 77 / 120 items carry non-ink colours; `number_word_names` 120 /
   120 (a seven-colour place chart); `combine` 59 / 120 (a coloured box per addend); `estimate_sum` /
   `estimate_diff` print the 📏 emoji on every item.
9. **What is already right, and should be built on.** `expand` and `combine` generate varied, correct
   content (119 distinct in 120); every rounding generator carries an "already rounded" guard so no item is
   trivial; `order_*` generate 120 distinct sets; `rounding_table` generates 120 distinct tables; the
   `pickVariant` LRU helper already exists (`variant-cycler.js`) and is the mechanism every option below
   should deal through.

### 1.4 Where the research and the standards disagree

Recorded, not followed.

| The sites do this | We do not, because |
|---|---|
| 20-40 rounding items on a sheet; "round to the underlined place" in rows of 30 | `WORKSHEET_DESIGN_STANDARD.md` §12.1: Independent 6, one-mark pages 8-16. A number-line rounding cell is a wide-visual row: 5 / 4 / 3 per page (§16) |
| Rounding "hills", roller coasters, seesaws (MW4K round up / down charts) | P-2 is ruled: rounding has **one** route, the number line and then place letters with a cut line; RD-02 (the arch) is retired in `PROBLEM_TYPES.md`. Art is functional only (P-18) |
| Match animals to rounded values (MW4K) | P-18; and a match item needs the RP-142 channel, so it is a hands-on page, not a practice cell |
| "Multiple response: select all that round to 400" as an ordinary item type | It is a real type, but it is a **different response** (circle-all). It becomes its own step (RN-10) with printed tiles and circles, never a 30% branch of a write-the-answer skill (ruling 2) |
| Place-value disks drawn in colour, one hue per place | Pages are black and white (INK-1). A disk is told from a counter by the **value printed inside it**, and one place from another by the **zone it sits in**, never by fill (§13.4) |
| Expanded form with the zero place simply omitted (300 + 5) | Allowed as an answer (P-LG-15), but never the only accepted form, and the framed step writes the zero (§2.4, Q3) |
| Mixed-place rounding pages (10s, 100s, 1,000s on one sheet) | P-28 / P-1: one place per section; "mixed" is a Review, as K5's own order puts it last |
| Estimation by "any reasonable number" | Our key is a facsimile and must be definite (AK-1). The **place to round to is printed**, and the key is the value for that place; any other place is accepted on screen only when the item says "about" without a place (§2.1, Q10) |
| Screen "drag the digit into the column" (`pv_digit_drag`) | P-29: the paper item is "write each digit in its column" and the screen item is typing into the same chart; drag is a second way, never the only way (RM-P-03) |

### 1.5 Answers to the catalogue's open research questions (4, 5, 6, 7, 9)

| Catalogue question | Answer found | Where it lands |
|---|---|---|
| **(4)** How is expanded form written when a place is zero — "400 + 5" or "400 + 0 + 5"? | Both appear. K5's "build a number from the parts" and "find the missing place value" print every place including an explicit zero part in the frame; math-drills' standard → expanded sheets omit zero parts. CCSS 2.NBT.A.3 does not rule. | §2.4 and Q3: the **framed** step prints one box per place and the key writes 0; the unframed fade step accepts both |
| **(5)** How do rounding pages fade from a labelled line to no line, and how is halfway presented? | MW4K sells "round using number line" as the first sheet (split by digit count), then "round up or round down" (place on the line, then say the direction), then the underlined-place rule sheets. Halfway is handled by the rule "5 or more rounds up" on the rule sheets. | RN-1 … RN-9: line with labelled ends → mark the number → decide → midpoint as its own `case` step → cut line → no support |
| **(6)** Do rounding-sort pages use adjacent bins only? | The public sorting material read uses the two tens (or hundreds) a set lies between — adjacent bins. | §9 RS: adjacent bins are the default; **non-adjacent** bins are a later option so the task cannot be done by reading the leading digit |
| **(7)** How do estimation pages state the place, and do they ask for both rounded and exact? | K5 and MW4K state the place in the instruction ("round to the nearest ten, then add"); "is it reasonable" pages ask for the exact answer and the estimate side by side. | §11 ES: the place is printed in the title constraint; the two-line rewrite (RD-07) asks for the rounded operands, then the estimate; the reasonable step shows both |
| **(9)** Standard distractors for word names at 6-7 digits? | Not answerable from public pages. The generator's own distractors (swap two digits, drop a place, change one digit) are reasonable in kind. | NW is P6's ladder; the distractor rule is written into §14 (M-V9, M-V10) and `number_word_names` is proposed as an alias (Q9) |

---

## 2. The generator contracts the rulings imply

### 2.1 What "within N" means in this family

P-35 bounds the **answer**. Here the answer is a place name, a digit, a value, a number built from parts, a
rounded value or an estimate, so the band is declared per skill shape:

| Skill shape | The band caps | Consequence |
|---|---|---|
| Name the place / value of a digit / expanded / standard / unit form / disks / blocks | **the number** | "to 99" means no number on the page exceeds 99; `identify` at band 100 must deal 2-digit numbers |
| 1 / 10 / 100 more and less | **both the given number and the answer** | "10 more, to 100" never shows 104; 100 less never drops below 0 |
| Compare / order | the larger number | as P6 §2.1 |
| Round to a place | **the number being rounded** (the place sets a floor on its digit count: a nearest-100 item is at least 3 digits) | The rounded value may be the next power of ten (96 → 100 at band 100; 950 → 1,000 at band 1,000). That is the edge case the step exists for, and the only place the answer may reach one step past the band. See Q2 |
| × / ÷ by 10, 100, 1,000 | the **larger** of operand and result | "× 10, to 1,000" never shows 4,500 |
| Estimate | the exact operands' band, as for the operation in P4 | The estimate itself may round past it (the same reading as rounding) |

**The place and the band are independent** (K5 rounds 4-digit numbers to the nearest 10 at grade 3, §1.1).
So `nearest_10` at band 1,000 deals 3-digit numbers, and `nearest_1000` at band 100 is **refused in the
dialog** (VA-R-07) with "Round to the nearest 1,000 needs Numbers to 10,000 or more." — never silently
relaxed, which is what `makeWhole` (`gen-algebraic.js`, `generateRoundingQuestion` :2639 ff.) does today.

### 2.2 Types are dealt, not rolled

Every `Math.random() < p` branch in this family becomes a tick-box option dealt round-robin through
`pickVariant(cyclerKey, [...])`. The branches that are real items get a home as an **option value**; the ones
that are a different skill get a **new id** (§19.4):

| Branch today | Where it goes |
|---|---|
| "Click ALL numbers that are 10 more than 57" (`more_less_*`) | dropped: 10 more is one number; there is nothing to select |
| "Click ALL the numbers that round to 50" (`nearest_*`) | `response: circle-all` on the same skill (RN-10), its own step, printed tiles |
| "Drag the marker to 444" (`rounding_visual`, `nearest_*`) | NEW `place_on_number_line` (catalogue's proposal, RN-2) |
| "Click ALL expressions equal to 3 × 10" (`place_value_10x`) | dropped (it is equivalence of expressions, not place value) |
| "Click ALL reasonable estimates" (`estimate_*`) | `task: closest` (ES-5) with three printed choices to circle |
| three visual styles for `nearest_*` (line, bars, box strip) | one: `support: line / cut-line / none` (§6); the bar style is retired |
| `rounding_visual` round type 10 / 100 / 1,000 per item | `place` option, one per section |
| `compare` difference types same / close / different | `closeness` option (P6 CP-9, CP-10) |
| `place_value_disks` count / how-many | `task` option (§5) |
| `place_value_10x` × / ÷, power, decimals | `op`, `power`, `decimals` options (§8) |
| `estimate_sums_diffs` / `_products` three types | `task` option (§11) |

### 2.3 Edge cases are content (P-10)

Each must be generable and must appear in any seeded set of 6 or more for the step that names it:

| Skill shape | Edge items | Why |
|---|---|---|
| Place / value | a **repeated digit** (747: which 7?), a **zero digit** (the value of 0 in 708 is 0), the leading digit, a teen (14) at the 2-digit band | M-V3, M-V5 |
| Expanded / standard | a zero in the ones (340), a zero in the tens (305), **two** zeros (500), a teen part (10 + 4), and **scrambled addends** (5 + 300 + 20) for `combine` | M-V6, M-V7 |
| Unit form | more than 9 ones or tens (`2 tens 15 ones`), the renamed hundred (`10 tens`) | PV-07, M-V8 |
| More / less | crossing a decade (**29 + 1**, **70 − 1**), crossing a hundred (**95 + 10**, **104 − 10**, **960 + 100** at band 1,000), and 0 as an answer (10 − 10) | M-L2, M-L3 |
| Round | **the midpoint** (45, 250, 3,500), **already a multiple** is excluded (guard kept), **rounds up across a place** (96 → 100, 951 → 1,000), a **zero in the deciding place** (305 to the nearest 100 → 300; 4,038 to the nearest 100 → 4,000), and **two numbers that round to the same ten** in a sort | M-R2, M-R4, M-R5 |
| Round on a line (`round_nl_*`) | the Round row above, **plus one number already on a multiple of the place per block of six** (6,000 to the nearest 1,000 stays 6,000; the dot sits on the left end tick). Owner ruling 2026-09-25, "yes please allow": a named exception to the already-rounded guard for these three skills only (ws-content-audit carries the same exception). The Say line reads "6,000 is already a multiple of 1,000, so it stays 6,000." | M-R1 (rounded it up to the next multiple) |
| × / ÷ 10 | a number ending in 0 (× 10 on 40), a zero in the middle (305 × 10), ÷ 10 on a number ending in 0 only (whole-number step) | M-Z1, M-Z2 |
| Disks / blocks | an **empty zone** (0 tens), **9** in a zone (the hardest drawing), 100 exactly | RP-32: an empty zone stays empty |

### 2.4 The zero place

Three rules, because the catalogue found the zero dropped from the key and the frame (§1.3 item 6):

1. **The framed expanded-form cell prints one box per place of the section's widest number**, so the box
   count never tells the pupil how many non-zero parts there are (TY-26's rule, read across). The zero part is
   written `0`; the key writes `300 + 0 + 5`.
2. **The unframed step** (a ruled line, EF-7) accepts `300 + 5`, `300 + 0 + 5` and any order (P-LG-15). The key
   writes `300 + 5` with `300 + 0 + 5` in the teacher footer as "also accepted".
3. **The "zero holds a place" contrast line** (`PEDAGOGY_STANDARD.md` §10.4) is the Vocabulary / Rule band of
   every zero-place step: *Remember: the zero holds a place. Do NOT leave it out.*

### 2.5 The option schema per skill (against `SKILL_CELL_CONTRACT` §3.6)

Every option below is **honoured by the generator** once the step it serves is built; an option is not
declared before its generator reads it (SCC-P11). Defaults are the stand-alone values (ruling 3). `level`
(Support level 3 / 2 / 1 / 0, `levelOption`) is universal and is not repeated per row.

| Skill | Option (type) | Values | Stand-alone default | Serves |
|---|---|---|---|---|
| `identify` | `band` (enum) | 99, 999, 9,999, 99,999, 999,999 | 999 | PN-1, PN-4, PN-9 |
| | `places` (set) | ones, tens, hundreds, thousands, … (which place is asked) | all ticked | PN-2 |
| | `response` (enum) | circle the place word (3 printed) / write from a bank | circle | PN-1 → PN-3 |
| | `repeatDigit` (bool) | on / off | off | PN-5 |
| `value` | `band` | as `identify` | 999 | PN-6 … PN-9 |
| | `form` (enum) | value (700) / "7 hundreds" (unit) / 7 × 100 (expanded notation) | value | PN-8 |
| | `zeroDigit` (bool) | may ask the value of a 0 | off | PN-7 |
| `expand` | `band` | 99, 999, 9,999, 99,999, 999,999 | 999 | EF-1 … EF-9 |
| | `zeroPlace` (enum) | none / some / always | none | EF-4 |
| | `frame` (enum) | boxes, one per place / ruled line | boxes | EF-7 (fade) |
| | `notation` (enum) | sum of values / expanded notation (7 × 100 + …) | sum | EF-8 |
| `combine` | `band` | as `expand` | 999 | EF-2, EF-5 |
| | `zeroPlace` | none / some / always | none | EF-5 |
| | `order` (enum) | largest first / scrambled | largest first | EF-6 |
| NEW `unit_form` | `band`; `rename` (enum) standard / more than 9 of one place | standard | EF-9, EF-10 |
| `place_value_disks` | `band` | 99, 999, 9,999 | 999 | PD-1 … PD-4 |
| | `task` (enum) | read the mat / count one place's disks | read the mat | PD-1, PD-2 |
| | `zeroPlace` | none / some | none | PD-3 |
| `pv_disks_build` | `band` | 99, 999 (9,999 refused: §13.4) | 999 | PD-5, PD-6 |
| | `zeroPlace` | none / some | none | PD-6 |
| `pv_digit_drag` | `band` | 999 … 999,999 | 99,999 | PN-9 |
| | `source` (enum) | word form / expanded form / numeral with commas | expanded form | PN-9 (the numeral source is transcription and is not offered by default) |
| `more_less_10` | `step` (enum) | 1, 10 | 1 | ML-1 … ML-4 |
| | `dir` (enum) | more / less / both in two frames | more | ML-1, ML-2 |
| | `band` | 20, 50, 100, 120 | 100 | ML-5 |
| | `unknown` (enum) | the result / the start ("__ is 10 more than 47") | result | ML-7 |
| | `support` (enum) | row strip / 120-chart fragment / none | row strip | ML-6 (fade) |
| `more_less_100` | `step` (enum) | 10, 100 | 100 | ML-8 … ML-10 |
| | `dir`, `unknown`, `support` | as above | as above | |
| | `band` | 1,000 (the only value; 2.NBT.B.8 is 100-900) | 1,000 | |
| `place_value_10x` | `op` (enum) | × / ÷ | × | TX-1, TX-3 |
| | `power` (set) | 10, 100, 1,000 | [10] | TX-2, TX-4 |
| | `band` | 1,000, 10,000, 100,000, 1,000,000 | 10,000 | |
| | `decimals` (bool) | whole numbers only / decimals (Level 5) | off | TX-6 |
| | `support` (enum) | shift chart / none | shift chart | TX-5 (fade) |
| `compare` | `band` | 10, 20, 99, 999, 9,999, 999,999 | 999 | P6 CP-8 … CP-13 |
| | `lengths` (enum) | equal / mixed | equal | CP-12 |
| | `closeness` (enum) | far / close (same leading digit, "tight") | far | CP-10 |
| | `responseScope` | full / notation (underline the deciding place) / judge | full | CP-11, CP-14 |
| `order_*` | `band`; `count` (enum 3, 4, 5, 6); `lengths`; `closeness` | as `compare`; count 3 | P6 OR-1 … OR-8 |
| `rounding_visual` | `place` (enum) | 10, 100, 1,000 | 10 | RN-1 … RN-5 |
| | `band` | 100, 1,000, 10,000 | 100 | |
| | `line` (enum) | ends labelled + dot plotted / ends labelled, pupil marks / ends labelled only | ends + pupil marks | RN-3, RN-4 |
| | `midpoint` (enum) | never / seeded / only | seeded | RN-6 |
| `nearest_10` … `nearest_million` (6) | `band` | the place's floor up to 10,000,000 (§2.1) | the smallest band that hosts the place (100 for tens, 1,000 for hundreds …) | RN-7 … RN-13 |
| | `support` (enum) | number line / cut line (letters over the digits, target letter bold) / none | cut line | RN-7, RN-9, RN-11 |
| | `midpoint` | never / seeded / only | seeded | RN-6, RN-8 |
| | `response` (enum) | write the rounded number / circle all that round to N | write | RN-10 |
| | `responseScope` | full / notation (underline the place, circle the deciding digit) / decision (up or down) / judge | full | RN-7a, RN-7b, RN-14 |
| `round_sort_*` (8) | `bins` (enum) | adjacent / one apart (non-adjacent) / three bins | adjacent | RS-1 … RS-3 |
| | `tiles` (enum) | 6 / 8 | 6 | |
| | `midpoint` | never / seeded | seeded | |
| | `response` (enum) | write in the bin's column / cut and glue | write | RS-1; hands-on page |
| `rounding_table` | `places` (set) | 10, 100, 1,000, 10,000 | [10, 100] | RT-1, RT-2 |
| | `blank` (enum) | a whole column / a whole row | a whole column | RT-1 |
| `estimate_sum`, `estimate_diff` | `place` (enum) | 10, 100, 1,000 | 10 | ES-1, ES-2 |
| | `band` | as the operation's (P4 §2.1) | 100 | |
| | `support` (enum) | two-line rewrite / none | two-line rewrite | ES-3 (fade) |
| `estimate_sums_diffs` | `op` (enum) | + / − / mixed | + | ES-4 |
| | `task` (enum) | round then compute / closest of three / is it reasonable | round then compute | ES-4 … ES-6 |
| | `place` | 10, 100 | 10 | |
| `estimate_products` | `task` as above; `place` (enum) round the larger factor to its leading place / round both | larger only | ES-7, ES-8 |
| `estimate_quotient` | `task` as above | round then compute | ES-9 |
| `mixed_placevalue`, `mixed_number_sense` | `members` (set) | the pool's member ids | every non-retired member of **this** category's ladder skills | Review |

**The pool rule.** `mixed_number_sense` must not draw `make_a_ten`, `doubles_near_doubles` or `compensation`
(P4's strategy ladders) onto a rounding review, nor any member at a band past its own. Its label becomes
**"Mixed Rounding & Estimation"** (the P6 spec already flagged the collision with `mixed_composing`'s
"Mixed Number Sense").

### 2.6 Response scopes this family uses

| Scope | Cell holds | Absent | Instruction key | Steps |
|---|---|---|---|---|
| `notation` | the numeral with place letters above it | the answer slot | NEW `underline-place` "Underline the {place} digit. Circle the digit after it." (9 words) | RN-7a |
| `decision` | the numeral, the cut line, the rule box | the answer slot | `rule-yes-no`-shaped: NEW `round-up-down` "Check one box: Round up or Round down." | RN-7b, TX-3a |
| `judge` | a finished item in **black** | — | `check-fix` | PN-10, EF-11, RN-14, ES-10 |
| `answer-only` | the numeral and the slot | the working | the skill's own | tests |

---

## 3. How to read a ladder, and where this family's edges are

### 3.1 Reading a step

Exactly as P4 §3 and P6 §3: *One change* is the P-1 delta; structural scaffolds are in the ladder header;
hints fade in the H1 → H5 order and are named in the Cell column; the Response column follows P-13; the
misconceptions are in §14 by id; density is in §16.

### 3.2 Boundaries

- **Building numbers with blocks to 999, renaming a ten, word form** are P6 (BT and NW ladders; ids
  `base10_build`, `base10_regroup`, `base10_build_hundreds`, `tens_foundation_visual`, `number_word_form`).
  This family starts where BT-4 ("write the tens and the ones, no blocks") ends and **reuses its mat**.
- **Comparing and ordering numbers** are specified step by step in P6 §8 (CP-8 … CP-16) and §9 (OR-1 …
  OR-10), but their generators (`placevalue:compare`, `order_*`) are **in this family and are fixed in this
  wave**. This document adds the options they need (§2.5), their cells (§13.9) and their audit rules (§17),
  and does not restate the steps.
- **Rounding decimals** (`decimals:round_decimals`, `round_thousandths`) and the decimal half of
  `place_value_10x` are 5.NBT.A.3-4 and belong to the fractions / decimals wave; the cut-line cell (§13.6) is
  built once here and reused there with a separator track.
- **`make_a_ten`, `doubles_near_doubles`, `compensation`** sit in `number_sense` but are addition strategies:
  P4's optional ladders (make ten = bridging ten §7; doubles; compensation). They are **OUT** of P9 except
  that their multi-select branches are removed with everyone else's (§19.2).

---

## 4. The order of the ladders, and why

| # | Ladder | Levels | Why here |
|---|---|---|---|
| 1 | **PN** place and value of a digit (§5) | 1-4 | Every other ladder reads a digit's place. Two of its ids print the answer on every item |
| 2 | **EF** expanded, standard and unit form (§6) | 2-4 | The best-generated ids in the family; the fix is the zero place and the frame |
| 3 | **PD** place-value disks (§7) | 2-4 | The owner's printout failure (H2, H4, H12). The bridge from blocks to abstract place value above 999, where blocks stop (RP-32, P-RV-18) |
| 4 | **ML** 1, 10, 100 more and less (§8) | 1-2 | Needs PN. The cross leaks the answer today |
| 5 | CP / OR (P6 §8, §9) | 1-4 | Generators fixed here; steps are P6's |
| 6 | **TX** × and ÷ by 10, 100, 1,000 (§9) | 4-5 | Needs PN at 4+ digits |
| 7 | **RN** rounding (§10) | 3-4 | Needs PN, ML, CP. The biggest ladder and the one with the most live defects |
| 8 | **RS / RT** rounding sort and rounding table (§11) | 3-4 | Rounding's two application formats; RS does not print at all today |
| 9 | **ES** estimation (§12) | 3-4 | Needs RN and the P4 operations. `estimate_quotient` generates the wrong skill |

L-11's own three-digit ladder (bridging read → expanded → zeros → compare → round to 10 → round to 100 →
review) is the spine of PN-EF-CP-RN at the 3-digit band; this document expands each of its rungs into steps.

---

## 5. PN — the place and the value of a digit

**Strategy:** read the place letters over the digits; the letter names the place, and the place says what the
digit is worth. **Pre-skill check:** P6 BT-4 (write the tens and the ones); read numerals to 999; say the
place words ones, tens, hundreds.

**Structural, every level:** the numeral set in **0.95 em tracks under a heads row of bold place letters**
(VA-30: `H T O`, then `Th H T O` with the comma track). The target digit is **underlined** (P-26: underline =
the part to work), never boxed in fill (today's orange fill prints as a black box, catalogue).
**Hints H1 → H5:** H1 base-10 quick-draw beside the numeral (bridging step only); H2 the full place words once
under the letters; H4 the target place's letter bold; H5 the first answer traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| PN-1 | bridging | Name the place of a digit (to 99) | start | Numeral 2 digits, letters `T O`, quick-draw rods and dots beside it in the same row (P-8). Three place words printed in the cell: **ones tens hundreds** | circle one word | "The __ is in the __ place." |
| PN-2 | fade | Name the place with no blocks | scaffold (H1 goes) | As PN-1, no drawing | circle one word | same |
| PN-3 | range | Name the place (to 999) | the band | `H T O`; every place asked, dealt in turn | circle one word | same |
| PN-4 | format | Write the place from a bank | format (response) | The bank moves to a rounded box above the section (RM-22); a line of B(8 letters) per cell | a word copied from the bank | same |
| PN-5 | case | Numbers with a repeated digit | the hard case | 747, 330: **which** 7 is underlined decides (M-V3) | circle one word | "This __ is in the __ place." |
| PN-6 | concept | Write the value of a digit | representation | Same numeral; the slot is now a line of B(n) after "is worth" — frame `The 4 is worth ____.` | one number | "The __ is worth __." |
| PN-7 | case | The value of a zero | the edge case | The underlined digit is 0 on about a third of items (value 0); rule box: *A zero is worth nothing, but it holds the place.* | one number | "The zero is worth 0." |
| PN-8 | format | Write the value three ways | format | `value.form` dealt one per section: `700` / `7 hundreds` / `7 × 100` (4.NBT, "expanded notation", K5) | one number, or two numbers in a frame | "7 hundreds is 700." |
| PN-9 | range | Place and value to 999,999 | the band | `Th` and the comma track; words once in the Model (VA-31) | one number | same |
| PN-10 | judge | Check the place | responseScope `judge` | A numeral with a place or value already written in **black**, about half wrong (M-V1, M-V2, M-V4) | check box + fix | "The __ is in the __ place, so it is worth __." |
| PN-11 | test | Test A / B: place and value | — | 16 items (one-mark) or 12 | | |

`pv_digit_drag` serves PN-9 as a **chart-fill** item (§13.3) with `source: expanded form` or `word form`, so
the pupil must work out which column each digit goes in rather than copy a comma-grouped numeral left to right
(its catalogue defect).

**Misconceptions:** M-V1 (PN-1), M-V2 (PN-6), M-V3 (PN-5), M-V4 (PN-9), M-V5 (PN-7).

---

## 6. EF — expanded, standard and unit form

**Strategy:** a number is the sum of what each digit is worth. **Pre-skill check:** PN-6; add a multiple of
ten and a one-digit number (40 + 7); add hundreds, tens and ones without regrouping.

**Structural:** the **frame** `n = [ ] + [ ] + [ ]` with **one box per place of the section's widest
number** (§2.4) — boxes B(n) × (Hw + 2), SL-3 (a blank inside an expression is a box). From EF-9 the unit-form
frame `[ ] hundreds [ ] tens [ ] ones`.
**Hints:** H1 the H T O chart with the digits above the frame (EF-1 only); H2 captions "hundreds", "tens",
"ones" under the boxes; H4 the digit being worked underlined; H5 the first box traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| EF-1 | bridging | Write a number as tens plus ones | start | 2-digit; chart above the frame (P-8). `expand` band 99 | two numbers | "__ is __ plus __." |
| EF-2 | unknown | Write the number from its parts | the direction | `combine`: `40 + 7 = [ ]` | one number | "__ plus __ is __." |
| EF-3 | range | Expanded form to 999 | the band | Three boxes | three numbers | "__ is __ plus __ plus __." |
| EF-4 | case | Numbers with a zero place | the edge case | `zeroPlace: always`: 305, 340, 500. The zero box is written `0`. `Remember:` line (§2.4) | three numbers | "There are no tens, so the tens part is 0." |
| EF-5 | case | Build a number that has a zero place | the direction | `combine` `zeroPlace: always`: `300 + 5 = [ ]` (the pupil must supply the 0 digit — M-V7) | one number | "Three hundreds, no tens, five ones is __." |
| EF-6 | case | Put the parts in order first | the hard case | `combine` `order: scrambled`: `5 + 300 + 20` | one number | "The hundreds go first." |
| EF-7 | fade | Write expanded form with no boxes | scaffold (the frame) | A ruled line B(15) after `305 =`; `300 + 5` and `300 + 0 + 5` both accepted | the expression | unchanged |
| EF-8 | format | Write expanded notation | format | `expand.notation: expanded notation`: `3 × 100 + 4 × 10 + 5 × 1`, digit boxes in a printed frame | three digits | "3 hundreds is 3 times 100." |
| EF-9 | representation | Write a number in unit form | representation | NEW `unit_form`: `476 = [ ] hundreds [ ] tens [ ] ones` | three numbers | "__ hundreds, __ tens, __ ones." |
| EF-10 | case | Unit form with more than 9 of one place | the hard case | `unit_form` `rename`: `476 = 4 hundreds [ ] tens 6 ones` (answer 7) → `476 = [ ] tens 6 ones` (47) → `3 hundreds 15 tens = [ ]` | one number | "15 tens is 1 hundred and 5 tens." |
| EF-11 | judge | Check the expanded form | responseScope `judge` | Finished expansions in black, about half wrong from M-V6 / M-V7 / M-V8 | check box + fix | "__ should be __." |
| EF-12 | range | Expanded form to 999,999 | the band | Comma track; six boxes | six numbers | unchanged |
| EF-13 | test | Test A / B | — | 12 items; each direction its own section | | |

EF-10 is PV-07 / GAP-4-01 ("unit form and non-standard decomposition") and is the concept rung P4's
regrouping ladders borrow ("45 is 3 tens 15 ones"); P6 BT-10 / BT-11 teach it with drawn blocks, EF-10 without.
The place-value number bond (PV-08, GAP-4-06) is **not** a separate step: it is `expand`'s
`representation: bond` for the H1 hint on EF-3 and is declared only if the owner wants it (Q12).

**Misconceptions:** M-V6 (EF-3), M-V7 (EF-4 / EF-5 — the reason both directions get a zero step), M-V8 (EF-10),
M-V2 carried.

---

## 7. PD — place-value disks

**Why disks at all.** Blocks stop at 999 (P-RV-18: block pictures are dropped above four digits; RP-30's
thousand cube is the last block). A disk is a counter with its value printed inside, so it scales to any
place and it prepares the ten-for-one trade of the regrouping ladders. **The disk's value is its label, not
its colour or size** (§13.4). Pre-skill check: PN-3; count by 10s and 100s; P6 BT-8 (ten ones make one ten).

**Structural:** the **disk mat** — one square-cornered zone per place, left to right largest first, place
letter above each zone (RP-40, RP-32). An empty zone stays empty.
**Hints:** H2 the full place words above the zones; H3 a count-by strip under the zone being counted
(100, 200, 300 …); H5 the first disk traced (build steps) or the first digit traced (read steps).

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| PD-1 | concept | Read a number from disks (to 99) | start | Mat `T O`, disks drawn, ≤ 9 per zone. `place_value_disks` `task: read`, band 99 | one number | "__ tens and __ ones is __." |
| PD-2 | range | Read a number from disks (to 999) | the band | Mat `H T O` | one number | "__ hundreds, __ tens, __ ones is __." |
| PD-3 | case | Read a mat with an empty zone | the edge case | `zeroPlace: some` (608, 350) | one number | "There are no tens, so I write 0." |
| PD-4 | notate | Count one place's disks | responseScope `notation` | `task: count one place`: the **mat is drawn** and the pupil writes how many disks are in the named zone. Today's version prints the number and shows the other places as numerals — digit reading — and is retired | one number | "There are __ tens disks." |
| PD-5 | procedure | Draw disks to show a number (to 99) | unknown (the set is not given) | `pv_disks_build` band 99: the numeral above an **empty** mat sized to 9 + 9 disks (§13.4). `draw-disks` instruction | drawn disks | "I drew __ tens and __ ones." |
| PD-6 | range | Draw disks to show a number (to 999) | the band | Mat `H T O` sized to 9 + 9 + 9; **one item per row** (§16) | drawn disks | same |
| PD-7 | case | Show a number with a zero place | the edge case | 405, 360: the empty zone is left empty; nothing is drawn in it | drawn disks | "No tens, so the tens zone is empty." |
| PD-8 | concept | Trade ten disks for one | representation | Ten 10-disks drawn in the T zone; ring them; write one 100-disk in the H zone. Rule box: *Ten 10s make one 100.* | a ring + one drawn disk | "Ten tens make one hundred." |
| PD-9 | range | Read disks to 9,999 | the band | Mat `Th H T O`; **read only** (building above 999 is refused, §13.4) | one number | unchanged |
| PD-10 | judge | Check the disks | responseScope `judge` | A drawn mat with a number written in black, about half wrong (M-V11, M-V12) | check box + fix | "That is __ hundreds, so it is __." |
| PD-11 | test | Test A / B: disks | — | 6 read items (2 × 3), build items print at 3 per page | | |

**Misconceptions:** M-V11 (PD-1 — added the disk counts), M-V12 (PD-2 — read a disk as one), M-V13 (PD-5 —
drew the digit's value as that many ones disks), M-V7 carried (PD-3 / PD-7).

---

## 8. ML — 1, 10 and 100 more and less

**Strategy:** only one digit changes — the digit in the place you add to — unless it crosses 9 or 0.
**Pre-skill check:** PN-3; count on and back by 1 and by 10 from any number (P6 SQ-5, SQ-11).

**Structural:** the **frame** `10 more than 47 is ____.` (RM-27; a line of B(n)); the **given number** printed
at working size in a square-cornered box. **No cross.** The catalogue's cross prints three neighbours and so
leaks the fourth (§1.3 item 1); P-1 also forbids four sub-skills in one item.
**Hints:** H1 a **row strip** of the 120 chart (ML-1 … ML-4: the row holding the number, with the number's cell
bold-outlined and **every other cell blank**) or, for 10 more, the **column fragment** (three cells stacked:
blank, the number, blank); H4 the digit that changes underlined; H5 the first answer traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| ML-1 | concept | Find 1 more | start | `more_less_10` `step 1, dir more`, band 100, row strip | one number | "1 more than __ is __." |
| ML-2 | unknown | Find 1 less | the direction | `dir less` | one number | "1 less than __ is __." |
| ML-3 | representation | Find 10 more | the step (and the strip becomes a column fragment) | `step 10` | one number | "10 more than __ is __." |
| ML-4 | unknown | Find 10 less | the direction | | one number | "10 less than __ is __." |
| ML-5 | case | Cross a ten or a hundred | the hard case | Every item on a boundary: 29 + 1, 70 − 1, 95 + 10, 104 − 10 (band 120) | one number | "The tens change too." |
| ML-6 | fade | 1 and 10 more and less with no strip | scaffold | Strip gone. The two directions of one step in two sections of the page (`dir: both`) | one number | unchanged |
| ML-7 | unknown | Find the start | the unknown | `unknown: start`: `____ is 10 more than 47` → answer 57; `47 is 10 more than ____` → 37 (PV-13 inverse frames, GAP-4-07) | one number | "__ is 10 more than __." |
| ML-8 | range | Find 100 more and 100 less | the step | `more_less_100` `step 100`, band 1,000 (2.NBT.B.8: 100-900) | one number | "100 more than __ is __." |
| ML-9 | range | 10 more and less to 1,000 | the band | `more_less_100` `step 10` | one number | same |
| ML-10 | case | Cross a hundred | the hard case | 395 + 10, 405 − 10, 960 + 100 is refused at band 1,000 → 950 + 100 = 1,050 is not dealt; 905 − 100 | one number | "The hundreds change too." |
| ML-11 | format | Fill a more-and-less table | format | A 3-column table: `10 less | number | 10 more`, 4 rows, the middle column given (PV-13 grid form) | 8 numbers | "__ , __ , __." |
| ML-12 | test | Test A / B | — | 16 items | | |

At 1,000 more / less (4.NBT) the same frame is `more_less_100` with a `step 1000` value appended to the enum
at Level 4 (append-only, SCC-P12) — no new id.

**Misconceptions:** M-L1 (ML-1 → ML-3: added 1 for "10 more"), M-L2 (ML-5), M-L3 (ML-10), M-L4 (ML-7).

---

## 9. TX — times and divided by 10, 100 and 1,000

**Strategy:** each digit moves one place to the left for × 10 and one place to the right for ÷ 10; the
empty place is filled with a zero. "Add a zero" is **not** taught (it fails for decimals — M-Z3).
**Pre-skill check:** PN-9; EF-8.

**Structural:** the **shift chart** (PV-15, RL-06 with shift arrows): two rows of the place chart, the number
in the top row, the answer row empty, a solid arrow across the top labelled `× 10`.
**Hints:** H1 the dotted arrows from each digit to its new column (Model only); H2 the caption "one place";
H5 the first digit traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| TX-1 | concept | Multiply by 10 on a place chart | start | `op ×`, `power [10]`, band 10,000 | digits in the chart | "Each digit moves one place to the left." |
| TX-2 | range | Multiply by 100 and 1,000 | the power (one per section) | | digits | "__ times 100 is __." |
| TX-3 | unknown | Divide by 10 | the operation | Whole numbers ending in 0 only (no decimals yet) | digits | "Each digit moves one place to the right." |
| TX-3a | decide | Which way do the digits move? | responseScope `decision` | Boxes **Left** / **Right**; no answer. Rule box | one check | "Times makes it bigger, so they move left." |
| TX-4 | range | Divide by 100 and 1,000 | the power | | digits | same |
| TX-5 | fade | × and ÷ by powers of ten with no chart | scaffold | Equation drill: `45 × 100 = ____` | one number | unchanged |
| TX-6 | range | × and ÷ 10 with decimals (Level 5) | the band (decimals) | `decimals: on`; hands over to the decimals wave (§3.2) | one number | unchanged |
| TX-7 | test | Test A / B | — | 16 items | | |

**Misconceptions:** M-Z1 (TX-3 — dropped a middle zero), M-Z2 (TX-2 — wrong number of places), M-Z3 (TX-6),
M-Z4 (TX-3a — the direction).

---

## 10. RN — rounding

**Strategy (P-2, ruled):** the **number line**, then **place letters with a cut line** after the target
place. Find the two tens (hundreds …) the number lies between; decide which it is nearer; halfway rounds up.
**Pre-skill check:** ML-3 / ML-8 (the next ten, the next hundred); PN-3; mark a number on a line (RN-2 serves
as its own pre-skill for RN-3).

**Structural:** from RN-1 to RN-6 the **rounding line** (RL-13): axis 1.5 pt, 11 tall ticks, **only the two
end values labelled** below the line, the number to round printed above the cell at working size. From RN-7 the
**rounding strip** (RL-07 variant, RD-03): place letters over the digits in 0.95 em tracks and a **1.5 pt cut
line after the target place** (RP-41: the target letter bold, "nothing marks which way to round").
**Hints H1 → H5:** H2 the **midpoint label** (printed only while the step declares it — RN-3, RN-4 at level
2 and above; never at level 1, which is where today's `rounding_visual` leaks it); H3 the pre-plotted dot; H4
the target letter bold (this one is structural from RN-7 by RP-41 and does not fade); H5 the first answer
traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| RN-1 | concept | Find the two tens a number is between | start | NEW `between_tens`: the number, frame `____ and ____`. Band 100. No rounding yet | two numbers | "__ is between __ and __." |
| RN-2 | procedure | Mark a number on a line | representation | NEW `place_on_number_line`: rounding line with the ends labelled; the pupil marks the number's tick. `line-mark` | a mark | "__ is here." |
| RN-3 | concept | Round to the nearest 10 on a number line | the task | `rounding_visual` `place 10`, `line: ends labelled + dot plotted` (H3), midpoint labelled (H2). `round` | one number | "__ is between __ and __. It is closer to __." |
| RN-4 | fade | Round on a line, marking the number yourself | scaffold (H3 goes) | `line: ends labelled, pupil marks` | a mark + one number | same |
| RN-5 | range | Round to the nearest 100 on a number line | the place | `place 100`, band 1,000 | a mark + one number | same |
| RN-6 | case | Round a number exactly halfway | the edge case | `midpoint: only` (45, 250). Rule box: *Halfway rounds up.* `Remember: halfway rounds up, NOT down.` | one number | "__ is halfway, so it rounds up to __." |
| RN-7 | representation | Round to the nearest 10 with a cut line | representation | `nearest_10` `support: cut line`. The line leaves (P-8's bridging in reverse: RN-7's Model shows the line beside the strip once) | one number | "The digit after the cut is __, so I round __." |
| RN-7a | notate | Find the place and the digit that decides | responseScope `notation` | Strip without an answer slot: underline the target digit, circle the next digit. "Do _not_ round." | two marks | "I look at the __ digit." |
| RN-7b | decide | Round up or round down? | responseScope `decision` | Strip + boxes **Round up** / **Round down**; no answer slot | one check | "It is __, so I round __." |
| RN-8 | case | Round when the number rounds up to the next hundred | the hard case | 96, 97, 951, 998; and a **zero in the deciding place** (305 to the nearest 100) | one number | "9 tens and 1 more ten is 100." |
| RN-9 | range | Round to the nearest 100 with a cut line | the place | `nearest_100`, band 1,000 | one number | same |
| RN-10 | format | Circle every number that rounds to 400 | format (response) | `response: circle-all`: eight printed number tiles, three to five correct, **near misses at 349 / 350 / 449 / 450**. Rule box. `default-circle-all` | circles | "__ rounds to __, so I circle it." |
| RN-11 | fade | Round with no cut line | scaffold | `support: none`; the place letters stay (structural) until RN-13 | one number | unchanged |
| RN-12 | range | Round to the nearest 1,000, 10,000, 100,000 (one per step) | the place | `nearest_1000` … `nearest_100000`; commas | one number | same |
| RN-13 | range | Round to any place (Level 4) | the place (named by an underline) | `nearest_*` with the target digit underlined instead of named — "round to the underlined place" (MW4K) | one number | same |
| RN-14 | judge | Check the rounding | responseScope `judge` | Finished roundings in black, about half wrong from M-R1 … M-R5 | check box + fix | "__ rounds to __, not __." |
| RN-15 | test | Test A / B | — | 16 items; each place its own section | | |

**Misconceptions:** M-R1 (RN-3 — rounded to the nearer *printed* tick, not the nearer ten), M-R2 (RN-6),
M-R3 (RN-7 — changed only the deciding digit), M-R4 (RN-8), M-R5 (RN-9 — rounded the wrong place),
M-R6 (RN-11 — rounded in a chain).

---

## 11. RS and RT — rounding sort and rounding table

### RS — sort numbers by what they round to

A decision-rich format that the catalogue found blank on paper. **On paper it is a write-in** (the pupil
writes each number in the column of the ten it rounds to) so it needs no scissors; the cut-and-glue form is
the hands-on page role (RM-15), the same content.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| RS-1 | format | Sort numbers by the ten they round to | start (after RN-9) | `round_sort_10` `bins: adjacent`, 6 tiles, midpoint seeded. A rounded **number bank** above two labelled bin columns | 6 numbers written | "__ rounds to __, so it goes here." |
| RS-2 | case | Sort into bins that are not next to each other | the hard case | `bins: one apart` (40 and 60): tiles 35-64, so 51-54 belong to neither → a third column **Neither** | 6-8 numbers | "__ rounds to __, not __ or __." |
| RS-3 | range | Sort by the hundred, the thousand … | the place | `round_sort_100`, `_1000` … one per step | numbers | same |

### RT — the rounding table

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| RT-1 | format | Round one number to two places | start | `rounding_table` `places [10, 100]`, **a whole column blank** (never one cell of a row — the neighbours give it, catalogue) | numbers | "To the nearest __, __ is __." |
| RT-2 | range | Round one number to three places | the columns | `[10, 100, 1000]` (MW4K "tabular column") | numbers | same |

**Misconceptions:** M-R6 (RT-2 — chained rounding from the previous column: 1,449 → 1,450 → 1,500),
M-R7 (RS-1 — sorted by the leading digit).

---

## 12. ES — estimation

**Strategy:** round each number to the **printed** place, then compute. **Pre-skill check:** RN-9; P4's
column addition and subtraction at the band.

**Structural:** the **two-line rewrite** (RD-07): the exact problem on the top line, a second line under it
with one box under each operand and a sign printed, then `≈ ____`.
**Hints:** H2 the caption "round to the nearest 10"; H4 the arrows from each number to its box (Model only);
H5 the first rounded number traced. **The 📏 emoji and the "Step 1 / Step 2" box leave the practice item.**

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| ES-1 | procedure | Estimate a sum by rounding to the nearest 10 | start | `estimate_sum` `place 10`, two-line rewrite | two rounded numbers + the estimate | "About __ plus about __ is about __." |
| ES-2 | unknown | Estimate a difference | the operation | `estimate_diff` | three numbers | "About __ minus about __ is about __." |
| ES-3 | fade | Estimate with no rewrite line | scaffold | `support: none` | one number | unchanged |
| ES-4 | range | Estimate by rounding to the nearest 100 | the place | | numbers | unchanged |
| ES-5 | format | Choose the closest estimate | format | `estimate_sums_diffs` `task: closest`: three printed estimates, circle one; distractors from M-G1 / M-G2 | one circle | "It is closest to __." |
| ES-6 | judge | Is the answer reasonable? | responseScope `judge` | An exact answer in black; boxes **Reasonable** / **Not reasonable**; **about half genuinely reasonable** (catalogue owner question 9) | one check | "My estimate is __, so __ is / is not reasonable." |
| ES-7 | range | Estimate a product | the operation | `estimate_products`, the larger factor rounded to its leading place | numbers | "About __ times __ is about __." |
| ES-8 | case | Estimate a product rounding both factors | the hard case | 2-digit × 2-digit | numbers | same |
| ES-9 | range | Estimate a quotient with a nearby number that divides | the operation | `estimate_quotient` (routing fixed first) | numbers | "About __ divided by __ is about __." |
| ES-10 | test | Test A / B | — | 12 items | | |

**Misconceptions:** M-G1 (ES-1 — computed first, then rounded), M-G2 (ES-1 — rounded one number only),
M-G3 (ES-2 — subtracted in the wrong order after rounding), M-G4 (ES-7 — dropped a zero from the product).

---

## 13. Cells: geometry, screen twin, answer key

### 13.0 How the sizes are derived

Hw = 6 / 8 / 10 mm, working digits 16 / 22 / 28 pt (1 em 5.64 / 7.76 / 9.88 mm), zone labels 9 / 10 / 12 pt,
cell pad 3 mm, answer zone Hw + 4 = 10 / 12 / 14, B(n) from §6.1 of the design standard, body grid gridH 228 /
228 / 227 mm × 186 mm. **Every drawing zone is sized to the hardest item its section can deal** (ruling 9):
the section's band and options fix the maximum (a band-999 build section can deal 999 → 9 + 9 + 9), and the
zone is sized for that maximum on every item, so zone size also never leaks the answer (RP-1, L-LEAK).

### 13.1 Place / value cell (`pv-chart`, PN-*)

| Part | S / M / L |
|---|---|
| Heads row (bold letters, cap rule under) | 4 / 5 / 6 mm |
| Numeral in 0.95 em tracks | 5.4 / 7.4 / 9.4 mm per track; underline 0.75 pt under the target digit only |
| Place-word choices (PN-1 … PN-3) | three words at cell-text size, 8 mm apart, ring area Hw + 4 tall (RM-07 geometry) |
| Value frame (PN-6 …) | "is worth" at cell text + line B(n) |
| Cell | 2 × 3 grid (93 × 76 mm) at every size; one-mark pages use 2 × 4 (12 items) at S / M |

**Screen twin:** the same cell; the three words are tap-to-ring (legal because the paper item is a circle,
RM-P-01); the value is a numeric input on the line. **Key:** the ring drawn at 1.5 pt round the right word,
or the value in Andika 700 on the line.

### 13.2 Expanded / unit form cell (EF-*)

`476 = [ ] + [ ] + [ ]`: the numeral at working size, then one box per place of the section's widest
number, each B(n) × (Hw + 2) with `+` in a 1 em slot. At 3 places and L: 25 + 3 × 25 + 2 × 9.9 ≈ 120 mm
→ **1 column at L, 2 at S and M** (at M: 22 + 3 × 20 + 2 × 7.8 ≈ 98 mm, fits a 93 mm cell only with the
numeral above the frame, so the frame drops under the numeral at M). Six-place sections are 1 column at
every size. Unit form: `[ ] hundreds [ ] tens [ ] ones`, boxes B(2), words at cell text, same row-count rule.
**Screen:** one input per box, left to right. **Key:** every box filled including `0`; footer line "also
accepted: 300 + 5" on EF-7.

### 13.3 Chart-fill cell (`pv_digit_drag`, PN-9, TX-*)

Place-value chart RP-40: columns 14 / 14 / 17 mm, rows 8 / 10 / 12 mm minimum, **digits at working size need
the L row at 12 mm** — so the chart takes rows of 12 / 12 / 14 mm and columns 14 / 14 / 17; the comma
pre-printed on the thousands boundary. Six columns at L = 102 mm + source line → **1 column, 5 / 4 / 3 per
page** (wide-visual rows). The source ("four hundred thousand, two hundred six" or "400,000 + 200 + 6") is
printed above at cell-text size. **Screen:** one-digit input per chart cell, left to right. **Key:** the digits
in the cells, zeros included (an empty cell is a wrong answer here, unlike a disk zone).

### 13.4 Disk cells (PD-*) — the owner's printout, fixed

**The disk.** A circle, 0.75 pt outline, **no fill**, the value printed inside in Andika 700 at zone-label
size (9 / 10 / 12 pt). The diameter must hold "100" and must be ≥ 8 mm (rubric H12 example): **8 / 9 / 10 mm**
(9 pt "100" is ≈ 4.6 mm wide; 12 pt ≈ 6.2 mm). A "1,000" disk is 10 / 11 / 12 mm. Pupil-drawn disks may be a
circle with the value written in it or, by RP-31's quick-draw logic, the Model key shows a circle with the
digit value (`100`, `10`, `1`).

**The zone** (one per place): holds **9 disks in a 3 × 3 grid at pitch d + 2 mm**, plus 2 mm pad: 
S (d 8): 3 × 10 + 2 = **32 × 32 mm**; M (d 9): 3 × 11 + 2 = **35 × 35 mm**; L (d 10): 3 × 12 + 2 = **38 × 38 mm**.
Zones share their borders (0.75 pt, square corners, **solid** — never dashed, LS-3), with a place letter
above each (heads row 4 / 5 / 6). No blank, no caption, no rule inside a zone: the drawing is the answer.

| Cell | S | M | L | Layout |
|---|---|---|---|---|
| Read / build to 99 (T O) | 64 × 32 | 70 × 35 | 76 × 38 | 2 columns (93 mm cells); cell h = label 6 + target 7 / 9 / 11 + heads 4 / 5 / 6 + zone + [answer zone 10 / 12 / 14 for read] + 3 ≈ 62 / 68 / 74 → **6 / 6 / 6 per page (2 × 3)** |
| Read / build to 999 (H T O) | 96 × 32 | 105 × 35 | 114 × 38 | **1 column** (does not fit 93 mm at any size); cell h as above → 3 rows at L (227 / 74), 3 at S and M → **3 per page** (4 at S when reading only, h 62) |
| Read to 9,999 (Th H T O) | 128 × 32 | 140 × 35 | 152 × 38 (thousands zone 3 × 14 + 2 = 44 wide → 158) | 1 column, 3 per page; **building above 999 is refused** — nine 1,000 disks plus 27 others is a poster, not a cell (§1.4, Q5) |

The owner's printout item ("Build 169") needed 1 + 6 + 9 = 16 disks at ≥ 8 mm; the zones it had were about
40 × 22 mm **with a rule and a blank inside**, i.e. room for two rows of three 8 mm disks at best. The table
above gives 9 per zone at every size.

**Screen twin:** tap a zone to add a disk, tap a disk to remove it (RM-19); read items type into the answer
line. **Key:** build — the disks drawn in each zone at 1.5 pt, count = digit, in the 3 × 3 order; read — the
number on the line. `count one place` (PD-4) — the number on the line, the mat unchanged.

### 13.5 More / less cell (ML-*)

The given number in a square box (Hw + 6 tall, B(n) + 4 wide) and the frame on one line at L:
`10 more than [47] is ________.` ≈ 22 (words) + 29 + 10 + 25 = 86 mm → **2 columns at every size**, 6 per page;
ML-6 / ML-11 one-mark style 2 × 4 at S. The H1 strip (row fragment of 10 cells at 12 mm) sits under the frame
at Model / Guided / first cell, making the cell 93 × 76 at L. ML-11's table: 3 columns of 25 mm × 4 rows of
14 mm. **Screen:** one numeric input on the line. **Key:** the number on the line.

### 13.6 Rounding strip (RN-7 … RN-13, RD-03)

Heads row with the letters, the target letter bold, the numeral in 0.95 em tracks, a **1.5 pt vertical cut line**
spanning heads + digit rows after the target track, then `→ ________` (B(n) for the rounded value). At 4 digits
and L: 4 × 9.4 + comma 3 + 10 + 33 ≈ 84 mm → **2 columns, 6 per page** at every size (2 × 3); one-mark
pages (RN-7a, RN-7b) 2 × 4. **Screen:** input on the line; for RN-7a, tap a digit to underline, tap again to
circle (RM-11). **Key:** the rounded value; RN-7a the underline and ring drawn at 1.5 pt.

### 13.7 Rounding line (RN-2 … RN-6)

Line length 120 / 140 / 160 mm (RP-50 minimum), **11 tall ticks at pitch 12 / 14 / 16 mm**, so every tick is
a place a pupil can mark (RP-51 ≥ 6 / 7 / 8). End labels only (zone-label size, working digit size when the
line is the problem). The number to round printed top-left at working size; answer line B(n) at the right end
of the answer zone. Cell height at L: label 6 + number 11 + 8 mark room + ticks 5 + labels 6 + gap 2 +
answer zone 14 + 3 ≈ 55 mm → **1 column, 4 / 4 / 3 per page** (wide-visual rows ceiling 5 / 4 / 3).
**Screen:** tap a tick to drop the dot (RM-23), then type. **Key:** the dot drawn at 2.5 mm on the right tick
**and** the rounded value on the line.

### 13.8 Rounding sort and table (RS, RT)

**Sort** — full width: a rounded bank box (Hw + 4 tall) holding 6-8 numbers at working size 12 mm apart, then a
two- or three-column table (heads at zone-label size: `rounds to 40`, `rounds to 50`, `neither`), each column
**4 write rows of Hw + 4** (14 mm at L) at B(n) width. Height at L: 6 + 14 + 3 + 8 + 4 × 14 + 3 = 90 mm →
**2 per page at L, 3 at S** (Test: 4 items over two pages). **Screen:** tap a number, then a column (RM-15
tap-tap); the tile greys when placed. **Key:** every number written in its column; the bank unchanged.
**Table** — RD-04 / chart-and-table page: columns 40 (number) + 30 per place, rows 14; one table of 6 rows per
item, 3 per page; blanks are empty cells (PT-CHT-1). **Key:** the column filled.

### 13.9 Compare and order (CP, OR — P6 steps)

Equation-drill cells (PT-EQD): two numerals at working size with the RM-05 circle between them (Hw + 2
diameter); with `responseScope: notation` the two numerals stack in a 2-row grid aligned by place with letters
above (RL-07 stacked compare grid) and the pupil underlines the first differing place. Order: the number cards
row and the ordered boxes row per P6 §9 (4 at L). **Screen / key** as P6 §13 and §17.

### 13.10 Estimation rewrite (ES-*)

Two lines: `67 + 43` at working size; under it `[ ] + [ ] ≈ ________` with boxes B(n) aligned under the
operands. 2 columns at S / M, 1 at L for 3-digit operands (≈ 110 mm); 6 / 6 / 4 per page. **Key:** the rounded
operands in the boxes and the estimate on the line (the place is printed in the title, so the key is definite).

### 13.11 Judge cells (PN-10, EF-11, PD-10, RN-14, ES-6)

The step's own cell in state `answered`, black (P-TH-4), plus the `check-fix` row and a fix slot of the cell's
answer shape (PT-ERR): error-analysis ceiling 6 / 4 / 4; the disk judge inherits the disk cell's 1 column
(3 per page at 999).

---

## 14. The misconception bank

Built for `wrongAnswer(q)`, so every entry has a computable rule. **[evidenced]** = named in the standards'
starter list (`PEDAGOGY_STANDARD.md` §12) or in P4 / P6's evidenced entries; **[house]** = asserted from the
step design. Shared ids (M-K*, M-P4 … M-P6, M-O*, M-W*, M-X1) are P6's and are not redefined.

| Id | Mechanism | Wrong-answer rule | First bites | Evidence |
|---|---|---|---|---|
| M-V1 | Counted places from the **left** | place = the name at position *i* from the left (8 in 817 → "ones") | PN-1 | [house]; catalogue defect note |
| **M-V2** | Gave the **digit** for the value | value = the digit (7 for 700) | PN-6 | [evidenced] the standards' place-value starter entries; the most common value error |
| M-V3 | With a repeated digit, named the place of the **other** copy | place of the first occurrence | PN-5 | [house] |
| M-V4 | Named the place, not the value (answered "hundreds" for "value") | value = the place word's power (100 for 700) | PN-9 | [house] |
| M-V5 | Said a zero has no place, or its value is the place (0 in 708 → 10) | value = 10ᵖ | PN-7 | [house] |
| M-V6 | Wrote the **digits** as the parts | 476 = 4 + 7 + 6 | EF-3 | [house]; catalogue |
| **M-V7** | Wrote the parts side by side / dropped the zero place | "three hundred five" → 3005 (standard form from parts); 305 → 35 | EF-4, EF-5 | [evidenced] "writes expanded parts side by side: three hundred five → 3005" is in the standards' starter list |
| M-V8 | Treated more than 9 of one place as impossible, or added the digits | 3 hundreds 15 tens → 315 | EF-10 | [house]; the sibling of M-K5 |
| M-V9 / M-V10 | (word names, 6-7 digits) swapped two adjacent digits / dropped a place | as named | NW (P6) | [house]; the generator's current distractors, kept |
| M-V11 | Added the disk **counts** | 3 hundreds disks + 4 tens disks → 7 | PD-1 | [house]; catalogue |
| M-V12 | Read each disk as one | 8 hundreds disks → 8 | PD-2 | [house]; the M-K2 mechanism on disks |
| M-V13 | Drew the value as ones disks | 40 → forty 1-disks | PD-5 | [house]; a drawn error, caught on PD-10 |
| M-L1 | "10 more" read as "1 more" (or the ones digit changed) | n ± 1 when ± 10 is asked | ML-3 | [house]; catalogue |
| M-L2 | Crossed the decade by changing only one digit | 29 + 1 → 20; 70 − 1 → 79 | ML-5 | [house]; the M-Q3 mechanism |
| M-L3 | Crossed a hundred wrongly with 10 more | 395 + 10 → 305 (or 3,105) | ML-10 | [house]; catalogue ("crosses 900 → 1000 wrongly") |
| M-L4 | Inverse frame: applied the operation named, not its inverse | `__ is 10 more than 47` answered 37 | ML-7 | [house] |
| M-Z1 | Dropped an inner zero when shifting | 305 × 10 → 350 | TX-1 | [house] |
| M-Z2 | Shifted the wrong number of places | 45 × 100 → 450 | TX-2 | [house] |
| M-Z3 | "Add a zero" on a decimal | 3.4 × 10 → 3.40 | TX-6 | [evidenced] catalogue and every decimal curriculum; the reason the strategy is the shift |
| M-Z4 | Moved the digits the wrong way | 450 ÷ 10 → 4,500 | TX-3a | [house] |
| M-R1 | Rounded to the nearer **printed** number (a tick), not the nearer ten | answer = the nearest labelled tick | RN-3 | [house]; catalogue |
| **M-R2** | Halfway rounded **down** | 45 → 40 | RN-6 | [evidenced] the standards' starter list ("always rounds down") |
| M-R3 | Changed only the deciding digit | 67 → 68 / 67 → 60 | RN-7 | [house] |
| M-R4 | At a 9, did not carry into the next place | 96 → 90 or 910; 951 → 900 | RN-8 | [house] |
| **M-R5** | Rounded to the wrong place | 348 → 400 (to tens) | RN-9 | [evidenced] the starter list gives this exact example |
| M-R6 | Rounded in a chain | 1,449 → 1,450 → 1,500 | RT-2, RN-11 | [evidenced] a standard named error in rounding pedagogy; [house] for this pupil group |
| M-R7 | Sorted by the leading digit | 35 put in the 30 bin | RS-1 | [house]; the reason `bins: one apart` exists |
| M-G1 | Computed exactly, then rounded | round(a + b) | ES-1 | [house]; catalogue |
| M-G2 | Rounded one number only | round(a) + b | ES-1 | [house] |
| M-G3 | Rounded then subtracted in the wrong order | round(b) − round(a) | ES-2 | [house] |
| M-G4 | Dropped a zero from a product of rounded numbers | 40 × 300 → 1,200 | ES-7 | [house] |

M-X1 (copied a number from the item) stays a teaching signal, not a distractor.

---

## 15. What each page role takes from these steps

| Page role | Takes | Must not |
|---|---|---|
| Error analysis | the step's cell in black with a `wrongAnswer` from §14, about half wrong | show a disk / block judge without the drawing (the drawing is what is judged) |
| True or False? | "305 = 300 + 50", "96 rounds to 100 (nearest 10)", "The 7 in 472 is worth 7" — true uses the key, false §14 | exceed 2 blanks in the evidence frame |
| Reason It | Spot the mistake from M-V7 / M-R2 / M-R4; Always / Sometimes / Never: "Rounding makes a number smaller." (sometimes) | named characters |
| Decision (sub-skill) | RN-7b, TX-3a, ES-6's reasonable check | an answer slot |
| Hands-on | RS as cut-and-glue; layered strips (PV-18, GAP-4-11, later family) | dashed lines anywhere but the cut |
| Today's Number | PN, EF, ML, CP, RN at the day's number (`opts.value`), PT-TDN bands at 120 / 1,000 / 10,000 | a band whose cell does not fit 39.1 mm: the H T O **disk build** (38 mm zone + heads) is read-only there |
| Test A / B | answer-only cells at level 0, structure kept by option | build items at more than 3 per page |

---

## 16. Density check

| Cell | Steps | Ceiling (S / M / L) | Teaching cap | Verdict |
|---|---|---|---|---|
| Place / value, circle a word | PN-1 … PN-5 | one-mark 16 / 16 / 16 | 12 | Fits (2 × 4 at L: cell 93 × 56, numeral + words ≈ 36 mm) |
| Value line | PN-6 … PN-9 | equation drill 36 / 30 / 14-21 | 6 | Fits |
| Expanded frame, 3 places | EF-1 … EF-7 | 2 columns S / M, 1 at L | 6 | **Fits at S / M; at L 1 column × 6 rows of ≥ 36 mm = 6** — declared, not discovered |
| Expanded frame, 6 places | EF-12 | 1 column | 6 | Fits (6 rows of 37 mm) |
| Chart fill | PN-9, TX-1 … TX-4 | wide rows 5 / 4 / 3 | 4 | **Declare 3 at L** |
| Disks to 99 | PD-1, PD-5 | 2 × 3 | 6 | Fits |
| Disks to 999 | PD-2 … PD-8 | 1 column | 6 | **Does not fit 6.** Declare **4 / 3 / 3** (read) and **3 / 3 / 3** (build). Offered as "Build with disks (to 999): 3 per page" in the dialog; a 6-item Independent paginates to 2 pages (PG-20) |
| Disks to 9,999 | PD-9 | 1 column | 3 | Read only; build refused |
| More / less frame | ML-* | 2 × 3; one-mark 2 × 4 | 6-8 | Fits |
| Rounding line | RN-2 … RN-6 | wide rows 5 / 4 / 3 | 4 | **Declare 4 / 4 / 3** |
| Rounding strip | RN-7 … RN-13 | 2 × 3; one-mark 2 × 4 | 6-8 | Fits |
| Circle-all tiles | RN-10 | decision 12 / 8 / 6-8 | 6 | Fits (2 × 3, 8 tiles in 2 rows of 4 at 16 mm pitch) |
| Rounding sort | RS-* | 1 per row | 2-3 | **Declare 3 / 2 / 2**; a test side holds 2 |
| Rounding table | RT-* | chart page | 3 | Fits |
| Estimation rewrite | ES-* | 2 × 3 / 1 column at L for 3-digit | 6 / 6 / 4 | **Declare 4 at L** |
| Judge cells | all judges | 6 / 4 / 4 | 6 | Fits; the disk judge inherits 3 per page |

Four places the content does not fit six items and the step declares it: **disks to 999**, **rounding line**,
**rounding sort**, **3-digit estimation at L**.

---

## 17. The content-audit rules this family needs

`tests/scripts/ws-content-audit.cjs` covers `operations` and `k2` (`K2_CATS` :60 = counting, comparing,
composing, counting_mixed). P9 adds a third family, **`pv`** = `placevalue` + `number_sense` (minus the three
P4 strategy ids, which join `operations`). Every rule is zero-tolerance at the audit's deterministic seeds
and fingerprints the drawn item, not `q.text` (P6 §1.3's lesson: the round sorts' constant text must not read
as "1 distinct" once their tiles print — and must, today, because they do not).

| Class | Rule | Would fail today |
|---|---|---|
| `pv-band` | every number printed (text, visual, options) ≤ the section band; ≥ the place floor for rounding; **2-digit items exist at band 99** | `identify`, `value`, `compare` (never 2-digit, 1,303 at 100); `nearest_100` / `_1000` at 100; disks at 99,994 |
| `pv-place-name` | the name's place word is the place asked: "Round to Nearest 100" → answer is a multiple of 100 and \|ans − n\| ≤ 50 with ties up; "Nearest 1,000,000" never rounds to another place | `estimate_quotient` (rounds to tenths) |
| `pv-recompute` | independent recomputation: place of the underlined digit; digit × 10ᵖ; Σ parts = number; n ± step; n × 10ᵏ; the rounded value; an estimate = op(round(a), round(b)) at the printed place | none today (content is correct), which is why it gates regressions |
| `pv-expanded-shape` | each expanded part is one digit × a power of ten, one part per place in the framed step (zeros included), and the key contains the zero part | `expand` (drops zero parts from the key) |
| `answer-matches-picture` | disks / blocks drawn per zone = the digit of `q.ans` in that place (read items); the rounding line's end labels are the two multiples the number lies between; the sort's tiles each round to their keyed bin | today's disk reads pass; sort unprintable |
| `answer-in-item` | the answer, or its method, is not in `printText`, visual text, `aria-label` or the hint (Q-8): no midpoint label at level ≤ 1, no "Shorter bar = Closer", no "is in the tens place / 5 × 10 =", no place strip marking the answer, no neighbour of a more/less item printed | `identify`, `value`, `nearest_*`, `rounding_visual`, `more_less_*` |
| `one-response` | one `answerType` and one `printFormat` per non-mixed section (P-28); no `multi-select-check` unless `response: circle-all` was asked | 18 ids |
| `banned-verb` | no pupil string begins with or contains click / drag / tap / select / tick, or words in capitals | every `nearest_*`, `order_*`, `more_less_*`, `pv_digit_drag`, `pv_disks_build` |
| `prints-something` | every item has a printable cell: a sort has its tiles and bins; a build has an empty mat | `round_sort_*` |
| `midpoint-seeded` | with `midpoint: seeded`, every seeded set of 6 has ≥ 1 midpoint and ≥ 1 round-up-across-a-place item | all rounding ids (7 / 57 and 3 / 57 by accident) |
| `reasonable-balance` | `task: reasonable` keys 40-60% Reasonable | `estimate_sums_diffs`, `estimate_products` (0% today) |
| `disk-fits` | for a build section, 9 disks per zone at the size's diameter fit the declared zone; building above 999 is refused | `pv_disks_build` (owner printout) |
| `ink` (lint, not audit) | no fill but ink / paper / the grey in any disk or chart | `place_value_disks`, `number_word_names`, `combine`, `estimate_sum` 📏 |

---

## 18. Share-code impacts

- **No id is renamed, moved or removed.** Labels change (§19.2) — a label is not stored in a code.
- **Appended ids** (their own positions at the end of `placevalue` / `number_sense`; the snapshot count rises
  from 591 by exactly this many): `unit_form` (placevalue), `between_tens`, `place_on_number_line`
  (number_sense). **Three.** Every other step is an option on an existing id. (Judge pages are
  `responseScope: judge` on the parent — the recommendation P6 Q7 made and this document follows.)
- **Aliases** (tombstone not needed — the source ids stay live):
  - `placevalue:number_word_names` → `composing:number_word_form` `{ wordTask: 'match', band: 999999 }` —
    catalogue owner question 5, **only if** Q9 is answered yes; until then both ids generate.
  - No `nearest_*` or `round_sort_*` merge: each id *is* its place constant, like a fact set; merging them into
    one `place` option would save nothing and cost six labels teachers already search by (Q4).
- **Option letters** (SCC-X13): the new option keys of §2.5 each take a permanent key letter when declared;
  values carry permanent codes. `response` values `circle-all` on `nearest_*`, `task` values on estimation, and
  `step 1000` on `more_less_100` are **appended** to their lists later without renumbering.
- **The routing fix** (`'estimate_quotient': 'estimation'` in `skillCategoryOverride`) changes what a stored
  code generates, not the code: every saved `estimate_quotient` link starts producing quotient estimates. That
  is a correction, and the dialog needs no note.
- **Positional codes** (7-character, `MX-`, compact) cannot carry options (SCC-X11): a link to "RN-6: round
  exactly halfway" must be an enhanced code. Worth a line in the release note for teachers.

---

## 19. The gap table

Verdicts as P6: OPT, FIX, REDO, SPLIT, MERGE, NEW, OUT.

### 19.1 Step → skill today

| Step | Skill | Verdict | Note |
|---|---|---|---|
| PN-1 … PN-5 | `identify` | FIX | Remove the place strip (the answer); underline, not fill; `band` 99 reachable; `options` become three **printed** words (then circle on both media — parity legal) |
| PN-6 … PN-9 | `value` | FIX | Remove "is in the tens place / 5 × 10 = ?"; 2-digit reachable; `form`, `zeroDigit` |
| PN-9 | `pv_digit_drag` | FIX | `source` not the comma-grouped numeral; chart-fill cell; no "Drag" |
| PN-10 | `identify` / `value` | OPT | `responseScope: judge` |
| EF-1 … EF-8, EF-11, EF-12 | `expand` | FIX + OPT | Zero parts in the frame and the key; box count per place; `frame`, `notation`; paper boxes = screen boxes |
| EF-2, EF-5, EF-6 | `combine` | FIX + OPT | `zeroPlace`, `order`; drop the coloured boxes and the numeric options |
| EF-9, EF-10 | — | **NEW** `unit_form` | PV-07, GAP-4-01 |
| PD-1 … PD-4, PD-9 | `place_value_disks` | SPLIT (by option) + FIX | `task`; outline disks with printed values; cap places by `band`, not range; retire the "numerals in circles" how-many form |
| PD-5 … PD-7 | `pv_disks_build` | REDO (print) | Empty solid mat sized per §13.4; hint stops giving the decomposition; no "Drag"; 7-digit targets refused |
| PD-8 | `pv_disks_build` | OPT | `task: trade` (a later value) — or leave to P6 BT-8 with disks as `representation`; Q5 |
| ML-1 … ML-7, ML-11 | `more_less_10` | FIX + SPLIT | No cross; frame + strip; `step`, `dir`, `unknown`, `support`; delete the duplicated retry branch; clamp the centre at small bands |
| ML-8 … ML-10 | `more_less_100` | FIX | As above; the "100 less than 100" collapse |
| CP-8 … CP-14 | `compare` | FIX + OPT | P6 §18: 2-digit and mixed lengths reachable; `closeness`; black numerals |
| OR-1 … OR-9 | `order_*` | FIX + OPT | P6 §18: `count` fixed per section; `band`; "Write the numbers in order. Start with the least." |
| TX-1 … TX-6 | `place_value_10x` | SPLIT (options) + FIX | `op`, `power`, `decimals` dealt, not rolled; dead code at the old :3420-3432; operand bounded; rule out of the hint |
| RN-1 | — | **NEW** `between_tens` | catalogue RD-1 |
| RN-2 | — | **NEW** `place_on_number_line` | the 30% branch of `rounding_visual` / `nearest_*`, made a skill |
| RN-3 … RN-6 | `rounding_visual` | FIX + OPT | `place`, `line`, `midpoint`; midpoint label only as a hint; no exact-position dot at level ≤ 1; B&W line |
| RN-7 … RN-13 | `nearest_10` … `nearest_million` | FIX + OPT | One visual (the cut-line strip); remove the bar and box styles and both gates; `band` binds (§2.1); `support`, `midpoint`, `response`, `responseScope` |
| RN-14 | `nearest_*` | OPT | `responseScope: judge` |
| RS-1 … RS-3 | `round_sort_*` (8) | REDO (print) + OPT | Tiles and bins printed; `bins`, `tiles`, `midpoint`; hint without the rule; all eight share `_genRoundSort` and are fixed at once |
| RT-1, RT-2 | `rounding_table` | FIX | A whole column blank; `places` fixed per section; black grid |
| ES-1 … ES-4 | `estimate_sum`, `estimate_diff` | FIX | Emoji and Step box out; `place` per section; the multi-select branch out; forced-apart operands in `estimate_diff` relaxed |
| ES-5, ES-6 | `estimate_sums_diffs` | SPLIT (options) + FIX | `task`; genuinely reasonable items |
| ES-7, ES-8 | `estimate_products` | SPLIT + FIX | same; `roundTo` bounded |
| ES-9 | `estimate_quotient` | **REDO** | Routing first (`generate-question.js` :365-372), then the same options |
| — | `mixed_placevalue`, `mixed_number_sense` | FIX | Declared member pools; the three P4 strategy ids out of `mixed_number_sense`; relabel "Mixed Rounding & Estimation" |
| — | `make_a_ten`, `doubles_near_doubles`, `compensation` | OUT (P4) | Only their multi-select gates are removed in P9 |

### 19.2 Names that do not match what the skill does (fix the name)

| Skill | Label today | Correct label |
|---|---|---|
| `more_less_10` | "1 More / 1 Less / 10 More / 10 Less (Visual)" | "1 More, 1 Less, 10 More, 10 Less" (the step is chosen by option; "(Visual)" goes) |
| `place_value_disks` | "Place Value Disks (Visual)" | "Read Place-Value Disks" |
| `pv_disks_build` | "Build a Number with PV Disks" | "Draw Place-Value Disks for a Number" |
| `pv_digit_drag` | "Write Digits in a Place Value Table (5-6 digit)" | "Write the Digits in a Place-Value Chart" (the band names the digits) |
| `number_word_names` | "Match Number to Word Name (Multiple Choice)" | "Choose the Word Name" |
| `place_value_10x` | "10× and ÷10 Relationships (Visual)" | "Multiply and Divide by 10, 100, 1,000" |
| `rounding_visual` | "Rounding on Number Line (Visual)" | "Round on a Number Line" |
| `rounding_table` | "Rounding Table (10, 100, 1000)" | "Rounding Table" (the places are an option; the name's "1000" must not promise a column the section lacks) |
| `estimate_quotient` | "Estimate Quotients" | unchanged — the **content** is fixed to match it |
| `mixed_number_sense` | "Mixed Number Sense" | "Mixed Rounding & Estimation" |

### 19.3 GAP-4 rows placed

GAP-4-01 → EF-9 / EF-10 (`unit_form`); GAP-4-02 number dictation → **not placed** (a screen / oral item, P6's
SB-1 reasoning applies; Q11); GAP-4-03 → PN-9 `source`; GAP-4-04 → CP-11 / P6; GAP-4-05 circle the blocks →
P6 BT; GAP-4-06 → EF-3 hint, Q12; GAP-4-07 → ML-7; GAP-4-08 number format (cross out the zero, put in the
comma) → **not placed** (P3, a separate `number_format` skill if wanted); GAP-4-09 → RN-7 … RN-13 and RN-1;
GAP-4-10 → RN-3 / RN-4; GAP-4-11 layered strips → hands-on family.

### 19.4 What to build first

1. **Extend the gate** (§17) to the `pv` family, so every later step is measured. It will be red on ~30 ids.
2. **`estimate_quotient` routing** (one line) and the **round-sort print cell** — two ids groups that do not
   produce their skill at all.
3. **Remove every `Math.random()` gate** in `generateRoundingQuestion`, `generatePlaceValueQuestion` and
   `generateEstimationQuestion`, homing the real items as options (§2.2).
4. **Answer-in-item** on `identify`, `value`, `nearest_*`, `rounding_visual`, `more_less_*`.
5. **`band` binds** on every id (§2.1), including the refusal path.
6. **The disk cell** (§13.4) — the owner's printout — and the empty-mat build.
7. **The zero place** in `expand` / `combine` (§2.4).
8. Options and cells step by step, in ladder order (§4).

---

## 20. Questions for the owner

**Owner rulings, 2026-09-24 — all seven blocking questions answered with the recommendation:**

| # | Ruling |
|---|---|
| 1 | Estimation is in P9, built last. |
| 2 | Max Number caps the number being rounded; a place too big for it is not offered. |
| 3 | Disks: read to 9,999, draw to 999. |
| 4 | Zero places: a framed step writes 300 + 0 + 5; a free line accepts both 300 + 5 and 300 + 0 + 5. |
| 5 | The `nearest_*` and `round_sort_*` ids stay separate skills. |
| 6 | Halfway rounds up, taught as its own step. |
| 7 | "Circle every number that rounds to N" is one step. |

The six shaping questions below remain open and are asked when their step is built.


Seven that block the next wave, then six that shape it. Each has a recommendation.

### The seven that block

**Q1 — Does P9 include estimation?** The five `estimate_*` ids sit in `number_sense` and depend on rounding,
but estimation is operations applied to rounding, and `estimate_quotient` needs P4's division.
*Recommendation:* **yes, but last** (ES after RN, RS, RT): the ids are in this category, two of them are
broken in ways only this wave touches (the routing, the never-reasonable key), and leaving them makes
`mixed_number_sense` unfixable. The three P4 strategy ids (`make_a_ten`, `doubles_near_doubles`,
`compensation`) stay OUT.

**Q2 — Rounding and the band.** A number rounded to its place can land one power of ten past the band
(96 → 100 at band 100). Catalogue owner question 7 asked whether Max Number bounds rounding at all.
*Recommendation:* **the band caps the number being rounded; the place sets its floor; Max Number caps the band;
a place the band cannot host is refused in the dialog** (nearest 1,000 at band 100). The rounded value may
equal the next power of ten, because 95 → 100 is exactly the case RN-8 teaches. This is the K5 reading
(4-digit numbers rounded to the nearest 10 at grade 3), and it makes every `nearest_*` label true.

**Q3 — Expanded form with a zero place.** Catalogue research question 4. The sites do both.
*Recommendation:* **the framed step prints one box per place and the key writes the 0 (300 + 0 + 5); the
unframed step accepts 300 + 5 and 300 + 0 + 5 and any order** (§2.4). The fixed box count stops the frame
leaking how many non-zero parts there are; accepting both on the free line follows P-LG-15.

**Q4 — Keep six `nearest_*` and eight `round_sort_*` ids, or merge each group into one skill with a `place`
option?** *Recommendation:* **keep them.** Each id is its place, the way "Add 6" is a fact set; they already
share one generator, so there is no code to save; teachers find them by name; and a merge would create 12
aliases for no teaching gain. `rounding_visual` does take a `place` option, because it is one skill across
three places today.

**Q5 — Place-value disks: how far, and do they carry the trade?** Blocks stop at 999; disks are the only
concrete model above it, but a nine-thousands build does not fit a cell.
*Recommendation:* **read disks to 9,999; draw disks to 999 only, 3 per page, one per row; disk diameter
8 / 9 / 10 mm with the value printed inside, no fill; the ten-for-one trade on disks (PD-8) is one step here,
and the full regrouping concept stays with blocks in P6 BT.** If you would rather disks start only at Level 3
(above 999), PD-1 … PD-7 collapse into P6's block steps and PD becomes a four-step ladder.

**Q6 — The rounding tie.** The site rule is "5 or more rounds up". CCSS does not state a tie rule.
*Recommendation:* **halfway rounds up, taught as a rule box and its own step (RN-6), with the
`Remember: … NOT down.` line.** No banker's rounding, ever, on a pupil page.

**Q7 — Is "circle every number that rounds to 400" a step, or out?** Today it is a random 30% of every
`nearest_*` page (catalogue owner question 2 ruled the random gates out). MW4K sells it as "multiple
response".
*Recommendation:* **keep it as one step (RN-10), `response: circle-all`, printed tiles with near misses,
circled on paper and tapped on screen.** It is the best discrimination item in rounding and costs one option.

### The six that shape

**Q8 — "Reasonable?" items** (catalogue owner question 9). *Recommendation:* **generate a genuinely
reasonable answer 40-60% of the time; the gate enforces it (§17); until the fix lands, withhold
`task: reasonable` from tests.**

**Q9 — `number_word_names` → `number_word_form`** (catalogue owner question 5). *Recommendation:* **merge as an
alias** with `wordTask: match`, band 999,999, once P6's NW ladder has built its match-from-a-bank response;
keep the id and its code. Word-form marking (catalogue question 6) follows P6 Q6: normalise case, hyphens,
commas and "and" before comparing.

**Q10 — Estimation keys.** A pupil who rounds to another place has a different, defensible estimate.
*Recommendation:* **the place is printed in the title constraint ("I Can Estimate Sums (round to the nearest
10)"), so the key is definite; the screen also accepts the estimate at any one coarser place and says so in
the feedback.** The paper key stays one number (AK-1).

**Q11 — Number dictation (GAP-4-02).** It prints as "the teacher reads, the pupil writes".
*Recommendation:* **not in P9.** It is an oral item (RM-30) like P6's SB-1, better as an Opener warm-up band
than a skill id. Revisit with Today's Number.

**Q12 — The place-value number bond (PV-08, GAP-4-06).** *Recommendation:* **only as EF-3's H1 hint**
(`expand` `representation: bond`), not a step: it is the same content as the expanded frame in a different
shape, and P-1 would make it a step with no new thing.

**Q13 — Grade tags** (catalogue owner question 8). `identify`, `value`, `compare`, `expand`, `combine`,
`place_value_disks`, `pv_disks_build` are grade 2 and reach 4-7 digits; `nearest_1000` is grade 3 for
4-digit rounding (4.NBT.A.3 puts rounding to any place at grade 4). *Recommendation:* **keep the tags;
bound the content by `band`**, with the stand-alone defaults in §2.5 chosen to match the tag (999 for the
grade 2 ids), and change `nearest_1000`'s tag to 4 only if you want the Navigator to stop offering it at grade
3 — the content itself is fine at grade 3 with band 10,000.

---

*Sources read for §1.1 (2026-09-24):*
[MW4K rounding](https://www.mathworksheets4kids.com/rounding.php) ·
[MW4K place value](https://www.mathworksheets4kids.com/place-value.php) ·
[K5 grade 3 place value and rounding](https://www.k5learning.com/free-math-worksheets/third-grade-3/place-value-and-rounding) ·
[K5 round to 10 or 100](https://www.k5learning.com/free-math-worksheets/third-grade-3/place-value-and-rounding/round-numbers-nearest-10-or-100) ·
[Math-Drills number sense](https://www.math-drills.com/numbersense.php) ·
[Common Core Sheets rounding](https://www.commoncoresheets.com/rounding-worksheets)
