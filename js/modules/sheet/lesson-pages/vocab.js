// js/modules/sheet/lesson-pages/vocab.js
// LESSON PAGE BUILDER "vocab" (design/LESSON_LIBRARY_PLAN.md §8c): the lesson sheet's Vocabulary match (pictures over the
// words in another order; the key draws the lines) and the Remember strip. Lead decision D2 (lessons-phase0): kept
// byte-identical; the vocabulary redesign adds its own pages by registering a part (lesson-pages/index.js).
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz paper; the skill
// supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved verbatim from roles/lesson.js (lessons-phase0 0.5: the
// sample lessons and the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random.

import { planItem, gridPart, instructionText, esc } from '../roles/compose.js';
import { factGridMini } from '../cells/mult-grid.js';
import { barMini } from '../cells/word-work.js';
import { PT_MM, band, hOf } from './common.js';
import { vocabPictureSVG, hasVocabPicture, vocabPictureAlsoShows } from '../graphics/vocab-pictures.js';

/** A picture of a vocabulary word: in-house line art or plain Andika (RP-20, INK-7). */
export function vocabPicture(pic, c) {
    const m = c.metrics;
    const mm = (v) => `${v.toFixed(2)}mm`;
    switch (pic && pic.kind) {
        // a small part-whole bar (detailed lesson 2): {whole, a, b, mark: 'whole' | 'parts'}
        case 'bar': return barMini({ whole: pic.whole, a: pic.a, b: pic.b, mark: pic.mark || '', wMm: 36, pt: 12, only: !!pic.only });
        // (one product, detailed lesson 4: the chart corner a × b with its product boxed)
        case 'fact': return factGridMini(Number(pic.a), Number(pic.b));
        case 'glyph': return `<span class="mq-lvpic-glyph" style="font-size:${Math.round(m.digitPt * 1.3)}pt">${esc(pic.text)}</span>`;
        // A longer text picture ("10, 20, 30") at four fifths, so it never crowds its neighbour.
        case 'text': return `<span class="mq-lvpic-text" style="font-size:${String(pic.text || '').length > 7 ? Math.round(m.digitPt * 0.8) : m.digitPt}pt">${esc(pic.text)}</span>`;
        // The place heads as the stack draws them (critic s3-stack r1 N6b: "HTh TTh Th H T O" as
        // a text picture wrapped at L): {heads: 'HTh TTh Th H T O'}, each head in its own grid
        // column, bold at the size's text type (a label, as the heads are), over a rule. Never
        // wraps (one column per head).
        case 'heads': {
            const hs = String(pic.heads || pic.text || '').split(/\s+/).filter(Boolean);
            return `<span class="mq-lvpic-heads" style="display:inline-grid;grid-auto-flow:column;column-gap:0.55em;font-size:${m.textPt || 11}pt;font-weight:700;line-height:1.1;white-space:nowrap;padding-bottom:0.8mm;border-bottom:${(1 * PT_MM).toFixed(3)}mm solid #000">`
                + hs.map((h) => `<span style="text-align:center">${esc(h)}</span>`).join('') + '</span>';
        }
        // A small two-row column (pilot SU-C fix r2, critic r2 N6): {top, bottom, op}. Each
        // character has its own grid column, so ones sit under ones (and commas under commas)
        // whatever the font's digit widths; the operator stands left of the bottom row and a rule
        // closes the column. Never wraps (one column per character).
        case 'stack': {
            const top = String(pic.top || ''), bot = String(pic.bottom || '');
            const n = Math.max(top.length, bot.length);
            const pt = n > 5 ? Math.round(m.digitPt * 0.8) : m.digitPt;
            const cellsOf = (t, row) => t.padStart(n, ' ').split('').map((ch, i) => `<span style="grid-row:${row};grid-column:${i + 2};text-align:center">${ch === ' ' ? '' : esc(ch)}</span>`).join('');
            return `<span class="mq-lvpic-stack" style="display:inline-grid;grid-auto-columns:auto;column-gap:0.15em;row-gap:0.6mm;font-size:${pt}pt;line-height:1;white-space:nowrap;align-items:end">`
                + cellsOf(top, 1)
                + `<span style="grid-row:2;grid-column:1;padding-right:0.15em">${esc(pic.op || '−')}</span>` + cellsOf(bot, 2)
                + `<span style="grid-row:3;grid-column:1 / ${n + 2};border-top:${(1.5 * PT_MM).toFixed(3)}mm solid #000;height:0;margin-top:0.4mm"></span>`
                + '</span>';
        }
        case 'blocks': {
            // RP: a ten is a rod of ten unit squares, a one is one square (outlined, 0.75 pt).
            const u = { S: 2.8, M: 3.1, L: 3.4 }[c.size] || 3.4;     // lessons r1: 2.6 mm cubes were too small
            const parts = [];
            let x = 0.5;
            for (let i = 0; i < (pic.tens || 0); i++) {
                parts.push(`<rect x="${x}" y="0.5" width="${u}" height="${u * 10}"/>`);
                for (let j = 1; j < 10; j++) parts.push(`<line x1="${x}" y1="${0.5 + u * j}" x2="${x + u}" y2="${0.5 + u * j}" stroke-width="${(0.5 * PT_MM).toFixed(3)}"/>`);
                x += u + 2;
            }
            // (`compact`, lf-placevalue critic r3c E-A1: a picture of ones only is one cube tall, not a ten-rod's height - the
            // vocabulary cell was 43 % empty above it; opt-in, so every other picture draws as before)
            const low = !!pic.compact && !(pic.tens > 0);
            // (`ring`, lf-vocab r8 / owner O-2: 'ones' beside a ten, its ones drawn round, so four cubes alone no longer read as
            // four empty boxes - a 'place'; opt-in, every other picture draws as before)
            const ring0 = x;
            if (pic.ring) x += 1.5;
            for (let i = 0; i < (pic.ones || 0); i++) { parts.push(`<rect x="${x}" y="${low ? 0.5 : 0.5 + u * 9}" width="${u}" height="${u}"/>`); x += u + 1.5; }
            if (pic.ring && pic.ones > 0) {
                const ry = (low ? 0.5 : 0.5 + u * 9) - 1.8, rw = x - ring0 + 0.3, rh = u + 3.6;
                parts.push(`<rect x="${ring0 - 0.2}" y="${ry.toFixed(2)}" width="${rw.toFixed(2)}" height="${rh.toFixed(2)}" rx="${(rh / 2).toFixed(2)}" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/>`);
                x += 1.2;
            }
            const W = x + 0.5, H = low ? u + 1 : u * 10 + 1;
            return `<svg viewBox="0 0 ${W} ${H}" width="${mm(W)}" height="${mm(H)}" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="${(0.75 * PT_MM).toFixed(3)}">${parts.join('')}</g></svg>`;
        }
        case 'trade': {
            // 1 ten -> 10 ones: a rod, an arrow, two rows of five squares.
            const u = { S: 2.8, M: 3.1, L: 3.4 }[c.size] || 3.4;
            const parts = [`<rect x="0.5" y="0.5" width="${u}" height="${u * 10}"/>`];
            for (let j = 1; j < 10; j++) parts.push(`<line x1="0.5" y1="${0.5 + u * j}" x2="${0.5 + u}" y2="${0.5 + u * j}" stroke-width="${(0.5 * PT_MM).toFixed(3)}"/>`);
            const ax = u + 2.5, ay = u * 5;
            parts.push(`<line x1="${ax}" y1="${ay}" x2="${ax + 6}" y2="${ay}" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/>`);
            parts.push(`<path d="M${ax + 5.2} ${ay - 1.3} L${ax + 7.6} ${ay} L${ax + 5.2} ${ay + 1.3} Z" fill="#000" stroke="none"/>`);
            const ox = ax + 9.5;
            for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) parts.push(`<rect x="${ox + i * (u + 1)}" y="${ay - u - 0.5 + r * (u + 1)}" width="${u}" height="${u}"/>`);
            const W = ox + 5 * (u + 1) + 0.5, H = u * 10 + 1;
            return `<svg viewBox="0 0 ${W} ${H}" width="${mm(W)}" height="${mm(H)}" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="${(0.75 * PT_MM).toFixed(3)}">${parts.join('')}</g></svg>`;
        }
        case 'line': {
            // A short number line, the two ends labelled and the marked point labelled above it.
            const L = { S: 38, M: 42, L: 46 }[c.size] || 46;
            const pad = 5;
            const labPt = Math.max(12, m.zonePt);
            const top = labPt * PT_MM + 2;
            const axisY = top + 3.5;
            const H = axisY + 4 + labPt * PT_MM + 1.5;
            const W = L + pad * 2;
            const X = (v) => pad + (L * (v - pic.lo)) / (pic.hi - pic.lo);
            let b = `<line x1="${pad}" y1="${axisY}" x2="${pad + L}" y2="${axisY}" stroke="#000" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/>`;
            for (let i = 0; i <= 10; i++) {
                const x = pad + (L * i) / 10;
                const half = i === 5;
                b += `<line x1="${x.toFixed(2)}" y1="${axisY - (half ? 3.4 : 2)}" x2="${x.toFixed(2)}" y2="${axisY + (half ? 3.4 : 2)}" stroke="#000" stroke-width="${((half ? 1.5 : 0.75) * PT_MM).toFixed(3)}"/>`;
            }
            const f = (labPt * PT_MM).toFixed(3);
            b += `<text x="${pad}" y="${(H - 1.5).toFixed(2)}" text-anchor="middle" font-size="${f}" font-weight="700">${pic.lo}</text>`;
            b += `<text x="${pad + L}" y="${(H - 1.5).toFixed(2)}" text-anchor="middle" font-size="${f}" font-weight="700">${pic.hi}</text>`;
            b += `<text x="${X(pic.mark).toFixed(2)}" y="${(top - 1).toFixed(2)}" text-anchor="middle" font-size="${f}" font-weight="700">${pic.mark}</text>`;
            b += `<circle cx="${X(pic.mark).toFixed(2)}" cy="${axisY}" r="1.2" fill="#000"/>`;
            return `<svg viewBox="0 0 ${W} ${H.toFixed(2)}" width="${mm(W)}" height="${mm(H)}" aria-hidden="true" style="font-family:'Andika',sans-serif">${b}</svg>`;
        }
        // (lf-vocab r8, owner O-2 / O-3) a picture of the picture vocabulary library, so a lesson band and the vocabulary tasks
        // draw a word the same way: {id: 'digit' | 'step' | ...}
        case 'vocab': {
            if (!hasVocabPicture(pic.id)) return `<span class="mq-lvpic-text">${esc(pic.id || '')}</span>`;
            const wMm = { S: 30, M: 33, L: 36 }[c.size] || 36;
            return vocabPictureSVG(Object.assign({}, c, { keyPage: false }), pic.id, { wMm });
        }
        // (lf-vocab r8, owner O-2) 'place': a hundreds-tens-ones chart, ONE column heading shaded in the single grey, an empty
        // row under it: {heads: 'H T O', shade: 1}
        case 'placechart': {
            const hs = String(pic.heads || 'H T O').split(/\s+/).filter(Boolean);
            const sh = Number.isInteger(pic.shade) ? pic.shade : 1;
            const cw = { S: 8.5, M: 9.2, L: 10 }[c.size] || 10, hh = cw * 0.72, bh = cw * 0.9;
            const W = hs.length * cw + 1, H = hh + bh + 1;
            const f = ((m.textPt || 11) * PT_MM).toFixed(3), sw = (0.75 * PT_MM).toFixed(3);
            let b = '';
            hs.forEach((h, i) => {
                const x = 0.5 + i * cw;
                b += `<rect x="${x.toFixed(2)}" y="0.5" width="${cw.toFixed(2)}" height="${hh.toFixed(2)}" fill="${i === sh ? '#949494' : 'none'}" stroke="#000" stroke-width="${sw}"/>`;
                b += `<rect x="${x.toFixed(2)}" y="${(0.5 + hh).toFixed(2)}" width="${cw.toFixed(2)}" height="${bh.toFixed(2)}" fill="none" stroke="#000" stroke-width="${sw}"/>`;
                b += `<text x="${(x + cw / 2).toFixed(2)}" y="${(0.5 + hh / 2).toFixed(2)}" text-anchor="middle" dominant-baseline="central" font-size="${f}" font-weight="700">${esc(h)}</text>`;
            });
            b += `<rect x="0.5" y="0.5" width="${(W - 1).toFixed(2)}" height="${(H - 1).toFixed(2)}" fill="none" stroke="#000" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/>`;
            return `<svg viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" width="${mm(W)}" height="${mm(H)}" aria-hidden="true" style="font-family:'Andika',sans-serif">${b}</svg>`;
        }
        // a small dot array (detailed lesson 3a): {rows, cols, mark: 'row' | 'turn'}
        case 'array': {
            // (dots at the arrays template's floor: at least 4 mm across - RP-21)
            const pitch = { S: 5.4, M: 5.6, L: 5.8 }[c.size] || 5.8, r = 2.05;
            const R = Math.min(5, pic.rows || 1), C = Math.min(5, pic.cols || 1);
            const one = (rows, cols, x0) => { let b = ''; for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) b += `<circle cx="${(x0 + pitch / 2 + j * pitch).toFixed(2)}" cy="${(pitch / 2 + i * pitch).toFixed(2)}" r="${r.toFixed(2)}" fill="#000"/>`; return b; };
            let b = one(R, C, 0), W = C * pitch, H = R * pitch;
            if (pic.mark === 'row') b += `<rect x="0.3" y="0.3" width="${(W - 0.6).toFixed(2)}" height="${(pitch - 0.6).toFixed(2)}" rx="${(pitch / 2).toFixed(2)}" fill="none" stroke="#000" stroke-width="${(0.75 * PT_MM).toFixed(3)}"/>`;
            if (pic.mark === 'turn') {
                const ax = W + 2, aw = 7, ay = H / 2;
                b += `<path d="M${ax} ${ay} H${ax + aw - 1.6}" stroke="#000" stroke-width="${(1.5 * PT_MM).toFixed(3)}"/><path d="M${ax + aw - 2} ${ay - 1.3} L${ax + aw} ${ay} L${ax + aw - 2} ${ay + 1.3} Z" fill="#000"/>`;
                b += one(C, R, ax + aw + 2);
                W = ax + aw + 2 + R * pitch; H = Math.max(H, C * pitch);
            }
            return `<svg viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" width="${mm(W)}" height="${mm(H)}" data-per-row="${Math.max(C, pic.mark === 'turn' ? R : 0)}" aria-hidden="true">${b}</svg>`;
        }
        default: return `<span class="mq-lvpic-text">${esc((pic && pic.text) || '')}</span>`;
    }
}

