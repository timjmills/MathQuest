/**
 * Literacy Quest — Reading / Vocabulary skill atoms (Part 4)
 * Strands: Tier 2 academic words, synonyms/antonyms, context clues,
 *          prefix/suffix/root, multiple-meaning, figurative language
 * @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]}
 */

// ---------------------------------------------------------------------------
// Shared citation constants
// ---------------------------------------------------------------------------

const SoR_VOCAB = [
    "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
    "Stahl, S. A., & Nagy, W. E. (2006). Teaching Word Meanings. Lawrence Erlbaum Associates.",
    "Beck, I. L., & McKeown, M. G. (2007). LETRS Module 6: Digging for Meaning: Teaching Text Comprehension. Sopris West."
];

const ELL_VOCAB = "Provide L1 Arabic cognate or visual alongside each target word; use picture-word cards and sentence frames for oral practice. Audio autoplay recommended.";

const SPED_VOCAB = "Pre-teach 3 target words before any passage encounter; use Frayer model graphic organizer (definition, example, non-example, picture) for each target word. Limit to 5-8 items per session.";

const MASTERY_STD = { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 };

// ---------------------------------------------------------------------------

/** @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]} */
const vocabularyAtoms = [

    {
        skill_id: "reading_vocab_tier2_academic_grade2",
        subject: "reading",
        strand: "vocabulary",
        domain: "tier2_academic",
        sub_domain: "academic_words_grade2",
        developmental_band: "2-3",
        skill_statement: "Determine or clarify the meaning of Grade 2 Tier 2 academic words (e.g., ancient, enormous, furious, curious) using context clues and direct explanation.",
        ccss_codes: ["L.2.4a", "L.2.6"],
        rit_band: "175-190",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["2.GG.1 Use context clues to determine word meaning (Grade 2)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Beck, I. L., & McKeown, M. G. (2007). Increasing young low-income children's oral vocabulary repertoires through rich and focused instruction. The Elementary School Journal, 107(3), 251–271."
        ],
        ell_scaffold: "Provide L1 Arabic cognate (where available) alongside each Tier 2 word; use picture-word cards and sentence frames for oral practice.",
        sped_scaffold: "Teach in semantic clusters of 3–4 related words; use Frayer model graphic organizer for each target word.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_vocab_tier2_academic_grade4", "reading_vocab_context_clues_grade2"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 175-190 — using context and word relationships",
        question_types: ["mc-text", "match-pairs", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "reading_vocab_tier2_academic_grade4",
        subject: "reading",
        strand: "vocabulary",
        domain: "tier2_academic",
        sub_domain: "academic_words_grade4",
        developmental_band: "4-5+",
        skill_statement: "Determine or clarify the meaning of Grade 4–5 Tier 2 academic words (e.g., analyze, contrast, determine, significant, sufficient) using context and morphology.",
        ccss_codes: ["L.4.4a", "L.4.6", "L.5.4a", "L.5.6"],
        rit_band: "195-210",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.GG.1 Determine the meaning of unfamiliar words using context (Grade 4)", "5.GG.1 Use context clues (Grade 5)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Nagy, W. E., & Anderson, R. C. (1984). How many words are there in printed school English? Reading Research Quarterly, 19(3), 304–330."
        ],
        ell_scaffold: "Highlight Latin/Greek morphemes common to Arabic and English; provide collocations (phrases the word lives in) alongside the definition.",
        sped_scaffold: "Pre-teach 3 target words before any passage encounter; use visual thesaurus webs to show synonyms and antonyms together.",
        prerequisite_skill_ids: ["reading_vocab_tier2_academic_grade2", "reading_vocab_prefix_un_re_pre"],
        next_skill_ids: ["reading_vocab_figurative_simile_metaphor", "reading_vocab_shades_of_meaning"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 195-210 — academic and domain-specific vocabulary in context",
        question_types: ["mc-text", "fib-auto", "match-pairs", "hot-text-word", "sort-into-bins"]
    },

    {
        skill_id: "reading_vocab_context_clues_grade2",
        subject: "reading",
        strand: "vocabulary",
        domain: "context_clues",
        sub_domain: "context_clues_grade2",
        developmental_band: "2-3",
        skill_statement: "Use context clues (definition, example, contrast, restatement) in a sentence or short passage to determine the meaning of an unfamiliar Tier 2 word.",
        ccss_codes: ["L.2.4a", "L.3.4a"],
        rit_band: "180-195",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["2.GG.1 Use context clues to determine word meaning (Grade 2)", "3.GG.1 Use context clues (Grade 3)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Nation, I. S. P. (2001). Learning Vocabulary in Another Language. Cambridge University Press."
        ],
        ell_scaffold: "Teach the 4 context clue types explicitly with signal words (i.e., for example, but/however, also called); ELL students benefit from Arabic sentence-frame parallels.",
        sped_scaffold: "Use a 3-step context clue routine: (1) find the unknown word, (2) look for clues nearby, (3) substitute and reread.",
        prerequisite_skill_ids: ["reading_vocab_tier2_academic_grade2"],
        next_skill_ids: ["reading_vocab_multiple_meaning", "reading_vocab_tier2_academic_grade4"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 180-195 — using context for word meaning",
        question_types: ["mc-text", "fib-auto", "hot-text-word", "match-pairs", "sort-into-bins"]
    },

    {
        skill_id: "reading_vocab_synonym",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "synonyms",
        developmental_band: "2-3",
        skill_statement: "Identify and use synonyms for common Tier 2 adjectives and verbs (e.g., furious = angry, enormous = huge, said ≈ whispered/shouted).",
        ccss_codes: ["L.2.5a", "L.3.5", "L.4.5c"],
        rit_band: "183-198",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["2.FF.1 Choose the synonym (Grade 2)", "3.FF.1 Synonyms (Grade 3)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press."
        ],
        ell_scaffold: "Display synonym clusters as word webs; note that Arabic has similar lexical richness, helping ELL students understand the concept of synonymy.",
        sped_scaffold: "Limit to 4–5 synonym pairs per session; use color-coded synonym sets on a word wall for easy reference.",
        prerequisite_skill_ids: ["reading_vocab_tier2_academic_grade2"],
        next_skill_ids: ["reading_vocab_antonym", "reading_vocab_shades_of_meaning"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 183-198 — word relationships and synonyms",
        question_types: ["mc-text", "match-pairs", "sort-into-bins", "fib-auto", "mc-multi-select"]
    },

    {
        skill_id: "reading_vocab_antonym",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "antonyms",
        developmental_band: "2-3",
        skill_statement: "Identify antonyms (opposites) for common Tier 2 adjectives, verbs, and adverbs using knowledge of prefixes and word meaning.",
        ccss_codes: ["L.2.5a", "L.3.5", "L.4.5c"],
        rit_band: "183-198",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["2.FF.2 Choose the antonym (Grade 2)", "3.FF.2 Antonyms (Grade 3)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press."
        ],
        ell_scaffold: "Pair antonym instruction with synonym review using a T-chart; use visual continuum for gradable antonyms (hot ↔ cold).",
        sped_scaffold: "Use opposites sorting mats with picture support; avoid abstract pairs in early sessions.",
        prerequisite_skill_ids: ["reading_vocab_synonym"],
        next_skill_ids: ["reading_vocab_shades_of_meaning", "reading_vocab_multiple_meaning"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 183-198 — word relationships and antonyms",
        question_types: ["mc-text", "match-pairs", "two-button-binary", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "reading_vocab_prefix_un_re_pre",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "prefixes_common",
        developmental_band: "2-3",
        skill_statement: "Use knowledge of common prefixes (un-, re-, pre-, mis-, dis-) to determine the meaning of unfamiliar words.",
        ccss_codes: ["L.2.4b", "L.3.4b", "L.4.4b"],
        rit_band: "185-200",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["2.GG.3 Determine word meaning using prefixes (Grade 2)", "3.GG.3 Prefixes (Grade 3)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Carlisle, J. F. (2000). Awareness of the structure and meaning of morphologically complex words. Reading and Writing, 12(3), 169–190."
        ],
        ell_scaffold: "Connect English prefixes to Arabic prefixation patterns; show that un- reverses meaning just as the Arabic privative prefix does.",
        sped_scaffold: "Use color-coded word cards — prefix in red, base in black; physically 'peel off' the prefix to reveal the base word meaning.",
        prerequisite_skill_ids: ["reading_vocab_tier2_academic_grade2"],
        next_skill_ids: ["reading_vocab_suffix_er_est_ly", "reading_vocab_root_words_greek_latin"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 185-200 — morphology and word parts",
        question_types: ["mc-text", "fib-auto", "match-pairs", "hot-text-word", "sort-into-bins"]
    },

    {
        skill_id: "reading_vocab_suffix_er_est_ly",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "suffixes_comparative",
        developmental_band: "2-3",
        skill_statement: "Use knowledge of suffixes (-er, -est, -ly, -ful, -less, -ness) to interpret comparative, superlative, and adverb forms of known words.",
        ccss_codes: ["L.2.4b", "L.3.4b", "L.4.4b"],
        rit_band: "185-200",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["2.GG.4 Suffixes (Grade 2)", "3.GG.4 Determine meanings using suffixes (Grade 3)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Carlisle, J. F. (2000). Awareness of the structure and meaning of morphologically complex words. Reading and Writing, 12(3), 169–190."
        ],
        ell_scaffold: "Arabic has comparatives but no exact -ly adverbial suffix; explicitly model how -ly converts adjective to adverb with sentence pairs.",
        sped_scaffold: "Use a suffix bank card; have students underline the suffix before guessing meaning.",
        prerequisite_skill_ids: ["reading_vocab_prefix_un_re_pre"],
        next_skill_ids: ["reading_vocab_root_words_greek_latin"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 185-200 — morphology and word parts",
        question_types: ["mc-text", "fib-auto", "match-pairs", "sort-into-bins", "two-button-binary"]
    },

    {
        skill_id: "reading_vocab_root_words_greek_latin",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "greek_latin_roots",
        developmental_band: "4-5+",
        skill_statement: "Use knowledge of Greek and Latin roots (bio-, geo-, port, rupt, vis, dict, struct) to determine the meaning of multi-syllabic academic words.",
        ccss_codes: ["L.4.4b", "L.5.4b"],
        rit_band: "198-212",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.GG.4 Use Greek and Latin roots to determine word meaning (Grade 4)", "5.GG.4 Greek and Latin roots (Grade 5)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Biemiller, A. (2010). Words Worth Teaching: Closing the Vocabulary Gap. McGraw-Hill."
        ],
        ell_scaffold: "Many Greek/Latin roots entered Arabic through Greek scientific texts; highlight shared roots (e.g., bio = حياة hayah = life).",
        sped_scaffold: "Create personal morpheme dictionaries; limit to 2 new roots per week with a minimum of 6 derived words per root.",
        prerequisite_skill_ids: ["reading_vocab_prefix_un_re_pre", "reading_vocab_suffix_er_est_ly"],
        next_skill_ids: ["reading_vocab_tier2_academic_grade4"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 198-212 — Greek and Latin affixes and roots",
        question_types: ["mc-text", "fib-auto", "match-pairs", "sort-into-bins", "mc-multi-select"]
    },

    {
        skill_id: "reading_vocab_multiple_meaning",
        subject: "reading",
        strand: "vocabulary",
        domain: "multiple_meaning",
        sub_domain: "homonyms_in_context",
        developmental_band: "2-3",
        skill_statement: "Identify the correct meaning of a multiple-meaning word (e.g., bank, bark, bat, pitch) based on context clues in the sentence or passage.",
        ccss_codes: ["L.2.4a", "L.3.4a", "L.4.4a"],
        rit_band: "188-202",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["3.GG.6 Multiple-meaning words (Grade 3)", "4.GG.6 Use context to distinguish meaning of multiple-meaning words (Grade 4)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Nation, I. S. P. (2001). Learning Vocabulary in Another Language. Cambridge University Press."
        ],
        ell_scaffold: "Explicitly teach that English has many homonyms; use two-panel picture cards showing both meanings side by side.",
        sped_scaffold: "Provide a 'multiple-meaning word bank' poster; have student re-read the sentence substituting each meaning to find the best fit.",
        prerequisite_skill_ids: ["reading_vocab_context_clues_grade2"],
        next_skill_ids: ["reading_vocab_figurative_simile_metaphor"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 188-202 — using context to determine meaning of multiple-meaning words",
        question_types: ["mc-text", "drop-down-inline", "fib-auto", "sort-into-bins", "hot-text-word"]
    },

    {
        skill_id: "reading_vocab_figurative_simile_metaphor",
        subject: "reading",
        strand: "vocabulary",
        domain: "figurative_language",
        sub_domain: "simile_metaphor",
        developmental_band: "4-5+",
        skill_statement: "Distinguish between simile and metaphor; interpret the meaning of each when used in literary or informational text.",
        ccss_codes: ["L.4.5a", "L.5.5a", "RL.4.4", "RL.5.4"],
        rit_band: "192-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.II.1 Identify similes and metaphors (Grade 4)", "5.II.1 Similes and metaphors (Grade 5)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Keene, E. O., & Zimmermann, S. (2007). Mosaic of Thought: The Power of Comprehension Strategy Instruction, 2nd ed. Heinemann."
        ],
        ell_scaffold: "Arabic is rich in figurative language; surface parallels using translated examples before introducing English figures of speech.",
        sped_scaffold: "Use a visual anchor chart: Simile = uses 'like' or 'as'; Metaphor = direct comparison without signal words.",
        prerequisite_skill_ids: ["reading_vocab_multiple_meaning", "reading_vocab_synonym"],
        next_skill_ids: ["reading_vocab_shades_of_meaning"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 192-207 — figurative language including simile and metaphor",
        question_types: ["two-button-binary", "mc-text", "fib-auto", "sort-into-bins", "hot-text-sentence"]
    },

    {
        skill_id: "reading_vocab_shades_of_meaning",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_nuance",
        sub_domain: "shades_of_meaning",
        developmental_band: "4-5+",
        skill_statement: "Order adjectives and verbs on a nuance/intensity scale (e.g., cold–cool–warm–hot; whisper–say–shout) to understand connotation and degree.",
        ccss_codes: ["L.3.5c", "L.4.5c", "L.5.5c"],
        rit_band: "190-205",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["3.FF.5 Shades of meaning (Grade 3)", "4.FF.5 Use shades of meaning (Grade 4)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press."
        ],
        ell_scaffold: "Use a physical intensity thermometer visual; have students place vocabulary words on the scale using picture support for emotions.",
        sped_scaffold: "Start with 3-word scales only (mild/medium/strong); add nuance steps as accuracy improves.",
        prerequisite_skill_ids: ["reading_vocab_synonym", "reading_vocab_antonym"],
        next_skill_ids: ["reading_vocab_figurative_simile_metaphor"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 190-205 — shades of meaning and connotation",
        question_types: ["sequence-events", "mc-text", "sort-into-bins", "match-pairs", "dnd-linked"]
    },

    {
        skill_id: "reading_vocab_figurative_idioms",
        subject: "reading",
        strand: "vocabulary",
        domain: "figurative_language",
        sub_domain: "idioms",
        developmental_band: "4-5+",
        skill_statement: "Recognize and interpret common English idioms (e.g., hit the nail on the head, under the weather, bite the bullet) using context.",
        ccss_codes: ["L.4.5b", "L.5.5b"],
        rit_band: "195-210",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.II.3 Identify idioms (Grade 4)", "5.II.3 Interpret idioms (Grade 5)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Nation, I. S. P. (2001). Learning Vocabulary in Another Language. Cambridge University Press."
        ],
        ell_scaffold: "Explicitly teach that idioms cannot be decoded literally; pair each English idiom with an Arabic equivalent idiom to build cross-cultural understanding.",
        sped_scaffold: "Use a class 'Idiom Wall' with picture-illustrated cards; reference before reading any passage likely to contain idioms.",
        prerequisite_skill_ids: ["reading_vocab_figurative_simile_metaphor"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 195-210 — figurative language including idioms",
        question_types: ["mc-text", "match-pairs", "fib-auto", "sort-into-bins", "mc-multi-select"]
    },

    // -----------------------------------------------------------------------
    // TIER 2 ACADEMIC WORDS — GRADE 1
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_tier2_academic_grade1",
        subject: "reading",
        strand: "vocabulary",
        domain: "tier2_academic",
        sub_domain: "academic_words_grade1",
        developmental_band: "K-1",
        skill_statement: "Determine or clarify the meaning of Grade 1 Tier 2 academic words (e.g., compare, describe, explain, choose, predict) with picture support and teacher explanation.",
        ccss_codes: ["L.1.4a", "L.1.6"],
        rit_band: "161-175",
        rit_test: "Reading K-2",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["1.GG.1 Use context clues to determine word meaning (Grade 1)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: ELL_VOCAB,
        sped_scaffold: SPED_VOCAB,
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_vocab_tier2_academic_grade2"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 161-175 — Tier 2 academic words with picture support",
        question_types: ["mc-image", "mc-text", "fib-auto", "tap-hotspot", "dnd-linked"]
    },

    // -----------------------------------------------------------------------
    // TIER 2 ACADEMIC WORDS — GRADE 3
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_tier2_academic_grade3",
        subject: "reading",
        strand: "vocabulary",
        domain: "tier2_academic",
        sub_domain: "academic_words_grade3",
        developmental_band: "2-3",
        skill_statement: "Determine or clarify the meaning of Grade 3 Tier 2 academic words (e.g., debate, evidence, observe, identify, sequence) using context and morphological clues.",
        ccss_codes: ["L.3.4a", "L.3.6"],
        rit_band: "185-198",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["3.GG.1 Use context clues to determine word meaning (Grade 3)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: ELL_VOCAB,
        sped_scaffold: SPED_VOCAB,
        prerequisite_skill_ids: ["reading_vocab_tier2_academic_grade2"],
        next_skill_ids: ["reading_vocab_tier2_academic_grade4"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 185-198 — Tier 2 academic words in context",
        question_types: ["mc-text", "fib-auto", "match-pairs", "dnd-linked", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // TIER 2 ACADEMIC WORDS — GRADE 5
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_tier2_academic_grade5",
        subject: "reading",
        strand: "vocabulary",
        domain: "tier2_academic",
        sub_domain: "academic_words_grade5",
        developmental_band: "4-5+",
        skill_statement: "Determine or clarify the meaning of Grade 5 Tier 2 academic words (e.g., infer, evaluate, synthesize, perspective, implication) using context, morphology, and reference tools.",
        ccss_codes: ["L.5.4a", "L.5.4c", "L.5.6"],
        rit_band: "200-215",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["5.GG.1 Use context clues (Grade 5)", "5.GG.4 Use a dictionary or glossary entry to define words (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Highlight Latin/Greek morphemes shared with Arabic scientific vocabulary; provide collocations (phrases the word lives in) alongside the definition.",
        sped_scaffold: SPED_VOCAB,
        prerequisite_skill_ids: ["reading_vocab_tier2_academic_grade4"],
        next_skill_ids: ["reading_vocab_connotation_grade5", "reading_vocab_advanced_analogies"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 200-215 — Grade 5 academic and domain-specific vocabulary",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "tap-hotspot", "mc-multi-select"]
    },

    // -----------------------------------------------------------------------
    // TIER 2 — EMOTION WORDS
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_tier2_emotion_words",
        subject: "reading",
        strand: "vocabulary",
        domain: "tier2_academic",
        sub_domain: "emotion_vocabulary",
        developmental_band: "K-1",
        skill_statement: "Identify and use precise emotion words (e.g., anxious, frustrated, delighted, terrified, proud) beyond basic happy/sad/angry to describe characters and feelings.",
        ccss_codes: ["L.K.5a", "L.1.5a", "L.2.5a"],
        rit_band: "155-175",
        rit_test: "Reading K-2",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["K.FF.1 Use describing words (Kindergarten)", "1.FF.1 Adjectives (Grade 1)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Use picture emotion cards (faces); provide Arabic labels alongside each English emotion word. Body language visuals reduce reliance on text.",
        sped_scaffold: "Use an 'emotion thermometer' poster; physically point to emotion level. Limit to 4 new emotion words per session.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_vocab_tier2_academic_grade2", "reading_vocab_shades_of_meaning_basic"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 155-175 — descriptive vocabulary and character emotion",
        question_types: ["mc-image", "mc-text", "tap-hotspot", "dnd-linked", "two-button-binary"]
    },

    // -----------------------------------------------------------------------
    // TIER 2 — ACTION VERBS
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_tier2_action_verbs",
        subject: "reading",
        strand: "vocabulary",
        domain: "tier2_academic",
        sub_domain: "action_verb_vocabulary",
        developmental_band: "K-1",
        skill_statement: "Identify and use precise action verbs (e.g., sprint, trudge, leap, shuffle, snatch) to understand nuanced descriptions of movement in text.",
        ccss_codes: ["L.1.5d", "L.2.5b"],
        rit_band: "158-178",
        rit_test: "Reading K-2",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["1.E.1 Action verbs (Grade 1)", "2.E.1 Action verbs (Grade 2)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Act out action verbs physically before reading; use short video clips where available. Pair English verb with Arabic equivalent in a card set.",
        sped_scaffold: "Use total physical response (TPR): students perform the action when they hear the verb. Limit to 5 verbs per session.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_vocab_shades_of_meaning_basic", "reading_vocab_tier2_academic_grade2"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 158-178 — precise verb vocabulary",
        question_types: ["mc-image", "mc-text", "fib-auto", "tap-hotspot", "dnd-linked"]
    },

    // -----------------------------------------------------------------------
    // TIER 2 — DESCRIPTIVE ADJECTIVES
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_tier2_descriptive_adjectives",
        subject: "reading",
        strand: "vocabulary",
        domain: "tier2_academic",
        sub_domain: "descriptive_adjective_vocabulary",
        developmental_band: "K-1",
        skill_statement: "Identify and use descriptive adjectives (e.g., jagged, gleaming, sturdy, feeble, transparent) to understand how authors create vivid images in text.",
        ccss_codes: ["L.1.1f", "L.2.1e", "L.K.5b"],
        rit_band: "158-180",
        rit_test: "Reading K-2",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["1.FF.4 Choose the adjective that best completes the sentence (Grade 1)", "2.FF.4 Using adjectives (Grade 2)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Pair adjectives with tactile objects where possible (rough sandpaper, smooth fabric). Show Arabic equivalents to build conceptual bridges.",
        sped_scaffold: "Create a class 'Describing Wall' grouped by sense (sight, touch, sound, taste, smell). Allow students to add pictures.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_vocab_shades_of_meaning_basic", "reading_vocab_tier2_academic_grade2"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 158-180 — descriptive adjective vocabulary",
        question_types: ["mc-image", "mc-text", "fib-auto", "dnd-linked", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // SYNONYMS — SIMPLE (K-1)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_simple_synonyms",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "synonyms_simple",
        developmental_band: "K-1",
        skill_statement: "Match simple synonyms for common Tier 1 words (e.g., big/large, happy/glad, fast/quick, little/small) using picture support.",
        ccss_codes: ["L.K.5b", "L.1.5", "L.2.5a"],
        rit_band: "158-175",
        rit_test: "Reading K-2",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["K.FF.1 Which two words mean the same thing? (Kindergarten)", "1.FF.1 Choose the synonym (Grade 1)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Use visual synonym webs; note that Arabic has rich synonymy — build on students' L1 metalinguistic awareness of word equivalence.",
        sped_scaffold: "Work with synonym pairs on color-coded cards (both cards same color). Focus on 4-5 pairs per session.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_vocab_synonym", "reading_vocab_simple_antonyms"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 158-175 — basic word relationships and synonymy",
        question_types: ["mc-image", "mc-text", "dnd-linked", "two-button-binary", "match-pairs"]
    },

    // -----------------------------------------------------------------------
    // SYNONYMS — ADVANCED (GRADE 4-5)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_advanced_synonyms",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "synonyms_advanced",
        developmental_band: "4-5+",
        skill_statement: "Select and use nuanced synonyms for Tier 2 academic words (e.g., assist/aid/support, investigate/examine/scrutinize) with awareness of connotation differences.",
        ccss_codes: ["L.4.5c", "L.5.5c", "L.4.6"],
        rit_band: "195-210",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.FF.1 Synonyms (Grade 4)", "5.FF.1 Choose the synonym (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Use a visual thesaurus web to show synonym clusters with connotation gradient. Note Arabic semantic fields with similar nuance distinctions.",
        sped_scaffold: "Present synonym clusters of 3 words on a single card with 'mild/medium/strong' scale; choose before composing sentences.",
        prerequisite_skill_ids: ["reading_vocab_synonym", "reading_vocab_shades_of_meaning"],
        next_skill_ids: ["reading_vocab_advanced_antonyms", "reading_vocab_connotation_grade5"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 195-210 — nuanced synonyms and connotation",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "mc-multi-select", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // ANTONYMS — SIMPLE (K-1)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_simple_antonyms",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "antonyms_simple",
        developmental_band: "K-1",
        skill_statement: "Match simple antonym pairs for common Tier 1 words (e.g., hot/cold, up/down, night/day, in/out) using picture support.",
        ccss_codes: ["L.K.5b", "L.1.5", "L.2.5a"],
        rit_band: "158-175",
        rit_test: "Reading K-2",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["K.FF.2 Which two words mean the opposite? (Kindergarten)", "1.FF.2 Choose the antonym (Grade 1)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Use real objects or photographs showing opposites. Arabic has clear antonym structures — surface parallels to build conceptual bridge.",
        sped_scaffold: "Use a two-column sorting mat labeled 'Opposites.' Physical sorting with picture cards before digital practice.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_vocab_antonym"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 158-175 — basic word relationships and antonyms",
        question_types: ["mc-image", "mc-text", "dnd-linked", "two-button-binary", "match-pairs"]
    },

    // -----------------------------------------------------------------------
    // ANTONYMS — ADVANCED (GRADE 4-5)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_advanced_antonyms",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "antonyms_advanced",
        developmental_band: "4-5+",
        skill_statement: "Identify antonyms for Tier 2 academic and Tier 3 domain words (e.g., benevolent/malevolent, abundant/scarce, transparent/opaque) and distinguish gradable from complementary antonym pairs.",
        ccss_codes: ["L.4.5c", "L.5.5c"],
        rit_band: "195-210",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.FF.2 Antonyms (Grade 4)", "5.FF.2 Choose the antonym (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Pair antonym instruction with connotation review; Arabic ELL students benefit from morpheme-level analysis of un-/dis- negation parallel to Arabic privative prefix.",
        sped_scaffold: "Use gradable antonym continuums (thermometer, ruler, volume dial) alongside complementary pairs (alive/dead — no middle ground).",
        prerequisite_skill_ids: ["reading_vocab_antonym", "reading_vocab_advanced_synonyms"],
        next_skill_ids: ["reading_vocab_connotation_grade5", "reading_vocab_advanced_analogies"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 195-210 — antonyms including gradable and complementary pairs",
        question_types: ["mc-text", "fib-auto", "match-pairs", "sort-into-bins", "dnd-linked"]
    },

    // -----------------------------------------------------------------------
    // HOMOPHONES — BASIC (K-1: their/there/they're)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_homophones_basic",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "homophones_basic",
        developmental_band: "K-1",
        skill_statement: "Distinguish between the most common homophones: their / there / they're, using sentence context to select the correct spelling and meaning.",
        ccss_codes: ["L.1.4a", "L.2.4e"],
        rit_band: "162-180",
        rit_test: "Reading K-2",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["1.GG.8 Homophones (Grade 1)", "2.GG.8 Homophones (Grade 2)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Explicitly teach that some English words sound identical but differ in spelling and meaning — this has no direct parallel in Arabic morphology. Use anchor sentences and visual mnemonics (there contains 'here' = a place).",
        sped_scaffold: "One homophone set at a time; use color coding (there = blue for place, their = green for possession, they're = orange for contraction). Physical sorting with card sets.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_vocab_homophones_grade3"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 162-180 — commonly confused words",
        question_types: ["mc-text", "fib-auto", "two-button-binary", "dnd-linked", "tap-hotspot"]
    },

    // -----------------------------------------------------------------------
    // HOMOPHONES — GRADE 3 (your/you're, its/it's, to/too/two)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_homophones_grade3",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "homophones_grade3",
        developmental_band: "2-3",
        skill_statement: "Distinguish and correctly use Grade 3 homophones: your/you're, its/it's, to/too/two, in written and reading contexts.",
        ccss_codes: ["L.2.4e", "L.3.4a"],
        rit_band: "175-192",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["3.GG.8 Homophones (Grade 3)", "2.GG.9 Commonly confused words (Grade 2)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: ELL_VOCAB,
        sped_scaffold: "Create a personal homophones reference card; check card before answering. Practice one set per session. Use error analysis to target persistent confusions.",
        prerequisite_skill_ids: ["reading_vocab_homophones_basic"],
        next_skill_ids: ["reading_vocab_homophones_grade4"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 175-192 — homophones and commonly confused words",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "two-button-binary", "tap-hotspot"]
    },

    // -----------------------------------------------------------------------
    // HOMOPHONES — GRADE 4 (here/hear, see/sea, write/right)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_homophones_grade4",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "homophones_grade4",
        developmental_band: "4-5+",
        skill_statement: "Select the correct homophone in context (here/hear, see/sea, write/right, piece/peace, break/brake, plain/plane, pear/pair/pare) with awareness of spelling-meaning link.",
        ccss_codes: ["L.4.4a", "L.4.4c"],
        rit_band: "185-200",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.GG.8 Homophones (Grade 4)", "4.GG.9 Use the correct frequently confused word (Grade 4)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: ELL_VOCAB,
        sped_scaffold: "Group homophones by semantic category (body vs. direction; water vs. action). Visual mnemonic sketches on a dedicated reference page.",
        prerequisite_skill_ids: ["reading_vocab_homophones_grade3"],
        next_skill_ids: ["reading_vocab_homophones_advanced"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 185-200 — homophones and word meaning in context",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "sort-into-bins", "tap-hotspot"]
    },

    // -----------------------------------------------------------------------
    // HOMOPHONES — ADVANCED
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_homophones_advanced",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "homophones_advanced",
        developmental_band: "4-5+",
        skill_statement: "Correctly use and interpret less common homophones (e.g., stationary/stationery, principal/principle, complement/compliment, affect/effect) in academic writing and reading contexts.",
        ccss_codes: ["L.4.4a", "L.5.4a", "L.5.4c"],
        rit_band: "198-212",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["5.GG.8 Homophones (Grade 5)", "5.GG.9 Use the correct frequently confused word (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Connect to morphology: stationary (standing) vs. stationery (paper with 'er' for envelope). Etymology tips help ELL students with advanced pairs.",
        sped_scaffold: "Focus on one pair per session with a sentence anchor card. Error log maintained by student for self-monitoring.",
        prerequisite_skill_ids: ["reading_vocab_homophones_grade4"],
        next_skill_ids: ["reading_vocab_connotation_grade5"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 198-212 — nuanced word choice and commonly confused words",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "two-button-binary", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // MULTIPLE-MEANING WORDS — BASIC (K-2)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_multiple_meaning_basic",
        subject: "reading",
        strand: "vocabulary",
        domain: "multiple_meaning",
        sub_domain: "homonyms_basic",
        developmental_band: "K-1",
        skill_statement: "Identify two meanings of simple multiple-meaning words (e.g., bat, ball, run, can, well) using picture support and brief context sentences.",
        ccss_codes: ["L.K.4a", "L.1.4a", "L.2.4a"],
        rit_band: "162-180",
        rit_test: "Reading K-2",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["K.GG.4 Multiple-meaning words (Kindergarten)", "1.GG.4 Multiple-meaning words (Grade 1)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Use two-panel picture cards showing both meanings side by side. Explicitly teach that English has many homonyms; Arabic has fewer, so this needs direct instruction.",
        sped_scaffold: "Provide a word bank with both definitions written; student reads sentence, then selects which definition fits.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_vocab_multiple_meaning"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 162-180 — multiple-meaning words with picture support",
        question_types: ["mc-image", "mc-text", "dnd-linked", "tap-hotspot", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // MULTIPLE-MEANING WORDS — GRADE 5+
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_multiple_meaning_grade5",
        subject: "reading",
        strand: "vocabulary",
        domain: "multiple_meaning",
        sub_domain: "homonyms_grade5",
        developmental_band: "4-5+",
        skill_statement: "Distinguish among multiple meanings of Tier 2 and Tier 3 academic words used across subject areas (e.g., table, volume, produce, degree, scale, mass) using discipline-specific context.",
        ccss_codes: ["L.4.4a", "L.5.4a"],
        rit_band: "198-212",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["5.GG.6 Multiple-meaning words (Grade 5)", "4.GG.6 Use context to distinguish meaning of multiple-meaning words (Grade 4)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Create a cross-subject vocabulary map showing the same word in science, math, and ELA contexts. Arabic cognates may exist for some domain-specific meanings.",
        sped_scaffold: "Subject-labeled flashcard sets (science/math/ELA) for each multi-meaning word. Re-read sentence substituting each definition.",
        prerequisite_skill_ids: ["reading_vocab_multiple_meaning"],
        next_skill_ids: ["reading_vocab_connotation_grade5"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 198-212 — academic vocabulary across content areas",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "sort-into-bins", "tap-hotspot"]
    },

    // -----------------------------------------------------------------------
    // CONTEXT CLUES — DEFINITION TYPE
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_context_clues_definition",
        subject: "reading",
        strand: "vocabulary",
        domain: "context_clues",
        sub_domain: "context_clues_definition",
        developmental_band: "2-3",
        skill_statement: "Use embedded definition context clues (signal words: is, means, is called, refers to, which is/are) to determine the meaning of unfamiliar words.",
        ccss_codes: ["L.2.4a", "L.3.4a", "L.4.4a"],
        rit_band: "178-193",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["3.GG.1 Use context clues to determine word meaning (Grade 3)", "2.GG.1 Use context clues (Grade 2)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Definition clues are most transparent for ELL students; teach signal words explicitly as 'definition markers.' Provide Arabic glossary cards for target words.",
        sped_scaffold: "Underline signal words in the sentence before attempting to define the unknown word. Use a 3-step routine: find the word, find the signal, read the definition.",
        prerequisite_skill_ids: ["reading_vocab_tier2_academic_grade2"],
        next_skill_ids: ["reading_vocab_context_clues_synonym", "reading_vocab_context_clues_antonym"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 178-193 — context clues, definition type",
        question_types: ["mc-text", "fib-auto", "tap-hotspot", "dnd-linked", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // CONTEXT CLUES — SYNONYM TYPE
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_context_clues_synonym",
        subject: "reading",
        strand: "vocabulary",
        domain: "context_clues",
        sub_domain: "context_clues_synonym",
        developmental_band: "2-3",
        skill_statement: "Use synonym/restatement context clues (signal words: or, also called, in other words, like, similarly) to determine meaning of unfamiliar words.",
        ccss_codes: ["L.3.4a", "L.4.4a"],
        rit_band: "183-196",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["3.GG.1 Use context clues to determine word meaning (Grade 3)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: ELL_VOCAB,
        sped_scaffold: "Circle the signal word; draw an arrow to the unknown word; read the synonym as the definition. Two-step graphic organizer: [signal word] → [meaning word].",
        prerequisite_skill_ids: ["reading_vocab_context_clues_definition", "reading_vocab_synonym"],
        next_skill_ids: ["reading_vocab_context_clues_antonym", "reading_vocab_context_clues_inference"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 183-196 — context clues, synonym/restatement type",
        question_types: ["mc-text", "fib-auto", "tap-hotspot", "dnd-linked", "mc-multi-select"]
    },

    // -----------------------------------------------------------------------
    // CONTEXT CLUES — ANTONYM/CONTRAST TYPE
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_context_clues_antonym",
        subject: "reading",
        strand: "vocabulary",
        domain: "context_clues",
        sub_domain: "context_clues_antonym",
        developmental_band: "2-3",
        skill_statement: "Use contrast/antonym context clues (signal words: but, however, unlike, although, on the other hand, instead) to determine the meaning of unfamiliar words.",
        ccss_codes: ["L.3.4a", "L.4.4a"],
        rit_band: "186-200",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.GG.1 Determine the meaning of unfamiliar words using context (Grade 4)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Arabic contrast signals (لكن / بينما) map closely to but/however. Surface this parallel to accelerate signal-word recognition.",
        sped_scaffold: "Underline the contrast signal; find the word students know; reverse it to get the unknown word's meaning. Use a see-saw diagram graphic organizer.",
        prerequisite_skill_ids: ["reading_vocab_context_clues_synonym", "reading_vocab_antonym"],
        next_skill_ids: ["reading_vocab_context_clues_inference"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 186-200 — context clues, contrast/antonym type",
        question_types: ["mc-text", "fib-auto", "tap-hotspot", "two-button-binary", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // CONTEXT CLUES — INFERENCE TYPE
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_context_clues_inference",
        subject: "reading",
        strand: "vocabulary",
        domain: "context_clues",
        sub_domain: "context_clues_inference",
        developmental_band: "4-5+",
        skill_statement: "Use general context and background knowledge to infer the probable meaning of an unknown word when no explicit signal word is present.",
        ccss_codes: ["L.4.4a", "L.5.4a"],
        rit_band: "193-208",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.GG.1 Determine the meaning of unfamiliar words using context (Grade 4)", "5.GG.1 Use context clues (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Model the think-aloud inference process step by step using familiar topics. ELL students benefit from schema activation in L1 before English inference practice.",
        sped_scaffold: "Use a 4-step inference routine: (1) unknown word, (2) sentence clues, (3) background knowledge, (4) best-guess definition. Provide sentence frames for each step.",
        prerequisite_skill_ids: ["reading_vocab_context_clues_antonym", "reading_vocab_tier2_academic_grade4"],
        next_skill_ids: ["reading_vocab_tier2_academic_grade5"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 193-208 — inferring word meaning from context without explicit signal words",
        question_types: ["mc-text", "fib-auto", "tap-hotspot", "dnd-linked", "mc-multi-select"]
    },

    // -----------------------------------------------------------------------
    // PREFIXES — dis- pre- mis-
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_prefix_dis_pre_mis",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "prefixes_intermediate",
        developmental_band: "2-3",
        skill_statement: "Use knowledge of prefixes dis- (not/opposite), pre- (before), and mis- (wrongly) to determine the meaning of unfamiliar words.",
        ccss_codes: ["L.3.4b", "L.4.4b"],
        rit_band: "188-202",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["3.GG.3 Determine the meaning using prefixes (Grade 3)", "4.GG.3 Words with prefixes (Grade 4)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Carlisle, J. F. (2000). Awareness of the structure and meaning of morphologically complex words. Reading and Writing, 12(3), 169–190."
        ],
        ell_scaffold: "Arabic has a privative prefix (غير / لا) similar to dis-/mis-; surface the parallel. Connect pre- to familiar words like preview and preschool.",
        sped_scaffold: "Color-code the prefix segment on word cards; physically 'peel off' the prefix to expose the base and reverse the meaning. One prefix per session.",
        prerequisite_skill_ids: ["reading_vocab_prefix_un_re_pre"],
        next_skill_ids: ["reading_vocab_prefix_sub_super_inter"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 188-202 — morphology, prefixes dis-/pre-/mis-",
        question_types: ["mc-text", "fib-auto", "match-pairs", "tap-hotspot", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // PREFIXES — sub- super- inter-
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_prefix_sub_super_inter",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "prefixes_advanced",
        developmental_band: "4-5+",
        skill_statement: "Use knowledge of Latin prefixes sub- (under/below), super- (above/more), and inter- (between/among) to decode and infer meaning of multi-syllabic words.",
        ccss_codes: ["L.4.4b", "L.5.4b"],
        rit_band: "196-210",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.GG.3 Words with prefixes (Grade 4)", "5.GG.3 Words with prefixes (Grade 5)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Carlisle, J. F. (2000). Awareness of the structure and meaning of morphologically complex words. Reading and Writing, 12(3), 169–190."
        ],
        ell_scaffold: "Many sub-/super-/inter- words entered Arabic through Latin scientific texts; highlight shared roots (submarine, supermarket, international). Encourage word family exploration.",
        sped_scaffold: "Create personal morpheme dictionaries; student draws a picture representing each prefix meaning (sub = underwater, super = flying above). Limit to 2 prefixes per week.",
        prerequisite_skill_ids: ["reading_vocab_prefix_dis_pre_mis"],
        next_skill_ids: ["reading_vocab_prefix_advanced"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 196-210 — morphology, Latin prefixes sub-/super-/inter-",
        question_types: ["mc-text", "fib-auto", "match-pairs", "dnd-linked", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // PREFIXES — ADVANCED (multi- trans- anti- bi- tri-)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_prefix_advanced",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "prefixes_advanced_number_opposition",
        developmental_band: "4-5+",
        skill_statement: "Use knowledge of advanced prefixes (multi-, trans-, anti-, bi-, tri-, semi-, over-, under-) to determine the meaning of academic and domain-specific words.",
        ccss_codes: ["L.5.4b"],
        rit_band: "200-215",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["5.GG.3 Words with prefixes (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Arabic uses similar numeric prefixes (ثنائي = bi-, ثلاثي = tri-); surface parallels in Arabic mathematical vocabulary to leverage L1 knowledge.",
        sped_scaffold: "Focus on number prefixes (bi-=2, tri-=3, multi-=many) as a cluster; use visual counting to anchor meaning. Then expand to trans- and anti- separately.",
        prerequisite_skill_ids: ["reading_vocab_prefix_sub_super_inter"],
        next_skill_ids: ["reading_vocab_roots_greek"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 200-215 — morphology, advanced prefixes",
        question_types: ["mc-text", "fib-auto", "match-pairs", "dnd-linked", "mc-multi-select"]
    },

    // -----------------------------------------------------------------------
    // SUFFIXES — -er -est (comparative/superlative)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_suffix_er_est",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "suffixes_comparative_superlative",
        developmental_band: "2-3",
        skill_statement: "Use knowledge of comparative suffix -er (more) and superlative suffix -est (most) to interpret and form comparative/superlative adjective forms.",
        ccss_codes: ["L.2.4b", "L.3.4b"],
        rit_band: "182-196",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["2.GG.4 Suffixes (Grade 2)", "3.GG.4 Determine meanings using suffixes (Grade 3)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Arabic uses separate words for comparison (أكثر / الأكثر) rather than suffixes; explicitly model the suffix-based English system with visual scales.",
        sped_scaffold: "Use a three-step ladder graphic: base word → add -er → add -est. Color-code each level. Practice with adjectives students already know.",
        prerequisite_skill_ids: ["reading_vocab_tier2_academic_grade2"],
        next_skill_ids: ["reading_vocab_suffix_ly_ful_less"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 182-196 — morphology, comparative and superlative suffixes",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "sort-into-bins", "match-pairs"]
    },

    // -----------------------------------------------------------------------
    // SUFFIXES — -ly -ful -less
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_suffix_ly_ful_less",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "suffixes_adverb_quality",
        developmental_band: "2-3",
        skill_statement: "Use knowledge of suffixes -ly (in the manner of), -ful (full of / characterized by), and -less (without) to determine word meaning and part of speech.",
        ccss_codes: ["L.2.4b", "L.3.4b", "L.4.4b"],
        rit_band: "184-198",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["2.GG.4 Suffixes (Grade 2)", "3.GG.4 Determine meanings using suffixes (Grade 3)", "4.GG.5 Words with suffixes (Grade 4)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Carlisle, J. F. (2000). Awareness of the structure and meaning of morphologically complex words. Reading and Writing, 12(3), 169–190."
        ],
        ell_scaffold: "Model how -ly converts adjectives to adverbs using sentence pairs: 'She is quick. She ran quickly.' Arabic uses a separate adverb form — the transformation pattern needs explicit demonstration.",
        sped_scaffold: "Use a suffix bank reference card; have students underline the suffix before determining meaning and identifying part of speech.",
        prerequisite_skill_ids: ["reading_vocab_suffix_er_est"],
        next_skill_ids: ["reading_vocab_suffix_ness_tion_ity"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 184-198 — morphology, suffixes -ly/-ful/-less",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "sort-into-bins", "two-button-binary"]
    },

    // -----------------------------------------------------------------------
    // SUFFIXES — -ness -tion -ity
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_suffix_ness_tion_ity",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "suffixes_nominalization",
        developmental_band: "4-5+",
        skill_statement: "Use knowledge of noun-forming suffixes -ness (state of), -tion/-sion (act or process of), and -ity (quality or condition) to determine meaning of nominalized academic words.",
        ccss_codes: ["L.4.4b", "L.5.4b"],
        rit_band: "193-208",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.GG.5 Words with suffixes (Grade 4)", "5.GG.5 Words with suffixes (Grade 5)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Carlisle, J. F. (2000). Awareness of the structure and meaning of morphologically complex words. Reading and Writing, 12(3), 169–190."
        ],
        ell_scaffold: "Arabic uses broken-plural noun forms to express state/quality; -ness/-tion/-ity serve a similar nominalization function. Highlight cognates: nation/nationality, create/creation.",
        sped_scaffold: "Word-family tree visual: verb → add -tion → noun form. Practice 3 word families per session (e.g., create/creation, happy/happiness, equal/equality).",
        prerequisite_skill_ids: ["reading_vocab_suffix_ly_ful_less"],
        next_skill_ids: ["reading_vocab_roots_latin"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 193-208 — morphology, nominalization suffixes",
        question_types: ["mc-text", "fib-auto", "match-pairs", "dnd-linked", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // ROOTS — GREEK (graph, photo, tele, scope, bio, geo, micro, hydro)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_roots_greek",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "greek_roots",
        developmental_band: "4-5+",
        skill_statement: "Use knowledge of Greek roots (graph = write, photo = light, tele = far, scope = see/look, bio = life, geo = earth, micro = small, hydro = water) to infer meanings of academic words.",
        ccss_codes: ["L.4.4b", "L.5.4b"],
        rit_band: "196-212",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.GG.4 Use Greek and Latin roots to determine word meaning (Grade 4)", "5.GG.4 Greek and Latin roots (Grade 5)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Biemiller, A. (2010). Words Worth Teaching: Closing the Vocabulary Gap. McGraw-Hill."
        ],
        ell_scaffold: "Greek scientific roots entered Arabic through ancient translations (بيولوجيا = biology, جغرافيا = geography); surface these cognates to build L1 bridges.",
        sped_scaffold: "Create personal morpheme dictionaries with a picture for each root meaning. Limit to 2 new roots per week with 4-6 derived words per root.",
        prerequisite_skill_ids: ["reading_vocab_prefix_advanced", "reading_vocab_suffix_ness_tion_ity"],
        next_skill_ids: ["reading_vocab_roots_latin"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 196-212 — Greek roots in academic and science vocabulary",
        question_types: ["mc-text", "fib-auto", "match-pairs", "dnd-linked", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // ROOTS — LATIN (port, tract, dict, struct, rupt, vis, aud)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_roots_latin",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "latin_roots",
        developmental_band: "4-5+",
        skill_statement: "Use knowledge of Latin roots (port = carry, tract = pull/drag, dict = say/tell, struct = build, rupt = break, vis = see, aud = hear) to decode and infer the meaning of multi-syllabic words.",
        ccss_codes: ["L.4.4b", "L.5.4b"],
        rit_band: "198-212",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.GG.4 Use Greek and Latin roots to determine word meaning (Grade 4)", "5.GG.4 Greek and Latin roots (Grade 5)"],
        sor_citations: [
            "Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing Words to Life: Robust Vocabulary Instruction, 2nd ed. Guilford Press.",
            "Biemiller, A. (2010). Words Worth Teaching: Closing the Vocabulary Gap. McGraw-Hill."
        ],
        ell_scaffold: "Many Latin roots entered Arabic through Spanish and scientific borrowings; highlight shared roots (dictionary/قاموس; auditorium/مدرج). Prefix + root + suffix analysis builds word family networks.",
        sped_scaffold: "Use a root word anchor chart with the root in the center and 4-6 derived words branching out. Practice adding known prefixes/suffixes to each root.",
        prerequisite_skill_ids: ["reading_vocab_roots_greek"],
        next_skill_ids: ["reading_vocab_roots_advanced"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 198-212 — Latin roots in academic and literary vocabulary",
        question_types: ["mc-text", "fib-auto", "match-pairs", "dnd-linked", "mc-multi-select"]
    },

    // -----------------------------------------------------------------------
    // ROOTS — ADVANCED (cross-root morpheme analysis)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_roots_advanced",
        subject: "reading",
        strand: "vocabulary",
        domain: "morphology",
        sub_domain: "roots_advanced_cross_morpheme",
        developmental_band: "4-5+",
        skill_statement: "Combine knowledge of multiple Greek and Latin roots, prefixes, and suffixes to decode and interpret complex multi-morpheme academic words (e.g., photosynthesis, autobiography, telecommunications, biodiversity).",
        ccss_codes: ["L.5.4b", "L.5.4c"],
        rit_band: "203-218",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["5.GG.4 Greek and Latin roots (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Model systematic word dissection: identify each morpheme, find its meaning, combine. Arabic-speaking students often find this morphological analysis natural given Arabic root-pattern system.",
        sped_scaffold: "Word dissection graphic organizer: prefix | root 1 | root 2 | suffix, with a meaning box below each segment. Combine bottom-up. Allow reference to personal morpheme dictionary.",
        prerequisite_skill_ids: ["reading_vocab_roots_latin"],
        next_skill_ids: ["reading_vocab_advanced_analogies"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 203-218 — complex multi-morpheme word analysis",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "match-pairs", "mc-multi-select"]
    },

    // -----------------------------------------------------------------------
    // WORD ANALOGIES — SIMPLE
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_simple_analogies",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "simple_analogies",
        developmental_band: "2-3",
        skill_statement: "Complete simple word analogies using synonym, antonym, and category relationships (e.g., hot is to cold as day is to ___; puppy is to dog as kitten is to ___).",
        ccss_codes: ["L.2.5a", "L.3.5a", "L.4.5b"],
        rit_band: "185-200",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["3.FF.6 Analogies (Grade 3)", "4.FF.6 Analogies (Grade 4)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Teach the analogy frame 'A is to B as C is to D' explicitly; use picture-based analogies before text-only. Arabic uses parallel structure in rhetoric — surface this connection.",
        sped_scaffold: "Provide a completed model analogy with the relationship labeled; student completes a parallel analogy using the same relationship type. Scaffold with word bank.",
        prerequisite_skill_ids: ["reading_vocab_synonym", "reading_vocab_antonym"],
        next_skill_ids: ["reading_vocab_advanced_analogies"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 185-200 — word relationships and analogical reasoning",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "match-pairs", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // WORD ANALOGIES — ADVANCED
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_advanced_analogies",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_relationships",
        sub_domain: "advanced_analogies",
        developmental_band: "4-5+",
        skill_statement: "Complete and create advanced word analogies using part-to-whole, function, characteristic, cause-effect, and degree relationships with Tier 2 and Tier 3 vocabulary.",
        ccss_codes: ["L.4.5b", "L.5.5b"],
        rit_band: "197-212",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.FF.6 Analogies (Grade 4)", "5.FF.6 Analogies (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Teach analogy relationship categories explicitly using a taxonomy card (synonym, antonym, part-whole, function, degree). Model each type with a familiar example before academic vocabulary.",
        sped_scaffold: "Label the relationship type before completing each analogy; color-code relationship types. Reduce to 3-4 analogy items per session.",
        prerequisite_skill_ids: ["reading_vocab_simple_analogies", "reading_vocab_advanced_synonyms"],
        next_skill_ids: ["reading_vocab_connotation_grade5"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 197-212 — analogy reasoning with academic vocabulary",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "match-pairs", "mc-multi-select"]
    },

    // -----------------------------------------------------------------------
    // SHADES OF MEANING — BASIC (K-2)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_shades_of_meaning_basic",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_nuance",
        sub_domain: "shades_of_meaning_basic",
        developmental_band: "K-1",
        skill_statement: "Order 3-word sets of adjectives or verbs by intensity on a visual scale (e.g., cold/cool/warm, tiny/small/big, tap/hit/pound).",
        ccss_codes: ["L.K.5c", "L.1.5d", "L.2.5b"],
        rit_band: "163-180",
        rit_test: "Reading K-2",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["K.FF.4 Put the words in order (Kindergarten)", "1.FF.5 Shades of meaning (Grade 1)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Use a physical 'intensity thermometer' visual; have students place word cards on the scale. Picture support for each word reduces language-load barrier.",
        sped_scaffold: "Work with 3-word scales only (mild/medium/strong); add 4th or 5th word as accuracy improves. Use physical word cards to sort before digital practice.",
        prerequisite_skill_ids: ["reading_vocab_simple_synonyms", "reading_vocab_tier2_emotion_words"],
        next_skill_ids: ["reading_vocab_shades_of_meaning"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 163-180 — intensity ordering and shades of meaning",
        question_types: ["mc-image", "mc-text", "dnd-linked", "sort-into-bins", "match-pairs"]
    },

    // -----------------------------------------------------------------------
    // SHADES OF MEANING — ADVANCED (GRADE 4-5)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_shades_of_meaning_advanced",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_nuance",
        sub_domain: "shades_of_meaning_advanced",
        developmental_band: "4-5+",
        skill_statement: "Order 5-6 word sets of synonyms by intensity/connotation and explain the difference (e.g., content/pleased/happy/elated/ecstatic; dislike/disapprove/despise/loathe).",
        ccss_codes: ["L.4.5c", "L.5.5c"],
        rit_band: "195-210",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.FF.5 Use shades of meaning (Grade 4)", "5.FF.5 Shades of meaning (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Use a visual gradient bar from light to dark to represent intensity levels. Arabic near-synonyms (خوف/رعب = fear/terror) surface the concept in L1 before English practice.",
        sped_scaffold: "Provide the end anchors (mildest and strongest) and ask students to place the remaining words. Scaffold with sentence contexts for each word in the set.",
        prerequisite_skill_ids: ["reading_vocab_shades_of_meaning", "reading_vocab_advanced_synonyms"],
        next_skill_ids: ["reading_vocab_connotation_grade5"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 195-210 — nuanced word intensity and connotation gradients",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "sort-into-bins", "match-pairs"]
    },

    // -----------------------------------------------------------------------
    // CONNOTATION / DENOTATION — GRADE 5
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_connotation_grade5",
        subject: "reading",
        strand: "vocabulary",
        domain: "word_nuance",
        sub_domain: "connotation_denotation",
        developmental_band: "4-5+",
        skill_statement: "Distinguish between a word's denotation (dictionary meaning) and its positive, negative, or neutral connotation; identify how an author's word choice affects tone and meaning.",
        ccss_codes: ["L.5.5c", "RL.5.4", "RI.5.4"],
        rit_band: "198-214",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["5.FF.5 Shades of meaning (Grade 5)", "5.II.4 Positive and negative connotations (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Arabic has strong connotation awareness in classical and modern usage; surface this parallel. Focus on emotional valence (positive/negative) before neutral/ambivalent distinctions.",
        sped_scaffold: "Use a three-column graphic organizer: positive / neutral / negative. Sort synonym clusters before analyzing author's word choice in context.",
        prerequisite_skill_ids: ["reading_vocab_shades_of_meaning_advanced", "reading_vocab_advanced_synonyms"],
        next_skill_ids: [],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 198-214 — connotation, denotation, and author's word choice",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "sort-into-bins", "two-button-binary"]
    },

    // -----------------------------------------------------------------------
    // FIGURATIVE LANGUAGE — METAPHOR (standalone)
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_figurative_metaphor",
        subject: "reading",
        strand: "vocabulary",
        domain: "figurative_language",
        sub_domain: "metaphor",
        developmental_band: "4-5+",
        skill_statement: "Identify metaphors in literary and informational text and explain what two things are being compared and what meaning is conveyed.",
        ccss_codes: ["L.4.5a", "L.5.5a", "RL.4.4", "RL.5.4"],
        rit_band: "192-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.II.2 Metaphors (Grade 4)", "5.II.2 Metaphors (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Arabic poetry has a rich metaphor tradition (تشبيه بليغ); surface this parallel using a translated literary example before introducing English metaphors. Focus on identifying what two things are compared.",
        sped_scaffold: "Use a 'Metaphor Frame': '_____ IS _____ because ____.' Two-panel visual anchor: object A | object B and what they share. Limit to one metaphor per session in early instruction.",
        prerequisite_skill_ids: ["reading_vocab_figurative_simile_metaphor"],
        next_skill_ids: ["reading_vocab_figurative_personification"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 192-207 — figurative language, metaphor",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "two-button-binary", "tap-hotspot"]
    },

    // -----------------------------------------------------------------------
    // FIGURATIVE LANGUAGE — PERSONIFICATION
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_figurative_personification",
        subject: "reading",
        strand: "vocabulary",
        domain: "figurative_language",
        sub_domain: "personification",
        developmental_band: "4-5+",
        skill_statement: "Identify personification in literary texts and explain how giving human traits to non-human subjects creates imagery and conveys meaning.",
        ccss_codes: ["L.4.5a", "L.5.5a", "RL.4.4"],
        rit_band: "192-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.II.4 Personification (Grade 4)", "5.II.4 Personification (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Personification exists in Arabic poetry and classical prose; surface familiar examples (e.g., 'the sea roared angrily'). Use picture illustrations of personified objects to build visual schema.",
        sped_scaffold: "Anchor chart: 'Personification = giving human traits to non-human things.' Two-column sort: human trait / non-human subject. Visual examples from picture books.",
        prerequisite_skill_ids: ["reading_vocab_figurative_metaphor"],
        next_skill_ids: ["reading_vocab_figurative_hyperbole"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 192-207 — figurative language, personification",
        question_types: ["mc-text", "fib-auto", "dnd-linked", "two-button-binary", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // FIGURATIVE LANGUAGE — HYPERBOLE
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_figurative_hyperbole",
        subject: "reading",
        strand: "vocabulary",
        domain: "figurative_language",
        sub_domain: "hyperbole",
        developmental_band: "4-5+",
        skill_statement: "Identify and interpret hyperbole (extreme exaggeration for effect) in literary and everyday language (e.g., 'I've told you a million times') and explain its intended meaning and effect on tone.",
        ccss_codes: ["L.4.5a", "L.5.5a"],
        rit_band: "193-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.II.5 Hyperbole (Grade 4)", "5.II.5 Hyperbole (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Arabic has a strong exaggeration tradition in storytelling; surface familiar examples. Focus on 'What is really meant?' vs. the literal interpretation to build understanding.",
        sped_scaffold: "Use a 'Hyperbole Decoder' routine: (1) Is this literally true? No → (2) Why did the author exaggerate? → (3) What feeling does it create? Anchor examples on a class poster.",
        prerequisite_skill_ids: ["reading_vocab_figurative_personification"],
        next_skill_ids: ["reading_vocab_figurative_alliteration"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 193-207 — figurative language, hyperbole",
        question_types: ["mc-text", "fib-auto", "two-button-binary", "dnd-linked", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // FIGURATIVE LANGUAGE — ALLITERATION
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_figurative_alliteration",
        subject: "reading",
        strand: "vocabulary",
        domain: "figurative_language",
        sub_domain: "alliteration",
        developmental_band: "2-3",
        skill_statement: "Identify alliteration (repetition of the same initial consonant sound in nearby words) in poetry and prose and explain the effect it creates.",
        ccss_codes: ["L.2.5a", "L.3.5a", "RL.4.4"],
        rit_band: "175-193",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["3.II.6 Alliteration (Grade 3)", "4.II.6 Alliteration (Grade 4)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Arabic poetry uses alliteration (السجع); surface parallel with familiar examples. Practice identifying the repeated initial sound before attempting to interpret effect.",
        sped_scaffold: "Tap or clap on the repeated initial sound; highlight alliterating words in the same color. Create personal alliteration phrases using student names.",
        prerequisite_skill_ids: ["reading_vocab_figurative_simile_metaphor"],
        next_skill_ids: ["reading_vocab_figurative_onomatopoeia"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 175-193 — sound devices, alliteration",
        question_types: ["mc-text", "fib-auto", "tap-hotspot", "two-button-binary", "dnd-linked"]
    },

    // -----------------------------------------------------------------------
    // FIGURATIVE LANGUAGE — ONOMATOPOEIA
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_figurative_onomatopoeia",
        subject: "reading",
        strand: "vocabulary",
        domain: "figurative_language",
        sub_domain: "onomatopoeia",
        developmental_band: "2-3",
        skill_statement: "Identify onomatopoeia (words that imitate the sounds they describe: buzz, crash, sizzle, whisper, gurgle) and explain how sound words create imagery in text.",
        ccss_codes: ["L.2.5a", "L.3.5a", "RL.3.4"],
        rit_band: "170-188",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["3.II.7 Onomatopoeia (Grade 3)", "2.II.7 Onomatopoeia (Grade 2)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Arabic has onomatopoeic words too (طق طق = knock knock, شق = ripping sound); use L1 examples first, then map to English equivalents. Audio playback of real sounds enhances learning.",
        sped_scaffold: "Match sound word cards to sound recordings or pictures. Use kinesthetic response (mime the sound's action) before identification tasks.",
        prerequisite_skill_ids: ["reading_vocab_figurative_alliteration"],
        next_skill_ids: ["reading_vocab_figurative_idioms"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 170-188 — sound devices, onomatopoeia",
        question_types: ["mc-audio", "mc-text", "mc-image", "tap-hotspot", "dnd-linked"]
    },

    // -----------------------------------------------------------------------
    // FIGURATIVE LANGUAGE — PROVERBS / ADAGES
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_figurative_proverbs_adages",
        subject: "reading",
        strand: "vocabulary",
        domain: "figurative_language",
        sub_domain: "proverbs_adages",
        developmental_band: "4-5+",
        skill_statement: "Interpret the meaning of common proverbs and adages (e.g., 'Don't judge a book by its cover,' 'Actions speak louder than words,' 'The early bird catches the worm') and explain the life lesson each conveys.",
        ccss_codes: ["L.4.5b", "L.5.5b"],
        rit_band: "195-210",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["4.II.3 Proverbs (Grade 4)", "5.II.3 Proverbs (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Arabic has an exceptionally rich proverb tradition (أمثال عربية); pair each English proverb with its closest Arabic equivalent or the underlying concept in L1. This activates strong cultural schema.",
        sped_scaffold: "Use an 'Adage Decoder' two-step: (1) What does it say literally? (2) What life lesson does it mean? Illustrate each proverb with a cartoon or scene.",
        prerequisite_skill_ids: ["reading_vocab_figurative_idioms"],
        next_skill_ids: [],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 195-210 — figurative language, proverbs and adages",
        question_types: ["mc-text", "match-pairs", "fib-auto", "dnd-linked", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // DICTIONARY SKILLS — ALPHABETICAL ORDER
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_dictionary_alphabetical_order",
        subject: "reading",
        strand: "vocabulary",
        domain: "reference_skills",
        sub_domain: "alphabetical_order",
        developmental_band: "K-1",
        skill_statement: "Arrange words in alphabetical order by first, second, and third letters; use guide words to locate entries in a dictionary or glossary.",
        ccss_codes: ["L.K.2e", "L.1.4c", "L.2.4e", "L.3.4d"],
        rit_band: "155-178",
        rit_test: "Reading K-2",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["1.GG.5 Alphabetical order (Grade 1)", "2.GG.5 Alphabetical order to the second and third letter (Grade 2)", "3.GG.5 Use guide words (Grade 3)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Arabic alphabet order differs from English; explicitly teach English alphabetical order as a separate skill. Use visual alphabet strip as a persistent reference during practice.",
        sped_scaffold: "Provide a printed alphabet strip for reference. Sort 3-word groups before moving to 5-word groups. Color-code the deciding letter when alphabetizing to the 2nd/3rd letter.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_vocab_dictionary_pronunciation_guide"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 155-178 — reference skills, alphabetical order",
        question_types: ["dnd-linked", "mc-text", "fib-auto", "tap-hotspot", "sort-into-bins"]
    },

    // -----------------------------------------------------------------------
    // DICTIONARY SKILLS — PRONUNCIATION GUIDE
    // -----------------------------------------------------------------------
    {
        skill_id: "reading_vocab_dictionary_pronunciation_guide",
        subject: "reading",
        strand: "vocabulary",
        domain: "reference_skills",
        sub_domain: "pronunciation_guide_dictionary",
        developmental_band: "2-3",
        skill_statement: "Use a dictionary pronunciation key and respelling guide to decode the pronunciation of unfamiliar words; identify the accented syllable from the dictionary entry.",
        ccss_codes: ["L.3.4d", "L.4.4c", "L.5.4c"],
        rit_band: "183-198",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Vocabulary",
        ixl_skills: ["3.GG.5 Use guide words (Grade 3)", "4.GG.7 Use a dictionary entry (Grade 4)", "5.GG.6 Use a dictionary entry (Grade 5)"],
        sor_citations: SoR_VOCAB,
        ell_scaffold: "Arabic has a standardized diacritical marking system (tashkeel) that serves a similar function to pronunciation keys; surface this parallel. Audio support is especially valuable for ELL students decoding English pronunciation symbols.",
        sped_scaffold: "Provide a pronunciation key reference card. Focus on identifying the stressed syllable first (capital or bold) before attempting phonetic respelling. Use text-to-speech to verify pronunciation guesses.",
        prerequisite_skill_ids: ["reading_vocab_dictionary_alphabetical_order"],
        next_skill_ids: ["reading_vocab_context_clues_inference"],
        mastery_criteria: MASTERY_STD,
        diagnostic_anchor: "NWEA Learning Continuum: Vocabulary RIT 183-198 — reference skills, dictionary pronunciation key",
        question_types: ["mc-text", "fib-auto", "mc-audio", "tap-hotspot", "dnd-linked"]
    }

];

export default vocabularyAtoms;
