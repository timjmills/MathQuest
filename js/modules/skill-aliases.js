// Retired skill ids -> the skill (plus options) that replaced them.
//
// When twin skills are merged (owner ruling 2026-09-19: the easy / medium / hard twins become
// ONE skill with a Support level option) the old id is NEVER removed from SKILLS or from
// skill-codes-frozen.js, and never moves position: four share-code systems index SKILLS by
// position (the 2-char SKILL_CODES table, the 7-char settings code, the MX- mixed codes and the
// compact-M bitfield). The old id stays in place, marked `retired: true` in data.js so the
// pickers stop offering it, and is listed HERE so every saved share code, favourite, quick
// skill, saved quiz and print section still resolves to something that generates.
//
// Key:   'categoryId:skillId' (preferred) or bare 'skillId'
// Value: { skillId, categoryId?, opts? }   opts are merged into state.skillOptions for the call
import { state } from './state.js';
import { normalizeOptions } from './skill-options.js';

export const SKILL_ALIASES = {
    // --- Number Families: easy / medium / hard -> one skill, Support level -----------------
    // The three ids were one task at three amounts of scaffold: easy leaves only the result
    // blank, medium blanks two numbers per row, hard blanks every number. That is the Support
    // level axis (skill-options.js levelOption), so the twins retire onto the base id.
    'addition:number_families_add_med': { skillId: 'number_families_add', opts: { level: [1] } },
    'addition:number_families_add_hard': { skillId: 'number_families_add', opts: { level: [0] } },
    'multiplication:number_families_mult_med': { skillId: 'number_families_mult', opts: { level: [1] } },
    'multiplication:number_families_mult_hard': { skillId: 'number_families_mult', opts: { level: [0] } },
    'number_ops_mixed:number_families_mixed_med': { skillId: 'number_families_mixed', opts: { level: [1] } },
    'number_ops_mixed:number_families_mixed_hard': { skillId: 'number_families_mixed', opts: { level: [0] } },

    // --- Multiplication Chart: 2 / 6 / 22 missing cells -> one skill, Support level --------
    // Identical generator otherwise; only how much of the grid is already filled in changes.
    'multiplication:mult_chart_medium': { skillId: 'mult_chart_easy', opts: { level: [1] } },
    'multiplication:mult_chart_hard': { skillId: 'mult_chart_easy', opts: { level: [0] } },
};

// ---------------------------------------------------------------------------------------
// VARIANT ROUTING — the compatibility shim that makes the merge real today
// ---------------------------------------------------------------------------------------
// A merged skill is only a merge if the surviving id can still produce every variant the
// retired twins produced. gen-operations.js still branches on the skill ID for these four
// families (`mappedSkill === "number_families_add_med"` and friends), not on the option, so
// this table routes the chosen option value back to the branch that draws it.
//
// That keeps three promises at once:
//   - the teacher picks ONE skill and chooses Support level, and every level really renders;
//   - a retired id resolves to the merged skill and then back to its own branch, so an old
//     share code prints exactly what it printed before the merge — no silent downgrade;
//   - the option is honoured by code that exists, so nothing dead is registered in the dialog.
//
// It is a SHIM, not the destination. When gen-operations.js reads `state.skillOptions.level`
// itself and collapses the three branches, delete the entry here; SKILL_ALIASES above and the
// tombstones in data.js stay for ever, because share codes do.
//
// `option` is a SET option (check boxes). Several ticked levels build a FADING page — most
// support first, least last — so the ticked values are DEALT round-robin across the page by
// item index, exactly as gen-operations.js deals the `notation` set, rather than rolled per
// item. Rolling is what let a six-item page come out five of one level and one of another.
export const SKILL_VARIANTS = {
    'addition:number_families_add': {
        option: 'level',
        branches: { 2: 'number_families_add', 1: 'number_families_add_med', 0: 'number_families_add_hard' },
    },
    'multiplication:number_families_mult': {
        option: 'level',
        branches: { 2: 'number_families_mult', 1: 'number_families_mult_med', 0: 'number_families_mult_hard' },
    },
    'number_ops_mixed:number_families_mixed': {
        option: 'level',
        branches: { 2: 'number_families_mixed', 1: 'number_families_mixed_med', 0: 'number_families_mixed_hard' },
    },
    'multiplication:mult_chart_easy': {
        option: 'level',
        branches: { 2: 'mult_chart_easy', 1: 'mult_chart_medium', 0: 'mult_chart_hard' },
    },
};

const MAX_HOPS = 5;

