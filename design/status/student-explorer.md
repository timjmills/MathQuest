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

## Hover thumbnails (owner, 2026-11-05: "on the students skills navigator page give a thumbnail of the skill when mousing over")

Built (Opus medium: the first build of a new screen element), `js/modules/student-explorer.js` + `css/student-explorer.css`
(additive):

- Hovering a card with a mouse or pen, or focusing it with the keyboard (`:focus-visible`), shows a thumbnail after 500 ms
  (150 ms when moving straight from one card to the next). It is the card's seeded sample item (seed 11, the same item as
  the card's short text example, cached per skill), drawn as the black-and-white paper cell the pupil sees: teacher-preview.js
  `mountQuestion` (the cell the teacher's hover preview draws: `.mq-scell.ws-cell`, the skill's visual, the screen verb
  swap, `monoCell`), scaled to fit a 340 px x 210 px frame, with the pupil name (pupil-names.js) as its caption. Question
  only: the answer slots are empty, and a drawing that already carries its own answer boxes gets no second answer line.
- teacher-preview.js is imported on the first hover only (nothing added to startup); a skill whose generator throws or
  takes > 50 ms shows its text example instead (today: 0 of 716).
- Placement: beside the card on the side with room (right, left, below, above), clamped inside the viewport, never over the
  pointer or the card (so never over its tick); `position: fixed`, `pointer-events: none`, so no sideways scroll and it
  never traps the mouse.
- Hides on mouse leave, any press, a scroll of the list (a keyboard thumbnail follows its focused card instead while the card
  is in view), Esc (the first Esc hides it and keeps the dialog; the next closes the dialog), blur, window resize / blur, and
  every re-render (`render()` and `close()` call `hideThumb()`). A token guards the async show, so a late show never sticks.
- Touch screens (`(pointer: coarse)` with no `(any-hover: hover)`) get no hover thumbnail; only a real mouse/pen pointer event
  opens one (headless Chrome reports `pointer: none`, which is not treated as touch). A tap still picks. The optional
  "Look" button was not added.
- Accessible: `role="tooltip"` (`#mqxThumb`), `aria-describedby` on the hovered / focused card while it shows, focus never
  moves.

Gate: THUMB checks in `tests/scripts/ws-student-explorer.cjs` (hover at 1366x768 and 820x1180 on a left and a right card:
shown within 1 s, a `.ws-cell`/`.mq-scell`, no filled box, no answer token the question does not carry, 260-360 px, inside
the viewport, off the pointer and the card's tick, no sideways scroll, aria-describedby, caption = pupil name; hides on mouse
leave, Esc (dialog stays, next Esc closes), scroll, re-render; keyboard Tab shows it without moving focus, Esc hides it, blur
hides it; 390x844 touch: a tap picks and no thumbnail appears; sweep of all 716 skills: 716 cells, 0 text fallbacks, no
throw, no console error, no answer shown). The checks fail on f08bd11b1 (no thumbnail) and pass now.

Gates (one at a time): ws-student-explorer OK · ws-boot-smoke OK · ws-simple-print OK · ws-teacher-shell OK ·
ws-screen-answer OK · ws-chromebook-perf --only load OK (first load 7174 / 7094 / 6972 ms, under 7.3 s; 191 startup modules,
unchanged: the thumbnail code is inside the lazy explorer module) · ws-stamp-assets + --check OK.

Screenshots (`design/status/student-explorer/`): `explorer-thumb-1366.png`, `explorer-thumb-820.png` (hover),
`explorer-thumb-none-390.png` (touch: tap picked, no thumbnail), `explorer-thumb-samples-1366.png` (12 thumbnails: clock,
fraction bars, number line, bar graph, area, rounding, coins, angle, pictograph, shape, array, compare fractions).

Not yet graded by an independent critic. Known limits: small text in dense legacy visuals (bar graph, angle) is scaled to
fit the 340 px frame; a few legacy items keep teacher-preview's extra answer line under a "= ?" written in text.

### Hover thumbnails — fix round 1 (2026-11-07, Opus medium: rebuild after critic r1 FAILED, job 7 / clarity 5 / layout 8 / eng 8)

Critic report: scratchpad `thumbs-check-r1.md`. Its D1-D6 are now gate checks (written first) in `ws-student-explorer.cjs`
via `tests/lib/ws-thumb-measure.cjs`, which measures the plate as a pupil sees it:

