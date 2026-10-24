# Teacher site 2.0 T1 mock-up (board C): independent critic, round 1

**A 7 · B 8 · C 7 · D 8 — FAIL** (A and C are below 8)

Graded on 2026-10-23, branch `claude/sweet-newton-c8wrv1-wip-teacher-t1` at HEAD `01bb37f6`. Graded against IMPROVEMENT_PLAN §2.1–§2.11 and
§4.3 (Q-M1, Q-T1–Q-T6, Q-W1–Q-W4), with the owner's 2026-10-23 change to board C (the Awsaj look) judged under the §2.7 rules
and §2.8 thresholds.

## How I checked it

- Read every builder screenshot in `shots/` that the brief lists (Skills empty/tray/search, tray open, chip, the three
  worksheet kinds plus lesson and parts, Quiz, Build from, Quiz share, Share, Share More options, board, Lessons, lesson
  panel, Classes with all four tabs, profile) at 1366 and 390, light and dark.
- Took my own screenshots with Playwright and Chromium, served with `python3 -m http.server` from the repo root. Note that
  `npx serve` drops the query string when it redirects `app.html` → `/app`, so `?tray=` and `?theme=` URLs show an empty
  tray there. I used 1366, 1280, 1024, 820, 768 and 390 wide, light and dark.
- Wrote my own flow clicker (`scratchpad/flows.cjs`). It counts clicks and typed searches, and adds one action whenever the
  target is not on screen and unobstructed before the click. It also ran an overflow and clipping probe at every width
  (`scratchpad/widths.cjs`).
- Ran `node tests/scripts/ws-teacher-tokens.cjs`, which passed. I then checked its colour maths with my own script:
  sRGB → linear → Machado 2009 at severity 1.0 → XYZ (D65) → Lab → CIEDE2000, plus the WCAG ratio. It does not reuse
  the repo's `colour.py`.

## Independent colour numbers (board C, `tokens.css`)

| Check | Gate | Mine | Need |
|---|---|---|---|
| Bold vs bold, normal, every pair | 20.7 NBT–RPNS | 20.7 NBT–RPNS | ≥ 20 |
| Deuteranopia, pairs that share a grade | 12.8 DATA–G | 12.8 DATA–G (DATA–OA also 12.8) | ≥ 12 |
| Protanopia, pairs that share a grade | 13.7 CC–G | 13.7 CC–G | ≥ 12 |
| Any pair, deuteranopia / protanopia | 8.9 / 9.2 MEAS–RPNS | 8.9 / 9.2 | ≥ 8 |
| Slate vs every area (normal / deut / prot) | 22.8 / 9.0 / 15.0 | 22.8 DATA / 9.0 NF / 15.0 NF | ≥ 8 |
| Bold vs error red / key orange, all views | 21.9 RPNS (deut) | 21.9 RPNS (deut) | ≥ 20 |
| Deep on cream #FBF7EF | ≥ 7 | lowest is G #1A5E5D at 7.01 | ≥ 7 |
| Text on bold (the `--x-on` token) | ≥ 4.5 | lowest is G, ink on #278E8D at **4.57**; DATA, cream on #486E9C, at 4.93 | ≥ 4.5 |
| Dark light-version on dark tint | ≥ 7 | lowest is OA at 7.03 and NF at 7.04 | ≥ 7 |
| Muted text #6B6158 on page / surface-2 | — | 5.65 / 5.14; dark #A89D90 is 7.25 | ≥ 4.5 |

The gate's numbers are right and every threshold holds. The shared-grade sets (K CC MEAS DATA OA NBT G … 6 RPNS G DATA OA)
match §2.7 rule 2: no grade-5 list shows Ratio.

## Flows clicked (my count; ≤ 4 steps is met everywhere)

