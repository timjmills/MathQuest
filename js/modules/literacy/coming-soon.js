// coming-soon.js — Graceful fallback for Literacy Quest atoms without real generators.
//
// Exports:
//   isAtomPlayable(skillAtom)              → boolean
//   renderComingSoonCard(skillAtom, container) → void

import { SKILLS_BY_ID, walkSkillGraph } from '../../../data/literacy-skills/index.js';

// ─── Playable skill registry ──────────────────────────────────────────────────
//
// Add a skill_id here when a real generator ships for it.
// Phase 2 vertical slice: only these 3 have full generators.

const PLAYABLE_SKILL_IDS = new Set([
    'reading_phonics_short_a_initial',
    'language_mechanics_capitalize_sentence_start',
    'language_mechanics_capitalize_pronoun_i',
    'language_mechanics_capitalize_proper_noun_person',
    'language_mechanics_capitalize_proper_noun_place',
    'language_mechanics_capitalize_proper_noun_months_days',
    'language_mechanics_capitalize_proper_noun_titles_acronyms',
    'language_mechanics_capitalize_proper_adjectives',
    'language_mechanics_capitalize_direct_quotation',
    'language_mechanics_capitalize_letter_greeting_closing',
    'language_mechanics_capitalize_poetry_line',
    'language_mechanics_capitalize_geographic_names',
    'language_mechanics_capitalize_titles_of_works',
    // Digraphs
    'reading_phonics_digraph_sh',
    'reading_phonics_digraph_ch',
    'reading_phonics_digraph_th',
    'reading_phonics_digraph_wh',
    // Blends
    'reading_phonics_blend_initial_l',
    'reading_phonics_blend_initial_r',
    'reading_phonics_blend_initial_s',
    'reading_phonics_blend_final',
    // Phase 3 — short vowels (medial, final, in-blends, mixed)
    'reading_phonics_short_a_medial',
    'reading_phonics_short_a_final',
    'reading_phonics_short_e_medial',
    'reading_phonics_short_i_medial',
    'reading_phonics_short_o_medial',
    'reading_phonics_short_u_medial',
    'reading_phonics_short_vowels_mixed',
    'reading_phonics_short_a_in_blends',
    'reading_phonics_short_e_in_blends',
    'reading_phonics_short_i_in_blends',
    'reading_phonics_short_o_in_blends',
    'reading_phonics_short_u_in_blends',
    // Phase 4 — VCe (silent-e) long vowels
    'reading_phonics_long_a_vce',
    'reading_phonics_long_i_vce',
    'reading_phonics_long_o_vce',
    'reading_phonics_long_e_vce',
    'reading_phonics_long_u_vce',
    'reading_phonics_long_vowels_mixed',
    // Phase 4 — Vowel teams
    'reading_phonics_vowel_team_ai_ay',
    'reading_phonics_vowel_team_ee_ea',
    'reading_phonics_vowel_team_oa_ow',
    'reading_phonics_vowel_team_ie',
    'reading_phonics_vowel_team_ue_ew',
    'reading_phonics_vowel_team_igh',
    'reading_phonics_vowel_team_oo_long',
    'reading_phonics_vowel_team_oo_short',
    // Phase 3 — heart words (18 atoms)
    'reading_phonics_heart_word_said',
    'reading_phonics_heart_word_was',
    'reading_phonics_heart_word_have',
    'reading_phonics_heart_word_of',
    'reading_phonics_heart_word_the',
    'reading_phonics_heart_word_to',
    'reading_phonics_heart_word_you',
    'reading_phonics_heart_word_are',
    'reading_phonics_heart_word_were',
    'reading_phonics_heart_word_what',
    'reading_phonics_heart_word_where',
    'reading_phonics_heart_word_who',
    'reading_phonics_heart_word_your',
    'reading_phonics_heart_word_do',
    'reading_phonics_heart_word_many',
    'reading_phonics_heart_word_could',
    'reading_phonics_heart_word_would',
    'reading_phonics_heart_word_should',
    // Phase 5 — R-controlled vowels (5 atoms)
    'reading_phonics_r_controlled_ar',
    'reading_phonics_r_controlled_or',
    'reading_phonics_r_controlled_er_ir_ur',
    'reading_phonics_r_controlled_are_air',
    'reading_phonics_r_controlled_ear_eer',
    // Phase 5 — Diphthongs (4 atoms)
    'reading_phonics_diphthong_oi_oy',
    'reading_phonics_diphthong_ou_ow',
    'reading_phonics_diphthong_au',
    'reading_phonics_diphthong_aw',
    // Phase 5 — Six syllable types (6 atoms)
    'reading_phonics_syllable_type_closed',
    'reading_phonics_syllable_type_open',
    'reading_phonics_syllable_type_vce',
    'reading_phonics_syllable_type_r_controlled',
    'reading_phonics_syllable_type_vowel_team',
    'reading_phonics_syllable_type_consonant_le',
    // Phase 6 — Multisyllabic decoding (2 atoms)
    'reading_phonics_multisyllabic_compound',
    'reading_phonics_multisyllabic_2syllable',
    // Phase 7 — Morphology (13 atoms)
    'reading_phonics_morphology_prefix_un_re',
    'reading_phonics_morphology_prefix_dis_pre',
    'reading_phonics_morphology_prefix_dis_pre_mis',
    'reading_phonics_morphology_prefix_mis_non_sub',
    'reading_phonics_morphology_suffix_ed_ing',
    'reading_phonics_morphology_suffix_er_est',
    'reading_phonics_morphology_suffix_ly',
    'reading_phonics_morphology_suffix_ful_less',
    'reading_phonics_morphology_suffix_ly_ful_less',
    'reading_phonics_morphology_suffix_ness',
    'reading_phonics_morphology_root_basic',
    'reading_phonics_morphology_root_greek',
    'reading_phonics_morphology_root_latin_advanced',
    // Phase 8 — UFLI fluency atoms (roll-and-read + decodable passages)
    'reading_fluency_roll_and_read_short_a',
    'reading_fluency_roll_and_read_digraph',
    'reading_fluency_roll_and_read_vce',
    'reading_fluency_roll_and_read_vowel_team',
    'reading_fluency_decodable_passage_set5',
    'reading_fluency_decodable_passage_set9',
    'reading_fluency_decodable_passage_set11',
]);

