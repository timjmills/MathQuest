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
    }

];

export default comprehensionLiteratureAtoms;
