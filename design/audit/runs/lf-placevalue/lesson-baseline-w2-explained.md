# lesson-baseline w2: every difference explained (lf-placevalue auditor, 2026-11-13)

**Check explained:** `lesson-baseline-w2-check.txt` (117 of 1732 differ, `placevalue:compare` UNPINNED), on `claude/lf-placevalue-w2` at
c5f69847, which has master e76e0815f merged in. The pin `design/audit/baselines/lesson-baseline.json` was written at e76e0815f.

**How it was checked:** `ws-lesson-baseline` has no dump option. A scratch script took its exact `buildSheet` calls: role `lesson`,
practicePages 1, mixed, A4, sizes M/L, seeds 4242/1 for the lessons, and role `detailed-lesson`, year 2026 for the detailed
lessons. It split each build into `.ws-page`s, saved every page's outerHTML and took a PNG of every page from
`sheetDocument(...)` (1x, Andika loaded). It ran once on an origin/master worktree (served via `MQ_ROOT`) and once on this tree,
one browser job at a time through `mq-browser-run.sh`. The pages whose HTML differs between the two trees are **exactly** the
83 page hashes the check names as CHANGED. The other 34 CHANGED hashes are the whole-HTML hashes of the same builds. No page
is missing and no page is extra.

| Group (pages) | Cause (file:line, commit) | Verdict | Evidence |
|---|---|---|---|
| **round** M/L (12+12: M pupil/key p2-p3, L pupil/key p3-p4 + Html) | The CL-4d stretch mark: `ws-rowstretch` is added to a pv cell whose row stretches it ≥ 30 %. Sources: `sheet/roles/practice.js:1310-1324` (page plan; the `.trim()` also drops a double space in the class), `sheet/lesson-pages/we-do.js:284-286` (Guided band), `sheet/roles/guided.js:1111`; f0d0ac7d6, cd47e0a56. The CSS that acts on it (`css/sheet-kit.css:630-635`) matches only a cell with a `> [data-ws-stretchmid]` child, and only the compare line has that child. | **(b) HARMLESS** | With ` ws-rowstretch` removed and class whitespace collapsed, every page's HTML is byte-identical to master. No `data-ws-stretchmid` appears on any of these pages. The PNG of every changed page is **byte-identical** to master's. |
| **number_sense:nearest_10** M/L (12+12, same pages as round) | Same as round: the same lesson printed under its full key | **(b)** | As above: HTML identical apart from the class, PNG byte-identical |
| **placevalue:value** L (8: pupil/key p2 + Html) | Same: `ws-rowstretch` on 2 of the value Guided cells (we-do.js:284) | **(b)** | As above: HTML identical apart from the class, PNG byte-identical |
| **g2-nbt3-read-write-1000** (8: p04, p15, p26 ×2 seeds) | (1) The **new compare content**: the `gen-pv.js:900` `comparePair` deal (1240f552c) and the `gen-pv.js:951-997` seeded sign / "=" plan (54ec52ae2) re-deal every compare pair. The compare cell is redrawn: `sheet/cells/pv.js:810-863` sets the gap by column count (4 → 10 mm) and adds `data-ws-stretchmid` (d0c75387c, c2d255e95, cd47e0a5). (2) The lesson's own data: `lessons/detailed/g2-nbt3-read-write-1000.js:156-157` compare `minNum: 21` (8db554465, E24 fix). | **(a) INTENDED** | Number-sense compare pairs: 4242 "35 37" → "94 98", seed 1 "40 44" → "94 96". The T-page quote "Which is bigger: 51 or 54?" → "24 or 28?". Markup: only the compare cell (gap, stretchmid). Nothing else on the page changes. |
| **g4-nbt1-ten-times-value** (14: p04, p05, p11, p19 Prerequisite Check pupil/key/teacher; p12, p20 number sense; ×2 seeds) | (1) **Lead ruling PEDAGOGY 4.1a (identify's place heads off on unaided roles):** `sheet/providers/pv.js:113` `roleOpts` is applied at `print-sheet.js:235` (normaliseRequest). The pack's P0 is `buildSheet({role:'pre-skill-check'})` (`print-sheet.js:5716`), so identify's default 'labels' becomes 'none' (0d61403a0). (2) The compare re-deal, as for g2-nbt3. | **(a) INTENDED** | Prerequisite Check items 1-2: "H T O / 7 8 5" with heads (`pv-numeral` tracks table) → plain "785" with the digit underlined (`pv-plain`). Its grid rows re-share by ±1 mm (46.22 → 45.14 mm). The value items 3-4 keep their Th H T O heads. Number sense: "336 101" → "901 116" and so on. |
| **g3-oa8-two-step-wp** (9), **g3-oa9-mult-table-patterns** (8), **g3-oa9-input-output-rule** (8), **g3-oa5-mult-properties** (8): number-sense page, its key, its teacher-answer line (and oa8 seed 1 p04, the expected-answer list) | (1) The compare re-deal, as for g2-nbt3. (2) A knock-on effect of it at seed 4242: the pack's LR-6 near-twin guard (`print-sheet.js:5737`, `dealOne(..., nsAns, nsNear)`) re-deals the unit_form item. The new compare number 85 sits within 2 of the old unit_form 84, so the item becomes 72. | **(a) INTENDED** | Seed 1: A "80 22" → "29 44", B "529 575" → "376 374". Seed 4242: A "72 35" → "85 37", B "544 565" → "135 173", item 9 "84 = tens ones" → "72". The key / answer lines follow (e.g. "8 tens 4 ones" → "7 tens 2 ones", "&gt;" → "&lt;"). Markup: only the compare cell's gap and stretchmid (8 tag lines a page). |
| **g1-oa1-bar-model-wp-20** (6: p12, p19 ×2 seeds) | The compare re-deal, as for g2-nbt3. The pack's compare refs have no `minNum` (`lessons/detailed/g1-oa1-bar-model-wp-20.js:144-146`). | **(a) INTENDED** | Seed 1: "33 10" → "90 17", "76 77" → "94 96". Seed 4242: "69 23" → "83 53", "35 37" → "18 19". "18 / 19" is the pattern that was floored in g2-nbt3, so `ws-detailed-lesson --lesson g1-oa1-bar-model-wp-20 --seed 4242 --check` was run on this tree: **E24 PASS** (repeats 0, outside the pool 0) and **E24b PASS** (no twins or near twins). The run's two FAIL rows, E9 (P6 overflow) and E35 (T4 quote), are on pages whose HTML is byte-identical to master, so they come before w2. |
| **placevalue:compare** UNPINNED | The new compare lesson (`lessons/families/placevalue.js`, compare provider and cells) | **(a) INTENDED** | Passed by the critic in compare r4 (4c738162e). It joins the pin at the re-pin. |

Engine changes the brief named that changed **no** pinned page: spreadMax / keepCols / example-band spread (practice.js), the
guided.js CELL_PAD_MM / inkHMm rows / Model reserve, `stepTemplateOf` / `anchorStates`, `pickExample` noModel, scripted-model /
opener noModel, `falseNeedsWrong`, true-false.js, screen-cell.js and quiz-builder.js. Every other lesson, and every page of the
groups above that is not listed, hashes identical to the pin.

Two things a re-pin must not hide:
- The g1-oa1 "18 / 19" number-sense pair passes the pack's gates. A floor like g2-nbt3's `minNum: 21` would be a content choice
  for that lesson's owner, not a fix this re-pin needs.
- g1-oa1's E9 / E35 FAIL rows come before w2 and are untouched by it.

RE-PIN: SAFE
