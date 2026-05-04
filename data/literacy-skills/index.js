// data/literacy-skills/index.js
//
// Single import point for the entire Literacy Quest skill catalog. Bundles
// all 10 strand files plus the MAP filter helpers so consumers can do:
//
//   import { ALL_SKILLS, SKILLS_BY_ID, readingK2Skills, atomsForRitWindow }
//     from './data/literacy-skills/index.js';
//
// All re-exports are gated upstream by FEATURES.LITERACY_QUEST_ENABLED at
// the routing entry points; this file itself does no gating (it's pure
// data assembly).

import phonemicAwareness from './reading/phonemic-awareness.js';
import phonics from './reading/phonics.js';
import fluency, { HASBROUCK_TINDAL_ORF_2017 } from './reading/fluency.js';
import vocabulary from './reading/vocabulary.js';
import compLit from './reading/comprehension-literature.js';
import compInfo from './reading/comprehension-informational.js';
import grammar from './language/grammar.js';
import sentenceStructure from './language/sentence-structure.js';
import mechanics from './language/mechanics.js';
import writing from './language/writing.js';

// MAP filter helpers
export {
    readingK2Skills,
    reading25Skills,
    languageUsageSkills,
    atomsForRitWindow,
    groupByInstructionalArea,
} from './map-quest/filter.js';

// Per-strand re-exports (named) so consumers can pick a single strand
export {
    phonemicAwareness,
    phonics,
    fluency,
    vocabulary,
    compLit as comprehensionLiterature,
    compInfo as comprehensionInformational,
    grammar,
    sentenceStructure,
    mechanics,
    writing,
    HASBROUCK_TINDAL_ORF_2017,
};

// Reading strand combined
export const READING_SKILLS = [
    ...phonemicAwareness,
    ...phonics,
    ...fluency,
    ...vocabulary,
    ...compLit,
    ...compInfo,
];

// Language strand combined
export const LANGUAGE_SKILLS = [
    ...grammar,
    ...sentenceStructure,
    ...mechanics,
    ...writing,
];

// Full catalog
export const ALL_SKILLS = [...READING_SKILLS, ...LANGUAGE_SKILLS];

/** O(1) lookup by skill_id. */
export const SKILLS_BY_ID = Object.freeze(
    ALL_SKILLS.reduce((acc, atom) => {
        acc[atom.skill_id] = atom;
        return acc;
    }, /** @type {Record<string, import('../../docs/literacy-quest/DATA_MODEL').SkillAtom>} */ ({}))
);

/**
 * Walk the prerequisite/next-skill DAG up to a depth.
 * Used by the practice loader for early-success priming (walk back) and
 * mastery progression (walk forward).
 *
 * @param {string} startId
 * @param {'prereq' | 'next'} direction
 * @param {number} maxDepth
 * @returns {string[]} skill IDs encountered (excluding startId)
 */
export function walkSkillGraph(startId, direction, maxDepth = 3) {
    const seen = new Set([startId]);
    const out = [];
    const queue = [{ id: startId, depth: 0 }];
    while (queue.length) {
        const { id, depth } = queue.shift();
        if (depth >= maxDepth) continue;
        const atom = SKILLS_BY_ID[id];
        if (!atom) continue;
        const edges = direction === 'prereq'
            ? (atom.prerequisite_skill_ids || [])
            : (atom.next_skill_ids || []);
        for (const eid of edges) {
            if (!seen.has(eid)) {
                seen.add(eid);
                out.push(eid);
                queue.push({ id: eid, depth: depth + 1 });
            }
        }
    }
    return out;
}

/**
 * Validate the skill catalog at startup. Logs warnings (not errors) for
 * dangling DAG edges so authors can fix them in Phase 2.
 *
 * @returns {{ totalAtoms: number, danglingRefs: string[], strandCounts: Record<string, number> }}
 */
export function validateCatalog() {
    const totalAtoms = ALL_SKILLS.length;
    const danglingRefs = [];
    const strandCounts = {};
    for (const a of ALL_SKILLS) {
        strandCounts[a.strand] = (strandCounts[a.strand] || 0) + 1;
        for (const pid of a.prerequisite_skill_ids || []) {
            if (!SKILLS_BY_ID[pid]) danglingRefs.push(`${a.skill_id} prereq -> ${pid}`);
        }
        for (const nid of a.next_skill_ids || []) {
            if (!SKILLS_BY_ID[nid]) danglingRefs.push(`${a.skill_id} next -> ${nid}`);
        }
    }
    return { totalAtoms, danglingRefs, strandCounts };
}
