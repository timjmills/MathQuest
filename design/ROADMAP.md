# MathQuest skill revamp: the roadmap

**The one place the plan lives.** Before this file the plan was spread across commit messages,
`design/PROBLEM_TYPES.md` §5, `design/SKILL_CELL_CONTRACT.md` §10 and two research files, and
they did not agree on the next family. When they disagree with this file, this file wins on
**order and definition of done**. The standards still win on **how a page looks and teaches**.

Reviewed 2026-09-24 against the code at `e03e890`; approved by the owner the same day.

---

## 1. Where we are

| Wave | Delivered | Dated |
|---|---|---|
| P0-P2 | Frozen share codes and aliases, the ws- test tools, the six standards, the 92-page approved mock-up pack, self-hosted Andika | 09-19 |
| P3 | `css/sheet-kit.css` + `js/modules/sheet/` (pure kit: tokens, cell, frame, grid, registry, contract, answer-key role), A4 default, skill-owned options, `generateQuestionFor` | 09-19/20 |
| P4 | Operations content matches every skill's name (77 failing -> 0); "within N" bounds the answer; the content audit became a gate | 09-20 |
| P5 | 19 new ladder steps (591 codes); settings-code letters fixed and pinned | 09-20 |
| P6 | The 26 K-2 skills under the gate (189 total); the picture must match the answer; screen verbs banned on paper | 09-20 |

**Coverage.** 584 live skills in 35 categories. **189 pass the content gate** (operations 163,
K-2 26). **401 have never been audited.** **0 are fully migrated to the cell contract**: only 5
skills hand their cell to the kit (`q.cell`); P5 and P6 drew their black-and-white cells with
private inline helpers (`_wsCell`, `_kCell`), and every page is still assembled by the legacy
print path (`print-settings.js` `generateWorksheetFromSections` + ~250 `printFormat` branches in
`print-generate.js`). The online worksheet and the practice card import nothing from the kit.

## 2. What the review found

The plan on paper is sound: `SKILL_CELL_CONTRACT.md` §10.1 is a good ten-step checklist per
family. **The waves skipped half of it.** P4-P6 did steps 0, 3, 4 and 7 (research, generator
content, options, twins) and skipped 2, 5, 6, 8, 9 and 10 (templates, providers, screen, deleting
legacy branches, the compliance run, the two review gates). So every "done" family still prints
through the legacy path, and the owner's printout of 2026-09-24 shows what that path produces:

1. **The only gate reads question objects, never pages.** Nothing fails a build for a black blob,
   a half-empty page or a zone too small to draw in. The standard's page lints (L-INK, L-SPLIT,
   L-DENSITY, L-KEY ...) were specified and never built.
2. **Black-and-white is done by filters and colour swaps, not ink.** Print defaults to Colour;
   Grey is `filter: grayscale()`; `printVisualWrap` turns accent fills into `#000`. Result:
   place-value disks print as solid black discs hiding their "100", fraction bars as black slabs.
3. **Page assembly is legacy.** 20 items per section by default, a capacity table 3-5x the
   standard's ceilings, no rebalancing, "Part NN" headings with shadows chosen by guessing from
   skill ids, and a list answer key instead of the facsimile.
4. **Visuals are capped too small** (60 px / 50 px print caps) and **model zones are not sized to
   the model** ("Build 169 with disks" in three 25 mm zones).
5. **Two renderers for one skill.** Screen and paper disagree (stacked "Sub Facts" vs a small
   "12 ÷ 3 = ?" box); the online worksheet uses fonts that never load (serif fallback).
6. **Each wave adds a rendering path** (P5 `_wsCell`, P6 `_kCell`) instead of a registered
   template, so "types" multiply.
7. **CLAUDE.md steers agents down the legacy path** (per-skill print handlers, KaTeX/MathJax,
   `border-bottom:2px solid #333` blanks, a stale 572-code count).
8. **The owner never sees a wave's pages before it is called done.**

## 3. The waves from here

**Rule: no new family starts until the redone families print and display at 8 or better on
every criterion (`design/audit/RUBRIC.md`).** A family's content being right is necessary, not
sufficient.

### P7 · One renderer (foundation, print + screen)

