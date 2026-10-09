# Steps-box lane: independent critic, round 1

- **Critic:** mq-opus-medium, lane acceptance critic, round 1, not escalated. I did not build this lane.
- **Branch:** `claude/sweet-newton-c8wrv1-wip-aea16a31534a8fe34` @ `4afb093`, graded against `origin/claude/sweet-newton-c8wrv1`.
- **Scope:** the three fixes only. Owner ruling 2026-10-03: anchor charts, Warm-ups and the other lesson-layout defects in `design/STATUS.md` §10 are deferred to Wave 8, so I did not grade them.
- **Verdict: FAIL.** Fix 1 (Steps text) passes. Fix 2 (the hint) fails on the online worksheet (C2 5) and on the practice card for `multi_step_word` (C2 7). Fix 3 (the `desc` note) fails C2 at 7.

## What I rendered and read

| Evidence | How |
|---|---|
| 12 seeds × 11 skills: story, hint, payload steps | `generateQuestionFor` in the app (seeds 101…1212) |
| Lesson Steps zone and Guided cell, at M and L, 6 seeds each, for add / add_plain / sub / mult / div / multi_step | `buildSheet({role:'lesson', practicePages:1})`, DOM text plus PNGs (`ws-grade-render --roles lesson`) |
| The same probe on the base branch (a `git archive` of `origin/claude/sweet-newton-c8wrv1`) | to tell what this lane changed from what was already there |
| Independent and more-practice pupil pages and keys, plus card 1280/820/390, worksheet and quiz PNGs | `ws-grade-render --roles independent,more-practice` |
| Hint text on the practice card (1280, 390) and on all 6 worksheet cards, for 5 skills | `showHint()`, the worksheet `.hint-popup` text, screenshots |
| The ladder's "Here is how" steps and Say line | `support-ladder.js workedStepsFor / sayFor` |
| Skills Navigator preview, light and dark, at 1280 and 390 | hovering the card, then the computed colour and size of `.so-popup-desc` |
| Gates | `ws-boot-smoke` OK · `ws-content-audit --skill` OK for add / add_plain / sub / mult / div (`multi_step_word` is outside the audit's categories) · `ws-story-lint` OK · `ws-providers-unit` OK |

## Score table (only what the lane touches; pass is 8 or more on all four)

| Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|
| Lesson: Guided **Steps zone** (text only) | 9 | 8 | 9 | 9 | yes |
| Lesson: practice-page **Steps strip** (text, where it prints) | 9 | 9 | 9 | 9 | yes (see O1: it prints for 1 skill of 6) |
| Practice: independent and more-practice, pupil page and key (story text after the retell) | 9 | 8 | 8 | 9 | yes (lane aspects; see O2) |
| Screen: practice card, hint (1280 / 820 / 390) | 8 | **7** | 8 | 8 | **no** (D2) |
| Screen: online worksheet, hint popup | **7** | **5** | 8 | 8 | **no** (D1, D3) |
| Screen: quiz (no Hint button; the instant-feedback ladder uses the provider's worked steps) | 9 | 8 | 8 | 9 | yes |
| Skills Navigator `desc` note (light and dark) | 8 | **7** | 9 | 8 | **no** (D4, D5) |

### Why each passing score holds (one sentence each)
- **Steps zone:** 48 renders across 6 skills, M and L. No step names a number or key word, and the operation step always matches the Guided cell. For example, at sub seed 222 the zone says "Circle +. Add." beside the Guided cell "Tom had some shells … at first?", and the cell is solved by adding. On the base branch the same zone printed "Write 16 and 6 in the boxes. 16 + 6 = 22. Write the answer: 22 crayons." beside other numbers. It scores 8, not 9, on C2 because `multi_step_word` names only "Step 1: Circle +. Add." and never Step 2. That is the deferred Model clamp in STATUS §10, so it is not charged to this lane.
- **Strip:** where it prints (`mult_word_problems`, M), the text is the generic six steps with the right sign.
- **Practice and key:** the retold stories keep the same numbers as the key on every sampled item. The "how many more … need" and "at first" items in `add_word_problems` are keyed as subtraction (key-p1 item d: circled −, 31 − 11 = 20).
- **Quiz:** the ladder's worked steps come from the word-work provider, never from `q.hint`. They hold only the item's own numbers, with the answer blanked as `___`, and no stray names.

## Defects

### D1 · critical · C2 −3 (worksheet), C2 5 · the worksheet hint contradicts itself on the stories this lane deliberately kept
- **Where:** online worksheet, `addition:add_word_problems` and `_plain`. Every "how many more … need" and "at first" item does it, 2 of 6 cards at `seed = 17*13` (cards 3 and 6). Screenshot: `ws-hint-add_word_problems.png`. The mirror case is `subtraction:sub_word_problems`, where every "had some … at first?" item does it: 2 of 6 cards (`ws-hint-sub_word_problems.png`).
- **Observed:** the popup reads "💡 Use **addition** — combine both numbers." and then "Subtract: 92 − 69 = ?". For sub it reads "Use **subtraction** — find the difference between the two numbers." and then "Add: 29 + 26 = ?".
- **Cause:** `js/modules/worksheet.js:63-90` `_wsOpHint(q)` picks the sentence from the skill id (`add_word_problems` → "Use addition"), and `worksheet.js:1438-1442` puts it in front of `q.hint`. Fix 2 made `q.hint` correct and fix 3 kept the subtracting stories, so the two lines now disagree on screen. Choosing the operation is exactly what the skill teaches, so this is a misteach.
- **Fix:** in `_wsOpHint`, return `''` for a word-work item (`q.cell && q.cell.template === WW_TEMPLATE`, or `q.wordWork`), because `workHint` already names the operation. Or derive the sentence from `q.wordWork.ops[0]` ('+' → addition, '-' → subtraction …). For `multi_step_word` the "two steps" line is fine to keep.
- **Check:** across 30 worksheet items per skill for add / add_plain / sub / sub_plain / word_problems_mixed, the operation word in the popup's first line equals the verb in `q.hint` on every card.

### D2 · major · C2 −1 (card and worksheet) · the multi-step hint gives away the Step 1 answer, and reads as one run-on line
- **Where:** `algebra:multi_step_word` (and `_plain`): every item, on the practice card and the worksheet. Screenshot: `card390-hint-multi_step_word.png`.
- **Observed:** "Step 1: subtract: 42 − 28 = ? Step 2: add: 14 + 48 = ?". The 14 is the Step 1 answer, which the pupil writes in the Step 1 boxes, so the hint fills half the item before any attempt (LESSONS_LEARNED L3, RUBRIC C2 "nothing gives the answer away"). The text is also lower-case after "Step 1:", has a double colon, and runs both steps together in one sentence in a box read by ELL pupils. (It is better than main, whose hint gave the whole chain and the final answer, but it still gives an answer away.)
- **Fix:** in `js/modules/word-work.js` `workHint`, for steps after the first, never print `st.top` when it is the previous step's result. Say "Step 2: Add 48 to your Step 1 answer." (for − : "Take 16 from your Step 1 answer."). Capitalise the verb ("Step 1: Subtract 28 from 42."). Join the steps with a line break (`<br>`), or return them so the modal shows one line per step.
- **Check:** across 50 `multi_step_word` items, no hint contains `steps[0].ans`, and every step starts with a capital verb.

### D3 · major · C1 −1 (worksheet), C1 7 · the hint popup covers the story it hints about
- **Where:** online worksheet, every word skill. Screenshots: `ws-hint-add_word_problems.png` and `ws-hint-sub_word_problems.png`. The popup covers the first one or two story lines ("Sam has 69 cookies.").
- **Observed:** the pupil cannot read the numbers the hint refers to while the hint is open. This is chrome over the cell, against RUBRIC C1 "chrome does not crowd, cover, or compete". It was already there, but the lane's fix puts the hint here, so it matters now.
- **Fix:** in `worksheet.js`, put `.hint-popup` for a cell-bearing card *above* the card's instruction line, in flow, pushing the cell down (or under the cell). Never use `position:absolute` over `.mq-screencell`.
- **Check:** with the hint open, the card's first story line `getBoundingClientRect()` does not intersect the popup's rectangle.

### D4 · major · C2 −1 (navigator), C2 7 · the `desc` note leaves out half the subtracting stories
- **Where:** `js/modules/data.js:591-592`, the Skills Navigator preview. Screenshots: `nav-desc-light-1280.png`, `nav-desc-dark-390.png`.
- **Observed:** "Some stories are "how many more" problems, solved by subtracting." But `add_word_problems` also deals start-unknown stories that are solved by subtracting and contain no "how many more" ("Ana had some stamps. Ana got 17 more … How many stamps did Ana have at first?" → 30 − 17; seeds 101 and 1212, and items in independent-p1 d). A teacher reading the note would not expect them. The quotes are also straight `"`, not typographic.
- **Fix:** `desc: 'Some stories ("How many more does she need?", "How many did she have at first?") are solved by subtracting.'`, the same on both skills.
- **Check:** across 240 items per skill, every item whose `q.wordWork.ops[0] === '-'` matches one of the two quoted question forms.

### D5 · minor · C1 −1 (navigator) · the note is low-contrast in the light theme
- **Observed:** `.so-popup-desc` is `var(--text-dim)`, #8B879F on #FFFFFF, 12.8 px, about 3.5 : 1, below 4.5 : 1 for text this small. Dark is #A8A2C4 on #2A2640, about 5.9 : 1, which is fine.
- **Fix:** in `css/skills-organizer.css`, give `.so-hover-popup .so-popup-desc` `color: var(--text-main)` (or the darker secondary-text token) with `opacity` unset, and keep 0.8 rem.
- **Check:** the computed contrast is at least 4.5 : 1 in both themes.

## What raises each sub-10 to 10
- **Steps zone and strip (8 to 9 → 10):** name both steps for `multi_step_word` (the Wave 8 Model work), and keep the "Look at the key words." step in all three kinds. Today a start-unknown example drops it, so the zone has 5 steps for one example and 6 for another.
- **Practice card and worksheet:** D1, D2 and D3 fixed. A first hint that points at the key words before it names the operation ("Look for: how many more, at first") would keep the operation choice the pupil's own.
- **Navigator:** D4 and D5 fixed.

## Observations outside this lane (not scored; for the orchestrator)
- **O1 · the practice-page Steps strip almost never prints (already on base).** With `practicePages: 1`, the lesson packet's practice part runs to 2 pages (add, add_plain, sub, div, mult at L) or 3 (multi_step). `print-sheet.js:2189-2200` then drops the strip ("never pushes a page overleaf"). It printed only for `mult_word_problems` at M in 48 builds, so most pupils never see fix 1's strip. The second practice page holds 2 of 6 cells with an empty half cell (`lesson-practice-add_word_problems-L-no-strip.png`, page 2), which is H5 territory. Suggest adding this to STATUS §10 for Wave 8: six word-work cells do not fit one page with the strip, so use 2 × 2 at L, or let the strip take the instruction line's place.
- **O2 · the carry-box row gives away the sign.** In the word-work cell, the + layout shows 2 small boxes above the grid and the − layout 3 (independent-p1 a/b/c vs d; worksheet cards 1 vs 2). A pupil can read which sign to circle from the box count. (LESSONS_LEARNED L3: structural scaffolds on every item or none.)
- **O3 · in dark theme the navigator preview draws the cell's story in black on the dark popup** (`nav-desc-dark-390.png`): the cell is not paper-white (SP-2). This is already there.
- **O4 · add_word_problems at Max Number 100 deals sums past 100** (89 + 17 = 106, 86 + 47 = 133, 85 + 92 = 177). The name carries no "within", so the audit passes, but the Max Number setting is not honoured.
- **O5 · the multi-step ladder's worked steps clamp at 6**, so Step 2 never appears in "Here is how" ("… 96 − 75 = 21. / Write the answer: ___ marbles."). Step 1's result is printed, while the final answer is blanked. This is the same root cause as the deferred Model clamp.
