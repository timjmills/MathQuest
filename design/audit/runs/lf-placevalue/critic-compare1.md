# lf-placevalue critic compare r1: `placevalue:compare`

Independent critic (Opus medium). Grading only. Tree: `claude/lf-placevalue-w2` at 16748cd8 (the brief names b250883f; the
checked-out head is 16748cd8, the brief commit on top of it). Renders: `ws-grade-render --skills placevalue:compare` with
`--roles` at S and L (all 13 roles), M spot-check (independent, test, review, true-false, mixed-practice), option pages with
`--opts`, and the screen hosts. One browser command at a time through `mq-browser-run.sh`.

Rulings applied:
- **D3 ENGINE-ROLES.** Recorded with an `E`, graded, and not held against compare.
- **SCREEN-DIGIT** (29 px worksheet) belongs to the hosts lane.
- **Lead rulings 2026-11-13.** (1) A teacher-set 2 columns at S may leave up to 25 % under the grid. (2) pages-3 L page 2 is
  accepted under PT-ENG-6. **Neither costs a point.** I did not re-render these two shapes; precritic r2 measured them at 24 %
  and 22 %.

## VERDICT: FAIL

Four findings hold compare (F1–F4). One blocks outright: F1, an offered option prints broken numerals (H2).

## Grade table (C1-C4; `E` = ENGINE-ROLES under D3, not held)

| Version | S | M | L | Notes |
|---|---|---|---|---|
| independent + key | 9-8-8-9 | 9-8-8-9 | 9-8-8-9 | Keys right (30/30 S). "=" items 4, 11, 13, 20, 28 (5/30). F9 minor at L. |
| more-practice + key | 9-8-8-9 | - | 9-8-8-9 | Same deal and geometry as independent. |
| test + key | 9-8-8-9 | 9-8-8-9 | 9-8-8-9 | 18 / 16 / 12 items. 51–55 % white under the grid (F7, the combine F1 precedent). |
| review + key | 9-8-8-9 | 9-8-8-9 | 9-8-8-9 | Keys right (compare and the four "worth" items). |
| true-false + key | 8-8-8-8 | 8-8-8-8 | 8-**7**-6E-8 | L: no M6 error on the page (F3). L: 4 items, 53 % white (F8). |
| reason-it + key (default) | 8-8-8-8 | - | 8-**7**-7E-8 | L: no M6 error (F3). The circle + "is correct" + "The answer is" triple is the engine frame, the same on number_word_form. |
| reason-it band=999999 | **4**-7-**4**-8 | - | **4**-7-**4**-8 | **F1 (H2):** numerals overflow the A/B boxes and the page frame. |
| error-analysis + key | 8-8-6E-8 | - | 8-**7**-8-8 | L: 2 of 4 items are "=" and 0 show M6 (F3). Out of the rubric pass bar (owner 2026-09-26); graded because the brief asks. |
| opener + key | 8-8-5E-8 | - | 8-8-5E-8 | The 63–74 % bands are D3. |
| scripted-model + key | 8-**7**-5E-8 | - | 8-**7**-5E-8 | States 1 and 2 draw the same picture. "The first different digits are 7 and 4" names them but marks nothing (F2). |
| guided + key | 8-**7**-6E-8 | - | 8-**7**-6E-8 | The only worked model is "691 = 691", the edge case. The fading cue "Compare 924 and 998." repeats the item (F2, F4). |
| mixed-practice + key | 9-8-7E-9 | 9-8-7E-9 | 9-8-7E-9 | PG-23 balancing is D3. Keys right. |
| pre-skill-check + key | 8-8-8-8 | - | 8-8-5E-8 | L page 2 holds a lone row with 82 % white (pagination, D3 F21). |
| lesson (3 p) + key | 8-**7**-8-8 | - | 8-**7**-8-8 | **F2:** the chant and the anchor do not teach what the lesson deals. p3 is the same at S and L. |
| option band=99 S/L | 9-8-8-9 | - | 9-8-8-9 | Keys right. 5/30 "=". |
| option band=999999 independent S/L | 9-8-8-9 | - | 9-8-8-9 | Keys right (10/10 L). 2 x 11 at S and 1 x 10 at L. |
| option closeness=close (band 999999) S | 9-**7**-8-9 | - | - | Every unequal item is decided at the 2nd digit (F5). |
| option lengths=mixed S/L (independent, EA, TF, RI) | 9-**7**-8-9 | - | 9-**7**-8-9 | 16/30 items pair a 1-digit with a 3-digit number (F6). The M6 example never appears (F3). |
| practice card 1280 / 820 / 390 | 9-**7**-8-8 | | | 1280 opens on "897 = 897" (F4). Targets OK. Yellow next-box fill (allowed focus cue). |
| online worksheet 1280 | 9-**7**-8E-8 | | | Q1 "721 = 721" and Q6 "308 = 308": 2 of 6 (F4). 29 px digits are the hosts lane's. |
| quiz 1280 | 9-**7**-8-8 | | | Q1 "421 = 421" (F4). |

