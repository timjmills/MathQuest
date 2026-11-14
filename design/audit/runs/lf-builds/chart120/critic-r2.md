# chart_120 — independent critic, round 2 (final round under the round cap)

- **Code:** branch `claude/sweet-newton-c8wrv1-lf-builds` at `03c811eed` (signed card). Not changed.
- **Scope:** the signed card `design/cards/chartwindow/chartwindow.md`.
  - grid=whole and grid=rows are hidden on lesson, guided and test.
  - grid=rows at band 120 and band 10 are hidden on the multi-item practice roles.
  - stretch is out of scope.
  - Skills: `composing:chart_to_120` (preset) and `composing:hundreds_chart_fill` (band 100 default, regression).
  - Sizes M and L. Hosts: practice card (1366 and 820), online worksheet and quiz (1280, as the renderer produces them).
- **Renders:** `ws-grade-render.cjs`, run through `mq-browser-run.sh`, covering all 13 offered roles with keys at M and L for both skills.
  - Evidence is in `critic-r2/`.
  - The item reads (40 band-120 items, 20 band-100 items: provider `wrongAnswer`, `workedSteps`, Say, Guided work lines) are in `critic-r2/read40-c120.txt` and `critic-r2/read20-b100.txt`.

## Verdict: **FAIL**

All ten round-1 findings are closed on the pages they named. Three defects remain:
- **N1 (major).** The Scripted Model and the lesson anchor have two-gap states that break PT-MOD-1.
- **N2 (major).** The online worksheet repeats a band-120 window, so one item prints another item's answers. This is the F4 class on a screen host.
- **N3 (minor to major).** The opener's Say frame is singular under a Model with two gaps. This is the F3 class on an unfilled frame.

N2 and N3 repeat defect classes that already failed in round 1 (F4 and F3). Under LESSONS_LEARNED process rule round-cap 2, the lane stops here: find the root cause, build the machine check, then run one more round.

## Item read

| Check | band 120 (40) | band 100 (20) |
|---|---|---|
| `wrongAnswer` null | **0** (r1: 30) | 0 |
| Distractor mix | one-less 20 · wrong-row 15 · reversed-digits 5 (two-digit gaps only) | 5 · 7 · 8 |
| Gaps 1 / 2 / 3 | 10 / 20 / 10 | 5 / 10 / 5 |
| Distinct answers | 37 / 40 | 19 / 20 |
| Steps name every gap | 40 / 40 | 20 / 20 |
| Every step reads a PRINTED neighbour | 180 references, 0 bad | 90 references, 0 bad |
| Step arithmetic (one / ten more or less) | 0 wrong | 0 wrong |
| Say agrees in number (`sayFill`) | 40 / 40 | 20 / 20 |
| Guided Model work lines name every gap | 40 / 40 | 20 / 20 |
| Within-item giveaway | none | none |

On the built pages:
- **True or False?** deals 2 of 4 False at M and at L (the r1 result was 0 of 4).
- **Error analysis** marks a two-gap window Correct on one item and Fix it on another, so the judgement cannot be read from the gap count.
- **Reason It** shows the misconception "1003" for 103 (101–110 only; F8).

## Scores (C1 ease · C2 teaching · C3 spacing · C4 standard)

M and L are the same unless a cell gives both. OOS = out of scope by lead ruling; listed, not scored.

| Page type / host | chart_to_120 M | chart_to_120 L | band 100 M / L | Pass |
|---|---|---|---|---|
| independent + key | 9·9·8·9 | 8·9·8·9 | 9·9·8·9 | yes |
| more-practice + key | 9·9·8·9 | 8·9·8·9 | 9·9·8·9 | yes |
| test + key | 9·8·8·9 | 8·8·8·9 | 9·8·8·9 | yes |
| independent / more-practice grid=whole | not re-rendered; r1 9·9·8·9, untouched since | | — | yes (r1) |
| lesson (fallback, 3 pp) + key | 8·**7**·OOS·8 | 8·**7**·OOS·8 | 8·**7**·OOS·8 | **no** (N1, anchor p1) |
| scripted-model + key | 8·**7**·8·**7** | 8·**7**·8·**7** | 8·8·8·8 (3-gap form OK) | **no** (N1) |
| guided + key | 8·8·OOS·8 | 8·8·OOS·8 | 8·8·OOS·8 | yes (n2) |
| opener + key | 8·8·8·**7** | 8·8·8·**7** | 8·8·8·**7** when the Model has more than one gap | **no** (N3) |
| error-analysis + key | 8·9·8·9 | 8·9·8·9 | 8·9·8·9 | yes |
| review + key | 9·9·8·9 | 8·9·8·9 | 9·9·8·9 | yes |
| pre-skill-check + key | 8·8·OOS·8 | 8·8·OOS·8 | 8·8·OOS·8 | yes (page fill OOS) |
| mixed-practice + key | 9·9·8·9 | 8·9·8·9 | 9·9·8·9 | yes |
| true-false + key | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 | yes (n5) |
| reason-it + key | 8·8·8·8 | 8·8·8·8 | 8·8·8·8 (F10 closed) | yes |
| practice card 1366 / 820 | 8·8·9·9 | — | 9·8·9·9 | yes |
| online worksheet 1280 | 8·**6**·8·9 | — | 8·8·8·9 | **no** (N2, band 120) |
| quiz 1280 | 8·**7**·9·9 | — | 9·8·9·9 | **no** (N2: 3 items, a repeated window about 44 % of the time) |

