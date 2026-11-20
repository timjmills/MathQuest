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

## Narrow critic on the 2 passed subtraction lessons (2026-11-20, lead option (a)): PASS
Independent critic (Opus medium), comparing 68565d00b with master eb2e26972, 64 lesson pages per tree. Classes and the engine style were stripped before hashing.
- **8 pages changed, all at L, all page 2** (pupil and key): sub_2d_1d and sub_50_no_regroup at seeds 4242 and 1. Nothing changed at M.
- **What moved:** the Warm-up row went from 47.45 to 43.1 mm, and the Guided Practice Steps box went from 61.05 to 65.40 mm. The Scripted Model page (p1) is identical to master.
  - **Correction to the wording above:** these pages move through the Guided Steps box and the Warm-up row height, not the "Scripted Model step band".
- **Grading:**
  - 4 steps on 4 lines, none merged (P-1 holds);
  - the Say band is intact;
  - no new empty band and no overflow;
  - the key is correct.
  - Scores: fidelity 9, teaching 9, key 10, space 8–9. Master scored 8 for space; nothing regressed.

### Re-pin on master 398bb4902 (merge 14691b209)

- Rewritten by the protocol on the merged tree: 2,714 hashes (master's pin: 2,590).
- **Against our previous pin (68565d00b):** only `vocabulary:vocab_pick3_words` moved, 16 keys (M/L x 4242/1: pupil-p1, key-p1,
  pupilHtml, keyHtml). These are exactly the 16 keys master re-pinned in b4341eef8 (z1 Guided hint). Nothing else moved.
- **Against master's pin at 398bb4902:** 2,226 keys differ. That is exactly the set our accounting above explained against
  eb2e26972: the 102 real pages in 8 lessons, the class-only pages (`mq-tofblank` / `mq-smstate` / `mq-pagecap` and the engine
  `<style>`) with their whole-HTML hashes, and the 124 keys of the 3 new pins (mult_properties 42, arrays_groups 42,
  count_by_tables 40). There are 0 unexplained keys, and no expected key went missing.
- **vocab_pick3_words:** our 16 keys cannot equal master's hashes, because this lesson's pages carry the engine `<style>`.
  Dumping the lesson on both trees (master worktree at 398bb4902, whose render matches its pin) gives 52 of 52 pages identical
  once the engine style and the marker classes are removed. Master's z1 change is fully present, and the rest is class-only.

### Re-pin on master 7a904fae6 (merges 249da1e05 = 0d3a72067 Pre-skill Check fill, de0eef858 = 7a904fae6 lesson first-page fix)

- **Pre-skill Check (lead ruling: lf-roles' deployed fill wins).** pre-skill-check.js is master's file whole. Our r4 F1 hunk,
  which was our only change there, is dropped. Neither the drop nor master's fill moved a lesson key: the pin written on 249da1e05
  is identical to 79ac4cd11's, and master's pin did not move from 398bb4902 to 0d3a72067. (A lesson's check is `perQuestion`.)
- **Written on de0eef858:** 2,738 hashes (master: 2,614).
  - Against our previous pin, only `algebra:two_step_letter_equation` moved: 88 keys, master's own re-pin.
  - Against master's pin, 2,226 keys differ. That is the same count as before, made of the same accounted set: 102 real pages,
    the class-only pages, and the 124 keys of the 3 new pins.
  - two_step_letter_equation's share of that set changed shape. 24 keys left the set because they now equal master's, and 24 new
    keys joined it because master's first-page fix re-paged the lesson.
  - Content check: we dumped the lesson on both trees, using a master worktree at 7a904fae6 whose render matches its pin. All 80
    of 80 pages are identical once the engine `<style>` is stripped. 48 are raw-identical. The other 32, plus 8 whole-HTML
    hashes, differ by the engine style only.
- **cbt Pre-skill check on master's fill** (`ws-empty-band --roles pre-skill-check --page-fill --sizes M,L --eblast-block`):
  EB-LASTPAGE and CAP-PARITY PASS on count_by_tables, combine, unit_form and vocab_grade_pictures.
  - count_by_tables L is 1 page with 10 items (M: 16). Its foot is 34 % empty (81.0 mm), which is the r3 F1 state.
  - It passes because the declared L ceiling is now 8 items (role-capacity.js, lead ruling 1c, 35465ad9c), and the page holds 10.
- **Consequence for the backtests:** the two cbt rows no longer prove their rule. Their fail side, 3038af154 (L 10 items,
  81 mm), is now also OK under the declared ceiling. `ws-backtest` returns FAIL on both: fail state OK, pass state OK. The pass
  side is re-pointed to 249da1e05, master's fill on this branch. The fail side needs a lead ruling: either a new failing state
  under ruling 1c (an L page below 8 items with a row free), or retiring both rows as superseded by ruling 1c.
