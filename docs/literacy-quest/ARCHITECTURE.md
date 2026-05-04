# Literacy Quest — Architecture

**Status:** Phase 1 complete.
**Branch:** `literacy-quest-expansion`
**Last updated:** 2026-05-03

This document defines the architecture for the Literacy Quest expansion of MathQuest. It is grounded in four reference documents, eight example images, the Phase 0 study notes, the user's Phase 0 decisions, and a full inventory of the existing Math Quest codebase. Every decision here is downstream of those sources; consult `STUDY_NOTES.md` and `PHASE_0_DECISIONS.md` for the reasoning behind each choice.

---

## 1. Routing and Navigation

Math Quest uses a `<div class="view">` system toggled by `showView(id)` in `navigation.js`. There are no URL routes — all navigation is view-swapping in a single-page document. Literacy Quest extends this system without changing it.

### New views

| View ID | Purpose |
|---|---|
| `questHubView` | Top-level subject picker: Math / Reading / Language |
| `readingHomeView` | Reading Quest strand home (skill picker, quick start) |
| `languageHomeView` | Language Quest strand home |
| `literacyDashboardView` | Per-subject progress, streak, session history |
| `mapReadingK2View` | MAP Quest — Reading K-2 variant |
| `mapReading25View` | MAP Quest — Reading 2-5 variant |
| `mapLanguageUsageView` | MAP Quest — Language Usage 2-12 variant |

### Reuse vs new for the game session view

Reading and Language practice sessions reuse `gameView` with a `state.subject` discriminator (`"math"` | `"reading"` | `"language"`). `game-control.js` checks `state.subject` at render time to call the literacy dispatcher instead of the math dispatcher. This avoids duplicating the timer, XP banner, and stats chrome.

Similarly, the three MAP variants share a single `mapView` (already present) gated by `state.mapVariant` (`"reading-k2"` | `"reading-2-5"` | `"language-usage"`). `map-engine-literacy.js` reads this discriminator to apply the correct item pool and instructional-area proportions.

### Navigation flow

```
questHubView
├── Math Quest card  ──→  homeView  (unchanged Math Quest entry point)
├── Reading Quest card  ─→  readingHomeView
│                            ├── Practice mode  ──→  gameView (state.subject="reading")
│                            ├── MAP Quest  ──→  mapView (state.mapVariant="reading-k2"|"reading-2-5")
│                            └── Dashboard  ──→  literacyDashboardView
└── Language Quest card  ─→  languageHomeView
                             ├── Practice mode  ──→  gameView (state.subject="language")
                             ├── MAP Quest  ──→  mapView (state.mapVariant="language-usage")
                             └── Dashboard  ──→  literacyDashboardView
```

"Back to hub" is a single `showView('questHubView')` call added to the back-nav path in `navigation.js`. The existing `goHome()` function is untouched; it still returns to `homeView`. A new `goToHub()` function handles hub-level back navigation.

### Feature-flag gating

The `questHubView` is the single entry point for all literacy routes. Every literacy view is gated:

```js
// navigation.js — goToHub()
import { FEATURES } from './features.js';

function goToHub() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) {
        showView('homeView'); // fall through to Math Quest if flag is off
        return;
    }
    showView('questHubView');
}
```

The existing `homeView` is not modified. A small addition: if `FEATURES.LITERACY_QUEST_ENABLED` is true, a "Quest Hub" button appears in the home screen header to reach `questHubView`. When the flag is false, `homeView` loads exactly as today.

### URL parameter extension

The existing `?code=` and `?c=` scheme is extended with a subject prefix. The parser in `skill-codes.js` reads the prefix character before the colon and sets `state.subject` accordingly. See Section 9 for the full encoding spec.

---

## 2. The Quest Hub

`questHubView` is a full-viewport screen showing three subject cards in a horizontal row (or a 1-column stack on mobile). Visual language: white rounded-rectangle cards on a gradient background — the same "card is the atom" convention seen in the example images.

### Card layout

