// js/modules/sheet/cells/panes/k2.js
// The PK-2 PICTURE panes (design/SUPPORTS.md §S4.2): outline objects, ten frame, dice / dot
// tiles, fingers and the rekenrek. Each shows the GIVEN quantities of the problem — never the
// total — in the concrete-then-pictorial order of CRA (IES/WWC 2021 rec. 2, EEF EY/KS1 rec. 3).
//
// Pictures are H1 hints (PEDAGOGY_STANDARD 4.2): they fade by being REMOVED, not by going grey,
// so these panes always draw in black. Two sets in one picture are solid against hollow (LS-5);
// a take-away is a bold X (the K-2 kit's mark). Everything a pupil counts by touching is 6 mm or
// more across (RP-5).
//
// Pure module (SCC-01).

import { SHAPES as K2_SHAPES } from '../k2kit.js';
import { SW, INK, n2, st, counter, cross, by, opOf, num, row, col } from './kit.js';
import { tablerHand } from './hand-art.js';

/* ------------------------------------------------------------------ outline objects */

// The four PT-DLG-15 pictures the K-2 kit did not have yet (car, flower, turtle, block), drawn
// like its star / apple / fish / ball: a 24-unit grid, 1.5 pt outline, 0.75 pt interior detail,
// white fill, no faces, no scenery (RP-7, RP-20). Our own drawings.
function art(cx, cy, d, fn) {
    const s = d / 24;
    const o = `fill="#fff" stroke="${INK}" stroke-width="${n2(SW.heavy / s)}" stroke-linejoin="round" stroke-linecap="round"`;
    const i = `fill="none" stroke="${INK}" stroke-width="${n2(SW.hair / s)}" stroke-linecap="round" stroke-linejoin="round"`;
    return `<g transform="translate(${n2(cx - d / 2)} ${n2(cy - d / 2)}) scale(${n2(s)})">${fn(o, i)}</g>`;
}
export const NEW_OBJECTS = Object.freeze({
    car: {
        one: 'car', plural: 'cars',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<path d="M1.5 16.5L1.5 12.6C1.5 11.3 2.4 10.4 3.7 10.4L6.6 10.4L9 6C9.5 5.1 10.4 4.6 11.4 4.6L15.8 4.6C16.9 4.6 17.8 5.2 18.3 6.1L20.4 10.4C21.7 10.4 22.5 11.3 22.5 12.6L22.5 16.5Z" ${o}/>`
            + `<path d="M8.7 10.4L10.6 6.8L16.9 6.8L18.4 10.4Z M13.6 6.8L13.6 10.4" ${i}/><circle cx="6.8" cy="17.2" r="2.9" ${o}/><circle cx="17.2" cy="17.2" r="2.9" ${o}/>`),
    },
    flower: {
        one: 'flower', plural: 'flowers',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => {
            let petals = '';
            for (let k = 0; k < 5; k++) {
                const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
                petals += `<circle cx="${n2(12 + 4.3 * Math.cos(a))}" cy="${n2(8.6 + 4.3 * Math.sin(a))}" r="3.2" ${o}/>`;
            }
            return `<path d="M12 12L12 23" ${o}/><path d="M12 19.2C14 16.6 17 16.4 18.6 17C17.6 19.4 14.6 20.4 12 19.2Z" ${i}/>${petals}<circle cx="12" cy="8.6" r="2.5" ${o}/>`;
        }),
    },
    turtle: {
        one: 'turtle', plural: 'turtles',
        draw: (cx, cy, d) => art(cx, cy, d, (o, i) => `<circle cx="21" cy="13.4" r="2.3" ${o}/><path d="M5.2 16.4L4.4 19.6L7.4 19.6L8 16.4Z M15.8 16.4L16.4 19.6L19.4 19.6L18.6 16.4Z" ${o}/>`
            + `<path d="M2 16.6L0.8 17.8" ${o}/><path d="M2 16.6C2 9.4 6.6 5.4 11.2 5.4C15.8 5.4 20.4 9.4 20.4 16.6Z" ${o}/>`
            + `<path d="M7.6 16.6L8.8 11.6L13.6 11.6L14.8 16.6 M8.8 11.6L7 8 M13.6 11.6L15.4 8" ${i}/>`),
    },
    block: {
        one: 'block', plural: 'blocks',
        draw: (cx, cy, d) => art(cx, cy, d, (o) => `<path d="M2.5 8.5L8 3L21.5 3L16 8.5Z" ${o}/><path d="M16 8.5L21.5 3L21.5 16.5L16 22Z" ${o}/><path d="M2.5 8.5L16 8.5L16 22L2.5 22Z" ${o}/>`),
    },
});
/** Every outline object a pane can draw: the K-2 kit's eight plus the new four. */
export const OBJECTS = Object.freeze({ ...K2_SHAPES, ...NEW_OBJECTS });
export const OBJECT_IDS = Object.freeze(Object.keys(OBJECTS));

/** n objects in rows of five (RP-21: item + 3 mm pitch), the last `x` crossed out. */
function objectGroup(c, kind, n, x = 0) {
    const d = by(c, { S: 10, M: 11, L: 12 });
    const pitch = d + 3;
    const draw = (OBJECTS[kind] || OBJECTS.circle).draw;
    const rows = Math.max(1, Math.ceil(n / 5));
    const across = Math.min(5, Math.max(1, n));
    let body = '';
    for (let i = 0; i < n; i++) {
        const cx = d / 2 + (i % 5) * pitch, cy = d / 2 + Math.floor(i / 5) * pitch;
        body += `<g data-ws-count="1">${draw(cx, cy, d)}</g>`;
        if (i >= n - x) body += cross(c, cx, cy, d * 0.95);
    }
    return { w: (across - 1) * pitch + d, h: (rows - 1) * pitch + d, body };
}

/** a groups of b, each in its own rounded ring (RP-82: same arrangement in every group). */
function objectEqualGroups(c, kind, groups, size) {
    const d = by(c, { S: 9, M: 10, L: 10 });
    const pitch = d + 2.5;
    const per = size <= 3 ? size : Math.ceil(size / 2);
    const lines = Math.ceil(size / per);
    const gw = (per - 1) * pitch + d + 5, gh = (lines - 1) * pitch + d + 5;
    const draw = (OBJECTS[kind] || OBJECTS.circle).draw;
    const one = () => {
        let body = `<rect x="0" y="0" width="${n2(gw)}" height="${n2(gh)}" rx="${n2(Math.min(6, gh / 2))}" fill="none" ${st(c, SW.hair)}/>`;
        for (let i = 0; i < size; i++) body += `<g data-ws-count="1">${draw(2.5 + d / 2 + (i % per) * pitch, 2.5 + d / 2 + Math.floor(i / per) * pitch, d)}</g>`;
        return { w: gw, h: gh, body };
    };
    const all = Array.from({ length: groups }, one);
    const perLine = groups <= 3 ? groups : Math.ceil(groups / 2);
    const lines2 = [];
    for (let k = 0; k < all.length; k += perLine) lines2.push(row(all.slice(k, k + perLine), 5));
    return col(lines2, 5);
}

/* ------------------------------------------------------------------ ten frame (RP-10, RP-11) */

/**
 * One or two 2 x 5 frames: `solidN` solid counters then `hollowN` hollow ones continuing through
 * the cells (7 + 5 shows the make-ten), the last `x` of the solid ones crossed out (7 − 3).
 */
function tenFrames(c, solidN, hollowN = 0, x = 0) {
    const cell = by(c, { S: 10, M: 10, L: 11 });
    const total = solidN + hollowN;
    const frames = Math.max(1, Math.ceil(total / 10));
    const fw = 5 * cell, fh = 2 * cell, gap = 4;
    let body = '';
    for (let f = 0; f < frames; f++) {
        const oy = f * (fh + gap);
        for (let k = 1; k < 5; k++) body += `<line x1="${n2(k * cell)}" y1="${n2(oy)}" x2="${n2(k * cell)}" y2="${n2(oy + fh)}" ${st(c, SW.hair)}/>`;
        body += `<line x1="0" y1="${n2(oy + cell)}" x2="${n2(fw)}" y2="${n2(oy + cell)}" ${st(c, SW.hair)}/>`;
        body += `<rect x="0" y="${n2(oy)}" width="${n2(fw)}" height="${n2(fh)}" fill="none" ${st(c, SW.heavy)}/>`;
    }
    const d = cell * 0.65;   // RP-11
    for (let i = 0; i < total; i++) {
        const f = Math.floor(i / 10), j = i % 10;
        const cx = (j % 5) * cell + cell / 2, cy = f * (fh + gap) + Math.floor(j / 5) * cell + cell / 2;
        body += counter(c, cx, cy, d, i >= solidN);
        if (i < solidN && i >= solidN - x) body += cross(c, cx, cy, d * 1.15);
    }
    return { w: fw, h: frames * fh + (frames - 1) * gap, body };
}

/* ------------------------------------------------------------------ dice / dot tile */

const DICE = {
    1: [[0.5, 0.5]], 2: [[0.27, 0.27], [0.73, 0.73]], 3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
    6: [[0.28, 0.2], [0.72, 0.2], [0.28, 0.5], [0.72, 0.5], [0.28, 0.8], [0.72, 0.8]],
};
/** A dot tile: dice patterns 1-6 in a square, 7-10 as two rows of five (ten-frame order). */
function dotTile(c, n, x = 0) {
    const d = 6;   // RP-5: counted by touching
    let w, h, pts;
    if (n <= 6) {
        w = h = by(c, { S: 27, M: 28, L: 29 });
        pts = (DICE[n] || []).map(([px, py]) => [px * w, py * h]);
    } else {
        const pitch = 8;
        w = 5 * pitch + 4; h = 2 * pitch + 6;
        pts = Array.from({ length: n }, (_, i) => [2 + pitch / 2 + (i % 5) * pitch, 3 + pitch / 2 + Math.floor(i / 5) * pitch]);
    }
    let body = `<rect x="0" y="0" width="${n2(w)}" height="${n2(h)}" rx="3" fill="#fff" ${st(c, SW.heavy)}/>`;
    pts.forEach(([cx, cy], i) => {
        body += counter(c, cx, cy, d);
        if (i >= n - x) body += cross(c, cx, cy, d * 1.25);
    });
    return { w, h, body };
}

/* ------------------------------------------------------------------ fingers */

// The hands are Tabler Icons' outline hands (MIT), rebuilt per finger in hand-art.js: raised
// fingers are capsules, folded ones knuckle bumps, the thumb goes out only at 5, and a cuff marks
// the wrist. Index first (owner ruling 2026-09-25). Each finger is 6 mm wide (RP-5).
/** n fingers (1-10): one hand, or a full hand plus the rest (5 + n, the "five and" structure). */
function fingers(c, n) {
    if (n <= 5) return tablerHand(c, n, false);
    return hands(c, 5, n - 5);
}
/** A pair: the left hand is mirrored so both thumbs point to the middle, like two raised hands. */
const hands = (c, a, b) => row([tablerHand(c, a, true), tablerHand(c, b, false)], 5, { align: 'bottom' });

/* ------------------------------------------------------------------ rekenrek */

// The rekenrek (arithmetic rack): two rows of ten beads, each row five solid then five hollow
// (the two colours of the classroom rack as solid against hollow, LS-5). A row showing v has its
// first v beads pushed to the LEFT and the rest to the right, with a clear gap between (NCETM
// Mastering Number). Beads 6.5 mm across (RP-5; solid fill within INK-5's 7 mm).
//
// TAKE-AWAY (−): the beads taken away are SLID RIGHT, apart from the ones kept, the way a pupil
// moves them on a real rack, and each carries ONE clean diagonal stroke (a black line on a white
// halo, so it reads on a solid bead too). They are taken from the end of the number, bottom row
// first. The beads keep their solid / hollow colour, so the 5 + 5 grouping stays visible.
function rekenrek(c, rows, x = 0) {
    const d = 6.5, pitch = 6.8, gapMid = 10, pad = 2.5, gapTaken = 3;
    const W = 2 * pad + 10 * pitch + gapMid, rowH = 10;
    const H = rows.length * rowH + 4;
    let body = `<rect x="0" y="0" width="${n2(W)}" height="${n2(H)}" rx="3" fill="#fff" ${st(c, SW.heavy)}/>`;
    // How many beads each row gives up: the last x of the number, bottom row first.
    const taken = rows.map(() => 0);
    for (let r = rows.length - 1, left = x; r >= 0 && left > 0; r--) { taken[r] = Math.min(rows[r], left); left -= taken[r]; }
    const slash = (cx, cy) => {
        const r = d * 0.4;   // just past the bead's rim, never into the next bead
        const dd = `M${n2(cx - r)} ${n2(cy + r)}L${n2(cx + r)} ${n2(cy - r)}`;
        return `<path d="${dd}" fill="none" stroke="#fff" stroke-width="${n2(SW.rule)}" stroke-linecap="round"/>`
            + `<path data-ws-taken="1" d="${dd}" fill="none" ${st(c, SW.heavy)} stroke-linecap="round"/>`;
    };
    rows.forEach((v, r) => {
        const cy = 2 + rowH / 2 + r * rowH;
        const kept = v - taken[r];
        // The taken beads sit just left of the beads never used (a small gap between the two).
        const anchor = W - pad - (10 - v) * pitch - (v < 10 ? gapTaken : 0);
        // Taken beads spread a little, so each stroke stands clear of the next (inside the rack).
        const tp = pitch + Math.min(1.4, (gapMid - gapTaken - 2.5) / Math.max(1, taken[r] - 1));
        body += `<line x1="0" y1="${n2(cy)}" x2="${n2(W)}" y2="${n2(cy)}" ${st(c, SW.hair)}/>`;
        for (let k = 0; k < 10; k++) {
            const left = k < v;
            let cx;
            if (k < kept) cx = pad + pitch / 2 + k * pitch;
            else if (k < v) cx = anchor - pitch / 2 - (v - 1 - k) * tp;
            else cx = W - pad - pitch / 2 - (9 - k) * pitch;
            body += `<g data-ws-bead="${left ? 'in' : 'out'}">${counter(c, cx, cy, d, k >= 5)}</g>`;
            if (k >= kept && k < v) body += slash(cx, cy);
        }
    });
    return { w: W, h: H, body };
}

/* ------------------------------------------------------------------ the pane geometries */

const pic = (c) => Object.assign({}, c, { grey: false });   // pictures fade by removal, never grey
const small = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;

export const K2_PANES = {
    objects: {
        label: 'Outline objects', grades: ['PK', 'K', '1', '2'], ops: ['count', '+', '-', '*'],
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return small(num(p.n), 20);
            if (op === '+') return small(a, 10) && small(b, 10);
            if (op === '-') return small(a, 20) && small(b, a);
            if (op === '*') return small(a, 5) && small(b, 6) && a >= 1 && b >= 1;
            return false;
        },
        geom(p, c) {
            c = pic(c);
            const kind = OBJECTS[p.object] ? p.object : 'ball';
            const op = opOf(p), a = num(p.a), b = num(p.b);
            const name = OBJECTS[kind].plural;
            if (!op) return { ...objectGroup(c, kind, num(p.n)), label: `${p.n} ${name}` };
            if (op === '-') return { ...objectGroup(c, kind, a, b), label: `${a} ${name}, ${b} crossed out` };
            if (op === '*') return { ...objectEqualGroups(c, kind, a, b), label: `${a} groups of ${b} ${name}` };
            // Side by side while both groups are small; otherwise one group over the other, so
            // the picture stays about 70 mm wide and readable in a half-width cell and on a phone.
            const g = [objectGroup(c, kind, a), objectGroup(c, kind, b)];
            return { ...(a <= 3 && b <= 3 ? row(g, 10, { align: 'top' }) : col(g, 6)), label: `${a} ${name} and ${b} ${name}` };
        },
    },
    tenframe: {
        label: 'Ten frame', grades: ['K', '1', '2'], ops: ['count', '+', '-'],
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return small(num(p.n), 20);
            if (op === '+') return small(a, 20) && small(b, 20) && a + b <= 20;
            if (op === '-') return small(a, 20) && small(b, a);
            return false;
        },
        geom(p, c) {
            c = pic(c);
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return { ...tenFrames(c, num(p.n)), label: `ten frame showing ${p.n}` };
            if (op === '-') return { ...tenFrames(c, a, 0, b), label: `ten frame: ${a}, ${b} crossed out` };
            return { ...tenFrames(c, a, b), label: `ten frame: ${a} solid, ${b} hollow` };
        },
    },
    dice: {
        label: 'Dice / dot tiles', grades: ['PK', 'K', '1'], ops: ['count', '+', '-'],
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return small(num(p.n), 10) && num(p.n) >= 1;
            if (op === '+') return small(a, 10) && small(b, 10) && a >= 1 && b >= 1;
            if (op === '-') return small(a, 10) && small(b, a) && a >= 1;
            return false;
        },
        geom(p, c) {
            c = pic(c);
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return { ...dotTile(c, num(p.n)), label: `dot tile of ${p.n}` };
            if (op === '-') return { ...dotTile(c, a, b), label: `dot tile of ${a}, ${b} crossed out` };
            return { ...row([dotTile(c, a), dotTile(c, b)], 6, { align: 'middle' }), label: `dot tiles of ${a} and ${b}` };
        },
    },
    fingers: {
        label: 'Fingers', grades: ['PK', 'K', '1'], ops: ['count', '+', '-'],
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return small(num(p.n), 10) && num(p.n) >= 1;
            if (op === '+') return small(a, 5) && small(b, 5) && a >= 1 && b >= 1;
            if (op === '-') return small(a, 10) && small(b, a) && a >= 1;
            return false;
        },
        geom(p, c) {
            c = pic(c);
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return { ...fingers(c, num(p.n)), label: `${p.n} fingers` };
            // −: the hands show the start number; the pupil folds down the number taken away.
            if (op === '-') return { ...fingers(c, a), label: `${a} fingers` };
            // +: one hand for each addend (both 5 or less), side by side.
            return { ...hands(c, a, b), label: `${a} fingers and ${b} fingers` };
        },
    },
    rekenrek: {
        label: 'Rekenrek (bead rack)', grades: ['K', '1', '2'], ops: ['count', '+', '-'],
        accepts(p) {
            const op = opOf(p), a = num(p.a), b = num(p.b);
            if (!op) return small(num(p.n), 20);
            if (op === '+') return small(a, 10) && small(b, 10);
            if (op === '-') return small(a, 20) && small(b, a);
            return false;
        },
        geom(p, c) {
            c = pic(c);
            const op = opOf(p), a = num(p.a), b = num(p.b);
            const split = (n) => [Math.min(10, n), Math.max(0, n - 10)];
            if (!op) return { ...rekenrek(c, split(num(p.n))), label: `rekenrek showing ${p.n}` };
            if (op === '-') return { ...rekenrek(c, split(a), b), label: `rekenrek showing ${a}, ${b} slid away` };
            return { ...rekenrek(c, [a, b]), label: `rekenrek: ${a} on the top row, ${b} on the bottom row` };
        },
    },
};

