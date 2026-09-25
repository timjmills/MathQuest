# Time and money: the content specification (P10)

Written 2026-09-25. This is the **content** specification for wave P10, the time + money family (F3 in
`design/ROADMAP.md` §3, the family after P9 place value + rounding): what a correct clock, elapsed-time and
money ladder contains for an ELL / special-education pupil at a Common Core school **in Qatar**, where six
items fill a sheet.

It follows `design/research/place-value-rounding.md` (P9) section for section and plays the same two roles:
research says *what to teach and in what order*; the design and pedagogy standards say *how it looks and how it
is scaffolded*, and they win every conflict (§1.4). Like P9 it carries **cell geometry in millimetres sized
to the hardest item** (§13), **the answer-key facsimile per cell** (§13), **the content-audit rules** (§17)
and, new for this family, **a currency model** (§2.4) and **the standards map** (§21), because the owner's
school uses Qatari riyals and dirhams and its Essential Elements workbook carries a "Qatari currency" row.

It builds on `design/catalogue/measurement-data.md` (the per-skill audit of the `measurement` category), whose
proposed ladders TM-A, TM-B and MN it adopts with corrections (§19.1), and answers the three research
questions that file left open for this half of the family (its questions 1-3; §1.5).

Nothing here changes code. No skill id is renamed, moved or removed by this document.

## Related documents

| Document | What it governs | How this document uses it |
|---|---|---|
| `WORKSHEET_DESIGN_STANDARD.md` | The visual contract | §6 slots (the two-box time slot, B(n), SL-9), §11.2 minimum sizes (clocks, digital, coins), §11.12 clocks (RP-100 … RP-104), §11.13 generic coins and notes (RP-110 … RP-116), §12 capacity. Every mm figure in §13 is derived from it |
| `PEDAGOGY_STANDARD.md` | The teaching contract | P-1, P-7, P-10, P-13, P-28, P-29, P-35; §10.4 contrast line "minute hand"; §12 starter misconceptions (two time rows); P-WP-22 (money stories); instruction keys `time-write`, `time-draw`, `coins` |
| `design/PAGE_TYPES.md` | Page roles | 3.4 visual grid (PT-VIS-2, PT-VIS-5, PT-VIS-6), 3.3 computation grid (PT-CGR-6 money), Daily Spiral Time and Money panels (PT-DSR), PT-DLG-16 coin style |
| `design/PROBLEM_TYPES.md` | Problem catalogue | 1.14 TM-01 … TM-10, 1.15 MN-01 … MN-08, RM-25 draw-hands, RL-12 timeline, RL-22 clocks, RL-23 coins, §5.3 GAP-3-01 … GAP-3-12 (placed in §19.3) |
| `design/SKILL_CELL_CONTRACT.md` | What a skill supplies | §3.6 option declarations (SCC-P11 … P16); §10.2 family note "Time and money: `clock`, `coins`"; §11 share-code safety |
| `design/catalogue/measurement-data.md` | Per-skill verdicts | §1.3 re-measures every time / money verdict; §19.1 maps its TM-A / TM-B / MN steps to this document's ladders |
| `js/modules/standards.js`, `data/standards/*.json` | The CCSS / EE map | §21 maps every time / money id, proposes corrections and names two database defects |
| `design/research/place-value-rounding.md` | P9 | the model for this document; `pickVariant` dealing (§2.2), the refusal path, the judge scope, and its misconception id style |

---

## 0. The rulings this specification is written to

Decided by the owner and in force since P3-P9; not relitigated here.

1. **A skill NAME is its declaration.** "Time to Half Hour" may not deal o'clock items as filler; "Elapsed
   Time (30 min)" may not deal "30 minutes ago" unannounced; "Counting Coins & Bills" may not deal a
   multi-select of coin combinations. Where a skill does something its name does not cover, the name is fixed
   (§19.2).
2. **Options are tick boxes, dealt round-robin off `state.itemIndex`, never rolled.** Every ticked value
   appears on the page (P-28). **Twenty of the 25 ids in scope roll a hidden branch or a per-item toss today**
   (§1.3).
3. **Options live on the skill, not the page**, travel into every page role and are saved and shared with it
   (SCC-P13 … P16). An option's `default` is the **stand-alone** value; a ladder step supplies its own values
   (ruling R2, `js/modules/skill-options.js`).
4. **One instruction per section, at most 12 words, from the library** (`time-write` "Write the time.",
   `time-draw` "Draw the hands.", `coins` "Count the coins. Write the total."). When the cell draws the item,
   `q.text` does not restate it.
5. **Structural scaffolds persist; hint scaffolds fade** H1 → H5 (P-7). In this family the structural ones are
   the **face** (rim, 12 numerals, five-minute ticks), the **two-box time slot**, the **timeline axis and its
   hour labels**, the **coin rim and value numeral**, the **note outline and value**, the **price tag**, the
   **decimal point in a money column**. Hints are the outer minute ring (5 … 55), the fives write-in ring, the
   half-shaded face, the hand-length guide rings (§13.2), the pre-drawn grey hour hand, the count-by-five coin
   dots, the running-total boxes, hop labels, and the first answer traced.
6. **Any equivalent answer is accepted** unless the instruction says otherwise (P-LG-15): `7:05` and `7:5` in
   the two-box slot's minute box, `1 h 15 min` and `75 min` where the item does not name the unit, `2.50` and
   `2.5` only on the notation step's fade (§2.3).
7. **No skill is spliced out of `SKILLS[category]`.** Retirement is a tombstone plus an alias.
8. **New skill ids append.** `node tests/scripts/ws-code-snapshot.mjs` reports today
   `OK (591 codes, 35 categories, +19 appended since the pinned baseline of 572, … 548 option round trips)`.
9. **Every page type and every screen host scores 8+ on each rubric criterion**, and **H12: the task must make
   sense on paper.** A draw-the-hands face is sized so a pupil can draw two hands of different length with a
   pencil (RP-102: D ≥ 46 mm); a coin zone holds the largest collection its section can deal (§13.0).
10. **Coins are generic value circles sized by value** (RP-110 … RP-112, owner ruling 2026-09-19). This
    document does **not** reopen that ruling; the currency option (§2.4) sits on top of it, and the one place it
    would need the standard amended (a 50 coin, a sign in a cell) is asked, not assumed (Q1-Q3).

---

## 1. Method

### 1.1 What was read, and when

All pages read 2026-09-25, **without logging in**: `~/.claude/projects/*/memory/credentials.md` does not exist
in this environment (§1.2). Membership PDFs were not opened; nothing was downloaded into the repo.

| Question | Source read | Result |
|---|---|---|
| What is the clock-reading order? | `mathworksheets4kids.com/time.php` | Eleven groups, strictly by precision: whole hours → match digital / analog (hours) → half hours → hours and half hours (real-life, choose the clock) → match (half hours) → **quarter hours** → match (quarter hours) → **5 minutes** → match (5 minutes) → **1 minute** → find the analog clock for each digital time (1 minute). Each precision gets a *read* sheet and then a *match* sheet. A.m./p.m., drawing hands, time in words and elapsed time are separate linked topics. |
| Where do drawing hands, a.m./p.m. and elapsed time sit by grade? | `k5learning.com/free-math-worksheets/topics/time` | Grade 1: **draw** and **tell** the time to whole, half and quarter hours; elapsed time in **whole hours only**. Grade 2: draw and tell to **5 and 1 minute**; elapsed time **forward / backward, whole and half hours**; a.m./p.m.; calendars. Grade 3: draw and tell to 5 and 1 minute; elapsed time forward / backward at 5 and 1 minute intervals; elapsed time on a calendar. Grade 4: time word problems only. **Draw and tell are paired at every precision** (the production twin of every reading step). |
| How is elapsed time drawn on paper? | `mathworksheets4kids.com/elapsed-time.php` | Grades 2-3: hourly and half-hourly; grades 3-5: **number line (timeline) with 5-minute increments** as the primary visual; word problems (single event); digital clocks incl. 24-hour; grades 4-5: **pupil draws the hops** on the line; **missing time values on the line**; start / end / duration **tables** (find the start, find the end, find the duration: three separate sheets). The site uses **no analog faces** on elapsed pages. |
| What intervals do drill sheets use, and where is the hour hand at half past? | `math-drills.com/timeworksheets.php` | Read and **sketch** (draw) at 1 hour, 30, 15, 5 and 1 minute, 12 or 4 clocks a page; 24-hour versions; elapsed time to 1, 5 and 15 minutes up to 5 or 24 hours. The site states that at 6:30 **"the hour hand will be half way between the 6 and the 7"** — the hour hand is drawn between the numbers from the half-hour step (catalogue research question 1). |
| What is the US money order? | `mathworksheets4kids.com/counting-money.php`, `/making-change.php`, `/counting-coins-bills.php` (search summary) | Currency recognition and charts (US, UK, Canada, **Australia** — no Gulf currency) → value of individual coins / bills (K-2) → counting (K-3) → amounts in words (1-3) → add / subtract money (2-4) → **compare and order with < > =** (2-4) → **making change** (3-5) → rounding and estimation (4-6). Making change is taught four ways: subtract the price; **pay with the fewest coins and notes** (how many of each); colour / select the coins of the change; shopping stories with receipts. Grade 2 change stays **under $1**; above $100 only at grade 4. |
| What does a K5 money sequence contain? | `k5learning.com/free-math-worksheets/topics/money` | K: match coins to names and to values. Grade 1: count US coins **up to 6 coins**; Canadian coins; identify international coins. Grade 2: count **up to 10 coins**; coins and bills **up to $5**; money in words. Grade 3: coins and bills; shopping stories; money notation. Grade 4: word problems in $X.XX. So the collection size grows **6 → 10 coins**, and bills enter at **$5**. |
| What does IXL's grade 2 time / money sequence look like? | `ixl.com/math/skill-plans/into-math-grade-2.pdf` (the public alignment PDF; skill pages themselves need a login) | Money, in order: count money — pennies and dimes only; names and values of common coins; count money up to 1 dollar; equivalent amounts up to 1 dollar; exchanging coins with pictures; exchanging money (I, II); **how much more to make a dollar**; count money up to 100 dollars (bills); add money up to 1 dollar (and word problems); **do you have enough money up to 1 dollar**, then up to 5 dollars; correct amount of change; making change. Time: match analog and digital clocks; match analog clocks and times; match digital clocks and times; read clocks and write times — hour and half-hour; **time words — o'clock, half, quarter**; read clocks and write times; **AM or PM**. IXL starts counting with **two coin kinds only** (1 and 10) before a mixed set. |
| What are the Qatari denominations? | public search results (Qatar Central Bank series via Wikipedia / currency guides) | **1 riyal = 100 dirhams.** Coins: **1, 5, 10, 25, 50 dirhams**. Notes: **1, 5, 10, 50, 100, 200, 500 riyals** (the 200 note arrived with the fifth series, 13 Dec 2020). The school's Essential Elements workbook row lists **1, 5, 10, 50, 100, 500** — it predates or ignores the 200 note, and names **no coins**. There is **no 20 note**, so riyal counting jumps 10 → 50. |
| What does the Common Core require, and where? | CCSS text in `data/standards/ccss-math.json` | **1.MD.B.3** tell and write time in hours and half-hours, analog and digital. **2.MD.C.7** to the nearest five minutes, **using a.m. and p.m.** **2.MD.C.8** word problems with dollar bills, quarters, dimes, nickels and pennies, **using $ and ¢ symbols appropriately**. **3.MD.A.1** to the nearest minute; measure time intervals in minutes; add and subtract time intervals, **e.g. on a number line diagram**. **4.MD.A.1** relative sizes of hr, min, sec; express a larger unit in a smaller one (2-column table). **4.MD.A.2** word problems with intervals of time and money, simple fractions or decimals, **number line diagrams with a measurement scale**. |
| What do the Essential Elements (Wisconsin 2022 + the school workbook) require? | `data/standards/ee-math.json` | **M.EE.1.MD.3** concepts of time (today / yesterday / tomorrow; morning / afternoon / day / night; before, next, after; telling time is the same every day). **M.EE.2.MD.7** on a **digital** clock, the hour that matches a routine activity. **M.EE.2.MD.8** money has value. **M.EE.3.NBT.3** count by tens using models (**e.g. money**: "given three dimes, count by 10"). **M.EE.3.MD.1** tell time **to the hour on a digital clock**. **M.EE.4.MD.1** minutes / hour as the smaller unit of a larger one. **M.EE.4.MD.2** (a) digital clock; analog **to the nearest hour**; (d) identify penny, nickel, dime, quarter and their values. **M.EE.5.MD.1** (a) analog or digital to the **half or quarter hour** (workbook: digital to the minute, analog to five minutes); (c) **relative value of collections of coins**. Workbook row under **M.EE.4.MD.5**: **"d. Identify and use Qatari currency in various denominations"** — identify the notes, choose a note by name and value, **order notes least to most**, **count like notes** ("five 10 Riyal notes"). |

### 1.2 What could not be read, and what that costs

- **No login.** The credentials file named in `CLAUDE.md` is not present in this container, so MW4K and IXL
  were read as public pages only. IXL's per-skill pages return navigation only without a login; the
  **public alignment PDF** gave the skill titles and order, which is what this document uses. No IXL response
  format is copied (P-29 forbids it anyway).
- **Membership PDFs** (MW4K, K5) were not opened: *order* and *named types* are used, never layouts or wording.
- **Qatari practice** (which coins are in daily use, how prices are written on labels in Doha) is not in any
  source read; it is asked (Q12), not assumed. The denominations themselves are well documented.
