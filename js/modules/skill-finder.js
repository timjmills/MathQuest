// skill-finder.js — the ONE skill search every search box calls (student search, teacher library,
// teacher pickers, Skills Navigator, mixed-skills search, print search, quiz builder).
//
// It joins the thesaurus in search-terms.js to SKILLS, and — once loaded — to each skill's CCSS / EE
// codes (standards.js) and White Rose small steps (wrm.js). Those two modules are large, so they load
// lazily on the first search (or when warmSkillSearch() is called at idle); until then search works
// on labels, concepts and grades, and the index is rebuilt when they arrive.

import { DOMAINS, visibleSkills, getSkillGrade } from './data.js';
import { buildSearchIndex, searchIndex } from './search-terms.js';

let index = null;
let curriculum = null;       // { standardsFor, wrmFor } once loaded
let loading = null;
const listeners = new Set();

/** One entry per live skill (tombstones excluded), mixed pools included. */
export function skillSearchEntries() {
    const out = [];
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        for (const cat of domain.categories) {
            for (const sk of visibleSkills(cat.id) || []) {
                const e = {
                    key: `${cat.id}:${sk.v}`, domainId, domainName: domain.name, categoryId: cat.id, categoryName: cat.name,
                    skillId: sk.v, label: sk.l, grade: getSkillGrade(sk.v, cat.id), codes: [], wrm: [],
                };
                if (curriculum) {
                    try {
                        const st = curriculum.standardsFor(cat.id, sk.v);
                        for (const r of [...st.ccss, ...st.ee]) {
                            e.codes.push(r.code);
                            if (r.short) e.codes.push(r.short);
                            if (r.type === 'ee') e.codes.push(String(r.code).replace(/^M\./, ''));
                            const m = String(r.short || r.code).match(/^(K|\d)\.([A-Z]+)/);
                            if (m) e.codes.push(`${m[1]}.${m[2]}`);
                        }
                    } catch (err) { /* no standards for this skill */ }
                    try { e.wrm = curriculum.wrmFor(cat.id, sk.v).map((w) => ({ id: w.id, title: w.title })); } catch (err) { /* none */ }
                }
                out.push(e);
            }
        }
    }
    return out;
}

function getIndex() {
    if (!index) index = buildSearchIndex(skillSearchEntries());
    return index;
}

/** Load the standards and WRM modules and rebuild the index with their codes and step titles. */
export function warmSkillSearch() {
    if (curriculum) return Promise.resolve(true);
    if (loading) return loading;
    loading = Promise.all([import('./standards.js'), import('./wrm.js')]).then(([std, wrm]) => {
        curriculum = { standardsFor: std.standardsFor, wrmFor: wrm.wrmFor };
        index = null;
        for (const fn of listeners) { try { fn(); } catch (e) { /* a listener must not break search */ } }
        return true;
    }).catch(() => { loading = null; return false; });
    return loading;
}

/** Call fn when the curriculum terms arrive (to re-run a search that is on screen). */
export function onSkillSearchReady(fn) { listeners.add(fn); }

/**
 * Ranked search: [{ key, categoryId, skillId, label, score, entry }] best first. Every query word
 * must match. Empty query -> [].
 */
export function findSkills(query) {
    if (!String(query || '').trim()) return [];
    if (!curriculum) warmSkillSearch();
    return searchIndex(getIndex(), query).map(({ entry, score }) => ({
        key: entry.key, categoryId: entry.categoryId, skillId: entry.skillId, label: entry.label, score, entry,
    }));
}

/** Map 'categoryId:skillId' -> score for a query (null for an empty query): for filter-style boxes. */
export function skillSearchScores(query) {
    if (!String(query || '').trim()) return null;
    const m = new Map();
    for (const h of findSkills(query)) m.set(h.key, h.score);
    return m;
}

/** Order any list of {categoryId, skillId} by a query: matches only, best first. */
export function rankByQuery(list, query, keyOf = (s) => `${s.categoryId}:${s.skillId}`) {
    const scores = skillSearchScores(query);
    if (!scores) return list.slice();
    return list.filter((s) => scores.has(keyOf(s))).map((s, i) => ({ s, i, sc: scores.get(keyOf(s)) }))
        .sort((a, b) => b.sc - a.sc || a.i - b.i).map((x) => x.s);
}
