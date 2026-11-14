# Narrow critic — LDIV-JOIN, the joined long-division bracket (owner request 2026-11-14)

Independent critic (Opus medium). Candidate 654606ae3; reference master 3623be10c. Evidence is in the session scratchpad crit-ldiv/ (session-local).
Skills: long_div_2digit, div_facts {divForm: long} with its fact-rows page, div_remainders {notation: [bracket]}. Paper at M / L, pupil page and key; practice card at 1366 / 820.

**Verdict: narrow FAIL, one defect on one host.** C1 9, C2 9, C3 9, C4 8.
The corner is one joined stroke (mitre, no gap, notch or blob) on every page and host checked. The ")" shape is kept. The stroke is 1.5 pt on paper and 2 px on screen, with no step. Digit clearance and quotient/dividend alignment are unchanged. There are no console errors.

- **F1. The div_remainders practice card at 1366 has a hairline break in the bar over the dividend.** The svg bar (`H10`, butt end) stops at x = 580.53 CSS px, and the dividend's `border-top:2px` starts at the same fractional x. Anti-aliasing leaves a light 1-device-pixel line. Its brightest pixel is 51 at DSF 1, 103 at DSF 2 and 155 at DSF 3. The break is the same on master; it is a gap in the check, not a regression.
  - Location: js/modules/screen-cell.js `ringCellHTML`, the `mq-rembrk` branch, about lines 3191 and 3199–3200.
  - Fix: one bar span across columns 2 and 3 that overlaps the svg bar, as paper `ops-counters.js` does, or extend the svg bar about 1 px into the dividend column.
  - The 820 card is clean. The worksheet and quiz were not checked; they share this code.
  - **Check:** LDIV-JOIN reads gap 0.00 here. It must also sample pixels at DSF 2 or 3 and count any pixel brighter than about 80 inside the bar as a break (LDIV-JOIN-RASTER).

`ws-ldiv-hug --join`, run with no skill list: OK, 610 arcs, worst gap and step 0.00 mm. With the 3 skills: OK, 354 arcs.
The critic's own HTML diff against master (22 pages and cards, bracket svgs removed): only bracket markup changed, so the builder's hash claim holds.