**L at band 120:** three-digit numbers leave about 1.3–2 mm clear in 17 mm squares, which caps C1 at 8. Bold True-or-False numbers at L ("101", "119") are the tightest.

**Screens:** three-digit numbers sit about 4 px from the square's border at 820. This is unchanged from r1 and legible at 45 px digits.

## Round-1 findings

| r1 | Status | Evidence |
|---|---|---|
| F1 True or False? never False | **closed** | 2 of 4 False at M and L (`c120-true-false-key-M.png`); wrongAnswer is non-null on 60 of 60 items |
| F2 EA answerable by counting | **closed** | Two-gap windows are both Correct and Fix it (`c120-error-analysis-key-M.png`) |
| F3 steps / Say cover the first gap only | **closed** for the provider's steps and filled Say (40/40). **The class recurs as N3** (the opener's unfilled frame) | read40, `c120-scripted-model-M.png` Say "The missing numbers are 101 and 104." |
| F3b Guided Model hints | **closed** | `guided-M`: three grey lines for 100, 107 and 117 |
| F4 grid=rows giveaway | **closed** on print (rows hidden at band 120 on the multi-item roles; the print deal passes over a repeated window). **The class recurs on the online worksheet and the quiz as N2** | `c120-worksheet-1280.png` |
| F5 lesson strip walks another item | **closed** | `c120-lesson-p2-M.png` and p3: generic steps |
| F6 Score /N | **closed** | independent / mixed /13, review /11 (9 + 2), guided /6, lesson p2 /7, pre-skill-check sections /5 and /2, opener /4 (independent part only; the unnumbered Guided part is unscored, as on every opener) |
| F7 lesson anchor text | **closed** for grammar. **New state defect N1** | `c120-lesson-p1-M.png` |
| F8 as-said form | **closed** | dealt for 101–110 only ("1003" for 103) |
| F9 band 10 duplicates | **closed** | band 10 hidden on the multi-item roles (signed ruling) |
| F10 band 100 Reason It squeeze | **closed** | `hcf100-reason-it-key-L.png`: squares about 17 mm |

## New findings

### N1 — two-gap Scripted Model and lesson anchor: "Write 101." beside a square with no 101 (major)

- **Rules:** PT-MOD-1 (cited on the card, §2.2: "Marks made in earlier steps are black, the newest marks are trace grey … Exactly one new mark group per state"), L6, C2.
- **Evidence:** `c120-scripted-model-M.png`.
  - The four states read "Ten more than 91 is 101." / "Write 101." / "One more than 103 is 104." / "Write 104.".
  - States 2 and 3 are drawn identical to state 1, so the "Write 101." frame shows no 101.
  - State 4 traces 101 AND 104, both grey: two new mark groups, and the earlier one is not black.
  - The lesson anchor p1 shows the same (`c120-lesson-p1-M.png`): "Write 94." over an empty square, then 94 and 112 both grey in panel 4.
  - This hits every two-gap window, which is 20 of 40 dealt items.
  - The 1- and 3-gap forms end on one "Write …" step and read correctly (`hcf100` scripted-model L).
- **Root cause:** `js/modules/sheet/roles/scripted-model.js:49`. `TRACE_TEMPLATES` holds only `count-row` and `function-table`, so `chartwindow` gets the default (blank states, the last one answered). Its two-gap steps (8ba7d77a5) have a "Write" step per gap.
- **Fix:** do one of these:
  - give the chart steps marks and add `chartwindow` to `TRACE_TEMPLATES` (state k writes gaps 1..k, the newest grey);
  - or make the two-gap steps end in ONE "Write 101 and 104." step, as the 3-gap form does.
