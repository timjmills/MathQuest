# Literacy Quest — Data Model

**Status:** Phase 1 draft. Authoritative specification for all literacy data structures.
**Sources:** `STUDY_NOTES.md` §2–6, `PHASE_0_DECISIONS.md`, `_drafts/k5-ela-synthesis.md` (Part 10 canonical schema), `_drafts/map-growth-synthesis.md` (NWEA norms + item types).

---

## 1. Overview

Literacy Quest is a no-bundler vanilla JS app (browser-native ES modules, no build step) that shares its infrastructure with Math Quest. This document specifies every data schema used at runtime.

| Schema | Lives in | Used by |
|---|---|---|
| `SkillAtom` | `/data/literacy-skills/<strand>/<domain>.js` | Skill selector, deck builder, diagnostic routing, progress tracker |
| `Question` | Generated at runtime by `gen-literacy-*.js` modules | Renderer, answer-checker, MAP adaptive engine |
| `Passage` | `/data/passages/<lexile-band>/<id>.js` | Passage renderer, item-set session controller |
| `PassageSession` | Runtime object, never persisted | Item-set session controller (`passage-session.js`) |
| `StudentProgress` | `localStorage["mathquest_literacy_progress"]` | Skill selector, mastery display, spaced review scheduler |
| `DeckConfig` | URL `?code=R:...` / cookie | Deck loader, shared-deck landing page |
| `MapItem` | Runtime extension of `Question` | MAP mode adaptive engine |
| `MapSession` | Runtime object, never persisted | MAP session controller |
| `MapResult` | `localStorage["mathquest_literacy_session_history"]` | Results view, dashboard |

### Implementation duality

TypeScript-style `interface` blocks in this file are **documentation only** — they define the shape every object must conform to, but the actual implementation uses plain JS objects with JSDoc `@type` annotations:

```js
// In /data/literacy-skills/phonics/short-vowels.js
/** @type {SkillAtom} */
const phonics_short_a_initial = { ... };
```

The TS interfaces here are the source of truth. Every field listed is required unless explicitly marked optional (`?`). No `any` types — all fields are fully specified.

---

## 2. SkillAtom Interface

Every skill in the 600–900 atom library is a `SkillAtom` object stored in a static JS file under `/data/literacy-skills/`. Atoms missing any required field will fail the schema validator that runs on import.

```typescript
interface SkillAtom {
  // Identity
  skill_id: string;              // snake_case: <strand>_<domain>_<sub_domain>_<specifier>
                                 // e.g., "phonics_short_vowel_short_a_initial"
  subject: "reading" | "language";
  strand:  "phonemic_awareness" | "phonics" | "fluency" | "vocabulary"
         | "comprehension_lit"  | "comprehension_info"
         | "grammar" | "sentence_structure" | "mechanics" | "writing";
  domain: string;                // e.g., "short_vowels", "sight_words", "verb_tense"
  sub_domain: string;            // e.g., "cvc_words", "heart_words", "irregular_past"
  developmental_band: "K-1" | "2-3" | "4-5+";
  skill_statement: string;       // One-sentence teachable description for UI display

  // Tag 1 — CCSS alignment
  ccss_codes: string[];          // e.g., ["RF.K.3a", "RF.1.3b"]; empty [] if no CCSS code

  // Tag 2 — NWEA MAP RIT alignment
  rit_band: string;              // e.g., "141-150"; "n/a" if not MAP-testable
  rit_test: "Reading K-2" | "Reading 2-5" | "Language Usage 2-12" | null;
                                 // null = not MAP-aligned
  rit_instructional_area: string;
                                 // e.g., "Foundational Skills - Phonics - Decoding"; "" if n/a

  // Tag 3 — IXL skill codes
  ixl_skills: string[];          // e.g., ["A.57 Choose the short a word (Kindergarten)"]

  // Tag 4 — Science of Reading citations
  sor_citations: string[];       // Full bibliographic strings

  // Differentiation scaffolds
  ell_scaffold: string;          // Single-sentence ELL strategy for this skill
  sped_scaffold: string;         // Single-sentence SPED strategy for this skill

  // Skill dependency graph (DAG)
  prerequisite_skill_ids: string[];  // 1–3 skill_ids that must be introduced first
  next_skill_ids: string[];          // 1–3 skill_ids unlocked on mastery

  // Mastery criteria
  mastery_criteria: {
    accuracy: number;                  // Threshold ratio, canonical value: 0.85
    consecutive_sessions: number;      // Sessions at/above accuracy before mastery, canonical: 2
    fluency_target_per_min: number;    // Items/minute (0 if not a timed/fluency skill)
  };

  // Diagnostic anchor (no in-app diagnostic per PHASE_0_DECISIONS; field kept for documentation)
  // Used by teachers referencing external placement tools.
  diagnostic_anchor: string;          // e.g., "UFLI Placement Test Set 1 (short vowels)"
                                      // Empty string "" if no external anchor exists

  // Computed: true when rit_test != null && rit_band != "n/a" && rit_band != ""
  // Do NOT store this — compute it at runtime: `atom.rit_test != null && atom.rit_band !== "n/a"`
  // is_map_tested: boolean

  // Mechanics (question types) this skill supports — minimum 3 required
  question_types: string[];      // e.g., ["multiple_choice", "fill_in_blank", "drag_sort"]
                                 // See Section 13 for valid mechanic identifiers
}
```

