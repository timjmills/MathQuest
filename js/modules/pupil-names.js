// pupil-names.js — the names pupils see for skills (explorer check D5, 2026-11-05).
//
// Raw skill labels carry teacher wording: a leading emoji, and parentheticals such as "(Visual)", "(No Visuals)",
// "(No Pictures)", "(B&W)", "(Visual, MC)". A pupil card drops those. When two skills would then share a name, each
// keeps a short pupil word instead ("with pictures" / "numbers only"); if that still collides, the full cleaned
// label is kept, so two skills never show the same name.
//
// Fix round 2 (2026-11-05): the ONE source of a skill's pupil name on every pupil surface (the explorer, the selection
// chips, the Quick Start cards, the Print list, "Your skill:", the Send landing). `pupilNameOf()` reads one map built
// once from every live skill, so the clash rule holds everywhere. Also dropped: "(MAP)", "(Match)", "(Easy)"; and
// "Like / Unlike Denom" is written out ("like denominators").
//
// Fix round 3 (2026-11-05): `pupilCardParts()` gives a Quick Start card a head and a tail so a clamp can never hide the
// part that tells two names apart; "OoO", "Parens", "Level N:", "Coord", "Mult/Div", "- Easy", "/10 as /100" are written
// in pupil words.
//
// No DOM, no state; it reads only the startup data (DOMAINS, visibleSkills). Small and loaded at startup, because the
// pupil home's Quick Start cards need it on their first paint (the explorer itself stays lazy).

import { DOMAINS, visibleSkills } from './data.js';

const LEAD_ICONS = /^[\s\u{1F300}-\u{1FAFF}☀-➿⬀-⯿️‍½]+/u;

/** The label without its leading icons (the "cleaned label" every card name starts from). */
export const cleanLabel = (l) => String(l || '').replace(LEAD_ICONS, '').trim() || String(l || '');

/** The label without teacher-only parentheticals, and the kind it carried ('pics' | 'plain' | ''). */
export function pupilBase(label) {
    let kind = '';
    const s = cleanLabel(label).replace(/\s*\(([^)]*)\)/g, (m, inner) => {
        const keep = [];
        for (let p of inner.split(/,\s+/).map((x) => x.trim())) {
            if (/^no (visuals?|pictures)$/i.test(p)) { kind = kind || 'plain'; continue; }
            if (/^(visuals?|b&w|black and white)$/i.test(p)) { kind = kind || 'pics'; continue; }
            if (/^(mc|map|match|easy)$/i.test(p)) continue;
            p = p.replace(/\b(like|unlike) denom\b\.?/gi, (w, a) => `${a.toLowerCase()} denominators`);
            if (/^visual\s+/i.test(p)) { kind = kind || 'pics'; p = p.replace(/^visual\s+/i, ''); }
            if (p) keep.push(p);
        }
        return keep.length ? ` (${keep.join(', ')})` : '';
    }).replace(/\b(like|unlike) denom\b\.?/gi, (w, a) => `${a.toLowerCase()} denominators`).replace(/\s{2,}/g, ' ').trim();
    let n = s;
    for (const [re, to] of PUPIL_WORDS) n = n.replace(re, to);
    return { name: n || s || cleanLabel(label), kind };
}

// Fix round 3 (check r3 R3): the teacher shorthand left in a few labels, written in pupil words. Whole labels first
// (they read better rewritten as one), then the general words.
const PUPIL_WORDS = [
    [/^OoO Easy: Two Ops, No Parens$/, 'Order of Operations: 2 Steps, No Brackets'],
    [/^OoO Medium: Parentheses$/, 'Order of Operations: Brackets'],
    [/^OoO Hard: Brackets & Exponents$/, 'Order of Operations: Brackets and Exponents'],
    [/^Level 1: Two Operations$/, 'Order of Operations: 2 Steps'],
    [/^Level 2: Three Operations$/, 'Order of Operations: 3 Steps'],
    [/^Level 3: Four to Six Operations$/, 'Order of Operations: 4 to 6 Steps'],
    [/^Level 4: Simple Parentheses$/, 'Order of Operations: Simple Brackets'],
    [/^Level 5: Multiple Ops with Parens$/, 'Order of Operations: Many Steps with Brackets'],
    [/^Level 6: Complex Nested Brackets$/, 'Order of Operations: Brackets inside Brackets'],
    [/^Level 7: Exponents$/, 'Order of Operations: Exponents'],
    [/^Polygon on Coord Grid \(Side Lengths\/Perimeter\)$/, 'Shapes on a Coordinate Grid (side lengths and perimeter)'],
    [/^Fraction Mult\/Div Word(?: Problems)?$/, 'Fraction Word Problems: Multiply and Divide'],
    [/^Fractions \/10 as \/100$/, 'Tenths as Hundredths'],
    [/\bOoO\b/g, 'Order of Operations'],
    [/\bParens\b/g, 'Brackets'],
    [/\bOps\b/g, 'Operations'],
    [/\bCoord\b/g, 'Coordinate'],
    [/\bMult\/Div\b/g, 'Multiply and Divide'],
    [/\s+-\s+(Easy|Medium|Hard)\b/g, ': $1'],
];

const QUALIFIER = { pics: 'with pictures', plain: 'numbers only' };

/**
 * Pupil names for a whole list at once (collisions can only be judged across the list).
 * @param {Array<{key:string,label:string,area?:string}>} items  label = the raw skill label; area = its category name
 * @returns {Map<string,string>} key -> pupil name, every name distinct
 */
