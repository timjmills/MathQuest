# Literacy Quest — State of the Project & Next Steps

**Last updated:** 2026-05-05
**Audience:** Future Claude sessions (and future you). Read this first if you're picking the project back up — it tells you exactly what's been built, what's pending, and what to do next.

This doc travels with the project: when Literacy Quest is moved into its own WebStorm project (via `scripts/package-literacy.mjs`), this file is copied alongside the code and remains accurate.

---

## 1. What Literacy Quest is

A Reading + Language practice web app for K-5 students, with a focus on ELL/SPED kids 2-3 years below grade level (Qatar Foundation school context). It mirrors MathQuest's architecture — browser-native ES modules, no bundler, static-host friendly — and was built inside MathQuest as a feature-flag-gated module (`FEATURES.LITERACY_QUEST_ENABLED`).

**Live URL while inside MathQuest**: small `📚 Literacy Quest ▾` dropdown in the top-nav of math.cultivatingthedigital.org.

**After extraction** (via `scripts/package-literacy.mjs`): standalone project, designed to run on its own domain.

**Architectural rationale**: see `ARCHITECTURE.md` and `PROJECT_SPLIT_GUIDE.md` (the seven portability rules + the extraction recipe).

---

## 2. Hard rules that govern every decision

These are non-negotiable. Don't break them when adding code.

1. **Every skill must be 100% auto-gradable.** No voice-memo as the graded answer. No canvas / free-form drawing as the graded answer. No "write your own sentence" as the graded answer. If a published activity is open-ended, build the closed-form equivalent (mc-text 4-option, fib-auto with `accepted_answers`, etc.). See `ANSWER_MECHANICS_LIBRARY.md` §10 for the excluded-mechanic list.
2. **Every playable atom should rotate among ≥3 distinct mechanic widgets** in its `question_types` array (the Variety Rule, `ANSWER_MECHANICS_LIBRARY.md` §13). The shared `_mechanic-adapter.js` makes this cheap by wrapping mc-text into mc-audio / sort-into-bins / two-button-binary / tap-hotspot / match-pairs shapes when generators don't have a dedicated branch.
3. **Browser-native ES modules. No bundler. No build step.** All imports use `.js` extensions. ES2022 target. Static-host friendly.
4. **Default to no comments.** Identifiers carry the meaning. Add a one-line comment only when the *why* is non-obvious (a hidden invariant, a workaround for a specific bug). Never add docblocks describing what a function does. Never add "added by Claude" markers.
5. **No NEW features without a real use case.** Don't add error handling for impossible cases. Don't add abstractions for hypothetical futures. Three similar lines beats a premature abstraction.
6. **Don't research, mine, or build skills the user hasn't asked for** unless the standing roadmap says to. The user has consistently asked for *quality of variety > quantity of atoms* — prefer rounding out mechanic variety on existing atoms over expanding to new atoms.
7. **Maintain portability** (the seven rules in `PROJECT_SPLIT_GUIDE.md`) — literacy code stays under `js/modules/literacy/`, all literacy state uses the `state.literacy*` prefix, no imports from math `gen-*.js` etc. The audit table at the bottom of that doc must stay green.

---

## 3. What's been built (live deploys, in chronological commit order)

| Commit | Shipped |
|---|---|
| `cb0f783` | Phoneme TTS module + Unit 2 phonics expansion (95 atoms playable) |
| `59ecce8` | UFLI Foundations corpus extracted and wired into `gen-fluency.js` (131 decodable + 126 roll-and-read + 119 home-practice + 101 slide decks); ETC scope-and-sequence encoded; `lit-nav-btn` styling |
| `85a7e84` | `gen-phonemic-awareness.js` (16 atoms) + UFLI HomePractice merged into phonics word banks |
| `a3a0464` | "Choose Your Quest" hub view replaced with 6-item lit-nav dropdown |
| `9d4925c` | Fixed literacy CSS leaking onto math landing page (`.view{display:none}` hierarchy fix) |
| `a88f9f6` | `gen-comprehension.js` (18 atoms) + `gen-sentence-structure.js` (12) + `gen-grammar.js` (18) + `gen-vocabulary.js` (18); `ANSWER_MECHANICS_LIBRARY.md` initial 14 sections |
| `f7e9eef` | Mechanics library Examples 15+16 additions; `PROJECT_SPLIT_GUIDE.md` (7 portability rules) |
| `fb1e961` | Corpus-mining merge: 38 new mechanics from spelling + reading + writing + MAP-review research docs (~120 mechanics catalogued total) |
| `d41be9a` | Two new widgets: `bijective-join` (powers `syllable-join` + `compound-builder`) and `text-feature-tag` |
| `25ffaa4` | Seven more new widgets: `triple-match`, `identify-errors`, `dictionary-entry-question`, `syllable-tap-divider`, `type-the-correction`, `correct-the-mistake`, `code-transfer`; dual-passage extension to `item-set-controller.js` |
| `758bf5c` | `_mechanic-adapter.js` — shared cross-generator helper that fixes 45 atoms' Variety-Rule gap; `scripts/package-literacy.mjs` — standalone extraction script |

