# Defects waiting for a lane that is not running yet (from critic ea-r5, 2026-09-26)
- operations lane: div_remainders counters 4.7 mm in rows of 10, single-row pictures 32 % band (cells/ops-counters.js); nl_sub repeated numbers + a missing-change item (gen-operations.js); add_5_pictures repeats at size S (gen-counting.js)
- timemoney lane: money_compare coin sets A and B not in panels (cells/coins.js)
- placevalue lane (on resume): mixed_placevalue "10 = __" without a unit and "80 = 80 + 0"; round_nl_hundred_thousands deals only 900,000–1,000,000 (gen-algebraic.js)
- support ladder (unowned): fails on worksheet + quiz hosts for multi-slot items (rounding_table, expand notation); card works (pv lane, 2026-09-26)
- screen host (unowned): cellboxes have a double edge on the practice card (expand)

## Full kit print-lint on 2e434cd (deployed) — 33 of 191 documents fail, 463 findings
Log: scratchpad/lint-full-2e434cd.txt. Top rules: L-KEY AK-4 x21 docs, H13 x8, TY-1/TY-2 LiberationSans '−' x7 each, TY-11 x3, PAGEFILL x3.
Operations lane (a507ccc): addition add_sub_10s add_sub_100s number_families_add(_med/_hard) comparison_word; subtraction missing_add_sub unknown_start_wp mixed_subtraction; multiplication dot_array_mult mult_properties mult_comparison area_model_mult_hard mult_div_fact_family number_families_mult(_med/_hard) mixed_multiplication mult_missing_digit; division box_division_easy/hard area_model_div_2by1/3by1 missing_mult_div mixed_mult_div div_zero_in_quotient.
K2 lane (a19dcb8): composing odd_even select_even_odd compose_whole mixed_composing; counting_mixed counting_all.
Fractions lane (ac31945): composing fraction_number_line whole_as_fraction.
