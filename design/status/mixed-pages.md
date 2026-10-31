Lane: mixed-pages
Title: Truly mixed practice pages (M1–M5)
Session: session_013pHDnLJxJB8jZan3tZDfNS (M2)
Branch: claude/sweet-newton-c8wrv1-mixed-m2
Owner of files (M2): sheet/roles/mixed-practice.js, sheet/mixed-pack.js (new), sheet/interleave.js, sheet/layout.js, sheet/paginate.js; the dialog: teacher-sheet.js, teacher-plan.js, teacher-tray.js, teacher-print.js
State: M2 STOPPED at critic r2 (§1.7: three defect classes survived two medium rounds) — root cause below, report to the lead
Updated: 2026-10-31
Builder profile: mq-opus-medium
Critic rounds: M1 r1–r6 (PASS); M2 print r1 FAIL, r2 FAIL; M2 dialog check r1 FAIL, r2 see below

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
