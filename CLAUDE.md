# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MathQuest ("Maths Quest Pro") is a modular math practice web application targeting K-6 students. The app is split into 70 files: 1 HTML + 12 CSS + 57 JS (56 ES modules + 1 barrel module). The original monolithic `math-quest-unified.html` (~37,000 lines) is preserved as a backup.

## Running the App

Serve the project directory over HTTP and open `index.html`. ES modules require HTTP — `file://` will not work.

```bash
npx serve .
```

No build tools, bundler, or dependencies to install. External resources (fonts, CDN libraries) are loaded via `<link>` and CSP meta tags in the `<head>`. Deployed as static files on GitHub Pages (custom domain `math.cultivatingthedigital.org` via the `CNAME` file at the repo root).

## The worksheet design contract — READ THIS BEFORE ANY SKILL OR PRINT WORK

The owner teaches ELL and special-education maths. Every skill must look and teach like his sample
workbooks, **in print and in online practice**: black and white question content, Andika, big
digits, generous spacing, one problem per boxed cell. These documents are the contract, and they
outrank any general design advice or skill:

| Document | What it governs |
|---|---|
| `WORKSHEET_DESIGN_STANDARD.md` | The visual contract: tokens, the two looks, type sizes, stroke widths, the single grey, cell geometry, answer-slot shapes, per-representation drawing rules |
| `PEDAGOGY_STANDARD.md` | How a skill teaches: one new thing per step, scaffold fade, edge cases, the instruction-string library, review cadence |
| `design/PAGE_TYPES.md` | Every page role, its anatomy and geometry, and the whole print-dialog option model |
| `design/PROBLEM_TYPES.md` | The problem catalogue and the print ↔ screen response modes |
| `design/SKILL_CELL_CONTRACT.md` | What a skill supplies so it can appear on any page type |
| `design/EXTENSION_PLAYBOOK.md` | How to extend the look to domains the samples do not cover |
| `design/SKILL_CATALOGUE.md` | Generated: what every skill supplies today, its host layout and page tags |
| `design/catalogue/<family>.md` | The per-family audit: verdict and defect list for every skill |

**Governing rules that are easy to get wrong:**
- **Any skill can appear on any page type** — lesson, model, guided, independent, more practice,
  daily/mixed review, review, test, error analysis, reasoning, stretch — and **every page of every
  skill prints an answer key**. Fact and operations skills *additionally* get the 5–10 column fact
  layouts.
- **Options live on the skill, not the page.** A skill declares its own option schema in
  `js/modules/skill-options.js`; the chosen values travel with it into every role. A ladder step is
  a skill plus option values, not a new skill id.
- **"Within N" bounds the answer**, never the operands.
- **Never splice a skill out of `SKILLS[category]`.** Four share-code systems index by position.
  Retire with a tombstone plus an alias in `js/modules/skill-aliases.js`.
- **CSS changes must be additive.** Saved quizzes store old question HTML in IndexedDB.
- **8 or better, everywhere.** A redone skill is done only when it scores ≥ 8 on all four criteria
  of `design/audit/RUBRIC.md` on every page type and every screen host, graded by an independent critic.
- Use `generateQuestionFor({category, skill, range, decimals, opts, seed})` for any generation
  outside live play. It carries the skill's options, restores state in `finally`, and its seed makes
  a page reproducible.

**Checks to run:**

```bash
node tests/scripts/ws-boot-smoke.cjs        # app boots, no console errors
node tests/scripts/ws-code-snapshot.mjs     # share codes still decode — 591 codes / 35 categories today
node tests/scripts/ws-catalogue.cjs         # regenerate design/SKILL_CATALOGUE.md
node tests/scripts/ws-content-audit.cjs     # GATE: do + - x / skills match their own names?
```

The code count is live: appending a skill id raises it and is safe. A count that **falls**, or any
"changed" / "MOVED" / "DELETED" line, is the failure (the pinned baseline is the gate, not the number).

`ws-content-audit` is a **gate, not a report**: it exits non-zero when a skill contradicts its own
name, and prints `ws-content-audit: OK` / `FAIL` in the same convention as `ws-boot-smoke`. It
takes `--category` / `--skill` for a focused run, `--report-only` to suppress the exit code, and
`--self-test` to check its own name-reading regexes without a browser. Sampling is deterministic
(`generateQuestionFor` with a seed derived from `category:skill` plus the item index), so item 7 of
a skill is the same item in a full sweep, in a `--skill` run and at any `--n` — two runs of the same
tree produce byte-identical output, which is what lets its thresholds be zero-tolerance without
flapping.

