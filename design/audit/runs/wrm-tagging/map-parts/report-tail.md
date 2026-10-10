## Bugs found on the way (not MAP gaps, but they break MAP practice)

- `addition:equal_sign` ("True/False Equations") deals 20/20 plain column additions and no true/false items: a skill that
  contradicts its own name. The existing `equal_sign_repair` proposal covers it; it should go to the content-audit gate.
- `measurement:heavier_lighter_visual` answers with emoji (200/200), which breaks black-and-white print (`map_heavier_lighter_bw`).
- `order_of_operations:paren_simple` deals products near 1,400, far above MAP's small-number order-of-operations items.
- `angles_lines:additive_angles` deals reflex parts such as 292° of 360°, beyond MAP grades 2–5.
- `graphs:line_plot` labels unsimplified fractions ("4/8 inches"); `measurement:mass_volume_liquid` answers 0 on half of its "read the scale" items.

## Owner questions (with suggested answers)

1. **Are the 2014 DesCartes continuum statements good enough evidence for RIT bands?** Suggested: yes for now, beside the
   current RIT Reference Charts; if you can export the current Learning Continuum from your MAP account, a later pass
   re-bands the rows from it.
2. **Money: MAP files coin and change items under Measurement & Data (K–2 chart).** Suggested: keep money in the
   Measurement strand of the MAP practice set, as the chart does.
3. **Should `map_share_among` (sharing "N among M" plus a screen drag response) be one option on `share_into_groups`?**
   Suggested: yes; this audit already merged the drag row into it.
4. **Grade-6 content in the 221–230 band (ratios, percent, powers of ten, integers).** Suggested: keep it; the 3–5 RIT list
   already includes it and pupils near the top of the band meet it.
5. **Ordinal positions (first, second …) are not CCSS, but MAP K–2 items use them.** Suggested: keep the `ordinal` row at low
   priority. (Zero as a count is K.CC.A.3 and is a normal row.) Roman numerals were dropped (not in CCSS or any NWEA material found).
6. **CCSS codes filled in where the source proposal had none (`hv_lines` K.G.A.1, `four_quadrants` 6.NS.C.8).** Suggested:
   confirm; the lead writes them into build-list.js when merging.
