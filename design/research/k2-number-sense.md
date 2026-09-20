# K-2 number sense: the content specification (P6)

Written 2026-09-20. Branch `sped-worksheet-standard`. This is the **content** specification for the
counting / comparing / composing family: what a correct K-2 number-sense ladder actually contains for an
ELL / special-education pupil at a Common Core school, where six items fill a sheet.

It is written in the shape of `design/research/operations-facts-v2.md` (P4), and it plays the same two
roles that document plays: research says *what to teach and in what order*; the design and pedagogy
standards say *how it looks and how it is scaffolded*, and they win every conflict (§1.4).

It supersedes nothing. It **builds on** `design/catalogue/k2-number-sense-place-value.md`, the per-skill
audit of the 66 ids in this family, which is the record of what each generator does today. That document
answers *what we have*. This one answers *what we teach, in what order, with what supports, what the pupil
writes and says, and which defects block which step*.

Nothing here changes code. No skill id is renamed, moved or removed by this document. Three of the 26 ids
in scope are misfiled and are reported, not moved (§0, rule 7).

## Related documents

| Document | What it governs | How this document uses it |
|---|---|---|
| `WORKSHEET_DESIGN_STANDARD.md` | The visual contract; §12 density and capacity | Every density check in §17 is a lookup in its §12.1 / §12.3 tables |
| `PEDAGOGY_STANDARD.md` | The teaching contract; P-1 … P-35, P-SC-*, P-AT-*, P-LG-* | Every ladder step is written to P-1, P-8, P-9, P-13, P-17 |
| `design/PAGE_TYPES.md` | Page roles and their anatomy; **§3.5 is this family's page type** | PT-KCT-1 … PT-KCT-7 are quoted throughout §5 … §14; the K one-pager cap is quoted in §17 |
| `design/PROBLEM_TYPES.md` | The problem catalogue and the print ↔ screen response modes | The response column of every ladder table |
| `design/SKILL_CELL_CONTRACT.md` | What a skill supplies; §3.6 option schema | §2.5 writes this family's option schema against it |
| `design/catalogue/k2-number-sense-place-value.md` | Per-skill verdicts, defects and line numbers | §18's gap table reconciles its CC / CMP / CM / OE sketches with this ladder set |
| `design/research/operations-facts-v2.md` | The operations specification | §2, §3 and §16 follow its conventions; the misconception ids M-A*, M-S*, M-T1, M-X1 are shared, not duplicated |

---

## 0. The rulings this specification is written to

Decided by the owner and already in force across P3-P5; not relitigated here.

1. **A skill NAME is its declaration.** "Count to 20" may not produce 34. Where a skill does something its
   name does not cover, the name is fixed; no exemption is added. §18.3 is the list for this family.
2. **Options are tick boxes, and ticked values are dealt round-robin off `state.itemIndex`, never rolled.**
   Every ticked value appears on the page. A `Math.random() < 0.25` branch is not an option; it is silent
   mixing (P-28). Thirteen ids in this family carry one.
3. **Options live on the skill, not the page**, and travel into every page role (P-AT-10, P-31).
4. **One instruction per section, at most 12 words, above the cells, never inside a cell** (P-LG-5, BD-10).
   A cell may carry a short **rule** reminder ("Ten ones make one ten."), which is a hint scaffold; it never
   restates the instruction. When the cell **draws** the item, `q.text` must not also state it in prose —
   `q.printText` carries the short paper wording and `print-generate.js` prefers it.
5. **Structural scaffolds persist at every level; hint scaffolds fade** in the fixed H1 → H5 order
   (P-7, P-SC-1 … P-SC-4).
6. **Any equivalent answer is accepted** unless the instruction says otherwise (P-LG-15). In this family that
   governs word form: "forty two", "forty-two" and "Forty-Two" are the same answer.
7. **No skill is ever spliced out of `SKILLS[category]`, and none is moved between categories.** Four
   positional share-code systems index by position. `fraction_number_line`, `whole_as_fraction` and
   `compose_whole` are grade-3 fraction skills sitting in `composing`; `odd_even` and `select_even_odd` are
   routed to the patterns generator by `skillCategoryOverride`. All five stay where they are. Retirement is
   a tombstone plus an alias in `js/modules/skill-aliases.js`.
8. **New skill ids append.** `tests/scripts/ws-code-snapshot.mjs` is built to allow it and prints a live
   count; today that count is **591** (572 pinned + 19 appended). See §18.4.

---

## 1. Method

### 1.1 What was read, and when

All pages read 2026-09-20, without logging in to anything. Membership PDFs were not opened; item counts and
sheet descriptions are as the public topic pages state them.

| Question this pass asked | Source read | Result |
|---|---|---|
| How do US worksheets arrange a countable set, and at what count does the arrangement change? | `mathworksheets4kids.com/counting.php`, `/counting-to-20.php` | Counting is sold in three bands — **to 5, to 10, to 20** — and at 20 the arrangement becomes a **double ten frame** ("Counting to 20 on Double Ten Frames": *observe the counters on the rectangular frames, count them, and record the number*). Below 10 the sets are pictured groups. No site read sells "scattered" as a named type; arrangement is implicit. Our PT-KCT-1 ladder (rows of 5 → ten-frame order → scattered) is MathQuest's own and is the ladder in §5. |
| Is **subitising** a worksheet type in its own right? | `mathworksheets4kids.com/counting-to-20.php`; `ixl.com/math/kindergarten`; a general search of printable subitising material | **Not on either primary reference.** MW4K folds it into "Counting and Cardinality" (*count objects up to 20 and circle the correct number*); IXL's K-A / K-B ("Numbers to 3", "Counting to 3") are counting skills. Dot-pattern / dice / ten-frame subitising cards are sold by teacher-made publishers (TPT, Teach Starter, United Teaching), which describe them as **cards and flash routines**, not worksheets. That distinction drives §6 and Q2. |
| What is the response repertoire at K, and how much writing does it carry? | `mathworksheets4kids.com/counting-to-20.php` | Nine subtypes, and the writing load is tiny: *circle the corresponding number of pictures*; *color the appropriate quantity*; *circle the correct number*; *record the number*; *make a one-to-one correspondence by matching the equal groups*; *draw a line to the corresponding number in its spelled-out form*. Six of the nine are a circle, a colour or a line — P-13's order of preference is what the world already does at K. |
| How are teen numbers taught as ten-and-some-ones? | `mathworksheets4kids.com/bundles-tens-ones.php` | The hardest-drilled step, exactly as the brief says. Five subtypes, graded K → 2: **"Composing and Decomposing \| Tens and Ones"** (K) is explicitly *numbers 11-19, composed of a ten and few ones*, in two parts — count the units and form the numeral, then group into a bundle of ten and decompose into tens and ones. Then bundles of sticks (grade 1, no regrouping), **"Bundling Shapes into Tens \| Regrouping Ones"** (grade 1: *check if they can make a ten, then exchange extra ones for tens*), grouping real-life objects (1-2), and 10 tens = 100 (grade 2). That is the BT ladder of §12 in the world's own order. |
| Do the sites separate "make ten" from "bridging ten"? | `mathworksheets4kids.com/making-10.php` (read in the P4 pass, `operations-facts.md` §1.1) | Yes: make-ten **on ten frames** (K, sketch the missing shapes and complete the equation) is a different sheet from addition within 20 **by** the making-10 strategy (grade 1). The first is TF-2 here; the second is **BT — bridging ten in `operations-facts-v2.md` §7** and is not duplicated in this document. |
| What is the comparing progression, and where do >, < and = enter? | `mathworksheets4kids.com/comparing-numbers.php`; `ixl.com/math/grade-2` §B | MW4K: *Count and Compare \| Single-Digit Numbers* → *Compare Numbers up to 10* → number lines → *up to 20* → balancing scale → *Write the Symbols \| 2-Digit Numbers* (*examine tens places, then ones places*) → 3-digit (circle the greater) → word problems → 4-digit → 5- and 6-digit → *Comparing Ten Frames*. The symbol arrives at "up to 10", i.e. **after** the pictured groups and **before** two digits. IXL grade 2 §B interleaves comparing and ordering to 100 then to 1,000, with a number line as a scaffold for both. |
| What is the counting progression to 120, and is it object counting? | `ixl.com/math/grade-1` §A, §B | §A **Counting to 100** (11 skills): *Counting review-up to 10, Count to fill a ten frame, Counting review-up to 20, Count on ten frames-up to 40, Count objects to 100, Count forward-up to 100, Count backward-up to 100, Number lines-up to 100, Count on the hundred chart, Hundred chart, Ordinal numbers.* §B **Counting to 120** (10 skills): *Write the number you hear-up to 120, Count objects to 120, Count up to find the next number-up to 120, Count down …, Count forward-up to 120, Number lines-up to 120, Count on a number chart-up to 120, Sequences-count up and down by 1, Writing numbers in words-convert words to digits, Writing numbers in words-convert digits to words.* Note that IXL **does** sell "Count objects to 120". We cannot (§1.4, row 1). |
| What does the hundred chart look like as a worksheet, and are there 120 charts? | `math-drills.com/numbersense.php` | Hundred charts, **120 charts** and 99 charts each in five variants: filled, blank, left-handed, **partially filled (20%)** and bottom-up. So "partially filled" is a named, standard type and 20% is a published blank share — the number our `blanks` option should default near. Counting worksheets there are ten frames (identify / draw), before-between-after, skip counting and number lines. |
| What is the before / after / between repertoire? | `mathworksheets4kids.com/before-after-between.php` | Two bands — **up to 20** and **up to 99** — and within each band three separate sheets: *Before and After*, *What Comes Between?*, and all three mixed. Plus number-line versions, circle/check versions, and cut-and-glue. The mixed sheet exists but it is the **last** of the three, never the first. That is P-1 confirmed by the world. |
| How is odd / even taught, and does the pairing model survive past 20? | `mathworksheets4kids.com/odd-even.php` | Fifteen subtypes. The model is first: *"Group in Pairs"* — *circle the pictures together* to see whether all pair. Then *"Writing Odd or Even"* on multi-digit numbers (the digit rule), *"Identifying Odd/Even Numbers"* (circle all), mazes, *"Count and Identify"*, and *"Sum and Difference"* — *find whether the sum or difference is odd or even* **without calculating**. The pairing model never appears above small counts; the digit rule replaces it. That settles OE-4 in §13. |
| What is the number-word repertoire and range? | `mathworksheets4kids.com/number-names.php`; `ixl.com/math/grade-2` §D | Charts (1-5, 1-10, 1-20, 1-50, 1-100), a K band (1-20) that is *match numbers with correct number words* and colouring, then ones/tens/hundreds (*write number names in both number word and standard form* — both directions on the same sheet), thousands, millions, billions, cut-and-glue and colour-by-name activities. **Neither primary source states a hyphen or "and" convention**, which is exactly why Q6 of the catalogue exists. |
| What does K5 sell at K? | `k5learning.com/free-preschool-kindergarten-worksheets/numbers-counting` | Five topics only: *Learning Numbers* (1-20 including printing), *Counting* (to 20, including skip counting, counting backwards and missing numbers), *Odd/Even* (all numbers less than 20), *Ordinal Numbers*, *More Than - Less Than* (comparing groups of objects **and** numbers). A far shorter list than MW4K's, and it is the list a K teacher actually uses. |
| What are the **real** misconceptions, so the error-analysis pages are not invented? | Gelman & Gallistel's five counting principles (1978) and Gelman & Meck's (1983) error-detection paradigm, via `dergipark.org.tr/tr/download/article-file/160898` and `prek-math-te.stanford.edu/.../The%20Principal%20Counting%20Principles.pdf`; the teen-word literature via `files.eric.ed.gov/fulltext/ED572391.pdf` (Gould, *Hurdles in Acquiring the Number Word Sequence*) and *The trouble with teens: Accessing the structure of number names* | Gelman & Meck's one-to-one trials are explicitly **"correct, in-error (skipped or double counted) and pseudoerror"** — the two one-to-one failures are named and separated in the literature, which is why M-C1 and M-C2 are two entries in §16 and not one. The teen literature names the reversal directly: children *"reverse the digits and say 41 instead of 14, or read 13 as 31"*, and *"will often write 41 for fourteen, simply because they hear the four first"*; Fuson's conclusion is that the teen words are mostly learnt as **separate new words** rather than as a structure, which is the justification for TN-6 and TN-7. |

### 1.2 What could not be read, and what that costs

- **IXL practice items were not opened.** Skill *names* and section structure are public; the items are not.
  This does not matter, because P-29 forbids copying an on-screen response format: our screen item is our
  printed cell with inputs in the blanks.
- **MW4K PDFs were not opened** (membership). Item counts per sheet are quoted only where the topic page
  states them, and the before/after page's "three sections" / "five questions" is the only such statement
  found in this family.
- **`mathworksheets4kids.com/ten-frames.php` and `/counting-20.php` return HTTP 404.** The live pages are
  `/counting-to-20.php` and `/kindergarten/making-10-ten-frames.php`.
- **The Gould ERIC PDF's text stream could not be extracted** (the file is a MERGA proceedings volume whose
  body is in compressed content streams). The teen-reversal claims above therefore rest on secondary
  summaries of it and of the *trouble with teens* paper, not on the primary text. Every teen misconception
  in §16 is tagged accordingly.
- **No login was used.** `credentials.md` exists where the project points, but every page needed for this
  pass was readable without it, so nothing was logged into and nothing was downloaded into the repo.

### 1.3 The state of this family, as it really is today

**Read this section's caveat first.** When this document was started, the operations gate did not cover this
family at all: `tests/scripts/ws-content-audit.cjs` line 44 read
`const CATS = ['addition', 'subtraction', 'multiplication', 'division']`, and **none of these 26 ids had
ever been audited**. So the numbers below were generated for this document, through the same mechanism the
gate uses — `generateQuestionFor({ category, skill, range: 100, decimals: 0, seed })` inside the Puppeteer
harness, 120 deterministic items per skill, `tests/lib/ws-harness.cjs` — and read back item by item.

**While this document was being written, a parallel wave rewrote `js/modules/gen-counting.js` (1,568 lines
changed) and extended the audit to this family.** So there are two snapshots, both real, and both are given
below, because the second is not yet committed and the first is what the catalogue records. **Snapshot A** is
the family as the catalogue describes it. **Snapshot B** is the working tree at the time of writing. Columns
that did not move are given once.

