# Wave 2 tagging: Year 3 (US Grade 2) — round 13

Output: `data/curriculum/links/Y3.json` (134 steps, 12 blocks, block order, none skipped). Items: `Y2-Y3-items.md`.

## Counts

| Steps | full | partial | gap | proposals new | proposals reused | tag fixes | entries with real opts |
|---|---|---|---|---|---|---|---|
| 134 | 49 | 55 | 30 | 20 | 51 | 71 | 72 |

Site lessons (round 12): 25 (8 full / 12 partial / 5 gap). New proposals for lessons: `nl_tens_ones_jumps`, `estimate_inches_feet`; `make_amount_notes` (Y2's) is now used here too.

New proposals: `more_less_1_3digit`, `hundreds_any`, `exchange_count` (owner ruling: none / one in the ones / one in
the tens / two or more, on every + − × ÷ regroup band), `two_and_three_digit`, `compare_kind`, `metric_mass_capacity`,
`compare_measures`, `within_whole`, `fos_kind`, plus `money_difference` shared with Y2 and `sub_from_ten` (Y2's option, a prerequisite here). Round 3 extends `more_less_1_3digit` (ones on a 3-digit number), `within_whole` (subtraction) and `compare_measures` (lengths, one unit first).

## Round 13 (after critic Y2–Y3 r12, Y2 7.96 / Y3 8.00, lessons 8.00; builder still at Opus medium, `design/STATUS.md`)

### Row 1: the denominator check reads the cell payload (N12)
- **New `tests/scripts/wrm-tagging/Y2-Y3/denoms.mjs`** (a lane gate, `node denoms.mjs Y2 Y3 [--n 80] [--seed S] [--step K] [--all]`).
  It reads an item's denominators the way the generator does (`itemDenominators`: text, picture markup, options, tiles,
  answer) **plus the kit cell payload**: every numeric `d` / `den` / `denom` / `denominator` and every "a/b" string in it. For
  every link with `opts.denoms` (steps and site lessons; direct, partial, pre, related) it counts the items with a fraction
  outside the ticked families (`utils.js denomAllowed`), then reads the link's text (the clause, or the why with the full
  title of every step it cites). A text that names a denominator claims a family: **FAMILY** fails when the items deal a
  family (thirds, fifths, sevenths) the text does not name; **NAMED** fails when a denominator word in a positive part is
  dealt by no item (judged on 400 more items, so a rare real denominator is not a false finding).
- **The build runs it twice:** `denomNotePass` appends the hand note `denomNote[key|opts]` (overrides.mjs) to any pre / related
  why whose text claims a family its items go beyond (a missing note exits 1, DENOMNOTE), and **DENOMCHECK** re-checks the
  whole written section (120 items, seeds 52807 + 113 i) and exits 1 on any finding. The `rungDeals` text for a `denoms`
  rung now names the option ("denominators option: the halves family"), not what is dealt ("halves, quarters, eighths").
- **Before the fix**, on fresh seeds (40961 + 131 i, 80 items): Y2 4 findings (FAMILY 3: Y2.B8.S10 identify, Y2.B8.S12
  equiv_frac_visual, Y2.B8.S13 identify; NAMED 1: Y2.B8.S8 "twelfths"), Y3 13 (FAMILY 11: every `equiv_frac_visual {denoms:[2]}`
  pre citing Y2.B8.S12 and the two `identify {denoms:[2]}` pres citing "Recognise three-quarters"; NAMED 2: "ninths, twelfths" in
  the `write_fraction {denoms:[2,3]}` rung whys of Y3.B6.S1 / S3, from the option label).
- **The counts the clauses were rewritten from** (600 items, seeds 40961 / 12345 / 77001 + 97 i):

| Link | Off-family items | What they are |
|---|---|---|
| `equiv_frac_visual {denoms:[2]}` | **294 / 600** | = / ≠ checks 329, of which 254 off-family: /3 60, /5 71, /6 136, /7 9, /9 20, /10 26, /12 77, /15 23, /18 20, /20 9, /24 18 (2/3 = 6/9, 1/6 = 3/18, 3/5 = 6/10, 2/5 = 8/20, 3/5 ≠ 5/7, improper 3/5 ≠ 9/5); missing-number pictures 271, of which 40 off (1/2 = 3/6, 3/4 = 9/12) |
| `identify {denoms:[2]}` | 184 / 600 | every "which model shows" item: the target is in the family, the other three pictures include /3, /5 or /6 (2/3, 1/6, 2/5) |
| `identify {denoms:[2,3]}` | 95 / 600 | "which model shows" items with fifths among the pictures (4/5) |
| `shade_fraction {denoms:[3]}` | 0 | deals /3 and /6 only: no twelfths |
| `shade_fraction` / `write_fraction` `{denoms:[2]}`, `{[2,3]}`; `graph_fractions`, `equiv_frac_nv`, `fraction_of_set(_hard)`, the add / subtract like-fraction skills | 0 | |

- **After:** `denoms.mjs` on three fresh seed sets (40961 + 131 i × 80, 90001 + 211 i × 80, 31337 + 173 i × 160): Y2 9 denoms
  links (7 key + opts), 3 deal an off-family fraction, 9 texts name a denominator; Y3 78 links (14 key + opts), 21 deal an
  off-family fraction, 20 texts name a denominator; **0 findings in every run**. The build's DENOMCHECK: 0 / 0.
- The round-12 claim "every `denoms` link regenerated: 0 off-family" is **withdrawn**: that check read the generator's fields only.

### Row 2: the generator blind spot (recorded, not fixed: generator files are outside this lane)
- **`js/modules/generate-question.js` `itemDenominators(q)` (≈ l.304), used by `p12Acceptor` (≈ l.381–391) for the `denoms`
  option, ignores `q.cell.payload`.** An item whose fractions live only in its kit cell passes the filter with any denominator:
  the = / ≠ items of `equiv_frac_visual` (`payload.terms[].d`, about half the page) and its missing-number items whose answer
  is the bare denominator (`1/2 = 3/?`, `payload.answer.d`). **Fix:** add the payload's denominators to `itemDenominators`
  (every numeric `d` under `terms`, `show`, `answer`, and "a/b" strings in the payload; `denoms.mjs payloadDens` is a reference
  walk). Check the redraw rate after: 254 of 329 = / ≠ items are off-family under `{denoms:[2]}`, so the sign task may need to
  draw its pair from `denomAllowed` directly rather than rely on the 80-try redraw. **When it is fixed, the Y2.B8.S12 / S10 /
  S13 clauses and the `denomNote` texts revert** (DENOMCHECK will then report NAMED on the families no longer dealt).
- Added to the owner bug list below.

### Row 3: Y2.B8.S12 and the other Y2 fraction clauses
| Step | Clause now (partial) |
|---|---|
| **Y2.B8.S12** `equiv_frac_visual {denoms:[2]}` | "the missing-number pictures are the halves family (1/2 = 2/4, 3/4 = 12/16) with a few sixths and twelfths (1/2 = 3/6), but about half the items are = / ≠ checks that compare fractions outside it: thirds, sixths, ninths, twelfths and eighteenths (2/3 = 6/9, 1/6 = 3/18), fifths, tenths, fifteenths and twentieths (3/5 = 6/10, 2/5 = 8/20), sevenths (3/5 ≠ 5/7) and improper fractions (3/5 ≠ 9/5); a page of 1/2 = 2/4 only is not available" |
| Y2.B8.S13 `identify {denoms:[2]}` | "… it deals eighths (1/8, 7/8), and every "which model shows" item (about a third of the page) has thirds, sixths or fifths among its four pictures (2/3, 1/6, 2/5); not 3/4 alone" |
| Y2.B8.S10 `identify {denoms:[2,3]}` | "… and some "which model shows" items have fifths among the pictures (4/5)" added |
| Y2.B8.S8 `shade_fraction {denoms:[3]}` | "the thirds family also deals sixths: …" ("and twelfths" removed: 0 of 600) |

Every example in these clauses was read on generated items. Verdicts and builds are unchanged (partial, `single_fraction`).
The merge carries the new clauses as `partial` tagFixes; mergecheck 0.

### Row 4: the Y3 pre whys (Y3.B6.S9, Y3.B6.S8, Y3.B8.S2 and the rest of the class)
- Every `equiv_frac_visual {denoms:[2]}` pre (Y3.B6.S8, S9, S10, Y3.B8.S1–S6) now says what it deals after the cited title:
  "— equivalence pictures (1/2 = 2/4), but about half the items are = / ≠ checks in other families too: thirds, sixths, ninths and
  twelfths (2/3 = 6/9), fifths, tenths and twentieths (2/5 = 8/20), and sevenths (3/5 ≠ 5/7)". The Y3.B6.S9 / S10 rung no longer
  says "(denominators: halves, quarters, eighths)" but "(denominators option: the halves family)".
- The `identify {denoms:[2]}` pres of Y3.B6.S1 / S4 (citing "Recognise three-quarters") add "every "which model shows" item has
  thirds, sixths or fifths among its four pictures". The `write_fraction {denoms:[2,3]}` rungs of Y3.B6.S1 / S3 no longer
  name ninths and twelfths.
- The two related `equiv_frac_visual` links of Y3.B6.S2 / S5 cite a later step under "nearest live practice" and name no
  family, so they stay as they were.

