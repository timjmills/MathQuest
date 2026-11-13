# word-stories — independent critic, round 1 (2026-11-13)

Branch `claude/sweet-newton-c8wrv1-lf-builds-stories` at `e41d271a6`. Card `design/cards/word-stories/word-stories.md`
(signed 2026-11-13). Skills: `addition:add_word_problems(_plain)`, `subtraction:sub_word_problems(_plain)`, presets
`addition:add_wp_change_unknown`, `subtraction:sub_wp_change_unknown`, `subtraction:sub_wp_compare_smaller`.

## Verdict: **FAIL**

Two critical defects. One is new on this branch: the True or False? key is wrong on the add host and the add preset.
The other was already on master: the hosts' Reason It page overflows and shows the same answer twice. Several capped
criteria (H6, H13, H15, H16) also sit on roles and hosts the card offers. The new story content is good: true to its
labels, grammatical, bounded by the band, the trap worded correctly. The drawings (change bar, two compare bars) follow
RP-70 to RP-72. What fails is the pages and hosts around the content.

Lowest scores: **C2 3** (True or False?, add host forms 1/2/3 and `add_wp_change_unknown`: H1). **C1 4 / C2 3**
(Reason It on the hosts at band "No limit" / 100: H2 + H1). **C1 5** (hosts card-390 at band "No limit" / 100: H6).
**C3 6** (guided S/L: H13; hosts' column cell: H15). **C4 6** (Reason It, every skill: H16/H8 ENGINE).

## How it was graded (my own renders)

All under `/tmp/claude-0/-home-user-MathQuest/a28793f0-3a8c-5932-9bc9-4eb414e6d9a8/scratchpad/critic-ws/` (`<dir>/<cat>__<skill>/<role>[-key]-pN.png`):

- `S/`: all 7 skills, all 15 offered roles, size S, with keys. Screen hosts: card 390/820/1280, the online worksheet and the quiz (`ws-grade-render`, default options).
- `L/`: the same at L, print only.
- `addF3S`, `subF3S`, `subF4S`, `subF5S`: forms 3 / 3 / 4 / 5 on the hosts at S, roles independent, test, guided, scripted-model, error-analysis, true-false, reason-it, word-problems and review, with the screen hosts.
- `addF3L`, `subF5L`: forms at L.
- `band10S`, `band20S`, `band100S`: band values on both hosts.
- `bar`: wpBar = true.
- `items.json`: 36 items per config (6 pages × 6, seeded `generateQuestionFor`, itemIndex/itemCount set). Configs: every forms value 0–5 alone; forms 3/4/5 × band 10/20/100; the presets; the plain twins; the default mix at band null/10/20/100. Script: `.../scratchpad/tools/sample.cjs`.

### Content read (36 items each, all read)

| config | true to label | grammar | band bound (answer and every story number) | answers distinct / 36 |
|---|---|---|---|---|
| add forms 1 "The start" | yes: had some, got n, now m, at first | yes ("1 more apple" singular right) | n/a (Max Number) | 26 |
| add forms 2 "A part" | yes: in all, red, rest blue / books and games | yes | n/a | 24 |
| add forms 3 "How many were added?" | yes: past tense, had, got some more, now, how many did X get | yes | 10: max 10, 20: max 20, 100: max 99. 0 over | 7 / 12 / 24 |
| sub forms 3 "How many went?" | yes: had, gave some away, now, how many did X give away | yes | 0 over at 10/20/100 | 6 / 13 / 28 |
| sub forms 4 "fewer than" | yes: X has n; Y has d fewer than X; how many does Y have | yes | 0 over | 7 / 11 / 28 |
| sub forms 5 "more than, bigger known" | yes: "Ben has 52 stamps. Ben has 34 more stamps than Lena. How many stamps does Lena have?" (bigger amount known, the smaller one asked: right) | yes | 0 over; `wpLanguage: 'inconsistent'` set | 7 / 11 / 28 |
| presets (band 20 default) | add-some / take-some / compare-fewer + compare-more-smaller | yes | max 20 | 12 / 13 / 11 |

No L3 give-away in the stories. The sentence boxes are blank and none of them is sized to the answer. Answers vary, with
no cycle. **But** the default "No limit" band deals answers above the Max Number (F9). On every page the cast of names
and nouns follows the item position, not the seed (F14).

## Score table (C1-C2-C3-C4; **bold** = below 8; caps in brackets)

Groups:
- **P**: the 3 presets (band 20, the sentence layout), the change and compare drawings.
- **H-20**: the 4 hosts at band 10/20 (sentence layout).
- **H-col**: the 4 hosts at band "No limit" (the default) or 100. They print the legacy column cell, and the new forms 3/4/5 at the default band are in this group too (`addF3S`, `subF3S`, `subF4S`, `subF5S`).

"m" = rendered and measured clean in `meta.json`, looked at in passing only.

| page type | group | S | L |
|---|---|---|---|
| independent / more-practice / test | P change | 8-8-8-8 | 8-8-8-8 |
| independent / more-practice / test | P compare | 8-**7**-8-8 (F6) | 8-**7**-8-8 (F6) |
| independent | H-20 band 20 | 8-8-8-8 | 8-8-8-8 m |
| independent | H-20 band 10 | 8-8-**6**-8 [H13 38 %] (F5) | m |
| independent / test | H-col | 8-**7**-**6**-8 [H15] (F4, F9) | 8-**7**-**6**-8 [H15] |
| lesson (3 pages) | P change | 8-8-8-8 | 8-8-8-8 m |
| lesson | P compare | 8-**7**-8-8 (F6: the model is the trap) | same |
| lesson | H-col | precritic: ILLEGIBLE / OVERLAP on master, not re-graded; inherits H15 | — |
| scripted-model (2 pages) | P | 8-8-**7**-8 (F10) | 8-8-**7**-8 m |
| guided | P | 8-8-**6**-8 [H13 35–39 %] (F5); compare 8-**7**-**6**-8 | 8-8-**6**-8 [H13 46 %] |
| guided | H-col forms 4 | 8-8-**6**-8 [H13 44 %, H15] | — |
| opener / review / pre-skill-check / mixed-practice / word-problems | P | 8-8-8-8 m | 8-8-8-8 m |
| stretch | P compare | 8-**7**-8-8 (F11) | m |
| error-analysis | P | 8-8-8-8 | 8-8-8-8 m |
| error-analysis | H-col | 8-8-**6**-8 [H15] | — |
| true-false | P sub change, P compare | 8-**7**-8-8 (F7: "6 − 3 = 9") | m |
| true-false | **P add change** | 8-**3**-8-8 **[H1]** (F1) | 8-**3**-8-8 [H1] |
| true-false | **H add, forms 1/2/3, band 20 and No limit** | 8-**3**-8-8 **[H1]** (F1) | [H1] |
| reason-it | P | 8-**7**-8-**6** [H16 ENGINE] (F7, F8) | same |
| reason-it | **H-col** | **4**-**3**-**6**-**6** **[H2, H1, H16]** (F2) | same |
| card 390 | P | 8-**7**-8-8 (compare: Q1 is the trap, F6); change 8-8-8-8 | |
| card 390 | H-col | **5**-**7**-**6**-8 **[H6 40×44 px]** (F3, F4) | |
| card 390 / 820 / 1280 | H-20 band 20 | 8-8-8-8 (0 small targets) | |
| card 820 / 1280 | H-col | 8-**7**-**6**-8 [H15] | |
| online worksheet 1280 | P | 8-8-8-8 (compare 8-**7**: F6) | |
| quiz 1280 | P | 8-8-8-8 | |
| worksheet / quiz | H-col | 8-**7**-**6**-8 [H15] | |

## Findings

**F1: CRITICAL, NEW. H1, AK-1, L27.** The True or False? page is wrong on the add host's missing-part kinds and on
`add_wp_change_unknown`. The finish line prints `whole + part = ___` and the key fills in the difference:
- "19 + 3 = 16", "20 + 8 = 12", "10 + 6 = 4" (preset);
- "41 + 23 = 18", "45 + 43 = 2" (host, forms 3);
- "8 + 4 = 4", "11 + 10 = 1", "9 + 7 = 2" (host default kinds, band 20).

The verdict is also wrong: the correct work "41 − 23 = 18" and "27 − 13 = 14" is keyed **False**.
- Evidence: `S/addition__add_wp_change_unknown/true-false-key-p1.png`, `addF3S/addition__add_word_problems/true-false-key-p1.png`, `band20S/addition__add_word_problems/true-false-key-p1.png`.
- Cause: commit `632748196` (`gen-operations.js` ~5477) sets `q.a = known part, q.b = answer, q.op = '+'` for every non-join kind. The cell draws `whole − part`, and the True or False? composer pairs the cell's numbers with `q.op`. The subtraction host and presets are right.
- Machine check: providers-unit or a new `ws-key-arith` that, for every rendered statement and finish line on true-false / reason-it / error-analysis, evaluates `a op b` against the printed or keyed value, and checks each True/False verdict against the evaluated shown sentence. Run it on every forms value × band (L29).

**F2: CRITICAL, pre-existing on the hosts. H2 (C1 ≤ 4), H1 (C2 ≤ 3), L3.** Reason It on the hosts at band "No limit" and
100, including the new forms values at the default band:
- the column `mq-ww` runs off the left edge of the cell and the two story copies overlap ("How many more pencils does Sam have than Leo?" printed over itself);
- A and B show the SAME work (85 − 56 = 29 in both; 62 − 16 = 46 in both), yet the key circles one of them.

Evidence: `S/subtraction__sub_word_problems/reason-it-p1.png` and `-key-p1.png`, and the same on `add_word_problems`,
both `_plain` twins, `addF3S` and `subF3S`; `meta.json` lists "mq-ww leaves the cell" ×2. precritic-diff pins it as
master's. The card offers reason-it on these hosts, so it caps here.

Machine check: grade-render `--gate` already reports the overflow. Make it a FAIL that a pin cannot excuse on an offered
role (L23). Add a candidates check: the rendered A and B differ in at least one slot (L27).

**F3: MAJOR, pre-existing. H6 (C1 ≤ 5).** Practice card at 390 on the 4 hosts at band "No limit" / 100: the column inputs
are 40 × 44 px (`smallTargetCount 3`), and this includes forms 3/4/5 at the default band. Evidence:
`S/subtraction__sub_word_problems/card-390.png` and its `meta.json` (`screen.card-390.measure.smallTargets`). Band 10/20
and the presets: 0 small targets.

Machine check: exists (`ws-grade-render --gate` TARGET). Do not pin it as pre-existing while the card offers the host.

**F4: MAJOR. H15 (C3 ≤ 6), VQ-3, L13.** The hosts' column cell (band "No limit" and 100, so the new forms 3/4/5 at the
default band too) prints:
- the + − × ÷ sign row on Grade 1–2 + / − stories;
- a unit bank "boxes / days / <noun>", where "boxes" and "days" are never in the story (L13 names exactly this);
- a 3-track digit grid for "had 4, got some, now 6".