```
┌──────────────────────────────────────────────────────────────┐
│                    QUEST HUB                                 │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │             │  │             │  │             │          │
│  │  MATH QUEST │  │  READING    │  │  LANGUAGE   │          │
│  │             │  │   QUEST     │  │   QUEST     │          │
│  │  [always    │  │  [gated by  │  │  [gated by  │          │
│  │  visible]   │  │   flag]     │  │   flag]     │          │
│  │             │  │             │  │             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

- Math Quest card is always active and routes to the existing `homeView`.
- Reading Quest and Language Quest cards are rendered only when `FEATURES.LITERACY_QUEST_ENABLED === true`; otherwise the hub shows only the Math card and the whole view is never linked from the UI.
- Card color semantics follow the example images: blue for Math, green for Reading, orange for Language.
- Each card shows a short tagline, a grade-level range badge, and a large tap target.

The hub is built in `literacy-navigation.js` and its HTML lives in `index.html` as a standard `<div class="view" id="questHubView">`.

---

## 3. Module and Folder Structure

### Shared infrastructure: `/js/modules/shared/quest-core/`

The following 19 modules are extracted from Math Quest's `js/modules/` into a shared folder. They contain no math-specific logic and are imported by both Math Quest and Literacy Quest. Math Quest's existing imports are updated to point at the new location; behavior is identical.

1. `state.js`
2. `storage.js`
3. `utils.js`
4. `gamification.js`
5. `progress.js`
6. `dashboard.js`
7. `ui-core.js`
8. `navigation.js`
9. `hints-speech.js`
10. `quiz-storage.js`
11. `print-settings.js`
12. `print-generate.js`
13. `widget-retry.js`
14. `answer-check.js` (the dispatcher shell — skill-specific check logic stays in domain modules)
15. `question-render.js` (the dispatcher shell)
16. `map-engine.js`
17. `settings-panel.js`
18. `skill-codes.js`
19. `features.js`

### Literacy application modules: `/js/modules/literacy/`

| Module | Responsibility |
|---|---|
| `literacy-init.js` | Literacy Quest initialization; runs after `init.js` when flag is on |
| `literacy-navigation.js` | `goToHub()`, `showReadingHome()`, `showLanguageHome()`, hub card rendering |
| `gen-phonics.js` | Question generator for Phonics & Decoding atoms |
| `gen-phonemic-awareness.js` | Generator for Phonological/Phonemic Awareness atoms |
| `gen-fluency.js` | Generator for Fluency atoms (ORF targets, rate drills) |
| `gen-vocabulary.js` | Generator for Vocabulary atoms (Tier 2 words, context clues, morphology) |
| `gen-comp-literature.js` | Generator for Literary Comprehension atoms (main idea, character, theme) |
| `gen-comp-info.js` | Generator for Informational Comprehension atoms (main idea, text structure, evidence) |
| `gen-grammar.js` | Generator for Grammar atoms (POS, agreement, pronouns) |
| `gen-sentence-structure.js` | Generator for Sentence Structure atoms (clauses, combining, complex sentences) |
| `gen-mechanics.js` | Generator for Mechanics atoms (capitalization, punctuation, spelling) |
| `gen-writing.js` | Generator for Writing atoms (editing, revision, paragraph structure) |
| `passage-render.js` | Renders a passage with `data-word`, `data-sentence`, `data-paragraph` span tokenization |
| `item-set-controller.js` | `PassageSession` class; manages passage + items array + item index + anti-spoiler sequencing |
| `literacy-question-render.js` | Literacy-specific `renderLiteracyQuestion()`; routes to widget renderers |
| `literacy-answer-check.js` | Literacy-specific `checkLiteracyAnswer()`; handles FIB accept-list, multi-select partial credit, hot-text |
| `map-engine-literacy.js` | Rasch 1PL engine ported from `map-engine.js`; adds per-area balance + EISA weighting |
| `literacy-dashboard.js` | Per-subject progress dashboard, mastery thresholds, spaced-review queue |
| `literacy-skill-codes.js` | Subject-prefix encoding/decoding; extends `skill-codes.js` parser |

### Literacy widgets: `/js/modules/literacy/widgets/`

Each widget exports `render*` and `check*`, following the Math Quest widget contract exactly.

| Widget module | Mechanic |
|---|---|
| `two-button-binary.js` | Binary choice (Capitalize / No Capital; True / False; Yes / No) |
| `sound-box.js` | Elkonin sound boxes with chip drag-and-drop for phonemic segmentation |
| `build-with-tiles.js` | Drag letter/word tiles into ordered slots; covers phonics, syllable building, sentence construction |
| `hot-text-passage.js` | Selectable-text passage with word/sentence/paragraph granularity; cite-evidence, identify topic sentence |
| `drop-down-inline.js` | Inline `<select>` replacement inside sentence stems; Language Usage 2-12 grammar/mechanics |
| `word-tagger.js` | Color-coded part-of-speech tagging (Grammar Detective from Image 4); click word then click POS button |
| `audio-spell.js` | Audio-cued drag-to-spell (Consonant Digraph from Image 6); listen then build word from letter tiles |
| `passage-mc.js` | Multiple-choice item anchored to a passage; 3-option (K-2) or 4-option 2x2 grid (2-5) |
| `passage-multi-select.js` | Multi-select (checkboxes) anchored to a passage; partial credit per Reading 2-5 |
| `sentence-build.js` | Drag word-order tiles into correct sentence sequence |
| `letter-tile-spell.js` | Tap-to-select spelling from scrambled letter tiles (simpler than `audio-spell.js`) |
| `sort-into-bins.js` | n-column drag-and-drop categorization (syllable types, word sorts, grammar sorts) |
| `match-pairs.js` | Match vocabulary term to definition, or word to image |

### Skill data: `/data/literacy-skills/`

JSDoc-typed JS files (not compiled TS — maintains the no-bundler constraint). Each file exports an array of `SkillAtom` objects following the four-tag schema from `STUDY_NOTES.md §2`.

```
/data/literacy-skills/
├── reading/
│   ├── phonics.js               (largest file, ~300 atoms, built first)
│   ├── phonemic-awareness.js    (built alongside phonics as foundational)
│   ├── fluency.js
│   ├── vocabulary.js
│   ├── comp-literature.js
│   └── comp-informational.js
├── language/
│   ├── grammar.js
│   ├── sentence-structure.js
│   ├── mechanics.js
│   └── writing.js
└── map-quest/
    ├── map-reading-k2.js        (item pool tuned for K-2 variant; RIT < 200)
    ├── map-reading-2-5.js       (item pool for 2-5 variant; RIT 161-230)
    └── map-language-usage.js    (item pool for Language Usage variant; RIT 161-230)
