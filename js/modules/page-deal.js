// page-deal.js — deal a choice down a page AT RANDOM, balanced, and never in a cycle (L10).
//
// design/audit/LESSONS_LEARNED.md L10: four critic rounds found generators dealing the question
// kind, the answer position, the key or the sign from the item's POSITION — `itemIndex % n`, a
// permutation shuffled once and repeated, a least-recently-used rotation — so a page read
// A B A B, every sign was ">", and a pupil could answer by pattern. This is the one dealer that
// replaces them.
//
// HOW IT DEALS. The n choices are put into a BLOCK of at least six slots (each choice as often as
// its weight asks, every weighted choice at least once), the block is shuffled with Math.random,
// and item k of the page takes slot k of its block. When the page runs past the block, a fresh
// block is shuffled for the next six. So:
//   * the order is random (a seeded page reproduces; a new seed deals a new order),
//   * repeats are allowed, but a six-item page still shows every choice of two or three (3 + 3,
//     2 + 2 + 2), which is what the positional deals were trying to guarantee,
//   * two blocks never join into a run longer than three of one choice.
//
// WHICH ITEM. On a page (generateQuestionFor) the item is `state.itemIndex`, the kept-item index,
// so a duplicate the host discards and regenerates is dealt the same slot. generateQuestionFor
// calls resetPageDeals() at item 0, so a page never depends on what was dealt before it. In live
// play (no itemIndex) each key keeps its own counter.
//
// ONE KEY PER INDEPENDENT ATTRIBUTE. Two attributes dealt under one key move in lockstep (k2-r1:
// `ask` and direction from one deal, so "Goes down by 1" answered 30 items of 30). Give every
// independent attribute its own key.
import { state } from './state.js';

const _decks = new Map();     // key -> { sig, blocks: Map(block number -> shuffled deck) }
const _cursors = new Map();   // key -> live-play counter
const MIN_BLOCK = 6;
const MAX_RUN = 3;

const _consts = new Map();    // key -> a number drawn once per page
const _hist = new Map();      // key -> Map(page position -> {sig, tags}) (freshDeal)

/** A new page: forget every deck, so the page is a function of its own seeds. */
export function resetPageDeals() { _decks.clear(); _consts.clear(); _hist.clear(); }

/**
 * A whole number in [0, n) drawn ONCE per page from the seeded rng (at its first use after the
 * page opens). For a walk that must keep its own order down the page (neighbours never share a
 * name) but start somewhere new on every seed.
 */
export function pageConstant(key, n) {
    if (!_consts.has(key)) _consts.set(key, Math.floor(Math.random() * Math.max(1, n)));
    return _consts.get(key);
}

function counts(n, weights) {
    const w = Array.from({ length: n }, (_, i) => {
        const x = Array.isArray(weights) ? Number(weights[i]) : 1;
        return Number.isFinite(x) && x > 0 ? x : (Array.isArray(weights) ? 0 : 1);
    });
    const live = w.filter((x) => x > 0).length || n;
    const size = Math.max(MIN_BLOCK, live);
    const tot = w.reduce((a, b) => a + b, 0) || n;
    const raw = w.map((x) => (x * size) / tot);
    const c = raw.map((x, i) => (w[i] > 0 ? Math.max(1, Math.floor(x)) : 0));
    // Largest remainder fills the block to `size`.
    let left = size - c.reduce((a, b) => a + b, 0);
    const order = raw.map((x, i) => [x - Math.floor(x), i]).filter(([, i]) => w[i] > 0).sort((a, b) => b[0] - a[0]);
    for (let k = 0; left > 0 && order.length; k = (k + 1) % order.length, left--) c[order[k][1]]++;
    return c;
}

