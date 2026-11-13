# Part options — "which supports, and how many", per lesson part and per paper (lane lf-partopts)

Status: **APPROVED 2026-11-12 (owner, via the lead). Building step A.**
Owner request (2026-11-12): "on the lesson pages can these too be customizable so for each part we can decide which
types of supports are included or not? Like in the practice/quiz pages as well? ... and for how many of the problems as
well." Approved to build: "OK lets build this" (after this design is signed).

Mock-ups (static HTML, rendered with Playwright at device scale 1): `mock-lesson-desktop.png`,
`mock-lesson-mobile.png`, `mock-quiz-supports.png`, source `mock.html`.

---

## 0. What the teacher gets, in one paragraph

Every part of a lesson (Prerequisite Check, Anchor chart, Vocabulary, Remember, We Do, the lesson sheet's own practice
rows, Practice pages, Mixed page) gets **one settings row**: a tick to print it (exists today as data, not on screen),
a **How many** stepper that only offers numbers that fit the page, and a **Supports** summary that opens into tick
boxes, grouped *Structure* (the frame the pupil writes into) and *Hints* (help that fades). The ticks start at the
standard fade (PAGE_TYPES §1.7) so a teacher who changes nothing prints exactly today's packet. Unticking a support
that the step teaches with shows one plain warning line and still prints. The answer key, the on-screen practice card,
the online worksheet and the quiz all use the same values. The settings are saved with the set and travel in share
codes. Practice and Quiz papers get the same **Supports** row (How many exists there already).

## 1. Where it sits (UI)

### 1.1 Lesson — the Print screen's Lesson section (`teacher-print.js`, `sectionHTML`, role `lesson`)

Today the Lesson section shows "Practice pages 0–5" and "Mixed practice page". These two controls are replaced by a
**Parts** table (the two old controls become the Practice row's pages stepper and the Mixed row's tick, so nothing is
lost and old saved sections map 1:1).

| Column | Control | Notes |
|---|---|---|
| Print | check box | default: every part the lesson has (today's packet). A part the lesson lacks is not listed. |
| Part | name | Prerequisite Check · Anchor chart · Vocabulary · Remember · We Do · Lesson practice rows · Practice · Mixed |
| How many | stepper (− n +) with the allowed range under it, e.g. "2 to 4" | only the values in §3; a value the size cannot fit is never offered (no "it will not fit" after the fact) |
| Supports | summary chip ("Standard: hints and structure" / "Custom: 2 off") that opens the tick boxes | §2; a part with nothing to choose shows "None to choose" (Remember) |
| New numbers | icon button | the existing per-part seed (`lessonPartSeed`, LR-18), now on screen |

Under the table: **"Reset all parts to the standard"** (a link, shown only when something differs).

Supports panel (opens under its row, one at a time):

- **Structure** — tick boxes for the structural supports the skill declares (digit grid, regroup boxes, place-value
  letters, answer frame, word bank, ten-frame outline, equation frame …). Default: all on, on every part, as
  PEDAGOGY_STANDARD says. On Quiz / Prerequisite Check this is the existing "keep structural supports" (PT-DLG-11),
  now itemised.
- **Hints** — tick boxes for the hint supports (traced first answer, dot tiles / touch dots, captions, first-step cue,
  number line, think box …) and, on parts that draw them, the page bands **Steps strip** and **Say band**.
  Default: the fade for that part (§2.3).
- **Which problems get the hints** — the existing `cover` control (every problem / only those that need it / fade down
  the page), shown only once a hint is ticked, as today.
- A warning line when a ticked-off support is one the step depends on (§2.4). It never disables Print.

### 1.2 Phone, 390 px

The table becomes one card per part: line 1 = tick + part name + New numbers; line 2 = How many stepper (44 px
targets) + range; line 3 = Supports chip, full width, opening the panel as an in-card accordion (no modal, no
horizontal scroll). Mock: `mock-lesson-mobile.png`.

### 1.3 Practice and Quiz papers (`teacher-sheet.js`, the Teacher 2.0 Worksheet and Quiz sheets)

How many already exists there (per skill, `teacher-plan.js`). Added: a **Supports** row in each skill's row of the
sheet, the same chip and panel as §1.1, defaulting to the paper's level (Practice: structure + first-cell cue;
Quiz: structure only, no hints). The values are written into **the skill's own options** (§2.2), so they go with the
skill to the on-screen practice card, the online worksheet and the quiz, and into its share code. Mock:
`mock-quiz-supports.png`.

