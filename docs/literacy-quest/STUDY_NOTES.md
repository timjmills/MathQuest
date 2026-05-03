# Literacy Quest — Phase 0 Study Notes

**Status:** Phase 0 complete; awaiting user review before proceeding to Phase 1 (Architecture).

This document is the synthesis of the Phase 0 study phase. It triangulates four reference documents (K-5 ELA Scope and Sequence, MAP Growth Reading & Language Usage Build Guide, two Boom Cards catalogs), eight example images, and a full inventory of the existing Math Quest codebase. Everything downstream (architecture, data model, question types, skill matrix, build) depends on this.

The detailed agent-by-agent syntheses are preserved in `_drafts/`. This file is the reconciled view.

---

## Table of contents

1. [The triangle: Skills × Mechanics × Engine](#1-the-triangle-skills--mechanics--engine)
2. [K-5 ELA Scope and Sequence — what it tells us](#2-k-5-ela-scope-and-sequence)
3. [MAP Growth Reading & Language Usage — what it tells us](#3-map-growth-reading--language-usage)
4. [Boom Cards comprehensive catalog — what it tells us](#4-boom-cards-comprehensive-catalog)
5. [Boom Cards basic catalog — what it tells us](#5-boom-cards-basic-catalog)
6. [Eight example images — visual baseline](#6-eight-example-images)
7. [Math Quest architecture — what we can reuse](#7-math-quest-architecture)
8. [Cross-document tensions and how to resolve them](#8-cross-document-tensions)
9. [Top 25 implications driving Phase 1 design](#9-top-25-implications-for-phase-1)
10. [Open questions for the user](#10-open-questions-for-the-user)

---

## 1. The triangle: Skills × Mechanics × Engine

The four reference documents resolve into a triangle:

- **K-5 ELA Scope and Sequence** gives us the **skills** — 600-900 atoms across 9 strands, each with four-tag schema (CCSS, RIT band, IXL, Science of Reading citations) plus ELL/SPED scaffolds, prereq/next graph edges, and mastery criteria.
- **Boom Cards catalogs (basic + comprehensive)** give us the **mechanics** — the 10 core interaction primitives, the K-5 patterns by domain, the Stage 1-4 build order, and the 5 explicit limitations to surpass.
- **MAP Growth reference** gives us the **engine** — the Rasch 1PL adaptive algorithm, the seven NWEA item types, item-set passage anchoring, RIT scales, audio-first K-2, and the three test variants (K-2 / 2-5 / Language Usage).
- **The example images** give us the **feel** — card-as-atom, persistent score/progress chrome, K-2 vs 2-5 button style conventions, decks of 12-50 cards.
- **Math Quest** gives us the **scaffolding** — feature-flagged branch isolation, widget pattern, retry pipeline, gamification, MAP engine to port, Web Speech TTS, IndexedDB persistence, print pipeline.

Phase 1 must produce a coherent product specification that triangulates all five.

---

## 2. K-5 ELA Scope and Sequence

> Full agent synthesis: [`_drafts/k5-ela-synthesis.md`](_drafts/k5-ela-synthesis.md)

### The four-tag skill schema (Part 10)

Every skill atom is a JSON record:

```typescript
interface SkillAtom {
  skill_id: string;                    // <strand>_<domain>_<sub_domain>_<specifier>
  strand: "reading" | "language";
  domain: string;                      // e.g., "phonics"
  sub_domain: string;                  // e.g., "short_vowels"
  developmental_band: string;          // "K-1" | "2-3" | "4-5+"
  skill_statement: string;
  ccss_codes: string[];
  rit_band: string;                    // "141-150"
  rit_test: "Reading K-2" | "Reading 2-5" | "Language Usage 2-12";
  rit_instructional_area: string;
  ixl_skills: string[];
  sor_citations: string[];
  ell_scaffold: string;
  sped_scaffold: string;
  prerequisite_skill_ids: string[];   // 1-3
  next_skill_ids: string[];           // 1-3
  mastery_criteria: {
    accuracy: number;                  // 0.85
    consecutive_sessions: number;      // 2
    fluency_target_per_min: number;
  };
  diagnostic_anchor: string;           // "UFLI Placement Test Set 1"
}
```

### Twelve parts

- Parts 1-5 = Reading strand: Phonological/Phonemic Awareness, Phonics & Decoding, Fluency, Vocabulary, Comprehension (Lit + Info)
- Parts 6-9 = Language strand: Grammar, Sentence Structure, Mechanics, Writing
- Part 10 = the schema above
- Part 11 = Grade 5 expectations + RIT crosswalk
- Part 12 = practical app build guide

Total estimated atom count: **600-900** with ~300+ in phonics alone (the largest section).

### Critical sub-structures

- **Six syllable types** (Closed, Open, VCe, R-controlled, Vowel-team/D, Consonant-le) — needs a dedicated tap-to-classify widget.
- **Six syllable-division patterns** (VC/CV, V/CV, VC/V, VCC/CV, V/V, Cle-final) — drag-divider widget.
- **Heart Words list** with explicit orthographic-mapping instruction — needs a unique UI showing the irregular grapheme highlighted (the "heart"); not a flashcard drill.
- **Hasbrouck-Tindal 2017 ORF norms** — drives fluency mode targets per grade/season; ELL threshold configurable to 25th percentile (not 50th).
- **Beck/McKeown/Kucan three-tier vocabulary model** — Tier 2 ~400 words/year target.
- **Five high-leverage catch-up skills (Part 11):** advanced PA + orthographic mapping, six syllable types + division, Greek/Latin morphology, fluency to 100-115 WCPM, Tier 2 vocab + inferential comprehension.

### ELL scaffolds (canonical)

- Pre-teach Tier 1 vocabulary in every prompt.
- Arabic L1: explicit /æ/-/e/-/ɪ/ and /p/-/b/ contrast; mirrors for articulation.
- L1 cognate (Arabic + Spanish) alongside every vocab item.
- Audio support; pacing 1.5x slower.
- Sentence frames for production items.
- Echo + read-aloud + paired reading trio for fluency (avoid round-robin).
- Picture cards where L1 phoneme is absent.
- Hasbrouck-Tindal 25th percentile as urgent-intervention threshold for Qatar ELL context.

### SPED scaffolds (canonical)

- Elkonin sound boxes with magnetic chips on all decoding items.
- Finger-tapping (Wilson/OG) and say-it-and-move-it routines.
- Daily 8-12 minute Heggerty whole-class block.
- Extend response time 2x.
- Reduce items per session to 5-8.
- Allow 3 attempts with corrective feedback.
- Multisensory warm-up: trace-say-write before each session.
- Pre-teach difficult words; model prosody phrase-by-phrase.
- 3-second wait time after oral prompts.

### Mastery criteria

| Field | Value |
|---|---|
| Accuracy | 0.85 |
| Consecutive sessions | Min 2 (cross-ref'd as "4 of 5 most recent") |
| Sessions span | Multiple days, ≥3 different days |
| Spaced review after mastery | 1d → 3d → 7d → 14d → 30d (SM-2 lite) |
| Fluency targets | Per-skill (e.g., 30 items/min, 100-115 WCPM ORF) |

### Prerequisite / next-skill graph

Forms a **directed acyclic graph (DAG)**. Practice loader walks it:
1. Diagnostic placement → estimated RIT per strand.
2. Walk prerequisites backward 1-2 atoms for early-success priming.
3. 70% current target / 30% interleaved retrieval (Rohrer/Taylor 2007).
4. On mastery, advance to `next_skill_ids`. If no gain in 3 sessions, drop back via `prerequisite_skill_ids`.
5. Mid-year re-test → accelerate / drop-back / hold.

### MAP-tested vs not-MAP-tested

The schema doesn't use a literal `is_map_tested` boolean. Instead, `rit_band` + `rit_test` together serve this purpose. Atoms with populated `rit_band` and a real `rit_test` value are MAP-aligned; atoms with "n/a" (advanced PA oral manipulation, skimming/scanning) are not MAP-testable.

**MAP Quest filter:** `rit_test` matches target family AND `rit_band` falls within student's current RIT ± 10.

---

## 3. MAP Growth Reading & Language Usage

> Full agent synthesis: [`_drafts/map-growth-synthesis.md`](_drafts/map-growth-synthesis.md)

### Three test variants (43 scored items each)

| Variant | Grades | Time | Audio default | Item sets |
|---|---|---|---|---|
| Reading K-2 | K-2 | 25-40 min | ON (mandatory) | No (single items) |
| Reading 2-5 | 2-5 | 45-60 min | OFF (accommodation) | YES — dominant format |
| Language Usage 2-12 | 2-12 | 45-55 min | OFF (accommodation) | No |

**K-2 → 2-5 transition rule:** RIT 170 above → move to 2-5; below → drop back to K-2. Overlap zone RIT 170-200.

### The seven NWEA item types

1. **Multiple choice (single)** — all bands, all variants.
2. **Multi-select** — Reading 2-5 + Language Usage. Partial credit logic required.
3. **Selectable text (hot text)** — passage-tokenized; word/sentence/paragraph granularity. Line + paragraph numbers required for RIT 191+ citation items.
4. **Drag-and-drop** — sort, sequence, categorize, order. Keyboard-accessible equivalent required (WCAG 2.1 AA).
5. **Click-and-pop** — tokens into target slots (sentence construction, K-2 word building).
6. **Text entry** — single word / short phrase. Spelling on Language Usage; vocab on Reading.
7. **Item set** — passage-anchored 3-5 items; passage caches, items navigate beneath. Anti-spoiler sequencing.

### K-2 audio-first design

- Min 24px body, 32px answer choices.
- Picture-rich answer choices; image options with alt text + audio labels.
- Max 2-3 answer choices for RIT < 141; max 4 for RIT 141-200.
- Large "Listen Again" button anchored top-right.
- Single big NEXT button.
- Confirmation step before submit.
- Warm-up tutorial before first scored item.
- **Audio assets pre-rendered + cached per item.** AWS Polly Neural or ElevenLabs.

### Lexile-to-RIT mapping (selected)

| RIT | Lexile pt-est | Typical grade |
|---|---|---|
| 170 | ~60L | Late G1 |
| 180 | 260L | Late G2 |
| 190 | 465L | Mid G3 |
| 200 | 665L | Mid G4 |
| 210 | 870L | Late G5 |
| 220 | 1070L | G7-8 |

### Rasch 1PL adaptive engine

```
P(correct | θ, b) = 1 / (1 + exp(-(θ - b)))
θ_new = θ_old + learning_rate × (response - P(correct | θ_old, b))
```

- Starting RIT: grade-level mean for current season (2020 norms) or prior RIT.
- Item selection: closest difficulty to current ability ± 2 RIT, respecting instructional-area balance.
- Stopping: 43 scored items + 5-10% field-test buffer.
- EISA grade-level weighting (2025-26): grade-level items prioritized when near ability.

**Instructional area proportions (Reading 2-5):** 30% Literary / 30% Informational / 25% Vocabulary / 15% cross-cutting.
**Language Usage:** 40% Grammar / 30% Mechanics / 30% Writing.

### Item-set passage management

The single largest architectural departure from Math Quest. Math Quest generates one question and discards it. Reading 2-5 needs a session object: 1 passage, 3-5 items, shared state, no reload between items. Anti-spoiler sequencing: later items must not reveal answers to earlier ones.

### IXL alignment

Three official MAP Growth ELA plans: Reading K-2, Reading 2-5, Language 2-12. Each item carries one or more IXL skill codes for drill-down.

---

## 4. Boom Cards comprehensive catalog

> Full agent synthesis: [`_drafts/boom-comprehensive-synthesis.md`](_drafts/boom-comprehensive-synthesis.md)

### Stage 1 — Minimum viable interaction set (build first)

The six widgets that cover 80% of K-5 ELA interactions:

1. **Multiple choice** — text + image, single + multi-select.
2. **Tap-correct hotspot** — any element flagged correct/wrong.
3. **Drag-and-drop with linked drop zones** — accept-any / accept-all / accept-specific logic.
4. **Fill-in-the-blank with auto-grading** — accept-list, case-sensitivity toggle, normalize whitespace, "any one of" matching.
5. **Per-element audio playback** — one-tap speaker, default ON for K-2 text.
6. **Self-checking feedback** — green/red, ding/whoops, attempt tracking, per-card answer logging.

### Stage 2 — Differentiation

7. **Custom Play Settings** — shuffle cards, limit cards, limit attempts, show answers, hide cards (verbatim Boom names).
8. **Open-response text with manual grading queue** — partial-credit rubric, **purple speech bubble** indicator pattern.
9. **Tap-to-reveal / hide-when-tapped** — mystery picture, memory match.
10. **Chain Images** — letter formation strokes, sequence visuals.

### Stage 3 — High-value additions

11. **Ink / free-draw** — letter tracing, editing marks. Manual graded.
12. **Voice Memo for self-monitoring** — Literacy Quest's win: save server-side (parental consent), surface to teacher.
13. **Reports** — per-card accuracy, attempts, fastest-correct-time, session timeline, CSV export. **Drives teacher adoption.**
14. **Accessibility primitives** — ALT text, screen-reader Z-order, keyboard/switch nav, accessibility filter toggles.

### Stage 4 — Differentiators

15. **Server-stored voice recording** with longer durations.
16. **AI-assisted short-answer scoring** with teacher confirmation.
17. **Longitudinal IEP-goal dashboards** (skill-keyed, not deck-keyed).

### Five Boom limitations to surpass

1. **Case-sensitivity toggle on FIB** — Boom has no public toggle. Resolve at data model level day one.
2. **"Any one of" acceptable-answer matching** — Boom requires ALL listed answers. Implement true any-of.
3. **Saved voice recordings** — Boom is 10s student-only not saved. Save server-side.
4. **Smarter open-response grading** — AI-assisted with teacher confirmation.
5. **Longitudinal IEP-goal dashboards** — skill-keyed accuracy curves with goal lines, exportable.

### Custom Play Settings (verbatim Boom names — use these EXACTLY)

- **Shuffle cards**
- **Limit cards**
- **Limit attempts**
- **Show answers**
- **Hide cards**

### The purple-speech-bubble pattern

Indicator badge on student report rows for cards needing manual grading (open-response FIB, Ink, stored Voice Memo). Teacher dashboard needs an aggregating "Needs Grading" queue across all students/assignments.

### Reports — what teachers expect

- Per-card accuracy (% from most recent 3 plays)
- Attempts per card
- Fastest correct response time
- Session timeline ("Performance by Play Session")
- Answer choice log (what was actually selected, not just right/wrong)
- CSV export

**This is the teacher-adoption feature. Do not ship without it.**

---

## 5. Boom Cards basic catalog

> Full agent synthesis: [`_drafts/boom-basic-synthesis.md`](_drafts/boom-basic-synthesis.md)

This is the foundational/older catalog. The comprehensive catalog subsumes it. Where they conflict, the comprehensive catalog wins.

**Unique items worth carrying forward:**

- **Domain-by-domain question type lists** — useful as a deck-creation checklist for content authors.
- **Hotspot tap is high-value** for grammar (tap parts of speech) and evidence tasks (cite text).
- **Flow Magic branching** — adaptive path/remediation loop within a deck. Worth considering as a Stage 4 differentiator.
- **Star-to-notebook** — metacognitive save (not a scored interaction). Worth implementing as a "save for review" feature.
- **Speed-read deck** — lesson-card format for fluency pacing. One item per card, self-pacing.

**Items NOT to carry forward initially:**

- Voice Memo (defer to Stage 3+; not auto-gradable).
- Ink free-draw (defer to Stage 3+; manual graded only).
- Single-skill deck enforcement (good principle but already covered by Math Quest's per-skill practice model).

---

## 6. Eight example images

> Full agent synthesis: [`_drafts/example-images-synthesis.md`](_drafts/example-images-synthesis.md)

### The card is the atom

Every interaction lives inside a single white rounded-rectangle card floating on a colored or gradient background. Never feels like a "page" — feels like a physical flashcard.

### Persistent chrome on every card

- "Score: X/N" pill (corner or top-center)
- "Question X of N" or "X / N" counter
- Previous / Next navigation at bottom
- Inline feedback within card after submission (NOT modal)

### K-2 vs 2-5 visual conventions

| Property | K-2 | 2-5 |
|---|---|---|
| Answer choice count | 3 | 4 (2x2 grid) |
| Button style | Vivid solid pill, bold white text | Outlined rectangle, white fill, dark text |
| Button colors | Blue / green / purple / orange | Neutral with thin colored border |
| Audio button | Wide, equal to answer buttons | Smaller, inline/secondary |
| Letter/word tiles | Large square tiles for spelling/phonics | Inline word options |
| Stems | Short, ~1 sentence | Longer, denser, can be paragraph |

### Color semantics (consistent across images)

- Blue = neutral / default
- Green = correct / action
- Orange = audio / utility
- Red = submit / check / stop
- Purple = next / navigation

### Most common mechanics across the 8 images

1. Multiple choice (3 K-2 / 4 2-5) — 6 of 8 images
2. Drag-and-drop to category — 3 of 8
3. Fill in the blank with word bank — 2 of 8
4. True/False binary — 3 of 8 (incl. Capitalize/No Capital from Image 8)
5. Build / sequence (word tiles or events) — 2 of 8
6. Hot-text / highlight — 1 of 8 (Image 3)

### Two innovative widgets the images reveal

- **Color-coded word tagging** (Image 4 "Grammar Detective"): click a word, then click a part-of-speech category button — word turns that color. NOT a standard Boom primitive. Hybrid hotspot + categorization. Enables sentence-level grammar analysis in one card vs 3 separate MC questions. **Build as custom Stage 2 widget.**
- **Audio-cued drag-to-spell** (Image 6 "Consonant Digraph"): listen → drag letter tiles into ordered slots. Combines phonemic awareness with orthographic production. NOT a single Boom primitive. **Build as custom Stage 2 widget for K-2 phonics/spelling.**

### Deck length

12-15 cards for comprehension; up to 50 for drill (capitalization, spelling). Engine must handle both scales without performance degradation.

---

## 7. Math Quest architecture

> Full agent synthesis: [`_drafts/math-quest-architecture.md`](_drafts/math-quest-architecture.md)

### What we can reuse directly (extract to `/js/modules/shared/quest-core/`)

1. `state.js` — shared mutable state pattern
2. `storage.js` — cookie + localStorage wrappers
3. `utils.js` — `randInt`, `shuffle`, `pick`, `normalizeText`, `buildNumericOptions`
4. `gamification.js` — XP, levels, badges, streaks (overrideable badges/titles)
5. `progress.js` — skill progress, mastery, adaptive difficulty
6. `dashboard.js` — session history UI, streak calendar, badges
7. `ui-core.js` — `showToast`, `confetti`, theme toggle
8. `navigation.js` — `showView()` (view IDs app-specific)
9. `hints-speech.js` — TTS via Web Speech API with voice warming
10. `quiz-storage.js` — IndexedDB persistence (domain-agnostic)
11. `print-settings.js` + `print-generate.js` — worksheet pipeline
12. **Widget pattern** — each widget exports `render*` + `check*`
13. **Widget-retry pattern** (`widget-retry.js`) — `isFirstAttempt`, `markFirstAttempt`, `markAllCorrectFired`
14. **Answer-check dispatcher** — `checkAnswer()` with `isReviewing`/`applyReviewOutcome`
15. **MAP adaptive engine** (`map-engine.js`) — Rasch 1PL; **port directly to literacy**
16. CSS variables system (`variables.css`)
17. `settings-panel.js` (extend with literacy options)
18. Skill code system (`skill-codes.js`) — URL-shareable practice configs
19. Game stats banner, on-task timer, inactivity modal, fullscreen prompt, tab-switch detection — already built attention features

### What stays math-only (do NOT port)

- Numpad widget (digits 0-9)
- Equation rendering (KaTeX/MathJax)
- Number lines, base-10 blocks, fraction circles/bars
- Factor pairs T-chart, clock widget, coordinate grids
- The 8 `gen-*.js` math generators
- `data.js` DOMAINS / SKILLS arrays

### What needs new infrastructure

- **Audio asset pipeline** — pre-rendered MP3/OGG via AWS Polly Neural or ElevenLabs, cached. Math Quest only has Web Speech API TTS (synthesized live).
- **Passage component with line + paragraph numbers** — for hot-text and item-set support.
- **Item-set session controller** — passage-anchored multi-item state (architectural departure).
- **Drop-down inline editing renderer** — for Language Usage 2-12 (no math equivalent).
- **Selectable-text passage tokenizer** — wraps passage in word/sentence/paragraph spans.
- **Manual grading queue** with purple speech bubble pattern.
- **Voice recording storage + parental consent** — server-side audio for Stage 3+.

### Branch isolation strategy

- `master` deploys to `math.cultivatingthedigital.org` via GitHub Pages.
- `literacy-quest-expansion` branch is isolated; never auto-merged until Phase 3.
- Single feature flag: `FEATURES.LITERACY_QUEST_ENABLED = false` by default.
- All new routes, modals, navigation gated.
- Math Quest core (gen-*.js, data.js DOMAINS) untouched.

---

## 8. Cross-document tensions

### Tension 1: "Single-skill decks" vs "Variety of mechanics per skill"

- **Boom basic catalog** says: keep decks single-skill; avoid mixed-skill cards across a deck.
- **User's prompt** says: vary mechanics within a single skill (the variety rule); ≥3 mechanics per skill, ≥3 mechanics per typical deck.

**Resolution.** These don't actually conflict. "Single-skill" means one ELA atom per deck (e.g., a deck on "short a in CVC"). "Variety of mechanics" means within that single-skill deck, the cards use 3+ mechanics (MC pictures, FIB, drag-sort, sound-box, etc.). Both apply.

### Tension 2: Audio default ON (K-2) vs Audio default OFF (2-5)

- **MAP reference** is explicit: K-2 audio default ON; 2-5 audio default OFF (accommodation only).
- **User's preferences** (from prior Math Quest work): TTS audio defaults ON every session; user toggles off mid-session but doesn't persist.

**Resolution.** Default ON per session for ALL Literacy Quest variants — both K-2 and 2-5. This matches Math Quest's existing behavior and fits Tim's ELL/SPED context (Qatar Foundation school). When NWEA-style "test simulation" is the explicit mode, allow the proctor/teacher to flip audio off for 2-5; otherwise audio stays on.

### Tension 3: Mastery threshold 0.85 vs 70% errorless graduation

- **K-5 ELA reference** says: mastery_criteria.accuracy = 0.85 across 2 consecutive sessions.
- **Boom comprehensive catalog** says: errorless multi-choice for new-skill introduction; graduate to multi-select/FIB only as accuracy stabilizes >70%.

**Resolution.** Two different thresholds for two different things. 70% is the "graduate from errorless intro" threshold. 85% is the "mastered, advance to next_skill_ids" threshold. Track both. Display:
- < 70% on a skill → student stays on errorless intro mechanic (MC with one obvious correct).
- 70-84% → graduate to harder mechanics (FIB, multi-select, drag-and-drop).
- ≥85% across 2 consecutive sessions → mastered; spaced review starts (1d/3d/7d/14d/30d).

### Tension 4: 2025 norms vs 2020 norms

- **MAP reference** notes: NWEA published 2025 norms in August 2025, ~2 RIT points lower than 2020 (post-pandemic shift).
- **Practical implication**: which norms drive grade-level expectations in the dashboard?

**Resolution.** Default to 2020 norms (more historical data, more familiar to teachers). Add a `norms_year` toggle in reports for 2025. Document this clearly in the dashboard.

### Tension 5: Six syllable types — separate atoms or one widget?

- **K-5 ELA reference** says: six syllable types = 12 atoms (identify + decode for each).
- **Practical UI** says: one widget that classifies a syllable into six types is more efficient than 12 separate cards.

**Resolution.** 12 atoms in the data model (mastery tracked separately for each type). The skill selector can launch a "syllable types mixed" deck that pulls all 12 and uses a single tap-to-classify widget for variety; individual atoms can also be practiced standalone.

---

## 9. Top 25 implications for Phase 1

### Architecture

1. **Branch-isolate strictly.** `literacy-quest-expansion` never merged to `master` until Phase 3. Single `FEATURES.LITERACY_QUEST_ENABLED` flag default false.
2. **Extract shared infrastructure to `/js/modules/shared/quest-core/`** — 19 modules listed in §7. Math Quest stays untouched.
3. **Item-set passage management is the largest architectural addition.** Build a `PassageSession` object: 1 passage, 3-5 items, shared state, no reload.
4. **Audio asset pipeline is new infrastructure.** Pre-rendered MP3/OGG via AWS Polly Neural or ElevenLabs, cached locally. Web Speech API TTS as fallback only.
5. **Passage component with line + paragraph numbers from day one.** `data-paragraph`, `data-sentence`, `data-word` attributes wrapped in addressable spans. Retrofitting tokenization is expensive.

### Data model

6. **Every skill atom carries the full four-tag schema** (CCSS, RIT band/test/area, IXL, SoR citations) plus scaffolds, graph edges, mastery criteria, diagnostic anchor. Atoms missing fields cannot be placed by diagnostic or filtered by skill selector.
7. **Resolve FIB case-sensitivity and "any-of" matching at the data model level day one.** `acceptable_answers: string[]`, `case_sensitive: boolean`, `normalize_whitespace: boolean`.
8. **Skill graph is a DAG.** `prerequisite_skill_ids` (1-3) and `next_skill_ids` (1-3). Build a graph viewer for teacher use.
9. **Mastery tracking has two thresholds.** 70% (graduate from errorless intro) and 85% across 2 consecutive sessions (mastered, advance + spaced review).

### Question types

10. **Build Stage 1 first.** The six widgets cover 80% of K-5 ELA interactions: MC text/image/multi-select, tap-correct hotspot, drag-and-drop with linked drop zones, FIB auto-graded, per-element audio, self-checking feedback. Do not start Stage 2 until Stage 1 covers 80%+ of planned activities.
11. **Two custom Stage 2 widgets** beyond the standard Boom primitives:
    - Color-coded word tagging (Grammar Detective from Image 4)
    - Audio-cued drag-to-spell (Consonant Digraph from Image 6)
12. **Three mechanics per skill is the minimum.** Implement a deck-composition rule that pulls ≥3 mechanics for any 10-card deck unless explicitly fluency drill mode.
13. **Heart-words list needs a unique UI.** Highlight the irregular grapheme as a "heart"; sound-by-sound mapping, not flashcard drill.
14. **Six syllable types need a tap-to-classify widget.** Six labeled buttons; tap a syllable then tap its type. Same widget covers all 12 atoms.

### Engine

15. **Port Math Quest's Rasch engine directly.** Add per-instructional-area balance enforcement and EISA grade-level weighting. Same `P = 1 / (1 + exp(-(θ - b)))` formula.
16. **K-2 → 2-5 routing on session start.** Below RIT 170 → K-2; 170-200 → ask teacher; >200 → 2-5.
17. **43-item session structure with 5-10% field-test buffer.** Stopping rule is item count, not confidence interval.
18. **Instructional area proportions enforced.** Reading 2-5: 30/30/25/15. Language Usage: 40/30/30.

### UX

19. **The card is the atom.** White rounded-rectangle card on gradient/colored background. Persistent score + counter chrome. Inline (not modal) feedback. Previous / Counter / Next at bottom — no exceptions.
20. **K-2 vs 2-5 button style is a design rule, not a per-card choice.** Vivid solid pill = K-2; outlined neutral = 2-5. 3 answer choices for K-2; 4 in 2x2 grid for 2-5.
21. **Per-element audio is a one-tap affordance** with the speaker icon next to every text element in K-2 content. Default ON for the session; user-togglable mid-session; resets each session.
22. **Custom Play Settings use Boom's verbatim names.** "Shuffle cards", "Limit cards", "Limit attempts", "Show answers", "Hide cards" — exactly. Teachers will look for these.
23. **Manual grading queue uses the purple speech bubble pattern.** Open-response FIB, Ink, stored Voice Memo flag with this indicator. Teacher dashboard aggregates across all students.

### Accessibility & differentiation

24. **ELL/SPED differentiation toggle is a first-class UI element**, not just a settings flag. ELL on: L1 cognates, audio autoplay, 1.5x pacing, sentence frames. SPED on: Elkonin boxes, 5-8 item cap, 3-attempt corrective feedback, 2x response time.
25. **Reports drive teacher adoption — Stage 3 without compromise.** Per-card accuracy, attempts, fastest-correct-response time, session timeline, answer-choice log, CSV export. SPED teachers need longitudinal skill-keyed accuracy curves with goal lines (Stage 4 differentiator vs Boom).

---

## 10. Open questions for the user

These need user resolution before Phase 1 can be finalized.

1. **Build order priority.** The K-5 ELA reference recommends Parts 1-4 first (Reading: PA, Phonics, Fluency, Vocab). User said "phonics is highest priority for Tim's class." Confirm: build Phonics atoms first within the Reading strand, then expand to PA, Vocab, Fluency? Or genuine Parts 1-4 sequential build?

2. **Audio pipeline budget.** Pre-rendered audio via AWS Polly Neural is the recommended path for K-2. Polly Neural is ~$16/M characters; a typical K-2 item is ~50 chars; 600 atoms × 10 items × 50 chars = 300K chars = ~$5 first-render cost, then cached. Confirm this budget is acceptable, or fall back to Web Speech API live TTS for the MVP?

3. **Norms year default.** Reports default to 2020 NWEA norms with a 2025 toggle, OR default to 2025 with a 2020 historical toggle?

4. **Voice Memo storage.** Stage 3 differentiator needs server-side audio storage with parental consent UX. The Qatar Foundation school may have data residency requirements (EU GDPR-style or local). Confirm: defer Voice Memo entirely to Stage 4 until storage policy is clear, OR build the UI now with a "coming soon" notice on the storage feature?

5. **Item content authoring.** Who writes the 600-900 atoms' worth of items? Options: (a) Tim authors as the platform launches, (b) AI-generated items reviewed by Tim, (c) commissioned from a content vendor. This decision drives whether we need an item-authoring UI (Stage 2 priority if Tim authors) or just a content import tool (Stage 3 if AI/vendor).

6. **Math Quest skill code system.** The existing `?code=` URL share format encodes weighted math skills + settings. Should literacy decks be sharable via the same system (extending the format), or should literacy use its own deck-share URL scheme?

7. **Login / class roster.** Math Quest is anonymous (cookie-based). Boom decks are assigned to named students. Reports require student identity. Confirm: build a lightweight roster + assignment system, or rely on URL-shared decks + teacher manually correlating reports to students?

8. **Grade-level placement.** The diagnostic placement test (30-40 items, Part 12B) determines starting RIT per strand. Does this run automatically on first login, or is it teacher-initiated via the skills navigator?

---

## End of Phase 0

Phase 0 study is complete. Deliverables:

- ✅ Branch `literacy-quest-expansion` created and isolated.
- ✅ `LITERACY_QUEST_BUILD_NOTES.md` at repo root documenting deploy + flag strategy.
- ✅ `/docs/literacy-quest/` folder created.
- ✅ This file (`STUDY_NOTES.md`) reconciling all four reference documents + 8 example images + Math Quest codebase inventory.
- ✅ Six per-document syntheses preserved in `/docs/literacy-quest/_drafts/` for full detail.

**Next step: stop and ask the user for review.** Phase 1 (Architecture + Skill Mapping) does not begin without explicit approval and answers to the 8 open questions in §10.
