# Phase 0 — User Decisions on Open Questions

User reviewed `STUDY_NOTES.md` on 2026-05-03 and answered the 8 open questions in §10. These answers are authoritative for Phase 1 onwards.

| # | Question | Decision |
|---|---|---|
| 1 | Build order priority | **Builder's call.** Going Phonics first (matches Tim's classroom focus + ~300 atoms — biggest payoff), then fluency / vocab / comprehension / grammar / mechanics / writing. Phonemic awareness scaffolds Phonics and is built alongside it as foundational. |
| 2 | Audio pipeline | **Free Web Speech API.** No Polly Neural / ElevenLabs. Web Speech is what Math Quest already uses (`hints-speech.js` with voice warming + cancel-stall workarounds); reuse the same module. K-2 still gets audio default ON, but it's synthesized live, not pre-rendered. |
| 3 | Norms year default | **2025 NWEA norms.** Newer cohort, post-EISA calibrated. No 2020 toggle for now (can add later if teachers ask). |
| 4 | Voice Memo | **Build as local-only self-monitoring (revised 2026-05-04).** Student records via MediaRecorder API → Blob stored in memory only → student plays back → recording auto-deletes when they advance to the next card. No server upload, no localStorage persistence beyond the current card, no teacher visibility, no parental consent UX. Mirrors Boom's pattern but cleaner. Useful for fluency oral reading, articulation self-check, pronunciation rehearsal. |
| 5 | Item content authoring | **AI-generated.** Procedural generators per skill (mirrors Math Quest's `gen-*.js` pattern). Each generator takes a skill atom + difficulty band and produces a templated item with word lists, passages, distractors. No human-authored content library; no item-authoring UI in Stage 2. |
| 6 | Skill code system | **Unified code system.** Extend the existing `?code=` URL scheme (Math Quest's `skill-codes.js`) to handle literacy decks too. Same compact format, with subject prefix (e.g., `M:` for math, `R:` for reading, `L:` for language) so a single URL can encode any subject's deck. |
| 7 | Login / roster | **Same anonymous setup as MAP Quest math.** No login, no roster, no class lists. Skill picker → grade selector → MAP RIT band selector → start practice. Reports live in the existing dashboard scoped to the local browser session/cookie. |
| 8 | Diagnostic placement test | **No placement test.** Student picks their RIT band manually from a dropdown (same UX as MAP Quest math). Skip the 30-40 item adaptive diagnostic. |

## Implications for Phase 1

- **No login / no roster** — every report is per-browser session. We don't need a "Needs Grading" cross-student queue (Stage 3 Boom feature) since there is no student identity.
- **AI-generated content** means the build is pure code: no item-authoring UI, no content vendor deliverables, no JSON content imports. Each skill atom maps to a generator function. Mirrors `gen-fractions.js`-style modules in Math Quest exactly.
- **Voice Memo dropped** simplifies Stage 3 considerably. We only need the manual-grading queue for open-response FIB and Ink.
- **Web Speech API only** simplifies the audio pipeline — no asset cache, no CDN, no parental-consent storage. Just `speakQuestion()` with the existing voice-warming code.
- **2025 norms** — RIT thresholds calibrated to post-EISA cohort. Grade-level means run ~2 RIT lower than 2020.
- **No placement test** — first-launch UX is a grade picker + RIT band picker, with sensible defaults from the 2025 norms table.
- **Unified code system** — one `?code=` URL share scheme across math, reading, language. The format extends to `M:AB3-CD5|...`, `R:EF7-GH2|...`, `L:IJ4-KL9|...` with subject prefix.
- **Phonics-first build order** — phonics + phonemic awareness atoms ship in MVP. Other strands stub the schema and graph but content waits for later sprints.

## Update — 2026-05-04 — Voice Memo amended

User clarified Q4 decision: voice recording is wanted as a **local-only self-monitoring tool**, not the original "drop entirely" stance.

**Spec for the `voice-memo.js` widget** (Stage 2 deliverable, queued for Phase 2 Wave 3):

- **Tasks where it appears**: Fluency oral reading drills, articulation self-check on phonics atoms, pronunciation rehearsal on vocabulary, prosody practice on comprehension passages. Tagged on a SkillAtom via `question_types` including `voice-memo` OR an opt-in `voice_memo_available: true` flag at the card level.
- **Recording**: Web `MediaRecorder` API. Microphone permission prompted on first use; remembered per-origin by the browser. Recording duration cap: **30 seconds** (longer than Boom's 10s but matches teacher need for short oral reading samples).
- **Storage**: in-memory `Blob` only. Wrapped in a `URL.createObjectURL(blob)` for playback. **NOT** persisted to localStorage, IndexedDB, or any server. Survives only the current card's lifetime in JavaScript.
- **Auto-delete**: When the student advances to the next card (`nextLiteracyQuestion()` is called), `URL.revokeObjectURL()` runs and the Blob reference is cleared. When the session ends or the page unloads, all blobs are revoked.
- **UI states**: idle (red mic button) → recording (pulsing red + duration counter) → ready (play button + re-record button + duration label) → playing (pause button). Student can re-record as many times as they want during the card.
- **No transcript, no scoring**: this is purely metacognitive. The student listens to themselves, decides if their reading was good, and moves on. Does NOT contribute to mastery tracking, accuracy %, or any report.
- **Accessibility**: visible recording state, large 60px+ buttons, keyboard accessible (Space to start/stop), aria-live announcing state changes.
- **Privacy notice**: small "🔒 Recording stays on your device only — not uploaded, not saved." line below the recorder button.

This widget does NOT count as one of the Boom limitations surpassed (the differentiation was "save server-side with teacher visibility" — we're explicitly NOT doing that). The Stage 4 differentiator "server-stored voice recording with longer durations" remains deferred / dropped given the local-only decision.

## Update — 2026-05-04 — Voice Memo minimum-duration thresholds

User added: each voice-memo task has a **minimum recording duration**. If the student stops recording before the threshold, show a friendly popup: "Whoops, too fast! Try reading more slowly so you can hear yourself clearly." Recording is discarded; student must re-record.

### Threshold-by-task table (defaults)

| Task type | Minimum seconds | Reasoning |
|---|---|---|
| Single-word articulation | 3s | One word + slight pause |
| Single phoneme isolation | 2s | "/æ/ /æ/ /æ/" — need at least one repetition |
| Sight-word recognition (single word read aloud) | 3s | Quick read |
| Sentence prosody (short sentence, 5-10 words) | 5s | Natural rhythm + pause |
| Sentence prosody (longer sentence, 10-20 words) | 7s | More content |
| Paragraph oral reading (1-3 sentences) | 10s | Comprehensible chunk |
| Paragraph oral reading (full paragraph 4-8 sentences) | 15s | Full paragraph |
| Passage oral reading (entire ORF passage) | 25s | Full grade-level passage |

### Schema addition

Each SkillAtom that includes `voice-memo` in its `question_types` array carries a `voice_memo_min_seconds` field on the atom (or each individual question can override via `q.voice_memo_min_seconds`). Default falls through to the table above based on `q.task_type`.

### Popup UX

- Modal dialog (or bottom toast — TBD by widget agent), friendly tone, ≤2 sentences.
- Single button: "Try again" — clears the recording, returns to idle state, mic button ready.
- No penalty, no error sound — encourage retry.
- Optional second-tier nudge after 3 too-fast attempts in a row: "Take a deep breath. Read each word slowly. You don't need to rush."

### Maximum cap

The 30-second hard cap from the prior update stays. Above 30s, recording auto-stops (no popup needed — they got their full reading time).

### Optional Stage 3 enhancement (deferred)

Detect not just duration but speech presence (e.g., RMS amplitude check on the audio stream). If the student records 10s of silence → "Hmm, I couldn't hear you. Make sure your microphone is on." This is a nice-to-have; out of scope for the Stage 2 widget.

## Update — 2026-05-04 — Content strategy: procedural by default, curated where needed

User clarified the AI-generation decision (Q5): **most skills should be infinitely populated like Math Quest's `gen-*.js` modules**, but a subset of skills genuinely require human-curated or hand-designed content (especially comprehension passages and writing prompts).

### Strategy table by strand

| Strand | Strategy | Why |
|---|---|---|
| Phonemic Awareness | **Procedural** | Word banks × phoneme positions × mechanics. Infinite combinations. |
| Phonics | **Procedural** | Word lists by pattern (CVC, CVCe, vowel teams, etc.) × mechanics. The 50 atoms in phase 1 each have a word bank that the generator combines. Infinite. |
| Sight Words | **Procedural** | Dolch + Fry 1-1000 + heart-words lists. Generator shuffles + picks N per session. |
| Spelling | **Procedural** | Rule-based generation (FLOSS, doubling, drop-e, change-y-to-i). Infinite valid words per rule. |
| Vocabulary | **Procedural for definitions/synonyms/antonyms; curated for context-passages** | Tier 2 word bank (~400 academic words) + template sentences = procedural for most. Context-clue passages with rich genuine context = curated subset. |
| Fluency (LNF, LSF, PSF, NWF) | **Procedural** | Letter / sound / phoneme generation is straightforward. |
| Fluency (ORF — passage reading) | **Curated** | Authentic, leveled passages required. Hasbrouck-Tindal norms assume genuine grade-level text. AI-generated passages are acceptable as long as they're human-reviewed for quality, level, and topic appropriateness. |
| Comprehension — Literature | **Curated** | Full stories with characters, plot, theme. Procedural generation produces shallow text that doesn't support deep comprehension. Must be hand-built or AI-generated + human-reviewed. |
| Comprehension — Informational | **Hybrid** | Short factual paragraphs (cause/effect, sequence) can be templated procedurally. Long passages with text features (headings, captions, glossaries) need curation. Hybrid: procedural for warm-up; curated for substantive practice. |
| Grammar | **Procedural** | Parts of speech × word banks × sentence templates = infinite. |
| Sentence Structure | **Procedural** | Fragments, run-ons, conjunctions all generable from templates + word banks. |
| Mechanics — Capitalization | **Procedural** | Proper-noun banks (people, places, days, months) + sentence templates. The Image 8 vertical slice is fully procedural. |
| Mechanics — Punctuation | **Procedural** | Sentence templates with strategic comma/apostrophe slots. |
| Mechanics — Spelling | **Procedural** | Already covered in Spelling row above. |
| Writing | **Curated** | Topic sentences, transitions, conclusions, opinion vs informational vs narrative — all need authentic-feeling prompts and student-grade exemplars. Procedural prompts read robotic. |

### Schema addition: `content_strategy` on SkillAtom

```js
content_strategy: 'procedural' | 'curated' | 'hybrid';
// 'procedural' (default): the generator function builds Question objects from word banks + templates
// 'curated':              the generator function picks from a pre-authored item bank (passages, prompts, models)
// 'hybrid':               the generator can do either based on q.difficulty / q.warmup flag
```

For `curated` and `hybrid` strategies, the SkillAtom also carries:

```js
curated_content_path: '/data/literacy-content/<strand>/<skill_id>/items.json';
// JSON file of pre-authored Question objects (passages, prompts, etc.)
// Bundled with the app; loaded on demand when the skill is selected
```

### Folder layout

```
/data/literacy-content/                 ← NEW for curated content (separate from skill atoms)
├── reading/
│   ├── fluency-passages/               ← ORF leveled passages
│   │   ├── grade1/
│   │   ├── grade2/
│   │   └── ...
│   ├── comp-lit-stories/               ← curated literary passages
│   │   ├── kindergarten/
│   │   └── ...
│   └── comp-info-articles/             ← curated informational passages
└── language/
    └── writing-prompts/                ← writing prompts + exemplars
```

### Procedural generator pattern

For the ~80% of skills that are procedural, the generator function in `js/modules/literacy/gen-*.js` follows Math Quest's pattern. It takes a SkillAtom + mechanic hint and returns a fully-formed Question object every call. The same generator can be called 1000+ times per session with different RNG seeds and produce non-repeating questions. Phase 2 Wave 2 catalog expansion adds atoms; the generator code for those atoms can be templated against shared word banks (e.g., `SHORT_A_WORDS = ['cat','hat','bag',...]`) and infinite questions are achieved by combinatorial coverage.

### Curated content authoring (out of scope for Phase 2 Stage 1)

The curated content folders are **stubbed empty** in Phase 2 Stage 1. Filling them is a Phase 2 Stage 3 deliverable (post-vertical-slice) and will likely involve:
- AI-generated draft passages (Claude or similar, with strict level + topic prompts)
- Human review by Tim or another teacher
- Validation against Lexile band per the RIT-to-Lexile mapping in DATA_MODEL.md
- Tagging with passage metadata (genre, topic, text features, recommended RIT band)

This decision means **vertical slice (Phase 2 Stage 1) ships only procedural skills** — phonics, grammar, mechanics work end-to-end without any curated content. Comprehension and writing skills are stubbed in Wave 2 (atoms exist, generator returns placeholder questions) but become genuinely playable only after Stage 3 content authoring.

## Update — 2026-05-04 — Image strategy parallels content strategy

User extended: **same principle for pictures**. Procedural where possible, curated when the task genuinely needs a specific illustration.

### Image strategy by task type

| Task type | Image source | Notes |
|---|---|---|
| Phonics "tap the /æ/ picture" | **Procedural — Unicode emoji** | 🍎 (apple), 🐜 (ant), 🪓 (axe) etc. Emoji bank covers ~80% of K-2 vocabulary. Free, scalable, no licensing. Works inline as `q.options[i].image = '🍎'`. |
| Vocabulary picture matching | **Procedural — emoji or stock SVG** | Same emoji bank + small inline SVG library for concepts emoji misses (e.g., a Venn diagram, a bar chart). |
| Comprehension story illustration | **Curated** | A picture that supports a specific story scene must be curated alongside the passage. Cannot be procedural. |
| Comprehension informational diagram | **Curated** | Diagrams with labels, charts, maps — these are part of the curated text-features library. |
| Sight words "tap the word *cat*" | **Procedural — emoji** | Cat emoji 🐱 works fine. |
| Letter formation models (chain images) | **Curated SVG sequence** | Letter stroke order is a fixed visual sequence; bundled as SVG frames per letter. |
| Mechanics (capitalization, punctuation) | **None / minimal** | Mostly text-only. The "Capitalize doha" card has no image. |
| Spelling tests | **Procedural emoji** | "Spell this picture: 🐶" — emoji is enough. |
| ELL L1 cognate display | **Procedural — flag + Arabic script** | Render Arabic L1 cognate as text alongside English; no bitmap needed. |
| Fluency passages | **Curated** (when ORF passages get illustrations) | Optional — most ORF passages are text-only. |
| Writing prompts | **Curated** (when prompts include a stimulus image) | Some prompts ask "Look at this picture and write..."; curated. |

### Folder layout — image library

```
/data/literacy-content/images/         ← NEW for curated images (Phase 2 Stage 3)
├── chain-images/                      ← letter formation strokes, process steps
│   ├── letters/                       ← letter-a-stroke-1.svg, letter-a-stroke-2.svg, ...
│   └── ...
├── comp-lit-illustrations/            ← scene illustrations paired with curated stories
│   └── {passage-id}/scene-1.svg
├── comp-info-diagrams/                ← informational text diagrams with labels
│   └── {passage-id}/diagram-1.svg
├── vocabulary-stock-svg/              ← small SVG library for concepts emoji misses
│   ├── venn-diagram.svg
│   ├── thermometer.svg
│   └── ...
└── README.md
```

### Procedural emoji bank pattern

The phonics generators already use this pattern in `gen-phonics.js`. Define small constants in shared `js/modules/literacy/emoji-bank.js`:

```js
export const PHONICS_EMOJI = {
    short_a_initial: { apple: '🍎', ant: '🐜', axe: '🪓', alligator: '🐊' },
    short_e_medial: { bed: '🛏️', red: '🟥', pen: '🖊️', hen: '🐔' },
    short_i_medial: { sit: '🪑', big: '🐘', pig: '🐷', fish: '🐟' },
    // ... etc
};
```

Generator picks 3-4 emoji from the appropriate bank for an `mc-image` question. Free, infinite combinations.

### When emoji isn't enough

Some K-5 ELA targets aren't representable with Unicode emoji (e.g., specific characters from a curated story, a specific scene with multiple characters). Those tasks ALWAYS belong to a curated `content_strategy` skill, and their images live in `/data/literacy-content/images/`. Procedural skills NEVER need a curated image — that's the whole point of the procedural strategy.

### Vertical slice (Phase 2 Stage 1) implication

The phonics + capitalization vertical slices are FULLY procedural with FULLY procedural images (emoji). No curated assets ship in Stage 1. Comprehension and writing are stubbed; their curated images come with the content-authoring deliverable in Stage 3.
