## Bugs found on the way (not MAP gaps, but they break MAP practice)

- `addition:equal_sign` ("True/False Equations") deals 20/20 plain column additions and no true/false items: a skill that
  contradicts its own name. The existing `equal_sign_repair` proposal covers it; it should go to the content-audit gate.
- `measurement:heavier_lighter_visual` answers with emoji (200/200), which breaks black-and-white print (`map_heavier_lighter_bw`).
- `order_of_operations:paren_simple` deals products near 1,400, far above MAP's small-number order-of-operations items.
- `angles_lines:additive_angles` deals reflex parts such as 292° of 360°, beyond MAP grades 2–5.

## Owner questions (with suggested answers)

1. **Are the 2014 DesCartes continuum statements good enough evidence for RIT bands?** Suggested: yes for now, beside the
   current RIT Reference Charts; if you can export the current Learning Continuum from your MAP account, a later pass
   re-bands the rows from it.
2. **Money: MAP files coin and change items under Measurement & Data (K–2 chart).** Suggested: keep money in the
   Measurement strand of the MAP practice set, as the chart does.
3. **Should `map_share_among` (sharing "N among M" plus a screen drag response) be one option on `share_into_groups`?**
   Suggested: yes; this audit already merged the drag row into it.
4. **Fold `map_minutes_to_hours` into the WRM `time_convert` proposal?** Suggested: build them as one option (both
   directions, with decimal and mixed hours); the ids stay separate until the lead merges the build list.
5. **Grade-6 content in the 221–230 band (ratios, percent, powers of ten, integers).** Suggested: keep it; the 3–5 RIT list
   already includes it and pupils near the top of the band meet it.
6. **Ordinal numbers and zero are not CCSS, but MAP K–2 items use ordinals.** Suggested: keep the `ordinal` row at low priority.
   Roman numerals were dropped (not in CCSS or in any NWEA material found).
7. **CCSS codes filled in where the source proposal had none (`hv_lines` K.G.A.1, `four_quadrants` 6.NS.C.8).** Suggested:
   confirm; the lead writes them into build-list.js when merging.
8. **Six `map_regrade_*` proposals only record that a 6.2 skill needs a re-grade.** Suggested: the lead drops them if
   re-grades are tracked in the Wave 5 lanes, and keeps the row status `exists-regrade`.
