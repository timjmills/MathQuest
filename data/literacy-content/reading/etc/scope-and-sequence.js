// AUTO-COMPILED from Design Documents/Explode the Code Digital Replica_*.md
// Source of truth: EPS Learning published scope-and-sequence + lesson sampler.
// Edit this file (not the design doc) if you find new EPS material.
//
// 17 phonics workbooks (Primers A/B/C → Books 1, 1½, 2, 2½, 3, 3½, 4, 4½, 5,
// 5½, 6, 6½, 7, 8) plus 4 Beyond The Code comprehension workbooks. Half-books
// re-teach the same skill set with fresh items. There are NO 7½ or 8½ books.

/** @type {Record<string, { display: string, grade: string, skills: string[], sample_words?: string[] }>} */
export const ETC_SCOPE = Object.freeze({
    primer_a: {
        display: "Get Ready for the Code (Primer A)",
        grade: "PreK-K",
        skills: [
            "consonant_b", "consonant_f", "consonant_k",
            "consonant_m", "consonant_r", "consonant_t",
            "phonemic_awareness", "letter_formation",
            "fine_motor_tracking", "listening_directions",
            "visual_discrimination",
        ],
        sample_words: ["bat", "fish", "kite", "moon", "rat", "top"],
    },
    primer_b: {
        display: "Get Set for the Code (Primer B)",
        grade: "PreK-K",
        skills: ["consonant_d", "consonant_h", "consonant_j",
                 "consonant_n", "consonant_p", "consonant_s"],
        sample_words: ["dog", "hat", "jar", "nest", "pig", "sun"],
    },
    primer_c: {
        display: "Go for the Code (Primer C)",
        grade: "PreK-1",
        skills: ["consonant_c", "consonant_g", "consonant_l",
                 "consonant_q", "consonant_v", "consonant_w",
                 "consonant_x", "consonant_y", "consonant_z",
                 "consonant_review_a_c"],
        sample_words: ["cat", "goat", "lamp", "queen", "van", "web", "fox", "yo-yo", "zip"],
    },
    book_1: {
        display: "ETC Book 1 — Short vowels",
        grade: "1",
        skills: ["consonant_pretest", "short_a", "short_i",
                 "short_u", "short_e", "short_o",
                 "cvc_blending", "cumulative_review", "posttest_1"],
        sample_words: ["cat", "bat", "rat", "tag", "sap", "pal", "cap", "bass",
                       "sit", "pin", "pig", "cup", "bun", "hop", "pet", "bed"],
    },
    book_1_5: {
        display: "ETC Book 1½ — Short vowels review (10 lessons)",
        grade: "1",
        skills: ["short_a", "short_i", "short_u", "short_e", "short_o", "review_1_5", "posttest_1_5"],
    },
    book_2: {
        display: "ETC Book 2 — Blends",
        grade: "1-2",
        skills: ["lblends", "sblends", "rblends", "tw_blend",
                 "final_blends", "ccvc_blending", "cvcc_blending",
                 "review_2", "posttest_2"],
        sample_words: ["bl", "cl", "fl", "gl", "pl", "sl",
                       "sk", "sm", "sn", "sp", "st", "sw",
                       "br", "cr", "dr", "fr", "gr", "pr", "tr", "tw",
                       "mp", "ft", "lt", "nt", "lf", "lp", "nd", "nk"],
    },
    book_2_5: {
        display: "ETC Book 2½ — Blends review",
        grade: "1-2",
        skills: ["lblends", "sblends", "rblends", "final_blends", "review_2_5", "posttest_2_5"],
    },
    book_3: {
        display: "ETC Book 3 — Y as vowel, silent-e, digraphs, vowel teams",
        grade: "1-2",
        skills: ["y_as_vowel", "silent_e", "vce_a", "vce_i", "vce_o", "vce_u", "vce_e",
                 "digraph_sh", "digraph_ch", "digraph_th", "digraph_wh",
                 "digraph_ck", "digraph_ng", "trigraph_tch",
                 "vowel_team_ee_ea", "vowel_team_ai_ay", "vowel_team_oa_ow",
                 "review_3a", "review_3b", "posttest_3"],
        sample_words: ["sky", "by", "cake", "hike", "rope", "cute", "sheet",
                       "chip", "thin", "whip", "duck", "ring", "match",
                       "tree", "rain", "boat"],
    },
    book_3_5: {
        display: "ETC Book 3½ — VCe & vowel-teams review",
        grade: "1-2",
        skills: ["silent_e", "digraphs", "vowel_teams", "review_3_5", "posttest_3_5"],
    },
    book_4: {
        display: "ETC Book 4 — Compounds, suffixes, syllable types",
        grade: "2",
        skills: ["compound_words",
                 "suffix_ful", "suffix_ing", "suffix_est", "suffix_ed", "suffix_ness",
                 "syllable_type_open", "syllable_type_closed",
                 "syllable_type_silent_e", "syllable_type_vowel_team",
                 "syllable_type_consonant_le",
                 "syllabication_2", "syllabication_3",
                 "review_4", "posttest_4"],
        sample_words: ["cupcake", "playful", "running", "fastest", "jumped", "kindness",
                       "open", "rabbit", "table", "purple", "pancake"],
    },
    book_4_5: {
        display: "ETC Book 4½ — Suffix and syllable review",
        grade: "2",
        skills: ["compound_words", "suffix_basic", "syllable_types", "review_4_5", "posttest_4_5"],
    },
    book_5: {
        display: "ETC Book 5 — -ed, -ey, word families, 3-letter blends",
        grade: "2-3",
        skills: ["ed_three_sounds",
                 "suffix_ey",
                 "wordfam_all_alk", "wordfam_old_olt_oll", "wordfam_ild_ind",
                 "digraph_qu", "blend_thr", "blend_shr",
                 "blend_scr", "blend_str", "blend_spr", "blend_spl",
                 "review_5a", "review_5b", "posttest_5"],
        sample_words: ["jumped", "wanted", "rained", "monkey", "honey",
                       "ball", "talk", "old", "bolt", "toll",
                       "child", "find", "queen", "throw", "shrub",
                       "scrap", "string", "spring", "splash"],
    },
    book_5_5: {
        display: "ETC Book 5½ — -ed, families, 3-letter blends review",
        grade: "2-3",
        skills: ["ed_three_sounds", "suffix_ey", "word_families", "blends_3letter", "review_5_5", "posttest_5_5"],
    },
    book_6: {
        display: "ETC Book 6 — R-controlled, -igh, vowel teams + diphthongs",
        grade: "2-3",
        skills: ["rcontrol_ar", "rcontrol_or", "rcontrol_er",
                 "rcontrol_ir", "rcontrol_ur", "rcontrol_war_wor",
                 "silent_letter_igh",
                 "vowel_team_oo", "vowel_team_ea_alt", "vowel_team_ie",
                 "diphthong_oi", "diphthong_oy", "diphthong_ou", "diphthong_ow",
                 "vowel_team_au", "vowel_team_aw",
                 "vowel_team_ew", "vowel_team_ui", "vowel_team_ue",
                 "multisyllabic_blending",
                 "review_6a", "review_6b", "review_6c", "posttest_6"],
        sample_words: ["car", "sport", "her", "bird", "turn", "warm", "world",
                       "high", "moon", "head", "pie",
                       "boil", "boy", "out", "cow", "haunt", "saw",
                       "few", "fruit", "blue"],
    },
    book_6_5: {
        display: "ETC Book 6½ — R-controlled and vowel-team review",
        grade: "2-3",
        skills: ["rcontrol_full", "vowel_teams_full", "diphthongs", "review_6_5", "posttest_6_5"],
    },
    book_7: {
        display: "ETC Book 7 — Soft c/g, silent letters, ph, ear, ei/eigh, stories",
        grade: "3-4",
        skills: ["soft_c", "soft_g",
                 "silent_dge", "silent_mb", "silent_kn", "silent_wr",
                 "silent_t", "silent_h",
                 "digraph_ph",
                 "ear_three_sounds",
                 "ei_eigh",
                 "decodable_story",
                 "story_comprehension",
                 "crossword", "wordfind",
                 "review_7a", "review_7b", "review_7c", "posttest_7"],
        sample_words: ["city", "circle", "giraffe", "gem",
                       "bridge", "lamb", "knee", "wrist",
                       "listen", "honest", "phone",
                       "earth", "early", "year",
                       "eight", "weigh", "vein"],
    },
    book_8: {
        display: "ETC Book 8 — Advanced suffixes, antonyms/synonyms, stories",
        grade: "3-4",
        skills: ["suffix_ness_less", "suffix_ous", "suffix_or",
                 "suffix_ist", "suffix_ity", "suffix_ture", "suffix_ment",
                 "suffix_able", "suffix_ible",
                 "suffix_sion", "suffix_tion",
                 "suffix_ance", "suffix_ence",
                 "suffix_tive", "suffix_sive",
                 "suffix_ify", "suffix_ize",
                 "ti_ci_initial",
                 "antonyms", "synonyms",
                 "multisyllabic_build",
                 "story_comprehension",
                 "crossword", "wordfind",
                 "review_8a", "review_8b", "review_8c", "posttest_8"],
        sample_words: ["happiness", "fearless", "famous", "actor",
                       "artist", "ability", "creature", "movement",
                       "comfortable", "visible", "decision", "action",
                       "balance", "silence", "active", "massive",
                       "simplify", "organize", "patient", "precious"],
    },
});

