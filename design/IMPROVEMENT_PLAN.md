# Improvement plan — faster building, a simple teacher site, truly mixed pages (2026-10-23)

Owner request (2026-10-23): "It's taking a long time to make these skills / sheets / site. Is there any other way or
process to make the skills faster while keeping the SAME high quality? … Also plan a streamlined rebuild of the teacher
site, which is too complicated and feels bloated and disorganised — no visual, colour or spatial hierarchy, and too many
steps to get where you want (to print, to send a code). I want it like an Apple product: 3–4 steps to get exactly what
you want. Also we need a fix design for mixed practice pages … identify the barriers to truly mixed practice pages for
print and design a fix. Integrate these improvements into our current plan."

This file is the plan for all three. It was built from three audits run on 2026-10-23 (the build history and gate
timings, the teacher site driven in a browser, and the print engine with a test render), and it is wired into
`MASTER_PLAN.md` (new Wave 0 and the changes to Waves 3–6) — see §4. Nothing in it lowers the quality bar: every
redone or new page still needs an independent critic score of **8 or more on every criterion, on every page type and
every screen host**, and the full gates still run before every deploy.

---

## 1. Building faster at the same quality

### 1.1 What the history shows (audit of 986 commits, 39 critic reports, the last deploy log)

| Finding | Number | What it means |
|---|---|---|
| Critic rounds to PASS | median ≈ 5; range 2–15 (WRM tagging Y2–Y3 15, Y4 13, R/Y1 12, number line 9, Y5 8, small fixes 7, search terms 6, answer-key options 5, detailed lessons 3–4) | Each round is a builder pass + fresh renders + a full critic: 1–2 h and a large share of the cost |
| Near misses | many FAILs had a mean of 7.92–7.96 | one 7 forces a full re-grade of every page |
| Defects that a machine could have measured | ≈ 95 % of defect mentions (viewport/scroll, untrue text, slot shape, clipping, lone item on a page, plain words, repeats, overlap, ink, paper ≠ screen, size S, wrong key) | judgment defects (pedagogy, clarity) are rare (≈ 2 %) |
| Critic findings that no gate covered until the critic found them | skip-count D12 lone states (4 rounds), number-line sticky-header scroll (3), false FULL verdicts (4, until TITLEREP / RANGECHECK were added at r14), WRM "How it looks" (3) | the rounds were spent discovering what a check could have caught |
| `LESSONS_LEARNED.md` checks still not built | L1 `--sizes`, L3 key-in-drawing, L6 instruction-follows-item, L10 answer cycles; L9, L11 by eye only | the "design it right the first time" file names checks nobody wrote |
| Escalations to Opus medium | 18, all after ≥ 3 failed low-effort rounds | the cheap first pass on new, hard work costs 2–3 extra rounds |
| Deploy gates, run one after another | ≈ 80 min; four gates are 80 % of it (screen-slots 22, chromebook-fit 17.5, teacher-wrm 12 + 12) | |
| Documents an agent reads | ≈ 740 KB (≈ 185 k tokens): WORKSHEET_DESIGN_STANDARD 151 KB, PAGE_TYPES 186 KB, PEDAGOGY 131 KB, SKILL_CELL_CONTRACT 129 KB, STATUS 89 KB | every builder and critic pays this before working |
| Merge overhead | 152 merge commits, 57 STATUS commits, 24 stamp commits, 10 conflict fixes | STATUS.md and the index.html cache-bust stamp collide on almost every merge |
| Template leverage | 9 new kit templates (shape-grid 22, bar-model 17, data-table 16, picture-row 15, measure-scale 13, graph-axes 12, angle-kit 11, solid-kit 11, coord-grid 8) unlock 125 of the 277 build-list entries (45 %) | building skill by skill repeats the hard part (the drawing) |
| Presets | 114 named skills made in two builder runs, because the generators already existed | when the drawing exists, new skills are cheap |

### 1.2 The improvement proposal (2026-10-19), audited

