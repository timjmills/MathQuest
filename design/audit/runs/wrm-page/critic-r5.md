# WRM page lane: independent critic, round 5 (2026-10-16)

Tree: `claude/sweet-newton-c8wrv1-wip-wrm-page` at `5cec79f6`. That is fix round 5 (`7dbf165d`, escalated to Opus medium)
merged with the latest base. This was a read-only critique, and I changed no lane code. The real tagging files
`data/curriculum/links/{R,Y1,Y4,Y6,MAP}.json` now load as shipped, because `index.json` lists them.

I did the teacher tasks on White Rose lessons, Skills to be made and MAP (Practise by task, By representation, Start a MAP
test). I used 1366x768 and 1280x720 with a mouse, and 820x1180 and 390x844 with touch. One browser ran at a time.

**Data modes.**
- **As shipped.** No interception. This mode carries the real R, Y1, Y4, Y6 and MAP files.
- **Fallback.** I answered only `index.json` with `{"years":[],"map":false}` through request interception, so the page ran
  on its computed rules. I checked this mode at 1366.

**Not trusting the gate.** The lane's gate `tests/lib/wrm-jargon.cjs` reports 0 hits on 12,143 lines. I did not reuse its
pattern. I ran four checks of my own:
- I rendered, in Node with the page's own modules, every line a teacher reads:
  - 2,922 why, missing and partial lines across the 485 curated lessons;
  - all 377 Skills to be made entries (Kind, What pupils will do, Gap it fills, How it looks), plus the 275 entries of the
    fallback mode;
  - all 125 MAP task notes.
- In the browser, I swept all 522 R/Y1/Y4/Y6 lessons (29,834 rendered lines) with a wider pattern.
- I checked the Tick links on 29 of those lessons.
- I read about 150 lines by eye.

