# Narrow critic — Mixed facts ÷ inside the grid and LDIV-FACT-ROOM (owner requests 2026-11-14)

Independent critic (Opus medium). Candidate 72f517c1a; parent master 84f8813a1. Evidence is in the session scratchpad crit-mix/ (session-local).

**Verdict: PASS.** C1 9, C2 9, C3 8, C4 9. No major findings.

- **Mixed facts quick print**, all 12 combinations (M and L × 6 / 8 / Auto columns × Mixed up and In sections), pupil page and key:
  - one grid per page, with ÷ inside it and no "Divide." section (the parent still has one);
  - Mixed up spreads ÷ through the rows (M-6: ÷ in 4 of 5 rows), and In sections keeps each sign together inside the grid;
  - ÷ is stacked like + − ×, the ones digits line up, and the size and face are the same as the other signs;
  - no overflow; tightest tab clearance about 1.5 mm.
- **Keys:** every answer hand-checked on three keys (54 facts on the div Mix L key). All correct.
- **÷ alone** stays ÷ only.
- **div_facts Mix at 9 columns:** only the bracket frames are lowered. Room above the bar is ≥ 8.7 mm at M and ≥ 11.8 mm at L. Not crowded.
- **div_facts in long (bracket) form:** byte-identical to the parent, which already had room. A single-sign spot check (add_facts M-6) is also byte-identical.

Gates:
- `ws-fact-mix`: OK (14 prints and 40 pages).
- `ws-print-lint`, Mix at 9 columns: L-TOPSTART at M is 42 (parent 42) and at L 36 (parent 42). Every one is the "write-above bracket below centre" kind already on master.

Minor findings, none caused by this change:
1. At M, bracket digits use the proportional face while stacked digits use the monospaced face; at L both are monospaced. The parent does the same.
2. On the L Auto long page, "12⟌120" sits about 2 mm from its cell's sides. Identical on the parent.
3. Mix rows holding only stacked or fraction items leave the lower 35–40 % of their cells empty, because they share the row height the brackets need. This is why C3 scores 8.
