/**
 * Literacy Quest — Language / Mechanics skill catalog
 * Part 8: Capitalization, Punctuation, Spelling
 * K-5 ELA Scope & Sequence
 *
 * 35 skill atoms:
 *   • Capitalization  — 12 atoms (language_mechanics_capitalize_*)
 *   • Punctuation     — 13 atoms (language_mechanics_punctuate_* / language_mechanics_comma_* /
 *                                 language_mechanics_apostrophe_* / language_mechanics_quote_* /
 *                                 language_mechanics_colon_* / language_mechanics_semicolon_* /
 *                                 language_mechanics_hyphen_*)
 *   • Spelling        — 10 atoms (language_mechanics_spelling_*)
 *
 * @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]}
 */
export default [

  // ─────────────────────────────────────────────────────────────────────────────
  // CAPITALIZATION (12 atoms)
  // ─────────────────────────────────────────────────────────────────────────────

  {
    skill_id: "language_mechanics_capitalize_sentence_start",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "sentence_start",
    developmental_band: "K-1",
    skill_statement: "Capitalize the first word of every sentence.",
    ccss_codes: ["L.K.2a", "L.1.2a"],
    rit_band: "153-168",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "K.AA.1 Capitalizing the first word of a sentence (Kindergarten)",
      "1.AA.1 Capitalizing the first word of a sentence (Grade 1)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Use color-coded sentence strips; highlight first letter in a contrasting color; point-read aloud before answering.",
    sped_scaffold: "Provide sentence frames with a blank capital letter as a visual cue; reduce to 2 choices for binary mechanic.",
    prerequisite_skill_ids: ["language_mechanics_spelling_hfw_fry_1_100"],
    next_skill_ids: [
      "language_mechanics_capitalize_proper_noun_person",
      "language_mechanics_capitalize_proper_noun_place"
    ],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "DIBELS K Letter Naming Fluency; district K writing rubric sentence mechanics item",
    question_types: [
      "two-button-binary",
      "tap-hotspot",
      "fib-auto",
      "mc-text",
      "hot-text-word"
    ]
  },

  {
    skill_id: "language_mechanics_capitalize_pronoun_i",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "pronoun_i",
    developmental_band: "K-1",
    skill_statement: "Always capitalize the pronoun \"I\" when used as a standalone word.",
    ccss_codes: ["L.K.2a", "L.1.2a"],
    rit_band: "153-168",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "K.AA.2 Capitalizing \"I\" (Kindergarten)",
      "1.AA.2 Using capital letters: \"I\" (Grade 1)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Contrast L1 usage (Arabic/Spanish first-person pronoun is optional/implied); explicitly teach that English requires the capital I every time.",
    sped_scaffold: "Use a visual anchor card showing 'i → I' with a red arrow; errorless practice with just the pronoun I in isolation first.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_sentence_start"],
    next_skill_ids: ["language_mechanics_capitalize_proper_noun_person"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District K-1 writing sample: count incidences of lowercase 'i' used as a pronoun",
    question_types: [
      "two-button-binary",
      "fib-auto",
      "mc-text",
      "tap-hotspot",
      "hot-text-word"
    ]
  },

  {
    skill_id: "language_mechanics_capitalize_proper_noun_person",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "proper_noun_person",
    developmental_band: "K-1",
    skill_statement: "Capitalize names of specific people (first names, last names, titles used with names).",
    ccss_codes: ["L.K.2a", "L.1.2a"],
    rit_band: "155-172",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "K.AA.3 Capitalizing names (Kindergarten)",
      "1.AA.3 Capitalizing names of people (Grade 1)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Pre-teach that specific people's names are always capitalized; use a class name list as anchor text.",
    sped_scaffold: "Highlight names vs. common nouns with two colors in example sentences; use errorless two-choice format.",
    prerequisite_skill_ids: [
      "language_mechanics_capitalize_sentence_start",
      "language_mechanics_capitalize_pronoun_i"
    ],
    next_skill_ids: [
      "language_mechanics_capitalize_proper_noun_place",
      "language_mechanics_capitalize_proper_noun_months_days"
    ],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "UFLI Scope and Sequence: Capitalization check embedded in dictation sentences",
    question_types: [
      "two-button-binary",
      "hot-text-word",
      "sort-into-bins",
      "fib-auto",
      "drop-down-inline"
    ]
  },

  {
    skill_id: "language_mechanics_capitalize_proper_noun_place",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "proper_noun_place",
    developmental_band: "1-2",
    skill_statement: "Capitalize names of specific places: cities, states, countries, and geographic features.",
    ccss_codes: ["L.1.2a", "L.2.2a"],
    rit_band: "163-180",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "1.AA.4 Capitalizing place names (Grade 1)",
      "2.AA.2 Capitalizing names of places (Grade 2)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Use a world map; point to student's home country and city; reinforce that specific place names always capitalize.",
    sped_scaffold: "Color-code place names in passages; reduce options to 2 in binary mechanic.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_proper_noun_person"],
    next_skill_ids: [
      "language_mechanics_capitalize_proper_noun_months_days",
      "language_mechanics_capitalize_geographic_names"
    ],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 2 writing sample: proper noun capitalization count",
    question_types: [
      "two-button-binary",
      "hot-text-word",
      "sort-into-bins",
      "fib-auto",
      "drop-down-inline"
    ]
  },

  {
    skill_id: "language_mechanics_capitalize_proper_noun_months_days",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "proper_noun_months_days",
    developmental_band: "1-2",
    skill_statement: "Capitalize names of months and days of the week.",
    ccss_codes: ["L.1.2a", "L.2.2a"],
    rit_band: "163-178",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "1.AA.5 Capitalizing days, months, and holidays (Grade 1)",
      "2.AA.3 Capitalizing days and months (Grade 2)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Point out that in many languages months and days are NOT capitalized; explicitly contrast English rule with Spanish/French.",
    sped_scaffold: "Provide a pocket reference card listing all months and days capitalized; use as a scaffold during practice.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_proper_noun_person"],
    next_skill_ids: ["language_mechanics_capitalize_proper_noun_titles_acronyms"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Teacher observation during calendar/morning message routine",
    question_types: [
      "two-button-binary",
      "sort-into-bins",
      "fib-auto",
      "mc-text",
      "hot-text-word"
    ]
  },

  {
    skill_id: "language_mechanics_capitalize_proper_noun_titles_acronyms",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "proper_noun_titles_acronyms",
    developmental_band: "2-3",
    skill_statement: "Capitalize official titles when used before names (Dr., Mrs., President) and recognize common acronyms (NASA, USA).",
    ccss_codes: ["L.2.2a", "L.3.2a"],
    rit_band: "170-188",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "2.AA.4 Capitalizing titles of people (Grade 2)",
      "3.AA.1 Capitalizing titles and abbreviations (Grade 3)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Teach a list of common school-context titles (Mr., Mrs., Ms., Dr.) before generalizing the rule.",
    sped_scaffold: "Use color-coding: red = title before name (capitalize), blue = title used alone (lowercase) — e.g., 'Dr. Smith' vs. 'the doctor'.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_proper_noun_months_days"],
    next_skill_ids: [
      "language_mechanics_capitalize_proper_adjectives",
      "language_mechanics_capitalize_titles_of_works"
    ],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3 grammar checkpoint: titles and abbreviations",
    question_types: [
      "two-button-binary",
      "mc-text",
      "fib-auto",
      "sort-into-bins",
      "hot-text-word"
    ]
  },

  {
    skill_id: "language_mechanics_capitalize_proper_adjectives",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "proper_adjectives",
    developmental_band: "4-5+",
    skill_statement: "Capitalize proper adjectives derived from proper nouns (American, French, Shakespearean).",
    ccss_codes: ["L.4.2a", "L.5.2a"],
    rit_band: "190-205",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "4.AA.1 Capitalizing proper adjectives (Grade 4)",
      "5.AA.1 Capitalizing proper nouns and adjectives (Grade 5)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Show word-family pairs: France → French, China → Chinese; use a vocabulary wall for common proper adjectives.",
    sped_scaffold: "Anchor to the underlying proper noun; provide a reference chart of proper noun → proper adjective pairs.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_proper_noun_titles_acronyms"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 4-5 writing sample: proper adjective capitalization audit",
    question_types: [
      "two-button-binary",
      "mc-text",
      "hot-text-word",
      "fib-auto",
      "sort-into-bins"
    ]
  },

  {
    skill_id: "language_mechanics_capitalize_direct_quotation",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "direct_quotation",
    developmental_band: "2-3",
    skill_statement: "Capitalize the first word of a direct quotation when it begins a complete sentence.",
    ccss_codes: ["L.3.2c", "L.4.2b"],
    rit_band: "178-195",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "3.AA.2 Capitalizing the first word in a quotation (Grade 3)",
      "4.AA.2 Using capital letters in quotations (Grade 4)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Explicitly teach that dialogue in books is formatted differently in English than in some L1 languages; use familiar picture book dialogue as anchor text.",
    sped_scaffold: "Color-code the spoken words vs. the dialogue tag; use a 2-step rule: (1) is it a full sentence? (2) does it start the quote?",
    prerequisite_skill_ids: [
      "language_mechanics_capitalize_sentence_start",
      "language_mechanics_punctuate_quotation_marks_dialogue"
    ],
    next_skill_ids: ["language_mechanics_capitalize_titles_of_works"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3 writing sample: dialogue punctuation and capitalization",
    question_types: [
      "mc-text",
      "two-button-binary",
      "drop-down-inline",
      "fib-auto",
      "hot-text-word"
    ]
  },

  {
    skill_id: "language_mechanics_capitalize_letter_greeting_closing",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "letter_greeting_closing",
    developmental_band: "1-2",
    skill_statement: "Capitalize the greeting and first word of the closing in a letter (Dear Maria, Sincerely,).",
    ccss_codes: ["L.2.2a", "L.3.2a"],
    rit_band: "165-180",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "2.AA.5 Capitalizing greetings and closings in letters (Grade 2)",
      "3.AA.3 Capitalizing letter greetings and closings (Grade 3)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Use a shared class letter written to a real person as the anchor text; identify greeting and closing as a text structure feature.",
    sped_scaffold: "Provide a letter template with labeled parts (greeting, body, closing, signature) to reduce cognitive load.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_sentence_start"],
    next_skill_ids: ["language_mechanics_capitalize_direct_quotation"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Friendly letter writing task (district Grade 2 performance assessment)",
    question_types: [
      "two-button-binary",
      "mc-text",
      "fib-auto",
      "tap-hotspot",
      "drop-down-inline"
    ]
  },

  {
    skill_id: "language_mechanics_capitalize_poetry_line",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "poetry_line",
    developmental_band: "2-3",
    skill_statement: "Recognize that poets traditionally capitalize the first letter of each new line of a poem.",
    ccss_codes: ["L.2.2a", "L.3.2a"],
    rit_band: "170-185",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "2.AA.6 Capitalization in poetry (Grade 2)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction."
    ],
    ell_scaffold: "Compare a poem in English with a familiar poem in L1 to highlight formatting conventions as author's choice vs. grammatical rule.",
    sped_scaffold: "Provide two versions of a short poem — one correctly formatted, one with all capitals removed — and have student compare them.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_sentence_start"],
    next_skill_ids: ["language_mechanics_capitalize_titles_of_works"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Teacher observation during poetry read-aloud: notice and wonder about capitalization",
    question_types: [
      "two-button-binary",
      "mc-text",
      "tap-hotspot",
      "fib-auto",
      "sort-into-bins"
    ]
  },

  {
    skill_id: "language_mechanics_capitalize_geographic_names",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "geographic_names",
    developmental_band: "3-4",
    skill_statement: "Capitalize names of geographic features: mountains, rivers, oceans, and regions (Mount Everest, the Pacific Ocean, the Midwest).",
    ccss_codes: ["L.3.2a", "L.4.2a"],
    rit_band: "182-197",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "3.AA.4 Capitalizing geographic names (Grade 3)",
      "4.AA.3 Capitalizing geographic features and regions (Grade 4)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Connect to social studies vocabulary; use a map to ground each geographic name in a real referent.",
    sped_scaffold: "Teach the key distinction: 'the mountain' (common noun) vs. 'Mount Whitney' (proper noun + capitalize); use color contrast.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_proper_noun_place"],
    next_skill_ids: ["language_mechanics_capitalize_proper_adjectives"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3-4 geography-integrated writing sample",
    question_types: [
      "two-button-binary",
      "sort-into-bins",
      "hot-text-word",
      "fib-auto",
      "mc-text"
    ]
  },

  {
    skill_id: "language_mechanics_capitalize_titles_of_works",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "titles_of_works",
    developmental_band: "3-5",
    skill_statement: "Capitalize the first and last words and all principal words in titles of books, movies, songs, and articles; lowercase articles and short prepositions unless first/last.",
    ccss_codes: ["L.3.2a", "L.4.2a", "L.5.2a"],
    rit_band: "185-202",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "3.AA.5 Capitalizing titles of books and other works (Grade 3)",
      "4.AA.4 Capitalizing titles of works (Grade 4)",
      "5.AA.2 Capitalizing titles: using rules for articles and prepositions (Grade 5)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Use a shared class book list as anchor text; explicitly teach the 'short words stay lowercase' rule with a pocket reference card listing: a, an, the, of, in, on, at, for, but, or, and.",
    sped_scaffold: "Provide a two-column anchor chart: 'Always capitalize' / 'Keep lowercase unless first or last'; student checks each word in the title against the chart.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_proper_noun_titles_acronyms"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 4-5 research writing task: titles in bibliography entries",
    question_types: [
      "mc-text",
      "two-button-binary",
      "fib-auto",
      "drop-down-inline",
      "sort-into-bins"
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PUNCTUATION (13 atoms)
  // ─────────────────────────────────────────────────────────────────────────────

  {
    skill_id: "language_mechanics_punctuate_end_period",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "end_punctuation",
    developmental_band: "K-1",
    skill_statement: "Use periods, question marks, and exclamation points correctly at the end of sentences.",
    ccss_codes: ["L.K.2b", "L.1.2b"],
    rit_band: "155-170",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "K.BB.1 Ending punctuation (Kindergarten)",
      "1.BB.1 Identifying sentence types and ending punctuation (Grade 1)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Use sentence-type anchor cards with visual icons: period = statement (flat line), question mark = question (rising arrow), exclamation = strong feeling (burst).",
    sped_scaffold: "Teach one sentence type at a time; use physical cues (neutral voice = period, rising voice = ?, loud voice = !) before written practice.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_sentence_start"],
    next_skill_ids: ["language_mechanics_comma_series"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "DIBELS K-1 writing fluency: count of correctly punctuated sentences",
    question_types: [
      "mc-text",
      "drop-down-inline",
      "two-button-binary",
      "tap-hotspot",
      "fib-auto"
    ]
  },

  {
    skill_id: "language_mechanics_comma_series",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "comma_series",
    developmental_band: "2-3",
    skill_statement: "Use commas to separate three or more items in a series (serial comma before the conjunction).",
    ccss_codes: ["L.2.2c", "L.3.2b"],
    rit_band: "175-192",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "2.BB.1 Using commas in a series (Grade 2)",
      "3.BB.1 Using commas in a list (Grade 3)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Use a list of familiar foods or objects; connect to L1 list conventions; explicitly teach that English uses a comma before 'and' in a list.",
    sped_scaffold: "Give student a comma chip to physically place between each item as they read aloud; then transfer to writing.",
    prerequisite_skill_ids: ["language_mechanics_punctuate_end_period"],
    next_skill_ids: [
      "language_mechanics_comma_date",
      "language_mechanics_comma_compound_sentence"
    ],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 2-3 grammar checkpoint: comma placement in lists",
    question_types: [
      "drop-down-inline",
      "mc-text",
      "two-button-binary",
      "fib-auto",
      "hot-text-word"
    ]
  },

  {
    skill_id: "language_mechanics_comma_date",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "comma_date",
    developmental_band: "1-2",
    skill_statement: "Use a comma between the day and year in a date (January 1, 2026), and after the year when the date appears mid-sentence.",
    ccss_codes: ["L.1.2c", "L.2.2b"],
    rit_band: "163-178",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "1.BB.2 Using commas in dates (Grade 1)",
      "2.BB.2 Commas in dates (Grade 2)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Compare date formats across cultures (DD/MM/YYYY vs. Month DD, YYYY); use a calendar with the correct format displayed daily.",
    sped_scaffold: "Use a date frame template with blanks: '_______  ___,  ______' with tactile comma chip placement.",
    prerequisite_skill_ids: [
      "language_mechanics_capitalize_proper_noun_months_days",
      "language_mechanics_punctuate_end_period"
    ],
    next_skill_ids: ["language_mechanics_comma_series"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Daily writing header / morning message: teacher observes comma after day number in dates",
    question_types: [
      "drop-down-inline",
      "fib-auto",
      "mc-text",
      "two-button-binary",
      "tap-hotspot"
    ]
  },

  {
    skill_id: "language_mechanics_comma_introductory_element",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "comma_introductory",
    developmental_band: "3-5",
    skill_statement: "Use a comma after an introductory word, phrase, or clause (Well, In the morning, After the game ended,).",
    ccss_codes: ["L.3.2b", "L.4.2b", "L.5.2b"],
    rit_band: "185-202",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "3.BB.2 Using commas after introductory elements (Grade 3)",
      "4.BB.1 Commas after introductory words and phrases (Grade 4)",
      "5.BB.1 Commas after introductory clauses (Grade 5)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Use a sentence-flip organizer: move the introductory element to the end to show it doesn't need a comma there; contrast the two positions.",
    sped_scaffold: "Highlight the introductory element in yellow; place a comma chip right after it; color-coded sentence strips.",
    prerequisite_skill_ids: ["language_mechanics_comma_series"],
    next_skill_ids: ["language_mechanics_comma_compound_sentence"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3-4 grammar checkpoint: introductory element comma placement",
    question_types: [
      "drop-down-inline",
      "mc-text",
      "two-button-binary",
      "fib-auto",
      "tap-hotspot"
    ]
  },

  {
    skill_id: "language_mechanics_comma_compound_sentence",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "comma_compound_sentence",
    developmental_band: "3-5",
    skill_statement: "Use a comma before a coordinating conjunction (FANBOYS) in a compound sentence.",
    ccss_codes: ["L.3.2b", "L.4.2b", "L.5.2b"],
    rit_band: "185-200",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "3.BB.3 Using commas in compound sentences (Grade 3)",
      "4.BB.2 Commas before coordinating conjunctions (Grade 4)",
      "5.BB.2 Using commas to join independent clauses (Grade 5)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Teach FANBOYS (for, and, nor, but, or, yet, so) as a mnemonic; contrast compound sentence (comma needed) vs. compound predicate (no comma) with sentence cards.",
    sped_scaffold: "Use a two-box graphic organizer with a 'bridge': [subject + verb], FANBOYS [subject + verb]; physically place comma chip at the bridge.",
    prerequisite_skill_ids: ["language_mechanics_comma_series"],
    next_skill_ids: ["language_mechanics_semicolon_compound"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3-4 compound sentence writing task",
    question_types: [
      "drop-down-inline",
      "mc-text",
      "two-button-binary",
      "fib-auto",
      "hot-text-word"
    ]
  },

  {
    skill_id: "language_mechanics_comma_direct_address",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "comma_direct_address",
    developmental_band: "2-3",
    skill_statement: "Use commas to set off the name of the person being addressed in a sentence (Yes, Maria, I will help.).",
    ccss_codes: ["L.3.2b", "L.4.2b"],
    rit_band: "178-193",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "3.BB.4 Using commas with direct address (Grade 3)",
      "4.BB.3 Commas with nouns of direct address (Grade 4)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Use a role-play script with clear direct address sentences; point out that removing the name and commas changes nothing about the core sentence meaning.",
    sped_scaffold: "Use color-coded sentence strips: the name of the person spoken to is always in brackets and surrounded by comma chips.",
    prerequisite_skill_ids: ["language_mechanics_comma_series"],
    next_skill_ids: ["language_mechanics_comma_introductory_element"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3 grammar checkpoint: commas in dialogue and direct address",
    question_types: [
      "drop-down-inline",
      "two-button-binary",
      "mc-text",
      "fib-auto",
      "hot-text-word"
    ]
  },

  {
    skill_id: "language_mechanics_apostrophe_possessive",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "apostrophe_possessive",
    developmental_band: "3-5",
    skill_statement: "Use apostrophes correctly to show possession: singular (dog's), irregular plural (children's), and regular plural (teachers').",
    ccss_codes: ["L.3.2d", "L.4.2c", "L.5.2c"],
    rit_band: "183-198",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "3.CC.1 Forming possessives (Grade 3)",
      "4.CC.1 Singular and plural possessives (Grade 4)",
      "5.CC.1 Possessives: singular, plural, and irregular (Grade 5)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "In many L1 languages possession is shown with 'of' (the book of Ana) rather than an apostrophe; explicitly teach the English apostrophe-s structure with parallel examples.",
    sped_scaffold: "Use a two-step decision tree: (1) Does the word already end in -s (plural)? → apostrophe after the s. (2) Does it not end in -s? → add 's.",
    prerequisite_skill_ids: ["language_mechanics_apostrophe_contraction"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3-4 grammar checkpoint: possessive nouns",
    question_types: [
      "drop-down-inline",
      "mc-text",
      "two-button-binary",
      "fib-auto",
      "sort-into-bins"
    ]
  },

  {
    skill_id: "language_mechanics_apostrophe_contraction",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "apostrophe_contraction",
    developmental_band: "2-3",
    skill_statement: "Use apostrophes correctly in contractions (can't, won't, it's, they're, I'm, you've).",
    ccss_codes: ["L.2.2c", "L.3.2d"],
    rit_band: "175-192",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "2.CC.1 Contractions (Grade 2)",
      "3.CC.2 Forming contractions correctly (Grade 3)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Teach contractions as 'two words smooshed together with a letter removed'; compare expansion and contraction forms side by side.",
    sped_scaffold: "Use contraction flip cards: lift the flap to reveal the two original words; the apostrophe stands where the missing letter was.",
    prerequisite_skill_ids: ["language_mechanics_punctuate_end_period"],
    next_skill_ids: ["language_mechanics_apostrophe_possessive"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 2-3 grammar checkpoint: contractions formation",
    question_types: [
      "drop-down-inline",
      "mc-text",
      "fib-auto",
      "two-button-binary",
      "sort-into-bins"
    ]
  },

  {
    skill_id: "language_mechanics_punctuate_quotation_marks_dialogue",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "quotation_marks_dialogue",
    developmental_band: "2-3",
    skill_statement: "Use quotation marks to enclose the exact words of a speaker; place commas and periods inside closing quotation marks.",
    ccss_codes: ["L.3.2c", "L.4.2b"],
    rit_band: "180-196",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "3.DD.1 Using quotation marks in dialogue (Grade 3)",
      "4.DD.1 Quotation marks and punctuation in dialogue (Grade 4)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Use a picture book page showing dialogue bubbles and the corresponding printed text; map the bubble's text to the quoted text in print.",
    sped_scaffold: "Color-code spoken words in orange; use orange 'rabbit ear' manipulatives to physically place quotation marks around spoken words.",
    prerequisite_skill_ids: ["language_mechanics_comma_series"],
    next_skill_ids: ["language_mechanics_capitalize_direct_quotation"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3 writing sample: dialogue punctuation analysis",
    question_types: [
      "mc-text",
      "two-button-binary",
      "fib-auto",
      "drop-down-inline",
      "tap-hotspot"
    ]
  },

  {
    skill_id: "language_mechanics_colon_list_intro",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "colon_list",
    developmental_band: "4-5+",
    skill_statement: "Use a colon to introduce a list or to formally introduce an explanation after an independent clause.",
    ccss_codes: ["L.4.2b", "L.5.2b"],
    rit_band: "190-207",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "4.EE.1 Using colons to introduce lists (Grade 4)",
      "5.EE.1 Colons (Grade 5)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Teach the colon as a 'ta-da' sign: the sentence before it must stand alone, and the list comes after; use a visual of a door opening to reveal items.",
    sped_scaffold: "Use a two-column anchor chart: 'Complete sentence before colon' / 'List or explanation after colon'; test each example against the rule.",
    prerequisite_skill_ids: [
      "language_mechanics_comma_series",
      "language_mechanics_comma_compound_sentence"
    ],
    next_skill_ids: ["language_mechanics_semicolon_compound"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 4-5 informational writing task: check for colon use in lists",
    question_types: [
      "mc-text",
      "two-button-binary",
      "drop-down-inline",
      "fib-auto",
      "tap-hotspot"
    ]
  },

  {
    skill_id: "language_mechanics_semicolon_compound",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "semicolon_compound",
    developmental_band: "4-5+",
    skill_statement: "Use a semicolon to join two closely related independent clauses without a coordinating conjunction.",
    ccss_codes: ["L.4.2b", "L.5.2b"],
    rit_band: "193-210",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "4.EE.2 Using semicolons (Grade 4)",
      "5.EE.2 Semicolons (Grade 5)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Contrast the semicolon with a period (harder stop) and a comma-conjunction (softer join); use three traffic-light colors for the three punctuation strengths.",
    sped_scaffold: "Use a checklist: (1) Both sides are complete sentences? (2) They're closely related? → semicolon works here. Print on a card.",
    prerequisite_skill_ids: ["language_mechanics_comma_compound_sentence"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 5 grammar checkpoint: semicolon in compound sentence",
    question_types: [
      "mc-text",
      "two-button-binary",
      "drop-down-inline",
      "fib-auto",
      "sort-into-bins"
    ]
  },

  {
    skill_id: "language_mechanics_hyphen_dash_basics",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "hyphen_dash",
    developmental_band: "4-5+",
    skill_statement: "Distinguish between a hyphen (joining compound modifiers and numbers: well-known, twenty-one) and an em dash (inserting a strong break or parenthetical).",
    ccss_codes: ["L.4.2b", "L.5.2b"],
    rit_band: "193-210",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "4.EE.3 Hyphens and dashes (Grade 4)",
      "5.EE.3 Hyphens in compound modifiers and numbers (Grade 5)"
    ],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Focus first on hyphenated numbers (twenty-one through ninety-nine) and compound adjectives before name (a well-known author) as these have clear rules.",
    sped_scaffold: "Use a visual comparison card: hyphen = short bridge between words; em dash = longer dramatic pause/interruption.",
    prerequisite_skill_ids: ["language_mechanics_comma_compound_sentence"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 4-5 editing sample: hyphen vs. dash identification",
    question_types: [
      "mc-text",
      "two-button-binary",
      "drop-down-inline",
      "sort-into-bins",
      "fib-auto"
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SPELLING (10 atoms)
  // ─────────────────────────────────────────────────────────────────────────────

  {
    skill_id: "language_mechanics_spelling_hfw_fry_1_100",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "high_frequency_words",
    developmental_band: "K-1",
    skill_statement: "Spell the first 100 Fry high-frequency words automatically (the, of, and, a, to, in, is, you, that, it…).",
    ccss_codes: ["L.K.2d", "L.1.2e", "RF.K.3c", "RF.1.3g"],
    rit_band: "141-160",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "K.FF.1 Spell sight words I (Kindergarten)",
      "1.FF.1 Spell sight words: Fry words 1-100 (Grade 1)"
    ],
    sor_citations: [
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning. Scientific Studies of Reading, 18(1), 5–21.",
      "Fry, E. (1998). The most common phonograms. The Reading Teacher, 51(7), 620–622.",
      "Moats, L.C. (2020). LETRS Volume 1, Unit 2: The Language Comprehension Side of Reading. Lexia Learning."
    ],
    ell_scaffold: "Sort Fry 1-100 by cognate status; pre-teach high-value cognates (e.g., no, a, animal) before non-cognate words; use picture support for concrete nouns.",
    sped_scaffold: "Use Elkonin sound boxes and Look-Say-Cover-Write-Check for each word; 5-a-day incremental introduction; timed fluency checks at threshold.",
    prerequisite_skill_ids: [],
    next_skill_ids: ["language_mechanics_spelling_cvc_pattern"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 20 },
    diagnostic_anchor: "DIBELS DORF word list: Fry 1-100 fluency probe; UFLI Scope & Sequence heart words K-1",
    question_types: [
      "fib-auto",
      "mc-text",
      "letter-tile-spell",
      "build-with-tiles",
      "tap-hotspot"
    ]
  },

  {
    skill_id: "language_mechanics_spelling_cvc_pattern",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "cvc_pattern",
    developmental_band: "K-1",
    skill_statement: "Spell consonant-vowel-consonant (CVC) words with all five short vowels (cat, pet, sit, hop, cup).",
    ccss_codes: ["L.K.2d", "L.1.2e", "RF.K.3b", "RF.1.3b"],
    rit_band: "141-158",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "K.FF.2 Spell CVC words (Kindergarten)",
      "1.FF.2 Spell short-vowel CVC words (Grade 1)"
    ],
    sor_citations: [
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning. Scientific Studies of Reading, 18(1), 5–21.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18.",
      "Moats, L.C. (2020). LETRS Volume 1, Unit 3: Meeting the Demands of the Code. Lexia Learning."
    ],
    ell_scaffold: "Pre-teach CVC word vocabulary with pictures before spelling; prioritize words with cognates or transparent phoneme-grapheme correspondence.",
    sped_scaffold: "Use Elkonin sound boxes (3 boxes for CVC); finger-tap each phoneme; physically select letters from an alphabet strip before writing.",
    prerequisite_skill_ids: ["language_mechanics_spelling_hfw_fry_1_100"],
    next_skill_ids: ["language_mechanics_spelling_cvce_pattern"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 15 },
    diagnostic_anchor: "UFLI Placement Test Set 1 (short vowels); DIBELS NWF (CVC pseudo-words)",
    question_types: [
      "letter-tile-spell",
      "fib-auto",
      "sort-into-bins",
      "build-with-tiles",
      "mc-text"
    ]
  },

  {
    skill_id: "language_mechanics_spelling_cvce_pattern",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "cvce_pattern",
    developmental_band: "1-2",
    skill_statement: "Spell CVCe (magic-e) words where the silent final e makes the vowel say its long name (cake, bike, hope, tune).",
    ccss_codes: ["RF.1.3c", "L.1.2e", "L.2.2e"],
    rit_band: "155-172",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "1.FF.3 Spell long-vowel CVCe words (Grade 1)",
      "2.FF.1 Spell CVCe words: silent e patterns (Grade 2)"
    ],
    sor_citations: [
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning. Scientific Studies of Reading, 18(1), 5–21.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18.",
      "Moats, L.C. (2020). LETRS Volume 1, Unit 3: Meeting the Demands of the Code. Lexia Learning."
    ],
    ell_scaffold: "Use minimal pairs (cap/cape, kit/kite, hop/hope) to show that the e changes the vowel sound; point to the silent e and explain it 'reaches back' to change the vowel.",
    sped_scaffold: "Use two-color letter tiles: the final silent e is grey (silent), the long vowel is orange; student builds word with color contrast reinforcing the rule.",
    prerequisite_skill_ids: ["language_mechanics_spelling_cvc_pattern"],
    next_skill_ids: [
      "language_mechanics_spelling_floss_rule",
      "language_mechanics_spelling_doubling_rule"
    ],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 15 },
    diagnostic_anchor: "UFLI Placement Test Set 3 (long vowels CVCe); district Grade 1 spelling assessment",
    question_types: [
      "letter-tile-spell",
      "fib-auto",
      "two-button-binary",
      "sort-into-bins",
      "mc-text"
    ]
  },

  {
    skill_id: "language_mechanics_spelling_floss_rule",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "floss_rule",
    developmental_band: "1-2",
    skill_statement: "Apply the FLOSS rule: double f, l, s, or z after a single short vowel at the end of a one-syllable word (off, bell, pass, buzz).",
    ccss_codes: ["RF.1.3", "L.2.2e"],
    rit_band: "163-178",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "1.FF.4 FLOSS rule spelling (Grade 1)",
      "2.FF.2 Doubling f, l, s, z: the FLOSS rule (Grade 2)"
    ],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 1, Unit 3: Meeting the Demands of the Code. Lexia Learning.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18.",
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning. Scientific Studies of Reading, 18(1), 5–21."
    ],
    ell_scaffold: "The FLOSS rule has no direct equivalent in Arabic or Spanish; teach with a mnemonic anchor: FLOSS = the letters that need a buddy at the end after a short vowel.",
    sped_scaffold: "Use a 'FLOSS checklist': (1) one-syllable word? (2) ends in f/l/s/z? (3) short vowel before it? → if all yes, double the final letter.",
    prerequisite_skill_ids: ["language_mechanics_spelling_cvc_pattern"],
    next_skill_ids: ["language_mechanics_spelling_doubling_rule"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "UFLI Scope & Sequence Unit 7 (FLOSS rule dictation); district Grade 2 spelling probe",
    question_types: [
      "two-button-binary",
      "fib-auto",
      "sort-into-bins",
      "letter-tile-spell",
      "mc-text"
    ]
  },

  {
    skill_id: "language_mechanics_spelling_doubling_rule",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "doubling_rule_1_1_1",
    developmental_band: "2-3",
    skill_statement: "Apply the 1-1-1 doubling rule: double the final consonant when adding a vowel suffix to a one-syllable word ending in one vowel + one consonant (run → running, hop → hopped).",
    ccss_codes: ["L.2.2e", "L.3.2e"],
    rit_band: "170-187",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "2.FF.3 Doubling rule: adding -ed and -ing (Grade 2)",
      "3.FF.1 1-1-1 doubling rule with vowel suffixes (Grade 3)"
    ],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 6: Foundational Skills for Reading Words. Lexia Learning.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18.",
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning. Scientific Studies of Reading, 18(1), 5–21."
    ],
    ell_scaffold: "Use two contrast cards: 'hop + ing' (double because short vowel CVC) vs. 'hope + ing' (drop e instead); highlight the difference with minimal pairs.",
    sped_scaffold: "Count on fingers: 1 syllable? 1 vowel? 1 consonant? = double; use a three-finger tap to check each condition before adding the suffix.",
    prerequisite_skill_ids: ["language_mechanics_spelling_cvce_pattern", "language_mechanics_spelling_floss_rule"],
    next_skill_ids: ["language_mechanics_spelling_drop_e_rule"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 2-3 spelling assessment: inflected endings with doubling",
    question_types: [
      "fib-auto",
      "mc-text",
      "two-button-binary",
      "sort-into-bins",
      "letter-tile-spell"
    ]
  },

  {
    skill_id: "language_mechanics_spelling_drop_e_rule",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "drop_e_rule",
    developmental_band: "2-3",
    skill_statement: "Drop the silent final e before adding a vowel suffix (make → making, hope → hoped, save → saving).",
    ccss_codes: ["L.2.2e", "L.3.2e"],
    rit_band: "170-187",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "2.FF.4 Drop the final e before a vowel suffix (Grade 2)",
      "3.FF.2 Drop-e rule with multiple suffixes (Grade 3)"
    ],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 6: Foundational Skills for Reading Words. Lexia Learning.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Use an 'e eraser' visual: when the vowel suffix arrives, it 'erases' the silent e; show the transformation step by step with manipulatives.",
    sped_scaffold: "Sort suffixes into two groups: vowel suffix (drop the e) vs. consonant suffix (keep the e); student places each suffix in the correct bin before applying it.",
    prerequisite_skill_ids: ["language_mechanics_spelling_cvce_pattern", "language_mechanics_spelling_doubling_rule"],
    next_skill_ids: ["language_mechanics_spelling_change_y_to_i"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 2-3 spelling assessment: inflected endings with drop-e",
    question_types: [
      "fib-auto",
      "mc-text",
      "two-button-binary",
      "sort-into-bins",
      "letter-tile-spell"
    ]
  },

  {
    skill_id: "language_mechanics_spelling_change_y_to_i",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "change_y_to_i",
    developmental_band: "2-3",
    skill_statement: "Change final y to i before adding suffixes other than -ing (cry → cried, happy → happily, city → cities).",
    ccss_codes: ["L.2.2e", "L.3.2e"],
    rit_band: "172-190",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "2.FF.5 Change y to i before a suffix (Grade 2)",
      "3.FF.3 y-to-i spelling rule (Grade 3)"
    ],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 6: Foundational Skills for Reading Words. Lexia Learning.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Note that Spanish nouns/adjectives ending in -ia/-io are cognate-adjacent; walk through the exception (adding -ing keeps y: crying) to prevent overgeneralizing.",
    sped_scaffold: "Provide a decision card: (1) Does the word end in y? (2) Is the suffix -ing? → if yes to both, KEEP the y; if no to question 2 → CHANGE to i.",
    prerequisite_skill_ids: ["language_mechanics_spelling_drop_e_rule"],
    next_skill_ids: ["language_mechanics_spelling_homophones_confused_words"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 2-3 spelling assessment: y-to-i plurals and past tense",
    question_types: [
      "fib-auto",
      "mc-text",
      "two-button-binary",
      "sort-into-bins",
      "drop-down-inline"
    ]
  },

  {
    skill_id: "language_mechanics_spelling_homophones_confused_words",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "homophones_confused_words",
    developmental_band: "2-3",
    skill_statement: "Choose the correct spelling of commonly confused homophones and near-homophones: their/there/they're, your/you're, its/it's, to/too/two.",
    ccss_codes: ["L.2.2e", "L.3.2e", "L.4.2e"],
    rit_band: "175-195",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "2.GG.1 Their, there, and they're (Grade 2)",
      "3.GG.1 Your and you're; its and it's (Grade 3)",
      "4.GG.1 Commonly confused words: homophones (Grade 4)"
    ],
    sor_citations: [
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning. Scientific Studies of Reading, 18(1), 5–21.",
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 6: Foundational Skills for Reading Words. Lexia Learning."
    ],
    ell_scaffold: "Teach meaning-based substitution test: if you can expand the contraction and the sentence still makes sense, use the contraction form (they're = they are; if 'they are' works, use they're).",
    sped_scaffold: "Create a personal reference card for each set: their = belongs to them (their bag); there = a place (over there); they're = they are (they're happy). Laminate for desk reference.",
    prerequisite_skill_ids: ["language_mechanics_apostrophe_contraction"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3-4 grammar/editing checkpoint: homophone usage",
    question_types: [
      "drop-down-inline",
      "mc-text",
      "two-button-binary",
      "fib-auto",
      "sort-into-bins"
    ]
  },

  {
    skill_id: "language_mechanics_spelling_ee_ea_vowel_teams",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "vowel_teams_ee_ea",
    developmental_band: "1-2",
    skill_statement: "Spell long /ē/ words using the vowel teams ee and ea, choosing the correct spelling for common words (feet/feat, meet/meat, see/sea).",
    ccss_codes: ["RF.1.3a", "L.1.2e", "L.2.2e"],
    rit_band: "160-177",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "1.FF.5 Vowel team ee vs. ea spelling (Grade 1)",
      "2.FF.6 Spell long-e vowel team words: ee, ea (Grade 2)"
    ],
    sor_citations: [
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning. Scientific Studies of Reading, 18(1), 5–21.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18.",
      "Moats, L.C. (2020). LETRS Volume 1, Unit 4: Advanced Decoding Skills. Lexia Learning."
    ],
    ell_scaffold: "Use picture + word pairs for common homophones (feet/feat, meet/meat) and require the student to use the word in a sentence to determine meaning before spelling.",
    sped_scaffold: "Use a sorting mat: 'Usually spelled ee' (seed, feet, tree) / 'Usually spelled ea' (eat, sea, read); build a word wall of the most frequent examples from each pattern.",
    prerequisite_skill_ids: ["language_mechanics_spelling_cvc_pattern"],
    next_skill_ids: ["language_mechanics_spelling_homophones_confused_words"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "UFLI Scope & Sequence Units 12-14 (vowel teams ee, ea); district Grade 2 spelling probe",
    question_types: [
      "letter-tile-spell",
      "two-button-binary",
      "sort-into-bins",
      "fib-auto",
      "mc-text"
    ]
  },

  {
    skill_id: "language_mechanics_spelling_prefix_suffix",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "prefix_suffix_spelling",
    developmental_band: "3-5",
    skill_statement: "Spell words with common prefixes (un-, re-, pre-, dis-, mis-) and suffixes (-ful, -less, -ness, -tion, -able) without altering their spelling when attached to base words.",
    ccss_codes: ["L.3.2e", "L.4.2e", "L.5.2e"],
    rit_band: "183-202",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: [
      "3.FF.4 Spelling words with prefixes (Grade 3)",
      "4.FF.1 Spelling words with suffixes (Grade 4)",
      "5.FF.1 Prefix and suffix spelling patterns (Grade 5)"
    ],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 6: Foundational Skills for Reading Words. Lexia Learning.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18.",
      "Reed, D.K. (2012). Why teach spelling? Portsmouth, NH: RMC Research Corporation, Center on Instruction."
    ],
    ell_scaffold: "Many prefixes have Latin/Spanish cognates (re- = re-, pre- = pre-, dis- = dis-); use cognate awareness explicitly to reduce the cognitive load of learning prefix meanings and spellings simultaneously.",
    sped_scaffold: "Use morpheme cards that can be physically combined; first practice identifying the base word in a prefixed/suffixed word before spelling new words from scratch.",
    prerequisite_skill_ids: [
      "language_mechanics_spelling_change_y_to_i",
      "language_mechanics_spelling_drop_e_rule"
    ],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3-5 morphology spelling probe; DIBELS DORF extended: morphemic analysis items",
    question_types: [
      "fib-auto",
      "mc-text",
      "two-button-binary",
      "sort-into-bins",
      "letter-tile-spell"
    ]
  },

  // ─── NEW ATOMS (+21) ──────────────────────────────────────────────────────

  // Capitalization additions

  {
    skill_id: "language_mechanics_capitalize_acronym",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "acronym_capitalization",
    developmental_band: "4-5+",
    skill_statement: "Capitalize letters in common acronyms and initialisms (NASA, USA, STEM, GPS, UN).",
    ccss_codes: ["L.3.2a", "L.4.2a"],
    rit_band: "190-205",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["4.AA.3 Capitalization: abbreviations and acronyms (Grade 4)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning.",
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction."
    ],
    ell_scaffold: "Teach that acronyms stand for full names; provide a bilingual chart of common acronyms and their expansions.",
    sped_scaffold: "Match acronym to full name cards; highlight the first letter of each word in the full name to show the source of each capitalized letter.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_proper_noun_person"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 4 grammar checkpoint: acronym capitalization",
    question_types: ["fib-auto", "two-button-binary", "mc-text", "hot-text-word", "tap-hotspot"]
  },

  {
    skill_id: "language_mechanics_capitalize_religious_terms",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "religious_terms",
    developmental_band: "4-5+",
    skill_statement: "Capitalize names of religions, sacred texts, and religious figures (Islam, the Quran, God, Allah, the Bible, Jesus, the Torah).",
    ccss_codes: ["L.4.2a", "L.5.2a"],
    rit_band: "192-207",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["4.AA.3 Capitalization: proper nouns in context (Grade 4)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning.",
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction."
    ],
    ell_scaffold: "Connect to Arabic practice of capitalizing الإسلام, القرآن; point out English parallels to reduce confusion.",
    sped_scaffold: "Provide a reference list of common religious terms that require capitalization; color-code on an anchor chart.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_proper_noun_person"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 4-5 editing task: proper noun capitalization in context",
    question_types: ["tap-hotspot", "fib-auto", "mc-text", "two-button-binary", "hot-text-word"]
  },

  // Punctuation additions

  {
    skill_id: "language_mechanics_punctuate_em_dash",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "em_dash",
    developmental_band: "4-5+",
    skill_statement: "Use an em dash (—) to signal an abrupt interruption, set off a parenthetical remark, or add emphasis in writing.",
    ccss_codes: ["L.4.2b", "L.5.2b"],
    rit_band: "197-212",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["5.EE.4 Using em dashes (Grade 5)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning.",
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction."
    ],
    ell_scaffold: "Show how the em dash works like parentheses but with stronger emphasis; read examples aloud with dramatic pause at the dash.",
    sped_scaffold: "Contrast em dash, hyphen, and parentheses side by side with the same sentence rewritten three ways; focus on the em dash version last.",
    prerequisite_skill_ids: ["language_mechanics_hyphen_dash_basics"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 5 editing sample: em dash usage",
    question_types: ["mc-text", "two-button-binary", "fib-auto", "drop-down-inline", "tap-hotspot"]
  },

  {
    skill_id: "language_mechanics_punctuate_parentheses",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "parentheses",
    developmental_band: "4-5+",
    skill_statement: "Use parentheses to enclose supplementary, non-essential information or a brief clarification within a sentence.",
    ccss_codes: ["L.4.2b", "L.5.2b"],
    rit_band: "195-210",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["5.EE.5 Using parentheses (Grade 5)"],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Use the 'whisper test': if you would whisper the information in speech, parentheses work well in writing — model with oral delivery.",
    sped_scaffold: "Teach parentheses as 'bonus brackets': the sentence still works if you remove everything inside; practice the removal test.",
    prerequisite_skill_ids: ["language_mechanics_hyphen_dash_basics"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 5 grammar checkpoint: parenthetical punctuation",
    question_types: ["mc-text", "two-button-binary", "fib-auto", "tap-hotspot", "drop-down-inline"]
  },

  {
    skill_id: "language_mechanics_punctuate_ellipsis",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "ellipsis",
    developmental_band: "4-5+",
    skill_statement: "Use an ellipsis (...) to indicate omitted words in a quotation or to show a trailing-off pause in dialogue.",
    ccss_codes: ["L.4.2b", "L.5.2b"],
    rit_band: "197-210",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["5.EE.6 Using ellipses (Grade 5)"],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Use read-aloud with dramatic pauses to model how an ellipsis sounds; show two uses (omission vs. trailing off) with contrasting examples.",
    sped_scaffold: "Provide two anchor examples laminated on a card: one ellipsis for omission, one for trailing off; student matches each usage to its type.",
    prerequisite_skill_ids: ["language_mechanics_punctuate_quotation_marks_dialogue"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 5 editing sample: ellipsis usage in dialogue and citations",
    question_types: ["mc-text", "two-button-binary", "fib-auto", "drop-down-inline", "tap-hotspot"]
  },

  {
    skill_id: "language_mechanics_comma_appositive",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "comma_appositive",
    developmental_band: "4-5+",
    skill_statement: "Use commas to set off an appositive — a noun phrase that renames or explains the noun immediately before it (e.g., 'My dog, a golden retriever, loves to swim.').",
    ccss_codes: ["L.4.2b", "L.5.2b"],
    rit_band: "195-210",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["4.BB.4 Using commas with appositives (Grade 4)", "5.BB.3 Commas with appositives (Grade 5)"],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Teach appositive as a 'renaming phrase': it says who or what the noun is in another way; use sentence-building cards with noun + appositive pairs.",
    sped_scaffold: "Highlight the appositive in orange; place a comma chip on each side; test by removing the appositive — the sentence should still work.",
    prerequisite_skill_ids: ["language_mechanics_comma_introductory_element"],
    next_skill_ids: ["language_mechanics_comma_nonrestrictive"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 4-5 grammar checkpoint: appositives and comma usage",
    question_types: ["drop-down-inline", "mc-text", "two-button-binary", "fib-auto", "tap-hotspot"]
  },

  {
    skill_id: "language_mechanics_comma_nonrestrictive",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "comma_nonrestrictive_clause",
    developmental_band: "4-5+",
    skill_statement: "Use commas to set off non-restrictive (non-essential) relative clauses — clauses that add extra information but are not necessary to identify the noun.",
    ccss_codes: ["L.4.2b", "L.5.2b"],
    rit_band: "200-215",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["5.BB.4 Commas with non-essential clauses (Grade 5)"],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Teach the removal test: if the clause can be removed without changing the noun's identity, it needs commas; contrast 'My sister, who lives in Paris, called me' vs. 'The student who studied hardest passed.'",
    sped_scaffold: "Use parentheses as a bridge concept — non-essential info in parentheses → convert to commas; practice the transformation step by step.",
    prerequisite_skill_ids: ["language_mechanics_comma_appositive"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 5 grammar checkpoint: restrictive vs. non-restrictive clauses",
    question_types: ["two-button-binary", "mc-text", "drop-down-inline", "fib-auto", "tap-hotspot"]
  },

  {
    skill_id: "language_mechanics_semicolon_conjunctive_adverb",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "semicolon_conjunctive_adverb",
    developmental_band: "4-5+",
    skill_statement: "Use a semicolon before and a comma after a conjunctive adverb (however, therefore, furthermore, consequently, nevertheless) that joins two independent clauses.",
    ccss_codes: ["L.4.2b", "L.5.2b"],
    rit_band: "200-215",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["5.EE.2 Semicolons (Grade 5)", "6.EE.1 Semicolons with conjunctive adverbs (Grade 6)"],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Provide a conjunctive adverb chart with meanings (however = contrast, therefore = result); contrast with FANBOYS to clarify the punctuation difference.",
    sped_scaffold: "Use a visual pattern: [ IC ] ; conjunctive adverb , [ IC ] — stamp the pattern with color-coded word tiles.",
    prerequisite_skill_ids: ["language_mechanics_semicolon_compound"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 5-6 grammar checkpoint: semicolons with conjunctive adverbs",
    question_types: ["drop-down-inline", "mc-text", "fib-auto", "two-button-binary", "hot-text-word"]
  },

  // Spelling additions

  {
    skill_id: "language_mechanics_spelling_i_before_e",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "i_before_e_rule",
    developmental_band: "2-3",
    skill_statement: "Apply the 'i before e, except after c, or when sounding like /ā/ as in neighbor and weigh' rule to spell common ie/ei words; recognize exceptions (weird, seize, species).",
    ccss_codes: ["L.2.2e", "L.3.2e"],
    rit_band: "173-190",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["3.FF.5 Spelling: i before e (Grade 3)", "4.FF.2 i before e exceptions (Grade 4)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 6: Foundational Skills for Reading Words. Lexia Learning.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Teach the mnemonic verse first; create a class word wall sorted into rule-followers and exceptions; include Arabic cognates where applicable.",
    sped_scaffold: "Focus on 5 high-frequency ie words (friend, piece, believe, field, chief) before the full rule; use a word sort mat.",
    prerequisite_skill_ids: ["language_mechanics_spelling_cvce_pattern"],
    next_skill_ids: ["language_mechanics_spelling_prefix_suffix"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3-4 spelling probe: ie/ei patterns",
    question_types: ["letter-tile-spell", "two-button-binary", "fib-auto", "sort-into-bins", "mc-text"]
  },

  {
    skill_id: "language_mechanics_spelling_plural_consonant_y",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "plural_es_consonant_y",
    developmental_band: "2-3",
    skill_statement: "Form plurals of nouns ending in consonant + y by changing y to i and adding -es (city → cities, baby → babies, story → stories).",
    ccss_codes: ["L.2.2e", "L.3.2e"],
    rit_band: "172-188",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["2.FF.5 Change y to i before a suffix (Grade 2)", "3.GG.2 Form plurals of nouns ending in y (Grade 3)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 6: Foundational Skills for Reading Words. Lexia Learning.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Contrast consonant + y (change to -ies) vs. vowel + y (just add -s: keys, boys, plays); use a sort to reinforce the distinction.",
    sped_scaffold: "Provide a decision card: look at the letter before y — consonant? → change to -ies; vowel? → just add -s.",
    prerequisite_skill_ids: ["language_mechanics_spelling_change_y_to_i"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 2-3 spelling assessment: y-to-ies plurals",
    question_types: ["fib-auto", "mc-text", "sort-into-bins", "letter-tile-spell", "two-button-binary"]
  },

  {
    skill_id: "language_mechanics_spelling_common_misspellings",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "common_misspellings_grade4_5",
    developmental_band: "4-5+",
    skill_statement: "Spell Grade 4-5 commonly misspelled words correctly: separate, definitely, necessary, occurred, beginning, government, embarrass, privilege, especially, receive.",
    ccss_codes: ["L.4.2e", "L.5.2e"],
    rit_band: "190-207",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["4.FF.3 Spell commonly misspelled words (Grade 4)", "5.FF.2 Correct commonly misspelled words (Grade 5)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 6: Foundational Skills for Reading Words. Lexia Learning.",
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading. Scientific Studies of Reading, 18(1), 5–21."
    ],
    ell_scaffold: "Use a visual mnemonic (or memory story) for each tricky word; highlight the difficult letter cluster in each word.",
    sped_scaffold: "Reduce to 3–4 target words per session; use Look-Say-Cover-Write-Check with an oral rehearsal step; chart personal progress.",
    prerequisite_skill_ids: ["language_mechanics_spelling_prefix_suffix"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 4-5 spelling test: common misspellings list",
    question_types: ["fib-auto", "mc-text", "letter-tile-spell", "two-button-binary", "sort-into-bins"]
  },

  {
    skill_id: "language_mechanics_spelling_frequently_confused_grade5",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "frequently_confused_grade5",
    developmental_band: "4-5+",
    skill_statement: "Choose the correct word in frequently confused pairs at Grade 4-5 level: affect/effect, accept/except, loose/lose, principal/principle, stationary/stationery, compliment/complement.",
    ccss_codes: ["L.4.2e", "L.5.2e"],
    rit_band: "193-210",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["4.GG.2 Frequently confused words (Grade 4)", "5.GG.1 Frequently confused words: Grade 5 (Grade 5)"],
    sor_citations: [
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading. Scientific Studies of Reading, 18(1), 5–21.",
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction."
    ],
    ell_scaffold: "Teach one pair per lesson; use meaning-based mnemonics (effect = result, noun; affect = action, verb); add a sentence-use test for each word.",
    sped_scaffold: "Create a personal confused-word card deck; student flips to the card for each pair and reads the mnemonic before making a choice.",
    prerequisite_skill_ids: ["language_mechanics_spelling_homophones_confused_words"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 4-5 grammar/editing checkpoint: frequently confused word pairs",
    question_types: ["drop-down-inline", "mc-text", "two-button-binary", "fib-auto", "sort-into-bins"]
  },

  // Additional punctuation + capitalization atoms to reach ~55

  {
    skill_id: "language_mechanics_punctuate_exclamation_point",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "exclamation_point",
    developmental_band: "K-1",
    skill_statement: "Use an exclamation point to end a sentence that expresses strong feeling or emphasis; avoid overuse in expository writing.",
    ccss_codes: ["L.K.2b", "L.1.2b"],
    rit_band: "148-163",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["K.AA.3 Using punctuation: period, question mark, exclamation point (Kindergarten)", "1.AA.4 Choosing end punctuation (Grade 1)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning.",
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction."
    ],
    ell_scaffold: "Read exclamatory sentences aloud with dramatic voice first; connect the punctuation mark to the emotion it signals.",
    sped_scaffold: "Use an 'emotion meter' (1-5 scale); show that only sentences at level 5 get exclamation points.",
    prerequisite_skill_ids: ["language_mechanics_punctuate_end_period"],
    next_skill_ids: ["language_mechanics_punctuate_question_mark"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District K-1 writing sample: appropriate use of end punctuation",
    question_types: ["two-button-binary", "drop-down-inline", "mc-text", "tap-hotspot", "fib-auto"]
  },

  {
    skill_id: "language_mechanics_punctuate_question_mark",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "question_mark",
    developmental_band: "K-1",
    skill_statement: "Use a question mark to end an interrogative sentence.",
    ccss_codes: ["L.K.2b", "L.1.2b"],
    rit_band: "148-163",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["K.AA.3 Using punctuation: period, question mark, exclamation point (Kindergarten)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning.",
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction."
    ],
    ell_scaffold: "Teach question word-order inversion (Do you…? Is she…?) alongside the question mark; connect to Arabic question intonation differences.",
    sped_scaffold: "Use a rising-inflection voice cue; students practice distinguishing statements from questions by listening, then confirm with punctuation.",
    prerequisite_skill_ids: ["language_mechanics_punctuate_end_period"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District K-1 writing sample: question mark usage",
    question_types: ["two-button-binary", "drop-down-inline", "mc-text", "tap-hotspot", "fib-auto"]
  },

  {
    skill_id: "language_mechanics_comma_greeting_closing",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "comma_letter_greeting_closing",
    developmental_band: "1-2",
    skill_statement: "Use a comma after the greeting and closing of a friendly letter (Dear Amal, / Your friend,).",
    ccss_codes: ["L.1.2c", "L.2.2b"],
    rit_band: "160-175",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["1.BB.3 Commas in greetings and closings (Grade 1)", "2.BB.3 Punctuate letters correctly (Grade 2)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning.",
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction."
    ],
    ell_scaffold: "Use a letter template with the greeting and closing pre-filled to highlight their position; model reading the comma as a breath-pause.",
    sped_scaffold: "Provide a letter frame with comma chips already placed at the greeting and closing; student reads and identifies where commas belong.",
    prerequisite_skill_ids: ["language_mechanics_punctuate_end_period"],
    next_skill_ids: ["language_mechanics_comma_series"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 1-2 friendly letter writing task: greeting and closing punctuation",
    question_types: ["tap-hotspot", "fib-auto", "two-button-binary", "drop-down-inline", "mc-text"]
  },

  {
    skill_id: "language_mechanics_capitalize_holidays",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "holidays_and_events",
    developmental_band: "2-3",
    skill_statement: "Capitalize the names of holidays, special events, and commemorations (Eid al-Fitr, Ramadan, National Day, Thanksgiving, Earth Day).",
    ccss_codes: ["L.2.2a", "L.3.2a"],
    rit_band: "168-183",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["2.AA.3 Capitalizing proper nouns: holidays and events (Grade 2)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning.",
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction."
    ],
    ell_scaffold: "Use a class calendar with holiday names; connect the capitalization rule to the idea that holiday names are proper nouns (names of special events).",
    sped_scaffold: "Provide a holiday name card bank; student identifies which are proper nouns requiring capitalization by checking whether they are names of specific events.",
    prerequisite_skill_ids: ["language_mechanics_capitalize_proper_noun_person"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 2-3 grammar checkpoint: capitalizing holiday names",
    question_types: ["tap-hotspot", "two-button-binary", "fib-auto", "mc-text", "hot-text-word"]
  },

  {
    skill_id: "language_mechanics_spelling_irregular_plurals",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "irregular_plurals",
    developmental_band: "2-3",
    skill_statement: "Spell common irregular plural nouns correctly: mice, feet, children, teeth, men, women, geese, oxen, fish, sheep.",
    ccss_codes: ["L.2.2e", "L.3.2e", "L.1.1c"],
    rit_band: "167-183",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["1.GG.2 Form irregular plurals (Grade 1)", "2.GG.3 Spell irregular plurals (Grade 2)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 6: Foundational Skills for Reading Words. Lexia Learning.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Irregular plurals must be memorized; create a personal word wall sorted by pattern (vowel change: man/men, foot/feet; -en: ox/oxen; no change: sheep/sheep).",
    sped_scaffold: "Use a flip-book: singular on the front flap, plural on the back; student practices the pair aloud before writing.",
    prerequisite_skill_ids: ["language_mechanics_spelling_cvc_pattern"],
    next_skill_ids: ["language_mechanics_spelling_change_y_to_i"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 2 spelling assessment: irregular plural forms",
    question_types: ["fib-auto", "mc-text", "letter-tile-spell", "sort-into-bins", "two-button-binary"]
  },

  {
    skill_id: "language_mechanics_spelling_silent_letters",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "silent_letter_patterns",
    developmental_band: "2-3",
    skill_statement: "Recognize and spell words with common silent-letter patterns: kn- (know, knight), wr- (write, wrong), gn- (gnome, sign), -mb (lamb, comb), -gh (night, right).",
    ccss_codes: ["L.2.2e", "L.3.2e", "RF.2.3"],
    rit_band: "170-187",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["2.FF.7 Spell words with silent letters (Grade 2)", "3.FF.6 Silent letter patterns (Grade 3)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 6: Foundational Skills for Reading Words. Lexia Learning.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18.",
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading. Scientific Studies of Reading, 18(1), 5–21."
    ],
    ell_scaffold: "Teach silent letters as 'sleeping letters — they're there but you can't hear them'; group words by pattern into small families for systematic learning.",
    sped_scaffold: "Cross out silent letters in a contrasting color; read the word without the silent letter to confirm pronunciation before spelling.",
    prerequisite_skill_ids: ["language_mechanics_spelling_cvce_pattern"],
    next_skill_ids: ["language_mechanics_spelling_prefix_suffix"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "UFLI Scope & Sequence — silent letter units; district Grade 2-3 spelling probe",
    question_types: ["letter-tile-spell", "fib-auto", "two-button-binary", "sort-into-bins", "mc-text"]
  },

  {
    skill_id: "language_mechanics_spelling_compound_words",
    subject: "language",
    strand: "mechanics",
    domain: "spelling",
    sub_domain: "compound_word_spelling",
    developmental_band: "2-3",
    skill_statement: "Spell common closed compound words as single units (baseball, bookshelf, sunflower, bedroom) and open or hyphenated compounds correctly.",
    ccss_codes: ["L.2.2e", "L.3.2e"],
    rit_band: "168-183",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["2.FF.8 Spell compound words (Grade 2)", "3.FF.7 Compound word spelling patterns (Grade 3)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 6: Foundational Skills for Reading Words. Lexia Learning.",
      "Treiman, R., & Bourassa, D. (2000). The development of spelling skill. Topics in Language Disorders, 20(3), 1–18."
    ],
    ell_scaffold: "Teach compound words as portmanteau-style combinations; use picture-pair cards (sun + flower = sunflower) to build the concept before spelling.",
    sped_scaffold: "Provide the two base words on separate tiles; student combines them before writing the compound word from memory.",
    prerequisite_skill_ids: ["language_mechanics_spelling_cvc_pattern"],
    next_skill_ids: ["language_mechanics_spelling_prefix_suffix"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 2-3 spelling assessment: closed compound words",
    question_types: ["fib-auto", "letter-tile-spell", "mc-text", "sort-into-bins", "build-with-tiles"]
  },

  {
    skill_id: "language_mechanics_comma_tag_question",
    subject: "language",
    strand: "mechanics",
    domain: "punctuation",
    sub_domain: "comma_tag_question",
    developmental_band: "4-5+",
    skill_statement: "Use a comma before a tag question added to the end of a statement (You finished your homework, didn't you?).",
    ccss_codes: ["L.4.2b", "L.5.2b"],
    rit_band: "192-207",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["4.BB.5 Commas with tag questions (Grade 4)"],
    sor_citations: [
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction.",
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning."
    ],
    ell_scaffold: "Tag questions are grammatically complex for ELL students; start with recognition (is the question at the end a tag?) before requiring production.",
    sped_scaffold: "Use an auditory approach: hear the statement, hear the tag, place comma chip between them; then write the complete sentence.",
    prerequisite_skill_ids: ["language_mechanics_comma_compound_sentence"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 4-5 grammar checkpoint: comma before tag questions",
    question_types: ["drop-down-inline", "two-button-binary", "mc-text", "fib-auto", "tap-hotspot"]
  },

  {
    skill_id: "language_mechanics_capitalize_direct_quotation",
    subject: "language",
    strand: "mechanics",
    domain: "capitalization",
    sub_domain: "direct_quotation_capitalization",
    developmental_band: "3-5",
    skill_statement: "Capitalize the first word of a direct quotation when it begins a new sentence, even when introduced mid-sentence by a dialogue tag.",
    ccss_codes: ["L.3.2a", "L.4.2a"],
    rit_band: "180-196",
    rit_test: "Language Usage 2-12",
    rit_instructional_area: "Mechanics",
    ixl_skills: ["3.AA.4 Capitalize the first word of a quotation (Grade 3)", "4.AA.4 Capitalizing direct quotations (Grade 4)"],
    sor_citations: [
      "Moats, L.C. (2020). LETRS Volume 2, Unit 7: Teaching Spelling, Sentence Mechanics, and Handwriting. Lexia Learning.",
      "Reed, D.K. (2012). Why teach spelling? RMC Research Corporation, Center on Instruction."
    ],
    ell_scaffold: "Use a picture-book dialogue page; map the spoken text in each speech bubble to the printed dialogue, highlighting the capital letter that begins each quote.",
    sped_scaffold: "Provide sentence strips with the dialogue tag and quotation as separate strips; student places the capital letter marker on the first word of the quotation strip.",
    prerequisite_skill_ids: ["language_mechanics_punctuate_quotation_marks_dialogue"],
    next_skill_ids: [],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "District Grade 3-4 writing sample: capitalization in dialogue",
    question_types: ["tap-hotspot", "fib-auto", "two-button-binary", "mc-text", "hot-text-word"]
  }

];
