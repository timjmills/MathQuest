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

## PNGs (`png/`, page 1, pupil and key, M and L, before = 0983c6791, after = this branch)

Empty-first, 5 blocks: `Y4.B4.S11`, `Y4.B5.S1`, `Y4.B6.S3`, `Y3.B12.S4`, `Y4.B12.S2`.
Y4.B4 tables: `Y4.B4.S2` … `Y4.B4.S6` (S6 is the 3/6/9 chart lesson, unchanged).
Name pattern: `<id>-<before|after>-<M|L>-<pupil|key>-p1.png` (80 files).

## Gates (merged tree)

- `node --input-type=module --check`: every changed JS file OK.
- ws-boot-smoke OK · ws-roles-unit OK (113) · ws-precritic-plan OK (398 rows on path; checks-from-critics 348 pass, 90 exempt, 0 fail).
- ws-layout-unit: **crashes on master 65c28ccdf and on the base 0983c6791 the same way** (`ws-layout-unit.mjs:918 reading 'inkMm'`,
  the fact-rows mixed-facts block). It is not this lane's code, so the known Guided fail is not reached.
- ws-precritic --role lesson --strict: see the lane status `design/status/lf-engine-lessonfirst.md`.
