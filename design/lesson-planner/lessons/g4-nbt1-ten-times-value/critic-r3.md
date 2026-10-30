# Detailed lesson 6 (g4-nbt1-ten-times-value): independent critic, round 3

Critic: Opus, medium effort, 2026-10-30. I graded the pack on branch `claude/sweet-newton-c8wrv1-lessons-6-7` at
`92cd31f3` cold. I did not build it, and I did not read the builder's evidence column before rendering.

Pack: `design/lesson-samples/detailed/g4-nbt1-ten-times-value/`. It has 23 PNGs, seed 4242, and SELF-CHECK passes
50 / 50 rows.

## What I ran

- `ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check --out <scratch>` printed `ws-detailed-lesson: OK`. All 23
  fresh PNGs are byte-identical to the committed ones.
- `ws-detailed-lesson --repeats` printed OK (35 places, 0 findings).
- `generateQuestionFor` in node, 400 seeds per printed form:
  - P3 / P4-1: `{times, 9999, both, values}`;
  - P4-2: band 99999;
  - P5: `tenTask story, tenDir times`;
  - P6: `tenWrite top`, with `tenDir` times and with tenth;
  - the Check Question: `{values off, tenChoice four}`, also forced to each direction.

  Every item recomputes: the digit sits in its stated place in both numbers, v0 and v1 are right, the relation word
  matches v0 / v1, and the band bound holds. That is 0 bad items in 3,200.
- `tenChoice four`: the four options are always the same set (10 times · one tenth of · the same as · 100 times), in
  both directions, on every seed. The set never changes with the answer, so it cannot give the answer away.
- `ws-screen-answer --skills placevalue:value` gave card ok, worksheet 3/3 and quiz 3/3 for each of:
  - the Check Question form;
  - P4-2;
  - P5;
  - P6 tenth.
- `ws-screen-answer` on the three presets `placevalue:ten_times_value`, `one_tenth_value` and `ten_times_story`: all OK
  on the three hosts.
- Presets, checked in the code:
  - label, grade 4, `SKILL_STANDARDS` 4.NBT.A.1 + M.EE.5.NBT.1, 6–7 search terms each;
  - `SKILL_WRM` (partial Y5.B1.S6 / Y4.B5.S3 / Y4.B5.S5) and the Y4 / Y5 link records;
  - `skill-presets.js` opens `value` with `form times` (+ `tenDir tenth` / `tenTask story`).
  - Generated items match each preset's name.
- `data/curriculum/detailed-lessons.json` has lesson 6 with every role and a Check Question row. It has no `partial` row.

What I checked by hand:
- I read all 23 PNGs, the `#v21-pool` JSON and `build.json`.
- I re-derived every value, ring and key:
  - P0 1–8: hundreds · ones · 800 · 4,000 · 50 · 760 · 2 · 87;
  - P1 1–10;
  - the chart: 195 / 10 → 100, 10, 10 times · 95 / 358 → 5, 50, one tenth of;
  - Guided: 9,515 / 2,968 → 9,000, 900, 10 times · 830 / 8,377 → 30, 300, one tenth of;
  - Independent: 747 / 934 → 40, 4, 10 times;
  - P4-1: 1,000 / 100 · 80 / 800 · 2,000 / 200 · 300 / 3,000;
  - P4-2: 20,000 / 2,000 · 60 / 600 · 90,000 / 9,000 · 70 / 7;
  - P5: 6,000 ÷ 600 = 10;
  - exit: 500, 10 times · 40, one tenth of · 800, one tenth of;
  - the Check Question: 2,748 / 6,570 → 700 / 70 → D 10 times.
- I checked every T3–T6 line against the page and item it names.

## Verdict: PASS

Lowest score per criterion: **C1 8 · C2 8 · C3 8 · C4 8.**

Both round-2 blockers are fixed on the rendered pages.
- **D1:** the T4 note now reads the dealt cell: "Smaller, so one tenth of" for 830 / 8,377. The Guided cells keep their
  declared order: cell 1 is 10 times, cell 2 is one tenth.
- **D2:** the board's A–D Check Question is dealt online by `tenChoice four`, and the coverage table has the row.

