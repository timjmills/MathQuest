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

## Fix round 2 (2026-11-05, Opus medium: rebuild after the independent check failed Clarity for pupils at 7)

Check: scratchpad `explorer-check-r2.md` (FAIL, D1 major). Each fix has a gate assertion in `ws-student-explorer.cjs`; the
new checks fail on 2e15d0e17 (25 failures, served with `MQ_ROOT` from a `git archive` copy) and pass now.

- **D1 (major)** one pupil name everywhere. `js/modules/pupil-names.js` gains `pupilNameMap()` (built once from every live
  skill, so the clash rule holds across the app) and `pupilNameOf(category, skill, label)`. The explorer, the selection
  chips (text, title, "Remove …"), the Quick Start cards in student mode (`qsPupilName`; a curated short name such as
  "Mult Facts" is kept), the pupil's Added/Removed toasts, "Your skill:", the Print list (`printStudentSelection` and the
  landing's Print pass `label`) and the Send landing's skill pills all read it. Cards saved earlier carry the raw label;
  the name is read from the skill id, so they change too. pupil-names.js is now a startup module (the home's cards need it
  on first paint; +1 module, 191 startup); the explorer and its css stay lazy. Gate PUPILNAME picks
  "Subtract Within 5 with Pictures (Visual)" in the explorer and reads the chip, its title, "Your skill:", the Quick Start
  card, a card saved with the raw label, and the Print list; QUICKSTART now wants the explorer's pupil name.
- **D2** `.qs-name-text` is max(13px, 0.8125rem), 3-line clamp (additive override in role-toggle.css). Gate QSTYPE.
- **D3** the grade's area row is one sideways-scrolling line at every width; on short wide screens
  (`min-width: 601px and max-height: 800px`) the search sits beside the title (CSS grid, head `display: contents`) and the
  bands are tighter; tablets (601-1024 px wide) lose the 900 px panel cap. List height: 1366x768 48 % -> >= 60 %, 820x1180
  45 % -> >= 60 %. Gate ROOM now covers 1366x768 and 820x1180 (one-line chip rows, area row, list >= 60 %, no sideways scroll).
- **D4** `pupilBase()` drops "(MAP)", "(Match)", "(Easy)" and writes "Like / Unlike Denom" as "like / unlike denominators".
  All 716 names stay distinct. WORDS also fails on map / match / easy / denom.
- **D5** the selection chip name has no 26ch cap; it uses the row's width with an ellipsis only when the row is too narrow,
  full name in `title`. Gate CHIPWIDTH (1366: "Subtract within 20 (No Regrouping)" is whole).
- **D6** the explorer files a skill under the area of its real topic (`TOPIC_MOVES` in student-explorer.js): a Counting-area
  skill whose id or label names a fraction goes to Fractions, in the Fractions group (the three Number Sense skills:
  fraction_number_line, whole_as_fraction, compose_whole). data.js, DOMAINS order, category ids and share codes are unchanged;
  cards carry `data-area`. Gate TOPIC (Counting By area and Counting inside every grade hold no fraction skill; the three sit
  under Fractions); FILTER and AREA read the card's own area.

Gates (one at a time, foreground): ws-student-explorer OK, ws-boot-smoke OK, ws-simple-print OK, ws-teacher-shell OK,
ws-screen-answer OK, ws-search-terms OK, ws-chromebook-perf --only load OK (191 startup modules; first 6.7-7.1 s, later
0.8-0.9 s), ws-stamp-assets then --check OK.

Screenshots (`design/status/student-explorer/`): new `pupil-names-{chips,quickstart,print}-{1366,390}.png`,
`explorer-grade3-{1366x768,820x1180,390x844}.png`, `explorer-fractions-area-1366x768.png`; re-shot `explorer-by-*`,
`home-bottom-row-*`, `explorer-search-more-*`. Removed as stale: `quickstart-full-names-1366.png` (teacher wording),
`explorer-grade3-area-{1366,390}.png` (replaced by `explorer-grade3-*`).

Speed reflection: the round-1 gate checked pupil wording only inside the explorer, so a name that changed after the pick
could not fail. Rule taken: a wording check follows the item through every surface it reaches (chip, card, print, landing),
and reads the expected value from the one source (the explorer's name), never a second copy of the cleaning rule.
