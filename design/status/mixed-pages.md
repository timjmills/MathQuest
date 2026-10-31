Lane: mixed-pages
Title: Truly mixed practice pages (M1–M5)
Session: session_013pHDnLJxJB8jZan3tZDfNS (M2)
Branch: claude/sweet-newton-c8wrv1-mixed-m2
Owner of files (M2): sheet/roles/mixed-practice.js, sheet/mixed-pack.js (new), sheet/interleave.js, sheet/layout.js, sheet/paginate.js; the dialog: teacher-sheet.js, teacher-plan.js, teacher-tray.js, teacher-print.js
State: STOPPED with a hand-over (2026-10-31) — budget cap reached before a passing round; critic r3 FAIL (print), dialog check r3 FAIL; the r3 dialog defects fixed after it (73d2eb2), the print defects open
Updated: 2026-10-31
Builder profile: mq-opus-medium
Critic rounds: M1 r1–r6 (PASS); M2 print r1, r2, r3 FAIL; M2 dialog check r1 (7/7/7/8), r2 (7/8/6/8), r3 (8/7/6/9) FAIL

## Owner (2026-10-31, verbatim)
"This practice by section is good BUT we also need practice with mixed problem — so both need to be options, mix by section
(with specified amount of problems) and also mixed each problem (with specified problem distribution as well)."