| Check | What it would have caught | On edd6b298b (backtest, served with MQ_ROOT) | Now |
|---|---|---|---|
| TEXTSIZE (question line >= 14 px, no text < 10 px) | D1 | 46 faults on the 13-skill hard set | 0 |
| SCALE (a drawn cell >= 0.6) | D1 | 22 | 0 |
| INFRAME (nothing painted outside the frame) | D2 | 6 | 0 |
| NODUP (the question once, normalised compare) | D3 | 1 | 0 |
| NOTEACHER (no CCSS code, no Hint / Check control) | D4 | 8 | 0 |
| NOEXTRA (no second answer line under an item's own blank) | D6 | 2 | 0 |

The hard set is hovered for real (1366x768, 820x1180), so the backtest runs on the old build: 86 failures there. The
legible sweep then draws every live skill at the L and the S plate (`studentExplorerThumbBatch`): 0 faults at either.

Fixes:
- **D1:**
  - The plate takes the largest size that sits cleanly beside, above or below the card, off the pointer: L 480 x 400, W 480 x 320, M 400 x 260 or S 340 x 210 (`sizeFor`).
  - **Deviation from the brief:** L is taller than the brief's "about 480 x 320". With that height, 613 of 716 skills draw legibly, against 561 at 480 x 320.
  - On a portrait tablet (820 x 1180) the L plate goes above or below the card.
  - The question line takes the practice card's 22 px.
  - A drawing that would still render its question under 14 px, any text under 10 px, or a scale under 0.6 is never shown. The plate shows the question itself in large print (26 px, 16 px at the least) instead.
  - Today that is 103 of 716 at L, mostly legacy graphs, coordinates and transformations, whose own labels are 7-8 px even at full size on the practice card. At S it is 391.
- **D2:** `fitStage` scales by everything the drawing paints, overhanging children included. It ignores the stage's own box.
  - teacher-preview `mountQuestion` takes `{ fit: false, onSettled }`, so its 0.9 s refit no longer overrides this. Every teacher caller passes no options and is unchanged.
  - The plate is refit and judged again once the drawing settles. A drawing that grew past legible then becomes the text plate.
- **D3:** the question line above a drawing is hidden when the drawing restates it, whether word for word, split over lines, or with at least 80 % of its words.
- **D4:** inside the thumbnail only, "CCSS:" lines and Hint / Check / Reset / Listen controls are hidden.
  - gen-data-stats.js is unchanged. Its `CCSS: ${q.ccss}` lines are still in `q.visual` for the practice card and the teacher views.
  - Taking them out at the generator is left for its own lane, because the same visual feeds the print path.
- **D5:** design-tokens `softFill` now returns `color-mix(in srgb, <colour> 18%, transparent)` for a non-hex colour.
  - Before, svg-geometry's `var(--mq-purple, #1e88e5)2E` was an invalid fill that painted black.
  - Screen now gets the intended 18 % wash; the mono cell shows it as the single grey.
  - Print draws these shapes without a fill, so it is unchanged: no filled shape in `formatProblemForPrint` output before or after.
- **D6 and D7:**
  - The play answer row (`.tvp-answerrow`) is left out of thumbnails.
  - A K counting row's answer square, which sits beside the counted squares, is hidden in the thumbnail.
- **Minor:** a pick (a click, or Space / Enter) hides the thumbnail (`toggle`).
- A text plate whose question ended on a colon, pointing at its picture, now ends with a full stop.

Gates (one at a time, after the fixes): ws-student-explorer OK · ws-boot-smoke OK · ws-simple-print OK · ws-teacher-shell OK ·
ws-screen-answer OK · ws-chromebook-perf --only load OK (7060 / 6960 / 6750 ms; 191 startup modules) · ws-stamp-assets +
--check OK.

Screenshots: `explorer-thumb-1366.png`, `explorer-thumb-820.png` (hover, L plate), `explorer-thumb-none-390.png` (touch);
`thumb-r1-worst20-before.png` / `-after.png` (the 20 worst skills of the critic's sweep, one per family, as edd6b298b drew
them and as they draw now); `thumb-r1-hardset-before.png` / `-after.png` (the critic's named skills).

Speed reflection (this round):
- Every finding was measurable, and none had a check. The r0 gate measured placement and answer leaks, never rendered type size or clipping.
- Rule for any future preview or thumbnail lane: a "drawn the way pupils see it" claim is gated on rendered px (font size x on-screen scale) and on painted bounds inside the frame. A class name present is not enough.
- `ws-thumb-measure.cjs` is reusable for the teacher previews, which share this drawing and these defects.

### Hover thumbnails — fix round 2 (2026-11-07, Opus medium: rebuild after critic r2 FAILED, job 7 / clarity 6)

Critic report: scratchpad `thumbs-check-r2.md`. R2-D1 was the fallback: 103 skills at L (391 at S) showed words only, and many
of those words pointed at a picture that wasn't there.

New checks, written first, in `tests/lib/ws-thumb-measure.cjs` and the THUMB legible block of `ws-student-explorer.cjs`:

| Check | What it holds |
|---|---|
| NOPICLESS | A skill whose question needs its drawing (its practice-card `q.visual`, or words that point at a picture) is never words-only at the L, W, B or M plates. Words-only text never contains a pointing phrase (`POINTING`). |
| PARITY | A text may render under 10 px only where the skill's own practice card (1366, `__mqxCardSizes`) shows it that small, and never smaller than there. The question line stays >= 14 px. |
| WORDSONLY | The words-only plates are counted at L and S, with ceilings L 4 and S 30: today's 2 and 22 (build widgets and long text-only items), plus room for a seeded item changing. |
| 1024 placement | At 1024x768 the middle grid column gets an L, W or B plate, never S. |

Sweep coverage:
- L and S are swept on all 716 skills.
- W, B and M are each swept on a different third of the skills, so the gate stays under 10 minutes; it ran in about 8.
- INFRAME now also counts bare text nodes, and a crop is read through its window.

Backtest on 754b4f918 (served with MQ_ROOT): 52 failures.
- NOPICLESS fires on the hard set at 1366 and 820, and in every size sweep.
- WORDSONLY: L 103 > 4, S 390 > 30.
- The 1024 middle column gets S.
- Log: scratchpad `backtest-754.log`.
- PARITY does not fire there, because that build never draws text under 10 px. It loosens r1's rule and is guarded by the crop.

Fixes (`js/modules/student-explorer.js`, `css/student-explorer.css`, additive):

1. **Judge.**
   - A whole cell is shown when the question line is >= 14 px, the scale is >= 0.6, and every text is >= 10 px.
   - Measuring the practice card showed that it draws number-line and time-line ticks at 17-24 px, not at the 6-10 px they have in the thumbnail stage. So "as small as the card" could not justify 9.6 px; the crop (2) brings those labels to 10 px or more instead.
   - Layout cost: one measurement per layout at scale 1. The fit scale and the scale every text needs both come from it.
   - Each picture's own content box is read through `getBBox` and `getScreenCTM`.
   - A batch of 60 plates fell from 8.5 s to 5.6 s.
2. **Crop.**
   - The question line (20 px, down to 16) sits on top. Under it, a window shows the main figure at the smallest scale (0.6 up to 3) at which the figure's own labels render >= 10 px.
   - The window shows the whole drawing if it fits. Otherwise it shows the whole figure with as much to its left as fits. Otherwise it shows the figure from its top-left.
   - Words cut by the window edge, or still under 10 px, are hidden. The cut edges fade.
   - A drawing line that restates the head is hidden (NODUP).
3. **Words only** are used only for an item with no drawing on its practice card: 2 skills at L, both build widgets ("Build a bar graph showing: Mon=7 …").
4. **Placement.**
   - New B plate, 480 x 228, fits above or below a middle-column card at 1024x768.
   - The size order is now L, W, B, M, S.
5. **R2-D2:** screen and colour wording is dropped inside the thumbnail ("both cells turn green …", "After each number, press Space", "(harder: green cells are blank)", "Drag the ruler"). The words-only and crop-head text is cleaned the same way.

Not done:
- R2-D3: Decompose to Unit Fractions shows its answer tiles in its own visual. That is a generator defect, also on the practice card, and is left for its own task.
- R2-D2 "Remember: 1 kg = 1000 g" and the duplicated angle choices are left as they are.

Results now:

| Plate | Cells | Crops | Words-only |
|---|---|---|---|
| L | 615 | 99 | 2 |
| W (a third) | 188 | 48 | 3 |
| B (a third) | 136 | 98 | 5 |
| M (a third) | 160 | 74 | 4 |
| S | 328 | 366 | 22 |

Every former large-print figure skill now shows its picture: coordinates, transformations, time lines, number lines, box plots, pie charts, line plots, count-by tracks, Area AND Perimeter, Fraction of a Set and the quadrilaterals.

Gates, one at a time after merging origin/master a200431f5:
- ws-student-explorer OK (about 8 min)
- ws-boot-smoke OK
- ws-simple-print OK
- ws-teacher-shell OK
- ws-teacher-preview OK
- ws-screen-answer OK
- ws-chromebook-perf --only load OK (6883 / 6953 / 6953 ms)
- ws-stamp-assets and --check OK

Screenshots:
- `explorer-thumb-1366.png`, `explorer-thumb-820.png` and `explorer-thumb-none-390.png`.
- `thumb-r2-former103-{before,after}-{L,S}.png`: the 103 skills that were words-only at L on 754b4f918, as they drew there and as they draw now, at L and at S.

Speed reflection (this round):
- The r1 gate had a strict pass rule ("never under 10 px") but no check on what failing it cost. That let the fallback silently drop the pictures.
- Rule: every "legible or else" threshold gets a coverage check on its else-branch (here NOPICLESS + WORDSONLY), and a fallback is graded as strictly as the main path.
- Measuring the practice card (`__mqxCardSizes`) before choosing the judge would have saved a loop. The critic's assumption that labels are 6-10 px on the card did not hold.