Evidence: `addF3S/addition__add_word_problems/independent-p1.png`, `band100S/subtraction__sub_word_problems/independent-p1.png`,
`subF4S/subtraction__sub_word_problems/guided-key-p1.png`.

Machine check: `ws-visual-quality` VQ-LIVE on every band value of the card. The signs offered must be within the dealt
operations; every bank word must be a noun in its story; there must be no column grid while the answer is ≤ 20.

**F5: MAJOR. H13 (C3 ≤ 6).** Empty bands:
- Guided page: the cell beside the Model is stretched to the Model's height.
  - Presets: 35–39 % at S (`S/addition__add_wp_change_unknown/guided-key-p1.png`, cell 2; `S/subtraction__sub_wp_compare_smaller/guided-p1.png`, cell 2) and 46 % at L, where the page holds only Model + 1 item (`L/addition__add_wp_change_unknown/guided-p1.png`).
  - Host forms 4: 44 % with 2 items on page 1 (`subF4S/.../guided-key-p1.png`).
- Band-10 independent page: 38 % (`band10S/addition__add_word_problems/independent-key-p1.png`, cell 3).

precritic excused the guided band as "the approved siblings at the same %". A sibling is not an exemption from a measured
cap (L23, RUBRIC "measure it; do not eyeball it past").

