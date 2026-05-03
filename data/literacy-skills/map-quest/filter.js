// data/literacy-skills/map-quest/filter.js
//
// Filtered views of the canonical skill catalogs by NWEA MAP Growth test
// variant. NOT duplicated data — these are computed selectors that pull
// from the source skill files in /reading and /language by `rit_test` tag.
//
// Per /docs/literacy-quest/PHASE_0_DECISIONS.md Q8: there is no in-app
// placement test. The student picks their RIT band manually; these
// filtered views feed the band picker and the adaptive item pool.

import phonemicAwareness from '../reading/phonemic-awareness.js';
import phonics from '../reading/phonics.js';
import fluency from '../reading/fluency.js';
import vocabulary from '../reading/vocabulary.js';
import compLit from '../reading/comprehension-literature.js';
import compInfo from '../reading/comprehension-informational.js';
import grammar from '../language/grammar.js';
import sentenceStructure from '../language/sentence-structure.js';
import mechanics from '../language/mechanics.js';
import writing from '../language/writing.js';

const ALL_READING_ATOMS = [
    ...phonemicAwareness,
    ...phonics,
    ...fluency,
    ...vocabulary,
    ...compLit,
    ...compInfo,
];

const ALL_LANGUAGE_ATOMS = [
    ...grammar,
    ...sentenceStructure,
    ...mechanics,
    ...writing,
];

/**
 * Reading K-2 — atoms tagged for the K-2 MAP test.
 * Foundational Skills (Phonological Awareness, Phonics, Print Concepts),
 * Language and Writing, Literature and Informational Text, Vocabulary.
 * RIT range typically 131-200.
 */
export const readingK2Skills = ALL_READING_ATOMS.filter(
    s => s.rit_test === 'Reading K-2' && s.rit_band && s.rit_band !== 'n/a'
);

/**
 * Reading 2-5 — atoms tagged for the 2-5 MAP test.
 * Literary Text, Informational Text, Vocabulary.
 * RIT range typically 170-220+.
 */
export const reading25Skills = ALL_READING_ATOMS.filter(
    s => s.rit_test === 'Reading 2-5' && s.rit_band && s.rit_band !== 'n/a'
);

/**
 * Language Usage 2-12 — atoms tagged for the Language Usage MAP test.
 * Write/Revise, Grammar, Mechanics. No Reading items.
 * RIT range typically 151-220+.
 */
export const languageUsageSkills = ALL_LANGUAGE_ATOMS.filter(
    s => s.rit_test === 'Language Usage 2-12' && s.rit_band && s.rit_band !== 'n/a'
);

/**
 * Filter atoms to a specific RIT band for adaptive item-pool selection.
 * Used by map-engine-literacy.js when picking the next item near the
 * student's current ability estimate.
 *
 * @param {string} testVariant - "Reading K-2" | "Reading 2-5" | "Language Usage 2-12"
 * @param {[number, number]} ritRange - [min, max] e.g. [180, 200]
 * @returns {SkillAtom[]}
 */
export function atomsForRitWindow(testVariant, ritRange) {
    const [min, max] = ritRange;
    let pool;
    if (testVariant === 'Reading K-2') pool = readingK2Skills;
    else if (testVariant === 'Reading 2-5') pool = reading25Skills;
    else if (testVariant === 'Language Usage 2-12') pool = languageUsageSkills;
    else return [];

    return pool.filter(s => {
        // rit_band is "141-150" — parse and check overlap with window.
        const m = /^(\d+)-(\d+)$/.exec(s.rit_band || '');
        if (!m) return false;
        const lo = parseInt(m[1], 10);
        const hi = parseInt(m[2], 10);
        return hi >= min && lo <= max;
    });
}

/**
 * Group atoms by instructional area for area-balance enforcement during
 * adaptive sessions. Used by map-engine-literacy.js to enforce the
 * 30/30/25/15 (Reading 2-5) and 40/30/30 (Language Usage) proportions
 * documented in /docs/literacy-quest/STUDY_NOTES.md §3.
 *
 * @param {SkillAtom[]} atoms
 * @returns {Record<string, SkillAtom[]>}
 */
export function groupByInstructionalArea(atoms) {
    const groups = {};
    for (const a of atoms) {
        const key = a.rit_instructional_area || 'unspecified';
        if (!groups[key]) groups[key] = [];
        groups[key].push(a);
    }
    return groups;
}
