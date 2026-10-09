# Steps-box lane: independent critic, round 2

- **Critic:** mq-opus-medium, lane acceptance critic, round 2, not escalated. I did not build this lane.
- **Branch:** `claude/sweet-newton-c8wrv1-wip-aea16a31534a8fe34` @ `270aa3c` (the fix commit for round 1's D1 to D5).
- **Scope:** the lane's three fixes only: the Steps box matches its item, the hint uses the item's own names and numbers, and `add_word_problems` keeps its "how many more" stories plus the `desc` note. Anchor charts, Warm-ups and lesson layout (STATUS §10, Wave 8) and round 1's O1 to O5 are not scored.
- **Verdict: FAIL.** One row is below 8: the Skills Navigator note, C2 7 (D6). D1, D2, D3 and D5 are closed. D4 is only partly closed: the note now names start-unknown stories, but 13 of the 80 subtracting `add_word_problems` items (240 sampled) are take-away stories ("… gives 24 dollars to Omar. How many dollars does Noor have left?"). The note does not cover them, and the skill's name does not either. The D3 change has no regressions on the 9 non-word skills I checked at 1280 and 390.

## What I rendered and read

| Evidence | How |
|---|---|
| Worksheet hint popup, 360 cards (12 word skills × 3 seeds × 10 cards) | `initWorksheet` and the popup text. I compared the op word in the first line with the verb in `q.hint` and looked for a literal `<br>` |
| `multi_step_word` and `_plain`, 60 items each | `generateQuestionFor`. I checked for the Step 1 answer in Step 2, a capital verb on each step, and `<br>` as the separator |
| `add_word_problems` and `_plain`, 240 items each | the question sentence of every item with `wordWork.ops[0] === '-'`, grouped by form |
| Hint in page flow (D3) on 12 skills × 1280 / 390 × cards 0, 1 and 4 | rects for popup vs paper, popup vs other cards, overflow, horizontal scroll, close restores the geometry, paper size open vs closed |
| Feedback and pulse with the hint open | `median` (typed the right answer), `add_word_problems`, `time_5min`. I read `.mq-active-box` and its animation, `mq-live-correct` and the corner badge, then ran Check All with a hint open |
| Practice card hint and its speaker (Listen) | `showHint()` + `speakHint()` with `speechSynthesis.speak` stubbed to capture the spoken text, at 390 and 1280 |
| Support-ladder Listen | `workedStepsFor` (provider path) and the `plain(q.hint)` fallback |
| Quiz (instant feedback), Navigator preview hint line, print | the quiz view text for 4 `multi_step_word` items. `buildSheet` independent / more-practice / lesson + key for `multi_step_word` and `add_word_problems`. Legacy `formatProblemForPrint` |
| Navigator note, light and dark, 1280 and 390 | computed colour, background and contrast of `.so-popup-desc` |
| Gates | `ws-boot-smoke` OK · `ws-content-audit --skill` OK for add / add_plain / sub / sub_plain · `ws-story-lint` OK (67,120 stories) · `ws-providers-unit` OK (105,162 checks) · `node --input-type=module --check` OK on the three changed JS files |

## Round-1 defects: status

| # | Round-1 defect | Status | Evidence |
|---|---|---|---|
| D1 | The worksheet hint contradicts itself ("Use addition" + "Subtract: …") | **closed** | 0 of 360 cards contradict. A one-step word-work card now shows only `q.hint` (`Subtract: 92 − 69 = ?`). A two-step card keeps the "two steps" note |
| D2 | The multi-step hint gives the Step 1 answer away and runs on | **closed** | 0 of 120 items print the Step 1 answer in Step 2. Every step starts with a capital verb, one line per step: "Step 1: Add 49 and 29. / Step 2: Add 27 to your Step 1 answer." (`card-hint-multi_step_word-390.png`, `ws-hint-open-multi_step_word-390.png`) |
| D3 | The worksheet hint covers the story | **closed** | `position: relative` in every one of 72 checks. The popup never meets the paper, other cards, or the page edge. 0 elements overflow and nothing scrolls sideways. The paper keeps its size, and closing restores the card exactly |
| D4 | The `desc` note leaves out stories that are solved by subtracting | **partly closed** (see D6) | The note now names "at first" stories, with typographic quotes. But the take-away form (13 of 80) is still missing |
| D5 | Low contrast in the light theme | **closed** | `--text-secondary`: 8.23 : 1 light (#4F4B6B on #FFF), 8.76 : 1 dark, 12.8 px, opacity 1 |

## D3 regression check (the new rule in `css/screen-cell.css`)

| Skill (host = online worksheet) | 1280 | 390 | Notes |
|---|---|---|---|
| `addition:add_100_regroup` (column stack) | ok | ok | `ws-hint-open-add_100_regroup-390.png` |
| `fractions:shade_fraction` | ok | ok | `ws-hint-open-shade_fraction-1280.png` |
| `fractions:compare` (sign) | ok | ok | |
| `measurement:time_5min` (clock) | ok | ok | `ws-hint-open-time_5min-390.png` |
| `patterns:skip_count_line` (number line) | ok | ok | `ws-hint-open-skip_count_line-1280.png` (full-width card) |
| `composing:base10_build` | ok | ok | `ws-hint-open-base10_build-390.png`. The "Tens / Ones" labels both sit above the two boxes, but that is the same with the hint closed (paper size unchanged), so the rule did not cause it. Not scored (outside the lane) |
| `measurement:heavier_lighter_visual` (multiple choice) | ok | ok | `ws-hint-open-heavier_lighter_visual-390.png` |
| `fractions:fraction_nl_drag`, `data_analysis:median` | ok | ok | |
| `add/sub_word_problems`, `multi_step_word` | ok | ok | the story is fully visible below the hint (`ws-hint-open-add_word_problems-1280.png`) |

- **Pulse:** `.mq-active-box` stays on card 0 with the hint open (`animation-name: mq-next-glow`) on all three skills tried.
- **Live feedback:** a right answer turns the box green (`mq-live-correct`) with the hint open. Check All still scores ("Score: 0/6") with a hint open.
- **Closed state:** the rule matches only `.hint-popup.active`, so a closed card is unchanged.

## `<br>` and Listen

- **Literal `<br>`:** none on any surface. That covers the worksheet popup (360 cards), the practice-card modal, the quiz view, the Navigator preview's "Hint:" line (two lines), the kit print pages and keys (independent, more-practice, lesson), and the legacy print. The kit's `parseTwoStep(q.hint)` reads the generator's own hint before `workHint` replaces it, and `applyWordWork` runs only once, so the new hint format does not break the two-step print cell.
- **Support-ladder Listen:** reads the provider's worked steps, not `q.hint`. Its fallback `plain(q.hint)` turns `<br>` into a space ("… from 71. Step 2: …"), so it reads correctly.
- **Practice-card hint speaker** (`speakHint`, `hints-speech.js:338`): it reads `textContent`, so `<br>` disappears without a space. The captured utterance was "Step 1: Add 64 and 12.Step 2: Subtract 6 from your Step 1 answer." (N1 below).

## Score table (only what the lane touches; pass is 8 or more on all four)

| Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|
| Lesson: Guided **Steps zone** (text only) | 9 | 8 | 9 | 9 | yes (unchanged since round 1; the lesson builds with no literal `<br>`) |
| Lesson: practice-page **Steps strip** (text, where it prints) | 9 | 9 | 9 | 9 | yes |
| Practice: independent and more-practice, pupil page and key (story text after the retell) | 9 | 8 | 8 | 9 | yes (lane aspects; D6 is charged once, on the note row) |
| Screen: practice card, hint (390 / 1280) | 8 | 8 | 8 | 8 | yes (D2 closed; N1) |
| Screen: online worksheet, hint popup (1280, plus 390 checked) | 8 | 8 | 8 | 8 | yes (D1, D3 closed; N2, N3) |
| Screen: quiz (no Hint button; the ladder uses the provider's worked steps) | 9 | 8 | 8 | 9 | yes |
| Skills Navigator `desc` note (light and dark, 1280 and 390) | 9 | **7** | 9 | 8 | **no** (D6) |

### Why each passing score holds
- **Practice card 8/8/8/8:** the two-step hint is one line per step, starts each step with a capital verb, and no longer prints the Step 1 answer. It is 8 and not 9 because the one-step hint still names the operation outright ("Add: 25 + 55 = ?"), which takes the operation choice away from the pupil (accepted in round 1), and because of N1.
- **Worksheet 8/8/8/8:** the hint matches the item on every card. The open hint sits in page flow and never covers the cell, on 12 skills at both widths. Held at 8 by N2 (the row reflows) and N3 (the tick badge hides).

## Defects

### D6 · major · C2 7 (Navigator note; it is also the skill-name promise on every host) · `add_word_problems` deals take-away stories that the note does not cover
- **Where:** `addition:add_word_problems` and `_plain`, on every host. In `generateQuestionFor({category:'addition', skill:'add_word_problems', seed: 9000 + 3i, itemIndex: i % 12})`, i = 8, 10, 16, 29, 38 and 41 (13 of 240 items, 13 of the 80 that subtract).
- **Observed:** "Noor has 98 dollars. Noor gives 24 dollars to Omar. How many dollars does Noor have left?" (hint "Subtract: 98 − 24 = ?"). A plain take-away story in "Addition Word Problems". The note lists only "How many more are needed?" and "How many were there at first?", so a teacher reading it would not expect these. The forms of the 80 subtracting items: "at first" 23, "does NAME need" 44, **"have left" 13**.
- **Cause (pre-existing retell, exposed by the note):** the generator's Type 5 change-unknown money stories (`gen-operations.js` about lines 5148-5151: "Noor had 24 dollars. After earning more, Noor has 98 dollars. How many dollars did Noor earn?" and "… started with … now has … How many dollars did Noor get?") have no "how many more" in them. So `schemaOf()` (`js/modules/sheet/cells/word-work.js:310-315`) falls through to `'separate'`, and `tellStory` retells a join story as a give-away story. I confirmed this by calling `wordWorkPayload` on those two templates: both come back as `schema: "separate"`.
- **Fix (either):**
  - (a) In `schemaOf`, when `st.op === '-'` and the text matches the change regex (`after (earning|getting…)`, `started with`, `now has`) without `some`, return `'change'`. The retell is then "Noor has 24 dollars. Noor wants 98 dollars. How many more dollars does Noor need?", which the note already covers.
  - (b) Add a join change-unknown schema ("Noor had 24 dollars. Noor earned some more. Now Noor has 98 dollars. How many dollars did Noor earn?") and add that question form to the note on both skills.
  - (a) is the smaller change. Run `ws-story-lint` after either.
- **Check:** across 240 items per skill, every item with `q.wordWork.ops[0] === '-'` asks one of the question forms the note names, and none asks "… have left?" or "… left in the box?".

### Nits (do not lower a score below 8; fix in the same pass)
- **N1 · Listen on the practice-card hint runs the two steps together.** `speakHint()` reads `textContent`, so the utterance is "…64 and 12.Step 2: …", with no space or pause between the steps. Fix: in `hints-speech.js` `speakHint`, use `body.innerText`, or replace `<br>` with `'. '` before `_toSpeakable`.
- **N2 · Opening a worksheet hint at 1280 makes the neighbour cards in that row taller.** Their `.mq-wspaper` grows by the hint's height (for example 256 → 393 px for `add_100_regroup`, 662 → 759 px for `add_word_problems`), and their content moves down. Nothing overlaps and the rows stay even, but the cards beside the pupil jump. Fix: `#worksheetGrid > .problem-card.mq-wscard { align-self: start; }` only while a sibling hint is open, or keep the paper from stretching (`.mq-wspaper { align-self: start }` inside the card's flex column).
- **N3 · The green tick badge hides while a hint is open** (`screen-cell.js:687`, `hintOpen`). That rule was written when the hint covered the cell. The box is still green, and the tick comes back on close. Fix: drop the `hintOpen` test now that the hint is in page flow.
- **N4 · A rare leak in `workHint`.** When Step 2's own number equals the Step 1 answer (for example 41 + 41), only the first operand is replaced, so Step 2 still prints 41. I found 0 cases in 120 items. Fix: when both operands equal `prev`, print "Add your Step 1 answer to itself", or deal around it.
- **N5 · The two-step worksheet hint shows 💡 twice** (the title and the "two steps" note). This is chrome, so it is cosmetic.

## What raises each sub-10 to 10
- **Navigator:** D6 fixed. The note then names exactly the forms the skill deals.
- **Practice card and worksheet:** N1 to N4 fixed, and a first hint that points to the key words before naming the operation, so that choosing the operation stays the pupil's job.
- **Steps zone and strip:** as in round 1 (the Wave 8 Model work names both steps).
