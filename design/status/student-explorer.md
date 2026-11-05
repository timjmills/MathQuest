# Lane: student explorer (owner, 2026-11-05)

"On the student side I also want a skill explorer by grade or by domain — we used to have one similarly — so kids can
pick the skills as well to play/print/send/add to quick start."

Built: an "Explore skills" button under the pupil Quick Start cards opens `js/modules/student-explorer.js` (lazy: module and
`css/student-explorer.css` load on the first press). Tabs By grade (K, 1-6, Mix) and By area (DOMAINS chips → their
categories); cards (name, grade badge, area colour, a short example question generated at idle for on-screen cards only,
tick); search through skill-finder.js. Picks are the app's selection (UnifiedSkills), so the bottom row (Add to Quick Start ·
Play · Send · Print) acts on them; Done closes, refreshes Quick Start, scrolls the row into view and focuses Play.

Reused: DOMAINS, visibleSkills (tombstones out), getSkillGrade, GRADE_COLORS (data.js); UnifiedSkills (unified-skills.js);
findSkills (skill-finder.js); generateQuestionFor; makeLazy (globals.js). Same data the Skills Navigator and the
category dropdowns used.

Gate: `node tests/scripts/ws-student-explorer.cjs` (deploy session 1). Screenshots: `design/status/student-explorer/`.
Not yet graded by an independent critic.

## Fix round 1 (2026-11-05, Opus medium: rebuild after the independent check failed Does the job at 7)

Check: scratchpad `explorer-check.md` (FAIL, D1 blocking). Each fix has a gate assertion in `ws-student-explorer.cjs` that
fails on af1b04363 (19 failures there) and passes now:

- **D1 (blocking)** Quick Start card names are the full cleaned label (`qsCleanName` / `qsCardName` in quick-skills.js; the
  three `.substring(0, 12)` cuts are gone, and cards saved with an old cut name show the full label again); two cards with the
  same label add their category. CSS clamps a card to 2 lines with the full name in `title`; selection chips carry the full
  name, ellipsis in CSS, `title` and "Remove <name>". Gate QUICKSTART: 3 longest labels + both "Add within 20".
- **D3** search shows "Showing 60 of N. Type more words to narrow it." and a "Show N more" button (focus goes to the first
  new card). Gate CAP.
- **D4** chip rows are one sideways-scrolling line (the chosen chip is centred when out of view); the phone header is
  tighter. At 390x844 the list gets >= 60 % of the height (was 36 % By area). Gate ROOM.
- **D5** pupil names (`js/modules/pupil-names.js`, lazy): "(Visual)", "(No Visuals)", "(No Pictures)", "(B&W)", "MC" dropped;
  a resulting clash keeps "with pictures" / "numbers only"; the same label in two categories adds the category ("Count by 2s
  (Patterns)"). Caption 15.2 px; Counting has 🧮 (Numbers keeps 🔢); grades with >= 100 skills (2-5) get an area row
  inside the grade tab. Gates WORDS, FILTER.
- **D6** LAZY reads a request log started before a reload (resource timing could not fail); SEND opens the link in a fresh
  page ("Practice set: 3 skills", exactly the 3 keys); QUICKSTART covers Add to Quick Start.
- **D2** (sound-spelled misspellings in the shared skill-finder) is out of scope: noted for a later skill-finder lane.

Screenshots added: `quickstart-full-names-1366.png`, `explorer-search-more-{390,1366}.png`, `explorer-grade3-area-{390,1366}.png`;
the earlier six re-shot.
