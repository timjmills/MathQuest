/**
 * Phonemic Awareness — Skill Atom Catalog
 * Part 1 of the K-5 ELA Scope & Sequence
 *
 * Auditory-only (no print). Covers all canonical PA sub-skills:
 *   Word counting · Syllable awareness · Onset-rime · Phoneme isolation ·
 *   Phoneme blending · Phoneme segmentation (Elkonin boxes) ·
 *   Phoneme manipulation (Kilpatrick advanced) · Sound categorization
 *
 * 25 atoms total. All K-2 atoms use audio auto-speak, 3 choices max,
 * and large pill buttons per the K-2 design spec.
 *
 * CCSS alignment: RF.K.2 (K), RF.1.2 (Grade 1)
 * RIT range: 131–180 (Reading K-2)
 *
 * @see /docs/literacy-quest/DATA_MODEL.md
 * @see /docs/literacy-quest/QUESTION_TYPES.md
 * @see /docs/literacy-quest/QUESTION_SKILL_MATRIX.md §4.1
 */

/** @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]} */
const phonemicAwarenessSkills = [

  // ─── WORD AWARENESS ───────────────────────────────────────────────────────

  {
    skill_id: "reading_pa_word_count_in_sentence",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "word_awareness",
    sub_domain: "word_counting",
    developmental_band: "K-1",
    skill_statement: "Count the number of words in a spoken sentence of 2–5 words.",
    ccss_codes: ["RF.K.2a"],
    rit_band: "131-140",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.1 Count words in a sentence (Kindergarten)"],
    sor_citations: [
      "Moats, L.C. (2020). Speech to Print: Language Essentials for Teachers (3rd ed.). Brookes Publishing. Chapter 2.",
      "Heggerty, M. (2022). Phonemic Awareness: The Skills That They Need to Help Them Succeed. Bridge to Literacy. Grade K scope.",
      "National Reading Panel (2000). Teaching Children to Read: An Evidence-Based Assessment of the Scientific Research Literature on Reading and Its Implications for Reading Instruction. NICHD."
    ],
    ell_scaffold: "Use physical objects (blocks or cubes) for each spoken word; ELL students can move a cube as each word is said aloud before counting.",
    sped_scaffold: "Clap once for each word while saying the sentence; use color-coded cards, one per word, to support counting.",
    prerequisite_skill_ids: [],
    next_skill_ids: ["reading_pa_syllable_count", "reading_pa_rhyme_identify"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty K Phonemic Awareness Assessment — Word Awareness tasks",
    question_types: ["mc-audio", "two-button-binary", "sort-into-bins", "tap-hotspot"]
  },

  // ─── SYLLABLE AWARENESS ───────────────────────────────────────────────────

  {
    skill_id: "reading_pa_syllable_count",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "syllable_awareness",
    sub_domain: "syllable_counting",
    developmental_band: "K-1",
    skill_statement: "Count the number of syllables in a spoken word by clapping or tapping.",
    ccss_codes: ["RF.K.2b"],
    rit_band: "133-143",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.2 Count syllables (Kindergarten)", "1A.1 Count syllables (Grade 1)"],
    sor_citations: [
      "Heggerty, M. (2022). Phonemic Awareness: The Skills That They Need to Help Them Succeed. Bridge to Literacy. Grade K scope.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing. Chapter 2.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD."
    ],
    ell_scaffold: "Model chin-drop technique (each syllable drops the chin); Arabic, Spanish, and Tagalog are syllable-timed languages — connect to student L1 rhythm.",
    sped_scaffold: "Finger-tap each syllable on the student's arm or desk; limit to 1–2 syllable words initially; use visual syllable beat strips.",
    prerequisite_skill_ids: ["reading_pa_word_count_in_sentence"],
    next_skill_ids: ["reading_pa_syllable_blend", "reading_pa_syllable_segment"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty K–1 Syllable Counting tasks; DIBELS FSF screening (syllable awareness proxy)",
    question_types: ["mc-audio", "mc-image", "sort-into-bins", "two-button-binary", "tap-hotspot"]
  },

  {
    skill_id: "reading_pa_syllable_blend",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "syllable_awareness",
    sub_domain: "syllable_blending",
    developmental_band: "K-1",
    skill_statement: "Blend two or three spoken syllable chunks to identify a whole word.",
    ccss_codes: ["RF.K.2c", "RF.1.2b"],
    rit_band: "135-145",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.3 Blend syllables (Kindergarten)", "1A.2 Blend syllables (Grade 1)"],
    sor_citations: [
      "Ehri, L.C., & Wilce, L.S. (1980). The influence of orthography on readers' conceptualization of the phonemic structure of words. Applied Psycholinguistics, 1(4), 371–385.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD."
    ],
    ell_scaffold: "Use a 'syllable puppet' that moves one arm per syllable chunk; pause between chunks to give processing time for ELL learners.",
    sped_scaffold: "Provide picture supports for target words; reduce to 2-syllable compound words first (rain+bow, cup+cake).",
    prerequisite_skill_ids: ["reading_pa_syllable_count"],
    next_skill_ids: ["reading_pa_phoneme_blending_2", "reading_pa_phoneme_blending_3"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade 1 Syllable Blending tasks",
    question_types: ["mc-audio", "mc-image", "two-button-binary", "dnd-linked", "sort-into-bins"]
  },

  {
    skill_id: "reading_pa_syllable_segment",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "syllable_awareness",
    sub_domain: "syllable_segmenting",
    developmental_band: "K-1",
    skill_statement: "Segment a spoken 2–3 syllable word into its individual syllable chunks.",
    ccss_codes: ["RF.K.2b", "RF.1.2b"],
    rit_band: "135-147",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.4 Segment syllables (Kindergarten)", "1A.3 Segment syllables (Grade 1)"],
    sor_citations: [
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing. Chapter 2.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD."
    ],
    ell_scaffold: "Let students say the word in their L1 first, then repeat in English; clap each syllable together chorally.",
    sped_scaffold: "Use physical syllable tiles (one tile per syllable) that the student can push forward as each chunk is said.",
    prerequisite_skill_ids: ["reading_pa_syllable_count", "reading_pa_syllable_blend"],
    next_skill_ids: ["reading_pa_phoneme_segmenting_2", "reading_pa_phoneme_segmenting_3"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade K–1 Syllable Segmenting tasks",
    question_types: ["mc-audio", "sound-box", "tap-hotspot", "dnd-linked", "sort-into-bins"]
  },

  // ─── ONSET-RIME AWARENESS ─────────────────────────────────────────────────

  {
    skill_id: "reading_pa_rhyme_identify",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "onset_rime",
    sub_domain: "rhyme_identification",
    developmental_band: "K-1",
    skill_statement: "Identify whether two spoken words rhyme by recognizing matching rime units.",
    ccss_codes: ["RF.K.2a"],
    rit_band: "136-148",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.5 Identify rhyming words (Kindergarten)", "1A.4 Do the words rhyme? (Grade 1)"],
    sor_citations: [
      "Bradley, L., & Bryant, P.E. (1983). Categorizing sounds and learning to read — a causal connection. Nature, 301, 419–421.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD."
    ],
    ell_scaffold: "Pre-teach common rime families (at, an, it) with picture cards; ELL students may not have encountered English rhyme conventions — explicit modeling is required.",
    sped_scaffold: "Use minimal pairs with picture cards; start with obvious rhyme pairs (cat/bat) before introducing non-rhymes; errorless learning sequence.",
    prerequisite_skill_ids: ["reading_pa_syllable_count"],
    next_skill_ids: ["reading_pa_rhyme_produce", "reading_pa_phoneme_isolation_initial"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "DIBELS NWF; Heggerty K Rhyme Identification tasks",
    question_types: ["mc-image", "two-button-binary", "sort-into-bins", "tap-hotspot", "mc-audio"]
  },

  {
    skill_id: "reading_pa_rhyme_produce",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "onset_rime",
    sub_domain: "rhyme_production",
    developmental_band: "K-1",
    skill_statement: "Produce a word (real or nonsense) that rhymes with a given spoken word.",
    ccss_codes: ["RF.K.2a"],
    rit_band: "138-150",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.6 Choose the rhyming word (Kindergarten)", "1A.5 Rhyming words (Grade 1)"],
    sor_citations: [
      "Goswami, U., & Bryant, P. (1990). Phonological Skills and Learning to Read. Lawrence Erlbaum Associates.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD."
    ],
    ell_scaffold: "Accept nonsense rhymes as valid (e.g., 'zat' rhymes with 'cat'); model production using the rime family chart; scaffolded sentence frame: 'Cat rhymes with _at: bat, hat, mat...'",
    sped_scaffold: "Provide a visual rime bank students can reference; accept first correct attempt without penalty for self-corrections.",
    prerequisite_skill_ids: ["reading_pa_rhyme_identify"],
    next_skill_ids: ["reading_pa_phoneme_isolation_initial", "reading_pa_phoneme_blending_2"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade K–1 Rhyme Production tasks",
    question_types: ["mc-image", "mc-audio", "sort-into-bins", "tap-hotspot", "two-button-binary"]
  },

  {
    skill_id: "reading_pa_onset_rime_blend",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "onset_rime",
    sub_domain: "onset_rime_blending",
    developmental_band: "K-1",
    skill_statement: "Blend a spoken onset and rime to identify a complete word (e.g., /b/ + /at/ = 'bat').",
    ccss_codes: ["RF.K.2c", "RF.1.2b"],
    rit_band: "138-152",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.7 Blend onset and rime (Kindergarten)"],
    sor_citations: [
      "Goswami, U. (1990). A special link between rhyming skills and the use of orthographic analogies by beginning readers. Journal of Child Psychology and Psychiatry, 31(2), 301–311.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy.",
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading. Scientific Studies of Reading, 18(1), 5–21."
    ],
    ell_scaffold: "Pair onset-rime blending with physical gestures (fist = onset, open hand = rime, clap = blend); provide picture cues for the target word.",
    sped_scaffold: "Use colored blocks — one for onset, one for rime — physically pushing them together to represent blending.",
    prerequisite_skill_ids: ["reading_pa_rhyme_identify", "reading_pa_syllable_blend"],
    next_skill_ids: ["reading_pa_phoneme_blending_2", "reading_pa_phoneme_isolation_initial"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade K Onset-Rime Blending tasks",
    question_types: ["mc-audio", "mc-image", "two-button-binary", "dnd-linked", "sort-into-bins"]
  },

  // ─── PHONEME ISOLATION ────────────────────────────────────────────────────

  {
    skill_id: "reading_pa_phoneme_isolation_initial",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_isolation",
    sub_domain: "initial_phoneme",
    developmental_band: "K-1",
    skill_statement: "Isolate and say the first phoneme in a spoken CVC or CCVC word.",
    ccss_codes: ["RF.K.2d", "RF.1.2c"],
    rit_band: "140-152",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.8 Identify the beginning sound (Kindergarten)", "1A.6 Identify beginning sounds (Grade 1)"],
    sor_citations: [
      "Stanovich, K.E. (1986). Matthew effects in reading: Some consequences of individual differences in the acquisition of literacy. Reading Research Quarterly, 21(4), 360–407.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD."
    ],
    ell_scaffold: "Use mouth-position mirrors and articulation diagrams for each initial phoneme; contrast /p/ vs /b/ for Arabic L1 speakers who may not distinguish voiced/voiceless.",
    sped_scaffold: "Finger-tap the first phoneme only; use sound-box card with only the first box highlighted; 3 attempts with corrective feedback.",
    prerequisite_skill_ids: ["reading_pa_rhyme_identify", "reading_pa_syllable_count"],
    next_skill_ids: ["reading_pa_phoneme_isolation_final", "reading_pa_phoneme_blending_2"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "DIBELS PSF; Heggerty Grade K–1 Initial Sound Isolation tasks",
    question_types: ["mc-audio", "mc-image", "tap-hotspot", "sound-box", "two-button-binary"]
  },

  {
    skill_id: "reading_pa_phoneme_isolation_final",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_isolation",
    sub_domain: "final_phoneme",
    developmental_band: "K-1",
    skill_statement: "Isolate and say the final phoneme in a spoken CVC word.",
    ccss_codes: ["RF.K.2d", "RF.1.2c"],
    rit_band: "142-154",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.9 Identify the ending sound (Kindergarten)", "1A.7 Identify ending sounds (Grade 1)"],
    sor_citations: [
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD."
    ],
    ell_scaffold: "Many ELL L1 languages (Arabic, Cantonese) heavily reduce final consonants; explicitly model final phoneme articulation with elongation and mouth diagrams.",
    sped_scaffold: "Use a Slinky or rubber band stretched then stopped to represent the word ending; highlight the final box in an Elkonin strip.",
    prerequisite_skill_ids: ["reading_pa_phoneme_isolation_initial"],
    next_skill_ids: ["reading_pa_phoneme_isolation_medial", "reading_pa_phoneme_segmenting_2"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade K–1 Final Sound Isolation tasks",
    question_types: ["mc-audio", "mc-image", "tap-hotspot", "sound-box", "sort-into-bins"]
  },

  {
    skill_id: "reading_pa_phoneme_isolation_medial",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_isolation",
    sub_domain: "medial_phoneme",
    developmental_band: "K-1",
    skill_statement: "Isolate and identify the medial vowel phoneme in a spoken CVC word.",
    ccss_codes: ["RF.K.2e", "RF.1.2c"],
    rit_band: "145-158",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.10 Identify the middle sound (Kindergarten)", "1A.8 Identify middle sounds (Grade 1)"],
    sor_citations: [
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading. Scientific Studies of Reading, 18(1), 5–21.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy."
    ],
    ell_scaffold: "Short vowel contrasts (/ă/ vs /ĕ/ vs /ĭ/) are the hardest for ELL students; use vowel gesture cards with hand shapes for each short vowel.",
    sped_scaffold: "Color-code the middle box in Elkonin strips (e.g., red for vowel); use a vowel chart with pictures (apple=/ă/, egg=/ĕ/).",
    prerequisite_skill_ids: ["reading_pa_phoneme_isolation_initial", "reading_pa_phoneme_isolation_final"],
    next_skill_ids: ["reading_pa_phoneme_segmenting_3", "reading_pa_phoneme_blending_3"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade 1 Medial Sound Isolation tasks",
    question_types: ["mc-audio", "mc-image", "two-button-binary", "sound-box", "tap-hotspot"]
  },

  // ─── PHONEME BLENDING ─────────────────────────────────────────────────────

  {
    skill_id: "reading_pa_phoneme_blending_2",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_blending",
    sub_domain: "blending_2_phonemes",
    developmental_band: "K-1",
    skill_statement: "Blend two separately spoken phonemes into a spoken word (VC or CV patterns: /ĭ/ + /t/ = 'it').",
    ccss_codes: ["RF.K.2e", "RF.1.2b"],
    rit_band: "138-150",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.11 Blend phonemes (2 sounds) (Kindergarten)"],
    sor_citations: [
      "Kilpatrick, D.A. (2015). Essentials of Assessing, Preventing, and Overcoming Reading Difficulties. Wiley.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD."
    ],
    ell_scaffold: "Say phonemes slowly with a 1-second pause; use a 'blending board' visual where phoneme tokens slide together; emphasize coarticulation for ELL students.",
    sped_scaffold: "Begin with continuous sounds (/s/, /m/, /n/) rather than stop sounds (/t/, /p/, /k/); use physical tokens to represent each phoneme.",
    prerequisite_skill_ids: ["reading_pa_phoneme_isolation_initial", "reading_pa_rhyme_produce"],
    next_skill_ids: ["reading_pa_phoneme_blending_3", "reading_pa_phoneme_segmenting_2"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade K Phoneme Blending (2-phoneme) tasks",
    question_types: ["mc-audio", "mc-image", "two-button-binary", "dnd-linked", "tap-hotspot"]
  },

  {
    skill_id: "reading_pa_phoneme_blending_3",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_blending",
    sub_domain: "blending_3_phonemes",
    developmental_band: "K-1",
    skill_statement: "Blend three separately spoken phonemes into a spoken CVC word (e.g., /d/ /ŏ/ /g/ = 'dog').",
    ccss_codes: ["RF.K.2e", "RF.1.2b"],
    rit_band: "143-158",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.12 Blend phonemes (3 sounds) (Kindergarten)", "1A.9 Blend phonemes (Grade 1)"],
    sor_citations: [
      "Kilpatrick, D.A. (2015). Essentials of Assessing, Preventing, and Overcoming Reading Difficulties. Wiley.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD."
    ],
    ell_scaffold: "Model blending using a 'robot voice' (slow, segmented) transitioning to natural speech; provide picture arrays for students to confirm their blend.",
    sped_scaffold: "Use Elkonin boxes with chips physically pushed together; finger-blend while saying phonemes; 3-choice picture MC to reduce production demand.",
    prerequisite_skill_ids: ["reading_pa_phoneme_blending_2", "reading_pa_phoneme_isolation_medial"],
    next_skill_ids: ["reading_pa_phoneme_blending_4", "reading_pa_phoneme_segmenting_3"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "DIBELS PSF; Heggerty Grade K–1 3-Phoneme Blending tasks",
    question_types: ["mc-audio", "mc-image", "dnd-linked", "two-button-binary", "sound-box"]
  },

  {
    skill_id: "reading_pa_phoneme_blending_4",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_blending",
    sub_domain: "blending_4_phonemes",
    developmental_band: "K-1",
    skill_statement: "Blend four separately spoken phonemes into a CCVC or CVCC word (e.g., /s/ /t/ /ŏ/ /p/ = 'stop').",
    ccss_codes: ["RF.1.2b"],
    rit_band: "150-163",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["1A.10 Blend phonemes (4 sounds) (Grade 1)"],
    sor_citations: [
      "Kilpatrick, D.A. (2015). Essentials of Assessing, Preventing, and Overcoming Reading Difficulties. Wiley.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy."
    ],
    ell_scaffold: "Consonant clusters are particularly difficult for ELL students; pre-teach the blend as a unit before isolating phonemes; allow extra processing time.",
    sped_scaffold: "Use 4 colored chips in Elkonin strip; model with continuous phoneme stretching before blending; accept self-corrections without penalty.",
    prerequisite_skill_ids: ["reading_pa_phoneme_blending_3"],
    next_skill_ids: ["reading_pa_phoneme_segmenting_4", "reading_pa_phoneme_delete"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade 1 4-Phoneme Blending tasks",
    question_types: ["mc-audio", "mc-image", "dnd-linked", "two-button-binary", "sort-into-bins"]
  },

  // ─── PHONEME SEGMENTATION (ELKONIN BOXES) ────────────────────────────────

  {
    skill_id: "reading_pa_phoneme_segmenting_2",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_segmentation",
    sub_domain: "segmenting_2_phonemes",
    developmental_band: "K-1",
    skill_statement: "Segment a spoken 2-phoneme word (VC or CV) into its individual sounds using Elkonin sound boxes.",
    ccss_codes: ["RF.K.2e"],
    rit_band: "141-153",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.13 Segment phonemes (2 sounds) (Kindergarten)"],
    sor_citations: [
      "Elkonin, D.B. (1973). Reading in the USSR. In J. Downing (Ed.), Comparative Reading (pp. 551–579). Macmillan.",
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading. Scientific Studies of Reading, 18(1), 5–21.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy."
    ],
    ell_scaffold: "Explicitly label each box as 'one sound'; ELL students may segment by syllable — contrast phoneme vs. syllable tasks before and after.",
    sped_scaffold: "Use physical tiles and boxes; say each sound as the chip is pushed; count fingers while segmenting; start with same phoneme words (e.g., 'am', 'in').",
    prerequisite_skill_ids: ["reading_pa_phoneme_blending_2", "reading_pa_phoneme_isolation_initial"],
    next_skill_ids: ["reading_pa_phoneme_segmenting_3"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade K Phoneme Segmentation (2-phoneme) tasks; DIBELS PSF screening",
    question_types: ["sound-box", "mc-audio", "tap-hotspot", "dnd-linked", "two-button-binary"]
  },

  {
    skill_id: "reading_pa_phoneme_segmenting_3",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_segmentation",
    sub_domain: "segmenting_3_phonemes",
    developmental_band: "K-1",
    skill_statement: "Segment a spoken CVC word into its 3 individual phonemes using Elkonin sound boxes.",
    ccss_codes: ["RF.K.2e", "RF.1.2d"],
    rit_band: "150-163",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.14 Segment phonemes (3 sounds) (Kindergarten)", "1A.11 Segment phonemes (Grade 1)"],
    sor_citations: [
      "Elkonin, D.B. (1973). Reading in the USSR. In J. Downing (Ed.), Comparative Reading. Macmillan.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy."
    ],
    ell_scaffold: "Use different colored chips for consonants vs. vowels in the Elkonin boxes to help ELL students distinguish consonant/vowel patterns.",
    sped_scaffold: "Extend time; use larger chips; allow the student to move each chip while saying the sound; reduce to 2 phonemes if needed before progressing.",
    prerequisite_skill_ids: ["reading_pa_phoneme_segmenting_2", "reading_pa_phoneme_isolation_medial"],
    next_skill_ids: ["reading_pa_phoneme_segmenting_4", "reading_pa_phoneme_add"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 30 },
    diagnostic_anchor: "DIBELS PSF; Heggerty Grade 1 3-Phoneme Segmentation tasks",
    question_types: ["sound-box", "mc-audio", "tap-hotspot", "dnd-linked", "sort-into-bins"]
  },

  {
    skill_id: "reading_pa_phoneme_segmenting_4",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_segmentation",
    sub_domain: "segmenting_4_phonemes",
    developmental_band: "K-1",
    skill_statement: "Segment a spoken CCVC or CVCC word into its 4 individual phonemes using sound boxes.",
    ccss_codes: ["RF.1.2d"],
    rit_band: "155-168",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["1A.12 Segment phonemes (4 sounds) (Grade 1)"],
    sor_citations: [
      "Kilpatrick, D.A. (2015). Essentials of Assessing, Preventing, and Overcoming Reading Difficulties. Wiley.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy."
    ],
    ell_scaffold: "Consonant cluster segmentation is particularly challenging; provide extra chip colors for each phoneme position; practice slow articulation with mirrors.",
    sped_scaffold: "Use a 4-box Elkonin strip with color-coded boxes; reduce to 3-phoneme words if accuracy drops below 70%.",
    prerequisite_skill_ids: ["reading_pa_phoneme_segmenting_3", "reading_pa_phoneme_blending_4"],
    next_skill_ids: ["reading_pa_phoneme_delete", "reading_pa_phoneme_substitute"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade 1 4-Phoneme Segmentation tasks",
    question_types: ["sound-box", "mc-audio", "dnd-linked", "tap-hotspot", "sort-into-bins"]
  },

  // ─── PHONEME MANIPULATION — Kilpatrick Advanced ───────────────────────────

  {
    skill_id: "reading_pa_phoneme_add",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_manipulation",
    sub_domain: "phoneme_addition",
    developmental_band: "K-1",
    skill_statement: "Add a phoneme to the beginning or end of a spoken word to make a new word (e.g., add /s/ to 'it' = 'sit').",
    ccss_codes: ["RF.1.2e"],
    rit_band: "158-170",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["1A.13 Add phonemes (Grade 1)"],
    sor_citations: [
      "Kilpatrick, D.A. (2015). Essentials of Assessing, Preventing, and Overcoming Reading Difficulties. Wiley.",
      "Kilpatrick, D.A. (2016). Equipped for Reading Success. Casey & Kirsch Publishers.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy."
    ],
    ell_scaffold: "Use visual token addition (physically adding a new chip to a row); connect to familiar word families; provide picture cues for the new word.",
    sped_scaffold: "Use Elkonin boxes and physically place a new chip at the beginning or end; say the new phoneme loudly before blending.",
    prerequisite_skill_ids: ["reading_pa_phoneme_segmenting_3", "reading_pa_phoneme_blending_3"],
    next_skill_ids: ["reading_pa_phoneme_delete", "reading_pa_phoneme_substitute"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Kilpatrick PAST (Phonological Awareness Screening Test) — Addition tasks; Heggerty Grade 1 Phoneme Addition",
    question_types: ["mc-audio", "two-button-binary", "dnd-linked", "sort-into-bins", "tap-hotspot"]
  },

  {
    skill_id: "reading_pa_phoneme_delete",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_manipulation",
    sub_domain: "phoneme_deletion",
    developmental_band: "2-3",
    skill_statement: "Delete an initial, final, or medial phoneme from a spoken word and say the remaining word.",
    ccss_codes: ["RF.1.2e"],
    rit_band: "160-173",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["1A.14 Delete phonemes (Grade 1)", "2A.1 Delete phonemes (Grade 2)"],
    sor_citations: [
      "Kilpatrick, D.A. (2015). Essentials of Assessing, Preventing, and Overcoming Reading Difficulties. Wiley.",
      "Kilpatrick, D.A. (2016). Equipped for Reading Success. Casey & Kirsch Publishers.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing."
    ],
    ell_scaffold: "Model deletion with a physical chip that is removed from the box row; use simple words with stop consonants at word boundaries for easier auditory discrimination.",
    sped_scaffold: "Use Elkonin chips — physically remove the chip and have student blend the remaining chips; start with final-phoneme deletion before initial.",
    prerequisite_skill_ids: ["reading_pa_phoneme_add", "reading_pa_phoneme_segmenting_3"],
    next_skill_ids: ["reading_pa_phoneme_substitute", "reading_pa_phoneme_reverse"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Kilpatrick PAST — Deletion tasks; CTOPP-2 Elision subtest",
    question_types: ["mc-audio", "two-button-binary", "dnd-linked", "sort-into-bins", "tap-hotspot"]
  },

  {
    skill_id: "reading_pa_phoneme_substitute",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_manipulation",
    sub_domain: "phoneme_substitution",
    developmental_band: "2-3",
    skill_statement: "Substitute one phoneme in a spoken word for another to produce a new word (e.g., change /h/ in 'hat' to /b/ → 'bat').",
    ccss_codes: ["RF.1.2e"],
    rit_band: "160-175",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["1A.15 Substitute phonemes (Grade 1)", "2A.2 Substitute phonemes (Grade 2)"],
    sor_citations: [
      "Kilpatrick, D.A. (2015). Essentials of Assessing, Preventing, and Overcoming Reading Difficulties. Wiley.",
      "Kilpatrick, D.A. (2016). Equipped for Reading Success. Casey & Kirsch Publishers.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing."
    ],
    ell_scaffold: "Connect substitution to word families; use a substitution chart so ELL students can see the systematic pattern (hat → bat → cat → rat).",
    sped_scaffold: "Use color-coded Elkonin chips — swap only the chip in the target position; emphasize the new chip's phoneme before blending.",
    prerequisite_skill_ids: ["reading_pa_phoneme_delete", "reading_pa_phoneme_isolation_medial"],
    next_skill_ids: ["reading_pa_phoneme_reverse", "reading_pa_sound_categorize"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Kilpatrick PAST — Substitution tasks; Heggerty Grade 2 Phoneme Substitution",
    question_types: ["mc-audio", "mc-image", "sort-into-bins", "dnd-linked", "two-button-binary"]
  },

  {
    skill_id: "reading_pa_phoneme_reverse",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_manipulation",
    sub_domain: "phoneme_reversal",
    developmental_band: "2-3",
    skill_statement: "Reverse the phonemes in a two- or three-phoneme spoken word (e.g., 'top' reversed = 'pot').",
    ccss_codes: [],
    rit_band: "168-180",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["2A.3 Reverse phonemes (Grade 2)"],
    sor_citations: [
      "Kilpatrick, D.A. (2015). Essentials of Assessing, Preventing, and Overcoming Reading Difficulties. Wiley.",
      "Kilpatrick, D.A. (2016). Equipped for Reading Success. Casey & Kirsch Publishers.",
      "Ehri, L.C. (2014). Orthographic mapping in the acquisition of sight word reading. Scientific Studies of Reading, 18(1), 5–21."
    ],
    ell_scaffold: "Use physical chips in numbered boxes — demonstrate flipping the order of chips with corresponding phoneme sounds; provide picture cues for both original and reversed words.",
    sped_scaffold: "Limit to 2-phoneme reversals first (e.g., 'am' → 'ma'); use visual left/right arrow cues on Elkonin boxes.",
    prerequisite_skill_ids: ["reading_pa_phoneme_substitute", "reading_pa_phoneme_segmenting_3"],
    next_skill_ids: ["reading_pa_sound_categorize"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Kilpatrick PAST — Reversal tasks (most advanced PA screening); CTOPP-2 advanced subtest",
    question_types: ["mc-audio", "two-button-binary", "dnd-linked", "sort-into-bins", "tap-hotspot"]
  },

  // ─── SOUND CATEGORIZATION ─────────────────────────────────────────────────

  {
    skill_id: "reading_pa_sound_categorize",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "sound_categorization",
    sub_domain: "odd_one_out",
    developmental_band: "K-1",
    skill_statement: "Identify the odd word out from a set of spoken words that share a common phoneme (e.g., 'sun, sand, top' — 'top' is odd).",
    ccss_codes: ["RF.K.2a", "RF.1.2a"],
    rit_band: "145-160",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.15 Odd one out (Kindergarten)", "1A.16 Odd one out (Grade 1)"],
    sor_citations: [
      "Bradley, L., & Bryant, P.E. (1983). Categorizing sounds and learning to read — a causal connection. Nature, 301, 419–421.",
      "Goswami, U., & Bryant, P. (1990). Phonological Skills and Learning to Read. Lawrence Erlbaum Associates.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD."
    ],
    ell_scaffold: "Pre-teach target words with pictures so vocabulary is not the barrier; use sets where 3 of 4 pictures start with the same clearly different sound.",
    sped_scaffold: "Reduce to 3-word sets (2 same, 1 different); provide picture cards; allow student to sort physically before identifying the odd word.",
    prerequisite_skill_ids: ["reading_pa_phoneme_isolation_initial", "reading_pa_rhyme_identify"],
    next_skill_ids: ["reading_pa_phoneme_substitute"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Bradley & Bryant Sound Categorization tasks; CTOPP-2 Sound Matching subtest",
    question_types: ["mc-image", "tap-hotspot", "sort-into-bins", "mc-audio", "two-button-binary"]
  },

  // ─── ADDITIONAL ATOMS (5 supplementary atoms for variety) ────────────────

  {
    skill_id: "reading_pa_phoneme_count_cvc",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_segmentation",
    sub_domain: "phoneme_counting",
    developmental_band: "K-1",
    skill_statement: "Count the total number of phonemes in a spoken CVC or CCVC word without segmenting aloud.",
    ccss_codes: ["RF.K.2e", "RF.1.2d"],
    rit_band: "148-162",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.16 Count phonemes (Kindergarten)", "1A.17 Count phonemes (Grade 1)"],
    sor_citations: [
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy.",
      "National Reading Panel (2000). Teaching Children to Read. NICHD."
    ],
    ell_scaffold: "Pair counting with finger-tapping; provide picture cues so students are not confused by unfamiliar vocabulary.",
    sped_scaffold: "Use a finger or chip for each phoneme; color-coded boxes help students track their count.",
    prerequisite_skill_ids: ["reading_pa_phoneme_segmenting_2", "reading_pa_phoneme_isolation_initial"],
    next_skill_ids: ["reading_pa_phoneme_segmenting_3", "reading_pa_phoneme_segmenting_4"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "DIBELS PSF; Heggerty Phoneme Counting tasks",
    question_types: ["mc-audio", "tap-hotspot", "two-button-binary", "sound-box", "sort-into-bins"]
  },

  {
    skill_id: "reading_pa_initial_sound_match",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_isolation",
    sub_domain: "initial_sound_matching",
    developmental_band: "K-1",
    skill_statement: "Match spoken words that begin with the same initial phoneme (e.g., 'fish' and 'five' both start with /f/).",
    ccss_codes: ["RF.K.2d"],
    rit_band: "139-152",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.17 Match initial sounds (Kindergarten)"],
    sor_citations: [
      "Bradley, L., & Bryant, P.E. (1983). Categorizing sounds and learning to read. Nature, 301, 419–421.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy."
    ],
    ell_scaffold: "Use pictures with high-frequency concrete nouns; contrast two similar phonemes (e.g., /f/ and /v/) after the target phoneme is learned.",
    sped_scaffold: "Sort physical picture cards into two piles: same first sound / different first sound; audio prompt for each picture card.",
    prerequisite_skill_ids: ["reading_pa_phoneme_isolation_initial"],
    next_skill_ids: ["reading_pa_sound_categorize", "reading_pa_phoneme_segmenting_3"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "DIBELS ISF (Initial Sound Fluency); Heggerty Initial Sound Matching",
    question_types: ["mc-image", "sort-into-bins", "tap-hotspot", "two-button-binary", "mc-audio"]
  },

  {
    skill_id: "reading_pa_syllable_delete",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "syllable_awareness",
    sub_domain: "syllable_deletion",
    developmental_band: "K-1",
    skill_statement: "Delete a syllable from a compound word or 2-syllable word and say what remains (e.g., 'sunshine' without 'sun' = 'shine').",
    ccss_codes: ["RF.K.2c", "RF.1.2b"],
    rit_band: "140-153",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.18 Delete syllables (Kindergarten)", "1A.18 Delete syllables (Grade 1)"],
    sor_citations: [
      "Kilpatrick, D.A. (2015). Essentials of Assessing, Preventing, and Overcoming Reading Difficulties. Wiley.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing."
    ],
    ell_scaffold: "Begin with compound words that contain familiar, high-frequency base words (e.g., 'rainbow', 'cupcake'); use physical tiles for each syllable.",
    sped_scaffold: "Use a syllable tile for each part — physically remove a tile and have the student blend remaining tiles; use pictures for both the full word and the remaining word.",
    prerequisite_skill_ids: ["reading_pa_syllable_segment", "reading_pa_syllable_blend"],
    next_skill_ids: ["reading_pa_phoneme_delete", "reading_pa_phoneme_add"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade 1 Syllable Deletion tasks; CTOPP-2 Syllable Elision",
    question_types: ["mc-audio", "two-button-binary", "dnd-linked", "tap-hotspot", "sort-into-bins"]
  },

  {
    skill_id: "reading_pa_final_sound_match",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "phoneme_isolation",
    sub_domain: "final_sound_matching",
    developmental_band: "K-1",
    skill_statement: "Match spoken words that end with the same final phoneme (e.g., 'dog' and 'flag' both end with /g/).",
    ccss_codes: ["RF.K.2d"],
    rit_band: "143-156",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.19 Match ending sounds (Kindergarten)", "1A.19 Identify ending sounds (Grade 1)"],
    sor_citations: [
      "Bradley, L., & Bryant, P.E. (1983). Categorizing sounds and learning to read. Nature, 301, 419–421.",
      "Moats, L.C. (2020). Speech to Print (3rd ed.). Brookes Publishing.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy."
    ],
    ell_scaffold: "ELL students often reduce or delete final consonants; use exaggerated articulation and minimal pairs (e.g., 'cat/cap') to build final-phoneme discrimination.",
    sped_scaffold: "Provide picture cards; model final phoneme by stretching the last sound; pair with Elkonin box work on the final position.",
    prerequisite_skill_ids: ["reading_pa_phoneme_isolation_final"],
    next_skill_ids: ["reading_pa_sound_categorize", "reading_pa_phoneme_segmenting_3"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Heggerty Grade K–1 Final Sound Matching tasks",
    question_types: ["mc-image", "sort-into-bins", "tap-hotspot", "two-button-binary", "mc-audio"]
  },

  {
    skill_id: "reading_pa_phoneme_identity_medial_sort",
    subject: "reading",
    strand: "phonemic_awareness",
    domain: "sound_categorization",
    sub_domain: "medial_sound_sort",
    developmental_band: "K-1",
    skill_statement: "Categorize spoken CVC words by their shared medial (vowel) phoneme using a sound-sort routine.",
    ccss_codes: ["RF.K.2e", "RF.1.2c"],
    rit_band: "148-163",
    rit_test: "Reading K-2",
    rit_instructional_area: "Foundational Skills - Phonological Awareness",
    ixl_skills: ["KA.20 Sort words by middle sound (Kindergarten)", "1A.20 Sort words by vowel sound (Grade 1)"],
    sor_citations: [
      "Kilpatrick, D.A. (2015). Essentials of Assessing, Preventing, and Overcoming Reading Difficulties. Wiley.",
      "Bear, D.R., Invernizzi, M., Templeton, S., & Johnston, F. (2020). Words Their Way: Word Study for Phonics, Vocabulary, and Spelling Instruction (7th ed.). Pearson.",
      "Heggerty, M. (2022). Phonemic Awareness. Bridge to Literacy."
    ],
    ell_scaffold: "Use picture-supported sort cards; ELL students benefit from connecting the vowel sound to a key picture anchor word (apple=/ă/, elephant=/ĕ/).",
    sped_scaffold: "Limit to 2-way sort (/ă/ vs /ĭ/) before 3-way; use large color-coded bins; student says the vowel sound aloud before placing each card.",
    prerequisite_skill_ids: ["reading_pa_phoneme_isolation_medial", "reading_pa_sound_categorize"],
    next_skill_ids: ["reading_pa_phoneme_substitute"],
    mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
    diagnostic_anchor: "Words Their Way Primary Spelling Inventory — short vowel awareness; Heggerty Medial Sound Categorization",
    question_types: ["sort-into-bins", "mc-image", "tap-hotspot", "two-button-binary", "mc-audio"]
  }

];

export default phonemicAwarenessSkills;