The rubric is `design/audit/RUBRIC.md` C1–C4, adapted to teacher screens as in r1–r4: C1 ease, C2 value, C3 layout, C4
fidelity (the teacher design system and the school's own words). "Score down when in doubt."

## Verdict: FAIL (round 5)

Round 5 fixed what r4 asked for:
- **B8.** The real files load, Pre-K CC3/1 shows "Covers part" without interception, and every gate passes.
- **M3.** The forms r4 named are gone: `band N`, `/ S6` chains, `and :`, and the bare `S13`.
- **M4.** No Gap line starts with ":", there are no repeated steps for the colon form, and the "Print: one B&W … cell"
  boilerplate is gone.
- **m8, m9 and N17–N23.** All fixed (one nit is left).

Layout, links and navigation are good at every viewport. All 29 checked Tick links decode to exactly the tagged skills and
options. Every option that differs is the skill's default (`normalizeOptions` equal in 29 of 29).

The lane still fails C4, and in places C2, on the text that the real files bring. The gate's pattern cannot see these forms:

- **M5 (White Rose, real files, C4 7).** About 32 of the 485 curated lessons still show build wording or broken text:
  - code names: "ftRules", "generated with itemIndex (the print path)", "by a hand tagFix", "its partWhole variant",
    "the forms option is lost on the print path";
  - the option word "band" without a number: "every band stops at 999,999" on 6 Grade 5 D1 lessons, "the smallest band
    is 5";
  - an orphaned "( " where a step id was removed: "( counts in 50s, which no live skill deals";
  - a mangled range: 'next "Steps: Area of a right-angled triangle" (a later lesson)-"Area of any triangle"'.
- **M6 (Skills to be made, C4 7).**
  - The clause filter splits sentences inside brackets, so "How it looks" on 7 drawing entries starts in the middle of a
    bracket ("Sum-and-difference brace; two levels) and the journey line …", "The halving tree) used by …"). This happens
    in both data modes.
  - The brief's own example, "(the lowest band of compare is 99)", is still on 19 entries.
  - Build words remain: "(mapClause)", "pickVariant forms option (variantKey)", "itemIndex", "ftRules", "partWhole",
    "Reuse checked:", "DesCartes 211-220", "leaves the legacy path", "MC", "B&W" and "the the".
  - The new option rewrite breaks text. "No skill teaches "Pre-K: Match the "Objects" settingPre-K: Match pictures and
    objects"." shows in fallback mode. "the forms 6 = 6 and 7 = 8 − 1" becomes 'the the "What the items ask" setting = 6
    and 7 = 8 − 1'. "parts: 3" becomes 'The "Parts" setting' and loses the 3.
- **M7 (MAP · Practise by task, real MAP.json, C2 7 / C4 7).** The clause filter drops a whole sentence because it holds the
  word "generator". "Meaning of the equal sign" then reads only "today it deals column addition." under a red "To be
  built" chip (`r5-08`). The teacher loses what is planned (true/false forms 6 = 6, 7 = 8 − 1, 5 + 2 = 2 + 5) and is left
  with a sentence whose "it" has no subject. Six notes start with an entry id in lower case ("ordinal numbers adds …",
  "number line scales adds …", "polygons adds …").

## Scores

| Screen | Viewport | C1 Ease | C2 Value | C3 Layout | C4 Fidelity | Pass |
|---|---|---|---|---|---|---|
| White Rose lessons (fallback) | 1366 | 9 | 8 | 8 | 8 | yes |
| White Rose lessons (as shipped, real R/Y1/Y4/Y6) | 1366, 1280 | 9 | 8 | 8 | **7** (M5) | no |
| White Rose lessons (as shipped) | 820 touch, 390 touch | 8 | 8 | 8 | **7** (M5) | no |
| Skills to be made (as shipped, 377) | 1366, 1280, 820, 390 | 8 | 8 | 8 | **7** (M6) | no |
| Skills to be made (fallback, 275) | 1366 | 8 | 8 | 8 | **7** (M6: fragments, option mangle) | no |
| MAP · Practise by task (real MAP.json) | all four | 8 | **7** (M7) | 8 | **7** (M7) | no |
| MAP · Practise by task (fallback) | 1366 | 8 | 8 | 8 | 8 | yes |
| MAP · By representation | all | 8 | 8 | 8 | 8 | yes |
| MAP · Start a MAP test (unchanged pupil path) | all | 8 | 8 | 8 | 8 | yes |
| Gates (as shipped) | — | | | | | yes, all OK |

## The r4 defects, verified

| r4 | Status | Evidence |
|---|---|---|
| **B8** real files hidden, gates fail | **Fixed** | `index.json` lists R, Y1, Y4, Y6 and MAP. Pre-K CC3/1 shows "Covers part" and "To be built: Number Focus Window" with no interception (`r5-01`). Skills to be made lists 377. `ws-wrm-page-unit` passes with and without `--curated`. `ws-teacher-wrm` passes as shipped, with `--curated` and with `--fallback`. The gate's repeated-grade check now uses a named group. |
| **M3** option names and shorthand steps | **Fixed for the r4 forms; new forms open (M5)** | "band 5 deals" now reads '"Numbers to 5" deals'. K E/14 reads "two shapes make one shape". Grade 3 D4/1 reads "(Kindergarten: counting to 50, and from 50 to 100)". K D2/6 reads '"Fact families - the eight facts" (a later lesson)'. No `band \d`, `S\d`, `R.B`/`Y\d.B` or "and :" is left in the 29,834 rendered lines. |
| **M4** ": …" gap lines, repeated steps, build spec | **Fixed for the r4 forms; new forms open (M6)** | 0 Gap lines start with ":". There are no repeats of the colon form. Five entries list two steps that share a title ("Pre-K: 1 more" in two blocks), and those are different lessons. The "Print: one B&W boxed Andika cell (….md) …" boilerplate is gone. |
| **m7** spec in "How it looks" and the kind line | **Mostly fixed** | The kind line now shows the live skill's label and the option in the dialog's words. "How it looks" on drawing entries falls back to a plain sentence. Seven entries still show a broken fragment (M6). |
| **m8** toast lingers on the next screen | **Fixed** | After Practice link, `tvGo('todo')` or `tvGo('home')` at 100 ms leaves `#tvToast` without `is-on`. Checked at all four viewports. |
| **m9** old MAP task links | **Fixed** | Fresh load of `#map/tasks/npv/all/e1` opens Practise by task with "That task is no longer listed. Pick a task from the list." (`r5-09`). An unknown id `zz9` shows the same note. In fallback mode, `e1` opens its task ("Comparing", Ready). |
| N17 MAP reopens on the test tab | **Fixed** | Start tab, then Home, then MAP reopens "Practise by task". A fresh load does too. |
| N18 mixed pools on Y6 | **Data note, still open** | 12 Grade 5 lessons list one row fewer than the file, because each tags a `mixed_*` pool (`mixed_angles_lines` ×6, `mixed_graphs` ×4, `mixed_shapes` ×2, `mixed_number_theory`, `mixed_number_sense`, `mixed_fraction_ops`). The page is right to drop them. The fix belongs to the Y6 tagging lane. |
| N19 kind line of a skill not yet made | **Fixed** | "Kind: New skill", with no id words. |
| N20 "Copied in from G2" | **Fixed** | The head uses `gradeWord` ("Copied in from Grade 2"). |
| N21 "M" grade | **Fixed** | Reads "Several grades". |
| N22 long why lines on the phone | **Fixed** | Two-line clamp. A tap opens the note (38 → 54 px at 390) and a second tap closes it (`r5-11-more-390-closed/open`). See nit N24. |
| N23 "Grade 2/Grade 3 reading a scale" | **Acceptable** | It now reads "Fractions on a number line — support block, week 27 (Grade 2/Grade 3 reading a scale): …". |

## Owner rulings

| Ruling | Status |
|---|---|
| MAP opens on "Practise by task" | **Yes.** A first visit, a fresh load and a return from the test tab all open "Practise by task", in both modes, at all four viewports. |
| Old start links open the test tab | **Yes.** `openMapTest('k2')` lands on "Start a MAP test". |
| "Skills to be made" not in the sidebar; linked from White Rose, MAP and Home | **Yes.** The sidebar is Home, Send a skill set, Print worksheets, Run practice, Skills library, White Rose lessons, Quizzes, MAP tests, Progress and Settings. The Home, White Rose and MAP links each open the list. A lesson's "To be built" chip opens its entry. |
| "Other" behind a filter | **Yes.** The Kind chip "Other (drawing, fix)" shows 25 of 377 (25 of 275 in fallback). |
| Grade 6+ / Grade not set last | **Yes.** Pre-K 33 · Kindergarten 41 · Grade 1 36 · Grade 2 38 · Grade 3 81 · Grade 4 49 · Grade 5 42 · **Grade 6 and above 17 · Grade not set 40**. The "6+" chip shows 47 (see m10). |

## Lesson → step and Tick links (real files, in the browser)

- **Sweep.** I opened all 522 lessons whose step is in R, Y1, Y4 or Y6, or that sit in Pre-K, K, 3 or 5: 487 curated and 35
  on rules. That gave 29,834 rendered lines, with no `[object`, `undefined` or `NaN`, and no console problem.
- **Lesson → step.** In 29 of 29 spot-checked lessons, the title is the step's title. The two that are not letter-for-letter
  are "Recognise notes (US: dollars & cents)" and an en dash shown as a hyphen.
- **Verdict chip.** It follows the file's `verdict` (Pre-K CC3/1 "Covers part", Grade 5 D1/1 "Covers part", Grade 3 D1/1
  "Fully taught").
