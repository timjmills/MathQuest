# MAP Growth Reading & Language Usage — synthesis

## Document Overview

MAP Growth is NWEA's computer-adaptive benchmark assessment, used K–12 to measure reading and language-arts achievement on a continuous RIT (Rasch Unit) scale. Scores do not reset by grade — they accumulate across years, allowing growth to be tracked from kindergarten through high school on a single shared scale.

Literacy Quest must support three distinct test variants that share one adaptive engine but differ in content frame, passage type, and UX requirements:

| Variant | Grades Served | Scored Items | Time |
|---|---|---|---|
| Reading K–2 | K–Grade 2 | 43 | 25–40 min |
| Reading 2–5 | Grades 2–5 | 43 | 45–60 min |
| Language Usage 2–12 | Grades 2–12 | ~43 (+field test) | 45–55 min |

**K–2 to 2–5 transition rule.** NWEA's official guidance: a student on the K–2 test who scores 170 or above should move to the 2–5 test. A student on the 2–5 test who scores 170 or below should drop back to K–2. RIT 200 is the upper practical ceiling for K–2 content; the two tests overlap in the RIT 170–200 zone.

---

## Test Structures

### Reading K–2

- **43 scored items** + a small number of uncounted field-test items, 25–40 minutes, untimed.
- Audio narration on **every item** by default.
- **4 instructional areas (CCSS 2010):**
  - Foundational Skills: Phonological Awareness, Phonics and Word Recognition, Print Concepts (~6–8 scored items)
  - Language and Writing: Grammar/Usage, Capitalize/Spell/Punctuate, Writing Process (~6–8 items)
  - Literature and Informational Text: Key Ideas, Craft, Structure for both genres (~6–8 items)
  - Vocabulary Use and Functions: Acquisition/Use, Context Clues and References (~6–8 items)
- Companion components: Early Literacy Screener (33 items — Phonological Awareness, Visual Discrimination/Phonics, Concepts of Print) and Skills Checklists (single-skill probes ranging from 11 to 54 items).

### Reading 2–5

- **43 scored items**, 45–60 minutes, untimed, computer-adaptive.
- Audio off by default; TTS available as accommodation.
- **3 reportable instructional areas:**
  - Literary Text (sub-divided: Key Ideas and Details; Language, Craft, Structure)
  - Informational Text (sub-divided: Key Ideas and Details; Language, Craft, Structure)
  - Vocabulary: Acquisition and Use
- Most items are clustered in **item sets** of 3–5 items per passage.
- Three blueprints exist: NWEA 2017 (legacy), CCSS 2010 (most common), and state-aligned (Texas TEKS 2017, WV 2020, NY, VA). Default to CCSS 2010.

### Language Usage 2–12

- **~43 scored items** (some third-party sources cite 50–53 including field-test items); 45–55 minutes, untimed.
- **No composition.** Every item is editing-style, machine-scored.
- **3 reportable instructional areas (CCSS 2010):**
  - Write/Revise Texts for Purpose and Audience (planning, organizing, revising drafts, transitions, research, thesis)
  - Language: Understand/Edit for Grammar and Usage (parts of speech, agreement, sentence structure, modifiers, parallel structure, voice)
  - Language: Understand/Edit for Mechanics (capitalization, all punctuation types, spelling, frequently confused words)

---

## The Seven Primary NWEA Item Types

### 1. Multiple Choice (single answer, 4 options)
Used across all three tests at all RIT bands. Tests factual recall, single-best-answer comprehension, and vocabulary. K–2 answer choices are often image-based (picture options); 2–5 and Language Usage use text options. Build complexity: **low**.

### 2. Multiple Select / Multiselect
Used on Reading 2–5 and Language Usage. Students choose all correct answers. Tests multiple-evidence claims and compound-rule grammar/mechanics. Requires partial-credit logic (score correct only if all required choices are selected). Build complexity: **low–medium**.

