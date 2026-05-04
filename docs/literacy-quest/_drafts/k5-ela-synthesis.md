# K-5 ELA Scope and Sequence — synthesis

## Document Overview

This is a single-file master skill catalog titled *K-5 ELA Scope and Sequence: Integrated Reading and Language Strands for Grade 5 Intervention*, authored for Tim at a Qatar Foundation school whose students are ELL/SPED learners 2–3 years below grade level. It functions as the instructional backbone for a forthcoming "Literacy Quest" practice app that will sit alongside the existing MAP Math, MAP Reading, and MAP Language Usage modes.

The document spans **12 parts** organized into two strands:

- **Reading Strand** — Parts 1–5: Phonological/Phonemic Awareness, Phonics and Decoding, Fluency, Vocabulary, Comprehension (Literature and Informational)
- **Language Strand** — Parts 6–9: Grammar and Parts of Speech, Sentence Structure, Mechanics, Writing

Parts 10–12 shift to implementation: the four-tag skill schema (Part 10), a grade-equivalence crosswalk and high-leverage priorities (Part 11), and a practical build guide for the practice app (Part 12).

Total estimated atom count: **600–900 atoms** in a fully built-out library, with ~300+ in phonics alone.

---

## The Four-Tag Skill Schema (Part 10)

Every skill "atom" is a JSON record carrying four mandatory tags plus prerequisite/next-skill graph edges and mastery criteria. The canonical TypeScript-style schema is:

```typescript
interface SkillAtom {
  skill_id: string;                    // snake_case: <strand>_<domain>_<sub_domain>_<specifier>
  strand: "reading" | "language";
  domain: string;                      // e.g., "phonics", "vocabulary", "grammar"
  sub_domain: string;                  // e.g., "short_vowels", "prefixes", "verb_tense"
  developmental_band: string;          // e.g., "K-1", "2-3", "4-5+"
  skill_statement: string;             // one-sentence teachable description

  // Tag 1: CCSS
  ccss_codes: string[];                // e.g., ["RF.K.3a", "RF.K.3b"]

  // Tag 2: NWEA MAP RIT
  rit_band: string;                    // e.g., "141-150"
  rit_test: "Reading K-2" | "Reading 2-5" | "Language Usage 2-12";
  rit_instructional_area: string;      // e.g., "Foundational Skills - Phonics - Decoding"

  // Tag 3: IXL
  ixl_skills: string[];               // e.g., ["A.57 Choose the short a word (Kindergarten)"]

  // Tag 4: Science of Reading
  sor_citations: string[];            // full bibliographic citations

  // Scaffolds
  ell_scaffold: string;
  sped_scaffold: string;

  // Graph edges
  prerequisite_skill_ids: string[];   // 1–3 prerequisite atoms
  next_skill_ids: string[];           // 1–3 next atoms

  // Mastery
  mastery_criteria: {
    accuracy: number;                  // e.g., 0.85
    consecutive_sessions: number;      // e.g., 2
    fluency_target_per_min: number;    // e.g., 30 (items or words per minute)
  };

  diagnostic_anchor: string;          // e.g., "UFLI Placement Test Set 1 (short vowels)"
}
```

**Naming convention:** `<strand>_<domain>_<sub_domain>_<specifier>` in snake_case.

---

## Part-by-Part Summary

### Part 1 — Phonological and Phonemic Awareness (PA)
- Auditory-only (no print). Word/syllable awareness, onset-rime/rhyme, phoneme isolation/blending/segmentation, and phoneme manipulation (add, delete, substitute, reverse).
- Mapped to NWEA K-2 Foundational Skills RIT 131–180; advanced manipulation sits beyond RIT 180.
- Elkonin sound boxes and Heggerty routines are the primary SPED delivery mechanisms; Arabic L1 ELL notes flag the /p/-/b/ distinction and missing /æ/ phoneme.

### Part 2 — Phonics and Decoding
- The largest section: single consonants, short vowels, long vowels (~25–30 atoms), consonant digraphs, consonant blends (~60 atoms), vowel teams, diphthongs, r-controlled vowels, VCe, y-as-vowel, soft/hard c and g, schwa.
- **Section 2B** defines the six Wilson/OG syllable types (Closed, Open, VCe, R-controlled, Vowel team/Diphthong "D", Consonant-le) — 12 atoms total.
- **Section 2C** covers six syllable-division patterns (VC/CV, V/CV, VC/V, VCC/CV, V/V, Cle-final).
- **Section 2F** distinguishes Dolch (220 + 95 nouns), Fry 1–1000, and Heart Words with explicit orthographic-mapping instruction. UFLI Foundations is the primary anchor; Wilson 12-step is the Tier-3 reference.

