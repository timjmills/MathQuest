# Math Quest · Duo Redesign Gap Report

Reference: `Tim's Documents/Math Quest-handoff/math-quest/project/`
Live app: `index.html` + `css/*.css` + `js/modules/*.js`

**Audit date:** 2026-05-07
**Status of redesign:** Not started. Zero handoff classes/tokens present in the live codebase.

---

## 1. Design tokens — global delta

The handoff uses a coherent Duolingo-style design system. The live app uses a cyan/teal IXL-derived palette with no chunky 3D button language.

| Token | Live (`css/variables.css`) | Handoff (`duo.css`) | Action |
|---|---|---|---|
| Background | `--bg-world: #E0F7FA` | `--bg: #EAF8F8` | Adopt handoff (close enough) |
| Primary | `--accent-cyan: #0891B2` (cyan) | `--purple: #7C5CE6` | Adopt purple as new primary |
| Primary dark | — | `--purple-d: #5E3FCC` | Add |
| Primary light | — | `--purple-l: #B5A5F4` | Add |
| Secondary | `--accent-green: #059669` | `--teal: #2DD4BF`, `--teal-d: #14B8A6` | Adopt teal |
| CTA | `--accent-orange: #E07800` | `--orange: #FF8A3D`, `--orange-d: #E5722B` | Adopt warmer orange |
| Accent yellow | `--accent-gold: #D4A800` | `--yellow: #FFD66B` | Adopt softer yellow |
| Op pastels | none (gradients) | `--op-add #FFB7C2`, `--op-sub #FFCFA8`, `--op-mul #FFE7A0`, `--op-div #B6E8C9` | Add — use on operation cards/icons |
| Text | `--text-bright: #2D3748` | `--ink: #2B2840` | Switch (slightly purpler black) |
| Text muted | `--text-dim: #718096` | `--muted: #8B879F` | Switch |
| Rule line | none | `--rule: #E5E0F2` | Add — used everywhere for borders |
| Card shadow | `0 15px 45px rgba(13,48,126,0.18)` (soft glow) | `0 3px 0 0 var(--rule)` (chunky 3D) | **This is the biggest visual change.** Every card/button switches from soft shadow to flat-bottom Duolingo style |
| Font (display) | `Nunito 800–900` (already loaded) | `Nunito 800/900` + `Inter Tight` body | Add Inter Tight; keep Nunito for display |

**Recommendation:** add the handoff tokens to `variables.css` **alongside** the existing tokens, not replacing — many existing components reference `--accent-cyan` etc. Phase those out as each screen is rebuilt.

---

## 2. Top nav (always visible)

### Live (`<nav class="nav-bar">`, `index.html:29–107`)
- 🚀 Maths Quest Pro brand (emoji + text)
- Role-toggle slider (👨‍🎓 / 👩‍🏫)
- Student-only: XP badge + level bar
- Teacher-only buttons: Skills Navigator, Quiz Navigator, Print
- MAP Test dropdown (K-2 / 3-5 / K-5)
- Pop-ups toggle, Voice toggle (student-only)
- Adaptive toggle + Reset
- Theme toggle
- 8+ buttons, dense, no clear hierarchy

### Handoff (`du-nav`)
- Brand mark (filled purple "M" tile) + "Math Quest" wordmark
- 5 icon nav links: **Learn / Skills / Builder / Play / Stats**
- Right side: streak pill (🔥 7), gems pill (💎 240), hearts pill (❤️ 5)
- Teacher / Student segmented toggle
- Avatar circle

### Gap
- Brand mark missing — needs the rounded purple square with "M"
- 5 nav links missing entirely — would be the primary navigation primitive
- Pills (streak/gems/hearts) absent — gamification stats are inside the body banner, not the nav
- Avatar missing
- Live nav has many more affordances (MAP, Adaptive, Theme, Voice, Pop-ups) that have no handoff counterpart — these need to live somewhere (nested menu or settings panel)

### Verdict
Full rebuild required. Live nav is functionally over-loaded; handoff nav is minimal. Reconcile by moving overflow into a "more" menu / settings panel.

---

## 3. Home / Learn view

