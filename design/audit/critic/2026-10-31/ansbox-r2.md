# Critic r2: ansBox ("Answer boxes"), branch claude/sweet-newton-c8wrv1-ansbox-wip @ 2a2bf4e

**Verdict: FAIL.** The lowest score is **C1 = 4 (cap H9) and C2 = 3 (cap H1)**. Both are on the `fact` template with the "Across" notation at Size S with *One box per digit*: the pupil's boxes are about 4.8 mm wide, the digits about 8 mm, and the key's digits spill out of their boxes. The next lowest is **O6 / C4 = 5** for *Off* on fact and equation skills on the practice card and in the quiz. There, at the pupil's first view, "Off" draws a yellow-ringed box that looks the same as Automatic's box. The **default-page parity gate fails against main** (28 of 91 documents changed, all on the review role).

Sample, each rendered with the option untouched and at every OFFERED value:
- kit stack: add_100_regroup, sub_1k_regroup;
- legacy stack: add_10_regroup, add_10_mixed;
- fact: add_facts, mult_facts;
- equation: div_facts, add_sub_10s, divide;
- legacy fact: multiply;
- my additions: add_three, missing_add_sub, mixed_add_sub (a single-layout mixed pool), and mixed_addition (a multi-layout pool, which shows no control).

Print: independent role at Size S and L, pupil page and key, from buildSheet at seed 777. I also printed add_facts and mult_facts with notation=across, div_facts with each divForm × digit/off, addition:add and subtract with digit, and sub_2d_1d review at L.

Screen: practice card, online worksheet and quiz at 1280. Each was shot twice:
- as shown: entry animations finished, infinite ones frozen;
- with the first input in the DOM focused.

## Round-1 findings, re-checked
1. **Legacy-stack "One box" on card and quiz: FIXED.** At rest, One box is a single outlined box. Per digit shows two boxes, and Off is a grey patch. As shown, One box lights its right (ones) half yellow with no divider. That is distinct from per-digit, and it fits ones-first entry.
2. **Fact digit boxes vs digit columns, and the key overlay: FIXED on the default (stacked) notation.** The boxes sit under the digit columns, and the key writes into them with no outer box (PNG 6). **NOT FIXED with notation=across**: see finding 1 below.
3. **Fact 'off' key draws a box the pupil page lacks: FIXED** (PNG 6, row 3).
4. **Small key digits on add_sub_10s and legacy multiply: FIXED on print.** **Multiply's box count within a section: FIXED on print** (3 per cell). **NOT FIXED on the online worksheet** (finding 3).
5. **Labels: FIXED.** No two offered values render alike on paper. Stack skills offer Automatic / One box / Off. Fact and equation skills offer Automatic: one box / One box per digit / Off. add_three and missing_add_sub offer Automatic / per digit. mixed_addition shows no control. The "Automatic" text is truthful on every skill I opened. On card and quiz, Off still renders alike to Automatic at first view (finding 2).

