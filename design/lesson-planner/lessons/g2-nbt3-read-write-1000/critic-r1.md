# Detailed lesson 1 (g2-nbt3-read-write-1000): independent critic, round 1

Critic: Opus, medium effort, 2026-10-16. Graded cold on branch `claude/sweet-newton-c8wrv1-wip-detailed-lessons`,
pack `design/lesson-samples/detailed/g2-nbt3-read-write-1000/` (27 PNGs, seed 4242). I looked at every PNG.

## Verdict: FAIL

5 of 27 pages pass (score 8 or more on all four criteria): P4-1, P2-key, P3-key, P4-1-key and P4-2-key. Min score 4; mean 7.56.
Per-criterion min / mean: C1 6 / 7.96 · C2 4 / 6.67 · C3 5 / 7.52 · C4 7 / 8.07.

The self-check holds: I re-ran `ws-detailed-lesson --check` into the scratch dir and got 34 / 34 and
`ws-detailed-lesson: OK`, with all 27 PNGs byte-identical to the committed ones. The run printed `requestfailed` for
`css/fonts/Andika-*.woff2` (the files exist; nit N6). The automated gates are green, but the failures here are
pedagogical, consistency and pagination failures that the gates do not measure.

**The headline:** the pack's title, CCSS 2.NBT.A.3 and its own T2 all promise **words, numerals and expanded form**.
But the anchor chart (P2), I Do (T4 §5), We Do and the lesson sheet (P3) model **only numeral → expanded form**.
- Words → numeral is never modelled, yet it fills Practice 2 and the whole exit slip.
- Numeral → words appears once (P4m d, 626), untaught.
- 1,000 is never dealt anywhere, although the title says "to 1,000".
- T1 says "Flow: Chunked", but the delivery has a single I Do / We Do cycle.

## Scores

| # | Page | C1 Ease | C2 Teach | C3 Space | C4 Look | Pass | Defects |
|---|---|---|---|---|---|---|---|
| 01 | T1 Lesson at a glance | 9 | 6 | 9 | 9 | FAIL | D3 |
| 02 | T2 Atomisation | 8 | 6 | 6 | 8 | FAIL | D4, D5, D6 |
| 03 | T2-2 (continuation) | 7 | 6 | 5 | 7 | FAIL | D5, D7, D8 |
| 04 | T2b Reference key | 9 | 8 | 7 | 8 | FAIL | D9 |
| 05 | T3 Sections 1–4 | 7 | 4 | 8 | 8 | FAIL | D10, D11 |
| 06 | T4 Sections 5–6 | 7 | 4 | 5 | 8 | FAIL | D1, D3, D12 |
| 07 | T4-2 (continuation) | 8 | 5 | 5 | 8 | FAIL | D1, D12 |
| 08 | T5 Sections 7–10 | 8 | 5 | 8 | 8 | FAIL | D1, D13, D14 |
| 09 | P0 Prerequisite Check | 8 | 7 | 6 | 8 | FAIL | D15 |
| 10 | P1 Number sense | 8 | 5 | 8 | 8 | FAIL | D11 |
| 11 | P2 Anchor chart | 8 | 5 | 9 | 9 | FAIL | D1, D2 |
| 12 | P3 Lesson sheet | 9 | 6 | 8 | 9 | FAIL | D1 |
| 13 | P4-1 Practice 1 | 9 | 8 | 9 | 9 | PASS | N1 |
| 14 | P4-2 Practice 2 | 6 | 5 | 8 | 8 | FAIL | D1, D2, D16 |
| 15 | P4m-1 Mixed 1 | 7 | 6 | 7 | 7 | FAIL | D17, D18 |
| 16 | P5 Word problem | 8 | 7 | 8 | 8 | FAIL | D19 |
| 17 | P6 Exit slip | 8 | 5 | 8 | 8 | FAIL | D14 |
| 18 | P0-key | 8 | 8 | 6 | 8 | FAIL | D15 |
| 19 | P1-key | 8 | 8 | 8 | 7 | FAIL | D20 |
| 20 | P2-key (chart) | 9 | 8 | 9 | 9 | PASS | — |
| 21 | P3-key | 9 | 9 | 8 | 9 | PASS | — |
| 22 | P4-1-key | 9 | 9 | 9 | 9 | PASS | — |
| 23 | P4-2-key | 9 | 9 | 8 | 9 | PASS | — |
| 24 | P4m-1-key | 8 | 8 | 7 | 7 | FAIL | D17, D18 |
| 25 | P5-key | 8 | 8 | 8 | 7 | FAIL | D20 |
| 26 | P6-key | 7 | 8 | 8 | 7 | FAIL | D20, D21 |
| 27 | T6 Routing + glance | 6 | 7 | 8 | 8 | FAIL | D10, D22 |