The minors left (below) do not hold any page under 8.

## Scores (C1 ease of use · C2 teaching / correctness · C3 layout · C4 look)

| Page | C1 | C2 | C3 | C4 | Notes |
|---|---|---|---|---|---|
| T1 Teacher 1 | 9 | 9 | 9 | 9 | |
| T2 Teacher 2 | 9 | 8 | 9 | 9 | n4 (mistake names vs T6) |
| T2b Reference | 9 | 9 | 9 | 9 | |
| T3 Teacher 3 | 9 | 8 | 9 | 9 | n2 (P0 "4000") |
| T4 Teacher 4 | 9 | 9 | 9 | 9 | D1-r2 fixed |
| T5 Teacher 5 | 9 | 9 | 9 | 9 | D2-r2 fixed; Watch line names the pairs as printed |
| P0 Prerequisite | 9 | 8 | 9 | 9 | r2 n4 (shared `identify` words) still open |
| P1 Number sense | 9 | 8 | 9 | 9 | |
| P2 Anchor chart | 9 | 9 | 9 | 9 | zoom 1 |
| P3 Lesson 1 | 9 | 8 | 9 | 9 | n3 (Independent is a T / O pair) |
| P4-1 Practice 1 | 9 | 8 | 9 | 9 | |
| P4-2 Practice 2 | 9 | 8 | 9 | 9 | n1 (92,163 / 92,715 back), direction 3 : 1 |
| P5 Word problem | 9 | 8 | 8 | 8 | the workspace chart closes r2 n2 |
| P6 Exit slip | 8 | 8 | 9 | 9 | n6 |
| P0 key | 9 | 8 | 9 | 9 | 4,000 with comma |
| P1 key | 9 | 8 | 9 | 9 | |
| P2 key | 9 | 9 | 9 | 9 | |
| P3 key | 9 | 8 | 9 | 9 | ✓ |
| P4-1 key | 9 | 8 | 9 | 9 | ✓ |
| P4-2 key | 9 | 8 | 9 | 9 | ✓ |
| P5 key | 9 | 8 | 8 | 8 | 6,000 / 600 in the chart, 6,000 ÷ 600 = 10, Say 10 ✓ |
| P6 key | 8 | 8 | 9 | 9 | ✓ |
| T6 Answer Key | 9 | 8 | 9 | 9 | n4, n5 |

## Blockers

None.

## Status of round-2 items (checked on the rendered pages, not on fix-r4.md)

| Item | Status |
|---|---|
| D1 T4 relation word | **Fixed.** In T4 §6, row 2 is 9,515 / 2,968: 9,000, 900, 10 times. Row 3 is 830 / 8,377: 30 and 300, one tenth of. Row 4 reads "Smaller, so one tenth of". These match the P3 key. E41 is new and passes (18 statements). |
| D2 Check Question A–D online | **Fixed.** `tenChoice four` deals the four words on every seed and in both directions. The screen round trip is OK on card, worksheet and quiz. The coverage row is present. |
| n2 P5 "Draw it." | **Fixed.** An empty Th H T O chart, two rows. The key writes 6000 / 600. |
| n3 commas | **Partly.** T6 and the P0 key print 4,000. T3 §1 still prints "4. 4000" (see n2 below). |
| n4 P0 place words | Open (the shared `identify` skill). Not below 8, as ruled in r2. |
| n9 T5 Watch | **Fixed.** "349 and 3,682 (thousands and hundreds, one tenth); 3,078 and 51,657 (tens and ones, 10 times)". Both are right. |
| n10 P4-2 near-look | **Regressed** (see n1). fix-r4 says the near-look pair came back only in a trial that was thrown away. The rendered P4-2 prints it. |
| n11 one digit twice a page | **Fixed.** P4-2 digits 2, 6, 9, 7. |
| n12 Guided T / O edge | **Fixed for Guided** (830 / 8,377 is T / H). The T / O pair moved to the Independent cell (n3). |
| n13 near the chart's 95; 934 reused | **Partly.** P4-1 is clean. Retrieval Q2 is 9,344, the Independent cell is 934 (n7). |
| n14 | Left, as ruled. |
| n15 T3 Band B note | **Fixed.** "harder numbers". |
| n16 detailed-lessons.json | **Fixed.** Lesson 6 is recorded, with no `partial` row. |