### JSDoc example

```js
/** @type {SkillAtom} */
const phonics_short_a_initial = {
  skill_id: "phonics_short_vowel_short_a_initial",
  subject: "reading",
  strand: "phonics",
  domain: "short_vowels",
  sub_domain: "cvc_words",
  developmental_band: "K-1",
  skill_statement: "Decode CVC words with short /a/ in the initial position (at, am, an, ax).",
  ccss_codes: ["RF.K.3a", "RF.1.3b"],
  rit_band: "141-150",
  rit_test: "Reading K-2",
  rit_instructional_area: "Foundational Skills - Phonics - Decoding",
  ixl_skills: ["A.57 Choose the short a word (Kindergarten)"],
  sor_citations: [
    "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning. Scientific Studies of Reading, 18(1), 5–21."
  ],
  ell_scaffold: "Pre-teach /æ/ phoneme contrast with /e/ and /ɪ/ using Arabic L1 mirrors; show picture card for each CVC word.",
  sped_scaffold: "Use Elkonin sound boxes with chips; finger-tap each phoneme before blending.",
  prerequisite_skill_ids: ["pa_phoneme_isolation_initial", "letter_naming_a"],
  next_skill_ids: ["phonics_short_vowel_short_a_medial", "phonics_short_vowel_short_a_final"],
  mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 30 },
  diagnostic_anchor: "UFLI Placement Test Set 1 (short vowels)",
  question_types: ["multiple_choice", "fill_in_blank", "drag_sort"]
};
```

---

## 3. Question Interface

Individual questions are generated at runtime by `gen-literacy-*.js` modules (mirrors the `gen-*.js` pattern in Math Quest). No question objects are stored in static files.

```typescript
interface Question {
  id: string;                        // Unique per session: "<skill_id>_<timestamp>_<rand>"
  skill_ids: string[];               // 1+ skill_ids this question covers (usually 1; multi for review)
  question_type: string;             // One of the mechanic identifiers (see Section 13)
  stem: string;                      // Question text shown to student; may contain HTML
  passage_id?: string;               // Optional — links to a Passage for item-set questions
  options?: string[];                // MC / multi-select / drag-sort choices; null for FIB/text-entry
  correct_answer: string | string[]; // string for single answer; string[] for multi-select/drag-sort
  distractor_misconceptions: Record<string, string>;
                                     // Keys: distractor values; values: misconception description
                                     // e.g., { "beg": "student confused /b/-/d/ reversal" }
  hints: string[];                   // Progressive hints; index 0 is first hint shown
  rit_difficulty: number;            // RIT value for this item's difficulty (Rasch b parameter)
  grade_level: number | "K";        // Canonical grade level of this item (K=0 for sorting)
  has_audio: boolean;                // Whether Web Speech TTS fires automatically on card load
  k2_appropriate: boolean;           // true = 3 options max, large-pill buttons, audio mandatory
  accept_list?: string[];            // FIB/text-entry: all acceptable correct spellings/phrasings
  case_sensitive?: boolean;          // FIB toggle; default false
  normalize_whitespace?: boolean;    // FIB toggle: strip extra spaces before comparison; default true
}
```

---

## 4. Passage Interface

Passages support item-set questions (Reading 2–5) and standalone reading comprehension. Paragraphs are pre-tokenized so the renderer can wrap each unit in addressable `<span>` elements.

