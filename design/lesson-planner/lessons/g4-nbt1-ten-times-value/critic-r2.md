# Detailed lesson 6 (g4-nbt1-ten-times-value): independent critic, round 2

Critic: Opus, medium effort, 2026-10-17. I graded the pack committed at `f0990693` (HEAD) cold.

Pack: `design/lesson-samples/detailed/g4-nbt1-ten-times-value/`. It has 23 PNGs, seed 4242, and SELF-CHECK passes
48 / 48 (the new gate is E40).

## What I ran

- `ws-detailed-lesson --lesson g4-nbt1-ten-times-value --seed 4242 --check --out <scratch>` printed
  `ws-detailed-lesson: OK`. All 23 PNGs are byte-identical to the committed ones.
- `ws-content-audit --category placevalue --skill value`: OK.
- `ws-code-snapshot`: OK (608 codes; 4H and 4I round-trip).
- `ws-standards`: OK.
- `ws-boot-smoke`: OK.
- `ws-screen-answer --skills placevalue:value --opts …`: OK on card, worksheet and quiz for each printed form:
  - P3 / P4-1: band 9999, tenDir both, tenValues on;
  - P4-2: band 99999;
  - P6: tenWrite top, tenDir tenth;
  - P5: tenTask story;
  - Check Question: tenValues off.
- `generateQuestionFor` in node: 200 seeds per form. Every value, ring, digit-once and band bound recomputes, with
  0 bad items. Story items give 10, and B / Sm = 10 every time. With tenDir both, the facts reach 36 keys, split
  200 / 200 between the two directions.

What I checked by hand:
- I read all 23 PNGs, the `#v21-pool` JSON and `build.json` vars.
- I re-derived every value, ring and key:
  - P0 a–h; P1 1–10;
  - the chart: 195 / 10 → 100, 10, 10 times; 95 / 358 → 5, 50, one tenth of;
  - Guided 830 / 8,377 and 747 / 934; Independent 9,515 / 2,968;
  - P4-1 a–d and P4-2 a–d;
  - P5 6,000 ÷ 600 = 10;
  - exit 564 / 59 → 500, 10 times · 3,545 / 5,465 → 40, one tenth of · 5,855 / 8,630 → 800, one tenth of;
  - the Check Question: 2,748 / 6,570 → 10 times.
- I checked every T3–T6 quote against the page it names.

## Verdict: FAIL (1 page below 8, and 1 skill-coverage blocker)

Lowest score per criterion: **C1 8 · C2 7 · C3 8 · C4 8.**

The four round-1 blockers are fixed:
- P1 is clean.
- The pool is keyed on the fact (digit and place pair), so no item returns.
- The exit slip now has a production step.
- The P5 key reads "10".

The pack is close. Two new items hold it:
- **D1:** a T4 script line now states the wrong answer for Guided cell 2.
- **D2:** the Check Question's A–D form is not dealt by any skill option online.

## Scores (C1 ease of use · C2 teaching / correctness · C3 layout · C4 look)

| Page | C1 | C2 | C3 | C4 | Defects |
|---|---|---|---|---|---|
| T1 Teacher 1 | 9 | 9 | 9 | 9 | (n6 fixed) |
| T2 Teacher 2 | 9 | 8 | 9 | 9 | |
| T2b Reference | 9 | 9 | 9 | 9 | |
| T3 Teacher 3 | 9 | 8 | 9 | 9 | n15 |
| T4 Teacher 4 | 8 | **7** | 9 | 9 | **D1** |
| T5 Teacher 5 | 8 | 8 | 9 | 9 | n9, (D2 Check Question) |
| P0 Prerequisite | 9 | 8 | 9 | 9 | n4 |
| P1 Number sense | 9 | 8 | 9 | 9 | D1-r1 fixed |
| P2 Anchor chart | 9 | 9 | 9 | 9 | n7 fixed (T / O pair, digit 5) |
| P3 Lesson 1 | 9 | 8 | 9 | 9 | (D1 cause: Guided order), n12 |
| P4-1 Practice 1 | 9 | 8 | 9 | 9 | n13 |
| P4-2 Practice 2 | 9 | 8 | 9 | 9 | n11, n10 |
| P5 Word problem | 8 | 8 | 8 | 8 | n2 |
| P6 Exit slip | 8 | 8 | 9 | 9 | n14 |
| P0 key | 9 | 8 | 9 | 9 | n4 |
| P1 key | 9 | 8 | 9 | 9 | 436 and 935 now visible |
| P2 key | 9 | 9 | 9 | 9 | |
| P3 key | 9 | 8 | 9 | 9 | 30, 300, one tenth of · 40, 4, 10 times · 9,000, 900, 10 times ✓ |
| P4-1 key | 9 | 8 | 9 | 9 | ✓ |
| P4-2 key | 9 | 8 | 9 | 9 | ✓ |
| P5 key | 8 | 8 | 8 | 8 | Say "Mia has 10 times as many." ✓ |
| P6 key | 8 | 8 | 9 | 9 | ✓ |
| T6 Answer Key | 8 | 8 | 9 | 9 | n3 (P0 "4000") |

