# Reference-site research: operations + facts (Family 1)

Research date: 2026-09-19. Scope: addition, subtraction, multiplication and division facts; fact
families; multi-digit add / subtract / multiply; long division; missing addend / factor; mixed
operations. This document feeds `design/PROBLEM_TYPES.md` section 5.1 (GAP-1-xx) and the ladders of
`PEDAGOGY_STANDARD.md` section 5.2. It is research only; no app code was changed.

## 0. Method note

### 0.1 How the pages were read

Every page was read through an automated fetch that returns a machine summary of the page, not the raw
HTML and not the PDFs behind it. Consequences, stated plainly:

- Descriptions below are paraphrases of page text. No worksheet wording or problem is copied.
- Item counts and grade tags are reported only where the summary gave them; they were not checked against
  the PDFs.
- No site was logged in to. IXL practice items were **not opened**, so IXL *answer formats* and *visuals*
  below are inferred from skill names only and are marked "(name only)". IXL skill names and their order
  are as the public lists show them.
- IXL letter codes (e.g. 3-P.4) are IXL's own and change when IXL re-orders its lists; treat them as a
  snapshot.
- CCSS codes on IXL rows come from IXL's own public alignment pages. CCSS codes on MathWorksheets4Kids /
  K5 / Math-Drills / Math-Aids rows are my tagging, not the site's, unless the row says otherwise.
  CommonCoreSheets prints a code beside each sheet and those are reported as shown.

### 0.2 Pages read successfully

| Site | URL | Used for |
|---|---|---|
| MathWorksheets4Kids (MW4K) | https://www.mathworksheets4kids.com/addition.php | addition hub |
| MW4K | https://www.mathworksheets4kids.com/addition-facts.php | addition facts |
| MW4K | https://www.mathworksheets4kids.com/two-digit-addition.php | 2-digit addition |
| MW4K | https://www.mathworksheets4kids.com/subtraction.php | subtraction hub |
| MW4K | https://www.mathworksheets4kids.com/subtraction-facts.php | subtraction facts |
| MW4K | https://www.mathworksheets4kids.com/three-digit-subtraction.php | 3-digit subtraction |
| MW4K | https://www.mathworksheets4kids.com/subtraction-across-zero.php | across zeros |
| MW4K | https://www.mathworksheets4kids.com/add-sub.php | mixed + and - |
| MW4K | https://www.mathworksheets4kids.com/add-sub-fact-family.php | + / - fact families |
| MW4K | https://www.mathworksheets4kids.com/multiplication-division-fact-family.php | x / ÷ fact families |
| MW4K | https://www.mathworksheets4kids.com/multiplication.php | multiplication hub |
| MW4K | https://www.mathworksheets4kids.com/multiplication-facts.php | multiplication facts |
| MW4K | https://www.mathworksheets4kids.com/multiplication-models.php | equal groups models |
| MW4K | https://www.mathworksheets4kids.com/2-digit-by-2-digit-multiplication.php | 2 x 2 digit |
| MW4K | https://www.mathworksheets4kids.com/division.php | division hub |
| MW4K | https://www.mathworksheets4kids.com/division-facts.php | division facts |
| MW4K | https://www.mathworksheets4kids.com/2by1-division.php | 2-digit ÷ 1-digit |
| MW4K | https://www.mathworksheets4kids.com/3by1-division.php | 3-digit ÷ 1-digit |
| IXL | https://www.ixl.com/math/kindergarten , /grade-1 , /grade-2 , /grade-3 , /grade-4 , /grade-5 | skill lists in order |
| IXL | https://www.ixl.com/math/division , /subtraction , /multiplication , /mixed-operations | topic lists (recovered parts the grade pages truncated) |
| IXL | https://www.ixl.com/standards/common-core/math/grade-1 ... /grade-5 | CCSS alignment of each skill |
| K5 Learning | https://www.k5learning.com/free-math-worksheets/topics/addition , /subtraction , /multiplication , /division | grade-by-grade type lists |
| Math-Drills | https://www.math-drills.com/addition.php , /subtraction.php , /multiplication.php , /division.php | fact and long-form organisation |
| Math-Drills | https://math-drills.com/multiplication2.php | long multiplication |
| Math-Drills | https://math-drills.com/factfamilyworksheets.php , https://math-drills.com/multiop.php | fact families, mixed operations |
| Math-Aids | https://www.math-aids.com/Addition/ , /Subtraction/ , /Multiplication/ , /Division/ , /Fact_Family/ | generator options |
| CommonCoreSheets | https://www.commoncoresheets.com/subtraction-worksheets , /division-worksheets | CCSS-coded type lists |

### 0.3 Pages that could not be read

| What | Result |
|---|---|
| MW4K guessed URLs `fact-family.php`, `subtraction/across-zeros.php`, `2digit-multiplication.php` | HTTP 404 (wrong guesses; the correct pages above were found by search) |
| Math-Drills `mixedoperations.php` | HTTP 404 (correct page is `multiop.php`) |
| IXL grade-2 list after skill S.4 and grade-3 list after W.5; kindergarten list after W.1 | Truncated by page length. Grade 2 and 3 were recovered from the IXL standards and topic pages. Kindergarten subtraction beyond "Understand subtraction up to 5" was **not** recovered. |
| MW4K missing-addend page (`/grade-2/missing-addends.php`) | Search snippet says it is members-only; not opened. |
| MW4K individual PDFs, IXL practice items, TeacherPayTeachers, Boom Learning | Not consulted (login or paywall). |
| CommonCoreSheets addition / multiplication pages | Not fetched (time); subtraction and division pages were. |

---

## 1. Addition facts