```typescript
interface Passage {
  id: string;                        // Unique passage identifier, e.g., "passage_info_G3_ecosystems_01"
  text: string;                      // Full passage as a single string (source of truth for TTS)
  paragraphs: string[];              // Pre-split paragraphs; renderer iterates over this array.
                                     // Each paragraph is further tokenized client-side into sentences
                                     // and words via the passage renderer, adding:
                                     //   data-paragraph="N"
                                     //   data-sentence="N.M"
                                     //   data-word="N.M.W"
                                     // This supports hot-text (selectable-text) at all granularities.
  lexile: number;                    // Lexile measure, e.g., 465
  word_count: number;
  genre: "literary" | "informational";
  sub_genre: string;                 // e.g., "narrative_fiction", "science_nonfiction", "biography"
  topic_tags: string[];              // e.g., ["ecosystems", "food_chains", "grade3_science"]
  text_features: string[];           // Informational: ["heading", "caption", "bold_vocabulary"]
                                     // Literary: ["dialogue", "flashback"]
  is_authentic: boolean;             // true = real published text; false = purpose-written
  source_attribution: string;        // Attribution string; "" for purpose-written passages
  recommended_rit_band: string;      // e.g., "187-197"; matched to items in this band
  audio_text?: string;               // Optional override for TTS narration (e.g., adds pronunciation
                                     // hints for proper nouns). Falls back to `text` if absent.
                                     // Synthesized live via Web Speech API (no audio asset files).
}
```

The renderer's tokenization step (client-side, on passage load):

```js
// passage-renderer.js
function tokenizePassage(passage) {
  return passage.paragraphs.map((para, pIdx) => {
    const sentences = para.match(/[^.!?]+[.!?]*/g) || [para];
    return sentences.map((sent, sIdx) => {
      const words = sent.trim().split(/\s+/);
      return words.map((word, wIdx) => ({
        text: word,
        attrs: {
          "data-paragraph": pIdx,
          "data-sentence": `${pIdx}.${sIdx}`,
          "data-word": `${pIdx}.${sIdx}.${wIdx}`
        }
      }));
    });
  });
}
```

---

## 5. PassageSession Interface

Runtime-only object created by `passage-session.js` when a Reading 2–5 item set begins. Never serialized to localStorage.

```typescript
interface PassageSession {
  passage: Passage;
  items: Question[];                 // 3–5 items anchored to this passage
  currentItemIndex: number;         // 0-based pointer into items[]
  answeredItems: Set<string>;        // Set of Question.id strings for items already answered
  antiSpoilerOrder: string[];        // Question.id[] reordered so later items don't reveal earlier answers
                                     // Computed by passage-session.js on session init
}
```

Anti-spoiler ordering rule: items that cite or select specific text portions are placed after general-comprehension items; inference items after literal-recall items. The ordering is resolved once at session creation and never reshuffled mid-session.

---

## 6. StudentProgress Interface

Per-skill progress tracked locally per browser. The literacy namespace is separate from the Math Quest namespace to avoid key collisions.

```typescript
interface StudentProgress {
  skill_id: string;
  attempts: number;                          // Lifetime total attempts
  accuracy_history: Array<{
    date: string;                            // ISO 8601 date string, e.g., "2026-05-03"
    correct: number;
    total: number;
  }>;
  last_practiced: number;                    // Unix timestamp (ms), 0 if never
  mastery_level:
    | "not_started"
    | "introducing"      // accuracy < 0.70 — errorless intro mechanics only
    | "developing"       // accuracy 0.70–0.84 — graduated to harder mechanics
    | "approaching_mastery"  // accuracy ≥ 0.85, < 2 consecutive sessions
    | "mastered";        // accuracy ≥ 0.85 across 2+ consecutive sessions → spaced review
  current_rit_estimate: number | null;       // null until ≥3 sessions on MAP-aligned skills
  in_review: boolean;                        // true = currently in spaced review rotation
  spaced_review_due_date: string | null;     // ISO 8601 date; null if not in review
                                             // Schedule: mastery → +1d → +3d → +7d → +14d → +30d
  mechanics_seen: string[];                  // question_type strings seen this skill (for variety tracking)
                                             // Stored as plain array in JSON (Set not serializable)
}
```

**localStorage key:** `mathquest_literacy_progress`

