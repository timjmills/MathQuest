// js/modules/sheet/lesson-arch/fact.js
// ARCHETYPE PLUG-IN "fact" (design/LESSON_LIBRARY_PLAN.md §6): the fact strategy archetype (A2) - the count-on marks of a vertical fact
// (the bigger number ringed, the dot tile, the hops) and the cases a fact lesson declares.
// Moved verbatim from roles/lesson.js (phase 0: the sample lessons render byte-identical).
// Pure module (SCC-01).

import { operandsOf, opOf } from '../roles/compose.js';
import { dotTile, countCueOf, countCueRow } from '../roles/guided.js';

const PT_MM = 25.4 / 72;

/** The named cases of a fact lesson (lesson data `example.test`, `second.test`, `cases`). */
export const CASES = Object.freeze({
    bigFirst: (it) => { const o = operandsOf((it && it.q) || {}); return o.length >= 2 && Number(o[0]) > Number(o[1]); },
    bigSecond: (it) => { const o = operandsOf((it && it.q) || {}); return o.length >= 2 && Number(o[0]) < Number(o[1]); },
    double: (it) => { const o = operandsOf((it && it.q) || {}); return o.length >= 2 && Number(o[0]) === Number(o[1]); },
});

/** A ring round a number (trace grey on its own step, black after it). No layout: an outline. */
// The ring is the mark, not the digit: the digit keeps its ink (`data-ws-mark`, never `data-ws-ink`,
// which would grey the digit inside it).
export const ring = (text, ink) => `<span class="mq-lring${ink === 'trace' ? ' mq-lring-t' : ''}" data-ws-mark="${ink}">${text}</span>`;

/** The ones digit of row 1 or row 2 of a vertical fact, ringed. */
export function ringFactRow(html, row, ink) {
    const at = html.indexOf('<span class="op">');
    if (at < 0) return html;
    const head = html.slice(0, at);
    const tail = html.slice(at);
    const last = (s) => {
        const re = /<span>(\d)<\/span>(?![\s\S]*<span>\d<\/span>)/;
        return s.replace(re, (m, d) => `<span>${ring(d, ink)}</span>`);
    };
    if (row === 1) return last(head) + tail;
    const cut = tail.indexOf('<span class="rule">');
    return cut < 0 ? html : head + last(tail.slice(0, cut)) + tail.slice(cut);
}

/** A dot tile in black ink (an earlier step's mark). */
export const inkTile = (n, ink) => {
    const svg = dotTile(n);
    return ink === 'trace' ? svg : svg.replace(/#949494/g, '#000').replace(/data-ws-ink="trace"/, 'data-ws-ink="solid"').replace(/stroke-width="\.3"/, 'stroke-width=".265"');
};

/**
 * The count-on marks of an addition fact, by step: "Start with" rings the bigger number, "Count
 * on" puts the dot tile of the smaller one beside it (the Guided page's count cue, H3).
 */
export function factMarks(html, it, steps, groups, k, hops = false) {
    const q = it.q || {};
    const o = operandsOf(q);
    if (opOf(q) !== 'add' || o.length < 2) return html;
    let out = html;
    let tile = null;
    let start = null;
    groups.slice(0, k + 1).forEach((g, gi) => {
        const ink = gi === k ? 'trace' : 'solid';
        for (const si of g.steps) {
            const t = (steps[si] && steps[si].text) || '';
            if (/^Start with/i.test(t)) { out = ringFactRow(out, o[0] >= o[1] ? 1 : 2, ink); start = ink; }
            if (/^Count on/i.test(t)) tile = ink;
        }
    });
    const n = countCueOf(it);
    if (tile && n) out = `<div class="mq-cuewrap">${out}<span class="mq-cue${countCueRow(it) === 2 ? ' mq-cue-b' : ''}">${inkTile(n, tile)}</span></div>`;
    // Lessons r3: "Count on" draws the counting itself - the hops from the big number, one a
    // number said (4 -> 5, 6, 7), under the fact.
    // (Before it, "Start with" writes the start number where the hops will begin.)
    if (hops && o[0] !== o[1] && (tile || start)) out = `<div class="mq-hopwrap">${out}${hopsSvg(Math.max(o[0], o[1]), tile ? Math.min(o[0], o[1]) : 0, tile || start, tile ? 'solid' : start)}</div>`;
    return out;
}

/** The hops of a count-on example on state k (grey on the step that counts on, black after), or ''. */
export function panelHops(it, steps, groups, k) {
    const q = (it && it.q) || {};
    const o = operandsOf(q);
    if (!(q.cell && q.cell.template === 'fact') || opOf(q) !== 'add' || o.length < 2 || o[0] === o[1]) return '';
    let ink = null;
    groups.slice(0, k + 1).forEach((g, gi) => { for (const si of g.steps) if (/^Count on/i.test((steps[si] && steps[si].text) || '')) ink = gi === k ? 'trace' : 'solid'; });
    return ink ? `<div class="mq-chops">${hopsSvg(Math.max(o[0], o[1]), Math.min(o[0], o[1]), ink)}</div>` : '';
}

/** The count-on hops: the start number, then one arc and one number for each number counted on. */
export function hopsSvg(from, n, ink = 'solid', startInk = 'solid') {
    const k = Math.max(0, Math.min(9, Math.floor(Number(n) || 0)));
    const step = 11, pad = 5, fsz = 5.2, H = 15.5;
    const col = ink === 'trace' ? '#949494' : '#000';
    let b = '';
    for (let j = 0; j <= k; j++) {
        const x = pad + j * step;
        const inkJ = j === 0 ? startInk : ink;
        const cJ = inkJ === 'trace' ? '#949494' : '#000';
        b += `<text x="${x.toFixed(2)}" y="${(H - 1.2).toFixed(2)}" text-anchor="middle" font-size="${fsz}" font-weight="700" fill="${cJ}" style="fill:${cJ}"${inkJ === 'trace' ? ' data-ws-ink="trace"' : ''}>${Number(from) + j}</text>`;
        if (j < k) {
            const x1 = x + 1.2, x2 = x + step - 1.2;
            b += `<path d="M${x1.toFixed(2)} 7.2 Q${(x + step / 2).toFixed(2)} 0.6 ${x2.toFixed(2)} 6.6" fill="none" stroke="${col}" stroke-width="${(1 * PT_MM).toFixed(3)}"/>`
                + `<path d="M${(x2 - 1.6).toFixed(2)} 5.2 L${x2.toFixed(2)} 7.2 L${(x2 + 0.4).toFixed(2)} 4.8 Z" fill="${col}"/>`;
        }
    }
    const W = pad * 2 + step * k;
    return `<svg class="mq-hops" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm" aria-hidden="true" style="display:block;margin:1.5mm auto 0;font-family:'Andika',sans-serif">${b}</svg>`;
}

export default { CASES, ring, ringFactRow, inkTile, factMarks, panelHops, hopsSvg };
