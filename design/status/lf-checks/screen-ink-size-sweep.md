# SCREEN-INK-SIZE sweep: every redesign-passed skill (lane lf-checks, 2026-11-13)

Check: `tests/scripts/ws-screen-ink-size.cjs`.
- SIZE-INK: a repeated picture mark on a screen host must be at least 95 % of its print size in CSS mm. The print size comes from the Independent page at M, built with the same options and seed.
- SIZE-WIDTH: a drawing that uses less than 60 % of its cell's free width must not be taller than it is wide.

Run:

    node tests/scripts/ws-screen-ink-size.cjs --passed --report-only --json sweep.json

**Tree.** Branch claude/sweet-newton-c8wrv1-lf-checks at f5c03405. The screen code for div_facts is the same as on master 73e96fc1.

**Scope.** 26 skills. Each was run with its defaults and with every value of its supports-model `support` option. Hosts were the card at 390 / 820 / 1280, the worksheet at 1280 and the quiz at 1280: 624 renders, 407 s.

**Result: 97 findings on 3 skills.** The other 23 passed skills either draw no repeated picture marks on screen or draw them at print size. Nothing was fixed (report only).

## Skills hit, per rule

| Rule | Skills |
|---|---|
| SIZE-INK | addition:add_facts (touch, tile, frame), multiplication:mult_facts (touch, skip, array), division:div_facts (array) |
| SIZE-WIDTH | multiplication:mult_facts (array), division:div_facts (array) |

subtraction:sub_facts and addition:add_wp_10 are clean once like is compared with like (see the notes below).

## Every hit

There is one row per skill, option, host, width, rule and mark kind. "n" is how many screen cells failed (card seeds 7 / 8 / 9, the 4 worksheet cards, the 2 quiz questions). The percentage is screen size over print size for SIZE-INK, and drawing width over free width for SIZE-WIDTH.

| Skill | Option | Host | Width px | Rule | Mark kind | Numbers | n |
|---|---|---|---|---|---|---|---|
| addition:add_facts | support touch | card | 390 | SIZE-INK | ws-td-svg circle | screen 1.64 mm vs print 1.76 mm (93 %) | 1 |
| addition:add_facts | support touch | worksheet | 1280 | SIZE-INK | ws-td-svg circle | screen 1.64 mm vs print 1.76 mm (93 %) | 1 |
| addition:add_facts | support tile | card | 390 | SIZE-INK | and circle | screen 2.16 mm vs print 2.40 mm (90 %) | 3 |
| addition:add_facts | support tile | card | 820 | SIZE-INK | and circle | screen 2.12-2.16 mm vs print 2.40 mm (88 %) | 3 |
| addition:add_facts | support tile | card | 1280 | SIZE-INK | and circle | screen 2.12-2.16 mm vs print 2.40 mm (88 %) | 3 |
| addition:add_facts | support tile | worksheet | 1280 | SIZE-INK | and circle | screen 2.12-2.16 mm vs print 2.40 mm (88 %) | 4 |
| addition:add_facts | support tile | quiz | 1280 | SIZE-INK | and circle | screen 2.16 mm vs print 2.40 mm (90 %) | 1 |
| addition:add_facts | support frame | card | 390 | SIZE-INK | and circle | screen 2.53 mm vs print 2.80 mm (90 %) | 3 |
| addition:add_facts | support frame | card | 820 | SIZE-INK | and circle | screen 2.53 mm vs print 2.80 mm (90 %) | 3 |
| addition:add_facts | support frame | card | 1280 | SIZE-INK | and circle | screen 2.53 mm vs print 2.80 mm (90 %) | 3 |
| addition:add_facts | support frame | worksheet | 1280 | SIZE-INK | and circle | screen 2.53 mm vs print 2.80 mm (90 %) | 4 |
| addition:add_facts | support frame | quiz | 1280 | SIZE-INK | and circle | screen 2.53 mm vs print 2.80 mm (90 %) | 1 |
| multiplication:mult_facts | support touch | card | 390 | SIZE-INK | ws-td-svg circle | screen 1.64 mm vs print 1.76 mm (93 %) | 2 |
| multiplication:mult_facts | support touch | worksheet | 1280 | SIZE-INK | ws-td-svg circle | screen 1.64 mm vs print 1.76 mm (93 %) | 2 |
| multiplication:mult_facts | support skip | card | 390 | SIZE-INK | count by rect | screen 5.40 mm vs print 5.91 mm (92 %) | 3 |
| multiplication:mult_facts | support skip | card | 820 | SIZE-INK | count by rect | screen 5.40 mm vs print 5.91 mm (92 %) | 3 |
| multiplication:mult_facts | support skip | card | 1280 | SIZE-INK | count by rect | screen 5.40 mm vs print 5.91 mm (92 %) | 3 |
| multiplication:mult_facts | support skip | worksheet | 1280 | SIZE-INK | count by rect | screen 5.40 mm vs print 5.91 mm (92 %) | 4 |
| multiplication:mult_facts | support skip | quiz | 1280 | SIZE-INK | count by rect | screen 5.40 mm vs print 5.91 mm (92 %) | 1 |
| multiplication:mult_facts | support array | card | 390 | SIZE-INK | rows of circle | screen 1.71-1.73 mm vs print 1.92 mm (89 %) | 3 |
| multiplication:mult_facts | support array | card | 390 | SIZE-WIDTH | rows of | drawing 14.3 x 25.1 mm, free width 63.6 mm (22 %) | 1 |
| multiplication:mult_facts | support array | card | 820 | SIZE-INK | rows of circle | screen 1.71-1.73 mm vs print 1.92 mm (89 %) | 3 |
| multiplication:mult_facts | support array | card | 820 | SIZE-WIDTH | rows of | drawing 11.6 x 25.1 mm, free width 157.0 mm (7 %) | 1 |
| multiplication:mult_facts | support array | card | 1280 | SIZE-INK | rows of circle | screen 1.72 mm vs print 1.92 mm (90 %) | 3 |
| multiplication:mult_facts | support array | card | 1280 | SIZE-WIDTH | rows of | drawing 19.8 x 25.1 mm, free width 140.7-151.4 mm (6-20 %) | 3 |
| multiplication:mult_facts | support array | worksheet | 1280 | SIZE-INK | rows of circle | screen 1.72-1.73 mm vs print 1.92 mm (90 %) | 4 |
| multiplication:mult_facts | support array | worksheet | 1280 | SIZE-WIDTH | rows of | drawing 9 x 33.3 mm, free width 53.0 mm (17-32 %) | 2 |
| multiplication:mult_facts | support array | quiz | 1280 | SIZE-INK | rows of circle | screen 1.73 mm vs print 1.92 mm (90 %) | 1 |
| division:div_facts | support array | card | 390 | SIZE-INK | array circle | screen 1.77 mm vs print 1.96 mm (90 %) | 3 |
| division:div_facts | support array | card | 390 | SIZE-WIDTH | array | drawing 10.8 x 32.3 mm, free width 23.0 mm (47 %) | 3 |
| division:div_facts | support array | card | 820 | SIZE-INK | array circle | screen 1.77 mm vs print 1.96 mm (90 %) | 3 |
| division:div_facts | support array | card | 820 | SIZE-WIDTH | array | drawing 10.8 x 32.3 mm, free width 108.3 mm (10 %) | 3 |
| division:div_facts | support array | card | 1280 | SIZE-INK | array circle | screen 1.77 mm vs print 1.96 mm (90 %) | 3 |
| division:div_facts | support array | card | 1280 | SIZE-WIDTH | array | drawing 10.8 x 32.3 mm, free width 94.5 mm (11 %) | 3 |
| division:div_facts | support array | worksheet | 1280 | SIZE-INK | array circle | screen 1.77 mm vs print 1.96 mm (90 %) | 4 |
| division:div_facts | support array | worksheet | 1280 | SIZE-WIDTH | array | drawing 10.8 x 32.3 mm, free width 81.0 mm (13 %) | 4 |
| division:div_facts | support array | quiz | 1280 | SIZE-INK | array circle | screen 1.77 mm vs print 1.96 mm (90 %) | 1 |
| division:div_facts | support array | quiz | 1280 | SIZE-WIDTH | array | drawing 10.8 x 32.3 mm, free width 87.6 mm (12 %) | 1 |

