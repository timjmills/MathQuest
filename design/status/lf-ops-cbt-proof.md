# lf-ops: count_by_tables r4 hash proof (2026-11-19)

This round proves what the r4 shared-code fixes did to the pages of skills that have already passed. The r4 fixes touched four
shared files:
- `sheet/roles/pre-skill-check.js`: a one-page plain check fills its page.
- `print-sheet.js`: a role is retitled from the count rows it placed.
- `scripted-model.js`: it tries a one-line step band before merging steps.
- `true-false.js`: it uses the `true-false-list` string.

**Trees compared.** The branch is `-lf-ops-props` with origin/master d38308824 merged in (7c7c41bfe). It was compared with
origin/master d38308824 in a detached worktree under /tmp, which has since been removed.

**What was rendered.** Every id in `js/modules/redesign-passed.js` (32 skills) was rendered through `buildSheet` with
`key: true`. The combinations were:
- roles: pre-skill-check, scripted-model, true-false, opener, independent;
- sizes: M and L;
- seeds: 4242 and 1001.

That gives 640 pupil pages and 640 keys on each tree.

**How pages were compared.**
1. The embedded engine `<style>` is stripped from both trees before comparing. The branch adds three CSS rules (`mq-tagout`,
   `mq-ctailgrid.mq-cheadgrid`). None of the 1,280 branch pages carries those classes. No linked sheet stylesheet differs
   between the trees: only `css/screen-cell.css` changed, and it is a screen file.
2. This leaves 248 page sets whose markup changed. Each was screenshotted on both trees at DSF 1 and compared pixel by pixel.

**What changed.**
- 228 sets differ only by a lint marker class, and their pixels are identical. The classes are `mq-tofblank` on True or
  False? TRUE frames (L-KEY AK-2) and `mq-smstate` on Scripted Model state cells. Neither class has any CSS, so these pages
  are not visual changes. They are not class (c): no passed Scripted Model page changed its step band.
- 20 sets (pupil page and key, 2 seeds each) change visibly. All of them are class (a) or (d).

## Changed pages

| Skill | Role | Size | Class | Change (seeds 4242 and 1001 identical in kind) |
|---|---|---|---|---|
| placevalue:combine | pre-skill-check | M | (a) | 12 → 14 items, still 1 page; last-page empty 27 % → 11 % |
| placevalue:combine | pre-skill-check | L | (a) | 10 → 11 items; 14 % → 4 % |
| placevalue:unit_form | pre-skill-check | M | (a) | 12 → 15 items; 31 % (EB-LASTPAGE FAIL) → 11 % |
| placevalue:unit_form | pre-skill-check | L | (a) | 10 → 11 items; 13 % → 4 % |
| vocabulary:vocab_grade_pictures | pre-skill-check | M | (a) | 3 → 4 items; 41 % (FAIL) → 17 % |
| vocabulary:vocab_grade_pictures | pre-skill-check | L | (a) | 3 → 4 items; 37 % (FAIL) → 13 % |
| composing:chart_to_120 | true-false | M, L | (d) | instruction `true-false` "Finish the sentence." → `true-false-list` "If False, write the right numbers." (pupil and key; the only diff line) |
| placevalue:unit_form | true-false | M, L | (d) | same instruction change |

- **(b) count-row retitle:** none on a passed skill.
- **(c) Scripted Model step band:** none on a passed skill. The marker class appears, but the pixels are identical.
- **(e) anything else:** none.

The Pre-skill Check diffs only add cells and renumber the tabs, the score and the grid rows. The True or False? diffs are only
the one instruction line.

**For the narrow critic.** Every changed Pre-skill Check and True or False? page above goes to it.

**PNGs.** Pupil pages, branch and master, are in
`/tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/cbt-proof/`, named
`<cat>_<skill>_<role>_<size>_<seed>.{branch,master}.png`. There are 40 files.

## ws-empty-band `--roles pre-skill-check --page-fill` (EB-LASTPAGE / CAP-PARITY)

The run used `--sizes M,L --hosts none --no-baseline` on add_facts plus the three changed skills. The same branch tool was also
run against the master tree through MQ_ROOT, to give the "before" figures above.

- **Branch:** CAP-PARITY passes. EB-LASTPAGE fails 2 checks (5 on master), and both are add_facts.
- **combine, unit_form and vocab_grade_pictures** now fill their pages. Master had 3 EB-LASTPAGE fails among them; the branch
  has none.

## add_facts Prerequisite Check: still open

On the branch it is still 4 items on one page, at M and at L, with 78 % of the body empty (187.4 / 185.4 mm). Its next
42.6 mm row would fit. The page is byte-identical to master's.

**Why the fill does not reach it.** The page has one question band of 4 `fact` cells. The r4 fill gives the band another row
only while that question's dealt pool holds more items (`keep < q0.length`). add_facts deals exactly 4, so there is nothing to
add. The cause is upstream, in how many items are dealt, not in where they are placed. It stays on the lf-ops queue (item 3,
"add_facts Prerequisite Check fill").

## Merge (step 1)

origin/master d38308824 was merged in as 7c7c41bfe. Seven files conflicted, and both sides were kept in each:
- `count-row.js`: the branch's size-keyed `insetOf` was kept. The train `fitN` is the same on both sides.
- `ws-node-lint.mjs`: EXTRA_RULES now holds both sides' rules (plus STEPS-FOLLOW-PRESET).
- `backtests.json` and `opt-in-rules.json`: the rows were united by id or lane, with no clashes (643 rows, 4 lanes).
- Three .md ledgers: both sides were kept.