```

### CSS: `/css/literacy-quest.css`

Loaded conditionally in `index.html` via a `<link>` tag that is inserted dynamically by `literacy-init.js` only when `FEATURES.LITERACY_QUEST_ENABLED === true`. This keeps the production bundle unaffected when the flag is off. The file ships:
- Card and hub layout
- K-2 vs 2-5 button style rules (vivid solid pill vs outlined neutral rectangle)
- Widget-specific styles for sound boxes, tile builders, passage tokenization, hot text
- ELL/SPED scaffold overrides (font scaling, spacing, highlight colors)
- OpenDyslexic toggle class

---

## 4. The Dispatcher Pattern

`generateLiteracyQuestion(skillId, options)` in `literacy-init.js` (or a dedicated `generate-literacy-question.js`) mirrors `generateQuestion()` from Math Quest exactly. It reads `skillId`, looks it up in `categoryMapping`, applies any `skillCategoryOverride` entries, then calls the appropriate generator.

```js
// generate-literacy-question.js (module skeleton)

const categoryMapping = {
    // Reading strand
    'phonics':               'phonics',
    'phonemic_awareness':    'phonemic_awareness',
    'fluency':               'fluency',
    'vocabulary':            'vocabulary',
    'comp_literature':       'comp_literature',
    'comp_informational':    'comp_informational',
    // Language strand
    'grammar':               'grammar',
    'sentence_structure':    'sentence_structure',
    'mechanics':             'mechanics',
    'writing':               'writing',
};

const skillCategoryOverride = {
    // Skills whose data-model category differs from their generator
    'syllable_types_mixed':   'phonics',
    'heart_words':            'phonics',
    'orf_fluency':            'fluency',
    'context_clues':          'vocabulary',
    'edit_for_capitals':      'mechanics',
    'edit_for_punctuation':   'mechanics',
};

