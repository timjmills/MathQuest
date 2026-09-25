// skill-options-pools.js — the "Which skills" control on every mixed review (P12, 2026-09-25).
//
// A mixed review ("Mixed Division", "Fractions — All", "Grade 3 Mixed") had no panel at all: the
// teacher could only take the whole pool or nothing. The owner's rule is that every skill can be
// made easier or harder, and for a review the natural ladder is WHICH of its members it draws
// from: "Mixed Division, only the facts and the remainders", "Grade 2 Mixed, only addition and
// subtraction". This module builds that control for every mixed skill from the same pool
// generate-question.js deals from, so the list the teacher ticks is exactly the list the dealer
// has, and registers it with skill-options.js (which stays import-free).
//
// The option is `members`, a SET. All ticked is the default and is exactly today's pool; the
// dealer only filters when the teacher has un-ticked something, so an untouched review draws the
// same random numbers as before. None ticked means "no restriction" (the set semantics of
// skill-options.js), never an empty page.
//
// SHARE CODES. A member is written with a token of its own (def.tokens, skill-option-codec.js):
//   a skill member     = its category's pinned letter + its position in SKILLS[category] in two
//                        base-36 characters ("TK" + "0A" -> "T0A"). Positions are stable because a
//                        skill is never spliced out of SKILLS (CLAUDE.md), only tombstoned.
//   a category member  = the category's pinned letter + "ZZ" (position 1,295, which no category
//                        reaches), for the topic-level reviews (grade and "_all" mixes).
// Every token is three characters, so one width decodes all of them.
// The category letters are copied from number-selection.js FROZEN_CATEGORY_CODES, which ws-boot-smoke
// pins; they are the letters a teacher already holds on paper, so they are safe to reuse here.
//
// PITCH AND SUPPORT FOR THE WHOLE REVIEW (option-panel round 3, OPTIONS-CRITIC-R2 §5 #19, #20).
// "Which skills" only chose members; a review could not be made easier, harder, or given more or
// less help without opening every member. Two review-level controls do that:
//   poolSize     Easier / As each skill is set / Harder: each member's own number-size control
//                (its band, place, Max Number, longest time) moves one step down or up from where
//                the teacher's set has it.
//   poolSupport  As each skill is set / 2 / 1 / 0: each member's own Support level (the nearest
//                level it can draw), and its Pictures switch where it has one (on at 2, off below).
// They are offered only where some member can honour them. generate-question.js asks
// poolMemberOptions() for the member's options before it deals the member, on every path (print,
// online worksheet, practice), so the choice works on paper and on screen alike. At their
// defaults nothing changes: a review deals exactly what it dealt before.
import { SKILLS, DOMAINS, getMixedPoolSkills, getSkillsForCategory, getMixedSkillScope, getSkillsForGrade, isMixedMetaSkill } from './data.js';
import { registerPoolOptions, pvRefusal, APP_DEFAULT_RANGE, offeredOptionsFor, normalizeOptions } from './skill-options.js';
import { state } from './state.js';

const CATEGORY_LETTER = {
    decimals: 'L', integers: 'I', algebra: 'G', measurement: 'M', number_theory: 'N',
    order_of_operations: 'O', patterns: 'B', placevalue: 'D', fractions: 'E',
    conversions: 'F', all_mixed: 'X',
    counting: 'C', comparing: 'P', composing: 'K', counting_mixed: '1',
    addition: 'A', subtraction: 'S', multiplication: 'T', division: 'V', number_ops_mixed: '2',
    fraction_operations: 'R', frac_dec_mixed: '3',
    shapes_early: 'J', area_perimeter: 'Z', angles_lines: '7', shapes_classify: '8',
    coordinates: 'Q', geo_mixed: '4',
    graphs: 'H', data_analysis: 'Y', probability: '9', data_mixed: '5',
    number_sense: 'U', algebra_mixed: '6',
    vocabulary: 'W',
};

// The word-problem pools generate-question.js resolves itself (MIXED_WORD_SKILLS). Their members
// live in other categories, which is why a member token carries its category letter.
const WORD_POOLS = {
    'number_ops_mixed:word_problems_mixed': ['addition:add_word_problems', 'subtraction:sub_word_problems',
        'multiplication:mult_word_problems', 'division:div_word_problems', 'multiplication:mult_comparison'],
    'number_ops_mixed:word_problems_mixed_plain': ['addition:add_word_problems', 'subtraction:sub_word_problems',
        'multiplication:mult_word_problems', 'division:div_word_problems', 'multiplication:mult_comparison'],
    'fraction_operations:frac_word_mixed': ['fraction_operations:frac_word_problems', 'fraction_operations:frac_mult_word'],
    'algebra:algebra_word_mixed': ['algebra:tape_diagram', 'algebra:multi_step_word'],
};

