// ws-geom-probe — the ONE in-page definition of three printed-geometry rules, shared by ws-print-lint (its lints
// L-ANSAREA TY-21, L-OVERLAP H2 and L-WRAP WRAP-OP) and ws-slot-clip (its SLOT-W and HEADS probes), so the two tools
// never measure two different things under one name (S1 builder B, 2026-10-24).
//
//   TY-21  a box the pupil writes ONE digit in is at least 4.4 mm wide as printed: every digit-strip segment
//          (`[data-ws-seg]`: the stack's answer strip `.ab`, its carry / exchange strip `.rg`, the legacy strips) and
//          every stand-alone answer box (`[data-ws-slot]` drawn as `box` / `box-unknown`) that holds no strip.
//          (pilot-su-c critic r1 D3: answer boxes 4.06 mm at S; WORKSHEET_DESIGN_STANDARD TY-21 / VA-12.)
//   H2     neighbouring head labels of one drawing sit at least 1 mm apart: the place heads of a stack
//          (`.ws-stack .head`, the ink box of their text) and the place letters over the zones of a place-value mat
//          (`svg` text above its `[data-pv-zone]` rects). A pair that overlaps or sits closer than 1 mm reads as one
//          run ("HThTTh"). (critic r1 D7: heads collide at 5-6 digits; critic r2 N8: 0.74 mm apart at S.)
//   WRAP-OP no wrapped line of text ends in an operator glyph (− + × ÷ =) with the rest of its expression on the
//          next line (critic r2 N6 "486,759 −" / "35,247" in a vocabulary picture; N7 "4 −" / "3 = 1." in a step).
//          Read per block of text (the nearest non-inline ancestor of each text run): an operator whose next glyph
//          in the same block starts a lower line. Grid and flex children are blocks of their own, so a stack's
//          operator column (a span of its own) is never a wrap.
//
// GEOM_PROBE(cfg) runs IN the printed document (page.evaluate) and returns plain data; every item carries `page`
// (1-based, the visible `[data-ws-page]` / `.ws-page` elements in document order, key pages included, as
// ws-print-lint numbers them), `cell` (1-based top-level cell on that page, or null), `skill` (the nearest
// `data-ws-skill`, '' when none: D1 attribution) and `tpl` (the cell's `data-ws-cell`).
'use strict';

const MIN_SEG_MM = 4.4;
const HEAD_GAP_MM = 1.0;

