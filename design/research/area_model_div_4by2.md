# Area-model division with a 2-digit divisor (`division:area_model_div_4by2`): research

Written 2026-11-14 by the lf-ops builder (phase 1: research and the spec card). Owner request 2026-11-14: a new skill,
area-model division, 4-digit ÷ 2-digit, CCSS 5.NBT.B.6, dealing the same problem class as `division:long_div_2digit`,
drawn on the existing `area-model-div` cell (`js/modules/sheet/cells/area-model-div.js`). The card built from this note
is `design/cards/area-model-div/area-model-div.md`.

Nothing here changes code. The design contract (`WORKSHEET_DESIGN_STANDARD.md`, `PEDAGOGY_STANDARD.md`) outranks
everything below. Where the sites and the standards disagree, the standards win, and the difference is noted.

## 0. Sources and access

| Source | Access this round | What it gave |
|---|---|---|
| MathWorksheets4Kids (primary) | **No login.** The private memory file `~/.claude/projects/*/memory/credentials.md` does not exist on this machine. The public site answers (HTTP 200), but its division pages could not be found by URL (every guessed area-model / partial-quotient page returned 404) and its division hub lists only the basic PDFs to the public. | Nothing new from the live site this round. The content model below uses what is publicly known of its "division using area model" and "partial quotients" sets: a rectangle with the divisor on the side, the dividend split into place-value parts inside, the quotient parts written above, and a version with the parts left for the pupil. |
| IXL (secondary) | **No login.** The public page "Divide using area models" (grade 5) exists (HTTP 200, title confirmed); the item content is behind the sign-in. | The skill exists at grade 5 next to "Divide by 2-digit numbers using partial quotients" and "Divide by 2-digit numbers" (long division). From the publicly known item grammar: a pre-split rectangle, the pupil fills the missing side lengths, then the quotient; later items leave a part for the pupil. |
| K5 Learning (grade 5 multiplication and division hub, public) | Read. | Grade 5 sequences long division with 2-digit divisors: no remainder; with remainder; divisors 10–25; divisors 10–99; missing dividend or divisor (1,564 ÷ ___ = 34). Confirms the divisor bands, and that 4-digit ÷ 2-digit with an exact quotient is the core grade-5 item. |
| Repo | Read. | `gen-operations.js` (`long_div_2digit`, `area_model_div_2by1`, `area_model_div_3by1`), the `area-model-div` cell, `skill-options.js` (`_amEdgesOpt`, `_amFormOpt`, `_p12DivBy`), `design/PROBLEM_TYPES.md` (DV-07, DV-11, RL-17, RD-08), `design/research/operations-facts-v2.md` (ladder DL′), the Y6 links record of `Y6.B2.S11`. |

No wording, story, title or artwork was copied, and nothing was downloaded into the repo.

## 1. The problem class to match: `long_div_2digit` today

`gen-operations.js`, branch `long_div_2digit` (P8 rewrite): divisor `rng(11, range >= 1000 ? 99 : 59)`; then 3 in 10
items have a 1-digit quotient from a 3-digit dividend and 7 in 10 a 2-digit quotient (10 to `min(99, ⌊9999 / divisor⌋)`);
`dividend = divisor × quotient`, so every item is **exact**; the hint estimates the divisor to its nearest ten.

The new skill's NAME is "4-digit ÷ 2-digit", so it deals the 4-digit half of that class only:

- divisor 11–59 by default (as `long_div_2digit` at its default Max Number), 11–99 on the wider option value;
- quotient 2-digit, `max(11, ⌈1000 / d⌉)` to `min(99, ⌊9999 / d⌋)`, so the dividend is always 1,000–9,999;
- exact, no remainder (the cell has no remainder slot, and `long_div_2digit` is exact too);
- the quotient's ones digit is never 0 (a quotient of 40 makes a one-part model, the answer given away, L3);
- 3-digit dividends (the 30 % one-digit-quotient items of `long_div_2digit`) are **not** dealt: they would contradict
  the name (`ws-content-audit`). They are `div_3by2_long`'s class and a later 3by2 area-model value if the owner wants it.

Pool sizes (pairs divisor × quotient with the rules above): divisors 20–90 in tens 556; 11–59 2,850; 11–99 5,996. Plenty
for no repeats on a page (L10).

Sample items read (L4: generate and READ before drawing), dividend ÷ divisor = quotient [tens part | ones part]:

| Band | Items |
|---|---|
| tens (20, 30 … 90) | 2380 ÷ 70 = 34 [2100 \| 280] · 1080 ÷ 20 = 54 [1000 \| 80] · 1550 ÷ 50 = 31 [1500 \| 50] |
| 11–59 | 3496 ÷ 46 = 76 [3220 \| 276] · 1106 ÷ 14 = 79 [980 \| 126] · 1349 ÷ 19 = 71 [1330 \| 19] |
| 11–99 | 7812 ÷ 84 = 93 [7560 \| 252] · 2240 ÷ 80 = 28 [1600 \| 640] · 1817 ÷ 23 = 79 [1610 \| 207] |

What reading them showed: the tens part can be a 3-digit number (980 in 1106 ÷ 14) and the ones part can equal the divisor
(1349 ÷ 19, 19 | 19 × 1) — both correct, both kept, and both must fit the cell (widest part 4 digits). Divisors in tens make
every dividend end in 0: correct for the entry step, but the step must not be the only one.

## 2. CLAUDE.md's eleven questions

1. **Problem types.** (a) DV-11 the area model, parts given: the dividend split by place value of the quotient inside the
   rectangle, the pupil writes each side length (partial quotient) and the quotient — the core item; (b) the same with
   the divisor also a box (`amEdges: blank`); (c) the problem shown as ÷, as the long-division bracket or as a fraction
   (`amForm`), so the model connects to DV-07; (d) later types the sites use but this card does not build: the pupil
   chooses the split (partial quotients with friendly multiples 10×, 20×, 5× of the divisor), a remainder, and the
   missing dividend or divisor. Those are §9 questions, not this build.
