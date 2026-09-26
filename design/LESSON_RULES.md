# Lesson rules — the lesson design contract

Every rule below was taught by an independent critic round on the three sample lessons (lessons r1–r4:
`design/audit/runs/lessons-r{1..4}/SUMMARY.md`). Each rule is either **built into the engine** (a lesson
cannot break it) or **checked by the gate** `tests/scripts/ws-lesson-check.cjs`, which fails before any
critic sees a page. A new lesson is mostly a data entry in `js/modules/lessons/prereqs.js`; the engine
applies these rules to it. The design standards (`WORKSHEET_DESIGN_STANDARD.md`, `PEDAGOGY_STANDARD.md`)
still govern; this file is the part of them lessons kept getting wrong.

## NEW LESSON CHECKLIST

Before a new lesson goes to a critic:

1. **Data entry** in `lessons/prereqs.js`: `skills` (Warm-up prerequisites), `concepts`, `vocab` (≤ 3, each
   with a picture), `steps` (2–5 words, **one distinct icon each**), `chant` (or `''` and why),
   `example: {match, test?, prefer?}`, and `mixWith` (EARLIER skills only, with the floors they need).
2. **Declare the cases** (`cases`, names from `sheet/lesson-rules.js` `CASE_FAMILIES`) — every kind of item
   the practice will deal. For each case the worked example does not show, add an other example
   (`second` / `third` / `fourth: {test, label, ref?}`). A rare case gets `ref` floors so its own pool
   deals it.
3. **Pool floors** where the skill's generator deals more than the lesson teaches: `minOperand`,
   `minTop`, `maxTop`, `distinctFirst`, `distinctAnswer`, `noNearTwin`, `caps: {case: n}`.
4. Run `node tests/scripts/ws-lesson-check.cjs --only <lesson>` (25 seeds × L, S). It must print OK.
5. Render three seeds (`node tests/scripts/ws-lesson-samples.cjs --seed <n> --stats`) and look at every
   PNG: the gate cannot see whether a drawing teaches.
6. Then, and only then, a critic round.

## The rules

