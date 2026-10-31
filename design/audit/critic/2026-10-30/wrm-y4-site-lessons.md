# WRM Y4 (US Grade 3) site lessons: independent critic, 2026-10-30 (work order 1c)

Critic: independent (Opus 5.5, medium effort). Read-only: no source or data edited, nothing committed.
Tree: `claude/sweet-newton-c8wrv1` at `fbeaa332` (live code). Graded: `data/curriculum/links/Y4.json`, section `lessons`
(23 school-site lessons, Grade 3), against its own brief (the method of `design/audit/runs/wrm-tagging/Y4-lessons-critic-r4.md`:
every FULL lesson true to its title, CCSS and `full_audit.json` row; every partial / gap clause true for EVERY item kind and
complete; every pre / related why true and earlier / not harder; rule 5 searched) and `design/audit/RUBRIC.md` (8 or more
everywhere; one 7 fails).

## Verdict: FAIL (gate only). Lowest lesson score 8; mean 8.00 (184 / 23)

- **Content passes.** All 23 lessons now score 8. F6 (lesson 7, the r4 fail) and M1 (lesson 10 pre, the merge hazard) are fixed and
  hold on fresh items at HEAD.
- **The lane's own gate is red on HEAD.** `lessonfit.mjs` exits 1 with 3 class-M findings on lesson 8 (finding 1). These are false
  positives: the preset skills were added on 2026-10-17 / 10-23, after the lane passed its gates. The rubric is still clear: "a
  version that fails an automated gate is not sent to the critic: it is already a fail". The fix is one tool change, not a data
  change.
- **G9 is still open** (finding 2). That is the gate work critic r4 asked for: the claim classes that let F6 through four rounds.
  It does not lower a score today, but it is the check that would have caught F6, so it belongs in the fix round.

## What was checked (fresh seeds; none of r1-r4's)

| Check | How | Result |
|---|---|---|
| Data unchanged since the owner accepted it | `cmp` of `Y4.json` at deploy `8eecabd2` and at HEAD | identical |
| Generator drift since deploy | `lessonitems.mjs --n 60 --show 60` on a `git archive 8eecabd2` tree and on HEAD, then diffed (117 links x 60 items) | 4 lines differ. All are lesson 10's `reading_ruler`: the answer type `fraction-input` is gone (S9 fix `d62a9dde`, ruler cell keeps its own boxes). Every question, answer and number is the same |
| F6, lesson 7 `area {forms:[2]}` @100 | 300 items, seed 33301 | objects: garden bed 68, wall 65, room 62, patio 61, kitchen floor 44 (all five named by the clause, nothing else); ft 300 / 300; areas 6-90; 0 visuals ("no picture, never a drawn grid" holds). **Fixed** |
| M1, lesson 10 pre `identify {forms:[1], denoms:[2]}` | 300 items, seed 44401 | target denominators 2: 58, 4: 93, 8: 124, 3: 10, 5: 10, 6: 5. 25 / 300 (1 in 12) off the family, against "about 1 in 14". That is within "about" at this n. **Holds** |
| Lesson 10 partial `reading_ruler {parts:[1,2]}` | 200 items | halves 107, quarters 93; every item is a `ruler` cell. The clause holds. n9 (optional wording) is still open: every ruler is marked in quarters |
| Lesson 4 `multi_step_word` | 600 items | max 140, p90 99, 23 at 110 or more, 0 x or ÷ steps. "numbers to 150 (most below 110)" holds |
| Lesson 6 `add_wp_1k` / `sub_wp_1k {bar:true}` | 200 items each | answers to 994 / 908, word-work cells; "to 1,000" holds |
| lessonfit, HEAD | seeds `[[52361,43],[17123,89]]`, n 40 | **exit 1: 3 findings, all class M on lesson 8** (finding 1) |
| lessonfit, deploy tree `8eecabd2` | same tool, n 10 | the class-M findings are absent. So they come from the preset skills. Two other findings at n 10 are sampling misses (`groups of 6`, `thirds`): this is the known G2 / R11 sample sensitivity (finding 2) |

## Scores (lesson by lesson; r4's per-lesson reasons stand, since data and items are unchanged)

| # | Lesson | r4 | Now | Note |
|---|---|---|---|---|
| 1-6 | input-output, mult-table patterns, properties, two-step, partition, bar models | 8 | 8 | unchanged items |
| 7 | Area as multiplication | **7** | **8** | F6 fixed: the clause names all five story objects |
| 8 | Distributive and additive area | 8 | 8 | content true. Its gate is red (finding 1) |
| 9 | Mass and liquid volume | 8 | 8 | |
| 10 | Measure to the half and quarter inch | 8 | 8 | M1 fixed. n9 nit |
| 11-23 | line plot … sharing and grouping | 8 | 8 | unchanged items |

As in r4, the scores are on the brief's four teacher-facing criteria rolled into one lesson grade. Every lesson is ≥ 8 on each.

## Findings

**1. MAJOR (gate red, blocks PASS) · lesson 8 · `tests/scripts/wrm-tagging/Y4/lessonfit.mjs` `missedOptions()` (around line 667)**
- **What.** On HEAD, lessonfit reports three findings on lesson 8: `M: a clause says "never / no …" what
  area_perimeter:area_missing_side option forms=2 "A story (tiling a floor)" deals`. The same finding appears for
  `perimeter_missing_side` and `volume_missing_edge`.
