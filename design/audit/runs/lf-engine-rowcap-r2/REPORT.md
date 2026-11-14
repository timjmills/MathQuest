# lf-engine row-cap re-critic r2: PASS for stage 1

| | |
|---|---|
| Branch / head | claude/sweet-newton-c8wrv1-lf-engine-rowcap @ 174c839be |
| Critic | independent, medium; graded from the PNGs and CRITIC-READY only |
| Scope | stage 1 of the staged rollout the lead approved: the row cap on vocab-match3, lesson-vocab and count-row, plus r1's F3 fill fix |
| Saved by | lf-engine (the critic could not write files) |

## Scores

C1 ease of use, C2 educational value, C3 spacing and layout, C4 standard fidelity.

| Pupil page (r2) | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Review vocab_grade_pictures M | 9 | 8 | 9 | 9 |
| Review vocab_grade_pictures L | 9 | 8 | 8 | 9 |
| Match 3 Independent M (31d41507+fix) | 9 | 8 | 9 | 9 |
| Match 3 Independent L (31d41507+fix) | 9 | 8 | 8 | 9 |

The opener count row and lesson vocab keep their r1 scores (≥ 8 on every criterion); this round did not change them.

## Judgements

- **Fill:** Review L and Match 3 L now print 4 rows instead of 3. About 21 mm of white is left above the footer, less than one 52.5 mm row, so it is not a PAGEFILL major.
- **Squashing:** no cell is squashed or clipped.
- **Keys:** each key is a facsimile of its pupil page, and all 12 answers on each L page are correct.

## Findings

**F1 (open evidence gap; does not block the graded pages).**
- The vocab_grade_pictures L lesson now runs to 10 pages instead of 9.
- No PNG of its pages 9–10 was supplied, so a near-empty last page (H5) cannot be ruled out. The pages should be seen before merge.
- Check: ws-print-lint PAGEFILL on lesson pages, plus a lesson-pin rule that a page-count rise must state the new last page's fill %.

**Note (outside scope, already present before this change).**
- Match 3 L draws its pictures at the same size as M; only the labels grow. This is the "Size L ignored" class.
- Check: a size-ratio lint (L drawing height ≥ 1.1 × M).
