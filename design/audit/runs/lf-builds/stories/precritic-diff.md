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

## Fix round 2 (2026-11-13, after critic r1 FAIL)

Correction to e41d271a6: its message called the g3-oa8 lesson-baseline difference a "possible flake". It was not a flake:
lf-engine traced it to this branch (the step-wise bar-big / bar-diff slots and `columnPanel` in lesson-arch/story.js, through
which g3-oa8's chart panels draw).

**g3-oa8 decision (lead ruling).** On the r2 head merged with master the pages no longer differ, so neither an intended-change
re-pin nor a gate is needed:
- `detailed/g3-oa8-two-step-wp` p06, p09 and the pack html at seeds 4242 and 1: byte-identical page bodies, master
  1db0e3309 vs branch 4ca9dfd47 (`ws-detailed-lesson --seed 4242 / 1`, every `.ws-page` compared; scratchpad g3m-* / g3b-*).
- `ws-lesson-baseline --all-lessons --check` against a fresh master baseline (114ee8e0b, `logs/r2/lesson-baseline-master.json`):
  1596 of 1596 hashes identical on the branch merged with master (`logs/r2/lesson-baseline-check.log`). The unmerged branch
  differed in 756 hashes, all master drift since the merge base; no g3-oa8 page among them (`logs/r2/lesson-baseline-check-unmerged.log`).
- No re-pin; nothing for critic r2's g3-oa8 scope.

**r2 gate logs:** `logs/r2/` (pc-final.log = precritic --strict on the 7 skills; its bulky pc/ output stays in the scratchpad).

## Fix round 3 (2026-11-13/14): branch vs master, gate by gate

Master: 1db0e3309 for the first comparison (`logs/r3/master-*.log`, `master-eb.json`), then origin/master 76bc11c61 (3c84e320 +
the owner's plan: no 390 px, sizes M and L only) after the merge ff819443c (`logs/r3/m2-*.log`, `master2-*.log`). Branch
precritic on the merged head: `logs/r3/pc-final2.log` (16 FAIL / 38 PASS / 1 N/A / 1 SKIPPED). Fixes after it are verified by
targeted runs (`chk2.log`, `branch-eb3`). Out of scope by the owner's plan: every 390 px finding (F3, card-390 TARGET,
phone-card, screen-slots @390) and every S-only finding.

| gate | master (4 hosts) | branch (7 skills) | new? | action |
|---|---|---|---|---|
| empty-band (--vocab-ink --page-fill) | 225 | 140 (pc2: FAIL) | hosts: every key at or under master except add / add_plain independent + test M 2 → 3, add_plain lesson M 0 → 1, scripted-model EB-PAGE (add L, sub M); presets: guided L 1, pre-skill-check M EB-SIDE 2 + EB-PAGE M/L, the rest S (out of scope) | r3 fixes: in-place rows, story Model across, Word problems bar, Stretch cell, lesson Guided centred, wording; OPEN: the rises listed (see Remaining) |
| fixit-words FIX-WORDS | OK | 42 (presets) | NEW | FIXED (fix box carries the label word); chk2 OK; row fixit-words-word-stories |
| cell-checks --card (all) | add pre-skill-check L OVERFLOW 4 (+ 1db0e3309: 142-178 OVERFLOW a host) | add pre-skill-check L 4 = master; sub_plain independent S body +2.6 mm (S, out of scope); compare lesson M forms 3/4/5 OVERFLOW 8 | compare lesson NEW (r3 row count) | FIXED (noCap grids keep their count), chk2 OK; row lesson-nocap-rows-word-stories |
| cell-checks PUPILTAG / EA-PAD | sub host EA M PUPILTAG 4 (1db0e3309) | 0 | add_plain PUPILTAG new in r2; EA-PAD preset new | FIXED (label lift 0.5 mm; unit word hangs right); rows pupiltag-column / ea-pad-unit |
| print-lint kit L / M / S | - | PASS | (r2: compare preset H13 at M / L NEW) | FIXED (in-place rows); rows inplace-rows-m / -l |
| print-lint lesson L | 15 counts above the pin (TOPSTART 12 a host, ILLEGIBLE, PG-12, OVERLAP) | 4 (TOPSTART 12 a host) | identical subset of master | pinned with this evidence (no re-pin: the ratchet file holds no host lesson keys) |
| print-lint lesson S | - | - | S out of scope | - |
| grade-render --gate (lesson/test/indep) | 60 (48 lesson overflow + 12 card-390) | 12 card-390 TARGET | 390 out of scope | the gate still renders 390 on master 76bc11c61 (not yet updated by lf-checks) |
| grade-render other roles | add pre-skill-check L ws-eq-hold OVERFLOW 4 | the same 4 | identical | master's class |
| print-lint sections L | 1 (SPREAD 36 % p1) | 4: PAGEFILL p1 (host) + p6 / p7 (presets) + PG-23 p8 | presets NEW | OPEN, root cause below (two attempts) |
| print-lint sections S | - | - | S out of scope | - |
| options-render | 10 (which-numbers capacity / PAGEFILL, wpBar LS-4) | the hosts' 10 + presets: which-numbers (host class), sub change preset forms 4 / 5 capacity 5 vs 6 at L, compare preset forms 1-3 at S | presets' forms capacity NEW | OPEN: capacity ruling (r2 note stands) |
| screen-slots --screen-digit | 24 @820 / 1280 + @390 | hosts the same 24 + presets 18 @820 / 1280 | presets: the host's class (story-prose numerals, same cell) | OPEN: tool scope (SCREEN-DIGIT reads numerals in the story prose) - owner / lf-checks |
| phone-card | FOCUS (hosts) | the same | 390 out of scope | - |
| sibling-compare | no approved siblings | 112 unproven | structural (no sibling baseline) | as master |
| coverage-matrix / slot-clip | - | PASS on pc2 | - | (the cut r3 run's FAILs were the restart, not findings) |

### Remaining, with root cause
- **sections L PAGEFILL p6 / p7 (presets).** A `--kind sections --pages 2` sheet lays each sub-section as `pages` one-row grids
  (perPage 2, "Tall problems: 1 row per page"), so two presets' single rows share a page. Attempt 1 (in-place rows held at
  1.12x) left the strip; attempt 2 (rows may stretch until the band reaches 26 %) does not reach these grids - they are not
  lone grids, so no spread applies. Root cause: the sections composer splits a 4-item sub-section across two pages a row each
  instead of laying its two rows together. Needs an engine change in roles/practice.js placeSections (lf-engine).
- **empty-band rises on the hosts at M** (independent / test 2 → 3) and the Model EB-PAGE: the in-place / across changes of r3;
  not yet fixed this round.
