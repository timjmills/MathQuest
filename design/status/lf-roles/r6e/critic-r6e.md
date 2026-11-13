# Critic r6e - lane lf-roles (independent, grade only)

Date 2026-11-13. Branch `claude/sweet-newton-c8wrv1-lf-roles` at HEAD `2899dc03`. Before = `df83248e` (what r6d graded),
after = HEAD. Graded against `design/audit/RUBRIC.md` (C1-C4, H-caps), `design/PAGE_TYPES.md` PT-RSN-1 and PT-RSN-4 (lead
ruling F8: "Circle A or B. The answer is __."). This round re-grades critic r6d's FAIL: D1 (sub_word_problems Reason It L
printed one item a page, H5), E1 (a number answer's line was sized from the right answer, so it ruled one out) and N1 (the
response row under the panels was left-aligned).

**Verdict: PASS.** No counted defect is introduced or left open. D1, E1 and N1 are closed. Every page set scores 8 or better
on every criterion, except where a pre-existing defect caps it. That defect (E2: dead parts in word-story panels, H15) is the
same before and after and is not counted, as in r6d. Every page set is better than before.

## 0. Evidence pack

There are 18 before/after pairs (9 page sets × pupil and key), each one A4 page. Every pair differs. I checked every
after-key answer by hand: 29, 46 · 29, 46 · 27, 99 · 8, 5 · 8, 5 · 10, 7, 6 · 1, 7, 3 · 321235, 613312 · 41155, 23471.
All are correct. The correct letter alternates A/B across the pack. `node tests/scripts/ws-roles-unit.mjs` returns OK
(78 checks), and that includes the new LINE-TELL number case (29 against 141 gets a 3-digit line).

## 1. Score table (after; caps applied)

| Page set | Items before → after (ceiling) | C1 | C2 | C3 | C4 | vs before | Pass |
|---|---|---|---|---|---|---|---|
| sub_word_problems RI L (+ key) | 1 → **2** (2) | 8 | 8 | 6* | 8 | better (D1 and E1 closed) | PASS on counted |
| sub_word_problems RI S (+ key) | 2 → 2 (long algorithm: 2) | 8 | 8 | 6* | 8 | better (E1 closed; the story no longer floats 12 mm above its work) | PASS on counted |
| add_word_problems RI M (+ key) | 2 → 2 (long algorithm: 2) | 8 | 8 | 6* | 8 | better (response beside the story; the cell is tighter) | PASS on counted |
| add_wp_10 RI L (+ key) (passed skill) | 1 → **2** (2) | 8 | 8 | 8 | 8 | better (it was a lone item, with A stacked over B) | PASS |
| add_wp_10 RI M (+ key) (passed skill) | 1 → **2** (3) | 8 | 8 | 8 | 8 | better | PASS |
| add_wp_20 RI M (+ key) (passed skill) | 2 → **3** (3) | 8 | 8 | 8 | 8 | better | PASS |
| sub_wp_10 RI S (+ key) (passed skill) | 2 → **3** (4) | 8 | 8 | 8 | 8 | better | PASS |
| sub_1m_no_regroup RI M (+ key) | 2 → 2 (long algorithm: 2) | 8 | 8 | 8 | 8 | better (row centred: N1) | PASS |
| sub_100k_no_regroup RI L (+ key) | 2 → 2 (2) | 8 | 8 | 8 | 8 | better (row centred: N1) | PASS |

\* This cap comes from pre-existing E2 (H15, C3 ≤ 6), which is the same before and after and is not counted against this
change. Without it, these three page sets score 8/8/8/8. Their C2 rises from r6d's 7 to 8 because E1 is closed.

Measured empty bands. These are ink rows between x 56 and 744 px, at 3.81 px/mm, and each is given as a share of the whole
numbered cell. The largest band is 20 % or less everywhere, so no page has an H13 band:
- sub_wp L: 7 % between the response and the panels, 3 % at the cell foot.
- sub_wp S: 15 % / 13 %.
- add_word_problems M: 11 % / 3 %.
- add_wp_10 L: 15 % between the counters and the panels. M: 14 %.
- add_wp_20 M: 13 %. sub_wp_10 S: 14 %.
- sub_1m M: 15 % at the empty cell head, 20 % under the response (unchanged from r6d).
- sub_100k L: 11 % / 17 %.

## 2. Counted defects

None.

## 3. Pre-existing defects (identical before and after; not counted)

| Id | Severity | Page and place | Rule | Automatic check |
|---|---|---|---|---|
| E2 (r6c E2, r6d E2) | counted (pre-existing) | Word-story stack panels (sub_wp S/L, add_word_problems M) print the unit bank ("days / pencils / boxes") beside an answer line that already reads the unit. They also show empty carry/exchange boxes on work with no regrouping (sub_wp item 2 B: 2 empty; add_word_problems item 1 A: 3 empty, B: 2 empty, and item 2 A: 2, B: 3). | H15 (C3 ≤ 6) | `ws-cell-checks` DEAD-PART on `state: answered` panels |
| E3 (r6d E3) | nit | sub_1m M item 1: the distractor 321,265 is a one-digit slip, not a named misconception. (sub_100k uses "added instead of subtracted", which is a real error.) | PEDAGOGY misconception rule | `ws-roles-unit` RI-MISCONCEPTION |
| E4 (r6d E4) | nit | The keys write 5-6 digit answers without the comma ("321235", "613312", "41155", "23471"), while the panels print "321,235". | Key = facsimile (AK) | `ws-cell-checks` KEYFORMAT |

