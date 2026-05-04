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
    },

    // ─── NEW ATOMS (+17) ─────────────────────────────────────────────────────

    // Writing Process

    {
        skill_id: "language_writing_brainstorming",
        subject: "language",
        strand: "writing",
        domain: "writing_process",
        sub_domain: "brainstorming",
        developmental_band: "2-3",
        skill_statement: "Generate and record multiple ideas for writing using brainstorming strategies (list, web, quickwrite, or freewrite) before selecting one idea to develop.",
        ccss_codes: ["W.3.5", "W.4.5", "W.5.5"],
        rit_band: "183-198",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["3.K.9 Plan your writing (Grade 3)", "4.K.9 Prewriting strategies (Grade 4)"],
        sor_citations: [
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Allow brainstorming in L1 first; sketch ideas with drawings before words; use idea webs with both English and Arabic labels.",
        sped_scaffold: "Provide a structured brainstorm template with 3-5 idea boxes; student fills 1 box per prompt cycle before selecting.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["language_writing_organizing_ideas"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 183-198 — prewriting and idea generation",
        question_types: ["mc-text", "sort-into-bins", "fib-auto", "open-response-fib", "two-button-binary"]
    },

    {
        skill_id: "language_writing_organizing_ideas",
        subject: "language",
        strand: "writing",
        domain: "writing_process",
        sub_domain: "organizing_ideas",
        developmental_band: "2-3",
        skill_statement: "Organize selected writing ideas into a logical sequence using a graphic organizer (outline, story map, T-chart, or numbered list).",
        ccss_codes: ["W.3.5", "W.4.5", "W.5.5"],
        rit_band: "185-200",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["3.K.9 Plan your writing (Grade 3)", "4.K.10 Organize your writing (Grade 4)"],
        sor_citations: [
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Provide a genre-matched graphic organizer (story map for narrative, web for informational); allow L1 planning notes within the organizer.",
        sped_scaffold: "Pre-fill one section of the organizer as a model; student completes remaining sections with sentence starters.",
        prerequisite_skill_ids: ["language_writing_brainstorming"],
        next_skill_ids: ["language_writing_drafting"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 185-200 — organizing ideas for writing",
        question_types: ["sequence-events", "sort-into-bins", "mc-text", "dnd-linked", "fib-auto"]
    },

    {
        skill_id: "language_writing_drafting",
        subject: "language",
        strand: "writing",
        domain: "writing_process",
        sub_domain: "drafting",
        developmental_band: "2-3",
        skill_statement: "Transform a graphic organizer plan into a first draft by writing complete sentences and paragraphs without stopping to correct every error.",
        ccss_codes: ["W.3.5", "W.4.5", "W.5.5"],
        rit_band: "185-200",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["3.K.10 Draft your writing (Grade 3)"],
        sor_citations: [
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Explicitly teach that a draft is meant to be imperfect; encourage ELL students to write without stopping for dictionary lookup — circle unknown words and continue.",
        sped_scaffold: "Use speech-to-text technology for drafting; accept voice recordings as draft evidence if writing fluency is the barrier.",
        prerequisite_skill_ids: ["language_writing_organizing_ideas"],
        next_skill_ids: ["language_writing_revising"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 185-200 — drafting complete writing pieces",
        question_types: ["mc-text", "sort-into-bins", "two-button-binary", "open-response-fib", "fib-auto"]
    },

    {
        skill_id: "language_writing_revising",
        subject: "language",
        strand: "writing",
        domain: "writing_process",
        sub_domain: "revising",
        developmental_band: "4-5+",
        skill_statement: "Revise a draft by adding details, removing irrelevant information, reorganizing sentences or paragraphs for clarity, and varying sentence structure.",
        ccss_codes: ["W.4.5", "W.5.5"],
        rit_band: "193-208",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["4.K.11 Revise your writing (Grade 4)", "5.K.11 Revising strategies (Grade 5)"],
        sor_citations: [
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Focus revising on content (not grammar) first; use peer revision with structured questions: 'What is the main idea? What detail is clearest? What is confusing?'",
        sped_scaffold: "Use a ARMS revision checklist (Add, Remove, Move, Substitute) with one focus per session; mark changes directly on the draft.",
        prerequisite_skill_ids: ["language_writing_drafting"],
        next_skill_ids: ["language_writing_editing"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 193-208 — revision strategies",
        question_types: ["mc-text", "sort-into-bins", "hot-text-sentence", "two-button-binary", "open-response-fib"]
    },

    {
        skill_id: "language_writing_editing",
        subject: "language",
        strand: "writing",
        domain: "writing_process",
        sub_domain: "editing",
        developmental_band: "4-5+",
        skill_statement: "Edit a revised draft for errors in capitalization, punctuation, spelling, and sentence structure using an editing checklist.",
        ccss_codes: ["W.4.5", "W.5.5", "L.4.2", "L.5.2"],
        rit_band: "193-208",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["4.K.12 Edit your writing (Grade 4)", "5.K.12 Edit for grammar and mechanics (Grade 5)"],
        sor_citations: [
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Separate editing from revising — edit only after content is finalized; use a CUPS checklist (Capitalization, Usage, Punctuation, Spelling) with color-coded marks.",
        sped_scaffold: "Provide an editing key on a laminated card; student marks one error type per pass rather than all at once.",
        prerequisite_skill_ids: ["language_writing_revising"],
        next_skill_ids: ["language_writing_publishing"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 193-208 — editing for mechanics",
        question_types: ["tap-hotspot", "mc-text", "two-button-binary", "fib-auto", "hot-text-word"]
    },

    {
        skill_id: "language_writing_publishing",
        subject: "language",
        strand: "writing",
        domain: "writing_process",
        sub_domain: "publishing",
        developmental_band: "2-3",
        skill_statement: "Prepare a final version of a written piece for sharing (handwritten, typed, or illustrated) with an intended audience.",
        ccss_codes: ["W.2.5", "W.3.5", "W.4.5"],
        rit_band: "183-198",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["3.K.13 Publish your writing (Grade 3)"],
        sor_citations: [
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Allow digital publishing with accessibility features; connect the authentic audience to motivation for correct spelling and presentation.",
        sped_scaffold: "Provide a publishing template with line spacing and a dedicated illustration box; allow typed final copies for students with fine motor challenges.",
        prerequisite_skill_ids: ["language_writing_editing"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 183-198 — publishing and sharing writing",
        question_types: ["mc-text", "two-button-binary", "sort-into-bins", "fib-auto", "open-response-fib"]
    },

    // Genre-specific atoms

    {
        skill_id: "language_writing_opinion_with_reasons",
        subject: "language",
        strand: "writing",
        domain: "writing_genres",
        sub_domain: "opinion_with_reasons",
        developmental_band: "2-3",
        skill_statement: "Write an opinion paragraph or short piece that states a clear claim and supports it with 2–3 reasons, each with a linking transition (because, also, furthermore).",
        ccss_codes: ["W.2.1", "W.3.1a", "W.3.1b", "W.4.1b"],
        rit_band: "185-200",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["3.K.14 Write opinion pieces with reasons (Grade 3)", "4.K.14 Opinion writing with evidence (Grade 4)"],
        sor_citations: [
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Use a claim-reason frame: 'I think ___ because ___, and also because ___.' Pre-teach opinion signal words.",
        sped_scaffold: "Provide a 3-box graphic organizer: claim + 2 reasons; each box has a sentence starter.",
        prerequisite_skill_ids: ["language_writing_opinion_vs_informational"],
        next_skill_ids: ["language_writing_persuasive_techniques"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 185-200 — opinion writing with supported reasons",
        question_types: ["mc-text", "sort-into-bins", "sentence-build", "fib-auto", "open-response-fib"]
    },

    {
        skill_id: "language_writing_narrative_with_dialogue",
        subject: "language",
        strand: "writing",
        domain: "writing_genres",
        sub_domain: "narrative_with_dialogue",
        developmental_band: "4-5+",
        skill_statement: "Write a narrative that includes dialogue between characters, correctly punctuating and formatting the dialogue to reveal character and advance the plot.",
        ccss_codes: ["W.3.3b", "W.4.3b", "W.5.3b"],
        rit_band: "193-207",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["4.K.15 Add dialogue to narratives (Grade 4)", "5.K.15 Narrative writing with dialogue (Grade 5)"],
        sor_citations: [
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Model dialogue punctuation with speech bubbles first; connect speech bubbles to printed dialogue with a guided annotation.",
        sped_scaffold: "Provide a dialogue template with pre-placed quotation marks; student writes only the spoken words and dialogue tags.",
        prerequisite_skill_ids: ["language_writing_paragraph_structure", "language_writing_opinion_vs_informational"],
        next_skill_ids: ["language_writing_show_dont_tell"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 193-207 — narrative writing with dialogue",
        question_types: ["mc-text", "fib-auto", "hot-text-sentence", "drop-down-inline", "open-response-fib"]
    },

    {
        skill_id: "language_writing_informational_with_facts",
        subject: "language",
        strand: "writing",
        domain: "writing_genres",
        sub_domain: "informational_with_facts",
        developmental_band: "2-3",
        skill_statement: "Write an informational paragraph or short report that introduces a topic, presents 2–3 facts or details, and uses domain-specific vocabulary.",
        ccss_codes: ["W.2.2", "W.3.2a", "W.3.2b", "W.4.2b"],
        rit_band: "185-200",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["3.K.16 Write informational paragraphs (Grade 3)", "4.K.16 Informational writing with facts (Grade 4)"],
        sor_citations: [
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Pre-teach domain-specific vocabulary for the report topic; provide a fact-finding organizer with sentence frames.",
        sped_scaffold: "Provide 5 fact strips from a source text; student selects 2–3 most relevant facts and uses them as supporting sentences.",
        prerequisite_skill_ids: ["language_writing_supporting_details"],
        next_skill_ids: ["language_writing_paragraph_structure"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 185-200 — informational writing with facts",
        question_types: ["sort-into-bins", "mc-text", "sentence-build", "fib-auto", "open-response-fib"]
    },

    {
        skill_id: "language_writing_persuasive_techniques",
        subject: "language",
        strand: "writing",
        domain: "writing_genres",
        sub_domain: "persuasive_techniques",
        developmental_band: "4-5+",
        skill_statement: "Identify and use persuasive writing techniques: emotional appeals (pathos), appeals to authority or credibility (ethos), and logical evidence (logos).",
        ccss_codes: ["W.4.1a", "W.5.1a"],
        rit_band: "197-210",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["5.K.17 Persuasive writing techniques (Grade 5)"],
        sor_citations: [
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education.",
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass."
        ],
        ell_scaffold: "Use real-world examples (advertisement, letter to principal, persuasive editorial) to show each technique in context before labeling.",
        sped_scaffold: "Create a 3-category anchor chart (logos / ethos / pathos) with one color each; sort persuasive sentence examples into the correct category.",
        prerequisite_skill_ids: ["language_writing_opinion_with_reasons"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 197-210 — persuasive writing techniques",
        question_types: ["sort-into-bins", "mc-text", "two-button-binary", "fib-auto", "open-response-fib"]
    },

    {
        skill_id: "language_writing_show_dont_tell",
        subject: "language",
        strand: "writing",
        domain: "writing_craft",
        sub_domain: "show_dont_tell",
        developmental_band: "4-5+",
        skill_statement: "Revise 'telling' sentences into 'showing' sentences by using specific details, sensory language, and actions instead of generic statements about feelings or traits.",
        ccss_codes: ["W.4.3d", "W.5.3d"],
        rit_band: "195-210",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["4.K.18 Show, don't tell (Grade 4)", "5.K.18 Show, don't tell in narratives (Grade 5)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Contrast a telling sentence (She was scared) with a showing version (Her hands shook as she opened the door); use sensory imagery anchor chart.",
        sped_scaffold: "Provide the telling sentence; student rewrites only the action detail in a single sentence before combining into a full showing passage.",
        prerequisite_skill_ids: ["language_writing_narrative_with_dialogue"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 195-210 — descriptive language and show-don't-tell",
        question_types: ["mc-text", "hot-text-sentence", "two-button-binary", "fib-auto", "open-response-fib"]
    },

    {
        skill_id: "language_writing_descriptive_language",
        subject: "language",
        strand: "writing",
        domain: "writing_craft",
        sub_domain: "descriptive_language",
        developmental_band: "2-3",
        skill_statement: "Use descriptive language (sensory details, adjectives, precise verbs, figurative language) to paint a vivid picture for the reader.",
        ccss_codes: ["W.2.3", "W.3.3d", "W.4.3d"],
        rit_band: "188-203",
        rit_test: "Language Usage 2-12",
        rit_instructional_area: "Writing",
        ixl_skills: ["3.K.19 Use descriptive language (Grade 3)", "4.K.19 Descriptive writing (Grade 4)"],
        sor_citations: [
            "Hochman, J. C., & Wexler, N. (2017). The Writing Revolution: A Guide to Advancing Thinking Through Writing in All Subjects and Grades. Jossey-Bass.",
            "Graham, S., & Perin, D. (2007). Writing Next: Effective Strategies to Improve Writing of Adolescents in Middle and High School. Alliance for Excellent Education."
        ],
        ell_scaffold: "Use a 5-senses organizer; provide a word bank of sensory adjectives grouped by sense; model substituting vague words with precise descriptors.",
        sped_scaffold: "Give a 'boring sentence' and a word bank; student selects descriptors to upgrade the sentence before composing original sentences.",
        prerequisite_skill_ids: ["language_writing_supporting_details"],
        next_skill_ids: ["language_writing_show_dont_tell"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Writing RIT 188-203 — descriptive language in writing",
        question_types: ["mc-text", "sort-into-bins", "drop-down-inline", "fib-auto", "open-response-fib"]
    }

];

export default writingAtoms;
