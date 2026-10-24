// teacher-areas.js — the maths AREA of every skill (Teacher site 2.0, T2).
//
// One function, areaOf(categoryId, skillId), used by every teacher screen and by the token gate
// (IMPROVEMENT_PLAN.md §2.7 "Where the area comes from"). Colour on the teacher site marks the maths
// area ONLY; the area also always travels with its name and icon (AREAS below), never colour alone.
//
// The rules, in order (a port of design/audit/palette-2026-10-23/areas.mjs, which reproduces the
// counts: tagged 606 · by category 33 · Mixed 26 · Words 50 = 715 live skills on 2026-10-23):
//   1. the skill's primary CCSS code in SKILL_STANDARDS (the first code); MD is split by cluster:
//      the "represent and interpret data" clusters (K.MD.B, 1.MD.C, 2.MD.D, 3.MD.B, 4.MD.B, 5.MD.B)
//      are DATA, every other MD cluster is MEAS; 6.SP is DATA;
//   2. a 6.RP / 6.NS code on a skill whose own grade is not 6 (or Mixed levels) takes that grade's
//      area for the same content: 6.NS.C (the coordinate plane) -> G, 6.NS.B (factors, multiples) -> OA;
//   3. an untagged skill (or a pool inside one category) takes the area of a clear majority (more
//      than half) of the tagged skills in its category; probability (no tagged skill yet) -> DATA;
//   4. no clear majority -> MIXED; the vocabulary category -> WORDS; anything else -> NOSTD
//      (slate, dashed outline, "No standard").
//   5. (lessons take the area of their own CCSS: areaOfCode(code, grade).)
// The six app DOMAINS are never used for colour.

import { SKILLS, getSkillGrade } from './data.js';
import { SKILL_STANDARDS } from './standards.js';

/** The eleven area keys: eight maths areas + the three slate kinds. Order = display order. */
export const AREA_ORDER = ['CC', 'OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G', 'RPNS', 'MIXED', 'WORDS', 'NOSTD'];

/** Names (the mock-up's words), the CSS ramp prefix (css/teacher-tokens.css) and the icon of each area. */
export const AREAS = {
    CC: { name: 'Counting', short: 'Counting', long: 'Counting & cardinality', css: 'cc', icon: 'dots' },
    OA: { name: 'Operations & algebra', short: 'Operations', long: 'Operations & algebraic thinking', css: 'oa', icon: 'plus' },
    NBT: { name: 'Place value', short: 'Place value', long: 'Number & operations in base ten', css: 'nbt', icon: 'blocks' },
    NF: { name: 'Fractions & decimals', short: 'Fractions', long: 'Fractions & decimals', css: 'nf', icon: 'half' },
    MEAS: { name: 'Measurement', short: 'Measure', long: 'Measurement: length, mass, time, money, area, angles', css: 'meas', icon: 'ruler' },
    DATA: { name: 'Data', short: 'Data', long: 'Data: graphs, tables, chance', css: 'data', icon: 'chart' },
    G: { name: 'Geometry', short: 'Geometry', long: 'Geometry', css: 'g', icon: 'shape' },
    RPNS: { name: 'Ratio & number system', short: 'Ratio', long: 'Ratio & number system (grade 6)', css: 'rpns', icon: 'ratio' },
    MIXED: { name: 'Mixed', short: 'Mixed', long: 'Mixed: skills from several areas', css: 'slate', icon: 'mixed' },
    WORDS: { name: 'Words', short: 'Words', long: 'Maths words', css: 'slate', icon: 'book' },
    NOSTD: { name: 'No standard', short: 'No standard', long: 'No standard', css: 'slate', icon: 'nostd' },
};

/** The area icons (20 x 20, drawn in currentColor), copied from the signed mock-up. */
export const AREA_ICONS = {
    dots: '<circle cx="6" cy="6" r="2.2" fill="currentColor"/><circle cx="14" cy="6" r="2.2" fill="currentColor"/><circle cx="6" cy="14" r="2.2" fill="currentColor"/><circle cx="14" cy="14" r="2.2" fill="currentColor"/>',
    plus: '<path d="M6 3v6M3 6h6M11 14h6M3 17l6-6M3 11l6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
    blocks: '<rect x="3" y="3" width="4" height="14" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="9" y="3" width="4" height="14" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="15" y="13" width="3" height="3" fill="currentColor"/>',
    half: '<circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 3a7 7 0 0 1 0 14z" fill="currentColor"/>',
    ruler: '<rect x="2" y="7" width="16" height="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 7v3M8 7v2M11 7v3M14 7v2" stroke="currentColor" stroke-width="1.6"/>',
    chart: '<path d="M3 17h14M5 17V10M10 17V5M15 17v-5" stroke="currentColor" stroke-width="2.6" fill="none"/>',
    shape: '<path d="M10 3l7 13H3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    ratio: '<circle cx="5" cy="6" r="2" fill="currentColor"/><circle cx="5" cy="14" r="2" fill="currentColor"/><path d="M10 15l6-10" stroke="currentColor" stroke-width="2"/>',
    mixed: '<path d="M3 6h3l8 8h3M3 14h3l8-8h3M15 4l2 2-2 2M15 12l2 2-2 2" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    book: '<path d="M3 4h5a2 2 0 0 1 2 2v11a2 2 0 0 0-2-2H3zM17 4h-5a2 2 0 0 0-2 2v11a2 2 0 0 1 2-2h5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    nostd: '<rect x="4" y="4" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"/>',
};

