# lf-ops — hand-over at the owner's budget stop (2026-11-14)

The lane stopped on the lead's order: only 1–2 % of the week was left. Resume after the Thursday 22:00 UTC reset.
Spend at the stop: session cost_usd about $1,165 (baseline $756.09).

## Live or with the lead for deploy
| Work | Branch @ head | State |
|---|---|---|
| div_facts / add_facts arrays (divship) | -lf-ops-divship | LIVE (master e9cb5797c) |
| Long-division bracket: joined (LDIV-JOIN, -RASTER), near-straight (LDIV-SHAPE), bigger work boxes at 4 a page (LDIV-ROOM) | -lf-ops-ldiv @ 0b98813ea | every narrow critic PASS; owner approved the boxes as they are; lead deploying |
| Mixed facts: ÷ inside the shared grid (MIXED-ALL-OPS), room above fact brackets (LDIV-FACT-ROOM) | -lf-ops-mixfacts @ 638971967 | narrow critic PASS 9/9/8/9; lead deploying |

## In progress or parked, in resume order
1. **Tables to 15 × 15 + presets + "How it is written" first** (owner 2026-11-14): -lf-ops-t15 @ 01e8f5498 (from 84f8813a1), stopped at the owner stop.
   **Built:**
   - band 225 on mult_facts and div_facts, through one `factTableTop()` helper;
   - the 13–15 ticks, shown only under 15 × 15;
   - presets `mult_facts_15` (ZH, grade 4) and `div_facts_15` (ZJ, grade 5; the commit message of 45f7f8b6f wrongly says ZI), each with tags, search terms and links;
   - the tick list last in the panel, under "Which facts" (display order only; the codec is unchanged).
   **Check:** `ws-tables15.mjs` (T15-*, FORM-FIRST): 24 findings on 84f8813a1, OK on the fix. Backtests `tables15` and `tables15-form-first` PASS; on precritic; ledger rows added.
   **Card:** facts card resigned UNSIGNED, sha256 a8a2fbef321e94145c39e5da3f1f9cebc6f881e58b4534a373c8fceda96c289d (blob 667b5786c7f1). It needs the lead's signature.
   **Hash proof:** 40 default hashes match master.
   **Gates:** boot-smoke, code-snapshot (741), content-audit, standards, search-terms, wrm, presets-unit, redesign-passed and codec-registry (except msChoose, which fails on master too) all pass.
   **Not done:**
   - precritic `--strict` for mult_facts and div_facts. The killed run showed reds in options-verify, empty-band, cell-checks `--card`, sibling-compare and print-lint `--supports array`, not yet compared with master. Look first at whether options-verify and cell-checks' pins fail to cover band 225 and 13–15;
   - ws-fact-pages;
   - the PNGs (scripts ready in scratchpad t15/);
   - ws-catalogue regeneration.
   Then the narrow critic.
2. **count_by_tables r4** (-lf-ops-props @ 4c249ee1d, with lf-checks eblast 2225965ce merged). F1 (Pre-skill check L 10 → 14 items) and m1–m3 are fixed, each check first (backtests 5/5). Precritic reds are routed classes only.
   **Before its narrow critic:**
   - hash-prove that passed skills are unchanged, because the pre-skill-check role and the print-sheet.js retitle are shared code;
   - send every changed passed Pre-skill Check page to the critic, add_facts included. If it now fills, the add_facts open defect closes.
   - eblast must reach master, or merge with it.
3. **area_model_div_4by2**: PARKED as built (-lf-ops-amdiv @ a910a45f5; card signed d96ee4579). Its area-model-div TEMPLATE round, covering 2by1 / 3by1 / 4by2, comes first after the reset (lead), then its full critic. Do NOT merge it toward master before then: its template change alters the live 2by1 and 3by1 pages ungraded.
4. Queued:
   - add_int number-line LABEL-GAP;
   - divide bracket at range 1000 still on the old template (ldiv-room N3);
   - add_facts Prerequisite Check fill, if item 2 does not close it.
5. Next build list: the multiplication size pairs (in lf-ops-props.md) — area_model_4by1, mult_4by1_column, area_model_2by2, area_model_3by2, mult_3by2_standard.

## Rules carried forward
- Every finding gets a check that fails on the bad commit and passes on the fix, a backtest, a place on precritic's path, and a ledger row.
- Never write a card's "Signed:" line; the lead signs.
- Run browser gates one at a time. ws-precritic and ws-backtest are never wrapped.