**A skill's NAME is its declaration.** The audit holds every skill to its own id and label: "Subtract
within 100" may not deal additions, and "within N" bounds the ANSWER (sum, minuend, product,
dividend), never the operands. A `mixed_*` pool declares the union of the operations its pool can
produce, computed from the pool so it cannot rot — but an operation no pool member can produce
still fails. If a skill legitimately does something its name does not cover, **fix the name**, do not
add an exemption.

## Researching Skills Before Implementation

**The design contract above outranks every reference site.** Research tells you *what to teach and
in what order*; it never decides *how the page looks or how the skill is scaffolded*. Those come
from `WORKSHEET_DESIGN_STANDARD.md` and `PEDAGOGY_STANDARD.md`, which were built from the owner's
own special-education sample workbooks for pupils with learning difficulties. A mainstream site's
layout is designed for a different pupil: it will be denser, smaller, more colourful and less
scaffolded than ours must be. Where research and the standards disagree, **the standards win, and
you note the difference rather than following the site.**

So every skill has to satisfy both:
1. **Correct and complete content** — the problem types, progression and edge cases real platforms
   teach (research below).
2. **Our design and pedagogy** — black and white, Andika, big digits, one boxed cell per problem,
   one new thing per step, structural scaffolds that persist while hint scaffolds fade, low writing
   load, and every skill working on every page type with an answer key.

Never copy wording, stories, titles or artwork from a reference site or from the sample workbooks.
Copy the *grammar*, write our own content.

**MANDATORY**: Before creating or updating ANY skill, research how similar skills are implemented on real educational platforms — both on paper (worksheets) and digitally (interactive). Use these reference sites:

**Primary reference (worksheet/print modeling):**
- **MathWorksheets4Kids** (mathworksheets4kids.com) — **PRIMARY** reference for problem types, visuals and answer formats. Log in and search the skill. Take the *content model* from it; take the layout from our design standard, not from the site.

**Secondary reference (online/interactive modeling):**
- **IXL** (ixl.com) — **SECONDARY** reference for interactive online implementation. Log in, search the skill, and study their problem types, answer input methods and difficulty progressions. Their difficulty ramp is steeper and their items denser than ours; use the sequence, not the pacing.

**Additional references:**
- **K5 Learning** (k5learning.com) — Grade-appropriate worksheets with visual models
- **Math-Drills** (math-drills.com) — Clean worksheet designs, good range of difficulty
- **Math-Aids** (math-aids.com) — Professionally formatted worksheets with worked examples
- **TeacherPayTeachers** (teacherspayteachers.com) — Teacher-created resources showing real classroom approaches
- **Boom Learning** (boomlearning.com) — Interactive digital task cards with visual engagement

