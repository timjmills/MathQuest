# Lessons learned — design it right the first time (2026-09-25)

Owner: "are we learning from these failures so that we can design better the first time?"

Every independent critic round so far (skills R3/R4, options R3, lessons R1) failed most work that the building
lane had self-graded 8. The failures fall into a small number of RECURRING classes. This file turns each class into
(1) a design rule applied BEFORE building, and (2) an automatic check, so it cannot recur silently.
**Every build and fix lane reads this file first and runs the PRE-FLIGHT checklist before it reports.**

## The recurring failure classes

| # | Class (seen in) | Design rule — do this first | Automatic check |
|---|---|---|---|
| L1 | **Size S ignored** — same grid and drawing at S as at L (options R3: 87 skills) | Every drawing sizes from `ctx.metrics` (never fixed mm/px); decide the S/M/L grids on paper before coding | `ws-columns` + NEW `--sizes` check: S must fit more items or more columns than L, drawings must scale |
| L2 | **Wasted space** — empty bands in cells, 1–3 items per page, blank page strips (R3, R4, options, lessons) | Size the cell to its content; count how many fit at S/M/L before building; mixed-height items get their own rows | `ws-print-lint` L-DENSITY H13 + PAGEFILL (on); run at S and L |
| L3 | **Answer given away** — result drawn (combine shapes), slot width = answer length, regroup boxes only where needed, labelled target tick, "wrong" answer = right answer | Structural scaffolds on EVERY item or none; slot widths from the widest possible answer; never draw what is asked | NEW lint: pupil page must not contain the key value inside the question drawing; providers-unit: wrong ≠ right |
| L4 | **Wrong or incoherent content** — unshaded "shaded" circles, axis 0, 1.8, 3.7…, carries on 1-digit facts, ungrammatical stories, "Up to 10" dealing 11–19 | Generate 50 items per option value and READ them before building the drawing; the name and each option value are promises | `ws-content-audit`, `ws-story-lint`, `ws-options-verify` predicates; add a predicate per new option |
| L5 | **Paper ≠ screen** — doubled answer areas, paper verbs on screen, MC on screen but writing on paper | One kit cell drawn on both; the cell's slots ARE the inputs; screen verbs via the contract map | `ws-screen-slots` (0 doubled, 0 paper verbs), `ws-screen-answer` |
| L6 | **Instructions / steps / titles don't follow the item** — guided steps for other numbers, "Write the missing numbers" on a hands task, place-value "I Can" on fractions | Derive instructions, steps, Say lines and titles FROM the item and chosen options (provider `stepsFor(q)`), never a fixed string per skill | NEW providers-unit check: every item's instruction/steps mention only its own numbers/task |
| L7 | **Legacy / colour cells** — old print path, colour, emoji, non-Andika fonts, scrollbars, bold headings in cells | New work goes straight to a kit cell; touching a legacy skill means migrating it | `ws-print-lint` INK / FONT / EMOJI; `ws-ink-unit` |
| L8 | **Options missing a dimension** — no support control where a hint could fade, no difficulty ladder, no appearance choice (options R3: O3 94, O2 84, O6 110 below 8) | Design the O1–O6 panel on paper first: one number-size ladder, one complexity control, one fading support, one appearance choice (or a one-sentence reason) | `ws-options-verify` (every value changes print + screen) |
| L9 | **Self-grades too generous** — lanes report 8, critics find 5–6 | Grade your own renders against the RUBRIC anchors with numbers measured (pixel-scan bands, count items, measure digit mm), not impressions; list every cap you checked | The ORCHESTRATOR runs an independent critic on a lane's renders BEFORE merge, not only after |
| L10 | **Answers follow a pattern or never vary** — correct choice alternates A/B or cycles every 3–5 items; one task answers the same on 30 of 30 items because two things are dealt by one draw (k2-r1) | Deal the answer position and every task attribute from the seeded rng with repeats allowed; never from `itemIndex % n`; one draw per independent attribute | NEW providers-unit / content-audit check: over 30 items the correct position and the answer must vary and must not cycle |
| L11 | **Steps squeezed beside the drawing** — a model / anchor cell's step list set in a strip one word per line, running out of its border, next to a tiny drawing in a huge cell (owner, count_by_tables anchor) | Steps go beside the drawing only when the column is ≥ 55 mm (≈ 18 characters); wide drawings (rows, lines, tables) always put steps underneath; the model cell is as tall as its content | print-lint: no text column < 18 characters per line, nothing outside its cell border |
| L12 | **The relation is not drawn** — a fact-family skill as bare numbers in a row with a rule box saying "Two parts make the whole"; 21 of 32 relation skills draw nothing (visual-quality lane, owner 3/10 on `fact_family_sort`) | Name the relation first and take its drawing from the representation map (WORKSHEET_DESIGN_STANDARD §18.1, VQ-1) and the graphic library (VQ-4); a statement of the relation is not a drawing | `ws-visual-quality` VQ-REP (relation skill ⇒ a bond / family / family-check / ten frame / bar template on every item); RUBRIC H14 |
| L13 | **Dead scaffold parts** — + − × ÷ on a Grade 1 add page, a 3-track carry grid on 13 + 2, "books / boxes / days" in the bank (owner 4/10 on `add_wp_20_plain`): one template tuned for its hardest client | Every part a template draws is live for THIS skill and band: signs it deals, tracks its largest answer needs, story nouns only; scale the template's parts by grade, or pick a lighter layout (VQ-3) | `ws-visual-quality` VQ-LIVE (sign choices vs dealt operations by grade, no column grid when every answer ≤ 20, no filler bank word); RUBRIC H15 |
| L14 | **Undefined or doubled answer area** — Yes / No ticks AND a Say frame with three blanks in one cell; an unlabelled write line; a bank floating beside the grid | ONE graded response area per answer, a defined slot shape and a unit or label beside it; the Say frame belongs to the model (VQ-2) | `ws-visual-quality` VQ-ONEANSWER (no Say blanks in the cell, no tick list + "Answer:"); `ws-screen-slots` for the screen; RUBRIC H16 |
| L15 | **Garbled title / legacy cell built new** — "I Can add is it a fact family? +/−" (title built from the label); `fact_family_sort` written as `_wsCell` HTML on 2026-10-24 though `family.js` existed, passing L7's ink / font check | Write the provider's `strings.iCan` as a sentence for the skill (VQ-9); a new or rebuilt skill emits `q.cell` on a kit template (VQ-10) — L7's ink check is not a kit check | `ws-visual-quality` VQ-TITLE (no "?", sign pair, "is it", pasted label) and VQ-NOLEGACY (the no-kit-cell pin only shrinks); RUBRIC H17 |
| L16 | **The dialog plans the page, not the engine** — the print dialog dealt a fixed 8 problems a page and sent ONE small request a page with a section of 1–2 per skill; six parts' headings spilled each page, the dialog "learned" 3 a page and printed 41 problems on 14 pages (owner, 2026-11-03: "it is just showing a couple of problems") | A print screen never decides how many fit: it sends the whole set as ONE request (a section per skill with its count) and lets the engine paginate; Pages mode reads each part's full-page capacity from the engine (`fits.sections[i].perPage`) and trims / grows whole rows until the engine's page count is the pages asked | `ws-simple-print` FILL (every default page ≥ 60 % of its problem area), DENSITY (no fewer a page than the same counts printed singly), NOT3; `--backtest` fails the old dialog plan (fill 22–46 %) |
| L17 | **A clamp or ellipsis made distinct names look identical** — two Quick Start cards both read "Add Fractions (like denominators…" and "Two-Step Word Problems: Ad…" (pupil explorer r1–r3): the gate compared the FULL text (`textContent`, all distinct) while a 3-line clamp on a 109 px card showed the same start; the defect survived two fix rounds | Compare the VISIBLE text, never the full text: wherever a name can be clamped, cut or ellipsed, the part that tells two names apart must be in what shows (a head + a never-clamped tail, or a short form distinct by construction). Test with the hard set: the longest names and every pair sharing a long prefix, at every width | `ws-student-explorer` QSVISIBLE reads each card's shown characters (Range rects inside the clipping box) at 1366x768 / 820x1180 / 390x844 and FAILS when two cards show the same text; backtest: 133 failures on 425f4fec6 |
| L19 | **Print checks compared set 1 with the dialog, not every page of every set with the request** — facts print r3 (critic 2026-11-05): set 2 printed 10 columns beside set 1's 8, a page at 24 pt beside pages at 20 pt, 35/32/31/32 for 33/33/32/32 asked, ÷ alone on a page 80 % empty — all under a green gate that read set 1's chips and a 60 %-of-cells rule | **Print checks must compare EVERY page of EVERY set with the REQUEST and measure white space in mm**: columns and digit size per group on every grid of every page and set, per-skill totals = the split of the asked count, pages <= the fewest the rows need with all groups planned together, white under the grid (mm) <= one row. A layout reads what the skills can REACH (one probe), never what one page dealt | `ws-simple-print --facts-print` SETPAGE / FILL / AUTO9 (the real dialog driven and Print pressed for the owner's cases, the printed document measured); backtest row `facts-print-fix-r3` |
| L20 | **Mixed cell forms need one baseline and one slot position; rules must be checked rasterised** — facts print r4 (critic 2026-11-05, the owner's ÷ Mix page): three templates in one grid each placed themselves (stacked ÷ and fraction at the top, the bracket centred down the cell), so the rows zig-zagged 6 mm, the answer slots sat in three places and "12)108" kept 0.98 mm to the border; the DOM said every rule was drawn while pdfium dropped 3 of 10 verticals on main; Problems mode left 50-105 mm half-empty pages under a "one row of white" rule and stretched cells to 1.7 | **A grid that mixes forms draws every form in ONE frame** (the same lines in the same places: top digit line, bottom digit line, answer line), centred down the cell under the tab, each drawing centred across; geometry is measured on glyph INK (canvas) and baselines, never text boxes; drawn rules are checked on the PDF rasterised at 72 and 93 dpi; the owner's white-space rule is written in mm per page ("every page but the last within 8 mm; no stretch past 1.3") before the planner is written | `ws-simple-print --r4` (in `--facts-print`): MIXBASE, SLOTPOS, FRACEQ, CLEAR (tests/lib/ws-fact-geom.cjs), BRKTRACK, PDFIUM-RULES (tests/lib/ws-pdfium-rules.py), FOOTWRAP, DIVSECTIONS, SIZEMIX, FULLPAGE, ONEDIGIT, ROWSAME; backtest row `facts-print-fix-r4` |
| L21 | **A planner checked on named cases hides its failures between them** — facts print r5 (critic 2026-11-05): the r4 gate ran ~20 named prints and passed, while a sweep of Problems 20-150 found 21 plans where a "÷ first" reorder left a 1-fact row and 4 empty cells on page 1, a 1-fact last page titled "Divide by 6", and ÷ Mix In sections at Big printing 2 / 2 / 1 / 15 | **Sweep the counts, not samples**: a planner change is checked over every count in its range × size × columns × arrangement through the built path (parse the HTML, no layout: 684 prints in under a minute), with the owner's rules as invariants - no empty cell before the last page, the teacher's order, every skill within a row of its share, a title that names a number only when an option fixes it, a last page with a full row (or a note). Never trade one owner rule for another silently (r4 traded "teacher's order" for "full pages"): when two rules collide, move whole rows between sections, then add a page, then say so | `ws-simple-print --r5` (in `--facts-print`): SHARES, BLANKMID, DIVORDER, TITLEONE, ORPHAN, FULLPLAN, COLSIZE; `--r4` QROOM and bracket centring; backtest row `facts-print-fix-r5` |
| L22 | **A gate that reads the planner's own numbers cannot catch the planner; sweep the MEASURED page across the whole input space** — facts print r6 (critic 2026-11-05): the r5 sweep (684 prints) passed while ÷ Mix asked 10 printed 26, Pages 2 left 41.6 mm under the last grid beside "every page is full", Problems pages carried 16.8 mm, and Big at Columns 9 printed 16 pt with no word - all outside its grid (counts under 20, Columns 6-10, Pages 3-4, two-skill lists) or in white the plan REPORTED (`factPlan.filled`) | Every print check draws the page (print-emulated frame, sheetDocument, ~0.2 s a build) and measures it: total against the REQUEST, white in mm against a full page, digits against the Size, notes against what printed. Sweep the input space - counts 1-150, Columns Auto and 1-10, Pages 1-4, skill lists of 1-4 skills, both arrangements, Sets 2 - a default sweep under ~3 minutes in the gate and a full sweep for the critic and the deploy run | `ws-simple-print --sweep` (in `--facts-print`) / `--sweep-full`: TOTAL, SHARES, SIZENOTE, PAGESFULL, BLANKMID, DIVORDER, STRETCH, SIZEBTN; backtest row `facts-print-fix-r6` |
| L23 | **A check with an exemption hides the case it exempts** — facts print r7 (critic 2026-11-07): DIVORDER skipped lists that start with ÷, and every gate list put ÷ last, so ÷ printed last whatever the teacher's order (a regression against master) on 1,447 prints | A rule about order compares the print with the LIST, never with a fixed order, and the gate's inputs include the unusual orders (÷ first, ÷ between). A check never exempts a whole class of input; where a rule truly does not apply, the exemption names the reason and the print says it | `ws-simple-print --sweep` ORDER (lists ÷ +, ÷Mix −, ÷Mix × − +, − ÷Mix +), COLNOTE, BRKCLEAR, NOTEPLAIN; backtest row `facts-print-fix-r7` |

> **2026-10-23:** the checks marked NEW above (L1 sizes, L3 key-in-drawing, L6 instruction-follows-item, L10 answer cycles) plus
> lone item / lone state, repeats, text ≠ generator and the Chromebook viewport are built in Wave 0 (`design/IMPROVEMENT_PLAN.md`
> §1.4 S2), each proved by a backtest on a failed commit or a seeded fixture; `ws-precritic` then runs them before every critic round.

## Process rules (owner, 2026-10-23)

These rules come from `design/IMPROVEMENT_PLAN.md` (§1.3 – §1.7, §4.3). The plan has the reasons; this is the short form.

00. **The speed reflection cycle — always (owner, 2026-10-23: "always perform it so that we get better and better, faster
   and faster").** Every lane, family, pilot or tool build ends with a reflection, before the next one starts:
   1. **Measure** — an independent auditor (`mq-opus-medium`, never the lane itself) reads the lane's `Times:` lines and
      critic reports: wall time per step, builder runs, critic rounds, tokens, time waiting for browser slots, and the
      result against the target (§4.4: ≤ 2 rounds, 1 builder run, and the time budget) and against the running baseline
      in `design/status/metrics.md`.
   2. **Find the causes** — for every round lost and every hour over budget: which defect classes the critic found that a
      machine could have measured, which card gaps, which wrong builder strength, which waits.
   3. **Change something** — each cause becomes the smallest fix: a new machine check with a backtest, a card or
      template rule, a process rule here, a tool speed-up, or a change to how lanes are run. Fixes are made or assigned
      before the next lane of the same kind starts; nothing is "noted for later" without an owner and a date.
   4. **Record** — the result, causes and fixes go into `design/status/speed-audit.md` (one dated section per
      reflection) and the numbers into `design/status/metrics.md`, so the trend (rounds, hours, skills per lane-week)
      is visible over time. The owner gets a short plain-words summary.
   **After EVERY critic round, pass or fail (owner, 2026-10-23),** the lane also writes two lists into its status file
   and appends them to `design/status/speed-audit.md` under "Per-round findings":
   - **Automatic checks** — each critic finding a machine could have measured (class, the rule, the proposed check and
     its backtest), and whether a check already exists that should have caught it;
   - **Speed-ups** — anything that cost time in that round (waits, reruns, wrong builder strength, card gaps, tool
     slowness) and the smallest change that would save it.
   The orchestrator assigns each item an owner (a lane, the checks owner, or a card/rule edit) before the next round.
   A lane is not closed until its reflection is written. *Why:* the 2026-10-23 pilot reflection found the wrong builder
   strength and five missing machine checks within the hour; each is now a rule or a check.
0a. **Low effort only on a certified pair (pilot, 2026-10-23).** Opus low builds only copies on a (template, kind) pair that
   has its certificate (`design/audit/certified/`). Every build on an uncertified pair — including redos and "copies" — runs
   on Opus medium. *Why:* the SU-C pilot built at low on `stack` × Single skill before certification; critic r1 scored a
   minimum of 4 and the family needed a second builder run.
0b. **Clean before the critic.** The critic starts only when `ws-precritic --strict` is green against the pinned baselines
   (under `--strict` a SKIPPED-NOT-BUILT, SKIPPED (no rulings) or INCOMPLETE row is not green) AND every red matrix row is at
   or below the approved siblings' counts (the sibling comparison), on the lane branch MERGED WITH the current main branch,
   with the unit gates green there too. A critic round started earlier counts only if that comparison later confirms it.
   **Lead ruling 2026-10-31 (shared-roles r1):** "at or below base" never covers a page role, template or host the lane
   CHANGED: any red row there blocks the critic, even when the same row is red on main. Main-red rows may pass only on
   roles / templates / hosts the lane did not touch.
0. **Batch design decisions (owner, 2026-10-23).** A new design idea from the owner while a build or fix round is running
   goes on the lane's "Owner design list" (status file, date + the owner's words) and the owner is told it is queued; it
   is not folded into the running round. When the round passes its critic, the owner sees the whole thing once and
   approves it or gives ONE batch of changes (with the queued list), built in one round and reviewed in one critic
   round. Exception: something that blocks the approval itself (a broken flow, something unreadable).
   *Why:* on 2026-10-23 four mid-build design changes cost the teacher mock-up a round each.

1. **Template first.** Build in this order (§1.5): signed spec card → one model skill at Opus medium → full critic on
   every kind of worksheet, size (S / M / L) and screen host → golden renders saved → the template's other entries and
   presets as data at Opus low → batch critic (§1.3) → owner picture sheet → deploy.
   *Check:* the lane brief names the step it is on; nothing is copied onto a template before its model has passed.
2. **One approved model per (template, kind of worksheet) pair.** A pass on one pair says nothing about another. There is
   no inheritance across pairs (§1.6.2, §1.6.4).
   *Check:* a page counts as graded only as RUBRIC "How a page counts as graded" says.
3. **The spec card is signed before the build starts.** `node tests/scripts/ws-spec-card.mjs` writes
   `design/cards/<template>/<id>.md` with nine sections: 1 what it teaches · 2 problem types and progression ·
   3 the drawing · 4 rules that apply (by rule id) · 5 owner rulings · 6 misconceptions · 7 options and presets ·
   8 gates · 9 open questions. It ends with `Signed: owner, <date>` (§1.4 S3). Builders read the card; critics keep
   reading the full standards and RUBRIC.
   *Check:* `ws-spec-card --check-signed` passes before any build. `--check-coverage` (every rule id a critic has cited
   for the family is on the card) runs again at each build start, so a rule added after signing is caught.
4. **The order of checks is fixed** (§1.7):
   1. machine checks in node;
   2. machine checks in the browser;
   3. the builder's own look — catches plain faults, **never counts as a grade** (L9);
   4. critic reading (C1 and C2);
   5. full grade on all four criteria;
   6. the owner's look.

   A critic never sees a page whose machine checks are red. The builder's report is the `ws-precritic` table.
   *Check:* the orchestrator refuses a report without that table, and refuses it if any gate is red except where the
   pinned baseline is red.
5. **Flakes are defects.** A FAIL that passes when re-run alone is logged as a defect, with an owner, and counted in the
   S8 tally (`design/status/defect-tally.csv`) (§1.3).
   *Check:* the same item flaking twice blocks the deploy until it is fixed.
6. **Every critic finding is tallied by class** (classes in `design/status/defect-classes.md`, tally in S8).
   *Check:* a rising class that a machine can measure becomes the next machine check, proved by a backtest (§1.4 S2).
7. **Two rounds at medium, then stop.** If the same defect survives two rounds at Opus medium, stop the loop: find the
   root cause, make it a machine check, brief a fresh builder. Which profile builds what is in CLAUDE.md "Agents" (§1.7).
8. **Lane hygiene** (§1.4 S6, §1.6.6). A lane writes only `design/status/<lane>.md`, never `design/STATUS.md`. Its
   changes are listed in `design/lanes/<lane>/manifest.json`, applied by `ws-integrate` (once E5 lands). A lane never
   runs `ws-stamp-assets`. The owner's go for a family is the line `Owner go: <family>, <YYYY-MM-DD>` in the lane file
   (§1.6.3 step 6).
   *Check:* the deploy is refused for a family with no go line.
9. **A lane's gate set includes every gate that reads what it ships (lessons 6-7 merge, 2026-10-31).** Detailed lessons
   6 and 7 merged with their own gates green (ws-detailed-lesson, precritic --role lesson), but ws-teacher-wrm, which
   decodes each detailed lesson's teacher Practice link, was not on the lessons lane's path and went red: the link was
   built from the de-duplicated skill queue, so a skill used twice with different options lost its second use and its
   options. Root fix: the link encodes its own items (each (skill, options) use). The gate compares use by use.
   *Check:* `ws-precritic --role lesson` now runs ws-teacher-wrm; backtest row `detailed-link-every-use`.

### Teacher-site preview screens (pdf-preview lane, 2026-10-31)
- **A hidden element is not an open dialog.** A guard that tests `getElementById(overlay)` breaks the moment the overlay
  is pre-built hidden (Esc stopped closing the Print sheet). Test visibility (`!el.hidden` / an `isOpen()`), and gate
  Esc on the screen BEFORE the dialog is ever opened and AFTER it closes. *Check:* `ws-pdf-preview` dialog steps.
- **A dialog with an iframe needs the trap inside the frame too**, and everything behind it `inert`. *Check:* 10 × Tab
  and 10 × Shift+Tab stay inside; the sheet is inert while open and not after.
- **Time from the press, on the wall clock, with one real input event.** Handler-side `performance.now()` hides a press
  queued behind a long task; `page.click` adds several round trips that each wait. *Check:* CDP press/release, Date.now().
- **Parity by pixels, not only DOM.** The same HTML can print differently (fonts). Render the PDF from the app's ORIGIN
  (a document on about:blank cannot load self-hosted fonts), compare at real size with a 1-px neighbourhood (A4 is
  793.7 px at 96 dpi), and backtest the limit with a real difference (a serif title = 0.06 %; limit 0.02 %).
- **Screenshot traps:** element screenshots past the window edge show what is behind; `clip` is document coordinates;
  `captureBeyondViewport` resizes the window (and any fixed overlay). Use a tall viewport, scroll, clip, beyond=false.
- **Background engine work gives way to the teacher.** One engine call is one long task (~1 s on a Chromebook); start
  background builds only after 1.5 s without input and pause between calls on any pointer/key. *Check:* presses at
  several offsets inside the busy window (+300 … +2500 ms), wall clock, page 1 < 1 s.
- **Count what the page IS, not what it is not:** "pupil pages = all − keys" counted set covers. Count pupil pages by
  their Name line.

### Fact layouts (Lane D restart, critic r1–r2, 2026-10-31)
- **A clearance check measures every neighbour, not the one the last critic named.** r1 found the long-division arc
  INTO the dividend; the fix measured only the dividend side and r2 found the arc 0.27 mm from the divisor (no white
  pixel at 100 %). *Check:* L-OVERLAP ARC-INK measures both sides (floor 0.3 mm, aim 0.5 mm) plus a 96-dpi raster test
  that the arc and each neighbouring digit are separate shapes (R2-1; to build).
- **A seeded layout test needs many seeds when the layout depends on what is dealt.** The mixed + − × ÷ fact-rows page
  drops to 8 columns only when a product over 99 is dealt; seed 11 never deals one, so 56 facts in a 10-column grid
  passed. *Check:* L-DENSITY COUNT-FITS — printed items = dialog count = Score /N over seeds 1–24 for every mix (R2-2; to build).
- **A grid rule belongs to every grid.** GRID-EVEN was scoped to fact rows; the fact probe widened its last row (R2-3).
  *Check:* GRID-EVEN on every kit grid section + fact-probe × divForm × S/L on precritic's plan (to build).
- **Text in a bordered box ends inside the border.** "Think: 12 × [ ] = 108" overran its box in 6 of 12 cells (R2-4).
  *Check:* L-OVERLAP TEXT-FRAME (to build).
- **A family round runs precritic on every role, not the role it changed.** `--role fact-rows` never saw the add_facts
  Review M H13 that the existing L-DENSITY catches (R2-5). *Rule:* family rounds run precritic `--role all` at S, M, L.
- **Pattern (r2):** three of five findings slipped through checks this lane had just written, each scoped too narrowly
  (one side, one role, one seed). When a lane writes a check, it writes it for the CLASS of defect, not the instance.

- **A new gate covers every role the skill prints on, by default.** print-lint --supports all ran on Independent only; the
  answer-zone shift with several supports showed on Test (R3-1, SCC-T10 already fires there). *Check:* the precritic supports row
  runs every fact-family role.
- **Prove a red is shared before pinning it.** add_facts Review M H13 was about to be pinned as a shared-role defect; the other
  lane showed main was clean, and the cause was this branch's Review column choice (R2-5).
### Student Chromebook speed (chromebook-speed lane, 2026-11-02)
- **A pupil downloads what core imports, not what a pupil uses.** 37 % of the startup bytes were teacher, print, quiz, MAP
  and curriculum code a ?c= link never runs, and two third-party scripts only the Google export reads. Anything a pupil
  does not need before the first question goes in `js/modules/deferred.js` (async stubs on window keep the inline handlers
  working). *Check:* `ws-chromebook-perf` static budgets (startup gzip <= 1,900 KB, <= 200 modules) and "Start Playing
  waited on no deferred module"; a pupil play-through may load no deferred module either.
- **A module that sets shared state at import must not reset it.** `window.globalSkillsList = []` at the top of a module is
  harmless only while that module loads first; loaded late it wipes the list. Create shared state in globals.js; modules
  keep an existing value.
- **An element id is a window property.** `typeof window.soSearchInput !== 'undefined'` is true for `<input id=soSearchInput>`:
  test `typeof === 'function'` before skipping a name.
- **Read everything, then write everything.** A loop that writes a style and then reads a box or a computed style restyles
  the whole page every turn; on a page with 157 `:has()` rules one restyle is ~25 ms at CPU 6x. The live mono pass did it
  per element on every mutation (21.6 s of CPU over 50 questions). Batch reads before writes; write only a value that
  changes; drop a measurement that the caller repeats straight after. *Check:* `ws-chromebook-perf --why` lists the callers
  of every forced layout of a slow question; `ws-ink-parity` (colours, `--geometry` boxes) proves a batched rewrite paints
  and lays out the same as the old tree.
- **A failed `import()` is cached for the life of the page.** Retrying the same URL rejects at once with no request;
  retry with a fresh URL and, if that fails, tell the user to reload. A stub on window is also a trap for code that "calls
  it if it exists": guard with `!fn.__mqStub` where a call would only download a part to do nothing. *Check:* the checker's
  drop-then-retry probe (route abort, `serviceWorkers: 'block'` - a page the service worker controls fetches through it,
  out of Playwright's sight); `ws-chromebook-perf` leaves the game and asserts no deferred module loaded.
- **"Settled" must outlast the app's own quiet rules.** A 600 ms quiet window ended inside the Skills screen's thumbnail
  pauses and the Print screen's 1.5 s quiet-before-background rule, so one tree measured 3 s and the other 7 s for the same
  work. Use a window longer than any deliberate pause (2.5-3 s) and compare like for like.
- **Time a perf change against the base on the same machine.** Live and local differ (17.1 s live vs 10.85 s local for the
  same commit); the budget is a ratio of the base measured with the same harness, plus exact byte / module budgets that
  cannot flake. Never run two timing runs, or a timing run and another browser gate, at once.

## PRE-FLIGHT checklist (every lane, before reporting)
1. Rendered at **S and L** (and M if the grid differs): independent, guided, test, error-analysis + keys; card at
   1280/820/390, worksheet, quiz. Looked at every PNG.
2. For each page: items per page at S and L written down; largest empty band measured (must be < 30%); no page
   strip > 20% on Auto.
3. Read 50 generated items per option value: every item true to the skill name and the option's promise; the correct
   position and the answer vary with no cycle (L10).
4. Nothing in the question drawing reveals the answer; every structural scaffold on every item.
5. Instructions, steps, Say line and title checked against three different items.
6. Screen: one answer area, screen verbs, instant green, support ladder climbs.
7. Options: the panel has a size ladder, complexity control, fading support and an appearance choice (or a stated
   reason), all verified.
8. Gates green: the lane's usual list + `ws-screen-slots` + `ws-story-lint` (word skills).
9. Self-grade with numbers, and list which caps (H1–H17, OC1–OC15) you checked and why each does not apply.
10. Paste the `ws-precritic` table in the report (once S1 lands; until then, the lane's gate list with each result).
11. **Visual quality bar (2026-10-31):** run `node tests/scripts/ws-visual-quality.mjs --skill <cat:skill>` (it is on
    precritic's `--skill` path) and look at the drawing against VQ-1 … VQ-10 (`WORKSHEET_DESIGN_STANDARD.md` §18): the
    relation drawn from the map, every part live, one labelled answer place, the title a sentence, a kit cell. Write which
    of H14-H17 you checked and why each does not apply.

## simple-print-2 critic r1 (2026-11-03): one line per finding, the check that now catches it
- A mode whose request differs only by a field the engine ignores is a label, not a mode (Aim = Exactly) -> ws-simple-print EXACT builds one set in both modes and FAILS when the page plans are identical.
- A band's values are not always answer bounds ("Tables to 12 × 12" shown as "Highest number 144") -> ws-simple-print WITHIN: a band shown as Highest number N on × / ÷ facts must deal a 12 when N >= 12; `numberOptionsOf().band.answer` decides the label.
- A fixed stride over a small ticked set lines one table up every column (8, 7, 6 at 6 across) -> ws-simple-print FACTPATTERN (no column / diagonal one table all the way down; at most half the columns with a 3-row run) on × 6–8 at S/M/L.
- Footers built from the bare label contradict the options ("(1-12)" on a 6–8 page) -> ws-simple-print FOOTER names "within 50" / "tables 6–8" from the options.
- "Fact-sized" (the kit's isFact) is not "Facts" in words: column additions were called Facts -> ws-simple-print SUMMARY fails a non-*_facts type named "Facts".
- Evidence screenshots of a page below the viewport captured the app -> the evidence script asserts the last page is .ws-key with "Answer Key" before saving it.

### L18 (2026-11-05, explorer r4): "different text" is not "tells apart"
A check that two clamped cards show different strings passed "Subtract within 1,000,000 (N…" beside "Subtract within 1,000,000…".
Rule: the first word where two names differ must be visible WHOLE on both. Check: ws-student-explorer QSVISIBLE (diff word), at
every common width including 1024x768 and 360x740.
## facts-print-fix r3 critic (2026-11-05): one line per finding, the check that now catches it
- Problems mode left pages 30–80 % empty and gave ÷ a page of its own (Problems 50 at S: 2 pages, 72 + 169 mm white) -> ws-simple-print FILL: white under the grid in mm <= one row on every page (the last too unless the set is one page), pages <= ceil(rows needed / rows a page) over all groups together.
- Columns and counts changed between sets (set 2: 10 columns; Columns 9 at L: 48 in 8 beside 54 in 9) because the × clamp read the facts DEALT -> SETPAGE: every grid of every page of every set has the summary's columns and per-skill counts; the layout reads the skills' reach (simple-print reachOf).
- Per-skill totals drifted at L (35/32/31/32 for 33/33/32/32) when a page fell back to its own apportion -> SETPAGE: printed per skill = splitCounts(request) for every set; counts are dealt page by page from what is left.
- Digits changed page to page (20 / 24 pt) with the deal's tracks -> SETPAGE: one digit size a group over the whole print, and across prints of the same size and columns.
- Auto printed 10 at S (+ − alone, and set 2 with ÷ in the print) -> AUTO9: Auto never more than 9 for any fact mix; 10 only when picked; never offered with ÷.
- A doc's heading "at most 9" excused the next sentence's "reaches the full 10 columns" -> DIVMAX9 docs reads PAGE_TYPES.md too, sentence by sentence.
- Speed: one machine check that compares the PRINT with the REQUEST (not with another build or the chips) would have caught D1–D4 in round 2; a planner whose rule is "a last page under 60 %" cannot meet "no white space" - write the owner's rule in mm first, then plan to it.

## facts-print-fix r4 critic (2026-11-05): one line per finding, the check that now catches it
- The owner's ÷ Mix page zig-zagged: bracket centred, stacked ÷ and fraction top-aligned (css/sheet-kit.css CL-4b, three templates) -> MIXBASE: one baseline a row (±1 mm), the row's items centred down the cell and each across it; fixed by one three-line frame for every form (fact-rows.js mixWrap, .ws-mixform).
- Answer slots in three places, the bracket's quotient over an invisible box -> SLOTPOS: every slot has a drawn rule on its edge (sum rule, answer line, vinculum); the stacked and fraction slots end on one line, the bracket's on the top digit line.
- "=" 0.85 mm from the fraction bar; the bar only as wide as the numerator ("0" over "12") -> FRACEQ: >= 0.25 em, the fraction and "=" centred (±1 mm).
- Bracket ink 0.98 mm from the border; "12)0" on a 1 em fallback track -> CLEAR (2 mm, glyph ink) and BRKTRACK (data-ws-rowgeo, divisor digits < 0.45 em apart).
- The DOM had every rule; the PDF lost them on main -> PDFIUM-RULES counts unbroken rules on the pdfium raster (and found the frame's double edge at 93 dpi: fixed with background-clip: padding-box).
- Footer "Division Facts (1-" / "12)" -> FOOTWRAP: each name's Range on one line.
- Problems mode 50-105 mm of white with 1.7 stretch; ÷ at 24 pt beside 20 pt; rows 37.27 vs 36.38 mm -> FULLPAGE (every page but the last within 8 mm, no row past 1.3), ONEDIGIT, ROWSAME. Root causes: the planner scored the worst page and tied on least stretch; a page could not share a digit size; the frame came out of a short grid's rows.
- Pages 1 printed 2 pages; In sections did not split the ÷ forms -> DIVSECTIONS and the shared-page plan (buildFacts).
- A dialog check that leaves Columns as the last print left it reported "M prints the S page" -> every UI check sets every control (SIZEMIX UI).
- Speed: matching the owner's screenshot to its seed first, and a dev dump of every page's grids, columns, pt and white, found every root cause in one pass; the r4 checks ran in 31 s, so each fix was measured at once.

## facts-print-fix r5 critic (2026-11-05): one line per finding, the check that now catches it
- ÷ Mix In sections, Pages 1, Big printed 2 / 2 / 1 / 15 (every group given one row first, fill preferred to the shares) -> SHARES: each skill within one row of its share, or a note; Pages mode is now planned as Problems mode for the most problems filling the n pages, and the ÷ forms share one mixed section when a section each would break the shares.
- The r4 "÷ first" reorder put a short ÷ row (1 fact, 4 empty cells) on page 1 -> DIVORDER and BLANKMID; the reorder is removed and every section but the last prints whole rows (the difference goes to the last section, at most a row a skill).
- Problems 30 at M: a 1-fact last page titled "Divide by 6" -> TITLEONE (a number in the title only when the skill's option fixes it) and ORPHAN (the last page holds a full row or the dialog says so); the rebalanced plan prints 8 / 8 / 8 / 6 on one page.
- Bracket section quotient room 6 mm, ink 1.7 mm off the border -> QROOM (room over the vinculum >= 1.15 em) and CLEAR centring (±0.5 mm).
- Columns picked ignored the Size (S = M = L at Columns 5) -> COLSIZE (S <= 18 < M < L pt).
- Speed: a pure built-path sweep (684 prints, 49 s) found every r5 defect class at once; the dialog checks call bringToFront (background-tab timers turned 0.1 s into 30 s per control for the critic).

## facts-print-fix r6 critic (2026-11-05): one line per finding, the check that now catches it
- ÷ Mix In sections, Problems 10 printed 26 (every ÷ form section rounded up to a whole row) -> TOTAL against the request; a group under a row keeps its exact count, and the forms share one mixed section in Problems mode too when a section each would break a row or the shares.
- Pages 2 left 41.6 mm under the last grid while the dialog said "every page is full" -> PAGESFULL measured on every page, the last included in Pages mode; the Pages planner scores the last page (fillLast).
- Problems pages carried 16.8 mm (one row height a section could not fill both a shared page and a page of one group) -> PAGESFULL measured; each page then stretches its own rows (<= 1.3).
- Big at Columns 9 printed 16 pt silently; the Big button read "5 columns" -> SIZENOTE and SIZEBTN; the note "Big digits don't fit 9 columns; printing at 16 pt.", the button "8 columns · 16 pt".
- A page dealt without a 3-digit ÷ fact kept 9 columns and the next dropped to 8, losing two facts -> TOTAL; every ÷ form section is laid for the widest facts its skills reach.
- The bracket section 1.72 mm from the border -> CLEAR; 0.6 mm more room in a bracket section.
- The repeated "Division facts as written" note -> the form names in one fixed order.
- Speed: the r5 sweep read `factPlan.filled`; drawing every print in a reused print-emulated frame costs 0.2 s, so measuring is as cheap as trusting the plan.

## facts-print-fix r7 critic (2026-11-07): one line per finding, the check that now catches it
- ÷ always printed last whatever the list's order (the groups were built + − × first, ÷ after; the remainder went to ÷) -> ORDER over ÷-first and ÷-between lists; the groups follow the list (In sections, each + − × run between ÷ skills is its own section) and the remainder goes to the group that is really last; the title follows the printed order.
- Columns 1-4 with facts printed 5 across silently and the ÷ forms 2 -> COLNOTE; the dialog offers 5 and up for an all-fact list, the ÷ forms floor at 5, and a saved 1-4 says "prints 5 columns".
- Notes showed "(PT-FRW-5)" and ran to 5-6 sentences -> NOTEPLAIN; each note one plain sentence, the engine's bookkeeping dropped.
- Bracket clearance 1.72 mm in mixed sections, measured on the text BOXES -> BRKCLEAR on the glyph INK (>= 2 mm holds); the boxes are INFO: 2 mm on boxes at 9 columns, 16 pt, would cost the owner's 0.3 mm arc whites (ws-layout-unit PT-FRW-9) or the 9 columns.
