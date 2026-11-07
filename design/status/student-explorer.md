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

## Fix round 3 (2026-11-05, Opus medium, a fresh fixer: one defect survived two rounds, so the check came first)

Check: scratchpad `explorer-check-r3.md` (FAIL, Clarity 7: R1 moderate, R2 and R3 minor).

**Root cause of R1.** Two different skills showed the same name on a Quick Start card ("Add Fractions (like
denominators…" twice, "Two-Step Word Problems: Ad…" twice). Cards are ~109 px wide with a 3-line clamp. The round-1 and
round-2 QUICKSTART check compared the FULL text (`textContent`, always distinct), never the VISIBLE text, so it could not
fail; the round-2 rename ("Denom" -> "denominators") made one pair longer. Failure class L17 in
`design/audit/LESSONS_LEARNED.md`: a clamp or ellipsis can make distinct names look identical; compare the VISIBLE text.

1. **Check first (QSVISIBLE, ws-student-explorer).** The hard set goes onto Quick Start, 16 cards a grid: both Add
   Fractions like-denominator variants, both Two-Step "Then Multiply" / "Then Divide", the 10 longest pupil names, and every
   pupil-name pair sharing a >= 20-character prefix (246 skills). At 1366x768, 820x1180 and 390x844 it reads the characters
   each card SHOWS (a character counts when its Range rect's centre is inside the box that clips it and it is not cut at
   the right edge) and fails when two cards show the same text, a name is under 13 px, a line runs out of the card, or
   the name runs into the pupil's star. **Backtest:** 133 QSVISIBLE failures on 425f4fec6 (served with `MQ_ROOT` from a
   `git archive` copy; 136 with WORDS and SEARCHNAME), 0 now.
2. **R1 fix: a head and a tail, distinct by construction.** `pupilCardParts()` (pupil-names.js): names that share their
   first 16 characters form a family; each splits at the last clause break ("(", ", ", ": ", " – ") inside the start the
   whole family shares (or the first break after it while the head stays <= 24 characters; or, for a shared start >= 24
   characters with no break, the last word break). The head is that shared start (an open bracket is closed: "Add
   Fractions (like denominators)"), clamped at 3 lines; the tail ("with pictures", "numbers only", "Then Multiply",
   "within 1,000, numbers only", "No Regrouping") is a sub-line of its own (`.qs-name-tail`, 13 px, weight 600) that is
   never clamped. Every difference inside a family sits in the tail, so two cards can never show the same text. 235 of
   716 names split; the rest show whole or differ inside their first 16 characters. Pupil cards only (teacher cards keep
   the raw label); a curated short name ("Mult Facts") is not split. The pupil's star gets its own room (`.qs-star`,
   padding-bottom 18 px). Font: the home page's own font (Nunito, `base.css`) as on every other home card; the brief's
   "Andika as on the rest of the home page" does not match the page, where Andika is only the explorer's example line.
3. **R2: search by the pupil name.** `skill-finder.js` gives every entry its `pupil` name (from `pupilNameMap()`, already a
   startup module: no new request); `search-terms.js` adds the pupil name's words to the label tier ("numbers only",
   "with pictures", "like denominators", "brackets" …; "no X" goes to the code tier as for labels), and typing a pupil
   name whole is an exact-name hit (+100) like the label. Gate SEARCHNAME: all 716 pupil names find their own skill in
   the top 3, and "numbers only" / "with pictures" / "like denominators" find every skill whose pupil name carries them
   (was: 16 names missed, "numbers only" missed 14 of 42). ws-search-terms stays 239/239.
4. **R3: teacher shorthand.** `PUPIL_WORDS` in `pupilBase()`: "OoO Easy: Two Ops, No Parens" -> "Order of Operations: 2
   Steps, No Brackets"; "Level 1-7: …" -> "Order of Operations: 2 Steps / 3 Steps / 4 to 6 Steps / Simple Brackets /
   Many Steps with Brackets / Brackets inside Brackets / Exponents"; "OoO Medium / Hard" -> "… Brackets" / "… Brackets
   and Exponents"; "X - Easy / Medium / Hard" -> "X: Easy" (Function Tables, Factor T-Chart, Factor Links, Fraction of a
   Set); "Polygon on Coord Grid (Side Lengths/Perimeter)" -> "Shapes on a Coordinate Grid (side lengths and perimeter)";
   "Fraction Mult/Div Word (Problems)" -> "Fraction Word Problems: Multiply and Divide (with pictures / numbers only)";
   "Fractions /10 as /100" -> "Tenths as Hundredths". All 716 names stay distinct. WORDS now also fails on OoO, Parens,
   Ops, Coord, Mult/Div, "- Easy/Medium/Hard", "Level N:", "/10".

Startup: nothing added (pupil-names.js and skill-finder.js were already startup modules; 191 startup modules as before).

Gates (one at a time, foreground): ws-student-explorer OK, ws-boot-smoke OK, ws-simple-print OK, ws-teacher-shell OK,
ws-screen-answer OK, ws-search-terms OK (716 skills, 239/239), ws-code-snapshot OK (732 codes, nothing moved),
ws-chromebook-perf --only load OK (first 6770 / 6853 / 6716 ms, budget 7300), ws-stamp-assets then --check OK.

Screenshots (`design/status/student-explorer/`): new `qs-hardset-{1366x768,820x1180,390x844}.png` (the hard set's first
grid: both Add Fractions, both Two-Step, the 10 longest); re-shot `explorer-by-*`, `explorer-grade3-*`, `home-bottom-row-*`.

Speed reflection: the defect survived two rounds because each round fixed the wording and re-ran a check that read the
DOM's text, which no CSS clamp changes. Rule taken (L17): a check of what a pupil can read measures the rendered,
visible characters at the real widths, with a hard set chosen to break it (longest names, shared prefixes); and a fix
round that leaves a defect open starts by making the check fail on the failed commit.

## Fix round 4 (2026-11-05, lead, after critic r4 FAIL, clarity 7)

- **D1** "Subtract within 1,000,000 (No / With Regrouping)" read alike: `splitName()` gave up when the first clause break sat
  past a 24-character cap, and its other branch put the difference into the clamped head. Now the split is always at the last
  clause (else word) break inside the start the whole family shares, so every difference is in the unclamped tail.
  A per-name split was tried first and failed the new check on two-way families ("within N" x "numbers only").
- **D2** curated names: number line "(tap the mark)" / "(drag)"; "Fraction as Division (numbers only)" / "(a/b = a÷b, with
  pictures)"; Order of Operations Level 1-7 keep "Level N".
- **D4** the explorer example shows exponents as superscripts ("(4 + 5)²").
- **D5** "All Fractions, Decimals and Percents", "Compare Fractions (common denominator)", "Box Plot: Median, Interquartile Range, Range".
- **Checks:** QSVISIBLE also runs at 1024x768 and 360x740, and the first word where a name parts from its nearest neighbour
  (>= 16 shared characters) must be SHOWN whole; WORDS fails on names equal once a/an/the and punctuation go, and on FDP/LCD/IQR.
  Backtest: FAIL (7) on f6b8d19f4, OK on this head.
- Merged origin/master and restamped. Gates OK: ws-student-explorer, boot-smoke, search-terms, code-snapshot (732), teacher-shell,
  simple-print, screen-answer, chromebook-perf --only load (first 6.7-7.1 s), stamp --check.
