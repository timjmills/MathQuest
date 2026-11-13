# Short lessons: Prerequisite Check ON (lf-engine PC round, 2026-11-12; r3 rebuild 2026-11-13; r6 2026-11-13: M and L)

Rendered with the check forced on (`node tests/scripts/ws-lesson-samples.cjs --force-check`, buildSheet `prereqsForce`;
the committed records keep `prereqsLive: false` until this critic passes). Seed 4242. L in `<packet>/`, M in `<packet>/M/`
(r6: S dropped by the owner; earlier sections below name S), for add-within-10, subtract-2-digit-regroup and round-nearest-10.

| File | Page |
|---|---|
| pupil-p1 | Prerequisite Check (one page) |
| key-p1 | its key |
| key-p2 | routing page "Prerequisite Check: where next" |
| pupil-p2 / key-p3 | anchor chart (and chart-grey.png) |
| pupil-p3 / key-p4 | lesson sheet (Vocabulary, Remember, We Do, Independent) |
| pupil-p4 / key-p5 | Practice |
| pupil-p5 / key-p6 | Mixed |

## r6 pass (lf-engine PC r6, 2026-11-13, builder after critic r5 FAIL): every r5 finding, its check, its live pages
Tree: branch `claude/sweet-newton-c8wrv1-lf-engine-pc`, merged with origin/master 76bc11c61 (twice this round: 453 then 82
commits; P1). **Sizes M and L only** (owner 2026-11-13: print size S dropped) - the packet's second size is now `M/`, every
gate and proof runs `--sizes M,L`. The Prerequisite Check packet is rendered forced on (seed 4242); the LIVE pages (check off)
are proved against a pin of master written at M,L on a detached master worktree.

