# word-stories precritic: branch vs master (fix round 2, 2026-11-13)

Scope: the 4 hosts `addition:add_word_problems(_plain)`, `subtraction:sub_word_problems(_plain)` and the 3 presets
`addition:add_wp_change_unknown`, `subtraction:sub_wp_change_unknown`, `subtraction:sub_wp_compare_smaller`.

- Branch r1: `logs/pc.log`, per-gate logs `logs/pc-r1/` (cff9a5a1 = the branch merged with master 2184f2b5).
- Master: `logs/master-pc.log`, `logs/master-r1/` (2184f2b5, the 4 hosts; the signed word-stories card copied in so the
  card-planned gates run the same plan). Presets do not exist on master: every preset finding is new by definition and
  was judged against its host's master finding or an approved sibling (add_wp_20 / sub_wp_20).
- Empty band, finding by finding: `logs/eb-master.json` (252) vs `logs/eb-branch.json` (266, at 131177191).
- Final run: `logs/pc3.log` / `logs/pc3/` (see the end).

| gate | master (4 hosts) | branch r1 (7 skills) | new? | action |
|---|---|---|---|---|
| dealer-uniform | FAIL: add (PAGE 4 5−37 x2, PAGE 5 a=2 x3), sub (PAGE 6 10−7 x2), sub_plain (UNIFORM a tens, χ² 36.6) | FAIL: sub (PAGE 2 a=6 x3), sub_plain (same χ² 36.6); add clean; presets OK | pre-existing (no page cap in the story dealer; the appended kinds moved sub's page instance) | pinned as red on main with the proof (tests/fixtures/precritic/dealer-uniform.baseline.json) |
| node-lint LESSON-DATA | FAIL 4 (the hosts have no lesson) | FAIL 7 (+ the 3 presets) | hosts pre-existing; presets NEW | presets FIXED: lesson routines story-join-change-unknown / story-separate-change-unknown / story-compare-smaller + their `skill:` lessons (lessons/families/addsub.js); hosts pinned (node-lint-s1.baseline.json, --write-baseline) |
| options-verify | PASS (baseline): pictures=false pinned on the hosts | FAIL: static `band: default null is not one of its values` x4 hosts; pictures=false on the 3 presets | band static NEW but card-ruled; presets' pictures inherited | pinned with a note: adding a null value to band needs an owner re-sign (ws-spec-card refuses band=null as undecided); presets pin the hosts' own pictures=false defect (no picture row on these stories, master too) |
| print-lint lesson S / L | FAIL: host lessons ILLEGIBLE x4, OVERFLOW x2, OVERLAP x2, sub_plain H13 x4 (12 counts S, 11 L) | FAIL: same host counts + presets H13 / PAGEFILL / DN-2 (16 S, 15 L) | hosts pre-existing; presets NEW | presets FIXED by their lesson data (chart steps, words, rule; S and L lesson pages clean under ws-grade-render --gate); compare chart writes bar-big / bar-diff at their own step (lesson-arch/story.js) |
| grade-render --gate (lesson/test/indep) | FAIL 60 (48 host lesson overflow, 12 card-390 targets 40x44) | FAIL 60, same host findings | pre-existing | host lesson overflow reduced by columnPanel (below); card-390 targets left (master) |
| grade-render --gate other roles | FAIL 16/16/12/12 (reason-it mq-ww, pre-skill-check L ws-eq-hold) | 16/12/12/12 | pre-existing (plain improved) | none |
| cell-checks --card --card-opts | FAIL: every lesson page overflows (4), wpBar=true 18, reason-it 4 | FAIL: + forms 3 / 4 / 5 lesson pages 18-20 overflows | NEW values, pre-existing class (master wpBar=true: 18, the bar on a column chart) | FIXED at the root: `columnPanel` (lesson-arch/story.js + chart.js + word-work.js noWork / noBar / barInk): a one-step column story on a 2x2 chart draws per panel the zones its step uses; sub host forms [3] / [4,5] / default and add host lesson pages render with no overflow at S and L |
| empty-band | FAIL 252 | FAIL 266 | mixed | host lesson bands moved (add −4 / sub +4: the old overflowing panels became 30-35 % bands on panels 2-3 of the column chart); presets' guided S/L cell 2 = the approved siblings add_wp_20 / sub_wp_20 at the same %; preset reason-it L / error-analysis M = the hosts' master class (sub error-analysis M 36 %) |
| empty-band (fix r3, 14ef522b2 + host-only) | FAIL 252 | FAIL 235 on the 4 hosts at the old 9/15-role plan (master 252, was 247); 368 on all 7 with the signed card's 15 roles for the presets, of which the presets 133 = identical to fdcf409cf (no preset change) | fixed | the column-story chart rows sized to their own tallest panel (no stretch to the body): sub / sub_plain lesson p1 cells 2-3 (12 findings) gone, sub 62 -> 56 = master; add 60 / add_plain 63 unchanged (below master 68 / 72); grade-render lesson 0 overflow; logs/fix-eb |
| print-lint sections S / L | FAIL 1 (S PAGEFILL 126 mm; L SPREAD 36 %) | FAIL 1 (S PAGEFILL 126 mm; L PAGEFILL 125 mm) | pre-existing (page 1 of the 4-host sections sheet, same count) | none |
| options-render | FAIL 10 (which-numbers capacity / PAGEFILL, wpBar LS-4 dashed compare bar) | FAIL 17: the same host 10 + presets 7 | presets: which-numbers = host class; compare preset forms 1/2/3 capacity 9 vs 11 at S | open: the 4-line change stories hold fewer a page than the 3-line default; a capacity pin needs an owner ruling (options-render.pins.json) |
| phone-card | FAIL 24 FOCUS (hosts) | FAIL 24 FOCUS (hosts), presets ok | pre-existing | none |
| screen-support-eq | FAIL (no supports: nothing rendered) | same | pre-existing | none |
| sibling-compare | FAIL (no approved siblings, 60 unproven) | FAIL (113 unproven) | pre-existing (no sibling baseline) | none |
| card-rulings --check offered | FAIL on master (wpCues / wpBank offered) | INCOMPLETE: 8 ok on the hosts; presets carry no rulings block | not a FAIL | open: the presets' panel is the host's; a rulings entry for them is a card edit (re-sign) |

## Final (precritic r3 on cd802731, `logs/pc3.log`; then e4e5d3d3 the compare rule's no-break spaces)

18 FAIL / 19 PASS (4 on the baseline) / 1 N/A / 2 SKIPPED-INCOMPLETE, against 22 FAIL on master for the 4 hosts. Every
remaining FAIL is the master finding (or its class) on the hosts, or a preset page of the same class as its host or its
approved sibling:

| gate | r3 | master | verdict |
|---|---|---|---|
| print-lint lesson S | sub_word_problems_plain H13 x4 (Warm-up fact cells, 34 % side band) | the same 0 -> 4 | pre-existing; presets clean |
| print-lint lesson L | compare preset WRAP-OP x2 (the rule) | - | FIXED e4e5d3d3: re-run `logs/print-lint-lesson-L-r4.log` OK, 0 findings on all 7 |
| grade-render --gate | 12 TARGET (card-390 column boxes 40 x 44 px), 0 overflow | 48 overflow + 12 TARGET | lesson overflow FIXED (columnPanel); targets pre-existing |
| grade-render other roles | reason-it mq-ww / pre-skill-check L, the master counts | same | pre-existing |
| cell-checks --card-opts | add 16 (master 154), the rest likewise far under master | 150-390 | pre-existing reason-it / pre-skill-check overflow left |
| empty-band | 266 (204 BAND, 38 SIDE, 24 EDGE) | 252 | see the table above: host lesson bands traded for the overflow; preset guided = approved siblings |
| sections S / L, phone-card FOCUS, screen-support-eq, sibling-compare | as master | | pre-existing |
| options-render | hosts as master; presets: which-numbers (host class), compare preset forms 1/2/3 capacity 9 vs 11 at S | | open: needs an owner capacity ruling |

Lesson gates: `ws-lesson-baseline --all-lessons --check` against master's 1556 hashes: OK, every live packet identical.
g1-oa1-bar-model-wp-20 `--check` FAIL E9 / E35, identical on master (`logs/detailed-…-check-MASTER.log`); `--repeats` OK;
g3-oa8-two-step-wp `--check` and `--repeats` OK.