### 3. Selectable Text (Hot Text)
A passage is rendered with interactive tokens — words, sentences, or paragraphs — that students click to select as their answer. Used in Reading 2–5 for text-evidence finding and in Language Usage for grammar/mechanics error detection. Build requires a passage tokenizer plus clickable target zones. Operates at three granularities: word, sentence, paragraph. Line numbers and paragraph numbers (always present) are required for RIT 191+ citation-style items. Build complexity: **medium**.

### 4. Drag-and-Drop
Students sort, sequence, categorize, or order items. Common on K–2 (sequencing story events, word sorting) and Language Usage (ordering paragraphs, assembling sentences from word banks). K–2 uses this for syllable-division tasks. Must have a keyboard-accessible equivalent. Build complexity: **medium**.

### 5. Click-and-Pop (Move Tokens into Target Slots)
Students move individual tokens (letters, words) into designated slots. Used frequently on K–2 for sentence construction and word-building (e.g., "Use the letters to spell 'many' correctly"). Also appears on Language Usage for sentence construction. Build complexity: **medium**.

### 6. Text Entry (Fill-In)
Students type a single word or short phrase. Used on Language Usage for spelling items and occasionally on Reading vocabulary items. Requires string normalization and accept-lists for variant spellings. Build complexity: **low–medium**.

### 7. Item Set (Passage-Anchored Multi-Item Cluster)
A single passage is linked to 3–5 (sometimes 6) items. The passage renders once; items navigate beneath it without reloading. Each item in the set may be MC, multi-select, or selectable-text. Requires passage state management, item-navigation logic, and anti-spoiler sequencing (later items should not reveal answers to earlier ones). Reading 2–5 is dominated by item sets. Build complexity: **high**.

**Accessibility notes across all types:** TTS is mandatory on K–2 (default on) and optional (accommodation) on 2–5+. All item types must support OpenDyslexic font toggle, line reader (single-line reveal mask), high-contrast theme, and full keyboard navigation. Minimum tap target for K–2: 60×60 px.

---

## Lexile-to-RIT Mapping

NWEA publishes an official linear mapping. Each RIT row covers a 150L-wide Lexile range; the conventional point estimate is the lower bound + 100L.

| RIT | Lexile Range | Point Estimate | Typical Grade (Spring) |
|---|---|---|---|
| 170 | BR40L–110L | ~60L | Late Grade 1 |
| 180 | 160L–310L | 260L | Late Grade 2 |
| 190 | 365L–515L | 465L | Mid Grade 3 |
| 195 | 465L–615L | 565L | Late Grade 3 / Early Grade 4 |
| 200 | 565L–715L | 665L | Mid Grade 4 |
| 205 | 665L–815L | 765L | Late Grade 4 / Grade 5 |
| 210 | 770L–920L | 870L | Mid–Late Grade 5 |
| 215 | 870L–1020L | 970L | Grade 6 |
| 220 | 970L–1120L | 1070L | Grade 7–8 |
| 230 | 1170L–1320L | 1270L | Grade 9–10 |
| 240 | 1375L–1525L | 1475L | Grade 11–12+ |

Passage word counts (observational): RIT below 161 → 0–30 words, often listening-only; RIT 161–180 → 30–100 words; RIT 181–200 → 100–250 words; RIT 201–220 → 200–400 words; RIT 221–240 → 350–600 words.

---

## K–2 Audio-First Design Requirement

From the document: *"Every item on K-2 Growth carries built-in professional voice. Many items show minimal text (only answer-choice labels) and rely on student listening; this is the central UX difference vs Reading 2-5."*

K–2 UX constraints:
- Minimum **24 px body font**, **32 px answer choices**
- Picture-rich answer choices; image-based choices require alt text and audio labels
- Maximum **2–3 answer choices** for RIT below 141; max 4 for RIT 141–200
- A large **"Listen Again"** button anchored at top-right
- Simple navigation: **one big NEXT button**
- Confirmation step before submitting
- A warm-up tutorial item before the first scored item
- Audio assets pre-rendered and cached per item; use AWS Polly Neural or ElevenLabs

