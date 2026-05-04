/**
 * Literacy Quest — Reading / Comprehension: Literature skill atoms (Parts 5A-B)
 * Strands: story elements, character traits, theme, sequencing,
 *          compare/contrast, inference, point of view, summarizing, genres
 * @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]}
 */

/** @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]} */
const comprehensionLiteratureAtoms = [

    {
        skill_id: "reading_comp_lit_main_character",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "story_elements",
        sub_domain: "character_identification",
        developmental_band: "K-1",
        skill_statement: "Identify the main character(s) in a story and describe their role.",
        ccss_codes: ["RL.K.3", "RL.1.3", "RL.2.3"],
        rit_band: "151-165",
        rit_test: "Reading K-2",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["K.F.1 Identify the main character in a story (Kindergarten)", "1.F.1 Identify the main character (Grade 1)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA.",
            "Keene, E. O., & Zimmermann, S. (2007). Mosaic of Thought: The Power of Comprehension Strategy Instruction, 2nd ed. Heinemann."
        ],
        ell_scaffold: "Use picture-based story cards; pre-teach character names and provide an illustrated character chart for reference during reading.",
        sped_scaffold: "Highlight every mention of the main character's name in yellow; use a simple 'Who is the story about?' sentence frame.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_comp_lit_character_traits", "reading_comp_lit_setting_identify"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 151-165 — identifying characters, settings, and major events",
        question_types: ["mc-image", "mc-text", "tap-hotspot", "fib-auto"]
    },

    {
        skill_id: "reading_comp_lit_character_traits",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "story_elements",
        sub_domain: "character_traits",
        developmental_band: "2-3",
        skill_statement: "Describe a character's traits, motivations, and feelings using specific evidence from the text.",
        ccss_codes: ["RL.2.3", "RL.3.3", "RL.4.3"],
        rit_band: "180-198",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["2.F.3 Describe characters in a story (Grade 2)", "3.F.3 Describe characters using text evidence (Grade 3)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA.",
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse."
        ],
        ell_scaffold: "Provide a 'character traits word wall' with illustrations; have students choose from a supported list before generating their own.",
        sped_scaffold: "Use a T-chart: 'What did the character do/say?' → 'What does this tell us about them?'",
        prerequisite_skill_ids: ["reading_comp_lit_main_character"],
        next_skill_ids: ["reading_comp_lit_inference", "reading_comp_lit_theme"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 180-198 — describing characters, settings, events using details",
        question_types: ["mc-text", "mc-multi-select", "hot-text-sentence", "fib-auto", "claim-evidence"]
    },

    {
        skill_id: "reading_comp_lit_setting_identify",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "story_elements",
        sub_domain: "setting",
        developmental_band: "K-1",
        skill_statement: "Identify the setting (time and place) of a story and explain how it influences the plot or characters.",
        ccss_codes: ["RL.K.3", "RL.1.3", "RL.3.3"],
        rit_band: "158-172",
        rit_test: "Reading K-2",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["1.F.2 Identify the setting of a story (Grade 1)", "2.F.2 Describe the setting (Grade 2)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA."
        ],
        ell_scaffold: "Use illustrations and vocabulary pre-teaching to build setting-related schema; display 'Where? When? What does it look like?' question frame.",
        sped_scaffold: "Use a 2-box graphic organizer: 'Where' (place) and 'When' (time); fill with image + word support.",
        prerequisite_skill_ids: ["reading_comp_lit_main_character"],
        next_skill_ids: ["reading_comp_lit_story_sequence"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 158-172 — setting identification",
        question_types: ["mc-image", "mc-text", "tap-hotspot", "fib-auto"]
    },

    {
        skill_id: "reading_comp_lit_story_sequence",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "story_elements",
        sub_domain: "sequencing",
        developmental_band: "K-1",
        skill_statement: "Sequence the major events of a story in order (beginning, middle, end) using signal words (first, next, then, finally).",
        ccss_codes: ["RL.K.3", "RL.1.3", "RL.2.5"],
        rit_band: "160-178",
        rit_test: "Reading K-2",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["1.F.4 Identify the beginning, middle, and end (Grade 1)", "2.F.5 Sequence story events (Grade 2)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA."
        ],
        ell_scaffold: "Use sequence signal word cards in both English and Arabic; act out story events physically before written/digital sequencing.",
        sped_scaffold: "Use 3-panel storyboard strips; have students draw before writing to anchor sequence in visual memory.",
        prerequisite_skill_ids: ["reading_comp_lit_main_character", "reading_comp_lit_setting_identify"],
        next_skill_ids: ["reading_comp_lit_summarize", "reading_comp_lit_inference"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 160-178 — describing sequence of events",
        question_types: ["sequence-events", "mc-text", "sort-into-bins", "hot-text-sentence"]
    },

    {
        skill_id: "reading_comp_lit_theme",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "theme_central_message",
        sub_domain: "theme_identification",
        developmental_band: "4-5+",
        skill_statement: "Determine the theme or central message of a story, fable, or poem and explain how it is supported by key details.",
        ccss_codes: ["RL.3.2", "RL.4.2", "RL.5.2"],
        rit_band: "190-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["3.G.1 Determine the theme of a story (Grade 3)", "4.G.1 Identify the theme (Grade 4)", "5.G.1 Determine theme and summarize (Grade 5)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA.",
            "Keene, E. O., & Zimmermann, S. (2007). Mosaic of Thought: The Power of Comprehension Strategy Instruction, 2nd ed. Heinemann."
        ],
        ell_scaffold: "Distinguish 'topic' (what the story is about) from 'theme' (the lesson); use universal themes and translated fable examples.",
        sped_scaffold: "Use a 3-step theme routine: (1) What happened? (2) How did the character respond? (3) What lesson does this teach?",
        prerequisite_skill_ids: ["reading_comp_lit_character_traits", "reading_comp_lit_inference"],
        next_skill_ids: ["reading_comp_lit_summarize", "reading_comp_lit_compare_contrast"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 190-207 — theme and central message",
        question_types: ["mc-text", "hot-text-sentence", "claim-evidence", "fib-auto", "mc-multi-select"]
    },

    {
        skill_id: "reading_comp_lit_inference",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "inferencing",
        sub_domain: "character_feeling_inference",
        developmental_band: "2-3",
        skill_statement: "Make inferences about character feelings, motivations, or plot events using implicit text clues combined with background knowledge.",
        ccss_codes: ["RL.2.6", "RL.3.3", "RL.4.1"],
        rit_band: "183-200",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["2.F.6 Make inferences about characters (Grade 2)", "3.F.6 Use text evidence to support inferences (Grade 3)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA.",
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse."
        ],
        ell_scaffold: "Build background knowledge before reading; teach 'text + me = inference' using an anchor chart with visual equation.",
        sped_scaffold: "Use a 2-column inference chart: 'The text says...' | 'I think...' with sentence starters.",
        prerequisite_skill_ids: ["reading_comp_lit_character_traits", "reading_comp_lit_story_sequence"],
        next_skill_ids: ["reading_comp_lit_theme", "reading_comp_lit_point_of_view"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 183-200 — drawing inferences from text",
        question_types: ["mc-text", "hot-text-word", "claim-evidence", "fib-auto", "passage-mc-set"]
    },

    {
        skill_id: "reading_comp_lit_compare_contrast",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "compare_contrast",
        sub_domain: "characters_settings_events",
        developmental_band: "4-5+",
        skill_statement: "Compare and contrast two characters, settings, or events within a text or across two texts, citing specific textual evidence.",
        ccss_codes: ["RL.3.9", "RL.4.9", "RL.5.9"],
        rit_band: "193-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["3.G.5 Compare and contrast two characters (Grade 3)", "4.G.5 Compare and contrast in literary text (Grade 4)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA."
        ],
        ell_scaffold: "Use a Venn diagram with sentence starters: 'Both characters...' / 'Only [Character A]...' / 'Only [Character B]...'; pre-teach comparison signal words.",
        sped_scaffold: "Limit to 2 comparison points per session; use a color-coded T-chart (one color per character/setting).",
        prerequisite_skill_ids: ["reading_comp_lit_character_traits", "reading_comp_lit_inference"],
        next_skill_ids: ["reading_comp_lit_summarize"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 193-207 — compare/contrast in literary texts",
        question_types: ["mc-text", "sort-into-bins", "mc-multi-select", "hot-text-sentence", "fib-auto"]
    },

    {
        skill_id: "reading_comp_lit_point_of_view",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "point_of_view",
        sub_domain: "narrator_pov",
        developmental_band: "4-5+",
        skill_statement: "Identify the narrator's point of view (first-person, third-person limited, omniscient) and explain how it affects the story's presentation.",
        ccss_codes: ["RL.3.6", "RL.4.6", "RL.5.6"],
        rit_band: "193-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["3.G.4 Identify point of view (Grade 3)", "4.G.4 Compare first- and third-person narration (Grade 4)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA.",
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse."
        ],
        ell_scaffold: "Teach first/third person through pronoun use first (I/me vs. he/she/they); use short parallel passages in each POV to make the contrast explicit.",
        sped_scaffold: "Create a POV anchor chart with signal pronouns color-coded; have student highlight all pronouns before identifying POV.",
        prerequisite_skill_ids: ["reading_comp_lit_inference", "reading_comp_lit_character_traits"],
        next_skill_ids: ["reading_comp_lit_summarize"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 193-207 — point of view and narrator perspective",
        question_types: ["mc-text", "two-button-binary", "hot-text-word", "sort-into-bins", "fib-auto"]
    },

    {
        skill_id: "reading_comp_lit_summarize",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "summarizing",
        sub_domain: "swbst_summary",
        developmental_band: "4-5+",
        skill_statement: "Summarize the key events of a literary text using the SWBST frame (Somebody-Wanted-But-So-Then) without copying text verbatim.",
        ccss_codes: ["RL.3.2", "RL.4.2", "RL.5.2"],
        rit_band: "195-210",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["3.G.2 Summarize a story (Grade 3)", "4.G.2 Summarize literary text (Grade 4)", "5.G.2 Summarize (Grade 5)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA.",
            "Reutzel, D. R., & Cooter, R. B. (2019). Teaching Children to Read, 8th ed. Pearson."
        ],
        ell_scaffold: "SWBST frame is especially supportive for ELL students because it provides a scaffold for oral retell before written summary.",
        sped_scaffold: "Use SWBST sentence starters on a card; allow verbal summary before written version; accept bullet points as summary alternative.",
        prerequisite_skill_ids: ["reading_comp_lit_story_sequence", "reading_comp_lit_theme", "reading_comp_lit_inference"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 195-210 — summarizing literary text",
        question_types: ["sequence-events", "mc-text", "mc-multi-select", "fib-auto", "open-response-fib"]
    },

    {
        skill_id: "reading_comp_lit_genre_identify",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "genre",
        sub_domain: "genre_identification",
        developmental_band: "2-3",
        skill_statement: "Identify and distinguish common literary genres (realistic fiction, fantasy, fable, folktale, poetry, mystery, biography, historical fiction).",
        ccss_codes: ["RL.2.5", "RL.3.5", "RL.4.5"],
        rit_band: "180-196",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["2.F.7 Identify genres (Grade 2)", "3.F.7 Identify and compare genres (Grade 3)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA."
        ],
        ell_scaffold: "Connect to Arabic literary traditions (fables, folktales); use book-cover images and short passage excerpts paired with genre name cards.",
        sped_scaffold: "Create a class genre anchor chart with one representative book cover per genre; use a matching game to reinforce.",
        prerequisite_skill_ids: ["reading_comp_lit_main_character", "reading_comp_lit_setting_identify"],
        next_skill_ids: ["reading_comp_lit_theme", "reading_comp_lit_compare_contrast"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 180-196 — understanding genre characteristics",
        question_types: ["mc-text", "sort-into-bins", "two-button-binary", "match-pairs", "tap-hotspot"]
    },

    // ─── NEW ATOMS (+25) ─────────────────────────────────────────────────────

    {
        skill_id: "reading_comp_lit_setting_inference",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "story_elements",
        sub_domain: "setting_inference",
        developmental_band: "2-3",
        skill_statement: "Infer the setting of a story from descriptive details when time or place is not stated explicitly.",
        ccss_codes: ["RL.2.3", "RL.3.3", "RL.4.1"],
        rit_band: "178-194",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["2.F.2 Describe the setting (Grade 2)", "3.F.3 Describe characters using text evidence (Grade 3)"],
        sor_citations: [
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse.",
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."
        ],
        ell_scaffold: "Use culturally varied setting pictures to build schema; teach clue-word categories (weather, clothing, objects) as setting inference categories.",
        sped_scaffold: "Provide a 'Setting Detective' organizer: list clues from the text → what setting do the clues suggest?",
        prerequisite_skill_ids: ["reading_comp_lit_setting_identify", "reading_comp_lit_inference"],
        next_skill_ids: ["reading_comp_lit_character_motive"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 178-194 — inferring setting",
        question_types: ["mc-text", "hot-text-sentence", "tap-hotspot", "fib-auto", "claim-evidence"]
    },

    {
        skill_id: "reading_comp_lit_character_motive",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "story_elements",
        sub_domain: "character_motivation",
        developmental_band: "2-3",
        skill_statement: "Explain why a character acts the way they do (motivation) by connecting their actions to their wants, needs, or feelings shown in the text.",
        ccss_codes: ["RL.2.3", "RL.3.3", "RL.4.3"],
        rit_band: "181-198",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["3.F.3 Describe characters using text evidence (Grade 3)", "4.F.3 Character motivations (Grade 4)"],
        sor_citations: [
            "Keene, E. O., & Zimmermann, S. (2007). Mosaic of Thought: The Power of Comprehension Strategy Instruction, 2nd ed. Heinemann.",
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."
        ],
        ell_scaffold: "Use a motivation anchor chart with categories (wants, fears, goals, values); connect to familiar characters from L1 folktales.",
        sped_scaffold: "Use a 3-box graphic organizer: What did the character do? → Why did they do it? → What does the text say?",
        prerequisite_skill_ids: ["reading_comp_lit_character_traits", "reading_comp_lit_inference"],
        next_skill_ids: ["reading_comp_lit_character_change"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 181-198 — character motivation",
        question_types: ["mc-text", "hot-text-sentence", "claim-evidence", "fib-auto", "mc-multi-select"]
    },

    {
        skill_id: "reading_comp_lit_character_change",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "story_elements",
        sub_domain: "character_development",
        developmental_band: "4-5+",
        skill_statement: "Describe how a character changes across the beginning, middle, and end of a story and explain what causes the change.",
        ccss_codes: ["RL.3.3", "RL.4.3", "RL.5.3"],
        rit_band: "190-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["4.F.3 Character motivations (Grade 4)", "5.F.3 Character development (Grade 5)"],
        sor_citations: [
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse.",
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."
        ],
        ell_scaffold: "Use a before/after T-chart with sentence frames: 'At the beginning, [character] was ___ because ___. At the end, [character] became ___ because ___.'",
        sped_scaffold: "Use a 3-frame comic strip: Beginning trait → Turning event → Changed trait; fill with images and key phrases.",
        prerequisite_skill_ids: ["reading_comp_lit_character_motive", "reading_comp_lit_story_sequence"],
        next_skill_ids: ["reading_comp_lit_theme"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 190-207 — character development and change",
        question_types: ["sequence-events", "mc-text", "hot-text-sentence", "fib-auto", "claim-evidence"]
    },

    {
        skill_id: "reading_comp_lit_character_point_of_view",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "story_elements",
        sub_domain: "character_perspective",
        developmental_band: "4-5+",
        skill_statement: "Compare the perspectives of two or more characters in the same story, explaining how each character's point of view shapes their reactions to events.",
        ccss_codes: ["RL.4.6", "RL.5.6"],
        rit_band: "193-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["4.G.4 Compare first- and third-person narration (Grade 4)", "5.F.6 Character perspectives (Grade 5)"],
        sor_citations: [
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse.",
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."
        ],
        ell_scaffold: "Use a split-page organizer (Character A's view | Character B's view) with sentence starters; clarify that different perspectives on same event are valid.",
        sped_scaffold: "Focus on one key scene; use speech bubbles to show what each character is thinking vs. saying.",
        prerequisite_skill_ids: ["reading_comp_lit_point_of_view", "reading_comp_lit_character_motive"],
        next_skill_ids: ["reading_comp_lit_compare_contrast"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 193-207 — comparing character perspectives",
        question_types: ["sort-into-bins", "mc-text", "hot-text-sentence", "fib-auto", "claim-evidence"]
    },

    {
        skill_id: "reading_comp_lit_problem",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "plot",
        sub_domain: "problem",
        developmental_band: "K-1",
        skill_statement: "Identify the central problem or challenge the main character faces in a story.",
        ccss_codes: ["RL.K.3", "RL.1.3", "RL.2.3"],
        rit_band: "158-173",
        rit_test: "Reading K-2",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["1.F.3 Identify the problem in a story (Grade 1)", "2.F.4 Identify the problem and solution (Grade 2)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA.",
            "Keene, E. O., & Zimmermann, S. (2007). Mosaic of Thought, 2nd ed. Heinemann."
        ],
        ell_scaffold: "Use the sentence frame: 'The problem in this story is ___'; connect to universal story problem types (wants something, in danger, misunderstanding).",
        sped_scaffold: "Use a 2-box graphic organizer: Character | Problem; fill with a drawing before writing.",
        prerequisite_skill_ids: ["reading_comp_lit_main_character"],
        next_skill_ids: ["reading_comp_lit_solution"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 158-173 — problem and solution",
        question_types: ["mc-text", "fib-auto", "mc-image", "hot-text-sentence", "tap-hotspot"]
    },

    {
        skill_id: "reading_comp_lit_solution",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "plot",
        sub_domain: "solution",
        developmental_band: "K-1",
        skill_statement: "Identify how the main character solves the central problem of a story.",
        ccss_codes: ["RL.K.3", "RL.1.3", "RL.2.3"],
        rit_band: "160-175",
        rit_test: "Reading K-2",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["2.F.4 Identify the problem and solution (Grade 2)", "1.F.3 Identify the problem in a story (Grade 1)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."
        ],
        ell_scaffold: "Pair with a problem/solution graphic organizer; use signal words 'finally' and 'in the end' to locate the solution in the text.",
        sped_scaffold: "Connect problem and solution boxes with an arrow; write the linking word that signals the solution (finally, so, in the end).",
        prerequisite_skill_ids: ["reading_comp_lit_problem"],
        next_skill_ids: ["reading_comp_lit_conflict_internal", "reading_comp_lit_story_sequence"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 160-175 — identifying solutions",
        question_types: ["mc-text", "fib-auto", "hot-text-sentence", "tap-hotspot", "sequence-events"]
    },

    {
        skill_id: "reading_comp_lit_conflict_internal",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "plot",
        sub_domain: "conflict_internal",
        developmental_band: "4-5+",
        skill_statement: "Distinguish internal conflict (a character's struggle within themselves — with fear, guilt, decision-making) from external conflict.",
        ccss_codes: ["RL.4.3", "RL.5.3"],
        rit_band: "193-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["4.F.5 Types of conflict (Grade 4)", "5.F.5 Internal and external conflict (Grade 5)"],
        sor_citations: [
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse.",
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."
        ],
        ell_scaffold: "Use a character thought-bubble visual to make internal conflict visible; connect to universal emotional struggles (fear, jealousy, doubt).",
        sped_scaffold: "Sort conflict examples into two bins: 'character vs. self' vs. 'character vs. something outside'; use picture-scenario cards.",
        prerequisite_skill_ids: ["reading_comp_lit_problem", "reading_comp_lit_character_motive"],
        next_skill_ids: ["reading_comp_lit_conflict_external", "reading_comp_lit_climax"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 193-207 — types of conflict",
        question_types: ["two-button-binary", "sort-into-bins", "mc-text", "hot-text-sentence", "fib-auto"]
    },

    {
        skill_id: "reading_comp_lit_conflict_external",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "plot",
        sub_domain: "conflict_external",
        developmental_band: "4-5+",
        skill_statement: "Identify external conflicts in a story: character vs. character, character vs. nature, character vs. society, and character vs. technology/machine.",
        ccss_codes: ["RL.4.3", "RL.5.3"],
        rit_band: "193-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["4.F.5 Types of conflict (Grade 4)", "5.F.5 Internal and external conflict (Grade 5)"],
        sor_citations: [
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse.",
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."
        ],
        ell_scaffold: "Use a conflict-type anchor chart with a picture for each type; provide L1 conflict vocabulary to scaffold before English labeling.",
        sped_scaffold: "Reduce to two external conflict types per lesson before introducing all four; use scenario sort cards.",
        prerequisite_skill_ids: ["reading_comp_lit_conflict_internal"],
        next_skill_ids: ["reading_comp_lit_climax"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 193-207 — external conflict types",
        question_types: ["sort-into-bins", "mc-text", "two-button-binary", "fib-auto", "tap-hotspot"]
    },

    {
        skill_id: "reading_comp_lit_climax",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "plot",
        sub_domain: "climax",
        developmental_band: "4-5+",
        skill_statement: "Identify the climax of a story — the turning point of highest tension where the central conflict reaches its peak.",
        ccss_codes: ["RL.4.3", "RL.5.3"],
        rit_band: "195-208",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["4.F.4 Identify the climax of a story (Grade 4)", "5.F.4 Plot: climax and resolution (Grade 5)"],
        sor_citations: [
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse.",
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."
        ],
        ell_scaffold: "Use a story mountain or tension arc graphic; mark rising action, peak (climax), and falling action on the mountain shape.",
        sped_scaffold: "Ask: 'When does the story feel the most exciting or scary?' — that is usually the climax; narrow to two candidate passages and choose.",
        prerequisite_skill_ids: ["reading_comp_lit_conflict_external", "reading_comp_lit_story_sequence"],
        next_skill_ids: ["reading_comp_lit_resolution"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 195-208 — plot structure and climax",
        question_types: ["tap-hotspot", "mc-text", "sequence-events", "hot-text-sentence", "fib-auto"]
    },

    {
        skill_id: "reading_comp_lit_resolution",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "plot",
        sub_domain: "resolution",
        developmental_band: "4-5+",
        skill_statement: "Identify the resolution of a story — how the conflict is resolved after the climax — and explain whether it is satisfying or ambiguous.",
        ccss_codes: ["RL.4.3", "RL.5.3"],
        rit_band: "195-210",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["5.F.4 Plot: climax and resolution (Grade 5)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA.",
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse."
        ],
        ell_scaffold: "Use the story mountain graphic; describe resolution as 'what happened after the peak — how did everything settle down?'",
        sped_scaffold: "Provide a resolution sentence frame: 'At the end, the problem was solved when ___. Now the character feels/can ___.'",
        prerequisite_skill_ids: ["reading_comp_lit_climax"],
        next_skill_ids: ["reading_comp_lit_summarize"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 195-210 — plot resolution",
        question_types: ["mc-text", "hot-text-sentence", "fib-auto", "sequence-events", "tap-hotspot"]
    },

    {
        skill_id: "reading_comp_lit_theme_supporting",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "theme_central_message",
        sub_domain: "theme_evidence",
        developmental_band: "4-5+",
        skill_statement: "Cite specific details from the text (character actions, events, dialogue, resolution) that support a stated theme.",
        ccss_codes: ["RL.4.2", "RL.5.2"],
        rit_band: "193-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["4.G.1 Identify the theme (Grade 4)", "5.G.1 Determine theme and summarize (Grade 5)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA.",
            "Fisher, D., & Frey, N. (2014). Close Reading and Writing from Sources. IRA."
        ],
        ell_scaffold: "Teach the difference between 'topic' (one word) and 'theme' (a lesson sentence); require at least two text details before accepting a theme claim.",
        sped_scaffold: "Use a 3-step theme-evidence organizer: Theme → Evidence 1 → Evidence 2; highlight the evidence passages in the text before writing.",
        prerequisite_skill_ids: ["reading_comp_lit_theme"],
        next_skill_ids: ["reading_comp_lit_theme_universal"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 193-207 — supporting theme with evidence",
        question_types: ["claim-evidence", "hot-text-sentence", "mc-text", "fib-auto", "mc-multi-select"]
    },

    {
        skill_id: "reading_comp_lit_theme_universal",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "theme_central_message",
        sub_domain: "universal_theme",
        developmental_band: "4-5+",
        skill_statement: "Recognize that themes in literature are universal (e.g., 'Honesty is the best policy', 'Courage helps us overcome fear') and connect the same theme across multiple texts or genres.",
        ccss_codes: ["RL.4.9", "RL.5.9"],
        rit_band: "198-212",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["5.G.3 Compare themes across texts (Grade 5)"],
        sor_citations: [
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse.",
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."
        ],
        ell_scaffold: "Use a bilingual universal-theme chart; show how the same theme (e.g., perseverance) appears in Arabic folktales and English children's literature.",
        sped_scaffold: "Provide a list of 5–6 universal themes as options; student matches the theme to the story rather than generating it independently.",
        prerequisite_skill_ids: ["reading_comp_lit_theme_supporting"],
        next_skill_ids: ["reading_comp_lit_lesson_or_moral"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 198-212 — universal themes across texts",
        question_types: ["mc-text", "sort-into-bins", "match-pairs", "fib-auto", "mc-multi-select"]
    },

    {
        skill_id: "reading_comp_lit_lesson_or_moral",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "theme_central_message",
        sub_domain: "lesson_moral",
        developmental_band: "2-3",
        skill_statement: "Identify the lesson or moral of a fable, folktale, or short story and explain which story events communicate that lesson.",
        ccss_codes: ["RL.2.2", "RL.3.2"],
        rit_band: "180-196",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["2.F.8 Identify the lesson or moral (Grade 2)", "3.G.1 Determine the theme of a story (Grade 3)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA.",
            "Keene, E. O., & Zimmermann, S. (2007). Mosaic of Thought, 2nd ed. Heinemann."
        ],
        ell_scaffold: "Use Aesop's Fables or culturally familiar fables with explicit morals stated at the end; then progress to morals that must be inferred.",
        sped_scaffold: "After reading, state 3 possible morals; student selects the one that best fits the story using evidence from the events.",
        prerequisite_skill_ids: ["reading_comp_lit_genre_identify"],
        next_skill_ids: ["reading_comp_lit_theme"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 180-196 — lesson or moral from fable/folktale",
        question_types: ["mc-text", "hot-text-sentence", "fib-auto", "two-button-binary", "claim-evidence"]
    },

    {
        skill_id: "reading_comp_lit_realistic_fiction",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "genre",
        sub_domain: "realistic_fiction",
        developmental_band: "2-3",
        skill_statement: "Identify the characteristics of realistic fiction (could happen in real life, believable characters and settings, no magic or fantasy elements).",
        ccss_codes: ["RL.2.5", "RL.3.5"],
        rit_band: "178-193",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["2.F.7 Identify genres (Grade 2)", "3.F.7 Identify and compare genres (Grade 3)"],
        sor_citations: ["Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."],
        ell_scaffold: "Use realistic fiction set in everyday school or family settings; connect to personal narratives students know from L1 literacy.",
        sped_scaffold: "Teach one genre feature at a time using a feature checklist (real-world setting? believable problem? no magic?).",
        prerequisite_skill_ids: ["reading_comp_lit_genre_identify"],
        next_skill_ids: ["reading_comp_lit_fantasy"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 178-193 — genre: realistic fiction",
        question_types: ["two-button-binary", "sort-into-bins", "mc-text", "fib-auto", "tap-hotspot"]
    },

    {
        skill_id: "reading_comp_lit_fantasy",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "genre",
        sub_domain: "fantasy",
        developmental_band: "K-1",
        skill_statement: "Identify the characteristics of fantasy stories (magical elements, impossible events, imaginary creatures or worlds).",
        ccss_codes: ["RL.K.5", "RL.1.5", "RL.2.5"],
        rit_band: "165-180",
        rit_test: "Reading K-2",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["1.F.5 Distinguish real and make-believe (Grade 1)", "2.F.7 Identify genres (Grade 2)"],
        sor_citations: ["Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."],
        ell_scaffold: "Use pictures to contrast a realistic scene vs. a fantasy scene; teach key fantasy signal words (magic, suddenly, transformed, wizard).",
        sped_scaffold: "Use a two-column real/fantasy sort with picture cards before text-based tasks.",
        prerequisite_skill_ids: ["reading_comp_lit_main_character"],
        next_skill_ids: ["reading_comp_lit_genre_identify"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 165-180 — real vs. fantasy",
        question_types: ["two-button-binary", "sort-into-bins", "mc-image", "tap-hotspot", "mc-text"]
    },

    {
        skill_id: "reading_comp_lit_historical_fiction",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "genre",
        sub_domain: "historical_fiction",
        developmental_band: "4-5+",
        skill_statement: "Identify the characteristics of historical fiction (set in a real historical period, fictional characters who interact with historical events or contexts).",
        ccss_codes: ["RL.4.5", "RL.5.5"],
        rit_band: "190-205",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["4.F.7 Identify genres: historical fiction (Grade 4)"],
        sor_citations: ["Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."],
        ell_scaffold: "Build historical context knowledge before reading; clarify that the characters are fictional but the setting is real history.",
        sped_scaffold: "Provide a brief background information sheet about the historical period before the student reads the story.",
        prerequisite_skill_ids: ["reading_comp_lit_genre_identify"],
        next_skill_ids: ["reading_comp_lit_compare_contrast"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 190-205 — genre: historical fiction",
        question_types: ["mc-text", "two-button-binary", "sort-into-bins", "fib-auto", "tap-hotspot"]
    },

    {
        skill_id: "reading_comp_lit_fable",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "genre",
        sub_domain: "fable",
        developmental_band: "2-3",
        skill_statement: "Identify the characteristics of a fable (short story with animal characters that teach a lesson or moral).",
        ccss_codes: ["RL.2.5", "RL.3.5"],
        rit_band: "177-192",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["2.F.7 Identify genres (Grade 2)", "3.F.7 Identify and compare genres (Grade 3)"],
        sor_citations: ["Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."],
        ell_scaffold: "Use Aesop's Fables in bilingual editions; connect to familiar Arabic animal fables (Kalila wa Dimna) to build schema.",
        sped_scaffold: "Provide a fable feature checklist: animal characters? short? moral stated at the end?",
        prerequisite_skill_ids: ["reading_comp_lit_lesson_or_moral"],
        next_skill_ids: ["reading_comp_lit_genre_identify"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 177-192 — genre: fable",
        question_types: ["two-button-binary", "mc-text", "sort-into-bins", "fib-auto", "tap-hotspot"]
    },

    {
        skill_id: "reading_comp_lit_poetry_rhyme",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "genre",
        sub_domain: "poetry_rhyme",
        developmental_band: "K-1",
        skill_statement: "Recognize rhyming poems: identify the rhyme scheme, describe the rhythm, and explain how rhyme contributes to the poem's meaning or feel.",
        ccss_codes: ["RL.K.5", "RL.1.5", "RL.2.4"],
        rit_band: "158-175",
        rit_test: "Reading K-2",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["K.F.2 Identify rhyming words in poems (Kindergarten)", "1.F.6 Identify features of poetry (Grade 1)"],
        sor_citations: ["Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."],
        ell_scaffold: "Perform the poem chorally first to build familiarity; highlight rhyming word pairs with the same color.",
        sped_scaffold: "Mark rhyming words with matching colored dots before reading; read line by line pausing at end-of-line rhymes.",
        prerequisite_skill_ids: ["reading_comp_lit_main_character"],
        next_skill_ids: ["reading_comp_lit_poetry_free_verse"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 158-175 — poetry: rhyme scheme",
        question_types: ["mc-text", "tap-hotspot", "sort-into-bins", "fib-auto", "two-button-binary"]
    },

    {
        skill_id: "reading_comp_lit_poetry_free_verse",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "genre",
        sub_domain: "poetry_free_verse",
        developmental_band: "4-5+",
        skill_statement: "Recognize free verse poetry (no regular rhyme or meter), identify its use of line breaks and imagery, and explain how structure contributes to meaning.",
        ccss_codes: ["RL.4.5", "RL.5.5"],
        rit_band: "193-207",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["4.F.8 Identify features of free verse poetry (Grade 4)", "5.F.8 Analyze poetry structure (Grade 5)"],
        sor_citations: ["Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."],
        ell_scaffold: "Show that free verse poetry can look like a picture on the page; focus on imagery and sensory language first before structural analysis.",
        sped_scaffold: "Provide a guided annotation template: circle imagery, underline strong word choice, box line-break choices.",
        prerequisite_skill_ids: ["reading_comp_lit_poetry_rhyme", "reading_comp_lit_genre_identify"],
        next_skill_ids: ["reading_comp_lit_theme"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 193-207 — poetry: free verse analysis",
        question_types: ["mc-text", "hot-text-sentence", "tap-hotspot", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "reading_comp_lit_swbst_summary",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "summarizing",
        sub_domain: "somebody_wanted_but_so_then",
        developmental_band: "2-3",
        skill_statement: "Use the SWBST frame (Somebody-Wanted-But-So-Then) to plan and write a concise summary of a literary text.",
        ccss_codes: ["RL.2.3", "RL.3.2", "RL.4.2"],
        rit_band: "185-200",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["3.G.2 Summarize a story (Grade 3)", "4.G.2 Summarize literary text (Grade 4)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA.",
            "Reutzel, D. R., & Cooter, R. B. (2019). Teaching Children to Read, 8th ed. Pearson."
        ],
        ell_scaffold: "Provide a fillable SWBST graphic organizer with sentence starters; oral rehearsal before written summary.",
        sped_scaffold: "Reduce to 3-4 word answers per SWBST slot during practice; expand to full sentences after concept mastery.",
        prerequisite_skill_ids: ["reading_comp_lit_story_sequence", "reading_comp_lit_problem"],
        next_skill_ids: ["reading_comp_lit_summarize"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 185-200 — summarizing with SWBST frame",
        question_types: ["sequence-events", "fib-auto", "mc-text", "open-response-fib", "sort-into-bins"]
    },

    {
        skill_id: "reading_comp_lit_cite_text_evidence",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "text_evidence",
        sub_domain: "citing_literary_evidence",
        developmental_band: "4-5+",
        skill_statement: "Cite specific text evidence (a quote, paraphrase, or scene reference) from a literary text to support an interpretation or claim.",
        ccss_codes: ["RL.4.1", "RL.5.1"],
        rit_band: "195-210",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["4.F.1 Cite text evidence in literary texts (Grade 4)", "5.F.1 Cite text evidence (Grade 5)"],
        sor_citations: [
            "Fisher, D., & Frey, N. (2014). Close Reading and Writing from Sources. IRA.",
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA."
        ],
        ell_scaffold: "Teach citation starters: 'According to the story...' / 'In the text it says...' / 'On page ___, the author writes...'; model with annotated passages.",
        sped_scaffold: "Use a highlight-and-cite routine: highlight the evidence in yellow, then write or dictate the claim it supports.",
        prerequisite_skill_ids: ["reading_comp_lit_inference", "reading_comp_lit_theme"],
        next_skill_ids: ["reading_comp_lit_compare_two_stories"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 195-210 — citing evidence in literary text",
        question_types: ["claim-evidence", "hot-text-sentence", "mc-text", "fib-auto", "passage-mc-set"]
    },

    {
        skill_id: "reading_comp_lit_compare_two_stories",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "compare_contrast",
        sub_domain: "compare_two_stories",
        developmental_band: "4-5+",
        skill_statement: "Compare and contrast the themes, characters, settings, or plots of two different stories or versions of the same story, citing evidence from both texts.",
        ccss_codes: ["RL.4.9", "RL.5.9"],
        rit_band: "198-212",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["4.G.5 Compare and contrast in literary text (Grade 4)", "5.G.5 Compare themes across texts (Grade 5)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA.",
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse."
        ],
        ell_scaffold: "Pre-read both stories separately; use a 3-column chart (Story 1 / Both / Story 2) with bilingual labels for the comparison task.",
        sped_scaffold: "Color-code annotations by source (blue = Story 1, green = Story 2); limit comparison to one element (e.g., theme only) per session.",
        prerequisite_skill_ids: ["reading_comp_lit_cite_text_evidence", "reading_comp_lit_compare_contrast"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Literary Text RIT 198-212 — comparing two literary texts",
        question_types: ["sort-into-bins", "mc-multi-select", "hot-text-sentence", "fib-auto", "claim-evidence"]
    },

    // ============ ETC-SOURCED NEW ATOM (added per etc-digital-replica-synthesis.md §8) ===========

    // ETC Type 10 — Yes-No with sentence (inferential yes/no at sentence level, not passage level)
    {
        skill_id: "reading_comprehension_yes_no_sentence",
        subject: "reading",
        strand: "comprehension_lit",
        domain: "inference",
        sub_domain: "yes_no_sentence",
        developmental_band: "1",
        skill_statement: "Answer inferential yes/no questions about simple picture-supported literary sentences: 'Can a cat sit on a mat?' — applies world knowledge to a decodable sentence.",
        ccss_codes: ["RL.1.1", "RI.1.1"],
        rit_band: "161-170",
        rit_test: "Reading K-2",
        rit_instructional_area: "Literary Text",
        ixl_skills: ["1.F.1 Identify the main character in a story (Grade 1)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. IRA.",
            "Cain, K., Oakhill, J., & Bryant, P. (2004). Children's reading comprehension ability: Concurrent prediction by working memory, verbal ability, and component skills. Journal of Educational Psychology, 96(1), 31–42."
        ],
        ell_scaffold: "Pair sentence with picture; audio support; yes/no response requires minimal language production — good entry point for ELL students.",
        sped_scaffold: "Use picture card + sentence card; student points to yes/no; start with world-knowledge certainties before moving to inferential items.",
        prerequisite_skill_ids: ["reading_phonics_short_vowels_mixed"],
        next_skill_ids: ["reading_comp_lit_main_character"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "ETC Books 2-8 yes/no pages (Type 10); NWEA Learning Continuum RIT 161-170",
        question_types: ["two-button-binary", "mc-text", "mc-image"],
        etc_book: "2",
    }

];

export default comprehensionLiteratureAtoms;
