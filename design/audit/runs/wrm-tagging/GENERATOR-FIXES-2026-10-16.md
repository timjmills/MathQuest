# Generator fixes for the WRM tagging lanes (2026-10-16)

Two generator bugs the tagging critics reported are fixed on branch `claude/admiring-turing-kbergd`.
The clauses that note them can be tightened once that branch merges.

## 1. `measurement:mass_volume_liquid`: kg dials read 0 (Y2-Y3 critic r11 N10, Y5 critic side finding)

`gen-measurement.js` divided the kg maximum (5 or 10) by a gram step (500 or 1000), so a kg dial had
under one mark and the answer was 0. kg dials now step in whole kilograms (0–5 kg and 0–10 kg, a
mark every 1 kg). Over 100 seeds each, `{}`, `{forms:[0]}` and `{forms:[1]}` have no item with answer 0;
`{forms:[1]}` now deals kg readings 1–9 and gram readings 100–1800.

Clauses to tighten:
- **Y3.B7.S2 Measure mass in grams**: drop "some items ask the mass in kg (answer 0) on the same scale".
- **Y2.B7.S3 Measure in kilograms**: "reading a kilogram scale is not dealt" is no longer true. The
  scale form deals real kg dials, roughly half the scale items. Re-grade the partial with that in mind.

## 2. `fraction_operations`: the `denoms` option ignored by the click-all and sort forms (Y5 critic r4, class A)

Two causes:
- the accept layer's reader (`itemDenominators`, generate-question.js) did not read a choice's or tile's
  `label`, so a click-all or sort item always passed;
- the forms drew from fixed pools, so they could not honour a family even when asked.

Both are fixed. `itemDenominators` now reads option and tile labels. Every denominator pool in
gen-fractions.js (`dPool`, `denPairs`, `denOptions`, `den = pick([...])`, the like-denominator
`rng(2, 12)`) is narrowed to the ticked families through `_fDenPool` / `_fDenPairs`. At the default
the pools are unchanged, so an untouched page draws exactly what it drew before.
`denomAllowed` moved to utils.js, and generate-question.js re-exports it.

Checked with `node tests/scripts/ws-gen-bugs-check.cjs`: every offered family on its own, 60 seeds, for
add/sub × frac/mixed × unlike, unlike_nv, like_nv. Before the fix, 21 skill × family combinations dealt
off-family items; after, there are none. The forms stay in the mix. For example, `add_frac_unlike {denoms:[2]}`
deals 43 calculate and 17 click-all items, and `add_mixed_unlike {denoms:[2]}` deals 34 / 17 / 9 sort.

One exception remains. A form whose instruction names a benchmark outside the ticked family ("greater than 1/4",
"compared to 1/2") is redrawn as another form. Examples are `sub_frac_unlike {denoms:[3]}` and
`sub_frac_like_nv {denoms:[3]}` or `{denoms:[5]}`. So those pages have no click-all or sort items, but no
off-family fraction either.

Clauses to tighten (Y5):
- **Y5.B4.S10** (`add_frac_unlike`, `add_frac_unlike_nv`): delete "click-all and sort items ignore
  {denoms:[2]} (3/5 + 3/8 …)". With `{denoms:[2]}` every item now uses halves, quarters and eighths.
- **Y5.B4.S11 Add fractions, total > 1**: the class-A cap (45/60 unrelated pairs) no longer applies.
- **Y5.B4.S13** (`add_mixed_unlike`, `sub_mixed_unlike`): drop "the click-all and sort items ignore
  {denoms:…}". The related-denominator claim now holds on every form.
