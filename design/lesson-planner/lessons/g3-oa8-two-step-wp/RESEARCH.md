# g3-oa8-two-step-wp — Two-step word problems with the four operations (Grade 3)

Lesson 7 of the owner's build order · Grade 3 · OA. Research phase only: no code was changed. Generator facts were
read from the code on branch `claude/sweet-newton-c8wrv1-wip-detailed-lessons-2` (2026-10-17) and sampled read-only
with `generateQuestionFor` in node (scratch harness built from `tests/scripts/test-skills-node.mjs`).

---

## 1. Tags

| Field | Value |
|---|---|
| Grade | 3 (Level 3) |
| CCSS | **3.OA.D.8**: two-step word problems with the four operations; an equation with a letter for the unknown; check by mental computation and estimation (rounding) |
| EE (repo) | **M.EE.3.OA.7** "Solve one-step real-world problems within 20, using addition or subtraction" (`ee-math.json` linkedCcss 3.OA.D.8; `SKILL_STANDARDS` of `algebra:multi_step_word*` carry it) |
| eeOwnerList | **M.EE.3.OA.8** (owner sheet row 7). The sheet's own EE *text* is the M.EE.3.OA.7 text ("one-step real-world problems using + or − within 20"); in the repo M.EE.3.OA.8 is "Identify arithmetic patterns" (3.OA.D.9). The sheet has the wrong code number. Keep `ee: ['M.EE.3.OA.7']`, `eeOwnerList: ['M.EE.3.OA.8']`, owner question Q1. |
| siteLessonId | `G3|-|twostepwordproblemswiththefouroperations` (site-lessons.json: wrmYear Y4, block Y4.B4, weeks W06–W07, supplement, "closes a Common Core standard White Rose does not teach") |
| WRM | wrmYear **Y4**. wrmSteps: none (no WRM step names 3.OA.D.8 as its teaching goal). wrmNear: **Y4.B5.S14** Correspondence problems (3.OA.A.3, 3.OA.D.8), **Y4.B10.S5** Calculate with money (3.OA.D.8), **Y2.B4.S10** Two-step problems (+/− only), **Y5.B2.S6** Multi-step + and − problems, **Y6.B2.S14** Solve multi-step problems |
| Audit | `standards-audit.js:123` marks 3.OA.D.8 **partial**: "two-step problems with × and ÷ (the skill's two steps are + and − only)", "an equation with a letter for the unknown". Build entry `multi_step_four_ops` (build-list.js:600) is the proposal that closes it. |

---

## 2. Research findings

Sources (public pages only, no logins, nothing copied):
- CCSS text, thecorestandards.org/Math/Content/3/OA/D/8 and the California framework note (www2.cde.ca.gov/cacs/id/web/339): whole numbers only, whole-number answers; when there are no brackets, use the usual order.
- Achieve the Core 3.OA.D.8 mini-assessment (achievethecore.org/file/2752): stories in which the first step is a product or a quotient and the second is a + or a −; one item asks for the equation with a letter.
- Super Teacher Worksheets 3.OA.8 page (superteacherworksheets.com/common-core/3.oa.8.html): money (buy several items at one price, then find the change) and four-story sheets.
- TES "Two Step Word Problem Solvers" (tes.com, 13100402): sheet 1 is + / − only; sheets 2–5 mix all four operations. That is the ladder: + / − two-step first, then × or ÷ in one of the two steps.
- CazoomMaths four-operation word problems A, with and without clues (cazoommaths.com): the same items with a scaffold, then without it. We fade across pages in the same way, but our scaffold is the step boxes (structural), not clue text.
- Have Fun Teaching 3.OA.8: match the story to its equation and to a "restate" card.
- MathWorksheets4Kids (primary reference) and IXL (*Grade 3: Multi-step word problems*) were not logged into for this pass; their public titles show the same split (two-step +/− and two-step with ×/÷). The builder should log in and check before the maker step (CLAUDE.md).

