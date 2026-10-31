// js/modules/sheet/mixed-pack.js
// THE MIXED PACKER (design/IMPROVEMENT_PLAN.md 3.3 "Size classes" / "Packing"; PAGE_TYPES.md
// PT-MIX-1, -5, -7, -9; phase M2). Pure: it never measures, it is handed each skill's size class.
//
//   classes   per pool {k, s, h, full}: k cells across the lattice N, s = N / k units wide, h the
//             tallest cell (mm) at k; `full` a word problem / wide cell (a row of its own)
//   groups    pools whose boxes can share a shelf (classify): a shelf is the full width N, R rows
//             (1 or 2) of the unit height U. A pool's box is s_p units by r_p rows; r_p = 2 when its
//             cells are about twice as tall as the shortest pool's. H13: every cell keeps its drawing
//             at least 70 % of its box (H13_FILL), else it goes to a group of its own
//   turns     a shelf is T = N / sB slots; one slot (one TURN, IMPROVEMENT_PLAN 3.3) is one box of
//             the group's block shape sB x R, or one block of smaller boxes (m_p of them). A pool
//             alone in its group with other groups on the page takes the whole shelf as its block
//             (a shelf of facts beside a row of word problems is one turn)
//   order     sheet/interleave.js over the turns (blocks carry a `block` id, so a run is counted in
//             turns; a block of several skills belongs to none); numbering by shelf, then block,
//             then inside the block (PT-MIX-7)
//   pages     exact counts: each skill's problems split over the pages, at least 2 on any page it is
//             on (two of each), the pages as evenly loaded as the boxes allow (PT-MIX-9); a page is
//             added, never a problem dropped (Q-M2). Fill: the page filled by the weights
//             (fillPage, the capacity sum), shelves completed
//   tail      problems that do not make a whole block (exact counts) flow at the end of the sheet in
//             one-row shelves, and a short last shelf ends in ONE unruled trailing area (PG-15)
//
// Pure module (SCC-01): no window, no DOM, no Math.random, no app import.

import { interleave } from './interleave.js';

/** H13: a cell's drawing fills at least this share of its box's height. */
export const H13_FILL = 0.7;
/** What a cell's measured minimum height (hMinAt) holds beyond its drawing's natural height. */
export const NAT_MM = 3;
/** A pool whose cells are at least this many times the shortest pool's takes two rows. */
const TWO_ROW_AT = 1.45;

/* ================================================================ groups */

/** Can these pools share shelves? -> {ok, R, U, sB, shape: {id: {s, r}}} */
function groupOf(ids, cls) {
    const hs = ids.map((id) => cls[id].h);
    const hmin = Math.min(...hs);
    const r = Object.fromEntries(ids.map((id) => [id, ids.length > 1 && cls[id].h >= TWO_ROW_AT * hmin ? 2 : 1]));
    const R = Math.max(...ids.map((id) => r[id]));
    const tall = ids.filter((id) => r[id] === R);
    let sB;
    if (R === 2) {
        const spans = [...new Set(tall.map((id) => cls[id].s))];
        if (spans.length > 1) return { ok: false };
        sB = spans[0];
    } else sB = Math.max(...ids.map((id) => cls[id].s));
    for (const id of ids) {
        const s = cls[id].s;
        if (s > sB || sB % s) return { ok: false };
        if (r[id] === R && s !== sB && R === 2) return { ok: false };
    }
    const U = Math.max(...ids.map((id) => cls[id].h / r[id]));
    // (H13 on the drawing: a cell's measured minimum carries ~NAT_MM of pads and safety the drawing
    // itself does not fill - critic-style measure in the DOM, mixed-m2.check)
    for (const id of ids) if (cls[id].h - NAT_MM < H13_FILL * r[id] * U - 1e-6) return { ok: false };
    const shape = Object.fromEntries(ids.map((id) => [id, { s: cls[id].s, r: r[id] }]));
    return { ok: true, R, U, sB, shape };
}

/**
 * The groups of a page's pools: word problems / full-width cells each a group of their own; the
 * rest joined in the teacher's order where the H13 and span rules let them share shelves.
 * -> [{pools, R, U, sB, T, shape: {id: {s, r, m}}}]
 */
export function classify(ids, cls, N) {
    const groups = [];
    for (const id of ids) {
        if (cls[id].full) { groups.push({ pools: [id], full: true }); continue; }
        const g = groups.find((x) => !x.full && groupOf([...x.pools, id], cls).ok);
        if (g) g.pools.push(id); else groups.push({ pools: [id] });
    }
    const many = groups.length > 1;
    return groups.map((g) => {
        if (g.full) {
            const id = g.pools[0];
            return { pools: [id], R: 1, U: cls[id].h, sB: N, T: 1, full: true, shape: { [id]: { s: N, r: 1, m: 1 } } };
        }
        const x = groupOf(g.pools, cls);
        // A pool alone in its group on a page of several groups: the whole shelf is its block.
        const sB = many && g.pools.length === 1 ? N : x.sB;
        const shape = {};
        for (const id of g.pools) {
            const { s, r } = x.shape[id];
            shape[id] = { s, r, m: (sB / s) * (x.R / r) };
        }
        // (a 2-row shelf of tall boxes only is as tall as they are, not two rows of the small ones)
        const hTall = x.R === 2 ? Math.max(...g.pools.filter((id) => x.shape[id].r === 2).map((id) => cls[id].h)) : 0;
        return { pools: g.pools.slice(), R: x.R, U: x.U, sB, T: N / sB, shape, hTall };
    });
}