| r5 finding | Fix | Check (backtest row: FAIL dd2a4aff7 -> PASS) | Page evidence (proof PNGs below) |
|---|---|---|---|
| R1 round Mixed Place Value T O T O T O; every check T O O T | a lesson Mixed band's place items are never all one place, never strictly alternating / cycling (near-twins `placePick` / `placeOrder`, seeded; a band with no pattern prints as before); the check's `mixOrder` varies by seed (A B B A / A B B B, either kind first) | PC-PV place pattern on every lesson page, check on and off (`placeRunBad`, the dealer's own reading) - lesson-r6-pv-pattern; unit pc-r6-place-pattern | nearest_10 L Mixed 57 61 32 51 85 71 (O O T O O T) |
| R2 live Practice / Mixed near twins (nearest_10 34 / 35 / 39, 40 x 3; sub_2d_1d L "- 2" x 4; sub_50 44 - 23 / 46 - 24) | page rules on EVERY library lesson, check on or off: Practice / Mixed lead and partners (`pageRules`, lessonRules caps); the sheet (`nearRules`: Warm-up, Guided, Independent; one-number pools dealt twice as deep); detailed lessons unchanged | PG-LR6 / PG-LR67 check OFF on every lesson (one in-page read, `collectReads`; the gate's `nearKeyPair` copy replaced by near-twins `nearKeys`) - lesson-r6-lr6-live, lesson-r6-lr67-live | nearest_10 L Mixed rounding 78 45 34 / 96 49 23; sub_2d_1d L Mixed 29 - 7, 64 - 2, 86 - 4 |
| R2 "78 twice" | one number once a page across skills on a lesson Mixed page (`pageUnique`; one-number pools dealt one shelf deeper) | PG-LR6 cross-skill read - lesson-r6-lr6-live, lesson-pg-lr6, lesson-pg-lr6-size (PASS -> baed9bc06) | nearest_10 Mixed: the place band's 78 is now 57 |
| R3 identify's own Mixed partner lost its heads | `noPlaceHeads` skipped when the partner is the lesson's own skill (lead ruling) | PC-PVHEADS live: own skill keeps the heads its Practice prints, other skills none (cells aligned with plan items) - lesson-r6-pvheads-own | identify L / M Mixed Q4-9 T O heads, Q1-3 H T O |
| R3 "Write the value" over ring-only cells | a skill dealt twice reads its own items' instruction (`twinSkills` -> mixed-practice `bandKey`) | PC-INSTR value slot on every page - lesson-r6-instr-value | identify Mixed Q4-9 band: "Circle the place of the underlined digit." |
| R4 sub_2d_1d / sub_50_no_regroup / sub_100_no_regroup L Mixed 1 -> 2 pages | a lessonFit start over page 1 by no more than hMinAt's spare safety (0.5 mm a shelf) keeps to one page (212.5 mm of start in 212.3 mm) | ws-lesson-baseline PARTPAGES (`--pages-only`) - lesson-r6-partpages; PM-FOOT - lesson-r6-mixed-foot | sub_2d_1d L Mixed: ONE page, foot about 4 % |
| R5 combine L Mixed 22 % foot | one-item rows (k = 1) at L take no tab drop (they clear the tab sideways; `noDrop`, inline) and grow by their MEASURED content (print-sheet `measured[k].inkHMm`) - no more 52 % / lopsided rows; **the foot stays 27 %: for a lead ruling** (5 one-line rows is 12.1's L ceiling, and their 8 mm of ink is already 33-35 % banded at the natural 22 mm, so growth breaks H13; only a 6th row closes it) | PM-FOOT (KNOWN for combine / expand L, named) | combine L Mixed |
| P1 branch behind master | merged; precritic row "merged with origin/master" (FAIL when origin/master is not an ancestor of HEAD) | exempt: a moving ref | - |

Near-misses from r5: round sheet Independent ones digits, round L Mixed 61 / 51 / 71 and add Independent answers were not re-dealt
on purpose beyond the rules above; the critic's reading of them on the r6 pages is welcome.

**Also found and checked this round (own build):** an empty Mixed page passed a rule-scoped run (PC-BUILD now counts an empty
Practice / Mixed page, lesson-r6-empty-part); a CSS selector edit changed every Practice / Mixed page's html (the lesson CSS is
inlined) - replaced by a per-cell inline style, so pages that do not change keep their hash.

### LIVE pages changed (check off; `ws-lesson-baseline --all-lessons --sizes M,L --seeds 4242,1 --per-lesson --unpinned --check`
against master 76bc11c61's pin written at M,L): 468 of 1,856 keys (pupil and key pages and the whole-document hashes)
**No part prints more pages anywhere** (no PARTPAGES / NEW / MISSING line); div_facts, the vocabulary lessons, add_facts,
sub_1k ... sub_1m, sub_wp_* and all 7 detailed lessons are identical to master. Changed, by lesson / part / size (both seeds
unless named), and why:
- add_wp_10, add_wp_10_plain, add_wp_20, add_wp_20_plain, fact_family_sort: **Mixed** M, L - the partners' page rules (R2):
  the subtraction partner is re-dealt without near twins / an answer twice. Practice unchanged.
- sub_2d_1d, sub_50_no_regroup: **Practice** M, L and **Mixed** M, L - page rules on the lead (LR-6, the lesson's LR-7 caps); Mixed
  on one page (R4). sub_100_no_regroup: **Mixed** M, L (R4, R2).
- sub (the sample) / sub_100_regroup: **chart** M, L (r5 N3: panels 5 / 6 centred), **Mixed** M, **Practice** M, L seed 1 (R2).
- nearest_10 / round: **chart, sheet, Practice, Mixed** M, L - the sheet's one-number pool dealt twice as deep with the near-twin
  split (the chart's examples come from that pool, so the chart changes too), Practice / Mixed page rules, place pattern,
  pageUnique.
- identify, value, expand: **chart, sheet, Mixed** M, L; unit_form the same (chart seed 1 only); number_word_form also
  **Practice**; combine **sheet, Mixed** - the deeper one-number sheet pool (charts / sheets), Mixed: own heads and instruction
  (identify), place pattern, page rules, one-item rows centred and grown by measured content (L), pageUnique.

### Proof PNGs, before (master 76bc11c61) / after (this branch), M and L, pupil and key (`design/lessons/proof/pc-r6/<lesson>/{before,after}/`,
files `<size>-<part>-<pupil|key>-pN.png`) - a SPREAD (lead condition): at least one Practice AND one Mixed page per affected family
| Family | Lesson | Parts (M and L) | Why it is here |
|---|---|---|---|
| number_sense | nearest_10 | chart, teach, practice, mixed | R1, R2, "78 twice" (named by the critic) |
| placevalue | identify | chart, teach, practice, mixed | R3 heads + instruction (named) |
| placevalue | value | chart, teach, practice, mixed | named |
| placevalue | combine | teach, practice, mixed | R5 (named) |
| placevalue | expand, unit_form | chart, teach, practice, mixed | biggest pv diffs |
| composing | number_word_form | chart, teach, practice, mixed | biggest diff (0-4 of 44 identical) |
| subtraction | sub_2d_1d, sub_50_no_regroup, sub_100_no_regroup | chart, teach, practice, mixed | R4 (named) |
| subtraction | sub_100_regroup | chart, teach, practice, mixed | chart N3, Practice seed-1 page rules |
| addition | add_wp_10 | chart, teach, practice, mixed | Mixed partner re-deal (Practice identical: shown for the spread) |
Families with no changed page (division, multiplication partners, vocabulary, patterns / algebra, the detailed lessons): none
shown, identical to master.

### The forced packet (check on, seed 4242; L at the packet root, M in `M/`; the old `S/` removed)
Every page re-rendered. Gates on the head (merged with master): `ws-lesson-samples --check --force-check --sizes M,L` (8 seeds)
OK; `--seeds 64` dealing (forced and live) OK; `--all-lessons --sizes M,L` with PM-CONT, SHEET-2PG, PG-TURN, PC-FRAME, PG-LR6,
PG-LR67, PC-PV, PC-PVHEADS, PC-INSTR, PM-FOOT: only master's vocab PM-CONT reds (3, identical on master) and named KNOWN.

## r5 pass (lf-engine PC r5, 2026-11-13, fresh builder after critic r4 FAIL): every r4 finding, its page evidence and its check
Rendered again (check forced on, seed 4242, L at the root, S in `S/`, the engine prints S at M). Every page of the three
packets re-read by the builder as a pupil would (variety, give-aways, ranges). Gates: `ws-lesson-samples --check
--force-check` (8 seeds) OK; the dealing rules on 64 seeds (`--seeds 64 --rules PC-RANGE,PC-NAME,PG-LR6,PG-LR67,PG-TURN,PC-LR5`,
precritic lesson-samples-deal64) OK; `--verify-grey` OK. No item is left "for the critic to rule on" at a hard-cap threshold.

| r4 finding | Page evidence now (seed 4242) | Check (backtest row) |
|---|---|---|
| N1 "20 - 11" under Y2.B2.S10 | sub L check Q6-7 15 - 6, 11 - 3; sub S Q8-9 15 - 6, 11 - 3: every item in 11-18 minus 1-9, across 10 (a question prints fewer rather than out of range) | PC-RANGE declared floors (lesson-check-range-floors) |
| N2 nearest bank word = key; round alternated | the words "tens / ones" are a column RIGHT of the whole number (no word nearer one digit); sub L / S Q1-4 and round L Q3-6, S Q4-7 answer T O O T | PC-PV both ways (lesson-check-pv-bothways) |
| N3 sub chart panels 33 % | sub L / S pupil-p2: panels 5 and 6 centred in their row (the rule travels only with such a chart) | CHART-H13 (lesson-chart-h13) |
| N4 round Practice / Mixed twins | round L Practice 78 55 11 96 61 39 83 65 22 88 26 19 31 45 51: no pair within 2 or turned round, <= 2 a ten, each answer <= 2; round L Mixed 47 25 34 98 12 16; S Mixed 12 items, 2 a ten at most | PG-LR6 (lesson-pg-lr6, lesson-pg-lr6-size) |
| N5 round S sheet Independent | round S pupil-p3: 74 99 43 95 89 49 39 25 64 - no turnarounds, no pair within 2 | PG-LR6 (sheet Guided + Independent together) |
| N6 add S Vocabulary gap | add S pupil-p3: the grown match spends its height in the line gap (dots apart), words at the foot | PC-GAPS (lesson-check-gaps) |
| N7 "10 more or 10 less" one item | round L Q8-9 / S Q12-13: "10 more than 30" and "10 less than 59" | PC-NAME both parts (lesson-check-name-parts) |
| N8 chart-grey.png was the check | every packet's chart-grey.png is pupil-p2 (the chart) in grey (diff 0.01) | --verify-grey (lesson-packet-grey) |
| N9 (lead ruling) Mixed T O heads | round L / S Mixed Place Value partner: no heads over the "name the place" numerals (2.5 mm under the tab) | PC-PVHEADS (lesson-pvheads) |
| r3 F14 plural / widow | add L Q2 "Count by 1. Write the missing number." over one blank; round L Q1 "Skip count along the line. Write the missing numbers." on one line | PC-INSTR (lesson-check-instr) |

Also fixed in this round from the builder's own read: the check's take-away twins (11 - 3 beside 11 - 5) go last and a
twin pads only a two-choice / two-way question; one skill's number never twice on a page (round S Mixed printed "8 5" twice);
a Mixed pv shelf measured with the page's tab drop (identify / sub_2d_1d L Mixed were cut at the frame on master - PC-FRAME now
on every lesson).

**Live pages changed** (`ws-lesson-baseline --all-lessons --sizes L,S --seeds 4242,1 --per-lesson --check`, baseline written on
6a9c268ce; the check-on commits 302af774a / 9775cf9eb were 1,556 identical): 176 of 1,556 hashes, all from the LIVE commits
f18533dd7 / 4095d2e83 -
- the anchor chart (pupil and key p1) of sub_100_regroup at L and S (N3, centred panels 5 / 6);
- the Mixed page (pupil and key; p4, or p5 with the Warm-up) of nearest_10 L / S (the sample "round" too), placevalue identify
  L / S, value L / S, unit_form L / S, combine L, expand L, and subtraction sub_2d_1d, sub_50_no_regroup, sub_100_no_regroup
  L / S: the Place Value partner prints no place heads (lead ruling N9), and pv shelves at L are sized for the tab drop (was a
  cell cut at the frame on identify / value / sub_2d_1d L; PM-H13 47 % where master had 52 %, TAB-CLEAR clear).
Detailed lessons: unchanged. Open for the lead: the identify lesson's OWN Mixed items keep their heads (its step strip says
"Read the letter above it"); the role Test / Review pages of placevalue:identify print heads by the skill's default support
'labels' (paper = screen, lf-placevalue F5) - the ruling's "Review, Test" clause is recorded in PEDAGOGY 4.1a but not built.
Live master red found by the new check (unforced): add S lesson sheet Vocabulary band 29 % below / 7 % above (PC-GAPS) - the
check-on sheet is fixed; the live sheet is not changed in this round.

## r4 pass (lf-engine PC r4, 2026-11-13): the check's dealing held to the lead ruling
Rendered again (check forced on, seed 4242, L root, S at M in `S/`). Changed pages: add pupil-p4 / p5 (Practice, Mixed) and
keys, round pupil-p3 / p4 / p5 (sheet, Practice, Mixed) and keys, sub S pupil-p5 (Mixed) and key; every other page as r3.
- **(a) a dry pool never turns its own item round** (lead ruling): the re-dealt sheet's facts are given up first (turned round
  before exact), then the chart's, one place at a time; the check's own facts never; never outside the declared range (no
  "0 + 2"), never a same-page turnaround. Gate: ws-lesson-samples **PG-TURN** (every page, every lesson, forced and unforced;
  backtest lesson-pg-turn). add Practice turnarounds of its own items: 41 -> 0.
