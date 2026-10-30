# White Rose page (teacher Lessons screen): independent critic round 9, 2026-10-30 (work order 1c)

Critic: independent (Opus 5.5, medium effort). Read-only: no source edited, nothing committed.
Tree: `claude/sweet-newton-c8wrv1` at `fbeaa332` (live code).

Scope. The screen was merged without critic r9, and three builds landed after the last grade (r8 at `848d7d3f`):
- r10 (M12, m18-m20, and the site-order lesson sequence, `85b40359`);
- the per-lesson and per-domain "Skills to be made" cards (`lesson-tomake.js`);
- the grade → maths area → lesson-list navigation with the lesson on the side (`2dbafe1d`).

None of the three was critic-graded, so all of it is graded here, together with the "Skills to be made" screen.

Brief: the r1-r8 teacher-screen adaptation of `design/audit/RUBRIC.md`:
- C1 ease;
- C2 value: the teacher learns why each skill is there, and what they read is true;
- C3 layout;
- C4 fidelity: the teacher design system, the school's own words, nothing said twice.

8 or more on every criterion; one 7 fails.

## Verdict: FAIL. Lowest score 7 (C1, lesson bookmarks; C4, Skills to be made "How it looks")

M12 (the r8 fail) is fixed for truth. The gate reports 0 untrue lines and my own sample agrees. The navigation and the
lesson panel work at 1366, 1280 and 390, with no sideways scroll and no console errors. Two new defects fail the round:
- **W1.** Old lesson bookmarks open a different lesson, with no notice.
- **W2.** "How it looks" still shows free-text build notes in about 1 entry in 28. The owner ruled that teachers see composed
  sentences only.

## What was checked

| Check | How | Result |
|---|---|---|
| Unit gate | `node tests/scripts/ws-wrm-page-unit.mjs` | OK: 1,067 lessons, 894 mapped. M11 0, M12 0, truth 0 / 14,962, plain words 0 / 48,880, navigation 33 sections, 109 extra lessons, each lesson listed once |
| Screens | my own Playwright script (`scratchpad/crit1030-wrm/shots.cjs`), teacher role. Grade 3 list, Grade 3 OA lesson 16, Grade 4 NBT lesson 3, Grade 1 lesson 1, Grade 5 lesson, Grade 3 Extra lessons, Pre-K list, Skills to be made (list and one entry), MAP; each at 1366x768, 1280x720 and 390x844 touch | no horizontal scroll (21 / 21 measured), 0 controls under 44 px on the active screen, 0 console errors |
| "How it looks" (277 Skills to be made entries) | node: `todoLooks()` on every `buildQueue()` entry, beside `spec.answer` and `representation` (`looks.mjs`, `looks2.mjs`) | 0 untrue responses in a 30-entry read. **113 / 277 are the representation note shown verbatim**, 30 of them carrying "option:", and 10 that are build notes saying nothing about the look (W2). **48 `vis_*` entries share one generic line** (n2) |
| Bookmarks | `wrm-links.js` `lessonHash()` of r8's named lessons against the screen | **`#wrm/3/D1/16` was "Patterns on the multiplication table" at r8. It now opens "Divide by 10"** (W1) |
| Not re-run (shared browser lock, other lanes queued) | `ws-teacher-wrm` (as shipped, `--curated`, `--fallback`), `ws-teacher-shell`, `ws-chromebook-fit` | STATUS 2026-10-17 says these were NOT re-run after the navigation merge. **The fix round must run them** (W4) |

## Scores

