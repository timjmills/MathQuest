# Detailed lesson 1 (g2-nbt3-read-write-1000): independent critic, round 4

Critic: Opus, medium effort, 2026-10-16. I graded it cold at commit `fdefe3a6`, branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons`. The pack is `design/lesson-samples/detailed/g2-nbt3-read-write-1000/`
(30 PNGs, seed 4242).

What I checked:
- I read every PNG.
- I re-derived every item, every key answer and every number a script quotes.
- I checked the new gate code: `refHardOk` / `refHasHard` / `isEdgeNumber(boardOnly)` in `print-sheet.js`, and E9, E9c,
  E24b and E30 in `ws-detailed-lesson.cjs`.
- I did not re-run the gate. The committed SELF-CHECK reports 37 / 37.

## Verdict: PASS (30 of 30 pages ≥ 8 on every criterion)

Lowest score per criterion: **C1 8 · C2 8 · C3 8 · C4 8**.

What changed since round 3:
- 1,000 is gone from every pupil page and key. The bound is now hard: it is never relaxed on a ref's last try.
- T2 fits on one page (93 %), and the 33 % T2-2 page no longer exists.
- The E9 exemption is reverted.
- Every key answer and every expected answer quoted on T3–T6 is correct.

Nothing is open at defect level. Three minor items and some nits are listed below. None of them takes a score below 8.

## Open items from round 3

| # | Status | Evidence (round 4) |
|---|---|---|
| S1 1,000 leak | **Fixed** | P4-2 is now 482 · 798 · 423 · 921 · 532 · 430 / last row 207 · 514. Every slot is a 3-box H T O; there is no Th box anywhere. The T6 glance and T5 §8 Watch quote 207 and 514. The lesson declares `boardOnly: [1000]` (line 71). `refHardOk` rejects a candidate whose number or answer digits are in `boardOnly`, and it checks `maxNum` / `minNum` with no last-try relaxation. `isEdgeNumber` drops a board-only value. E30 scans the pool and the body text of every pupil page and key for the digits (with or without a comma) and the name. 1,000 appears only on T4-2 §5b steps 6–7 (board) and in the I Can title. That follows the ruling, and the P2b Rule "Three boxes, three digits" now holds. |
| S2 T2-2 fill | **Fixed** | T2 is one page at 93 %: 7 atoms, 5 routine rows, a one-line "Rows tagged New" line, a 2-sentence How to teach plus the Board line, and 6 mistakes on one row each. There is no T2-2. |
| S2 E9 exemption | **Reverted** | E9 holds every page to ≥ 50 % and has no carve-out. The new E9c holds a teacher page that continues to ≥ 92 % (V22 3131). Today that is only T4 → T4-2: T4 92, T4-2 93. This is sound and stricter than before. |
| S3 concatenation numbers | **Fixed** | T2 "Parts side by side" now reads 80039 for 839, and T6 reads "80039 for eight hundred thirty-nine". Both are correct side-by-side forms (800 \| 39). RESEARCH.md line 52 is corrected to 300407 / 30047 for 347 and 3007 for 307. |
| R7 atom-1 note / strip | **Fixed** | Atom 1 reads "21 to 99" and matches P0 a–d (61, 80, 98, 84). The P0 trailing strip is gone: P0 is 92 % used and its rows have grown. |
| N1 405 / 406 | **Fixed** | P4-1 has 405 only. The new near-twin rule (E24b: same representation, within 2) is checked, and no page has a near twin. |
| Nit: P4m-1 strip | Fixed | P4m-1 is full (95 %), with 9 items in 5 bands. |
| Nit: Mixed 1 unscripted | Fixed | T5 §8 step 1: "Mixed 1 is homework." |
| Nit: T4 / T4-2 fill | Fixed | T4 is 92 % and T4-2 is 93 %. |
| Nit: "Digits, not values" step | Fixed | It is now mapped to Step 1 in T2 Common mistakes. |
| Nit: teens never checked on P0 | Open (nit) | P0 a–d are still 21–99 words. P0 f (116) has a 1 ten but no teen word. |
| Nit: P1 item-10 badge | Open (nit) | The "10" badge still touches "Write". |
| Nit: P5 RCDWS icons | Open (nit) | The first four icons are solid fills and the last two are outlines. |
| Nit: "4,000" comma | Open (nit) | T5 §7 option C and T2 "One place too big" print "4,000", while the board writes 1000. |

The follow-on ruling for writing number names is still carried out cleanly: no pupil page asks a pupil to write a number
name.

Observation (not this lesson's defect): `standards-audit.js` line 94 already marks 2.NBT.A.3 **full**, from older
skills (`number_word_form` …). This lesson did not flip it. Whether that skill-level verdict is right is a question for
the standards lane.

## Scores (0–10; PASS = every criterion ≥ 8)

| # | Page | C1 | C2 | C3 | C4 | Pass | Notes |
|---|---|---|---|---|---|---|---|
| 01 | T1 Lesson at a glance | 9 | 9 | 9 | 9 | PASS | n4 |
| 02 | T2 Atomisation | 9 | 9 | 9 | 9 | PASS | — |
| 03 | T2b Reference key | 9 | 8 | 9 | 9 | PASS | — |
| 04 | T3 Sections 1–4 | 9 | 9 | 9 | 9 | PASS | n3 |
| 05 | T4 Sections 5a–6a | 9 | 9 | 9 | 9 | PASS | — |
| 06 | T4-2 Sections 5b–6b | 9 | 9 | 9 | 9 | PASS | — |
| 07 | T5 Sections 7–10 | 9 | 8 | 9 | 8 | PASS | m2 |
| 08 | P0 Prerequisite Check | 9 | 8 | 9 | 9 | PASS | n1 |
| 09 | P1 Number sense | 9 | 9 | 9 | 8 | PASS | n2 |
| 10 | P2 Anchor chart 1 | 9 | 9 | 9 | 9 | PASS | — |
| 11 | P2b Anchor chart 2 | 9 | 9 | 9 | 9 | PASS | n5 |
| 12 | P3 Lesson sheet 1a | 9 | 9 | 9 | 9 | PASS | — |
| 13 | P3b Lesson sheet 1b | 9 | 9 | 9 | 9 | PASS | — |
| 14 | P4-1 Practice 1 | 9 | 9 | 9 | 9 | PASS | n6 |
| 15 | P4-2 Practice 2 | 9 | 9 | 9 | 9 | PASS | n6 |
| 16 | P4m-1 Mixed 1 | 9 | 8 | 9 | 8 | PASS | m2, n6 |
| 17 | P5 Word problem | 9 | 8 | 8 | 8 | PASS | n2 |
| 18 | P6 Exit slip | 9 | 8 | 8 | 8 | PASS | m2 |
| 19 | P0-key | 9 | 8 | 9 | 9 | PASS | — |
| 20 | P1-key | 9 | 9 | 9 | 8 | PASS | — |
| 21 | P2-key | 9 | 9 | 9 | 9 | PASS | — |
| 22 | P2b-key | 9 | 9 | 9 | 9 | PASS | — |
| 23 | P3-key | 9 | 9 | 9 | 9 | PASS | — |
| 24 | P3b-key | 9 | 9 | 9 | 9 | PASS | — |
| 25 | P4-1-key | 9 | 9 | 9 | 9 | PASS | — |
| 26 | P4-2-key | 9 | 9 | 9 | 9 | PASS | — |
| 27 | P4m-1-key | 9 | 8 | 9 | 8 | PASS | — |
| 28 | P5-key | 9 | 8 | 8 | 8 | PASS | — |
| 29 | P6-key | 9 | 8 | 8 | 8 | PASS | — |
| 30 | T6 Routing + glance | 8 | 8 | 9 | 8 | PASS | m1 |

## Defects

No score is below 8, so there are no numbered defects. The three minor items below are worth fixing in the next
touch.

**m1 · minor · T6 Accepted answers: two rows contradict the lesson.**
- **"400 + 6 is also right."** The Critical Atom (T2 step 3) is "A 0 place: write 0 for its part", and it is checked
  with "Is every box filled?". The Rule is "Every place gets a part". Accepting an empty tens box on a 3-box page undoes
  this at marking time.
- Fix for that row: "On the 3-box pages the 0 box is filled (400 + 0 + 6). Elsewhere 400 + 6 is also right."
- **"Number words with or without the hyphen."** This row is stale: no pupil writes words in this lesson.
- Fix for that row: drop it, or move it to the follow-on lesson.

**m2 · minor · P4m-1 b and P6 c: expanded form → numeral is assessed but never modelled.**
- The pages: P4m-1 b is 700 + 80 + 9 = ___, and P6 c is 100 + 40 + 8 = ___. P5 also uses 500 + 0 + 3 = 503.
- What the lesson teaches: chunk a is declared numeral ↔ expanded form. But T4 §5a, P2 and P3 teach only numeral →
  expanded form. Step 4 "Read it with plus" reads the parts aloud; it never composes them into the numeral.
- Why it is minor: the item is easy, and P2 step 4 prints "So 539 = 500 + 30 + 9".
- Fix: add one T4 §6a step: "Point to 500 + 30 + 9. 'What number is it?' Expected: 539", plus the reverse Say. Or swap
  P6 c for a second name → numeral item with a 0 ones (for example "four hundred sixty").

**m3 · minor · T1 row 8 vs T5 §8: Mixed 1 is listed in-lesson but scripted as homework.**
- T1 row 8 lists "Practice 1–2, Mixed 1" inside the 9 minutes. T5 §8 step 1 says "Mixed 1 is homework."
- Fix: T1 row 8 → "Practice 1–2 (Mixed 1: homework)".

## Nits (not scored)

- n1: P0 a–d check only 21–99, but the lesson deals 811, 819, 514 and 116. One teen word in a–d (for example
  "fourteen") would route the teen/ty atom too.
- n2: The P1 item-10 badge touches "Write". The P5 RCDWS icons mix solid and outline.
- n3: T3 §4 "Today we write numbers three ways." Pupils *write* two ways and *read* the third (the ruling). Say: "Today
  we read and write numbers three ways."
- n4: T5 §7 C and T2 print "4,000" with a comma, while the board form is "1000". Either form is fine, but pick one.
- n5: P2b uses straight quotes ("five hundred") where every other page uses curly quotes.
- n6: Variety:
  - P4-1 deals 270 and 278 (same H and T).
  - P4-2 has three 4-hundreds (482, 423, 430).
  - P4m-1 has four 2-hundreds (289, 227, 239, 261).
  - None of these breaks E24b's within-2 rule. A "same first two digits" near-twin (|a − b| < 10 and the same H T)
    would catch 270 / 278.
- n7: T4-2 is a continuation page without the I Can title. This is consistent with the kit and was accepted in r2 and
  r3. I note it only so the gold comparison stays explicit.

## Gate sanity

- **E30** is sound. It checks the pool's dealt items and answers, then the digits (comma-aware) and the name on every
  pupil and key body. The title is excluded, because it is frame and not body.
- **E9c** is sound. It covers only a teacher page followed by its own continuation, at ≥ 92 %.
  - Suggestion: also list T1 / T6 / the last page of a group at ≥ 50 %. E9 already covers them.
- **E24b's** near-twin rule is good, but narrow (n6).
- **refHardOk** closes the r3 root cause: the last-try relaxation can no longer cross `maxNum` or `boardOnly`.
