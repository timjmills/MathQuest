# g3-oa9-input-output-rule — Find the rule in an input-output table (Grade 3)

Lesson 5 of 5 of the week. Phase B content research, round 1. Content only. Nothing in the code was changed.

## 1. Tags

| Field | Value |
|---|---|
| Grade | 3 |
| CCSS | 3.OA.D.9 (identify arithmetic patterns, explain them using properties of operations) |
| EE | **M.EE.3.OA.8** "Identify arithmetic patterns." *EE note:* the brief says M.EE.3.OA.9, but `data/standards/ee-math.json` and every `SKILL_STANDARDS` row that cites 3.OA.D.9 use **M.EE.3.OA.8**. Use M.EE.3.OA.8. The level descriptor in the Wisconsin file is the addition story-problem text. That looks like a copy error in the source, and the owner should know. |
| WRM step | No Year 3 / Year 4 step. Nearest: `Y6.B7.S1` "1-step function machines" (already on function_table_easy). 3.OA.D.9 also sits on Y4.B4.S6 and the supplement "Patterns on the multiplication table" (lesson 4). Site lesson id: none. |
| Domain | Operations & Algebraic Thinking |
| Standards audit | `standards-audit.js:124` gives 3.OA.D.9 a PARTIAL verdict with the skills mult_chart, number_patterns_rule and count_by_fill. Its missing clauses (addition-table patterns, explain with a property) are **not** closed by this lesson. |

## 2. Research findings

Sources consulted (public pages only, no logins):
- Education.com Grade 3 input/output tables. The pupil compares In and Out to find the hidden rule. Sets say the rule "could be addition, subtraction or multiplication".
  https://www.education.com/resources/grade-3/math/patterns/?q=in , https://www.education.com/slideshow/input-output-tables/
- Virginia DOE remediation plan. Named misconception: the pupil finds the rule from **one pair only**, for example 5 → 10 read as "add 5" when the rule is "× 2".
  https://www.doe.virginia.gov/home/showpublisheddocument/63769/638893731854500000
- EducKids Grade 3–4 preview (+, −, × rules, answer keys): https://educkids.gumroad.com/l/yspdsd
- Loughborough worksheet (+ − × ÷ tables): https://lbas.lboro.ac.uk/worksheet/input-output-tables-worksheet.html
- MathWorksheets4Kids and IXL: the public URLs I tried returned 404. Both need the logged-in route, which this lane may not use. **Gap:** take a logged-in look in round 2 if the owner wants it.

The content model is the owner's own function-table sample (see the `gen-function-table.js` header): "Find the rule for each function table" and "Complete each function table".

