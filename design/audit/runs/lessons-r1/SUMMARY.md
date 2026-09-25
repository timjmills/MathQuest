# Lessons r1 — independent critic grades (2026-09-25)

**Result: 4 of 48 pages pass** (3 lessons × 2 sizes × 8 pages: chart, lesson sheet, practice, mixed, each + key;
pass = C1–C4 all ≥ 8, no cap, `design/audit/RUBRIC.md`). No lesson passes at any size; only add-within-10
mixed + its key pass, at L and S. Tree `claude/sweet-newton-c8wrv1` @ 933773b; render
`node tests/scripts/ws-lesson-samples.cjs --out tests/audit-runs/critic-lessons` (seed 4242, L + S, greyscale
charts). Every final answer on every key is correct. Per-page scores and defects: `grades.jsonl`.

| Lesson | Size | chart | lesson | practice | practice key | mixed | mixed key |
|---|---|---|---|---|---|---|---|
| add-within-10 | L | 8 7 6 8 (H13) | 8 6 8 8 | 8 6 8 8 | same | PASS | PASS |
| add-within-10 | S | 7 7 5 8 (H13) | 8 6 8 8 | 8 6 8 8 | same | PASS | PASS |
| subtract-2-digit-regroup | L | 8 7 8 8 | 6 8 8 8 | 7 8 6 8 | 7 3 6 8 (H1) | 7 8 8 8 | 7 3 8 8 (H1) |
| subtract-2-digit-regroup | S | 6 7 7 8 | 5 8 5 7 (H9 H13) | 5 8 4 8 (H9 H13) | +H1 | 5 8 5 8 (H9 H13) | +H1 |
| round-nearest-10 | L | 7 7 7 8 | 8 6 8 8 | 8 8 7 7 | same | 8 5 6 8 | same |
| round-nearest-10 | S | 6 7 5 8 (H13) | 6 6 6 8 (H13) | 6 8 4 6 (H13) | same | 6 5 6 8 (H13) | same |

(C1 C2 C3 C4; a key row carries its pupil page's scores unless noted.)

## What works (keep it)
- INK-30 accent: purple only on step numerals / circles / icons, each with a second cue; prints dark grey,
  distinct from the trace grey, in greyscale.
- Step echo: step names + icons repeat verbatim on the Guided Steps panel and the practice strip.
- Keys: every final answer and vocabulary line correct.

## Defects by root cause
1. **Chart panels fixed-size, don't scale (H13)** — `sheet/roles/lesson.js` chart layout (`chartZoom`): add L panels
   1–2 35% empty; add S 41/37%; round S 30% band in every panel; at S the chart shrinks (round S example ≈ 5 mm,
   T/O labels ≈ 6 pt). Fix: chart at L type at every size, panels sized to content; use freed space for a second
   example.
2. **The chart's number line never reaches later pages** — round Guided cells show only "9|6 → ____"; steps 1 and 3
   have nowhere to happen. Fix: blank 10-tick line with two tens boxes in each Guided cell (fade on practice).
3. **Example and items don't match the steps** (`prereqs.js`, band-10 fact generator): add example 5 + 3 has the big
   number first while Guided/practice often put it second (no model); all three Guided items make 10; practice
   answers only 8–10, 8 of 12 exactly 10; round steps 1–2 share the eye icon, sub steps 3–4 share the minus icon
   (`prereqs.js` 88–89, 118–119); sub step 5 "Check: add back" is a caption with no room to do it; round step 2
   "the cut" undefined and pre-states step 3; round step 1 adds no grey mark.
4. **Keys leave regroup / carry boxes empty (H1)** — `sheet/cells/stack.js answerKey` 279–284 sets them to ''.
   AK-2 (fill) vs VA-13 (scratch space): owner ruling needed.
5. **Regroup box too small** — two-digit "12 / 17" in a ones box ≈ 5 × 5 mm at S (H9), ≈ 9 mm at L (cramped).
   Fix: two-digit-wide ones regroup box; no regroup scaffold below M in a lesson packet.
6. **Practice layout leaves blank areas** — `lesson.js` practice (1.3× cap, "stops above footer"), `roles/practice.js`:
   sub S 47% blank; sub L 50 mm band; round practice split into framed strips with gutters (breaks CL-1; ≈35% of S
   body); round L mixed 35% blank; S cells 67–80% empty across (H13 width). Fix: size rows to the page body or
   raise the count within 12.1, one frame, no gutters.
7. **Mixed practice adds an untaught skill** — `prereqs.js` 129 `mixWith: nearest_100` (4/10 at L, 8/18 at S); both
   sections headed "Number Sense". Mixed must use earlier skills only.
8. **Minor** — sub warm-up "Subtract." twice; sub vocabulary cubes ≈ 2.3 mm; sub S warm-up a–b twice the digit size of
   c–d; sub Guided answer box black in cell 1, grey in 2–3; round S circle choices wrap; add "Remember" doesn't name
   counting on; add S = L grid (15 at S not applied); practice tabs "Lesson 1", footers restart 1/1; mixed pages have
   no step strip; add Guided key drops the traced ring on cell 1; add S key count answers half size; hairline icons
   print mid-grey (draw ≥ 1 pt).

## Top fixes by pages recovered
1. Practice / mixed grids sized to the page, one frame, no gutters (6): ≈ 14 pages.
2. Chart panels sized to content, chart at L type (1): 6 pages.
3. Number line in Guided cells, varied add sums with a big-number-second example, mix only earlier skills (2, 3, 7): ≈ 16.
4. Regroup/carry boxes on keys + wider ones regroup box (4, 5): 12 sub pages.
