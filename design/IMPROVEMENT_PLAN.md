# Improvement plan — faster building, a simple teacher site, truly mixed pages (v3, 2026-10-23)

## In short (for the owner)

1. **Faster building, same quality.** Most of the time goes on critic rounds (median about 5 per lane), and most of
   what critics find could be found by a machine first. So we build those checks, make every builder pass them before a
   critic sees the work, build the shared drawings (templates) first so new skills become quick to add, and run the
   deploy checks in parallel. The bar does not move: every page still needs 8 or better from an independent critic, and
   every check still runs before the site is updated.
2. **A simple teacher site.** Four places instead of eleven: **Skills**, **Lessons**, **Classes** and your profile. Tick
   skills and they drop into a tray at the bottom with three buttons — **Print · Quiz · Share**. Printing, sending a code
   or making a quiz takes 3–4 steps. Options appear only when you ask for them.
3. **Bold colour on purpose.** Each maths area has its own strong colour (eight of them, each in four strengths, chosen
   so colour-blind teachers can tell them apart too), used everywhere that area appears; the one button you should press
   is bold black; everything else is calm. Pupil pages stay black and white. You pick between two colour boards first.
4. **Worksheet choices in plain words** — no A / B pages: How many pages? · How often each skill comes up · Mixed
   together / In sections / One skill per page · Examples · Size. A small preview, and the PDF is the full view.
5. **Truly mixed pages.** Today "mixed practice" prints one band per skill. We build the mixed-together page that the
   design rules already describe: problems from different skills side by side, never more than two of one skill in a
   row (unless one skill is most of the page), each problem with its own short instruction, the page full.
6. **What you need to answer:** the questions in §4.3 (each has a recommended answer).

Sections 1–3 hold the detail for builders; §4 shows how it fits the current plan and lists every open item.

Owner request (2026-10-23), with later additions in the same conversation: speed up building while keeping the same
high quality; a streamlined teacher site like an Apple product (3–4 steps, visual / colour / spatial hierarchy); a fix for
truly mixed practice pages; bold, clear colouring with a much wider palette, used on purpose for hierarchy and
organisation; no lettered A/B pages — plain options, with "how many pages" for section, single-skill and mixed pages;
no full preview on the website, but a small preview of the first page (or the first 2–3 pages when they differ).

Built from three audits on 2026-10-23 (the build history and gate timings; the teacher site driven in a browser at 1366
and 390 px; the print engine with a test render) and graded by an independent critic (rounds 1 and 2 FAIL → this v3).

---

## 1. Building faster at the same quality

### 1.1 What the history shows (986 commits, 39 critic reports, the last deploy log)

| Finding | Number | What it means |
|---|---|---|
| Critic rounds to PASS | median ≈ 5; range 2–15 (WRM tagging Y2–Y3 15, Y4 13, R/Y1 12, number line 9, Y5 8, small fixes 7, search terms 6, answer-key options 5, detailed lessons 3–4) | each round = builder pass + fresh renders + full critic, 1–2 h, and most of the cost |
| Near misses | many FAILs averaged 7.92–7.96 | one 7 forces a full re-grade of every page |
| Defects a machine could measure | most defect mentions in the reports read for this audit were measurable (viewport/scroll, untrue text, slot shape, clipping, lone item, plain words, repeats, overlap, ink, paper ≠ screen, size S, wrong key); judgment defects (pedagogy, clarity) were few. This is a reading, not a count: S8's first job commits the tally (`design/status/defect-tally.csv`, defect class × critic report) | critics spend their rounds finding measurable faults |
| Classes no gate covered until a critic found them | false FULL verdicts (4 rounds running in WRM tagging, until the TITLEREP / RANGECHECK checks were added at round 14); the number line's sticky-header scroll (rounds 2–7); WRM "How it looks" lines (3 rounds); skip-count lone Model states (found only in round 4) | |
| `LESSONS_LEARNED.md` checks never built | L1 sizes, L3 key-in-drawing, L6 instruction-follows-item, L10 answer cycles; L9 and L11 by eye only | |
| Builder escalations (STATUS §9) | 14 recorded: 13 to Opus medium, 1 from Sonnet to Opus low (Lane C); each after 2–5 failed rounds at the lower setting (Y2–Y3 tagging, Y1 site lessons, skip-count and detailed lessons 1 and 2 after 2) | the cheap first pass on new, hard work costs 2–5 extra rounds |
| Deploy gates, run one after another | ≈ 80 min; screen-slots 22, chromebook-fit 17.4, teacher-wrm 12 + 12 = 80 % of it | |
| Red at deploy | `ws-print-lint --source kit` FAILs at a standing 458 findings / 33 documents (accepted baseline ≤ 461/33); `ws-screen-slots` FAILs intermittently on `reading_ruler_hard` | a "green" precritic must compare against a pinned baseline |
| Documents an agent reads | ≈ 740 KB (≈ 185 k tokens) — WORKSHEET_DESIGN_STANDARD 151 KB, PAGE_TYPES 186 KB, PEDAGOGY 131 KB, SKILL_CELL_CONTRACT 129 KB, STATUS 89 KB | |
| Merge overhead | 152 merge commits, 57 STATUS commits, 24 stamp commits, 10 conflict fixes | STATUS.md and the index.html stamp collide on most merges |
| Template leverage | 9 new kit templates (shape-grid, bar-model, data-table, picture-row, measure-scale, graph-axes, angle-kit, solid-kit, coord-grid) are named by ≈ 111 of the 277 build-list entries (≈ 40 %, each entry counted once) | building skill by skill repeats the hard part, the drawing |
| Presets | 114 named skills made in two builder runs, because the generators existed | once the drawing exists, new skills are cheap |
| Research | the reference-site logins are not in the cloud containers (STATUS §7), so the mandatory MW4K / IXL research is done from public pages, skill by skill | do it once per template |

### 1.2 The 2026-10-19 proposal, audited

