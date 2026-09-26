// prerequisite-skills.js — the skills a skill builds on, for the Practice paper's "Mix in
// prerequisite skills" option (owner ruling 2026-09-26, design/LESSON_LIBRARY_PLAN.md §8e).
//
// `prerequisiteSkillsFor(categoryId, skillId)` is the ONE entry point. The lesson library's
// prerequisite graph (js/modules/lessons/library.js, engine lane) will answer it when it lands;
// until then it falls back, in this order:
//   1. the lesson data of the sample lessons (lessons/prereqs.js `skills`), nearest first;
//   2. the skills of the White Rose small steps BEFORE this skill's first step in its block
//      (wrm.js SKILL_WRM + wrm-db.js step order), nearest step first; the previous block of the
//      same year when the skill's step opens its block.
// The swap is this function's body only: every caller reads the same list shape.
//
// Returns [{categoryId, skillId, opts?, why}] (never the skill itself, no duplicates).

import { lessonFor, skillRef } from './lessons/prereqs.js';
import { wrmFor, skillsForWrmStep, WRM_STEPS, WRM_BLOCKS } from './wrm.js';

const MAX = 12;
const stepIndex = new Map(WRM_STEPS.map((s, i) => [s.id, i]));

/** The graph when it is installed (the engine lane sets window.prerequisiteSkillsFromLibrary). */
function fromLibrary(categoryId, skillId) {
    const fn = typeof window !== 'undefined' ? window.prerequisiteSkillsFromLibrary : null;
    if (typeof fn !== 'function') return null;
    try { const out = fn(categoryId, skillId); return Array.isArray(out) ? out : null; } catch (e) { return null; }
}

/** The skills of the WRM steps before this skill's first step (its block; else the block before). */
function fromWrm(categoryId, skillId) {
    const steps = wrmFor(categoryId, skillId);
    if (!steps.length) return [];
    const first = steps.map((s) => s.id).sort((a, b) => (stepIndex.get(a) ?? 0) - (stepIndex.get(b) ?? 0))[0];
    const at = stepIndex.get(first);
    if (at === undefined) return [];
    const block = first.replace(/\.S\d+$/, '');
    let before = WRM_STEPS.slice(0, at).filter((s) => s.id.startsWith(`${block}.S`)).reverse();
    if (!before.length) {
        // The step opens its block: the block before it in the same year.
        const year = block.split('.')[0];
        const blocks = WRM_BLOCKS.filter((b) => b.id.startsWith(`${year}.`)).map((b) => b.id);
        const prev = blocks[blocks.indexOf(block) - 1];
        if (prev) before = WRM_STEPS.filter((s) => s.id.startsWith(`${prev}.S`)).reverse();
    }
    const out = [];
    for (const s of before) {
        for (const key of skillsForWrmStep(s.id)) {
            const [c, k] = key.split(':');
            out.push({ categoryId: c, skillId: k, why: `WRM ${s.id}: ${s.title}` });
        }
    }
    return out;
}

/**
 * Every prerequisite skill of a skill, nearest first (§8e: listed as choices, none ticked).
 * @returns {{categoryId: string, skillId: string, opts?: Object, why: string}[]}
 */
export function prerequisiteSkillsFor(categoryId, skillId) {
    const lib = fromLibrary(categoryId, skillId);
    const lesson = lessonFor(categoryId, skillId);
    const list = lib || [
        ...(lesson ? lesson.skills.map((e) => Object.assign(skillRef(e), { why: e.why || 'Lesson prerequisite' })) : []),
        ...fromWrm(categoryId, skillId),
    ];
    const seen = new Set([`${categoryId}:${skillId}`]);
    const out = [];
    for (const p of list) {
        const key = `${p.categoryId}:${p.skillId}`;
        if (!p.categoryId || !p.skillId || seen.has(key)) continue;
        seen.add(key);
        out.push(p);
        if (out.length >= MAX) break;
    }
    return out;
}

export default { prerequisiteSkillsFor };