- Misconception evidence (§14) leans on the standards' starter list (two time rows), the catalogue's defect
  notes and the generators' own distractor logic; entries not traceable to a source are tagged **[house]**.

### 1.3 The family as it really is today

Measured for this document, 2026-09-25, at `7b23929`, through the gate's own mechanism:
`generateQuestionFor({ category: 'measurement', skill, range, decimals: 0, seed: 7000 + i, itemIndex: i })`
inside the Puppeteer harness (`tests/lib/ws-harness.cjs`), **60 items at Max Number 100 and 60 at 1,000 per
id**. Zero console errors. Every figure below was identical at 100 and 1,000 except where noted — **Max
Number is ignored by every time id**, and by the money ids except `money_count`'s note cap. The script lives in
the session scratchpad only.

| Id | Gr | distinct / 60 | answer types (of 60) | print formats | items with `options` | other defects measured |
|---|---|---|---|---|---|---|
| `time_hour` | 1 | 20 | text 41, **clock-set 19** | 2 | 41 | colour 41 / 41 read items (random `colorScheme`, purple title div) |
| `time_half_hour` | 1 | 35 | text 41, clock-set 19 | 2 | 41 | **20 of 41 read items are o'clock** (`pick([0, 30])`) |
| `time_quarter` | 2 | 42 | text 41, clock-set 19 | 2 | 41 | 7 o'clock and ~10 half-past items folded back in (`pick([0,15,30,45])`) |
| `time_5min` | 2 | 53 | text 41, clock-set 19 | 2 | 41 | fives ring absent; minute 0 in the pool |
| `time_1min` | 2 | 59 | text 41, clock-set 19 | 2 | 41 | grade tag 2 (content is 3.MD.A.1) |
| `time_analog_digital` | 2 | 57 | **clock-choice 20, dnd-generic 19, text 21** | 2 | 21 | three tasks in one id; the dnd branch prints "Drag … EARLIEST to LATEST"; **two** clocks to choose from (a coin toss); print draws the correct clock only |
| `time_match_clock` | 2 | 48 | clock-choice 60 | 1 | 0 | **the hint states the digital time on 60 / 60**; print draws the correct clock only; wording "two oh-five" |
| `order_clocks_*` (4) | M | 60 each | dnd-generic 60 | 1 | 0 | "Drag" and capitals on 60 / 60; **prints empty** (catalogue: the print whitelist drops `q.tiles`); 3-5 tiles at random; 12:30 sorts before 1:00 with no a.m./p.m. |
| `elapsed_30min` | 3 | 45 | text 41, clock-set 19 | 2 | 41 | forward / backward tossed per item; ⏰ emoji on 41 / 41 |
| `elapsed_hour` | 3 | 56 | text 41, clock-set 19 | 2 | 41 | as above; the minute is never a sub-step |
| `elapsed_15min` | 3 | 55 | text 41, clock-set 19 | 2 | 41 | 15 / 30 / 45 and forward / backward tossed per item |
| `elapsed_mixed` | 3 | 56 | text 41, clock-set 19 | 2 | 41 | hours **and** minutes with no bridging step |
| `elapsed_find_duration` | 3 | 53 | number 60 | 1 | 60 | **answer is total minutes while the screen shows two dead inputs labelled hours / minutes**; the hint prints `h × 60 + m = answer` on 60 / 60; gradient panel; start always 8-11 a.m. |
| `elapsed_visual_easy` / `_medium` / `_hard` | 3 / 3 / 4 | 58 / 59 / 60 | text 41, clock-set 19 | 2 | 0 | clock pairing analog / digital / mixed tossed per item; "hard" adds 7, 13, 22, 37 … minute gaps (arithmetic, not time); the hint gives the hour count |
| `money_count` | 2 | 59 | **number 27, text 16, multi-select-check 17** | 2 | 17 | four modes rolled (coins 35%, notes 25%, mixed 20%, "make" 20%) plus a 25% "Click ALL" whose labels carry 🪙; **largest total 41,000 cents ($410) at Max Number 100**; answer format flips between cents and a `"5.30"` string; coins drawn at **US relative sizes** (dime smaller than nickel, `svgR` 30 / 38 / 34 / 44) **with ¢ inside the coin**, against RP-111 and RP-116 |
| `money` | 2 | 58 | **col-arith 22, col-subtract 21, multi-select-check 17** | 2 | 17 | total and change tossed per item; prices are random cents ($4.37) from the first item, so change regroups across zeros at once; float arithmetic |
| `equiv_coin_sets` | 2 | 40 | multi-select-check 60 | 1 | 60 | "Click ALL"; options are HTML with inline SVG that the print cell cannot draw; each set prints its own sum "(25+10+5)" |
| `enough_money` | 2 | 60 | multiple-choice 60 | 1 | 60 | coins filled brown / silver / gold (`coinStyles`); the hint prints the total; "No, you need more" |
| `make_change_least_coins` | 3 | 42 / 46 | coin-builder 60 | 1 | 0 | the hint prints the greedy answer on ~22 / 60; **a 100 coin** outside the owner's set; the worksheet path rewrites the item as "these coins make 47¢ … how many coins is that?" with the coins drawn (P-29: two skills on two media) |
| `mixed_time` | M | 58 | text 38, clock-set 15, clock-choice 6, number 1 | 6 | 27 | inherits all of the above |

What those numbers mean, in the order the wave should care:

1. **A third of every clock page is a different skill** (P-28). Every reading and elapsed id deals a 30%
   "Set the clock" item (**19 of 60** in each) — a draw-the-hands production item dropped unannounced into a
   write-the-time page, with a different slot, instruction and key. Three elapsed ids also toss forward /
   backward per item, `time_analog_digital` tosses three tasks, and the `elapsed_visual_*` trio tosses the
   clock pairing. The page that results cannot state one instruction.
2. **The steps below leak into the steps above.** `time_half_hour` deals o'clock on half its reading items,
   `time_quarter` deals o'clock and half past on about 40%. A precision step must deal **only its new
   positions** plus a declared review share (§2.2), or P-1's "one new thing" is not true of the page.
3. **The answer is on the item** (Q-8, RP-1). `time_match_clock` prints the digital time in the hint on 60 / 60;
   `elapsed_find_duration` prints the whole computation; `enough_money` prints the coin total;
   `make_change_least_coins` prints the greedy set; the reading hints name the minute value ("The long hand at 6
   means half past"). On paper, `measurement-clock-match` draws **only the correct clock**, so every "Which
   clock shows …?" item is answered by the page.
4. **Production is turned into choice on screen** (P-29, RM-P-01). Every reading item carries four
   `options`, and `question-render.js` turns any non-empty `q.options` into four buttons: 41 of 60 items per
   reading id are write-in on paper and multiple choice on screen.
5. **Three things print nothing usable.** The four `order_clocks_*` ids (empty cells), `equiv_coin_sets`
   (inline SVG in a text cell) and the multi-select branches of `money_count` / `money`.
6. **Coins break the standard two ways.** `money_count` draws value circles at **US relative sizes** with **¢
   in the coin** (RP-111, RP-116); `renderValueCoin` (the other three ids) fills them brown / silver / gold
   (INK) and includes a **100 coin** (RP-110). The catalogue called `money_count`'s coins "already right"; the
   sizes are not (`svgR` dime 34 < nickel 38).
7. **Max Number does nothing, and the money band is unbounded.** No time id reads `range`; `money_count` reaches
   **$410** at Max Number 100 because notes are "capped" at `max(range, 20)` per note, not per total. A grade 2
   page can ask a pupil to count four $100 notes.
8. **Only US money exists.** `$`, `¢`, "cents", "dollars", "bills", "penny … quarter" are hard-coded in
   `money_count` and `money`; the school's EE row asks for Qatari notes; no id can deal them.
9. **What is right, and should be built on.** `svg-clock.js` already draws the hour hand at `30h + 0.5m`
   degrees (RP-101: between the numbers), tells the hands apart by length and weight in mono (INK-6), writes
   12 never 0, and has `addTime` / `subtractTime` / `getElapsedTime` that cross noon and midnight correctly;
   `generateTimeDistractors` already encodes three real misconceptions (swapped hands, off by one hour,
   quarter past ↔ quarter to) — it becomes `wrongAnswer`; the `clock-set` widget (RM-25) and the
   `coin-builder` widget (RM-19) are the right screen twins; `money`'s column workmats (`col-arith`,
   `col-subtract` with a decimal track) are the right cell once the print whitelist passes their fields.

### 1.4 Where the research and the standards disagree

Recorded, not followed.

| The sites do this | We do not, because |
|---|---|
| 12 clocks a page, 4 × 3 | `WORKSHEET_DESIGN_STANDARD.md` §12: clock read 16 / 9 / 9 (Auto 6 at L); draw the hands 9. A 1-minute face needs D ≥ 42, a draw-the-hands face D ≥ 46 (RP-102) |
| Realistic US / UK / Canadian / Australian coin and note art; "colour the coins" | RP-110 / RP-112: coins are generic outlined value circles, notes generic rectangles with a value; pages are black and white (INK-1). "Colour the coins" becomes "draw the coins" in dotted placeholders (RM-19) |
| US coin sizes (dime smallest) | RP-111: size by value, 1 smallest, 25 largest, 2.25 mm a step. A bigger coin is always worth more. Real Qatari coins do not follow US sizes either, so size-by-value is the only rule that serves both currencies |
| Match / choose between 2 clocks ("which clock shows …?") | A 1-of-2 choice is a coin toss. Choose-one cells show **3** faces (RM-07); the matching page (hands-match) draws lines between 4 and 4 |
| Elapsed time with two analog clocks only (IXL) or a timeline only (MW4K) | Both are used, in order: the **timeline** is the working representation from the first elapsed step (3.MD.A.1 names it; PEDAGOGY Level 3 "elapsed time on a timeline"); two faces are a *reading* front end that feeds the same timeline (TE-7) |
| 24-hour digital clocks at grades 3-5 (MW4K, math-drills) | Not in CCSS K-5. Out unless the owner asks (Q9) |
| "Time words: quarter to" alongside "quarter past" in one skill (IXL) | P-1: "quarter to" counts **back** from the next hour and is the classic reversal (M-T4). It is its own step (TR-6), after "quarter past" |
| Making change "above $100" at grade 4 and receipts with tax | Band-bound (§2.1); tax and discounts are grade 6+ and out |
| "Pay with the fewest coins and bills" written as a count ("how many coins?") | The answer is the **set**, not a count, or the key cannot be a facsimile (AK-1) and the task is not the skill's name. Paper: write how many of each value in a tally table (§13.9); screen: the coin builder |
| Money notation `$4.37` everywhere from the first page | PT-VIS-6 / SL-9: generic-coin totals are plain numbers. The sign enters at **one** step (MW-3) and only when the currency option names a currency (§2.4) |

### 1.5 Answers to the catalogue's open research questions (1, 2, 3)

| Catalogue question | Answer found | Where it lands |
|---|---|---|
| **(1)** Which minute values appear on grade 1-2 "read the clock" pages, and is the hour hand drawn between numbers at the half hour? | Precision steps are **hour → half hour → quarter hour → 5 minutes → 1 minute** (MW4K, math-drills, K5); each is its own sheet. Math-drills states the hour hand is halfway between the numbers at :30. | TR-2 … TR-9; RP-101 geometry kept; "the hour hand between two numbers" is TR-4's case (M-T2) |
| **(2)** How do printed elapsed-time pages draw the timeline; are both clocks shown; where does a.m./p.m. enter? | MW4K: timeline with 5-minute increments, pupil-drawn hops at 4-5, missing values on the line, **start / end / duration as three separate sheets**; no analog faces. K5: whole hours at grade 1, forward / backward at grade 2. IXL / 2.MD.C.7: a.m./p.m. at grade 2 as its own skill. No public page crosses noon on a first elapsed sheet. | TE ladder: timeline structural from TE-1; unknown moves end → duration → start as three steps; **crossing noon is its own case step (TE-9)**; `time_sense` carries a.m./p.m. (TR-11) |
| **(3)** The US order for coin counting; like coins first? dot cue? which coin set at which grade; notes before or after decimal notation? | IXL starts with **two kinds (1 and 10)**, then names / values, then mixed to 100; K5 grows 6 → 10 coins and brings bills in at $5 at grade 2; MW4K puts **amounts in words / notation after counting** and **compare / order** before change. EE 3.NBT.3 counts like 10s. | MC ladder: like coins first (MC-1 … MC-3), two kinds, then mixed biggest-first with the dot cue; notes (MB) **before** decimal notation (MW); compare (MS-4) before change (MP-5) |

---

## 2. The generator contracts the rulings imply

### 2.1 What "within N" means in this family

P-35 bounds the **answer**. Time is a fixed domain (a 12-hour face); money is a banded quantity.

| Skill shape | What bounds the page | Consequence |
|---|---|---|
| Read / draw / match / order a time | the **precision** (hour, half, quarter, 5 min, 1 min) — the skill's name — and nothing else. Max Number does not apply (fixed domain, `CLAUDE.md` "unless the skill has a fixed domain") | the dialog does not show Max Number for these ids; the precision option **is** the difficulty |
| Elapsed time | the **step size** (whole hours, 30, 15, 5, 1 min) and the **span** (the longest interval: 1 h, 2 h, 3 h, 5 h) | span bounds the answer ("elapsed within 3 hours"); the timeline's scale is chosen from the span (§13.5) |
| Count coins / notes | the **total** (the answer): "to 25", "to 50", "to 100" (1 whole unit), "to 5 units", "to 20 units", "to 100 units", "to 500 units" | the collection is dealt to the total, and the **coin count** is a separate cap (6 at the first steps, 10 later, K5); a band too small for the ticked denominations is refused ("Notes of 50 need Totals to 100 or more") |
| Show an amount / fewest coins | the target amount | as counting |
| Totals and change (columns) | **the total** for +, **the amount paid** for − (the minuend, P-35) | "change from 5" never pays with 10; prices below the band |
| Enough? / compare two collections | the larger collection | |