Keys are graded on what the key adds: correctness, facsimile geometry and answer marking. A pupil page's C2 defect stays
on the pupil page, but the version (page + key) passes only if both do.

**Maths check.** Every key answer is correct: all 56 dealt items, and every expected answer in T3–T5 and T6, were
re-derived by hand. The exceptions are the mislabelled T3 note (D10) and the T5 Watch claim (D13). The vocabulary
match lines on P3-key are right (7–digit, H T O–place, 300 + 40 + 7–expanded form).

## Defects (every score below 8)

**D1 · critical · C2 −3 · P2, P3, T4, T4-2, P4-2, T5: the lesson teaches one of its three forms.**
- What is wrong:
  - The anchor chart's 4 steps (Write the hundreds / tens / ones / Read it with plus), its two "Another example" panels
    (509, 470), the 3 Guided and 3 Independent cells on P3, and every T4 script row are numeral → expanded form.
  - Words appear only as one Say line ("539 is five hundred thirty-nine").
  - Then P4-2 (10 items), P6 (4 items) and the T5 §8 step 3 ("Practice 2: read each name. Write the number.") ask for
    words → numeral with no model, no We Do and no Steps band.
  - T2's only words row is routine step 5 ("Words to numeral: one digit for each place"), and no page teaches it.
- Why: RUBRIC C2 ("the items do what the name says … representation drawn so it teaches"); CCSS 2.NBT.A.3 and the
  I Can name all three forms; PEDAGOGY P-1 / V22 Chunked Flow (each chunk gets its own I Do + We Do). The research
  file itself planned "Chunk 1: words → numeral".
- Fix (`js/modules/lessons/detailed/g2-nbt3-read-write-1000.js` lessonData + delivery):
  - Add a second chart chunk: a "Read the word in two parts" panel with an H T O box row
    (three hundred | forty-seven → 3 | 4 | 7), plus a zero-tens example (three hundred five → 3 | 0 | 5).
  - Add a words Guided band on P3 (★ with H T O boxes), or a P3 second section.
  - Add T4 §5b / §6b script rows that walk the dealt words items.
  - Give P4-2 its own Steps band.
- Check that proves it: P2 shows a words panel; T4 has §5a/6a/5b/6b; every P-page task appears in an I Do or We Do
  row first. Add an E-check: "every pupil-page instruction string appears in P2/P3".

**D2 · major · C2 −2 · P2, P4-2, all Practice: 1,000 is never dealt.**
- What is wrong: the pool JSON lists 56 places and none is 1000. The title says "to 1,000". The research names 1,000
  as an edge case (chart edge panel + ★★★ row), and the lesson file comment (line 31) says the last row holds
  "a 0 place, a teen ending or 1,000". SELF-CHECK E24b lists "1000" as a category but none was dealt.
- Why: RUBRIC C2 ("include the edge cases the research names"); 2.NBT.A.3 range.
- Fix: force `one thousand → 1000` into the P4-2 ★★★ row (`edge` list) and onto the chart's words panel. Make E24b
  report the edge values actually dealt, not the categories.

**D3 · major · C2 −2 · T1, T4: "Flow: Chunked" but the flow is not chunked.**
- What is wrong:
  - T1 prints `Flow: Chunked` without the count (V22 2224 requires `Flow: Chunked (4 new routine steps)`).
  - The T1 Lesson flow table has a single "5 I Do" and "6 We Do". V22's Chunked table is 5a I Do 1 / 6a We Do 1 /
    5b I Do 2 / 6b We Do 2.
  - T4 has one I Do and one We Do.
  - T2-2 states "Chunk 1: numeral to expanded form. Chunk 2: words and expanded form back to the numeral". Chunk 2
    has no delivery.
- Fix: render 5a/6a/5b/6b in T1 and T4 when `flow === 'Chunked'`, and print the count on T1. Chunk 2 content = D1.
  Alternatively, per V22 2226, propose two lessons (expanded form; words), which would also fix D1 honestly.