/**
 * Beyond The Code chapter inventory. Each chapter teaches:
 *   spelling patterns • sight words • vocabulary • sequencing • categorizing
 *   following directions • critical thinking • story recall • inferential
 *   thinking • rhyming words • multi-syllabic words • match-sentence-to-picture
 */
export const BTC_BOOKS = Object.freeze({
    btc_1: {
        display: "Beyond the Code 1",
        aligns_with: "etc_3",  // long+short vowels despite ETC 1 alignment marketing
        stories: ["Zack the Dog", "Six Kids Jog", "Help! 911"],
        sight_words: ["why", "door", "they"],
    },
    btc_2: {
        display: "Beyond the Code 2",
        aligns_with: "etc_2",
        stories: ["Plum", "The Camp Out", "Greg Can't Sleep", "Max",
                  "Good, Bad, or Best?", "Stand Up for Lemonade", "Lost in the City"],
        sight_words: ["backpack", "asleep", "light", "could", "spaghetti"],
    },
    btc_3: {
        display: "Beyond the Code 3",
        aligns_with: "etc_3",
        stories: ["Kids Need Pets", "What's the Fuss?", "Day Care for Dogs",
                  "A Fish That Can Fly!", "Kate and the Ten-Speed Bike"],
        sight_words: ["doesn't", "bluefish", "together", "skateboard", "school"],
    },
    btc_4: {
        display: "Beyond the Code 4",
        aligns_with: "etc_4",
        stories: ["Nelson Went Overboard for Dogs", "What a Scare!",
                  "A Different Kind of Library", "A Birthday to Remember",
                  "The Treasure Hunt", "A Wild Ride"],
        sight_words: ["bright", "birthday", "lighthouse", "Michigan"],
    },
});