const _label = (cat, id) => {
    const s = (SKILLS[cat] || []).find(x => x.v === id);
    return s ? s.l : id;
};
const _skillToken = (cat, id) => {
    const i = (SKILLS[cat] || []).findIndex(x => x.v === id);
    const L = CATEGORY_LETTER[cat];
    if (i < 0 || !L || i >= 36 * 36) return null;
    return L + i.toString(36).toUpperCase().padStart(2, '0');
};
// A category token: its letter, then "ZZ" (a position no category reaches: 1,295 skills).
const _catToken = (cat) => (CATEGORY_LETTER[cat] ? CATEGORY_LETTER[cat] + 'ZZ' : null);
// A topic's name as the app shows it everywhere else (DOMAINS), never its id title-cased
// ("Number ops mixed", "Placevalue"). Falls back to the title-cased id only for an id no domain lists.
const _CAT_NAMES = (() => {
    const out = {};
    for (const d of Object.values(DOMAINS || {})) for (const c of (d && d.categories) || []) if (c && c.id && c.name) out[c.id] = c.name;
    return out;
})();
const _catLabel = (cat) => {
    if (_CAT_NAMES[cat]) return _CAT_NAMES[cat];
    const words = String(cat).replace(/_/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
};

function _skillMembers(pairs, help) {
    const values = [], tokens = {};
    for (const [cat, id] of pairs) {
        if ((SKILLS[cat] || []).some(x => x.v === id && x.retired)) continue;
        const t = _skillToken(cat, id);
        if (!t || tokens[id]) continue;
        values.push({ v: id, l: _label(cat, id) });
        tokens[id] = t;
    }
    return values.length > 1 ? _membersDef(values, tokens, 'Which skills', help) : null;
}

function _catMembers(cats, help) {
    const values = [], tokens = {};
    for (const cat of cats) {
        const t = _catToken(cat);
        if (!t || tokens[cat]) continue;
        values.push({ v: cat, l: _catLabel(cat) });
        tokens[cat] = t;
    }
    // Two topics may share a display name in different domains: say which domain each is from.
    const seen = {};
    for (const x of values) seen[x.l] = (seen[x.l] || 0) + 1;
    for (const x of values) {
        if (seen[x.l] < 2) continue;
        const dom = Object.values(DOMAINS || {}).find(d => (d.categories || []).some(c => c.id === x.v));
        if (dom && dom.name) x.l = `${x.l} (${dom.name})`;
    }
    return values.length > 1 ? _membersDef(values, tokens, 'Which topics', help) : null;
}

function _membersDef(values, tokens, label, help) {
    return {
        id: 'members', label, type: 'set', group: 'difficulty',
        default: values.map(x => x.v),
        values,
        allLabel: 'All of them, mixed',
        tokens, tokenWidth: 3,
        help,
    };
}

/** The members of a category-level mixed_* pool, exactly as generate-question.js builds it. */
export function categoryPool(categoryId, skillId) {
    if (skillId === 'mixed_time') {
        return getSkillsForCategory('measurement').filter(s => s.startsWith('time_') || s.startsWith('elapsed_'));
    }
    const pool = getMixedPoolSkills(categoryId, skillId);
    // The place-value / rounding reviews never deal a member Max Number cannot host, nor P4's
    // strategy ladders (generate-question.js, P9 §2.5), so they are not offered as ticks either:
    // a page of only "nearest 1,000" from a review is refused at the default Max Number.
    if (categoryId === 'placevalue' || categoryId === 'number_sense') {
        const P4 = new Set(['make_a_ten', 'doubles_near_doubles', 'compensation']);
        return pool.filter(sk => !P4.has(sk) && !pvRefusal(categoryId, sk, APP_DEFAULT_RANGE, {}, true));
    }
    return pool;
}

/* ------------------------------------------------------------------ pitch and support */

// A member's number-size control: the first of these it shows (the one that sets its numbers).
const SIZE_IDS = ['band', 'place', 'range', 'hours'];
function _sizeDef(defs) {
    return defs.find(d => SIZE_IDS.includes(d.id) && d.type === 'enum' && (d.values || []).filter(x => x.v !== null).length > 1) || null;
}
function _supportDefs(defs) {
    return defs.filter(d => (d.id === 'level' && d.type === 'set' && (d.values || []).length > 1) || (d.id === 'pictures' && d.type === 'bool'));
}
/** [categoryId, skillId] of every skill a pool can deal. */
function _memberSkills(categoryId, skillId) {
    const key = `${categoryId}:${skillId}`;
    const word = WORD_POOLS[key] || WORD_POOLS[Object.keys(WORD_POOLS).find(k => k.endsWith(':' + skillId)) || ''];
    if (word) return word.map(r => r.split(':'));
    if (skillId.startsWith('grade_') && skillId.endsWith('_mixed')) {
        const g = skillId.replace('grade_', '').replace('_mixed', '');
        return getSkillsForGrade(g === 'k' ? 'K' : parseInt(g, 10)).map(x => [x.categoryId, x.skillId]).filter(x => x[1]);
    }
    if ((skillId.endsWith('_all') && skillId !== 'coordinate_all') || skillId === 'all_domains_mixed' || skillId === 'counting_all') {
        const cats = (getMixedSkillScope(skillId) || []).filter(c => getSkillsForCategory(c).length);
        return cats.flatMap(c => getSkillsForCategory(c).map(id => [c, id]));
    }
    if (skillId.startsWith('mixed_') && isMixedMetaSkill(skillId)) {
        const cat = skillId === 'mixed_time' ? 'measurement' : categoryId;
        return categoryPool(categoryId, skillId).map(id => [cat, id]);
    }
    return [];
}
function _safeOffered(cat, id) {
    try { return offeredOptionsFor(cat, id) || []; } catch (e) { return []; }
}

const _SIZE_DEF = {
    id: 'poolSize', label: 'Numbers, for the whole review', type: 'enum', default: 'set', group: 'difficulty',
    values: [
        { v: 'easier', l: 'Easier: each skill one step smaller' },
        { v: 'set', l: 'As each skill is set' },
        { v: 'harder', l: 'Harder: each skill one step bigger' },
    ],
    helpShort: 'Moves every skill\'s own number size one step down or up, so the review can be pitched without opening each skill.',
    help: 'Each skill in the review moves its own number-size control (Numbers to, Max Number, the rounding place, the longest time) one step down or up from where your set has it. A skill with no number size is dealt as it is.',
};
const _SUPPORT_DEF = {
    id: 'poolSupport', label: 'Support, for the whole review', type: 'enum', default: null, group: 'support',
    values: [
        { v: null, l: 'As each skill is set' },
        { v: 2, l: '2 — hints shown on every skill that has them' },
        { v: 1, l: '1 — structure only (no hints)' },
        { v: 0, l: '0 — nothing given' },
    ],
    helpShort: 'Sets every skill\'s own Support level at once (the nearest level each skill can draw).',
    help: 'Each skill in the review takes this Support level (or the nearest level it can draw), and its pictures are shown at 2 and left off below. Structural supports stay at every level; hints fade.',
};

const _tuneCache = new Map();
/** Which review-level controls a pool can honour: { size, support } booleans. */
function _poolTuning(categoryId, skillId) {
    const key = `${categoryId}:${skillId}`;
    if (_tuneCache.has(key)) return _tuneCache.get(key);
    _tuneCache.set(key, { size: false, support: false });   // a pool reached again while it is being read
    let size = false, support = false;
    for (const [c, id] of _memberSkills(categoryId, skillId)) {
        const defs = _safeOffered(c, id);
        if (!size && _sizeDef(defs)) size = true;
        if (!support && _supportDefs(defs).length) support = true;
        if (size && support) break;
    }
    const out = { size, support };
    _tuneCache.set(key, out);
    return out;
}

/** One step down (-1) or up (+1) a size control from the value `v` (null = the app's Max Number). */
function _stepSize(def, v, dir) {
    const vals = (def.values || []).map(x => x.v).filter(x => x !== null);
    if (vals.every(x => typeof x === 'number')) {
        const sorted = vals.slice().sort((a, b) => a - b);
        const eff = v === null || v === undefined ? Number(state.range) || APP_DEFAULT_RANGE : Number(v);
        const pick = dir < 0 ? sorted.filter(x => x < eff).pop() : sorted.find(x => x > eff);
        return pick === undefined ? undefined : pick;
    }
    const i = vals.indexOf(v);
    const j = i + dir;
    return i < 0 || j < 0 || j >= vals.length ? undefined : vals[j];
}

/**
 * The options one member of a pool is dealt with, given the POOL's options: the member's own
 * options (`base`, from the teacher's set) with the review's pitch and support laid over them.
 * null when the review's controls are at their defaults or change nothing on this member — the
 * caller then deals the member exactly as it did before.
 */
export function poolMemberOptions(poolOpts, memberCat, memberSkill, base) {
    const o = poolOpts && typeof poolOpts === 'object' ? poolOpts : null;
    if (!o) return null;
    const size = o.poolSize === 'easier' ? -1 : o.poolSize === 'harder' ? 1 : 0;
    const sup = [0, 1, 2].includes(o.poolSupport) ? o.poolSupport : null;
    if (!size && sup === null) return null;
    const defs = _safeOffered(memberCat, memberSkill);
    if (!defs.length) return null;
    let out;
    try { out = normalizeOptions(memberCat, memberSkill, base || {}); } catch (e) { return null; }
    let touched = false;
    if (size) {
        const d = _sizeDef(defs);
        if (d) {
            const next = _stepSize(d, out[d.id], size);
            if (next !== undefined && next !== out[d.id]) { out[d.id] = next; touched = true; }
        }
    }
    if (sup !== null) {
        for (const d of _supportDefs(defs)) {
            if (d.id === 'pictures') {
                const want = sup >= 2;
                if (out.pictures !== want) { out.pictures = want; touched = true; }
                continue;
            }
            const levels = (d.values || []).map(x => x.v);
            // The nearest level the member can draw; a tie goes to more support at 2, less at 0.
            const best = levels.slice().sort((a, b) => (Math.abs(a - sup) - Math.abs(b - sup)) || (sup >= 1 ? b - a : a - b))[0];
            if (best !== undefined && JSON.stringify(out.level) !== JSON.stringify([best])) { out.level = [best]; touched = true; }
        }
    }
    return touched ? out : null;
}

const _cache = new Map();
function poolOptions(categoryId, skillId) {
    const key = `${categoryId}:${skillId}`;
    if (_cache.has(key)) return _cache.get(key);
    let def = null;
    const word = WORD_POOLS[key] || WORD_POOLS[Object.keys(WORD_POOLS).find(k => k.endsWith(':' + skillId)) || ''];
    if (word) {
        def = _skillMembers(word.map(r => r.split(':')), 'Tick the kinds of story the page draws from. All ticked mixes every kind.');
    } else if (skillId.startsWith('grade_') && skillId.endsWith('_mixed')) {
        const g = skillId.replace('grade_', '').replace('_mixed', '');
        const grade = g === 'k' ? 'K' : parseInt(g, 10);
        const cats = [...new Set(getSkillsForGrade(grade).map(x => x.categoryId))];
        def = _catMembers(cats, 'Tick the topics this grade review draws from. All ticked mixes every topic of the grade.');
    } else if ((skillId.endsWith('_all') && skillId !== 'coordinate_all') || skillId === 'all_domains_mixed' || skillId === 'counting_all') {
        const cats = (getMixedSkillScope(skillId) || []).filter(c => getSkillsForCategory(c).length);
        // A review of ONE topic ("Fractions — All") offers that topic's skills instead.
        def = cats.length === 1
            ? _skillMembers(getSkillsForCategory(cats[0]).map(id => [cats[0], id]), 'Tick the skills this review draws from. All ticked mixes every skill.')
            : _catMembers(cats, 'Tick the topics this review draws from. All ticked mixes every topic.');
    } else if (skillId.startsWith('mixed_') && isMixedMetaSkill(skillId)) {
        const pool = categoryPool(categoryId, skillId);
        const cat = skillId === 'mixed_time' ? 'measurement' : categoryId;
        def = _skillMembers(pool.map(id => [cat, id]), 'Tick the skills this review draws from — one for a page of it alone, a few to review them together. All ticked mixes every skill.');
    }
    let out = def ? [def] : null;
    if (out) {
        const t = _poolTuning(categoryId, skillId);
        out = [def, ...(t.size ? [_SIZE_DEF] : []), ...(t.support ? [_SUPPORT_DEF] : [])];
    }
    _cache.set(key, out);
    return out;
}

registerPoolOptions(poolOptions);