**The research questions (CLAUDE.md 1–11)**

1. **Problem types.** Groups then change (4 bags of 6, 5 eaten → 4 × 6 − 5). Share then change (24 shared by 4, each gets 2 more → 24 ÷ 4 + 2). Buy several then change (3 pens at $5, pay $20 → 20 − 3 × 5). Join then share (12 red + 18 blue in 5 boxes → (12 + 18) ÷ 5). Write the equation with a letter. Is the answer reasonable (rounding)?
2. **Visuals.** A bar model drawn in two stages (equal-groups bar, then a part-whole bar). Step boxes ("Step 1 / Step 2"). Sites with pictures use them only for decoration.
3. **Answer formats.** Write each step's answer and the final answer with its unit. Write the equation. Never multiple choice for the computed answer.
4. **Progression.** + / − two-step (Grade 2, prerequisite) → × or ÷ first, then + or − → + or − first, then ÷ or × (brackets) → equation with a letter → estimate to check.
5. **Edge cases.** Step 2 uses the Step 1 answer, not a story number. A story number that is not used (extra information; later lesson). The answer equals a story number. Take-away step 2 that leaves 0. Division first where the total is the bigger number in the story.
6. **The ONE new thing.** Pupils can already solve one-step × / ÷ stories (3.OA.A.3) and two-step + / − stories (Grade 2). The new thing is a **× or ÷ step that feeds a + or − step**: the Step 1 answer is a number in Step 2. The order "×/÷ first, then +/−" stays fixed all lesson. Bracket order (+/− first, then ÷/×), letters and estimating are follow-on lessons (§4 H).
7. **Scaffolds.** *Structural, stay:* the two step blocks of the kit `word-work` cell (`two-step` schema: Step 1 and Step 2 side by side, each with its own sign row), the unit bank, the answer row. *Hints, fade:* grey trace of the Step 1 sign (Guided 1), then of nothing; the oral "first … then …" frame.
8. **Written response.** Step 1 sign + numbers + answer; Step 2 sign + numbers + answer; unit word from a bank. No sentences.
9. **Say.** "First I find ___. Then I ___." and "The answer is __ {unit}."
10. **Misconceptions.** M1 stops after Step 1 (writes 24 for 4 × 6 − 5 = 19). M2 uses all three story numbers in one operation (4 + 6 − 5 = 5, or 4 + 6 + 5). M3 Step 2 uses a story number instead of the Step 1 answer (6 − 5 = 1). M4 wrong operation in a step (4 + 6 = 10 for "4 bags of 6").
11. **Fit.** A two-step word-work cell is "spacious" (`SKILL_PRINT_SIZE multi_step_word_plain: spacious`): 2 stories per page at Size L, at most 4 in 2 × 2 at M (WDS §12.1). Sites fit 6–10. We do not.

**Where our standards override the sites:** no clue text and no key-word bolding (we teach the two-step structure, not key words); black and white; at most 4 stories a page; the order of steps does not change inside the lesson.

---

## 3. Skills

### Generator evidence
- `algebra:multi_step_word_plain` (alias of `multi_step_word` in generate-question.js:97). The kit cell is `word-work`, schema `two-step` (word-work.js:33 `TWO_STEP`; sheet/cells/word-work.js:26 draws two work blocks). The story is **retold** by `tellTwoStep` (sheet/cells/word-work.js:418), which knows only + and − ("got … more", "gave away", "found … more", "lost"). Variants (`variants` option, skill-options.js:2538): add_then_sub, sub_then_add, add_then_add, sub_then_sub. **No × or ÷ step exists anywhere.**
- Samples (band 30 / 50 / range 100): "Ravi had 30 stamps. Ravi gave away 20. Then Ravi found 12 more." → 22; "Tom had 24 shells. Tom got 9 more. Then Tom lost 9." → 24 (**degenerate: the two changes cancel, the answer is the start**); range 100 gave 94 + 48 − 28 = 114 (the band bounds the operands, not the answer).
- `parseTwoStep` (word-work.js:155) already accepts × ÷ in its regex; the payload and the two-step cell would carry a × step. `barKind` reads only the LAST step, so a two-step bar is not drawn correctly; keep the bar off.
- `algebra:algebra_word_mixed_plain`: tape diagram + multi-step pool; one-step items mixed in. Not usable for this lesson.
- One-step ×/÷ stories: `multiplication:mult_word_problems_plain`, `division:div_word_problems_plain` (word-work, schemas `groups`, `sharing`, `grouping`). Good for P0.