| # | Proposal | Verdict | Evidence / change |
|---|---|---|---|
| 1 | Turn every critic finding class into an automatic pre-critic check | **KEEP — do first** | 95 % of defects were measurable. Add a **backtest**: a new check is done when it fails the historical commits that the critic failed for that class |
| 2 | Build by family / template, not by skill | **KEEP** | the 9 templates above unlock 45 % of the list; after a template passes, its skills and options are data entries + presets |
| 3 | One approved model page per family; later skills reviewed as a contact-sheet batch | **MODIFY** | approve one model **per family AND per page role** (the role backlog — Model, Guided, the Practice/Quiz papers — is larger than the cell backlog); review later skills on a contact sheet, and send the critic only pages whose render changed (golden-image diff) |
| 4 | Medium effort for the first build of a new family/template, low for copying a proven pattern | **KEEP** (needs the owner's agent rule changed) | all 18 escalations came after ≥ 3 wasted low rounds |
| 5 | Targeted checks while building; full gates at deploy in parallel streams (~25 min) | **MODIFY** | pairing the browser gates gives ≈ 42 min; 25 min also needs sharding screen-slots and chromebook-fit by category. Nothing is skipped at deploy |
| 6 | All owner questions asked at the start of a batch | **KEEP + formalise** | as a one-page **spec card** the owner signs before the build (late answers cost the WRM page and skip-count lanes rounds) |
| 7 | Fewer lanes at once, each owning its files | **KEEP + extend** | per-lane status files instead of one shared STATUS.md; the index.html stamp only in the deploy step |

Added by the audit:

| # | New measure | Why |
|---|---|---|
| 8 | **Spec card per skill / family** — generated from `build-specs.js` + the exact rules that apply (rule ids + text excerpts), the owner rulings, the capacity rows and the gates to run; 3–5 KB | builders and critics read 3–5 KB instead of 740 KB, and they read the RIGHT rules |
| 9 | **Lint without a browser** — run the pure kit under node and lint generator output and cell markup (L3, L6, L10, text ≠ generator, answer cycles, slot widths) in seconds | today most checks need a browser and minutes |
| 10 | **Near-miss re-check** — when a FAIL's mean is ≥ 7.9, the next round re-checks the failed items, every page whose render changed, and a fresh random sample; pixel-identical pages keep their score | same bar (every page ≥ 8 on the final pass), far less re-grading |
| 11 | **Builder report = gate output** — a builder cannot report "done" without pasting the `ws-precritic` output; the orchestrator rejects reports without it | stops self-grades of 8 that critics mark 5–6 (L9) |
| 12 | **Metrics** — rounds-to-PASS, hours and findings per class per lane in `design/status/metrics.md` | so the next audit has numbers, and a rising class becomes the next check |

### 1.3 Implementation (Wave 0, before any new family)

| Step | Work | Files | Done when |
|---|---|---|---|
| S1 | **`ws-precritic`**: one command a builder runs for the skills / pages it touched (`--skill`, `--family`, `--role`) that runs the node lints + targeted browser gates and prints one PASS/FAIL table | `tests/scripts/ws-precritic.cjs` (new), wraps existing gates | a builder report pastes its table; the orchestrator refuses a report without it |
| S2 | **The missing checks**: L1 sizes (S fits more than L, drawings scale), L3 key value never inside the question drawing, L6 instruction / steps / Say line mention only the item's own numbers and task, L10 answer position and value vary with no cycle over 30 items, **lone item / lone state on a page**, **repeat lines / repeated problems on a page or across a packet**, text ≠ generator (claims about counts, kinds, ranges measured against 300 seeded items), Chromebook viewport (answer box + Check reachable at 1366 × 768), plus `--skill` / `--grade` on `ws-teacher-wrm` | `ws-print-lint.cjs` rules, `ws-providers-unit.mjs`, new `ws-node-lint.mjs` (no browser), `ws-teacher-wrm.cjs` | **backtest**: each check FAILS on the commit the critic failed for that class (e.g. skip-count D12 at 359802c5, number line R7, WRM M12 at ca3b3c5c) and PASSES on the fix |
| S3 | **Spec cards** | `tests/scripts/ws-spec-card.mjs` (new) → `design/cards/<family>/<id>.md`; an index of rule ids in the four standards so excerpts are exact | a builder brief = card + LESSONS_LEARNED; agents no longer read the full standards unless the card says so |
| S4 | **Golden renders + contact sheets**: `ws-grade-render` writes a hash manifest per page; a diff lists changed pages; a contact sheet (one page per skill, S and L, + key) per batch | `ws-grade-render.cjs`, `design/audit/golden/<family>/manifest.json` | the critic brief lists only changed pages + the sample; unchanged pages keep their recorded score |
| S5 | **Parallel, sharded deploy gates**: node gates in parallel; browser gates two at a time, screen-slots and chromebook-fit split by category into the two slots | `tests/scripts/ws-deploy-gates.sh` (new; replaces the hand-made runner) | full run ≤ 30 min on the current machine, same gates, nothing skipped |
| S6 | **Merge hygiene**: per-lane status files `design/status/<lane>.md` + a generated `STATUS.md` index; lanes never run `ws-stamp-assets` (only the deploy step does) | `design/status/`, `tests/scripts/ws-status-index.mjs` | no STATUS or stamp conflicts in a week of lanes |
| S7 | **Process rules into CLAUDE.md / LESSONS_LEARNED** (after the owner approves): template-first build order; one model per family per role; contact-sheet batch critic; near-miss re-check; spec card signed at batch start; first build of a new family at Opus medium; builder report = precritic output; metrics | `CLAUDE.md`, `design/audit/LESSONS_LEARNED.md`, `design/audit/RUBRIC.md` (re-check rule) | rules recorded; next lane briefs use them |

Expected effect (to be measured by S12 metrics): median rounds to PASS 5 → 2; deploy gates 80 → ≤ 30 min; builder
context per brief ≈ 185 k → ≈ 10 k tokens; new skills on an existing template in one run (as the presets were).

### 1.4 New build order for the skill backlog (replaces "family per wave" order inside Waves 5–6)

1. Templates by leverage: shape-grid → bar-model → data-table → picture-row → measure-scale → graph-axes → angle-kit →
   solid-kit → coord-grid (125 entries), plus `long-multiplication` (finishes `mult_standard` 4 × 1 and 3 × 2 and
   `long_mult`) and the carry-under-the-line option on `stack` (`design/audit/runs/next-session/CARRY-BELOW-SPEC.md`).
2. For each template: the owner signs the spec card → one model skill built at Opus medium → full critic on every role
   → golden renders saved → the template's other entries + presets built at Opus low as data → contact-sheet critic.
3. WRM / CCSS order (early units first) decides the order of entries *within* a template, and overdue lessons
   (`Lessons_To_Build_K-5_2026-27.xlsx`) pull their templates forward.

---

## 2. A simple teacher site (rebuild plan)

(see §2 below — written from the 2026-10-23 teacher-site audit)

---

## 3. Truly mixed practice pages

### 3.1 What prints today (test render 2026-10-23)

Four skills (add within 20, identify fractions, time to the hour, subtract within 20) on "Mixed practice" print as
**one band per skill**: Addition 4 across, Fractions 2 across, Time 2 across; the fourth skill spills to page 2,
leaving page 1 with 8 problems and ≈ 12 % empty at the bottom. The fraction band even holds two different tasks under
one instruction ("Write the fraction, or circle the model that shows it"). That is section practice, not mixed
practice.

### 3.2 The barriers (most severe first)

| # | Barrier | Where |
|---|---|---|
| B1 | **Skills are dealt in blocks on purpose** — `dealSkills()` places items "grouped in the order the teacher listed them (DN-34: one type per run, never silently mixed)"; every multi-skill section uses it | `js/modules/print-sheet.js:192-206`, `:562`; `WORKSHEET_DESIGN_STANDARD.md` DN-34 (allows "deliberately mixed", but the engine has no way to ask) |
| B2 | **The only packer is GROUPED** — one shelf per skill, each with its own band strip and its own column count and height. SHUFFLED is specified (`PAGE_TYPES.md` PT-MIX-1…9: 2 × 2 blocks, runs ≤ 2, one sheet instruction, in-cell cues) but "not built yet" | `js/modules/sheet/roles/mixed-practice.js:3-20, 53-80` |
| B3 | **Instructions live on the section, not the cell** — BD-10 strips the instruction from a cell when the section line says it; a mixed page needs a short cue in each cell, and no provider supplies one | `print-sheet.js:1190-1192, 1324-1332`; PT-MIX-5 |
| B4 | **One column count and cell height per section** — no shared unit lattice and no span classes; `footprint.span` is specified but no role reads it | `sheet/layout.js` (`resolveSectionLayout`, `cellWidthMm`, `bodyHeightMm`); `PAGE_TYPES.md:256`; `SKILL_CELL_CONTRACT.md:1403` |
| B5 | **Legacy-wrapped skills are sized by measuring** — their unit size is unknown before packing | `print-sheet.js:1247` |
| B6 | **Frame and key** — footer lists skill ids, not names; a mixed Independent page's tab reads "Lesson 1"; the key's skill-to-item map is only implicit | `sheet/frame.js`, roles |
| B7 | **Pages spill and leave space** — a shelf never splits (PT-MIX-9), so a whole skill moves to page 2 | `mixed-practice.js` |
| B8 | **No host interleaves** — the online worksheet follows section order; the quiz has only a manual per-section shuffle; mixed play deals at random but never by rule | `worksheet.js`, `quiz-builder.js:845, 1359` |
| B9 | **No teacher control** — "Mixed practice" has no Grouped / Mixed together choice, though PT-MIX lists "arrangement" | `teacher-print.js:57, 88` |

Not barriers: per-skill options and state already travel with each skill (`generateQuestionFor` restores state), and
seeds are per item, so a mixed order is reproducible.

### 3.3 The design

- **One option on the Practice and Quiz papers** (`LESSON_LIBRARY_PLAN.md` §8e — mixed is an option of Practice, not a
  separate paper): when a paper has two or more skills, **"Problems: Grouped by skill / Mixed together"**. Request field
  `arrangement: 'grouped' | 'mixed'`, normalised beside `mixedLattice`, carried in share and settings codes as a new
  appended flag; old codes decode as grouped.
- **Dealing — `interleave(items, weights, seed)`** (pure, in the kit): weighted round-robin, counts within 1 of the
  weights, no more than 2 of one skill in a row (PT-MIX-6), each skill first seen in the first third of the page, order
  from the seed. `dealSkills` stays the default, so single-skill pages keep DN-34.
- **Unit footprints** — every cell has a unit class 1 × 1, 2 × 1, 1 × 2, 2 × 2 or 4 × 1 from its provider's
  `footprint.span`; where none is declared, the measured cell is rounded up to units at the page's N (legacy cells are
  measured first, then classed). Footprints are cached per skill + options + size.