| # | Proposal | Verdict | Change |
|---|---|---|---|
| 1 | Every critic finding class becomes an automatic pre-critic check | **KEEP — do first** | each check proved by a **backtest** (§1.4 S2) |
| 2 | Build by template, not by skill | **KEEP** | after a template passes, its skills and options are data entries + presets |
| 3 | One approved model per family; later skills reviewed as a batch | **MODIFY** | one model **per template AND per page role**; batch review only under the safeguards of §1.3 |
| 4 | Opus medium for the first build of a new template; Opus low for copies | **KEEP** (needs the owner's agent rule changed — Q-S1) | |
| 5 | Targeted checks while building; full gates in parallel at deploy | **MODIFY** | pairing alone gives ≈ 42 min; ≤ 30 min needs screen-slots and chromebook-fit split by category. Nothing is skipped at deploy |
| 6 | All owner questions at the start of a batch | **KEEP** | as a signed **spec card** (S3) |
| 7 | Fewer lanes, each owning its files | **KEEP + extend** | per-lane status files; only the deploy step stamps index.html |
| 8 | (new) Spec card per template / skill | ADD | builders read 3–5 KB of the right rules instead of 740 KB |
| 9 | (new) Lint without a browser (the pure kit under node) | ADD | seconds instead of minutes for L3, L6, L10, text ≠ generator |
| 10 | (new) Near-miss re-check | ADD | under the safeguards of §1.3 |
| 11 | (new) Builder report = precritic output | ADD | stops self-grades of 8 that critics mark 5–6 (L9) |
| 12 | (new) Metrics per lane | ADD | so the next audit has numbers |

### 1.3 Quality safeguards — why the bar does not move

| Speed measure | Risk | Safeguard |
|---|---|---|
| Batch (contact-sheet) critic for copies of an approved template | misses a page type, size or screen | allowed only when precritic passes for **every page role × S / M / L × the three screen hosts** (practice card, online worksheet, quiz); the critic also opens a random **20 %** of (role, size, host) pages at full scale; any role whose code path differs from the approved model gets a full grade |
| Unchanged pages keep their score (near-miss re-check, golden renders) | a stale score | the golden manifest stores **page + screen-host renders** (1366 / 1280 / 390) and a **fingerprint of the drawing** (hash of the cell DOM/SVG, not pixels), the **rule-set version** (RUBRIC, standards, LESSONS_LEARNED) and the per-criterion scores; a rule change, or a score older than 2 rounds, forces a re-grade; the final PASS lists every page with where its score came from |
| Spec cards instead of the full standards | the card leaves out a rule | builders use cards; **critics keep reading the full standards and RUBRIC**; a card-coverage test fails if any rule id that a critic cited for that family in past reports is missing from the card |
| Opus low for copies | weaker work | precritic must pass before the critic; any copy that fails a critic round is rebuilt at Opus medium (part of Q-S1) |
| Parallel deploy gates | flaky results under load | the same gates, two browser slots (owner rule). A FAIL that passes when re-run alone is still **logged as a defect** with an owner and counted in S8; the same item flaking twice **blocks the deploy** until it is fixed (`reading_ruler_hard` is one such intermittent real defect, S9) |
| Near-miss re-check (Q-S2) | a weak page rides on an old score | allowed only when **every failed score in the round is a 7 and no score in the sample is below 7** (the bar is the minimum, not the average); the re-check grades the failed items, every changed page and a fresh 20 % sample |
| Precritic with standing red gates | a builder cannot pass a red gate | print-lint and screen-slots are compared with a pinned per-skill baseline; any NEW finding fails |

The final standard is unchanged: **every page type and every screen host ≥ 8 on all four criteria by an independent
critic, and the full gates before every deploy.**

### 1.4 Implementation — Wave 0 (before any new template)

| Step | Work | Files | Done when |
|---|---|---|---|
| S1 | **`ws-precritic`** — one command for what a lane touched; it takes browser slots through `/tmp/mq-browser-run.sh` (two at a time) and prints one PASS / FAIL table, comparing red gates with the pinned baseline (gate table below; flags marked *new* are added in S1) | `tests/scripts/ws-precritic.cjs` (new), `design/audit/baselines/print-lint.json`, `…/screen-slots.json`; new flags in `ws-providers-unit.mjs` (`--skill`), `ws-chromebook-fit.cjs` (`--category`), `ws-screen-slots.cjs` (`--baseline`), `ws-grade-render.cjs` (`--template`), `ws-teacher-wrm.cjs` (`--grade`, `--lesson`) | every builder report pastes its table; the orchestrator refuses a report without it |
| S2 | **The missing checks**, each proved by a **backtest** (it FAILS on the state a critic failed and PASSES on the fix) — on a real commit where one exists, otherwise on a seeded fixture kept in `tests/fixtures/precritic/` | `ws-print-lint.cjs` rules, `ws-providers-unit.mjs`, `ws-node-lint.mjs` (new, no browser), `tests/fixtures/precritic/` | backtest table green (below) |
| S3 | **Spec cards** — `ws-spec-card` writes `design/cards/<template or family>/<id>.md` from `build-specs.js` / `build-list.js` + the exact rule excerpts (by rule id) + owner rulings + capacity rows + gates; the card ends with **open questions** and a **"Signed: owner, date"** line; the build starts only after it is signed | `tests/scripts/ws-spec-card.mjs`, `design/cards/`, a rule-id index of the four standards | card format below; card-coverage test green |
| S4 | **Golden renders + contact sheets** (with the §1.3 safeguards) | `ws-grade-render.cjs` (manifest + diff + contact sheet), `design/audit/golden/<template>/manifest.json` | a critic brief lists changed pages + the 20 % sample; unchanged pages carry their recorded score and its source |
| S5 | **Parallel, sharded deploy gates** — node gates in parallel; browser gates two at a time; screen-slots and chromebook-fit split by category across both slots; one documented deploy-gate list (closes STATUS §7 "one deploy-gate list") | `tests/scripts/ws-deploy-gates.sh` (new), CLAUDE.md "Checks to run" | full run ≤ 30 min, same gates, nothing skipped |
| S6 | **Merge hygiene** — per-lane status files + a generated STATUS.md index; lanes never run `ws-stamp-assets` | `design/status/<lane>.md`, `tests/scripts/ws-status-index.mjs` | a week of lanes with no STATUS or stamp conflict |
| S7 | **Process rules** (after the owner approves Q-S1–Q-S3): template-first order; one model per template per role; batch critic with the §1.3 safeguards; near-miss re-check (minimum-based trigger); flakes logged; signed spec card; first build of a new template, and any failed copy, at Opus medium; builder report = precritic output | `CLAUDE.md`, `design/audit/LESSONS_LEARNED.md`, `design/audit/RUBRIC.md` | recorded; the next lane briefs use them |
| S8 | **Metrics** — first the defect tally of every past critic report (class × report); then rounds to PASS, hours, findings per class and the agent profile used (the profile name is recorded, since an agent cannot see its own effort setting) per lane; reviewed after every template; a rising class becomes the next check | `design/status/defect-tally.csv`, `design/status/metrics.md` | tally committed; filled from Wave 0 on |
| S9 | **Clear the red gates** — fix `reading_ruler_hard`'s doubled answer area; pin the print-lint baseline (458/33) per skill | the skill's generator / cell | screen-slots green; baseline file committed |

**What `ws-precritic` runs**

| Flag | Gates |
|---|---|
| `--skill <cat:skill>` (repeatable) | `ws-node-lint` (*new*), `ws-providers-unit --skill` (*new flag*), `ws-content-audit --skill`, `ws-options-verify --skill`, `ws-presets-unit` (when presets touch it), `ws-print-lint --source kit --skills --baseline` (S / M / L, every role), `ws-screen-slots --skills --baseline` (*new flag*), `ws-screen-answer --skills`, `ws-chromebook-fit --skills`, `ws-code-snapshot`, `ws-boot-smoke` |
| `--template <id>` | the above for every skill using the template + `ws-panes-unit` / the template's fixture test + `ws-grade-render --template` (*new flag*) contact sheet |
| `--role <role>` | `ws-grade-render --roles <role> --skills <20 skills across families>` + `ws-print-lint --roles <role>` |
| `--teacher` | `ws-teacher-shell`, `-library`, `-preview`, `-quiz`, `-wrm --grade --lesson` (*new flags*), `ws-teacher-flows` (*new*, §2.9), `ws-teacher-tokens` (*new*, §2.8), `ws-plain-words --check` |

At deploy, S5 shards `ws-screen-slots --category` (exists) and `ws-chromebook-fit --category` (*new flag*) across the two
browser slots.

**Backtests for the new checks**

| Check | Backtest |
|---|---|
| Lone item / lone state on a page | skip-count 359802c5 (critic r4 D12) fails; b19172b4 passes |
| Text ≠ generator (claims of counts, kinds, ranges vs 300 seeded items) | WRM page 848d7d3f (critic r8 M12) fails; d515aa05 passes; WRM tagging Y2–Y3 round-13 state (false FULL) fails |
| Chromebook viewport (answer box + Check reachable at 1366 × 768, nothing under a sticky header) | number line e189119f (graded by critic r7, R7-D1: timed band under the sticky bar at 1280) fails; 789f23f7 passes |
| L1 sizes (S fits more than L; drawings scale) | seeded fixture from options critic R3 (fixed grid at S) |
| L3 key value inside the question drawing | seeded fixture (a "combine shapes" item drawing its result) |
| L6 instruction / steps / Say line mention only the item's own numbers and task | seeded fixture (guided steps for other numbers) |
| L10 answer position / value cycle over 30 items | seeded fixture (A/B alternation from `itemIndex % 2`) |
| Repeats (a problem or a line twice on a page or packet; chart example returning on the exit slip) | detailed lesson 6 c2a6d8b4 (graded by its critic r1 in 712592e2, D2: Guided 1 returns on the exit slip) fails; f0990693 passes |

**Spec card format** (`design/cards/<template>/<id>.md`): 1 What it teaches (standards, WRM steps) · 2 Problem types and
progression (research notes, once per template) · 3 The drawing (template, sizes S/M/L, capacity rows) · 4 Rules that apply
(rule ids with excerpts) · 5 Owner rulings · 6 Misconceptions (for keys and wrong answers) · 7 Options and presets ·
8 Gates (`ws-precritic` flags) · 9 Open questions with recommended answers · **Signed: owner, date**.

A backtest is either a real commit pair (failed → fixed) or a seeded fixture; the table says which.

Expected effect, measured by S8: median rounds to PASS 5 → 2; deploy gates 80 → ≤ 30 min; builder brief ≈ 185 k →
≈ 10 k tokens; skills on an existing template made in one run, as the presets were.

### 1.5 Build order for the skill backlog (replaces "one family per wave" in Waves 5–6)

1. Templates by leverage: shape-grid → bar-model → data-table → picture-row → measure-scale → graph-axes → angle-kit →
   solid-kit → coord-grid (≈ 111 entries), plus `long-multiplication` (finishes `mult_standard` 4 × 1 and 3 × 2 and
   `long_mult`) and the carry-under-the-line option on `stack` (`design/audit/runs/next-session/CARRY-BELOW-SPEC.md`).
   PR #13 (shape drawings, `shape-art.js`, 4 shape skills) is reviewed first and becomes the starting point of shape-grid
   and solid-kit rather than a parallel path (Q-H2).
2. For each template: signed spec card → one model skill at Opus medium → full critic on every role, size and host →
   golden renders saved → the template's other entries + presets as data at Opus low → batch critic (§1.3) → deploy.
3. Within a template, WRM / CCSS order (early units first); overdue lessons (`Lessons_To_Build_K-5_2026-27.xlsx`) pull
   their templates forward.
4. Skills with no template change (redos) go through the same precritic + critic loop, family by family, in the order of
   `ROADMAP.md` §3 (P9 onward); the BACKLOG items with no wave owner (STATUS §7: div_remainders counters, nl_sub,
   add_5_pictures, money_compare panels, mixed_placevalue, round_nl_hundred_thousands, support ladder on worksheet/quiz,
   expand double edge) join the family they belong to.

---

## 2. A simple teacher site — "Teacher site 2.0"

### 2.1 What the audit found (live app, 1366 and 390 px)

| Finding | Number |
|---|---|
| Left-nav items | 11 in 3 groups (+ a hidden "Skills to be made" screen) |
| Print worksheets before a skill is chosen | 44 buttons, 3 selects, ≈ 30 Page-setup controls, an 18-type page chooser, 10 "Practice pages" toggles A–J; the Print button below the fold (y ≈ 1,200 px) |
| Skills library | 30,429 px tall, 1,317 buttons, no paging or default filter |
| Skills to be made | 27,073 px tall, 480 buttons |
| Quizzes → Create quiz | the legacy quiz builder re-skinned: a separate engine with 677 buttons (TEACHER_SCREENS 2026-09-26 says "same engine as Practice") |
| Places a skill can start onto paper or to pupils | 5 (Print, Send a skill set, Library, White Rose, Quiz builder), each with a different picker |
| Actions today (every click, typed search and needed scroll) from the teacher home | one skill + key **6**; mixed page of 3 skills **13** (the default page type is not mixed); code for one skill **5**; set of 3 skills **≈ 11**; quiz **≈ 8+**; White Rose lesson → practice **5–6**; detailed lesson **7** |
| Type and spacing | 20 font sizes, 5 weights, 20 radii, 26 shadows, 28 gap values, 109 padding values |
| Colour | 86 raw colours, almost all shades of ONE purple plus pale pastel tints; purple marks nav, links, chips, toggles and buttons alike, so it means nothing; the only solid fill is the primary button |
| Words | "Anchor problems", "Strand tab", "Look: Auto / I Can / Daily", "Quick Start link vs Direct link", "Lock Quick Start", "Do-first / Go-with skills" |
| Phone (390) | an unlabelled 72 px icon rail leaves 318 px; three columns stack with the preview first |

### 2.2 Principles

1. **One way to do each job:** find skills → put them in the tray → Print / Quiz / Share.
2. **Defaults first, options when asked** — one "More options" sheet; nothing is asked that a default can answer.
3. **One primary action per screen**, bold, always above the fold at Chromebook size (1366 × 768, ≈ 650 px visible).
4. **Colour on purpose** (§2.7): bold colours mean maths areas; the action is bold black; the rest is calm.
5. **Clear spatial hierarchy:** an 8-pt spacing scale, one content column per job, generous white space, big type.
6. **Teacher words only** — the plain-words gate covers every teacher screen.
7. **Pupil content never changes** — question cells and printed pages stay black-and-white Andika.

### 2.3 Four places

| Place | Holds | Replaces |
|---|---|---|
| **Skills** (opens here) | one gallery: a big search box; **Browse by** Maths area · White Rose step · MAP strand ("Practise by task" / "By representation", the MAP strand picker) · My sets; Grade chips; Big 3 / Medium 4 / Small 5 thumbnails or a list (60 per page, filtered by grade by default); ticking puts skills in the tray | Home, Skills library, Send a skill set, Print worksheets, the quiz builder's picker, MAP "Practise by task / By representation" |
| **Lessons** | White Rose + detailed lessons in the 2026-10-17 layout (Grade → maths area → lessons in order → the lesson panel on the side); **opens where the teacher was last** (last grade, area and lesson, the next lesson marked "Next"), with a search box for a lesson by name or code; the lesson panel buttons: **Print lesson** (primary) · Print practice · Share practice · **Practise pre-skills** (MASTER_PLAN 3.4); the lesson's planned "Skills to be made" stay on the lesson and the maths-area summary (owner 2026-10-17), collapsed | White Rose lessons, the detailed-lesson card in Print, the Skills to be made screen |
| **Classes** | Run on the board, quiz results, MAP tests (running and results), progress | Run practice, Quizzes list, MAP tests, Progress |
| **(profile menu)** | Settings, Switch to pupil view, Teacher help | the nav footer |

**Below 820 px** (tablet portrait, phone): the left nav becomes a **labelled bottom bar** with the four places (icon +
word, ≥ 44 px), replacing today's unlabelled 72 px icon rail; the tray collapses to one bar, **"3 skills ▸"**, with the
three buttons beside it; tapping the count opens the chips. One column; the preview never comes first.

### 2.4 The tray

- Fixed at the bottom of Skills; shows the ticked skills as chips in their maths-area colours; drag to reorder.
- **Tap a chip** → that skill's own options sheet (range, supports, skip, calculator, preset values, its weight) — options
  live on the skill (CLAUDE.md).
- **Three buttons: Print · Quiz · Share.** Print opens the worksheet sheet (§2.5); Quiz opens the same sheet with scoring
  on ("Build from" skills / CCSS / EE / WRM unit or step / lesson; points per question or type; standards breakdown on the
  key; **How many versions? 1–6**, as the quiz builder already offers (`quiz-builder.js:1360`), each with its own order and
key, no letters — Q-W3); Share shows the code and link at once with **Copy**
  (primary) and **Show on the board** (secondary); mode, timer, number of questions and lock in More options.
- **Quiz → Save** keeps the quiz in the teacher's own quiz list (`saveTest`, IndexedDB, `quiz-storage.js:113`).
  **Quiz → Share with pupils** packs the whole quiz into the link (`compressTestForURL` → `?quiz=`,
  `quiz-storage.js:265-300`; `quiz-take.js:44` rebuilds it), so links made today keep working.
- **Quiz results stay on each pupil's device** (`saveResult`). Classes shows the results of quizzes taken on this device
  (the board, a shared Chromebook) and says so; collecting results from many devices is not part of this plan.
- The tray IS the set: it saves itself (`mq_teacher_sets`) and appears under Browse by › My sets.

### 2.5 The worksheet sheet — plain choices, no A / B pages (owner 2026-10-23)

| Choice | Values | Default |
|---|---|---|
| **How many pages?** | 1 · 2 · 3 · 4 · 5 …, for every arrangement (owner: section pages, single-skill pages and mixed pages alike); every page has new numbers; the key follows. Mixed together: each page is a full mixed page with the weights kept. In sections: the sections flow across the pages by weight; a section never splits mid-row. One skill per page: pages shared out by weight (6 pages, 3 equal skills → 2 each); never fewer pages than skills | 1 (One skill per page: one per skill) |
| **How often does each skill come up?** | per skill: Less · Equal · More (1 : 2 : 3; a number in the chip's options) | Equal |
| **How are the problems arranged?** (2+ skills) | **Mixed together** · **In sections** · **One skill per page** | Mixed together; In sections when the paper comes from a lesson's "Print practice" |
| **Examples?** | None · One example at the top (of the page, or of each section) · An example with each problem (Q-W2; not on Mixed together pages) · on Mixed together pages: None or One example of each skill, in a strip at the top (§3.3) | One at the top on single-skill pages; None on mixed pages |
| **Size** | S · M · L | M |

- Under the choices: a **one-line summary** ("2 pages · 16 problems · Addition 6, Time 5, Fractions 5 · answer key at the
  end") and a **small preview** — a thumbnail of the first page when every page holds the same kind of problems, or of
  the first 2–3 pages when they differ. **Print** makes the PDF, which is the full view. **New numbers** re-deals every
  page (it replaces "version B" on practice papers).
- **More options:** Fade supports (Faded problems / Faded page / **Faded packet = across the pages chosen above**), Fact
  layout (5–10 across) and Timed check (the old fact rows and probe, LESSON_LIBRARY_PLAN §8e), Mix in prerequisite
  skills, header fields, answer-key placement and style, number line at the top, columns. There is no page-kind chooser:
  tests are the Quiz button, lessons are in Lessons, thinking pages stay paused (MASTER_PLAN 4.5, Wave 9).
- Engine mapping (no new renderer): pages → the Practice role's page count; weights → the per-skill `weight` option;
  Mixed together → `arrangement: 'mixed'` (§3); In sections → today's sections; One skill per page → one section per
  skill with page breaks; "One example at the top" → `anchors: 'sections'` (an example band before each block; the
mixed-practice default today, `sheet/anchors.js:16`); "An example with each problem" → `anchors: 'side'`; None →
`anchors: 'off'` (`ANCHOR_MODES`, `anchors.js:25`); the strip on mixed-together pages is new (M4). Old share codes and saved
  sets with letters A–J decode to the same number of pages (`ws-code-snapshot`).

### 2.6 The flows

Counted the same way for today and the new design: **actions** = every click, typed search and needed scroll, from the
place the teacher starts. **Steps** = the screens / decisions (the owner's "3–4 steps"). `ws-teacher-flows` clicks
every row and asserts its action count, including the 6-action case for Lessons.

| Task | New flow | Steps | Actions new / today |
|---|---|---|---|
| One skill on paper with its key | search → tick → Print → Print | 3 | 4 / 6 |
| A mixed page of 3 skills | tick 3 (search each, or from one maths-area list) → Print (Mixed together by default) → Print | 3 | 5–8 / 13 |
| A code for one skill | search → tick → Share → Copy | 3 | 4 / 5 |
| A set of 3 skills to pupils | tick 3 → Share → Copy | 3 | 5–8 / ≈ 11 |
| Practice on the board | tick → Share → Show on the board | 3 | 3–4 / ≈ 5 |
| A quiz on paper | tick (or Quiz → Build from a standard) → Quiz → Print | 3 | 3–5 / ≈ 8+ |
| A quiz for pupils online | … → Quiz → Share with pupils → Copy | 4 | 4–6 / not possible in one place |
| A White Rose lesson's practice | Lessons (opens on the last grade and area) → lesson → Print practice → Print | 4 | 4 (same grade and area as last time; the next lesson is marked) · 6 (another grade and area: + grade, + area) · 4 + typing (search) / 5–6 |
| A lesson's pre-skills | Lessons → lesson → Practise pre-skills → Print or Share | 4 | 4 · 6 · 4 + typing, as above / not offered |
| A detailed lesson | Lessons → lesson → Print lesson → Print | 4 | 4 · 6 · 4 + typing, as above / 7 |
| MAP practice by task | Skills › MAP strand → task → Print or Share → Print / Copy | 4 | 4 / 4–5 |
| A saved set | Skills › My sets → set → Print / Quiz / Share | 3 | 3–4 / 3–4 |
| Change one skill's options | tap its chip in the tray | 1 | 1 / buried per screen |

### 2.7 Colour on purpose (owner 2026-10-23)

**Strength shows rank:**

| Rank | Marks | Drawn as |
|---|---|---|
| 1 — **Do this** | the one primary action on the screen | a solid **ink** fill (#111827, white text), the largest button, with its icon |
| 2 — **What maths is this** | the maths area of every skill, lesson and section | the area's colour, at the strength that matches the element (ramp below) |
| 3 — **Group** | a panel or a group of cards | the area's **tint** behind the group, ink text |
| 4 — **Everything else** | secondary text, borders, inactive controls, the nav | neutrals (ink, two greys, line, white) |
| — **Status** | error / warning / success only | error red #B91C1C + ✕; warning = ink + ⚠ (no yellow fill, so it never reads as Counting); success = ink + ✓ |

**Eight maths-area colours, four strengths each.** Splitting Measurement from Data (as the app's DOMAINS and the White
Rose Statistics blocks already do) and grade 6 Ratio / Number system from Fractions gives eight areas. Each has a ramp,
so strength shows rank inside the area: **tint** (10 %, a group's background) → **soft** (30 %, a filter chip at rest)
→ **bold** (card edge, section header band, tray chip) → **deep** (the selected state, with ✓).

| Maths area (code) | Tint | Soft | **Bold** (text on it) | Deep (white text) | Hue · L* |
|---|---|---|---|---|---|
| Counting & cardinality (CC) | #FEFAE8 | #FEF0B9 | **#FACC15** gold (ink 11.6) | #695609 (7.2) | 48° · 84 |
| Operations & algebraic thinking (OA; grade 6 EE) | #EBF2FE | #C4DAFC | **#3B82F6** blue (ink 4.8) | #2857A5 (7.0) | 217° · 56 |
| Number & operations in base ten (NBT) | #ECEBFA | #C7C3EF | **#4338CA** indigo (white 7.9) | #322A98 (10.9) | 245° · 35 |
| Fractions & decimals (NF) | #F3E8F4 | #DBBADD | **#86198F** plum (white 8.2) | #64136B (11.4) | 295° · 33 |
| Measurement — length, mass, time, money, area, volume, angles (every MD cluster except data) | #E6F2EE | #B4D6CD | **#047857** emerald (white 5.5) | #035A41 (8.3) | 163° · 44 |
| Data — the MD "represent and interpret data" clusters (K.MD.B, 1.MD.C, 2.MD.D, 3.MD.B, 4.MD.B, 5.MD.B); grade 6 SP | #E6F8FB | #B4E9F2 | **#06B6D4** cyan (ink 7.3) | #036272 (7.0) | 189° · 68 |
| Geometry (G) | #EDFCF2 | #C9F5D9 | **#4ADE80** green (ink 10.2) | #21643A (7.1) | 142° · 79 |
| Ratio & number system (grade 6 RP, NS) | #FDEDF5 | #F9C8E0 | **#EC4899** pink (ink 5.0) | #992F63 (7.1) | 330° · 57 |
| No standard / Extra lessons | — | — | **#475569** slate (white 7.6), **dashed outline** | — | — |

Ink = #111827. Tint and soft always take ink text (≥ 10 : 1). Contrast figures are WCAG ratios on the bold and deep fills.

- **Checked for colour-blind teachers** (CIELAB ΔE76; deuteranopia and protanopia simulated with the Machado 2009
  matrices at full severity): every pair of bold colours is ≥ 35 apart with normal vision and ≥ 20 apart under both
  simulations (closest: Measurement–Ratio 20.1 deuteranopia, Data–Ratio 22.5 protanopia); OA and NBT now differ in
  lightness (L* 56 vs 35), the clash critic r2 found in v2. Every bold is ≥ 20 from error red and from the answer-key
  orange #C2410C in all three views. `python3 design/audit/palette-2026-10-23/ramps.py` reproduces every number here;
  `search3.py 8 20 20` is the search that chose the set.
- **Slate** ("No standard") is 16 from the nearest area under simulation, so it also carries a **dashed outline** and its
  label; it never reads as an inactive control, because inactive controls are grey outlines with no fill.
- **Dark mode:** neutral page #111318; tints become 18 % of the bold over the page and soft 40 %, with #F3F4F6 text
  (≥ 5.9 : 1); bold chips keep their fill and text.
- **Chip edges:** a bold fill under 3 : 1 against its page gets a 1 px outline so the chip's shape is always visible —
  in light mode Counting (1.5), Data (2.4) and Geometry (1.7) take their own deep colour as the outline; in dark mode NBT
  (2.4) and Fractions (2.3) take #E5E7EB, and slate's dashed outline is #E5E7EB.
- **One meaning per colour:** a hue is a maths area or error, never both; actions, places and grades are ink and neutrals.
- **Where the area comes from:** the skill's primary CCSS code in `SKILL_STANDARDS` (first code; MD split by cluster as in the
  table); a lesson's own CCSS; no code → slate. The 6 app DOMAINS and 35 categories are not used for colour.
- **Organise by colour:** skill and lesson lists are grouped by maths area, each group on its tint under its bold header
  band, so a one-area list still shows four strengths of its colour, not one hue on black and white.
- **Never colour alone:** every colour comes with its label and icon (black-and-white printers, colour-blind teachers).
- **Neutral backgrounds** (white; #111318 dark), no pastel washes outside the group tints. Grades are numbered neutral
  pills.

**At T1 the owner picks between two rendered boards** (Q-T6): **A** six areas (Measurement and Data share emerald;
Ratio / Number system shares plum) and **B** eight areas with the ramps above. Both are subsets of the set checked above,
so both pass the gate.

### 2.8 Type, spacing and the token gate

- Type (chrome; Andika is for pupil content): 5 sizes (12 · 14 · 16 · 20 · 28, + 36 for the page title), 2 weights (500 ·
  700); body 16. Spacing 4 · 8 · 16 · 24 · 32 · 48. Radii 8 (controls), 16 (cards, sheets). Shadows: 2. Controls ≥ 44 px.
- **`ws-teacher-tokens`** (new): only token values are used (sizes, spacing, radii, shadows, colours); at most one rank-1
  ink fill per screen; area colours only on elements carrying a `data-domain`; **every pair of bold area colours ΔE76 ≥ 30
  with normal vision and ≥ 20 under deuteranopia and protanopia simulation** (Machado 2009, severity 1.0); every bold ≥ 20
  from error red and key orange in all three views; text contrast ≥ 4.5 : 1 on every ramp step in light and dark; chips
  ≥ 3 : 1 against the page or outlined; slate always with its dashed outline. A hue-only check cannot catch a
  colour-blind clash, so the gate measures ΔE.

### 2.9 Merge, retire, migrate

- **Merge:** Send a skill set + Print worksheets + making quizzes → the tray; Skills library → Skills; White Rose →
  Lessons; Run practice + Progress + MAP tests + quiz results → Classes; the MAP strand picker → Skills › Browse by.
- **Retire from the teacher chrome** (code kept, old links redirect): the legacy quiz-builder pane (Q-T2), the classic
  print stub, auto-layout worksheet, the six-tile home (Q-T1), the separate Skills to be made screen (its content stays on
  lessons, Q-T3), the "Quick Start vs Direct" choice (one link; the other mode in More options, Q-T5), Google Forms export
  (More options of Share).
- **Never break:** `?code=` / `?c=` share codes (same parser and skill indices), `?quiz=` links and IndexedDB quizzes (CSS
  additive), `#wrm/…`, `#map/…`, `#todo/…` hashes (redirect), `mq_teacher_screen` keys (map), `mq_teacher_sets` (carry
  over), `window.tvGo(key)` / `tvOpenPrintWith` (aliases), `?board=1`.
- **Gates rewritten with the screens:** `ws-teacher-shell` (screen list), `-library`, `-preview` (checks the summary line
  and thumbnails against the built PDF's page and item counts), `-quiz`, `-wrm`; new **`ws-teacher-flows`** (every §2.6 flow
  clicked through; steps and actions asserted ≤ the table; primary action above the fold at 1366 × 768; no sideways scroll
  at 1366 / 1280 / 1024 / 820 / 390) and **`ws-teacher-tokens`**.

### 2.10 Phases

| Phase | Work | Files | Done when |
|---|---|---|---|
| T1 | Clickable mock-up + the two palette boards (A six areas, B eight areas with ramps, each with its colour-blind simulation): Skills, tray, worksheet sheet, Quiz, Share, Lessons, Classes at 1366 and 390, light and dark; a live-vs-branch table of teacher files (STATUS §7) | `design/mockups/teacher-2/*.html`, `tests/scripts/ws-teacher-tokens.cjs` (palette part) | the owner approves the flows and picks board A or B (this is the signed spec card) |
| T2 | Shell + tokens: four places, profile menu, the bottom bar below 820 px, tokens | `teacher-shell.js`, `teacher-ui.js`, `css/teacher-brand.css`, `css/teacher.css`, `index.html` teacher markup | `ws-teacher-tokens` green; old screens reachable |
| T3 | Skills gallery + Browse by + tray + chip options + worksheet sheet + Quiz + Share | `teacher-library.js`, `teacher-skillpick.js`, `teacher-sets.js`, `teacher-print.js`, `teacher-preview.js`, `teacher-quiz-ui.js`, `quiz-builder.js` (save path only), `quiz-storage.js`, `teacher-map-tasks.js`, `print-sheet.js` (request normalising only), `css/teacher-library.css`, `css/teacher-quiz.css` | `ws-teacher-flows` green for every Skills flow |
| T4 | Lessons: the 2026-10-17 layout restyled; Print lesson / Print practice / Share practice / Practise pre-skills | `teacher-wrm.js`, `lesson-tomake.js`, `css/teacher-wrm.css` | Lessons flows green |
| T5 | Classes: board, results, MAP tests, progress | `teacher-map.js`, `dashboard.js` (wrapping only), board routing | each reachable in ≤ 2 actions |
| T6 | Redirects and aliases, retire old entry points, rewrite the teacher gates; independent critic at 1366 / 1280 / 820 / 390, every action clicked through to a printed PDF or a working code | as above | critic ≥ 8 on every screen; full gates; deploy |

### 2.11 Teacher-site questions — see §4.3 (Q-T1 … Q-T6, Q-W2, Q-W3)

---

## 3. Truly mixed practice pages

### 3.1 What prints today (test render 2026-10-23)

Four skills (add within 20, identify fractions, time to the hour, subtract within 20) on "Mixed practice" print as one
band per skill: Addition 4 across, Fractions 2 across, Time 2 across; the fourth skill spills to page 2, leaving page 1
with 8 problems and ≈ 12 % empty. The fraction band even holds two different tasks under one instruction. That is
section practice, not mixed practice.

### 3.2 The barriers (most severe first)

| # | Barrier | Where |
|---|---|---|
| B1 | Skills are dealt in blocks on purpose: `dealSkills()` keeps each skill's items together ("one type per run, never silently mixed"), and every multi-skill page uses it | `print-sheet.js:192-206, 562`; WORKSHEET_DESIGN_STANDARD DN-34 (allows "deliberately mixed", with no way to ask for it) |
| B2 | The only mixed packer puts one shelf per skill, each with its own heading band, column count and height; the shuffled arrangement is specified (PAGE_TYPES PT-MIX-5…7) but "not built yet" | `sheet/roles/mixed-practice.js:3-20, 53-80` |
| B3 | Instructions live on the section, not the cell (the cell's instruction is removed when the section line says it); a mixed page needs a short instruction in each cell, and no skill supplies one | `print-sheet.js:1190-1192, 1324-1332`; PT-MIX-5 |
| B4 | The shared unit grid exists (PT-MIX-1, `mixed-practice.js:3-7`), but cells have no size classes (1 × 1, 2 × 1, 2 × 2 …) and there is no block packer to place different-size cells side by side; `footprint.span` is specified but not read | `sheet/layout.js`; `PAGE_TYPES.md:256`; `SKILL_CELL_CONTRACT.md:1403` |
| B5 | Older (legacy) cells are sized by measuring, so their size class is unknown before packing | `print-sheet.js:1247` |
| B6 | The footer lists skill ids, not names; a mixed Independent page's tab reads "Lesson 1"; the key has no skill-to-problem map | `sheet/frame.js:45`, roles |
| B7 | A whole skill moves to the next page rather than the page filling | `mixed-practice.js` (PT-MIX-9) |
| B8 | No screen host mixes by rule: the online worksheet follows section order; the quiz has a manual per-section shuffle and an online per-pupil random order (`quiz-builder.js:845, 1359`), but no spaced, balanced order | `worksheet.js`, `quiz-builder.js` |
| B9 | No teacher choice for the arrangement | `teacher-print.js:57, 88` |

Not barriers: each skill's options and state already travel with it, and seeds are per item, so a mixed order can be
reproduced.

### 3.3 The design

- **Terms:** the teacher sees **Mixed together · In sections · One skill per page** (§2.5); the engine field is
  `arrangement: 'mixed' | 'sections' | 'per-page'` (an appended code flag; old codes decode as sections). "Grouped" is
  the engine's old name for "In sections".
- **Order — `interleave(items, weights, seed)`** (pure, in the kit): weighted round-robin, counts within 1 of the weights,
  at most 2 of one skill in a row, every skill seen in the first third of the page, order from the seed. Single-skill
  pages keep `dealSkills` (DN-34 holds there).
- **When the run rule cannot be met, the weights win.** A skill with `major` items among `minor` items of all other
  skills can be kept to runs of ⌈major / (minor + 1)⌉ at best (Less : More = 1 : 3 on 12 items → 9 and 3 → runs of 3).
  The run cap becomes max(2, ⌈major / (minor + 1)⌉) for that skill, runs are spread as evenly as the counts allow, and
  the summary line says so ("Time is 3 of every 4 problems, so up to 3 come in a row"). The teacher's weights are never
  clipped silently.
- **Size classes:** each cell has a class (1 × 1, 2 × 1, 1 × 2, 2 × 2, 4 × 1) from its skill's `footprint.span`; where
  none is declared, the measured cell is rounded up to whole units at the page's unit width (cached per skill + options +
  size). Every template declares its span as it is built (§1.5).
- **Packing — PT-MIX-5 as written:** strips two units high built from 2 × 2 blocks; the packer takes the next item from
  the interleaved queue that fits the open block, **looking ahead at most 3 items**; after each placement it re-checks
  the run rule and the first-third rule and swaps with the next fitting item if either breaks; a final row of height-1
  cells; word problems as a closing band. Rows take their tallest cell; content never shrinks; every cell keeps ≥ 40 %
  free; a strip never splits; the last page is rebalanced.
- **How many skills fit a page is a capacity sum, not a count:** Σ over the page's skills of 2 × (span area in units)
  ≤ the page's units at the chosen size and look (each skill at least 2 problems on any page it appears on; the
  word-problem band is outside the sum and exempt from the 2-problem rule, as in the PAGE_TYPES 5.2 worked example of 4
  skills at L with one word problem). Example: the Daily L page (N = 4) has 4 blocks = 16 units, so three 2 × 2 clock
  skills (2 × 4 × 3 = 24 units) do not fit on one page. When the skills do not fit, they rotate across the pages the
  teacher asked for (each page a full mixed page, the totals across the pages keeping the weights, PT-MIX-9); if even the
  chosen number of pages cannot hold every skill twice, the summary line says "needs 2 pages" and Print offers it.
- **A short instruction in each cell** (already required by PT-MIX-5): skills gain `strings.cue` — 1–4 words from the
  instruction library ("Add.", "Write the time.", "Shade 2/8.") — printed beside the problem number; the sheet line is
  "Solve."; plain computation cells may omit it. Until a skill has its cue, the library instruction shortened by rule is
  used, and the lint lists every skill still on that fallback.
- **Examples on a mixed-together page:** None, or **one worked example of each skill in a strip at the top** (the PT-MIX
  "cue key strip"; it costs a row). "An example with each problem" is not offered on mixed-together pages.
- **Frame and key:** title "Mixed practice" with the skills named under it in plain words (up to four, then "and N
  more"); tab "Level a–b · Mixed n"; footer: skill names + CCSS codes; numbering by strip, then block, then inside the
  block (PT-MIX-7); no skill letters in cells; the key adds a legend by skill, listing problem numbers
  ("Add: 1, 4, 7 · Time: 2, 5 · Fractions: 3, 6").
- **PT-MIX-8 (achieved vs requested share, cells across per skill)** is replaced by the summary line, which states the
  achieved count of each skill and says when it differs from what was asked ("Time 5 of the 6 asked: its boxes are
  bigger"); the cells-across detail moves to More options › Details.
- **Screen parity:** the online worksheet and quiz use the same `interleave()` when the arrangement is Mixed together;
  the quiz's shuffle switch maps to it.
- **When mixing is used:** Mixed together is the default for 2+ skills, except practice printed from a lesson (In
  sections, because the lesson's skills are new); the teacher can change it in one tap. If the owner agrees (Q-M1), the
  same change edits three places that say otherwise today: PAGE_TYPES 5.2 ("Look … Default arrangement GROUPED",
  line 1440) → "Default arrangement SHUFFLED for 2+ skills, GROUPED from a lesson"; WORKSHEET_DESIGN_STANDARD DN-34 gains a
  note that a page the teacher set to Mixed together is a deliberate mix (it is shown in the summary line), so it is not
  "silent"; `sheet/anchors.js:16` ("Mixed practice defaults to sections") → mixed-together pages default to no examples,
  grouped pages keep sections.

### 3.4 Gates that prove it

- `ws-print-lint` mixed rules: no run of one skill longer than 2; each skill's count within 1 of its weight; every
  non-computation cell has a cue; no cell below its minimum size; ≥ 40 % free; vertical rules on the unit grid; no page
  under-filled while items remain; the capacity sum holds on every page; any run over 2 matches the weights fallback and
  appears in the summary line.
- `interleave()` self-test (node, deterministic), including the 1 : 3 on 12 items case (runs of 3, counts 3 and 9, the
  summary note) and a 1 : 1 : 1 case (no run over 2); `ws-code-snapshot` (old codes decode as sections).
- Critic case: `ws-grade-render --set` with four skills from four families at S / M / L + keys + the online worksheet and
  quiz, ≥ 8 on every criterion.

### 3.5 Phases

| Phase | Work | Files | Done when |
|---|---|---|---|
| M1 | `interleave()` + self-test (with the weights-win case); the `arrangement` field and code flag; Mixed together for skills of the same size class inside today's packer; the Q-M1 edits to PAGE_TYPES 5.2, DN-34 and `anchors.js` | `sheet/interleave.js` (new), `print-sheet.js`, `skill-codes.js`, `sheet/anchors.js`, `design/PAGE_TYPES.md`, `WORKSHEET_DESIGN_STANDARD.md` | self-test green; `ws-code-snapshot` green; a 4-skill same-size page renders mixed with no run > 2 |
| M2 | Size classes (incl. measured legacy cells) + the 2 × 2 block packer + numbering + rebalanced last page + the capacity sum and rotation across pages | `sheet/roles/mixed-practice.js`, `sheet/layout.js`, `sheet/paginate.js` | print-lint mixed rules green on the critic set at S / M / L |
| M3 | `strings.cue` (fallback rule first, then real cues family by family) + the in-cell cue + lint | `sheet/contract.js`, `sheet/providers/*`, `sheet/cell.js` | every skill has a cue or is listed on the fallback; lint green |
| M4 | Frame subtitle, readable footer, key legend by skill, the examples strip, the arrangement and examples choices in the worksheet sheet, the summary line (replacing PT-MIX-8) | `sheet/frame.js`, `sheet/roles/answer-key.js`, `teacher-print.js` (with T3) | screens and keys match §3.3 |
| M5 | Online worksheet and quiz parity; independent critic | `worksheet.js`, `quiz-take.js` | critic ≥ 8 on every page, size and host |

---

## 4. How this fits the current plan

### 4.1 Order of work (`MASTER_PLAN.md` points here)

| Order | Work | Lane owns | Runs beside |
|---|---|---|---|
| 1 | **Wave 0** (§1.4 S1–S9) + review of the open PRs #11 (needs a critic on its round-3 fixes f0d4a489), #13 (re-pin codes VA–VD; becomes the shape-grid / solid-kit starting point), #14 (quiz "Click ALL") | `tests/scripts/*`, `design/status/`, `design/cards/` | mixed-page engine M1–M3 (different files) |
| 2 | **Mixed pages M1–M5** | `print-sheet.js`, `sheet/*` | Wave 0 |
| 3 | **Teacher site 2.0 T1–T6** (T1 needs the owner) | `teacher-*.js`, `css/teacher*.css`, `index.html` teacher markup | templates (step 4) |
| 4 | **Templates by leverage** (§1.5); the paused lanes restart with precritic: Lane D print backlog, the fraction key (keys show 2/8 = 1/4, owner 2026-10-17; both touch `print-sheet.js`, so one after the other and after M2), Lane B answer + regroup boxes, place-value write-value, the decimals key fault (AK-4 on `add_decimal`, same fix pattern as `mult_properties`), the skip-count owner answers still to build (wide rows wrap and keep size; phone card opens at the first box), the number line 5.2 later steps (a time line in hours and minutes for `measurement:elapsed_*`; D9 band tightness) | `sheet/cells/<template>.js`, the generators | Teacher site 2.0 |
| 5 | **Lessons 6–10 and the rest of the owner's list** (Wave 8) — resume `claude/sweet-newton-c8wrv1-wip-detailed-lessons-2` (patches in `design/lesson-planner/wip-2026-10-17/`) | `js/modules/lessons/detailed/`, `data/curriculum/detailed-lessons.json` | any lane |

At most three lanes at once, each owning its files; deploys use the S5 runner.

### 4.2 Coverage — every planning document and open item

| Document / item | Where it lands |
|---|---|
| MASTER_PLAN Wave 1 (1.1–1.10) | live, except 1.8 print backlog (Lane D) and Lane B answer boxes → §4.1 step 4 |
| Wave 2 (catalogue and tags) | done (all WRM years and site lessons, 1,042 tags, 0 problems); feeds §1.5 |
| Wave 3 (simple teacher side, WRM page, MAP strand picker, sets) | Teacher site 2.0 (§2): the WRM page → Lessons; the MAP strand picker → Skills › Browse by; sets → the tray / My sets |
| Wave 4.1 skill worksheet + Fade supports (problems / page / packet) | §2.5 (Faded packet = across the pages chosen) |
| Wave 4.2 mixed worksheet (weights, prerequisites) | §2.5 + §3 |
| Wave 4.3 quiz on the Practice engine | §2.4 Quiz ("How many versions? 1–6", no letters, Q-W3; Save → the teacher's list, Share → `?quiz=` link) |
| Wave 4.4 answer-key options | built; in More options |
| Wave 4.5 other page types leave the UI | §2.5: no page-kind chooser; old codes decode |
| Practice pages A–J, versions on practice papers | replaced by §2.5 (owner 2026-10-23, decided) |
| Wave 5 (redo existing skills), 5.2 number line (built), 5.3 same skill with different supports | §1.5; 5.3 needs a share-code decision (Q-H3) |
| Wave 6 (new skills incl. MAP 6.2–6.4) | §1.5 template order |
| Wave 7 (Seesaw / Classroom trial, game modes) | unchanged, after Waves 5–6 |
| Wave 8 (lessons, owner list of 67) | §4.1 step 5 |
| Wave 9 (stretch / thinking pages) | unchanged, after Wave 8 |
| ROADMAP P7 one renderer, P8/P9 families, O options, T teacher track | P7 largely live; P8/P9 → §1.5; O live (options + 114 presets); T → §2. ROADMAP §4 definition of done per family is unchanged |
| TEACHER_SCREENS: home six tiles | replaced by §2.3 (Q-T1) |
| TEACHER_SCREENS: make quiz by CCSS / EE / WRM / lesson, tags, scores | §2.4 Quiz |
| TEACHER_SCREENS: gallery by default, Big 3 / 4 / 5, saved sets, pick many | §2.3 Skills + §2.4 tray |
| LESSON_LIBRARY_PLAN §8e three papers | Practice = Print, Quiz = Quiz, Lesson = Lessons |
| LESSON_LIBRARY_PLAN §8f one worked example on top | kept as "One example at the top"; "with each problem" is Q-W2 (reuses `anchors: 'side'`) |
| PAGE_TYPES 5.2 PT-MIX (shuffled); PT-MIX-8 | §3; PT-MIX-8 → the summary line (§3.3); the default-arrangement edits under Q-M1 |
| LESSONS_LEARNED L1, L3, L6, L10 ("NEW"), L9, L11 | §1.4 S2 (+ L11 steps-beside-drawing as a print-lint rule) |
| RUBRIC | bar unchanged; near-miss re-check rule added under §1.3 safeguards |
| PRESET_SKILLS: 9 options not made + 9 build-list options with `preset: true` | made when their template / option is built (§1.5) |
| `design/audit/runs/next-session/CARRY-BELOW-SPEC.md`, `design/audit/runs/next-session/PV-IDENTIFY-WRITE-VALUE-SPEC.md`, `design/audit/runs/wave1-B/REGROUP-BOXES-SPEC.md` | §1.5 (stack / long multiplication) and §4.1 step 4 |
| HANDOVER-2026-10-17: PRs #11, #13, #14 | §4.1 step 1 |
| STATUS §7: one deploy-gate list | §1.4 S5 |
| STATUS §7: teacher files live vs branch | §2.10 T1 |
| STATUS §7: BACKLOG items with no wave owner | §1.5 item 4 |
| STATUS §7: research logins missing | Q-H4 |
| STATUS §7: 5.3 share-code decision | Q-H3 |
| STATUS §7: decimals AK-4 key fault | §4.1 step 4 |
| STATUS §7: number line 5.2 later steps (time line in hours and minutes for elapsed-time skills; D9 band tightness) | §4.1 step 4, with the number line's own family |
| STATUS §7: an agent cannot see its own effort setting | Q-S1 relies on the profile (`mq-opus-low` / `mq-opus-medium`), not on the agent; the orchestrator records the profile per lane (S8) and states it in each brief, as CLAUDE.md "Agents" already asks |
| STATUS: `reading_ruler_hard` doubled answer area; print-lint baseline 458/33 | §1.4 S9 |
| STATUS: skip-count lane (merged and deployed 2026-10-17); owner answers on wide rows and the phone first view still to build | §4.1 step 4 |
| STATUS: phone pass (deferred list and its owner questions: disk mat at 390, count-row arrows at 390, N11 first view) | after Teacher site 2.0 (Chromebook first, owner 2026-10-09); questions asked at the start of that pass |
| SUPPORTS, EXTENSION_PLAYBOOK, WRM_ALIGNMENT_PLAN, LESSONS_VISION | unchanged; reached through the spec cards |

### 4.3 Owner questions (asked once; each has a recommended answer)

| # | Question | Recommended |
|---|---|---|
| Q-S1 | Use the stronger, slower builder for the first skill of each new kind of drawing, and again for any copy that fails a review; keep the quicker builder for the other copies? (This changes the builder rule in CLAUDE.md.) | Yes |
| Q-S2 | When a review fails only by a whisker (every failing mark is a 7, nothing lower), re-check just the failed pages, every changed page and a fresh 1 in 5 of the rest, instead of re-grading everything? Every page must still reach 8. | Yes |
| Q-S3 | Let each work lane keep its own progress notes (joined into one status page automatically), so lanes stop clashing when their work is merged? | Yes |
| Q-M1 | When a worksheet has 2 or more skills, mix the problems together by default? Practice printed from a lesson stays in sections, because the lesson's skills are new. | Yes |
| Q-M2 | If the skills you chose cannot all fit on one page at least twice each, should Print add pages (it tells you) rather than print some skills only once? | Yes, add pages |
| Q-T1 | Replace today's home screen with: the site opens on Skills, ticked skills go to a tray with Print · Quiz · Share? | Yes |
| Q-T2 | Make quizzes from the same tray (Quiz button) and retire the separate quiz builder? Pupils take quizzes exactly as today, and old quiz links keep working. | Yes |
| Q-T3 | Keep "Skills to be made" on each lesson and maths area (folded away), and take its separate screen out of the menu? | Yes |
| Q-T4 | Show grades as plain numbered labels, so colour only ever means the maths area? | Yes |
| Q-T5 | One share link for pupils, with the other kind of link under More options? | Yes |
| Q-T6 | Colour board A (six maths-area colours) or board B (eight colours, each in four strengths)? Either way the main button is bold black, and both are safe for colour-blind teachers. | B |
| Q-W1 | No lettered A–J pages; "How many pages?" for section, single-skill and mixed pages | **Decided by the owner, 2026-10-23** |
| Q-W2 | Offer "An example with each problem" again? It was dropped on 2026-09-26 because it made pages with only one problem. | Yes, but only when at least 2 example-and-problem pairs fit the page at the chosen size (otherwise the choice is greyed out with the reason), and never on mixed pages |
| Q-W3 | For quizzes, "How many versions? 1–6" — each version with its own order and answer key, no letters? | Yes |
| Q-H2 | Use the shape drawings already made (pull request #13) as the start of the shape pages, rather than building them again? | Yes |
| Q-H3 | Allow the same skill twice in one set with different supports (for example once with the number line and once without)? Old codes keep working. | Yes |
| Q-H4 | For research on MathWorksheets4Kids and IXL: add the logins to the cloud workspace's private settings, or research from their public pages once per kind of drawing? | Add the logins |

---

## Glossary (for builders)

- **Precritic** — the automatic checks a builder runs before an independent critic grades the work.
- **Template / kit cell** — the shared drawing code in `js/modules/sheet/cells/` that many skills use.
- **Golden render** — a saved, approved picture and fingerprint of a page, used to spot what changed.
- **Spec card** — the short, signed brief for one template or skill.
- **Size class / unit grid** — how many grid units a problem's box takes on a mixed page (1 × 1, 2 × 1, 2 × 2 …).
- **DN-34, BD-10, PT-MIX-n, L1–L11, Q-…** — rule ids in WORKSHEET_DESIGN_STANDARD, PAGE_TYPES, LESSONS_LEARNED and this file.
- **ΔE (CIELAB ΔE76)** — how different two colours look; about 2 is barely visible, 20+ is clearly different.
- **Deuteranopia / protanopia** — the two common kinds of red–green colour blindness, simulated with the Machado 2009 matrices.
- **Ramp** — one colour in four strengths (tint, soft, bold, deep).
- **Weights win** — when a skill is most of a mixed page, its run cap rises instead of the teacher's weights being cut.