| # | Rule | Taught by | Enforced by |
|---|---|---|---|
| LR-1 | **The chart draws every case the practice deals** — as a worked drawing, not only in words. The lesson declares its `cases`; the chart's worked example and its other examples must cover them all. | r2 #1 (subtract never showed a 0 in the ones; round never rounded down), r3 #1 (no one-digit take-away), r4 #1 (answers under 10 only described; doubles only in words) | Engine: case pools (`ref`) deal each rare case; `chartPage` never picks a layout that leaves a declared case undrawn (the row of states only when there is one other example; else the other examples drawn whole, two or three across, or the 3-column grid). Gate: `lesson.check.chartCases` must equal the declared cases. |
| LR-2 | **The packet deals only declared cases.** Nothing on a page the chart does not teach (+ 0 under "add 1–3", 11 − 6 in 2-digit regrouping, 100 − 47 across a 0). | r2 #7 (3 + 0), r3 #2 (11 − 6), r4 run (100 − 47 spilled Practice) | Engine: pool floors on the lesson's skill ref (`minOperand`, `minTop`, `maxTop`) on every part. Gate: every placed lesson item's cases ⊆ declared. |
| LR-3 | **Every step has its own icon**, one numeral and one name; the Steps list, the chart and every practice strip use the same ones. | r1 (icons repeated, eye on two steps) | Data + gate (distinct icons, each a drawn icon). |
| LR-4 | **Guided cells carry the chart's representation** (the number line with writing boxes for rounding, the dot tile for counting on, the T O heads and regroup boxes for columns); cell 1 has step 1 done in grey. | r1, r2 #2 (round Guided without a number line; tens boxes too small) | Engine (`weDoRender`). Critic's eye for new representations. |
| LR-5 | **No item twice in the packet** — chart examples, Warm-up, Guided, Independent, Practice, Mixed share ONE avoid set; a chart example never comes back, not even turned round; no turnaround on one page, across skills too (number bonds' 6 + 2 beside the lesson's 2 + 6). | r4 #2 (Practice dealt a chart example; Mixed repeated Practice and Warm-up items), r5 gate (a partner skill turned a lesson item round) | Engine: `buildLesson` keeps `avoidHard` / `avoidSoft` over the whole packet; the lesson plan drops repeats and chart examples from its pool; on the Mixed page each partner pool avoids the pools dealt before it (`buildRoleSheet` `skillsOf`). Gate: fails on any exact repeat, chart-example turnaround or same-page turnaround. A turnaround of *another* page's item is reported `soft` only: add 1–3 within 10 has 21 facts, fewer than the packet's 24–31 problems. |
| LR-6 | **No near twins** (51 − 44 and 53 − 45; 27 − 19 and 77 − 19), no number taken away twice on a page, no two answers alike. | r3 #2, r4 #1 | Engine: `noNearTwin`, `distinctFirst`, `distinctAnswer`. Gate: per page. |
| LR-7 | **Caps on rare cases**: at most one one-digit take-away and two answers under 10 a page. | r3 #2 (3 of 6 one-digit take-aways), r4 #1 (4 of 6 answers under 10 at seed 1001) | Engine: `caps` → `maxSmall`, `maxUnder10`. Gate: per page. |
| LR-8 | **Mixed practice uses earlier skills only**, the lesson skill fills **at least half** the placed items, each partner's numbers fit the lesson (2-digit sums to 99, no empty hundreds column). | r1 (a later skill), r2 #3 (2 + 8 in a carry scaffold), r3 #3 (6 of 13) | Engine: `leadHalf` after packing; partner floors on `mixWith`. Gate: share, partner grade ≤ the lesson's. |
| LR-9 | **Mixed partners are earlier skills** (grade at most the lesson's; never a later rung of the lesson). | r1 (nearest 100 in a nearest-10 lesson) | Data + gate. |
| LR-10 | **A lesson packet prints at ONE size** (owner ruling 2026-09-26): the anchor chart, the lesson sheet and the packet's own Practice and Mixed pages at the lesson's designed size (L). The print panel offers no Size for a set of lessons; a required tip (always shown) says why. The S → M notice of r1–r4 is retired. | r1 (S unreadable), r2 (not signalled), owner ruling 2026-09-26 | Engine (`LESSON_PACKET_SIZE`, `LESSON_SIZE_WHY`, teacher-print `sizeSetupHTML`). Gate: every packet printed at its size. |
| LR-11 | **Answer rows are 12 mm at L, 10 mm at M**, reserved on the pupil page so the page and its key share one layout. | r2 #6 (9.9 mm rows; the key redrew each problem 5.8 mm higher) | Engine (`stack` `.ansrow`). Gate: measured on the rendered page. |
| LR-12 | **The accent colour (#5B2A86) is only on step marks** — numerals, their circles, the icons; it survives a black-and-white copy as grey 66. | owner ruling 2026-09-25, r1 | Engine (`[data-mq-accent]`). Gate: any accent-painted element outside a step mark fails. |
| LR-13 | **Cells sized to their content**: no cell band of 30 % or more (H13), no page foot over 20 %, no overflow, every part on its own page count. Mixed rows sized to their kind (a fact row grows an eighth at most). | r1 (gutters, blank bands), r2 #4 (Steps panel 37–46 % empty), r4 #3 (27 % bands round the Mixed fact row) | Engine (content-sized panels, spread Steps list, row growth caps). Gate: rendered measure on the first `--layout` seeds. |
| LR-14 | **Keys are facsimiles and complete**: they fill regroup and carry boxes (owner ruling: AK-2 over VA-13), every graded slot, and nothing the pupil is not asked to draw (no dot or hop on a Guided number line key). | r1 (owner ruling), r4 minor (round Guided key) | Engine (stack `regroupWorking`, `weDoRender`). Gate: no empty graded slot on a key. Pixel facsimile: critic (`facsimile.py`). |
| LR-15 | **The chart is a poster**: L type at every size, panels sized to their content and never shrunk below 0.8×, the other examples at least 0.85× with their answers at digit size. | r1, r2, r4 #4 | Engine (`chartPage` zoom solve). Critic's eye for legibility. |
| LR-16 | **Sizes on other pages: every item at its floor at least** (owner ruling 2026-09-26). Printed on Practice or Mixed pages at S / M / L, every item that can be drawn at the chosen size is; one that cannot keeps its template's `minSize` (the regroup stack: M) and the page packs the others around it, never forced up a size. | owner ruling 2026-09-26 | Kit: `minSize` on the template (`stackMinSize`, `footprint().minSize`), `atLeastSize` in tokens. Mixed page: a page holding a floored item takes the lattice with the fewest over-wide shelves, then the most problems (`mixed-practice.js` `packing`); the pv rounding cell is measured up to four across at S (L1). The general mixed-height packer is the paginator lane's. Gate: a Mixed page at S holding a `minSize: M` item holds more items than at L, keeps every item at its floor, and passes H13. |

## What still needs a critic's eye

The gate reads items and measures boxes; it cannot judge whether a drawing teaches. Still critic-only:
whether a representation matches the step (L6), whether the Say line and words read well, digit sizes
that are legal but small, photocopy contrast, the pixel facsimile of a key, and anything a new
representation introduces.

| Round | Defect | Caught automatically? |
|---|---|---|
| r1 | icons repeated, an eye on two steps | yes: LR-3 (gate, static) |
| r1 | Mixed practice with a later skill (nearest 100 in a nearest-10 lesson) | yes: LR-9 (gate, static) |
| r1 | S unreadable | yes: LR-10 (the packet has one size; gate) |
| r1 | gutters and blank bands | yes: LR-13 (rendered H13, foot, overflow) |
| r1 | keys not facsimiles (regroup boxes empty) | partly: LR-14 fails an empty graded slot; the pixel facsimile is still `facsimile.py` + critic |
| r1 | the chart's drawings too small to read on a wall | no: LR-15 legibility is a critic's eye |
| r2 #1, r3 #1, r4 #1 | a case the practice deals but the chart never draws | yes: LR-1 (chart cases = declared cases) |
| r2 #2 | round Guided without the number line; small tens boxes | partly: LR-11 row heights are measured; "carries the chart's representation" (LR-4) is a critic's eye |
| r2 #3, r3 #3 | Mixed partners that do not fit; the lesson under half the page | yes: LR-8 (share), LR-9 (grade); partner fit (2 + 8 in a carry scaffold) by the floors |
| r2 #4, r4 #3 | Steps panel / Mixed fact row bands | yes: LR-13 |
| r2 #6 | answer rows 9.9 mm, the key redrawn 5.8 mm higher | yes: LR-11 (measured) |
| r2 #7, r3 #2, r4 run | + 0, 11 − 6, 100 − 47 dealt | yes: LR-2 (every placed item's cases ⊆ declared) |
| r3 #2, r4 #1 | near twins, one number taken away twice, 4 of 6 answers under 10 | yes: LR-6, LR-7 (per page, 25 seeds) |
| r4 #2 | Practice dealt a chart example; Mixed repeated Practice / Warm-up items | yes: LR-5 (exact repeats and chart turnarounds fail; cross-page turnarounds in a skill under the packet's size are `soft`) |
| r4 #4 | the chart's other examples small | partly: LR-15's 0.85× floor is the engine's; whether it reads is a critic's eye |
| r4 minor | a dot and hop on the round Guided key | partly: LR-14 (no empty slot); "nothing the pupil is not asked to draw" is a critic's eye |
| r1–r4 | whether the Say line, words and chant read well; whether a drawing teaches its step | no: critic |
