/**
 * Literacy Quest — Reading / Comprehension: Informational skill atoms (Parts 5C-D)
 * Strands: main idea + supporting details, text features, text structure,
 *          author's purpose PIE, fact vs opinion, citing evidence, paired passages
 * @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]}
 */

/** @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]} */
const comprehensionInformationalAtoms = [

    {
        skill_id: "reading_comp_info_main_idea",
        subject: "reading",
        strand: "comprehension_info",
        domain: "main_idea",
        sub_domain: "main_idea_identification",
        developmental_band: "2-3",
        skill_statement: "Identify the main idea of an informational paragraph or short passage and distinguish it from supporting details.",
        ccss_codes: ["RI.2.2", "RI.3.2", "RI.4.2"],
        rit_band: "183-200",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Informational Text",
        ixl_skills: ["2.H.1 Find the main idea (Grade 2)", "3.H.1 Identify the main idea and key details (Grade 3)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA.",
            "Reutzel, D. R., & Cooter, R. B. (2019). Teaching Children to Read, 8th ed. Pearson."
        ],
        ell_scaffold: "Use the 'umbrella' metaphor: the main idea is the umbrella, details are what it covers; provide Arabic-labeled graphic organizers.",
        sped_scaffold: "Use the 'parking lot' strategy: write supporting details on sticky notes and park them under the main idea sentence.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_comp_info_supporting_details", "reading_comp_info_citing_evidence"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Informational Text RIT 183-200 — main idea and key details",
        question_types: ["passage-mc-set", "hot-text-sentence", "mc-multi-select", "fib-auto", "sort-into-bins"]
    },

    {
        skill_id: "reading_comp_info_supporting_details",
        subject: "reading",
        strand: "comprehension_info",
        domain: "main_idea",
        sub_domain: "supporting_details",
        developmental_band: "2-3",
        skill_statement: "Identify details that support the main idea of an informational paragraph, including distinguishing on-topic from off-topic sentences.",
        ccss_codes: ["RI.2.2", "RI.3.2", "RI.4.2"],
        rit_band: "181-198",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Informational Text",
        ixl_skills: ["2.H.2 Identify supporting details (Grade 2)", "3.H.2 Supporting details (Grade 3)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA."
        ],
        ell_scaffold: "Model the difference between main idea and detail using a simple T-chart with L1 labels; use think-aloud during first guided practice.",
        sped_scaffold: "Provide sentence strips with one main idea and 3 details; have student sort before answering digital items.",
        prerequisite_skill_ids: ["reading_comp_info_main_idea"],
        next_skill_ids: ["reading_comp_info_citing_evidence"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Informational Text RIT 181-198 — key details that support main idea",
        question_types: ["mc-text", "mc-multi-select", "hot-text-sentence", "sort-into-bins", "fib-auto"]
    },

    {
        skill_id: "reading_comp_info_text_features",
        subject: "reading",
        strand: "comprehension_info",
        domain: "text_features",
        sub_domain: "informational_text_features",
        developmental_band: "2-3",
        skill_statement: "Use text features (headings, subheadings, captions, bold print, diagrams, tables of contents, glossaries, indexes) to locate and interpret information.",
        ccss_codes: ["RI.1.5", "RI.2.5", "RI.3.5"],
        rit_band: "178-194",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Informational Text",
        ixl_skills: ["2.H.4 Identify text features (Grade 2)", "3.H.4 Use text features to locate information (Grade 3)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA.",
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse."
        ],
        ell_scaffold: "Display a 'text features menu' poster with visual examples; pre-teach each feature name with an image before encountering it in a passage.",
        sped_scaffold: "Limit to 3 text features per session; use a text features scavenger hunt with a labeled checklist.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_comp_info_text_structure_sequence", "reading_comp_info_main_idea"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Informational Text RIT 178-194 — text features in informational texts",
        question_types: ["tap-hotspot", "mc-text", "fib-auto", "sort-into-bins", "mc-multi-select"]
    },

    {
        skill_id: "reading_comp_info_text_structure_sequence",
        subject: "reading",
        strand: "comprehension_info",
        domain: "text_structure",
        sub_domain: "sequence_chronological",
        developmental_band: "2-3",
        skill_statement: "Identify sequential/chronological text structure in informational text and use signal words (first, next, then, finally, before, after) to understand the order of events or steps.",
        ccss_codes: ["RI.2.3", "RI.3.8", "RI.4.5"],
        rit_band: "181-196",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Informational Text",
        ixl_skills: ["2.H.5 Identify text structure: sequence (Grade 2)", "3.H.5 Sequence text structure and signal words (Grade 3)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA."
        ],
        ell_scaffold: "Create a signal-word T-chart in English and Arabic; use how-to procedural texts as the easiest genre for ELL sequence work.",
        sped_scaffold: "Use numbered storyboard frames for procedural texts; limit to 3-step sequences before advancing to 4-5 steps.",
        prerequisite_skill_ids: ["reading_comp_info_text_features"],
        next_skill_ids: ["reading_comp_info_text_structure_compare_contrast", "reading_comp_info_main_idea"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Informational Text RIT 181-196 — text structure: sequence",
        question_types: ["sequence-events", "mc-text", "hot-text-word", "sort-into-bins", "fib-auto"]
    },

    {
        skill_id: "reading_comp_info_text_structure_compare_contrast",
        subject: "reading",
        strand: "comprehension_info",
        domain: "text_structure",
        sub_domain: "compare_contrast_structure",
        developmental_band: "4-5+",
        skill_statement: "Identify compare-and-contrast text structure using signal words (both, however, similarly, in contrast, on the other hand) and represent the structure using a graphic organizer.",
        ccss_codes: ["RI.3.8", "RI.4.5", "RI.5.5"],
        rit_band: "190-205",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Informational Text",
        ixl_skills: ["4.H.6 Identify text structure: compare and contrast (Grade 4)", "5.H.6 Compare-contrast text structure (Grade 5)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA."
        ],
        ell_scaffold: "Post a bilingual signal-word chart; use Venn diagrams as a visual scaffold before requiring students to write comparisons independently.",
        sped_scaffold: "Color-code text: highlight similarities in yellow, differences in two contrasting colors; use pre-filled Venn diagram with one section completed.",
        prerequisite_skill_ids: ["reading_comp_info_text_structure_sequence"],
        next_skill_ids: ["reading_comp_info_authors_purpose_pie", "reading_comp_info_paired_passages"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Informational Text RIT 190-205 — text structure: compare and contrast",
        question_types: ["sort-into-bins", "mc-text", "hot-text-word", "fib-auto", "mc-multi-select"]
    },

    {
        skill_id: "reading_comp_info_authors_purpose_pie",
        subject: "reading",
        strand: "comprehension_info",
        domain: "authors_purpose",
        sub_domain: "pie_persuade_inform_entertain",
        developmental_band: "4-5+",
        skill_statement: "Identify the author's purpose as Persuade, Inform, or Entertain (PIE) and explain text evidence that supports that determination.",
        ccss_codes: ["RI.3.6", "RI.4.6", "RI.5.6"],
        rit_band: "190-205",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Informational Text",
        ixl_skills: ["3.H.7 Determine author's purpose (Grade 3)", "4.H.7 Author's purpose: PIE (Grade 4)", "5.H.7 Identify and analyze author's purpose (Grade 5)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA.",
            "Harvey, S., & Goudvis, A. (2007). Strategies That Work: Teaching Comprehension for Understanding and Engagement, 2nd ed. Stenhouse."
        ],
        ell_scaffold: "Use the PIE mnemonic with a visual pie graphic; show short translated examples of each genre to build schema for purpose.",
        sped_scaffold: "Teach each purpose separately across 3 sessions before asking students to distinguish among all three.",
        prerequisite_skill_ids: ["reading_comp_info_main_idea", "reading_comp_info_supporting_details"],
        next_skill_ids: ["reading_comp_info_fact_opinion", "reading_comp_info_citing_evidence"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Informational Text RIT 190-205 — author's purpose",
        question_types: ["mc-text", "hot-text-sentence", "fib-auto", "claim-evidence", "tap-hotspot"]
    },

    {
        skill_id: "reading_comp_info_fact_opinion",
        subject: "reading",
        strand: "comprehension_info",
        domain: "fact_opinion",
        sub_domain: "fact_vs_opinion",
        developmental_band: "4-5+",
        skill_statement: "Distinguish between statements of fact (verifiable, objective) and statements of opinion (belief, judgment) in informational text.",
        ccss_codes: ["RI.3.6", "RI.4.6", "RI.5.6"],
        rit_band: "188-203",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Informational Text",
        ixl_skills: ["3.H.8 Identify fact and opinion (Grade 3)", "4.H.8 Distinguish facts from opinions (Grade 4)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA."
        ],
        ell_scaffold: "Teach opinion signal words (I believe, in my opinion, should, must, the best) in both languages; use local examples relevant to Qatar context.",
        sped_scaffold: "Use a 'Can you prove it?' test: if yes = fact; if it's someone's view = opinion. Practice with concrete, obvious examples first.",
        prerequisite_skill_ids: ["reading_comp_info_authors_purpose_pie"],
        next_skill_ids: ["reading_comp_info_citing_evidence"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Informational Text RIT 188-203 — distinguishing fact from opinion",
        question_types: ["two-button-binary", "sort-into-bins", "mc-text", "hot-text-sentence", "tap-hotspot"]
    },

    {
        skill_id: "reading_comp_info_citing_evidence",
        subject: "reading",
        strand: "comprehension_info",
        domain: "text_evidence",
        sub_domain: "citing_evidence",
        developmental_band: "4-5+",
        skill_statement: "Cite specific text evidence (a sentence, detail, or example from the passage) to support an answer, inference, or claim about an informational text.",
        ccss_codes: ["RI.4.1", "RI.5.1"],
        rit_band: "195-210",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Informational Text",
        ixl_skills: ["4.H.1 Cite text evidence in informational texts (Grade 4)", "5.H.1 Cite text evidence (Grade 5)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA.",
            "Fisher, D., & Frey, N. (2014). Close Reading and Writing from Sources. IRA."
        ],
        ell_scaffold: "Teach citation sentence frames: 'According to the text...' / 'The author states...' / 'In paragraph ___, it says...'; model with an annotated passage.",
        sped_scaffold: "Use a 'highlight and cite' routine: highlight the evidence in the text before answering; use a pre-formatted answer frame.",
        prerequisite_skill_ids: ["reading_comp_info_main_idea", "reading_comp_info_supporting_details", "reading_comp_info_fact_opinion"],
        next_skill_ids: ["reading_comp_info_paired_passages"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Informational Text RIT 195-210 — citing evidence to support claims",
        question_types: ["claim-evidence", "hot-text-sentence", "hot-text-paragraph", "mc-text", "passage-mc-set"]
    },

    {
        skill_id: "reading_comp_info_paired_passages",
        subject: "reading",
        strand: "comprehension_info",
        domain: "cross_text_analysis",
        sub_domain: "paired_passages",
        developmental_band: "4-5+",
        skill_statement: "Compare and synthesize information across two related informational texts on the same topic, noting what each source adds to understanding.",
        ccss_codes: ["RI.4.9", "RI.5.9"],
        rit_band: "200-215",
        rit_test: "Reading 2-5",
        rit_instructional_area: "Informational Text",
        ixl_skills: ["4.H.9 Compare information from two texts (Grade 4)", "5.H.9 Integrate information from two texts (Grade 5)"],
        sor_citations: [
            "Duke, N. K., & Pearson, P. D. (2002). Effective practices for developing reading comprehension. In A. E. Farstrup & S. J. Samuels (Eds.), What Research Has to Say About Reading Instruction (pp. 205–242). IRA.",
            "Fisher, D., & Frey, N. (2014). Close Reading and Writing from Sources. IRA."
        ],
        ell_scaffold: "Pre-read both passages separately before comparison task; provide a 3-column comparison chart (Text 1 only / Both / Text 2 only) with bilingual labels.",
        sped_scaffold: "Color-code passages and notes by source (blue = Passage 1, green = Passage 2); limit comparison to 2 specific points per session.",
        prerequisite_skill_ids: ["reading_comp_info_citing_evidence", "reading_comp_info_text_structure_compare_contrast"],
        next_skill_ids: [],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NWEA Learning Continuum: Informational Text RIT 200-215 — integrating information from two texts",
        question_types: ["mc-multi-select", "sort-into-bins", "hot-text-sentence", "fib-auto", "claim-evidence"]
    }

];

export default comprehensionInformationalAtoms;
