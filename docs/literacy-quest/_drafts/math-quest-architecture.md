# Math Quest Architecture — synthesis

## High-Level Architecture

MathQuest is a modular, browser-native ES6 application with ~70 files (1 HTML, 14 CSS, 55 JS modules). Three pillars:

**Module System.** Browser-native ES6 modules — no bundler. `globals.js` is the single entry point; imports all modules and uses `Object.assign(window, {...})` to attach ~250+ functions to `window`, enabling inline HTML event handlers (`onclick`, `onchange`). This barrel pattern trades build-time safety for zero-dependency deployability.

**Dependency Hierarchy** — acyclic, 8 layers:
- L0 (no deps): `state.js`, `utils.js`, `data.js`
- L1: `storage.js`, 5× `svg-*.js`
- L2: `gamification.js`, `progress.js`, `ui-core.js`, `user-role.js`, `navigation.js`, `settings-panel.js`, `favorites.js`
- L3: `unified-skills.js`, `skill-codes.js`, `quick-skills.js`, `mode-selection.js`, `skills-organizer.js`
- L4: `generate-question.js`, 8× `gen-*.js`, `game-control.js`, `question-render.js`, `answer-check.js`, widgets, hints
- L5: `worksheet.js`, `game-flow.js`, `dashboard.js`, mixed-mode
- L6: print + quiz systems
- L7: `init.js`, `globals.js`

**Shared Mutable State.** All modules share a single `state` object (~174 properties). Mutations are immediately visible everywhere — no reducer, no immutability.

---

## File-System Layout (compressed)

```
MathQuest/
├── index.html                       (HTML entry, ~1000 lines)
├── css/
│   ├── variables.css               (CSS custom properties, dark mode)
│   ├── base.css, ui-components.css
│   ├── role-toggle.css, settings-panel.css, compact-number.css
│   ├── favorite-skills.css, skill-progress.css, word-problem-visuals.css
│   ├── print-worksheet.css, quiz-mode.css, skills-organizer.css
│   └── map-mode.css                (loaded universally; ships .msc-opt/.msc-grid)
├── js/
│   ├── globals.js                  (barrel: ~250 window attachments)
│   └── modules/
│       ├── state.js, data.js, utils.js, storage.js
│       ├── svg-*.js                (geometry, fractions, clocks, base-10, factors)
│       ├── gamification.js, progress.js, ui-core.js, user-role.js
│       ├── navigation.js, settings-panel.js, favorites.js
│       ├── unified-skills.js, skill-codes.js, quick-skills.js
│       ├── generate-question.js   (dispatcher)
│       ├── gen-*.js (8)            (operations, fractions, geometry, measurement, data-stats, algebraic, counting, number-theory)
│       ├── question-render.js, answer-check.js (~2900 lines)
│       ├── widget-retry.js
│       ├── widgets/ (28 modules)
│       ├── game-control.js, worksheet.js, game-flow.js
│       ├── boss-race.js
│       ├── map-engine.js, map-mode-ui.js, map-results.js
│       ├── dashboard.js, hints-speech.js
│       ├── quiz-storage.js, quiz-builder.js, quiz-take.js, quiz-results.js
│       ├── print-settings.js, print-generate.js, print-weighted.js, print-global-skills.js
│       ├── mixed-mode-*.js (3)
│       ├── skills-organizer.js
│       └── init.js
└── math-quest-unified.html         (original monolithic backup)
```

---

## The Dispatcher Pattern

`generateQuestion()` in `generate-question.js` (~500 lines) is the central dispatcher. Routes via `categoryMapping` + `skillCategoryOverride` map to one of 8 generators:

| Generator | Function | Domains |
|---|---|---|
| `gen-operations.js` | `generateOperationsQuestion`, `generateIntegersQuestion` | add, subtract, multiply, divide, integers |
| `gen-fractions.js` | `generateFractionsQuestion`, `generateDecimalsQuestion`, `generateConversionsQuestion` | fractions, fraction_operations, decimals, conversions |
| `gen-geometry.js` | `generateGeometryQuestion` | area/perimeter, angles, shapes, 2D/3D, coordinates |
| `gen-measurement.js` | `generateMeasurementQuestion` | time, length, mass, capacity, unit conversions |
| `gen-data-stats.js` | `generateDataStatsQuestion` | graphs, pictographs, line plots, probability |
| `gen-algebraic.js` | `generatePatternsQuestion`, etc. | patterns, algebra, OoO, place value, number sense |
| `gen-counting.js` | `generateCountingQuestion` | counting, comparing, composing (K-2) |
| `gen-number-theory.js` | `generateNumberTheoryQuestion` | primes, factors, GCD, LCM, divisibility |