/* eslint-disable no-undef */
function GEOM_PROBE(cfg) {
    const minSeg = cfg && cfg.minSeg != null ? cfg.minSeg : 4.4;
    const minGap = cfg && cfg.minGap != null ? cfg.minGap : 1.0;
    const mm = (px) => px * 25.4 / 96;
    const r2 = (x) => Math.round(x * 100) / 100;
    const vis = (el) => { if (typeof el.checkVisibility === 'function') return el.checkVisibility({ checkVisibilityCSS: true }); const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden'; };
    let pages = [...document.querySelectorAll('[data-ws-page]')];
    if (!pages.length) pages = [...document.querySelectorAll('.ws-page')];
    pages = pages.filter(vis);
    const PAGE_SEL = document.querySelector('[data-ws-page]') ? '[data-ws-page]' : '.ws-page';
    const CELL_SEL = '[data-ws-cell], .ws-cell:not(.blankrun)';
    const topCells = new Map(pages.map((p) => [p, [...p.querySelectorAll(CELL_SEL)].filter((c) => vis(c) && !c.parentElement.closest(CELL_SEL))]));
    const loc = (el) => {
        const p = el.closest(PAGE_SEL);
        const pi = pages.indexOf(p);
        let cell = null, tpl = '(no cell)';
        if (pi > -1) {
            const cells = topCells.get(p);
            const c = cells.find((x) => x.contains(el));
            if (c) { cell = cells.indexOf(c) + 1; tpl = c.getAttribute('data-ws-cell') || '?'; }
        }
        const sk = el.closest('[data-ws-skill]');
        return { page: pi + 1, cell, tpl, skill: sk ? sk.getAttribute('data-ws-skill') || '' : '', key: !!(p && (p.closest('[data-ws-mode="key"]') || p.matches('[data-ws-mode="key"]'))) };
    };
    const out = { segs: 0, narrow: [], heads: 0, overlaps: [], wraps: [], tpl: {} };
    const T = (t) => (out.tpl[t] = out.tpl[t] || { cells: 0, segs: 0, heads: 0 });
    for (const cs of topCells.values()) for (const c of cs) T(c.getAttribute('data-ws-cell') || '?').cells++;
    const inPages = (el) => pages.some((p) => p.contains(el));

    /* ---- TY-21: digit-strip segments and stand-alone answer boxes */
    const boxes = new Set();
    for (const el of document.querySelectorAll('[data-ws-seg]')) boxes.add(el);
    for (const el of document.querySelectorAll('[data-ws-slot][data-ws-shape="box"], [data-ws-slot][data-ws-shape="box-unknown"]')) if (!el.querySelector('[data-ws-seg]')) boxes.add(el);
    for (const el of boxes) {
        if (!inPages(el) || !vis(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        const L = loc(el);
        out.segs++;
        T(L.tpl).segs++;
        const w = mm(r.width);
        if (w < minSeg - 0.005) out.narrow.push(Object.assign(L, { w: r2(w), kind: el.hasAttribute('data-ws-seg') ? 'segment' : 'box' }));
    }

    /* ---- H2: head labels of one drawing */
    const inkBox = (el) => {
        const range = document.createRange();
        let box = null;
        for (const n of el.childNodes) {
            if (n.nodeType !== 3 || !n.textContent.trim()) continue;
            range.selectNodeContents(n);
            for (const r of range.getClientRects()) if (r.width > 0) box = box ? { l: Math.min(box.l, r.left), r: Math.max(box.r, r.right), t: Math.min(box.t, r.top), b: Math.max(box.b, r.bottom) } : { l: r.left, r: r.right, t: r.top, b: r.bottom };
        }
        return box;
    };
    const groups = [];
    for (const stk of document.querySelectorAll('.ws-stack')) {
        if (!inPages(stk) || !vis(stk)) continue;
        groups.push({ at: stk, heads: [...stk.querySelectorAll('.head')].filter(vis).map((h) => ({ box: inkBox(h), txt: h.textContent.trim() })).filter((x) => x.box) });
    }
    for (const svg of document.querySelectorAll('svg')) {
        const zones = [...svg.querySelectorAll('[data-pv-zone]')];
        if (!zones.length || !inPages(svg) || !vis(svg)) continue;
        const zTop = Math.min(...zones.map((z) => z.getBoundingClientRect().top));
        const heads = [...svg.querySelectorAll('text')].map((t) => { const r = t.getBoundingClientRect(); return { box: { l: r.left, r: r.right, t: r.top, b: r.bottom }, txt: t.textContent.trim() }; })
            .filter((x) => x.txt && x.box.r > x.box.l && x.box.b <= zTop + 0.5);
        groups.push({ at: svg, heads });
    }
    for (const g of groups) {
        const L = loc(g.at);
        out.heads += g.heads.length;
        if (g.heads.length) T(L.tpl).heads += g.heads.length;
        const hs = g.heads.slice().sort((a, b) => a.box.l - b.box.l);
        for (let i = 1; i < hs.length; i++) {
            const a = hs[i - 1], b = hs[i];
            const oy = Math.min(a.box.b, b.box.b) - Math.max(a.box.t, b.box.t);
            if (oy <= 0) continue;
            const gap = mm(b.box.l - a.box.r);
            if (gap < minGap - 0.005) out.overlaps.push(Object.assign({}, L, { a: a.txt, b: b.txt, gap: r2(gap), mm: r2(Math.max(0, -gap)) }));
        }
    }

    /* ---- WRAP-OP: a wrapped line that ends in an operator */
    if (!cfg || cfg.wraps !== false) {
        const OPS = '−+×÷=';
        // the nearest ancestor that lays out its own lines: an inline box flows in its parent's lines; an inline-block,
        // inline-flex or flex / grid item makes its own (its computed display is not `inline`)
        const blockOf = (n) => { let e = n.parentElement; while (e && ['inline', 'contents'].includes(getComputedStyle(e).display)) e = e.parentElement; return e; };
        const seen = new Set();
        for (const p of pages) {
            const tw = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
            const blocks = new Map();
            for (let n = tw.nextNode(); n; n = tw.nextNode()) {
                if (!n.nodeValue.trim() || (n.parentElement && n.parentElement.closest('svg, style, script'))) continue;
                const b = blockOf(n);
                if (!b || !vis(n.parentElement)) continue;
                if (!blocks.has(b)) blocks.set(b, []);
                blocks.get(b).push(n);
            }
            const range = document.createRange();
            for (const [b, nodes] of blocks) {
                if (!nodes.some((n) => [...OPS].some((o) => n.nodeValue.includes(o)))) continue;
                const glyphs = [];
                for (const n of nodes) {
                    const s = n.nodeValue;
                    for (let i = 0; i < s.length; i++) {
                        if (/\s/.test(s[i])) continue;
                        range.setStart(n, i); range.setEnd(n, i + 1);
                        const r = range.getBoundingClientRect();
                        if (!r.width && !r.height) continue;
                        glyphs.push({ ch: s[i], r });
                    }
                }
                for (let i = 0; i + 1 < glyphs.length; i++) {
                    const g = glyphs[i], nx = glyphs[i + 1];
                    if (!OPS.includes(g.ch)) continue;
                    // the next glyph starts a lower line: its top is below the operator's middle
                    if (nx.r.top < g.r.top + g.r.height / 2) continue;
                    if (seen.has(b)) continue;
                    seen.add(b);
                    const before = glyphs.slice(Math.max(0, i - 10), i + 1).map((x) => x.ch).join('');
                    const after = glyphs.slice(i + 1, i + 8).map((x) => x.ch).join('');
                    out.wraps.push(Object.assign(loc(b), { op: g.ch, before, after }));
                }
            }
        }
    }
    return out;
}
/* eslint-enable no-undef */

module.exports = { GEOM_PROBE, MIN_SEG_MM, HEAD_GAP_MM };