export function generateLiteracyQuestion(skillId, options = {}) {
    const category = skillCategoryOverride[skillId]
        ?? categoryMapping[getSkillCategory(skillId)]
        ?? 'phonics';

    switch (category) {
        case 'phonics':             return generatePhonicsQuestion(skillId, options);
        case 'phonemic_awareness':  return generatePAQuestion(skillId, options);
        case 'fluency':             return generateFluencyQuestion(skillId, options);
        case 'vocabulary':          return generateVocabQuestion(skillId, options);
        case 'comp_literature':     return generateCompLitQuestion(skillId, options);
        case 'comp_informational':  return generateCompInfoQuestion(skillId, options);
        case 'grammar':             return generateGrammarQuestion(skillId, options);
        case 'sentence_structure':  return generateSentenceStructureQuestion(skillId, options);
        case 'mechanics':           return generateMechanicsQuestion(skillId, options);
        case 'writing':             return generateWritingQuestion(skillId, options);
        default:
            console.warn(`[LiteracyQuest] Unknown skill category: ${category}`);
            return null;
    }
}
```

Each generator returns the same contract as Math Quest's generators:

```js
{
    text: string,          // question stem
    ans: string | string[], // correct answer(s) — array for multi-select
    hint: string,
    options: string[],     // MC/multi-select choices
    answerType: string,    // 'multiple-choice' | 'multi-select' | 'text' | 'hot-text' | 'fib' | ...
    visual: string | null, // HTML for passage or widget container
    skillLabel: string,
    printFormat: string,
    acceptableAnswers: string[], // FIB accept-list (any-of matching)
    caseSensitive: boolean,
    ritBand: string,       // '161-170' etc.
    passageId: string | null, // non-null only for item-set items
}
```

---

## 5. State Extensions

New properties are added to the shared `state` object in `state.js`. Existing math properties are never removed or renamed.

```js
// Additions to state.js — all initialized to safe defaults

state.subject = "math";
// "math" | "reading" | "language"
// Discriminator for gameView and mapView routing

state.mapVariant = null;
// "reading-k2" | "reading-2-5" | "language-usage"
// Set before entering mapView; null during math MAP sessions

state.passageSession = null;
// PassageSession instance | null
// Non-null during item-set comprehension sessions (Reading 2-5)
// Structure: { passage, items[], currentItemIndex, passageId, lexile, ritBand }

state.literacyEllScaffold = false;
// Boolean; enables per-element audio autoplay, L1 cognates,
// 1.5x pacing, sentence frames

state.literacySpedScaffold = false;
// Boolean; enables Elkonin boxes, 5-8 item cap per session,
// 3-attempt corrective feedback, 2x response time

state.literacyGrade = null;
// "K" | "1" | "2" | "3" | "4" | "5" | null
// Set from grade picker on reading/languageHomeView

state.literacyRitBand = null;
// "141-150" | "151-160" | ... | "221-230" | null
// Set from RIT band picker on reading/languageHomeView (no placement test)
```

`state.subject` is the single discriminator that allows `gameView` and `mapView` to serve both math and literacy sessions without view duplication.

---

## 6. The Single Feature Flag

`js/modules/features.js` (moved to `shared/quest-core/features.js` in the extraction):

```js
// js/modules/shared/quest-core/features.js

export const FEATURES = {
    LITERACY_QUEST_ENABLED: false,
};
```

### Gating pattern

Every literacy entry point checks the flag before doing anything:

```js
// In literacy-navigation.js
import { FEATURES } from '../shared/quest-core/features.js';

export function goToHub() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) {
        showView('homeView');
        return;
    }
    showView('questHubView');
}

