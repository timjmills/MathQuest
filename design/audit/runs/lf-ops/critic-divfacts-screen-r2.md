# Critic: division:div_facts screen hosts, round 2

- Critic: independent (built none of it), Opus medium, 2026-11-12. Frozen tree 3e8cf77e (fixes d377e32b). No source edited.
- Renders, one at a time, through /tmp/mq-browser-run.sh:
  `node tests/scripts/ws-grade-render.cjs --skills division:div_facts --roles independent --size M [--supports X] --out /tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/scr2-renders/<X>`
  for off, touch, skip, array (`--opts '{"constant":[2,3,4]}'`), think, boxsign, plus skip with `--opts '{"band":100}'` (the r1 open item).
  Outputs per run: card-1280 / card-820 / card-390, worksheet-1280, quiz-1280, paper independent page + key.
- Tool measures (meta.json): hScroll 0 and smallTargetCount 0 on all 35 host renders; every run finished with no errors.
- Gates run here: `ws-screen-support-eq` OK (touch tally 12, skip 12 ratio 0.37, array frame-array 12.0 x 35.8, think ratio 0.46,
  boxsign pane: 12 screen renders each); `ws-screen-answer --skills division:div_facts` card ok, worksheet ok (3/3), quiz ok (3/3), live green ok.
- VERDICT: **PASS** (lowest 8).

## r1 defects

| r1 | Status | Evidence |
|---|---|---|
| D1 array = loose counters | **Fixed** | array/card-1280 (9 ÷ 3: 3 rows of 3), card-820 (6 ÷ 2: 3 rows of 2), card-390 (12 ÷ 4: 3 rows of 4), quiz-1280 (15 ÷ 3: 5 rows of 3), worksheet all 6: the true array, quotient rows of the divisor's dots, top-anchored in the section's one tall frame, groups of 5 rows - the paper drawing (array/independent-p1.png). |
| D2 0 ÷ 2 cell 64 % empty | **Fixed** | array/worksheet-1280 item 1: the empty frame is drawn as on paper (0 ÷ 3, p1 item 3); the content reaches 404 of the 417 px cell. |
| D3 cue numbers too small | **Fixed** | skip strip at 0.37-0.39 of the fact digit on every host (quiz ~15 px cap beside ~38; worksheet ~12 beside ~31; card-390 ~12 beside ~31); think text >= 15 px font, ratio 0.46. Paper ratio 0.38. |
| D4 touch dots in two places | **Fixed** | touch/worksheet-1280: the 12-dot tally under the fact in all six cards. |
| r1 open: skip on band 100 | **Fixed** | skip-band100/worksheet-1280: strips of 10 (2 x 5), as paper's section tally. |

## Scores (C1 ease · C2 teaching · C3 spacing · C4 fidelity)

| Support | card-1280 | card-820 | card-390 | worksheet-1280 | quiz-1280 |
|---|---|---|---|---|---|
| off | 9 9 9 9 | 9 9 9 9 | 9 9 9 9 | 9 9 8 9 | 9 9 9 9 |
| touch | 9 8 9 9 | 9 8 9 9 | 9 8 9 9 | 9 8 9 9 | 9 8 9 9 |
| skip | 9 9 9 9 | 9 9 9 9 | 8 9 8 9 | 8 9 9 9 | 9 9 9 9 |
| array (2-4) | 8 9 8 9 | 8 9 8 9 | 8 9 8 9 | 8 9 8 9 | 8 9 8 9 |
| think | 9 9 9 9 | 9 9 9 9 | 9 9 9 9 | 8 9 8 9 | 9 9 9 9 |
| boxsign | 9 8 9 8 | 9 8 9 8 | 9 8 9 8 | 8 8 8 8 | 9 8 9 8 |

Checked everywhere: one answer place (the yellow input on the "=" line; the think box's square is an SVG image, role="img",
not an input), first input focused on card and worksheet item 1, B&W Andika cell inside the game chrome, nothing cut at 390
(hScroll 0; card-390 skip strip and array frame inside the cell edge), touch targets >= 44 px (smallTargetCount 0), the
worksheet and the quiz deal valid exact facts and mark the right answer (ws-screen-answer; supports add no input).

## Defects

None blocking. Notes that hold the 8s (not below the bar):

- **N1 · array dots small beside the screen fact. class: size. C1 8, C3 8 (array, all hosts).** array/card-1280.png, quiz-1280.png:
  dots 6 px (paper 7 px at A4 render, ~1.9 mm) in a ~40 px frame beside a ~40 px-cap fact: ratio dot : digit cap 0.15 on screen
  vs ~0.33 on paper. Countable at 3-5 rows; 12 rows (48 ÷ 4) will be tight. Suggest: scale the frame with --mq-digit on screen as
  the skip / think cues now do (same SCREEN_CUE_DIGIT_MM path in support-draw.js ~line 305). Check: extend ws-screen-support-eq's
  cue-ratio rule to the array dot (dot diameter >= 0.25 x the fact digit cap).
- **N2 · think box gap uneven. class: spacing. C3 8 (worksheet).** think/worksheet-1280.png items 2, 3, 5, 6: "7 ×   [ ]" leaves a
  wider gap after a 1-digit divisor than "11 × [ ]" (item 1): the × sits in a 2-digit slot. Minor; right-align the divisor slot or
  size it to the digit count.
- **N3 · boxsign "divide" label ~13 px on the worksheet** (boxsign/worksheet-1280.png). Unchanged from r1, held at 8.
- Card-vs-worksheet placement differs for touch / array / think (beside on the card, under on the worksheet); each host is
  consistent within itself and paper puts the cue under. Accepted as in r1.

## Rule 00 lists

**Automatic checks that would have caught each finding**
1. N1: ws-screen-support-eq cue-ratio rule extended from skip / think text to the array dot diameter (>= 0.25 x fact digit cap) and to the touch dot.
2. N2: a think-box glyph-gap check (distance × to box equal within 2 px across the section's cells).
3. N3: ws-screen-slots minimum font rule (>= 15 px) applied to the boxsign word label.

**Speed-ups this round revealed**
1. ws-grade-render could accept a list of supports in one call (one browser launch, six outputs); this round spent six launches.
2. ws-screen-answer should take `--supports` so marking is proven per support without a manual DOM argument (here: grep that the think cue is role="img").
3. meta.json still records no worksheet / quiz item texts (r1 speed-up 2 open); the critic read them from pixels.