/**
 * Returns true if a real generator exists for this skill atom.
 * Update PLAYABLE_SKILL_IDS as generators ship in later phases.
 *
 * @param {import('../../../data/literacy-skills/index.js').SkillAtom} skillAtom
 * @returns {boolean}
 */
export function isAtomPlayable(skillAtom) {
    if (!skillAtom || !skillAtom.skill_id) return false;
    return PLAYABLE_SKILL_IDS.has(skillAtom.skill_id);
}

// ─── Related skill helpers ───────────────────────────────────────────────────

/**
 * Collect up to maxCount playable atoms from the skill graph around skillAtom.
 * Walks both 'prereq' and 'next' directions, depth 2 each.
 *
 * @param {import('../../../data/literacy-skills/index.js').SkillAtom} skillAtom
 * @param {number} maxCount
 * @returns {import('../../../data/literacy-skills/index.js').SkillAtom[]}
 */
function _findRelatedPlayable(skillAtom, maxCount = 3) {
    const prereqIds = walkSkillGraph(skillAtom.skill_id, 'prereq', 2);
    const nextIds   = walkSkillGraph(skillAtom.skill_id, 'next',   2);

    // Interleave: alternate prereq/next so we get a balanced mix
    const combined = [];
    const maxLen = Math.max(prereqIds.length, nextIds.length);
    for (let i = 0; i < maxLen; i++) {
        if (nextIds[i])   combined.push(nextIds[i]);
        if (prereqIds[i]) combined.push(prereqIds[i]);
    }

    const result = [];
    for (const id of combined) {
        if (result.length >= maxCount) break;
        const atom = SKILLS_BY_ID[id];
        if (atom && isAtomPlayable(atom)) result.push(atom);
    }
    return result;
}

