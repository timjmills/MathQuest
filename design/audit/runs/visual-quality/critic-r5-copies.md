# Visual-quality lane: critic round 5 (same-layout copies, own renders, RC7)

Independent critic, Opus medium, did not build this work. Branch `claude/sweet-newton-c8wrv1-visual-quality` at `9ceba39`, 2026-10-31.
Scope: the 5 sentence-layout story skills the lane did not render: `addition:add_wp_10_plain`, `addition:add_wp_20`,
`subtraction:sub_wp_10`, `subtraction:sub_wp_10_plain`, `subtraction:sub_wp_20_plain`. Graded on their OWN renders
(RUBRIC RC7), with the same bar as r2 / r4 (critic-r2.md B, critic-r4.md).

**Verdict: PASS, all 5 skills.** Every page and host scores at least 8 on all four criteria. Lowest score 8
(C1/C2/C4 throughout, C3 8 on Reason-It at S and on the S test, as for the 4 passed skills).

## Renders (one browser run at a time)

- `node tests/scripts/ws-grade-render.cjs --skills addition:add_wp_10_plain,addition:add_wp_20,subtraction:sub_wp_10,subtraction:sub_wp_10_plain,subtraction:sub_wp_20_plain --roles independent,test,reason-it,lesson --size S --gate`
  and the same at `--size L`. Both printed `ws-grade-render: OK` (no overflow on any role page or key, no card target
  under 44 px). Screen hosts card-390 / 820 / 1280, worksheet-1280, quiz-1280 come from the same runs.
- Output: `/tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/c5/{S,L}/<cat>__<skill>/`.
- Machine checks over every `meta.json` (all 5 skills, S and L, every role): every item's answer equals the sum (add
  skills) or the difference (sub skills) of the story's two numbers; no answer above the skill's bound (10 or 20);
  0 duplicate stories on independent / test / reason-it; `check.problems` and `keyCheck.problems` empty everywhere;
  0 console errors; `hScroll` 0 and `smallTargets` empty on every screen host.

## Measurements (largest in-cell band, `check.measured.band.hPct`; H13 limit 30 %)

| Page | S | L | Items S / L |
|---|---|---|---|
| independent | 17.9 % (all 5) | 6.2 % (18.5 % add_wp_10_plain) | 11 / 8 |
| test | 25.5 % (all 5) | 6.2 % (18.5 % add_wp_10_plain) | 10 / 8 |
| reason-it | 13.0 % | 8.9 % | 2 / 2 (story once, A and B under it) |
| lesson p1 / p2 / p3 | 16.5 / 24.7–27.3 / 17.3–20.3 % | 16.5 / 12.9 / 14.7–24.8 % | 3 pages + 3 key pages |

S holds more than L on every practice page (11 > 8, 10 > 8).

## Keys verified by eye

- `sub_wp_10`: independent S (11/11), test L (8/8), reason-it L (9−8: B = 1 circled, A = 17; 10−3: A = 7, B = 13), lesson
  key p2 (vocabulary lines whole / part / number sentence correct; warm-up 1, 7, 3; guided 4−1 = 3) and p3 (8/8).
- `add_wp_20`: independent S (11/11), lesson p1 (15 + 1 = 16), reason-it L (A = 10 / B = 6; B = 7 / A = 5).
- `add_wp_10_plain`: independent S (11/11), lesson p1 (4 + 3 = 7), lesson p3 L (6/6), reason-it L (A = 5 / B = 1;
  B = 10 / A = 4).
- `sub_wp_10_plain`: independent L (8/8); reason-it S pupil (2 items, A/B differ).
- `sub_wp_20_plain`: independent S (11/11), reason-it L (A = 5 / B = 9; B = 3 / A = 35), lesson key p2 L (warm-up
  8, 15, 7; guided 9 − 6 = 3).
The right answer sits under A in one Reason-It item and under B in the other on every skill; every wrong answer is the
add-instead-of-subtract (or subtract-instead-of-add) error.

## Scores (C1 use · C2 teaching · C3 spacing · C4 standard)

Identical for the five skills (same template, same layout, bands within 2 points of each other):

| Page / host | S | L |
|---|---|---|
| independent, pupil + key | 8·8·8·8 | 8·8·9·8 |
| test, pupil + key | 8·8·8·8 | 8·8·9·8 |
| reason-it, pupil + key | 8·8·8·8 | 8·8·9·8 |
| lesson (3 pp + 3 keys) | 8·8·8·8 | 8·8·8·8 |
| card-390 / card-820 / card-1280 | 8·8·8·8 | |
| worksheet-1280 / quiz-1280 | 8·8·8·8 | |

- Lesson p1: the four frames (Read, Find the parts and the whole, Write the number sentence, Solve), the bar drawn,
  Say and Rule ("Part + part = whole." / "Whole − part = part.") correct for the operation; no keyword teaching.
- Story text 11 pt at S, 15 pt at L; plural unit printed beside the answer box on every page and host; one schema a page.
- Screen: story above the `[ ] ◯ [ ] = [ ]` sentence, twin-face first box, plural unit; nothing crosses the card edge.

## Findings (none caps a score)

- **C5-1 (advisory, naming / RC7):** `subtraction:sub_wp_10` draws no picture; its pages are the same as
  `sub_wp_10_plain` (only `add_wp_10` carries the K `wordpic` picture). The `_plain` twin ("No Pictures") therefore
  differs from its host by nothing, and a K subtraction story has no countable picture on the practice pages
  (WDS §18.1 allows this: the bar is the option). Pre-existing, not a visual defect of this lane. Owner decision:
  give sub_wp_10 the K picture, or accept the twins as equal. Check: a precritic assertion that a `_plain` skill and
  its host do not render byte-identical cells at the same seed unless the host is listed as picture-free.
- **C5-2 (nit, = r1 F19):** frame drift inside a row where one story wraps to 4 lines and its neighbour to 3
  (`L/addition__add_wp_10_plain/independent-p1.png` rows 1-4, `lesson-key-p3.png` row 1; up to about 25 px). Check:
  measure each row's `.mq-gl-sentence` top, equal within a row (VQ-7), the r1 proposal, still not built.
- **C5-3 (nit, = r2 N10):** the lesson warm-up deals vertical stacks (`20 − 12`, `9 − 2`) for K and Grade 1 story
  skills (`lesson-key-p2.png`). Check: the lesson warm-up for a K/1 story skill uses the horizontal sentence.
- **C5-4 (nit):** Reason-It wrong answers can lie outside the skill's band (`9 − 8 = 17` on "numbers to 10",
  `19 − 16 = 35` on "numbers to 20"). They are the real add/subtract error, so the item still teaches; noted only.
- **Nit (= r4):** at S the right column of Reason-It leaves a tall gap between "__ is correct." and "The answer is __."
  (under H13).

## Automatic checks this round would add

- C5-1: `_plain` ≠ host at the same seed (precritic, on the ws-backtest path).
- C5-2: row-aligned sentence frames (VQ-7), measured in `ws-grade-render --gate`.
- Speed: `ws-grade-render --size S,L` in one run, and printing `band.hPct` per role in the run summary, would have saved
  one run and the meta.json scan (about 4 minutes).