Lead rulings 1 and 2 (the 2-column S strip and pages-3 L page 2) cost **no point**.

## Findings

### F1 (critical; C1 ≤ 4, H2): reason-it at band=999999 prints overlapping numerals (S and L)
- **What I saw:**
  - `b6-L/reason-it-p1.png`: "534,486" starts left of the page frame. A's right number and B's left number print on top of
    each other ("5̶3̶4̶,486534,486"), the same in item 2, and the number runs past the B box into the A/B column. grade-render
    flagged it `OVERFLOW`.
  - `b6-S/reason-it-p1.png`: every 6-digit numeral crosses its box rule ("534,486|534,486" touch across the A/B gap) in all
    4 items.
- **Why it blocks:** band=999999 and role reason-it are both offered on the signed card, so this is a page a teacher can print.
- **Fix:**
  - The reason-it composer sizes the A/B boxes from the cell's footprint width. If two boxes do not fit, it stacks A over B.
  - Or compare declares a footprint so the composer drops to one box per row.
  - The owner of the reason-it A/B geometry needs a lead ruling, but the page is compare's and it is broken.
- **Check that would catch it:** precritic `ws-cell-checks --card --card-opts` claims "every card role x S/M/L and every offered
  option value: overflow" but missed this. Run `ws-grade-render --gate --roles <every card role> --opts <each offered value>`, or make
  cell-checks render the thinking roles under every band value. Today it passes while grade-render prints OVERFLOW.

### F2 (major; C2 7, lesson, scripted-model, guided): the lesson's rule and worked steps do not teach the decision the pages deal
- **The chant decides almost nothing on the pages.** The lesson Rule (p1 anchor band and p2 "Rule:") is "More digits, bigger
  number." Of the lesson's 33 compare items and its model, these are all same-length, so the chant decides none of them:
  - the anchor model 419 / 470;
  - the four p2 warm-up compares;
  - the three Guided items;
  - the six Independent items;
  - p3 items 1–12.
  
  It decides only p3 items 13–20, which is 8 of 33.
- **The anchor steps do not do what their headers say.**
  - Anchor step 1 "Count the digits." is captioned "Compare 419 and 470.", which counts nothing.
  - Anchor step 2 "Find the first different digit." says "1 and 7" but the drawing marks no digit, and states 1 and 2 draw the
    same picture.
  - The scripted model has the same pattern: 747 / 455, "The first different digits are 7 and 4", no mark.
  - Guided's fading cue is "Compare 924 and 998.", which repeats the item instead of giving the decision.
- **Source:**
  - `js/modules/lessons/families/placevalue.js:227` (chant);
  - `js/modules/sheet/providers/pv.js:671-684` (`workedSteps`: step 1 is `Compare a and b`).
- **Fix:**
  - The chant names both rules, for example "More digits wins. Same digits: the first different digit decides."
  - Worked step 1 states the count ("Both have 3 digits.").
  - Step 2 underlines or boxes the two deciding digits in the drawing.
- **Check that would catch it:**
  - LESSON-CHANT-FIT: the lesson's chant must decide at least half of the compare items the lesson deals.
  - WORKED-STEP-DOES: a worked step under a step header must not equal the item restated, and a step that names digits must mark
    them in the state's drawing.

