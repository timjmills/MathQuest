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
9. Self-grade with numbers, and list which caps (H1–H13, OC1–OC15) you checked and why each does not apply.
10. Paste the `ws-precritic` table in the report (once S1 lands; until then, the lane's gate list with each result).

## Lessons from the ansBox (Answer boxes) critic r1 (2026-10-30, lowest O6 = 3; rebuild r2 2026-10-31)

| # | What went wrong | Rule | Automatic check (backtested) |
|---|---|---|---|
| L12 | **A comparison read an animated value, so it never found two things equal.** `ws-options-verify` compared the answer-box values by the inputs' computed `box-shadow`; the next-box glow animates that shadow, so "One box" and "One box per digit" always differed by a few hundredths of a pixel and identical drawings passed as OK. `animation: none !important` in a test stylesheet did not stop it either: the glow's own `!important` rule has higher specificity. | Any "these two renders must differ / must match" check freezes every animation first (`document.getAnimations()` → pause at 0) and reads twice: AS SHOWN (the next box marked) and AT REST UNFOCUSED (no caret, `data-mq-no-pulse`). A false "they differ" is a pass that hides a defect. | `ws-options-verify` (ansBox), `ws-ansbox-shape` f; backtest `ansbox-a-unfocused`, `ansbox-f-panel` |
| L13 | **"The marker class is in the HTML" is not "the drawing is right".** The r1 verifier's MARK regexes passed when `ws-factans--digit` or `mq-ans-one` appeared anywhere; the class was there and drew nothing (a CSS rule scoped to `.mq-kit`, or out-specified by the next-box ring / the key ink rule). | A drawing option is verified on the RENDERED page: computed borders, box geometry, counts, font sizes, per cell. A marker-exists regex may only be a pre-filter. | `ws-ansbox-shape` b–f (wired into `ws-precritic --skill` for every answer-box skill) |
| L14 | **The key was not a facsimile.** `.ws-key [data-ws-key-mark] { border-color: key ink !important }` repainted the fact zone's outline that 'digit' and 'off' hide, so the key showed a box the pupil page does not have; legacy keys wrote 0.8 em digits in small slots. | The key draws exactly the pupil's answer places (same boxes, same lines, same places) and writes at the question's digit size (AK-1). Any key ink rule that touches borders is checked against every answer-place variant. | `ws-ansbox-shape` b (key box set = pupil box set per cell), d (key digits ≥ 0.9 × question); backtests `ansbox-b-key-pupil`, `ansbox-d-key-digit-size` |
| L15 | **A per-item band rule on a per-item formatter cannot keep one band per section.** The legacy formatter sees one problem at a time, so multiply's digit strip followed each item's operands (3 boxes beside 2). | A box count is decided per SECTION by the bridge (`markSectionAnsBand`) and handed to the item; never from the item's own numbers. | `ws-ansbox-shape` e; backtest `ansbox-e-one-band` |
| L16 | **Two offered values that draw the same thing are a lie on the panel.** "Automatic" equals "One box per digit" on every column skill and "One box" on every fact. | An offered value must draw something no other offered value draws, on every host; a duplicate of Automatic is left off the panel (kept in the model so old codes decode). | `ws-ansbox-shape` f (pupil, key, card, worksheet, quiz; as shown and at rest) |
| L17 | **A parity or "pre-existing" baseline taken at a lane commit hides the lane's own regression.** r2 measured "91 byte-identical" and "all reds pre-existing" against b63c075, which already held the lane's 8c21ca1; against main, 28 passed-skill documents had changed. | Parity and pre-existing are measured against `git merge-base HEAD <main>` only. | `ws-ansbox-default-parity` (and any `--write` baseline) refuses a base that is not on main (to build before r3). |
| L18 | **Checks that enumerate the critic's sample, not the option space, let each defect class come back on the next unsampled combination.** fact notation=across, worksheet host and the Off focus ring all repeated r1 classes in r2. | An option check iterates every value of every option that changes the same drawing (notation, divForm, layout) × size × host. A per-host CSS patch per finding is a smell: one geometry function per template. | `ws-ansbox-shape` full cross product; `ws-options-verify --render` must list every appearance option or say SKIPPED (to build before r3). |