### Live (`#homeView`, `index.html:250–749`)
Vertical stack:
1. "Start Your Adventure!" gradient title
2. ⚙️ Game Setup — search bar, teacher dropdowns, skill queue, share settings, action buttons (Practice/Boss/Race/Worksheet/Print)
3. Grade-level chip row
4. Quick Start grid (student) with Review/+/Edit buttons, dashed-border edit panel
5. Compact settings row: Max Number / Decimals / Voice / Timer / Problems
6. Number selection grid (× and ÷ tables 1–12)
7. Divisibility rules grid
8. 🎮 Choose Mode — 5 mode-cards (Practice / Boss / Race / Worksheet / Print Worksheet)
9. Start Game button (huge green gradient) + MAP buttons + Dashboard
10. Help links footer

### Handoff (`du-home`)
3-column grid `240px | 1fr | 320px`:
- **Left rail** — "CHOOSE A UNIT" eyebrow, then 5 unit cards (`+`, `−`, `×`, `÷`, `½`) with operation pastel glyph tiles
- **Center path** — purple gradient panel with eyebrow "Unit 3 · Multiplication", h2 "Times tables to twelve", crown badge, then a winding trail of nodes (done = yellow star, now = white pulsing, locked = greyed, boss = orange) with a popover on the active node
- **Right rail** — Mascot card (pastel purple gradient with owl-rocket SVG + speech bubble + Start lesson button) / Day streak card with weekday dots / Game mode 2×2 grid (Practice / Boss / Race / Worksheet)

### Gap (it's almost everything)
- Left "unit rail" doesn't exist — closest analog is the domain dropdown buried in settings panel
- Center "learning path with nodes" doesn't exist — there's no concept of progression along a path; Quick Start is a flat grid of skill cards
- Mascot doesn't exist (no character anywhere in MathQuest)
- Streak card with day-of-week dots — exists in the player banner but not on home
- Game mode 2×2 grid exists but as 5 inline mode-cards, not 2×2 with icon tiles
- The handoff intentionally omits: search bar, teacher dropdowns, share settings, weighted-skill queue, grade chips, custom range/decimals/timer/problem-count, divisibility rules, MAP buttons

### Verdict
Two paths:
- **Conservative:** keep existing dense layout, restyle each section with handoff tokens and chunky-shadow cards. Small visual win, low risk.
- **Aggressive:** rebuild home around the 3-column path concept. Move teacher controls to a separate "Builder" view (already exists conceptually). Move advanced settings to a slide-out panel. Big visual win, high risk because Quick Start / game-setup flows are deeply wired.

---

## 4. Skills view

### Live: Skills Navigator (`#skillsOrganizerView`, `index.html:881–965`)
- Header: ← Back, "Skills Navigator", + Add Visible / − Deselect Visible buttons, count badge
- Filter bar: domain pills, category select, grade pills, search input
- 2-panel content: skill grid (left, large) + queue panel (right) with action bar (Practice/Boss/Race/Worksheet/Print/Share/Code/Quiz/Clear)

### Handoff (`du-skills`)
2-column grid `240px | 1fr`:
- **Left side**: "BY GRADE" eyebrow, then 6 grade cards (K, 1, 2, 3, 4, 5) with skill-count pill on each
- **Right main**: h2 "Grade 3 skills" with purple "skills" word, meta line ("32 skills · 18 mastered · 9 in progress · 5 locked"), then a stack of "strands" — each strand is a card with header (color tile + name + skill-count + percent) and a 2-column grid of skill rows (status dot + name + mastery %)

### Gap
- Filter approach differs: live has multi-pill filters across domains/grades/categories; handoff has single grade-only sidebar
- Live shows skills as a flat grid of cards; handoff groups skills into strands with mastery rollups
- Live has no per-strand percentage rollup, no per-skill mastery percentage badge
- Handoff has no queue / share / quiz action bar
- Handoff has no category filter, no search

### Verdict
Hybrid: keep filters and queue as-is (functionally critical), but adopt the **strand grouping with mastery rollups** as the primary skill display, replacing the flat grid. Use handoff card style.

---

## 5. Quiz Builder view