- **Why it is wrong.** These three ids are **preset skills** (`js/modules/skill-presets.js`: `area_missing_side` = `area {forms:[1]}`). A
  preset inherits its host's whole option list, so it "offers" the host's story form. The lesson's note already names the hosts
  (`area_perimeter:area forms 2 tells a story of ONE rectangle`, perimeter, volume) and says why they are not the clause. The data is
  true. The gate's pool simply grew with the presets.
- **Fix.** In `missedOptions()`, map a preset key to its host before the `isNamed` test. Read `PRESETS` from
  `js/modules/skill-presets.js` (or `presetOf` in `data.js` SKILLS). A preset whose host is named, or whose host is in `mine`,
  is skipped. Do the same in the Y1, Y5 and Y6 copies of lessonfit, which share the class-M code. Then lessonfit on HEAD must
  exit 0 at the default seeds and at `[[52361,43],[17123,89]]`.
- **Would have caught it.** No automatic check ran: the preset lanes (2026-10-17, 10-23) did not run the tagging lanes'
  lessonfit gates. **Proposed check:** add `tests/scripts/wrm-tagging/*/lessonfit.mjs` (all years, `--n 10`, plus a fixed
  class-M-only mode that needs no sampling) to `ws-precritic` whenever `skill-presets.js`, `skill-options.js` or `data.js`
  SKILLS changes, and to `ws-deploy-gates.sh`. Class: GATE-DRIFT.

**2. MAJOR (gate work, carried from r4 G9; no score change today) · lessonfit claim classes**
- **What.** The lane did not build G9. These claim classes are still read by no check:
  1. a story's object list ("a floor, patio or wall"; this let F6 through four rounds);
  2. lists and ranges of scale tops, counts and amounts ("scales to 100, 200 or 500 mL", "three to five fractions", "8 to 10
     counters", "to 25 cents", "a 12-inch ruler"), read both ways;
  3. interval and direction lists ("1 or 2 hours", "later" when earlier is dealt, "in whole hours");
  4. positive fraction families ("halves, quarters or eighths" against the targets; the M1 class);
  5. half-unit claims on composite shapes.
  The G2 bounds are also still read on the `--seeds` sample, not on the fixed G6 probe. That is why this run at n 10 flagged
  `groups of 6` and `thirds` on lessons 23 / 10, and why r4's "areas 6 to 48" mutation passed at n 40.
- **Fix.** Build G9 as r4 §6 specifies. Each class gets a mutation in `lessonmut.py` that fails before the fix and passes on
  the committed data. Read the bounds and lists on the fixed 200-item probe (`OWN_SEEDS x OWN_PER`).
- **Would have caught it.** This IS the missing check. The r4 critic's `mymut4.py` R3-R18 mutations are its test cases;
  `ws-backtest.mjs` should carry F6 (lesson 7 object list narrowed to "floor, patio or wall") as a must-fail fixture.

**3. MINOR (nit, optional) · lesson 10 partial clause (n9 from r4)**
- **What.** "a 6-inch ruler marked in halves or quarters". Every ruler is drawn to quarter inches (200 / 200 `ruler` cells,
  `res: 4`). The halves are answers on a quarter-marked ruler, not a different ruler.
- **Fix.** "a 6-inch ruler marked in quarter inches; the arrow at a half or a quarter inch (3 1/4, 4 1/2)".
- **Would have caught it.** Class (2) of finding 2, a "marked in" list read against the payload's `res`.

**4. NOTE (no score) · lesson 10 pre M1 ratio**
- The why says "about 1 in 14 in thirds, fifths or sixths". This run measured 1 in 12 (25 / 300). That is within "about", but it drifts
  with the seed.
- **Fix (optional).** Write "about 1 in 12 to 1 in 14", or pick opts that keep the target in the halves family.
- **Check.** Class (4) of finding 2.

## Fix list for the builder (one round; Opus low is enough: a tool change, no data)

1. Finding 1: in lessonfit (Y4, plus the Y1, Y5 and Y6 copies), resolve presets to their host in class M. Re-run lessonfit at the
   default seeds and at `[[52361,43],[17123,89]]`: exit 0.
2. Finding 2: G9 classes 1-5, plus bounds on the fixed probe. Mutations: F6 fails before the fix and passes after; r4 R3-R18 are
   caught.
3. Optional: the n9 ruler wording and the M1 ratio wording. Both are one-string data edits; then re-run `lessons_build.py` so the file stays
   reproducible.
4. Add the lessonfit gates to the precritic / deploy paths (finding 1's check).

Then a focused re-check (the near-miss rule does not apply: nothing is at 7). It re-runs lessonfit on HEAD and the G9 mutations.
The 23 lesson grades carry over while `Y4.json` and the item diff are unchanged.

## Evidence

Scratchpad: `/tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/crit1030-y4/`:
- `lessonfit-fresh.txt`: HEAD lessonfit;
- `items-dep.md` / `items-head.md`: the drift diff;
- `tools/probe.mjs`: the F6 / M1 / ruler / lesson 4 / lesson 6 tallies.