- **Check:** MODEL-STATE-MARKS in `ws-providers-unit` or `ws-guided-echo`. For every Scripted Model or lesson anchor state whose step text is "Write N …", N is drawn in that state's cell. Each state adds exactly one new mark group, and earlier marks are solid. It fails today on chart_to_120 seed 429324.

### N2 — online worksheet and quiz repeat a band-120 window: items print each other's answers (major; F4 class, second round)

- **Rules:** L3, C2 ("nothing gives the answer away").
- **Evidence:** `c120-worksheet-1280.png`.
  - Items 1 and 4 are the same 91–115 window: item 4 prints 101 (item 1's answer), and item 1 prints 93, 103 and 111 (item 4's).
  - Items 2 and 3 are the same 92–116 window: each prints the other's two answers.
  - Band 120 has 6 windows, so 6 screen items repeat a window about 98 % of the time, and 3 quiz items about 44 % of the time.
  - Print is clean: `print-sheet.js` CROSS-GIVEAWAY (l. 954 / 1093) passes over a repeated window.
  - The screen deal (worksheet.js and quiz-builder) never calls that check.
  - At band 100 the screen windows vary, and only partial overlaps were seen.
- **Fix:** run the same window de-duplication (no repeated `chartWindow` squares, or blank the shared answers) in the worksheet and quiz deals. One shared helper beside `generateQuestionFor` would serve print and screen alike.
- **Check:** `ws-guided-echo` CROSS-GIVEAWAY extended to the screen hosts. Over seeds 1–20, build the online worksheet item list and the quiz question list for chart_to_120. FAIL when two items share a window's squares and one prints the other's gap. This is the F4 check on the hosts it never read; L13 "paper ≠ screen".

### N3 — opener Say frame "The missing number is __." under a two-gap Model (minor to major; F3 class, second round)

- **Rules:** PEDAGOGY Say band (the frame the pupil says must fit the item), H17 (VQ-9), C4.
- **Evidence:** `c120-opener-key-M.png`. The Model shows 111 and 115, and Say reads "The missing number is ______." A pupil cannot say both numbers in the frame. The cause is the static `strings.say` (`k2.js:481`) read unfilled by `opener.js:182` `oralFrameOf(items[0])`. The `sayValues` / `chartSay` agreement added for F3 reaches only the filled frame.
- **Fix:** the unfilled frame reads the item's gap count: "The missing numbers are ___ and ___." for two gaps. Alternatively, the opener Model picks a single-gap item.
- **Check:** SAY-AGREE extended to the unfilled frame. For every role that prints `oralFrameOf(item)` (opener, lesson, guided), the frame's number agrees with the Model item's `keyParts.length` and has as many blanks. It fails today on chart_to_120 opener M seed 118245.

## Notes (no score below 8 on their own)

- **n1.** Overlapping windows (not identical) share answers on band-120 print pages. Independent M p1 prints 11 of its 13 answers in some other item. That other item puts the number in a different square, so finding it is still the skill. `ws-guided-echo` OVERLAP-INFO already reports this. Owner or lead to decide whether band 120 wants fewer items a page.
- **n2.** Guided M Steps still breaks "Take away / 10." over two lines (r1 n2). Use a non-breaking space.
- **n3.** Reason It's text lists "1003, 111, 115" without "and", while Say uses "and". Make them consistent.
- **n4.** At L the band-120 three-digit numbers leave about 1.3–2 mm clear (C1 8, not 9). The 17 mm square is the ceiling on two columns.
- **n5.** True or False? "Finish the sentence." gives a True item an answer line the key leaves empty. This is the shared role's wording, as on passed skills; filed for lf-roles.

## Out of scope (lead ruling; listed, not scored)

- Lesson anchor-chart panel bands (p1 panels 1 and 3 about 30 % white under the chart) and lesson L p2 (lf-engine).
- The guided try band and the white under the guided page; the pre-skill-check page fill (p1 about 50 % empty); EB-GDPCAP (lf-roles).
- sibling-compare.
- The no-size-s-browser flake (lf-checks).
- role:stretch (card §5.7).

## What would make it pass

1. N1: the Scripted Model and lesson anchor states write each gap where their step says "Write".
2. N2: the screen deal (worksheet and quiz) passes over repeated windows, as print does.
3. N3: the opener's unfilled Say frame agrees with its Model's gap count.

Each of these comes with the machine check above, failing on `03c811eed` and passing on its fix. Then re-grade the scripted-model, lesson p1, opener, worksheet and quiz at band 120, M and L.