### Skill table

| Role | Skill id | Options | Verdict |
|---|---|---|---|
| **Main practice** (Guided, P3, P4, P5, exit) | `algebra:multi_step_word_plain` | **needs option** `msOps` (below), `band: 50`, `pictures:false`, `wpCues:false` | **missing**: no × / ÷ step |
| Meanwhile (if the build is refused) | `algebra:multi_step_word_plain` | `variants:['add_then_sub','sub_then_add']`, `band:30` | covers only the Grade 2 two-step; it is P0 material, not this lesson |
| P0 a: × fact | `multiplication:mult_facts` | `constant:[2,3,4,5]` | fits |
| P0 b: one-step × story | `multiplication:mult_word_problems_plain` | facts ≤ 10 × 10 | fits (verify `ws-content-audit --skill mult_word_problems_plain`) |
| P0 c: one-step ÷ story | `division:div_word_problems_plain` | sharing, no remainder | fits |
| P0 d: two-step + / − story | `algebra:multi_step_word_plain` | `variants:['add_then_sub'], band:30` | fits (watch the cancel case) |
| P1 number sense | `multiplication:mult_facts`, `division:div_facts`, `subtraction:sub_facts` band 100 (2-digit − 1-digit) | — | fits |
| Mixed partner (spaced) | `mult_word_problems_plain` / `div_word_problems_plain` | — | fits |