---

## 4. Current playable inventory

**~180 playable atoms across 9 strands** (out of ~480 total; the remaining ~300 are coming-soon stubs that render the graceful coming-soon card via `coming-soon.js`).

| Strand | Playable | Total atoms in strand | Notes |
|---|---|---|---|
| phonics | 81 | 151 | UFLI HomePractice word banks integrated; word-chain mechanic served from real chains |
| mechanics (capitalization) | 12 | 55 | All 12 capitalization atoms |
| fluency (UFLI roll-and-read + decodable) | 7 | 25 | LNF/LSF/PSF/NWF/ORF probes still pending (Phase 3+) |
| phonemic awareness | 16 | 35 | Rhyme, isolation, blending, segmenting, deletion, substitution, syllable count |
| comprehension lit + info | 18 | 59 | Main idea, key details, sequence, inference, cause/effect, author's purpose, text features, etc. |
| sentence structure | 12 | 21 | Type ID, complete-vs-fragment, combining, dependent/independent clause |
| grammar | 18 | 58 | Nouns, pronouns, verbs (ID + tense + agreement), adjectives, adverbs, prepositions |
| vocabulary | 18 | 54 | Synonym/antonym/analogy, prefix/suffix, homophones, multiple-meaning, idioms |
| writing | 0 | 20 | Not yet generated |

`coming-soon.js` `PLAYABLE_SKILL_IDS` is the source of truth for "playable". Atoms outside this set render the coming-soon card with related-playable links.

---

## 5. Widget catalog — 33+ registered, all auto-gradable

Registered in `LITERACY_WIDGETS` (`js/modules/literacy/literacy-question-render.js`):

**Stage 1 (selection):** mc-text, mc-image, mc-audio, mc-multi-select, two-button-binary, tap-hotspot, dnd-linked, fib-auto

**Stage 2 (differentiation):** voice-memo (recording-only, NEVER as graded answer), word-chain, sound-box, letter-tile-spell, sort-into-bins, match-pairs, word-tagger, hot-text-word, hot-text-sentence, hot-text-paragraph, drop-down-inline, sentence-build, sequence-events

**ETC-derived:** picture-match-row, word-picture-choice, write-from-picture (NEVER as graded answer), column-letter-build, x-strikethrough-choice

**Catalog-derived (built 2026-05-05):** bijective-join (powers `syllable-join` + `compound-builder`), text-feature-tag, triple-match, identify-errors, dictionary-entry-question, syllable-tap-divider, type-the-correction, correct-the-mistake, code-transfer

The full mechanic catalog (120+ entries across 10 variety buckets — SELECT, HIGHLIGHT, DRAG, SORT, MATCH, TYPE, SEQUENCE, CONSTRUCT, AUDIO, TIMED) is in `ANSWER_MECHANICS_LIBRARY.md`.

---

## 6. Variety-Rule audit (last run 2026-05-05)

After the `_mechanic-adapter.js` wiring, the dispatcher actually serves ≥3 distinct widgets per atom for the following:

| Strand | atoms with ≥3 dispatcher-handled mechanics | atoms with <3 |
|---|---|---|
| comprehension_info | 1 | 8 |
| comprehension_lit | 1 | 8 |
| fluency | 4 | 3 |
| grammar | 17 | 1 |
| mechanics | 12 | 0 |
| phonemic_awareness | 16 | 0 |
| phonics | 75 | 6 |
| sentence_structure | 9 | 3 |
| vocabulary | 14 | 4 |

