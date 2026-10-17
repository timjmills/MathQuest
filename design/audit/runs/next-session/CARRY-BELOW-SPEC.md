# Carry digits at the bottom (owner request 2026-10-17) — SPEC, NOT BUILT

Owner: "for the multiplication and subtraction/addition I want to have an option to carry over numbers at the bottom
rather than the top like they do in their lessons. Boxes would have to be adjusted for this as well." Don't build yet.

## Owner answers (2026-10-17)
- **Where:** UNDER the answer line, in the next column to the left (the White Rose / UK "carry under" style): the pupil
  writes the answer digit, then the carried digit in a small box under the line beside it.
- **Which methods:** column addition (incl. 3- and 4-addend), column (short) multiplication 2×1 / 3×1 / 4×1, long
  multiplication partial-product rows (2×2, 3×2: carries for each row), and column subtraction.
- **Default:** a teacher setting, OFF. Top stays the default. New option on each column skill, e.g.
  `carry: 'top' | 'bottom'` ("Carry digits: at the top / under the line"), saved with the skill, in share codes
  (append-only codec key), honoured on every page type, every answer key, and every screen host.
- **Box:** a smaller box, about two-thirds of a digit box, at every size S/M/L, still big enough to write in
  (WORKSHEET_DESIGN_STANDARD: structural scaffold, the single grey outline, never shrinks the digits).

## Rules for the builder
- Kit template `stack` (and the long-multiplication template when built) gains the under-the-line carry row; the
  cell height grows by the carry row — content never shrinks; capacity tables re-checked.
- Answer keys show the carries in key colour in the same under-line boxes.
- Screen: the carry boxes are typable, optional (not scored), tab order answer digit → its carry, right to left.
- Long multiplication: one carry row under EACH partial-product row's line, cleared between rows (or a fresh row).
- Not a preset skill (CLAUDE.md "distinct option" rule): it is a layout preference, not a new difficulty or skill.

## Open question for the owner before building — subtraction
Exchange marks are normally made at the TOP (cross out, write the new digit above). "At the bottom" for subtraction
needs one choice:
- (a) suggested: keep crossing out at the top but write the exchanged 1 (the "ten ones") as a small digit under the
  line in the column that receives it — mirroring addition; or
- (b) the borrowed ten written beside the bottom number's digit (the "equal addition" / borrow-and-pay-back method,
  which changes the method itself).