**Shape on disk:**
```json
{
  "phonics_short_vowel_short_a_initial": {
    "skill_id": "phonics_short_vowel_short_a_initial",
    "attempts": 24,
    "accuracy_history": [
      { "date": "2026-05-01", "correct": 7, "total": 8 },
      { "date": "2026-05-03", "correct": 8, "total": 8 }
    ],
    "last_practiced": 1746268800000,
    "mastery_level": "mastered",
    "current_rit_estimate": 145,
    "in_review": true,
    "spaced_review_due_date": "2026-05-06",
    "mechanics_seen": ["multiple_choice", "fill_in_blank", "drag_sort"]
  }
}
```

---

## 7. DeckConfig Interface

Shareable deck configurations are encoded in the URL as `?code=R:<compact_string>` or `?code=L:<compact_string>`. Subject prefix distinguishes literacy from math (`M:`).

```typescript
interface DeckConfig {
  subject: "R" | "L";             // R = Reading, L = Language Usage; M = Math (existing)
  skill_ids: Array<{
    skill_id: string;
    weight: number;                // Relative frequency weight, 1–9 (maps to Math Quest's existing encoding)
  }>;
  settings: {
    timer: number | null;          // Seconds per question; null = untimed
    count: number;                 // Questions in this deck, e.g., 20
    ell_scaffold: boolean;         // Enable ELL differentiation layer
    sped_scaffold: boolean;        // Enable SPED differentiation layer
    rit_band: string | null;       // e.g., "141-150"; null = use student's stored estimate
    audio_default: boolean;        // true = autoplay TTS on every card load
    mechanics_filter: string[];    // If non-empty, restrict to these question_type strings only
    deck_size: number;             // Alias for count; used by deck loader
  };
}
```

**URL encoding:** Extends `skill-codes.js` with a subject prefix. Examples:
- `?code=R:EF7-GH2|T30-N20-R141` — Reading deck, 2 skills weighted 7 and 2, 30s timer, 20 questions, RIT 141
- `?code=L:IJ4-KL9|N15` — Language Usage deck, 2 skills, 15 questions
- `?code=M:AB3|T60` — Math deck (existing format, unchanged)

The `|` separator and key prefixes (`T`, `N`, `G`, `R`, `D`) are the same as Math Quest's extended format. Literacy adds: `E1`/`E0` (ELL), `S1`/`S0` (SPED), `A1`/`A0` (audio default).

---

## 8. MAP-Mode-Specific Schemas

### MapItem Interface

```typescript
interface MapItem extends Question {
  item_difficulty_rit: number;   // Rasch b parameter (same as rit_difficulty, but named explicitly)
  item_instructional_area: string;
                                 // e.g., "Literary Text", "Vocabulary", "Grammar and Usage"
  is_field_test: boolean;        // true = unscored field-test item (5–10% of items administered)
}
```

### MapSession Interface

```typescript
interface MapSession {
  test_variant: "Reading K-2" | "Reading 2-5" | "Language Usage 2-12";
  items_administered: MapItem[]; // All items presented (scored + field-test)
  current_rit_estimate: number;  // θ updated after each response via Rasch 1PL
  area_balance: Record<string, number>;
                                 // Keys: instructional area names; values: items used so far
  total_items_target: 43;        // Fixed; field-test buffer sits on top
  field_test_count: number;      // Running total of unscored items administered
  instructional_area_proportions: Record<string, number>;
                                 // Reading 2-5: { "Literary Text": 0.30, "Informational Text": 0.30,
                                 //                "Vocabulary": 0.25, "Cross-cutting": 0.15 }
                                 // Language Usage: { "Grammar and Usage": 0.40,
                                 //                   "Mechanics": 0.30, "Writing": 0.30 }
}
```

### MapResult Interface

```typescript
interface MapResult {
  test_variant: "Reading K-2" | "Reading 2-5" | "Language Usage 2-12";
  final_rit: number;             // Final θ after 43 scored items
  area_breakdown: Record<string, number>;
                                 // Keys: instructional area names; values: area-specific RIT estimates
  growth_target: number;         // RIT points of expected growth to next season (from 2025 norms table)
  percentile: number;            // 1–99, computed from NWEA_NORMS_2025 for grade + season
  norms_year: 2025;              // Always 2025 per PHASE_0_DECISIONS
  grade: number | "K";
  season: "fall" | "winter" | "spring";
  items_correct: number;
  items_total: number;           // Always 43
  date: string;                  // ISO 8601
}
```

---

## 9. NWEA 2025 Norms Table

