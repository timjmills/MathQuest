# Adaptive Mode + Grade-Level Batch Assign — Feasibility Research

## Executive Summary

- **Feature 1 (Whole-Program Adaptive Mode)**: **Feasible**. Recommended approach is **B (per-skill ladder)** with a thin difficulty-rank built from existing `SKILL_GRADES` + skill-suffix heuristics. Effort: **L (~2-3 days)**. Reuses dispatcher/render pipeline; no IRT psychometrics needed.
- **Feature 2 (Grade-Level Batch Assign)**: **Feasible and trivial**. Recommended approach is **D (grade chip row)** wired directly into `UnifiedSkills.add()`. Grade metadata already lives in `SKILL_GRADES` (~386 skills, all tagged). Effort: **S (~2-4 hr)**.

Both features are low risk — the data model already supports them. Recommend doing **Feature 2 first** (quick win, unblocks teachers immediately), then **Feature 1**.

---

## Feature 1 — Whole-Program Adaptive Mode

### Current State

- **MAP engine (`js/modules/map-engine.js`, 913 lines)** is a closed-pool RIT-based selector. Key entry points: `startMapSession(opts)`, `nextMapItem()`, `chooseNextSkill()` (lines 370-402), `recordMapAnswer(result)`, `finalizeMapSession()`.
- `chooseNextSkill()` already does most of what's needed: pulls candidates from a pool, rotates by least-seen domain, sorts by distance from a moving target, picks randomesque from top 5.
- **Skill pool** is hard-coded in `RIT_BAND_SKILLS_K2` and `RIT_BAND_SKILLS_35` (data.js, lines 1697-1788). Each band is just a string array of skillIds.
- **Difficulty signal**: `SKILL_GRADES` (data.js lines 23-182) tags **all 386 skills** with K, 1-7, or M. Suffix heuristics (`_easy`, `_medium`, `_hard`, `_no_regroup`/`_regroup`/`_mixed`, `_10`/`_20`/`_50`/`_100`/`_1k`/`_10k`...) further sub-rank within a grade.
- **Per-skill mastery**: `state.skillProgress[skillId] = { correct, total, streak, history (last 20), mastery 0-100 }` already exists (`progress.js` lines 31-90). `updateSkillProgress(skillId, isCorrect)` is called from every answer-check path. **This is the perfect signal source.**
- **State already has**: `state.consecutiveCorrect`, `state.consecutiveWrong`, `state.recentPerformance` (last 10).
- **No global "difficulty level" per skill** exists today — `state.difficulty` is deprecated ("medium" only).
- **Mode plumbing**: 5 mode cards in `index.html` lines 599-619 (`practice`/`boss`/`race`/`worksheet`/print). `selectMode(mode)` in `mode-selection.js` is 30 lines — trivial to extend.

### Three Implementation Approaches

#### A. Reuse MAP Engine, Constrain Pool
Wire a new `state.adaptivePoolSkills = [...]` (built from queue), call `startMapSession({bands: ['171-180','181-190',...], domains: [...derive from queue...]})`. Override `chooseNextSkill` to filter to pool.

- **Pros**: Smallest diff (~150 lines). Inherits domain rotation, RIT tracking, results screen, navigator, rapid-guess detection.
- **Cons**: RIT model is overkill for a teacher-curated pool. Conceptually confusing ("Why do I see Grade 3 skills when I picked only Grade 5?"). Couples adaptive mode to MAP UX (immersive overlay, end-session button, banner).

#### B. Per-Skill Ladder (RECOMMENDED)
Each selected skill gets a level 1-5. Promotion rule: 3-in-a-row correct → level up. Demotion: 2-in-a-row wrong → level down. Skill picked round-robin across the queue (least-attempted first), level mapped to a difficulty modifier (operand range cap, problem variant).