Net: **149 of 182 atoms (82%)** meet the Variety Rule via the dispatcher.

The remaining 33 gap atoms list `question_types` entries that collapse to the same widget after the STAGE1_FALLBACK map (e.g., a comprehension atom listing only mc-text variants). Closing these requires adding more genuinely-distinct widgets to those atoms' `question_types` arrays, or extending generator branches. Marginal; skip until you've tackled higher-leverage work.

---

## 7. What's documented vs not

**Source of truth in `docs/literacy-quest/`:**

- `STATE_AND_NEXT_STEPS.md` ← **this file**
- `ARCHITECTURE.md` — module layout, dependency hierarchy, where to add things
- `DATA_MODEL.md` — SkillAtom + Question shapes
- `QUESTION_TYPES.md` — every question_type id and its widget contract
- `FEATURES.md` — feature flag system + literacy gate
- `QUESTION_SKILL_MATRIX.md` — which skills × which mechanics
- `RESEARCH_FINDINGS.md` — Phase 0 study notes, NWEA/IXL/Boom/Lexia surveys
- `LIVE_ROADMAP.md` — phase-by-phase build plan (A → H)
- `LIVE_RISK_AUDIT.md` — known production risks + mitigations
- `PHASE_0_DECISIONS.md` — the 8 user-decisions on open questions
- `PHASE_3_PREMERGE.md` — the (now obsolete) pre-merge plan; we shipped to live instead
- `STUDY_NOTES.md` — synthesized notes from the lit-instruction corpus
- `ANSWER_MECHANICS_LIBRARY.md` — 120+ mechanics, 10 variety buckets, the Variety Rule
- `MECHANICS_FROM_SPELLING.md` — research findings (Evan-Moor BSS)
- `MECHANICS_FROM_READING.md` — research findings (Spectrum + DRC + Phonics passages)
- `MECHANICS_FROM_WRITING.md` — research findings (Spectrum LA + Writing)
- `MECHANICS_FROM_MAP.md` — research findings (NWEA MAP review materials) + item-set-controller constraints
- `PROJECT_SPLIT_GUIDE.md` — seven portability rules + extraction recipe

**Not documented yet (gap):**

- **No teacher-facing docs** for how to use Literacy Quest in the classroom. Math Quest has `help/teacher-online.html`; literacy doesn't.
- **No student-facing FAQ.** Math has `help/student-faq.html`; literacy doesn't.
- **No accessibility audit doc.** Color-contrast / dyslexic-friendly font / screen-reader audit is owed before a real classroom rollout.
- **No localization / i18n strategy** — currently English-only; Qatar context implies eventual Arabic L1 audio overlay.

---

## 8. The phased roadmap (Phases A–H from `LIVE_ROADMAP.md`)

| Phase | Status | What it covered |
|---|---|---|
| A — Foundation | ✅ done | Skill catalog (478 atoms) + module skeleton + literacy-init + feature flag + 8 widgets |
| B — Phonics | ✅ done | `gen-phonics.js` (~3200 lines, 81 atoms playable) |
| C — Fluency UFLI integration | ✅ done | UFLI corpus extraction + `gen-fluency.js` |
| D — Mechanics + Spelling | partial | `gen-mechanics.js` (capitalization 12/12); spelling generator NOT built |
| E — Vocabulary + Grammar + Comprehension | ✅ done (vertical slice) | 18 + 18 + 18 atoms across each strand |
| F — Sentence structure + Phonemic awareness | ✅ done | 12 + 16 atoms |
| G — Curated content authoring | not started | ~500 AI-generated short passages for the comprehension + fluency atoms |
| H — Polish | not started | ETC-style page mode, color-banded card headers, "Answer type:" footer, QWERTY for letter-tile-spell, phoneme TTS for sound-segmenting widget integration |

Plus three vertical pieces that span phases:

| Vertical | Status | Notes |
|---|---|---|
| MAP UI (Reading K-2 / Reading 2-5 / Language Usage) | placeholder | Views exist; adaptive engine + item-set controller exist; no screen-flow yet wiring them together |
| Literacy Dashboard | placeholder | View exists; no real progress data wired in |
| Skill Browsers (Reading / Language) | ✅ done | `literacy-skill-browser.js`; 478 atoms searchable |

---

## 9. Suggested next steps (in priority order)

When you pick this project back up — especially in the new WebStorm standalone project — work top-down:

