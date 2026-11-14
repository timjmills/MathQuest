# lf-engine ROW-STRETCH CAP: critic-ready (2026-11-14)

Branch `claude/sweet-newton-c8wrv1-lf-engine-rowcap`, from master 448bc5e74. Lead ruling: lf-placevalue vocabulary deploy, item (d).

## The rule

A row stretches only to its DRAWN height plus its template's writing room. The rule lives in `js/modules/sheet/layout.js`:

- `ROW_ROOM_MM` holds each template's declared writing room: `vocab-match3` 2 mm, `lesson-vocab` 2 mm, `count-row` 3 mm.
- `rowCapMm(drawnMm, items, rows)` returns the cap.
- `drawnRowMm(items, cols)` is the drawn height: the items' own measurement + 1 mm. It is never the skill's floor or a footprint guess.

Templates not in `ROW_ROOM_MM` are untouched: the cap is Infinity whenever any item in a row has no declared room.

Every composer that shares spare height into rows now applies the cap:

- `resolveSectionLayout`: the grid fill and fill limit.
- `practice.js spreadRows`: the lone-grid spread.
- `roles/lesson.js`: the band spare-height share. This covers `cap`, `capIfEmpty` and `growAll`, and the refused height is NOT passed to later bands.
- The tags it reads:
  - `lesson-pages/vocab.js`, `we-do.js` and `warm-up.js` tag their bands with `tmpls` (and `rows` where a band has several).
  - `lesson-pages/practice.js` caps the lesson's Independent rows.
- `roles/opener.js`: the PT-ENG-3 grow, reckoned on what the rows draw (`rowMm`).
- `roles/review.js`: the band cells.
- `roles/mixed-practice.js`: both shelf planners.

The height a cap refuses is never shrunk out of content and never passed into another row. It stays white at the foot. The count is unchanged, because the fill and the floor already bought the rows that fit.

## The check

`tests/scripts/ws-empty-band.cjs` has a new rule, EB-STRETCH. It is a default rule and runs on precritic's `ws-empty-band --skill` path.

- **What it measures:** each print cell of a declared template. Its row height is compared against the cell's NATURAL height plus the room. The natural height is a copy of the cell laid out of the grid with no row stretch, taking the tallest cell in its row. Anything over 1.5 mm FAILS.
- **What it skips:** a cell that shares its row with non-cell content (the Opener Model beside its Steps) is not judged.
- **Self-test:** 5 cases.
- **Debug:** `EB_DUMP=1` prints every cell's height and natural height.
- **Roles judged:** independent, more-practice, mixed-practice, test, review, lesson and opener. These are the roles whose composer applies the cap.
- **Roles noted only (follow-up):** Guided, Scripted Model, Error Analysis and Pre-skill check size their own rows. They get a `note:` line with their over-cap count, not a FAIL. Measured on 448bc5e74 they are 5–12 mm over on vocab_grade_pictures and count_by_tables.
- **Backtest row:** `eb-stretch-rowcap` (FAIL 448bc5e74 → OK 893d95d16), `ws-backtest: OK`. The ledger has a row in CHECKS_FROM_CRITICS. `ws-precritic-plan` is OK.

## Numbers (before → after)

| Case | Before | After |
|---|---|---|
| Match 3 Independent L, lf-placevalue 31d41507 (+ this fix applied as a patch) | rows 72.5 mm, EB-BAND 28.1–28.2 % (item (d)) | rows 52.5 mm, every band < 20 % (passes at `--margin 10`) |
| Match 3 Independent M, 31d41507 | 57.3 mm, 20.3 % | 52.5 mm |
| Match 3 Independent M/L, master | 57.3 / 57 mm (drawn 50) | 52.5 mm |
| Opener count row, count_by_tables | 39.2 mm M / 43.4 mm L (drawn 30.7 / 34.8) | 34.2 / 38.4 mm |
| Lesson Vocabulary, add_facts M (page 2) | 51.22 mm grid | 41.4 mm (the only diff in the page HTML) |
| Review / Mixed practice Match 3 | 56.3–72.6 / 55.6–62.2 mm | held to 52 mm |

## Hash proof

- **Lesson pin:** re-pinned in 893d95d16. 216 of 1772 page hashes changed, across 29 lessons. Every one is a held-to-cap row. The list is in `lesson-baseline-changed.txt`.
  - Page 2 (pupil + key) of every sheet lesson with a Vocabulary band.
  - vocab_grade_pictures p4–p7 and vocab_pick3_words p2/p6/p7, the Match 3 rows.
  - Three detailed lessons, through the Vocabulary band (`growAll`): g1-oa1-bar-model-wp-20, g3-oa9-input-output-rule, g3-oa9-mult-table-patterns.
  - Spot-diffed page HTML master vs fix: only `.ws-grid` heights differ.
- **Capacity pin:** `ws-capacity-pin --check` OK (785 pages, 0 falls).
- **Pages outside lessons:** changed only where every item in a row is `vocab-match3`, `lesson-vocab` or `count-row`. Every other row has an Infinity cap, so it is unchanged by construction.

## PNGs (this folder; pupil + key, M + L)

- `match3-{M,L}-{pupil,key}-before-31d41507.png` / `-after-31d41507+fix.png`: vocab Match 3 Independent, lf-placevalue's skill as at 31d41507.
- `opener-*-before-448bc5e74.png` / `-after.png`: count_by_tables Opener (count-row).
- `lessonvocab-*-before-448bc5e74.png` / `-after.png`: add_facts lesson page 2 (lesson-vocab).
- `review-*-before-448bc5e74.png` / `-after.png`: vocab_grade_pictures Review (vocab-match3).

## Open for the critic / lead

1. **Match 3 L on 31d41507 prints 3 a page** (the skill floor at L). Held to their drawn 52.5 mm, the 3 rows leave about 74 mm white at the foot instead of a 28 % band in each cell. This follows the leftover rule (white at the foot), but a PAGEFILL-style lint may now flag it. The count is lf-placevalue's to raise: 4 rows of 52.5 mm fit the page.
2. **The noted roles still stretch.** Guided, Scripted Model, Error Analysis and Pre-skill check are not yet capped. The next engine step is to hand those composers `rowCapMm`.
3. **Gates:**
   - syntax check on every changed JS file: OK;
   - ws-boot-smoke: OK;
   - ws-layout-unit: only the known "Guided, 110 mm cells" fail;
   - ws-roles-unit: OK;
   - ws-precritic-plan: OK;
   - ws-backtest `eb-stretch-rowcap`: OK;
   - ws-empty-band `--self-test`: OK.