function shuffled(c) {
    const deck = [];
    c.forEach((m, i) => { for (let k = 0; k < m; k++) deck.push(i); });
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

const runAt = (prev, next) => {
    if (!prev || !prev.length || !next.length) return 0;
    const v = next[0];
    let r = 0;
    for (let i = prev.length - 1; i >= 0 && prev[i] === v; i--) r++;
    for (let i = 0; i < next.length && next[i] === v; i++) r++;
    return r;
};

/**
 * The index (0 .. n-1) dealt at page position `at` under `key`. Positions are addressable: asking
 * for an earlier position again returns what it was dealt (a generator may count what came
 * before), and a position in a block not yet reached shuffles that block then.
 */
export function dealAt(key, n, at, weights = null) {
    n = Math.floor(Number(n));
    if (!(n > 1)) return 0;
    at = Math.max(0, Math.floor(Number(at) || 0));
    const c = counts(n, weights);
    const sig = c.join(',');
    const len = c.reduce((a, b) => a + b, 0);
    const block = Math.floor(at / len);
    let d = _decks.get(key);
    if (!d || d.sig !== sig) { d = { sig, blocks: new Map() }; _decks.set(key, d); }
    let deck = d.blocks.get(block);
    if (!deck) {
        const prev = d.blocks.get(block - 1) || null;
        deck = shuffled(c);
        for (let tries = 0; tries < 6 && runAt(prev, deck) > MAX_RUN; tries++) deck = shuffled(c);
        d.blocks.set(block, deck);
        // live play never resets: keep the few blocks round the cursor only
        if (d.blocks.size > 8) for (const k of [...d.blocks.keys()]) if (k < block - 4) d.blocks.delete(k);
    }
    return deck[at % len];
}

// A REDRAW (generate-question.js, the P12 accept layer): the item k of a page is dealt the same
// slot on every draw, so a redraw for an option the deal cannot see (a "x + a = b" page of a skill
// whose kinds are dealt here) would come back the same kind every time. While a redraw runs, a deal
// is a plain draw from the seeded rng instead: nothing cached, so the page still reproduces.
let _redraw = false;
export function setRedraw(on) { _redraw = !!on; }
function redrawIndex(n, weights) {
    n = Math.floor(Number(n));
    const w = Array.from({ length: n }, (_, i) => {
        const x = Array.isArray(weights) ? Number(weights[i]) : 1;
        return Number.isFinite(x) && x > 0 ? x : (Array.isArray(weights) ? 0 : 1);
    });
    const tot = w.reduce((a, b) => a + b, 0);
    if (!(tot > 0)) return Math.floor(Math.random() * n);
    let r = Math.random() * tot;
    for (let i = 0; i < n; i++) { r -= w[i]; if (r < 0) return i; }
    return n - 1;
}

/**
 * The index (0 .. n-1) dealt to the current item under `key`: its kept-item index on a page, a
 * running count per key in live play.
 * @param {string} key          one key per independent attribute (see above)
 * @param {number} n            how many choices
 * @param {number[]} [weights]  relative weights; a zero weight is never dealt
 */
export function dealIndex(key, n, weights = null) {
    if (!(Math.floor(Number(n)) > 1)) return 0;
    if (_redraw) return redrawIndex(n, weights);
    let at;
    if (Number.isFinite(state.itemIndex)) at = state.itemIndex;
    else { at = _cursors.get(key) || 0; _cursors.set(key, at + 1); }
    return dealAt(key, n, at, weights);
}

/**
 * A random order of 0..n-1 for block `block` of a page, drawn once (at its first use after the
 * page opens) from the seeded rng. For "k of the n places in each block" deals: take the first k.
 */
export function blockPermutation(key, n, block = 0) {
    n = Math.max(0, Math.floor(Number(n) || 0));
    const k = `perm:${key}:${n}:${block}`;
    if (!_consts.has(k)) {
        const p = Array.from({ length: n }, (_, i) => i);
        for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
        _consts.set(k, p);
    }
    return _consts.get(k);
}

/** One element of `list`, dealt under `key` (see dealIndex). */
export function dealPick(key, list, weights = null) {
    if (!Array.isArray(list) || !list.length) return undefined;
    return list[dealIndex(key, list.length, weights)];
}

/**
 * A value drawn from the seeded rng (`draw()`, the generator's own deal: its distribution is kept)
 * that is FRESH on the page (visual-quality lane 2026-10-31, ws-dealer-uniform PAGE; L10): no value
 * with the same `sig` among the last `window` items dealt under `key`, and no tag (`tags(v)`: e.g.
 * the first number, the answer) printed more than its cap there. A small valid set (a story within
 * 10 has 28 number pairs) dealt by plain draws repeats a pair on almost every page of 20; this keeps
 * the draws random (never a position cycle) and only refuses a draw the page already holds. The caps
 * are relaxed by one every 20 refused draws (no draw meets them: the first fresh draw is kept; none
 * fresh: the last draw), so a domain too small for the caps still deals. A redraw (setRedraw) is a plain draw.
 * @param {string} key  one key per independent deal
 * @param {() => any} draw  one seeded draw
 * @param {{sig: (v) => string, tags?: (v) => string[], caps?: number[], window?: number, tries?: number}} o
 */
const _freshCursors = new Map();
export function freshDeal(key, draw, o = {}) {
    if (_redraw) return draw();
    const sigOf = o.sig || ((v) => JSON.stringify(v));
    const tagsOf = o.tags || (() => []);
    const caps = Array.isArray(o.caps) ? o.caps : [];
    const win = Math.max(1, Math.floor(Number(o.window) || 19));
    const tries = Math.max(1, Math.floor(Number(o.tries) || 60));
    let at;
    if (Number.isFinite(state.itemIndex)) at = state.itemIndex;
    else { at = _freshCursors.get(key) || 0; _freshCursors.set(key, at + 1); }
    let h = _hist.get(key);
    if (!h) { h = new Map(); _hist.set(key, h); }
    const recent = [];
    for (let p = Math.max(0, at - win); p < at; p++) if (h.has(p)) recent.push(h.get(p));
    let got = null, fresh = null, ok = false;
    for (let t = 0; t < tries; t++) {
        const v = draw();
        got = v;
        const sig = sigOf(v);
        if (recent.some((r) => r.sig === sig)) continue;
        if (fresh === null) fresh = v;
        const relax = Math.floor(t / 20);
        const tg = tagsOf(v);
        if (tg.some((x, i) => caps[i] !== undefined && recent.filter((r) => r.tags[i] === x).length >= caps[i] + relax)) continue;
        ok = true;
        break;
    }
    // (no draw met the caps: the first draw the page does not hold yet, else the last draw)
    if (!ok && fresh !== null) got = fresh;
    h.set(at, { sig: sigOf(got), tags: tagsOf(got) });
    // live play never resets: keep the window round the cursor only
    if (h.size > 4 * win) for (const p of [...h.keys()]) if (p < at - win) h.delete(p);
    return got;
}
