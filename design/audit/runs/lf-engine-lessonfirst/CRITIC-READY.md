# lf-engine-lessonfirst: CRITIC-READY

Branch `claude/sweet-newton-c8wrv1-lf-engine-lessonfirst`. Base: lf-checks 0983c6791 (on master d38308824). Merged with
master 65c28ccdf by ws-merge-master (ba67851f2). For the shared narrow critic, which grades both lf-checks' two checks and
this fix. Diagnosis: `DIAGNOSIS.md` (committed before the fix, e54216ebf).

## The fix (4 files + the gate's request)

| File | Change |
|---|---|
| `js/modules/print-sheet.js` buildLesson | The anchor-chart part is dropped when its plan has no states (`chart.plan.meta.states === 0`). That plan can only be an empty page. The lesson sheet, which already carries the full header, opens the packet. Request field `lessonVariant` is normalized and passed to the role as `lesson.variant`. |
| `js/modules/sheet/lesson-pages/chart.js` pickExample | A **fixed-table** pool (every item is a × fact sharing one factor ≥ 2) skips the column skills' widest-operands rule. Its model is `n × table` with the table SECOND (n groups of the table, so the worked steps count by the table). n is one of 3-9 (never 0, 1, 2, 10, 11, 12, or the table itself) and moves with `variant`. |
| `js/modules/sheet/roles/lesson.js` | Both pickExample calls (extras, plan) pass `{variant: lesson.variant}`, so the example is the same in both. |
| `js/modules/wrm-links.js` | `wrmLessonVariant(l)` (the WRM step number; a lesson with no step: a number from its key), `wrmLessonSeed(l)` = 4242 + 7919 × variant. |
| `js/modules/teacher-wrm.js` printLesson | A standard lesson sends `seed: wrmLessonSeed(l), lessonVariant: wrmLessonVariant(l)` (was seed 4242 for every lesson). |
| `tests/scripts/ws-lesson-pages.mjs` | **Request only, rules untouched.** It builds each lesson with the seed and variant printLesson now sends, read from the same wrm-links.js functions (a tree without them falls back to 4242). Without this, the gate measures a request no screen sends. **Critic: please confirm this is mirroring, not loosening.** The self-test (13 cases) is unchanged and OK. |

Nothing shrinks; no part is merged. Library lessons send no variant and build byte-identically (baseline below).

## Proof

**Grade 3, every lesson with a live direct skill (135), packet request** (`after-g3-packet.json`, `before-g3-packet.json`):

| Check | before 0983c6791 | after (merged ba67851f2) |
|---|---|---|
| LESSON-EMPTY-FIRST | 59 | **0** |
| LESSON-OPENER-SAME | 22 pairs | 6 pairs (below) |

The `--req print` request (teacher-wrm printLesson, first skill only) gives the same result: EMPTY-FIRST 0, OPENER-SAME the same 6 pairs (`after-g3-print.json`).

Y4.B4 openers, after: S2 5 × 6, S3 8 × 6, S4 7 × 9, S5 8 × 9, S7 4 × 7, S8 6 × 7, S9 5 × 11, S10 7 × 12. Each is "n groups of
the table; count by the table". Before, every one was "11 × table" (and S9 "10 × 11"). S11 / S12 now open on their own Warm-up
arrays (7 × 5, 9 × 6).

**Backtests** (`node tests/scripts/ws-backtest.mjs --row lesson-empty-first,lesson-opener-same`, unwrapped): FAIL → OK on
both rows. The pass side is now measured on this fix (601667535 merged), no longer the planted fixture.

**Lesson baseline** (`--all-lessons --sizes M,L --seeds 4242,1 --per-lesson --unpinned --check`): **OK, 2590 hashes
identical**. No page changed and no re-pin was needed: every pinned library lesson has a chart with states, and none deals a
fixed-table fact pool.

## The 6 remaining OPENER-SAME pairs: 5 check misfires, 1 real

For each pair I compared the first cell's full HTML. **All 6 differ**:

| Pair | Opener | What the gate reads | What actually differs | Verdict |
|---|---|---|---|---|
| Y4.B5.S3 / S4 | Warm-up, legacy groups item | text with no numbers | the drawing (group sizes; 68 element diffs) | misfire: the signature is text-only |
| Y4.B2.S6 / S7 | Warm-up, stack | `""` (its digits are not read) | the digits (8645 vs 5374) | misfire: a stack cell reads empty |
| Y4.B8.S5 / S6 | chart "n ÷ 10" | one number varies, 335 vs 436 | different items | misfire: a one-variable item always differs by ONE swap, so the rule can never pass it |
| Y4.B6.S5 / S7 | Warm-up, legacy area item | text with no numbers | the shape drawn | misfire: text-only |
| Y4.B12.S4 / S5 | Warm-up / Guided, legacy classify-triangle | text with no numbers | a different triangle | misfire: text-only |
| Y4.B14.S4 / S5 | Warm-up, legacy geo_rotate | "rotated 90°" | **the same figure; only the order of options A-D differs** | **real**: the geo_rotate pool has a small shape set, and two seeds dealt the same shape. These two steps send byte-identical requests apart from seed and variant. |