**D4 · minor · C2 −1 · T2 row 5: duplicated Critical-Atom text.**
- What is wrong: the Teacher Notes read "Critical Atom. The Critical Atom. A missing tens word means 0 tens."
- Cause: the role prefixes "Critical Atom." and the lesson note (line 150) starts "The Critical Atom."
- Fix: drop the prefix from the note text. Check: grep the pack for "Critical Atom. The Critical Atom".

**D5 · major · C3 −3 · T2 / T2-2: bad split, two part-empty pages.**
- What is wrong:
  - T2 ends at routine step 5 with ~25 % of its body empty.
  - T2-2 repeats the band "What students do:" only to hold the one-line flow note, then How to teach and Common
    mistakes, and leaves ~45 % of the body empty (self-check: 71 % / 58 % used).
  - V22 10.9: "Fill to ≥ 92 % of the body; continue only if it does not fit." The gold T2 (sample-v22 page-02) fits on
    one page.
- Fix:
  - Move the flow note into the routine band's foot.
  - Tighten How to teach to one paragraph (as the gold does).
  - Keep the continuation only if the content measures over one body. If it must continue, balance it so both pages
    are ≥ 92 %.
- Check: T2 used ≥ 92 %, no T2-2 (or both ≥ 92 %).

**D6 · minor · C2 −1 · T2 routine table.**
- What is wrong:
  - Step 1 ("Write the hundreds part … two zeros") is tagged Pre-requisite, but writing a hundreds part is new at Grade 2.
  - The table orders the expanded routine first, while How to teach and the research say "words → numeral first".
  - Step 3's check "Is every box filled?" is fine.
- Fix: tag step 1 New (the flow count becomes 5, still Chunked), and order the steps the way the delivery will teach
  them after D1.

**D7 · major · C2 −2 · T2-2 Common mistakes.**
- What is wrong:
  - (a) The mistake named "Gives the 0 its place" (305 = 300 + 10 + 5) reads as the correct behaviour. It is
    "Writes 10 for an empty tens".
  - (b) "Drops the 0" (35 for three hundred five) is a words → numeral error but is mapped to Step 3 (the expanded
    0-part step). "Teen or ty swap" is mapped to Step 5 while "Drops the 0" is not.
  - (c) Only 3 of 5 mistakes are linked to a Check Question option. V22 10.9 asks for one line linking each mistake to
    its Check Question option, or a statement that it is caught elsewhere (exit c, P4-2 ★★★).
- Fix: rename the mistake in the provider's `mistakes[].misconception`; map Drops the 0 to step 5; add "caught by:"
  for the two unlinked rows.

**D8 · minor · C1 −1 · T2-2 "How to teach".**
- What is wrong: the orphan line "[board icon] Board: teacher models here" gives the teacher nothing to act on.
- Fix: delete it, or replace it with the actual board model ("Board: H T O boxes, 3 | 0 | 5").

**D9 · minor · C3 −1 · T2b.**
- What is wrong: both columns end ~14 % above the body foot (85 % used; V22 10.9 asks ≥ 92 %).
- Fix: add the slot shapes this pack actually uses: the ruled words line (P4m d), the "worth ___" line and the
  ≥ 120 mm words line. Add the Number sense band labels. Measure to ≥ 92 %.

**D10 · critical · C2 cap 4 (H1 by analogy: a teacher-facing expected answer is wrong) · T3 §1 Note; T6 routing, C1 −2.**
- What is wrong (T3): it says "Expected: a. **61**, b. **1 hundred 8 tens 7 ones**, c. **5**." On P0, b is "eighty"
  (80) and c is "ninety" (90). The quoted answers belong to items e and g. A teacher marking from T3 marks b and c
  wrong.
- What is wrong (T6): the Prerequisite routing rows are "a. Number words / b. Hundreds, tens and ones / c. Value of a
  digit", but P0's items are a–h. "c." on T6 is items g–h on the page. The routing cannot be followed item by item.
- Fix:
  - In `buildDetailedLesson`, label by item letter range: "a–d. Number words → …", "e–f. …", "g–h. …".
  - Write the T3 note as the item letters the page prints ("a–d 61 · 80 · 90 · 84; e 1 | 8 | 7; g 5"), read from the
    P0 plan, not the section index.
- Check: every letter quoted on T3/T6 resolves to the P0 cell with that letter and the same answer.

