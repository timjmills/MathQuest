# Custom number line at the top of the page (MASTER_PLAN 5.2): critic, Round 5

Critic: independent. Tree `5b9928ef` (round-5 fixes for R4-D1..D4; main merged at `968f818f`). Date 2026-10-09.
This file is my only change. Probes, output and screenshots are in the session scratchpad (`nl-r5c/`):
`sweep` (every offered skill at S, M and L, line on vs off, seeds 11, 42 and 2026: 1,179 builds), `ticks`
(page numbers against the drawn ticks, seeds 7, 42 and 99), `screen` (card, online worksheet and quiz at
1366x650, 1280x600 and 390x700, through the queue / link path and through the direct path), `link` (a real
pupil Direct link `?c=AY~_0R1`), `render` (22 printed pages), and two mutant trees for the gate.

Rulings applied: the 5 owner-accepted builds (round_sort_10/100/1000 @L, add_wp_10 @L, equiv_frac_nv @L) stay
accepted. Lead ruling: mixed_addition / mixed_subtraction with Start / End set losing a row at M / L, and
sub_wp_10(_plain) @M (6 → 4, 7 mm), are content-bound and not blocking. Stretch, Reason It, True or False? and
Error analysis are not graded. A phone-only cosmetic issue is not blocking.

## Verdict: FAIL

The paper side passes cleanly. R4-D1..D4 are fixed on fresh builds at every seed I tried. But the pupil never
sees the line on screen. A shared Direct link, the skill queue and the teacher screen's Start all play through
`playSelectedSkills`, which sets `all_mixed` / `custom_mixed`. In that mode the item carries no `categoryId`,
so the card and the online worksheet find no options and draw no line, even for add_facts (R5-D1). It was the
same in round 4 (`1de8eaa`). Every earlier screen check, the lane gate's "real flow" included, sets
`state.category` directly, so none of them ever played the way a pupil does.

| Criterion | Score | Why |
|---|---|---|
| C1 Ease of use | 7 | On the direct path at 1366x650 and 1280x600 the band, the problem, the answer box and Check are all on screen after active-box, on every probe but two kinds. add_decimal is a known active-box fault that is out of scope: the box ends at 570 and the band scrolls above. On the mixed pools with ends set, the problem is 605 px tall and the band scrolls 9–226 px above while the box and Check stay in view, which is acceptable. No horizontal scroll at any width, 0 page errors, and the basic 390 check passes (Check sits under the fold there, which is the phone pass). It still scores 7, because a pupil who opens the teacher's link gets no line at all (R5-D1). |
| C2 Educational value | 7 | Auto lines are right for each skill's items. Ranges are the same as round 4 on new seeds. number_patterns_rule count on / back from the ones runs 0..80 with 42/42 on a tick, and a tens start, ones + tens, doubling and the default draw none. Mixed pools draw nothing without both ends, and with them the teacher's one line on all 20 card questions and on the worksheet. The fault is R5-D1: the teacher ticks the line and the pupil's card and worksheet never show it. The paper and the screen disagree on the path that matters. |
| C3 Spacing and layout | 8 | 1,179 builds over 3 seeds: **no page added** (pupil or key), no overflow, the band on every pupil and key page. The foot strip grows by ≤ 5 mm wherever the count holds. Where a row is lost it stays within band + 5 mm, except the accepted builds and mixed_subtraction @M seed 11 (6 → 4, 39.5 mm), which is lead-accepted as content-bound. abs_value @S prints 1 page with 14 items and a 1 mm foot. sub_100_regroup @L 9 cells, 1 mm. add_sub_10s, missing_add_sub and opposite_numbers strips are gone. |
| C4 Standard fidelity | 8 | Black and white, Andika, live width. The key is a facsimile with the same band. Lowest-terms fraction labels. Lint at baseline. `git merge-tree --write-tree HEAD claude/sweet-newton-c8wrv1` (main now `686b9073`) exits 0, a clean merge. |

## Round-4 defects: re-check on fresh builds

| r4 | Status | Evidence (nl-r5c) |
|---|---|---|
| R4-D1 band adds a page (abs_value @S) | **fixed** | abs_value @S on: 1 + 1 pages, 8 grid + 6 full-width items, 1 mm foot (pg-abs_value-S-on.png). Sweep: pages added 0 of 1,179 at seeds 11/42/2026. Gate sweep (seed 77): 0 of 393. |
| R4-D2 band-only blank strips | **fixed** | add_sub_10s @M, missing_add_sub @M/@L, add/sub_10/20_no_regroup @L and opposite_numbers @L are absent from the flagged list at all three seeds. The only strip over the limit is mixed_subtraction @M s11, which the lead accepted. |
| R4-D3 mixed pools on screen without ends | **fixed on the direct path** | No ends: card "none" x20 and worksheet none, at 1366 and 1280. Ends 0..1000 / 0..100: card one line x20, worksheet the same line. On the queue / link path no line is drawn at all (R5-D1). |
| R4-D4 number_patterns_rule tens start | **fixed** | Default places, add+sub, ones+tens and add from tens: no line on paper, card or worksheet. Places [1]: 0..80 by 10, 42/42 on a tick. |

## Gate: does support-numberline enforce its limits? (mutation, scratch copies)