### 1.4 On screen (pupil)

No new pupil controls. The practice card, the online worksheet and the quiz draw the cell with the same option values
(`screen-cell.js` already draws the print cell); a lesson played on screen reads the same part settings.

## 2. Supports — how they are declared, resolved and drawn

### 2.1 What exists today (measured on master, 725 live skills)

| Mechanism | Where | Skills | What it controls |
|---|---|---|---|
| `level` (support level 3/2/1/0, a set → fade) | `UNIVERSAL_OPTIONS`, every skill | 725 | how much hint a cell prints; structure stays |
| S2 `support` set (render-time supports) | `supportsOptions`, provider `supports` / `FAMILY_SUPPORTS` | 25 (set) + 38 (older one-value `support` enums) | touch dots, dot tiles, ten frames, number line, skip strip, array, think box, sign box, start arrow, step checklist, rounding panes |
| other `group: 'support'` options | per family | 181 skills in all have at least one | word-problem cues / word bank / bar (`wpCues` `wpBank` `wpBar`, 55), pictures (18), answer frame, tick labels, midpoint label, ten-times values … |
| supports drawn by the ROLE from `scaffoldLevel` | `sheet/roles/*`, `lesson-pages/*`, cell templates | all | traced first answer, first-step cue, captions, dot cue in the Guided cell, Steps strip, Say band, digit grid, regroup boxes, place-value letters |
| PT-DLG-10 "Individual supports" checklist | PAGE_TYPES only | **not built** | — |

So a teacher can already turn many hints on (S2) but cannot turn the **role-drawn** supports off one by one, and has
no per-part control at all. 498 skills declare no support option of their own (only `level`).

### 2.2 The model (one declaration, read everywhere)

1. **The skill declares what it can draw.** A provider gains `supportsDrawn`: a list of
   `{ id, kind: 'structural' | 'hint', label, from }` where `from` is either an existing option
   (`{ option: 'wpBank' }`, `{ option: 'support', value: 'tile' }`) or `'role'` (drawn by the role/template from the
   level: `traced`, `firstcue`, `captions`, `digitgrid`, `regroup`, `pvletters`, `frame`). Families get a default list
   in `providers/util.js` (as `FAMILY_SUPPORTS` today); a skill overrides. Optional `needs: [ids]` names the supports
   the step teaches with (§2.4).
2. **One new universal hidden option `off`** (a set of support ids turned off; default empty, so every existing code,
   saved set and quiz is unchanged). Templates and roles read `ctx.off` and skip those marks. This is what makes the
   role-drawn supports switchable **as skill option values**, not page hacks. Hints that already have an option
   (`support`, `wpBank` …) are switched through that option, not through `off`.