**Max Number maps to the money band** only where the teacher has not set the skill's own band: a band option
is declared, and `min(band, Max Number × 100 minor units)` is **never** silently applied. As in P9 (ruling 2),
a band the dialog cannot host is refused with a sentence, not relaxed.

### 2.2 Types are dealt, not rolled

Every `Math.random() < p` branch and per-item toss becomes a tick-box option dealt through
`pickVariant(cyclerKey, [...])`, or a new id when it is a different skill:

| Branch today | Where it goes |
|---|---|
| 30% "Set the clock" in all five reading ids | `response: write / draw` on each reading id (TH ladder). **Not** a new id — see Q4 for the catalogue's `set_clock` alternative |
| 30% "Set the clock to N later" in every elapsed id | dropped: an elapsed item's answer is a time or a duration, written; drawing the end time is TE-4's `response: draw` on `elapsed_hour` only |
| `pick([0, 30])` in `time_half_hour`, `pick([0,15,30,45])` in `time_quarter`, 0 in `time_5min` | `review: none / some` (default **none**): the step deals only its new positions; `some` adds ≤ 1 in 6 from the steps below, declared in the teacher footer |
| forward / backward toss (`elapsed_30min`, `_hour`, `_15min`) | `dir: later / earlier` option (TE-1, TE-2) |
| `time_analog_digital` three tasks | `dir: analog-to-digital / digital-to-analog`; the dnd order branch is **dropped** (it is `order_clocks_*`) |
| `elapsed_visual_*` analog / digital / mixed pairing | `faces: analog / digital / mixed` option, one per section |
| `elapsed_visual_hard` odd gaps 7, 13, 22, 37 … | dropped (catalogue): gaps are multiples of the step size |
| `money_count` four modes + 25% multi-select | `kind: like / two / mixed / notes / notes-and-coins` (MC, MB); the multi-select is **dropped** (it is `equiv_coin_sets`) |
| `money` total / change toss + 25% multi-select | `task: total` on `money`; change is NEW `money_change` (catalogue); the multi-select dropped |
| `enough_money` 50 / 50 | kept as a **balanced deal** (3 enough, 3 not enough per 6, audited), not a toss |
| `make_change_least_coins` worksheet rewrite | deleted: both media ask for the set (§13.9) |

### 2.3 Edge cases are content (P-10)

Each must be generable and must appear in any seeded set of 6 or more for the step that names it:

| Skill shape | Edge items | Why |
|---|---|---|
| Read the time | **12 o'clock** and **12:30** (the hour hand between 12 and 1); **1:00** (after 12); a half past where the hour hand's **left** neighbour is the answer (2:30, not 3:30); **:55** (the hour hand almost on the next number); **:05** (the leading zero) | M-T2, M-T6, M-T7 |
| Draw the hands | half past (hour hand between two numbers), :45, and **12:00** (hands overlap: the minute hand is drawn on top, RP-101) | M-T8 |
| Quarter to | 11:45 → "quarter to 12", and **12:45 → "quarter to 1"** | M-T4 across 12 |
| Order times | a set that **crosses 12** (11:30, 12:15, 1:00) labelled a.m./p.m. or held inside one morning (Q10) | M-T9 |
| Elapsed | crossing the hour (3:45 + 30 min), **crossing 12** (11:30 + 2 h = 1:30), crossing noon a.m. → p.m. (its own step), a whole-hour interval from a non-zero minute (4:15 + 2 h) | M-E2, M-E3 |
| Count coins | a single coin; **six of the same coin**; a collection whose count is larger than its total's leading digit (5 × 1 = 5, not 5 coins of 25); two 25s (25, 50 — the step that confuses pupils counting by 5s); a collection totalling **exactly 100** (one whole unit) | M-M1, M-M3 |
| Notes | the jump over a missing note (QAR has no 20: 50, 60, 70 after 10s); US 20s | M-M11 |
| Notation | **x.05** (the zero hundredth), **x.50** (written 2.50, not 2.5 on the framed step), **0.75** (no whole units), **3.00** | M-M4 |
| Change | paying with an exact whole unit (5.00 − 3.25), a **zero in the tenths** of the change (5.00 − 4.95 = 0.05), no change due | M-M6, M-M7 |

### 2.4 The currency model

The owner's school is in Qatar; the design standard's coins are generic; CCSS 2.MD.C.8 names US coins and the
$ / ¢ symbols; the EE workbook names Qatari notes. One option carries all three.

**`currency` (enum) — values `plain` / `qar` / `usd`.** It is a skill option on every money id (so it rides
into every page role and the share code), and the owner's default is Q1.

| Aspect | `plain` (the standard today) | `qar` — Qatari riyal | `usd` — US dollar |
|---|---|---|---|
| Coin values drawn | 1, 5, 10, 25 | 1, 5, 10, 25, **50** (dirhams) | 1, 5, 10, 25 (cents); 50 not dealt |
| Coin drawing | RP-112 generic circle, value numeral only, sized by value (RP-111) | **the same drawing**; the 50 coin at **26.51 mm** (the next 2.25 mm step, scale 1.0) — a standard amendment (Q2) | the same drawing |
| Note values drawn | 1, 5, 10, 20 (RP-115) | 1, 5, 10, **50, 100, 200, 500** (riyals) | 1, 5, 10, 20, (50, 100 at band ≥ 100) |
| Note drawing | RP-115 generic rectangle, value in the centre and two corners | the same (no portraits, no Arabic script, no national art — RP-110, P-WP-22) | the same |
| Minor unit per major | 100 (implicit) | 100 dirhams = 1 riyal | 100 cents = 1 dollar |
| Unit word after a blank (SL-5) | none (SL-9: plain number) | `dirhams` / `riyals`; on the notation step `QR` (Q3) | `cents` / `dollars`; on the notation step `$` and `¢` |
| Coin names in the vocabulary box | "coin", "value" | "dirham", "riyal", "note" | "penny, nickel, dime, quarter" — **printed in a key box beside the value** (a name ↔ value table), never on the coin (Q3) |
| Stories (P-WP-22) | "coins" | riyals / dirhams in story text | dollars / cents in story text |

Rules:

1. **The drawing never changes with the currency** beyond the value numeral set. A pupil who can count generic
   25s can count 25 dirhams or 25 cents; that is the point of generic coins, and it is why the default can be
   changed without re-teaching.
