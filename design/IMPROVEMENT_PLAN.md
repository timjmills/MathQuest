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

## 2. A simple teacher site — "Teacher site 2.0" (rebuild plan)

Owner (2026-10-23): "too complicated … bloated and disorganised — no visual hierarchy, no colour hierarchy, no spatial
hierarchy; too many steps to get where you want, to print, to send a code. Like an Apple product: 3–4 steps to get
exactly what you want." And: "I don't like the colouring of the teacher site — I want bold, clear colouring using a much
wider palette."

### 2.1 What the audit found (live app, 1366 and 390 px, 2026-10-23)

| Finding | Number |
|---|---|
| Left-nav items | 11 in 3 groups (+ a hidden "Skills to be made" screen) |
| Controls visible on Print worksheets before a skill is chosen | 44 buttons, 3 selects, ≈ 30 Page-setup controls, an 18-type page chooser, 10 "Practice pages" toggles A–J; the Print button below the fold (y ≈ 1,200 px) |
| Skills library | 30,429 px tall, 1,317 buttons, no paging or default filter |
| Skills to be made | 27,073 px tall, 480 buttons |
| Quizzes → Create quiz | the legacy quiz builder re-skinned: a separate engine, 677 buttons (contradicts "same engine as Practice", TEACHER_SCREENS 2026-09-26) |
| Places a skill can start its way onto paper or to pupils | 5 (Print, Send a skill set, Library, White Rose, Quiz builder), each with a different picker |
| Clicks today (from the teacher home) | one skill + key **6**; mixed page of 3 skills **13** (the default page type is not mixed); code for one skill **5**; set of 3 skills **≈ 11**; quiz **≈ 8+**; White Rose lesson → practice **5–6**; detailed lesson **7** |
| Type and spacing | 20 font sizes, 5 weights, 20 radii, 26 shadows, 28 gap values, 109 padding values in the teacher CSS |
| Colour | 86 raw colours, almost all shades of ONE purple plus pale pastel tints; purple marks nav, links, chips, toggles and buttons alike, so colour means nothing; the only solid fill is the primary button |
| Words | internal jargon reaches teachers: "Anchor problems", "Strand tab", "Look: Auto / I Can / Daily", "Quick Start link vs Direct link", "Lock Quick Start", "Do-first / Go-with skills" |
| Phone (390) | a 72 px unlabelled icon rail leaves 318 px; three columns stack with the preview first |

### 2.2 Principles

1. **One way to do each job.** Every job is *pick → make → print / share*; the same tray, the same Make sheet, wherever
   the teacher starts (skills, a lesson, a saved set).
2. **Defaults first, options later.** The first screen shows only what most teachers need; everything else sits in one
   "More options" sheet (progressive disclosure). Nothing is asked that a sensible default can answer.
3. **One bold primary action per screen**, always above the fold at Chromebook size (1366 × 768, ~650 px visible), in the
   colour of what it makes (Print = Practice blue, Share = Share teal …). Secondary = outlined; tertiary = a text link.
4. **Bold colour with meaning** (owner): a wide palette where each colour always means the same thing — a maths domain
   or a kind of paper/action — as solid fills with white text; never colour alone (icon + label always).
5. **Clear spatial hierarchy:** a 8-pt spacing scale, one content column per job, generous white space, big type.
6. **Teacher words only** — no build words (the plain-words gate already guards the White Rose page; extend it to every
   teacher screen).
7. **Pupil content never changes** — question cells and printed pages stay black-and-white Andika (the worksheet
   contract); the colour is the teacher chrome only.

### 2.3 Information architecture — four places