## What is built (M2)
- Engine: `arrangement: 'mixed'` mixes ANY 2+ skills (no fallback for legacy drawings, sizes or heights; examples on stays
  M4's). Block packer `sheet/mixed-pack.js` (a tall box beside a block of small boxes; turns), exact per-skill counts across
  pages, `fits.perPage`, weights held then fill-with-note, in-cell cue from the item's own task, R1-7 (S > M > L), short
  Sections rows, Independent / More practice mixed by the same packer. Engine notes: `design/status/mixed-m2.md`.
- `multiplication:multiply` table facts (both factors ≤ 12) moved to the kit fact cell (precritic for the skill 6 → 4 FAIL, none new).
- Dialog: "In sections | Mixed up | Single skill" on Print and Quiz (1 skill: no choice); per-skill boxes drive both;
  Pages mode raises pages to fit held counts; per-page capacity learnt from the engine; Mixed up pages rotate every skill;
  saved with the set (`kind`), shared as `Wm`; online quiz ordered by `interleave()`; older print screen has the choice.
- Checks: `sheet/mixed-m2.check.cjs` (on precritic --role mixed-practice), `tests/scripts/ws-teacher-arrangement.cjs`.

## Critic r2 (print, fresh renders at b8b6211): FAIL
PASS: the owner's case (multiply + add facts) mixed one by one at S / M / L (all 9s); Sections pages (9 / 9 / 9 / 8 at S);
3:37 exact counts at S and L; every key a true facsimile, every answer right (7 keys checked); S > M > L; no split cell.
FAIL: half-empty last rows (2-digit × + facts S/M/L, I Can L; 3:37 at M ends page 1 with 1 problem in a 6-slot row);
long runs without a true note (fractions + subtract S: 4 / 8 / 4 stripes); uneven spread of a small skill across pages;
2-digit × answer rule 8–15 mm below the fact rule beside it; 2-digit × digits ≈ 60 % of the L fact digits; c-M 33 mm blank.

## Dialog check r2 (b8b6211): FAIL — A 7 · B 8 · C 6 · D 8
PASS: the two-way choice (and none for 1 skill, also on Quiz); Mixed up with facts at 12/8, 3/17, 2/18, 50 %, ten skills —
1 page each, exact counts, mixed one by one, summary = printed; Pages mode with held counts; saved / reload; share `Wm` /
no W; quiz order (longest run 2), printed quiz mixed; older print screen; every ws-teacher gate.
FAIL: (1) In sections plans 3 pages and prints 4–5 (a part starting part-way down a page spills one cell; a page with no
title); the summary then says "3 pages … printed on 4 pages"; In sections plans 8 facts a page (page 1 half empty).
(2) a big-cell mix (add_facts + mult_2by2_standard) prints 10 + 10 right, but the built counts miss the legacy × cells, so
the summary warns "the engine changed some counts". (3) big cells are not mixed one by one in print (the engine's runs, above).
Survived two rounds: "summary = what prints" (r1 #4 → r2 #1). Root cause: the dialog plans pages with its own per-page
guess (PER_PAGE) and learns capacity only for Mixed up; In sections pages come from the Independent role's own part
pagination, which the plan does not model. Check required: for every In sections and big-cell case, built pages ===
plan.pages, every page titled, built byKey === plan byKey (ws-teacher-arrangement has neither).

## Root cause (§1.7 stop)
Survived two medium rounds: runs (r1 #3 → r2 #2), cross-template alignment (r1 #4 → r2 #4), wasted space / short rows
(r1 #7 → r2 #1, #6).
1. **The builder's check could pass what the critic fails.** Each class had a check, but in a softened form the builder
   chose: runs only WARN ("even spacing would give 2" still OK); the trailing area allowed at any width and counted as used
   by `fill`; `align` applied across templates only to the first rule at 1 mm for the pairs the builder rendered. The
   critic's sets (2-digit stack, fraction visual, 3:37 at M) were not in the check's matrix at every size.
2. **The packer places in blocks, the critic reads in problems.** `mixed-pack.js` counts runs and fill per turn / per
   shelf; a block of 4 facts is one turn, so two adjacent blocks plus a shelf of tall boxes are "2 turns" but 8 problems
   in a row on paper. Fill is per page budget, not per row, so a 3-of-8 last row passes.
3. **Two drawings of different families on one row.** A legacy 2-digit × stack and a kit fact have different digit sizes
   and rule positions; no shared baseline exists across templates, so the packer cannot align them — only a kit `stack`
   cell for 2-digit × (or a per-row baseline offset) can.

## Machine checks required before any further round (fresh builder, Opus medium)
| Check | Rule |
|---|---|
| runs-in-problems | longest run counted in PROBLEMS in print order across pages; > 2 FAILS unless the note states that run and the weights force it (no WARN) |
| row-fill | every row's used width ≥ 1/2 of the row, and the trailing area ≤ 1/2 a row; a non-last page never ends in a short row |
| even-spread | a small skill's problems across pages: gap between consecutive ones within 1.5 × the even gap |
| cross-align | every stacked cell in one row: answer rule y within 1 mm, whatever the template |
| digit-size | digit cap height within 10 % across templates on one page (content never shrinks) |
| spare-height | page body ≥ 85 % used or the spare shared into the answer zones (PT-MIX-4) |
Each backtested (FAILS on b8b6211, PASSES on the fix), with the critic's six sets at S / M / L both looks in its matrix.

## Open for M3 / M5 / the owner
- Word-problem cells' cue says only "Circle the sign." (1 of 3 tasks) — M3 cues.
- Pupil's online worksheet does not follow `interleave()` yet: `worksheet.js` `newWorksheet()` / `_wsGenerate(i)` and the
  decoded `settings.arrangement` are not stored — M5.
- "In sections" page capacity: the Independent role starts a new page per part unless both are small, so the dialog learns
  Sections capacity only on spill (role composer owned by another lane).
- `mixed-practice` role print-lint pages still unpinned (2 precritic rows red on base and here at the same counts).

## Dialog fix r3 (In sections + dialog half; fresh builder, Opus medium, §1.7 re-brief)
- In sections prints as ONE Independent sheet (a part per skill, whole counts); the engine flows the parts
  (`practice.js` flowLayout → `paginate.js` flowSections): a part that does not fill whole pages is sized to its
  rows (DENSE_ROOM, less when that saves a page; content never shrinks) and goes on in WHOLE rows, its instruction
  again overleaf (PG-22); every page of such a sheet carries the title. Fits report `sheetPerPage` / `sheetPages`.
- The dialog's In sections pages are the engine's pages for that plan (learned on every build); Pages mode also
  learns the sheet's per-page capacity. Built counts map preset legacy cells (host id) and `s<n>` pools to the plan key.
- ws-teacher-plan-match 11 → 0 fails. Single-section, lesson, more-practice and other roles byte-identical
  (104 / 106 requests; the 2 that moved are Independent sheets of two parts, by design).
- Screenshots: design/status/mixed-m2/dialog-r3-*.png.
- Open: 3 + 17 facts at M is 2 pages In sections (4 columns × 42 mm rows; Mixed up's 6-column page holds it on 1).
  Big-word page 2 holds 2 rows (the third does not fit at DENSE_ROOM); the title of a 2-skill sheet over 64 characters
  falls back to "I Can practise each skill in its own part".
## M2 §1.7 rebuild — engine half (fresh builder, Opus medium, 2026-10-31)
Design: the ORDER is decided in problems over the whole print before any row is built (`mixed-pack.js` `orderOf`:
two skills by the gap rule — the minority separates the majority's groups, groups within one of each other, the longest
group the forced minimum ceil(major/(minor+1)) or 2; small boxes in whole columns of R; three or more skills by
`interleave()`), then cut into columns (a tall box; small boxes R to a column, numbered down then across), full-width
shelves (`shelvesOf`, each its own grid with fr columns; a short column ends its shelf so its hole is the ONE trailing
area), and pages (even problem shares, each page's columns spread over as many shelves as its height holds; a shelf
of small boxes laid flat where one row is left). Spare height goes into the shelves up to every drawing's 70 %
(H13); a kit long procedure takes the rest as working space (`--mq-work`). Fill counts: every count pair is laid out
(probe heights, then the DEALT cells re-planned, best of up to 3 deals); weights held first, else the fill nearest
the weights, with the note. 2-digit × is the kit `stack` with `partials` (MB-5): partial-product rows, a second
rule, the key writes them; facts on a page with a kit stack print at the stack's digits with their rule on its line
(pad from the tokens), and facts beside taller row-mates are drawn a count across bigger (H13).
Checks: mixed-m3 116 → 0 (OK); mixed-m2 0 → 1 (`ladder mixed d daily seed 4074: S 17 / M 17` — open, see report);
mixed-page OK; interleave self-test OK.
## M2 final fix round (critic r3 + dialog check r3; Opus medium, 2026-10-31)
Fixed:
- D1/D2 Mixed up over several pages is ONE `mixed-practice` request with each skill's whole count (teacher-sheet.js
  `requests`, `one` for kind 'mixed'); the engine paginates it: footers k/N, numbering continued (pupil and key); the
  plan learns the engine's pages as In sections does. The engine tries one page fewer (`evenAt(P - 1)`) before the
  greedy page count: ten skills in 20 on 2 pages, not 10 / 9 / 1. Continued pages carry the sheet's title
  (`titledCont`, the continued budget less the title's lines).
- D3 `partsTitle` never returns the generic string: too long → the operations ("I Can add, subtract and multiply"),
  else the skills' names. D4 the older print screen titles an In sections page of 2+ skills the same way.
Checks (each FAILS on 014957a, PASSES now): ws-teacher-plan-match `numbered` (k/N footers, continuous numbers,
pupil and key), `filled` (pages <= ceil(problems / perPage), non-last pages >= 85 % of the even share), `titled` also
rejects the generic parts title; ws-teacher-arrangement step 8 reads the print screen's In sections title, and its
Mixed up step reads the ONE flowed request (whole plan counts, plan pages) instead of one request per page.
OPEN (skipped for budget; checks written, opt-in until the engine passes them):
- P1 Mixed up empty box (c-S cell 16): `mixed-m3 --checks boxes` (6 on set c). Spanning the short column's last
  problem over the rows was tried and reverted: it fails mixed-m2 H13 (a fact in a 2-row box, 37 %).
- P1 second half: Independent of two parts (10 + 10 facts) still 4 across at M / 3 at L with an empty box
  (`mixed-m3 --only h`); a count across that divides the part's count in practice.js flowLayout was tried and
  reverted (part 2 kept its own layout; L parts take the "full" branch).
- P2 cells wider than content / 0.45: `mixed-m3 --checks width` (108 cells).
- P3 one count across on every full row of a sheet: `mixed-m3 --checks across` (e-M: 4 then 5 across).
- D2 ten skills: 20 on 3 pages (7 / 7 / 6 even, perPage 12): plan-match prints it as OPEN, not yet a FAIL.
- P4 In sections without counts sharing shelves 50/50 with no note; D5 (12 + 5 with 3 empty boxes).

## Critic r3 (print, 014957a): FAIL — and dialog check r3: FAIL (A 8 · B 7 · C 6 · D 9)
PASS on print: owner's case a S/M/L (9/9/8/9), b-M, c-M/L, d-S, e-S, f-L (I Can) all ≥ 8; mixed one by one, runs > 2 only
when forced and truly noted; exact 3:37; S > M > L (d under the lane ruling below); 2-digit × kit stack with partial
products lines up with facts; every key answer right (7 keys incl. partial products).
Lane ruling (lane lead, 2026-10-31, for the lead): at S a page whose every row height is set by a non-shrinking visual
(fraction cell) may hold the same count as M when its facts are at the largest digits keeping H13 ≥ 70 % and the note
says so (mixed-m2 `h13Exempt`, 1 mm tolerance; a facts-only S = M still FAILS).
PASS on the dialog: exact counts in all 18 runs, every Mixed up page mixed, In sections parts titled, summary = printed,
no false "engine changed" warning, 1 skill no choice, save / share Wm, quiz order, older print screen.

## Hand-over (2026-10-31) — what is open, with the checks that are RED for it
Fixed after r3 (73d2eb2, not yet graded): Mixed up is ONE flowed request with whole counts (k/N footers, numbering runs
on across pages and keys, every page titled); no generic "I Can practise each skill in its own part" title (dialog and
teacher-print.js). Checks: plan-match `numbered` / `titled` (FAIL on 014957a, PASS now).

OPEN — each a HARD FAIL by default (the r3 fixer had made them opt-in / "OPEN"; reverted at the hand-over: a check may
never be opt-in to keep a branch green). `node js/modules/sheet/mixed-m3.check.cjs --quick`: 13 failures —
| Defect (critic r3) | Check (red now) | Where to fix |
|---|---|---|
| P1 empty box under the last cell (facts + word problems S, seed 722369); Independent 2 × 10 facts at M: rows of 2 + a 2-wide empty box, page 2 ≈ 45 % | `boxes` 3, `rowfill` 2, scenario `h` | mixed-pack.js shelvesOf (fill the column: one more fact on a fill page); practice.js flowLayout (a count across that divides the section, 5 for 10) — spanning the last cell broke H13, reverted |
| P2 cells ≥ 30 % empty each side (b-S 15/16, b-L 1, d-L 9/10, d-M 15–17) | `width` 7 | mixed-pack.js: a cell no wider than ≈ content / 0.45; spare width → another problem or a narrower centred row |
| P3 e-M: page 1 4 × 5, page 2 5 × 4 (PT-MIX-3) | `across` 1 | mixed-pack.js pages: one count across per sheet at the mix's capacity (30 at M) |
| P4 Sections without counts 24 : 8 / 8 : 2 at 50/50, no note | not built (extend mixed-m2 `weights` to sections) | mixed-practice.js grouped packing: shelves by count, or a true note |
| D2 ten skills Mixed up, 20 in all: 3 pages where 2 hold them | plan-match `filled` 1 | mixed-practice.js: lay the even pages at its own perPage |
| D5 (minor) In sections, Pages 1, add typed 12: 12 + 5 with 3 empty boxes | none | teacher-plan.js / flowLayout |
Not refreshed after 73d2eb2: design/status/mixed-m2/after/* renders and dialog screenshots (the r3 critic's fresh renders:
the session scratchpad critic-r3/, dialog-check-r3/ — not committed).

Next lane (Opus medium, fresh): make `mixed-m3` (all 9 checks incl. `h`), `mixed-m2`, `ws-teacher-plan-match` green
without editing them, then one critic + dialog check. Expect ≈ $40 build + ≈ $20 grading.
