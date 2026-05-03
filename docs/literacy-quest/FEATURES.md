# Literacy Quest — Feature Map

**Version:** Phase 1  
**Last updated:** 2026-05-03  
**Status:** Authoritative specification. Downstream documents (build plans, sprint tickets) must reference this file.

---

## 1. Overview

Literacy Quest is a subject expansion of Math Quest that adds Reading and Language practice without touching the existing Math Quest codebase. It is gated behind a single feature flag (`FEATURES.LITERACY_QUEST_ENABLED` in `js/modules/shared/quest-core/features.js`) that defaults to `false`. When the flag is off, the app behaves exactly as Math Quest today.

### Three Modes

| Mode | Description |
|---|---|
| **Grade-Level Skills** | Student picks a subject (Reading or Language), a grade (K-5), and a skill. A practice session is generated: warm-up card, N items drawn from the skill's generator, mastery report. Mirrors Math Quest's standard practice flow. |
| **MAP Quest** | Three adaptive test variants (Reading K-2 / Reading 2-5 / Language Usage 2-12). 43-item sessions using a Rasch 1PL engine. RIT band selected manually (no placement test). Results show RIT estimate, percentile, and per-domain breakdown. |
| **Dashboard** | Per-skill, per-domain, and per-RIT-band progress. Session history. Spaced-review queue. Extends the existing `dashboard.js` pattern. |

### Three Subjects

| Subject | Status |
|---|---|
| **Math** | Unchanged. All existing Math Quest features, modules, and data are untouched. |
| **Reading** | New. Phonics, Phonemic Awareness, Fluency, Vocabulary, Comprehension (Literary + Informational). K-5 grade bands. Ties to Reading K-2 and Reading 2-5 MAP variants. |
| **Language** | New. Grammar, Sentence Structure, Mechanics, Writing. Grades 2-5. Ties to Language Usage 2-12 MAP variant. |

### Feature-Flag Gating

```js
// js/modules/shared/quest-core/features.js
export const FEATURES = {
    LITERACY_QUEST_ENABLED: false,
};
```

Every literacy view, route, CSS import, and data file is conditioned on this flag. When `false`, no literacy modules are fetched, the Quest Hub button does not appear, and `goHome()` routes normally. Flipping to `true` unlocks the full expansion on the `literacy-quest-expansion` branch.

---

## 2. Grade-Level Skills Mode (Reading and Language)

### 2.1 Subject + Grade Selector

**What it is.** On entry to `readingHomeView` or `languageHomeView`, the student picks a grade (K, 1, 2, 3, 4, 5). The selection sets `state.literacyGrade` and filters the skill index to grade-appropriate atoms. Defaults to the last-used grade stored in cookie `mathquest_literacy_settings`.

