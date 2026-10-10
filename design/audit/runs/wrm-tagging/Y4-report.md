# Wave 2 tagging: Y4 (Grade 3) report

Output: `data/curriculum/links/Y4.json` (built from a hand-written per-step spec. Every key was checked against live `SKILLS`. Every proposal id was checked against `WRM_PROPOSALS`, `STANDARD_PROPOSALS`, `WRM_EXTENSIONS` and `VISUAL_BUILDS`.)

Prior learning comes from the xlsx sheet "Grade 3". Each step takes the PRIOR list of the week in which it is first taught. The COPIED IN Grade 2 lessons (Multiplication: equal groups; Sharing and grouping; Compare and order non-unit fractions) are cited as pre-skills (`C`) for the W01 and W08 steps.

## Counts

| | n |
|---|---|
| Steps | 129 (14 blocks, none skipped) |
| Full | 61 |
| Partial | 45 |
| Gap | 23 |
| Proposals used | 65: **13 new**, 52 reused |
| Tag fixes | 71 |

### New proposals
`regroup_thousands`, `more_less_all`, `add_sub_place_units`, `exchange_count_add`, `exchange_count_sub`, `area_half_squares`, `div_by_itself`, `tenths_only`, `dec_fraction_basics`, `dec_compare_2dp`, `dec_order_2dp`, `money_compare_written`, `coord_polygon_draw`. All of them are options on live skills. No new skill ids.

### Gaps (23)
B1.S10 estimating on a 0–10,000 line, B1.S13 Roman numerals, B3.S4 compare areas, B4.S13 multiply three numbers, B5.S14 correspondence, B6.S6 missing lengths, B7.S3 partition a mixed number, B7.S14 subtract from wholes, B8.S3 and B8.S9 decimals in a place-value chart, B9.S1–S4 making a whole and partitioning decimals, B10.S4 estimating with money, B11.S1, S2, S4 and S5 (calendar units, h/min/s, 24-hour clock), B12.S1 turns, B12.S8 complete a symmetric figure, B13.S3 and S4 line graphs.

## Hardest calls

- **Exchange steps (B2.S3, S4, S6, S7): partial.** `add_10k_regroup` and `sub_10k_regroup` cannot hold a page to "exactly one" or to "more than one" exchange. WRM separates these (P-1: one new thing per step). The existing tags call them full, so tag fixes downgrade them.
- **Times-table steps (B4.S2–S10): full.** The constant set on `mult_facts`, `div_facts` and `count_by_tables` holds each table. The existing partial flags were there only because opts were not recorded. `mult_div_fact_family` has no table option, so it is paired with the constant-set skills.
- **B5.S12 Divide 2-digit (2): full.** I read it as the exchange of a ten (`divide` tiles 21, regroup "always"). `box_division_easy` deals only exact quotients with no exchange, so its tag moves to S11 only. Remainders stay a pre-skill.
- **B7.S5 Compare mixed numbers.** `fractions:compare` deals only proper fractions, so its tag on this step is removed. The step is partial through `mixed_nl_drag` plus the reused Y5 option `frac_compare_gt1`.
- **B8.S1 Tenths as fractions.** `frac_10_100` (tenths renamed as hundredths) belongs to B8.S7, so its tag is removed. `write_fraction` with denominations [5] mixes fifths and hundredths, so the step gets the new option `tenths_only`.
- **Decimal skills deal thousandths.** `compare_decimal`, `order_decimals` and `f_to_d`/`d_to_f` cannot be held to tenths, hundredths, or halves and quarters. This gives three new options.
- **B13.S2: full.** `bar_graph` forms "How many more?" and "The total of all the bars" cover comparison, sum and difference. The existing partial tag is upgraded.

## Owner questions (suggested answers)

1. **24-hour clock (B11.S4–S5).** The school uses US a.m./p.m. Build `time_24h_convert` anyway? *Suggested: yes, but low priority. It is a WRM step with no CCSS, so keep it enrichment.*
2. **Roman numerals (B1.S13).** Non-CCSS. Build `roman_100`? *Suggested: yes. It is a small skill, and the school teaches it in W12.*
3. **Exchange count.** Should "exactly one exchange / two or more" be a shared option on every `*_regroup` band (1k, 10k, 100k), not just 10k? *Suggested: yes. Make one option family in `skill-options.js`.*
4. **`improper_mixed` direction.** It deals both directions. Add a direction option so B7.S7 (mixed → improper) and B7.S8 (improper → mixed) get one-way pages? *Suggested: yes. It is cheap and it follows P-1.*
5. **Stale step ids on existing proposals.** `mult_three` lists Y4.B4.S12 (divide by 1 and itself), `line_graph` lists Y4.B13.S2, and `translate_grid` lists Y4.B14.S3. *Suggested: the lead drops those ids when merging. This file routes those steps to `div_by_itself`, `bar_graph` and `coord_polygon_draw`.*
6. **11 and 12 times-tables (B4.S9–S10)** go beyond 3.OA.C.7 (within 100). *Suggested: keep the full tags. The skills already support 12 × 12.*

## Caveats for the critic
- `decimal_nl_drag` (B8.S4) and `place_value_10x` with decimals on (B8.S5, S6, S10) were tagged full from their options. I sampled only the default deals, so check that a decimal-on page really gives 7 ÷ 10 = 0.7.
- Where a pre-skill names a step that has no live skill (for example "Bonds to 100"), the `note` field says so.
