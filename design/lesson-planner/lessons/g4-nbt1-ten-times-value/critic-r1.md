# Detailed lesson 6 (g4-nbt1-ten-times-value): independent critic, round 1

Critic: Opus, medium effort, 2026-10-17. I graded the pack built in `c2a6d8b4` cold. HEAD is the merge `141cf9d3`; the
pack and lesson file are unchanged by it.

Pack: `design/lesson-samples/detailed/g4-nbt1-ten-times-value/`. It has 23 PNGs, seed 4242, and SELF-CHECK passes
47 / 47. I reran `node tests/scripts/ws-detailed-lesson.cjs --lesson g4-nbt1-ten-times-value --seed 4242 --check`
into the scratchpad. It printed `ws-detailed-lesson: OK`, and all 23 PNGs are byte-identical to the committed ones.
`ws-content-audit --category placevalue --skill value` is OK, and so is `ws-standards`.

What I checked:
- I read all 23 PNGs and the `#v21-pool` JSON.
- I re-derived every value, ring and key:
  - P0 a–h; P1 1–10;
  - the chart (613 / 868, 63 / 8,608);
  - Guided 195 / 10 and 830 / 8,377, and Independent 747 / 934;
  - Practice 1 a–d and Practice 2 a–d;
  - P5 6,000 / 600, and the exit 172 / 6,013, 67 / 3,685 and 5,855 / 8,630;
  - the Check Question 287 / 725.
- I checked every T3–T6 quote against the page it names.
- I read the lesson file and the `gen-pv.js genTimesValue` diff.

## Verdict: FAIL (13 of 23 pages have a criterion below 8)

Lowest score per criterion: **C1 6 · C2 6 · C3 5 · C4 6.**

What is clean:
- Every value, ring and P0–P4 key is mathematically right.
- The two-row place chart is a good structural scaffold: the worth boxes stay, and the Guided cell 1 trace fades.
- Frame, ink, type and I Can title are right.
- The Check Question's wrong options map one to one onto the T2 mistakes.
- Tags are right: 4.NBT.A.1, owner list + 5.NBT.A.1, EE M.EE.5.NBT.1 (Wisconsin "use M.EE.5.NBT.1"), now on
  `placevalue:value`.

Four things fail the pack:
- P1 prints clipped, overlapping items.
- The pool is keyed on the top number, not on what the pupil works out, so items repeat:
  - the chart example and a Guided item return on the exit slip;
  - a turn-around pair sits on one Practice page.
- The exit slip is ring-only: a 50/50 guess that cannot detect the mistakes T5 / T6 say it detects.
- The P5 key fills the Say blank with the wrong answer.

## Scores (C1 ease of use · C2 teaching / correctness · C3 layout · C4 look)

| Page | C1 | C2 | C3 | C4 | Defects |
|---|---|---|---|---|---|
| T1 Teacher 1 | 9 | 9 | 9 | 9 | n6 |
| T2 Teacher 2 | 9 | 8 | 9 | 9 | |
| T2b Reference | 9 | 9 | 9 | 9 | |
| T3 Teacher 3 | 9 | 8 | 9 | 9 | n8 |
| T4 Teacher 4 | 8 | 8 | 9 | 9 | n5, n7 |
| T5 Teacher 5 | 8 | 8 | 9 | 9 | (D3 exit claims), n9 |
| P0 Prerequisite | 9 | 9 | 9 | 9 | n4 |
| P1 Number sense | **6** | 8 | **5** | **6** | D1 |
| P2 Anchor chart | 9 | 8 | 9 | 9 | (D2 source), n7 |
| P3 Lesson 1 | 9 | 8 | 9 | 9 | (D2 source: Guided 1 returns on the exit) |
| P4-1 Practice 1 | 9 | **7** | 9 | 9 | D2 |
| P4-2 Practice 2 | 9 | **7** | 9 | 9 | D2, n10 |
| P5 Word problem | 8 | 8 | 8 | 8 | n1, n2 |
| P6 Exit slip | 8 | **6** | 9 | 9 | D2, D3 |
| P0 key | 9 | 9 | 9 | 9 | |
| P1 key | **6** | 8 | **5** | **6** | D1 (436 and 935 clipped too) |
| P2 key | 9 | 8 | 9 | 9 | no answer marks ✓ |
| P3 key | 9 | 8 | 9 | 9 | 100, 10, 10 times · 30, 300, one tenth of · 40, 4, 10 times ✓ |
| P4-1 key | 9 | **7** | 9 | 9 | D2 (values ✓) |
| P4-2 key | 9 | **7** | 9 | 9 | D2 (values ✓) |
| P5 key | **7** | **6** | 8 | 8 | D4 |
| P6 key | 8 | **6** | 9 | 9 | D2, D3 (rings ✓) |
| T6 Answer Key | 8 | **7** | 9 | 9 | D3 (wrong-answer rows the exit cannot produce), D4 glance ✓ |

