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

/** One group's shelves for `cells` per pool: {h, rows, open} (open: a shelf or row not full). */
function groupSize(g, cells) {
    if (g.R === 2) {
        // tall boxes: their 2-row shelves; small blocks fill those, the rest one-row shelves
        const tall = g.pools.filter((id) => g.shape[id].r === 2).reduce((a, id) => a + (cells[id] || 0), 0);
        const sh2 = Math.ceil(tall / g.T);
        let room = sh2 * g.T - tall;
        let rows1 = 0;
        let open = false;
        let blocks = 0;
        for (const id of g.pools.filter((x) => g.shape[x].r === 1)) {
            const m = g.shape[id].m;
            const c = cells[id] || 0;
            const inBlk = Math.min(room, Math.floor(c / m));
            room -= inBlk;
            blocks += inBlk;
            const left = c - inBlk * m;
            const row = (g.sB * g.T) / g.shape[id].s;
            rows1 += Math.ceil(left / row);
            if (left % row) open = true;
        }
        const hasSmall = g.pools.some((x) => g.shape[x].r === 1);
        if (room > 0 && hasSmall) open = true;
        if (room > 0 && !hasSmall) open = true;
        // the shelves with a block of small boxes are two rows of U; the rest as tall as their boxes
        const mixedSh = Math.min(sh2, Math.ceil(blocks / Math.max(1, g.T - 1)));
        const tallH = Math.min(2 * g.U, g.hTall || 2 * g.U);
        return { h: mixedSh * 2 * g.U + (sh2 - mixedSh) * tallH + rows1 * g.U, rows: sh2 * 2 + rows1, open };
    }
    const slots = g.pools.reduce((a, id) => a + Math.ceil((cells[id] || 0) / g.shape[id].m), 0);
    const sh = Math.ceil(slots / g.T);
    const ragged = g.pools.some((id) => (cells[id] || 0) % g.shape[id].m);
    return { h: sh * g.R * g.U, rows: sh * g.R, open: !!(slots % g.T) || ragged };
}

/** Rows and height (mm) of a page holding `cells` per pool. */
function pageSize(groups, cells) {
    let h = 0;
    let rows = 0;
    for (const g of groups) { const x = groupSize(g, cells); h += x.h; rows += x.rows; }
    return { h, rows };
}

/** The step a pool's count moves in: a block (or a one-row shelf's worth in a 1-slot 2-row group). */
function stepOf(g, id) {
    const sh = g.shape[id];
    if (g.R === 2 && sh.r === 1) return Math.min(sh.m, (g.sB * g.T) / sh.s);
    return sh.m;
}

/**
 * FILL ONE PAGE by the weights (IMPROVEMENT_PLAN 3.3 capacity sum, two of each): each pool first
 * gets at least 2 problems; further steps (a box, or a block of small boxes) go to the pool furthest
 * below its weighted share of the problems while the page has room (height and the size's rows);
 * then every open shelf or row is completed from its own group (no extra height), so no shelf is
 * left short. -> {counts: {id: problems}, fits, size}
 */
