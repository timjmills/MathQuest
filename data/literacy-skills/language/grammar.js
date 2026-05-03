/**
 * Literacy Quest — Language / Grammar skill atoms (Part 6)
 * Strands: common/proper nouns, pronoun-antecedent, verb tense,
 *          subject-verb agreement, adjective order, adverbs,
 *          prepositions, conjunctions FANBOYS
 * @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]}
 */

/** @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]} */
const grammarAtoms = [

    {
        skill_id: "language_grammar_common_proper_noun",
        subject: "language",
        strand: "grammar",
        domain: "nouns",
        sub_domain: "common_vs_proper",
        developmental_band: "K-1",
        skill_statement: "Distinguish common nouns from proper nouns and capitalize proper nouns (names of people, places, holidays, and products).",
        ccss_codes: ["L.1.1b", "L.2.1a"],
        rit_band: "163-180",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["1.A.1 Identify common and proper nouns (Grade 1)", "2.A.1 Capitalize proper nouns (Grade 2)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Unit 5: Getting Up to Speed: Developing Fluency. Sopris Learning."
        ],
        ell_scaffold: "In Arabic, proper nouns carry the definite article differently; explicitly contrast English capitalization rules with Arabic conventions.",
        sped_scaffold: "Create a 'Proper Noun Passport' — students collect examples of each category (name, city, holiday) in a personal reference booklet.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["language_grammar_pronoun_antecedent", "language_grammar_subject_verb_agreement"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 163-180 — nouns, including proper nouns",
        question_types: ["two-button-binary", "tap-hotspot", "sort-into-bins", "hot-text-word", "fib-auto"]
    },

    {
        skill_id: "language_grammar_pronoun_antecedent",
        subject: "language",
        strand: "grammar",
        domain: "pronouns",
        sub_domain: "pronoun_antecedent_agreement",
        developmental_band: "2-3",
        skill_statement: "Match pronouns to their correct antecedents in a sentence; ensure pronoun-antecedent agreement in number and gender.",
        ccss_codes: ["L.2.1c", "L.3.1f", "L.4.1d"],
        rit_band: "178-195",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.A.5 Identify pronouns and antecedents (Grade 2)", "3.A.5 Pronoun-antecedent agreement (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Arabic uses grammatical gender differently; explicitly teach English he/she/it/they distinctions with picture support and sentence examples.",
        sped_scaffold: "Use an 'antecedent arrow' technique — draw an arrow from the pronoun back to its antecedent to visualize the connection.",
        prerequisite_skill_ids: ["language_grammar_common_proper_noun"],
        next_skill_ids: ["language_grammar_subject_verb_agreement"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 178-195 — pronoun usage and antecedents",
        question_types: ["drop-down-inline", "mc-text", "tap-hotspot", "fib-auto", "hot-text-word"]
    },

    {
        skill_id: "language_grammar_verb_tense_regular",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "regular_verb_tense",
        developmental_band: "2-3",
        skill_statement: "Use and identify regular past, present, and future verb tenses correctly in written and oral sentences.",
        ccss_codes: ["L.1.1e", "L.2.1d", "L.3.1e"],
        rit_band: "175-192",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.B.1 Identify verb tense (Grade 2)", "3.B.1 Use correct verb tense (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Arabic verb morphology is root-based and complex; use timeline visuals (past–present–future arrow) alongside tense labels to build conceptual anchor.",
        sped_scaffold: "Use a verb conjugation anchor chart; have students tap the timeline to indicate which tense they need before writing.",
        prerequisite_skill_ids: ["language_grammar_common_proper_noun"],
        next_skill_ids: ["language_grammar_verb_tense_irregular", "language_grammar_subject_verb_agreement"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 175-192 — verb tense",
        question_types: ["drop-down-inline", "sort-into-bins", "mc-text", "fib-auto", "hot-text-word"]
    },

    {
        skill_id: "language_grammar_verb_tense_irregular",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "irregular_verb_tense",
        developmental_band: "2-3",
        skill_statement: "Use and identify common irregular past-tense verbs (e.g., went, saw, ran, knew, brought, caught, thought, chose) correctly in sentences.",
        ccss_codes: ["L.2.1d", "L.3.1d", "L.4.1b"],
        rit_band: "180-198",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.B.2 Irregular verb forms (Grade 2)", "3.B.2 Use irregular past-tense verbs (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Provide a bilingual irregular verb chart; emphasize that unlike Arabic, English irregular verbs have no predictable pattern and must be memorized.",
        sped_scaffold: "Use spaced repetition flashcard pairs (present → past); limit to 5 irregular verbs per week with sentence-level practice.",
        prerequisite_skill_ids: ["language_grammar_verb_tense_regular"],
        next_skill_ids: ["language_grammar_subject_verb_agreement"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 180-198 — irregular verb forms",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "sort-into-bins", "mc-multi-select"]
    },

    {
        skill_id: "language_grammar_subject_verb_agreement",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "subject_verb_agreement",
        developmental_band: "2-3",
        skill_statement: "Ensure subjects and verbs agree in number (singular subject → singular verb; plural subject → plural verb) in simple and compound sentences.",
        ccss_codes: ["L.1.1c", "L.2.1f", "L.3.1f"],
        rit_band: "178-195",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.A.6 Subject-verb agreement (Grade 2)", "3.A.6 Use correct subject-verb agreement (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Subject-verb agreement works differently in Arabic; use color-coding (red = subject, blue = verb) and explicitly count singular vs. plural before choosing verb form.",
        sped_scaffold: "Use a 'circle the subject, pick the verb' 2-step routine; provide sentence frames with the subject already filled in.",
        prerequisite_skill_ids: ["language_grammar_verb_tense_regular", "language_grammar_common_proper_noun"],
        next_skill_ids: ["language_grammar_conjunctions_fanboys", "language_grammar_adverbs"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 178-195 — subject-verb agreement",
        question_types: ["drop-down-inline", "two-button-binary", "mc-text", "fib-auto", "word-tagger"]
    },

    {
        skill_id: "language_grammar_adjectives_osascomp",
        subject: "language",
        strand: "grammar",
        domain: "adjectives",
        sub_domain: "adjective_order_osascomp",
        developmental_band: "4-5+",
        skill_statement: "Order multiple adjectives before a noun using the OSASCOMP sequence (Opinion-Size-Age-Shape-Color-Origin-Material-Purpose) and recognize when the order sounds natural or awkward.",
        ccss_codes: ["L.4.1d"],
        rit_band: "198-210",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.A.7 Order adjectives (Grade 4)", "5.A.7 Use correct adjective order (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Arabic adjective order differs from English; use the OSASCOMP mnemonic card as a desk reference and practice with familiar noun phrases first.",
        sped_scaffold: "Teach one OSASCOMP category per lesson before combining; use color-coded tiles, one color per category.",
        prerequisite_skill_ids: ["language_grammar_adverbs"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 198-210 — adjective order",
        question_types: ["mc-text", "sentence-build", "two-button-binary", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_adverbs",
        subject: "language",
        strand: "grammar",
        domain: "adverbs",
        sub_domain: "adverb_identification",
        developmental_band: "4-5+",
        skill_statement: "Identify adverbs and distinguish them from adjectives; recognize adverbs of time, place, and manner in context.",
        ccss_codes: ["L.3.1a", "L.4.1a", "L.5.1a"],
        rit_band: "190-205",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.A.8 Identify adverbs (Grade 3)", "4.A.8 Adverbs and adjectives (Grade 4)", "5.A.8 Use adverbs correctly (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Arabic adverbs function differently from English -ly forms; use 'How? When? Where?' questions to identify adverbs in English sentences.",
        sped_scaffold: "Teach a single adverb type per session (manner, then time, then place); use sentence expansion: 'She ran ___ (how?)' → 'She ran quickly.'",
        prerequisite_skill_ids: ["language_grammar_subject_verb_agreement"],
        next_skill_ids: ["language_grammar_adjectives_osascomp", "language_grammar_prepositions"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 190-205 — adverbs and adjectives",
        question_types: ["tap-hotspot", "sort-into-bins", "mc-text", "word-tagger", "drop-down-inline"]
    },

    {
        skill_id: "language_grammar_prepositions",
        subject: "language",
        strand: "grammar",
        domain: "prepositions",
        sub_domain: "preposition_prepositional_phrase",
        developmental_band: "4-5+",
        skill_statement: "Identify prepositions and prepositional phrases in sentences and use them correctly to convey location, time, and direction.",
        ccss_codes: ["L.3.1e", "L.4.1e", "L.5.1a"],
        rit_band: "190-205",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.A.9 Identify prepositions (Grade 3)", "4.A.9 Prepositional phrases (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Arabic prepositions do not map 1:1 onto English; use spatial diagrams and manipulatives (cube under/over/beside a table) before abstract sentence work.",
        sped_scaffold: "Teach a core list of 10 high-frequency prepositions using movement activities (stand beside, walk around, sit under the table).",
        prerequisite_skill_ids: ["language_grammar_adverbs"],
        next_skill_ids: ["language_grammar_conjunctions_fanboys"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 190-205 — prepositions and prepositional phrases",
        question_types: ["tap-hotspot", "mc-text", "word-tagger", "hot-text-word", "fib-auto"]
    },

    {
        skill_id: "language_grammar_conjunctions_fanboys",
        subject: "language",
        strand: "grammar",
        domain: "conjunctions",
        sub_domain: "coordinating_conjunctions_fanboys",
        developmental_band: "4-5+",
        skill_statement: "Use the seven coordinating conjunctions (for, and, nor, but, or, yet, so — FANBOYS) correctly to join words, phrases, or independent clauses.",
        ccss_codes: ["L.3.1h", "L.4.2c", "L.5.2c"],
        rit_band: "188-203",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.A.10 Coordinating conjunctions (Grade 3)", "4.A.10 Use FANBOYS conjunctions (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Arabic coordination uses wa- (and) and a few others; explicitly teach each FANBOYS meaning and function with translated examples and connective visuals.",
        sped_scaffold: "Use the FANBOYS acronym mnemonic card; color-code each conjunction by function (addition, contrast, result) on a reference chart.",
        prerequisite_skill_ids: ["language_grammar_subject_verb_agreement", "language_grammar_prepositions"],
        next_skill_ids: ["language_sentence_fragment_vs_sentence", "language_sentence_combining"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 188-203 — conjunctions in compound sentences",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "sentence-build", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_plural_irregular_nouns",
        subject: "language",
        strand: "grammar",
        domain: "nouns",
        sub_domain: "irregular_plurals",
        developmental_band: "2-3",
        skill_statement: "Form and use irregular plural nouns correctly (e.g., mice, children, geese, teeth, feet, oxen, sheep) in spoken and written sentences.",
        ccss_codes: ["L.1.1c", "L.2.1b", "L.3.1b"],
        rit_band: "168-185",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["1.A.3 Irregular plurals (Grade 1)", "2.A.3 Form and use irregular plurals (Grade 2)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Arabic plurals are also often irregular (broken plurals); frame irregular English plurals as a similar phenomenon to reduce anxiety.",
        sped_scaffold: "Use a personal 'Irregular Plural Booklet' with word + image + plural form; add new entries weekly.",
        prerequisite_skill_ids: ["language_grammar_common_proper_noun"],
        next_skill_ids: ["language_grammar_verb_tense_irregular"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 168-185 — irregular plural nouns",
        question_types: ["mc-text", "fib-auto", "sort-into-bins", "match-pairs", "two-button-binary"]
    },

    {
        skill_id: "language_grammar_parts_of_speech_mixed",
        subject: "language",
        strand: "grammar",
        domain: "parts_of_speech",
        sub_domain: "mixed_pos_identification",
        developmental_band: "4-5+",
        skill_statement: "Identify all major parts of speech (noun, pronoun, verb, adjective, adverb, preposition, conjunction, interjection) within sentences of increasing complexity.",
        ccss_codes: ["L.3.1a", "L.4.1a", "L.5.1a"],
        rit_band: "195-210",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.A.12 Parts of speech (Grade 3)", "4.A.12 Mixed parts of speech (Grade 4)", "5.A.12 Identify parts of speech (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Use the Grammar Detective color system: each POS has a consistent color across all materials; build up from 3 categories to 8 over time.",
        sped_scaffold: "Provide a POS reference card at all times; begin mixed-POS tasks only after individual POS skills are at mastery.",
        prerequisite_skill_ids: ["language_grammar_adverbs", "language_grammar_prepositions", "language_grammar_conjunctions_fanboys"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 195-210 — identifying all parts of speech",
        question_types: ["word-tagger", "mc-multi-select", "hot-text-word", "sort-into-bins", "drop-down-inline"]
    }

];

export default grammarAtoms;