/** An area's icon as inline SVG (aria-hidden: the area NAME always goes beside it). */
export function areaIcon(key, size = 20) {
    const a = AREAS[key] || AREAS.NOSTD;
    return `<svg class="tv2-icon" width="${size}" height="${size}" viewBox="0 0 20 20" aria-hidden="true" focusable="false">${AREA_ICONS[a.icon] || ''}</svg>`;
}

// The MD clusters that are "represent and interpret data", per grade.
const DATA_MD = { K: 'B', 1: 'C', 2: 'D', 3: 'B', 4: 'B', 5: 'B' };
// Categories with no tagged skill whose area is still clear.
const CATEGORY_AREA = { probability: 'DATA' };

/**
 * The area of one CCSS code (rule 1 and rule 2). `grade` is the skill's or lesson's own grade
 * ('K', '1' … '6', 'M'); a 6.RP / 6.NS code on a grade other than 6 / M is moved (rule 2).
 * Returns an area key, or null for a code that is not CCSS maths.
 */
export function areaOfCode(code, grade) {
    const m = String(code || '').match(/^(K|\d)\.([A-Z]+)(?:\.([A-Z]))?/);
    if (!m) return null;
    const [, cg, d, cl] = m;
    const g = String(grade ?? '');
    if (d === 'CC') return 'CC';
    if (d === 'OA' || d === 'EE') return 'OA';
    if (d === 'NBT') return 'NBT';
    if (d === 'NF') return 'NF';
    if (d === 'MD') return cl === DATA_MD[cg] ? 'DATA' : 'MEAS';
    if (d === 'SP') return 'DATA';
    if (d === 'G') return 'G';
    if (d === 'RP' || d === 'NS') {
        if (g !== '6' && g !== 'M') {
            if (d === 'NS' && cl === 'C') return 'G';
            if (d === 'NS' && cl === 'B') return 'OA';
        }
        return 'RPNS';
    }
    return 'NOSTD';
}

function gradeOf(categoryId, skillId) {
    return String(getSkillGrade(skillId, categoryId) ?? '?');
}

function taggedArea(categoryId, skillId) {
    const st = SKILL_STANDARDS[`${categoryId}:${skillId}`];
    const code = st && st.ccss && st.ccss[0];
    return code ? areaOfCode(code, gradeOf(categoryId, skillId)) : null;
}

// Votes of the tagged live skills in each category (rule 3), built once on first use.
let votes = null;
function categoryVotes() {
    if (votes) return votes;
    votes = {};
    for (const [cat, list] of Object.entries(SKILLS || {})) {
        for (const s of list || []) {
            if (!s || !s.v || s.retired) continue;
            const a = taggedArea(cat, s.v);
            if (!a) continue;
            (votes[cat] = votes[cat] || {})[a] = (votes[cat][a] || 0) + 1;
        }
    }
    return votes;
}

/** The area of a clear majority (more than half) of a category's tagged skills, else null. */
export function categoryArea(categoryId) {
    if (CATEGORY_AREA[categoryId]) return CATEGORY_AREA[categoryId];
    const v = categoryVotes()[categoryId];
    if (!v) return null;
    const total = Object.values(v).reduce((x, y) => x + y, 0);
    const [top, n] = Object.entries(v).sort((x, y) => y[1] - x[1])[0];
    return n * 2 > total ? top : null;
}

/**
 * The area of a skill and how it was found: { area, via, pool }.
 *   via  'standard' (rule 1/2) · 'category' (rule 3) · 'mixed' (rule 4) · 'words' · 'none'
 *   pool true for a mixed pool inside one category that took its category's area (it shows the
 *        area's icon with a small "mixed" badge)
 */
export function areaDetail(categoryId, skillId) {
    if (categoryId === 'vocabulary') return { area: 'WORDS', via: 'words', pool: false };
    const known = (SKILLS[categoryId] || []).some((s) => s && s.v === skillId);
    const tagged = taggedArea(categoryId, skillId);
    if (tagged) return { area: tagged, via: 'standard', pool: false };
    if (!known) return { area: 'NOSTD', via: 'none', pool: false };
    const cat = categoryArea(categoryId);
    if (cat) return { area: cat, via: 'category', pool: /(^|_)mixed(_|$)|_all$/.test(String(skillId)) };
    return { area: 'MIXED', via: 'mixed', pool: false };
}

/** The maths area key of a skill: 'CC' 'OA' 'NBT' 'NF' 'MEAS' 'DATA' 'G' 'RPNS' 'MIXED' 'WORDS' 'NOSTD'. */
export function areaOf(categoryId, skillId) {
    return areaDetail(categoryId, skillId).area;
}

/** Counts over every live skill (the numbers §2.7 quotes; the token gate prints them). */
export function areaCounts() {
    const how = { tagged: 0, category: 0, mixed: 0, words: 0, none: 0 };
    const counts = {};
    const byGrade = {};
    for (const [cat, list] of Object.entries(SKILLS || {})) {
        for (const s of list || []) {
            if (!s || !s.v || s.retired) continue;
            const d = areaDetail(cat, s.v);
            how[d.via === 'standard' ? 'tagged' : d.via]++;
            counts[d.area] = (counts[d.area] || 0) + 1;
            const g = gradeOf(cat, s.v);
            (byGrade[g] = byGrade[g] || new Set()).add(d.area);
        }
    }
    const grades = {};
    for (const [g, set] of Object.entries(byGrade)) grades[g] = AREA_ORDER.filter((a) => set.has(a));
    return { how, counts, grades };
}
