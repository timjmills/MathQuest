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
    },

    // ─── NOUNS (expanded) ────────────────────────────────────────────────────

    {
        skill_id: "language_grammar_common_noun",
        subject: "language",
        strand: "grammar",
        domain: "nouns",
        sub_domain: "common_noun_basic",
        developmental_band: "K-1",
        skill_statement: "Identify common nouns as words that name any person, place, animal, or thing.",
        ccss_codes: ["L.K.1b", "L.1.1b"],
        rit_band: "151-165",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["K.A.1 Identify nouns (Kindergarten)", "1.A.1 Identify common nouns (Grade 1)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass."
        ],
        ell_scaffold: "Arabic nouns carry grammatical gender; contrast with English where common nouns are gender-neutral. Provide picture cards: person (boy/girl), place (school), thing (book).",
        sped_scaffold: "Use a 4-square anchor chart: Person / Place / Animal / Thing. Students sort picture cards into squares before moving to print.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["language_grammar_common_proper_noun", "language_grammar_plural_irregular_nouns"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 151-165 — noun identification",
        question_types: ["two-button-binary", "tap-hotspot", "sort-into-bins", "mc-text", "hot-text-word"]
    },

    {
        skill_id: "language_grammar_concrete_vs_abstract_noun",
        subject: "language",
        strand: "grammar",
        domain: "nouns",
        sub_domain: "concrete_vs_abstract",
        developmental_band: "3-4",
        skill_statement: "Distinguish concrete nouns (things you can sense) from abstract nouns (ideas, feelings, qualities such as freedom, love, bravery).",
        ccss_codes: ["L.3.1b", "L.4.1a"],
        rit_band: "185-200",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.A.2 Identify abstract nouns (Grade 3)", "4.A.2 Concrete and abstract nouns (Grade 4)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning.",
            "Reed, D. K. (2012). Why Teach Spelling? Center on Instruction."
        ],
        ell_scaffold: "Abstract nouns may lack direct Arabic equivalents; use sentence frames — 'Courage means ___' — before asking students to classify independently.",
        sped_scaffold: "Anchor abstract nouns to a personal emotion chart (happy = joy, scared = fear); expand one abstract noun per lesson.",
        prerequisite_skill_ids: ["language_grammar_common_noun"],
        next_skill_ids: ["language_grammar_collective_noun", "language_grammar_noun_phrase"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 185-200 — abstract nouns",
        question_types: ["two-button-binary", "sort-into-bins", "tap-hotspot", "mc-text", "fib-auto"]
    },

    {
        skill_id: "language_grammar_collective_noun",
        subject: "language",
        strand: "grammar",
        domain: "nouns",
        sub_domain: "collective_nouns",
        developmental_band: "4-5+",
        skill_statement: "Identify and use collective nouns (e.g., flock, team, herd, choir, jury) that name a group as a single unit.",
        ccss_codes: ["L.2.1a", "L.4.1a"],
        rit_band: "190-205",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.A.3 Collective nouns (Grade 4)", "5.A.3 Use collective nouns (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic uses plural forms for groups; explain that English uses special single words (flock, team) that act as singular nouns even though they name many.",
        sped_scaffold: "Create a visual 'Collective Noun Zoo': a chart matching animal groups (flock of birds, pride of lions) with illustrations.",
        prerequisite_skill_ids: ["language_grammar_common_noun", "language_grammar_subject_verb_agreement"],
        next_skill_ids: ["language_grammar_compound_noun", "language_grammar_possessive_noun_singular"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 190-205 — collective nouns",
        question_types: ["mc-text", "drop-down-inline", "sort-into-bins", "match-pairs", "fib-auto"]
    },

    {
        skill_id: "language_grammar_compound_noun",
        subject: "language",
        strand: "grammar",
        domain: "nouns",
        sub_domain: "compound_nouns",
        developmental_band: "3-4",
        skill_statement: "Identify and form compound nouns (closed: notebook, hyphenated: well-being, open: post office) and use them correctly in sentences.",
        ccss_codes: ["L.3.1a", "L.4.1a"],
        rit_band: "185-198",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.A.4 Compound nouns (Grade 3)", "4.A.4 Form compound nouns (Grade 4)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning.",
            "Reed, D. K. (2012). Why Teach Spelling? Center on Instruction."
        ],
        ell_scaffold: "Arabic compound concepts often require separate words; model English compound nouns with word-part cards students physically combine.",
        sped_scaffold: "Use split word cards (sun + flower = sunflower); students slide them together and read aloud before writing.",
        prerequisite_skill_ids: ["language_grammar_common_noun"],
        next_skill_ids: ["language_grammar_countable_vs_uncountable", "language_grammar_noun_phrase"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 185-198 — compound nouns",
        question_types: ["match-pairs", "fib-auto", "mc-text", "sort-into-bins", "two-button-binary"]
    },

    {
        skill_id: "language_grammar_countable_vs_uncountable",
        subject: "language",
        strand: "grammar",
        domain: "nouns",
        sub_domain: "countable_uncountable",
        developmental_band: "3-4",
        skill_statement: "Distinguish countable nouns (one apple, two apples) from uncountable nouns (water, information, furniture) and use appropriate quantifiers (much/many, a few/a little).",
        ccss_codes: ["L.3.1a", "L.4.1a"],
        rit_band: "188-202",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.A.5 Count nouns and mass nouns (Grade 3)", "4.A.5 Countable and uncountable nouns (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic mass nouns work differently; use visual quantity strips (you can count chairs; you cannot count sand) and practice with realia before print tasks.",
        sped_scaffold: "Create a T-chart with real objects: items students can count on one side, substances they cannot on the other. Then transfer to words.",
        prerequisite_skill_ids: ["language_grammar_common_noun", "language_grammar_plural_irregular_nouns"],
        next_skill_ids: ["language_grammar_possessive_noun_singular"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 188-202 — countable vs. uncountable nouns",
        question_types: ["two-button-binary", "sort-into-bins", "drop-down-inline", "mc-text", "fib-auto"]
    },

    {
        skill_id: "language_grammar_possessive_noun_singular",
        subject: "language",
        strand: "grammar",
        domain: "nouns",
        sub_domain: "possessive_noun_singular",
        developmental_band: "2-3",
        skill_statement: "Form and use singular possessive nouns by adding apostrophe + s (the dog's collar, Maria's backpack).",
        ccss_codes: ["L.2.1c", "L.3.1a"],
        rit_band: "175-192",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.A.7 Singular possessives (Grade 2)", "3.A.7 Form singular possessives (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic uses an iḍāfa construction (bag of the teacher) rather than apostrophe-s; draw both structures side by side and highlight the English shorthand.",
        sped_scaffold: "Teach apostrophe placement as 'the owner gets the apostrophe first, then s'; use a physical apostrophe token students place on a word card.",
        prerequisite_skill_ids: ["language_grammar_common_proper_noun", "language_grammar_common_noun"],
        next_skill_ids: ["language_grammar_possessive_noun_plural"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 175-192 — singular possessives",
        question_types: ["fib-auto", "mc-text", "hot-text-word", "drop-down-inline", "two-button-binary"]
    },

    {
        skill_id: "language_grammar_possessive_noun_plural",
        subject: "language",
        strand: "grammar",
        domain: "nouns",
        sub_domain: "possessive_noun_plural",
        developmental_band: "3-4",
        skill_statement: "Form and use plural possessive nouns: add only apostrophe after plural ending in s (the dogs' collars); add apostrophe + s after irregular plurals (the children's books).",
        ccss_codes: ["L.3.1a", "L.4.1a"],
        rit_band: "185-200",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.A.8 Plural possessives (Grade 3)", "4.A.8 Form plural possessives (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Explicitly contrast singular possessive (dog's) and plural possessive (dogs') using a minimal-pair chart; Arabic learners may need extra practice with the apostrophe position rule.",
        sped_scaffold: "Use a 2-step decision tree: Step 1 — Is it one or more than one? Step 2 — Does the plural end in -s? (→ apostrophe only) or is it irregular? (→ apostrophe + s).",
        prerequisite_skill_ids: ["language_grammar_possessive_noun_singular", "language_grammar_plural_irregular_nouns"],
        next_skill_ids: ["language_grammar_noun_phrase"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 185-200 — plural possessives",
        question_types: ["mc-text", "fib-auto", "drop-down-inline", "two-button-binary", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_noun_phrase",
        subject: "language",
        strand: "grammar",
        domain: "nouns",
        sub_domain: "noun_phrase",
        developmental_band: "3-4",
        skill_statement: "Identify and expand noun phrases (determiner + optional adjective(s) + noun) and use them as subjects or objects in sentences.",
        ccss_codes: ["L.3.1a", "L.4.1a", "L.5.1a"],
        rit_band: "188-203",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.A.9 Noun phrases (Grade 3)", "4.A.9 Identify noun phrases (Grade 4)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass."
        ],
        ell_scaffold: "Model noun phrase expansion on a sentence frame: 'the ___ (adj) ___ (noun)'; Arabic word order places adjective after noun — explicitly contrast English order.",
        sped_scaffold: "Use sentence-expansion strips: start with a bare noun (dog), add determiner (the dog), then adjective (the big dog); students physically add tokens.",
        prerequisite_skill_ids: ["language_grammar_common_noun", "language_grammar_adjectives_osascomp"],
        next_skill_ids: ["language_grammar_parts_of_speech_mixed"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 188-203 — noun phrases",
        question_types: ["tap-hotspot", "sentence-build", "fib-auto", "mc-text", "hot-text-word"]
    },

    // ─── PRONOUNS (expanded) ─────────────────────────────────────────────────

    {
        skill_id: "language_grammar_subject_pronoun",
        subject: "language",
        strand: "grammar",
        domain: "pronouns",
        sub_domain: "subject_pronouns",
        developmental_band: "K-1",
        skill_statement: "Identify and use subject pronouns (I, you, he, she, it, we, they) as the subject of a sentence.",
        ccss_codes: ["L.K.1d", "L.1.1d"],
        rit_band: "155-172",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["K.A.2 Subject pronouns (Kindergarten)", "1.A.4 Use subject pronouns (Grade 1)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic gender-agreement on pronouns differs; use a pronoun chart with photos (boy → he, girl → she, group → they) and practice substitution drills before writing.",
        sped_scaffold: "Create a pronoun reference mat with cartoon faces for each pronoun; students point to the correct face before writing the pronoun.",
        prerequisite_skill_ids: ["language_grammar_common_noun"],
        next_skill_ids: ["language_grammar_object_pronoun", "language_grammar_pronoun_antecedent"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 155-172 — subject pronouns",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "two-button-binary", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_object_pronoun",
        subject: "language",
        strand: "grammar",
        domain: "pronouns",
        sub_domain: "object_pronouns",
        developmental_band: "1-2",
        skill_statement: "Identify and use object pronouns (me, you, him, her, it, us, them) as the object of a verb or preposition.",
        ccss_codes: ["L.1.1d", "L.2.1c"],
        rit_band: "163-180",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.A.3 Object pronouns (Grade 2)", "3.A.3 Subject and object pronouns (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Use sentence substitution: 'She gave the book to Maria → She gave the book to ___.' Contrast subject and object slots using color-coded sentence frames.",
        sped_scaffold: "Create two columns on an anchor chart: 'Who does the action (subject)' vs. 'Who receives the action (object)'; practice matching pronouns to each column.",
        prerequisite_skill_ids: ["language_grammar_subject_pronoun"],
        next_skill_ids: ["language_grammar_possessive_pronoun", "language_grammar_pronoun_antecedent"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 163-180 — object pronouns",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "two-button-binary", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_possessive_pronoun",
        subject: "language",
        strand: "grammar",
        domain: "pronouns",
        sub_domain: "possessive_pronouns",
        developmental_band: "2-3",
        skill_statement: "Use possessive pronouns (my, your, his, her, its, our, their; mine, yours, his, hers, ours, theirs) correctly in sentences.",
        ccss_codes: ["L.2.1c", "L.3.1a"],
        rit_band: "170-188",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.A.4 Possessive pronouns (Grade 2)", "3.A.4 Use possessive pronouns (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Distinguish possessive adjectives (my book) from possessive pronouns (the book is mine); Arabic uses suffixed forms — contrast explicitly with a side-by-side chart.",
        sped_scaffold: "Limit to six core possessive pronouns per session; use sentence frames 'This is ___ book. The book is ___.' to practice both forms.",
        prerequisite_skill_ids: ["language_grammar_subject_pronoun", "language_grammar_possessive_noun_singular"],
        next_skill_ids: ["language_grammar_reflexive_pronoun", "language_grammar_pronoun_antecedent"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 170-188 — possessive pronouns",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "hot-text-word", "two-button-binary"]
    },

    {
        skill_id: "language_grammar_reflexive_pronoun",
        subject: "language",
        strand: "grammar",
        domain: "pronouns",
        sub_domain: "reflexive_pronouns",
        developmental_band: "3-4",
        skill_statement: "Identify and use reflexive pronouns (myself, yourself, himself, herself, itself, ourselves, yourselves, themselves) for emphasis or when subject and object are the same.",
        ccss_codes: ["L.3.1a", "L.4.1a"],
        rit_band: "185-200",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.A.6 Reflexive pronouns (Grade 3)", "4.A.6 Use reflexive pronouns (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Reflexive pronouns in Arabic are formed differently (nafsi/nafsahu); use mirror diagrams showing the subject doing something to themselves to build meaning.",
        sped_scaffold: "Pair each reflexive pronoun with its base pronoun on a card (I → myself, he → himself); practice matching before sentence-level tasks.",
        prerequisite_skill_ids: ["language_grammar_subject_pronoun", "language_grammar_object_pronoun"],
        next_skill_ids: ["language_grammar_demonstrative_pronoun"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 185-200 — reflexive pronouns",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "two-button-binary", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_demonstrative_pronoun",
        subject: "language",
        strand: "grammar",
        domain: "pronouns",
        sub_domain: "demonstrative_pronouns",
        developmental_band: "2-3",
        skill_statement: "Use demonstrative pronouns (this, that, these, those) to point to specific nouns and distinguish near vs. far references.",
        ccss_codes: ["L.1.1d", "L.2.1c"],
        rit_band: "168-185",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.A.8 Demonstrative pronouns (Grade 2)", "3.A.8 This, that, these, those (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic demonstratives vary by gender and number in more complex ways; focus on the singular/plural and near/far dimensions using physical pointing activities in the classroom.",
        sped_scaffold: "Use near/far pointers: hold up a pencil (this pencil), point across the room (that pencil); students practice the four forms before any print work.",
        prerequisite_skill_ids: ["language_grammar_subject_pronoun"],
        next_skill_ids: ["language_grammar_interrogative_pronoun"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 168-185 — demonstrative pronouns",
        question_types: ["mc-text", "drop-down-inline", "two-button-binary", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_interrogative_pronoun",
        subject: "language",
        strand: "grammar",
        domain: "pronouns",
        sub_domain: "interrogative_pronouns",
        developmental_band: "3-4",
        skill_statement: "Identify and use interrogative pronouns (who, whom, what, which, whose) to form and answer questions.",
        ccss_codes: ["L.3.1a", "L.4.1a"],
        rit_band: "182-197",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.A.9 Interrogative pronouns (Grade 3)", "4.A.9 Who vs. whom (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic question words (man = who, matha = what) map imperfectly; explicitly teach each English interrogative pronoun with a question stem and model sentence before practice.",
        sped_scaffold: "Create a question-word anchor chart with colored cue cards; who = person, what = thing, which = choice, whose = possession. Drill before sentence practice.",
        prerequisite_skill_ids: ["language_grammar_subject_pronoun", "language_grammar_pronoun_antecedent"],
        next_skill_ids: ["language_grammar_indefinite_pronoun"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 182-197 — interrogative pronouns",
        question_types: ["mc-text", "drop-down-inline", "fib-auto", "two-button-binary", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_indefinite_pronoun",
        subject: "language",
        strand: "grammar",
        domain: "pronouns",
        sub_domain: "indefinite_pronouns",
        developmental_band: "4-5+",
        skill_statement: "Identify and use indefinite pronouns (everyone, anyone, someone, no one, each, either, neither, all, both, few, many, most, none, some) with correct verb agreement.",
        ccss_codes: ["L.4.1a", "L.5.1a"],
        rit_band: "193-208",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.A.10 Indefinite pronouns (Grade 4)", "5.A.10 Indefinite pronouns and subject-verb agreement (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic equivalents often use entire phrases; explicitly sort indefinite pronouns into always-singular (everyone, nobody), always-plural (both, many), and context-dependent (all, some) groups.",
        sped_scaffold: "Provide a color-coded reference card: green = always singular, blue = always plural, yellow = context-dependent. Consult the card before every practice item.",
        prerequisite_skill_ids: ["language_grammar_subject_verb_agreement", "language_grammar_pronoun_antecedent"],
        next_skill_ids: ["language_grammar_vague_pronoun_reference"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 193-208 — indefinite pronouns",
        question_types: ["drop-down-inline", "mc-text", "two-button-binary", "sort-into-bins", "fib-auto"]
    },

    {
        skill_id: "language_grammar_vague_pronoun_reference",
        subject: "language",
        strand: "grammar",
        domain: "pronouns",
        sub_domain: "vague_pronoun_reference",
        developmental_band: "4-5+",
        skill_statement: "Recognize and correct vague or ambiguous pronoun references where the antecedent is unclear (e.g., 'When Jake told Sam he was wrong, he felt bad.').",
        ccss_codes: ["L.5.1d"],
        rit_band: "200-215",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["5.A.11 Vague pronoun reference (Grade 5)", "6.A.5 Correct vague pronoun references (Grade 6)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Use sentence-pair strips to show how replacing pronouns with nouns removes ambiguity; model think-aloud for each vague pronoun before asking students to revise independently.",
        sped_scaffold: "Circle every pronoun, draw an arrow to the claimed antecedent; if two possible antecedents exist, highlight the ambiguity and model revision.",
        prerequisite_skill_ids: ["language_grammar_pronoun_antecedent", "language_grammar_indefinite_pronoun"],
        next_skill_ids: ["language_grammar_pronoun_case_correction"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 200-215 — pronoun reference and ambiguity",
        question_types: ["hot-text-word", "mc-text", "fib-auto", "two-button-binary", "drop-down-inline"]
    },

    {
        skill_id: "language_grammar_pronoun_case_correction",
        subject: "language",
        strand: "grammar",
        domain: "pronouns",
        sub_domain: "pronoun_case",
        developmental_band: "4-5+",
        skill_statement: "Correct pronoun case errors: use subject case in subject position (I, he, she, we, they) and object case in object position (me, him, her, us, them), including in compound structures ('between you and me', not 'between you and I').",
        ccss_codes: ["L.4.1a", "L.5.1a"],
        rit_band: "198-213",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.A.11 Pronoun case (Grade 4)", "5.A.11 Correct pronoun case errors (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Model the 'drop the compound' test: 'He and me went' → 'me went' sounds wrong → use 'He and I went.' Provide printed test prompts students can use independently.",
        sped_scaffold: "Use a two-column anchor chart (subject case / object case) and a three-step checklist: (1) find the pronoun, (2) find its position, (3) match the case column.",
        prerequisite_skill_ids: ["language_grammar_subject_pronoun", "language_grammar_object_pronoun"],
        next_skill_ids: ["language_grammar_vague_pronoun_reference"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 198-213 — pronoun case",
        question_types: ["mc-text", "drop-down-inline", "fib-auto", "two-button-binary", "hot-text-word"]
    },

    // ─── VERBS (expanded) ────────────────────────────────────────────────────

    {
        skill_id: "language_grammar_action_verb_basic",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "action_verbs",
        developmental_band: "K-1",
        skill_statement: "Identify action verbs as words that show what a subject does, did, or will do (run, write, eat, think, dream).",
        ccss_codes: ["L.K.1b", "L.1.1e"],
        rit_band: "153-170",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["K.A.3 Action verbs (Kindergarten)", "1.B.1 Identify action verbs (Grade 1)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass."
        ],
        ell_scaffold: "Arabic root-based verbs may be morphologically opaque in English; use TPR (Total Physical Response) — teacher says a verb, students act it out — before any print identification.",
        sped_scaffold: "Play 'Verb Charades': student acts out a verb while peers identify it; link physical movement to the word before asking for print identification.",
        prerequisite_skill_ids: ["language_grammar_common_noun"],
        next_skill_ids: ["language_grammar_linking_verb", "language_grammar_verb_tense_regular"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 153-170 — action verbs",
        question_types: ["two-button-binary", "tap-hotspot", "sort-into-bins", "mc-text", "hot-text-word"]
    },

    {
        skill_id: "language_grammar_linking_verb",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "linking_verbs",
        developmental_band: "2-3",
        skill_statement: "Identify linking verbs (be, am, is, are, was, were, seem, appear, become, feel, look, smell, sound, taste) that connect the subject to a description or state.",
        ccss_codes: ["L.1.1e", "L.2.1d", "L.3.1a"],
        rit_band: "172-190",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.B.3 Linking verbs (Grade 2)", "3.B.3 Identify linking verbs (Grade 3)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass."
        ],
        ell_scaffold: "Arabic uses no overt copula in present tense (Ahmad student = Ahmad is a student); explicitly teach that English requires 'is/are/was/were' and practice substitution drills.",
        sped_scaffold: "Teach the 'substitute test': replace the verb with 'is/are/was'. If the sentence still makes sense, it is a linking verb. Use a printed cue card with the test.",
        prerequisite_skill_ids: ["language_grammar_action_verb_basic"],
        next_skill_ids: ["language_grammar_helping_verb", "language_grammar_present_tense"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 172-190 — linking verbs",
        question_types: ["two-button-binary", "sort-into-bins", "tap-hotspot", "mc-text", "drop-down-inline"]
    },

    {
        skill_id: "language_grammar_helping_verb",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "helping_verbs",
        developmental_band: "2-3",
        skill_statement: "Identify helping (auxiliary) verbs (have, has, had, do, does, did, will, would, shall, should, may, might, must, can, could) that work with main verbs to form tenses and moods.",
        ccss_codes: ["L.2.1d", "L.3.1a"],
        rit_band: "175-192",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.B.4 Helping verbs (Grade 2)", "3.B.4 Identify helping verbs (Grade 3)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass."
        ],
        ell_scaffold: "English auxiliaries carry tense and modality separately from the main verb, unlike Arabic; use a verb-phrase bracket [helping + main] and color-code them differently.",
        sped_scaffold: "Memorize a short jingle listing the 23 helping verbs; break into three groups across three lessons (be-group, have-group, modals). Use call-and-response.",
        prerequisite_skill_ids: ["language_grammar_action_verb_basic", "language_grammar_linking_verb"],
        next_skill_ids: ["language_grammar_present_tense", "language_grammar_modal_verbs"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 175-192 — helping/auxiliary verbs",
        question_types: ["tap-hotspot", "mc-text", "sort-into-bins", "two-button-binary", "word-tagger"]
    },

    {
        skill_id: "language_grammar_present_tense",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "present_tense",
        developmental_band: "K-1",
        skill_statement: "Use simple present tense verbs to describe actions that happen now or habitually (She walks to school every day).",
        ccss_codes: ["L.K.1e", "L.1.1e"],
        rit_band: "155-172",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["1.B.2 Present tense (Grade 1)", "2.B.5 Simple present tense (Grade 2)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic uses imperfect aspect for habitual actions; use a timeline visual and signal words (every day, usually, always) as anchors before removing them.",
        sped_scaffold: "Use a 'Now' sticky note on a timeline; practice generating sentences about classroom routines before moving to unfamiliar contexts.",
        prerequisite_skill_ids: ["language_grammar_action_verb_basic"],
        next_skill_ids: ["language_grammar_past_tense_regular", "language_grammar_present_progressive"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 155-172 — simple present tense",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "two-button-binary", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_past_tense_regular",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "past_tense_regular",
        developmental_band: "1-2",
        skill_statement: "Form regular past-tense verbs by adding -ed (jumped, walked, played) and use them correctly in sentences.",
        ccss_codes: ["L.1.1e", "L.2.1d"],
        rit_band: "163-180",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["1.B.3 Regular past tense (Grade 1)", "2.B.6 Form regular past-tense verbs (Grade 2)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Teach the three -ed pronunciations (/t/ after voiceless: walked, /d/ after voiced: played, /ɪd/ after t/d: wanted); use minimal-pair listening before production.",
        sped_scaffold: "Use a 'Yesterday' timeline strip; students add -ed tokens to verb cards and place them on the 'Yesterday' side of the strip before writing sentences.",
        prerequisite_skill_ids: ["language_grammar_present_tense"],
        next_skill_ids: ["language_grammar_verb_tense_irregular"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 163-180 — regular past tense",
        question_types: ["fib-auto", "drop-down-inline", "mc-text", "sort-into-bins", "two-button-binary"]
    },

    {
        skill_id: "language_grammar_future_tense",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "future_tense",
        developmental_band: "1-2",
        skill_statement: "Form and use the simple future tense with will + base verb (I will run, She will eat) to describe actions that have not yet happened.",
        ccss_codes: ["L.1.1e", "L.2.1d"],
        rit_band: "163-180",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["1.B.4 Future tense (Grade 1)", "2.B.7 Simple future tense (Grade 2)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic future tense uses a prefix (sa-/sawfa) on the verb; contrast the English 'will + base form' structure visually and practice with future signal words (tomorrow, next week).",
        sped_scaffold: "Use a 'Future' sticky note on a timeline; generate sentences about an upcoming school event before abstract drill items.",
        prerequisite_skill_ids: ["language_grammar_present_tense", "language_grammar_past_tense_regular"],
        next_skill_ids: ["language_grammar_present_progressive"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 163-180 — simple future tense",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "two-button-binary", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_present_progressive",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "present_progressive",
        developmental_band: "2-3",
        skill_statement: "Form and use the present progressive tense (am/is/are + verb-ing) to describe actions happening right now or continuously.",
        ccss_codes: ["L.2.1d", "L.3.1e"],
        rit_band: "170-187",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.B.8 Present progressive (Grade 2)", "3.B.5 Use present progressive (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "The progressive aspect does not exist in classical Arabic; use a video clip with running commentary ('He is jumping right now') to build the right-now concept before print practice.",
        sped_scaffold: "Use picture cards showing someone in the middle of an action; students say the sentence aloud ('She is running') before writing, emphasizing both am/is/are and -ing.",
        prerequisite_skill_ids: ["language_grammar_present_tense", "language_grammar_helping_verb"],
        next_skill_ids: ["language_grammar_past_progressive"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 170-187 — present progressive",
        question_types: ["drop-down-inline", "fib-auto", "mc-text", "two-button-binary", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_past_progressive",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "past_progressive",
        developmental_band: "3-4",
        skill_statement: "Form and use the past progressive tense (was/were + verb-ing) to describe actions that were in progress at a specific moment in the past.",
        ccss_codes: ["L.3.1e", "L.4.1b"],
        rit_band: "180-197",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.B.6 Past progressive (Grade 3)", "4.B.6 Use past progressive (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic uses perfect/imperfect rather than progressive constructions; use a narrative timeline (action in progress ← interrupted action) to build meaning before substitution drills.",
        sped_scaffold: "Connect to a story context: 'What was the character doing when X happened?' Use sentence frames (The boy was ___ when ___) before independent production.",
        prerequisite_skill_ids: ["language_grammar_present_progressive", "language_grammar_verb_tense_regular"],
        next_skill_ids: ["language_grammar_present_perfect"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 180-197 — past progressive",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "two-button-binary", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_present_perfect",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "present_perfect",
        developmental_band: "4-5+",
        skill_statement: "Form and use the present perfect tense (have/has + past participle) to describe actions that began in the past and connect to the present (I have lived here for five years; She has already eaten).",
        ccss_codes: ["L.4.1b", "L.5.1b"],
        rit_band: "193-210",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.B.7 Present perfect (Grade 4)", "5.B.7 Form present perfect (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic has no direct equivalent; use timeline visuals showing the bridge between past and present and signal words (already, just, since, for, ever, never) as meaning anchors.",
        sped_scaffold: "Create a 'past-to-present bridge' graphic organizer; students identify the signal word before determining which form to use.",
        prerequisite_skill_ids: ["language_grammar_past_progressive", "language_grammar_verb_tense_irregular"],
        next_skill_ids: ["language_grammar_past_perfect"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 193-210 — present perfect tense",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "sort-into-bins", "two-button-binary"]
    },

    {
        skill_id: "language_grammar_past_perfect",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "past_perfect",
        developmental_band: "4-5+",
        skill_statement: "Form and use the past perfect tense (had + past participle) to show that one past action was completed before another past action began.",
        ccss_codes: ["L.4.1b", "L.5.1b"],
        rit_band: "198-213",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.B.8 Past perfect (Grade 4)", "5.B.8 Form past perfect (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Sequence the two past events on a timeline strip; use connectors 'before' and 'after' to build meaning: 'She had already eaten before he arrived.'",
        sped_scaffold: "Use two-event sequencing cards; students physically order the events (first / second) and then match to the past perfect structure: event 1 = had + past participle.",
        prerequisite_skill_ids: ["language_grammar_present_perfect", "language_grammar_verb_tense_irregular"],
        next_skill_ids: ["language_grammar_passive_voice"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 198-213 — past perfect tense",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "sort-into-bins", "two-button-binary"]
    },

    {
        skill_id: "language_grammar_subject_verb_agreement_compound",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "subject_verb_agreement_compound",
        developmental_band: "4-5+",
        skill_statement: "Apply subject-verb agreement rules to compound subjects joined by and (plural), or/nor (agree with the nearest subject), and indefinite pronouns.",
        ccss_codes: ["L.4.1c", "L.5.1e"],
        rit_band: "195-210",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.B.9 Compound subjects (Grade 4)", "5.B.9 Subject-verb agreement with compound subjects (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Model the or/nor 'nearest subject' rule with sentence frames and step-by-step arrows; compare to simpler agreement rules already mastered before introducing compound subjects.",
        sped_scaffold: "Use a 2-step card: Step 1 — underline both subjects and the joining word. Step 2 — circle the nearer subject (or/nor) or mark 'plural' (and), then choose the verb.",
        prerequisite_skill_ids: ["language_grammar_subject_verb_agreement", "language_grammar_conjunctions_fanboys"],
        next_skill_ids: ["language_grammar_passive_voice"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 195-210 — compound subject-verb agreement",
        question_types: ["drop-down-inline", "mc-text", "two-button-binary", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_passive_voice",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "passive_voice",
        developmental_band: "4-5+",
        skill_statement: "Identify passive voice constructions (be + past participle) and convert between active and passive voice; understand when each voice is appropriate.",
        ccss_codes: ["L.5.1b"],
        rit_band: "203-218",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["5.B.10 Passive voice (Grade 5)", "6.B.6 Active and passive voice (Grade 6)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic has a passive voice using vowel patterning on the root — connect that concept to English be + past participle construction; use transformation drills with familiar sentences first.",
        sped_scaffold: "Use an 'actor swap' visual: circle the actor in active voice, then show it moving to a 'by ___' phrase in passive voice; box the new grammatical subject.",
        prerequisite_skill_ids: ["language_grammar_past_perfect", "language_grammar_subject_verb_agreement_compound"],
        next_skill_ids: ["language_grammar_tense_consistency"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 203-218 — passive voice",
        question_types: ["mc-text", "drop-down-inline", "two-button-binary", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_tense_consistency",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "tense_consistency",
        developmental_band: "4-5+",
        skill_statement: "Maintain consistent verb tense within a paragraph or narrative; identify and correct inappropriate tense shifts.",
        ccss_codes: ["L.4.1b", "L.5.1b"],
        rit_band: "198-213",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.B.10 Consistent verb tense (Grade 4)", "5.B.10 Avoid inappropriate tense shifts (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Use a 'tense traffic light' visual: green = the established tense, yellow = a possible shift, red = an error. Read paragraphs aloud and pause at each verb to check the light.",
        sped_scaffold: "Highlight every verb in a paragraph; underline the tense established in the first sentence; circle any verb that does not match and model correction before independent work.",
        prerequisite_skill_ids: ["language_grammar_past_progressive", "language_grammar_present_perfect"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 198-213 — tense consistency",
        question_types: ["hot-text-word", "mc-text", "fib-auto", "drop-down-inline", "two-button-binary"]
    },

    {
        skill_id: "language_grammar_modal_verbs",
        subject: "language",
        strand: "grammar",
        domain: "verbs",
        sub_domain: "modal_verbs",
        developmental_band: "3-4",
        skill_statement: "Identify and use modal auxiliary verbs (can, could, may, might, must, shall, should, will, would) to express ability, possibility, permission, or obligation.",
        ccss_codes: ["L.3.1a", "L.4.1c"],
        rit_band: "185-200",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.B.7 Modal verbs (Grade 3)", "4.B.7 Modals: ability and permission (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic modals are formed differently; group English modals by meaning (ability: can/could; permission: may/might; obligation: must/should) and drill each group before mixing.",
        sped_scaffold: "Create a modal meaning chart with traffic-light colors: can/could (ability = green), may/might (possibility = yellow), must/should (obligation = red).",
        prerequisite_skill_ids: ["language_grammar_helping_verb"],
        next_skill_ids: ["language_grammar_tense_consistency"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 185-200 — modal auxiliary verbs",
        question_types: ["drop-down-inline", "mc-text", "sort-into-bins", "two-button-binary", "fib-auto"]
    },

    // ─── ADJECTIVES (expanded) ───────────────────────────────────────────────

    {
        skill_id: "language_grammar_adjective_basic",
        subject: "language",
        strand: "grammar",
        domain: "adjectives",
        sub_domain: "adjective_identification",
        developmental_band: "K-1",
        skill_statement: "Identify adjectives as words that describe or modify nouns by answering the questions What kind? Which one? How many? How much?",
        ccss_codes: ["L.K.1f", "L.1.1f"],
        rit_band: "155-173",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["K.A.4 Adjectives (Kindergarten)", "1.C.1 Identify adjectives (Grade 1)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass."
        ],
        ell_scaffold: "Arabic adjectives follow the noun and agree in gender/number; contrast with English adjective-before-noun order using side-by-side sentence examples and physical color/size sorting activities.",
        sped_scaffold: "Use a 'describing box': place objects in a box and students generate three adjectives (color, size, shape) before writing; connect spoken description to the printed adjective label.",
        prerequisite_skill_ids: ["language_grammar_common_noun"],
        next_skill_ids: ["language_grammar_comparative_adjective", "language_grammar_adjectives_osascomp"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 155-173 — adjective identification",
        question_types: ["tap-hotspot", "two-button-binary", "sort-into-bins", "mc-text", "hot-text-word"]
    },

    {
        skill_id: "language_grammar_comparative_adjective",
        subject: "language",
        strand: "grammar",
        domain: "adjectives",
        sub_domain: "comparative_adjective",
        developmental_band: "2-3",
        skill_statement: "Form and use comparative adjectives (taller, more interesting) to compare two nouns; apply -er or more according to the number of syllables in the base adjective.",
        ccss_codes: ["L.2.1e", "L.3.1g"],
        rit_band: "173-190",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.C.1 Comparative adjectives (Grade 2)", "3.C.1 Form comparative adjectives (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic uses a different comparative stem form; provide the rule clearly: one syllable → -er, two or more syllables → more. Exceptions (good → better) must be memorized.",
        sped_scaffold: "Use a syllable-clapping routine to count syllables before deciding on -er vs. more; provide a reference card with both forms for a set of 20 common adjectives.",
        prerequisite_skill_ids: ["language_grammar_adjective_basic"],
        next_skill_ids: ["language_grammar_superlative_adjective"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 173-190 — comparative adjectives",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "two-button-binary", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_superlative_adjective",
        subject: "language",
        strand: "grammar",
        domain: "adjectives",
        sub_domain: "superlative_adjective",
        developmental_band: "2-3",
        skill_statement: "Form and use superlative adjectives (tallest, most interesting) to compare three or more nouns; apply -est or most correctly and use the definite article the before them.",
        ccss_codes: ["L.2.1e", "L.3.1g"],
        rit_band: "175-192",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.C.2 Superlative adjectives (Grade 2)", "3.C.2 Form superlative adjectives (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic superlatives use a pattern form; contrast with English -est/most rule and explicitly teach that the is required ('the tallest mountain', not 'a tallest mountain').",
        sped_scaffold: "Use a staircase visual with three steps for comparative/superlative; practice with familiar classroom objects (tallest student, heaviest book) before abstract drills.",
        prerequisite_skill_ids: ["language_grammar_comparative_adjective"],
        next_skill_ids: ["language_grammar_predicate_adjective", "language_grammar_coordinate_adjectives"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 175-192 — superlative adjectives",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "two-button-binary", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_demonstrative_adjective",
        subject: "language",
        strand: "grammar",
        domain: "adjectives",
        sub_domain: "demonstrative_adjective",
        developmental_band: "2-3",
        skill_statement: "Use demonstrative adjectives (this, that, these, those) correctly before nouns to indicate near or far reference and singular or plural number (this book, those books).",
        ccss_codes: ["L.1.1f", "L.2.1e"],
        rit_band: "165-182",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.C.3 Demonstrative adjectives (Grade 2)", "3.C.3 This, that, these, those before nouns (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Distinguish demonstrative adjective (this book — modifying a noun) from demonstrative pronoun (this is a book — no noun follows); use color-coding to mark the noun that follows.",
        sped_scaffold: "Use near/far signs and singular/plural labels in a 2x2 grid; students place word cards in the correct cell before writing practice.",
        prerequisite_skill_ids: ["language_grammar_adjective_basic", "language_grammar_demonstrative_pronoun"],
        next_skill_ids: ["language_grammar_predicate_adjective"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 165-182 — demonstrative adjectives",
        question_types: ["drop-down-inline", "mc-text", "two-button-binary", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_predicate_adjective",
        subject: "language",
        strand: "grammar",
        domain: "adjectives",
        sub_domain: "predicate_adjective",
        developmental_band: "3-4",
        skill_statement: "Identify and use predicate adjectives — adjectives that appear after a linking verb and describe the subject (The soup smells delicious; The children seem tired).",
        ccss_codes: ["L.3.1a", "L.4.1a"],
        rit_band: "183-198",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.C.4 Predicate adjectives (Grade 3)", "4.C.4 Identify predicate adjectives (Grade 4)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass."
        ],
        ell_scaffold: "Contrast attributive position (the happy girl) with predicate position (The girl is happy) using sentence-transformation strips to show both placements of the same adjective.",
        sped_scaffold: "Color-code subject, linking verb, and predicate adjective in three colors; practice identifying all three parts before moving to production tasks.",
        prerequisite_skill_ids: ["language_grammar_adjective_basic", "language_grammar_linking_verb"],
        next_skill_ids: ["language_grammar_proper_adjective", "language_grammar_coordinate_adjectives"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 183-198 — predicate adjectives",
        question_types: ["tap-hotspot", "mc-text", "two-button-binary", "fib-auto", "word-tagger"]
    },

    {
        skill_id: "language_grammar_proper_adjective",
        subject: "language",
        strand: "grammar",
        domain: "adjectives",
        sub_domain: "proper_adjective",
        developmental_band: "4-5+",
        skill_statement: "Identify and capitalize proper adjectives derived from proper nouns (American, French, Islamic, Shakespearean) and use them correctly before nouns.",
        ccss_codes: ["L.4.1a", "L.5.1a"],
        rit_band: "190-205",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.C.5 Proper adjectives (Grade 4)", "5.C.5 Capitalize proper adjectives (Grade 5)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass."
        ],
        ell_scaffold: "Arabic nationality/origin adjectives agree in gender and number; contrast with English, where proper adjectives are invariable but always capitalized regardless of position in the sentence.",
        sped_scaffold: "Collect examples from class topics (Egyptian art, Chinese food, Greek mythology); build a personal proper-adjective glossary with the source proper noun listed alongside.",
        prerequisite_skill_ids: ["language_grammar_adjective_basic", "language_grammar_common_proper_noun"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 190-205 — proper adjectives",
        question_types: ["hot-text-word", "mc-text", "fib-auto", "two-button-binary", "tap-hotspot"]
    },

    {
        skill_id: "language_grammar_coordinate_adjectives",
        subject: "language",
        strand: "grammar",
        domain: "adjectives",
        sub_domain: "coordinate_adjectives_comma",
        developmental_band: "4-5+",
        skill_statement: "Use a comma to separate coordinate adjectives (adjectives that independently modify the same noun and could be reversed or joined with and): a tall, dark building; but not a tall brick building.",
        ccss_codes: ["L.4.2a", "L.5.2a"],
        rit_band: "195-210",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.C.6 Commas with coordinate adjectives (Grade 4)", "5.C.6 Coordinate adjectives (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Teach the two tests (can you insert 'and'? can you swap order?) as explicit rules with sentence strips students physically rearrange before making punctuation decisions.",
        sped_scaffold: "Post the two coordinate-adjective tests as a checklist; require students to answer both questions on paper before writing or omitting a comma.",
        prerequisite_skill_ids: ["language_grammar_adjectives_osascomp"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 195-210 — commas with coordinate adjectives",
        question_types: ["two-button-binary", "mc-text", "drop-down-inline", "fib-auto", "hot-text-word"]
    },

    // ─── ADVERBS (expanded) ──────────────────────────────────────────────────

    {
        skill_id: "language_grammar_adverb_of_manner",
        subject: "language",
        strand: "grammar",
        domain: "adverbs",
        sub_domain: "adverb_manner",
        developmental_band: "2-3",
        skill_statement: "Identify and use adverbs of manner (mostly -ly forms: quickly, quietly, carefully) that answer the question 'How?' about a verb.",
        ccss_codes: ["L.2.1e", "L.3.1a"],
        rit_band: "172-190",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.D.1 Adverbs of manner (Grade 2)", "3.D.1 Identify manner adverbs (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic manner adverbs often use a prepositional phrase; teach the -ly derivation from adjective explicitly (slow → slowly) and practice the 'How?' question test before writing.",
        sped_scaffold: "Use action verb + manner adverb sentence frames: 'She walked ___ (how?).' Students generate an -ly adverb orally before writing; use a list of base adjectives as a scaffold.",
        prerequisite_skill_ids: ["language_grammar_adverbs", "language_grammar_adjective_basic"],
        next_skill_ids: ["language_grammar_adverb_of_time", "language_grammar_comparative_superlative_adverbs"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 172-190 — adverbs of manner",
        question_types: ["tap-hotspot", "fib-auto", "mc-text", "sort-into-bins", "two-button-binary"]
    },

    {
        skill_id: "language_grammar_adverb_of_time",
        subject: "language",
        strand: "grammar",
        domain: "adverbs",
        sub_domain: "adverb_time",
        developmental_band: "2-3",
        skill_statement: "Identify and use adverbs of time (yesterday, soon, now, often, never, already, still, always) that answer the question 'When?' or 'How often?' about a verb.",
        ccss_codes: ["L.2.1e", "L.3.1a"],
        rit_band: "170-188",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.D.2 Adverbs of time (Grade 2)", "3.D.2 Identify time adverbs (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic time adverbs are typically sentence-initial; teach flexible English adverb placement (beginning, middle, end) using sentence strips students physically rearrange.",
        sped_scaffold: "Anchor time adverbs to a visual timeline: never–rarely–sometimes–often–always on a frequency arrow; yesterday/now/tomorrow on a past-present-future arrow.",
        prerequisite_skill_ids: ["language_grammar_adverbs"],
        next_skill_ids: ["language_grammar_adverb_of_place"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 170-188 — adverbs of time",
        question_types: ["tap-hotspot", "sort-into-bins", "mc-text", "fib-auto", "drop-down-inline"]
    },

    {
        skill_id: "language_grammar_adverb_of_place",
        subject: "language",
        strand: "grammar",
        domain: "adverbs",
        sub_domain: "adverb_place",
        developmental_band: "2-3",
        skill_statement: "Identify and use adverbs of place (here, there, everywhere, nearby, outside, inside, above, below) that answer the question 'Where?' about a verb.",
        ccss_codes: ["L.2.1e", "L.3.1a"],
        rit_band: "170-188",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.D.3 Adverbs of place (Grade 2)", "3.D.3 Identify place adverbs (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Explicitly contrast adverbs of place (She went outside) with prepositional phrases (She went outside the house); use classroom spatial activities before print tasks.",
        sped_scaffold: "Use a classroom map to generate place adverbs; students physically move and describe their location (I am here; he is there) before writing sentences.",
        prerequisite_skill_ids: ["language_grammar_adverbs", "language_grammar_prepositions"],
        next_skill_ids: ["language_grammar_comparative_superlative_adverbs"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 170-188 — adverbs of place",
        question_types: ["tap-hotspot", "sort-into-bins", "mc-text", "fib-auto", "two-button-binary"]
    },

    {
        skill_id: "language_grammar_comparative_superlative_adverbs",
        subject: "language",
        strand: "grammar",
        domain: "adverbs",
        sub_domain: "comparative_superlative_adverbs",
        developmental_band: "4-5+",
        skill_statement: "Form and use comparative (more carefully, faster) and superlative (most carefully, fastest) adverbs correctly; identify irregular forms (well → better → best, badly → worse → worst).",
        ccss_codes: ["L.3.1g", "L.4.1a"],
        rit_band: "188-203",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.D.4 Comparative and superlative adverbs (Grade 3)", "4.D.4 Adverb degrees of comparison (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Parallel the adjective comparison rules taught earlier; highlight that -ly adverbs almost always use more/most, while short adverbs (fast, hard) use -er/-est.",
        sped_scaffold: "Use the same staircase graphic from adjective comparison but label the steps 'fast / faster / fastest' or 'carefully / more carefully / most carefully' to make the parallel explicit.",
        prerequisite_skill_ids: ["language_grammar_adverbs", "language_grammar_comparative_adjective"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 188-203 — comparative and superlative adverbs",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "sort-into-bins", "two-button-binary"]
    },

    // ─── PREPOSITIONS / CONJUNCTIONS / INTERJECTIONS (expanded) ─────────────

    {
        skill_id: "language_grammar_preposition_basic",
        subject: "language",
        strand: "grammar",
        domain: "prepositions",
        sub_domain: "preposition_basic",
        developmental_band: "1-2",
        skill_statement: "Identify and use common prepositions of location and time (in, on, at, under, over, between, behind, beside, before, after) in sentences.",
        ccss_codes: ["L.1.1f", "L.2.1e"],
        rit_band: "163-180",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["1.E.1 Prepositions (Grade 1)", "2.E.1 Identify prepositions (Grade 2)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic prepositions do not map 1:1 to English; anchor each preposition to a physical demonstration (book on the table, bag under the chair) before print tasks.",
        sped_scaffold: "Use a 'preposition obstacle course' with physical objects; students narrate their path using target prepositions before writing sentence descriptions.",
        prerequisite_skill_ids: ["language_grammar_common_noun"],
        next_skill_ids: ["language_grammar_prepositions"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 163-180 — basic prepositions",
        question_types: ["drop-down-inline", "mc-text", "sort-into-bins", "tap-hotspot", "fib-auto"]
    },

    {
        skill_id: "language_grammar_prepositional_phrase",
        subject: "language",
        strand: "grammar",
        domain: "prepositions",
        sub_domain: "prepositional_phrase",
        developmental_band: "3-4",
        skill_statement: "Identify a prepositional phrase (preposition + noun phrase) and explain its function as a modifier of a noun or verb in the sentence.",
        ccss_codes: ["L.3.1e", "L.4.1e"],
        rit_band: "185-200",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.E.2 Prepositional phrases (Grade 3)", "4.E.2 Identify and use prepositional phrases (Grade 4)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass."
        ],
        ell_scaffold: "Bracket the full prepositional phrase as a unit: [under the old bridge]. Show how the entire bracket modifies either a noun (adjective function) or a verb (adverb function).",
        sped_scaffold: "Use a 'PP spotter' routine: circle the preposition, underline everything up to and including the noun; read the phrase and ask 'Which noun does this describe? Which verb?' before labeling.",
        prerequisite_skill_ids: ["language_grammar_preposition_basic", "language_grammar_prepositions"],
        next_skill_ids: ["language_grammar_subordinating_conjunction"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 185-200 — prepositional phrases",
        question_types: ["tap-hotspot", "hot-text-word", "mc-text", "fib-auto", "word-tagger"]
    },

    {
        skill_id: "language_grammar_subordinating_conjunction",
        subject: "language",
        strand: "grammar",
        domain: "conjunctions",
        sub_domain: "subordinating_conjunctions",
        developmental_band: "4-5+",
        skill_statement: "Identify and use subordinating conjunctions (because, although, while, when, since, unless, after, before, if, until, even though) to join a dependent clause to an independent clause.",
        ccss_codes: ["L.3.1h", "L.4.1a", "L.5.1a"],
        rit_band: "193-210",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.F.1 Subordinating conjunctions (Grade 4)", "5.F.1 Use subordinating conjunctions (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Group subordinators by meaning (cause: because/since, contrast: although/even though, condition: if/unless, time: when/while/after/before) and drill one group per lesson before mixing.",
        sped_scaffold: "Use The Writing Revolution 'because, but, so' technique: students complete each sentence stem with a different subordinator to build meaning flexibility before formal identification.",
        prerequisite_skill_ids: ["language_grammar_conjunctions_fanboys"],
        next_skill_ids: ["language_grammar_correlative_conjunction"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 193-210 — subordinating conjunctions",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "sort-into-bins", "sentence-build"]
    },

    {
        skill_id: "language_grammar_correlative_conjunction",
        subject: "language",
        strand: "grammar",
        domain: "conjunctions",
        sub_domain: "correlative_conjunctions",
        developmental_band: "4-5+",
        skill_statement: "Identify and use correlative conjunctions as pairs (either/or, neither/nor, both/and, not only/but also, whether/or) and maintain parallel structure in joined elements.",
        ccss_codes: ["L.4.1g", "L.5.1e"],
        rit_band: "198-215",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.F.2 Correlative conjunctions (Grade 4)", "5.F.2 Use correlative conjunctions (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic uses analogous paired conjunctions (imma/aw for either/or); connect to this Arabic cognate structure before drilling the English pairs with sentence frame templates.",
        sped_scaffold: "Print correlative pair cards with a bridge graphic connecting the two parts; students match the pairs before using them in sentences; enforce the parallel structure rule with a checklist.",
        prerequisite_skill_ids: ["language_grammar_conjunctions_fanboys", "language_grammar_subordinating_conjunction"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 198-215 — correlative conjunctions",
        question_types: ["match-pairs", "drop-down-inline", "mc-text", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "language_grammar_interjection",
        subject: "language",
        strand: "grammar",
        domain: "interjections",
        sub_domain: "interjection_identification",
        developmental_band: "3-4",
        skill_statement: "Identify interjections (oh, wow, ouch, hey, yes, no, well, hurray) as words or phrases that express sudden emotion and are set off by a comma or exclamation point.",
        ccss_codes: ["L.3.1a", "L.4.1a"],
        rit_band: "182-198",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.G.1 Interjections (Grade 3)", "4.G.1 Identify interjections (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution. Jossey-Bass.",
            "Moats, L. C. (2020). LETRS Module 9: Teaching Grammar, Sentence Structure, and Text Structure. Sopris Learning."
        ],
        ell_scaffold: "Arabic has comparable exclamatory particles (ya! masha'allah!); connect to these familiar expressions and show that English interjections follow the same emotional-outburst function but with different punctuation rules.",
        sped_scaffold: "Use emotion flashcards (surprise, pain, joy, agreement) and have students match interjection words to each emotion card before identifying them in printed sentences.",
        prerequisite_skill_ids: ["language_grammar_parts_of_speech_mixed"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 182-198 — interjections",
        question_types: ["tap-hotspot", "mc-text", "two-button-binary", "sort-into-bins", "fib-auto"]
    }

];

export default grammarAtoms;