### Row 5: optional rows, all done
- **SPECOPTS** (critic r12 M1, the Y5 lane's `specopts`): the build snapshots every entry's skills — direct / partial from the
  spec, pre / related at the moment OPTGATE passes them, lessons from `lessons.mjs` — and after the write reads the file back
  from disk and compares it one to one (order included). Y2 1,072 links of 135 entries, Y3 1,244 of 159: 0 differences.
  **Mutation-proved** in fresh `git archive` trees: (m1) the critic's m3, `base10_build` / `add_100_regroup` → `band:50` on
  Y2.B2.S15 / Y3.B2.S13 placed after the gate: exit 1, "SPECOPTS Y2.B2.S15 pre spec [base10_build|{band:99}] written [{band:50}]"
  and the same for Y3.B2.S13; (m2) every lesson's first related re-optioned after the lesson checks: exit 1, 6 Y2 and 6 Y3
  lessons named. (m3) the r12 Y2.B8.S12 clause restored: DENOMCHECK exit 1 (FAMILY: fifths). (m4) the `equiv_frac_visual`
  note deleted: DENOMNOTE exit 1 on all 9 Y3 pres.
- **Y2.B1.S11 lead pre**: `place_on_number_line {span:10, band:100}` was the step's own partial (same key and opts, through
  `selfPre`); dropped, and `selfPre` cleared. No K or Grade 1 skill deals a shorter line (the skill has no band below 100).
  The lead is now `tens_foundation_visual {band:90}` (Y1.B12.S2 Tens to 100), then the count to 100 and compare.
- **M3** Y2.B11.S5 related `number_pattern {band:50}`: "finding the rule of a number pattern and continuing it (fill the missing
  numbers, or put numbers in counting order): the same what-comes-next reasoning, without turns" (items: "Find the pattern.
  Fill in the missing numbers. 18, 20, 24", "Drag the numbers in reverse counting order").
- **M4** Y2.B11.S2 / S4 related `place_on_number_line {span:10, band:20}`: dropped (a tap on one number; band 20 changes
  nothing). Y2.B11.S2 now has no related and carries its round-11 note; Y2.B11.S4 keeps half past (a half turn).
- **M5** Y3.B7.S10 related `money_compare` now `{response:'sign'}` ("Write <, > or = in the circle" between two coin sets),
  why "two amounts of coins compared with <, > or =: the same signs, between amounts in cents".
- **Sweep, critic r12 M2:** `claims.mjs negatedHits` now reads a story's operation from the kit cell payload (`steps[].op`,
  "op":"-") and its take-away / join words when the words carry no sign, and judges a **negated unit** ("never grams", "no mL",
  "not litres or millilitres": a part that is only unit words) one unit at a time against the items (fails above 5%). The
  money claim also reads the payload (a coin picture has no words). Mutations (`sweep()` on edited copies, the critic's
  `mutsw.mjs` extended): "never subtracts" on the `sub_wp_20` story clause → a-neg 30/30; "never adds" on `add_wp_20` → 30/30;
  "reads kilogram dials only; never grams" → 12/30; "never mL" on the cylinder step → 30/30; the controls ("never subtracts"
  and "never mL" on a g/kg dial, "never feet" on the inch ruler) do not fire. The other eight r12 mutations are still caught.
  (The r12 script edited a stale `lessons` reference after its first restore, so its M3 never reached the sweep; fixed in the copy.)

### Counts and gates (round 13)
- Counts unchanged: Y2 124 steps (63 / 36 / 25), 11 lessons (6 / 5 / 0), 66 tagFixes; Y3 134 steps (49 / 55 / 30), 25 lessons
  (8 / 12 / 5), 71 tagFixes. OPTGATE: Y2 880 links (3 fewer: the Y2.B1.S11 lead and the two M4 relateds), 839 at spec opts;
  Y3 971, 952.
- **Reproducible:** three clean `git archive HEAD` trees (A, B: Y2 then Y3; C: Y2.json / Y3.json deleted first, Y3 built
  first): exit 0 ×6, sha256 Y2 `84d6481a…bdaad3`, Y3 `15b3a6b6…b585b6` for A, B, C and the committed files; the logs are
  identical (bar node's path in its module warning). Each log: specopts 0, denomcheck 0, mergecheck 0, optgate 0, titleclaim
  0, lessons 0, bbcheck 0.
- `linkscan.mjs Y2 Y3`: OK. `sweep.mjs Y2 Y3`: OK (Y2 925 links, 53 clauses, 455 claims; Y3 1,077 links, 87 clauses, 827
  claims; a 0, a-neg 0, b 0; c 55 / 63 as read in round 12). `denoms.mjs Y2 Y3` on three fresh seed sets: OK.
- Merge: `mergeall.mjs` R → Y6 and Y6 → R: 1,040 tags, 0 problems both orders (the agreeing Y2 / Y4 duplicate on Y2.B1.S15 is
  a NOTE); `mergecheck23.mjs` 0 / 0; the critic's `merge12.mjs`: order-independent, 1 key|step written by two lanes with the
  same outcome (0 real conflicts), own-step mismatches 0 for all seven lanes.
- `ws-wrm-extract --site …/scratchpad/site/index.html --check`: exit 0 (both files up to date). `ws-boot-smoke`: OK.

### Self-check (fresh seeds)
Every entry this round touched was re-read on items from the seeds above: Y2.B8.S8 / S10 / S12 / S13 (clauses), Y2.B1.S11
(pre list), Y2.B11.S2 / S4 / S5 (related); Y3.B6.S1 / S3 / S4 / S8 / S9 / S10, Y3.B8.S1–S6 (fraction pre whys), Y3.B7.S10
(related). Each clause and why is true of its items, and I grade each of them 8. Y2.B8.S12's pres (halving, the half-and-quarter
shapes, grouping, "equal or not") are unchanged; they are thin but true.

## Round 12 (after critic Y2–Y3 r11, 7.96 / 7.96; builder escalated to Opus medium, `design/STATUS.md`)

### Part 0: the WIP commit, reviewed
`d747fdab` (the paused builder's round-12 edits) was rebuilt and kept: `bbRank` ranks every pre by building block before WRM
distance (addition / subtraction: the same operation one band lower or before the exchange, then the place-value parts and
the 1s facts, then the inverse and the fact families, word problems last; × / ÷ alike), and **BBCHECK** fails the build when
a lead pre is a word problem on a non-problem step or the inverse / a fact family / the other operation on a + − × ÷ step.
The r11 rows land: Y2.B2.S15 leads with `add_sub_10s` (Y2.B2.S4), then `base10_build {band:99}`, `unit_form`, the ones
`add_20_no_regroup`; Y3.B2.S13 / S14 lead with `add_100_regroup` (Y2.B2.S16) then `add_1k_no_regroup` (Y3.B2.S11); Y2.B2.S10
leads with `sub_20_no_regroup`, with `make_ten` and `make_a_ten` (the bridge through 10) after the counting-back pres;
Y2.B11.S2's quarter-of-a-shape pre says "the quarter turn"; a pre whose items equal the step's own (opts outside the schema,
`{range:20}`) is dropped (`sameItems`). bbcheck: Y2 124 steps / Y3 134, 0 problems.

### Part 1: tidy and base
- The lane's tooling now lives in `tests/scripts/wrm-tagging/Y2-Y3/` (`build.mjs`, `overrides.mjs`, `markers.mjs`,
  `linkscan.mjs`, `items.mjs`, `mergecheck23.mjs`, `mergeall.mjs` (was `mergeall5.mjs`), `xlsx.py`, and the new
  `claims.mjs`, `sweep.mjs`, `lessons.mjs`). The move left the output byte-identical.
- Merged `origin/claude/sweet-newton-c8wrv1` (Y5 + site lessons, Y6, R/Y1/Y4/Y5/Y6 links in `data/curriculum/links/`, PR #8
  generator fixes). The vendored `inputs/{R,Y1,Y4}.json` were byte-identical to the in-repo files and are gone: the build and
  `mergecheck23` read `data/curriculum/links/`, and `mergecheck23` merges the R, Y1, Y4, Y5 and Y6 tagFixes on Y2/Y3 steps
  before and after this file's own.
- The Y5 lane's site extraction (`ws-wrm-extract.cjs`, `site-lessons.json`, `wrm-steps.json`, `wrm-db.js`,
  `WRM_COVERAGE.md`) was already on the base, byte-identical to the Y5 branch. **Y2/Y3 step fields that changed:** no id,
  title, CCSS or EE. Added: `site` on 146 steps (`supportIn` grades; `taughtIn` copied-in or review uses) and `enrichment`
  on 83 ("Grade 2 standard" 27, "Grade 3 standard" 52, "Grade 4 standard" 3, one `true`). Removed: `usAdaptation` on
  Y2.B4.S3 / S4 / S7 / S8 (the money steps; now `enrichment: "Grade 2 standard"`). The build reads none of these fields;
  the US-money reading of the UK titles is now in the claim checker (below).

### Part 2: PR #8 follow-up (`GENERATOR-FIXES-2026-10-16.md`)
- `mass_volume_liquid` kg dials, re-judged on 100 fresh seeds (51233 + 97 i): `{forms:[1]}` deals 57 kg dials (1-9 kg, a mark
  every kg, every mark labelled) and 43 gram dials (100 g or 200 g a mark, every mark labelled, to 2,000 g); `{forms:[0,1]}`
  49 cylinders (mL, a label on every other mark), 25 g, 26 kg. No item has answer 0. No option keeps a page to grams or
  to kilograms.
- Clauses now say what is dealt: Y2.B7.S2 / Y3.B7.S2 (gram dials, but about half the items are kilogram dials; unlabelled
  marks not dealt), **Y2.B7.S3 stays partial on a new clause** (kg dials in about half the items, the rest gram dials, no
  unlabelled marks or 2 / 5 kg steps), Y3.B7.S1 (one scale at a time; working out an interval from labels several marks
  apart not dealt), Y3.B7.S3 (g or kg alone; 1 kg 200 g not dealt). The answer-0 notes are gone from every clause.
- The 8 `{forms:[1]}` pre links: the r12-WIP broken-link mechanism is emptied. The four mass steps' whys say "reading a mass
  on a dial in g or kg (every mark labelled)"; the capacity steps keep the g/kg dial rung ("the same scale reading in another
  measure"), which is sound again.
