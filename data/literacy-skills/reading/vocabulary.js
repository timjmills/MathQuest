/**
 * Literacy Quest — Reading / Vocabulary skill atoms (Part 4)
 * Strands: Tier 2 academic words, synonyms/antonyms, context clues,
 *          prefix/suffix/root, multiple-meaning, figurative language
 * @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]}
 */

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
    }

];

export default vocabularyAtoms;
