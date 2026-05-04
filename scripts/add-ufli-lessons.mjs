// scripts/add-ufli-lessons.mjs
// One-shot script: inserts ufli_lessons field into each phonics atom.
// Run: node scripts/add-ufli-lessons.mjs
// Safe to re-run (idempotent: skips atoms that already have ufli_lessons).

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, '..', 'data', 'literacy-skills', 'reading', 'phonics.js');

// Map from skill_id to ufli_lessons array.
const UFLI_MAP = new Map([
    // === Set 1 (Lessons 1-9): individual letter sounds a,m,s,t,p,i,n,c,b ===
    ['reading_phonics_letter_sound_consonant_basic', [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ['reading_phonics_letter_sound_b',  [9]],
    ['reading_phonics_letter_sound_c',  [8]],
    ['reading_phonics_letter_sound_m',  [2]],
    ['reading_phonics_letter_sound_n',  [7]],
    ['reading_phonics_letter_sound_p',  [5]],
    ['reading_phonics_letter_sound_s',  [3]],
    ['reading_phonics_letter_sound_t',  [4]],
    // Letters not in Sets 1-2 (d, g, j, k, q, v, w, x, y, z) → Set 1 range (taught in K)
    ['reading_phonics_letter_sound_d',  [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ['reading_phonics_letter_sound_g',  [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ['reading_phonics_letter_sound_j',  [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ['reading_phonics_letter_sound_k',  [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ['reading_phonics_letter_sound_q',  [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ['reading_phonics_letter_sound_v',  [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ['reading_phonics_letter_sound_w',  [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ['reading_phonics_letter_sound_x',  [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ['reading_phonics_letter_sound_y',  [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ['reading_phonics_letter_sound_z',  [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    // === Set 2 (Lessons 10-15): r,f,h,o,l,e ===
    ['reading_phonics_letter_sound_r',  [10]],
    ['reading_phonics_letter_sound_f',  [11]],
    ['reading_phonics_letter_sound_h',  [12]],
    ['reading_phonics_letter_sound_l',  [14]],
    // === Set 3 (Lessons 16-25): CVC short a, i ===
    ['reading_phonics_short_a_initial',     [16, 17, 18, 19, 20]],
    ['reading_phonics_short_a_medial',      [16, 17, 18, 19, 20]],
    ['reading_phonics_short_a_final',       [21, 22, 23]],
    ['reading_phonics_short_i_medial',      [21, 22, 23, 24, 25]],
    ['reading_phonics_short_a_in_blends',   [16, 17, 18, 19, 20]],
    ['reading_phonics_short_i_in_blends',   [21, 22, 23, 24, 25]],
    // === Set 4 (Lessons 26-35): CVC short o, u, e ===
    ['reading_phonics_short_o_medial',      [26, 27, 28, 29, 30]],
    ['reading_phonics_short_u_medial',      [31, 32, 33, 34, 35]],
    ['reading_phonics_short_e_medial',      [33, 34, 35]],
    ['reading_phonics_short_vowels_mixed',  [26, 27, 28, 29, 30, 31, 32, 33, 34, 35]],
    ['reading_phonics_short_e_in_blends',   [33, 34, 35]],
    ['reading_phonics_short_o_in_blends',   [26, 27, 28, 29, 30]],
    ['reading_phonics_short_u_in_blends',   [31, 32, 33, 34, 35]],
    // === Set 5 (Lessons 36-43): Digraphs sh, ch, th, wh, ck ===
    ['reading_phonics_digraph_sh',   [36]],
    ['reading_phonics_digraph_ch',   [37]],
    ['reading_phonics_digraph_th',   [38]],
    ['reading_phonics_digraph_wh',   [40]],
    ['reading_phonics_dge',          [43]],
    ['reading_phonics_tch',          [43]],
    // === Set 7 (Lessons 50-57): Initial blends ===
    ['reading_phonics_blend_initial_l',   [50, 51]],
    ['reading_phonics_blend_initial_r',   [52, 53, 54]],
    ['reading_phonics_blend_initial_s',   [55, 56, 57]],
    // === Set 8 (Lessons 58-63): Final blends ===
    ['reading_phonics_blend_final',       [58, 59, 60, 61, 62, 63]],
    // === Set 9 (Lessons 64-77): VCe / silent e ===
    ['reading_phonics_long_a_vce',        [64, 65, 66]],
    ['reading_phonics_long_i_vce',        [67, 68, 69]],
    ['reading_phonics_long_o_vce',        [70, 71, 72]],
    ['reading_phonics_long_e_vce',        [73, 74]],
    ['reading_phonics_long_u_vce',        [75, 76, 77]],
    ['reading_phonics_long_vowels_mixed', [64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77]],
    ['reading_phonics_syllable_type_closed',          [64, 65]],
    ['reading_phonics_syllable_type_open',            [66, 67]],
    ['reading_phonics_syllable_type_vce',             [64, 65, 66, 67, 68, 69, 70, 71, 72]],
    ['reading_phonics_syllable_type_closed_decode',   [64, 65, 66]],
    ['reading_phonics_syllable_type_open_decode',     [66, 67, 68]],
    ['reading_phonics_syllable_type_vce_decode',      [64, 65, 66, 67, 68, 69, 70]],
    // === Set 10 (Lessons 78-85): Y as vowel ===
    ['reading_phonics_y_as_vowel',        [78, 79, 80]],
    ['reading_phonics_y_as_long_i',       [78, 79]],
    ['reading_phonics_y_as_vowel_mid',    [81, 82, 83]],
    // === Set 11 (Lessons 86-95): Vowel teams ===
    ['reading_phonics_vowel_team_ai_ay',  [86, 87]],
    ['reading_phonics_vowel_team_ee_ea',  [88, 89, 90]],
    ['reading_phonics_vowel_team_oa_ow',  [91, 92]],
    ['reading_phonics_diphthong_oi_oy',   [93, 94]],
    ['reading_phonics_diphthong_ou_ow',   [93, 94, 95]],
    ['reading_phonics_vowel_team_ie',     [86, 87, 88]],
    ['reading_phonics_vowel_team_oo_long', [88, 89]],
    ['reading_phonics_vowel_team_oo_short', [90, 91]],
    ['reading_phonics_vowel_team_ue_ew',  [91, 92]],
    ['reading_phonics_vowel_team_igh',    [93, 94, 95]],
    ['reading_phonics_syllable_type_vowel_team',         [86, 87, 88, 89, 90]],
    ['reading_phonics_syllable_type_vowel_team_decode',  [86, 87, 88, 89, 90]],
    // === Set 12 (Lessons 96-103): R-controlled ===
    ['reading_phonics_r_controlled_ar',           [96, 97]],
    ['reading_phonics_r_controlled_or',           [98, 99]],
    ['reading_phonics_r_controlled_er_ir_ur',     [100, 101, 102, 103]],
    ['reading_phonics_syllable_type_r_controlled',        [96, 97, 98, 99, 100]],
    ['reading_phonics_syllable_type_r_controlled_decode', [96, 97, 98, 99, 100]],
    // === Set 13 (Lessons 104-111): Advanced vowel teams + diphthongs ===
    ['reading_phonics_diphthong_au',              [104, 105]],
    ['reading_phonics_diphthong_aw',              [106, 107]],
    ['reading_phonics_r_controlled_are_air',      [108, 109]],
    ['reading_phonics_r_controlled_ear_eer',      [110, 111]],
    // === Set 14 (Lessons 112-118): Multisyllabic + syllable types ===
    ['reading_phonics_syllable_type_consonant_le',         [112, 113]],
    ['reading_phonics_syllable_type_consonant_le_decode',  [112, 113]],
    ['reading_phonics_syllable_division_vc_cv',    [112, 113, 114]],
    ['reading_phonics_syllable_division_v_cv',     [114, 115]],
    ['reading_phonics_syllable_division_vc_v',     [115, 116]],
    ['reading_phonics_syllable_division_vcc_cv',   [116, 117]],
    ['reading_phonics_syllable_division_v_v',      [117, 118]],
    ['reading_phonics_syllable_division_cle_final', [112, 113]],
    ['reading_phonics_multisyllabic_compound',       [112, 113]],
    ['reading_phonics_multisyllabic_2syllable',      [112, 113, 114, 115]],
    ['reading_phonics_multisyllabic_closed_closed',  [112, 113, 114]],
    ['reading_phonics_multisyllabic_vce_2syl',       [114, 115]],
    ['reading_phonics_multisyllabic_open_closed',    [115, 116]],
    ['reading_phonics_multisyllabic_3syllable',      [116, 117, 118]],
    ['reading_phonics_multisyllabic_prefix',         [117, 118]],
    ['reading_phonics_multisyllabic_suffix',         [117, 118]],
    // === Set 15 (Lessons 119-124): Morphology ===
    ['reading_phonics_morphology_prefix_un_re',       [119, 120]],
    ['reading_phonics_morphology_suffix_ed_ing',      [119, 120]],
    ['reading_phonics_morphology_prefix_dis_pre',     [121, 122]],
    ['reading_phonics_morphology_prefix_mis_non_sub', [121, 122]],
    ['reading_phonics_morphology_suffix_er_est',      [121, 122]],
    ['reading_phonics_morphology_suffix_ly',          [122, 123]],
    ['reading_phonics_morphology_suffix_ful_less',    [122, 123]],
    ['reading_phonics_morphology_suffix_ness',        [123, 124]],
    ['reading_phonics_morphology_root_basic',         [124]],
    ['reading_phonics_morphology_root_greek',         [124]],
    ['reading_phonics_morphology_root_latin_advanced', [124]],
    // === Set 16 (Lessons 125-128): Review + advanced patterns ===
    ['reading_phonics_soft_hard_c',          [125, 126]],
    ['reading_phonics_soft_hard_g',          [125, 126]],
    ['reading_phonics_schwa',                [127]],
    ['reading_phonics_schwa_content_words',  [127, 128]],
    ['reading_phonics_schwa_multisyllabic',  [127, 128]],
    ['reading_phonics_silent_letters_kn',    [125]],
    ['reading_phonics_silent_letters_wr',    [125]],
    ['reading_phonics_silent_letters_gn',    [126]],
    ['reading_phonics_silent_letters_mb',    [126]],
    ['reading_phonics_silent_letters_gh',    [127]],
    // === Heart words — approximate UFLI lesson ===
    ['reading_phonics_heart_word_of',    [1]],
    ['reading_phonics_heart_word_the',   [1]],
    ['reading_phonics_heart_word_to',    [2]],
    ['reading_phonics_heart_word_you',   [5]],
    ['reading_phonics_heart_word_are',   [6]],
    ['reading_phonics_heart_word_were',  [15]],
    ['reading_phonics_heart_word_what',  [16]],
    ['reading_phonics_heart_word_where', [16]],
    ['reading_phonics_heart_word_who',   [12]],
    ['reading_phonics_heart_word_said',  [16]],
    ['reading_phonics_heart_word_was',   [17]],
    ['reading_phonics_heart_word_have',  [22]],
]);

let src = readFileSync(FILE, 'utf8');
let changed = 0;
let skipped = 0;
let notFound = [];

for (const [skillId, lessons] of UFLI_MAP) {
    // Find atom block by locating the skill_id string
    const idStr = `skill_id: '${skillId}'`;
    const idPos = src.indexOf(idStr);
    if (idPos === -1) {
        notFound.push(skillId);
        continue;
    }

    // Find the end of this atom: search forward for '    },' at indentation level 1
    // The atom ends at the next occurrence of '\n    },' after the skill_id
    const atomEnd = src.indexOf('\n    },', idPos);
    if (atomEnd === -1) {
        notFound.push(skillId + ' (no end found)');
        continue;
    }

    // Check if ufli_lessons already exists in this atom's range
    const atomSrc = src.slice(idPos, atomEnd);
    if (atomSrc.includes('ufli_lessons:')) {
        skipped++;
        continue;
    }

    // Insert ufli_lessons just before the closing ',\n    },'
    const insertPoint = atomEnd; // right before '\n    },'
    const insertion = `\n        ufli_lessons: ${JSON.stringify(lessons)},`;
    src = src.slice(0, insertPoint) + insertion + src.slice(insertPoint);
    changed++;
}

writeFileSync(FILE, src, 'utf8');
console.log(`Done. Added ufli_lessons to ${changed} atoms; ${skipped} already had it.`);
if (notFound.length) console.warn('Not found:', notFound.join(', '));