| Source | Problem types | Grade | Progression (site order) | Visuals | Answer format | Edge cases in / out |
|---|---|---|---|---|---|---|
| IXL grade 1 (https://www.ixl.com/math/grade-1) | Understand addition (cubes, pictures, which model matches, what does the model show, write the sentence for a picture, number line, words to sentence) -> strategies to 10 (any order, counting on, make ten with and without models) -> facts to 10 (facts, take apart, make a number, ways to make a number) -> strategies to 20 -> **single-addend sets** -> facts to 20, sort facts, make a number, three addends | 1 | Strategies to 20 in order: related facts, number line, counting on, doubles with models, doubles, doubles complete-the-sentence, doubles plus one, doubles minus one, near doubles, three numbers use doubles, ten frames, make ten, three numbers make ten. Single-addend sets in order: **Adding 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, then Adding 0 last** | cubes, pictures, number lines, ten frames (name only) | (name only) fill-in, choose the model, sort, true sentence | "Adding 0" is its own set and comes after Adding 10; "Add and subtract with 0" is a separate skill (M.2) |
| IXL grade 2 (https://www.ixl.com/math/grade-2) | Doubles with models -> doubles -> doubles complete sentence -> near doubles -> number line -> counting on -> make ten -> **add zero**; then facts to 10, to 20, sort facts, complete the sentence, balance equations, which sentence is true, three addends, four or more addends | 2 (2.OA.B.2 per https://www.ixl.com/standards/common-core/math/grade-2) | as listed | models (name only) | (name only) | zero isolated as its own skill |
| IXL kindergarten (https://www.ixl.com/math/kindergarten) | put together with cubes, cube trains, which model matches, write the sentence, add with pictures, "Add 1 or 2", complete the sentence, make 10 with and without models, add in any order, take apart numbers | K | to 5 first, then to 10, each with its own "understand" block before the bare block | cubes, cube trains, pictures | (name only) | - |
| MW4K (https://www.mathworksheets4kids.com/addition-facts.php) | **Single-number facts 0-9**, column format and horizontal format as separate sets; **mixed (cumulative) ranges 0-2 through 0-9**, again column and horizontal separately; a wheel/target format (centre number added to surrounding numbers); dartboard in three difficulty levels plus a blank teacher template | not stated on page; K-2 content | single set -> cumulative range that grows by one number | themed art only | write the sum; 20 items per sheet reported; 3 sheets per set | sums to 10 or to 20 depending on set |
| MW4K hub (https://www.mathworksheets4kids.com/addition.php) | picture addition; make ten on ten frames (missing addend); single-digit column addition (15 pairs); number line to 10; adding one; adding doubles with objects | K-1 | concrete -> ten frame -> bare column | pictures, ten frames, number lines | write, draw counters | - |
| K5 Learning (https://www.k5learning.com/free-math-worksheets/topics/addition) | K: count objects, facts to 5 / 10 / 20, write equations, make 10, add 10 to a digit, missing addend to 10. G1: objects, number lines (2 or 3 addends), facts to 10 / 20, number bonds, doubles and near doubles, missing addends, 3 numbers within 20, whole tens, "completing the next ten" | K-1 | as listed | objects, number lines, bonds | write | "adding 10 to a single digit" and "completing the next ten" are separate named types |
| Math-Drills (https://www.math-drills.com/addition.php) | facts split by **no regrouping / some regrouping / all regrouping** (i.e. sum under or over 10); focus / target sheets for one addend; doubles, doubles plus / minus; make 10 / 20 / 30; horizontal versions; five-minute 10x10 grids; facts tables filled or blank | not graded | - | none | write; large-print variants | - |
| Math-Aids (https://www.math-aids.com/Addition/) | generators: single digit, 0-20, "adding within a sum" with CCSS preset sets, **adding with dots** (dot patterns beside / for the numerals, 0-9), dot figures to 10 and to 20, doubles / double+1 / double+2 (vertical and horizontal), doubles with dots, 1 / 3 / 5 minute drills | K-2 | - | dot patterns | write; up to 30 per page, dot sheets 10-12 | - |

**Read-across.** Two independent sites (IXL, MW4K) organise fact practice as one addend at a time, then a
growing cumulative range, with vertical and horizontal kept as separate sets. That is exactly P-FL-2 /
P-AT-5 / P-16. Math-Aids' dot sheets are the closest public analogue of the RL-02 dot cue.

## 2. Subtraction facts

| Source | Problem types | Grade | Progression | Visuals | Answer format | Edge cases |
|---|---|---|---|---|---|---|
| IXL grade 1 (https://www.ixl.com/math/grade-1) | understand (cubes, pictures, which model, cube train, write the sentence, number line, words to sentence, **subtract zero and all**) -> strategies to 10 (count back, count on, relate + and -, use addition to subtract) -> facts to 10 -> strategies to 20 -> **single-subtrahend sets** -> facts to 20, sort facts, make a number | 1 (1.OA.C.5, 1.OA.C.6, 1.OA.B.4 per https://www.ixl.com/standards/common-core/math/grade-1) | Strategies to 20 in order: related subtraction facts, relate + and - sentences, number line, count back, subtracting to and from 10, ten frames, use ten to subtract, use addition to subtract, count on, count on and use ten, subtract doubles. Sets in order: **Subtracting 1 ... 10, then Subtracting 0** | cubes, pictures, number lines, ten frames (name only) | (name only) | "subtract zero and all" (n - 0 and n - n) is a named skill at both grades (1-I.9, 2-H.7) |
| IXL grade 2 (https://www.ixl.com/math/subtraction) | subtract doubles, number line, count back, use ten, count on, count on + use ten, zero or all; then facts to 10, **one-digit from a two-digit number up to 20**, complete the sentence, balance equations, which sentence is true | 2 (2.OA.B.2) | as listed | - | (name only) | teen minuend minus one digit is its own skill |
| MW4K (https://www.mathworksheets4kids.com/subtraction-facts.php) | **single-number facts 0-9** in column and in horizontal format (3 sheets each); cumulative ranges 0-2 through 0-9 in both formats; "write five / six sentences that give this difference" wheels with blank templates | K-2 (stated) | single set -> cumulative | themed only | write the difference; compose sentences for a target | answers capped at 20 |
| MW4K hub (https://www.mathworksheets4kids.com/subtraction.php) | tables and charts (filled and blank); picture facts 0-9; count-and-subtract, cross-out-and-count, dice subtraction; number lines 0-5, 0-10, 0-20; up to 5, up to 10, up to 20 | K-2 | range 5 -> 10 -> 20 | pictures, cross-outs, dice, number lines | write, cross out | - |
| K5 Learning (https://www.k5learning.com/free-math-worksheets/topics/subtraction) | K: count objects, counting down, picture equations, add or subtract 1s and 2s, within 5, vertical. G1: objects, number lines, within 10 / 20, **missing minuend or subtrahend**, 2-digit minus 1-digit no regrouping, whole tens, from a whole ten. G2: within 0-10, **within 10-19** as a separate set | K-2 | as listed | objects, number lines | write | "10-19" band kept apart from "0-10" |
| Math-Drills (https://www.math-drills.com/subtraction.php) | individual focus facts (subtracting 0-12) at 50 and 25 per page; facts 0-18 at 100 / 81 / 64 / 50 / 25 / 12 per page with large and very large print; horizontal sets; make-ten strategy sheets | not graded | - | none | write | - |
| Math-Aids (https://www.math-aids.com/Subtraction/) | subtracting with dots; dot figures to 10 and 20; "subtracting within a number" with CCSS presets; subtracting doubles; facts with answers 1-10; drills | K-2 | - | dot patterns | write | - |
| CommonCoreSheets (https://www.commoncoresheets.com/subtraction-worksheets) | subtraction relative to addition (fill the missing number; coded 1.OA.4); subtracting visually (1.OA.6); within 20 horizontal; vertical up to a chosen number; "subtracting from a specific value" (2.OA.2); creating tens; drills by subtrahend 0s ... 10s | K-2 as coded | - | object pictures | write | - |

## 3. Multiplication facts

| Source | Problem types | Grade | Progression | Visuals | Answer format | Edge cases |
|---|---|---|---|---|---|---|
| IXL grade 3 (https://www.ixl.com/math/grade-3) | **Understand**: identify / write repeated addition for equal groups (sums to 25), count equal groups, identify and write multiplication expressions for equal groups, relate + and x, **multiply by 0 or 1 with equal groups**, identify / write sentences for arrays, make arrays, number lines, compare numbers using multiplication. **Skill builders**: one multiplier per skill. **Fluency**: facts, true or false, sorting, find the missing factor, select the missing factors, sentences true or false, squares | 3 (3.OA.A.1, 3.OA.C.7, 3.OA.A.4 per https://www.ixl.com/standards/common-core/math/grade-3) | Skill builders to 10 in order: **x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10**; fluency grouped **{2, 3, 4, 5, 10} then {6, 7, 8, 9} then all to 10**; then a second pass to 12 (x1 ... x12; zero is not repeated) and fluency to 12 | equal groups, arrays, number lines (name only) | (name only) fill-in, true / false, sort, select several | 0 and 1 are taught first as their own sets and again under properties ("Multiply by 0 or 1: complete the sentence") |
| IXL grade 2 (https://www.ixl.com/standards/common-core/math/grade-2) | identify / write repeated addition for equal groups and for arrays (sums to 25, and to 10), word problems by repeated addition; "Count equal groups" | 2 (2.OA.C.4) | groups before arrays | groups, arrays | (name only) | - |
| IXL grade 4 (https://www.ixl.com/math/grade-4) | facts to 10, missing factor to 10, facts to 12, missing factor to 12, properties, distributive missing factor, compare using multiplication, comparison: addition or multiplication?, choose numbers with a particular product, input / output tables and find the rule | 4 | as listed | - | (name only) | - |
| MW4K (https://www.mathworksheets4kids.com/multiplication-facts.php) | **single-number facts 0-12**, column and horizontal as separate sets (3 sheets each); wheel format (centre factor times surrounding numbers); **cumulative ranges 0-2 through 0-12** in both formats; dartboards in 3 levels with teacher template | 3-4 (stated) | single table -> cumulative | themed only | write | 0 included in the range |
| MW4K models (https://www.mathworksheets4kids.com/multiplication-models.php) | describe equal groups (how many groups, how many in each); write the sentence (to 5 per group, then to 10); complete the sentence (missing factor read from the picture, 2 levels); choose the matching sentence then draw the groups | 2-3 | describe -> write -> complete -> choose and draw | equal-group pictures | frame, write, choose, draw | - |
| K5 Learning (https://www.k5learning.com/free-math-worksheets/topics/multiplication) | G2: meaning, arrays, facts 2 and 3 / 5 / 10 / 2-5, tables of 2, 5, 10, missing factors, "two times" small numbers, multiples of 5, whole tens. G3: meaning, sentences, arrays, number line, facts up to 2-12, tables, missing factors, 1-digit by whole tens and whole hundreds, whole tens by whole tens | 2-4 | **2, 5, 10 first**; then 2-5; then to 12 | arrays, number lines | write | - |
| Math-Drills (https://www.math-drills.com/multiplication.php) | facts to 7, to 9, to 10, to 12 as separate bands; each band in three zero policies: **no zeros or ones / no zeros / with zeros**; individual facts in order then shuffled; paired sets (e.g. 6-7, 7-8); **anchor groupings {0, 1, 2, 5, 10} then {3, 4, 6} then {7, 8, 9} then {11, 12}**; progressive ranges 1-5 up to 1-11; squares; five-minute 10x10 grids; page sizes 100 / 81 / 64 / 50 / 36 / 25 with large print | not graded | see groupings | none | write | zero / one inclusion is an explicit teacher choice |
| Math-Aids (https://www.math-aids.com/Multiplication/) | times-table practice with selectable tables, timed drills (20 items), target circles, vertical 0-12 with adjustable factors, array sheets (write rows, columns and the sentence; commutative arrays; draw the array; array word problems) | 3-4 | - | arrays | write, draw | - |

## 4. Division facts

| Source | Problem types | Grade | Progression | Visuals | Answer format | Edge cases |
|---|---|---|---|---|---|---|
| IXL grade 3 (https://www.ixl.com/math/division) | **Understand**: divide by counting equal groups, write division sentences for groups, **division sentences with 1 and 0**, relate x and ÷ for groups, sentences for arrays, make arrays, relate x and ÷ for arrays, relate x and ÷, number lines. **Skill builders**: one divisor per skill. **Fluency**: facts, true or false, sorting, find the missing number, select the missing numbers, sentences true or false | 3 (3.OA.A.2, 3.OA.B.6, 3.OA.C.7) | Skill builders in order: **÷1, ÷2 ... ÷10 (quotients to 10)**; fluency {2, 3, 4, 5, 10} then {6, 7, 8, 9} then all; then ÷1 ... ÷12 with quotients to 12 | groups, arrays, number lines (name only) | (name only) | 1 and 0 handled in the concept block; no "divide by 0" set exists |
| IXL grade 4 (https://www.ixl.com/math/grade-4) | facts to 10, find the missing number, word problems; the same to 12; properties of division; choose numbers with a particular quotient | 4 | as listed | - | (name only) | - |
| MW4K (https://www.mathworksheets4kids.com/division-facts.php) | **12 single-divisor sets, ÷1 to ÷12**, horizontal format, 3 sheets each; each set's blurb states the idea of that divisor (e.g. dividing by 1 leaves the number unchanged) | 3-4 (stated) | ÷1 upward | none | write | ÷1 is a set; no ÷0 |
| MW4K hub (https://www.mathworksheets4kids.com/division.php) | repeated subtraction <-> division sentence; divide by 2, 3, 4, 5 within 100; **division properties (zero divided by a number, divide by one)**; complete the sentence (missing dividend, divisor or quotient); divide and compare; balance equations; match equal quotients; equal sharing; draw and share objects into groups; vocabulary chart of the parts of a division sentence; **three models for one problem (grouping, array, number line)** | 3-4 | sharing / grouping -> repeated subtraction -> facts -> missing number | objects, arrays, number lines | write, draw, match, compare symbol | properties sheet isolates 0 ÷ n and n ÷ 1 |
| K5 Learning (https://www.k5learning.com/free-math-worksheets/topics/division) | meaning of division and sentences; equal groups; **divide by 2 or 3, 4 or 5, 6 or 7, 8 or 9** (paired sets); facts 1-10 and 1-12; x / ÷ fact families; missing dividend or divisor; divide by 10 and 100; **division facts written in long-division form** (G3 and G4); division with remainders within 100 | 3-4 | paired divisors -> all; ÷ sign -> bracket form of the same facts -> remainders | groups | write | - |
| Math-Drills (https://www.math-drills.com/division.php) | bands to 7, 9, 10, 12; each in **bracket notation and ÷ notation** as separate sheets, vertical and horizontal; individual divisor sheets; grouped divisors; large print; 100 / 50 / 25 per page | not graded | - | none | write | - |
| Math-Aids (https://www.math-aids.com/Division/) | horizontal generator with **÷ symbol, slash, or bracket** as a teacher option; "different formats" sheet that shows the same kind of fact in bracket, horizontal and fraction form; missing number (dividend, divisor or quotient replaced); drills | 3-4 | - | none | write | no-remainder is a toggle |
| CommonCoreSheets (https://www.commoncoresheets.com/division-worksheets) | division relative to multiplication (coded 3.OA.6); x / ÷ tables; dividing with number lines; division as repeated subtraction on a number line, with and without remainder; visual division with and without remainder; drills | 3-4 as coded | - | number lines, object groups | write | remainder version is a separate sheet |

## 5. Fact families

| Source | Problem types | Grade | Visuals | Answer format | Edge cases |
|---|---|---|---|---|---|
| MW4K + / - (https://www.mathworksheets4kids.com/add-sub-fact-family.php) | (1) **is it a fact family? sort number sets into member / not member**; (2) find the missing member (two shown, find the third); (3) complete the four facts (numbers given, answers blank); (4) fill the missing numbers inside four printed sentences; (5) write all four facts from three numbers; (6) domino: count pips, write four equations; (7) number bond: find the missing member then write four facts; (8) bar model: complete the bar then write four facts; (9) picture based; (10) blank templates | K-2 | triangle, circle, house, domino, number bond, bar model, pictures | sort, write a number, write equations | non-families are deliberately included in type 1 |
| MW4K x / ÷ (https://www.mathworksheets4kids.com/multiplication-division-fact-family.php) | is it a family or not (T-chart sort); missing member; complete the facts in triangles; fill boxes in houses; write four facts in houses; **write the facts for an array**; templates | 3-4 (stated) | T-chart, triangle, house, array | sort, write | non-families included |
| IXL (https://www.ixl.com/math/grade-1 , https://www.ixl.com/standards/common-core/math/grade-2) | G1: "Related addition facts", "Related subtraction facts", "Relate addition and subtraction sentences", "Use addition to subtract", "Fact families - up to 10" then "up to 20". G2: related addition facts, related subtraction facts, fact families, fact families up to 100 (2.NBT.B.9). G3: relate x and ÷ for groups, for arrays, bare (3.OA.B.6); "Use one multiplication fact to complete another" at G4 | 1-4 | groups, arrays (name only) | (name only) | families extend to 100 at grade 2 |
| Math-Drills (https://math-drills.com/factfamilyworksheets.php) | relationship sets, **partly filled** and **all blank** variants; + / - to sums 10 and 18, plus sets whose whole is fixed at 10 or 12; x / ÷ to products 49, 64, 81, 100, 144 | not graded | none | write | fixed-whole sets (all families of 10) |
| Math-Aids (https://www.math-aids.com/Fact_Family/) | + / - families with numbers 1-12; x / ÷ families with numbers 2-11; a version where the teacher picks the addend pairs; 6 per page | K-2 stated for + / - | none described | write four facts | x / ÷ range excludes 1 and 0 (2-11), which avoids degenerate families |
| K5 Learning (https://www.k5learning.com/free-math-worksheets/topics/subtraction , /division) | fact families listed under grade 2 subtraction and grade 3 division | 2-3 | - | - | - |

**Read-across.** The "is this a family?" sort with non-examples (MW4K, both operations) is the public
analogue of FF-13 and of the P-10 non-example rule. Doubles produce only two distinct facts, and families
containing 0 or 1 are degenerate; Math-Aids' 2-11 range shows one site designing them out.

## 6. Multi-digit addition

| Source | Problem types and order | Grade | Visuals | Answer format | Edge cases |
|---|---|---|---|---|---|
| IXL grade 1 (https://www.ixl.com/standards/common-core/math/grade-1, 1.NBT.C.4) | add multiples of ten -> multiple of ten + one digit (models, then bare) -> multiple of ten + two-digit -> two-digit + one-digit without regrouping (models, bare) -> count on to 100 -> hundred chart -> two-digit + one-digit with regrouping (models, bare) -> two-digit + two-digit without regrouping (models, place value, bare) -> with regrouping (models, place value, bare) | 1 | base-ten models, hundred chart (name only) | (name only) | every rung appears twice: "use models" first, bare second |
| IXL grade 2 (https://www.ixl.com/math/grade-2 , standards page) | strategies: break apart a one-digit number, models 2d+1d without then with regrouping, number lines, break apart a two-digit number, compensation, models 2d+2d, place value 2d+2d. Practice: 2d+1d without -> with regrouping -> add a multiple of 10 -> 2d+2d without -> with -> **mixed** -> **"vertically"** as its own skill -> word problems -> complete the sentence -> balance -> sums to 200 (again "vertically") -> three numbers -> four numbers -> **three or four numbers vertically**. Three digits: number line, break apart, compensation, models without / with regrouping, expanded form without / with / mixed, add 10 or 100, add a multiple of 100, of 10 or 100, without regrouping, with regrouping, mixed, complete the sentence | 2 (2.NBT.B.5-8) | models, number lines, expanded form | (name only) | the fixed triple **without -> with -> mixed** recurs at every size; vertical layout is always a separate skill after horizontal |
| IXL grade 3 (https://www.ixl.com/math/grade-3) | number line, compensation, expanded form, without regrouping, with regrouping, mixed, word problems, complete the sentence, balance, **fill in the missing digits**, three numbers; then four / five digits: patterns over increasing place values, two numbers to four digits, missing digits, three numbers, five digits | 3 (3.NBT.A.2) | - | (name only) | missing-digit items at every size |
| IXL grades 4-5 (https://www.ixl.com/math/grade-4 , /grade-5) | estimate, add two multi-digit numbers, properties, **3 or more numbers up to millions**, missing digits, choose numbers with a particular sum | 4-5 (4.NBT.B.4) | - | (name only) | - |
| MW4K (https://www.mathworksheets4kids.com/two-digit-addition.php , /addition.php) | base-ten-block addition; standard column with a regroup / no-regroup choice; horizontal; word problems where the pupil sets the sum up vertically; balance scales with missing addends; **missing digits (one missing, then two missing)**; pyramids; match pairs to a target sum; **3, 4 or 5 addends**; 3-digit + 2-digit without regrouping; 3-digit with base-ten blocks; 4-digit with word problems; circle the addend pair that makes a given sum | 1-4 | base-ten blocks, scales | write, circle, match | ragged lengths (3d + 2d) are a named sheet |
| K5 Learning (https://www.k5learning.com/free-math-worksheets/topics/addition) | G1: 2d + 1d mentally without carrying, columns 1-2 digits. G2: 1d + 2d without then with regrouping, 3 or 4 numbers, whole tens and hundreds, whole tens to 2- or 3-digit numbers, 1d + 3d, **two to four 2-digit numbers in columns**, 3-digit columns. G3: whole tens (2-4 addends), whole hundreds and thousands, **completing 100 / whole hundreds / whole thousands**, 2-4 digit columns, up to 4 addends. G4: mental 2-digit, 3-6 digit columns. G5: 4-6 digit, very large numbers, missing addend with 3-5 addends | 1-5 | none | write | "complete the next ten / hundred / thousand" is a recurring named type |
| Math-Drills (https://www.math-drills.com/addition.php) | **no regrouping / some regrouping / all regrouping** as three parallel series from 2 to 9 digits; horizontal; **grid support** (2-5 addends, 2-5 digits); column addition of 3-6 numbers; large and very large print (9-16 per page) | not graded | place-value grid | write | regrouping density is a named control |
| Math-Aids (https://www.math-aids.com/Addition/) | 1-4 digits with 2-5 addends; no-regroup generator; **"adding with regrouping" with selectable columns that regroup**; missing digits; 3 or 4 digits horizontal; "place values" triple-equation sets | 1-5 | none | write | per-column regroup control |

## 7. Multi-digit subtraction, including across zeros

| Source | Problem types and order | Grade | Visuals | Answer format | Edge cases |
|---|---|---|---|---|---|
| IXL grade 2 (https://www.ixl.com/math/subtraction , https://www.ixl.com/standards/common-core/math/grade-2) | strategies: break apart a one-digit number, models 2d-1d without / with regrouping, number lines, break apart a two-digit number, compensation (number line, then bare), count on, models 2d-2d, place value 2d-2d. Practice: 2d-1d without -> with -> mixed -> multiple of 10 -> 2d-2d without -> with -> mixed -> **vertically** -> ways to make a number -> word problems -> complete the sentence -> write the sentence -> balance. Three digits: subtract 10 or 100, a multiple of 100, of 10 or 100, **"Subtract across zeros" (2-V.4) placed BEFORE the general without / with / mixed skills**, then vertically, word problems, complete the sentence | 2 (2.NBT.B.5, B.7, B.8) | models, number lines, expanded form | (name only) | across-zeros is its own skill at grade 2 and again at grade 3 |
| IXL grade 3 (https://www.ixl.com/math/grade-3) | number line, compensation, expanded form, without regrouping, with regrouping, mixed, **subtract across zeros (3-H.7, after mixed)**, word problems, complete the sentence, balance, missing digits; then four and five digits | 3 (3.NBT.A.2) | - | (name only) | note the position differs between grades: before the general skills at G2, after them at G3 |
| MW4K across zero (https://www.mathworksheets4kids.com/subtraction-across-zero.php) | sets by minuend size: 2-digit (G2), 3-digit minus 2- or 3-digit (G3), 4-digit (G3-4, 20 per sheet, vertical), 5-digit with runs of consecutive zeros (G5), mixed 3 / 4 / 5 digit (G4), 5-7 digit; plus **minuends that are multiples of 100, 1,000 or 10,000 in two levels** | 2-5 (stated) | none | write, vertical | zeros in the minuend; runs of zeros only from 5 digits up |
| MW4K 3-digit (https://www.mathworksheets4kids.com/three-digit-subtraction.php) | 3d - 2d without regrouping, then with; **missing digits (easy, moderate)**; circle the pair that gives a stated difference; 3d - 3d without then with; cross-number puzzles; **"line-up": rewrite horizontal numbers in columns, then solve** | 2-4 | none | write, circle, rewrite | ragged (3d - 2d) comes BEFORE equal-length 3d - 3d |
| MW4K hub (https://www.mathworksheets4kids.com/subtraction.php) | 2d - 1d; 2-digit with / without regrouping; 3-digit; large numbers 4-7 digits; drills; **subtraction using grids (grid paper for alignment, G3-4)**; estimating | 2-4 | grid | write | - |
| K5 Learning (https://www.k5learning.com/free-math-worksheets/topics/subtraction) | G2 order: 1d from 2d **"no crossing the ten"** -> **1d from a whole ten** -> 1d from 2d some regrouping -> 1d from 3d -> whole tens from whole tens -> whole tens from 2- or 3-digit -> whole hundreds -> **2-digit from whole hundreds** -> missing minuend / subtrahend -> columns no regrouping -> columns with regrouping -> **borrowing across zeros**. G3: 2-digit from 100, whole tens from 1,000, 3-digit from whole thousands, 3-4 digit columns, **across 2 or 3 zeros**. G4: any number from 1,000, 3-6 digit columns, across 2 or 3 zeros | 2-5 | none | write | "from a whole ten / hundred / thousand" is the bridge into across-zeros; one zero at G2, two or three at G3-4 |
| Math-Drills (https://www.math-drills.com/subtraction.php) | no / some / all regrouping series, 2 to 9 digits; grid support 2-6 digits; horizontal; thousands-separator variants; **complements of powers of ten; multiples of powers of ten; "zeros in the middle" 3-5 digit with the ones always or sometimes needing regrouping** | not graded | grid | write | zero position is a named control (whole minuend of zeros vs zero in the middle) |
| Math-Aids (https://www.math-aids.com/Subtraction/) | 2 / 3 / 4 digit generator whose regrouping option is **none / some / all / across zero**; separate "across zero" generator for 3 or 4 digits; missing digits; missing number (placeholder in any of the three positions) | 2-4 | none | write | - |
| CommonCoreSheets (https://www.commoncoresheets.com/subtraction-worksheets) | introduction to regrouping (trade a ten for ones; coded 2.NBT.5); subtracting from multiples of ten; across zero (2.NBT.5); **"2 zeroes" (3.NBT.2)**; across several zeroes (4.NBT.4); with / without regrouping; vertical and horizontal; open number line strategy; multiple subtrahends word problems | 2-4 as coded | trading pictures, open number line | write | one zero -> two zeros -> several zeros mapped to G2 -> G3 -> G4 |

## 8. Multi-digit multiplication

| Source | Problem types and order | Grade | Visuals | Answer format | Edge cases |
|---|---|---|---|---|---|
| IXL grade 3 (https://www.ixl.com/math/grade-3) | multiply by a multiple of ten using place value -> bare -> **one-digit by teen numbers using grids** -> 1 x 2-digit using area models I, II -> 1 x 2-digit bare -> word problems -> three numbers | 3 (3.NBT.A.3) | grids, area models (name only) | (name only) | teens first as the smallest two-digit case |
| IXL grade 4 (https://www.ixl.com/math/grade-4 , standards page) | **By one digit:** patterns over place values -> multiples of 10, 100, 1,000 -> estimate -> teen numbers using grids -> **choose the area model** -> use the area model -> distributive property -> 1 x 2 bare -> word problems -> multi-step -> 1 x 3 / 4 digit: choose the area model -> area model -> **expanded form** -> **partial products** -> bare -> word problems. **By two digits:** multiply by 10 or 100 -> multiples of ten -> estimate -> 2 x 2 choose the area model -> area model -> partial products -> **"complete the missing steps"** -> bare 2 x 2 -> word problems -> "use one multiplication fact to complete another". Extra aligned skills: box multiplication, lattice multiplication | 4 (4.NBT.B.5) | area / box models, lattice | (name only) | a "choose the correct model" (decision) skill precedes each "use the model" skill; a "complete the missing steps" (partly worked) skill precedes the bare algorithm |
| IXL grade 5 (https://www.ixl.com/math/grade-5) | patterns, numbers ending in zeros, powers of ten, estimate, by 1-digit, **by 2-digit: complete the missing steps**, 2 x 2, 2 x 3, 2 x larger, by 3-digit, properties, compare products | 5 (5.NBT.B.5) | - | (name only) | - |
| MW4K (https://www.mathworksheets4kids.com/multiplication.php , /2-digit-by-2-digit-multiplication.php) | hub order: 2x1, 3x1, 4x1, 2x2, 3x2, multi-digit. The 2x2 page: column method; word problems; doubling and halving; **grid method**; area of rectangles; **area model (box)**; **lattice**; timed drills | 3-5 | grid, box, lattice | write, table-fill | regrouping not separated on this page |
| K5 Learning (https://www.k5learning.com/free-math-worksheets/topics/multiplication) | G3: 1-digit by whole tens, by whole hundreds, whole tens by whole tens (and missing-factor versions), columns 1 x 2-4 digits. G4: multiply in parts (1 x 2 or 3 digit), 1-digit by a number close to 100, columns 1 x 2 / 3 / 4, 2 x 2 / 3 / 4, 3 x 3. G5: up to 2 x 4 and 3 x 3, by 10 / 100 / 1,000 with missing factors | 3-5 | none | write | levels named by digit counts exactly as GAP-1-15 proposes |
| Math-Drills (https://math-drills.com/multiplication2.php) | levels from 2 x 1 to 8 x 8 digits; thousands-separator variants; large print; **grid support with regrouping boxes, without regrouping boxes, and blank grids**; lattice with pre-drawn lattices; distributive property; halving and doubling | not graded | grid, lattice | digit-grid | regroup boxes are a toggle on the grid |
| Math-Aids (https://www.math-aids.com/Multiplication/) | 2-4 digit by 1-3 digit generator (12-25 per page); multiples of ten (vertical); powers of ten (horizontal); 0-99 two-factor | 3-5 | none | write | - |

## 9. Long division

| Source | Problem types and order | Grade | Visuals | Answer format | Edge cases |
|---|---|---|---|---|---|
| IXL grade 4 (https://www.ixl.com/math/grade-4 , https://www.ixl.com/math/division) | patterns over place values -> **numbers ending in zeros ÷ 1 digit** -> estimate with compatible numbers -> **pick the better estimate** -> 2d ÷ 1d using arrays -> using area models -> distributive property -> **2d ÷ 1d with quotients up to 10** -> 2d ÷ 1d -> complete the table -> 3d ÷ 1d area models -> partial quotients -> partial quotients with remainders -> larger numbers ÷ 1d -> inequalities -> estimate to compare; word problems incl. **interpret remainders** | 4 (4.NBT.B.6, 4.OA.A.3 per https://www.ixl.com/standards/common-core/math/grade-4) | arrays, area models | (name only) | the "quotient up to 10" rung is a remainder-fact rung before true long division |
| IXL grade 5 (https://www.ixl.com/math/grade-5) | patterns, ending in zeros, estimate (2-digit divisors), by 1-digit, interpret remainders, **by 2-digit: estimate and adjust** -> models -> partial quotients -> 2d / 3d ÷ 2d -> 4d ÷ 2d -> **adjust quotients** -> relate x and ÷ -> complete the sentence with 2-digit divisors | 5 (5.NBT.B.6) | models | (name only) | "adjust quotients" = the trial quotient is too big or too small |
| MW4K 2 ÷ 1 (https://www.mathworksheets4kids.com/2by1-division.php) | without remainder; **using grids**; with remainder; **fill in the missing digits of a worked long division**; word problems mixed; mixed remainder / no remainder; **bar models**; timed quizzes (25 or 50); horizontal with / without remainder; **divide and check by multiplying** | 3-4 | grid, bar model | digit-grid, write, check | remainder and no-remainder always separate sets before the mixed set |
| MW4K 3 ÷ 1 (https://www.mathworksheets4kids.com/3by1-division.php) | same pattern plus **area models in two levels (without, with remainder)**; divide and check = quotient x divisor + remainder; horizontal with remainder 15 per sheet | 4 | grid, area model | as above | - |
| MW4K larger (search result for https://www.mathworksheets4kids.com/3by2-division.php , /4by2-division.php) | 3d ÷ 2d on grids, 12 per sheet, remainder may or may not occur; 4d ÷ 2d on grids (G5-6). Snippets only; pages not opened | 5-6 | grid | digit-grid | - |
| K5 Learning (https://www.k5learning.com/free-math-worksheets/topics/division) | G3: "long division: division facts 1-100" without then with remainder. G4: **division facts in long-division form** -> 2d ÷ 1d -> 3d ÷ 1d -> 4d ÷ 1d, each without then with remainders; mental: whole tens / hundreds ÷ 1-digit, remainders within 1,000. G5: 2-digit divisors **10-25 first, then 10-99**; missing dividend or divisor; missing factor solved by long division | 3-6 | none | write | small 2-digit divisors (10-25) are their own step |
| Math-Drills (https://www.math-drills.com/division.php) | no remainders / with remainders / decimal quotients; divisor 1, 2 or 3 digits; **steps shown in the keys**; **grid-assisted: grid only, grid plus step prompts, blank grids**, each by remainder policy (none, some, all) | not graded | grid, prompts | digit-grid | - |
| Math-Aids (https://www.math-aids.com/Division/) | long division with 1-3 digit divisors and quotients, remainder option none / some / mixed, 9 or 12 per page; **short division** with divisors 2-9; "horizontal and long" mixed notation | 4-6 | none | write | - |
| CommonCoreSheets (https://www.commoncoresheets.com/division-worksheets) | **preparing for long division (how many times does one number fit in another)**; **checking division answers by multiplying**; understanding remainders in stories; finding remainders; horizontal division with remainder notation; 3 ÷ 1 with remainder; partial quotients; **dividing whole numbers with zero (zeros in the quotient)**; **vertical division with a helper grid**; 4 ÷ 2; writing a remainder three ways (5.NBT.6) | 4-5 as coded | helper grid, number line | digit-grid | a sheet exists only for quotient zeros - the same misconception as the rubric's "312 ÷ 3 = 14" row |

## 10. Missing addend, missing factor, equations

| Source | Problem types and order | Grade | Visuals | Answer format | Edge cases |
|---|---|---|---|---|---|
| IXL grade 1 (https://www.ixl.com/standards/common-core/math/grade-1) | 1.OA.D.8: complete the addition sentence to make ten (models, then bare); doubles complete the sentence; complete the addition sentence to 10; **complete the subtraction sentence to 10**; the same to 20; complete the addition **or** subtraction sentence to 20. 1.OA.D.7: which sentence is true; **which sign makes the sentence true**; addition sentences true or false; subtraction sentences true or false; complete equations to 20. 1.OA.B.4: relate + and -, use addition to subtract | 1 | models | (name only) | addition unknowns before subtraction unknowns before mixed |
| IXL grade 2 (https://www.ixl.com/math/grade-2) | complete the sentence; **balance equations**; which sentence is true - each for +, then -, then mixed, then again at two digits; **which sign (+ or -) makes the sentence true**; inequalities with + and -; write the + or - rule for an input / output table | 2 | - | (name only) | - |
| IXL grade 3 (https://www.ixl.com/math/grade-3 , https://www.ixl.com/math/mixed-operations) | multiplication: find the missing factor ({2,3,4,5,10}, then {6,7,8,9}, then all to 10, then to 12), **select the missing factors** (several correct), distributive property missing factor; division: find the missing number, select the missing numbers; mixed: x and ÷ facts find the missing number; complete the +, -, x or ÷ sentence; solve for the unknown number (x and ÷ only); write equations with unknown numbers for word problems | 3 (3.OA.A.4) | - | (name only) | the missing-factor ladder repeats the fact grouping |
| MW4K (https://www.mathworksheets4kids.com/addition.php , /two-digit-addition.php , /division.php) | ten-frame missing addend to make ten; **balance scales** (one missing addend; then two addends each side); dartboard rings with a missing addend; missing addend among three numbers read from a number line; division "complete the sentence" with the dividend, the divisor or the quotient missing; division balance equations | K-5 | ten frame, scale, number line | write, draw counters | the dedicated missing-addend page is members-only and was not read |
| K5 Learning (addition, subtraction, multiplication, division topic pages above) | missing addend to 10 (K), to 10 and 20 (G1), multi-digit (G2-5), **with 3-5 addends (G5)**; **missing minuend or subtrahend** (G1-5); tables with missing factors (G2-4); whole tens missing factor; missing dividend or divisor (G3-6); **missing factor solved by long division (G5-6)** | K-6 | none | write | minuend-unknown is named separately from subtrahend-unknown |
| Math-Aids (https://www.math-aids.com/Addition/ , /Subtraction/ , /Multiplication/ , /Division/) | missing addend (horizontal, placeholder character is a teacher choice); **"different formats"** (unknown position varies); missing addend to a multiple of ten; missing number subtraction; missing factor; missing number division with dividend, divisor or quotient replaced; missing digits for + and - | 1-5 | none | write | - |
| CommonCoreSheets (https://www.commoncoresheets.com/division-worksheets) | finding a missing number with inverse operations; **bar model to find a missing number** (part-part-whole and equal groups) | 3-5 as coded | bar model | write | - |

## 11. Mixed operations

| Source | Problem types and order | Grade | Visuals | Answer format | Edge cases |
|---|---|---|---|---|---|
| IXL grade 1 (https://www.ixl.com/math/grade-1) | fact families to 10; add and subtract with 0; + and - facts to 10; **sort + and - facts**; then facts to 20; ways to make a number | 1 | - | (name only) | sorting by operation or by result is a fluency format of its own |
| IXL grade 2 (https://www.ixl.com/math/mixed-operations) | + and - on number lines; + and - to 20; ways to make a number; balance; which sentence is true; rule of an input / output table; then the same block to 100 plus **"+ and - with two-digit numbers vertically"**, "which sign", "relate sentences", inequalities; then to 1,000 with "vertically" | 2 | number lines | (name only) | - |
| IXL grade 3 (https://www.ixl.com/math/mixed-operations) | relate + and -; add and subtract three-digit; complete the + or - sentence; **x and ÷ with 0 or 1 -> x and ÷ facts to 5 true or false -> to 10 -> true or false -> find the missing number -> select the missing numbers -> to 12**; then all four: facts, complete the sentence, add / subtract / multiply / divide, word problems; two-step word problems | 3 (3.OA.C.7, 3.OA.D.8) | strip models in word problems | (name only) | 0 and 1 first again |
| IXL grade 4 (https://www.ixl.com/math/grade-4) | add and subtract numbers ending in zeros; add, subtract, multiply, divide; **equations with mixed operations: true or false**; **comparison word problems: addition or multiplication?**; choose numbers with a particular sum / difference / product / quotient; inequalities; write and solve equations; understand parentheses | 4 (4.OA.A.2, 4.OA.A.3) | - | (name only) | an explicit add-or-multiply discrimination skill |
| MW4K (https://www.mathworksheets4kids.com/add-sub.php , /subtraction.php) | mixed + and - by grade K-4 up to 7 digits, vertical and horizontal; ten more / ten less; in-and-out boxes (apply the rule; write the rule); a missing-operator type (which of the four signs makes the equation true) is described in search snippets for the site but the page was not opened | K-4 | in / out boxes | write, write a sign | - |
| Math-Drills (https://math-drills.com/multiop.php) | mixed + and - (facts at 100 or 25 per page; multi-digit with a regrouping policy); mixed x and ÷ (incl. individual number focus 1-12); **+, - and x without division** as a differentiation step; all four; input / output tables with blank inputs or blank outputs; vertical and horizontal; large print | not graded | none | write | the three-operation set is a deliberate intermediate step |
| K5 Learning (topic pages above) | mixed + and - with 3-4 single-digit numbers (G1-2); mixed + and - word problems (G1-4); mixed x and ÷ word problems (G4); mixed four-operation word problems (G4-5) | 1-5 | none | write | - |
| CommonCoreSheets (https://www.commoncoresheets.com/subtraction-worksheets) | "solving mixed problems within 1000" (+ and - on one sheet; 2.NBT.7, 3.NBT.2) | 2-3 | none | write | - |

---

## 12. What MathQuest should adopt

Ordered by priority. Each line: what to add or fix; CCSS; the MathQuest skill id it extends (or NEW);
the existing GAP / PT id it confirms or amends; the evidence. "Option" means a variant or profile on an
existing skill (GAP-R-01), not a new skill id.

### P1 - needed for the first ladders

1. **Single-fact sets as the default unit for all four fact skills, with cumulative ranges as the only
   mixed form.** Option `facts:[n]` and `facts:{from:0,to:n}`. CCSS 1.OA.C.6, 2.OA.B.2, 3.OA.C.7.
   Extends `add_facts`, `sub_facts`, `mult_facts`, `div_facts`. Confirms GAP-1-01, GAP-1-02, GAP-1-04
   (P-FL-2, P-AT-5). Evidence: IXL "Adding 1 ... Adding 10", "Subtracting 1 ... 10", "Multiply n by
   numbers up to 10", "Divide by n" (grade-1 and grade-3 lists); MW4K single-number sets plus ranges
   0-2 ... 0-9 / 0-12 on all three facts pages; Math-Drills focus facts.
2. **Seed the 0 and 1 sets deliberately and late for + / -, early for x / ÷.** Addition and subtraction:
   the 0 set follows the 1-10 sets (IXL puts "Adding 0" / "Subtracting 0" last), and `n - n` rides with
   `n - 0` ("subtract zero and all"). Multiplication: x0 and x1 are the first two sets (IXL 3-O.1, O.2).
   Division: ÷1 is a set; `0 ÷ n` and `n ÷ n` are edge items; **÷0 is never generated**. CCSS 1.OA.B.3,
   3.OA.B.5. Extends the four fact skills' `edgeCases[]`. Matches L-1 step 13 and L-2 step 12; adds the
   x / ÷ ordering that the standard does not yet state.
3. **Fact-set teaching order for x and ÷: {0, 1, 2, 5, 10} -> {3, 4} -> {6, 7, 8, 9} -> {11, 12}
   (optional).** *Superseded by the owner ruling of 2026-09-19 (section 13, questions 1 and 2): {0, 1, 2, 5, 10}
   -> {3, 4, 6} -> {7, 8, 9} -> {11, 12}, and facts run to 12 by default.* IXL's fluency blocks are {2,3,4,5,10} then {6,7,8,9}; Math-Drills' anchor groups are
   {0,1,2,5,10}, {3,4,6}, {7,8,9}, {11,12}; K5 starts grade 2 with 2, 5, 10. The three sources agree that
   2, 5, 10 come first and 6-9 last; they disagree on where 6 sits. CCSS 3.OA.C.7. Extends `mult_facts`,
   `div_facts` ladder data (not the generator). NEW ordering data for P-AT-5.
4. **Both orientations as separate sections, and for division both notations (÷ and bracket) as separate
   sections.** CCSS 3.OA.C.7, 2.NBT.B.5. Extends all four fact skills plus `add_*`, `sub_*`. Confirms
   P-16, GAP-1-02. Evidence: MW4K keeps column and horizontal sets apart on every facts page; IXL has a
   distinct "... vertically" skill after each horizontal skill (2-N.7, N.14, N.18, P.8, Q.2, V.8, W.4);
   Math-Drills and Math-Aids offer ÷ and bracket as a choice; K5 has "division facts in long-division
   form" as the bridge into long division. Adopt K5's idea as a `format` step: **known facts rewritten
   under the bracket** before any multi-digit dividend (extends `div_facts`, feeds L-ladder for DV-07).
5. **Number profile with a three-way regrouping policy: none / some (mixed) / all, plus per-place control
   and `across_zero`.** CCSS 2.NBT.B.5, 2.NBT.B.7, 3.NBT.A.2, 4.NBT.B.4. Extends `add_*_no_regroup /
   _regroup / _mixed`, `sub_*` likewise, `add`, `subtract`. Confirms GAP-1-10 and amends it: today's twins
   cover none / all-or-some ambiguously; Math-Drills separates **some** from **all**; Math-Aids exposes
   none / some / all / across zero and a per-column regroup selector; IXL's fixed rung order is
   without -> with -> mixed at every number size.
6. **Across-zeros sub-ladder with zero count and zero position as the only changing thing.** Steps:
   one-digit from a whole ten -> two-digit from a whole hundred -> one zero in the tens (e.g. H0O form)
   -> zero in the ones and tens (whole hundred minuend) -> two zeros inside a 4-digit minuend -> three
   zeros (whole thousand) -> zero in the middle where the ones do **not** need regrouping (non-example).
   CCSS 2.NBT.B.7 (one zero), 3.NBT.A.2 (two zeros), 4.NBT.B.4 (runs of zeros). Extends `sub_100_regroup`,
   `sub_1k_regroup`, `sub_10k_regroup` via `profile.regroup: across_zero` + NEW `profile.zeros`.
   Confirms GAP-1-08 (notate-only across one and two zeros). Evidence: K5 grade-2 to grade-4 order; MW4K
   across-zero page incl. multiples of powers of ten; CommonCoreSheets one zero (2.NBT.5) -> "2 zeroes"
   (3.NBT.2) -> several (4.NBT.4); Math-Drills "zeros in the middle, ones always / sometimes regroup";
   IXL 2-V.4 and 3-H.7.
7. **Ragged lengths as an explicit profile value, introduced before equal lengths get large.** 2d + 1d,
   3d + 2d, 3d - 2d, 3d - 1d. CCSS 1.NBT.C.4, 2.NBT.B.5, 2.NBT.B.7. Extends `add_100_*`, `add_1k_*`,
   `sub_100_*`, `sub_1k_*` (`profile.ragged`). Supports L-3 step 8 and P-10. Evidence: IXL 2-N.1 / N.2,
   2-P.1-P.3; MW4K "3-digit minus 2-digit" placed before "3-digit minus 3-digit"; K5 "1 and 3 digit".
8. **Column sums of 3-5 multi-digit addends.** CCSS 2.NBT.B.6 (up to four 2-digit numbers), 3.NBT.A.2,
   4.NBT.B.4. NEW `add_column_multi` (confirms GAP-1-06). Evidence: IXL 2-N.15, N.17, N.18 ("three or four
   numbers vertically"), 3-G.11, 3-I.6, 4-D.6; MW4K "adding more addends" (3, 4 or 5); K5 "two to four
   2-digit numbers in columns", "up to 4 addends"; Math-Drills column addition of 3-6 numbers. Note the
   CCSS cap: 2.NBT.B.6 stops at four two-digit addends.
9. **Rewrite horizontal as vertical ("line-up") as a set-up-only step.** CCSS 2.NBT.B.5-7, 4.NBT.B.4.
   Extends add / subtract / multiply skills with `response: rewrite`. Confirms GAP-1-09. Evidence: MW4K
   "line-up subtraction" (rewrite then solve); MW4K word-problem sheets that require vertical set-up.
10. **Multiplication algorithm levels named by digit counts: 1x2, 1x3, 1x4, 2x2, 2x3, 2x4, 3x3, each
    with a preceding "multiples of 10 / 100" step.** CCSS 3.NBT.A.3, 4.NBT.B.5, 5.NBT.B.5. Extends
    `multiply` (`profile.digits`). Confirms GAP-1-15; amends it by adding 2x4 (K5 grade 5) and by placing
    `mult_zeros` (GAP-1-14) **before** the algorithm rather than at P2: IXL (3-U.1, 4-J.2, 4-K.1, K.2),
    K5 and Math-Aids all put whole tens / hundreds ahead of multi-digit multiplication. Also add IXL's
    "one digit by teen numbers" as the smallest 1x2 range.
11. **Long-division ladder rungs that the sites agree on:** (a) facts under the bracket; (b) 2d ÷ 1d with
    a one-digit quotient and a remainder ("quotients up to 10"); (c) 2d ÷ 1d, no remainder; (d) with
    remainder; (e) mixed; (f) 3d ÷ 1d, then 4d ÷ 1d, same triple; (g) **zero in the quotient** as a `case`
    step; (h) 2-digit divisors **10-25 first**, then 10-99; (i) estimate-and-adjust (quotient too big /
    too small). CCSS 4.NBT.B.6, 5.NBT.B.6. Extends `divide`, `div_remainders`, `long_div_2digit`. Confirms
    GAP-1-18, DV-06, DV-09; NEW: the zero-in-quotient case (CommonCoreSheets "dividing whole numbers with
    zero"; rubric misconception "312 ÷ 3 = 14") and the 10-25 divisor band (K5 grade 5).
12. **Unknown in every position for all four operations, one position per step, + before - before mixed.**
    CCSS 1.OA.D.8, 2.OA.A.1, 3.OA.A.4. Extends `missing_add_sub` (needs minuend-unknown and
    subtrahend-unknown as separately requestable variants - K5 names them apart), `missing_mult_div`
    (dividend / divisor / quotient / either factor), `cloze_addition`. Confirms P-16, Q-15, EQ-02.
    Evidence: IXL 1.OA.D.8 list order; MW4K division "complete the sentence"; Math-Aids "different
    formats" generators. The missing-factor ladder should reuse the fact grouping of item 3 (IXL 3-P.4,
    P.8, P.12).
13. **`wrongAnswer` + true / false + "find and fix" for facts and algorithms.** CCSS 1.OA.D.7, 3.OA.C.7.
    Extends `equal_sign` and the four fact skills; confirms GAP-1-24, TH types. Evidence: IXL has a
    "true or false?" twin for nearly every fact block (3-P.2, P.6, P.10, P.14; 3-X.2, X.5, X.8, X.12;
    3-BB.2, BB.4; 4-I.4).

### P2 - needed before the family is called done

14. **Decision ("choose the model") and partly worked ("complete the missing steps") rungs for
    multiplication and division.** CCSS 4.NBT.B.5, 5.NBT.B.5. Extends `area_model_mult`, `multiply`,
    `divide` via `decision(q)` and a scaffold level where some working digits are pre-printed. Evidence:
    IXL 4-J.6, J.12, K.6 (choose the area model) and 4-K.9, 5-D.9 (complete the missing steps); MW4K
    "fill in the missing digits" inside a worked long division (2by1 and 3by1 pages). This is P-9 applied
    to x and ÷ and is not yet in GAP-1-xx for multiplication.
15. **Missing-digit items for +, -, x at each size.** CCSS 3.NBT.A.2, 4.NBT.B.4. Option `type:
    missing_digits` on `add_*`, `sub_*`, `multiply`; one missing digit, then two. NEW (not in GAP-1-xx).
    Evidence: IXL 3-G.10, 3-H.11, 3-I.5, 4-D.7, 4-E.5; MW4K 2-digit addition and 3-digit subtraction
    pages (easy = one digit, moderate = two); Math-Aids missing-digits generators. Response stays a digit
    in a box, so it fits P-13.
16. **Fact-family types: sort family / not a family; find the missing member; fill blanks inside the four
    sentences; write all four; from an array; from a bar model.** CCSS 1.OA.B.3, 1.OA.B.4, 2.NBT.B.9,
    3.OA.B.6. Extends `add_sub_fact_family`, `mult_div_fact_family`, `number_families_*`. Confirms
    GAP-1-03, GAP-1-13, FF-12, FF-13. Evidence: both MW4K fact-family pages; Math-Drills partly filled vs
    all blank. Generator rules taken from the sites: exclude 0 and 1 from x / ÷ families by default
    (Math-Aids uses 2-11); flag doubles (only two distinct facts) and seed at most one per set as the P-10
    edge case; offer fixed-whole sets (all families of 10) as Math-Drills does.
17. **Discrimination sets: which sign (+ / -); + or x; add or multiply in comparison stories; missing
    addend vs missing factor.** CCSS 1.OA.D.7, 4.OA.A.2. Extends `mixed_add_sub`, `missing_add_sub`,
    `missing_mult_div`, `mult_comparison`; confirms GAP-1-11. Evidence: IXL "Which sign makes the number
    sentence true?" (1-Y.2, 1-Y.8, 2-Q.3), "Comparison word problems: addition or multiplication?"
    (4-G.9). Add Math-Drills' intermediate **+, -, x (no ÷)** mix as an `opMix` step between two-operation
    and four-operation sets on `mixed`.
18. **Division concept types: share into groups, make groups of n, repeated subtraction, number line; the
    same problem shown three ways.** CCSS 3.OA.A.2. Types on `div_facts` / `nl_div`, nearest
    `arrays_groups`. Confirms GAP-1-17, DV-01, DV-02. Evidence: MW4K hub (repeated subtraction, equal
    sharing, distributing objects, three division models); IXL 3-V.1 to V.9; CommonCoreSheets repeated
    subtraction on a number line with and without remainder.
19. **Equal-groups language ladder: describe groups -> write the sentence -> complete the sentence
    (missing factor from the picture) -> choose the sentence and draw.** CCSS 2.OA.C.4, 3.OA.A.1. Type on
    `arrays_groups`, `dot_array_mult`. Confirms GAP-1-16. Evidence: MW4K multiplication-models page; IXL
    3-N.1 to N.10 incl. "multiply by 0 or 1 with equal groups" (supports MU-01's empty-oval edge case).
20. **Check by the inverse, as its own rung for division first.** CCSS 4.NBT.B.6. Type on `divide`,
    `div_remainders` (quotient x divisor + remainder), later add / subtract. Raise GAP-1-21 from P3 to P2
    for division only: MW4K has "divide and check" on both long-division pages and CommonCoreSheets has
    "checking division answers"; none of the sites give the same prominence to checking addition.
21. **Bridging types the sites name that MathQuest lacks: "complete the next ten / hundred / thousand",
    "subtract from a whole ten / hundred / thousand", "add / subtract a multiple of 10 or 100".** CCSS
    1.NBT.C.4, 1.NBT.C.6, 2.NBT.B.8. Extends `add_sub_10s`, `add_sub_100s`, `make_ten` (options). Feeds
    item 6. Evidence: K5 addition and subtraction lists; IXL 2-N.3, P.4, T.1-T.3, V.1-V.3.
22. **Teen minuend minus one digit and 10 + n as their own sets.** CCSS 1.OA.C.6, 2.OA.B.2. Confirms
    GAP-1-05. Evidence: IXL 2-I.2; K5 "subtracting within 10-19" kept apart from "0-10"; K5 "adding 10 to
    a single digit".
23. **Dot-cue facts.** CCSS 1.OA.C.5. Confirms FF-07 / GAP-1-12. Evidence: Math-Aids "adding with dots",
    "subtracting with dots", "adding doubles with dots". No site read shows the four-part fade; that
    remains MathQuest's own design.

### P3 - optional

24. Lattice and box multiplication as optional second ladders (IXL lists both as extra skills under
    4.NBT.B.5; MW4K and Math-Drills offer pre-drawn lattices). Confirms GAP-1-22, MU-08, MU-10; P-2 keeps
    them off the first ladder.
25. Partial quotients / area-model division as the optional second division ladder (IXL 4-M.11 to M.13,
    5-E.10, E.11; MW4K 3by1 area models in two levels). Already `box_division_*`, `area_model_div_*`.
26. "Choose numbers with a particular sum / product", "ways to make a number", balance scales: good
    Stretch / Today's Number material (IXL 1-G.3, 4-D.8, 4-G.10; MW4K balance scales). Extends
    `balance_addsub`; low priority.
27. Input / output tables with + - x ÷ rules (IXL 2-J.6, 4-G.11, G.12; MW4K in-and-out boxes;
    Math-Drills). Already `function_table_easy / _hard`; only check the four-operation coverage.

### Things the sites do that MathQuest should NOT copy

| Practice seen | Where | Why not |
|---|---|---|
| Timed drills as the default (1 / 3 / 5 minute, five-minute frenzies, 25-in-3-minutes) | Math-Aids, Math-Drills, MW4K division pages | P-30: untimed by default; timing marks are options |
| 50-100 facts on a page | Math-Drills | P-FL-4 caps a probe at 20 (40 for families); Day bands of 30 or fewer |
| Themed art, riddles, colour-by-answer, cut-and-glue | MW4K | P-18 functional art only; age-neutral pages |
| Keyword-identification as the word-problem strategy | MW4K subtraction hub blurb | P-21: structure rule first; keyword panel is an option only |
| "Borrowing" / "carrying" wording | K5, MW4K, CommonCoreSheets blurbs | P-32: "regroup" only |
| European long-division layout, non-decimal bases, thousands separators other than the comma | Math-Drills | P-32 US conventions |

---

## 13. Open questions

1. **RESOLVED (owner, 2026-09-19): 6 sits with 3 and 4.** The x and ÷ fact-set teaching order is {0, 1, 2, 5, 10} ->
   {3, 4, 6} -> {7, 8, 9} -> {11, 12}; for + and - the 0 set comes last (`PEDAGOGY_STANDARD.md` P-FL-18). The
   question as asked: **Where does 6 sit in the multiplication order?** IXL groups it with 7, 8, 9; Math-Drills with 3 and
   4; K5 pairs "6 or 7" for division. The standard should fix one order for `mult_facts` / `div_facts`
   ladders. Suggested: 0, 1, 2, 10, 5, 3, 4, 6, 9, 7, 8 - but that is a house decision, not something the
   sites settle.
2. **RESOLVED (owner, 2026-09-19): facts run to 12 by default, with an option to limit to 10.** CCSS 3.OA.C.7
   requires one-digit factors only, so the limit stays available (P-FL-19). The question as asked: **Facts to
   10 or to 12?** IXL teaches to 10 first and repeats to 12; MW4K and Math-Drills offer both;
   CCSS 3.OA.C.7 requires products of one-digit numbers only. Should the default `mult_facts` range drop
   from "1-12" to "0-10", with 11-12 as an option?
3. **RESOLVED (owner, 2026-09-19): after.** Subtracting across zeros is its own sub-ladder after general
   regrouping (pedagogy L-5Z): from a whole ten / hundred / thousand -> one zero -> two zeros -> zeros in the
   middle, with the zero count or position as the only change per step. The question as asked: **Across
   zeros: before or after general regrouping?** IXL places it before at grade 2 (2-V.4) and
   after at grade 3 (3-H.7). The pedagogy standard's rung 8 ("special cases") implies after. Confirm.
4. **Does "some regrouping" need a controllable ratio?** Math-Drills and Math-Aids expose none / some /
   all but not a ratio. PROBLEM_TYPES AS-10 notes the ratio is not controllable today. Is a three-way
   policy enough, or does P-10 seeding need an exact count of no-regroup items per set?
5. **RESOLVED (owner, 2026-09-19): the unknown digit's box is dashed.** Dashed = unknown, which tells it
   apart from the solid regroup box (design standard LS-8, SL-10, VA-7). Item 15 can be built. The question as
   asked: **Missing digits: print response shape.** The sites print an empty box inside the column sum. Does
   that collide with the regroup-box shape in the design standard's answer-slot table (both are square
   boxes)? Needs a ruling before item 15 is built.
6. **IXL item formats were not seen.** The answer-format column for IXL is inferred from skill names.
   If exact interaction designs matter for print / screen parity (P-29), someone with the account
   credentials noted in `CLAUDE.md` needs to open a sample of the skills listed here (suggested sample:
   1-Q.3, 1-T.3, 2-V.4, 3-P.4, 3-P.13, 3-X.3, 4-K.9, 4-M.4, 5-E.16).
7. **MW4K PDFs were not opened.** Item counts, the exact grid drawings on the "division using grids" and
   "subtraction using grids" sheets, and the members-only missing-addend page should be checked by a
   logged-in reviewer before the digit-grid and missing-addend cells are finalised.
8. **Kindergarten subtraction on IXL** was truncated and not recovered; the K rows above cover addition
   only.
9. **Short division** (Math-Aids) is not in the pedagogy standard or PROBLEM_TYPES. Out of scope for a US
   Common Core build unless the international-school context wants it; confirm it stays out.
10. **CCSS grade ceiling for column sums.** 2.NBT.B.6 caps at four two-digit addends. `add_column_multi`
    needs a range rule so Level 2 pages never exceed that while Levels 3-4 may.