| Id | distinct / 120 (A → B) | answer types (A → B) | print formats | items with options (A → B) | max number | max prompt words (A → B) | `printText` (A → B) |
|---|---|---|---|---|---|---|---|
| `counting/count_objects` | 11 → 4 \* | 2 → **1** | 2 → **1** | 30 → **0** | 20 | 7 → **4** | 0 → **120** |
| `counting/count_sequence` | 35 → 45 | 1 | 1 | 0 | **19** (both) | 5 → 4 | 0 → **120** |
| `counting/number_seq_fill` | 1 \* (both) | grid-fill | 1 | **120** (both) | — | 5 | **0** (both) |
| `counting/mixed_counting` | 34 (both) | 3 → 2 | 3 → 2 | 54 → 46 | 19 | 7 → 5 | 0 → 74 |
| `comparing/compare_groups` | 3 → 12 | multiple-choice → **text** | 1 | **120** → **0** | — | 7 → 6 | 0 → **120** |
| `comparing/compare_objects` | 6 (both) | 2 → **1** | 2 → 1 | **120** → **0** | — | 7 → 4 | 0 → **120** |
| `comparing/classify_count` | 96 → 4 \* | 2 → **1** | 2 → 1 | 29 → **0** | — | 5 → 6 | 0 → **120** |
| `comparing/mixed_comparing` | 41 → 22 | 3 → 2 | 2 → 1 | 91 → **0** | — | 7 → 6 | 0 → **120** |
| `composing/number_bonds` | 72 → 63 | 2 → **1** | 2 → 1 | 0 | 10 | **17** → **4** | 0 → **120** |
| `composing/make_ten` | 16 → 9 | 2 → **1** | 2 → 1 | 0 | 10 | 11 → 6 | 0 → **120** |
| `composing/teen_compose` | 27 → 18 | 2 → **1** | 2 → 1 | 0 | **19** (both) | 10 → 4 | 0 → **120** |
| `composing/tens_foundation_visual` | 9 → 1 \* | number | tens-foundation | 0 (both) | — | 3 → 4 | 0 → **120** |
| `composing/hundreds_chart_fill` | 68 (both) | number | hundreds-chart-fill | 0 (both) | — | 6 → 4 | 0 → **120** |
| `composing/ten_frame_build` | 10 (both) | ten-frame-build | 1 | 0 | 10 | **16** → 7 | 0 → **120** |
| `composing/ten_frame_build_teen` | 10 → 9 | ten-frame-build | 1 | 0 | **20** → **19** | 13 → 7 | 0 → **120** |
| `composing/base10_build` | 63 (both) | base10-build | 1 | 0 | 99 | 7 → 6 | 0 → **120** |
| `composing/base10_regroup` | 64 (both) | base10-build | 1 | 0 | 97 | **20** → 9 | 0 → **120** |
| `composing/base10_build_hundreds` | 108 (both) | base10-build | 1 | 0 | **984** (both) | 11 → 7 | 0 → **120** |
| `composing/odd_even` | 104 | 3 | odd-even | 51 | 100 | 5 | **0** | 
| `composing/select_even_odd` | 2 \* | multi-select-check | multi-select | **120** | 100 | 5 | **0** |
| `composing/number_word_form` | 75 | 3 | 2 | 22 | 100 | 8 | **0** |
| `composing/fraction_number_line` | 38 | 3 | 1 | 28 | 8 | 12 | **0** |
| `composing/whole_as_fraction` | 16 | fraction-input | 1 | 0 | 10 | 8 | **0** |
| `composing/compose_whole` | **1** | compose-fraction-tiles | 1 | 0 | 1 | 9 | 120 |
| `composing/mixed_composing` | 96 → 89 | **10** → 9 | **10** → 9 | 13 | **958** (both) | 20 → 11 | 6 → 82 |
| `counting_mixed/counting_all` | 92 → 85 | **12** → 11 | **11** → 10 | 33 → 15 | **724** (both) | 20 → 12 | 7 → 91 |

The last eight rows are generated by `gen-algebraic.js` and `gen-fractions.js`, not `gen-counting.js`, and
**did not move at all** between the two snapshots. Zero console errors in both sweeps.

**What snapshot B already fixes, and what the ladder still needs.** The parallel wave has closed, for the
`gen-counting.js` ids: the random multi-select branches (options fell from 30 / 120 / 120 / 29 / 91 to
**zero** on five ids), the emoji, the colour (the cells are now `#000000` on white in Andika), the mouse
prompts, and the missing `printText` (0 → 120 on fourteen ids, so the printed cell no longer says what the
screen says). That is §18.5 items 2 and part of 1, done. **Three defect classes survive in snapshot B** and
are what the ladder still has to be built against:

1. **The answer is still in the hint on four ids** — `make_ten`, `ten_frame_build`, `base10_build`,
   `base10_regroup`, `base10_build_hundreds` all put the decomposition in `q.hint` on **120 of 120** items.
2. **The band still does not bind.** `count_sequence` never leaves 1-20 and `base10_build_hundreds` still
   reaches **984**, both at Max Number 100.
3. **The banned verb is back.** Five of the new pupil-facing `printText` strings begin with **"Tick"** —
   *"Tick the box with more."*, *"Tick the box with fewer."*, *"Tick same or not the same."*,
   ``Tick the ${attr.word} ${attr.noun}.`` — and `PEDAGOGY_STANDARD.md` §10.2 removed `Tick` from the print
   verb list on 2026-09-19, with P-LG-14 stating that it *"is not used anywhere a pupil reads (US
   conventions, P-32)"*. The library string for this response is **`rule-yes-no` / "Check one box."**
   This is a live regression in uncommitted work, not a legacy defect, and it is reported so it is caught
   before it is committed.
4. **`compare_groups` has lost half of its own name.** Re-measured independently on 2026-09-20, all 120
   items are `Do the boxes have the same number of ___?`. **`more` and `fewer` are never dealt**, the key
   is only ever `same` or `not the same`, and every item is therefore a 50/50 guess. The skill is called
   *More/Fewer/Same Groups*. The repaint that closed its colour, capitals and option-button defects also
   narrowed its content to one of its three question types. This is the content gate's own rule — the name
   is the contract — failing inside the family the gate was just extended to cover, and it is a second live
   regression in the same uncommitted work. CP-1 … CP-6 in §8 are the three types as dealt steps, which is
   where this should land.

**\* Four of the five "1 to 4 distinct" readings are fingerprint artefacts, not generator defects, and the
operations wave's lesson is why every one of them was dumped item by item before being written down.**

- `number_seq_fill` has a constant `q.text` ("Fill in the missing numbers.") and an **empty** `q.visual`;
  the item lives in `q.gridFill`. The answers do vary — `[5,47,51,64,82,90,92]`, `[60,100]`, `[48,77,84]`,
  `[10,30,70]`, `[30,50]`. So distinctness is fine. What the dump **does** expose is worse than repetition:
  the four `options` are the answer string with a digit stuck on the end — `"5,47,51,64,82,90,922"`,
  `"…921"`, `"…923"` — a four-way multiple choice on screen against a write-in on paper (P-29), with
  distractors no pupil could take seriously. And item 0 has **seven** blanks on a 1-100 chart while item 3
  is a **count-by-tens strip** (`10, 30, 70`): two different skills, on one page, with no teacher control.
- `select_even_odd` has one of two constant texts and an empty `q.visual`; the item lives in `q.options`.
  The six tiles do vary (`3, 54, 62, 21, 9, 71` / `74, 6, 85, 39, 83, 66` / …) and the correct count varies
  2-4. Distinctness is fine. The real defects are the wording ("Click ALL the ODD numbers." — a mouse verb
  and two words in capitals, P-LG-14 / P-14) and that **0 never enters the pool**, so the one number this
  skill exists to settle never appears.
- `count_objects`, `classify_count` and `tens_foundation_visual` read as 4, 4 and 1 distinct **in snapshot B
  only**, and for the same reason: the parallel wave moved the wording into a short constant `printText`
  ("Count. Write how many.", "Write how many tens.") and the item into an SVG with no text in it, so a
  text-keyed fingerprint collapses. The answers vary — `count_objects` gives 19, 13, 4, 13 over four
  consecutive seeds and `tens_foundation_visual` gives 7, 8, 9, 1. **Neither is a repetition defect.** The
  same trap caught the operations wave twice; any gate extended to this family must fingerprint the drawn
  item, not `q.text`.
- `compose_whole` **is** one item in 120, in both snapshots: every sample is the same string. It cannot fill
  a page, a Test A / B or a key. It is a grade-3 fraction skill and belongs to the fractions review (§0 rule
  7), but the defect is recorded here so no skill is unaccounted for.

Two catalogue claims **do not reproduce in either snapshot** and are withdrawn:
`composing/hundreds_chart_fill` and `composing/tens_foundation_visual` were recorded as building
`q.options` on a numeric answer (multiple choice on screen, write-in on paper). Across 120 items each,
**neither emitted a single option**. Both are clean on that count; `design/catalogue/k2-number-sense-place-value.md`
is corrected in the same wave as this document.

Four further defects the dumps make concrete. The first is **closed in snapshot B**; the other three are
**live in both**:

1. ~~**`count_objects` rolls an emoji multi-select branch.**~~ In snapshot A, 30 of 120 items were
   `Click ALL groups that show 7.` with options whose `svg` was `<span …>🍎🍎🍎🍎🍎🍎🍎</span>`, and the
   counted branch drew in colour (`#e53935` hearts, `#fb8c00` stars, `#1e88e5` circles) using a **heart**,
   which is not in PT-KCT-7's approved eight. **Closed in snapshot B:** one answer type, no options, and the
   cell is `#000000` on white in Andika. CT-10 in §5 keeps the group-matching item as a **step of its own**,
   with drawn groups and no emoji, because it is a good item in the wrong place — not a bad item.
2. **`odd_even` rolls three answer types on one page, and one of them cannot print a key.** The dump gives
   `Is 57 odd or even?` (multiple-choice), `Which number is odd?` (text), and `Click all the ODD numbers.`
   / `Click all the EVEN numbers.` whose `ans` is **`"2,3,4"` and `"0,2,3,4"` — tile indices, not numbers.**
   An answer key generated from that prints index positions. `gen-algebraic.js`, untouched by either wave.
3. **`base10_regroup` never regroups.** The prompt shortened from twenty words to nine in snapshot B, but
   `q.ans` is still the **build target**, the answer type is still `base10-build`, and nothing in the item,
   the check or the key involves a trade. In snapshot A the wording was verbatim *"Build 75 with base-10
   blocks, then use the "Decompose 1 ten" button to regroup. The total must still equal 75."* The name is
   false (§18.3).
4. **The two mixed pools draw grade-3 fraction content onto a K-2 page.** `counting_all` emits 12 answer
   types and 11 print formats including `compose-fraction-tiles` and `fraction-number-line`, and reaches
   **724**; `mixed_composing` reaches **958**. Snapshot B trims each by one format and neither drops the
   fraction ids. A pupil who picks "All Counting & Cardinality" can still be handed unit-fraction tiles.

And one thing was already right before either wave, which the ladder should build on rather than replace:
**`count_sequence`'s number path.** It was the only cell in the family already drawn in black and white
(`fill:#fff stroke:#000`, no purple title band), and it is the correct cell. Its remaining defect is the
band that never leaves 1-20 (19 was the largest number in 120 items). SQ-1 … SQ-3 in §7 are written
against a cell that is already close to right, not against a broken one.

> **SNAPSHOT C, measured independently 2026-09-20 after this section was written.** `gen-counting.js` moved
> again between snapshot B and this re-measure, and two defects recorded above for `count_sequence` are now
> **closed** and are struck here so nobody sets out to fix them twice:
> ~~the missing "between"~~ — the three forms now deal 40 / 40 / 40 (`What number comes after N?`,
> `What number comes before N?`, `What number goes between N and N?`), and
> ~~the path prints the answer~~ — over 120 items the answer's numeral appears **0 times** among the
> numerals drawn on the strip. `What number comes before 16?` now prints `16 17 18 19` with the blank to
> the left of 16, so "before" must be counted back. The capitals are gone too: no instruction or path
> label in the 120-item dump is in capitals. What SQ-1 … SQ-4 still need from this id is `ask` as an
> option rather than a coin flip, and the 120 band (SQ-5).

**The gate, as of this writing, and as re-run afterwards.** The parallel wave has extended
`ws-content-audit.cjs` to this family, which is §18.5 item 1 done; the run reads `189 operations + K-2
skills` and is **red**. At the time this section was first written it failed five ids
(`comparing/classify_count`, `comparing/mixed_comparing`, `composing/number_word_form`,
`composing/compose_whole`, `counting_mixed/counting_all`) on the classes `picture-count`, `cell-shape` and
`variety`. **Re-run independently 2026-09-20 after the generator moved again, it fails two:**

```
By family:
  operations  163 skills, 0 failing
  k2           26 skills, 2 failing: number_word_form, compose_whole
           1  cell-shape
           1  variety
ws-content-audit: FAIL - 2 of 189 operations + K-2 skills, 240 items each, Max Number 100
```

`FAIL composing/number_word_form` is `[cell-shape]` — three cell shapes on one page, `picture:text` 39%,
`picture:number` 39%, `select` 22%. `FAIL composing/compose_whole` is `[variety]` — 1 distinct item in 240.
**The `picture-count` class no longer fires anywhere in this family**, and that was independently
confirmed rather than taken from the gate: every countable cell was rendered, the marks in its SVG counted
by kind, and the count compared to `q.ans` —

| Id | items whose picture was counted | key ≠ picture |
|---|---|---|
| `count_objects` (shapes drawn = answer) | 120 / 120 | **0** |
| `classify_count` (count of the **named kind** only, plus the key swatch) | 120 / 120 | **0** |
| `mixed_comparing` (its `classify_count` share) | 39 / 120 | **0** |
| `compare_groups` (marks in box A vs box B vs the same / not-the-same key) | 120 / 120 | **0** |
| `compare_objects` (the two bars measured, against taller / shorter / thicker / thinner) | 120 / 120 | **0** |
| `make_ten` (solid cells = 10 − answer) | 120 / 120 | **0** |
| `teen_compose` (solid counters = the teen total) | 120 / 120 | **0** |
| `tens_foundation_visual` (rods drawn = answer) | 120 / 120 | **0** |
| `count_sequence`, `hundreds_chart_fill` (answer must **not** be among the printed numerals) | 120 / 120 each | **0** |

The one apparent leak, `number_bonds` printing its own answer on 22 of 120 items, was dumped and is not a
leak: all 22 are **doubles** (`3 + ? = 6`, `2 + ? = 4`), where the printed part and the answer are the same
number by arithmetic. It is a real pedagogical note for §10 — doubles should be their own dealt step, not
a fifth of a random page — but it is not a picture-key contradiction.

Those two remaining failures are in that wave's uncommitted work and in the generators this document does
not own (`gen-algebraic.js` and `gen-fractions.js` respectively — neither wave touched either), and both
are ids this document already marks REDO or FIX for independent reasons.

### 1.4 Where the research and the standards disagree

Recorded, not followed. This table is the reason the document exists.