## Defects (each one causes a score below 8)

**D1. P1 and P1 key: items 4 and 9 are clipped and overlap the next item** (C3 / C4 "nothing past its cell"; C1).
- Both items are "100 more than ___". The frame wraps to a second line, the row does not grow, and the line is cut
  through:
  - item 4 reads "100 more than 33(", and item 9 "100 more than 83(";
  - the answer blank is not visible;
  - the number boxes 5 and 10 sit on top of the cut text.
- On the key, 436 and 935 are clipped to orange fragments. T6 quotes them, but the key does not show them.
- The "10 more" and "100 less" rows fit; "100 more" is one word-width longer.
- SELF-CHECK E9 ("overflow none") and E11 passed this. The clip is inside the cell, so the gate is blind to it.
- **Fix:**
  - Let the row grow to the wrapped content, or keep the frame on one line by narrowing the instruction column
    (do not shrink the type).
  - Add a gate: no text box's bottom past its cell's clip box, and no two cells' contents overlap.

**D2. Repeats by value: the chart example, a Guided item and a Practice item return; a turn-around pair on one page**
(LR-5, LR-6; V22 "a chart example never returns, in any representation, nor its turn-around"; "the exit slip never
repeats an item").

The pool (E24) is keyed on the top number (`"items":["613","63",...]`). For this skill the item is what the pupil
writes and rings: the digit, its two values and the relation. The pool's own `ans` fields show the repeats:

| Item (values, ring) | Where |
|---|---|
| 60, 600, one tenth of (digit 6) | **P2 chart "Another example"** = **P4-2 b** = **P6 exit b** (the Critical Atom item) |
| 100, 10, 10 times (digit 1) | **P3 Guided 1** (values traced in grey) = **P6 exit a** |
| 1,000, 100, 10 times (digit 1) | **P4-1 a** = **P4-2 a** |
| 100, 1,000, one tenth of (digit 1) | **P4-1 d**, the turn-around of P4-1 a **on the same page** |

- Digit 1 is used in 5 of the 15 two-row items, and digit 6 in 5. The digit is drawn with `randInt(1, 9)`, with no
  memory across items.
- Exit b, the item T5 sorts the slips by, is the chart's second example with other filler digits. A pupil reads the
  answer off the poster.
- **Fix:**
  - Key the pool on (digit, higher place, lower place, direction), the fact the pupil produces.
  - Deal so that no key repeats, no chart key or its turn-around returns, and no turn-around shares a page.
  - Spread the digits: no digit more than twice in the pack's two-row items.
  - E24 must recompute on that key: its `ans` already carries the fact, so it can read it.
  - The pool is large (9 digits × 4 place pairs × 2 directions = 72), so this costs nothing.

**D3. P6: the exit slip is ring-only, so a guess passes it and it cannot detect what the teacher pages say it
detects** (V22 §9.7 "items are in the Practice cell format"; PEDAGOGY P-29 spirit; RUBRIC C2 assessment validity).
- Practice, Guided and Independent all have two steps: write both values (T2 routine step 2, tagged New), then ring.
  The exit drops the values (`tenValues: false`) and keeps only a two-way ring.
- A pupil who guesses gets 3 / 3 one time in 8. The always-"10 times" pupil, the very mistake T1 says to stop today,
  scores 1 / 3. That score is close enough to an off-by-one slip that the sort T5 asks for ("sort the slips by item b")
  is weak.
- T6 "Wrong answers" lists answers the slip cannot capture:
  - "the same as" for 100 and 10 (exit a);
  - "one hundredth of" for 800 and 8,000 (exit c).
  - Only "10 times" or "one tenth of" can be ringed.
- The lesson file's `detects` for a and c ("Circles by the digits", "Counts two places or says 100 times") cannot be
  seen on a ring.
- **Ruling on the builder's flags:**
  - Three items, not four: **accepted.** Lessons 3, 4 and 5 passed with 3 a half, and T2b scores /3.
  - Circle-only: **not accepted.**
- **Fix:** the exit items must carry the production step. Any of these will do:
  - (a) the worth boxes beside the chart rows, with the ring sentence moved below the chart in one or two lines (the
    cells have about 38 mm height now, and a 3-item half has room for about 44 mm cells);
  - (b) keep the ring and add one "worth" box for the underlined digit of the second row on each item;
  - (c) make one of the three a write-the-values item.
  - Then rewrite T6's wrong-answer rows to answers the slip can show, for example "40 and 4 written as 4 and 4",
    "one tenth of ringed with 600 > 60 written".
  - Never shrink the type.

**D4. P5 key: the Say blank holds the wrong answer** (RUBRIC C2 "key matches its page").
- The frame is "It is worth ___ times as much." The key writes "6,000, 600, 10 times" in the blank. Read aloud, that
  is "It is worth 6,000, 600, 10 times times as much."
- The answer is **10**. The bridge fills the Say slot with the item's whole `ans` string.
- **Fix:**
  - Give the word-problem Say slot its own key value: `say` answer = the ratio.
  - Add a gate: a Say slot's key text, put in the frame, must not repeat the frame's own words.

## Builder flags and owner questions

- **Exit 3 items, not 4:** accepted (see D3).
- **Exit circle-only:** blocker D3.
- **Chart's third example dropped:**
  - Accepted for room; the two directions are both modelled.
  - But both chart examples use the same place pair (hundreds and tens) and the same digit. Atom 7 ("any place:
    always 10", Category) is then only a spoken line. Pairs like T / O and Th / H first appear in Independent and
    Practice 1. See n7.
- **P5 Say blank wraps to 3 lines:** n1. It does not score below 8, but it looks broken beside every other one-line
  Say band.
- **Research without logged-in MW4K / IXL:**
  - Not a blocker. Lessons 3–5 passed with the same stated gap.
  - No `credentials.md` exists in this container.
  - Keep it listed as a gap in RESEARCH.md.
- **Owner Q1, one tenth as words in Grade 4:**
  - Agree: "one tenth of" in words.
  - 4.NBT.A.1 itself only asks for "ten times". The one-tenth direction is the site lesson's title and 5.NBT.A.1's
    clause.
  - The word "tenth" is in grade: 4.NF.C.6 uses tenths. 1/10 and 0.1 belong with decimals in lesson 9.
  - The screen accepts "1/10 of" as an alternative already, which is fine.
- **Owner Q2, two equal digits in one number (4,440):** agree. It is a later option, not today.

## Nits (no score effect unless noted)

- **n1.** P5 Say: the blank takes a full line, so the frame reads over three lines. Keep it on one line ("It is worth
  ___ times as much.") with a slot sized for 2 digits.
- **n2.** P5 story:
  - "How many times as much is Mia's?" is hard English for ELL pupils ("Mia's" what?). Try "Mia's 6 is worth how many
    times Leo's 6?" or "How many times as many stickers does Mia have?".
  - "Draw it." gives no frame, and 6,000 stickers cannot be drawn. A blank place chart in the workspace would be the
    drawing.
- **n3.** P5 key equation prints "6000" (no comma) while the story and T5 print 6,000. T6's P0 row prints "4000" while
  the P0 key prints 4,000.
- **n4.** P0 a–b: the place labels run "ones tens hundreds", the reverse of the H T O heads every other page uses.
- **n5.** T4 §5 row 6 says "Panel 3". The page has two numbered panels and an "Another example" band, so name it
  "Another example".
- **n6.** T1 materials list "Two digit cards the same (two 7s)", but no script row uses them.
- **n7.** P2: if a round has room, make the "Another example" a different place pair (for example T / O or Th / H) and a
  different digit from the main example. Atom 7 is then shown, not only said, and D2's exit-b collision cannot recur.
- **n8.** T3 §2 note: "Band B: the same five kinds, bigger numbers." But B holds 139, 304 and 352, the bridging edge
  cases, not bigger numbers. Say "harder numbers (crossing a hundred)".
- **n9.** T5 §8 Watch quotes "2149" and "3078" without commas, while the pages print 2,149 and 3,078.
- **n10.** P4-2: 92,163 (b) and 92,715 (c) open with the same two digits; they are near-look rows on one page.
  Direction balance is 3 × "10 times" to 1 × "one tenth"; Practice 1 is 2 : 2.
