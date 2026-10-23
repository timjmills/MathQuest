# Improvement plan — faster building, a simple teacher site, truly mixed pages (v20.4, 2026-10-23)

## In short (for the owner)

1. **Faster building, same quality.** Most of the time goes on critic rounds (median about 5 per lane), and most of
   what critics find could be found by a machine first. So we build those checks, make every builder pass them before a
   critic sees the work, build the shared drawings (templates) first so new skills become quick to add, and run the
   deploy checks in parallel. The biggest step (§1.6) covers **every product** — skills, the three kinds of worksheet,
   the quiz, and (in a later wave) lessons: each drawing is approved once on each kind of worksheet, across all its
   sizes and options; after that, new skills on it are made as data, every page is checked by machine, and an
   independent reviewer reads every new skill as a batch for ease of use and teaching, grading 1 in 5 pages in full.
   Lessons, when their wave comes, are drafted automatically from their skills. Up to six work lanes run at once. Every
   page is still **held to 8**; you agreed to that way of counting a page as reviewed on 2026-10-23 (Q-S4). A spot-audit at every
   update withdraws an approval if any page falls below 8.
2. **A simple teacher site.** Four places instead of eleven: **Skills**, **Lessons**, **Classes** and your profile. Tick
   skills and they drop into a tray at the bottom with three buttons — **Print · Quiz · Share**. Printing, sending a code
   or making a quiz takes 3–4 steps. Options appear only when you ask for them.
3. **Bold colour on purpose.** Each maths area has its own strong colour (eight of them, each in four strengths), used
   everywhere that area appears; areas taught in the same grade stay easy to tell apart for colour-blind teachers too, and
   every colour also carries the area's name and icon. To stay safe for colour-blind teachers, three of the eight are
   light rather than deep (mint, sky blue, lime), so their chips show by a thin outline; the one button you should press
   is bold black; everything else is calm. Pupil pages stay black and white. You chose the warm, earthy colour style of the school's Awsaj maths site (board C, Q-T6); colour marks the maths area, and the grade is shown by its own badge, not a colour.
4. **Three kinds of worksheet, with plain options** (owner decision): **Single skill · Sections · Mixed practice**. No
   other page types, no lettered A / B pages, no "I Can / Daily" look choice. Options: How many pages? · How often each
   skill comes up · Examples · Fade supports · Layout (fact rows, timed check, Today's Number) · Bring back earlier
   skills · Size. A small preview, and the PDF is the full view.
5. **Truly mixed pages.** Today "mixed practice" prints one band per skill. We build the Mixed practice page that the
   design rules already describe: problems from different skills side by side, never more than two of one skill in a
   row (unless one skill is most of the page), each problem with its own short instruction, the page full.
6. **Owner decision (2026-10-23): every skill that is live makes every kind of worksheet first.** Making new lessons —
   the short lesson (our original lesson maker) and the longer V22 lesson — moves to a later wave, if needed (§1.6.5).
7. **Your decisions on 2026-10-23** (§4.3): every skill is held to the quality of the pages already passed (the five
   detailed lessons, the custom number line, the small fixes and the answer-key options, then each approved drawing's
   pages), read beside them; the new review way (batch + 1 in 5 + spot-audit);
   you see one picture sheet per family before it goes live; every skill gets every worksheet before new skills; the
   stronger builder for firsts (new drawings and new engines); up to six lanes plus other sessions; Mixed practice by default with Sections and custom
   sections as options; examples at the top of the page, the first time a problem appears, every few problems or with
   each problem; thinking pages still wait; research logins added.
8. **Which builder effort, and which kind of check** (§1.7, your question of 2026-10-23): a machine checks everything
   it can measure, on every page; the independent reviewer (Opus medium) spends its time only on judgement — is the
   page easy to use, does it teach; you look at one sheet per family. Builders use Opus medium for the first skill of
   each new drawing, for the first build of each new engine, tool or screen (your decision, Q-S7), and for any rebuild
   after a failed review; Opus low for the copies.
9. **Every question is answered** (your answers of 2026-10-23, §4.3), except two that belong to the later lesson wave
   and are asked when it starts (Q-S5, Q-L1). §4.4 says how much faster this should make the work, and how we will know.

Sections 1–3 hold the detail for builders; §4 shows how it fits the current plan and lists every open item.

Owner request (2026-10-23), with later additions in the same conversation: speed up building while keeping the same
high quality; a streamlined teacher site like an Apple product (3–4 steps, visual / colour / spatial hierarchy); a fix for
truly mixed practice pages; bold, clear colouring with a much wider palette, used on purpose for hierarchy and
organisation; no lettered A/B pages — plain options, with "how many pages" for section, single-skill and mixed pages;
no full preview on the website, but a small preview of the first page (or the first 2–3 pages when they differ).

Built from three audits on 2026-10-23 (the build history and gate timings; the teacher site driven in a browser at 1366
and 390 px; the print engine with a test render) and graded by an independent critic: rounds 1–4 FAIL; round 5
PASS on v5 (A 8 · B 9 · C 9 · D 8 · E 8 · F 9 · G 9), confirmed on v5.1. The owner's further requests then added §1.6
and the three kinds of worksheet (v6–v18; rounds 6–18 FAIL); round 19 PASSED v19 (A 8 · B 9 · C 9 · D 9 · E 9 · F 9
· G 8), and v19.1 applies its optional corrections — confirmed by a fresh check: PASS holds, 9 on every criterion.
v20 records the owner's answers of 2026-10-23 (§4.3); v20.1 fixes the check of v20 and adds §1.7 (which effort,
which kind of check), PASSED by critic r21 (A 8 · B 9 · C 8 · D 9 · E 9 · F 9 · G 8); v20.2 applies its optional
corrections and records Q-S7; v20.3 records the owner's answers to the remaining questions
(Q-S2, Q-S3, Q-M2, Q-T1–Q-T6, Q-W3, Q-H2, Q-H3) and adds §4.4 (how much faster, and how we will know), PASSED by critic r22 (A 8 · B 9 · C 8 · D 9 · E 9 · F 9 · G 8);
v20.4 applies its optional corrections. The current review state is in
`design/STATUS.md`.

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
| Research | the reference-site logins are not in the cloud containers (STATUS §7), so the mandatory MW4K / IXL research has been done from public pages, skill by skill | do it once per template, with the logins the owner adds (Q-H4, decided) |

### 1.2 The 2026-10-19 proposal, audited

| # | Proposal | Verdict | Change |
|---|---|---|---|
| 1 | Every critic finding class becomes an automatic pre-critic check | **KEEP — do first** | each check proved by a **backtest** (§1.4 S2) |
| 2 | Build by template, not by skill | **KEEP** | after a template passes, its skills and options are data entries + presets |
| 3 | One approved model per family; later skills reviewed as a batch | **MODIFY** | one model **per template AND per kind of worksheet** — a certified (template, kind) pair, §1.6.2; batch review only under the safeguards of §1.3 and §1.6.4 |
| 4 | Opus medium for the first build of a new template; Opus low for copies | **KEEP** (decided, Q-S1 and Q-S7; written into CLAUDE.md "Agents" 2026-10-23) | |
| 5 | Targeted checks while building; full gates in parallel at deploy | **MODIFY** | pairing alone gives ≈ 42 min; ≤ 30 min needs screen-slots and chromebook-fit split by category. Nothing is skipped at deploy |
| 6 | All owner questions at the start of a batch | **KEEP** | as a signed **spec card** (S3) |
| 7 | Fewer lanes, each owning its files | **KEEP + extend** | per-lane status files; only the deploy step stamps index.html |
| 8 | (new) Spec card per template / skill | ADD | builders read 3–5 KB of the right rules instead of 740 KB |
| 9 | (new) Lint without a browser (the pure kit under node) | ADD | seconds instead of minutes for L3, L6, L10, text ≠ generator |
| 10 | (new) Near-miss re-check | ADD | under the safeguards of §1.3 |
| 11 | (new) Builder report = precritic output | ADD | stops self-grades of 8 that critics mark 5–6 (L9) |
| 12 | (new) Metrics per lane | ADD | so the next audit has numbers |

### 1.3 Quality safeguards — the bar stays 8 everywhere

