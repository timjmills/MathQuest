# g1-oa1-bar-model-wp-20 — research and content (Phase B, round 1)

Lesson 2 of 5 · Grade 1 · "Solve one-step word problems within 20 using bar models".
Content only: no code was changed. Generator facts below were read from the code on branch
`claude/sweet-newton-c8wrv1-wip-detailed-lessons` (2026-10-16). No browser run was made, so no item was generated
live. The sample items were worked out by hand from the code paths.

---

## 1. Tags

| Field | Value |
|---|---|
| Grade | 1 (Level 1) |
| CCSS | **1.OA.A.1**: word problems within 20, all situations, all unknown positions |
| EE | **M.EE.1.OA.1.a**: show + and − with objects, drawings, acting out. **M.EE.1.OA.1.b**: see when two groups have the same amount |
| EE note | `SKILL_STANDARDS` tags the skills with the whole code `M.EE.1.OA.1`, not with the letters .a / .b. This lesson meets .a (the bar is a drawing of the story; counters on the bar are the objects). It meets .b only by the turn-around check: "3 and 5" and "5 and 3" make bars of the same length. Put .b on T1 as a secondary tag, not as a lesson goal. |
| WRM | No Year 1 step names 1.OA.A.1. The nearest steps are **Y1.B2.S2 Part-whole model** (K.OA.A.3). This lesson builds on that step: it adds a story to the part-whole model. Also near: Y1.B5.S1 Add by counting on within 20. Later step: Y2.B2.S19 Mixed addition and subtraction (1.NBT.C.4, 1.OA.A.1). |
| Site lesson id | none |
| Domain | Operations & Algebraic Thinking |
| Audit | `standards-audit.js` says 1.OA.A.1 is FULL across six skills, "every situation and unknown position at range 20; bar and equation supports". In fact only add-to, take-from and compare are dealt at range 20 with the kit bar. The *put-together whole-unknown* items come from `add_wp_20` (half its items, see §3). *Take-apart part-unknown* and *both-addends-unknown* stories do not exist at range 20. See owner question Q2. |

---

## 2. Research findings