const groupOfPool = (groups, id) => groups.find((g) => g.pools.includes(id));

/* ================================================================ capacity */

/**
 * One group's shelves for `cells` per pool: {h, rows}. A two-row group puts EVERY whole block of
 * its small boxes into its 2-row shelves, beside the tall boxes (PT-MIX-5: a shelf of [tall box |
 * block of small facts] before a shelf of tall boxes alone - critic M2 r1 D3, the "stripes"); the
 * small boxes short of a block take one-row shelves at the end.
 */
function groupSize(g, cells) {
    if (g.R === 2) {
        const tall = g.pools.filter((id) => g.shape[id].r === 2).reduce((a, id) => a + (cells[id] || 0), 0);
        let blocks = 0;
        let rows1 = 0;
        for (const id of g.pools.filter((x) => g.shape[x].r === 1)) {
            const m = g.shape[id].m;
            const c = cells[id] || 0;
            blocks += Math.floor(c / m);
            const left = c - Math.floor(c / m) * m;
            const row = (g.sB * g.T) / g.shape[id].s;
            rows1 += Math.ceil(left / row);
        }
        const sh2 = Math.ceil((tall + blocks) / g.T);
        // a shelf with a block of small boxes is two rows of U; a shelf of tall boxes alone is as
        // tall as they are
        const mixedSh = Math.min(sh2, blocks);
        const tallH = Math.min(2 * g.U, g.hTall || 2 * g.U);
        return { h: mixedSh * 2 * g.U + (sh2 - mixedSh) * tallH + rows1 * g.U, rows: sh2 * 2 + rows1 };
    }
    const slots = g.pools.reduce((a, id) => a + Math.ceil((cells[id] || 0) / g.shape[id].m), 0);
    const sh = Math.ceil(slots / g.T);
    return { h: sh * g.R * g.U, rows: sh * g.R };
}

/** Rows and height (mm) of a page holding `cells` per pool. */
export function pageSize(groups, cells) {
    let h = 0;
    let rows = 0;
    for (const g of groups) { const x = groupSize(g, cells); h += x.h; rows += x.rows; }
    return { h, rows };
}

/**
 * Do these counts keep the teacher's distribution (IMPROVEMENT_PLAN 3.3, critic M2 r1 D1)? Every
 * pool within 1 of its weighted share of the total; a pool held at 2 by "two of each" is the one
 * exception. The weights are never clipped to fill a page or to meet the size ladder.
 */
export function withinShare(cells, weights, ids = Object.keys(cells)) {
    const W = ids.reduce((a, id) => a + (weights[id] || 1), 0);
    const T = ids.reduce((a, id) => a + (cells[id] || 0), 0);
    // the pools "two of each" holds above their share step aside; the others share what is left
    const held = ids.filter((id) => (cells[id] || 0) <= 2 && ((weights[id] || 1) / W) * T < 2);
    const rest = ids.filter((id) => !held.includes(id));
    const W2 = rest.reduce((a, id) => a + (weights[id] || 1), 0);
    const T2 = rest.reduce((a, id) => a + (cells[id] || 0), 0);
    return rest.every((id) => Math.abs((cells[id] || 0) - ((weights[id] || 1) / W2) * T2) <= 1 + 1e-9);
}

/**
 * FILL ONE PAGE by the weights (IMPROVEMENT_PLAN 3.3 capacity sum, two of each): each pool first
 * gets 2 problems; then one problem at a time goes to the pool furthest below its weighted share,
 * or to the next one, as long as the page has room (height and the size's rows) AND every pool
 * stays within 1 of its share (withinShare). The weights are held first; the page holds what it
 * holds with them held. -> {counts: {id: problems}, fits, size}
 */
