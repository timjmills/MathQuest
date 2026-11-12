# Lane lf-placevalue — the overdue BUILD lessons' place value and decimals skills to 8/10

**Model and effort: Opus 5.5, MEDIUM** (`mq-opus-medium`, `model: "opus"`; owner 2026-11-07, every agent in this program).
Step: first redesign of the pv kit's skills on pairs without a certificate (rule 0a) — medium throughout. Written by the lane
itself from the lead's launch message (session_01HVwpAE3g6EZH8idgErP6LP, 2026-11-07); no brief file existed.

**Read first:** `design/lessons-first/briefs/README.md`; `design/LESSONS_FIRST_PLAN.md` §3, §4.1, §6; CLAUDE.md;
`design/audit/LESSONS_LEARNED.md` (PRE-FLIGHT); `design/audit/RUBRIC.md`; `data/curriculum/ccss-build-lessons.json` (the
owner's order, 2026-11-07); `design/lessons-first/queue.json` (kind "build": skills, partial, build);
`design/catalogue/k2-number-sense-place-value.md` (PV ladder; written before the P9 rewrite, so each defect is re-checked on
the head); `design/research/place-value-rounding.md`; `data/curriculum/links/Y3.json`, `Y5.json`, `Y6.json`.

**Branch:** `claude/lf-placevalue` from `origin/claude/sweet-newton-c8wrv1` (9398c3a). Draft PR into
`claude/sweet-newton-c8wrv1`, never master.

**Files owned (placevalue lane, `build-list.js` LANES.placevalue):** `js/modules/gen-pv.js`,
`js/modules/sheet/cells/{pv,value-line,line-labels,gattegno}.js`, `js/modules/pv-support-cell.js`,
`js/modules/sheet/providers/pv.js`, `js/modules/sheet/cells/panes/{place,extras,pv-exchange}.js`, the card
`design/cards/pv/`. **Decimals** (`decimals:mult_decimal`, `div_decimal`) generate in `gen-fractions.js`, which is the
fractions lane's file; no fractions lane runs in wave 1, so the lane takes the decimals branches of that file only after the
lead confirms. `composing:number_word_form` generates in `gen-algebraic.js` (lf-algebra's file): its fixes go to lf-algebra.
Shared registries append-only; registry additions in `design/lanes/lf-placevalue/manifest.json`; links files as README rule 8.

## Scope, in the owner's teach-week order

| # | Lesson (CCSS) | Skills (queue.json) | Build entries |
|---|---|---|---|
| 1 | Read and write numbers to 1,000 (2.NBT.A.3) — long lesson passed | `placevalue:expand`, `combine`, `identify`, `unit_form`, `value`; `composing:number_word_form` (lf-algebra's file) | — |
| 6 | 10 times and one tenth of a digit's value (4.NBT.A.1, 5.NBT.A.1) — long lesson passed | presets `ten_times_value`, `one_tenth_value`, `ten_times_story` (of `value`), `place_value_10x`, `more_less_100`, `compare`, `identify`, `unit_form` | `value_ten_times` |
| 9 | Compare digit values (5.NBT.A.1) | `value` (partial) | `value_ten_times` |
| 10 | Decimals to thousandths in words and expanded form (5.NBT.A.3.A) | — (gap) | `thousandths_pv` |
| 12 | × ÷ decimals by powers of 10 with exponents (5.NBT.A.2) | `place_value_10x` (partial) | `pv10_exponents` |
| 13 | Count on to 120 (1.NBT.A.1) | `composing:hundreds_chart_fill`, `counting:number_seq_fill` — k2 lane's files | `chart_120` (k2) — out of scope unless the lead reassigns |
| 14, 15 | × decimals by decimals; ÷ by a decimal (5.NBT.B.7) | `decimals:mult_decimal`, `div_decimal` (partial) | `mult_dec_dec`, `decimal_models`, `div_by_decimal_model` — size the decimals engine first, report before building |
| later | 44 Add tenths and hundredths (4.NF.C.5) — fractions lane | — | — |

## Steps (checks first)
1. **Card:** draft `design/cards/pv/card.json` (family card for the pv kit skills in scope), generate it, write every
   undecided line as a question with a suggested answer in `design/status/lf-placevalue.md`, send them to the lead.
   Build nothing a card line has not decided; meanwhile do step 2.
2. **Checks first:** run `ws-precritic --skill <scope> --strict` on the head; for each red row and each catalogue defect
   that still reproduces, write or confirm the check, prove it FAILS on the head (backtest row in
   `tests/fixtures/precritic/backtests.json`), then fix.
3. **Fix / build** to the signed card; providers real (`workedSteps`, `wrongAnswer`, `misconceptions`, `strings`).
4. **Build entries** `value_ten_times`, `thousandths_pv`, `pv10_exponents` as presets / options / skills per the owner rule,
   each tagged (SKILL_STANDARDS, SKILL_WRM, links, search terms, appended share code) in the same change.
5. **Clean before critic** on the branch merged with the integration tip; one independent critic for the family (every scope
   skill on every page type, S / M / L, keys, three screen hosts, option panel). PASS → `redesign-passed.js` in the same commit.

## Gates
`ws-spec-card --check-signed design/cards/pv/pv.md`, `ws-precritic --skill <scope> --strict`, `ws-content-audit --skill`,
`ws-visual-quality --skill`, `ws-presets-unit`, `ws-standards`, `ws-search-terms`, `ws-code-snapshot`, `ws-wrm --report-only`,
`ws-wrm-page-unit`, `ws-lessonfit`, `ws-redesign-passed`, `ws-backtest`, `ws-boot-smoke`, `ws-lessons-first-queue --check`,
`node --input-type=module --check` on every touched module.

## Hand-over
`design/status/lf-placevalue.md` (State, Times, precritic table, critic verdicts, cost in $ and %, what remains, owner
questions). **Cap: $250** of session `cost_usd` (≈ 12.5 %); stop at 80 % ($200). Stop rules: README rule 11.