**What to research:**
1. What problem TYPES exist for this skill? (e.g., identify, compare, place, sort, match, fill-in)
2. What VISUALS are commonly used? (number lines, arrays, area models, bar diagrams, etc.)
3. What ANSWER FORMATS work best? (multiple choice, text input, click-to-select, drag-and-drop)
4. What DIFFICULTY PROGRESSION is standard? (concrete → pictorial → abstract)
5. What EDGE CASES exist? (e.g., teen numbers shouldn't include 11/12, fractions > 1 need improper/mixed)

**Then convert it to our approach before you build.** For each skill, answer these too:
6. **Which ONE thing changes** from the step before? If the research bundles several changes into
   one level, split it into separate steps (`PEDAGOGY_STANDARD.md` P-1).
7. **Which scaffolds are structural and which are hints?** Structural ones (digit grids, regroup
   boxes, frames) stay at every level; hint ones (traces, dot cues, captions, pictures) fade.
8. **What is the written response?** Prefer a number, a sign, a check box or a label from a bank.
   A production item on paper is never turned into multiple choice on screen.
9. **What does the pupil say?** Every model ends with an oral frame — the `Say:` band.
10. **What is the misconception?** Name the 2–4 real errors, because error analysis, True or False?
    and Reason It pages are built from them.
11. **Does it fit our page?** Check the item against the density and capacity tables in
    `WORKSHEET_DESIGN_STANDARD.md`. Reference sites fit 30–50 items on a page; we fit 6.

**Login credentials for premium sites are stored in the private memory file** (not in this repo). Check `~/.claude/projects/*/memory/credentials.md` for access. The owner has authorised using them for research on MathWorksheets4Kids and IXL, read-only; never download site material into the repo.

## File Structure

```
MathQuest/
├── index.html                          (HTML markup, ~1000 lines)
├── css/
│   ├── variables.css                   (CSS custom properties, dark mode)
│   ├── base.css                        (resets, global styles, animations)
│   ├── role-toggle.css                 (student/teacher toggle, quick skills grid)
│   ├── settings-panel.css              (slide-out settings)
│   ├── compact-number.css              (number selection grid)
│   ├── favorite-skills.css             (favorite skill cards)
│   ├── ui-components.css               (buttons, cards, modals, game modes)
│   ├── skill-progress.css              (progress bar)
│   ├── word-problem-visuals.css        (word problem SVG styles)
│   ├── print-worksheet.css             (print & @media print rules)
│   ├── skills-organizer.css            (skills navigator 3-panel layout)
│   └── quiz-mode.css                   (quiz builder, quiz taking, quiz results)
├── js/
│   ├── globals.js                      (barrel: imports all, attaches to window, runs bootstrap)
│   └── modules/
│       ├── state.js                    (shared mutable state object)
│       ├── data.js                     (DOMAINS, SKILLS, SKILL_CODES, DEFAULT_TABLES)
│       ├── utils.js                    (randInt, shuffle, pick, normalizeText)
│       ├── storage.js                  (localStorage/cookie persistence)
│       ├── gamification.js             (XP, levels, badges, streaks, spaced repetition, stats banner)
│       ├── progress.js                 (skill progress tracking, adaptive difficulty)
│       ├── dashboard.js                (progress dashboard, streaks, badges, session history)
│       ├── svg-geometry.js             (angle, rectangle, triangle, shape, 3D box SVGs)
│       ├── svg-fractions.js            (fraction HTML, circle/bar SVGs, comparisons)
│       ├── svg-clock.js                (analog/digital clocks, time math, magnification)
│       ├── svg-base10.js               (base-10 blocks, counting dots, number lines)
│       ├── svg-factors.js              (factor pairs, factor link diagrams)
│       ├── ui-core.js                  (updateUI, toggleTheme, showToast, confetti)
│       ├── user-role.js                (student/teacher role toggle)
│       ├── navigation.js               (showView, goHome, exitGame)
│       ├── settings-panel.js           (settings panel open/close, TTS toggle)
│       ├── number-selection.js         (multiplication tables, divisor grid)
│       ├── category-dropdowns.js       (domain/category/skill dropdowns, breadcrumb)
│       ├── skill-search.js             (skill index building, search filtering)
│       ├── unified-skills.js           (UnifiedSkills manager, skillQueue, legacy accessors)
│       ├── skill-codes.js              (skill code generation/parsing, settings codes, sharing)
│       ├── quick-skills.js             (quick skill cards, student quick start)
│       ├── favorites.js                (favorite skills CRUD)
│       ├── mode-selection.js           (game mode card selection)
│       ├── game-control.js             (startGame, timer, nextQuestion)
│       ├── generate-question.js        (question dispatcher, ~500 lines, routes to gen-* modules)
│       ├── gen-operations.js           (add, subtract, multiply, divide, integers)
│       ├── gen-fractions.js            (fractions, decimals, conversions)
│       ├── gen-geometry.js             (area/perimeter, angles, shapes, coordinates)
│       ├── gen-measurement.js          (measurement, unit conversions)
│       ├── gen-data-stats.js           (graphs, data analysis, probability)
│       ├── gen-algebraic.js            (patterns, algebra, order of ops, place value, rounding)
│       ├── gen-counting.js             (K-2 counting, comparing, composing)
│       ├── gen-number-theory.js        (primes, factors, GCD, LCM)
│       ├── question-render.js          (renderQuestion, interactive ordering/expanded/placement)
│       ├── answer-check.js             (submitAnswer, checkAnswer, fraction/time equivalence)
│       ├── solution-display.js         (solution popup, step-by-step generation)
│       ├── tchart-factor.js            (T-chart drag-and-drop for factor pairs)
│       ├── divisibility-sort.js        (divisibility sorting interactive)
│       ├── hints-speech.js             (hints, TTS speak/stop)
│       ├── boss-race.js                (boss battle & car race game modes)
│       ├── worksheet.js                (worksheet mode, checking, scoring)
│       ├── game-flow.js                (modals, end game, save session)
│       ├── mixed-mode-settings.js      (mixed mode checkbox UI, code gen)
│       ├── mixed-mode-play.js          (mixed mode play flow, student choice)
│       ├── mixed-skill-search.js       (mixed skills dropdown/search UI)
│       ├── skills-organizer.js         (skills navigator: grid, filters, preview, queue)
│       ├── quiz-storage.js             (IndexedDB persistence for quizzes)
│       ├── quiz-builder.js             (quiz creation: 3-panel skill/preview/questions)
│       ├── quiz-take.js                (quiz taking: navigation, flagging, submission)
│       ├── quiz-results.js             (quiz results: scoring, review, export)
│       ├── print-settings.js           (print dialog, simple print)
│       ├── print-global-skills.js      (add skills modal, global skills list)
│       ├── print-weighted.js           (weighted distribution, print search)
│       ├── print-generate.js           (LEGACY problem formatting, worksheet HTML, PDF)
│       ├── print-sheet.js              (buildSheet(req): the app bridge to the sheet kit)
│       ├── screen-cell.js              (the on-screen B&W question cell, same drawing as print)
│       ├── sheet/                      (the sheet kit: tokens, cell, frame, layout, cells/, roles/)
│       └── init.js                     (init function, URL params, DOMContentLoaded)
└── math-quest-unified.html             (original monolithic backup)
```

## Architecture

### Module System

Browser-native ES modules with `.js` extensions in all import paths. No bundler.

- **`globals.js`** is the single entry point (`<script type="module" src="js/globals.js">`). It imports all 56 modules and attaches ~200 functions to `window` via `Object.assign(window, {...})` to support 200+ inline HTML event handlers (`onclick`, `onchange`, etc.).
- **Dark mode** uses an inline non-module `<script>` that runs immediately before the deferred module to prevent flash.
- **`bootstrap()`** is called at the end of globals.js, which sets up modal listeners and calls `init()`.

### Dependency Hierarchy (no circular dependencies)

```
Layer 0 (no deps):     state.js, utils.js, data.js
Layer 1 (Layer 0):     storage.js, svg-*.js (5 files)
Layer 2 (Layers 0-1):  gamification.js, progress.js, ui-core.js, user-role.js,
                        navigation.js, settings-panel.js, favorites.js,
                        number-selection.js, category-dropdowns.js, skill-search.js
Layer 3 (Layers 0-2):  unified-skills.js, skill-codes.js, quick-skills.js,
                        mode-selection.js, skills-organizer.js
Layer 4 (Layers 0-3):  generate-question.js, gen-*.js (8 files), game-control.js,
                        question-render.js, answer-check.js, solution-display.js,
                        hints-speech.js, tchart-factor.js, divisibility-sort.js,
                        boss-race.js
Layer 5 (Layers 0-4):  worksheet.js, game-flow.js, dashboard.js,
                        mixed-mode-*.js (3 files)
Layer 6 (Layers 0-5):  print-*.js (4 files), quiz-*.js (4 files)
Layer 7 (all):         init.js, globals.js
```

### Question Generation — Dispatcher Pattern

`generateQuestion()` in `generate-question.js` is the **dispatcher** (~500 lines). It maps skills to categories via `categoryMapping` and `skillCategoryOverride`, then routes to one of 8 domain-specific generator modules:

| Generator Module | Handler Function | Domains |
|---|---|---|
| `gen-operations.js` | `generateOperationsQuestion` | addition, subtraction, multiplication, division, integers |
| `gen-fractions.js` | `generateFractionsQuestion` | fractions, fraction_operations, decimals, conversions |
| `gen-geometry.js` | `generateGeometryQuestion` | area/perimeter, angles, shapes, coordinates |
| `gen-measurement.js` | `generateMeasurementQuestion` | measurement, unit conversions |
| `gen-data-stats.js` | `generateDataStatsQuestion` | graphs, data analysis, probability |
| `gen-algebraic.js` | `generatePatternsQuestion`, `generatePlaceValueQuestion`, etc. | patterns, algebra, order of operations, place value, rounding |
| `gen-counting.js` | `generateCountingQuestion` | K-2 counting, comparing, composing |
| `gen-number-theory.js` | `generateNumberTheoryQuestion` | primes, factors, GCD, LCM |

**`skillCategoryOverride`**: Some skills live in one UI category but their generation code is in a different generator. This object overrides the routing (e.g., `'fraction_number_line': 'fractions'` routes a composing-category skill to the fractions generator).

Each question returns: `{ text, ans, hint, options, answerType, visual, skillLabel, printFormat }`.

### Answer Types

- `number` — numeric input
- `multiple-choice` — button options
- `text` — free text (fraction, word, etc.)
- `dual` — two inputs (e.g., perimeter + area)
- `dual-fraction` — mixed + improper fraction inputs
- `interactive` with `interactiveType: "ordering"` — click-to-order numbers
- `interactive` with `interactiveType: "expanded"` — expanded form inputs
- `area-model` — grid-based multiplication inputs
- `number-family` / `fact-family` — related fact inputs
- `tchart-drag` — T-chart drag-and-drop for factors
- `divisibility-sort` — drag numbers into divisible/not-divisible boxes
- `coordinate-multi` — multiple coordinate inputs
- `clock-choice` — clock selection with magnification
- `number-line-place` — click tick marks on number line to place fractions
- `odd-even-select` — click to select odd/even numbers from a set

### Shared State

- **`state.js`** exports a single mutable object. All modules import the same reference — mutations are visible everywhere.
- **Shared mutable arrays** (`skillQueue`, `customQuickSkills`, `globalSkillsList`, `weightedItems`, `mixedSkillsList`) live on `window` and are accessed as `window.variableName` across all modules.

### View System

Views are `<div class="view">` elements toggled via `showView(id)`:
- **`homeView`** — Main menu with skill selection, settings, quick skills grid
- **`gameView`** — Active gameplay (practice, boss battle, car race modes)
- **`worksheetView`** — Generated worksheet with interactive answer checking
- **`dashboardView`** — Session history, streak calendar, badges (teacher-only)
- **`skillsOrganizerView`** — Skills Navigator: browse, filter, queue, preview skills
- **`quizBuilderView`** — Quiz Builder: create quizzes with skill-based questions
- **`quizTakeView`** — Quiz Taking: navigate, answer, flag, submit
- **`quizResultsView`** — Quiz Results: score, review, export

### Three-Tier Skill Hierarchy: Domains → Categories → Skills

The `DOMAINS` object in `data.js` defines 6 math domains:
- **Number & Operations**: addition, subtraction, multiplication, division, integers
- **Counting & Cardinality**: counting, comparing, composing (K-2 skills)
- **Fractions, Decimals & Percents**: fractions, fraction operations, decimals, conversions
- **Geometry & Measurement**: area/perimeter, angles, shapes, coordinates, measurement
- **Data & Statistics**: graphs, data analysis, probability
- **Algebraic Thinking**: patterns, algebra, order of operations, place value, number sense, number theory

### Game Modes

Set via `state.gameMode`:
- **`practice`** — Standard question/answer with XP
- **`boss`** — Boss Battle with hero/monster position tracking
- **`race`** — Car Race against CPU opponent
- **`worksheet`** — Batch of questions rendered as an interactive worksheet

### Gamification System (`gamification.js`)

- **15 XP Levels** with titles ("Math Starter" → "Grand Master")
- **`awardXP(amount, reason)`** — central XP function with toasts
- **Streak bonuses** at 3, 5, 10, and every 5 after
- **Surprise bonuses** every 3-7 correct answers
- **Time milestones** with break suggestions
- **Spaced repetition** (Leitner boxes) with Smart Review
- **15 badges** with celebration modals
- **Game Stats Banner** — daily effort/timer/score/streak/mood at top of game view
- **On-task timer** — per-question timer with "off task" nudge

### Quiz System (4 modules)

- **`quiz-storage.js`** — IndexedDB for tests/results, URL compression for sharing
- **`quiz-builder.js`** — 3-panel layout (skill grid → preview → question list). Duplicate/regen/remove per question. Points per question.
- **`quiz-take.js`** — Question navigation, flagging, timed quizzes, submit + review
- **`quiz-results.js`** — Scoring, per-question review, CSV export, print

### Skills Navigator (`skills-organizer.js`)

3-panel layout: domain/grade filters → skill grid with hover preview → queue panel. Preview appears after 1.5s hover, stays while mouse is on card or preview panel. Skills can be queued for play, print, or share.

### Persistence

- **Cookies** (`setCookie`/`getCookie` in `storage.js`): Settings, favorites, user role, mixed mode settings, daily stats
- **localStorage**: Skill progress tracking (`mathquest_skill_progress`), session history, streak data
- **IndexedDB**: Quiz tests and results (`quiz-storage.js`)
- **URL parameters**: `?code=` or `?c=` for shared skill code links, `?quiz=` for shared quizzes

### Role System (Student/Teacher)

`toggleUserRole()` in `user-role.js` switches between student and teacher modes. Student mode simplifies the UI (hides advanced settings, shows quick skills grid). Teacher mode exposes all configuration dropdowns, dashboard, quiz builder, skills navigator, and print/worksheet generation.

### Skill Code System

A compact encoding system in `skill-codes.js` lets teachers generate shareable codes representing weighted skill selections with optional settings (timer, count, range, decimals, mode). Enhanced format: `AB3-CD5-EF|T300-N20-Gp-R100-D0`. Codes can be shared via URL parameters.

### Worksheet/Print System — the sheet kit

**New print work targets the sheet kit, never the legacy path.** One drawing is used on paper and
on screen (`design/SKILL_CELL_CONTRACT.md` is the API; `design/PAGE_TYPES.md` the page anatomy;
`design/ROADMAP.md` P7 the plan).

- **`js/modules/sheet/*`** — the kit. Pure ES modules (SCC-01: no `window`, no DOM, no state, no
  `Math.random`); import only through `sheet/index.js`. Tokens (sizes S/M/L, looks, ink, the single
  grey), `cell.js` (the boxed cell, labels, slots via `blank()`), `frame.js` (header, strand tab,
  "I Can" title, footer), `layout.js` + `paginate.js` (columns, no split cell, rebalanced last page),
  the template registry (`registerCell`, `hasCell`, `coverage`), `contract.js` (the per-skill
  provider, `registerSkill`, and the instruction library), `cells/*.js` (templates: `stack`, `fact`,
  `equation`; `legacy` wraps a skill's old print HTML until it migrates) and `roles/*.js` (page-role
  composers: `plan()` returns a PagePlan, and the pupil page and its facsimile key both render from
  that one plan).
- **`js/modules/print-sheet.js` → `buildSheet(req)`** — the app bridge. It generates every item
  through `generateQuestionFor` (seeded, the skill's options honoured), measures cells the kit
  cannot size, hands them to the role, and returns `{pupilHtml, keyHtml, pageCount, keyPageCount,
  fits, ...}`. `req` = `{role: 'independent'|'more-practice', sections: [{skills: [{categoryId,
  skillId, opts}], count, pages, columns}], size, look, paper, header, seed, key}`;
  `sheetDocument(html, title)` wraps it as a printable A4 document. The teacher print screen
  (`teacher-print.js`) calls it; other roles land beside `sheet/roles/independent.js`.
- **Screen parity** — `screen-cell.js` draws the practice card, online worksheet and quiz question
  in the same black-and-white Andika cell, with game chrome outside it.
- **Migrating a skill** follows `SKILL_CELL_CONTRACT.md` §10.1: the generator emits `q.cell`
  (`{template, payload}`) instead of baking HTML into `q.visual`; register or extend the template;
  register the provider (`strings`, `workedSteps`, `wrongAnswer`, `footprint`, options); then delete
  the family's legacy branches. A template never picks its own font size, line weight or colour — it
  reads `ctx.metrics`, and content never shrinks to fit.
- **The quality bar** is `design/audit/RUBRIC.md`: every redone skill must score **8 or more on all
  four criteria, on every page type and every screen host** (practice card, online worksheet, quiz).
  One 7 anywhere is a fail. `ws-print-lint --source kit` and `ws-grade-render` produce what the
  independent critic grades.

#### Legacy print path (do not extend)

`generateWorksheetFromSkills()` (`print-settings.js`) and `formatProblemForPrint()`
(`print-generate.js`, with `print-global-skills.js` / `print-weighted.js`) are the **legacy**
renderer. Its per-skill `problem.printFormat ===` handlers, `SKILL_PRINT_SIZE` /
`PRINT_FORMAT_SIZE` size categories (`compact`/`standard`/`medium`/`wide`/`spacious` in `data.js`),
`printVisualWrap()` titles, `min-width:80px` underline blanks, the "Show Skill Labels"
toggle, and the `worksheet.js` card classes (`card-simple` … `card-number-family`,
`newVisualSkillFormats` / `wideVisualFormats`) still drive skills that have not migrated. Keep them
working — a new skill still needs a `SKILL_PRINT_SIZE` entry so the legacy path does not break —
but do not add new handlers, card classes or KaTeX/MathJax renderings there; add a kit template
instead. The legacy path is deleted family by family (contract §10.1 step 8).

### SVG Visual Helpers

Extensive SVG generation functions across 5 modules:
- Geometry (`svg-geometry.js`): `createAngleSVG`, `createRectangleSVG`, `createTriangleSVG`, `create3DBoxSVG`, `createLShapeSVG`, etc.
- Fractions (`svg-fractions.js`): `fracCircleSVG`, `fracBarHTML`, `fracWithVisual`
- Clocks (`svg-clock.js`): `createAnalogClockSVG`, `createDigitalClockHTML` with magnification support
- Number representations (`svg-base10.js`): `createBase10Blocks`, `createCountingDots`, `createDotArray`, `createNumberLine`
- Factors (`svg-factors.js`): `getFactorPairs`, `createFactorLinksSVG`

## Key Patterns When Editing

- **Inline handlers use `window`**: 200+ `onclick`/`onchange` handlers in HTML reference functions via `window` (set by globals.js). New functions called from HTML must be added to the `Object.assign(window, {...})` block in `globals.js` AND to the import statement at the top.
- **Shared arrays use `window.`**: `window.skillQueue`, `window.customQuickSkills`, `window.globalSkillsList`, `window.weightedItems`, `window.mixedSkillsList` — always use the `window.` prefix.
- **Cross-module function calls**: Work via `window` since globals.js attaches everything before `bootstrap()` runs.
- **Skill routing**: Skills in the `composing` category (counting domain) may need `skillCategoryOverride` entries if their generation code lives in a different generator (e.g., `'odd_even': 'patterns'`, `'fraction_number_line': 'fractions'`).
- CSS uses custom properties (`--bg-world`, `--accent-cyan`, etc.) for theming; dark mode toggles `.dark` class on `<html>`.
- New skills must be added in: `data.js` (DOMAINS + SKILLS), the appropriate `gen-*.js` file, and if using a new answer type, in `question-render.js` and `answer-check.js`.
- **New skills MUST be classified by grade level**: Research CCSS alignment and assign a `grade` property (K, 1, 2, 3, 4, 5, or 6). Multi-grade skills use `"M"`. See `GRADE_COLORS` in `data.js`.
- **New skills SHOULD have multiple problem types**: Study IXL and worksheet sites to identify 3-5 distinct problem types per skill, weighted by difficulty. Use visual SVG aids and interactive answer types where appropriate.
- **Syntax checking**: Always use `node --input-type=module --check < file.js` (NOT just `node --check`) for ES module files. One syntax error in any module crashes the entire module tree.
- The `startGame()` → `playSelectedSkills()` → `startGame()` double-call pattern means state set before the first call gets clobbered. To bypass: set `state.isMixedMode = true` and build full `mixedModeSettings` before calling `startGame()`.

### Max Number Range & Decimal Settings

- **`state.range`** (Max Number setting): Values: 10, 20, 50, 100, 500, 1000, 10000. Default: 100.
- **`state.decimalPlaces`** (Decimal Places setting): Values: 0, 1, 2, 3. Default: 0.
- **New skills MUST use these settings** unless the skill has a fixed domain (time, angles, coordinates).
- Scaling patterns: `Math.max(minVal, Math.min(range, maxCap))` for mental math, `Math.sqrt(range)` for geometry dimensions, `Math.pow(range, 1/3)` for volume dimensions.

## Known Bugs (Pre-existing)

- `updateDailyGoalProgress` and `updateMixedCount` are called but never defined — no-op stubs exist in globals.js
- `selectClockOption` was missing from original code — implemented in svg-clock.js

## Testing & Quality
- Test all changes thoroughly before reporting completion
- Check for errors, bugs, and omissions
- Verify the app runs successfully with no console errors
- Test edge cases and user interactions
- If a test fails, debug and fix it — do not stop until it passes
- Only report "complete" when everything is verified working
- If something breaks during a fix, identify and resolve all regressions
- Always run `node --input-type=module --check < file.js` on every modified JS file

## Workflow
- If something breaks, fix it without asking
- Do not skip steps or leave TODOs
- Never say "done" unless you have confirmed it works end to end
- When creating or updating skills, ALWAYS research reference sites first (see "Researching Skills" section above)
