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
    'language_mechanics_capitalize_proper_noun_person',
    'language_mechanics_capitalize_proper_noun_place',
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
