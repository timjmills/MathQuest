# WRM page lane: independent critic, round 7 (2026-10-17)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-page` at `8e42a595`. That is builder round 8 (`59766365`) merged with the latest
main. Round 8 answers critic r6:
- M8: Do-first lines are ordered by the school week.
- M9: each line is said once.
- M10: site lessons are placed by their own CCSS code.
- It also fixes m11–m14 and N28–N32.

This was a read-only critique, and I changed no lane code.

I used 1366x768 and 1280x720 with a mouse, and 820x1180 and 390x844 with touch. Only one browser of mine ran at a time,
because another lane shared the machine. The rubric is `design/audit/RUBRIC.md` C1–C4, adapted to teacher screens as in
r1–r6:
- C1 ease;
- C2 value: the teacher still learns why each skill is there;
- C3 layout;
- C4 fidelity: the teacher design system, the school's own words, and nothing said twice.

"Score down when in doubt."

**Not trusting the gate.** Round 8 adds a TRUTH gate, and it reports "14,472 lesson lines, 0 untrue or repeated". I did not
reuse its code. I ran these checks of my own:
- **Independent truth check** (`truth.mjs`). I took each composed sentence on the 4,970 curated Do-first and Go-with lines.
  I split it into its clauses, mapped each quoted title back to its White Rose step, and checked every order word against
  the school weeks. Those weeks come straight from `WRM_SEQUENCE` rows, not from `schoolWeeksOf`. The checks covered:
  - "Taught earlier this year", "the same week", "later this year", "Also taught in", "Taught before, in", "The step
    before", "Earlier/Later in the same White Rose block", and "Taught earlier/later in";
  - every week number in a line;
  - every "Revisited in this grade's support block, week N", against that grade's `prior` column;
  - every grade named in a lead, against the lesson's own grade.
  I ran it as shipped and in fallback (6,044 lines).
- **Node dump** (the r6 `dump.mjs`). It covers 1,070 lessons, 445 Skills to be made entries (4,065 fields) and the 119 MAP
  notes. I read 42 lessons by eye, 6 from each grade Pre-K to Grade 5 (`sample.txt`), and about 60 Skills to be made
  entries.
- **Browser sweep** (`sweep7.cjs`). I opened all 1,070 lessons by bookmark and checked 63,042 rendered lines. The sweep
  ran the r6 pattern, plus a rendered-DOM check for exact and near-duplicate "why" lines and for "still to be built" said
  twice. It also did the Tick-link decode on 36 lessons.
- **Feature probe** (`p7.cjs`) at all four sizes, plus the r6 regression probes (`probe.cjs` at four sizes plus fallback,
  and `p6.cjs` at four sizes).

## Verdict: FAIL (round 7), on one cheap defect

Round 8 fixed everything r6 asked for:
- **M8 is fixed.** No Do-first line leads with Later, Taught later or The next step. Every "Taught earlier this year … (week
  N)" names a week before the lesson, at the step's school week. Every support week is this grade's and holds the named step
  (independent check: 0 failures). Grade 1 E/4 now reads 'Taught earlier this year: "The 5 and 10 times-tables" (week
  26).' (`r7-g1-e4-dofirst`).
- **M9 is fixed.** The verdict is "These skills cover part of the lesson. The rest is still to be built (below)." On
  Grade 4 D2/2, "still to be built" and "Widen Place Value" each appear once (`r7-g4-d2-2-verdict`). There is 0 `the part "`,
  0 entry name inside a sentence, and 0 exact repeat in any lesson. "Same reason as above" marks 463 rows on 260 lessons.
- **M10 is fixed.** K D5 lists all the shape and position support lessons, and K D4 lists the four mass and capacity
  lessons (`r7-k-d5-list`). By the first code, only the 3 listed cases differ, and each follows the grade-code rule.
- **m11–m14, N28–N32: fixed.**

Every gate passes, and layout passes at all four sizes. There is no sideways scroll, no control under 44 px, and no
console problem.