| Screen | Viewport | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| Lessons: grade, area and list (new navigation) | 1366, 1280 | 8 | 8 | 8 | 8 | yes |
| Lessons: grade, area and list | 390 touch | 8 | 8 | 8 (n3) | 8 | yes |
| Lesson panel: head, teach / first / goes-with lists, tick, tray | 1366, 1280, 390 | 8 | 8 | 8 | 8 | yes |
| Per-lesson / per-area "Skills to be made" cards | 1366, 390 | 8 | 8 (n4) | 8 | 8 | yes |
| **Lesson bookmarks and shared lesson links** | all | **7** (W1) | 8 | – | – | **no** |
| **Skills to be made screen** | 1366, 390 | 8 | 8 | 8 | **7** (W2, W3) | **no** |
| MAP (spot check only, unchanged since r8 apart from the shell) | 1366, 390 | 8 | 8 | 8 | 8 | yes |
| Gates | – | unit gate OK; the browser gates are owed (W4) | | | | |

## Findings

**W1. MAJOR (C1 7) · lesson bookmarks change meaning silently · `js/modules/wrm-links.js` `lessonHash()` / hash resolver**
- **What.** r10 renumbered every lesson to the school site's order. The hash of a non-site lesson is still
  `#wrm/<grade>/<D#>/<list number>`. So a link saved before 2026-10-17 opens whatever lesson now holds that number. r8's evidence
  names `#wrm/3/D1/16` "Patterns on the multiplication table". At HEAD the same hash opens Grade 3 lesson 16 "Divide by 10"
  (`crit1030-wrm-g3-lesson-d1-16-1366-full.png`), and "Patterns …" is now `#wrm/3/D1/patternsonthemultiplicationtable`. STATUS says
  "lesson links are unchanged, so old links open". They do open, but they open a different lesson, and nothing tells the teacher.
  Hashes also come in two forms: a slug for site lessons, a number for the others.
- **Fix.**
  1. Give every lesson a stable slug hash. Write the number form only for back-compatibility.
  2. Freeze the pre-r10 number → lesson-key table (from `85b40359^`) as `data/curriculum/wrm-legacy-hashes.json`. Have the
     resolver redirect an old number hash to its key and show "This link was made before the lesson list was reordered; it now
     opens <title>".
- **Would have caught it.** None existed. **Proposed:** a pinned bookmark fixture in `ws-wrm-page-unit`. It stores
  {hash → lesson title} for every lesson at each deployed version, and fails when a pinned hash resolves to a different title.
  Class: LINK-DRIFT.

