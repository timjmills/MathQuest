// js/modules/skill-search-terms.js — the words a skill is found by, shared by EVERY skill search (2026-10-03).
//
// Owner report 2026-10-03: typing "skip counting" did not find "Count by 1–12" (multiplication:count_by_tables).
// Every search box (student search, quick skills, mixed search, print searches, the teacher pickers, the Skills
// Navigator and the quiz builder) builds its haystack with `skillHay` and orders its hits with `rankSkillHits`, so a
// synonym or a pinned first hit is declared once, here.
//
// Layer 0: no imports, no DOM at module load (the DOM helper `pinFirstInDom` runs only when a search calls it).

/** Extra words a skill is found by ('category:skill' -> words), beyond its label, category and id. */
export const SKILL_SEARCH_SYNONYMS = Object.freeze({
    'multiplication:count_by_tables': 'skip count skip counting skip-counting count by counting by count on times tables multiples',
    'patterns:skip_count_grid': 'skip count skip-counting count by counting by 2s 5s 10s',
    'patterns:skip_count_line': 'skip count skip-counting count by counting by number line jumps hops 2s 5s 10s',
});

/** A query that names a skill outright lists it FIRST (the owner: "skip counting" must lead with count_by_tables). */
export const SEARCH_PINS = Object.freeze([
    { re: /\bskip[\s-]*count|\bcount(?:ing)?\s+by\b/i, key: 'multiplication:count_by_tables' },
]);

/** The query's words, lower case. */
export const searchWords = (q) => String(q || '').toLowerCase().trim().split(/\s+/).filter(Boolean);

/** The synonyms of one skill ('' when none). */
export const skillSynonyms = (categoryId, skillId) => SKILL_SEARCH_SYNONYMS[`${categoryId}:${skillId}`] || '';

/** The lower-case text a skill is searched by: the given parts (label, category ...), its id in words and its synonyms. */
export function skillHay(categoryId, skillId, ...parts) {
    return `${parts.filter(Boolean).join(' ')} ${String(skillId || '').replace(/_/g, ' ')} ${skillSynonyms(categoryId, skillId)}`.toLowerCase();
}

/** True when every word of the query is in the haystack. */
export function hayMatches(hay, query) {
    const words = searchWords(query);
    return words.every((w) => String(hay || '').includes(w));
}

/** The 'category:skill' keys this query pins first, in pin order. */
export function pinnedKeys(query) {
    const q = String(query || '');
    return SEARCH_PINS.filter((p) => p.re.test(q)).map((p) => p.key);
}

/**
 * The hits in display order: pinned skills first, then skills whose label holds the whole query, then the rest in
 * their catalogue order (a stable sort). `keyOf(hit)` -> 'category:skill'; `labelOf(hit)` -> its label.
 */
export function rankSkillHits(hits, query, keyOf, labelOf = () => '') {
    const pins = pinnedKeys(query);
    const whole = String(query || '').toLowerCase().trim();
    const score = (h) => {
        const pi = pins.indexOf(keyOf(h));
        if (pi >= 0) return pi - 100;
        return whole && String(labelOf(h) || '').toLowerCase().includes(whole) ? 0 : 1;
    };
    return hits.map((h, i) => ({ h, i, s: score(h) })).sort((a, b) => a.s - b.s || a.i - b.i).map((x) => x.h);
}

const _touched = new Set();
/**
 * DOM lists (Skills Navigator, quiz builder): move the pinned card - and the category group and domain section that
 * hold it - to the top of their parents, up to `stopAt`; with no pinned card, every list moved before goes back to
 * its built order. Each element's built position is kept in data-mq-ord the first time its parent is touched.
 */
export function pinFirstInDom(pinnedEl, stopAt) {
    const chain = new Set();
    let el = pinnedEl;
    while (el && el !== stopAt && el.parentElement) {
        chain.add(el);
        const par = el.parentElement;
        [...par.children].forEach((k, i) => { if (k.dataset && k.dataset.mqOrd === undefined) k.dataset.mqOrd = String(i); });
        _touched.add(par);
        el = par;
        if (par === stopAt) break;
    }
    for (const par of _touched) {
        if (!par.isConnected) { _touched.delete(par); continue; }
        const kids = [...par.children];
        if (kids.some((k) => !k.dataset || k.dataset.mqOrd === undefined)) continue;
        const sorted = kids.slice().sort((a, b) => (chain.has(b) - chain.has(a)) || (Number(a.dataset.mqOrd) - Number(b.dataset.mqOrd)));
        if (sorted.some((k, i) => k !== kids[i])) sorted.forEach((k) => par.appendChild(k));
    }
}
