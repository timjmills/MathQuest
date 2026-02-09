# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MathQuest ("Maths Quest Pro") is a modular math practice web application targeting Grade 5 students. The app is split into 54 files: 1 HTML + 10 CSS + 43 JS (42 ES modules + 1 barrel module). The original monolithic `math-quest-unified.html` (~37,000 lines) is preserved as a backup.

## Running the App

Serve the project directory over HTTP and open `index.html`. ES modules require HTTP — `file://` will not work.

```bash
npx serve .
```

No build tools, bundler, or dependencies to install. External resources (fonts, CDN libraries) are loaded via `<link>` and CSP meta tags in the `<head>`. Deployed as static files on Netlify.

## File Structure

```
MathQuest/
├── index.html                          (HTML markup, ~985 lines)
├── css/
│   ├── variables.css                   (CSS custom properties, dark mode)
│   ├── base.css                        (resets, global styles, animations)
│   ├── role-toggle.css                 (student/teacher toggle)
│   ├── settings-panel.css              (slide-out settings)
│   ├── compact-number.css              (number selection grid)
│   ├── favorite-skills.css             (favorite skill cards)
│   ├── ui-components.css               (buttons, cards, modals, game modes)
│   ├── skill-progress.css              (progress bar)
│   ├── word-problem-visuals.css        (word problem SVG styles)
│   └── print-worksheet.css             (print & @media print rules)
├── js/
│   ├── globals.js                      (barrel: imports all, attaches to window, runs bootstrap)
│   └── modules/
│       ├── state.js                    (shared mutable state object)
│       ├── data.js                     (DOMAINS, SKILLS, SKILL_CODES, DEFAULT_TABLES)
│       ├── utils.js                    (randInt, shuffle, pick, normalizeText)
│       ├── storage.js                  (localStorage/cookie persistence)
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
│       ├── skill-codes.js              (skill code generation/parsing, settings codes)
│       ├── quick-skills.js             (quick skill cards, student quick start)
│       ├── favorites.js                (favorite skills CRUD)
│       ├── mode-selection.js           (game mode card selection)
│       ├── game-control.js             (startGame, timer, nextQuestion)
│       ├── generate-question.js        (THE question generator, ~8000 lines)
│       ├── question-render.js          (renderQuestion, interactive ordering/expanded)
│       ├── answer-check.js             (submitAnswer, checkAnswer, dual/word/area checks)
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
│       ├── print-settings.js           (print dialog, simple print)
│       ├── print-global-skills.js      (add skills modal, global skills list)
│       ├── print-weighted.js           (weighted distribution, print search)
│       ├── print-generate.js           (problem formatting, worksheet HTML, PDF)
│       └── init.js                     (init function, URL params, DOMContentLoaded)
└── math-quest-unified.html             (original monolithic backup)
```

## Architecture

### Module System

Browser-native ES modules with `.js` extensions in all import paths. No bundler.

- **`globals.js`** is the single entry point (`<script type="module" src="js/globals.js">`). It imports all 42 modules and attaches ~150 functions to `window` via `Object.assign(window, {...})` to support 200+ inline HTML event handlers (`onclick`, `onchange`, etc.).
- **Dark mode** uses an inline non-module `<script>` that runs immediately before the deferred module to prevent flash.
- **`bootstrap()`** is called at the end of globals.js, which sets up modal listeners and calls `init()`.

### Dependency Hierarchy (no circular dependencies)

```
Layer 0 (no deps):     state.js, utils.js, data.js
Layer 1 (Layer 0):     storage.js, svg-*.js (5 files)
Layer 2 (Layers 0-1):  progress.js, ui-core.js, user-role.js, navigation.js,
                        settings-panel.js, favorites.js, number-selection.js,
                        category-dropdowns.js, skill-search.js
Layer 3 (Layers 0-2):  unified-skills.js, skill-codes.js, quick-skills.js,
                        mode-selection.js
Layer 4 (Layers 0-3):  generate-question.js, game-control.js, question-render.js,
                        answer-check.js, solution-display.js, hints-speech.js,
                        tchart-factor.js, divisibility-sort.js, boss-race.js
Layer 5 (Layers 0-4):  worksheet.js, game-flow.js, dashboard.js,
                        mixed-mode-*.js (3 files)
Layer 6 (Layers 0-5):  print-*.js (4 files)
Layer 7 (all):         init.js, globals.js
```