2. **Visuals.** The rectangle with the 2-digit divisor on the side, two parts inside (tens part, ones part), the
   partial quotients as boxes above, the problem under it (RL-17's box-division grammar, drawn by the existing cell).
   Friendly multiples of the divisor (10×, 20×, 5×) belong to the Say band and the worked steps, not the drawing: the
   step "34 × 40 = 1,360" is the 10× fact scaled. An estimate box (RD-08) is a long-division scaffold, not this cell's.
3. **Answer formats.** Numbers only, in boxes: each partial quotient, the divisor when blank, the quotient. Print and
   screen are the same slots (the cell's `inputs()`); never multiple choice on screen.
4. **Progression (concrete → pictorial → abstract).** Base-10 has done its work by 3by1; this is pictorial → abstract.
   Ladder: 3by1 (1-digit divisor) → **divisor a multiple of ten** (the multiple-of-ten fact, 2380 ÷ 70) → divisor 11–59
   → 11–99 → (later) the pupil chooses the parts → long division (`long_div_2digit`), with the bracket form as the bridge.
5. **Edge cases.** No remainder (exact, as `long_div_2digit`); a quotient digit of 0 — the tens digit can never be 0 and
   a ones digit of 0 is not dealt (one-part model); 4-digit dividends only (3-digit ones contradict the name); the tens
   part may be 3 digits (1106 ÷ 14) and the ones part may equal the divisor (× 1); quotient never 3 digits (capped at
   99, as `long_div_2digit`); dividends with a 0 digit (2076 ÷ 12) are allowed and must be seen in the 50-item read.
6. **The ONE new thing against `area_model_div_3by1`.** The divisor has two digits, so every partial quotient is found
   from a 2-digit × multiple-of-ten fact (34 × 40 = 1,360) instead of a times-table fact. The rectangle, the two parts,
   the boxes and the forms are unchanged. The divisor-in-tens step isolates even that: first the multiple-of-ten
   divisor (a scaled fact, 70 × 30), then any 2-digit divisor.
7. **Structural against hint scaffolds.** Structural (every level): the rectangle, the parts written inside, the
   quotient-part boxes, the quotient box, the problem line. Hints (fade with the scaffold level and the roles): the
   traced first item on Model / Guided, the Say line, the worked-step lines (each part as "34 × ? = 1,360"). The
   divisor printed on the side (`amEdges: given`) is the support that `blank` takes away.
8. **The written response.** Two or three numbers per item: the side lengths, then the quotient (their sum). Low
   writing load: at most 2 digits per box.
9. **The Say band.** "1,564 is 1,360 and 204. 34 times 40 is 1,360. 34 times 6 is 204. 40 and 6 make 46. So 1,564
   divided by 34 is 46." The frame: "___ is ___ and ___. ___ times ___ is ___. ___ and ___ make ___."
10. **Misconceptions.** M1 writes the part, not the side (writes 1,360 above instead of 40); M2 drops the place value
    of the tens part (writes 4 for 1,360 ÷ 34, so 4 + 6 = 10); M3 multiplies the parts instead of adding them
    (40 × 6 = 240); M4 divides by one digit of the divisor only (1,360 ÷ 4 = 340, using the 4 of 34). These feed
    Error Analysis, True or False? and Reason It.
11. **Fit to our page.** The cell's own footprint (no browser): sign form 94 × 58 mm at M and 116 × 66 mm at L
    (3by1: 85 × 58 and 104 × 66); long form with a blank divisor 86 × 68 / 100 × 79 mm. Live width is 186 mm, so two
    columns at M need the MEASURED cell ≤ about 91 mm with the gutter; the footprint estimate is 3 mm over. Expected
    capacity: M 2 × 3 = 6 a page if the measured width fits, else 1 × 4; L 1 × 3 = 3. The build measures it
    (`ws-print-lint --source kit`, `ws-columns`) and the card's §9 asks the owner to accept 1 × 3 at L.

## 3. Where research and the standards differ

- The sites put 6–12 area models on a page in colour or grey shading; we put 3–6, black line art, one boxed cell each.
- The sites mix remainder and exact items on one page and let the pupil choose the split from the first item; we change
  one thing a step (P-1): the split is given, exact quotients, and the divisor band is the only ladder in this build.
- IXL moves from area models to long division within one skill; we keep the area model its own skill and connect them
  through the bracket form (`amForm: long`).

## 4. Links the build adds (CLAUDE.md "every new skill is linked")

- `SKILL_STANDARDS`: `{ ccss: ['5.NBT.B.6'], ee: ['M.EE.5.NBT.6'] }` (the area-model clause of 5.NBT.B.6 is exactly
  this skill; `long_div_2digit` keeps 6.NS.B.2).
- `SKILL_WRM`: `{ step: 'Y6.B2.S11', partial: 'the area model (partial quotients) for a 2-digit divisor, before the long-division layout' }`;
  WRM has no area-model division step at Y6.
- Links `Y6.json` `Y6.B2.S11`: `partial` (not `direct`, the step is the long-division layout); `pre`:
  `area_model_div_3by1`, `mult_multiples_of_ten`; `Y6.B2.S11` `pre` of `long_div_2digit` gains this skill; `related`:
  `long_div_2digit`, `div_3by2_long`, `area_model_mult_hard` (the inverse).
- Search terms: the `long_div|...|area_model_div` CONCEPT_RULES row already matches the id; `SKILL_TERMS` adds
  "area model division 2 digit divisor", "partial quotients", "box method division", "divide 4 digit by 2 digit".