r6d E1 is closed. On sub_wp L item 1 (141 against 29) the line now holds 3 digits (about 95 px, against 62 px for item 2's
46/78), and on S it is 61 px against 52 px. Each line holds the longer of the two candidates, so it can no longer rule one
out. Line widths still differ from item to item, but each one is the maximum of A and B, so the difference says nothing
about which panel is right. The same change also reaches True or False (`true-false.js` passes the wrong value too). That
closes a latent tell there: a False item's line used to be sized to the hidden correct answer, not to the number shown. No
TF page is in this pack, so I did not grade it.

## 4. Nits (introduced or left by the change; none lowers a score below 8)

| Id | Page and place | Note | Check |
|---|---|---|---|
| N1 | Every story page (sub_wp S/L, add_word_problems M, add_wp_10 M/L, add_wp_20 M, sub_wp_10 S) | **Reading order.** The pupil reads the story, then meets "A  B / The answer is __." before the work it judges, and then looks down to compare the panels. So the action order (compare, then circle and write) runs bottom to top. This is still sensible for K-2: the instruction line already says "Circle A or B", the letters are in the same left/right order as the panels, and the response sits next to the question it answers, like an answer box on a workbook cell. It is better than the alternative the lane measured, where the row under the panels cost sub_wp L an item. A small residue remains: both letters stand over panel B's column (for example "A" at x 529-606, panel A at x 62-390). If the response row were moved left, toward the middle of the cell, each letter would sit nearer its own panel. | RI-LAYOUT (proposed): each choice letter's x-centre lies nearer its own panel than the other panel, or the row is centred on the pair |
| N2 | sub_wp_10 S: 3 items against an S ceiling of 4. add_wp_10 M: 2 against 3. | This is not H5 (both hold 2 or more, as the brief requires). On sub_wp_10 S each cell spends about 17 + 36 px between "A B", the answer line and the panels. About 30 px off each cell would fit a 4th item (4 × about 220 px within the 870 px page body). add_wp_10 M leaves about 28 mm of white at the page foot, but its counter rows make a third item about 1150 px, so 2 is honest. | `ws-capacity-pin` / precritic `--role reason-it`: report perPage < ceiling with the measured slack per cell |
| N3 | sub_1m M, sub_100k L | The centred row ("A  B  The answer is ____ .") closes r6d N1. Both letters now sit under panel A's half, but the row reads as one centred sentence under the pair. That meets r6d's own fix ("or the row is centred"). | - |

## 5. Answers to the brief's specific questions

- **Does the response beside the story read in a sensible order for a K-2 pupil?** Yes, with the reservation in N1. The
  page reads: story; the choice and the answer line beside it, at the story's height; then A | B side by side under both.
  The story runs into the work with no gap larger than 9 mm on the story pages at M/L. The response is a compact block
  (letters, then "The answer is __."), close to the question. The cost is a short look back up after comparing, which the
  instruction line prepares.
- **Is anything clipped or crowded?** No, on any after page, pupil or key. On sub_wp L the long question wraps to 4 lines
  ("...does Sam have / than Leo?") in the story's two thirds, with at least 12 mm clear of "A". The key rings (about 14 mm)
  fit beside the story without touching it. Every digit is inside its box, and every panel is inside its cell.
- **Does every page hold at least 2 items where PT-RSN-1 allows 2 or more?** Yes. sub_wp L 2, sub_wp S 2, add_word_problems
  M 2, add_wp_10 L 2 and M 2, add_wp_20 M 3, sub_wp_10 S 3, sub_1m M 2, sub_100k L 2. No page went down in item count. Four
  went up: sub_wp L 1 → 2, add_wp_10 L and M 1 → 2, add_wp_20 M 2 → 3, sub_wp_10 S 2 → 3.
- **Does any line length give an answer away?** No. Each number line holds the longer of the two candidates (141/29 →
  3 digits; 10/6, 46/78, 99/79 → 2-digit minimum; the 6-digit stacks → a 6-digit line). Word lines stay one width (r6d).

## 6. Automatic checks for this round's findings

- N1: the proposed RI-LAYOUT check on letter-to-panel proximity (above). It is not on precritic's path today.
- N2: precritic `--role reason-it` should print perPage against the ceiling, with the measured per-cell slack, for every skill
  in scope, not only passed skills (r6d proposed this too).
- E1 regression: the new `ws-roles-unit` LINE-TELL number case is already on the path, and green.

## 7. What is right

- A word story now prints once, with its response beside it, and its A | B work side by side underneath. That one layout
  serves both column stories and sentence stories. On four page sets it removed the stacked or lone-item layouts.
- The passed skills (add_wp_10, add_wp_20, sub_wp_10) all gained items and lost no quality. Their keys are facsimiles: an
  INK-31 ring plus the value on the same line.
- Every number line is fair to both candidates, and the change carries over to True or False.