Machine check: `ws-empty-band` on the guided role at S and L, judging every non-model cell absolutely (not against a
sibling), and on every band value (L29).

**F6: MAJOR. P-WP-3, P-1, card §3 ("the trap value is never mixed into a first page of compare").** `sub_wp_compare_smaller`:
- Independent S: 2 "fewer" items, then 9 trap items (`S/.../independent-p1.png`).
- Practice card: Q1 is the trap ("Noor has 6 more dollars than Omar", `card-390.png`).
- Guided: the Model is "fewer", but 2 of the 3 pupil items are the trap, with no model of it.
- Lesson: page 1 models the TRAP ("Omar has 11 more marbles than Kofi"), while its guided and independent items are "fewer" (`lesson-p1.png`, `lesson-p2.png`).

The order of the sections is right, but the consistent form is a token at the start, and the lesson teaches one schema and
practises the other.

Machine check: a dealer predicate for forms [4, 5]:
- the first item on every host is consistent, and "fewer" ≥ "more" on every page;
- the lesson's model item has the same `language` as its guided item;
- every guided item's schema is one that a model or step on the page has shown.

**F7: MAJOR (routed to another lane, still caps here). C2 7.** On the sentence-layout pages the "added" wrong answer is
written under a − sign. Reason It shows "19 − 8 = 27" and "15 − 6 = 21"; True or False? shows "6 − 3 = 9" and
"15 − 3 = 18". M-W1 is *adds the two numbers*, so the pupil's work is "19 + 8 = 27". Shown under − it is just false
arithmetic, and the page does not teach the misconception. Error analysis gets this right ("16 + 12 = 28"), so the fix
exists. Evidence: `S/addition__add_wp_change_unknown/reason-it-key-p1.png`, `S/subtraction__sub_wp_change_unknown/true-false-key-p1.png`.

