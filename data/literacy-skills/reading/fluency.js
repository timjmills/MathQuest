/**
 * Literacy Quest — Reading / Fluency skill atoms (Part 3)
 * Strands: LNF, LSF, PSF, NWF, ORF, Prosody
 * @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]}
 */

/**
 * Hasbrouck & Tindal (2017) Oral Reading Fluency norms.
 * Percentile columns: p90, p75, p50, p25, p10.
 * Grades 1–8; seasons: fall, winter, spring.
 * Unit: words correct per minute (WCPM).
 * Source: Hasbrouck, J., & Tindal, G. (2017). An update to compiled ORF norms.
 *         Technical Report No. 1702. Behavioral Research and Teaching, University of Oregon.
 * @type {Record<string, Record<"fall"|"winter"|"spring", Record<"p10"|"p25"|"p50"|"p75"|"p90", number|null>>>}
 */
export const HASBROUCK_TINDAL_ORF_2017 = {
    grade1: {
        fall:   { p10: null, p25: null, p50: null, p75: null, p90: null },
        winter: { p10: 6,    p25: 15,   p50: 36,   p75: 58,   p90: 82  },
        spring: { p10: 18,   p25: 37,   p50: 68,   p75: 93,   p90: 117 }
    },
    grade2: {
        fall:   { p10: 25,  p25: 45,   p50: 68,   p75: 89,   p90: 111 },
        winter: { p10: 35,  p25: 61,   p50: 87,   p75: 109,  p90: 131 },
        spring: { p10: 43,  p25: 72,   p50: 100,  p75: 124,  p90: 148 }
    },
    grade3: {
        fall:   { p10: 37,  p25: 59,   p50: 83,   p75: 111,  p90: 134 },
        winter: { p10: 47,  p25: 74,   p50: 103,  p75: 131,  p90: 157 },
        spring: { p10: 49,  p25: 79,   p50: 112,  p75: 143,  p90: 168 }
    },
    grade4: {
        fall:   { p10: 50,  p25: 77,   p50: 109,  p75: 136,  p90: 160 },
        winter: { p10: 59,  p25: 89,   p50: 120,  p75: 148,  p90: 173 },
        spring: { p10: 68,  p25: 100,  p50: 133,  p75: 156,  p90: 180 }
    },
    grade5: {
        fall:   { p10: 63,  p25: 93,   p50: 128,  p75: 154,  p90: 177 },
        winter: { p10: 73,  p25: 105,  p50: 139,  p75: 163,  p90: 187 },
        spring: { p10: 79,  p25: 112,  p50: 146,  p75: 169,  p90: 194 }
    },
    grade6: {
        fall:   { p10: 74,  p25: 105,  p50: 135,  p75: 160,  p90: 183 },
        winter: { p10: 79,  p25: 112,  p50: 144,  p75: 168,  p90: 193 },
        spring: { p10: 83,  p25: 116,  p50: 150,  p75: 174,  p90: 199 }
    },
    grade7: {
        fall:   { p10: 76,  p25: 108,  p50: 141,  p75: 166,  p90: 189 },
        winter: { p10: 80,  p25: 114,  p50: 148,  p75: 172,  p90: 196 },
        spring: { p10: 84,  p25: 118,  p50: 153,  p75: 177,  p90: 202 }
    },
    grade8: {
        fall:   { p10: 79,  p25: 112,  p50: 148,  p75: 171,  p90: 194 },
        winter: { p10: 84,  p25: 118,  p50: 151,  p75: 176,  p90: 199 },
        spring: { p10: 86,  p25: 120,  p50: 155,  p75: 180,  p90: 202 }
    }
};

