# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MathQuest ("Awsaj Grade 5 Math Quest") is a self-contained, single-file math practice web application targeting Grade 5 students. The entire application — HTML, CSS, and JavaScript — lives in one file: `math-quest-unified.html` (~37,000 lines, ~2MB).

## Running the App

Open `math-quest-unified.html` directly in a browser. No build tools, bundler, server, or dependencies to install. External resources (fonts, CDN libraries) are loaded via `<link>` and CSP meta tags in the `<head>`.

## Architecture

### Single-File Structure

The file is organized in this order:
1. **`<head>`** (lines 1–6): CSP meta tags, viewport, title, Google Fonts link
2. **`<style>`** (lines 7–~5410): All CSS including light/dark theme via CSS custom properties (`.dark` class on `<html>`), responsive layout, print styles, animations
3. **`<body>` HTML** (~5410): All views/screens defined as `<div class="view">` elements
4. **`<script>`** (~5412–37004): All JavaScript — global state, systems, question generators, UI logic

### View System

Navigation uses a view-switching pattern. Views are `<div class="view">` elements toggled via `showView(id)` which adds/removes the `.active` class:
- **`homeView`** — Main menu with skill selection, settings, quick skills grid
- **`gameView`** — Active gameplay (practice, boss battle, car race modes)
- **`worksheetView`** — Generated worksheet with interactive answer checking
- **`dashboardView`** — Session history, streak calendar, badges (teacher-only)

### Global State

A single `state` object (line ~5425) holds all runtime state: XP, streak, current question, game mode, timer, score, settings, session history, skill progress, and adaptive difficulty tracking.

### Three-Tier Skill Hierarchy: Domains → Categories → Skills

The `DOMAINS` object (line ~6003) defines 5 math domains, each containing categories, which in turn contain skills defined in the `SKILLS` object (line ~6097):
- **Number & Operations**: addition, subtraction, multiplication, division, integers
- **Fractions, Decimals & Percents**: fractions, decimals, conversions
- **Geometry & Measurement**: area/perimeter, angles, shapes, coordinates, measurement
- **Data & Statistics**: graphs, data analysis, probability
- **Algebraic Thinking**: patterns, algebra, order of operations, place value, number sense, number theory

### Question Generation

`generateQuestion()` (line ~12921) is the core function (~8000 lines). It uses `categoryMapping` and `skillMapping` to translate the new three-tier hierarchy into legacy category/skill identifiers, then dispatches to skill-specific generation logic. Each question returns an object with: `text`, `ans`, `hint`, `options`, `answerType`, `visual`, `skillLabel`.

Answer types include: `number`, `multiple-choice`, `text`, `dual` (perimeter+area), `interactive-ordering`, `interactive-expanded`, `area-model`, `number-family`, and more.

### Game Modes

Set via `state.gameMode`:
- **`practice`** — Standard question/answer with XP
- **`boss`** — Boss Battle with hero/monster position tracking
- **`race`** — Car Race against CPU opponent
- **`worksheet`** — Batch of questions rendered as an interactive worksheet

### Persistence

- **Cookies** (`setCookie`/`getCookie` at line ~5772): Settings, favorites, user role, mixed mode settings
- **localStorage**: Skill progress tracking (`mathquest_skill_progress`), session history, streak data
- **URL parameters**: `?code=` or `?c=` for shared skill code links

### Role System (Student/Teacher)

`toggleUserRole()` switches between student and teacher modes. Student mode simplifies the UI (hides advanced settings, shows quick skills grid). Teacher mode exposes all configuration dropdowns, dashboard, and print/worksheet generation.

### Skill Code System

A compact encoding system (line ~6341) lets teachers generate shareable codes representing weighted skill selections. Codes can be shared via URL parameters. `generateSkillCode()` / `applySkillCode()` handle encoding/decoding.

### Worksheet/Print System

`generateWorksheetFromSkills()` (line ~9657) creates printable HTML worksheets with configurable problem count, columns, color/BW mode, and optional answer keys with worked solutions. Output is a standalone HTML file downloaded as a blob.

### SVG Visual Helpers

Extensive SVG generation functions for visual math representations:
- Geometry: `createAngleSVG`, `createRectangleSVG`, `createTriangleSVG`, `create3DBoxSVG`, `createLShapeSVG`, etc.
- Fractions: `fracCircleSVG`, `fracBarHTML`, `fracWithVisual`
- Clocks: `createAnalogClockSVG`, `createDigitalClockHTML` with magnification support
- Number representations: `createBase10Blocks`, `createCountingDots`, `createDotArray`, `createNumberLine`

### Adaptive Difficulty

`trackPerformance()` and `adjustDifficulty()` (line ~5569) auto-adjust difficulty based on recent answer accuracy and response time, stored in `state.recentPerformance`.

## Key Patterns When Editing

- The file has no modules or imports — everything is in global scope within a single `<script>` block
- CSS uses custom properties (`--bg-world`, `--accent-cyan`, etc.) for theming; dark mode toggles `.dark` class on `<html>`
- New skills must be added in three places: the `DOMAINS` categories array, the `SKILLS` object, and as a case in `generateQuestion()`
- Question answer checking flows through `submitAnswer()` → `checkAnswer()` with special paths for dual answers, word problems, interactive ordering, etc.
- The `generateQuestion()` function uses a massive switch/if-else chain on `state.skill` — when adding skills, follow the existing pattern of the nearest similar skill