Each generator returns: `{ text, ans, hint, options, answerType, visual, skillLabel, printFormat }`.

---

## Answer Types (30+)

**Built-in** (handled by `answer-check.js` + `question-render.js`):
- `number`, `multiple-choice`, `text`, `dual`, `dual-fraction`
- `interactive` with `interactiveType: ordering | expanded | placement`
- `area-model`, `number-family`, `fact-family`
- `tchart-drag`, `divisibility-sort`, `coordinate-multi`
- `clock-choice`, `number-line-place`, `odd-even-select`
- `word_problem`, `scaffolded_word`, `fraction-input`
- `shade-parts`, `inline-blanks`, `inline-cloze`, `image-hotspot`, `factor-pairs`

**Widget-based** (each widget in `js/modules/widgets/` exports `render*` + `check*`):
- `multi-select-check` — checkbox grid for "select all that apply" (MAP gap-fill)
- `ten-frame`, `ten-frame-build`, `hot-spot`, `numpad-input`, `clock-set`
- `drag-fill`, `dnd-generic`, `col-add`, `col-subtract`, `col-multiply`, `long-division`, `col-arith`
- `array-builder`, `base10-build`, `grid-fill`, `coord-plot`
- `pv-build`, `pv-digit-drag`, `graph-builder`, `place-symmetry-lines`
- `compose-fraction-tiles`, `compose-shape-blocks`, `build-expr`
- `nl-drag`, `number-line-extended`, `coin-builder`, `vocab-match`

---

## The View System

Eight views toggled via `showView(id)` (in `navigation.js`):

1. `homeView` — main menu, skill selection, role toggle
2. `gameView` — active gameplay
3. `worksheetView` — interactive worksheet grid
4. `dashboardView` — teacher analytics, streak calendar
5. `skillsOrganizerView` — 3-panel skill navigator
6. `quizBuilderView` — quiz creation
7. `quizTakeView` — student quiz session
8. `quizResultsView` — quiz scoring + review

---

## Game Modes

`state.gameMode` controls:
- `practice` — standard Q/A loop with XP, streaks, badges
- `boss` — Boss Battle (hero vs monster)
- `race` — Car Race (player vs CPU)
- `worksheet` — batch as interactive worksheet
- `map` — MAP Test Practice (`state.mapMode = true`, `state.mapSessionMode` ∈ ['simulation', 'practice'])

---

## Skill Hierarchy

Three-tier in `data.js`:

**6 DOMAINS:** Number & Operations · Counting & Cardinality · Fractions/Decimals/% · Geometry & Measurement · Data & Statistics · Algebraic Thinking.

Each domain → categories → skills. Each skill: `id`, `label`, `grade` (K, 1-6, M), optional `range`/`decimalPlaces`.

**Constants:**
- `SKILL_PRINT_SIZE` — 5 size tiers for print auto-layout
- `SKILL_TIME_CATEGORY` — time-module classification
- `CALCULATOR_SKILLS` — set of calculator-eligible skills

---

## State and Persistence

**Shared state** (`state.js`, ~174 props): game session, current question, settings, replay/back-nav, gamification, MAP mode.

**Storage layers:**
- **Cookies** — settings, role, favorites, daily stats, mixed-mode, celebration toggle
- **localStorage** — skill progress, session history, streak data
- **IndexedDB** — quiz tests/results (via `quiz-storage.js`)
- **URL params** — `?code=`, `?c=`, `?quiz=`, `?map=`

---

## Gamification System