I did NOT change the check's rules. Two suggestions for lf-checks: read the opener's signature from the cell's numbers AND its
drawing (svg points / digit spans), and do not apply the one-swap mask to one-variable items. Y4.B14.S4/S5 needs content
work: a "Translate on a grid" lesson whose Warm-up deals rotations from a tiny pool. Its links give both steps the same
skill and options. I left it, rather than tune seeds until the gate goes quiet.

## Out of scope, seen while testing (for the critic and the lead)

- A lesson with no library record now opens on its lesson sheet: Warm-up, Guided, Independent. It has **no model (I do)**,
  and its **Steps:** column is empty (see `Y4.B12.S2-after-*`). Before, it opened on an empty anchor chart. The real fix is a
  lesson record (or a chart from the provider's worked steps) for those skills.
- Five consecutive-step pairs send identical skill and options for different WRM steps. Their links need step options
  (one vs more exchanges, number line vs estimate, compare vs order angles, km/m measure vs equivalence, polygons): Y4.B1.S9/S10,
  B2.S3/S4, B6.S1/S2, B6.S8/S9, B7.S4/S5, B7.S7/S8, B8.S5/S6, B10.S1/S2, B12.S2/S3, B14.S4/S5. The per-step seed keeps their
  pages from being identical; it does not make them teach their step.

## (c) CELL-FITS and the two_step_letter_equation Model page (lead, 2026-11-20)

**Check:** `tests/scripts/ws-lesson-cellfits.mjs` (new). CELL-FITS reads every `.ws-cell` box of every lesson page on the RENDER.
It checks text runs (Range rects), svg shapes, img, and drawn frames or fills, each against its NEAREST box and the `.ws-page`,
with a 0.6 mm tolerance. `--self-test` covers 5 planted cases. It runs on precritic `--role lesson` as gate `lesson-cellfits`
(every `lessons/library.js` lesson × M/L, blocking). Backtest `lesson-cell-fits`: FAIL on 0983c6791 measured (104 ink pieces
outside their panel, 14 outside the page), OK on the fix measured. Its ledger row is in `CHECKS_FROM_CRITICS.md`.

**Root cause:** `chart.js chartLayout` chose panels by state count alone: 4 states, a 2 × 2 grid. When those panels did not fit
the page even at zoom 1, `chartPage` drew them at zoom 1 anyway, and its sizing still said `ok` (the fallback is reported only
below zoom 1). The two-step story, the bars and the "= n" equation measure as fitting one across, not two. They were drawn
into half-width panels and ran past the page edge into the Say band and the footer.

**Fix (chart.js chartPage, chartLayout):** a 2 × 2 chart that cannot fit at zoom 1 AND whose state drawings fit one across but
not two takes `chartFull`: one full-width panel a row. A chartFull chart whose panels do not fit one page runs onto further chart
pages at full size, with Say and Rule on the last page. Nothing shrinks. Every other chart is untouched.
Two earlier tries were too broad and are not in the head; the baseline caught both:
- deciding chartFull from the example ITEM's measure (14 lessons changed that did not overflow);
- paginating every zoom-1 fallback chart (the same 14: their measured panels over-read their render).

**Result:** two_step_letter_equation M and L, pupil and key: CELL-FITS OK. Its chart is now **4 pages, one full-width panel each**:
each panel is 120 mm (the story is repeated in every panel), so two do not fit a page at full size. **Critic: each chart page is
about 45 % blank** (`png/algebra_two_step_letter_equation-after-*`). That is the honest cost of "nothing shrinks" with this panel.
The real fix is content: a chart that prints the story once, as the detailed two-step lesson does (`chartWide` + `chartRow` +
`tailRead`, its own data). That belongs to the algebra lesson lane, not the engine.

**CHART-HEAD (lf-engine chart-name, 2026-11-14) conflict, for the lead:** that rule says every anchor chart prints on ONE page.
two_step_letter_equation's chart now prints on 4 (M and L: 2 findings). On master the same chart broke the rule worse: 16
findings (body and page overflow, a bar row outside the page). The gate counts 58 on this head against master's 72. Every chart
page now carries the chart's full header, so the header findings are gone. "One page", "nothing shrinks" and "full width" cannot
all hold for a 4-panel chart of 120 mm panels. The content fix above resolves it; I did not loosen either rule.

**Lesson baseline:** 64 of 2590 hashes changed, all `algebra:two_step_letter_equation` (M, L × seeds 4242, 1 × pupil-p1..p7,
key-p1..p7, pupilHtml, keyHtml): the chart grew from 1 page to 4, so every later page shifted. Re-pinned in the same commit.
Every other lesson is identical.

**What else CELL-FITS finds (every library lesson × M/L, seed 4242; identical on 0983c6791 and on this head, except the
lesson fixed above):** 28 pages.
- the two-step family's 3-state anchor charts (row variant): multi_step_word (+ _plain), two_step_add_then_mult,
  two_step_add_then_div, two_step_estimate_check, M and L. Ink 12-58 mm outside the panels; the measured panel height
  under-reads the render, so the chart "fits". Not changed here (the narrow fix leaves fitting-by-measure charts alone).
  The same content fix as above is the cure.
- two_step_estimate_check: lesson sheet p3 (a word-work frame, 1-21 mm right) and Mixed p8 (a pv cell, 4.2 mm).
- place-value Mixed pages at L: identify, value, expand, combine, unit_form, compare, number_word_form (pv cells, 1.8 mm
  bottom); sub_50_no_regroup, sub_2d_1d, Y2.B2.S17 (pv multiple-choice, 0.6 mm).
- Vocabulary match cells at L, 0.7-1.5 mm top: number_word_form, Y1.B2.S9, Y3.B2.S12, Y4.B2.S5, div_facts.
Full list: `cellfits-before.txt` / `cellfits-after.txt` (this folder).

## PNGs (`png/`, page 1, pupil and key, M and L, before = 0983c6791, after = this branch)

Empty-first, 5 blocks: `Y4.B4.S11`, `Y4.B5.S1`, `Y4.B6.S3`, `Y3.B12.S4`, `Y4.B12.S2`.
Y4.B4 tables: `Y4.B4.S2` … `Y4.B4.S6` (S6 is the 3/6/9 chart lesson, unchanged).
(c): `algebra_two_step_letter_equation-<before|after>-<M|L>-<pupil|key>-p1.png` (before = 0983c6791).
Name pattern: `<id>-<before|after>-<M|L>-<pupil|key>-p1.png` (80 files).

## Gates (head 9d9551f95 = the fix merged with master a98297951; re-checked on edf61f391 = merged with master eb2e26972: boot OK, CELL-FITS the same 28, lesson-pages the same, backtests OK, baseline re-written on the merged tree - only two_step_letter_equation differs from master)

- `node --input-type=module --check`: every changed JS file OK. `ws-lesson-pages --self-test` OK (13), `ws-lesson-cellfits --self-test` OK (5).
- ws-boot-smoke OK · ws-roles-unit OK (113) · ws-precritic-plan OK (414 rows on path; checks-from-critics 372 pass, 91 exempt, 0 fail).
- ws-backtest `--row lesson-empty-first,lesson-opener-same,lesson-cell-fits` (unwrapped): 3 PASS (FAIL → OK each).
- ws-lesson-baseline `--all-lessons --sizes M,L --seeds 4242,1 --per-lesson --unpinned --check`: OK, 2614 identical (re-pinned for
  two_step_letter_equation only).
- ws-lesson-pages --grade 3: EMPTY-FIRST 0; OPENER-SAME 6 (the table above).
- ws-lesson-cellfits (every library lesson × M/L): 28 pages, the base's 30 minus two_step_letter_equation M and L (the list above).
- ws-layout-unit: **crashes on master and on the base 0983c6791 the same way** (`ws-layout-unit.mjs:918 reading 'inkMm'`, the
  fact-rows mixed-facts block). It is not this lane's code, so the known Guided fail is not reached.
- ws-precritic --role lesson --strict (head before the CHART-HEAD header commit; the reds are master's, compared finding by finding
  with master): lesson-unit 4/320 (= master; D13, N3, D18 ×2) · raster-fit 21 (= master) · print-lint L and M ratchet 28 (= master)
  · cell-checks 87 (= master) · lesson-samples-check 2 and -all 13 (= master) · lesson-samples-key-L 12 (= master) ·
  partopts-coverage 1 (= master) · no-size-s GATE-TOKEN 1 (= master a98297951: ws-empty-band.cjs:597) · empty-band 148 (master 166,
  fewer) · lesson-samples-chart (CHART-HEAD) 58 after the header fix (master 72; the 2 left are the one-page conflict above) ·
  lesson-pages-g3 6 (the 5 misfires and 1 real pair above; the gate is not on master) · lesson-cellfits 28 (new gate; the list
  above, the same 28 as the base). teacher-wrm PASS (master FAIL on 65c28ccdf).