> **Note:** The values below are **2020 NWEA published norms** (the canonical published dataset). NWEA released 2025 norms in August 2025, calibrated to the post-EISA cohort; these run approximately **2 RIT points lower** than the 2020 figures across all grades and seasons. When the 2025 published tables are available for import, replace the `mean` values below and update the comment. The `sd` values are expected to remain nearly identical.

```js
/**
 * NWEA norming data for RIT score interpretation.
 * Structure: grade (string) → season → { mean, sd }
 * Grades K–6 for Reading; 2–11 for Language Usage.
 * 2025 estimates = 2020 published mean − 2.0 (applied uniformly per NWEA shift documentation).
 * @type {Record<string, Record<"fall"|"winter"|"spring", {mean: number, sd: number}>>}
 */
const NWEA_NORMS_2025 = {
  reading: {
    "K":  { fall: { mean: 134.65, sd: 12.22 }, winter: { mean: 144.28, sd: 11.78 }, spring: { mean: 151.09, sd: 12.06 } },
    "1":  { fall: { mean: 153.93, sd: 12.66 }, winter: { mean: 163.85, sd: 13.21 }, spring: { mean: 169.40, sd: 14.19 } },
    "2":  { fall: { mean: 170.35, sd: 15.19 }, winter: { mean: 179.20, sd: 15.05 }, spring: { mean: 183.57, sd: 15.49 } },
    "3":  { fall: { mean: 184.62, sd: 16.65 }, winter: { mean: 191.90, sd: 16.14 }, spring: { mean: 195.12, sd: 16.27 } },
    "4":  { fall: { mean: 194.67, sd: 16.78 }, winter: { mean: 200.50, sd: 16.25 }, spring: { mean: 202.83, sd: 16.31 } },
    "5":  { fall: { mean: 202.48, sd: 16.38 }, winter: { mean: 207.12, sd: 15.88 }, spring: { mean: 208.98, sd: 15.97 } },
    "6":  { fall: { mean: 208.17, sd: 16.46 }, winter: { mean: 211.81, sd: 15.98 }, spring: { mean: 213.36, sd: 16.03 } },
    "8":  { fall: { mean: 216.01, sd: 17.04 }, winter: { mean: 218.52, sd: 16.69 }, spring: { mean: 219.66, sd: 16.87 } },
    "10": { fall: { mean: 219.47, sd: 17.92 }, winter: { mean: 220.91, sd: 17.81 }, spring: { mean: 221.51, sd: 18.20 } }
  },
  language_usage: {
    "2":  { fall: { mean: 171.98, sd: 16.06 }, winter: { mean: 181.83, sd: 15.40 }, spring: { mean: 186.40, sd: 15.89 } },
    "3":  { fall: { mean: 185.71, sd: 15.33 }, winter: { mean: 193.14, sd: 14.64 }, spring: { mean: 196.32, sd: 14.65 } },
    "4":  { fall: { mean: 195.33, sd: 15.10 }, winter: { mean: 200.87, sd: 14.44 }, spring: { mean: 203.00, sd: 14.33 } },
    "5":  { fall: { mean: 202.17, sd: 14.55 }, winter: { mean: 206.45, sd: 13.98 }, spring: { mean: 208.19, sd: 13.90 } },
    "7":  { fall: { mean: 210.65, sd: 14.72 }, winter: { mean: 213.28, sd: 14.39 }, spring: { mean: 214.47, sd: 14.42 } },
    "9":  { fall: { mean: 214.68, sd: 15.52 }, winter: { mean: 216.18, sd: 15.30 }, spring: { mean: 217.00, sd: 15.51 } },
    "11": { fall: { mean: 218.66, sd: 14.94 }, winter: { mean: 219.86, sd: 14.98 }, spring: { mean: 220.33, sd: 15.53 } }
  }
};
```

Percentile computation: `percentile = Φ((student_rit − norm.mean) / norm.sd) × 100`, where Φ is the standard normal CDF. Use a lookup table or the approximation from `utils.js`.

---

## 10. Hasbrouck-Tindal 2017 ORF Norms

Used exclusively by fluency mode. The app looks up the student's grade + current season to determine the 50th percentile WCPM target. ELL context uses 25th percentile as the urgent-intervention floor instead.