| Place | Holds | Replaces |
|---|---|---|
| **Skills** (opens here) | one gallery of skills and saved sets: big search box, Grade and Domain chips (in domain colours), Big 3 / Medium 4 / Small 5 thumbnails or list; tick skills → they drop into the **tray** at the bottom (the tray is the set and saves itself) | Home, Skills library, Send a skill set, Print worksheets, the quiz builder's picker |
| **Lessons** | White Rose + detailed lessons: Grade → domain → lessons in order → the lesson panel (the 2026-10-17 layout); primary **Print lesson**; secondary **Practise these skills** (loads them into the tray); the planned "Skills to be made" for the lesson stay on the lesson (owner request 2026-10-17), shown calmly as a collapsed section | White Rose lessons, the detailed-lesson entry in Print, the Skills to be made screen (reached from a lesson / domain) |
| **Classes** | run practice on the board, quiz results, MAP tests, progress | Run practice, Quizzes list, MAP tests, Progress |
| **(profile menu)** | Settings, Switch to pupil view, Teacher help | the nav footer |

**The tray + Make sheet.** The tray shows the ticked skills (chips in their domain colours, drag to reorder, weight
steppers when 2+) and ONE primary button, **Make**. Make opens a sheet with three big coloured choices:

| Choice | Opens with | Primary | In "More options" |
|---|---|---|---|
| **Worksheet** (Practice blue) | the five plain worksheet choices (§2.3a) and a one-line summary — no full preview on the website (owner 2026-10-23: "we can see the full preview once the PDF is made"); 1 skill → its "I Can" page; 2+ skills → Mixed together (§3), equal weights; size M, A4/Letter remembered, answer key on | **Print** (makes the PDF, which is the full preview) | fade supports, page kind (Practice · Lesson · Test · Facts — the 18 types grouped into 4), header fields, key placement/style, mix in prerequisites, columns, number line |
| **Quiz** (Quiz rose) | the same engine with scoring on; "Build from" skills / CCSS / EE / WRM unit or step / lesson | **Print** or **Save** | points per question / per type, standards breakdown on the key, versions |
| **Share with pupils** (Share teal) | the code and link shown at once | **Copy** | practice mode, timer, number of questions, Show on the board, lock |

### 2.3a The worksheet choices — no more A / B / C pages (owner 2026-10-23)

Owner: "get rid of the whole A, B pages — it should be options: how many pages do you want printed, how often do you
want a skill to come up (weighted), do you want random problems, an example problem with each problem, or problem
sections, or just one whole page with one type of problem."

The 10 lettered "Practice pages A–J" toggles and the per-section page-type cards are replaced by five plain choices,
each with a default so the teacher can just press Print:

| Choice | Values | Default |
|---|---|---|
| **How many pages?** | 1 · 2 · 3 · 4 · 5 … for EVERY arrangement (owner 2026-10-23: section pages, single-skill pages and mixed practice pages alike); every page has new numbers; the key follows. **Mixed together:** each page is a full mixed page and the skills keep their weights on every page. **In sections:** the sections flow across the pages, each skill's share set by its weight, a section never split mid-row. **One skill per page:** the pages are shared out by weight (6 pages, 3 equal skills → 2 pages each); never fewer pages than skills (the choice starts at the number of skills) | 1 (one skill per page: one per skill) |
| **How often does each skill come up?** | per skill in the tray: Less · Equal · More (weights 1 : 2 : 3; a number field in More options) | Equal |
| **How are the problems arranged?** | **Mixed together** (random order, by the §3 rules) · **In sections** (one band per skill) · **One skill per page** (each page one type of problem) | 1 skill: one skill per page; 2+ taught skills: mixed together |
| **Examples?** | **None** · **One example at the top** (of the page, or of each section) · **An example with each problem** (Q-W2) | None on mixed pages; one at the top on single-skill pages |
| **Size** | S · M · L | M |

Under the choices sits a **one-line summary** instead of a page preview, e.g. "2 pages · 16 problems · Addition 6, Time 5, Fractions 5 · answer key at the end" (the achieved mix of PT-MIX-8 and the "Fits:" line in words), plus a small first-page thumbnail at most. **Print** makes the PDF, which is the full preview (owner 2026-10-23). A **New numbers** choice (re-deal every page; replaces making "version B") sits beside Print. Different versions for
different pupils = print again after New numbers, or "How many pages?" with one page per pupil.

Engine mapping (no new renderer): pages → the page count of the Practice role; weights → the existing per-skill
`weight` option; "Mixed together" → `arrangement: 'mixed'` (§3); "In sections" → today's grouped sections; "One skill per
page" → one section per skill with a page break; examples → the existing worked-example option (top) and a new
per-problem pairing (Q-W2). Old share codes and saved sets with letters A–J decode to the same number of pages.
`ws-code-snapshot` guards it.