export function fillPage(groups, weights, budget, maxRows, { fillRest = true } = {}) {
    const ids = groups.flatMap((g) => g.pools);
    const cells = Object.fromEntries(ids.map((id) => [id, 2]));
    const ok = () => { const p = pageSize(groups, cells); return p.h <= budget + 1e-6 && p.rows <= maxRows; };
    const fits = ok();
    const W = ids.reduce((a, id) => a + (weights[id] || 1), 0);
    const gap = (id) => (weights[id] || 1) / W - cells[id] / Math.max(1, ids.reduce((a, x) => a + cells[x], 0));
    for (let guard = 0; fits && guard < 2000; guard++) {
        let added = false;
        for (const id of ids.slice().sort((a, b) => gap(b) - gap(a) || ids.indexOf(a) - ids.indexOf(b))) {
            cells[id] += 1;
            if (ok() && withinShare(cells, weights, ids)) { added = true; break; }
            cells[id] -= 1;
        }
        if (!added) break;
    }
    // Among the counts of the same total (and one more) that keep the weights, the page whose small
    // boxes make whole blocks beside the tall ones (PT-MIX-5: 7 models + a block of 8 facts beats 8
    // models + 7 facts in a row of their own under shelves of models alone - critic M2 r1 D3).
    if (fits && ids.length <= 4) {
        const T0 = ids.reduce((a, id) => a + cells[id], 0);
        let best = { T: T0, score: looseOf(groups, cells), cells: Object.assign({}, cells) };
        for (const T of [T0 + 1, T0]) {
            for (const v of vectorsOf(ids, weights, T)) {
                if (!withinShare(v, weights, ids)) continue;
                const p = pageSize(groups, v);
                if (p.h > budget + 1e-6 || p.rows > maxRows) continue;
                const sc = looseOf(groups, v);
                if (T > best.T || (T === best.T && sc < best.score)) best = { T, score: sc, cells: v };
            }
        }
        Object.assign(cells, best.cells);
    }
    // FILL THE REST (IMPROVEMENT_PLAN 3.3: the weights are met as closely as the page allows, never
    // by leaving it under-filled - coordinator r2): when no further problem fits at the weights, the
    // room left takes whichever skill's cells still fit, the one furthest below its share first.
    // The caller says so in the notes ("Addition fills the rest of the page: ...").
    let rest = false;
    for (let guard = 0; fits && fillRest && guard < 2000; guard++) {
        let added = false;
        for (const id of ids.slice().sort((a, b) => gap(b) - gap(a) || ids.indexOf(a) - ids.indexOf(b))) {
            cells[id] += 1;
            if (ok()) { added = true; rest = true; break; }
            cells[id] -= 1;
        }
        if (!added) break;
    }
    return { counts: Object.assign({}, cells), fits, size: pageSize(groups, cells), rest: rest && !withinShare(cells, weights, ids) };
}

/** Count vectors summing to T with every pool within 1 of its share (at least 2 each). */
function vectorsOf(ids, weights, T) {
    const W = ids.reduce((a, id) => a + (weights[id] || 1), 0);
    const opts = ids.map((id) => { const sh = ((weights[id] || 1) / W) * T; const lo = Math.max(2, Math.ceil(sh - 1 - 1e-9)); const hi = Math.max(2, Math.floor(sh + 1 + 1e-9)); return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i); });
    const out = [];
    const walk = (i, acc, sum) => {
        if (i === ids.length) { if (sum === T) out.push(Object.assign({}, acc)); return; }
        for (const c of opts[i]) { acc[ids[i]] = c; walk(i + 1, acc, sum + c); }
    };
    walk(0, {}, 0);
    return out;
}

/** The small boxes left out of whole blocks (they print in a row of their own at the end). */
function looseOf(groups, cells) {
    let loose = 0;
    for (const g of groups) for (const id of g.pools) { const m = g.shape[id].m; if (m > 1) loose += (cells[id] || 0) % m; }
    return loose;
}

/* ================================================================ one page */

/**
 * The turns of one page's items: {pool: [item]} -> {full: [turn], tail: [item]}; a turn is
 * {key, block, items, g}. Pools of one block shape in a group are interleaved together before they
 * are cut into blocks (small boxes of different skills share a block wherever both are left).
 */
function turnsOfPage(groups, byPool, seed) {
    const full = [];
    const tail = [];
    let blockNo = 0;
    groups.forEach((g, gi) => {
        const shapes = new Map();
        for (const id of g.pools) {
            const sh = g.shape[id];
            const k = `${sh.s}x${sh.r}`;
            if (!shapes.has(k)) shapes.set(k, []);
            shapes.get(k).push(id);
        }
        // A two-row group: every whole block of small boxes goes into the 2-row shelves beside the
        // tall boxes (PT-MIX-5; critic M2 r1 D3: a shelf of tall boxes alone above rows of facts
        // printed "stripes" - runs of 4); the small boxes short of a block make one-row shelves at
        // the end (PT-MIX-5 "a leftover single row takes height-1 templates").
        let blk2 = Infinity;
        for (const ids of shapes.values()) {
            const sh0 = g.shape[ids[0]];
            const m = sh0.m;
            let list;
            if (ids.length > 1) {
                const ents = ids.flatMap((id) => (byPool[id] || []).map((it) => ({ key: id, it })));
                list = interleave(ents, null, (seed + gi * 7919) >>> 0, { firstThird: false }).order.map((e) => ({ key: e.key, it: e.it }));
            } else list = (byPool[ids[0]] || []).map((it) => ({ key: ids[0], it }));
            const push = (chunk, kind, mm) => {
                const keys = [...new Set(chunk.map((x) => x.key))];
                full.push({ key: keys.length === 1 ? keys[0] : null, block: mm > 1 ? `b${blockNo++}` : null, items: chunk, g: gi, kind });
            };
            let at = 0;
            if (g.R === 2 && sh0.r === 1) {
                // blocks into the 2-row shelves first, then whole one-row shelves
                while (blk2 > 0 && list.length - at >= m) { push(list.slice(at, at + m), 'blk', m); at += m; blk2--; }
                const row = g.sB * g.T / sh0.s;
                while (list.length - at >= row) { push(list.slice(at, at + row), 'row', row); at += row; }
            } else {
                while (list.length - at >= m) { push(list.slice(at, at + m), 'blk', m); at += m; }
            }
            for (const x of list.slice(at)) tail.push({ key: x.key, it: x.it, g: gi });
        }
    });
    return { full, tail };
}