### Live (`#quizBuilderView`, `index.html:968–1064`)
- "My Quizzes" list mode (toggle) — list of quizzes with New/Import/Back
- Builder mode: header with quiz name input + Save button
- Filter bar (same as Skills Navigator)
- 3-panel content: skill grid (left), preview panel (middle), question list (right)
- Bottom toolbar: Settings / Share / Print / Export / Results
- Settings overlay modal

### Handoff (`du-builder`)
2-column grid `1fr | 360px`:
- **Left main** (white card with chunky shadow): h2 "Quiz Builder", meta, two rows of form fields (Quiz title / Grade band, Question count / Time limit), then "Questions · 10" label + a vertical list of question rows (Q01, equation, ×/÷ tag chip, X delete button)
- **Right side** (purple gradient panel): h3 "Summary", then 5 rows (Skills / Time est. / Difficulty / Format / Assigned), then bottom buttons "Launch live game" (orange) + "Save as worksheet" (ghost on purple)

### Gap
- 3-panel skill picker (grid + preview + question list) collapses to single question list in handoff
- Filter bar absent in handoff
- Bottom toolbar (Settings/Share/Print/Export/Results) collapses to 2 buttons in handoff side
- Handoff has a much cleaner "form-driven" look — title, grade band, count, time as proper inputs
- Live has no notion of "Assigned Class" — the handoff shows "Class 3B" which would need a class system

### Verdict
Adopt the handoff's **clean form layout + summary side panel** styling. Keep the 3-panel skill picker as an optional collapsible section. The "Assigned" row needs to be marked TODO or hidden.

---

## 6. Play / Game view

### Live (`#gameView`, `index.html:751–827`)
- Game header: 🏠 Exit + score + topic
- Skill progress bar (shows mastery progress)
- Timer container
- Boss/race UI containers (toggle by mode)
- Q-dots row (per-question correct/incorrect/skipped)
- Question card (white): Q1 number + skill pill, visual-aid div, question text, answer-options OR answer-input-area, feedback-area, action buttons (Hint/Read/Calc/Solution/Skip), Next button

### Handoff (`du-game`)
- **Top bar** (white, full-width): X close button | thick green gradient progress bar | hearts (❤️ 5)
- **Stage** (white):
  - Eyebrow "Question 4 of 10 · ×7s"
  - Equation: "7 × 8 = `[ ? ]`" — 78px display font with 6px-underline blank
  - Sub: "Tap the correct answer" (muted)
  - 2×2 choice grid: each `.du-choice` is a 28px-font card with key letter pill (A/B/C/D), 2px border, chunky 4px shadow, green/red on correct/wrong
- **Bottom feedback strip** (full-width, color-coded): "Tap an answer to check" idle → "Nice! That's correct." green strip → "Not quite — the answer is 56." red strip — with "Continue / Got it / Check" CTA on the right

### Gap (this is the most visible end-user gap)
- Equation display style — handoff uses huge display font with literal blanks; live uses `.question-text` which is plain
- Choice cards — handoff has 2×2 grid with letter keys + chunky cards; live uses simple buttons in `.answer-options`
- Bottom feedback strip — handoff uses a fixed bottom bar with feedback + CTA; live uses an inline feedback area + separate Next button
- Top bar — live has score/topic header; handoff has X / progress / hearts (cleaner)
- Live has many extras (Hint/Read/Calc/Solution/Skip, skill progress bar, q-dots, boss arena, race track) not in handoff

### Verdict
Adopt the **top bar** (X / progress / hearts), **equation styling** (big display font + blank), **choice grid** (2×2 with letter keys), and **bottom feedback strip** wholesale. Keep extra controls (Hint/Read/Skip) — move them into a secondary toolbar above the feedback strip. Boss arena and race track remain mode-specific and need a separate restyle pass.

---

## 7. Stats / Dashboard view

### Live (`#dashboardView`, `index.html:848–878`)
- Game header: 🏠 Back + "Dashboard"
- Section: Session History — date filter pills (Today/Week/Month), table
- Section: Streak Calendar — 7-column grid of day blobs
- Section: Badges — flex-wrap of badge cards
- Section: Daily Stats History