**D11 · major · C2 −3 · P1 (and T3 §2): Number sense practises today's new skill before it is taught.**
- What is wrong:
  - All 10 P1 items are expanded → numeral (`combine`): band B is scrambled, and items 3, 5, 8 and 10 are zero-place
    cases. That is the lesson's new content (chunk 2), done in section 2, before the I Do in section 5.
  - T3 §2 says "Band A: put the parts together" with no model.
  - V22 9.2: "One type per row, the same five types in the same order in A and B", from the bank, about prior
    knowledge (the gold P1 mixes 1 more/1 less, missing number, compare, bonds).
- Fix: build P1 from five bank types on 2-digit / prior knowledge, in the same order in both bands: 10 more / 10 less,
  missing number in a count by 10s, compare two 2-digit numbers, tens and ones, digit value in a 2-digit number.
  Move the `combine` items to Practice.
- Check: P1 types = 5 distinct, same order in A and B; no P1 item uses a routine row tagged New.

**D12 · major · C3 −3 · T4 / T4-2: one step pushed to a continuation page.**
- What is wrong:
  - T4 ends at §5 step 8 with ~35 % of the body empty (59 % used).
  - T4-2 holds §5 step 9 alone, then §6, and is 45 % empty (55 % used). The two pages together are ~1.1 bodies.
- Why: RUBRIC C3 ("no huge empty bands"); V22 10.9 (continue only when it does not fit).
- Fix (teacher-parts pagination):
  - Let the thumbnail float beside steps 1–4 and let steps 5–9 run full width (they already do), so step 9 fits on T4.
  - Or move the thumbnail of §6 to T4-2 and balance the two pages. Once D3 adds §5b/6b, re-balance across both pages.
- Check: each delivery page ≥ 80 % used, and no section continues with a single step.
- Also: the chart's 470 panel is never scripted. Add a step for it.

**D13 · major · C2 −2 · T5 §8 Watch box: a false claim.**
- What is wrong: it says "The last row (★★★) has the 0 places." Practice 1's last row is i. 819 (a teen, no 0). The
  zero items in Practice 1 are b, d, f and h, in ★★ rows. Only Practice 2's last row (205, 303) matches.
- Fix: generate the Watch text from the dealt last rows ("Last rows: 819 (teen); 205, 303 (0 tens)"), or say "the 0
  places (b, d, f, h on Practice 1)".

**D14 · major · C2 −3 · P6 Exit slip + T5 §10: the slip does not assess what was taught.**
- What is wrong:
  - All 4 items are words → numeral (219, 330, 103, 311). Expanded form, the only thing modelled, is not assessed;
    numeral → words is not assessed.
  - "a. no 0 place" dealt 219, a teen ending, so it repeats d's case (311). The "no 0 place" case is missing.
  - The research's exit slip had 2 words, 1 expanded → numeral and 1 numeral → expanded.
- Fix: exit = (a) words, no zero; (b) words, zero tens (Critical Atom); (c) 700 + 10 + 5 = __; (d) 563 = □ + □ + □.
  Tighten `want: 'pvNoZero'` so it also excludes teen endings.

**D15 · major · C3 −2 · P0 and P0-key.**
- What is wrong: the last section ends at ~71 % of the body. A ~27 % blank band (about 65 mm) sits below g/h (68 %
  used).
- Why: RUBRIC C3 "no huge empty bands"; V22 8.11 OR-a (fill order: grow the rows, then add items).
- Fix: grow the rows to share the body (as P1 does), or add one teen word item ("thirteen", which T2 atom 1 promises:
  "and the teens" — there is no teen on P0 now) and one more unit-form item.
- Also C2 −1: b "eighty" and c "ninety" are near-identical decade words, and no teen word is checked although atom 1
  routes to it.