export function showReadingHome() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) return;
    showView('readingHomeView');
}
```

```js
// In index.html — hub button rendered only when flag is on
// (literacy-navigation.js injects the button into the homeView header)
if (FEATURES.LITERACY_QUEST_ENABLED) {
    document.getElementById('hubEntryBtn').style.display = 'inline-flex';
}
```

The flag also gates the dynamic `<link>` injection for `literacy-quest.css` and all `/data/literacy-skills/` imports. When the flag is false, none of these files are fetched.

---

## 7. Audio Strategy: Web Speech API Only

Per the Phase 0 decision, Literacy Quest uses Web Speech API exclusively — no AWS Polly, no ElevenLabs. The existing `hints-speech.js` module is reused without modification.

### K-2 audio default ON

`state.ttsEnabled` defaults to `true` every session (Math Quest's existing behavior). For K-2 content (`state.literacyGrade` in `['K', '1', '2']`), the session initializer in `literacy-init.js` additionally calls `speakQuestion()` automatically when a new card renders — the same path Math Quest uses. No new code paths are needed.

### Per-element audio buttons

Literacy widgets needing per-element audio (answer options in K-2, passage read-aloud) call the existing `speakAnswerOption(text)` from `hints-speech.js`. Each option button renders with a small speaker icon. The icon calls `speakAnswerOption()` via `window.speakAnswerOption` (attached in `globals.js`).

```js
// Widget pattern for per-element audio (K-2 answer choice)
function renderK2Choice(text, index) {
    return `
      <button class="k2-choice-btn" onclick="submitLiteracyAnswer(${index})">
        <span class="k2-choice-text">${text}</span>
        <button class="audio-btn" onclick="event.stopPropagation(); speakAnswerOption('${text}')"
                aria-label="Listen">🔊</button>
      </button>
    `;
}
```

### Voice quality limitation

Web Speech voice quality varies significantly across OS and browser. On Chrome for Android (common in Qatar Foundation classrooms), the `en-US` Wavenet voice is high quality. On Safari iOS, quality is acceptable but different. On Windows Edge, quality may differ again. This is a known limitation of the Web Speech API.

Pre-rendered MP3 assets via AWS Polly Neural or ElevenLabs are the recommended upgrade path for Stage 4. The architecture is ready for this: `hints-speech.js` can be extended with a `playAudioAsset(url)` fallback that checks for a cached MP3 before invoking the synthesizer. No current code needs to change to enable this future enhancement.

---

## 8. MAP Engine Reuse

`map-engine.js` is ported to `map-engine-literacy.js` in `/js/modules/literacy/`. The core Rasch 1PL formula is identical:

```
P(correct | θ, b) = 1 / (1 + exp(-(θ - b)))
θ_new = θ_old + learning_rate × (response - P(correct | θ_old, b))
```

### Additions over the math engine

**Per-instructional-area balance enforcement.** Each item drawn from the pool checks running counts against target proportions:

| Variant | Literary | Informational | Vocabulary | Cross-cutting |
|---|---|---|---|---|
| Reading 2-5 | 30% | 30% | 25% | 15% |

| Variant | Grammar | Mechanics | Writing |
|---|---|---|---|
| Language Usage | 40% | 30% | 30% |

If an area is over-represented, `selectNextItem()` skips items from that area until balance is restored, falling back to the nearest-difficulty item from an under-represented area.

**EISA grade-level weighting.** When `state.literacyRitBand` is within 5 RIT of the student's estimated ability `θ`, the item pool is weighted 2:1 toward grade-level items before difficulty matching. This mirrors the 2025-26 EISA calibration.

**Item-set passage anchoring.** When `selectNextItem()` draws an item with a non-null `passageId`, it locks the next 2-4 items to the same `passageId` (up to the end of the set or the 43-item cap). This is coordinated with `item-set-controller.js`.

**2025 NWEA norms.** Starting RIT per grade/season uses 2025 norms (post-pandemic cohort, ~2 RIT lower than 2020). The norms table is a const in `map-engine-literacy.js`.

### K-2 routing

On MAP Quest entry, `literacy-navigation.js` checks `state.literacyRitBand` and `state.literacyGrade`:
- Grade K-2 with no prior RIT → `state.mapVariant = "reading-k2"`, route to `mapReadingK2View`.
- Grade 2-5 or RIT > 170 → `state.mapVariant = "reading-2-5"`, route to `mapReading25View`.
- Overlap zone RIT 170-200 → present teacher a two-button prompt: "Use K-2 version" / "Use 2-5 version".

---

## 9. Skill Code System Extension

### Existing format (Math Quest)

```
AB3-CD5-EF|T300-N20-Gp-R100-D0
```

Segments before `|` are weighted skill pairs (2-char code + weight digit). Segments after `|` are settings tokens.

### Extended format with subject prefix

```
M:AB3-CD5|T300-N20-Gp-R100-D0     (Math — existing, unchanged)
R:EF7-GH2|T300-RB180               (Reading — new, with RIT band)
L:IJ4-KL9|T300-RB200               (Language — new, with RIT band)
```

The prefix character before `:` sets `state.subject`. If no prefix is present, the parser assumes `M` for backward compatibility with all existing Math Quest shared links.

### New settings tokens for literacy

| Token | Meaning | Example |
|---|---|---|
| `RB{n}` | RIT band center (nearest 10) | `RB180` = RIT 176-185 |
| `GR{k}` | Grade level | `GRK`, `GR2`, `GR5` |
| `EL` | ELL scaffold ON | `EL` |
| `SP` | SPED scaffold ON | `SP` |

### Parser changes in `skill-codes.js`

```js
// skill-codes.js — parseCode() additions (sketch)