// Counts resolutions when the caller does not track a kept-item index (live play). The print
// and preview paths DO pass state.itemIndex, which counts only the items the caller kept, so a
// discarded duplicate never burns a slot in the fade.
let _variantCursor = 0;

/** Test seam: reset the fade cursor so a fresh page starts at the most-supported level. */
export function resetVariantCursor() { _variantCursor = 0; }

/**
 * Which legacy branch draws this item, given the ticked option values.
 * Returns null when the skill has no variant table, or when the chosen value is the merged
 * skill's own branch (the common case — then nothing is swapped at all).
 */
function routeVariant(cat, id, opts, itemIndex) {
    const spec = SKILL_VARIANTS[`${cat}:${id}`] || SKILL_VARIANTS[id];
    if (!spec) return null;
    const branches = spec.branches;
    const legal = Object.keys(branches).map(Number);

    let ticked = opts ? opts[spec.option] : undefined;
    if (typeof ticked === 'number' || typeof ticked === 'string') ticked = [ticked];
    ticked = Array.isArray(ticked) ? ticked.map(Number).filter(v => legal.includes(v)) : [];
    // Nothing ticked means "no restriction", never an empty page (skill-options.js set
    // semantics), so the page fades across every level the skill can draw.
    if (!ticked.length) ticked = legal.slice();
    ticked.sort((a, b) => b - a); // most support first, least last

    const at = Number.isFinite(itemIndex) ? itemIndex : _variantCursor++;
    const chosen = ticked[((at % ticked.length) + ticked.length) % ticked.length];
    const target = branches[chosen];
    if (!target || target === id) return null;
    return { skillId: target, value: chosen };
}

/**
 * The alias hops on their own, with no variant routing.
 *
 * This is what a PICKER wants: a dropdown, a search result, a favourite or a saved print
 * section has to select something the pickers still offer, and a tombstone is not offered any
 * more. `mergedSkillFor('addition', 'number_families_add_med')` gives back the merged skill
 * plus the option values that reproduce the retired twin, which is a selectable pair.
 *
 * Generation must use resolveSkill() instead, because that additionally routes the chosen
 * Support level to the generator branch that draws it.
 *
 * @returns {{categoryId: string, skillId: string, opts: object|null, aliased: boolean}}
 */
export function mergedSkillFor(categoryId, skillId) {
    let cat = categoryId;
    let id = skillId;
    let aliasOpts = null;
    let aliased = false;
    for (let hop = 0; hop < MAX_HOPS; hop++) {
        const target = SKILL_ALIASES[`${cat}:${id}`] || SKILL_ALIASES[id];
        if (!target || (target.skillId === id && (target.categoryId || cat) === cat)) break;
        cat = target.categoryId || cat;
        id = target.skillId;
        if (target.opts) aliasOpts = { ...(aliasOpts || {}), ...target.opts };
        aliased = true;
    }
    return { categoryId: cat, skillId: id, opts: aliasOpts, aliased };
}

/**
 * Resolve a possibly-retired skill id to the id that should generate this item.
 *
 * @param {string} categoryId
 * @param {string} skillId
 * @param {object} [opts]       the skill's options; defaults to the live state.skillOptions
 * @param {number} [itemIndex]  which kept item of the page this is; defaults to state.itemIndex
 * @returns {{categoryId: string, skillId: string, opts: object|null, aliased: boolean,
 *            variantOf: string|null, level: *}}
 */
export function resolveSkill(categoryId, skillId, opts, itemIndex) {
    const hopped = mergedSkillFor(categoryId, skillId);
    const cat = hopped.categoryId;
    let id = hopped.skillId;
    const aliasOpts = hopped.opts;
    let aliased = hopped.aliased;

    // Variant routing runs ONCE, after the alias hops and outside the loop: a routed branch id
    // is itself a retired id (number_families_add_med is both), so feeding it back through the
    // alias table would bounce it straight home again.
    const given = opts !== undefined ? opts : (state ? state.skillOptions : null);
    const at = Number.isFinite(itemIndex) ? itemIndex
        : (state && Number.isFinite(state.itemIndex) ? state.itemIndex : undefined);
    let effective = { ...(given || {}), ...(aliasOpts || {}) };
    try { effective = normalizeOptions(cat, id, effective); } catch (e) { /* keep the raw merge */ }

    const routed = routeVariant(cat, id, effective, at);
    let variantOf = null;
    let level = effective ? effective.level : undefined;
    if (routed) {
        variantOf = id;
        id = routed.skillId;
        level = routed.value;
        aliased = true;
    }

    return { categoryId: cat, skillId: id, opts: aliasOpts, aliased, variantOf, level };
}