- Fraction denominators: every `denoms` link (15 key + opts) regenerated, 60 items each: 0 off-family on the families **(withdrawn in round 13: that check read the generator's fields only; the = / ≠ items of `equiv_frac_visual` carry their fractions in the cell payload, see Round 13 row 1)**
  (`{denoms:[2]}` is halves, quarters and eighths, as before). `fraction_of_set` still ignores `denoms` in its
  missing-numerator items (`?/5 of 15` under `{denoms:[2,3]}`), so that clause and owner bug stay.
- The generator bug lists below drop the kg-dial bug.

### Part 3: the root-cause guard (no silent re-optioning) and the claim sweep
- **OPTGATE** (`build.mjs`): every link's key + opts is fixed when its spec opts are set (hand opts, the cited step's own
  opts, the year default). After that a link may change only through a named spec rule: `linkFix` (per step), `linkSwap`
  (year-wide), `count0` (a count from 0 its why names), or `markerFix` **only when `markerFixOk` lists that exact change for
  that step**. Anything else exits 1. The old marker-fit loop had re-optioned **19 links silently**; each was re-read on its
  items: 13 approved with a hand-written why (`whyFix` / `relWhyFix`: Y2 halves-and-quarters shape parts on B8.S1 / S2 / S9 /
  S10 / S12 and B11.S3, half past on B8.S10 / S12, B11.S3 / S4; Y3 B3.S4 ÷2/5/10, B4.S4 ×10, B4.S11 equal groups), 6 dropped
  (Y2.B7.S5 "half full" related; Y3.B3.S8 / S11 "the inverse: dividing by 3 / 4", which the old loop had turned into ÷2/5/10
  and whose ÷3 / ÷4 is first met later; Y3.B4.S6 / S10 the 2-digit × 1-digit column, later; Y3.B4.S10 a story related).
  Result: Y2 883 links, 842 at their spec opts, the rest by linkSwap 36, count0 6, linkFix 1, markerFix 10 (approved);
  Y3 971 links, 952 at spec opts, linkFix 9, linkSwap 7, markerFix 3; 0 problems.
- **TITLECLAIM** (`build.mjs`, Y5 critic r6 H′): a why that cites a step claims that step's full title. When the title names
  what the items never deal, an "add and subtract" title on a one-operation skill gets the half marker ("the adding half",
  Y2 9, Y3 7), a skill that is only partial at the cited step gets "nearest live practice: … these items never sort" (Y2 11,
  Y3 9), and a skill that is direct there is a build error (0). UK money titles are read in dollars, cents and bills.
- Rung citations prefer the step where the key is DIRECT: the millilitre cylinder now cites Y2.B7.S6 Measure in millilitres,
  not Y2.B7.S7 Measure in litres.
- **`sweep.mjs`** (ported from the Y5 lane, `claims.mjs` copied with the refinements its header lists): every pre / related
  why and every partial clause of Y2.json and Y3.json, **steps and site lessons**, against 30 items on fresh seeds
  (27449 + 89 i, no build or critic seed): (a) every unit, representation, form, operation, number kind and context the
  text names, the cited titles included; (a-neg) a clause's "never / no" operation; (b) customary on a metric or time entry,
  metric-only on a customary entry; (c) a pre past 1.5 × its entry's ceiling. A "used for …" part is the step's purpose,
  not a claim. Exit 1 on any open (a), (a-neg) or (b).
- The first sweep of the r11 file found 150 (a) findings (most rule noise: "which way round", "the second number", "vertical
  number line", "the 2 times-tables", UK money titles); the real ones were fixed at the source: about 50 analogy whys rewritten
  with a "used for" purpose ("a number line … (used for reading a ruler)", "counting in 5s from 0 (the count used for the
  minutes)"), the `unit_form` links that claimed "12 tens = 120" (9 entries) moved to `{band:999, rename:'more'}` (5 hundreds 12 tens =
  620), the "Sort 2-D shapes" / "Measure in litres" / "Convert pounds and pence" citations marked by TITLECLAIM, the Y2.B6.S1
  clause said as "reads an inch ruler (whole inches) only; measuring in centimetres on a centimetre ruler is not dealt",
  `arrays_groups {forms:[0]}` said as arrays, `compose_from_attributes` as clicking, `skip_count_line` without "number line".
- **Final sweep: Y2 928 links, 53 clauses, 456 claims; Y3 1,077 links, 87 clauses, 826 claims: a 0, a-neg 0, b 0.** The
  118 (c) findings (Y2 55, Y3 63) were read: 52 number skills met earlier with a 2- or 3-digit number in an easier task
  (`add_1k_no_regroup` before adding four 2-digit numbers), 26 counts whose row passes 100, 11 graph totals, 10 money
  amounts read in cents against a ceiling read in dollars, 10 scale or conversion readings, 7 number lines to 100, 2
  symmetry payload coordinates. None is a harder task than its entry.
- Lead pre: BBCHECK on every step (0); the self-check (below) re-read every lead and moved four that were a sibling or a
  later calculation (Y2.B4.S8 Make a pound (a dollar) now leads with Make the same amount; Y2.B2.S5 with 1 more / 1 less; Y2.B5.S1 with
  Add equal groups (K); Y2.B11.S1 with Describe position (K)).