3. **A page part never invents a support.** The part row writes option values (`level`, `support`, `cover`, the
   family's own support options, `off`) as a **per-part delta on top of the skill's options**. For Practice / Quiz
   papers the delta is written straight into the skill's opts (the paper has one part).
4. **Page bands** (Steps strip, Say band, Remember, Vocabulary) are part anatomy, not cell supports: they are part
   settings (`bands`), declared by the lesson part registry (`lesson-pages/index.js`), as the Say band already is
   (PT-DLG-29).

`resolveSupports(decl, roleLevel, delta) → { level, opts, off, bands }` (new pure module `sheet/part-opts.js`, SCC-01)
is the only place the defaults and the delta meet. The pupil page, its key and the screen cell all call it.

### 2.3 Defaults per part (the PAGE_TYPES fade, unchanged)

| Part | Level | Structure | Hints on by default |
|---|---|---|---|
| Prerequisite Check | 0 | all | none |
| Anchor chart | 3 | all | all (traced, steps, captions), Steps + Say bands |
| Vocabulary / Remember | — | — | bands only |
| We Do | 2 (cell 1 at 3, PT-GDP-1) | all | the step's level-2 hints, Steps strip |
| Lesson practice rows | 1 | all | level-1 cue in the first cell |
| Practice pages | 1 | all | level-1 cue in the first cell of each page |
| Mixed | 1 | all | level-1 cue in the first cell of each section |
| Practice paper | the skill's `level` (default 1) | all | as the skill's options say |
| Quiz paper | 0 | all ("keep structural supports" on) | none ("hints on tests" off) |

### 2.4 Guardrails

- **Warning, never a block.** `needs` lists the supports a step depends on (e.g. regroup boxes on "add with
  regrouping", place-value letters on the place-value ladder's first step). Unticking one shows: "This step teaches with
  the regroup boxes. Without them, pupils must hold the carried ten in their head." (one line, from the instruction
  library, PEDAGOGY_STANDARD wording rules). Turning *every* structure off on a lesson part shows "No structure left:
  the cell is the problem and the answer slot only."
- **At most 2 scaffold types per Guided cell** (PT-OPN-8) still holds: ticking a third hint on We Do shows the existing
  clash rule (`mix`: section / problem) instead of drawing three.
- **The key follows**: the key renders from the same PagePlan with the same resolved values (facsimile key).
- **Nothing given away**: a hint never fills an answer slot (PT-SCR-6); the sampler checks every combination (§5).

## 3. How many — the per-part range

The range is computed, never hand-typed: `partLimits(part, skill, opts, size) → { min, max, dflt, step }` (pure, in
`sheet/part-opts.js`), using the part's own planner (the same fit the page already does). The stepper offers only
`min … max` in `step`s.

| Part | Default | Min | Max | Step | Rule |
|---|---|---|---|---|---|
| Prerequisite Check | the lesson's 3–4 | 1 | the lesson's prereqs (3–4) | 1 | below 3 warns: "Only the printed prerequisites are routed" (§8b keeps 3–4 as the lesson's data) |
| Anchor chart, worked examples | the chart's designed count | 1 | the chart's designed count (1–2) | 1 | a chart never grows past its design |
| Vocabulary words | the lesson's (≤ 3) | 0 (= band off) | 3 (PT-OPN-5) | 1 | 2 when 3 do not fit unhyphenated |
| We Do cells | auto (fit, 2–4) | 1 (warns "2 cells let the hint fade") | the fit, ≤ 4 (PT-OPN-6) | 1 | |
| Lesson practice rows | auto | 0 | the fit, ≤ 2 rows (PT-OPN-7) | 1 row | 0 drops the Score line (PT-FRM-4) |
| Practice page, problems per page | the page's fit (today) | the fewest **whole rows** whose cells, grown to fill, stay under the growth cap (H13 / EB-PAGE) | the fit | one row (= columns) | pages 0–5 stays a separate stepper |
| Mixed page | today's | as Practice | as Practice | one row | |
| Practice / Quiz papers | unchanged (`teacher-plan.js`) | unchanged | unchanged | | |

Because min and max come from the planner at the chosen size and options, **no offered value can overflow or leave a
near-empty band**: an empty page is impossible (min ≥ 1 row), a too-full page is never offered.

## 4. Data model, saved sets, share codes

```js
// a Lesson section (teacher-print.js), additive; absent = today's packet
section.partOpts = {
  prereq:  { on: true, n: 3 },
  chart:   { n: 1, bands: { say: false } },
  vocab:   { n: 2 },
  wedo:    { n: 3, opts: { off: ['traced'], support: ['tile'] } },   // a delta on the skill's options
  rows:    { n: 1 },
  practice:{ on: true, pages: 2, n: 12, opts: { level: [1, 0] } },
  mixed:   { on: false },
};
```

- Only values that differ from the default are stored (the `packOptions` rule), so a default lesson stores nothing.
- `section.pages` / `section.mixed` / `section.parts` keep working and are read into `partOpts` on load (old saved
  sets open unchanged); new saves write both while `pages`/`mixed` exist.
- **Saved sets**: `partOpts` is saved verbatim in the set JSON (additive field).
- **Share codes** (append-only): the skill part of a code already carries option deltas through
  `skill-option-codec.js`; `off` gets new codec keys appended to the union table (never re-ordering). Per-part lesson
  settings ride in one new suffix token family appended after the existing settings tokens (`P<part letter><fields>`,
  letter reserved after a check against every token in `skill-codes.js`; old decoders ignore an unknown token — their
  `switch` has no default branch). A default lesson writes no `P` token, so **every pinned code is byte-identical** and
  `ws-code-snapshot` stays green; the count can only rise.
- Practice / Quiz: nothing new to encode beyond `off` — the values are skill options.

## 5. Checks

| Id | Check | Gate |
|---|---|---|
| PO-1 | **Default identity**: `ws-lesson-baseline --all-lessons --check` 0 differences; every passed lesson's `ws-detailed-lesson --check` and `--repeats` green; `ws-code-snapshot` green; `ws-boot-smoke` OK | every build step |
| PO-2 | **Limits unit** (`ws-partopts-unit.mjs`): for every live lesson × part × size S/M/L, every value `min…max` builds with `fits` true, no split cell, and passes EB-BAND / EB-PAGE / EB-SIDE; `min-1` and `max+1` are not offered | precritic |
| PO-3 | **Combinatorial sampler** (`ws-partopts-sample.mjs`): per skill with declarations, all-pairs coverage of its support ticks × count {min, default, max} × size, seeded and deterministic (the content-audit rule). Each render: overflow (fits), empty band (ws-empty-band rules), **nothing given away** (no answer string in pupil-page ink outside a traced cell; reuses the FIX-WORDS / slot scan), **key parity** (same items, same supports), **paper = screen** (screen-cell DOM carries the same support marks) | precritic |
| PO-4 | **Codec round trip**: every `partOpts` / `off` value encodes and decodes to itself; unknown-token tolerance on the old decoder | unit |
| PO-5 | **Declaration check** (extends `ws-supports-unit`): every `supportsDrawn` id is drawn by the template it names (render with it on and off → the DOM differs), every `needs` id is declared | precritic |

The critic grades the **defaults** (unchanged pages — they are already graded) plus the **settings rows themselves**
(teacher-screen criteria, desktop and 390 px) and a small fixed sample of non-default pages (one per part kind). The
non-default combinations are machine-gated by PO-2/PO-3, not hand-graded. Each critic finding becomes a check in
`CHECKS_FROM_CRITICS.md`, as usual.

## 6. Order and cost

| Step | What | Builder | Est. cost |
|---|---|---|---|
| A | `sheet/part-opts.js` (`partLimits`, `resolveSupports`), `partOpts` on the lesson request; How many on every lesson part; Parts table UI (desktop + 390 px); saved-set field; PO-1, PO-2, PO-4 | medium (first build of a new tool) | $30–40 (≈ 1.1–1.4 %) |
| B | `off` option + codec keys; `supportsDrawn` for the templates that already draw role supports (stack, fact, equation, the lesson Guided cells), Supports panel on lesson parts and on Practice / Quiz papers; warnings; PO-3, PO-5 | medium | $40–55 (≈ 1.4–2.0 %) |
| C | Critic round (screens + sample) and fixes | critic medium | $15–25 per round (≈ 0.5–0.9 %) |
| D | Gap list: family defaults of `supportsDrawn` for the 498 skills with no support option of their own — one family per lane, folded into each family's existing redesign lane (not this lane) | family lanes | per family |

Total for this lane (A–C, one fix round): **≈ $85–120 (≈ 3–4.3 % of the weekly limit)**. A ships on its own (How many
everywhere) before B starts.

**Detailed lessons** (`lessons/detailed/*`, 7 live, hand-tuned packs): they get How many and Supports only where their
pack declares the part's range (a `partLimits` entry in the lesson file); until then their rows show the standard and
"Fixed in this lesson". This keeps every passed lesson's `ws-detailed-lesson --check` green.

## 7. Owner answers (2026-11-12, via the lead)

1. The Prerequisite Check may print fewer than 3 questions, with a warning (min 1).
2. Choices are per lesson only; there is no "remember my choices" default.
3. Quiz hints are offered under "Hints", off by default.

Build order approved: A (How many everywhere, Parts UI, PO-1/2/4) → one critic round → B (supports, `off`, panel,
PO-3/5). Caps: $70 for A and its critic; $55 for B after A passes.

## 8. Amendment after critic A r1 (lead, delegated approval, 2026-11-13)

The planners size counts to fill the page, so a lower count left the sheet's foot blank (critic F1), and avoiding that
fixed almost every count (F2). Resolved:

- **(a) Practice / Mixed: How many is the TOTAL** number of problems, offered in whole rows; the pages re-paginate and the
  last page is rebalanced. A count that would leave any page under half used is rounded to the nearest one that does not,
  with a note ("Rounded to 24 so no page is under half full").
- **(b) Lesson sheet: freed height goes back to the page.** Turning Vocabulary, Remember or We Do down gives its height
  to more Independent rows, then to roomier cells up to the growth cap. A value that still cannot fill the page is not
  offered.
- **(c) We Do re-flows** to fewer, wider cells where the step's ink allows, instead of a fixed floor.
- Every page, including each sheet's last, is judged on its own, with parts changed together (F12).
- **(d) The offer gate and its tuned thresholds (fix round 3b, 2026-11-13).** `roles/lesson.js sheetOffers` offers a value only
  where the sheet it plans passes the unit gate's own predicates, shared from `sheet/part-opts.js`: `rowFits` (EB-ROWFIT: no
  rows while the foot holds one row and its head), `bandFails` (EB-BAND, the 30 % of `ws-empty-band`; PO-4 checks the two agree)
  and `shortestRowMm` (the row's height). The planner sees planned figures, the gate sees printed ones; the three margins between
  them are measured, not guessed. The sweep: 25 lessons x M / L x 12 part settings (600 sheets, built as asked, printed in print
  media and measured as the unit gate measures them).
  - **`SHEET_FILL_MIN` 0.76** (`roles/lesson.js`). The planner's used share reads fuller than the printed page: gap -0.004 to
    0.064, median 0.029, p95 0.045; within reach of the floor (planned 0.72-0.80) at most **0.052** (placevalue:identify M We Do
    off: planned 0.797, printed 0.745). So the floor is at least 0.70 + 0.052 = 0.752, rounded up to 0.76. Above it, the lowest
    planned sheet that prints well is add_wp_10_plain L Vocabulary off + rows 0 (planned 0.762, 24 % empty), so the floor is at
    most 0.762. The highest-planned sheet that prints a 30 % foot is add_facts M Vocabulary off (planned 0.712, 31 % empty). No
    swept sheet planned 0.713-0.718 prints a 30 % foot, so the critic r2 note ("0.72 printed a 30 % foot") is kept as the
    floor's reason, not as a measured case. Backtest **FILL-BT**: 0.75 and 0.77 both FAIL.
  - **`ROWFIT_SLACK_MM` 12 mm** (`part-opts.js`). The printed foot reads 1.5-15.9 mm (median 7.9, p95 10.9) more than the
    planner's free height. The A4 body prints 239 mm where the plan budgets 232 at M, and bands print a little shorter than
    planned. The planner's row, with its two-line head, is never shorter than the printed one. The decision gap is the plan's
    `row - free` on a sheet with no rows. Wherever a row fits in print it is at most **10.2 mm** (placevalue:expand L Remember
    off: 21.7 / 31.9 planned, 31.1 mm printed foot >= 29.4 row). Where no row fits it starts at 3.7 mm (placevalue:value L
    Remember off + rows 0). The two overlap, so the margin takes the safe side: a value refused, never a blank foot. It is
    10.2 rounded up with headroom, under the 13.2 mm of placevalue:value L rows 0, whose printed foot (33.2 mm) holds no
    47.1 mm row. Backtest **ROWFIT-BT**: 10 mm and 14 mm both FAIL.
    *Deploy merge 2026-11-13:* master's lesson sheets moved that pair (expand L Remember off 10.2 -> 15.9 mm, its foot no
    longer holds a row; value L rows 0 13.2 -> 26.4 mm). ROWFIT-BT is re-pinned on a 672-state sweep of the merged tree to
    placevalue:value M We Do 1 (11.4 mm, foot 35.0 >= 33.7 row, no rows) and placevalue:combine L rows 0 (13.5 mm, foot 28.5 <
    29.4). The same sweep shows one no-rows sheet whose foot holds a row at 12.4 mm (placevalue:identify L We Do off, foot 68.9
    >= 64.8): over the 12 mm margin, so the safe-side claim above needs the lane to re-check the margin on master's sheets.
  - **`BAND_SLACK_MM` 2 mm** (`part-opts.js`, new in 3b). A planned cell's band is its height less the bridge's measured
    needed height (`measured[c].neededMm`: its lowest ink plus its bottom padding, read with `measureCells`' own ink rule).
    Near the 30 % line it reads up to 1.0 mm narrower than the printed band (div_facts M Vocabulary + Remember off: planned
    24.6 / 6.6 mm = 26.8 %, printed 24.2 / 7.6 = 31.4 %). Over all 802 We Do cells the gap is larger only on cells far under the line
    (word stories, 5.8 mm at 5-15 %). Rounding cells are not predicted: their We Do render adds the chart's number line, which
    the measured cell has not. At 1-2.5 mm the sweep misses no failing changed sheet and refuses no good one. At 0 mm it misses
    the div_facts sheet above. From 3 mm, div_facts M We Do 1 (printed 27 %) is refused. Backtest **BAND-BT**: the must-flag sheet needs
    >= 0.8 mm and the must-keep one < 2.6 mm, so 0 mm and 3 mm both FAIL.
  - **EB-ROWFIT reads the rows' own problems.** Up to r3 the unit gate took the shortest of ALL the lesson sheet's items,
    Warm-up included. placevalue:identify's 30.5 mm Warm-up cells read as a 36.5 mm row, where its rows (the main pool's
    level-1 twins, `res.lesson.teach.indepH`) are 49.3 mm, 55.3 mm with the head. Its "no room" is true (37.8 / 45.7 / 52.4 mm
    feet), and its 11 r3 failures were the check's. The identify M standard sheet (16 % foot, no rows) is a master state,
    routed to **lf-engine**. EB-ROWFIT excuses a sheet identical to the standard packet's. PO-NOROOM still judges that sheet's
    text, which is no print. Where a row would fit on the standard sheet, the text says "Not added: the standard sheet is kept",
    never "no room".

### 8d follow-up (critic A r3)

- **The FILL-BT `add_facts` assertion pins nothing (critic caveat).** FILL-BT's third assertion (add_facts M Vocabulary off,
  planned 0.712, 31 % printed foot: stays refused) passes for *any* floor above 0.712, so it does not bound the floor. The
  floor is pinned two-sided by the other two: the lower side by `0.70 + 0.052` (identify M We Do off, the largest near-floor
  plan-to-print gap), the upper by add_wp_10_plain L (planned 0.762, prints well). The add_facts assertion is kept as a
  *regression guard*, not a pin: it asserts the known-bad 0.712 sheet is still refused at the live floor, so a later change
  that drops the floor below 0.712 fails here. Read it as "the worst swept foot stays out", not as a bound on 0.76.