export function parseCode(raw) {
    let subject = 'math';
    let code = raw;

    // Check for subject prefix
    if (/^[RLM]:/i.test(raw)) {
        const prefix = raw[0].toUpperCase();
        subject = prefix === 'R' ? 'reading' : prefix === 'L' ? 'language' : 'math';
        code = raw.slice(2);
    }

    // Existing skill + settings parsing (unchanged) ...
    const [skillPart, settingsPart] = code.split('|');

    // New settings tokens parsed alongside existing ones
    const settings = parseSettingsTokens(settingsPart ?? '');
    // settings.ritBand, settings.grade, settings.ellScaffold, settings.spedScaffold
    // are set from RB / GR / EL / SP tokens

    return { subject, skills: parseSkillPairs(skillPart), settings };
}
```

`literacy-skill-codes.js` wraps this with literacy-specific encode/decode helpers and is called from `readingHomeView` and `languageHomeView` share buttons. The core `skill-codes.js` parser is extended in place (the new tokens are simply ignored by Math Quest's skill loader, which only reads the tokens it knows).

---

## 10. Item-Set Controller

The item-set passage is the largest architectural departure from Math Quest. Math Quest generates one question, discards state, and moves on. Reading 2-5 MAP sessions require a passage to persist across 3-5 items, with shared tokenization state and anti-spoiler sequencing.

### `PassageSession` class

```js
// item-set-controller.js

export class PassageSession {
    constructor(passage, items) {
        this.passage = passage;
        // passage: { id, text, lexile, ritBand, paragraphs[], lineNumbers: boolean }

        this.items = items;
        // items: array of question objects from generateLiteracyQuestion()
        // ordered by anti-spoiler rule (see below)

        this.currentItemIndex = 0;
        this.responses = new Array(items.length).fill(null);
        this.completed = false;
    }

    currentItem() {
        return this.items[this.currentItemIndex];
    }

    recordResponse(response) {
        this.responses[this.currentItemIndex] = response;
    }

    advance() {
        if (this.currentItemIndex < this.items.length - 1) {
            this.currentItemIndex++;
        } else {
            this.completed = true;
        }
    }

    canGoBack() {
        // Allowed; does not re-score
        return this.currentItemIndex > 0;
    }

    goBack() {
        if (this.canGoBack()) this.currentItemIndex--;
    }
}
```

### Anti-spoiler sequencing

When `item-set-controller.js` receives a list of items for a passage, it applies a topological sort before storing them:

1. Items that cite specific lines/paragraphs come before any item asking about the passage as a whole.
2. Items asking for main idea or author's purpose come last (they are "summary-level" and their correct answer is implied by earlier items).
3. Items that ask about a character's motivation come before items that ask about the theme.
4. If two items have no ordering dependency, their original pool order is preserved.

### Integration with the dispatcher

```
generateLiteracyQuestion(skillId)
    └─ gen-comp-literature.js | gen-comp-info.js
           └─ detectsItemSetSkill(skillId) === true?
                  YES → calls buildPassageSession(skillId, ritBand)
                        returns PassageSession stored in state.passageSession
                  NO  → returns single question object (standard path)