### Shared State

- **`state.js`** exports a single mutable object. All modules import the same reference — mutations are visible everywhere.
- **Shared mutable arrays** (`skillQueue`, `customQuickSkills`, `globalSkillsList`, `weightedItems`, `mixedSkillsList`) live on `window` and are accessed as `window.variableName` across all modules. This is necessary because ES modules use strict mode and `let` is module-scoped.

### View System

Navigation uses a view-switching pattern. Views are `<div class="view">` elements toggled via `showView(id)` which adds/removes the `.active` class:
- **`homeView`** — Main menu with skill selection, settings, quick skills grid
- **`gameView`** — Active gameplay (practice, boss battle, car race modes)
- **`worksheetView`** — Generated worksheet with interactive answer checking
- **`dashboardView`** — Session history, streak calendar, badges (teacher-only)

### Three-Tier Skill Hierarchy: Domains → Categories → Skills

The `DOMAINS` object in `data.js` defines 5 math domains, each containing categories, which in turn contain skills defined in the `SKILLS` object:
- **Number & Operations**: addition, subtraction, multiplication, division, integers
- **Fractions, Decimals & Percents**: fractions, decimals, conversions
- **Geometry & Measurement**: area/perimeter, angles, shapes, coordinates, measurement
- **Data & Statistics**: graphs, data analysis, probability
- **Algebraic Thinking**: patterns, algebra, order of operations, place value, number sense, number theory

### Question Generation

`generateQuestion()` in `generate-question.js` is the core function (~8000 lines). It dispatches to skill-specific generation logic. Each question returns an object with: `text`, `ans`, `hint`, `options`, `answerType`, `visual`, `skillLabel`.

Answer types include: `number`, `multiple-choice`, `text`, `dual` (perimeter+area), `interactive-ordering`, `interactive-expanded`, `area-model`, `number-family`, and more.

### Game Modes

Set via `state.gameMode`:
- **`practice`** — Standard question/answer with XP
- **`boss`** — Boss Battle with hero/monster position tracking
- **`race`** — Car Race against CPU opponent
- **`worksheet`** — Batch of questions rendered as an interactive worksheet

### Persistence

- **Cookies** (`setCookie`/`getCookie` in `storage.js`): Settings, favorites, user role, mixed mode settings
- **localStorage**: Skill progress tracking (`mathquest_skill_progress`), session history, streak data
- **URL parameters**: `?code=` or `?c=` for shared skill code links

### Role System (Student/Teacher)

`toggleUserRole()` in `user-role.js` switches between student and teacher modes. Student mode simplifies the UI (hides advanced settings, shows quick skills grid). Teacher mode exposes all configuration dropdowns, dashboard, and print/worksheet generation.

### Skill Code System

A compact encoding system in `skill-codes.js` lets teachers generate shareable codes representing weighted skill selections. Codes can be shared via URL parameters. `generateSkillCode()` / `applySkillCode()` handle encoding/decoding.

### Worksheet/Print System

`generateWorksheetFromSkills()` in `print-settings.js` creates printable HTML worksheets with configurable problem count, columns, color/BW mode, and optional answer keys with worked solutions. Output is a standalone HTML file downloaded as a blob. The print system spans 4 modules: `print-settings.js`, `print-global-skills.js`, `print-weighted.js`, `print-generate.js`.

**Visual Quality Mandate**: When building or improving print/screen renderings for any skill, research and plan the best visual approach for that specific skill. Use whatever combination of technologies produces the best result:
- **KaTeX** (`cdn.jsdelivr.net/npm/katex`) — for typeset math: fractions, exponents, roots, long division, aligned equations, worked solutions
- **MathJax** (`cdn.jsdelivr.net/npm/mathjax`) — for complex notation: matrices, systems of equations, advanced symbols
- **SVG** — for geometric figures, number lines, clocks, graphs, visual models
- **CSS** — for layout, grids, tables, alignment, spacing
- **Raw HTML/JS** — for interactive elements, drag-and-drop, dynamic rendering