- **Pros**: Matches user's verbatim vision ("move up or down for that skill"). Self-contained module (~250 lines). Levels persist per-skill in `state.skillProgress[id].adaptiveLevel`. Per-skill or per-domain feedback ("Great! Multiplication moved up to level 3!").
- **Cons**: New "difficulty rank" infrastructure. For skills without `_easy`/`_hard` variants (most skills), level only modulates `state.range` and problem-type weighting — the variation may feel modest. Need to define ladder per skill (see below).
- **Difficulty ladder construction**: For each selected skill, compute a 5-level ramp:
  - Level 1: floor `range = 10`, simplest problem-type weight
  - Level 5: ceiling `range = grade-cap`, hardest problem-type weight
  - For skill families with explicit variants (`add_10_mixed` → `add_20_mixed` → `add_50_mixed`...), ladder swaps the actual skill mid-session
  - Generators already honor `state.range` and `state.decimalPlaces` — just bump those between questions

#### C. Hybrid IRT-lite
Per-skill shrinkage estimate (β + observed-correct-rate weighting), keep one running estimate per skill, choose next skill by max-information criterion across the queue.

- **Pros**: Most psychometrically defensible.
- **Cons**: Overkill for K-6. Math research adds 1-2 days. No clear UX benefit over B.

### Recommended: **Approach B**

### Detailed Plan

| File | Change |
|---|---|
| `js/modules/data.js` | Add `SKILL_LADDER` map (initially: heuristic ladder per skill family — `add_10_no_regroup → add_20_no_regroup → add_50_regroup → add_100_regroup → add_1k_regroup`). Skills not in map fall back to `range`-modulation only. |
| `js/modules/state.js` | Add `state.adaptiveMode`, `state.adaptiveSelectedSkills`, `state.adaptiveLevels = {skillId: 1-5}`, `state.adaptiveStreaks = {skillId: {right: 0, wrong: 0}}`, `state.adaptiveHistory = []`. |
| `js/modules/adaptive-engine.js` | **New module** (~250 lines): `startAdaptiveSession()`, `chooseNextAdaptiveSkill()`, `recordAdaptiveAnswer()`, `finalizeAdaptiveSession()`. Mirrors map-engine.js structure but pool=queue and level=per-skill. |
| `js/modules/answer-check.js` | Add `state.adaptiveMode` branch alongside existing `state.mapMode` branch (~5 lines). |
| `js/modules/mode-selection.js` | Add `'adaptive'` to mode list. |
| `index.html` | Add 6th mode card "🧠 Adaptive". Add level-up/level-down toast (reuse `showToast()`). Add small per-skill level chips in game header during adaptive mode. |
| `js/modules/game-control.js` | In `startGame()`, branch to `startAdaptiveSession()` if `state.gameMode === 'adaptive'`. |
| `js/modules/globals.js` | Wire 4-5 new functions to `window`. |
| `js/modules/map-results.js` | **Reuse**: build a parallel `adaptiveResults` view (~50% code share — strengths/needs-work breakdown is the same; replace "RIT" with "level"). |

### Effort: **L (~2-3 days)**
- Day 1: state + engine module + ladder data
- Day 2: UI mode card, level chips, toasts, end-session results
- Day 3: testing across 5+ skill types, edge cases (single-skill queues, mid-session level cap)

### Risks
- **Ladder authoring**: 386 skills × 5 levels = a lot of manual mapping if done exhaustively. Mitigate: ship with auto-derived ladders (range scaling for all, explicit variant-swap only for the ~50 add/sub-by-range and `_easy/_hard` families). Iterate later.
- **Mixed-skill queues**: If teacher picks 1 K skill + 1 Grade 5 skill, the level rules apply per-skill independently — that's fine, but UX must clarify "level 3 of multiplication" ≠ "level 3 of counting".
- **Boss/Race interaction**: Adaptive mode is its own mode card, so boss/race orthogonality is preserved (or could be optionally combined later).
- **state.skillProgress collision**: `mastery` already exists; `adaptiveLevel` is additive. No conflict.

---

## Feature 2 — Grade-Level Batch Assign

### Current State

- **`SKILL_GRADES`** (data.js lines 23-182): every one of ~386 skills tagged with K, 1, 2, 3, 4, 5, 6, 7, or M. Distribution: K=29, 1=36, 2=61, 3=66, 4=85, 5=68, 6=40, 7=1.
- Helper `getSkillGrade(skillValue, categoryId)` resolves category-prefixed collisions (lines 185-197).
- **Queue mechanism**: `UnifiedSkills.add({domainId, categoryId, skillId, skillLabel, ...})` (`unified-skills.js` lines 21-38) is the single insertion point. Debounced `syncAll()` updates `window.skillQueue`, `window.globalSkillsList`, and all UI surfaces. **Pushing 50+ skills works** — the debounce already handles batch operations cleanly (150ms timer).
- **Existing UI**:
  - Quick Skills row exists below the section title
  - Skills Navigator (`skills-organizer.js`) already has a **grade-pill filter row** (`soFilterGrade(grade)`) but only filters visibility — there's no "Add All Visible" action.
  - No bulk-add anywhere in the app.