/**
 * PACK ONE PAGE: its items by pool -> {shelves: [{g, R, H, cells: [{it, pool, col, row, span, rows, k}],
 * trail: {col, rows} | null}], order (pool ids, print order), interleave record}.
 * `col` / `row` are 1-based grid lines on the page lattice N.
 */
export function packPage(groups, byPool0, N, seed, { weights = null, labels = null, hOf = null } = {}) {
    // `hOf(item, k)` (mm): each cell's own height. A pool's cells are packed tallest first, so a
    // shelf's cells are of like height and each shelf is only as tall as what it holds (H13).
    const byPool = {};
    for (const [id, its] of Object.entries(byPool0)) {
        const g = groupOfPool(groups, id);
        const k = g ? N / g.shape[id].s : 1;
        byPool[id] = hOf ? its.map((it, i) => ({ it, i, h: hOf(it, k) })).sort((a, b) => b.h - a.h || a.i - b.i).map((x) => x.it) : its;
    }
    const { full, tail } = turnsOfPage(groups, byPool, seed);
    // The order over the turns: every entry of a turn carries the turn's block id.
    // (a block of several skills belongs to none of them: interleave's turnsOf makes it a separator)
    const ents = [];
    full.forEach((t, ti) => {
        for (const x of t.items) ents.push(t.items.length > 1 ? { key: x.key, block: t.block || `t${ti}`, turn: ti } : { key: x.key, turn: ti });
    });
    const mix = interleave(ents, weights, seed, { labels });
    const turnOrder = [];
    for (const e of mix.order) if (!turnOrder.length || turnOrder[turnOrder.length - 1] !== e.turn) turnOrder.push(e.turn);
    const seen = new Set();
    const ordered = turnOrder.filter((t) => (seen.has(t) ? false : (seen.add(t), true))).map((t) => full[t]);
    // Shelves, group by group, in the order their first turn comes.
    const shelves = [];
    const open = {};
    // (a one-row shelf met while its group's 2-row shelf is still open waits until that shelf is
    // full, so the print order stays the order of the turns)
    const waiting = [];
    const seq = [];
    for (const t of ordered) {
        const o = open[t.g];
        if (t.kind === 'row' && o && o.slots < groups[t.g].T) { waiting.push(t); continue; }
        seq.push(t);
        if (t.kind === 'row') continue;
        const now = (o && o.slots < groups[t.g].T ? o.slots : 0) + 1;
        open[t.g] = { slots: now };
        if (now >= groups[t.g].T) seq.push(...waiting.splice(0));
    }
    seq.push(...waiting);
    for (const k of Object.keys(open)) delete open[k];
    for (const t of seq) {
        const g = groups[t.g];
        if (t.kind === 'row') {
            // a one-row shelf of small boxes in a two-row group: one turn, the full width
            const sh1 = { g: t.g, R: 1, slots: 1, cells: [], row: true };
            shelves.push(sh1);
            t.items.forEach((x, i) => { const shp = g.shape[x.key]; sh1.cells.push({ it: x.it, pool: x.key, col: i * shp.s + 1, row: 1, span: shp.s, rows: 1, k: N / shp.s }); });
            continue;
        }
        let sh = open[t.g];
        if (!sh || sh.slots >= g.T) { sh = { g: t.g, R: g.R, slots: 0, cells: [] }; open[t.g] = sh; shelves.push(sh); }
        const col0 = sh.slots * g.sB;
        const cellsOf = (x, i) => {
            const shp = g.shape[x.key || x.it.pool] || g.shape[x.it.pool];
            const cpr = g.sB / shp.s;
            const r = Math.floor(i / cpr);
            const c = i % cpr;
            return { it: x.it, pool: x.it.pool, col: col0 + c * shp.s + 1, row: r * shp.r + 1, span: shp.s, rows: shp.r, k: N / shp.s };
        };
        t.items.forEach((x, i) => sh.cells.push(cellsOf(x, i)));
        sh.slots++;
    }
    // H13 in a shared 2-row shelf: a tall box beside a block of small ones is two block rows tall,
    // so a short one (a numerator item among fraction models) would float in it. Such a box swaps
    // places with a taller box of the same span in another shelf, where both still fill theirs.
    if (hOf) {
        const twoRow = shelves.filter((sh) => sh.R === 2 && !sh.row);
        const hC = (c) => hOf(c.it, c.k);
        const shelfU = (sh) => Math.min(groups[sh.g].U, Math.max(...sh.cells.map((c) => hC(c) / c.rows)));
        const valid = (sh) => { const u = shelfU(sh); return sh.cells.every((c) => hC(c) - NAT_MM >= H13_FILL * c.rows * u - 1e-6); };
        for (const a of twoRow) {
            for (let guard = 0; guard < 8 && !valid(a); guard++) {
                let done = false;
                const u = shelfU(a);
                const bad = a.cells.filter((c) => c.rows === 2 && hC(c) - NAT_MM < H13_FILL * 2 * u - 1e-6);
                for (const x of bad) {
                    for (const b of twoRow) {
                        if (b === a || done) continue;
                        for (const y of b.cells.filter((c) => c.rows === 2 && c.span === x.span && hC(c) > hC(x))) {
                            [x.it, y.it] = [y.it, x.it]; [x.pool, y.pool] = [y.pool, x.pool];
                            if (valid(a) && valid(b)) { done = true; break; }
                            [x.it, y.it] = [y.it, x.it]; [x.pool, y.pool] = [y.pool, x.pool];
                        }
                    }
                    if (done) break;
                }
                if (!done) {
                    // else the block trades places with a tall box of a shelf that stays valid: the
                    // short box then stands among tall boxes only, as tall as they are
                    const g = groups[a.g];
                    const slotOf = (c) => Math.floor((c.col - 1) / g.sB);
                    const blkSlot = [...new Set(a.cells.filter((c) => c.rows === 1).map(slotOf))][0];
                    if (blkSlot === undefined) break;
                    for (const b of twoRow) {
                        if (b === a || b.g !== a.g || done) continue;
                        for (const y of b.cells.filter((c) => c.rows === 2)) {
                            const ys = slotOf(y);
                            const blk = a.cells.filter((c) => c.rows === 1 && slotOf(c) === blkSlot);
                            const move = (c, from, to) => { c.col += (to - from) * g.sB; };
                            // swap
                            a.cells = a.cells.filter((c) => !blk.includes(c)).concat([y]);
                            b.cells = b.cells.filter((c) => c !== y).concat(blk);
                            move(y, ys, blkSlot); blk.forEach((c) => move(c, blkSlot, ys));
                            if (valid(a) && valid(b)) { done = true; break; }
                            move(y, blkSlot, ys); blk.forEach((c) => move(c, ys, blkSlot));
                            b.cells = b.cells.filter((c) => !blk.includes(c)).concat([y]);
                            a.cells = a.cells.filter((c) => c !== y).concat(blk);
                        }
                    }
                    if (!done) break;
                }
            }
            // (cells in place order: shelf, block, inside the block - PT-MIX-7)
            for (const sh of twoRow) sh.cells.sort((p1, p2) => Math.floor((p1.col - 1) / groups[sh.g].sB) - Math.floor((p2.col - 1) / groups[sh.g].sB) || p1.row - p2.row || p1.col - p2.col);
        }
    }
    // The tail: problems short of a whole block flow left to right in one-row shelves at the end
    // (after a short shelf of the same group when it is one row).
    const tailByG = new Map();
    for (const x of tail) { if (!tailByG.has(x.g)) tailByG.set(x.g, []); tailByG.get(x.g).push(x); }
    for (const [gi, xs0] of tailByG) {
        const g = groups[gi];
        // alternate the pools of the tail (no run of one skill when two are left)
        const xs = [];
        const q = new Map();
        for (const x of xs0) { if (!q.has(x.key)) q.set(x.key, []); q.get(x.key).push(x); }
        const keys = [...q.keys()];
        for (let i = 0; xs.length < xs0.length; i++) { const k = keys[i % keys.length]; if (q.get(k).length) xs.push(q.get(k).shift()); }
        let sh = open[gi] && open[gi].slots < g.T && g.R === 1 ? open[gi] : null;
        let col = sh ? sh.slots * g.sB + 1 : 1;
        if (sh) { shelves.splice(shelves.indexOf(sh), 1); shelves.push(sh); }
        for (const x of xs) {
            const shp = g.shape[x.key];
            if (!sh || col + shp.s - 1 > N) { sh = { g: gi, R: 1, slots: 0, cells: [], tail: true }; shelves.push(sh); col = 1; }
            sh.cells.push({ it: x.it, pool: x.key, col, row: 1, span: shp.s, rows: 1, k: N / shp.s });
            col += shp.s;
            sh.used = col - 1;
        }
    }
    // A shelf that does not reach the full width ends in one unruled trailing area (PG-15); short
    // shelves go last on the page.
    for (const sh of shelves) {
        const used = sh.cells.reduce((a, c) => Math.max(a, c.col + c.span - 1), 0);
        sh.trail = used < N ? { col: used + 1, rows: sh.R } : null;
        // the shelf's own height: its tallest cell (a 2-row cell over its rows), never the group's
        // class height when it holds none so tall
        const g = groups[sh.g];
        const own = hOf ? Math.max(0, ...sh.cells.map((c) => hOf(c.it, c.k) / c.rows)) : 0;
        sh.U = own > 0 ? Math.min(g.U, own) : g.U;
        sh.H = sh.R * sh.U;
    }
    // (numbering by shelf, then block, then inside the block - PT-MIX-7: the cells stay in the
    // order they were placed)
    const short = shelves.filter((s) => s.trail);
    const whole = shelves.filter((s) => !s.trail);
    const out = whole.concat(short);
    const order = out.flatMap((s) => s.cells.map((c) => c.pool));
    return { shelves: out, order, mix };
}


