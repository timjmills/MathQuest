# lf-engine chart-name: CRITIC-READY

Lane lf-engine, branch `claude/sweet-newton-c8wrv1-lf-engine-chart-name`, from master 22752843c. Owner request: the lesson
ANCHOR CHART prints a Name / Date line.

## What changed

- `js/modules/sheet/lesson-pages/chart.js` `chartPage`: the chart's header is now the frame header (`frameOf` → `f.header`)
  instead of one with `name: false, date: false`. The page is still drawn by `frame.js page()` → `pageHeader(h)`, so the
  line uses the same markup, type and 2.25 pt rule as every other page. Nothing is copied by hand. The teacher's header
  options still apply (`frameOf` reads `h.name !== false`).
- Score stays off. The chart has no graded slot, and `frameOf` is called with `score: 0`. A chart that is scored would pass
  its count there, and the Score field would follow (the check asserts both cases).
- `js/modules/print-sheet.js` `buildLesson`: a DETAILED lesson's request (`n.lessonData`) sets `lessonInput.chartBare`, and
  its chart keeps the bare header. The detailed lessons are paused, and their pages are byte-identical (the baseline shows no
  detailed-lesson change).
- The fit is unchanged. The header row is 11 mm with or without its fields (`layoutHeader` does not read name or date), so
  the chart's sizing and zoom are the same. Nothing shrinks.
- The key: the facsimile draws the same header, and AK-3's `markKeyName` writes "Answer Key" on the Name rule, as on every
  key page. The field boxes, the rule and the type are at the pupil page's places.

## The check: CHART-HEAD (`tests/scripts/ws-lesson-samples.cjs --check`)

It runs on every anchor chart page, pupil and key, at sizes M and L:

- The header is `frame.js pageHeader`'s markup (title masked), computed live from the tree's own `pageHeader` and
  `markKeyName`.
- The header's type (field and title font), row (height and its own overflow) and rule are those of an ordinary
  `page()` of the same size.
- There is no Score unless the chart has a graded slot. With a graded slot, Score must be there.
- On the key, every header field and the rule sit at the pupil page's places (± 0.5 mm), in the same type.
- Nothing overflows: page, body, cell, or ink outside the sheet.
- The chart fits its page: one pupil page and one key page, the page inside A4, the footer inside it, and
  `chartSizing.ok`.

`--rules CHART-HEAD` alone builds only the chart part (about 5 min for every lesson at M and L).

- On precritic's `--role lesson` path as `lesson-samples-chart`
  (`--check --seeds 1 --all-lessons --rules CHART-HEAD --sizes M,L`). The default `lesson-samples-check` gate runs it on
  the 3 samples and 4 spot lessons as well.
- Master 22752843c: FAIL (no Name / Date field, the header is not `pageHeader`'s markup, the field type is empty).
- This branch: `CHART-HEAD PASS` over 30 lessons × M, L (`ws-lesson-samples --check: OK`).

## Backtest

The row is `chart-name-line` in `tests/fixtures/precritic/backtests.json` (commit-pair: fail = 22752843c, pass =
cb5e5bd94). The command is `ws-lesson-samples --check --seeds 1 --only add,round,div --rules CHART-HEAD --sizes M,L`.

`ws-backtest --row chart-name-line` gives FAIL on 22752843c and OK on cb5e5bd94, so the row PASSES.
`ws-precritic-plan` is OK: the row is on the `--role lesson` path, and its ledger row in CHECKS_FROM_CRITICS.md passes.

## Gates

- `node --input-type=module --check`: OK on `chart.js` and `print-sheet.js`. `node --check` is OK on the two test scripts.
- `ws-boot-smoke`: OK.
- CHART-HEAD over all 30 lessons at M and L: PASS. It also passes inside `lesson-samples-check`.
- `ws-lesson-baseline`: the `--check` before the re-pin found 512 of 1772 hashes differing, all of them chart pages (listed
  below). The baseline is re-pinned in cb5e5bd94.
- `ws-precritic --role lesson --strict`: 17 PASS and 9 FAIL. All 9 FAILs are reds that master already has:
  - `lesson-unit`: D13 and D18, the same 3 failures on master.
  - `empty-band-role-lesson`: master gives the identical 138 failures (re-run with MQ_ROOT = 22752843c).
  - `print-lint-role-lesson` and `-M`:
    - The only page-1 (chart) finding is L-OVERLAP SECTION on add_fractions_like and perimeter_intro. Master has it
      byte-for-byte (same mm).
    - Every other finding is on the sheet and practice pages. The lesson baseline shows those pages unchanged.
  - `raster-fit-role-lesson` and `cell-checks-role-lesson`: the f_to_d and prime_composite key pages 2-5.
  - `lesson-samples-check`: PC-H13 on round L sheet pages 2 and 3.
  - `lesson-samples-all`: PM-CONT on the vocab_grade_pictures Practice and Mixed pages.
  - `lesson-samples-key-L`: CL40-INK on nearest_10 pages 3 and 7.

## Changed pages (ws-lesson-baseline, re-pinned in the fix commit)

512 of 1772 hashes changed. These are 128 pages, each counted with its whole-document hash: `pupil-p1` and `key-p1`, the
anchor chart, for 32 lessons × M, L × seeds 4242, 1. A probe confirmed that page 1 is the `lesson-chart` sheet in every
lesson, pupil and key.

The 32 lessons:

- the samples add, sub, round;
- addition: add_facts, add_wp_10, add_wp_10_plain, add_wp_20, add_wp_20_plain, fact_family_sort;
- composing: number_word_form;
- division: div_facts;
- number_sense: nearest_10;
- placevalue: combine, compare, expand, identify, unit_form, value;
- subtraction: sub_100_no_regroup, sub_100_regroup, sub_100k_no_regroup, sub_10k_no_regroup, sub_1k_no_regroup,
  sub_1m_no_regroup, sub_2d_1d, sub_50_no_regroup, sub_wp_10, sub_wp_10_plain, sub_wp_20, sub_wp_20_plain;
- vocabulary: vocab_grade_pictures, vocab_pick3_words.

No other page changed. No detailed-lesson page changed.

## PNGs (seed 4242, 100 dpi, chart part, pupil and key at M and L)

`before/` (master 22752843c) and `after/` (this branch), each with these files:

- `add_facts-{M,L}-{pupil,key}.png` (addition, counting on)
- `sub_100_regroup-{M,L}-{pupil,key}.png` (subtraction, column)
- `nearest_10-{M,L}-{pupil,key}.png` (rounding, number line)
- `div_facts-{M,L}-{pupil,key}.png` (division, facts)

The chart prints at L at every size (`buildLesson`: a wall chart), so M and L are the same page.

Seen, and not in scope: the div_facts chart (2 × 2 panels) leaves the lower half of the body empty, before and after. This
is the chart's own sizing and has not changed here.