## Print reference sizes (Independent page at M, median of each mark's smaller side)

- addition:add_facts: touch "ws-td-svg circle" 1.76 mm; touchall 1.44 mm; tile "and circle" 2.40 mm; frame "and circle" 2.80 mm
- subtraction:sub_facts: touch / touchall "ws-td-svg circle" 1.44 mm; tile "dot tile of circle" 6.00 mm, "ten frame: circle" 6.50 mm; frame "ten frame: circle" 6.50 mm
- multiplication:mult_facts: touch "ws-td-svg circle" 1.76 mm; skip "count by rect" 5.91 mm; array "rows of circle" 1.92 mm
- addition:add_wp_10: "k2-svg (fish) circle" 0.68 mm, "k2-svg (balls) circle" 8.05 mm, "k2-svg (apples) path" 1.04 mm, ...
- division:div_facts: touch "counting dots in fives circle" 1.58 mm; skip "count by to rect" 5.45 mm; array "array circle" 1.96 mm

## Master 73e96fc1 (the state the owner caught): division:div_facts

`MQ_ROOT=<73e96fc1 checkout> node tests/scripts/ws-screen-ink-size.cjs --skill division:div_facts` FAILS with 28 findings, all with `support: array`:
- **Dot size.** The array dot is 1.77 mm on every host, against 1.96 mm on paper (90 %).
- **Strip shape.** The array is a 10.8 x 32.3 mm strip. It uses:
  - 11 % of the 94.5 mm free width on the 1280 card
  - 10 % of 108.3 mm at 820
  - 47 % of 23.0 mm at 390
  - 13 % of 81 mm on the worksheet
  - 12 % of 87.6 mm on the quiz

Paper draws the same 12 x 35.8 frame (45 x 135 px in a 174 px cell). SIZE-WIDTH judges screen hosts only, so the paper strip is not reported.

## Notes for the lane

- **Touch dots on a digit** (`svg[data-digit]`) are judged by SIZE-INK only, because the digit's own shape makes them tall.
- **A mark group needs at least 3 like marks in at least 3 distinct places.** In add_wp_10, the picture details drawn three times at one point are not counted as marks.
- **An unlabelled picture is matched by the noun its item names**, so fish are compared with fish and apples with apples. Before this rule, the fish's 0.97 mm details were compared with paper's 4.37 mm balls.
- **Not yet wired into ws-precritic.** The lane owns that step. The backtest rows are `screen-ink-size-ink` and `screen-ink-size-width`.