| Flow | 1366 | 390 | Plan |
|---|---|---|---|
| One skill + key (search → tick → Print → Print) | 4 | 4 | 4 |
| Mixed page of 3, one area list | 5 | 6 (one scroll) | 5–8 |
| Mixed page of 3, three areas by search | 8 | 10 | 5–8 (**over on phone**) |
| Code for one skill | 4 | 4 | 4 |
| Practice on the board | 3 | 4 | 3–4 |
| Quiz from a standard (2.NBT.B.5 needs a scroll) | 4 | 4 | 3–5 |
| Quiz online | 4 | 5 | 4–6 |
| Lesson practice, same grade (Next lesson) | 4 | 4 | 4 |
| Lesson practice, another grade and area | 6 | **7** (grade row scrolls sideways) | 6 |
| MAP task / saved set | 4 / 4 | 4 / 4 | 4 / 3–4 |

Each flow ended in the right state: the PDF toast, "Link copied", or the board view. Mixed practice was chosen for 2 or
more skills, and practice from a lesson started as Sections with the example the first time each kind appears.
Nothing a default could answer is asked.

## Scores

### A. Hierarchy: 7

What works at 1366 × 768: one solid ink primary per screen, above the fold (Print in the tray, the Print sheet's Print at
y≈570, Copy link, Print lesson, Done, Start on the board). The type scale is consistent and the cream page is calm. The
phone has a labelled four-item bottom bar, a "3 skills ▸" tray bar and no page-level sideways scroll at 390. On the phone,
sheets open full screen with a sticky summary and Print, and the preview is never first.

Points lost:
1. **The Lessons layout breaks below 1366.** At 1024 the lesson list column is crushed to about 110 px. Titles break word
   by word, "Represen" is cut and the NEXT tag overflows (`scratchpad/l1024.png`). At 820 the lesson panel overlaps the
   list and the page scrolls sideways (scrollWidth 864; `scratchpad/l820.png`). §2.9 makes "no sideways scroll at 1366 /
   1280 / 1024 / 820 / 390" a gate, but `shoot.cjs` only checks 1366 and 390.
2. **The lesson panel clips its buttons at every desktop width.** "Print lesson", "Share practice" and "Practise
   pre-skills (3)" run 16 px past the `.panel` edge at 1366, 1280, 1024 and 820 (`shots/lessons-1366-light.png`; the
   probe agrees). The right edge and radius of the primary are cut off.
3. **On the phone, Skills puts about 450 px of controls before the first skill.** The controls are the eyebrow, title,
   search, serif line, a two-row Browse by, a size switch and the grade row. With the 120 px of tray and bottom bars, only
   the top half of one row of cards shows (`shots/skills-tray-390-light.png`). The job on this screen is ticking skills.
4. **The Operations & algebra violet competes with the ink primary.** #5B1FAB is the one saturated colour in a muted
   board, and OA leads every grade 1–5 list. The first screen therefore opens on a violet band, violet card edges and three
   solid violet tray chips beside the black Print. That is the "everything is purple" effect §2.1 set out to remove.
5. **Tray chips are capped at `max-width: 200px`.** At 1366 they read "Addition Facts (wit…" and "Arrays & Equal Gro…"
   with half the tray empty (`shots/skills-search-1366-light.png`). The cut part is exactly what tells sibling skills
   apart ("within 10" vs "within 20").
6. **Phone and 820 px controls hide options in sideways strips.** The probe found these hidden: "My sets" in Browse by at
   820, Grades 3–6 and "Mixed levels" at 390, four of six maths areas on Lessons at 390, and on Classes › Progress at 390
   the selected tab itself plus the Practised and Correct columns (`shots/classes-progress-390-light.png`).

### B. Steps to each goal: 8

Every §2.6 flow is within its step count, and all but two are within the action count (table above). Defaults are
right: the kind is chosen for you and says why, and the example setting comes from the lesson.

Points lost:
1. **A quiz cannot be saved on a phone.** Below 820 px `.sheet-side .side-actions` is hidden, and the footer offers only
   Share and Print. The Save button and its note disappear (`shots/quiz-390-dark.png`).
