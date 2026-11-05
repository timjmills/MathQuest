// pupil-names.js — the names pupils see for skills (explorer check D5, 2026-11-05).
//
// Raw skill labels carry teacher wording: a leading emoji, and parentheticals such as "(Visual)", "(No Visuals)",
// "(No Pictures)", "(B&W)", "(Visual, MC)". A pupil card drops those. When two skills would then share a name, each
// keeps a short pupil word instead ("with pictures" / "numbers only"); if that still collides, the full cleaned
// label is kept, so two skills never show the same name.
//
// Pure: no DOM, no state. Lazy (only the pupil explorer imports it).

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
            if (/^mc$/i.test(p)) continue;
            if (/^visual\s+/i.test(p)) { kind = kind || 'pics'; p = p.replace(/^visual\s+/i, ''); }
            if (p) keep.push(p);
        }
        return keep.length ? ` (${keep.join(', ')})` : '';
    }).replace(/\s{2,}/g, ' ').trim();
    return { name: s || cleanLabel(label), kind };
}

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