### F3 (major; C2 7 on true-false L, reason-it L, error-analysis L and every lengths=mixed thinking page): M6 is not the error shown
The card's M6 is "89 > 312 because 8 > 3". Its first-digit / different-length half (the provider's M-C3) appears on no page I
rendered.

| Page | Errors shown | M6 among them |
|---|---|---|
| Default S, EA | 483 < 476 (last digit), 631 > 639 (reversed sign), 185 < 185 | 1 of 3 |
| Default S, TF | 992 < 928, 621 < 384 (last digit), and two others | 2 of 4 |
| Default S, RI | 465 < 417, 605 > 990 | 2 of 2 |
| Default L, EA | 509 < 508 (reversed sign), 195 < 195 | **0** |
| Default L, TF | 418 < 418, 300 > 519 | **0** |
| Default L, RI | 534 < 534, 920 > 957 | **0** |
| lengths=mixed, EA S/L, TF S, RI S | every error is last-digit or reversed: 774 < 5, 39 > 337, 360 < 35, 458 < 4, 6 > 603, 485 < 50, 417 < 42 | M-C3 **0** |

Why the mixed pages never show M-C3: the close+mixed deal makes the shorter number start with the longer one's digits
(`gen-pv.js:851-857`). With equal first digits, M-C3 can never give a wrong sign.

- **Fix:** deal the thinking roles from pairs that M6 gets wrong.
  - Same length: the last digits disagree with the first different digit.
  - Mixed: at least one "far" pair whose shorter number has the bigger leading digit (89 / 312).
  - Fall back to the reversed sign only when the role has used its M6 quota.
- **Check that would catch it:** ws-words-checks / ws-providers-unit, per thinking role × S/M/L × lengths value:
  - at least half the shown wrong items carry M-C2 or M-C3;
  - at least one M-C3 when lengths=mixed.

### F4 (major; C2 7 on card, worksheet, quiz; and the guided model): "=" is pinned to item 1 in live play
- **Cause:**
  - `gen-pv.js:57-71`: live play has no `itemSeed`, so `run = 0`, and `_liveCursor` starts at -1. The first item of a fresh session
    is `_at = 0`.
  - `blockOrder(6)` for block 0 with run 0 is `[5,3,1,4,2,0]`, so slot 0 is the "=" item (`genCompare`, `gen-pv.js:873`).
  - Every pupil's first compare item on screen is therefore the "=" edge case. This is the pinned position the round's own
    comment set out to remove, and the reverse of step 5 (far first).
- **What I saw:**
  - card-1280 Q1 "897 = 897";
  - worksheet Q1 "721 = 721" plus Q6 "308 = 308" (2 of 6, double the rate);
  - quiz Q1 "421 = 421".
- **Guided:** the guided page's only worked model is "691 = 691" (seeded print, S and L). The model that should show the decision
  shows the one case with no decision.
- **Fix:**
  - Live play mixes `run` from a per-session value (or starts `_liveCursor` at a non-zero offset), so "=" has no fixed slot.
  - The guided / opener / scripted model never takes an "=" item.
- **Check that would catch it:** precritic `ws-dealer-uniform` returned N/A ("no operand-dealt items"). Extend it to symbol answers:
  over N live sessions, the "=" position must not be pinned, and the rate per 6 must be about 1. Add a model-item rule: no "=" item
  as a worked model.

### F5 (major; C2 7, closeness=close at band 9999+): close 6-digit pairs are always decided at the 2nd digit
- **What I saw:** `close6-S/independent-key-p1.png` has 18 unequal items, and every one is decided at the ten-thousands digit (462,947
  vs 429,444; 516,909 vs 528,750; ...).
- **Why it matters:** the comparison past the second place (534,826 vs 534,862), which is the point of 4.NBT.2 at big bands,
  never occurs. The cause is `comparableSet`, which holds only the lead digit.
- **Fix:** for close items at nd ≥ 4, share a random prefix of 1..nd-1 digits, so the deciding place is spread over places 2..nd.
- **Check that would catch it:** a dealer check that the decisive-place index for closeness=close covers places 2..nd (for example,
  at least a third decided at place 3 or deeper).