// ─── Card renderer ────────────────────────────────────────────────────────────

/**
 * Render a friendly "Coming Soon" card into `container`.
 * Does NOT log console.error — this is an expected, graceful state.
 *
 * @param {import('../../../data/literacy-skills/index.js').SkillAtom} skillAtom
 * @param {HTMLElement} container
 */
export function renderComingSoonCard(skillAtom, container) {
    if (!container) return;
    if (!skillAtom) {
        container.innerHTML = '<div class="lq-coming-soon-card"><p>Skill not found.</p></div>';
        return;
    }

    // Gather related playable atoms for the CTA buttons
    const related = _findRelatedPlayable(skillAtom, 3);

    // Build related-skill button markup
    const relatedBtns = related.length > 0
        ? related.map(a => `
            <button
                type="button"
                class="lq-cs-related-btn"
                onclick="if(typeof window.startLiteracyPractice==='function') window.startLiteracyPractice('${_esc(a.skill_id)}')"
                title="${_esc(a.skill_statement)}"
            >
                ${_esc(_shortLabel(a))} &rarr;
            </button>`).join('')
        : '<span class="lq-cs-no-related">No playable related skills yet.</span>';

    // Grade band & RIT band display
    const bandLine = [
        skillAtom.developmental_band ? `Grade band: <strong>${_esc(skillAtom.developmental_band)}</strong>` : null,
        skillAtom.rit_band           ? `RIT band: <strong>${_esc(String(skillAtom.rit_band))}</strong>`     : null,
    ].filter(Boolean).join(' &nbsp;·&nbsp; ');

    container.innerHTML = `
        <div class="lq-coming-soon-card" role="status" aria-live="polite">
            <div class="lq-cs-icon" aria-hidden="true">🚧</div>

            <h2 class="lq-cs-heading">Coming Soon</h2>

            <p class="lq-cs-statement">${_esc(skillAtom.skill_statement)}</p>

            ${bandLine ? `<p class="lq-cs-bands">${bandLine}</p>` : ''}

            <p class="lq-cs-message">
                We're building practice for this skill in our next iteration.
                Check back soon!
            </p>

            ${related.length > 0 ? `
            <div class="lq-cs-section">
                <p class="lq-cs-section-label">Try a related skill:</p>
                <div class="lq-cs-related-row">
                    ${relatedBtns}
                </div>
            </div>` : ''}

            <div class="lq-cs-actions">
                <button
                    type="button"
                    class="lq-cs-action-btn lq-cs-action-secondary"
                    onclick="if(typeof window.goToSkillBrowser==='function') window.goToSkillBrowser(); else if(typeof window.goToHub==='function') window.goToHub();"
                >
                    Browse all skills
                </button>
                <button
                    type="button"
                    class="lq-cs-action-btn lq-cs-action-primary"
                    onclick="if(typeof window.goToHub==='function') window.goToHub(); else if(typeof window.goHome==='function') window.goHome();"
                >
                    Back to Quest Hub
                </button>
            </div>
        </div>
    `;
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/** HTML-escape a string so it's safe to embed in attributes and text nodes. */
function _esc(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Produce a short human-readable label for a skill atom.
 * Tries strand + a trimmed skill_id suffix before falling back to full statement.
 *
 * @param {import('../../../data/literacy-skills/index.js').SkillAtom} atom
 * @returns {string}
 */
function _shortLabel(atom) {
    // Last segment of the skill_id (after final underscore-group) makes a decent short name
    const parts = atom.skill_id.split('_');
    const last3 = parts.slice(-3).join(' ');
    // If statement is short enough, use it directly
    if (atom.skill_statement && atom.skill_statement.length <= 50) {
        return atom.skill_statement;
    }
    return last3;
}