export function pupilNames(items) {
    const base = items.map((it) => ({ key: it.key, raw: it.label, ...pupilBase(it.label) }));
    const groups = new Map();
    for (const b of base) { const a = groups.get(b.name) || []; a.push(b); groups.set(b.name, a); }
    const out = new Map();
    for (const [name, list] of groups) {
        if (list.length === 1) { out.set(list[0].key, name); continue; }
        for (const b of list) {
            const q = QUALIFIER[b.kind];
            out.set(b.key, !q ? name : /\)$/.test(name) ? `${name.slice(0, -1)}, ${q})` : `${name} (${q})`);
        }
    }
    // anything still shared falls back to the full cleaned label — never two the same
    const seen = new Map();
    for (const [k, n] of out) { const a = seen.get(n) || []; a.push(k); seen.set(n, a); }
    for (const [, keys] of seen) {
        if (keys.length < 2) continue;
        for (const k of keys) out.set(k, cleanLabel(base.find((b) => b.key === k).raw));
    }
    // the same label in two categories ("Count by 2s" in Multiplication and in Patterns): add the category
    const byName = new Map();
    for (const [k, n] of out) { const a = byName.get(n) || []; a.push(k); byName.set(n, a); }
    for (const [n, keys] of byName) {
        if (keys.length < 2) continue;
        for (const k of keys) { const it = items.find((x) => x.key === k); const area = (it && it.area) || k.split(':')[0]; out.set(k, /\)$/.test(n) ? `${n.slice(0, -1)}, ${area})` : `${n} (${area})`); }
    }
    return out;
}

// ---- the one map, built once from every live skill --------------------------------------------------------------
let MAP = null;
/** Every live skill's pupil name ('category:skill' -> name), all distinct. Built on first use. */
export function pupilNameMap() {
    if (MAP) return MAP;
    const items = [];
    const seen = new Set();
    for (const d of Object.values(DOMAINS)) {
        for (const c of d.categories || []) {
            for (const s of visibleSkills(c.id) || []) {
                const key = `${c.id}:${s.v}`;
                if (seen.has(key)) continue;
                seen.add(key);
                items.push({ key, label: s.l, area: c.name });
            }
        }
    }
    MAP = pupilNames(items);
    return MAP;
}

// ---- the card form (check r3 R1) ---------------------------------------------------------------------------------
// A Quick Start card is ~109 px wide and clamps its name, so two names that share a long start ("Add Fractions (like
// denominators, with pictures)" / "… numbers only") showed the same text. Names that share their first 16 characters
// form a family; each is split at the last clause break inside the start the whole family shares: that start is the
// head (clamped), the rest, which holds every difference, is the tail, a sub-line of its own that is never clamped. Judged against EVERY pupil name, so any
// two cards a pupil puts side by side read apart; the gate (QSVISIBLE) reads the text each card actually shows.
const SPLIT_AT = 16;   // the head is clamped at 3 lines on the card, the tail is not
const SPLIT_WORD_AT = 24;
const SEP = /(\s\(|,\s|:\s|\s[–-]\s)/g;
let PARTS = null;
function splitName(name, c) {
    if (c < SPLIT_AT || c >= name.length) return null;   // a name that is the start of another shows whole beside it
    let at = -1, len = 0;
    for (const m of name.matchAll(SEP)) { if (m.index <= c && m.index > 0) { at = m.index; len = m[0].length; } }
    if (at < 0) {   // no clause break in the shared start: the first break after it, while the head stays short
        for (const m of name.matchAll(SEP)) { if (m.index > c && m.index <= SPLIT_WORD_AT) { at = m.index; len = m[0].length; break; } }
    }
    if (at < 0) {   // else a long shared start splits at its last word break
        if (c < SPLIT_WORD_AT) return null;
        const sp = name.lastIndexOf(' ', c);
        if (sp <= 0) return null;
        at = sp; len = 1;
    }
    let head = name.slice(0, at).trim();
    let tail = name.slice(at + len).trim();
    const open = (head.match(/\(/g) || []).length - (head.match(/\)/g) || []).length;
    if (open > 0) head += ')';
    const shut = (tail.match(/\)/g) || []).length - (tail.match(/\(/g) || []).length;
    if (shut > 0) tail = tail.replace(/\)$/, '');
    return head && tail ? { head, tail } : null;
}
/** { head, tail } for a skill's Quick Start card ('category:skill' key), or null when its name needs no split. */
export function pupilCardParts(key) {
    if (!PARTS) {
        PARTS = new Map();
        // a family = the names that share their first SPLIT_AT characters; the split falls inside the start the WHOLE
        // family shares, so the head is the same for all of them and every difference is in the (unclamped) tail
        const fam = new Map();
        for (const [k, n] of pupilNameMap()) {
            if (n.length < SPLIT_AT) continue;
            const f = n.slice(0, SPLIT_AT);
            if (!fam.has(f)) fam.set(f, []);
            fam.get(f).push([k, n]);
        }
        const cp = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i; };
        for (const list of fam.values()) {
            if (list.length < 2) continue;
            const names = list.map((x) => x[1]).sort();
            const c = cp(names[0], names[names.length - 1]);
            for (const [k, n] of list) { const p = splitName(n, c); if (p) PARTS.set(k, p); }
        }
    }
    return PARTS.get(key) || null;
}

/**
 * The pupil name of one skill. A skill outside the live list (a retired id on an old saved card) keeps its own label
 * without the teacher wording.
 */
export function pupilNameOf(categoryId, skillId, label = '') {
    const n = pupilNameMap().get(`${categoryId}:${skillId}`);
    if (n) return n;
    return label ? pupilBase(label).name : String(skillId || '');
}
