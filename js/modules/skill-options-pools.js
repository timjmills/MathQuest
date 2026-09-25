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
import { SKILLS, getMixedPoolSkills, getSkillsForCategory, getMixedSkillScope, getSkillsForGrade, isMixedMetaSkill } from './data.js';
import { registerPoolOptions } from './skill-options.js';

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
const _catLabel = (cat) => {
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
    return getMixedPoolSkills(categoryId, skillId);
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
    const out = def ? [def] : null;
    _cache.set(key, out);
    return out;
}

registerPoolOptions(poolOptions);