/* ================================================================ §1.7 re-brief: ORDER IN PROBLEMS, THEN ROWS */
// (mixed-pages M2 after critic r2: the order is decided in PROBLEMS, over the whole print, before
// any row is built; the rows then take the problems in that order and never reorder them.)
//
//   rowPlanOf   R (1-3 rows a shelf) and which pools are TALL (a box R rows high); the rest are
//               small boxes stacked R high in a column beside them (H13: every box's drawing fills
//               >= 70 % of it)
//   orderOf     the problem sequence: two skills by the GAP rule (the minority skill separates the
//               majority's groups, every group within one of the others, the longest group the
//               forced minimum ceil(major / (minor + 1)) or 2); three or more by interleave()
//   columnsOf   the sequence cut into columns: a tall problem is one column; consecutive small
//               problems stack R to a column (numbered down the column, then across: PT-MIX-7)
//   shelvesOf   columns into shelves (one grid each) by their minimum widths; every shelf is the
//               full width (its columns widen in proportion), and a short last shelf takes columns
//               from the one before it so neither is under half full
// Pure (SCC-01).

/** Rows a shelf and the tall pools: {R, tall: {id: bool}, U, worst}. */
export function rowPlanOf(ids, cls) {
    const hmin = Math.min(...ids.map((id) => cls[id].h));
    const fill = (h, rows, U) => (h - NAT_MM) / (rows * U);
    let best = null;
    for (const R of [1, 2, 3]) {
        const tall = Object.fromEntries(ids.map((id) => [id, R > 1 && !cls[id].full && cls[id].h >= TWO_ROW_AT * hmin]));
        const nTall = ids.filter((id) => tall[id]).length;
        if (R > 1 && (!nTall || nTall === ids.length)) continue;
        const U = Math.max(...ids.map((id) => cls[id].h / (tall[id] ? R : 1)));
        const worst = Math.min(...ids.map((id) => fill(cls[id].h, tall[id] ? R : 1, U)));
        const x = { R, tall, U, worst };
        if (worst >= H13_FILL - 1e-9) return x;
        if (!best || worst > best.worst + 1e-9) best = x;
    }
    return best;
}

