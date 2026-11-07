Lane: lf-placevalue
Title: Lessons-first wave 1 — place value and decimals skills of the overdue BUILD lessons to 8/10
Session: session_013pHDnMCXcY6kXV15KHf4Yp
Branch: claude/lf-placevalue
Owner of files: gen-pv.js, sheet/cells/{pv,value-line,line-labels,gattegno}.js, pv-support-cell.js, sheet/providers/pv.js, panes/{place,extras,pv-exchange}.js, design/cards/pv/
State: building
Updated: 2026-11-07
Builder profile: mq-opus-medium
Critic rounds: 0, none

## Now
- pv spec card drafted (`design/cards/pv/pv.md`): green except the owner signature; questions sent to the lead 2026-11-07.
- Precritic r0 on the #1 skills: running; first reds are combine (L10 zero-place cycle, page repeats, CL40-INK) and LESSON-DATA.
- Checks first: backtest rows for each red, then fixes in gen-pv.js / pv.js.

## Owner go

## Open questions
- Q1 Accept every PROPOSED decision in the pv card §7a (all options offered; word-problems and fact-rows out of scope; boss / race / map / bigboard / dark offered as on the facts card)? Suggested: yes, all as proposed.
- Q2 Keep identify's write-the-value line (owner 2026-10-10, `writeValue`, default on)? Suggested: yes, as ruled.
- Q3 Does the pv card also cover the decimal place value builds `thousandths_pv` (#10) and `pv10_exponents` (#12)? Suggested: yes, the same pv cell with a decimal-point track; × ÷ of decimals by decimals (#14, #15) get a decimals card.
- Q4 Capacity pins (ws-options-verify --render: an option value may print fewer items a page only by an owner ruling). Each value below writes a longer answer, so fewer columns fit:
  `expand form=notation` (S 10 vs 20, L 4 vs 12), `value form=unit` (S 12 vs 30, L 6 vs 12), `value form=notation` (S 16 vs 30, L 10 vs 12),
  `identify response=bank` (L 8 vs 10, the bank is a drawn box of words). Suggested: pin all four as owner-ruled (the answer is the
  longer form being taught; the page stays full at its own column count).
- Lead: (a) `composing:number_word_form` is lf-algebra's file (gen-algebraic.js): fixes routed there; (b) decimals generators are in gen-fractions.js (fractions lane, idle in wave 1): sized only, not edited without the lead's OK; (c) #13 Count on to 120 is k2-lane: out of scope unless reassigned; (d) lessons/prereqs.js entries for this lane's skills appended in their own block unless lf-engine claims the file.

## Scope (teach-week order, with reasons)
| # | Lesson | In scope | Why |
|---|---|---|---|
| 1 | Read and write numbers to 1,000 (2.NBT.A.3) | identify, value, expand, combine, unit_form | pv kit skills (gen-pv.js); number_word_form → lf-algebra |
| 6 | 10 times and one tenth (4.NBT.A.1, 5.NBT.A.1) | ten_times_value, one_tenth_value, ten_times_story, place_value_10x, more_less_100, compare; build `value_ten_times` | pv kit |
| 9 | Compare digit values (5.NBT.A.1) | value; `value_ten_times` | pv kit |
| 10 | Decimals to thousandths, word / expanded form (5.NBT.A.3.A) | build `thousandths_pv` | pv kit + decimal track (card Q3) |
| 12 | × ÷ by powers of 10 with exponents (5.NBT.A.2) | place_value_10x; build `pv10_exponents` | pv kit |
| 13 | Count on to 120 (1.NBT.A.1) | out | k2 lane's skills and build |
| 14, 15 | × decimals by decimals; ÷ by a decimal (5.NBT.B.7) | sizing only | gen-fractions.js (fractions lane) |

## Log
- 2026-11-07 r0 → fixes (4193f4b, a73304fd): combine dealer (dealIndex + freshDeal), CL-40 spacer for pv / pv-support equation rows
  (page + measuring cell), WRAP-OP (no-break expression; numeric frames never break), lesson data for 5 skills (chartWide / chartRow /
  tailLast), combine's worked steps write one digit a step. Backtests pv-combine-dealer, pv-lesson-data, pv-equation-row-cl40: PASS.
  Handed over: lesson Independent page PAGEFILL (lf-engine, roles/lesson.js); ws-card-rulings has no pv reader (lf-checks).
  Found next: expand's practice card is the legacy 'expanded' interactive (no kit cell, no Check button; ws-chromebook-fit FAIL);
  the chart support's heads are 5.8 pt at S (TY-11, pv-support-cell.js placeChartHTML).
- 2026-11-07 Decimals sizing: decimals:mult_decimal / div_decimal (gen-fractions.js, fractions lane) are legacy (emoji, colour, printFormat
  HTML, no kit cell, provider or options); decimal_models needs the unbuilt hundred-square template and the stack's dp track. A full
  family lane (spec card, two templates, migration): not started here.
- 2026-11-07 Lane started from 9398c3a; brief `design/lessons-first/briefs/w1-placevalue.md` written; pv card drafted and generated; owner questions sent to the lead.
