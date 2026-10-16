# g3-oa9-mult-table-patterns — Patterns on the multiplication table (Lesson 4 of 5)

Research + content for the V22 detailed lesson maker. Phase B content research, round 1. No code changed.

## 1. Tags

| Field | Value |
|---|---|
| Grade | 3 |
| CCSS | **3.OA.D.9** (primary: identify arithmetic patterns in the multiplication table and explain them with properties, e.g. "4 times a number is always even"); 3.OA.C.7 (fluency within 100, practised through the chart) |
| EE | M.EE.3.OA.9 (identify arithmetic patterns) as the brief gives it. **Note:** the repo's `SKILL_STANDARDS` tags every candidate skill `M.EE.3.OA.8`, and `build-list.js` `patterns_notice` also uses `M.EE.3.OA.8`; see Owner question 1. For 3.OA.7 the DLM note points to M.EE.7.NS.2.a / M.EE.7.NS.2.b. |
| WRM | none for this lesson (CCSS BUILD lesson in the pacing guide). `data/curriculum/wrm-steps.json` cites 3.OA.D.9 on 2 steps only; `wrm.js` maps `mult_chart` to Y4.B4.S6 (partial, the 3/6/9 links) and `mult_chart_easy` to Y2.B5.S17, neither of which is this lesson. |
| Domain | Operations & Algebraic Thinking (MathQuest: Number & Operations, multiplication) |
| Audit | `standards-audit.js` line 124 marks 3.OA.D.9 PARTIAL, missing clause "explain a pattern with a property (4 × n is always even)", closed by build-list entry `patterns_notice`. This lesson teaches exactly that missing clause. |

## 2. Research findings