/**
 * V-AMBIG (owner O-2 / O-3, lf-vocab r8): the OTHER words a lesson-band picture could be read as. A record may declare its
 * own (`picture.alsoShows`); otherwise the picture's kind declares it from what it draws. A band whose other words include
 * one fails ws-vocab-unit V-AMBIG ("H T O" with 'ones' beside it; four cubes alone beside 'place').
 */
export function lessonPictureAlsoShows(pic, word) {
    const own = String(word || '').toLowerCase();
    const out = (xs) => [...new Set(xs)].filter((x) => x !== own);
    if (!pic) return [];
    if (Array.isArray(pic.alsoShows)) return out(pic.alsoShows);
    const t = String(pic.text || '');
    switch (pic.kind) {
        case 'vocab': return out(vocabPictureAlsoShows(pic.id) || []);
        case 'placechart': return out(['tens', 'column', 'chart', 'place value']);
        case 'heads': return out(['place', 'hundreds', 'tens', 'ones', 'column', 'place value']);
        case 'blocks': {
            if (pic.ring) return out(['tens', 'number', 'blocks']);
            if ((pic.tens || 0) > 0 && !(pic.ones > 0)) return out(['ten', 'tens', 'rods']);
            if (!((pic.tens || 0) > 0)) return out(['one', 'ones', 'cubes', 'boxes', 'place']);
            return out(['tens', 'ones', 'number', 'blocks']);
        }
        case 'trade': return out(['exchange', 'change']);
        case 'bar': return out(pic.mark === 'whole' ? ['total', 'all'] : pic.mark === 'parts' ? ['parts', 'piece'] : ['bar model', 'story']);
        case 'fact': return out(['answer', 'times table', 'multiply']);
        case 'line': return out(['number line', 'between', 'middle']);
        // (the marks pick the word: the drawn-round row, the turn arrow; the bar's marked whole or parts - the same bar, three marks)
        case 'array': return out(pic.mark === 'row' ? ['line', 'dots'] : pic.mark === 'turn' ? ['commutative', 'turn round'] : ['rows', 'equal groups', 'dots']);
        case 'stack': return out(['column', 'add', 'subtract']);
        case 'glyph': return out(/^\d+$/.test(t) ? ['number'] : ['sign']);
        default: {
            if (/^H\s+T\s+O$/.test(t.trim())) return out(['place', 'hundreds', 'tens', 'ones', 'column', 'place value']);
            if (/^[\d\s]+$/.test(t)) return out(['number', 'digit', 'standard form']);
            if (/[+]/.test(t)) return out(['add', 'plus', 'number sentence']);
            if (/[×÷=]/.test(t)) return out(['number sentence', 'equation']);
            if (/→/.test(t)) return out(['change', 'becomes']);
            if (/,/.test(t)) return out(['count on', 'sequence', 'pattern']);
            if (/●/.test(t)) return out(['pairs', 'dots']);
            return out([]);
        }
    }
}