- **Tick links.** On every 16th curated lesson (29 lessons, across Pre-K, K, Grade 3 and Grade 5), I chose Everything, then
  Practice link, then decoded the link. The skill count equals `linksFor` in all 29. Every option that differs is the
  skill's default, checked with `normalizeOptions`. Examples are `band 10` on ten_frame_build, `level [1]` on compare_groups,
  `range 20` on nl_sub, `notation ["across"]` on add_three and `ticks "some"` on decimal_nl_drag. No real option is lost.
- **Hidden rows.** 12 lessons each hide a `mixed_*` row (N18).

## Teacher tasks (all four viewports unless noted)

- **Grade and unit chips.** I clicked every one, Pre-K CC1/OA1/MD1/G1 through Grade 5 D1–D5/E. Each lists its lessons.
  "This week: Week 7" opens Grade 5 D1/22.
- **Lesson rows.**
  - Single tick, quick groups, Everything and Clear all work. The single-skill Practice gives 1 skill. The link goes away
    after Clear and after the last untick.
  - Everything gives 12 skills on Grade 3 D1/1 as shipped and 13 on Grade 2 D1/1 in fallback, and both decode exactly.
  - Copy copies, and the note says "· copied". The toast sits 12 px above the bar at every size and never covers a bar
    control.
