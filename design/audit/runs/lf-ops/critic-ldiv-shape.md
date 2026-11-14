# Narrow critic — LDIV-SHAPE, near-straight division bracket (owner request 2026-11-14)

Independent critic (Opus medium). Candidate db7dd3c39; shape fix b7ee41f3a, parent 202d7b575. Evidence is in the session scratchpad crit-ldiv3/ (session-local).

**Verdict: PASS.** C1 9, C2 9, C3 9, C4 9. No fail-level findings.
- **Near-straight on every render.** Bow measured from the 400 dpi pixels: M pupil 0.16 mm, L pupil 0.19 mm, L key 0.20 mm. The gate's worst is 0.34 mm, on the screen bracket, against a 0.6 mm limit.
- **Joined as one mitred stroke**, with no gap or seam on paper or screen.
- **Stroke unchanged.** Only the path's `d` attribute differs from the parent.
- **Reads as a division bracket** at every size and host, and stays clear of the divisor and dividend. Fact-rows is the tightest, at about 1.1 mm each side.
- **Divisor spacing reads well.** The space divisor→stroke matches the space stroke→dividend:
  - M 70 / 76 px and L 90 / 92 px at 400 dpi;
  - the 1366 card 33 / 34 px.
  The one uneven case is the paper remainder bracket with a 1-digit dividend. That extra white is the dividend column's own width, which this change does not touch.
- **Gate:** `ws-ldiv-hug --join --raster --shape` OK. 610 arcs; gap and step 0.00 mm; bow 0.34 mm; brightest bar pixel 0.
- **Diff:** buildSheet HTML for 8 documents (long_div_2digit M / L, div_facts fact-rows M, div_remainders L, each pupil page and key) is byte-identical once the bracket path and the vinculum's corner offset are stripped. No digit moved.
- **Nit, no action:** a 0.2 mm bow is just visible on the large L key cell. That is within the ruling; a smaller BRACKET_SAG would remove it if the owner wants it perfectly straight.