/**
 * The 19 ETC archetypes, mapped to canonical Literacy Quest widgets.
 * (Reverse-engineered from EPS Sample Lesson 3, Book 1, pp. 18–25.)
 *
 * widget = the existing literacy-question-render.js entry that closest
 * matches the print exercise. Pages 17–19 (story+comprehension, crossword,
 * posttest) are Book 7+ only.
 */
export const ETC_ARCHETYPES = Object.freeze([
    { id: 1,  name: "Initial sound match",         instruction: "Circle the picture that starts with this sound.", widget: "mc-image",                books: ["A","B","C","1"] },
    { id: 2,  name: "Same word match",             instruction: "Circle the same word.",                            widget: "mc-multi-select",         books: ["A","B","C","1","2","3"] },
    { id: 3,  name: "Letter tracing",              instruction: "Trace the letter.",                                 widget: "letter-trace",            books: ["A","B","C"] },
    { id: 4,  name: "Listening yes/no",            instruction: "Listen and pick the picture.",                      widget: "mc-audio",                books: ["A","B","C"] },
    { id: 5,  name: "X-out wrong word/picture",    instruction: "X out the one that does not match.",                widget: "x-strikethrough-choice",  books: ["1","2","3","4","5","6","7","8"] },
    { id: 6,  name: "Read, copy, X it",            instruction: "Read, copy, and X it.",                              widget: "column-letter-build",     books: ["1","2","3","4","5","6"] },
    { id: 7,  name: "Spell, write (column build)", instruction: "Spell. Write.",                                      widget: "column-letter-build",     books: ["1","2","3","4","5","6"] },
    { id: 8,  name: "Word-bank match and write",   instruction: "Match and write it.",                                widget: "match-pairs",             books: ["1","2","3","4","5","6","7","8"] },
    { id: 9,  name: "Sentence-to-picture X-it",    instruction: "X out the sentence that does not match the picture.", widget: "x-strikethrough-choice", books: ["1","2","3","4","5","6","7","8"] },
    { id: 10, name: "Yes/No comprehension",        instruction: "Circle Y or N.",                                     widget: "two-button-binary",       books: ["2","3","4","5","6","7","8"] },
    { id: 11, name: "Cloze with picture/word bank",instruction: "Fill in the blank.",                                 widget: "drop-down-inline",        books: ["4","5","6","7","8"] },
    { id: 12, name: "Word-family ladder",          instruction: "Build the word.",                                    widget: "word-chain",              books: ["1","2","5","6"] },
    { id: 13, name: "Compound word build",         instruction: "Put two words together.",                            widget: "sentence-build",          books: ["4"] },
    { id: 14, name: "Suffix/prefix build",         instruction: "Add the ending. Pick the meaning.",                  widget: "match-pairs",             books: ["4","5","8"] },
    { id: 15, name: "Syllable division",           instruction: "Mark the syllable break.",                           widget: "tap-hotspot",             books: ["4","5","6","7","8"] },
    { id: 16, name: "Write-it / draw-and-label",   instruction: "Write it.",                                          widget: "write-from-picture",      books: ["all"] },
    { id: 17, name: "Decodable story + comp",      instruction: "Read the story and answer.",                         widget: "hot-text-paragraph",      books: ["7","8","BTC1","BTC2","BTC3","BTC4"] },
    { id: 18, name: "Crossword / word-find",       instruction: "Fill in or find the words.",                         widget: "letter-tile-spell",       books: ["7","8"] },
    { id: 19, name: "Pretest / Posttest",          instruction: "Show what you know.",                                widget: "mc-text",                 books: ["1","all"] },
]);