```js
/**
 * Hasbrouck & Tindal (2017) Oral Reading Fluency norms.
 * Percentile columns: 90th, 75th, 50th, 25th, 10th.
 * Grades 1–8; seasons: fall, winter, spring.
 * Unit: words correct per minute (WCPM).
 * Source: Hasbrouck, J., & Tindal, G. (2017). An update to compiled ORF norms.
 *         Technical Report No. 1702. Behavioral Research and Teaching, University of Oregon.
 * @type {Record<string, Record<"fall"|"winter"|"spring", Record<"p90"|"p75"|"p50"|"p25"|"p10", number>>>}
 */
const HT_ORF_NORMS_2017 = {
  "1": {
    fall:   { p90: null, p75: null, p50: null, p25: null, p10: null }, // Grade 1 fall: no norm (not yet tested)
    winter: { p90: 82,   p75: 58,   p50: 36,   p25: 15,   p10: 6   },
    spring: { p90: 117,  p75: 93,   p50: 68,   p25: 37,   p10: 18  }
  },
  "2": {
    fall:   { p90: 111,  p75: 89,   p50: 68,   p25: 45,   p10: 25  },
    winter: { p90: 131,  p75: 109,  p50: 87,   p25: 61,   p10: 35  },
    spring: { p90: 148,  p75: 124,  p50: 100,  p25: 72,   p10: 43  }
  },
  "3": {
    fall:   { p90: 134,  p75: 111,  p50: 83,   p25: 59,   p10: 37  },
    winter: { p90: 157,  p75: 131,  p50: 103,  p25: 74,   p10: 47  },
    spring: { p90: 168,  p75: 143,  p50: 112,  p25: 79,   p10: 49  }
  },
  "4": {
    fall:   { p90: 160,  p75: 136,  p50: 109,  p25: 77,   p10: 50  },
    winter: { p90: 173,  p75: 148,  p50: 120,  p25: 89,   p10: 59  },
    spring: { p90: 180,  p75: 156,  p50: 133,  p25: 100,  p10: 68  }
  },
  "5": {
    fall:   { p90: 177,  p75: 154,  p50: 128,  p25: 93,   p10: 63  },
    winter: { p90: 187,  p75: 163,  p50: 139,  p25: 105,  p10: 73  },
    spring: { p90: 194,  p75: 169,  p50: 146,  p25: 112,  p10: 79  }
  },
  "6": {
    fall:   { p90: 183,  p75: 160,  p50: 135,  p25: 105,  p10: 74  },
    winter: { p90: 193,  p75: 168,  p50: 144,  p25: 112,  p10: 79  },
    spring: { p90: 199,  p75: 174,  p50: 150,  p25: 116,  p10: 83  }
  },
  "7": {
    fall:   { p90: 189,  p75: 166,  p50: 141,  p25: 108,  p10: 76  },
    winter: { p90: 196,  p75: 172,  p50: 148,  p25: 114,  p10: 80  },
    spring: { p90: 202,  p75: 177,  p50: 153,  p25: 118,  p10: 84  }
  },
  "8": {
    fall:   { p90: 194,  p75: 171,  p50: 148,  p25: 112,  p10: 79  },
    winter: { p90: 199,  p75: 176,  p50: 151,  p25: 118,  p10: 84  },
    spring: { p90: 202,  p75: 180,  p50: 155,  p25: 120,  p10: 86  }
  }
};
```

**ELL fluency threshold:** `HT_ORF_NORMS_2017[grade][season].p25` — flag when student is at or below this value. Standard classroom target uses `p50`. Grade 1 fall has no published norms (testing begins winter/spring).

---

## 11. Storage and Persistence Schema

### localStorage keys

| Key | Content |
|---|---|
| `mathquest_literacy_progress` | `Record<skill_id, StudentProgress>` — full progress object per skill |
| `mathquest_literacy_session_history` | `MapResult[]` — last 50 completed sessions, newest first |
| `mathquest_literacy_streak` | `{ current: number, longest: number, last_date: string }` |

The literacy keys are **deliberately namespaced separately** from `mathquest_skill_progress` (the existing math key). They will never collide.

### Cookie

**Key:** `mathquest_literacy_settings`

**Shape (JSON-encoded, same cookie helpers as `storage.js`):**
```json
{
  "ell_scaffold": false,
  "sped_scaffold": false,
  "last_grade": "5",
  "last_rit_band": "198-210",
  "audio_enabled": true
}
```

### URL parameters