The lane still fails on **one major defect, on the Skills to be made screen**:
- **M11 (C4 7).** "How it looks" shows the build team's template names as the teacher's sentence: "Hop-line, bond.",
  "Mult-grid, count-row.", "Stack, area-model." and "Function-table + new: coord-grid, data-table.". It does so on 25 of
  445 entries.
- Five more entries describe a "drawing of" a placeholder name.
- Two "Kind" lines carry option keys.

The ruling-6 whitelist lets these through, because every word in them is on the plain-word list. Ruling 6 is meant to
stop exactly this kind of line. The fix is small (below).

There are also three minors on White Rose:
- **m15:** 82 lessons say a "Taught before …" sentence twice, once with the support clause and once without.
- **m16:** 8 lines on lessons mapped to another year's step name the wrong grade in the lead. Two of them are untrue.
- **m17:** "no skill teaches all of it yet" repeats on long gap lists, and the support-block grades are out of order.

## Scores

| Screen | Viewport | C1 Ease | C2 Value | C3 Layout | C4 Fidelity | Pass |
|---|---|---|---|---|---|---|
| White Rose lessons (as shipped, Pre-K to Grade 5) | 1366, 1280 | 8 | 8 (m16) | 8 | 8 (m15) | yes |
| White Rose lessons (as shipped) | 820 touch, 390 touch | 8 | 8 | 8 | 8 | yes |
| White Rose: school-site lessons and assessments | all four | 8 | 8 | 8 | 8 | yes |
| White Rose lessons (fallback) | 1366 | 8 | 8 | 8 | 8 | yes |
| Skills to be made (as shipped, 445; fallback, 275) | all four | 8 | 8 (m17) | 8 | **7** (M11) | **no** |
| MAP · Practise by task (real MAP.json) | all four | 8 | 8 | 8 | 8 | yes |
| MAP · By representation, Start a MAP test | all four | 8 | 8 | 8 | 8 | yes |
| Gates | — | | | | | yes, all OK |

## The r6 defects, verified

| r6 | Status | Evidence |
|---|---|---|
| **M8a** Do-first lines that say "later" | **Fixed** | 0 Do-first lines start with `Later\|Taught later\|The next step`; I checked 4,970 lines by my own parse. The 25 Do-first lines for a step the grade teaches after the lesson read 'Also taught in Grade 1: "Choose notes and coins" (week 33).' They state where, never "later". K D2/24 reads 'Taught earlier this year: "Count backwards within 10" and "1 more and 1 less" (weeks 3, 7 and 8).'; the weeks match the data. |
| **M8b** support week on the wrong grade | **Fixed** | 582 support clauses all read "Revisited in this grade's support block, week N.", and the lesson grade's `prior[WN]` holds a named step in every case (0 failures). Grade 5 D4/8 names Grade 5's week 23. |
| **M9** "still to be built" said three times, `the part "` | **Fixed** | The verdict is "The rest is still to be built (below)."; the chip names the entry; a hidden-note row shows only "Covers part". In the browser sweep no lesson says "still to be built" twice, and none repeats a why line exactly. |
| **M10** Kindergarten support lessons in the wrong unit | **Fixed** | My r6 `units.mjs` finds 3 of 91 off by the first code: Grade 5 "Divide a 2-digit number by 100", Grade 2 "Find the total" and K "Represent numbers to 5". All three follow the grade-code rule and are listed in `site-lesson-placement.md`. |
| m11 Back from Skills to be made | **Fixed** | Home → Skills to be made → "Doubles with Pictures" sets `#todo/doubles_pictured`. From there, School lessons → Back returns to the open entry, and so does a step button → Back. A reload keeps the entry, and MAP → Back returns to it. Checked at all four sizes (`r7-todo-entry`, `r7-todo-back`). |
| m12 one generic "How it looks" | **Fixed in count, broken in kind (M11)** | Only 6 entries now share the generic sentence, and 60 options hide the line. But a "plain" representation note is shown whole, and 25 of those are template-name lists. |
| m13 two weeks | **Fixed** | Grade 4 D1/9: "Workbook weeks 2 and 3; the school site plans it for week 9." (`r7-g4-d1-9-two-weeks`). In Grade 4, "week 9" finds D1/9, D1/10 and D1/11. |
| m14 empty quick ticks | **Fixed** | On K "3D shapes", "All teaching skills" is disabled with the title "No teaching skills on this lesson" (`r7-k-3d-quick-disabled`). Do-first (5) and Go-with (2) stay live, because the rules give that lesson 7 skills, and Everything ticks 7. |
| N28 "live skill" and the hand list | **Mostly fixed** | Lessons show "skill in the app". One MAP note keeps 'live multi-step skills are +/− only'. |
| N29, N30, N31, N32 | **Fixed** | 'Taught before, in Grade 2: "Scaling"; in Grade 4: "…"' (Grade 5 E/7). MAP notes give the row's own clause. |
| N18 mixed pools | **Still open (tagging lanes)** | 16 lessons hide a `mixed_*` row; Grade 5 D4/24 lacks `mixed_angles_lines` and `mixed_shapes` in its link. |
| N27 bookmark in Student view | Owner ruling, unchanged | |