| # | Question | Answer, converted to our approach |
|---|---|---|
| 1 | Problem types | (a) complete Out with the rule given; (b) find the rule with every row given; (c) find a missing In (work backward); (d) mixed blanks; (e) find the rule, then use it on a new row. **This lesson teaches (b)**, with (a) as the prerequisite. (c) and (d) are later lessons. |
| 2 | Visuals | A two-column In / Out table, sometimes with a function-machine picture (In → [rule] → Out). We use the kit `function-table` cell: the machine picture plus the rule frame (a circle for the sign, a box for the number). |
| 3 | Answer formats | Sites use a typed rule ("add 3", "+3", "x + 3") or multiple choice. **Ours is the rule frame: write the sign in the circle and the number in the box.** That is a production item, so the screen does not turn it into multiple choice. The words "add 3" are said (Say band), never written. |
| 4 | Progression | Sites go + → − → × and mix them quickly. Ours: + only, then + and −, then × (×2, ×5, ×10 first, then ×3, ×4). One kind per section until the mixed ★★★ row. |
| 5 | Edge cases | Pairs that fit two rules: 2 → 4 (+2 or ×2), 1 → 3 (+2 or ×3), 3 → 6 (+3 or ×2), 4 → 8 (+4 or ×2), 5 → 10 (+5 or ×2). A table needs **≥ 3 pairs** so that only one rule fits. The generator already guarantees this for `ftTask:'rule'` (`rulesFitting(...) === 1` across +k, −k, ×k, ÷k and two-step rules). Avoid a 0 In under × (it gives 0 for every ×k; the generator's pool starts at 1). Avoid ×1 and +0 (the space starts at ×2; + uses k ≥ 1). |
| 6 | One new thing | Before this lesson the pupil can USE a given rule (fill Out). **New: find the rule by testing it on EVERY row.** Step order inside the lesson: + rules (find the difference, test it) → − rules → × rules (testing + on the second row fails, so try ×). Each change is its own section. |
| 7 | Structural vs hint | Structural, kept at every level: the In / Out table, the rule frame (circle + box), and the step order "find the change, test every row". Hints that fade: the machine picture (`support: frame` → `frame-bare`), Out numbers in order (`ftTable 31` → `32`, out of order), and the grey trace of step 1 on Guided cell 1. |
| 8 | Written response | One sign and one number. Low writing load. |
| 9 | Pupil says | "In {a}, out {b}. The rule is add {n}." / "… times {n}." Then "It works for every row." |
| 10 | Misconceptions | M1 one pair only (2 → 4 written "+2" when the rule is ×2); M2 reads down the Out column (writes the Out step, e.g. "+4", instead of the In-to-Out rule); M3 sign flipped (Out < In written "+"); M4 adds when the rule multiplies, because + is tried first and only on row 1. |
| 11 | Fits our page | A 3-row table is the tall cell. 6 to a page at L (4 rows: 4 to a page, per the ftTable help). Sites fit 8–12; we fit 6. |

Where our standards override the sites: no colour; no typed "x + 3" expressions (Grade 3 has no variable); one rule kind per section (sites mix from the first sheet); a rule written as a sign plus a number, not a word answer; 3 rows minimum (some sites show 2).

**Overlap with lesson 4** (patterns on the multiplication table, taught the same week): lesson 4 owns "rows and columns grow by the same amount" and "even × anything is even". Here we do **not** use the chart and do not explain the even/odd property. × rules stay ×2, ×5, ×10 (and ×3, ×4 at ★★★). The chaining bridge links the two lessons: "A times row is a rule."

## 3. Skills

Generator evidence (`js/modules/gen-function-table.js`, emits `q.cell = {template:'function-table'}`, `selfAnswering`, provider `sheet/providers/function-table.js` with `workedSteps` + `wrongAnswer` + misconceptions):
- `ftRules` is a set over `+ - x / x+ x- /+ /-`; **`['+','-','x']` restricts it to Grade-3 one-step rules with existing options.** No new option is needed for scope.
- `band` caps every number. For × the factor is ≤ min(10, band / rows), so `band:50` with 3 rows gives ×2…×10.
- `ftTask:'rule'` uses the uniqueness guard. `outputs` fills Out. `rule-check` adds a Check row.
- `workedSteps` for a × rule already writes "Test + d: … not …". That is exactly the anchor-chart panel 3.

Sample items I derived by hand from the code (rules + n ≤ 9 at band 20, × 2–5 at band 20):
- `{ftTask:'rule', ftRules:['+'], band:20, ftTable:31}`: 2→9, 5→12, 8→15 → **+ 7**.
- `{…ftRules:['-']}`: 9→5, 13→9, 16→12 → **− 4**.
- `{…ftRules:['x'], band:50}`: 3→15, 4→20, 7→35 → **× 5** (+12 fails on row 2).

| Skill | Options | Role | Verdict |
|---|---|---|---|
| `algebra:function_table_easy` | `ftTask:'rule', ftRules:['+','-','x'], band:20, ftTable:31, support:'frame'` | **Main practice** (P3 independent, P4) | Fits with options. Its tags are 4.OA.C.5 / 5.OA.B.3; **add 3.OA.D.9 + M.EE.3.OA.8** as a secondary tag. The skill is grade-4 in `data.js:225`. Leave the grade as is: the options, not the grade, make the Grade-3 page. |
| same, per fade | ★ `ftRules:['+']`; ★★ `['-']` then `['x']` (`band:50`); ★★★ `['+','-','x'], band:50, ftTable:32` (out of order), `support:'frame-bare'` | P4 sections | Fits |
| same, `ftTask:'outputs', ftRules:['+','-'], band:20` | P0 item 4 | Fits |
| `addition:add_facts` | `constant` set as needed, band 20 | P0 item 1 | Fits |
| `subtraction:sub_facts` | band 20 | P0 item 2 | Fits |
| `multiplication:mult_facts` | `constant:[2,5,10]` | P0 item 3 | Fits |
| `patterns:number_patterns_rule` | Band A `{pattern:['add'], places:[1], rule:false}` (rule printed); Band B `{pattern:['add','sub'], places:[1,10], rule:true}` | P1 number sense | Fits. It is tagged 3.OA.D.9 already. |
| `algebra:function_table_easy` `ftTask:'rule-check'` | `ftRules:['+','x'], band:50` | Mixed partner / stretch | Fits |
| Word problem (P5) | — | P5 | **No skill fits.** No generator deals a story whose rule is read from a table. **PROPOSAL** below. Meanwhile, the maker uses the fixed story in §4 with a `function-table` cell (`ftTask:'rule'`) as the drawing. |
| ★★★ "first pair fits two rules" | — | the last row of P4 | **Option PROPOSAL** below. Meanwhile, these come up only by chance. The pool rule (§4) tells the teacher to put one on the board in We Do. |

**Proposal 1 — option `ftTrap` on function_table_easy / _hard** (skill-options.js FUNCTION TABLES block, group `difficulty`):
`{ id:'ftTrap', label:'First row', type:'enum', default:'any', values:[{v:'any', l:'Any first row'}, {v:'two', l:'First row fits + and × (2 → 4): test every row'}] }`.
The generator change: when `two` is set and the task is `rule` or `rule-check` with a × rule, row 1 = an x where x·k − x is a whole step that a + rule also fits (it always is). For example ×2 with In 2, 3, 4, 5, or ×3 with In 1 or 2. Rows stay in order (the trap is row 1). The uniqueness guard still holds through rows 2–3. Fold: none needed (new id, default `any`). Audit: `ws-content-audit` function-table rules are unchanged.

**Proposal 2 — new skill `algebra:function_table_story`** "Input-output story: find the rule", grade 3, CCSS 3.OA.D.9 (+4.OA.C.5), EE M.EE.3.OA.8.
- Problem types: a 1–2 sentence story about a repeated change (each box holds 5 pens; each ticket costs $2 more) with a 3-row table, asking for the rule and then one more Out.
- Template: `function-table` with the story above, `ftTask:'rule-check'`.
- Options: `ftRules`, `band`. Instruction: `story-rcdws`.
- Search terms plus a SKILL_STANDARDS row in the same change.
- Closest skill meanwhile: function_table_easy `rule-check`.

## 4. The V22 content

- **I Can title:** "I can find the rule in a table" (30 chars).
- **CRA stage:** Pictures (the table and machine picture are the representation). The concrete warm-up is a teacher "rule machine" box at the board.
- **Flow:** Standard. T2 has one Critical Atom and ≤ 3 new atoms; the prerequisite USE-a-rule is secure from earlier lessons.
- **Routine steps (3), icons from STEP_ICONS:**
  1. `look` "Look at In and Out."
  2. `decide` "Find the change." (+, −, or ×)
  3. `check` "Test every row."
  - Then the answer is written in the frame. The `write` icon is not needed: the frame is the write.
- **Chant:** none. The three short steps are said in the Say band; a chant would only add words.
- **Vocabulary (3):**
  - **In**: "the number that goes in". Mini-diagram: an arrow into a box.
  - **Out**: "the number that comes out". Mini-diagram: an arrow out of a box.
  - **rule**: "what the machine does to every number". Mini-diagram: a box with "+ 3" in it, 4 → [+ 3] → 7.
- **Remember:** "Remember: the rule must work for every row, NOT just one." (NEW C.4 line, key `one-pair`.)
- **Instruction strings:** P0 item 4 and P1 use `table` "Use the rule. Fill in the table." and `pattern-rule` / `pattern-find-rule`. P3 and P4 use `table-rule` "Find the rule. Write the rule." P0 items 1–3 use `add`, `subtract`, `multiply`. P5 uses `story-rcdws`. No new strings.

### T2 atoms

| # | Skill or Concept | Atom type | Teacher notes |
|---|---|---|---|
| 1 | Pre-requisite · "Key name: add and subtract facts to 20" | Fact | Needed to find a difference fast. |
| 2 | Pre-requisite · "Key name: ×2, ×5, ×10 facts" | Fact | The × rules of the lesson use only these until ★★★. |
| 3 | Pre-requisite · "Key name: use a given rule" | Conceptual | In 4, rule + 3 → Out 7. Taught earlier (P0 item 4). |
| 4 | "Key name: In and Out" | Category | Each row is a pair. Read across, not down. |
| 5 | "Key name: bigger or smaller" | Comparative | Out bigger → + or ×. Out smaller → −. |
| 6 | **CRITICAL** "Key name: test every row" | Conceptual | A rule from one row may be wrong (2 → 4). |
| 7 | "Key name: + or ×" | Comparative | If + fails on row 2, try ×. |

### T2 routine table

| Step | Task | Tag | Check it with |
|---|---|---|---|
| 1 Look | Read In {a}, Out {b} across row 1 | New | "Point to In. Point to Out." |
| 2 Find the change | Bigger/smaller; the difference, or the times | Pre-requisite (facts) | MWB: "4 to 7 is plus ___" |
| 3 Test every row **(Critical Atom)** | Put the rule on rows 2 and 3 | New | Check Question (2 → 4 table) |
| 4 Write | Sign in the circle, number in the box | Pre-requisite | Guided cell 2 |

- **How to teach:** Model + first (the difference is visible), then a × table where "+ difference" fails on row 2. The failure is the lesson. Always say the test out loud on every row.
- **Common mistakes:**

| Mistake | Broken step | Looks like | Fix | Check Question option |
|---|---|---|---|---|
| One pair only (M1) | 3 | 2→4, 3→6, 5→10 written "+ 2" | Test row 2 aloud: "3 + 2 is 5, not 6." | Option A |
| Down the column (M2) | 1 | Out 4, 6, 10 read as "+ 2" or "+ 4" | Cover with the reading strip; read one row across | Option C |
| Sign flipped (M3) | 2 | 9→5 written "+ 4" | "Did it get bigger or smaller?" | (not in CQ; watch in P4 ★★) |
| Adds when the rule multiplies (M4) | 2–3 | 3→15 written "+ 12" | "+12 on 4 gives 16, not 20. Try ×." | — |

- **T1 boxes:**
  - Tip: "Read across a row, never down the Out column."
  - Tip: "Say the test for every row."
  - Watch: "2 → 4 fits + 2 and × 2."
- **Materials:** MWBs, a reading strip (card to cover other rows), a paper "rule machine" box (a cereal box with In / Out slots, number cards), the P-pages.

### Prerequisite check (P0), most basic first

| # | Atom | Skill ref | Item kind | If missed → |
|---|---|---|---|---|
| a | add facts to 20 | addition:add_facts | 8 + 5 = [ ] | 2.OA.B.2 Add within 20 |
| b | subtract facts to 20 | subtraction:sub_facts | 13 − 4 = [ ] | 2.OA.B.2 Subtract within 20 |
| c | ×2, ×5, ×10 | multiplication:mult_facts {constant:[2,5,10]} | 6 × 5 = [ ] | 3.OA.C.7 Multiply by 2, 5, 10 |
| d | use a given rule | function_table_easy {ftTask:'outputs', ftRules:['+'], ftTable:31} | 3-row table, rule + 4 | 4.OA.C.5 Use a rule to fill a table (MathQuest library id when it exists) |

### Number sense (P1)

- **Band A (5):** `number_patterns_rule` with the rule printed (+2, +5, +10, from ones). Write the next 2 numbers.
- **Band B (5):** the same row with the rule hidden (+ or −, from ones or tens). Write the rule and the missing numbers.

### Spaced retrieval (MWB; earlier content)

1. 7 × 2 = **14**
2. 15 − 6 = **9**
3. Count by 5: 20, 25, __ → **30**

### Chaining bridge

- "Yesterday each times row went up by the same number."
- "Today the machine has a rule. We find it."

### I Do worked example (anchor chart)

- **Panel 1 (+):** In 2, 5, 8 → Out 6, 9, 12. The rule is + 4. Small numbers, a clear difference, In in order.
- **Panel 2 (−):** 10→7, 14→11, 18→15. The rule is − 3. Out is smaller.
- **Panel 3 (critical, ×):** 2→4, 3→6, 5→10. The rule is × 2. Row 1 suggests + 2; row 2 fails (3 + 2 = 5, not 6). The provider's `workedSteps` "Test + d … not …" line draws this.
- Why these: panel 3 is the M1 trap on purpose.
- Panels 1–2 come from `rule` items; panel 3 is a fixed teacher-set item until `ftTrap` exists.

### We Do

Guided cells (2–3), `ftRules:['+']` then `['x']`, band 20. Cell 1 has step 1 in grey. Pairs say the frame for each row.

### Check Question (board / MWB only)

Table 1→5, 2→10, 4→20. "What is the rule?"
- **A: + 4** → M1 (row 1 only).
- **B: × 5** ✓
- **C: + 5** → M2 (5, 10, 20 read down the Out column as "goes up by 5").

### You Do (P3 independent + P4)

- **Composition:**
  - ★ (2 sections × 3) `['+']` band 20, in order, with the machine picture.
  - ★★ `['-']` then `['x']` band 50, in order.
  - ★★★ `['+','-','x']` band 50, `ftTable:32` (out of order), `frame-bare`.
- **★★★ edge cases:** one × table whose first row also fits a + rule (×2 from In 2, or ×3 from In 1). Needs `ftTrap`; meanwhile the teacher adds one by hand.
- **Avoid:** ×1, +0, In 0, two-step rules, ÷ (not this lesson), Out over 50, and rules that land on the multiplication-table language of lesson 4.
- **Pool rule (LR-5):** + rules 1–9 × In pools to 20 give about 9 rules × many In triples. − is similar. × gives 2–10 at band 50 with distinct In 1–25/k. Every item is unique-rule-guarded. That is well over 100 usable items, so seeds never repeat on a page.

### Word problem (P5), our own story

"A machine makes toy cars. Put in 2 boxes, get 10 cars. Put in 3 boxes, get 15 cars. Put in 4 boxes, get 20 cars." Then: "What is the rule? How many cars for 6 boxes?"

RCDWS:
- Read it twice.
- Circle the numbers in the story.
- Draw the In / Out table (boxes / cars).
- Write the rule: × 5 (test it: 3 × 5 = 15 ✓, 4 × 5 = 20 ✓).
- Solve: 6 × 5 = **30 cars**.

### Exit slip (P6, 4 items, fresh numbers)

1. 3→8, 6→11, 9→14 → **+ 5**
2. 12→8, 15→11, 19→15 → **− 4**
3. 2→20, 3→30, 5→50 → **× 10**
4. 4→8, 5→10, 7→14 → **× 2** (trap: row 1 also fits + 4)

### Delivery scripts (T-SCRIPT; {…} = dealt numbers)

**S1 Prerequisite Check (4 min)**
- Do: Hand out P0. Run "3-2-1, show me" item by item.
- Say: “Show me item a.”
- Note: Mark each miss against T6 routing.
- T-LOOP:
  - Most: go on.
  - About half: reteach item d with the rule machine.
  - Fewer than half: stop; teach "use a rule" with cards.

**S2 Number sense (5 min)**
- Do: P1 band A, then band B.
- Ask: “What is the rule?”
- Say: “The rule is add {n}.”

**S3 Spaced retrieval (3 min)**
- Do: Three MWB questions. Show me.

**S4 Chaining bridge (1 min)**
- Say: the two bridge lines.

**S5 I Do (12 min)**
- Do: Feed card {chart.a} into the box and show {chart.b}. Repeat for 3 rows.
- Say: “In {chart.a}, out {chart.b}.”
- Ask: “Bigger or smaller?”
- Say: “It got bigger by {chart.n}. Test row 2.” (panel 3)
- Say: “{x2} plus {d} is {x2+d}. Not {y2}. Try times.”
- Note: Write "Wrong" beside + {d} on the board only.
- Watch: The pupils who nod at + 2 are the M1 group.

**S6 We Do (8 min)**
- Do: Guided cell 1 with step 1 in grey. Pairs: A reads the row, B tests.
- Say (frame): “In ___, out ___. The rule is ___.”
- Note: Expected answers in the key colour.

**S7 Check Question (3 min)**
- Do: Board the 1→5 table. MWB answer A / B / C.
- T-LOOP:
  - Most B: go on.
  - Many A: reteach "test every row".
  - Many C: reteach "read across" with the strip.

**S8 You Do (15 min)**
- Do: P3, then P4 ★ → ★★★. Circulate to the M1 group first.
- Ask: “Does it work on row 3?”
- Note: Early finishers do the ★★★ mixed table and say the rule.

**S9 Word problem**
- Do: RCDWS on P5, steps 1–5 aloud.
- Say: “The answer is 30 cars.”

**S10 Exit slip (4 min)**
- Do: P6. Sort the slips by item 4 (M1).

### T6

**Routing:**

| Question | Prerequisite atom | If missed → |
|---|---|---|
| P0 a | add facts | 2.OA.B.2 Add within 20 |
| P0 b | sub facts | 2.OA.B.2 Subtract within 20 |
| P0 c | ×2, 5, 10 | 3.OA.C.7 Multiply by 2, 5, 10 |
| P0 d | use a rule | 4.OA.C.5 Use a rule to fill a table |

**Accepted answers:** the sign in the circle may be written "+" or "add"; × may be "x". Accept "× 2" only. "+ 2 then ..." two-step answers are not accepted (one-step only).

**Wrong answers to look for:**

| Pupil wrote | Likely mistake | Next step |
|---|---|---|
| + {y1−x1} on a × table | M1 one pair | Test row 2 aloud |
| the step between Outs | M2 down the column | Reading strip |
| + n when Out is smaller | M3 sign | "Bigger or smaller?" first |
| + 12 for 3→15 | M4 | Try × after + fails |

## 5. Owner questions

1. **EE code.** The brief says M.EE.3.OA.9; the repo uses M.EE.3.OA.8 for "Identify arithmetic patterns". *Recommend M.EE.3.OA.8.*
2. **Rule response.** A sign circle plus a number box (the current kit frame), or a word bank ("add 3 / take away 3 / times 3")? *Recommend the frame on paper; the words go in the Say band only.*
3. **Tag function_table_easy with 3.OA.D.9?** *Recommend yes (secondary), with M.EE.3.OA.8.* This does not change the partial verdict.
4. **Build `ftTrap` and `function_table_story`?** *Recommend `ftTrap` first (small, closes the critical-atom edge case).*
