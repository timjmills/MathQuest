// Retired skill ids -> the skill (plus options) that replaced them.
//
// When twin skills are merged (e.g. a "no pictures" variant folded into its base skill as an
// option) the old id is NEVER removed from SKILLS / skill-codes-frozen.js positions; it is
// listed here instead, so old share codes, favourites, quick skills, saved quizzes and print
// sections keep resolving to something that generates.
//
// Key:   'categoryId:skillId' (preferred) or bare 'skillId'
// Value: { skillId, categoryId?, opts? }   opts are merged into state.skillOptions for the call
export const SKILL_ALIASES = {};

const MAX_HOPS = 5;

export function resolveSkill(categoryId, skillId) {
    let cat = categoryId;
    let id = skillId;
    let opts = null;
    let aliased = false;
    for (let hop = 0; hop < MAX_HOPS; hop++) {
        const target = SKILL_ALIASES[`${cat}:${id}`] || SKILL_ALIASES[id];
        if (!target || (target.skillId === id && (target.categoryId || cat) === cat)) break;
        cat = target.categoryId || cat;
        id = target.skillId;
        if (target.opts) opts = { ...(opts || {}), ...target.opts };
        aliased = true;
    }
    return { categoryId: cat, skillId: id, opts, aliased };
}
