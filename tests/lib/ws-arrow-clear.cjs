// ws-arrow-clear — the ONE in-page measure of a count row's jump-arrow clearance (small-fixes critic r11 G2, carried into the
// skip-count fix 2026-10-30): the ink of each jump arrow (`.k2-jump` path + head, or a joining `[data-mq-flatjump]`) keeps at
// least 1.0 mm (SL-3a) from the INK of the number or box on each side. A given's ink is its text's own box (a Range over the
// text, so a number that overhangs its box counts), a box's ink is its border box. Shared by ws-phone-card (screen, CSS mm)
// and ws-print-lint (paper, the kit sheet's CSS mm).
//
// ARROW_CLEAR({root, floorMm = 1.0}) runs IN the page and returns {n, min, below: [{mm, side, text}], worst}.
'use strict';
function ARROW_CLEAR(cfg) {
    const root = (cfg && cfg.root) || document;
    const floorMm = (cfg && cfg.floorMm) || 1.0;
    const PX_MM = 96 / 25.4;
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
    const inkOf = (col) => {
        if (!col) return null;
        const g = col.matches('.k2-given') ? col : col.querySelector('.k2-given');
        if (g && g.firstChild) {
            // the text runs only (a joining arrow may sit inside the given's own span)
            const rs = [];
            const tw = document.createTreeWalker(g, NodeFilter.SHOW_TEXT);
            for (let t = tw.nextNode(); t; t = tw.nextNode()) {
                if (!t.nodeValue.trim() || (t.parentElement && t.parentElement.closest('.k2-jump, [data-mq-flatjump]'))) continue;
                const rg = document.createRange(); rg.selectNodeContents(t);
                rs.push(...[...rg.getClientRects()].filter((r) => r.width > 0));
            }
            if (rs.length) return { left: Math.min(...rs.map((r) => r.left)), right: Math.max(...rs.map((r) => r.right)), text: g.textContent.trim() };
        }
        const b = col.querySelector('input, .k2-tile-slot, .k2-tile') || col;
        const r = b.getBoundingClientRect();
        return { left: r.left, right: r.right, text: b.tagName === 'INPUT' ? '[box]' : (b.textContent || '').trim() || '[box]' };
    };
    let n = 0, min = Infinity, worst = '';
    const below = [];
    for (const line of new Set(root.querySelectorAll('.k2-countrow-line > div > div'))) {
        const cols = [...line.children];
        cols.forEach((col, i) => {
            const arrow = col.querySelector(':scope > .k2-jump, :scope > [data-mq-flatjump]');
            if (!arrow || !vis(arrow) || i === 0 && !arrow.matches('[data-mq-flatjump]')) return;
            const marks = [...arrow.querySelectorAll('path, polygon')].map((p) => p.getBoundingClientRect()).filter((r) => r.width > 0 || r.height > 0);
            if (!marks.length) return;
            const aL = Math.min(...marks.map((r) => r.left)), aR = Math.max(...marks.map((r) => r.right));
            // the column it points INTO is `col` (its ink is col's own content, the arrow excluded); the one it leaves is the previous
            // column, or the previous line's last column for a joining arrow
            const prev = i > 0 ? cols[i - 1] : null;
            const pi = inkOf(prev), ni = inkOf(col);
            n++;
            for (const [side, mm, text] of [['before', pi ? (aL - pi.right) / PX_MM : Infinity, pi && pi.text], ['after', ni ? (ni.left - aR) / PX_MM : Infinity, ni && ni.text]]) {
                if (!Number.isFinite(mm)) continue;
                if (mm < min) { min = mm; worst = `${side} "${text}" ${mm.toFixed(2)} mm (column ${i + 1}${arrow.matches('[data-mq-flatjump]') ? ', the joining arrow' : ''}; arrow ${Math.round(aL)}-${Math.round(aR)}, ink ${Math.round(side === 'before' ? pi.right : ni.left)})`; }
                if (mm < floorMm - 0.005) below.push({ mm: +mm.toFixed(2), side, text });
            }
        });
    }
    return { n, min: Number.isFinite(min) ? +min.toFixed(2) : null, below, worst };
}
module.exports = { ARROW_CLEAR };