2. **The currency never changes the arithmetic** — the generator works in minor units (integers, never floats:
   today's `money` float arithmetic goes) and formats at the end.
3. **The sign appears in exactly three places** when `currency ≠ plain`: story text (RP-116 today), the unit word
   after a word-problem blank (SL-5 today), and — the amendment Q2 asks for — the **notation** step MW-3 and the
   money column cells, where `2.MD.C.8` requires "$ and ¢ symbols appropriately". It never prints on a coin, a
   note, a header, a title or an instruction.
4. **Denomination sets are per currency, and the dialog refuses a pair that cannot be dealt**: `kind: notes`
   with `currency: qar` and a band of 20 cannot use the 50 note; `currency: usd` never offers the 50 coin.
5. **The Qatari EE row** (identify, choose by name and value, order least → most, count like notes) is served by
   MV-4, MB-1 … MB-3 and MS-4 at `currency: qar` (§21).

### 2.5 The option schema per skill (against `SKILL_CELL_CONTRACT` §3.6)

Every option is **honoured by the generator** once the step it serves is built (SCC-P11). Defaults are the
stand-alone values. `level` (Support level 3 / 2 / 1 / 0, a set, fading) is universal and not repeated. The
`group` column is the dialog grouping already in `skill-options.js` (`difficulty` = easier / harder,
`support` = more / less help, `layout`). **Every option is usable in print and on screen**: the last column
says what the screen does with it, so no option is paper-only or screen-only.

| Skill | Option (type) | Values | Default | Group | Serves | Screen twin |
|---|---|---|---|---|---|---|
| `time_hour`, `time_half_hour`, `time_quarter`, `time_5min`, `time_1min` | `response` (enum) | write the time / draw the hands | write | layout | TR, TH | write: two-box `__:__` inputs; draw: `clock-set` (RM-25) |
| | `review` (enum) | none / some (≤ 1 in 6 from earlier precisions) | none | difficulty | TR-*, P-1 | same deal |
| | `face` (enum, `time_5min`, `time_1min`) | plain / minute ring (5 … 55) / fives write-in ring | plain | support | TR-7, TR-8 | ring drawn identically; write-in ring = 12 small inputs |
| | `quarter` (set, `time_quarter`) | quarter past / quarter to | both ticked → two sections | difficulty | TR-5, TR-6 | — |
| | `stimulus` (enum, draw only) | digital readout / time in words | digital | difficulty | TH-1, TR-10 | same |
| | `amPm` (bool, `time_5min`, `time_1min`) | circle a.m. / p.m. beside the slot, from an activity line | off | difficulty | TR-11 | tap-to-ring |
| `time_analog_digital` | `dir` (enum) | analog → digital (write) / digital → analog (choose 1 of 3) | analog → digital | difficulty | TO-1, TO-2 | write / ring |
| | `precision` (enum) | hour / half / quarter / 5 min / 1 min | 5 min | difficulty | TO-1 | — |
| `time_match_clock` | `precision` | as above | 5 min | difficulty | TO-3 | — |
| | `response` (enum) | choose 1 of 3 faces / match 4 to 4 with lines | choose | layout | TO-3, hands-match | ring / tap-pair lines |
| `order_clocks_*` (4) | `count` (enum) | 3 / 4 / 5 | 3 | difficulty | TO-4 … TO-7 | numbered order boxes (write 1, 2, 3) — typed, drag as a second way |
| | `precision` | hour / half / quarter / 5 min | quarter | difficulty | | |
| | `span` (enum) | within one morning / across 12 with a.m./p.m. | within one morning | difficulty | TO-8 | |
| `elapsed_hour` | `dir` (enum) | later / earlier | later | difficulty | TE-1, TE-2 | |
| | `span` (enum) | to 3 h / to 5 h | to 3 h | difficulty | | |
| | `support` (enum) | timeline with hour labels / timeline, pupil labels / none | timeline with labels | support | TE-1, TE-5 fade | the timeline with inputs in the hop labels |
| | `response` (enum) | write the end time / draw it on a face | write | layout | TE-4 | two-box / clock-set |
| `elapsed_30min`, `elapsed_15min` | `dir`, `support` | as above | later, labels | | TE-3 | |
| | `step` (`elapsed_15min` only, set) | 15 / 30 / 45 | [15] | difficulty | TE-3 | |
| `elapsed_mixed` | `dir`, `support`, `span` | as above | later, labels, to 3 h | | TE-6 | |
| | `minuteStep` (enum) | 15 / 5 / 1 | 15 | difficulty | TE-8 | |
| | `crossNoon` (enum) | never / seeded (a.m. → p.m., a.m./p.m. printed) | never | difficulty | TE-9 | |
| `elapsed_find_duration` | `answer` (enum) | `__ h __ min` / total minutes | h + min | difficulty | TE-7, TE-10 | two inputs / one |
| | `support`, `span`, `minuteStep`, `crossNoon` | as above | | | | |
| NEW `elapsed_find_start` | as `elapsed_find_duration` minus `answer` | | | | TE-11 | |
| `elapsed_visual_*` (one skill, `practiceLevel` 1 / 2 / 3 per ruling 7) | `faces` (enum) | two analog / two digital / one of each | two analog | difficulty | TE-7 | |
| `money_count` | `currency` (enum) | plain / qar / usd | **Q1** | layout | all MC / MB | same drawing |
| | `kind` (enum) | like coins / two kinds / mixed coins / like notes / notes and coins | like coins | difficulty | MC-1 … MC-5, MB-1 … MB-3 | |
| | `values` (set) | the currency's coin (or note) values | all | difficulty | MC-1, MC-2 ("count 10s only") | |
| | `band` (enum) | 25 / 50 / 100 (one unit) / 5 units / 20 units / 100 units / 500 units | 100 | difficulty | | |
| | `maxCount` (enum) | 6 / 10 | 6 | difficulty | K5's 6 → 10 | |
| | `order` (enum) | biggest first / scattered | biggest first | difficulty | MC-6 | |
| | `dots` (enum) | printed / pupil draws / none (RP-114) | printed | support | MC-4, MC-5 | printed dots / tap-to-dot / none |
| | `runningTotal` (bool) | a count-on box under each coin (RP-113; Model / Guided layout, 3 per page) | on at level ≥ 2 | support | MC-1 … MC-4 | one input per box |
| `money` | `currency`, `band` | as above | Q1, 5 units | | MP-3, MP-4 | |
| | `cents` (enum) | whole units only / multiples of 25 / multiples of 5 / any | whole units | difficulty | MP-3, MP-4 | |
| | `regroup` (enum) | never / always / mixed (the P4 option) | never | difficulty | MP-4 | |
| | `layout` (enum) | columns / across | columns | layout | | column workmat / equation frame |
| NEW `money_change` | `currency`, `band`, `cents`, `regroup` | as `money`; `paid: whole unit / next note` | whole units, whole unit | difficulty | MP-5 … MP-7 | |
| | `method` (enum) | subtract in columns / count up on a line (open number line) | columns | layout | MP-5, MP-6 | |
| `equiv_coin_sets` | `currency`, `band` (25 / 50 / 100) | | 25 | difficulty | MS-1, MS-2 | |
| | `task` (enum) | show the amount (draw coins) / circle every set that makes N | show | layout | MS-1, MS-3 | coin builder / tap-to-ring |
| `make_change_least_coins` | `currency`, `band` (to 50 / to 100 / to 5 units) | | to 50 | difficulty | MS-2 | coin builder |
| | `response` (enum) | tally table (how many of each) / draw the coins | tally | layout | MS-2 | inputs per value / builder |
| `enough_money` | `currency`, `band` | | 100 | difficulty | MP-1 | check box |
| | `gap` (enum) | far (≥ 10) / near (1-5 minor units off) | far | difficulty | MP-2 | |
| NEW `coin_value` | `currency`; `task` (enum) find the coin worth N / write a coin's value / match name to value (usd only) / order notes least → most | find | difficulty | MV-1 … MV-4 | ring / input / lines / order boxes |
| NEW `money_notation` | `currency` (plain is refused: there is no notation without a unit); `from` (enum) coins and notes / words / cents only (e.g. 305 cents) | coins and notes | difficulty | MW-1 … MW-4 | two-box `__.__` slot |
| | `sign` (bool) | print the sign before the slot | on | support | MW-3 | same |
| NEW `money_compare` | `currency`, `band`; `response` circle the greater / write < = > | circle | difficulty | MS-4 | ring / sign input |
| NEW `clock_parts` | `task` (enum) missing numerals / ring the hour hand / label the hands | numerals | difficulty | TR-1 | inputs / ring |
| NEW `time_fives_ring` | `ring` (enum) fill every box / fill the missing boxes / none | missing | support | TR-7 | inputs in the ring |
| NEW `time_sense` | `task` (enum) a.m. or p.m. / more or less than a minute / an hour | a.m. or p.m. | difficulty | TR-11 | ring |
| `mixed_time` | `members` (set) | the non-retired time ids, by precision | every reading id | — | Review | |

**The pool rule.** `mixed_time` today picks from every id that starts with `time_` or `elapsed_`
(`gen-measurement.js` :1134), so a grade 1 review can deal a 1-minute elapsed item. It deals its declared
`members`, each at **its own** options; `mixed_measurement` stops drawing time and money ids unless ticked.

### 2.6 Response scopes this family uses

| Scope | Cell holds | Absent | Instruction key | Steps |
|---|---|---|---|---|
| `notation` | the face | the answer slot | NEW `hands-name` "Circle the hour hand. Put a box round the minute hand." (11 words) | TR-1 |
| `notation` | the timeline with start and end printed | the hop labels and the answer | NEW `mark-times` "Mark the start and the end on the line." | TE-5a |
| `decision` | two collections, or one collection and a price tag | the total | `rule-yes-no`-shaped: "Check one box: Enough or Not enough." | MP-1 |
| `judge` | a finished item in black | — | `check-fix` | TR-12, TE-12, MC-8, MP-8 |
| `answer-only` | the stimulus and the slot | the supports | the skill's own | tests |

---

## 3. How to read a ladder, and where this family's edges are

### 3.1 Reading a step

As P9 §3.1: *One change* is the P-1 delta; structural scaffolds are in the ladder header; hints fade H1 → H5
and are named in the Cell column; density is in §16; misconceptions are §14 ids.

### 3.2 Boundaries

- **Calendar skills** (days, months, "elapsed time on a calendar", EE 1.MD.3.a) are **not** in any live id and
  are not added in P10 (Q9).
- **Unit conversion of time** (hr ↔ min ↔ s, 4.MD.A.1 two-column table) lives in `unit_conversions` /
  `unit_conversion_word` (the measurement wave, ME-C). TE-10's "total minutes" answer is the only conversion
  this family owns.
- **Money word problems** with the schema (GAP-3-12, WP-11) are the word-problem family's; P10 supplies the
  currency option and the unit words they will read.
- **Decimal place value** (why 2.50 = 2.5) is the fractions / decimals wave (F5). MW-4 accepts both only after
  the framed step.
- **`division:remainder_contexts`** carries a money context; it is out of P10 but must read `currency` when F5
  or the word-problem family touches it (noted in §18).

---

## 4. The order of the ladders, and why

| # | Ladder | Levels | Why here |
|---|---|---|---|
| 1 | **TR** read the time (§5) | K-3 | Every time item reads a face. Two ids leak lower precisions into their pages |
| 2 | **TH** draw the hands (§6) | 1-3 | The production twin of TR at each precision (K5, math-drills pair them); today a hidden 30% branch |
| 3 | **TO** match and order times (§7) | 1-3 | Needs TR. Four ids print empty; two print the answer |
| 4 | **TE** elapsed time (§8) | 2-4 | Needs TR to 5 minutes. Eight ids, no timeline anywhere |
| 5 | **MV** coins and notes by value (§9) | K-2 | The EE rows (2.MD.8 "money has value", the Qatari row "identify the notes") start here |
| 6 | **MC** count coins (§10) | 1-3 | The core of 2.MD.C.8; counts by 5s and 10s (P5 skip counting, EE 3.NBT.3) |
| 7 | **MB** count notes, then notes and coins (§11) | 1-3 | The Qatari EE row; bridges to notation |
| 8 | **MW** write an amount (§12) | 2-4 | The decimal point; needs MB |
| 9 | **MS** show, fewest and compare (§12) | 2-3 | Production of an amount; compare before change (MW4K order) |
| 10 | **MP** enough, totals and change (§12) | 2-4 | Money operations; needs MW and P4 column + / − |

---

## 5. TR — read the time

**Strategy:** the **short** hand names the hour you have **passed**; the **long** hand names the minutes,
counted by fives from 12. **Pre-skill check:** read numerals 1-12 in a ring; count by 5 to 60 (P5 skip count).

**Structural, every level:** the face RL-22 at the size for its precision (§13.1), the **two-box time slot**
`[  ]:[  ]` under it (RP-104). **Hints H1 → H5:** H1 half-shaded face (TR-3, TR-4 only, RP-103d); H2 the outer
minute ring 5 … 55 (RP-103c, black in Model, grey in Guided, off in Independent); H3 the fives write-in ring;
H4 the hour-hand's two neighbours underlined; H5 the first answer traced. **Never** a caption naming the
position ("the long hand at 6 means half past") on an item (§1.3 item 3).

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| TR-1 | concept | Name the parts of a clock | start | NEW `clock_parts`: face with 3-6 numerals missing (write them), then ring the hour hand (`notation`) | numerals / ring | "The short hand is the hour hand." |
| TR-2 | procedure | Read o'clock | the task | `time_hour` `response: write`; minute hand at 12 on every item | `__:__` | "The short hand is on __. It is __ o'clock." |
| TR-3 | representation | Read half past | minute position | `time_half_hour`, **:30 only** (`review: none`); H1 half-shaded face at level ≥ 2 | `__:__` | "The long hand is on 6. It is half past __." |
| TR-4 | case | The hour hand between two numbers | the hard case | half past with the hour hand between 12 and 1, and 2:30 where "3" is the tempting neighbour | `__:__` | "The short hand has passed __. It is __ thirty." |
| TR-5 | representation | Read quarter past | minute position | `time_quarter` `quarter: past` (:15 only) | `__:__` | "The long hand is on 3. It is quarter past __." |
| TR-6 | unknown | Read quarter to | direction reverses | `quarter: to` (:45); vocabulary box "quarter to 4 = 3:45". `Remember: quarter to 4 is before 4, NOT after it.` | `__:__` | "It is quarter to __. I write __:45." |
| TR-7 | representation | Count the fives round the clock | the fives ring | NEW `time_fives_ring`: face ringed by 12 boxes, some filled (5, 10, 15 …), pupil fills the rest | numbers in the ring | "5, 10, 15 … The long hand is on __, so it is __ minutes." |
| TR-8 | precision | Read to 5 minutes | the precision | `time_5min` `face: minute ring` (H2) → `plain` (fade); :05 seeded (M-T6) | `__:__` | "Count by fives: __ minutes after __." |
| TR-9 | precision | Read to 1 minute | the precision | `time_1min`; D ≥ 42 (RP-102); items at :x3, :x7 and :58 | `__:__` | "__ fives and __ more: __ minutes after __." |
| TR-10 | format | Write the time from words | the stimulus | the TR-8 slot, stimulus "twenty past 7" / "seven fifty" in text, no face (TM-05; GAP-3-03) | `__:__` | "__ is __ : __." |
| TR-11 | concept | a.m. or p.m.? | a new idea | NEW `time_sense` or `amPm: on`: a time and an activity line ("eat breakfast") — circle a.m. / p.m. | ring | "Breakfast is in the morning, so it is a.m." |
| TR-12 | judge | Check the time | responseScope `judge` | faces with a written time in black, about half wrong from M-T1 … M-T4 | check + fix | "It is __, not __." |
| TR-13 | test | Test A / B | — | one precision per section | | |

**Misconceptions:** M-T1 (TR-8), M-T2 (TR-4, TR-9), M-T3 (TR-2), M-T4 (TR-6), M-T6 (TR-8).

## 6. TH — draw the hands

**Strategy:** draw the **long** hand first to the minute (count by 5), then the **short** hand to the hour
— **between** the numbers once the minute hand has left 12. **Pre-skill:** the matching TR step.

**Structural:** the draw-the-hands face RP-103e (bold rim, numerals, five-minute ticks, pivot, **no hands**),
D ≥ 46 / 50 / 52 mm (§13.2); the time printed above it in a digital readout. **Hints H1 → H5:** H1 the
**hand-length guide rings** (§13.2: two grey dotted circles at 0.46 R and 0.78 R, "the short hand ends here,
the long hand ends here"); H2 the outer minute ring; H3 the hour hand pre-drawn in grey (RP-103e Guided); H5
the first item traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| TH-1 | procedure | Draw o'clock | response (TR-2's twin) | `time_hour` `response: draw`; H3 hour hand pre-drawn in grey at level 3 | two hands | "The long hand goes to 12. The short hand goes to __." |
| TH-2 | fade | Draw o'clock with no help | scaffold | H1 / H3 gone | two hands | same |
| TH-3 | precision | Draw half past | minute position | `time_half_hour` `response: draw`; the hour hand **halfway** between two numbers is the key | two hands | "The long hand goes to 6. The short hand is between __ and __." |
| TH-4 | precision | Draw quarter past and quarter to | minute position | `time_quarter` `response: draw`, `quarter` one per section | two hands | "…" |
| TH-5 | precision | Draw to 5 minutes | the precision | `time_5min` `response: draw`, H2 ring | two hands | "Count by fives to __." |
| TH-6 | precision | Draw to 1 minute | the precision | `time_1min` `response: draw` | two hands | |
| TH-7 | format | Draw the time from words | the stimulus | `stimulus: words` | two hands | |
| TH-8 | judge | Check the hands | `judge` | faces with drawn hands in black, half wrong (M-T3 swapped lengths, M-T8 hour hand on the number at half past) | check + fix | |

**Misconceptions:** M-T3 (TH-1), M-T8 (TH-3), M-T5 (TH-5).

## 7. TO — match and order times

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| TO-1 | representation | Write the digital time for a clock | representation | `time_analog_digital` `dir: analog → digital`: face + an **empty** digital readout frame (the slot is the readout) | `__:__` | "The clock says __. I write __:__." |
| TO-2 | unknown | Find the clock for a digital time | direction | `dir: digital → analog`: readout + **three** faces, ring one (distractors M-T2, M-T3, M-T4) | ring | |
| TO-3 | format | Find the clock for a time in words | the stimulus | `time_match_clock`: words + three faces; or `response: match` (4 ↔ 4 lines, hands-match page) | ring / lines | "__ past __ is __:__." |
| TO-4 | procedure | Put 3 clocks in order, earliest first | response | `order_clocks_analog_asc` `count 3`; faces with a small order box under each | write 1, 2, 3 | "__ comes before __." |
| TO-5 | unknown | Latest first | orientation | `order_clocks_analog_desc` | 1, 2, 3 | |
| TO-6 | representation | Order digital times | representation | `order_clocks_digital_asc`, then `_desc` | 1, 2, 3 | |
| TO-7 | range | Order 4 or 5 times | count | `count 4 / 5` | | |
| TO-8 | case | Order times across 12 | the hard case | `span: across 12`, each face labelled a.m./p.m. (Q10) | | "12:15 p.m. comes after 11:30 a.m." |

## 8. TE — elapsed time

**Strategy (ruled by 3.MD.A.1's own wording):** a **timeline**: start on the line, hop **whole hours
first, then minutes**, add the hops. **Pre-skill:** TR-8; count on by 15 and by 5; "60 minutes is 1 hour"
(EE 4.MD.1). **Structural:** the timeline RL-12 (§13.5): axis 1.5 pt, hour ticks labelled, minor ticks at the
section's step, a start box and an end box. **Hints:** H1 hop arcs pre-drawn with empty labels; H2 the hour
labels (fade to pupil-labelled, TE-5); H4 the start marked; H5 the first item traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| TE-1 | concept | Find the time some hours later | start | `elapsed_hour` `dir later`, start at :00, timeline, 1-3 h | `__:__` | "Start at __. __ hours later is __." |
| TE-2 | unknown | Find the time some hours earlier | direction | `dir earlier` | `__:__` | "__ hours before __ is __." |
| TE-3 | range | 30 minutes, then 15 minutes later | the step | `elapsed_30min`; then `elapsed_15min` `step [15]`, then [15, 30, 45] | `__:__` | "Start at __. Count on __ minutes." |
| TE-4 | format | Show the end time on a clock | response | `elapsed_hour` `response: draw` (the one elapsed step that draws) | hands | |
| TE-5 | fade | Label the timeline yourself | scaffold | `support: pupil labels` (H2 gone); TE-5a `notation`: mark start and end only | labels + `__:__` | |
| TE-6 | concept | Hours and minutes later | two-part | `elapsed_mixed` `minuteStep 15`: hop hours, then minutes, **two** hop labels | `__:__` | "First __ hours. Then __ minutes." |
| TE-7 | unknown | Find how long, from start to end | the unknown moves to the duration | `elapsed_find_duration` `answer: h + min`; or `elapsed_visual_*` (two faces feed the timeline) | `__ h __ min` | "From __ to __ is __ hours __ minutes." |
| TE-8 | precision | Elapsed time to 5 minutes, then 1 minute | the step | `minuteStep 5`, then `1` | | |
| TE-9 | case | Cross noon | the hard case | `crossNoon: seeded`; a.m./p.m. printed on start and end; the line shows **12 noon** labelled | | "12 noon is in the middle." |
| TE-10 | format | Write the time in minutes | answer unit | `answer: total minutes` (4.MD.A.1, 4.MD.A.2); rule box "1 hour = 60 minutes" | `__ minutes` | "__ hours is __ minutes, and __ more is __." |
| TE-11 | unknown | Find the start time | the unknown moves to the start | NEW `elapsed_find_start`: end and duration given, hop **back** | `__:__` | "Count back __ from __." |
| TE-12 | judge | Check the elapsed time | `judge` | finished timelines in black, half wrong from M-E1 … M-E4 | check + fix | |
| TE-13 | test | Test A / B | — | one unknown per section | | |

**Misconceptions:** M-E1 (TE-7), M-E2 (TE-3, TE-6), M-E3 (TE-1, TE-9), M-E4 (TE-5), M-E5 (TE-7, TE-10),
M-E6 (TE-11).

## 9. MV — coins and notes by value

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| MV-1 | concept | Find the coin worth 10 | start | NEW `coin_value` `task: find`: a field of 12-16 mixed coins, circle every 10 (MN-01) | circles | "This coin is worth 10." |
| MV-2 | procedure | Write a coin's value | response | one coin per cell, write its value (the value numeral is printed **inside** it: this step is for **notes and the usd name key**, where the pupil reads a note's corner value or a name) | one number | |
| MV-3 | concept | Match a coin name to its value (`usd` only) | representation | name ↔ value key box, match four names to four coins with lines (EE 4.MD.2.d) | lines | "A dime is worth 10 cents." |
| MV-4 | procedure | Order notes from least to most | response | `task: order`, three to five notes, order boxes (the Qatari EE row) | 1, 2, 3 | "__ is worth more than __." |

MV is the **EE entry ladder**: for pupils working on M.EE.2.MD.8 "money has value" the teacher uses MV with
`currency: qar` and notes only. For a mainstream grade 2 class MV-1 alone precedes MC.

## 10. MC — count coins

**Strategy:** start with the **biggest** coin; **count on** by each coin's value (skip count by 25, then 10,
then 5, then 1). **Pre-skill:** skip count by 5 and by 10 to 100 (P5), and by 25 to 100.
**Structural:** coins in rows, highest value first (RP-113), the answer line (plain number at `plain`, the
unit word after it otherwise — SL-5). **Hints:** H1 count-on boxes under each coin with a running total
(RP-113, Model / Guided: 3 per page, ≤ 5 coins in a row); H2 count-by-five dots (RP-114, printed → pupil-drawn
→ none); H5 the first total traced.

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| MC-1 | procedure | Count coins that are all 10 | start | `money_count` `kind: like`, `values [10]`, ≤ 6 coins, running-total boxes (EE 3.NBT.3) | total | "10, 20, 30 … __." |
| MC-2 | range | Count like coins of 5, then 1, then 25 | the value | `values [5]`, `[1]`, `[25]` — one per section; 25s capped at 4 (100) | total | "25, 50, 75, 100." |
| MC-3 | concept | Count two kinds of coin | two values | `kind: two`: 10s then 1s (IXL's pennies-and-dimes), then 25s then 10s | total | "__, __ … then __, __." |
| MC-4 | representation | Count mixed coins, biggest first, with dots | representation | `kind: mixed`, `order: biggest first`, `dots: printed` | total | "Start with the biggest. __, __, __." |
| MC-5 | fade | Count mixed coins with no dots | scaffold | `dots: pupil draws` → `none` | total | same |
| MC-6 | case | Count coins that are out of order | the hard case | `order: scattered`; the pupil numbers the coins biggest-first before counting | total | "I start with the 25." |
| MC-7 | range | Count up to 10 coins, totals to 100 | band | `maxCount 10`, `band 100`; a collection of exactly 100 seeded | total | |
| MC-8 | judge | Check the count | `judge` | collections with a written total, half wrong (M-M1, M-M3) | check + fix | |

## 11. MB — count notes, then notes and coins

| # | Kind | I Can … | One change | Cell | Response | Say: |
|---|---|---|---|---|---|---|
| MB-1 | procedure | Count like notes | start | `money_count` `kind: like notes`, "five 10 notes" (the Qatari EE row's example) | total + unit word | "10, 20, 30, 40, 50 riyals." |
| MB-2 | concept | Count mixed notes | values | `kind: mixed notes`, biggest first; at `qar` the 50 → 10 jump (no 20 note) seeded | total | "50, 60, 70 …" |
| MB-3 | range | Count notes to 100, then to 500 | band | `band 100 units` → `500 units` (qar) / `100` (usd) | total | |
| MB-4 | representation | Count notes and coins | two units | `kind: notes and coins`: notes row above, coins row below; the answer is **two** numbers first: `__ riyals __ dirhams` (`__ dollars __ cents`) | two numbers + unit words | "__ riyals and __ dirhams." |

MB-4 deliberately answers in **two unit numbers**, not decimal notation: the point is introduced at MW,
one new thing at a time.

## 12. MW, MS, MP — notation, showing and money operations

**MW — write an amount.** The two-box money slot `[  ].[  ]` (§13.8) mirrors the time slot.

| # | Kind | I Can … | One change | Cell | Response |
|---|---|---|---|---|---|
| MW-1 | concept | Write riyals and dirhams with a point | notation | NEW `money_notation` `from: coins and notes`: MB-4's cell, then `[  ].[  ]` | `__.__` |
| MW-2 | case | Amounts with a zero: 3.05, 3.50, 0.75, 4.00 | the hard case | every item a zero case (M-M4) | `__.__` |
| MW-3 | format | Write the amount with the sign | the sign | `sign: on`: `QR [  ].[  ]` / `$[  ].[  ]` and `[  ]¢` for amounts under one unit (2.MD.C.8) | slot + sign |
| MW-4 | fade | Write the amount from words | stimulus | "two riyals fifty dirhams", "305 cents" (`from: words / cents only`); free line, `2.5` accepted | line |

**MS — show, fewest and compare.**

| # | Kind | I Can … | One change | Cell | Response |
|---|---|---|---|---|---|
| MS-1 | procedure | Show an amount with coins | response (production) | `equiv_coin_sets` `task: show`: amount + 12 dotted circle placeholders; the pupil writes a value in each circle it uses (MN-05) | drawn coins |
| MS-2 | constraint | Show it with the fewest coins | a constraint | `make_change_least_coins` `response: tally`: a table of the currency's values with a "how many" column | numbers in the table |
| MS-3 | format | Circle every set that makes 50 | response | `equiv_coin_sets` `task: circle-all`: 6 printed sets, 2-4 correct, **no sums printed** | circles |
| MS-4 | concept | Which has more money? | compare | NEW `money_compare`: two collections; circle the greater, then (fade) write `<` `=` `>` in the circle between totals (MN-04) | ring / sign |

**MP — enough, totals and change.**

| # | Kind | I Can … | One change | Cell | Response |
|---|---|---|---|---|---|
| MP-1 | decide | Do I have enough? | decision | `enough_money` `decision`: collection + price tag; Enough / Not enough check boxes; 3 of 6 enough | check |
| MP-2 | case | Enough — close to the price | the hard case | `gap: near` (1-5 minor units) | check |
| MP-3 | procedure | Add two prices (whole units) | operation | `money` `task total`, `cents: whole units`, columns (P4 AD ladder with a unit word) | total |
| MP-4 | range | Add two prices with a point | the point | `cents: 25s` → `5s` → `any`; the point track aligned (PT-CGR-6) | total |
| MP-5 | unknown | Find the change from a whole unit | the unknown (subtraction) | NEW `money_change` `paid: whole unit`, `cents: 25s`; `method: count up` (open number line) or `columns` | change |
| MP-6 | case | Change across zeros | the hard case | 5.00 − 3.25, 10.00 − 4.95 (P4 across-zeros) | change |
| MP-7 | range | Change from a note | band | `paid: next note` (a 10 for 7.40) | change |
| MP-8 | judge | Check the change | `judge` | half wrong from M-M6, M-M7 | check + fix |

---

## 13. Cells: geometry, screen twin, answer key

### 13.0 How the sizes are derived

Hw = 6 / 8 / 10 mm, working digits 16 / 22 / 28 pt, zone labels 9 / 10 / 12 pt, cell pad 3 mm, answer zone
Hw + 4 = 10 / 12 / 14, the time box 16 / 18 / 20 mm × (Hw + 2) with a 5 mm colon gap (§6), body 186 × 228 mm.
Clock diameters come from §11.2 and RP-102; coin diameters from RP-111 (scale 0.85 / 1.0 / 1.0). **Every
drawing zone is sized to the hardest item its section can deal** (ruling 9): a coin zone holds the section's
`maxCount` of its **largest** coin; a timeline is scaled for the section's `span`.

### 13.1 Read-the-time cell (TR, TO-1)

| Part | S / M / L |
|---|---|
| Face D (hour, half, quarter, 5 min) | 36 / 42 / 50 mm (half-width panels 38, RP-102) |
| Face D (1 minute) | 46 / 50 / 52 mm |
| Minute ring variant (H2) | outer ring at 1.14 R: face + ring 41 / 48 / 57 mm; the 1-minute face with ring is Model-only |
| Two-box slot under the face | (16 + 5 + 16) × 8 / (18 + 5 + 18) × 10 / (20 + 5 + 20) × 12 = 37 / 41 / 45 mm wide |
| Cell | label 6 + face + 3 + slot (Hw + 2) + 3 → 56 / 64 / 74 mm tall; width = face + 6 → **4 / 3 / 3 columns** (46.5 / 62 / 62 mm) |
| Per page | 16 / 9 / 9 (Auto 6 at L) — the standard's table, met |

`a.m. / p.m.` (TR-11) sits to the right of the slot as two words to circle, 8 mm apart: at S the cell drops to
3 columns. **Screen twin:** the same face (Andika numerals, black on white); two numeric inputs in the boxes,
hour then minutes; the minute box accepts `5` and `05`. **Key:** the time in both boxes, Andika 700,
minutes always two digits.

### 13.2 Draw-the-hands cell (TH, TE-4) — hands a pupil can draw on paper

The face is RP-103e: rim 1.5 pt, 12 numerals, **five-minute ticks at 0.75 pt only** (no 1-minute ticks until
TH-6, where they return at 0.5 pt: on a 46 mm face the 1-minute tick pitch at the rim is 144 mm / 60 ≈ 2.4 mm,
too fine to aim a pencil at, while the 5-minute pitch is 12 mm), the pivot dot. The stimulus — a digital
readout RP-103f, 31 × 14 / 40 × 17 / 48 × 19 mm — sits **above** the face.

**The hand-length guide rings (H1, new).** Two concentric dotted circles in the flat grey, 0.5 pt: one at the
hour-hand length **0.46 R**, one at the minute-hand length **0.78 R**, each with a tiny grey label outside the
rim at 1 o'clock ("short", "long") on the Model only. At D 50 that is a 11.5 mm and a 19.5 mm radius: the two
hands a pupil draws differ by **8 mm**, which is visible in pencil; without the rings pupils draw two equal
hands (M-T3). They are a hint scaffold (INK-3c grey) and fade with the level; Photocopy-safe draws them as
dotted black at 0.25 pt.

| Part | S / M / L |
|---|---|
| Readout above | 14 / 17 / 19 mm + 3 gap |
| Face D | 46 / 50 / 52 mm |
| Cell | 6 + 17 / 20 / 22 + 46 / 50 / 52 + 3 → 71 / 76 / 80 mm tall, 62 mm wide → **3 × 3 = 9** at every size (228 / 76 = 3) |

**Screen twin:** `clock-set` (RM-25) — tap a minute tick then the hour zone, or drag; the minute hand snaps
to the section's precision; legal because the paper item is a production (draw), not a choice. **Key:** both
hands drawn at RP-101 weights (hour 2.25 pt at 0.46 R, minute 1.5 pt at 0.78 R), the hour hand at
`30h + 0.5m` — the key itself teaches "between the numbers".

### 13.3 Choose-a-clock and match cells (TO-2, TO-3)

Three faces D 36 / 38 / 38 mm in one 186 mm row (3 × 38 + 2 × 20 = 154 mm) with ring areas under each; the
readout or words above. Row 6 + 19 + 3 + 38 + 14 + 3 = 83 mm → **2 per page at L, 3 at S / M (D 36)**.
The match page (hands-match) is two columns of 4: faces D 38 left, readouts right, 24 mm dots to join.
**Screen:** tap to ring (RM-07); match = tap a face then a readout. **Key:** the ring at 1.5 pt / the lines.

### 13.4 Order cell (TO-4 … TO-8)

A 186 mm row of 3 / 4 / 5 faces D 38 (or readouts 40 × 17) with a 14 mm order box (slot radius) under each.
5 faces: 5 × 38 + 4 × 4 = 206 mm — **does not fit**: `count 5` uses D 34 at S / M only (5 × 34 + 16 = 186)
and is refused at L ("5 clocks in order needs size S or M"). Row height 6 + 38 + 3 + 12 + 3 = 62 → **3 rows
per page**. **Screen:** type 1, 2, 3 in the boxes (drag the faces as a second way, RM-P-03). **Key:** the
numbers in the boxes. The **print whitelist fix** (`print-settings.js` field list) is the precondition.

### 13.5 Elapsed timeline (TE)

A full-width row (186 mm body, 180 mm axis). Axis 1.5 pt; **hour ticks** 6 mm tall at 0.75 pt, labelled under
the axis at zone-label size ("3:00", "4:00"; the pupil labels them at TE-5); **minor ticks** 3 mm at 0.5 pt.
Scale is chosen from the section's `span` and step so that **the minor tick pitch is ≥ 6 mm** (a pupil must be
able to put a pencil dot on one):

| span × minor step | hours on the axis | mm per hour | minor pitch |
|---|---|---|---|
| 3 h × 30 min | 4 (start hour to +3) | 45 | 22.5 |
| 3 h × 15 min | 4 | 45 | 11.25 |
| 2 h × 5 min | 3 | 60 | 5.0 → **use 2 h × 5 min only at L with a 90 mm hour** (1 h span per line, 7.5 mm) |
| 5 h × 15 min | 6 | 30 | 7.5 |
| 1 h × 5 min | 2 | 90 | 7.5 |

So TE-8 (`minuteStep 5`) caps `span` at 1 h per line (the hour hops are counted in the start and end labels) —
declared in the dialog, not discovered. Hop arcs (H1) sit above the axis, 10 mm high, 0.75 pt, each with a
label box B(2) + "h" or "min". Start and end boxes are the **two-box time slot** under the line, or printed
times at the given end. Row: label 6 + hop labels 12 + arcs 10 + axis + ticks 6 + tick labels 6 + slot row
Hw + 2 + 3 → 53 / 55 / 57 mm → **wide rows 4 / 4 / 3 per page**, with the answer frame
`From __ to __ is [  ] h [  ] min` at the right of the slot row (TE-7). **Screen:** inputs in the hop labels and
the slots; tap a tick to mark (TE-5a). **Key:** hops drawn at 1.5 pt, labels and the answer filled.

The two-faces front end (`elapsed_visual_*`, TE-7) puts two D 38 faces (or readouts) above the timeline at its
two ends: row + 44 mm → **2 per page at L, 3 at S / M**.

### 13.6 Coin cells (MV, MC, MS-1, MS-3, MS-4, MP-1, MP-2)

Coins RP-112 at scale 0.85 / 1.0 / 1.0: diameters 1 = 14.9 / 17.5 / 17.5, 25 = 20.6 / 24.26 / 24.26, and
the **qar 50 coin 22.5 / 26.51 / 26.51** (if Q2 adds it). A 93 mm cell holds 3 coins of 25 in a row
(3 × 24.26 + 2 × 2 = 76.8 mm; 3 × 26.51 + 4 = 83.5 for 50s) → **6 coins in 2 rows** in a cell 93 wide ×
(6 + 2 × 26.5 + 2 + 3 + answer 14 + 3) ≈ 81 mm at L → **2 × 2 = 4 at L, 2 × 3 = 6 at S / M** when the
section's largest coin is 25; `maxCount 10` needs a full-width row (10 × 24.26 + 18 = 261 mm — does not fit
one row; two rows of 5 = 130 mm) → **1 column, 3 per page**. Model / Guided with count-on boxes: one row of
≤ 5 coins, full width (RP-113), 3 per page. **Screen:** the same row; the total is one input; count-on boxes
are inputs. **Key:** the total, and the running totals in the boxes on Model / Guided.