## Blockers

**D1. T4 §6 row 4 tells the teacher the wrong answer for Guided cell 2** (RUBRIC C2 "scripts match the pages they
name"; T4 C2 → 7).

- **What the page says:**
  - Row 3: "Pairs do cell 2: 747 and 934. Expected ★: 40 and 4, 10 times."
  - Row 4: "Cell 2: is the top value bigger or smaller?" Note: "Smaller, so **one tenth of**."
- **Why it is wrong:**
  - Cell 2's top value is 40 and the bottom is 4, so the answer is bigger and **10 times**.
  - The P3 key rings 10 times. `build.json` gives `we.1.rel` as "10 times".
  - A teacher reading the note aloud teaches the very mistake T1 says to stop today.
- **Cause:**
  - The row is hard-coded (lesson file line 230: `note: 'Smaller, so [[one tenth of]].'`). It was true in r1, when
    cell 2 was 830 / 8,377.
  - After the D2 re-key, the dealer did not meet `guided: ['tenTimesMid', 'tenTenthMid']`:
    - No 10-times-mid item was left, so `pickWeDo` skipped that case.
    - Cell 1 became the one-tenth item (830 / 8,377).
    - The fallback filled cell 2 with 747 / 934, a T / O pair, which the lesson's own `tenEdge` counts as an edge
      case.
  - So the traced first cell now models one tenth. T2 says the opposite ("One chunk: 10 times first, then one
    tenth").
- **Fix:**
  - Fill the note from the dealt item, never a literal. For example: `ask: 'Cell 2: is the top value bigger or
    smaller?'`, with the note giving Bigger or Smaller from `{we.1}` and then `[[{we.1.rel}]]`. A `{we.1.bigSmall}`
    var would do.
  - Make the Guided deal honour its declared cases and order. Cell 1 should be a 10-times H / T or Th / H item, and
    cell 2 a one-tenth item. Relax `spreadMax` for Guided, or deal Guided before Practice, rather than drop the case.
  - Add a gate that reads every T3–T6 note's ring word against the item it names. E29 checks numbers, not the
    relation word.

**D2. Skill coverage: the Check Question's A–D choice has no skill option online** (DETAILED_MAKER "Skill coverage
rule" 1 and 4; the cross-lesson finding X1 in `SKILL-COVERAGE-AUDIT-1-5.md`).

- **Paper vs screen:**
  - The board Check Question (T5 §7) is "The 7 in 2,748 is ___ the 7 in 6,570. A: one tenth of · B: the same as ·
    C: 100 times · D: 10 times".
  - RESEARCH §6 records it as `value {form times, tenValues off}`.
  - `generateQuestionFor` with those options deals a 2-option choice: `options: ['10 times', 'one tenth of']`.
- **What is lost online:**
  - Options B and C, the "same digit, same value" and "counted two places" distractors T2 names, never appear.
  - So an online pupil never meets the item as the board gives it.
- **How the table records it:** the coverage table has no row for the Check Question at all. Under the rule it is a
  partial row, and "a lesson passes only with no partial row".
- **Fix (cheap):**
  - Add a `tenValues`-off choice set, or the shared `response: 'which-right'` from X1. It would deal the 4-option
    choice from the provider's `timesWrong` set, which already holds "the same as" and "100 times" for this skill.
  - Then add a Check Question row to §6.
- **If the lead rules X1 is closed lesson-wide later:** record the row as `partial (X1, shared fix)`, and this
  downgrades to a note for this lesson.

## Status of round-1 items

| Item | Status |
|---|---|
| D1 P1 clipped rows | **Fixed.** 50 mm instruction column, the frame on one line; 436 / 935 visible on the key; E40 added and passing. |
| D2 repeats by value | **Fixed.** `q.factKey` = digit + place pair, either direction one key; the 35 pool keys are all distinct, with no chart key or turn-around returning. Digits: 1, 2, 3, 4, 5, 6, 8, 9 twice each, 7 once (spreadMax 2 holds). See n11 for one same-page leftover. |
| D3 ring-only exit | **Fixed.** Each item writes the top value, then rings. The always-"10 times" pupil scores 1 / 3 (b and c are one tenth). T6 wrong-answer rows are now answers the slip can show (5 for 500, 40 with 10 times, 8,000 for the top 8). The 132.5 mm halves hold 3 items at full type. |
| D4 P5 Say key | **Fixed.** "Mia has 10 times as many." Key 6,000 ÷ 600 = 10. |
| n1 P5 Say on 3 lines | Fixed: one line. |
| n2 P5 story English / "Draw it." | Partly. The question reads well now. "Draw it." still has no frame for 6,000 stickers; a blank place chart in the workspace would be the drawing. |
| n3 commas | Partly. P5 is fixed; T6's P0 row still prints "4000" (the P0 key prints 4,000). |
| n4 P0 place words "ones tens hundreds" | Open (the shared `identify` generator). It does not hold P0 below 8: the words are a ring bank, not a chart heading, and the routine is unaffected. Fix it with the skill, not here. |
| n5 T4 "Panel 3" | Fixed: "Another example." |
| n6 T1 digit cards | Fixed: removed. |
| n7 chart's second example | Fixed: 95 / 358 (T / O, digit 5). Atom 7 is now shown on two place pairs. |
| n8 T3 Band B note | Changed to "crossing a hundred" (see n15). |
| n9 T5 Watch "3078", "2149"-style numbers without commas | Open. Not below 8. |
| n10 P4-2 near-look / direction | Near-look fixed (92,163 and 82,975 now). Direction is still 3 : 1 on P4-2; the pack overall is balanced (Practice 5 : 3, exit 1 : 2). Not below 8. |

## Minors (no score effect)

- **n11.** P4-2 a and c both use the digit 2 in the thousands place: 62,039 and 82,975.
  - So "2,000" is written in two boxes on one page.
  - `spreadMax` counts the digit across the pack, not per page.
  - Prefer at most one item per digit on a page.
- **n12.** Guided cell 2 (747 / 934) is a T / O pair, which `tenEdge` calls an edge case. It sits in the ★ row. This
  is part of D1's deal fix.
- **n13.** P4-1 b uses 95, the number of the chart's "Another example". It is a different digit (the 9, not the 5),
  so it is not a repeat by the fact key, but it is a near-look to the poster. Retrieval Q2 (934 in unit form) also
  reuses Guided cell 2's 934.
- **n14.** P6 "Write the top value." works with the single box beside the top row. "Write what the top digit is
  worth." would be plainer for ELL, but it is longer than the 12-word limit allows with the second sentence. Leave
  it.
- **n15.** T3 §2: "Band B: the same five kinds, crossing a hundred." 894 + 10, 139 − 100 and 304 − 10 cross; 352 vs
  375 and 835 + 100 do not. Say "harder numbers".
- **n16.** `data/curriculum/detailed-lessons.json` has no lesson 6 entry yet. The skills.used and coverage tables
  live only in RESEARCH §6. Rule 3 asks for them in the JSON; write them there at pass, as lessons 1–5 did.

## Skill coverage check (DETAILED_MAKER rule 1–4)

| Printed item | Skill + opts | Online form matches paper? |
|---|---|---|
| P0 a–b, c–d, e–h | `placevalue:identify`, `value {form value}`, `place_value_10x {x / ÷, power 10}` | yes (prerequisite skills' own forms) |
| P1 | `more_less_100`, `compare` | yes |
| P2 chart, P3, P4-1 | `value {form times, band 9999, tenDir both, tenValues}` | yes: `pvTimesTwin` draws the same chart, typed worth boxes, ring words as tap tiles; round-trip OK on 3 hosts |
| P4-2 | the same, band 99999 | yes |
| P5 | `value {form times, tenTask story}` (4I) | yes: the story with ÷ blanks; 4.NBT.A.1's "700 ÷ 70 = 10" clause is now dealt |
| P6 | `value {form times, tenWrite top}` (4H) | yes |
| Check Question (board A–D) | `value {form times, tenValues off}` | **no: 2 options online, 4 on the board (D2)** |

Clause coverage:
- 4.NBT.A.1 "ten times … to its right": full.
- "multi-digit whole numbers": full (to 99,999).
- "700 ÷ 70 = 10": full via tenTask story.
- One tenth in words: full.
- 5.NBT.A.1 with decimals: elsewhere, lesson 9. This is properly named.

## Owner / lead questions

1. **D2 / X1:** fix the Check Question choice here with a skill option, or rule that the shared `which-right`
   response closes it for all six lessons later? Under the rule as written it is a blocker now.
2. Should `spreadMax` also cap a digit per page (n11)? One line in `refAccepts` / `dealOne1` would do it.
