# Critic cbt r3 — multiplication:count_by_tables (lf-ops), FINAL round

Independent critic (Opus medium). Frozen tree 3038af154 (merged with master e9cb5797c). Renders are in the session scratchpad crit-cbt3/ (session-local).

**Verdict: FAIL, lowest 7** (C3, Pre-skill check at L, F1). Every other page and host scores ≥ 8.
E1–E9 and m2 from r2 are all fixed, and both r3 fixes are verified.
Gates run on this tree, all OK:
- grade-render --gate: all 13 roles at M (with screens) and L, plus the option variants;
- print-lint --source kit: every role at M / L, plus spaces=line: 0 findings;
- empty-band --page-fill: OK (it misses F1; see F1).

## Scores
Lesson (default / times / jumps=15 / onePage), Opener (default and spaces=line), Scripted Model, Independent / More practice / Test, Error analysis, Review, Mixed practice, Reason It and True or False?: 8 or more on every criterion at M and L. Guided: 8 apart from its routed bands.
Card at 1366 / 1280 / 1024 / 820, cbt worksheet and quiz at 1280 / 1024 / 820, and the number_patterns_rule worksheet at 1280 / 1024: 8·8·8·8.
**Pre-skill check: M 8·8·8·8; L 8·8·7·8, FAIL (F1).**
Every key matches its pupil page, and every answer is correct.

## Findings
- **F1 (major, H5 class).** The Pre-skill check at L leaves an 84 mm empty foot, about 35 % of the body. Each counting quadrant holds only 2 items (10 in all against 16 at M), and two of the quadrants could take another row (~34 mm each).
  The gates miss it because ws-empty-band EB-PAGE judges only a page BEFORE the role's last, so a one-page role is never measured, and PRE-QUADRANTS counts quadrants, not fill.
  **Check:** EB-LASTPAGE — judge the last page of a fixed-capacity role (pre-skill-check, true-false, reason-it, error-analysis, test) when ≥ 30 % of it is empty and its next row fits. Add CAP-PARITY: L capacity must not fall below ~0.7 × M unless the page is full.
- **m1 (minor).** The opener title reads "I Can count by 2s to 7s", but the page deals 2–5 at M and 2–4 at L; the key copies the title. Check: TITLE-RANGE, the title's range equals the min / max step printed.
- **m2 (minor, wording).** The True or False? instruction says "Finish the sentence.", but there is no sentence, only an "Answer:" line. Check: an instruction-library lint that a sentence verb needs a sentence frame.
- **m3 (minor, P-1).** The Scripted Model at L merges two steps into one state (3 states at L, 4 at M). Check: the state count is the same at M and L.

Notes, not scored:
- N1: the number_patterns_rule worksheet has a grid hole beside its spanning card, whose content fills ~50 % of the card (the FULLROW-USE limit).
- N2: Mixed practice at L has a 28 mm foot, a borderline row.
- N3: the online worksheet's arrows sit high.
- N4: the Scripted Model foot is about 14 %.
Out of scope: the routed bands and the Review L near-miss.

## Root cause
The same class came back (E2 → F1): the fix repaired the structure (the quadrant count), but nothing measured page fill at the other size. The fix belongs in the tool, ws-empty-band, not in this skill.
