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

### Detailed lessons: pool capacity (lf-engine P1d, owner rulings 2026-11-07)
One line per finding: the rule, then the check.
- **E24b, lesson 2 (near twins on Practice 1 at the last try).** Rule: before building, count the distinct facts the pack's rule holds against the places that deal them (LR-5 once a pack, LR-6 no near twins on a page, either order); a pack that needs every fact has no room for the greedy deal. Check: `ws-lesson-unit --only pool-capacity` (necessary condition, + pools); the deal itself only by the 25-seed `ws-detailed-lesson --sweep` (E24b on every seed).
- **E24b, lesson 2 P0 (6 + 6 / 7 + 8).** Rule: a Prerequisite Check deals from the SAME fact pool as the stories, so its items count against the pool; narrowing its sums concentrates near twins on its own page (sums 11-13 made P0 worse: twin answers and four near twins). Check: E24b on P0, per seed.
- **LP-FAMILY-REPEAT, lesson 3a (Practice 1 vs Guided).** Rule: a half-width cell caps an array's size, and the size cap caps the families; size the Practice cell from the families the pack needs (full width, one a row, arrays to 6 x 6), never the families from the cell. Check: `ws-lesson-unit --only pool-capacity` (arrays: families the allTest admits >= Practice places + chart + Guided); backtest row `pool-capacity-3a`.
- **LP-FAMILY-REPEAT, lesson 3a P0 (2 x 7 twice).** Rule: a check question with exactly as many facts as items (x 2: 2 x 6 to 2 x 9 for four items) repeats as soon as any other place (spaced retrieval) takes one; give every dealt ref at least one spare fact. Check: the sweep (seed 3).
- **E27, lesson 3a (6-wide arrays).** Rule: a counter row past 5 is legal only with RP-21's 5-group gap drawn; a gate reads the drawn positions, never the count alone. Check: E27 reads each row's dot x (`--e27-fixture`, backtest row `e27-five-gap`).
- **E12, lesson 3a (Practice 1 over two pages, 1.6 mm apart).** Rule: a sheet over two pages fixes ONE grid height for every page (the continuation page's shorter header must not change the cells). Check: E12 across P4 pages; backtest row `e12-practice-pages`.
- **T5 Watch "Practice 3", lesson 3a live critic.** Rule: a script names Practice SHEETS, never pages; a sheet over two pages is one Practice k whose last row is on its last page. Check: `ws-lesson-unit --only practice-units` (backtest `practice-units`).
- **E24b, lesson 2 Practice 1 (7 + 4 / 8 + 5 at 4242, attempt 2).** Rule: when a valid set exists but the greedy deal misses it, SOLVE the page's facts first (pairwise no near twins, every first addend and whole different, so any deal order keeps LR-6) and PIN the generator to the solved pairs - never filter a random generator down to exact facts (a fact it deals 0.5 % of tries times out the build: attempt 1). A solve AFTER the earlier pages is too late at some seeds (1-3: no valid page left): solve the scarcest page first and reserve its facts. Check: `ws-lesson-unit --only solve-story` (backtest `solve-story-e24b`); E24b per seed by the sweep.
- **E24b, lesson 2 at every seed (solve-first, 2026-11-08 - stopped, rule 7).** Rule: when a pack needs nearly every fact of its pool (lesson 2: about 18 of 20 crossing-ten facts - Practice 4 + an equal-parts fact, chart 3, Guided 2, P0 4, P5 1, slip 2, Check Question 1 - under LR-5 and LR-6), solving ONE page first only moves the shortage to the next greedy page (Practice cleared at seeds 1-5 and 4242, then P0 and Guided dealt near twins and repeats, and seeds 3-4 timed out). Solve the WHOLE pack's places jointly, or change the data (owner), before any render. Check: a node whole-pack feasibility count (every place's case and page rule, seeds 1-25 + 4242) - not built yet; attempt patch `design/lessons/proof/live-2026-11-08/`.
- **E24b, lesson 2 P0 (owner ruling 2026-11-08).** Rule: a Prerequisite Check never draws from the lesson's own pool - its items test the prerequisite with facts outside the story rule (lesson 2: a teen and ones, 12 + 5, never a crossing-ten fact), so the pool is the stories' alone; and count the WHOLE pack (every place that draws from the pool, LR-5 + LR-6, per seed) in node before any render, then deal Practice from that whole-pack solution. Check: `ws-lesson-unit --only pack-feasible` (lessons/pack-solve.js: no prerequisite ref can deal a pool fact; a whole-pack assignment at seeds 1-25 + 4242); backtest row `pack-feasible-p0`.
- **E24b / E31, lesson 2 at seeds 2 and 5 (attempt 4, 2026-11-08).** Rule: the 'pool capacity' diagnosis was wrong: the pack was feasible at every seed; a whole-pack count must model each place's OWN item source (P0's small ranges, the chart's pool), or it is green while the deal fails. P0's count (17-20) and bond (6-10, parts 3+) questions each dealt 2 items from 1-3 pairs 3 apart, so a greedy first choice (18) left none; the chart's add-to and equal-parts examples came from the main pool the Practice hard bound thinned. Model a range by GREEDY safety (every first choice still completes the question), and give a narrow chart case its own case pool carrying the pack's avoid keys. Check: `ws-lesson-unit --only pack-feasible` (pack-solve.js placeSources; backtest `pack-feasible-sources`).
- **P4-2 41 % band, lesson 3a live critic.** Rule: when a ruling stretches cells to a shared height, the content sits in the MIDDLE of the stretched cell, never top-anchored. Check: the critic's pixel band probe (longest ink-free run / cell height <= 33 %) - proposed for ws-detailed-lesson --check.
