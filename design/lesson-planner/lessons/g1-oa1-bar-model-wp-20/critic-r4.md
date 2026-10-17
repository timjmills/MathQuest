# Detailed lesson 2 (g1-oa1-bar-model-wp-20): independent critic, round 4

Critic: Opus, medium effort, 2026-10-17. Graded cold at commit `e7ef284d` on branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons`. I graded the committed pack: 21 PNGs, `pack.html` and its `#v21-pool`
JSON, and SELF-CHECK (43 / 43). I ran no browser.

What I checked:
- I read all 21 PNGs.
- I re-added every item and every key.
- I checked every T2 / T5 / T6 quote and wrong-answer row against the page it names.
- I read the place list in the pool JSON.
- I read E24 / E24b / E35 / E36 in `tests/scripts/ws-detailed-lesson.cjs` and the round-5 notes in `DETAILED_MAKER.md`.
- I enumerated the 15 crossing-ten part pairs by script to test claim (a).

## Verdict: PASS (21 of 21 pages ≥ 8 on every criterion)

Lowest score per criterion: **C1 8 · C2 8 · C3 8 · C4 8.**

## r3 defect status

| r3 | Status | Evidence at e7ef284d |
|---|---|---|
| D1 Modelled examples and their turn-arounds return; E24 dropped `turn` | **Fixed** | No chart, board or Guided fact returns turned round on any page. The P2 places are 7+5, 8+3 and 7+7, with `forbidden` 5+7 and 3+8. Practice 1 is now 3+9, 5+6 / 9+5, 6+9 / 9+9, 5+15, and P5 is 8+9. E24 now gives a + fact the unordered pair as its identity (`factId`) and builds the chart set from that identity, so the r3 tree would fail (5+7 = id of 7+5). V22's ordered near-twin rule holds: no pair on P4-1 is within 2 in both places. |
| D2 T5 "Steps are at the top of the page" | **Fixed** | T5 §8 row 1: "Pupils do Practice 1. The Steps are on the anchor chart." That is true: P2 is on the wall. E35 now fails the old wording. |
| D3 Exit wrong sign = story number; exit not fresh | **Fixed** | a 8+6 (8 − 6 = 2) and b 4+9 (9 − 4 = 5): neither difference is a part. Neither fact, nor its turn-around, is on any other page, P0 included. T6 gives each mistake its own number: wrong sign "top 2 (a)" / "top 5 (b)", story number "top 8 (a)" / "top 9 (b)", count slip "13 (a)" / "12 (b)". E36 gates both tests. |
| m1 Mixed c / P3 turned; Mixed near twins | **Moot** (Mixed dropped: judgement b) | |
| m2 P0 bonds share 2, d tiny; T3 bond 1 + 7 | **Fixed** | P0 c is 3 and 3 (→ 6) and d is 4 and 6 (→ 10). T3 §3's bond is 4 + 5 = 9. |
| m3 Mia twice on P4-1 | **Fixed** | All 10 names on P4-1 are distinct, and Mia appears once (a). The cross-page name pairs that remain are in n2. |
| m4 `third` 7+7 placed but printed nowhere | **Fixed** | T4 row 8: "Equal parts? Still add the parts." on the board, "Omar has 7 stamps. Kofi has 7 stamps", whole 14. This models the ★★★ 9+9. |
| m5 Exit story starts ~1 mm under "a." | **Improved, still tight** | About 2.5 mm now. Practice cells have about 10 mm. See n4. |
| m6 Vocabulary 5 \| 9 → 14 = P0 g turned | **Fixed** | Now 9 \| 10 → 19, a whole dealt nowhere else. |
| m7 Pool a list of the dealt items | **Fixed** | `decl.kind: 'plus'` (partMin 3, noPart 10, crossTen, sums [20], maxSum 20). E24 recomputes the pool from that rule: "matches". |

## Builder decisions: judgements

**(a) Near twins in either order cannot be dealt; V22's rule is kept position by position. Accepted.**

The arithmetic is correct:
- Parts 3–9 that cross ten give exactly 15 unordered pairs.
- I enumerated every subset by script. Under V22's both-within-2 test read in either order, the largest set of mutually
  apart pairs is **3**.
- So no 4-item set (rows 1–2) exists, and a 6-item page has 0 deals.

Note the limit of the claim. My r3 narrowed rule read in either order (one part the same, the other within 2) does leave
4-sets: 23 with distinct sums, before the other constraints. The builder's own note says this too: that rule combined
with V22's ordered rule leaves 0. The builder took the alternative r3 named as acceptable, V22 as written, as V22's own
examples read it. That is legitimate.

The cost is visible on P4-1 c / d, 9+5 / 6+9:
- Turned round, they share the 9 and the other parts are 5 and 6.
- They sit in the same row, are both put-together stories, and are both "apples".
- The repeated unit word is avoidable (DETAILED_MAKER: "while it can, no story name or unit word twice"), so it is nit n1.

**(b) Optional Mixed page dropped. Accepted.**
- V22 §9.5 says "optional Mixed" twice, so dropping it breaks no rule.
- The count holds. Chart 2 (7+7 is a double and outside the 15), Guided 2, Practice 4, P5 1, exit 2 and the Check
  Question 1 make 12. P0's 8+5, 4+8 and 7+8 make all 15.
- So 4 fresh Mixed stories cannot exist under the unordered identity.
- T1 Lesson flow, T2b "P4 Practice n" and T5 §8 row 4 ("tell a partner a story for one bar on the page") are all
  consistent with no Mixed page. The early-finisher task is real work: it is the reverse direction, story from a bar.

