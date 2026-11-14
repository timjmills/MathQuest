# lf-engine-roles — critic-ready, round 3 (fix round after critic r2 FAIL)

Branch `claude/sweet-newton-c8wrv1-lf-engine-roles`, merged with origin/master 7f2ca5e39. Critic r2 report:
`design/audit/runs/lf-engine-roles-r2/REPORT.md` (graded head 27b8e540c). Sizes M and L only (owner: S dropped).

## What changed

**Merge.** Master brought lf-roles' SPILL (PT-OPN-10) into `opener.js`, a second two-page path for word-work Models wider than the
half cell. Both paths are kept: SPILL first (a full-width story), then this lane's paths for every other Model. Ledgers merged by union.

**Opener (`js/modules/sheet/roles/opener.js`), in the order the plan tries them when the page is over budget:**
1. **Fewer Guided cells**: a Guided row of 3 or 4 takes 2 shorter cells (PT-OPN-6's floor) when that closes the page. Result:
   round_sort_10 M is one page (it was split, with page 1 49 % used).
2. **Split Model band (F3)**: a full-width legacy Model whose measured ink fits the half cell takes Model | Steps (PT-OPN-2) when that
   frees room for the Guided row. A kit Model already reaches the half cell through modelHAt.
   - add_wp_10k is not reachable this way: its Model is 117 mm of ink against a 92.3 mm half cell (the F1 ruling).
   - At M, master's SPILL leaves 84 mm white on page 1 against a Guided band of 90.8 mm, so SPILL-P1 holds.
3. **Model | Guided side by side (F1)**: the gate is sized from the MEASURED ink.
   - A kit cell needs the host's 2-column fit, and its ink must be no wider than the 92.3 mm inner half cell.
   - A legacy cell needs only its ink under the inner width: its fit flag reads the one-column footprint, not the drawing.
   - Result: add_wp_10k M and L never go side by side. coordinate_q1 and shape_name_match_3d go side by side and print on one page
     at M and L.
4. **Split**: the practice goes to page 2, and page 2 fills to the deal (the second Guided row, then Independent rows).
   - Each split note now says why the side-by-side row did not fit: the Guided row holds N cells, or the half cell does not hold the
     measured drawing.
   - The SPILL note says the story is wider than a half cell.

**Checks (checks first: each FAILs on 27b8e540c and PASSes on the fix):**
- **OPN-SPLIT** is a new rule in `ws-print-lint` L-DENSITY, with self-tests. A page of a multi-page kit Opener fails in either case
  below, unless the plan notes say the Model and one Guided cell side by side did not fit:
  - it uses under 50 % of its body, measured by ink (text, drawings and answer places, not cell boxes);
  - or it holds one Guided cell alone.

  DN-2 and LONE no longer count an Opener's Model page as "0 items": OPN-SPLIT judges that page by fill instead.
- **The OPENER-OVERFLOW ratchet** is the precritic gates `opener-overflow-M/L`.
  - It is keyed on (lint, rule, page) by `--ratchet-pages` (F2).
  - It carries the L-DENSITY rules DN-2, LONE, PAGEFILL and OPN-SPLIT through `--ratchet-density`.
  - Other density rules are not ratcheted. For example, H13 on a cell that moved to page 2 of a split reads as a page move, not a new
    defect.
- **Pins** `design/audit/baselines/opener-overflow.{M,L}.json` were re-taken on master 7f2ca5e39 with the r3 lint:
  - 727 Openers a size, run in 8 chunks of about 92 because of the harness leak;
  - L-OVERFLOW, L-SPLIT and L-DENSITY, each finding with its page;
  - the `parts` field kept.

## Gates

| Gate | Result |
|---|---|
| `ws-print-lint --self-test` | OK (115 assertions, 98 planted defects; OPN-SPLIT half-blank, OPN-SPLIT lone, side-by-side control) |
| `ws-backtest --row roles-opener-split-fill,roles-opener-ratchet-pages` | 2 PASS (FAIL on 27b8e540c, OK on a594e08d4) |
| OPENER-OVERFLOW ratchet, changed skills | 322 skills × M, L = 644 documents, 0 rises. The skills are: every Opener master prints over budget or spilled, the 67 that split at r2, and the 9 named. The chunks ran with `--ratchet-pages`; their rises were 17 × L-DENSITY H13 only (cells moved to page 2), and the `--ratchet-density` rule removes those. That rule was re-applied to the run's JSON, and the backtest proves the flag itself. |
| `ws-print-lint` M and L, all lints, 9 skills (5 named + 4 r2-PASS Openers) | Nothing worse than 27b8e540c. Only finding: shape_name_match_3d LS-4 × 34 (on 27b8e540c and master too; skill-owned). 0 OVERFLOW, SPLIT or DENSITY findings. |
| `ws-boot-smoke` | OK |
| `ws-layout-unit` | FAIL 1 of 1766: the known "Guided, 110 mm cells: continues on page 2" only |
| `ws-roles-unit` | OK (101) |
| `ws-lesson-baseline --all-lessons --sizes M,L --seeds 4242,1 --per-lesson --unpinned --check` | OK: 1772 hashes identical (lessons unchanged) |
| `ws-precritic-plan` | OK. checks-from-critics 0 fail: the MIX-S rows are exempted; `roles-mixed-size-order` is retired with size S. |

## Opener pages: % of the body used (ink), before 27b8e540c → after

Counts are pupil pages. A dash means one page, so OPN-SPLIT does not apply.

| Skill | Size | Before: pages, p1 / p2 % | After: pages, p1 / p2 % | Note |
|---|---|---|---|---|
| coordinate_q1 | M | 2, 55 / 53 | 1, — | Model \| Guided side by side |
| coordinate_q1 | L | 2, 58 / 56; page 2 one Guided cell alone | 1, — | side by side; about 40 % white under Say: no item is under 110 mm |
| shape_name_match_3d | M | 2, 54 / 97 | 1, — | side by side |
| shape_name_match_3d | L | 2, 58 / 52 | 1, — | side by side; the Guided strip wraps to two lines at half width |
| round_sort_10 | M | 2, **49** / 95 | 1, — | 2 Guided cells of 98 mm (were 3 of 110 mm, 2.8 mm over) |
| round_sort_10 | L | 2, 57 / 54 | 2, 57 / 54 | Model + Steps 113 mm; 3 Guided cells 128 mm; neither 2 columns nor side by side closes one page |
| add_wp_10k | M | 2, 63 / 74 | 2, 55 / 74 | master's SPILL; page 1 white 84 mm < the Guided band's 90.8 mm (SPILL-P1); Steps in two columns |
| add_wp_10k | L | 2, 71 / 87 | 2, 66 / 87 | master's SPILL |
| multi_step_word | M | 2, 68 / 83 | 2, 60 / 84 | master's SPILL |
| multi_step_word | L | 2, 77 / 96 (page 2 ran 2.1 mm over, F2) | 2, 71 / 46 | master's SPILL. Page 2 has 110 mm left; the next story needs 115.8 mm, so PT-OPN-10 accepts the white. The note says side by side was tried. |
| integers:add_int, nl_add, nearest_million, order_clocks_digital_asc | M, L | 1 | 1 | unchanged |

## Proof

- PNGs, before (27b8e540c) and after, pupil and key, M and L, for the 5 skills:
  `design/audit/runs/lf-engine-roles/proof-r3/opener-<cat>.<skill>-<M|L>-<before|after>-<pupil|key>-p<n>.png`.
- Round-2 README errata: `proof/README.md`.
  - mixed_placevalue M is 1/2/0 → 1/2/0.
  - fraction_of_set L is 1 page at seed 4242, and the sweep line is corrected.

## Findings routed, not this lane

- F4 mixed_placevalue: owned by the mixed-pool owner.
- F5 raw JSON on keys: the lead's hotfix `ws-key-json`.
- F6 add_int number line: skill-owned.
- The harness leak: an OWN row for lf-checks in CHECKS_FROM_CRITICS, with the repro commands.

## Self-check (H5 / C3)

coordinate_q1 L is one page with about 40 % white under the Say band.
- That white is more than the PRE-FLIGHT 30 % band, but no practice item at L is under 110 mm, so no row fits there.
- The alternative is r2's two pages at 56–58 %, which the critic scored C3 = 5.

shape_name_match_3d L keeps two skill-owned defects:
- the Answer line over its word bank (F5);
- an instruction that says "Draw a line" where the cell asks for written names.