## What passes
- **Kit stack** (add_100_regroup, sub_1k_regroup): Automatic, One box and Off are correct on the pupil page and key at S and L, and on every screen host. Score 9/9/8/9.
- **Fact and equation on the default notation:** per digit / one / off match between pupil page and key at S and L. div_facts in the fraction, long and vertical forms honours digit and off (long keeps its vinculum).
- **add_three, missing_add_sub:** per-digit strips print and key correctly at S and L.
- **Panel:** "Answer boxes" is a closed disclosure with plain labels; mixed_addition offers nothing.
- **Gates:** ws-ansbox-shape on my 14-skill sample is OK. ws-options-verify on the same 14 is OK for every ansBox value (646/647; the one FAIL is mixed_addition nlOn=true, pinned and not this lane's).
- **Passed skills' screen hosts:** sub_2d_1d and sub_100_no_regroup look the same as on main in card, worksheet and quiz. The only pixel differences are animation phase.

## Scores (C1 ease / C2 teaching / C3 spacing / C4 fidelity; O6 = option does what it says)

| Skill · value | Print S | Print L | Card 1280 | Worksheet 1280 | Quiz 1280 |
|---|---|---|---|---|---|
| kit stack · auto / one / off | 9/9/8/9 | 9/9/8/9 | 9/9/8/9 | 9/9/8/9 | 9/9/8/9 |
| legacy stack · auto | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 |
| legacy stack · one | 8/8/**6** (H13)/8 | 8/8/**6** (H13)/8 | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 |
| legacy stack · off | 8/8/**7**/8 | 8/8/**7**/8 | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 |
| fact (stacked) · auto / digit | 8/9/8/9 | 8/9/8/9 | 8/9/8/9 | 8/9/8/9 | 8/9/8/9 |
| fact (stacked) · off | 8/9/8/9 | 8/9/8/9 | 8/8/8/**5** (O6 5) | 8/8/8/8 | 8/8/8/**5** (O6 5) |
| fact (across) · digit | **4** (H9)/**3** (H1)/7/6 | 8/8/8/8 | n/g | n/g | n/g |
| fact (across) · auto (lane box) | 6/**5**/7/7 | 8/8/8/8 | n/g | n/g | n/g |
| equation · auto / digit | 8/9/8/9 | 8/9/8/9 | 8/9/8/9 | 8/9/8/9 | 8/9/8/9 |
| equation · off | 8/9/8/9 | 8/9/8/9 | 8/8/8/**5** (O6 5) | 8/8/8/8 | 8/8/8/**5** (O6 5) |
| legacy fact (multiply) · digit | 8/9/8/8 | 8/9/8/8 | 8/9/8/8 | 8/8/**7**/**7** (SL-2) | 8/9/8/8 |
| add_three / missing_add_sub · digit | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 | **7**/8/**7**/8 (add_three wraps "=") | 8/8/8/8 |

n/g = not graded (the screen hosts do not use notation=across for these items).

## Findings

1. **Fact template, notation=across, Size S: the digit boxes are about 4.8 × 5.3 mm under 8 mm digits, and the key's digits overflow them.** This is critical: H9 (C1 ≤ 5) and H1 (C2 ≤ 3). Class SLOT; rules SL-3, AK-2.
   - Where: add_facts and mult_facts, independent role, Size S, `{notation:'across', ansBox:'digit'}` (PNG 1, rows 1–2). The key's "13", "18", "72", "45" and "120" are painted over and outside the boxes.
   - The same cell with ansBox untouched (the lane's SL-3 full box) is a 13 × 6 mm box. It is shorter than a digit, sits under the "=", and the key overflows it. `ws-options-verify --render` reports `L-KEY AK-2: 0 -> 16 (ink crosses the edge by 3.3 mm)` on this branch. **Main does not have this finding**: same command on 5c6063a, where the slot is a line.
   - At Size L the boxes are the right size.
   - Fix: in `js/modules/sheet/cells/fact.js` (the across branch) and the legacy across slot in `print-generate.js`, size the per-digit box and the one box from `ctx.metrics` digit advance × 1.0 and line height. Do not use the S label height. Put the box after the "=", as the equation template does, not under it.
   - Check: ws-ansbox-shape c/d over every notation and divForm value, not only the default.
2. **Off on fact and equation skills draws a box on the practice card and in the quiz, where the pupil looks.** This is major: O6 5, C4 5 (paper ≠ screen; the value does not do what it says). Class PARITY; rules SL-3 "Off", OC13.
   - Where: add_facts, mult_facts, div_facts, add_sub_10s and divide, at 1280, card and quiz, as shown (PNG 2). Automatic shows a yellow box with a thin black outline. Off shows the same yellow box with a 3 px yellow ring and no outline. To a pupil these are the same box.
   - The paper is "= ____" for an equation, and an open zone for a fact. Only the worksheet's non-active cells show the grey patch.
   - Fix: in `css/screen-cell.css` (`.mq-ans-off` input:focus / `.mq-active-box`), draw the Off focus cue as a thick bottom rule plus a fill, never a 4-side ring. Draw the Off resting state as a ruled line, matching paper.
   - Check: ws-ansbox-shape f compares the "as shown" signature without discounting the focus ring's sides as chrome.
3. **Legacy multiply, per digit, online worksheet: the box count changes within one set** (2 / 3 / 2 boxes for 2×6, 11×7, 3×4; PNG 3). Print holds 3 for every cell. Major: C3 7, C4 7. Class SL-2; rule SL-2.
   - Fix: the worksheet builds its strips from the same section band as print (`screen-cell.js`, the legacy-fact strip width). Take the band from the set's item list, not per item.
   - Check: ws-ansbox-shape e on the worksheet host as well as on paper.
4. **Legacy stack, One box (and Off), print S and L: the stack jumps to the top of the cell, leaving an empty band of 43 % of the cell below the box.** Measured on add_10_regroup L, cell 1: 283 px cell, ink ends at y = 330. Automatic centres the same stack and leaves 19 % (PNG 4b; add_10_mixed is the same). Critical: H13, C3 ≤ 6. Class SPACE; rule H13.
   - Fix: the legacy one/off print slot (`print-generate.js`, the ansBox branch) keeps the automatic path's vertical centring wrapper.
   - Check: H13 band measure in ws-ansbox-shape (or ws-slot-clip) on teacher values.
5. **Default-page parity against main FAILS: 28 of 91 documents changed.** These are the review role, pupil page and key, at S and L, for all 7 skills in `redesign-passed.js` (PNG 5). The independent and more-practice pages and the card are byte-identical.
   - The change: review members' word-problem unit label goes from a ruled line to a box. On the key, "marbles" touches both walls of its 20 mm box. Legacy stack members go from `ansrow` to per-digit boxes.
   - This is SL-3 as the owner ruled it. But it moves 7 passed pages, and the status file says "91 documents byte-identical". That claim was measured against b63c075, which already contains this lane's own commit 8c21ca1, not against main 5c6063a. Process: blocking.
   - Fix (decision): either keep the review members' old drawing until the passed skills' review pages are re-graded, or have the 7 review pages re-graded under SL-3. In both cases, widen the key's unit box, or set the word at the box's writing size (AK-2).
   - Check: run ws-ansbox-default-parity `--write` on a main worktree, never on a lane commit.
6. **Two options-render (precritic) findings that main lacks.** The precritic reds are the same gates as on main, but not the same findings.
   - add_facts S notation=across: L-KEY AK-2 0 → 16 (finding 1).
   - add_sub_10s L task=1: capacity 16 where the default prints 18 (H13). Main has neither finding.
   - The status file calls every red pre-existing; it compared against b63c075 again. Fix: as in 1, plus re-pin the add_sub_10s default/task=1 capacity after the '= ?' sentence change (d168963).
7. **add_three, per digit, online worksheet: the sentence wraps before the "="** ("9 + 2 + 2 / = [ ][ ]"), while Automatic stays on one line. Minor: C1 7, C3 7. Fix: no-wrap on the sentence (`white-space:nowrap` on the add-three sentence row), or narrow the strip to the box writing size.

Not this lane (seen, recorded so they are not lost):
- missing_add_sub's Automatic practice card renders the sentence as a small line above an empty cell with no Check button. Main is identical.
- multiply's Automatic key writes "1 6" at about 0.6× in its box; this is the byte-held default.
- mixed_addition nlOn=true prints identical to the default (pinned).

## Checks that would have caught these
- **#1:** ws-ansbox-shape samples only each skill's default notation. Run c and d over every appearance value the skill offers (notation, divForm) × each ansBox value, at S. Then the 4.8 mm box under an 8 mm digit and the 3.3 mm key overflow fail. Also, `ws-options-verify --render` lists every option it renders and skips; ansBox is in neither list, so it is silently skipped. Add ansBox to its appearance values.
- **#2:** check f treats a focus ring as chrome. Compare the "as shown" state by the pupil's eye: four-side visible edges of any colour count as a box.
- **#3:** check e runs on paper only. Run it on the worksheet host's cards of one set.
- **#4:** add the H13 empty-band measure (≥ 30 % of cell height) to ws-ansbox-shape for teacher values. ws-coverage-matrix has no ansBox rows at all (203 rows on my 6-skill run, none with ansBox).
- **#5, #6:** parity and "pre-existing" must be measured against main (`git merge-base`), never against a commit on the lane. ws-ansbox-default-parity should refuse `--write` when HEAD is not on main's first-parent line.

## PNGs (design/status/ansbox/critic-r2/)
- 1-fact-across-S-digit-boxes-and-key-overflow.png: rows are digit pupil S, digit key S, digit key L, auto key L, off key S
- 2-equation-off-equals-auto-on-card-quiz.png: div_facts and add_sub_10s, auto vs off, card, worksheet and quiz as shown
- 3-multiply-digit-worksheet-2-3-2-boxes.png
- 4b-legacy-stack-one-L-H13-43pct.png: pupil page and key
- 5-passed-review-page-changed-vs-main.png: sub_2d_1d review L, pupil page and key
- 6-fact-default-digit-off-r1-fixed.png: r1 #2 and #3 fixed on the stacked notation