### 2.4 The flows (target ≤ 4 decisions)

| Task | New steps | Today |
|---|---|---|
| One skill on paper with its key | search → tick → Make › Worksheet → **Print** (4) | 6 |
| A mixed page of 3 skills | tick ×3 → Make › Worksheet (mixed by default) → **Print** (4 decisions) | 13 |
| A code for one skill | tick → Make › Share → **Copy** (3) | 5 |
| A set of 3 skills to pupils | tick ×3 → Make › Share → **Copy** (3 decisions) | ≈ 11 |
| A quiz | tick (or Build from a standard) → Make › Quiz → **Print / Save** (3) | ≈ 8+ |
| A White Rose lesson's practice | Lessons → lesson → Practise these skills → Make › Worksheet → **Print** (4) | 5–6 |
| A detailed lesson | Lessons → lesson → **Print lesson** (3) | 7 |
| Re-use a saved set | Skills → My sets → set → Make › … (4) | — |

### 2.5 The visual system (teacher chrome only)

- **Type:** Andika is for pupil content; the chrome keeps its sans. 5 sizes (12 · 14 · 16 · 20 · 28, + 36 for the one
  page title) and 2 weights (500 · 700). Body 16.
- **Spacing:** 4 · 8 · 16 · 24 · 32 · 48. **Radii:** 8 (controls), 16 (cards, sheets). **Shadows:** 2 (card, sheet).
  Controls ≥ 44 px.
