# lf-engine row-cap critic r1: FAIL

| | |
|---|---|
| Head graded | 1b5c3b9c9 |
| Critic | independent, medium |
| Method | PNGs and code only; nothing rendered |
| Saved by | lf-engine (the critic could not write files) |

## Scores

C1–C4 are the four criteria of design/audit/RUBRIC.md. The bar is 8 on every criterion.

| Pupil page (after) | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Match 3 Indep M (31d41507+fix) | 9 | 8 | 9 | 9 |
| Match 3 Indep L (31d41507+fix) | 9 | 8 | **7** | 9 |
| Opener count_by_tables M | 9 | 8 | 8 | 9 |
| Opener count_by_tables L | 9 | 8 | 8 | 9 |
| Lesson Vocab add_facts M | 9 | 8 | 8 | 9 |
| Lesson Vocab add_facts L | 9 | 8 | 8 | 9 |
| Review vocab_grade_pictures M | 9 | 8 | 9 | 9 |
| Review vocab_grade_pictures L (master) | 9 | 8 | **7** | 9 |

**Keys:** the Match 3 L, Review L and Opener L keys match their pupil pages.

**The cap itself is correct:**
- every capped cell is its drawn height plus 2–3 mm;
- nothing is squashed or clipped;
- the in-cell bands are gone.

## Findings

### F1. Review L on master regresses

**What happens:** 3 rows now print with about 75 mm (32 %) of white at the foot, where 4 rows fit. This change causes it on master; it is not lf-placevalue's problem.

**Check:** ws-print-lint PAGEFILL with `--fill-roles` including review, run before and after on the capped templates.

### F2. Match 3 L shows the same white strip

**What happens:** about 74 mm of white at the foot; 3 rows print where 4 fit.

**Check:** the same PAGEFILL run at L.

### F3. Root cause of F1 and F2

**What happens:** the fill counts rows on the skill's floor/footprint height, but the cap stretches rows only to drawn + room. The two use different heights.

**Check:** a layout-unit assertion. For any capped template, `rows × rowCapMm` must not leave more than one row's height free. Otherwise the fill must count with the cap height.

### F4. Not one rule for every template

**What happens:** `ROW_ROOM_MM` is opt-in for three templates. An unlisted template returns Infinity, so it is uncapped.

**Fix:**
- invert the table: every template gets a default room, with explicit exceptions such as noStretch;
- make EB-STRETCH a FAIL, not a note, for Guided, Scripted Model, Error Analysis and Pre-skill check. They are 5–12 mm over.

A staged rollout is acceptable only if the lead explicitly re-scopes the ruling.

## Rulings

**The white foot is worse than the old bands:**
- it turns an in-cell 28 % band into a 32 % page strip, which is a PAGEFILL major, so it blocks the change;
- the engine owns the fix: the fill and the fill limit must count with the cap height;
- lf-placevalue only brings its L floor in line with the drawn 52.5 mm (EB-FOOT).