/** n split into g groups, sizes within one, the larger ones spread evenly. */
export function splitEven(n, g) {
    const out = [];
    for (let i = 0; i < g; i++) out.push(Math.floor(((i + 1) * n) / g) - Math.floor((i * n) / g));
    return out;
}

const clampI = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/**
 * THE ORDER, in problems: {counts: {id: n}} -> [id, ...] (one entry a problem).
 * `small` (two skills, R > 1): the pool whose boxes stack R to a column - its groups are cut to
 * whole columns where the runs allow. Never a run over max(2, the forced minimum).
 */
export function orderOf(counts, ids, { tall = {}, R = 1, seed = 1 } = {}) {
    const live = ids.filter((id) => (counts[id] || 0) > 0);
    if (live.length === 1) return Array(counts[live[0]]).fill(live[0]);
    if (!live.length) return [];
    if (live.length > 2) {
        const ents = live.flatMap((id) => Array.from({ length: counts[id] }, () => ({ key: id })));
        return interleave(ents, null, seed, { firstThird: false }).order.map((e) => e.key);
    }
    const [a, b] = live;
    const [P, Q] = counts[a] <= counts[b] ? [a, b] : [b, a];
    const p = counts[P];
    const q = counts[Q];
    const capQ = Math.max(2, Math.ceil(q / (p + 1)));
    const capP = Math.max(2, Math.ceil(p / (q + 1)));
    // (two-row shelves: the small skill's problems come in whole columns of R - a pair, a pair...
    // - so no column is left with a hole; an odd one out goes last, where its hole is the shelf's
    // trailing area)
    const pairs = (id) => R > 1 && !tall[id];
    const unit = (id) => (pairs(id) ? 2 : 1);
    // segments: Q in g groups, P in s groups, |g - s| <= 1, every group within its cap
    let best = null;
    for (let g = 1; g <= q; g++) {
        for (const sP of [g - 1, g, g + 1]) {
            if (sP < 1 || sP > p) continue;
            const fits = (n, k, cap, id) => {
                if (unit(id) === 1) return Math.ceil(n / k) <= cap ? splitEven(n, k) : null;
                const half = Math.floor(n / 2);
                // (an odd count: the single joins the last pair, or stands alone as the last group)
                for (const lone of n % 2 ? [false, true] : [false]) {
                    const kp = lone ? k - 1 : k;
                    if (kp < 0 || (kp === 0 && half > 0) || half < kp) continue;
                    const xs = kp ? splitEven(half, kp).map((x) => 2 * x) : [];
                    if (n % 2) { if (lone) xs.push(1); else xs[k - 1] += 1; }
                    if (xs.length === k && xs.every((x) => x > 0 && x <= cap)) return xs;
                }
                return null;
            };
            const qs = fits(q, g, capQ, Q);
            const ps = fits(p, sP, capP, P);
            if (!qs || !ps) continue;
            // the most alternation that keeps whole columns: the smallest groups, then pairs first
            const score = Math.max(...qs) + Math.max(...ps);
            if (!best || score < best.score) best = { g, sP, qs, ps, score };
        }
    }
    if (!best) {
        const ents = live.flatMap((id) => Array.from({ length: counts[id] }, () => ({ key: id })));
        return interleave(ents, null, seed, { firstThird: false }).order.map((e) => e.key);
    }
    const { g, sP, qs, ps } = best;
    // s = g + 1: P Q P ... P;  s = g - 1: Q P ... Q;  s = g: the small skill with an odd count last
    // (its hole is then the trailing area), else by the seed
    let turnP;
    if (sP === g + 1) turnP = true;
    else if (sP === g - 1) turnP = false;
    else if (pairs(Q) && q % 2) turnP = true;
    else if (pairs(P) && p % 2) turnP = false;
    else turnP = (Number(seed) >>> 0) % 2 === 1;
    const out = [];
    const put = (id, k) => { for (let i = 0; i < k; i++) out.push(id); };
    let qi = 0;
    let pi = 0;
    while (qi < g || pi < sP) {
        if (turnP && pi < sP) put(P, ps[pi++]);
        else if (!turnP && qi < g) put(Q, qs[qi++]);
        else if (pi < sP) put(P, ps[pi++]);
        else put(Q, qs[qi++]);
        turnP = !turnP;
    }
    return out;
}