| Step | What | Done when |
|---|---|---|
| P7.1 Ink | Sheets are always black / white / one grey: drop the Colour/Grey print option and the grayscale filter; accent fills become outline, grey `#949494` or hatch, never solid black > 7 mm; text inside a shape stays legible; remove the 60 / 50 px visual caps in favour of the standard's minimum sizes (§11.2) | L-INK green on every redone skill |
| P7.2 Page engine | `sheet/layout.js` (`resolveSectionLayout`, DN-20) and pagination (PG-20..25: no split cell, short last page rebalanced, continuation header); page roles as `plan()` composers that return a `PagePlan`; the facsimile key from the same plan; header / strand tab / "I Can" title / teacher footer; no "Part NN" | every role renders; L-SPLIT, L-DENSITY, L-KEY green |
| P7.3 Print dialog | Page type, size S/M/L, look Auto/I Can/Daily, paper, header fields, the "Fits:" line, a preview that is exactly what prints; the Print button prints (today its output sits under `.container { display:none }` in `@media print`) | a teacher can print every role from the dialog |
| P7.4 Screen parity | The practice card, the online worksheet and the quiz draw the kit cell (Andika, black on white, chrome outside); the online worksheet generates through `generateQuestionFor` (seeded, options honoured); the serif fallback goes | SP-1/SP-2 on every host |
| P7.5 Gates | `ws-print-lint` (automated L-INK, L-FONT, L-OVERFLOW, L-SPLIT, L-DENSITY, L-KEY, L-VERBS subset) as a ratchet; `ws-grade-render` + the independent critic (`design/audit/RUBRIC.md`); a per-wave owner contact sheet (one PDF page per skill) | gates run in one command |
| P7.6 Housekeeping | CLAUDE.md corrected (kit, not per-skill print handlers; live code count); catalogue and coverage regenerated each wave; `REDESIGN_GAP.md` retired (its colourful restyle contradicts screen parity) | docs agree with code |

### P8 · The redone families to 8+ (operations 163, K-2 26)

Contract §10.1 steps 2-9 for both families: `_wsCell` / `_kCell` promoted to registered
templates with providers (`strings`, `workedSteps`, `wrongAnswer` with named misconceptions),
legacy branches deleted, then the critic loop: every skill x every page type x the four screen
hosts, redesign whatever scores under 8 on any criterion, re-grade with a fresh critic.

### P9 onward · the remaining families, one per wave

Owner ruling 2026-09-24 (O-1): **P9 is F4 place value + rounding** — the worst pages of the
owner's printout, and the base the operations skills stand on. Then, in the order of
`PROBLEM_TYPES.md` §5: F3 time + money · F5 fractions / decimals · F6 geometry + measurement ·
F7 data · F8 algebra, order of operations, number theory, vocabulary.

### T · the teacher side (parallel track)

T1 clickable mockup approved by the owner -> T2 the teacher shell (left sidebar, calm
professional, no pupil game chrome) -> T3 each teacher screen migrated (send a skill set, print,
run practice first). The pupil side is unchanged.

## 4. Definition of done, per family (all ten, no skipping)

1. Research notes on the reference sites; content specification; owner questions asked and ruled.
2. Content gate (`ws-content-audit`) extended to the family and green.
3. Cells are registered kit templates; no private helpers; generators emit `q.cell`.
4. Providers registered: strings, worked steps, wrong answers with named misconceptions, footprint.
5. Screen: the same cell on every host, one input per slot, entry order, feedback outside the ink.
6. Twins merged by alias; share codes unchanged (`ws-code-snapshot`).
7. The family's legacy print branches deleted.
8. `ws-print-lint` green at S / M / L, both looks, every page type, print and key.
9. **Independent critic: every criterion >= 8 on every page type and every screen host.**
10. Owner contact sheet approved; code review + live browser QA; catalogue regenerated.

## 5. Open questions for the owner

| Id | Question |
|---|---|
| O-1 | **Ruled 2026-09-24:** place value + rounding is P9. The plan (P7 foundation, then P8 redone families to 8+, then a family per wave) was approved the same day. |
| O-2 | The many family-review questions still unruled (`design/catalogue/*.md`, `design/research/*.md` §19/§23) are asked at the start of each family's wave, not all at once. |