MS-1 placeholders: 12 dotted circles of the largest coin's diameter in two rows of 6 (6 × 24.26 + 10 = 156 mm,
full width) → 3 per page; the pupil writes a value in each circle used. **Screen:** the coin builder (RM-19).
**Key:** the values written in the circles, biggest first, the fewest-coin set on MS-2.

### 13.7 Note cells (MV-4, MB)

Notes RP-115: 60 × 26 mm upright (26 wide, 60 tall), 1.5 pt outline, 0.5 pt inset, value centred at working
size and in two corners at zone-label size. Three-digit values (100, 200, 500) fit: "500" at 28 pt ≈ 15 mm
across a 26 mm note. A row of 5 notes = 5 × 26 + 4 × 3 = 142 mm → full width; notes + coins (MB-4): notes row
60 + coins row 26.5 + gaps → cell ≈ 6 + 60 + 3 + 27 + 3 + 14 + 3 = 116 mm → **1 column, 2 per page**.
Notes-only items (MB-1 … MB-3) hold **at most 3 notes** so they fit a 93 mm cell (3 × 26 + 2 × 3 = 84 mm);
cell height 6 + 60 + 3 + 14 + 3 = 86 mm → **2 × 2 = 4 per page** at every size. Five-note items (a count of
"five 10 notes") take a full-width row: 1 column, 2 per page. Declared (§16). **Screen:** same; input on
the line. **Key:** the total with its unit word.