---

## NWEA 2020 Norms Tables

### Reading — Mean RIT (Standard Deviation), Fall / Winter / Spring

| Grade | Fall | Winter | Spring |
|---|---|---|---|
| K | 136.65 (12.22) | 146.28 (11.78) | 153.09 (12.06) |
| 1 | 155.93 (12.66) | 165.85 (13.21) | 171.40 (14.19) |
| 2 | 172.35 (15.19) | 181.20 (15.05) | 185.57 (15.49) |
| 3 | 186.62 (16.65) | 193.90 (16.14) | 197.12 (16.27) |
| 4 | 196.67 (16.78) | 202.50 (16.25) | 204.83 (16.31) |
| 5 | 204.48 (16.38) | 209.12 (15.88) | 210.98 (15.97) |
| 6 | 210.17 (16.46) | 213.81 (15.98) | 215.36 (16.03) |
| 8 | 218.01 (17.04) | 220.52 (16.69) | 221.66 (16.87) |
| 10 | 221.47 (17.92) | 222.91 (17.81) | 223.51 (18.20) |

### Language Usage — Mean RIT (SD)

| Grade | Fall | Winter | Spring |
|---|---|---|---|
| 2 | 173.98 (16.06) | 183.83 (15.40) | 188.40 (15.89) |
| 3 | 187.71 (15.33) | 195.14 (14.64) | 198.32 (14.65) |
| 4 | 197.33 (15.10) | 202.87 (14.44) | 205.00 (14.33) |
| 5 | 204.17 (14.55) | 208.45 (13.98) | 210.19 (13.90) |
| 7 | 212.65 (14.72) | 215.28 (14.39) | 216.47 (14.42) |
| 9 | 216.68 (15.52) | 218.18 (15.30) | 219.00 (15.51) |
| 11 | 220.66 (14.94) | 221.86 (14.98) | 222.33 (15.53) |

NWEA published 2025 norms in August 2025, calibrated to the post-EISA test. Use 2020 norms as historic anchor; support a `norms_year` toggle in reports.

---

## IXL Skill Plan Alignment

IXL maintains three official MAP Growth ELA plans mirroring NWEA's instructional-area structure exactly:

- **Reading K–2 Plan**: Bands: <155 / 155–171 / 172–186 / 187+. Areas: Foundational Skills, Language and Writing, Literature and Informational Text, Vocabulary.
- **Reading 2–5 Plan**: Bands: <155 / 155–171 / 172–186 / 187–197 / 198+. Areas: Literary Text, Informational Text, Vocabulary.
- **Language 2–12 Plan**: Band cut-points shift by grade level. Areas: Write for Purpose and Audience, Grammar (Parts of Speech, Phrases/Clauses), Mechanics (Capitalization, Punctuation, Spelling).

Every item in Literacy Quest should carry one or more IXL skill codes (e.g., "DY9", "TE5") for drill-down recommendations.

---

## Rasch 1PL Adaptive Engine Specification

MAP Growth uses a **1-parameter logistic (1PL) Rasch model**. Each item carries a single difficulty parameter on the RIT scale; student ability is estimated on the same scale.

### Algorithm

**Starting RIT:** Initialize the student's ability estimate at the grade-level mean for the current season (from 2020 norms), or use the student's prior RIT if available.

**Item selection:** After each response, pick the next item whose difficulty (item RIT) is closest to the current ability estimate. NWEA's EISA (Enhanced Item-Selection Algorithm) adds a grade-level weighting: when grade-level items sit near the student's ability, they are prioritized over purely optimal off-grade items.

**Ability estimate update (Bayesian/MLE):** After each response, update the ability estimate using the log-likelihood surface. For a 1PL model:

```
P(correct | θ, b) = 1 / (1 + exp(-(θ - b)))
```

Where θ is the student's current ability estimate (RIT) and b is the item difficulty (RIT). After each item, the new θ is the value that maximizes the likelihood of all responses observed so far (MLE), or the posterior mean if a Bayesian prior is applied.