In `gamification.js`:
- 15 XP levels with titles
- Streak bonuses (3, 5, 10, every 5)
- Surprise bonuses every 3-7 correct
- 15 unlockable badges with celebrations
- Spaced repetition (Leitner boxes), Smart Review
- Game Stats Banner (daily, timer, streak, mood)
- On-task timer (per-question, idle modal at 60s)
- Session timer with break suggestions
- Inactivity modal (>2 min idle)
- Fullscreen mode prompt + tab-switch detection
- Fast-guess detection (<1s response, MAP only)

---

## Reusable Infrastructure for Literacy Quest

Extract to `/shared/quest-core/` (or `/js/modules/shared/`):

1. `state.js` — shared mutable state pattern (XP, level, streak, badges, etc.)
2. `storage.js` — cookie + localStorage wrappers
3. `utils.js` — `randInt`, `shuffle`, `pick`, `normalizeText`, `buildNumericOptions`
4. `gamification.js` — XP, levels, badges, streaks, banner, on-task timer (math-specific badges/titles overrideable)
5. `progress.js` — skill progress, mastery, adaptive difficulty
6. `dashboard.js` — session history, streak calendar, badges UI
7. `ui-core.js` — `showToast`, `confetti`, theme toggle, `updateUI`
8. `navigation.js` — `showView()` (view IDs app-specific)
9. `hints-speech.js` — TTS via Web Speech API with voice warming + synth state management
10. `quiz-storage.js` — IndexedDB persistence (domain-agnostic)
11. `print-settings.js` + `print-generate.js` — worksheet pipeline (extensible)
12. **Widget pattern** — each widget exports `render*` + `check*`, optional retry hooks
13. **Widget-retry pattern** (`widget-retry.js`) — `isFirstAttempt`, `markFirstAttempt`, `markAllCorrectFired`, `buildRetryMessage`
14. **Answer-check dispatcher** — `checkAnswer()` flow with isReviewing/applyReviewOutcome branches
15. **Question-render dispatcher** — generic `renderQuestion()`
16. **MAP adaptive engine** (`map-engine.js`) — Rasch 1PL, item pool selection, session management; **port directly**
17. **CSS variables system** (`variables.css`) — `--bg-world`, `--accent-cyan`, etc., `.dark` class toggle
18. `settings-panel.js` — TTS toggle, role switch, theme (extend with literacy options)

---

## Math-Only Assumptions That Must NOT Block Literacy Reuse

Stay math-only OR abstract via extension points:
- **Numpad widget** (digits 0-9 only)
- **Equation rendering** (KaTeX/MathJax)
- **Number lines, base-10 blocks, fraction circles/bars**
- **Factor pairs T-chart**
- **Clock widget**
- **Coordinate grids** (1-quadrant, 4-quadrant)

---

## Widget Integration Pattern

Widgets in `js/modules/widgets/` export:

```js
export function renderMultiSelectCheck(q, container) {
    // Populate container, wire listeners, side effects only
}
export function checkMultiSelectCheck(q, container) {
    // Extract user response, return { correct, submitted, feedback? }
}
```

**Flow:**
1. `question-render.js renderQuestion()` checks `q.answerType`
2. Widget types dynamically import + call `render*(...)`
3. HTML submit button wires `onclick="submitAnswer()"`
4. `answer-check.js submitAnswer()` checks `q.answerType`, calls `check*()`
5. `widget-retry.js` helpers gate scoring vs repaint

---

## Retry & Partial-Correct Pattern (gold standard)

**`widget-retry.js`:**
- `isFirstAttempt()` — true on first submit
- `markFirstAttempt(correctNow)` — cache verdict, idempotent
- `markAllCorrectFired()` — prevent double-fire confetti/advance

**`answer-check.js recordWrongAttempt`:**
- Wrong: paint red, add `.wrong-persistent`, show retry msg
- Skip button after threshold (currently 2)
- Append to `state.currentQAttemptHistory` for cross-out display
- Gate XP/streak/badge on first attempt only

**`question-render.js` + widgets:**
- Add `locked-correct` class to correct-only inputs (frozen after first correct)
- On repaint, clear `.wrong-persistent`/`.missed-correct` for re-evaluation

**Review mode (back-navigation in practice):**
- `isReviewing()` → true when `state._reviewingQIndex >= 0`
- On submit, `applyReviewOutcome(isCorrect, userAnswer)` instead of normal scoring
- Updates question history but doesn't award XP or advance