**(c) Gate changes E24 / E35 / E36. Accepted, with two weaknesses that are nits.**
- **E24.** A canonical sign (`canon`), the unordered + / × identity (`factId`), and a chart set read from P2 ids, which
  include the board examples placed on P2. Chart turn-arounds are caught, same-page turn-arounds are caught, and the pool
  is recomputed from `decl`. Correct.
- **E36.** The difference test plus freshness against every other page (P0 included, by `factId`). Correct.
- **E35 (n5).** The Steps check matches only the literal phrase "Steps are at the top of the page" and only for P4-1.
  A paraphrase ("Steps at the top", "the Steps strip") would pass.

## Scores (0–10; PASS = every criterion ≥ 8)

C1 run-ability / correctness for the teacher · C2 pedagogy & item design · C3 visual contract · C4 fill & frame.

| # | Page | C1 | C2 | C3 | C4 | Pass | Notes |
|---|---|---|---|---|---|---|---|
| 01 | T1 Lesson at a glance | 9 | 9 | 9 | 9 | PASS | flow sums to 60 |
| 02 | T2 Atomisation | 9 | 9 | 8 | 9 | PASS | n3 |
| 03 | T2b Reference key | 9 | 8 | 8 | 8 | PASS | n6 |
| 04 | T3 Sections 1–4 | 9 | 9 | 8 | 9 | PASS | P0 / P1 expected answers match |
| 05 | T4 Sections 5–6 | 9 | 9 | 9 | 9 | PASS | chart, board ×2, Guided all quoted correctly |
| 06 | T5 Sections 7–10 | 9 | 9 | 8 | 9 | PASS | D2 fixed; Check Question A–D correct |
| 07 | P0 Prerequisite | 9 | 9 | 9 | 9 | PASS | |
| 08 | P1 Number sense | 9 | 8 | 9 | 9 | PASS | |
| 09 | P2 Anchor chart | 9 | 9 | 9 | 9 | PASS | |
| 10 | P3 Lesson 1 | 9 | 9 | 8 | 9 | PASS | cell 1 traced, cell 2 bare: fade correct |
| 11 | P4-1 Practice 1 | 9 | 8 | 8 | 9 | PASS | n1, n7 |
| 12 | P5 Word problem | 9 | 8 | 8 | 9 | PASS | n2 |
| 13 | P6 Exit slip | 9 | 9 | 8 | 8 | PASS | n4 |
| 14 | P0 key | 9 | 9 | 9 | 9 | PASS | 20 · 17 · 6 · 10 · 13 · 11 · 12 · 15 |
| 15 | P1 key | 9 | 8 | 9 | 9 | PASS | 15 · > · 2 | 4 · 37 · 6 · 98 · < · 5 | 6 · 100 · 58 |
| 16 | P2 key | 9 | 9 | 9 | 9 | PASS | no answer marks (E17b) |
| 17 | P3 key | 9 | 9 | 8 | 9 | PASS | 16 (7 + 9), 11 (7 + 4); vocabulary lines correct |
| 18 | P4-1 key | 9 | 8 | 8 | 9 | PASS | 12 · 11 · 14 · 15 · 18 · 20 |
| 19 | P5 key | 9 | 8 | 8 | 9 | PASS | 8 + 9 = 17, schematic bar in the Workspace |
| 20 | P6 key | 9 | 9 | 8 | 8 | PASS | 14 · 13; Say "13 beads" |
| 21 | T6 Answer key | 9 | 9 | 8 | 8 | PASS | n3 |

Every key is correct, so cap H1 does not apply. Every T2 / T3 / T4 / T5 / T6 quote I checked is on the page it names.
There is no defect: no score is below 8.

## Defects

None.

## Nits (no score below 8)

- **n1.** P4-1 c "Omar has 9 apples. Kofi has 5 apples" and d "Ravi has 6 apples. Zara has 9 apples" share a row, a
  frame and the unit word, and are near twins once turned round (9+5 / 9+6, answers 14 / 15). V22's ordered rule passes
  them (judgement a), but the repeated unit word is the maker's own "while it can" rule missed. Give d another unit
  (e.g. "shells").
- **n2.** Name pairs repeat across pages: Omar + Kofi are the put-together pair three times (T4 board 7+7, P3 cell 2,
  P4-1 c), Tom + Sam twice (P4-1 e 9+9 stickers, P5 8+9 marbles), and Noor four times (chart, board, Check Question,
  P4-1 b). This is accepted by the lead's ruling. Even so, P5 "Tom has 8 / Sam has 9" right after P4-1 e "Tom has 9 /
  Sam has 9" reads like a copy. Use another pair on P5.
- **n3.** "Story number as answer" has two fixes. T2 gives "Is it in the story?", and T6 gives that for (a) but "Count
  both cube trains together" for (b). Use one fix.
- **n4.** The exit cells start the story about 2.5 mm under "a." / "b.". Practice cells have about 10 mm. More top pad
  would match.
- **n5.** E35's Steps test is the literal phrase and P4-1 only. Match "Steps" + "top" on any teacher line, against any
  Practice page.
- **n6.** T2b's band-label legend lists "Mixed Review", which this pack no longer prints.
- **n7.** The ★★★ 5 + 15 (a two-digit part) is modelled nowhere in I Do. Only T5's Watch ("a whole of 20. Walk there
  first.") supports it. It is acceptable as an edge case, but one board line ("A part can be more than 10") would close
  it.