**Practical update rule (simplified):**

```
θ_new = θ_old + learning_rate × (response - P(correct | θ_old, b))
```

**Stopping rule:** The test ends after 43 scored items. Field-test items (unscored) do not count toward the 43.

**Item selection window:** Pick the next item within ±2 RIT of the current estimate, respecting instructional-area balance (rotate areas in published proportions). For practice mode, expose RIT band selection to teacher/student rather than running pure adaptive.

---

## Item Set Support

Item sets dominate Reading 2–5. Multiple items (typically 3–5, sometimes up to 6) are anchored to a single shared passage.

**Sequencing rules:**
- The passage renders once; items navigate beneath it without full page reload.
- The renderer fetches the passage once and caches it for the duration of the set.
- Items within a set must be sequenced so that later items do not spoil answers to earlier items.
- Track which items in the set have been answered to prevent revisit.
- After the final item, the adaptive engine selects the next passage/item set based on updated ability estimate.

**Scoring:** Item-set items score individually. Two-part items (claim + evidence) score as a binary unit: correct only if both parts are correct.

---

## On-Screen Tools by Test Variant

| Tool | Reading K–2 | Reading 2–5 | Language Usage 2–12 |
|---|---|---|---|
| Audio/TTS | Default ON (mandatory) | Accommodation only | Accommodation only |
| Line reader | Yes | Yes | Yes |
| Highlighter | No | Yes (RIT 191+) | Limited |
| Dictionary lookup | No | Accommodation | Accommodation |
| Zoom/font scaling | Yes | Yes | Yes |
| Pause/resume | Yes | Yes | Yes |
| OpenDyslexic font | Recommended | Yes | Yes |
| High-contrast theme | Yes | Yes | Yes |
| Keyboard navigation | Required | Required | Required |

---

## Implications for Literacy Quest's Design

- **The existing Math Quest Rasch engine can be ported with minor modifications.** The 1PL formula `P = 1 / (1 + exp(-(θ - b)))` maps directly onto Math Quest's existing difficulty-selection logic; the primary additions are per-instructional-area balance enforcement and EISA grade-level weighting.
- **Passage rendering needs line numbers and paragraph numbers from the start.** Build the Passage component with `data-paragraph`, `data-sentence`, and `data-word` attributes from day one.
- **K–2 audio playback is mandatory, not optional.** Pre-render audio assets (AWS Polly Neural or ElevenLabs) for every K–2 item. The "Listen Again" button must be prominent and always visible.
- **Item sets require stateful passage management.** The existing Math Quest architecture generates one question at a time and discards it. Reading 2–5 requires a passage-anchored session object: one passage, 3–5 items, shared state, no reload. **This is the single largest architectural departure from Math Quest's current model.**
- **Language Usage needs a drop-down inline editing renderer.** Tokenize the stimulus sentence with `{{slot:N}}` markers; render each slot as a `<select>` with distractors.
- **Selectable-text requires a passage tokenizer.** Words, sentences, and paragraphs must be wrapped in individually-addressable `<span>` elements with click handlers and visual hover/selection states. Granularity is set per item by the item author.
- **The 43-item session structure is fixed.** Build the session controller to target exactly 43 scored items with a 5–10% field-test buffer seeded randomly.
- **Three instructional areas must be balanced per session.** Implement published proportions: 30% Literary / 30% Informational / 25% Vocabulary / 15% cross-cutting for Reading 2–5; 40% Grammar / 30% Mechanics / 30% Writing for Language Usage.
- **Drag-and-drop must be keyboard-accessible** (WCAG 2.1 AA). Native HTML5 drag events are not enough; every drag interaction needs a keyboard equivalent (arrow keys to move, Enter to drop).
- **The RIT 170 / 200 transition boundary requires routing logic on session start.** Below 170 → K–2; 170–200 → ask or default to teacher's choice; above 200 → 2–5.