### Part 3 — Fluency
- Sub-skills: LNF, LSF, PSF, NWF, ORF, Prosody.
- **Hasbrouck-Tindal 2017 norms** explicitly tabled. For Tim's 2–3-years-behind students the working ORF target is Grade 3 column (83–112 WCPM), moving toward Grade 4 (94–133) by year end.
- Routines: repeated reading (Therrien 2004, d=0.83), paired reading, choral/echo reading, phrase-cued reading, Reader's Theater.

### Part 4 — Vocabulary
- **Beck/McKeown/Kucan three-tier model** (Tier 1 basic, Tier 2 academic, Tier 3 domain-specific). Tier 1 requires direct instruction for ELLs; ~400 Tier 2 words/year target.
- Word-learning strategies (context clues, morphology, dictionary/thesaurus) carry explicit RIT and IXL codes.
- Word-relationship atoms: synonyms, antonyms, homophones, homonyms, homographs, analogies, shades of meaning, connotation/denotation.
- Figurative language atoms: simile, metaphor, personification, hyperbole, alliteration, onomatopoeia, idioms.

### Part 5 — Comprehension
- **Literature** (5A): ~20 atoms from character identification (RIT <161) through cross-text comparison (RIT 205–210); SWBST summarization frame.
- **Genre** (5B): 8 genre categories.
- **Informational Text** (5C): 17 text-feature atoms, plus text structure (description, sequence, compare/contrast, cause/effect, problem/solution), author's purpose (PIE), claim/evidence.
- **Higher-Order Analysis** (5D): compare themes, analyze argument, integrate multi-source — RIT 198–214.

### Part 6 — Grammar and Parts of Speech
- Nouns (11 atoms), pronouns (10 atoms), verbs (17 atoms inc. all perfect tenses + passive voice), adjectives (8 atoms inc. OSASCOMP), adverbs (4 atoms), prepositions/conjunctions/interjections (6 atoms inc. FANBOYS).
- RIT range: Language Usage 2-12 from 151 through 221–230.

### Part 7 — Sentence Structure
- ~20 atoms: fragments, run-ons, comma splices, simple/compound/complex/compound-complex sentences, independent and dependent clauses, sentence combining, parallel structure, misplaced/dangling modifiers.
- Writing-structure atoms (topic sentence, concluding sentence, transitions) embedded here.

### Part 8 — Mechanics
- **Capitalization** (12 atoms).
- **Punctuation** (~25 atoms): period through ellipsis.
- **Spelling** (~18 atoms): HFW, CVC/CVCe, FLOSS rule, doubling/drop-e/change-y-to-i, frequently confused words, Greek/Latin morphology spelling.

### Part 9 — Writing
- Writing process (6 atoms), genres (~18 types), paragraph/essay structure, voice/style/audience, research skills (8 atoms inc. plagiarism awareness).
- Recommend building Part 9 last due to need for constructed-response scoring.

### Part 10 — Tagging Schema (above)

### Part 11 — Grade 5 Expectations and Crosswalk
- NWEA-anchored RIT crosswalk: Grade 2 spring = RIT 188/100 WCPM; Grade 5 on-grade = 210/146 WCPM. Note: 2025 NWEA norms shift means ~2 RIT lower than 2020.
- Five high-leverage skills for catch-up: (1) advanced PA + orthographic mapping, (2) six syllable types + division, (3) Greek/Latin morphology, (4) fluency to 100–115 WCPM, (5) Tier 2 vocab + inferential comprehension.

### Part 12 — App Implementation Guide
- Skill selector with six filter dimensions (strand, domain, developmental band, RIT band, CCSS code, test family).
- Diagnostic placement test (30–40 adaptive items).
- Spiral review with 70/30 current/recent-mastered split.
- Build order: Parts 1–4 first, then 5, then 6–8, then 9 last.

---

## ELL and SPED Scaffolds

### ELL Scaffolds
- Pre-teach Tier 1 vocabulary in every prompt.
- Arabic L1: explicit contrast of /æ/-/e/-/ɪ/, /p/-/b/ distinction; mirrors for articulation.
- Show L1 cognate (Arabic + Spanish) alongside every vocabulary item.
- Audio support and slow pacing (1.5x) on all items.
- Sentence frames for production items.
- Echo + read-aloud + paired reading as fluency workhorse trio.
- Picture cards for phoneme/decoding items where L1 phoneme is absent.
- Hasbrouck-Tindal 25th percentile as urgent-intervention threshold (not 50th) given Qatar ELL context.

