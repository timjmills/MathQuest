# g3-oa5-mult-properties — research and V22 content

Lesson 3 of 5 · Grade 3 · owner title: "Properties of multiplication: commutative, identity and distributive".
Phase B content research, round 1. No code changed.

## 0. Scope decision (read first)

Three properties in one 60-minute SPED lesson is three new ideas, which breaks PED P-1 (one new thing per
step). V22 "Chunked Flow" says to first ask whether the content should be split into more lessons. Each
property is its own Conceptual atom, with its own picture (turned array, one-row array, split array) and
its own misconception. That makes 6+ New routine rows, so even Chunked Flow would be overloaded.

**Recommendation: a 3-lesson sequence (3a, 3b, 3c). This pack is 3a.**

| Lesson | I Can | New thing | Picture |
|---|---|---|---|
| **3a (this pack)** | I can turn an array to multiply. | commutative: a × b = b × a | an array and the same array turned |
| 3b | I can multiply by 1 and by 0. | identity (× 1). × 0 is the contrast (NOT a second property to learn) | 1 row of n; n groups of 1; empty groups |
| 3c | I can break apart an array. | distributive: 7 × 6 = 5 × 6 + 2 × 6 | an array split at the fives line |

3c comes after 3a/3b because it needs "the turned fact is the same" and fluent 5 × n facts. Associative
(3 × 5 × 2) is not in this sequence; it is build-list entry `mult_three`. Treat it as a later lesson.

Owner question Q1 asks for the split. Q2 asks about the title (§5).

## 1. Tags

- Grade 3 · Domain: Operations & Algebraic Thinking · CCSS **3.OA.B.5** (commutative part). Also builds on 3.OA.A.1 and 2.OA.C.4.
- EE: none at this grade. DLM note: use **M.EE.N.CN.2** as the access point. `SKILL_STANDARDS['multiplication:mult_properties']` has `ee: []`.
- WRM: **Y3.B4.S3 "Reasoning about multiplication"** (2.OA.C.4, 3.OA.B.5), which is the step `mult_properties` is mapped to in `js/modules/wrm.js`. **Y3.B3.S2 "Use arrays"** is the prerequisite step. Also Y3.B3.S15 "The 2, 4 and 8 times-tables" (3.OA.B.5). No site lesson id is known.
- `standards-audit.js:120` rates 3.OA.B.5 as partial: associative is missing and closed by `mult_three`. That is outside this sequence.

## 2. Research findings (CLAUDE.md questions 1–11)