/** The longest run of each pool in an order: {id: n}. */
export function runsIn(order) {
    const best = {};
    let run = 0;
    let last = null;
    for (const id of order) { run = id === last ? run + 1 : 1; last = id; best[id] = Math.max(best[id] || 0, run); }
    return best;
}

/** The order cut into columns: [{items: [x], tall}] (x = whatever the sequence holds; `poolOf(x)`). */
export function columnsOf(seq, poolOf, tall, R) {
    const cols = [];
    // (`tall` per pool, or a function of the entry: a short cell of a tall skill stacks as a small one)
    const isTall = (x, id) => !!(typeof tall === 'function' ? tall(x) : tall[id]);
    for (const x of seq) {
        const id = poolOf(x);
        const t = isTall(x, id);
        const prev = cols[cols.length - 1];
        if (!t && R > 1 && prev && !prev.tall && prev.items.length < R) { prev.items.push(x); continue; }
        cols.push({ items: [x], tall: t, pool: id });
    }
    return cols;
}

/** Columns into shelves by minimum width (fraction of the page); a short last shelf is evened out. */
export function shelvesOf(cols, wOf, R = 1) {
    const shelves = [];
    let cur = null;
    let w = 0;
    // (a column of fewer than R small boxes ends its shelf: its hole is then the shelf's ONE
    // trailing area, to the frame - PG-15 - never a hole between two boxes)
    const short = (c) => R > 1 && !c.tall && c.items.length < R;
    for (const c of cols) {
        const cw = wOf(c);
        if (!cur || w + cw > 1 + 1e-6 || (cur.length && short(cur[cur.length - 1]))) { cur = []; shelves.push(cur); w = 0; }
        cur.push(c);
        w += cw;
    }
    const width = (sh) => sh.reduce((a, c) => a + wOf(c), 0);
    if (shelves.length > 1) {
        const last = shelves[shelves.length - 1];
        const prev = shelves[shelves.length - 2];
        while (prev.length > 1 && width(last) < 0.5 - 1e-6 && !short(prev[prev.length - 1])) {
            const c = prev[prev.length - 1];
            if (width(prev) - wOf(c) < width(last) + wOf(c) - 1e-6 || width(last) + wOf(c) > 1 + 1e-6) break;
            last.unshift(prev.pop());
        }
    }
    return shelves;
}

/* ================================================================ the sheet */
/**
 * Split each pool's items over P pages (PT-MIX-9; critic M2 r1 D5, D7). Group by group: the
 * group's shelves are shared evenly over the pages (earlier pages first), every page but the one
 * holding the group's last shelf takes WHOLE shelves (no trailing slot a page could avoid), and the
 * items are dealt into those quotas from one evenly spaced sequence of the group's pools, so every
 * page carries each skill in proportion. A skill with fewer problems than two a page is spread one
 * or two a page rather than left off a page (a lone problem beats a page of one skill when the
 * teacher asked for Mixed up); otherwise "two of each" is kept by swapping like boxes between pages.
 * -> [{pool: [item]}] (P pages)
 */