### Handoff (`du-dash`)
- h2 "Class 3B · This week" + sub line
- KPI row: 4 stat cards (Class average / Quests done / Avg time / Mastered) — large 36px number with delta arrow (▲ 4 pts vs last week)
- 2-column grid `1.6fr | 1fr`:
  - Left card: "Mastery over time" — area-fill SVG line chart with grid lines and last-point dot
  - Right card: "Top of class" — striped roster rows (avatar / name / pct / trend chip)

### Gap
- KPI row missing (live has no top-line KPI cards)
- Mastery over time chart missing
- Roster missing — live is single-user; the handoff implies multi-student class (which is a feature gap, not just a UI gap)
- Streak Calendar exists in live but not on handoff Stats screen (handoff puts streak on Home)
- Badges exist in live but not on handoff

### Verdict
The handoff "Stats" is a **teacher class dashboard**. The live "Dashboard" is a **personal session history**. These serve different audiences. Recommend: keep live Dashboard as the personal one for students, add the handoff KPI/chart styling, defer the roster (no class system yet).

---

## 8. Views with no handoff counterpart

These views exist live but have no design in the handoff. Apply tokens + button/card styling only:
- Worksheet view (`#worksheetView`)
- Quiz Take view (`#quizTakeView`) — student-facing quiz play
- Quiz Results view (`#quizResultsView`)
- Learning Stats view (`#learningStatsView`)
- MAP Selector / MAP Game views (`#mapSelectorView`, etc.)
- Settings Panel slide-out
- All modals (celebration, hint popup, share, code, etc.)

For these: token swap + card-shadow/button-style refresh. No structural changes.

---

## 9. Phasing recommendation

| Phase | Scope | Risk | What it touches |
|---|---|---|---|
| **A** | Add handoff tokens to `variables.css` (alongside existing) | low | `css/variables.css` only |
| **B** | Restyle global buttons + cards in `ui-components.css` to chunky-shadow style | medium | `css/ui-components.css` |
| **C** | Rebuild top nav | medium | `index.html`, `css/role-toggle.css` (or new `css/nav.css`) |
| **D** | Restyle Home — conservative pass (token swap + card style on existing layout) | medium | `index.html` home view, multiple CSS files |
| **E** | Restyle Game (Play) — adopt top bar / equation / choice grid / feedback strip | high | `index.html`, `js/modules/question-render.js`, `js/modules/answer-check.js`, `css/ui-components.css` |
| **F** | Restyle Skills Navigator — strand grouping with mastery rollups | high | `js/modules/skills-organizer.js`, `css/skills-organizer.css` |
| **G** | Restyle Quiz Builder — form layout + summary side panel | medium | `js/modules/quiz-builder.js`, `css/quiz-mode.css` |
| **H** | Restyle Dashboard — KPI cards + mastery chart | medium | `js/modules/dashboard.js`, `css/ui-components.css` |
| **I** | Restyle remaining views (Worksheet / MAP / Quiz Take / Quiz Results / Learning Stats) — token + card pass only | low | various |
| **J** | Mascot SVG — add character to home and post-correct celebrations | low | `index.html`, new `js/modules/mascot.js` |

Total LOC affected: ~17,000 across CSS + ~5,000 across JS render functions + index.html. Multi-day effort.

---

## 10. Open questions for the user

1. **Layout philosophy** — should home stay information-dense (current) or simplify to handoff's 3-pane learning path? The latter requires hiding/relocating teacher controls, range/decimals/timer settings, MAP buttons, divisibility rules.
2. **Multi-student class** — the handoff Stats view assumes a class system (Class 3B, roster). MathQuest is single-user. Skip this section, or stub it?
3. **Mascot** — adopt the owl-rocket SVG character? Where (home only, or also post-correct celebrations)?
4. **Dark mode** — the handoff has a `data-mode="dark"` attribute hook but no dark-mode CSS. Live has full dark mode. Do we keep the live dark palette and just remap the new tokens, or design new dark tokens?
5. **Hearts / lives** — handoff shows hearts (❤️ 5). MathQuest has no lives system. Add it, or hide that pill?