Machine check: providers-unit. A wrongAnswer tagged with a misconception carries the operation that misconception uses,
and the rendered candidate sentence evaluates true under that operation.

**F8: MAJOR, ENGINE. H16 / H8 (C4 ≤ 6).** Every Reason It asks for the answer three times: "Circle A or B", "___ is
correct" and "The answer is ___". This is lf-placevalue critic r1/r2 F17, still open as ENGINE. It caps every skill here.

Machine check: VQ-ONEANSWER on the reason-it role (one answer area per decision).

**F9: MAJOR. C2 7 on the hosts' default page; card §7a range line, 2.OA.A.1.** With "No limit (the Max Number)" at Max
Number 100, the join kind deals sums above 100:
- 24 of 36 items, up to 185 ("Sam has 68 pencils. Sam gets 63 more pencils." = 131);
- 7 of 36 in the default mix.

The card says the Max Number bounds every story number and the answer, and the help text says "No limit: the Max Number
decides". Evidence: `items.json`, config `add_word_problems {"forms":[0]}`.

Machine check: `ws-content-audit` or an options-verify predicate: at band null, `ans ≤ max(10, range)` for every kind.

**F10: MINOR. C3 7.** The Scripted Model (presets, S) puts 2 steps on each of 2 pages, and about 40 % of each page is
left empty below the steps (`S/subtraction__sub_wp_change_unknown/scripted-model-p1.png` and `-p2.png`). PT-MOD-3
excuses the mark room beside the steps, not a half-empty page.

Machine check: a page-fill check on scripted-model. The steps either fit on one page or the split leaves no page under
70 % used.

**F11: MINOR. C2 7, L6.** Stretch on the compare preset is a bare "two numbers have a difference of 8" table. It has no
story and no smaller amount, so it does not follow the skill (`S/subtraction__sub_wp_compare_smaller/stretch-key-p1.png`).

Machine check: providers-unit L6. The stretch item's schema equals the skill's schema.

**F12: MINOR. P-WP-22.** Money stories use "dollars" (e.g. "Aya has 16 dollars. Ravi has 5 fewer dollars than Aya"); the
standard asks for "coins". This comes from the scenario list.

Machine check: `ws-story-lint` banned-word list for currency names.

**F13: MINOR (no cap). P-WP-17.** At L in two columns the story sentences wrap ("How many cards does / Ana have?"), giving
5 printed lines. The sentence frames then sit at different heights from cell to cell (`L/subtraction__sub_wp_compare_smaller/independent-key-p1.png`).

Machine check: print-lint WRAP on story lines; equal frame baselines across a row (L20).

**F14: MINOR. L10.** The story cast follows itemIndex, not the seed: item 0 is "Ben … stamps" on most pages, and items
1–5 repeat Lena/beads, Yuki/shells, Aya/dollars. Two versions of a page share the same names and nouns
(`items.json`, any forms 3/4/5 config).

Machine check: dealer-uniform tag over (name, noun) per itemIndex across seeds.

**F15: MINOR, pre-existing.** The hosts' default independent page interleaves start / take / compare stories with no
sections (P-WP-1), for example in `band20S/subtraction__sub_word_problems/independent-key-p1.png`.

Machine check: P-WP-1 section predicate on non-review roles.

## What passed (keep)

- The forms 3/4/5 stories and the repaired forms 1/2: each deals its label, the past-tense join is kept as told, and the trap is worded exactly as the card specifies and flagged `inconsistent`.
- Band 10/20/100: answer and story numbers bounded, 0 over in 432 items.
- The change bar (whole Now / First, equal parts, "Then ?" zone label) and the two compare bars (bigger bar, the ? bar plus a solid difference box with its number box): schematic, nothing dashed, labels printed.
- The preset lessons (change), error analysis (the trap error "14 + 10 = 24" is shown right), the online worksheet and the quiz.
- Band 20 on the hosts: the signed sentence layout, 0 small targets.