Checks after the merge:
- `node --input-type=module --check` on the touched JS: OK.
- ws-boot-smoke: OK.
- ws-code-snapshot: OK (741 codes, 35 categories).
- ws-precritic-plan: OK (446 rows on path; checks-from-critics 388 pass / 100 exempt / 0 fail).

## Lesson baseline re-pin: class-only proof (2026-11-20)

**Why the gate failed.** `ws-lesson-baseline` (deploy form, `--all-lessons --sizes M,L --seeds 4242,1 --per-lesson --unpinned`)
on the merged head: 2,102 of 2,590 hashes differ, and 3 lessons are UNPINNED. Master's pin is master's own render: the same
command on a master worktree (273a0f379, pin unchanged by 0e80c26e4) prints `OK (2590 hashes identical)`.

**Method.** A scratch copy of the gate (same builds, same keys) dumped every page's HTML on both trees: the branch (f34246ef5,
-props merged with the eblast advisory) and master (worktree, MQ_ROOT). 2,216 pages per tree, the same keys on both (the
other 374 of the 2,590 hashes are the whole pupilHtml / keyHtml / detailed html, which carry the same pages). Normalised in
steps, then compared:

| Step | Pages identical (of 2,216) |
|---|---|
| raw, after stripping `mq-tofblank` / `mq-smstate` from class lists | 488 |
| + the embedded engine `<style data-mq-sheet-engine>` emptied | 2,038 |
| + the class `mq-pagecap` stripped | 2,114 |
| real changes left | **102 pages, 8 lessons** |

- **The engine `<style>`** is on 1,702 of the pages and is why nearly every hash moved. The branch's copy adds 3 rules and removes
  none: `[data-ws-tagged]:has(>.mq-tagout)`, `.mq-slottag.mq-tagout`, `.ws-grid.mq-ctailgrid.mq-cheadgrid`. No lesson page carries
  `mq-tagout`; 120 carry `mq-ctailgrid` but none `mq-cheadgrid`, so no added rule matches any lesson page.
- **`mq-tofblank`, `mq-smstate`, `mq-pagecap`** have no CSS: not in `css/`, not in the engine style. `mq-pagecap`
  (practice.js, read by ws-print-lint ROW-STRETCH) is the third CSS-less lint marker, on 76 pages of 7 lessons
  (placevalue:compare, g1-oa1-bar-model-wp-20, g2-nbt3-read-write-1000, g3-oa8-two-step-wp, g3-oa9-input-output-rule,
  g3-oa9-mult-table-patterns, g4-nbt1-ten-times-value).
- **Pixel sample.** 10 class-only lessons (add_facts, sub_100_regroup, placevalue:value, placevalue:identify, div_facts,
  number_word_form, notice_patterns, sub_wp_10, nearest_10, function_table_easy), M, seed 4242, every pupil and key page,
  printed through `sheetDocument` at DSF 1 (794 x 1123, print media) on both trees: **80 of 80 page pairs pixel-identical**.

**Lessons that changed for real (102 pages; each is this lane's own work):**

| Lesson | Pages | Cause |
|---|---|---|
| detailed g3-oa5-mult-properties | 48 | the mult_properties provider / dealer (lf-ops-props): different dealt facts (e.g. 7 x 5 → 6 x 7), arrays "Look at / Turn the array", count-by "in the arrow" rows, 2-digit-wide answer boxes (1.215 → 1.822 em) |
| detailed g3-oa9-mult-table-patterns | 8 | count-row instruction "Count by the number in the box" → "... in the arrow" (cbt r1 M3 wording) |
| patterns:follow_given_rule | 12 | lesson Practice row shape (lf-ops-props r4b ROW-STRETCH ruling (b)): grids get a fixed height (e.g. 114 → 61.25 mm, a spread grid → fixed 122.5 mm) |
| patterns:number_patterns_rule | 16 | same Practice row shape (34.1 → 31 mm rows; 114 → 75 mm) |
| patterns:growing_shape_patterns | 4 | same (41.85 → 38.75 mm row) |
| patterns:pattern_features | 6 | same (41.85 → 38.75 mm row) |
| subtraction:sub_2d_1d | 4 | Scripted Model step band (r4: a one-line step band tried before merging steps) — `mq-lstepsbox` height |
| subtraction:sub_50_no_regroup | 4 | same Scripted Model step band |

No lesson page changed by the r4 Pre-skill Check fill or the True or False? `true-false-list` instruction: those roles are
not lesson parts. No other difference is left.

**New pins (UNPINNED on master's pin, now in `prereqs.js` LESSONS on this branch):** `multiplication:arrays_groups`,
`multiplication:count_by_tables`, `multiplication:mult_properties`.

**Re-pin.** By the protocol (`--all-lessons --sizes M,L --seeds 4242,1 --per-lesson --write
design/audit/baselines/lesson-baseline.json`), written first on 4bdbd2bff (+ master 0e80c26e4), then again on 311af78fa
(+ master eb2e26972) after master re-pinned 48 pages of its own (e591cf937). The two pins differ in exactly those 48 keys:
algebra:two_step_add_then_mult 16, algebra:two_step_letter_equation 16, patterns:follow_given_rule 16 - master's own move,
the same keys its pin moved since 0e80c26e4. 2,714 hashes, 55 lessons. Reason: lint marker classes `mq-tofblank` /
`mq-smstate` (and `mq-pagecap`), CSS-less, plus the 3 additive engine rules that match no lesson page; class-only proof above;
the 8 real lessons listed; the 3 new lessons pinned.
