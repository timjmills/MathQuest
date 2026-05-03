/**
 * Literacy Quest — Language / Writing skill atoms (Part 9)
 * Strands: topic sentence, supporting details, transitions,
 *          conclusion, voice/audience, opinion vs informational vs narrative,
 *          paragraph structure, hooks
 * @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]}
 */

/** @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]} */
const writingAtoms = [

    {
        skill_id: "language_writing_topic_sentence",
        subject: "language",
        strand: "writing",
        domain: "paragraph_structure",
        sub_domain: "topic_sentence",
        developmental_band: "2-3",
        skill_statement: "Identify and write a strong topic sentence that clearly introduces the main idea of a paragraph.",
        ccss_codes: ["W.2.2", "W.3.2a", "W.4.2a"],
        rit_band: "183-198",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["2.K.1 Identify the topic sentence (Grade 2)", "3.K.1 Write a topic sentence (Grade 3)", "4.K.1 Identify and write topic sentences (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Provide a topic sentence frame: '[Topic] is/are [main idea claim].' Model with familiar topics before independent practice.",
        sped_scaffold: "Circle the topic and underline the main idea claim in model sentences before students write their own; use 2-3 model levels for guided practice.",
        prerequisite_skill_ids: ["reading_comp_info_main_idea"],
        next_skill_ids: ["language_writing_supporting_details", "language_writing_paragraph_structure"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 183-198 — paragraph structure: topic sentences",
        question_types: ["mc-text", "hot-text-sentence", "fib-auto", "sort-into-bins", "open-response-fib"]
    },

    {
        skill_id: "language_writing_supporting_details",
        subject: "language",
        strand: "writing",
        domain: "paragraph_structure",
        sub_domain: "supporting_details",
        developmental_band: "2-3",
        skill_statement: "Add relevant supporting details and examples that elaborate on and support the topic sentence of a paragraph.",
        ccss_codes: ["W.2.2", "W.3.2b", "W.4.2b"],
        rit_band: "183-198",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["2.K.2 Add supporting details (Grade 2)", "3.K.2 Write relevant supporting details (Grade 3)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Use a detail sentence frame: 'For example, ...' / 'One reason is ...' / 'This shows that ...' — model in English and translate frames as needed.",
        sped_scaffold: "Sort sentence strips: relevant detail or off-topic? Progress from sorting to writing; allow bullet-point format before full sentence.",
        prerequisite_skill_ids: ["language_writing_topic_sentence"],
        next_skill_ids: ["language_writing_transitions", "language_writing_conclusion"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 183-198 — supporting details in paragraph",
        question_types: ["mc-text", "mc-multi-select", "sort-into-bins", "sentence-build", "open-response-fib"]
    },

    {
        skill_id: "language_writing_transitions",
        subject: "language",
        strand: "writing",
        domain: "paragraph_structure",
        sub_domain: "transitional_words",
        developmental_band: "4-5+",
        skill_statement: "Use transitional words and phrases to connect ideas within and between paragraphs (e.g., first, next, also, in addition, however, in contrast, in conclusion).",
        ccss_codes: ["W.3.2c", "W.4.2c", "W.5.2c"],
        rit_band: "188-203",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["3.K.3 Use transitional words (Grade 3)", "4.K.3 Choose the right transition (Grade 4)", "5.K.3 Transitions for organization (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Create a transitions reference card organized by function (order, addition, contrast, cause-effect, conclusion) in English and Arabic.",
        sped_scaffold: "Begin with sequence transitions only (first, next, then, finally); introduce other functions one at a time after mastery.",
        prerequisite_skill_ids: ["language_writing_supporting_details"],
        next_skill_ids: ["language_writing_conclusion", "language_writing_paragraph_structure"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 188-203 — transitions and organizational flow",
        question_types: ["drop-down-inline", "mc-text", "fib-auto", "sort-into-bins", "sentence-build"]
    },

    {
        skill_id: "language_writing_conclusion",
        subject: "language",
        strand: "writing",
        domain: "paragraph_structure",
        sub_domain: "concluding_sentence",
        developmental_band: "4-5+",
        skill_statement: "Write or identify an effective concluding sentence that restates the main idea (without copying it) and signals the end of the paragraph.",
        ccss_codes: ["W.3.2e", "W.4.2e", "W.5.2e"],
        rit_band: "190-205",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["3.K.4 Write a concluding sentence (Grade 3)", "4.K.4 Identify and write conclusions (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Use closing signal phrases as a scaffold: 'In conclusion, ...' / 'Overall, ...' / 'As you can see, ...'; model how these introduce a restatement.",
        sped_scaffold: "Use a 2-step test: (1) Does it restate the main idea? (2) Does it feel like an ending? Both yes = good conclusion.",
        prerequisite_skill_ids: ["language_writing_topic_sentence", "language_writing_supporting_details"],
        next_skill_ids: ["language_writing_paragraph_structure"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 190-205 — concluding sentences",
        question_types: ["mc-text", "hot-text-sentence", "two-button-binary", "fib-auto", "open-response-fib"]
    },

    {
        skill_id: "language_writing_hook",
        subject: "language",
        strand: "writing",
        domain: "writing_craft",
        sub_domain: "engaging_opening_hook",
        developmental_band: "4-5+",
        skill_statement: "Recognize and write engaging opening hooks (question, surprising fact, anecdote, vivid description, or bold statement) to capture the reader's attention.",
        ccss_codes: ["W.4.1a", "W.4.2a", "W.5.1a", "W.5.2a"],
        rit_band: "193-207",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["4.K.5 Write an engaging introduction (Grade 4)", "5.K.5 Hooks and introductions (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Show examples of each hook type in simplified English; connect to Arabic oral tradition of opening with an engaging question or saying.",
        sped_scaffold: "Provide a hook type menu with one model sentence per type; student selects a type and completes a fill-in frame before writing freely.",
        prerequisite_skill_ids: ["language_writing_topic_sentence"],
        next_skill_ids: ["language_writing_voice_audience"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 193-207 — engaging introductions and hooks",
        question_types: ["mc-text", "sort-into-bins", "two-button-binary", "fib-auto", "open-response-fib"]
    },

    {
        skill_id: "language_writing_voice_audience",
        subject: "language",
        strand: "writing",
        domain: "writing_craft",
        sub_domain: "voice_and_audience",
        developmental_band: "4-5+",
        skill_statement: "Recognize and adjust writing for purpose and audience, distinguishing between formal and informal register (e.g., letter to principal vs. text message to a friend).",
        ccss_codes: ["W.4.4", "W.5.4", "L.3.3b"],
        rit_band: "195-210",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["4.K.6 Write for different audiences and purposes (Grade 4)", "5.K.6 Voice and audience in writing (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Code-switching between formal and informal Arabic is familiar to many ELL students; use this as a bridge to formal/informal English register distinction.",
        sped_scaffold: "Use a side-by-side comparison of the same message in formal and informal register; identify signal words for each.",
        prerequisite_skill_ids: ["language_writing_hook", "language_writing_transitions"],
        next_skill_ids: ["language_writing_opinion_vs_informational"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 195-210 — voice, style, and audience awareness",
        question_types: ["two-button-binary", "mc-text", "sort-into-bins", "drop-down-inline", "open-response-fib"]
    },

    {
        skill_id: "language_writing_opinion_vs_informational",
        subject: "language",
        strand: "writing",
        domain: "writing_genres",
        sub_domain: "opinion_vs_informational",
        developmental_band: "4-5+",
        skill_statement: "Distinguish opinion writing (states a claim and provides supporting reasons/evidence) from informational writing (presents facts and explanations objectively).",
        ccss_codes: ["W.3.1", "W.3.2", "W.4.1", "W.4.2", "W.5.1", "W.5.2"],
        rit_band: "190-205",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["3.K.7 Opinion vs. informational writing (Grade 3)", "4.K.7 Identify genre: opinion or informational (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Use parallel model texts on the same topic — one opinion piece and one informational — to make the genre contrast visible and tangible.",
        sped_scaffold: "Use a genre feature checklist: 'Does it state a belief?' + 'Does it give reasons?' = opinion. 'Does it report facts?' = informational.",
        prerequisite_skill_ids: ["language_writing_topic_sentence", "reading_comp_info_fact_opinion"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 190-205 — opinion vs. informational text purpose",
        question_types: ["two-button-binary", "sort-into-bins", "mc-text", "hot-text-sentence", "fib-auto"]
    },

    {
        skill_id: "language_writing_paragraph_structure",
        subject: "language",
        strand: "writing",
        domain: "paragraph_structure",
        sub_domain: "full_paragraph_tis",
        developmental_band: "4-5+",
        skill_statement: "Write a well-structured paragraph with a clear topic sentence, 2–3 supporting details with elaboration, and a concluding sentence (TIS: Topic-Information-Summary frame).",
        ccss_codes: ["W.3.2", "W.4.2", "W.5.2"],
        rit_band: "193-210",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["3.K.8 Write a complete paragraph (Grade 3)", "4.K.8 Paragraph structure (Grade 4)", "5.K.8 Develop paragraphs (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Provide a structured paragraph template with sentence count guidance; allow L1 planning before English drafting for complex topics.",
        sped_scaffold: "Use a color-coded paragraph map: green = topic sentence, yellow = details (×2-3), red = conclusion. Student identifies or fills in each color zone.",
        prerequisite_skill_ids: ["language_writing_topic_sentence", "language_writing_supporting_details", "language_writing_conclusion", "language_writing_transitions"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 193-210 — complete paragraph structure",
        question_types: ["mc-text", "sequence-events", "sort-into-bins", "hot-text-sentence", "open-response-fib"]
    }

];

export default writingAtoms;