2. **The phone goes over the table in two places.** A cross-area mixed page by search takes 10 actions against 5–8,
   because every search result needs a scroll under the 450 px header. Lesson practice for another grade takes 7 against
   6, because the grade row scrolls sideways. Both come from A3 and A6.

### C. Fidelity to §2 and the owner's decisions: 7

These are correct:
- the four places, with the profile menu (Settings, Switch to pupil view, Teacher help, theme);
- the tray is always visible, and when empty it greys Print and Share with "Tick skills first" while Quiz opens Build from;
- the three kinds each show only their own options, line for line with the §2.5 table (`app.js` `kindOptions`);
- the defaults, including Mixed practice for 2 or more skills and Sections plus examples for paper from a lesson;
- the summary line, the small black-and-white Andika preview and New numbers;
- Quiz offers Build from skills, CCSS, EE, White Rose or a lesson, points, a breakdown, versions 1–6, Save and Share with
  pupils;
- Share shows the code and link together, with Copy as primary, Show on the board, and the Quick Start link under More
  options;
- Lessons opens where the teacher was last, marks Next, has Print lesson as primary, Practise pre-skills, and Skills to
  be made collapsed on the lesson;
- Classes has its four tabs and says results are on this device;
- grade labels are plain, teacher words only (no Anchor, Strand tab, I Can/Daily or Lock Quick Start), and real skill
  names are used;
- the live-vs-branch table is in `files.html`; boards A and B are static images only;
- the Awsaj look is clearly achieved: cream #FBF7EF, warm ink, Archivo Black headings, a Fraunces italic line and
  uppercase mono labels.

Points lost:
1. **Thumbnails and previews do not show the skill they name.** "Subtraction Word Problems: Find the Start" shows "Ana
   has 10 shells. She finds 4 more. How many now?", a result-unknown addition. "Read Place-Value Disks" shows "4 + 4 =",
   "Unit Form" shows "9 + 5 =" and "Value of a Digit" shows "9 + 7 =". All eight Maths words cards share one picture
   (`shots/skills-tray-1366-light-full.png`). The same wrong drawings appear in the Print preview: the Mixed page's
   subtraction items read "She finds 9 more", and the lesson Sections page shows "Read Place-Value Disks: 8 + 4 =". A
   teacher chooses by the picture, and §2.3 promises skill thumbnails. Fix: draw each card from a seeded sample of that
   skill (or one example per template with that skill's payload), and drop the thumbnail rather than show a wrong one.
2. **The chip's options sheet is the same for every skill.** It always shows Numbers up to 10–1,000, Number line / Ten
   frame and Calculator (`app.js` `chipSheet`). It is not the skill's own option schema from `skill-options.js`, and it
   leaves out skip and preset values (§2.4: "range, supports, skip, calculator, preset values, its weight"). Fix: build
   the sheet from `SKILL_OPTIONS` in `make-data.mjs`, and show a preset skill's values as set.
3. **A saved quiz has nowhere to live.** Save toasts "Quiz saved in your quizzes", and the note says "Saved quizzes are in
   Classes › Quiz results". That tab only lists pupils' results, so no screen holds the teacher's quiz list (`saveTest`,
   §2.4). Fix: add a "My quizzes" list (Classes or Skills › My sets) with Print, Share and Edit, and point the note at it.
4. **Skills to be made is not on the maths-area summary.** §2.3 says it stays "on the lesson and the maths-area summary,
   collapsed". Only the lesson panel has it.
5. **A lesson's colour does not follow its own CCSS.** "Number line to 100" is tagged 2.MD.B.6 but is drawn and labelled
   Place value (gold) in the panel header (§2.7 rule 5). Fix: colour by `areaOf` of the lesson's code, or say the White
   Rose block wins and record that as a decision.