- **Packing — PT-MIX-5 as written**: strips two units high built from 2 × 2 blocks, the packer takes the next item in the
  interleaved queue that fits the open block (so the order stays interleaved, never sorted by size), a final row of
  height-1 cells, word problems as a closing band. Rows take their tallest unit; content never shrinks; every cell
  keeps ≥ 40 % free; if a page cannot meet that it takes one problem fewer. A strip never splits; the last page is
  rebalanced.
- **In-cell cue** — providers gain `strings.cue`: a 1–4 word instruction from the instruction library ("Add.",
  "Write the time.", "Shade 2/8."), printed beside the problem number at cell-text size, within the PT-MIX-5 width.
  The sheet line is "Solve." (`default-solve`). Computation cells may omit the cue. Fallback for skills without a cue:
  the library instruction shortened by rule; the lint lists every skill still on the fallback.
- **Frame and key** — title "Mixed practice" (fixed title, HD-13) with the skills named in plain words under it (up to
  four, then "and N more"); tab "Level a–b · Mixed n"; footer: skill names + CCSS codes; numbering PT-MIX-7 (strip,
  block, inside the block); no skill letters in cells; the key adds a legend ("1 Add · 2 Time · 3 Fractions …").
- **Screen parity** — the online worksheet and the quiz call the same `interleave()` when the arrangement is mixed; the
  quiz "shuffle" switch maps to it; the practice card already plays one item at a time.