- **Bold palette** — solid fills with white text (light mode); lighter fills with dark text (#111318) in dark mode;
  section tints ≈ 8–10 %; text on a tint is always ink, never the hue; every colour has an icon + label.

  | Means | Light fill (white text, AA) | Dark mode fill | Used on |
  |---|---|---|---|
  | Counting & cardinality (CC) | #9A3412 burnt orange (NOT #C2410C, the answer-key orange, INK-31) | #FB923C | domain chips, tiles, section headers, Lessons domain list, skill-card edge |
  | Operations & algebraic thinking (OA) | #1D4ED8 blue | #60A5FA | 〃 |
  | Number & operations in base ten (NBT) | #047857 green | #34D399 | 〃 |
  | Fractions & decimals (NF) | #BE185D magenta | #F472B6 | 〃 |
  | Measurement, time, money (MD) | #B45309 amber | #FBBF24 | 〃 |
  | Geometry (G) | #0E7490 cyan (was violet — clashed with Lesson) | #22D3EE | 〃 |
  | Data, statistics, probability | #4D7C0F lime | #A3E635 | 〃 |
  | Algebra, patterns, number theory | #6D28D9 violet → **to settle in T1** (near Lesson) | #A78BFA | 〃 |
  | Worksheet / Practice | #2563EB | #93C5FD | Make sheet, Print button, nav icon |
  | Quiz | #BE123C rose (not error red) | #FDA4AF | 〃 |
  | Lesson | #7C3AED violet | #C4B5FD | 〃 |
  | Share with pupils | #0F766E teal | #5EEAD4 | 〃 |
  | Classes / progress | #334155 slate (gold clashed with Measurement amber) | #CBD5E1 | 〃 |
  | Status | success #15803D ✓ · warning #B45309 ⚠ · error #B91C1C ✕ | lighter pairs | messages, never as a category colour |

  Grades use numbered neutral pills, not hues (too many hues otherwise); the old `GRADE_COLORS` stay on the pupil side.
  Contrast is checked by a gate (§2.7). The exact hues are confirmed by the owner on a rendered palette board in T1.

### 2.5a Colour on purpose — the rules (owner 2026-10-23: "colour should be used on purpose for visual hierarchy and organisation")

Every colour has ONE job, and its strength shows its rank. Nothing is coloured for decoration.

| Rank | What it marks | How it is drawn | Example |
|---|---|---|---|
| 1 — **Do this** | the ONE primary action on the screen | a solid fill in the colour of what it makes, white text, the largest button | the blue **Print** on a worksheet; the teal **Copy** on Share |
| 2 — **Where am I / what kind** | the current place (Skills, Lessons, Classes) and the three Make choices | the place/action colour as a bold bar or tile; other places stay neutral | the Lessons nav item and page header in Lesson violet |
| 3 — **What maths is this** | organisation of content by domain | the domain colour as a card edge, chip, or section header band (tint background, ink text) | every NBT card has the green edge; the Lessons "Number & operations in base ten" section header is green |
| 4 — **Group** | a section or panel | a light tint of its domain or place colour (8–10 %), never a second strong colour | the More options sheet tinted Practice blue |
| 5 — **Everything else** | secondary text, borders, inactive controls, chrome | neutrals (ink, two greys, line, white) | |
| — **Status** | success / warning / error only | status colours + icon, never used for categories | ✓ "Saved", ✕ "This code no longer works" |

Rules that make the ranks work:
- **At most one rank-1 fill per screen**, and it is always above the fold at 1366 × 768.
- **Colour means the same thing everywhere:** a hue is either a domain, a place/action, or a status, never two of these.
- **Organise by colour:** lists of skills and lessons are grouped by domain, and each group carries its domain colour
  (header band + card edges), so a teacher can find "the fractions ones" at a glance.
- **Selection** takes the colour of the thing selected (a selected NBT chip fills green), not a generic accent.
- **Neutral backgrounds** (white / near-white; #111318 dark) so the bold colours stand out; no pastel washes.
- **Never colour alone:** each colour comes with a label and an icon (accessibility, black-and-white printers,
  colour-blind teachers).
- Pupil pages and question cells stay black and white (the worksheet contract).

The `ws-teacher-tokens` gate checks the rules: only token colours are used; at most one rank-1 action fill per screen;
domain colours appear only on elements that carry a `data-domain`; status colours only on status messages; text contrast
≥ 4.5:1 in light and dark.

### 2.6 Merge, retire, migrate

- **Merge:** Send a skill set + Print worksheets + Quizzes (making) → the tray + Make sheet; Skills library → Skills;
  White Rose → Lessons; Run practice + Progress + MAP + quiz results → Classes.
- **Retire from teacher chrome** (code kept, old links redirect): the legacy quiz builder pane, the classic print stub,
  the auto-layout worksheet, the separate Home tiles, the Send screen's "Quick Start vs Direct" choice (one link; the
  other mode in More options), Google Forms export (moves to More options of Share).
- **Never break:** `?code=` / `?c=` share codes (same parser, same skill indices), `?quiz=` links and IndexedDB quizzes
  (CSS additive), `#wrm/…`, `#map/…`, `#todo/…` hashes (redirect), `mq_teacher_screen` (map old screen keys),
  `mq_teacher_sets` (sets carry over as tray sets), `window.tvGo(key)` and `tvOpenPrintWith` (aliases), `?board=1`.
- **Gates to rewrite with the new screens:** `ws-teacher-shell` (screen list), `ws-teacher-library`, `-preview`, `-quiz`,
  `-wrm`; new `ws-teacher-flows` (each §2.4 flow clicked through, step count asserted ≤ its target, primary action above
  the fold at 1366 × 768, no horizontal scroll at 1366 / 1280 / 1024 / 820 / 390); `ws-teacher-tokens` (only the token
  set is used: font sizes, spacing, radii, shadows, colours; text contrast ≥ 4.5:1 light and dark); the plain-words
  gate on every teacher screen.

### 2.7 Phases

| Phase | Work | Done when |
|---|---|---|
| T1 | **Clickable mock-up + palette board** (static HTML in `design/mockups/teacher-2/`): Skills, tray, Make sheet (3 choices), Lessons, Classes at 1366 and 390, light and dark | the owner approves the flows and picks the final hues |
| T2 | Shell + tokens: four places, profile menu, the colour/type/spacing tokens in `teacher-brand.css` (additive), `ws-teacher-tokens` | tokens gate green; old screens still reachable |
| T3 | Skills gallery + tray + Make sheet (Worksheet, Quiz, Share) on the existing engines (`buildSheet`, the share-code builder, the Practice engine for quizzes); the worksheet choices of §2.3a with the one-line summary (no live page preview — `buildSheet` runs once, on Print, to make the PDF) | `ws-teacher-flows` green for flows 1–5 and 8; `ws-teacher-preview` rewritten to check the summary line against the built PDF's page and item counts |
| T4 | Lessons (the 2026-10-17 White Rose layout restyled; Print lesson; Practise these skills → tray) | flows 6–7 green |
| T5 | Classes (board, results, MAP, progress) | screens reachable in ≤ 2 clicks |
| T6 | Redirects, aliases, retire the old entry points, rewrite the teacher gates; independent critic ≥ 8 on every screen at 1366 / 1280 / 820 / 390, every action clicked through to a printed paper or a working code | critic PASS; full gates; deploy |

Each phase uses the §1 process: a spec card the owner signs (T1 is that card), precritic before the critic, golden
screenshots, near-miss re-checks.

### 2.8 Teacher-site questions for the owner

| # | Question | Recommended answer |
|---|---|---|
| Q-T1 | Replace the six-tile home (2026-09-26 ruling) with "opens on Skills" + the tray + Make sheet? | Yes |
| Q-T2 | Retire the separate quiz builder (making quizzes moves to Make › Quiz on the Practice engine; pupils' quiz taking is unchanged)? | Yes |
| Q-T3 | Keep "Skills to be made" visible on each lesson and domain (collapsed), and drop its separate screen from the menus? | Yes |
| Q-T4 | Grades as neutral numbered pills (not coloured), so colour means domain or action only? | Yes |
| Q-T5 | One share link (the "Quick Start vs Direct" choice moves to More options)? | Yes |
| Q-W1 | Replace the lettered A–J pages with "How many pages?" + New numbers (old codes still decode)? | **Answered yes by the owner 2026-10-23** — and "How many pages?" applies to section, single-skill and mixed pages |
| Q-W2 | "An example with each problem": this brings back the side-by-side pair that was dropped on 2026-09-26 (`LESSON_LIBRARY_PLAN.md` §8f) because it caused one-problem-per-page failures. Offer it again? | Yes, as a choice, but only where a pair fits ≥ 2 pairs per page at the chosen size (otherwise the choice is greyed with the reason "too large to pair at size L — try S or M"); the example uses different numbers from every problem; ≥ 8 critic on the pair layout before it ships |

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
  separate paper): "How are the problems arranged?" (§2.3a) — **Mixed together** · **In sections** · **One skill per
  page**. Request field `arrangement: 'mixed' | 'sections' | 'per-page'`, normalised beside `mixedLattice`, carried in
  share and settings codes as a new appended flag; old codes decode as sections (today's behaviour).
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
  first mixed exposure is a discrimination step, PEDAGOGY P-11). The one-line summary under the choices states the
  achieved mix against the requested weights (PT-MIX-8) in words.
- **Teacher steps** — inside the simple teacher site (§2): pick skills → Make › Worksheet → Print (the PDF is the
  preview). The arrangement defaults by the rule above and is one of the five worksheet choices (§2.3a).

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

### 4.1 New order of work (`MASTER_PLAN.md` updated the same day)

| Order | Work | Lane owns | Runs beside |
|---|---|---|---|
| 1 | **Wave 0 — faster building** (§1.3 S1–S7): precritic runner, the missing checks with backtests, spec cards, golden renders + contact sheets, sharded deploy gates, per-lane status files, the process rules | `tests/scripts/*`, `design/status/`, `design/cards/`, `CLAUDE.md` / LESSONS_LEARNED (after owner OK) | the mixed-page engine (different files) |
| 2 | **Mixed pages M1–M5** (§3.5) — the engine first (M1–M3), then frame/key, then screen parity | `print-sheet.js`, `sheet/roles/mixed-practice.js`, `sheet/layout.js`, `sheet/contract.js`, providers (`strings.cue`) | Wave 0 |
| 3 | **Teacher site 2.0** (§2): T1 clickable mock-up approved by the owner → T2 shell + tokens → T3 Library + tray + Make sheet → T4 Lessons → T5 Classes → T6 redirects, retire, critic | `teacher-*.js`, `css/teacher*.css`, `index.html` teacher markup | template lanes (step 4) |
| 4 | **Templates by leverage** (§1.4) — each template: spec card → model skill (Opus medium) → full critic → golden → its entries + presets as data → contact-sheet critic | `sheet/cells/<template>.js`, the template's generators | teacher site 2.0 |
| 5 | **Lessons 6–10 and the rest of the owner's lesson list** (Wave 8) — resume `claude/sweet-newton-c8wrv1-wip-detailed-lessons-2`; overdue lessons pull their templates forward | `js/modules/lessons/detailed/`, `data/curriculum/detailed-lessons.json` | any lane |

At most three lanes at once, each owning its files (§1 #7); deploys follow the S5 runner.

### 4.2 Coverage check — every planning document and open item

| Document / item | Where it lands | State |
|---|---|---|
| `MASTER_PLAN.md` Wave 1 (correct the program): 1.1–1.10 | live except **1.8 print backlog** (Lane D branch `-wip-a3256e8dfc9684535`, critic r9 not run) and **Lane B answer boxes + regroup boxes** (held) | Lane D and Lane B restart AFTER Wave 0 S1–S2, with precritic |
| Wave 2 (catalogue, tag, find the gaps) | done for every WRM year and site lesson (mergeall 1,042 tags, 0 problems) | closed; the build list feeds §1.4 |
| Wave 3 (simple teacher side, WRM page) | rebuilt as **Teacher site 2.0** (§2); the WRM page becomes **Lessons** | superseded by §2 (rulings kept, see below) |
| Wave 4.1 skill worksheet + fade supports | Practice paper in the Make sheet (§2); fade supports stays an option | in §2 T3 |
| Wave 4.2 mixed worksheet (weights, prerequisites) | §3 (arrangement) + §2 (weights default equal, "Mix in prerequisites" in More options) | §3 M1–M5 |
| Wave 4.3 quiz on the Practice engine | §2: Make › Quiz = same engine with scoring; the legacy quiz builder pane retires | §2 T3 |
| Wave 4.4 answer key options | built (2026-10-03) | kept in More options |
| Practice pages lettered A–J, "versions A / B / C" (Wave 4.1, `LESSON_LIBRARY_PLAN.md` §8e, `TEACHER_SCREENS.md` Papers) | replaced by §2.3a: How many pages? · How often each skill comes up · Arrangement · Examples · Size + New numbers (owner 2026-10-23); old codes decode | §2 T3 |
| Teacher colours (owner 2026-10-23: bold, wide palette, colour on purpose for hierarchy and organisation) | §2.5 palette + §2.5a rules + `ws-teacher-tokens` | §2 T1–T2 |
| Wave 4.5 other page types leave the UI | §2: page type grouped into 4 behind More options; old codes still decode | §2 T3/T6 |
| Wave 5 (redo existing skills to 8/10) incl. 5.2 number line (built), 5.3 same skill with different supports | §1.4 order, done through templates and precritic | Wave 0 first |
| Wave 6 (new skills incl. MAP 6.2–6.4) | §1.4 template order; MAP task types are entries of those templates | Wave 0 first |
| Wave 7 (Seesaw / Classroom trial, game modes) | unchanged, after Waves 5–6 | — |
| Wave 8 (lessons) incl. owner list of 67 | §4.1 step 5; lessons 1–5 live, 6–10 paused with patches in `design/lesson-planner/wip-2026-10-17/` | resume |
| Wave 9 (stretch / thinking pages) | unchanged, after Wave 8 | — |
| `ROADMAP.md` P7 one renderer, P8/P9 families, O options, T teacher track | P7 largely live; P8/P9 → §1.4 template order; O → live (options + presets); T → §2 | ROADMAP points here |
| `TEACHER_SCREENS.md` home with six tiles (2026-09-26) | superseded by §2 (4 destinations, tray + Make); the six jobs all remain reachable in ≤ 4 steps | owner to confirm (Q-T1) |
| `TEACHER_SCREENS.md` make quiz by CCSS / EE / WRM / lesson, tags, scores | §2 Make › Quiz, "Build from" chooser | §2 T3 |
| `TEACHER_SCREENS.md` gallery by default, Big 3 / Medium 4 / Small 5, saved sets, pick many | §2 Library = the gallery; the tray is the set and saves itself | §2 T3 |
| `LESSON_LIBRARY_PLAN.md` §8e three papers (Practice, Quiz, Lesson); §8f one worked example on top | §2 Make sheet (Worksheet / Quiz) + Lessons; §8f unchanged | — |
| `PAGE_TYPES.md` PT-MIX-1…9 (SHUFFLED) | §3 builds it | M2 |
| `design/audit/LESSONS_LEARNED.md` L1, L3, L6, L10 checks "NEW" | §1.3 S2 | Wave 0 |
| `design/audit/RUBRIC.md` | unchanged bar; adds the near-miss re-check rule (§1.2 #10) | S7 |
| `design/PRESET_SKILLS.md` — 9 option-skills not made (host does not deal the promise) + 9 build-list options with `preset: true` | made when their template / option is built (§1.4) | per template |
| `design/audit/runs/next-session/CARRY-BELOW-SPEC.md` | the `stack` / `long-multiplication` template (§1.4) | with long multiplication |
| `design/audit/runs/next-session/PV-IDENTIFY-WRITE-VALUE-SPEC.md` | place-value template lane | after Wave 0 |
| `design/audit/runs/wave1-B/REGROUP-BOXES-SPEC.md` (Lane B) | restarts after Wave 0 S1–S2 | held |
| Fraction key lane (`-wip-adbb61b8450078736`, critic r8 FAIL R8-1/R8-2; owner: keys show 2/8 = 1/4) | restarts after Wave 0, beside Lane D (both touch `print-sheet.js` — run one after the other) | paused |
| `design/HANDOVER-2026-10-17.md` PRs #11 (count rows on screen), #13 (shapes + 4 skills; must re-pin codes VA–VD), #14 (quiz Click ALL) | review + merge in Wave 0 week (they are small); #14 is pupil-side quiz taking and stays valid under §2 | open |
| `design/STATUS.md` defect: `reading_ruler_hard` card doubled answer area (ws-screen-slots, intermittent) | fix in Wave 0 (it is a red gate at deploy) | open |
| STATUS phone pass (deferred list) | after Teacher site 2.0 (phones are rare; Chromebook first, owner 2026-10-09) | deferred |
| `design/SUPPORTS.md`, `design/EXTENSION_PLAYBOOK.md`, `design/WRM_ALIGNMENT_PLAN.md`, `design/LESSONS_VISION.md` | unchanged; read through spec cards (§1.3 S3) | — |

### 4.3 Owner questions (one list, asked once — §1.2 #6)

| # | Question | Recommended answer |
|---|---|---|
| Q-S1 | Change the agent rule so the FIRST build of a new template/family runs at Opus medium (copies stay at Opus low)? | Yes |
| Q-S2 | Near-miss re-check: when a critic FAIL averages ≥ 7.9, the next round re-checks the failed items, every changed page and a fresh sample; unchanged pages keep their score (final pass still needs every page ≥ 8)? | Yes |
| Q-S3 | Per-lane status files with a generated STATUS index; only the deploy step stamps index.html? | Yes |
| Q-M1 | "Mixed together" the default on mixed review and quiz papers of taught skills, "Grouped" on lessons? | Yes |
| Q-M2 | A short cue in each cell on mixed pages (an exception to "one instruction per section")? | Yes, mixed pages only |
| Q-M3 | Only taught skills on a mixed page (untaught ones warn)? | Yes |
| Q-M4 | Word problems as a closing band rather than shuffled in? | Yes |
| Q-M5 | Up to 6 skills per mixed page, at least 2 problems each? | Yes |
| Q-T1 | Replace the six-tile home (2026-09-26 ruling) with the 4-destination design of §2? | Yes |
| Q-T2–T5, Q-W2 | the teacher-site and worksheet-choice questions | see §2.8 |