- **(b) the sheet's Independent band keeps LR-6 / LR-7** (near twins, an answer twice, the library's caps) and no chart
  example; Practice / Mixed lesson items too (check on). Gate: **PG-LR67** (backtest lesson-pg-lr67). sub sheet LR-6 9 -> 0,
  LR-7 9 -> 0.
- **(c)** a number bond read as a sum is keyed as that sum: the check puts the chart's sums last (add L 1629), Mixed partners
  never print the lead's sum turned round; the sheet's Guided cells leave out a chart example and one-number near twins
  (round L had the chart's 96, then 47 / 74).

`ws-lesson-check` forced vs unforced (25 seeds, L / S): **118 vs 428 findings, every class at or below master's**; the 19
LR-5 left are the LR-18 part-refresh builds, which run unforced (identical to master). Cross-page soft repeats (a sheet
fact turned round on Practice) 337 vs 159 unforced: the ruling's step 2, by design.

Known, for the critic to rule on (not rule reds): round sheet Independent 43 / 34 (the 6-item pool has no other); round
Practice 11 / 12 and 97 / 98 (Practice near numbers are not an LR-6 rule for rounding); sub chart cell 6 30 % band (as r3).

## Every page of the packet, its gate, the r3 finding it closes (lf-engine PC r3 rebuild, 2026-11-13)
Rendered on branch `claude/sweet-newton-c8wrv1-lf-engine-pc` after merging lf-engine-live-pm2 (1b2d38f05). Check forced on,
seed 4242, L at the packet root, S printed at M in `S/`. "Rule-gated" = `ws-lesson-samples --check --force-check` (8 seeds,
L / S; precritic `lesson-samples-check`), every rule PASS on this tree. Print-lint = `ws-print-lint --roles lesson` (L-KEY,
L-OVERLAP; precritic `lesson-samples-key-L / -S`).

| Page (pupil / key) | Part | Gates | r3 findings closed here |
|---|---|---|---|
| pupil-p1 / key-p1 | Prerequisite Check (one page) | PC-RANGE, PC-NAME, PC-SLOTS, PC-SCAFFOLD, PC-LR6 (exact + near twins), PC-H13 (bands, gaps, foot), PC-CLIP (headings, ink above each tag), PC-FRAME, PC-PV, PC-PAGES; print-lint L-KEY / L-OVERLAP | F1 (PC-PV), F2 (PC-CLIP ink, PC-FRAME), F13 (PC-LR6 near twins: sub S now 77 / 51, not 77 / 27 / 71; round 75 / 45 no longer together) |
| key-p2 | routing page "Prerequisite Check: where next" | PC-FRAME, PC-CLIP twin geometry; print-lint L-KEY | - |
| pupil-p2 / key-p3 | anchor chart (and chart-grey.png) | PC-CLIP, PC-FRAME; print-lint | - |
| pupil-p3 / key-p4 | lesson sheet (Vocabulary, Remember, Guided, Independent) | PC-H13 (blank foot), PC-FRAME, PC-CLIP, SHEET-2PG, PC-LR5 (its items not again on Practice / Mixed); print-lint L-DENSITY H13 | F3 (PC-FRAME), F4 (PC-LR5); add S foot 9 % (carried into r3 as a known red) now filled - with the check on, the Vocabulary band takes the spare |
| pupil-p4 / key-p5 | Practice | PM-H13, TAB-CLEAR, PM-CONT, LIVE-PART, PC-FRAME, PC-LR5 | F5 / F7 (PM-H13, fixed on live-pm2, merged), F6 (LIVE-PART) |
| pupil-p5 / key-p6 | Mixed | PM-H13, TAB-CLEAR, PM-CONT, LIVE-PART, PC-FRAME, PC-LR5 | F5 (merged); the check's printed facts are now a hard avoid of the Mixed partners (ws-lesson-check: "on prereq and mixed" 8 -> 0) |

Live packets (check off, `prereqsLive: false`): `ws-lesson-baseline --all-lessons --sizes L,S --seeds 4242,1 --per-lesson
--check` against a baseline written on 1b2d38f05: OK, 1,556 hashes identical.

## Known open (not closed by this pass)
- r3 F8-F12, F14 were not in this brief (see the r3 REPORT); F13 is closed.
- `ws-lesson-check --force-check` (not on precritic): r4 118 findings vs 428 unforced (r3: 354); no forced-only class left
  (see "r4 pass" above).
- precritic `--role lesson --strict` reds identical on 1b2d38f05: print-lint role lesson L (28 counts above the pin) and S
  (29), lesson-samples-key-L (nearest_10 L, 12 findings, live packet).

## What changed since r2 (7744c2b4)
- **One-page check (lead ruling A, LR-17a (2))**: after the N2 floor the check ran to two pages at L (all three) and at S
  (add). Now a question that is not two-choice may print ONE item when two do not fit; two-choice questions (compare,
  "circle ones or tens") always keep 2; the question whose drop saves the most height gives first; an item that costs no
  height is taken back. Gate: PC-PAGES, backtest `lesson-check-one-page`.
- **N5**: no item 3+ across may wrap past 1.15 x its one-column height (`ROUTE_REFLOW`): round S "10 more than 30 is __"
  no longer wraps onto its tab.
- **N6**: a paired row's strips take the taller height (add Q1 / Q2: "Count. Write the number." beside a two-line strip).
- **N7**: the sub check title keeps a topic ("Prerequisite Check: subtracting with regrouping", `checkTopic`).
- **N8**: sub sheet Independent column subtractions keep the T O heads and the answer boxes Guided draws (LR-17b
  `indepFrame`).
- **PC-SCAFFOLD**: the sub check's column subtractions print plain at level 0 (no heads, no answer boxes).
- **PC-NAME**: sub Q2 / Q4 `checks` text rewritten.
- Routed cells are centred (a lone item no longer sits at the top of a 31-37 % band); tag padding 0.8 mm (cell gap 16 -> 15 mm).
- **Practice / Mixed fill: unchanged (decision).** Practice keeps the one-number ceiling of 15 (WORKSHEET_DESIGN_STANDARD
  12.1 / PAGE_TYPES Independent: whole rows, never a smaller cell to fill the page); round L Practice still shows a 49 %
  band inside its rounding cells - left for the critic to rule on, no page-type rule asks for more items.

## This pass (lf-engine PC fix 2, 2026-11-13; check pages and their keys only - every other page unchanged)
- **sub S cells 1-5 (31-33 % wide)**: a lone question whose items leave a side band of 29 % or more in equal columns now
  lies in a NATURAL-WIDTH grid - each cell its widest item + the tab room, at least ink / 0.6 - centred as a group in
  its band (`ROUTE_NAT_BAND`, `mq-lprenat`): the two "circle ones / tens" items 58 mm cells (21 %), the three expanded
  forms 105 mm cells (27 %).
- **round S "10 more / less than N is __" (34 % tall)**: the ROW-HEIGHT TRADE (`ROUTE_TRADE_MAX`): a row the CL-40 spacer
  pushes past the band takes the height that drops it (content + the tab clear, 19.7 mm) from the page's spare height,
  else from other rows' growth past their measured height; all or none. The page had the height: the planner charged a
  3 mm gap between bands the kit draws as one shared border (`ROUTE_GAP_MM` 0; drawn foot was 17-18 mm at S).
- **LR-6 page-wide**: with the height back, round S kept a fourth "between" item, "27 is between __ and __" under
  "27: circle the tens"; an item repeating an EARLIER question's numbers is dropped too (PC-LR6 reads the whole page).
- Gate: `ws-lesson-samples --check --force-check` PC-H13 0 on every check page (L and S, 8 seeds), every PC-* PASS but
  the two sheet feet below; live packets 0 differences (`ws-lesson-baseline --all-lessons`, 1,556 hashes).

## Known open at r3 (`ws-lesson-samples --check --force-check`)
- Lesson sheet feet add S 9 %, sub S 11 % (pupil-p3; the sheet with the check on has no Warm-up). As on master; not
  closed by a small change: the sheet's spare goes only to its Independent band (cap 10 %); letting its bands grow as on
  a page with no Independent rows (tried, gated to a live check) cleared both feet (3.5 %) but grew the top-started
  We Do / fact cells (growth lands under the item, CL-4b) to 29 % (add) and 33 % (sub We Do cell 2) - a new H13. Closing
  it needs those cells centred in a grown row (the routed check's `mq-lprectr` move) - a lesson-sheet change for the
  sheet's own lane.
- (closed in the r3 fix: sub S check Q6-8 fact cells taller than their row - F2.)

## r2 side by side
`git show 7744c2b4:design/lesson-samples/<packet>/pupil-p1.png > /tmp/r2-p1.png` (same for any page / `S/`), or
`git worktree add /tmp/r2 7744c2b4` and open both folders.