export function splitPages(groups, byPool, P, { spread = true } = {}) {
    const take = {};
    const load = new Array(P).fill(0);
    const unitOf = (g, id) => (g.R === 2 && g.shape[id].r === 2 ? 1 : 1 / g.shape[id].m);
    const shelvesOf = (g) => Math.ceil(g.pools.reduce((a, id) => a + (byPool[id] || []).length * unitOf(g, id), 0) / g.T - 1e-9);
    // (the group with the most shelf height first: the smaller ones even the pages out)
    const gs = groups.slice().sort((a, b) => shelvesOf(b) * b.R * b.U - shelvesOf(a) * a.R * a.U);
    for (const g of gs) {
        const ids = g.pools.filter((id) => (byPool[id] || []).length);
        if (!ids.length) continue;
        const unit = (id) => unitOf(g, id);
        const n = Object.fromEntries(ids.map((id) => [id, byPool[id].length]));
        const total = ids.reduce((a, id) => a + n[id], 0);
        const shelves = shelvesOf(g);
        const shH = g.R * g.U;
        let quota;
        if (shelves >= P) {
            // whole shelves on every page; the extra shelves to the least loaded pages
            const per = new Array(P).fill(Math.floor(shelves / P));
            const order = Array.from({ length: P }, (_, i) => i).sort((a, b) => load[a] - load[b] || a - b);
            for (let e = 0; e < shelves % P; e++) per[order[e]]++;
            quota = per.map((x) => x * g.T);
        } else {
            // fewer shelves than pages: the group's problems spread over the pages one by one (a lone
            // problem on a page rather than a page without the skill), least loaded pages first
            const on = spread ? Math.min(P, total) : Math.max(1, Math.min(P, Math.floor(total / 2)));
            const order = Array.from({ length: P }, (_, i) => i).sort((a, b) => load[a] - load[b] || a - b).slice(0, on).sort((a, b) => a - b);
            quota = new Array(P).fill(0);
            const avgU = ids.reduce((a, id) => a + n[id] * unit(id), 0) / total;
            order.forEach((pg, i) => { quota[pg] = (Math.floor(total / on) + (i < total % on ? 1 : 0)) * avgU; });
        }
        quota.forEach((q, i) => { load[i] += Math.ceil(q / g.T - 1e-9) * shH; });
        const pageOf = new Array(P).fill(null).map(() => Object.fromEntries(ids.map((id) => [id, 0])));
        // (`spread` off - when spreading would cost a page: a skill too small for two a page keeps two
        // of each on fewer pages, the pages with the most room, and the others share what is left)
        const minors = spread || ids.length < 2 ? [] : ids.filter((id) => n[id] >= 2 && n[id] < 2 * P);
        for (const id of minors) {
            const on = Math.max(1, Math.floor(n[id] / 2));
            const pick = Array.from({ length: P }, (_, i) => i).sort((a, b) => quota[b] - quota[a] || a - b).slice(0, on).sort((a, b) => a - b);
            pick.forEach((pg, i) => { const c = Math.floor(n[id] / on) + (i < n[id] % on ? 1 : 0); pageOf[pg][id] = c; quota[pg] = Math.max(0, quota[pg] - c * unit(id)); });
        }
        const rest = ids.filter((id) => !minors.includes(id));
        const totalR = rest.reduce((a, id) => a + n[id], 0);
        // one evenly spaced sequence of the group's items (largest lag first)
        const seq = [];
        const got = Object.fromEntries(rest.map((id) => [id, 0]));
        for (let k = 0; k < totalR; k++) {
            const id = rest.slice().sort((a, b) => (n[b] * (k + 1)) / totalR - got[b] - ((n[a] * (k + 1)) / totalR - got[a]) || rest.indexOf(a) - rest.indexOf(b))[0];
            seq.push(id);
            got[id]++;
        }
        const lastP = quota.reduce((a, q, i) => (q > 0 ? i : a), 0);
        let pg = 0;
        let used = 0;
        for (const id of seq) {
            while (pg < lastP && used + unit(id) > quota[pg] + 1e-9) { pg++; used = 0; }
            pageOf[pg][id]++;
            used += unit(id);
        }
        // two of each: a page with one problem of a skill that has 2+ a page to give takes one from
        // a page with 3+, giving back a like box of another skill
        const on = pageOf.map((c) => ids.some((id) => c[id] > 0));
        const pagesOn = on.filter(Boolean).length;
        for (let guard = 0; guard < 40; guard++) {
            let moved = false;
            for (const id of ids) {
                if (n[id] < 2 * pagesOn) continue;
                const i = pageOf.findIndex((c, x) => on[x] && c[id] === 1);
                if (i < 0) continue;
                const j = pageOf.findIndex((c) => c[id] >= 3);
                const q = j < 0 ? null : ids.find((x) => x !== id && unit(x) === unit(id) && pageOf[i][x] > 2);
                if (j < 0 || !q) continue;
                pageOf[i][id]++; pageOf[j][id]--; pageOf[i][q]--; pageOf[j][q]++;
                moved = true;
            }
            if (!moved) break;
        }
        for (const id of ids) take[id] = pageOf.map((c) => c[id]);
    }
    const ids = Object.keys(take);
    return Array.from({ length: P }, (_, pg) => {
        const out = {};
        for (const id of ids) {
            const before = take[id].slice(0, pg).reduce((x, y) => x + y, 0);
            if (take[id][pg]) out[id] = (byPool[id] || []).slice(before, before + take[id][pg]);
        }
        return out;
    });
}

export default { H13_FILL, classify, fillPage, packPage, splitPages, pageSize, withinShare, rowPlanOf, orderOf, columnsOf, shelvesOf, runsIn, splitEven };
