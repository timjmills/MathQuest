# lf-vocab r16b: narrow critic (fixes 1-3 only)

Critic: independent, Opus medium. I graded from the renders in this folder and measured the PNGs with Python (cell rules, first black ink, last ink). I ran no browser scripts. Sizes M and L only, by owner rule.

## Measured (794 x 1123 px, 3.78 px/mm)
| page | content top in cell (mm) | band under content | page used |
|---|---|---|---|
| Match 3 L independent / more-practice / test | 4.2-4.8 (r16: 8.2-8.7) | 28 % | 88 % |
| Match 3 L review | 4.2-4.5 (r16: 7.9-9.0) | 28-29 % | 89 % |
| Match 3 M independent / more-practice / test | 4.2-4.8 | 9 % | 92 % |
| Match 3 M review | 4.2-4.5 | 28-29 % | 88 % |
| Match 3 L guided (model, hint) | 17.7 / 11.6 (same as r16) | 17 % / 4 % | 76 % |
| Match 3 M guided (model, hint, plain) | 13.5 / 8.2 / 4.5 | 15 / 5 / 18 % | 87 % |
| Pick 3 L / M scripted model | 6.1-6.3 / 5.8-6.1 | 16 % | p1 80 / 76 %, p2 47 / 44 % |
| Pick 3 L / M guided | step tag at top | lines at the cell foot | 86 / 87 % |

## Match 3 M and L (independent, more practice, test, review, guided, keys): 8 · 8 · 8 · 8. Caps: none.
- Fix 1 holds. On every practice page at both sizes the picture row starts 4.2-4.8 mm under the cell rule. It was 8-9 mm at r16 L.
- No band reaches 30 %. L practice cells sit at 28-29 %, which leaves only 1-2 points of margin (defect B).
- The letter is still top-left on every print cell. The A/B/C tops line up with the picture tops.
- Keys are facsimiles and correct (I checked review L and independent M item by item).
- Guided rows are equal: 286 / 287 px at L and 238 / 238 / 238 px at M.

## Pick 3 M and L (scripted model, guided): 8 · 8 · 8 · 8. Caps: none.
- Fix 2 holds. The scripted model cells read 16 % under the line, not 30.1 %. The line is at the r15 position.
- On the Guided pages the two write lines in a row sit on the same pixel (L 618 / 618 and 952 / 952). The Model tag is at the top-left.
- Scripted model p2 is 44-47 % used. It holds state 3 and the Say band, which close the role, so I do not apply H5. This is unchanged since r15.

## Hosts (card 390/820/1280, worksheet 1280, quiz 1280, both skills): 8 · 8 · 8 · 8. Caps: none.
- Nothing regressed. The letter is at the top-left on the card and quiz hosts.
- On worksheet-1280 the letter is still mid-left. This is r16 defect 1, which is still open.

## Defects (minor; none changes a score)
- **A. On Guided pages the work does not start at the top of the cell (C3 nit).**
  - On Guided M, the hint cell's pictures start 8.2 mm down and the plain cell's 4.5 mm down, so the two cells on one page differ.
  - On Guided L, the pictures start 11.6 mm down, and 17.7 mm in the model cell (11 mm under the Model tag).
  - Fix b52eac93 did not reach the Guided stage: the work is still centred above the hint line.
  - Fix: hang the work from the cell top on the Guided stage too, with the hint line taking margin-top:auto.
  - Check: extend L-TOPSTART / CL-4b to the guided role. The first ink of the work (below any Model tag) must be within 2 mm of the plain-cell offset on the same page.
- **B. The L practice band is close to the cap (C3 risk).**
  - The band under the work is 28-29 % (about 20 mm of a 72 mm cell).
  - Fix: let the L footprint drop by about 5 mm, or move the word row down 3 mm, so the band sits near 20 %.
  - Check: have ws-empty-band warn at ≥ 27 %, so a 1-2 point drift is caught before it fails.
- **C. r16 defect 1 is still open.** The letter is mid-left on worksheet-1280. Use the fix and check given in critic-r16.

## Verdict: PASS. Minimum score 8.