### SPED Scaffolds
- Elkonin sound boxes with magnetic chips on all decoding items.
- Finger-tapping (Wilson/OG) and say-it-and-move-it routines.
- Daily 8–12 minute Heggerty whole-class block.
- Extend response time by 2x.
- Reduce items per session to 5–8.
- Allow 3 attempts with corrective feedback.
- Multisensory warm-up: trace-say-write target before each session.
- Pre-teach difficult words; model prosody phrase by phrase.
- 3-second wait time after oral prompts.

---

## Prerequisite / Next-Skill Graph

Each atom has `prerequisite_skill_ids` (1–3) and `next_skill_ids` (1–3), forming a **directed acyclic graph (DAG)**. Worked example: `phonics_short_a_initial` requires `letter_naming_a`, `phonemic_isolation_initial`, `phoneme_blending_3`; next: `phonics_short_a_medial`, `phonics_short_a_final`, `phonics_short_a_in_blends`.

Practice loader uses the graph by:
1. Diagnostic placement → estimated RIT per strand.
2. Walk prerequisites backward to find 1–2 atoms below mastery (early-success priming).
3. 70% current target / 30% interleaved retrieval (Rohrer/Taylor 2007).
4. On mastery, advance to `next_skill_ids`. If no gain in 3 sessions, drop back via `prerequisite_skill_ids`.
5. Mid-year re-test routes accelerate / drop-back / hold.

---

## Mastery Criteria

| Field | Value |
|---|---|
| `accuracy` | 0.85 |
| `consecutive_sessions` | Min 2 (cross-ref'd as "4 of 5 most recent" in 12C) |
| `fluency_target_per_min` | Skill-dependent (e.g., 30 items/min for short_a_initial) |
| Sessions span multiple days | At least 3 different days |
| Spaced review after mastery | 1d → 3d → 7d → 14d → 30d (SM-2 lite) |

---

## MAP-Tested vs Not-MAP-Tested

The schema doesn't use a literal `is_map_tested` boolean. Instead, the `rit_band` and `rit_test` fields together serve this purpose: an atom with a populated `rit_band` and a real `rit_test` value (Reading K-2 / Reading 2-5 / Language Usage 2-12) is MAP-aligned. Atoms where these are "n/a" (advanced PA oral manipulation, skimming/scanning strategies) are not MAP-testable.

**MAP Quest filter:** `rit_test` matches target family AND `rit_band` falls within student's current RIT ± 10.

---

## Diagnostic Anchors

- **UFLI Foundations Intervention Placement Test** (210 items, 11 sets, free) — primary phonics anchor.
- **CORE Phonics Survey** — secondary decoding/encoding anchor.
- **NWEA Learning Continuum** — comprehension, vocab, grammar, mechanics anchor.

In-app diagnostic (Part 12B): 30–40 adaptive items: 10 phonics, 10 multisyllabic decoding, 5 morphology, 5 Tier 2 vocab, 5 inferential comp, 5 grammar/mechanics. Output: estimated RIT band per strand + recommended starting atom.

---

## Implications for Literacy Quest's Design

1. **Every skill atom must carry all four tags** plus scaffolds, graph edges, mastery criteria, diagnostic anchor.
2. **Heart-words list (Part 2F) requires a unique UI.** Not flashcard drill — sound-by-sound grapheme-phoneme mapping with the irregular grapheme highlighted (the "heart").
3. **Hasbrouck-Tindal norms drive fluency mode targets.** ORF mode looks up grade+season 50th percentile; flag students 10+ WCPM below. ELL threshold configurable to 25th percentile.
4. **Six syllable types need a dedicated interactive question type.** Tap-to-classify or labeled MC, not text input.
5. **ELL/SPED differentiation toggle is a first-class UI element.** When ELL on: L1 cognates, audio autoplay, 1.5x pacing, sentence frames. When SPED on: Elkonin boxes, 5–8 item cap, 3-attempt corrective feedback, 2x response time.
6. **Phonics is the largest domain — build first** (Part 12F). ~300+ atoms have highest IXL/UFLI alignment and biggest impact for Tim's students.
7. **Writing (Part 9) requires constructed-response scoring — defer to last.** Start with sentence-level grammar/revision (close to Language Usage) before full essays.
8. **Three MAP test families need separate filter options** in skill selector.
9. **Atom granularity supports 4–8 items in a 5-min session.** Resist collapsing atoms — granularity is what makes graph + adaptive placement work.
10. **CCSS layer is a translation shim, not the primary structure.** Internal graph is standard-agnostic; if school swaps standards, only `ccss_codes` changes.