/** The order the words print in: a rotation, so no word sits under its own picture. */
export const vocabOrder = (n, seed) => {
    const r = n <= 1 ? 0 : 1 + (Math.abs(Number(seed) || 0) % (n - 1));
    return Array.from({ length: n }, (_, i) => (i + r) % n);
};

/** The vocabulary match: pictures on top, the words below in another order; the key draws the lines. */
export function vocabItem(vocab, seed) {
    const list = (vocab || []).slice(0, 3);
    if (!list.length) return null;
    const order = vocabOrder(list.length, seed);          // word position j holds list[order[j]]
    const render = (c) => {
        const answered = c.state && c.state !== 'blank';
        const pics = list.map((v) => `<div class="mq-lvpic"><div class="mq-lvpic-in">${vocabPicture(v.picture, c)}</div><i class="mq-ldot"></i></div>`).join('');
        const words = order.map((i) => `<div class="mq-lvword"><i class="mq-ldot"></i><b>${esc(list[i].word)}</b></div>`).join('');
        const n = list.length;
        // The key: a line from each picture's dot to its word's dot (AK-2: the answer drawn where
        // the pupil draws it).
        const lines = answered ? list.map((_, i) => {
            const j = order.indexOf(i);
            return `<line x1="${((i + 0.5) * 100) / n}" y1="0" x2="${((j + 0.5) * 100) / n}" y2="100" stroke="#000" stroke-width="1pt" vector-effect="non-scaling-stroke" data-ws-ink="solid"/>`;
        }).join('') : '';
        // (`item.zoom`, critic r2 N1: roles/lesson.js draws the match smaller so one Independent row fits; absent = 1)
        return `<div class="mq-lvocab" style="--n:${n}${item.zoom ? `;zoom:${item.zoom}` : ''}"><div class="mq-lvrow">${pics}</div>`
            + `<div class="mq-lvgap" data-ws-slot="match" data-ws-shape="draw">${lines ? `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>` : ''}</div>`
            + `<div class="mq-lvrow">${words}</div></div>`;
    };
    const item = {
        q: null, render,
        key: { value: '', display: '', slots: {} },
        drawsAnswer: true, visual: false,
        cellCls: 'mq-lvocabcell',
        footprint: { wMm: 180, hMm: null, measure: true, maxCols: 1 },
        fclass: 'wide', measureLevel: 1, template: 'lesson-vocab', skill: '', pool: 'extra', lessonVocab: true,
    };
    return item;
}

/**
 * The lesson sheet's opening bands (roles/lesson.js planOnce): the Vocabulary match and the
 * Remember strip, in order. `vocab`: the measured vocabulary item (extras), `m`: the band metrics.
 */
export function vocabBands({ vocab, data, m }) {
    const groups = [];
    if (vocab) {
        const vh = Math.max(20, hOf(vocab, 1));
        const vgrid = gridPart([planItem(vocab, { cols: 1, nolabel: true })], { cols: 1, rows: 1, cellH: vh, labels: 'none' });
        // (It takes a share of a page's spare height only when no Independent row fits, below.)
        groups.push(band(m.strip + vh, { kind: 'band', label: 'Vocabulary:', instr: instructionText('match'), content: vgrid }, { h: vh, grid: [vgrid], cap: 0, capIfEmpty: 0.3 }));
    }
    const concept = data && data.concepts && data.concepts[0] ? data.concepts[0].text : '';
    if (concept) groups.push(band(m.strip, { kind: 'band', label: 'Remember:', instr: concept, html: '' }));
    return groups;
}

export default { vocabPicture, vocabOrder, vocabItem, vocabBands, lessonPictureAlsoShows };