## Builder's open points, judged

1. **The support clause is said once, on the first row that names it, not on every row whose note named it: accept the
   placement, fix the side effect (m15).**
   - Saying the support week once is right: it is one fact about the lesson.
   - The side effect is the problem. The second row keeps the rest of its sentence, and that rest is now word for word the
     first row's sentence minus the clause. `onceEach` compares the full lines, so it does not mark the row "Same reason as
     above".
   - Grade 4 D2/3, for example, shows these three rows (`r7-near-repeat-g4-d2-3`):
     - 'Taught before, in Grade 3: "Round to the nearest 10". Revisited in this grade's support block, week 6.'
     - '… "Round to the nearest 100".'
     - 'Taught before, in Grade 3: "Round to the nearest 10".'
   - **82 lessons** have this, in the browser sweep and in the dump.
2. **"…: no skill teaches all of it yet." repeated across gap lines: a minor (m17).**
   - 343 of 1,281 gap lines end this way. One entry, `ruler_cm`, has 24 of them, and the first 6 show before "and 19
     more" (`r7-todo-ruler-gaps`).
   - The clause is true, but on a list it is noise. Say it once as the group's lead-in and list only the lesson names.
3. **"How it looks" from the table is sometimes broad: acceptable.**
   - "Shows shapes in black and white; the pupil ticks a box." is broad but true, and it gives the teacher the picture and
     the response.
   - The real problem is the other branch, the representation note shown whole (M11).

## C2: does the teacher still learn why each skill is there?