**Math Quest integration.** Extends `category-dropdowns.js` pattern: a compact grade-pill grid (K through 5, styled like Math Quest's number-selection grid) instead of a domain/category dropdown chain. No new navigation pattern needed.

**ELL/SPED scaffold.** ELL toggle auto-selects audio-default ON; grade selector surfaces a "1.5x time" label when SPED is active so the student sees the accommodation. Both toggles persist in cookie.

| Priority | Stage |
|---|---|
| Core selector | Stage 1 (MVP) |
| Last-grade persistence | Stage 1 |
| ELL/SPED label in selector | Stage 2 |

---

### 2.2 Skill Index with Progress Indicators

**What it is.** A scrollable grid of skill cards for the selected grade and subject. Each card shows: skill label, CCSS code, RIT band, and a small progress ring (not started / introducing / developing / mastered) drawn from `StudentProgress.mastery_level`. Cards with due spaced-review items show a clock badge.

**Math Quest integration.** Extends `skills-organizer.js` pattern. The literacy skill library (`/data/literacy-skills/<strand>/<domain>.js`) exports `SkillAtom[]` arrays. The skill index builder reads `SkillAtom.developmental_band` and `SkillAtom.ccss_codes` to populate filter chips (same pattern as Math Quest's domain/grade filter in the Skills Navigator).

**ELL/SPED scaffold.** When ELL is active, skill cards for strands with L1 cognate support show a small flag icon. Accessibility filter toggles (per §4.6) can hide skills above the student's current mastery ceiling.

| Priority | Stage |
|---|---|
| Basic grid, progress ring | Stage 1 |
| Spaced-review badge | Stage 2 |
| Accessibility filter toggles | Stage 2 |

---

### 2.3 Skill Detail Page

**What it is.** A slide-in panel (or dedicated view) for a selected skill. Shows: skill statement, CCSS codes, RIT band, IXL skill links, Science of Reading citations, prerequisite chain (with mastery status for each prerequisite), and a "Start Practice" button.

**Math Quest integration.** Pattern mirrors the Skills Navigator's 1.5-second hover preview panel in `skills-organizer.js`. A "Skill Detail" button on each skill card triggers `showView('skillDetailView')` with the atom pre-loaded.

**ELL/SPED scaffold.** Displays `SkillAtom.ell_scaffold` and `SkillAtom.sped_scaffold` as expandable accordion rows beneath the description — visible only when the respective toggle is active.

**Note on diagnostic anchor.** The `diagnostic_anchor` field (e.g., "UFLI Placement Test Set 1") is kept as data-only for now and not surfaced in the UI. Teacher-facing exposure is deferred to Stage 3 pending user confirmation (see §8).

| Priority | Stage |
|---|---|
| Statement, CCSS, RIT, IXL links | Stage 1 |
| Prerequisite chain with mastery status | Stage 2 |
| SoR citations, diagnostic anchor (optional) | Stage 3 |

---

### 2.4 Practice Session: Warm-up, Items, Mastery Report

**What it is.** A structured session:

1. **Warm-up card** — one errorless intro item (simplest mechanic for the skill) to orient the student.
2. **N items** — drawn from the skill's generator (`gen-phonics.js`, `gen-mechanics.js`, etc.) using the variety rule (≥ 3 mechanics per 10-card window). Default 10 items; SPED cap is 5-8.
3. **Mastery report card** — shows score, accuracy, whether mastery threshold was met (≥ 85%), and the spaced-review schedule if mastered.

**Math Quest integration.** Session loop reuses `game-control.js` (`nextQuestion()` → `generateLiteracyQuestion()` → render → check) with `state.subject = "reading"` or `"language"` as the discriminator. The existing XP banner, on-task timer, inactivity modal, and tab-switch detection all carry over without modification.

**ELL/SPED scaffold.** SPED: session capped at 5-8 items (`state.literacySpedScaffold` sets `state.questionCount = 5`). ELL: `state.ttsEnabled = true` forced; pacing multiplied 1.5x via the on-task timer's per-question timeout.

| Priority | Stage |
|---|---|
| Session loop, warm-up card, mastery report | Stage 1 |
| SPED item cap, ELL pacing | Stage 1 |

---

### 2.5 Multiple Game Types per Skill

**What it is.** Literacy skills are playable in all game modes Math Quest already supports: Practice (standard), Boss Battle, and Car Race. The game mode selector card grid on `readingHomeView` / `languageHomeView` mirrors `mode-selection.js`.

**Math Quest integration.** `boss-race.js` and the boss battle / car race rendering in `game-control.js` are reused unchanged. `state.subject` discriminates the question generator called in `nextQuestion()`. No new game mode infrastructure is needed.

**ELL/SPED scaffold.** Boss Battle and Car Race are not recommended for SPED students (time pressure conflicts with 2x response time accommodation). When `state.literacySpedScaffold` is true, the mode selector greys out timed modes with a tooltip: "Practice mode recommended for your settings."

| Priority | Stage |
|---|---|
| Practice mode | Stage 1 |
| Boss Battle + Car Race modes | Stage 2 |

---

### 2.6 Audio-First Toggle

**What it is.** A speaker button in the session chrome toggles Web Speech API TTS on/off. Default ON for K-2 (`state.literacyGrade` in `['K','1','2']`); default ON for all grades when ELL is active. Resets to default each new session (matching Math Quest's existing TTS behavior). Mid-session toggle persists only for that session.

**Math Quest integration.** Reuses `hints-speech.js` (`speakQuestion`, `speakAnswerOption`, `stopSpeaking`, voice warming). No new TTS infrastructure. `state.ttsEnabled` is the shared flag already used by Math Quest's TTS toggle.

**ELL/SPED scaffold.** ELL mode forces `state.ttsEnabled = true` on session start and disables the toggle button (audio is non-negotiable for ELL accommodation).

| Priority | Stage |
|---|---|
| Toggle, voice warming, K-2 auto-speak | Stage 1 |
| ELL forced-on lock | Stage 1 |

---

### 2.7 Hint and "Show Me How"

**What it is.** The hint button (already present in `game-control.js`) shows progressive hints drawn from `Question.hints[]`. A "Show Me How" button triggers a step-by-step worked example using the question's `SkillAtom.sor_citations` as the instructional reference. For phonics items, "Show Me How" renders a sound-box segmentation walkthrough.

**Math Quest integration.** Extends `hints-speech.js`. The existing `showHint()` function is called with the literacy question's `hints[0]`, `hints[1]` etc. "Show Me How" is a new button in the literacy session chrome that calls a new `showLiteracyWorkedExample(skillId)` function in `literacy-answer-check.js`.

| Priority | Stage |
|---|---|
| Progressive hints (hints[]) | Stage 1 |
| "Show Me How" worked example | Stage 2 |

---

### 2.8 Mastery Tracking and Badges

**What it is.** Per-skill mastery is tracked across sessions in `localStorage["mathquest_literacy_progress"]` using the `StudentProgress` schema. Two thresholds:

- **< 70% accuracy** — skill stays in errorless intro mechanics (MC with one obvious correct).
- **70-84%** — graduated to harder mechanics (FIB, multi-select, drag-and-drop).
- **≥ 85% across 2 consecutive sessions** — mastered; spaced review starts (1d → 3d → 7d → 14d → 30d).

Mastery triggers a badge from the existing gamification system. New literacy-specific badges (e.g., "Phonics Star", "Grammar Detective") are added to `gamification.js`'s badge registry as named additions, not replacements.

**Math Quest integration.** `progress.js` mastery logic is extended with the two-threshold model. `gamification.js` badge registry gets new literacy badge entries (same `awardXP` and badge-celebration modal pipeline).

| Priority | Stage |
|---|---|
| Two-threshold mastery logic | Stage 1 |
| Spaced review queue | Stage 2 |
| Literacy-specific badges | Stage 2 |

---

### 2.9 Deck-Style Navigation (Previous / X of N / Next)

**What it is.** Persistent bottom chrome on every practice card: a "Previous" button (returns to the prior card in review mode, does not re-score), a centered "X of N" counter, and a "Next" / "Check" button. Matches the visual baseline from the example images (Image 8 specifically). The counter increments on each card advance.

**Math Quest integration.** The existing `game-control.js` question counter (`state.questionIndex` / `state.questionCount`) drives the X of N display. A "Previous" button is added to `gameView` for literacy sessions only (when `state.subject !== "math"`), calling a new `goToPreviousQuestion()` function that replays the prior question object from `state.questionHistory` in review mode.

| Priority | Stage |
|---|---|
| X of N counter, Next/Check | Stage 1 |
| Previous button (review mode) | Stage 1 |

---

### 2.10 The Variety Rule Loader

**What it is.** The deck-composition engine enforces ≥ 3 distinct mechanics per 10-card window for all non-fluency-drill skills. It reads `SkillAtom.question_types` (minimum 3 required per atom) and cycles through mechanics using the `buildDeckMechanics(skill, count)` function defined in `DATA_MODEL.md §12`, ensuring no mechanic repeats within a 3-card window.

**Math Quest integration.** The deck loader runs inside `generateLiteracyQuestion()` in `generate-literacy-question.js` — the literacy dispatcher (mirrors `generate-question.js`). The variety check is a pre-generation step: the dispatcher builds a `mechanicSequence[]` array for the session, then picks the next mechanic from that sequence on each call.

| Priority | Stage |
|---|---|
| Mechanic sequencing, 3-card no-repeat window | Stage 1 |
| Fluency drill exception (repetition intentional) | Stage 1 |

---

## 3. MAP Quest Mode (Three Variants)

### 3.1 Test Selector

**What it is.** On the MAP Quest entry screen, a three-card selector presents the three test variants:

| Variant | Grades | Audio default | Item sets |
|---|---|---|---|
| Reading K-2 | K-2 | ON (mandatory) | No (single items) |
| Reading 2-5 | 2-5 | OFF (accommodation) | Yes — dominant format |
| Language Usage 2-12 | 2-12 | OFF | No |

The appropriate variant is pre-suggested based on `state.literacyGrade`, but the teacher can override. For the RIT 170-200 overlap zone (Grade 2), both Reading K-2 and Reading 2-5 cards are highlighted with a "Recommended" badge; the teacher makes the final call. `state.mapVariant` is set before routing to `mapView`.

| Priority | Stage |
|---|---|
| Three-card selector, grade pre-suggestion | Stage 2 |

---

### 3.2 RIT Band Manual Selector

**What it is.** No placement test (per PHASE_0_DECISIONS §8). The student or teacher picks a RIT band from a dropdown (e.g., "171-180", "181-190") before starting a MAP session. Sensible defaults are shown from the 2025 NWEA norms for the selected grade and current season. `state.literacyRitBand` is set from this selection.

**Math Quest integration.** Mirrors Math Quest's number-range selector (`number-selection.js` compact grid pattern). The RIT band picker is a compact pill grid with grade-level defaults highlighted.

| Priority | Stage |
|---|---|
| RIT band picker, 2025 norm defaults | Stage 2 |

---

### 3.3 Adaptive Rasch-Based Item Selection

**What it is.** `map-engine-literacy.js` implements the Rasch 1PL adaptive algorithm ported directly from Math Quest's `map-engine.js`:

```
P(correct | θ, b) = 1 / (1 + exp(-(θ - b)))
θ_new = θ_old + learning_rate × (response - P(correct | θ_old, b))
```

Additions over the math engine: per-instructional-area balance enforcement (30/30/25/15 for Reading 2-5; 40/30/30 for Language Usage), EISA 2025-26 grade-level weighting (2:1 toward grade-level items when student θ is within 5 RIT of grade mean), and item-set passage anchoring (next 2-4 items locked to the same `passageId` when a passage item is drawn).

| Priority | Stage |
|---|---|
| Core Rasch engine port | Stage 2 |
| Per-area balance, EISA weighting | Stage 2 |
| Passage anchoring | Stage 2 |

---

### 3.4 Passage Rendering with Line and Paragraph Numbers

**What it is.** `passage-render.js` tokenizes each passage on first load, wrapping every word, sentence, and paragraph in addressable `<span>` elements (`data-word`, `data-sentence`, `data-paragraph`). Line number overlays are injected as absolutely-positioned spans for RIT 191+ citation items. The tokenized DOM is cached for the lifetime of the `PassageSession` so re-renders between items do not re-tokenize.

| Priority | Stage |
|---|---|
| Tokenizer, paragraph numbers | Stage 2 |
| Line number overlays (RIT 191+) | Stage 2 |

---

### 3.5 Item Set Support

**What it is.** `item-set-controller.js` manages a `PassageSession` object: one passage, 3-5 items, anti-spoiler sequencing, and shared tokenization state. The passage is displayed persistently (left panel or top panel on mobile) while items navigate beneath. `state.passageSession` holds the live session; on completion, the session is pushed to `state.questionHistory` and `state.passageSession` is cleared to null.

**Math Quest integration.** This is the largest architectural departure from Math Quest's one-question-discard model. `literacy-question-render.js` checks `state.passageSession` and branches between single-question rendering and passage-plus-item rendering. All other session machinery (timer, XP, banner) continues unchanged.

| Priority | Stage |
|---|---|
| PassageSession class, anti-spoiler sort | Stage 2 |
| Split-panel passage + item rendering | Stage 2 |
| Multi-passage sessions (sequential passages) | Stage 3 |

---

### 3.6 On-Screen Tools

**What it is.** Accommodation tools available during MAP sessions:

| Tool | Availability | Description |
|---|---|---|
| **Line reader** | All variants | Semi-opaque horizontal mask; draggable vertically; arrow keys move it one line |
| **Highlighter** | Reading 2-5, RIT 191+ | Student can mark passage text in yellow; marks persist across items in the same `PassageSession` |
| **Dictionary lookup** | All variants (accommodation) | Tap a word → tooltip shows a brief definition via a bundled word list; no network call |

**Math Quest integration.** Line reader and font scaling tools are new additions to the literacy session chrome (built in `literacy-question-render.js`). The highlighter uses `data-word` span attributes from `passage-render.js`. Dictionary lookup uses a bundled Tier 2 / academic vocabulary JSON file, not an API.

| Priority | Stage |
|---|---|
| Line reader | Stage 2 |
| Highlighter (RIT 191+) | Stage 2 |
| Dictionary lookup | Stage 3 |

---

### 3.7 Practice Test Mode (43-item Simulation)

**What it is.** A full simulated MAP test: 43 scored items plus a 5-10% field-test buffer (unscored items interspersed at random positions). Stopping rule is item count, not a confidence interval. Instructional area proportions are enforced throughout. On completion, a results screen shows estimated RIT, percentile, per-domain breakdown, and a "Review Answers" option.

| Priority | Stage |
|---|---|
| 43-item session, field-test buffer | Stage 2 |
| Results screen, per-domain breakdown | Stage 2 |

---

### 3.8 Quick Practice Mode (10-item Targeted Practice)

**What it is.** A 10-item adaptive session targeted to one RIT band or one instructional area. Useful for focused reinforcement without the full 43-item commitment. Stops after 10 items; shows a brief accuracy + RIT delta summary. Defaults to the student's last RIT band from their stored history.

| Priority | Stage |
|---|---|
| 10-item quick session | Stage 2 |

---

### 3.9 RIT Estimate Display and History

**What it is.** After each MAP session, the resulting RIT estimate and session date are appended to `localStorage["mathquest_literacy_session_history"]` (`MapResult[]`). The literacy dashboard shows a simple line chart of RIT over time, per test variant, alongside a progress-toward-grade-level indicator.

**Math Quest integration.** Extends `dashboard.js`. The existing session history list component is reused; the RIT chart is a new SVG drawn by `literacy-dashboard.js`.

| Priority | Stage |
|---|---|
| RIT storage, history list | Stage 2 |
| RIT line chart in dashboard | Stage 3 |

---

### 3.10 Per-Domain RIT Breakdown

**What it is.** After a MAP session, `MapResult.area_breakdown` holds per-instructional-area RIT estimates. The results screen renders these as a simple pie or bar chart: Literary / Informational / Vocabulary / Cross-cutting for Reading 2-5; Grammar / Mechanics / Writing for Language Usage.

**Math Quest integration.** New SVG chart rendered inline in the results screen by `literacy-dashboard.js`. No external chart library needed.

| Priority | Stage |
|---|---|
| Area breakdown chart | Stage 2 |

---

### 3.11 Recommended Next Skills

**What it is.** After a session, the results screen shows 2-3 skill recommendations drawn from the `SkillAtom.next_skill_ids` graph for skills approaching mastery, and from `SkillAtom.prerequisite_skill_ids` for skills below 70% accuracy. Each recommendation card shows a "Practice Now" shortcut.

**Math Quest integration.** DAG traversal runs in `literacy-dashboard.js` using the `prerequisite_skill_ids` and `next_skill_ids` arrays on each `SkillAtom`.

| Priority | Stage |
|---|---|
| Recommended next skills cards | Stage 3 |

---

### 3.12 2025 NWEA Norms Percentile Lookup

**What it is.** `NWEA_NORMS_2025` (a const in `map-engine-literacy.js`) provides grade × season → {mean, sd} for Reading K-8 and Language Usage 2-11. Percentile is computed as `Φ((student_rit - norm.mean) / norm.sd) × 100`. The dashboard shows "X percentile for Grade Y in Z season" alongside the raw RIT.

| Priority | Stage |
|---|---|
| Percentile computation, display | Stage 2 |

---

## 4. Cross-Cutting Features

### 4.1 Web Speech API Audio

**What it is.** All TTS uses the existing `hints-speech.js` module without modification. Functions reused: `speakQuestion()`, `speakAnswerOption(text)`, `stopSpeaking()`, voice warming (pre-speak empty string on session start to prevent first-speak stall). Default ON each session per Math Quest's existing pattern; resets each new session; user-togglable mid-session.

K-2 content: audio auto-speaks the stem on card load. 2-5 content: audio is a per-element tap affordance (small orange speaker icon on each text element). ELL mode: forces audio ON and locks the toggle.

| Priority | Stage |
|---|---|
| Reuse hints-speech.js, K-2 auto-speak, per-element buttons | Stage 1 |
| ELL forced-ON lock | Stage 1 |

---

### 4.2 Custom Play Settings

These settings use Boom's verbatim labels. Teachers will look for these exact terms.

| Setting | What it does | Implementation |
|---|---|---|
| **Shuffle cards** | Randomizes item order within a deck before session start | `shuffle(mechanicSequence)` on deck load |
| **Limit cards** | Sets a maximum deck size (N items) regardless of skill default | Sets `state.questionCount = N` |
| **Limit attempts** | Maximum incorrect attempts per card before auto-advance | Sets `state.literacyMaxAttempts = N` per card |
| **Show answers** | On surrender (max attempts reached), reveals the correct answer | Calls `showCorrectAnswer()` on attempt exhaustion |
| **Hide cards** | Excludes specific skill IDs from the current deck | Pre-filters `question_types[]` before deck build |

**Implementation.** A "Literacy Play Settings" section is added to the existing settings panel (`settings-panel.js`). The settings are persisted in cookie `mathquest_literacy_settings`. The section header label is "Custom Play Settings" to match the Boom terminology teachers already know.

| Priority | Stage |
|---|---|
| All five Custom Play Settings | Stage 2 |

---

### 4.3 Open-Response Queue with Purple Speech Bubble

**What it is.** Items using the `open-response-fib` widget (Stage 3) cannot be auto-graded. When a student submits one, it is flagged `grading_status: "pending"` in the session record. The teacher dashboard shows a "Needs Grading" section listing all pending items from the current session, each with a **purple speech bubble badge** (`class="pending-grading"`) — the visual indicator pattern used by Boom for this purpose. The teacher selects Correct / Partial / Incorrect; the score is retroactively logged.

**Scope limitation (no roster).** Because Literacy Quest is anonymous (no login, no roster — PHASE_0_DECISIONS §7), the grading queue is scoped to the current browser session only. There is no cross-student aggregation. This is a deliberate UX trade-off: single-user, single-browser grading is the maximum scope without a roster system.

**Voice Memo is dropped** (PHASE_0_DECISIONS §4). `ink-draw` (Stage 4) will use the same queue when built.

| Priority | Stage |
|---|---|
| Grading queue, purple speech bubble badge | Stage 3 |
| Session-scoped only (no roster) | Stage 3 |

---

### 4.4 Reports

**What it is.** Per-card accuracy, attempt count, fastest correct response time, session timeline, and answer-choice log — all per session. Visible in the literacy dashboard. CSV export via a "Download Report" button.

Per-card record shape:
```
card_id, skill_id, question_type, correct (bool), attempts,
fastest_correct_ms, student_answer, correct_answer, timestamp
```

**Math Quest integration.** Extends `dashboard.js`. The existing session history infrastructure provides the container; `literacy-dashboard.js` adds per-card detail rows and the CSV serializer. The CSV export button uses `Blob` + `URL.createObjectURL` (no server needed).

**This is the teacher-adoption feature.** Reports ship in Stage 1, not Stage 3.

| Priority | Stage |
|---|---|
| Per-card accuracy, attempts, fastest time, answer log | **Stage 1** |
| Session timeline chart | Stage 2 |
| CSV export | Stage 2 |

---

### 4.5 Accessibility Primitives

All widgets implement these primitives. They are enforced at the widget contract level, not optional.

| Primitive | Implementation | Stage |
|---|---|---|
| ALT text on all images | Every `<img>` has non-empty `alt`; decorative images use `alt=""` + `role="presentation"` | Stage 1 |
| Screen-reader Z-order | DOM order matches visual reading order; no `tabindex > 1` | Stage 1 |
| Keyboard navigation | Tab / Shift+Tab, Enter/Space, arrow keys; Escape cancels drag | Stage 1 |
| Switch device support | Full Tab / Shift+Tab traversal; no mouse-only interactions | Stage 1 |
| `aria-live` announcements | `polite` on feedback zones; `assertive` for correct/incorrect | Stage 1 |
| Minimum tap targets | 60×60 px (K-2), 44×44 px (2-5) | Stage 1 |
| OpenDyslexic font toggle | CSS class `font-dyslexic` on `<html>`; loaded from CDN; persisted in `localStorage["lq_font_dyslexic"]` | Stage 2 |
| High-contrast mode | CSS variable set `--lq-hc-*`; class `theme-high-contrast`; persisted in `localStorage["lq_high_contrast"]` | Stage 2 |
| Line reader | Draggable semi-opaque mask over passage; arrow-key movement | Stage 2 |
| Font size scaling | 4 levels (50/100/150/200%) via `--lq-font-scale`; persisted in `localStorage["lq_font_scale"]` | Stage 2 |
| Accessibility filter toggles in skill library | Filter skill grid by ELL-ready / SPED-ready / audio-required | Stage 3 |

---

### 4.6 ELL/SPED Differentiation Toggle

**What it is.** A first-class UI element in the session chrome and in settings — not a buried flag. Two toggle switches: **ELL** and **SPED**. Each activates a named scaffold layer.

**ELL on:** Arabic + Spanish L1 cognates shown beneath vocabulary items; audio autoplay on every card load; 1.5x pacing (on-task timer multiplied); sentence frames shown for `fib-auto` and `open-response-fib` items. Stored in `state.literacyEllScaffold` and cookie `mathquest_literacy_settings.ell_scaffold`.

**SPED on:** Elkonin boxes rendered on all phoneme-decoding items (via `sound-box` widget); session capped at 5-8 items; 3-attempt corrective feedback with explicit strategy cue before auto-advance; 2x response time in the on-task timer. Stored in `state.literacySpedScaffold` and cookie `mathquest_literacy_settings.sped_scaffold`.

Both toggles can be active simultaneously (a student who is both ELL and SPED gets all accommodations).

| Priority | Stage |
|---|---|
| ELL toggle: audio autoplay, 1.5x pacing | Stage 1 |
| SPED toggle: item cap, 3-attempt feedback, 2x time | Stage 1 |
| L1 cognates (Arabic + Spanish) | Stage 2 |
| Sentence frames | Stage 2 |
| Elkonin box auto-render on decoding items | Stage 2 |

---

### 4.7 Progress Dashboard

**What it is.** `literacyDashboardView` shows:
- Per-skill mastery cards (mastery level ring, last practiced date, spaced review due date)
- Per-domain accuracy bar (e.g., Phonics 87%, Vocabulary 62%)
- Per-RIT-band history (line chart of MAP session RIT estimates over time)
- Streak calendar (reuses existing `dashboard.js` streak calendar component)
- Session history list (last 50 sessions, newest first)

**Math Quest integration.** Built in `literacy-dashboard.js` as an extension of the existing `dashboard.js` pattern. New view `literacyDashboardView` added to `index.html`.

| Priority | Stage |
|---|---|
| Per-skill mastery cards, domain bar | Stage 1 |
| RIT band history chart | Stage 2 |
| Spaced-review queue display | Stage 2 |
| IEP-goal indicators (single-user, no roster) | Stage 3 |

---

### 4.8 PWA / Offline Support

Math Quest currently has no service worker. `index.html` is a static file served via GitHub Pages with no manifest or cache-control for offline use.

**Decision for Literacy Quest:** Do not add a service worker in Stage 1-3. The app is online-only. Offline support is deferred to Stage 4 when the full asset footprint (skill data files, widget modules, passage data) is stable enough to cache safely.

| Priority | Stage |
|---|---|
| Service worker + offline cache | Stage 4 (deferred) |

---

## 5. Stage-by-Stage Build Plan

| Stage | Features | Estimated Weeks |
|---|---|---|
| **Stage 1: MVP** | See below | 6-8 weeks |
| **Stage 2: Differentiation** | See below | 6-8 weeks |
| **Stage 3: High-Value** | See below | 4-6 weeks |
| **Stage 4: Differentiators** | See below | 6+ weeks |

### Stage 1 — MVP Launch (6-8 weeks)

Vertical slice proof first (see §7), then expand to full MVP.

| Feature | Module(s) |
|---|---|
| Quest Hub view with subject cards | `literacy-navigation.js`, `index.html` |
| `FEATURES.LITERACY_QUEST_ENABLED` flag | `features.js` |
| Subject + grade selector (Reading, Language) | `readingHomeView`, `languageHomeView` in `index.html` |
| Skill index grid (basic, no progress rings yet) | `literacy-navigation.js`, `/data/literacy-skills/` |
| Practice session loop (`state.subject` discriminator) | `game-control.js` extension, `generate-literacy-question.js` |
| Skill dispatcher + first two generators | `generate-literacy-question.js`, `gen-phonics.js`, `gen-mechanics.js` |
| Stage 1 widgets: `mc-text`, `mc-image`, `mc-multi-select`, `tap-hotspot`, `dnd-linked`, `fib-auto` | `/widgets/*.js` (6 modules) |
| Per-element audio (Web Speech API, `hints-speech.js` reuse) | `audio-primitives.js` |
| Deck-style nav (Previous / X of N / Next) | `game-control.js` extension |
| Variety rule loader (≥ 3 mechanics per 10-card window) | `generate-literacy-question.js` |
| Warm-up card, N-item session, mastery report card | `game-control.js`, `literacy-answer-check.js` |
| ELL/SPED toggle (audio-ON lock, item cap, 2x timer) | `state.js` extensions, session chrome |
| Basic mastery tracking (two thresholds: 70% / 85%) | `progress.js` extension, `StudentProgress` schema |
| Accessibility primitives (ALT text, keyboard nav, aria-live) | All widgets |
| Per-card reports: accuracy, attempts, fastest time, answer log | `literacy-dashboard.js` |
| `literacy-quest.css` (K-2 vs 2-5 button styles, card layout) | `/css/literacy-quest.css` |
| Skill detail page (statement, CCSS, RIT, IXL links) | Skill detail view in `index.html` |
| Phonics-first atom file (~first 30 atoms from `phonics.js`) | `/data/literacy-skills/reading/phonics.js` |
| Mechanics atom file (~first 20 atoms from `mechanics.js`) | `/data/literacy-skills/language/mechanics.js` |

---

### Stage 2 — Differentiation (6-8 weeks)

| Feature | Notes |
|---|---|
| Custom Play Settings (all 5, verbatim Boom names) | `settings-panel.js` literacy section |
| MAP Quest: test selector, RIT band picker, Rasch engine | `map-engine-literacy.js`, `mapView` variants |
| Passage rendering with line/paragraph numbers | `passage-render.js` |
| Item-set controller (PassageSession, anti-spoiler sort) | `item-set-controller.js` |
| MAP: practice test mode (43 items), quick practice (10 items) | `map-engine-literacy.js` |
| MAP: results screen, per-domain breakdown, percentile | `literacy-dashboard.js`, `NWEA_NORMS_2025` |
| RIT band history storage | `localStorage["mathquest_literacy_session_history"]` |
| Line reader, highlighter (RIT 191+) | Session chrome tools |
| Stage 2 widgets: `two-button-binary`, `sound-box`, `build-with-tiles`, `letter-tile-spell`, `word-tagger`, `hot-text-word`, `hot-text-sentence`, `drop-down-inline`, `sentence-build`, `sort-into-bins`, `match-pairs`, `sequence-events`, `dropdown-cloze` | 13 new widget modules |
| L1 cognates (Arabic + Spanish) | Vocabulary data layer |
| Sentence frames for FIB | `fib-auto.js` extension |
| Elkonin box auto-render | `gen-phonics.js` + `sound-box.js` |
| Spaced-review queue display in dashboard | `literacy-dashboard.js` |
| Session timeline chart | `literacy-dashboard.js` |
| CSV export | `literacy-dashboard.js` |
| OpenDyslexic font toggle, high-contrast mode, font scaling | `literacy-quest.css`, session chrome |
| Literacy-specific badges | `gamification.js` extension |
| Boss Battle + Car Race game modes for literacy | `boss-race.js` reuse |
| Prerequisite chain in skill detail page | `SkillAtom.prerequisite_skill_ids` DAG display |
| Progress rings on skill index cards | `literacy-navigation.js` |

---

### Stage 3 — High-Value (4-6 weeks)

| Feature | Notes |
|---|---|
| `open-response-fib` widget | `widgets/open-response-fib.js` |
| Manual grading queue with purple speech bubble | `literacy-dashboard.js` "Needs Grading" section |
| Stage 3 widgets: `hot-text-paragraph`, `passage-mc-set`, `passage-multi-select`, `passage-hot-text`, `claim-evidence`, `tap-to-reveal`, `chain-images` | 7 new widget modules |
| Multi-passage sessions (sequential passages back-to-back) | `item-set-controller.js` extension |
| MAP: RIT line chart in dashboard | `literacy-dashboard.js` SVG chart |
| Recommended next skills cards | DAG traversal in `literacy-dashboard.js` |
| SoR citations in skill detail page | Skill detail view |
| IEP-goal indicators (single-user, session-scoped) | `literacy-dashboard.js` |
| Accessibility filter toggles in skill library | `literacy-navigation.js` |
| Dictionary lookup (accommodation) | Bundled academic vocab JSON |

---

### Stage 4 — Differentiators (6+ weeks, future)

| Feature | Notes |
|---|---|
| Pre-rendered MP3 audio via AWS Polly Neural | Replaces Web Speech API for K-2; architecture already prepared in `hints-speech.js` |
| AI-assisted short-answer scoring | Server-side endpoint required; deferred until data residency confirmed |
| `ink-draw` widget (free-draw canvas) | `widgets/ink-draw.js`; manual-graded via existing grading queue |
| Multi-user roster, login, class lists | Requires server infrastructure; scopes grading queue to named students |
| Server-side voice/audio storage | Requires parental consent UX and data residency policy |
| PWA / service worker + offline cache | Stable asset footprint required first |

---

## 6. Explicit Non-Features (Drop or Defer)

| Non-Feature | Decision | Source |
|---|---|---|
| **Voice Memo** | Dropped entirely. No Voice Memo widget will be built. | PHASE_0_DECISIONS §4 |
| **Multi-user roster / login / class lists** | Deferred. Literacy Quest is anonymous (cookie-based), identical to Math Quest. Reports are single-browser session only. | PHASE_0_DECISIONS §7 |
| **Placement test** | Dropped. Students pick their RIT band manually from a dropdown. | PHASE_0_DECISIONS §8 |
| **2020 NWEA norms toggle** | Deferred. 2025 norms are the only norms shown. A 2020 toggle can be added if teachers request it. | PHASE_0_DECISIONS §3 |
| **Pre-rendered audio asset library** | Deferred to Stage 4. Web Speech API (already in `hints-speech.js`) is the only audio pipeline. | PHASE_0_DECISIONS §2 |
| **Item authoring UI** | Not needed. Content is procedurally generated by `gen-*.js` modules — the same pattern as Math Quest's `gen-fractions.js`. No human-authored content library, no import tool. | PHASE_0_DECISIONS §5 |

---

## 7. Vertical Slice Target for Stage 1 MVP

Two skills must work end-to-end before any other Stage 1 work is considered complete. These are the "vertical slice proof."

---

### Slice A: `phonics_short_vowel_short_a_initial`

**Why this skill.** Phonics-first build order (PHASE_0_DECISIONS §1); short-a initial is the simplest phonics atom, making it the lowest-risk proof of the full pipeline.

| Piece | File / Location |
|---|---|
| Skill atom (full four-tag schema) | `/data/literacy-skills/reading/phonics.js` — first exported `SkillAtom` |
| Generator function producing 10+ varied questions | `gen-phonics.js` — `generatePhonicsQuestion('phonics_short_vowel_short_a_initial', options)` |
| Three question types on the atom | `question_types: ["mc-image", "sound-box", "letter-tile-spell"]` |
| Skill detail page entry | `skillDetailView` rendered from this atom's fields |
| Practice session wiring | `generate-literacy-question.js` dispatcher routes to `gen-phonics.js`; `game-control.js` advances via `nextQuestion()` |
| Dashboard tracking | `StudentProgress` written to `localStorage["mathquest_literacy_progress"]` after each session |
| URL share code | `?code=R:PA7|N10-GRK` — Reading, short-a initial weighted 7, 10 items, Grade K |
| Variety rule satisfied | mc-image cards 1-3, sound-box cards 4-6, letter-tile-spell cards 7-9, mc-image card 10 |

**Acceptance criteria.** A student can: open the skill from the grade-K index, complete a 10-card session with at least 3 different mechanics, see a mastery report, share the deck via URL, and return to find their progress persisted.

---

### Slice B: `language_mechanics_capitalize_proper_nouns`

**Why this skill.** Matches Image 8's "Capitalize or No Capital?" example — the clearest visual baseline from the reference images. Binary-choice mechanic is the simplest Language widget.

| Piece | File / Location |
|---|---|
| Skill atom (full four-tag schema) | `/data/literacy-skills/language/mechanics.js` — first exported `SkillAtom` |
| Generator function producing 10+ varied questions | `gen-mechanics.js` — `generateMechanicsQuestion('language_mechanics_capitalize_proper_nouns', options)` |
| Three question types on the atom | `question_types: ["two-button-binary", "mc-text", "tap-hotspot"]` |
| Skill detail page entry | `skillDetailView` rendered from this atom's fields (CCSS: L.2.2a) |
| Practice session wiring | Dispatcher routes to `gen-mechanics.js`; session loop identical to Slice A |
| Dashboard tracking | Written to `localStorage["mathquest_literacy_progress"]` under this `skill_id` |
| URL share code | `?code=L:CA5|N10-GR2` — Language, capitalize-proper-nouns weighted 5, 10 items, Grade 2 |
| Variety rule satisfied | two-button-binary cards 1-4, mc-text cards 5-7, tap-hotspot cards 8-10 |

**Acceptance criteria.** A student can: open the skill from the Grade 2 Language index, complete a 10-card session with binary-choice, MC, and hotspot mechanics, see a mastery report, and share the deck via URL.

---

## 8. Open Questions for User Confirmation Before Stage 2 Build

The following design choices affect Stage 2 implementation. These should be confirmed before Stage 2 code begins.

1. **Manual grading queue persistence.** Should the open-response grading queue persist across browser sessions (stored in `localStorage`) so a parent/teacher can grade the next day, or should it exist only for the current session (in-memory, cleared on page close)? Persistent localStorage is more useful but means ungraded responses from multiple sessions accumulate.

2. **Reports CSV column set.** Should the CSV export include `grade_level` and `rit_band` columns alongside `skill_id`, or should it be minimal (`skill_id`, `correct`, `attempts`, `time_ms`, `date`) to keep the file simple? The richer set is more useful for SPED documentation; the minimal set is easier to process.

3. **OpenDyslexic font delivery.** Should OpenDyslexic be loaded from a CDN (requires network access — simpler, always latest version) or bundled in `/css/fonts/` (works offline, adds ~200 KB to the repo)? Given that Math Quest has no service worker and targets Qatar Foundation school network, CDN is likely fine, but it needs confirmation.

4. **Item-set session structure for Reading 2-5 practice mode.** In the Grade-Level Skills practice mode (not MAP Quest), should a comprehension skill session present one passage with 3-5 items, then end — or should it chain multiple passages back-to-back until the deck count (N items) is reached? One-passage-per-session is simpler to build; chaining matches the full MAP experience but requires the multi-passage extension in `item-set-controller.js`.

5. **Diagnostic anchor in skill detail page.** The `diagnostic_anchor` field (e.g., "UFLI Placement Test Set 1") references an external assessment tool. Should this be shown in the teacher-facing skill detail page as a reference note ("Students who struggle with this skill can be assessed via…"), or kept as data-only (used for internal routing only, not displayed)?

6. **RIT overlap zone routing (Grade 2, RIT 170-200).** When a Grade 2 student's RIT band falls in the 170-200 overlap zone, the system presents a teacher choice: "Use K-2 version" or "Use 2-5 version." Should this prompt appear every session, or should the teacher's choice be persisted in the `mathquest_literacy_settings` cookie until they change it?
