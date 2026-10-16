# placevalue:identify — also write the VALUE of the underlined digit (owner request 2026-10-10)

Owner (on the "I Can name the place of a digit" key, 539 / 132 / 891 …): "On this let them also have to
write the value of the underlined digit too" — "put a line at the bottom for that".

## Build (next session)
- New per-skill option in `js/modules/skill-options.js` `'placevalue:identify'`, APPENDED after the existing
  options (never reorder — share codes): `writeValue` (bool) "Also write the value of the underlined digit",
  default ON (owner request); Off keeps today's page.
- Cell: under the three place words, one LONG write-on line across the bottom of the cell, labelled exactly `Value` (owner: "with Value ____________" — the word Value, then a line running most of the cell width)
  (132, 3 underlined → 30; 539, 9 → 9; 891, 8 → 800). Kit write-on line (≥ 14 mm at M/L, same rhythm as
  other skills), Andika, black; the circle stays the first response, the value the second.
- Answer key: the ring orange (as now) AND the value written orange on the line (AK rules).
- Screen (card, online worksheet, quiz): the circle choice plus a number box for the value; the item is right
  only when both are right; the caret moves from the circle to the value box; per-part marks.
- Works with every existing option: bands to 999 / 100000 (values up to 90 000), `response: bank`
  (word from bank + value), `repeatDigit` (747 → the underlined 7's value), digit support.
- Edge: the underlined digit is never 0 (value 0 teaches nothing) — check the generator.
- Every page type (lesson/model/guided/independent/more practice/review/test) with a key; density: the extra
  line must not drop the page below the density target — re-check capacity at S/M/L.
- Model page Say: band: "The 3 is in the tens place. It is worth 30."
- Gates: ws-share-options, ws-code-snapshot, ws-codec-registry, ws-screen-answer, ws-print-lint --source kit,
  key-options; critic ≥ 8 on every page type and host.
