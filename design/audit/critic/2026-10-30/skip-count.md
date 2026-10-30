# Skip-count lane: independent critic round 5, 2026-10-30 (work order 1c)

Critic: independent (Opus 5.5, medium effort). Read-only: no source edited, nothing committed.
Tree: `claude/sweet-newton-c8wrv1` at `fbeaa332` (live). The lane's round 5 (`b19172b4`, the D12 fix) was merged and deployed on
2026-10-17 without this round.

Skills (one family, one template `count-row` plus its screen twin; every finding says which skills share it):
- `patterns:skip_count_grid`;
- `patterns:skip_count_line`;
- `multiplication:count_by_tables`.

Brief: `design/audit/RUBRIC.md` (C1-C4) and the lane's r4 report (`design/audit/runs/skip-count/critic-r4.md`). Graded scope
(owner 2026-09-26): Practice (independent and more-practice, S and L in full, M spot-checked, with keys), Quiz / test with key, the
skill's Lesson, and the practice card (1280 / 820 / 390), the online worksheet and the quiz. Since r4 the owner has ruled that
(2) wide rows wrap and keep size and the Opener is NOT exempt, and (3) on a phone the card opens scrolled to the first answer box.

## Verdict: FAIL. Lowest score 3 (Lesson, C1 and C3, all three skills)