Yes, and better than in r6. A Do-first line now places the skill in the school's own year, for example 'Taught earlier
this year: "Use arrays" (week 10).' or 'Taught before, in Grade 1: "Unit fractions".'. A teacher can find the lesson from
the week. A Go-with line says "Taught the same week" or "Taught later this year … (week 22)". The 25 Do-first lines that
read "Also taught in Grade 3: … (week 9)" are honest: the step is taught next week. Most are Grade 4 D4 geometry, where
the school teaches "Parallel and perpendicular" after "Points, lines …". The whole notes that pass ("The two parts combined
into the whole.", "Customary conversions both ways …") keep the semantic "why".

The weak spots are small:
- Eight lines name the wrong grade (m16).
- One-word notes still pass whole: "Order.", "Inverse.", "Durations.".
- "(weeks 9, 10, 33 and 1 more)" reads oddly in Kindergarten, where "1 more" is a step title. The weeks list can also
  include the week of a fourth step that the line does not name, because titles stop at 3 and weeks do not (Grade 1
  E/33).

## Owner rulings

| Ruling | Status |
|---|---|
| MAP opens on "Practise by task" | **Yes** at all four sizes: on a first visit, after `openMapTest`, and on returning to MAP. The old `#map/tasks/…/e1` link shows "That task is no longer listed." (probe). |
| Old start links open the test tab | **Yes.** `openMapTest('k2')` lands on "Start a MAP test". |
| "Skills to be made" not in the sidebar; linked from White Rose, MAP and Home | **Yes.** The sidebar is Home, Send a skill set, Print worksheets, Run practice, Skills library, White Rose lessons, Quizzes, MAP tests, Progress and Settings. The Home card, the White Rose link and the MAP button (`data-map-act="todo"`) open it. |
| "Other" behind a filter | **Yes.** "Other (drawing, fix)" shows 25 of 445. |
| Grade 6+ / Grade not set last | **Yes.** Pre-K 33 · Kindergarten 42 · Grade 1 49 · Grade 2 56 · Grade 3 82 · Grade 4 82 · Grade 5 47 · Grade 6 and above 17 · Grade not set 37. |
| Ruling 6 whitelist | **Holds for White Rose and MAP. Leaks on Skills to be made (M11).** A word-by-word check passes a note that is a list of template ids. |

## Lesson → step and Tick links (browser, as shipped)

- **Sweep.** All 1,070 lessons open by bookmark: 975 curated, 61 rules and 34 assessments, with no timeout.
  - Every row count equals `linksFor`, except 16 mixed pools (N18).
  - The r6 pattern finds no jargon. The only hits are "()" and " , ", which my pattern leaves behind when it strips CCSS
    codes; they are not on screen.
- **Tick links.** I checked 36 lessons, from Pre-K to Grade 5, including site lessons and Grade 1/2 rows:
  - Pre-K CC5/1, CC8/1, G2/4 and G6/10;
  - K D1/26, D2/23 and E/19;
  - Grade 1 D1/27, D3/12, D3/14, D4/15 and E/28;
  - Grade 2 D1/11, D1/33, D2/5, D3/16, D3/19, D3/22, D4/2 and E/16;
  - Grade 3 D1/9, D2/16, D4/2, D5/4 and E/25;
  - Grade 4 D1/15, D2/26, D3/16, D4/9 and D5/22;
  - Grade 5 D1/8, D2/8, D3/19, D4/24 and E/18;
  - Grade 1 "Compare mass (2)".

  In each I chose Everything, then Practice link, then decoded the link. In 35 of the 36, the decoded skills equal the links.
  Grade 5 D4/24 lacks its two `mixed_*` pools (N18).
- **Option differences.** Of the 26, 24 are the skill's default after `normalizeOptions`. The other 2 are the same
  difference, on Grade 3 D1/9, where the link file says `count_by_tables {constant:[7]}`. That normalises to the full 1–12
  constant, and the link carries `rows:[{step:7}]` instead. The link teaches "count by 7s", which is what the file means;
  the file uses an old option shape (N33, tagging lane).
- **Step titles.** Every lesson in the 42-lesson reading shows its step's title. Site lessons show their own titles.

## Teacher tasks (all four viewports unless noted)

- **Lesson rows.**
  - Single tick, quick groups, Everything and Clear all work.
  - The disabled button has its title.
  - Copy, thumbnails and the "more" button work: 48x44 at 1366, 1280 and 820, and 44x44 at 390. It toggles "more" and
    "less".
  - "Same reason as above" is a plain tag, not a control, so there is nothing to click; that is right.
- **Print.**
  - Print → Back returns to `#wrm/4/D2/27`.
  - Forward then leaves the lesson on screen with an empty hash. It does not reopen Print. The r6 tree (`b317b020`) does
    the same, so this is not a round-8 regression. r6's "Forward reopens Print" was not reproduced (N34).
- **Search.** These all work: "week 9" (the site week), "week 5", "w05", "assessment", "ccss build", "support lesson",
  "Positional language" and "Line plots with fractions".
- **Dark mode.** The site lesson renders with the flag tag legible (`r7-dark-g4-d1-9`).
- **Skills to be made.**
  - The totals, the Kind, Source and Grade chips, the Other filter and search work.
  - The open entry survives Back and reload.
  - School lessons and step buttons open White Rose.
- **MAP.** All strands, a task, Everything → link (8 skills), Print → Back, By representation, Start, and the old link all
  work.
- **Fallback (1366).** All flows pass. My truth check finds 0 problems on 6,044 lines.

## Gates (critic's own runs, one at a time, on `8e42a595`)

| Gate | Result |
|---|---|
| ws-boot-smoke | OK |
| ws-teacher-wrm (as shipped) | OK (445 entries, 12,391 lines; 261 MAP tasks; 1,070 lessons, 272,433 lines, 0 not plain) |
| ws-teacher-wrm --curated data/curriculum/links | OK |
| ws-teacher-wrm --fallback | OK (275 entries; 289,340 lines) |
| ws-wrm-page-unit | OK (25,069 lines plain; truth gate 14,472 lines, 0 untrue or repeated; 76 site lessons placed by code) |
| ws-wrm-page-unit --curated data/curriculum/links | OK (38,237 lines) |
| ws-plain-words --check | OK (3,059 words) |
| ws-site-lessons --check | OK (143 lessons, 34 assessments, 424 steps with site fields) |
| ws-wrm-sequence.py --check | OK |
| ws-teacher-shell | OK |
| ws-chromebook-fit | OK |
| ws-code-snapshot | OK (608 codes, 35 categories, no move or delete) |

The truth gate catches the r6 failure classes. It misses three things:
- a line that is the same as another minus a clause (m15);
- a lead whose grade is not below or above the lesson's own grade (m16);
- a note that is plain word by word but is not a sentence (M11).

## Major defect

**M11 · "How it looks" (and two Kind lines) show build-team template names on Skills to be made (C4 7).**
- **Where:**
  - `todoLooks` in `js/modules/todo-text.js` (round 8, `:79–91`): `const whole = plainNote(e.representation); if (whole)
    return whole;`.
  - The Kind line composer, for option keys.
- **What:**
  - **25 entries show a list of sheet-kit template ids**, because each word is on the plain-word list. Ten examples:
    - `make_ten_subtract` "Hop-line, bond.";
    - `patterns_notice` "Mult-grid, count-row." (`r7-todo-looks-template-ids`);
    - `mult_4x1` "Stack, area-model.";
    - `two_variables` "Function-table + new: coord-grid, data-table.";
    - `write_numeric_expression`, `equiv_expressions`, `gcf_distributive` and `parts_of_expression`, all "Equation + new:
      expression.";
    - `multi_step_four_ops` "Word-work + new: bar-model.";
    - `elapsed_stories` "Timeline, word-work.".

    The others are single ids: "Equation.", "Counters.", "Number-line.", "Clock." and "Stack.". "+ new:" is the build
    list's syntax.
  - **Five drawing entries** (`vis_frac_area_modes`, `vis_frac_bar_modes`, `vis_frac_line_modes`, `vis_coin_options` and
    `vis_supports_wiring`) read 'A black-and-white line drawing of "Compare Fractions (>, <, =): a new option", the same on
    paper and on screen.'. The node composer's name is "A new picture in Fractions". Their gap reads "White Rose draws this
    picture and our pages do not yet." The teacher is never told what picture it is.
  - **Kind lines with option keys:**
    - `mult_4x1`: 'Option: size "4-digit × 1-digit" (tiles 41) on the column method …';
    - `map_share_among`: 'Option: mode "share among M" + response "drag"'.
  - Four looks lines use build words: "The existing count-by row …", "The skill's own row of ten rods …", "The existing
    fraction cells …" and "… no sign row, no column boxes, no label bank.".
- **Why major:** r6 M6 failed the same screen for build words. This is the same class, coming in through the gate's
  blind spot. A teacher who reads "Mult-grid, count-row." learns nothing about how the page looks.
- **Fix:**
  1. In `todoLooks`, show a representation note whole only when it reads as a sentence. Refuse a note that:
     - matches the template-list shape `^[A-Z][a-z-]+(?:, [a-z-]+)*(?: \+ new: [a-z-]+(?:, [a-z-]+)*)?\.$`;
     - contains `+ new:`; or
     - starts with "The existing" or "The skill's own".
     A refused note then goes through the DRAWS/ANSWERS table, where "equation" gives "a number sentence", "counters" gives
     "counters", "number-line" gives "a number line" and "clock" gives "a clock face". Map the remaining kit ids (stack →
     "a column sum", area-model → "an area model", bar-model → "a bar model", hop-line → "jumps on a number line", bond →
     "a part-whole bond", mult-grid → "a multiplication grid", count-row → "a counting row", coord-grid → "a grid",
     function-table / data-table → "a table", timeline → "a timeline", word-work → "a short story").
  2. For the `vis_*` entries, name the picture by what the entry adds (its WRM visual name or `teaches`), not by the
     entry's own label.
  3. Kind line: drop parenthesised option values that are not words ("(tiles 41)"), and write `mode … + response …` as
     "Pupils share among M by dragging."
  4. Gate (`ws-wrm-page-unit`): no "How it looks" or Kind line matches the template-list shape, `+ new:`, `\(tiles \d+\)`
     or `response "`.
- **Check:** in the dump, 0 looks lines match the pattern, and `patterns_notice` reads like "Shows a multiplication grid
  and a counting row in black and white …".

## Minor defects

- **m15 · The same "Taught before" sentence twice in 82 lessons (C4).**
  - Where: `onceEach` (`wrm-links.js:353`).
  - What: the support clause is stripped from the second row, and then rows are compared by their full line.
  - Examples:
    - Grade 4 D2/3: three rows, two of them "Taught before, in Grade 3: "Round to the nearest 10"".
    - Grade 5 D3/5: "Add and subtract fractions with the same denominator" twice.
    - K D1/30, Grade 1 E/4 and Grade 2 D2/10 have the same pattern.
    - Grade 1 D2/9 also has one line inside another: "Taught earlier this year: "Bonds to 10" (week 9)." and the same
      followed by '. Taught before, in Kindergarten: "Part-whole model".'.
  - Fix: compare rows by the line with the support clause stripped (`lineKey(x.why.replace(SUP_CLAUSE, ''))`). A row whose
    base line equals an earlier row's becomes "Same reason as above" and moves beside it. Extend the TRUTH gate's repeat
    check the same way.
- **m16 · Grade leads taken from the step's year, not the lesson's grade (8 lines; 2 untrue) (C2).**
  - Where: `relationOf` and `REL_LEAD` (`wrm-links.js:446`, `:517`). On a lesson mapped to another year's step, "earlier
    grade" and "later block" are measured against that step's year.
  - Untrue:
    - Grade 3 E/39 "Negative numbers", which is mapped to a Grade 5 step: Do-first 'Taught before, in Grade 4: "Compare and
      order negative numbers".' (`r7-g3-e39-grade4-before`).
    - Grade 3 D2/6: Go-with 'Taught later in Grade 2: "Add fractions".'.
  - Odd:
    - Grade 4 D5/23: 'Taught before, in Grade 4: "Multiply by 10, 100 and 1,000"', on a Grade 4 lesson.
    - Grade 4 D4/6 and D4/8: 'Also taught in Grade 4: "Polygons"' with no week, on a Grade 4 lesson whose sequence does
      not list the step.
    - Grade 5 D1/20: 'Taught earlier in Grade 4'.
  - Fix:
    - When the named grade is the lesson's own grade, use "Taught earlier this year" with the week, or "White Rose
      teaches it in Grade N" when the grade does not list it.
    - Never write "Taught before, in G" for a G at or above the lesson's grade, nor "Taught later in G" for a G below it.
      Name the grade and drop the order word instead ("Also in Grade 4: …").
    - Gate: a grade named after "Taught before, in" is below the lesson's grade.
- **m17 · Repetition and order in list lines (C2/C4).**
  - On Skills to be made, 343 gap lines end '…: no skill teaches all of it yet.'; `ruler_cm` has 24. Group them under one
    lead-in: "No skill teaches these lessons in full yet: "Measure in millimetres", "…" …".
  - On White Rose, 42 of 660 "Also in the support block" lines list grades out of order, for example "Kindergarten, … ;
    Grade 1, week 16; Grade 3, weeks 18 and 19; Grade 2; and 1 more grade.". Grades with no week come after those with
    one, and "and 1 more grade" hides a grade. Sort by grade, and name every grade (there are at most 7).

## Nits

- N18 (tagging lanes, still open): 16 lessons hide a `mixed_*` pool row.
- N27 (owner ruling): a site bookmark lands in Student view on a device that opens in Student view.
- N33 (tagging lane): Grade 3 D1/9 tags `count_by_tables {constant:[7]}`, an option shape that normalises to all tables.
  The link builder writes `rows:[{step:7}]`. Update the link file.
- N34: Print → Back → Forward leaves the lesson on screen with an empty hash. The r6 tree does the same.
- N35: rules-path lessons (K D5, Grade 3 untagged rows, 55 lines) read 'Taught before: Pre-K, "Compose shapes"', with no
  full stop and a different form from the composed 'Taught before, in Pre-K: "…".'. Use `stepsSentence` there too.
- N36: "(weeks 9, 10, 33 and 1 more)": "and 1 more" reads like the Kindergarten step "1 more". Also, the weeks can include
  a fourth step that the line does not name, because titles stop at 3 (Grade 1 E/33, K E/8). Cap the weeks to the named
  steps, and write "and one more week".
- N37: one MAP note keeps 'live multi-step skills are +/− only'. One teaches line has "incl.". One MAP note starts "Adds
  writing …" with no subject.
- N38: one-word notes pass whole ("Order.", "Inverse.", "Durations."). A two-word minimum, or the composed sentence, would
  serve the teacher better.

## Fix list (to pass round 8)

1. **M11.** Stop showing template-id notes as "How it looks". Map the kit ids to words, name the `vis_*` pictures, clean
   the two Kind lines, and add the gate check.
2. m15 and m16 are cheap and sit in the same function family. Fix them too, and extend the TRUTH gate.
3. m17 and the nits are optional. N18 and N33 go to the tagging lanes.

## Screenshots (this folder; 1366 and 390 of each)

- `r7-g1-e4-dofirst-*.png`: M8 fixed. Grade 1 E/4 Do-first by school week, with "Same reason as above" on the chart row.
- `r7-g4-d2-2-verdict-*.png`: M9 fixed. One verdict sentence, and the entry named once on the "To be built" chip.
- `r7-same-reason-k-d1-24-*.png`: the "Same reason as above" tag.
- `r7-k-d5-list-*.png`: M10 fixed. K D5 with the shape and position support lessons.
- `r7-k-3d-quick-disabled-*.png`: m14 fixed. "All teaching skills" disabled, with its title.
- `r7-g4-d1-9-two-weeks-*.png`: m13 fixed. "Workbook weeks 2 and 3; the school site plans it for week 9."
- `r7-todo-entry-*.png`, `r7-todo-back-*.png`: m11 fixed. The entry is open again after Back.
- `r7-todo-looks-template-ids-*.png`: **M11**. "How it looks: Mult-grid, count-row."
- `r7-todo-ruler-gaps-*.png`: m17. "no skill teaches all of it yet" on each gap line.
- `r7-near-repeat-g4-d2-3-*.png`: **m15**. Two rows read 'Taught before, in Grade 3: "Round to the nearest 10"'.
- `r7-g3-e39-grade4-before-*.png`: **m16**. A Grade 3 lesson: 'Taught before, in Grade 4'.
- `r7-dark-g4-d1-9-*.png`: dark mode, site lesson.

The critic scratch folder is outside the repo (`scratchpad/c7/`). It holds:
- `truth.mjs`: the independent truth check.
- `dump.mjs`: the r6 dump.
- `sample.txt`: the 42 lessons read by eye.
- `sweep7.cjs`: the 1,070-lesson sweep, with duplicate and near-duplicate checks and 36 Tick links.
- `norm.mjs`: the option-default check.
- `p7.cjs`: the round-8 features at four sizes.
- `probe.cjs` and `p6.cjs`: the r5 and r6 regression probes.
- `fwd.cjs`: the Print history check.