Sources consulted (public pages, no logins):
- mathworksheets4kids.com/multiplication/properties.php — **404**. The primary site could not be reached without logging in. This is a gap: look at it again during a logged-in research pass.
- ixl.com/math/grade-3/properties-of-multiplication — the page name confirms the skill exists. The items cannot be seen without logging in.
- [Teach Simple – Commutative property 3rd grade](https://teachsimple.com/product/commutative-property-of-multiplication-3rd-grade): array sets first, then numeric-only sets with no arrays (CRA fade).
- [Happy Numbers G3 M1 Topic C](https://happynumbers.com/demo/cards/302914/): "analyzing arrays" items. They pair two sentences with the factors reversed, both giving the same product.
- [Super Teacher Worksheets 3.OA.5](https://superteacherworksheets.com/common-core/3.oa.5.html): property-by-property sheets. The distributive sheet uses split arrays.
- [Education.com multiplication properties](https://nextjs.education.com/resources/grade-3/math/multiplication/multiplication-properties/?q=proper+1): commutative practice with arrays. Distributive is a separate set.

1. **Problem types:** (a) write two facts for one array; (b) match an array to its turned array; (c) "if 4 × 6 = 24, then 6 × 4 = __"; (d) fill a missing factor in a × b = b × __; (e) true/false a × b = b × a; (f) use a known fact to solve a harder turn (2 × 9 → 9 × 2).
2. **Visuals:** dot arrays and the same array rotated a quarter turn. Grid paper. Equal-groups pictures appear on mainstream sheets as well, but they mislead here (see Q10).
3. **Answer formats:** number boxes in a frame `[ ] × [ ] = [ ]`. Mainstream sites add MC/true-false; for us those belong on Reason It pages only.
4. **Progression:** concrete (counters on a tray, turn the tray), then pictorial (array + turned array), then abstract (facts only). Every source we saw fades the arrays at the end.
5. **Edge cases:** square arrays (3 × 3 turn into themselves, so the fact only looks "the same"). A 1-row array (1 × 5 ↔ 5 × 1) previews 3b. Never use a pair where a = b on the I Do. Avoid products the pupils cannot yet count (keep to ≤ 5 × 5 on pictures; the 6–9 rows come in the abstract row only).
6. **One thing that changes:** from Y3.B3.S2 (an array gives "rows × in each row"), the ONE new thing is **turn it, and the product stays the same**. Writing the second fact is the same writing the pupil already does.
7. **Structural scaffolds:** the two-frame cell `[ ] × [ ] = [ ]` / `[ ] × [ ] = [ ]`, plus the drawn arrays on Guided cells and most of Independent. **Hint scaffolds that fade:** the curved "turn" arrow between the arrays, grey traced first fact, and a pre-filled product in the second frame.
8. **Written response:** numbers in boxes only. On screen it is the same boxes (inline-blanks). It is never MC.
9. **Say:** "__ rows of __ is the same as __ rows of __." Then: "__ times __ equals __ times __." The second frame has 2 visible number blanks, because the first two are filled in on the chart.
10. **Misconceptions:** M1 the turned array has a different total, so they count it again or write a new product. M2 they copy the first fact unchanged (no swap). M3 they swap the product into a factor position (4 × 24 = 6). M4 equal groups ≠ turned groups in a story: 3 bags of 5 is not 5 bags of 3, even though the products match. The property is about the number, not the story.
11. **Page fit:** a two-array cell is wide. At L, use 2 columns × 3 rows = 6 cells, with pictures ≤ 5 × 5 (fits PIC_BOX). The arrays template already closes up the pitch to fit.

**Where our standards override the sources:** mainstream sheets use colour (two-colour arrays) and 12–20 items. We use black dots only, 6 cells, and the turn shown by position plus an arrow, not by colour. Sites mix all properties on one sheet. We teach one per lesson (P-1).

**RP-21 / E27 and arrays:** RP-21 ("tidy rows of at most 5, gap after the 5th in a row of 10") is about counters that stand for a number. In an array, the rows are part of the meaning. So: keep this lesson's pictured arrays at **≤ 5 rows and ≤ 5 in each row**. That satisfies RP-21 on its own terms and matches `arrays_groups`, which already caps at 5 × 5 (2.OA.4). Where 3c needs 6–10 columns, the fives gap *is* the split line (7 = 5 + 2). That is a reason to put the break-apart at 5 in 3c. E27 checks `counters()`'s `data-per-row`; the `arrays` template does not write that attribute. The maker should either emit `data-per-row=cols` on array SVGs or exempt arrays from E27 by rule (the brief author decides).

## 3. Skills

Generator evidence: `js/modules/gen-operations.js:4142-4310` (`mult_properties`).
- It has 4 forms (`forms` option: 0 order, 1 breaking apart, 2 × 1, 3 × 0) and `pictures` on/off.
- Commutative deals a, b in 2..9, text `If a x b = P, what is b x a?`, a number answer. **Defect:** the answer is in the prompt (catalogue mult-div-integers.md:10, MU-A7).
- The visual is **legacy coloured HTML** (accent-green/orange, a "Commutative Property" title that names the rule). There is **no q.cell**, and arrays up to 9 × 9.
- Samples from the code: "If 7 x 3 = 21, what is 3 x 7?" → 21. "If 2 x 9 = 18, what is 9 x 2?" → 18. Distributive: "6 x 4 = 2 x 4 + ___ x 4" → 4.

`arrays_groups` (`gen-operations.js:4062-4136`) deals rows and cols in 2..5. The frame is `___ rows of ___ make ___ in all.`. It **accepts both orders** (acceptedSets), emits `q.cell {template:'arrays'}`, and the key is filled. Samples: 3 rows of 4 → 3, 4, 12. 5 rows of 2 → 5, 2, 10.

| Skill | Options | Role | Verdict |
|---|---|---|---|
| `multiplication:mult_properties` | `forms:[0]`, `pictures:true` | main practice (the tagged 3.OA.B.5 skill) | **needs redo + option** (proposal P-A): the prompt gives the answer away, it is legacy colour, and it has no kit cell. Do not print it on P3/P4 until fixed. |
| `multiplication:arrays_groups` | `forms:[0]` (arrays) | **meanwhile main practice** (pupil writes both orders on the board); P0 item 2; We Do | fits |
| `multiplication:dot_array_mult` | default | number sense B / spaced retrieval | fits (B&W) |
| `multiplication:repeated_add_to_mult` | band 25 | P0 item 1 (rows as repeated addition) | fits |
| `multiplication:count_by_tables` (Count by 1–12) | 2, 5, 10 | number sense A | fits |
| `multiplication:mult_facts` | constant 2, 5 or 10, notation x | P0 item 3, mixed partner, number sense B | fits |
| `multiplication:mult_word_problems` | array stories (`_wpMul`) | P5 | fits as content. Its catalogue defect (dead rotation branches) does not touch array stories. Check the dealt variant is "rows". |
| mixed partner | `arrays_groups` + `mult_facts` (2/5/10) | P4 mixed | fits |

**Proposal P-A (BUILD_LIST style) — `mult_turn_array` as a redo of `mult_properties` form 0** (catalogue variant `commutative`; keep the id, no splice)
- id: `multiplication:mult_properties`, `forms:[0]`, redone. Grade 3. CCSS 3.OA.B.5 (+ 3.OA.A.1). EE none (DLM M.EE.N.CN.2). WRM Y3.B4.S3.
- Problem types: (1) one array + its turned twin, write both facts `[ ]×[ ]=[ ]` twice; (2) known fact printed with **no product given for the turn**: "4 × 6 = 24" → `6 × 4 = [ ]` with the array still shown (the product is in the known fact on purpose; that is the use of the property, and it is not a leak, because the item asks for the *turned* fact); (3) missing factor `5 × 3 = 3 × [ ]`; (4) facts only, no picture (★★★), factors up to 9.
- Template: `arrays` with a new `kind:'turn'` (two arrays side by side, an optional grey curved arrow as the hint scaffold, two three-box frames), plus `equation` for type 4.
- Options: `forms` (types 1–4), `pictures` (on/off), `support` (`arrow` | `none`), band 25 / 81.
- Misconceptions: M1–M3 above. Say: "__ times __ equals __ times __."
- Search terms + SKILL_STANDARDS already exist (keep). Closest skill meanwhile: `arrays_groups forms:[0]`.

Providers: no `sheet/providers` entry for `mult_properties` was found, so the anchor chart's `workedSteps` must come from this file (§4 I Do).

## 4. The V22 content (lesson 3a)

**I Can title:** I can turn an array to multiply. (31 chars)
**CRA stage:** C → P (counters on a tray for the hook, then dot arrays). Abstract only in the ★★★ row.
**Flow:** Standard (2 new routine steps).

**Routine steps (P2/P3 panel):**
1. `look` — Look at the array.
2. `write` — Write the fact. (rows × in each row)
3. NEW icon `turn` — Turn the array. (Appendix H: a 10 × 10 box; a 3/4-circle arc with an arrowhead, 2 strokes, no letters.)
4. `write` — Write the new fact.
5. `check` — Check: same product.

Chant: none. The `Say:` frame does the work. A chant would add words (prereqs.js precedent).

**Vocabulary (≤ 3):**
| word | gloss | mini-diagram |
|---|---|---|
| array | dots in equal rows | 2 rows of 3 dots |
| row | a line of dots across | 1 row of 4 dots, bracket under it |
| turn | move it a quarter way round | a 2 × 3 array, an arc arrow, the 3 × 2 array |

**Remember (NEW C.4 line):** "Remember: turn the array, the total stays the same. Do NOT count again." (Keep as a Rule line; it is one contrast.)

**T2 atoms**
| # | Key name | Type | Teacher notes |
|---|---|---|---|
| 1 ★ | Row: "a row goes across" | Category | Pre-requisite. Non-examples: a column, a ring of dots. |
| 2 ★ | Array fact: "rows × in each row = total" | Task | Pre-requisite (Y3.B3.S2). 3 rows of 4 → 3 × 4 = 12. |
| 3 ★ | Count by 2, 5, 10 | Fact | Pre-requisite. Used to find the total fast. |
| 4 ★ | × means "groups of" / "rows of" | Fact | Pre-requisite. |
| 5 | Turned array: "the rows become the columns" | Comparative | New. Before/after pairs: same dots, turned (PPNN with arrays that gain or lose a dot as the Ns). |
| 6 | Same product: "turning does not change how many" | Conceptual [Critical Atom] | New. WHY: no dot was added or taken away. |
| 7 | Known fact gives the turned fact: "if 4 × 6 = 24 then 6 × 4 = 24" | Task | New. Use the fact, do not recount. |

**T2 routine table**
| Step | Task | Tag | Check it with |
|---|---|---|---|
| 1 | Look at the array; count rows and how many in each row | Pre-requisite | MWB: 3 rows of 5 — "how many rows?" |
| 2 | Write the fact | Pre-requisite | MWB: write the fact for 2 rows of 4 |
| 3 | Turn the array (rows become columns) | Pre-requisite (drawing/turning is known from 3D/shape work; teach it as the atom-5 sequence) | Hold a tray: "how many rows now?" |
| 4 | Write the new fact | New | MWB: turned fact for 3 × 5 |
| 5 | Same product — no recount [Critical Atom] | New | "Did we add a dot? Write the total." |

New = 2 → Standard flow.

**How to teach:** Hook with a real tray of 12 counters (3 × 4). Turn it physically. The pupils count once and see it again: same 12. Then show the picture, the turned picture, and the two facts. Teach atom 5 with PPNN pairs and atom 6 with a WHY prompt *before* the I Do. Keep the first examples non-square and with no repeated digit.

**Common mistakes**
| Mistake | Broken step | Looks like | Fix | Check Q option |
|---|---|---|---|---|
| Recounts or writes a new product | 5 | 3 × 4 = 12, 4 × 3 = 13 | Point to the arrows: "Did a dot move away?" | B |
| Copies the fact without swapping | 4 | 3 × 4 = 12 twice | Count the rows of the turned array aloud | C |
| Swaps the product into a factor | 4 | 4 × 12 = 3 | Box map: the product is always last | (spot on T6) |
| Thinks 3 bags of 5 = 5 bags of 3 in a story | conceptual | the wrong picture on P5 | Same number, different story: draw both | — |

**T1 boxes:** Tip: "Turn a real tray first. Then the picture." · Tip: "Never use a square array in the I Do." · Watch: "Recounting the turned array: that means atom 6 is not yet secure."

**Materials:** 12 counters on a tray or a card per pair, MWBs, P-pack, a sheet of dot paper for the board.

**P0 prerequisite check (most basic first)**
| # | Atom | Skill ref | Item kind | If missed → |
|---|---|---|---|---|
| 1 | row | `arrays_groups` | circle one row of a 3 × 4 array | 2.OA.C.4 Use arrays (WRM Y3.B3.S2) |
| 2 | array fact | `arrays_groups forms:[0]` | `[ ] rows of [ ] make [ ]` for 2 × 5 | 2.OA.C.4 Use arrays |
| 3 | count by 5 | `count_by_tables` 5 | 5, 10, __, __ | 2.NBT.A.2 Count by 5s and 10s (Y3.B3.S4) |
| 4 | × fact | `mult_facts` 2 | 4 × 2 = [ ] | 3.OA.A.1 Equal groups (Y3.B3.S1) |

**Number sense:** Band A (5): count by 2 / 5 / 10 strips (`count_by_tables`). Band B (5): dot arrays up to 5 × 5, write the total (`dot_array_mult`).

**Spaced retrieval (MWB, earlier content):** 5 × 3 = 15 · 2 × 6 = 12 · 3 groups of 4 = 12.

**Chaining bridge:** "Yesterday: an array gives a fact. Today: one array gives two facts."

**I Do (anchor chart):** Panel 1: **3 rows of 4** → 3 × 4 = 12. Turned: 4 rows of 3 → 4 × 3 = 12. Non-square, no repeated digit, a product they can count. Panel 2 (vary one thing, the size): 2 rows of 5 ↔ 5 rows of 2 = 10. Panel 3 (known fact): 4 × 5 = 20, so 5 × 4 = [20], with the array drawn.
Worked steps for the chart: Look: 3 rows, 4 in each row. Write: 3 × 4 = 12. Turn: now 4 rows, 3 in each row. Write: 4 × 3 = 12. Check: same 12.

**We Do:** 2 rows of 3 (shared, pupil says each step), then 5 rows of 3 (pupils lead, teacher only checks). Fade: the turn arrow is printed on the first, missing on the second.

**Check Question:** The array shows 2 rows of 5. 2 × 5 = 10. Pupils write 5 × 2 = ? Options: A 10 (right) · B 12 (recount / M1) · C 2 × 5 (copy, no swap / M2).

**You Do (P3 Independent + P4):**
- ★: an array + its turned array, both frames, arrow printed.
- ★★: arrow gone, turned array still drawn.
- ★★★ (last row): known fact with no picture (`7 × 3 = 21`, so `3 × 7 = [ ]`), missing factor `4 × 5 = 5 × [ ]`, and one 1-row array (1 × 4 ↔ 4 × 1, a preview of 3b).
- Avoid: squares (a × a) except one as a ★★★ "does it change?" item; 1 × n outside the last row; any a = product.
- **Pool (LR-5):** ordered pairs (a, b), 2 ≤ a, b ≤ 5, a ≠ b → 12 ordered pairs, 6 unordered. Each unordered pair is dealt once per page, in a random direction. That is too few items for P4 ×2, so P4 widens to the abstract row with factors up to 9 (2 ≤ a ≠ b ≤ 9 → 28 unordered pairs).

**P5 word problem (our story):** "A box has 3 rows of eggs. There are 5 eggs in each row." Q: "How many eggs? Write two facts." RCDWS: Read the story · Circle 3 and 5 · Draw the array · Write 3 × 5 and 5 × 3 · Solve: 15 eggs.

**P6 exit slip (4):** (1) an array of 2 rows of 4 → both facts. (2) 5 × 3 = 15, so 3 × 5 = [ ]. (3) 2 × 5 = 5 × [ ]. (4) 4 rows of 3, turned, write the total.

**Delivery scripts (T-SCRIPT, numbers from the generator)**
1. Prereq check — Do: hand out P0. Say: "Do number 1. Circle one row." Note: 80% → go on.
2. Number sense — Do: band A/B. Say: "Count by {ns.step}."
3. Retrieval — Ask: "{sr.a} times {sr.b}?" Do: MWB up.
4. Bridge — Say: "One array. Two facts. Same answer."
5. I Do — Do: tray of {chart.rows} × {chart.cols}. Say: "{chart.rows} rows of {chart.cols} is {chart.total}." Do: turn it. Say: "{chart.cols} rows of {chart.rows} is {chart.total}." Ask: "Did a dot move away?"
6. We Do — Ask: "How many rows now?" Say: "__ times __ equals __ times __."
7. Check Q — Do: A/B/C on fingers. Note: B → reteach atom 6; C → reteach atom 5.
8. You Do — Do: P3 then P4. Note: circulate at ★★.
9. Word problem — Say: "Read. Circle. Draw. Write. Solve."
10. Plenary — Do: exit slip. Say: "Turning does not change the total."

Feedback/watch box per section: §5 "Turn slowly: let them see no dot leaves." §7 "Any B means atom 6 is not secure." §8 "Watch for pupils who recount every array."
**T-LOOP after the Check Q and the exit slip:** ≥ 80% → go on. 50–79% → a reteach group on atom 6 with the tray. < 50% → the whole class repeats We Do with a new pair.

**T6 routing**
| Question | Prerequisite atom | If missed → |
|---|---|---|
| P0-1 | row | 2.OA.C.4 Use arrays |
| P0-2 | array fact | 2.OA.C.4 Use arrays |
| P0-3 | count by 5 | 2.NBT.A.2 Count by 5s |
| P0-4 | × fact | 3.OA.A.1 Equal groups |

Accepted answers: on the two-fact items the pupil can give the facts in either order (accept 4 × 3 first, then 3 × 4). On the P5 eggs story accept 3 × 5 or 5 × 3 first.
Wrong answers to look for: 4 × 3 = 13 (recount, M1) → tray demo. The same fact written twice (M2) → count the turned rows. 3 × 12 = 4 (M3) → box map.

## 5. Owner questions

- **Q1 Scope:** split into 3a turn (commutative) · 3b × 1 and × 0 · 3c break apart (distributive)? **Recommend yes.** If kept as one, it would need Chunked Flow with 6+ new rows, which breaks P-1.
- **Q2 Title:** keep "Properties of multiplication" as the sequence title, and give each lesson its own: "Turn it: the order property" (3a), "Times 1 and times 0" (3b), "Break apart to multiply" (3c). **Recommend yes.** Pupil-facing I Can lines are as in §0.
- **Q3:** OK to fix `mult_properties` form 0 under its existing id (proposal P-A) and use `arrays_groups` meanwhile? **Recommend yes.**
- **Q4:** Pictured arrays capped at 5 × 5 (RP-21), 6–9 only in the abstract row? **Recommend yes.**
- **Q5:** NEW C.4 line "Remember: turn the array, the total stays the same. Do NOT count again." and NEW C.1 key `turn-facts`: "Look at the array. Write two facts." (6 words). Approve? **Recommend yes.** No C.1 string covers two facts per picture; `array` is the closest.