### 13.8 Money slot and money in columns (MW, MP-3 … MP-7)

**Money slot (new, mirrors the time slot):** two boxes with a printed **decimal point** between them — whole
units B(n) (n = digits of the band's major part), hundredths box fixed B(2) = 14 / 14 / 17 mm, the point in a
3 mm gap, sign or unit word before / after per §2.4. It is the same shape on paper and screen (two inputs),
so "5.3" cannot be typed for 5.30 on the framed step (M-M4). L-SLOT needs one row added to §6 (a standard
amendment, Q3).

**Columns:** the P4 computation-grid stack with a **point track** (0.3 em separator, PAGE_TYPES §3.3: money
tracks = digits + 1) aligned through every row and pre-printed in the answer strip (grey hint at level ≥ 2,
black at level 1 per PT-CGR-6's "the printed point on the operands always stays"). At `currency ≠ plain` the
sign stands in a track **left** of the top operand only (Q3). A 4-digit + sign money sum at L: 6 tracks ×
9.9 = 59 mm + point 3 → **3 columns at S / M, 2 at L**, 6 per page (MP-5 with the open number line: 1 column,
4 / 4 / 3). **Screen:** one input per track (P4). **Key:** the facsimile with regroup marks and the point.

### 13.9 Fewest-coins tally cell (MS-2)

A two-column table: coin value (drawn coin, scale 0.8) | how many (a box B(2)); one row per value of the
currency (4 or 5 rows × 14 / 16 / 18 mm) + the target amount above. Cell 93 × (6 + 10 + 5 × 18 + 3) ≈ 109 mm at
L → **2 × 2 = 4 per page at L, 6 at S**. **Screen:** the coin builder, or inputs in the table (either; both
produce the set). **Key:** the counts of the greedy set — for these currencies (1, 5, 10, 25, 50) greedy is
optimal, which the audit verifies (§17).

### 13.10 Judge cells

The step's cell with a finished answer in black (hands drawn, time written, total written) and a check box
"Correct" / "Not correct" plus a fix slot. Inherit the parent's per-page count; a drawn-hands judge is 9 → 6.

---

## 14. The misconception bank

Built for `wrongAnswer(q)`; every entry has a computable rule. **[evidenced]** = the standards' starter list
(`PEDAGOGY_STANDARD.md` §12) or the generator's existing distractor logic, which encodes classroom errors;
**[house]** = asserted from the step design.

| Id | Mechanism | Wrong-answer rule | First bites | Evidence |
|---|---|---|---|---|
| **M-T1** | Read the minute-hand numeral as the minutes | 3:15 → 3:03; 7:30 → 7:06 | TR-3, TR-8 | [evidenced] starter list |
| **M-T2** | Took the **next** hour when the hour hand is between numbers | 2:50 → 3:50; 2:30 → 3:30 | TR-4, TR-9 | [evidenced] starter list |
| M-T3 | Swapped the hands (read or drew the long hand as the hour) | 3:00 read as 12:15; `swappedHour` in `generateTimeDistractors` | TR-2, TH-1 | [evidenced] generator distractor |
| M-T4 | Quarter to read as quarter past (15 ↔ 45), or "quarter to 4" written 4:45 | 3:45 → 4:15 or 4:45 | TR-6 | [evidenced] generator distractor |
| M-T5 | Counted minute ticks by 1 from the numeral, or by 5 on a 1-minute item | 4:37 → 4:47 | TH-5, TR-9 | [house] |
| M-T6 | Dropped the leading zero | 7:05 → 7:5 / 7:50 | TR-8 | [house] |
| M-T7 | Read :55 as the next hour's o'clock | 3:55 → 4:00 | TR-8 | [house] |
| M-T8 | Drew the hour hand **on** the number at half past | hour hand on 3 for 3:30 | TH-3 | [house]; math-drills' note |
| M-T9 | Ordered 12:xx last (12 as the biggest number) | 12:15 after 11:30 in a morning | TO-4, TO-8 | [house]; catalogue |
| M-E1 | Subtracted clock readings as decimals | 10:45 to 1:15 → 9:30 | TE-7 | [house]; catalogue |
| M-E2 | Let the minutes pass 59 | 3:45 + 30 min → 3:75 | TE-3, TE-6 | [house] |
| M-E3 | Kept counting past 12 | 11:30 + 2 h → 13:30 | TE-1, TE-9 | [house]; catalogue |
| M-E4 | Counted ticks, not spaces, on the line | one step too many | TE-5 | [evidenced] the number-line row of the starter list |
| M-E5 | Answered in one unit only | 1 h 15 min → 1 or 75 on an h + min slot | TE-7 | [house]; catalogue |
| M-E6 | Found the start by counting forward | end + duration | TE-11 | [house] |
| **M-M1** | Counted the coins, not their value | 3 coins of 25 → 3 | MC-1, MC-4 | [house]; the M-K2 mechanism; catalogue |
| M-M2 | Started with the smallest coin and lost count at the switch | 1, 2, 7, 17, 42 misread as 1, 2, 3 … | MC-4 | [house] |
| M-M3 | Kept the previous skip after a switch | 25, 50, 60, 70, **80** for 25, 25, 10, 10, 5 | MC-3, MC-4 | [house] |
| **M-M4** | Wrote amounts without the zero place, or as a whole number | 3.05 → 3.5; 5.30 → 530 | MW-1, MW-2 | [house]; the M-V7 mechanism (catalogue "writes 530 for $5.30") |
| M-M5 | Added minor and major units as one | 2 riyals + 50 dirhams → 52 | MB-4 | [house] |
| M-M6 | Lined up the digits, not the point | 4.5 + 1.25 → 1.70 | MP-4 | [house]; catalogue |
| M-M7 | Subtracted the smaller digit from the larger in each column | 5.00 − 3.25 → 2.25 | MP-6 | [evidenced] the subtraction row of the starter list |
| M-M8 | Compared the number of coins, not the total | 5 coins "more than" 2 coins | MP-1, MS-4 | [house]; catalogue |
| M-M9 | Used many small coins for "fewest" | 30 → 3 × 10 | MS-2 | [house]; catalogue |
| M-M10 | 1 unit = 10 minor units | 1 riyal = 10 dirhams → 1.20 for 1 riyal 20 | MW-1 | [house] |
| M-M11 | Counted a note as its leading digit, or skip-counted a missing note | 50 note as 5; 10, 20 in a 50 + 10 count | MB-2 | [house] |

M-X1 (copied a number from the item) stays a teaching signal.

---

## 15. What each page role takes from these steps

| Page role | Takes | Must not |
|---|---|---|
| Opener / Model | TR, TH with the minute ring and guide rings (H1, H2); MC with count-on boxes; TE with hops pre-drawn | show more than 5 coins in a Model row (RP-113) |
| Error analysis | the step's cell in black with a §14 `wrongAnswer`, about half wrong | show a drawn-hands judge at D < 46 |
| True or False? | "3:30: the short hand is on 3" (false, M-T8), "quarter to 5 is 4:45" (true), "5 coins of 10 is 50" (true), "2.5 riyals = 2 riyals 5 dirhams" (false, M-M4) | exceed 2 blanks |
| Reason It | Always / Sometimes / Never: "The hour hand points to the hour." (sometimes); "More coins is more money." (sometimes) | named characters |
| Decision | MP-1, MP-2; TR-11 | an answer slot |
| Hands-on | TO order cards (cut and order), MV note sort, a paper clock face (TH) | dashed lines anywhere but the cut |
| Daily Spiral Time / Money panels | TR to 5 minutes at D 38 (PT-VIS-2); MC like and mixed coins, ≤ 4 coins at 0.8 (PT-DSR table) | draw-hands or 1-minute faces in a half-width panel (RP-102); notes (60 mm tall) in a 38 mm panel |
| Test A / B | answer-only, one precision / one kind per section, currency fixed for the whole test | mix `response: write` and `draw` in one section |

## 16. Density check

| Cell | Steps | Ceiling (S / M / L) | Teaching cap | Verdict |
|---|---|---|---|---|
| Read the time | TR-2 … TR-8 | 16 / 9 / 9 | 9 | Fits |
| Read to 1 minute | TR-9 | 9 / 9 / 9 (D 46-52) | 9 | Fits (3 × 3) |
| Draw the hands | TH | 9 | 9 | Fits (3 × 3, cell 76 mm at M) |
| Choose 1 of 3 faces | TO-2, TO-3 | 3 / 3 / 2 rows | 3 | **Declare 3 / 3 / 2** |
| Order 3-5 clocks | TO-4 … TO-8 | 3 rows | 3 | Fits; `count 5` refused at L |
| Timeline | TE | wide rows 4 / 4 / 3 | 4 | **Declare 4 / 4 / 3**; with two faces above 3 / 3 / 2 |
| Coins ≤ 6 (largest 25 / 50) | MC-1 … MC-6, MP-1 | 6 / 6 / 4 | 6 | **Declare 4 at L** |
| Coins ≤ 10 | MC-7 | 1 column, 3 | 3 | **Declare 3** |
| Model / Guided coin row | MC Model | 3 | 3 | Fits (RP-113) |
| Notes only (≤ 3 per item) | MB-1 … MB-3 | 4 | 4 | **Declare 4** |
| Notes + coins | MB-4, MW-1 | 2 | 2 | **Declare 2** — a 6-item Independent is 3 pages; offer 4 items |
| Show with coins (placeholders) | MS-1 | 3 | 3 | Declare 3 |
| Fewest-coin tally | MS-2 | 6 / 6 / 4 | 4 | Fits |
| Money columns | MP-3 … MP-7 | 9 / 6 / 6 | 6 | Fits |

Six places the content does not fit six items and the step declares it: **choose a clock, timelines, coins at
L, ten-coin collections, notes, notes + coins**.

## 17. The content-audit rules this family needs

`ws-content-audit.cjs` families are category lists (`FAMILY_CATS`, :68). `measurement` is shared with
rulers, conversions and capacity, so P10 adds family **`tm`** as an **id list** inside `measurement` (the 25
ids of §1.3 plus the appended ids of §18), not a category. Every rule is zero-tolerance at the audit's
deterministic seeds and fingerprints the drawn item (the face's `(h, m)`, the coin multiset), not `q.text`.

| Class | Rule | Would fail today |
|---|---|---|
| `tm-precision` | every dealt minute is a multiple of the precision the name declares, and — with `review: none` — **only** the step's new positions (half: 30; quarter past: 15; …) | `time_half_hour` (o'clock), `time_quarter` |
| `tm-recompute` | independent recomputation: `(h, m)` from the drawn hands' angles = `q.ans`; hour-hand angle = 30h + 0.5m; elapsed end = start + duration (mod 12 h, a.m./p.m. flipped at 12); duration = end − start; coin total = Σ drawn values; change = paid − price in **integer** minor units; fewest set = greedy and greedy verified optimal by DP | none today (content is right), which is why it gates regressions; `money` float arithmetic |
| `tm-band` | coin / note total ≤ band; coin count ≤ `maxCount`; elapsed ≤ span; no value outside the currency's set (no 100 coin; no 20 note at `qar`; no 50 coin at `usd`) | `money_count` ($410 at 100), `make_change_least_coins` (100 coin) |
| `answer-in-item` | the answer or its method is not in `printText`, visual text, `aria-label` or the hint: no digital time beside the face to be read; no printed coin total or set sum; no "the long hand at 6 means half past"; a choose-one cell draws **≥ 3** options on paper | `time_match_clock`, `time_analog_digital`, `elapsed_find_duration`, `enough_money`, `make_change_least_coins`, `equiv_coin_sets`, reading hints |
| `one-response` | one `answerType` and one `printFormat` per non-mixed section; no `clock-set` unless `response: draw`; no `multi-select-check` unless `task: circle-all`; no `dnd-generic` | 20 ids |
| `production-stays-production` | a write-the-time item has empty `q.options` (P-29) | every reading item (41 / 60) |
| `banned-verb` | no pupil string contains click / drag / tap / select, or words in capitals | `order_clocks_*`, `time_analog_digital`, `money_count`, `money`, `equiv_coin_sets` |
| `prints-something` | every item has a printable cell: order tiles printed; coin sets drawn; the fewest-coin table present | `order_clocks_*`, `equiv_coin_sets` |
| `balanced-decision` | `enough_money`: 40-60% Enough in any seeded 6; TR-11 a.m./p.m. balanced | coin-toss today (not seeded) |
| `currency-sign` | a currency sign or word appears only where §2.4 rule 3 allows; never on a coin, a note, a title or an instruction; at `plain` nowhere | `money_count` (¢ in coins, "$" before blanks), `money` |
| `edge-seeded` | each case step's edge (§2.3) appears in every seeded set of 6 | all (accidental today) |
| `ink` (lint) | no fill but ink / paper / the grey in any face, coin or note; no emoji | `coinStyles`, random `colorScheme`, ⏰, 🪙 |

## 18. Share-code impacts

- **No id is renamed, moved or removed.** Labels change (§19.2); a label is not stored in a code.
- **Appended ids**, in this order at the end of `measurement` (after `mixed_time`, position 38), so the snapshot
  rises from 591 by exactly **eight**: `clock_parts`, `time_fives_ring`, `time_sense`, `elapsed_find_start`,
  `coin_value`, `money_notation`, `money_change`, `money_compare`. The catalogue's `set_clock` is **not**
  appended if Q4 is answered with the recommendation (`response: draw` on the five reading ids); if the owner
  prefers the id, it is the ninth and appends last.
- **Aliases** (ruling 7, already made): `elapsed_visual_medium` and `_hard` become `elapsed_visual_easy` at
  `practiceLevel` 2 / 3, all three ids kept in position. No other merge.
- **Option letters** (SCC-P12): `currency` takes one permanent key letter and values `plain`, `qar`, `usd` take
  permanent codes **in that order**; a later currency (GBP, AED …) appends. Every other option of §2.5 takes its
  letter when declared.
- **Positional codes cannot carry options** (SCC-X11). A 7-character or `MX-` code for a money skill therefore
  opens at the **default currency** — which is why Q1 is blocking: changing the default later silently changes
  what every existing positional money link deals (same arithmetic, different unit words and notes).
- **`money_count`'s answer format changes** from "cents or a 5.30 string" to one format per `kind`. Saved
  quizzes keep their stored HTML (CSS additive), and a regenerated item from an old code deals the default
  `kind` (like coins) — a correction, noted in the release line.
- **`division:remainder_contexts`** carries a money story; when its family is revised it reads `currency`.

## 19. The gap table

Verdicts as P9: OPT, FIX, REDO, SPLIT, MERGE, NEW, OUT.

### 19.1 Step → skill today

| Step | Skill | Verdict | Catalogue step | Note |
|---|---|---|---|---|
| TR-1 | — | **NEW** `clock_parts` | TM-A1 | GAP-3-01; TM-01, TM-02 |
| TR-2 | `time_hour` | FIX + OPT | TM-A2 | clock-set branch → `response`; mono face; empty `options`; hint without the answer |
| TR-3, TR-4 | `time_half_hour` | FIX + OPT | TM-A4 | :30 only (`review`); the between-numbers case seeded |
| TR-5, TR-6 | `time_quarter` | SPLIT (option) + FIX | TM-A5 | `quarter: past / to`, one per section |
| TR-7 | — | **NEW** `time_fives_ring` | TM-A6 | GAP-3-02; TM-04 |
| TR-8 | `time_5min` | FIX + OPT | TM-A7 | `face` ring option; :05 seeded |
| TR-9 | `time_1min` | FIX | TM-A8 | D ≥ 42; re-tag grade 3 (Q13) |
| TR-10 | `time_*` | OPT | — | `stimulus: words` (GAP-3-03) |
| TR-11 | — | **NEW** `time_sense` | follow-on | GAP-3-05; TM-08 |
| TR-12 | `time_*` | OPT | — | `responseScope: judge` |
| TH-1 … TH-8 | the five reading ids | OPT | TM-A3 (`set_clock`) | `response: draw` — the 30% branch made a choice (GAP-3-04 already names `response: draw-hands`) |
| TO-1, TO-2 | `time_analog_digital` | SPLIT (option) + FIX | TM-A9 | `dir`; 3 faces; dnd branch dropped; print cell draws the choices |
| TO-3 | `time_match_clock` | FIX | TM-A10 | 3 faces; hint without the time; "five past two" wording, not "two oh-five" (Q11) |
| TO-4 … TO-8 | `order_clocks_*` (4) | FIX | TM-A11 … A13 | print whitelist; `count` option; numbered boxes; "Write 1, 2, 3 under the clocks. Start with the earliest." |
| TE-1, TE-2, TE-4 | `elapsed_hour` | SPLIT (option) + FIX | TM-B1, B2 | `dir`, timeline, `response` |
| TE-3 | `elapsed_30min`, `elapsed_15min` | SPLIT + FIX | TM-B3, B4 | `dir`, `step` |
| TE-5, TE-6, TE-8, TE-9 | `elapsed_mixed` | FIX + OPT | TM-B5 | two hop labels; `minuteStep`, `crossNoon` |
| TE-5a, TE-7, TE-10 | `elapsed_find_duration` | **REDO** | TM-B6, B7 | timeline cell; `answer: h + min` read from two real inputs |
| TE-7 | `elapsed_visual_*` | MERGE (practice level, ruled) + FIX | TM-B8 | `faces` option; odd gaps dropped |
| TE-11 | — | **NEW** `elapsed_find_start` | TM-B9 | |
| MV-1 … MV-4 | — | **NEW** `coin_value` | MN-1 | MN-01, GAP-3-09; the Qatari EE row |
| MC-1 … MC-8 | `money_count` | SPLIT (options) + FIX | MN-2, MN-3 | `kind`, `values`, `band`, `maxCount`, `dots`, `runningTotal`; RP-111 sizes; no ¢ in coins; 🪙 multi-select out |
| MB-1 … MB-4 | `money_count` | OPT | MN-4 | notes per currency |
| MW-1 … MW-4 | — | **NEW** `money_notation` | MN-5 | MN-06, GAP-3-11 |
| MS-1, MS-3 | `equiv_coin_sets` | REDO (print) + OPT | MN-6 | `task: show / circle-all`; drawn sets without sums |
| MS-2 | `make_change_least_coins` | REDO | MN-7 | the set, not a count, on both media; no 100 coin; hint without the answer |
| MS-4 | — | **NEW** `money_compare` | follow-on | MN-04, GAP-3-10 |
| MP-1, MP-2 | `enough_money` | FIX | MN-8 | mono coins; balanced; `gap`; "Enough" / "Not enough" check boxes |
| MP-3, MP-4 | `money` | SPLIT + FIX | MN-9 | `task total` only; integer minor units; print whitelist passes `operands` |
| MP-5 … MP-8 | — | **NEW** `money_change` | MN-10 | the change half of `money` |
| — | `mixed_time` | FIX | — | declared `members` |

### 19.2 Names that do not match what the skill does (fix the name)

| Skill | Label today | Correct label |
|---|---|---|
| `time_analog_digital` | "Analog ↔ Digital Match" | "Analog and Digital Time" (the direction is the option; "↔" is not read aloud) |
| `time_match_clock` | "Match Time to Clock" | "Find the Clock for a Time" |
| `order_clocks_*` | "Order Clocks (Analog) — Earliest to Latest" | "Put Clocks in Order, Earliest First" (… "Latest First", "Put Digital Times in Order …") |
| `elapsed_30min` | "Elapsed Time (30 min)" | "30 Minutes Later or Earlier" |
| `elapsed_hour` | "Elapsed Time (Hours)" | "Hours Later or Earlier" |
| `elapsed_15min` | "Elapsed Time (15 min)" | "15, 30, 45 Minutes Later or Earlier" |
| `elapsed_mixed` | "Elapsed Time (Hours & Minutes)" | "Hours and Minutes Later" |
| `elapsed_find_duration` | "Find the Duration" | "How Long From Start to End?" |
| `elapsed_visual_easy` | "Elapsed Time Clocks - Easy (Visual)" | "Time Between Two Clocks" (the level is the option) |
| `money_count` | "Counting Coins & Bills (Visual)" | "Count Coins and Notes" ("bills" is US-only; "notes" serves both, Q3) |
| `money` | "Money & Making Change" | "Add Money" (change moves to `money_change`) |
| `equiv_coin_sets` | "Equivalent Coin Sets (Visual)" | "Show an Amount With Coins" |
| `make_change_least_coins` | "Fewest Coins to Make Amount (Visual)" | "Make an Amount With the Fewest Coins" |

### 19.3 GAP-3 rows placed

GAP-3-01 → TR-1 (`clock_parts`); GAP-3-02 → TR-7 (`time_fives_ring`); GAP-3-03 → TR-10 / TH-7
(`stimulus: words`); GAP-3-04 → TH (`response: draw`); GAP-3-05 → TR-11 (`time_sense`); GAP-3-06 → TE
(timeline structural everywhere); GAP-3-07 → §2.4 and MC (RP-111 coins everywhere); GAP-3-08 → MC-1 … MC-5;
GAP-3-09 → MV-1, MV-2; GAP-3-10 → MS-4; GAP-3-11 → MS-1, MW; GAP-3-12 → **not placed** (word-problem
family), P10 supplies `currency`.

### 19.4 What to build first

1. **Extend the gate** (§17) with family `tm` (id list). It will be red on ~22 ids.
2. **The print whitelist** (`print-settings.js` field list): `q.tiles`, `q.operands`, `q.minuend`,
   `q.subtrahend`, `q.colMode` — four order ids and both money workmats start printing. Shared with geometry.
3. **Remove every `Math.random()` gate** in the time and money branches of `gen-measurement.js` (:1249 …
   :1966, :2229, :2405, :2491, :2601, :2890), homing the real items as options (§2.2); `response: write / draw`
   on the five reading ids.
4. **Answer-in-item and production-stays-production**: empty `q.options` on write items; hints without the
   answer; choose-one cells with three printed faces.
5. **One coin renderer**: RP-112 generic circle at RP-111 sizes for every money id (delete `coinStyles`, the
   ¢ label and the 100 coin); integer minor units; `currency` option with `plain` wired first, then `qar`,
   `usd` (after Q1-Q3).
6. **The timeline cell** (§13.5) and `elapsed_find_duration`'s two-input answer.
7. **The draw-the-hands cell** with guide rings (§13.2).
8. New ids in ladder order (§4), then options step by step.

---

## 20. Questions for the owner

Six that block the wave, then seven that shape it. Each has a recommendation.

### The six that block

**Q1 — The default currency.** Every money skill gets a `currency` option: **Plain numbers** (generic value
coins, no sign — the standard today), **Qatari riyal** (dirham coins 1, 5, 10, 25, 50; riyal notes 1, 5, 10,
50, 100, 200, 500) or **US dollar** (coins 1, 5, 10, 25 cents; notes 1, 5, 10, 20, 50, 100). The coin
drawings are the same generic circles in all three. The default matters more than usual: short and mixed
share codes cannot carry options, so they always open at the default.
*Recommendation:* **Qatari riyal as the default**, set once as an app-wide "Currency" setting (like the paper
size) that each skill's option starts from, with US dollar and Plain numbers one click away per skill. Your
pupils handle riyals, your EE workbook asks for Qatari notes, and CCSS 2.MD.C.8's $ / ¢ skills stay available
by choosing US dollar. If you would rather keep the standard's current rule (no currency on any page unless
asked), the default is **Plain numbers** and nothing on existing pages changes.

**Q2 — The 50 coin.** Qatar has a 50-dirham coin; the standard allows coins 1, 5, 10 and 25 only (RP-110).
*Recommendation:* **allow a 50 coin only when the currency is Qatari riyal**, drawn the same generic way at the
next size step (26.51 mm, still "a bigger coin is worth more"). US dollar and Plain numbers keep 1, 5, 10, 25.

**Q3 — Where a currency sign may print.** Today a sign may appear only in story text and beside a story's blank
(RP-116, SL-9). CCSS 2.MD.C.8 asks pupils to use $ and ¢, and a riyal amount needs a unit.
*Recommendation:* **when the currency is not Plain numbers, allow the sign or unit word in three more places:
after an answer blank ("__ riyals", "__ cents"), on the one "write the amount" step (`QR [ ].[ ]`,
`$[ ].[ ]`), and left of the top number in money columns — never on a coin, a note, a title or an
instruction.** Also: write Qatari amounts as **QR** (not QAR or ر.ق), call paper money **"notes"** in both
currencies (US pages may say "bills" in stories only), and teach US coin names (penny, nickel, dime, quarter)
only through a printed name-and-value key box, never on the coin.

**Q4 — "Set the clock" as a response option or a new skill.** The 30% draw-the-hands branch hidden in every
clock skill must become a choice. The catalogue proposed a new skill `set_clock`.
*Recommendation:* **a "How the pupil answers: write the time / draw the hands" option on each of the five
clock-reading skills**, not a new skill. "Time to Half Hour — draw the hands" is still time to the half hour;
this keeps the precision in the skill's name, adds no share-code id, and matches `PROBLEM_TYPES.md` GAP-3-04.

**Q5 — How elapsed time is answered and drawn.** Today `elapsed_find_duration` wants total minutes while the
screen shows hours and minutes boxes it never reads.
*Recommendation:* **every elapsed-time page works on a timeline (hop the hours, then the minutes); the answer
is written `__ h __ min` in two boxes; "total minutes" is a separate option for grade 4 (4.MD.A.1).** Two clock
faces stay available as a way to *give* the start and end times, above the same timeline.

**Q6 — Money band and collection size.** Today a grade 2 page can deal $410.
*Recommendation:* **money pages are bounded by the total (to 25, 50, 100 minor units; to 5, 20, 100, 500
whole units) and by the number of coins (6, then 10)**, and start with **one kind of coin** (all 10s), then
two kinds, then mixed biggest-first with the count-by-five dots — the order IXL and K5 use.

### The seven that shape

**Q7 — Quarter to.** *Recommendation:* **"quarter past" and "quarter to" are two steps**, and pupils always
*write* digital (`3:45`); the words are said in the `Say:` line and appear only on the time-in-words step.

**Q8 — Hand-length guide rings.** A new hint for drawing hands: two grey dotted circles showing where the short
and the long hand end. *Recommendation:* **yes, as a fading hint on draw-the-hands pages** (Model and Guided);
they make the two hands visibly different lengths in pencil.

**Q9 — Calendars, 24-hour time, seconds.** *Recommendation:* **not in P10.** None is in a live skill; 24-hour
time and seconds are beyond K-5 CCSS; calendars (EE 1.MD.3) could be a later skill if you want them.

**Q10 — Ordering times across 12 o'clock.** 12:30 before 1:00 is right in the afternoon and wrong at night.
*Recommendation:* **order within one morning or one afternoon by default; the across-12 step prints a.m./p.m.
on every clock.**

**Q11 — Time in words.** The code writes "two oh-five", a US spoken form. Pupils in Qatar may hear "five past
two" (British) as often as "two-oh-five" (US). *Recommendation:* **the words step prints "5 minutes past 2"
style first (unambiguous, and it is how the `Say:` frames already read), then "five past two"; "two-oh-five" is
not used.** Please say which spoken form your classroom uses, and the step follows it.

**Q12 — Qatari coins in practice.** The 1- and 5-dirham coins are rarely handled. *Recommendation:* **at
Qatari riyal, coin-counting pages deal 25 and 50 dirham coins first and notes from the start (the EE row is
about notes); 1, 5 and 10 dirham coins are ticked off by default but available** — the arithmetic (counting by
5 and 10) is still taught through them when ticked.

**Q13 — Grade tags and the standards map.** `time_1min` is tagged 2 (its content is 3.MD.A.1); the four
`order_clocks_*` are tagged M. The standards database cannot store your workbook's Qatari-currency row (it sits
under M.EE.4.MD.5, which is about angles) and it merges M.EE.1.MD.3.d and M.EE.4.MD.2.d (coins) into the
letter before them. *Recommendation:* **re-tag `time_1min` to 3 and `order_clocks_*` to 1-2; add the workbook
row as its own code (`M.EE.4.MD.5.d`, marked "school workbook") and split the two merged sub-letters, so money
skills at Qatari riyal can be tagged to it** (§21).

