// js/modules/sheet/lesson-arch/pv.js
// ARCHETYPE PLUG-IN "pv" (the detailed lesson maker, numbers to 1,000): a place-value lesson - the item's number, the
// expanded-form step states, and the cases it names.
// Moved verbatim from roles/lesson.js (lessons-phase0 0.5, design/LESSON_LIBRARY_PLAN.md §8c: the sample lessons and
// the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

import { resolveCtx } from '../index.js';

/** A place-value item's number (its `q.pv.n` or cell payload `n`), or null. */
export function pvNumberOf(it) {
    const q = (it && it.q) || {};
    let v = q.pv && q.pv.n !== undefined ? q.pv.n : q.cell && q.cell.payload ? q.cell.payload.n : undefined;
    // (a numeral answer - "Write the number." from expanded form or words - is the item's number)
    if ((v === undefined || v === null) && /^\d{1,4}$/.test(String(q.ans === undefined ? '' : q.ans).trim())) v = Number(q.ans);
    return Number.isFinite(Number(v)) && v !== undefined && v !== null ? Number(v) : null;
}

/** The named cases of a place-value lesson. */
export const CASES = Object.freeze({
    // The detailed lesson maker (numbers to 1,000, 2026-10-16): a 3-digit place-value item with no
    // 0 place, a 0 in the tens, a 0 in the ones (lessons/detailed/g2-nbt3-read-write-1000.js).
    // (no 0 place and no teen ending: the plain case - critic D14)
    pvNoZero: (it) => { const n = pvNumberOf(it); return n !== null && n >= 100 && n <= 999 && !String(n).includes('0') && Math.floor(n / 10) % 10 !== 1; },
    pvThousand: (it) => pvNumberOf(it) === 1000,
    // (a chart model: no 0, no teen, three different digits - critic r2: which 5 made which word?)
    pvPlain: (it) => { const n = pvNumberOf(it); return n !== null && n >= 100 && n <= 999 && !String(n).includes('0') && Math.floor(n / 10) % 10 !== 1 && new Set(String(n)).size === 3; },
    pvZeroTens: (it) => { const n = pvNumberOf(it); return n !== null && n >= 100 && n <= 999 && Math.floor(n / 10) % 10 === 0 && n % 10 !== 0; },
    pvZeroOnes: (it) => { const n = pvNumberOf(it); return n !== null && n >= 100 && n <= 999 && n % 10 === 0 && Math.floor(n / 10) % 10 !== 0; },
    pvTeen: (it) => { const n = pvNumberOf(it); return n !== null && n >= 100 && n <= 999 && Math.floor(n / 10) % 10 === 1 && n % 10 !== 0; },
    // an edge case of numbers to 1,000: a 0 place, a teen ending, or 1,000 itself
    pvEdge: (it) => { const n = pvNumberOf(it); return n !== null && (n === 1000 || (n >= 100 && (Math.floor(n / 10) % 10 === 0 || n % 10 === 0 || Math.floor(n / 10) % 10 === 1))); },
});

/** A place-value expanded-form item (pv `expand`): the detailed lesson's chart (2026-10-16). */
export const isExpand = (it) => { const cl = it && it.q && it.q.cell; return !!(cl && cl.template === 'pv' && cl.payload && cl.payload.kind === 'expand'); };

/**
 * The state of an expanded-form problem after step k (P-LC-9): a box is empty until the step that
 * first writes it, grey at that step (the newest mark), black after; a box a later step names
 * again ("So 539 = 500 + 30 + 9") is grey again on that step's panel. The cell is the pv template's
 * own drawing, answered, with the boxes of later steps emptied.
 */
export function expandState(it, groups, k, c) {
    const first = new Map();
    groups.forEach((g, gi) => (g.marks || []).forEach((m) => { if (m && m.slot && !first.has(m.slot)) first.set(m.slot, gi); }));
    const newest = new Set(((groups[k] && groups[k].marks) || []).map((m) => m && m.slot).filter(Boolean));
    const ctx = resolveCtx(Object.assign({}, c, { state: 'answered', scaffoldLevel: 1, metrics: undefined }));
    let html = it.render(ctx, { cols: 1 });
    html = html.replace(/<span class="ws-box([^"]*)"([^>]*?) data-ws-slot="(part\d+)"([^>]*)>([^<]*)<\/span>/g, (m, cls, pre, slot, post, val) => {
        const g = first.has(slot) ? first.get(slot) : 0;
        const attrs = `${pre} data-ws-slot="${slot}"${post.replace(/ data-ws-ink="[a-z]+"/, '')}`;
        if (g > k) return `<span class="ws-box${cls}"${attrs}></span>`;
        if (newest.has(slot)) return `<span class="ws-box${cls} ws-trace"${attrs} data-ws-ink="trace">${val}</span>`;
        return `<span class="ws-box${cls}"${attrs} data-ws-ink="solid">${val}</span>`;
    });
    return html;
}

export default { CASES, pvNumberOf, isExpand, expandState };