| Speed measure | Risk | Safeguard |
|---|---|---|
| Batch (contact-sheet) critic for copies of an approved template | misses a page type, size or screen | allowed only when precritic passes for **every kind of worksheet (with its options) × S / M / L × the three screen hosts** (practice card, online worksheet, quiz); the critic also opens a random **20 %** of (role, size, host) pages at full scale; any role whose code path differs from the approved model gets a full grade |
| Unchanged pages keep their score (near-miss re-check, golden renders) | a stale score | the golden manifest stores **page + screen-host renders** (RUBRIC's widths 1280 / 820 / 390, plus 1366 × 768 for Chromebook fit) and a **content hash** (hash of the cell DOM/SVG, not pixels; it shows which pages changed and never decides inheritance — that is the structural fingerprint of §1.6.2), the **rule-set version** (RUBRIC, standards, LESSONS_LEARNED) and the per-criterion scores; a rule change, or a score older than 2 rounds, forces a re-grade; the final PASS lists every page with where its score came from |
| Spec cards instead of the full standards | the card leaves out a rule | builders use cards; **critics keep reading the full standards and RUBRIC**; a card-coverage test fails if any rule id that a critic cited for that family in past reports is missing from the card; it runs again against the current rule-id index when each build starts, so a rule added after the card was signed is caught |
| Opus low for copies | weaker work | precritic must pass before the critic; any copy that fails a critic round is rebuilt at Opus medium (part of Q-S1) |
| Parallel deploy gates | flaky results under load | the same gates, two browser slots (owner rule). A FAIL that passes when re-run alone is still **logged as a defect** with an owner and counted in S8; the same item flaking twice **blocks the deploy** until it is fixed (`reading_ruler_hard` is one such intermittent real defect, S9) |
| Near-miss re-check (Q-S2) | a weak page rides on an old score | allowed only when **every failed score in the round is a 7 and no score in the sample is below 7** (the bar is the minimum, not the average); the re-check grades the failed items, every changed page and a fresh 20 % sample |
| Precritic with standing red gates | a builder cannot pass a red gate | print-lint and screen-slots are compared with a pinned per-skill baseline; any NEW finding fails |

The final standard: **every page of every kind and every screen host ≥ 8 on all four criteria, and the full gates
before every deploy.** A page counts as graded when an independent critic grades it — or, as the owner agreed on
2026-10-23 (Q-S4), when it is inherited from a certified (template, kind) pair and its instance has been read in full by a critic
(§1.6.3–§1.6.4).

### 1.4 Implementation — Wave 0 (before any new template)

| Step | Work | Files | Done when |
|---|---|---|---|
| S1 | **`ws-precritic`** — one command for what a lane touched; it takes browser slots through `/tmp/mq-browser-run.sh` (two at a time) and prints one PASS / FAIL table, comparing red gates with the pinned baseline (gate table below; flags marked *new* are added in S1) | `tests/scripts/ws-precritic.cjs` (new), `design/audit/baselines/print-lint.json`, `…/screen-slots.json`; new flags in `ws-providers-unit.mjs` (`--skill`), `ws-chromebook-fit.cjs` (`--category`), `ws-screen-slots.cjs` (`--baseline`), `ws-grade-render.cjs` (`--template`), `ws-teacher-wrm.cjs` (`--grade`, `--lesson`) | every builder report pastes its table; the orchestrator refuses a report without it |
| S2 | **The missing checks**, each proved by a **backtest** (it FAILS on the state a critic failed and PASSES on the fix) — on a real commit where one exists, otherwise on a seeded fixture kept in `tests/fixtures/precritic/` | `ws-print-lint.cjs` rules, `ws-providers-unit.mjs`, `ws-node-lint.mjs` (new, no browser), `tests/fixtures/precritic/` | backtest table green (below) |
| S3 | **Spec cards** — `ws-spec-card` writes `design/cards/<template or family>/<id>.md` from `build-specs.js` / `build-list.js` + the exact rule excerpts (by rule id) + owner rulings + capacity rows + gates; the card ends with **open questions** and a **"Signed: owner, date"** line; the build starts only after it is signed | `tests/scripts/ws-spec-card.mjs`, `design/cards/`, a rule-id index of the four standards | card format below; card-coverage test green |
| S4 | **Golden renders + contact sheets** (with the §1.3 safeguards) | `ws-grade-render.cjs` (manifest + diff + contact sheet), `design/audit/golden/<template>/manifest.json` | a critic brief lists changed pages + the 20 % sample; unchanged pages carry their recorded score and its source |
| S5 | **Parallel, sharded deploy gates in three sessions** (the browser gates alone take ≈ 63 min — screen-slots 22, chromebook-fit 17.4, teacher-wrm 12 + 12 — so two slots cannot meet 30 min): session 1 runs the node gates and the teacher browser gates; session 2 runs `ws-screen-slots` and `ws-chromebook-fit` split by category across its two slots (≈ 20 min), plus the new big-board and dark-mode sweep modes on a fixed sample — every screen host × one skill per template (because `index.html` loads every teacher stylesheet beside the screen hosts); session 3 computes the tip's digests (≈ 8 min) and runs the coverage matrix's affected rows (§1.6.2, ≤ 500 documents, ≈ 15 min). One documented deploy-gate list (closes STATUS §7 "one deploy-gate list") | `tests/scripts/ws-deploy-gates.sh` (new), `tests/scripts/ws-screen-slots.cjs` and `ws-chromebook-fit.cjs` (the two sweep modes; row 1 owns them while Wave 0 is open), CLAUDE.md "Checks to run" | the runner times each session and the whole; three timed runs at ≤ 30 min wall clock, same gates, nothing skipped; a test deploy that makes a family live with no recorded owner go is refused (§1.6.3 step 6) |
| S6 | **Merge hygiene** — per-lane status files + a generated STATUS.md index; lanes never run `ws-stamp-assets` | `design/status/<lane>.md`, `tests/scripts/ws-status-index.mjs` | a week of lanes with no STATUS or stamp conflict |
| S7 | **Process rules** (Q-S1–Q-S7 approved by the owner 2026-10-23): template-first order; one model per (template, kind) pair; batch critic with the §1.3 safeguards; near-miss re-check (minimum-based trigger); flakes logged; signed spec card; first build of a new template, and any failed copy, at Opus medium; the effort table and the order of checks of §1.7 (its effort rule — Q-S1 and Q-S7 — is already in CLAUDE.md "Agents", 2026-10-23); builder report = precritic output | `CLAUDE.md`, `design/audit/LESSONS_LEARNED.md`, `design/audit/RUBRIC.md` | recorded; the next lane briefs use them |
| S8 | **Metrics** — first the defect tally of every past critic report (class × report); then rounds to PASS, hours, findings per class, skills passed per lane-week (against the rate before Wave 0, counted from STATUS and git history) and the agent profile used (the profile name is recorded, since an agent cannot see its own effort setting) per lane; reviewed after every template; a rising class becomes the next check | `design/status/defect-tally.csv`, `design/status/metrics.md` | tally committed; filled from Wave 0 on |
| S9 | **Clear the red gates** — fix `reading_ruler_hard`'s doubled answer area; pin the print-lint baseline (458/33) per skill | the skill's generator / cell | screen-slots green; baseline file committed |

**What `ws-precritic` runs**

| Flag | Gates |
|---|---|
| `--skill <cat:skill>` (repeatable) | `ws-node-lint` (*new*), `ws-providers-unit --skill` (*new flag*), `ws-content-audit --skill`, `ws-options-verify --skill`, `ws-presets-unit` (when presets touch it), `ws-coverage-matrix --skills` (*new*: every row of §1.6.2 — each kind with its options — at S / M / L, through `ws-print-lint --source kit --baseline`), `ws-screen-slots --skills --baseline` (*new flag*), `ws-screen-answer --skills`, `ws-chromebook-fit --skills`, `ws-code-snapshot`, `ws-boot-smoke` |
| `--template <id>` | the above for every skill using the template + `ws-panes-unit` / the template's fixture test + `ws-grade-render --template` (*new flag*) contact sheet |
| `--role <role>` | `ws-grade-render --roles <role> --skills <the role sample>` + `ws-print-lint --roles <role>` on the same skills. The role sample is `tests/fixtures/precritic/role-sample.json` (new in S1): the first live skill of each of the 20 largest families in `design/SKILL_CATALOGUE.md` order, pinned in the file and changed only with a STATUS note |
| `--teacher` | `ws-teacher-shell`, `-library`, `-preview`, `-quiz`, `-wrm --grade --lesson` (*new flags*), `ws-teacher-flows` (*new*, §2.9), `ws-teacher-tokens` (*new*, §2.8), `ws-plain-words --check` |

At deploy, S5 shards `ws-screen-slots --category` (exists) and `ws-chromebook-fit --category` (*new flag*) across the two
browser slots.

**Backtests for the new checks**

| Check | Backtest |
|---|---|
| Lone item / lone state on a page | skip-count 359802c5 (critic r4 D12) fails; b19172b4 passes |
| Notation (C4: × not x, ÷ not /, stacked fractions, the instruction library's wording) | seeded fixture (an item printing "3 x 4 =" and an inline "1/2") |
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
2. For each template: signed spec card → one model skill at Opus medium → full critic on every kind, size and host →
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

**Owner rulings, 2026-10-23:**
- "Any skill that we have live should be able to make the different worksheets, although custom lessons — the short
  lesson (our original) and the longer V22 — can be made in a later wave if needed."
- "Reduce the types of worksheets to 3 general — mixed practice (with options), single skill (with options), or
  sections with options" and "no different practice and then I Can etc." (§2.5).

So the three kinds of worksheet for every live skill come first (§1.6.5, E1–E3). The lesson parts of this section are
designed here so that the later lesson wave starts fast, but nothing in them is built before that wave.

§1.1–§1.5 cut the number of critic rounds. This section changes **what** is graded, which is the bigger lever: today
every skill, every page type and every lesson is graded page by page, so the work grows with the number of products.
After this section it grows with the number of **engines**, and products made on a certified engine are data.

#### 1.6.1 What each product costs today

| Product | How it is made today | What it costs |
|---|---|---|
| **Skills** (715 live) | built and graded one by one (§1.1) | median ≈ 5 critic rounds; when the drawing already existed, 114 preset skills took two builder runs |
| **Worksheet types** — 21 role composers in `js/modules/sheet/roles/` (19 page roles, among them the facsimile key `answer-key.js` and the short key `key-short.js`, plus the two lesson packets `lesson.js` and `detailed-lesson.js`; `index.js`, `compose.js` and `practice.js` are helpers); the print screen offers about 18 of them (`teacher-print.js` `PAGE_GROUPS`) | PT-CMP-1: any skill on any role, every role with a key (PT-CMP-5); a role is graded only with the skills the current lane happened to touch | every new skill silently owes every role × S / M / L × key. Only **261 of 715** live skills have a real provider (`workedSteps`, `wrongAnswer`, `strings`, `misconceptions`; count from `getProvider().real`, retired skills skipped; 44 of the 261 are presets on their host's provider). For the other 454, a worked example does not print ("No worked example for … yet", `sheet/anchors.js` `ineligibleNote`) and the Model / Guided / thinking roles print default-adapter output |
| **Papers** — Practice, Quiz, Lesson (LESSON_LIBRARY_PLAN §8e) | Practice and Lesson on the sheet kit; Quiz in the separate legacy quiz builder (§2.1) | two engines to grade for one kind of paper |
| **Detailed lessons** (owner list: 67) | each lesson a hand-written description of 307–350 lines (`js/modules/lessons/detailed/<id>.js`) plus `RESEARCH.md`; the critic re-grades the whole 21–31-page pack every round | 5 passed (lessons 1, 2, 3a, 4, 5), from lesson 1's first critic report (21:20 on 10-16) to lesson 4's PASS (03:25 on 10-17), in 3–4 rounds each (`data/curriculum/detailed-lessons.json`); 3 of the 5 builders escalated (STATUS §9). On the parked branch `claude/sweet-newton-c8wrv1-wip-detailed-lessons-2`: lesson 6 failed critic r1 (712592e2) and r2, its fix round 3 is ungraded; lesson 7 exists only as unapplied patches (`design/lesson-planner/wip-2026-10-17/lesson7-round*.patch` on that branch); 8–10 are researched. 62 still to make |
| **Intervention library** — a lesson for every WRM small step (872), in the owner's Atomised Lesson V20 format (MASTER_PLAN Wave 8) | not started; it was to build on the paused lessons-engine branch; its record `LESSON_COVERAGE.md` does not exist yet | page-by-page grading would mean thousands of pages |

**What the lesson critic reports found** — the 17 on main (`design/lesson-planner/lessons/*/critic-r*.md`) and lesson 6's
two on the parked branch. Lesson 1 = `g2-nbt3-read-write-1000`, 2 = `g1-oa1-bar-model-wp-20`, 3a = `g3-oa5-mult-properties`,
4 = `g3-oa9-mult-table-patterns`, 5 = `g3-oa9-input-output-rule`, 6 = `g4-nbt1-ten-times-value`; D numbers are round 1
unless marked.

| Defect class | Examples | Machine check |
|---|---|---|
| Repeats: an exit or Practice item that is a modelled or Practice item again, turned round or near-twin | lesson 2 r3 D1 / D3; 3a D6; 4 D3, D5; 5 D1; 6 D2 (parked branch) | E24 (LR-5 pool) exists; extend to turned facts and near-twins |
| A task practised that no page models; two new things at once | lesson 2 D3 (add-to); 1 D1 (one of three forms); 3a D2; 5 D3 | **new**: every task kind dealt on a Practice or exit page appears on a modelled panel or script row before it (task kinds from the generator) |
| Teacher text that does not match the pupil pages (wrong panel, page, letter, answer; raw placeholder) | lesson 2 D4–D6, r3 D2; 1 D3, D7; 3a D7; 5 D5, r2 D7, D8; 4 D8 | **partly**: E29 / E38 exist; extend so every page, panel, step and item a teacher page names resolves to the real one. Whether the teaching advice is right stays with the critic |
| Answer given away or coached (Say band, hint, exit help) | lesson 4 D1, D2; Guided = Independent (4 D6) | **new**: no Say, hint or Steps text holds the item's key value; Guided carries a hint Independent does not |
| Layout: slot below minimum, page under-filled, broken grid, empty quadrant | lesson 2 D1; 1 D5; 3a r2 D1; 4 D4 | `ws-print-lint`, E9 |
| Numbers off the band; edge cases missing; an owner ruling broken (1,000 "board only") | lesson 2 D2; 1 D2, r3 S1; 3a D1 | **new**: the lesson card declares ranges, edge cases and rulings; the check reads them against the dealt items |
| Assessment validity: the exit cannot measure the skill; a distractor is not the misconception it names; word problem off-skill | lesson 2 D8; 3a D4, D5; 5 D4; 4 D7 | partly: each distractor must carry a misconception id from the provider; the rest stays with the critic |

Five classes are fully measurable and two partly; the critic's time should go on what is left.

#### 1.6.2 The method: certified engines, data instances

| Engine | Its instances (made as data) |
|---|---|
| a **cell template** (`stack`, `shape-grid`, `bar-model` …) on a **kind of worksheet** — Single skill, Sections, Mixed practice (§2.5), each with its options | every skill, option and preset drawn by that template, on that kind |
| the two **answer keys** — the facsimile key (`answer-key.js`) and the short key (`key-short.js`) | the key of every page |
| the **Quiz layer** (scoring, versions 1–6) on the three kinds, once T3 and T6 retire the separate builder | every quiz |
| the **paper composer** (how a worksheet request becomes pages) | every request from the §2.5 choices |
| later lesson wave: each **lesson-packet page** (anchor chart, Steps, Opener, Scripted Model, Guided, the pre-skill check P0, number sense P1, word problem P5, exit slip P6, vocabulary, Check Question, the teacher pages) and each **lesson shape** | every lesson of that shape |

**The unit of a certificate is a pair: one template on one kind** (or one lesson-packet page with one template).
A template certified on Single skill is not certified on Mixed practice; no pair is inherited that nobody graded.

**Pages with several skills** (Sections, Mixed practice) also need their **composer** certified: the sections
composer, and the mixed packer (§3) at M5, each on an all-pairs sample of box-size mixes (1 × 1, 2 × 1, 1 × 2, 2 × 2,
4 × 1 cells together, N columns, S / M / L, with and without examples). A Sections or Mixed practice page inherits only
when its composer is certified **and** every cell on it belongs to a certified (template, that kind) pair.

**Teacher-made mixes** are built at print time, so nobody grades them one by one. What makes them safe is the packer
proof, not the sample:
- the packer is pure, so **`ws-packer-proof`** (new, node, E1) runs it over every mix of up to six skills across the
  five size classes, every N of PT-MIX-2, S / M / L, weights Less / Equal / More, examples off, at the top (with the
  smallest and largest measured example-band height of each size class at each size) and beside the first problem, 1–3 pages with rotation across
  them, and several interleave seeds a mix — about 461 mixes × 7 N × 3 sizes × 4 example settings × 3 page counts ×
  3 weight patterns (all Equal, one More, one Less: skills of one size class are interchangeable to the packer) × 5
  seeds ≈ 1.7 million packs, with a budget of ≤ 30 minutes in node across the container's 4 cores, measured in M5's
  done-when (if it runs longer, the seeds are cut and the print-time asserts remain the backstop). On each it asserts
  the geometric rules: cells on the unit grid, no overlap, no
  split strip, the capacity sum, the run rule in turns, ≥ 40 % free in every cell, two of each skill on a page;
- **the same asserts run at print time** on the packed page (the packer is pure, so it costs nothing). If one fails,
  the sheet adds a page or, failing that, prints as Sections, and the summary line says so. A broken mixed page can
  never print.

**Certifying a pair** means an independent critic grades it across its **envelope** — every size S / M / L, every
option value of that kind and that template, the number ranges, the answer keys, and the three screen hosts (practice
card, online worksheet, quiz):
- a **critic sample that covers every pair of option values at least once** (all-pairs sampling: tens of pages per
  pair, not thousands), plus a random 20 % of the remaining envelope at full scale, capped at 40 pages a pair;
- **the machine checks on the whole sample** (below);
- the result written to `design/audit/certified/<template>--<kind>.json`: the envelope, the **structural fingerprint**,
  the rule-set version (RUBRIC, standards, LESSONS_LEARNED), every page graded and its scores.

**Two fingerprints, kept apart:**
- the **structural fingerprint** decides **inheritance and voiding**. It is a hash of the **engine modules** of the
  pair plus the page's **geometry class**:
  - **engine modules** = the modules that define what the composer and the template actually use, resolved **binding by
    binding** through the kit barrel `sheet/index.js` (a whole-file import graph from `independent.js` reaches about 90
    files, because the barrel imports every template and provider). `ws-envelope --engine` (new, E1) computes the list;
    the plan never types it by hand. Computed on 2026-10-23 with critic r10's walker:
    - **Single skill** (`independent.js`), 17 files: `roles/independent.js`, `roles/practice.js`, `roles/answer-key.js`,
      `anchors.js`, `adapters.js`, `cell.js`, `contract.js`, `frame.js`, `grid.js`, `layout.js`, `lesson-css.js`,
      `lesson-icons.js`, `paginate.js`, `registry.js`, `rng.js`, `tokens.js` (all in `sheet/`), and `skill-presets.js`;
    - **Mixed practice** (`mixed-practice.js`), 18: the same plus `roles/compose.js` and `roles/mixed-practice.js`,
      less `roles/independent.js`;
    - **the `stack` template**, 18: `cells/stack.js`, `cell.js`, `registry.js`, `steps.js`, `tokens.js`,
      `supports.js`, `support-draw.js`, `touch-glyphs.js`, `touchdots.js`, `cells/pv.js`, `cells/k2kit.js` and the
      panes (`cells/panes/index.js`, `extras.js`, `hand-art.js`, `k2.js`, `kit.js`, `models.js`, `place.js`) — a
      template that draws supports reaches the support panes, and they really are part of its pages;
    - plus `print-sheet.js`'s measuring and key path (hashed whole until it moves into a module of its own at M4).
  - **Two edges are data, not engine, and are cut at M3** by the row-2 lane, which edits `contract.js` then anyway:
    - `contract.js` imports `presetOf` from `skill-presets.js`: the lookup is registered instead by one small bridge
      module, `js/modules/kit-setup.js` (new), which `print-sheet.js`, `screen-cell.js` and every node test that calls
      `getProvider` (`ws-presets-unit`, `ws-providers-unit`, `ws-anchors-unit`, `ws-layout-unit` and the others that
      import `sheet/index.js`) import; `getProvider` throws when no lookup is registered, so a missing import fails
      loudly instead of running without presets. The test edits are one line each, made by the row-1 lane (which owns
      `tests/scripts/*` until Wave 0 is merged) at row 2's request;
    - `contract.js` holds `INSTRUCTION_LIBRARY`, which `roles/practice.js` and `roles/compose.js` also import by name:
      the table moves to `sheet/instructions.js`, and `ws-envelope --engine` treats it as a **declared data leaf** —
      the walk stops there, and a unit test (`ws-envelope --self-test`) fails if a declared leaf ever exports anything
      but frozen plain tables (no functions, no imports). Which skills a change to it reaches is found by **output**,
      like every other instance-data change (the next list): keys are also chosen outside the providers
      (`print-sheet.js` `instructionKeyFor` and `SKILL_INSTRUCTION_FALLBACK`, `libraryKeyOf` matching stems by text,
      `todays-number.js`), so no file or key scan is trusted.

    So adding a preset or an instruction string (which E3 does) changes **instance data** — caught per skill by the
    matrix rows and the batch reading — and voids no certificate. Until M3 is merged both stay in the fingerprint (an
    edit voids and re-certifies). `sheet/instructions.js` belongs to the row-2 lane until M3 is merged, then to row 2b.
  - **Instance data**, outside the fingerprint: the other cell templates, every provider, the generators, `data.js`,
    `skill-options.js` entries, `skill-presets.js` (after M3), `sheet/instructions.js` (a declared data leaf, after
    M3). Each skill's own pages prove them through the per-instance gates (§1.6.3), the batch reading and the matrix.
  - The lists above are per role: Single skill also uses `more-practice.js` (more pages, the Faded packet) and the short
    key `key-short.js`, each with its own computed list — the certificate covers every role a kind uses, as
    `ws-envelope --engine` prints them.
  - The panes, `pv.js` and `k2kit.js` stay engine for every template that draws supports. So the step-4 items that edit
    engine modules — the fraction key and Lane D print backlog (`print-sheet.js`), Lane B answer + regroup boxes and the
    carry-under-the-line option (`stack`), place-value write-value (`pv`) — land **before** E2 certifies the pairs they
    touch; one that lands later re-certifies what it voids.
  - the **geometry class** = template, kind, size, look, columns, the size class of each cell (and, on multi-skill
    pages, the set of size classes present), the Examples / Fade / Layout values, and the option values the template
    declares as geometry-changing.

  An instance page inherits only if its structural fingerprint matches a certified one; a change to any engine module
  voids every certificate that uses it. **The engine modules are also the frozen set** after M4 (§1.6.5): one
  definition, the list `ws-envelope --engine` prints.
- the **content hash** = a hash of the rendered cell DOM / SVG. It is only for the golden diff (S4): which pages
  changed since they were last looked at. It never decides inheritance, so new numbers do not force full grades and
  the voiding safeguard cannot be bypassed by changing a hash.

**Machine checks — what runs where** (timings measured 2026-10-23):

| In node, no browser (seconds) | In the browser (measured) |
|---|---|
| the pure kit's unit gates: `ws-anchors-unit` (322 checks), `ws-layout-unit` (535), `ws-panes-unit` (202,727 checks over 4,488 renders), `ws-providers-unit` (105,383), `ws-supports-unit`, `ws-ink-unit`, `ws-code-snapshot`, `ws-presets-unit` (tables); the new `ws-node-lint` (S2) and `ws-packer-proof` (E1); enumerating the envelope and the all-pairs sample | `ws-print-lint --source kit`: ≈ 10 s to start, then ≈ 3–4 s a document (9 documents in 36.5 s); `ws-content-audit` ≈ 45 s for 310 skills × 240 items; `ws-screen-slots` ≈ 22 min and `ws-chromebook-fit` ≈ 17 min for their full sweeps (§1.1); cell measuring in `print-sheet.js` needs the browser too |

**The coverage matrix.** The skill × kind × size harness does not exist yet: `coverage()` (`sheet/registry.js:225`)
only reports whether a skill's template is registered. **`ws-coverage-matrix`** (new in E1) builds it. A **row** is
one skill, one kind and one setting of the content-bearing options, rendered at S / M / L with its keys; on the two
kinds that need several skills, the skill is dealt with fixed partners from the role sample (one 1 × 1, one 2 × 1, one
2 × 2 skill).

| Kind | Rows a skill |
|---|---|
| Single skill | defaults · An example at the top of each page · An example to start each group · An example with each problem · Faded problems · Faded page · Faded packet (3 pages) · each Layout it has (fact rows, timed check, Today's Number: 0–3) · 3 pages · an all-pairs set of the More options (columns, number line at the top, mix in prerequisites, the short key, key placement: 4 rows) — **12–15** |
| Sections | defaults · each Examples choice (4) · Faded problems · Bring back earlier skills · 2 pages · grouped by type · exam-style parts — **10** |
| Mixed practice | defaults · examples beside the first problem · examples at the top · Bring back earlier skills · 3 pages with rotation — **5** |
| Quiz layer | each kind with scoring and 2 versions — **3** |

That is 30–33 rows, 90–99 documents a skill, ≈ 68,000 documents for all 715 (≈ 66 h on one browser slot). The rows map
to `ws-print-lint`'s real flags — `--roles` (independent, more-practice, fact-rows, fact-probe, todays-number,
mixed-practice, review, test), `--anchors sections|side` (it passes any mode through, default `off`; E1 documents `top|first`), `--supports` with `--cover whole|needed|fade` and
`--mix section|problem`, `--key-style copy|short`, `--key-place`, `--opts`, `--count`, `--size` — plus four new
flags E1 adds: `--kind single|sections|mixed`, `--pages N`, `--bring-back` and `--sections per-skill|grouped|parts`.
- the Examples rows map to `--anchors`: at the top of the page → `top`, the first time → `first`, to start each group →
  `sections`, with each problem → `side`, None → `off` (`top` and `first` print once M4 has built them); the Sections
  rows "grouped by type" and "exam-style parts" map to `--sections grouped` and `--sections parts`;
- the Fade values map to the support engine: Faded page = `--supports all --cover fade` (supports fade by position down
  the page); E1 names the engine fields for Faded problems and Faded packet (the packet also needs `--pages`) and adds a
  flag where none exists;
- **Which rows a change reaches is found by output, not by file — by replaying the real code.** In plain words: each
  night the real worksheet maker builds every page and saves every size it measured; after a change it is run again
  without drawing, and any change to what a page shows, or to a size it measured, marks that page to be checked again.
  `buildSheet` makes
  its dealing decisions from measurements: it measures a probe before it sets counts (`buildSheetCore` probes 16,
  `probeRun`, `print-sheet.js:2073-2079`; `buildRoleSheet` probes 8, or 20 on the fact probe, l.2672-2680); probe
  items that are never printed set the cell floor (`floorWith`, l.2205; the role floors, l.2678); a section of several
  skills is dealt afresh on every pass of the count loop at that pass's own count (l.2088, `dealSkills` l.196); the
  supports split measures both arrangements (l.2174-2182); a More Practice letter over capacity is re-dealt (l.2255-2256);
  and the example band keeps one of four examples by measured height (l.2741). Copying those steps into a separate
  function would miss the next one, so the digest **runs the real code**:
  - at M4 the row-2 lane gives `buildSheet` two modes (`print-sheet.js`): **record** — the nightly's full render saves,
    for every row, every field each measuring call writes (`measureItems` returns nothing; it writes each item's heights
    per column, fit, slack, `measureWhy` and leaf widths onto the item; `measureTitleLines` returns the title's line
    count) — and **replay** — `buildSheet` runs its whole code path
    (every probe, every pass of the count loop at its own count, every re-deal, the examples, the role's `prepare`, the
    page frame) but answers each measuring call from that record instead of drawing, and stops before any page is
    drawn. Replay waits for `standards.js`, which `print-sheet.js` loads by dynamic import on the first print
    (l.1570-1575), so no footer's CCSS comes out empty;
  - **every measuring call is keyed by everything it is given**: each measuring function (`measureItems`,
    `measureTitleLines` l.1541, `measureTeacherBlocks` l.3268 once lessons join the matrix) is wrapped so that its key is
    a hash of the HTML it would place in the measuring frame (for a cell, `it.render(ctx, {cols})` in both states) and
    every option it reads (size, look, column count, `cellCls`, the supports box and `measureLevel`, `wrapToCell`,
    `tightRows`, the title text). So the same question measured under different supports, or a title, never shares a
    key with anything else; the record also stores the font status (`fontsReady`, l.1556) and a record made without
    Andika is refused;
  - the row's **digest** is a hash of the **PagePlans** the role composes for the pupil pages and the key — the one
    object both are rendered from (`plan()`, CLAUDE.md), holding every dealt and printed item, the settled instruction
    text (`settlePrompts`, `instructionKeyFor`, `libraryKeyOf`, the providers), the provider outputs, the role's
    `prepare` output, the frame (`skillMeta`, l.1655-1690: label, grade or grades, CCSS from `standards.js`, the "I Can"
    title from `optionTitle` / `factSetTitle`; the tab and footer text) and the options and presets in force — plus
    the list of every item dealt but not printed. Each plan item's `render` is a closure, not data, so it is not
    serialised into the hash: what a cell draws (its supports, the provider's `strings.sentence`, legacy markup) enters
    through its measurement key, because every printed item is measured by its own rendered HTML — a change there is a
    missing measurement, so the row counts as changed. The rest of turning a plan into HTML is engine code
    (fingerprinted). Record mode hashes the plans the real render produced, so E1's test that replay reproduces every
    stored digest checks replay against the real render. The year in `sheetDocument`'s `<meta>` (l.3815) is in no plan
    and never affects a digest; for the golden diff, M4 passes the year in the request, and the matrix and golden renders
    use a fixed one;
  - if replay asks for a measurement the record does not hold — anything measured changed, or the code took a path the
    night did not — the row counts as changed; so does a row the night did not record (a new skill's rows);
  - this is **exact by construction**: the same code with the same measured sizes makes the same decisions. Anything
    that changes a decision either changes a dealt item (a new digest, or a missing measurement) or changes the
    measuring and layout code or the stylesheets — `measureItems`, `floorOf` / `floorWith`, the count loop and the
    layout in `print-sheet.js` are among its browser-side parts, and `layout.js` / `paginate.js` are engine modules,
    all of which touch every print row (below).

  `ws-coverage-matrix --digest` (new, E1) runs replay for every row in one fresh browser profile (no cookies, no
  localStorage; seeds are always given, so `Math.random` is never reached — `print-sheet.js:89`). Generation costs
  ≈ 0.7 ms an item (measured 2026-10-23: 1,200 items in 0.84 s), ≈ 650,000 printed items ≈ 8 minutes, more with the
  unprinted probe items and the extra passes of several-skill sections; replay draws nothing, so E1 measures its real
  cost and the budget below is restated from that. The nightly stores its digests and measurements with its commit,
  so `--affected <commit range>` replays only the tip and lists every row whose digest differs from the stored one. A
  change to a generator module, a provider, `skill-presets.js`, `sheet/instructions.js`, the dispatcher or any other
  file therefore reaches exactly the rows whose pages it changes, wherever the code lives; a new addition skill
  reaches its own rows, not the ≈ 200 skills that share `gen-operations.js`, unless it changed theirs; a re-tag in
  `SKILL_STANDARDS` or a grade fix in `data.js` changes that skill's frame and so its digest. If replay throws an
  error, that row and every row of the same category count as changed.
- **Changes to measuring and drawing** — the code and styles that measure and draw in the browser — are found by file:
  - an engine module touches every row of the pairs that use it (the fingerprint);
  - every **print row** is touched by: the browser-side parts of `print-sheet.js` (`measureItems`, the key path
    including `legacyKeyFill`, the document wrapper `sheetDocument`), `print-generate.js` (it draws every legacy-cell
    skill), the printed document's eight stylesheets `SHEET_STYLESHEETS` (`print-sheet.js:70-73`: `css/brand.css`,
    `css/variables.css`, `css/base.css`, `css/ui-components.css`, `css/word-problem-visuals.css`,
    `css/print-worksheet.css`, `css/fonts/andika.css`, `css/sheet-kit.css`) and `SHEET_ENGINE_CSS`
    (`sheet/roles/practice.js`). Cells are measured today in the app document, under every stylesheet `index.html`
    loads, so at M4 the row-2 lane (which owns `print-sheet.js`) moves measuring into a frame that loads only
    `SHEET_STYLESHEETS` and `SHEET_ENGINE_CSS`, with a self-test (an E1 gate) that the measurements match the app
    document's on the role sample; until then every `css/` file touches every print row;
  - every other `css/` file and the screen hosts (`screen-cell.js`, `worksheet.js`, `quiz-take.js`, and
    `teacher-ui.js` / `teacher-quiz-ui.js`, which `quiz-monitor.js` reaches) touch the screen checks, which run in full
    at every deploy (S5 session 2: `ws-screen-slots`, `ws-chromebook-fit`). `index.html` loads every teacher stylesheet
    beside the hosts, so two new sweep modes check the big-board view (`teacher.css:96` zooms `#gameView`) and dark
    mode (`teacher.css:850-851` restyles the online worksheet) on a fixed sample — every screen host × one skill per
    template — inside session 2's time;
  - files that feed neither — the `index.html` stamp, `search-terms.js`, generated documents, tests and planning
    files — touch no row;
- a row's **dependency hash** = its input digest + the structural fingerprints of its pairs + a hash of the
  print render files above. A row is re-run when its dependency hash changes; a row already green for the same
  hash is not run again;
- the **nightly job** runs in its own cloud session (a scheduled task) on the tip of the integration branch
  (`claude/sweet-newton-c8wrv1`), records the commit and writes `design/audit/matrix/<date>.json`. It re-runs the
  affected rows plus a rotating seventh of all rows (≈ 9,700 documents, ≈ 4.7 h on the session's two slots), so every row
  is re-run at least weekly. When the affected rows exceed one night, it shards them over up to eight scheduled
  sessions (sixteen slots: the full matrix in ≈ 4 h);
- the **first nightly writes the per-row baseline** (every finding on every row at that commit, with a STATUS note of
  the counts), extending S9's per-skill baseline to the new rows; a **red row** is any finding beyond that baseline, or
  any other gate failure on the row;
- **at deploy** (S5 session 3) the tip's digests are computed (≈ 8 min) and only the affected rows run, within a budget
  of 500 documents (≈ 15 min on two slots): ≈ 23 minutes, beside the gate sessions. **Before M4** there is no replay,
  so every row counts as changed and every deploy that changes any file feeding a row takes the sharded run (≈ 4 h);
  the speed-up of this list starts when M4 is merged. Above the budget — any change to an
  engine module or a browser-side render file — the deploy triggers the sharded full run (≈ 4 h) and waits for it. Rows
  already green in the cache for the same dependency hash are not run again: a lane's precritic runs its skills' rows
  on its own session, so a 20-skill E3 family (≈ 1,900 documents) reaches the deploy already cached, and the deploy
  re-runs only what changed after. The deploy is refused when the latest nightly is older than 24 hours or any row of a live
  skill is red, or when it makes a family live without the owner's recorded go (§1.6.3 step 6);
- **the builder's own check** is the same: `ws-coverage-matrix --skills <its skills>` runs those skills' rows in the
  precritic — 90–99 documents, ≈ 5–6 minutes a skill on one slot.

#### 1.6.3 What a certificate covers, and what every instance still proves

| Rubric check (RUBRIC §2, §4) | Comes from | Proved per instance by |
|---|---|---|
| C3 cell geometry, grid, columns, rules, spacing tokens | the certificate (same structural fingerprint) | — |
| H5 page fill, lone item, split cell, mid-page footer | **per instance** (it depends on the content) | `ws-print-lint` L-DENSITY PAGEFILL, L-SPLIT, the lone-item check (S2) |
| H13 empty band in a cell | **per instance** | `ws-print-lint` L-DENSITY H13 |
| H9 / H12 room to write and draw | **per instance** | `ws-print-lint` L-ANSAREA (SL-1, SL-6, H12) |
| H2 clipped, overlapped, illegible; text below 8 pt | **per instance** | `ws-print-lint` L-OVERFLOW, L-SIZE |
| H4 colour, emoji, non-Andika face | certificate + per instance | `ws-print-lint` L-INK, L-EMOJI, L-FONT |
| C4 notation and wording (stacked fractions, × not x, the instruction-library wording) | **per instance** (it comes from the item text) | `ws-node-lint` notation rule (new, S2, with its backtest); instruction strings from the library only (`ws-providers-unit`) |
| H1 / H10 answer key right, matches the slots, facsimile | **per instance** | `ws-print-lint` L-KEY; the key certificate for its layout |
| H3 an item contradicts the skill's name | **per instance** | `ws-content-audit` for the families it audits today (operations, K-2, place value, time and money, function table: ≈ 310 skills); E3 adds each family's name rules as that family passes; until then the critic's batch reading checks the name |
| H6 screen: scroll, inputs reachable, touch targets | **per instance** | `ws-screen-slots`, `ws-chromebook-fit` on its own skills |
| H8 a production item turned into multiple choice on screen; a doubled answer slot | **per instance** | multiple choice: `ws-content-audit` (P-29) checks operations and K-2 (numeric options) today; S2 extends it to every other family — which needs `ws-content-audit` to sample every live skill, not only its ≈ 310, and to read which items are production items from each skill's response mode (`design/PROBLEM_TYPES.md`, print ↔ screen) — with a backtest (a seeded production item offered as buttons); doubled slot: `ws-screen-answer`, `ws-screen-slots` |
| H11 a page type the skill must support cannot be produced | **per instance** | `ws-coverage-matrix` (every row — kind × size × the options above — prints, with its key) |
| H7 a screen verb on paper, a paper verb on screen | **per instance** | paper: `ws-print-lint` L-VERBS; screen: `ws-screen-slots` (paper-verb check) |
| C1 ease of use and C2 educational value (can the pupil do it alone; does it teach the named skill well; difficulty; misconceptions) | **per instance, by an independent critic** | the batch reading below, with the measured numbers beside each page |

**Making an instance** on certified pairs:
1. The builder writes data (a skill entry, option values, a preset, a provider, a lesson card), not drawing code.
2. The precritic runs every per-instance gate in the table, plus the **envelope check**: a page whose structural
   fingerprint matches no certified one (a new option value, size, number range, size class, kind) is **outside** and
   gets a full four-criterion grade.
3. An independent critic reads **every instance** as a batch, **against the benchmark** (owner 2026-10-23): the work
   STATUS records as PASSED at 8 or better — the five detailed lessons, the custom number line (5.2, critic r9), the
   small fixes (r7) and the answer-key options (r5) — and, as each pair is certified (E1, E2, M5), the pages graded to
   certify it. A benchmark page of the same kind of worksheet sits beside each instance's pages, so every new skill is
   judged against the quality the owner already likes. Sections and Mixed practice have no passed page yet: their first
   benchmark pages are the ones graded in full to certify the sections composer (E2) and the mixed packer (M5), and no
   instance on those kinds is read before then, because none inherits until its composer is certified (§1.6.2). Each A4 page is rendered at 150 dpi (≈ 1240 px wide) and printed two to a sheet, at
   size M, with the measured numbers beside it (digit size, slot sizes, free space). It reads every page whose **content** a provider or the skill's data writes — the pages where C1 and C2 can differ:
   - Single skill at its defaults; with **each Examples choice** (an example at the top of each page; an example to
     start each group; an example with each problem); with **each Fade** (Faded problems; Faded page; the first and last page of a Faded packet); with each
     Layout the skill has (fact rows, timed check, Today's Number);
   - Sections pages with "An example the first time", with "Examples at the top of the page" and with Faded problems,
     and Mixed practice pages with examples beside the first problem and with examples at the top, each with its
     partners;
   - the instance on the screen hosts at RUBRIC's widths: the practice card at 1280, 820 and 390; the online worksheet
     and the quiz at 1280.

   That is 13–16 pages (7–8 sheets) and 5 screens a skill — a family of 20 skills is about 140–160 sheets and 100
   screens for one critic run. The rows that only **re-arrange** the same items — more pages, Bring back earlier skills, sizes
   S and L, the More options, the short key, the quiz versions — are proved on every page by the machine gates and the
   composer certificates, and graded by the critic in the 20 % sample. Two More options do add content: Mix in
   prerequisites adds other skills' items, which those skills' own batches read; the number line at the top is drawn by
   `sheet/refline.js`, which becomes engine when E1 walks the bridge's measuring path (M4); until then it is
   machine-gated on every row and read in the sample. The answer keys are proved by machine on every
   page (L-KEY, the key certificates) and read in the sample. The critic grades C1 and C2 for every instance, and a
   random 20 % of all the instance's pages on all four criteria at full scale. So the worked examples, fades and
   misconceptions written in the provider pass are read for every skill, not only by the sample.
4. **If any sampled or batch page scores below 8,** the batch fails: that instance gets a full grade on every page, the
   builder fixes it, and if the cause is in the engine (not the instance's data) the pair's certificate is withdrawn
   and its other instances are re-graded.
5. The final PASS lists every page and where its scores came from (graded directly, or inherited from which
   certificate).
6. **The owner sees each family before it goes live** (owner 2026-10-23): one picture sheet of the family's pages
   (each skill's Single skill page at M with examples on, about 10 minutes to look over). The family goes live when the
   owner says go: the go is an `Owner go: <family>, <date>` line in the lane's status file (`design/status/<lane>.md`).
   The S5 runner reads the lane manifests in the deploy (§1.6.6) to see which families it makes live — new skills, and
   an E3 provider pass on a family already live, both count — and refuses the deploy if any of them has no go line
   (§1.6.2, §4.1). The owner can stop it or ask for changes, which go back through steps 2–5.

#### 1.6.4 Safeguards

| Risk | Safeguard |
|---|---|
| An inherited page is weaker than the sample | every instance's C1 / C2 read by a critic; 20 % graded in full; every per-instance gate in §1.6.3 |
| An instance outside what was certified | the envelope check sends it to a full grade |
| The engine changes after certification | the structural fingerprint changes and voids every certificate built on that code; those pairs are re-certified |
| A pair nobody graded | certificates are per (template, kind) pair; there is no inheritance across pairs |
| Inherited scores drift from reality | **an inheritance audit at every deploy**: a fresh critic grades at full scale at least one inherited page of every pair the deploy touches, plus a random 5 % (at least 10 pages) of all inherited pages; any page below 8 withdraws that pair's certificate and its instances are re-graded in full |
| A certificate built on old renders | E1 certifies `stack` × Single skill by **running** the all-pairs sample now, not by reusing renders made before; until then it is recorded as partial and nothing inherits from it |
| The rule "8 or better, everywhere" | every page is **held to 8**: graded directly, or inherited from a certified pair with its source listed, with C1 / C2 read for every instance. That is a change in how a page counts as graded, so it is the owner's call (Q-S4) and goes into CLAUDE.md and RUBRIC only after the owner agrees — **agreed 2026-10-23** |

#### 1.6.5 By product

- **The three kinds of worksheet, for every live skill — first (owner 2026-10-23).** "Every worksheet" = each kind
  (Single skill, Sections, Mixed practice) with every option §2.5 gives it, the Quiz layer on all three, each with its
  facsimile and short keys, at S / M / L, on paper and on the three screen hosts.
  1. **Certify the pairs** for the templates the live skills use — **only after M4**, because M2 edits `layout.js` and
     `paginate.js`, M3 `cell.js` and M4 `frame.js` and `answer-key.js`, and each of those is in the structural
     fingerprint, so an earlier certificate would be voided at once. E1's tools are built during Wave 0; certifying
     starts when M4 is merged. Then, in this order: Single skill and Sections (E2, by the worksheet lane, which from then
     on owns `independent.js`, `practice.js`, `more-practice.js`, `fact-rows.js`, `fact-probe.js`,
     `todays-number.js`, `answer-key.js`, `key-short.js`, `supports.js`, `support-draw.js`); the mixed packer and
     Mixed practice at M5 (the mixed-page lane owns `mixed-practice.js`, `review.js` and, until M4 is merged,
     `answer-key.js`); the Quiz layer with T3 (`test.js`, owned by the T3 lane). **The frozen set is the engine
     modules** of the certified pairs, as `ws-envelope --engine` computes them (§1.6.2) — the kit modules, not the
     templates, providers or presets, which the template work (step 4) and E3 keep editing. A later change to a frozen
     module goes through its own lane and re-certifies what it voids.
  2. **Provider pass (E3), family by family**, largest family first so that the most skills gain every worksheet
     soonest: the 454 skills on default adapters get real providers as data — `workedSteps` from the template's step
     grammar, `wrongAnswer` and `misconceptions` from the signed card's Misconceptions section (S3 card item 6),
     `strings` from the instruction library. `ws-providers-unit` checks each: the steps reach the key, the wrong answer
     is a tagged misconception, no hint holds the answer. Pools (`mixed_*`, `*_all`) take each item's provider from the
     member skill that dealt it, so a pool is done when its members are. Skills still drawn by the `legacy` cell
     (E3 adds a template column to `ws-catalogue` — each skill's `q.cell.template` over its seeded items, which it does not
     record today — and passes those rows to `coverage()` as `{key, template}`; plain key strings would mark every skill
     legacy) get their provider data in the pass, but stay outside every envelope (full
     grades) until their family's kit migration (ROADMAP P8 / P9).
  3. **Done when** every live skill (715 today) prints every worksheet above with its keys at S / M / L and on the screen
     hosts: `ws-coverage-matrix` green for every skill × kind × size, every instance read in a batch, every page
     inside a certified pair or fully graded.
  4. The thinking pages (Error analysis, True or False?, Reason It, Stretch) stay paused (owner 2026-10-09, MASTER_PLAN
     Wave 9; Q-W4 asks whether they still wait now that lessons are later). When they start, they are certified the
     same way and are cheap, because step 2 gives every skill its misconceptions and wrong answers.
- **Papers** — the paper composer is certified once on an all-pairs sample of the §2.5 choices (the three kinds, pages
  1 / 3, weights equal / unequal, each kind's options, S / M / L). Quiz = Practice + a scoring layer (T3 builds it, T6
  retires the separate builder), so it is certified as the Quiz layer, not as a second engine.
- **Lessons — a later wave, if needed (owner 2026-10-23).** Nothing below is built before that wave; the standard
  lesson maker and the five passed detailed lessons stay live as they are. When it starts:
  1. **Lesson-packet pages are engines too** and are certified first, per page and template: anchor chart, Steps,
     Opener, Scripted Model, Guided, P0 pre-skill check, P1 number sense, P5 word problem, P6 exit slip, vocabulary,
     Check Question, the teacher pages (`sheet/roles/lesson.js`, `detailed-lesson.js`, `teacher-parts.js`). Most lesson
     critic defects were on these pages.
  2. **Lesson shapes:** `design/lessons/SHAPES.md` (new) classifies all 67 owner lessons into shapes (the five passed
     lessons start five: read / write a number in its forms; a bar-model word problem; a property of an operation; a
     pattern on a table; a rule table). Done when every lesson has a shape or is marked "new shape", and each lesson
     lists the templates it needs — the Measurement & Data and Geometry lessons wait for their templates (§1.5).
  3. **The lesson compiler** (`compileLesson(card)`, `js/modules/lessons/compile.js`, new). A **lesson card** is a short
     form the owner signs before a lesson is made: which White Rose step and standards it teaches, its skills and their
     settings for each part, the number ranges, the edge cases, and any ruling such as "1,000 on the board only". From
     the card the compiler writes the description: atoms and the pre-skill check from the skills' prerequisites; chunks
     from the option ladder (one new thing per step, PEDAGOGY P-1); the anchor chart, scripts and Steps from
     `workedSteps` and `strings`; the Guided fade; Practice and exit from the generators with the LR-5 pool; the
     mistakes table and Check Question distractors from `misconceptions` / `wrongAnswer`; vocabulary from the skill.
     The builder writes only the story, the hook and the shape's teaching notes, and edits. Target (S8): the
     hand-written part falls from ≈ 330 lines to under 100.
  4. **Lesson precritic:** `ws-detailed-lesson --check` plus the new checks in §1.6.1 (modelled before practised,
     nothing given away, rulings and ranges), each with a backtest on a failed lesson commit, and the extended E24 / E29.
  5. **Proof before use:** recompile lessons 1–5 from cards and diff every page against the passed pack (every
     difference explained, and the packs pass `--check` and a full critic); then compile **lesson 6 as a hold-out**
     (the compiler was not shaped on it) and give it a full critic. Only then is the compiler used for new lessons.
  6. **Grading:** the first two lessons of a new shape get a full critic on every page (this certifies the shape); from a
     shape's third lesson, the teacher pages are graded in full and the pupil pages follow §1.6.3. So the speed-up
     starts at each shape's third lesson.
  7. **Intervention library:** MASTER_PLAN Wave 8 sets its format (the owner's Atomised Lesson V20), the paused
     lessons-engine branch and the `LESSON_COVERAGE.md` record. Whether it is built with the standard lesson maker as a
     "standard lesson" shape, or on V20 through the compiler, is asked when the wave starts (Q-L1); either way it is
     compiled family by family after the provider pass and graded by §1.6.3.

#### 1.6.6 More lanes without collisions

- **No lane edits a shared file.** Each lane writes a manifest (`design/lanes/<lane>/manifest.json`: new skills with
  their SKILLS entry, `SKILL_STANDARDS`, `SKILL_WRM`, search terms, presets, providers, lesson cards); an integrator
  (`tests/scripts/ws-integrate.mjs`, new) applies manifests in merge order — appending skill ids (share codes stay
  append-only), regenerating the catalogue, coverage reports, the lesson registry and STATUS (S6), and stamping
  index.html once. This removes the conflict class behind 152 merge commits and 10 conflict fixes (§1.1). The
  integrator has its own gate: `ws-integrate --self-test`, and a dry run that rebuilds today's tree from manifests with
  `ws-code-snapshot`, `ws-standards`, `ws-search-terms` and `ws-presets-unit` green and no diff.
- **One lane per cloud session.** A container has 4 cores and two browser slots; ≈ 14 agents in one container starved
  them (STATUS:91). Each lane in its own session has its own slots and runs only its own instances in the browser.
- **Up to 6 lanes at once** after E5 (one per template family), instead of 3 (Q-S6), **plus other sessions as
  needed** for checks, reviews and research (owner 2026-10-23: "up to six here but we can also use other sessions to
  speed things up as well"). The limits are then critic capacity and the owner's signing time, not machines.
- **The owner signs cards in batches** — a template family's cards in one sitting, each question with a recommended
  answer — so no lane waits mid-build.

#### 1.6.7 Phases

| Step | Work | Files | Done when |
|---|---|---|---|
| E1 | Envelopes, all-pairs sampling, structural fingerprint (binding-level engine modules), certificates, the coverage matrix with option rows, `--affected`, the dependency cache, the nightly job and the first per-row baseline, the packer proof and its print-time asserts (tools built in Wave 0; the first certificate after M4) | `tests/scripts/ws-envelope.mjs` (new), `tests/scripts/ws-coverage-matrix.cjs` (new), `tests/scripts/ws-packer-proof.mjs` (new), `tests/scripts/ws-print-lint.cjs` (`--kind`, `--pages`, `--bring-back`, `--sections`; `--anchors` documents `top|first`); the print-time asserts in `sheet/roles/mixed-practice.js` and the move of `print-sheet.js`'s measuring and key path into a module of its own are done by the row-2 lane at M4, which owns those files, `ws-grade-render.cjs` (`--envelope <template>--<kind>`, new flag), `design/audit/certified/`, `design/audit/matrix/` | `stack` × Single skill certified by running its all-pairs sample after M4; its certificate lists every page and score source; `ws-envelope --engine` prints the engine lists of §1.6.2; a deliberate change to `layout.js` voids `stack` × Single skill in a dry run, while a change to one provider, to a template the pair does not reach, or (after M3) to one preset or one instruction string voids nothing; a one-line change to `print-generate.js` makes `--affected` list every print row, while one new skill's commit in the project's usual shape — its SKILLS row, a new branch in `gen-operations.js` and its dispatcher entry, provider, `SKILL_STANDARDS` / `SKILL_WRM` entries, search terms and its pinned share code in `skill-codes-frozen.js` — plus the `index.html` stamp lists only that skill's rows; changing one instruction string lists exactly the rows whose items print it (checked against a full render); replaying the nightly's own commit reproduces every stored digest (hashed from the real render's PagePlans) exactly, with its measured time recorded (target ≤ 10 minutes); a change that alters only an item past the probe, only a probe item that is not printed, only one pass of a several-skill section whose count loop shrank, or only a skill's primary CCSS tag in `SKILL_STANDARDS` (what `primaryCcss` prints) or its grade span, each lists its row, while a change to a secondary tag that prints nothing lists none; a supports-split row replays to the real render's digest; measuring in the stylesheet frame matches the app document on the role sample; `ws-envelope --self-test` fails on a declared data leaf that exports a function; the nightly matrix runs and its first run writes the per-row baseline (STATUS note); a seeded new finding beyond that baseline turns its row red and blocks a test deploy; `--affected` on a one-generator change lists only that generator's skills |
| E2 | Certify Single skill and Sections for the live skills' templates (after M4 is merged); the mixed packer and Mixed practice at M5; the Quiz layer with T3 | the files each lane owns (§1.6.5) | every pair the live skills use certified, or listed as outside with the reason |
| E3 | Provider pass by family, largest first | `js/modules/sheet/providers/*`, the cards, `tests/scripts/ws-catalogue.cjs` (template column), `tests/scripts/ws-content-audit.cjs` (each family's name rules) | `real` providers 715 / 715 (pools through their members; legacy-cell skills listed); `ws-providers-unit` green; `ws-coverage-matrix` green (§1.6.5 item 3) |
| E4 (later lesson wave, if needed) | Lesson-packet pages certified; shapes file; compiler; lesson precritic; recompile 1–5 + hold-out lesson 6 | `js/modules/lessons/compile.js`, `design/lessons/SHAPES.md`, `js/modules/lessons/shapes/*.js` (new), `tests/scripts/ws-detailed-lesson.cjs` | §1.6.5 Lessons items 1–6 done |
| E5 | Lane manifests + integrator; one lane per session | `design/lanes/`, `tests/scripts/ws-integrate.mjs` (new) | integrator gate green; a week of six lanes with no shared-file conflict |
| E6 | Inheritance audit at every deploy | `design/audit/certified/audit-<date>.md`, the deploy runner (S5) | the audit procedure in the S5 runner; the first audit run and recorded; a seeded bad inherited page withdraws its pair's certificate in a dry run |

**Expected effect** (targets; S8 measures them): skills on certified pairs made like the presets — a family per builder
run; every live skill on the three kinds of worksheet without per-page grading of each skill; in the later lesson wave,
lessons from a shape's third onward in one critic round instead of 3–4, with under a third of today's hand-written
text; six lanes instead of three. Together this aims at several times today's throughput (≥ 5× on the backlog); if S8
shows less, the next audit says why.

### 1.7 Which effort, and which kind of check (owner question, 2026-10-23)

Owner: "did you also decide when to use different opus 5.5 efforts and also when to do mechanical checks vs. other
types of checks". The rules were spread over §1.2–§1.6; this section sets them out in one place, and S7 writes them
into CLAUDE.md "Agents" and `design/audit/LESSONS_LEARNED.md`. Every agent is Opus 5.5, called with `model: "opus"` and
the profile below. The effort comes from the profile, and medium is the ceiling (CLAUDE.md "Agents").

**Which effort**

| Work | Profile | Why |
|---|---|---|
| The first skill of each new drawing — the model skill that certifies a template (§1.5 step 2) | `mq-opus-medium` | new, hard work; at low effort it cost 2–5 extra critic rounds (§1.1). Decided (Q-S1) |
| The rebuild of any skill or copy that failed a critic round | `mq-opus-medium` | decided (Q-S1); a later change to an engine, tool or screen that fails a round goes back to medium too (Q-S7) |
| The first build of each new engine, tool or screen: the new Wave 0 tools (`ws-precritic`, `ws-node-lint`, `ws-spec-card`, the golden renders, the deploy runner), the E1 tools (`ws-envelope`, `ws-coverage-matrix`, `ws-packer-proof`), `interleave()` and the mixed packer (M1–M2), record / replay (M4), the integrator (E5), and each teacher-site screen (T1–T6: the shell and tray, the Skills gallery, the worksheet sheet, Quiz, Share, Lessons, Classes) | `mq-opus-medium` | one fault there reaches every page, and it is new, hard work like a new drawing; later changes to them go back to low. Decided (Q-S7) |
| Copies on a certified drawing, written as data: further skills, options, presets, providers (E3), cues (M3), lane manifests | `mq-opus-low` | the drawing is already approved, and the machine checks catch what low effort misses (§1.3) |
| **Any build on a (template, kind) pair that is NOT yet certified** — including "copies" and redos of existing skills (pilot lesson, 2026-10-23: SU-C on `stack` × Single skill before its certificate, built at low, critic r1 min 4) | `mq-opus-medium` | without a certificate there is no approved model to copy; it is first-build work (Q-S1, Q-S7) |
| Small fixes with a known defect list, redos of a passed skill, later changes to an engine, tool or screen already built | `mq-opus-low` | the brief names the fault; a failed round moves the work up (second row) |
| Independent critics: certifying a pair (full grade), the batch reading of every new skill, the 1 in 5 full grades, the inheritance audit at every deploy, reviews of plans and spec cards | `mq-opus-medium` | CLAUDE.md "Agents"; a critic never grades work its own agent built |
| Explorers and small one-off checks: find a file, count, read a log, run a gate and paste its table | `mq-opus-low` | no judgement needed |

**When medium is not enough.** If the same defect survives two rounds at medium, the loop stops. The orchestrator
(the lead session) finds the root cause, turns the defect into a machine check proved by a backtest (S2), and briefs a
fresh builder with the check and the cause. If the cause is a rule nobody has decided, it goes to the owner on the next
spec card. Every escalation is recorded in STATUS and in the metrics (S8) by profile name, since an agent cannot see
its own effort.

**Which kind of check.** The rule: **if a machine can measure it, a machine checks it — on every page, every time;
people spend their time only on judgement.**

| Step | Kind of check | What it decides | Who, and when | Examples |
|---|---|---|---|---|
| 1 | Machine, in node (seconds) | anything readable from the item, the page plan or the key: notation, and wording from the instruction library; an answer given away; repeats; number ranges, edge cases and rulings from the card; the mixed packer's geometry | the builder on every change (precritic, S1); nightly; every deploy | `ws-node-lint`, `ws-providers-unit`, `ws-packer-proof`, the unit gates |
| 2 | Machine, in the browser (minutes) | anything that needs the generators or the page drawn in the browser: the skill's name against what it deals; sizes, spacing, room to write, clipping and overlap, ink and font, page fill, the key matching the slots, every kind and option printing, screen fit | the builder on its own skills' rows; nightly on all rows; every deploy on the rows a change reaches, plus the full gates | `ws-content-audit`, `ws-print-lint`, `ws-coverage-matrix`, `ws-screen-slots`, `ws-screen-answer`, `ws-chromebook-fit` |
| 3 | The builder's own look | catches plain faults before handing over (LESSONS_LEARNED pre-flight); **never counts as a grade** (builders' own 8s were marked 5–6 by critics, L9) | the builder, before its report | renders of its own pages |
| 4 | Critic reading (judgement) | C1 ease of use and C2 teaching value: can the pupil do it alone, does it teach the named skill, the difficulty, the worked examples and fades, the misconceptions and distractors, whether teacher text is right — and anything no machine check covers yet | an independent critic (`mq-opus-medium`), only once steps 1–2 are green | the batch reading of every new skill against the benchmark (§1.6.3 step 3) |
| 5 | Full grade (all four criteria, at full scale) | the whole rubric on a page | an independent critic: certifying a new pair; any page outside what was certified; any new kind of page; 1 in 5 pages of every batch; every page of a skill that scored below 8; the inheritance audit at every deploy | §1.6.2, §1.6.4 |
| 6 | The owner's look | does the family look and teach like the owner's workbooks | the owner: one picture sheet per family, before it goes live | §1.6.3 step 6 |

The order is fixed. A critic never sees a page whose machine checks are red (the orchestrator refuses a report without
a green precritic table — red only where the pinned baseline is, S1), and the owner never sees a family the critic has not passed.

**How the line moves.** Every defect a critic finds is tallied by class (S8). A class a machine can measure becomes a
machine check, proved by a backtest (S2), and leaves the critic's list. Over time the critic reads less and the machines
check more, at the same bar of 8; what stays with the critic is what §1.6.1's table marks as staying with the critic.
How much runs when: while building, only the lane's own skills (`ws-precritic --skill`); each night, the rows a change
reaches plus a rotating seventh of all rows; at deploy, every gate (S5) and the rows the change reaches.

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

**Owner 2026-10-23: multi-lesson practice sets, highly customizable.** In Lessons, each lesson lists its skills with
tick boxes; **Add to tray** makes a tray **group named after the lesson**, and a **Next lesson** arrow moves on (the
teacher does this for 5–6 lessons). **Print** then offers, all as options (owner: "both could be options — I want it highly
customizable"): **one worksheet per lesson** (pages per lesson, e.g. 2, each with its own key), **one worksheet for all**
(laid out as **Mixed practice** or **one section per lesson**, 1–2 pages or more), or **both**; every Single skill /
Sections / Mixed practice option of §2.5 still applies per worksheet. **Print all** gives one PDF in lesson order, each part
with its key — only the lessons the teacher added, and only the skills ticked in each (owner: "for only selected lessons"). **Save as set** keeps the groups (reprint later with new numbers); **Share** gives one short code for the whole
set. Engine: a batch of `buildSheet` requests (one per lesson group, plus the combined one), concatenated into one document;
the set code extends the compact set code (§2.4). Built with the owner's next batch of design changes (process rule 0).

**Owner 2026-10-23 (confirmed): the tray is built for 40–100 skills** ("we might practice problems from a whole grade level"). Up to about 8 skills it shows chips; above that it collapses to one summary bar ("Grade 3 · 64 skills · 6 areas", one segment per maths area) that opens a tray sheet grouped by area, with search, one-tap remove per area and per skill, and a height cap. Skills gains **Add whole area** and **Add whole grade**; Lessons gains **Add this unit**. "How often" is set per area first, per skill only when opened. Print summary and preview work at 100 skills (each skill at least once if the pages allow, otherwise sampled, and the summary says so); Single skill with many skills warns. Share needs a **compact whole-grade / whole-area set code** so the link stays short — a `skill-codes.js` change (after M1 releases that file; append-only, `ws-code-snapshot` green). Quiz builds from a whole grade or unit.

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

### 2.5 The worksheet sheet — three kinds of worksheet, plain options (owner 2026-10-23)

Owner, 2026-10-23: "reduce the types of worksheets to 3 general — mixed practice (with options), single skill (with
options), or sections with options", and "no different practice and then I Can etc." So the sheet offers **three kinds
of worksheet and nothing else**; every other page type of today's print screen becomes an option of one of them, or
happens on its own; there is no Look choice (Auto / I Can / Daily) and no lettered A / B pages (decided earlier the same
day).

| Kind of worksheet | What it is | Default when |
|---|---|---|
| **Single skill** | one skill on the page (with several skills ticked, each skill gets its own pages, shared out by weight) | one skill is in the tray |
| **Sections** | several skills on one page, each in its own section with its own instruction | the paper comes from a lesson ("Print practice", "Practise pre-skills") |
| **Mixed practice** | several skills mixed together on the page (§3) | two or more skills are in the tray |

**Options — each kind shows only its own:**

| Option | Single skill | Sections | Mixed practice |
|---|---|---|---|
| **How many pages?** (1 · 2 · 3 …; every page new numbers; the key follows) | ✓ — with several skills, pages shared by weight; the count starts at the number of skills | ✓ — sections flow across the pages by weight; a section never splits mid-row | ✓ — each page a full mixed page with the weights kept |
| **How often does each skill come up?** (per skill: Less · Equal · More = 1 : 2 : 3; a number in the chip's options) | with several skills | ✓ | ✓ |
| **Examples** | None · **An example at the top of each page** · **An example to start each group** (every few problems) · **An example with each problem** (Q-W2, where it fits). On Single skill, "the first time" is the example at the top of each page | None · **Examples at the top of the page** (one for each skill on it) · **An example the first time each kind of problem appears in a section** · An example to start each group · An example with each problem (where it fits) | None · **Examples at the top of the page** · **An example the first time each skill appears on a page, beside its first problem** (§3.3) |
| **How the sections are made** | — | **One section per skill** · **Grouped by type** (you name the sections — "Adding", "Taking away", "Time" — and drag skills into them; similar problem types sit together) · **Exam-style parts** (Part A, Part B …, each with the skills and number of problems you choose) | — |
| **Fade supports** | Faded problems · Faded page · Faded packet (across the pages chosen) | Faded problems | — |
| **Layout** (shown only for skills that have one) | Standard · Fact rows (5–10 across) · Timed check (fact skills) · Today's Number (place-value skills) | Standard | Standard |
| **Bring back earlier skills** (spaced review) | — | ✓ | ✓ |
| **Size** | S · M · L | S · M · L | S · M · L |

Defaults: How many pages 1 (Single skill with several skills: one page per skill); Equal; Examples None, or "the first
time each kind appears" (top of the page on Single skill) when the paper comes from a lesson (its skills are new);
sections one per skill; no fading; Standard layout; no earlier skills; Size M. (Owner 2026-10-23: Mixed practice by
default for 2+ skills, Sections always available, all three ways of making sections, examples "for each new time it
comes on a section or page", and examples at the top of the page as an option on every kind.)

- **Today's page types become options or go** (`teacher-print.js` `PAGE_GROUPS` today: Independent, More Practice,
  Mixed practice, Word problems, Lesson standard / detailed, Lesson opener, Scripted model, Guided, Pre-skill check, Check
  it, Review, Test A / B, Fact rows, Fact probe, True or False?, Reason It, Stretch):
  - Independent → Single skill; More Practice → How many pages?; Mixed practice → Mixed practice;
  - Scripted model → Examples; Guided → Fade supports; Fact rows and Fact probe → Layout; Today's Number → Layout; Review,
    Daily spiral and Daily 4 → Bring back earlier skills;
  - Word problems → word-problem skills, which go on any kind (LESSON_LIBRARY_PLAN §8e: word problems are skills);
  - Pre-skill check → Lessons › Practise pre-skills, which puts the pre-skills in the tray (Sections);
  - Test A / B → the Quiz button (§2.4), which offers the same three kinds with scoring and 1–6 versions;
  - the lessons and the lesson opener → Lessons (new lessons in a later wave, §1.6.5);
  - True or False?, Reason It, Stretch → paused thinking pages (MASTER_PLAN Wave 9; Q-W4); Check it is already paused
    (`teacher-print.js:51`);
  - the further `PAGE_TYPES` entries not offered today — Computation grid and Visual grid → the Standard layout, which
    the skill's template picks on its own; Lesson packet → Lessons.
- **The page title is automatic:** Single skill prints the "I Can" title (the goal of the one skill), except its Fact
  rows, Timed check and Today's Number layouts, which keep the everyday header they have today (the look changes their
  geometry, e.g. `fact-rows.js` `cellWidthMm(…, ctx.look)`, so it is part of the fingerprint's geometry class); Sections
  and Mixed practice print the everyday header with the skills named under it (§3.3). No Look choice.
- Under the options: a **one-line summary** ("2 pages · 16 problems · Addition 6, Time 5, Fractions 5 · answer key at
  the end") and a **small preview** — a thumbnail of the first page when every page holds the same kind of problems, or
  of the first 2–3 pages when they differ. **Print** makes the PDF, which is the full view. **New numbers** re-deals
  every page (it replaces "version B" on practice papers).
- **More options** (rarely needed): Mix in prerequisite skills, header fields, answer-key placement and style, number
  line at the top, columns.
- Engine mapping (no new renderer): Single skill → the Independent role with its page count, the layouts (`fact-rows`,
  `fact-probe`, `todays-number` roles) and the fade modes; Sections → today's sections; Mixed practice →
  `arrangement: 'mixed'` (§3), with Bring back earlier skills drawing on the Review / Daily spiral selection; pages →
  the role's page count; weights → the per-skill `weight` option; "An example to start each group" → `anchors:
  'sections'` (an example band, then the block's 3–4 problems, `blockPlan` in `sheet/anchors.js`; the mixed-practice
  default today, `anchors.js:16`); "An example with each problem" → `anchors: 'side'`; None → `anchors: 'off'`
  (`ANCHOR_MODES`, `anchors.js:25`); on Mixed practice pages the engine's existing compact example bands are reused and
  measured per page (M4). Two example placements are new anchors modes (M4): **at the top of the page** (`anchors:
  'top'`: on Single skill one worked example at the top of each page; on Sections and Mixed practice one compact band
  for each skill on that page, the engine's mixed-practice band) and **the first time** (`anchors: 'first'`: one worked
  example before the first problem of each kind in each section, or beside each skill's first problem on a Mixed
  practice page). Owner 2026-10-23; the 2026-09-26 "one example on top of each block" stays as "An example to start
  each group". Custom sections need no new engine: a worksheet request already carries a list of sections, each with
  its skills and count (`req.sections`); grouped and exam-style sections add a section title ("Adding", "Part A")
  printed in the section's band (M4). The other roles stay in the code (nothing is deleted), so old share codes, saved sets and links — including
  letters A–J and a `look` value — decode to the same pages (`ws-code-snapshot`); they are no longer offered on screen.

### 2.6 The flows

Counted the same way for today and the new design: **actions** = every click, typed search and needed scroll, from the
place the teacher starts. **Steps** = the screens / decisions (the owner's "3–4 steps"). `ws-teacher-flows` clicks
every row and asserts its action count, including the 6-action case for Lessons.

| Task | New flow | Steps | Actions new / today |
|---|---|---|---|
| One skill on paper with its key | search → tick → Print → Print | 3 | 4 / 6 |
| A mixed page of 3 skills | tick 3 (search each, or from one maths-area list) → Print (Mixed practice by default) → Print | 3 | 5–8 / 13 |
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
- **Neutral backgrounds** — **owner 2026-10-23 (confirmed): warm stone page #EFECE8, white cards #FFFFFF, surface-2 #E5E1DB** (cream only as text on dark fills; #111318 dark unchanged; contrast gates measured against the stone page), no pastel washes outside the group tints. Grades are numbered neutral
  pills.

**The owner chose board C** (Q-T6, 2026-10-23: the Awsaj maths site's warm cream and earthy colours; colour marks the maths area and the grade gets its own non-colour badge); T1 renders board C, with boards A and B kept as static reference images. For the record: **A** six areas (Measurement and Data share mint; Ratio /
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
  (More options of Share), the page-type picker (`PAGE_GROUPS` / `PAGE_TYPES` in `teacher-print.js`, about 18 types) and
  the Look control (Auto / I Can / Daily) — replaced by the three kinds and their options (§2.5, owner 2026-10-23).
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
| T1 | Clickable mock-up on palette board C (the Awsaj style: eight areas with ramps on cream, with its colour-blind simulation, and a non-colour grade badge; boards A and B as static reference images): Skills, tray, worksheet sheet, Quiz, Share, Lessons, Classes at 1366 and 390, light and dark; a live-vs-branch table of teacher files (STATUS §7) | `design/mockups/teacher-2/*.html`, `tests/scripts/ws-teacher-tokens.cjs` (palette part) | the owner approves the flows on board C (chosen 2026-10-23, Q-T6; this is the signed spec card) |
| T2 | Shell + tokens: four places, profile menu, the bottom bar below 820 px, tokens, `areaOf()` | `teacher-shell.js`, `teacher-ui.js`, `teacher-areas.js` (new), `css/teacher-brand.css`, `css/teacher.css`, `index.html` teacher markup, `tests/scripts/ws-teacher-tokens.cjs` | `ws-teacher-tokens` green; old screens reachable |
| T3 | Skills gallery + Browse by + tray + chip options + worksheet sheet + Quiz + Share | `sheet/roles/test.js` (the Quiz layer), `teacher-library.js`, `teacher-skillpick.js`, `teacher-sets.js`, `teacher-print.js`, `teacher-preview.js`, `teacher-quiz-ui.js`, `quiz-builder.js` (save path only), `quiz-storage.js`, `teacher-map-tasks.js`, `teacher-standards.js` (Browse by › Standard), `print-sheet.js` (request normalising only), `css/teacher-library.css`, `css/teacher-quiz.css` | `ws-teacher-flows` green for every Skills flow |
| T4 | Lessons: the 2026-10-17 layout restyled, opening where the teacher was last; Print lesson / Print practice / Share practice / Practise pre-skills; "Skills to be made" folded into each lesson and area | `teacher-wrm.js`, `lesson-tomake.js`, `teacher-todo.js` (its content moves onto lessons; the screen leaves the menu in T6), `css/teacher-wrm.css` | Lessons flows green |
| T5 | Classes: board, results, MAP tests, progress | `teacher-map.js`, `dashboard.js` (wrapping only), board routing | each reachable in ≤ 2 actions |
| T6 | Redirects and aliases (incl. `#todo/…` → the lesson or area), retire old entry points (the separate Skills to be made screen, `teacher-todo.js` entry), rewrite the teacher gates; independent critic at 1366 / 1280 / 820 / 390, every action clicked through to a printed PDF or a working code | as above | critic ≥ 8 on every screen; full gates; deploy |

### 2.11 Teacher-site questions — all decided 2026-10-23, see §4.3 (Q-T1 … Q-T6, Q-W2, Q-W3)

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

- **Terms:** the teacher sees the three kinds **Single skill · Sections · Mixed practice** (§2.5); the engine field is
  `arrangement: 'mixed' | 'sections' | 'per-page'` (an appended code flag; old codes decode as sections). "Grouped" is
  the engine's old name for "Sections"; `per-page` is Single skill with several skills.
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
  chosen number of pages cannot hold every skill twice, Print adds the page and the summary line says so ("needs 2 pages", Q-M2).
- **A short instruction in each cell** (already required by PT-MIX-5): skills gain `strings.cue` — 1–4 words from the
  instruction library ("Add.", "Write the time.", "Shade 2/8.") — printed beside the problem number; the sheet line is
  "Solve."; plain computation cells may omit it. Until a skill has its cue, the library instruction shortened by rule is
  used, and the lint lists every skill still on that fallback.
- **Examples on a Mixed practice page** (owner 2026-10-23: both placements are options): None, or
  - **an example the first time each skill appears on a page, beside its first problem** — a worked-example cell of the
    skill's own size class (its `workedSteps` drawn in the side-twin layout, SUPPORTS.md "Side twin"), packed right
    before that skill's first problem on each page; it counts in the capacity sum like any cell, the run rule skips it,
    and `ws-packer-proof` covers it; or
  - **examples at the top of the page** — the engine's existing mixed-practice example, one full-width compact band per
    skill (SUPPORTS.md "Compact band" and "Mixed practice"), each measured by `anchorHeightMm`. **Each page shows the
    bands of the skills on that page**, at its top; their measured
  height comes off that page before its capacity sum (rounded up to whole rows), and the check is per page. When on some
  page the bands would leave fewer rows than its skills need for two problems each (three skills with bands at L do not
  fit one page, SUPPORTS.md), the packer first spreads the skills over the pages chosen (fewer skills per page, fewer
  bands); only if that cannot work is the choice greyed with the reason ("Examples for these 3 skills need 2 pages —
  add a page or choose fewer skills"). This is not the PT-MIX "cue key strip". "An example with each problem" is not offered on
  Mixed practice pages.
- **Frame and key:** title "Mixed practice" with the skills named under it in plain words (up to four, then "and N
  more"); tab "Level a–b · Mixed n"; footer: skill names + CCSS codes; numbering by strip, then block, then inside the
  block (PT-MIX-7); no skill letters in cells; the key adds a legend by skill, listing problem numbers
  ("Add: 1, 4, 7 · Time: 2, 5 · Fractions: 3, 6").
- **PT-MIX-8 (achieved vs requested share, cells across per skill)** is replaced by the summary line, which states the
  achieved count of each skill and says when it differs from what was asked ("Time 5 of the 6 asked: its boxes are
  bigger"); the cells-across detail moves to More options › Details.
- **Screen parity:** the online worksheet and quiz use the same `interleave()` when the arrangement is Mixed practice;
  the quiz's shuffle switch maps to it.
- **When mixing is used:** Mixed practice is the default for 2+ skills, except practice printed from a lesson (Sections,
  because the lesson's skills are new); the teacher can change it in one tap. The owner agreed (Q-M1, 2026-10-23), so the
  same change edits three places that say otherwise today: PAGE_TYPES 5.2 ("Look … Default arrangement GROUPED",
  line 1440) → "Default arrangement SHUFFLED for 2+ skills, GROUPED from a lesson"; WORKSHEET_DESIGN_STANDARD DN-34 gains a
  note that a page the teacher set to Mixed practice is a deliberate mix (it is shown in the summary line), so it is not
  "silent"; `sheet/anchors.js:16` ("Mixed practice defaults to sections") → Mixed practice pages default to no examples,
  grouped pages keep sections.

### 3.4 Gates that prove it

- `ws-print-lint` mixed rules: no run of one skill longer than 2 turns (a block of small boxes is one turn); each skill's count across the whole worksheet within 1 of its weighted share, except where the summary line records why (two-of-each on a page, a skill rotated to another page, an examples band); every
  non-computation cell has a cue; no cell below its minimum size; ≥ 40 % free; vertical rules on the unit grid; no page
  under-filled while items remain; the capacity sum holds on every page; any run over 2 matches the weights fallback and
  appears in the summary line. The example cell beside a skill's first problem (Examples: the first time) is left out of
  the run and count checks and counts in the capacity sum; the lint checks there is exactly one for each skill on each
  page, right before that skill's first problem.
- `interleave()` self-test (node, deterministic), including the 1 : 3 on 12 items case (runs of 3, counts 3 and 9, the
  summary note), a 1 : 1 : 1 case (no run over 2), the facts-with-clocks case (blocks alternate, runs counted in turns),
  the L case (N = 6, a word row, 24 units: facts and clocks at Equal give 5 clocks and 1 facts block = 6 turns, cap
  ⌈5 / 2⌉ = 3, the summary note in turns)
  a Less : More case on a 4-problem page (2 and 2, the summary note), and a 3-skill case at M with "the first time" (one
  example cell right before each skill's first problem on each page, outside the runs and the shares, inside the
  capacity sum); `ws-code-snapshot` (old codes decode as sections).
- Critic case: `ws-grade-render --set` with four skills from four families at S / M / L + keys + the online worksheet and
  quiz, ≥ 8 on every criterion.

### 3.5 Phases

| Phase | Work | Files | Done when |
|---|---|---|---|
| M1 | `interleave()` + self-test (with the weights-win case); the `arrangement` field and code flag; Mixed practice for skills of the same size class inside today's packer; the Q-M1 edits to PAGE_TYPES 5.2, DN-34 and `anchors.js` | `sheet/interleave.js` (new), `print-sheet.js`, `skill-codes.js`, `sheet/anchors.js`, `design/PAGE_TYPES.md`, `WORKSHEET_DESIGN_STANDARD.md` | self-test green; `ws-code-snapshot` green; a 4-skill same-size page renders mixed with no run > 2 |
| M2 | Size classes (incl. measured legacy cells) + the 2 × 2 block packer (small boxes of different skills share blocks; runs counted in turns) + numbering + rebalanced last page + page units, the capacity sum, two-of-each and rotation across pages | `sheet/roles/mixed-practice.js`, `sheet/layout.js`, `sheet/paginate.js` | print-lint mixed rules green on the critic set at S / M / L |
| M3 | `strings.cue` (fallback rule first, then real cues family by family) + the in-cell cue + lint | `sheet/contract.js` (also: `INSTRUCTION_LIBRARY` moved to `sheet/instructions.js` (new), the preset lookup registered by `js/modules/kit-setup.js` (new), imported by `print-sheet.js`, `screen-cell.js` and the node test harness — §1.6.2), `sheet/providers/*`, `sheet/cell.js` | every skill has a cue or is listed on the fallback; lint green |
| M4 | Frame subtitle, readable footer, key legend by skill, the measured examples bands with their greyed fallback; the two new examples modes — `anchors: 'top'` (one worked example at the top of each Single skill page; one band for each skill on the page on Sections and Mixed practice) and `anchors: 'first'` (an example before the first problem of each kind in each section; on Mixed practice the example cell beside each skill's first problem, packed by M2's packer as a cell of that skill's size class); the section title printed in the band of a grouped or exam-style section (`req.sections[i].title`); the arrangement and examples choices in the worksheet sheet; the summary line (replacing PT-MIX-8) | `sheet/frame.js`, `sheet/roles/answer-key.js`, `print-sheet.js` (its measuring and key path moved into a module of its own; measuring in a frame with only `SHEET_STYLESHEETS` and `SHEET_ENGINE_CSS`, with its self-test; `buildSheet`'s record and replay modes; the year passed in the request — all for E1), `sheet/anchors.js` (`top` and `first` in `ANCHOR_MODES` and `normaliseAnchors`; compact bands on Mixed practice pages), `sheet/roles/practice.js` (the two modes and the section title on Single skill and Sections pages), `sheet/roles/mixed-practice.js` (the example cell beside the first problem); the worksheet-sheet choices themselves are added by the T3 lane in `teacher-print.js` | screens and keys match §3.3; at S / M / L with keys, `top` prints one worked example at the top of every Single skill page and one band per skill on each Sections and Mixed practice page, and `first` prints one example before the first problem of each kind in each section and, on every Mixed practice page, one example cell right before each skill's first problem; a grouped and an exam-style request print each section's title; `ws-print-lint --anchors top|first` and `--sections grouped|parts` (the `--sections` flag comes from E1, row 1; if it is not merged yet, M4 adds it with row 1's agreement) green on the critic set; old codes decode (`ws-code-snapshot`) |
| M5 | Online worksheet and quiz parity; independent critic; certify the mixed packer and Mixed practice (E2) | `worksheet.js`, `quiz-take.js` | critic ≥ 8 on every page, size and host; the packer's certificate written and `ws-packer-proof` green; Mixed practice certified for the live skills' templates |

---

## 4. How this fits the current plan

### 4.1 Order of work (`MASTER_PLAN.md` points here)

| Order | Work | Lane owns | Runs beside |
|---|---|---|---|
| 1 | **Wave 0** (§1.4 S1–S9; §1.6 E1's tools and E5. Certifying — E2 — waits until M4 is merged, then the worksheet lane certifies Single skill and Sections, owning the files §1.6.5 lists) + review of the open PRs #11 (needs a critic on its round-3 fixes f0d4a489), #13 (re-pin codes VA–VD; becomes the shape-grid / solid-kit starting point), #14 (quiz "Click ALL"; it lands in the same deploy as #13, merged right after it, because #13's new Click-ALL skills need #14's answer tiles — HANDOVER-2026-10-17) | `tests/scripts/*` until Wave 0 is merged (after that each test script belongs to the lane that changes it: 2b takes `ws-catalogue.cjs`, `ws-content-audit.cjs`, `ws-coverage-matrix.cjs`), `design/status/`, `design/cards/`, `design/lanes/` | mixed-page engine M1–M4 (different files: Wave 0 builds tools and tests, M1–M4 edit the kit; no certificate is made until M4 is merged) |
| 2 | **Mixed pages M1–M5** (the mixed packer and Mixed practice certified at M5, E2) | `print-sheet.js` (all of it until M4 is merged, including E1's move of its measuring and key path into a module of its own; then the mixed and request parts), `sheet/contract.js`, `sheet/instructions.js` (new), `kit-setup.js` (new), the one-line `kit-setup.js` import in `screen-cell.js` and the test harness, and `sheet/providers/*` (until M3 is merged, for `strings.cue` and the M3 cut), `sheet/layout.js`, `sheet/paginate.js`, `sheet/cell.js`, `sheet/frame.js`, `sheet/anchors.js`, `sheet/interleave.js` (new), `sheet/roles/mixed-practice.js`, `sheet/roles/review.js`, `sheet/roles/answer-key.js` and `sheet/roles/practice.js` (until M4 is merged; practice.js for the two examples modes and the section title), `skill-codes.js`, then `worksheet.js`, `quiz-take.js` (M5) | Wave 0 |
| 2b | **The worksheet lane** (starts when M4 is merged): certify Single skill and Sections (E2), then the provider pass (E3) family by family, largest first | `sheet/roles/independent.js`, `practice.js`, `more-practice.js`, `fact-rows.js`, `fact-probe.js`, `todays-number.js`, `answer-key.js`, `key-short.js`, `sheet/supports.js`, `sheet/support-draw.js`, `sheet/providers/*` and `sheet/instructions.js` (after M3), `tests/scripts/ws-catalogue.cjs`, `ws-content-audit.cjs`, `ws-coverage-matrix.cjs` | Teacher site, M5 |
| 3 | **Teacher site 2.0 T1–T6** (T1 needs the owner's approval of the mock-up; Q-T1–Q-T6 decided 2026-10-23) | `teacher-*.js`, `css/teacher*.css`, `index.html` teacher markup | templates (step 4) |
| 4 | **Templates by leverage** (§1.5) — **new skills start after the worksheet lane's provider pass (row 2b, E3)**: owner 2026-10-23, "every skill, every worksheet" first; the fixes below to existing skills and PR #13's shape drawings go ahead, as they land before E2 certifies; the paused lanes restart with precritic: Lane D print backlog, the fraction key (keys show 2/8 = 1/4, owner 2026-10-17; both touch `print-sheet.js`, so one after the other and after M2), Lane B answer + regroup boxes, place-value write-value, the decimals key fault (AK-4 on `add_decimal`, same fix pattern as `mult_properties`), the skip-count owner answers still to build (wide rows wrap and keep size; phone card opens at the first box), the number line 5.2 later steps (1) a time line in hours and minutes for `measurement:elapsed_*`, (2) D9 band tightness, (4)/(8) a unit-fraction line for `fraction_operations` when the teacher fixes one denominator, (9) the owner question on mixed pools losing a row, the `order_fdp` page that prints "Order from greatest to least" with no numbers (STATUS §7 item 7, conversions family) | `sheet/cells/<template>.js`, the generators | Teacher site 2.0 |
| 5 | **Later wave, if needed (owner 2026-10-23): new lessons** — the short lesson (original maker) and the V22 detailed lesson: first the lesson compiler and shapes (§1.6 E4: lessons 1–5 recompiled and passed), then lessons 6 onward from signed cards, one lane per shape; the parked branch `claude/sweet-newton-c8wrv1-wip-detailed-lessons-2` (patches in `design/lesson-planner/wip-2026-10-17/`) waits for it | `js/modules/lessons/detailed/`, `data/curriculum/detailed-lessons.json` | any lane |

At most three lanes at once until §1.6 E5 (manifests + integrator) lands; then up to six, one cloud session each
(Q-S6). Each lane owns its files; deploys use the S5 runner, which also runs the inheritance audit (E6) at every deploy and refuses to make a family live
before the owner's go on its picture sheet (§1.6.3 step 6).

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
| Today's print-screen page types (about 18) and the Look choice | the three kinds and their options (§2.5, owner 2026-10-23, decided); the roles stay in the code so old codes decode |
| Wave 5 (redo existing skills), 5.2 number line (built), 5.3 same skill with different supports | §1.5; 5.3: the same skill twice with different supports is allowed (Q-H3, decided 2026-10-23); its share-code change keeps old codes decoding |
| Wave 6 (new skills incl. MAP 6.2–6.4) | §1.5 template order |
| Wave 7 (Seesaw / Classroom trial, game modes) | unchanged, after Waves 5–6 |
| Wave 8 (lessons, owner list of 67) | moved to a later wave, if needed (owner 2026-10-23); §4.1 step 5, with the lesson compiler and lesson shapes (§1.6.5, E4) |
| Wave 8 intervention library (a lesson for every WRM small step) | the same later wave; §1.6.5 Lessons item 7 |
| Owner 2026-10-23: every live skill makes every worksheet | §1.6.5, E1–E3 (§4.1 steps 1–4) |
| Wave 9 (stretch / thinking pages) | unchanged, after Wave 8; then certified as roles (§1.6.5 item 4), cheap because E3 gives every skill its misconceptions |
| PAGE_TYPES §10 PT-CMP-1…5 (any skill on any role, every role with a key, `coverage()`) | §1.6.5 (pairs certified; `ws-coverage-matrix` over every skill × kind × size) and E3 (454 skills off default adapters) |
| ROADMAP P7 one renderer, P8/P9 families, O options, T teacher track | P7 largely live; P8/P9 → §1.5; O live (options + 114 presets); T → §2. ROADMAP §4 definition of done per family is unchanged |
| TEACHER_SCREENS: home six tiles | replaced by §2.3 (Q-T1) |
| TEACHER_SCREENS: make quiz by CCSS / EE / WRM / lesson, tags, scores | §2.4 Quiz |
| TEACHER_SCREENS: gallery by default, Big 3 / 4 / 5, saved sets, pick many | §2.3 Skills + §2.4 tray |
| LESSON_LIBRARY_PLAN §8e three papers | Practice = Print (the three kinds), Quiz = Quiz, Lesson = Lessons; certified as the paper composer and the Quiz layer (§1.6.5 Papers) |
| LESSON_LIBRARY_PLAN §8f one worked example on top of each block | kept as "An example to start each group" (`anchors: 'sections'`); "with each problem" is Q-W2 (reuses `anchors: 'side'`); the owner's new placements (2026-10-23) are `anchors: 'top'` (at the top of the page) and `anchors: 'first'` (the first time each kind appears; beside each skill's first problem on Mixed practice), built at M4 |
| PAGE_TYPES 5.2 PT-MIX (shuffled); PT-MIX-8 | §3; PT-MIX-8 → the summary line (§3.3); the default-arrangement edits under Q-M1 |
| LESSONS_LEARNED L1, L3, L6, L10 ("NEW"), L9, L11 | §1.4 S2 (+ L11 steps-beside-drawing as a print-lint rule) |
| RUBRIC | the bar stays 8 on all four criteria; near-miss re-check rule added under §1.3 safeguards; how a page counts as graded changes as the owner agreed on 2026-10-23 (Q-S4: inheritance from certified pairs, §1.6.3–§1.6.4), written in at S7 |
| PRESET_SKILLS: 9 options not made + 9 build-list options with `preset: true` | made when their template / option is built (§1.5) |
| `design/audit/runs/next-session/CARRY-BELOW-SPEC.md`, `design/audit/runs/next-session/PV-IDENTIFY-WRITE-VALUE-SPEC.md`, `design/audit/runs/wave1-B/REGROUP-BOXES-SPEC.md` | §1.5 (stack / long multiplication) and §4.1 step 4 |
| HANDOVER-2026-10-17: PRs #11, #13, #14 | §4.1 step 1 |
| STATUS §7: one deploy-gate list | §1.4 S5 |
| STATUS §7: teacher files live vs branch | §2.10 T1 |
| STATUS §7: BACKLOG items with no wave owner | §1.5 item 4 |
| STATUS §7: research logins missing | Q-H4 |
| STATUS §7: 5.3 share-code decision | Q-H3, decided 2026-10-23: allowed |
| STATUS §7: decimals AK-4 key fault | §4.1 step 4 |
| STATUS §7: Wave 2 has no recorded baseline (`ws-wrm` today: 872 steps, 359 not fully covered — 149 partial, 210 gap — 162 proposals) | §1.4 S8: the metrics file records these numbers as the WRM baseline and adds the `ws-wrm --report-only` counts at every deploy |
| STATUS §7: number line 5.2 later steps (1) time line in hours and minutes, (2) D9 band tightness, (4)/(8) unit-fraction line for `fraction_operations`, (9) owner question on mixed pools losing a row | §4.1 step 4, with the number line's own family; the (9) question goes on that family's spec card |
| STATUS §7: number line (3) the lesson packet places the line only through the roles it calls, (10) the band adds a page on Scripted Model / Guided (critic nl-r6 R6-D2) | §4.1 step 5 (lessons wave), before any lesson page offers the line |
| STATUS §7: `order_fdp` prints "Order from greatest to least" with no numbers (seen by critic nl-r3) | §4.1 step 4 / §1.5 item 4, conversions family |
| STATUS §7: an agent cannot see its own effort setting | §1.7 (which profile for which work); Q-S1 relies on the profile (`mq-opus-low` / `mq-opus-medium`), not on the agent; the orchestrator records the profile per lane (S8) and states it in each brief, as CLAUDE.md "Agents" already asks |
| STATUS: `reading_ruler_hard` doubled answer area; print-lint baseline 458/33 | §1.4 S9 |
| STATUS: skip-count lane (merged and deployed 2026-10-17); owner answers on wide rows and the phone first view still to build | §4.1 step 4 |
| STATUS: phone pass (deferred list and its owner questions: disk mat at 390, count-row arrows at 390, N11 first view) | after Teacher site 2.0 (Chromebook first, owner 2026-10-09); questions asked at the start of that pass |
| SUPPORTS, EXTENSION_PLAYBOOK, WRM_ALIGNMENT_PLAN, LESSONS_VISION | unchanged; reached through the spec cards |

### 4.3 Owner questions (asked once; each has a recommended answer)

| # | Question | Recommended |
|---|---|---|
| Q-S1 | Use the stronger, slower builder for the first skill of each new kind of drawing, and again for any copy that fails a review; keep the quicker builder for the other copies? (This changes the builder rule in CLAUDE.md.) | **Decided 2026-10-23: yes** — the stronger builder for the first skill of each new drawing and for any skill that fails a review |
| Q-S2 | When a review fails only by a whisker (every failing mark is a 7, nothing lower), re-check just the failed pages, every changed page and a fresh 1 in 5 of the rest, instead of re-grading everything? Every page must still reach 8. | **Decided 2026-10-23: yes**, the quick re-check; every page still reaches 8 |
| Q-S3 | Let each work lane keep its own progress notes (joined into one status page automatically), so lanes stop clashing when their work is merged? | **Decided 2026-10-23: yes**, notes per lane |
| Q-S4 | Once a drawing has passed review on one kind of worksheet across all its sizes and options, may new skills on that drawing and kind be checked this way: the machine checks on every page; a reviewer reading every new skill for **ease of use and teaching** — including its worked-example pages and its faded page — two pages to a sheet with the measured sizes beside them, and its screens; and 1 in 5 pages graded in full on all four points? **Spacing and the workbook look come from the drawing's approval plus the machine checks.** Any new kind of page is graded in full, a page below 8 sends that skill to a full review, and a spot-audit at every update grades more pages in full and withdraws the approval if any falls below 8. Every page is still held to 8, but this changes how CLAUDE.md says a page counts as graded. | **Decided 2026-10-23: yes** — batch reading of every new skill, 1 in 5 pages graded in full, spot-audit at every update |
| Q-S5 | (Asked when the later lesson wave starts.) Let lessons be drafted automatically from their skills — steps, examples, the mistakes table, practice and the exit slip — with the builder writing only the story, the hook and the teaching notes? Before each lesson is made you sign its **lesson card**: a short form saying which White Rose step and standards it teaches, which skills and settings each part uses, the number ranges, the edge cases and any ruling (such as "1,000 on the board only"). The five lessons already passed are rebuilt this way and compared page by page, and one more lesson is made as a test, before any new one. | Yes |
| Q-L1 | (Asked when the later lesson wave starts.) The intervention library — a short lesson for every White Rose small step: build it with our standard lesson maker, or in your Atomised Lesson V20 format? | **Decided 2026-10-23: both** — the owner: "we have two different lesson types that we will eventually build for all skills, WRM lessons, etc.: the short lesson (our original design) and the V22 atom-based lesson (longer)". Every skill, every WRM small step, and every CCSS K–6 standard (and lettered part) not already covered by those, eventually gets both a short lesson and a V22 lesson (owner: "all CCSS if not already covered will be covered by lessons as well"); coverage is checked against `data/standards/ccss-math.json`, built in the later lesson wave from the lesson compiler and shapes (§1.6.5, E4), each practice item a live skill (Q-L2) |
| Q-L2 | Must everything a lesson teaches or practises be a real skill, findable in Skills, search and the tray, not only in Lessons? | **Decided 2026-10-23: yes** ("Everything in a lesson should have a corresponding skill engine"). Planned skills show as "Skills to be made" until built; a machine check fails any lesson practice item that does not resolve to a live skill id — run on the 5 detailed lessons now and every future lesson |
| Q-S6 | Run up to six work lanes at once, each in its own cloud session, once the merge tool is in place? | **Decided 2026-10-23: up to six lanes**, plus other sessions as needed to speed things up |
| Q-S7 | Use the stronger builder also for the first build of each new engine, tool or screen — the mixed-page packer, the check that replays the worksheet maker, the merge tool, the new teacher-site shell and tray — since one fault there reaches every page? Later work on them goes back to the quicker builder. (This also changes the builder rule in CLAUDE.md.) | **Decided 2026-10-23: yes** ("use opus medium for new engines too"); later work that fails a review goes back to the stronger builder, as under Q-S1 |
| Q-Q1 | Which pages are the quality benchmark every skill must match? | **Decided 2026-10-23: the pages already passed** — the work STATUS records as passed at 8 or better (the five detailed lessons, the custom number line, the small fixes, the answer-key options), then the pages that certify each drawing on each kind; the reviewer reads every new skill beside a benchmark page of the same kind (§1.6.3) |
| Q-Q2 | Do you want to see the work before a group of skills goes live? | **Decided 2026-10-23: one picture sheet per family** (about 10 minutes); it goes live when you say go (§1.6.3 step 6) |
| Q-O1 | What is built first? | **Decided 2026-10-23: every skill, every worksheet** — the worked-example pass for the 454 skills before new skills from the build list (§4.1) |
| Q-M1 | When a worksheet has 2 or more skills, make it Mixed practice by default? Practice printed from a lesson starts as Sections, because the lesson's skills are new. | **Decided 2026-10-23: Mixed practice by default**, except practice printed from a lesson, which starts as Sections; Sections always available, made one per skill, grouped by type, or as exam-style parts (§2.5) |
| Q-M2 | If the skills you chose cannot all fit on one page at least twice each, should Print add pages (it tells you) rather than print some skills only once? | **Decided 2026-10-23: add pages**, and the summary line says so |
| Q-T1 | Replace today's home screen with: the site opens on Skills, ticked skills go to a tray with Print · Quiz · Share? | **Decided 2026-10-23: yes**, the site opens on Skills with the tray |
| Q-T2 | Make quizzes from the same tray (Quiz button) and retire the separate quiz builder? Pupils take quizzes exactly as today, and old quiz links keep working. | **Decided 2026-10-23: yes**, quizzes from the tray; the separate builder retires, old links keep working |
| Q-T3 | Keep "Skills to be made" on each lesson and maths area (folded away), and take its separate screen out of the menu? | **Decided 2026-10-23: yes**, folded in |
| Q-T4 | Show grades as plain numbered labels, so colour only ever means the maths area? | **Decided 2026-10-23: yes**, plain labels |
| Q-T5 | Share gives one link: it **opens the practice straight away** (today's "Direct link"). The other kind — a link that **puts the skills as buttons on the pupil's start screen to choose from**, which you can lock (today's "Quick Start link") — moves under More options. Agree? | **Decided 2026-10-23: yes**, one link; the Quick Start link under More options |
| Q-T6 | Colour board A (six maths-area colours) or board B (eight colours, each in four strengths)? Either way the main button is bold black. On both, areas taught in the same grade stay easy to tell apart for colour-blind teachers, and every colour also shows the area's name and icon. The cost: to stay colour-blind safe, three of the colours are light (mint, sky blue, lime) rather than deep, so their buttons show by a thin outline — you will see them on the board. | **Decided 2026-10-23: board C, the Awsaj style** (owner, after first choosing B the same day: "I like these colors style more", then confirmed: "keep color for math area BUT grade level also needs to somehow be differentiated"). Warm cream page, near-black ink, gold hero, muted earthy area colours. Colour = maths area. **Grade must also be told apart without colour**: a distinct grade marker (a numbered grade badge with its own shape and position, and grade grouping/filters), never a second colour code. The §2.7 rules and gates stay, contrast measured against cream; boards A and B kept as reference images |
| Q-W1 | No lettered A–J pages; "How many pages?" for section, single-skill and mixed pages; **three kinds of worksheet only — Single skill, Sections, Mixed practice — each with its options; no other page types and no "I Can / Daily" look choice** | **Decided by the owner, 2026-10-23** |
| Q-W2 | Offer "An example with each problem" again? It was dropped on 2026-09-26 because it made pages with only one problem. | **Decided 2026-10-23: yes, widened** — an example at the top of the page, the first time each kind of problem appears in a section or on a page, to start each group, or with each problem where it fits (§2.5) |
| Q-W3 | For quizzes, "How many versions? 1–6" — each version with its own order and answer key, no letters? | **Decided 2026-10-23: yes**, 1–6 versions, no letters |
| Q-W4 | You said the thinking pages (find the mistake, true or false, reason it, stretch) wait until after the lessons. Lessons are now in a later wave: should the thinking pages still wait for that wave, or join the worksheet types now? | **Decided 2026-10-23: still wait** for the lesson wave |
| Q-H2 | Use the shape drawings already made (pull request #13) as the start of the shape pages, rather than building them again? | **Decided 2026-10-23: yes**, reuse pull request #13 |
| Q-H3 | Allow the same skill twice in one set with different supports (for example once with the number line and once without)? Old codes keep working. | **Decided 2026-10-23: yes**, allowed; old codes keep working |
| Q-H4 | For research on MathWorksheets4Kids and IXL: add the logins to the cloud workspace's private settings, or research from their public pages once per kind of drawing? | **Decided 2026-10-23: add the logins** — the owner adds them to the cloud environment's settings (Network secrets, or environment variables `MW4K_USER`, `MW4K_PASS`, `IXL_USER`, `IXL_PASS`); read-only research |

### 4.4 Will this make the work faster? (owner question, 2026-10-23)

Yes. It should make the work several times faster once the new tools are in place, at the same bar of 8. It will be
**slower at first**, because Wave 0, E1 and the mixed-page engine (M1–M4) have to be built before the speed-up starts.
Where the time goes today, and what changes:

| Where the time goes today (§1.1) | What changes | Expected effect |
|---|---|---|
| Review rounds: median ≈ 5 a lane, 1–2 hours each, mostly spent finding faults a machine could measure (a reading of the reports; S8 counts it) | the machine checks run first (S1–S2), every new fault class becomes a check (S8), the quick re-check after a near miss (Q-S2) | median rounds to PASS fall from 5 to 2 (the target in §1.4) |
| The cheap first build of new, hard work cost 2–5 extra rounds (14 escalations) | Opus medium for every first drawing and engine, and for any rebuild after a failed review (Q-S1, Q-S7) | most of those extra rounds are not spent; a medium-effort run is slower than a low one, but far cheaper than a round |
| Every skill and every page graded one by one | each drawing is approved once on each kind of worksheet; the skills on it are made as data (the 114 presets took two builder runs this way) and read as a batch, 1 in 5 pages graded in full (Q-S4) | the review work grows with the number of drawings, not the number of skills: about a family per builder run |
| Three lanes at once, clashing on shared files (152 merge commits, 10 conflict fixes) | lane manifests and notes per lane (Q-S3, E5); up to six lanes plus other sessions (Q-S6) | twice the lanes; the merge tool aims at no merge clashes (E5's done-when: a week of six lanes with none) |
| Deploy checks run one after another: ≈ 80 minutes; each builder reads ≈ 740 KB of rules (≈ 185 k tokens) | three deploy sessions in parallel (S5), only the rows a change reaches (§1.6.2); spec cards for builders | ≤ 30 minutes, with every check still run; builders read a signed spec card of ≈ 10 k tokens (S3), while critics keep the full rules |

Together these aim at **five times today's pace or more** on the skill backlog (§1.6.7, "Expected effect"). From then on
the limits are reviewer time and your sign-off time (spec cards, one picture sheet per family), not building time.

**What keeps it from being instant.** The first certificate comes only after M4 is merged. Each drawing still needs one
full review on each kind of worksheet. A change to shared engine code voids that drawing's approvals and sends its
pages back for review (that is the safeguard, §1.6.4). Until M4 the deploy has no fast path for changed pages, so it
runs the full ≈ 4-hour check; after M4 a change to an engine module or a render file still waits for that run. The
stronger builder also takes longer per run than the quicker one; the plan spends that time to save review rounds.

**How we will know** (S8). The metrics file records, for every lane: rounds to PASS, hours, findings by class, skills
passed per lane-week and the builder profile used, measured against today's numbers in §1.1 and the rate before Wave 0.
They are reviewed after every drawing. The first real test is the first family made as data on an approved drawing
(E3). If it takes **more than 2 review rounds** (the §1.4 target) or **more than one builder run** for the family, the
next audit says why, and the plan changes before the next family. The pace claim is checked the same way: skills
passed per lane-week against the rate before Wave 0.

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
- **Engine / instance** — an engine is shared code that draws many products (a cell template on a kind of worksheet, a composer, a paper, a
  lesson shape); an instance is one product made on it (a skill, a role for a skill, a worksheet, a lesson).
- **Envelope / certificate** — everything an engine is approved for (sizes, looks, option values, roles, ranges,
  screens) and the record of that approval (`design/audit/certified/<template>--<kind>.json`).
- **All-pairs sample** — a set of test pages in which every pair of option values appears at least once.
- **Certified pair** — one cell template on one kind of worksheet, approved across its envelope; the unit of inheritance.
- **Structural fingerprint / content hash** — a hash of the engine's code plus the page's geometry class (decides
  inheritance and voiding) / a hash of the rendered cells (only shows which pages changed).
- **Voiding** — a code change that alters a structural fingerprint cancels every certificate built on it.
- **Batch reading** — the critic reads every new instance's pages (two to a sheet, measured numbers beside them) and
  screens for ease of use and teaching value, instead of grading each page alone.
- **Provider / default adapter** — the data a skill gives the sheet kit (worked steps, wrong answers, instructions,
  misconceptions) / the fallback the kit uses when a skill has none yet.
- **Lesson card** — the short form the owner signs before a lesson is made (step, standards, skills and settings per
  part, ranges, edge cases, rulings).
- **Lesson shape / lesson compiler** — a pattern shared by several lessons, and the code that drafts a lesson's
  description from its card and its skills.