- **Thumbnails.** 5 in view at 1366, 4 at 1280, 8 at 820 and 3 at 390. A thumbnail tick counts.
- **Print.** Print opens Print worksheets. Back returns to the lesson, and Forward reopens it. The bookmark `#wrm/2/D1/3`
  opens "Hundreds".
- **Search.** "week 5" and "w05" (own grade first, Enter opens it), "3.NF.A.1", "partition", "number bonds" and "pictogram"
  all work. "zzzz" gives the empty message.
- **Why "more".** At 390 the clamp opens and closes on a tap (N24).
- **Dark mode.** The title is #f4f0fb on #1a1828 (`r5-15-dark-1280`).
- **Skills to be made.**
  - Totals, the Kind, Source, Domain and Grade chips (including 6+ and Not set), search ("number line"), opening
    entries, Print list (59 items, no `[object`) and the step buttons to White Rose all work.
- **MAP.**
  - All 7 strands and their RIT chips, a task, Everything → link (8 skills as shipped, 7 in fallback), thumbnails,
    Print → Back (`#map/tasks/npv/all/m9`), By representation in every strand, and Start.
  - The old `#map/…/e1` link and an unknown id both work as described above.
- **Sideways scroll** is 0 on every screen. The only controls under 44 px are inside the thumbnail picture (the
  practice-card keypad drawn in the preview, which takes no input), as in r4.
- **Gates.** All gates (table below) pass.

## Gates (critic's own runs, one at a time, on `5cec79f6`)

| Gate | Result |
|---|---|
| ws-boot-smoke | OK |
| ws-wrm-page-unit | OK (12,143 lines, 0 jargon hits; 945 lessons, 897 mapped) |
| ws-wrm-page-unit --curated data/curriculum/links | OK (22,535 lines, 0 hits) |
| ws-wrm-sequence.py --check | OK |
| ws-code-snapshot | OK (608 codes, 35 categories, no move or delete) |
| ws-teacher-wrm (as shipped) | OK (rendered-text sweep of 487 curated lessons) |
| ws-teacher-wrm --curated data/curriculum/links | OK |
| ws-teacher-wrm --fallback | OK |
| ws-teacher-shell | OK |
| ws-chromebook-fit | OK |

The gates pass, but the pattern they share misses every form in M5–M7: camelCase names, "band" with no number, "( ", a
line that starts inside a bracket, `" setting` glued to the next word, "(option)" in a quoted name, "the the", "Reuse
checked", "legacy", "MC" and "B&W". A clean gate run here does not mean clean text.

## Major defects

**M5 · Real lesson notes still show code names, the word "band" and broken brackets (White Rose C4 7).**
- **Where:**
  - `js/modules/wrm-links.js:300–328` (`plainWhy`). The `ID_CHAIN` branch returns `''` when an id is followed by its own
    words, even inside "(". The bare-`S` rewrite at `:315` does not take a range. `OPT_QUOTED_RE` (built from all of
    `OPT_WORDS`, including `step`, `steps`, `key` and `words`) at `:329`.
  - The data lines are in Y4.json and Y6.json.