## Minors (no score effect)

- **n1. P4-2 near-look is back.**
  - Items 2 and 3 are 92,163 and 92,715. Both open "92", on one page.
  - This is the exact pair critic r1 named (n10) and r2 marked fixed.
  - fix-r4 says the pair came back only in a trial that was thrown away. The committed and fresh P4-2 both print it.
  - The direction is still 3 : 1 (10 times on items 1, 3 and 4).
- **n2. T3 §1 note prints "4. 4000".**
  - The `answerShow` hook adds the comma on T6 only.
  - Apply it to `{p0.list}` too.
- **n3. P3 Independent 747 / 934 is a tens / ones pair.**
  - The lesson's own `tenEdge` counts that as an edge case.
  - It is the only ★★ item on P3.
  - Prefer an H / T or Th / H pair here, and keep the T / O pair for P4-2's last row (where it is: 3,078 / 51,657).
- **n4. Mistake names differ between T2 and T6.**
  - T6's exit-3 row is named "Place next to it". T2's list has "Counted two places" and "Digit, not value", but no
    "Place next to it".
  - Use one name per mistake across T2, T5 and T6.
- **n5. T6 routing "4.NBT.B.6 Divide by 10".**
  - 4.NBT.B.6 is division by one-digit divisors, so ÷ 10 is not in it.
  - Name the routing lesson as a title, or use the Grade 3 / 5 code that fits (5.NBT.A.2 is the powers-of-ten
    standard; there is no earlier ÷ 10 standard).
- **n6. The exit slip's three pairs are near-look.**
  - 3,545 / 5,465 / 5,855 / 8,630 put the 5 in nearly every place.
  - Readable, but a SPED pupil may track the wrong row.
- **n7. Retrieval Q2 is 9,344 and the Independent cell is 934.** One number is a prefix of the other.
- **n8. `tenChoice four` can only ever be right with two of its words.**
  - "the same as" and "100 times" are never right online. A pupil who learns that will strike them at once.
  - It is the board's own design, so this is not a give-away of the item. A later skill round could deal a
    same-place pair ("the same as") now and then.

## Automatic checks that would have caught each finding

| Finding | Class | Check | Exists? |
|---|---|---|---|
| n1 near-look pair on one page (regressed between rounds) | repeats / near-look | `--repeats`: on one page, fail two numbers that share their first two digits and length (or differ in one digit). Keep the r1 → r2 → r3 history as a backtest row on `92,163 / 92,715`. | No: E24 keys on the fact, not the look. |
| n1 fix write-up says a defect is gone that the pack still prints | claims ≠ render | A fix write-up's "Evidence" cell quotes rendered values. A small tool (`ws-fix-claims`) greps those values from the pack's `#v21-pool` and fails a "not on the page" claim when the page prints it. | No |
| n2 bare 4-digit number on T3 | notation | The E30-style scan proposed in fix-r4 (bare 4+ digit numbers in teacher text outside codes and seeds) would catch T3 as well as T6. It is still not built. | No (proposed r2) |
| n3 Independent cell is the edge case | dealer | The `tenEdge` items are only allowed where `edgeLast` asks for them. A test in `roles/lesson.js` (`indepWants: 'tenMid'`). | No |
| n4 one mistake, two names | scripts ≠ pages | `validateDescription`: every `wrongAnswers[].mistake` must be a `mistakes[].name`. | No |

## Speed-ups this round revealed

- The round-2 fix list was mostly closed in round 3. Round 4 then moved the dealer (`spreadPage`, `tenNoOnes`, guided
  cases), and a fixed near-look came back unseen.
  - A near-look check in `--repeats` would make every dealer change safe in one command.
- The critic re-derived 23 pages of values by hand. All of them were right, and E41 + E29 already cover them.
  - Next round, the critic can trust E29 / E41 for numbers and relation words, and spend the time on pedagogy and look.
- The fix write-up's evidence column was right on 11 of 12 rows. The wrong one (n10) cost a re-check.
  - Write-ups should paste the rendered value, not describe the outcome.
