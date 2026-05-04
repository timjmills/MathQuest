# /data/literacy-skills/

The canonical Literacy Quest skill catalogs. Mirrors Parts 1-9 of the K-5 ELA Scope and Sequence reference document. Every skill atom carries the full four-tag schema (CCSS, NWEA RIT band, IXL skill code, Science of Reading citation) plus prerequisite/next-skill graph edges, ELL/SPED scaffolds, mastery criteria, and the variety-rule `question_types` array (≥3 mechanics per skill).

See `/docs/literacy-quest/DATA_MODEL.md` for the canonical SkillAtom interface.

## Folder layout

```
/data/literacy-skills/
├── reading/
│   ├── phonemic-awareness.js     (Part 1 — auditory-only PA atoms; K-2 RIT 131-180)
│   ├── phonics.js                (Part 2 — the largest file; ~300 atoms)
│   ├── fluency.js                (Part 3 — LNF/LSF/PSF/NWF/ORF/Prosody + Hasbrouck-Tindal targets)
│   ├── vocabulary.js             (Part 4 — Beck/McKeown/Kucan tiers, ~400 Tier 2 words/year)
│   ├── comprehension-literature.js  (Part 5A-B — Lit comprehension + 8 genres)
│   └── comprehension-informational.js  (Part 5C-D — Info comprehension, 17 text features)
├── language/
│   ├── grammar.js                (Part 6 — POS, ~50 atoms across nouns/pronouns/verbs/etc.)
│   ├── sentence-structure.js     (Part 7 — fragments, run-ons, simple/compound/complex)
│   ├── mechanics.js              (Part 8 — capitalization, punctuation, spelling)
│   └── writing.js                (Part 9 — process, genres, paragraph/essay structure)
├── map-quest/
│   ├── reading-k2-skills.js      (filtered view: rit_test === "Reading K-2")
│   ├── reading-2-5-skills.js     (filtered view: rit_test === "Reading 2-5")
│   └── language-usage-skills.js  (filtered view: rit_test === "Language Usage 2-12")
└── README.md                     (this file)
```

## Build priority

Per `/docs/literacy-quest/PHASE_0_DECISIONS.md`:

1. **Phonics** (`reading/phonics.js`) — biggest payoff for Tim's Grade 5 ELL/SPED students who are 2-3 years behind. ~300 atoms.
2. **Phonemic Awareness** (`reading/phonemic-awareness.js`) — foundational; scaffolds phonics.
3. **Fluency** (`reading/fluency.js`) — Hasbrouck-Tindal targets drive ORF mode.
4. **Vocabulary** (`reading/vocabulary.js`) — Tier 2 academic words.
5. **Comprehension Lit + Info** (`reading/comprehension-*.js`) — main idea, story elements, text features, evidence.
6. **Grammar + Sentence Structure** (`language/*.js`) — Language Usage 2-12 alignment.
7. **Mechanics** (`language/mechanics.js`) — capitalization, punctuation, spelling.
8. **Writing** (`language/writing.js`) — last; requires more complex item generation.

The MAP filtered views are computed from the source files — they're not duplicates. Each filtered file exports a function that filters the source skill arrays by `rit_test` and `rit_band`.

## Storage format

Each file exports a default array of SkillAtom objects (per DATA_MODEL.md schema) plus a named export of any helper data (e.g., HASBROUCK_TINDAL_NORMS in fluency.js).

```js
// reading/phonics.js
/** @type {import('../../docs/literacy-quest/DATA_MODEL').SkillAtom[]} */
export default [
    {
        skill_id: 'reading_phonics_short_a_initial',
        subject: 'reading',
        strand: 'phonics',
        domain: 'short_vowels',
        sub_domain: 'short_a',
        developmental_band: 'K-1',
        skill_statement: 'Identify the short /æ/ sound in initial position of CVC words.',
        ccss_codes: ['RF.K.3a', 'RF.K.3b'],
        rit_band: '141-150',
        rit_test: 'Reading K-2',
        rit_instructional_area: 'Foundational Skills - Phonics - Decoding',
        ixl_skills: ['A.57'],
        sor_citations: ['Ehri 2014', 'Moats LETRS Module 4'],
        ell_scaffold: 'Pre-teach Tier 1 vocab; show Arabic L1 cognate; mirrors for /æ/ articulation.',
        sped_scaffold: 'Elkonin sound boxes; finger-tap; 2x response time; 3 attempts with corrective feedback.',
        prerequisite_skill_ids: ['reading_pa_phoneme_isolation_initial', 'reading_phonics_letter_sound_a'],
        next_skill_ids: ['reading_phonics_short_a_medial', 'reading_phonics_short_a_final'],
        is_map_tested: true,
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 30 },
        diagnostic_anchor: 'UFLI Placement Test Set 1 (short vowels)',
        question_types: ['mc-image', 'letter-tile-spell', 'sort-into-bins', 'sound-box', 'mc-audio'],
    },
    // ...
];
```
