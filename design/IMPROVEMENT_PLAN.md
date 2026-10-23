# Improvement plan — faster building, a simple teacher site, truly mixed pages (v6.1, 2026-10-23)

## In short (for the owner)

1. **Faster building, same quality.** Most of the time goes on critic rounds (median about 5 per lane), and most of
   what critics find could be found by a machine first. So we build those checks, make every builder pass them before a
   critic sees the work, build the shared drawings (templates) first so new skills become quick to add, and run the
   deploy checks in parallel. The biggest step (§1.6) covers **every product — skills, worksheet types, the three
   papers and lessons**: each shared engine (a drawing, a page type, a paper, a lesson shape) is approved once across all
   its sizes and options, and then new skills and lessons on it are made as data, drafted automatically from the
   skills, checked by machine on every page and read by an independent reviewer as a batch. Up to six work lanes run at
   once. The bar does not move: every page still scores 8 or better, every check still runs before the site is updated,
   and a spot-audit each wave withdraws an approval if any page falls below 8.
2. **A simple teacher site.** Four places instead of eleven: **Skills**, **Lessons**, **Classes** and your profile. Tick
   skills and they drop into a tray at the bottom with three buttons — **Print · Quiz · Share**. Printing, sending a code
   or making a quiz takes 3–4 steps. Options appear only when you ask for them.
3. **Bold colour on purpose.** Each maths area has its own strong colour (eight of them, each in four strengths), used
   everywhere that area appears; areas taught in the same grade stay easy to tell apart for colour-blind teachers too, and
   every colour also carries the area's name and icon. To stay safe for colour-blind teachers, three of the eight are
   light rather than deep (mint, sky blue, lime), so their chips show by a thin outline; the one button you should press
   is bold black; everything else is calm. Pupil pages stay black and white. You pick between two colour boards first.
4. **Worksheet choices in plain words** — no A / B pages: How many pages? · How often each skill comes up · Mixed
   together / In sections / One skill per page · Examples · Size. A small preview, and the PDF is the full view.
5. **Truly mixed pages.** Today "mixed practice" prints one band per skill. We build the mixed-together page that the
   design rules already describe: problems from different skills side by side, never more than two of one skill in a
   row (unless one skill is most of the page), each problem with its own short instruction, the page full.
6. **Owner decision (2026-10-23): every skill that is live makes every kind of worksheet first.** Making new lessons —
   the short lesson (our original lesson maker) and the longer V22 lesson — moves to a later wave, if needed (§1.6.3).
7. **What you need to answer:** the questions in §4.3 (each has a recommended answer).

Sections 1–3 hold the detail for builders; §4 shows how it fits the current plan and lists every open item.

Owner request (2026-10-23), with later additions in the same conversation: speed up building while keeping the same
high quality; a streamlined teacher site like an Apple product (3–4 steps, visual / colour / spatial hierarchy); a fix for
truly mixed practice pages; bold, clear colouring with a much wider palette, used on purpose for hierarchy and
organisation; no lettered A/B pages — plain options, with "how many pages" for section, single-skill and mixed pages;
no full preview on the website, but a small preview of the first page (or the first 2–3 pages when they differ).