**D16 · major · C1 −2 · P4-2.**
- What is wrong:
  - Words → numeral uses a bare 45 mm line, with no H T O boxes. The structural scaffold that carries the Critical Atom
    ("3 boxes, 3 digits", T2 step 5's own check) is missing, and the research planned "★ chart shown, ★★ empty boxes".
  - There is no Steps band, unlike P4-1 and P4m.
  - A pupil who writes 35 for "three hundred five" gets no prompt from the page.
- Fix: use a 3-box H T O slot (B(1) × 3 with H T O letters above) for every words → numeral cell (P4-2, P6). Add a
  Steps band for the words routine.
- Check: the slot shape is the same as the chart's words panel (D1).

**D17 · major · C2 −2 · P4m-1 / its key.**
- What is wrong: item d, "Write the number in words. 626", is the only numeral → words item in the pack (half of
  "write numbers in words"). It is never modelled, and it sits under a "Number Sense" section label although it is the
  lesson's own skill.
- Fix: teach to_words in chunk 2 (D1) and give it a ★★★ row on Practice 2 (the research planned 607). Label the
  section "Words", not "Number Sense".

**D18 · minor ×3 · C1 −1, C3 −1, C4 −1 · P4m-1 / its key.**
- What is wrong:
  - (a) The strand tab reads "Level 2 / Mixed 1" (key: "Level 2 / Answer Key") with no "Place Value" line. Every other
    page carries the strand (frame rule, WDS 8 / V22 8.7).
  - (b) The page-top Steps band (the expanded routine) heads a mixed page where it applies to 2 of 5 items.
  - (c) ~15 % blank band below item e (81 % used).
- Fix: pass the strand to the mixed role's tab; put the Steps band inside the expanded section or drop it on Mixed;
  grow the rows to fill the body.

**D19 · minor · C2 −1 · P5.**
- What is wrong: the story never asks for the number in words (the research planned "Write the number in words"). The
  word problem therefore practises only expanded → numeral. The RCDWS icons are solid filled shapes, while the gold
  P5 uses outline line icons (C4 nit, not scored).
- Fix: add the line "Write the number in words." with a words slot on the answer row. The key then shows "five hundred
  three".

**D20 · minor · C4 −1 · P1-key, P5-key, P6-key: answers printed in black.**
- What is wrong: these keys print their answers in black Andika 700. P0, P3, P4 and P4m keys use the key colour
  #C2410C (self-check paints: P1-key, P5-key and P6-key lack #c2410c). V22 8.12.7 / INK-31: one key colour on every
  answer mark. The P5-key Say blank is also left empty.
- Fix: route the P1/P5/P6 plans' answers through the same `[data-ka]` marker (roles/detailed-lesson.js renderPlan).
- Check: E3 per-key "answer marks in #C2410C" = all keys.

**D21 · minor · C1 −1 · P6-key.**
- What is wrong: the left half's header reads "Answer Key", the right half's reads "Name ___" with answers filled in.
- Fix: both halves "Answer Key", or print the key once with the right half blank.

**D22 · minor · C2 −1 · T6 routing targets.**
- What is wrong: "Lesson G2 NBT 3a / G2 NBT 1 / G2 NBT 1b" are ids that exist only inside this lesson file. No lesson
  of that id exists in the site's lesson library, so the teacher cannot fetch them.
- Fix: route to real site skills/lessons (e.g. the share code or the WRM step Y2.B1.S6, and `placevalue:value` /
  `unit_form`), or print "(to be made)" honestly.

## Lower-priority nits

- N1 P4-1: 405 and 406 on one page are near-twins (same hundreds, same 0, ones differ by 1). Spread them via LR-6
  ("no twin answers"), and extend it to near-twins.
- N2 Every page footer reads `expand · Grade 2 …`: the pack is named after one of its three skills. Use the lesson id
  or "read-write 1,000".
- N3 T3 §3 spaced retrieval has 2 items (the research planned 3, incl. "seventy-two"), and its forty-one duplicates
  P0's words → 2-digit task.
- N4 T5 §9 step 3 `Say: "Sam has 503 beads."` speaks the answer as a teacher statement. Make it `Ask: "How many beads?"`
  with the Note 503.
- N5 T2b Icons table: the "Pupil Steps" row's icons wrap onto two lines.
- N6 `ws-detailed-lesson` logs `requestfailed` for `css/fonts/Andika-Regular.woff2` / `-Bold.woff2` (the files exist;
  E2 passes). Find out why, so a real font failure is not masked.

## What would raise the pack to 8+ everywhere

Fix D1 (teach words in a second chunk on P2/P3/T4) and D3 (real Chunked flow), or split into two lessons. Then:
- D10 (item letters on T3/T6)
- D11 (bank-based P1)
- D14 (exit covers all forms)
- D16 (H T O slot for words)
- D2 (deal 1,000)
- pagination D5 / D12 / D15

The remaining minors are one-line changes.