- **Print dialog** uses its own `globalSkillsList` (separate from queue) — could get a parallel button.

### Three Implementation Approaches

#### D. Grade Chip Row (RECOMMENDED)
Add a single horizontal row above (or beside) the Quick Skills grid: 8 colored pills (K, 1, 2, 3, 4, 5, 6, M). Click a pill → adds every skill with that grade to the queue. Click again → removes them. Pills colored to match `GRADE_COLORS`.

- **Pros**: One click, always visible, uses existing color system, multi-pill stacking is free (click 3 → click 4 → click 5 = "Grades 3-5 pack"). No modal.
- **Cons**: Adding all Grade 4 = 85 skills. Need a small confirm toast ("Added 85 Grade 4 skills"). Render performance is fine (debounced sync).

#### E. Settings-Panel Modal
"Quick Add by Grade" button in settings → modal with K-7 checkboxes + Apply button.

- **Pros**: More discoverable; doesn't crowd the homepage.
- **Cons**: Three clicks (open settings → open modal → check + apply). Settings panel is already crowded.

#### F. Grade Pack Presets in Skills Navigator
"Grade 3 Pack" preset card in the Navigator's queue panel.

- **Pros**: Lives where teachers already curate skills.
- **Cons**: Hidden behind another view. Doesn't match "simple button" requirement.

### Recommended: **Approach D**

### Detailed Plan

| File | Change |
|---|---|
| `index.html` | Insert a `<div class="grade-chip-row teacher-only">` above `#quickSkillsGrid` with 8 buttons (K, 1, 2, 3, 4, 5, 6, M). |
| `css/role-toggle.css` (or new section in `css/ui-components.css`) | Style: pill row, color from `GRADE_COLORS`, active state with checkmark, count badge "(85)". |
| `js/modules/quick-skills.js` | New `addAllSkillsForGrade(grade)`: iterate `SKILLS` flat → filter by `getSkillGrade()` → call `UnifiedSkills.add()` for each. Track active grades in `state.activeGradeChips`. Show toast "Added 85 Grade 4 skills". |
| `js/modules/globals.js` | Wire `addAllSkillsForGrade` to `window`. |
| `js/modules/skills-organizer.js` (optional bonus) | Add "Add All Visible" button to grade-filter row that respects current domain/grade/search filters. ~15 lines. |

### Effort: **S (~2-4 hr)**
- Markup + CSS: 30 min
- Logic + glue: 1 hr
- Testing across student/teacher mode + queue persistence: 1 hr

### Risks
- **Print dialog parity**: Teachers may expect the same button in the print dialog (`globalSkillsList` is separate). Easy to add later — same logic, different target array. Out of scope for v1.
- **Toast spam if user fat-fingers all 8 chips**: Show one summary toast per click instead of 85.
- **"M" / mixed meta-skills**: `isMixedMetaSkill()` already exists; skip those in the bulk-add.
- **Grade 7 has only 1 skill** (`probability_basic`) — fine, button still works; could hide if zero.

---

## Bottom-Line Recommendation

**Yes, proceed with both features.** Order of operations:

1. **Feature 2 first** (Grade-Level Batch Assign — half a day). Immediate teacher value, zero risk, unblocks the workflow that Feature 1 depends on (teacher needs an efficient way to assemble the skill pool that Adaptive Mode will iterate over).
2. **Feature 1 next** (Whole-Program Adaptive — 2-3 days). The data model (`SKILL_GRADES`, `state.skillProgress`, `UnifiedSkills`, generator dispatcher, `state.range`) already supplies every input the engine needs. The MAP engine is a working template. Choose Approach B for the cleanest mental model and the closest match to the user's verbatim vision.

Combined effort: ~3-4 days for both features end-to-end including testing. No new dependencies, no architectural refactors, no breaking changes.