Built from three audits on 2026-10-23 (the build history and gate timings; the teacher site driven in a browser at 1366
and 390 px; the print engine with a test render) and graded by an independent critic (rounds 1–4 FAIL; round 5 PASS on v5 — A 8 · B 9 · C 9 · D 8 · E 8 · F 9 · G 9; v5.1 applies that round's remaining fixes, confirmed by a fresh check: PASS holds, A 8 · B 9 · C 9 · D 9 · E 9 · F 9 · G 9).

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
| Builder escalations (STATUS §9) | 14 recorded: 13 to Opus medium, 1 from Sonnet to Opus low (Lane C); each after the same defect survived 2–5 rounds at the lower setting (Y2–Y3 tagging escalated at round 12, after its last defect survived rounds 10 and 11; Y1 site lessons, skip-count and detailed lessons 1 and 2 also after 2) | the cheap first pass on new, hard work costs 2–5 extra rounds |
| Deploy gates, run one after another | ≈ 80 min; screen-slots 22, chromebook-fit 17.4, teacher-wrm 12 + 12 = 80 % of it | |
| Red at deploy | `ws-print-lint --source kit` FAILs at a standing 458 findings / 33 documents (accepted baseline ≤ 461/33); `ws-screen-slots` FAILs intermittently on `reading_ruler_hard` | a "green" precritic must compare against a pinned baseline |
| Documents an agent reads | ≈ 740 KB (≈ 185 k tokens) — WORKSHEET_DESIGN_STANDARD 151 KB, PAGE_TYPES 187 KB, PEDAGOGY 131 KB, SKILL_CELL_CONTRACT 129 KB, STATUS 91 KB (KB = 1,000 bytes, `wc -c` on 2026-10-23) | |
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
| Spec cards instead of the full standards | the card leaves out a rule | builders use cards; **critics keep reading the full standards and RUBRIC**; a card-coverage test fails if any rule id that a critic cited for that family in past reports is missing from the card; it runs again against the current rule-id index when each build starts, so a rule added after the card was signed is caught |
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
| S7 | **Process rules** (after the owner approves Q-S1–Q-S6): template-first order; one model per template per role; batch critic with the §1.3 safeguards; near-miss re-check (minimum-based trigger); flakes logged; signed spec card; first build of a new template, and any failed copy, at Opus medium; builder report = precritic output | `CLAUDE.md`, `design/audit/LESSONS_LEARNED.md`, `design/audit/RUBRIC.md` | recorded; the next lane briefs use them |
| S8 | **Metrics** — first the defect tally of every past critic report (class × report); then rounds to PASS, hours, findings per class and the agent profile used (the profile name is recorded, since an agent cannot see its own effort setting) per lane; reviewed after every template; a rising class becomes the next check | `design/status/defect-tally.csv`, `design/status/metrics.md` | tally committed; filled from Wave 0 on |
| S9 | **Clear the red gates** — fix `reading_ruler_hard`'s doubled answer area; pin the print-lint baseline (458/33) per skill | the skill's generator / cell | screen-slots green; baseline file committed |

**What `ws-precritic` runs**

| Flag | Gates |
|---|---|
| `--skill <cat:skill>` (repeatable) | `ws-node-lint` (*new*), `ws-providers-unit --skill` (*new flag*), `ws-content-audit --skill`, `ws-options-verify --skill`, `ws-presets-unit` (when presets touch it), `ws-print-lint --source kit --skills --baseline` (S / M / L, every role), `ws-screen-slots --skills --baseline` (*new flag*), `ws-screen-answer --skills`, `ws-chromebook-fit --skills`, `ws-code-snapshot`, `ws-boot-smoke` |
| `--template <id>` | the above for every skill using the template + `ws-panes-unit` / the template's fixture test + `ws-grade-render --template` (*new flag*) contact sheet |
| `--role <role>` | `ws-grade-render --roles <role> --skills <the role sample>` + `ws-print-lint --roles <role>` on the same skills. The role sample is `tests/fixtures/precritic/role-sample.json` (new in S1): the first live skill of each of the 20 largest families in `design/SKILL_CATALOGUE.md` order, pinned in the file and changed only with a STATUS note |
| `--teacher` | `ws-teacher-shell`, `-library`, `-preview`, `-quiz`, `-wrm --grade --lesson` (*new flags*), `ws-teacher-flows` (*new*, §2.9), `ws-teacher-tokens` (*new*, §2.8), `ws-plain-words --check` |

At deploy, S5 shards `ws-screen-slots --category` (exists) and `ws-chromebook-fit --category` (*new flag*) across the two
browser slots.

**Backtests for the new checks**

| Check | Backtest |
|---|---|
| Lone item / lone state on a page | skip-count 359802c5 (critic r4 D12) fails; b19172b4 passes |
| Text ≠ generator (claims of counts, kinds, ranges vs 300 seeded items) | WRM page 848d7d3f (critic r8 M12) fails; d515aa05 passes; WRM tagging Y2–Y3 c3d08a69 (graded by critic r13 in 5aa0ffce, N13: Y3.B6.S10 marked full on circles) fails; 89f30a64 (the TITLEREP gate, round 14) passes |
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

### 1.6 Vastly faster for every product: certify the engine once, make every instance as data (owner 2026-10-23)

Owner: "make sure the plan also covers increasing the speed of generating lessons, worksheet types, etc. … do this for
all paper, lesson, worksheet types … figure out how to vastly improve the speed while keeping quality the same."

**Owner ruling, 2026-10-23:** "Any skill that we have live should be able to make the different worksheets, although
custom lessons — the short lesson (our original) and the longer V22 — can be made in a later wave if needed." So the
worksheet types come first (§1.6.3, E2–E3), and the lesson parts of this section (the lesson compiler, lesson shapes,
the intervention library, E4) are designed here but built only when that later wave starts.

§1.1–§1.5 cut the number of critic rounds. This section changes **what** is graded, which is the bigger lever: today
every skill, every page type and every lesson is graded page by page, so the work grows with the number of products.
After this section it grows with the number of **engines**, and products made on a certified engine are data.

#### 1.6.1 What each product costs today

| Product | How it is made today | What it costs |
|---|---|---|
| **Skills** (715 live) | built and graded one by one (§1.1) | median ≈ 5 critic rounds; when the drawing already existed, 114 preset skills took two builder runs |
| **Worksheet types** — the 23 page roles in `js/modules/sheet/roles/` (Independent, More Practice, Guided, Scripted Model, Opener, Pre-skill check, Review, Test, Mixed, Word problems, Today's Number, fact rows and probe, answer key, Error analysis, True or False?, Reason It, Stretch …) | PT-CMP-1: any skill on any role, every role with a key (PT-CMP-5); a role is graded only with the skills the current lane happened to touch | every new skill silently owes 23 roles × S / M / L × key. Only **261 of 715** live skills have a real provider (`workedSteps`, `wrongAnswer`, `strings`, `misconceptions`; count from `getProvider().real`), so for the other 454 the Model, Guided, Opener, anchor-chart, Error-analysis, True-or-False and Reason-It roles print default-adapter output |
| **Papers** — Practice, Quiz, Lesson (LESSON_LIBRARY_PLAN §8e) | Practice and Lesson on the sheet kit; Quiz in the separate legacy quiz builder (§2.1) | two engines to grade for one kind of paper |
| **Detailed lessons** (owner list: 67) | each lesson a hand-written description of 307–350 lines (`js/modules/lessons/detailed/<id>.js`) plus `RESEARCH.md`; the critic re-grades the whole 21–31-page pack every round | 5 passed (lessons 1, 2, 3a, 4, 5) between 21:20 on 10-16 and 03:25 on 10-17 (commit log), in 3–4 rounds each (`data/curriculum/detailed-lessons.json`); 3 of the 5 builders escalated (STATUS §9); lesson 6 failed round 1, lesson 7 is ungraded; 62 still to make |
| **Intervention library** — a lesson for every WRM small step (872, MASTER_PLAN Wave 8) | the standard lesson maker (`buildSheet({role: 'lesson'})`) from `prereqs.js` lesson data | not started at scale; page-by-page grading would mean thousands of pages |

**What the 17 lesson critic reports found** (`design/lesson-planner/lessons/*/critic-r*.md`; lesson 1 = `g2-nbt3-read-write-1000`, 2 = `g1-oa1-bar-model-wp-20`, 3a = `g3-oa5-mult-properties`, 4 = `g3-oa9-mult-table-patterns`, 5 = `g3-oa9-input-output-rule`; D numbers are round 1 unless marked), by class:

| Defect class | Examples | Machine check |
|---|---|---|
| Repeats: an exit or Practice item that is a modelled or Practice item again, turned round or near-twin | lesson 2 r3 D1 / D3; 3a D6; 4 D3, D5; 5 D1; 6 D2 | E24 (LR-5 pool) exists; extend to turned facts and near-twins |
| A task practised that no page models; two new things at once | lesson 2 D3 (add-to); 1 D1 (one of three forms); 3a D2; 5 D3 | **new**: every task kind dealt on a Practice or exit page appears on a modelled panel or script row before it (task kinds from the generator) |
| Teacher text that does not match the pupil pages (wrong panel, page, letter, answer; raw placeholder) | lesson 2 D4–D6, r3 D2; 1 D3, D7; 3a D7; 5 D5, r2 D7, D8; 4 D8 | E29 / E38 exist; extend: every page, panel, step and item a teacher page names resolves to the real one |
| Answer given away or coached (Say band, hint, exit help) | lesson 4 D1, D2; Guided = Independent (4 D6) | **new**: no Say, hint or Steps text holds the item's key value; Guided carries a hint Independent does not |
| Layout: slot below minimum, page under-filled, broken grid, empty quadrant | lesson 2 D1; 1 D5; 3a r2 D1; 4 D4 | `ws-print-lint`, E9 |
| Numbers off the band; edge cases missing; an owner ruling broken (1,000 "board only") | lesson 2 D2; 1 D2, r3 S1; 3a D1 | **new**: the lesson card declares ranges, edge cases and rulings; the check reads them against the dealt items |
| Assessment validity: the exit cannot measure the skill; a distractor is not the misconception it names; word problem off-skill | lesson 2 D8; 3a D4, D5; 5 D4; 4 D7 | partly: each distractor must carry a misconception id from the provider; the rest stays with the critic |

Six of the seven classes are measurable; the critic's time should go on the seventh.

#### 1.6.2 The method: certified engines, data instances

| Engine (certified once) | Its instances (made as data) |
|---|---|
| a **cell template** (`stack`, `shape-grid`, `bar-model` …) | every skill, option and preset drawn by it |
| a **page role** (Independent, Guided, Scripted Model, Review, Test …) | that role for every skill whose template is certified |
| a **paper** (Practice; Quiz = Practice + scoring, once T3 retires the separate builder; Lesson) | every worksheet request from the §2.5 choices |
| a **lesson shape** — the five passed lessons are the first members of five shapes: read / write a number in its forms (lesson 1); a bar-model word problem (2); a property of an operation (3a); a pattern on a table (4); a rule table (5) | every lesson of that shape = shape + its skill(s) + WRM step + the owner's choices on its card |

**Certifying an engine** means an independent critic grades it across its **envelope** — every size S / M / L, both
looks, every option value, every role it serves, the number ranges, the three screen hosts — with:
- **every point of the envelope checked by machine** (the kit is pure, so `ws-print-lint`, `coverage()` (PT-CMP-4) and
  the precritic rules run in node, in seconds, over all of it);
- **a critic sample that covers every pair of option values at least once** (all-pairs sampling keeps it to tens of
  pages, not thousands), plus a random 20 % at full scale and every page whose drawing fingerprint has never been graded;
- the result written to `design/audit/certified/<engine>.json`: the envelope, the drawing fingerprint, the rule-set
  version (RUBRIC, standards, LESSONS_LEARNED), the pages graded and their scores.

**Making an instance** on a certified engine:
- the builder writes data (a skill entry, option values, a preset, a lesson card), not drawing code;
- the precritic checks it by machine, including "inside the envelope" — a new option value, size, number range or role
  is **outside** and sends that page to a full grade;
- an independent critic reads **every instance** on a contact sheet (one page and its key each, plus the screen card)
  for the two criteria that depend on content — C1 ease of use and C2 educational value (RUBRIC §2) — and grades a
  random 20 % of the instance pages at full scale on all four criteria; C3 spacing and C4 standard fidelity come from
  the certified engine, because the drawing and layout are the engine's (same fingerprint);
- the owner has already signed its card (the pedagogy choices), so the critic is not the first to see a design question.

#### 1.6.3 By product

- **Skills** — §1.5 as written, with the envelope: a template is certified once, then its ≈ 111 build-list entries,
  options and presets are data (the presets showed the pace).
- **Worksheet types — first, for every live skill (owner 2026-10-23).** "Every worksheet" means every choice a teacher
  can make for a skill in the worksheet sheet and the Quiz (§2.4–§2.5), each with its answer key, at S / M / L, on paper
  and on the three screen hosts:
  - the Practice page at any page count, as One skill per page, In sections or Mixed together;
  - Examples: None · An example to start each group · An example with each problem;
  - Fade supports: Faded problems · Faded page · Faded packet;
  - fact rows and the timed check (fact skills; any other skill is rerouted to the Computation grid or Equation drill
    with a note, PT-CMP-2);
  - Word problems (story skills; any other skill prints its own cell in the band, PAGE_TYPES §10);
  - the Quiz paper (the Test role) with 1–6 versions; Review (Daily Spiral); Pre-skill check (Practise pre-skills);
    Today's Number (place-value skills).

  Today an example prints only for the 261 skills with real worked steps; the other 454 print "No worked example for
  … yet" (`sheet/anchors.js` `ineligibleNote`). Steps 1 and 2 below close that gap.
  1. **Certify each worksheet role** on the role sample (`tests/fixtures/precritic/role-sample.json`, 20 families) ×
     S / M / L × both looks × its key: Independent, More Practice, Mixed (with §3), Review, Pre-skill check, Test, Word
     problems, Today's Number, fact rows, fact probe, answer key, and the example and fade modes on them. The
     lesson-packet roles (Opener, Scripted Model, Guided page, K one-page lesson, anchor chart, Steps card) are
     certified with the later lesson wave. A skill on a certified template
     then gets every certified role without a per-role grade (machine `coverage()` for every skill × role × size, keys
     included, plus the contact sheet).
  2. **Provider pass, family by family:** the 454 skills on default adapters get real providers as data — `workedSteps`
     from the template's step grammar, `wrongAnswer` and `misconceptions` from the signed card's Misconceptions section
     (S3 card item 6), `strings` from the instruction library. `ws-providers-unit` checks each: the steps reach the key,
     the wrong answer is a tagged misconception, no hint holds the answer. This gives every live skill its worked
     examples and fade steps, and is what the later lesson compiler and lesson roles need.
  3. **Done when** every live skill (715 today) prints every worksheet above with its key at S / M / L and on the screen
     hosts: machine `coverage()` for every skill × role × size × example / fade mode, plus the critic's family contact
     sheets with the 20 % full-scale sample (§1.6.2).
  4. The thinking roles (Error analysis, True or False?, Reason It, Stretch) stay paused (owner 2026-10-09: "for a wave
     after the lessons are done", MASTER_PLAN Wave 9); with lessons now in a later wave, Q-W4 asks whether they still
     wait. When they start, they follow step 1 and are cheap, because step 2 has already given every skill its
     misconceptions and wrong answers.
- **Papers** — the paper composer is certified once on an all-pairs sample of the §2.5 choices (pages 1 / 3,
  weights equal / unequal, the three arrangements, the examples choices, S / M / L) with the certified roles inside it.
  Quiz becomes Practice + a scoring layer (T3), so it is certified by certifying the scoring layer, not a second engine.
- **Lessons — a later wave, if needed (owner 2026-10-23).** Nothing below is built until that wave starts; the five
  passed detailed lessons and the standard lesson maker stay live as they are. When it starts:
  1. **Lesson shapes.** Classify the owner's 67 lessons (and, later, the intervention steps) into shapes; the first two
     lessons of a new shape get a full critic on every page (this certifies the shape).
  2. **The lesson compiler** (`compileLesson(card)`, `js/modules/lessons/compile.js`, new): from the signed lesson card
     (WRM step, CCSS / EE, shape, skill(s) with option values per chunk, ranges, edge cases, rulings) it writes the
     description: atoms and the pre-skill check from the skill's prerequisites; chunks from the option ladder (one new
     thing per step, PEDAGOGY P-1); the anchor chart, scripts and Steps from `workedSteps` and `strings`; the Guided fade
     from the Guided role; Practice and exit from the generators with the LR-5 pool; the mistakes table and Check
     Question distractors from `misconceptions` / `wrongAnswer`; vocabulary from the skill. The builder writes only what
     the compiler cannot — the story and hook, shape-specific teaching notes — and edits. Target, measured by S8: the
     hand-written part of a description falls from ≈ 330 lines to under 100.
  3. **Lesson precritic:** `ws-detailed-lesson --check` plus the three new checks in §1.6.1 (modelled-before-practised,
     nothing given away, rulings and ranges), each with a backtest on a failed lesson commit, and the extended E24 / E29.
  4. **Grading a lesson of a certified shape:** teacher pages (unique text) graded in full; pupil pages made by
     certified roles on the contact sheet + 20 % at full scale; any page with a new fingerprint in full.
  5. **Proof first:** recompile the five passed lessons from cards; the compiled packs must pass `--check` and keep
     ≥ 8 on a full critic before the compiler is used for lesson 6 onward.
  6. **Intervention library:** the standard lesson maker is the "standard lesson" shape; once the provider pass covers a
     family, that family's WRM steps are compiled and graded by family on contact sheets with the 20 % sample.
- **Lessons of the White Rose page and the site** keep their existing gates (`ws-teacher-wrm`, `ws-site-lessons`); a
  compiled lesson is placed on its WRM step by its card, as today.

#### 1.6.4 More lanes without collisions

- **No lane edits a shared file.** Each lane writes a manifest (`design/lanes/<lane>/manifest.json`: new skills with
  their SKILLS entry, `SKILL_STANDARDS`, `SKILL_WRM`, search terms, presets, lesson cards); an integrator
  (`tests/scripts/ws-integrate.mjs`, new) applies manifests in merge order — appending skill ids (share codes stay
  append-only), regenerating the catalogue, coverage reports, the lesson registry (`lessons/detailed/index.js`,
  `detailed-lessons.json`) and STATUS (S6), and stamping index.html once. This removes the conflict class behind 152
  merge commits and 10 conflict fixes (§1.1).
- **One lane per cloud session.** A container has 4 cores and two browser slots; ≈ 14 agents in one container starved
  them (STATUS:91). Each lane in its own session has its own slots; with most checks in node, a lane needs the browser
  only for its final renders.
- **Up to 6 lanes at once** after Wave 0 (one per template family or lesson shape), instead of 3 (Q-S6). The limits are
  then critic capacity and the owner's signing time, not machines.
- **The owner signs cards in batches** — a template family's cards, or a lesson shape's next five lessons, in one
  sitting, each question with a recommended answer — so no lane waits mid-build.

#### 1.6.5 Why quality stays the same

| Risk | Safeguard |
|---|---|
| A certified engine hides a weak instance | every instance is still read by an independent critic for C1 and C2 on the contact sheet; 20 % get a full four-criterion grade; content checks (content-audit, text ≠ generator, LR-5, nothing given away, misconceptions tagged) run on every item |
| An instance outside what was certified | the precritic's envelope check sends it to a full grade |
| The engine changes after certification | a new drawing fingerprint voids the inherited scores of every page it touches (golden diff, S4); those pages are re-graded |
| Inherited scores drift from reality | **an inheritance audit each wave**: a fresh critic grades a random 5 % of inherited pages at full scale; any page below 8 withdraws the engine's certificate, and its family is re-graded in full |
| Compiled lessons are bland or wrong | the five passed lessons must recompile and pass first; teacher pages are always graded in full; the owner signs every lesson card |
| The rule "8 or better, everywhere" | unchanged in substance: every page of every product is ≥ 8, either graded directly or inherited from a certified engine with its source listed in the final PASS; the change in how a page counts as graded is the owner's call (Q-S4) and is written into CLAUDE.md and RUBRIC only after he agrees |

#### 1.6.6 Phases (added to Wave 0, §4.1)

| Step | Work | Files | Done when |
|---|---|---|---|
| E1 | Envelopes, all-pairs sampling, certificates | `tests/scripts/ws-envelope.mjs` (new), `ws-grade-render.cjs` (`--envelope <engine>`, new flag), `design/audit/certified/` | the `stack` template and the Independent role certified from their existing passed renders; the certificate lists every page and score source |
| E2 | Certify the worksheet roles on the role sample (§1.6.3 Worksheet types item 1) | `sheet/roles/*` (fixes only), `role-sample.json` | each listed role certified; `coverage()` green for every skill × role × size |
| E3 | Provider pass by family (454 skills) | `js/modules/sheet/providers/*`, the cards | `real` providers 715 / 715; `ws-providers-unit` green; every live skill prints every worksheet type with its key (§1.6.3 item 3) |
| E4 (later lesson wave, if needed) | Lesson shapes, compiler, lesson precritic, generated lesson registry; recompile lessons 1–5 | `js/modules/lessons/compile.js` (new), `js/modules/lessons/shapes/*.js` (new), `tests/scripts/ws-detailed-lesson.cjs` | lessons 1–5 recompiled, `--check` green, full critic ≥ 8; then lesson 6 onward from cards |
| E5 | Lane manifests + integrator; one lane per session | `design/lanes/`, `tests/scripts/ws-integrate.mjs` (new) | a week of six lanes with no shared-file conflict |
| E6 | Inheritance audit each wave | `design/audit/certified/audit-<wave>.md` | the first audit run and recorded |

**Expected effect** (targets; S8 measures them): skills on a certified template made like the presets — a family per
builder run; a new skill gets all certified roles with no per-role grading; lessons of a certified shape in one critic
round instead of 3–4, with under a third of today's hand-written text; six lanes instead of three. Together this aims at
several times today's throughput (≥ 5× on the backlog of skills and lessons); if S8 shows less, the next audit says why.

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
| **Skills** (opens here) | one gallery: a big search box; **Browse by** Maths area · White Rose step · Standard (CCSS / EE, each marked covered / not yet — today's Standards coverage view, owner 2026-09-25, `teacher-standards.js`) · MAP strand ("Practise by task" / "By representation", the MAP strand picker) · My sets; Grade chips; Big 3 / Medium 4 / Small 5 thumbnails or a list (60 per page, filtered by grade by default); ticking puts skills in the tray | Home, Skills library, Send a skill set, Print worksheets, the quiz builder's picker, MAP "Practise by task / By representation" |
| **Lessons** | White Rose + detailed lessons in the 2026-10-17 layout (Grade → maths area → lessons in order → the lesson panel on the side); **opens where the teacher was last** (last grade, area and lesson, the next lesson marked "Next"), with a search box for a lesson by name or code; the lesson panel buttons: **Print lesson** (primary, for the lessons already made — the standard lesson maker and the five detailed lessons; new lessons wait for the later lesson wave) · Print practice · Share practice · **Practise pre-skills** (MASTER_PLAN 3.4); the lesson's planned "Skills to be made" stay on the lesson and the maths-area summary (owner 2026-10-17), collapsed | White Rose lessons, the detailed-lesson card in Print, the Skills to be made screen |
| **Classes** | Run on the board, quiz results, MAP tests (running and results), progress | Run practice, Quizzes list, MAP tests, Progress |
| **(profile menu)** | Settings, Switch to pupil view, Teacher help | the nav footer |

**Below 820 px** (tablet portrait, phone): the left nav becomes a **labelled bottom bar** with the four places (icon +
word, ≥ 44 px), replacing today's unlabelled 72 px icon rail; the tray collapses to one bar, **"3 skills ▸"**, with the
three buttons beside it; tapping the count opens the chips. The tray bar sits directly above the bottom bar (56 + 64 px)
and the page is padded by both, so nothing scrolls under them; sheets (worksheet, Quiz, Share, a chip's options) open
full screen above both. One column; the preview never comes first.

### 2.4 The tray

- Fixed at the bottom of Skills and **always visible, even when empty**: then Quiz opens "Build from" (a standard, a White
  Rose unit or step, a lesson), and Print and Share are greyed with "Tick skills first". With skills, it shows them as
  chips in their maths-area colours; drag to reorder.
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
| **How many pages?** | 1 · 2 · 3 · 4 · 5 …, for every arrangement (owner: section pages, single-skill pages and mixed pages alike); every page has new numbers; the key follows. Mixed together: each page is a full mixed page with the weights kept. In sections: the sections flow across the pages by weight; a section never splits mid-row. One skill per page: pages shared out by weight (6 pages, 3 equal skills → 2 each); the page count starts at the number of skills (the menu offers nothing lower) | 1 (One skill per page: one per skill) |
| **How often does each skill come up?** | per skill: Less · Equal · More (1 : 2 : 3; a number in the chip's options) | Equal |
| **How are the problems arranged?** (2+ skills) | **Mixed together** · **In sections** · **One skill per page** | Mixed together; In sections when the paper comes from a lesson's "Print practice" |
| **Examples?** | None · **An example to start each group** (a worked example, then 3–4 problems like it, repeated down the page — today's block layout, the owner's 2026-09-26 ruling "one example on top of each block", LESSON_LIBRARY_PLAN §8f) · **An example with each problem** (Q-W2) · on Mixed together pages only: None or **One example of each skill at the top** — a short example band for each skill on that page (§3.3) | None; practice printed from a lesson: An example to start each group (its skills are new) |
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
  skill with page breaks; "An example to start each group" → `anchors: 'sections'` (an example band, then the block's
3–4 problems, `blockPlan` in `sheet/anchors.js`; the mixed-practice default today, `anchors.js:16`); "An example with
each problem" → `anchors: 'side'`; None → `anchors: 'off'` (`ANCHOR_MODES`, `anchors.js:25`); on
mixed-together pages the engine's existing compact example bands are reused and measured per page (M4). A single example at the very top of a page is not offered: the owner's ruling puts one
on each block. Old share codes and saved
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
Rose Statistics blocks already do) and grade 6 Ratio / Number system from Fractions gives eight areas. Each has four
strengths, so strength shows rank inside the area: **tint** (10 %, a group's background) → **soft** (30 %, a filter chip
at rest) → **bold** (card edge, section header band, tray chip, selected chip) → **deep** (the area's own text and
outline colour; in dark mode a light version does the same job).

| Maths area (code) | Tint | Soft | **Bold** (text on it) | Deep (on white / on tint) | Hue · L* |
|---|---|---|---|---|---|
| Counting & cardinality (CC) | #F9E9FB | #ECBEF2 | **#C026D3** fuchsia (white 4.7) | #901C9E (7.4 / 6.4) | 293° · 49 |
| Operations & algebraic thinking (OA; grade 6 EE) | #EBEAF6 | #C3C1E3 | **#3730A3** indigo (white 9.9) | #29247A (12.9 / 10.8) | 244° · 28 |
| Number & operations in base ten (NBT) | #FDF7E6 | #F9E8B5 | **#EAB308** gold (ink 9.3) | #6E5404 (7.2 / 6.7) | 45° · 76 |
| Fractions & decimals (NF) | #FEF1F8 | #FCD5E9 | **#F472B6** pink (ink 6.7) | #894066 (7.0 / 6.4) | 329° · 65 |
| Measurement — length, mass, time, money, area, volume, angles (every MD cluster except data) | #F0FDF8 | #D3F8E9 | **#6EE7B7** mint (ink 11.6) | #2E614D (7.2 / 6.9) | 156° · 84 |
| Data — the MD "represent and interpret data" clusters (K.MD.B, 1.MD.C, 2.MD.D, 3.MD.B, 4.MD.B, 5.MD.B); grade 6 SP | #F4F9FF | #DFEEFE | **#93C5FD** sky (ink 9.8) | #445B74 (7.0 / 6.6) | 212° · 78 |
| Geometry (G) | #E7F1F0 | #B7D6D3 | **#0F766E** teal (white 5.5) | #0B5852 (8.3 / 7.2) | 175° · 44 |
| Ratio & number system (grade 6 RP, NS) | #F8FEF0 | #EBFBD0 | **#BEF264** lime (ink 13.6) | #4A5E27 (7.2 / 7.0) | 82° · 90 |
| No standard / Extra lessons | — | — | **#475569** slate (white 7.6), **dashed outline** | — | — |

Ink = #111827. Tint and soft always take ink text (≥ 10 : 1). Contrast figures are WCAG ratios. **Dark mode** (page
#111318): tint = 18 % and soft = 40 % of the bold over the page, with #F3F4F6 text (≥ 5.3 : 1); the fourth strength is a
light version, ≥ 7 : 1 on the dark tint (CC #E092E9, OA #A3A0D5, NBT #F4D984, NF #FAB8DB, Measurement #B6F3DB, Data
#C9E2FE, G #87BBB6, Ratio #DEF8B2).

- **Checked for colour-blind teachers** with CIEDE2000 (the colour-difference measure closest to what people see;
  deuteranopia and protanopia simulated with the Machado 2009 matrices at full severity):
  - **Normal vision:** every pair of bold colours ≥ 20.4 apart (closest: Measurement–Ratio, which never share a grade).
  - **Colour-blind, areas that share a grade** — K: CC OA NBT Measurement Data G · 1–2: OA NBT Measurement Data G ·
    3–5: OA NBT NF Measurement Data G · 6: Ratio OA Data G (these sets come from the data under the rules in "Where the
    area comes from" below; the gate re-derives them on every run) — ≥ 12.2 apart under both simulations (closest: CC–OA,
    just above the line, so any change to either colour at T1 is re-checked before it is shown).
    Place value and Fractions, the pair critic r3 found at 8.0 in v3, are now gold and pink: 35.7 / 47.9.
  - **Colour-blind, areas from different grades:** ≥ 8.7 (Place value–Ratio). They never share a single-grade list (the
    default view); in a list across grades (a search, the "Mixed levels" filter, a tray with two grades) the grade pill,
    the area name and the area icon tell them apart, so the plan does not claim the colours alone do.
  - **Three bolds are light, by necessity:** mint, sky and lime are 300-level shades (1.5, 1.8 and 1.3 : 1 against
    white), so their chips show by the outline below. Searches for an all-deep set of eight that meets these thresholds
    found none (ours and critic r4's); board B on the T1 board shows them so the owner can judge them in place.
  - Every bold is ≥ 22.0 from error red and from the answer-key orange #C2410C in all three views. Slate is ≥ 14.6 from
    every area with normal vision and ≥ 8.7 under simulation, so it also always has its **dashed outline** and label; it
    never reads as an inactive control, because inactive controls are grey outlines with no fill.
  - `python3 design/audit/palette-2026-10-23/ramps.py` reproduces every number in this section, for board A too;
    `search5.py` (with `colour.py`) is the search that chose the set.
- **Chips — one rule for every state:** every chip has a 1 px outline, the area's deep in light mode and #E5E7EB in dark
  mode (≥ 7 : 1 against the page), because most soft fills and several bold fills are under 3 : 1 against the page
  (`ramps.py` lists them). **Selected = the bold fill + ✓ + a 2 px ring** (ink; #F3F4F6 in dark mode) — never a change of
  shade alone, so two selected chips differ by their bold colours, which the gate checks.
- **Tint and soft never name an area alone:** anything on a tint or soft fill also shows the area's name and its bold
  (an edge, a header band or a dot). So only the bold colours need to differ, and the gate checks that rule too.
- **One meaning per colour:** a hue is a maths area or error, never both; actions, places and grades are ink and neutrals.
- **Where the area comes from** (one function, `areaOf(category, skill)` in `js/modules/teacher-areas.js`, new in T2,
  used by every screen and by the gate):
  1. The skill's primary CCSS code in `SKILL_STANDARDS` (first code; MD split by cluster as in the table) — 606 of the 715 live
     skills today (retired tombstones are skipped).
  2. A code from a domain the skill's own grade does not have takes that grade's area for the same content (a two-line
     map): 6.NS.B (factors, multiples) → OA, as in 4.OA.B; 6.NS.C (the coordinate plane) → G, as in 5.G.A. This moves the
     six grade-5 skills tagged 6.NS (`coord_distance_q1`, `geo_reflect`, `reflect_x_axis`, `reflect_y_axis` → G;
     `common_factors`, `common_multiples` → OA), so no grade-5 list shows the Ratio colour.
  3. An untagged skill or a pool inside one category (`mixed_addition`, `mixed_fractions`, `geo_rotate`,
     `geo_translate` …) takes the area of a clear majority (more than half) of the tagged skills in its category — 33
     skills (probability, with no tagged skill yet, maps to Data). A pool shows its area's icon with a small "mixed" badge.
     With no clear majority the skill goes to Mixed (rule 4): `comparing:mixed_comparing`, whose category has one tagged
     skill each in CC, Measurement and Data.
  4. Pools across categories (`all_mixed`, `*_mixed` families such as `frac_dec_mixed:fdp_all`) and pools without a clear
     majority are slate, labelled **Mixed** with the mixed icon — 26 skills. Vocabulary skills are slate, labelled **Words** with a book icon — 50
     skills. Extra lessons and anything else are slate **No standard**, with the dashed outline.
  5. A lesson takes the area of its own CCSS. The 6 app DOMAINS are not used for colour.
  Counts from the data on 2026-10-23, live skills only (tagged 606 · by category 33 · Mixed 26 · Words 50 = 715);
  `node design/audit/palette-2026-10-23/areas.mjs` reproduces them and the per-grade area sets, and the gate prints them.
- **Organise by colour:** skill and lesson lists are grouped by maths area, each group on its tint under its bold header
  band, so a one-area list still shows four strengths of its colour, not one hue on black and white.
- **Never colour alone:** every colour comes with its area name and an area icon (black-and-white printers, colour-blind
  teachers).
- **Neutral backgrounds** (white; #111318 dark), no pastel washes outside the group tints. Grades are numbered neutral
  pills.

**At T1 the owner picks between two rendered boards** (Q-T6): **A** six areas (Measurement and Data share mint; Ratio /
Number system shares pink) and **B** eight areas with the strengths above. Board A uses six of the same colours and passes
the same checks (closest colour-blind pair CC–OA 12.2).

### 2.8 Type, spacing and the token gate

- Type (chrome; Andika is for pupil content): 5 sizes (12 · 14 · 16 · 20 · 28, + 36 for the page title), 2 weights (500 ·
  700); body 16. Spacing 4 · 8 · 16 · 24 · 32 · 48. Radii 8 (controls), 16 (cards, sheets). Shadows: 2. Controls ≥ 44 px.
- **`ws-teacher-tokens`** (new): only token values are used (sizes, spacing, radii, shadows, colours); at most one rank-1
  ink fill per screen; area colours only on elements carrying a `data-domain`; **CIEDE2000 between bold area colours ≥ 20
  for every pair with normal vision, ≥ 12 under deuteranopia and protanopia (Machado 2009, severity 1.0) for every pair
  of the eight area colours that share a single-grade list, ≥ 8 for any other pair; slate (No standard / Mixed / Words,
  which appears in every grade) is held to ≥ 8 from every area plus its dashed outline and its label**, where the shared pairs are derived on every run
  from the data (every live skill's grade × `areaOf()`; the "Mixed levels" filter counts as a list across grades);
  every chip and card carries the area name and icon, and in lists across grades also the grade pill (the ≥ 8 pairs
  rely on it); every bold ≥ 20 from error red and key orange in all three
  views; text contrast ≥ 4.5 : 1 on every strength in light and dark; every chip outlined (deep / #E5E7EB) and every
  selected chip ringed with ✓; every tint or soft fill accompanied by the area name and its bold; slate always with its
  dashed outline. A hue-only or ΔE76 check flatters saturated blues and purples, so the gate uses CIEDE2000 (the palette
  check is `design/audit/palette-2026-10-23/colour.py`; the palette part of the gate is built in T1, the rest in T2).

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
| T2 | Shell + tokens: four places, profile menu, the bottom bar below 820 px, tokens, `areaOf()` | `teacher-shell.js`, `teacher-ui.js`, `teacher-areas.js` (new), `css/teacher-brand.css`, `css/teacher.css`, `index.html` teacher markup, `tests/scripts/ws-teacher-tokens.cjs` | `ws-teacher-tokens` green; old screens reachable |
| T3 | Skills gallery + Browse by + tray + chip options + worksheet sheet + Quiz + Share | `teacher-library.js`, `teacher-skillpick.js`, `teacher-sets.js`, `teacher-print.js`, `teacher-preview.js`, `teacher-quiz-ui.js`, `quiz-builder.js` (save path only), `quiz-storage.js`, `teacher-map-tasks.js`, `teacher-standards.js` (Browse by › Standard), `print-sheet.js` (request normalising only), `css/teacher-library.css`, `css/teacher-quiz.css` | `ws-teacher-flows` green for every Skills flow |
| T4 | Lessons: the 2026-10-17 layout restyled, opening where the teacher was last; Print lesson / Print practice / Share practice / Practise pre-skills; "Skills to be made" folded into each lesson and area | `teacher-wrm.js`, `lesson-tomake.js`, `teacher-todo.js` (its content moves onto lessons; the screen leaves the menu in T6), `css/teacher-wrm.css` | Lessons flows green |
| T5 | Classes: board, results, MAP tests, progress | `teacher-map.js`, `dashboard.js` (wrapping only), board routing | each reachable in ≤ 2 actions |
| T6 | Redirects and aliases (incl. `#todo/…` → the lesson or area), retire old entry points (the separate Skills to be made screen, `teacher-todo.js` entry), rewrite the teacher gates; independent critic at 1366 / 1280 / 820 / 390, every action clicked through to a printed PDF or a working code | as above | critic ≥ 8 on every screen; full gates; deploy |

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
| B8 | No screen host mixes by rule: the online worksheet follows section order; the online quiz can shuffle all questions together (`sectionMode: 'mixed'`, `quiz-take.js:128-130`) or within each section (`randomOrder`, `:132-138`), the printed quiz shuffles within sections (`quiz-builder.js:1359`) and a section can be shuffled by hand (`:845`) — all random orders, none spaced or balanced | `worksheet.js`, `quiz-take.js`, `quiz-builder.js` |
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
- **When the run rule cannot be met, the weights win.** Runs are counted in **turns** (below): a turn is one box of
  2 × 1 or larger, or one block of small boxes. A skill with `major` turns among `minor` turns of all other skills can be
  kept to runs of ⌈major / (minor + 1)⌉ turns at best (Less : More = 1 : 3 on 12 clock-sized items → 9 and 3 turns →
  runs of 3). The cap becomes max(2, ⌈major turns / (minor turns + 1)⌉) for that skill, runs are spread as evenly as the
  counts allow, and the summary line says so in plain words ("Time takes most of the page, so up to 3 clocks come in a
  row"). The teacher's weights are never clipped silently.
- **Size classes:** each cell has a class (1 × 1, 2 × 1, 1 × 2, 2 × 2, 4 × 1) from its skill's `footprint.span`; where
  none is declared, the measured cell is rounded up to whole units at the page's unit width (cached per skill + options +
  size). Every template declares its span as it is built (§1.5).
- **Packing — PT-MIX-5 as written:** strips two units high built from 2 × 2 blocks; the packer takes the next item from
  the interleaved queue that fits the open block, **looking ahead at most 3 items**; after each placement it re-checks
  the run rule and the first-third rule and swaps with the next fitting item if either breaks; a final row of height-1
  cells; word problems as a closing band. Rows take their tallest cell; content never shrinks; every cell keeps ≥ 40 %
  free; a strip never splits; the last page is rebalanced.
- **Runs are counted in turns when small boxes share a block.** A 2 × 2 block may hold four 1 × 1 boxes or two 1 × 1 and a
  2 × 1. Small boxes of different skills share a block wherever both are left (a fact and a short stack side by side).
  When only one small skill can fill a block (1 × 1 facts mixed 1 : 1 with 2 × 2 clocks), that block is **one turn**,
  however many boxes it holds, and the next block must be another skill while one is left. A turn is one box of
  2 × 1 or larger, or one block of small boxes; the run rule counts turns, not numbers (facts block, clock, facts block,
  clock passes; two facts blocks in a row fail).
- **Page units:** a page holds N × rows units — N columns (PT-MIX-2) times the SHUFFLED rows at the size (PAGE_TYPES 5.2:
  S 9, M 7, L 5) — minus the rows the examples bands and the word-problem band take on that page (each at least one row).
- **How many skills fit a page is a capacity sum, not a count:** Σ over the page's skills of 2 × (span area in units)
  ≤ the page units (each skill at least 2 problems on any page it appears on; the word-problem band is outside the sum
  and exempt from the 2-problem rule, as in the PAGE_TYPES 5.2 worked example of 4 skills at L with one word problem:
  6 × 5 = 30 units, 6 for the word row, 24 left; clocks 8 + sums 4 + fractions 4 = 16 ≤ 24). Example: the Daily L page
  (N = 4) has 4 × 5 = 20 units, 16 with a word-problem row, so three 2 × 2 clock skills (2 × 4 × 3 = 24 units) do not
  fit on one page.
- **Two of each skill beats the exact weights on a page.** A skill that appears on a page gets at least 2 problems there
  (one alone is a lone item, a defect class the precritic checks); the weights are met as closely as that allows, and
  the summary line says where they differ ("Less : More on a 4-problem page gives 2 and 2, not 1 and 3"). When the skills do not fit, they rotate across the pages the
  teacher asked for (each page a full mixed page, the totals across the pages keeping the weights, PT-MIX-9); if even the
  chosen number of pages cannot hold every skill twice, the summary line says "needs 2 pages" and Print offers it.
- **A short instruction in each cell** (already required by PT-MIX-5): skills gain `strings.cue` — 1–4 words from the
  instruction library ("Add.", "Write the time.", "Shade 2/8.") — printed beside the problem number; the sheet line is
  "Solve."; plain computation cells may omit it. Until a skill has its cue, the library instruction shortened by rule is
  used, and the lint lists every skill still on that fallback.
- **Examples on a mixed-together page:** None, or **one worked example of each skill at the top** — the engine's existing
  mixed-practice example, one full-width compact band per skill (SUPPORTS.md "Compact band" and "Mixed practice"), each
  measured by `anchorHeightMm`. **Each page shows the bands of the skills on that page**, at its top; their measured
  height comes off that page before its capacity sum (rounded up to whole rows), and the check is per page. When on some
  page the bands would leave fewer rows than its skills need for two problems each (three skills with bands at L do not
  fit one page, SUPPORTS.md), the packer first spreads the skills over the pages chosen (fewer skills per page, fewer
  bands); only if that cannot work is the choice greyed with the reason ("Examples for these 3 skills need 2 pages —
  add a page or choose fewer skills"). This is not the PT-MIX "cue key strip". "An example with each problem" is not offered on
  mixed-together pages.
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

- `ws-print-lint` mixed rules: no run of one skill longer than 2 turns (a block of small boxes is one turn); each skill's count across the whole worksheet within 1 of its weighted share, except where the summary line records why (two-of-each on a page, a skill rotated to another page, an examples band); every
  non-computation cell has a cue; no cell below its minimum size; ≥ 40 % free; vertical rules on the unit grid; no page
  under-filled while items remain; the capacity sum holds on every page; any run over 2 matches the weights fallback and
  appears in the summary line.
- `interleave()` self-test (node, deterministic), including the 1 : 3 on 12 items case (runs of 3, counts 3 and 9, the
  summary note), a 1 : 1 : 1 case (no run over 2), the facts-with-clocks case (blocks alternate, runs counted in turns),
  the I Can L case (N = 6, a word row, 24 units: facts and clocks at Equal give 5 clocks and 1 facts block = 6 turns, cap
  ⌈5 / 2⌉ = 3, the summary note in turns)
  and a Less : More case on a 4-problem page (2 and 2, the summary note); `ws-code-snapshot` (old codes decode as sections).
- Critic case: `ws-grade-render --set` with four skills from four families at S / M / L + keys + the online worksheet and
  quiz, ≥ 8 on every criterion.

### 3.5 Phases

| Phase | Work | Files | Done when |
|---|---|---|---|
| M1 | `interleave()` + self-test (with the weights-win case); the `arrangement` field and code flag; Mixed together for skills of the same size class inside today's packer; the Q-M1 edits to PAGE_TYPES 5.2, DN-34 and `anchors.js` | `sheet/interleave.js` (new), `print-sheet.js`, `skill-codes.js`, `sheet/anchors.js`, `design/PAGE_TYPES.md`, `WORKSHEET_DESIGN_STANDARD.md` | self-test green; `ws-code-snapshot` green; a 4-skill same-size page renders mixed with no run > 2 |
| M2 | Size classes (incl. measured legacy cells) + the 2 × 2 block packer (small boxes of different skills share blocks; runs counted in turns) + numbering + rebalanced last page + page units, the capacity sum, two-of-each and rotation across pages | `sheet/roles/mixed-practice.js`, `sheet/layout.js`, `sheet/paginate.js` | print-lint mixed rules green on the critic set at S / M / L |
| M3 | `strings.cue` (fallback rule first, then real cues family by family) + the in-cell cue + lint | `sheet/contract.js`, `sheet/providers/*`, `sheet/cell.js` | every skill has a cue or is listed on the fallback; lint green |
| M4 | Frame subtitle, readable footer, key legend by skill, the measured examples bands with their greyed fallback, the arrangement and examples choices in the worksheet sheet, the summary line (replacing PT-MIX-8) | `sheet/frame.js`, `sheet/roles/answer-key.js`, `sheet/anchors.js` (compact bands on mixed-together pages), `teacher-print.js` (with T3) | screens and keys match §3.3 |
| M5 | Online worksheet and quiz parity; independent critic | `worksheet.js`, `quiz-take.js` | critic ≥ 8 on every page, size and host |

---

## 4. How this fits the current plan

### 4.1 Order of work (`MASTER_PLAN.md` points here)

| Order | Work | Lane owns | Runs beside |
|---|---|---|---|
| 1 | **Wave 0** (§1.4 S1–S9, then §1.6 E1, E2 and E5) + review of the open PRs #11 (needs a critic on its round-3 fixes f0d4a489), #13 (re-pin codes VA–VD; becomes the shape-grid / solid-kit starting point), #14 (quiz "Click ALL"; it lands in the same deploy as #13, merged right after it, because #13's new Click-ALL skills need #14's answer tiles — HANDOVER-2026-10-17) | `tests/scripts/*`, `design/status/`, `design/cards/` | mixed-page engine M1–M3 (different files) |
| 2 | **Mixed pages M1–M5**, then the provider pass (§1.6 E3) family by family | `print-sheet.js`, `sheet/*` | Wave 0 |
| 3 | **Teacher site 2.0 T1–T6** (T1 needs the owner) | `teacher-*.js`, `css/teacher*.css`, `index.html` teacher markup | templates (step 4) |
| 4 | **Templates by leverage** (§1.5); the paused lanes restart with precritic: Lane D print backlog, the fraction key (keys show 2/8 = 1/4, owner 2026-10-17; both touch `print-sheet.js`, so one after the other and after M2), Lane B answer + regroup boxes, place-value write-value, the decimals key fault (AK-4 on `add_decimal`, same fix pattern as `mult_properties`), the skip-count owner answers still to build (wide rows wrap and keep size; phone card opens at the first box), the number line 5.2 later steps (1) a time line in hours and minutes for `measurement:elapsed_*`, (2) D9 band tightness, (4)/(8) a unit-fraction line for `fraction_operations` when the teacher fixes one denominator, (9) the owner question on mixed pools losing a row, the `order_fdp` page that prints "Order from greatest to least" with no numbers (STATUS §7 item 7, conversions family) | `sheet/cells/<template>.js`, the generators | Teacher site 2.0 |
| 5 | **Later wave, if needed (owner 2026-10-23): new lessons** — the short lesson (original maker) and the V22 detailed lesson: first the lesson compiler and shapes (§1.6 E4: lessons 1–5 recompiled and passed), then lessons 6 onward from signed cards, one lane per shape; the parked branch `claude/sweet-newton-c8wrv1-wip-detailed-lessons-2` (patches in `design/lesson-planner/wip-2026-10-17/`) waits for it | `js/modules/lessons/detailed/`, `data/curriculum/detailed-lessons.json` | any lane |

At most three lanes at once until §1.6 E5 (manifests + integrator) lands; then up to six, one cloud session each
(Q-S6). Each lane owns its files; deploys use the S5 runner. The inheritance audit (E6) runs once per wave.

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
| Wave 8 (lessons, owner list of 67) | moved to a later wave, if needed (owner 2026-10-23); §4.1 step 5, with the lesson compiler and lesson shapes (§1.6.3, E4) |
| Wave 8 intervention library (a lesson for every WRM small step) | the same later wave; §1.6.3 Lessons item 6 |
| Owner 2026-10-23: every live skill makes every worksheet | §1.6.3 Worksheet types, E2–E3 (§4.1 steps 1–4) |
| Wave 9 (stretch / thinking pages) | unchanged, after Wave 8; then certified as roles (§1.6.3 Worksheet types item 3), cheap because E3 gives every skill its misconceptions |
| PAGE_TYPES §10 PT-CMP-1…5 (any skill on any role, every role with a key, `coverage()`) | §1.6.3 Worksheet types (roles certified; `coverage()` over every skill × role × size) and E3 (454 skills off default adapters) |
| LESSON_LIBRARY_PLAN §8e three papers | §1.6.3 Papers (one composer certified; Quiz = Practice + scoring) |
| ROADMAP P7 one renderer, P8/P9 families, O options, T teacher track | P7 largely live; P8/P9 → §1.5; O live (options + 114 presets); T → §2. ROADMAP §4 definition of done per family is unchanged |
| TEACHER_SCREENS: home six tiles | replaced by §2.3 (Q-T1) |
| TEACHER_SCREENS: make quiz by CCSS / EE / WRM / lesson, tags, scores | §2.4 Quiz |
| TEACHER_SCREENS: gallery by default, Big 3 / 4 / 5, saved sets, pick many | §2.3 Skills + §2.4 tray |
| LESSON_LIBRARY_PLAN §8e three papers | Practice = Print, Quiz = Quiz, Lesson = Lessons |
| LESSON_LIBRARY_PLAN §8f one worked example on top of each block | kept as "An example to start each group" (`anchors: 'sections'`); "with each problem" is Q-W2 (reuses `anchors: 'side'`) |
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
| STATUS §7: Wave 2 has no recorded baseline (`ws-wrm` today: 872 steps, 359 not fully covered — 149 partial, 210 gap — 162 proposals) | §1.4 S8: the metrics file records these numbers as the WRM baseline and adds the `ws-wrm --report-only` counts at every deploy |
| STATUS §7: number line 5.2 later steps (1) time line in hours and minutes, (2) D9 band tightness, (4)/(8) unit-fraction line for `fraction_operations`, (9) owner question on mixed pools losing a row | §4.1 step 4, with the number line's own family; the (9) question goes on that family's spec card |
| STATUS §7: number line (3) the lesson packet places the line only through the roles it calls, (10) the band adds a page on Scripted Model / Guided (critic nl-r6 R6-D2) | §4.1 step 5 (lessons wave), before any lesson page offers the line |
| STATUS §7: `order_fdp` prints "Order from greatest to least" with no numbers (seen by critic nl-r3) | §4.1 step 4 / §1.5 item 4, conversions family |
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
| Q-S4 | Once a kind of drawing, page type, paper or lesson pattern has passed review across all its sizes and options, may new skills and lessons that use it be checked this way: the machine checks on every page, a reviewer reading every new skill or lesson on a sheet of small pages, and 1 in 5 pages graded at full size (any new kind of page always in full)? A spot-audit each wave grades more pages at full size and withdraws the approval if any falls below 8. (This changes how CLAUDE.md says a page counts as graded.) | Yes |
| Q-S5 | (Asked when the later lesson wave starts.) Let lessons be drafted automatically from their skills — steps, examples, the mistakes table, practice and the exit slip — with the builder writing only the story, the hook and the teaching notes? You still sign each lesson's card first, and the five lessons already passed are rebuilt this way and re-checked before any new one. | Yes |
| Q-S6 | Run up to six work lanes at once, each in its own cloud session, once the merge tool is in place? | Yes |
| Q-M1 | When a worksheet has 2 or more skills, mix the problems together by default? Practice printed from a lesson stays in sections, because the lesson's skills are new. | Yes |
| Q-M2 | If the skills you chose cannot all fit on one page at least twice each, should Print add pages (it tells you) rather than print some skills only once? | Yes, add pages |
| Q-T1 | Replace today's home screen with: the site opens on Skills, ticked skills go to a tray with Print · Quiz · Share? | Yes |
| Q-T2 | Make quizzes from the same tray (Quiz button) and retire the separate quiz builder? Pupils take quizzes exactly as today, and old quiz links keep working. | Yes |
| Q-T3 | Keep "Skills to be made" on each lesson and maths area (folded away), and take its separate screen out of the menu? | Yes |
| Q-T4 | Show grades as plain numbered labels, so colour only ever means the maths area? | Yes |
| Q-T5 | Share gives one link: it **opens the practice straight away** (today's "Direct link"). The other kind — a link that **puts the skills as buttons on the pupil's start screen to choose from**, which you can lock (today's "Quick Start link") — moves under More options. Agree? | Yes |
| Q-T6 | Colour board A (six maths-area colours) or board B (eight colours, each in four strengths)? Either way the main button is bold black. On both, areas taught in the same grade stay easy to tell apart for colour-blind teachers, and every colour also shows the area's name and icon. The cost: to stay colour-blind safe, three of the colours are light (mint, sky blue, lime) rather than deep, so their buttons show by a thin outline — you will see them on the board. | B |
| Q-W1 | No lettered A–J pages; "How many pages?" for section, single-skill and mixed pages | **Decided by the owner, 2026-10-23** |
| Q-W2 | Offer "An example with each problem" again? It was dropped on 2026-09-26 because it made pages with only one problem. | Yes, but only when at least 2 example-and-problem pairs fit the page at the chosen size (otherwise the choice is greyed out with the reason), and never on mixed pages |
| Q-W3 | For quizzes, "How many versions? 1–6" — each version with its own order and answer key, no letters? | Yes |
| Q-W4 | You said the thinking pages (find the mistake, true or false, reason it, stretch) wait until after the lessons. Lessons are now in a later wave: should the thinking pages still wait for that wave, or join the worksheet types now? | Still wait (your 2026-10-09 ruling stands) |
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
- **CIEDE2000** — a measure of how different two colours look to people; about 1–2 is barely visible, 10+ is easy to see,
  20+ is clearly different colours. (The older ΔE76 overstates differences between saturated blues and purples.)
- **Deuteranopia / protanopia** — the two common kinds of red–green colour blindness, simulated with the Machado 2009 matrices.
- **Ramp** — one colour in four strengths (tint, soft, bold, deep).
- **Weights win** — when a skill is most of a mixed page, its run cap rises instead of the teacher's weights being cut.
- **Engine / instance** — an engine is shared code that draws many products (a cell template, a page role, a paper, a
  lesson shape); an instance is one product made on it (a skill, a role for a skill, a worksheet, a lesson).
- **Envelope / certificate** — everything an engine is approved for (sizes, looks, option values, roles, ranges,
  screens) and the record of that approval (`design/audit/certified/<engine>.json`).
- **All-pairs sample** — a set of test pages in which every pair of option values appears at least once.
- **Lesson shape / lesson compiler** — a pattern shared by several lessons, and the code that drafts a lesson's
  description from its card and its skills.