---

## 21. The standards map (CCSS and Essential Elements)

From `js/modules/standards.js` (`SKILL_STANDARDS`, lines 430-468) at `7b23929`. "Today" is the live map;
"Proposed" is what this specification's steps teach — **a proposal for the P10 build, not a change**
(`node tests/scripts/ws-standards.cjs` must stay green when it lands). EE codes are the Wisconsin 2022 codes
plus the school workbook.

| Skill | CCSS today | EE today | Proposed change | Why |
|---|---|---|---|---|
| `time_hour` | 1.MD.B.3 | M.EE.1.MD.3, M.EE.2.MD.7, M.EE.3.MD.1 | + M.EE.4.MD.2 | EE 4.MD.2.a "tell time to the nearest hour using an analog clock" |
| `time_half_hour` | 1.MD.B.3 | M.EE.1.MD.3 | + M.EE.5.MD.1 | EE 5.MD.1.a "to the half or quarter hour" |
| `time_quarter` | 2.MD.C.7 | M.EE.2.MD.7 | + M.EE.5.MD.1 | as above |
| `time_5min` | 2.MD.C.7 | M.EE.2.MD.7 | + M.EE.5.MD.1 | workbook descriptor: analog to the nearest five minutes |
| `time_1min` | 3.MD.A.1 | M.EE.3.MD.1 | + M.EE.5.MD.1 | workbook: digital to the minute |
| `time_analog_digital` | 2.MD.C.7, 1.MD.B.3 | M.EE.2.MD.7, M.EE.1.MD.3 | + M.EE.4.MD.2, M.EE.3.MD.1 | digital clock reading (EE 3.MD.1, 4.MD.2.a) |
| `time_match_clock` | 2.MD.C.7 | M.EE.2.MD.7 | none | |
| `order_clocks_*` (4) | 2.MD.C.7 | M.EE.2.MD.7 | + M.EE.1.MD.3; mark `approx` | ordering times is not a CCSS standard; EE 1.MD.3.c "before, next, after" is the closest |
| `elapsed_30min`, `_hour`, `_15min`, `_mixed` | 3.MD.A.1 | M.EE.3.MD.1 | + M.EE.4.MD.1 (`_hour`, `_mixed`) | "60 minutes in 1 hour"; EE 3.MD.1 is only linked, it does not teach intervals |
| `elapsed_find_duration` | 3.MD.A.1 | M.EE.3.MD.1 | + 4.MD.A.1, 4.MD.A.2; + M.EE.4.MD.1 | `answer: total minutes` is a unit conversion |
| `elapsed_visual_easy` / `_medium` | 3.MD.A.1 | M.EE.3.MD.1 | none | |
| `elapsed_visual_hard` | 3.MD.A.1, 4.MD.A.2 | M.EE.3.MD.1, M.EE.4.MD.2 | none | |
| `money_count` | 2.MD.C.8 | M.EE.2.MD.8 | + M.EE.3.NBT.3, M.EE.5.MD.1, M.EE.4.MD.2; + the Qatari row at `qar` (Q13) | "count by tens using money"; "relative value of collections of coins"; 4.MD.2.d coins |
| `money` | 2.MD.C.8, 4.MD.A.2 | M.EE.2.MD.8, M.EE.4.MD.2 | none | |
| `equiv_coin_sets` | 2.MD.C.8 | M.EE.2.MD.8 | + M.EE.5.MD.1 | equal collections |
| `enough_money` | 2.MD.C.8 | M.EE.2.MD.8 | + M.EE.5.MD.1 | relative value of collections |
| `make_change_least_coins` | 2.MD.C.8, 4.MD.A.2 | M.EE.2.MD.8, M.EE.4.MD.2 | none | |
| `mixed_time` | pool | pool | none | |
| NEW `clock_parts` | 1.MD.B.3 (`approx`) | M.EE.1.MD.3 | — | the face before reading it |
| NEW `time_fives_ring` | 2.MD.C.7, 2.NBT.A.2 | M.EE.2.MD.7, M.EE.2.NBT.2 | — | count by fives on the face |
| NEW `time_sense` | 2.MD.C.7 | M.EE.1.MD.3 | — | a.m. / p.m.; morning, afternoon (EE 1.MD.3.b) |
| NEW `elapsed_find_start` | 3.MD.A.1 | M.EE.3.MD.1 | — | |
| NEW `coin_value` | 2.MD.C.8 | M.EE.2.MD.8, M.EE.4.MD.2, Qatari row | — | identify coins and notes and their values |
| NEW `money_notation` | 2.MD.C.8, 4.MD.A.2 | M.EE.2.MD.8 | — | $ and ¢ symbols; decimal amounts |
| NEW `money_change` | 2.MD.C.8, 4.MD.A.2 | M.EE.2.MD.8, M.EE.4.MD.2 | — | |
| NEW `money_compare` | 2.MD.C.8 | M.EE.5.MD.1 | — | relative value of collections |

