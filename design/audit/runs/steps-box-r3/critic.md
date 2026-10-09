# Steps-box lane: independent critic, round 3

- **Critic:** mq-opus-medium, lane acceptance critic, round 3, not escalated. I did not build this lane.
- **Branch:** `claude/sweet-newton-c8wrv1-wip-aea16a31534a8fe34` @ `53dced8a` (the fix for round 2's D6 and nits N1, N3, N4, N5).
- **Scope:** the lane's three fixes only: the Steps box matches its item, the hint uses the item's own names and numbers, and `add_word_problems` keeps its subtracting stories plus the `desc` note. I did not score anchor charts, Warm-ups or lesson layout (STATUS §10, Wave 8), or round 1's O1 to O5.
- **Verdict: PASS.** Every row scores 8 or more. D6 is closed: 0 of 1,800 subtracting `add_word_problems` items are take-away stories, and every one asks a question form the note names. The three new schemas retell their templates with the same operation, the same numbers and the same answer, in grammatical, neutral sentences. N1, N3, N4 and N5 are closed. I found no regressions on the rows that passed in round 2. Three nits are listed below; none of them lowers a score below 8.

## What I rendered and read

| Evidence | How |
|---|---|
| 6,000 items from `add_word_problems`, `sub_word_problems` and their `_plain` twins, at Max Number 10, 20, 100, 1,000 and 10,000 | `generateQuestionFor` in Chromium. The browser was served a copy of `word-work.js` with one line added that saves `q.text` and `q.hint` before `applyWordWork` runs, so I could compare each retold story with the generator's own story. Only the test browser saw that line; the repo is unchanged |
| The 5363–5399 templates (missing subtrahend, compare fewer) and the matching add Types 3 and 4 (missing addend, start unknown), as real items | **These templates never deal in the live app** (see O-A). To get real items through the whole pipeline (generator → `applyWordWork` → cell → hint), I replaced `window.pickVariant` with a stub that returns 0.5 or 0.8 for the word-problem keys: 1,200 forced add items and 1,200 forced sub items |
| Each item matched to its source template line (63 of 65 templates matched by regex; the other 2 differ only in singular forms) | I read 2 samples of every (template, schema) pair and ran automatic checks on all 6,000: same set of numbers, answer equals the step's answer, hint equals `Add/Subtract: top op bottom = ?`, no "1 dollars", no number of 4 or more digits without a comma, no lower-case "the shop" problems, and the note's question forms |
| The other +/− word-work skills (`add_wp_*`, `sub_wp_*`, `word_problems_mixed`): 2,040 items | the same instrumented run, checked for misfires of the new detection rules |
| Online worksheet hint popups: 234 cards (13 skill/variant runs × 3 seeds × 6 cards), including forced take-some and compare-fewer items | `initWorksheet` + `toggleHint`: popup text, number of 💡 per popup, the op word against `q.wordWork.ops`, literal `<br>`. I also checked the popup against the paper rectangle, horizontal scroll and `position` at 1280 and 390 |
| Practice card hint and Listen: 78 items | `showHint()` + `speakHint()` with `speechSynthesis.speak` stubbed to capture the utterance. Screenshots at 390, 820 and 1280 for change, compare-more, take-some and compare-fewer |
| Tick badge with the hint open | worksheet at 390: I typed the correct answer into card 0 with its hint open, for `median` and `add_word_problems`, then read `.mq-live-correct` and each `.mq-live-badge` display |
| Lesson Guided Practice and the Steps box: 144 lesson packets (4 skills × 3 variant modes × 6 seeds × M and L) | `buildSheet({role:'lesson', practicePages:1})`. For each packet I compared the Steps box "Circle +/−" with the Guided story's operation, and checked that the Steps text holds no numbers |
| Print: independent and more-practice pupil pages and keys, lesson pages, card 1280/820/390, worksheet 1280, quiz 1280, for add / add_plain / sub / sub_plain / multi_step | `ws-grade-render --roles independent,more-practice,lesson` |
| Gates | `ws-boot-smoke` OK · `ws-story-lint` OK (79,360 stories, 17 schemas) · `ws-content-audit --skill` OK for add / add_plain / sub / sub_plain (240 items each) · `ws-providers-unit` OK (105,162 checks) · `node --input-type=module --check` OK on all 5 changed JS files |

## Round-2 findings: status

| # | Finding | Status | Evidence |
|---|---|---|---|
| D6 | `add_word_problems` dealt take-away retellings of "earn" stories | **closed** | L5150 ("After earning more … How many dollars did X earn?") and L5151 ("started with … now has … did X get?") now come back as `change`: "Ben has 6 dollars. Ben wants 9 dollars. How many more dollars does Ben need?" Of 1,800 subtracting add items (600 live, 1,200 forced): 974 are "How many more … need?" and 826 are "… at first?". **0 match neither form, and 0 end in "left?"** |
| N1 | Listen ran the two hint steps together | **closed** | Captured utterance: "Step 1: Add 97 and 41. Step 2: Subtract 24 from your Step 1 answer." (18 multi-step items, all with ". Step 2") |
| N3 | The tick badge hid while a hint was open | **closed** | With the hint open: `median` badge `ok:block`; `add_word_problems` 3 correct boxes, 3 badges `ok:block` (`ws-tick-hint-open-*.png`) |
| N4 | A same-valued Step 2 operand leaked the Step 1 answer | **closed** | `workHint` on synthetic 20+21 → 41+41: "Step 2: Add your Step 1 answer to itself." Same for −. No number is printed |
| N5 | Two 💡 in a two-step worksheet popup | **closed** | Exactly one 💡 on all 234 popups |
| N2 | Neighbour cards grow when a hint opens | not in this fix (cosmetic; unchanged) | — |

## The new schemas, template by template

The rows marked "forced" are templates the live app cannot deal today (O-A). They are graded because the brief asks for it, and because they will deal as soon as the generator's roll bug is fixed.

| Source (gen-operations.js) | Schema | Retold as | Same op / numbers / answer | Verdict |
|---|---|---|---|---|
| L5072, L5077, L5082, L5094, L5098, L5099 ("N more X than Y") | compare-more | "Leo has 6. Mia has 2 more X than Leo. How many X does Mia have?" | yes / yes / yes | faithful |
| L5073 money, L5078 distance, L5090 recipe ("Y earned/ran/uses N more.", no "than") | compare-more (new two-people rule) | the same compare-more sentence | yes / yes / yes | faithful. The rule correctly leaves L5042 "X collected 2. Y collected 8 more. How many are there in all?" as a join |
| L5086 "Class A … N more X than Class A", one-word unit | compare-more | as above | yes | faithful |
| L5086 with a two-word unit ("school supplies"): 22 of 78 Class A items | join | "Mia has 9 crayons. Mia gets 2 more crayons. How many … now?" | yes / yes / yes | **meaning changes (compare → join): nit N6** |
| L5150, L5151 (earn / get), L5155, L5159, L5163 (after reading / walking / getting more) | change | "X has a. X wants b. How many more X does X need?" | yes / yes / yes | the round-2 fix (a); covered by the note |
| L5116, L5120, L5121 (forced: missing addend) | change | as above | yes | faithful |
| L5135, L5136 (forced: start unknown) | start-add | "X had some. X got b more. Now X has a. How many at first?" | yes | faithful |
| L5363 spend, L5367 trail, L5371 class time, L5375 give, L5376 jar (forced: missing subtrahend) | take-some | "Leo had 10 dollars. Leo gave some away. Now Leo has 5 dollars. How many dollars did Leo give away?" | yes / yes / yes | faithful: the change is the unknown in both stories |
| L5390, L5394, L5398, L5399 (forced: compare fewer) | compare-fewer | "Sam has 10 crayons. Leo has 3 fewer crayons than Sam. How many crayons does Leo have?" ("1 fewer bead" for 1) | yes / yes / yes | faithful |
| L5288–L5316 take-away, L5330–L5348 compare, L5420 + start templates | separate / compare / start-sub | unchanged from round 2 | yes | faithful |
| L5164 "X started with a. Y gave X some more. Now X has b. How many did Y give?" (226 of 1,800 live add items) | start-add (unchanged rule) | "Noor had some pencils. Noor got 8 more. Now Noor has 9. How many … at first?" | yes / yes / yes | **the unknown moves from the change to the start: nit N7** |

- **Hints:** 6,000 of 6,000 retold items carry `Add: a + b = ?` / `Subtract: a − b = ?` with the step's own numbers, so the hint always matches the retold story. The practice-card modal, the worksheet popup and the quiz ladder all show it.
- **Other skills:** in 2,040 `add_wp_*` / `sub_wp_*` / `word_problems_mixed` items, the new rules never fired wrongly. There were 0 compare-fewer and 0 take-some, 6 compare-more (all true comparisons) and 6 change (all "after getting / walking more").
- **Grammar and neutrality:** no singular/plural errors, no duplicated words, no stray "The shop" inside a sentence. Names come from the neutral list and nouns from the controlled list; no story is about spending on a person.

## Score table (only what the lane touches; pass is 8 or more on all four)

| Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|
| Lesson: Guided **Steps zone** (text only) | 9 | 8 | 9 | 9 | yes. 144 of 144 packets: the "Circle +/−" step matches the Guided story, and no step text holds a number (`lesson-guided-sub_word_problems.png`) |
| Lesson: practice-page **Steps strip** (text, where it prints) | 9 | 9 | 9 | 9 | yes (unchanged) |
| Practice: independent and more-practice, pupil page and key | 9 | 8 | 8 | 9 | yes. Keys are correct and facsimile (`independent-key-add_word_problems.png`, `more-practice-key-sub_word_problems.png`) |
| Screen: practice card, hint (390 / 820 / 1280) | 8 | 8 | 8 | 8 | yes (`card-hint-*.png`) |
| Screen: online worksheet, hint popup (1280 and 390) | 8 | 8 | 8 | 8 | yes. In flow, never over the paper, no horizontal scroll, one 💡, tick kept while open (`ws-hint-*.png`, `ws-tick-*.png`) |
| Screen: quiz (the ladder uses the provider's worked steps) | 9 | 8 | 8 | 9 | yes (`quiz-sub_word_problems-1280.png`) |
| Skills Navigator `desc` note (light and dark, 1280 and 390) | 9 | 8 | 9 | 8 | yes. The string and CSS are unchanged since round 2 (contrast 8.2 : 1 light, 8.8 : 1 dark). It now matches every subtracting item the skill deals |

### Why each 8 holds, and what raises it to 10
- **Steps zone, C2 8:** correct sign on every packet. It is held at 8 by what round 1 already noted: `multi_step_word` names only Step 1, and a start-unknown example drops "Look at the key words" (5 steps rather than 6). Both belong to the Wave 8 Model work. **To 10:** name both steps, and keep step 2 in all kinds.
- **Practice pages, C2 8:** every key is right and the retold stories keep their numbers. It is held by N6 and N7 (the generator's meaning is not always kept) and by the + layout showing 2 carry boxes against 3 for − (round 1 O2, out of scope). **To 10:** N6 and N7 fixed, and O2.
- **Practice card and worksheet, 8/8/8/8:** the hint always matches the item, no answer is given away, and Listen pauses between steps. It is held at 8 because the one-step hint names the operation outright ("Subtract: 77 − 4 = ?"), so the hint takes over the choice the skill is teaching. N2 also still applies on the worksheet. **To 10:** a first hint that points to the key words ("Look for: wants, need") before naming the operation, plus N2.
- **Navigator, C2 8 / C4 8:** the note is now true for 1,800 of 1,800 subtracting items. It is held because the note is a separate line in the hover preview rather than a print-visible teacher note, and because of O3 from round 1 (the dark-theme preview cell). **To 10:** O3 fixed.

## Nits (none lowers a score below 8)

### N6 · minor · C2 (practice pages) · compare-more with a two-word unit is retold as a join
- **Where:** `js/modules/sheet/cells/word-work.js:315`, `/\bmore( \w+)? than\b/`. It allows only one word between "more" and "than". The Class A template (gen-operations.js L5086) with "school supplies" (and any two-word unit: "rock samples", "cups of flour") fails it. The two-people rule cannot rescue it, because the question "How many … are in Class B?" has no did/does. 22 of 78 Class A items, about 1.2 % of live add items.
- **Observed:** "Class A has 9 school supplies. Class B has 2 more school supplies than Class A." is retold as "Mia has 9 crayons. Mia gets 2 more crayons. How many crayons does Mia have now?" The operation, numbers and answer are the same, but the story is a join, not a comparison.
- **Fix:** `/\bmore( \w+){0,3} than\b/` (the same widening in the `compare` regex at :306).
- **Check:** over 240 add items with the Class A template forced, every item with "more … than" in `_origText` gets `schema === 'compare-more'`.

### N7 · minor · C2 (practice pages) · "Y gave X some more … How many did Y give?" is retold as a start-unknown story
- **Where:** `word-work.js:304`. `some` is true for any "some" plus "started with", so L5164 ("X started with 8. Y gave X some more. Now X has 9. How many did Y give?") becomes `start-add`: "Noor had some pencils. Noor got 8 more pencils. Now Noor has 9 pencils. How many … at first?" This affects 226 of 1,800 live add items. It was already there before this commit. The answer and the operation are right, and the note covers the "at first" form, but the known start (8) becomes the change. A change-unknown join is therefore retold as a start-unknown join.
- **Fix:** require "some" in start position, `/\b(had|has|were|was) some\b|^some\b/`, not "some more". Then add `give` to the change rule at :323 (`(earn|get|gain|save|find|collect|give)`). Without that second edit, L5164 would fall through to `separate`, which is a give-away and would reopen D6.
- **Check:** L5164 items get `schema === 'change'`, and 0 subtracting add items end in "left?".

### N8 · cosmetic · compare-fewer prints its second number without a thousands comma
- **Where:** `word-work.js:379`, `${b} fewer`, where every other number uses `countOf`/`num`. It cannot show today, because these skills cap at 100 (the largest number dealt at Max Number 10,000 was 192). **Fix:** `${num(b)} fewer`.

## Observations outside this lane (not scored; for the orchestrator)
- **O-A · Four generator story types never deal (gen-operations.js).** `pickVariant` returns the strings `'part_part_whole'` / `'start_unknown'`, but the branches after it test `roll < 0.72` and `roll < 0.86`. A string compared with a number is always false, so `add_word_problems` never deals Type 3 (missing addend, L5104–5125) or Type 4 (start unknown, L5126–5140), and `sub_word_problems` never deals Type 3 (missing subtrahend, L5353–5380) or Type 4 (compare fewer, L5381–5404). The third variant always gives Type 5. Fix: branch on the variant string and split Types 3/4/5 by a seeded draw.
- **O-B · The "What is missing" option labels do not match what is dealt** (`skill-options.js:2418-2420`). "The start (Sam had some, got 3, now has 8)" maps to `start_unknown`, which deals **compare-more** stories. "A part (8 in all, 5 are red)" maps to `part_part_whole`, which deals change-unknown stories. A teacher who ticks one of them gets something else. Fix together with O-A.
- **O-C · The active (pulsing) box sometimes renders as two yellow halves** in the − layout (`ws-hint-take-some-sub_word_problems-390.png`, `quiz-sub_word_problems-1280.png`, `worksheet-add_word_problems-1280.png` card 1). The + layout draws one solid box. This commit did not touch it; it is probably the pulse frame or a digit mirror. Not investigated.