| The sites do this | We do not, because |
|---|---|
| IXL grade 1 §B sells **"Count objects to 120"** | A page holds six items and a cell holds a countable set. 120 drawn counters is not a cell; it is a poster. **Object counting stops at 20** (double ten frame, PT-KCT-1) and everything above 20 is counted in **tens** (§12 BT) or **on the chart** (§7 SQ). This is the single biggest structural difference in the family and it is the answer to the owner's third question (Q3) |
| 20-50 items on a K counting sheet; MW4K's before/after sheets run "three sections" | `WORKSHEET_DESIGN_STANDARD.md` §12.1: Independent 6, or up to 16 for one-symbol answers. `design/PAGE_TYPES.md` §3.5 caps the K count cell at 14 / 12 / 10 and the double-ten-frame cell at 7 / 6 / 5 |
| Bundle "before", "after" and "between" onto one mixed sheet | P-1. MW4K itself puts the mixed sheet **third**; we make each its own step and the mixed page a Review |
| Bundle count-and-colour, count-and-circle and count-and-write on one page | P-28. One problem type and one notation per section |
| Teach odd/even with mazes, colour-by-number and "find the path" | P-18: art is functional only. A maze is a decoration with a number printed in it. The pairing model, the digit rule and the check-all page carry the whole skill |
| Tell the groups apart by **colour** (MW4K's group A / group B art; our own `compare_groups` at `#1e88e5` and yellow) | The pages are black and white and photocopy-safe (design standard §4.1, P-SC-8). Groups are told apart by a **label** and by their box, never by fill |
| Offer "count and colour" as a response | P-13 prefers circle / check / match / shade. Colouring **is** shading and is allowed; colouring *by a colour key* is not, because the key is the answer and it cannot print |
| Put comparing 4-, 5- and 6-digit numbers in the same topic as comparing groups | Grade band. CP stops at 3 digits; the larger bands belong to the place-value ladder (`placevalue:compare`) and are out of this family's scope |
| Say "tick" / "Click ALL" / "Drag" | P-32 (US conventions; `Tick` was removed from the verb list) and P-14. The screen verb map is fixed: Circle → Tap, Check a box → Tap, Write → Type. A mouse word never prints |
| Teach subitising from flash cards | We agree, and that is exactly the problem: a flash routine is not a printable item. §6 and Q2 |
| Treat 11 and 12 as teen numbers | Fuson: the teen words are learnt as separate words, and eleven / twelve carry **no** -teen cue at all. They get their own step (TN-6), and the "ten and some more" steps run **13-19** |

---

## 2. The generator contracts the rulings imply

Stated once here so §5 … §14 can assume them.

### 2.1 What "within N" means when there is no operation

P-35 bounds the **answer**. In this family the answer is usually a count, a position or a digit, so the band
reads differently per skill and must be declared, not inferred from the id:

| Skill shape | The band caps | Consequence |
|---|---|---|
| Count a set | the **count**, which is also the number of objects drawn | "Count to 20" may not draw 34 counters, and may not draw 34 and ask for something else |
| Number sequence (before / after / between / count on) | the **numbers on the strip**, both the given and the answer | "to 20" means no numeral on the path exceeds 20. A band of 120 is a different step |
| Chart fill | the **chart**, not the blanks | A 1-100 chart and a 10-100 count-by-tens strip are different charts and different skills (§18.3) |
| Compare / order | the **larger number** | "Compare to 10" may not print 34 |
| Ten frame / bond | the **whole** | A bond page has **one whole**, named in the title (P-LG-16's rule for fact sets, read across) |
| Base-ten build | the **target number** | `base10_build_hundreds` reaching **984 at Max Number 100** is the same class of failure P-35 was written for |
| Odd / even | the **number judged** | The pairing model is impossible above ~20 (§17); above it the band is the digit rule's band |
| Word form | the **number**, and therefore the **length of the written answer** | This is the only skill in the family where the band governs the *answer slot width*, not just the value |

**Consequence the sweep already proves:** `base10_build_hundreds` reaches 984 and `base10_build` reaches 99
whatever Max Number says; `count_sequence` never leaves 1-20 whatever Max Number says. The band is ignored in
both directions. A band the generator cannot keep is refused in the dialog (VA-R-07), never silently relaxed.

### 2.2 Arrangement is content, and it is dealt, not rolled

PT-KCT-1 makes arrangement a per-section choice: **scattered** (n ≤ 10 only), **rows of 5**, or **ten-frame
order**. Counts 11 to 20 are never scattered. Three rules follow:

- Arrangement is a **tick-box set** on the skill. Ticked values are dealt round-robin off `state.itemIndex`,
  so a page with two arrangements ticked alternates them; a page with one ticked shows one.
- A section with one arrangement ticked is **not** mixed and its instruction does not say "mixed" (P-28).
- **The scattered cell needs a mark.** A scattered set has no path through it, so M-C1 (counting an object
  twice) is not a slip, it is the predictable result. The scattered step's instruction carries a second verb:
  `count-cross` — "Cross out each one. Write how many." That is a low-load written response (P-13) and it is
  the only honest way to assess one-to-one correspondence on paper.

### 2.3 PT-KCT-2's fade and the ladder's arrangement delta collide, and the ladder wins

`design/PAGE_TYPES.md` PT-KCT-2 says the scaffold fade inside one step **is** the arrangement: Model =
ten-frame order with a worked answer, Guided = rows of 5 with a grey trace numeral, Independent = scattered
with an empty square. But P-6 says the format never changes inside a step, and §5 makes arrangement a step
delta. Both cannot hold.

**Ruled here, and put to the owner as Q1:** the ladder wins. Arrangement is fixed across every page role of a
step; the fade inside a step is the **trace numeral** (level 3 → 2) and the **caption** (H2), not the
arrangement. PT-KCT-2's arrangement ladder still applies, but only to a skill printed **stand-alone from the
dialog with no step chosen**, where there is no ladder to obey.

### 2.4 Edge cases are content, not accidents (P-10)

Each of these must be **generable** and must appear in any seeded set of six or more:

| Skill | The edge items | Why |
|---|---|---|
| Count a set | **0** (an empty box) and **1** | "How many?" with nothing to count is the cardinality question in its purest form; a set of one is the one case where counting and subitising cannot be told apart |
| Ten frame | **0**, **5** (the half line) and **10** (full) | The half line is the structure of the frame; a full frame is the boundary with the teen ladder |
| Number bond | **0 and the whole** (`10 = 0 + 10`) and the **double** (`10 = 5 + 5`) | M-N3 and the double are where a pupil's "two different parts" rule breaks |
| Teen | **11, 12** (no -teen), **13, 15** (irregular prefixes), **19 → 20** (the rollover) | Fuson; §1.1 |
| Tens | **0 tens** and **10 tens** | Today `tens_foundation_visual` gives 1-9 only: 9 distinct items in 120 |
| Base-ten build | a **zero in the ones** (40), a **zero in the tens** (305), and a **teen** (14) | M-K4, and 305 is the whole reason PV-8 exists in the catalogue's ladder |
| Compare | **equal** numbers, **different lengths** (98 vs 102), and **same leading digit** (34 vs 38) | M-P5 and M-P4 are unreachable without them |
| Odd / even | **0**, a number with a **2 in the tens** (24, 42), and a number whose **leading digit's parity differs** from the ones' (34) | M-E1, M-E2, M-E3 — today 0 never appears in `select_even_odd`'s pool |
| Word form | a **zero place** (305), a **teen** (14), a **tens word** (40) | M-W3 and M-W4 |

### 2.5 The skill's option schema (against `SKILL_CELL_CONTRACT` §3.6)

A K-2 number-sense skill declares these, as **tick-box sets with one default**. They travel with the skill
into every page role, on paper and on screen, and are saved and shared with it (P-AT-10, P-31).

| Option | Values | Applies to | Default |
|---|---|---|---|
| `band` | 5, 10, 20, 50, 100, 120 | every counting, sequence, compare and chart skill | the step's; 20 on a stand-alone print |
| `arrangement` | rows of 5 / ten-frame order / scattered (n ≤ 10) / double ten frame (11-20) | count skills | rows of 5 |
| `objects` | plain counters / the 8 line-art pictures | count and compare skills (P-31, PT-KCT-7) | plain counters — **see Q4** |
| `objectKind` | one kind per cell, ticked from the set | count skills | one kind, dealt per section |
| `response` | write the number / circle one of three numerals / draw the set / match with a line | count skills (PT-KCT-4) | write the number |
| `ask` | after / before / between / count on | sequence skills | the step's, one per section |
| `chart` | strip 1-20 / chart 1-100 / chart 1-120 / count-by strip | chart skills | the step's, **never two in one section** |
| `blanks` | 1, 2, 3, or a share (10%, 20%) | chart skills | 1 on a strip, 20% on a chart (math-drills' published share) |
| `blankPattern` | scattered / one row / one column / one decade boundary | chart skills | scattered |
| `compareAsk` | more / fewer / same / greater / less | compare skills, one per section | the step's |
| `compareForm` | circle a box (K) / circle the numeral / write the symbol | compare skills (PT-KCT-5) | the step's |
| `lengths` | equal / mixed | compare and order skills | equal first |
| `whole` | 5, 6, 7, 8, 9, 10, 20, or a teen | bond and ten-frame skills | the step's, **one whole per section** |
| `unknown` | part / whole / both parts | bond skills | part |
| `teenRange` | 13-19 / 11-12 / 11-19 | teen skills | 13-19 (Q5) |
| `places` | tens / tens+ones / hundreds | base-ten skills | the step's |
| `zeroPlace` | on / off | base-ten and word-form skills | off, then on as its own step |
| `renameDir` | standard → renamed / renamed → standard / both | `base10_regroup` | standard → renamed |
| `parityModel` | paired counters / ones-digit rule / none | odd-even skills | the step's; the model is unavailable above 20 |
| `wordTask` | numeral → words / words → numeral / match from a bank | word-form skills | match from a bank, then numeral → words |
| `responseScope` | `decision` / `notation` / `judge` / `answer-only` / `full` | all | `full` |
| `scaffoldLevel` | 3 / 2 / 1 / 0 | all | the page role's |

There is **no `setup` scope in this family**: nothing here is rewritten from horizontal to vertical. That is
the one of the four operations scopes that does not cross over (`design/catalogue/…` host notes say the same).

### 2.6 Response-mode parity, stated once

P-29. Every id in the sweep that reports `options` on a numeric or text answer is a parity break:
`number_seq_fill` (120 of 120), `compare_groups` (120 of 120), `compare_objects` (120 of 120),
`select_even_odd` (120 of 120), and the multi-select branches of `count_objects` (30), `classify_count` (29),
`number_word_form` (22) and `odd_even` (51). Two of those are legitimate **choice** items on paper and keep
their options — `count_objects`'s circle-a-numeral response (PT-KCT-4) and `compare_groups`'s circle-a-box
response (PT-KCT-5) — but both print as a **circle round printed marks**, not as buttons, and both need at
most three choices, not a two-way guess.

---

## 3. How to read a ladder step

Every row of §5 … §14 carries the six things the brief asks for. Two are per-ladder rather than per-step,
because they do not change inside a ladder and repeating them would hide the ones that do.

| Field | Where it lives | Why |
|---|---|---|
| **The one change** | the `One change` column | P-1. Exactly one of range / representation / format / unknown / opMix / scaffold / responseScope |
| **Structural scaffolds** | the ladder's header block | They persist at every level and are removed only by a `fade` step, which appears in the table as a row |
| **Hint scaffolds** | the `Cell` column names the ones the step adds or drops | They fade in the fixed H1-H5 order of P-4.2 |
| **The written response** | the `Response` column | P-13's order of preference: circle, check, match, shade; then a digit in a box; then a number on a line with its unit word pre-printed |
| **Misconceptions** | §16, the bank, by id, with the step they first bite at | Because they recur across steps and because the error-analysis, True or False? and Reason It generators need one bank, not 26 scattered lists |
| **Density** | §17, one row per cell shape | Because density is a property of the cell, not of the step |

### 3.1 The response scopes that this family actually uses

P-9 and P-AT-6. The unused parts of the cell are **absent, not greyed**, so the pupil is not tempted to solve.

| Scope | What is in the cell | What is **absent** | Instruction key | Response | Page-role cap (S / M / L) |
|---|---|---|---|---|---|
| `decision` | the two things to compare, or the one number, plus two check boxes and the rule in a rounded box | the answer slot entirely | `rule-yes-no`, `circle-bigger`, `decide-regroup` (read as "are there enough ones?") | one checked box, or one circle | 12 / 8 / 6-8 |
| `notation` | the marks of one sub-step: the pairs ringed, the ten bundled, the tens and ones written | the total | `notate-regroup`, `ring-groups` | the marks, or two digits | 6 / 6 / 6 |
| `judge` | a finished item printed in **black**, about half of them wrong from §16 | — | `check-fix` (pupil then writes the number) or `judge-correct` / `judge-not-correct` (pupil writes nothing) | one checked box, plus a number for `check-fix` | 6 / 4 / 2-4 |
| `answer-only` | the picture and the answer slot | every working mark | `count-write`, `compare`, `missing` | one number or one symbol | by the cell's table (§17) |

`judge` is the most valuable scope in this family and the least used today: **not one of the 26 ids can
produce a judge page.** A counting error is invisible in a number (4 and 5 look equally plausible) but
completely visible in a **drawn** count, so "this pupil counted these; is it right?" is the page that teaches
one-to-one correspondence. See §15.

### 3.2 Where this family ends and another begins

Three boundaries, so no step is written twice:

- **Make ten to add** (`8 + 5 = 8 + 2 + 3`) is `operations-facts-v2.md` §7 (BT), not here. §11 TF-2 teaches
  *how many more to make ten* as a **bond**, which is its pre-skill, and stops.
- **Skip counting** by 2s, 5s, 10s and 100s is the patterns family's ladder. `number_seq_fill`'s `10-100`,
  `100-1000` and `1000-10000` variants belong there, not to §7 SQ.
- **Place value from "name the place" onwards** (`identify`, `value`, `expand`, `combine`, the disks, the
  more/less crosses, rounding and estimation) is the `placevalue` / `number_sense` half of the catalogue's
  family review. §12 BT stops at *building and renaming*, which is the concrete end; the abstract end is PV.
  `placevalue:compare` and the two `order_*` ids are quoted in §9 and §10 because comparing and ordering
  **numbers** has no home in `comparing`, which is why §18.2 flags it.

---

## 4. The order of the ten ladders, and why

The order is a prerequisite order first and a triage order second: the ladders whose skills are worst, and
which the most other ladders depend on, come first.

| # | Ladder | Levels | Why here |
|---|---|---|---|
| 1 | **CT** count and know how many (§5) | K | Every other ladder sits on it, and `count_objects` is the worst id in the family (two skills in one, emoji, colour, a set of one) |
| 2 | **SB** subitise to 6 (§6) | K | Needs only numeral recognition, which CT-1 supplies, and it makes CT-3's scattered sets tractable. **No skill exists for any rung** |
| 3 | **SQ** the number sequence (§7) | K-1 | The 120 band lives here, not in CT (§1.4). `count_sequence` is the best-drawn cell in the family and the cheapest to finish |
| 4 | **CP** compare (§8) | K-2 | `compare_groups` has three question types on one page and a two-way guess for an answer; comparing *numerals* has no skill at all below 3 digits |
| 5 | **OR** order (§9) | 1-2 | Needs CP. Its two ids live in `placevalue` and are tagged "M" while spanning K to 5 |
| 6 | **TF** ten frames and number bonds (§10) | K-1 | The structure every later ladder borrows: the frame, the bond, the part-whole box. Four ids share one cell today with four different prompts |
| 7 | **TN** teen numbers as ten and some ones (§11) | K-1 | **The step the samples drill hardest.** Needs TF's full frame. `teen_compose` rolls three forms and includes 11, 12 and 20 |
| 8 | **BT** base ten: tens, build, rename (§12) | 1-2 | Needs TN. Carries the whole regrouping pre-skill for column arithmetic, and `base10_regroup` does not regroup |
| 9 | **OE** odd and even (§13) | 2 | Independent of BT; placed late because the digit rule needs place value. One id emits three response types, one of which answers in tile indices |
| 10 | **NW** number word form (§14) | 1-2 | Independent, and the only ladder whose response is a written **word**. Placed last because its marking rule (Q6 of the catalogue) is unresolved |

The reference sites do not order it this way, and they are not wrong for their pupil: IXL runs counting,
comparing, addition and place value as parallel tracks through a grade, and MW4K's hub is alphabetical. Our
pupil cannot hold parallel tracks. One ladder at a time, one new thing per step.

---

## 5. CT — count and know how many

**Strategy** (P-2): touch each object once along a fixed path, then say the last number again as the answer.
That second half is the cardinal principle and it is the whole skill; the counting words are the pre-skill.

**Pre-skill check** (P-25), four boxed sections: say the counting words 1 to 10 in order; point to each
object once while counting; read numerals 0 to 10; write numerals 0 to 9 on trace rows.

**Structural, at every level:** the picture box and the **answer square** (PT-KCT: 16 / 20 / 24 at 0.75 pt).
Neither is removed by any step in this ladder.
**Hints, fading H1 → H5:** H2 the caption "in all" under the square; H3 a printed count path (small numerals
1, 2, 3 … under the first row of objects, then under the first object only, then none); H4 the last object
ringed, which is the cardinality cue; H5 the numeral traced in grey in the square.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| CT-1 | concept | Count 1 to 5 | start | Rows of 5; plain counters, one kind per cell; answer square. H2, H3, H4, H5 | one number in the square | "There are __ __." |
| CT-2 | range | Count 6 to 10 | the band | Two rows of 5. Unchanged otherwise | one number | same |
| CT-3 | case | Count 0 and 1 | the band's edges | An **empty** box, and a box with one counter. A rule box: nothing to count is zero | one number | "There are no __." / "There is 1 __." |
| CT-4 | representation | Count things that are not in a line | representation (scattered) | Scattered, n ≤ 10, PT-KCT-1 jitter. **The instruction gains a second verb** (`count-cross`): "Cross out each one. Write how many." | crossings + one number | "There are __ __." |
| CT-5 | representation | Count on a ten frame | representation (ten-frame order) | One frame, filled from the top left; n ≤ 10. The half line is visible | one number | "__ and __ empty makes ten." → the plain frame: "There are __." |
| CT-6 | range | Count 11 to 20 on two ten frames | the band | Double ten frame, **1 forced column**, 7 / 6 / 5 per page. Never scattered (PT-KCT-1) | one number | "There are __ __." |
| CT-7 | format | Count and circle the number | format (response) | Stacked layout, 3 columns; three numerals printed under the picture. Distractors are n ± 1 and **the number of rows** (M-C3) | one circle | same |
| CT-8 | unknown | Draw counters to show a number | unknown (the count is given, the set is not) | An empty frame or box with the numeral printed above it. `draw-count` | n counters drawn | "I drew __ __." |
| CT-9 | format | Match a set to its number | format (response) | Two columns: four pictured sets on the left, four numerals on the right, **one extra numeral** so matching by elimination fails | four lines | "__ __ goes with __." |
| CT-10 | discriminate | Circle every group that shows 8 | opMix | Five groups, two or three correct, near misses at n ± 1. Rule box. No answer slot | circles. "Do _not_ write." | "This group has __, not __." |
| CT-11 | judge | Check the counting | responseScope `judge` | A pictured set with a count already written in **black**, about half wrong from §16 (M-C1, M-C2, M-C3). Boxes **Correct** / **Fix it** | one checked box + a number when Fix it | "I counted __, so it is / is not correct." → frame: "There are __." |
| CT-12 | apply | Sort two kinds and count each | representation | One uncaptioned mixed set of two kinds of counter; two answer squares | two numbers | "There are __ __ and __ __." |
| CT-13 | apply | Solve counting stories | representation | K picture word problem, `story-k`; 2 per page at S and M, 1-2 at L | one number + the pre-printed unit word | "There are __ __ in all." |
| CT-14 | test | Test A / B: count to 20 | — | 16 items at S, 12 at L; both arrangements in separate sections | | |

Reviews after CT-4, CT-7, CT-11 (P-22).

**Misconceptions:** M-C1 and M-C2 (CT-4, and the reason CT-4's instruction carries a crossing-out verb),
M-C3 (CT-1 rows, CT-7's distractor), M-C4 (CT-5), M-C5 (CT-6), M-C7 (CT-3), M-X1 (a signal, never a
distractor).

---

## 6. SB — subitise to 6

**Strategy:** see the pattern, say the number, do not count. Then see it as two parts.

**This ladder has a printing problem and it is not a small one.** On paper you cannot tell whether a pupil
counted; "how many dots?" with a written answer is an easy counting item, not a subitising item. The two
primary references do not sell subitising as a worksheet type at all (§1.1), which is consistent. So SB is
specified as **two things**, and the split is put to the owner as Q2:

- the **oral / screen** rungs (SB-1, SB-2) live in the Opener's warm-up band and as an on-screen flash item,
  and never print as an Independent page;
- the **printable** rungs (SB-3 … SB-6) are the ones whose response is a match, a ring or a pair of numbers,
  which a pupil cannot produce by counting one by one without the mark showing.

**Structural:** the dot-card box, one pattern per card.
**Hints:** H2 the caption "how many"; H4 the sub-groups ringed in grey; H5 the numeral traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| SB-1 | concept | Say how many without counting (1 to 3) | start | **Oral / screen only.** Dice patterns 1, 2, 3, one card at a time | spoken, or one tap | "I see __." |
| SB-2 | range | Say how many without counting (4 to 6) | the band | As SB-1; dice patterns 4, 5, 6 | spoken, or one tap | same |
| SB-3 | format | Match the pattern to the number | format (response) | Printable. Four dot cards, five numerals; one extra numeral | four lines | "__ dots is __." |
| SB-4 | representation | See a number as two parts | representation | One card drawn as two clear sub-groups (4 as 3 and 1; 5 as 4 and 1 or 3 and 2). Two part boxes and a total box | three numbers | "__ and __ makes __." |
| SB-5 | representation | See five on a ten frame | representation | The frame's top row full, then 5 and some more | one number | "Five and __ more is __." |
| SB-6 | discriminate | Which cards show 5? | opMix | Six cards, three correct, near misses at 4 and 6. Rule box, no answer slot | circles. "Do _not_ count." | "This card shows __." |
| SB-7 | test | Test A / B: patterns to 6 | — | 16 items at S (one-symbol answers) | | |

**Misconceptions:** M-C6 (SB-4 — answered with the larger sub-group), M-C1 (SB-6 — counted, and miscounted,
when the whole point was not to), M-C8 (SB-3 — matched the *shape* of the pattern rather than its count, so
a 4-square and a 4-diamond are treated as different numbers).

---

## 7. SQ — the number sequence, and the chart

**Strategy:** the number path. A number's neighbours are one step along it; the chart is the path folded into
rows of ten. This is where the 120 band lives (§1.4).

**Pre-skill check:** count aloud 1 to 20; count aloud 1 to 100 by tens; read a 2-digit numeral; write a
2-digit numeral; say which of two numbers comes first when counting.

**Structural:** the **number path strip** (SQ-1 … SQ-7) and, from SQ-8, the **chart grid**, black hairlines,
empty white cells. A blank is an empty cell, never a coloured one, never dashed (P-26: dashed means cut).
**Hints H1 → H5:** H3 the path's neighbours printed (they fade to empty boxes — **and the answer's own cell
must never be one of the printed ones**; `count_sequence` satisfied this on 120 of 120 items when it was
re-measured on 2026-09-20, so this is a rule to hold, not a defect to repair); H4 the given number ringed;
H5 the first answer traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| SQ-1 | concept | Write the number after | start | Path of five boxes, the given number ringed, the box to its right empty. Band 20 | one number | "After __ comes __." |
| SQ-2 | unknown | Write the number before | the unknown's position | The box to the **left** empty | one number | "Before __ comes __." |
| SQ-3 | unknown | Write the number between | two givens | Two numbers given, the box between them empty | one number | "__ is between __ and __." |
| SQ-4 | fade | Write the number after, with no path | scaffold | The strip removed; the numeral alone (P-SC-4: its own step, its own Model) | one number | unchanged |
| SQ-5 | range | Before, after and between to 120 | the band | Path returns at the new band for one step, then fades | one number | unchanged |
| SQ-6 | case | Cross a ten | the band's hard cases | Every item sits on a decade or century boundary: 29 → 30, 99 → 100, 109 → 110, 119 → 120 | one number | "After __ comes the next ten." → frame: "After __ comes __." |
| SQ-7 | procedure | Count on from a number | representation | Path with hops drawn: "Count on 3 from 6." The start number is **not** counted (M-Q5) | one number | "Start at __. Count on __: __." |
| SQ-8 | fade | Count on with no path | scaffold | The hops go | one number | unchanged |
| SQ-9 | representation | Fill the missing number on a 1-20 strip | representation | One strip, **one** blank. `blankPattern` = scattered | one number | "This row goes up by one." |
| SQ-10 | range | Fill missing numbers on a 1-100 chart | the chart | **One chart per page** (§17). 20% blanks, scattered | 20 numbers | same |
| SQ-11 | representation | Fill a whole row, or a whole column | the blank pattern | A row tests +1; a **column** tests +10 and is the step M-Q4 exists for. One pattern per section | 10 numbers | "This column goes up by ten." |
| SQ-12 | range | Fill missing numbers on a 1-120 chart | the chart | Twelve rows | 24 numbers | unchanged |
| SQ-13 | decide | Which way does this row go? | responseScope `decision` | Rows that go up by 1, up by 10, and **down**. Boxes: **Up by 1** / **Up by 10**. Rule box. No numbers written | one checked box. "Do _not_ fill in." | "This row goes __." |
| SQ-14 | judge | Check the chart | responseScope `judge` | A filled chart row in **black**, about half wrong from §16 (M-Q3, M-Q4) | one checked box + the correction | "__ should be __." |
| SQ-15 | test | Test A / B: the number sequence | — | 16 items; charts print 1 per page, so a chart test is a separate side | | |

**Misconceptions:** M-Q1 and M-Q2 (SQ-2 — the two ways "before" fails), M-Q3 (SQ-6, and the whole reason
SQ-6 is a step), M-Q4 (SQ-11 — the column step), M-Q5 (SQ-7), M-Q6 (SQ-5 at the teen band).

---

## 8. CP — compare

**Strategy:** match one to one. Whichever group has one left over has more. The numerals come after the
matching, and the symbol comes after the numerals.

**Pre-skill check:** count sets to 10; write numerals to 20; say which comes first when counting; draw a line
from one object to another.

**Structural:** the **two group boxes** at 0.75 pt, each with its own black letter label (PT-KCT-5). From
CP-6 the numerals print under the groups and the **comparison circle** (diameter Hw + 2 = 8 / 10 / 12) sits
between them, and the circle is structural from there on.
**Hints H1 → H5:** H1 the matching lines pre-drawn in grey; H2 the captions "more" and "fewer" beside the
boxes; H4 the greater group's box outlined bold; H5 the first symbol traced.
**Colour is never a hint here.** The two groups are told apart by their label and their box (§1.4).

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| CP-1 | concept | Find the group with more | start | Two boxes, n ≤ 5 each, 2 columns. Identical counters in both. Circle a box (PT-KCT-5) | one circle | "__ has more than __." |
| CP-2 | unknown | Find the group with fewer | which quantity is asked | Unchanged; the instruction's word changes and the page holds one word (P-28) | one circle | "__ has fewer than __." |
| CP-3 | unknown | Say if the groups are the same | equality enters | Both boxes equal on about half the items. Boxes **Same** / **Not the same** | one checked box | "They are / are not the same." → frame: "Both have __." |
| CP-4 | representation | Match one to one | representation | The two groups drawn as **paired rows**, one object above another; the pupil draws the lines and rings the leftover | lines + one ring | "__ has one left over, so __ has more." → frame: "__ has more." |
| CP-5 | case | The longer row does not always have more | the hard case | Every item: the group with fewer objects is drawn **longer** (spread out). Non-examples at 1:1 (P-10) | lines + one circle | "It is longer, but it has __." → frame: "__ has more." |
| CP-6 | range | Compare groups to 10 | the band | 1 forced column, 7 / 6 / 5 per page. Numerals now print under each box (Level 1, PT-KCT-5) | one circle | "__ is greater than __." |
| CP-7 | representation | Compare two numbers to 10 | representation | The pictures go; two numerals and the comparison circle. Circle the greater | one circle | same |
| CP-8 | format | Write >, < or = | format (response) | The symbol enters. Band 20. A rule box: the open end faces the greater number | one symbol in the circle | "__ is greater than __." |
| CP-9 | range | Compare 2-digit numbers | the band | Same digit count both sides. `lengths: equal` | one symbol | same |
| CP-10 | case | Compare numbers with the same first digit | the hard case | 34 vs 38, 71 vs 76. The tens do not decide (M-P4 head on) | one symbol | "The tens are the same, so look at the ones." → frame: "__ is greater." |
| CP-11 | notate | Underline the place that decides | responseScope `notation` | Two numerals, one under the other, aligned by place. Underline the **first place from the left where they differ**. No symbol written | one underline. "Do _not_ compare." | "They are the same in the __. They differ in the __." |
| CP-12 | case | Compare numbers of different lengths | the hard case | 98 vs 102, 9 vs 25. `lengths: mixed` (M-P5) | one symbol | "__ has more digits, so it is greater." |
| CP-13 | range | Compare 3-digit numbers | the band | | one symbol | same |
| CP-14 | judge | Check the comparison | responseScope `judge` | Finished comparisons in **black**, about half with the symbol reversed (M-P6) or decided on the ones (M-P4) | one checked box + the correction | "__ is greater, so the sign points at __." |
| CP-15 | apply | Solve comparison stories | representation | "How many more?" and "How many fewer?", one schema per set, v1 then v2 | one number + unit | "__ has __ more __ than __." |
| CP-16 | test | Test A / B: comparing | — | 16 items; pictures and numerals in separate sections | | |

**Misconceptions:** **M-P1** at CP-4 and CP-5 — it is the reason CP-5 is a step of its own rather than a
seeded edge case. Then M-P2 (CP-1, and the reason both groups use identical counters), M-P3 (CP-2),
M-P4 (CP-10), M-P5 (CP-12), M-P6 (CP-8, CP-14).

---

## 9. OR — order

**Strategy:** find the least, write it, cross it off, repeat. Ordering is repeated comparing, and the step
that makes it teachable is the crossing-off, because it is the only visible trace of the method.

**Pre-skill check:** CP-7 … CP-9; write 3 numerals in given boxes; read a number line to 100.

**Structural:** the **number cards** (a row of square-cornered boxes with the numbers in, above the cell) and
the **ordered boxes** below them, one per card. The cards are never removed — they are where the pupil
crosses off.
**Hints:** H2 the captions "least" and "greatest" under the first and last boxes; H4 the least ringed;
H5 the first box filled in grey.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| OR-1 | procedure | Put 3 numbers in order, least first | start | Three cards, three boxes. Band 20, equal digit counts. `order-up` | three numbers | "__ is the least, so it goes first." |
| OR-2 | unknown | Put 3 numbers in order, greatest first | the direction | Unchanged; one direction per section | three numbers | "__ is the greatest, so it goes first." |
| OR-3 | range | Put 4 to 6 numbers in order | the set size | **Fixed** per section, never `randInt(3, 6)` | 4-6 numbers | unchanged |
| OR-4 | range | Order numbers to 100 | the band | | numbers | unchanged |
| OR-5 | case | Order numbers with the same first digit | the hard case | 34, 38, 31 (M-O1) | numbers | "They all start with __, so look at the ones." |
| OR-6 | case | Order numbers of different lengths | the hard case | 9, 25, 102 (M-O3) | numbers | "__ has the fewest digits, so it is the least." |
| OR-7 | representation | Put the numbers on a number line | representation | An unlabelled line with the end values printed; mark each number, then read the order off | marks + numbers | "__ is furthest to the left, so it is the least." |
| OR-8 | range | Order numbers to 1,000 | the band | | numbers | unchanged |
| OR-9 | judge | Check the order | responseScope `judge` | A finished list in **black**, about half wrong from M-O1 / M-O2 | one checked box + the correction | "__ should come before __." |
| OR-10 | test | Test A / B: ordering | — | 12 items | | |

**Misconceptions:** M-O1 (OR-5), M-O2 (OR-2 — the direction is reversed the step after it is introduced,
which is exactly where it bites), M-O3 (OR-6), M-P4 carried forward.

---

## 10. TF — ten frames and number bonds

**Strategy:** the whole is made of two parts, and the ten frame shows it. This ladder builds the two
structures every later ladder borrows.

**Pre-skill check:** count to 10; count on a ten frame; write numerals to 10; draw counters to a given number.

**Structural:** the **ten frame** (two rows of five, black hairlines, empty cells) and, from TF-4, the
**number bond**: one whole box above, two part boxes below, square-cornered, side 14 / 16 / 20 (RP-60).
Neither is removed until TF-11.
**Hints H1 → H5:** H1 the frame drawn beside the bond; H2 the captions "part", "part", "whole"; H3 the dots
already in the frame; H4 the known part ringed; H5 the first box traced.
**The whole is one per section** and it is named in the title ("I Can Break 8 Into Two Parts"), never in the
instruction (P-LG-16, read across from fact sets).

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| TF-1 | concept | Fill a ten frame to a number | start | An **empty** frame and a numeral above it. `draw-count`. No target restated in the cell | n counters drawn | "__ counters. __ empty." |
| TF-2 | unknown | Find how many more to make ten | the unknown | A partly filled frame; the empty cells are the answer. The filled count is **not** printed (that is the live defect in `make_ten`) | one number | "__ and __ make ten." |
| TF-3 | range | Make ten from every start | the fact set | The pairs walked **in order** — 9 and 1, 8 and 2, 7 and 3 … — dealt off `itemIndex`, not rolled | one number | same |
| TF-4 | representation | Break 5 into two parts | representation | The bond arrives: whole 5 printed, one part given, one part box empty. The frame stands beside it (H1) | one number | "__ and __ make __." |
| TF-5 | range | Break 6, 7, 8 and 9 into two parts | the whole | One whole per section. Both part positions, dealt | one number | same |
| TF-6 | range | Break 10 into two parts | the whole | The fact set. All 11 bonds reachable, including 0 and 10 and the double 5 and 5 | one number | same |
| TF-7 | unknown | Find the whole | the unknown's position | Both parts given, the whole box empty | one number | "__ and __ make __." |
| TF-8 | unknown | Find both parts | the unknown | Whole given, both parts empty; **any correct pair is accepted** (P-LG-15). A Stretch page asks for all of them | two numbers | same |
| TF-9 | format | Write the bond as a number sentence | format | `5 = 3 + __` and `3 + __ = 5` in separate sections (P-16). The bond stands beside the sentence for one step | one number | "__ and __ make __." |
| TF-10 | case | Bonds with 0 and bonds that are doubles | the edge set | `10 = 0 + 10`, `10 = 5 + 5`. A rule box each | one number | "__ and none makes __." / "__ and __ are the same." |
| TF-11 | fade | Find the missing part with no bond drawn | scaffold | The bond removed (P-SC-4) | one number | unchanged |
| TF-12 | range | Bonds to 20 | the whole | `20 = 10 + 10`, then teen wholes. Two ten frames return as H1 for one step | one number | unchanged |
| TF-13 | discriminate | Is this a bond of 10? | opMix | Three numbers; boxes **Yes** / **No**; near misses (6 and 5) at 1:1. Rule box. No answer slot | one checked box. "Do _not_ solve." | "__ and __ make __, so it is / is not a bond of ten." |
| TF-14 | judge | Check the bond | responseScope `judge` | Finished bonds in **black**, about half wrong from M-N3 / M-N4 | one checked box + the correction | "__ and __ make __, not __." |
| TF-15 | test | Test A / B: ten frames and bonds | — | 12 items | | |

**Misconceptions:** M-N1 and M-N2 (TF-2 — the two ways "how many more" fails), M-N3 (TF-7), M-N4 (TF-8),
M-N5 (TF-1 — a drawing error, which is why TF-1's key is a facsimile frame, not a number), M-N6 (TF-10).

---

## 11. TN — teen numbers as ten and some ones

The step the sample workbooks drill hardest, and the one the research is clearest about: the English teen
words are learnt as **separate words**, not as a structure, and the reversal (41 for fourteen) comes from
hearing the four first (§1.1). Everything in this ladder is built to make the ten come first on the page.

**Pre-skill check:** CT-6; TF-1; TF-6; read numerals 10 to 20; say the counting words 10 to 20 in order.

**Structural:** the **double ten frame**, with the first frame **always full** from TN-1 on — that is the
structure, and it is what makes the ten visible before the ones. From TN-4 the `10 + __ = 1_` frame joins it.
**Hints H1 → H5:** H1 the counters in the second frame; H2 the caption "ten and"; H3 the number path 10-20;
H4 the full frame outlined bold; H5 the first digit traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| TN-1 | concept | Build a teen number on two ten frames | start | The first frame **printed full**, the second empty; the numeral above. `teenRange` 13-19 | counters drawn in the second frame | "Ten and __ more." |
| TN-2 | notate | Write how many tens and how many ones | responseScope `notation` | The two frames filled; two labelled boxes, `__ ten` and `__ ones`. **No total anywhere in the cell** | two numbers. "Do _not_ write the number." | "One ten and __ ones." |
| TN-3 | bridging | Read a teen number as ten and some ones | representation | The frames and `10 + __ = 1_` in the **same row** (P-8's one bridging step) | one number | "__ is ten and __." |
| TN-4 | procedure | Add ten and a digit | responseScope `full` | `10 + 6 = __`, frames beside it | one number | "Ten plus __ equals __." |
| TN-5 | unknown | Find the ones in a teen number | the unknown's position | `16 = 10 + __` | one number | "__ is ten and __." |
| TN-6 | case | Read and build 11 and 12 | the set | Their own step, because their names carry **no -teen cue** (Fuson). A rule box naming them | one number | "Eleven is ten and one." |
| TN-7 | case | Read and build 13 and 15 | the set | The irregular prefixes (thir-, fif-) | one number | "Thirteen is ten and three." |
| TN-8 | discriminate | Which numeral says fourteen? | opMix | **14 or 41.** Two numerals, circle one. Rule box: the ten is written first. No other numbers on the page (M-T3) | one circle. "Do _not_ write." | "Fourteen is ten and four, so it is __." |
| TN-9 | representation | Show a teen as a rod and some ones | representation | The double frame becomes **one base-ten rod** and loose units. This is the handover to §12 | two numbers | "One ten and __ ones." |
| TN-10 | fade | Read a teen number with no frames | scaffold | The frames removed | one number | unchanged |
| TN-11 | case | Nineteen and then twenty | the rollover | 19 + 1; two full frames. A rule box: two tens is twenty | one number | "Two tens is twenty." |
| TN-12 | test | Test A / B: teen numbers | — | 16 items; 13-19 and 11-12 in separate sections | | |

**Misconceptions:** **M-T3** at TN-8 (the whole reason TN-8 is a step), M-T1 and M-T2 (TN-4),
M-T4 (TN-6), M-C5 (TN-1 — counted the second frame from 1), M-T5 (TN-11).

---

## 12. BT — base ten: tens, build, rename

**Strategy:** ten ones make one ten, and one ten is ten ones. Everything in this ladder is that sentence read
forwards and then backwards.

**Pre-skill check:** TN-2; count by tens to 100; read a 2-digit numeral; say which digit is the ones.

**Structural:** the **labelled mat** — a Tens zone and an Ones zone side by side, square-cornered, black
hairlines, the place letters **T O** (then **H T O**) above them (P-SC-7). From BT-8 the **trade box** (a
single box between the zones, where the exchanged ten is written) joins it. Removed only by BT-14.
**Hints H1 → H5:** H1 the numeral printed above the mat; H2 the captions "tens" and "ones" in full words;
H4 the zone being worked outlined bold; H5 the first rod traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| BT-1 | concept | Count the tens | start | Rods only, 1 to 9, in the Tens zone. Includes **0 tens** and **10 tens** (P-10) | one number | "__ tens." |
| BT-2 | procedure | Say what the tens are worth | representation | The same rods; the answer is the number, not the count of rods. Rule box: one ten is ten ones | one number | "__ tens is __." |
| BT-3 | representation | Build a two-digit number | representation | Both zones; draw rods and units to a printed target | drawn blocks | "__ tens and __ ones is __." |
| BT-4 | notate | Write the tens and the ones | responseScope `notation` | **No blocks drawn.** A numeral and two labelled boxes. The reverse of BT-3's response | two numbers. "Do _not_ draw." | "__ is __ tens and __ ones." |
| BT-5 | unknown | Write the number from the tens and the ones | the unknown's position | "4 tens and 7 ones is __" | one number | same |
| BT-6 | case | Numbers with a zero in the ones | the edge case | 40, 70. The Ones zone is drawn **empty**, not omitted | one number | "__ tens and no ones is __." |
| BT-7 | case | Teen numbers on the mat | the edge case | 14, 19 — one rod and some units. The bridge from TN-9 | one number | "One ten and __ ones is __." |
| BT-8 | concept | Trade ten ones for one ten | representation | Ten loose units in the Ones zone; ring them; the trade box takes the new ten. Rule box: **Ten ones make one ten.** | one ring + one number | "Ten ones make one ten." |
| BT-9 | decide | Are there enough ones? | responseScope `decision` | A mat with some ones; boxes **Can trade** / **Cannot trade**. Rule box. **No answer slot** | one checked box. "Do _not_ trade." | "There are __ ones. I need ten." |
| BT-10 | notate | Rename a number with one ten traded | responseScope `notation` | `45 = 3 tens and __ ones`. Cross out one rod on the drawn mat, write ten more units. **No arithmetic** | one number + the marks. "Do _not_ add." | "Four tens becomes three tens. The ones get ten more." |
| BT-11 | unknown | Rename it back | the direction | `3 tens and 15 ones = __ tens and __ ones` | two numbers | "Fifteen ones is one ten and five ones." |
| BT-12 | range | Build a three-digit number | the band | Flats join; **H T O**. §17: 6 / 4 / 3 per page at 100-299, 3 / 3 / 2 above | drawn blocks | "__ hundreds, __ tens, __ ones." |
| BT-13 | case | Numbers with a zero in the tens | the edge case | 305. The Tens zone is drawn **empty** (M-K4) | one number | "Three hundreds, no tens, five ones." |
| BT-14 | representation | Rename a hundred as ten tens | representation | The same trade one place up | one number | "One hundred is ten tens." |
| BT-15 | fade | Write the places with no mat | scaffold | The mat removed; the boxes stay | numbers | unchanged |
| BT-16 | judge | Check the build | responseScope `judge` | A drawn mat with a number already written in **black**, about half wrong from M-K1 / M-K2 | one checked box + the correction | "That is __ tens and __ ones, so it is __." |
| BT-17 | test | Test A / B: tens and ones | — | 12 items; two- and three-digit in separate sections | | |

**Misconceptions:** M-K1 (BT-4), M-K2 (BT-1 → BT-2 boundary — it is the error that makes BT-2 a step rather
than a note), M-K3 (BT-3, a drawing error, caught on BT-16), M-K4 (BT-13), M-K5 and M-K6 (BT-10 — the two
halves of the trade, and the reason BT-10 is `notation` and not `full`), M-K7 (BT-11).

---

## 13. OE — odd and even

**Strategy:** pair the counters. If one is left over the number is odd. Then, when the numbers are too big to
draw, the ones digit carries the same fact.

**Pre-skill check:** count to 20; count by twos to 20; read a 2-digit numeral; say which digit is the ones.

**Structural:** the **pairing frame** — two rows of counters, one above the other, with the leftover in its
own box at the end — at OE-1 … OE-3; from OE-4 the plain numeral and the answer slot.
**Hints H1 → H5:** H1 the counters; H2 the caption "one left over"; H4 the ones digit outlined bold;
H5 the first pair ringed.
**Two captions must never print:** "All circles are paired!" and "ends in 6". Both state the answer, and both
are live today.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| OE-1 | concept | Pair the counters | start | n ≤ 10. Ring each pair; ring the leftover if there is one. **No word written** | rings | "There is / is not one left over." |
| OE-2 | notate | Ring the pairs and the leftover | responseScope `notation` | As OE-1 at n ≤ 20; two labelled boxes, `__ pairs` and `__ left` | rings + two numbers. "Do _not_ write odd or even." | "__ pairs and __ left." |
| OE-3 | procedure | Say if a number is odd or even | responseScope `full` | The pairing frame plus two boxes, **Odd** / **Even**. n ≤ 20 | one checked box | "__ makes __ pairs with __ left, so it is __." |
| OE-4 | fade | Use the ones digit | scaffold | **The model goes.** The numeral alone, band 100. A rule box: look at the ones digit (§1.1 — this is what the world does, and §17 says the model cannot be drawn above 20) | one checked box | "__ ends in __, so it is __." |
| OE-5 | case | Zero, and numbers with a 2 in the tens | the edge set | 0, 24, 42, 21. A rule box for 0 (M-E1, M-E3) | one checked box | "Zero makes pairs with none left, so it is even." |
| OE-6 | case | Numbers whose first digit misleads | the hard case | 34, 56, 78 — the leading digit's parity differs from the answer (M-E2) | one checked box | "The tens do not decide. __ ends in __." |
| OE-7 | format | Find every even number | format (response) | Eight numerals in tiles; ring every even one. **Near misses seeded**; 0 in the pool. `default-circle-all` | rings | "__ is even, so I ring it." |
| OE-8 | format | Sort number cards into odd and even | format (hands-on) | `cut-sort`. Two labelled bins, eight cards | cards placed | same |
| OE-9 | discriminate | Odd or even without working it out | opMix | Even + even, odd + odd, one of each (2.OA.C.3). Two boxes. **The sum is never computed** — MW4K's *Sum and Difference* type, read our way | one checked box. "Do _not_ add." | "Two evens make an even." |
| OE-10 | judge | Check the sorting | responseScope `judge` | A finished sort in **black**, about half wrong from M-E2 / M-E3 | one checked box + the correction | "__ ends in __, so it belongs with the __." |
| OE-11 | test | Test A / B: odd and even | — | 16 items (one-symbol answers) | | |

**Misconceptions:** M-E1 (OE-5), **M-E2** (OE-6 — the reason OE-6 is a step and not a seeded item),
M-E3 (OE-5), M-E4 (OE-2 → OE-3 boundary), M-E5 (OE-9).

---

## 14. NW — number word form

The only ladder in the family whose response is a written **word**. That makes it the highest writing load in
the family and the one place the answer-slot width is a design decision (§17), so it starts as a **match**
and becomes a written word as late as possible.

**Pre-skill check:** read numerals to 100; BT-4; read the number words 0-10; copy a word from a bank.

**Structural:** the **word bank** (a rounded box of four words above the section) at NW-1 … NW-4; from NW-5 a
full-width **ruled answer line**. The bank's size is the scaffold: four words, then eight, then none.
**Hints H1 → H5:** H2 the caption "tens" and "ones" under the two halves of the word; H4 the hyphen printed
in the answer line's position; H5 the first word traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| NW-1 | concept | Match a number to its word, 0 to 10 | start | Four numerals, five words, one extra (matching by elimination fails). `match` | four lines | "__ is written __." |
| NW-2 | range | Match a number to its word, 11 to 20 | the band | The teen words. 11, 12, 13 and 15 seeded every set | four lines | same |
| NW-3 | range | Match the tens words | the band | twenty, thirty … ninety. **forty** seeded every set (no u) | four lines | same |
| NW-4 | discriminate | Which word says 40? | opMix | *forty* / *fourteen*, *thirty* / *thirteen*. Two words, circle one. Rule box (M-W4) | one circle | "Forty is four tens. Fourteen is ten and four." |
| NW-5 | procedure | Write the word for a two-digit number | responseScope `full` | The bank goes; a ruled line. The **hyphen** is the new thing and the rule box names it | one written word | "__ is written __." |
| NW-6 | unknown | Write the numeral from the word | the direction | "forty-two" → `__`. One direction per section (P-28) | one number | same |
| NW-7 | range | Three-digit numbers | the band | "three hundred forty-two" | word or numeral | same |
| NW-8 | case | Numbers with a zero place | the edge case | 305 = "three hundred five". A **"Remember … NOT …"** line (P-LG / §10.4): *Remember: three hundred five, NOT three hundred and five* (M-W1) | word or numeral | "There are no tens, so we say nothing for the tens." |
| NW-9 | judge | Check the spelling | responseScope `judge` | Finished words in **black**, about half wrong from M-W1 / M-W2 / M-W3 | one checked box + the correction | "__ should be written __." |
| NW-10 | test | Test A / B: number words | — | 12 items; each direction its own section | | |

**Misconceptions:** M-W1 (NW-8 — and it is the one a class of ELL pupils will produce most often, because
"three hundred and five" is correct in their other English), M-W2 (NW-5), M-W3 (NW-7), M-W4 (NW-4).

---

## 15. What each page role does with these steps

P-27: every step above must render on every page role. The five that are easy to get wrong in this family:

| Page role | What it takes from a step | What it must not do |
|---|---|---|
| **Error analysis** | the step's cell, one finished item per cell in **black**, wrong answers drawn from §16 by the step's misconception ids, about half wrong (P-TH-3) | never a random wrong number; never a wrong answer equal to the right one. **For a counting step the wrong answer must be shown against the drawn set**, or there is nothing to check |
| **True or False?** | the step's own item; a true statement uses the answer, a false one uses `wrongAnswer(q)` from §16 | never more than 2 blanks in the evidence frame. "There are 7 stars." with the stars drawn is the whole item |
| **Reason It** | Spot the mistake uses the step's misconception; Always/Sometimes/Never uses the step's rule box ("The longer row has more.") | never a named character — A and B only |
| **Hands-on** | `cut-sort` for OE-8 and CT-12; `cut-order` for OR; `hands-match` for CT-9, SB-3 and NW-1 | the cut line is the **only** dashed line on the page (P-26) |
| **Today's Number** | one number carries the whole two-sided sheet: count it, build it, compare it, say its word, say whether it is odd, find it on the chart | the tag belongs on count / compare / build / chart ids only; it does not belong on SB or NW-9 |

A step with a `decision` or `notation` scope supplies `decision(q)` for the discrimination page directly.
A `full` step supplies it by deriving the decision from its own constraints (does this frame make ten? does
this number need a trade? does the first digit decide?).

---

## 16. The misconception bank

The part the error-analysis, True or False? and Reason It generators are built from, so each entry names a
**mechanism** and a **wrong-answer rule a generator can compute**. **[evidenced]** entries are named in the
sources of §1.1; **[house]** entries are ours, asserted from the design of the step, and should be treated as
lower-confidence until seen in a pupil's work. Ids M-A*, M-S*, M-T1 and M-X1 are shared with
`operations-facts-v2.md` §20 and are not redefined here.

### 16.1 Counting and cardinality

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| **M-C1** | **Counted an object twice, or skipped one, because the set has no order to follow** | answer = correct ± 1 (± 2 on a set of 15 or more) | CT-4 | **[evidenced]** Gelman & Gallistel's one-to-one principle; Gelman & Meck's error-detection trials use exactly two in-error conditions, *skipped* and *double counted* |
| **M-C2** | **Said the number names in order but did not stop at the last object** — the counting words run on past the set, so the cardinal principle is not applied | answer = correct + 1 or + 2, and on screen the pupil re-counts rather than answering | CT-1 | **[evidenced]** the cardinal principle; Wynn: about a year separates reciting the list from using it to say how many |
| M-C3 | Counted the **rows**, or the **groups**, rather than the objects | answer = number of rows (a set of 15 in rows of 5 answers 3) | CT-1, CT-7 | **[house]**, and the reason CT-7's third distractor is the row count |
| M-C4 | Counted the **empty** cells of a ten frame as well as the counters | answer = 10 (single frame) or 20 (double) | CT-5 | **[house]** |
| M-C5 | On a double ten frame, started the second frame at 1 | answer = the ones only (14 → 4) | CT-6, TN-1 | **[house]**, and a sibling of M-T1 |
| M-C6 | Subitising two sub-groups: answered with the **larger sub-group** | answer = max(part₁, part₂) | SB-4 | **[house]** |
| M-C7 | Treated an empty box as unanswerable, or wrote 1 | answer = 1, or blank | CT-3 | **[house]** |
| M-C8 | Matched a dot pattern by its **shape** rather than its count, so a square of 4 and a line of 4 are different numbers | the match line goes to the card with the same outline | SB-3 | **[house]** |

### 16.2 The number sequence

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| M-Q1 | Gave the number itself when asked for the one before or after | answer = the given number | SQ-1, SQ-2 | **[house]**, and distinguishable from M-X1 here because the response *is* a neighbour |
| M-Q2 | Counted **on** when asked for the number **before** | answer = n + 1 on a "before" item | SQ-2 | **[house]** |
| **M-Q3** | **At a decade boundary, dropped back to the start of the decade instead of moving to the next one** | for n ending in 9: answer = 10 × floor(n / 10), so after 29 comes 20 | SQ-6 | **[evidenced]** the decade-boundary hurdle is the standard second hurdle of the number-word sequence literature (Gould, via §1.2's caveat) |
| M-Q4 | On the chart, moved **along the row** when the blank is in a column | answer = n ± 1 where n ± 10 is correct | SQ-11 | **[house]**, and the reason SQ-11 exists as a column step |
| M-Q5 | Counting on, **counted the starting number as the first count** | answer = correct − 1 | SQ-7 | **[evidenced]** the same mechanism as M-A6 in the operations bank, which is evidenced there |
| M-Q6 | Wrote the teen numeral reversed inside a sequence | answer = digit-reversed (14 → 41) | SQ-5 | **[evidenced]** see M-T3 |

### 16.3 Comparing and ordering

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| **M-P1** | **The longer row has more** — length is read for number | answer = the group drawn longer, regardless of count | CP-4, CP-5 | **[evidenced]** conservation of number; it is the single best-known error in early number and the reason CP-5 is a whole step |
| M-P2 | Picked the group with the **bigger objects** | answer = the group whose counters are drawn larger | CP-1 | **[house]**, and the reason both groups use identical counters |
| M-P3 | "More" and "fewer" swapped — *fewer* is not a word the pupil owns | answer = the other group | CP-2 | **[evidenced]** ELL vocabulary; MW4K and K5 both sell more/fewer as separate sheets |
| **M-P4** | **Compared the ones digits** | answer = the number with the larger ones digit (34 vs 28 → 28) | CP-10 | **[evidenced]** universally named; MW4K's own 2-digit sheet instructs *examine tens places, then ones places* precisely against it |
| M-P5 | Compared digit by digit from the left without aligning lengths | for unequal lengths: answer = the shorter number when its leading digit is larger (98 vs 102 → 98) | CP-12 | **[house]** |
| M-P6 | Wrote the symbol pointing **at** the larger number | answer = the mirrored symbol | CP-8, CP-14 | **[house]** |
| M-O1 | Ordered by the **last** digit | the list sorted by n mod 10 | OR-5 | **[house]** |
| M-O2 | Wrote the list in the other direction | the correct list reversed | OR-2 | **[house]**, and it bites hardest on the step *after* the direction changes |
| M-O3 | Ordered by digit count only, leaving same-length numbers in the order given | stable sort by length alone | OR-6 | **[house]** |

### 16.4 Composing, ten frames and bonds

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| M-N1 | Answered "how many more to make ten?" with the number **already there** | answer = the filled count | TF-2 | **[house]** |
| M-N2 | Counted the **filled** cells again instead of the empty ones, or counted all ten | answer = the filled count, or 10 | TF-2 | **[house]** |
| M-N3 | Put the **whole** into a part box | answer = the whole | TF-7 | **[house]** |
| M-N4 | Added the two numbers shown when one part was unknown | answer = whole + known part (10 and 4 → 14) | TF-8 | **[house]**, the sibling of M-U2 |
| M-N5 | Filled the ten frame out of order — across then down, or both frames evenly | a **drawn** error with no wrong number: the count is right, the frame is wrong | TF-1, TN-1 | **[house]**, and the reason TF-1's key is a facsimile frame |
| M-N6 | For a double, wrote two different parts anyway (`10 = 4 + 6` when asked for the double) | answer ≠ whole / 2 | TF-10 | **[house]** |

### 16.5 Teen numbers

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| **M-T3** | **Wrote the teen numeral reversed, because the ones word is heard first** | answer = digit-reversed: 41 for fourteen, 31 for thirteen | TN-8 | **[evidenced]** named directly in the teen-word literature: children *"will often write 41 for fourteen, simply because they hear the four first"* (§1.2 caveat on the primary text) |
| M-T1 | Read a teen numeral's digits as two separate numbers | 13 read as 1 and 3; `13 + 4` → 8 | TN-4 | **[evidenced]** shared with the operations bank |
| M-T2 | Wrote the ten and the ones side by side | "ten and seven" → 107 | TN-4 | **[house]** |
| M-T4 | Treated 11 and 12 as not teen numbers, because they carry no -teen | 11 and 12 sorted with 1 and 2, or omitted from a teen set | TN-6 | **[evidenced]** Fuson: the teen words are mostly learnt as separate words, and eleven / twelve share no morpheme with the rest |
| M-T5 | Counted 19 → "tenteen" / "twenty-ten" at the rollover | answer = 20 given as a teen word, or 110 | TN-11 | **[house]**, a sibling of M-Q3 |

### 16.6 Base ten

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| M-K1 | Swapped the tens and the ones | answer = digit-reversed (47 built as 7 rods and 4 units) | BT-4 | **[house]** |
| M-K2 | Counted a rod as **one** | answer = tens + ones (47 → 11) | BT-2 | **[house]**, and the reason BT-2 is a step of its own |
| M-K3 | Drew the number as loose units only, with no tens | a **drawn** error: 47 single units | BT-3 | **[house]**, caught on BT-16 |
| M-K4 | Dropped the zero place | 305 built as 3 flats and 5 rods, or written 35 | BT-13 | **[house]** |
| M-K5 | Took the ten into the ones but did not reduce the tens | 45 renamed as "4 tens 15 ones" | BT-10 | **[evidenced]** the no-decrement mechanism of M-S2 in the operations bank, one grade earlier |
| M-K6 | Traded a ten for **one** one | 45 renamed as "3 tens 6 ones" | BT-10 | **[house]** |
| M-K7 | Wrote the new ones count in the **tens** box | "15 tens" | BT-11 | **[house]** |

### 16.7 Odd, even and number words

| Id | Mechanism | Wrong-answer rule | First bites at | Evidence |
|---|---|---|---|---|
| M-E1 | Called 0 odd, or refused to judge it | answer = "odd" for 0 | OE-5 | **[house]** |
| **M-E2** | **Read the first digit instead of the ones digit** | answer = the parity of the leading digit (34 → odd) | OE-6 | **[house]**, but the same place-value slip as M-P4, which is evidenced |
| M-E3 | Called any number containing a 2 even | answer = "even" whenever "2" appears anywhere (21, 23) | OE-5 | **[house]** |
| M-E4 | With the pairing model, judged by the **number of pairs** rather than the leftover | answer = the parity of floor(n / 2) | OE-2 → OE-3 boundary | **[house]** |
| M-E5 | Computed the sum instead of using the rule, then made an arithmetic error | answer = the parity of a wrong sum | OE-9 | **[house]** |
| M-W1 | Inserted "and" | "three hundred and five" | NW-8 | **[evidenced]** the British / international-English convention the pupils bring; MW4K and IXL both use the US form and neither states the rule (§1.1) |
| M-W2 | Dropped the hyphen | "forty two" | NW-5 | **[house]**. Under P-LG-15 this is **accepted**, not marked wrong; it is a distractor on NW-9 only |
| M-W3 | Wrote each spoken chunk as a numeral | "four hundred six" → 4006 | NW-7 | **[house]** |
| M-W4 | Wrote the teen word for the tens word | 40 → "fourteen"; 13 → "thirty" | NW-4 | **[evidenced]** the same phonological confusion the teen literature names |

**M-X1 is a teaching signal, not a distractor**, here as in the operations bank: an answer that is simply one
of the numbers printed in the item means the pupil has no procedure, and it should trigger a step *back*, not
an error-analysis page.

---

## 17. Density check: does the item fit our page?

Read against `WORKSHEET_DESIGN_STANDARD.md` §12.1 (ceilings by page role) and §12.3 (capacity tables), and
`design/PAGE_TYPES.md` §3.5 (this family's page type). **Where the two differ, the teaching cap binds** — the
layout engine may place fewer than a ceiling, never more.

| Cell shape | Steps | Layout ceiling (S / M / L) | Teaching cap | Verdict |
|---|---|---|---|---|
| Count, side layout, n ≤ 10 | CT-1 … CT-5 | 14 / 12 / 10 (2 columns, PT §3.5) | 6 on a lesson page; up to 16 for one-symbol answers | **Fits with room** |
| Count 11-20, double ten frame | CT-6 | 7 / 6 / 5, **1 forced column** | 6 | **Fits at S and M; the step must declare 5 at L** |
| Count, stacked, circle a numeral | CT-7 | 9 (3 columns) | 6 | **Fits** |
| Dot card (subitising) | SB-3, SB-6 | one-symbol answers: the 2 × 8 grid, 16 | 16 | **Fits.** SB-1 / SB-2 do not print at all (§6) |
| Ten frame, single / double | CT-5, TF-1 … TF-3, TN-1 … TN-3 | 16 / 16, 12 / 9, 12 / 9 | 6 | **Fits** |
| Number bond | TF-4 … TF-12 | 12 / 9 / 9 | 6 | **Fits** |
| Compare groups, n ≤ 5 each | CP-1 … CP-5 | 14 / 12 / 10 (2 columns) | 6 | **Fits** |
| Compare groups, n ≤ 10 each | CP-6 | 7 / 6 / 5, **1 forced column** | 6 | **Fits at S and M; declare 5 at L** |
| Compare two numerals | CP-7 … CP-13 | equation drill 36 / 30 / 14-21 | 6, or 12 on a decision page | **Fits with room** |
| Order 3-6 numbers (cards + boxes) | OR-1 … OR-8 | equation drill at 3 columns: 2 for L basic | 6 | **Fits at S and M; 4 at L**, because the card row and the answer row are two bands |
| Number path strip | SQ-1 … SQ-8 | strip box 8 per page at N = 5-9; 9 at N = 10 | 6 | **Fits** |
| **Hundred / 120 chart** | SQ-10 … SQ-12, SQ-14 | **1 chart + a 40 mm band** | 1 chart, 6-24 blanks inside it | **One item per page, at every size.** The step declares 1; a chart test prints on its own side |
| Base-10 mat to 99 | BT-1 … BT-11 | 16 / 12 / 9 | 6 | **Fits** |
| Base-10 mat, 100-299 | BT-12 … BT-14 | 6 / 4 / 3 | 6 | **Fits at S; the step must declare 4 at M and 3 at L** |
| Base-10 mat, 300+ | BT-12 at larger targets | 3 / 3 / 2 | 6 | **Does not fit.** Declare 3 / 3 / 2, or do not offer size L for three-digit builds above 299 |
| Odd / even, pairing model | OE-1 … OE-3 | ten frame double: 16 / 12 / 9 (10 pairs is one double frame) | 6 | **Fits to 20 and no further.** The model is not drawable above ~20, which is why OE-4 is a `fade` step and not a bigger picture |
| Odd / even, digit rule | OE-4 … OE-6 | one-symbol answers: 2 × 8 grid, 16 | 6-16 | **Fits** |
| Check-all tile page | OE-7, CT-10, SB-6 | sub-skill / decision: 12 / 8 / 6-8 | 12 | **Fits** |
| Cut-and-sort | OE-8, CT-12 | hands-on page conventions (design standard §11.17) | one sort per page | **Fits** |
| Word form, match from a bank | NW-1 … NW-4 | matching: 4 pairs per cell, 6 cells | 6 | **Fits** |
| Word form, written word | NW-5, NW-7, NW-8 | the widest answer slot in the family: a three-digit word runs past 30 characters | 6 | **Tight.** 3 columns at S, **2 at M, 1 full-width ruled line at L** |
| Judge cell (finished item + boxes) | CT-11, SQ-14, CP-14, OR-9, TF-14, BT-16, OE-10, NW-9 | error analysis: 6 / 4 / 2-4 | 6 | **Fits;** the chart judge (SQ-14) inherits the chart's 1-per-page rule |
| K picture word problem | CT-13, CP-15 | 2 / 2 / 1-2 | 2 | **Fits** |
| K one-pager (Opener) | every ladder's first step | **2 Model / 2 Guided / 2 alone** | 6 | **Fits** — this is the shape of a K lesson page and it is already in §12.1 |

Three places where the content does **not** fit and the step must say so rather than the layout shrinking
(DN-2): **the hundred and 120 charts at every size**, **three-digit base-ten builds at M and L**, and **the
written word form at L**. All three are declared in the tables above, not discovered at print time.

---

## 18. The gap table

The working list for the next wave. Read against `js/modules/data.js` (`counting` 4, `comparing` 4,
`composing` 17, `counting_mixed` 1 = **26** skills in scope) and `design/SKILL_CATALOGUE.md`.

Verdicts: **OPT** the step is this skill with option values, no new id; **FIX** the skill exists and is right
in principle but its generator does not do what the step needs; **REDO** the generator does not produce what
the name says at all; **SPLIT** one id must serve two steps via an option, or is two skills in one;
**MERGE** a twin that becomes an option value; **NEW** no skill exists; **OUT** the step's skill lives in
another category and is named here only so the step is traceable.

> **Which snapshot the verdicts are written against.** §18.1 is written against **snapshot A**, the
> committed state, because that is what the catalogue records and what is on the branch. The parallel
> `gen-counting.js` wave (§1.3, snapshot B) already advances the *presentation* half of thirteen of these
> rows — the multi-select branches, the emoji, the colour, the mouse prompts and the missing `printText`
> are gone for every id that generator owns. **It does not change a single verdict**, because every verdict
> below turns on content or options, not presentation: the arrangement option still does not exist, the
> band still does not bind, the answer is still in the hint on five ids, `base10_regroup` still does not
> regroup, and nothing in the family can produce a judge page. Where a row's *defect list* is stale in
> snapshot B, §1.3 says so once rather than the row saying it twenty times.

### 18.1 Step → skill today

| Step | Skill today | Verdict | Note |
|---|---|---|---|
| CT-1 … CT-2 | `counting:count_objects` | FIX | Needs `band` and `arrangement` as options. Today: colour fills, a heart (not in PT-KCT-7's eight), "Count them!", and 11 distinct items in 120 |
| CT-3 | `counting:count_objects` | OPT | `band` edges — 0 and 1 must be generable. Today a set of **one** occurs by accident, never zero |
| CT-4 | `counting:count_objects` | OPT | `arrangement = scattered`, plus the `count-cross` instruction. **No arrangement control exists today** |
| CT-5 | `counting:count_objects` | OPT | `arrangement = ten-frame order`. Overlaps `ten_frame_build`; keep both, one draws, one counts |
| CT-6 | `counting:count_objects` | OPT | `arrangement = double ten frame`, band 20 |
| CT-7 | `counting:count_objects` | OPT | `response = circle one of three` (PT-KCT-4). The item exists nowhere today |
| CT-8 | `composing:ten_frame_build` | OPT | The draw-the-set response already exists; it needs an empty-frame print cell and a prompt with no mouse words |
| CT-9 | — | **NEW** `match_set_numeral` | Catalogue CC-5. MW4K's *Matching Objects and Numbers* |
| CT-10 | `counting:count_objects` | SPLIT | This **is** the 25% multi-select branch, made honest: its own step, its own id or its own option, with drawn groups and no emoji |
| CT-11 | — | **NEW** `count_check` | No judge page exists anywhere in the family (§3.1) |
| CT-12 | `comparing:classify_count` | REDO | Every object is captioned with its name and a colour legend repeats it, so the item is reading. The "Color" category cannot print at all |
| CT-13 | — | OUT | K picture word problems belong to the addition family's `story-k` role |
| SB-1 … SB-7 | — | **NEW ×2** `subitise_dots`, `subitise_parts` | **No skill covers any rung of SB.** SB-1 / SB-2 are a screen and Opener item only (Q2) |
| SQ-1 … SQ-4 | `counting:count_sequence` | FIX | The best cell in the family, and the closest to done. Needs: `ask` as an option not a coin flip, and SQ-4's no-path fade. **"between", the capitals and the path printing the answer were all closed between snapshots B and C (§1.3) — do not re-fix them; re-measure before touching this id** |
| SQ-5, SQ-6 | `counting:count_sequence` | OPT | `band = 120`. Today `rng(1,19)` ignores `state.range` entirely — 19 was the largest number in 120 items |
| SQ-7, SQ-8 | — | **NEW** `count_on_from` | Catalogue CC-9 |
| SQ-9 | `counting:number_seq_fill` | OPT | `chart = strip 1-20, blanks = 1` |
| SQ-10 | `counting:number_seq_fill` | FIX + OPT | `chart = 1-100`. Today the chart type is picked per item, so one page mixes a hundred chart with a count-by-tens strip (§1.3) |
| SQ-10 | `composing:hundreds_chart_fill` | MERGE | Alias of `number_seq_fill` `chart=1-100, blanks=1`. Both ids and both share codes stay. **Its options defect does not reproduce** (§1.3) |
| SQ-11 | `counting:number_seq_fill` | OPT | `blankPattern = one row / one column`. No pattern control today; blanks are 2-7 at random and scattered |
| SQ-12 | `counting:number_seq_fill` | OPT | `chart = 1-120`. **A 120 chart does not exist today**, and math-drills sells it as a standard type |
| SQ-13 | `counting:number_seq_fill` | OPT | `responseScope = decision` |
| SQ-14 | — | **NEW** `chart_check` | Or `number_seq_fill` `responseScope = judge` |
| — | `counting:number_seq_fill` | SPLIT | The `10-100`, `100-1000`, `1000-10000` variants are **skip counting** and belong to the patterns ladder (§3.2) |
| CP-1 … CP-3 | `comparing:compare_groups` | FIX | Three question types rotate on one page; `same_check` has 3 options where more/fewer have 2; MORE / FEWER / SAME in capitals; the groups are told apart by fill colour; the answer is one of two buttons, i.e. a 50% guess |
| CP-4, CP-5 | — | **NEW** `match_one_to_one` | Catalogue CMP-4. **M-P1 has no step today**, and it is the best-evidenced misconception in the family |
| CP-6 | `comparing:compare_groups` | OPT | `band = 10`, `compareForm = circle the numeral` (PT-KCT-5 Level 1) |
| CP-7 | — | **NEW** `compare_numerals_10` | Catalogue CMP-5 |
| CP-8 … CP-13 | `placevalue:compare` | OUT + FIX | Lives in `placevalue`. `numDigits = rng(3, maxDigits)` means **2-digit comparing is unreachable** and both numbers always have the same length, so CP-9, CP-10 and CP-12 cannot be built until it is fixed |
| CP-11 | `placevalue:compare` | OUT + OPT | `responseScope = notation` |
| CP-14 | — | **NEW** `compare_check` | |
| CP-15 | `addition:comparison_word` | OUT | Already passes the operations gate |
| OR-1 … OR-10 | `placevalue:order_least_to_greatest`, `order_greatest_to_least` | OUT + FIX | Live in `placevalue`, tagged "M" while spanning K to 5. `maxN = max(count+1, range)` allows {3, 7, 12, 58}; the count is `randInt(3, 6)` so the footprint changes item to item; the prompt is a mouse instruction in capitals |
| TF-1, CT-8 | `composing:ten_frame_build` | FIX | 17-word mouse prompt; the target is stated so the paper task is "draw N counters" with no empty-frame cell; `rng(1,10)` with no ordered progression; the **hint states the answer on all 120 items** |
| TF-2, TF-3 | `composing:make_ten` | FIX | Two variants rotate; the caption restates the prompt; `filled = rng(1,9)` so the 9-and-1 … 1-and-9 set is never walked in order; 16 distinct items in 120 |
| TF-4 … TF-8, TF-10 | `composing:number_bonds` | FIX | Two variants rotate; the ten-frame variant's prompt is the complete number sentence; the whole is random per item so there is no one-whole-per-page; purple whole / orange unknown / green known; **17-word prompt**; the hint contains the answer on 60 of 120 |
| TF-9 | `composing:number_bonds` | OPT | `format = number sentence` |
| TF-11 | `composing:number_bonds` | OPT | `scaffold` fade — **no skill in this family supports a scaffold fade today** |
| TF-12 | `composing:number_bonds` | OPT | `whole = 20` and teen wholes |
| TF-13 | `composing:make_ten` | OPT | `responseScope = decision` |
| TF-14 | — | **NEW** `bond_check` | |
| TN-1 | `composing:ten_frame_build_teen` | FIX | `rng(11,20)` includes **20**, which is two full frames, not a teen; the hint gives the decomposition; the same mouse prompt; 10 distinct items in 120 |
| TN-2 | `composing:teen_compose` | OPT | `responseScope = notation` |
| TN-3 … TN-5 | `composing:teen_compose` | FIX + SPLIT | Three forms rotate (`tenframe`, `10 + __ = 17`, `What is 10 + 7?`), confirmed in the dump; the visual **prints "10 + 7 = 17"** under the frame on every item; ones `rng(1,9)`, so 11 and 12 sit inside the "ten and some more" step |
| TN-6 | — | **NEW** `teen_eleven_twelve` | Catalogue CM-8, and Fuson is the reason |
| TN-7 | `composing:teen_compose` | OPT | `teenRange` including the irregular prefixes |
| TN-8 | — | **NEW** `teen_numeral_choice` | **M-T3 has no step today** and it is the best-evidenced misconception in the teen band |
| TN-9 | `composing:base10_build` | OPT | `band = teen`, one rod |
| TN-10 | `composing:teen_compose` | OPT | `scaffold` fade |
| TN-11 | `composing:teen_compose` | OPT | `band` edge: 19 → 20 |
| BT-1, BT-2 | `composing:tens_foundation_visual` | FIX | Rods 1-9 only — **9 distinct items in 120**; no 0 tens, no 10 tens; the hint names the colour ("Each tall green rod"); the caption duplicates the prompt. **Its options defect does not reproduce** (§1.3) |
| BT-3, BT-6, BT-7 | `composing:base10_build` | FIX | The hint states the full decomposition on **all 120 items**; `rng(11,99)` ignores `state.range`; no tens-only and no teen step; mouse prompt |
| BT-4, BT-5 | — | **NEW** `tens_ones_write` | The no-drawing response. `base10_build` cannot express it, because its answer type *is* the drawing |
| BT-8 | — | **NEW** `ten_ones_trade` | The concept step for regrouping. **Nothing in the family teaches the trade as a concept** |
| BT-9 | `composing:base10_regroup` | OPT | `responseScope = decision` — once the id does something |
| BT-10, BT-11 | `composing:base10_regroup` | **REDO** | The live item is *"Build 75 …, then use the "Decompose 1 ten" button …"*, `q.ans` is the build target, and nothing checks that a trade happened. The print cell is a copy of `base10_build`, so **regrouping never appears on paper at all** |
| BT-12 … BT-14 | `composing:base10_build_hundreds` | FIX | `rng(100,999)` ignores range — **984 at Max Number 100**; the hint gives the decomposition on all 120; `allowRegroup = true` on a plain build with no reason |
| BT-15 | `composing:base10_build` | OPT | `scaffold` fade |
| BT-16 | — | **NEW** `base10_check` | |
| OE-1 … OE-3 | `composing:odd_even` | SPLIT | Three types roll 40/30/30 with three answer types and, in the select branch, an **answer in tile indices** (`"2,3,4"`). The pairing caption states the answer; pairs truncate above 20 as "… (35 pairs)" |
| OE-4 … OE-6 | `composing:odd_even` | OPT | `parityModel = ones-digit rule`, band 100. The option tiles' "ends in 6" caption must go — it is the rule applied for the pupil |
| OE-7, OE-8 | `composing:select_even_odd` | FIX | The select-all branch of `odd_even` aliases here. "Click ALL" and capitals; `seoMax = max(20, min(range,100))` ignores a range of 10; six tiles and 2-4 correct every time; **0 never in the pool** |
| OE-9 | — | **NEW** `odd_even_sums` | Catalogue OE-5 (2.OA.C.3); MW4K's *Sum and Difference* type |
| OE-10 | — | **NEW** `odd_even_check` | |
| NW-1 … NW-4 | `composing:number_word_form` | SPLIT | Two modes rotate plus a 25% multi-select that mixes standard, word **and** expanded form in one item — three skills at once. The match-from-a-bank response does not exist |
| NW-4 | — | **NEW** `word_forty_fourteen` | Or `number_word_form` `responseScope = decision`. M-W4 has no step |
| NW-5 … NW-8 | `composing:number_word_form` | FIX | `to_words` compares free text to an exact string, so "forty two" is marked wrong (against P-LG-15); `maxNum = min(range, 9999)` puts 4-digit numbers in a grade-2 skill; the place chart colours each place |
| NW-5 … NW-8 | `placevalue:number_word_names` | OUT + MERGE | Alias with `wordTask = match from a bank`, 6-7 digits |
| NW-9 | — | **NEW** `word_form_check` | |

### 18.2 Skills with no step of their own

Not a defect in most cases — P-27 still requires them to render on every page role.

| Skill(s) | Why it has no step | What to do |
|---|---|---|
| `counting:mixed_counting`, `comparing:mixed_comparing`, `composing:mixed_composing`, `counting_mixed:counting_all` | Review pools by design; they belong to no ladder | **Keep, but make them honest.** `counting_all` emits 12 answer types and 11 print formats and reaches 724; `mixed_composing` reaches 958. Both draw unit-fraction tiles onto a K-2 page. A pool declares its member set explicitly and **excludes the three fraction ids** |
| `comparing:compare_objects` | It compares **lengths and heights**, not numbers. It is a measurement skill filed in `comparing` | Keep the id where it is (rule 7) and give it a step in the measurement family's ME ladder alongside `order_objects_length` and `measure_nonstandard`. Its defects — a 25% multi-select branch, bars told apart by colour, two bars giving a 50/50 guess, no "same length" case, no unaligned-start non-example — are recorded there |
| `composing:fraction_number_line`, `whole_as_fraction`, `compose_whole` | Grade-3 **fraction** skills sitting in `composing` for historical reasons | Keep the ids where they are (rule 7). Their ladder steps belong to the fractions review. `compose_whole` is the only id in this family that genuinely produces **1 distinct item in 120** and cannot fill a page, a Test A / B or a key |
| `placevalue:*`, `number_sense:*` | The abstract half of place value: name the place, value of a digit, expanded form, the disks, more/less, rounding, estimation | Out of this document's scope (§3.2). `placevalue:compare` and the two `order_*` ids are the exception: CP-8 … CP-13 and the whole of OR depend on them, so §18.1 names them **OUT + FIX** rather than leaving the steps homeless |

### 18.3 Skills whose name does not match what they teach

The list the next wave should read first, because each one is a sheet that goes out wrong. Rule 1: **fix the
name, do not add an exemption.**

| Skill | Label today | What it actually does | Correct name / step |
|---|---|---|---|
| **`base10_regroup`** | "Regroup with Base-10 Blocks (Drag)" | **Does not regroup.** The item is *"Build 75 with base-10 blocks, then use the "Decompose 1 ten" button to regroup"*; `q.ans` is 75, the build target; nothing checks a trade; the print cell is identical to `base10_build`. Twenty words, and the mathematics is absent | **"Rename a Ten"** — `45 = 4 tens 5 ones = 3 tens __ ones` (BT-10, BT-11) |
| `count_objects` | "Count Objects (1-20) (Visual)" | Two skills in one id: counting one drawn set (70%) and *"Click ALL groups that show 7"* over **emoji** (30%). The counted branch draws in four accent colours, uses a heart, exclaims, and counts sets of one | Split: **"Count Objects (1-20)"** (CT-1 … CT-6) and **"Circle Every Group That Shows __"** (CT-10) |
| `select_even_odd` | "Click ALL Even/Odd Numbers (MAP)" | A mouse verb, two words in capitals, and a test brand in the name of a pupil-facing skill | **"Find Every Even Number"** / **"Find Every Odd Number"**, one per section (OE-7) |
| `ten_frame_build`, `ten_frame_build_teen`, `base10_build`, `base10_build_hundreds`, `pv_disks_build` | "… (Drag)" | "(Drag)" is a device word on a skill that must print. Four of the five also carry a mouse sentence in the prompt (*"Drag counters from the palette into the cells"*) | Drop "(Drag)" from every label; the prompt becomes **"Draw the counters."** / **"Draw the blocks."** |
| `odd_even` | "Odd or Even? (Visual)" | Honest for the judge type, but two of its three types are select-all, and the select type answers in **tile indices** (`"2,3,4"`), which cannot print as a key | Keep the name for the judge step (OE-3, OE-4); the select type aliases to `select_even_odd` |
| `number_seq_fill` | "Number Sequence: Fill Missing (Grid)" | One item is a 1-100 hundred chart, the next a count-by-tens strip `[10, 30, 70]`. Two skills, no teacher control, and the 10s / 100s / 1000s variants are skip counting | **"Fill the Missing Numbers on a Chart"**, with `chart` as a tick-box option; the skip-count variants move to the patterns ladder |
| `teen_compose` | "Teen Numbers: 10 + Ones (Visual)" | Includes **11 and 12**, which are not teen numbers by name, and prints `10 + 7 = 17` — the answer — under the frame on every item | Restrict to 13-19 (Q5); 11 and 12 become `teen_eleven_twelve` |
| `ten_frame_build_teen` | "Build a Teen Number on Two Ten Frames (Drag)" | Targets `rng(11,20)`, so **20** — two full frames — is generated as a "teen number" | Cap at 19 |
| `hundreds_chart_fill` | "Hundreds Chart - Find the Missing Number (Visual)" | Honest, and the generator is clean (68 distinct in 120, no options). But it is the twin of `number_seq_fill`'s 1-100 variant with one blank | **MERGE** as an alias; keep the id and the share code |
| `mixed_composing` | "Mixed Number Sense" | The label collides with `number_sense:mixed_number_sense`, and the pool draws grade-3 fraction tiles onto a K-2 page | **"Mixed Composing & Decomposing"**, with the three fraction ids excluded from the pool |
| `counting_all` | "All Counting & Cardinality" | Emits 12 answer types and 11 print formats including `compose-fraction-tiles`; reaches 724 | Same: the name promises counting, so the pool must contain counting |
| `classify_count` | "Sort & Count by Category (Visual)" | Every object is captioned with its name and a colour legend repeats the captions, so the task is reading, not sorting. The "Color" category draws Red / Blue / Green / Yellow **in those colours** — an item whose answer is carried by colour cannot print | **REDO** as an uncaptioned mixed set of two kinds (CT-12) |
| `compare_objects` | "Compare Attributes (Visual)" | Honest, but it is **measurement** in the `comparing` category | Keep the id and the name; give it a step in ME, not here |

### 18.4 The counting problem this specification creates

This specification calls for **about 15 new skill ids** — far fewer than the operations wave's 33, because
most K-2 steps are an option value on a skill that already draws the right picture. The NEW rows are:

`match_set_numeral`, `count_check`, `subitise_dots`, `subitise_parts`, `count_on_from`, `chart_check`,
`match_one_to_one`, `compare_numerals_10`, `compare_check`, `bond_check`, `teen_eleven_twelve`,
`teen_numeral_choice`, `tens_ones_write`, `ten_ones_trade`, `base10_check`, `odd_even_sums`,
`odd_even_check`, `word_forty_fourteen`, `word_form_check`.

Nineteen if every judge id is its own skill; **eleven** if the eight `*_check` ids become
`responseScope = judge` on their parent instead, which is the recommendation (Q7).

`node tests/scripts/ws-code-snapshot.mjs` reports today:

```
ws-code-snapshot: OK (591 codes, 35 categories, +19 appended since the pinned baseline of 572,
no frozen code or position moved, no frozen skill deleted, insertion + retirement stable)
```

Appending is the designed path: the script patches a probe skill into `data.js`, retires a middle one and
asserts that no existing code moves. The printed number is a **live count** and will rise by exactly the
number of ids appended. A number that *falls*, or any "frozen code changed" / "positional index changed"
line, is the real failure. This was settled for P5 (the count went 572 → 591) and no re-ruling is needed.

### 18.5 What the next wave should build first

In order, because each unblocks the next:

1. ~~**Extend `ws-content-audit.cjs` to this family.**~~ **In flight** — the parallel wave has done it and
   the run now reads 189 skills (§1.3). Two classes are still worth adding: **`answer-in-item`** (the hint
   or the visual contains the answer — true on all 120 items of five ids, in both snapshots) and
   **`banned-verb`** (a pupil-facing string starting with a verb that is not in the §10.2 print verb list —
   which would have caught item 2 below on the day it was written).
2. **Get `Tick` out of the new pupil-facing strings before they are committed.** Five `printText` strings in
   the uncommitted `gen-counting.js` begin with it; §10.2 removed the verb on 2026-09-19 and P-LG-14 says it
   is never used anywhere a pupil reads. The library string is **"Check one box."** (`rule-yes-no`). This is
   first because it is a regression in work that is otherwise a large step forward, and it is cheapest to
   fix before the commit.
3. ~~**Remove every random multi-select gate.**~~ **Done for `gen-counting.js`** (options fell to zero on
   five ids). Still live on the four ids the other generators own: `odd_even`, `select_even_odd`,
   `number_word_form`, and `number_seq_fill`, whose four options are the answer string with a digit
   appended.
4. **Move the answer out of the hint.** `make_ten`, `ten_frame_build`, `base10_build`, `base10_regroup` and
   `base10_build_hundreds` put the full decomposition in the hint on **every one of 120 items**, in both
   snapshots, and the hint is printed on practice items. The decomposition belongs in `workedSteps` and on
   the Model page.
5. **Make `state.range` bind.** `base10_build_hundreds` reaches 984 at Max Number 100; `count_sequence`
   never leaves 1-20 at Max Number 100. Both directions are the same bug and both survive snapshot B.
6. **`base10_regroup`** (§18.3), because that id prints a false label and its paper cell contains no
   regrouping at all.
7. **The `arrangement` option on `count_objects`**, which unblocks CT-4, CT-5 and CT-6 — three steps for one
   option — and settles Q1.
8. **The eight judge pages**, once Q7 is answered, because `judge` is the page role this family is missing
   entirely and the one that teaches one-to-one correspondence.

---

## 19. Questions for the owner

Seven that block the next wave, then four that shape it. Each has a recommendation.

### The seven that block

**Q1 — Arrangement: a ladder delta, or the within-step fade?**
`design/PAGE_TYPES.md` PT-KCT-2 makes the scaffold fade inside one step *be* the arrangement (Model =
ten-frame order, Guided = rows of 5, Independent = scattered). §5 makes arrangement a step delta. P-6 says
the format never changes inside a step, so both cannot hold.
*Recommendation:* **the ladder wins.** Arrangement is fixed across every page role of a step; the within-step
fade is the trace numeral and the caption. PT-KCT-2's arrangement ladder still governs a skill printed
stand-alone from the dialog with no step chosen. One sentence in PT-KCT-2 settles it.

**Q2 — Does subitising print at all?**
Neither primary reference sells it as a worksheet type, and on paper you cannot tell whether a pupil counted.
*Recommendation:* **split it.** SB-1 and SB-2 are an **Opener warm-up band and a screen item only**, and
never print as an Independent page; SB-3 … SB-6 (match the pattern, see two parts, five-and-some, which cards
show 5) print, because their response cannot be produced by counting without the mark showing. If you would
rather it did not exist on paper at all, SB collapses to two rungs and the ladder count falls to nine.

**Q3 — How far does the counting band run before place value takes over?**
IXL sells "Count objects to 120". Our cell holds a countable set and our page holds six.
*Recommendation:* **object counting stops at 20.** To 20 the pupil counts drawn objects (double ten frame,
PT-KCT-1). Above 20 the pupil counts **tens** (§12 BT) or moves **along the chart** (§7 SQ), and the 120 band
is a *sequence and chart* band, not a *counting-objects* band. That is the biggest single difference between
this specification and the reference sites and it is what makes the family fit the page. The consequence to
accept: CCSS 1.NBT.A.1's "count to 120, starting at any number" is met by SQ-5 … SQ-12, not by CT.

**Q4 — Plain counters or line-art pictures by default?**
P-31 and PT-KCT-7 both already say **plain counters by default**, with the eight line-art pictures (star,
apple, fish, car, ball, flower, turtle, block) as the teacher's alternative. `count_objects` today draws in
four accent colours and uses a **heart**, which is in neither set.
*Recommendation:* **keep plain counters as the default and do not reopen it** — they are age-neutral, they
photocopy, they never become the thing the pupil is looking at, and a set of identical counters is what makes
the comparing non-example (CP-5) drawable at all. Offer the eight pictures per section for pupils who need
the interest, one kind per cell, and **retire the heart**. The one place a picture earns its keep is CT-12
(sort two kinds and count each), where two kinds must be visibly different and two counter shapes would do
the job just as well. If you disagree, the option already exists; only the default moves.

**Q5 — Do teen numbers get their own ladder, or sit inside place value?**
*Recommendation:* **their own ladder (§11), placed between ten frames and base ten.** Three reasons, and the
third is the one that decides it. (1) The research is unambiguous that the English teen words are learnt as
separate words, so they are a *vocabulary* problem as much as a place-value one, and an ELL class feels that
twice over. (2) The samples drill them hardest, and a step buried inside place value cannot carry that much
practice. (3) The misconception that matters — writing 41 for fourteen — is a **numeral** error, not a
place-value error, and it needs its own discrimination step (TN-8), which place value has no room for.
Inside the ladder, **restrict "ten and some more" to 13-19** and give 11 and 12 their own step, because they
carry no -teen cue at all.

**Q6 — Word-form marking.**
`to_words` compares free text to an exact string, so "forty two", "Forty-Two" and "four hundred and six" are
all marked wrong. P-LG-15 says any equivalent answer is accepted unless the instruction asks otherwise.
*Recommendation:* **normalise case, hyphens, commas and a leading "and" before comparing, and accept all of
them.** Then teach the US form positively with a "Remember … NOT …" line at NW-8, and keep the un-normalised
forms as **distractors on the judge page (NW-9) only**. Marking an ELL pupil wrong for "three hundred and
five" teaches them that their English is wrong; showing them both on a judge page teaches them which one this
school writes.

**Q7 — Eight judge ids, or one option on eight parents?**
`judge` is the page role this family lacks entirely, and it is the one that makes a counting error visible.
*Recommendation:* **`responseScope = judge` on the parent skill**, not eight new ids. A judge cell is the
step's own cell with a printed answer and two boxes — P-AT-6's rule exactly — so it is an option value, not a
new procedure, and it keeps the new-id count at eleven instead of nineteen. The one exception worth making is
`count_check`, because the wrong answer has to be shown **against the drawn set**, which is a genuinely
different cell.

### The four that shape

**Q8 — What blank share should a hundred chart default to?**
math-drills publishes "partially filled (20%)" as a standard type, which is 20 blanks on a 1-100 chart.
*Recommendation:* **20% on a chart, 1 blank on a 1-20 strip**, with `blanks` and `blankPattern` as options.
Twenty blanks is a lot of writing for one page, but a chart *is* the page (§17: one per page), so the
writing load per page is comparable with six computation items. A Level-K pupil takes `blanks = 5`.

**Q9 — Does the K comparing cell keep three choices or two?**
`compare_groups` answers "Group A" or "Group B" today — a coin toss, and 3 distinct question texts in 120
items. PT-KCT-5 says the K response is circling a **box**, not choosing a label.
*Recommendation:* **circle the box, and seed equal groups into every set**, so "they are the same" is always
live and the guess rate drops from 50% to 33% without adding a third button. The group letters stay as
labels, in black, and never as the answer.

**Q10 — Should `compare_objects` stay in the `comparing` category?**
It compares lengths and heights, which is measurement. Rule 7 forbids moving it.
*Recommendation:* **leave the id exactly where it is and give it a step in the measurement ladder.** A skill's
category is a share-code coordinate, not a statement about mathematics. What must change is the **Skills
Navigator's domain filter**, so a teacher looking for comparing numbers is not handed a bar-height item; that
is a tag, not a move.

**Q11 — Grade tags that span five years.**
`number_seq_fill`, `mixed_counting`, and the two `order_*` ids are tagged "M" while spanning K to grade 5;
`number_word_form` is tagged grade 2 and reaches four digits.
*Recommendation:* **keep the tags and bound the content by the step's option**, so a grade-2 page cannot emit
a four-digit number whatever Max Number says. Changing a grade tag changes what the Navigator's grade filter
returns and therefore what a teacher finds; changing the option changes only what prints.