### Part 4: site lessons (owner rule 2026-10-16: every site lesson tagged)
A top-level `lessons` section, generated by the build from `tests/scripts/wrm-tagging/Y2-Y3/lessons.mjs`, in exactly the Y5
lane's shape (`Y5-report.md` "The `lessons` JSON shape"): `title`, `site {flag, supplement, firstWeek, ccss, ee, domain,
unit, block, power}`, `direct`, `partial` (with opts and clause), `verdict`, `missing`, `build`, `pre`, `preBuild`,
`related`, `note`, and `envision` on every lesson that is not full. Lessons tag nothing into SKILL_WRM (no tagFixes); a
proposal a lesson uses lists it under `lessons` and `closes[<lesson id>]`, never under `steps`. Every verdict was judged
from generated items with the listed opts. The build checks every lesson link as a step's: the cited step owns the key and
is taught before the lesson's first week (same year) or in a lower grade; a Support lesson (site flag enrich-native) is
judged against its SOURCE grade (its pres cite only steps of the source year or below; content markers at week 0); an
above-grade core title with no week is judged at W38; no pre repeats the lesson's own skill; >= 3 pre or a note saying why
few; title claims; and the sweep covers the section. `mergecheck23` asserts the section holds exactly the year's site
lessons, no tagFix names a lesson, and every lesson build is listed by its proposal and closed.

Y3 (school Grade 2): **25 lessons: 8 full, 12 partial, 5 gap**; 106 links.

| Lesson (site) | Verdict | Skills (opts) | Build |
|---|---|---|---|
| Read and write numbers to 1,000 in words, numerals and expanded form (committee, W02) | full | `number_word_form {to_words, to_number, range 1000}`, `expand {band:999}` | |
| Add up to four two-digit numbers (W09) | full | `add_column_multi` | |
| Solve one-step word problems using bar models (W09) | partial | `add_wp_100` / `sub_wp_100 {support:'bar'}` | `map_change_unknown_story`, `map_compare_smaller_unknown` |
| Solve two-step word problems identifying both operations (W09) | full | `multi_step_word {forms:[0,1], band:50}`: + then −, − then +, an operation circled per step | |
| Odd and even numbers (W12) | partial | `odd_even`, `select_even_odd`: no equal addends | `odd_even_pairs` |
| Add and subtract within 100 on a number line, jumps of tens and ones (W13) | partial | `number_line_add` / `_sub`: 0-20, ones only | **`nl_tens_ones_jumps` (new)** |
| Compare units: inches, feet, yards and centimetres (W17) | gap | | `measure_two_units` |
| Measure and estimate in inches and feet (W17) | partial | `reading_ruler`: whole inches | **`estimate_inches_feet` (new)** |
| Measure lengths of a set of objects to the nearest whole unit (W17) | partial | `reading_ruler`: one object | `make_line_plot` |
| Record the measurement data in a table (W17) | gap | | `table_data` |
| Show measurement data on a line plot (W18) | partial | `line_plot_g2`: reads only | `make_line_plot` |
| Solve 'longer by' / 'shorter by' problems using bar models (W18) | gap / gap | | `add_sub_lengths` |
| Partition a rectangle into rows and columns of squares (W26) | partial | `compose_rect_from_squares` (2 × 3 only), `area_unit_squares {forms:[0]}` | `rect_rows_columns` |
| Compare capacity (1) (Support, Reception) | gap | | `capacity_early` |
| Compare mass (1), (2) (Support, Reception) | full | `heavier_lighter_visual` | |
| Compare size, mass and capacity informally (Support, Reception) | partial | `compare_objects`, `heavier_lighter_visual` | `compare_size`, `capacity_early` |
| Count money - notes and coins (Support, Grade 1) | full | `money_count {usd, kind:both}` | |
| Even and odd (fair/not fair shares) (Support, Reception) | partial | `odd_even {forms:[2], range:10}` | `share_group` |
| Find the total (Support, Grade 1) | full | `money {usd, step:5, band:500}` | |
| Group equally (Support, Grade 1) | full | `share_into_groups` | |
| Record results using tally marks or a simple picture graph (Support, Kindergarten) | partial | `tally_chart {most:10, forms:[0]}`, `pictograph_intro {forms:[0]}`: read only | `collect_data` |
| Select money (Support, Grade 1) | partial | `make_change_least_coins {usd}` | `make_amount_notes` |
| Share equally (Support, Grade 1) | partial | `share_into_groups`: grouping only | `share_group` |

The seven customary-length lessons (W17-W19) carry `customaryOk` in the spec: the school teaches inches and feet there, so
the inch ruler is their own content, not a never-in-grade marker; the sweep's (b) rule still holds (no metric-only related on
the inches-and-feet lesson: its related is the quarter-inch ruler).

### Counts and gates (round 12)
- Y3: 134 steps (49 full / 55 partial / 30 gap), 25 lessons (8 / 12 / 5), 71 proposals (20 new, 51 reused), 71 tagFixes.
- Build: two builds from a clean `git archive HEAD` are byte-identical to each other and to the committed Y2.json / Y3.json;
  mergecheck 0, OPTGATE 0, TITLECLAIM 0, lessons 0, BBCHECK 0 in each build log.
- `linkscan.mjs Y2 Y3`: OK. `sweep.mjs Y2 Y3`: OK (a 0, a-neg 0, b 0).
- Merge simulation, `mergeall.mjs` R + Y1 + Y2 + Y3 + Y4 + Y5 + Y6 (Y5 from the base, = `/home/user/wt-y5`): 1,040 tags, 0
  problems in both orders (the agreeing Y4 / Y2 duplicate on Y2.B1.S15 is a NOTE). Other lanes' checkers on Y2 / Y3: R/Y1
  `mergecheck_ry1.mjs` 0 / 0; Y4 `mergecheck.mjs` 0 / 0; Y5 `mergecheck.mjs` Y5 + Y2 + Y3 0, and all seven files 0 when
  Y4 merges before Y2 (with Y2 first it prints "add on a tag that exists" for that same Y2.B1.S15 duplicate: Y4 adds the tag
  Y2 already set, with the identical clause; the merged tag is the same, so 0 real conflicts, as critic r11 §4 ruled).
- `ws-wrm-extract --site … --check`: exit 0 (both files up to date). `ws-boot-smoke`: OK.

### Self-check (rule 6, fresh seeds 88211 + 137 i)
Random 10 per year (`random.Random(121601)` Y2: B4.S8, B2.S15, B10.S3, B1.S5, B1.S13, B2.S17, B7.S5, B1.S1, B3.S5, B1.S15;
`random.Random(121602)` Y3: B10.S2, B4.S10, B1.S7, B2.S6, B2.S4, B8.S3, B2.S2, B5.S9, B10.S7, B1.S12), the r11 sevens and
rows (Y2.B2.S15, Y3.B7.S1, Y3.B2.S13 / S14, Y2.B2.S10, Y2.B11.S2), every lead pre of both files, and all 36 lessons were
re-read on their items. Found and fixed: the Y2.B4.S8 lead (Find change → Make the same amount), Y2.B2.S5, Y2.B5.S1 and
Y2.B11.S1 leads, the Y3.B4.S10 related "3 times as long" on additive bar models (dropped; the multiplicative claim now reads
"times as long / tall / heavy"), and four lesson whys. I grade every re-read step and lesson 8.

### Owner questions (round 12, with recommendations)
1. **Support lessons that are WRM steps of an earlier grade under another title** (Bonds to 10 = R.B11.S8, Compare mass (1) /
   (2) = R.B2.S2 / R.B8.S1, Count money - notes and coins = Y2.B4.S3, Group equally = Y2.B5.S7, Share equally = Y2.B5.S8 …).
   *Recommend the site use the WRM titles so they resolve to the step (as the Y5 lane recommended); until then they are
   tagged as lessons and the note names the step.*
2. **"Find the total" is an auto-match the site asks to verify.** *Recommend reading it as adding two prices in dollars and
   cents (as tagged); if it means counting a collection of coins, re-tag it to `money_count {kind:both}`.*
3. **Customary length at Grade 2 (W17-W19)**: the xlsx Grade 2 sheet has no customary step, but the site schedules seven
   inch-and-foot lessons. *Recommend the site's weeks; the lane allows inches in those seven lessons only.*
4. **`mass_volume_liquid` form 1 mixes g and kg dials (about half each)**: *recommend a `unit` option (g / kg) on the scale form,
   so Y2.B7.S2 / S3 and Y3.B7.S2 become full with it (`mass_scales` covers the unlabelled-mark part).*

## Round 11 (after critic Y2–Y3 r10, 7.94 / 7.97): rung chooser, prior-lane opts, the five-year merge

Generator (`tests/scripts/wrm-tagging/Y2-Y3/build.mjs`, `mergecheck23.mjs`, new `mergeall5.mjs`; inputs vendored read-only under
`tests/scripts/wrm-tagging/Y2-Y3/inputs/`: `R.json`, `Y1.json` from the R/Y1 lane, `Y4.json` from the Y4 lane):

- **A1 (N8, rung chooser).** For `count_by_tables` / `mult_facts` / `div_facts` the lower rung is a step whose every table
  divides one of the step's tables, with the rung at least 1/20 of it (10 for 100, 4 for 8, 2 for 4, 5 for 10; never 5 for
  100, {3, 5} for 10 or 50 for 10). The largest such table wins, then the latest, this year first. Failing that, the
  2s/5s/10s count from 0 (Y2.B1.S15). Other keys keep the latest earlier use with other opts.
  - "this step's skill as it was met then" is written only when the rung deals the same content in a smaller band, or in
    a subset of the step's forms / tables / values (`rungSame`, on effective opts).
  - Otherwise the why says what the rung deals, in the option labels of `skill-options.js` ("read the scale (g or kg)",
    "what to count: notes"), and how it relates ("every multiple of 8 is a multiple of 4", "the same scale reading in
    another measure").
  - A pre with the same items as the step's own skill (key + effective opts) is dropped: it adds no rung. The selfPre
    number lines (Y2.B1.S11, Y3.B1.S3) stay, as r10 accepted.
  - Re-scan of the 52 "as it was met then" links (the critic's `asmet.mjs`): 39 remain, and each is a smaller band or a
    subset of the step's own forms. Every other rung states what it deals.
- **A2 (N9, prior-lane opts).** `stepOptsFor()` and the skill list of an R.* / Y1.* step now come from the passed lane's
  file. K rungs arrive with their opts, so they are no longer dropped as "the step itself". The critic's `n9.mjs` goes
  from 34 rows to 4: quarters for a half step, and halves for a thirds step. Those are sibling denominators, left out
  by design.
- **A3 (merge).**
  - (a) Y2.B1.S15 carries `patterns:count_by_step_up {step:[0]}` as a partial, with Y4's clause word for word. It is
    `mergeOnly`, so it is never a link source for other steps.
  - (b) `mergecheck23` loads the R, Y1 and Y4 tagFixes on Y2/Y3 steps and merges them both before and after this file's
    own fixes.
  - (c) Every partial-setting tagFix is `action:'partial'` with a `partial` field. A new full tag is `add`. A partial
    tag that becomes full is `remove` + `add`, which R/Y1 and Y4 both read the same way.

Checks:
- Each year was built twice, and both runs are byte-identical.
- `linkscan` OK.
- `mergecheck23` reports 0 + 0 problems.
- The R/Y1 lane's `mergecheck.mjs` on Y2/Y3 reports 0 + 0; it reported 24 before.
- The Y4 lane's `mergecheck.mjs` on Y2/Y3 reports 0 + 0; it reported 102 before.
- `mergeall5.mjs` (R+Y1+Y2+Y3+Y4, both orders): 661 tags, 0 problems.
  - It is the critic's merge with one change: an agreeing cross-lane fix is a NOTE, not a problem.
  - The critic's own `mergeall.mjs` still lists 2 lines. Both are notes about the identical Y4 fix: "fix on another
    year's step" and "also fixed by Y2". Y2's EXTRA line is gone.

Step rows:
- **Y3.B1.S4.**
  - The lead pre is `count_by_tables {10s from 0}` "Y2.B5.S13 counting in 10s from 0 (Grade 1): ten 10s make 100".
  - Then `composing:base10_build {band:99}` "Y2.B1.S2 Count objects to 100 by making 10s".
  - The 5s rung is gone.
- **Y3.B4.S1.** The 50s rung is gone. The rung is now "counting in 5s from 0: every multiple of 10 is a multiple of
  5 — Y2.B5.S15".
- **Y3.B1.S14.** The rung is "counting in 10s from 0: every multiple of 50 is a multiple of 10".
- **Y3.B3.S8.** The pre is `count_by_tables {2,5,10 from 0}` "the same count from 0 that this step makes in 3s".
- **Y3.B3.S10 / S11 / S12 / S13 / S14.** Each takes the halving table: ÷2 for ÷4, ×2 and 2s for the 4s, and ×4, ÷4
  and 4s for the 8s.
- **Y3.B7.S1–S3, S7, S8.** The why names the scale it deals: "read the cylinder (mL)" or "read the scale (g or kg)",
  with "the same scale reading in another measure". Y3.B7.S1 is the one subset case: its forms are [0, 1] and the rung
  deals [0].

## Round 10 (after critic Y2–Y3 r9, 7.81 / 7.78): lower rungs, counts from 0, the merge check

- **A1 (N6, lower rungs)**: automatic pre candidates carry the cited step's own opts (`cand(…, stepOptsFor(id, k))`), and
  each of the step's skills gets its latest earlier-taught rung (same key, other opts; this year by school week, else the
  year before) as a tier-1 pre, "…: this step's skill as it was met then". A direct with `{}` takes the skill's defaults,
  so a link with other explicit opts is another rung; a pre whose parts / tables / denominators / forms / count rows are
  a superset of the step's own is still excluded, and a related link inside the step's own forms is excluded.
- **A2 (N5a, counts from 0)**: a `seq_2/5/10` or `skip_count_line` link whose why cites a count from 0 ("Count in Ns",
  "Tens to 100", Y1.B9.S1–S3, Y1.B12.S2, Y2.B1.S15) becomes `count_by_tables {rows:[{step:N, start:'zero', dir:'up'}]}`,
  citing the earlier-taught owner of that row; several merge into one row list. `seq_N` stays only with a "counting on
  from any number" why. New build check `COUNTCHECK`: a count link whose why cites a count from 0 must deal ≥ 90% of its
  items on the multiples (payload values read); 0 at build. Before Y2.B1.S15 (W4) a 10s row (0 … 110) is above the
  Grade 1 range, so it is not linked there (tens to 100 stays as `tens_foundation_visual`).
- **A3 (N5b)**: every `share_into_groups` why that named sharing now reads "Y1.B9.S8 / Y2.B5.S7 making equal groups
  (grouping): ring the counters in groups of a size"; `whyText` added.
- **A4 (N7, merge)**: a partial whose clause differs from `SKILL_WRM` now emits a `partial` tagFix (22 clause fixes).
  New `tests/scripts/wrm-tagging/Y2-Y3/mergecheck23.mjs`, run by the build on every write (`MERGE` lines, exit 1): it applies
  the tagFixes to the live `SKILL_WRM` and asserts every direct is full, every partial carries this file's clause,
  nothing else is tagged, every step's coverage equals its verdict, and no partial or gap step lists a direct skill.
  **mergecheck Y2 0 / Y3 0 problems**; the critic's `mergesim` 0 issues.
- **A5 (N1)**: the note check reads key + opts ("already linked" and "already taught earlier" both compare opts) and runs
  wherever related is empty; the unchecked tail "(the skills that share the idea are taught earlier (pre))" is gone; the
  hand notes on Y3.B4.S9 and Y3.B6.S7 are replaced by computed ones.
- **A6 (linkscan)**: the column check is role-aware: pre at tolerance 0, related at 2 weeks.
- **Steps (Y3)**: Y3.B3.S5 `share_into_groups {band:12}` is partial ("grouping only …"), so the merged coverage is
  partial; Y3.B1.S3 leads with the number line to 100 and takes the 0–1,000 line (S10, the same week) as related;
  Y3.B1.S10/S11 lead with the number line to 100 and the 100s count, no `compare_groups`; Y3.B4.S1 ×10 table lead;
  Y3.B3.S8 the 2, 5 and 10 tables ahead of doubling; Y3.B8.S4 ÷ facts lead, `shade_fraction` dropped; Y3.B7.S4 m ↔ cm
  and 1,000 = 10 hundreds, no 0–100 line; Y3.B4.S9 direct `div_remainders {constant:[2,3,4,5,8]}` and pre ÷3, 4, 8;
  Y3.B11.S6 cites Y3.B11.S3 (the same week, W29); the stale merged clauses (Y3.B1.S10, B5.S2, B11.S4, B3.S3, B3.S4 and
  the rest) are re-emitted.
- **Scans** (critic r9 scripts on the rebuilt files): `mergesim` 0 issues, own `mergecheck` 0 / 0, `seqscan` only the 3
  "counting on from any number" `seq_10` links (allowed by the fix table), `notecheck` 0, `nextscan2` 0, `nextscan` 0,
  `labwhy` 0, `labwhy2` 0 / 0, `prewk` 0, `optcheck` 0, `whyscan` A 0 (B 128 = all related links to later-taught steps;
  C 102 = its known false positives, now mostly count rows whose values sit in the payload, which `COUNTCHECK` reads),
  `linkscan` week mode OK, `graphrange` only Y2.B10.S7 (noted on the step). `samekey` 8, each proven: the Y2.B8
  fraction rungs are swapped out year-wide (they deal eighths, rule 18, `partition_shapes` stands in); Y3.B6.S5's
  `compare {forms:[0]}` is swapped out (unlike denominators); Y3.B3.S5, Y3.B5.S5 and Y3.B11.S3's "rungs" are supersets of
  the step's own opts (the step itself). `range` adds only the joined-digit `order_*` artifact. Both files rebuild
  byte-identical.

## Round 9 (after critic Y2–Y3 r8, 7.79 / 7.81): per-step notes, why ownership, building blocks

- **N1 (notes)**: the shared "no later step" sentence is gone. `build.mjs` writes each empty-related note from the
  step's own later-taught block steps, one reason per skill: already linked here; a content marker first taught Wn
  (rule 19); a swap that keeps content above the grade (rule 18); already taught in an earlier step; another topic; or
  "has no skill yet". A later skill with none of these reasons is a `NOTECHECK` build error, so a note can no longer be
  pasted unchecked (0 at build). Hand notes on Y3.B3.S6, B6.S4, B6.S6 and B1.S13 were removed (now school-week reasons
  or a related link).
- **N2 (whys)**: a marker or year swap that changes the key rebuilds the why from the new key only (no kept reason);
  a why that already names its week ("next step / a later step / taught earlier / the same week, Wn") is never re-cited
  to another step; `whyText` for `compare_groups`, `hundreds_chart_fill`, `time_half_hour` ("half past: the minute hand
  makes a half turn"), `div_facts`, `mult_facts`, `equiv_frac_visual`, `double`; the why check reads an ordering answer
  "236,511,961" as a list, not one number (it had rewritten the Y3.B1.S13 next-step whys).
- **N4a / pre and related by key + opts**: a pre whose `parts` / `constant` / `denoms` are a superset of a direct's is
  excluded. A key may sit in both pre and related only when their table / part / form lists are disjoint
  (`mult_facts {constant:[5,10]}` pre beside `{constant:[2]}` related on Y2.B5.S4/S5); a hand related link is promoted
  to pre only when an earlier-taught step owns those opts.
- **linkscan**: the 2-digit / 3-digit column-layout check is gated by school week with the markers' 2-week tolerance,
  not by WRM order (Y2.B2.S4, W5, takes Y2.B2.S15, W6, as its next step).
- **Steps (Y3)**: Y3.B11.S2 related `identify_lines` (S6, W29); Y3.B1.S13 related `place_on_number_line {span:100,
  band:1000}` (S10, W13) and no false note; Y3.B3.S7 leads with `mult_facts {constant:[3]}` and counting in 3s (no
  `mult_zeros`, no halving); Y3.B3.S10 leads with `mult_facts {constant:[4]}`; Y3.B3.S6 leads with counting in 3s;
  Y3.B11.S6 ranks `identify_angles {forms:[0]}` first; Y3.B3.S1/S2 drop the ± padding (`cloze_addition`,
  `missing_add_sub`, `add/sub_wp_100`) for counting in 2s/5s/10s and the 2, 5 and 10 tables; Y3.B1.S3 keeps only 2-digit
  pres (compare and order to 99, counting in 10s); Y3.B6.S2/S5 cite Y3.B6.S9 (W37) for `equiv_frac_visual`;
  Y3.B3.S13 cites counting in 8s by its own week; the W31 division steps divide on the number line by their own table
  (S13 by 8) and say why the mixed facts are related ("dividing by 4 and by 8, the same week"); Y3.B5.S4 no longer lists
  its own `length_metric` form 0 as related.
- **Scans** (critic r8 scripts on the rebuilt files): `notecheck` 0, `nextscan2` 0, `labwhy2` 0 / 0, `nextscan` 0,
  `labwhy` 0, `prewk` 0, `optcheck` 0, `whyscan` A 0; `dirlink` has no superset pre left: what remains is a related
  next step with its own opts (`arrays_groups {forms:[0]}`, the next table, `length_metric {forms:[0]}`), the A6
  ladders (`mult_facts {constant:[2]}` on ×4, `{constant:[4]}` on ×8 / 2-4-8), the halves and quarters pres on the
  quarter and third steps, and the mixed-facts related the critic accepted. `steprange` NEW = exactly the requested
  links (Y2.B5.S4/S5 `mult_facts {5,10}`, Y3.B3.S1/S2 counting in 2s/5s/10s and the 2, 5 and 10 tables); every r8 NEW
  on Y2.B2.S2/S12 and Y3.B1.S3 is gone; BOTH lines are unchanged since r7. `whyscan` B 125 are related links to steps
  taught later (correct next-step links), C 94 its known false positives (count rows it cannot read in payloads,
  digit-joined order lists, analogy whys). `range` adds only the joined-digit artifact on `order_*` (909596).
  `linkscan` week mode OK. Both files rebuild byte-identical.

## Round 8 (after critic Y2–Y3 r7, 7.88 / 7.74): related by school week, whys keep their reasons, ladders

- **A1 (S13)**: related "next step" links now come from the steps taught AFTER this one by school week (block first,
  then the year, same topic), worded "(next step, W18: …)"; a block step taught earlier is a pre candidate
  "(taught earlier, W18)", whatever its WRM position. Critic `nextscan` **0**.
- **A2 (S12)**: the why check reads count payloads (a number track [10,12,14,16] is counting in 2s) and treats units,
  money and fraction words as content only on measurement / fraction / graph / shape skills (on a number skill they are
  the analogy that explains the link). A rebuilt why describes the skill in words (`whyText` for every rebuilt key, no
  catalogue labels: `labwhy` 0 / 0), keeps the old why's reason after its colon when that reason is true of the items
  and opts, cites the owner step, and says "taught the same week (Wn)" or "taught later (Wn)" instead of "earlier
  learning" ("— earlier learning" 0 / 0). The r6 analogy whys are back (unit_form exchanges, expand "dollars and cents
  as two parts", the 4s doubled, the coin context on Y2.B4.S1, "100 is two 50s", the 100 g scale).
- **A3**: the "earlier step this builds on" suffix and every cited step name the step that owns the link's key with the
  closest opts (exact, then a superset of its rows / tables / parts).
- **A4**: `relOnly` with its own related list (even `[]`) replaces extraRelated and relR3 (Y2.B8.S13 has its note).
- **A5**: a hand `core` pre that the week or content checks would drop is a build error (`COREDROP`, exit 1); the two it
  found were fixed (Y2.B4.S9 money, Y3.B4.S2 tables).
- **A6**: a link is excluded as "the step's own skill" only when key AND opts match (or are empty): Y3.B3.S14/S15 lead
  with `mult_facts {constant:[4]}` ("double each fact for the 8s") beside the direct `mult_facts {constant:[8]}`.
- **B. steps**: all of the critic's list (Y2.B5.S12 number track in 2s; Y2.B8.S13 note; Y2.B4.S8 change from a dollar
  as pre, enough_money related; Y2.B4.S4/S5 money_compare pre; Y2.B2.S2/S3/S16, B3.S1 earlier steps as pre; Y2.B1.S7
  partition first; Y3.B3.S14/S15, S9, S3 ladders; Y3.B4.S2 known fact; Y3.B5.S1/S3/S5/S10 and B11.S4 measuring
  ladders; Y3.B6.S2–S6 fractions on a number line (W18) as pre; Y3.B11.S6; Y3.B1.S3/S10/S11, B2.S1; Y3.B3.S4 coins;
  Y3.B1.S14; Y3.B7.S3). 23 steps whose only related skills were taught earlier now say so in `note`.
- **Scans**: critic r7 `nextscan` 0, `labwhy` 0, `vscan` 0 links, `prewk` 0, `optcheck` 0; `whyscan` A 0, B 100 (all
  related links to steps taught LATER, i.e. correct "next step" links; 0 pre), C 84 = its own false positives: count
  whys on number tracks / count rows it cannot read in the payload, "quarter past" whys on `time_quarter` (clock
  times, not fractions), "number line" on the number-line skills, and the analogy whys r7 asked to restore; `scan9`
  links: `share_into_groups` (r6: clean) and ×8 facts inside the 2, 3, 4, 5 and 10 tables (r4 false positive); r3
  `swap.py` (WRM order) lists 16 related links whose step is earlier in WRM order but taught LATER by school week —
  correct under rule 19. `linkscan (week mode)` OK; both files rebuild byte-identical.

## Round 7 (after critic Y2–Y3 r6, 7.73 / 7.53): inch ruler, skip counts, ÷ payloads, hand-written whys

- **A. `markers.mjs` / `linkscan.mjs`**: no skill is exempted by name any more (the `reading_ruler` customary exemption
  is gone: it is an INCH ruler); the never-in-grade markers read the drawn cell, `screenInstr`, the hint and payload
  options as well as the text; `beyond()` and `div348` read division payloads (`"a":42,"b":6,"op":"/"` = 6 × 7) and, at
  Grade 2, sharing payloads (`"n":24,"size":4`); new `skipBeyond` marker (count steps: Y2 {1,2,3,5,10}; Y3
  {1,2,3,4,5,8,10,50,100}, 4s from Y3.B3.S9 and 8s from Y3.B3.S12; clock / time-line payloads are not count steps),
  also on direct skills. `build.mjs` now tests EVERY why (hand-written ones too) against the link's 60 generated items
  (units, count steps, tables, time and fraction words) and rewrites a why that names content the items lack; the
  rebuilt why describes the skill in words (`whyText`), not with the skill's catalogue label.
- **B. links**: `reading_ruler` dropped from every pre (Y2.B6.S2–S5; Y3.B5, B6.S6/S7, B11.S6–S10) with `ruler_cm` in
  `preBuild`, refilled from `measure_nonstandard`, `place_on_number_line {span:10, band:100}` and `length_metric`
  (new length ladder); `reading_ruler_hard` dropped; `skip_count_line` → `{step:[0], band:50}` (2s and 5s) at Grade 1,
  dropped on Y2.B5.S6–S12, B1.S16 (note) and Y3.B1.S14 (note); Y2.B2.S13/S14 count in 10s (`count_by_tables` 10s
  rows); `div_word_problems` dropped from Y3 links; `mult_frac_whole` dropped; Y2 B8 `equal_or_unequal_groups` →
  `compare_groups` (no "multiply" answer before W26).
- **C. verdicts**: Y3.B3.S5 → partial (÷6, ÷7 word problems) with `muldiv_tables` (now also on `div_word_problems`);
  Y3.B5.S2 and B11.S4 clauses name the inch ruler; Y3.B6.S1 → partial (non-unit items) with `single_fraction`
  (`unit_only`); Y3.B3.S3/S4 `multiples` clauses name multiples of 6, 7, 9; Y3.B12.S1 `pictograph {scale:[0,1,2]}`.
- **D. pre rank**: Y3.B4.S4/S5 add `mult_facts {constant:[3,4,8]}`; B4.S6 leads with `mult_facts` / `div_facts`
  `{constant:[2,3,4,5,8,10]}` and sharing; B4.S8 adds `div_facts {constant:[3,4,8]}`; B4.S2 leads with the known fact and
  unit form; Y2.B3.S7 leads with sides, corners and 2-D names; Y2.B1.S11 adds counting in 10s (`seq_10 {band:50}`:
  band 100 deals 109-129 at W03) and `number_seq_fill {range:100}`, `number_word_form` dropped.
- **E.** Y2.B8.S13 note (quarter to is W36); Y3.B7.S4 `length_metric {forms:[1]}` cites Y3.B5.S5; Y3.B7.S9/S11
  `mass_volume_liquid` why "reading a scale in mL"; Y3.B3.S7/S10 `nl_div {constant:[3]}` / `[4]`.
- **Scans (critic r6 scripts)**: `vscan` 0 links (the 3 direct inch-ruler lines are partials whose clauses name the
  inch ruler); `scan9` links: only (i) Y2 `share_into_groups {band:12}` flagged by its `dividewp` marker — the r6 report
  itself lists this as clean (grouping counters, K content) — and (ii) `mult_facts {constant:[5]}` / `[5,10]` / `[4]`
  hits for "5 × 8", "10 × 8", "4 × 8": facts of the 5, 10 and 4 tables, the "×8 inside a ×5 or ×10 table" false positive
  the r4 critic removed; `stepscan` 26 lines, all `elapsed_*` time-line payloads (`"step":15` / `30` minutes between
  ticks, not skip counts); `whyscan` A 1 (`add_sub_fact_family` cites Y2.B2.S3 "Related facts" — the step the xlsx
  names, tagged to the next key in SKILL_WRM), B 89 — all related "next step" links (0 pre), which the r6 report lists
  as clean — and C 65, all two scanner false positives: `count_by_tables` items are "Count by N. Write the missing
  numbers" with values 0, N, 2N … (no "×" and not "N, 2N, 3N" with spaces), and `time_quarter` whys say "quarter past"
  while items are "3:15" (the fraction-word "quarter" rule fires on a clock). r5 `whyfit` 0, `scan8`/`sys5` unchanged
  (6 = injected lines), `prewk` 0, `fit` 0, `optcheck` 0, `swap` 0, `linkscan (week mode)` OK; the files rebuild
  byte-identical.

## Round 6 (after critic Y2–Y3 r5, 7.70 / 7.44): marker blind spots, S11 whys, never-in-grade directs

- **`markers.mjs`**: reads multiple-choice option labels for the never-in-grade markers (tables beyond the grade,
  customary units, right angles / parallel sides), parses "Fact Family: a, b, c", samples 120 items per link over five
  seed families (the critic's included), `mult2x1` no longer counts 11 × 3 / 12 × 4 (table facts) as 2-digit × 1-digit,
  `ml_l` keyed to "Measure in litres" (W35), the critic's extra markers added (Y2 litres, metres, cm, money; Y3 ×3/×4
  before W11 — 5 × 3 counts as a Grade 1 fact —, fraction compare, fractions on a line, fraction add, Roman numerals).
  `NEVERDIRECT`: the never-in-grade markers also run on every step's OWN direct and partial skills; `build.mjs` reports
  any hit not named in the step's missing clause.
- **S11 (`build.mjs`)**: after any swap or markerFix the `why` is rebuilt from the skill and opts actually linked
  (label + tables / count steps / parts / band + the step where it was taught before this one); a hand `why` that names
  a table, a count step, a unit form or a quarter-past time the opts do not deal is rebuilt the same way; the
  `[rule NN …]` bookkeeping is stripped from every teacher-facing `why` (0 left).
- **S10 links**: `estimate_length {forms:[0]}` everywhere (forms 1 and 2 offer in/ft/mi); dropped on Y2.B1.S11 and
  Y3.B11.S4. `mult_properties` dropped from Y3 links (`props_tables` preBuild); `mult_div_fact_family` links →
  `mult_facts {constant:[2,3,4,5,8,10]}`; Y3.B3.S7 `mult_zeros {forms:[0]}`; Y3.B3.S8/S9/S11 `nl_mult {constant:[3]}` /
  `[4]` band 50 restored; Y3.B4.S1/S2/S4/S5 related replaced (10 row of the chart, unit form, the inverse by
  partitioning `area_model_div_2by1 {constant:[2,3,4,5,8]}`); Y3.B2.S19 `money_change` dropped.
- **Direct verdicts**: Y3.B4.S6 → partial (÷7, ×11, ÷12, fact families 6, 7, 42) + new option `muldiv_tables`;
  Y3.B4.S10 → partial (×6, ×9) + new option `comparison_tables`; Y3.B4.S2 → partial (70 × 7, 3 × 60 are common, not rare)
  + new option `zeros_tables`; Y2.B3.S7 clause names right angles and parallel sides. Every NEVERDIRECT hit is now a
  partial whose clause names it (Y2.B3.S7; Y3.B4.S2–S6, S10, B7.S9; Y3.B8.S5's only hit is a "10 ÷ 6" distractor).
- **Step fixes**: Y2.B9.S6 counting in 5s leads pre; Y2.B8.S12 / S13 clauses name sixths, twelfths, 5/3 / eighths,
  fifths; Y2.B11.S3 / S4 and the B8 half-past links say "half past: the minute hand makes a half turn"; Y3.B4.S4 leads
  with `mult_zeros {forms:[0,2]}` and partitioning, `div_remainders` dropped; Y3.B4.S7 adds `div_facts {3,4,8}`;
  Y3.B2.S21 leads with fact families and missing numbers; Y3.B6.S4 vertex counting dropped; Y3.B6.S1 related
  `compose_whole` (no false note); Y3.B7.S4 note corrected (l ↔ ml is W34, before); Y3.B1.S13 clock link removed, note
  added; counting rows match their whys (Y3.B3.S4 5s and 10s, B3.S12 4s doubled, B3.S13 8s); Y3.B7.S3 / S4
  `length_metric {forms:[1]}` (m ↔ cm) to match "exchange with 100"; Y3.B11.S1 drops `reading_ruler`.
- **Scans**: critic r5 `whyfit.mjs` **0 / 0**; `sys5.py` S10 links **Y2 0**, **Y3 6 — all six are the script's
  hard-coded fact-family lines** (added unconditionally); the data has **no** `mult_div_fact_family` pre/related link
  left (checked), and every direct/partial in its never-in-grade list is a partial whose clause names the content.
  `scan8.mjs` raw: Y2 12 `thirds` (the 4/3 distractor in `partition_shapes`, which sys5 removes) + 1 named direct;
  Y3 one `times34` (5 × 3 in the 5 times-table, which sys5 removes) + named directs. `prewk` 0 / 0, `fit` 0,
  `optcheck` 0, `linkscan (week mode)` OK. The r4 `scan6.mjs` still flags `nl_mult {constant:[3]}` / `[4]` (11 × 3,
  11 × 4) under its old `mult2x1` — the false positive r5 asked to fix and restore.

## Round 5 (after critic Y2–Y3 r4, 7.64 / 7.53): rule 19, school-week order

- **Pre tiers follow the SCHOOL week (xlsx), not WRM block order** (`build.mjs`). "The step before" is now the latest
  step on the same topic taught before this one; earlier-in-block, xlsx and rule-14 promotions only take steps taught in
  an earlier week (or earlier in the same week); earlier grades always count. A pre whose `why` cites only same-year
  steps taught later is dropped; when it also cites earlier-grade learning, the later name is removed from the `why`.
- **Content markers by week** (`tests/scripts/wrm-tagging/Y2-Y3/markers.mjs`, shared by `build.mjs` and `linkscan.mjs`):
  every link is generated (10 + 8 items, two seed families) and checked for content first met later than the step's
  week + 2 (Y2: thirds W31, quarter past W36, 5-minute times W37, ÷ W31, × W26, g/kg, ml/l, tally, pictogram; Y3: ÷3/4/8
  W31, ×8, fractions beyond quarters, equivalence W37, right angles W28, parallel/perpendicular W29, L ↔ mL W34, kg ↔ g,
  2-digit × ÷ 1-digit, rounding, perimeter, mm, a.m./p.m.) and for content never in the grade (×/÷ 6, 7, 9 at Grade 2,
  ×/÷ beyond 2/5/10 at Grade 1, decimals, right angles at Grade 1, customary units). A flagged link tries the
  `markerFix` alternatives (e.g. `partition_shapes {parts:[0,2]}`, `time_half_hour`, `div_facts {constant:[2,5,10]}`,
  `nl_mult {constant:[2,3,4,5,10], band:50}`, `box_division_easy {constant:[2,3,4,5,8]}`, `estimate_length {forms:[0,1]}`)
  and is otherwise dropped; the topic ladder (now with fractions and money ladders citing K learning) refills pre.
  Steps left without an honest related skill say why in `note` (Y2.B5.S1, B7.S1, B9.S1, B9.S6, B11.S2–S4; Y3.B1.S13,
  B2.S21, B4.S9, B6.S1, B6.S7, B7.S4, B7.S8, B7.S9, B11.S4).
- **Scans** (critic r4 scripts, re-run): `scan6.mjs` TOL=2 → Y3 0; Y2 10 raw lines, all `repeated_add_to_mult`
  (4 + 4 + 4 + 4 = 4 × 4), which `sys4.py` excludes as fine at Grade 1 → **`sys4.py` 0 / 0**; **`prewk.mjs` cite-later
  0 / 0, key-later 0 / 0**; `fit.mjs` 0; `relfit.mjs week` Y3 0, Y2 only Y2.B1.S1 (K learning, allowed); `optcheck` 0;
  `swap.py` 0 / 0. `direct6.mjs` lists Y3.B4.S4/S5 partials (`multiply`, `area_model_mult` have no table option): their
  missing clauses now name the ×6, ×7, ×9 items. `sys3.py` (round 3, WRM order) still lists pre "citing a later step" by
  WRM order (Y2 7, Y3 10); every one is taught EARLIER by school week (e.g. the 5 and 10 tables W26 before "Recognise
  equal groups" W27), which is what rule 19 asks. **`linkscan (week mode): OK`** with the marker check added.
- **Step fixes (Y3)**: B4.S8 direct `area_model_div_2by1 {constant:[2,3,4,5,8]}`; B4.S3 → partial (×6, ×7 splits) +
  new option `props_tables`, with arrays and repeated addition as pre; B4.S4/S5/S7 missing clauses name the ×/÷ 6, 7, 9
  items (B4.S7 now `{regroup:'none', constant:[2,3,4,5,8]}`); B3.S10 counting in 4s has 4s rows; B6.S7 pre = halves,
  thirds and quarters, a number line, a ruler scale; B2.S20 leads with the Y2 number-line estimate (W03) instead of the
  0–1,000 line (W13); B11.S7 drops `identify_lines` / `identify_angles`; `mult_word_problems`, `multiply`,
  `area_model_mult`, `capacity`, `equiv_frac_visual` and the early ÷3/÷4 links are replaced or dropped by the markers;
  B7.S4, B7.S9 and B1.S13 have a note instead of a related skill that did not share the idea.

## Round 4 (after critic Y2–Y3 r3, 7.55 / 7.60): rule 18 content and layout of every link

- **S9, year-wide link swaps** (`overrides.mjs` `linkSwap`, applied in `build.mjs` after the link opts). Rule 12 (an
  earlier partial stays as pre) yields to rule 18 when that partial deals content above the pupil.
  - Y2 fractions: `shade_fraction`, `identify`, `write_fraction` → `partition_shapes {parts:[0,1,2]}` (halves, thirds,
    quarters only); `equiv_frac_*`, `select_equiv_frac`, `compose_whole`, `fraction_number_line` dropped with
    `single_fraction` in `preBuild`; `fraction_of_set(_nv)` → `halve {band:20}`. A `frac` topic ladder refills pre.
  - Y2: `which_sign` and `balance_addsub` dropped; `pictograph` links → `pictograph_intro`; `add_50_regroup` /
    `sub_50_regroup` before Y2.B2.S15 → `add_10_regroup` / `sub_10_regroup {notation:['across']}`; the 2-digit column
    steps are no longer "next step" related before S15; 1-digit facts are written across before S15
    (`add_facts`, `sub_facts`, `add_10_mixed`, `add_20_mixed`).
  - Y3: `fractions:compare` and `order_fractions` dropped (unlike pairs are 4.NF.A.2) with `compare_kind` in
    `preBuild`; `missing_mult_div` (deals × 12) → `div_facts {constant:[2,3,4,5,8,10]}`; `unit_conversions` dropped;
    3-digit column steps are no longer related before Y3.B2.S11; 1-digit facts across before S11.
  - Both years: every `coordinates:` link dropped. Steps left without a related skill got hand entries that share the
    idea (quarter / half past for quarter / half turns and fractions, `compose_shapes`, `between_tens`, the inverse
    across-10 fact …); Y2.B11.S2–S4 say in `note` why none fits.
- **`linkscan.mjs`, rewritten**: week-relative by default (a link must fit the largest number the pupil has met by that
  school week, xlsx order, never below the previous year's range: K counts to 100, Grade 1 to 120), plus content and
  layout checks: Y2 denominators 2/3/4 only, Y3 compares sharing a numerator or denominator, no coordinate skills (no
  longer skipped), no × ÷ in Y2 sign/balance links, no customary units, no 2-digit column layout before Y2.B2.S15 and no
  3-digit column layout before Y3.B2.S11. **Result: `linkscan (week mode): OK`** (0 flags; the year mode is `--year`).
  The critic's own scripts: `fit.mjs` **0**; `relfit.mjs week` **Y3 0, Y2 6 links on Y2.B1.S1 only** (counting and
  2-digit place value to 100 on the "Numbers to 20" step: K learning, noted on the step, which the critic allowed);
  `sys3.py` Y3 clean, Y2 3 empty related (Y2.B11.S2–S4, noted); `swap.py` 0 / 0; `optcheck.mjs` 0. `steplink.mjs`
  still lists `add_50_regroup` / `sub_50_regroup` as stacked on Y3.B2.S4–S10 pre: 2-digit columns the pupil met in
  Y2.B2.S15–S18 (the skill has no `notation` option).
- **Step fixes (Y3)**: B2.S20 → partial (2-digit rounding only) + new option `estimate_1000`, with the 0–1,000 number
  line and 100 more/less first in pre; B6.S6 pre = number line, ruler scale, halves/thirds/quarters (+ `frac_count`
  preBuild); B3.S2 `dot_array_mult {band:25}` (arrays to 5 × 5); B2.S16 `sub_across_zeros` moved to related (partial
  via `exchange_count`); B7.S7 pre = jug number line, counting in 10s, Y2 ml reading (+ `nonstandard_capacity`
  preBuild), no L ↔ mL; B7.S3 counting-in-100s pre now has 100s rows; B11.S2/S3/S7 related `reading_ruler` dropped;
  B5.S12 `perimeter {forms:[0,1]}` (form 2 is feet-and-inch stories).
- **Owner bug list** (generator, not tagging; round 12: the kg-dial bug is fixed by PR #8 and removed here): `missing_mult_div` ignores `range` (deals "__ × 12 = 144"); `pictograph` `range` does not bound totals (105 at
  range 50); `fraction_of_set` ignores `denoms` in missing-numerator items; `denoms` on the fraction skills picks a
  family (denoms [2] deals eighths). **Round 13:** `generate-question.js` `itemDenominators` / `p12Acceptor` ignore `q.cell.payload`, so `denoms` does not filter
  the payload-only fractions of `equiv_frac_visual` (its = / ≠ items, and missing-number answers `1/2 = 3/?`): add the payload's `d`
  values and "a/b" strings to `itemDenominators` (Round 13 row 2).

## Round 3 (after critic Y2–Y3 r2, 7.53 / 7.45) — fixed in the generator, file-wide

- **S6, pre ranked by building block** (`build.mjs`). Every pre candidate gets a tier, and the list is sorted by tier
  before the cap of 8: hand pre → the step before and hand `core` keys (the main building block) → an EARLIER step's
  skill that was named as related (brief rule 14: it moves to pre) → xlsx prior learning on the same topic → earlier
  steps of the block → cross-topic xlsx entries → previous year (only while < 3) → the topic ladder (only while < 3).
  Related takes hand entries and the NEXT steps only (d = +1 … +4), never an earlier step of the block and never a pre
  key. `odd_even` / `select_even_odd` are dropped from every step whose title is not about odd and even. The pv → ×
  filter now keeps "Partition" for 2-digit × 1-digit.
- **S7, topic ladders** (`overrides.mjs` `ladders`): length, mass, capacity, temperature, time, statistics, position
  and shape each have an earlier-learning ladder (scale = number line, counting in 2s/5s/10s, compare language,
  heavier/lighter, clock parts …); a step with fewer than 3 pre entries is topped up from it. `build.mjs` reports any
  step still under 3 (`THINPRE`): none.
- **Rule 16** (`gapMissing`): every gap step has its own missing clause, and `closes` copies it; `build.mjs` reports a
  gap step without one (`NOMISSING`) and any `closes` equal to the proposal's `teaches` (`CLOSES=TEACHES`): none.
  A reused proposal that no longer closes a step of this year lists it in `dropSteps` (e.g. `add_next_10` drops
  Y2.B2.S11) so the lead's merge removes it. `exchange_count` and `within_whole` name every skill they are an option on
  (`skills`).
- **Critic counts re-run** (its `sys.py`, `swap.py`): related = an earlier step's skill in the same block **0 / 0**;
  pre ≤ 1 entry **0 / 0** (minimum pre is now 3 on every step); odd/even pre on a non-odd/even step **0 / 0**;
  gap `closes` = `teaches` **0 / 0**; full verdict with partial entries **0 / 0**; empty related **0 / 0**;
  pre = related **0 / 0**; own build in preBuild **0 / 0**.
- **Rule 18, links carry opts** (lead, 2026-10-10). Every pre and related entry now has `opts`: the opts its referenced
  step uses for that key (e.g. `mult_facts {constant:[3]}` from Y3.B3.S6, `band:99` from Y2 place value), else the year
  default in `overrides.mjs` `linkOpts` (Y2: tables 2/5/10, `band` 20–99 on counting, doubling, place value and bar
  models, halves; Y3: tables 2/3/4/5/8/10, `band` 999 place value, denominators 2/3/5, US money opts), else a per-link
  fix (`linkFix`). Links no option can narrow are dropped in that year (Y2 `mult_word_problems` deals 5 × 8;
  `fraction_of_set` ignores denoms; Y2 `capacity`, `length_metric`, `unit_conversion_word`; Y3 `count_by_tables` 100s
  past 1,000 on the to-100 steps) and replaced where a step was left without related.
  `tests/scripts/wrm-tagging/Y2-Y3/linkscan.mjs` generates 8 items of every link with its opts and flags numbers past the
  year's range (Y2 120 = 1.NBT.A.1, Y3 1,000; measures Y2 2,000 g/ml, Y3 5,000; money in cents; clock, angle and grid
  skills not range-checked): **243 flagged before, 0 after** (`linkscan: OK`). Links with explicit opts: Y2 390 of
  924, Y3 484 of 1,010 (the rest are skills whose defaults already sit inside the year).
- **Self-check**: 10 random steps per year re-judged from generated items (Y2: B1.S16, B3.S4, B5.S6, B11.S3, B5.S7,
  B7.S2, B9.S6, B1.S14, B10.S2, B2.S13; Y3: B5.S2, B2.S8, B9.S5, B10.S6, B3.S7, B3.S1, B4.S2, B2.S14, B12.S3, B12.S2).
  Two weak ladders found and fixed with `core` (Y2.B1.S16 Count in 3s now starts from counting in 2s/5s/10s;
  Y2.B2.S13 10 more/less from counting in 10s and tens-and-ones).

Round 3 step fixes (S8):
- **Y3.B9.S5 Find change**: `money_change {currency:'usd', step:5, paid:'note'}` — generated: $1 or $5 paid, change in
  dollars and cents ($1.25, $3.95). Pre starts with column subtraction (`sub_1k_mixed`); Y3.B9.S4 likewise.
- **Y3.B2.S2 Add and subtract 1s**: the `add_100_no_regroup` partial is removed (it deals 41 + 30); gap → the
  `more_less_1_3digit` option, extended to "ones" (234 + 5, 238 − 6).
- **Y3.B11.S3 Compare angles**: partial with `identify_angles {forms:[0]}` (names one angle; straight angles appear);
  missing: comparing angles with a right-angle tester.
- **Y3.B9.S2 Dollars and cents**: partial with `money_notation {currency:'usd', task:'words'}`; missing: cents ↔ dollars
  both ways (345 cents = $3.45).
- **Y3.B8.S2 Subtract fractions**: partial (compare-to-½ sort items mixed in; `forms:[0]` on the no-visual skill
  removes "simplify"); `within_whole` now covers subtraction too.
- **Y3.B1.S13 Order to 1,000**: `compare` (S12) is the first pre. **Y3.B4.S4 / S5**: partitioning (`expand`) and
  multiples of 10 (`mult_zeros`) are tier-1 pre; odd/even are gone. **Y3.B4.S10**: `div_remainders` and odd/even
  dropped. **Y3.B12.S5 / S6**: `tally_chart` is pre.
- **Measurement (S7)**: B7.S1, S7, S8, S9 now have 3–4 rungs (scale = number line, counting in steps, the Y2 measure
  skill, compare language); B7.S7 keeps `capacity` and adds the scale and compare rungs.

## Method (round 2, after critic Y2–Y3 r1)

- **Generated, not inherited.** Every direct and partial skill of every step was generated with `generateQuestionFor`
  (6 items, the opts recorded in the links file) by `tests/scripts/wrm-tagging/Y2-Y3/items.mjs`; the first 3 of each are logged in
  `Y2-Y3-items.md`. Hand verdicts live in `tests/scripts/wrm-tagging/Y2-Y3/overrides.mjs`; `build.mjs` writes the links file.
- **Options are values.** No `opts.note` is left (the build refuses one). Old SKILL_WRM notes become opts only when they name
  a real value (`band 999`); every other step needing an option has hand opts read from `skill-options.js`
  (`constant`, `forms`, `band`, `kind`, `currency:'usd'`, `wordform`, `rows`, `stimulus`, `span` …).
- **Range inside the step.** Y2 place-value skills carry `band: 99` (the default 999 deals 3-digit numbers). A skill whose
  items leave the step (mixed_add_sub sums past 100, box_division_easy "no exchange" dealing 75 ÷ 5, identify/write_fraction
  denoms [2,3] dealing 7/8) is partial or moved to related.
- **Pre-skills filtered.** A week-list prior step is kept only when its topic feeds the step's topic, and only from this
  year or the year before; cross-topic entries only when they are the building block (fractions ← sharing/grouping, time ←
  counting in 5s, tables ← counting in steps). Test-row weeks and thin lists fall back to earlier steps in the block, then
  the previous year on the same topic. Never empty. `preBuild` uses the same filter and never holds the step's own build.
  Six steps whose filtered list was still weak have hand ladders (`prePatch`).
- **Related share the idea** (inverse, same concept in another form, next step); never a pre key; no same-cluster padding.
  Every step has at least one.
- **Proposals (rule 13, short).** Each carries `name`, `kind` (`kindText`), `teaches`, `closes` (per step, the exact
  missing clause) and `representation`. Reused only after checking `skill-options.js`: built ones go to `retireBuilt`
  (count_50s for Y3.B1.S14, count_3s, shape_faces, money_uk for notes).

## Hardest calls

- **Y3.B2.S1 Apply number bonds**: partial (add_sub_10s / add_sub_100s are decade/hundred ± one unit) → `add_sub_patterns`; Y3.B2.S3 → `tens_any`.
- **Y3.B2.S13–S16, Y3.B4.S4/S5/S7**: the regroup bands mix exchange places, and `box_division_easy {regroup:'none'}` still deals 75 ÷ 5 → `exchange_count`.
- **Y3.B3 tables**: full with `mult_facts {constant:[n]}` and `count_by_tables` rows from 0; S15 (2-4-8 links) partial → `tables_links`.
- **Y3.B5.S5 / S6, Y3.B7.S4 / S9 mixed units**: partial → `mm_cm_m`, `metric_mass_capacity`; Y3.B7.S5 / S10 compare → `compare_measures`.
- **Y3.B1.S10 / S11 number line to 1,000**: partial with `place_on_number_line {span:100, band:1000}`; the whole 0–1,000 line and the arrow read → `nl_20`.
- **Y3.B8.S4 / S5 fractions of a set**: partial (unit and non-unit mixed, denoms ignored) → `fos_kind`.
- **Y3.B9 money**: US dollars with `currency:'usd'`; S4 difference → `money_difference`.

## Owner questions (with suggested answers)

1. Pages for above-grade Y3.B4 ×/÷ at Grade 2: *suggested: default to the smallest bands and no exchange.*
2. Pounds and pence: *suggested: dollars and cents throughout (as Y2).*
3. Y3.B8.S1 Add fractions at Grade 2: *suggested: yes, same denominator, sum within one whole (`within_whole`).*

Generator bug found by the critic (round 2): `measurement:mass_volume_liquid {forms:[1]}` gave some "mass in kg" items an answer key of 0. **Fixed by PR #8 (round 12 re-judged the clauses on fresh seeds; Part 2 above).**