- **What** (real line → what the teacher reads; about 32 lessons):
  - **Code names (5 lessons).**
    - Grade 5 D2/11 reads "ftRules only has x or / first" (`r5-03`).
    - Grade 3 E/35 and E/36 read "on a printed page (generated with itemIndex) half the items are the other form" and "the
      forms option is lost on the print path".
    - Grade 3 D4/1 reads "(tagged there as a partial cover by a hand tagFix)".
    - Grade 5 E/6 reads "its partWhole variant writes a part-to-whole ratio".
  - **"band" without a number (about 10 lessons).**
    - Grade 5 D1/1, 2, 3 and 6, and D2/8, read "the band stops at 999,999" (`r5-02`).
    - Pre-K CC2/1 reads "(the smallest band is 5)", and Pre-K CC7/3–4 read "the band stops at 19 and starts at 11".
    - K D1/25 reads "its lowest band (100) deals 51-100".
  - **Orphaned bracket (5 lines, about 15 lessons with the copies).**
    - "(Y3.B1.S14 counts in 50s, which no live skill deals …" becomes "( counts in 50s, which …" (Grade 3 E/19). The
      teacher no longer knows which step counts in 50s.
    - "(Y4.B10.S2 Tenths as fractions, week W30)" becomes "( Tenths as fractions, week 30)".
  - **Mangled range (Grade 5 D4/8).** "next steps S4-S5: the same area by b x h / 2" becomes 'next "Steps: Area of a
    right-angled triangle" (a later lesson)-"Area of any triangle" (a later lesson): …'.
  - **"deals" / "dealt" (57 lessons).** The build team's verb for "the skill gives" ("Numbers to 5" deals 1-5, mostly
    1-3). It is readable, but it is not a teacher's word. Fixing it is optional and goes with step 3.