**Sources consulted (public pages only, no logins):**
- Illustrative Mathematics task 956, "Patterns in the multiplication table": colour the even products in a 1–6 table, then explain the checkerboard. https://tasks.illustrativemathematics.org/content-standards/3/OA/D/9/tasks/956
- IM K–5 Grade 3 Unit 4 Lesson 9, "Patterns in the Multiplication Table": rows go up by the row number, 15 appears twice (3 × 5, 5 × 3). https://im.kendallhunt.com/k5/teachers/grade-3/unit-4/lesson-9/lesson.html
- Chalkie, "Patterns in the Multiplication Table": a 6 × 6 chart, why the 4s row is all even, doubling from 2s to 4s. https://chalkie.ai/en/library/worksheets/3rd-grade-math/multiplication-and-division/multiplication-table-patterns
- 3.OA.D.9 sample sheet: 12 × 11 is even because 132 = 66 + 66, two equal addends. https://auyzsqchoiyjyrbswkhv.supabase.co/storage/v1/object/public/standards-worksheets/ccss-math/3-oa-d-9.pdf
- Match Fish Tank Grade 3 Unit 3 Lesson 22 (patterns in the table). https://www.matchfishtank.org/curriculum/math/3rd-grade/multiplication-and-division-part-2/lesson-22/
- CPALMS MAFS.3.OA.4.9 (the standard's examples). https://cpalms.org/PreviewStandard/Preview/5363
- WCCUSD "Mastering the multiplication table" Grade 3 lesson; Cazoom partial tables (fact recall rather than patterns).
- MathWorksheets4Kids and IXL: their public pages did not come up in search and I did not log in, so I have no page from them to cite. The usual MW4K grammar (shade multiples on a chart, "even or odd?" sorts, complete a row) matches the sources above. Before build, someone should check the logged-in MW4K page and IXL "Multiplication patterns" / "Even and odd products". **Uncertain.**

**Q1 Problem types.** (a) Colour or shade the even products on a chart (IM 956, the core item). (b) Is n × m even or odd? Check a box. (c) Complete a row or column. (d) Explain: "Why is 4 × n always even?" using doubles or equal addends. (e) True / False or Always / Sometimes / Never: "even × odd is odd". (f) Find a number in two places (commutative; this belongs to lesson 3).
**Q2 Visuals.** A chart cut down to 6 × 6 or smaller, shaded boxes, an equal-addends bar (28 = 14 + 14), pairs of counters for "even".
**Q3 Answer formats.** Shade or tap, check box Even/Odd, write the product, a reason chosen from a bank. Sites ask for free-written explanations. **We override that:** the pupil picks a reason from a printed bank and says the frame aloud. There are no explanation lines (low writing load).
**Q4 Progression.** Concrete (pairs of cubes in the 2 and 4 rows) → pictorial (shaded chart window) → abstract (even/odd check for a fact with no chart).
**Q5 Edge cases.** 0 is even (0 × n = 0; out of scope, our chart starts at 1). The 1 row alternates odd/even. Odd × odd is always odd (9 × 7 = 63). Even × odd is even (4 × 7 = 28). Products like 10 and 12 show up in both odd and even rows (2 × 5, 5 × 2), which can make pupils think the 5 row is even. Two-digit products: the ones digit decides (36 is even, 35 odd). Pupils who judge parity by the tens digit get these wrong.
**Q6 Which ONE thing changes?** The new thing is: **a product in an even row (or even column) is always even.** The pupil already knows even/odd (2.OA.C.3) and how to read the chart. Odd × odd → odd is only the ★★★ contrast at the end, not taught as a second rule. I chose parity over the alternatives because: symmetry/commutative is lesson 3 (properties); "a row goes up by its number, write the rule" is the input-output rule of lesson 5; "×5 ends in 0 or 5" and "×10 ends in 0" are ones-digit patterns of single tables, which is a different idea. Parity is the standard's own example, it is the audit's missing clause, and it has a concrete explanation a SPED pupil can see: 4 × n = (2 × n) + (2 × n), two equal parts, so it is even.
**Q7 Scaffolds.** Structural, kept at every level: the chart grid with its row and column headers, the Even/Odd check boxes, the reason bank. Hint, faded: shaded headers on the even rows (Guided only), grey pair-dots under a product (Guided only), the "look at the ones digit" cue (Guided and the first Independent row).
**Q8 Written response.** Shade a box, or check one box (Even / Odd), or write a product then check. A reason from the bank on the last row only. Paper shading becomes tapping on screen (the `shade` task already does this: `multi-select-check`). It is never turned into multiple choice of products.
**Q9 Oral frame.** `Say: "{a} is even. So {a} times {b} is even."` and, for the reason, `Say: "{a} × {b} is two equal parts: __ + __."`
**Q10 Misconceptions.** M1: the pupil judges parity by the tens digit or the first digit (36 called odd because 3 is odd). M2: the pupil thinks odd × odd = even ("odd and odd make even" carried over from addition). M3: the pupil shades by one row only and misses the even column (shades the 4 row, not the 4 column). M4: the pupil thinks any product with an odd factor is odd (calls 3 × 4 odd).
**Q11 Fit.** A 4 × 5 chart window is one cell, about 2 per half page at L. Even/Odd fact checks are horizontal one-symbol items, 2 × 4 per page. That gives 6 to 8 items, so it fits.

**Where our standards override the sites:** the sites use 10 × 10 or 12 × 12 rainbow charts, colour shading and written explanation lines. We use a black-and-white 4 × 5 window (Andika, big digits), shading as a hatch or grey fill, and a reason bank instead of writing. The sites put several patterns on one sheet (doubling, turnarounds, rows go up). We teach one pattern.

## 3. Skills

| Role | Skill | Options | Verdict | Generator evidence |
|---|---|---|---|---|
| Main practice (shade even products) | `multiplication:mult_chart` | `chart:'window'`, `band:100` (10 × 10), `task:'shade'`, `constant:[2]` | **Fits meanwhile; needs option** | `genMultChart` (`gen-mult-patterns.js`): `task==='shade'` picks `n` from the ticked tables ≥ 2, cuts a 4 × 5 window holding that table, lists the distinct products as options with `correct: v % n === 0`, print text "Shade every multiple of 2.", screen "Tap every multiple of 2.", `answerType:'multi-select-check'`, `q.cell` template `mult-grid` (kit, not legacy). Multiples of 2 are exactly the even products, so the item works. Its wording is the problem: it says "multiple of 2", not "even". Sample (window rows 3–6, cols 2–6): products 6, 8, 10, 12, 9, 12, 15, 18 … → shade 6, 8, 10, 12, 18, 24 … |
| Main practice (Even/Odd check of a fact) | none | — | **Proposal** (below) | Nothing deals "n × m: check Even or Odd". `composing:odd_even` deals single numbers only. |
| Prerequisite a: even/odd | `composing:odd_even` | P12 "Odd or even? (one number)" | Fits | Gen-algebraic 1336 branch: "Is 14 odd or even?" |
| Prerequisite b: double | `patterns:double` | band 20 | Fits | "Double 7 = __" |
| Prerequisite c: read the chart | `multiplication:mult_chart_easy` (or `mult_chart` `task:'fill'`, window) | window, band 100, level 2 | Fits | fill: 3 gaps in a window, each in its own row |
| Prerequisite d: × fact | `multiplication:mult_facts` | `constant:[2,4]` | Fits | "4 × 6 = __" |
| Number sense A (even/odd of numbers to 100) | `composing:odd_even` | "Click all the even or odd numbers" | Fits | |
| Number sense B (count by 2 and 4) | `multiplication:count_by_tables` | rows step 2 and 4, `fill:'two'`, `missing:50` | Fits | count-row cell, 12 numbers in 2 lines of 6 |
| Word problem | none fits well | — | **Proposal** (story inside `notice_patterns`); meanwhile `multiplication:mult_word_problems_plain` with an oral parity question | Stories elsewhere deal products, not parity |
| Mixed partners | `multiplication:mult_facts` (2, 4, 5, 10), `mult_chart` `task:'fill'` | | Fits | |
| Anchor workedSteps | `countby.js` `CHART_STEPS.shade` | | **Needs new steps** for the even form | Current steps say "Say the times table of the number…". They are not about even rows. |

Not used: `count_by_fill` (count-bys, a lesson 5 / earlier warm-up), `number_patterns_rule` (rule sequences: the lesson 5 overlap), `mult_chart` `task:'pattern'` (writing the row rule: the lesson 5 overlap), `chartwindow.js` (the 1–100 chart, not the times table), `seqstrip.js` (sequences).

**Proposal A (option, smallest change):** on `multiplication:mult_chart` / `_easy` add task value `even`, "Shade every even product". Same `mult-grid` cell and the same `multi-select-check` as `shade` with n = 2, but with instruction key `shade-even` (NEW: "Shade every even product.") and an option `hdr: 'mark'|'none'` that hatches the even row/column headers (a hint that fades). A worked-steps branch: (1) find the even row numbers; (2) every box in that row is even; (3) find the even column numbers; (4) shade; check the odd × odd boxes stay white.
**Proposal B (new skill, already on the build list as `patterns_notice` → `patterns:notice_patterns`):** I recommend narrowing its first build to the parity family. Id `patterns:notice_patterns`, label "What Do You Notice? Even and Odd Products", grade 3, CCSS 3.OA.D.9 (+3.OA.C.7), EE M.EE.3.OA.9 (or .8, see Q1). Problem types: (1) `n × m`: check one box Even / Odd (a `judge`-style check-box cell); (2) shade the even products in a window (mult-grid); (3) True / False: "Every product in the 4 row is even."; (4) Why? Pick the reason from a bank: "two equal parts" / "it ends in 0, 2, 4, 6 or 8"; (5) a story: "Is the total even?". Templates `mult-grid`, `equation` with a check-box slot. Options: `factors: 'even-row' | 'mixed' | 'odd-odd'` (the ladder), `chart: on/off`, `reason: on/off`. Misconceptions: M1–M4 above. Use Proposal A + `odd_even` meanwhile.

## 4. V22 content

**I Can title:** I Can find even products (26 chars)
**CRA:** Pictures (a shaded chart window), with a short concrete start (pairs of cubes).
**Flow:** Standard (one routine, three steps, one critical atom; nothing needs chunking).

**Routine steps:**
1. `look`: Look at the row and column numbers.
2. `decide`: Is one of them even? (Critical Atom)
3. `write`: Shade it, or check Even. If both are odd, check Odd.

No chant. The three steps are short, and the Say frame carries the language.

**Vocabulary (3):**
| Word | Gloss | Mini-diagram |
|---|---|---|
| even | makes pairs, none left over | 6 dots in 3 pairs |
| odd | one is left over | 7 dots, 3 pairs + 1 |
| product | the answer when you multiply | `4 × 3 = 12`, 12 boxed |

**Remember:** If one number is even, the product is even.

**T2 atoms:**
| # | Skill or Concept | Atom Type | Teacher notes |
|---|---|---|---|
| 1 | Even/odd: look at the ones digit (0, 2, 4, 6, 8 = even). | Category · Pre-requisite | Prerequisite Check a |
| 2 | Double: 2 × n is n + n. | Fact · Pre-requisite | Prerequisite Check b |
| 3 | Read the chart: the row meets the column at the product. | Task · Pre-requisite | Prerequisite Check c |
| 4 | Facts of 2 and 4. | Fact · Pre-requisite | Prerequisite Check d |
| 5 | Even row: every product in the 2, 4, 6, 8, 10 rows is even. | Comparative · New | Anchor chart panel 1 |
| 6 | Why: 4 × n = 2 × n + 2 × n, two equal parts → even. | Conceptual · New | Anchor panel 2, Reason row |
| 7 | One even factor is enough (row OR column). | Category · New | **Critical Atom** (step 2) |
| 8 | Odd × odd is odd (contrast). | Comparative · New | ★★★ last row |

**T2 routine table:**
| Step | Task | Tag | Check it with |
|---|---|---|---|
| 1 | Read the two factors (row and column). | Pre-requisite | Prerequisite c |
| 2 | Decide: is one factor even? | New · Critical Atom | Guided 1, Check Question, exit b |
| 3 | Shade / check Even; both odd → Odd. | New | Independent a–f |

**How to teach:** Show, then name. Build the 2 row and the 4 row with pairs of cubes, then shade them on the window, then show that the even columns are shaded too. Model with a window holding rows 3–6. Fade: Guided ★ (even headers hatched, pair-dots grey), Independent ★★ (structure only), last practice row ★★★ (odd × odd, two-digit products like 7 × 9 = 63 and 6 × 7 = 42).

**Common mistakes:**
| Mistake | Broken step | Looks like | Fix | CQ option |
|---|---|---|---|---|
| Tens digit decides | 1 (atom 1) | 36 → Odd | Cover the tens; read the ones. | B |
| Odd × odd = even | 2 | 3 × 5 → Even | Count 3 × 5 = 15: one is left over. | — (exit b) |
| Row only | 2 (Critical) | 3 × 4 → Odd ("3 is odd") | "Is the row OR the column even?" Check both. | A |
| Shades one line only | 3 | Shades the 4 row, leaves the 4 column | Finger on every even header, row and column. | — |

**T1 boxes:** Tip: start with cubes in pairs; the 4 row is two 2 rows. Tip: say "row or column". Watch: Row only (3 × 4 called odd).
**Materials:** pupil packet, interlocking cubes (20 per pair), mini whiteboards, the anchor chart (a 4 × 5 window, A3 or projected), exit slips cut in half, Teacher 6 keys.

**Prerequisite check (P0):**
| Item | Atom | Skill | Kind | If missed → |
|---|---|---|---|---|
| a | Even/odd | `composing:odd_even` | "Is 14 odd or even?" check box | 2.OA.C.3 Odd and even numbers (`2-` library id if it exists) |
| b | Double | `patterns:double` | Double 8 = __ | 1.OA.C.6 Doubles |
| c | Read the chart | `mult_chart` fill, window | 1 gap | 3.OA.C.7 Use the multiplication chart |
| d | Facts of 2, 4 | `mult_facts` [2,4] | 4 × 6 = __ | 3.OA.C.7 Facts of 2, 4, 8 |

**Number sense:** Band A (5): even or odd? one number to 50, check box. Band B (5): count by 2s / by 4s with 2 gaps each (count_by_tables, rows 2 and 4), then circle "All even? Yes / No".

**Spaced retrieval (MWB, earlier content):** 6 × 5 = 30 · 8 × 2 = 16 · 3 × 7 = 21 (and 7 × 3 = 21, lesson 3 turn-around).
**Chaining bridge:** "You know even numbers make pairs. Today we find where the even numbers live in the times table."

**I Do (anchor chart):** Panel 1: a window with rows 3–6 × columns 4–8. It holds even rows (4, 6), odd rows (3, 5) and odd columns (5, 7), so all three cases appear, including odd × odd (3 × 5 = 15, 5 × 7 = 35, a two-digit odd). Panel 2: 4 × 7 = 28 = 14 + 14, drawn as two equal bars (why). Panel 3: 3 × 7 = 21 → both odd → Odd.
**We Do:** Guided cells 1–2: a window with even headers hatched; pupils shade with the teacher and say the frame. Cell 3: an Even/Odd check for 6 × 3, no chart.
**Check Question:** "Is 9 × 4 = 36 even or odd?" Voting cards: **A** "Odd, because 9 is odd" (row only, the Critical Atom mistake) · **B** "Odd, because 36 starts with 3" (tens digit decides, M1) · **C** "Even, because 4 is even" (**correct**). C is right. (Product given so the item tests the decision, not the fact.)
**You Do (practice composition):** Practice 1: 2 windows, shade the even products (`task:'even'`; meanwhile `shade` with n = 2). Practice 2: 8 Even/Odd checks of facts. Mix: 4 with one even factor, 2 with two even factors, 2 odd × odd. ★★★ last row: 9 × 7, 7 × 5 (odd × odd, two-digit), 8 × 9 (even column only), and a reason item "Why is 4 × 9 even? 36 = __ + __" (18 + 18).
**Avoid:** factor 1 (trivial) and 10 (the ones digit 0 gives the answer away) in the decide items; 2 × 2 (no contrast); the same fact and its turn-around on the same page.
**Item pool (LR-5):** the factors 2–9 × 2–9 = 64 ordered facts, 36 unordered; 16 odd × odd, 20 with an even factor. A page of 8 needs 8 distinct unordered facts, so the pool is ample. Windows: any 4 × 5 window in 10 × 10 with at least one even and one odd row.

**Word problem (P5):** "There are 4 bags. Each bag has 7 apples. Is the total even or odd?" RCDWS: Read; Circle 4 and 7; Draw 4 groups of 7 (or 2 + 2 bars); Write 4 × 7 = 28; Solve: check Even, Say "4 is even, so 28 is even."
**Exit slip (fresh numbers):** a. 6 × 9 Even/Odd · b. 5 × 3 Even/Odd · c. shade the even products in a 2 × 3 window (rows 3–4, cols 5–7) · d. 8 × 7 = 56 = __ + __.

**Delivery scripts (T-SCRIPT):**
1. Prerequisite check · Do: hand out P0. Say: "Do a to d by yourself." Note: mark each wrong item on T6 routing.
2. Number sense · Do: band A, then B. Ask: "Are all the 4s even?" Say: "Yes. All the 4s are __."
3. Spaced retrieval · Do: MWB, the 3 facts. Say: "Show me."
4. Chaining bridge · Say: "Even numbers make pairs. Today we find them in the times table."
5. I Do · Do: build {chart.r} rows of cubes in pairs. Say: "{chart.r} is even. Every box in the {chart.r} row is even." Do: shade the row. Ask: "What about the {chart.c} column?" Say: "{chart.c} is even, so the column is even too." Do: point to {odd.a} × {odd.b}. Say: "Both are odd. So {odd.p} is __." Do: panel 2. Say: "{why.a} × {why.b} is two equal parts: __ + __."
6. We Do · Do: Guided 1–3. Say: "Finger on the row number. Finger on the column number. Is one even?" Note: listen for "row or column".
7. Check Question · Do: show {cq.a} × {cq.b}; vote A/B/C on fingers. Note: A = row only, so reteach the Critical Atom; B = tens digit, so cover the tens.
8. You Do + word problem · Do: Practice 1–2, then P5. Note: circulate to the ★★★ row first.
9. Plenary · Do: exit slip. Say: "If one number is __, the product is even."
10. Close · Say: "Tomorrow we use rules to make number patterns." (the bridge to lesson 5)

**Feedback / Watch boxes:** §5 Watch: row only. §6 Feedback: "Check the row AND the column." §8 Watch: 36 called odd because the 3 is read. Fix: cover the tens.
**T-LOOP after the Check Question and the exit slip:** most right → go on; about half → re-show panel 3 with one more odd × odd; fewer than half → back to cubes: build 3 × 4 as 3 rows of 4 and pair them up.

**T6:**
Routing: a → 2.OA.C.3 Odd and even · b → 1.OA.C.6 Doubles · c → 3.OA.C.7 Read the chart · d → 3.OA.C.7 Facts of 2 and 4.
Accepted answers: the reason item `28 = 14 + 14` only; but accept a shade drawn as a hatch, a fill or a ring.
Wrong answers to look for: wrote Odd for 3 × 4 → row only → "Row OR column?" · wrote Even for 3 × 5 → odd × odd = even → count the pairs in 15 · wrote Odd for 6 × 6 = 36 → tens digit → cover the tens · left the even column white → one-line shading → finger on every even header.

## 5. Owner questions

1. **EE tag:** the brief says M.EE.3.OA.9; the repo tags these skills M.EE.3.OA.8. Recommendation: check `data/standards/ee-math.json` and use the code it lists for "identify arithmetic patterns". If that is .9, fix the tags through `TAG_FIXES`.
2. **Proposal A vs B:** build the `even` task on `mult_chart` now (small, kit-ready), and build `notice_patterns` later with Even/Odd checks. Recommendation: A first.
3. **Odd × odd in a SPED lesson:** keep it only as a ★★★ contrast, not a second rule. Recommendation: yes, contrast only.