Choose the technology that produces the most professional, clear, and visually appealing output for each skill. Different skills may require different approaches. Always prioritize readability and print quality.

### SVG Visual Helpers

Extensive SVG generation functions for visual math representations across 5 modules:
- Geometry (`svg-geometry.js`): `createAngleSVG`, `createRectangleSVG`, `createTriangleSVG`, `create3DBoxSVG`, `createLShapeSVG`, etc.
- Fractions (`svg-fractions.js`): `fracCircleSVG`, `fracBarHTML`, `fracWithVisual`
- Clocks (`svg-clock.js`): `createAnalogClockSVG`, `createDigitalClockHTML` with magnification support
- Number representations (`svg-base10.js`): `createBase10Blocks`, `createCountingDots`, `createDotArray`, `createNumberLine`
- Factors (`svg-factors.js`): `getFactorPairs`, `createFactorLinksSVG`

### Adaptive Difficulty

`trackPerformance()` and `adjustDifficulty()` in `progress.js` auto-adjust difficulty based on recent answer accuracy and response time, stored in `state.recentPerformance`.

## Key Patterns When Editing

- **Inline handlers use `window`**: 200+ `onclick`/`onchange` handlers in HTML reference functions via `window` (set by globals.js). New functions called from HTML must be added to the `Object.assign(window, {...})` block in `globals.js`.
- **Shared arrays use `window.`**: `window.skillQueue`, `window.customQuickSkills`, `window.globalSkillsList`, `window.weightedItems`, `window.mixedSkillsList` — always use the `window.` prefix when accessing these in any module.
- **Cross-module function calls**: Functions not imported locally still work at runtime because globals.js attaches them to `window` before any user interaction occurs. However, they must be on `window` before being called.
- CSS uses custom properties (`--bg-world`, `--accent-cyan`, etc.) for theming; dark mode toggles `.dark` class on `<html>`
- New skills must be added in three places: the `DOMAINS` categories array in `data.js`, the `SKILLS` object in `data.js`, and as a case in `generateQuestion()` in `generate-question.js` — and should respect `state.range` and `state.decimalPlaces` for number scaling
- Question answer checking flows through `submitAnswer()` → `checkAnswer()` with special paths for dual answers, word problems, interactive ordering, etc.
- The `generateQuestion()` function uses a massive switch/if-else chain on `state.skill` — when adding skills, follow the existing pattern of the nearest similar skill

### Max Number Range & Decimal Settings

- **`state.range`** (Max Number setting): Controls the upper bound for generated numbers. Values: 10, 20, 50, 100, 500, 1000, 10000. Default: 100.
- **`state.decimalPlaces`** (Decimal Places setting): Controls decimal precision. Values: 0, 1, 2, 3. Default: 0.
- **New skills MUST use these settings** to scale their number ranges, UNLESS the skill has a fixed domain (e.g., time/clock skills are constrained to 12-hour/60-minute ranges, angles are constrained to 0-360°, coordinates are constrained to grid size).
- Use proportional scaling patterns: `Math.max(minVal, Math.min(range, maxCap))` to keep numbers reasonable for mental math
- For geometry: use `Math.sqrt(range)` for dimensions (to keep areas manageable)
- For volume: use `Math.pow(range, 1/3)` for dimensions (to keep volumes manageable)
- For data/stats: cap at `Math.min(range, 200)` to keep data sets practical
- For decimals: `const places = state.decimalPlaces > 0 ? state.decimalPlaces : defaultPlaces` to respect the setting while providing a skill-appropriate default
- Skills that should NOT use range: time/clock, angles, coordinates, skills with fixed mathematical constraints

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
- Run the build/dev server to confirm no compilation errors

## Workflow
- If something breaks, fix it without asking
- Do not skip steps or leave TODOs
- Never say "done" unless you have confirmed it works end to end
