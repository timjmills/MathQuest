# WRM page lane: independent critic, round 6 (2026-10-17)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-page` at `b317b020`. That is builder round 7 (`07cea256`) merged with the latest
main, which brings the real tagging files R, Y1–Y6 and MAP, `site-lessons.json` and a refreshed `wrm-steps.json`. This
round grades builder rounds 6 and 7 together:
- **Round 6** is the whitelist: teacher lines are composed from structured data, and a free-text note is shown only when it
  passes `plain-words.js` whole.
- **Round 7** adds every school-site lesson and assessment to the White Rose screen, plus the detailed-lessons hook.

This was a read-only critique, and I changed no lane code.

I used 1366x768 and 1280x720 with a mouse, and 820x1180 and 390x844 with touch. One browser of mine ran at a time; another
lane shared the machine. The rubric is `design/audit/RUBRIC.md` C1–C4, adapted to teacher screens as in r1–r5: C1 ease,
C2 value, C3 layout, C4 fidelity (the teacher design system and the school's own words). "Score down when in doubt."

**Not trusting the gate.** The gates report 0 lines that are not plain over 30,910 lines (unit) and 276,334 lines
(browser). I did not reuse the allowlist. I ran these checks of my own:
- **Node dump.** I rendered every teacher line through the page's own modules: 9,997 White Rose lines as shipped and
  12,652 in fallback; 4,010 Skills to be made fields (436 entries) and 1,615 in fallback; and the 119 MAP task notes. I
  then classified them: composed or note shown whole, repeats inside one lesson, and relation against group.
- **Browser sweep.** I opened all 1,070 lessons by their own bookmark (951 curated, 85 rules, 34 assessments): 63,677
  rendered detail lines, checked against my r5 pattern widened with `live skill`, `None.`, `Reception`, `proposal`,
  `fallback` and others.
- **Tick links.** I checked them on 37 lessons, from Pre-K to Grade 5, including site lessons and Y2, Y3 and Y5 rows.
- **Reading by eye.** I read about 300 lines across every grade, all the Skills to be made field kinds and 30 MAP notes.

## Verdict: FAIL (round 6)

The whitelist did what r5 asked:
- **r5 M5, M6 and M7 are fixed.** No code name, "band", orphan bracket, mangled range, mid-bracket fragment or option
  mangle is left. The equal-sign MAP note now names its repair.
- **r5 m10, N24, N25 and N26 are fixed.**

Round 7's site lessons work well:
- The flags are plain.
- Bookmarks survive a reload.
- Search finds "assessment", "ccss build", "support lesson" and site titles.
- Untagged lessons say "Skills not tagged yet".
- The "School lessons" buttons on Skills to be made open the lesson.

Layout passes at all four sizes: there is no sideways scroll, no control under 44 px outside the thumbnail pictures, and
no console problem. Every gate passes.

The lane still fails, for three reasons. The **composed sentences**, the very thing the whitelist relies on, now state
wrong or repeated facts, and the gate cannot see either:
- **M8 (C2 7).** Some "Skills to do first" lines say the skill is taught **later**. Others attach this grade's
  support-block week to another grade.
- **M9 (C4 7).** The "still to be built" sentence is said up to three times on one lesson, in an ungrammatical form.

The third reason is round 7's placement:
- **M10 (C1 7, Kindergarten).** Round 7 files 21 site lessons, 20 of them Kindergarten support lessons, under the wrong unit, for example "3D
  shapes" and "Compare mass" under "D1 Counting & Cardinality".

## Scores

| Screen | Viewport | C1 Ease | C2 Value | C3 Layout | C4 Fidelity | Pass |
|---|---|---|---|---|---|---|
| White Rose lessons (as shipped, R–Y6) | 1366, 1280 | 8 | **7** (M8) | 8 | **7** (M9) | no |
| White Rose lessons (as shipped) | 820 touch, 390 touch | 8 | **7** (M8) | 8 | **7** (M9) | no |
| White Rose: school-site lessons and assessments (round 7) | all four | **7** (M10, Kindergarten) | 8 | 8 | 8 | no |
| White Rose lessons (fallback) | 1366 | 8 | 8 | 8 | 8 | yes |
| Skills to be made (as shipped, 436; fallback, 275) | all four | 8 | 8 (m12) | 8 | 8 | yes |
| MAP · Practise by task (real MAP.json) | all four | 8 | 8 | 8 | 8 | yes |
| MAP · By representation, Start a MAP test | all four | 8 | 8 | 8 | 8 | yes |
| Gates | — | | | | | yes, all OK |

## The r5 defects, verified

| r5 | Status | Evidence |
|---|---|---|
| **M5** code names, "band", "( ", mangled range in lesson notes | **Fixed** | Grade 5 D2/11 now reads 'Not yet: 1-step and 2-step function machines …' and 'The step before: "1-step function machines".' Grade 3 E/19 reads 'Taught before, in Grade 2: "Count in 50s".' Grade 5 D4/8 reads 'The next step: "Area of a right-angled triangle". Later in the same White Rose block: "Area of any triangle".' The 63,677-line browser sweep finds 0 of `band`, camelCase, `( `, `)-"`, `the the`, `S\d`, `W\d\d` or `R/Y.B`. |
| **M6** Skills to be made fragments, "band", build words, option mangle | **Fixed** | No "How it looks" starts inside a bracket. There is no `mapClause`, `pickVariant`, `itemIndex`, `legacy`, `MC`, `B&W`, `Reuse checked` or `DesCartes`. 'Match the "Objects" settingPre-K' is gone. The price is m12: 211 of 436 "How it looks" lines are now one generic sentence. |
| **M7** MAP notes emptied by the clause filter, ids as subjects | **Fixed** | "Meaning of the equal sign" reads '"True or False Equations" will add: the equal sign means "the same as"; deciding whether equations with + and − on either side are true or false.' "Ordinal positions" reads '"1st, 2nd, 3rd" will add: …'. No note starts with today, it or this. One note still starts "Polygons adds …" (capitalised; it reads fine). |
| m10 the "6+" count | **Fixed** | With the chip on, the heading reads "Reaching Grade 6 and above 47" and the count line reads "each under the first ticked grade it reaches". |
| N18 mixed pools | **Still open (tagging lanes)** | 15 lessons hide one row each. These are now Y5 as well as Y6: Grade 4 D1/7 and D5/18, and the site lesson "Angles are additive". |
| N24 the "more" cue | **Fixed** | A visible "more" / "less" button, 48x44 at 390 (`r6-12`). |
| N25 "Reception" | **Fixed** | 0 hits in every dump. |
| N26 two Pre-K steps that share a title | **Fixed** | Steps read "Pre-K CC4: 1 more". |

## Round 6: does the teacher still learn WHY each skill is linked? (C2)

Of the curated lines, 3,447 of 3,651 Do-first lines and 392 of 1,352 Go-with lines are composed from steps. The sentence
places the skill in the curriculum: 'Taught before, in Grade 1: "Use arrays" (support block, week 33).' That is the right
kind of "why" for a Do-first skill, and it reads naturally. The semantic notes survive only when they pass whole: 193
Do-first lines and 945 Go-with lines, such as "Subtracting across zeros (302 − 264): the double exchange that comes next."

The whitelist loses detail, but nothing a teacher needs to choose skills, with **two exceptions**:
- The composer contradicts the tagger (M8).
- The lesson-level "Not yet" collapses into a repeated build name (M9).

The other side effects are small:
- "live skill(s)" survives on 6 lines ("live skills stop at 1,000,000").
- "bare" is used for "without context".
- The hand list holds words that are not plain teacher English: `wire`, `tag`, `tags`, `files`, `modes`, `version`, `via`,
  `sub`, `xs` and `nth` (N28). Only "live", "modes" (10 lines, as MAP's "modes") and "version" show.

I found no odd capitals.

## Round 7: the builder's open questions

1. **Merged rows keep the workbook's week, while the site's week differs (20 rows, up to 7 weeks on Grade 4 D1).**
   - The head shows "Week 2, 3", and the next line says "The school site plans it for week 9." (`r6-07`). A teacher sees
     two calendars, and neither is named as the page's own.
   - The "week 9" search and "This week" do not find the row in week 9.
   - Keeping the workbook week is right, because the list must keep its order. Name both, and let week search use the
     site week as well (m13). This is acceptable, not a blocker.
2. **Kindergarten support lessons all under D1 "by the site's domain": no.**
   - The site's `domain` field is wrong for these. "Positional language" is K.G.A.1 but domain CC. "Explore 2D shapes" is
     K.G.A.2 but domain MD.
   - The lessons' own CCSS codes are right. Use them (M10).
3. **"All teaching skills" ticks nothing on a lesson with no teaching skills.** On "3D shapes" the click ticks 0, shows no
   toast and changes nothing. It should be disabled, with "No teaching skills on this lesson" as its title (m14).

## Owner rulings

| Ruling | Status |
|---|---|
| MAP opens on "Practise by task" | **Yes.** On a first visit, after a reload, and on returning from the test tab, at all four sizes. An old `#map/tasks/npv/all/e1` link shows "That task is no longer listed." |
| Old start links open the test tab | **Yes.** `openMapTest('k2')` lands on "Start a MAP test". |
| "Skills to be made" not in the sidebar; linked from White Rose, MAP and Home | **Yes.** The sidebar is Home, Send a skill set, Print worksheets, Run practice, Skills library, White Rose lessons, Quizzes, MAP tests, Progress and Settings. The Home, White Rose and MAP links open it. |
| "Other" behind a filter | **Yes.** "Other (drawing, fix)" shows 25 of 436. |
| Grade 6+ / Grade not set last | **Yes.** Pre-K 33 · Kindergarten 42 · Grade 1 49 · Grade 2 56 · Grade 3 82 · Grade 4 82 · Grade 5 37 · **Grade 6 and above 17 · Grade not set 38**. |

## Lesson → step and Tick links (browser, as shipped)

- **Sweep.** All 1,070 lessons open by bookmark, with no timeout. Every row count equals `linksFor`, except the 15 mixed
  pools (N18).
- **Tick links.** I checked 37 lessons:
  - Pre-K CC5/2, CC8/3 and G3/3;
  - K D1/1, D1/31, D2/29 and D5/9;
  - Grade 1 D1/6, D2/7, D3/12, D3/24, E/10 and E/40;
  - Grade 2 D1/24, D1/33, D3/7, D3/16, D3/19, D3/22, D3/37, E/3 and E/33;
  - Grade 3 D2/5, D3/17, D4/25 and E/17;
  - Grade 4 D1/8, D1/11, D2/20, D3/11, D4/5, D5/19 and the site lesson "Angles are additive";
  - Grade 5 D1/6, D2/9, D4/1 and D5/7.

  For each I chose Everything, then Practice link, then decoded the link. In 36 of the 37, the decoded skills equal the
  links exactly. "Angles are additive" lacks only its `mixed_angles_lines` pool (N18). Of the 29 option differences, 28
  are the skill's default (`normalizeOptions` equal), for example `band 10`, `span 10`, `denoms [2,3,5]`,
  `ftTask "outputs"` and `power [10,100,1000]`. The 29th is the same `wordform` set in another order.
- **Step titles.** I spot-checked 30 lessons, and each title is its step's title. The site lessons show their own site
  titles.
- **Site lessons.**
  - Bookmarks `#wrm/K/D1/3dshapes…` and `#wrm/4/D3/comparefractions` reopen the lesson after a reload, when the device
    opens in the last view. The site opens in Student view by default (owner ruling 2026-09-25), so on such a device a
    bookmark lands in Student view (N27, existing behaviour).
  - Tagged site lessons (Grade 4 "Compare fractions") show the verdict, "To be built" and the rows (`r6-08`).
  - Assessments show "No skills are linked to this assessment. Practise the lessons of this unit before it." and no Tick
    bar (`r6-09`).

## Teacher tasks (all four viewports unless noted)

- **Grade and unit chips, lesson rows.**
  - Single tick, the quick groups, Everything and Clear all work.
  - Copy works. The toast never covers a bar control: it sits 12 px above the bar at 1366, 1280 and 820, and the bar is
    clear at 390.
  - Thumbnails work.
- **Print.** Print → Back returns to `#wrm/4/D2/27` "Short division", and Forward reopens Print.
- **Why "more".** At 390 the visible "more" button (48x44) opens the note to 168 px, shows "less", and closes it again.
- **Search.**
  - "assessment" finds the domain exams (`r6-10`).
  - "Positional language" finds both K lessons.
  - "ccss build" and "support lesson" work.
  - "Line plots with fractions" finds the Grade 4 row.
  - "week 5" and "w05" work.
- **Dark mode.** The flag tag is #c9d7ff on #1f2c4f, on a #232033 card (`r6-13`).
- **Skills to be made.**
  - The totals, the Kind, Source and Grade chips (6+ and Not set) and search work.
  - The "School lessons" button 'Grade 1, "Doubling (up to 5+5)"' opens `#wrm/1/D2/doublingupto55` (`r6-11`).
  - The step buttons open White Rose. **Back does not return to the list** (m11).
- **MAP.** All strands, a task, Everything → link (7 skills), thumbnails, Print → Back, By representation, Start, and the
  old `e1` link all work.
- **Fallback mode (1366).** All flows pass, and the lines carry neither M8 nor M9.

## Gates (critic's own runs, one at a time, on `b317b020`)

| Gate | Result |
|---|---|
| ws-boot-smoke | OK |
| ws-teacher-wrm (as shipped) | OK (436 entries, 12,301 lines; 1,070 lessons, 276,334 lines, 0 not plain) |
| ws-teacher-wrm --curated data/curriculum/links | OK |
| ws-teacher-wrm --fallback | OK (275 entries; 296,442 lines) |
| ws-wrm-page-unit | OK (30,910 lines, 0 not plain; 1,070 lessons, 897 mapped) |
| ws-wrm-page-unit --curated data/curriculum/links | OK (44,661 lines) |
| ws-plain-words --check | OK (3,067 words) |
| ws-site-lessons --check | OK (143 lessons, 34 assessments, 424 steps with site fields) |
| ws-wrm-sequence.py --check | OK |
| ws-teacher-shell | OK |
| ws-chromebook-fit | OK on the second run. The first run died with "Target closed" while the other lane's browser was running. |
| ws-code-snapshot | OK (608 codes, 35 categories, no move or delete) |

The gates check that each word is plain. They do not check that a sentence is true or that it is said once. M8 and M9 are
plain words that state a wrong fact or say the same fact again.

## Major defects

**M8 · Composed relation sentences state the wrong order or the wrong grade (White Rose, C2 7).**
- **Where:** `js/modules/wrm-links.js`:
  - `relationOf` and `stepsSentence` (`:394–435`);
  - `composeWhy` (`:473`), which composes from `stepsInNote` for a hidden note.
- **(a) "Do first" skills that the line says come later (78 lines).**
  - The order is taken from White Rose step numbers. The school teaches those steps earlier, and the hidden note says
    so: "Y2.B4.S9 Find change (taught earlier, W12)".
  - Grade 1 E/4 "Recognise equal groups" lists 7 Do-first skills. Four of them read 'Later in the same White Rose block:
    "The 5 and 10 times-tables"' or '"Add equal groups"' (`r6-01`).
  - Grade 2 E/18 "Measure mass in grams" reads 'Later in the same White Rose block: "Compare mass" (week 18).'
    (`r6-01b`).
  - Grade 1 "Count money" has four rows that read "Later … (week 12)", "(week 8)", and so on.
  - By grade: Grade 1 28, Grade 2 31, K 7, Grade 3 5, Grade 4 5, Grade 5 2.
  - A teacher reads "do this first" next to "this is taught later".
- **(b) The support-block week is attached to another grade (1,539 Do-first lines carry "(support block, week N)").**
  - Grade 5 D4/8 reads 'Taught before, in Kindergarten: "Find a half of an object or a shape" (support block, week 23).'
    (`r6-02`).
  - Week 23 is **Grade 5's** support block. `WRM_SEQUENCE` Grade 5 `prior.W23` holds `Y1.B10.S2`, and Kindergarten has
    no W23 entry.
  - The sentence sends the teacher to Kindergarten week 23.
- **Fix:**
  1. In `stepsSentence`, when the step and the lesson are in the same grade, order them by the **school week** that grade
     teaches each step (`unitLessons` weeks, or `weeksInNote` of the note). Use White Rose step numbers only when the
     school sequence does not list the step.
  2. In the Do-first group, never lead with `Later…`, `Taught later…` or `The next step`. If the school week is earlier,
     write 'Taught earlier this year: "Find change" (week 12).' Otherwise write 'Also taught in Grade 1: "…" (week 12).'
  3. Say the support week as its own clause, naming the lesson's grade: 'Taught before, in Kindergarten: "Find a half of
     an object or a shape". Revisited in this grade's support block, week 23.'
  4. Gate (`ws-wrm-page-unit`): no prereq line starts with `Later|Taught later|The next step`. A "support block, week N"
     clause appears only after "this grade's", or when the named grade is the lesson's own and its `prior` holds the step
     in week N.
- **Check:** 0 Do-first lines in the dump start "Later" or "The next step". Grade 5 D4/8 names Grade 5's support block.

**M9 · "Still to be built" is said up to three times on one lesson, in a broken sentence (White Rose, C4 7).**
- **Where:** `composeMissing` (`wrm-links.js:501–507`), `composePartial` (`:495–499`), the verdict line in
  `teacher-wrm.js:347–350` and `toBeBuiltHTML`.
- **What:**
  - **Ungrammatical verdict (140 lines).** The verdict reads 'These skills cover part of the lesson. Not yet: the part
    "Widen Place Value to 7 Digits (millions)" will add.' One example: 'Not yet: the part "Say How Many Without Counting"
    and "Numbers to 3" will add.' (`r6-03`, `r6-04`).
  - **The same fact up to three times (114 lessons).** A "To be built: Widen Place Value to 7 Digits (millions)" chip
    follows the verdict. The row line then says it a third time: 'The rest of the lesson comes with "Widen Place Value to
    7 Digits (millions)", still to be built.'
  - **Identical rows (49 lessons).** These repeat the same row line on two or three rows. Grade 5 D1/1 has three rows of
    'The rest of the lesson comes with "Numbers to 10,000,000 (new option on an existing skill)", still to be built.'
  - **A long suffix inside sentences.** "(new option on an existing skill)" sits in the middle of these sentences.
- **Fix:**
  1. When the lesson's "Not yet" note is hidden, write the verdict as "These skills cover part of the lesson. The rest is
     still to be built (below)." and let the "To be built" chip name the entry.
  2. On a row whose note is hidden, show only the "Covers part" tag, with no sentence. The row line says nothing the
     verdict does not.
  3. Never put "(new option on an existing skill)" inside a sentence. Keep it on the chip or the Skills to be made card.
  4. Gate: the string `the part "` never appears, and no composed sentence appears twice in one lesson's rendered lines.
- **Check:** in the dump, 0 lessons repeat a line, and 0 lines contain `the part "`.

**M10 · Kindergarten support lessons are filed under the wrong unit (round 7, C1 7 for Kindergarten).**
- **Where:**
  - `placeUnit(g, domain, week)` (`wrm-links.js:101–108`), called with the site's `domain` field (`SITE_LESSONS[8]`).
  - That field comes from `data/curriculum/site-lessons.json`, where it is wrong for these lessons.
- **What:**
  - **21 of the 91 new site lessons sit in a unit that is not the domain of their first CCSS code**, 20 of them in
    Kindergarten (`r6-05`). Under "D1 Counting & Cardinality" sit:
    - "3D shapes (cube, cuboid, sphere, cone, cylinder)" (1.G.A.1);
    - "Compare mass (1)" and "(2)", and "Compare capacity (1)" and "(2)" (K.MD.A.2);
    - "Positional language" (K.G.A.1);
    - "Shapes with 4 sides" (K.G.B.6) and "Circles and triangles" (K.G.B.4);
    - "Spatial reasoning (1)" (K.G.B.5);
    - "Combining 2 groups", "Bonds to 10" and "Composition of 1, 2, 3" and "of 4 and 5" (K.OA).
  - "Explore 2D shapes" (K.G.A.2), "Sort objects by one attribute" (K.G.B.4) and the second "Positional language" sit
    under D4 Measurement & Data. "Spatial reasoning (2)" and "(3)" sit under D2. "Compare amounts" (K.CC.C.6) sits under
    D4.
  - Outside Kindergarten:
    - Grade 1 "Length and height" (1.MD) sits under D1 Base Ten.
    - Grade 2 "Find the total" sits under D3. Its two codes, 1.NBT.C.4 and 2.MD.C.8, disagree, so the grade's own code
      decides and D3 is right.
  - A teacher who opens K D5 Geometry for the shape and position support lessons finds 4 and misses 10. The two
    "Positional language" lessons sit in different units.
- **Fix:**
  1. In `placeUnit`, take the domain from the lesson's **own CCSS codes**: the first code of the lesson's grade, else the
     first code. Use the site's `domain` only when the lesson has no code.
  2. Report the 21 rows to the site-lessons extract, so `site-lessons.json` gets the right domain.
  3. Gate: every site lesson with a code sits in the unit of that code's domain. Allow a listed exception for codes from
     another grade.
- **Check:** K D5 lists all the shape and position support lessons, and K D4 lists the 4 mass and capacity lessons.

## Minor defects

- **m11 · Back from a lesson opened on Skills to be made does not return to the list.**
  - Steps: Home → Skills to be made, open "Doubles with Pictures", then click the "School lessons" button (or a White Rose
    step button).
  - Back sets the hash to "" but leaves White Rose on screen. A second Back leaves the app.
  - Skills to be made has no hash. Give it `#todo/<entry id>` so Back reopens the open entry.
- **m12 · "How it looks" is one generic sentence on 211 of 436 entries.**
  - The sentence is "A black-and-white boxed question, the same on paper and on screen." It appears on 187 options,
    23 new skills and 1 other.
  - In the same way, "Gap it fills" reads 'Grade N, "…": no skill teaches all of it yet.' on 338 lines.
  - Eight entries have a gap line that reads only "None." (`line_graph`, `polygons`, `mass_ops`, `hv_lines`,
    `length_ops`, `table_data`, `defining_attributes`, `conversion_table`).
  - Fix:
    - Hide "How it looks" when it is the generic sentence and the option has value labels. Show the option's dialog words
      instead ("Pictures: two equal rows, totals to 8 / 10" is already on the Kind line).
    - Drop a gap whose note is only "none".
- **m13 · Two weeks on 20 merged rows.**
  - Write "The workbook plans it for weeks 2 and 3; the school site plans it for week 9."
  - Let `searchLessons` match `siteInfo.week` for "week 9", so the week search finds the row in the site's week too.
- **m14 · "All teaching skills" is live on lessons with no teaching skills.**
  - The 85 untagged site lessons and the gap lessons are affected.
  - Disable the quick button when its group is empty (also "Do-first" and "Go-with"), with a title that says why.

## Nits

- N18 (tagging lanes, still open): 15 lessons hide a `mixed_*` pool row. They are now on Y5 (`mixed_improper_visual`,
  `mixed_nl_drag` …) as well as Y6.
- N27: a site bookmark on a device that opens in Student view lands in Student view. This is the owner's start-view
  ruling, and it is the same for numbered rows.
- N28: the hand list (`data/curriculum/plain-words-hand.txt`) holds build or short words: `wire`, `tag`, `tags`, `files`,
  `modes`, `version`, `via`, `sub`, `xs`, `nth`. "live skill(s)" shows on 6 lines (K D5/11, Grade 5 D1/8, three MAP
  notes). Add `live` to DENY, or write "today's skills".
- N29: 'Taught before, in Grade 3 and Grade 2: "Represent numbers to 1,000"': list the grades in order.
- N30: 'Taught before, in Grade 2: "…". Taught before, in Grade 3: "…".' repeats the lead. Join them: "Taught before, in
  Grade 2: "…"; in Grade 3: "…"."
- N31: some MAP notes give the entry's general teaching line and not the MAP clause it adds. "Angle as a turn" reads
  'Turns and Angles will add: an angle as an amount of turn; …', but the task asks for degrees as a fraction of 360.
  "Compare two lengths" reads only '"Compare Lengths" is still to be built.'
- N32: some "Not yet:" lines that end in ")" have no full stop ("… (tear-and-place, then calculate the third angle)").

## Fix list (to pass round 7)

1. **M8.** Order by school week in the Do-first group; never "Later" there; name the support block as this grade's. Add
   the two gate checks.
2. **M9.** Say "still to be built" once per lesson: a plain verdict, the chip names it, and hidden-note rows show only
   "Covers part". Add the two gate checks.
3. **M10.** Place site lessons by their own CCSS code. Add the gate check, and send the 21 rows to the site-lessons
   extract.
4. m11–m14 if cheap. The nits are optional. N18 goes to the tagging lanes.

## Screenshots (this folder)

- `r6-01-dofirst-later-1366.png`: M8a. Grade 1 E/4, where four Do-first rows read "Later in the same White Rose block".
- `r6-01b-dofirst-later-g2-1366.png`: M8a. Grade 2 E/18, 'Later … "Compare mass" (week 18)'.
- `r6-02-support-week-other-grade-1366.png`: M8b. Grade 5 D4/8, 'Taught before, in Kindergarten: … (support block, week
  23)'.
- `r6-03-repeat-still-to-build-1366.png`: M9. Grade 4 D2/2, which says "Widen Place Value…" in the verdict, the chip and
  the row.
- `r6-04-repeat-prek-the-part-will-add-1366.png`: M9. Pre-K, 'Not yet: the part "Say How Many Without Counting" and
  "Numbers to 3" will add.'
- `r6-05-k-support-lessons-in-d1-1366.png`: M10. "3D shapes", "Circles and triangles" and "Compare capacity" under D1
  Counting & Cardinality.
- `r6-06-site-untagged-1366.png`: an untagged site lesson, "Skills not tagged yet" (m14: the quick buttons tick nothing).
- `r6-07-two-weeks-1366.png`: m13. "Week 2, 3" in the head, and "The school site plans it for week 9."
- `r6-08-site-tagged-1366.png`: a tagged site lesson (Grade 4 "Compare fractions"): verdict, To be built, rows.
- `r6-09-assessment-1366.png`: an assessment, with no Tick bar.
- `r6-10-search-assessment-1366.png`: the search for "assessment".
- `r6-11-todo-school-lessons-1366.png`: the Skills to be made "School lessons" button.
- `r6-12-more-less-390.png`: N24 fixed. The "less" button after opening a note at 390.
- `r6-13-dark-site-lesson-1366.png`: dark mode, site lesson.
- `r6-14-site-rows-820.png`: Grade 4 D1 rows with "CCSS · BUILD" flags at 820 touch.
- `r6-15-site-lesson-390.png`: a site lesson at 390.
- `r6-16-map-default-1280.png`: MAP opens on "Practise by task".

The critic scratch folder is outside the repo (`scratchpad/c6/`). It holds:
- `dump.mjs`: the Node rendering of every lesson line, Skills to be made field and MAP note, in both modes.
- `units.mjs`: the M10 check.
- `weeks.mjs`: the m13 list.
- `sweep.cjs`: the 1,070-lesson browser sweep and the 37 Tick-link checks.
- `norm.mjs`: the check that each option difference is a default.
- `p6.cjs`: the round 6/7 feature probe, at four sizes.
- `probe.cjs`: the r5 regression probe, at four sizes plus fallback.
- `reload.cjs` and `back.cjs`: the bookmark and m11 checks.
- `ev.cjs`: these screenshots.