**Two database defects found while mapping** (`data/standards/ee-math.json` → `standards-db.js`):

1. **The Qatari-currency row has no code.** The workbook prints it as "M.EE.4.MD.5.d Identify and use Qatari
   currency in various denominations", but M.EE.4.MD.5 is "Recognize angles in geometric shapes" with no
   sub-letters, so the row lives only inside that EE's `workbook` array and cannot be put in any skill's `ee`
   list. It also makes the coverage report list M.EE.4.MD.5 as "NOT COVERED" for an angle standard while the
   money row is invisible.
2. **Two sub-letters are merged into the one before them.** M.EE.1.MD.3.c's text ends "… d. Demonstrate an
   understanding that telling time is the same every day", and M.EE.4.MD.2.c's ends "… d. Identify coins
   including penny, nickel, dime, quarter and their values". The parser split on line starts only, so
   `M.EE.1.MD.3.d` and `M.EE.4.MD.2.d` (coins) do not exist as codes.

Both are Q13; neither is fixed here (no code changes in this document).

---

*Sources read for §1.1 (2026-09-25):*
[MW4K telling time](https://www.mathworksheets4kids.com/time.php) ·
[MW4K elapsed time](https://www.mathworksheets4kids.com/elapsed-time.php) ·
[MW4K money](https://www.mathworksheets4kids.com/counting-money.php) ·
[MW4K making change](https://www.mathworksheets4kids.com/making-change.php) ·
[K5 time](https://www.k5learning.com/free-math-worksheets/topics/time) ·
[K5 money](https://www.k5learning.com/free-math-worksheets/topics/money) ·
[Math-Drills time and clocks](https://math-drills.com/timeworksheets.php) ·
[IXL skill alignment, grade 2 (Into Math)](https://www.ixl.com/math/skill-plans/into-math-grade-2.pdf) ·
[Qatari riyal](https://en.wikipedia.org/wiki/Qatari_riyal)