| Parameter | Example | Meaning |
|---|---|---|
| `?code=R:...` | `?code=R:EF7-GH2\|T30-N20` | Reading deck via short code |
| `?code=L:...` | `?code=L:IJ4\|N15-S1` | Language Usage deck |
| `?c=R:...` | Short alias for `?code=` | Same as above |
| `?code=M:...` | Existing math format, unchanged | Math deck |

Subject prefix rules: `M:` = Math Quest (existing, never changed), `R:` = Reading, `L:` = Language Usage. The compact encoding within each prefix follows the same `AB3-CD5|T300-N20-R141` format as `skill-codes.js`.

### IndexedDB

**Not used for literacy.** The existing `quiz-storage.js` IndexedDB store (`mathquest_quizzes`) remains math-only. Literacy has no quiz-builder feature in Phase 1. If a quiz feature is added in a later phase, it will use a separate object store (`literacy_quizzes`) in the same database.

---

## 12. The Variety Rule

Every deck for a non-fluency-drill skill must use at least 3 distinct question mechanics within a 10-card window. The deck loader enforces this at build time.

```js
/**
 * Build a deck of `count` questions for `skill`, rotating mechanics
 * so that no mechanic repeats within a 3-card window.
 * Exception: fluency drill skills (is_fluency_drill = true) repeat by design.
 *
 * @param {SkillAtom} skill
 * @param {number} count
 * @returns {string[]}  ordered array of question_type strings
 */
function buildDeckMechanics(skill, count) {
  const mechanics = skill.question_types;  // ≥ 3 mechanics required

  if (skill.is_fluency_drill) {
    // Fluency drills: all cards use the same mechanic (timed repeated reading)
    return Array(count).fill(mechanics[0]);
  }

  if (mechanics.length < 3) {
    console.warn(`Skill ${skill.skill_id} has fewer than 3 question_types. Variety rule cannot be met.`);
  }

  const result = [];
  const window = [];  // last 3 mechanics used

  for (let i = 0; i < count; i++) {
    // Pick the next mechanic not in the 3-card recency window
    const available = mechanics.filter(m => !window.includes(m));
    const pick = available.length > 0
      ? available[i % available.length]
      : mechanics[i % mechanics.length];  // fallback if fewer than 3 mechanics exist

    result.push(pick);
    window.push(pick);
    if (window.length > 3) window.shift();
  }

  return result;
}
```

The `is_fluency_drill` property is computed at deck-build time from the skill's `strand`:

```js
const is_fluency_drill = skill.strand === "fluency";
```

---

## 13. Naming Conventions

### Skill ID format

`<strand>_<domain>_<sub_domain>_<specifier>` — all lowercase snake_case.

Examples:
- `phonics_short_vowel_short_a_initial`
- `vocabulary_tier2_context_clues_synonym`
- `grammar_verb_tense_irregular_past`
- `mechanics_punctuation_comma_series`

### Valid `strand` values

| Value | Reading/Language | Part |
|---|---|---|
| `phonemic_awareness` | Reading | Part 1 |
| `phonics` | Reading | Part 2 |
| `fluency` | Reading | Part 3 |
| `vocabulary` | Reading | Part 4 |
| `comprehension_lit` | Reading | Part 5A |
| `comprehension_info` | Reading | Part 5C |
| `grammar` | Language | Part 6 |
| `sentence_structure` | Language | Part 7 |
| `mechanics` | Language | Part 8 |
| `writing` | Language | Part 9 |

### Valid `question_type` (mechanic) identifiers

| Identifier | Description | Stage |
|---|---|---|
| `multiple_choice` | Single-select, text or image options | 1 |
| `multi_select` | Choose all correct options | 1 |
| `fill_in_blank` | Text entry with accept_list | 1 |
| `drag_sort` | Drag to categorize / sequence | 1 |
| `tap_hotspot` | Tap the correct element in a passage or image | 1 |
| `click_pop` | Move letter/word tokens into slots | 1 |
| `selectable_text` | Click words/sentences/paragraphs in a passage | 1 |
| `true_false` | Binary correct/incorrect judgment | 1 |
| `word_tag` | Color-code words by grammatical role (Grammar Detective) | 2 |
| `audio_drag_spell` | Hear phoneme → drag letter tiles into order | 2 |
| `tap_classify` | Tap a syllable then tap its syllable-type label | 2 |
| `heart_word` | Grapheme mapping with irregular "heart" highlighted | 2 |
| `fluency_timed` | Timed passage read with WCPM tracking | 3 |

---

*End of DATA_MODEL.md — v1.0, 2026-05-03*