### F6 (major; C2 7, lengths=mixed): most mixed items are trivial 1-digit vs 3-digit pairs
- **What I saw:** `mix-S/independent-key-p1.png` has 16 of 30 items pairing a single digit with a 3-digit number (994 / 9, 8 / 868,
  1 / 159, 280 / 2 ...). The lesson p3 mixed block does the same in 3 of 8 (541 / 5, 185 / 1, 9 / 981).
- **Why it matters:** the misconception the option targets lives in 2-digit vs 3-digit pairs (89 / 312).
- **Fix:** at band 999 draw lengths from {nd-1, nd}, with a 1-digit number at most 1 item in 6.
- **Check that would catch it:** a dealer check on the digit-count gap distribution for lengths=mixed.

### Minor and engine findings (do not hold compare)
- **F7 (minor, C3 8):** Test S / M / L end at 49 / 75 / 45 % of the body (fixed P-23 counts). This is the same as the combine F1
  precedent. Check: the pvdebt-proposed "white under a 1-page Test ≤ one row" rule.
- **F8 (ENGINE-ROLES):**
  - pre-skill-check L page 2: a lone row, 82 % white (H5, pagination F21).
  - true-false L: 4 items, 53 % white. The cells are not stretched, while number_word_form's are.
  - reason-it L: 46 % white.
  - opener / guided / scripted-model / EA S bands: D3.
  - Check: ws-empty-band EB-PAGE does not fire on the 82 % page; add a page-fill floor for pages after page 1.
- **F9 (minor, C3 8 at L and lesson p3):**
  - The 3-across rows run digits to 4 mm from each cell rule. Neighbouring items' numbers sit 7.7 mm apart across a rule, while
    the gaps inside an item are 4.5 mm.
  - It stays legible, but a 4th digit would not fit.
  - Check: a side-pad ≥ 5 mm rule in ws-slot-clip.
- **F10 (minor, engine frame):** "The answer is ___." holds a sign on true-false / reason-it, and the key writes the sign small above
  the line. "The sign is ___." would read better. This is the shared frame string.
- **F11 (note):** the S independent cell measured raw has about 40 % white under the line (pixel scan, padding included). The agreed
  measure (H13-ABS / EB-BAND, inside the pads) passes. `ws-empty-band --roles independent,... --no-baseline` returned OK.

## Visual-quality questions (RUBRIC 6.1)
1. **Representation:** compare numbers. Map: two numerals with a sign circle. Drawn. OK.
2. **Live parts:** the numerals, the circle and the tab, all live. The anchor "Count the digits" state is not live: it draws nothing
   to count (F2).
3. **One answer place:** the circle, everywhere. On screen, the circle plus the < = > keypad fill the same circle (a keypad, not a
   choice, H8 not applied).
4. **Type and stroke:** Andika, digits 16 / 22 / 28 pt. OK.
5. **Paper = screen:** the same cell. OK.
6. **Title:** "I Can compare numbers with <, > and =". OK.
7. **Own renders:** yes, every page above is compare's own render.

## PNGs graded
Scratchpad root `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-compare1/`:
- `S/placevalue__compare/{independent,more-practice,test,review,true-false,reason-it,error-analysis,opener,scripted-model,guided,mixed-practice,pre-skill-check}{,-key}-p1.png`
  and `lesson{,-key}-p{1,2,3}.png`
- `L/placevalue__compare/` (the same set, plus `pre-skill-check{,-key}-p2.png`)
- `M/placevalue__compare/{independent,test,review,true-false,mixed-practice}{,-key}-p1.png`
- `b6-S/`, `b6-L/placevalue__compare/{independent,error-analysis,true-false,reason-it}{,-key}-p1.png` (band 999999)
- `mix-S/`, `mix-L/placevalue__compare/{independent,error-analysis,true-false,reason-it}{,-key}-p1.png` (lengths mixed)
- `b99-S/`, `b99-L/placevalue__compare/{independent,reason-it}{,-key}-p1.png` (band 99)
- `close6-S/`, `close6-L/placevalue__compare/independent{,-key}-p1.png` (closeness close, band 999999)
- `screen/placevalue__compare/{card-1280,card-820,card-390,worksheet-1280,quiz-1280}.png`
- Benchmark: `../critic-nwf2/main/composing__number_word_form/{reason-it-S-key,true-false-L}-p1.png`