D12 (r4's only blocker) is fixed: the Model never leaves a lone state. Every practice, model, test page and the 1280 / 820 hosts
score 8 or more, as at r4. The round fails on two things r4 did not grade:
- **SC1. The Lesson pages are broken for all three skills.** The rubric scope says a skill passes "its Lesson where it has one".
  r4 had left the lesson packet to the lessons wave.
- **SC2. The owner's phone ruling (3) is not built**, so the 390 card opens with no answer box in view.

## What was checked

| Check | How | Result |
|---|---|---|
| Renders | `ws-grade-render --roles independent,more-practice,test,scripted-model,lesson` at S and L (pupil and key, plus the three screen hosts); independent and test at M (`scratchpad/crit1030-sc/{S,L,M}/`) | read by eye: every page and every host |
| `ws-precritic --strict` (3 skills) | one run, browser-jobs 1. It hit my 60-minute limit, because a shared browser lock held it for about 45 min. The coverage matrix, print-lint S and their dependants were killed, not failed | PASS: providers-unit, node-lint, code-snapshot, content-audit, options-verify, presets-unit, print-lint L (independent). **FAIL: node-lint LESSON-DATA / OPTION-HELP (7 new findings)** |
| `ws-print-lint --source kit --roles lesson --size S` | separate run | **FAIL, ratchet 0 → 30 L-OVERFLOW, 20 L-INK ILLEGIBLE, 2 L-KEY AK-4** (SC1) |
| `ws-phone-card` | separate run | **FAIL: INVIEW 8, FOCUS 10** (SC2). CLIP-X 246, mostly the owner-ruled swipe window (see SC4) |
| D12 | the r5-final evidence plus the Model renders | fixed: count_by_tables Model at S is 4 states on one page; skip_count_line Model at L is 4 states on one page, with no lone state |

## Scores (all three skills unless named)

| Version | C1 | C2 | C3 | C4 | Pass | Main defect |
|---|---|---|---|---|---|---|
| Independent / more-practice S, L (M spot) + keys | 9 | 9 | 8 | 9 | yes | full pages (S: 8 rows / 9 lines; L: 6), facsimile keys |
| Test S, L (M spot) + key | 9 | 9 | 8 | 9 | yes | |
| Model (scripted) S, L | 9 | 9 | 8 | 9 | yes | D12 fixed. S count_by_tables leaves about 18 % at the foot (nit) |
| **Lesson S, L** | **3** (H2) | **4** | **3** (H5, H13) | **5** | **no** | SC1, SC3 |
| Practice card 1280, 820 | 9 | 9 | 8 | 9 | yes | |
| **Practice card 390** (line) | **6** | 8 | 7 | 9 | **no** | SC2: no answer box in the first view |
| **Practice card 390** (grid, tables) | **7** | 8 | **7** | 9 | **no** | SC2: the first box is off-screen; two wrapped lines read as one row ("2 → 4 → 6 / [ ] → 16 → 18") |
| Online worksheet 1280 | 9 | 9 | 8 | 9 | yes | |
| Quiz 1280 | 9 | 9 | 8 | 9 | yes | nit: the "10" step tab's digits touch its outline (grid) |

## Findings

**SC1. CRITICAL · Lesson role, all three skills, S and L · `js/modules/sheet/roles/lesson.js` (anchor chart / I-do grid, Guided strip) with
`sheet/cells/count-row.js`**
- **What.** Page 1 (the 2 × 2 anchor chart, "Count by 11: each jump adds 11"):
  - every count row is wider than its 92 mm cell and sticks out by 39-42 mm into the neighbouring cell and past the page edge;
  - the step tab sits on top of the row's numbers;
  - givens are drawn black on black: "66", "110" and "90" cannot be read (`S/*/lesson-p1.png`, `L/patterns__skip_count_grid/lesson-p1.png`).

  Page 2 (Guided Practice) runs the row out of the left margin and under the Steps panel (`L/patterns__skip_count_line/lesson-p2.png`).

  The lesson keys do not match their pupil pages: AK-4, 18 vs 17 slots on grid, 11 vs 9 on line.
- **Fix.**
  1. The lesson role must size a count row to its cell. In the anchor chart and Guided strip use the row's full-width geometry:
     a 1 × 4 stacked anchor chart for wide cells (`footprint.wide`), the way the Model page stacks states. Or give the row the
     cell's width so it wraps into two lines of 3-4 columns, as on the 390 card.
  2. Never place the step tab inside the row's track.
  3. Rebuild the key from the same plan.
- **Would have caught it.** `ws-print-lint --source kit --roles lesson` (it is on precritic's path and fails here with the right
  rules: L-OVERFLOW 30, L-INK 20, L-KEY 2). The lane never ran it, and r4 scoped the lesson out. **Process check:** the lesson role
  must be in every skill lane's precritic. It already is, so a lane cannot pass while lint-lesson is red.

**SC2. MAJOR · 390 practice card, all three skills · `js/modules/screen-cell.js` count-row twin (swipe window) · owner ruling
2026-10-17 (3)**
- **What.** The owner's ruling (3), "on a phone the skip-count card opens scrolled to the first answer box", is not built:
  - skip_count_line opens with three given numbers and no box (`S/patterns__skip_count_line/card-390.png`), and the cue says
    "Swipe → for more boxes";
  - the grid and tables open with the first box off to the right (x 373-450 in a 390 view), and focus on nothing.
  `ws-phone-card`: INVIEW 8, FOCUS 10 of 18 renders.
- **Fix.** On first render at the phone width, scroll the swipe window so the first answer box is the last whole column (r4's
  option 1), and focus it (`preventScroll`, then `scrollLeft`). For two-line rows, show one line per window, or a visible line
  break marker, so "6" and "[ ] → 16" never read as neighbours.
- **Would have caught it.** `ws-phone-card` INVIEW / FOCUS (exists, fails). Add it to `ws-deploy-gates.sh` so a deploy cannot
  ship it red.

**SC3. MAJOR · Lesson Warm-up and lesson data, all three skills · `js/modules/lessons/prereqs.js` `LESSONS`**
- **What.** None of the three skills has lesson data, so the Warm-up deals whatever comes before it in the category:
  - count_by_tables gets "90 × 5 =", "5 × 100 =" and "Write multiply if the groups are equal";
  - skip_count_line gets "**Drag** the numbers in reverse counting order (counting down by 6s)" in 9 pt type, which is a screen
    verb on paper (H7) and a 6s count-down in a 2s / 5s / 10s lesson.
  The lesson's independent part prints 4 + 2 rows over two pages, each cell about 50 % empty (H13), and page 2 is about 50 % empty (H5).
- **Fix.**
  1. Add `LESSONS` entries naming real prerequisites (skip_count_line / grid: `count_sequence`, `number_patterns` by 1s and
     10s; count_by_tables: `skip_count_grid`, `arrays_groups`).
  2. Size the lesson's practice cells to the row (as the independent page does: 8 per page at S).
- **Would have caught it.** `ws-node-lint --rules LESSON-DATA` (exists, and fails in precritic: "no-lesson-data" × 3). Add
  L-VERBS to the lesson-role lint run (it fired nowhere here because the warm-up drag text is under 12 words; extend L-VERBS
  to warm-up cells).

**SC4. MINOR · `ws-phone-card` CLIP-X on swipe rows (gate triage, not a page defect)**
- **What.** 246 CLIP-X findings are mostly numbers and boxes scrolled outside the owner-ruled swipe window.
- **Fix.** Teach `ws-phone-card` to treat a descendant of the count-row swipe window (`[data-swipe]` or equivalent) as clipped by
  design, while it still checks that the window itself fits. Otherwise the INVIEW signal drowns in noise.

**SC5. MINOR (C1 nit) · Option help, skip_count_line and skip_count_grid · `js/modules/skill-options.js` `_skipBy` (around line 2666)**
- **What.** "The friendly steps (2s, 5s, 10s) come first." is shown on the `g2` groups, where every choice is a friendly step. The
  sentence means nothing there. `ws-node-lint` OPTION-HELP flags it (4 findings).
- **Fix.** Pass the help per group set: g2 gets "Start with 10s, then 5s, then 2s".
- **Would have caught it.** OPTION-HELP (exists, fails).

**SC6. NIT · count_by_tables title**
- "I Can count by 1 to 12" reads oddly, and an 8-row S page deals 2-9 only.
- Use "I Can count by the numbers 1 to 12", or "I Can skip count in the 1 to 12 times-tables".

**Process note.** The lane has no signed spec card (`ws-spec-card --check-signed` is N/A for all three). Write it when the fix
round starts, so the hosts-and-roles lines (Lesson included) are decided up front.

## Fix list for the builder (rebuild after a failed round: Opus medium)

1. SC1: a lesson-role count row that fits its cell (stacked anchor chart for wide cells), and a key that matches.
   `ws-print-lint --roles lesson` at S, M and L must be green.
2. SC2: the 390 card opens at the first box with focus. `ws-phone-card` INVIEW and FOCUS must be 0.
3. SC3: `LESSONS` entries for the three skills, and lesson practice cells sized to the row. `ws-node-lint LESSON-DATA` must be green.
4. SC4 gate triage, SC5 help text, SC6 title.
5. Re-run the full `ws-precritic --strict` (it was cut short today by the shared browser lock). Then critic r6 grades the Lesson and the
   390 card in full and spot-checks the rest (the near-miss rule does not apply: the round has scores of 3).

## redesign-passed.js

Nothing to add: none of the three skills passes.

## Evidence

Scratchpad `/tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/crit1030-sc/`:
- `{S,L,M}/<skill>/`: the renders;
- `precritic.log` (cut short), `phone-card.log`, `lint-lesson-S.log`.

The precritic logs are in `/tmp/mq-precritic/20261030-171950-5346/`.