6. **Smaller fidelity slips:**
   - "1 skills match" and "1 SKILLS" (no singular);
   - during a search across all grades the grade chip still shows "✓ Grade 2";
   - exam-style parts show a fixed "4 problems" with no control, though §2.5 says "number of problems you choose";
   - the demo's grouped section is named "Taking away and more" but holds Time and Fractions;
   - the quiz preview is titled "Mixed practice";
   - opening a set replaces the tray without warning.

### D. Colour-blind safety and contrast: 8

The gate passes and its numbers are right, verified independently above. Chips are outlined with the deep colour in light
mode and #E8DFD2 in dark. Selected cards and filter chips use fill, ✓ and a 2 px ring. Slate always carries its dashed
outline and its label. Status uses red with ✕ or ink with ⚠. Dark mode is legible throughout, with dark light-versions
≥ 7.03 on their tints. Every card shows the area name, icon and grade pill.

Points lost:
1. **Tray and sheet chips do not show the area name.** It is only in a screen-reader span and a `title` tooltip
   (`chipHTML`, `<span class="sr">`). §2.8 says "every chip and card carries the area name and icon", and lists across
   grades need the grade pill too. The icon alone carries the area on the colour-blind pairs (DATA–OA and DATA–G at
   12.8 under deuteranopia). Fix: a visible short area word or grade pill on the chip, or at least on the chip-sheet
   header and the weights rows.
2. **The selected maths area on Lessons has fill and ring but no ✓** (`.area-row[aria-pressed=true]`), against the §2.7
   chip rule.
3. **The gate cannot see inline styles in `app.js`.** It reports "app.css clean", but `app.js` injects raw values:
   `height: 136px`, `width: 120px`, `transform: scale(2.4)`, percentage widths and `margin:0`. Fix: move them into
   classes or tokens, or let the gate scan `style="` in the JS.
4. **Two margins are thin.** Ink on Geometry bold #278E8D is 4.57 : 1 and cream on Data bold is 4.93. Both pass, but
   any shade change breaks them. Flag both in `palette.html`.

## Defects ranked by severity

1. **(A) Lessons breaks at 1024 and 820:** the list is crushed and the page scrolls sideways (864 px at 820). Add 1280,
   1024 and 820 to `shoot.cjs` checks, then drop the panel under the list or collapse the grade and area columns below
   about 1200 px.
2. **(A) The lesson panel clips Print lesson, Share practice and Practise pre-skills by 16 px** at every desktop width.
   Fix the panel padding or grid so its buttons fit its width.
3. **(C) Thumbnails and previews show the wrong problem for the named skill** (Find the Start drawn as an addition; place
   value skills drawn as facts; one picture for all Maths words).
4. **(B/C) A quiz has no Save on the phone,** and the saved-quiz list does not exist anywhere.
5. **(A) The phone Skills header is about 450 px before the first card.** Fold Browse by and size into one row or menu,
   and hide the serif line under 820 px.
6. **(C) The chip options sheet is generic,** not the skill's schema; skip and preset values are missing.
7. **(D) Chips carry no visible area name.**
8. **(A) The OA violet is saturated against the muted board** and dominates grades 1–5. Mute it towards the Awsaj family,
   then re-run the gate (OA–NF 20.9 normal and DATA–OA 12.8 under deuteranopia are near the lines).
9. **(A) Tray chips are capped at 200 px,** so names are truncated while space is free.
10. **(A) Sideways strips hide options** (My sets at 820; grades, areas and Classes columns at 390).
11. **(C) Skills to be made is missing from the maths-area summary;** the lesson colour does not follow its CCSS.
12. **(D) No ✓ on the selected Lessons area;** inline raw style values in `app.js` sit outside the gate.
13. **(C) Small slips:** "1 skills", the grade chip during a search across grades, fixed part counts, the demo section
    name, the quiz preview title, and opening a set silently replaces the tray.

## To reach PASS

Defects 1–6 must be fixed for A and C to reach 8; 7–8 are strongly advised. Re-run `shoot.cjs` with widths 1366, 1280,
1024, 820 and 390, and with a clipping check inside panels as well as at page level.