| Mutant | Gate result |
|---|---|
| M1 `layout.js` `keep()` → `L1` (the band's slack / fill-height rule reverted, so the band costs more) + M3 `poolHost()` → `null` | **FAIL**, as it should: "R4-D2 … sub_wp_10@M 0→23 mm, sub_wp_10_plain@M 0→23 mm, mixed_subtraction@L 33→43 mm" and all four "R4-D3 mixed_*" checks. |
| M2 `print-sheet.js` last-resort page trim disabled (alone) | **OK (survives)**. With the floored row height, no seed-77 build needs the trim, so the gate never runs it. My 3-seed sweep found no added page either way, so this is a minor gate hole, not a product fault. |
| Gate "real-flow worksheet" | It sets `state.category = 'addition'` directly and never plays through `playSelectedSkills`, the path every pupil uses. That is why R5-D1 passes the gate. |

## Gates (browser runs one at a time through /tmp/mq-browser-run.sh)

| Check | Result |
|---|---|
| `support-numberline` | OK: 393 builds (S, M, L), band on every page, pages added 0, blank strips 0, 18 lose capacity (recorded) |
| `ws-print-lint --source kit` | 463 findings in 33 of 191 documents: **at the baseline** (exit 1 as at baseline) |
| `ws-share-options` | OK |
| `ws-code-snapshot.mjs` | OK (608 codes / 35 categories, nothing moved, 2525 option round trips) |
| `ws-codec-registry.mjs` | OK (601 skills, 9731 codes) |
| `ws-screen-answer` | OK |
| `ws-chromebook-fit` | OK |
| `ws-boot-smoke` | OK |
| syntax | refline-screen.js, sheet/layout.js, print-sheet.js, sheet/roles/practice.js: ok |
| merge into `claude/sweet-newton-c8wrv1` (686b9073) | `git merge-tree` exit 0, no conflict |

## Seen in passing (not graded)

- `buildSheet` with number_patterns_rule `places: ['1']` (strings) passes `numberLineBlocked` but deals as if
  the places option were unset, and draws 0..10,000 by 100. The panel and share codes give numbers (`[1]`, which
  is right: 0..80), so a teacher cannot reach this. A string-tolerant check would be safer.
- 390 card: Check sits under the fold after active-box, with the line on or off. This belongs to the phone pass
  (deferred).

## Defects (RUBRIC §6)

```json
{
  "feature": "support-numberline",
  "round": 5,
  "pass": false,
  "scores": { "C1": 7, "C2": 7, "C3": 8, "C4": 8 },
  "caps": [],
  "defects": [
    { "id": "R5-D1", "criterion": "C2", "severity": "major",
      "where": "question-render.js (renderQuestion → syncPracticeRefLine key `q.categoryId + ':' + skill`), refline-screen.js syncPracticeRefLine / syncWorksheetRefLine (`cat = q.categoryId || categoryId`), generate-question.js custom_mixed branch (sets q.poolMember = targetCategory but never q.categoryId)",
      "what": "In every pupil play path (a Direct link ?c=AY~_0R1 + startFromLanding, the skill queue + playSelectedSkills, the teacher screen's Start), state is all_mixed / custom_mixed and the item has no categoryId. So the card resolves 'all_mixed:add_facts' / 'undefined:add_facts', finds no options, and draws no line. The online worksheet does the same. Measured: add_facts, seq_2 and mixed_addition (ends 0..1000), each with nlOn in the link and in skillOptionsBySkill: band 'none' on the card. Queue path card + worksheet: none for add_facts and both pools. The same in round 4 (1de8eaa). It shows only when state.category is set directly (the old dropdown path and every test so far).",
      "fix": "Give a mixed item its category (q.categoryId = targetCategory in the custom_mixed branch, or read q.poolMember in the refline / render paths), and look its options up under that key in the set's store. A pool played from the queue (mixed_addition alone) then follows the R4-D3 rule through its own id: no line without ends, one line with them.",
      "check": "Open ?c=<add_facts code>~_0R1 → startFromLanding: #mqRefLine shows 'number line 0 to 20' on every card question. UnifiedSkills.add({addition, add_facts, opts:{nlOn:true}}) + playSelectedSkills('worksheet'): #mqWsRefLine is drawn. Repeat with mixed_addition: none without ends, 0..1000 on all 20 with them. Add this path to support-numberline's real-flow check." },
    { "id": "R5-D2", "criterion": "C3", "severity": "minor",
      "where": "tests/scripts/support-numberline.cjs",
      "what": "The page-count rule's last resort (print-sheet.js: give up problems until the sheet is the pages asked for) is never run by the gate at seed 77, so disabling it passes (mutant M2). The 'real-flow' worksheet check bypasses playSelectedSkills (see R5-D1).",
      "fix": "Add a fixture that needs the trim (a page-driven split section built so the band pushes the full-width part over), or sweep a second seed for the page count. Route the real-flow check through the queue / link path.",
      "check": "Mutant M2 makes support-numberline FAIL; a mutant that drops q.categoryId routing makes it FAIL." }
  ],
  "to_raise_to_10": {
    "C1": "R5-D1; active-box for tall decimal boxes (outside this lane).",
    "C2": "R5-D1.",
    "C3": "Give back the content-bound strips if a per-skill cell review allows it; R5-D2.",
    "C4": "Keep RP-55 / PT-FRM-11 in step once R5-D1 is fixed."
  },
  "summary": "Paper passes on fresh builds at three seeds (1,179 builds). The band never adds a page, never overflows, and is on every pupil and key page. The foot strip grows by no more than 5 mm (band + 5 when a row goes) outside the accepted builds. R4-D3 and R4-D4 hold on the direct screen path. It fails because the pupil never sees the line on screen: a Direct link, the queue and the teacher screen's Start all play in custom_mixed mode, where items carry no categoryId, so the card and the online worksheet draw nothing. The gate enforces the blank strip and the pool rules (mutants fail it), but it misses the page-trim last resort and the real pupil path."
}
```

## Owner / lead questions

1. **Is the on-screen line meant for pupils who arrive by a shared link or a queued set?** Suggested: yes. That
   is how pupils play, so R5-D1 blocks the lane. Otherwise the screen half helps only the teacher's own
   dropdown play.