- **Fix:**
  1. In the `ID_CHAIN` "own words" branch, return `${g}: ` when the character before the match is "(". Then "(Y4.B10.S2
     Tenths as fractions" reads "(Grade 3: Tenths as fractions", and "(Y3.B1.S14 counts in 50s" reads "(Grade 2: counts
     in 50s" (better: `${g} "${title}"`).
  2. Let the bare-step rewrite take `S(\d+)(?:\s*[-–]\s*S(\d+))?` and return "the next lessons". Build `OPT_QUOTED_RE` only
     from the option ids of `ctx.key` (`optionsFor(c, sk)`), never from generic words such as `step`, `steps`, `key`,
     `words`, `model` or `form`.
  3. Add a small `CODE_WORDS` table after the option rewrite:
     - `ftRules` → "the function-machine rules"
     - `\s*\(generated with itemIndex\)` → ""
     - `by a hand tagFix` → "by hand"
     - `its partWhole variant` → "its part-whole form"
     - `the forms option` → 'the "What the items ask" setting'
     - `the print path` → "a printed page"
     - `\b(every|the|its) (lowest |smallest )?band\b` → 'the "Numbers to" setting'
     - `\bdeals?\b` → "gives" / "gives"
     - `\bdealt\b` → "given"
     Or, better for the data, send these 9 lines to the R/Y4/Y6 tagging lanes to reword (N18 goes to the same lane).
  4. Gate: add these to `wrm-jargon.cjs`:
     - `\b[a-z]+[A-Z][a-zA-Z]+\b` (camelCase);
     - `\bbands?\b(?!\s*\d)`, except after "RIT";
     - `\(\s`;
     - `\)-"`;
     - `\bthe the\b`.
     Put the real lines above into `samples`.
- **Check:** my sweep pattern (`scratchpad/c5/sweep.cjs`) finds 0 of `band`, camelCase, `( `, `)-"` over the 522 lessons.

**M6 · Skills to be made: broken "How it looks" fragments, "band" notes, build words and the new option rewrite (C4 7).**
- **Where:**
  - `js/modules/todo-text.js:44`, where `plainLine` splits on `(?<=[;.])\s+`. That splits inside brackets.
  - `js/modules/todo-text.js:61–76` (`todoLooks`).
  - `js/modules/wrm-links.js:255–275` (`OPT_NUM_RE`, `OPT_QUOTED_RE`, `optionPhrase`).
- **What:**
  - **Fragments, both modes (7 entries).** The splitter cuts inside a bracket, `DEV` drops the half with a template
    option, and the rest is shown with a capital letter:
    - Bar-Model Family reads "Sum-and-difference brace; two levels) and the journey line; offered as "Model: bar" on the
      operations hosts …" (`r5-05`).
    - Factor Diagrams reads "The halving tree) used by Prime vs Composite …" (`r5-13` at 390).
    - Part-Whole Options reads "A list of bonds in order) and link / levels …".
    - Sort Tables reads "A universal rectangle; blank labels; nested) and the Carroll diagram …".
    - Total Grids reads "The sum-to-1 grid) and pyramid …".
    - Double Scale reads "Fraction | decimal | percent; a ratio) with blanks …".
  - **"band" (19 entries).**
    - "comparing and ordering numbers … (the lowest band today is 99)".
    - "K.CC.C.7: two numerals between 1 and 10 (the lowest band of compare is 99)" (`r5-06`).
    - "Band options 10 and 20 on Compare Numbers", "the to-10/20 band", and "Numbers to 3 (band value on each skill)",
      which is an entry name.
  - **Build words.**
    - "(mapClause)" and "its mapClause" (2 entries, `r5-07`).
    - "as a pickVariant forms option (variantKey)" (Coordinates).
    - "generated with itemIndex (the print path)".
    - "ftRules" and "The partWhole variant plus a bar model support".
    - "Reuse checked:" (3) and "DesCartes 211-220" (1).
    - "MAP 211-220" (meaning RIT).
    - "leaves the legacy path" (5).
    - "MC" (4), "B&W" (9), "the the" (2) and "(WRM, new skill equal parts)".
    - '"Compare Numbers to 10 and 20 (option)"' and similar inside the MAP lines of 43 entries, where the entry's own name
      is "(new option on an existing skill)".
  - **The option rewrite breaks text (r5 regression).**
    - Fallback "Match the Same" reads 'No skill teaches "Pre-K: Match the "Objects" settingPre-K: Match pictures and
      objects".' (`r5-16`). `OPT_QUOTED_RE` takes `objects", "` as option `objects`.
    - The raw "the forms 6 = 6 and 7 = 8 − 1" becomes 'the the "What the items ask" setting = 6 and 7 = 8 − 1', on 2
      entries in each mode. The equations are lost.
    - "parts: 3" becomes 'Option: The "Parts" setting', so the teacher no longer sees "3 parts". `optionPhrase`
      returns a value-less phrase when `def` is not found and every value is one digit.
- **Fix:**
  1. Split clauses only at bracket depth 0, and drop a whole bracketed group when it holds a `DEV` word. Better, and as r4
     M4 step 3 asked: for `vis_*` entries always show the plain sentence ("A black-and-white line drawing of …"), plus
     one plain clause from the pair label. Keep the spec for the CSV.
  2. Rewrite the "band" phrases:
     - `/\(?the lowest band(?: today| of [\w ]+?)? is (\d+)\)?/` → `(the smallest "Numbers to" choice is $1)`;
     - `/\bband options ([\d ,and]+)/i` → `"Numbers to" choices $1`;
     - `/\bthe to-([\d/]+) band\b/` → `"Numbers to $1"`.
     Rename the proposal "Numbers to 3 (band value on each skill)" in its source to "Numbers to 3 on each skill".
  3. Add to `DEV`, so the clause or bracket is dropped:
     - `\bmapClause\b`, `\bpickVariant\b`, `\bvariantKey\b`, `\bitemIndex\b`, `\bftRules\b`;
     - `\bReuse checked\b`, `\bDesCartes\b`.
     Rewrite rather than drop:
     - `partWhole` → part-whole;
     - `legacy path` → "the old drawing";
     - `\bMC\b` → multiple choice;
     - `B&W` → black-and-white;
     - `\bMAP (\d{3}-\d{3})` → `MAP RIT $1`;
     - `\bWRM\b` → White Rose;
     - `the the` → the.
     Inside quotes, turn `(option)"` into `"` (the kind badge already says it is an option).
  4. In `OPT_QUOTED_RE`, the value may not contain `"` or `,`, and the id must be an option of `ctx.key`. `OPT_NUM_RE`
     must not fire when the value is followed by `\s*=` (an equation). In `optionPhrase`, always keep the value
     (`"Parts: 3"`).
  5. Gate: add these to `wrm-jargon.cjs`:
     - `^[^(]*\)` (a line that closes a bracket it never opened);
     - `" setting[A-Za-z]`;
     - `\(option\)"`;
     - camelCase;
     - `\bbands?\b(?!\s*\d)`;
     - `\blegacy\b`, `\bMC\b`, `B&W`, `Reuse checked`, `DesCartes`, `\bthe the\b`.
     Run it over both modes.
- **Check:**
  - Over `todoTexts` of all 377 and 275 entries, the extended pattern finds 0 hits.
  - No "How it looks" starts with a capital after a `)` it never opened.
  - "Bonds to 10 in Three Parts" shows "Parts: 3".

**M7 · MAP task notes: a dropped clause empties the note, and entry ids are left as subjects (MAP · Practise by task, C2 7, C4 7).**
- **Where:**
  - `js/modules/todo-text.js:49` (`mapNote`) and `:44` (the `DEV` clause filter).
  - `NAMES` (`setTodoNames`), which does not hold every MAP.json proposal id.
- **What:**
  - "Meaning of the equal sign (true/false equations)" reads only "today it deals column addition." in red under "To be
    built" (`r5-08`, `r5-14` at 390). The raw note is "equal_sign_repair routes equal_sign to its own generator and adds
    true/false forms 6 = 6, 7 = 8 − 1, 5 + 2 = 2 + 5; today it deals column addition." The word "generator" drops the
    first sentence, and with it everything the repair adds.
  - Six notes start with an id in words, in lower case: "ordinal numbers adds position words …", "number line scales adds
    reading …" (two tasks), "compare number sentences adds …", "bonds in order adds …", "parallelogram adds …" and
    "polygons adds …".
  - Others show "(mapClause)", "(with source=word)", "'problems' option", "'sort' form", "MAP clause", "(WRM option on
    decimal place value) with its build-list extension", or "today …" sentences without their subject. That is about 28
    of 125 notes.
- **Fix:**
  1. In `plainLine`, drop only the sub-clause that holds the `DEV` word (split at ", " / " and " inside the sentence, or
     rewrite "routes X to its own generator and " → ""). When the kept text is under 40 characters or starts with
     `today|it|this`, use the proposal's `todoTeaches` instead ("Adds true/false forms 6 = 6, 7 = 8 − 1 …").
  2. Resolve every snake_case id to its name through `proposalName` (MAP.json's proposals are already added with
     `addProposalNames`), before the `skillWords` fallback turns it into lower-case words.
  3. Gate: add `^(today|it|this)\b` for MAP notes, and run the M6 pattern over `mapNote` of all rows.
- **Check:** "Meaning of the equal sign" names the repair and the forms it adds. No MAP note starts with a lower-case id or
  with "today it".

## Minor defects

- **m10 · The "6+" filter count does not match the "Grade 6 and above" heading.**
  - Where: `teacher-todo.js` grade filter and `groupsOf`.
  - What: unfiltered, the heading is "Grade 6 and above 17". With the "6+" chip on, it reads "Showing 47 of 377" under the
    heading "Grade 6 and above 47" (`r5-10`). Fallback shows 15 against 34. The filter matches any entry whose grade range
    touches 6, and the grouping uses the lowest grade. A teacher reads two different totals for the same heading.
  - Fix: either filter by the group the entry is listed under, or head the filtered list "Entries that reach Grade 6 and
    above (47)".

## Nits

- N18 (Y6 tagging lane, still open): 12 Grade 5 lessons tag a `mixed_*` pool. The page hides it, so the row counts differ
  from the file.
- N24: the why-line "more" target is the note line itself. It is 38 px tall at 390, under 44, and its only cue is the
  trailing "…". A visible "more" / "less" word at the end of the clamp would help a first-time teacher.
- N25: "Reception" still appears in 6 places (Kind line of Number Focus Window, "not a Reception response"). Write "Pre-K".
- N26: five entries ("Numbers to 3", "One More, One Less with Objects", "Full, Empty, Holds More", "Shapes Around Us",
  "What Can This Shape Do?") list two different Pre-K steps that share a title ("Pre-K: 1 more" twice). Adding the unit
  ("Pre-K CC4: 1 more") would tell them apart.

## Fix list (to pass round 6)

1. **M6 step 1** (bracket-aware clause filter, or always the plain sentence for drawing entries) and **M7 step 1** (drop the
   sub-clause, not the sentence; fall back to `todoTeaches`). These are the two C2 and C4 breaks a teacher sees first.
2. **M5 and M6 "band" rewrites, and the `CODE_WORDS` / `DEV` additions.** Or hand the 9 lesson lines and the about 25
   proposal notes to the tagging lanes to reword. Either way, the screen must read clean.
3. **M6 step 4.** Make the option rewrite safe (quoted values, equations, keep the value).
4. **Widen `wrm-jargon.cjs`** with the forms listed in M5–M7, and put the real lines quoted here into its `samples`. That
   way the gate fails on this tree as it is now.
5. m10 if cheap. The nits are optional.

## Screenshots (this folder)

- `r5-01-curated-lesson-prek-1366.png`: B8 fixed. Pre-K CC3/1 shows "Covers part" from the real R.json, with no
  interception.
- `r5-02-band-residue-g5-1366.png`: M5. Grade 5 D1/1 reads "every band stops at 999,999".
- `r5-03-code-word-ftrules-1366.png`: M5. Grade 5 D2/11 reads "ftRules only has x or / first".
- `r5-04-orphan-paren-1366.png`: M5. Grade 3 E/19, where the "( counts in 50s" note is in the Do-first rows.
- `r5-05-todo-look-fragment-1366.png`: M6. The Bar-Model Family "How it looks" starts inside a bracket.
- `r5-06-todo-lowest-band-1366.png`: M6. "(the lowest band today is 99)".
- `r5-07-todo-mapclause-1366.png`: M6. "(mapClause)" in an entry's MAP line.
- `r5-08-map-equal-sign-note-1366.png`: M7. "today it deals column addition."
- `r5-09-old-e1-link-1366.png`: m9 fixed. The old `e1` link shows the note.
- `r5-10-todo-6plus-count-1366.png`: m10.
- `r5-11-more-390-closed.png` and `r5-11-more-390-open.png`: N22 fixed, the clamp and its tap.
- `r5-12-phone-lesson-390.png`: phone lesson rows, real Y1.
- `r5-13-todo-fragment-390.png`: M6 at 390 (Factor Diagrams, "The halving tree) used by …").
- `r5-14-map-note-390.png`: M7 at 390.
- `r5-15-dark-1280.png`: dark mode.
- `r5-16-fallback-option-mangle-1366.png`: M6, 'Match the "Objects" settingPre-K: …' (fallback mode).

The critic scratch folder is outside the repo (`scratchpad/c5/`). It holds:
- `probe.cjs`: the r4 probe with as-shipped and fallback modes and the r5 extras (old `e1` link, the todo links from
  White Rose and MAP, the 6+ / Not set chips, the more toggle, m8 and N20). Run it as
  `probe.cjs <W> <H> <shipped|fallback> [touch]`.
- `sweep.cjs`: the 522-lesson rendered sweep and 29 Tick-link checks.
- `norm.mjs`: the check that every option difference is a default.
- `lessons.mjs`, `map.mjs` and `../r5/dumptodo.mjs`: the Node renderings of every lesson line, MAP note and Skills to be
  made field.
- `words.py`, `ent.py`: the independent wording counts.
- `ev.cjs`: these screenshots.