```

`literacy-question-render.js` checks `state.passageSession`:
- If non-null: render passage (via `passage-render.js`) in a sticky left panel, render current item in the right panel, show "X of N" item counter at the top.
- If null: render standard single-question card.

When the item set is complete (`state.passageSession.completed === true`), `state.passageSession` is cleared to null and the session returns to the standard single-question flow.

### Passage tokenization

`passage-render.js` wraps every word, sentence, and paragraph in addressable spans on first render. The rendered DOM is cached for the lifetime of the `PassageSession` so re-renders between items do not re-tokenize.

```html
<p data-paragraph="1">
  <span data-sentence="1">
    <span data-word="1">The</span>
    <span data-word="2">quick</span>
    ...
  </span>
</p>
```

`hot-text-passage.js` reads `data-word` / `data-sentence` / `data-paragraph` attributes to implement click-to-select granularity. Line number overlays are injected as absolutely-positioned `<span>` elements for RIT 191+ citation items.

---

## 11. Two-Deck-Length Performance

Comprehension sessions use 12-15 cards per deck. Phonics and mechanics drill sessions use up to 50 cards. The engine must handle both without degradation.

Math Quest's `state.questionHistory` array (already proven across hundreds of math sessions) is reused unchanged. For literacy sessions `state.questionHistory` accumulates item results in the same format. At 50 items, the array contains at most 50 small plain-object records — negligible memory.

The `PassageSession.items` array stores 3-5 question objects per passage. Multiple passages in a 15-card comprehension session means at most 3-5 `PassageSession` instances are created across the session. Only one is live at a time in `state.passageSession`; completed sessions are pushed to `state.questionHistory` and dereferenced.

For 50-card drill decks (e.g., capitalization sort, spelling), `state.passageSession` is always null (drill skills are not item-set skills). The card loop is the standard `nextQuestion()` → `generateLiteracyQuestion()` → render → check cycle, identical to Math Quest's drill loop. No architectural change is needed.

---

## 12. No-Bundler / Browser-Native Module Compatibility

All literacy modules use `.js` extensions in every import path, matching Math Quest's convention:

```js
// Correct — browser-native ES module import
import { generatePhonicsQuestion } from './gen-phonics.js';
import { PassageSession } from './item-set-controller.js';
import { FEATURES } from '../shared/quest-core/features.js';
```

All functions called from inline HTML event handlers (`onclick`, `onchange`) must be attached to `window` via the `Object.assign(window, {...})` block in `globals.js`. For every new function callable from HTML, add both an import at the top of `globals.js` and an entry in the `Object.assign` block:

```js
// globals.js additions (sketch)
import {
    goToHub,
    showReadingHome,
    showLanguageHome,
    startLiteracySession,
    submitLiteracyAnswer,
    speakCurrentItem,
} from './modules/literacy/literacy-navigation.js';

Object.assign(window, {
    goToHub,
    showReadingHome,
    showLanguageHome,
    startLiteracySession,
    submitLiteracyAnswer,
    speakCurrentItem,
    // ... existing math functions unchanged
});
```

Cross-module calls between literacy modules that do not go through HTML handlers use direct ES module imports (not `window`). Only the HTML-event-handler boundary requires `window` attachment.

Syntax checking for all new literacy modules uses the same command as Math Quest:

```bash
node --input-type=module --check < js/modules/literacy/gen-phonics.js
```

Run this on every modified literacy module before committing.

---

## Appendix: Dependency Layer Assignment for New Modules

New literacy modules slot into Math Quest's existing 8-layer hierarchy:

| Layer | New literacy modules |
|---|---|
| L0 | `features.js` (no deps) |
| L1 | `/data/literacy-skills/*.js` (imports only L0) |
| L2 | `literacy-navigation.js`, `literacy-skill-codes.js` |
| L3 | `passage-render.js`, `item-set-controller.js` |
| L4 | All `gen-*.js` (11 generators), `literacy-question-render.js`, `literacy-answer-check.js`, all widgets |
| L5 | `map-engine-literacy.js`, `literacy-dashboard.js` |
| L7 | `literacy-init.js` (imports everything; runs last) |

No circular dependencies are introduced. Literacy modules import from `shared/quest-core/` (L0-L2) and from each other in layer order. Math Quest modules import only from `shared/quest-core/` — they never import from `/literacy/`.