/** @type {import('../../../docs/literacy-quest/DATA_MODEL').SkillAtom[]} */
const fluencyAtoms = [

    {
        skill_id: "reading_fluency_lnf",
        subject: "reading",
        strand: "fluency",
        domain: "letter_naming",
        sub_domain: "lnf_rapid",
        developmental_band: "K-1",
        skill_statement: "Rapidly name all 26 upper- and lower-case letters by sight (Letter Naming Fluency).",
        ccss_codes: ["RF.K.1d", "RF.1.1a"],
        rit_band: "131-145",
        rit_test: "Reading K-2",
        rit_instructional_area: "Foundational Skills - Phonological Awareness - Letter Knowledge",
        ixl_skills: ["K.A.1 Identify letters of the alphabet (Kindergarten)"],
        sor_citations: [
            "Hasbrouck, J., & Tindal, G. (2017). An update to compiled ORF norms. Technical Report No. 1702. Behavioral Research and Teaching, University of Oregon.",
            "Moats, L. C. (2020). LETRS (Language Essentials for Teachers of Reading and Spelling), 3rd ed., Unit 2. Sopris Learning."
        ],
        ell_scaffold: "Use bilingual letter cards with Arabic script alongside Roman letters; practice slow naming before timed drill.",
        sped_scaffold: "Cover all but 3 letters at a time using a window card; increase exposure gradually before timed assessment.",
        prerequisite_skill_ids: [],
        next_skill_ids: ["reading_fluency_lsf", "reading_phonics_letter_sound_a"],
        mastery_criteria: { accuracy: 0.90, consecutive_sessions: 2, fluency_target_per_min: 40 },
        diagnostic_anchor: "DIBELS LNF benchmark probe (Kindergarten fall = 27 letters/min; winter = 37; spring = 41)",
        question_types: ["mc-text", "two-button-binary", "tap-hotspot"]
    },

    {
        skill_id: "reading_fluency_lsf",
        subject: "reading",
        strand: "fluency",
        domain: "letter_sound",
        sub_domain: "lsf_rapid",
        developmental_band: "K-1",
        skill_statement: "Rapidly produce the primary sound for each of the 26 letters (Letter Sound Fluency).",
        ccss_codes: ["RF.K.3a", "RF.1.3b"],
        rit_band: "138-152",
        rit_test: "Reading K-2",
        rit_instructional_area: "Foundational Skills - Phonics - Letter-Sound Correspondence",
        ixl_skills: ["K.C.1 Choose the letter that matches the sound (Kindergarten)"],
        sor_citations: [
            "Moats, L. C. (2020). LETRS Unit 4: Word Recognition. Sopris Learning.",
            "Ehri, L. C. (2014). Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning. Scientific Studies of Reading, 18(1), 5–21."
        ],
        ell_scaffold: "Contrast Arabic phonemes with English counterparts; use articulation mirrors for unfamiliar phonemes (/p/, /æ/).",
        sped_scaffold: "Finger-tap each sound after naming; allow 3 attempts per letter before corrective modeling.",
        prerequisite_skill_ids: ["reading_fluency_lnf"],
        next_skill_ids: ["reading_fluency_nwf", "reading_phonics_short_a_cvc"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 35 },
        diagnostic_anchor: "DIBELS LSF benchmark probe (Grade 1 fall = 30 sounds/min)",
        question_types: ["mc-text", "two-button-binary", "tap-hotspot"]
    },

    {
        skill_id: "reading_fluency_psf",
        subject: "reading",
        strand: "fluency",
        domain: "phoneme_segmentation",
        sub_domain: "psf_timed",
        developmental_band: "K-1",
        skill_statement: "Segment all phonemes in spoken words within a time limit (Phoneme Segmentation Fluency — target ≥35 phonemes/min by K spring).",
        ccss_codes: ["RF.K.2d", "RF.K.2e"],
        rit_band: "148-163",
        rit_test: "Reading K-2",
        rit_instructional_area: "Foundational Skills - Phonological Awareness - Phoneme Segmentation",
        ixl_skills: ["K.B.7 Count phonemes in a word (Kindergarten)"],
        sor_citations: [
            "Hasbrouck, J., & Tindal, G. (2017). An update to compiled ORF norms. Technical Report No. 1702. Behavioral Research and Teaching, University of Oregon.",
            "Moats, L. C. (2020). LETRS Unit 2: The Speech Sounds of English. Sopris Learning."
        ],
        ell_scaffold: "Pre-teach that Arabic word structure differs; use picture support so L2 vocabulary load does not inflate error rate.",
        sped_scaffold: "Use Elkonin sound boxes with physical chips; reduce time pressure by starting untimed then fading to timed.",
        prerequisite_skill_ids: ["reading_pa_phoneme_isolation_initial", "reading_pa_phoneme_segment_cvc"],
        next_skill_ids: ["reading_fluency_nwf", "reading_fluency_orf_grade1"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 35 },
        diagnostic_anchor: "DIBELS PSF benchmark probe (K spring = 35 phonemes/min; Grade 1 winter = 35)",
        question_types: ["sound-box", "mc-text", "fib-auto"]
    },

    {
        skill_id: "reading_fluency_nwf",
        subject: "reading",
        strand: "fluency",
        domain: "nonsense_word",
        sub_domain: "nwf_timed",
        developmental_band: "K-1",
        skill_statement: "Read consonant-vowel-consonant nonsense words to demonstrate phonics decoding skill (NWF — target ≥50 letter sounds/min by Grade 1 winter).",
        ccss_codes: ["RF.K.3c", "RF.1.3b"],
        rit_band: "141-162",
        rit_test: "Reading K-2",
        rit_instructional_area: "Foundational Skills - Phonics - Decoding",
        ixl_skills: ["1.C.4 Blend consonants and short vowels to read CVC words (Grade 1)"],
        sor_citations: [
            "Hasbrouck, J., & Tindal, G. (2017). An update to compiled ORF norms. Technical Report No. 1702. Behavioral Research and Teaching, University of Oregon.",
            "Ehri, L. C. (2014). Orthographic mapping in the acquisition of sight word reading. Scientific Studies of Reading, 18(1), 5–21."
        ],
        ell_scaffold: "Explain that nonsense words are decoding exercises only — reduce anxiety by framing them as 'made-up words for a spelling game.'",
        sped_scaffold: "Use a 'cover card' to expose one grapheme at a time; track correct letter sounds rather than whole-word accuracy only.",
        prerequisite_skill_ids: ["reading_fluency_lsf", "reading_phonics_short_a_cvc"],
        next_skill_ids: ["reading_fluency_orf_grade1", "reading_fluency_orf_grade2"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 50 },
        diagnostic_anchor: "DIBELS NWF benchmark probe (Grade 1 winter = 50 letter sounds/min; spring = 67)",
        question_types: ["two-button-binary", "mc-text", "fib-auto"]
    },

    {
        skill_id: "reading_fluency_orf_grade2",
        subject: "reading",
        strand: "fluency",
        domain: "oral_reading_fluency",
        sub_domain: "orf_grade2",
        developmental_band: "2-3",
        skill_statement: "Read a Grade 2 connected text passage aloud at ≥87 WCPM (Hasbrouck-Tindal 50th percentile, winter) with accuracy ≥95%.",
        ccss_codes: ["RF.2.4", "RF.2.4a", "RF.2.4b"],
        rit_band: "n/a",
        rit_test: null,
        rit_instructional_area: "",
        ixl_skills: ["2.J.1 Read grade 2 texts with fluency and accuracy (Grade 2)"],
        sor_citations: [
            "Hasbrouck, J., & Tindal, G. (2017). An update to compiled ORF norms. Technical Report No. 1702. Behavioral Research and Teaching, University of Oregon.",
            "Therrien, W. J. (2004). Fluency and comprehension gains as a result of repeated reading. Remedial and Special Education, 25(4), 252–261."
        ],
        ell_scaffold: "Use echo reading and choral reading before independent timed reads; focus on 25th percentile (61 WCPM) as ELL urgent-intervention floor.",
        sped_scaffold: "Repeated reading with 3 practice passes before assessment; mark errors on a copy and review before re-read.",
        prerequisite_skill_ids: ["reading_fluency_nwf", "reading_phonics_vowel_team_ai_ay"],
        next_skill_ids: ["reading_fluency_orf_grade3", "reading_fluency_prosody_phrasing"],
        mastery_criteria: { accuracy: 0.95, consecutive_sessions: 2, fluency_target_per_min: 87 },
        diagnostic_anchor: "DIBELS ORF Grade 2 benchmark probe (winter = 87 WCPM at 50th percentile per Hasbrouck-Tindal 2017)",
        question_types: ["mc-text", "mc-multi-select", "sequence-events"]
    },

    {
        skill_id: "reading_fluency_orf_grade3",
        subject: "reading",
        strand: "fluency",
        domain: "oral_reading_fluency",
        sub_domain: "orf_grade3",
        developmental_band: "2-3",
        skill_statement: "Read a Grade 3 connected text passage aloud at ≥103 WCPM (Hasbrouck-Tindal 50th percentile, winter) with accuracy ≥95%.",
        ccss_codes: ["RF.3.4", "RF.3.4a", "RF.3.4b"],
        rit_band: "n/a",
        rit_test: null,
        rit_instructional_area: "",
        ixl_skills: ["3.J.1 Read grade 3 texts with fluency and accuracy (Grade 3)"],
        sor_citations: [
            "Hasbrouck, J., & Tindal, G. (2017). An update to compiled ORF norms. Technical Report No. 1702. Behavioral Research and Teaching, University of Oregon.",
            "Therrien, W. J. (2004). Fluency and comprehension gains as a result of repeated reading. Remedial and Special Education, 25(4), 252–261."
        ],
        ell_scaffold: "Pair with a fluent peer reader; use phrase-cued text (scoop marks) to group words into meaningful chunks before timed reads.",
        sped_scaffold: "Use the neurological impress method (simultaneous read-aloud with teacher) for 3 sessions before solo attempt.",
        prerequisite_skill_ids: ["reading_fluency_orf_grade2", "reading_fluency_prosody_phrasing"],
        next_skill_ids: ["reading_fluency_orf_grade4"],
        mastery_criteria: { accuracy: 0.95, consecutive_sessions: 2, fluency_target_per_min: 103 },
        diagnostic_anchor: "DIBELS ORF Grade 3 benchmark probe (winter = 103 WCPM at 50th percentile per Hasbrouck-Tindal 2017)",
        question_types: ["mc-text", "mc-multi-select", "sequence-events"]
    },

    {
        skill_id: "reading_fluency_orf_grade4",
        subject: "reading",
        strand: "fluency",
        domain: "oral_reading_fluency",
        sub_domain: "orf_grade4",
        developmental_band: "4-5+",
        skill_statement: "Read a Grade 4 connected text passage aloud at ≥120 WCPM (Hasbrouck-Tindal 50th percentile, winter) with accuracy ≥95%.",
        ccss_codes: ["RF.4.4", "RF.4.4a", "RF.4.4b"],
        rit_band: "n/a",
        rit_test: null,
        rit_instructional_area: "",
        ixl_skills: ["4.J.1 Read grade 4 texts with fluency and accuracy (Grade 4)"],
        sor_citations: [
            "Hasbrouck, J., & Tindal, G. (2017). An update to compiled ORF norms. Technical Report No. 1702. Behavioral Research and Teaching, University of Oregon.",
            "Therrien, W. J. (2004). Fluency and comprehension gains as a result of repeated reading. Remedial and Special Education, 25(4), 252–261."
        ],
        ell_scaffold: "Use Reader's Theater scripts at grade level; ELL working target is 25th percentile (89 WCPM winter) before advancing.",
        sped_scaffold: "3-4 repeated reads of same passage; graph WCPM progress to build self-monitoring and motivation.",
        prerequisite_skill_ids: ["reading_fluency_orf_grade3"],
        next_skill_ids: ["reading_fluency_orf_grade5"],
        mastery_criteria: { accuracy: 0.95, consecutive_sessions: 2, fluency_target_per_min: 120 },
        diagnostic_anchor: "DIBELS ORF Grade 4 benchmark probe (winter = 120 WCPM at 50th percentile per Hasbrouck-Tindal 2017)",
        question_types: ["mc-text", "mc-multi-select", "sequence-events"]
    },

    {
        skill_id: "reading_fluency_prosody_phrasing",
        subject: "reading",
        strand: "fluency",
        domain: "prosody",
        sub_domain: "phrase_grouping",
        developmental_band: "2-3",
        skill_statement: "Group words into meaningful phrases using punctuation and syntax cues to read with expression and appropriate phrasing.",
        ccss_codes: ["RF.2.4b", "RF.3.4b", "RF.4.4b"],
        rit_band: "n/a",
        rit_test: null,
        rit_instructional_area: "",
        ixl_skills: ["3.J.2 Read with expression and phrasing (Grade 3)"],
        sor_citations: [
            "Hasbrouck, J., & Tindal, G. (2017). An update to compiled ORF norms. Technical Report No. 1702. Behavioral Research and Teaching, University of Oregon.",
            "Rasinski, T. V. (2010). The Fluent Reader: Oral and Silent Reading Strategies for Building Fluency, Word Recognition, and Comprehension, 2nd ed. Scholastic."
        ],
        ell_scaffold: "Model phrase reading with exaggerated prosody; use sentence strips with scoop marks to show chunking visually.",
        sped_scaffold: "Use phrase-cued text with large slash marks; begin with 3–4 word sentences and expand length gradually.",
        prerequisite_skill_ids: ["reading_fluency_orf_grade2"],
        next_skill_ids: ["reading_fluency_orf_grade3"],
        mastery_criteria: { accuracy: 0.85, consecutive_sessions: 2, fluency_target_per_min: 0 },
        diagnostic_anchor: "NAEP Oral Reading Fluency Scale Level 3 (reads primarily in three- or four-word phrase groups with appropriate expression)",
        question_types: ["sentence-build", "mc-text", "dnd-linked"]
    }

];

export default fluencyAtoms;