**Smallest build — option `msOps` on `algebra:multi_step_word` and `_plain`** (closes most of build entry `multi_step_four_ops`; lane operations/algebra):
- `{ id:'msOps', label:'The two steps', type:'set', default:['addsub'], values: [addsub (today), 'mult-then' (× then + or −), 'div-then' (÷ then + or −)] }`. Option key appended to `skill-option-keys.js` (codec append-only; default keeps every old code).
- Generator: archetypes `mult_then_add`, `mult_then_sub`, `div_then_add`, `div_then_sub`. Facts within 10 × 10; step-2 number 2–20; answer 1–100. Hint in the parseable form "Step 1: 4 × 6 = 24. Step 2: 24 − 5 = 19". Guards (all archetypes, also fixes today's bug): the step-2 number ≠ the step-1 number; the answer ≠ any story number; step 2 never cancels step 1; the step-1 answer is not a story number.
- `tellTwoStep`: × and ÷ sentences in the controlled grammar (name repeated, one sentence per line, ≤ 4 lines — E32): "Ana has 4 bags. / Each bag has 6 apples. / Ana eats 5 apples. / How many apples are left?"; "Ben has 24 cards. / Ben shares them equally among 4 friends. / Each friend gets 2 more cards. / How many cards does each friend have now?".
- Content-audit: the name "Multi-Step Word Problems" declares no operation; check `ws-content-audit --skill multi_step_word_plain` stays OK. Standards: no new tag (3.OA.D.8 already); in `standards-audit.js` remove the "× and ÷" clause from the 3.OA.D.8 missing list (still partial: letter equation, estimate). Search terms: add "two step times", "two-step multiply then subtract" to the skill's terms.
- The maker needs: new case tests (each archetype: answer = parse of hint; guards above; E32 lines), and `wpBar` stays false for two-step (barKind is last-step only).
- Follow-on proposals (not this lesson): `msOps` values 'then-div' (+ first, then ÷ — brackets), `msLetter` (write the equation with n), `msCheck` (round to check).

---

## 4. The V22 content

### A. Header
- **I Can title:** "I can solve two-step stories" (28 chars).
- **CRA stage:** Pictures → abstract: counters in cups for Step 1 in the I Do, then the step boxes.
- **Flow: Chunked** — (a) × then + / − ; (b) ÷ then + / −. Each chunk is one new kind of first step; the second step (+ / −) is the Grade 2 prerequisite. If the owner wants one chunk only, run Standard on (a) and move (b) to the next lesson.
- **Instruction strings:** `story-work` (P3/P4/exit), `story-rcdws` (P5). A two-step line may be needed: NEW `story-two` "Read the story. Do Step 1. Then do Step 2." (9 words — trim to "Do Step 1. Then do Step 2." if the 8-word cap applies).

### B. Routine steps
| Step | Icon | Text (≤ 8 words) | Tag |
|---|---|---|---|
| 1 | `look` | Read it. What do I find first? | New |
| 2 | `write` | Step 1: groups or share. × or ÷. | New (prereq fact) |
| 3 | `decide` | Step 2: use my Step 1 answer. | New · **Critical Atom** |
| 4 | `check` | Write the answer and the unit. | ★ |

Chant: "First the groups. Then the change."

### C. Vocabulary (≤ 3)
- **step**: one part of the work. Mini-diagram: two boxes, "Step 1" → "Step 2".
- **each**: every group has the same. Mini-diagram: 3 cups with 4 dots.
- **left**: what stays after some go. Mini-diagram: 6 dots, 2 crossed.

Remember: "Remember: use your Step 1 answer, NOT a story number."

### D. Atoms (Pre-requisite first)
| # | Skill or Concept | Atom type | Teacher notes |
|---|---|---|---|
| 1 | × facts to 10 × 10 | Fact · Pre-requisite | P0 a |
| 2 | One-step equal-groups story → × | Category · Pre-requisite | P0 b |
| 3 | One-step sharing story → ÷ | Category · Pre-requisite | P0 c (chunk b) |
| 4 | Two-step + / − story | Conceptual · Pre-requisite | P0 d |
| 5 | "Each" / "bags of" names a group step | Category · New | the first sentence pair is Step 1 |
| 6 | **CRITICAL** The Step 1 answer is a number in Step 2 | Conceptual · New | arrow from the Step 1 answer box into Step 2 |
| 7 | Two steps vs one step | Comparative · New | non-example: a one-step story, only one box used |
| 8 | Eats / gives away → − ; gets more → + | Category · Pre-requisite reuse | second step |

### E. Misconceptions (with the wrong answers)
| Mistake | Broken step | Wrong answer on 4 bags of 6, 5 eaten | Fix |
|---|---|---|---|
| M1 stops after Step 1 | 3 | 24 | "Is that the question? Read the last line." |
| M2 one operation with all numbers | 1–2 | 5 (4 + 6 − 5) or 15 | count the steps before computing |
| M3 Step 2 with a story number | 3 | 1 (6 − 5) | arrow: Step 1 answer goes into Step 2 |
| M4 + for groups | 2 | 10 − 5 = 5 | "4 bags of 6: 6, 12, 18, 24." |
Check Question (board): "Kim has 3 boxes. Each box has 5 pens. Kim gives away 4 pens. How many pens are left?" A 15 (M1) · B 4 (M2: 3 + 5 − 4) · C 11 ✔.

### F. Edge cases, ★★★
- Step 2 is a take-away that leaves a small number (4 × 5 − 18 = 2). 
- A × fact with 1 or 10 (1 bag of 7; 10 bags of 3) — avoid in ★/★★, allowed ★★★ once.
- ÷ first where the total is written first and the divisor second (24 shared by 4) — ★★ in chunk b.
- **★★★ edge case:** the Step 2 number is bigger than one of the Step 1 numbers and appears first in the question line, so the M3 shortcut gives a believable answer (5 bags of 4, eats 6 → 14; M3 gives 6 − 4 = 2 or 4 + 6). And: the answer equals neither story number nor the Step 1 answer.
- Avoid: remainders; answers > 100; step 2 cancelling step 1; the same fact (or its turn-around) twice in the packet (LR-5); two stories on a page with the same Step 1 product (LR-6).

### G. P0 prerequisite questions (most basic first)
a 6 × 4 = __ (`mult_facts`) → route 3.OA.C.7 · b "3 bags. 5 apples in each bag. How many apples?" → 15 (`mult_word_problems_plain`) → route 3.OA.A.3 · c "20 stickers shared by 4. How many each?" → 5 (`div_word_problems_plain`) → route 3.OA.A.3 · d "Sam had 23. Sam got 8 more. Then Sam lost 6." → 25 (`multi_step_word_plain` add_then_sub) → route Y2.B4.S10 Two-step problems.

### H. Number pool (LR-5)
Step 1 × facts a × b, a, b ∈ 2–9 (a = groups 2–6 for ★/★★): 64 ordered facts, about 30 usable after dropping squares of 2, ×1, ×10 and turn-arounds. Step 2 c ∈ 2–20 with the answer 1–100 and c ∉ {a, b, a·b}. Chunk b: dividend = a·b ≤ 60, divisor 2–6. Need per chunk: chart 1 + 2 Another examples + Guided 2 + P3 4 + P4-1 4 + P4-2 4 + P5 1 + exit 2 + Check Question 1 = **21 distinct Step 1 facts** — within the ~30 usable (one fact once in the packet). Across both chunks 42 items: × and ÷ facts are different keys, so it fits; the maker must key freshness on the Step 1 fact AND its turn-around.

### I. PRACTICE SKILL PLAN (per page)
| Page | Items | Skill + options |
|---|---|---|
| P0 | 4 | a `multiplication:mult_facts`; b `mult_word_problems_plain`; c `div_word_problems_plain`; d `multi_step_word_plain {variants:['add_then_sub'], band:30}` |
| P1 number sense | 8–10 | A `mult_facts` (×2–5), B `sub_facts` band 100 (2-digit − 1-digit) and `div_facts` |
| P2 chart / Another examples | 3 | `multi_step_word_plain {msOps:['mult-then']}` (chunk b: `['div-then']`) — **needs build** |
| Guided (2) / P3 (4) / P4-1, P4-2 (4 each, last row ★★★) / exit (2 per chunk) | | same, ★★★ by the edge filter of the maker (pool `edge` list: M3-trap items) |
| P5 | 1 | same, `story-rcdws`, no step boxes printed (pupil draws) |
| Mixed partner | 4 | `mult_word_problems_plain`, `div_word_problems_plain` (one-step, spaced) |

What the maker would need: the `msOps` option + generator archetypes + `tellTwoStep` × / ÷ grammar; case tests (hint parse = answer; guards; E32 line count ≤ 4; E31 situations declared = `mult-then`, `div-then`, each modelled on P2 and assessed on P6); the E36-style exit check generalised (the M1/M3 wrong answers must differ from each other and from the key). No new template: `word-work` two-step blocks exist.

### J. Follow-on lessons
+ / − first then ÷ (brackets) · write the equation with a letter · check by rounding · extra information.

## 5. Owner questions
- Q1 EE: the sheet says M.EE.3.OA.8 but quotes the M.EE.3.OA.7 text. **Recommend M.EE.3.OA.7** (ee) and keep the sheet code in eeOwnerList.
- Q2 Chunked (× first / ÷ first) in one lesson, or two lessons? **Recommend Chunked**, both are needed for the W7 test.
- Q3 The letter equation (3.OA.D.8 clause) is not in this lesson. **Recommend a follow-on lesson.**