export function fillPage(groups, weights, budget, maxRows) {
    const ids = groups.flatMap((g) => g.pools);
    const gOf = (id) => groupOfPool(groups, id);
    const cells = Object.fromEntries(ids.map((id) => [id, 0]));
    const ok = () => { const p = pageSize(groups, cells); return p.h <= budget + 1e-6 && p.rows <= maxRows; };
    for (const id of ids) { const st = stepOf(gOf(id), id); cells[id] = Math.ceil(2 / st) * st; }
    const fits = ok();
    const W = ids.reduce((a, id) => a + (weights[id] || 1), 0);
    const gap = (id) => (weights[id] || 1) / W - cells[id] / Math.max(1, ids.reduce((a, x) => a + cells[x], 0));
    for (let guard = 0; fits && guard < 600; guard++) {
        let added = false;
        for (const id of ids.slice().sort((a, b) => gap(b) - gap(a))) {
            const st = stepOf(gOf(id), id);
            cells[id] += st;
            if (ok()) { added = true; break; }
            cells[id] -= st;
        }
        if (!added) break;
    }
    // complete every open shelf or row from its own group, one cell at a time (no extra height)
    for (const g of groups) {
        const h0 = groupSize(g, cells).h;
        for (let guard = 0; guard < 80 && groupSize(g, cells).open; guard++) {
            let done = false;
            for (const id of g.pools.slice().sort((a, b) => gap(b) - gap(a))) {
                cells[id]++;
                if (groupSize(g, cells).h <= h0 + 1e-6) { done = true; break; }
                cells[id]--;
            }
            if (!done) break;
        }
    }
    return { counts: Object.assign({}, cells), fits, size: pageSize(groups, cells) };
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
        // A two-row group: its 2-row shelves are as many as its tall boxes need; small boxes fill
        // the rest of those shelves in blocks, and the small boxes left over make one-row shelves
        // (PT-MIX-5 "a leftover single row takes height-1 templates"), never a 2-row shelf of
        // facts alone.
        const tallN = g.R === 2 ? g.pools.filter((id) => g.shape[id].r === 2).reduce((a, id) => a + (byPool[id] || []).length, 0) : 0;
        let blk2 = g.R === 2 ? Math.max(0, Math.ceil(tallN / g.T) * g.T - tallN) : Infinity;
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
        for (const x of t.items) ents.push({ key: x.key, block: t.block || `t${ti}`, turn: ti });
    });
    const mix = interleave(ents, weights, seed, { labels });
    const turnOrder = [];
    for (const e of mix.order) if (!turnOrder.length || turnOrder[turnOrder.length - 1] !== e.turn) turnOrder.push(e.turn);
    const seen = new Set();
    const ordered = turnOrder.filter((t) => (seen.has(t) ? false : (seen.add(t), true))).map((t) => full[t]);
    // Shelves, group by group, in the order their first turn comes.
    const shelves = [];
    const open = {};
    for (const t of ordered) {
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

/* ================================================================ the sheet */

/**
 * Split each pool's items over P pages: at least 2 on any page a pool is on, whole blocks first,
 * each part to the least loaded page (load = the boxes' area). -> [{pool: [item]}] (P pages)
 */
export function splitPages(groups, byPool, P) {
    const pages = Array.from({ length: P }, () => ({}));
    const load = new Array(P).fill(0);
    const ids = groups.flatMap((g) => g.pools);
    const area = (id) => { const g = groupOfPool(groups, id); const sh = g.shape[id]; return sh.s * sh.r * g.U; };
    // the biggest boxes first, so they spread before the small ones fill round them
    const order = ids.slice().sort((a, b) => area(b) * (byPool[b] || []).length - area(a) * (byPool[a] || []).length);
    for (const id of order) {
        const its = byPool[id] || [];
        const n = its.length;
        if (!n) continue;
        const g = groupOfPool(groups, id);
        const m = g.shape[id].m;
        const on = Math.max(1, Math.min(P, Math.floor(n / 2)));
        // parts as equal as the blocks allow; the remainder (short of a block) on the last part
        const unit = m > 1 && n >= on * m ? m : 1;
        const units = Math.floor(n / unit);
        const parts = Array.from({ length: on }, (_, i) => (Math.floor(units / on) + (i < units % on ? 1 : 0)) * unit);
        parts[parts.length - 1] += n - units * unit;
        // pages for the parts: the least loaded first
        const pick = Array.from({ length: P }, (_, i) => i).sort((a, b) => load[a] - load[b] || a - b).slice(0, on).sort((a, b) => a - b);
        let at = 0;
        // the bigger parts to the emptier pages
        const bySize = parts.map((c, i) => ({ c, i })).sort((a, b) => b.c - a.c);
        const pagesBy = pick.slice().sort((a, b) => load[a] - load[b] || a - b);
        const assign = new Map();
        bySize.forEach((p, j) => assign.set(pagesBy[j], p.c));
        for (const pg of pick) {
            const c = assign.get(pg) || 0;
            pages[pg][id] = its.slice(at, at + c);
            at += c;
            load[pg] += c * area(id) / Math.max(1, m);
        }
    }
    return pages;
}

export default { H13_FILL, classify, fillPage, packPage, splitPages };
