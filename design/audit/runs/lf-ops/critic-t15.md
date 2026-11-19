# Narrow critic — Tables to 15 × 15, presets, panel order (owner requests 2026-11-14)

Independent critic (Opus medium). Candidate 26f8028a9; master 55cbe72d2. Evidence is in the session scratchpad crit-t15/ (session-local).

**Verdict: FAIL on one defect.** C1 9, C2 **7**, C3 9, C4 9. Without D1, C2 would be 9.

- **D1 (blocking, C2).** The `mult_facts_15` preset page reads "I Can multiply facts to 12", but it deals facts up to 15 × 15. On the host with `{band: 225}` the line is right ("to 15"), and the `div_facts_15` preset is right too.
  - Likely cause (not traced): `optionICan` in js/modules/skill-options.js. The preset re-defaults its band to 225, so the band equals the default and no rewrite happens. The `v === 225 && bandDef.default === 144` branch never fires for a preset.
  - **Check:** T15-PRESET in ws-tables15 must also compare the preset page's I Can line with the host page's under the same options.

Checked and fine:
- 13–15 facts appear on all 8 pages (M and L, pupil page and key, both skills).
- Every answer is correct on mult-225-M-key (20 items) and div-225-M-key (24 items).
- 3-digit products and dividends fit their boxes, with digits the same size as at 12 × 12 (22 pt at M, 28 pt at L). The layouts match 12 × 12 and nothing overflows.
- The host I Can lines are right.
- The presets open at 15 × 15. Their labels and grades are sensible: mult grade 4 (4.NBT.B.5), div grade 5 (5.NBT.B.6).
- Panels: How it is written comes first, then Tables to, then Support, then Which facts. The 13–15 ticks show only under 15 × 15.
- `ws-tables15`: OK. `ws-options-shots`: OK.
- The default 12 × 12 pages are byte-identical to master (mult and div at M and L).

Nits:
- After choosing 15 × 15, the panel title still reads "Division Facts (÷1 to ÷12)".
- A "Support" heading sits right over a "Support" label. This probably predates the change.

**PARKED (lead: no fix round this week).** To resume: add the I Can comparison to T15-PRESET (it must FAIL on 26f8028a9), fix `optionICan` for presets, then re-check the preset page only.
