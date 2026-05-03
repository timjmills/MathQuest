/**
 * Literacy Quest — Language / Sentence Structure skill atoms (Part 7)
 * Strands: fragment vs sentence, run-on, simple/compound/complex,
 *          sentence combining, parallel structure, modifier placement
 * @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]}
 */

/** @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]} */
const sentenceStructureAtoms = [

    {
        skill_id: "language_sentence_fragment_vs_sentence",
        subject: "language",
        strand: "sentence_structure",
        domain: "sentence_completeness",
        sub_domain: "fragment_identification",
        developmental_band: "2-3",
        skill_statement: "Distinguish a complete sentence (has a subject and predicate and expresses a complete thought) from a sentence fragment.",
        ccss_codes: ["L.2.1f", "L.3.1i"],
        rit_band: "178-194",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.E.1 Identify complete sentences and fragments (Grade 2)", "3.E.1 Is it a sentence or a fragment? (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Explicitly teach that Arabic allows null subjects (pro-drop); in English, every sentence must have a visible subject — use sentence frame checks.",
        sped_scaffold: "Use the two-question test: (1) Who or what? (subject) (2) Did what? (predicate). If both have answers = sentence; if not = fragment.",
        prerequisite_skill_ids: ["language_grammar_subject_verb_agreement"],
        next_skill_ids: ["language_sentence_run_on", "language_sentence_simple_compound_complex"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 178-194 — sentence completeness",
        question_types: ["two-button-binary", "mc-text", "tap-hotspot", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "language_sentence_run_on",
        subject: "language",
        strand: "sentence_structure",
        domain: "sentence_completeness",
        sub_domain: "run_on_identification",
        developmental_band: "2-3",
        skill_statement: "Identify run-on sentences and comma splices; correct them by using a period, semicolon, or a coordinating conjunction with appropriate punctuation.",
        ccss_codes: ["L.2.1f", "L.3.1i", "L.4.1f"],
        rit_band: "181-196",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["2.E.2 Identify run-on sentences (Grade 2)", "3.E.2 Fix run-on sentences (Grade 3)", "4.E.2 Correct run-on sentences and comma splices (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Show contrast between run-on and corrected versions; Arabic sometimes allows chained clauses with 'and' — explain English conventions differ.",
        sped_scaffold: "Read aloud strategy: where does the voice naturally pause and drop? That is where a sentence should end. Practice with physical pause cards.",
        prerequisite_skill_ids: ["language_sentence_fragment_vs_sentence"],
        next_skill_ids: ["language_sentence_simple_compound_complex"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 181-196 — run-on sentences and comma splices",
        question_types: ["two-button-binary", "mc-text", "drop-down-inline", "fib-auto", "hot-text-sentence"]
    },

    {
        skill_id: "language_sentence_simple_compound_complex",
        subject: "language",
        strand: "sentence_structure",
        domain: "sentence_types",
        sub_domain: "sentence_classification",
        developmental_band: "4-5+",
        skill_statement: "Classify sentences as simple, compound, or complex based on the number and type of clauses they contain.",
        ccss_codes: ["L.3.1i", "L.4.1f", "L.5.3a"],
        rit_band: "190-207",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.E.3 Identify sentence types (Grade 3)", "4.E.3 Simple, compound, and complex sentences (Grade 4)", "5.E.3 Classify sentence types (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Teach simple sentences first; build to compound using FANBOYS, then complex using subordinating conjunctions; use visual clause diagrams.",
        sped_scaffold: "Use colored bracelets: white = independent clause, yellow = dependent clause. Students physically 'build' sentence types with bracelets before writing.",
        prerequisite_skill_ids: ["language_sentence_run_on", "language_grammar_conjunctions_fanboys"],
        next_skill_ids: ["language_sentence_combining", "language_sentence_parallel_structure"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 190-207 — simple, compound, and complex sentences",
        question_types: ["mc-text", "sort-into-bins", "tap-hotspot", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "language_sentence_combining",
        subject: "language",
        strand: "sentence_structure",
        domain: "sentence_construction",
        sub_domain: "sentence_combining",
        developmental_band: "4-5+",
        skill_statement: "Combine two or more simple sentences into a compound or complex sentence using coordinating or subordinating conjunctions appropriately.",
        ccss_codes: ["L.3.1i", "L.4.1e", "L.5.3a"],
        rit_band: "193-207",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["3.E.4 Combine sentences (Grade 3)", "4.E.4 Sentence combining (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Model sentence combining with think-alouds; provide a 'combining toolkit' card with conjunctions grouped by function (add, contrast, cause, time).",
        sped_scaffold: "Give students the two source sentences on separate strips; physically manipulate strips and conjunction card before writing.",
        prerequisite_skill_ids: ["language_sentence_simple_compound_complex", "language_grammar_conjunctions_fanboys"],
        next_skill_ids: ["language_sentence_parallel_structure"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 193-207 — sentence combining",
        question_types: ["sentence-build", "drop-down-inline", "fib-auto", "mc-text", "open-response-fib"]
    },

    {
        skill_id: "language_sentence_parallel_structure",
        subject: "language",
        strand: "sentence_structure",
        domain: "sentence_style",
        sub_domain: "parallel_structure",
        developmental_band: "4-5+",
        skill_statement: "Identify and correct errors in parallel structure within a list, a compound predicate, or a compound sentence (e.g., correcting 'She likes running, to swim, and danced' to 'She likes running, swimming, and dancing').",
        ccss_codes: ["L.5.3a"],
        rit_band: "200-212",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["5.E.5 Parallel structure (Grade 5)", "6.E.5 Identify and correct parallel structure errors (Grade 6)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Parallel structure exists in Arabic but with different surface forms; use a visual pattern-matching approach: 'all items in the list must look the same shape.'",
        sped_scaffold: "Underline list items; circle the verb form of the first item; check that all other items match. Use a parallel/not-parallel anchor chart.",
        prerequisite_skill_ids: ["language_sentence_simple_compound_complex", "language_sentence_combining"],
        next_skill_ids: ["language_sentence_modifier_placement"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 200-212 — parallel structure",
        question_types: ["mc-text", "two-button-binary", "drop-down-inline", "fib-auto", "hot-text-word"]
    },

    {
        skill_id: "language_sentence_modifier_placement",
        subject: "language",
        strand: "sentence_structure",
        domain: "sentence_style",
        sub_domain: "modifier_placement",
        developmental_band: "4-5+",
        skill_statement: "Identify and correct misplaced or dangling modifiers to ensure clarity of meaning in complex sentences.",
        ccss_codes: ["L.5.3a"],
        rit_band: "202-215",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["5.E.6 Correct misplaced modifiers (Grade 5)", "6.E.6 Dangling modifiers (Grade 6)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Use humorous misplaced modifier examples to build intuition; ask 'who is doing the action?' to identify which noun the modifier should touch.",
        sped_scaffold: "Use an arrow to physically draw a line from the modifier to what it modifies; if the arrow is awkward, the modifier needs to move.",
        prerequisite_skill_ids: ["language_sentence_parallel_structure"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 202-215 — misplaced and dangling modifiers",
        question_types: ["mc-text", "two-button-binary", "fib-auto", "hot-text-word", "sentence-build"]
    },

    {
        skill_id: "language_sentence_dependent_clause",
        subject: "language",
        strand: "sentence_structure",
        domain: "sentence_types",
        sub_domain: "dependent_clause_subordination",
        developmental_band: "4-5+",
        skill_statement: "Identify dependent clauses and the subordinating conjunctions that introduce them (because, although, when, if, since, unless, until, while).",
        ccss_codes: ["L.4.1f", "L.5.1a"],
        rit_band: "197-212",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Grammar and Usage",
        ixl_skills: ["4.E.7 Identify dependent and independent clauses (Grade 4)", "5.E.7 Subordinating conjunctions and dependent clauses (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Arabic has subordinating particles similar to 'because' and 'when'; connect to known Arabic subordinators before introducing English equivalents.",
        sped_scaffold: "Use yellow highlighter for dependent clauses and blue for independent clauses; practice identifying each in isolation before finding them together.",
        prerequisite_skill_ids: ["language_sentence_simple_compound_complex"],
        next_skill_ids: ["language_sentence_parallel_structure"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Grammar and Usage RIT 197-212 — dependent clauses and subordinating conjunctions",
        question_types: ["tap-hotspot", "mc-text", "sort-into-bins", "fib-auto", "word-tagger"]
    }

];

export default sentenceStructureAtoms;