**W2. MAJOR (C4 7) · "How it looks" shows build notes, against owner ruling 4 / 6 ("composed sentences only; free-text build
notes stay in the CSV") · `js/modules/todo-text.js` `todoLooks()` (around line 217)**
- **What.** A representation note that names no response is shown whole: 113 / 277 entries. Ten of them are build notes that
  say nothing about the look:
  - `compare_numerator`: "A comparison-type option on compare/order." (`crit1030-wrm-todo-entry-1366.png`);
  - `frac_nl_equiv`: "A double number-line representation option.";
  - `km_m`: "Mixed-unit answer option.";
  - `time_convert`: "A time-only unit option.";
  - `regular_polygon`: "A polygon-type option on the perimeter skill.";
  - `multiples_2_5_10`: "A base option limited to 2, 5 and 10 …";
  - `money_convert`: "Option: cents to dollars and back.";
  - `shape_faces`: 'A "count" option: faces / edges / vertices / mixed.';
  - `round_whole` and `frac_find_whole`: "A … task option with a … support.".

  Twenty more end with build-note tails such as "option: order three" or "option: scale step".
- **Fix.**
  1. In `todoLooks()`, show a free-text note only when it describes a drawing. Reject a note that matches
     `/\boption\b|\bon the \w+ skill\b|\w\/\w(?!\d)|`/i`.
  2. Otherwise compose the line from `spec.answer`, the host skill's existing drawing (the kit template of its provider) and the
     option's label. For example: "The same compare-fractions cell, both fractions with the same numerator; the pupil writes <, > or =."
  3. Strip "; option: …" tails, or render them as "Can also: …".
- **Would have caught it.** `ws-wrm-page-unit`'s M12 gate checks truth only; the plain-words gate passes these lines.
  **Proposed:** add an M13 "looks says how it looks" assertion to `ws-wrm-page-unit`. It counts lines matching the regex above
  (must be 0) and lines identical across more than 5 entries (see n2). Class: BUILD-NOTE-SHOWN.

**W3. MINOR (C4) · the same planned work listed twice on Skills to be made**
- **What.** In Fractions, "Compare Fractions by Numerator (new option on an existing skill)" (3.NF.A.3d, Grade 5 "Compare and order
  (numerator)") and "Compare Fractions With the Same Numerator or Denominator (new option on an existing skill)" appear as two
  entries for one task. "Compare Fractions of the Same Whole" overlaps both.
- **Fix.** Merge the build-list entries in `js/modules/build-list.js` (keep one id, alias the other). Or, when two entries share a
  host skill and a CCSS code, show "Same work as <other>".
- **Would have caught it.** **Proposed:** a near-duplicate check in `ws-wrm-page-unit`. It flags entries with the same host +
  overlapping codes, or name token overlap ≥ 0.6, unless they are whitelisted.

**W4. MAJOR (process; blocks PASS) · the browser gates were not re-run after the navigation merge**
- **What.** STATUS 2026-10-17 lists `ws-teacher-wrm --curated`, `ws-teacher-shell`, `ws-teacher-library`, `ws-chromebook-fit` and
  `ws-boot-smoke` as NOT re-run after the last merge before the deploy. Today's shared browser lock (another lane's precritic)
  kept me from running the full set. My own screen probe found no layout or console fault.
- **Fix.** The fixer runs all five on the fixed tree, one at a time, and records the logs.
- **Would have caught it.** `ws-deploy-gates.sh` should refuse a deploy whose teacher-screen gates are older than the last
  change to `teacher-wrm.js` / `wrm-links.js` (gate-freshness stamp). Class: GATE-SKIPPED.

**n1 (nit).** At 390 the lesson head reads "Grade 3 · Operations & Algebraic Thinking · Week" and then wraps "35" onto a line of
its own (`crit1030-wrm-g3-lesson-d1-16-390.png`). Keep "Week 35" together (`white-space: nowrap` on the week span).

**n2 (minor, C2).** 48 `vis_*` entries all say "Black-and-white line drawings, the same on paper and on screen." The teacher cannot
tell one from another. Use the White Rose picture name the entry closes ("Draws a Gattegno chart …").

**n3 (nit).** The current maths area is named in the subtitle, but its chip is not marked until a lesson opens (Grade 3 list,
1366 and 390). Mark the chip of the section in view.

**n4 (nit).** The per-lesson card "Skills to be made for this lesson (N) — show" sits folded at the very bottom, under all three
lists. The owner asked for it to be "clearly" listed per lesson. The lesson head's "The rest is still to be built (below)" helps,
but put the card open, or its count, beside that sentence.

**n5 (nit).** Grade 4 NBT lesson 3: "Read Place-Value Disks · Covers part" is the only partial row with no "Not yet: …" clause.
Every partial should say what is missing, or say "Not yet: see the lesson's gap above".

## Fix list for the builder (one round, Opus medium: the page lane's level)

1. W1: stable slug hashes, plus the frozen legacy-number redirect with a notice, plus the pinned bookmark fixture.
2. W2: compose "How it looks", drop build-note text, and add the M13 gate (0 matches).
3. W3: merge the duplicate compare-fractions entries, and add the near-duplicate check.
4. W4: run ws-teacher-wrm (3 modes), ws-teacher-shell, ws-teacher-library, ws-chromebook-fit and ws-boot-smoke.
5. Nits n1-n5 if cheap.

## Evidence

Scratchpad `/tmp/claude-0/-home-user-MathQuest/5baf4bb0-98dd-5171-a72c-de2b791decbc/scratchpad/crit1030-wrm/`:
- `crit1030-wrm-*-{1366,1280,390}.png` and `*-full.png`;
- `shots.json`: scroll, small targets and console;
- `looks.mjs`, `looks2.mjs`, `hash.mjs`.

No redesign-passed entry: this is a teacher screen, not a skill.