Sources consulted (public pages only, no logins):
- MathWorksheets4Kids: `mathworksheets4kids.com/part-part-whole.php` returned 404. The site search found no public page for this topic. MW4K's known content model for "addition word problems within 20": a short story, a picture or a blank, and a write-in answer. No content from it was copied.
- IXL grade 1, *Word problems involving addition and subtraction without comparisons – up to 20* (https://www.ixl.com/math/grade-1/addition-and-subtraction-word-problems-up-to-20): the title is public, the item body is not. IXL keeps the *compare* situation in a separate skill. We follow that: compare is its own lesson.
- SplashLearn Grade 1 part-part-whole model problems (https://www.splashlearn.com/s/math-worksheets/part-part-whole-model-problems) and the SplashMath bar-model sheets (https://www.splashmath.com/math/word-problems-worksheets-for-2nd-graders): a story with numbers to 20 above a drawn two-row bar (the whole on top, two parts below). The pupil fills the blank part of the bar and writes the answer.
- TES bar-model addition packs, Y1–2 (https://www.tes.com/teaching-resource/bar-model-addition-problems-worksheets-year-1-and-2-12311309): the help fades from a drawn bar to "draw your own bar".
- Oak National Academy, *use a bar model to represent a whole partitioned into two parts* (https://thenational.academy/teachers/programmes/maths-primary-ks1/units/composition-of-numbers-0-to-5/lessons/use-a-bar-model-to-represent-a-whole-partitioned-into-two-parts) and NCETM (https://www.ncetm.org.uk/media/yoyphd14/pska-add-q1.pdf): a bar model is a part-whole model drawn as boxes. Show the bar first with numbers only, then with a story.
- Singapore Math 2A sample (https://www.exodusbooks.com/samples/sm/80786sample.pdf): read the bar to decide which operation. If the whole is unknown, add. If a part is unknown, subtract.
- Nagwa plan 297186364856 returned 410 Gone (it was only listed in search results).

**Answers to the CLAUDE.md research questions 1–11**

1. **Problem types.** Fill the bar labels from a story. Find the whole (add). Find a part (subtract, later). Match a story to a bar. Write the equation from the bar. Compare with two bars (later).
2. **Visuals.** Two-row part-whole bar: the whole bar on top, two parts under it, part lengths drawn to scale. Counters or cubes laid on the bar at the concrete stage.
3. **Answer formats.** Numbers written in the bar boxes, then the answer number and a label word. On screen the same boxes are typed in (the kit `word-work` cell is SP-1 parity). Never multiple choice.
4. **Progression.** Concrete: cubes on a printed bar mat. Pictorial: the drawn bar with numbers. Abstract: equation only. The sites fade from a drawn bar to "draw your own". Our fade is the same, but it happens over lessons, not inside one page.
5. **Edge cases.** A part of 1 (the bar box is very short; the kit sets a 30 mm minimum width). Two equal parts (equal boxes, this is EE .b). A whole of exactly 20. A whole between 11 and 19 crosses ten, so the arithmetic needs counting on past 10. Turn-around order: the story gives the smaller number first.
6. **The ONE new thing.** The bar model as a picture of a story. Pupils can already add within 20 and know the part-whole model (Y1.B2.S2). This lesson adds only this: take the two numbers from a story, put them in the two part boxes, and see that the whole is unknown, so we add. The unknown is always the whole. Take-from, part-unknown, start-unknown and compare are follow-on lessons (§4.F).
7. **Scaffolds.** *Structural, stay all lesson:* the bar frame (whole box over two part boxes), the sign row, the answer box and the label bank of the `word-work` cell. *Hints, fade:* grey pre-filled part numbers in Guided cell 1, then grey whole label only, then nothing. Key-word bolding (`wpCues`) is not used: it teaches a word hunt, not the structure.
8. **Written response.** Three numbers in the bar boxes, the sign circled, the answer number and a label word copied from the bank. No sentences.
9. **What the pupil says.** "__ and __ make __." (C.3 number-bond frame) while pointing at the bar, then the word-problem frame "The answer is __ {unit}."
10. **Misconceptions.**
    - (M1) The pupil writes the whole in a part box, or a part in the whole box.
    - (M2) The pupil copies a story number as the answer ("in all" → writes 8).
    - (M3) The pupil subtracts because "more" or a big number appears (wrong sign).
    - (M4) Counting slip past 10 (8 + 5 → 12).
11. **Fit on our page.** The `word-work` cell with the bar runs at about 1 story per half page at Size L, so 2 stories per page. The design standard allows 6 cells per page for facts, but a story with a bar is a "spacious" item (`SKILL_PRINT_SIZE add_wp_20: spacious`). Practice pages hold 4 stories in 2 × 2, not 12. Sites fit 10 or more. We do not.

**Where our standards override the sites:** sites colour the parts (we use black and white, with grey only for trace). Sites put 6–10 stories on a page (we put 2–4). Sites mix in "draw your own bar" on the same page (that is a new step, so it waits for its own lesson). Sites bold key words (we teach the structure, not keywords).

---

## 3. Skills

### Is there a bar model the pupil completes? **Yes.**
- `js/modules/sheet/cells/word-work.js` `barModel()` draws the kit bar. The pupil writes all three labels: the whole on the top bar, the two parts below, part widths drawn to scale. On paper the labels are empty boxes; the key fills them. On screen they are typed inputs (`data-ws-graded="0"`, scratch). The bar has three kinds: `whole` (+ and −), `compare` and `groups`. The bar is on when the option `support: 'bar'` is set on the ranged story ids (`_opsBar`, skill-options.js:991), or when `wpBar: true` is set on the other story skills. `word-work.js` reads both (`bar: opt('wpBar') || barSupport()`).
- Old drawing: `gen-operations.js` `_barModelSVG` writes the numbers in and puts "?" in the unknown box. That gives the bar away. Its output goes into `q.visual`, and `applyWordWork` then replaces `q.visual` with the kit twin, so the kit bar is what shows. Do not build on `_barModelSVG`. It is legacy code with nothing left using its output.
- The bar has only one line in the cell. `barModel()` is a few lines inside `word-work.js`, not a registered template. The build list's planned `bar-model` template (build-list.js:37, lane operations) is not built yet. This lesson does not need it.
- **What the lesson does need from the bar:** in the I Do the parts are written *before* solving. The kit's empty labels allow that order. Good.

### Generator evidence
- `add_wp_20` (gen-operations.js:2971+). `generateAddPair(20,'mixed', …, {minOperand:1})`. The code comment says "Ruling 1: the band bounds the ANSWER", so the sum should be ≤ 20. **Verify with `ws-content-audit --skill add_wp_20`.** The 2026-09 audit (design/catalogue/addition.md item 3) saw 8 + 17 = 25 before that fix. The story is then **retold** by `tellStory('join')`. Odd *k* gives *put together*: "{A} has 6 shells. {B} has 7 shells. How many shells do they have in all?" Even *k* gives *add to*: "{A} has 6 shells. {A} gets 7 more shells. How many shells does {A} have now?" *k* depends on the item index, so the two kinds alternate. In both, the bar has the whole unknown. Sample items, worked out by hand: 9 + 4 = 13, 6 + 7 = 13, 12 + 5 = 17, 3 + 8 = 11. The cell emits `q.cell = {template:'word-work'}`. Options: band, pictures, `support` (bar), wpCues, wpBank, response.
- `sub_wp_20`: `tellStory('separate')` (take from, result unknown). With the bar, the whole is known, part A is known, and part B is unknown. This is follow-on lesson 3.
- `add_word_problems` / `sub_word_problems`: variants join, start_unknown, part_part_whole / take_away, compare, start_unknown (`_p12Variants`). The range follows `state.range` with `maxNum = max(10, range)`, so each addend goes up to the range, not the sum. A sum within 20 is not guaranteed. Grade 2 tag first. Not used here.
- `subtraction:unknown_start_wp`, `addition:comparison_word`: start-unknown and compare. Follow-on lessons.
- Worked steps: `sheet/providers/word-work.js` gives `steps` for the chart: "Read the story two times. / Circle the sign that fits the story. / Write the numbers in the boxes. Solve. / Write the answer and its label word." and `say: 'The answer is __ __.'`. These steps do not mention the bar. The lesson routine below puts the bar step first. Owner question Q1.

### Skill table

| Role | Skill id | Options | Verdict |
|---|---|---|---|
| Main practice (P3, P4) | `addition:add_wp_20` | `support:'bar'`, `pictures:false`, `wpCues:false`, `wpBank:false` | **fits** (whole unknown, put together and add to alternate) |
| Main, put-together only | `addition:add_wp_20` | *needs option* `situation: put-together \| add-to \| mixed` | **needs option**. Meanwhile use mixed: both kinds have the whole unknown on the bar. That is the point, so it is acceptable. |
| Prereq a: count a set to 20 | `counting:count_objects` | band 20 | fits |
| Prereq b: two parts make a whole | `composing:number_bonds` | band 10 | fits (part-whole idea) |
| Prereq c: add within 20 (crossing ten) | `addition:add_facts` | band 20 | fits |
| Prereq d: read a part-whole model, the whole unknown | `composing:number_bonds` (cherry model, whole blank) | band 10 | fits for now. The bar version of this is the new atom. |
| Number sense A (within 10) | `composing:number_bonds` (missing part), `addition:add_facts` band 10, `more-less` | — | fits |
| Number sense B (within 20) | `addition:add_facts` band 20, ten-and-ones bonds ("10 and 4 make __") | — | fits |
| Word problem P5 | `addition:add_wp_20` (one item, no bar printed; the RCDWS panel "Draw it" asks for the bar) | `support:'none'` | fits |
| Mixed-practice partner | `composing:number_bonds` band 20 (spaced), not subtraction yet | — | fits |

**Proposals (BUILD_LIST style):**
- **Option `situation` on add_wp_* / sub_wp_*** (id `wpSituation`). Values: add: `put-together`, `add-to`, `mixed` (default, today's alternation). sub: `take-from`, `take-apart` (put-together with a part unknown: "{A} has 13 shells. 6 are white. The rest are black. How many are black?"), `mixed`. CCSS 1.OA.A.1, EE M.EE.1.OA.1.a. Template `word-work` (no new template; `tellStory` needs a `take-apart` case and the bar kind `whole`). Ladder: put-together → add-to → take-from → take-apart → mixed. Lane operations. It closes the audit's partial clause "put together / take apart all positions".
- **Option `barFill` on the bar** (`given` = the known numbers printed in the bar, the pupil writes only the unknown; `blank` = today's behaviour). The I Do and the Guided cells need the parts shown while the whole is written. Today all three labels are blank or all three are keyed. Meanwhile, the Guided cell 1 trace comes from the key ink (grey trace) of the facsimile.

---

## 4. The V22 content

### A. Header
- **I Can title:** `I Can solve stories with a bar` (30 chars)
- **CRA stage:** Pictures (the bar), with a concrete start: cubes laid on a printed bar mat in the I Do
- **Flow:** Standard (2 new routine steps: step 1 and step 2; steps 3–4 are ★ prerequisites)
- **Instruction strings:** P3/P4 `story-work` "Circle the sign. Write the numbers in the boxes. Solve." P5 `story-rcdws`. Exit slip `story-work`. A bar-specific string: **NEW `story-bar`** "Read the story. Fill in the bar. Solve." (8 words, print verbs Read/Fill in/Solve). It is close to the existing `story` "Read the story. Fill in the diagram. Solve.". **Recommend using `story` as it is** ("diagram" is the bar), so nothing new is needed. Vocabulary teaches "bar".

### B. Routine steps (icons from `STEP_ICONS`)

| Step | Icon | Text (≤ 8 words) | Tag |
|---|---|---|---|
| 1 | `look` | Find the two parts. | New |
| 2 | `write` | Write the parts in the bar. | New · **Critical Atom** (parts go below; the whole is the top box) |
| 3 | `decide` | The whole is missing. Add. | ★ (prerequisite: missing whole means add, from number bonds) |
| 4 | `check` | Write the whole and the label. | ★ |

Chant: **"Parts below. Whole on top. Add the parts."** This chant does help: it fixes M1.

### C. Vocabulary (≤ 3)

| Word | Gloss (≤ 8 words) | Mini-diagram |
|---|---|---|
| part | one piece of the whole | the two-row bar, the left lower box thick-outlined |
| whole | all the parts together | the same bar, the top box thick-outlined |
| bar | boxes that show the story | the empty two-row bar |

**Remember:** "Remember: the whole goes on top, NOT in a part box." (a NEW C.4 contrast line, in the same shape as the existing ones)

### D. T2 atoms

| # | Skill or Concept | Atom type | Teacher notes |
|---|---|---|---|
| 1 | Count a set: the last number said tells how many. | Fact · Pre-requisite | Prereq a |
| 2 | Parts and whole: two parts make a whole. | Conceptual · Pre-requisite | Prereq b |
| 3 | Add within 20: count on past 10. | Fact · Pre-requisite | Prereq c |
| 4 | Missing whole: when the whole is missing, add. | Category · Pre-requisite | Prereq d (cherry model) |
| 5 | Story numbers are parts: "has 6 … has 7" gives two parts. | Category · New | NPPPN set: a story with one number (Not) … |
| 6 | Bar = part-whole: top box is the whole, lower boxes are the parts. | Conceptual · New | **Critical Atom**. Cubes on the mat first. |
| 7 | In all / now: the question asks for the whole. | Category · New | "In all" and "now" both point at the top box. |
| 8 | Same parts, same whole: 6 and 7 or 7 and 6, the bar has the same length. | Comparative · New | EE .b. Another example panel. |

T2 routine table: see §B (Check it with: step 1 → Guided cell 1. Step 2 → **Check Question**, exit slip b. Step 3 → Prereq d. Step 4 → Independent a–d).

**How to teach:** cubes first. Make the two parts as two trains of cubes on the printed bar mat (real cubes may be any colour; paper stays black and white). Push them together under the top box. Then draw. Model the I Do story, then the Another-example stories (equal parts; small part first). Fade: Guided ★, Independent ★★, last practice row ★★★.

**Common mistakes**

| Mistake | Broken step | Looks like | Fix | CQ option |
|---|---|---|---|---|
| Whole in a part box (M1) | 2 | 13 written in a lower box | Chant. Touch the top box: "whole". | A |
| Story number as answer (M2) | 4 | "in all: 7" | Point at the top box. Is it a story number? | B |
| Wrong sign (M3) | 3 | 7 − 6 = 1 | "Is the whole missing? Add." | (exit slip d) |
| Count slip past 10 (M4) | 3 | 6 + 7 = 12 | Count on with fingers from the big part. | — |

**T1 boxes:** Tip: *Parts below, whole on top.* Say it each time you point. Tip: *Read the story two times.* ELL pupils need the first read for the words and the second for the numbers. Watch: *Whole in a part box.* The most common mistake. The pupil writes 13 under the bar. Fix: touch the top box, say "whole".

**Materials:** pupil packet; printed bar mat (A4, the two-row bar at true size, boxes 20 mm high); linking cubes (20 per pair); mini whiteboards; anchor chart; answer keys (T6).

### E. Section content

**Prerequisite check (P0), most basic first:**

| Item | Atom | Skill | Kind | If missed → |
|---|---|---|---|---|
| a | Count a set (1) | `counting:count_objects` band 20 | count 14 dots → write | `K.CC.B.5 Count to 20` |
| b | Parts and whole (2) | `composing:number_bonds` | cherry model 4 and 3, the whole blank → 7 | Y1.B2.S2 Part-whole model |
| c | Add within 20 (3) | `addition:add_facts` band 20 | 8 + 5 → 13 | `1.OA.C.6 Add within 20` (lesson 1 of this set, if it is that) |
| d | Missing whole = add (4) | `number_bonds` | "Which sign? 5 and 4, the whole missing" → circle + | Y1.B2.S2 Part-whole model |

**Number sense:** A (within 10): 1 more/1 less of 6 · missing part 7 = 4 + __ · 3 + 4 · missing number 2, 4, __, 8 · compare 6 ○ 9. B (within 20): 10 and 4 make __ · 9 + 6 · 1 more / 1 less of 15 · 12 ○ 17 · missing part 14 = 10 + __.

**Spaced retrieval (earlier content, MWB):** "Write 4 and 5 make __." → 9 · "Draw 7 dots in a ten frame." → 7, top row filled first · "What is 10 + 3?" → 13.

**Chaining bridge:** Say: "Last time we added numbers to 20." Say: "Today the numbers live in a story. The bar shows the story."

**I Do example:** "Ana has 6 shells. Ben has 7 shells. How many shells do they have in all?" 6 and 7: no repeated digit, the parts are nearly equal so the bar is readable, and the sum 13 crosses ten but the pupils already know it. Avoid 5 + 5 (repeated) and avoid parts of 10. **Another example 1:** equal parts, 8 and 8 ("same length" EE .b): "Sam has 8 cars. Lea has 8 cars…" → 16. **Another example 2:** add to with a small part: "Kim has 12 grapes. Kim gets 3 more grapes. How many grapes does Kim have now?" → 15. Use {chart.a}/{chart.b} placeholders in the scripts.

**We Do:** Guided cell 1: grey trace of the part labels and the sign, the pupil writes the whole. Guided cell 2: empty bar. Numbers dealt (two items of `add_wp_20`).

**Check Question:** "Mia has 9 pens. Tom has 4 pens. How many pens in all?" Three bars on the board.
- A: 13 in a lower box (M1)
- B: the top box 9, answer 9 (M2)
- C: parts 9 and 4, whole 13 ✔ (right)

**You Do:** P3 independent a–d (4 stories, ★★). P4 Practice 1: 4 stories, the last row ★★★. P4 Practice 2 optional: 4 stories. ★★★ edge cases: a part of 1 (1 + 9 → 10), equal parts (7 + 7), whole exactly 20 (11 + 9), small part first (3 + 12). **Avoid:** a part of 0; a sum over 20; 10 + n as the I Do (too easy); the same pair turned around on one page. **Pool (LR-5):** ordered pairs (a, b), a, b ≥ 1, a + b ≤ 20. That is 190 pairs, about 150 usable once 10 + n, doubles of 1–2 and parts over 15 are removed. Plenty for distinct items.

**Word problem (P5):** `story-rcdws`. Story: "Leo has 5 red apples. He has 9 green apples. How many apples does he have in all?" (Colour words are fine as words; no colour is drawn.) RCDWS: Read it two times · Circle the numbers · Underline the question · Draw it (the bar) · Write the equation · Solve · Check. Accept 5 + 9 = 14 or 9 + 5 = 14 → "14 apples".

**Exit slip (4 items, fresh):** a 7 + 5 (12, story says "in all") · b 4 and 11 (M1 trap: small part first, 15) · c add to: 13 + 4 = 17 · d 6 + 6 (equal parts, 12). Say: "The answer is __ {unit}."

### F. Delivery scripts (T-SCRIPT)

**1 Prerequisite Check (4 min)** — Do: hand out P0. Say: "Four questions. Do them on your own." Do: read a–d aloud, wait 30 s each. Note: answers a 14 · b 7 · c 13 · d + circled. T-LOOP: Most → go on; About half → reteach b/d on the cherry model 2 min; Fewer than half → route (T6).

**2 Number sense (5 min)** — Do: band A; early finishers band B. Say: "Point. Say the number. Then write it." Do: choral check.

**3 Spaced retrieval (3 min)** — Ask the three MWB items; Note answers.

**4 Chaining bridge (1 min)** — two Say lines above; Say: "I can solve stories with a bar. Say it with me."

**5 I Do (12 min)** — Watch: Whole in a part box (model it wrong once, write Wrong beside it, never print it).
1. Do: read the story twice; Silent: point at each number. Say: "{chart.a} shells. {chart.b} shells."
2. Do: lay {chart.a} cubes and {chart.b} cubes under the bar mat. Say: "These are the parts."
3. Do: write {chart.a} and {chart.b} in the lower boxes. Say: "Parts below."
4. Ask: "Is the whole missing?" → yes. Say: "The whole is missing. Add."
5. Do: push the cubes together under the top box; count on from {chart.b}. Write {chart.sum}. Say: "{chart.a} and {chart.b} make {chart.sum}."
6. Do: write the answer and label. Say: "The answer is {chart.sum} shells."
7. Do: another example panels (equal parts; add to). Ask: "Where does {ex2.a} go?" → below.
8. Do: partners: "The whole goes on top because __." (oral only)

**6 We Do (8 min)** — Tip: grey is a helper. Do: Guided cell 1 together; trace the parts, write the whole. Say: "{g1.a} and {g1.b} make __." Do: pairs do cell 2, A talks, B points. Ask: "Partner B, which box is the whole?"

**7 Check Question (3 min)** — Ask: "Which bar is right? A, B or C?" Note: C. A = M1, B = M2. T-LOOP: Most C → You Do; About half → redo on the mat; Fewer than half → cubes again, two stories.

**8 You Do (15 min)** — Do: P3 a–d, then P4. Note: visit ELL/SPED first within 60 s. Ask: "Point to the parts." "Point to the whole." Feedback: "You put the parts below. That is step 2." Fix: "Touch the top box. Is that a part?"

**9 Word problem (in You Do, ★★)** — Do: read aloud twice; pupils check one box per RCDWS action. Note: accept either order.

**10 Plenary (7 min)** — Do: exit slip. Say chant twice: "Parts below. Whole on top. Add the parts." Ask: thumbs: "Can you solve a story with a bar?"

### G. T6

**Routing:** a → K.CC.B.5 Count to 20 · b → Y1.B2.S2 Part-whole model · c → 1.OA.C.6 Add within 20 · d → Y1.B2.S2 Part-whole model. One miss: teach that lesson first, then come back. Two or more misses: start with the earliest.

**Accepted answers:** the two parts in either order in the lower boxes. The equation in either order. The label word = the story noun (singular when the answer is 1, which cannot happen here). The P5 drawing: any two-part bar with the right labels.

**Wrong answers to look for**

| Pupil wrote | Likely mistake | Next step |
|---|---|---|
| the sum in a lower box | M1 whole in a part box | chant; touch the top box |
| a story number as the answer | M2 | "Is it in the story? Then it is a part." |
| the difference | M3 wrong sign | "Is the whole missing? Add." |
| one less than the key | M4 count slip past 10 | count on from the big part with fingers |
| "I need one more day." | — | small group: the bar mat with cubes, Guided page |

### H. Follow-on lessons (one new thing each)
3. Take from, result unknown (part unknown on the bar, subtract) — `sub_wp_20` `support:bar`.
4. Take apart / put together with a part unknown — needs `wpSituation: take-apart` (proposal).
5. Add to / take from with the change unknown and the start unknown — `unknown_start_wp` (range 20 check needed).
6. Compare (how many more / fewer) with two bars — `comparison_word` / the kit `compare` bar.
7. Both addends unknown (all the ways to make 12) — no skill; proposal for later.

---

## 5. Owner questions

- **Q1. The provider steps do not mention the bar.** `providers/word-work.js` steps start with "Read the story two times. Circle the sign…". Recommend: when `support:bar` is on, the lesson uses the routine in §B on the chart and P3. Add a bar version of the steps to the provider later (one-line change, operations lane).
- **Q2. The audit says 1.OA.A.1 is FULL.** It is not: take-apart with a part unknown, and both addends unknown, are never dealt at range 20. Recommend: change the verdict to partial and add the `wpSituation` proposal to the build list.
- **Q3. Pictures with the bar?** The line-art pictures and the bar both show the story, which is too much on one cell. Recommend `pictures:false` while the bar is on. Use the cubes as the concrete step instead.