/** EPS verbatim instruction lexicon — replicate exactly. */
export const ETC_INSTRUCTION_LEXICON = Object.freeze([
    "a says /ă/ as in apple.",
    "f says /f/ as in fish.",
    "Find the picture that begins with the sound of the letter below. Circle it.",
    "Circle the same word.",
    "Read, copy, and X it.",
    "Spell. Write.",
    "Match and write it.",
    "X it.",
    "Write it.",
    "Think About It!",
]);

/**
 * Lesson Routine at a Glance — the same teacher-led routine for every ETC
 * lesson (printed inside every Teacher's Guide cover). Use as a per-lesson
 * scaffold in the digital app.
 */
export const ETC_LESSON_ROUTINE = Object.freeze([
    "Quick Review (auditory ending-sound discrimination)",
    "Phonemic Awareness (blend / segment / identify)",
    "Phonics (Code Card display, Wall Chart key word, choral repetition)",
    "Vocabulary (define unfamiliar items on the page)",
    "Student Pages (read directions, model 1 item, then independent)",
    "Fluency (word-family flashcards against the clock)",
    "Comprehension (open questions, demonstrations, categories)",
    "Writing (word-clue dictation)",
    "Differentiation (Visual / Auditory / Kinesthetic + ½-book extra practice)",
]);

/** ETC stats — useful for skill browser and dashboards. */
export function getEtcStats() {
    return {
        bookCount: Object.keys(ETC_SCOPE).length,
        btcCount:  Object.keys(BTC_BOOKS).length,
        archetypeCount: ETC_ARCHETYPES.length,
    };
}

/** Return all sample words across every ETC book. */
export function getAllEtcSampleWords() {
    const out = new Set();
    for (const key of Object.keys(ETC_SCOPE)) {
        const book = ETC_SCOPE[key];
        if (Array.isArray(book.sample_words)) {
            for (const w of book.sample_words) out.add(w.toLowerCase());
        }
    }
    return Array.from(out);
}

/** Return all BTC sight words across all four comprehension books. */
export function getAllBtcSightWords() {
    const out = new Set();
    for (const key of Object.keys(BTC_BOOKS)) {
        for (const w of BTC_BOOKS[key].sight_words || []) out.add(w.toLowerCase());
    }
    return Array.from(out);
}
