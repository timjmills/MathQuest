# Narrow critic — divship D6 / D7 re-check (lf-ops, lead 2026-11-14)

Independent critic (Opus medium). Candidate 6ec6c8601; r2 graded tree a4d6d970e; mult reference master fdfddfdd2.
Evidence in the session scratchpad crit-d67/ (session-local).

**Verdict: PASS.** D6 and D7 are fixed at ≥ 8 on all four criteria, and the hash proof shows no unexplained difference.

| Page / host | r2 | now |
|---|---|---|
| Scripted Model L, array support, 10s band (tables 2–5), pupil and key | 7 8 6 8 | **8 8 8 8** |
| Scripted Model M, same options | 8 8 7 8 | 8 8 8 8 |
| Online worksheet 1366 / 1280 / 1024 | 9 9 8 9 | 9 9 8 9 |
| Online worksheet 820 | 7 9 7 9 | **8 9 8 9** |

**D6 fixed.** `ws-grade-render --roles scripted-model --size M,L --supports array --opts '{"band":100,"constant":[2,3,4,5]}' --gate` is OK. The trace jot ends about 25 px above the cell rule. The band under the grid fell from ~30 % to ~19 % at L (23 % at M). The fix also moves the L Scripted Model for skip, boxsign and the 12s-band array; the gate is OK on all of them.

**D7 fixed.** Measured with the critic's own script at 4 widths × default / array (10s band) / boxsign, with seeds 77 and 4242. There is one answer place and one cell height per sheet. Digits are 48–56 px and answer boxes ≥ 48 px. `ws-screen-support-eq --only ANSWER` is OK.

**Hash proof (the critic's own scripts; two candidate runs matched 224 of 224).** Candidate against r2:

| Skill | Print | Card | Quiz | Worksheet |
|---|---|---|---|---|
| add_facts | 238 / 0 diff | 56 / 0 | 28 / 0 | 28 / 0 |
| div_facts | 234 / 4 diff | 56 / 0 | 28 / 0 | 21 / 7 diff |

The 4 print differences are the Scripted Model at L (skip, 12s array, boxsign, 10s array), from the D6 fix. The 7 worksheet differences are the default at 4 widths, boxsign at 1024, and both array bands at 820, from the D7 fix. **None is unexplained.**
mult_facts against master fdfddfdd2: 68 print and 32 screen hashes, 100 of 100 identical.

**Nits (all already present in r2; none decides the verdict):**
- N1: "Say:" prints only on page 2 of the Scripted Model, so the page-1 model has no oral frame.
- N2: page 1 has ~20 % white under the grid.
- N3: worksheet cards have 45–70 px under the cell.
- N4: at 820 the boxsign sheet is a single column of 12 cards, a long scroll.
- N5: the 10s-band frame is mostly empty on small facts (one-frame-per-band ruling).

**Process note.** Screen hashes must measure inside the container, after the layout-done flag and font load. Read against the viewport, they changed from run to run.