- **Pedagogy** — mixing is for review of taught skills: "Mixed together" is the default on mixed review / quiz papers
  of two or more taught skills and never on a lesson's practice part; a skill still at Guided level stays grouped (its
  first mixed exposure is a discrimination step, PEDAGOGY P-11). The dialog shows the achieved mix against the
  requested weights and the "Fits:" line (PT-MIX-8).
- **Teacher steps** — inside the simple teacher site (§2): pick skills → Make a worksheet → Print. The arrangement
  defaults by the rule above; it is one switch under "More options".

### 3.4 Gates that prove it

- `ws-print-lint` mixed rules: no run of one skill longer than 2; each skill's count within 1 of its weight; every
  non-computation cell has a cue; no cell below its minimum footprint; ≥ 40 % free; vertical rules on the lattice; no
  page under-filled while items remain.
- `interleave()` deterministic self-test (node); `ws-code-snapshot` (old codes decode as grouped).
- Critic case: `ws-grade-render --set` with four different skill families at S / M / L + keys + the online worksheet and
  quiz, ≥ 8 on every criterion.

### 3.5 Phases

| Phase | Work | Size |
|---|---|---|
| M1 | `interleave()` + self-test; `arrangement` field and code flag; a quick win: mixed order inside today's packer for skills of the same unit class | 1 day |
| M2 | Unit footprints (incl. measured legacy cells) + the 2 × 2 block packer + numbering + rebalanced last page | 3–4 days |
| M3 | `strings.cue` across the families (fallback rule first, then real cues family by family) + the in-cell cue render + lint | 2–3 days |
| M4 | Frame subtitle, readable footer, key legend, teacher switch, achieved-mix preview | 1–2 days |
| M5 | Online worksheet and quiz parity; critic to ≥ 8 | 2–3 days |

---

## 4. How this fits the current plan

(see §4 below)