- **The 0.064 gap caveat.** The fill margin uses the largest gap *within reach of the floor* (0.052, planned 0.72-0.80). The
  sweep's overall largest gap is **0.064**, on a sheet planned outside that band. A sheet that planned 0.76 with a 0.064 gap
  would print a 30.4 % foot. The derivation assumes the gap does not depend on where the sheet sits; nothing in the sweep
  tests that assumption directly. The backstop is the unit gate itself: **EB-PAGE** (PO-2d) runs on every walked state's every
  page and fails a 30 %+ foot outright, whatever the plan predicted. No walked state in 815 (r3b) or in the r3 packet set
  (20 packets / 200 pages) broke it. If a future sheet does, EB-PAGE catches it and the floor is re-derived from that case.
- **R3 (EB-ROWFIT+): a planner-fixed row count can leave a row-sized foot.** fact_family_sort M, by steps Vocabulary 2,
  Remember off, We Do 0, prints 1 Independent row and a **60.7 mm (~25 %)** foot; one more row of its own cells is 58.8 mm, so
  a second row fits in print — but rows read "Fixed: 1", so the teacher cannot add it. This is the N1 class one row up:
  `fillOk`'s EB-ROWFIT clause only refuses sheets with **zero** rows (`independent === 0`); it does not notice a foot that holds
  one *more* row when some rows already print. The new check **EB-ROWFIT+** (`ws-partopts-unit` PO-2w, report-only) flags it:
  a planner-fixed rows count (`lim.fixed`, or the count at the stepper's max) whose printed foot still holds one more row of
  the rows' own cells (no head: the band exists). It flags 2 states today (both this fact_family_sort case).
  - **Kept report-only, not gated. Why.** The foot is 25 %, under the 30 % EB-PAGE line, so it is not a failure the gate
    forbids. Making it *gating* would require either (a) the planner to **add** the second row, or (b) the value **not to be
    offered**. (b) is wrong — a Fixed:1 is already the only value; there is nothing to withdraw. (a) means packing one more
    Independent row into the plan. The planner packs rows from its *planned* free height, which reads **1.5-15.9 mm less** than
    print (the ROWFIT_SLACK_MM gap of §8d above). The 60.7 mm print foot is ~45 mm in plan — below the 58.8 mm row — so the
    planner is correct *on its own figures*; the extra room is the plan-to-print slack. To pack the row, the row planner
    (`planMain`) would have to budget with the print-matching height, i.e. add ~12 mm of slack to its row loop. That change
    touches the row-packing of **every** lesson sheet and risks the 1556-hash baseline and, if the slack is miscalibrated in
    the *fits* direction, a print **overflow** (a row the inflated plan accepts but print cannot hold). That is a lane-wide
    engine change with a worse failure mode than a 25 % foot, out of proportion to a single sub-threshold case. It belongs with
    the **lf-engine** row-packer work (the same place the identify M standard-sheet foot is routed), not bolted on here. The
    report-only check stands as the tripwire: when the row-packer is reworked, flip EB-ROWFIT+ to gating (`--gate-rowfit-plus`)
    and this case closes.