---

## TTS / Accessibility Scaffolding (already built)

`hints-speech.js`:
- `speakQuestion()` — voice warming, synth state management
- `_safeSpeak()` — handles Web Speech API quirks (resume on pause, cancel-then-speak stall)
- Configurable rate/pitch/voice
- TTS toggle persisted; defaults ON every session

`ui-core.js`:
- Dark mode (`.dark` class on `<html>`); CSS custom properties theming

`user-role.js`:
- Student / teacher toggle; simplifies UI in student mode

---

## Skill Code System

`skill-codes.js` encodes:
- **Skill selection** — weighted (e.g., `AB3-CD5-EF`)
- **Settings** — `T300-N20-Gp-R100-D0` (timer, count, mode, range, decimals)
- **URL sharing** — `?code=` or `?c=`

Reusable for Literacy Quest.

---

## Print / Worksheet System

4-module pipeline: `print-settings.js`, `print-weighted.js`, `print-global-skills.js`, `print-generate.js`.

`SKILL_PRINT_SIZE` 5 tiers: `compact` (3col), `standard` (3col), `medium` (2col), `wide` (1col), `spacious` (1col + work space).

`window.printShowSkillLabels` toggle adds short labels after problem numbers.

---

## Student-Attention Features (ready-made)

- On-task timer (idle modal)
- Inactivity detection (>2 min)
- Tab-switch detection (count taps/returns)
- Fullscreen prompt + exit detection
- Game stats banner
- Streak calendar (7/30/90 day heatmap)
- Celebration animations (toggleable)

---

## CSS Architecture

`variables.css` defines `--bg-world`, `--accent-cyan`, `--correct`, `--incorrect`, etc. Dark mode swaps via `.dark` class. Per-module CSS files. `map-mode.css` is loaded universally and ships `.msc-opt`/`.msc-grid`/`.locked-correct` styles used by widgets.

---

## Implications for Literacy Quest's Build

1. **Feature-flag everything new.** Gate every Literacy Quest route, modal, skill behind `FEATURES.LITERACY_QUEST_ENABLED`.
2. **Do NOT modify Math Quest core.** `data.js` DOMAINS/SKILLS, `gen-*.js` generators, `state.js` (add new properties as needed; never remove).
3. **Extract shared infrastructure to `/js/modules/shared/quest-core/`** (or `/shared/quest-core/`) and import from both apps. The 18 reusable modules listed above.
4. **Branch-specific modules** in `/js/modules/literacy/`. Reading/Language generators, skill data, custom widgets (e.g., `gen-reading.js`, `gen-language.js`, `widgets/sound-box.js`).
5. **Reuse widget pattern.** Comprehension widgets (multi-select-check for "which statements supported?", dnd-generic for matching, vocab-match for definitions) follow the same render/check contract.
6. **Reuse retry pipeline.** Every Literacy widget adopts `widget-retry.js` for in-place correction.
7. **Reuse MAP engine.** Copy `map-engine.js` directly; literacy uses Rasch 1PL identical to math.
8. **Settings panel extension.** Create `literacy-settings-panel.js` extending base with reading-specific options (font size, readability mode, highlight color, OpenDyslexic toggle).
9. **Print pipeline reuse.** Extend `print-generate.js` for reading passage layouts; reuse `SKILL_PRINT_SIZE` for text-heavy problems.
10. **Keep math-only widgets isolated.** `numpad-input.js`, `base10-build.js`, `coord-plot.js` etc. stay math-only; Literacy Quest doesn't import them.
11. **View naming convention.** Prefix or namespace IDs (`literacyHomeView`, `literacyMapView`) to prevent collisions.
12. **Shared tests** in `/shared/quest-core/__tests__/`.
13. **Item-set passage management is the largest architectural addition.** MathQuest generates one question at a time and discards it. Reading 2-5 needs a passage-anchored session object (1 passage, 3-5 items, shared state, no reload).
14. **Audio asset pipeline is new infrastructure.** K-2 mandatory audio per item requires AWS Polly Neural / ElevenLabs pipeline + caching. Math Quest has TTS via Web Speech API but no pre-rendered asset library.