### Tier 1 — finish what's already in flight

1. **Close the Variety-Rule gap to 100%.** 33 atoms still have <3 dispatcher-handled mechanics. Audit them by running the snippet in §6 above (read `_mechanic-adapter.js` and the failing atoms' `question_types`). For each, either (a) add a 3rd genuinely-distinct widget to the data file's `question_types` list, or (b) extend the generator branch. Quick win.
2. **Build `gen-spelling.js`** for the spelling atoms (currently 0 playable). The Evan-Moor Building Spelling Skills mining doc (`MECHANICS_FROM_SPELLING.md`) lists the patterns — most reduce to mc-text / fib-auto / sort-into-bins / type-the-correction / dictation-from-audio. Probably 15-20 atoms to start.
3. **Build `gen-writing.js`** for the writing atoms. The Spectrum Writing mining doc (`MECHANICS_FROM_WRITING.md`) gives 13 closed-form mechanics: best-topic-sentence-pick, best-concluding-sentence-pick, transition-cloze, find-sentence-that-doesn't-belong, revise-mc, etc. Probably 12-15 atoms to start.

### Tier 2 — complete the MAP path

4. **Wire the MAP UI screens** (`mapReadingK2View`, `mapReading25View`, `mapLanguageUsageView`) to the adaptive engine + item-set-controller. Currently placeholder views. The engine + controller already exist (`map-engine-literacy.js`, `item-set-controller.js`, including the dual-passage extension shipped in `25ffaa4`). What's missing is the screen-flow code that pulls items, renders, advances, and finalizes a session.
5. **Implement the four item-set-controller upgrades** surfaced by MAP corpus mining: paragraph-anchored references, vocab-not-always-first ordering, `definition_callout` field, dual-passage support (slot exists; needs UI integration). See `MECHANICS_FROM_MAP.md` § "Item-set / passage-anchored patterns".

### Tier 3 — content authoring

6. **Phase G content authoring**: ~500 short curated passages for comprehension + fluency. Plan: per-RIT-band passage banks (140s, 160s, 180s, 200s) at ~50 passages/band per genre (literature + informational) = 400-500. Each passage gets 3-5 anchored items. Use UFLI decodables for low RIT and curated AI-generated for higher.

### Tier 4 — polish + accessibility

7. **Phase H polish**: ETC-style page mode (single-story `a` font, B&W mode), color-banded card headers per skill domain, "Answer type:" footer label so students learn the mechanic vocabulary, QWERTY keyboard for `letter-tile-spell` on tablet, phoneme-TTS integration into `sound-box`.
8. **Accessibility audit**: contrast, OpenDyslexic font option, screen reader, keyboard-only nav, `prefers-reduced-motion`. Integrate into `literacy-settings.js`.
9. **Teacher + student help docs.** Math has `help/teacher-online.html`; literacy needs equivalents.

### Tier 5 — open questions

10. **L1 audio overlay** for top 8 ELL home languages (Phase 0 decision deferred). When ready, store audio files under `data/literacy-content/audio/<lang>/<atom_id>.mp3` and add a language-toggle to `literacy-settings.js`.
11. **Voice recording for self-listen** (not graded). The `voice-memo` widget exists but is excluded from grading. Wiring it as a per-fluency-atom optional self-listen pass is a low-cost win.

---

## 10. How to take action — concrete first commands

### If you're in the standalone Literacy Quest project (post-extraction)

```bash
# Run it
npx serve .                           # then open http://localhost:3000

# Audit the Variety Rule
# (need to copy the audit snippet from §6 above into a tmp script first)

# Run all syntax checks
find js/modules -name '*.js' -exec node --input-type=module --check < {} \;

# When picking a next task, read this file again, then read:
docs/literacy-quest/ANSWER_MECHANICS_LIBRARY.md   # the mechanic vocabulary
docs/literacy-quest/LIVE_ROADMAP.md               # phase plan
docs/literacy-quest/PROJECT_SPLIT_GUIDE.md        # portability rules
js/modules/literacy/coming-soon.js                # source of truth for playable atoms
```

### If you're still in MathQuest

```bash
# Move literacy out into a fresh project:
node scripts/package-literacy.mjs ../LiteracyQuest

# Open ../LiteracyQuest/ in WebStorm and continue from there.
```

---

## 11. What NOT to do without checking with the user first

- Do not ship UI changes that affect Math Quest's landing page. Literacy stays gated. (See `PROJECT_SPLIT_GUIDE.md` rule 7.)
- Do not add a literacy dependency on a math `gen-*.js` file. (Rule 2.)
- Do not run `git push --force` to master. Always create a new commit.
- Do not add atoms whose answers can't be auto-graded. (Rule 1, hard.)
- Do not let mc-text dominate any deck — the Variety Rule (≥4 distinct buckets in a 10-card deck) and the no-mc-text-dominance rule (≤50%) hold.
- Do not modify `Tim's Documents/` (read-only research corpus).
- Do not commit large binary files (PDFs, PPTX, audio) into git. They live under `Tim's Documents/` (gitignored equivalent in the standalone project) or in `data/literacy-content/` only as JSON-extracted text.

---

## 12. Where the user's attention has been

Recurring themes from the conversation history that should bias future decisions:

- **Variety of answer mechanics > breadth of atoms.** The user has repeatedly asked for more interaction types, not more skills.
- **Auto-grading is sacred.** Re-confirmed multiple times. No open-ended graded items.
- **Live shipping > pre-merge ceremony.** All work goes to master and deploys live; no PRs, no staging.
- **Use agent teams for bulk work.** The user has explicitly asked for agent parallelization several times.
- **Build for portability.** Literacy is expected to graduate to its own project; everything stays clean enough for that.
- **Qatar Foundation school context** — ELL/SPED defaults, 2-3 years below grade level. Audio support is critical.

---

## 13. Critical files at a glance

```
js/modules/literacy/
├── literacy-init.js                    ← entry point, attaches window functions
├── literacy-navigation.js              ← goTo* functions; mapMode discipline
├── literacy-game-control.js            ← deck loop; DECK_BUILDERS / SINGLE_GENERATORS
├── literacy-question-render.js         ← LITERACY_WIDGETS map (33+ widgets)
├── literacy-skill-codes.js             ← M:/R:/L: prefix code system
├── literacy-skill-browser.js           ← 478-atom skill browser UI
├── literacy-progress.js                ← per-skill mastery tracking
├── literacy-reports.js                 ← Wave 4 reports
├── literacy-dashboard.js               ← dashboard view (placeholder data)
├── literacy-settings.js                ← settings (TTS, contrast, font, scaffolds)
├── literacy-settings-panel.js          ← settings UI
├── coming-soon.js                      ← PLAYABLE_SKILL_IDS source of truth
├── _mechanic-adapter.js                ← shared mechanic-shape wrapper
├── phoneme-tts.js                      ← speakPhoneme, speakBlend, decomposeWord
├── map-engine-literacy.js              ← Rasch 1PL adaptive engine
├── item-set-controller.js              ← passage-anchored multi-item controller (single + dual passage)
├── passage-render.js                   ← passage rendering
├── gen-phonics.js                      ← 81 atoms
├── gen-fluency.js                      ← 7 atoms
├── gen-phonemic-awareness.js           ← 16 atoms
├── gen-vocabulary.js                   ← 18 atoms
├── gen-comprehension.js                ← 18 atoms
├── gen-sentence-structure.js           ← 12 atoms
├── gen-grammar.js                      ← 18 atoms
├── gen-mechanics.js                    ← 12 atoms (capitalization)
├── ufli-content.js                     ← UFLI corpus loader
├── etc-content.js                      ← ETC scope-and-sequence loader
└── widgets/                            ← 33+ widget files
```

---

## 14. Reading order for a fresh Claude session

If you've been dropped into this project with no prior context, read in this order:

1. **This file** (you're here).
2. `ANSWER_MECHANICS_LIBRARY.md` — vocabulary you need for every conversation.
3. `coming-soon.js` — source of truth for what's playable.
4. `ARCHITECTURE.md` — module layout.
5. `LIVE_ROADMAP.md` — the phased plan.
6. `PROJECT_SPLIT_GUIDE.md` — the portability rules (so you don't break them).
7. The generator file relevant to your current task (e.g., `gen-vocabulary.js` if vocab work).
8. `data/literacy-skills/<strand>.js` for the atoms you're touching.

That's enough to be productive. The four `MECHANICS_FROM_*.md` research docs are reference — read selectively when working on a specific strand.
